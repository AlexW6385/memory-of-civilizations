// The town houses of Versailles about 1690 (docs/settlements/versailles.md §5, "The town's fabric"): terraced
// houses that touch party wall to party wall along the avenues and streets — a stone ground storey, the upper
// storeys of brick with stone chains and surrounds or of pale plaster, tall casements with small panes, iron
// balconies at the first floor, a stone cornice, a broken (mansard) slate roof with dormers and brick stacks at
// the party walls. The ground storey by kind: a shop (the opening with its stall board let down and its upper
// shutter raised, the goods and the hanging sign of its trade), a house (door, barred windows), a hotel (the
// porte-cochère). An `open` house is furnished inside (interiors.js). { rect, y, foot, storeys, front ('n'|'s'),
// kind, trade, use, open, seed, simple }. Local frame: u along the front, v in from it.

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { furnish } from './interiors.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

const WALLS = ['brick', 'brick', 'brick', 'plaster_white', 'stucco_pale', 'stucco_cream', 'brick_grey', 'limestone'];
const SHUT = ['shutter_grey', 'shutter_green', 'shutter_brown'];
const BOARD = ['paint_blue', 'cloth_red', 'paint_ochre', 'shutter_green', 'paint_white'];
export const ST0 = 3.7;                         // the ground storey's height
const ST = [3.9, 3.4, 3.1];                     // the storeys above
const RP = [[-0.3, 0], [1.9, 3.4], null, null, [0, 0]];   // (the mansard's profile, built in roof())

/** The extruded roof along x: the broken slate profile over depth D. */
function roofPrism(x0, x1, z0, D, ye, o) {
  const pts = [[-o, 0], [1.9, 3.4], [D / 2, 4.7], [D - 1.9, 3.4], [D + o, 0]];
  const t = [];
  const V = (x, p) => [x, ye + p[1], z0 + p[0]];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    t.push(...V(x0, a), ...V(x1, a), ...V(x1, b), ...V(x0, a), ...V(x1, b), ...V(x0, b));
  }
  for (let i = 1; i < pts.length - 1; i++) { t.push(...V(x0, pts[0]), ...V(x0, pts[i]), ...V(x0, pts[i + 1])); t.push(...V(x1, pts[0]), ...V(x1, pts[i + 1]), ...V(x1, pts[i])); }
  return fromTriangles(orientOutward(t));
}
const slopeY = (t) => (t + 0.3) * (3.4 / 2.2);   // the mansard's lower slope at t m in from the front line

export function townHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, f = el.front || 'n';
  const simple = !!el.simple, OPEN = !!el.open, kind = el.kind ?? 'house';
  const L = x1 - x0, D = z1 - z0, n = el.storeys ?? 3, T = 0.35;
  const hotel = kind === 'hotel';
  const stHt = (s) => (s === 0 ? ST0 : ST[Math.min(s - 1, ST.length - 1)] + (hotel && s === 1 ? 0.5 : 0));
  const sy = [0]; for (let s = 0; s < n; s++) sy.push(sy[s] + stHt(s));      // storey s from sy[s] to sy[s+1]
  const H = sy[n];
  const wall = hotel ? 'limestone' : pick(rand, WALLS), brickish = wall === 'brick' || wall === 'brick_grey', trim = 'limestone', shut = pick(rand, SHUT);
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
  const rectOf = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => { const r = rectOf(u0, v0, u1, v1); bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const W3 = (u, v, yy) => { const p = P(u, v); return [p[0], yy, p[1]]; };
  const Rd = (mat, a, b, r, seg = 6) => bag.add(mat, rod(W3(...a), W3(...b), r, seg));
  const Lt = (mat, prof, u, v, ya, seg = 10) => { const p = P(u, v); bag.add(mat, lathe(prof, seg, null, p[0], ya, p[1])); };
  const fy = y + 0.14;                                                      // an open house's floor
  const FP = f === 's' ? 1 : -1;                                            // (unused sign kept for clarity)
  void FP; void RP;

  // ── the openings of the ground storey (u centre, width, height, type) ─────────────────────────────
  const ops = [];
  let door = 0, shopOp = null;
  if (kind === 'shop') {
    const sw = Math.max(3, Math.min(4.8, L * 0.5)), left = rand() < 0.5, su = left ? L * 0.3 : L * 0.7, du = left ? L * 0.82 : L * 0.18;
    shopOp = { u: su, w: sw, h: 2.95, type: 'shop' }; ops.push(shopOp);
    door = du; ops.push({ u: du, w: 1.35, h: 2.7, type: 'door' });
  } else if (hotel) {
    door = L / 2; ops.push({ u: L / 2, w: 3.3, h: 3.2, type: 'cochere' });
    for (const k of [-1, 1]) for (const d of [4.4, 6.6]) if (L / 2 + d < L - 1.2) ops.push({ u: L / 2 + k * d, w: 1.1, h: 2.0, type: 'win' });
  } else {
    const left = rand() < 0.5, du = left ? 1.3 + rand() * 0.6 : L - 1.3 - rand() * 0.6;
    door = du; ops.push({ u: du, w: 1.3, h: 2.6, type: 'door' });
    const wins = Math.max(1, Math.round(L / 3) - 1);
    for (let k = 0; k < wins; k++) { const u = left ? 3.3 + k * 2.7 : L - 3.3 - k * 2.7; if (u > 1.0 && u < L - 1.0 && Math.abs(u - du) > 1.9) ops.push({ u, w: 0.95, h: 1.55, type: 'win' }); }
  }
  ops.sort((a, b) => a.u - b.u);

  // ── the body ─────────────────────────────────────────────────────────────────────────────────────
  // below: the stone of the ground storey (an open house's walls are built about its room, the rest is solid)
  if (!OPEN) {
    bag.add(trim, box(x0, foot - 0.6, z0, x1, y + ST0, z1));
    col.rect(el.rect, foot - 0.6, y + H);
  } else {
    // the three walls of the room, the front in piers between the openings
    B(trim, 0, D - T, L, D, y - 0.3, y + ST0, true); B(trim, 0, T, T, D - T, y - 0.3, y + ST0, true); B(trim, L - T, T, L, D - T, y - 0.3, y + ST0, true);
    let u = 0;
    for (const o of ops) {
      const a = o.u - o.w / 2, b = o.u + o.w / 2;
      if (a > u) B(trim, u, 0, a, T, y - 0.3, y + ST0, true);
      B(trim, a, 0, b, T, y + o.h, y + ST0, true);                              // over it
      if (o.type === 'shop' || o.type === 'win') B(trim, a, 0, b, T, y - 0.3, y + (o.type === 'shop' ? 0.95 : 1.0), true);  // the stall riser, the sill
      u = b;
    }
    if (u < L) B(trim, u, 0, L, T, y - 0.3, y + ST0, true);
    col.rect(el.rect, y + ST0, y + ST0 + 0.3);
    // the floor of the ground storey, the ceiling
    B(el.use === 'hotel' ? 'marble_floor' : 'flagstone', T, T, L - T, D - T, y + 0.02, fy);
    col.floor(rectOf(0, 0, L, D), fy);
    B('plaster_white', T, T, L - T, D - T, y + ST0 - 0.06, y + ST0 - 0.02);
    for (let v = T + 0.6; v < D - T; v += 0.85) B('wood_dark', T, v - 0.1, L - T, v + 0.1, y + ST0 - 0.3, y + ST0 - 0.06);
    // the first floor and above as one block over the room
    bag.add(wall, box(x0, y + ST0, z0, x1, y + H, z1));
  }
  if (!OPEN) bag.add(wall, box(x0, y + ST0, z0, x1, y + H, z1));
  // the ground storey's stone face, with bands of rustication on the street front
  const bandH = 0.5;
  if (!simple && !hotel) for (let yy = 0.9; yy < ST0 - 0.4; yy += bandH * 2) B(trim, -0.01, -0.05, L + 0.01, 0.0, y + yy, y + yy + 0.03);

  // ── the street front ─────────────────────────────────────────────────────────────────────────────
  // string courses at the floors, the chain at the ends, the cornice
  for (let s = 1; s < n; s++) if (!simple) B(trim, -0.02, -0.1, L + 0.02, 0.0, y + sy[s] - 0.1, y + sy[s] + 0.12);
  if (!simple) { for (const [a, b] of [[0, 0.5], [L - 0.5, L]]) B(trim, a, -0.05, b, 0.0, y + ST0, y + H - 0.2); }
  B(trim, -0.02, -0.5, L + 0.02, 0.1, y + H - 0.3, y + H);                           // the cornice
  if (!simple) for (let u = 0.4; u < L - 0.2; u += 0.8) B(trim, u, -0.4, u + 0.2, -0.1, y + H - 0.5, y + H - 0.3);   // its modillions

  // the ground openings
  const board = pick(rand, BOARD);
  for (const o of ops) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    if (simple) { if (o.type !== 'win') B('opening', a, -0.01, b, 0.04, y + 0.1, y + o.h); continue; }
    const yb = o.type === 'win' ? y + 1.0 : o.type === 'shop' ? y + 0.95 : y + 0.1;
    // the surround: jambs, the lintel with its keystone, a sill
    B(trim, a - 0.25, -0.08, a, 0.04, yb - 0.05, y + o.h + 0.3); B(trim, b, -0.08, b + 0.25, 0.04, yb - 0.05, y + o.h + 0.3);
    B(trim, a - 0.25, -0.08, b + 0.25, 0.04, y + o.h, y + o.h + 0.34);
    B(trim, o.u - 0.2, -0.16, o.u + 0.2, 0.04, y + o.h - 0.1, y + o.h + 0.42);
    if (o.type === 'win') B(trim, a - 0.3, -0.18, b + 0.3, 0.04, yb - 0.14, yb - 0.04);
    if (OPEN) {
      if (o.type === 'door') {
        B(trim, o.u - 1.0, -0.6, o.u + 1.0, 0.02, y + 0.0, y + 0.1);                                  // the step
        B('wood_dark', a + 0.02, T, a + 0.1, T + o.w - 0.06, fy, y + o.h - 0.05);                      // the leaf, open inside
      } else if (o.type === 'cochere') {
        B('wood_dark', a + 0.02, T, a + 0.12, T + o.w / 2, fy, y + o.h - 0.05); B('wood_dark', b - 0.12, T, b - 0.02, T + o.w / 2, fy, y + o.h - 0.05);
      } else if (o.type === 'win') { B('opening', a, 0.0, b, 0.05, yb, y + o.h); for (const g of [0.25, 0.5, 0.75]) B('iron', a + (b - a) * g - 0.015, 0.06, a + (b - a) * g + 0.015, 0.09, yb, y + o.h); }
      else for (const g of [1.4]) void g;
    } else if (o.type === 'door') {
      B(trim, o.u - 0.95, -0.55, o.u + 0.95, 0.02, y + 0.0, y + 0.1);
      B('opening', a, 0.0, b, 0.06, y + 0.1, y + o.h);
      B('wood_dark', a + 0.03, 0.04, b - 0.03, 0.12, y + 0.1, y + o.h - 0.04);
      for (const [pa, pb, ya, yb2] of [[0.1, 0.45, 0.35, 1.35], [0.55, 0.9, 0.35, 1.35], [0.1, 0.45, 1.5, 2.45], [0.55, 0.9, 1.5, 2.45]]) B('shutter_brown', a + o.w * pa, 0.11, a + o.w * pb, 0.15, y + ya, y + yb2);
      B('iron', a + o.w * 0.5 - 0.02, 0.12, a + o.w * 0.5 + 0.02, 0.16, y + 1.0, y + 1.3);
    } else if (o.type === 'cochere') {
      B('opening', a, 0.0, b, 0.06, y + 0.1, y + o.h);
      for (const [ua, ub] of [[a + 0.03, o.u - 0.02], [o.u + 0.02, b - 0.03]]) {
        B('wood_dark', ua, 0.04, ub, 0.14, y + 0.1, y + o.h - 0.04);
        for (let k = 0; k < 3; k++) for (const [ya, yb2] of [[0.3, 1.5], [1.7, 3.0]]) B('shutter_brown', ua + 0.12 + k * (ub - ua - 0.1) / 3, 0.13, ua + 0.12 + (k + 0.8) * (ub - ua - 0.1) / 3, 0.17, y + ya, y + yb2);
      }
      for (const u of [o.u - 0.8, o.u + 0.8]) for (const yy of [0.9, 2.2]) B('iron', u - 0.14, 0.14, u + 0.14, 0.2, y + yy, y + yy + 0.12);
      for (const k of [-1, 1]) Lt('limestone', [[0.3, 0], [0.34, 0.15], [0.26, 0.2], [0.22, 0.9], [0.28, 0.98], [0.001, 1.0]], o.u + k * (o.w / 2 + 0.45), -0.55, y);   // the chasse-roues, the wheel guards
    } else if (o.type === 'shop') {
      B('opening', a, 0.0, b, 0.06, yb, y + o.h);
      B('wood_dark', a, 0.04, b, 0.1, yb, y + o.h);
      // the stall board let down at 0.95 m and the shutter above it raised as a canopy, on iron stays
      B('wood_painted', a - 0.05, -0.55, b + 0.05, 0.0, y + 0.93, y + 0.98);
      for (const u of [a + 0.1, b - 0.1]) Rd('iron', [u, 0.95, -0.52], [u, 0.2, 0.0], 0.012, 4);
      B('wood_painted', a - 0.1, -0.7, b + 0.1, 0.0, y + o.h + 0.05, y + o.h + 0.1);
      for (const u of [a + 0.05, b - 0.05]) Rd('iron', [u, o.h + 0.05, -0.68], [u, o.h + 0.5, 0.0], 0.012, 4);
      shopGoods(el.trade, B, a, b, y, rand);
    } else if (o.type === 'win') {
      B('opening', a, 0.0, b, 0.05, yb, y + o.h);
      for (const g of [0.25, 0.5, 0.75]) B('iron', a + (b - a) * g - 0.015, 0.06, a + (b - a) * g + 0.015, 0.09, yb, y + o.h);
      for (const g of [0.25, 0.7]) B('iron', a, 0.06, b, 0.09, yb + (o.h - (yb - y)) * g - 0.015, yb + (o.h - (yb - y)) * g + 0.015);
    }
  }
  // the house's sign: an iron bracket and a painted board (and its emblem) out over the street, by the shop
  if (kind === 'shop' && !simple && shopOp) {
    const su = shopOp.u + (shopOp.u < L / 2 ? -1 : 1) * (shopOp.w / 2 + 0.75), sv = -0.05;
    if (su > 0.3 && su < L - 0.3) signBoard(el.trade, W3, Rd, B, su, y, board, rand, P, bag);
  }
  if (hotel && !simple) {                                                            // the hotel's arms over the carriage gate
    B(trim, L / 2 - 0.9, -0.2, L / 2 + 0.9, 0.04, y + 3.6, y + 3.7);
    B(pick(rand, ['paint_blue', 'cloth_red']), L / 2 - 0.35, -0.24, L / 2 + 0.35, -0.2, y + 3.8, y + 4.55); B('gilt_bronze', L / 2 - 0.25, -0.27, L / 2 + 0.25, -0.24, y + 4.0, y + 4.35);
  }
  // the lantern on its iron bracket, here and there; the corner posts (bornes)
  if (!simple && rand() < 0.4) {
    const u = rand() < 0.5 ? 0.35 : L - 0.35;
    Rd('iron', [u, 3.5, -0.02], [u, 3.5, -0.75], 0.02, 5); Rd('iron', [u, 3.5, -0.75], [u, 3.3, -0.75], 0.012, 4);
    Lt('lamp_glass', [[0.001, 0], [0.1, 0.05], [0.12, 0.25], [0.07, 0.38], [0.001, 0.4]], u, -0.75, y + 2.95, 8); Lt('iron', [[0.001, 0], [0.14, 0], [0.1, 0.06], [0.001, 0.08]], u, -0.75, y + 3.35, 8);
  }
  if (!simple && kind !== 'shop') for (const u of [door - 1.0, door + 1.0]) if (u > 0.3 && u < L - 0.3 && rand() < 0.5) Lt('limestone', [[0.2, 0], [0.24, 0.1], [0.19, 0.4], [0.2, 0.7], [0.14, 0.78], [0.001, 0.82]], u, -0.4, y, 8);

  // ── the upper storeys: tall casements, balconies, the weathering ─────────────────────────────────
  const bays = Math.max(2, Math.round(L / 2.7));
  for (let s = 1; s < n; s++) for (let k = 0; k < bays; k++) {
    const u = (k + 0.5) * L / bays, st = sy[s + 1] - sy[s], ww = hotel ? 1.25 : 0.95, wh = Math.min(st - 1.1, s === 1 ? 2.35 : 1.85), v0 = y + sy[s] + (st - wh) * 0.45;
    if (simple) { B('opening', u - ww / 2, -0.01, u + ww / 2, 0.04, v0, v0 + wh); continue; }
    const a = u - ww / 2, b = u + ww / 2;
    B(trim, a - 0.15, -0.06, b + 0.15, 0.05, v0 - 0.14, v0 + wh + 0.16);            // the stone surround
    if (s === 1 && (hotel || k % 2 === 0)) { B(trim, a - 0.2, -0.1, b + 0.2, 0.05, v0 + wh + 0.16, v0 + wh + 0.34); }   // a lintel cornice on the piano nobile
    B('opening', a, 0.0, b, 0.08, v0, v0 + wh);
    const closed = rand() < 0.14;
    // the casement: a mullion, transoms, the small panes' bars
    if (!closed) {
      B('wood_dark', u - 0.025, 0.08, u + 0.025, 0.12, v0, v0 + wh);
      for (const g of [0.3, 0.62, 0.84]) B('wood_dark', a, 0.08, b, 0.12, v0 + wh * g - 0.02, v0 + wh * g + 0.02);
      for (const g of [0.25, 0.75]) for (const hh of [0.5]) B('wood_dark', a + (b - a) * g - 0.012, 0.08, a + (b - a) * g + 0.012, 0.11, v0 + wh * hh, v0 + wh * 0.84);
    } else B(shut, a, 0.02, b, 0.1, v0, v0 + wh);
    // the sill and the apron under it; sometimes the shutters folded back
    B(trim, a - 0.2, -0.16, b + 0.2, 0.05, v0 - 0.2, v0 - 0.09);
    if (!closed && rand() < 0.35) for (const sd of [-1, 1]) B(shut, sd < 0 ? a - 0.55 : b + 0.1, -0.03, sd < 0 ? a - 0.1 : b + 0.55, 0.05, v0, v0 + wh);
    // the iron balcony of the first floor: bars between rails on two consoles
    if (s === 1 && (hotel || k % 2 === 0) && !closed) {
      const bw = ww * 0.62 + 0.2, bd = hotel ? 0.55 : 0.42;
      B(trim, u - bw, -bd - 0.05, u + bw, 0.05, v0 - 0.12, v0 - 0.02);
      for (const sx of [-1, 1]) B(trim, u + sx * (bw - 0.2) - 0.07, -0.3, u + sx * (bw - 0.2) + 0.07, 0.05, v0 - 0.42, v0 - 0.12);
      B('iron', u - bw, -bd - 0.04, u + bw, -bd, v0 + 0.92, v0 + 0.97); B('iron', u - bw, -bd - 0.03, u + bw, -bd, v0 - 0.02, v0 + 0.03);
      for (let x = u - bw + 0.05; x <= u + bw - 0.03; x += 0.17) B('iron', x - 0.012, -bd - 0.025, x + 0.012, -bd, v0 + 0.03, v0 + 0.92);
      for (const sx of [-1, 1]) { B('iron', sx < 0 ? u - bw : u + bw - 0.04, -bd, sx < 0 ? u - bw + 0.04 : u + bw, 0.0, v0 + 0.92, v0 + 0.97); }
    }
    // rain streaks under some sills, damp at the foot of the wall
    if (s < n - 1 && rand() < 0.4) B('plaster_streak', a + 0.05, -0.02, a + 0.3 + rand() * 0.2, 0.0, v0 - 1.1, v0 - 0.2);
  }
  if (!simple) {
    // the damp at the foot of the front, the soot on the stone over the shop, patches of mended plaster above
    for (let k = 0, u = rand() * 1.5; u < L - 0.5 && k < 6; k++) { const w = 0.7 + rand() * 1.6; if (!ops.some((o) => Math.abs(o.u - (u + w / 2)) < o.w / 2 + 0.3)) B('plaster_damp', u, -0.06, Math.min(L - 0.1, u + w), -0.02, y, y + 0.35 + rand() * 0.75); u += w + 0.3 + rand() * 1.2; }
    if (rand() < 0.5) { const u = rand() * (L - 1.5); B('plaster_grey', u, -0.01, u + 0.8 + rand() * 0.9, 0.02, y + sy[1] + 0.3 + rand(), y + sy[1] + 1.2 + rand() * 1.2); }
    if (kind === 'shop' && rand() < 0.6) B('plaster_streak', 0.3, -0.04, L - 0.3, -0.02, y + 2.9 + 0.1, y + ST0 - 0.05);
  }

  // ── the back and the sides: plain casements ──────────────────────────────────────────────────────
  for (let s = 1; s < n; s++) for (let k = 0; k < Math.max(1, bays - 1); k++) {
    const u = (k + 0.5) * L / Math.max(1, bays - 1), st = sy[s + 1] - sy[s], wh = Math.min(st - 1.2, 1.7), v0 = y + sy[s] + 0.9;
    B('opening', u - 0.4, D - 0.04, u + 0.4, D + 0.02, v0, v0 + wh);
    if (!simple) B(trim, u - 0.52, D - 0.02, u + 0.52, D + 0.05, v0 - 0.12, v0 + wh + 0.12);
  }
  if (!simple && !OPEN) for (const k of [0.3, 0.55]) B('opening', -0.02, D * k - 0.4, 0.03, D * k + 0.4, y + sy[1] + 0.9, y + sy[1] + 2.4);

  // ── the roof: the broken slate roof, its dormers and stacks ──────────────────────────────────────
  const ye = y + H, o = simple ? 0.25 : 0.4;
  const rr = f === 's' ? [x0, z0, x1, z1] : [x0, z0, x1, z1];
  void rr;
  if (f === 'n') bag.add('slate', roofPrism(x0, x1, z0, D, ye, o)); else bag.add('slate', roofPrism(x0, x1, z0, D, ye, o));
  if (!simple) {
    // dormers on the street slope, in line with the bays (one in two): the front wall in the roof, a stone surround, a pediment
    const nd = Math.max(1, Math.floor(bays / 2) + (bays % 2 ? 0 : 0));
    for (let k = 0; k < nd; k++) {
      const u = nd === 1 ? L / 2 : (k + 0.5) * L / nd, t = 0.55, y0d = slopeY(t), w = 1.1, h = 1.55;
      B(wall === 'brick' || wall === 'brick_grey' ? 'brick' : wall, u - w / 2 - 0.12, t, u + w / 2 + 0.12, 1.9, ye + y0d - 0.3, ye + y0d + h + 0.2);
      B(trim, u - w / 2 - 0.1, t - 0.04, u + w / 2 + 0.1, t + 0.04, ye + y0d - 0.05, ye + y0d + h + 0.08);
      B('opening', u - w / 2, t - 0.06, u + w / 2, t + 0.02, ye + y0d + 0.1, ye + y0d + h);
      B('wood_dark', u - 0.02, t - 0.07, u + 0.02, t + 0.0, ye + y0d + 0.1, ye + y0d + h);
      B('wood_dark', u - w / 2, t - 0.07, u + w / 2, t + 0.0, ye + y0d + h * 0.62, ye + y0d + h * 0.62 + 0.04);
      // the pediment: a triangle in stone over the dormer
      { const a = P(u - w / 2 - 0.2, t - 0.1), b = P(u + w / 2 + 0.2, t - 0.1), c = P(u, t - 0.1), d = P(u - w / 2 - 0.2, t + 0.5), e = P(u + w / 2 + 0.2, t + 0.5), g = P(u, t + 0.5), yy = ye + y0d + h + 0.2, ty = yy + 0.55;
        const tr = [a[0], yy, a[1], b[0], yy, b[1], c[0], ty, c[1], d[0], yy, d[1], g[0], ty, g[1], e[0], yy, e[1], a[0], yy, a[1], c[0], ty, c[1], g[0], ty, g[1], a[0], yy, a[1], g[0], ty, g[1], d[0], yy, d[1], b[0], yy, b[1], e[0], yy, e[1], g[0], ty, g[1], b[0], yy, b[1], g[0], ty, g[1], c[0], ty, c[1]];
        bag.add(trim, fromTriangles(orientOutward(tr))); }
    }
    // the lead gutters and roof ridge; the brick stacks at the party walls
    B('lead', -0.02, D / 2 - 0.1, L + 0.02, D / 2 + 0.1, ye + 4.7, ye + 4.82);
  }
  const nc = simple ? 1 : 2;
  for (let k = 0; k < nc; k++) {
    const u = k === 0 ? 0.55 : L - 0.9, v = D * 0.45 + (rand() - 0.5) * 1.2;
    B('brick', u, v - 0.3, u + 0.7, v + 0.3, ye + 2.6, ye + 6.4);
    if (!simple) { B(trim, u - 0.06, v - 0.36, u + 0.76, v + 0.36, ye + 6.3, ye + 6.5); B('iron', u + 0.2, v - 0.1, u + 0.5, v + 0.1, ye + 6.5, ye + 6.7); }
  }

  // ── an open house's furniture ────────────────────────────────────────────────────────────────────
  if (OPEN) furnish(el.use ?? 'home', { B, Rd, Lt, bag, col, L, D, T, y, fy, ST0, rand, P, W3, door, shopOp, ops, rectOf });
}

// ── the goods set out on a shop's stall board, by trade ─────────────────────────────────────────────
function shopGoods(trade, B, a, b, y, rand) {
  const yb = y + 0.98, x = (k, n) => a + (b - a) * (k + 0.5) / n;
  const stack = (mat, u, w, d, n, h) => { for (let k = 0; k < n; k++) B(mat, u - w / 2, -0.5 + (k % 2) * 0.02, u + w / 2, -0.5 + d, yb + k * h, yb + (k + 1) * h - 0.005); };
  const NM = 6;
  for (let k = 0; k < NM; k++) {
    const u = x(k, NM);
    switch (trade) {
      case 'baker': B('wood_ochre', u - 0.16, -0.42, u + 0.16, -0.2, yb, yb + 0.12); B('paint_ochre', u - 0.12, -0.38, u + 0.12, -0.24, yb + 0.12, yb + 0.2); break;
      case 'draper': stack(['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_brown'][k % 6], u, 0.5, 0.4, 3, 0.08); break;
      case 'apothecary': B(['glaze_white', 'glaze_blue', 'pottery_dark'][k % 3], u - 0.07, -0.3, u + 0.07, -0.16, yb, yb + 0.22); break;
      case 'cobbler': B('hide_brown', u - 0.09, -0.4, u + 0.09, -0.12, yb, yb + 0.12); B('hide_black', u - 0.07, -0.4, u + 0.07, -0.3, yb + 0.12, yb + 0.2); break;
      case 'vintner': B('glaze_green', u - 0.05, -0.34, u + 0.05, -0.24, yb, yb + 0.3); B('glaze_green', u - 0.05, -0.2, u + 0.05, -0.1, yb, yb + 0.3); break;
      case 'bookseller': stack(['cloth_brown', 'cloth_red', 'cloth_indigo', 'hide_tan'][k % 4], u, 0.34, 0.26, 4, 0.05 + rand() * 0.03); break;
      case 'butcher': B('cloth_red', u - 0.14, -0.42, u + 0.14, -0.14, yb, yb + 0.1); break;
      case 'cutler': B('silver', u - 0.14, -0.4, u + 0.14, -0.38, yb + 0.001, yb + 0.01); B('wood_dark', u - 0.14, -0.38, u - 0.06, -0.36, yb + 0.001, yb + 0.02); break;
      case 'hatter': B('cloth_black', u - 0.15, -0.45, u + 0.15, -0.15, yb, yb + 0.06); B('cloth_black', u - 0.09, -0.39, u + 0.09, -0.21, yb + 0.06, yb + 0.2); break;
      case 'chandler': B('paint_white', u - 0.03, -0.4, u + 0.03, -0.34, yb, yb + 0.26); B('paint_white', u + 0.1, -0.3, u + 0.16, -0.24, yb, yb + 0.22); break;
      case 'tavern': B('wood_dark', u - 0.1, -0.4, u + 0.1, -0.2, yb, yb + 0.2); break;
      default: B('terracotta', u - 0.08, -0.35, u + 0.08, -0.2, yb, yb + 0.16);
    }
  }
}

// ── the hanging sign: iron bracket, painted board, and the trade's emblem ───────────────────────────
function signBoard(trade, W3, Rd, B, u, y, board, rand, P, bag) {
  const out = 1.15, hy = y + 3.2;
  Rd('iron', [u, hy, 0.0], [u, hy, -out], 0.022, 5);
  Rd('iron', [u, hy - 0.5, 0.0], [u, hy, -out * 0.7], 0.015, 5);
  const ec = [u, -out + 0.12];                                                       // the emblem hangs here
  Rd('iron', [ec[0], hy, ec[1]], [ec[0], hy - 0.25, ec[1]], 0.01, 4);
  const emb = (mat, prof, du = 0, dy = 0, sg = 10) => { const p = P(u + du, ec[1]); bag.add(mat, lathe(prof, sg, null, p[0], y + 2.9 - dy, p[1])); };
  switch (trade) {
    case 'baker': emb('wood_ochre', [[0.001, 0], [0.12, 0.05], [0.16, 0.14], [0.1, 0.22], [0.001, 0.25]]); emb('wood_ochre', [[0.001, 0], [0.12, 0.05], [0.16, 0.14], [0.1, 0.22], [0.001, 0.25]], 0.34); break;
    case 'tavern': case 'vintner': emb('bark_olive', [[0.001, 0], [0.25, 0.1], [0.32, 0.3], [0.2, 0.5], [0.001, 0.58]], 0, 0.1, 9); break;     // the bush (the ivy bush) of the wine seller
    case 'barber': emb('bronze', [[0.001, 0.06], [0.22, 0.02], [0.24, 0.0], [0.2, 0.04], [0.001, 0.1]]); emb('bronze', [[0.12, 0], [0.12, -0.12]], 0, -0.1); break;   // the barber's basin
    case 'hatter': emb('cloth_black', [[0.2, 0], [0.34, 0.0], [0.34, 0.02], [0.12, 0.06], [0.11, 0.2], [0.001, 0.22]]); break;
    case 'chandler': for (const d of [-0.18, 0, 0.18]) emb('paint_white', [[0.03, 0], [0.03, 0.4], [0.001, 0.42]], d); break;
    case 'apothecary': emb('glaze_white', [[0.001, 0], [0.1, 0.02], [0.17, 0.14], [0.1, 0.3], [0.05, 0.36], [0.08, 0.4], [0.001, 0.4]]); break;
    case 'butcher': emb('cloth_red', [[0.001, 0], [0.12, 0.1], [0.13, 0.25], [0.06, 0.42], [0.001, 0.46]]); break;
    case 'cobbler': emb('hide_brown', [[0.001, 0], [0.1, 0.0], [0.1, 0.2], [0.06, 0.24], [0.001, 0.26]]); emb('hide_brown', [[0.001, 0], [0.12, 0.0], [0.12, 0.08], [0.001, 0.1]], 0.2); break;
    case 'cutler': emb('silver', [[0.001, 0], [0.025, 0.02], [0.025, 0.36], [0.001, 0.4]]); emb('silver', [[0.001, 0], [0.025, 0.02], [0.025, 0.3], [0.001, 0.34]], 0.1); break;
    case 'draper': emb(pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_green']), [[0.1, 0], [0.12, 0.2], [0.1, 0.4], [0.001, 0.4]]); break;
    case 'bookseller': B('cloth_brown', u - 0.18, ec[1] - 0.04, u + 0.18, ec[1] + 0.04, y + 2.62, y + 2.9); break;
    default: break;
  }
  // the board itself, on the other side of the bracket
  B(board, u - 0.03, ec[1] - 0.45, u + 0.03, ec[1] + 0.45 - 0.5 + 0.5, y + 2.4, y + 2.95);
  B('gilt_bronze', u - 0.035, ec[1] - 0.5, u + 0.035, ec[1] + 0.5, y + 2.38, y + 2.4);
  B('iron', u - 0.015, ec[1] - 0.45, u + 0.015, ec[1] - 0.44, y + 2.95, y + hy - y);
  B('iron', u - 0.015, ec[1] + 0.44, u + 0.015, ec[1] + 0.45, y + 2.95, y + hy - y);
}
