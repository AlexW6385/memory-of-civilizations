// Çatalhöyük — the animals (src/engine/fauna.js draws them; docs/settlements/catalhoyuk.md §8): swallows over the roofs and the marsh,
// cranes and herons in the shallows [inferred: the Konya Plain's wetland birds], ducks on the pools, sparrow stand-ins on the roof lips,
// small fish in the pools, crows high over the plain.
import { POOLS, MARSH, CLUSTER, TOP, KIND, colX, rowZ, CW, CD, PENS, LANDINGS, LANDMARK, ENTER, TRADE } from './layout.js';
import { ground } from './ground.js';

const fish = [];
for (const [cx, cz, a, b] of POOLS.slice(0, 5)) fish.push({ n: 4, size: [0.12, 0.3], palette: 'carp', y: MARSH.water, dist: (x, z) => Math.max(0.5, (1 - Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2)) * Math.min(a, b)), margin: 0.5, k: 1, rot: 0, area: [cx - a * 0.7, cz - b * 0.7, cx + a * 0.7, cz + b * 0.7], a: [a * 0.5, b * 0.5], ratio: 0.5, minA: 2, speed: 0.4, rise: 0.1 });
const flights = [
  { kind: 'swallow', n: 6, loop: { c: [0, -4], a: [50, 38], rot: 0 }, y: [3, 14], speed: 9 },
  { kind: 'swallow', n: 4, lane: { a: [-80, 0], b: [80, 0] }, y: [0.8, 4], speed: 9 },
  { kind: 'crow', n: 4, loop: { c: [10, 20], a: [70, 40], rot: 0.5 }, y: [26, 50], speed: 8 },
];
flights[1].a = [26, 3];
const perches = [];
for (const [cx, cz, a, b] of POOLS.slice(0, 4)) perches.push({ kind: 'egret', x: cx + a * 0.8, z: cz, y: ground.height(cx + a * 0.8, cz), rot: 1.2, stay: [60, 200], gone: [60, 160], alert: 10 });
for (let i = 0; i < KIND.length; i++) for (let j = 0; j < KIND[0].length; j++) {
  if ((i * 3 + j * 5) % 3 !== 0) continue;
  if (KIND[i][j] !== 'h') continue;
  perches.push({ kind: 'sparrow', x: colX(j) + CW[j] * 0.7, z: rowZ(i) + CD[i] * 0.2, y: TOP[i][j] + 0.3, rot: 0, range: [1.2, 0], alert: 5 });
}
// herons in the shallows of the further pools, swallows hawking over the pens and the marsh, a loop of crows over the middens
for (const [cx, cz, a, b] of POOLS.slice(4, 7)) perches.push({ kind: 'heron', x: cx + a * 0.6, z: cz - b * 0.4, y: ground.height(cx + a * 0.6, cz - b * 0.4), rot: 2.2, stay: [80, 240], gone: [60, 160], alert: 12 });
for (const [cx, cz, a, b] of POOLS.slice(0, 4)) flights.push({ kind: 'swallow', n: 3, loop: { c: [cx, cz], a: [a * 0.9, b * 0.9], rot: 0.3 }, y: [0.6, 2.2], speed: 8 });
flights.push({ kind: 'crow', n: 3, loop: { c: [0, 0], a: [34, 28], rot: 1.2 }, y: [9, 18], speed: 7 });
void CLUSTER;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §14.4) ──
// Only what the plain had c. 6500 BC [inferred: §8, §14.4]: dogs, sheep and goats (the goat model stands for both: no sheep model yet), ducks and geese of the marsh, mud nests
// of swallows under the eaves. No cat, hen, horse or donkey (not yet kept); no cattle (no model yet: the cattle of the pens stay the static figures of town.js).
const critters = [];
const wake = [9, 3.5];
// dogs asleep on the roofs of four of the opened houses, in the far corner from the hatch (clear of the hatch's ramp and ladder)
{
  let n = 0;
  for (const e of ENTER) {
    if (n >= 4) break;
    const i = e.i, j = e.j, x0 = colX(j), z0 = rowZ(i), top = TOP[i][j] + 0.09, k = (i + j) % 2;
    critters.push({ model: 'dog', at: [e.mirror ? x0 + 1.0 : x0 + CW[j] - 1.0, top, z0 + 1.0 + k * 0.4], rot: 0.7 + n * 1.3, range: wake }); n++;
  }
}
// a dog in each of two courts, by the fire pit (the court's trade at its work), and one in the trodden yard south of the landmark
{
  let n = 0;
  for (let i = 0; i < KIND.length && n < 2; i++) for (let j = 0; j < KIND[0].length && n < 2; j++) if (KIND[i][j] === 'c' && (i + j) % 2 === 0) { critters.push({ model: 'dog', at: [colX(j) + 1.0 + 0.6, 0.03, rowZ(i) + CD[i] - 1.0 + 0.5], rot: 2.2 + n, range: wake }); n++; }
  void TRADE;
  critters.push({ model: 'dog', at: [(LANDMARK.rect[0] + LANDMARK.rect[2]) / 2 + 5.5, 0.02, LANDMARK.rect[3] + 4.5], rot: 1.1, range: wake });
}
// sheep and goats lying and standing in the two pens (the goat's rig lies down and stands up as the visitor comes), off the gate's lane
for (const [k, p] of PENS.entries()) {
  const [a, b, c, d] = p.rect, my = (b + d) / 2, side = p.gate === 'w' ? 1 : -1, x = (u) => (side > 0 ? a + u : c - u);
  [[4.5, -4.5, 'goat_white'], [6.5, 4.8, 'goat_black'], [9.5, -3.0, 'goat_white'], [11.5, 5.2, 'goat_white'], [8.0, 0.3, 'goat_black'], [13.5, -5.0, 'goat_white']].forEach(([u, v, model], q) => critters.push({ model, at: [x(u), 0.02, my + v], rot: (k * 2 + q) * 1.37, range: wake }));
}
// ducks on the pools nearest the town, as the fish's loops: a pair of mallards on the larger and a small raft on the other
for (const [k, [cx, cz, a, b]] of POOLS.slice(0, 4).entries()) {
  const dist = (x, z) => (Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2) - 1) * Math.min(a, b);
  critters.push({ type: 'floaters', models: k % 2 ? ['duck_brown', 'duck_brown', 'duck_brown'] : ['duck_brown', 'duck_brown'], area: [cx - a * 0.7, cz - b * 0.7, cx + a * 0.7, cz + b * 0.7], dist, margin: 0.5, a: [a * 0.55, b * 0.55], ratio: 0.5, minA: 2, y: MARSH.water, speed: 0.22, cycle: [18, 26] });
}
// grey geese on the bank by each reed landing, grazing (they walk and peck as the fowl do), clear of the landing's lane
for (const [k, L] of LANDINGS.entries()) {
  const [x, z] = L.at, dx = Math.cos(L.toward), dz = Math.sin(L.toward), P = (u, v) => [x + dx * u - dz * v, z + dz * u + dx * v];
  for (const [u, v] of [[-4.5, 6.5], [-5.6, 7.4], [-3.8, 8.4]]) { const [gx, gz] = P(u, v); critters.push({ model: 'goose_grey', at: [gx, Math.max(ground.height(gx, gz), MARSH.water + 0.1), gz], rot: k + u, range: [3.2, 1.6] }); }
}
// swallows' nests of mud under the eave of the landmark's south wall, between the beam ends, facing the visitor at the arrival: the birds sweep out and back
{
  const [lx0, , , lz1] = LANDMARK.rect;
  [1.52, 5.42].forEach((u, n) => critters.push({ model: 'swallow_nest', at: [lx0 + 0.45 + u, 2.0, lz1 + 0.14], rot: Math.PI / 2, cycle: 33 + 3 * n, flight: 9, radius: 10, side: n ? 1 : -1, rise: -0.8 }));
}
export default { fish, flights, perches, critters };
