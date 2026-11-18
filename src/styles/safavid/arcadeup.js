// The upper floor of an entered shop of the arcade (docs/settlements/isfahan.md §25): the shopkeeper's dwelling over his
// shop. Inside the shop's back wall a narrow stair of two flights climbs in the thickness of the rear mass (a door at the
// left end, a flight along the wall, a landing, a flight back) to the room over the shop; the room opens by a door in
// its front wall on a loggia over the arcade's passage, and the loggia by the upper arch of the facade, with a lattice
// balustrade, on the square. Frame: s along the bay, d from the facade's axis away from the square; Q(s, d) → world.
// Only materials the arcade's plan already has.

import { box } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';

export const SHOP_CH = 5.35;                 // the ceiling of a shop with rooms over it (the vault of the arcade shops)
export const UP_FLOOR = SHOP_CH + 0.2;       // the floor of the room and the loggia
export const UP_ARCH_TOP = 10.3;

const cardinal = (ux, uz) => (Math.abs(ux) > Math.abs(uz) ? (ux > 0 ? 'e' : 'w') : (uz > 0 ? 's' : 'n'));

export function arcadeUpper({ bag, col, lights }, G) {
  const { Q, R, sub, y, h, w, c, s0, s1, d0, d1, d2, D, fy, dh, dw, uc, yaw, P, trade, ux, uz, i } = G;
  const FU = y + UP_FLOOR, CHy = y + SHOP_CH;
  const bwid = w * 0.55 / 2, door = 0.6, RW = 0.35;
  const mat = (m, r, y0, y1) => bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3]));
  // ---- the floor of the room, of the loggia over the passage and of the doorway between them
  sub(s0, s1, d1, d2, CHy, FU, false, 'timber'); sub(s0, s1, 0.6, d0, CHy, FU, false, 'timber'); sub(c - door, c + door, d0, d1, CHy, FU, false, 'timber');
  sub(s0, s1, 0.6, d0, CHy - 0.15, CHy, false, 'ceiling_painted');
  col.floor(R(s0 + RW, s1 - RW, d1, d2), FU); col.floor(R(s0 + 0.3, s1 - 0.3, 0.6, d0), FU); col.floor(R(c - door, c + door, d0, d1), FU); col.floor(R(c - bwid, c + bwid, -0.6, 0.6), FU);
  // ---- the loggia: walls to the neighbours, a roof, the lattice balustrade in the facade's arch
  sub(s0, s0 + 0.3, 0.6, d0, FU, y + UP_ARCH_TOP, true); sub(s1 - 0.3, s1, 0.6, d0, FU, y + UP_ARCH_TOP, true);
  sub(s0, s1, 0.6, d0, y + UP_ARCH_TOP - 0.45, y + UP_ARCH_TOP - 0.3, false, 'ceiling_painted'); sub(s0, s1, 0.6, d0, y + UP_ARCH_TOP - 0.3, y + UP_ARCH_TOP - 0.02, false);
  mat('lattice', R(c - bwid + 0.05, c + bwid - 0.05, -0.52, -0.46), FU + 0.14, FU + 0.89);
  mat('wood_dark', R(c - bwid + 0.03, c + bwid - 0.03, -0.55, -0.43), FU + 0.89, FU + 0.99); mat('wood_dark', R(c - bwid + 0.03, c + bwid - 0.03, -0.55, -0.43), FU + 0.04, FU + 0.14);
  for (const s of [c - bwid + 0.06, c, c + bwid - 0.06]) mat('wood_dark', R(s - 0.06, s + 0.06, -0.56, -0.42), FU + 0.04, FU + 1.0);
  col.segment(Q(c - bwid, -0.49), Q(c + bwid, -0.49), 0.16, FU, FU + 0.95);
  // ---- the room over the shop: side walls, a painted ceiling, the mass above; the door to the loggia
  const RC = FU + 3.5;
  sub(s0, s0 + RW, d1, d2, FU, RC + 0.15, true); sub(s1 - RW, s1, d1, d2, FU, RC + 0.15, true);
  sub(s0, s1, d1, d2, RC, RC + 0.15, false, 'ceiling_painted'); sub(s0, s1, d1, d2, RC + 0.15, y + h - 0.05, false);
  sub(c - dw, c + dw, d0, d1, y + dh, FU, false);                                                          // the front wall: over the shop's door, the door to the loggia, its jambs
  sub(c - dw, c - door, d0, d1, FU, y + h - 0.05, true); sub(c + door, c + dw, d0, d1, FU, y + h - 0.05, true);
  sub(c - door, c + door, d0, d1, FU + 2.2, y + h - 0.05, false);
  for (const r of [R(s0 + RW, s0 + RW + 0.03, d1, d2), R(s1 - RW - 0.03, s1 - RW, d1, d2)]) mat('plaster_persian', r, FU, RC);
  mat('plaster_persian', R(s0 + RW, s1 - RW, d1, d1 + 0.03), FU + 2.2, RC);
  for (const [a, b] of [[s0 + RW, c - dw], [c + dw, s1 - RW]]) mat('plaster_persian', R(a, b, d1, d1 + 0.03), FU, RC);
  mat('plaster_persian', R(c - dw, c - door, d1, d1 + 0.03), FU, RC); mat('plaster_persian', R(c + door, c + dw, d1, d1 + 0.03), FU, RC);
  // ---- the stair in the rear mass: lane 1 along the shop's back wall, lane 2 behind it, a divider between; the door at the s0 end
  const A = d2 + 0.3, B1 = d2 + 1.1, C1 = d2 + 1.4, B2 = d2 + 2.2, sa = s0 + RW + 1.0, sb = s1 - RW - 0.8, n = 12, ym = (fy + FU) / 2, dir = cardinal(ux, uz), opp = cardinal(-ux, -uz);
  const CT = FU + 3.2;
  sub(s0, s0 + RW, d2, D, y, CT + 0.15, true); sub(s1 - RW, s1, d2, D, y, CT + 0.15, true);
  sub(s0 + RW, s1 - RW, D - 0.4, D, y, CT + 0.15, true);
  sub(s0 + 1.25, s1 - RW, d2, A, y, CT + 0.15, true);                                                      // the shop's back wall, but at the door
  sub(s0 + RW, s0 + 1.25, d2, A, fy + 2.2, FU, false); sub(s0 + RW, s0 + 1.25, d2, A, FU + 2.2, CT + 0.15, false);
  sub(sa, sb, B1, C1, y, CT, true);                                                                         // the divider
  sub(s0 + RW, s1 - RW, d2, D, CT, CT + 0.15, false, 'ceiling_painted'); sub(s0, s1, d2, D, CT + 0.15, y + h - 0.05, false);
  // the flights: steps of timber on a body of brick
  const stepsOf = (from, to, d0_, d1_, yFrom, yTo) => {
    const dt = (to - from) / n, r = (yTo - yFrom) / n;
    for (let k = 0; k < n; k++) {
      const a = from + k * dt, b = a + dt;
      const rect = R(Math.min(a, b), Math.max(a, b), d0_, d1_), top = yFrom + (k + 1) * r;
      bag.add('timber', box(rect[0], fy, rect[1], rect[2], top, rect[3]));
    }
  };
  const yA = fy;
  stepsOf(sa, sb, A, B1, yA, ym); stepsOf(sb, sa, C1, B2, ym, FU);
  const r1 = (ym - yA) / n, r2 = (FU - ym) / n;
  col.ramp(R(sa, sb, A, B1), yA + r1 / 2, ym - r1 / 2, dir); col.ramp(R(sa, sb, C1, B2), ym + r2 / 2, FU - r2 / 2, opp);
  // the landings: the foot (a floor at the shop's), the turn (half-way, on a body of brick), the head (the room's level)
  col.floor(R(s0 + RW, sa, A, B2), yA);
  bag.add('timber', box(R(sb, s1 - RW, A, B2)[0], yA, R(sb, s1 - RW, A, B2)[1], R(sb, s1 - RW, A, B2)[2], ym, R(sb, s1 - RW, A, B2)[3])); col.floor(R(sb, s1 - RW, A, B2), ym); col.rect(R(sb, s1 - RW, A, B2), yA, ym - 0.45);
  sub(s0 + RW, sa, A, B2, FU - 0.2, FU, false, 'timber'); col.floor(R(s0 + RW, sa, A, B2), FU);
  // the mass under the flights, below what their surface cuts away
  const surf1 = (s) => yA + r1 / 2 + (s - sa) / (sb - sa) * (ym - yA - r1), surf2 = (s) => ym + r2 / 2 + (sb - s) / (sb - sa) * (FU - ym - r2);
  const g = 3, dtn = (sb - sa) / n;
  for (let k = 0; k < n; k += g) {
    const a = sa + k * dtn, b = sa + Math.min(n, k + g) * dtn, y1 = surf1(a) - 0.15, y2 = surf2(b) - 0.15;
    if (y1 > yA + 0.2) col.rect(R(a, b, A, B1), yA, y1);
    if (y2 > yA + 0.2) col.rect(R(a, b, C1, B2), yA, y2);
  }
  // a guard at the head of the stair, over the foot of lane 1, which is open below it
  { const a = Q(sa, A), b = Q(sa, B1); col.segment(a, b, 0.1, FU, FU + 0.95); mat('wood_dark', R(sa - 0.05, sa + 0.05, A, B1), FU + 0.82, FU + 0.92); mat('wood_dark', R(sa - 0.05, sa + 0.05, A, B1), FU, FU + 0.1); for (const d of [A + 0.05, B1 - 0.05]) mat('wood_dark', R(sa - 0.05, sa + 0.05, d - 0.05, d + 0.05), FU, FU + 1.0); }
  { const r = R(s0 + RW, s1 - RW, d2, D - 0.4); bag.add('timber', box(r[0], y, r[1], r[2], yA, r[3])); }
  const lp = Q((sa + sb) / 2, (B1 + C1) / 2); lights.push({ at: [lp[0], ym + 1.2, lp[1]], color: '#ffb060', intensity: 2.2, distance: 5.5 });
  const lq = Q(s0 + 0.9, (A + B2) / 2); lights.push({ at: [lq[0], FU + 1.6, lq[1]], color: '#ffb060', intensity: 1.6, distance: 4.5 });

  // ---- what the room is used for: bedding on a chest at one side wall, the trade's stock along the other, a kilim, a lamp
  const f = FU + 0.012, ww = w / 2 - RW - 0.2;
  { const p = P(uc, 2.6); F.kilim(bag, p[0], f, p[1], 2 * ww - 1.6, 3.0, yaw, ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white']); }
  { const p = P(uc - ww + 0.2, 4.7); F.chest(bag, p[0], f, p[1], 1.0, 0.55, 0.6, yaw); for (let k = 0; k < 3; k++) F.cushion(bag, p[0], f + 0.58 + k * 0.11, p[1], 0.95, 0.6, 0.12, yaw, ['cloth_white', 'cloth_red', 'cloth_indigo'][k]); const q = P(uc - ww + 0.2, 4.7); lights.push({ at: [q[0], f + 1.2, q[1]], color: '#ffb060', intensity: 1.2, distance: 4 }); }
  { const p = P(uc + ww - 0.35, 2.0); F.bolster(bag, p[0], f, p[1], 1.4, 0.13, yaw + Math.PI / 2, 'cloth_indigo', 'cloth_ochre'); const q = P(uc + ww - 0.35, 3.3); F.bolster(bag, q[0], f, q[1], 1.4, 0.13, yaw + Math.PI / 2, 'cloth_red', 'cloth_ochre'); }
  const stock = P(uc + ww - 0.5, 4.3);
  if (trade === 'cloth') { for (let k = 0; k < 3; k++) F.bolts(bag, stock[0], f + k * 0.01, stock[1], 6, yaw + Math.PI / 2 + k * 0.2, undefined, 0.45); }
  else if (trade === 'carpet') F.rolledCarpets(bag, stock[0], f, stock[1], 5, 1.3, yaw + Math.PI / 2);
  else if (trade === 'copper') F.copperware(bag, stock[0], f, stock[1], yaw + Math.PI / 2, i * 7 + 3, 5);
  else if (trade === 'spice') F.spiceSacks(bag, stock[0], f, stock[1], yaw + Math.PI / 2, 5);
  else F.pots(bag, stock[0], f, stock[1], yaw + Math.PI / 2, 6, ['glaze_blue', 'terracotta', 'glaze_blue']);
  const jp = P(uc + ww - 0.3, 0.6); F.waterJar(bag, jp[0], f, jp[1], 0.9);
  const lamp = P(uc, 2.6); bag.add('bronze', box(lamp[0] - 0.012, RC - 0.8, lamp[1] - 0.012, lamp[0] + 0.012, RC, lamp[1] + 0.012));
  lights.push({ at: [lamp[0], RC - 1.0, lamp[1]], color: '#ffb46b', intensity: 3.4, distance: 7 });
}
