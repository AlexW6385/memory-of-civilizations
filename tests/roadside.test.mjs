// The country along the roads (src/planet/roadside-build.js): the same every visit, nothing inside a
// settlement's disc or blend, a deck over every river a road crosses (the water on the road is covered).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand } from '../src/planet/land.js';
import { initRelief, ROADS, BUILT, surface, PLANET_RADIUS as R, BLEND } from '../src/planet/relief.js';
import { riverAt } from '../src/planet/rivers.js';
import { angle, norm } from '../src/planet/geo.js';
import { chunkList, buildChunk, crossings, roadU, deckAtDir, SEG } from '../src/planet/roadside-build.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), sc = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale: sc, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();

test('a chunk is the same every time', () => {
  const c = chunkList().filter((x) => x.k === 1).slice(0, 6);
  for (const k of c) {
    const a = buildChunk(k.ri, k.k, 1), d = buildChunk(k.ri, k.k, 1);
    assert.equal(!!a, !!d);
    if (a) { assert.deepEqual(a.pos, d.pos); assert.equal(a.tris, d.tris); }
  }
});

test('nothing stands in a settlement\'s disc or its blend', () => {
  let n = 0;
  for (const c of chunkList()) {
    if (c.ri > 14) break;
    const d = buildChunk(c.ri, c.k, 1);
    if (!d) continue;
    for (let i = 0; i < d.pos.length; i += 3 * 7) {
      const u = norm([d.pos[i], d.pos[i + 1], d.pos[i + 2]]);
      for (const S of BUILT) assert.ok(angle(u, S.u) * R >= S.radius + BLEND + 20, `road ${c.ri} chunk ${c.k} inside ${S.id}`);
      n++;
    }
  }
  assert.ok(n > 1000, `only ${n} vertices checked`);
});

test('every river a road crosses has a deck over its water', () => {
  const X = crossings();
  assert.ok(X.length >= 3, `only ${X.length} crossings`);
  for (const cr of X) {
    const rd = ROADS[cr.ri];
    for (let m = cr.m0 + 4; m < cr.m1 - 4; m += 2) {
      const u = roadU(rd, m), g = surface(u);
      if (g.h < -0.3 && riverAt(u)) assert.ok(deckAtDir(cr, u) > g.h, `road ${cr.ri} m ${m} water uncovered`);
    }
  }
});

test('the added triangles stay within the budget', () => {
  const near = chunkList().filter((x) => x.ri === 8);
  let t = 0;
  for (const c of near) t += buildChunk(c.ri, c.k, 1)?.tris ?? 0;
  assert.ok(t < 60000, `${t} triangles on one road`);
  assert.ok(SEG > 0);
});
