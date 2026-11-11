// Edo Himeji — the animals (src/engine/fauna.js; docs/settlements/edo-himeji.md §5.5): carp in the moats, house swallows over the
// moats and the avenue, tree sparrows on the paving and on the copings of the castle's walls, crows at twilight over the
// keep, a grey heron on the moat's bank and a little egret on the middle moat's edge.
import { INNER, OUTER, LEVEL, MIDDLE, RADIUS, BANK } from './layout.js';

const WATER = LEVEL.water;
// the inner moat's ring: distance to its edge (negative inside the water)
const inRing = (x, z) => x > OUTER[0] && x < OUTER[2] && z > OUTER[1] && z < OUTER[3] && !(x > INNER[0] && x < INNER[2] && z > INNER[1] && z < INNER[3]);
const ringDist = (x, z) => {
  if (!inRing(x, z) || (Math.abs(x) < 10 && z > INNER[3] - 2)) return 3;
  return Math.min(-Math.min(x - OUTER[0], OUTER[2] - x, z - OUTER[1], OUTER[3] - z), -Math.max(INNER[0] - x, x - INNER[2], INNER[1] - z, z - INNER[3]));
};
const midDist = (x, z) => (z > MIDDLE.z0 && z < MIDDLE.z1 && Math.abs(x) > MIDDLE.gap / 2 && Math.hypot(x, z) < RADIUS - 28 ? -Math.min(z - MIDDLE.z0, MIDDLE.z1 - z, Math.abs(x) - MIDDLE.gap / 2) : 3);

const fish = [];
// dark carp (koi, of the plain colour) in the long reaches: the north and west moat, the south moat, the middle moat
for (const [x0, z0, x1, z1, rot] of [[OUTER[0] + 4, OUTER[1] + 3, OUTER[2] - 4, INNER[1] - 3, 0], [OUTER[0] + 3, OUTER[1] + 30, INNER[0] - 3, OUTER[3] - 30, Math.PI / 2], [INNER[2] + 3, OUTER[1] + 30, OUTER[2] - 3, OUTER[3] - 30, Math.PI / 2]])
  for (let i = 0; i < 4; i++) fish.push({ n: 2, size: [0.55, 0.85], palette: i % 2 ? 'redcarp' : 'carp', y: WATER, dist: ringDist, margin: 1.2, k: 1, rot, area: [x0, z0, x1, z1], a: [18, 2.5], ratio: 0.14, minA: 1.5, speed: 0.3, rise: 0.1 * (i % 2) });
for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) fish.push({ n: 2, size: [0.5, 0.75], palette: 'carp', y: WATER, dist: midDist, margin: 1.2, k: 1, rot: 0, area: sx > 0 ? [MIDDLE.gap / 2 + 20, (MIDDLE.z0 + MIDDLE.z1) / 2 - 0.5, 200, (MIDDLE.z0 + MIDDLE.z1) / 2 + 0.5] : [-200, (MIDDLE.z0 + MIDDLE.z1) / 2 - 0.5, -MIDDLE.gap / 2 - 20, (MIDDLE.z0 + MIDDLE.z1) / 2 + 0.5], a: [16, 2], ratio: 0.12, minA: 1.5, speed: 0.3, rise: 0 });

const flights = [
  { kind: 'swallow', n: 4, lane: { a: [-200, -230], b: [200, -230] }, y: [0.2, 3], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-200, 305], b: [200, 305] }, y: [0.2, 3], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [0, 200], b: [0, 330] }, y: [2, 7], speed: 9 },
  { kind: 'crow', n: 8, loop: { c: [-13, -50], a: [48, 40], rot: 0.4 }, y: [60, 30], speed: 9 },
];
flights[0].a = flights[1].a = flights[2].a = [26, 4];

const perches = [];
for (const [x, z] of [[-120, 336], [-60, 337], [30, 336.5], [100, 335.5], [150, 336], [-4, 260], [4, 215], [-20, 250], [-70, 120]]) perches.push({ kind: 'sparrow', x, z, y: x === -70 ? BANK : 0.03, rot: 0.4 + (x * 7 % 3), range: [1.4, 1.3] });
// ...and on the copings of the walls on the inner rampart (2.3 m of wall and 0.45 of tile over the rampart's top)
for (const [x, z, rot] of [[-100, INNER[1] + 1, 0], [60, INNER[1] + 1, 0], [INNER[0] + 1, 0, Math.PI / 2], [INNER[2] - 1, 40, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: BANK + 1.4 + 2.3 + 0.45, rot, range: [2.6, 0], alert: 5 });
perches.push({ kind: 'heron', x: OUTER[0] + 1.5, z: -60, y: 0.3, rot: Math.PI, stay: [80, 240], gone: [40, 150], alert: 10 });
perches.push({ kind: 'egret', x: 60, z: MIDDLE.z1 + 1.2, y: 0.3, rot: -Math.PI / 2, stay: [60, 200], gone: [60, 160], alert: 10 });
export default { fish, flights, perches };
