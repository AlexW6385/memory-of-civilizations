// Tang Chang'an — the animals (src/engine/fauna.js draws them; dossier §13): sparrows hopping on the earth of the streets and the walls'
// coping, pigeons round the pagoda and the temple roofs, magpies in the locusts of the avenue, crows over the wards at dusk,
// swallows over the avenue and the ditches' water. All places are derived from layout.js.
import { ground } from './ground.js';
import { PAGODA, DACI, DACI_AX, WARDS, DITCH, RADIUS, inDitch } from './layout.js';

// small carp and loaches in the avenue's ditches (shallow water, 3 m wide): schools along the two ditches in several reaches
const cxd = (DITCH.in + DITCH.out) / 2, hwd = (DITCH.out - DITCH.in) / 2, fish = [];
const dd = (x, z) => (inDitch(x, z) ? hwd - Math.abs(Math.abs(x) - cxd) : -1);
for (const sd of [-1, 1]) for (let z0 = -400; z0 < 400; z0 += 80) fish.push({ n: 3, size: [0.14, 0.26], palette: 'carp', y: DITCH.water, dist: dd, margin: 0.35, k: 1, rot: Math.PI / 2, area: [sd * cxd - 0.6, z0 + 8, sd * cxd + 0.6, z0 + 72], a: [14, 0.7], ratio: 0.1, minA: 0.8, speed: 0.25, rise: 0 });
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [-30, -300], b: [-30, 300] }, y: [1.5, 7], speed: 9, a: [26, 4] },
  { kind: 'swallow', n: 4, lane: { a: [30, -300], b: [30, 300] }, y: [1.5, 7], speed: 9, a: [26, 4] },
  { kind: 'pigeon', n: 9, loop: { c: [PAGODA[0], PAGODA[1]], a: [40, 30], rot: 0.3 }, y: [18, 40], speed: 7 },
  { kind: 'pigeon', n: 6, loop: { c: [DACI_AX, DACI.rect[1] + 120], a: [50, 30], rot: 0.2 }, y: [10, 22], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [DACI_AX, 80], a: [30, 20], rot: 0 }, y: [4, 14], speed: 8 },
  { kind: 'crow', n: 7, loop: { c: [-137, -110], a: [90, 60], rot: 0.5 }, y: [30, 14], speed: 9 },
];
const perches = [];
// sparrows on the avenue's earth and the lanes' crossings, on the ward walls' coping
const spots = [[-20, 40], [24, 60], [-14, 120], [20, 160], [-26, -50], [18, -90], [-12, -160], [26, -220], [60, 0], [-60, 4], [-90, 12], [110, 10], [-137, 20], [-137, 90], [137, 215], [-137, 215], [137, -215]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: 0.05, rot: 0.3 + ((x * 7) % 3), range: [1.4, 1.3] });
for (const w of WARDS) perches.push({ kind: 'sparrow', x: w.rect[0] + 40, z: w.rect[1] + 1.3, y: 3.6 + 0.3, rot: 0, range: [2.6, 0], alert: 5 });
// magpies in the locusts along the avenue
for (const z of [-80, 30, 100, 200]) perches.push({ kind: 'magpie', x: 49.8, z, y: 0.05, rot: 1.2, range: [2.2, 1.6], alert: 7 });
void ground; void DITCH; void RADIUS;
export default { fish, flights, perches };
