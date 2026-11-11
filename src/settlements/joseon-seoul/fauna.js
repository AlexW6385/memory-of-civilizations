// Joseon Hanyang — the animals (src/engine/fauna.js draws them; docs/settlements/joseon-seoul.md §14):
// carp in Gyeonghoeru's pond and Hyangwonji, house swallows over the pond and the avenue, tree
// sparrows on the paving and on the palace wall's coping, magpies' place taken by crows at dusk over
// the throne court (the engine has no magpie: wanted), a heron at Gyeonghoeru's shore.
import { POND, HYANG, PALACE, AVENUE, JONGNO, inPond, inHyang } from './layout.js';

const pondDistance = (x, z) => (inPond(x, z) ? -Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z) : 3);
const hyangDistance = (x, z) => (inHyang(x, z) ? -Math.min(x - HYANG[0], HYANG[2] - x, z - HYANG[1], HYANG[3] - z) : 3);
const WATER = -1.2;

const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.5, 0.75], palette: i < 3 ? 'redcarp' : 'carp', y: WATER, area: [POND[0] + 8, POND[1] + 8, POND[2] - 8, POND[3] - 8], dist: pondDistance, margin: 2.5, a: [24, 14], ratio: 0.5, speed: 0.3, rise: 0.3 });
for (let i = 0; i < 4; i++) fish.push({ n: 3, size: [0.45, 0.65], palette: i < 2 ? 'redcarp' : 'goldfish', y: WATER, area: [HYANG[0] + 6, HYANG[1] + 6, HYANG[2] - 6, HYANG[3] - 6], dist: hyangDistance, margin: 2.5, a: [12, 8], ratio: 0.5, speed: 0.3, rise: 0.3 });

const flights = [
  { kind: 'swallow', n: 4, loop: { c: [(POND[0] + POND[2]) / 2, 0], a: [40, 40], rot: 0, dist: pondDistance, margin: 2 }, y: [0.7, 2.2], speed: 8 },
  { kind: 'swallow', n: 3, lane: { a: [0, 240], b: [0, 380] }, y: [2, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [-130, 357], b: [130, 357] }, y: [2, 8], speed: 9 },
  { kind: 'crow', n: 7, loop: { c: [0, 20], a: [60, 50], rot: 0.3 }, y: [34, 14], speed: 8 },
];
flights[1].a = flights[2].a = [26, 4];

const perches = [];
for (const [x, z] of [[-60, 358], [40, 356], [100, 357], [0, 300], [6, 270], [-8, 330], [-80, 357], [120, 360]]) perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.4 + (x * 7 % 3), range: [1.4, 1.3] });
for (const [x, z, rot] of [[-80, PALACE[3], 0], [80, PALACE[3], 0], [PALACE[0], 100, Math.PI / 2], [PALACE[2], 100, Math.PI / 2]]) perches.push({ kind: 'sparrow', x, z, y: 5.5 + 0.5, rot, range: [2.6, 0], alert: 5 });
// a heron on the pond's south bank, facing the water
perches.push({ kind: 'heron', x: -125, z: POND[3] + 1.2, y: 0.05, rot: -Math.PI / 2, stay: [80, 240], gone: [40, 150], alert: 10 });
void AVENUE; void JONGNO;
export default { fish, flights, perches };
