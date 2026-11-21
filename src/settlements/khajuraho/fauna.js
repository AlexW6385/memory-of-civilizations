// Khajuraho about 1050 — the animals (src/engine/fauna.js draws them; docs/settlements/khajuraho.md §12): carp in
// the Shivsagar tank, swallows over its water, crows about the village, sparrows on the temple terraces,
// an egret and a heron at the tank's margin.
import { TANK, TEMPLES, tankD, height, lots, yards } from './layout.js';
import { porchOf } from './life.js';
import { frame } from './doors.js';
import { openPlaces } from './walk.js';

const area = [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]];
const fish = [];
for (let i = 0; i < 6; i++) fish.push({ n: 3, size: [0.5, 0.75], palette: 'carp', y: TANK.level, area, dist: tankD, margin: 2.5, a: [26, 12], ratio: 0.5, speed: 0.3, rise: 0.15 });

const flights = [
  { kind: 'swallow', n: 5, loop: { c: [TANK.c[0], TANK.c[1]], a: [48, 22], rot: 0, dist: tankD, margin: 3 }, y: [0.4, 2.2], speed: 8 },
  { kind: 'swallow', n: 3, loop: { c: [TANK.c[0] + 10, TANK.c[1] - 4], a: [30, 14], rot: 0.4, dist: tankD, margin: 3 }, y: [0.5, 3], speed: 7 },
  { kind: 'crow', n: 6, loop: { c: [150, 10], a: [70, 50], rot: 0.3 }, y: [28, 10], speed: 9 },
];
const perches = [];
for (const t of TEMPLES) {
  const T = t.terrace || [t.c[0] - t.w * 0.85, t.c[1] - t.w * 0.95, t.c[0] + t.len + 4, t.c[1] + t.w * 0.95];
  perches.push({ kind: 'sparrow', x: (T[0] + T[2]) / 2 - 2, z: T[3] - 1.2, y: t.jagati + (t.y ?? 0), rot: 0, range: [2.4, 0], alert: 5 });
}
// the rock pigeons of the temples: on the first ledge of the porch roofs (Kandariya, Jagadambi, Chitragupta) and in the air about the tower;
// black kites turning high over the village
for (const t of TEMPLES.slice(0, 3)) {
  const { r, ceil, cz } = porchOf(t);
  for (const sz of [-1, 1]) perches.push({ kind: 'pigeon', x: (r[0] + r[2]) / 2 + sz * 0.8, z: cz + sz * ((r[3] - r[1]) / 2 + 0.3), y: ceil + 0.45 + (t.y ?? 0), rot: sz > 0 ? 1.6 : 4.7, range: [3, 0], alert: 6 });
}
flights.push({ kind: 'pigeon', n: 5, loop: { c: [TEMPLES[0].c[0] + 6, TEMPLES[0].c[1]], a: [30, 22], rot: 0.2 }, y: [18, 10], speed: 8 });
flights.push({ kind: 'kite', n: 2, loop: { c: [120, 20], a: [110, 70], rot: 0.5 }, y: [60, 20], speed: 7 });
// sparrows and crows on the ridges and parapets along the bazaar road, a share of the houses
{
  let n = 0;
  for (const l of lots()) {
    if (!l.main || n > 26 || (l.seed % 3)) continue;
    const [x0, z0, x1, z1] = l.rect, flat = l.kind === 'mud' || l.kind === 'haveli';
    perches.push({ kind: n % 4 === 3 ? 'crow' : 'sparrow', x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: flat ? (l.kind === 'haveli' ? 6.9 : 3.95) : 4.7, rot: l.seed % 6, range: [2.4, 0], alert: 6 });
    n++;
  }
}
for (const [kind, a] of [['egret', -0.6], ['heron', 2.2]]) {
  let best = null;
  for (let d = 1; d < 4 && !best; d += 0.5) { const x = TANK.c[0] + Math.cos(a) * (TANK.r[0] + d), z = TANK.c[1] + Math.sin(a) * (TANK.r[1] + d); if (Math.abs(tankD(x, z) - 0.5) < 3.5) best = [x, z]; }
  if (best) { const [x, z] = best; perches.push({ kind, x, z, y: height(x, z), rot: Math.atan2(TANK.c[1] - z, TANK.c[0] - x), stay: [80, 240], gone: [40, 150], alert: 10 }); }
}
// ── the critters: the animals with a rig of their own (src/engine/fauna-critters.js; dossier §21) ──
// The animals of a temple town of the Chandela plain [inferred: nothing here is sourced to Khajuraho itself; they are those of any village and pilgrim town of central India]:
// village dogs asleep at the crossings of the road and the lanes and on two house steps, a cat on the verandah platform of a sweet shop and of a flower shop (grain, milk and
// sweets draw cats), hens and a cock in two yards and goats in two others, rock pigeons on the flagged forecourt of Kandariya's stair and along the road, ducks on the Shivsagar
// and a white-throated kingfisher at its west margin. No sarus crane (the engine's crane is the red-crowned of East Asia), no peafowl and no zebu are rigged: the zebu are the life figures'.
const critters = [];
const sweet = openPlaces(['shop']).filter((l) => l.trade === 'sweets' && l.street === 'approach')[0], flower = openPlaces(['shop']).filter((l) => l.trade === 'flowers' && l.street === 'approach')[0];
for (const [i, l] of [sweet, flower].entries()) {
  if (!l) continue;
  const { P } = frame(l), [x, z] = P(0.7, -0.62);
  critters.push({ model: i ? 'cat_tabby' : 'cat_orange', at: [x, 0.43, z], rot: 2.4 + i, range: [7, 2.5] });
}
for (const [x, z, r] of [[22.5, 7.2, 1.1], [88.5, 5.6, 4.2], [-24.6, 7.6, 2.4]]) critters.push({ model: 'dog', at: [x, 0.02, z], rot: r, range: [9, 3.5] });
{
  const doorSide = (l) => { const { L, P } = frame(l); return P(L - 1.4, -2.9); };
  const homes = openPlaces(['home']).slice(1, 3);
  homes.forEach((h, i) => { const [x, z] = doorSide(h); if (i === 1) critters.push({ model: 'dog', at: [x, 0.02, z], rot: 2.0, range: [9, 3.5] }); });
}
const pens = yards().slice().sort((a, b) => Math.hypot(a.rect[0] - 112, a.rect[1] + 14) - Math.hypot(b.rect[0] - 112, b.rect[1] + 14));
pens.slice(0, 2).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: 'rooster', at: [cx - 3, 0.05, cz + 3.4], rot: i, range: [2.0, 1.4], size: 0.95 }, { model: i % 2 ? 'hen_white' : 'hen_brown', at: [cx - 2.2, 0.05, cz + 3.9], rot: i + 2, range: [2.0, 1.4], size: 0.92 }, { model: 'hen_brown', at: [cx - 3.6, 0.05, cz + 2.6], rot: i + 4, range: [2.0, 1.4], size: 0.9 }); });
pens.slice(2, 4).forEach((y, i) => { const cx = (y.rect[0] + y.rect[2]) / 2, cz = (y.rect[1] + y.rect[3]) / 2; critters.push({ model: i ? 'goat_white' : 'goat_black', at: [cx + 2.8, 0.05, cz - 3.4], rot: 0.6 + i, range: [9, 3.2] }, { model: i ? 'goat_black' : 'goat_white', at: [cx - 2.6, 0.05, cz - 3.0], rot: 3 + i, range: [9, 3.2] }); });
for (const [x, z, m] of [[-30.6, -57.8, 'pigeon_grey'], [-29.8, -57.0, 'pigeon_white'], [-31.4, -63.4, 'pigeon_grey'], [-30.8, -62.6, 'pigeon_grey'], [60.5, 6.4, 'pigeon_grey'], [61.3, 6.9, 'pigeon_white']]) critters.push({ model: m, at: [x, 0.05, z], rot: x * 3, range: [1.4, 1.2] });
critters.push({ type: 'floaters', models: ['duck_white', 'duck_brown', 'duck_brown'], area: [TANK.c[0] - 22, TANK.c[1] - 12, TANK.c[0] + 22, TANK.c[1] + 12], dist: tankD, a: [14, 8], ratio: 0.5, margin: 2.5, y: TANK.level, speed: 0.25, cycle: [18, 24] });
critters.push({ type: 'floaters', models: ['duck_brown', 'duck_white'], area: [TANK.c[0] + 30, TANK.c[1] - 8, TANK.c[0] + 62, TANK.c[1] + 12], dist: tankD, a: [10, 6], ratio: 0.5, margin: 2.5, y: TANK.level, speed: 0.22, cycle: [20, 26] });
{
  let best = null;                                                  // the west margin where the bank comes up to the water's level
  for (let d = -4; d < 8; d += 0.1) { const x = TANK.c[0] - TANK.r[0] - d, z = TANK.c[1], e = Math.abs(height(x, z) - (TANK.level + 0.3)); if (!best || e < best[2]) best = [x, z, e]; }
  critters.push({ model: 'kingfisher', at: [best[0], height(best[0], best[1]) + 0.08, best[1]], rot: Math.PI / 2, water: [best[0] + 4.5, best[1], TANK.level], cycle: 36 });
}
export default { fish, flights, perches, critters };
