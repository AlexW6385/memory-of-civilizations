// Southern Song Lin'an — the animals (src/engine/fauna.js draws them; docs/settlements/song-hangzhou.md §13):
// the carp of West Lake (five-coloured giant carp as in the release ponds, goldfish as in Gaozong's pond at
// the Deshenggong and the eunuch Lu's garden) in loose schools along the shore, dark carp in the canals,
// house swallows over lake and canals, tree sparrows on the paving, little egrets and a grey heron on
// the lake's bank and the canals' edges, crows over the town at twilight. Positions follow the layout
// (ways.js), not fixed coordinates.
import { canals, lake, inLake, lakeDist, canalDist, streets, rectDist, LEVEL, RADIUS } from './ways.js';
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const rand = rng(1276);
const L = lake();

const fish = [], perches = [], flights = [];
const shorePts = [];       // places on the lake's edge: { x, z, nx, nz (toward the water) }

if (L) {
  const [x0, z0, x1, z1] = L.rect;
  // sample the shore: points just inside the water, 4–25 m from the bank, over the whole lake
  for (let x = x0; x <= x1; x += 9) for (let z = z0; z <= z1; z += 9) {
    const d = lakeDist(x, z);
    if (d < -4 && d > -26) shorePts.push({ x, z, d });
  }
  const pick = shorePts.filter(() => rand() < Math.min(1, 46 / Math.max(1, shorePts.length)));
  pick.forEach((p, i) => {
    const big = i % 3 === 0, rc = i % 3 === 1;
    fish.push({
      n: big ? 2 : 4, size: big ? [0.5, 0.75] : [0.25, 0.4], palette: big ? 'redcarp' : rc ? 'goldfish' : 'carp', y: L.y, area: [p.x - 6, p.z - 6, p.x + 6, p.z + 6], dist: lakeDist,
      margin: 2, a: big ? [14, 7] : [10, 5], ratio: 0.5, speed: big ? 0.38 : 0.32, rise: big ? 0.5 : 0.35, tries: 3,
    });
  });
  // the shore's birds
  const bank = [];
  for (let x = x0 - 30; x <= x1 + 30; x += 6) for (let z = z0 - 30; z <= z1 + 30; z += 6) {
    const d = lakeDist(x, z);
    if (d > 0.6 && d < 2.2) { const h = ground.height(x, z); if (Number.isFinite(h) && Math.abs(h - L.y) < 1.2 && Math.hypot(x, z) < RADIUS - 25) bank.push({ x, z, h }); }
  }
  const take = (n) => { const out = []; for (let i = 0; i < n && bank.length; i++) out.push(bank.splice(Math.floor(rand() * bank.length), 1)[0]); return out; };
  const face = (p) => { const e = 1.2; const gx = lakeDist(p.x + e, p.z) - lakeDist(p.x - e, p.z), gz = lakeDist(p.x, p.z + e) - lakeDist(p.x, p.z - e); return Math.atan2(-gz, -gx); };
  for (const p of take(9)) perches.push({ kind: 'egret', x: p.x, z: p.z, y: p.h, rot: face(p), stay: [80, 260], gone: [40, 160], alert: 10 });
  for (const p of take(3)) perches.push({ kind: 'heron', x: p.x, z: p.z, y: p.h, rot: face(p), stay: [80, 240], gone: [60, 180], alert: 12 });
  // swallows skimming the lake: loops over its shallows near the shore, and over the middle
  const mid = [(x0 + x1) / 2, (z0 + z1) / 2];
  for (const p of pick.filter((_, i) => i % 6 === 0).slice(0, 5)) flights.push({ kind: 'swallow', n: 4, loop: { c: [p.x, p.z], a: [30, 14], rot: rand() * 3, dist: lakeDist, margin: 3 }, y: [0.3, 2.4], speed: 8 });
  flights.push({ kind: 'swallow', n: 4, loop: { c: mid, a: [45, 25], rot: 0.4, dist: lakeDist, margin: 3 }, y: [0.4, 3], speed: 8 });
}

// the canals: dark carp along their length, swallows along their lane, an egret on a stone edge
for (const r of canals()) {
  const alongX = r[2] - r[0] > r[3] - r[1], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, len = alongX ? r[2] - r[0] : r[3] - r[1];
  if (len < 50) continue;
  for (let i = 0; i < Math.min(4, Math.floor(len / 60)); i++) fish.push({
    n: 2, size: [0.5, 0.8], palette: 'carp', y: LEVEL.canal, dist: (x, z) => rectDist(r, x, z), margin: 1.2, k: 1, rot: alongX ? 0 : Math.PI / 2,
    area: alongX ? [r[0] + 15, cz - 0.5, r[2] - 15, cz + 0.5] : [cx - 0.5, r[1] + 15, cx + 0.5, r[3] - 15], a: [14, 2.2], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0,
  });
  flights.push({ kind: 'swallow', n: 3, lane: alongX ? { a: [r[0], cz], b: [r[2], cz] } : { a: [cx, r[1]], b: [cx, r[3]] }, a: [26, 3], y: [-0.1, 2.6], speed: 9 });
  // an egret on the edge of the canal's street side
  const e = alongX ? { x: cx + (rand() - 0.5) * len * 0.5, z: r[3] + 0.4 } : { x: r[2] + 0.4, z: cz + (rand() - 0.5) * len * 0.5 };
  const h = ground.height(e.x, e.z);
  if (Number.isFinite(h) && Math.hypot(e.x, e.z) < RADIUS - 30) perches.push({ kind: 'egret', ...e, y: h, rot: alongX ? -Math.PI / 2 : Math.PI, stay: [60, 200], gone: [60, 160], alert: 10 });
}

// tree sparrows on the paving of the streets, hopping about a spot
for (const r of streets()) {
  const alongX = r[2] - r[0] > r[3] - r[1], len = alongX ? r[2] - r[0] : r[3] - r[1];
  if (Math.min(r[2] - r[0], r[3] - r[1]) < 3) continue;
  for (let t = 15 + rand() * 40; t < len - 10 && perches.filter((p) => p.kind === 'sparrow').length < 60; t += 55 + rand() * 40) {
    const x = alongX ? r[0] + t : (r[0] + r[2]) / 2 + (rand() - 0.5) * 2, z = alongX ? (r[1] + r[3]) / 2 + (rand() - 0.5) * 2 : r[1] + t;
    if (Math.hypot(x, z) > RADIUS - 25) continue;
    const y = ground.height(x, z);
    if (Number.isFinite(y)) perches.push({ kind: 'sparrow', x, z, y, rot: rand() * 3, range: [1.4, 1.3] });
  }
}
// crows at twilight over the town
flights.push({ kind: 'crow', n: 7, loop: { c: [60, -60], a: [60, 40], rot: 0.5 }, y: [32, 14], speed: 9 });

export default { fish, flights, perches };
