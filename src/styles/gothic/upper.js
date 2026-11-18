// The upper storeys of an open Paris house about 1250 (docs/settlements/paris.md §5e): walls with open window reveals,
// floors on joists with the stairwell cut in them, a straight stair of steep treads in two bays that reverses at each
// floor, a ladder to the attic, the gallery over the street, and the rooms furnished by the house's use. Everything is
// in the house's own frame (u along the front, d into the house from the front); `a` is the distance from the stair-side
// wall, so that the same recipe serves a house built either way round. Built only in the near form of an open house.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, rod, lathe } from '../../core/geom.js';

// Only the materials the court's plans already carry (a new material is a new mesh in every tile), and each
// material's pieces of one house merged into one geometry (so that no box repeats often enough to be an instance).
const ALLOW = new Set(['wood_dark', 'timber', 'lime_plaster', 'limestone', 'iron', 'ivory', 'linen', 'cloth_red', 'cloth_white', 'sacking', 'tile_dark', 'paint_ochre', 'opening']);
const SUB = { cloth_indigo: 'cloth_white', cloth_ochre: 'paint_ochre', cloth_green: 'cloth_red', cloth_brown: 'wood_dark', cloth_blue: 'cloth_white', hide_brown: 'wood_dark', hide_tan: 'wood_dark', hide_white: 'cloth_white', silver: 'iron', gold: 'paint_ochre', rope_fibre: 'sacking', wood_ochre: 'timber', pottery_dark: 'iron', terracotta: 'paint_ochre' };
const matOf = (m) => (ALLOW.has(m) ? m : SUB[m] ?? 'timber');
function mergeGeoms(list) {
  const pos = [], nor = [];
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3)); m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return m;
}

export const WT = 0.22, FLR = 0.03;           // an upper wall's thickness; a floor's top over its storey's base
export const WIN = { ww: 0.95, hw: 1.2, y0: 0.78 };
export const CORE = 2.65, LANE = 0.7;
const BAY = [[0.42, 1.38], [1.5, 2.46]], G1 = 0.22, G2 = 0.222;       // the stair's two bays, the width kept for it (a), the treads' depth

/** A number in [0, 1) from a position: the variation of repeated pieces (never a counter or a shared stream). */
const hash = (a, b, c = 0) => { let h = (Math.imul(Math.round(a * 100) + 7919, 2654435761) ^ Math.imul(Math.round(b * 100) + 104729, 2246822519) ^ Math.imul((c | 0) + 17, 3266489917)) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return (h >>> 8) / 16777216; };
const CLOTH = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_blue'];

/** The plan of a house's upper floors: stair side, flights, holes, gallery. a: { el, L, D, n, doorL, ST0, ST, FL, chim, jet, kind, trade }. */
export function planUpper(a) {
  const { L, D, n, doorL, ST0, ST, FL, chim, jet, kind } = a;
  const side = doorL ? 'lo' : 'hi', S = (x) => (side === 'lo' ? x : L - x);
  const fy = (k) => ST0 + (k - 1) * ST + FLR;
  const nw = Math.max(1, Math.floor((L - 0.4) / 2.0)), sp = L / nw;
  let gal = null;
  if ((kind === 'merchant' || kind === 'inn') && n >= 3) {
    let kk = 0, best = 1e9;
    for (let i = 0; i < nw; i++) { const dd = Math.abs((i + 0.5) * sp - L * 0.5); if (dd < best) { best = dd; kk = i; } }
    const uc = (kk + 0.5) * sp;
    gal = { k: kk, uc, u0: Math.max(0.4, uc - 1.25), u1: Math.min(L - 0.4, uc + 1.25), out: 1.05 };
  }
  const dBack = D - 0.9, flights = [];
  for (let k = 1; k < n; k++) {
    const first = k === 1, yLow = first ? FL : fy(k - 1), yHigh = fy(k), rise = yHigh - yLow, nr = Math.round(rise / 0.2), g = first ? G1 : G2;
    const run = (nr - 1) * g, up = first || k % 2 === 1 ? 1 : -1, bay = BAY[k % 2 === 1 ? 0 : 1];
    const from = up > 0 ? dBack - run : dBack, to = up > 0 ? dBack : dBack - run;
    // the stairwell in the floor above: from where the head clears the joists (1.9 m over the tread) to the flight's end
    const gap = (first ? ST0 - 0.14 - FL : ST - 0.14 - FLR) - 1.9, hx = Math.max(0, gap / rise * run) + 0.2;
    const h0 = from + up * hx;
    flights.push({ k, a0: bay[0], a1: bay[1], from, to, up, nr, g, yLow, yHigh, hole: { a0: WT, a1: k % 2 === 1 ? 1.46 : 2.58, d0: Math.min(h0, to), d1: Math.max(h0, to) } });
  }
  const chimSide = chim ? (chim.u < L / 2 ? 'lo' : 'hi') : null;
  const ladder = { u0: L / 2 - 0.6, u1: L / 2 + 0.6, d0: 2.4, d1: 3.35 };
  return { ...a, side, S, fy, nw, sp, gal, flights, dBack, chimSide, ladder, hearth: chim && chimSide !== side };
}

/** The window of the front wall at index i: its centre u. */
export const windowU = (U, i) => (i + 0.5) * U.sp;

export function buildUpper(U, { bag: realBag, col, map, y, roof, solid }) {
  const acc = new Map();
  const bag = { add: (m, g) => { m = matOf(m); if (!acc.has(m)) acc.set(m, []); acc.get(m).push(g); } };
  const { L, D, n, side, S, fy, jet, ST0, ST, FL, kind, trade, seed, flights, gal, nw, sp, chim, ladder } = U;
  const yb = (k) => ST0 + (k - 1) * ST;
  const Bx = (m, u0, u1, y0, y1, d0, d1) => { const a = map(u0, d0), b = map(u1, d1); bag.add(m, box(Math.min(a[0], b[0]), y + y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + y1, Math.max(a[1], b[1]))); };
  const Cr = (u0, u1, y0, y1, d0, d1) => { const a = map(u0, d0), b = map(u1, d1); col.rect([a[0], a[1], b[0], b[1]], y + y0, y + y1); };
  const Fl = (u0, u1, yy, d0, d1) => { const a = map(u0, d0), b = map(u1, d1); col.floor([a[0], a[1], b[0], b[1]], y + yy); };
  const Rd = (m, [u0, y0, d0], [u1, y1, d1], r, seg = 4) => { const a = map(u0, d0), b = map(u1, d1); bag.add(m, rod([a[0], y + y0, a[1]], [b[0], y + y1, b[1]], r, seg)); };
  const Lv = (m, prof, u, yy, d, seg = 8) => { const a = map(u, d); bag.add(m, lathe(prof, seg, null, a[0], y + yy, a[1])); };
  const dirOf = (du, dd) => { const a = map(0, 0), b = map(du, dd), dx = b[0] - a[0], dz = b[1] - a[1]; return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n'); };
  const ramp = (u0, u1, d0, d1, yLo, yHi, du, dd) => { const a = map(u0, d0), b = map(u1, d1); col.ramp([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + yLo, y + yHi, dirOf(du, dd)); };

  // ── floors k = 1…n (n: the attic's), each cut by the stairwell that rises through it (and the attic's by the ladder's)
  const holesOf = (k) => {
    const hs = [];
    const F = flights[k - 1];
    if (F) hs.push({ u0: Math.min(S(F.hole.a0), S(F.hole.a1)), u1: Math.max(S(F.hole.a0), S(F.hole.a1)), d0: F.hole.d0, d1: F.hole.d1 });
    if (k === n) hs.push({ u0: ladder.u0 - 0.1, u1: ladder.u1 + 0.1, d0: ladder.d0 + 0.35, d1: ladder.d1 });
    return hs;
  };
  const cut = (r, hs) => {
    let out = [r];
    for (const h of hs) {
      const nx = [];
      for (const q of out) {
        const [u0, u1, d0, d1] = q;
        if (h.u1 <= u0 || h.u0 >= u1 || h.d1 <= d0 || h.d0 >= u1 + 100 || h.d0 >= d1) { nx.push(q); continue; }
        if (h.u0 > u0) nx.push([u0, h.u0, d0, d1]);
        if (h.u1 < u1) nx.push([h.u1, u1, d0, d1]);
        const m0 = Math.max(u0, h.u0), m1 = Math.min(u1, h.u1);
        if (h.d0 > d0) nx.push([m0, m1, d0, h.d0]);
        if (h.d1 < d1) nx.push([m0, m1, h.d1, d1]);
      }
      out = nx;
    }
    return out;
  };
  for (let k = 1; k <= n; k++) {
    const b0 = yb(k), jf = jet(Math.min(k, n - 1)), hs = holesOf(k), top = b0 + FLR;
    for (const [u0, u1, d0, d1] of cut([0, L, -jf + (k === n ? 0.02 : 0), D], hs)) {
      if (u1 - u0 < 0.02 || d1 - d0 < 0.02) continue;
      Bx('timber', u0, u1, b0 - 0.14, top, d0, d1);
      Fl(u0 + 0.0, u1, top, d0, d1);
    }
    // the joists under it (the ground room's beams carry the first floor), clipped where the stairwell is
    if (k > 1) for (let d = -jf + 0.5; d < D - 0.3; d += 1.35) {
      let segs = [[0.0, L]];
      for (const h of hs) if (d > h.d0 - 0.1 && d < h.d1 + 0.1) segs = segs.flatMap(([s0, s1]) => (h.u1 <= s0 || h.u0 >= s1 ? [[s0, s1]] : [[s0, Math.max(s0, h.u0)], [Math.min(s1, h.u1), s1]])).filter(([s0, s1]) => s1 - s0 > 0.1);
      for (const [s0, s1] of segs) Bx('timber', s0, s1, b0 - 0.3, b0 - 0.14, d - 0.07, d + 0.07);
    }
  }

  // ── the walls of storeys 1…n-1: the front with its openings, the flanks, the back
  for (let k = 1; k < n; k++) {
    const b0 = yb(k), jf = jet(k), top = b0 + ST, ops = [];
    for (let i = 0; i < nw; i++) {
      const uc = (i + 0.5) * sp;
      ops.push(gal && k === 1 && i === gal.k ? { uc, u0: uc - 0.5, u1: uc + 0.5, y0: FLR, y1: 2.1, door: true } : { uc, u0: uc - WIN.ww / 2, u1: uc + WIN.ww / 2, y0: WIN.y0, y1: WIN.y0 + WIN.hw });
    }
    const fw = (u0, u1, ya, yc) => { if (u1 - u0 < 0.01 || yc - ya < 0.01) return; Bx('lime_plaster', u0, u1, b0 + ya, b0 + yc, -jf, -jf + WT); Cr(u0, u1, b0 + ya, b0 + yc, -jf, -jf + WT); };
    let u = 0;
    for (const o of ops) {
      fw(u, o.u0, 0, ST);
      if (o.y0 > FLR + 0.01) fw(o.u0, o.u1, 0, o.y0);
      fw(o.u0, o.u1, o.y1, ST);
      u = o.u1;
      // the frame in the reveal: head, sill (a seat inside), jambs, and the trim round it on the outside
      if (!o.door) {
        const ya = o.y0, yh = o.y1, t = 0.04;
        Bx('timber', o.u0, o.u1, b0 + yh - t, b0 + yh, -jf - 0.05, -jf + WT + 0.03);
        Bx('timber', o.u0 - 0.02, o.u1 + 0.02, b0 + ya - 0.1, b0 + ya + 0.02, -jf - 0.05, -jf + WT + 0.16);
        for (const [a0, a1] of [[o.u0, o.u0 + t], [o.u1 - t, o.u1]]) Bx('timber', a0, a1, b0 + ya + 0.02, b0 + yh - t, -jf - 0.05, -jf + WT + 0.03);
        Bx('timber', o.u0 - 0.1, o.u1 + 0.1, b0 + yh, b0 + yh + 0.1, -jf - 0.04, -jf);
        for (const [a0, a1] of [[o.u0 - 0.1, o.u0], [o.u1, o.u1 + 0.1]]) Bx('timber', a0, a1, b0 + ya - 0.02, b0 + yh, -jf - 0.04, -jf);
      } else {
        const t = 0.05;
        Bx('timber', o.u0, o.u1, b0 + o.y1 - t, b0 + o.y1, -jf - 0.05, -jf + WT + 0.03);
        for (const [a0, a1] of [[o.u0, o.u0 + t], [o.u1 - t, o.u1]]) Bx('timber', a0, a1, b0 + FLR, b0 + o.y1 - t, -jf - 0.05, -jf + WT + 0.03);
        // the door's leaves folded back against the reveals
        for (const [a0, a1] of [[o.u0 + t, o.u0 + t + 0.04], [o.u1 - t - 0.04, o.u1 - t]]) Bx('wood_dark', a0, a1, b0 + FLR, b0 + o.y1 - t, -jf + 0.03, -jf + 0.5);
      }
    }
    fw(u, L, 0, ST);
    for (const [u0, u1] of [[0, WT], [L - WT, L]]) { Bx('lime_plaster', u0, u1, b0, top, -jf + WT, D); Cr(u0, u1, b0, top, -jf + WT, D); }
    Bx('lime_plaster', WT, L - WT, b0, top, D - WT, D); Cr(WT, L - WT, b0, top, D - WT, D);
  }

  // ── the stair: treads and risers on two stringers, the ramp under them, the rail round the opening above
  for (const F of flights) {
    const { a0, a1, from, up, nr, g, yLow, yHigh } = F, r = (yHigh - yLow) / nr, lo = Math.min(S(a0), S(a1)), hi = Math.max(S(a0), S(a1));
    for (let i = 0; i < nr - 1; i++) {
      const d0 = from + up * i * g, d1 = d0 + up * g, top = yLow + (i + 1) * r;
      Bx('timber', lo, hi, top - 0.05, top, Math.min(d0, d1) - (up > 0 ? 0.03 : 0), Math.max(d0, d1) + (up < 0 ? 0.03 : 0));
      Bx('wood_dark', lo, hi, top - r, top - 0.05, Math.min(d0, d0 + up * 0.03), Math.max(d0, d0 + up * 0.03));
    }
    for (const a of [a0 - 0.04, a1 + 0.04]) Rd('wood_dark', [S(a), yLow + 0.05, from], [S(a), yHigh - r * 0.6, from + up * (nr - 1) * g], 0.05, 5);
    // the flight's top meets the floor (the last riser)
    Bx('wood_dark', lo, hi, yHigh - r, yHigh - 0.05, from + up * (nr - 1) * g - (up > 0 ? 0 : 0.03), from + up * (nr - 1) * g + (up > 0 ? 0.03 : 0));
    const rr = r * 0.5, dEnd = from + up * (nr - 1) * g;
    ramp(lo, hi, Math.min(from, dEnd), Math.max(from, dEnd), yLow + rr, yHigh - rr, 0, up);
    // the rail along the hole's long edges, from its start to 0.3 m short of the flight's end; newel posts
    const h = F.hole, ya = yHigh, d0 = h.d0, d1 = h.d1 - (up > 0 ? 0.3 : 0), d2 = h.d0 + (up < 0 ? 0.3 : 0);
    const dA = up > 0 ? d0 : d2, dB = up > 0 ? d1 : h.d1;
    for (const a of [h.a1]) {
      const u = S(a), ua = u + (S(1) < S(0) ? 0.03 : -0.03);
      Bx('timber', ua - 0.05, ua + 0.05, ya, ya + 1.06, dA - 0.05, dA + 0.05); Bx('timber', ua - 0.05, ua + 0.05, ya, ya + 1.06, dB - 0.05, dB + 0.05);
      Bx('timber', ua - 0.03, ua + 0.03, ya + 1.0, ya + 1.06, dA, dB);
      for (let d = dA + 0.2; d < dB - 0.1; d += 0.22) Rd('wood_dark', [ua, ya, d], [ua, ya + 1.0, d], 0.013, 4);
      Cr(ua - 0.03, ua + 0.03, ya, ya + 1.06, dA, dB);
    }
    // the far end of the hole: a rail across, on the side the flight comes from
    { const dC = up > 0 ? h.d0 : h.d1, u0 = Math.min(S(h.a0), S(h.a1)), u1 = Math.max(S(h.a0), S(h.a1));
      Bx('timber', u0, u1, ya + 1.0, ya + 1.06, dC - 0.03, dC + 0.03);
      for (let u = u0 + 0.12; u < u1 - 0.05; u += 0.22) Rd('wood_dark', [u, ya, dC], [u, ya + 1.0, dC], 0.013, 4);
      Cr(u0, u1, ya, ya + 1.06, dC - 0.03, dC + 0.03); }
  }

  // ── the ladder to the attic: two poles, rungs, a ramp 0.5 m under the rung plane, the opening above clear
  { const top = n - 1, y0 = fy(top), y1 = fy(n), d0 = ladder.d0, d1 = ladder.d1, up = 1, slope = (y1 - y0) / (d1 - d0);
    const uA = ladder.u0 + 0.1, uB = ladder.u1 - 0.1, ext = 1.0;
    for (const u of [uA, uB]) Rd('wood_dark', [u, y0, d0], [u, y1 + ext, d1 + ext / slope], 0.04, 5);
    for (let t = 0.3; t < y1 - y0 + ext - 0.1; t += 0.3) { const d = d0 + t / slope; Rd('timber', [uA, y0 + t, d], [uB, y0 + t, d], 0.02, 4); }
    ramp(ladder.u0, ladder.u1, d0, d1, y0 - 0.5, y1, 0, up);
  }

  // ── the gallery over the street at the first floor: a floor on corbels, a rail, steppable from its door
  if (gal) {
    const b0 = yb(1), jf = jet(1), o = gal.out, dOut = -jf - 0.07 - o, u0 = gal.u0, u1 = gal.u1, top = b0 + FLR, ya = top;
    Bx('timber', u0, u1, b0 - 0.14, top, dOut, -jf - 0.07);
    Fl(u0, u1, top, dOut, -jf);
    for (let u = u0 + 0.15; u < u1 - 0.05; u += (u1 - u0 - 0.3) / 3) Bx('wood_dark', u - 0.07, u + 0.07, b0 - 0.3, b0 - 0.14, dOut + 0.04, -jf);
    Bx('timber', u0, u1, b0 - 0.16, b0 - 0.14, dOut, dOut + 0.05);
    for (const u of [u0 + 0.05, u1 - 0.05]) Bx('timber', u - 0.05, u + 0.05, ya, ya + 1.08, dOut, dOut + 0.1);
    Bx('timber', u0, u1, ya + 1.0, ya + 1.08, dOut, dOut + 0.08);
    for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.22) Rd('wood_dark', [u, ya, dOut + 0.04], [u, ya + 1.0, dOut + 0.04], 0.013, 4);
    for (const u of [u0 + 0.05, u1 - 0.05]) { Bx('timber', u - 0.03, u + 0.03, ya + 1.0, ya + 1.08, dOut, -jf - 0.07); for (let d = dOut + 0.25; d < -jf - 0.2; d += 0.22) Rd('wood_dark', [u, ya, d], [u, ya + 1.0, d], 0.013, 4); }
    Cr(u0, u1, ya, ya + 1.08, dOut, dOut + 0.1);
    for (const u of [u0, u1 - 0.1]) Cr(u, u + 0.1, ya, ya + 1.08, dOut, -jf - 0.07);
  }

  // ── the attic under the roof: rafters, ridge board, collars, the back gable
  { const { ye, yr, p, jt, dF, dB } = roof, y0 = fy(n);
    const dl = -jt + 0.25, dh = D - 0.15;
    for (let d = dl + 0.3; d < dh; d += 1.1) for (const [ua, ub] of [[0, L / 2], [L, L / 2]]) Rd('timber', [ua, ye - 0.05, d], [ub, yr - 0.2, d], 0.045, 4);
    Bx('timber', L / 2 - 0.07, L / 2 + 0.07, yr - 0.3, yr - 0.12, dl, dh);
    for (let d = dl + 1.0; d < dh - 0.3; d += 2.2) { const uc = 1.7; if (L > 2 * uc + 0.4) Bx('timber', uc, L - uc, ye + 2.0 - 0.05 + 0.0, ye + 2.1, d - 0.05, d + 0.05); }
    // the back gable closing the attic, a plaster triangle in the plane of the back wall
    solid('lime_plaster', [[[0, ye, D - 0.18], [L, ye, D - 0.18], [L / 2, yr - 0.14, D - 0.18]], [[0, ye, D], [L / 2, yr - 0.14, D], [L, ye, D]], [[0, ye, D - 0.18], [L / 2, yr - 0.14, D - 0.18], [L / 2, yr - 0.14, D]], [[0, ye, D - 0.18], [L / 2, yr - 0.14, D], [0, ye, D]], [[L, ye, D - 0.18], [L, ye, D], [L / 2, yr - 0.14, D]], [[L, ye, D - 0.18], [L / 2, yr - 0.14, D], [L / 2, yr - 0.14, D - 0.18]]], [L / 2, ye + 1, D - 0.09]);
    Cr(0, L, y0, yr, D - 0.2, D); Cr(0, L, y0, yr, -jt, -jt + 0.2);
    void p; void dF; void dB; void y0;
  }
  // ── the rooms, by the house's use
  const hearthU = U.chimSide === 'lo' ? [WT, 0.95] : [L - 0.95, L - WT];
  for (let k = 1; k <= n; k++) {
    const attic = k === n, yF = fy(k), jf = jet(Math.min(k, n - 1));
    const aW = WT + 0.03, aFr = L - WT - 0.03, dK = D - WT - 0.03, dFt = -jf + WT + 0.06, occ = [];
    const A = (u) => (side === 'lo' ? u : L - u);
    const put = (a0, a1, d0, d1, m = 0.04) => {
      if (a0 < aW - 0.01 || a1 > aFr + 0.01 || d0 < dFt - 0.01 || d1 > dK + 0.01) return false;
      for (const q of occ) if (a0 < q[1] + m && a1 > q[0] - m && d0 < q[3] + m && d1 > q[2] - m) return false;
      occ.push([a0, a1, d0, d1]); return true;
    };
    if (!attic) {
      occ.push([0, CORE, 5.9, D + 1], [CORE, CORE + LANE, 5.9, D + 1]);          // the stair and the lane beside it
      // the ways from the lane to the gallery's door and the ladder
      for (const uc of [k === 1 && gal ? gal.uc : null, k === n - 1 ? L / 2 : null]) if (uc !== null) { const ua = A(uc - 0.5), ub = A(uc + 0.5); occ.push([Math.min(ua, ub), Math.max(ua, ub), -9, 5.95], [CORE, aFr + 1, 5.2, 5.9]); }
    }
    if (!attic && k === 1 && gal) { const ua = A(gal.u0), ub = A(gal.u1); occ.push([Math.min(ua, ub), Math.max(ua, ub), -9, dFt + 1.4]); }
    if (k === n - 1 || attic) { const ua = A(ladder.u0 - 0.2), ub = A(ladder.u1 + 0.2); occ.push([Math.min(ua, ub), Math.max(ua, ub), ladder.d0 - 0.9, ladder.d1 + 0.3]); }
    if (!attic && U.hearth) { const ua = A(hearthU[0]), ub = A(hearthU[1]), dd = chim.dd; occ.push([Math.min(ua, ub), Math.max(ua, ub), dd - 0.9, dd + 0.9]); }
    const Ba = (m, a0, a1, y0, y1, d0, d1) => Bx(m, S2(a0), S2(a1), yF + y0, yF + y1, d0, d1);
    const S2 = (a) => S(a);
    const Ca = (a0, a1, y0, y1, d0, d1) => Cr(S2(a0), S2(a1), yF + y0, yF + y1, d0, d1);
    const Ra = (m, [a0, y0, d0], [a1, y1, d1], r, seg = 4) => Rd(m, [S2(a0), yF + y0, d0], [S2(a1), yF + y1, d1], r, seg);
    const Va = (m, prof, a, yy, d, seg = 8) => Lv(m, prof, S2(a), yF + yy, d, seg);
    const circ = (a, d, r, h) => { const w = map(S2(a), d); col.circle(w[0], w[1], r, y + yF, y + yF + h); };
    // ── pieces
    const chest = (a0, d0, wa, wd, h = 0.5) => { const a1 = a0 + wa, d1 = d0 + wd; if (!put(a0, a1, d0, d1)) return false;
      Ba('wood_dark', a0, a1, 0, h - 0.06, d0, d1); Ba('timber', a0 - 0.015, a1 + 0.015, h - 0.06, h, d0 - 0.015, d1 + 0.015);
      for (const t of [0.2, 0.8]) Ba('iron', a0 + wa * t - 0.03, a0 + wa * t + 0.03, 0.02, h + 0.006, d0 - 0.02, d1 + 0.02);
      Ca(a0, a1, 0, h + 0.08, d0, d1); return true; };
    const table = (a0, a1, d0, d1, h = 0.76, on = '') => { if (!put(a0, a1, d0, d1)) return false;
      Ba('timber', a0, a1, h - 0.05, h, d0, d1);
      for (const [la, ld] of [[a0 + 0.07, d0 + 0.07], [a1 - 0.07, d0 + 0.07], [a0 + 0.07, d1 - 0.07], [a1 - 0.07, d1 - 0.07]]) Ba('wood_dark', la - 0.035, la + 0.035, 0, h - 0.05, ld - 0.035, ld + 0.035);
      Ca(a0, a1, 0, h + 0.05, d0, d1);
      const cx = (a0 + a1) / 2, cz = (d0 + d1) / 2;
      if (on === 'meal') { Va('pottery_dark', [[0.04, 0], [0.07, 0.08], [0.05, 0.2], [0.001, 0.2]], cx - 0.2, h, cz - 0.1, 7); Va('pottery_dark', [[0.04, 0], [0.06, 0.07], [0.05, 0.14], [0.001, 0.14]], cx + 0.15, h, cz + 0.12, 7); Ra('ivory', [cx, h, cz], [cx, h + 0.16, cz], 0.02, 5); }
      if (on === 'ledger') { Ba('ivory', cx - 0.25, cx + 0.05, h, h + 0.03, cz - 0.2, cz + 0.2); Ba('hide_brown', cx + 0.1, cx + 0.3, h, h + 0.05, cz - 0.15, cz + 0.1); Ra('ivory', [cx - 0.3, h, cz + 0.3], [cx - 0.3, h + 0.15, cz + 0.3], 0.02, 5); }
      if (on === 'scales') { Ra('iron', [cx, h, cz], [cx, h + 0.4, cz], 0.012, 4); Ra('iron', [cx - 0.2, h + 0.4, cz], [cx + 0.2, h + 0.4, cz], 0.01, 4); Ba('silver', cx - 0.26, cx - 0.14, h + 0.2, h + 0.215, cz - 0.06, cz + 0.06); Ba('gold', cx + 0.14, cx + 0.26, h + 0.25, h + 0.265, cz - 0.06, cz + 0.06); }
      if (on === 'cloth') { for (let i = 0; i < 3; i++) Ba(CLOTH[Math.floor(hash(cx, cz, i) * 6)], a0 + 0.1 + i * 0.05, a1 - 0.1 - i * 0.04, h, h + 0.06 + i * 0.06, d0 + 0.1 + i * 0.1, d1 - 0.1); }
      return true; };
    const bench = (a0, a1, d0, d1) => { if (!put(a0, a1, d0, d1, 0.0)) return false; Ba('timber', a0, a1, 0.42, 0.46, d0, d1); const lg = a1 - a0 > d1 - d0; for (const f of [0.12, 0.88]) { const ca = lg ? a0 + (a1 - a0) * f : (a0 + a1) / 2, cd = lg ? (d0 + d1) / 2 : d0 + (d1 - d0) * f; Ba('wood_dark', ca - 0.04, ca + 0.04, 0, 0.42, cd - 0.04, cd + 0.04); } return true; };
    const stool = (a, d) => { if (!put(a - 0.2, a + 0.2, d - 0.2, d + 0.2, 0.0)) return false; Va('timber', [[0.001, 0], [0.16, 0], [0.16, 0.4], [0.19, 0.44], [0.001, 0.44]], a, 0, d, 8); return true; };
    const barrel = (a, d, r = 0.34, h = 0.85, m = 'wood_dark') => { if (!put(a - r, a + r, d - r, d + r)) return false; Va(m, [[r * 0.8, 0], [r, h * 0.3], [r, h * 0.7], [r * 0.8, h], [0.001, h]], a, 0, d, 10); Va('iron', [[r * 0.96, h * 0.15], [r * 1.02, h * 0.18], [r * 0.96, h * 0.21]], a, 0, d, 10); circ(a, d, r, h); return true; };
    const sack = (a, d, h = 0.5) => { Va('sacking', [[0.22, 0], [0.28, h * 0.36], [0.24, h * 0.8], [0.1, h], [0.001, h]], a, 0, d, 8); };
    const sacks = (a0, d0, n2, nd) => { if (!put(a0 - 0.3, a0 + 0.3 + (n2 - 1) * 0.5, d0 - 0.3, d0 + 0.3 + (nd - 1) * 0.5)) return false; for (let i = 0; i < n2; i++) for (let j = 0; j < nd; j++) { sack(a0 + i * 0.5, d0 + j * 0.5, 0.5); if ((i + j) % 2 === 0) Va('sacking', [[0.2, 0], [0.26, 0.15], [0.22, 0.34], [0.09, 0.42], [0.001, 0.42]], a0 + i * 0.5, 0.5, d0 + j * 0.5, 8); } return true; };
    const bedF = (a0, a1, d0, d1, ax, hd, cloth, canopy = false) => { if (!put(a0, a1, d0, d1)) return ax === 'd' ? pallet(a1 - 1.0, a1, d0, d1) : pallet(a0, a1, d1 - 1.0, d1, 'a');
      const Lg = ax === 'd' ? d1 - d0 : a1 - a0, W = ax === 'd' ? a1 - a0 : d1 - d0;
      const tb = (m, t0, t1, w0, w1, y0, y1) => { const ta = hd > 0 ? t0 : Lg - t1, tb2 = hd > 0 ? t1 : Lg - t0; if (ax === 'd') Ba(m, a0 + w0, a0 + w1, y0, y1, d0 + ta, d0 + tb2); else Ba(m, a0 + ta, a0 + tb2, y0, y1, d0 + w0, d0 + w1); };
      tb('wood_dark', 0, Lg, 0, W, 0.05, 0.36); tb('linen', 0.05, Lg - 0.05, 0.05, W - 0.05, 0.36, 0.48);
      tb(cloth, 0.03, Lg * 0.62, 0.02, W - 0.02, 0.48, 0.53); tb('linen', Lg - 0.42, Lg - 0.1, 0.1, W - 0.1, 0.48, 0.6);
      tb('wood_dark', Lg - 0.07, Lg, 0, W, 0.05, 1.0); tb('wood_dark', 0, 0.05, 0, W, 0.05, 0.6);
      if (canopy) { for (const [t, w] of [[0.05, 0.05], [0.05, W - 0.05], [Lg - 0.05, 0.05], [Lg - 0.05, W - 0.05]]) tb('wood_dark', t - 0.04, t + 0.04, w - 0.04, w + 0.04, 0.05, 1.95); tb(CLOTH[Math.floor(hash(a0, d0, k) * 6)], 0, Lg, 0, W, 1.95, 2.0); tb('cloth_red', Lg - 0.1, Lg - 0.04, 0.04, W - 0.04, 1.0, 1.95); }
      Ca(a0, a1, 0.05, 0.62, d0, d1); return true; };
    const pallet = (a0, a1, d0, d1, ax = 'd') => { if (!put(a0, a1, d0, d1)) return false; const c = CLOTH[Math.floor(hash(a0, d0, k) * 6)];
      Ba('sacking', a0, a1, 0.0, 0.13, d0, d1);
      if (ax === 'd') { Ba(c, a0 + 0.03, a1 - 0.03, 0.13, 0.17, d0 + 0.05, d0 + (d1 - d0) * 0.7); Ba('linen', a0 + 0.1, a1 - 0.1, 0.13, 0.22, d1 - 0.35, d1 - 0.08); }
      else { Ba(c, a0 + 0.05, a0 + (a1 - a0) * 0.7, 0.13, 0.17, d0 + 0.03, d1 - 0.03); Ba('linen', a1 - 0.35, a1 - 0.08, 0.13, 0.22, d0 + 0.1, d1 - 0.1); } return true; };
    const brazier = (a, d) => { if (!put(a - 0.4, a + 0.4, d - 0.4, d + 0.4)) return false; Ba('tile_dark', a - 0.35, a + 0.35, 0, 0.05, d - 0.35, d + 0.35);
      Va('iron', [[0.12, 0.3], [0.28, 0.4], [0.3, 0.48], [0.24, 0.48], [0.001, 0.38]], a, 0, d, 10);
      for (const [x, z] of [[-0.14, -0.14], [0.14, -0.14], [0, 0.17]]) Ra('iron', [a + x, 0.05, d + z], [a + x * 1.2, 0.34, d + z * 1.2], 0.02, 4);
      Va('pottery_dark', [[0.001, 0.44], [0.12, 0.46], [0.16, 0.58], [0.12, 0.68], [0.001, 0.68]], a, 0, d, 8); circ(a, d, 0.32, 0.6); return true; };
    const shelf = (aw, d0, d1, ys, items = 'pots', m = 'wood_dark') => {   // aw: the wall's a (0 = stair side's wall: negative sign)
      const far = aw > L / 2, a0 = far ? aFr - 0.28 : aW, a1 = far ? aFr + 0.01 : aW + 0.29;
      if (!put(a0, a1, d0, d1, 0.0)) return false;
      for (const yy of ys) { Ba(m, a0, a1, yy, yy + 0.04, d0, d1);
        for (let d = d0 + 0.15; d < d1 - 0.1; d += 0.3) { const hsh = hash(d, yy, k); const ac = (a0 + a1) / 2;
          if (items === 'pots') Va(hsh < 0.5 ? 'terracotta' : 'pottery_dark', [[0.04, 0], [0.08, 0.08], [0.06, 0.18], [0.001, 0.18]], ac, yy + 0.04, d, 7);
          else if (items === 'books') Ba(CLOTH[Math.floor(hsh * 6)], a0 + 0.03, a1 - 0.03, yy + 0.04, yy + 0.2 + hsh * 0.1, d - 0.1, d + 0.1);
          else if (items === 'cloth') Ba(CLOTH[Math.floor(hsh * 6)], a0 + 0.02, a1 - 0.02, yy + 0.04, yy + 0.3, d - 0.14, d + 0.14);
          else if (items === 'candles') Ra('ivory', [ac, yy + 0.04, d], [ac, yy + 0.3, d], 0.02, 4); } }
      for (const d of [d0 + 0.05, d1 - 0.05]) Ba('wood_dark', a0 + 0.02, a1 - 0.02, ys[0] - 0.06, ys[ys.length - 1], d - 0.025, d + 0.025);
      return true; };
    const pole = (a0, a1, d0, d1, y = 1.6) => {    // a pegged rail on the wall with garments hung
      if (!put(a0, a1, d0, d1, 0.0)) return false;
      Ba('timber', a0, a1, y, y + 0.05, d0, d1);
      for (let d = d0 + 0.2; d < d1 - 0.1; d += 0.34) { const hsh = hash(d, a0, k); Ba(CLOTH[Math.floor(hsh * 6)], (a0 + a1) / 2 - 0.05, (a0 + a1) / 2 + 0.05, y - 0.9 + hsh * 0.3, y, d - 0.13, d + 0.13); }
      return true; };
    const tapestry = (aw, d0, d1, c) => { const far = aw > L / 2; Ba(c, far ? aFr - 0.01 : aW - 0.015, far ? aFr + 0.03 : aW + 0.025, 0.9, 2.2, d0, d1); };
    const seats = () => { for (let i = 0; i < nw; i++) { if (gal && k === 1 && i === gal.k) continue; const uc = (i + 0.5) * sp, a = A(uc); if (put(a - 0.5, a + 0.5, dFt, dFt + 0.42, 0.0)) { Ba('wood_dark', a - 0.5, a + 0.5, 0, 0.4, dFt, dFt + 0.4); Ba('timber', a - 0.52, a + 0.52, 0.4, 0.45, dFt, dFt + 0.42); } } };
    const winA = (i) => A((i + 0.5) * sp);
    const prie = (a, d) => { if (!put(a - 0.3, a + 0.3, d - 0.2, d + 0.3)) return false; Ba('wood_dark', a - 0.28, a + 0.28, 0, 0.3, d - 0.2, d + 0.3); Ba('wood_dark', a - 0.28, a + 0.28, 0.3, 1.0, d + 0.24, d + 0.3); Ba('gold', a - 0.03, a + 0.03, 0.75, 0.95, d + 0.2, d + 0.24); Ba('gold', a - 0.1, a + 0.1, 0.84, 0.88, d + 0.2, d + 0.24); return true; };
    const basin = (a, d) => { if (!put(a - 0.25, a + 0.25, d - 0.25, d + 0.25)) return false; Ba('wood_dark', a - 0.22, a + 0.22, 0, 0.8, d - 0.22, d + 0.22); Va('pottery_dark', [[0.001, 0.8], [0.18, 0.82], [0.24, 0.9], [0.2, 0.9], [0.001, 0.84]], a, 0, d, 9); Va('terracotta', [[0.04, 0.8], [0.08, 0.9], [0.06, 1.0], [0.001, 1.0]], a + 0.15, 0, d + 0.1, 7); return true; };
    const cradle = (a, d) => { if (!put(a - 0.3, a + 0.3, d - 0.4, d + 0.4)) return false; Ba('wood_dark', a - 0.28, a + 0.28, 0.08, 0.4, d - 0.38, d + 0.38); Ba('linen', a - 0.24, a + 0.24, 0.3, 0.42, d - 0.32, d + 0.32); for (const s of [-1, 1]) Ba('wood_dark', a - 0.3, a + 0.3, 0, 0.08, d + s * 0.3 - 0.04, d + s * 0.3 + 0.04); return true; };
    const loom = (a, d) => { if (!put(a - 0.7, a + 0.7, d - 0.5, d + 0.5)) return false; for (const s of [-1, 1]) for (const t of [-1, 1]) Ra('wood_dark', [a + s * 0.6, 0, d + t * 0.4], [a + s * 0.6, 1.9, d + t * 0.4], 0.04, 5);
      for (const yy of [1.9, 1.0]) Ba('timber', a - 0.64, a + 0.64, yy - 0.04, yy + 0.04, d - 0.44, d - 0.36); Ba('cloth_ochre', a - 0.55, a + 0.55, 0.9, 1.7, d - 0.4, d - 0.37); Ba('timber', a - 0.6, a + 0.6, 0.5, 0.55, d - 0.1, d + 0.3); Ca(a - 0.7, a + 0.7, 0, 1.9, d - 0.5, d + 0.5); return true; };
    const desk = (a, d) => { if (!put(a - 0.55, a + 0.55, d, d + 0.75)) return false; Ba('wood_dark', a - 0.5, a + 0.5, 0, 0.9, d + 0.02, d + 0.7); Ba('timber', a - 0.55, a + 0.55, 0.9, 0.95, d, d + 0.75); Ba('ivory', a - 0.3, a + 0.2, 0.95, 0.96, d + 0.12, d + 0.55); Ba('wood_dark', a - 0.55, a + 0.55, 0.95, 1.02, d, d + 0.05); Va('iron', [[0.03, 0], [0.04, 0.05], [0.001, 0.07]], a + 0.35, 0.95, d + 0.3, 6); Ca(a - 0.55, a + 0.55, 0, 1.0, d, d + 0.75); return true; };
    const rack = (a, d0, d1) => { if (!put(a - 0.3, a + 0.3, d0, d1)) return false; for (const d of [d0 + 0.05, d1 - 0.05]) Ra('timber', [a, 0, d], [a, 2.0, d], 0.04, 5); Ra('timber', [a, 1.95, d0], [a, 1.95, d1], 0.035, 5); for (let d = d0 + 0.15; d < d1 - 0.1; d += 0.14) { Ra('ivory', [a - 0.06, 1.95, d], [a - 0.06, 1.55, d], 0.014, 3); Ra('ivory', [a + 0.06, 1.95, d], [a + 0.06, 1.6, d], 0.014, 3); } return true; };
    const hams = (a, d0, d1) => { Ba('timber', a - 0.03, a + 0.03, 2.0, 2.06, d0, d1); for (let d = d0 + 0.2; d < d1 - 0.1; d += 0.3) { Ra('iron', [a, 2.0, d], [a, 1.7, d], 0.01, 3); Ba(hash(d, a, k) < 0.5 ? 'cloth_red' : 'hide_white', a - 0.07, a + 0.07, 1.2, 1.7, d - 0.07, d + 0.07); } };
    const crate = (a, d, s2 = 0.5) => { if (!put(a - s2 / 2, a + s2 / 2, d - s2 / 2, d + s2 / 2)) return false; Ba('timber', a - s2 / 2, a + s2 / 2, 0, s2 * 0.8, d - s2 / 2, d + s2 / 2); Ba('wood_dark', a - s2 / 2 - 0.01, a + s2 / 2 + 0.01, s2 * 0.35, s2 * 0.4, d - s2 / 2 - 0.01, d + s2 / 2 + 0.01); Ca(a - s2 / 2, a + s2 / 2, 0, s2 * 0.8 + 0.1, d - s2 / 2, d + s2 / 2); return true; };
    const bolts = (a0, a1, d0, d1) => { if (!put(a0, a1, d0, d1)) return false; for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i > 1 ? 1 : 0); j++) Ba(CLOTH[Math.floor(hash(a0 + i, d0 + j, k) * 6)], a0 + 0.02, a1 - 0.02, i * 0.22, i * 0.22 + 0.2, d0 + j * ((d1 - d0) / 3), d0 + (j + 1) * ((d1 - d0) / 3) - 0.03); Ca(a0, a1, 0, 0.9, d0, d1); return true; };
    const dressoir = (a1, d0, d1) => { const a0 = a1 - 0.55; if (!put(a0, a1, d0, d1)) return false; Ba('wood_dark', a0, a1, 0, 1.1, d0, d1); Ba('timber', a0 - 0.02, a1, 1.1, 1.15, d0 - 0.02, d1 + 0.02); for (let d = d0 + 0.3; d < d1 - 0.2; d += 0.5) { Ba('timber', a0 - 0.005, a0 + 0.01, 0.1, 1.0, d - 0.01, d + 0.01); } for (let d = d0 + 0.2; d < d1 - 0.1; d += 0.32) { const q = hash(d, a1, k); Va(q < 0.5 ? 'silver' : 'pottery_dark', [[0.05, 0], [0.09, 0.1], [0.06, 0.22], [0.001, 0.22]], (a0 + a1) / 2, 1.15, d, 8); } Ca(a0, a1, 0, 1.2, d0, d1); return true; };
    const hearth = () => { if (!U.hearth || attic) return; const dd = chim.dd, [u0, u1] = hearthU, face = U.chimSide === 'lo' ? u1 : u0, sg = U.chimSide === 'lo' ? 1 : -1, hc = yF + ST - 0.17;
      Bx('limestone', u0, u1, yF, hc, dd - 0.7, dd + 0.7); Bx('opening', face, face + sg * 0.03, yF + 0.02, yF + 0.95, dd - 0.45, dd + 0.45);
      Bx('limestone', face, face + sg * 0.14, yF + 1.0, yF + 1.3, dd - 0.6, dd + 0.6); Bx('tile_dark', face, face + sg * 0.5, yF, yF + 0.04, dd - 0.6, dd + 0.6);
      Cr(Math.min(u0, face + sg * 0.5), Math.max(u1, face + sg * 0.5), yF, hc, dd - 0.7, dd + 0.7); };
    hearth();
    if (attic) {
      // the attic's goods: sacks of grain, casks, bundles of rushes, a chest, a hanging row of dried herbs
      const rr = hash(L, D, seed);
      const mid = L / 2, am = A(mid);
      sacks(A(L - 1.5) > 0 ? Math.min(A(1.6), A(L - 1.6)) + 0.5 : 2, dK - 1.1, 2, 2); barrel(Math.max(A(1.7), A(L - 1.7)) - 0.2, dK - 0.5, 0.34, 0.85);
      chest(Math.min(A(1.5), A(L - 1.5)) + 0.9, dK - 0.6 - 0.0, 0.9, 0.5);
      for (let i = 0; i < 3; i++) { const q = A(mid + (i - 1) * 0.5); if (put(q - 0.2, q + 0.2, dFt + 0.6 + rr, dFt + 0.9 + rr, 0.0)) Ra('timber', [q, 0, dFt + 0.75 + rr], [q + 0.1, 1.0, dFt + 0.75 + rr], 0.05, 5); void am; }
      continue;
    }
    seats();
    // ── by use
    const midA = Math.max(CORE + 0.9, aFr - 1.0);
    if (kind === 'merchant') {
      if (k === 1) { table(midA - 0.45, midA + 0.45, dFt + 1.8, dFt + 4.0, 0.76, 'meal'); bench(midA - 0.8, midA - 0.55, dFt + 1.9, dFt + 3.9); bench(midA + 0.55, midA + 0.8, dFt + 1.9, dFt + 3.9);
        dressoir(aFr, dK - 1.6, dK - 0.1); brazier(aFr - 0.5, dFt + 4.8); tapestry(L, dFt + 1.6, dFt + 4.2, 'cloth_red'); chest(aW + 0.02, dFt + 1.5, 0.55, 1.2); }
      else if (k === 2) { bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_indigo', true); chest(aFr - 1.5, dK - 2.8, 1.1, 0.5); chest(aFr - 0.55, dK - 3.4, 0.5, 0.5); prie(aFr - 0.5, dFt + 0.5); pole(aFr - 0.2, aFr, dFt + 1.2, dFt + 3.4); basin(aW + 0.35, dFt + 0.6); tapestry(L, dFt + 3.6, dFt + 5.5, 'cloth_green'); }
      else if (trade === 'goldsmith') { chest(aFr - 1.1, dK - 0.6, 1.1, 0.55); chest(aFr - 1.1, dK - 1.4, 1.1, 0.55); table(midA - 0.5, midA + 0.5, dFt + 1.0, dFt + 2.0, 0.9, 'scales'); shelf(L, dFt + 0.8, dFt + 3.2, [0.7, 1.2, 1.7], 'pots'); pallet(aW + 0.1, aW + 1.0, dFt + 0.9, dFt + 2.8); }
      else { bolts(aFr - 0.9, aFr - 0.04, dK - 2.6, dK - 0.1); shelf(L, dFt + 1.0, dFt + 4.6, [0.6, 1.1, 1.6], 'cloth'); table(midA - 0.5, midA + 0.5, dFt + 1.4, dFt + 2.8, 0.85, 'cloth'); pallet(aW + 0.1, aW + 1.0, dFt + 0.9, dFt + 2.8); pallet(aW + 1.15, aW + 2.0, dFt + 0.9, dFt + 2.8); }
    } else if (kind === 'inn') {
      if (k === 1) { for (let i = 0; i < 3; i++) { const d0 = dFt + 1.6 + i * 1.45; bedF(aFr - 2.0, aFr - 0.04, d0, d0 + 1.25, 'a', 1, CLOTH[(i * 2 + 1) % 6]); }
        chest(aFr - 3.1, dFt + 1.7, 0.5, 0.9); pole(aW, aW + 0.05, dFt + 1.8, dFt + 4.5); basin(aW + 0.5, dFt + 5.0); table(midA - 1.5, midA - 0.6, dFt + 0.9, dFt + 1.5 + 0.0, 0.76, 'meal'); }
      else if (k === 2) { bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_red'); cradle(aFr - 2.1, dK - 0.6); chest(aFr - 1.0, dK - 2.8, 1.0, 0.5); table(midA - 0.5, midA + 0.4, dFt + 1.5, dFt + 2.6, 0.76, 'ledger'); stool(midA, dFt + 3.1); pallet(aW + 0.1, aW + 1.0, dFt + 1.2, dFt + 3.2); pallet(aW + 1.15, aW + 2.0, dFt + 1.2, dFt + 3.2); }
      else { for (let i = 0; i < 4; i++) { const d0 = dFt + 0.9 + i * 1.0; pallet(aFr - 2.0, aFr - 0.04, d0, d0 + 0.85, 'a'); } sacks(aW + 0.6, dFt + 1.2, 2, 2); pole(aW, aW + 0.05, dFt + 3.0, dFt + 5.0); }
    } else if (kind === 'craft') {
      if (trade === 'chandler') {
        if (k === 1) { for (let i = 0; i < nw; i++) { const a = winA(i); table(a - 0.6, a + 0.6, dFt + 0.02, dFt + 0.8, 0.85); for (let j = 0; j < 4; j++) Ba('pottery_dark', a - 0.5 + j * 0.27, a - 0.3 + j * 0.27, 0.85, 0.93, dFt + 0.2, dFt + 0.6); Ba('ivory', a - 0.5, a + 0.4, 0.85, 0.89, dFt + 0.62, dFt + 0.76); }
          rack(aFr - 0.8, dFt + 1.4, dFt + 3.8); rack(aFr - 1.9, dFt + 1.4, dFt + 3.8); barrel(aW + 0.4 + 0, dFt + 2.2, 0.38, 0.8, 'wood_dark'); stool(midA - 0.4, dFt + 4.6); stool(midA + 0.7, dFt + 4.6); shelf(L, dK - 2.5, dK - 0.1, [0.6, 1.1, 1.6], 'candles'); }
        else if (k === 2) { bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_brown'); pallet(aFr - 3.0, aFr - 2.0, dK - 2.1, dK - 0.1); pallet(aFr - 3.0, aFr - 2.0, dK - 3.1, dK - 2.3); chest(aW + 0.02, dFt + 1.2, 0.6, 1.1); pole(aFr - 0.2, aFr, dFt + 1.2, dFt + 3.2); }
        else { barrel(aFr - 0.5, dK - 0.5, 0.4, 0.9); barrel(aFr - 1.3, dK - 0.5, 0.4, 0.9); barrel(aFr - 0.5, dK - 1.4, 0.4, 0.9); sacks(aW + 0.5, dFt + 1.0, 2, 3); crate(midA, dFt + 1.4); }
      } else if (trade === 'scribe') {
        for (let i = 0; i < nw; i++) { const a = winA(i); desk(a, dFt + 0.02); stool(a, dFt + 1.2); }
        shelf(L, dFt + 1.8, dFt + 5.0, [0.5, 1.0, 1.5, 2.0], 'books'); chest(aFr - 1.4, dK - 0.7, 0.9, 0.55); table(midA - 0.5, midA + 0.5, dFt + 2.0, dFt + 3.2, 0.78, 'ledger'); stool(midA, dFt + 3.7);
        for (let i = 0; i < 3; i++) { const d = dFt + 1.0 + i * 0.5; Ba('ivory', aW - 0.01, aW + 0.03, 0.9, 1.7, d, d + 0.4); }
      } else {      // cooper
        for (const [a, d] of [[aFr - 0.5, dFt + 1.5], [aFr - 1.3, dFt + 1.8], [aFr - 0.5, dFt + 2.6], [aFr - 1.5, dFt + 3.0]]) barrel(a, d, 0.36, 0.9);
        for (let i = 0; i < 10; i++) { const d = dK - 0.4 - i * 0.07, a = aW + 0.2 + (i % 3) * 0.04; Ra('timber', [a, 0, d], [a + 0.15, 1.5, d], 0.03, 4); }
        for (let i = 0; i < 4; i++) Ba('iron', aFr - 0.01, aFr + 0.03, 1.2 + (i % 2) * 0.3, 1.25 + (i % 2) * 0.3, dFt + 4.0 + i * 0.4, dFt + 4.3 + i * 0.4);
        table(midA - 0.5, midA + 0.5, dFt + 4.0, dFt + 5.2, 0.85); stool(midA, dFt + 5.8); chest(aW + 0.02, dFt + 1.4, 0.6, 1.0);
        if (k > 1) { bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_green'); pallet(aFr - 2.9, aFr - 2.0, dK - 2.1, dK - 0.1); }
      }
    } else if (kind === 'tenement') {
      const v = Math.floor(hash(L, k, seed) * 3 + k) % 3;
      if (v === 0) { bedF(aFr - 1.35, aFr - 0.04, dK - 2.0, dK - 0.04, 'd', 1, CLOTH[k % 6]); chest(aFr - 1.0, dK - 2.6, 0.9, 0.5); brazier(midA - 0.3, dFt + 3.6); stool(midA + 0.5, dFt + 4.3); shelf(L, dFt + 0.8, dFt + 2.6, [0.8, 1.3], 'pots'); }
      else if (v === 1) { loom(midA, dFt + 1.4); pallet(aFr - 1.0, aFr - 0.04, dK - 2.0, dK - 0.04); chest(aW + 0.02, dFt + 1.2, 0.6, 0.9); stool(midA, dFt + 2.7); Va('terracotta', [[0.1, 0], [0.18, 0.2], [0.14, 0.4], [0.001, 0.42]], aFr - 0.3, 0, dFt + 0.8, 8); }
      else { pallet(aW + 0.1, aW + 1.0, dFt + 1.0, dFt + 3.0); pallet(aW + 1.15, aW + 2.0, dFt + 1.0, dFt + 3.0); brazier(midA, dFt + 2.5); table(aFr - 1.0, aFr - 0.1, dK - 1.8, dK - 0.1, 0.76, 'meal'); stool(aFr - 0.6, dK - 2.3); pole(aFr - 0.2, aFr, dFt + 3.5, dFt + 5.3); }
    } else {      // dwelling
      if (trade === 'baker') {
        if (k === 1) { bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_red'); cradle(aFr - 2.1, dK - 0.6); chest(aFr - 1.1, dK - 2.8, 1.0, 0.5); table(midA - 0.5, midA + 0.5, dFt + 1.8, dFt + 3.0, 0.76, 'meal'); stool(midA, dFt + 3.5); stool(midA, dFt + 1.3); pole(aFr - 0.2, aFr, dFt + 0.9, dFt + 2.7); }
        else if (k === 2) { sacks(aFr - 1.5, dK - 1.1, 3, 2); sacks(aW + 0.6, dFt + 1.0, 2, 3); crate(aFr - 0.5, dFt + 1.2, 0.8); crate(aFr - 0.5, dFt + 2.2, 0.8); table(midA - 0.4, midA + 0.4, dFt + 3.0, dFt + 4.4, 0.85); Ba('linen', midA - 0.3, midA + 0.3, 0.85, 0.9, dFt + 3.3, dFt + 4.1); }
        else { for (let i = 0; i < 3; i++) pallet(aFr - 2.0, aFr - 0.04, dFt + 1.0 + i * 1.1, dFt + 1.9 + i * 1.1, 'a'); chest(aW + 0.02, dFt + 1.2, 0.6, 1.0); }
      } else {      // butcher
        bedF(aFr - 1.5, aFr - 0.04, dK - 2.2, dK - 0.04, 'd', 1, 'cloth_brown'); chest(aFr - 1.1, dK - 2.8, 1.0, 0.5); table(midA - 0.5, midA + 0.5, dFt + 1.6, dFt + 2.8, 0.76, 'meal'); stool(midA, dFt + 3.3);
        barrel(aFr - 0.5, dFt + 1.3, 0.36, 0.8); barrel(aFr - 1.3, dFt + 1.3, 0.36, 0.8); barrel(aW + 0.5, dFt + 1.3, 0.36, 0.8); hams(midA, dFt + 3.6, dFt + 5.4); pole(aFr - 0.2, aFr, dFt + 3.6, dFt + 5.4);
      }
    }
  }
  void FL; void CLOTH;
  for (const [m, list] of acc) realBag.add(m, mergeGeoms(list));
}
