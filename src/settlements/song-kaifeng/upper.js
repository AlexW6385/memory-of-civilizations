// Bianjing's upper storeys one can climb (docs/settlements/song-kaifeng.md §18): the wine houses (zhengdian) with their private rooms
// over the street, the two-storey shops with the merchant's family rooms over the counter, the single-storey shops and tiled
// houses with a sleeping and store loft (ge lou) in the roof, and the inns' guest rooms with the court's open stair and gallery.
// houses.js builds each house's shell and calls upperStorey() for what is inside and above: the stair, the floor's opening with its
// rail, the partitions, the furniture and the colliders. Everything is in the house's own frame (a along the front, b inward from it,
// y up), turned into the world by the shell's own helpers (A.B boxes, A.surf polygons, A.cRect / A.cFloor colliders).
import { lots } from './layout.js';
import { doorOf } from './houses.js';
import { Parts, box, ly, drum, bowl, jar, rng, table, bench, stool, chair, couch, bed, shelves, screen, teaSet, hanging, lantern, plumVase, crockery, WD, LQ, DK } from './props.js';

// ---- which houses are opened (chosen by their lot's seed; layout.js's lots are a pure function, so the seeds are stable)
// [seed, type]: 'inn' (the court's stair, a gallery, guest rooms), 'wine' (zhengdian: private rooms on the street, a hall behind),
// 'shop2' (a two-storey shop with the family's rooms), 'loft' (a one-storey shop with a store loft), 'house' (a tiled house with a sleeping loft)
const PICKS = [
  [664829, 'inn'], [373530, 'inn'], [581554, 'inn'],
  [740541, 'wine'], [437015, 'wine'],
  [600389, 'shop2'], [238778, 'shop2'], [891193, 'shop2'],
  [21856, 'loft'], [971239, 'loft'],
  [319884, 'house'], [746284, 'house'],
];
let SPECS = null;
/** The opened lots: a Map lot → { type, side } (side: the wall the stair stands against, 'l' or 'r', by the door's side). */
export function upperSpecs() {
  if (SPECS) return SPECS;
  SPECS = new Map();
  const by = new Map(lots().map((l) => [l.seed, l]));
  for (const [seed, type] of PICKS) {
    const l = by.get(seed);
    if (!l) throw new Error('upper.js: no lot with seed ' + seed);
    SPECS.set(l, { type, seed, side: type === 'inn' ? 'r' : undefined });
  }
  return SPECS;
}
export const upperOf = (l) => upperSpecs().get(l);
/** The lot's frame: origin (ox, oz) of the front's u-end, u along the front, v inward; L the front, D the depth. */
export function frameOf(l) {
  const [x0, z0, x1, z1] = l.foot, f = l.front, along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1], v = [-u[1], u[0]];
  return { L, D, ox, oz, u, v, W: (a, b) => [ox + u[0] * a + v[0] * b, oz + u[1] * a + v[1] * b] };
}

// ---- the stair and the floor's opening
const RISE = 0.2, TREAD = 0.22, SW = 1.0;
/**
 * The stair against a side wall, climbing inward (+b) from the foot at bf, and the opening it rises through in the floor above it.
 * ceilH: the ground room's ceiling over its floor (the joists' underside is 0.16 lower); yF − P0 the climb.
 */
export function stairLayout(L, D, P0, yF, ceilH, side, bf = 1.55) {
  const climb = yF - P0, n = Math.round(climb / RISE), r = climb / n, t = TREAD;
  const sa0 = side === 'l' ? 0.3 : L - 0.3 - SW, sa1 = sa0 + SW;
  const bTop = bf + (n - 1) * t;
  const i0 = Math.max(0, Math.floor((ceilH - 0.16 - 1.95) / r)), bh0 = bf + i0 * t;   // the floor opens where a head would meet the joists
  return { side, n, r, t, sa0, sa1, bf, bTop, bh0, P0, yF };
}
/** The side of the wall the stair stands against: the door's side (the stair is the first thing past the counters). */
export function sideOf(l) {
  const F = frameOf(l), d = doorOf(l).at, a = (d[0] - F.ox) * F.u[0] + (d[1] - F.oz) * F.u[1];
  return a < F.L / 2 ? 'l' : 'r';
}
const YF = { shop2: 3.25, wine: 3.5, loft: 3.0, house: 3.1 }, CEIL = { shop2: 2.95, wine: 3.2, loft: 2.7, house: 2.7 };
/** The stair's layout of an opened lot (shops and houses). */
export function layoutOfLot(l, sp) {
  const F = frameOf(l);
  return stairLayout(F.L, F.D, 0.28, 0.28 + YF[sp.type], CEIL[sp.type], sideOf(l));
}
/** The rect the ground room's furniture keeps clear of, in the room's centred frame (a − L/2): the stair's strip and its foot. */
export function holdOf(l) {
  const sp = upperOf(l);
  if (!sp || sp.type === 'inn') return null;
  const S = layoutOfLot(l, sp), F = frameOf(l), d = doorOf(l).at, ad = (d[0] - F.ox) * F.u[0] + (d[1] - F.oz) * F.u[1], as = (S.sa0 + S.sa1) / 2, c = F.L / 2;
  // the stair's strip and foot, and the lane from the door to the foot
  return [[S.sa0 - c, S.bf - 0.2, S.sa1 - c, S.bTop + 0.3], [Math.min(as, ad) - 0.7 - c, 1.4, Math.max(as, ad) + 0.7 - c, 2.7], [ad - 0.7 - c, 0, ad + 0.7 - c, 2.7]];
}

/** A chest (xiang) with dark feet and a lid band, no iron. */
const chest = (P, w = 0.9, h = 0.5, d = 0.5, m = WD) => { P.add(m, box(-w / 2, 0.06, -d / 2, w / 2, h, d / 2)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(DK, box(sx * (w / 2 - 0.04) - 0.03, 0, sz * (d / 2 - 0.04) - 0.03, sx * (w / 2 - 0.04) + 0.03, 0.06, sz * (d / 2 - 0.04) + 0.03)); P.add(DK, box(-0.05, h - 0.18, -d / 2 - 0.012, 0.05, h - 0.06, -d / 2)); };

/** A cold brazier: a stone bowl on a foot. */
const brazier = (P) => { P.add('granite_grey', drum(0.24, 0.2, 0.1, 10, 0, 0, 0)); P.add('granite_grey', drum(0.2, 0.26, 0.2, 10, 0, 0.1, 0)); };

/** A lamp on a wooden stand with a dish of oil (1.3 high). */
const lampStand = (P, h = 1.3) => { P.add(WD, box(-0.02, 0, -0.02, 0.02, h, 0.02)); P.add(WD, box(-0.18, 0, -0.18, 0.18, 0.05, 0.18)); P.add(DK, drum(0.08, 0.06, 0.04, 8, 0, h, 0)); };

/** The ceiling slab of the ground room (its top the upper floor: yF), joists under it, the opening for the stair left out. */
export function floorSlab(A, a0, b0, a1, b1, yc, yF, S) {
  const { B } = A;
  if (!S) { B('timber', a0, b0, a1, b1, yc, yF, false); } else {
    const { sa0, sa1, bh0, bTop } = S;
    B('timber', a0, b0, a1, bh0, yc, yF, false);
    B('timber', a0, bTop, a1, b1, yc, yF, false);
    if (sa0 > a0 + 0.01) B('timber', a0, bh0, sa0, bTop, yc, yF, false);
    if (sa1 < a1 - 0.01) B('timber', sa1, bh0, a1, bTop, yc, yF, false);
    // the opening's edges: trimmers (a plank face down the hole's sides)
    for (const [x0, y0, x1, y1] of [[sa0, bh0, sa1, bh0], [sa0, bTop, sa1, bTop]]) void x0 + y0 + x1 + y1;
  }
  const n = Math.max(2, Math.round((a1 - a0) / 1.1));
  for (let k = 0; k <= n; k++) {
    const a = a0 + 0.12 + (a1 - a0 - 0.24) * k / n;
    if (S && a > S.sa0 - 0.08 && a < S.sa1 + 0.08) { B('wood_dark', a - 0.07, b0, a + 0.07, S.bh0, yc - 0.16, yc, false); B('wood_dark', a - 0.07, S.bTop, a + 0.07, b1, yc - 0.16, yc, false); }
    else B('wood_dark', a - 0.07, b0, a + 0.07, b1, yc - 0.16, yc, false);
  }
  B('wood_dark', a0, b0, a1, b0 + 0.14, yc - 0.2, yc, false);
}
/** A flat ceiling (boards over joists) at yc: the upper rooms' own, under the roof. */
export function ceilingAt(A, a0, b0, a1, b1, yc) {
  const { B } = A;
  B('timber', a0, b0, a1, b1, yc, yc + 0.08, false);
  const n = Math.max(2, Math.round((a1 - a0) / 1.1));
  for (let k = 0; k <= n; k++) { const a = a0 + 0.12 + (a1 - a0 - 0.24) * k / n; B('wood_dark', a - 0.07, b0, a + 0.07, b1, yc - 0.16, yc, false); }
  B('wood_dark', a0, b0, a1, b0 + 0.14, yc - 0.2, yc, false);
}

// ---- small helpers on the house's frame
/** A sloped bar between (a0..a1) × the points (bA, yA) and (bB, yB), th thick vertically (the stair's handrail, its string). */
function bar(A, mat, a0, a1, bA, yA, bB, yB, th, noTop = false) {
  const c = [A.W(a0, bA, yA), A.W(a1, bA, yA), A.W(a1, bB, yB), A.W(a0, bB, yB), A.W(a0, bA, yA + th), A.W(a1, bA, yA + th), A.W(a1, bB, yB + th), A.W(a0, bB, yB + th)];
  const cen = [0, 1, 2].map((k) => c.reduce((s, p) => s + p[k], 0) / 8);
  for (const f of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].filter((_, i) => !(noTop && i === 1))) {
    const pts = f.map((i) => c[i]), fc = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / 4);
    A.surf(mat, pts, [fc[0] - cen[0], fc[1] - cen[1], fc[2] - cen[2]]);
  }
}
/** A wall run along a (a0..a1) between b0 and b1, up from ya to yb, with openings [{ a0, a1, y0, y1 }] (y0 = ya: a doorway), solid for the walker. */
function wallA(A, mat, a0, a1, b0, b1, ya, yb, ops = [], cap = 2.6) {
  const { B, cRect } = A, o = [...ops].sort((p, q) => p.a0 - q.a0);
  let c = a0;
  const solid = (x0, x1) => { if (x1 - x0 < 0.02) return; B(mat, x0, b0, x1, b1, ya, yb); cRect(x0, b0, x1, b1, ya, Math.min(yb, ya + cap)); };
  for (const p of o) {
    solid(c, p.a0);
    if (p.y0 > ya + 0.01) { B(mat, p.a0, b0, p.a1, b1, ya, p.y0); cRect(p.a0, b0, p.a1, b1, ya, p.y0); }
    if (p.y1 < yb - 0.01) B(mat, p.a0, b0, p.a1, b1, p.y1, yb);
    c = p.a1;
  }
  solid(c, a1);
}
/** The same along b (a wall at a0..a1 from b0 to b1, openings in b). */
function wallB(A, mat, a0, a1, b0, b1, ya, yb, ops = [], cap = 2.6) {
  const { B, cRect } = A, o = [...ops].sort((p, q) => p.b0 - q.b0);
  let c = b0;
  const solid = (x0, x1) => { if (x1 - x0 < 0.02) return; B(mat, a0, x0, a1, x1, ya, yb); cRect(a0, x0, a1, x1, ya, Math.min(yb, ya + cap)); };
  for (const p of o) {
    solid(c, p.b0);
    if (p.y0 > ya + 0.01) { B(mat, a0, p.b0, a1, p.b1, ya, p.y0); cRect(a0, p.b0, a1, p.b1, ya, p.y0); }
    if (p.y1 < yb - 0.01) B(mat, a0, p.b0, a1, p.b1, p.y1, yb);
    c = p.b1;
  }
  solid(c, b1);
}

/** The stair: closed risers, treads with nosings, the open side's rail, the treads as floors; the walls beside it as obstacles. */
function buildStair(A, S, yTopRail) {
  const { B, cFloor, cRect, RB } = A, { n, r, t, sa0, sa1, bf, bTop, P0, yF, side } = S;
  const open = side === 'l' ? sa1 : sa0, wall = side === 'l' ? sa0 : sa1;
  void wall;
  for (let i = 0; i < n - 1; i++) {
    const b0 = bf + i * t, b1 = b0 + t, y = P0 + (i + 1) * r;
    B('wood_dark', sa0, b0, sa1, b1, P0, y - 0.045);
    B('timber', sa0, b0 - 0.03, sa1, b1, y - 0.045, y);
    cFloor(sa0, b0, sa1, b1, y);
  }
  // the string: a sloped board along the open side over the risers' ends, the posts and the handrail on it
  const yA = P0 + r, yB = P0 + (n - 1) * r, sd = side === 'l' ? [open - 0.05, open + 0.02] : [open - 0.02, open + 0.05];
  bar(A, 'wood_dark', sd[0], sd[1], bf, yA - 0.28, bTop + t, yB - 0.28, 0.3);
  const k0 = 1;
  for (let i = k0; i < n - 1; i += 2) { const b = bf + i * t + t / 2, y = P0 + (i + 1) * r; RB('lacquer_chestnut', open - 0.03, b - 0.03, open + 0.03, b + 0.03, y, y + 0.9); }
  bar(A, 'lacquer_chestnut', open - 0.045, open + 0.045, bf + k0 * t + t / 2, P0 + (k0 + 1) * r + 0.9, bTop - t / 2, yB + 0.9, 0.07, true);
  // the newel at the foot
  RB('lacquer_chestnut', open - 0.06, bf - 0.1, open + 0.06, bf + 0.02, P0, P0 + 1.12); RB('lacquer_chestnut', open - 0.08, bf - 0.12, open + 0.08, bf + 0.04, P0 + 1.12, P0 + 1.18);
  // colliders: the open side is a wall for the walker from the fourth tread on (the foot is open), through to the floor above and its rail
  const oa = side === 'l' ? [sa1, sa1 + 0.1] : [sa0 - 0.1, sa0];
  cRect(oa[0], bf + 3 * t, oa[1], bTop + 0.02, P0, yTopRail);
  // under the stair: the head end is closed (the mass of the risers)
}

/** The rail round the floor's opening: on the near end (street side of the hole) and, on the open side, the post line over the stair's own. */
function buildHoleRail(A, S) {
  const { cRect, RB } = A, { sa0, sa1, bh0, bTop, yF, side } = S;
  // the near end: posts, a top rail and a lower one across the opening's width
  const a0 = sa0, a1 = sa1, b = bh0 - 0.05;
  for (const a of [a0 + 0.04, (a0 + a1) / 2, a1 - 0.04]) RB('lacquer_chestnut', a - 0.035, b - 0.035, a + 0.035, b + 0.035, yF, yF + 0.95);
  RB('lacquer_chestnut', a0, b - 0.045, a1, b + 0.045, yF + 0.92, yF + 1.0); RB('lacquer_chestnut', a0, b - 0.03, a1, b + 0.03, yF + 0.45, yF + 0.5);
  cRect(a0, b - 0.06, a1, b + 0.06, yF, yF + 1.0);
  void bTop; void side;
}

// ---- furniture, in the centred frame of interiors.js
function makePut(A) {
  const S = new Parts(), L = A.L;
  const put = (build, a, b, yw = 0, up = 0, ...args) => { const Q = new Parts(); build(Q, ...args); Q.emit(S, a - L / 2, up, b, yw); };
  /** a collider for a piece: its box [a0, b0, a1, b1] up to h over the floor */
  const blk = (a0, b0, a1, b1, h) => A.cRect(a0, b0, a1, b1, A.yF, A.yF + h);
  return { S, put, blk };
}
const SPOTS = ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_grey'];
/** Stored goods stacked on the floor or on shelves, by the shop's trade (jars, sacks, bolts, boxes, bundles): returns nothing. */
function goods(P, trade, rand, n = 3) {
  const kind = { rice: 'sack', grain: 'sack', cloth: 'bolt', pawn: 'bolt', tea: 'jar', wine: 'jar', oil: 'jar', sweets: 'jar', medicine: 'box', books: 'box', paper: 'box', lanterns: 'box', iron: 'pan', rope: 'coil', noodles: 'sack', incense: 'box', pottery: 'jar' }[trade] || 'box';
  for (let k = 0; k < n; k++) {
    const x = (k - (n - 1) / 2) * 0.46, h = 0.36 + rand() * 0.2;
    if (kind === 'sack') { P.add('sacking', drum(0.2, 0.17, h * 1.5, 7, x, 0, 0)); P.add('rope_fibre', drum(0.175, 0.175, 0.02, 7, x, h * 1.3, 0)); }
    else if (kind === 'bolt') P.add(SPOTS[Math.floor(rand() * 6)], drum(0.11, 0.11, 0.5, 8, x, 0, 0));
    else if (kind === 'jar') P.add('pottery_dark', jar(0.17, 0.46, x, 0, 0));
    else if (kind === 'pan') { P.add('pottery_dark', box(x - 0.2, 0, -0.15, x + 0.2, 0.12, 0.15)); P.add('pottery_dark', box(x - 0.15, 0.12, -0.1, x + 0.15, 0.22, 0.1)); }
    else if (kind === 'coil') P.add('rope_fibre', drum(0.2, 0.2, 0.28, 8, x, 0, 0));
    else { P.add('wood_dark', box(x - 0.2, 0, -0.15, x + 0.2, 0.3, 0.15)); P.add('lacquer_red', box(x - 0.21, 0.3, -0.16, x + 0.21, 0.33, 0.16)); }
  }
}
const stackGoods = (put, trade, rand, a, b, yw, rows = 2, per = 3) => { for (let r = 0; r < rows; r++) put((Q) => goods(Q, trade, rand, per), a, b, yw, r * 0.5 > 0 ? 0 : 0); };
void stackGoods;

/** The balcony's colliders and the front wall of a two-storey house: a doorway to the balcony in some bays, open windows in the rest. */
function frontWall(A, S, R) {
  const { B, L, fb, nb, bayA, yF, yTop, wall, cRect, cFloor, r } = A;
  const bw = L / nb, b0 = -0.95;
  const doors = new Set(R.doors);
  for (let k = 0; k < nb; k++) {
    const a0 = bayA(k) + 0.14, a1 = bayA(k + 1) - 0.14, ac = (a0 + a1) / 2;
    if (doors.has(k)) {
      // the doorway to the balcony: leaves of lattice folded back against the posts, a transom over it
      const dw = Math.min(1.7, a1 - a0 - 0.2), d0 = ac - dw / 2, d1 = ac + dw / 2;
      wallA(A, wall, a0, a1, fb - 0.05, fb + 0.08, yF, yTop - 0.3, [{ a0: d0, a1: d1, y0: yF, y1: yF + 2.25 }]);
      B('timber', d0 - 0.04, fb - 0.07, d0, fb + 0.1, yF, yF + 2.3); B('timber', d1, fb - 0.07, d1 + 0.04, fb + 0.1, yF, yF + 2.3); B('timber', d0 - 0.04, fb - 0.07, d1 + 0.04, fb + 0.1, yF + 2.25, yF + 2.3);
      B('lattice', d0 + 0.02, fb + 0.08, d0 + 0.05, fb + 0.08 + dw / 2 - 0.06, yF + 0.05, yF + 2.2);
      B('lattice', d1 - 0.05, fb + 0.08, d1 - 0.02, fb + 0.08 + dw / 2 - 0.06, yF + 0.05, yF + 2.2);
      B('lattice_ice', d0, fb - 0.045, d1, fb + 0.02, yF + 2.32, yTop - 0.36);
    } else {
      // a window: the sill wall 0.9 high, the jambs, the open reveal with a swung-back lattice leaf, the lintel
      const ww = Math.min(1.5, a1 - a0 - 0.5), w0 = ac - ww / 2, w1 = ac + ww / 2, sill = yF + 0.9, head = yF + 2.15;
      wallA(A, wall, a0, a1, fb - 0.05, fb + 0.08, yF, yTop - 0.3, [{ a0: w0, a1: w1, y0: sill, y1: head }]);
      B('timber', w0 - 0.06, fb - 0.09, w1 + 0.06, fb + 0.11, sill - 0.05, sill); B('timber', w0 - 0.06, fb - 0.09, w1 + 0.06, fb + 0.11, head, head + 0.07);
      for (const a of [w0 - 0.04, w1]) B('timber', a, fb - 0.07, a + 0.04, fb + 0.09, sill, head);
      B('lattice', w0 + 0.0, fb + 0.08, w0 + 0.03, fb + 0.08 + ww / 2 - 0.02, sill + 0.03, head - 0.03);
      if (r() < 0.5) B('lattice', w1 - 0.03, fb + 0.08, w1, fb + 0.08 + ww / 2 - 0.02, sill + 0.03, head - 0.03);
      else B('lattice', w0 + ww / 2, fb - 0.045, w1, fb + 0.02, sill + 0.03, head - 0.03);
    }
  }
  // the balcony: its deck is a floor, its rail a wall, the ends too
  cFloor(0, b0, L, fb + 0.05, yF + 0.04);
  cRect(0, b0 - 0.02, L, b0 + 0.14, yF, yF + 1.05);
  cRect(-0.02, b0, 0.1, fb, yF, yF + 1.05); cRect(L - 0.1, b0, L + 0.02, fb, yF, yF + 1.05);
  void bw;
}

/** The back and side walls' inner colliders are the shell's own; the floor over the room, round the opening. */
function floorColliders(A, S, a0, b0, a1, b1) {
  const { cFloor, yF } = A, { sa0, sa1, bh0, bTop } = S;
  cFloor(a0, b0, a1, bh0, yF); cFloor(a0, bTop, a1, b1, yF);
  if (sa0 > a0 + 0.01) cFloor(a0, bh0, sa0, bTop, yF);
  if (sa1 < a1 - 0.01) cFloor(sa1, bh0, a1, bTop, yF);
}

/** A board partition along a (at b, 0.1 thick) up to the ceiling's joists, a doorway in it, a lattice transom over the boards. */
function partitionA(A, a0, a1, b, doorAt, doorW = 0.95, h = 2.2, yTopRoom = null) {
  const { yF } = A, top = yTopRoom ?? A.yTop - 0.55, ops = doorAt === null ? [] : [{ a0: doorAt - doorW / 2, a1: doorAt + doorW / 2, y0: yF, y1: yF + 2.0 }];
  wallA(A, 'timber', a0, a1, b - 0.05, b + 0.05, yF, yF + h, ops, h);
  A.B('lattice', a0, b - 0.03, a1, b + 0.03, yF + h, top);
  for (const p of ops) { A.B('wood_dark', p.a0 - 0.05, b - 0.07, p.a0, b + 0.07, yF, yF + 2.05); A.B('wood_dark', p.a1, b - 0.07, p.a1 + 0.05, b + 0.07, yF, yF + 2.05); A.B('wood_dark', p.a0 - 0.05, b - 0.07, p.a1 + 0.05, b + 0.07, yF + 2.0, yF + 2.05); }
}
function partitionB(A, a, b0, b1, doorAt, doorW = 0.95, h = 2.2, yTopRoom = null) {
  const { yF } = A, top = yTopRoom ?? A.yTop - 0.55, ops = doorAt === null ? [] : [{ b0: doorAt - doorW / 2, b1: doorAt + doorW / 2, y0: yF, y1: yF + 2.0 }];
  wallB(A, 'timber', a - 0.05, a + 0.05, b0, b1, yF, yF + h, ops, h);
  A.B('lattice', a - 0.03, b0, a + 0.03, b1, yF + h, top);
  for (const p of ops) { A.B('wood_dark', a - 0.07, p.b0 - 0.05, a + 0.07, p.b0, yF, yF + 2.05); A.B('wood_dark', a - 0.07, p.b1, a + 0.07, p.b1 + 0.05, yF, yF + 2.05); A.B('wood_dark', a - 0.07, p.b0 - 0.05, a + 0.07, p.b1 + 0.05, yF + 2.0, yF + 2.05); }
}

/**
 * The storey of a two-storey shop or a wine house: A is the shell's frame (houses.js), S the stair's layout. The stair is built, the floor
 * collided, the opening railed, the front's openings and the balcony made, the rooms partitioned and furnished.
 */
function twoStorey(A, S) {
  const { L, D, yF, yTop, fb, nb, bayA, type, trade } = A, r = A.r, bp = S.bTop + 1.05;
  const ia0 = 0.3, ia1 = L - 0.3, ib1 = D - 0.3, wine = type === 'wine';
  buildStair(A, S, yF + 1.0); buildHoleRail(A, S);
  floorColliders(A, S, ia0, fb, ia1, ib1);
  ceilingAt(A, ia0, fb, ia1, ib1, yTop - 0.3);
  // the front: the doorways to the balcony (every second bay at least; the wine house's booths all), windows in the others
  const doors = [];
  const ks = S.side === 'l' ? 0 : nb - 1;
  for (let k = 0; k < nb; k++) if (wine ? true : Math.abs(k - ks) % 2 === 0) doors.push(k);
  if (!doors.length) doors.push(nb - 1);
  frontWall(A, S, { doors });
  const { S: P, put, blk } = makePut(A);
  const free0 = S.side === 'l' ? S.sa1 + 0.15 : ia0, free1 = S.side === 'l' ? ia1 : S.sa0 - 0.15, ac = (free0 + free1) / 2;
  if (wine) {
    // the private rooms (ge zi): a booth in each bay but the stair's: board partitions from the front to the hall, a table with stools, a lantern, a scroll on the partition
    const bb = 4.7;                                           // the booths' depth: the hall behind them
    const k0 = S.side === 'l' ? 1 : 0, k1 = S.side === 'l' ? nb : nb - 1;
    for (let k = k0; k <= k1; k++) {
      const a = bayA(k);
      if ((k > k0 || S.side === 'r') && k < nb) partitionB(A, a, fb + 0.1, bb, null, 0.95, 2.1);
    }
    if (S.side === 'l') partitionB(A, S.sa1 + 0.1, S.bTop + 0.05, ib1 - 0.05, S.bTop + 0.7, 1.2);
    for (let k = k0; k < k1 + (S.side === 'l' ? 0 : 0); k++) {
      if (k >= nb) break;
      const a0 = bayA(k) + 0.08, a1 = bayA(k + 1) - 0.08, am = (a0 + a1) / 2, tb = 2.7;
      const ta = am - 0.5;                                    // (the table to one side: the way in from the hall runs along the other)
      put(table, ta, tb, 0, 0, 1.1, 1.1, 0.76, LQ); blk(ta - 0.55, tb - 0.55, ta + 0.55, tb + 0.55, 0.8);
      put(teaSet, ta, tb, r() * 0.6, 0.76, A.seed + k);
      for (const [dx, dz] of [[-0.8, 0], [0, 0.78], [0, -0.78]]) put(stool, ta + dx, tb + dz, 0, 0, r() < 0.5 ? WD : LQ, r() < 0.3);
      for (const [dx, dz] of [[-0.8, 0], [0, 0.78], [0, -0.78]]) blk(ta + dx - 0.18, tb + dz - 0.18, ta + dx + 0.18, tb + dz + 0.18, 0.45);
      put(lantern, ta, tb, 0, yTop - 0.3 - A.yF - 0.45, r() < 0.6 ? 'cloth_red' : 'cloth_ochre', 0.45);
      if (k > k0 || S.side === 'r') put(plumVase, a0 + 0.3, 1.0, 0, 0.0);
    }
    // the hall behind the booths: the serving table with jars and cups, tables and benches for the larger parties, jars along the back wall
    const hb = bb + 0.55;
    const hall0 = S.side === 'l' ? S.sa1 + 0.35 : ia0 + 0.3, hall1 = S.side === 'l' ? ia1 - 0.3 : S.sa0 - 0.35, hm = (hall0 + hall1) / 2;
    put((Q) => { Q.add(LQ, box(-1.4, 0, -0.3, 1.4, 0.95, 0.3)); Q.add(DK, box(-1.46, 0.95, -0.36, 1.46, 1.0, 0.36)); }, hm, ib1 - 0.45); blk(hm - 1.4, ib1 - 0.75, hm + 1.4, ib1 - 0.15, 1.0);
    for (let k = 0; k < 6; k++) put((Q) => { Q.add('pottery_dark', jar(0.17, 0.4, 0, 0, 0)); Q.add('cloth_red', ly([[0.1, 0.38], [0.11, 0.42], [0.05, 0.5], [0.001, 0.51]], 10)); }, hm - 1.15 + k * 0.46, ib1 - 0.45, 0, 1.0);
    for (let k = 0; k < 5; k++) put((Q) => Q.add('glaze_white', bowl(0, 0, 0, 0.8)), hm - 0.6 + k * 0.3, ib1 - 0.6, 0, 1.0);
    for (const ta of [hm - 1.7, hm + 1.7]) { put(table, ta, hb + 1.9, 0, 0, 1.8, 0.8, 0.76, LQ); blk(ta - 0.9, hb + 1.5, ta + 0.9, hb + 2.3, 0.8); for (const s of [-1, 1]) { put(bench, ta, hb + 1.9 + s * 0.7, 0, 0, 1.7); blk(ta - 0.85, hb + 1.9 + s * 0.7 - 0.14, ta + 0.85, hb + 1.9 + s * 0.7 + 0.14, 0.46); } put(crockery, ta - 0.3, hb + 1.9, 0, 0.76, A.seed + 9); }
    for (const a of [hm - 2.6, hm + 2.6]) put(lantern, a, hb + 1.9, 0, yTop - 0.3 - A.yF - 0.45, 'cloth_red', 0.45);
    put(screen, hm, ib1 - 1.5, 0, 0, 2.2, 1.6);
  } else {
    // the family's rooms: in the front room the table and chairs under the scroll on the partition, the writing table at the window; the back room: the bed, chests, the stock
    partitionA(A, ia0, ia1, bp, S.side === 'l' ? S.sa1 + 0.8 + (free1 - free0) * 0.3 : S.sa0 - 0.8 - (free1 - free0) * 0.3);
    const tb = 2.7;
    put(table, ac, tb, 0, 0, 1.4, 0.7, 0.8, LQ); blk(ac - 0.7, tb - 0.35, ac + 0.7, tb + 0.35, 0.8);
    put(teaSet, ac, tb, 0.3, 0.8, A.seed); put(chair, ac - 0.95, tb, Math.PI / 2, 0, LQ, true); put(chair, ac + 0.95, tb, -Math.PI / 2, 0, LQ, true);
    blk(ac - 1.2, tb - 0.25, ac - 0.7, tb + 0.25, 0.5); blk(ac + 0.7, tb - 0.25, ac + 1.2, tb + 0.25, 0.5);
    put((Q) => hanging(Q, 0.9, 1.6, A.seed + 3), ac, bp - 0.07, 0, 0.9);
    put(plumVase, ac + 1.1, bp - 0.4, 0, 0.0); put(table, ac + 1.1, bp - 0.4, 0, 0, 0.5, 0.4, 0.8, LQ); blk(ac + 0.85, bp - 0.6, ac + 1.35, bp - 0.2, 0.8);
    // at the window: the writing table with the account books and brush
    const wa = free1 - 0.9, wb = 1.35;
    put(table, wa, wb, 0, 0, 1.1, 0.55, 0.76, DK); blk(wa - 0.55, wb - 0.28, wa + 0.55, wb + 0.28, 0.8);
    put((Q) => { Q.add('cloth_indigo', box(-0.2, 0, -0.14, 0.2, 0.05, 0.14)); Q.add('paint_white', box(-0.19, 0.05, -0.13, 0.19, 0.09, 0.13)); Q.add('lacquer_black', box(0.28, 0, -0.06, 0.4, 0.05, 0.06)); Q.add(DK, box(-0.45, 0, -0.05, -0.3, 0.02, 0.05)); }, wa, wb, 0.2, 0.76);
    put(stool, wa, wb + 0.62, 0, 0, WD, false);
    put(lampStand, free1 - 0.3, bp - 0.45, 0, 0, 1.3);
    put(screen, free0 + 0.5, 4.3 < bp - 1.0 ? 4.3 : bp - 1.0, Math.PI / 2, 0, 1.8, 1.5);
    // the back room
    const bk0 = bp + 0.55, rb1 = ib1;
    put(bed, ia1 - 1.25, rb1 - 0.75, Math.PI, 0, 2.0, 1.2); blk(ia1 - 2.25, rb1 - 1.35, ia1 - 0.25, rb1 - 0.15, 0.55);
    put(chest, ia1 - 1.25, rb1 - 1.75, 0, 0, 0.9, 0.5, 0.5); blk(ia1 - 1.7, rb1 - 2.0, ia1 - 0.8, rb1 - 1.5, 0.5);
    put(chest, ia0 + 0.5, rb1 - 0.4, 0, 0, 0.9, 0.5, 0.5); blk(ia0 + 0.05, rb1 - 0.65, ia0 + 0.95, rb1 - 0.15, 0.5);
    // the store: shelves of the shop's goods along the side wall and sacks, jars or bolts stood on the floor
    const sa = S.side === 'l' ? ia1 - 0.2 : ia0 + 0.2;
    void sa; void bk0;
    for (let k = 0; k < 2; k++) { const a = ia0 + 1.6 + k * 1.6; put((Q) => { const ys = shelves(Q, 1.4, 0.4, 1.8); for (const yy of [0, ...ys.slice(0, 3)]) goods(Q, trade, r, 3); void yy0; }, a, rb1 - 0.25, Math.PI); blk(a - 0.7, rb1 - 0.5, a + 0.7, rb1, 1.8); }
  }
  P.emit(A.bag, A.o[0], yF, A.o[1], A.yaw);
}
const yy0 = 0;
void yy0;

/** The storey of a loft: the stair's hole railed, the loft floor collided, the lining of the roof, the stored goods and a bed. */
function loft(A, S) {
  const { L, D, yF, fb, r } = A, ia0 = 0.3, ia1 = L - 0.3, ib0 = A.house ? 0.33 : fb + 0.08, ib1 = D - 0.3;
  buildStair(A, S, yF + 1.0); buildHoleRail(A, S);
  floorColliders(A, S, ia0, ib0, ia1, ib1);
  A.lining();
  const { S: P, put, blk } = makePut(A);
  const free0 = S.side === 'l' ? S.sa1 + 0.15 : ia0, free1 = S.side === 'l' ? ia1 : S.sa0 - 0.15, ac = (free0 + free1) / 2;
  const mid = A.ridgeB;     // the loft's walkable strip is about the ridge, b = mid ± 1.8
  const bedA = S.side === 'l' ? ia1 - 1.3 : ia0 + 1.3;
  put(bed, bedA, mid + 1.2, Math.PI, 0, 2.0, 1.2); blk(bedA - 1.0, mid + 0.6, bedA + 1.0, mid + 1.8, 0.55);
  put(chest, bedA, mid - 0.15, 0, 0, 0.9, 0.5, 0.5); blk(bedA - 0.45, mid - 0.4, bedA + 0.45, mid + 0.1, 0.5);
  put(lampStand, ac, mid - 1.6 > ib0 + 0.4 ? mid - 1.5 : mid + 1.7, 0, 0, 1.3);
  // the stock: rows of the trade's goods along the knee walls, front and back (low, under the slope)
  for (let k = 0; k < Math.max(2, Math.floor((free1 - free0) / 1.3)); k++) {
    const a = free0 + 0.6 + k * 1.3;
    if (a > free1 - 0.3) break;
    put((Q) => goods(Q, A.trade, r, 3), a, ib1 - 0.35, 0, 0);
    if (k % 2 === 0) put((Q) => goods(Q, A.trade, r, 2), a, ib0 + 0.45, Math.PI, 0);
  }
  P.emit(A.bag, A.o[0], yF, A.o[1], A.yaw);
}

export function innRooms(L, gA, gB) {
  const wing = (a0, a1) => { const n = Math.max(1, Math.round((a1 - a0) / 3.3)); return Array.from({ length: n }, (_, k) => [a0 + (a1 - a0) * k / n, a0 + (a1 - a0) * (k + 1) / n]); };
  return [...wing(0, gA), [gA, gB], ...wing(gB, L)];
}
/**
 * The inn's upper storey over the front range: guest rooms across the front with a window and a door to the balcony each, a door
 * on the gallery behind; the gallery over the court on posts, the court's stair up to it. Walls, floors and colliders.
 */
function inn(A, S) {
  const { L, D, yF, yTop, fh, gA, gB, r, P0 } = A, th = 0.3;
  const ib0 = th, ib1 = fh - th;
  // rooms: the left wing, the gate chamber over the passage, the right wing
  const rooms = innRooms(L, gA, gB);
  const bounds = [...new Set(rooms.flatMap(([x, y]) => [x, y]))];
  // the walls: front (windows and the doors to the balcony), rear (the doors to the gallery), sides, the partitions between the rooms
  const fOps = [], rOps = [];
  rooms.forEach(([a0, a1], k) => {
    const lo = Math.max(a0, th), hi = Math.min(a1, L - th), am = (lo + hi) / 2;
    const dwF = 0.95, wwF = Math.min(1.1, (hi - lo) - dwF - 0.7);
    const doorLeft = k % 2 === 0;
    const dF = doorLeft ? lo + 0.35 + dwF / 2 : hi - 0.35 - dwF / 2, wF = doorLeft ? hi - 0.3 - wwF / 2 : lo + 0.3 + wwF / 2;
    fOps.push({ a0: dF - dwF / 2, a1: dF + dwF / 2, y0: yF, y1: yF + 2.05 }, { a0: wF - wwF / 2, a1: wF + wwF / 2, y0: yF + 0.85, y1: yF + 2.15 });
    const rd = k === rooms.findIndex((q) => q[0] === gA) ? am : (k % 2 === 1 ? hi - 0.85 : lo + 0.85);     // (the door on the side away from the bed)
    rOps.push({ a0: rd - 0.5, a1: rd + 0.5, y0: yF, y1: yF + 2.05 });
    rooms[k].door = dF; rooms[k].win = wF; rooms[k].ww = wwF;
  });
  const top = yTop - 0.3;
  wallA(A, A.wall, 0, L, 0, th, yF, top, fOps);
  wallA(A, A.wall, 0, L, fh - th, fh, yF, top, rOps);
  wallB(A, A.wall, 0, th, th, fh - th, yF, top, []); wallB(A, A.wall, L - th, L, th, fh - th, yF, top, []);
  for (const b of bounds) if (b > th + 0.5 && b < L - th - 0.5) partitionB(A, b, th, fh - th, null, 0.95, 2.3, top - 0.1);
  // the front's reveals: sills, heads, the door's frame and its leaves folded back, the window's leaf swung in
  rooms.forEach((rm) => {
    const wF = rm.win, wwF = rm.ww, dF = rm.door;
    A.B('timber', wF - wwF / 2 - 0.05, -0.06, wF + wwF / 2 + 0.05, th + 0.04, yF + 0.8, yF + 0.85); A.B('timber', wF - wwF / 2 - 0.05, -0.06, wF + wwF / 2 + 0.05, th + 0.04, yF + 2.15, yF + 2.22);
    A.B('lattice', wF - wwF / 2, th, wF - wwF / 2 + 0.03, th + wwF / 2, yF + 0.88, yF + 2.1);
    A.B('timber', dF - 0.52, -0.06, dF - 0.47, th + 0.04, yF, yF + 2.1); A.B('timber', dF + 0.47, -0.06, dF + 0.52, th + 0.04, yF, yF + 2.1); A.B('timber', dF - 0.52, -0.06, dF + 0.52, th + 0.04, yF + 2.05, yF + 2.12);
    A.B('lattice', dF - 0.47, th, dF - 0.44, th + 0.45, yF + 0.05, yF + 2.0);
  });
  // the floor: the wings' and the chamber's boards (the passage's soffit under the chamber), the ceiling
  A.B('timber', gA, 0, gB, fh, yF - 0.2, yF, false);
  for (const [a0, a1] of rooms) A.cFloor(Math.max(a0, th), ib0, Math.min(a1, L - th), ib1, yF);
  ceilingAt(A, th, th, L - th, fh - th, top);
  // the balcony in front: floor and rail as walls for the walker (the shell's deck and rail), the ends closed
  A.cFloor(0, -0.9, L, 0.0, yF + 0.04);
  A.cRect(0, -0.92, L, -0.76, yF, yF + 1.05); A.cRect(-0.02, -0.9, 0.12, 0, yF, yF + 1.05); A.cRect(L - 0.12, -0.9, L + 0.02, 0, yF, yF + 1.05);
  for (const a of [0.06, L - 0.06]) A.RB('lacquer_chestnut', a - 0.06, -0.9, a + 0.06, 0, yF + 0.04, yF + 1.02, true);
  // the gallery over the court (b: fh … fh + 1.05) on posts from the court's floor, its rail; the stair up from the court along it
  const g0 = fh, g1 = fh + 1.05, GA0 = th, GA1 = L - th, cy = 0.05;
  A.B('timber', GA0, g0, GA1, g1, yF - 0.22, yF, false);
  { let m = Math.round((GA1 - GA0) / 2.4); if (m % 2 === 0) m++;          // (an odd number of bays: no post in the passage's line)
    for (let k = 0; k <= m; k++) { const a = GA0 + 0.15 + (GA1 - GA0 - 0.3) * k / m; A.B('timber', a - 0.1, g1 - 0.2, a + 0.1, g1 - 0.0, cy, yF - 0.22); A.cCircle(a, g1 - 0.1, 0.12, cy, yF - 0.22); } }
  A.B('timber', GA0, g1 - 0.22, GA1, g1, yF - 0.42, yF - 0.22);
  const aT0 = S.aTop, dir0 = S.dir, R0 = dir0 > 0 ? aT0 : GA0, R1 = dir0 > 0 ? GA1 : aT0;       // (the rail runs along the gallery except where the stair's platform joins it)
  for (let a = R0 + 0.1; a < R1; a += 0.9) A.RB('lacquer_chestnut', a - 0.035, g1 - 0.1, a + 0.035, g1 - 0.03, yF, yF + 0.98);
  A.RB('lacquer_chestnut', R0, g1 - 0.12, R1, g1 - 0.01, yF + 0.94, yF + 1.02); A.RB('lacquer_chestnut', R0, g1 - 0.1, R1, g1 - 0.03, yF + 0.45, yF + 0.5);
  A.cFloor(GA0, g0, GA1, g1, yF); A.cRect(R0, g1 - 0.1, R1, g1, yF, yF + 1.05);
  // the stair: along the gallery's outer side, from the court's floor up toward the wall; the platform at its head joins the gallery
  const sb0 = g1 + 0.1, sb1 = sb0 + SW, n = S.n, rr = (yF - cy) / n, t = 0.24, aT = S.aTop;
  const dir = S.dir, foot = aT + dir * (n - 1) * t;
  for (let i = 0; i < n - 1; i++) {
    const a0 = foot - dir * i * t, a1 = a0 - dir * t, y = cy + (i + 1) * rr;
    A.B('wood_dark', Math.min(a0, a1), sb0, Math.max(a0, a1), sb1, cy, y - 0.045); A.B('timber', Math.min(a0, a1) - (dir > 0 ? 0 : 0.03), sb0, Math.max(a0, a1) + (dir > 0 ? 0.03 : 0), sb1, y - 0.045, y);
    A.cFloor(Math.min(a0, a1), sb0, Math.max(a0, a1), sb1, y);
  }
  const pa0 = Math.min(aT, aT - dir * 0.1), platform = dir > 0 ? [aT - 0.0, g0, aT + 0.0, g1 + 1.2] : null;
  void pa0; void platform;
  // the head's platform: from the top tread to the side wall, level with the gallery
  const pl0 = dir > 0 ? GA0 : aT, pl1 = dir > 0 ? aT : GA1;
  A.B('timber', pl0, g1, pl1, sb1, yF - 0.22, yF, false); A.cFloor(pl0, g1, pl1, sb1, yF);
  A.RB('lacquer_chestnut', pl0, sb1 - 0.12, pl1, sb1 - 0.01, yF + 0.94, yF + 1.02); A.RB('lacquer_chestnut', pl0, sb1 - 0.1, pl1, sb1 - 0.03, yF + 0.45, yF + 0.5);
  for (let a = pl0 + 0.1; a < pl1; a += 0.9) A.RB('lacquer_chestnut', a - 0.035, sb1 - 0.1, a + 0.035, sb1 - 0.03, yF, yF + 0.98);
  A.cRect(pl0, sb1, pl1, sb1 + 0.1, cy, yF + 1.05); A.cRect(dir > 0 ? GA0 - 0.1 : GA1, g1, dir > 0 ? GA0 : GA1 + 0.1, sb1, cy, yF + 1.05);
  // the stair's outer rail (a wall for the walker beside it), the inner side to the gallery
  const aLo = Math.min(foot + dir * t, aT), aHi = Math.max(foot + dir * t, aT);
  A.cRect(aLo, sb1, aHi, sb1 + 0.1, cy, yF + 1.0); A.cRect(aLo + 0.5, sb0 - 0.1, aHi, sb0, cy, yF + 1.0);
  for (let i = 0; i < n - 1; i += 2) { const a = foot - dir * i * t - dir * t / 2, y = cy + (i + 1) * rr; A.RB('lacquer_chestnut', a - 0.03, sb1 - 0.05, a + 0.03, sb1 + 0.01, y, y + 0.9); }
  {
    const aA = foot - dir * 0.5 * t, aB = aT + dir * 0.0, c = [A.W(aA, sb1 - 0.05, cy + rr + 0.9), A.W(aA, sb1 + 0.02, cy + rr + 0.9), A.W(aB, sb1 + 0.02, yF - rr + 0.9), A.W(aB, sb1 - 0.05, yF - rr + 0.9)];
    A.surf('lacquer_chestnut', c, [0, 1, 0]); A.surf('lacquer_chestnut', [c[3], c[2], c[1], c[0]].map((p) => [p[0], p[1] - 0.06, p[2]]), [0, -1, 0]);
    A.surf('lacquer_chestnut', [c[0], c[1], c[1], c[0]].map((p, k) => [p[0], p[1] - (k > 1 ? 0.06 : 0), p[2]]), [0, 0, 1]);
  }
  // ---- the rooms' furniture
  const { S: P, put, blk } = makePut(A);
  rooms.forEach(([a0, a1], k) => {
    const lo = Math.max(a0, th) + 0.05, hi = Math.min(a1, L - th) - 0.05, am = (lo + hi) / 2, w = hi - lo;
    const bedLeft = k % 2 === 1;                                  // the bed against the wall away from the front door
    const ba = bedLeft ? lo + 0.75 : hi - 0.75;
    if (k === rooms.findIndex((q) => q[0] === gA)) {
      // the chamber over the gate: the keeper's: a desk with the ledger, a chair, a chest, the lamp
      put(table, am, 2.2, 0, 0, 1.4, 0.7, 0.8, LQ); blk(am - 0.7, 1.85, am + 0.7, 2.55, 0.8);
      put(chair, am, 2.95, Math.PI, 0, LQ, true); blk(am - 0.25, 2.7, am + 0.25, 3.2, 0.62);
      put(chest, lo + 0.5, fh - 1.0, 0, 0, 0.9, 0.5, 0.5); blk(lo + 0.05, fh - 1.25, lo + 0.95, fh - 0.75, 0.62);
      put((Q) => hanging(Q, 0.8, 1.4, A.seed + k), am, fh - 0.36, Math.PI, 0.9);
      put(lampStand, hi - 0.35, 3.0, 0, 0, 1.3);
      return;
    }
    put(bed, ba, fh - 2.3, Math.PI / 2, 0, 2.0, 1.2); blk(ba - 0.65, fh - 3.3, ba + 0.65, fh - 1.3, 0.62);
    put(chest, ba, fh - 0.95, 0, 0, 0.8, 0.45, 0.45); blk(ba - 0.4, fh - 1.2, ba + 0.4, fh - 0.7, 0.62);
    const ta = bedLeft ? hi - 0.75 : lo + 0.75;
    put(table, ta, 1.6, 0, 0, 0.9, 0.6, 0.76, LQ); blk(ta - 0.45, 1.3, ta + 0.45, 1.9, 0.8);
    put(teaSet, ta, 1.6, r() * 0.6, 0.76, A.seed + k);
    put(stool, ta, 2.2, 0, 0, WD, false); put(stool, ta + (bedLeft ? -0.6 : 0.6), 1.6, 0, 0, WD, true);
    put(lantern, am, 3.0, 0, yTop - 0.3 - yF - 0.4, k % 2 ? 'cloth_ochre' : 'cloth_red', 0.4);
    put(brazier, bedLeft ? lo + 0.45 : hi - 0.45, 3.6, 0, 0, false); blk((bedLeft ? lo + 0.2 : hi - 0.7), 3.35, (bedLeft ? lo + 0.7 : hi - 0.2), 3.85, 0.35);
    put((Q) => hanging(Q, 0.5, 1.1, A.seed + k), ba, ib0 + 0.05, 0, 1.0);
  });
  // the gallery's lanterns, a bench and a jar of water at the court's stair
  for (let k = 0; k < rooms.length; k++) { const am = (rooms[k][0] + rooms[k][1]) / 2; if (Math.abs(am - aT) > 1) put(lantern, am, fh + 0.7, 0, yTop - 0.3 - yF - 0.38, k % 2 ? 'cloth_red' : 'cloth_ochre', 0.4); }
  put(bench, (gA + gB) / 2 - 2.5, fh + 0.6, Math.PI, 0, 1.6); blk((gA + gB) / 2 - 3.3, fh + 0.4, (gA + gB) / 2 - 1.7, fh + 0.8, 0.46);
  P.emit(A.bag, A.o[0], yF, A.o[1], A.yaw);
  void P0; void DK; void couch; void chair; void drum;
}

/** The storey: A is the shell's frame, S the stair's layout (shop2, wine, loft, house) or the inn's. */
export function upperStorey(A, S) {
  if (A.type === 'inn') inn(A, S);
  else if (A.type === 'loft' || A.type === 'house') loft(A, S);
  else twoStorey(A, S);
}

// ---- the routes walk-check follows (plan.walks): from the street through the door, up the stair, into an upper room, out on the balcony
/** World waypoints [x, z] of the lot's climb; null for none. */
export function walkOf(l) {
  const sp = upperOf(l);
  if (!sp) return null;
  const F = frameOf(l), W = F.W, d = doorOf(l).at, ad = (d[0] - F.ox) * F.u[0] + (d[1] - F.oz) * F.u[1];
  if (sp.type === 'inn') {
    const fh = 7.6, gA = F.L / 2 - 1.8, gB = F.L / 2 + 1.8, rooms = innRooms(F.L, gA, gB), n = Math.round((0.28 + 3.5 - 0.05) / 0.2), aT = F.L - 1.6, foot = aT - (n - 1) * 0.24, sb = fh + 1.65;
    const kk = rooms.length - 1, rm = rooms[kk], lo = Math.max(rm[0], 0.3) + 0.05, hi = Math.min(rm[1], F.L - 0.3) - 0.05, am = kk % 2 === 1 ? hi - 0.85 : lo + 0.85;
    const r = [W(F.L / 2, -6), W(F.L / 2, fh + 3.4), W(foot - 0.3, fh + 3.4), W(foot - 0.3, sb), W(foot + 0.6, sb)];
    for (let i = 4; i < n - 1; i += 4) r.push(W(foot + i * 0.24 + 0.12, sb));
    r.push(W(aT + 0.65, sb), W(aT + 0.65, fh + 0.15), W(am, fh + 0.15), W(am, fh - 1.6), W(am, fh + 0.15));
    return r;
  }
  const S = layoutOfLot(l, sp), as = (S.sa0 + S.sa1) / 2, route = [W(ad, -6), W(ad, 1.9), W(as, 1.95)], sg = S.side === 'l' ? 1 : -1;
  for (let i = 4; i < S.n - 1; i += 4) route.push(W(as, S.bf + i * S.t + S.t / 2));
  route.push(W(as, S.bTop + 0.4));
  if (sp.type === 'loft' || sp.type === 'house') route.push(W(as, S.bTop + 1.2), W(as + sg * 2.2, S.bTop + 1.2));
  else if (sp.type === 'shop2') {
    // the front room along the stair's side to the balcony's doorway, then back and through the partition into the back room
    const free0 = S.side === 'l' ? S.sa1 + 0.15 : 0.3, free1 = S.side === 'l' ? F.L - 0.3 : S.sa0 - 0.15, pd = S.side === 'l' ? S.sa1 + 0.8 + (free1 - free0) * 0.3 : S.sa0 - 0.8 - (free1 - free0) * 0.3;
    route.push(W(as + sg * 1.1, S.bTop + 0.4), W(as + sg * 1.1, 0.9), W(as + sg * 1.1, -0.6), W(as + sg * 1.1, 0.9), W(as + sg * 1.1, S.bTop + 0.4), W(pd, S.bTop + 0.4), W(pd, S.bTop + 2.2));
  } else if (sp.type === 'wine') {
    // across the hall behind the booths to the first booth's way in, up its side to the balcony and back
    const nb = l.bays, bw = F.L / nb, k = S.side === 'l' ? 1 : nb - 2, am = (k + 0.5) * bw, la = am + 0.5;
    route.push(W(la, S.bTop + 0.4), W(la, 4.9), W(la, 0.9), W(am, 0.2), W(am, -0.6), W(am, 0.2), W(la, 0.9), W(la, 4.9));
  }
  return route;
}
