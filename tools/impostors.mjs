#!/usr/bin/env node
// Far views of the settlements (DESIGN §8: impostors): each built settlement's buildings and houses,
// built here, simplified by clustering vertices on a grid (CELL metres) and coloured by their
// materials' average colours, written to data/impostors/<id>.bin. The viewer shows them for
// settlements that are seen from afar but not built in full.
//
// File: u32 magic 'MPIM', u32 version 1, u32 vertices, u32 indices, f32 minX, minY, minZ, f32 scale,
// then positions (u16 × 3, quantised in the settlement's coordinates), colours (u8 × 3, sRGB) and
// indices (u32), the whole gzipped.
// usage: node tools/impostors.mjs [id …]

import { writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan } from '../src/core/build.js';
import { MATERIALS } from '../src/core/palette.js';
import { SITES } from '../src/planet/sites.js';
import { withFocus } from '../src/world/regions.js';
import { MODULES } from '../src/settlements/grounds.js';

let CELL = 1.0;                 // the vertex grid (m): 1 m for the ten, coarser for the large towns of their own
const only = process.argv.slice(2);
await import('../src/styles/vernacular/index.js');
const city = await import('../src/world/city.js');

const hex = (k) => { const m = MATERIALS[k] || MATERIALS.sandstone, h = parseInt(m.color.slice(1), 16); return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; };

await mkdir(new URL('../data/impostors/', import.meta.url), { recursive: true });
for (const s of SITES) {
  if ((!s.legacy && !MODULES[s.id]) || (only.length && !only.includes(s.id))) continue;
  const plans = [];
  let focus = null;
  CELL = s.legacy ? 1.0 : 2.4;
  if (s.legacy) {
    focus = { region: s.legacy.region, center: s.legacy.center, radius: s.radius };
    for (const id of s.legacy.buildings) plans.push((await BUILDINGS.find((b) => b.id === id).load()).plan);
    plans.push(withFocus(focus, () => city.plan(focus.region)));
  } else {
    // a settlement of its own (src/settlements/<id>/): its landmarks and its town
    const mod = await MODULES[s.id]();
    plans.push(...mod.landmarks.map((l) => l.plan), ...(await mod.town()).filter((p) => p.style !== 'life' && !p.far));
  }
  // gather triangles: [x, y, z] ×3 and a colour
  const cells = new Map(), verts = [], cols = [], idx = [];
  let tris = 0;
  for (const plan of plans) {
    const built = focus ? withFocus(focus, () => buildPlan(plan)) : buildPlan(plan);
    for (const { mat, geometry } of built.parts) {
      if (mat === 'glass_outer' || mat === 'water') continue;
      const c = hex(mat), g = geometry.index ? geometry.toNonIndexed() : geometry, p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 9) {
        tris++;
        const id = [0, 1, 2].map((k) => {
          const x = p[i + k * 3], y = p[i + k * 3 + 1], z = p[i + k * 3 + 2];
          const key = `${Math.round(x / CELL)},${Math.round(y / CELL)},${Math.round(z / CELL)}`;
          let v = cells.get(key);
          if (!v) { v = { n: verts.length / 3, sx: 0, sy: 0, sz: 0, c: 0, col: [0, 0, 0] }; cells.set(key, v); verts.push(0, 0, 0); cols.push(0, 0, 0); }
          v.sx += x; v.sy += y; v.sz += z; v.c++; v.col[0] += c[0]; v.col[1] += c[1]; v.col[2] += c[2];
          return v.n;
        });
        if (id[0] === id[1] || id[1] === id[2] || id[0] === id[2]) continue;
        idx.push(id[0], id[1], id[2]);
      }
    }
  }
  for (const v of cells.values()) {
    verts[v.n * 3] = v.sx / v.c; verts[v.n * 3 + 1] = v.sy / v.c; verts[v.n * 3 + 2] = v.sz / v.c;
    cols[v.n * 3] = v.col[0] / v.c; cols[v.n * 3 + 1] = v.col[1] / v.c; cols[v.n * 3 + 2] = v.col[2] / v.c;
  }
  // drop duplicate triangles (both orders of the same three vertices are kept: two-sided walls)
  const seen = new Set(), I = [];
  for (let i = 0; i < idx.length; i += 3) { const k = `${idx[i]},${idx[i + 1]},${idx[i + 2]}`; if (!seen.has(k)) { seen.add(k); I.push(idx[i], idx[i + 1], idx[i + 2]); } }
  const n = verts.length / 3;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], verts[i * 3 + k]); max[k] = Math.max(max[k], verts[i * 3 + k]); }
  const scale = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 65535;
  const P = new Uint16Array(n * 3), C = new Uint8Array(n * 3);
  for (let i = 0; i < n * 3; i++) { P[i] = Math.round((verts[i] - min[i % 3]) / scale); C[i] = Math.round(cols[i]); }
  const head = Buffer.alloc(32);
  head.writeUInt32LE(0x4d494d50, 0); head.writeUInt32LE(1, 4); head.writeUInt32LE(n, 8); head.writeUInt32LE(I.length, 12);
  head.writeFloatLE(min[0], 16); head.writeFloatLE(min[1], 20); head.writeFloatLE(min[2], 24); head.writeFloatLE(scale, 28);
  const body = gzipSync(Buffer.concat([Buffer.from(P.buffer), Buffer.from(C.buffer), Buffer.alloc((4 - ((P.byteLength + C.byteLength) % 4)) % 4), Buffer.from(new Uint32Array(I).buffer)]), { level: 9 });
  await writeFile(new URL(`../data/impostors/${s.id}.bin`, import.meta.url), Buffer.concat([head, body]));
  console.log(`${s.id}: ${tris} → ${I.length / 3} triangles, ${Math.round((32 + body.length) / 1024)} KB`);
}
