// The upper floors of the Sydney houses one walks into (docs/settlements/sydney.md §1l): the flat over a shop, the hotel's
// first floor with its guest rooms and balcony, the first floor of a Rocks terrace. Shared pieces: the geometry of a shop's
// stair hall, floors with their openings, walls with window reveals, rails, and the furnishing of a room by its use (sleeping,
// living, kitchen, storing, working). Everything is built in a frame (u along the front, d inward, heights absolute) and
// varies only by a hash of the piece's own place.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { chair } from './rooms.js';

/** The depth of the stair hall behind a shop with a flat over it (m, from the shop's back wall). */
export const RES = 2.5;
const SLOPE = 0.9;                 // (the stair's rise over its run: a steep, closed-string stair, as the narrow houses had)

/** A hash of a position and a seed in [0, 1). */
export function hash(a, b = 0, c = 0) {
  let h = (Math.imul(Math.round(a * 64) | 0, 374761393) ^ Math.imul(Math.round(b * 64) | 0, 668265263) ^ Math.imul(Math.round(c * 64) | 0, 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const pickH = (a, h) => a[Math.floor(h * a.length) % a.length];
const COV = ['cloth_maroon', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_red', 'cloth_grey'];

/** The numbers of the stair hall and the rooms over a shop of width L and depth Dq (heights: F the ground floor, H1 its storey). */
export function shopGeom(L, Dq, F, H1, T = 0.3) {
  const U = F + H1, Y = U + 0.05, rise = Y - F, run = rise / SLOPE, dp = Dq - RES;
  const us0 = T + 1.25, us1 = us0 + run, dStairA = Dq - T - 1.0;
  const hu0 = us0 + (H1 - 2.45) / SLOPE, hd0 = dStairA - 0.3;
  const uC = Math.max(us1 + 1.0, L * 0.5 + 0.5), cross = 0.45 + Math.min(4.6, (dp - 0.3 - 0.45) * 0.52);
  return { U, Y, rise, run, dp, us0, us1, dStairA, hu0, hd0, uC, cross, T, L, Dq, F, H1,
    left: [T, uC - 0.72], right: [uC + 0.72, L - T], front: [0.45, cross], back: [cross + 0.12, dp - 0.3] };
}

/** A frame's toolkit: blocks, rods, lathe pieces and colliders at a place in (u, d, absolute y). */
// (a shop's plan holds only these materials; what is not among them is drawn in the nearest that is, so that the upper floors add no draws)
const SHOP_MAT = { plaster_white: 'paint_white', lamp_white: 'paint_white', cloth_blue: 'cloth_maroon', cloth_brown: 'cloth_ochre', cloth_grey: 'cloth_ochre', granite_grey: 'concrete_light', lamp_paper: 'paint_white', fresco_green: 'cloth_green', flame: 'car_red', palm_leaf: 'cloth_green', glaze_white: 'paint_white', wicker: 'wood_ochre', timber: 'wood_ochre', pottery_dark: 'car_black', slate: 'car_black', sandstone: 'sandstone_dressed', lead: 'steel_grey', iron_galv: 'iron' };
const TERR_MAT = { timber: 'wood_dark', lamp_white: 'lamp_paper', cloth_brown: 'cloth_red', plaster_white: 'lime_plaster' };
function kit(c) {
  const { col, lights, B, W, R } = c, MAP = c.shop ? SHOP_MAT : TERR_MAT, bag = { add: (m, g) => c.bag.add(MAP[m] ?? m, g) };
  const blk = (mat, u0, u1, d0, d1, ya, yb, solid = false) => {
    if (u1 - u0 < 1e-4 || d1 - d0 < 1e-4 || yb - ya < 1e-4) return;
    bag.add(mat, B(u0, u1, d0, d1, ya, yb));
    if (solid) col.rect(R(u0, u1, d0, d1), ya, yb);
  };
  const rc = (u0, u1, d0, d1, ya, yb) => col.rect(R(u0, u1, d0, d1), ya, yb);
  const flo = (u0, u1, d0, d1, y) => col.floor(R(u0, u1, d0, d1), y);
  const rd = (mat, a, b, r = 0.02) => bag.add(mat, rod(W(a[0], a[1], a[2]), W(b[0], b[1], b[2]), r, 4));
  const lat = (mat, prof, u, d, ya, n = 10) => { const p = W(u, d, ya); bag.add(mat, lathe(prof, n, null, p[0], p[1], p[2])); };
  const lamp = (u, d, ya, h = 0.55, light = false) => {
    lat('lamp_white', [[0.001, 0], [0.16, 0.1], [0.18, 0.24], [0.08, 0.4], [0.001, 0.4]], u, d, ya - 0.4);
    rd('iron', [u, d, ya], [u, d, ya - 0.0 - 0.01], 0.01);
    if (light) lights.push({ at: W(u, d, ya - 0.2), color: '#ffe0b0', intensity: 1.5, distance: 6 });
    void h;
  };
  /** A timber rail along a line (one of u0 = u1 or d0 = d1) at the floor yb: posts and two rails of rods (no top faces to stand on); it collides. */
  const fence = (u0, d0, u1, d1, yb, h = 1.0) => {
    const len = Math.hypot(u1 - u0, d1 - d0), n = Math.max(1, Math.round(len / 1.0));
    for (let k = 0; k <= n; k++) { const u = u0 + (u1 - u0) * k / n, d = d0 + (d1 - d0) * k / n; rd('iron', [u, d, yb], [u, d, yb + h], 0.025); }
    for (const f of [h - 0.03, h * 0.5]) rd('iron', [u0, d0, yb + f], [u1, d1, yb + f], 0.02);
    const e = 0.05; col.rect(R(Math.min(u0, u1) - e, Math.max(u0, u1) + e, Math.min(d0, d1) - e, Math.max(d0, d1) + e), yb + 0.1, yb + h);
  };
  return { ...c, bag, blk, rc, flo, rd, lat, lamp, fence };
}

/** A room's own frame: a away from the door's wall (the door is on u1 when doorU1, else u0), b from the cross partition along the room (toward d1 when flip is false). */
function roomOf(K, [u0, u1, d0, d1], doorU1, flip, Y, seed) {
  const A = u1 - u0, Bd = d1 - d0;
  const uu = (a) => (doorU1 ? u1 - a : u0 + a), dd = (b) => (flip ? d1 - b : d0 + b);
  const rg = (a0, a1, b0, b1) => [Math.min(uu(a0), uu(a1)), Math.max(uu(a0), uu(a1)), Math.min(dd(b0), dd(b1)), Math.max(dd(b0), dd(b1))];
  const R = {
    A, Bd, Y, seed, u0, u1, d0, d1, uu, dd,
    B: (mat, a0, a1, b0, b1, ya, yb, solid = false) => { const [p, q, r, s] = rg(a0, a1, b0, b1); K.blk(mat, p, q, r, s, Y + ya, Y + yb, solid); },
    L: (mat, prof, a, b, ya = 0, n = 10) => K.lat(mat, prof, uu(a), dd(b), Y + ya, n),
    C: (a, b, r, ya, yb) => { const p = K.W(uu(a), dd(b), 0); K.col.circle(p[0], p[2], r, Y + ya, Y + yb); },
    rod: (mat, a0, b0, ya0, a1, b1, ya1, r = 0.02) => K.rd(mat, [uu(a0), dd(b0), Y + ya0], [uu(a1), dd(b1), Y + ya1], r),
    chair: (a, b, bk) => {
      // bk: toward larger a (+a), smaller a (-a), larger b (+b), smaller b (-b) in the room's frame, as the chair's back
      const U = uu(a), D = dd(b), au = doorU1 ? -1 : 1, bs = flip ? -1 : 1;
      const m = { '+a': au > 0 ? 'u+' : 'u-', '-a': au > 0 ? 'u-' : 'u+', '+b': bs > 0 ? 1 : -1, '-b': bs > 0 ? -1 : 1 }[bk];
      chair(K.bag, K.B, U, D, Y, m, 'wood_painted', 'cloth_blue');
    },
    h: (a, b, c = 0) => hash(uu(a), dd(b), seed + c),
  };
  return R;
}

// ── the furnishing of a room by its use (a: from the door's wall, b: along the room from the door's end) ───────────────────
const FURN = {
  /** The lounge: a carpet, a settee against the far wall, two armchairs, a low table, a television on its legs, a standard lamp, pictures. */
  living(r, K) {
    const { A, Bd } = r, cov = pickH(COV, r.h(A, Bd, 1)), sofa = pickH(['cloth_brown', 'cloth_green', 'cloth_ochre', 'cloth_blue'], r.h(A, Bd, 2));
    r.B(cov, 1.1, A - 0.6, 1.0, Bd - 0.7, 0, 0.012);
    const mb = Bd * 0.5;
    r.B(sofa, A - 0.95, A - 0.1, mb - 0.95, mb + 0.95, 0, 0.42, true); r.B(sofa, A - 0.2, A - 0.1, mb - 0.95, mb + 0.95, 0.42, 0.95);
    for (const s of [-1, 1]) r.B(sofa, A - 0.95, A - 0.1, mb + s * 1.15 - 0.03, mb + s * 1.15 + 0.03, 0.42, 0.7);
    r.B('wood_dark', A * 0.5 - 0.4, A * 0.5 + 0.4, mb - 0.3, mb + 0.3, 0.38, 0.42, true);
    for (const [x, z] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) r.B('wood_dark', A * 0.5 + x - 0.025, A * 0.5 + x + 0.025, mb + z - 0.025, mb + z + 0.025, 0, 0.38);
    // two armchairs by the near wall, one each side, facing in
    if (Bd > 3.0) for (const [a, b] of [[A * 0.5 - 0.6, 1.9], [A * 0.5 + 0.6, 1.9]]) { r.B('cloth_brown', a - 0.4, a + 0.4, b - 0.4, b + 0.4, 0, 0.42, true); r.B('cloth_brown', a - 0.4, a + 0.4, b + 0.3, b + 0.4, 0.42, 0.95); }
    // a television on tapered legs against the near-b wall, its glass toward the room
    r.B('wood_dark', A * 0.5 - 0.4, A * 0.5 + 0.4, Bd - 0.55, Bd - 0.05, 0.4, 0.88, true); r.B('glass_lamp', A * 0.5 - 0.3, A * 0.5 + 0.3, Bd - 0.56, Bd - 0.55, 0.5, 0.8);
    for (const [x, z] of [[-0.36, 0.08], [0.36, 0.08], [-0.36, 0.48], [0.36, 0.48]]) r.B('wood_dark', A * 0.5 + x - 0.025, A * 0.5 + x + 0.025, Bd - 0.55 + z - 0.02, Bd - 0.55 + z + 0.02, 0, 0.4);
    r.L('iron', [[0.15, 0], [0.15, 0.03], [0.02, 0.05], [0.02, 1.5], [0.001, 1.5]], A - 0.35, 0.45, 0, 8); r.L('lamp_paper', [[0.001, 0], [0.18, 0.05], [0.22, 0.34], [0.001, 0.4]], A - 0.35, 0.45, 1.5, 10);
    for (const [b, w] of [[mb - 0.5, 0.5], [mb + 0.3, 0.4]]) { r.B('gilt_bronze', A - 0.02, A, b, b + w, 1.4, 1.4 + w * 0.8); r.B('fresco_green', A - 0.03, A - 0.02, b + 0.05, b + w - 0.05, 1.45, 1.35 + w * 0.8); }
  },
  /** The kitchen: a table with four chairs, a stove with its flue, a sink, a refrigerator, a dresser with crockery. */
  kitchen(r, K) {
    const { A, Bd } = r, ta = A * 0.5, tb = Bd * 0.5;
    r.B('wood_painted', ta - 0.6, ta + 0.6, tb - 0.4, tb + 0.4, 0.72, 0.76, true);
    for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) r.B('wood_painted', ta + x - 0.025, ta + x + 0.025, tb + z - 0.025, tb + z + 0.025, 0, 0.72);
    r.B('cloth_white', ta - 0.5, ta + 0.5, tb - 0.3, tb + 0.3, 0.76, 0.765);
    r.chair(ta - 0.85, tb, '-a'); r.chair(ta + 0.85, tb, '+a'); r.chair(ta, tb - 0.62, '-b'); r.chair(ta, tb + 0.62, '+b');
    // the stove against the far wall, its flue to the ceiling
    r.B('iron', A - 0.7, A - 0.02, 0.9, 1.6, 0, 0.85, true); r.B('iron', A - 0.75, A - 0.02, 0.85, 1.65, 0.85, 0.9); r.B('flame', A - 0.72, A - 0.7, 1.1, 1.4, 0.18, 0.3);
    r.rod('iron', A - 0.35, 1.25, 0.9, A - 0.35, 1.25, 3.0, 0.07);
    // the sink under the front window and a bench; a refrigerator in the corner; a dresser
    r.B('glaze_white', A * 0.5 - 0.7, A * 0.5 + 0.2, Bd - 0.55, Bd - 0.05, 0.78, 0.9, true); r.B('wood_painted', A * 0.5 - 0.7, A * 0.5 + 0.7, Bd - 0.55, Bd - 0.05, 0, 0.78);
    r.rod('steel_chrome', A * 0.5 - 0.25, Bd - 0.12, 0.9, A * 0.5 - 0.25, Bd - 0.12, 1.12, 0.015);
    r.B('paint_white', A - 0.7, A - 0.05, Bd - 0.7, Bd - 0.05, 0, 1.5, true); r.B('steel_chrome', A - 0.72, A - 0.7, Bd - 0.55, Bd - 0.5, 0.75, 1.15);
    if (A > 3.0 && Bd > 3.3) { r.B('wood_painted', 0.15, 0.55, Bd * 0.5 + 0.4, Bd * 0.5 + 1.5, 0, 0.85, true); r.B('wood_painted', 0.15, 0.45, Bd * 0.5 + 0.45, Bd * 0.5 + 1.45, 0.85, 1.95);
      for (let k = 0; k < 4; k++) r.L('glaze_white', [[0.1, 0], [0.11, 0.01], [0.001, 0.012]], 0.3, Bd * 0.5 + 0.6 + k * 0.2, 1.3, 10); }
    r.B('paint_white', A - 0.04, A - 0.02, Bd * 0.5 - 0.1, Bd * 0.5 + 0.2, 1.5, 1.9); r.B('car_red', A - 0.05, A - 0.04, Bd * 0.5 - 0.08, Bd * 0.5 + 0.18, 1.78, 1.88);
  },
  /** A bedroom: an iron bedstead with a chenille cover and pillows, a bedside table, a wardrobe, a dressing table with its mirror, a rug. */
  bed(r, K, guest = false) {
    const { A, Bd } = r, w = guest ? 1.0 : 1.45, b1 = Bd - 0.12, b0 = b1 - w, cov = pickH(COV, r.h(A, Bd, 3));
    r.B('iron', A - 2.0, A - 0.04, b0, b1, 0.3, 0.36, true); r.B('cloth_white', A - 1.96, A - 0.08, b0 + 0.04, b1 - 0.04, 0.36, 0.56); r.B(cov, A - 1.6, A - 0.08, b0 + 0.03, b1 - 0.03, 0.56, 0.62);
    r.B('cloth_white', A - 0.45, A - 0.1, b0 + 0.1, b1 - 0.1, 0.56, 0.7);
    for (const b of [b0, b1 - 0.03]) { r.B('iron', A - 2.0, A - 1.97, b, b + 0.03, 0, 0.7); r.B('iron', A - 0.07, A - 0.04, b, b + 0.03, 0, 1.1); }
    r.B('iron', A - 0.07, A - 0.04, b0, b1, 0.95, 1.1); r.B('iron', A - 2.0, A - 1.97, b0, b1, 0.6, 0.7);
    r.B('wood_dark', A - 0.5, A - 0.04, b0 - 0.5, b0 - 0.08, 0, 0.55, true); r.L('lamp_paper', [[0.001, 0], [0.1, 0.04], [0.11, 0.2], [0.001, 0.22]], A - 0.27, b0 - 0.29, 0.55, 8);
    // the wardrobe at the far wall by the near end, a dressing table with its mirror along the near-b wall
    if (b0 > 1.9) { r.B('wood_dark', A - 0.6, A - 0.02, 0.15, 1.15, 0, 1.9, true); r.B('wood_painted', A - 0.63, A - 0.6, 0.2, 1.1, 0.05, 1.85); r.B('steel_chrome', A - 0.65, A - 0.63, 0.62, 0.68, 0.9, 1.1); }
    if (A > 3.6) { r.B('wood_dark', 1.1, 2.1, Bd - 0.5, Bd - 0.05, 0, 0.78, true); r.B('mirror_tin', 1.3, 1.9, Bd - 0.07, Bd - 0.05, 0.9, 1.6); r.chair(1.6, Bd - 0.95, '+b'); }
    r.B(pickH(COV, r.h(Bd, A, 4)), A - 2.2, A - 0.1, b0 - 1.1, b0 - 0.5, 0, 0.012);
    if (guest) { r.B('wood_painted', 0.2, 0.7, 2.0, 2.45, 0, 0.85, true); r.B('marble', 0.18, 0.72, 1.98, 2.47, 0.85, 0.89); r.L('glaze_white', [[0.001, 0], [0.12, 0.02], [0.14, 0.1], [0.001, 0.1]], 0.45, 2.2, 0.89, 10); r.L('glaze_white', [[0.04, 0], [0.07, 0.05], [0.075, 0.14], [0.04, 0.22], [0.001, 0.22]], 0.25, 2.3, 0.89, 8); }
  },
  /** A single bed and a chest of drawers: a child's room or a lodger's. */
  bed1(r, K) {
    const { A, Bd } = r;
    FURN.bed(r, K, true);
    if (A > 3.6 && Bd > 3.0) { r.B('wood_painted', 0.2, 0.7, Bd - 1.4, Bd - 0.4, 0, 0.45, true); r.B('timber', 0.18, 0.72, Bd - 1.42, Bd - 0.38, 0.45, 0.48); }
  },
  /** A store: cartons and crates stacked along the walls, sacks, a shelf, a trunk. */
  store(r, K, stock = ['timber', 'cloth_ochre', 'cloth_brown', 'paint_cab_yellow']) {
    const { A, Bd } = r;
    for (let b = 1.9; b + 0.55 < Bd - 0.1; b += 0.58) { const n = 1 + Math.floor(r.h(A, b, 5) * 3), m = pickH(stock, r.h(A, b, 6)); for (let k = 0; k < n; k++) r.B(k % 2 ? 'wood_painted' : m, A - 0.55 - (k === 2 ? 0.0 : 0), A - 0.03, b + 0.01, b + 0.55, k * 0.4, k * 0.4 + 0.38, k === 0); }
    for (let a = 1.5; a + 0.55 < A - 0.7; a += 0.6) { const n = 1 + Math.floor(r.h(a, Bd, 7) * 3), m = pickH(stock, r.h(a, Bd, 8)); for (let k = 0; k < n; k++) r.B(k % 2 ? m : 'wood_painted', a, a + 0.55, Bd - 0.5, Bd - 0.03, k * 0.4, k * 0.4 + 0.38, k === 0); }
    for (const [a, b] of [[1.0, 2.2], [1.15, 2.8]]) { r.L('sacking', [[0.001, 0], [0.18, 0.02], [0.2, 0.18], [0.12, 0.38], [0.06, 0.44], [0.001, 0.45]], a, b, 0, 8); r.C(a, b, 0.2, 0, 0.45); }
    r.B('timber', 0.05, 0.35, 1.9, Bd - 0.2, 1.3, 1.34); r.B('wood_dark', 0.03, 0.06, 1.9, Bd - 0.2, 0, 1.34); r.B('wood_dark', 0.03, 0.4, 1.9, 1.95, 0, 1.34);
    for (let b = 2.1; b < Bd - 0.5; b += 0.35) r.B(pickH(stock, r.h(A, b, 9)), 0.08, 0.32, b, b + 0.28, 1.34, 1.34 + 0.1 + r.h(b, A, 2) * 0.15);
  },
  /** A workroom: a desk with a ledger and a typewriter, a chair, a filing cabinet, a shelf of box files, a sewing machine on its treadle table. */
  work(r, K) {
    const { A, Bd } = r, ta = A - 0.45, tb = Math.min(Bd * 0.5, 2.6);
    r.B('wood_dark', ta - 0.35, ta + 0.35, tb - 0.7, tb + 0.7, 0.72, 0.77, true);
    for (const [x, z] of [[-0.3, -0.65], [0.3, -0.65], [-0.3, 0.65], [0.3, 0.65]]) r.B('wood_dark', ta + x - 0.03, ta + x + 0.03, tb + z - 0.03, tb + z + 0.03, 0, 0.72);
    r.B('car_black', ta - 0.25, ta - 0.02, tb - 0.2, tb + 0.15, 0.77, 0.9); r.B('paint_white', ta - 0.1, ta + 0.1, tb - 0.15, tb + 0.1, 0.9, 0.92);
    r.B('cloth_maroon', ta + 0.1, ta + 0.3, tb + 0.3, tb + 0.6, 0.77, 0.83); r.B('cloth_blue', ta + 0.1, ta + 0.3, tb + 0.33, tb + 0.58, 0.83, 0.87);
    r.chair(ta - 0.85, tb, '-a');
    r.B('steel_grey', A - 0.55, A - 0.03, 0.1, 0.65, 0, 1.3, true); for (const h of [0.3, 0.65, 1.0]) r.B('steel_chrome', A - 0.56, A - 0.55, 0.3, 0.45, h, h + 0.04);
    r.B('timber', A - 0.35, A - 0.03, Bd - 2.2, Bd - 0.2, 1.4, 1.44); for (let b = Bd - 2.1; b < Bd - 0.3; b += 0.2) r.B(pickH(['cloth_blue', 'cloth_maroon', 'cloth_green', 'cloth_grey'], r.h(b, A, 3)), A - 0.3, A - 0.06, b, b + 0.16, 1.44, 1.78);
    r.B('wood_dark', A - 0.36, A - 0.33, Bd - 2.2, Bd - 0.2, 1.3, 1.44);
    if (Bd > 4.0) { r.B('wood_dark', 0.7, 1.35, Bd - 0.5, Bd - 0.05, 0.72, 0.76, true); for (const [x, z] of [[0.75, 0.5], [1.3, 0.5]]) r.B('iron', x - 0.03, x + 0.03, Bd - 0.5 + 0.05 * z, Bd - 0.1, 0, 0.72); r.B('car_black', 0.85, 1.15, Bd - 0.4, Bd - 0.15, 0.76, 0.98); r.chair(1.0, Bd - 0.95, '+b'); }
    r.B('cloth_green', 1.2, A - 1.0, 1.4, Bd - 1.2, 0, 0.012);
  },
};
export const furnishRoom = (kind, r, K, extra) => FURN[kind](r, K, extra);

/** The wall's pieces along an axis from a to b between heights y0 and y1, with `holes` ({ a, b, ya, yb }) cut out: put(p, q, ya, yb) is called for each. */
export function cutWall(put, a, b, y0, y1, holes = []) {
  const cuts = [...new Set([a, b, ...holes.flatMap((h) => [h.a, h.b])])].sort((m, n) => m - n);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const p = cuts[i], q = cuts[i + 1];
    if (q - p < 1e-3) continue;
    let yy = y0;
    for (const h of holes.filter((k) => k.a <= p + 1e-6 && k.b >= q - 1e-6).sort((m, n) => m.ya - n.ya)) { put(p, q, yy, h.ya); yy = Math.max(yy, h.yb); }
    put(p, q, yy, y1);
  }
}
const minus = (rects, h) => {
  const out = [];
  for (const r of rects) {
    const [a, b, c, d] = r, [p, q, s, t] = h;
    if (q <= a || p >= b || t <= c || s >= d) { out.push(r); continue; }
    if (p > a) out.push([a, p, c, d]);
    if (q < b) out.push([q, b, c, d]);
    const m0 = Math.max(a, p), m1 = Math.min(b, q);
    if (s > c) out.push([m0, m1, c, s]);
    if (t < d) out.push([m0, m1, t, d]);
  }
  return out;
};

/**
 * The first floor over a shop (the ground floor is the shop's, built by the caller up to its ceiling): the stair hall behind the
 * shop's partition with the stair up to the first floor, the floor with its opening and rail, the walls with window reveals, the
 * rooms by use (kind decides them), a balcony onto the street, the ceiling. c carries the frame and the shell's numbers
 * ({ L, Dq, F, H1, T, top, wall, kind, front (letter), balcony ('lace' for the hotel's own iron balcony, 'slab': ours) }).
 */
export function shopUpper(c0) {
  const K = kit({ ...c0, shop: true }), { bag, col, lights, L, Dq, F, H1, T, top, wall, kind } = K;
  const G = shopGeom(L, Dq, F, H1, T), { U, Y, rise, dp, us0, us1, dStairA, hu0, hd0, uC, cross } = G;
  const Hc = Math.min(top - 0.2, Y + 3.3);
  const seed = Math.round(K.W(0, 0, 0)[0] * 7 + K.W(0, 0, 0)[2] * 13);
  // ── the ground floor's partition and the stair hall behind it ─────────────────────────────────────────────────
  K.blk('plaster_white', T, L - T, dp - 0.3, dp, F, U - 0.3, false);
  K.rc(T + 1.15, L - T, dp - 0.3, dp, F, U - 0.3); K.rc(T, T + 0.15, dp - 0.3, dp, F, U - 0.3);
  K.blk('plaster_white', T + 0.15, T + 1.15, dp - 0.3, dp, F + 2.1, U - 0.3);
  for (const u of [T + 0.15, T + 1.1]) K.blk('wood_dark', u - 0.03, u + 0.05, dp - 0.33, dp + 0.03, F, F + 2.15); K.blk('wood_dark', T + 0.12, T + 1.13, dp - 0.33, dp + 0.03, F + 2.1, F + 2.18);
  // the stair: steps of timber filling the flight, a handrail on the aisle side with its posts; the collider a ramp
  const n = Math.round(rise / 0.19), tw = (us1 - us0) / n, dW = dStairA, dDir = (() => { const a = K.W(us0, 0, 0), b = K.W(us1, 0, 0), dx = b[0] - a[0], dz = b[2] - a[2]; return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n'); })();
  for (let k = 0; k < n; k++) { const top2 = F + (k + 1) * rise / n; K.blk('timber', us0 + k * tw, us0 + (k + 1) * tw, dW, Dq - T, F, top2); if (k % 2) K.blk('wood_dark', us0 + k * tw, us0 + k * tw + 0.03, dW, Dq - T, top2 - 0.04, top2 + 0.004); }
  col.ramp(K.R(us0, us1, dW, Dq - T), F, Y, dDir);
  K.rd('wood_dark', [us0, dW + 0.04, F + 0.95], [us1, dW + 0.04, Y + 0.95], 0.035);
  for (let k = 0; k <= 5; k++) { const u = us0 + (us1 - us0) * k / 5; K.rd('wood_dark', [u, dW + 0.04, F + rise * k / 5], [u, dW + 0.04, F + rise * k / 5 + 0.95], 0.03); }
  { const o0 = us0 + (us1 - us0) / 7, o1 = us1 - 0.7; K.rc(o0, o1, dW - 0.04, dW + 0.04, F + 0.3, Y + 1.0); }
  // under the stair's rise and the lower floor's ceiling over the hall: the floor of the first storey (with its opening) is below
  K.lamp(T + 0.9, dp + 0.8, U - 0.35, 0.5, true);
  K.lamp(us1 - 0.5, dp + 1.0, U - 0.35, 0.5);
  // ── the first floor: the slab with the stair's opening (the opening 0.3 clear of the flight on its open side), boards on top ──
  const hole = [hu0, us1, hd0, Dq - T];
  const slab = minus([[T, L - T, 0.3, Dq - T]], hole);
  for (const [a, b, c, d] of slab) {
    if (b - a < 0.02 || d - c < 0.02) continue;
    K.blk('plaster_white', a, b, c, d, U - 0.3, U); K.blk('timber', a, b, c, d, U, Y); K.flo(a, b, c, d, Y);
    for (let u = Math.ceil((a + 0.1) / 0.8) * 0.8; u < b - 0.1; u += 0.8) K.blk('wood_dark', u - 0.06, u + 0.06, c, d, U - 0.34, U - 0.3);
  }
  // the opening's edges: a rail on the open side and across the low end
  K.fence(hu0, hd0, us1 - 0.1, hd0, Y); K.fence(hu0, hd0, hu0, Dq - T, Y);
  K.blk('wood_dark', hu0 - 0.03, us1, hd0 - 0.03, hd0 + 0.03, Y, Y + 0.02);
  // ── the walls above the shop: the front with the windows' reveals, the sides and the back, plastered within ──
  const front = el_front(K);
  const wallsHoles = [];
  const rooms = layoutRooms(G, kind);
  const winU = []; // (the windows and the balcony door: [uc, hw, door])
  for (const rm of rooms) {
    if (rm.zone !== 'front') continue;
    const w = rm.rect[1] - rm.rect[0], nW = Math.max(1, Math.floor(w / 2.2));
    for (let k = 0; k < nW; k++) { const uc = rm.rect[0] + w * (k + 0.5) / nW; winU.push({ uc, hw: 0.55, door: rm.door === k, room: rm }); }
  }
  for (const wI of winU) wallsHoles.push({ a: wI.uc - wI.hw, b: wI.uc + wI.hw, ya: wI.door ? Y : Y + 0.85, yb: wI.door ? Y + 2.35 : Y + 2.65 });
  const putF = (mat, p, q, ya, yb) => K.blk(mat, p, q, 0, 0.45, ya, yb, true);
  cutWall((p, q, ya, yb) => putF(wall, p, q, ya, yb), 0, L, U, top, wallsHoles);
  cutWall((p, q, ya, yb) => { if (yb > ya) K.blk('plaster_white', p, q, 0.45, 0.48, ya, Math.min(yb, Hc)); }, T, L - T, Y, Hc, wallsHoles);
  for (const [a, b] of [[0, T], [L - T, L]]) { K.blk(wall, a, b, 0.45, Dq, U, top, true); K.blk('plaster_white', a === 0 ? T : a - 0.03, a === 0 ? T + 0.03 : a, 0.48, Dq - T, Y, Hc); }
  K.blk(wall, T, L - T, Dq - T, Dq, U, top, true); K.blk('plaster_white', T, L - T, Dq - T - 0.03, Dq - T, Y, Hc);
  // the ceiling over the rooms (a void above it, closed by the walls), the roof is the caller's
  K.blk('plaster_white', T, L - T, 0.3, Dq - T, Hc, Hc + 0.12);
  K.rc(0, L, 0, Dq, top - 0.3, top + 1);
  // the windows' dressing: sills and lintels outside, a mullion, curtains within; the doors' fanlights
  for (const wI of winU) {
    const { uc, hw, door } = wI, ya = door ? Y : Y + 0.85, yb = door ? Y + 2.35 : Y + 2.65;
    K.blk('sandstone_dressed', uc - hw - 0.1, uc + hw + 0.1, -0.08, 0.0, yb, yb + 0.22);
    if (!door) K.blk('paint_white', uc - hw - 0.1, uc + hw + 0.1, -0.08, 0, ya - 0.08, ya); else K.blk('wood_dark', uc - hw, uc + hw, -0.05, 0.45, Y - 0.02, Y + 0.02);
    K.blk('paint_white', uc - 0.025, uc + 0.025, 0.2, 0.26, ya, yb); K.blk('paint_white', uc - hw, uc + hw, 0.2, 0.26, yb - 0.05, yb);
    const cc = pickH(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_blue', 'cloth_white'], hash(uc, ya, seed));
    for (const s of [-1, 1]) K.blk(cc, s < 0 ? uc - hw - 0.3 : uc + hw, s < 0 ? uc - hw : uc + hw + 0.3, 0.5, 0.56, ya - 0.1, yb + 0.15);
  }
  // ── the partitions, the rooms and their furniture ───────────────────────────────────────────────────────────
  const D1 = dp - 0.3;
  const door = (u0, u1, d0, d1) => ({ u0, u1, d0, d1 });
  // the main partition between the rooms and the hall, with a doorway to the corridor
  K.blk('plaster_white', T, uC - 0.45, D1, dp, Y, Hc, true); K.blk('plaster_white', uC + 0.45, L - T, D1, dp, Y, Hc, true); K.blk('plaster_white', uC - 0.45, uC + 0.45, D1, dp, Y + 2.1, Hc);
  for (const u of [uC - 0.45, uC + 0.45]) K.blk('wood_dark', u - 0.04, u + 0.04, D1 - 0.02, dp + 0.02, Y, Y + 2.15); K.blk('wood_dark', uC - 0.45, uC + 0.45, D1 - 0.02, dp + 0.02, Y + 2.1, Y + 2.18);
  // the corridor's side walls, each with the doors of its two rooms; the cross partitions between front and back rooms
  const dFront = [cross - 1.5, cross - 0.6], dBack = [cross + 0.12 + 0.5, cross + 0.12 + 1.4];
  for (const [uA, uB] of [[uC - 0.72, uC - 0.6], [uC + 0.6, uC + 0.72]]) {
    cutWall((p, q, ya, yb) => K.blk('plaster_white', uA, uB, p, q, ya, yb, yb - ya > 1.5 || ya < Y + 1), 0.45, D1, Y, Hc, [{ a: dFront[0], b: dFront[1], ya: Y, yb: Y + 2.1 }, { a: dBack[0], b: dBack[1], ya: Y, yb: Y + 2.1 }]);
    for (const [a, b] of [dFront, dBack]) for (const d of [a, b]) K.blk('wood_dark', uA - 0.02, uB + 0.02, d - 0.04, d + 0.04, Y, Y + 2.15);
  }
  K.blk('plaster_white', T, uC - 0.72, cross, cross + 0.12, Y, Hc, true); K.blk('plaster_white', uC + 0.72, L - T, cross, cross + 0.12, Y, Hc, true);
  // rooms
  const rm = Object.fromEntries(rooms.map((r) => [r.id, r]));
  for (const r of rooms) {
    const R = roomOf(K, [r.rect[0], r.rect[1], r.d0, r.d1], r.doorU1, r.flip, Y, seed + r.id.charCodeAt(0));
    if (R.A < 2.2 || R.Bd < 2.2) continue;
    FURN[r.use](R, K, r.extra);
    K.lamp((r.rect[0] + r.rect[1]) / 2, (r.d0 + r.d1) / 2, Hc - 0.02, 0.5, r.id === 'R1');
  }
  // the corridor: a runner, a picture, a lamp
  K.blk('cloth_red', uC - 0.4, uC + 0.4, 0.6, D1 - 0.2, Y, Y + 0.012); K.blk('cloth_red', uC - 0.4, uC + 0.4, D1, Dq - T - 0.2, Y, Y + 0.012);
  K.lamp(uC, cross, Hc - 0.02);
  // the hall: a hat stand, a telephone table, a picture
  K.blk('wood_dark', us1 + 0.5, us1 + 0.8, Dq - T - 0.45, Dq - T - 0.05, Y, Y + 0.72, true); K.blk('car_black', us1 + 0.54, us1 + 0.76, Dq - T - 0.4, Dq - T - 0.1, Y + 0.72, Y + 0.8);
  K.blk('gilt_bronze', us1 + 1.4, us1 + 2.0, Dq - T - 0.04, Dq - T - 0.02, Y + 1.4, Y + 1.9); K.blk('fresco_green', us1 + 1.45, us1 + 1.95, Dq - T - 0.06, Dq - T - 0.04, Y + 1.45, Y + 1.85);
  // ── the balcony onto the street ─────────────────────────────────────────────────────────────────────────────
  const dr = winU.find((w) => w.door);
  if (el_balcony(K) === 'lace') {
    // the hotel's own iron balcony runs the whole front (shops.js): ours the floor to walk on and the rail to keep one in
    K.flo(0.2, L - 0.2, -1.3, 0.45, Y);
    K.rc(0.3, L - 0.3, -1.3, -1.15, Y + 0.1, Y + 1.05); K.rc(0.2, 0.3, -1.3, 0, Y + 0.1, Y + 1.05); K.rc(L - 0.3, L - 0.2, -1.3, 0, Y + 0.1, Y + 1.05);
    K.rd('iron', [0.25, -1.28, Y], [0.25, -1.28, Y + 1.05], 0.025); K.rd('iron', [L - 0.25, -1.28, Y], [L - 0.25, -1.28, Y + 1.05], 0.025);
    // (a cane chair and a pot of fern on the balcony)
    K.blk('wicker', 0.6, 1.1, -0.95, -0.45, Y + 0.4, Y + 0.45); K.blk('wicker', 0.6, 1.1, -0.5, -0.45, Y + 0.45, Y + 0.95); for (const [a, b] of [[0.62, -0.93], [1.06, -0.93], [0.62, -0.49], [1.06, -0.49]]) K.blk('wicker', a - 0.02, a + 0.02, b - 0.02, b + 0.02, Y, Y + 0.4);
  } else if (dr) {
    const bu0 = dr.uc - 1.5, bu1 = dr.uc + 1.5;
    K.blk('concrete_light', bu0, bu1, -1.15, -0.05, U - 0.12, Y, false); K.flo(bu0, bu1, -1.15, 0.45, Y);
    for (const u of [bu0 + 0.3, bu1 - 0.3]) K.rd('iron', [u, -0.05, U - 0.1], [u, -1.1, U - 0.5], 0.04);
    K.fence(bu0 + 0.05, -1.1, bu1 - 0.05, -1.1, Y, 1.0); K.fence(bu0 + 0.05, -1.1, bu0 + 0.05, -0.05, Y, 1.0); K.fence(bu1 - 0.05, -1.1, bu1 - 0.05, -0.05, Y, 1.0);
    K.lat('terracotta', [[0.001, 0], [0.12, 0.01], [0.17, 0.3], [0.001, 0.3]], bu0 + 0.35, -0.7, Y, 8); K.lat('palm_leaf', [[0.001, 0.28], [0.26, 0.42], [0.3, 0.66], [0.001, 0.85]], bu0 + 0.35, -0.7, Y, 8);
  }
  void rm; void front; void door; void lights; void bag; void col;
  return G;
}
const el_front = (K) => K.front;
const el_balcony = (K) => K.balcony;

/** The rooms of the first floor by the shop's trade: { id, use, rect: [u0, u1], d0, d1, doorU1, flip, zone, door (index of the window that is a door), extra }. */
export function layoutRooms(G, kind) {
  const { left, right, front, back } = G;
  const USE = {
    pub: ['living', 'bed', 'bed', 'store'], espresso: ['living', 'kitchen', 'bed', 'store'], milkbar: ['living', 'kitchen', 'bed', 'store'],
    butcher: ['living', 'kitchen', 'bed', 'work'], greengrocer: ['living', 'kitchen', 'bed', 'store'], chemist: ['living', 'kitchen', 'bed', 'work'],
    newsagent: ['living', 'kitchen', 'bed', 'store'], barber: ['living', 'kitchen', 'bed1', 'work'],
  }[kind] ?? ['living', 'kitchen', 'bed', 'store'];
  const EXTRA = { pub: [undefined, true, true, undefined] }[kind] ?? [];
  const mid = (a) => (a[0] + a[1]) / 2;
  void mid;
  return [
    { id: 'R1', use: USE[0], rect: left, d0: front[0], d1: front[1], doorU1: true, flip: true, zone: 'front', door: 1 },
    { id: 'R2', use: USE[1], rect: right, d0: front[0], d1: front[1], doorU1: false, flip: true, zone: 'front', door: -1, extra: EXTRA[1] },
    { id: 'R3', use: USE[2], rect: left, d0: back[0], d1: back[1], doorU1: true, flip: false, zone: 'back', extra: EXTRA[2] },
    { id: 'R4', use: USE[3], rect: right, d0: back[0], d1: back[1], doorU1: false, flip: false, zone: 'back' },
  ];
}
void box;

/** A sloped threshold from the footpath (gy) up to the shop's floor (F) across u0…u1: no riser to be taken for a wall (the walker's check of a shell counts steep faces in half-metre bands). */
export function doorWedge({ bag, col, W, R }, u0, u1, gy, F) {
  const len = Math.max(1.0, (F - gy) * 3), d0 = -len, d1 = 0.05;
  const P = (u, d, y) => W(u, d, y), T = [];
  const A0 = P(u0, d0, gy), A1 = P(u1, d0, gy), B1 = P(u1, d1, F), B0 = P(u0, d1, F);
  for (const t of [[A0, A1, B1], [A0, B1, B0]]) T.push(...t.flat(), ...t[0], ...t[2], ...t[1]);
  bag.add('concrete_light', fromTriangles(T));
  const a = W(u0, d0, 0), b = W(u0, d1, 0), dx = b[0] - a[0], dz = b[2] - a[2], dir = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
  col.ramp(R(u0, u1, d0, d1), gy, F, dir);
}

/**
 * The first floor of a Rocks terrace house that can be entered (rocks.js, `enter` with `up`): the timber stair rising from the hall
 * along the party wall to the back, the floor with the stairwell and its rail, the front bedroom with the balcony doors, the back
 * bedroom (a child's, a sewing room, a store or a lodger's by the household `variant`) and the landing, the ceiling under the roof.
 * c: { bag, col, lights, B, W, R (frame of the row), u0, u1 (the house's bay), PR, Dp, F, H1, top, wall, variant }.
 */
export function terraceUpper(c0) {
  const K = kit(c0), { bag, col, u0, u1, PR, Dp, F, H1, top, wall, variant } = K;
  const pw = 0.25, i0 = u0 + pw, i1 = u1 - pw, pu = u0 + 1.3, dB = Dp - pw, by = F + H1, C = by - 0.3, Y = by, fw = u1 - u0;
  const dLo = PR + 3.4, rise = Y - F, run = rise / SLOPE, dHi = dLo + run, dA = PR + 4.5, Hc = top - 0.12;
  const seed = Math.round(K.W(u0, 0, 0)[0] * 7 + K.W(u0, 0, 0)[2] * 13);
  // the stair: solid timber steps in the hall's strip (from the party wall to the passage wall), rising toward the back; a ramp collider
  const n = Math.round(rise / 0.19), tw = run / n, dir = (() => { const a = K.W(i0, dLo, 0), b = K.W(i0, dHi, 0), dx = b[0] - a[0], dz = b[2] - a[2]; return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n'); })();
  for (let k = 0; k < n; k++) { const t2 = F + (k + 1) * rise / n; K.blk('timber', i0, pu, dLo + k * tw, dLo + (k + 1) * tw, F, t2); if (k % 2) K.blk('wood_dark', i0, pu, dLo + k * tw, dLo + k * tw + 0.03, t2 - 0.04, t2 + 0.004); }
  col.ramp(K.R(i0, pu, dLo, dHi), F + 0.04, Y, dir);
  // a handrail along the party wall on posts, and a closed side beside the passage wall below
  K.rd('wood_dark', [i0 + 0.06, dLo, F + 0.95], [i0 + 0.06, dHi, Y + 0.95], 0.035);
  for (let k = 0; k <= 4; k++) { const d = dLo + run * k / 4; K.rd('wood_dark', [i0 + 0.06, d, F + rise * k / 4], [i0 + 0.06, d, F + rise * k / 4 + 0.95], 0.03); }
  // the floor: plaster under, boards on top, the stairwell [i0, pu] × [dA + 0.12, dHi] left open; no obstacle in it (the walls and floors carry the walker)
  const hole = [i0, pu, dA + 0.12, dHi], slab = minus([[i0, i1, PR, dB]], hole);
  for (const [a, b, c, d] of slab) { if (b - a < 0.02 || d - c < 0.02) continue; K.blk('plaster_white', a, b, c, d, C, by - 0.05); K.blk('timber', a, b, c, d, by - 0.05, by); K.flo(a, b, c, d, Y); }
  // the walls above the ground floor's: party walls and the back wall solid to the roof, the interior plastered; the ceiling
  for (const [a, b] of [[u0, i0], [i1, u1]]) K.blk(wall, a, b, PR, dB, C, top, true);
  K.blk(wall, u0, u1, dB, Dp, C, top, true);
  K.blk('plaster_white', i0, i0 + 0.03, PR + 0.03, dB, Y, Hc); K.blk('plaster_white', i1 - 0.03, i1, PR + 0.03, dB, Y, Hc); K.blk('plaster_white', i0, i1, dB - 0.03, dB, Y, Hc);
  K.blk('plaster_white', i0, i1, PR, dB, Hc, top - 0.1);
  // the front wall's colliders over the openings (the balcony doors reach the floor; the wall's pieces are drawn by the row)
  const holes = [[u0 + 0.6, u0 + 1.6], [u0 + fw - 1.6, u0 + fw - 0.6]].map(([a, b]) => ({ a, b, ya: Y + 0.05, yb: Y + 2.4 }));
  cutWall((p, q, ya, yb) => K.rc(p, q, 0, PR, ya, yb), u0, u1, C, top + 2, holes);
  // the partition behind the front bedroom, its doorway to the back room, and the rail round the stairwell
  const dr = [pu + 0.4, pu + 1.3];
  K.blk('plaster_white', i0, dr[0], dA, dA + 0.12, Y, Hc, true); K.blk('plaster_white', dr[1], i1, dA, dA + 0.12, Y, Hc, true); K.blk('plaster_white', dr[0], dr[1], dA, dA + 0.12, Y + 2.1, Hc);
  for (const u of dr) K.blk('wood_dark', u - 0.04, u + 0.04, dA - 0.03, dA + 0.15, Y, Y + 2.15); K.blk('wood_dark', dr[0], dr[1], dA - 0.03, dA + 0.15, Y + 2.1, Y + 2.18);
  K.fence(pu + 0.04, dA + 0.12, pu + 0.04, dHi, Y, 0.95);
  K.blk('wood_dark', pu - 0.04, pu + 0.12, dHi - 0.06, dHi + 0.06, Y, Y + 1.0);     // the newel at the stair's head
  // the front bedroom: a double bed along the party wall with its head to the partition, a wardrobe, a dressing table, a chest, a rug, curtains on the balcony doors
  const cov = pickH(COV, hash(u0, F, seed)), bw = 1.4, bd0 = dA - 2.05;
  K.blk('iron', i0 + 0.04, i0 + 0.04 + bw, bd0, dA - 0.04, Y + 0.3, Y + 0.36, true); K.blk('cloth_white', i0 + 0.08, i0 + bw, bd0 + 0.04, dA - 0.08, Y + 0.36, Y + 0.56); K.blk(cov, i0 + 0.07, i0 + bw + 0.01, bd0 + 0.45, dA - 0.08, Y + 0.56, Y + 0.62);
  K.blk('cloth_white', i0 + 0.15, i0 + bw - 0.08, dA - 0.5, dA - 0.1, Y + 0.56, Y + 0.7);
  for (const u of [i0 + 0.04, i0 + 0.04 + bw - 0.03]) { K.blk('iron', u, u + 0.03, bd0, bd0 + 0.03, Y, Y + 0.7); K.blk('iron', u, u + 0.03, dA - 0.07, dA - 0.04, Y, Y + 1.1); }
  K.blk('iron', i0 + 0.04, i0 + 0.04 + bw, dA - 0.07, dA - 0.04, Y + 0.95, Y + 1.1);
  K.blk('wood_dark', i1 - 0.6, i1 - 0.02, dA - 1.3, dA - 0.1, Y, Y + 1.9, true); K.blk('wood_painted', i1 - 0.63, i1 - 0.6, dA - 1.25, dA - 0.15, Y + 0.05, Y + 1.85);
  K.blk('wood_dark', i1 - 0.5, i1 - 0.02, dA - 2.6, dA - 1.7, Y, Y + 0.78, true); K.blk('mirror_tin', i1 - 0.05, i1 - 0.02, dA - 2.45, dA - 1.85, Y + 0.9, Y + 1.6);
  K.blk('wood_painted', i0 + 0.04, i0 + 0.5, PR + 0.4, PR + 1.2, Y, Y + 0.45, true);
  K.blk(pickH(COV, hash(F, u0, seed)), i0 + bw + 0.15, i0 + bw + 1.3, bd0 + 0.2, dA - 0.4, Y, Y + 0.012);
  for (const [a, b] of [[u0 + 0.6, u0 + 1.6], [u0 + fw - 1.6, u0 + fw - 0.6]]) for (const s of [0, 1]) K.blk(pickH(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_blue', 'cloth_white'], hash(a, F, seed)), s ? b - 0.25 : a, s ? b : a + 0.25, PR + 0.05, PR + 0.11, Y, Y + 2.5);
  K.lamp((i0 + i1) / 2, (PR + dA) / 2, Hc - 0.02, 0.5, true);
  // the back room (right of the stairwell) by the household, and the landing at the stair's head
  const ru0 = pu + 0.2, ru1 = i1 - 0.02, d0 = dA + 0.22, d1 = dB - 0.1, v = variant ?? 0;
  const bedS = (u, d) => { K.blk('iron', u, u + 0.9, d, d + 1.95, Y + 0.3, Y + 0.36, true); K.blk('cloth_white', u + 0.04, u + 0.86, d + 0.04, d + 1.91, Y + 0.36, Y + 0.54); K.blk(pickH(COV, hash(u, d, seed)), u + 0.03, u + 0.87, d + 0.5, d + 1.92, Y + 0.54, Y + 0.6); K.blk('cloth_white', u + 0.1, u + 0.8, d + 0.06, d + 0.4, Y + 0.54, Y + 0.66);
    for (const [a, b] of [[u, d], [u + 0.87, d], [u, d + 1.92], [u + 0.87, d + 1.92]]) K.blk('iron', a, a + 0.03, b, b + 0.03, Y, Y + (b === d ? 0.9 : 0.6)); K.blk('iron', u, u + 0.9, d, d + 0.03, Y + 0.85, Y + 0.9); };
  // (everything stands along the right wall, so that the way from the stair's head to the doorway stays clear)
  if (v === 0) {      // two children's beds head to the back
    bedS(ru1 - 0.95, d0 + 0.2); if (d0 + 4.4 < d1) bedS(ru1 - 0.95, d0 + 2.4);
    K.blk('cloth_red', ru0 + 0.4, ru0 + 1.2, d0 + 1.6, d0 + 2.3, Y, Y + 0.012);
  } else if (v === 1) {   // a sewing room: the treadle machine, a dress form, a cutting table
    K.blk('wood_dark', ru1 - 0.55, ru1 - 0.05, d0 + 0.3, d0 + 1.3, Y + 0.72, Y + 0.77, true); for (const [a, b] of [[0.1, 0.3], [0.5, 0.3], [0.1, 1.25], [0.5, 1.25]]) K.blk('iron', ru1 - 0.6 + a, ru1 - 0.56 + a, d0 + b, d0 + b + 0.04, Y, Y + 0.72);
    K.blk('car_black', ru1 - 0.4, ru1 - 0.1, d0 + 0.55, d0 + 0.95, Y + 0.77, Y + 1.0);
    K.lat('timber', [[0.001, 0], [0.2, 0.02], [0.03, 0.04], [0.03, 0.8], [0.18, 0.95], [0.12, 1.3], [0.001, 1.35]], ru1 - 0.4, d0 + 2.0, Y, 10); K.col.circle(...(() => { const p = K.W(ru1 - 0.4, d0 + 2.0, 0); return [p[0], p[2]]; })(), 0.2, Y, Y + 1.3);
    K.blk('wood_painted', ru1 - 0.9, ru1 - 0.05, d0 + 2.6, d0 + 3.5, Y + 0.8, Y + 0.84, true); K.blk('cloth_blue', ru1 - 0.8, ru1 - 0.15, d0 + 2.7, d0 + 3.4, Y + 0.84, Y + 0.87);
    for (const d of [d0 + 2.6, d0 + 3.46]) for (const u of [ru1 - 0.9, ru1 - 0.09]) K.blk('wood_painted', u, u + 0.04, d, d + 0.04, Y, Y + 0.8);
  } else if (v === 2) {   // a store: trunks, a tea chest, cartons, a pram under a sheet
    let d = d0 + 0.1;
    for (let k = 0; k < 4; k++) { const h2 = 0.4 + 0.25 * hash(k, d0, seed), len = 0.6 + 0.3 * hash(d0, k, seed); if (d + len > d1) break; K.blk(pickH(['wood_painted', 'timber', 'wood_dark', 'cloth_ochre'], hash(k, d, seed)), ru1 - 0.85, ru1 - 0.05, d, d + len, Y, Y + h2, true); d += len + 0.12; }
    K.blk('cloth_white', ru1 - 0.8, ru1 - 0.1, Math.min(d, d1 - 1.0), Math.min(d + 0.9, d1), Y, Y + 0.7, true);
  } else {                 // a lodger: an iron bed, a table with a hotplate and kettle, a chest of drawers
    bedS(ru1 - 0.95, d0 + 0.2);
    K.blk('wood_painted', ru1 - 0.7, ru1 - 0.05, d0 + 2.4, d0 + 2.95, Y + 0.72, Y + 0.76, true); for (const [a, b] of [[0.05, 0.05], [0.6, 0.05], [0.05, 0.5], [0.6, 0.5]]) K.blk('wood_painted', ru1 - 0.7 + a, ru1 - 0.66 + a, d0 + 2.4 + b, d0 + 2.44 + b, Y, Y + 0.72);
    K.blk('steel_chrome', ru1 - 0.5, ru1 - 0.25, d0 + 2.55, d0 + 2.8, Y + 0.76, Y + 0.8); K.lat('aluminium_dull', [[0.001, 0], [0.09, 0], [0.07, 0.15], [0.03, 0.18], [0.001, 0.18]], ru1 - 0.2, d0 + 2.7, Y + 0.76, 8);
    if (d0 + 4.1 < d1) { K.blk('wood_dark', ru1 - 0.5, ru1 - 0.02, d0 + 3.2, d0 + 4.0, Y, Y + 0.9, true); K.blk('timber', ru1 - 0.52, ru1, d0 + 3.18, d0 + 4.02, Y + 0.9, Y + 0.93); }
  }
  // the landing: a chest and a picture at the stair's head, a lamp over the well
  K.blk('wood_dark', i0 + 0.05, i0 + 0.5, dB - 0.9, dB - 0.1, Y, Y + 0.5, true); K.blk('gilt_bronze', i0 + 0.5, i0 + 1.0, dB - 0.04, dB - 0.02, Y + 1.4, Y + 1.9);
  K.lamp((i0 + pu) / 2, dHi - 0.6, Hc - 0.02, 0.5);
  K.lamp((ru0 + ru1) / 2, (d0 + d1) / 2, Hc - 0.02);
  // the balcony: the floor to walk on, the rail to keep one in (the row's own balcony drawn by rocks.js is as wide as the house)
  K.flo(u0 + 0.05, u0 + fw - 0.05, -1.2, PR, Y);
  K.rc(u0 + 0.05, u0 + fw - 0.05, -1.2, -1.12, Y + 0.1, Y + 1.0); K.rc(u0 + 0.0, u0 + 0.1, -1.2, 0, Y + 0.1, Y + 1.0); K.rc(u0 + fw - 0.1, u0 + fw, -1.2, 0, Y + 0.1, Y + 1.0);
  void bag; void u1; void H1;
  return { dLo, dHi, dA, pu, i0, i1, Y };
}
