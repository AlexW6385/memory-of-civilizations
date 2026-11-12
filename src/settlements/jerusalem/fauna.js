// Jerusalem about 700 — the animals (src/engine/fauna.js draws them; docs/settlements/jerusalem.md §11): rock
// doves (drawn as sparrows) on the Haram's paving and the Dome's platform, sparrows at the shop fronts of the
// Cardo, swifts and swallows over the roofs and the esplanade, crows over the Kidron slope, a few over the city.
import { HARAM, CARDO, STREET, gardens } from './layout.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, 60], a: [110, 90], rot: 0.2 }, y: [18, 45], speed: 11 },
  { kind: 'swallow', n: 5, loop: { c: [CARDO.x, 0], a: [40, 200], rot: 0 }, y: [10, 30], speed: 9 },
  { kind: 'crow', n: 6, loop: { c: [230, 20], a: [90, 140], rot: 0.4 }, y: [20, 60], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [-200, 100], a: [90, 60], rot: 0 }, y: [25, 60], speed: 8 },
];
const perches = [];
const [x0, z0, x1, z1] = HARAM.rect;
for (const [x, z] of [[-50, -60], [-30, -35], [30, -50], [50, -10], [-60, 20], [10, 40], [70, 70], [-90, 90], [90, -120], [-100, -150], [0, 100], [40, 150], [-20, -170]]) if (x > x0 && x < x1 && z > z0 && z < z1) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z), rot: (x * 7) % 3, range: [2.2, 1.8] });
for (const z of [-250, -190, -120, -60, 40, 100, 170, 240]) for (const s of [-1, 1]) perches.push({ kind: 'sparrow', x: CARDO.x + s * 4.5, z, y: ground.height(CARDO.x, z), rot: (z * 3) % 3, range: [1.6, 1.4] });
// the market street's shop fronts and the gardens' walls: sparrows and doves
for (let x = -355; x < -182; x += 17) for (const s of [-1, 1]) { if (x > -250 && x < -210) continue; perches.push({ kind: 'sparrow', x, z: s * (STREET.road - 0.4), y: ground.height(x, s * STREET.road), rot: (x * 5) % 3, range: [1.8, 1.2] }); }
for (const g of gardens().filter((q) => q.kind === 'yard' || q.kind === 'orchard').slice(0, 14)) { const cx = (g.rect[0] + g.rect[2]) / 2, cz = (g.rect[1] + g.rect[3]) / 2; perches.push({ kind: 'sparrow', x: cx, z: cz, y: ground.height(cx, cz), rot: g.seed % 3, range: [3, 3] }); }
flights.push({ kind: 'swallow', n: 5, loop: { c: [-300, 0], a: [70, 25], rot: 0 }, y: [8, 22], speed: 10 });
export default { fish, flights, perches };
