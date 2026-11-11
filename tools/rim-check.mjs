// The rim of every built settlement against the open country: reports each site with a step of 3 m or more
// (the planet test stops at the first). usage: node tools/rim-check.mjs [id …]
// The planet: the land map loads, every built settlement stands on its disc with room round it,
// its ground joins the open country without a step, and its houses build.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLand, coastAt } from '../src/planet/land.js';
import { initRelief, BUILT, surface } from '../src/planet/relief.js';
import { SITES, spacing, PLANET_RADIUS as R, BLEND } from '../src/planet/sites.js';
import { PLACED } from '../src/planet/layout.js';
import { unit, angle, toPlanet, norm } from '../src/planet/geo.js';
import { mapEarth, unmapPlanet } from '../src/planet/warp.js';
import { BUILDINGS } from '../src/buildings/index.js';
import { buildPlan, toWorld } from '../src/core/build.js';
import { withFocus } from '../src/world/regions.js';

const buf = readFileSync(new URL('../data/planet/land.bin', import.meta.url));
const W = buf.readUInt32LE(8), H = buf.readUInt32LE(12), W2 = buf.readUInt32LE(16), H2 = buf.readUInt32LE(20), scale = buf.readFloatLE(24);
const b = gunzipSync(buf.subarray(32));
setLand({ W, H, W2, H2, scale, sdf: b.subarray(0, W * H), climate: b.subarray(W * H) });
initRelief();
const bad = {};
const ONLY = process.argv.slice(2);
for (const S of BUILT) {
  if (ONLY.length && !ONLY.includes(S.id)) continue;
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2; let prev = null;
    for (let r = S.radius - 30; r < S.radius + BLEND + 20; r += 2) {
      const p = toPlanet(S.enu, [Math.cos(a) * r, 0, Math.sin(a) * r]), h = surface(norm(p)).h;
      if (prev !== null && Math.abs(h - prev) >= 3) { const m = bad[S.id] ||= { n: 0, max: 0, at: [] }; m.n++; m.max = Math.max(m.max, Math.abs(h - prev)); if (m.at.length < 3) m.at.push(`${r}m b${k}`); }
      prev = h;
    }
  }
}
for (const [id, m] of Object.entries(bad)) console.log(id, m.n, m.max.toFixed(2), m.at.join(' '));
console.log('done', Object.keys(bad).length);
