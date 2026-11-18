// An insula one walks into (docs/settlements/rome.md §4.14): an apartment block of the Campus Martius whose ground floor is
// open — a row of tabernae on the street, each furnished for its trade and roofed by the joists of its mezzanine; the stair
// door and a passage into the inner court (the light well every large insula had) with its well or basin, its washing, its
// timber stair climbing the wall to a landing at the first floor; round the court the cellae behind the shops (a bed, a loom,
// a store of amphorae), a kitchen with its hearth. The fronts differ by rule, not by add-ons: from the seed come the number
// and the widths of the bays and the place of the stair door, the storeys, the facing (brick, or plastered in one of four
// colours above the shops), the form of the lintels, pilasters or none, the grouping of the windows, the cornice, the balcony
// or the closed gallery, the trades. The upper flats are masses with their windows (not entered). Style `rome-site`.
//   insula_open: { rect [x0, z0, x1, z1], front ('n' | 's' | 'e' | 'w': the street side), seed, y }

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';
import './domus.js';
import { makeT, slab, wall as kwall, fence, hash, furnishElement, flatFrame } from './upper.js';

export const FLAT_F1 = 4.6;

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

const T = 0.5, TI = 0.35, DS = 5.2, BR = 4.6, SIDE = 3.4, CEIL = 3.4, G0 = 4.6, SH = 3.2;

function insulaOpen(el, ctx) {
  const { bag, col, lights } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, f = el.front ?? 's';
  const [X0, Z0, X1, Z1] = el.rect, NS = f === 'n' || f === 's';
  const W = NS ? X1 - X0 : Z1 - Z0, D = NS ? Z1 - Z0 : X1 - X0;
  const P = (u, d) => f === 's' ? [X0 + u, Z1 - d] : f === 'n' ? [X1 - u, Z0 + d] : f === 'e' ? [X1 - d, Z1 - u] : [X0 + d, Z0 + u];
  const up = !!el.upper;                                                  // its first floor is walkable (docs §4.16)
  const mir = rand() < 0.5;                                              // the stair on the west (false) or the east (true) of the court
  const rr = (u0, u1, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  /** a box in the street frame: u along the front, d inward; heights relative to y */
  const Bp = (mat, u0, u1, d0, d1, ya, yb, solid) => { const r = rr(u0, u1, d0, d1); bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3])); if (solid) col.rect(r, y + ya, y + yb); };
  /** the same in the court's frame (mirrored with the stair on the east) */
  const B = (mat, u0, u1, d0, d1, ya, yb, solid) => mir ? Bp(mat, W - u1, W - u0, d0, d1, ya, yb, solid) : Bp(mat, u0, u1, d0, d1, ya, yb, solid);
  const Vp = (mat, prof, u, d, yy, seg = 12, tilt = 0) => { const [x, z] = P(u, d); const g = lathe(prof, seg); if (tilt) g.rotateX(tilt); g.translate(x, y + yy, z); bag.add(mat, g); };
  const V = (mat, prof, u, d, yy, seg, tilt) => Vp(mat, prof, mir ? W - u : u, d, yy, seg, tilt);
  const Cr = (u, d, r, ya, yb) => { const [x, z] = P(mir ? W - u : u, d); col.circle(x, z, r, y + ya, y + yb); };
  const L = (at, color, intensity, distance) => { const [x, z] = P(mir ? W - at[0] : at[0], at[1]); lights.push({ at: [x, y + at[2], z], color, intensity, distance }); };
  const Ts = makeT(ctx, y, P), Tc = makeT(ctx, y, (u, d) => P(mir ? W - u : u, d));          // the street frame and the court's canonical frame
  /** a wall along u (alongU) at d = c, or along d at u = c, from a to b, t thick, y0…y1, doorways [d0, d1, h] */
  const wallG = (alongU, c, a, b, t, y0, y1, mat, doors, B_) => {
    const seg = (p, q, ya, yb, m) => { if (q - p < 0.01 || yb - ya < 0.01) return; if (alongU) B_(m, p, q, c - t / 2, c + t / 2, ya, yb, true); else B_(m, c - t / 2, c + t / 2, p, q, ya, yb, true); };
    let p = a;
    for (const [d0, d1, dh = 2.4] of [...doors].sort((m, n) => m[0] - n[0])) {
      seg(p, d0, y0, y1, mat); seg(d0, d1, Math.max(y0, dh), y1, mat);
      if (y0 < 0.1) { if (alongU) B_('travertine', d0, d1, c - t / 2, c + t / 2, -0.05, 0.03); else B_('travertine', c - t / 2, c + t / 2, d0, d1, -0.05, 0.03); }
      p = d1;
    }
    seg(p, b, y0, y1, mat);
  };
  const wallP = (alongU, c, a, b, t, y0, y1, mat, doors = []) => wallG(alongU, c, a, b, t, y0, y1, mat, doors, Bp);
  const wallC = (alongU, c, a, b, t, y0, y1, mat, doors = []) => wallG(alongU, c, a, b, t, y0, y1, mat, doors, B);

  // ── the rule for the front ───────────────────────────────────────────────────────────────────────────────────
  const n = 3 + (rand() < 0.5 ? 1 : 0) + (rand() < 0.3 ? 1 : 0), H = G0 + (n - 1) * SH;
  const vr = rand(), upper = vr < 0.4 ? 'brick' : vr < 0.58 ? 'stucco_rome' : vr < 0.74 ? 'stucco_warm' : vr < 0.88 ? 'paint_ochre' : 'stucco_ochre';
  const lintel = pick(rand, ['travertine', 'travertine', 'brick']), pilasters = rand() < 0.45, travCrown = rand() < 0.55, gallery = rand() < 0.22, balcony = !gallery && rand() < 0.4;
  const win = pick(rand, ['pair', 'single', 'triple']);
  const units = [];                                                      // the ground floor's bays along the front: shops and one stair door
  {
    const k = 2 + Math.floor(rand() * 3), half = Math.floor(rand() * Math.ceil((k + 1) / 2)), stairAt = mir ? k - half : half, SW = 2.4;   // the stair door on the court's side
    const ws = Array.from({ length: k }, () => 0.8 + rand() * 0.5), tot = ws.reduce((s, v) => s + v, 0), avail = W - 2 * T - SW - 0.4 * k;
    let u = T;
    for (let i = 0, j = 0; i <= k; i++) {
      if (i === stairAt) { units.push({ a: u, b: u + SW, stair: true }); u += SW; continue; }
      const w = ws[j++] / tot * avail + 0.4; units.push({ a: u, b: u + w, stair: false }); u += w;
    }
    units[units.length - 1].b = W - T;
  }

  // ── floors: the court and the rooms ───────────────────────────────────────────────────────────────────────────
  const cd0 = DS + TI, cd1 = D - BR - TI;                                   // the court's depth band
  // ── the first floor, when it is opened (docs §4.16): rooms over the shops, over the back cellae and over the kitchen, a gallery along each
  //    long side of the court, the landing of the stair between them; all in the street frame (u along the front, d inward) ─────────────
  const nw = win === 'single' ? Math.max(2, Math.round(W / 4.2)) : win === 'pair' ? Math.max(2, Math.round(W / 5.0)) : Math.max(2, Math.round(W / 6.0));
  const F1 = G0, RH = 3.2, GW = 1.5, ceilY = F1 + RH;
  const gridHoles = (len) => {                                                               // the windows of the first floor on a face: the grid windows() draws
    const out = [];
    for (let i = 0; i < nw; i++) { const uc = (i + 0.5) * len / nw, half = win === 'triple' ? 0.22 : win === 'pair' ? 0.3 : 0.5; for (const dg of win === 'pair' ? [-0.55, 0.55] : win === 'triple' ? [-0.8, 0, 0.8] : [0]) out.push({ cell: i, a: uc + dg - half, b: uc + dg + half, ya: F1 + 0.9, yb: F1 + 2.3 }); }
    return out;
  };
  const udor = (uc, hw = 0.55) => ({ a: uc - hw, b: uc + hw, ya: F1, yb: F1 + 2.15 });
  const cuts = Array.from({ length: nw + 1 }, (_, i) => (i === 0 ? T : i === nw ? W - T : i * W / nw));
  const ivs = Array.from({ length: nw }, (_, i) => [cuts[i] + (i ? TI / 2 : 0), cuts[i + 1] - (i < nw - 1 ? TI / 2 : 0)]);
  const stU = mir ? [W - T - 1.2, W - T] : [T, T + 1.2];                                       // the stair's strip
  const gF = mir ? [SIDE + TI, W - T - 1.4] : [T + 1.4, W - SIDE - TI];                       // the gallery over the shops' side of the court (clear of the stair)
  const gB = mir ? [SIDE + TI, W - T] : [T, W - SIDE - TI];                                   // the gallery along the back rooms
  const kitU = mir ? [T, SIDE] : [W - SIDE, W - T], kitS = mir ? [T, SIDE + TI] : [W - SIDE - TI, W - T];
  const doorC = ([a, b], [g0, g1]) => Math.min(Math.max((a + b) / 2, Math.max(a, g0) + 0.9), Math.min(b, g1) - 0.9);
  const dF = ivs.map((iv) => doorC(iv, gF)), dB = ivs.map((iv) => doorC(iv, gB));
  const balCell = 1, uBal = (balCell + 0.5) * W / nw;                                          // the room of the shops' side with the balcony over the street
  const run0 = Math.min(5.4, cd1 - cd0 - 1.2), lendU = cd0 + 0.35 + run0, lE = Math.max(lendU, cd1 - GW);       // where the flight ends, where the back gallery begins
  const faceH = { front: gridHoles(W).filter((h) => h.cell !== balCell), back: gridHoles(W) };
  faceH.front.push(udor(uBal, 0.6));
  const span = (lo, hi) => (h) => h.a >= lo && h.b <= hi;
  const sideH = (kit) => gridHoles(D).filter((h) => span(T + 0.1, DS - 0.1)(h) || span(D - BR + 0.1, D - T - 0.1)(h) || (kit && span(cd0 + 0.1, cd1 - 0.1)(h)));
  faceH.sideA = sideH(mir); faceH.sideB = sideH(!mir);                                           // (u = 0 and u = W; the kitchen is on the side opposite the stair)
  const hasHole = (list) => (a, b) => list.some((h) => Math.abs(h.a - a) < 1e-6 && Math.abs(h.b - b) < 1e-6);
  if (el.layoutOut) {
    const role = (i, k) => { const h = hash(i, k, el.seed || 1); return k === 0 ? (i === balCell ? 'sleep' : h < 0.45 ? 'work' : h < 0.75 ? 'sleep' : 'living') : (h < 0.5 ? 'sleep' : h < 0.8 ? 'store' : 'sleep'); };
    const rooms = ivs.map((iv, i) => ({ rect: [iv[0], iv[1], T, DS], door: 'd1', dc: dF[i] - iv[0], y: F1, role: role(i, 0) }));
    ivs.forEach((iv, i) => rooms.push({ rect: [iv[0], iv[1], cd1 + TI, D - T], door: 'd0', dc: dB[i] - iv[0], y: F1, role: role(i, 1) }));
    rooms.push({ rect: [kitU[0], kitU[1], cd0, cd1], door: mir ? 'u1' : 'u0', dc: 0.6, y: F1, role: 'living' });
    const st = units.find((q) => q.stair), us = (st.a + st.b) / 2, su = (stU[0] + stU[1]) / 2, ks = mir ? kitS[1] : kitS[0], kin = (kitU[0] + kitU[1]) / 2, rB = mir ? nw - 1 : 0;
    const d0s = cd0 + 0.35, onBal = dF[balCell], dm = (lE + cd1) / 2;
    el.layoutOut.rooms = rooms;
    el.layoutOut.routes = {                                                                     // street frame [u, d, height] (docs §4.16 walks)
      back: [[us, -3], [us, 1.2], [us, DS + 0.6], [us, cd0 + 0.7], [su, cd0 + 0.7], [su, d0s + 1.0], [su, lendU - 0.6, F1 - 0.2], [su, lendU + 0.2, F1], [su, dm, F1], [dB[rB], dm, F1], [dB[rB], cd1 + TI + 1.0, F1], [dB[rB], D - T - 1.0, F1]],
      front: [[us, -3], [us, 1.2], [us, DS + 0.6], [us, cd0 + 0.7], [su, cd0 + 0.7], [su, d0s + 1.0], [su, lendU - 0.6, F1 - 0.2], [su, lendU + 0.2, F1], [su, dm, F1], [ks + (mir ? 0.6 : -0.6), dm, F1], [kin, cd1 - GW / 2, F1], [kin, cd0 + GW / 2, F1], [ks + (mir ? 0.6 : -0.6), cd0 + GW / 2, F1],
        [onBal, cd0 + GW / 2, F1], [onBal, DS - 0.5, F1], [uBal, T + 1.4, F1], [uBal, T / 2, F1], [uBal, -0.6, F1]],
    };
    el.layoutOut.F1 = F1;
  }
  if (el.dry) return;
  Bp('cotto_floor', T, W - T, T, D - T, -0.3, 0);
  { const r = rr(T, W - T, T, D - T); col.floor(r, y); }
  const cu0 = SIDE + TI;                                                    // (the court's frame: the stair side is u < cu1)
  B('basalt', 0.0 + T, W - SIDE - TI, cd0, cd1, -0.02, 0.02);              // the court paved
  // ── the outer walls: brick to the first string course, then the facing; the shops' doorways in the front ─────
  const doorsF = units.map((q) => q.stair ? [q.a + 0.4, q.b - 0.4, 2.8] : [(q.a + q.b) / 2 - Math.min(1.45, (q.b - q.a) / 2 - 0.55), (q.a + q.b) / 2 + Math.min(1.45, (q.b - q.a) / 2 - 0.55), 3.1]);
  wallP(true, T / 2, 0, W, T, -0.4, G0, 'brick', doorsF);
  const upperWall = (alongU, c, a, b, t, holes) => { if (up) kwall(Ts, upper, alongU, c - t / 2, t, a, b, G0, H, holes); else wallP(alongU, c, a, b, t, G0, H, upper); };
  upperWall(true, T / 2, 0, W, T, faceH.front);
  wallP(false, T / 2, 0, D, T, -0.4, G0, 'brick'); upperWall(false, T / 2, 0, D, T, faceH.sideA);
  wallP(false, W - T / 2, 0, D, T, -0.4, G0, 'brick'); upperWall(false, W - T / 2, 0, D, T, faceH.sideB);
  wallP(true, D - T / 2, T, W - T, T, -0.4, G0, 'brick'); upperWall(true, D - T / 2, T, W - T, T, faceH.back);
  // the shops' back wall with a door to the passage behind each, the partitions between the shops
  const doorsB = units.map((q) => q.stair ? [(q.a + q.b) / 2 - 0.9, (q.a + q.b) / 2 + 0.9, 2.8] : [(q.a + q.b) / 2 - 0.5, (q.a + q.b) / 2 + 0.5, 2.2]);
  if (up) { wallP(true, DS + TI / 2, T, W - T, TI, -0.4, G0, 'stucco_rome', doorsB); kwall(Ts, 'stucco_rome', true, DS, TI, T, W - T, G0, H + 1.2, dF.map((c) => udor(c))); }
  else wallP(true, DS + TI / 2, T, W - T, TI, -0.4, H + 1.2, 'stucco_rome', doorsB);
  for (let i = 1; i < units.length; i++) wallP(false, units[i].a, T, DS, TI, -0.3, CEIL + 0.1, 'stucco_rome');
  // the court's other sides: the wall of the back rooms (a door for each room), the wall of the side rooms
  const rooms = [], nr = W > 20 ? 3 : 2, rw = (W - 2 * T) / nr;
  for (let i = 0; i < nr; i++) rooms.push([T + i * rw, T + (i + 1) * rw]);
  if (up) { wallP(true, D - BR - TI / 2, T, W - T, TI, -0.4, G0, 'stucco_rome', rooms.map(([a, b]) => [(a + b) / 2 - 0.55, (a + b) / 2 + 0.55, 2.2])); kwall(Ts, 'stucco_rome', true, D - BR - TI, TI, T, W - T, G0, H + 1.2, dB.map((c) => udor(c))); }
  else wallP(true, D - BR - TI / 2, T, W - T, TI, -0.4, H + 1.2, 'stucco_rome', rooms.map(([a, b]) => [(a + b) / 2 - 0.55, (a + b) / 2 + 0.55, 2.2]));
  for (let i = 1; i < nr; i++) wallP(false, rooms[i][0], D - BR, D - T, TI, -0.3, CEIL + 0.1, 'stucco_rome');
  // the kitchen's side (opposite the stair): a wall with a door, partition at the back wall of the shops
  if (up) { wallC(false, W - SIDE - TI / 2, cd0, cd1, TI, -0.4, G0, 'stucco_rome', [[(cd0 + cd1) / 2 - 0.55, (cd0 + cd1) / 2 + 0.55, 2.2]]); kwall(Tc, 'stucco_rome', false, W - SIDE - TI, TI, cd0, cd1, G0, H + 1.2, [udor(cd0 + GW / 2, 0.5), udor(cd1 - GW / 2, 0.5)]); }
  else wallC(false, W - SIDE - TI / 2, cd0, cd1, TI, -0.4, H + 1.2, 'stucco_rome', [[(cd0 + cd1) / 2 - 0.55, (cd0 + cd1) / 2 + 0.55, 2.2]]);
  // the stair wall (the outer wall's inner face on the stair side) is the outer wall itself
  if (up) {
    // the floors (colliders), the ceilings over the rooms, the partitions between the rooms, the galleries on corbels with their rails
    slab(Ts, [T, W - T, T, cd0], F1); slab(Ts, [T, W - T, cd1, D - T], F1); slab(Ts, [kitS[0], kitS[1], cd0, cd1], F1);
    slab(Ts, [gF[0], gF[1], cd0, cd0 + GW], F1); slab(Ts, [gB[0], gB[1], lE, cd1], F1);
    const ceil2 = (u0, u1, d0, d1) => { Ts.B('timber', u0, u1, d0, d1, ceilY - 0.15, ceilY); for (let u = u0 + 0.4; u < u1 - 0.2; u += 0.75) Ts.B('wood_dark', u - 0.07, u + 0.07, d0, d1, ceilY - 0.45, ceilY - 0.15); };
    ceil2(T, W - T, T, cd0); ceil2(T, W - T, cd1, D - T); ceil2(kitS[0], kitS[1], cd0, cd1);
    for (let i = 1; i < nw; i++) { kwall(Ts, 'stucco_rome', false, cuts[i] - TI / 2, TI, T, DS, F1, ceilY); kwall(Ts, 'stucco_rome', false, cuts[i] - TI / 2, TI, cd1 + TI, D - T, F1, ceilY); }
    for (let u = gF[0] + 0.7; u < gF[1] - 0.3; u += 1.6) { Ts.B('travertine', u - 0.12, u + 0.12, cd0, cd0 + GW / 2, F1 - 0.62, F1 - 0.47); Ts.B('travertine', u - 0.1, u + 0.1, cd0 + 0.4, cd0 + 0.58, F1 - 0.47, F1 - 0.16); }
    for (let u = gB[0] + 0.7; u < gB[1] - 0.3; u += 1.6) { Ts.B('travertine', u - 0.12, u + 0.12, cd1 - GW / 2, cd1, F1 - 0.62, F1 - 0.47); Ts.B('travertine', u - 0.1, u + 0.1, cd1 - 0.58, cd1 - 0.4, F1 - 0.47, F1 - 0.16); }
    const sx = mir ? [gB[0], stU[0] - 0.65] : [stU[1] + 0.65, gB[1]];                                // the back gallery's rail runs clear of the stair's mouth
    fence(Ts, gF[0], cd0 + GW - 0.05, gF[1], cd0 + GW - 0.05, F1); fence(Ts, mir ? gF[1] - 0.05 : gF[0] + 0.05, cd0, mir ? gF[1] - 0.05 : gF[0] + 0.05, cd0 + GW, F1);
    fence(Ts, sx[0], lE + 0.05, sx[1], lE + 0.05, F1);
    Ts.L((gB[0] + gB[1]) / 2, cd1 - 0.5, F1 + 2.3, '#ffcf8a', 0.5, 5); Ts.L((gF[0] + gF[1]) / 2, cd0 + 0.5, F1 + 2.3, '#ffcf8a', 0.5, 5);
  }
  // ── ceilings: joists and boards at the mezzanine's floor ────────────────────────────────────────────────────
  const ceil = (u0, u1, d0, d1, canonical) => {
    const Bf = canonical ? B : Bp;
    Bf('timber', u0, u1, d0, d1, CEIL, CEIL + 0.14);
    const alongU = (u1 - u0) < (d1 - d0);
    if (alongU) for (let d = d0 + 0.4; d < d1 - 0.2; d += 0.75) Bf('wood_dark', u0, u1, d - 0.07, d + 0.07, CEIL - 0.16, CEIL);
    else for (let u = u0 + 0.4; u < u1 - 0.2; u += 0.75) Bf('wood_dark', u - 0.07, u + 0.07, d0, d1, CEIL - 0.16, CEIL);
  };
  for (const q of units) ceil(q.a + TI / 2, q.b - TI / 2, T, DS, false);
  for (const [a, b] of rooms) ceil(a + TI / 2, b - TI / 2, D - BR, D - T, false);
  void cu0;

  // ── the front: lintels, thresholds, pilasters, windows, cornice, balcony ────────────────────────────────────
  units.forEach((q, i) => {
    const uc = (q.a + q.b) / 2, hw = q.stair ? 0.8 : Math.min(1.45, (q.b - q.a) / 2 - 0.55);
    Bp(lintel, uc - hw - 0.15, uc + hw + 0.15, -0.08, T + 0.04, 3.1, 3.42, false);
    Bp('travertine', uc - hw - 0.1, uc + hw + 0.1, -0.12, T, -0.05, 0.1, false);
    if (q.stair) { for (const s of [-1, 1]) Bp('brick', uc + s * (hw + 0.2) - 0.18, uc + s * (hw + 0.2) + 0.18, -0.1, 0.05, 0, 3.1, false); Bp('travertine', uc - hw - 0.5, uc + hw + 0.5, -0.12, T, 3.42, 3.62, false); }
    else Bp('opening', uc - 0.5, uc + 0.5, -0.02, 0.05, 3.7, 4.3, false);                      // the mezzanine's window
    if (pilasters && i < units.length - 1) Bp('travertine', q.b - 0.16, q.b + 0.16, -0.1, 0.05, 0, G0 - 0.3, false);
  });
  Bp('brick', 0, W, -0.12, 0.06, G0 - 0.3, G0, false);                                           // the first string course
  const windows = (F) => {                                                                       // F: [uA, uB, fixedAxisDepth sign, alongU]
    const { len, put } = F;
    for (let k = 1; k < n; k++) {
      const yk = G0 + (k - 1) * SH, wy = yk + 0.9, wh = k === n - 1 ? 1.0 : 1.4, cnt = win === 'single' ? nw : win === 'pair' ? nw : nw;
      for (let i = 0; i < cnt; i++) {
        const uc = (i + 0.5) * len / cnt, groups = win === 'pair' ? [-0.55, 0.55] : win === 'triple' ? [-0.8, 0, 0.8] : [0];
        for (const dg of groups) {
          const half = win === 'triple' ? 0.22 : win === 'pair' ? 0.3 : 0.5;
          const real = up && k === 1 && F.real && F.real(uc + dg - half, uc + dg + half), none = up && k === 1 && F.skip && F.skip(i);       // a window with a real reveal, or the door to the balcony
          if (!real && !none) put('opening', uc + dg - half, uc + dg + half, wy, wy + wh, 0);
          if (!none) put('travertine', uc + dg - half - 0.1, uc + dg + half + 0.1, wy - 0.1, wy, 1);
          const r = rand();
          if (none) continue;
          if (r < 0.12) put('shutter_brown', uc + dg - half, uc + dg + half, wy, wy + wh, 2);
          else if (r < 0.4) { put('shutter_brown', uc + dg - half - 0.42, uc + dg - half, wy, wy + wh, 2); put('shutter_brown', uc + dg + half, uc + dg + half + 0.42, wy, wy + wh, 2); }
        }
      }
    }
  };
  // the street face and the two side faces and the back face (windows as dark openings with sills and shutters)
  const faceEl = (alongU, c, sgn, holes, skip) => ({ len: alongU ? W : D, real: holes && hasHole(holes), skip, put: (mat, a, b, ya, yb, kind) => {
    const dd = kind === 0 ? [0.0, 0.03] : kind === 1 ? [0.0, 0.12] : [0.02, 0.06];
    const o = sgn > 0 ? [c - dd[1], c - dd[0]] : [c + dd[0], c + dd[1]];
    if (alongU) Bp(mat, a, b, o[0], o[1], ya, yb, false); else Bp(mat, o[0], o[1], a, b, ya, yb, false);
  } });
  windows(faceEl(true, 0, 1, faceH.front, (i) => i === balCell && balcony || (i === balCell && up)));                                                                   // the street face (d = 0; out is d < 0)
  windows(faceEl(false, 0, 1, faceH.sideA)); windows(faceEl(false, W, -1, faceH.sideB)); windows(faceEl(true, D, -1, faceH.back));
  // the cornice: a course of corbelled brick under the eaves, and (on half the blocks) a travertine crown
  for (const [alongU, c, sgn] of [[true, 0, 1], [true, D, -1], [false, 0, 1], [false, W, -1]]) {
    const len = alongU ? W : D, o1 = sgn > 0 ? [c - 0.2, c + 0.05] : [c - 0.05, c + 0.2], o2 = sgn > 0 ? [c - 0.34, c + 0.05] : [c - 0.05, c + 0.34];
    if (alongU) { Bp('brick', -0.2, len + 0.2, o1[0], o1[1], H - 0.34, H - 0.14); if (travCrown) Bp('travertine', -0.32, len + 0.32, o2[0], o2[1], H - 0.14, H); }
    else { Bp('brick', o1[0], o1[1], -0.2, len + 0.2, H - 0.34, H - 0.14); if (travCrown) Bp('travertine', o2[0], o2[1], -0.32, len + 0.32, H - 0.14, H); }
  }
  // a balcony on corbels along the first floor of the street face, or a closed timber gallery (maenianum)
  if (balcony || (up && gallery)) {
    const bo = up ? -0.1 : 0;                                                                       // (opened: the balcony's floor is the room's floor)
    for (let u = 0.9; u < W - 0.6; u += 1.7) Bp('travertine', u - 0.14, u + 0.14, -1.0, 0.02, G0 - 0.5 + bo, G0 - 0.1 + bo, false);
    Bp('brick', 0.5, W - 0.5, -1.1, 0.02, G0 - 0.1 + bo, G0 + 0.1 + bo, false);
    for (let u = 0.6; u < W - 0.5; u += 1.2) Bp('timber', u - 0.04, u + 0.04, -1.08, -1.0, G0 + 0.1 + bo, G0 + 0.95 + bo, false);
    Bp('timber', 0.55, W - 0.55, -1.1, -0.98, G0 + 0.95 + bo, G0 + 1.03 + bo, false);
    if (up) {                                                                                       // one steps out of the door of the room and walks along it
      col.floor(rr(0.5, W - 0.5, -1.1, 0), y + G0);
      col.rect(rr(0.5, W - 0.5, -1.12, -1.0), y + G0, y + G0 + 1.0); col.rect(rr(0.42, 0.58, -1.1, 0.0), y + G0, y + G0 + 1.0); col.rect(rr(W - 0.58, W - 0.42, -1.1, 0.0), y + G0, y + G0 + 1.0);
    }
  } else if (gallery) {
    const u0 = 1.0 + rand() * 2, u1 = Math.min(W - 1, u0 + 4.5 + rand() * 4);
    Bp('wood_ochre', u0, u1, -0.8, 0.02, G0 + SH * 0.1, G0 + SH * 0.1 + 0.18, false);
    Bp('wood_painted', u0, u1, -0.8, -0.7, G0 + 0.28, G0 + 2.2, false);
    Bp('wood_painted', u0, u0 + 0.1, -0.8, 0.02, G0 + 0.28, G0 + 2.2, false); Bp('wood_painted', u1 - 0.1, u1, -0.8, 0.02, G0 + 0.28, G0 + 2.2, false);
    Bp('wood_ochre', u0 - 0.06, u1 + 0.06, -0.86, 0.02, G0 + 2.2, G0 + 2.36, false);
    for (let u = u0 + 0.5; u < u1 - 0.4; u += 1.1) Bp('opening', u, u + 0.55, -0.71, -0.68, G0 + 0.8, G0 + 1.7, false);
    for (let u = u0 + 0.2; u < u1 - 0.2; u += 1.0) Bp('timber', u - 0.05, u + 0.05, -0.78, -0.62, G0 - 0.35, G0 + 0.0, false);
  }

  // ── the roof: four lean-to strips of tile falling from the court's parapet to the eaves ────────────────────
  const roofs = [];
  const strip = (pts) => { const out = []; hexa(out, pts.map((p) => { const [x, z] = P(p[0], p[1]); return [x, y + p[2] - 0.3, z]; }), pts.map((p) => { const [x, z] = P(p[0], p[1]); return [x, y + p[2], z]; })); roofs.push(...out); };
  const yLo = H + 0.05, yHi = H + 1.35;
  strip([[-0.4, -0.4, yLo], [W + 0.4, -0.4, yLo], [W + 0.4, DS + TI, yHi], [-0.4, DS + TI, yHi]]);
  strip([[-0.4, D + 0.4, yLo], [W + 0.4, D + 0.4, yLo], [W + 0.4, D - BR - TI, yHi], [-0.4, D - BR - TI, yHi]]);
  const wc = mir ? W - (W - SIDE - TI) : SIDE + TI;                                                // the kitchen side's strip, to the court's edge
  const ka = mir ? 0 : W - SIDE - TI, kb = mir ? SIDE + TI : W;                                    // physical u of the kitchen side
  const stairSide = mir ? [W - T, W + 0.4] : [-0.4, T];
  void wc; void stairSide;
  // the kitchen side
  strip(mir ? [[-0.4, DS + TI, yLo], [kb, DS + TI, yHi], [kb, D - BR - TI, yHi], [-0.4, D - BR - TI, yLo]] : [[ka, DS + TI, yHi], [W + 0.4, DS + TI, yLo], [W + 0.4, D - BR - TI, yLo], [ka, D - BR - TI, yHi]]);
  // the stair side: a narrow strip over the thickness of the wall only
  strip(mir ? [[W - T - 0.1, DS + TI, yLo + 0.3], [W + 0.4, DS + TI, yLo], [W + 0.4, D - BR - TI, yLo], [W - T - 0.1, D - BR - TI, yLo + 0.3]] : [[-0.4, DS + TI, yLo], [T + 0.1, DS + TI, yLo + 0.3], [T + 0.1, D - BR - TI, yLo + 0.3], [-0.4, D - BR - TI, yLo]]);
  bag.add('roof_tile', fromTriangles(roofs));
  // the ridge-side coping where the wall rises above the strips is the wall itself (to H + 1.2)

  // ── the shops, furnished by trade ─────────────────────────────────────────────────────────────────────────
  const amph = lathe([[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.9], [0.06, 0.95], [0.001, 0.95]], 10);
  const jug = lathe([[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.03, 0.24], [0.04, 0.26], [0.001, 0.26]], 8);
  const bowl = lathe([[0.001, 0], [0.06, 0], [0.11, 0.07], [0.12, 0.08], [0.001, 0.02]], 8);
  const sack = lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.18], [0.12, 0.38], [0.06, 0.44], [0.001, 0.45]], 8);
  const at = (g, mat, u, d, yy, tilt = 0, c = false) => { const [x, z] = P(c && mir ? W - u : u, d); const h = g.clone(); if (tilt) h.rotateX(tilt); h.translate(x, y + yy, z); bag.add(mat, h); };
  const trades = ['wine', 'pots', 'cloth', 'smith', 'cobbler', 'wine', 'pots', 'grocer'];
  units.forEach((q, i) => {
    if (q.stair) {
      // the stair door's passage: a worn floor, the lamp bracket and a painted notice; the passage runs straight to the court
      Bp('wall_red', q.a + 0.5, q.a + 0.52, DS - 1.4, DS - 0.4, 1.4, 2.3, false);
      Bp('travertine', q.a + 0.3, q.b - 0.3, T + 0.1, DS, -0.01, 0.015, false);
      Bp('plaster_white', q.a + 0.45, q.a + 0.47, T + 0.6, T + 2.1, 1.3, 2.4, false);
      lights.push({ at: [P((q.a + q.b) / 2, 2.0)[0], y + 2.6, P((q.a + q.b) / 2, 2.0)[1]], color: '#ffb46b', intensity: 0.9, distance: 5 });
      return;
    }
    const kind = pick(rand, trades), a = q.a + TI / 2 + 0.05, b = q.b - TI / 2 - 0.05, w = b - a, uc = (a + b) / 2, shut = rand() < 0.15;
    if (shut) { const hw = Math.min(1.45, (q.b - q.a) / 2 - 0.55); Bp('shutter_brown', uc - hw, uc + hw, 0.08, 0.18, 0.1, 3.1, true); }
    const floorMat = kind === 'smith' ? 'basalt' : 'cotto_floor';
    Bp(floorMat, a, b, T, DS, 0.0, 0.01, false);
    // the door's boards stacked at the side, the groove in the threshold
    Bp('timber', uc + Math.min(1.45, w / 2 - 0.5) - 0.3, uc + Math.min(1.45, w / 2 - 0.5), T + 0.05, T + 0.2, 0, 2.6, false);
    // a loft of boards over the back with a ladder, in half the shops (above head height)
    if (rand() < 0.55 && w > 3.2) {
      Bp('timber', a, b, DS - 1.7, DS, 2.55, 2.7, false); Bp('wood_dark', a, b, DS - 1.8, DS - 1.7, 2.35, 2.7, false);
      const lx = b - 0.5; for (const s of [-0.18, 0.18]) Bp('wood_dark', lx + s - 0.025, lx + s + 0.025, DS - 2.1, DS - 1.95, 0, 2.7, false);
      for (let yy = 0.3; yy < 2.6; yy += 0.3) Bp('wood_dark', lx - 0.18, lx + 0.18, DS - 2.07, DS - 2.0, yy, yy + 0.04, false);
    }
    if (kind === 'wine') {
      Bp('brick', a + 0.1, b - 0.1, 1.5, 2.3, 0, 0.95, true); Bp('marble_smooth', a + 0.06, b - 0.06, 1.45, 2.34, 0.95, 1.0, false);
      for (let k = 0; k < Math.max(2, Math.floor((w - 0.8) / 1.0)); k++) { const u = a + 0.55 + k * 1.0; Vp('terracotta', [[0.2, 0], [0.22, 0.02], [0.22, 0.035], [0.18, 0.035], [0.18, 0]], u, 1.9, 0.98, 14); Vp('lacquer_black', [[0.001, 0], [0.18, 0], [0.001, 0.001]], u, 1.9, 0.985, 14); }
      for (let k = 0; k < 5; k++) at(amph, 'terracotta', a + 0.35 + k * 0.42, DS - 0.35, 0, k % 2 ? 0.2 : -0.2);
      for (let k = 0; k < 3; k++) at(jug, 'pottery_dark', b - 0.45 - k * 0.2, 1.9, 1.0);
      Bp('timber', a + 0.05, b - 0.05, DS - 0.3, DS - 0.1, 1.2, 1.26, false); Bp('timber', a + 0.05, a + 0.1, DS - 0.3, DS - 0.1, 0, 1.2, false); Bp('timber', b - 0.1, b - 0.05, DS - 0.3, DS - 0.1, 0, 1.2, false);
    } else if (kind === 'pots') {
      for (const dd of [DS - 0.55, DS - 1.6]) { Bp('timber', a + 0.1, b - 0.1, dd, dd + 0.5, 0.4, 0.46, true); Bp('timber', a + 0.1, b - 0.1, dd, dd + 0.5, 1.0, 1.05, false); Bp('timber', a + 0.1, a + 0.16, dd, dd + 0.5, 0, 1.05, false); Bp('timber', b - 0.16, b - 0.1, dd, dd + 0.5, 0, 1.05, false); }
      for (let u = a + 0.35; u < b - 0.3; u += 0.34) { at(bowl, 'terracotta', u, DS - 0.3, 0.46); at(jug, 'terracotta', u + 0.1, DS - 0.3, 1.05); at(jug, 'pottery_dark', u, DS - 1.35, 0.46); at(bowl, 'terracotta', u + 0.1, DS - 1.35, 1.05); }
      for (let k = 0; k < 3; k++) at(amph, 'terracotta', a + 0.4 + k * 0.45, 2.4, 0, k === 1 ? 0.18 : 0);
    } else if (kind === 'cloth') {
      Bp('timber', a + 0.3, b - 0.3, 2.0, 3.0, 0.7, 0.78, true); for (const [u, d] of [[a + 0.35, 2.05], [b - 0.35, 2.05], [a + 0.35, 2.95], [b - 0.35, 2.95]]) Bp('wood_dark', u - 0.04, u + 0.04, d - 0.04, d + 0.04, 0, 0.7, false);
      for (let k = 0; k < Math.floor((w - 0.8) / 0.55); k++) Bp(pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_blue']), a + 0.4 + k * 0.5, a + 0.82 + k * 0.5, 2.15, 2.8, 0.78, 0.96, false);
      Bp('timber', a + 0.1, b - 0.1, DS - 0.5, DS - 0.05, 0.5, 0.55, false); for (let yy = 0.9; yy < 2.4; yy += 0.5) Bp('timber', a + 0.1, b - 0.1, DS - 0.5, DS - 0.05, yy, yy + 0.05, false);
      for (let yy = 0.55; yy < 2.3; yy += 0.5) for (let u = a + 0.2; u < b - 0.5; u += 0.62) Bp(pick(rand, ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'linen']), u, u + 0.5, DS - 0.45, DS - 0.1, yy, yy + 0.3, false);
    } else if (kind === 'smith') {
      Bp('brick', a + 0.1, a + 1.5, DS - 1.2, DS - 0.1, 0, 0.9, true); Bp('lacquer_black', a + 0.25, a + 1.35, DS - 1.05, DS - 0.25, 0.9, 0.93, false);
      Bp('lacquer_black', a + 0.1, a + 1.5, DS - 0.02, DS, 1.3, 3.2, false);
      Bp('brick', a + 0.45, a + 1.15, DS - 0.9, DS - 0.45, 0.93, 1.9, false);
      Bp('lacquer_black', a + 0.65, a + 0.95, DS - 0.75, DS - 0.6, 0.93, 1.9, false);
      Bp('leather_bench', a + 1.6, a + 2.2, DS - 0.55, DS - 0.1, 0.1, 0.8, true);                          // the bellows
      Bp('wood_dark', a + 1.5, a + 2.1, 2.0, 2.5, 0, 0.6, true); Bp('iron', a + 1.55, a + 2.05, 2.05, 2.45, 0.6, 0.72, false); Bp('iron', a + 2.05, a + 2.35, 2.2, 2.3, 0.64, 0.7, false);   // the stump, the anvil
      for (let k = 0; k < 4; k++) Bp('iron', b - 0.5, b - 0.45, 1.4 + k * 0.35, 1.7 + k * 0.35, 1.2 + (k % 2) * 0.1, 1.9, false);      // tongs and hammers on the wall
      Vp('water', [[0.001, 0], [0.2, 0], [0.2, 0.03], [0.001, 0.03]], a + 0.2, 1.7, 0.42, 12); Vp('wood_dark', [[0.001, 0], [0.22, 0], [0.24, 0.4], [0.001, 0.4]], a + 0.2, 1.7, 0, 12); Cr(a + 0.2, 1.7, 0.24, 0, 0.45);
      lights.push({ at: [P(a + 0.8, DS - 0.7)[0], y + 1.2, P(a + 0.8, DS - 0.7)[1]], color: '#ff7b2a', intensity: 1.9, distance: 5 });
    } else if (kind === 'cobbler') {
      Bp('wood_dark', a + 0.2, a + 1.6, 2.2, 2.7, 0.75, 0.82, true); for (const [u, d] of [[a + 0.25, 2.25], [a + 1.55, 2.25], [a + 0.25, 2.65], [a + 1.55, 2.65]]) Bp('wood_dark', u - 0.04, u + 0.04, d - 0.04, d + 0.04, 0, 0.75, false);
      for (let k = 0; k < 4; k++) Bp('leather_bench', a + 0.3 + k * 0.32, a + 0.58 + k * 0.32, 2.3, 2.55, 0.82, 0.9, false);
      Bp('wood_dark', b - 0.9, b - 0.3, 3.4, 3.8, 0, 0.4, true);                                         // the cobbler's stool
      for (let yy = 0.6; yy < 2.2; yy += 0.45) { Bp('timber', a + 0.1, b - 0.1, DS - 0.35, DS - 0.05, yy, yy + 0.04, false); for (let u = a + 0.25; u < b - 0.4; u += 0.38) Bp('leather_bench', u, u + 0.26, DS - 0.32, DS - 0.1, yy + 0.04, yy + 0.2, false); }
    } else {
      // the grocer: sacks of grain and beans at the door, a heap of greens on a slab, strings of onions and a ham from the beams
      for (let k = 0; k < 4; k++) at(sack, 'sacking', a + 0.4 + k * 0.45, 1.3, 0);
      Bp('marble_smooth', a + 0.3, b - 0.3, 2.4, 3.2, 0.75, 0.82, true); Bp('brick', a + 0.35, b - 0.35, 2.45, 3.15, 0, 0.75, false);
      for (let k = 0; k < 6; k++) Vp(pick(rand, ['fresco_green', 'fresco_green', 'cloth_ochre']), [[0.001, 0], [0.08, 0.04], [0.07, 0.1], [0.001, 0.14]], a + 0.5 + k * 0.32 + rand() * 0.1, 2.8 + rand() * 0.2, 0.82, 8);
      for (let k = 0; k < 3; k++) { Bp('timber', a + 0.5 + k * 0.9, a + 0.52 + k * 0.9, 1.5, 1.52, 2.3, 3.4, false); Bp(k === 1 ? 'terracotta' : 'cloth_ochre', a + 0.46 + k * 0.9, a + 0.56 + k * 0.9, 1.46, 1.56, 2.2, 2.4, false); }
      for (let k = 0; k < 3; k++) at(sack, 'sacking', b - 0.5 - k * 0.42, DS - 0.35, 0);
    }
    // the lamp on its bracket, the soot above it, a worn patch at the door
    Bp('lacquer_black', uc - 0.5, uc + 0.5, DS - 0.02, DS, 2.4, 3.3, false);
    if (kind !== 'smith') lights.push({ at: [P(uc, DS - 1.2)[0], y + 2.8, P(uc, DS - 1.2)[1]], color: '#ffd9a0', intensity: 0.55, distance: 5.5 });
  });

  // ── the court: its paving, the well or the basin or the garden, the washing, the amphorae, the bench ─────────
  const midU = (W - SIDE - TI + T + 1.4) / 2, midD = (cd0 + cd1) / 2;                          // (canonical: the stair along u = T…T+1.2)
  const feature = pick(rand, ['well', 'basin', 'garden']);
  if (feature === 'well') {
    V('travertine', [[0.55, 0], [0.55, 0.12], [0.45, 0.14], [0.45, 0.8], [0.52, 0.84], [0.52, 0.92], [0.34, 0.92], [0.34, 0.8], [0.001, 0.8]], midU, midD, 0, 18); Cr(midU, midD, 0.55, 0, 0.95);
    V('water', [[0.001, 0.5], [0.34, 0.5], [0.001, 0.51]], midU, midD, 0, 12);
    for (const s of [-1, 1]) B('wood_dark', midU + s * 0.5 - 0.05, midU + s * 0.5 + 0.05, midD - 0.05, midD + 0.05, 0.9, 2.1);
    B('wood_dark', midU - 0.55, midU + 0.55, midD - 0.04, midD + 0.04, 2.0, 2.1);
    V('bronze', [[0.001, 0], [0.09, 0.0], [0.1, 0.18], [0.001, 0.18]], midU + 0.7, midD + 0.15, 0.05, 10);                       // the bucket
  } else if (feature === 'basin') {
    B('travertine', midU - 0.9, midU + 0.9, midD - 0.5, midD + 0.5, 0, 0.6, true); B('water', midU - 0.8, midU + 0.8, midD - 0.4, midD + 0.4, 0.5, 0.56);
    B('marble', midU - 0.3, midU + 0.3, midD + 0.5, midD + 0.8, 0, 1.6, true); B('bronze', midU - 0.04, midU + 0.04, midD + 0.3, midD + 0.5, 1.4, 1.46); B('water', midU - 0.02, midU + 0.02, midD + 0.3, midD + 0.34, 0.56, 1.4);
  } else {
    B('travertine', midU - 1.2, midU + 1.2, midD - 1.0, midD + 1.0, 0, 0.3, true); B('plaster_damp', midU - 1.08, midU + 1.08, midD - 0.88, midD + 0.88, 0.3, 0.34);
    V('bark_grey', [[0.14, 0], [0.11, 0.8], [0.08, 1.6], [0.001, 1.9]], midU, midD, 0.3, 8); V('fresco_green', [[0.001, 0], [0.9, 0.2], [1.1, 0.7], [0.8, 1.2], [0.001, 1.45]], midU, midD, 1.6, 12);
    for (let k = 0; k < 5; k++) V('terracotta', [[0.1, 0], [0.12, 0.2], [0.1, 0.2]], midU - 0.9 + k * 0.45, midD + 0.8, 0.34, 8);
  }
  // the amphorae against the wall of the shops, a bench, the washing on a line between two posts
  for (let k = 0; k < 4; k++) at(amph, 'terracotta', T + 2.2 + k * 0.4, cd0 + 0.3, 0, 0.0, true);
  B('stucco_rome', T + 2.0, T + 3.0, cd1 - 0.5, cd1 - 0.05, 0, 0.45, true);
  for (const u of [W - SIDE - 1.4, W - SIDE - 4.0]) Bp('wood_dark', mir ? u - 0.04 : W - u - 0.04, mir ? u + 0.04 : W - u + 0.04, cd1 - 1.9, cd1 - 1.82, 0, 2.3, false);
  { const ua = W - SIDE - 4.0, ub = W - SIDE - 1.4; B('cloth_white', ua, ub, cd1 - 1.88, cd1 - 1.84, 1.4, 2.2); B('cloth_indigo', ua + 0.5, ua + 1.0, cd1 - 1.9, cd1 - 1.82, 1.0, 1.9); B('cloth_red', ub - 0.7, ub - 0.2, cd1 - 1.9, cd1 - 1.82, 1.1, 2.0); B('timber', ua, ub, cd1 - 1.88, cd1 - 1.84, 2.3, 2.34); }
  // the timber stair up the wall to the landing at the first floor, with a handrail; a door to the flats
  {
    const su0 = T, su1 = T + 1.2, d0 = cd0 + 0.35, run = Math.min(5.4, cd1 - cd0 - 1.2), N = up ? 23 : 19, tread = run / N, rise = 0.2;
    for (let k = 0; k < N; k++) B(k % 2 ? 'travertine' : 'travertine', su0, su1, d0 + k * tread, d0 + (k + 1) * tread, 0, (k + 1) * rise);
    const ramp = rr(mir ? W - su1 : su0, mir ? W - su0 : su1, d0, d0 + run), dirW = { s: 'n', n: 's', e: 'w', w: 'e' }[f];
    col.ramp(ramp, y, y + N * rise, dirW);
    const lend = d0 + run, ly = N * rise;
    const lq = up ? lE : cd1;                                                                                // (opened: the landing ends where the back gallery begins)
    if (lq - lend > 0.05) {
      B('timber', su0, su1, lend, lq, ly - 0.2, ly); col.floor(rr(mir ? W - su1 : su0, mir ? W - su0 : su1, lend, lq), y + ly);
      for (const [u, d] of [[su1 - 0.08, lq - 0.1], [su1 - 0.08, lend + 0.1]]) B('timber', u - 0.07, u + 0.07, d - 0.07, d + 0.07, 0, ly - 0.2);
      B('wood_dark', su1 - 0.1, su1, lend, lq, ly - 0.2, ly - 0.05);
    }
    // the rail along the open side of the flight and the landing
    for (let k = 0; k <= N; k += 3) B('timber', su1 - 0.06, su1, d0 + k * tread - 0.03, d0 + k * tread + 0.03, Math.min(k, N) * rise, Math.min(k, N) * rise + 0.95);
    { const pts = (u, dd, yy) => { const [x, z] = P(mir ? W - u : u, dd); return [x, y + yy, z]; }, rail = []; hexa(rail, [pts(su1 - 0.07, d0, 0.9), pts(su1, d0, 0.9), pts(su1, d0 + run, N * rise + 0.9), pts(su1 - 0.07, d0 + run, N * rise + 0.9)], [pts(su1 - 0.07, d0, 0.98), pts(su1, d0, 0.98), pts(su1, d0 + run, N * rise + 0.98), pts(su1 - 0.07, d0 + run, N * rise + 0.98)]); bag.add('timber', fromTriangles(rail)); }
    if (lq - lend > 0.05) {
      B('timber', su1 - 0.07, su1, lend, lq, ly + 0.9, ly + 0.98); B('timber', su1 - 0.07, su1, lq - 0.07, lq, ly, ly + 0.9);
      if (up) col.rect(rr(mir ? W - su1 : su1 - 0.08, mir ? W - su1 + 0.08 : su1, lend, lq), y + ly, y + ly + 1.0);
    }
    // the door to the flats in the outer wall (a dark opening with a lintel and a threshold) and a lamp beside it
    B('opening', T - 0.02, T + 0.02, lend + 0.2, lend + 1.0, ly, ly + 2.1); B('travertine', T - 0.03, T + 0.06, lend + 0.1, lend + 1.1, ly + 2.1, ly + 2.3); B('lacquer_black', T, T + 0.02, lend + 0.2, lend + 1.0, ly, ly + 0.03);
    // a worn stain under the stair and a cat's dish (the household's)
    B('bronze', su1 + 0.3, su1 + 0.31, d0 + 0.2, d0 + 0.5, 0.0, 0.01);
    col.rect(rr(mir ? W - su1 : su0, mir ? W - su0 : su1, d0 - 0.001, d0 + 0.001), y, y + 0.25);
  }
  // ── the side room (the kitchen): the hearth bench, pots, the soot, wood, amphorae ─────────────────────────────
  {
    const k0 = W - SIDE, k1 = W - T, d0 = cd0 + 0.1, d1 = cd1 - 0.1;
    B('cotto_floor', k0 + TI, k1, d0, d1, 0, 0.01);
    B('brick', k1 - 0.9, k1 - 0.1, d0 + 0.2, d0 + 2.4, 0, 0.85, true); B('lacquer_black', k1 - 0.75, k1 - 0.25, d0 + 0.35, d0 + 2.25, 0.85, 0.88);
    B('lacquer_black', k1 - 0.1, k1 - 0.08, d0 + 0.2, d0 + 2.4, 1.3, 3.2);
    V('pottery_dark', [[0.001, 0], [0.13, 0.02], [0.16, 0.12], [0.13, 0.2], [0.14, 0.22], [0.001, 0.21]], k1 - 0.5, d0 + 0.8, 0.88, 10);
    V('bronze', [[0.001, 0], [0.15, 0], [0.17, 0.1], [0.16, 0.11], [0.001, 0.02]], k1 - 0.5, d0 + 1.7, 0.88, 10);
    for (let k = 0; k < 4; k++) at(amph, 'terracotta', k0 + 0.8, d1 - 0.3 - k * 0.4, 0, 0.2, true);
    B('timber', k0 + 0.8, k0 + 1.6, d0 + 0.1, d0 + 0.9, 0, 0.5, true);                                          // the wood
    for (let k = 0; k < 5; k++) B('wood_dark', k0 + 0.85, k0 + 1.55, d0 + 0.15 + k * 0.15, d0 + 0.27 + k * 0.15, 0.5, 0.62);
    B('timber', k0 + 0.6, k1 - 1.0, d1 - 0.9, d1 - 0.1, 0.75, 0.82, true);                                       // the table
    B('wood_dark', k0 + 0.6, k0 + 0.66, d1 - 0.9, d1 - 0.84, 0, 0.75); B('wood_dark', k1 - 1.06, k1 - 1.0, d1 - 0.9, d1 - 0.84, 0, 0.75);
    L([k1 - 0.9, d0 + 1.3, 1.2], '#ff8a3a', 1.4, 4);
    ceil(k0 + TI, k1, d0 - 0.1, d1 + 0.1, true);
  }
  // ── the cellae behind the court: a bed and a chest, a loom, the store of amphorae and sacks ────────────────
  rooms.forEach(([a, b], i) => {
    const kind = pick(rand, ['bed', 'loom', 'store', 'bed']), d0 = D - BR + TI / 2 + 0.05, d1 = D - T - 0.05, u0 = a + TI / 2 + 0.05, u1 = b - TI / 2 - 0.05;
    Bp('cotto_floor', u0, u1, D - BR, D - T, 0, 0.01, false);
    if (kind === 'bed') {
      Bp('wood_dark', u0 + 0.1, u0 + 1.0, d1 - 2.0, d1 - 0.1, 0, 0.5, true); Bp('linen', u0 + 0.14, u0 + 0.96, d1 - 1.96, d1 - 0.14, 0.5, 0.66, false); Bp(pick(rand, ['cloth_maroon', 'cloth_indigo', 'cloth_ochre']), u0 + 0.15, u0 + 0.95, d1 - 1.4, d1 - 0.15, 0.66, 0.68, false);
      Bp('wood_dark', u0 + 0.1, u0 + 1.0, d1 - 0.18, d1 - 0.1, 0.5, 1.0, false);
      Bp('wood_dark', u1 - 0.9, u1 - 0.1, d1 - 0.7, d1 - 0.1, 0, 0.6, true); Bp('bronze', u1 - 0.9, u1 - 0.1, d1 - 0.72, d1 - 0.68, 0.3, 0.38, false);   // the chest
      Bp('wood_dark', u1 - 0.55, u1 - 0.25, d0 + 0.3, d0 + 0.6, 0, 0.55, true); Vp('glass_lamp', [[0.001, 0], [0.04, 0], [0.045, 0.1], [0.001, 0.12]], (u1 - 0.4), d0 + 0.45, 0.55, 8);   // a stool with a lamp
      lights.push({ at: [P(u1 - 0.4, d0 + 0.45)[0], y + 0.8, P(u1 - 0.4, d0 + 0.45)[1]], color: '#ffb46b', intensity: 0.6, distance: 3.5 });
    } else if (kind === 'loom') {
      const lu = (u0 + u1) / 2;
      for (const s of [-0.7, 0.7]) Bp('wood_dark', lu + s - 0.05, lu + s + 0.05, d1 - 0.5, d1 - 0.4, 0, 2.2, true);
      Bp('wood_dark', lu - 0.75, lu + 0.75, d1 - 0.52, d1 - 0.38, 2.1, 2.2, false); Bp('wood_dark', lu - 0.75, lu + 0.75, d1 - 0.52, d1 - 0.38, 0.9, 0.98, false);
      for (let u = lu - 0.62; u < lu + 0.65; u += 0.08) Bp('linen', u, u + 0.012, d1 - 0.47, d1 - 0.46, 0.98, 2.1, false);
      Bp('cloth_ochre', lu - 0.62, lu + 0.62, d1 - 0.48, d1 - 0.45, 0.98, 1.4, false);
      for (let u = lu - 0.6; u < lu + 0.62; u += 0.2) Vp('terracotta', [[0.001, 0], [0.04, 0], [0.04, 0.09], [0.001, 0.09]], u, d1 - 0.47, 0.45, 6);
      Bp('wood_dark', lu - 0.2, lu + 0.2, d1 - 1.4, d1 - 1.0, 0, 0.45, true);                                  // her stool
      Bp('reed_mat', u0 + 0.3, u1 - 0.3, d0 + 0.3, d1 - 1.7, 0.0, 0.015, false);
    } else {
      for (let k = 0; k < 3; k++) for (let j = 0; j < 4; j++) at(amph, 'terracotta', u0 + 0.35 + j * 0.45, d1 - 0.35 - k * 0.5, 0, (j + k) % 2 ? 0.2 : -0.2);
      for (let k = 0; k < 3; k++) at(sack, 'sacking', u1 - 0.3, d0 + 0.4 + k * 0.45, 0);
      Bp('wood_dark', u0 + 0.1, u0 + 0.9, d0 + 0.2, d0 + 0.8, 0, 0.5, true);
    }
    void i;
  });
  void midU; void BR; void SIDE;
}

/** The furnishing of the opened first floor (the element `up_cells_flat` of the plan of its own, shown near): the rooms of the layout the builder gives. */
function flatFurn(el, ctx) {
  const out = {};
  insulaOpen({ rect: el.rect, front: el.front, seed: el.seed, y: el.y, upper: true, dry: true, layoutOut: out }, ctx);
  furnishElement({ rect: el.rect, front: el.front, flat: true, y: el.y ?? 0, rooms: out.rooms }, ctx);
}
/** The walks into the first floor of an opened insula, in world coordinates (for the walk-check routes of plan.js). */
export function flatRoutes(el) {
  const out = {};
  insulaOpen({ rect: el.rect, front: el.front, seed: el.seed, y: el.y, upper: true, dry: true, layoutOut: out }, { bag: { add() {} }, col: {}, lights: [] });
  const P = flatFrame(el);
  return Object.fromEntries(Object.entries(out.routes).map(([k, r]) => [k, r.map(([u, d, h]) => { const [x, z] = P(u, d); return h === undefined ? [+x.toFixed(2), +z.toFixed(2)] : [+x.toFixed(2), +z.toFixed(2), +((el.y ?? 0) + h).toFixed(2)]; })]));
}
STYLES['rome-site'].elements.insula_open = insulaOpen;
STYLES['rome-site'].elements.up_cells_flat = flatFurn;
