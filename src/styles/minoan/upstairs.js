// Upstairs in the town houses that can be entered (docs/settlements/knossos.md §4j): a stair of two side-by-side strips against the
// wall nearest the door (the flights turn back on each other, ground to first floor to second to the roof), the floors with their
// openings and rails, the walls of the upper storeys with real windows on the lane and a balcony that can be stepped onto, the rooms
// furnished by the trade of the house, and the roof terrace reached through its hatch. Only the near copy of a house gets any of this.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';

export const SH = 2.9, T = 0.5, B0 = T + 0.12;
const SW = 1.05, GAP = 0.5, WG = 0.25, SLOPE = 0.77, OPEN = 0.4, G = 'gypsum_minoan', RED = 'paint_minoan_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hashAt = (x, z, seed = 0) => rng(Math.floor(x * 131.7 + z * 977.3 + seed * 7919) + 29);

/** The stair of a house: { left (the stair strips on the left of the front), Y (the floors' heights), R (a flight's run), flights, strip(s) }. Frame coordinates (u along the front, v in from its outer face). */
export function stairLayout(FR, n, y) {
  const { L, du } = FR, left = du < L / 2, Y = [y + 0.2];
  for (let k = 1; k <= n; k++) Y.push(y + k * SH);
  const strip = (s) => (left ? [T + WG + s * (SW + GAP), T + WG + s * (SW + GAP) + SW] : [L - T - WG - s * (SW + GAP) - SW, L - T - WG - s * (SW + GAP)]);
  const R = SH / SLOPE, flights = [];
  for (let j = 0; j < n; j++) {
    const s = j % 2, even = s === 0, [ua, ub] = strip(s);
    flights.push({ j, s, even, ua, ub, y0: Y[j], y1: Y[j + 1], v0: B0, v1: B0 + R, hole: [Math.max(T, ua - OPEN), Math.min(L - T, ub + OPEN), B0, B0 + R] });
  }
  return { left, Y, R, flights, strip, n };
}
/** The world rectangles of the openings in the floors: index k = the floor above flight k−1 (1..n), for the colliders and the planks. */
export function holeRects(FR, UP) {
  const Q = rectOf(FR), out = [];
  for (const f of UP.flights) out[f.j + 1] = Q(f.hole[0], f.hole[1], f.hole[2], f.hole[3]);
  return out;
}
export const rectOf = (FR) => (u0, u1, v0, v1) => { const a = FR.P(u0, v0), b = FR.P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
/** The stair block's footprint in the frame, and where the street-life figures of the ground floor must not stand: u, v in the frame. */
export function onStair(FR, UP, u, v, m = 0.35) {
  const [a, b] = [UP.strip(0)[0], UP.strip(1)[1]], lo = Math.min(a, b), hi = Math.max(a, b);
  return u > lo - m && u < hi + m && v < B0 + UP.R + m;
}

/** A thin vertical panel (both faces, no top): the rails and curtains. */
function panel(bag, mat, a, b, ya, yb) {
  const t = [];
  const q = (p0, p1, p2, p3) => t.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  const A = [a[0], ya, a[1]], B = [b[0], ya, b[1]], C = [b[0], yb, b[1]], D = [a[0], yb, a[1]];
  q(A, B, C, D); q(D, C, B, A);
  bag.add(mat, fromTriangles(t));
}

/**
 * Builds the floors, stair, walls, rooms and roof. ctx: { bag, col, lights }; PL the wall material; kind the use of the house.
 * Returns { hatch (the world rectangle of the roof's hatch, for the things on the roof to keep clear of) }.
 */
export function buildUpper(el, ctx, FR, UP, PL, kind, cls) {
  const { bag, col } = ctx, n = UP.n, { L, D, P } = FR, Y = UP.Y, Q = rectOf(FR), seed = el.seed || 1;
  const holes = holeRects(FR, UP), inner = Q(T, L - T, T, D - T), vB = D - T - 0.12, W = (u0, u1) => [Math.min(u0, u1), Math.max(u0, u1)];
  const Bx = (mat, u0, u1, v0, v1, ya, yb, solid = false) => { const r = Q(u0, u1, v0, v1); bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (solid) col.rect(r, ya, yb); return r; };
  // ── the floors: planks on joists, less the openings of the stair; the roof's slab the same
  for (let k = 1; k <= n; k++) {
    const top = Y[k], thick = k === n ? 0.2 : 0.15, mat = k === n ? PL : 'wood_ochre';
    for (const r of subtractRects(inner, holes[k] ? [holes[k]] : [])) { bag.add(mat, box(r[0], top - thick, r[1], r[2], top, r[3])); col.rect(r, top - thick, top); col.floor(r, top); }
  }
  // ── the flights: solid steps (timber above the first), the ramp the walker climbs, the mass under the high part closed
  const dirB = { s: 'n', n: 's', w: 'e', e: 'w' }[FR.f], rev = { n: 's', s: 'n', e: 'w', w: 'e' };
  for (const f of UP.flights) {
    const N = Math.round((f.y1 - f.y0) / 0.2), tread = UP.R / N, mat = f.j === 0 ? G : 'timber';
    for (let i = 0; i < N; i++) {
      const top = f.y0 + (i + 1) * (f.y1 - f.y0) / N, a = f.even ? B0 + i * tread : B0 + UP.R - (i + 1) * tread, b = a + tread;
      Bx(mat, f.ua, f.ub, a, b, f.y0, top);
    }
    const r = Q(f.ua, f.ub, f.v0, f.v1);
    col.ramp(r, f.y0 + 0.1, f.y1, f.even ? dirB : rev[dirB]);
    for (let c = 0; c < 8; c++) {
      const a = B0 + c * UP.R / 8, b = a + UP.R / 8, lowB = f.even ? a : B0 + UP.R - b, h = 0.1 + (f.y1 - f.y0 - 0.1) * (lowB - B0) / UP.R;
      if (h > 0.45) col.rect(Q(f.ua, f.ub, a, b), f.y0, f.y0 + h - 0.05);
    }
  }
  // ── rails round the openings (no top faces), the way off the flight left open at its arrival
  const rail = (u0, u1, v0, v1, yb) => {
    const a = P(u0, v0), b = P(u1, v1), ya = yb;
    panel(bag, 'timber', a, b, ya, ya + 0.9);
    const r = Q(u0 - 0.04, u1 + 0.04, v0 - 0.04, v1 + 0.04); col.rect(r, ya, ya + 0.95);
  };
  for (const f of UP.flights) {
    const k = f.j + 1, top = Y[k], [ua, ub, va, vb] = f.hole, wallSide = f.s === 0 ? (UP.left ? ua : ub) : null;  // (the hole's own edge on the wall side)
    const exit = f.even ? 0 : 0.9;           // an odd flight arrives at the front: its sides are open for a little
    for (const u of [ua, ub]) {
      if (u === wallSide) continue;
      const v0 = Math.max(va, B0 + exit);
      if (vb - v0 > 0.1) rail(u, u, v0, vb, top);
    }
  }
  // ── walls of the storeys above the ground, with their windows; the front's door to the balcony
  const free = UP.left ? [T + WG + 2 * SW + GAP + 0.1 + OPEN, L - T] : [T, L - T - WG - 2 * SW - GAP - 0.1 - OPEN], fw = free[1] - free[0];
  const uB = Math.max(free[0] + 0.9, Math.min(free[1] - 0.9, (free[0] + free[1]) / 2));
  const win = [], elite = cls === 'elite';
  const wl = (fw >= 4.3) ? [free[0] + 0.85, free[1] - 0.85] : [free[0] + (UP.left ? fw - 0.8 : 0.8)];
  const sw = (UP.left ? T + WG : L - T - WG) + (UP.left ? 1 : -1) * SW / 2;   // a window over the stair, on the front
  const frontOpen = [...wl.filter((u) => Math.abs(u - uB) > 1.35).map((u) => ({ a: u - 0.6, b: u + 0.6, lo: 0.8, hi: 2.0 })), { a: sw - 0.5, b: sw + 0.5, lo: 0.8, hi: 2.0 }];
  const doorO = { a: uB - 0.55, b: uB + 0.55, lo: 0, hi: 2.2, door: true };
  win.push(doorO, ...frontOpen);
  const sideW = (side) => (side === 'l' ? el.alW : el.alE);
  const wallBox = (mat, u0, u1, v0, v1, ya, yb) => { if (u1 - u0 > 0.02 && yb - ya > 0.02) Bx(mat, u0, u1, v0, v1, ya, yb); };
  const run = (axis, fixed, a0, a1, opens, ya, yb, inner0) => {
    // a wall along `axis` over [a0, a1] at the fixed range, outer layer and inner lining, the openings cut (each { a, b, lo, hi } above the floor ya)
    const [f0, f1] = fixed, th = f1 - f0, so = inner0 ? [f0 + 0.08, f1] : [f0, f1 - 0.08], si = inner0 ? [f0, f0 + 0.08] : [f1 - 0.08, f1];
    const put = (mat, s, p0, p1, y0, y1) => { if (axis === 'u') wallBox(mat, p0, p1, s[0], s[1], y0, y1); else wallBox(mat, s[0], s[1], p0, p1, y0, y1); };
    const spans = []; let at = a0;
    for (const o of [...opens].sort((p, q) => p.a - q.a)) { spans.push([at, o.a]); at = o.b; }
    spans.push([at, a1]);
    for (const [p0, p1] of spans) { put(PL, so, p0, p1, ya, yb); put('lime_plaster', si, p0, p1, ya, yb); }
    for (const o of opens) { const lo = ya + o.lo, hi = ya + o.hi; if (o.lo > 0) { put(PL, so, o.a, o.b, ya, lo); put('lime_plaster', si, o.a, o.b, ya, lo); } put(PL, so, o.a, o.b, hi, yb); put('lime_plaster', si, o.a, o.b, hi, yb); }
    return th;
  };
  for (let k = 1; k < n; k++) {
    const ya = Y[k] - 0.15, yb = k + 1 < n ? Y[k + 1] - 0.15 : Y[n], fl = Y[k];
    // front: the openings; back: none; the sides: a window in the middle where an alley runs by
    const fo = win.map((o) => ({ ...o, lo: o.door ? 0.15 : o.lo + 0.15 - 0.0, hi: o.door ? 2.3 : o.hi + 0.15 }));
    run('u', [0, T], 0, L, k === 1 ? fo : fo.filter((o) => !o.door), ya, yb, false);
    run('u', [D - T, D], 0, L, [], ya, yb, true);
    for (const [side, u0, u1] of [['l', 0, T], ['r', L - T, L]]) run('v', [u0, u1], T, D - T, sideW(side) ? [{ a: D / 2 - 0.45, b: D / 2 + 0.45, lo: 1.0, hi: 2.0 }] : [], ya, yb, side === 'l');
    // colliders: the walls whole (the openings of windows are not passages), the front's door left open
    const cr = (u0, u1, v0, v1) => { if (u1 - u0 > 0.02 && v1 - v0 > 0.02) col.rect(Q(u0, u1, v0, v1), ya, yb); };
    if (k === 1) { cr(0, doorO.a, 0, T); cr(doorO.b, L, 0, T); col.rect(Q(doorO.a, doorO.b, 0, T), fl + 2.25, yb); } else cr(0, L, 0, T);
    cr(0, L, D - T, D); cr(0, T, T, D - T); cr(L - T, L, T, D - T);
    // the windows' frames and open shutters on the lane
    for (const o of win) {
      if (o.door) continue;
      const yl = fl + o.lo, yh = fl + o.hi;
      Bx(RED, o.a - 0.1, o.a, -0.06, 0.07, yl - 0.1, yh + 0.1); Bx(RED, o.b, o.b + 0.1, -0.06, 0.07, yl - 0.1, yh + 0.1);
      Bx(RED, o.a - 0.1, o.b + 0.1, -0.06, 0.07, yh, yh + 0.1); Bx(G, o.a - 0.15, o.b + 0.15, -0.0, 0.2, yl - 0.08, yl);
      if (elite && o.b - o.a > 1.0) Bx(RED, (o.a + o.b) / 2 - 0.04, (o.a + o.b) / 2 + 0.04, 0.0, 0.1, yl, yh);
      if (hashAt(o.a, fl, seed)() < 0.75) { Bx('wood_ochre', o.a - 0.42, o.a - 0.04, -0.07, -0.01, yl, yh - 0.05); Bx('wood_ochre', o.b + 0.04, o.b + 0.42, -0.07, -0.01, yl, yh - 0.05); }
    }
  }
  // ── the balcony on the lane at the first floor: planks on corbels, rails of plank, a door to it
  { const w = 2.3, u0 = uB - w / 2, u1 = uB + w / 2, out = 1.1, yb = Y[1];
    Bx('timber', u0, u1, -out, 0.02, yb - 0.12, yb);
    for (let i = 0; i < 4; i++) { const u = u0 + 0.2 + i * (w - 0.4) / 3; Bx('timber', u - 0.07, u + 0.07, -out + 0.1, T, yb - 0.3, yb - 0.12); }
    col.floor(Q(u0, u1, -out, 0), yb);
    const q = Q(u0 - 0.05, u1 + 0.05, -out - 0.05, -out + 0.05); void q;
    rail(u0, u1, -out, -out, yb); rail(u0, u0, -out, 0, yb); rail(u1, u1, -out, 0, yb);
    Bx('timber', uB - 0.7, uB + 0.7, 0.0, 0.14, yb + 2.2, yb + 2.45);
    if (hashAt(uB, 0, seed)() < 0.6) panel(bag, hashAt(uB, 1, seed)() < 0.5 ? 'cloth_red' : 'cloth_indigo', P(u0 + 0.3, -out + 0.03), P(u0 + 1.3, -out + 0.03), yb + 0.15, yb + 0.85); }
  // ── the rooms
  furnishUp(el, ctx, FR, UP, kind, { Bx, Q, free, uB });
  // ── the roof: the hatch's rails stand (above), the parapet is solid, a place to sit
  const roof = Y[n], rect = el.rect, t = 0.22, h = 0.38;
  for (const q of [[rect[0], rect[1], rect[2], rect[1] + t], [rect[0], rect[3] - t, rect[2], rect[3]], [rect[0], rect[1] + t, rect[0] + t, rect[3] - t], [rect[2] - t, rect[1] + t, rect[2], rect[3] - t]]) col.rect(q, roof, roof + h);
  const hatch = holes[n];
  { const r = hashAt(el.rect[0], el.rect[1], seed), a = UP.left ? L - T - 2.4 : T + 0.1, b = a + 2.3, v = D * (0.45 + r() * 0.3);
    Bx(G, a, b, v, v + 0.5, roof, roof + 0.42, true);
    Bx('reed_mat', a + 0.1, b - 0.1, v + 0.9, v + 1.9, roof, roof + 0.03); Bx(r() < 0.5 ? 'cloth_white' : 'cloth_ochre', a + 0.3, a + 1.0, v + 1.0, v + 1.5, roof + 0.03, roof + 0.1); }
  return { hatch };
}

// ── furnished upper rooms ───────────────────────────────────────────────────────────────────
function furnishUp(el, ctx, FR, UP, kind, { Bx, Q, free, uB }) {
  const { bag, col } = ctx, { L, D, P } = FR, Y = UP.Y, n = UP.n, seed = el.seed || 1, vB = D - T - 0.12;
  const farU = UP.left ? L - T - 0.1 : T + 0.1, sg = UP.left ? -1 : 1;         // the far wall and the way in from it
  const fu = (a, w) => W2(farU + sg * a, farU + sg * (a + w));
  const W2 = (p, q) => [Math.min(p, q), Math.max(p, q)];
  const jar = (u, v, y, s0) => {
    const [x, z] = P(u, v), r = hashAt(x, z, seed), k = (s0 ?? 0.5) + r() * 0.1;
    bag.add('terracotta', lathe([[0.001, 0], [0.24 * k, 0], [0.4 * k, 0.4 * k], [0.47 * k, 0.8 * k], [0.5 * k, 0.82 * k], [0.47 * k, 0.86 * k], [0.46 * k, 1.05 * k], [0.34 * k, 1.47 * k], [0.38 * k, 1.52 * k], [0.3 * k, 1.55 * k], [0.001, 1.5 * k]], 10).rotateY(r() * 6).translate(x, y, z));
    col.circle(x, z, 0.47 * k, y, y + 1.5 * k);
  };
  const basket = (u, v, y, fill) => { const [x, z] = P(u, v); bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.28], [0.001, 0.28]], 8).translate(x, y, z)); bag.add(fill, lathe([[0.001, 0.26], [0.22, 0.26], [0.001, 0.38]], 8).translate(x, y, z)); col.circle(x, z, 0.27, y, y + 0.4); };
  const bed = (a, v0, y, len = 1.9) => { const [p, q] = fu(a, 1.1); Bx('timber', p, q, v0, v0 + len, y, y + 0.34, true); Bx('linen', p + 0.04, q - 0.04, v0 + 0.04, v0 + len - 0.04, y + 0.34, y + 0.42); Bx('cloth_red', p + 0.04, q - 0.04, v0 + len * 0.4, v0 + len - 0.04, y + 0.42, y + 0.46); Bx('cloth_white', p + 0.1, q - 0.1, v0 + 0.08, v0 + 0.5, y + 0.42, y + 0.52); };
  const chest = (a, v, y, rotL = true) => { const [x, z] = P(farU + sg * a, v), r = hashAt(x, z, seed), w = 0.8 + r() * 0.3, d = 0.46 + r() * 0.08, [p, q] = [farU + sg * a - d / 2, farU + sg * a + d / 2]; const [pa, pb] = W2(p, q); Bx('wood_dark', pa, pb, v - w / 2, v + w / 2, y, y + 0.5, true); Bx('timber', pa - 0.02, pb + 0.02, v - w / 2 - 0.02, v + w / 2 + 0.02, y + 0.5, y + 0.56); void rotL; };
  const table = (u, v, y, w = 1.2, d = 0.7) => { if (Math.abs(u - uB) < w / 2 + 1.0) return;   // no table in the lane from the balcony door
    Bx('timber', u - w / 2, u + w / 2, v - d / 2, v + d / 2, y + 0.5, y + 0.55); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Bx('timber', u + a * (w / 2 - 0.06) - 0.03, u + a * (w / 2 - 0.06) + 0.03, v + b * (d / 2 - 0.06) - 0.03, v + b * (d / 2 - 0.06) + 0.03, y, y + 0.5); col.rect(Q(u - w / 2, u + w / 2, v - d / 2, v + d / 2), y, y + 0.55); Bx('wood_dark', u - 0.2, u + 0.2, v + d / 2 + 0.2, v + d / 2 + 0.6, y, y + 0.32); };
  const shelf = (a0, a1, v, y, h0) => { const [p, q] = fu(a0, a1 - a0); Bx('timber', p, q, v, v + 0.28, y + h0, y + h0 + 0.04); for (let u = p + 0.12; u < q - 0.05; u += 0.2) { const [x, z] = P(u, v + 0.14); bag.add('terracotta', lathe([[0.001, 0], [0.06, 0], [0.07, 0.1], [0.04, 0.2], [0.001, 0.2]], 6).translate(x, y + h0 + 0.04, z)); } };
  const hearth = (u, v, y) => { Bx('rubble', u - 0.5, u + 0.5, v - 0.5, v + 0.5, y, y + 0.14, true); Bx('lacquer_black', u - 0.38, u + 0.38, v - 0.38, v + 0.38, y + 0.14, y + 0.155); const [x, z] = P(u, v); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0], [0.19, 0.12], [0.15, 0.24], [0.17, 0.26], [0.001, 0.26]], 10).translate(x, y + 0.16, z)); };
  const mat = (u, v, y, w = 0.9, d = 1.8) => Bx('reed_mat', u - w / 2, u + w / 2, v - d / 2, v + d / 2, y, y + 0.03);
  const mid = (free[0] + free[1]) / 2;
  const y1 = Y[1];
  if (kind === 'weaver') {
    // the workroom: a second upright loom by the windows, the weights in their row, baskets of wool, the pole of dyed skeins, a bed in the corner
    const lu = farU + sg * 0.5, lv = D * 0.45;
    for (const dv of [-0.8, 0.8]) Bx('wood_dark', lu - 0.05, lu + 0.05, lv + dv - 0.05, lv + dv + 0.05, y1, y1 + 1.9, true);
    Bx('wood_dark', lu - 0.05, lu + 0.05, lv - 0.85, lv + 0.85, y1 + 1.8, y1 + 1.9); Bx('linen', lu - 0.02, lu + 0.02, lv - 0.75, lv + 0.75, y1 + 0.5, y1 + 1.8); Bx('cloth_indigo', lu - 0.05, lu + 0.05, lv - 0.73, lv + 0.73, y1 + 0.8, y1 + 0.9);
    for (let i = 0; i < 12; i++) { const [x, z] = P(lu, lv - 0.7 + i * 0.127); bag.add('terracotta', lathe([[0.001, 0], [0.045, 0], [0.04, 0.09], [0.001, 0.09]], 6).translate(x, y1 + 0.4, z)); }
    col.rect(Q(lu - 0.1, lu + 0.1, lv - 0.9, lv + 0.9), y1, y1 + 1.9); Bx('wood_dark', lu + sg * 0.5 - 0.2, lu + sg * 0.5 + 0.2, lv - 0.2, lv + 0.2, y1, y1 + 0.38);
    for (let i = 0; i < 3; i++) basket(fu(0.5 + i * 0.55, 0.1)[0], vB - 0.5, y1, i === 1 ? 'cloth_white' : 'cloth_red');
    { const [p] = fu(0.12, 0.1), vs = [D * 0.4, D * 0.62]; for (const v of vs) Bx('timber', p - 0.04, p + 0.04, v - 0.04, v + 0.04, y1, y1 + 1.9, true); Bx('timber', p - 0.03, p + 0.03, vs[0], vs[1], y1 + 1.85, y1 + 1.93); ['cloth_maroon', 'cloth_red', 'cloth_ochre', 'cloth_indigo'].forEach((m, i) => Bx(m, p - 0.07, p + 0.07, vs[0] + 0.1 + i * 0.12 + 0.02, vs[0] + 0.1 + i * 0.12 + 0.12, y1 + 1.0, y1 + 1.85)); }
    bed(0.35, vB - 1.9, y1);
  } else if (kind === 'shop') {
    // the dwelling over the shop: the hearth and its pot, a low table with stools, a shelf of cups, and a curtain across the sleeping place at the back
    hearth(farU + sg * 0.8, D * 0.5, y1); table(farU + sg * 0.6, T + 1.8, y1, 0.8, 1.2); shelf(0.1, 1.9, vB - 0.3, y1, 1.3);
    panel(bag, 'cloth_indigo', P(free[0] + 0.1, vB - 2.3), P(free[1] - 0.1, vB - 2.3), y1 + 0.2, y1 + 2.1);
    bed(0.4, vB - 2.0, y1); chest(0.3, vB - 2.9 + 0.0, y1); jar(fu(1.6, 0.1)[0], vB - 0.6, y1, 0.45); mat(mid, T + 1.2, y1);
  } else if (kind === 'store') {
    // the loft of the store: pithoi in a row along the back, the sacks stacked, baskets, a mat for the watchman
    for (let i = 0; i < 3; i++) jar(fu(0.6 + i * 1.15, 0.1)[0], vB - 0.6, y1, 0.55 + (i % 2) * 0.05);
    for (let i = 0; i < 4; i++) { const [p] = fu(0.25 + (i % 2) * 0.5, 0.4); Bx('sacking', p - 0.22, p + 0.22, T + 0.4 + Math.floor(i / 2) * 0.45, T + 0.8 + Math.floor(i / 2) * 0.45, y1, y1 + 0.3, i === 0); }
    basket(fu(0.5, 0.1)[0], D * 0.5, y1, 'cloth_white'); basket(fu(0.5, 0.1)[0], D * 0.5 + 0.7, y1, 'cloth_red'); mat(mid, D * 0.5, y1); Bx('cloth_ochre', mid - 0.3, mid + 0.3, D * 0.5 - 0.5, D * 0.5 + 0.1, y1 + 0.03, y1 + 0.08);
  } else if (FR.L < 7.4) {
    // a lodging: two cells divided by a plastered partition, a mat and a chest in front, the bed and a jar behind
    const pv = D * 0.5, pa = UP.left ? free[0] + 1.1 : free[0], pb = UP.left ? free[1] : free[1] - 1.1;
    Bx('plaster', pa, pb, pv - 0.06, pv + 0.06, y1, y1 + 2.5, true);
    mat(mid, T + 1.8, y1); chest(0.3, T + 1.4, y1);
    bed(0.4, vB - 2.0, y1); jar(fu(1.9, 0.1)[0], vB - 0.6, y1, 0.45); chest(0.3, vB - 2.8, y1);
  } else {
    // the bedchamber of the merchant's house: the couch on the far wall, chests, the table by the window, a mat, jars
    bed(0.4, vB - 2.0, y1); chest(0.3, vB - 2.8, y1); chest(0.3, vB - 3.6, y1);
    table(farU + sg * 0.6, T + 2.0, y1, 0.8, 1.2); mat(mid, D * 0.5 + 0.3, y1, 1.6, 2.2); jar(fu(1.9, 0.1)[0], vB - 0.6, y1, 0.5); jar(fu(2.9, 0.1)[0], vB - 0.55, y1, 0.45);
    for (let i = 0; i < 5; i++) { const [x, z] = P(farU + sg * 0.6 - 0.35 + i * 0.17, T + 2.0); bag.add('terracotta', lathe([[0.001, 0], [0.03, 0], [0.05, 0.07], [0.045, 0.07], [0.025, 0.01], [0.001, 0.01]], 7).scale(1.7, 1.7, 1.7).translate(x, y1 + 0.55, z)); }
  }
  // the second floor of a three-storey house: the loft, jars and sacks and a chest
  if (n === 3) {
    const y2 = Y[2];
    for (let i = 0; i < 3; i++) jar(fu(0.6 + i * 1.1, 0.1)[0], vB - 0.6, y2, 0.5 + (i % 2) * 0.06);
    chest(0.3, D * 0.5, y2); basket(fu(1.2, 0.1)[0], D * 0.5 + 0.3, y2, 'cloth_white');
    for (let i = 0; i < 3; i++) { const [p] = fu(0.25 + (i % 2) * 0.5, 0.4); Bx('sacking', p - 0.22, p + 0.22, T + 0.4 + Math.floor(i / 2) * 0.45, T + 0.8 + Math.floor(i / 2) * 0.45, y2, y2 + 0.3, i === 0); }
  }
}
