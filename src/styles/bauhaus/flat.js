// The first-floor flats of Dessau's tenements (docs/settlements/bauhaus-dessau.md §13): the stair behind the ground floor's partition, the shell of the
// first storey (walls with real windows, floor, ceiling) and its rooms — the good parlour and the bedroom on the street, the living kitchen behind with the
// range, the dresser, the washing and the seamstress's treadle machine, the sleeping chambers at the back. Local frame: frame.js (u along the front, v inward).
import { slab, rng } from './kit.js';
import { chr, tbl, stove, pend, rug } from './tenement.js';

const FL = 0.12, FT = 0.35, RISER = 0.18, TREAD = 0.28;
const PW = 'plaster_white';

/**
 * Whether the lot has an enterable first-floor flat, and its measures (local frame, metres): the stair (u0..u1, climbing from v0 to vEnd), the partitions
 * (P1 at v = pv between the street rooms and the kitchen; P2 at vK before the chambers; the street rooms divided at u = mA, the chambers at u = mR), the
 * hollow's depth E (what lies behind stays a solid mass) and the floor and ceiling heights. W, D: the house's width and depth; hs: houseSpec(l).
 */
export function flatSpec(l, hs, W, D) {
  if (hs.n < 3 || D < 17 || W < 11.5) return null;
  const q = rng((l.seed >>> 0) * 31 + 17);
  if (q() > 0.78) return null;
  const { yc, yb, SH } = hs, pv = Math.min(D - 5.5, l.shop ? 7.2 : 6.2);
  const yF = yb + 0.025, n = Math.round((yF - FL) / RISER), run = n * TREAD, v0 = pv + 0.5, vEnd = v0 + run, vK = vEnd + 1.5;
  const eMax = D - 0.3, rear = eMax - (vK + 0.12) >= 2.6;
  const E = rear ? (eMax - (vK + 0.12 + 3.4) < 3 ? eMax : vK + 0.12 + 3.4) : vK + 0.12;
  const mA = Math.round(W * 0.55), mR = Math.round(W / 2);
  return { W, D, pv, yc, yb, SH, yF, yR: yb + SH - 0.25, n, run, v0, vEnd, vK, E, rear, mA, mR, u0: 0.36, u1: 1.46, shop: !!l.shop, seed: l.seed >>> 0, modern: !!hs.modern };
}

/** The chair, table and figure places of the flat, for the townspeople (local u, v, the point faced, and the kind of person). */
export function flatSeats(fs) {
  const { W, pv, vEnd, vK, mA } = fs, dA = (0.3 + mA) / 2, uT = Math.max(5.0, (1.58 + W - 1.2) / 2);
  return [
    { id: 'kitchen', at: [uT - 0.45, pv + 1.75], to: [uT - 0.45, pv + 2.65], pose: 'sit', woman: true, apron: true },
    { id: 'parlour', at: [dA + 0.4, 1.8], to: [dA + 0.4, 2.65], pose: 'sit', woman: false },
    { id: 'sewing', at: [3.7, vK - 0.8], to: [3.7, vK - 1.6], pose: 'sit', woman: true, apron: true },
    { id: 'hearth', at: [W - 1.9, pv + 2.7], to: [W - 0.8, pv + 2.7], pose: 'stand', woman: true, apron: true },
  ].map((s) => ({ ...s, vEnd }));
}

// ── walls ───────────────────────────────────────────────────────────────────────────────────────
export const wallU = (F, c, t, ua, ub, y0, y1, doors = []) => F.wall({ u0: ua, u1: ub, v: c, th: t, y0, y1, mat: PW, ops: doors.map(([a, b]) => ({ u0: a, u1: b, y1: y0 + 2.2 })) });
export function wallV(F, c, t, va, vb, y0, y1, doors = []) {
  const cuts = [va, ...doors.flatMap(([a, b]) => [a, b]), vb].sort((p, q) => p - q);
  for (let i = 0; i + 1 < cuts.length; i += 2) F.s(PW, c, c + t, y0, y1, cuts[i], cuts[i + 1]);
  for (const [a, b] of doors) F.s(PW, c, c + t, y0 + 2.2, y1, a, b);
}
/** The architrave round a door in a wall along u (at v = c .. c + t) and in a wall along v (at u = c .. c + t). */
export const archU = (F, c, t, d0, d1, y) => { const e = 0.07, a = c - 0.02, b = c + t + 0.02; F.b('paint_white', d0 - e, d0, y, y + 2.28, a, b); F.b('paint_white', d1, d1 + e, y, y + 2.28, a, b); F.b('paint_white', d0, d1, y + 2.17, y + 2.28, a, b); };
export const archV = (F, c, t, d0, d1, y) => { const e = 0.07, a = c - 0.02, b = c + t + 0.02; F.b('paint_white', a, b, y, y + 2.28, d0 - e, d0); F.b('paint_white', a, b, y, y + 2.28, d1, d1 + e); F.b('paint_white', a, b, y + 2.17, y + 2.28, d0, d1); };

// ── furniture ───────────────────────────────────────────────────────────────────────────────────
/** A bed with its head at v = vh, the foot toward dir (±1 along v). */
export function bedV(F, uc, vh, dir, y, w, col, len = 2.0) {
  const a = dir < 0 ? vh - len : vh, b = dir < 0 ? vh : vh + len, u0 = uc - w / 2, u1 = uc + w / 2;
  F.b('wood_painted', u0, u1, y + 0.25, y + 0.45, a, b);
  F.b('cloth_white', u0 + 0.03, u1 - 0.03, y + 0.45, y + 0.58, a + 0.03, b - 0.03);
  const [c0, c1] = dir < 0 ? [a + 0.03, vh - 0.6] : [vh + 0.6, b - 0.03];
  F.b(col, u0 + 0.01, u1 - 0.01, y + 0.58, y + 0.64, c0, c1);                                   // the blanket over the foot part
  F.b('cloth_white', u0 + 0.08, u1 - 0.08, y + 0.58, y + 0.7, dir < 0 ? vh - 0.55 : vh + 0.05, dir < 0 ? vh - 0.05 : vh + 0.55);   // the pillows
  F.b('wood_painted', u0, u1, y, y + 1.05, dir < 0 ? vh - 0.07 : vh, dir < 0 ? vh : vh + 0.07);   // the headboard
  F.b('wood_painted', u0, u1, y, y + 0.6, dir < 0 ? a : b - 0.06, dir < 0 ? a + 0.06 : b);        // the footboard
  F.k(u0, u1, y, y + 0.65, a, b);
}
/** A cupboard / wardrobe with its doors toward `face` ('v-' | 'v+' | 'u-' | 'u+'), a cornice and a door seam. */
export function cupboard(F, u0, u1, v0, v1, y, h, face, m = 'wood_painted') {
  F.s(m, u0, u1, y, y + h, v0, v1); F.b('wood_dark', u0 - 0.02, u1 + 0.02, y + h, y + h + 0.06, v0 - 0.02, v1 + 0.02);
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
  if (face === 'v-') F.b('wood_dark', um - 0.01, um + 0.01, y + 0.08, y + h - 0.08, v0 - 0.008, v0); else if (face === 'v+') F.b('wood_dark', um - 0.01, um + 0.01, y + 0.08, y + h - 0.08, v1, v1 + 0.008);
  else if (face === 'u-') F.b('wood_dark', u0 - 0.008, u0, y + 0.08, y + h - 0.08, vm - 0.01, vm + 0.01); else F.b('wood_dark', u1, u1 + 0.008, y + 0.08, y + h - 0.08, vm - 0.01, vm + 0.01);
}
/** A picture frame on a wall along u at depth v (toward dir ±1). */
export const pic = (F, u, v, dir, y0, y1, w, c, c2) => {          // a framed picture on a wall along u at depth v, facing dir (±1)
  const d = dir > 0 ? 1 : -1, f0 = v, f1 = v + d * 0.04, p1 = f1 + d * 0.02, p2 = p1 + d * 0.02, lo = (a, b) => [Math.min(a, b), Math.max(a, b)];
  F.b('wood_dark', u - w / 2 - 0.04, u + w / 2 + 0.04, y0 - 0.04, y1 + 0.04, ...lo(f0, f1));
  F.b(c, u - w / 2, u + w / 2, y0, y1, ...lo(f1, p1)); F.b(c2, u - w / 4, u + w / 4, y0 + (y1 - y0) * 0.25, y1 - (y1 - y0) * 0.25, ...lo(p1, p2));
};
export const plant = (F, u, v, y) => { F.b('terracotta', u - 0.1, u + 0.1, y, y + 0.16, v - 0.1, v + 0.1); F.b('cloth_green', u - 0.17, u + 0.17, y + 0.16, y + 0.5, v - 0.17, v + 0.17); F.b('cloth_red', u - 0.06, u + 0.06, y + 0.5, y + 0.58, v - 0.06, v + 0.06); };

/** The stair from the ground floor to the first (through the hole in the floor) with its balusters and rail. */
function stair(F, s) {
  const { n, run, v0, vEnd, u0, u1, yF } = s, rise = yF - FL, dv = run / n, sk = F.sk;
  for (let i = 0; i < n; i++) F.b('timber', u0, u1, FL - 0.02, FL + rise * (i + 1) / n, v0 + i * dv, v0 + (i + 1) * dv);
  const dir = { n: 's', s: 'n', w: 'e', e: 'w' }[F.f];
  sk.col.ramp(F._r(u0, u1, v0, vEnd), FL, yF, dir);
  F.rod('wood_dark', u1 - 0.04, FL + 0.95, v0, u1 - 0.04, yF + 0.95, vEnd, 0.025, 5);
  for (let i = 1; i < n; i += 3) F.rod('iron', u1 - 0.04, FL + rise * i / n, v0 + (i + 0.5) * dv, u1 - 0.04, FL + 0.95 + rise * i / n, v0 + (i + 0.5) * dv, 0.01, 4);
  F.b('wood_dark', u1 - 0.09, u1 - 0.0, FL, FL + 1.1, v0 - 0.09, v0);                          // the newel
  F.rod('wood_dark', u0 + 0.03, FL + 0.9, v0, u0 + 0.03, yF + 0.9, vEnd, 0.02, 4);            // the wall rail
}

/**
 * The first floor: the floor with the stair's hole, the ceiling, the walls of the shaft and the rooms, the doors; the street windows are the house's (o.wins).
 * o: { wins: [{ u, w, y0, y1 }], r: rng of the house }.
 */
export function buildFlat(F, s, o) {
  const { W, pv, yF, yR, v0, vEnd, vK, E, rear, mA, mR, u0, u1, n, run } = s, y = yF, r = o.r ?? rng(s.seed + 5), sk = F.sk;
  const hole = F._r(u0, u1, v0, vEnd);
  slab(sk, F._r(0.3, W - 0.3, FT, E), s.yb, [hole], { mat: PW, th: 0.3, top: 'wood_ochre' });
  F.b(PW, 0.3, W - 0.3, yR - 0.04, yR, FT, E);                                               // the ceiling
  stair(F, s);
  // the shaft: its east wall (open at the landing) and its foot
  F.s(PW, u1, u1 + 0.12, y, yR, v0 - 0.12, vEnd - 1.3); F.s(PW, 0.3, u1 + 0.12, y, yR, v0 - 0.12, v0);
  // the room colours (distemper) on the outer walls
  const col = [['stucco_cream', 'stucco_pale', 'plaster_grey'][Math.floor(r() * 3)], ['stucco_pale', 'stucco_warm', 'paint_white'][Math.floor(r() * 3)], ['paint_white', 'stucco_cream'][Math.floor(r() * 2)], ['stucco_pale', 'plaster_grey'][Math.floor(r() * 2)]];
  const lin = (u0_, u1_, v0_, v1_, m) => { F.b(m, u0_, u0_ + 0.012, y, yR, v0_, v1_); F.b(m, u1_ - 0.012, u1_, y, yR, v0_, v1_); if (v0_ > 0) F.b(m, u0_, u1_, y, yR, v0_, v0_ + 0.012); };
  void lin;
  // ── the street rooms: the parlour (left) and the bedroom (right), the partition P1 with a door each ──
  const dA = (0.3 + mA) / 2, dB = (mA + 0.12 + W - 0.3) / 2, c1 = mA - 2.2, c2 = W - 1.5;
  const d1 = [c1 - 0.45, c1 + 0.45], d2 = [c2 - 0.45, c2 + 0.45];
  wallU(F, pv, 0.15, 0.3, W - 0.3, y, yR, [d1, d2]); archU(F, pv, 0.15, d1[0], d1[1], y); archU(F, pv, 0.15, d2[0], d2[1], y);
  wallV(F, mA, 0.12, FT, pv, y, yR, []);
  // wall colour on the outer walls of the two rooms (the left wall, the front's inner face, the right wall)
  F.b(col[0], 0.3, 0.32, y, yR, FT + 0.02, pv); F.b(col[0], 0.32, mA, y, yR, FT, FT + 0.02);
  F.b(col[1], W - 0.32, W - 0.3, y, yR, FT + 0.02, pv); F.b(col[1], mA + 0.12, W - 0.32, y, yR, FT, FT + 0.02);
  for (const [a, b] of [[0.31, mA], [mA + 0.12, W - 0.31]]) F.b('wood_painted', a, b, y, y + 1.0, FT + 0.012, FT + 0.03);   // the dado under the windows' sills
  // the parlour
  rug(F, dA - 1.6, dA + 1.6, 1.4, 4.1, y, 'cloth_red');
  tbl(F, dA - 0.7, dA + 0.7, 2.2, 3.1, y, 0.76, 'wood_dark'); F.b('cloth_white', dA - 0.5, dA + 0.5, y + 0.76, y + 0.79, 2.3, 3.0);
  F.lathe('glaze_green', [[0.001, 0], [0.08, 0.02], [0.1, 0.12], [0.06, 0.24], [0.001, 0.26]], dA, y + 0.79, 2.65, 8);      // a vase on the cloth
  for (const [u, v, d] of [[dA - 0.4, 1.8, 'v+'], [dA + 0.4, 1.8, 'v+'], [dA - 0.4, 3.5, 'v-'], [dA + 0.4, 3.5, 'v-']]) chr(F, u, v, d, y);
  cupboard(F, 0.3, 0.86, 2.4, 4.2, y, 1.9, 'u+', 'wood_dark');                                  // the Vertiko against the west wall
  F.b('cloth_white', 0.32, 0.8, y + 1.9, y + 1.93, 2.7, 3.9); F.lathe('glaze_green', [[0.001, 0], [0.1, 0.02], [0.12, 0.14], [0.08, 0.3], [0.001, 0.32]], 0.58, y + 1.93, 3.3, 8);
  F.s('wood_painted', 0.7, 2.4, y, y + 0.46, pv - 1.05, pv - 0.17); F.b('cloth_ochre', 0.74, 2.36, y + 0.46, y + 0.55, pv - 1.01, pv - 0.4); F.b('wood_painted', 0.7, 2.4, y + 0.46, y + 0.95, pv - 0.3, pv - 0.17);   // the sofa
  for (const k of [0, 1]) F.b(['cloth_red', 'cloth_green'][k], 0.85 + k * 1.1, 1.25 + k * 1.1, y + 0.55, y + 0.85, pv - 0.4, pv - 0.3);
  stove(F, mA - 0.6, pv - 0.6, y, true);
  pic(F, 1.6, pv, -1, y + 1.35, y + 1.95, 0.9, 'car_red', 'cloth_white'); pic(F, 3.0, pv, -1, y + 1.45, y + 2.0, 0.5, 'paint_blue', 'paint_white');
  pend(F, dA, yR, 2.65, false);
  // the bedroom
  const bu = Math.min(dB - 0.5, mA + 0.12 + 1.7);
  bedV(F, bu, pv, -1, y, 1.5, ['cloth_red', 'cloth_green', 'paint_blue'][Math.floor(r() * 3)]);
  cupboard(F, mA + 0.12, mA + 0.72, 0.9, 2.9, y, 2.2, 'u+');                                       // the wardrobe on the partition
  F.s('wood_painted', W - 0.95, W - 0.3, y, y + 0.85, 1.1, 2.1); F.b('tile_white', W - 0.97, W - 0.28, y + 0.85, y + 0.89, 1.08, 2.12);
  F.lathe('glaze_green', [[0.001, 0], [0.17, 0.02], [0.21, 0.1], [0.001, 0.1]], W - 0.62, y + 0.89, 1.4, 10); F.lathe('glaze_green', [[0.001, 0], [0.07, 0.02], [0.09, 0.14], [0.05, 0.26], [0.001, 0.26]], W - 0.62, y + 0.89, 1.85, 8);   // the washstand, basin and jug
  F.b('paint_white', W - 0.36, W - 0.32, y + 1.4, y + 2.0, 1.25, 1.95);                       // the mirror over it
  chr(F, W - 1.6, 3.0, 'u+', y); F.s('wood_painted', bu - 0.4, bu + 0.4, y, y + 0.45, pv - 2.75, pv - 2.25); F.b('cloth_grey', bu - 0.38, bu + 0.38, y + 0.45, y + 0.5, pv - 2.73, pv - 2.27);   // a chair, the chest at the bed's foot
  rug(F, bu - 1.3, bu + 1.3, pv - 2.6, pv - 0.4, y, 'cloth_grey');
  pic(F, bu, pv, -1, y + 1.55, y + 2.1, 0.8, 'cloth_green', 'paint_ochre');
  // ── the living kitchen: the range with its pipe and the coal box, the sink, the table, the dresser, the bench, coats, the tub and the washing ──
  const uT = Math.max(5.0, (1.58 + W - 1.2) / 2);
  F.s('iron', W - 1.0, W - 0.3, y, y + 0.85, pv + 1.0, pv + 2.2); F.b('steel_grey', W - 1.04, W - 0.28, y + 0.85, y + 0.9, pv + 0.96, pv + 2.24); F.rod('iron', W - 0.65, y + 0.9, pv + 1.6, W - 0.65, yR, pv + 1.6, 0.07, 6);
  for (const v of [pv + 1.3, pv + 1.9]) F.lathe('iron', [[0.1, 0], [0.14, 0.03], [0.14, 0.07], [0.001, 0.08]], W - 0.7, y + 0.9, v, 8);
  F.b('wood_painted', W - 0.85, W - 0.35, y, y + 0.42, pv + 2.35, pv + 2.95); F.b('cloth_black', W - 0.8, W - 0.4, y + 0.42, y + 0.5, pv + 2.4, pv + 2.9);   // the coal box
  F.s('glaze_white', W - 0.9, W - 0.3, y, y + 0.88, pv + 3.2, pv + 4.1); F.b('steel_chrome', W - 0.62, W - 0.58, y + 0.88, y + 1.12, pv + 3.6, pv + 3.64);   // the sink and its tap
  F.lathe('iron_galv', [[0.13, 0], [0.16, 0.3], [0.001, 0.3]], W - 1.4, y, pv + 3.6, 8);
  tbl(F, uT - 0.8, uT + 0.8, pv + 2.2, pv + 3.1, y, 0.78, 'paint_white');
  for (const [u, v, d] of [[uT - 0.45, pv + 1.75, 'v+'], [uT + 0.45, pv + 1.75, 'v+'], [uT - 0.45, pv + 3.55, 'v-'], [uT + 0.45, pv + 3.55, 'v-'], [uT - 1.25, pv + 2.65, 'u+']]) chr(F, u, v, d, y);
  F.lathe('glaze_green', [[0.1, 0], [0.12, 0.08], [0.1, 0.2], [0.001, 0.2]], uT, y + 0.78, pv + 2.65, 8);
  const cc = ((mA - 1.5) + (W - 2.2)) / 2; cupboard(F, cc - 0.9, cc + 0.9, pv + 0.2, pv + 0.65, y, 2.1, 'v+', 'wood_painted');
  for (let k = 0; k < 4; k++) { F.b('glaze_green', cc - 0.8 + k * 0.4, cc - 0.55 + k * 0.4, y + 1.25, y + 1.5, pv + 0.65, pv + 0.68); F.b('paint_white', cc - 0.78 + k * 0.4, cc - 0.58 + k * 0.4, y + 1.65, y + 1.85, pv + 0.65, pv + 0.68); }   // plates on the dresser's shelves
  F.s('wood_painted', 1.62, 2.1, y, y + 0.45, pv + 1.5, pv + 3.5); F.b('wood_painted', 1.62, 1.7, y + 0.45, y + 0.95, pv + 1.5, pv + 3.5);   // the kitchen bench along the shaft
  F.b('wood_dark', 1.58, 1.66, y + 1.65, y + 1.7, pv + 4.1, pv + 5.3);
  for (let k = 0; k < 4; k++) F.b(['cloth_red', 'cloth_grey', 'cloth_red', 'cloth_grey'][k], 1.58, 1.72, y + 0.6, y + 1.62, pv + 4.15 + k * 0.3, pv + 4.35 + k * 0.3);   // coats on the rail
  F.lathe('wood_painted', [[0.38, 0], [0.42, 0.08], [0.42, 0.4], [0.001, 0.4]], W - 2.2, y, pv + 5.0, 10); F.b('wood_ochre', W - 2.7, W - 2.55, y, y + 0.6, pv + 4.4, pv + 4.9);   // the wash tub and the board
  const vl = pv + 4.2;                                                                          // the washing line across the room
  F.rod('iron', 2.4, yR - 0.4, vl, W - 1.2, yR - 0.4, vl, 0.006, 3);
  for (let k = 0; k < 5; k++) { const a = 3.0 + k * (W - 6.6) / 4; F.b(['cloth_white', 'cloth_grey', 'cloth_white', 'cloth_red', 'cloth_white'][k], a, a + 0.5, yR - 1.15, yR - 0.4, vl - 0.02, vl + 0.02); }
  pend(F, uT, yR, pv + 2.65, false);
  // the seamstress's corner: a treadle machine, a chair, a dressmaker's dummy, the work on a table
  F.b('wood_dark', 3.2, 4.2, y + 0.77, y + 0.81, vK - 1.85, vK - 1.35); for (const u of [3.3, 4.1]) F.b('iron', u - 0.03, u + 0.03, y + 0.05, y + 0.77, vK - 1.7, vK - 1.5);
  F.b('iron', 3.3, 4.1, y + 0.05, y + 0.1, vK - 1.72, vK - 1.48); F.b('iron', 3.55, 3.95, y + 0.81, y + 1.07, vK - 1.78, vK - 1.5);
  F.k(3.2, 4.2, y, y + 0.81, vK - 1.85, vK - 1.35);
  chr(F, 3.7, vK - 0.8, 'v-', y);
  F.lathe('cloth_grey', [[0.001, 0], [0.12, 0.02], [0.13, 0.9], [0.17, 1.1], [0.14, 1.3], [0.06, 1.45], [0.001, 1.46]], 4.9, y + 0.2, vK - 1.5, 8); F.rod('wood_dark', 4.9, y, vK - 1.5, 4.9, y + 0.22, vK - 1.5, 0.02, 4);
  rug(F, 0.5, 1.5, vEnd + 0.15, vK - 0.3, y, 'cloth_red');
  // ── the sleeping chambers at the back, behind P2 with a door each ──
  if (rear) {
    const dd1 = [0.8, 1.7], dd2 = [mR + 0.6, mR + 1.5];
    wallU(F, vK, 0.12, 0.3, W - 0.3, y, yR, [dd1, dd2]); archU(F, vK, 0.12, dd1[0], dd1[1], y); archU(F, vK, 0.12, dd2[0], dd2[1], y);
    wallV(F, mR, 0.12, vK + 0.12, E, y, yR, []);
    F.b(col[2], 0.3, 0.32, y, yR, vK + 0.12, E - 0.02); F.b(col[2], 0.32, mR, y, yR, E - 0.02, E);
    F.b(col[3], W - 0.32, W - 0.3, y, yR, vK + 0.12, E - 0.02); F.b(col[3], mR + 0.12, W - 0.32, y, yR, E - 0.02, E);
    bedV(F, 3.2, E, -1, y, 1.5, ['cloth_green', 'cloth_red', 'paint_blue'][Math.floor(r() * 3)]);
    cupboard(F, 0.3, 0.8, vK + 0.7, vK + 2.5, y, 2.2, 'u+');
    F.s('wood_painted', 4.2, 4.9, y, y + 0.55, E - 1.3, E - 0.4); F.b('cloth_grey', 4.22, 4.88, y + 0.55, y + 0.6, E - 1.28, E - 0.42);   // a chest
    rug(F, 2.0, 4.4, E - 3.0, E - 2.1, y, 'cloth_grey');
    const w2 = Math.max(0, W - 0.3 - (mR + 0.12));
    for (const [k, c] of [[0, 'cloth_red'], [1, 'cloth_green']]) if (mR + 2.6 + k * 1.3 + 0.45 < W - 0.3) bedV(F, mR + 2.6 + k * 1.3, E, -1, y, 0.9, c, 1.8);
    F.s('wood_painted', W - 0.9, W - 0.3, y, y + 0.7, vK + 0.8, vK + 1.8); F.b('cloth_white', W - 0.88, W - 0.32, y + 0.7, y + 0.73, vK + 0.82, vK + 1.78); void w2;   // a chest of drawers
    pend(F, 3.2, yR, vK + 1.8, false); pend(F, mR + 3.0, yR, vK + 1.8, false);
  }
  void n; void run;
  // curtains and a pot plant at each street window (the windows are the house's)
  for (const win of o.wins) {
    const { u, w, y0 } = win, open = 0.25 + r() * 0.2;
    if (u < mA - 0.2 || u > mA + 0.4) { F.b('cloth_white', u - w, u - w + open, y0 + 0.3, win.y1 - 0.05, FT + 0.03, FT + 0.06); F.b('cloth_white', u + w - open, u + w, y0 + 0.3, win.y1 - 0.05, FT + 0.03, FT + 0.06); }
    if (r() < 0.45 && y0 > y + 0.6) plant(F, u + (r() < 0.5 ? -0.3 : 0.3), FT + 0.16, y0);
  }
}

/**
 * The upper floor of a Törten row house (SieTö I: one room to the street, two to the garden, reached by a stair): the floor with the stair's hole, the ceiling, the shaft,
 * the street bedroom, the children's room and the garden bedroom, with a window on the garden side. g: { Y, YC, YB, TOP, pv, T, stairV0, n, run }.
 */
export function buildRowUp(F, g, r) {
  const { YC, YB, TOP, pv, T, n, run } = g, W = F.W, D = F.D, y = YB + 0.025, v0 = pv + 0.3, vEnd = v0 + run, u0 = 0.36, u1 = 1.3, sk = F.sk, yR = TOP - 0.04, PWm = 'plaster_white';
  const hole = F._r(u0, u1, v0, vEnd);
  slab(sk, F._r(T, W - T, T, D - T), YB, [hole], { mat: PWm, th: 0.3, top: 'wood_ochre' });
  F.b(PWm, T, W - T, yR, TOP, T, D - T);
  const dv = run / n, rise = y - g.Y;
  for (let i = 0; i < n; i++) F.b('timber', u0, u1, g.Y - 0.02, g.Y + rise * (i + 1) / n, v0 + i * dv, v0 + (i + 1) * dv);
  sk.col.ramp(F._r(u0, u1, v0, vEnd), g.Y, y, { n: 's', s: 'n', w: 'e', e: 'w' }[F.f]);
  F.rod('wood_dark', u1 - 0.04, g.Y + 0.95, v0, u1 - 0.04, y + 0.95, vEnd, 0.025, 5);
  F.s(PWm, u1, u1 + 0.12, y, yR, v0 - 0.12, vEnd - 1.2); F.s(PWm, T, u1 + 0.12, y, yR, v0 - 0.12, v0);
  // the partitions: P1 (street room | the rest) with a door at the east end, P2 (the children's room | the garden bedroom) with a door in the middle
  const dP1 = [W - 1.6, W - 0.7], vP2 = 7.2, dP2 = [2.9, 3.8];
  wallU(F, pv, 0.15, T, W - T, y, yR, [dP1]); archU(F, pv, 0.15, dP1[0], dP1[1], y);
  wallU(F, vP2, 0.15, u1 + 0.12, W - T, y, yR, [dP2]); archU(F, vP2, 0.15, dP2[0], dP2[1], y);
  // the street bedroom: the parents' bed against P1, a wardrobe, a chest, a rug, a chair, the window's curtains
  bedV(F, 1.7, pv, -1, y, 1.5, ['cloth_red', 'cloth_green', 'paint_blue'][Math.floor(r() * 3)]);
  cupboard(F, T, 0.85, 0.9, 2.5, y, 2.1, 'u+');
  F.s('wood_painted', 2.9, 3.7, y, y + 0.5, 1.0, 1.5); F.b('cloth_grey', 2.92, 3.68, y + 0.5, y + 0.54, 1.02, 1.48);
  rug(F, 0.9, 2.5, pv - 2.7, pv - 0.4, y, 'cloth_grey'); chr(F, W - 1.2, 2.4, 'u+', y);
  pic(F, 3.2, pv, -1, y + 1.5, y + 2.0, 0.6, 'paint_blue', 'paint_white');
  // the children's room: a child's bed against P2, a chest of drawers on the shaft wall, a table and a stool
  bedV(F, 2.15, vP2, -1, y, 0.85, 'cloth_ochre', 1.7);
  cupboard(F, u1 + 0.12, u1 + 0.6, pv + 0.5, pv + 1.3, y, 1.0, 'u+');
  tbl(F, 4.0, 4.9, pv + 1.3, pv + 1.9, y, 0.62, 'wood_painted'); chr(F, 4.45, pv + 2.2, 'v-', y, 'wood_painted');
  // the garden bedroom, reached from the stair's landing: a single bed at the back wall, a washstand under the window, a lamp
  bedV(F, 4.3, D - T, -1, y, 0.9, ['cloth_green', 'cloth_red'][Math.floor(r() * 2)], 1.9);
  F.s('wood_painted', 1.7, 2.7, y, y + 0.8, D - T - 0.55, D - T); F.b('tile_white', 1.68, 2.72, y + 0.8, y + 0.84, D - T - 0.57, D - T);
  F.lathe('glaze_green', [[0.001, 0], [0.17, 0.02], [0.21, 0.1], [0.001, 0.1]], 2.2, y + 0.84, D - T - 0.3, 10);
  rug(F, 1.9, 3.5, vP2 + 0.5, vP2 + 1.5, y, 'cloth_red');
  pend(F, 1.8, yR, 5.9, false); pend(F, 3.0, yR, 8.5, false); pend(F, 2.6, yR, pv - 2.0, false);
}
