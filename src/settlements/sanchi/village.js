// The village below the hill (docs/settlements/sanchi.md §13): the streets' rows of dressed shop-houses and homes, the yards
// with their walls, the pilgrims' rest house and the tree shrine at the stair's foot, the plaza with its stalls, the stair
// itself, the tank's ghat; and every front dressed at eye level (a plan of its own, style life).
import { lodTiles } from '../lod.js';
import { RADIUS, TOP, STAIR, TANK, HALL, SHRINE, PLAZA, NORTH, STUPA2, STREETS, lots, yards, height, tankD } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
/** World point at u along a lot's front (from its left, as the style turns it) and v out (+) / in (−) from the front face. */
export function frontPoint(l, u, v) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, vi = -v;
  return f === 's' ? [x1 - u, z1 - vi] : f === 'n' ? [x0 + u, z0 + vi] : f === 'e' ? [x1 - vi, z0 + u] : [x0 + vi, z1 - u];
}
const faceDir = ([dx, dz]) => Math.atan2(-dx, -dz), awayDir = ([dx, dz]) => Math.atan2(dx, dz);
/** The stair's ground line: the height of the cut slope at z. */
export const stairY = (z) => TOP * Math.max(0, Math.min(1, (STAIR.z1 - z) / (STAIR.z1 - STAIR.z0)));

export function village() {
  return lodTiles('sanchi-houses', 'indian', lots().map((l) => ({ t: 'village_house', rect: l.rect, front: l.front, y: 0, foot: -0.2, seed: l.seed, kind: l.kind, open: l.open, trade: l.trade })), { near: 150, R: RADIUS, entrance: { at: [0, -180], facing: 's' } });
}

/** The stalls round the plaza and along the pilgrims' road: [centre x, z, front, trade]. */
export const STALLS = [
  [-9.5, 129.5, 'e', 'flowers'], [9.5, 129.5, 'w', 'lamps'], [-9.5, 134.5, 'e', 'incense'], [9.5, 134.5, 'w', 'flowers'],
  [-6.5, 139.5, 'e', 'water'], [6.5, 141.5, 'w', 'bowls'], [13.5, 147, 'w', 'robes'], [-13.5, 147, 'e', 'flowers'],
];

/** Yard walls, the rest house, the tree shrine, the plaza, the stair with its cheek walls, the stalls, the tank's ghat. */
export function extras() {
  const E = [];
  for (const y of yards()) {
    const [x0, z0, x1, z1] = y.rect;
    E.push({ t: 'yard_wall', rect: [x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], h: 1.25, gaps: [[y.seed % 4, 2, 4.4], [(y.seed + 2) % 4, 5, 7.4]] });
  }
  E.push({ t: 'pilgrim_hall', rect: HALL, plinth: 0.5, h: 3.0 });
  E.push({ t: 'tree_shrine', c: SHRINE.c, r: SHRINE.r, y: 0 });
  E.push({ t: 'floor', rect: PLAZA, y: 0.03, mat: 'sandstone_floor', th: 0.06 });
  E.push({ t: 'floor', rect: [-4, 136, 4, 150], y: 0.03, mat: 'sandstone_floor', th: 0.06 });
  // the stair: treads on the cut slope, a low wall of dressed stone each side stepping up with it
  E.push({ t: 'stair', rect: [-STAIR.w, STAIR.z0, STAIR.w, STAIR.z1], dir: 'n', y0: 0, y1: TOP, riser: 0.17, base: -0.5, mat: 'sandstone_dressed' });
  for (const sd of [-1, 1]) for (let z = STAIR.z0; z < STAIR.z1; z += 2.3) {
    const z1 = Math.min(STAIR.z1, z + 2.3), x0 = sd < 0 ? -STAIR.w - 0.55 : STAIR.w + 0.05, x1 = x0 + 0.5;
    E.push({ t: 'block', rect: [x0, z, x1, z1], y0: -0.5, y1: stairY(z) + 0.9, mat: 'sandstone' });
  }
  // a stone lamp-pillar at the foot of each cheek wall
  for (const sd of [-1, 1]) E.push({ t: 'block', rect: [sd * (STAIR.w + 0.9) - 0.25, STAIR.z1 - 0.1, sd * (STAIR.w + 0.9) + 0.25, STAIR.z1 + 0.4], y0: 0, y1: 1.6, mat: 'sandstone_dressed' });
  for (const [cx, cz, front, trade] of STALLS) {
    const f = front === 'e' || front === 'w';
    E.push({ t: 'stall', rect: f ? [cx - 1.3, cz - 1.8, cx + 1.3, cz + 1.8] : [cx - 1.8, cz - 1.3, cx + 1.8, cz + 1.3], front, y: 0, seed: Math.floor(cx * 31 + cz * 17), trade });
  }
  // the foot of the north path: its plaza, a rest hall and the stalls
  E.push({ t: 'floor', rect: NORTH.plaza, y: 0.03, mat: 'sandstone_floor', th: 0.06 });
  E.push({ t: 'pilgrim_hall', rect: NORTH.hall, plinth: 0.5, h: 3.0 });
  for (const [cx, cz, front, trade] of NORTH.stalls) E.push({ t: 'stall', rect: [cx - 1.3, cz - 1.8, cx + 1.3, cz + 1.8], front, y: 0, seed: Math.floor(cx * 31 + cz * 17), trade });
  // Stupa 2's terrace: lamps and an offering at the head of the flight
  { const cx = STUPA2.c[0], z0 = STUPA2.terrace[1];
    E.push({ t: 'rite', kind: 'lamps', at: [cx - 1.5, z0 + 1.0], to: [cx + 1.5, z0 + 1.0], y: STUPA2.y + 0.03, count: 5 }, { t: 'rite', kind: 'offering', at: [cx + 2.3, z0 + 1.6], y: STUPA2.y + 0.03, n: [-1, 0], seed: 8 }); }
  // the ghat: steps down the tank's north bank, their tops following the ground, a landing at each end
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
  // lotus pads in drifts along the tank's shallow margins
  const rand = rng(77), pts = [];
  for (let k = 0; k < 800 && pts.length < 150; k++) {
    const a = rand() * Math.PI * 2, f = 0.8 + rand() * 0.16, x = TANK.c[0] + Math.cos(a) * TANK.r[0] * f, z = TANK.c[1] + Math.sin(a) * TANK.r[1] * f;
    if (Math.sin(a * 3 + 1) < 0.1 || pts.some(([p, q]) => Math.hypot(p - x, q - z) < 0.9)) continue;
    pts.push([x, z]);
  }
  E.push({ t: 'rite', kind: 'pads', at: [0, 0], y: TANK.level + 0.015, pts, seed: 9 });
  return E;
}

/** Everything at eye level on the village's fronts, at the stair's foot, the yards and the ghat. */
export function dressing() {
  const L = [], rand = rng(2024);
  let seed = 3;
  const F = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceDir(dir), seed: seed++ * 7919, feet: 'bare', hat: 'none', carry: 'none', pose: 'stand', skin: rand() < 0.6 ? 'skin_medium' : 'skin_dark', dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'short', ...o });
  const pickOf = (a) => a[Math.floor(rand() * a.length)];
  const woman = (at, y, dir, o = {}) => F(at, y, dir, { cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5, ...o });
  // the farmsteads on the plain: a haystack, the cattle tied by the house, hens, pots by the door
  for (const l of lots()) {
    if (!l.farm) continue;
    const out = OUT[l.front], Lw = (l.front === 's' || l.front === 'n') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
    const P = (u, v) => frontPoint(l, u, v), rotOut = awayDir(out);
    L.push({ t: 'haystack', at: P(Lw + 2.2, 3), y: 0, kind: 'rick', seed: seed++, rot: 0 });
    L.push({ t: 'animal', kind: rand() < 0.4 ? 'buffalo' : 'zebu', at: P(Lw * 0.4, -2.8), y: 0, rot: rotOut + 1.4, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey', 'hide_tan']) });
    L.push({ t: 'chickens', at: P(Lw * 0.8, -2.2), y: 0, rot: rotOut, seed: seed++, n: 4 });
    L.push({ t: 'pot', at: P(1, -0.7), y: 0.4, seed: seed++, kind: 'matka', n: 2 });
    if (rand() < 0.5) L.push({ t: 'bench', at: P(Lw * 0.7, -0.8), y: 0, rot: rotOut + 1.57, seed: seed++, len: 1.4 });
    if (rand() < 0.5) F(P(Lw * 0.5, -1.4), 0, [-out[0], -out[1]], { pose: 'sit_low', top: 'bare', hat: 'turban' });
  }
  // the fields: a well with its sweep and a woman at it, a farmer with his hoe among the crop, a pair of oxen at rest by a haystack
  {
    const R2 = rng(909);
    for (let k = 0, n = 0; k < 300 && n < 14; k++) {
      const a = R2() * 6.28, rr = 215 + R2() * 40, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (z < 110 || Math.hypot(x, z) > RADIUS - 24 || tankD(x, z) < 20 || STREETS.some((s) => (s.axis === 'x' ? Math.abs(z - s.c) < s.w + 8 && x > s.a - 8 && x < s.b + 8 : Math.abs(x - s.c) < s.w + 8 && z > s.a - 8 && z < s.b + 8)) || lots().some((l) => x > l.rect[0] - 12 && x < l.rect[2] + 12 && z > l.rect[1] - 12 && z < l.rect[3] + 12)) continue;
      n++;
      if (n % 3 === 0) { L.push({ t: 'well', at: [x, z], y: 0, kind: 'shaduf', mat: 'sandstone', seed: seed++ }); woman([x + 1.3, z + 0.4], 0, [-1, 0], { carry: 'pot' }); }
      else if (n % 3 === 1) { F([x, z], 0, [rand() - 0.5, 1], { top: 'bare', carry: 'hoe', hat: 'turban' }); F([x + 3.5, z + 1.2], 0, [1, 0.3], { top: 'bare', carry: 'hoe' }); }
      else { L.push({ t: 'haystack', at: [x, z], y: 0, kind: 'pole', seed: seed++, rot: 0 }); L.push({ t: 'animal', kind: 'zebu', at: [x + 3, z + 1], y: 0, rot: 1, seed: seed++, graze: false, mat: 'hide_white' }); L.push({ t: 'animal', kind: 'zebu', at: [x + 3.8, z + 2.3], y: 0, rot: 1.4, seed: seed++, graze: true, mat: 'hide_grey' }); }
    }
  }
  for (const l of lots()) {
    if (l.farm) continue;
    const out = OUT[l.front], Lw = (l.front === 's' || l.front === 'n') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
    const P = (u, v) => frontPoint(l, u, v), yPl = 0.4, rotOut = awayDir(out);
    const at = (u, v) => P(Math.max(0.4, Math.min(Lw - 0.4, u)), v);
    const u1 = Lw * (0.2 + rand() * 0.2), u2 = Lw * (0.6 + rand() * 0.2);
    const kind = l.kind;
    if (kind === 'shop') {
      const trade = l.trade;
      L.push({ t: 'shop_sign', at: P(0.3, 0.05), y: 0.42, rot: rotOut, seed: seed++, h: 2.6, cloth: pickOf(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_indigo']), len: 1.0, out: 0.8 });
      if (trade === 'grain') { L.push({ t: 'sacks', at: at(u1, -0.6), y: yPl, rot: rotOut, seed: seed++, n: 4 }); L.push({ t: 'basket', at: at(u2, -0.7), y: yPl, seed: seed++, n: 2, goods: 'cloth_ochre' }); }
      else if (trade === 'potter') { L.push({ t: 'pot', at: at(u1, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'water_pot', n: 6 }); L.push({ t: 'pot', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++, kind: 'dark_pot', n: 4 }); L.push({ t: 'pot', at: at(Lw / 2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else if (trade === 'cloth' || trade === 'robes') { L.push({ t: 'goods_mat', at: at(Lw / 2, -0.8), y: yPl, rot: faceDir(out), seed: seed++, goods: ['basket'], produce: trade === 'robes' ? ['cloth_ochre', 'cloth_ochre', 'cloth_maroon'] : ['cloth_red', 'cloth_indigo', 'cloth_ochre'] }); L.push({ t: 'wash_line', at: P(0.3, 0), y: 3.2, rot: 0, seed: seed++, len: Math.min(3, Lw - 0.6), drop: 0.6, pole: false }); }
      else if (trade === 'sweets') { L.push({ t: 'tea_table', at: at(u1, -2.1), y: 0, rot: rotOut, seed: seed++ }); L.push({ t: 'pot', at: at(u2, -0.6), y: yPl, seed: seed++, kind: 'dark_pot', n: 3 }); }
      else if (trade === 'smith') { L.push({ t: 'crates', at: at(u1, -0.8), y: yPl, rot: rotOut, seed: seed++, n: 2 }); L.push({ t: 'firewood', at: at(u2, -0.9), y: yPl, rot: rotOut, seed: seed++, len: 1.0 }); }
      else if (trade === 'oil' || trade === 'lamps') { L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'pithos', n: 1 }); L.push({ t: 'pot', at: at(u2, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 3 }); }
      else if (trade === 'bowls') { L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'dark_pot', n: 5 }); L.push({ t: 'pot', at: at(u2, -1.8), y: 0, rot: rotOut, seed: seed++, kind: 'water_pot', n: 4 }); }
      else if (trade === 'ivory') { L.push({ t: 'crates', at: at(u1, -0.8), y: yPl, rot: rotOut, seed: seed++, n: 2 }); L.push({ t: 'stool', at: at(u2, -0.8), y: yPl, seed: seed++ }); }
      else L.push({ t: 'goods_mat', at: at(Lw / 2, -0.9), y: yPl, rot: faceDir(out), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_white', 'cloth_red'] });
      if (!l.open || rand() < 0.5) F(at(Lw / 2 + (rand() - 0.5), -0.5), yPl, [-out[0], -out[1]], { pose: 'cross', top: 'bare', hat: pickOf(['turban', 'none']), arms: 'hang' });
      if (rand() < 0.3) F(at(u2, -2.4), 0, [out[1] * 0.5 - out[0] * 0.2, out[0] * 0.5], { carry: pickOf(['basket', 'none']), cloth: pickOf(['cloth_white', 'cloth_ochre']) });
      if (rand() < 0.18) L.push({ t: 'animal', kind: 'dog', at: at(Lw * 0.6, -2.8), y: 0, rot: rotOut + 2, seed: seed++ });
    } else if (kind === 'shed') {
      L.push({ t: 'animal', kind: pickOf(['zebu', 'zebu', 'buffalo']), at: at(Lw * 0.35, 1.2), y: 0.42, rot: rotOut + 1.57, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey', 'hide_tan']) });
      L.push({ t: 'haystack', at: P(Lw + 1.4, 4), y: 0, kind: 'rick', seed: seed++, rot: 0 });
      L.push({ t: 'trough', at: at(Lw * 0.75, -1.0), y: 0, rot: rotOut, seed: seed++ });
    } else {
      L.push({ t: 'pot', at: at(u1, -0.7), y: yPl, seed: seed++, kind: 'matka', n: 2 });
      if (rand() < 0.6) L.push({ t: 'bench', at: at(u2, -0.7), y: 0.0, rot: rotOut + 1.57, seed: seed++, len: 1.4 });
      if (rand() < 0.5) L.push({ t: 'firewood', at: P(Lw - 0.2, -0.1), y: yPl, rot: rotOut + 1.57, seed: seed++, len: 0.9 });
      if (rand() < 0.35) L.push({ t: 'drying_tray', at: at(u2, -1.9), y: 0, rot: rotOut, seed: seed++ });
      if (rand() < 0.4) L.push({ t: 'chickens', at: at(Lw / 2, -2.2), y: 0, rot: rotOut, seed: seed++, n: 4 });
      if (rand() < 0.25) L.push({ t: 'laundry_pole', at: at(Lw / 2, 0), y: 3.3, rot: rotOut, seed: seed++, len: 1.6 });
      if (rand() < 0.35) F(at(u2, -0.6), yPl, [-out[0], -out[1]], { pose: 'sit_low', dress: 'wrap', cloth: pickOf(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_ochre', hair: 'bun', over: 'shawl', h: 1.5 });
      if (rand() < 0.2) L.push({ t: 'animal', kind: pickOf(['zebu', 'goat', 'goat']), at: at(u1, -2.6), y: 0, rot: rotOut + 1.0, seed: seed++, graze: false, mat: pickOf(['hide_white', 'hide_grey']) });
      if (rand() < 0.15) L.push({ t: 'animal', kind: 'dog', at: at(Lw * 0.8, -3), y: 0, rot: rotOut + 2.5, seed: seed++ });
      if (kind === 'hut' && rand() < 0.5) L.push({ t: 'haystack', at: P(Lw + 1.3, 3), y: 0, kind: 'rick', seed: seed++, rot: 0 });
    }
  }
  // wells at the crossings of the lanes with the bazaar street, a sweep over each
  const baz = STREETS.find((s) => s.id === 'bazaar');
  for (const s of STREETS) if (s.axis === 'z' && s.kind === 'lane') L.push({ t: 'well', at: [s.c + s.w / 2 + 0.6, baz.c + baz.w / 2 + 0.6], y: 0, kind: 'shaduf', mat: 'sandstone', seed: seed++ });
  // the yards: a well with its curb, the cattle, a haystack, women at the curb
  for (const y of yards()) {
    const [x0, z0, x1, z1] = y.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    L.push({ t: 'well', at: [cx, cz], y: 0, kind: 'shaduf', mat: 'sandstone', seed: y.seed });
    L.push({ t: 'haystack', at: [x0 + 2.4, z0 + 2.4], y: 0, kind: 'rick', seed: y.seed + 1, rot: 0 });
    L.push({ t: 'animal', kind: y.seed % 3 ? 'zebu' : 'buffalo', at: [x1 - 3, cz + 1.4], y: 0, rot: y.seed % 6, seed: y.seed + 2, graze: true, mat: pickOf(['hide_white', 'hide_tan']) });
    if (x1 - x0 > 9) L.push({ t: 'animal', kind: 'goat', at: [cx + 2, z1 - 1.6], y: 0, rot: y.seed % 5, seed: y.seed + 3, graze: true });
    woman([cx + 1.4, cz + 0.3], 0, [-1, 0], { carry: 'pot', cloth: 'cloth_red' });
  }
  // the plaza and the pilgrims' road before the stair: the sellers behind their stalls, buyers, a cart with its ox, pilgrims on the way up
  for (const [cx, cz, front, trade] of STALLS) {
    const d = front === 'e' ? [1, 0] : [-1, 0];
    woman([cx - d[0] * 0.9 - d[0] * 0.0, cz + 0.2], 0, d, { carry: 'none', cloth: trade === 'robes' ? 'cloth_ochre' : pickOf(['cloth_red', 'cloth_indigo']) });
    F([cx + d[0] * 2.3, cz - 0.6 + rand()], 0, [-d[0], 0.2], { carry: rand() < 0.5 ? 'basket' : 'none', cloth: pickOf(['cloth_white', 'cloth_ochre']), hat: pickOf(['turban', 'none']) });
  }
  L.push({ t: 'cart', at: [-2.4, 168], y: 0, rot: 0.1, seed: seed++, kind: 'two', load: 'sacks', beast: 'zebu' });
  L.push({ t: 'cart', at: [2.6, 214], y: 0, rot: Math.PI + 0.05, seed: seed++, kind: 'two', load: 'hay', beast: 'buffalo' });
  for (let z = 129; z < 150; z += 3.6) for (const sx of [-1, 1]) if (Math.abs(sx * 6.6) > 4 && z > 143) L.push({ t: 'goods_mat', at: [sx * 4.2, z + rand()], y: 0.03, rot: faceDir([-sx, 0]), seed: seed++, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_red', 'cloth_white'] }), woman([sx * 5.3, z + 0.6], 0.03, [-sx, 0], { pose: 'sit_ground' });
  // the rest house: pilgrims resting on the seat and the mats, a monk, a water-bearer
  const [hx0, hz0, hx1, hz1] = HALL, hy = 0.5;
  F([hx0 + 3.5, hz0 + 1.1], hy, [0, 1], { pose: 'cross', top: 'bare', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', dress: 'robe', over: 'sash', hair: 'shaven' });
  F([hx0 + 7.4, hz0 + 1.1], hy, [0, 1], { pose: 'sit_low', hat: 'turban' });
  F([(hx0 + hx1) / 2, (hz0 + hz1) / 2 + 0.2], hy, [0, 1], { pose: 'cross', hat: 'turban', top: 'bare' });
  woman([hx1 - 1.3, hz1 - 1.2], hy, [-1, 0], { carry: 'pot' });
  // at the tree shrine: devotees kneeling at the throne, flower offerings
  const [sx, sz] = SHRINE.c;
  F([sx - 0.9, sz + 1.6], 0.5, [0, -1], { pose: 'kneel', arms: 'pray', cloth: 'cloth_white' });
  woman([sx + 1.2, sz + 1.8], 0.5, [0, -1], { pose: 'kneel', arms: 'pray' });
  F([sx + 4.6, sz + 5.5], 0, [-0.6, -1], { dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', over: 'sash', hair: 'shaven', carry: 'staff' });
  // the ghat: women filling pots and bathers at the water's edge
  const cx = TANK.c[0];
  for (let k = 0; k < 8; k++) {
    const x = cx - 24 + k * 7 + rand() * 2, ed = TANK.c[1] - TANK.r[1] * Math.sqrt(Math.max(0.05, 1 - ((x - cx) / TANK.r[0]) ** 2)) - 1.4 - rand() * 2.5, y = height(x, ed);
    if (k % 3 === 0) woman([x, ed], y, [0, 1], { carry: 'pot' }); else if (k % 3 === 1) F([x, ed], y, [0, 1], { top: 'bare', arms: 'pray' }); else F([x, ed], y, [0, 1], { pose: 'squat', top: 'bare' });
  }
  // the north path's foot: sellers at the stalls, the pilgrims setting out, monks at rest in the hall
  for (const [cx, cz, front, trade] of NORTH.stalls) {
    const d = front === 'e' ? [1, 0] : [-1, 0];
    woman([cx - d[0] * 0.2, cz + 0.2], 0, d, { carry: 'none', pose: 'sit_low' });
    F([cx + d[0] * 2.3, cz - 0.4], 0, [-d[0], 0.2], { carry: rand() < 0.5 ? 'basket' : 'none', cloth: pickOf(['cloth_white', 'cloth_ochre']), hat: pickOf(['turban', 'none']) });
    void trade;
  }
  { const [h0, h1, h2, h3] = NORTH.hall;
    F([h0 + 3.5, h1 + 1.1], 0.5, [0, 1], { pose: 'cross', top: 'bare', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', dress: 'robe', over: 'sash', hair: 'shaven' });
    F([h0 + 8, h1 + 1.1], 0.5, [0, 1], { pose: 'sit_low', hat: 'turban' });
    woman([h2 - 1.3, h3 - 1.2], 0.5, [-1, 0], { carry: 'pot' }); }
  for (const [x, z, d] of [[1.5, -178, [0, 1]], [-1.4, -184, [0, 1]], [2.0, -188, [0, 1]]]) F([x, z], 0.03, d, { carry: rand() < 0.5 ? 'basket' : 'none' });
  // cattle and goats on the open ground between the hill's foot and the first rows
  for (const [x, z, rot, graze] of [[-48, 134, 0.8, true], [-60, 140, 2.2, false], [48, 135, 4.1, true], [66, 132, 1.2, true], [-90, 160, 3.3, false], [96, 160, 0.3, true]]) L.push({ t: 'animal', kind: rand() < 0.3 ? 'buffalo' : 'zebu', at: [x, z], y: 0, rot, seed: seed++, graze, mat: pickOf(['hide_white', 'hide_grey', 'hide_tan']) });
  for (const [x, z] of [[-40, 131], [-36, 133], [56, 133], [60, 130]]) L.push({ t: 'animal', kind: 'goat', at: [x, z], y: 0, rot: rand() * 6, seed: seed++, graze: true });
  return L;
}

export const villageLife = { id: 'sanchi-village-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 's' }, center: [0, 175], near: 130 };
export async function houses() {
  return [...village(), { id: 'sanchi-village-extras', style: 'indian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: extras(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 's' } }, { ...villageLife, elements: dressing() }];
}
void tankD;
