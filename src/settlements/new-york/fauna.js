// Midtown Manhattan 1931 — the animals (src/engine/fauna.js draws them; docs/settlements/new-york.md §10): house sparrows
// and pigeons (the sparrow's stand-in) on the pavements, round the newsstands and in Bryant Park under the plane trees, and
// crows over the park and the Library at dusk. Positions come from the layout.
import { BRYANT, LIBRARY, AVENUES, STREETS, height, inLot, inSpecial, onBroadway, toCity, RADIUS } from './layout.js';

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const grid = (r) => toCity(...mid(r));
const flights = [
  { kind: 'crow', n: 6, loop: { c: grid(BRYANT), a: [60, 42], rot: 0.5 }, y: [24, 12], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: grid(LIBRARY), a: [50, 30], rot: 1.0 }, y: [30, 16], speed: 9 },
];
const perches = [];
let sd = 1931; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
const put = (x, z, range = [1.6, 1.4]) => {
  if (Math.hypot(x, z) > RADIUS - 60 || inLot(x, z, 0.5) || inSpecial(x, z, 0.5) || onBroadway(x, z, 1)) return;
  const [X, Z] = toCity(x, z);
  perches.push({ kind: 'sparrow', x: X, z: Z, y: height(x, z), rot: rand() * 3, range });
};
// Bryant Park's paths and lawns: a flock scattered about the lawn's edge and the walks
for (let i = 0; i < 14; i++) put(BRYANT[0] + 6 + rand() * (BRYANT[2] - BRYANT[0] - 12), BRYANT[1] + 6 + rand() * (BRYANT[3] - BRYANT[1] - 12), [2.4, 2.0]);
// the pavements: at some of the corners and along the avenues, where the crumbs and the horses' oats (a few carts still) fall
for (const [ax, w] of AVENUES) for (const sg of [-1, 1]) for (let z = -300 + rand() * 50; z < 300; z += 45 + rand() * 55) put(ax + sg * (w / 2 + 1.6), z);
for (const [sz] of STREETS) for (let x = -300 + rand() * 60; x < 300; x += 70 + rand() * 70) put(x, sz + (rand() < 0.5 ? -1 : 1) * 7.2);
export default { fish: [], flights, perches };
