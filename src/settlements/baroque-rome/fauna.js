// Baroque Rome — the animals (src/engine/fauna.js draws them; docs/settlements/baroque-rome.md §5): swifts and
// swallows screaming over the roofs and the colonnade, crows over the dome at twilight, pigeons (drawn as
// sparrows) on the piazza's paving and the colonnade's balustrade, carp in the Tiber's shallows kept out.
import { CROSSING, OVAL, tiberX, height, TIBER, rows, frontPt } from './layout.js';

const fish = [];
for (let i = 0; i < 4; i++) { const z = -250 + i * 150, x = tiberX(z); fish.push({ n: 2, size: [0.5, 0.8], palette: 'carp', y: TIBER.level, dist: (px, pz) => Math.abs(px - tiberX(pz)) - (TIBER.w / 2 - 4), margin: 2, k: 1, rot: 0, area: [x - 14, z - 14, x + 14, z + 14], a: [10, 10], ratio: 0.3, minA: 1.5, speed: 0.35, rise: 0.1 }); }
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [OVAL.c[0], 0], a: [80, 100], rot: 0 }, y: [14, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [175, 0], a: [60, 25], rot: 0 }, y: [10, 28], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [CROSSING[0], 0], a: [70, 60], rot: 0.3 }, y: [40, 120], speed: 10 },
  { kind: 'crow', n: 5, loop: { c: [CROSSING[0], 0], a: [55, 45], rot: 0.4 }, y: [70, 40], speed: 8 },
];
const perches = [];
const spots = [[OVAL.c[0] - 10, 8], [OVAL.c[0] + 12, -14], [OVAL.c[0] - 4, 40], [OVAL.c[0] + 3, -40], [-40, -10], [-55, 18], [OVAL.c[0] + 50, 12], [OVAL.c[0] + 62, -20], [140, -16], [150, 16], [175, -18], [200, 17], [215, -16]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// pigeons and sparrows before the Borgo's fronts, where the baker's crumbs and the osteria's scraps fall
for (const r of rows()) for (const u of r.units) if (u.kind === 'casa' && (u.trade === 'baker' || u.trade === 'osteria' || u.seed % 3 === 0)) { const [x, z] = frontPt(r, u.u0 + u.w * 0.5, -2.2).at; perches.push({ kind: u.seed % 2 ? 'sparrow' : 'sparrow', x, z, y: height(x, z), rot: (x * 5) % 3, range: [1.6, 1.4] }); }
for (let a = 0; a < 6.28; a += 0.5) { const x = OVAL.c[0] + Math.cos(a) * OVAL.ax * 0.5, z = Math.sin(a) * OVAL.bz * 0.5; perches.push({ kind: 'sparrow', x, z, y: 0, rot: a, range: [2.4, 2.0] }); }
export default { fish, flights, perches };
