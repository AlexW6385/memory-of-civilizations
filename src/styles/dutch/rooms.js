// The other rooms of the canal house about 1670 (docs/settlements/amsterdam.md §5.16): beside the living room with
// its box bed (interior.js), the house's ground floor was also used as a kitchen, as the merchant's counting room
// (kantoor), and, in a warehouse (pakhuis), as the store itself. Each function furnishes the back room (or the
// whole ground floor) in the house's front frame F, from the helpers canalInterior passes in (`c`).

import { lathe, rod } from '../../core/geom.js';
import { sideprism } from './facade.js';

const OAK = 'wood_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A body of revolution whose axis points along (nx, nz) (horizontal), its foot at (x, y, z). */
function axisLathe(bag, m, prof, seg, nx, nz, x, y, z) {
  const g = lathe(prof, seg); g.rotateZ(-Math.PI / 2); g.rotateY(Math.atan2(-nz, nx)); g.translate(x, y, z); bag.add(m, g);
}

/**
 * The kitchen (keuken): the dresser with its rack of Delft plates and pewter, the sink bench with its pump and a
 * bucket, a copper kettle on the hearth stone, the scrubbed deal table with its bread and bowls on two stools,
 * and the copper pots hung on a rail by the door.
 */
export function kitchenFit(c) {
  const { A, C, lat, bag, F, y, fl, top, left, iu0, iu1, lin, roomD, hearthD, bedL, fU, sU, w, pdu, pw, dP, pT } = c;
  const at3 = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const dv = (() => { const p = F.at(0, 0), q = F.at(0, 1); return [q[0] - p[0], q[1] - p[1]]; })();      // +d (out of the house) in x, z
  // ---- the dresser against the back wall on the far side
  const ua = Math.min(fU(0.02), fU(bedL + 0.02)), ub = Math.max(fU(0.02), fU(bedL + 0.02)), d0 = roomD[0] - 0.03;
  A(OAK, ua, ub, fl, fl + 0.88, d0, d0 + 0.55);
  A('timber', ua - 0.02, ub + 0.02, fl + 0.88, fl + 0.92, d0, d0 + 0.6);
  for (let k = 0; k < 4; k++) { const a = ua + 0.1 + k * (ub - ua - 0.2) / 4; A('timber', a + 0.03, a + (ub - ua - 0.2) / 4 - 0.03, fl + 0.1, fl + 0.8, d0 + 0.55, d0 + 0.57); A('iron', a + (ub - ua - 0.2) / 8 - 0.02, a + (ub - ua - 0.2) / 8 + 0.02, fl + 0.45, fl + 0.5, d0 + 0.57, d0 + 0.6); }
  for (const u of [ua + 0.02, ub - 0.07]) A(OAK, u, u + 0.05, fl + 0.92, fl + 2.15, d0, d0 + 0.22);
  A(OAK, ua, ub, fl + 2.15, fl + 2.2, d0, d0 + 0.26);
  for (const sv of [1.28, 1.7]) {
    A(OAK, ua + 0.02, ub - 0.02, fl + sv - 0.03, fl + sv, d0, d0 + 0.24); A(OAK, ua + 0.02, ub - 0.02, fl + sv, fl + sv + 0.035, d0 + 0.2, d0 + 0.24);   // the shelf and its lip
    const n = Math.floor((ub - ua - 0.2) / 0.27);
    for (let k = 0; k < n; k++) {
      const u = ua + 0.1 + (k + 0.5) * (ub - ua - 0.2) / n, [x, vv, z] = at3(u, fl + sv + 0.14, d0 + 0.07);
      if (sv < 1.5 || k % 3 === 1) axisLathe(bag, k % 2 ? 'glaze_blue' : 'glaze_white', [[0.001, 0], [0.12, 0.002], [0.13, 0.02], [0.001, 0.016]], 14, dv[0], dv[1], x + dv[0] * 0.02, vv, z + dv[1] * 0.02);   // a plate on edge
      else lat('lead', [[0.001, 0], [0.05, 0], [0.055, 0.1], [0.04, 0.16], [0.06, 0.2], [0.001, 0.2]], 10, u, fl + sv + 0.035, d0 + 0.12);                    // a pewter jug
    }
  }
  C(ua, ub, d0, d0 + 0.6, fl, top);
  // ---- the sink bench in the corner by the hearth's wall: a bluestone sink, the pump, a bucket
  if (roomD[1] - roomD[0] > 3.6) {
    const hu0 = left ? iu0 + lin : iu1 - lin, hs = left ? 1 : -1, U = (k) => hu0 + hs * k, e0 = roomD[0] - 0.03;
    A(OAK, U(-0.03), U(0.62), fl, fl + 0.82, e0, e0 + 0.95);
    A('bluestone', U(0), U(0.66), fl + 0.82, fl + 0.88, e0, e0 + 1.0);
    A('lead', U(0.18), U(0.5), fl + 0.88, fl + 0.895, e0 + 0.2, e0 + 0.75);                                     // the basin's lead lining
    lat('iron', [[0.001, 0], [0.06, 0], [0.05, 0.05], [0.04, 0.9], [0.06, 0.95], [0.001, 1.0]], 8, U(0.14), fl + 0.88, e0 + 0.25);   // the pump's barrel
    A('iron', Math.min(U(0.14), U(0.4)), Math.max(U(0.14), U(0.4)), fl + 1.55, fl + 1.6, e0 + 0.22, e0 + 0.28);   // its spout
    A('iron', Math.min(U(0.14), U(0.2)), Math.max(U(0.14), U(0.2)), fl + 1.6, fl + 1.95, e0 + 0.235, e0 + 0.265);  // the handle
    lat('timber', [[0.001, 0], [0.2, 0], [0.24, 0.3], [0.001, 0.3]], 10, U(0.33), fl + 0.895, e0 + 0.48);            // a bucket in the sink
    lat('timber', [[0.001, 0], [0.2, 0], [0.23, 0.3], [0.001, 0.3]], 10, U(1.0), fl, e0 + 0.35);                        // a bucket on the floor
    lat('iron', [[0.215, 0.18], [0.225, 0.18], [0.225, 0.2], [0.215, 0.2]], 10, U(1.0), fl, e0 + 0.35);
    C(Math.min(U(0), U(0.66)), Math.max(U(0), U(0.66)), e0, e0 + 1.0, fl, fl + 0.9);
  }
  // ---- a copper kettle on the hearth stone beside the fire
  { const hu0 = left ? iu0 + lin : iu1 - lin, hs = left ? 1 : -1, U = (k) => hu0 + hs * k, dk = hearthD + 0.55;
    lat('bronze', [[0.001, 0], [0.16, 0], [0.2, 0.08], [0.19, 0.2], [0.14, 0.26], [0.06, 0.3], [0.001, 0.31]], 12, U(0.32), fl + 0.03, dk);
    A('bronze', Math.min(U(0.32) + hs * 0.17, U(0.32) + hs * 0.3), Math.max(U(0.32) + hs * 0.17, U(0.32) + hs * 0.3), fl + 0.15, fl + 0.2, dk - 0.02, dk + 0.02);   // the spout
    A('iron', U(0.32) - 0.2, U(0.32) + 0.2, fl + 0.34, fl + 0.37, dk - 0.015, dk + 0.015);                       // the bail
  }
  // ---- the scrubbed deal table on two stools, bread and bowls on it
  { const tu = w / 2 + (left ? 0.25 : -0.25), td = Math.min((roomD[0] + 1.2 + roomD[1]) / 2, (roomD[0] + roomD[1]) / 2 + 0.3), hu = 0.62, hd = 0.42, tv = fl + 0.76;
    for (const su of [-1, 1]) for (const sd of [-1, 1]) A('timber', tu + su * (hu - 0.08) - 0.035, tu + su * (hu - 0.08) + 0.035, fl, tv - 0.05, td + sd * (hd - 0.08) - 0.035, td + sd * (hd - 0.08) + 0.035);
    A('timber', tu - hu, tu + hu, tv - 0.05, tv, td - hd, td + hd);
    A('timber', tu - hu + 0.1, tu + hu - 0.1, fl + 0.2, fl + 0.24, td - 0.02, td + 0.02);                         // the stretcher
    lat('hide_tan', [[0.001, 0], [0.12, 0.01], [0.15, 0.06], [0.11, 0.1], [0.001, 0.11]], 10, tu - 0.3, tv, td + 0.08);                        // a round loaf
    A(OAK, tu + 0.05, tu + 0.4, tv, tv + 0.025, td - 0.3, td - 0.05);                                           // a chopping board
    lat('bronze', [[0.001, 0], [0.1, 0], [0.13, 0.08], [0.12, 0.09], [0.001, 0.02]], 10, tu + 0.3, tv, td + 0.12);                             // a copper bowl
    lat('glaze_white', [[0.001, 0], [0.07, 0], [0.09, 0.05], [0.001, 0.02]], 10, tu - 0.05, tv, td + 0.15);
    lat('cloth_green', [[0.001, 0], [0.09, 0.03], [0.1, 0.1], [0.06, 0.17], [0.001, 0.18]], 8, tu + 0.1, tv + 0.025, td - 0.18);               // a cabbage
    for (const su of [-1, 1]) { const cu = tu + su * (hu + 0.35);
      for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) A(OAK, cu + a * 0.15 - 0.02, cu + a * 0.15 + 0.02, fl, fl + 0.43, td + b * 0.15 - 0.02, td + b * 0.15 + 0.02);
      A('hide_brown', cu - 0.18, cu + 0.18, fl + 0.43, fl + 0.47, td - 0.18, td + 0.18);                               // the stool's seat
      C(cu - 0.2, cu + 0.2, td - 0.2, td + 0.2, fl, fl + 0.5); }
    C(tu - hu - 0.02, tu + hu + 0.02, td - hd - 0.02, td + hd + 0.02, fl, tv + 0.1);
  }
  // ---- the pots on a rail on the partition's back, by the door: copper pots hung by their handles, a skillet
  { const dw = dP - pT, a0 = left ? iu0 + lin + 0.15 : pdu + pw + 0.3, a1 = left ? pdu - pw - 0.3 : iu1 - lin - 0.15, rv = fl + 1.75;
    if (a1 - a0 > 0.8) {
      A('iron', a0, a1, rv, rv + 0.025, dw - 0.07, dw);
      const n = Math.max(2, Math.floor((a1 - a0) / 0.3)), kd = rng(Math.round((a1 - a0) * 100) + 5);
      for (let k = 0; k < n; k++) {
        const u = a0 + (k + 0.5) * (a1 - a0) / n, big = kd() < 0.5, r = big ? 0.15 : 0.11, hh = big ? 0.2 : 0.15, [x, vv, z] = at3(u, rv - 0.17 - hh * 0, dw);
        A('iron', u - 0.012, u + 0.012, rv - 0.17, rv, dw - 0.06, dw - 0.045);                                     // the hook and the handle's loop
        axisLathe(bag, 'bronze', [[0.001, 0], [r, 0], [r + 0.03, 0.03], [r + 0.03, hh], [r, hh + 0.02]], 12, -dv[0], -dv[1], x - dv[0] * 0.01, vv - r, z - dv[1] * 0.01);
      }
    }
  }
}

/**
 * The merchant's counting room (kantoor): the standing desk (lessenaar) with the open ledger, the iron-bound
 * chest for the cash, a high stool, and the shelf of ledgers over them, in the place of the box bed.
 */
export function officeFit(c) {
  const { A, C, lat, bag, F, y, fl, top, roomD, bedL, fU } = c;
  const ua = Math.min(fU(0.02), fU(bedL + 0.02)), ub = Math.max(fU(0.02), fU(bedL + 0.02)), d0 = roomD[0] + 0.03, mid = (ua + ub) / 2, sg = Math.sign(fU(bedL) - fU(0)) || 1;
  const at = (k) => fU(0.02) + sg * k;                                                                         // u measured from the room's far wall
  const S = (m, pts, u0, u1) => bag.add(m, sideprism(F, y, pts, Math.min(u0, u1), Math.max(u0, u1)));
  // the standing desk: four legs, the sloped top with its ledge, the ledger open on it, an inkpot
  const dU0 = at(0.0), dU1 = at(1.25), dd = 0.72;
  for (const u of [dU0 + sg * 0.05, dU1 - sg * 0.05]) for (const d of [d0 + 0.05, d0 + dd - 0.05]) A(OAK, u - 0.035, u + 0.035, fl, fl + 1.0, d - 0.035, d + 0.035);
  A(OAK, Math.min(dU0, dU1), Math.max(dU0, dU1), fl + 0.4, fl + 0.44, d0 + 0.02, d0 + dd - 0.02);               // the lower shelf
  S(OAK, [[d0, fl + 1.12], [d0 + dd, fl + 1.0], [d0 + dd, fl + 1.04], [d0, fl + 1.16]], dU0, dU1);             // the sloped top
  S(OAK, [[d0 + dd - 0.05, fl + 1.0], [d0 + dd, fl + 1.0], [d0 + dd, fl + 1.07], [d0 + dd - 0.05, fl + 1.07]], dU0, dU1);
  S('linen', [[d0 + 0.14, fl + 1.12], [d0 + 0.6, fl + 1.03], [d0 + 0.6, fl + 1.05], [d0 + 0.14, fl + 1.14]], at(0.1), at(0.62));   // the ledger's leaves
  S('hide_brown', [[d0 + 0.1, fl + 1.12], [d0 + 0.14, fl + 1.12], [d0 + 0.14, fl + 1.16], [d0 + 0.1, fl + 1.15]], at(0.08), at(0.64));
  lat('lead', [[0.001, 0], [0.03, 0], [0.03, 0.04], [0.001, 0.045]], 8, at(1.0), fl + 1.12, d0 + 0.1);          // the inkpot
  C(Math.min(dU0, dU1), Math.max(dU0, dU1), d0, d0 + dd, fl, fl + 1.2);
  // the high stool before it
  { const su = at(0.62), sd = d0 + dd + 0.4;
    for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) A(OAK, su + a * 0.13 - 0.02, su + a * 0.13 + 0.02, fl, fl + 0.72, sd + b * 0.13 - 0.02, sd + b * 0.13 + 0.02);
    A('hide_brown', su - 0.17, su + 0.17, fl + 0.72, fl + 0.77, sd - 0.17, sd + 0.17); A(OAK, su - 0.15, su + 0.15, fl + 0.36, fl + 0.39, sd - 0.15, sd + 0.15);
    C(su - 0.2, su + 0.2, sd - 0.2, sd + 0.2, fl, fl + 0.8); }
  // the chest: oak, iron bands, a rounded lid, the lock plate
  { const cU0 = at(1.4), cU1 = at(2.07), cd = 0.56, lo = Math.min(cU0, cU1), hi = Math.max(cU0, cU1);
    A(OAK, lo, hi, fl, fl + 0.5, d0, d0 + cd);
    S(OAK, [[d0, fl + 0.5], [d0 + cd, fl + 0.5], [d0 + cd, fl + 0.56], [d0 + cd / 2, fl + 0.68], [d0, fl + 0.56]], lo, hi);
    for (const k of [0.12, 0.5]) { const u = lo + (hi - lo) * k; A('iron', u - 0.03, u + 0.03, fl, fl + 0.5, d0 + cd, d0 + cd + 0.015); S('iron', [[d0 - 0.005, fl + 0.5], [d0 + cd + 0.01, fl + 0.5], [d0 + cd + 0.01, fl + 0.56], [d0 + cd / 2, fl + 0.685], [d0 - 0.005, fl + 0.56]], u - 0.03, u + 0.03); }
    A('iron', (lo + hi) / 2 - 0.05, (lo + hi) / 2 + 0.05, fl + 0.32, fl + 0.46, d0 + cd, d0 + cd + 0.02);
    C(lo, hi, d0, d0 + cd, fl, fl + 0.7); }
  // the shelf of ledgers on the wall above: two boards, the ledgers standing on them
  for (const [k, sv] of [1.5, 1.92].entries()) {
    A(OAK, ua, ub, fl + sv - 0.03, fl + sv, d0, d0 + 0.3);
    const kd = rng(41 + k * 7); let u = 0.05;
    while (u < Math.abs(ub - ua) - 0.12) {
      const wd = 0.05 + kd() * 0.06, hh = 0.2 + kd() * 0.08, m = ['hide_brown', 'cloth_black', 'hide_tan', 'cloth_maroon', 'hide_black', 'cloth_green'][Math.floor(kd() * 6)];
      A(m, at(u), at(u + wd), fl + sv, fl + sv + hh, d0 + 0.04, d0 + 0.26); u += wd + 0.006;
    }
  }
  void top; void mid;
}

/**
 * The store of a warehouse house (pakhuis): the ground floor in one room, a floor of planks on sleepers, boards on
 * beams overhead with the hoist's trap and its rope, a central aisle from the door to the back, along the sides
 * stacks of sacks of grain, barrels and corded bales, a counting desk with its ledger and a hand balance by the door.
 */
export function storeFit(c) {
  const { A, C, lat, bag, F, y, b, fl, top, iu0, iu1, lin, dF, dB, du, dw, w, hole } = c;
  const at3 = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const S = (m, pts, u0, u1) => bag.add(m, sideprism(F, y, pts, Math.min(u0, u1), Math.max(u0, u1)));
  const kd = rng(Math.round(w * 100) + Math.round(du * 10) + 3);
  // the floor of planks laid on sleepers, the ceiling of boards on beams
  A('timber', iu0 + lin, iu1 - lin, b, fl, dB + lin, dF - lin);
  for (let d = dB + 0.4; d < dF - 0.3; d += 0.42) A('planks_grey', iu0 + lin, iu1 - lin, fl, fl + 0.006, d, d + 0.012);
  // (with a flight up through it, the ceiling is cut round the trap of the stair: upper.js)
  const hu0 = hole ? hole[0] : 0, hu1 = hole ? hole[1] : 0, hd0 = hole ? hole[2] : 0, hd1 = hole ? hole[3] : 0;
  if (hole) {
    A('timber', iu0 + lin, hu0, top - 0.05, top, dB + lin, dF - lin); A('timber', hu1, iu1 - lin, top - 0.05, top, dB + lin, dF - lin);
    A('timber', hu0, hu1, top - 0.05, top, dB + lin, hd0); A('timber', hu0, hu1, top - 0.05, top, hd1, dF - lin);
  } else A('timber', iu0 + lin, iu1 - lin, top - 0.05, top, dB + lin, dF - lin);
  { const n = Math.max(3, Math.round((dF - dB) / 1.1)); for (let k = 0; k < n; k++) { const d = dB + (k + 0.5) * (dF - dB) / n;
    if (hole && d + 0.12 > hd0 && d - 0.12 < hd1) { A(OAK, iu0 + lin, hu0, top - 0.32, top - 0.05, d - 0.12, d + 0.12); A(OAK, hu1, iu1 - lin, top - 0.32, top - 0.05, d - 0.12, d + 0.12); }
    else A(OAK, iu0 + lin, iu1 - lin, top - 0.32, top - 0.05, d - 0.12, d + 0.12); } }
  A(OAK, du - 0.14, du + 0.14, top - 0.5, top - 0.05, dB + lin, dF - lin);                                         // the summer beam over the aisle
  // the hoist's trap in the ceiling by the front, its rope and hook with a bale on it
  { const hd = dF - 1.9, hu0 = du - 0.55, hu1 = du + 0.55;
    A(OAK, hu0 - 0.06, hu1 + 0.06, top - 0.06, top - 0.04, hd - 0.55, hd + 0.55);
    for (const s of [-1, 1]) { A('iron', du + s * 0.4 - 0.02, du + s * 0.4 + 0.02, top - 0.09, top - 0.06, hd - 0.5, hd + 0.5); }
    const [x, vv, z] = at3(du, top - 0.09, hd); bag.add('rope_fibre', rod([x, vv, z], [x, vv - 1.35, z], 0.022, 6));
    A('iron', du - 0.03, du + 0.03, top - 1.55, top - 1.4, hd - 0.03, hd + 0.03);
    A('cloth_ochre', du - 0.42, du + 0.42, fl + 0.55, fl + 1.1, hd - 0.3, hd + 0.3);                              // the bale on the floor under it, the rope's end hooked to its cords
    A('rope_fibre', du - 0.43, du - 0.4, fl + 0.55, fl + 1.1, hd - 0.31, hd + 0.31); A('rope_fibre', du + 0.4, du + 0.43, fl + 0.55, fl + 1.1, hd - 0.31, hd + 0.31);
    const [bx, by, bz] = at3(du, fl + 1.1, hd); bag.add('rope_fibre', rod([x, vv - 1.35, z], [bx, by, bz], 0.02, 6));
    C(du - 0.45, du + 0.45, hd - 0.33, hd + 0.33, fl, fl + 1.15); }
  // the goods along both sides of the aisle, from behind the door's leaves to the back wall
  const aisle = hole ? 1.2 : 0.95, zones = [[iu0 + lin + 0.02, du - aisle], [du + aisle, iu1 - lin - 0.02]].filter(([a, c2]) => c2 - a > 0.8);
  for (const [za, zb] of zones) {
    const zw = zb - za;
    for (let d = dF - 1.9; d - 1.0 > dB + lin + 0.2; d -= 1.12) {
      const kind = kd(), d0 = d - 1.0, d1 = d - 0.02;
      if (hole && zb > hu0 - 0.1 && za < hu1 + 0.1 && d1 > hd0 - 0.3 && d0 < hd1 + 1.9) continue;
      if (kind < 0.12) continue;
      if (kind < 0.45) {                                                                                           // sacks of grain, in tiers
        const nn = Math.max(1, Math.floor(zw / 0.82)), sw = zw / nn, tiers = 2 + (kd() < 0.5 ? 1 : 0);
        for (let t = 0; t < tiers; t++) for (let k = 0; k < nn - (t === 2 && nn > 1 ? 1 : 0); k++) {
          const u0 = za + k * sw + (t === 2 ? sw / 2 : 0), jit = (kd() - 0.5) * 0.04;
          A('sacking', u0 + 0.02, u0 + sw - 0.02, fl + t * 0.3, fl + t * 0.3 + 0.3, d0 + 0.2 + jit, d1 - 0.1);
          A('sacking', u0 + 0.1, u0 + sw - 0.1, fl + t * 0.3 + 0.3, fl + t * 0.3 + 0.34, d0 + 0.28, d1 - 0.18);     // the sack's tied-off top
          A('rope_fibre', u0 + sw * 0.5 - 0.015, u0 + sw * 0.5 + 0.015, fl + t * 0.3 + 0.12, fl + t * 0.3 + 0.3, d0 + 0.19 + jit, d0 + 0.2 + jit);
        }
        C(za, zb, d0 + 0.15, d1 - 0.05, fl, fl + tiers * 0.3 + 0.04);
      } else if (kind < 0.75) {                                                                                    // barrels, a row and a tier on top
        const nn = Math.max(1, Math.floor(zw / 0.8)), bw = zw / nn;
        for (let k = 0; k < nn; k++) {
          const u = za + (k + 0.5) * bw, dd = (d0 + d1) / 2;
          lat('timber', [[0.001, 0], [0.26, 0], [0.33, 0.28], [0.35, 0.42], [0.33, 0.56], [0.26, 0.84], [0.001, 0.84]], 12, u, fl, dd);
          for (const h of [0.08, 0.3, 0.54, 0.76]) lat('iron', [[0.255 + h * 0.0 + (h === 0.3 || h === 0.54 ? 0.075 : 0), h], [0.268 + (h === 0.3 || h === 0.54 ? 0.082 : 0), h], [0.268 + (h === 0.3 || h === 0.54 ? 0.082 : 0), h + 0.03], [0.255 + (h === 0.3 || h === 0.54 ? 0.075 : 0), h + 0.03]], 12, u, fl, dd);
          if (nn > 1 && k < nn - 1 || nn === 1) lat('timber', [[0.001, 0], [0.26, 0], [0.33, 0.28], [0.35, 0.42], [0.33, 0.56], [0.26, 0.84], [0.001, 0.84]], 12, u + (nn > 1 ? bw / 2 : 0), fl + 0.84, dd);
        }
        C(za, zb, d0 + 0.2, d1 - 0.1, fl, fl + 1.68);
      } else {                                                                                                     // corded bales, two tiers
        const nn = Math.max(1, Math.floor(zw / 0.98)), bw = zw / nn;
        for (let t = 0; t < 2; t++) for (let k = 0; k < nn; k++) {
          const u0 = za + k * bw + 0.02, u1 = za + (k + 1) * bw - 0.02, vv = fl + t * 0.56, m = ['cloth_ochre', 'linen', 'cloth_grey', 'cloth_brown'][Math.floor(kd() * 4)];
          A(m, u0, u1, vv, vv + 0.56, d0 + 0.2, d1 - 0.1);
          for (const q of [0.25, 0.75]) A('rope_fibre', u0 + (u1 - u0) * q - 0.012, u0 + (u1 - u0) * q + 0.012, vv - 0.002, vv + 0.562, d0 + 0.195, d1 - 0.095);
          A('rope_fibre', u0 - 0.002, u1 + 0.002, vv + 0.27, vv + 0.29, d0 + 0.195, d1 - 0.095);
        }
        C(za, zb, d0 + 0.15, d1 - 0.05, fl, fl + 1.16);
      }
    }
  }
  // the counting desk and the hand balance by the front wall, to the side of the door
  { const side = (iu1 - lin - du) > (du - iu0 - lin) ? 1 : -1, z0 = du + side * 1.15, z1 = du + side * 2.0;
    if (side > 0 ? z1 < iu1 - lin - 0.05 : z1 > iu0 + lin + 0.05) {
      const lo = Math.min(z0, z1), hi = Math.max(z0, z1), d0 = dF - 1.4, d1 = dF - 0.75;
      for (const u of [lo + 0.04, hi - 0.04]) for (const d of [d0 + 0.04, d1 - 0.04]) A(OAK, u - 0.03, u + 0.03, fl, fl + 0.92, d - 0.03, d + 0.03);
      A(OAK, lo, hi, fl + 0.92, fl + 0.96, d0, d1);
      A('linen', lo + 0.08, lo + 0.5, fl + 0.96, fl + 0.975, d0 + 0.1, d1 - 0.1); A('hide_brown', lo + 0.06, lo + 0.08, fl + 0.96, fl + 0.99, d0 + 0.1, d1 - 0.1);   // the ledger
      const sm = (lo + hi) / 2 + side * 0.18;                                                                      // the balance: a post, its beam, two pans on cords
      A('iron', sm - 0.015, sm + 0.015, fl + 0.96, fl + 1.3, (d0 + d1) / 2 - 0.015, (d0 + d1) / 2 + 0.015);
      A('iron', sm - 0.2, sm + 0.2, fl + 1.3, fl + 1.315, (d0 + d1) / 2 - 0.01, (d0 + d1) / 2 + 0.01);
      for (const s of [-1, 1]) { A('iron', sm + s * 0.2 - 0.004, sm + s * 0.2 + 0.004, fl + 1.1, fl + 1.3, (d0 + d1) / 2 - 0.004, (d0 + d1) / 2 + 0.004); lat('lead', [[0.001, 0], [0.09, 0.02], [0.09, 0.03], [0.001, 0.012]], 10, sm + s * 0.2, fl + 1.09, (d0 + d1) / 2); }
      lat('lead', [[0.001, 0], [0.03, 0], [0.03, 0.05], [0.001, 0.055]], 8, lo + 0.65, fl + 0.96, d0 + 0.2);       // the weights
      C(lo, hi, d0, d1, fl, fl + 1.35);
    }
  }
  void dw; void top;
}
