// The baked light (data/gi/, tools/bake.mjs): every bake is listed in data/gi/index.json with the
// geometry hash it was traced from, reads back as the viewer reads it (src/engine/gi.js), lies over
// its landmark (not where an older layout had it) and stays small enough to ship. Whether a bake
// is stale — its landmark changed since — is reported as a TODO here (set GI_STALE=0 to skip that
// part, which builds each baked landmark); `node tools/bake.mjs --status` lists every landmark and
// `node tools/bake.mjs --stale` re-bakes the stale ones.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GIVolume } from '../src/engine/gi.js';
import { toWorld } from '../src/core/build.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = ROOT + 'data/gi/';
const index = existsSync(DIR + 'index.json') ? JSON.parse(readFileSync(DIR + 'index.json', 'utf8')) : {};
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.gi')).map((f) => f.slice(0, -3)) : [];

// GIVolume.fetch with the files on disk
globalThis.fetch = async (url) => {
  const path = ROOT + String(url).replace(/^\.?\//, '');
  if (!existsSync(path)) return { ok: false };
  const b = readFileSync(path);
  return { ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length), json: async () => JSON.parse(b.toString()) };
};

test('every bake is listed in the index, and every listed bake exists', () => {
  assert.deepEqual(files.slice().sort(), Object.keys(index).sort());
  for (const [id, e] of Object.entries(index)) {
    assert.match(e.hash, /^[0-9a-f]{16}$/, `${id}: geometry hash`);
    assert.ok(e.site && e.boxes?.length, `${id}: settlement and boxes`);
  }
});

test('bakes read back as the viewer reads them, sized as listed', async () => {
  const gi = new GIVolume();
  let total = 0;
  for (const id of files) {
    const set = await gi.fetch(id, `data/gi/${id}.gi`);
    const e = index[id];
    assert.equal(set.parts.length, e.boxes.length, `${id}: volumes`);
    set.parts.forEach((v, i) => {
      assert.deepEqual([v.nx, v.ny, v.nz], e.boxes[i].n, `${id}: volume ${i} size`);
      assert.ok(Math.abs(v.spacing - e.boxes[i].spacing) < 1e-4, `${id}: spacing`);
      // the DC term: finite, and not black throughout
      let lit = 0;
      for (let k = 0; k < v.c0.length; k += 4) { const h = v.c0[k]; assert.ok((h & 0x7c00) !== 0x7c00, `${id}: finite`); if (h & 0x7fff) lit++; }
      assert.ok(lit > v.nx * v.ny * v.nz * 0.5, `${id}: volume ${i} mostly lit`);
    });
    // the viewer inside a box gets that box's volume; far outside, none
    const v0 = set.parts[set.parts.length - 1];
    const c = { x: v0.min[0] + v0.nx * v0.spacing / 2, y: v0.min[1] + v0.ny * v0.spacing / 2, z: v0.min[2] + v0.nz * v0.spacing / 2 };
    gi.use(set, c);
    assert.equal(gi.current, v0, `${id}: volume at its own centre`);
    gi.use(set, { x: c.x + 1e5, y: c.y, z: c.z });
    assert.equal(gi.current, null, `${id}: none far away`);
    const bytes = readFileSync(DIR + id + '.gi').length;
    assert.ok(bytes < 3e6, `${id}: ${(bytes / 1e6).toFixed(1)} MB (≤ 3 MB a landmark)`);
    total += bytes;
  }
  assert.ok(total < 40e6, `all bakes ${(total / 1e6).toFixed(1)} MB (≤ 40 MB)`);
});

test('bakes lie over their landmarks', async () => {
  const { MODULES } = await import('../src/settlements/grounds.js');
  for (const [id, e] of Object.entries(index)) {
    assert.ok(MODULES[e.site], `${id}: settlement ${e.site}`);
    const mod = await MODULES[e.site]();
    const L = mod.landmarks.find((l) => l.plan.id === id);
    assert.ok(L, `${id}: a landmark of ${e.site}`);
    const p = L.plan, a = toWorld(p, p.bounds[0], p.bounds[1]), b = toWorld(p, p.bounds[2], p.bounds[3]);
    const [x0, z0, x1, z1] = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
    for (const B of e.boxes) {
      const cx = B.min[0] + (B.n[0] - 1) * B.spacing / 2, cz = B.min[2] + (B.n[2] - 1) * B.spacing / 2;
      assert.ok(cx > x0 && cx < x1 && cz > z0 && cz < z1, `${id}: box centre ${cx.toFixed(0)},${cz.toFixed(0)} within the plan's bounds`);
    }
  }
});

test('bakes are current (a TODO when the landmark changed since)', { skip: process.env.GI_STALE === '0' }, async (t) => {
  const { status } = await import('../tools/lib/gi-scene.mjs');
  const ids = Object.keys(index);
  if (!ids.length) return;
  const st = await status({ ids, onlyBaked: true });
  const stale = st.filter((s) => s.state === 'stale').map((s) => s.id);
  if (stale.length) t.todo(`stale bakes (node tools/bake.mjs --stale): ${stale.join(', ')}`);
});
