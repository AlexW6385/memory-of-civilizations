// Teotihuacan — the animals (src/engine/fauna.js; docs/settlements/teotihuacan.md §14): swallows over the plazas and the
// market, crows over the pyramids, sparrows on the plaza floors and the market's paving. No water: no fish, no egret.
import { AVENUE, MARKET, PLAZA, SUN, RADIUS, LEVELS, compounds, lodges } from './layout.js';
import { avenueItems } from './dress.js';
import { lodgeGeom } from './walk.js';
import { ground } from './ground.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [0, 120], a: [18, 150], rot: 0 }, y: [10, 30], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], a: [60, 80], rot: 0.2 }, y: [8, 20], speed: 9 },
  { kind: 'swallow', n: 4, loop: { c: [0, -300], a: [70, 50], rot: 0.1 }, y: [12, 40], speed: 10 },
  { kind: 'crow', n: 6, loop: { c: [SUN.c[0], SUN.c[1]], a: [160, 130], rot: 0.5 }, y: [60, 100], speed: 8 },
  { kind: 'crow', n: 4, loop: { c: [0, -330], a: [90, 70], rot: 0.9 }, y: [45, 80], speed: 8 },
];
// swallows over the grid's streets, low between the compounds' walls
for (const line of [-RADIUS + 64 * 3, -RADIUS + 64 * 9]) flights.push({ kind: 'swallow', n: 3, lane: { a: [line - 3, -150], b: [line - 3, 180] }, y: [3, 11], speed: 9, a: [20, 3] });
for (const line of [-RADIUS + 64 * 8, -RADIUS + 64 * 9]) flights.push({ kind: 'swallow', n: 3, lane: { a: [-300, line - 3], b: [-90, line - 3] }, y: [3, 11], speed: 9, a: [20, 3] });
const perches = [];
const spots = [[6, 60], [-6, 90], [4, 150], [-5, 210], [6, 290], [-4, 340], [8, -40], [-8, -120], [-20, -240], [20, -230], [-128, 200], [-100, 230], [-150, 290], [-90, 320], [-170, 210], [-110, 280]];
for (const [x, z] of spots) perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (x * 7) % 3, range: [1.8, 1.6] });
// sparrows at the street crossings, about the grid's middle
for (let i = 0; i < 14; i++) for (let j = 0; j < 14; j++) {
  const x = -RADIUS + 64 * i + 1.5, z = -RADIUS + 64 * j + 1.5;
  if (Math.hypot(x, z) > 300 || Math.abs(x) < 60 || (i * 7 + j * 3) % 4) continue;
  perches.push({ kind: 'sparrow', x, z, y: ground.height(x, z) + 0.05, rot: (i * 5 + j) % 6, range: [1.6, 1.4] });
}
void AVENUE; void PLAZA;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §21): turkeys and dogs, no hens ──
const critters = [];
const turkey = (x, y, z, i, o = {}) => critters.push({ model: 'turkey', at: [x, y, z], rot: (i * 2.1) % 6.28, range: [1.6, 1.3], tau: 12, speed: 0.4, stride: 0.26, ...o });
const dog = (x, y, z, i, o = {}) => critters.push({ model: 'dog', at: [x, y, z], rot: (i * 0.9) % 6.28, range: [3.2, 2.2], ...o });
// the main patios of the compounds the visitor can enter: two turkeys on the north side of the patio and a dog on the south-west, off the lane
// that runs from the gate along z + 2.7 (walk.js intoCompound), the altar (±1 m of the middle) and the sweeper's place (3.2 m east, 2.6 north)
compounds().filter((c) => c.open).forEach((c, i) => {
  const xm = (c.rect[0] + c.rect[2]) / 2, zm = (c.rect[1] + c.rect[3]) / 2;
  turkey(xm - 3.6, 0.06, zm - 4.4, i); turkey(xm - 1.2, 0.06, zm - 4.9, i + 3, { size: 0.94 });
  if (i !== 1) dog(xm - 5.4, 0.06, zm + 5.6, i);
});
// the forecourts of the barrio's houses: a turkey off the axis of the stair and the gate, and a dog in the lane's end of some
lodges().slice(4).forEach((l, i) => {
  const g = lodgeGeom(l), side = i % 2 ? 1 : -1, x = g.fx ? g.edge + g.fx * 2.3 : 0, z = g.fx ? g.mid + side * 4.4 : 0;
  turkey(x, 0.02, z, i + 5);
  if (i % 3 === 1) dog(g.edge + g.fx * 2.6, 0.02, g.mid - side * 4.6, i, { range: [2.4, 1.6] });
});
// the market's lanes, a hand's breadth off their sides (the people stand nearer the middle, the stalls begin 3.95 m out)
{ const [x0, z0, x1, z1] = MARKET, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2;
  [[x1 - 14, cz + 3.6], [x1 - 40, cz - 3.6], [x1 - 70, cz + 3.6], [x0 + 30, cz - 3.6], [cx - 3.6, z0 + 30], [cx + 3.6, z1 - 36]].forEach(([x, z], i) => (i % 3 === 2 ? dog(x, 0.05, z, i, { range: [2.4, 1.6] }) : turkey(x, 0.05, z, i + 9, { range: [1.0, 0.8] })));
  turkey(cx + 3.6, 0.05, z0 + 52, 21, { range: [1.0, 0.8] });
}
// the avenue's plazas: the dogs and the turkeys that dress.js leaves to the critters (each at its own place, 2.8 m or more off the middle way)
for (const o of avenueItems()) {
  if (!o.crit) continue;
  if (o.k === 'dog') dog(o.x, o.y, o.z, o.seed, { rot: o.rot });
  else for (let q = 0; q < 3; q++) turkey(o.x + (q - 1) * 0.9, o.y, o.z + (q % 2) * 0.8, o.seed + q, { rot: o.rot + q });
}
void LEVELS;
export default { fish, flights, perches, critters };
