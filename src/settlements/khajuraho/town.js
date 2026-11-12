import { lodTiles } from '../lod.js';
// The village east of the temples (docs/settlements/khajuraho.md §13): the bazaar road and its lanes, rows of
// dressed shop-houses and homes (the ones near the temples enterable), yards with their walls, the rest house,
// the tank's ghat; the dressing of every front at eye level in a plan of its own (style life).
import { RADIUS, TANK, STREETS, lots, yards, height, streetRect, inRect, tankD } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
/** World point at u along a lot's front (from its left, as the style turns it) and v out (+) / in (−) from the front face. */
export function frontPoint(l, u, v) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  // building() maps (u, vIn) with vIn into the lot; outward is −vIn
  const vi = -v;
  return f === 's' ? [x1 - u, z1 - vi] : f === 'n' ? [x0 + u, z0 + vi] : f === 'e' ? [x1 - vi, z0 + u] : [x0 + vi, z1 - u];
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
      L.push({ t: 'shop_sign', at: P(0.3, 0.05), y: 0.42, rot: rotOut, seed: seed++, h: 2.6, cloth: pickOf(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo']), len: 1.0, out: 0.8 });
      if (trade === 'grain') { L.push({ t: 'sacks', at: at(u1, -0.6), y: yPl, rot: rotOut, seed: seed++, n: 4 }); L.push({ t: 'basket', at: at(u2, -0.7), y: yPl, seed: seed++, n: 2, goods: 'cloth_ochre' }); }
      else if (trade === 'potter') { L.push({ t: 'pot', at: at(u1, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'water_pot', n: 6 }); L.push({ t: 'pot', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'dark_pot', n: 4 }); L.push({ t: 'pot', at: at(Lw / 2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else if (trade === 'cloth') { L.push({ t: 'goods_mat', at: at(Lw / 2, -0.8), y: yPl, rot: faceDir(out), seed: seed++, goods: ['basket'], produce: ['cloth_red', 'cloth_indigo', 'cloth_ochre'] }); L.push({ t: 'wash_line', at: P(0.3, 0), y: 3.2, rot: 0, seed: seed++, len: Math.min(3, Lw - 0.6), drop: 0.6, pole: false }); }
      else if (trade === 'sweets') { L.push({ t: 'tea_table', at: at(u1, -2.1), y: 0, rot: rotOut, seed: seed++ }); L.push({ t: 'pot', at: at(u2, -0.6), y: yPl, seed: seed++, kind: 'dark_pot', n: 3 }); }
      else if (trade === 'smith') { L.push({ t: 'crates', at: at(u1, -0.8), y: yPl, rot: rotOut, seed: seed++, n: 2 }); L.push({ t: 'firewood', at: at(u2, -0.9), y: yPl, rot: rotOut, seed: seed++, len: 1.0 }); }
      else if (trade === 'oil') { L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'pithos', n: 1 }); L.push({ t: 'pot', at: at(u2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else L.push({ t: 'goods_mat', at: at(Lw / 2, -0.9), y: yPl, rot: faceDir(out), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_white', 'cloth_red'] });
      if (!l.open || rand() < 0.5) F(at(Lw / 2 + (rand() - 0.5), -0.5), yPl, [-out[0], -out[1]], { pose: 'cross', top: 'bare', hat: pickOf(['turban', 'none']), arms: 'hang' });
      if (rand() < 0.3) F(at(u2, -2.4), 0, [out[1] * 0.5 - out[0] * 0.2, out[0] * 0.5], { carry: pickOf(['basket', 'none']), cloth: pickOf(['cloth_white', 'cloth_ochre']) });
    } else if (kind === 'shed') {
      L.push({ t: 'animal', kind: 'zebu', at: at(Lw * 0.35, 1.2), y: 0.42, rot: rotOut + 1.57, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey', 'hide_tan']) });
      L.push({ t: 'haystack', at: P(Lw + 1.4, 4), y: 0, kind: 'rick', seed: seed++, rot: 0 });
      L.push({ t: 'trough', at: at(Lw * 0.75, -1.0), y: 0, rot: rotOut, seed: seed++ });
    } else {
      // homes: water pots by the door, a stool or a bench on the platform, firewood and dung cakes, a drying tray, hens
      L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 2 });
      if (rand() < 0.6) L.push({ t: 'bench', at: at(u2, -0.7), y: 0.0, rot: rotOut + 1.57, seed: seed++, len: 1.4 });
      if (rand() < 0.5) L.push({ t: 'firewood', at: P(Lw - 0.2, -0.1), y: yPl, rot: rotOut + 1.57, seed: seed++, len: 0.9 });
      if (rand() < 0.35) L.push({ t: 'drying_tray', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++ });
      if (rand() < 0.4) L.push({ t: 'chickens', at: at(Lw / 2, -2.2), y: 0, rot: rotOut, seed: seed++, n: 4 });
      if (rand() < 0.2) L.push({ t: 'laundry_pole', at: at(Lw / 2, 0), y: 3.3, rot: rotOut, seed: seed++, len: 1.6 });
      if (rand() < 0.35) F(at(u2, -0.6), yPl, [-out[0], -out[1]], { pose: 'sit_low', dress: 'wrap', cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
      if (rand() < 0.15) L.push({ t: 'animal', kind: 'zebu', at: at(u1, -2.6), y: 0, rot: rotOut + 1.0, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey']) });
      if (kind === 'hut' && rand() < 0.5) L.push({ t: 'haystack', at: P(Lw + 1.3, 3), y: 0, kind: 'rick', seed: seed++, rot: 0 });
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
  // the pilgrims' approach (street 'approach', z = -60) to Kandariya's stair: offering mats and their sellers at the lane's edge,
  // pilgrims bound for the temple with baskets of flowers and ghee, a family, a priest coming down, a cow in the lane's end, hens and a bench
  {
    const zc = -60, face = ([dx, dz]) => Math.atan2(-dx, -dz);
    for (let x = -27; x <= -3; x += 4.6) for (const sz of [-1, 1]) {
      if (rand() < 0.2) continue;
      const z = zc + sz * 1.85;
      L.push({ t: 'goods_mat', at: [x + rand(), z], y: 0, rot: face([0, -sz]), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: pickOf([['cloth_white', 'cloth_red', 'cloth_white'], ['cloth_ochre', 'cloth_white', 'cloth_red']]) });
      if (rand() < 0.7 && !(x > -14.5 && x < -9)) F([x + rand(), z + sz * 0.95], 0, [0, -sz], { pose: 'sit_ground', dress: 'wrap', cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
    }
    // the arrival stands at x −9.5 (src/planet/arrivals.js): nobody within 5 m of it along the lane; the pilgrims begin beyond that
    const P = (x, z, o) => F([x, z], 0, [-1, 0.05], o);
    P(-15.2, -60.9, { carry: 'basket', cloth: 'cloth_white', hat: 'turban' });
    P(-16.6, -59.3, { dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5, carry: 'pot' });
    P(-19.6, -60.7, { dress: 'wrap', top: 'bare', hair: 'topknot', over: 'sash', cloth: 'cloth_white', carry: 'none' });
    P(-22.4, -59.5, { dress: 'wrap', cloth: 'cloth_green', cloth2: 'cloth_white', hair: 'bun', over: 'shawl', h: 1.5, child: true });
    P(-24.8, -60.6, { carry: 'basket', cloth: 'cloth_ochre' });
    P(-27.3, -59.6, { dress: 'wrap', cloth: 'cloth_indigo', cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5, arms: 'pray' });
    F([-18.6, -61.5], 0, [1, -0.1], { dress: 'wrap', cloth: 'cloth_indigo', cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5, carry: 'pot' });
    F([-21.2, -59.1], 0, [1, 0], { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', cloth: 'cloth_white', carry: 'pole', arms: 'pole' });
    L.push({ t: 'animal', kind: 'zebu', at: [-26.5, -56.5], y: 0, rot: 1.9, seed: seed++, graze: false, mat: 'hide_white' });
    L.push({ t: 'animal', kind: 'zebu', at: [-28, -64.5], y: 0, rot: 4.8, seed: seed++, graze: true, mat: 'hide_tan' });
    L.push({ t: 'chickens', at: [-3, -62.4], y: 0, rot: 0.4, seed: seed++, n: 4 });
    L.push({ t: 'bench', at: [-17.2, -63.2], y: 0, rot: 0, seed: seed++, len: 1.6 });
    L.push({ t: 'pot', at: [-12.5, -57.4], y: 0, seed: seed++, kind: 'water_pot', n: 4 });
  }
  return L;
}

export const villageLife = { id: 'khajuraho-village-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' }, center: [150, 10], near: 120 };
export async function houses() {
  return [...village(), { id: 'khajuraho-village-extras', style: 'nagara', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: extras(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'w' } }, { ...villageLife, elements: dressing() }];
}
void inRect; void streetRect; void tankD;
