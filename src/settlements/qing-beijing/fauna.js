// Ming–Qing Beijing — the animals (src/engine/fauna.js draws them; docs/settlements/qing-beijing.md §18):
// carp in the moat, house swallows over the lanes and the moat (late summer: few), tree sparrows on
// the paving of the lanes and the copings of the courtyard walls, crows circling the palace's roofs
// at dusk. Pigeons (the whistled flocks of the lanes) are wanted by the engine: it has no pigeon yet
// (see the report); they stand in the sound, music.js.
import { LEVEL, MOAT, RING, AVENUE, WALL, inForecourt, NOTCH, houses, isDeep, interiorShops } from './layout.js';

const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
/** Negative inside the moat's water (its distance from either bank), positive outside. */
const moatDistance = (x, z) => {
  if (inForecourt(x, z)) return 8;
  const o = Math.min(x - a0, a1 - x, z - b0, b1 - z);
  const i = Math.max(c0 - x, x - c1, d0 - z, z - d1);
  return -Math.min(o, i);
};

const fish = [];
// dark carp (li) lazing along the four sides of the moat, in the middle of the water
// (the south side is two reaches, either side of the Meridian Gate's forecourt)
for (const [x0, z0, x1, z1] of [[a0, b0, a1, d0], [a0, d1, -NOTCH.x - 2, b1], [NOTCH.x + 2, d1, a1, b1], [a0, d0, c0, d1], [c1, d0, a1, d1]]) {
  const alongX = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < 3; i++) fish.push({
    n: 2, size: [0.6, 0.85], palette: 'carp', y: LEVEL.moat, dist: moatDistance, margin: 1.4, k: 1, rot: alongX ? 0 : Math.PI / 2,
    area: alongX ? [x0 + Math.min(30, (x1 - x0) / 3), cz - 0.5, x1 - Math.min(30, (x1 - x0) / 3), cz + 0.5] : [cx - 0.5, z0 + 30, cx + 0.5, z1 - 30], a: [20, 2.6], ratio: 0.15, minA: 1.5, speed: 0.3, rise: 0.1,
  });
}

const flights = [
  // swallows over the avenue and the ring street's south side, and along the moat
  { kind: 'swallow', n: 3, lane: { a: [-130, 212], b: [130, 212] }, y: [1.5, 9], speed: 9 },
  { kind: 'swallow', n: 3, lane: { a: [0, 215], b: [0, 370] }, y: [2, 10], speed: 9 },
  { kind: 'swallow', n: 2, lane: { a: [-127, -200], b: [-127, 190] }, y: [-0.5, 3], speed: 8 },
  // swallows hawking over the great court
  { kind: 'swallow', n: 3, lane: { a: [-88, 60], b: [88, 60] }, y: [2.5, 11], speed: 9 },
  // crows at dusk, wheeling over the Hall of Supreme Harmony and the courts
  { kind: 'crow', n: 9, loop: { c: [0, -10], a: [70, 55], rot: 0.3 }, y: [38, 16], speed: 8 },
  { kind: 'crow', n: 5, loop: { c: [-50, 90], a: [45, 30], rot: -0.4 }, y: [26, 12], speed: 8 },
];
flights[0].a = flights[1].a = flights[2].a = [30, 4];
flights[3].a = [30, 4];

const perches = [];
// tree sparrows on the paving of the lanes and the avenue
for (const [x, z] of [[-60, 202], [-20, 201], [40, 202], [100, 203], [-180, 118], [-90, 60], [90, 60], [-160, 175], [160, 175], [-8, 250], [8, 300], [-8, 340], [-214, 40], [214, -40], [-290, 90], [290, 10]])
  perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.3 + (x * 7 % 3), range: [1.4, 1.3] });
// ...and in the great court's brick, in its corners and along the galleries' feet, hopping off before the visitor
for (const [x, z] of [[-24, 56], [26, 58], [-46, 74], [50, 70], [-30, 96], [34, 94], [-84, 58], [84, 78], [-8, 132], [10, 150], [-40, 150], [44, 156]])
  perches.push({ kind: 'sparrow', x, z, y: 0.03, rot: 0.6 + (x * 5 % 3), range: [1.6, 1.4], alert: 6 });
// ...and on the red wall's yellow coping, 8.5 m up, hopping along it
for (const [x, z, rot] of [[-40, WALL.rect[3], 0], [60, WALL.rect[3], 0], [WALL.rect[0], 20, Math.PI / 2], [WALL.rect[2], -80, Math.PI / 2], [-60, WALL.rect[1], 0]])
  perches.push({ kind: 'sparrow', x, z, y: WALL.h + 0.9, rot, range: [2.6, 0], alert: 5 });
// herons standing at the moat's edge (the coping of the walls is 0.05 above the street), watching for the carp
for (const [x, z, rot] of [[a0 - 0.6, -60, 0], [a1 + 0.6, 30, 0], [-50, b0 - 0.6, 1.5], [60, b1 + 0.6, 1.5]])
  perches.push({ kind: 'heron', x, z, y: 0.05, rot, range: [1.0, 0.5], stay: [60, 150], gone: [40, 120] });
void RING; void AVENUE;

// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §41) ──
// Chosen from the layout (the tea house, the deep houses nearest the arrival) so that they follow it. No swallows' nests: by the
// season of the scene (early autumn) the house swallows are leaving and the nests stand empty; no camel or donkey: the engine has no model.
const critters = [];
// the bird keeper's cages (§25: "bird keepers favoured the plain tea houses") hung from the tea house's lintel in the end bays, off the door bay
// and off the lanterns' posts (shopfront.js: bays of (L - 1) / bays between posts at s0 + 0.5, the lintel at y 0.3 + 3.2 on the two-storey front)
{
  const t = interiorShops().find((s) => s.kind === 'teahouse');
  if (t) {
    const L = t.z1 - t.z0, bays = Math.max(2, Math.round(L / 3.2)), bw = (L - 1) / bays, cz = (t.z0 + t.z1) / 2, west = t.side === 'w';
    const out = west ? 1 : -1, door = Math.floor(bays / 2);
    for (const i of [0, bays - 1]) {
      if (i === door) continue;
      const s = -L / 2 + 0.5 + bw * (i + 0.5);
      critters.push({ model: 'cagebird', at: [t.front + out * 0.1, 0.3 + 3.2 - 0.02, west ? cz - s : cz + s], rot: west ? 0 : Math.PI });
    }
  }
}
// the deep houses (the compounds open to the visitor, nearest the avenue's mouth first): a cat asleep on the lot's north wall (grey tile coping,
// 3.1 m + 0.1), a dog in the lane at the gate's east side, hens and a cock in a one-court house's yard, west of its path
{
  const deep = houses().filter(isDeep).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2 - 215) - Math.hypot((b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2 - 215) || a.seed - b.seed);
  const hash = (x, z) => { const k = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return k - Math.floor(k); };
  deep.forEach((h, i) => {
    const [x0, z0, x1, z1] = h.rect, W = x1 - x0, cx = (x0 + x1) / 2;
    if (i === 1 || i === 4) critters.push({ model: i === 1 ? 'cat_tabby' : 'cat_orange', at: [cx + (hash(x0, z0) - 0.5) * 0.4 * W, 3.2, z0], rot: hash(z0, x0) * 6.28, range: [7, 2.5] });
    if (i === 2 || i === 6) critters.push({ model: 'dog', at: [x1 + 0.4, 0.03, z1 + 1.5], rot: Math.PI, range: [9, 3.5] });
  });
  const yard = deep.find((h, i) => i >= 3 && h.courts === 1);
  if (yard) {
    const [x0, z0, x1] = yard.rect, W = x1 - x0, hx = (x0 + x1) / 2 - 0.3 * W, hz = z0 + 11;
    for (const [model, dx, dz, size] of [['rooster', 0, 0, 1], ['hen_brown', 1.3, 0.4, 1], ['hen_brown', -0.9, 0.8, 0.96], ['hen_white', 0.4, -0.9, 1]]) critters.push({ model, at: [hx + dx, 0.05, hz + dz], rot: 0, range: [2.2, 1.2], size });
  }
}
// mandarin ducks on the moat (the south reach seen from the ring street, the west reach by the bridge of the west gate) and a kingfisher on the
// moat's inner parapet (1.05 m of grey brick under a coping, town.js) by the bridge, looking out over the water
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [-130, b1 - 13, -76, b1 - 1], dist: moatDistance, a: [14, 2], ratio: 0.3, margin: 1.2, y: LEVEL.moat, speed: 0.2, cycle: [18, 24], rot: 0 });
critters.push({ type: 'floaters', models: ['mandarin_drake', 'mandarin_hen'], area: [a0 + 1, 100, c0 - 1, 170], dist: moatDistance, a: [18, 2.5], ratio: 0.2, margin: 1.2, y: LEVEL.moat, speed: 0.2, cycle: [18, 24], rot: Math.PI / 2 });
critters.push({ model: 'kingfisher', at: [c0, 0.05 + 1.05 + 0.02, 45], rot: Math.PI, water: [c0 - 1.7, 45, LEVEL.moat], cycle: 34 });

export default { fish, flights, perches, critters };
