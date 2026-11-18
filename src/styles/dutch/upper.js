// The upper floors of an open Amsterdam canal house about 1670 (docs/settlements/amsterdam.md §5.20): the steep stair
// up from the hall, flight on flight in two strips side by side along the party wall, each flight through a trap in
// the floor above; on each floor the front chamber (voorkamer) and the back chamber (achterkamer) either side of the
// partition, furnished by the house's trade (merchant, inn, craftsman, lodgers, counting house) — box beds, chests,
// presses, a table, a workbench; the warehouse's floors of goods; and under the roof the attic (zolder) with its
// boarded slopes, the loft (kapzolder) under the gable reached by a ladder, and the hoisting hatch with its bar.
// Built in the house's front frame F (u along the front, d outward from it — the house lies at d < 0 — v up from y).

import { rod } from '../../core/geom.js';
import { faceFrame, fbox, sideprism, bar, slab4 } from './facade.js';
import { wallHoles } from './reveal.js';

const OAK = 'wood_dark', PL = 'plaster_white', TB = 'timber', IR = 'wood_dark';
const P = 0.22, T = 0.3, LIN = 0.02, PT = 0.15;                     // party wall, front layer, plaster lining, partition
export const SA = [0.02, 1.07], SD = [1.07, 1.17], SB = [1.17, 2.22];   // the stair's strips and the divider between them: metres from the door side's party wall
const RUN = 2.35, LAND = 0.9;                                          // a flight's run, the landing at its ends
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * What the house is, from its own dice (the same as house.js draws them): { w, D, Dm, n, st, left, warehouse, use, trade, dP, ok }.
 * `ok`: the stair's strips and the back chamber's two landings fit in it.
 */
export function profile(el) {
  const f = el.front ?? 's', F = faceFrame(el.rect, f), w = F.w, D = F.D, n = el.storeys ?? 4, seed = el.seed || 1;
  const rand = rng(seed); rand(); rand(); rand();
  const kr = rand(), st = 2.95 + rand() * 0.3, doorR = rand();
  const kind = el.gable ?? (kr > 0.9 ? 'spout' : kr < 0.3 ? 'step' : kr < 0.65 ? 'neck' : 'bell'), warehouse = kind === 'spout';
  const annex = !warehouse && D >= 11 && rng(seed * 7 + 13)() < 0.55, Dm = annex ? D - 3.4 : D;
  const bays = w >= 6.4 ? 3 : 2, left = warehouse ? false : doorR < 0.5;
  const use = warehouse ? 'store' : ((q) => (q < 0.45 ? 'zaal' : q < 0.75 ? 'kitchen' : 'office'))(rng(seed * 19 + 7)());
  const tr = rng(seed * 29 + 5)();
  const trade = warehouse ? 'store' : use === 'zaal' ? (tr < 0.3 ? 'inn' : 'merchant') : use === 'kitchen' ? (tr < 0.5 ? 'lodgers' : 'craftsman') : 'counting';
  const dP = -Math.max(3.4, Math.min(5.8, Dm * 0.47));
  const bc = Dm - T - Math.abs(dP) - PT;                                // the back chamber's depth
  const ok = n >= 3 && w >= 6.0 && (warehouse ? Dm >= 7.5 : bc >= 4.05);
  return { w, D, Dm, n, st, left, warehouse, use, trade, dP, kind, bays, ok };
}

/** The flights of the stair: ground to first floor, and so on to the attic. Each: { k, strip: 'a'|'b', zone, dBot, dTop }. */
export function flights(p) {
  const out = [], dB = -p.Dm + T;
  for (let k = 0; k < p.n; k++) {
    let zone, strip, dBot, dTop;
    if (p.warehouse) {                                                    // the store: a shaft at the back, flights turning at its ends
      zone = 'S'; strip = (p.n - 1 - k) % 2 === 0 ? 'b' : 'a';
      if (k % 2 === 0) { dBot = dB + LAND + RUN; dTop = dB + LAND; } else { dBot = dB + LAND; dTop = dB + LAND + RUN; }
    } else if (k === 0) { zone = 'Z1'; strip = 'a'; dBot = p.dP + 2.9; dTop = p.dP + 0.3; }   // the hall stair, to the partition's door
    else {                                                                 // behind the partition: bottom landing at the door, top landing at the back
      zone = 'Z2'; strip = (p.n - 1 - k) % 2 === 0 ? 'b' : 'a'; const dq = p.dP - PT;
      if (k % 2 === 1) { dBot = dq - LAND; dTop = dq - LAND - RUN; } else { dBot = dq - LAND - RUN; dTop = dq - LAND; }
    }
    out.push({ k, strip, zone, dBot, dTop });
  }
  return out;
}

/** Sutherland–Hodgman: the convex polygon pts ([[x, y]…]) clipped to the box [x0, x1] × [y0, y1]. */
function clipBox(pts, x0, x1, y0, y1) {
  let out = pts;
  for (const f of [(q) => q[0] - x0, (q) => x1 - q[0], (q) => q[1] - y0, (q) => y1 - q[1]]) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    if (out.length < 3) return [];
  }
  return out;
}
const area = (q) => { let s = 0; for (let i = 0, j = q.length - 1; i < q.length; j = i++) s += (q[j][0] + q[i][0]) * (q[j][1] - q[i][1]); return Math.abs(s / 2); };
/** The convex polygon pts ([[u, v]…]) with the rects ({ u0, u1, v0, v1 }) taken out: convex pieces. */
export function cutOut(pts, rects) {
  let pieces = [pts];
  for (const r of rects) {
    const next = [], B = 1e6;
    for (const q of pieces) for (const c of [clipBox(q, -B, r.u0, -B, B), clipBox(q, r.u1, B, -B, B), clipBox(q, r.u0, r.u1, -B, r.v0), clipBox(q, r.u0, r.u1, r.v1, B)]) if (c.length >= 3 && area(c) > 1e-4) next.push(c);
    pieces = next;
  }
  return pieces;
}

/** Cells (rects [u0, u1, d0, d1]) of a region with holes cut out, runs along u merged. */
function cells(R, holes) {
  const us = [...new Set([R[0], R[1], ...holes.flatMap((h) => [h[0], h[1]])].filter((u) => u >= R[0] - 1e-6 && u <= R[1] + 1e-6))].sort((a, b) => a - b);
  const ds = [...new Set([R[2], R[3], ...holes.flatMap((h) => [h[2], h[3]])].filter((d) => d >= R[2] - 1e-6 && d <= R[3] + 1e-6))].sort((a, b) => a - b);
  const out = [];
  for (let j = 0; j + 1 < ds.length; j++) {
    let run = null;
    for (let i = 0; i + 1 < us.length; i++) {
      const cu = (us[i] + us[i + 1]) / 2, cd = (ds[j] + ds[j + 1]) / 2, inside = holes.some((h) => cu > h[0] && cu < h[1] && cd > h[2] && cd < h[3]);
      if (!inside && us[i + 1] - us[i] > 1e-4 && ds[j + 1] - ds[j] > 1e-4) { if (run) run[1] = us[i + 1]; else out.push(run = [us[i], us[i + 1], ds[j], ds[j + 1]]); } else run = null;
    }
  }
  return out;
}

/**
 * The tools every part of the house is built with: boxes and solids in the frame F, the collision world's calls in
 * its terms, the stair's geometry for this house.
 */
function tools(bag, col, F, y, o) {
  const { w, Dm, n, st, base, H, floors, left } = o;
  const A = (m, u0, u1, v0, v1, d0, d1) => bag.add(m, fbox(F, y, u0, u1, v0, v1, d0, d1));
  const rectOf = (u0, u1, d0, d1) => { const p = F.at(u0, d0), q = F.at(u1, d1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const C = (u0, u1, d0, d1, v0, v1) => col.rect(rectOf(u0, u1, d0, d1), y + v0, y + v1);
  const FL = (u0, u1, d0, d1, v) => col.floor(rectOf(u0, u1, d0, d1), y + v);
  const P3 = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const dv = (() => { const p = F.at(0, 0), q = F.at(0, 1); return [q[0] - p[0], q[1] - p[1]]; })();
  const Lf = (k) => (k < n ? floors[k] : H);                               // the top of the boards on the beams of level k
  const fl = (k) => (k === 0 ? base + 0.03 : Lf(k) + 0.04);                // the floor one walks on
  const sU = (k) => (left ? P + k : w - P - k);
  const strip = (s) => { const q = s === 'a' ? SA : SB; return [Math.min(sU(q[0]), sU(q[1])), Math.max(sU(q[0]), sU(q[1]))]; };
  const divider = [Math.min(sU(SD[0]), sU(SD[1])), Math.max(sU(SD[0]), sU(SD[1]))];
  const ramp = (u0, u1, dBot, dTop, vBot, vTop) => {
    const e = 0.45, up = Math.sign(dTop - dBot), m = (vTop - vBot) / Math.abs(dTop - dBot), dLow = dBot - up * e;
    const r = rectOf(u0, u1, dLow, dTop), a = [dv[0] * up, dv[1] * up];
    col.ramp(r, y + vBot - m * e, y + vTop, Math.abs(a[0]) > Math.abs(a[1]) ? (a[0] > 0 ? 'e' : 'w') : (a[1] > 0 ? 's' : 'n'));
  };
  return { A, rectOf, C, FL, P3, dv, Lf, fl, sU, strip, divider, ramp, w, Dm, n, st, base, H, floors, left };
}

/** The treads, risers, stringers and the closed balustrade of one flight (mesh only). */
function flightMesh(bag, T0, F, y, f, vBot, vTop, sides) {
  const { A, P3, strip, divider, sU } = T0;
  const [u0, u1] = strip(f.strip), up = Math.sign(f.dTop - f.dBot), nS = Math.round((vTop - vBot) / 0.235), rise = (vTop - vBot) / nS, run = Math.abs(f.dTop - f.dBot) / nS;
  for (let i = 1; i <= nS; i++) {
    const d0 = f.dBot + up * (i - 1) * run, d1 = f.dBot + up * i * run, v = vBot + i * rise;
    A(OAK, u0 + 0.04, u1 - 0.04, v - 0.04, v, Math.min(d0, d1) - (up > 0 ? 0.03 : 0), Math.max(d0, d1) + (up > 0 ? 0 : 0.03));    // the tread with its nosing
    A(TB, u0 + 0.04, u1 - 0.04, v - rise, v - 0.04, Math.min(d0, d0 + up * 0.02), Math.max(d0, d0 + up * 0.02));                  // the riser
  }
  const pts = [[f.dBot, vBot - 0.22], [f.dTop, vTop - 0.22], [f.dTop, vTop], [f.dBot, vBot]];
  for (const [a, b] of [[u0, u0 + 0.04], [u1 - 0.04, u1]]) bag.add(OAK, sideprism(F, y, pts, a, b));                                 // the stringers
  // the balustrade: a board wall on the divider (and on the strip's outer side where it is open), with its rail
  const par = (a, b) => {
    bag.add(OAK, sideprism(F, y, [[f.dBot, vBot], [f.dTop, vTop], [f.dTop, vTop + 0.9], [f.dBot, vBot + 0.9]], a, b));
    const m = (a + b) / 2;
    bag.add(OAK, sideprism(F, y, [[f.dBot, vBot + 0.92], [f.dTop, vTop + 0.92], [f.dTop, vTop + 0.98], [f.dBot, vBot + 0.98]], m - 0.035, m + 0.035));
  };
  par(...divider);
  if (sides.outer) { const t = f.strip === 'b' ? SB[1] : SA[1]; par(Math.min(sU(t), sU(t + 0.06)), Math.max(sU(t), sU(t + 0.06))); }
}

/**
 * The hall's stair with the ground floor (interior.js): the flight from the hall up to the first floor, walkable.
 * ctx: { w, Dm, base, top, left, dP, fl } from canalInterior; returns nothing.
 */
export function groundStair(bag, col, F, y, o) {
  const p = o.p, T0 = tools(bag, col, F, y, { ...o, n: p.n, st: p.st }), f = flights(p)[0];
  const [u0, u1] = T0.strip(f.strip), vBot = T0.fl(0), vTop = T0.fl(1), { A, C } = T0;
  flightMesh(bag, T0, F, y, f, vBot, vTop, { outer: f.strip === 'b' });
  T0.ramp(u0, u1, f.dBot, f.dTop, vBot, vTop);
  const d0 = Math.min(f.dBot, f.dTop), d1 = Math.max(f.dBot, f.dTop);
  C(T0.divider[0], T0.divider[1], d0, d1, vBot, vTop + 1.05);                                              // the stair's side along the divider
  if (f.strip === 'b') { const a = T0.sU(SB[1]), b = T0.sU(SB[1] + 0.06); C(Math.min(a, b), Math.max(a, b), d0, d1, vBot, vTop + 1.05); const q = SB[1]; void q; }
  void A;
}

// ---------------------------------------------------------------------------------------------------------------------

/**
 * upperFloors(bag, col, F, y, o): the shell, floors, stairs, rooms and attic above the ground floor.
 * o = { w, Dm, n, st, base, H, floors, mat, left, p (profile), holes (the front's window holes above the ground floor),
 *       frame, gable: { kind, gh, rh, uc, hatch: {u0,u1,v0,v1}, win: {...} | null, crown }, seed }.
 */
export function upperFloors(bag, col, F, y, o) {
  const { w, Dm, n, st, base, H, floors, mat, left, p, seed } = o;
  const T0 = tools(bag, col, F, y, o), { A, C, FL, P3, Lf, fl, sU, strip, divider, ramp, rectOf } = T0;
  const iu0 = P, iu1 = w - P, dF = -T, dB = -Dm + T, top = floors[1], warehouse = p.warehouse;
  const W = (m, u0, u1, v0, v1, d0, d1) => { A(m, u0, u1, v0, v1, d0, d1); C(u0, u1, d0, d1, v0, v1); };
  const fls = flights(p), rand = rng(seed * 41 + 9);
  // ---- the shell: party walls and back wall to the eaves, the front layer with its windows cut through (and shut to walk through)
  W(mat, 0, P, top, H, -Dm, 0); W(mat, w - P, w, top, H, -Dm, 0); W(mat, P, w - P, top, H, -Dm, dB);
  wallHoles((ua, ub, va, vb) => A(mat, ua, ub, va, vb, dF, 0), 0, w, top, H, o.holes); C(0, w, dF, 0, top, H);
  A(PL, iu0, iu0 + LIN, top, H, dB, dF); A(PL, iu1 - LIN, iu1, top, H, dB, dF); A(PL, iu0 + LIN, iu1 - LIN, top, H, dB, dB - LIN);
  wallHoles((ua, ub, va, vb) => A(PL, ua, ub, va, vb, dF - LIN, dF), iu0 + LIN, iu1 - LIN, top, H, o.holes);
  // the back windows, seen from inside: a frame and its dark glass on the inner face of the back wall
  for (let s = 1; s < n; s++) for (const u of [0.25 * w, 0.75 * w]) {
    const v0 = floors[s] + 0.55, hh = (s === n - 1 ? st - 1.25 : st - 1.0), hw = Math.min(0.55, w / 4 - 0.55);
    A(OAK, u - hw, u + hw, v0, v0 + hh, dB + 0.0, dB + 0.05); A('opening', u - hw + 0.07, u + hw - 0.07, v0 + 0.07, v0 + hh - 0.07, dB + 0.05, dB + 0.065);
    A(OAK, u - hw + 0.05, u + hw - 0.05, v0 + hh * 0.64 - 0.03, v0 + hh * 0.64 + 0.03, dB + 0.065, dB + 0.09);
  }

  // ---- the floors: boards on beams, a trap in each for the flight that comes up through it; rails round the trap's foot
  const rails = (m) => {
    const f = fls[m - 1], [u0, u1] = strip(f.strip), d0 = Math.min(f.dBot, f.dTop), d1 = Math.max(f.dBot, f.dTop), v = fl(m);
    const dEnd = f.dBot + (f.dBot > f.dTop ? 0.03 : -0.03);                                          // the rail across the foot of the trap
    A(OAK, u0, u1, v + 0.9, v + 0.97, Math.min(dEnd, f.dBot) - 0.03, Math.max(dEnd, f.dBot) + 0.03);
    for (const u of [u0 + 0.03, (u0 + u1) / 2, u1 - 0.03]) A(OAK, u - 0.025, u + 0.025, v, v + 0.95, f.dBot - 0.03, f.dBot + 0.03);
    C(u0, u1, f.dBot - 0.04, f.dBot + 0.04, v, v + 1.05);
    void d0; void d1;
  };
  for (let m = 1; m <= n; m++) {
    const f = fls[m - 1], [su0, su1] = strip(f.strip), hole = [su0, su1, Math.min(f.dBot, f.dTop), Math.max(f.dBot, f.dTop)];
    const R = m < n ? [iu0 + LIN, iu1 - LIN, dB + LIN, dF - LIN] : [iu0, iu1, -Dm + 0.45, -0.45];
    const nb = Math.max(2, Math.round((R[3] - R[2]) / 1.15)), beamD = (i) => R[2] + (i + 0.5) * (R[3] - R[2]) / nb;
    for (const c of cells(R.length === 4 ? [R[0], R[1], R[2], R[3]] : R, [hole])) {
      const [cu0, cu1, cd0, cd1] = c;
      if (m === 1) A(TB, cu0, cu1, top, top + 0.04, cd0, cd1);
      else {
        A(m === n ? TB : TB, cu0, cu1, Lf(m) - 0.05, Lf(m) + 0.04, cd0, cd1);
        for (let i = 0; i < nb; i++) { const d = beamD(i); if (d > cd0 + 0.11 && d < cd1 - 0.11) A(OAK, cu0, cu1, Lf(m) - 0.3, Lf(m) - 0.05, d - 0.11, d + 0.11); }
      }
      FL(cu0, cu1, cd0, cd1, fl(m));
    }
    rails(m);
  }
  // ---- the stair: each flight's treads, its ramp to walk on, its sides shut (the guard), its balustrade
  for (let k = 1; k < n; k++) {
    const f = fls[k], [u0, u1] = strip(f.strip), vB = fl(k), vT = fl(k + 1), outer = f.strip === 'b';
    flightMesh(bag, T0, F, y, f, vB, vT, { outer });
    ramp(u0, u1, f.dBot, f.dTop, vB, vT);
    const d0 = Math.min(f.dBot, f.dTop), d1 = Math.max(f.dBot, f.dTop);
    C(divider[0], divider[1], d0, d1, vB, vT + 1.05);
    if (outer) { const a = sU(SB[1]), b = sU(SB[1] + 0.06); C(Math.min(a, b), Math.max(a, b), d0, d1, vB, vT + 1.05); }
  }

  // ---- the partition between the front and the back chamber, on each floor: the free door at its middle, and on the first floor the stair's door
  if (!warehouse) {
    const pdu = w / 2 + (left ? 0.25 : -0.25), pw = 0.46, dP = p.dP;
    for (let m = 1; m < n; m++) {
      const v0 = fl(m) - 0.04, v1 = Lf(m + 1) - 0.3, holes = [{ u0: pdu - pw, u1: pdu + pw, v0, v1: v0 + 2.15 + 0.04 }];
      if (m === 1) { const [a, b] = strip('a'); holes.push({ u0: a, u1: b, v0, v1: v0 + 2.15 + 0.04 }); }
      holes.sort((a, b) => a.u0 - b.u0);
      wallHoles((ua, ub, va, vb) => { A(PL, ua, ub, va, vb, dP - PT, dP); C(ua, ub, dP - PT, dP, va, vb); }, iu0 + LIN, iu1 - LIN, v0, v1, holes);
      for (const h of holes) {                                                                         // the door frames
        A(OAK, h.u0 - 0.08, h.u0, v0, h.v1 + 0.08, dP - PT - 0.03, dP + 0.03); A(OAK, h.u1, h.u1 + 0.08, v0, h.v1 + 0.08, dP - PT - 0.03, dP + 0.03);
        A(OAK, h.u0 - 0.08, h.u1 + 0.08, h.v1, h.v1 + 0.1, dP - PT - 0.03, dP + 0.03);
      }
    }
  }
  rooms(bag, col, F, y, o, T0, fls, rand);
  attic(bag, col, F, y, o, T0, fls, rand);
}

// ---------------------------------------------------------------------------------------------------------------------
// The rooms

/** A frame on the room's far wall: x along the piece's length, y across it; 'u': the length along the front, 'd': along the depth. */
function frame(T0, axis, k0, d0) {
  const { A, C, left, w } = T0, fw = left ? w - P - LIN : P + LIN, fs = left ? -1 : 1, FU = (k) => fw + fs * k;
  return {
    FU,
    b: (m, x0, x1, v0, v1, y0, y1, V) => (axis === 'u' ? A(m, FU(k0 + x0), FU(k0 + x1), V + v0, V + v1, d0 + y0, d0 + y1) : A(m, FU(k0 + y0), FU(k0 + y1), V + v0, V + v1, d0 + x0, d0 + x1)),
    c: (x0, x1, y0, y1, V, h) => (axis === 'u' ? C(FU(k0 + x0), FU(k0 + x1), d0 + y0, d0 + y1, V, V + h) : C(FU(k0 + y0), FU(k0 + y1), d0 + x0, d0 + x1, V, V + h)),
  };
}

function rooms(bag, col, F, y, o, T0, fls, rand) {
  const { A, C, fl, Lf, w, n, left, dv } = T0, { p, Dm, seed } = o, dP = p.dP, dF = -T, dB = -Dm + T;
  const trade = p.trade, hash = (a, b) => ((((a * 73856093) ^ (b * 19349663) ^ (seed * 83492791)) >>> 0) % 1000) / 1000;
  const bedL = Math.min(2.05, w / 2 - 1.05);
  // ----- the pieces
  const bed = (V, axis, d0, len, cov, k0 = 0) => {
    const f = frame(T0, axis, k0, d0), Wd = 1.1, b = (m, ...r) => f.b(m, ...r, V);
    b(OAK, 0, len, 0, 2.0, 0, 0.05); b(OAK, 0, 0.05, 0, 2.0, 0, Wd); b(OAK, len - 0.05, len, 0, 2.0, 0, Wd);
    b(OAK, 0, len, 0, 0.5, Wd - 0.05, Wd); b(OAK, 0, 0.2, 0, 2.0, Wd - 0.05, Wd); b(OAK, len - 0.2, len, 0, 2.0, Wd - 0.05, Wd); b(OAK, 0, len, 1.85, 2.0, Wd - 0.05, Wd);
    b(OAK, 0.05, len - 0.05, 0.4, 0.5, 0.05, Wd - 0.05);
    b('plaster_white', 0.07, len - 0.07, 0.5, 0.7, 0.07, Wd - 0.07); b(cov, 0.07, len - 0.55, 0.7, 0.76, 0.07, Wd - 0.07); b('plaster_white', 0.1, 0.5, 0.72, 0.9, 0.15, Wd - 0.15);
    b('cloth_green', 0.2, 0.55, 0.55, 1.85, Wd, Wd + 0.035); b('wood_dark', 0.18, 0.95, 1.8, 1.83, Wd + 0.02, Wd + 0.05);
    f.c(0, len, 0, Wd + 0.05, V, 2.0);
  };
  const chest = (V, axis, k0, d0, len = 0.95, wd = 0.55) => {
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V);
    b(OAK, 0, len, 0, 0.5, 0, wd); b(OAK, -0.01, len + 0.01, 0.5, 0.6, -0.01, wd + 0.01); b(OAK, 0.03, len - 0.03, 0.6, 0.66, 0.06, wd - 0.06);
    for (const x of [0.12, len - 0.18]) { b(IR, x, x + 0.06, 0, 0.6, wd, wd + 0.012); b(IR, x, x + 0.06, 0.6, 0.67, 0.05, wd - 0.05); }
    b(IR, len / 2 - 0.05, len / 2 + 0.05, 0.38, 0.52, wd, wd + 0.02);
    f.c(0, len, 0, wd, V, 0.68);
  };
  const kast = (V, axis, k0, d0, len = 1.35, dep = 0.6) => {
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V);
    for (const x of [0.06, len - 0.06]) for (const q of [0.08, dep - 0.08]) b(OAK, x - 0.05, x + 0.05, 0, 0.14, q - 0.05, q + 0.05);
    b(OAK, 0, len, 0.14, 1.95, 0, dep - 0.05); b(OAK, -0.04, len + 0.04, 1.95, 2.08, -0.02, dep + 0.04);
    for (const [x0, x1] of [[0.05, len / 2 - 0.02], [len / 2 + 0.02, len - 0.05]]) { b(TB, x0, x1, 0.25, 1.15, dep - 0.05, dep + 0.01); b(TB, x0, x1, 1.25, 1.88, dep - 0.05, dep + 0.01); }
    b(IR, len / 2 - 0.06, len / 2 - 0.03, 0.9, 1.0, dep + 0.01, dep + 0.03); b(IR, len / 2 + 0.03, len / 2 + 0.06, 0.9, 1.0, dep + 0.01, dep + 0.03);
    f.c(-0.04, len + 0.04, -0.02, dep + 0.04, V, 2.08);
  };
  const table = (V, axis, k0, d0, len = 1.2, wd = 0.75, cloth = null) => {
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V);
    for (const x of [0.07, len - 0.07]) for (const q of [0.07, wd - 0.07]) b(OAK, x - 0.04, x + 0.04, 0, 0.72, q - 0.04, q + 0.04);
    b(OAK, 0, len, 0.72, 0.77, 0, wd);
    if (cloth) { b(cloth, -0.03, len + 0.03, 0.77, 0.785, -0.03, wd + 0.03); b(cloth, -0.03, len + 0.03, 0.55, 0.785, wd + 0.03, wd + 0.04); }
    f.c(0, len, 0, wd, V, 0.8);
    return f;
  };
  const chair = (V, axis, k0, d0, back = 'd+') => {
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V), s = 0.46;
    for (const x of [0.03, s - 0.03]) for (const q of [0.03, s - 0.03]) b(OAK, x - 0.02, x + 0.02, 0, 0.45, q - 0.02, q + 0.02);
    b('hide_brown', 0, s, 0.45, 0.49, 0, s);
    if (back === 'd+') { b(OAK, 0, 0.04, 0.49, 1.0, 0.0, s); b('hide_brown', 0.012, 0.03, 0.55, 0.92, 0.03, s - 0.03); } else { b(OAK, s - 0.04, s, 0.49, 1.0, 0, s); b('hide_brown', s - 0.03, s - 0.012, 0.55, 0.92, 0.03, s - 0.03); }
    f.c(0, s, 0, s, V, 0.5);
  };
  const painting = (V, FUk, d, v, wd, ht, canvas = 'ceiling_painted') => {            // on the far wall
    const fw = left ? w - P - LIN : P + LIN, fs = left ? -1 : 1, u0 = fw, u1 = fw + fs * 0.05, fr = 0.06;
    A('lacquer_black', u0, u1, V + v - ht / 2, V + v + ht / 2, d - wd / 2, d + wd / 2); A(canvas, u0, fw + fs * 0.058, V + v - ht / 2 + fr, V + v + ht / 2 - fr, d - wd / 2 + fr, d + wd / 2 - fr);
    void FUk;
  };
  const crate = (V, axis, k0, d0, a, b2, h) => { const f = frame(T0, axis, k0, d0), bb = (m, ...r) => f.b(m, ...r, V); bb(TB, 0, a, 0, h, 0, b2); for (const q of [0.3, 0.7]) bb(OAK, a * q - 0.02, a * q + 0.02, 0, h + 0.005, -0.004, b2 + 0.004); f.c(0, a, 0, b2, V, h); };
  const barrel = (V, axis, k0, d0, r = 0.3) => { const f = frame(T0, axis, k0, d0), c = f.FU(k0 + r), e = d0 + r;   // stave barrel as stacked boxes (no new lathe shape: the draw budget)
    for (const [t0, t1, q] of [[0, 0.28, 0.86], [0.28, 0.56, 1.02], [0.56, 0.84, 0.86]]) A(TB, c - r * q, c + r * q, V + t0, V + t1, e - r * q, e + r * q);
    for (const t of [0.1, 0.7]) A(IR, c - r * 0.9, c + r * 0.9, V + t, V + t + 0.03, e - r * 0.9, e + r * 0.9);
    C(f.FU(k0), f.FU(k0 + 2 * r), d0, d0 + 2 * r, V, V + 0.86); };
  const sacks = (V, axis, k0, d0, len, tiers, wd = 0.55) => {
    const f = frame(T0, axis, k0, d0), nn = Math.max(1, Math.floor(len / 0.62)), sw = len / nn;
    for (let t = 0; t < tiers; t++) for (let i = 0; i < nn - (t > 0 && nn > 1 ? 1 : 0); i++) { const x0 = i * sw + (t > 0 ? sw / 2 : 0); f.b('hide_brown', x0 + 0.02, x0 + sw - 0.02, t * 0.32, t * 0.32 + 0.32, 0.03, wd - 0.03, V); f.b('hide_brown', x0 + sw / 2 - 0.015, x0 + sw / 2 + 0.015, t * 0.32 + 0.14, t * 0.32 + 0.3, wd - 0.035, wd - 0.02, V); }
    f.c(0, len, 0, wd, V, tiers * 0.32);
  };
  const bales = (V, axis, k0, d0, len, tiers, m = 'paint_ochre') => {
    const f = frame(T0, axis, k0, d0), nn = Math.max(1, Math.floor(len / 0.9)), bw = len / nn;
    for (let t = 0; t < tiers; t++) for (let i = 0; i < nn; i++) { const x0 = i * bw; f.b(m, x0 + 0.02, x0 + bw - 0.02, t * 0.55, t * 0.55 + 0.55, 0.04, 0.66, V); for (const q of [0.25, 0.75]) f.b('hide_brown', x0 + bw * q - 0.012, x0 + bw * q + 0.012, t * 0.55, t * 0.55 + 0.555, 0.035, 0.665, V); }
    f.c(0, len, 0, 0.7, V, tiers * 0.55);
  };
  const logs = (V, axis, k0, d0, len) => {                                              // a stack of firewood in bundles
    const f = frame(T0, axis, k0, d0);
    for (let t = 0; t < 3; t++) f.b('bark_dark', 0.0, len - t * 0.1, t * 0.2, t * 0.2 + 0.2, 0.0, 0.5, V), f.b(OAK, 0.02 + t * 0.04, 0.05 + t * 0.04, t * 0.2, t * 0.2 + 0.2, -0.004, 0.504, V);
    f.c(0, len, 0, 0.5, V, 0.6);
  };
  const bench = (V, axis, k0, d0, len) => {                                              // a workbench with its vice and tools, a shelf over it
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V), wd = 0.62;
    for (const x of [0.08, len - 0.08]) for (const q of [0.08, wd - 0.08]) b(OAK, x - 0.05, x + 0.05, 0, 0.88, q - 0.05, q + 0.05);
    b(OAK, 0, len, 0.88, 0.95, 0, wd); b(TB, 0.06, len - 0.06, 0.3, 0.34, 0.06, wd - 0.06);
    b(IR, 0.1, 0.28, 0.95, 1.1, wd - 0.08, wd - 0.02); b(OAK, 0.12, 0.26, 0.95, 1.0, 0.1, wd - 0.1);
    for (const [x, m] of [[0.5, IR], [0.85, OAK], [1.2, IR]]) if (x < len - 0.1) b(m, x, x + 0.22, 0.95, 0.975, 0.18, 0.26);
    f.c(0, len, 0, wd, V, 1.1);
    return f;
  };
  const shelves = (V, axis, k0, d0, len, ms) => {                                         // shelves on the wall with goods on them
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V);
    for (const [i, v] of [1.2, 1.7].entries()) { b(OAK, 0, len, v - 0.03, v, 0, 0.28); for (let x = 0.08, j = 0; x < len - 0.15; x += 0.24 + (j++ % 2) * 0.05) b(ms[(i + j) % ms.length], x, x + 0.16, v, v + 0.14 + (j % 3) * 0.05, 0.05, 0.2); }
    b(OAK, 0.0, 0.04, 1.17, 1.73, 0, 0.28); b(OAK, len - 0.04, len, 1.17, 1.73, 0, 0.28);
  };
  const loom = (V, axis, k0, d0) => {                                                    // a hand loom (weefgetouw): posts, beams, the warp with its cloth
    const f = frame(T0, axis, k0, d0), b = (m, ...r) => f.b(m, ...r, V), len = 1.3, wd = 1.5;
    for (const x of [0.04, len - 0.04]) for (const q of [0.05, 0.75, wd - 0.05]) b(OAK, x - 0.045, x + 0.045, 0, q < 0.5 ? 1.7 : q < 1 ? 1.5 : 1.05, q - 0.045, q + 0.045);
    b(OAK, 0, len, 1.6, 1.7, 0, 0.1); b(OAK, 0, len, 1.45, 1.52, 0.7, 0.8); b(OAK, 0, len, 0.98, 1.05, wd - 0.1, wd);
    b('plaster_white', 0.1, len - 0.1, 1.05, 1.5, 0.74, 0.76);
    b('cloth_indigo', 0.12, len - 0.12, 1.05, 1.3, 0.76, 0.79); b('cloth_red', 0.12, len - 0.12, 1.3, 1.34, 0.76, 0.79);
    b(OAK, 0.2, len - 0.2, 0.45, 0.5, wd - 0.55, wd - 0.2); b(OAK, 0.15, 0.2, 0, 0.5, wd - 0.55, wd - 0.5); b(OAK, len - 0.2, len - 0.15, 0, 0.5, wd - 0.55, wd - 0.5);
    f.c(0, len, 0, wd, V, 1.7);
  };
  const desk = (V, axis, k0, d0, len) => {                                                // sample table: bags of grain, a balance, the ledger
    const f = table(V, axis, k0, d0, len, 0.8), b = (m, ...r) => f.b(m, ...r, V);
    for (let i = 0; i < 4; i++) { b('hide_brown', 0.15 + i * 0.28, 0.35 + i * 0.28, 0.77, 0.9 - (i % 2) * 0.03, 0.12, 0.3); b(OAK, 0.17 + i * 0.28, 0.33 + i * 0.28, 0.9 - (i % 2) * 0.03, 0.915 - (i % 2) * 0.03, 0.14, 0.28); }
    b('plaster_white', len - 0.55, len - 0.15, 0.77, 0.785, 0.2, 0.62); b('hide_brown', len - 0.57, len - 0.55, 0.77, 0.8, 0.2, 0.62);
    b(IR, 0.5, 0.52, 0.77, 1.1, 0.55, 0.57); b(IR, 0.32, 0.7, 1.1, 1.115, 0.55, 0.57);
  };
  // ----- each floor's two rooms by the trade
  const bedCov = (k, e) => ['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_maroon'][Math.floor(hash(k, e) * 4)];
  const FC0 = dP, FC1 = dF - LIN, BC0 = dB + LIN, BC1 = dP - PT, wfree = w - 3.25;
  const doorK = w / 2 - 0.49;                                                           // the free door's distance from the far wall
  const bk = Math.min(bedL, doorK - 0.55);
  const roomPlans = (m) => {
    const V = fl(m), top2 = m >= n - 1;
    const fc = [], bc = [];
    const bedFC = () => bed(V, 'u', FC0, bk, bedCov(m, 1)), bed2FC = () => { bed(V, 'd', FC0 + 1.25, 1.9, bedCov(m, 2)); };
    const bedBC = () => bed(V, 'u', BC0, bk, bedCov(m, 3)), bed2BC = () => bed(V, 'd', BC0 + 1.25, 1.9, bedCov(m, 4));
    const parlour = () => {
      table(V, 'u', 0.45, FC1 - 1.15, 1.15, 0.75, 'cloth_maroon'); chair(V, 'd', 0.1, FC1 - 0.95, 'd+'); chair(V, 'd', 1.75 > wfree ? wfree - 0.45 : 1.75, FC1 - 0.95, 'd-');
      painting(V, 0, FC0 + 1.8, 1.7, 0.6, 0.75); painting(V, 0, FC0 + 0.6, 1.55, 0.5, 0.6);
      chest(V, 'd', 0, FC0 + 1.3, 0.95, 0.5);
    };
    const lumber = (side) => { const d0 = side === 'fc' ? FC0 + 0.1 : BC0 + 0.1; crate(V, 'd', 0, d0, 0.9, 0.7, 0.55); crate(V, 'd', 0, d0 + 0.95, 0.7, 0.6, 0.45); barrel(V, 'u', 0, d0 + 1.7); chest(V, 'u', 0.1, d0 + 2.4, 0.9, 0.5); };
    const linen = (side) => { const d0 = side === 'fc' ? FC0 + 0.1 : BC0 + 0.1; kast(V, 'd', 0, d0, 1.35, 0.6); kast(V, 'd', 0, d0 + 1.45, 1.35, 0.6); table(V, 'u', 0.9, (side === 'fc' ? FC1 : BC1) - 1.3, 1.2, 0.7); };
    switch (trade) {
      case 'merchant':
        if (m === 1) { bedFC(); parlour(); bedBC(); kast(V, 'd', 0, BC0 + 1.4, 1.35, 0.6); chest(V, 'u', 0.1, BC0 + 3.0, 0.9, 0.5); }
        else if (m === 2) { bedFC(); if (FC1 - FC0 > 3.6) bed2FC(); chest(V, 'u', 0.1, FC1 - 0.6, 0.9, 0.5); bedBC(); chest(V, 'd', 0, BC0 + 1.4, 0.9, 0.5); }
        else if (top2 && m === n - 1) { linen('fc'); lumber('bc'); }
        else { linen('fc'); bedBC(); chest(V, 'd', 0, BC0 + 1.4, 0.9, 0.5); }
        break;
      case 'inn':
        bedFC(); if (FC1 - FC0 > 3.6) bed2FC(); table(V, 'u', 0.4, FC1 - 1.0, 1.0, 0.6); chair(V, 'd', 1.55 > wfree ? wfree - 0.5 : 1.55, FC1 - 0.8, 'd-');
        bedBC(); bed2BC(); chest(V, 'd', 0, BC0 + 3.3, 0.9, 0.5);
        break;
      case 'craftsman':
        if (m === 1) { bedFC(); chest(V, 'd', 0, FC0 + 1.3, 0.95, 0.5); table(V, 'u', 0.5, FC1 - 1.1, 1.0, 0.7); bedBC(); bed2BC(); }
        else if (m === 2) { const b = bench(V, 'd', 0, FC0 + 0.15, 2.0); loom(V, 'd', 0.0, FC0 + 2.3); shelves(V, 'd', 0, BC0 + 0.1, 2.0, ['glaze_blue', 'hide_tan', 'paint_ochre', 'glaze_white']); crate(V, 'd', 0, BC0 + 2.3, 0.9, 0.7, 0.55); sacks(V, 'u', 0.1, BC1 - 0.8, 1.8, 2); void b; }
        else { linen('fc'); lumber('bc'); }
        break;
      case 'lodgers':
        if (m === 1) { bedFC(); table(V, 'u', 0.45, FC1 - 1.1, 1.0, 0.7); chair(V, 'd', 0.1, FC1 - 0.95, 'd+'); bedBC(); chest(V, 'd', 0, BC0 + 1.4, 0.9, 0.5); }
        else if (m === 2) { bedFC(); chest(V, 'd', 0, FC0 + 1.3, 0.95, 0.5); bedBC(); bed2BC(); }
        else { bedFC(); table(V, 'u', 0.45, FC1 - 1.1, 1.0, 0.7); lumber('bc'); }
        break;
      case 'counting':
        if (m === 1) { desk(V, 'u', 0.2, FC1 - 1.2, 1.9); kast(V, 'd', 0, FC0 + 0.15, 1.35, 0.6); shelves(V, 'd', 0, FC0 + 1.8, 1.6, ['hide_brown', 'cloth_black', 'hide_tan']); bedBC(); chest(V, 'd', 0, BC0 + 1.4, 0.95, 0.5); }
        else if (m === 2) { bedFC(); parlour(); bedBC(); kast(V, 'd', 0, BC0 + 1.4, 1.35, 0.6); }
        else { linen('fc'); lumber('bc'); }
        break;
      default: {                                                                          // the warehouse: floors of goods
        const g = (V2, k0, d0, kind, len) => (kind === 0 ? sacks(V2, 'u', k0, d0, len, 3) : kind === 1 ? bales(V2, 'u', k0, d0, len, 2, ['paint_ochre', 'linen', 'cloth_grey', 'cloth_brown'][Math.floor(hash(d0 * 10 | 0, m) * 4)]) : barrel(V2, 'u', k0, d0));
        for (let d = dB + 0.4; d < dF - 2.0; d += 1.25) { const kd = hash(Math.round(d * 10), m); g(V, 0.05, d, kd < 0.4 ? 0 : kd < 0.75 ? 1 : 2, Math.min(2.0, Math.floor((w - 0.5) / 2 - 0.9 - 0.1))); if (kd > 0.75) barrel(V, 'u', 0.85, d); }
      }
    }
    void fc; void bc; void BC1; void FC1;
  };
  for (let m = 1; m < n; m++) roomPlans(m);
  void C; void Lf; void rod;
}

// ---------------------------------------------------------------------------------------------------------------------
// The attic and the loft

function attic(bag, col, F, y, o, T0, fls, rand) {
  const { A, C, FL, P3, fl, rectOf, left, ramp } = T0, { w, Dm, H, p, gable: G, seed } = o;
  if (!G) return;
  const uc = w / 2, rh = G.rh, gh = G.gh;
  // the boarded slopes of the roof, lining the shell from inside, and the gables' walls to keep one in
  for (const s of [-1, 1]) {
    const uE = s < 0 ? 0.32 : w - 0.32, vR = rh - 0.15, dF0 = -0.46, dB0 = -Dm + 0.46;
    bag.add(TB, slab4([P3(uE, H, dF0), P3(uc, H + vR, dF0), P3(uc, H + vR, dB0), P3(uE, H, dB0)], 0.08));
  }
  C(0, w, -0.45, 0, H, H + gh); C(0, w, -Dm, -Dm + 0.45, H, H + gh);
  // the roof's trusses: tie beams across the attic every 2.3 m, and a collar high up
  const roofHw = (v) => (w / 2 - 0.2) - (w / 2 - 0.45) * Math.min(1, v / rh);
  for (let d = -1.4; d > -Dm + 0.5; d -= 2.3) {
    const hw = roofHw(2.45);
    A('timber', uc - roofHw(2.6) - 0.05, uc + roofHw(2.6) + 0.05, H + 2.45, H + 2.6, d - 0.1, d + 0.1);
    void hw;
  }
  // ---- the loft (kapzolder) under the gable, at the hatch's sill, and the ladder up to it
  const hatch = G.hatch;
  if (!p.warehouse && hatch) {
    const hv = hatch.v0 - 0.6, uc2 = (hatch.u0 + hatch.u1) / 2, LD = 1.9, cw = Math.max(0.9, roofHw(hv - H) - 0.2), d1 = -0.45, d0 = -0.45 - LD;       // (the deck lies 0.6 under the hatch's sill)
    // the deck on two beams across, and the ladder's opening in its back edge (1.3 wide)
    for (const d of [d1 - 0.3, d0 + 0.3]) A('timber', uc2 - roofHw(hv - H - 0.2) - 0.05, uc2 + roofHw(hv - H - 0.2) + 0.05, hv - 0.32, hv - 0.14, d - 0.1, d + 0.1);
    A(TB, uc2 - cw, uc2 + cw, hv - 0.14, hv, d0, d1); FL(uc2 - cw, uc2 + cw, d0, d1, hv);
    const rv = 0.65, lad = [uc2 - rv, uc2 + rv];
    for (const [a, b] of [[uc2 - cw, lad[0]], [lad[1], uc2 + cw]]) { if (b - a < 0.08) continue; A(OAK, a, b, hv + 0.92, hv + 0.98, d0 - 0.03, d0 + 0.03); C(a, b, d0 - 0.04, d0 + 0.04, hv, hv + 1.05); for (const u of [a + 0.03, b - 0.03]) A(OAK, u - 0.025, u + 0.025, hv, hv + 0.95, d0 - 0.03, d0 + 0.03); }
    for (const u of lad) A(OAK, u - 0.025, u + 0.025, hv, hv + 0.95, d0 - 0.03, d0 + 0.03);
    // the ladder: two stiles from the attic floor to the deck's edge, rungs every 0.3
    const vb = fl(p.n), dLow = d0 - 1.0, sl = [P3(lad[0] + 0.05, vb, dLow), P3(lad[0] + 0.05, hv + 0.02, d0 + 0.08)], sr = [P3(lad[1] - 0.05, vb, dLow), P3(lad[1] - 0.05, hv + 0.02, d0 + 0.08)];
    for (const u of [lad[0] + 0.05, lad[1] - 0.05]) bag.add(OAK, sideprism(F, y, [[dLow, vb], [d0 + 0.08, hv + 0.02], [d0 + 0.13, hv + 0.02], [dLow + 0.05, vb]], u - 0.03, u + 0.03));
    const nr = Math.round((hv - vb) / 0.3);
    for (let i = 1; i < nr; i++) { const t = i / nr, dd = dLow + (d0 + 0.08 - dLow) * t, vv = vb + (hv + 0.02 - vb) * t; A(OAK, lad[0] + 0.05, lad[1] - 0.05, vv - 0.02, vv + 0.02, dd - 0.03, dd + 0.03); }
    ramp(lad[0] + 0.05, lad[1] - 0.05, dLow, d0, vb, hv);
    // the guard beside the ladder, along its sides (up to the deck)
    for (const u of lad) C(u - 0.04, u + 0.04, dLow, d0, vb, hv + 1.05);
    // the hatch: the iron bar across it at the waist and, hooked to the hoisting beam's rope, a bale on the deck by it
    A(IR, hatch.u0 - 0.05, hatch.u1 + 0.05, hv + 1.0, hv + 1.05, -0.42, -0.36); C(hatch.u0, hatch.u1, -0.46, 0.0, hv, hv + 1.1);
    for (const u of [hatch.u0 - 0.03, hatch.u1 + 0.03]) A(IR, u - 0.025, u + 0.025, hv, hv + 1.05, -0.44, -0.36);
    const bu = hatch.u0 - 0.1 - 0.35 > uc2 - cw + 0.2 ? hatch.u0 - 0.5 : uc2 + cw - 0.5;
    A('paint_ochre', bu - 0.4, bu + 0.4, hv, hv + 0.55, -1.2, -0.6); for (const q of [-0.18, 0.18]) A('hide_brown', bu + q - 0.012, bu + q + 0.012, hv - 0.002, hv + 0.552, -1.205, -0.595);
    C(bu - 0.4, bu + 0.4, -1.2, -0.6, hv, hv + 0.55);
  } else if (hatch) {                                                                  // the warehouse's gable hatch: low in the gable, its sill a step above the floor
    A(IR, hatch.u0 - 0.05, hatch.u1 + 0.05, hatch.v0 + 0.85, hatch.v0 + 0.9, -0.42, -0.36); C(hatch.u0, hatch.u1, -0.46, 0.0, hatch.v0, hatch.v0 + 1.1);
    A(OAK, hatch.u0 - 0.05, hatch.u1 + 0.05, H + 0.04, hatch.v0, -0.9, -0.45); C(hatch.u0 - 0.05, hatch.u1 + 0.05, -0.9, -0.45, H + 0.04, hatch.v0); FL(hatch.u0 - 0.05, hatch.u1 + 0.05, -0.9, -0.45, hatch.v0);
  }
  // the gable's attic window: a bar across it too
  if (G.win) { const wi = G.win; A(IR, wi.u0, wi.u1, wi.v0 + 0.85, wi.v0 + 0.9, -0.42, -0.36); C(wi.u0, wi.u1, -0.46, 0.0, H, wi.v1); }
  // ---- what is stored: goods on the far side, clear of the stair's strip and of the ladder
  const fw = left ? w - P - LIN : P + LIN, fs = left ? -1 : 1, FU = (k) => fw + fs * k, V = fl(p.n);
  const fr = (k0, d0) => ({ b: (m, x0, x1, v0, v1, y0, y1) => A(m, FU(k0 + x0), FU(k0 + x1), V + v0, V + v1, d0 + y0, d0 + y1), c: (x0, x1, y0, y1, h) => C(FU(k0 + x0), FU(k0 + x1), d0 + y0, d0 + y1, V, V + h) });
  const dLoftBack = -0.45 - 1.9 - 1.1;
  const trade = p.trade, hsh = (i) => rng(seed * 53 + i * 17)();
  const slots = [];
  for (let d = -Dm + 0.7; d < dLoftBack - 0.8; d += 1.2) slots.push(d);
  slots.forEach((d, i) => {
    const kd = hsh(i), kind = trade === 'store' ? (kd < 0.5 ? 0 : kd < 0.8 ? 1 : 2) : (kd < 0.3 ? 0 : kd < 0.5 ? 3 : kd < 0.7 ? 2 : 4);
    const k0 = 0.75, f = fr(k0, d);
    if (kind === 0) { const nn = 3; for (let t = 0; t < 2; t++) for (let j = 0; j < nn - t; j++) { const x0 = j * 0.62 + t * 0.31; f.b('hide_brown', x0 + 0.02, x0 + 0.6, t * 0.32, t * 0.32 + 0.32, 0.03, 0.55); f.b('hide_brown', x0 + 0.29, x0 + 0.32, t * 0.32 + 0.14, t * 0.32 + 0.3, 0.52, 0.56); } f.c(0, 1.9, 0, 0.58, 0.66); }
    else if (kind === 1) { for (let j = 0; j < 2; j++) { f.b(['paint_ochre', 'plaster_white'][j], j * 0.92 + 0.02, j * 0.92 + 0.9, 0, 0.55, 0.04, 0.66); for (const q of [0.25, 0.75]) f.b('hide_brown', j * 0.92 + q * 0.88, j * 0.92 + q * 0.88 + 0.025, -0.002, 0.555, 0.035, 0.665); } f.c(0, 1.85, 0, 0.7, 0.55); }
    else if (kind === 2) { for (let j = 0; j < 2; j++) { const c = 0.3 + j * 0.65; for (const [t0, t1, q] of [[0, 0.28, 0.27], [0.28, 0.56, 0.31], [0.56, 0.84, 0.27]]) f.b(TB, c - q, c + q, t0, t1, 0.35 - q, 0.35 + q); f.b(IR, c - 0.28, c + 0.28, 0.1, 0.13, 0.07, 0.63); } f.c(0, 1.3, 0, 0.7, 0.86); }
    else if (kind === 3) { for (let t = 0; t < 4; t++) f.b('bark_dark', 0, 1.8 - t * 0.1, t * 0.2, t * 0.2 + 0.2, 0, 0.5); f.c(0, 1.8, 0, 0.5, 0.8); }
    else { f.b(TB, 0, 0.9, 0, 0.5, 0, 0.7); f.b(OAK, -0.01, 0.91, 0.5, 0.58, -0.01, 0.71); f.c(0, 0.9, 0, 0.7, 0.58); }
  });
  void rectOf; void rand; void fls; void rod;
}

// ---------------------------------------------------------------------------------------------------------------------
// The way up, for the walk check (docs §5.20): from the street, through the door and up the flights to the first floor's back
// chamber, and on up to the attic and the loft. Waypoints in the settlement's plane [x, z].

/** { first: [[x, z]…], top: [[x, z]…] } for an open house with its upper floors (null if it has none). */
export function routes(el) {
  const p = profile(el);
  if (!p.ok) return null;
  const f = el.front ?? 's', F = faceFrame(el.rect, f), { w, Dm, n, left, warehouse, dP } = p, bays = p.bays, bw = w / bays;
  const du = warehouse ? w / 2 : ((left ? 0 : bays - 1) + 0.5) * bw, sU = (k) => (left ? P + k : w - P - k), dB = -Dm + T;
  const mid = (q) => (sU(q[0]) + sU(q[1])) / 2, uS = (s) => mid(s === 'a' ? SA : SB), at = (u, d) => F.at(u, d), fls = flights(p), dq = dP - PT;
  const first = [at(du, 4.0), at(du, -1.0)], top = [];
  if (warehouse) {
    const f0 = fls[0], sg = left ? 1 : -1; void sg;
    first.push(at(du + 0.78, -1.0), at(du + 0.78, f0.dBot + 1.4), at(uS(f0.strip), f0.dBot + 1.0), at(uS(f0.strip), f0.dBot), at(uS(f0.strip), f0.dTop - 0.35));
  } else {
    const f0 = fls[0];
    first.push(at(uS('a'), dP + 3.5), at(uS('a'), f0.dBot), at(uS('a'), f0.dTop - 0.35), at(uS('a'), dq - 0.5), at(w / 2, dq - 0.55), at(w / 2, dq - 2.6));
  }
  top.push(...(warehouse ? first.slice(0, 5) : first.slice(0, 5)).map((q) => q));
  for (let k = warehouse ? 0 : 1; k < n; k++) {
    const g = fls[k], up = Math.sign(g.dTop - g.dBot), u = uS(g.strip);
    if (k >= (warehouse ? 1 : 1)) top.push(at(u, g.dBot - up * 0.25));
    top.push(at(u, g.dBot), at(u, g.dTop + up * 0.45));
    const nx = fls[k + 1];
    if (nx) top.push(at(uS(nx.strip), g.dTop + up * 0.45));
  }
  const last = fls[n - 1];
  const gl = Math.sign(last.dTop - last.dBot);
  top.push(at(w / 2, last.dTop + gl * 0.6));                                                          // off the stair's end sideways, clear of the trap
  if (!warehouse) top.push(at(w / 2, -5.2), at(w / 2, -3.75), at(w / 2, -1.7));                       // across the attic, up the ladder to the loft's deck
  else top.push(at(w / 2, -2.5));
  return { first, top, last, F, p };
}
