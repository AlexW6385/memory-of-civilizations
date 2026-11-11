// Barcelona about 1910 — the animals (src/engine/fauna.js draws them; docs/settlements/barcelona.md §7): swifts and swallows over the
// streets of the Eixample (the planes' avenues and the Passeig), a few crows in the air over the Sagrada Família's works, house sparrows
// on the paving of the pavements, the court-side walls and the stone yard of the works. (Pigeons and gulls are not drawn.)
import { PITCH, SAGRADA, GRACIA_X, RADIUS } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, lane: { a: [GRACIA_X, -300], b: [GRACIA_X, 300] }, half: 30, y: [12, 28], speed: 11 },
  { kind: 'swallow', n: 4, lane: { a: [-300, PITCH / 2], b: [300, PITCH / 2] }, half: 30, y: [10, 26], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [SAGRADA[0], SAGRADA[1]], a: [60, 50], rot: 0.3 }, y: [28, 55], speed: 10 },
  { kind: 'crow', n: 4, loop: { c: [SAGRADA[0] + 10, SAGRADA[1] - 20], a: [45, 35], rot: 0.6 }, y: [45, 80], speed: 8 },
];
const perches = [];
// sparrows on the pavements: a spot in each of a few streets' kerbs (clear of the planes at 7–8.3 m), at the works' yard
for (let i = -3; i <= 3; i++) for (let k = -3; k <= 3; k++) {
  if ((i * 7 + k * 3) % 3 !== 0) continue;
  const x = i * PITCH + PITCH / 2 + 9.6, z = k * PITCH + 20;
  if (Math.hypot(x, z) > RADIUS - 70) continue;
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7 + z) % 3, range: [1.6, 1.0] });
}
for (const [dx, dz] of [[-12, 20], [-4, 33], [-20, 5]]) { const x = SAGRADA[0] + dx, z = SAGRADA[1] + dz; perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: 0.4, range: [2.0, 1.4] }); }
export default { fish, flights, perches };
