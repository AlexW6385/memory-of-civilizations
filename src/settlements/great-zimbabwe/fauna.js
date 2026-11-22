// Great Zimbabwe — the animals (src/engine/fauna.js; docs/settlements/great-zimbabwe.md §15): swallows over the valley and
// the Great Enclosure, crows (pied crows) circling the hill's boulders, sparrows (the weavers and sparrows of the plateau)
// on the daga floors of the compounds and the tops of the walls. No water: no fish, no egret.
import { ENCLOSURE, HILL, VALLEY, KRAAL_AT, compounds, height, yardFree } from './layout.js';
import { ARRIVAL } from './walk.js';

const fish = [];
const flights = [
  { kind: 'swallow', n: 5, loop: { c: [ENCLOSURE.c[0], ENCLOSURE.c[1]], a: [90, 60], rot: 0 }, y: [6, 22], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [-40, 0], a: [150, 90], rot: 0.4 }, y: [8, 26], speed: 10 },
  { kind: 'swallow', n: 4, loop: { c: [ENCLOSURE.c[0] + 6, ENCLOSURE.c[1] - 50], a: [40, 24], rot: 0.2 }, y: [3, 10], speed: 9 },
  { kind: 'crow', n: 3, loop: { c: [ENCLOSURE.c[0], ENCLOSURE.c[1]], a: [30, 22], rot: 0.5 }, y: [14, 30], speed: 7 },
  { kind: 'crow', n: 6, loop: { c: [HILL.c[0], HILL.c[1]], a: [90, 50], rot: 0.1 }, y: [50, 80], speed: 8 },
  // raptors (kites and eagles) wheeling high over the valley and the hill on the day's warm air
  { kind: 'kite', n: 2, loop: { c: [20, 20], a: [160, 110], rot: 0.3 }, y: [60, 95], speed: 7 },
  { kind: 'eagle', n: 1, loop: { c: [HILL.c[0] + 30, HILL.c[1] + 40], a: [70, 45], rot: 1.1 }, y: [45, 70], speed: 6 },
];
const perches = [];
for (const k of compounds().filter((_, i) => i % 2 === 0)) perches.push({ kind: 'sparrow', x: k.c[0], z: k.c[1], y: height(k.c[0], k.c[1]) + 0.3, rot: k.seed % 3, range: [2.2, 2.0] });
// cattle egrets in the grass among the herds beside the path to the entrance (they follow the cattle; they stand and pick at the ground)
for (const [x, z] of [[53, 73.5], [57.5, 77.5], [30, 74], [26.5, 77], [62, 74]]) perches.push({ kind: 'egret', x, z, y: height(x, z), rot: x * 0.7, range: [1.2, 0.8], alert: 7 });
// on the Great Enclosure's outer wall top (10 m, a little less where the top undulates)
for (const [x, z] of [[ENCLOSURE.c[0] - 30, ENCLOSURE.c[1] + 33], [ENCLOSURE.c[0] + 40, ENCLOSURE.c[1] + 24]]) perches.push({ kind: 'sparrow', x, z, y: 9.6, rot: 0, range: [2.5, 0], alert: 6 });
// on the tops of the Valley courts' walls (3.5 m, the top a little uneven), at a point of each wall's arc
for (const V of VALLEY) { const a = (V.a0 + V.a1) / 2; perches.push({ kind: 'sparrow', x: V.c[0] + Math.cos(a) * V.r[0], z: V.c[1] + Math.sin(a) * V.r[1], y: height(V.c[0] + Math.cos(a) * V.r[0], V.c[1] + Math.sin(a) * V.r[1]) + 3.3, rot: 0, range: [2, 0], alert: 6 }); }

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; docs/settlements/great-zimbabwe.md §19.4) ──
// Fowls scratch in the yards, goats are tied or loose by the houses, a dog sleeps by the forecourt's fire, goats stand in the kraals [all later Shona practice, placing inferred].
// Each stands at a place the walker's lanes (the spokes to the doors and to the gate) leave free (`yardFree`); the same fowls and goats that the life figures of life.js make as
// instanced shapes stand elsewhere in the same yards (other angles), so a yard is not doubled.
const critters = [];
/** A yard place (yardFree) with `m` metres to every house of the compound and to the compound's other houses: the distance from the middle is drawn in until it is. */
const roomy = (k, ang, d, m) => { let p = yardFree(k, ang, d); for (let t = 0; t < 4 && k.huts.some((h) => Math.hypot(h.c[0] - p[0], h.c[1] - p[1]) < h.r + m); t++) { d -= 0.3; p = yardFree(k, ang, d); } return k.huts.some((h) => Math.hypot(h.c[0] - p[0], h.c[1] - p[1]) < h.r + m) ? null : p; };
const hashAt = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
{
  const dist = (k) => Math.hypot(k.c[0] - ARRIVAL[0], k.c[1] - ARRIVAL[1]);
  [...compounds()].sort((p, q) => dist(p) - dist(q)).slice(0, 16).forEach((k, i) => {
    const a = k.a ?? ((k.seed ?? 3) % 628) / 100;
    if (i % 2 === 1 || i < 4) {
      const P = roomy(k, a + 2.1, 3.1, 1.6), [cx, cz] = P ?? [0, 0];
      if (P) [['rooster', 0, 0], ['hen_brown', 0.4, 0.35], ['hen_white', -0.35, 0.45], ['hen_brown', 0.15, -0.45]].forEach(([model, dx, dz], j) => {
        const x = cx + dx, z = cz + dz;
        critters.push({ model, at: [x, k.y + 0.02, z], rot: hashAt(x, z) * 6.28, range: [1.2, 0.9], size: 0.96 + 0.04 * (j % 2) });
      });
    }
    if (i % 3 === 2) {
      const P = roomy(k, a - 2.6, 3.4, 1.2);
      if (P) critters.push({ model: i % 2 ? 'goat_black' : 'goat_white', at: [P[0], k.y + 0.02, P[1]], rot: hashAt(P[1], P[0]) * 6.28, range: [7, 2.5] });
    }
  });
}
// the forecourt: a dog asleep beside the watch-fire at its east side, off the entrance's lane
for (const [x, z] of [[53.4, 91.2]]) critters.push({ model: 'dog', at: [x, height(x, z) + 0.04, z], rot: 2.2, range: [9, 3.5] });
// the kraals: two goats (one black, one white) with the cattle's calves, inside the thorn fence
KRAAL_AT.forEach(([cx, cz, r], i) => {
  for (const [model, u, v] of [['goat_black', 0.35, 0.2], ['goat_white', -0.3, 0.38]]) { const x = cx + u * r, z = cz + v * r; critters.push({ model, at: [x, height(x, z) + 0.02, z], rot: hashAt(x, z) * 6.28, range: [7, 2.5] }); }
  void i;
});
// the herds, flocks and yard groups of the plans as moving farm animals (src/settlements/herds.js; the still ones are dropped from the plans there)
import { herdCritters } from '../herds.js';
critters.push(...herdCritters('great-zimbabwe'));
export default { fish, flights, perches, critters };
