import { lodTiles } from '../lod.js';
// The village east of the temples (docs/settlements/khajuraho.md §13): the bazaar road and its lanes, rows of
// dressed shop-houses and homes (the ones near the temples enterable), yards with their walls, the rest house,
// the tank's ghat; the dressing of every front at eye level in a plan of its own (style life).
import { RADIUS, TANK, STREETS, lots, yards, height, streetRect, inRect, tankD } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
/** World point at u along a lot's front (from its left, as the style turns it) and v in (+) / out (−) from the front face:
 *  the style's own (u, v) — the verandah and the lane lie at negative v. */
export function frontPoint(l, u, v) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  return f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u];
}
const faceDir = ([dx, dz]) => Math.atan2(-dx, -dz), awayDir = ([dx, dz]) => Math.atan2(dx, dz);

export function village() {
  return lodTiles('khajuraho-houses', 'nagara', lots().map((l) => ({ t: 'bazaar_house', rect: l.rect, front: l.front, y: 0, foot: -0.2, seed: l.seed, kind: l.kind, open: l.open, trade: l.trade })), { near: 150, R: RADIUS, entrance: { at: [0, 0], facing: 'w' } });
}

/** Yard walls, the rest house at the temples' end of the road, the tank's ghat with its kiosks and shrine. */
export function extras() {
  const E = [];
  for (const y of yards()) {
    const [x0, z0, x1, z1] = y.rect;
    E.push({ t: 'yard_wall', rect: [x0 - 1, z0 - 1, x1 + 1, z1 + 1], h: 1.2, gaps: [[y.seed % 4, 3, 6], [(y.seed + 2) % 4, 8, 11]] });
  }
  E.push({ t: 'rest_house', rect: [-20, 17, -3, 26], plinth: 0.7, h: 3.2 });
  E.push(...laneRites());
  // the ghat: steps down the tank's north bank, their tops following the ground, a landing at each end with a kiosk
  const cx = TANK.c[0], rz = TANK.r[1], steps = 7;
  for (const [xa, xb] of [[cx - 4, cx + 4], [cx - 22, cx - 17], [cx + 17, cx + 22]]) {
    const xm = (xa + xb) / 2, zEdge = TANK.c[1] - rz * Math.sqrt(Math.max(0.05, 1 - ((xm - cx) / TANK.r[0]) ** 2));
    let prev = 0.0;
    for (let k = 0; k < steps; k++) {
      const z0 = zEdge - 6 + k * 0.85, top = Math.min(prev, Math.round((height(xm, z0 + 0.85) + 0.05) * 20) / 20);
      prev = top;
      E.push({ t: 'block', rect: [xa, z0, xb, z0 + 0.85], y0: top - 1.2, y1: top, mat: 'sandstone', walk: true });
    }
  }
  const zG = TANK.c[1] - rz * Math.sqrt(1 - (12 / TANK.r[0]) ** 2) - 7;
  for (const sx of [-12, 12]) E.push({ t: 'chhatri', c: [cx + sx, zG], w: 2.6, y: 0 });
  E.push({ t: 'sub_shrine', c: [cx - 32, zG + 1], w: 2.4, h: 6, y: 0, face: 's' });
  return E;
}

/** The pilgrims' lane at its best (street 'approach'): lamp columns at the foot of the terrace's stair, garlands of jasmine strung across
 *  between the verandahs' eaves, a brass bell at each shop's door, the lamps and the plates of flowers laid out on the shop platforms.
 *  `rite` and `lamp_pillar` elements of the style nagara. */
function laneRites() {
  const E = [], rand = rng(311), road = STREETS.find((s) => s.id === 'approach'), zc = road.c;
  const flowers = [['cloth_white'], ['cloth_white', 'cloth_red'], ['cloth_white', 'cloth_white', 'cloth_red']];
  // the lamp columns flanking the lane's end, 3 m before the first flight of the stair
  for (const sz of [-1, 1]) E.push({ t: 'lamp_pillar', c: [-29.6, zc + sz * 3.0], h: 3.4, y: 0 });
  const rows = lots().filter((l) => l.street === 'approach' && !l.farm);
  const covers = (side, x) => rows.some((l) => (l.rect[1] < zc) === (side < 0) && x > l.rect[0] + 0.6 && x < l.rect[2] - 0.6 && l.kind !== 'hut');
  // garlands across the lane at every 4.2 m where there is a front on both sides (the camera's 3 m kept clear: arrival x −14)
  for (let x = -22.5; x < 21; x += 4.2) {
    if (!covers(-1, x) || !covers(1, x) || (x < -11 && x > -17.2)) continue;
    const m = flowers[Math.floor(rand() * flowers.length)];
    E.push({ t: 'rite', kind: 'garland', a: [x, 2.78, zc - 2.5], b: [x, 2.78, zc + 2.5], sag: 0.5, mats: m, r: 0.035 });
    if (rand() < 0.5) E.push({ t: 'rite', kind: 'garland', a: [x + 0.12, 2.8, zc - 2.5], b: [x + 0.12, 2.8, zc + 2.5], sag: 0.3, mats: ['cloth_red'], r: 0.025 });
  }
  for (const l of rows) {
    if (l.kind !== 'shop') continue;
    const [x0, z0, x1, z1] = l.rect, Lw = (l.front === 's' || l.front === 'n') ? x1 - x0 : z1 - z0;
    const P = (u, v) => frontPoint(l, u, v);
    // the bell over the door, hung from the eave beam (1.1 m out, 2.85 m up)
    const [bx, bz] = P(Lw / 2 + 0.5, -1.0);
    E.push({ t: 'rite', kind: 'bell', at: [bx, bz], top: 2.82, drop: 0.5, r: 0.12 });
    const yP = 0.42;
    if (l.trade === 'oil' || l.trade === 'potter' || l.trade === 'sweets') {
      const [ax, az] = P(0.9, -0.55), [cx, cz] = P(Lw - 0.9, -0.55);
      E.push({ t: 'rite', kind: 'lamps', at: [ax, az], to: [cx, cz], y: yP, count: Math.max(3, Math.floor(Lw * 1.1)), s: 1 });
    } else if (l.trade === 'flowers') {
      for (const u of [Lw * 0.28, Lw * 0.5, Lw * 0.72]) { const [px, pz] = P(u, -0.65); E.push({ t: 'rite', kind: 'plate', at: [px, pz], y: yP, s: 1.25, mats: flowers[Math.floor(rand() * 3)] }); }
    }
  }
  return E;
}

/** Everything at eye level on the village's fronts. */
export function dressing() {
  const L = [], rand = rng(2024);
  let seed = 3;
  const F = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceDir(dir), seed: seed++ * 7919, feet: 'bare', hat: 'none', carry: 'none', pose: 'stand', skin: rand() < 0.6 ? 'skin_medium' : 'skin_dark', dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'short', ...o });
  const pickOf = (a) => a[Math.floor(rand() * a.length)];
  for (const l of lots()) {
    if (l.farm) continue;
    const out = OUT[l.front], Lw = (l.front === 's' || l.front === 'n') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
    const P = (u, v) => frontPoint(l, u, v), yPl = 0.4, rotOut = awayDir(out);
    const at = (u, v) => P(Math.max(0.4, Math.min(Lw - 0.4, u)), v);
    const u1 = Lw * (0.2 + rand() * 0.2), u2 = Lw * (0.6 + rand() * 0.2);
    const kind = l.kind;
    // the hanging lamp / cloth banner over a shop; the sign hook at the eave
    if (kind === 'shop') {
      const trade = l.trade;
      L.push({ t: 'shop_sign', at: P(0.3, -0.05), y: 0.42, rot: rotOut, seed: seed++, h: 2.6, cloth: pickOf(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo']), len: 1.0, out: 0.8 });
      if (trade === 'grain') { L.push({ t: 'sacks', at: at(u1, -0.6), y: yPl, rot: rotOut, seed: seed++, n: 4 }); L.push({ t: 'basket', at: at(u2, -0.7), y: yPl, seed: seed++, n: 2, goods: 'cloth_ochre' }); }
      else if (trade === 'potter') { L.push({ t: 'pot', at: at(u1, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'water_pot', n: 6 }); L.push({ t: 'pot', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'dark_pot', n: 4 }); L.push({ t: 'pot', at: at(Lw / 2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else if (trade === 'cloth') { L.push({ t: 'goods_mat', at: at(Lw / 2, -0.8), y: yPl, rot: faceDir(out), seed: seed++, goods: ['basket'], produce: ['cloth_red', 'cloth_indigo', 'cloth_ochre'] }); L.push({ t: 'wash_line', at: P(Lw / 2, -1.3), y: 2.85, rot: (l.front === 'e' || l.front === 'w') ? 1.5708 : 0, seed: seed++, len: Math.min(3.5, Lw - 0.6), drop: 0.8, pole: false }); }
      else if (trade === 'sweets') { L.push({ t: 'tea_table', at: at(u1, -2.1), y: 0, rot: rotOut, seed: seed++ }); L.push({ t: 'pot', at: at(u2, -0.6), y: yPl, seed: seed++, kind: 'dark_pot', n: 3 }); }
      else if (trade === 'smith') { L.push({ t: 'crates', at: at(u1, -0.8), y: yPl, rot: rotOut, seed: seed++, n: 2 }); L.push({ t: 'firewood', at: at(u2, -0.9), y: yPl, rot: rotOut, seed: seed++, len: 1.0 }); }
      else if (trade === 'oil') { L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'pithos', n: 1 }); L.push({ t: 'pot', at: at(u2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else L.push({ t: 'goods_mat', at: at(Lw / 2, -0.9), y: yPl, rot: faceDir(out), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_white', 'cloth_red'] });
      if (!l.open || rand() < 0.5) F(at(Lw / 2 + (rand() - 0.5), -0.5), yPl, out, { pose: 'cross', top: 'bare', hat: pickOf(['turban', 'none']), arms: 'hang' });
      if (rand() < 0.3) F(at(u2, -2.4), 0, [out[1] * 0.5 - out[0] * 0.2, out[0] * 0.5], { carry: pickOf(['basket', 'none']), cloth: pickOf(['cloth_white', 'cloth_ochre']) });
    } else if (kind === 'shed') {
      L.push({ t: 'animal', kind: 'zebu', at: at(Lw * 0.35, -0.7), y: 0.42, rot: rotOut + 1.57, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey', 'hide_tan']) });
      L.push({ t: 'trough', at: at(Lw * 0.75, -1.0), y: 0, rot: rotOut, seed: seed++ });
    } else {
      // homes: water pots by the door, a stool or a bench on the platform, firewood and dung cakes, a drying tray, hens
      L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 2 });
      if (rand() < 0.6) L.push({ t: 'bench', at: at(u2, -0.7), y: 0.0, rot: rotOut + 1.57, seed: seed++, len: 1.4 });
      if (rand() < 0.5) L.push({ t: 'firewood', at: P(Lw - 0.2, -0.1), y: yPl, rot: rotOut + 1.57, seed: seed++, len: 0.9 });
      if (rand() < 0.35) L.push({ t: 'drying_tray', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++ });
      if (rand() < 0.4) L.push({ t: 'chickens', at: at(Lw / 2, -2.2), y: 0, rot: rotOut, seed: seed++, n: 4 });
      if (rand() < 0.2) L.push({ t: 'laundry_pole', at: at(Lw / 2, -1.3), y: 2.9, rot: rotOut, seed: seed++, len: 1.6 });
      if (rand() < 0.35) F(at(u2, -0.6), yPl, out, { pose: 'sit_low', dress: 'wrap', cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
      if (rand() < 0.15) L.push({ t: 'animal', kind: 'zebu', at: at(u1, -2.6), y: 0, rot: rotOut + 1.0, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey']) });
    }
  }
  // wells at the crossings of the main lanes, a stone lamp by each
  for (const s of STREETS) if (s.axis === 'z' && s.kind === 'lane') {
    const road = STREETS[0];
    L.push({ t: 'well', at: [s.c + s.w / 2 + 0.6, road.c - road.w / 2 - 0.6], y: 0, kind: 'shaduf', mat: 'sandstone', seed: seed++ });
  }
  // the yards: a well with its curb, the cattle, a haystack, women washing at the curb
  for (const y of yards()) {
    const [x0, z0, x1, z1] = y.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    L.push({ t: 'well', at: [cx, cz], y: 0, kind: 'shaduf', mat: 'sandstone', seed: y.seed });
    L.push({ t: 'haystack', at: [x0 + 3, z0 + 3], y: 0, kind: 'rick', seed: y.seed + 1, rot: 0 });
    L.push({ t: 'animal', kind: 'zebu', at: [x1 - 4, cz + 2], y: 0, rot: y.seed % 6, seed: y.seed + 2, graze: true, mat: pickOf(['hide_white', 'hide_tan']) });
    F([cx + 1.4, cz + 0.3], 0, [-1, 0], { carry: 'pot', dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
  }
  // the temple end of the road: flower and offering mats on both sides, a pilgrim or two
  for (let x = -22; x < 80; x += 7.5) for (const sz of [-1, 1]) {
    const z = 10 + sz * 4.6 + sz * 0.2;
    if (x > 24 && x < 70 && sz < 0) continue;
    L.push({ t: 'goods_mat', at: [x + rand() * 2, z], y: 0, rot: faceDir([0, -sz]), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_red', 'cloth_white'] });
    F([x + rand() * 2, z + sz * 0.95], 0, [0, -sz], { pose: 'sit_ground', dress: 'wrap', cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
  }
  // the pilgrims' approach (street 'approach', z = -60) to Kandariya's stair, the arrival standing at x −14 (src/planet/arrivals.js):
  // nobody within 5 m of it along the lane. Pilgrims bound for the temple with baskets of flowers and ghee, a family, others coming
  // down with the temple's flowers, a porter, a boy with his goat, the lane's dogs, the cows of the forecourt
  {
    const P = (x, z, o) => F([x, z], 0, [-1, 0.05], o), W = (c1, c2) => ({ dress: 'wrap', cloth: c1, cloth2: c2, hair: 'bun', over: 'shawl', h: 1.5 });
    P(-19.4, -60.8, { carry: 'basket', cloth: 'cloth_white', hat: 'turban' });
    P(-20.7, -59.3, { ...W('cloth_red', 'cloth_ochre'), carry: 'pot' });
    P(-23.1, -60.6, { dress: 'wrap', top: 'bare', hair: 'topknot', over: 'sash', cloth: 'cloth_white', carry: 'none' });
    P(-25.0, -59.4, { ...W('cloth_green', 'cloth_white'), carry: 'child' });
    P(-27.2, -60.7, { carry: 'basket', cloth: 'cloth_ochre' });
    P(-29.3, -59.5, { ...W('cloth_indigo', 'cloth_ochre'), arms: 'pray' });
    F([-22.0, -61.5], 0, [1, -0.1], { ...W('cloth_indigo', 'cloth_ochre'), carry: 'pot' });
    F([-24.6, -58.9], 0, [1, 0], { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', cloth: 'cloth_white', carry: 'pole', arms: 'pole' });
    F([-28.0, -61.2], 0, [1, 0.1], { carry: 'basket', cloth: 'cloth_white', hat: 'turban' });
    F([-31.0, -58.7], 0, [1, 0.05], { ...W('cloth_red', 'cloth_white'), carry: 'basket' });
    // a boy with his goat, the dogs asleep in the lane's dust
    F([-21.2, -62.0], 0, [0.4, 1], { dress: 'wrap', top: 'bare', hair: 'short', cloth: 'cloth_white', child: true, h: 1.15 });
    L.push({ t: 'animal', kind: 'goat', at: [-21.8, -61.5], y: 0, rot: 2.0, seed: seed++, graze: false, mat: 'hide_white' });
    L.push({ t: 'animal', kind: 'dog', at: [-17.6, -57.8], y: 0, rot: 1.2, seed: seed++ });
    L.push({ t: 'animal', kind: 'dog', at: [-26.0, -62.0], y: 0, rot: 5.1, seed: seed++ });
    L.push({ t: 'animal', kind: 'zebu', at: [-26.5, -56.5], y: 0, rot: 1.9, seed: seed++, graze: false, mat: 'hide_white' });
    L.push({ t: 'animal', kind: 'zebu', at: [-28.5, -64.5], y: 0, rot: 4.8, seed: seed++, graze: true, mat: 'hide_tan' });
  }
  return L;
}

export const villageLife = { id: 'khajuraho-village-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' }, center: [150, 10], near: 120 };
export async function houses() {
  return [...village(), { id: 'khajuraho-village-extras', style: 'nagara', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: extras(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' } }, { ...villageLife, elements: dressing() }];
}
void inRect; void streetRect; void tankD;
