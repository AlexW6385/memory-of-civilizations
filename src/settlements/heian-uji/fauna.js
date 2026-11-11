// Heian Uji — the animals (src/engine/fauna.js; docs/settlements/heian-uji.md §13): carp and a few red carp in the Aji pond,
// dark carp in the Uji River, swallows over the pond and the river, crows over the village at dusk, sparrows on the
// gravel of the courts and the lanes, a grey heron on the pond's shore and a little egret on the river's bank.
import { POND, POND_LEVEL, RIVER, GARDEN, VILLA, height, pondDistance, inRiver } from './layout.js';

const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
const fish = [];
for (let i = 0; i < 5; i++) fish.push({ n: 5, size: [0.3, 0.45], palette: 'carp', y: POND_LEVEL, area: [GARDEN[0] + 10, GARDEN[1] + 12, GARDEN[2] - 10, GARDEN[3] - 12], dist: pondDistance, margin: 1.7, a: [14, 8], ratio: 0.55, speed: 0.32, rise: 0.4, tries: 1 });
for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.7], palette: 'redcarp', y: POND_LEVEL, area: [GARDEN[0] + 10, GARDEN[1] + 12, GARDEN[2] - 10, GARDEN[3] - 12], dist: pondDistance, margin: 1.9, a: [18, 8], ratio: 0.45, speed: 0.38, rise: 0.5 });
for (let i = 0; i < 4; i++) { const z = -120 + i * 70; fish.push({ n: 3, size: [0.4, 0.7], palette: 'carp', y: RIVER.level, area: [riverX(z) - 8, z - 20, riverX(z) + 8, z + 20], dist: (x, zz) => (inRiver(x, zz) ? -3 : 3), margin: 1.2, a: [10, 18], ratio: 0.3, speed: 0.35, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 4, loop: { c: [6, -5], a: [28, 50], rot: 0, dist: pondDistance, margin: 1.5 }, y: [0.7, 1.8], speed: 7 },
  { kind: 'swallow', n: 4, lane: { a: [riverX(-150), -170], b: [riverX(150), 170] }, y: [0.5, 4], speed: 9, half: 20 },
  { kind: 'crow', n: 6, loop: { c: [-120, 40], a: [40, 30], rot: 0.4 }, y: [30, 12], speed: 9 },
];
const perches = [];
for (const [x, z] of [[-175, 38], [-150, 30], [-158, -8], [-40, 74], [50, -20], [-60, 90], [-110, 60], [-90, 140]]) perches.push({ kind: 'sparrow', x, z, y: height(x, z) + (z === -8 ? 1.0 : 0), rot: x * 0.07, range: [1.4, 1.3] });
void VILLA;
// the heron at the pond's north shore, the egret on its south arm's shore: a dry spot at the water's edge, clear of the island bridges, facing the water
function shore(hint) {
  let best = null, bd = 1e9;
  for (let x = GARDEN[0]; x < GARDEN[2]; x += 0.5) for (let z = GARDEN[1] - 6; z < GARDEN[3] + 6; z += 0.5) {
    const d = pondDistance(x, z), h = height(x, z);
    if (d < 0.6 || d > 1.6 || h < POND_LEVEL + 0.02 || Math.abs(x + 55) < 4) continue;
    const e = Math.hypot(x - hint[0], z - hint[1]);
    if (e < bd) { bd = e; best = [x, z, h]; }
  }
  if (!best) return null;
  const [x, z, h] = best, gx = pondDistance(x + 0.3, z) - pondDistance(x - 0.3, z), gz = pondDistance(x, z + 0.3) - pondDistance(x, z - 0.3);
  return { x, z, y: h, rot: Math.atan2(-gz, -gx) };
}
for (const [hint, kind] of [[[-75, -62], 'heron'], [[-30, 64], 'egret']]) { const q = shore(hint); if (q) perches.push({ kind, ...q, stay: [80, 240], gone: [40, 150], alert: 10 }); }
void POND;
export default { fish, flights, perches };
