#!/usr/bin/env node
// The planet's land map (docs/world.md, "Land"). Earth's land (Natural Earth, public domain, via
// the world-atlas package) is carried onto the planet through the layout's map
// (src/planet/warp.js) and written as data/planet/land.bin:
//
//   header (32 bytes): u32 magic 'MPLD', u32 version 1, u32 W, u32 H, u32 W2, u32 H2, f32 sdfScale, u32 0
//   gzip of: W·H bytes — distance to the coast on the planet, 128 + d / sdfScale (land positive),
//                        on an equirectangular grid of the planet's latitude and longitude;
//            W2·H2·4 bytes — climate: mountain height (0…255 → 0…200 m), moisture, warmth, 0 —
//                        coarser, from Earth's mountains, dry lands and rain forests at the true
//                        place of each cell (tools/lib/geography.mjs).
//
// Also writes shots/planet-land.png, a picture of the map for checking.
// usage: node tools/planet-land.mjs [--size 2048]

import { writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { PNG } from 'pngjs';
import { mapEarth, unmapPlanet } from '../src/planet/warp.js';
import { unit, latLon, angle, DEG } from '../src/planet/geo.js';
import { PLANET_RADIUS as R, SITES } from '../src/planet/sites.js';
import { PLACED } from '../src/planet/layout.js';
import { RANGES, PLATEAUS, DRY, WET } from './lib/geography.mjs';
import { earthRings, mapRings, signedDistance } from './lib/land.mjs';

const args = process.argv.slice(2);
const W = +(args[args.indexOf('--size') + 1] || 2048) || 2048, H = W / 2;
const W2 = W / 2, H2 = H / 2;
const SDF_SCALE = 2;                                 // metres per step: ±256 m

const d = signedDistance(mapRings(await earthRings('50m'), mapEarth, 0.2), W, R, 2);
const sdf = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) sdf[i] = Math.max(0, Math.min(255, Math.round(128 + d[i] / SDF_SCALE)));

// ── climate at the true place of each coarse cell ──
const EARTH = 6371;
const segDist = (p, a, b) => {
  // great-circle distance (km) from p to the arc a–b (unit vectors)
  const ab = angle(a, b);
  if (ab < 1e-9) return angle(p, a) * EARTH;
  const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nl = Math.hypot(...n), nn = n.map((v) => v / nl);
  const pd = p[0] * nn[0] + p[1] * nn[1] + p[2] * nn[2];
  const q = [p[0] - nn[0] * pd, p[1] - nn[1] * pd, p[2] - nn[2] * pd];
  const ql = Math.hypot(...q) || 1, qq = q.map((v) => v / ql);
  if (Math.abs(angle(a, qq) + angle(qq, b) - ab) < 1e-6) return Math.abs(Math.asin(Math.max(-1, Math.min(1, pd)))) * EARTH;
  return Math.min(angle(p, a), angle(p, b)) * EARTH;
};
const lineDist = (p, line) => { let m = Infinity; for (let i = 0; i + 1 < line.length; i++) m = Math.min(m, segDist(p, line[i], line[i + 1])); return m; };
const inPoly = (poly, la, lo) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ai, oi] = poly[i], [aj, oj] = poly[j];
    if ((ai > la) !== (aj > la) && lo < ((oj - oi) * (la - ai)) / (aj - ai) + oi) c = !c;
  }
  return c;
};
const RG = RANGES.map((r) => ({ ...r, vec: r.line.map(([la, lo]) => unit(la, lo)) }));
const areas = (list) => list.map((r) => ({ ...r, ring: [...r.area.map(([la, lo]) => unit(la, lo)), unit(...r.area[0])] }));
const PL = areas(PLATEAUS), DR = areas(DRY), WT = areas(WET);
const sm = (e0, e1, v) => { const q = Math.max(0, Math.min(1, (v - e0) / (e1 - e0))); return q * q * (3 - 2 * q); };
const areaWeight = (A, p, la, lo) => {
  const inside = inPoly(A.area, la, lo), e = lineDist(p, A.ring);
  return inside ? 0.5 + 0.5 * sm(0, A.edge, e) : 0.5 - 0.5 * sm(0, A.edge, e);
};
const climate = new Uint8Array(W2 * H2 * 4);
for (let y = 0; y < H2; y++) {
  for (let x = 0; x < W2; x++) {
    const p = unmapPlanet(unit(90 - (y + 0.5) / H2 * 180, (x + 0.5) / W2 * 360 - 180));
    const [la, lo] = latLon(p);
    let mount = 0;
    for (const r of RG) { const e = lineDist(p, r.vec); if (e < r.w * 2.5) mount = Math.max(mount, r.h * Math.exp(-((e / r.w) ** 2))); }
    for (const A of PL) mount = Math.max(mount, A.h * (areaWeight(A, p, la, lo) * 2 - 1));
    mount = Math.max(0, mount);
    const a = Math.abs(la);
    // moisture by latitude belt (wet tropics, dry subtropics, moist middle latitudes), then the
    // dry lands and the rain forests
    let moist = a < 10 ? 0.75 : a < 22 ? 0.75 - (a - 10) / 12 * 0.3 : a < 32 ? 0.45 : a < 60 ? 0.45 + Math.min(1, (a - 32) / 12) * 0.2 : 0.55;
    for (const A of DR) { const w = areaWeight(A, p, la, lo); if (w > 0.5) moist *= 1 - A.d * (w - 0.5) * 2; }
    for (const A of WT) { const w = areaWeight(A, p, la, lo); if (w > 0.5) moist += (1 - moist) * A.w * (w - 0.5) * 2; }
    const warm = Math.max(0, Math.min(1, Math.cos(a * DEG) ** 1.6 * 1.08 - 0.08 - mount / 260));
    const k = (y * W2 + x) * 4;
    climate[k] = Math.round(Math.min(255, mount / 200 * 255));
    climate[k + 1] = Math.round(Math.max(0, Math.min(1, moist)) * 255);
    climate[k + 2] = Math.round(warm * 255);
  }
}

// ── write ──
const head = Buffer.alloc(32);
head.writeUInt32LE(0x444c504d, 0); head.writeUInt32LE(1, 4);
head.writeUInt32LE(W, 8); head.writeUInt32LE(H, 12); head.writeUInt32LE(W2, 16); head.writeUInt32LE(H2, 20);
head.writeFloatLE(SDF_SCALE, 24);
const body = gzipSync(Buffer.concat([Buffer.from(sdf), Buffer.from(climate)]), { level: 9 });
await mkdir(new URL('../data/planet/', import.meta.url), { recursive: true });
await writeFile(new URL('../data/planet/land.bin', import.meta.url), Buffer.concat([head, body]));

// a picture for checking: land by climate, sea blue, settlements (red: built)
const png = new PNG({ width: W2, height: H2 });
for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
  const s = sdf[(y * 2) * W + x * 2], k = (y * W2 + x) * 4, m = climate[k] / 255, mo = climate[k + 1] / 255, wa = climate[k + 2] / 255;
  let c;
  if (s < 128) c = [30, 60 + (s / 128) * 50, 110 + (s / 128) * 60];
  else if (wa < 0.18) c = [235, 238, 242];
  else c = [150 + 80 * (1 - mo) - 60 * m, 140 + 40 * mo - 60 * m, 90 + 10 * mo + 60 * m];
  png.data.set([...c.map((v) => Math.max(0, Math.min(255, v))), 255], k);
}
for (const s of SITES) {
  const [la, lo] = PLACED[s.id];
  const cx = Math.round((lo + 180) / 360 * W2), cy = Math.round((90 - la) / 180 * H2);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) png.data.set(s.legacy ? [255, 30, 30, 255] : [255, 200, 0, 255], ((cy + j) * W2 + ((cx + i + W2) % W2)) * 4);
}
await mkdir(new URL('../shots/', import.meta.url), { recursive: true });
await writeFile(new URL('../shots/planet-land.png', import.meta.url), PNG.sync.write(png));
console.log(`land.bin: ${Math.round((32 + body.length) / 1024)} KB`);
