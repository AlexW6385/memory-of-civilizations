// Mamluk Cairo — the animals (src/engine/fauna.js draws them; docs/settlements/mamluk-cairo.md §12): kites (drawn as crows)
// wheeling high over the lanes and the Citadel's spur, pigeons (drawn as sparrows) on the roofs and the Bayn's paving
// and the khan's court, swifts over the roofs at the evening, sparrows at the shop fronts and the fountains.
import { BAYN, KHAN, SQUARE, HAMMAM, CITADEL, lanes, yards } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'crow', n: 5, loop: { c: [CITADEL.c[0], CITADEL.c[1]], a: [160, 110], rot: 0.3 }, y: [45, 120], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-150, -240], a: [110, 80], rot: 0 }, y: [30, 85], speed: 8 },
  { kind: 'swallow', n: 6, loop: { c: [-150, -230], a: [90, 60], rot: 0.5 }, y: [10, 40], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [0, 40], a: [100, 50], rot: 0 }, y: [14, 40], speed: 7 },
  { kind: 'swallow', n: 4, loop: { c: [-60, -150], a: [80, 40], rot: 0.8 }, y: [14, 40], speed: 7 },
];
const perches = [];
const spots = [[-160, -200], [-158, -250], [-152, -296], [-165, -290], [-125, -286], [-118, -280], [-132, -272], [-143, -150], [-40, -110], [-38, -30], [100, 20], [110, 60], [SQUARE[0] + 20, 40], [-38, 4], [-60, -120], [-140, -190], [-80, -192], [-66, -250]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [1.8, 1.6] });
// sparrows and pigeons along the lanes and in the yards, the dovecotes' flocks over the roofs
{ let i = 0; for (const l of lanes()) { if (l.kind !== 'lane') continue; for (let x = l.r[0] + 12; x < l.r[2] - 12; x += 55) { if (Math.hypot(x, l.r[1]) > 300 || (i++ % 2)) continue; const z = (l.r[1] + l.r[3]) / 2; perches.push({ kind: 'sparrow', x, z, y: 0, rot: (x * 5) % 3, range: [2.2, 1.4] }); } }
  for (const r of yards().filter((_, k) => k % 4 === 0)) { const x = (r[0] + r[2]) / 2, z = (r[1] + r[3]) / 2; if (Math.hypot(x, z) < 300) perches.push({ kind: 'sparrow', x, z, y: 0, rot: x % 3, range: [2, 2] }); } }
for (const c of [[-100, -60], [-220, -80], [-60, -330], [40, 200], [-250, 120]]) flights.push({ kind: 'swallow', n: 6, loop: { c, a: [35, 25], rot: c[0] * 0.01 }, y: [9, 18], speed: 6 });
void BAYN; void KHAN; void HAMMAM;
export default { fish, flights, perches };
