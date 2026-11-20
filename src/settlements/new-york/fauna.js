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
// pigeons about Fifth and Madison Avenues' pavements near the Empire State, round the newsstands' corners and the apple sellers' crates, in twos and threes
for (const [ax, w] of AVENUES.slice(1, 3)) for (let z = -40 + rand() * 20; z < 260; z += 22 + rand() * 20) { const sg = rand() < 0.5 ? -1 : 1; for (let k = 0; k < 2; k++) { const x = ax + sg * (w / 2 + 1.5 + rand() * 1.2), zz = z + k * (0.8 + rand()); if (Math.hypot(x, zz) > RADIUS - 60 || inLot(x, zz, 0.5) || inSpecial(x, zz, 0.5)) continue; const [X, Z] = toCity(x, zz); perches.push({ kind: 'pigeon', x: X, z: Z, y: height(x, zz), rot: rand() * 6, range: [1.8, 1.2], alert: 3.2 }); } }
flights.push({ kind: 'pigeon', n: 6, loop: { c: toCity(0, 120), a: [60, 40], rot: 0.3 }, y: [14, 40], speed: 8 });
// ── the critters: pigeons feeding on the pavements of Fifth and Madison Avenues, a cat on the walk-up's step, a dog by the newsstand (docs §15) ──
const critters = [];
const hashAt = (x, z, k) => { const v = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return v - Math.floor(v); };
const PIGEONS = ['pigeon_grey', 'pigeon_grey', 'pigeon_dark', 'pigeon_white'];
for (const [ax, w] of AVENUES.slice(0, 3)) for (let z = 10; z < 150; z += 17 + 9 * hashAt(ax, z, 1)) {
  const sg = hashAt(ax, z, 2) < 0.5 ? -1 : 1, x = ax + sg * (w / 2 + 1.8);
  if (inLot(x, z, 0.6) || inSpecial(x, z, 0.6) || onBroadway(x, z, 1)) continue;
  const n = 2 + Math.floor(hashAt(x, z, 3) * 3);
  for (let k = 0; k < n; k++) {
    const px = x + (hashAt(x, z, 4 + k) - 0.5) * 3.2, pz = z + (hashAt(x, z, 8 + k) - 0.5) * 3.2;
    if (inLot(px, pz, 0.4) || inSpecial(px, pz, 0.4)) continue;
    const [X, Z] = toCity(px, pz);
    critters.push({ model: PIGEONS[Math.floor(hashAt(px, pz, 12) * PIGEONS.length)], at: [X, height(px, pz), Z], rot: hashAt(px, pz, 13) * 6.28, range: [2.6, 2.2], tau: 9 + 6 * hashAt(px, pz, 14), speed: 0.45 });
  }
}
{ const [X, Z] = toCity(75 + 5.5, 192); critters.push({ model: 'cat_tabby', at: [X, height(80.5, 192), Z], rot: 1.2, range: [7, 2.5] }); }
{ const [X, Z] = toCity(AVENUES[1][0] + 10.5, 40); critters.push({ model: 'dog', at: [X, height(AVENUES[1][0] + 10.5, 40), Z], rot: 2.4, range: [9, 3.5] }); }
export default { fish: [], flights, perches, critters };
