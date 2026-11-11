// The roads between a region's settlements (src/planet/relief.js ROADS): laid as a spanning tree of each
// region, and seen on the ground halfway along them where it is land.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand } from '../src/planet/land.js';
import { initRelief, ROADS, surface, coverAt } from '../src/planet/relief.js';
import { norm, add, scale } from '../src/planet/geo.js';
import { PLANET_RADIUS as R } from '../src/planet/sites.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), sc = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale: sc, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();

test('each region with several settlements is joined by roads', () => {
  assert.ok(ROADS.length >= 15, `only ${ROADS.length} roads`);
  for (const r of ROADS) assert.equal(r.ends[0].site.region, r.ends[1].site.region);
});

test('the road shows on the ground somewhere along most links', () => {
  let shown = 0;
  for (const r of ROADS) {
    let best = 0;
    for (let k = 1; k < 20; k++) {
      const t = r.ang * k / 20, u0 = norm(add(scale(r.a, Math.cos(t)), scale(r.t, Math.sin(t))));
      for (let o = -40; o <= 40; o += 1) {
        const u = norm(add(u0, scale(r.n, o / R)));
        const g = surface(u);
        if (g.s || g.n.d < 8) continue;
        best = Math.max(best, coverAt(g, 1, u).road);
      }
    }
    if (best > 0.5) shown++;
  }
  assert.ok(shown >= ROADS.length * 0.6, `the road shows on ${shown} of ${ROADS.length} links`);
});
