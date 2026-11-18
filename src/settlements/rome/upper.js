// The upper floors of Rome's houses one walks into (docs/settlements/rome.md §4.16): the kit. A house is built in a local frame
// (u along the front, d deep into the building, heights above its base); this file holds the pieces every house shares —
// timber floors that are colliders with their openings, walls with doorways and real window reveals, timber stairs walked on a
// ramp, rails, a balcony on corbels — and the furnishing of a room by its use (sleeping, storing, working, living). The shell of
// a house (walls, floors, stairs) goes into the plan of the street; the furnishing into a small plan shown within 55 m
// (`rome-site`, element `up_cells`), so that the arrival frame is not touched.

import { box, lathe, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

/** A hash of a position (and a seed) in [0, 1): the variety of repeated pieces comes from where they stand, never from a shared counter. */
export function hash(a, b = 0, c = 0) {
  let h = (Math.imul(Math.round(a * 64) | 0, 374761393) ^ Math.imul(Math.round(b * 64) | 0, 668265263) ^ Math.imul(Math.round(c * 64) | 0, 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/**
 * The tools of a house in a frame: P(u, d) → [x, z] places the frame in the world; y is the height of its base.
 * B(mat, u0, u1, d0, d1, ya, yb, solid) adds a block (and an obstacle when solid), V a lathe piece, C a round obstacle, L a lamp.
 */
export function makeT(ctx, y, P) {
  const { bag, col, lights } = ctx;
  const R = (u0, u1, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, u1, d0, d1, ya, yb, solid = false) => {
    if (u1 - u0 < 1e-5 || d1 - d0 < 1e-5 || yb - ya < 1e-5) return;
    const r = R(u0, u1, d0, d1);
    bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3]));
    if (solid) col.rect(r, y + ya, y + yb);
  };
  const V = (mat, prof, u, d, ya = 0, n = 10, tilt = 0) => { const p = P(u, d), g = lathe(prof, n); if (tilt) g.rotateX(tilt); g.translate(p[0], y + ya, p[1]); bag.add(mat, g); };
  const C = (u, d, r, ya, yb) => { const p = P(u, d); col.circle(p[0], p[1], r, y + ya, y + yb); };
  const L = (u, d, ya, color, intensity, distance) => { const p = P(u, d); lights.push({ at: [p[0], y + ya, p[1]], color, intensity, distance }); };
  /** the world direction ('n' | 's' | 'e' | 'w') of a local one ('+d' | '-d' | '+u' | '-u') */
  const dirW = (dir) => {
    const a = P(0, 0), b = dir[1] === 'd' ? P(0, 1) : P(1, 0), s = dir[0] === '+' ? 1 : -1, dx = (b[0] - a[0]) * s, dz = (b[1] - a[1]) * s;
    return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
  };
  return { y, P, R, B, V, C, L, bag, col, lights, dirW };
}
/** A room's own frame: a along the wall opposite the door, b from that wall (0) to the door's wall (length L); heights above the floor yf. */
export function roomT(T, [u0, u1, d0, d1], doorSide, yf) {
  const P2 = doorSide === 'd1' ? (a, b) => T.P(u0 + a, d0 + b) : doorSide === 'd0' ? (a, b) => T.P(u0 + a, d1 - b)
    : doorSide === 'u1' ? (a, b) => T.P(u0 + b, d0 + a) : (a, b) => T.P(u1 - b, d0 + a);
  const T2 = makeT({ bag: T.bag, col: T.col, lights: T.lights }, T.y + yf, P2);
  T2.w = doorSide[0] === 'd' ? u1 - u0 : d1 - d0; T2.len = doorSide[0] === 'd' ? d1 - d0 : u1 - u0;
  return T2;
}

/** The rectangles of `rects` that remain when `h` is taken out. */
export function minus(rects, h) {
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
}

/**
 * A timber floor over a rect [u0, u1, d0, d1] whose top is at yTop: boards 0.15 thick on joists 0.3 deep, a collider to walk on
 * wherever there is no opening (`holes`, rects in the same frame).
 */
export function slab(T, rect, yTop, holes = [], { mat = 'timber', joists = true } = {}) {
  let pieces = [rect];
  for (const h of holes) pieces = minus(pieces, h);
  for (const [a, b, c, d] of pieces) {
    if (b - a < 0.02 || d - c < 0.02) continue;
    T.B(mat, a, b, c, d, yTop - 0.15, yTop);
    T.col.floor(T.R(a, b, c, d), T.y + yTop);
    if (joists) for (let u = a + 0.25; u < b - 0.1; u += 0.75) T.B('wood_dark', u - 0.07, u + 0.07, c, d, yTop - 0.45, yTop - 0.15);
  }
}

/**
 * A wall along u (alongU: at depth c…c+t, from a to b) or along d (at u = c…c+t); y0…y1; `holes` [{ a, b, ya, yb }] are doorways and
 * windows (heights above the base; a doorway has ya = y0). Solid: it collides.
 */
export function wall(T, mat, alongU, c, t, a, b, y0, y1, holes = [], solid = true) {
  const put = (p, q, ya, yb) => {
    if (q - p < 1e-3 || yb - ya < 1e-3) return;
    if (alongU) T.B(mat, p, q, c, c + t, ya, yb, solid); else T.B(mat, c, c + t, p, q, ya, yb, solid);
  };
  const cuts = [...new Set([a, b, ...holes.flatMap((h) => [h.a, h.b])])].sort((m, n) => m - n);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const p = cuts[i], q = cuts[i + 1];
    if (q - p < 1e-3) continue;
    let yy = y0;
    for (const h of holes.filter((k) => k.a <= p + 1e-6 && k.b >= q - 1e-6).sort((m, n) => m.ya - n.ya)) { put(p, q, yy, h.ya); yy = Math.max(yy, h.yb); }
    put(p, q, yy, y1);
  }
}

/**
 * A timber stair on a ramp: the steps are blocks from yA up to their treads, the collider a ramp over the same rect (the walker
 * follows it). up is the way up in the frame: '+d' | '-d' | '+u' | '-u'; n steps.
 */
export function flight(T, { u0, u1, d0, d1, up, yA, yB, n, mat = 'timber' }) {
  const along = up[1] === 'd', lo = along ? d0 : u0, hi = along ? d1 : u1, tread = (hi - lo) / n, rise = (yB - yA) / n, pos = up[0] === '+';
  for (let k = 0; k < n; k++) {
    const s0 = pos ? lo + k * tread : hi - (k + 1) * tread, s1 = s0 + tread, top = yA + (k + 1) * rise;
    if (along) T.B(mat, u0, u1, s0, s1, yA, top); else T.B(mat, s0, s1, d0, d1, yA, top);
    if (k % 2) { if (along) T.B('wood_dark', u0, u1, pos ? s1 - 0.03 : s0, pos ? s1 : s0 + 0.03, top - 0.02, top + 0.005); else T.B('wood_dark', pos ? s1 - 0.03 : s0, pos ? s1 : s0 + 0.03, d0, d1, top - 0.02, top + 0.005); }
  }
  T.col.ramp(T.R(u0, u1, d0, d1), T.y + yA, T.y + yB, T.dirW(up));
}
/** A sloped handrail on posts along a flight's open side (lateral coordinate `lat`), and a thin obstacle beside the ramp so that one does not step off. */
export function flightRail(T, f, lat, side = 1) {
  const along = f.up[1] === 'd', lo = along ? f.d0 : f.u0, hi = along ? f.d1 : f.u1, pos = f.up[0] === '+';
  const pt = (s, yy) => { const p = along ? T.P(lat, s) : T.P(s, lat); return [p[0], T.y + yy, p[1]]; };
  const s0 = pos ? lo : hi, s1 = pos ? hi : lo, h = 0.92;
  T.bag.add('timber', rod(pt(s0, f.yA + h), pt(s1, f.yB + h), 0.035, 6));
  const n = Math.max(2, Math.round(Math.abs(hi - lo) / 1.0));
  for (let k = 0; k <= n; k++) {
    const s = s0 + (s1 - s0) * k / n, yy = f.yA + (f.yB - f.yA) * k / n;
    if (along) T.B('timber', lat - 0.035, lat + 0.035, s - 0.035, s + 0.035, yy, yy + h); else T.B('timber', s - 0.035, s + 0.035, lat - 0.035, lat + 0.035, yy, yy + h);
  }
  // (the obstacle begins a seventh up the flight and stops 0.7 m short of its top, so that one can step on and off from the side)
  const e = 0.08, len = hi - lo, o0 = pos ? lo + len / 7 : lo + 0.7, o1 = pos ? hi - 0.7 : hi - len / 7, yy0 = T.y + Math.min(f.yA, f.yB) + 0.3, yy1 = T.y + Math.max(f.yA, f.yB) + 1.0;
  if (along) T.col.rect(T.R(side > 0 ? lat : lat - e, side > 0 ? lat + e : lat, o0, o1), yy0, yy1);
  else T.col.rect(T.R(o0, o1, side > 0 ? lat : lat - e, side > 0 ? lat + e : lat), yy0, yy1);
}
/** A timber rail along a line (u0, d0) → (u1, d1) (one of them constant) at height yBase: posts, a top rail, a mid rail; it collides. */
export function fence(T, u0, d0, u1, d1, yBase, h = 0.95, post = 'timber') {
  const alongU = Math.abs(u1 - u0) >= Math.abs(d1 - d0), len = alongU ? Math.abs(u1 - u0) : Math.abs(d1 - d0), n = Math.max(1, Math.round(len / 1.1));
  const lo = alongU ? Math.min(u0, u1) : Math.min(d0, d1), c = alongU ? d0 : u0;
  for (let k = 0; k <= n; k++) { const s = lo + len * k / n; if (alongU) T.B(post, s - 0.04, s + 0.04, c - 0.04, c + 0.04, yBase, yBase + h); else T.B(post, c - 0.04, c + 0.04, s - 0.04, s + 0.04, yBase, yBase + h); }
  for (const yy of [h - 0.06, h * 0.5]) { if (alongU) T.B(post, lo, lo + len, c - 0.03, c + 0.03, yBase + yy, yBase + yy + 0.06); else T.B(post, c - 0.03, c + 0.03, lo, lo + len, yBase + yy, yBase + yy + 0.06); }
  if (alongU) T.col.rect(T.R(lo, lo + len, c - 0.05, c + 0.05), T.y + yBase, T.y + yBase + h); else T.col.rect(T.R(c - 0.05, c + 0.05, lo, lo + len), T.y + yBase, T.y + yBase + h);
}

/** The dressing of a window in a front wall (face at d = 0, the street at d < 0): a sill, a lintel, shutters standing open, a pot on the sill, the washing or nothing. */
export function windowDress(T, uc, hw, ya, yb, h) {
  T.B('travertine', uc - hw - 0.1, uc + hw + 0.1, -0.14, 0.0, ya - 0.09, ya);
  T.B('travertine', uc - hw - 0.08, uc + hw + 0.08, -0.06, 0.0, yb, yb + 0.14);
  const leaf = 0.2 + 0.25 * hash(uc, ya, 3);                                               // how far the shutters stand open
  if (h < 0.7) for (const s of [-1, 1]) T.B('wood_dark', s < 0 ? uc - hw - leaf : uc + hw, s < 0 ? uc - hw : uc + hw + leaf, -0.07, -0.015, ya, yb);
  else if (h < 0.85) T.B('wood_dark', uc + hw, uc + hw + 0.45, -0.07, -0.015, ya, yb);
  if (h > 0.5) {
    T.V('terracotta', [[0.001, 0], [0.09, 0], [0.11, 0.18], [0.12, 0.2], [0.09, 0.2]], uc - 0.25, -0.12, ya, 8);
    T.V('cloth_red', [[0.001, 0], [0.12, 0.05], [0.14, 0.16], [0.07, 0.26], [0.001, 0.3]], uc - 0.25, -0.12, ya + 0.2, 8);
  }
}
/** A balcony (maenianum) on corbels in front of a wall at d = 0 from u0 to u1, its floor at yF, projecting `out`: floor, brackets, rail; one steps onto it. */
export function balcony(T, u0, u1, yF, out = 1.15) {
  T.B('timber', u0, u1, -out, 0.02, yF - 0.16, yF);
  for (let u = u0 + 0.35; u < u1 - 0.2; u += 1.3) { T.B('travertine', u - 0.12, u + 0.12, -out + 0.1, 0.02, yF - 0.62, yF - 0.16); T.B('travertine', u - 0.1, u + 0.1, -out + 0.04, -out + 0.22, yF - 0.3, yF - 0.16); }
  T.col.floor(T.R(u0, u1, -out, 0.0), T.y + yF);
  fence(T, u0, -out + 0.05, u1, -out + 0.05, yF); fence(T, u0 + 0.05, -out + 0.05, u0 + 0.05, 0, yF); fence(T, u1 - 0.05, -out + 0.05, u1 - 0.05, 0, yF);
}

// ── the furnishing of a room by its use ───────────────────────────────────────────────────────────────────────
const AMPH = [[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.9], [0.06, 0.95], [0.001, 0.95]];
const JUG = [[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.03, 0.24], [0.04, 0.26], [0.001, 0.26]];
const SACK = [[0.001, 0], [0.18, 0.02], [0.2, 0.18], [0.12, 0.38], [0.06, 0.44], [0.001, 0.45]];
const COVER = ['cloth_maroon', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_green'];
/** A bed (lectus) of timber with a mattress, a bolster and a cover; a, b its corner, w × l; alongB: the long side runs from the far wall. */
export function bed(T, a, b, alongB = true, w = 0.9, l = 1.95, cover = 'cloth_maroon') {
  const [a1, b1] = alongB ? [a + w, b + l] : [a + l, b + w];
  T.B('wood_dark', a, a1, b, b1, 0, 0.42); T.col.rect(T.R(a, a1, b, b1), T.y, T.y + 1.0);
  T.B('linen', a + 0.04, a1 - 0.04, b + 0.04, b1 - 0.04, 0.42, 0.56);
  if (alongB) { T.B(cover, a + 0.05, a1 - 0.05, b + 0.55, b1 - 0.05, 0.56, 0.585); T.B('linen', a + 0.1, a1 - 0.1, b + 0.08, b + 0.4, 0.56, 0.68); T.B('wood_dark', a, a1, b, b + 0.07, 0.42, 0.95); }
  else { T.B(cover, a + 0.55, a1 - 0.05, b + 0.05, b1 - 0.05, 0.56, 0.585); T.B('linen', a + 0.08, a + 0.4, b + 0.1, b1 - 0.1, 0.56, 0.68); T.B('wood_dark', a, a + 0.07, b, b1, 0.42, 0.95); }
}
/** A chest bound in bronze. */
export function chest(T, a, b, w = 0.8, d = 0.5) { T.B('wood_dark', a, a + w, b, b + d, 0, 0.55, true); T.B('bronze', a, a + w, b + d * 0.46, b + d * 0.54, 0.2, 0.56); T.B('wood_dark', a - 0.01, a + w + 0.01, b - 0.01, b + d + 0.01, 0.55, 0.6); }
export function stool(T, a, b) { T.V('timber', [[0.001, 0], [0.17, 0.0], [0.17, 0.43], [0.001, 0.43]], a, b, 0, 8); T.C(a, b, 0.17, 0, 0.43); }
export function table(T, a, b, w = 1.3, d = 0.8) {
  T.B('timber', a - w / 2, a + w / 2, b - d / 2, b + d / 2, 0.72, 0.77, true);
  for (const [p, q] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) T.B('timber', a + p * (w / 2 - 0.08) - 0.04, a + p * (w / 2 - 0.08) + 0.04, b + q * (d / 2 - 0.08) - 0.04, b + q * (d / 2 - 0.08) + 0.04, 0, 0.72);
}
export function lamp(T, a, b, ya, light = true) {
  T.V('glass_lamp', [[0.001, 0], [0.04, 0], [0.045, 0.1], [0.001, 0.12]], a, b, ya, 8);
  if (light) T.L(a, b, ya + 0.3, '#ffb46b', 0.6, 3.5);
}
export function brazier(T, a, b) {
  T.V('bronze', [[0.001, 0.3], [0.2, 0.34], [0.26, 0.44], [0.24, 0.45], [0.001, 0.36]], a, b, 0, 12);
  for (const s of [-1, 0, 1]) T.B('iron', a + s * 0.13 - 0.015, a + s * 0.13 + 0.015, b - 0.08 * Math.abs(s) - 0.015, b - 0.08 * Math.abs(s) + 0.015, 0, 0.32);
  T.V('flame', [[0.001, 0], [0.05, 0.02], [0.001, 0.09]], a, b, 0.42, 6);
  T.C(a, b, 0.27, 0, 0.45);
  T.L(a, b, 0.8, '#ff8a3a', 0.9, 4);
}
const shelf = (T, a0, a1, b, y, rows, rnd) => { T.B('timber', a0, a1, b, b + 0.3, y, y + 0.05); for (let a = a0 + 0.2; a < a1 - 0.1; a += 0.3) T.V(rnd(a, y) < 0.5 ? 'terracotta' : 'pottery_dark', JUG, a, b + 0.15, y + 0.05, 8); void rows; };

/**
 * The furniture of one room by its use: role 'sleep' | 'store' | 'work' | 'living' | 'cenaculum' (a poor room up under the tiles),
 * in the room's frame (a along the far wall, b toward the door, the door at the end of the lane a = dc, width 1.2).
 */
export function furnish(T, role, w, L, dc, seed) {
  const h = (a, b, c = 0) => hash(a, b, seed + c), lane = (a0, a1) => a1 > dc - 0.75 && a0 < dc + 0.75;
  const left = dc > w / 2;                                                                   // the door nearer the right: things go to the left
  if (role === 'sleep') {
    const two = w > 4.6;
    bed(T, left ? 0.12 : w - 1.02, 0.15, true, 0.9, 1.95, COVER[Math.floor(h(w, L) * 5)]);
    if (two) bed(T, left ? 1.2 : w - 2.1, 0.15, true, 0.9, 1.95, COVER[Math.floor(h(L, w, 1) * 5)]);
    chest(T, left ? w - 1.0 : 0.15, 0.2, 0.8, 0.5);
    if (!lane(left ? 0.1 : w - 0.9, left ? 0.9 : w - 0.1)) { /* (a stand for the basin and jug) */ }
    T.B('timber', left ? w - 0.5 : 0.1, left ? w - 0.1 : 0.5, L * 0.45, L * 0.45 + 0.4, 0, 0.7, true); T.V('terracotta', JUG, left ? w - 0.3 : 0.3, L * 0.45 + 0.2, 0.7, 8);
    T.B('reed_mat', 1.4, w - 1.4, 1.0, L - 1.5, 0, 0.012);
    lamp(T, left ? 0.5 : w - 0.5, 2.55, 0.0, false); T.B('wood_dark', left ? 0.35 : w - 0.65, left ? 0.65 : w - 0.35, 2.4, 2.7, 0, 0.5, true); lamp(T, left ? 0.5 : w - 0.5, 2.55, 0.5, true);
  } else if (role === 'store') {
    for (let r = 0; r < 2; r++) for (let k = 0; k < Math.floor((w - 0.5) / 0.46); k++) { const a = 0.35 + k * 0.46 + (r ? 0.2 : 0), t = (k + r) % 2 ? 0.2 : -0.2; T.V('terracotta', AMPH, a, 0.35 + r * 0.55, 0, 10, t); }
    T.B('timber', 0.1, w - 0.1, 0.05, 0.12, 1.2, 1.25); for (let a = 0.3; a < w - 0.3; a += 0.4) T.V(h(a, 1) < 0.5 ? 'terracotta' : 'pottery_dark', JUG, a, 0.4, 1.25, 8);
    for (let k = 0; k < 4; k++) T.V('sacking', SACK, left ? w - 0.35 : 0.35, 1.5 + k * 0.5 + (lane(0, 0) ? 0 : 0), 0, 8);
    T.B('wood_dark', left ? w - 1.4 : 0.9, left ? w - 0.9 : 1.4, 0.2, 0.7, 0, 0.45, true);
    T.B('timber', left ? 0.1 : w - 1.1, left ? 1.1 : w - 0.1, L * 0.45, L * 0.45 + 0.9, 0, 0.8, true);     // a crate or two
    T.B('wood_dark', left ? 0.15 : w - 1.05, left ? 1.05 : w - 0.15, L * 0.45 + 0.05, L * 0.45 + 0.85, 0.8, 0.84);
  } else if (role === 'work') {
    const lu = left ? w * 0.35 : w * 0.65;
    for (const s of [-0.7, 0.7]) T.B('wood_dark', lu + s - 0.05, lu + s + 0.05, 0.35, 0.45, 0, 2.2, true);
    T.B('wood_dark', lu - 0.75, lu + 0.75, 0.33, 0.47, 2.1, 2.2); T.B('wood_dark', lu - 0.75, lu + 0.75, 0.33, 0.47, 0.9, 0.98);
    for (let u = lu - 0.62; u < lu + 0.65; u += 0.08) T.B('linen', u, u + 0.012, 0.39, 0.4, 0.98, 2.1);
    T.B('cloth_ochre', lu - 0.62, lu + 0.62, 0.395, 0.425, 0.98, 1.4);
    for (let u = lu - 0.6; u < lu + 0.62; u += 0.2) T.V('terracotta', [[0.001, 0], [0.04, 0], [0.04, 0.09], [0.001, 0.09]], u, 0.4, 0.45, 6);
    stool(T, lu, 1.1);
    T.V('wicker', [[0.2, 0], [0.26, 0.2], [0.001, 0.2]], left ? w - 0.5 : 0.5, 0.5, 0, 10);
    table(T, left ? w - 1.2 : 1.2, L * 0.55, 1.4, 0.7);
    for (let k = 0; k < 4; k++) T.B(['cloth_red', 'cloth_indigo', 'linen', 'cloth_ochre'][k], (left ? w - 1.2 : 1.2) - 0.55, (left ? w - 1.2 : 1.2) + 0.55, L * 0.55 - 0.3 + k * 0.02, L * 0.55 + 0.3 - k * 0.02, 0.77 + k * 0.06, 0.83 + k * 0.06);
    lamp(T, left ? w - 0.5 : 0.5, 1.2, 0, false);
  } else if (role === 'living') {
    table(T, w * (left ? 0.38 : 0.62), L * 0.5, 1.3, 0.8);
    for (const [da, db] of [[-0.95, 0], [0.95, 0], [0, 0.7]]) stool(T, w * (left ? 0.38 : 0.62) + da, L * 0.5 + db);
    T.V('terracotta', JUG, w * (left ? 0.38 : 0.62) - 0.3, L * 0.5, 0.77, 8); T.V('pottery_dark', JUG, w * (left ? 0.38 : 0.62) + 0.3, L * 0.5 + 0.1, 0.77, 8);
    brazier(T, left ? w - 0.5 : 0.5, 0.5);
    shelf(T, left ? w - 2.2 : 0.2, left ? w - 0.2 : 2.2, 0.05, 1.3, 1, (a, y) => h(a, y));
    T.B('timber', left ? 0.1 : w - 0.6, left ? 0.6 : w - 0.1, 1.2, L - 1.6, 0, 0.42, true);              // a bench along the wall
    T.B('lacquer_black', 0.0, w, 0.0, 0.01, 0.0, 0.0); lamp(T, left ? w * 0.38 : w * 0.62, L * 0.5, 0.77, true);
  } else {                                                                                  // cenaculum: a poor room up under the tiles
    T.B('reed_mat', left ? 0.2 : w - 2.2, left ? 2.2 : w - 0.2, 0.2, 1.1, 0, 0.03);
    T.B('linen', left ? 0.3 : w - 1.0, left ? 1.0 : w - 0.3, 0.3, 0.7, 0.03, 0.16); T.B(COVER[Math.floor(h(w, L, 4) * 5)], left ? 0.3 : w - 2.1, left ? 2.1 : w - 0.3, 0.7, 1.0, 0.03, 0.08);
    if (w > 3.4) { T.B('reed_mat', left ? 2.3 : 0.2, left ? w - 0.2 : 2.3, 0.2, 1.0, 0, 0.03); T.B('linen', left ? 2.4 : w - 1.0 - 1.4, left ? 3.0 : w - 1.4, 0.3, 0.7, 0.03, 0.15); }
    chest(T, left ? w - 0.9 : 0.1, 1.6, 0.75, 0.45);
    T.V('terracotta', [[0.001, 0], [0.12, 0], [0.16, 0.2], [0.17, 0.4], [0.1, 0.55], [0.001, 0.55]], left ? w - 0.4 : 0.4, L - 1.8, 0, 10); T.C(left ? w - 0.4 : 0.4, L - 1.8, 0.17, 0, 0.55);
    brazier(T, left ? 1.5 : w - 1.5, L * 0.6);
    T.V('wicker', [[0.16, 0], [0.2, 0.18], [0.001, 0.18]], left ? w - 0.35 : 0.35, 2.6, 0, 8);
  }
}

/** The element `up_cells` of the style `rome-site`: the furnishing of the rooms of a house, each room { rect [u0, u1, d0, d1], door ('d0' | 'd1' | 'u0' | 'u1'), dc, y, role }. */
export function furnishElement(el, ctx) {
  const T = makeT(ctx, el.y ?? 0, frameOf(el));
  for (const r of el.rooms) {
    const T2 = roomT(T, r.rect, r.door, r.y);
    furnish(T2, r.role, T2.w, T2.len, r.dc, Math.round(r.rect[0] * 7 + r.rect[2] * 13 + r.y * 29));
  }
  if (el.solarium) solariumFurn(T, el.solarium.W, el.solarium.blk, el.solarium.y);
  for (const h of el.halls ?? []) hallFurn(T, h.rect, h.y, Math.round(h.rect[0] * 5 + h.y * 17));
}
/** A medianum (the hall the rooms open on): a bench, a chest, jars, a lamp on a bracket. */
export function hallFurn(T, [u0, u1, d0, d1], yf, seed) {
  const T2 = makeT({ bag: T.bag, col: T.col, lights: T.lights }, T.y + yf, T.P);
  const n = Math.max(1, Math.floor((u1 - u0) / 5));
  for (let k = 0; k < n; k++) {
    const c = u0 + (k + 0.5) * (u1 - u0) / n, h = hash(c, d0, seed);
    T2.B('timber', c - 0.7, c + 0.7, d1 - 0.45, d1 - 0.05, 0.4, 0.45, true); for (const s of [-0.6, 0.6]) T2.B('timber', c + s - 0.04, c + s + 0.04, d1 - 0.4, d1 - 0.1, 0, 0.4);
    if (h < 0.6) T2.V('terracotta', [[0.001, 0], [0.12, 0], [0.16, 0.2], [0.17, 0.4], [0.1, 0.55], [0.001, 0.55]], c + 1.3, d1 - 0.3, 0, 10);
    T2.B('timber', c - 0.1, c + 0.1, d1 - 0.3, d1, 2.1, 2.15); lamp(T2, c, d1 - 0.2, 2.15, true);
  }
}
/** The frame of an element { rect, front }: the street frame of src/styles/roman/street.js (u along the front, d deep). */
export function frameOf(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's';
  if (el.flat) return flatFrame(el);
  return f === 's' ? (u, d) => [x0 + u, z1 - d] : f === 'n' ? (u, d) => [x0 + u, z0 + d] : f === 'e' ? (u, d) => [x1 - d, z0 + u] : (u, d) => [x0 + d, z0 + u];
}
void Matrix4;

/** The context with everything the shared builder put above `ymin` (heights above y) inside the world rect `rect` left out: its ceiling and its hip, which are built again here. */
export function dropAbove(ctx, y, ymin, rect) {
  const gone = (g) => {
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    return b.min.y >= y + ymin && b.max.x > rect[0] && b.min.x < rect[2] && b.max.z > rect[1] && b.min.z < rect[3];
  };
  const bag = new Proxy(ctx.bag, { get(t, k) { if (k === 'add') return (m, g) => { if (!gone(g)) t.add(m, g); }; const v = t[k]; return typeof v === 'function' ? v.bind(t) : v; } });
  return { ...ctx, bag };
}
/** A frame turned about the wall at d = dFace so that the outside (d > dFace in the house's frame) is its d < 0: for a balcony on a back wall. */
export function backT(T, dFace) { return makeT({ bag: T.bag, col: T.col, lights: T.lights }, T.y, (u, d) => T.P(u, dFace - d)); }
/** The roof terrace of a fuller's: drying racks with cloth hung on them, a wicker bleaching frame, jars, a tub. */
export function solariumFurn(T, W, blk, yf) {
  const T2 = makeT({ bag: T.bag, col: T.col, lights: T.lights }, T.y + yf, T.P);
  for (let k = 0; k < 3; k++) {
    const d = 3.2 + k * 0.9 - (k === 2 ? 0.6 : 0);
    for (const u of [4.0, 9.0 + k]) { T2.B('timber', u - 0.05, u + 0.05, d - 0.05, d + 0.05, 0, 1.8, true); T2.B('timber', u + 3.4 - 0.05, u + 3.4 + 0.05, d - 0.05, d + 0.05, 0, 1.8, true); T2.B('timber', u, u + 3.4, d - 0.03, d + 0.03, 1.75, 1.82); T2.B(['cloth_white', 'linen', 'cloth_ochre'][(k + Math.floor(u)) % 3], u + 0.1, u + 3.3, d - 0.015, d + 0.015, 0.7, 1.75); }
  }
  T2.V('wicker', [[0.8, 0], [0.7, 0.5], [0.5, 1.1], [0.25, 1.5], [0.001, 1.7]], W - 2.6, 4.6, 0, 12); T2.C(W - 2.6, 4.6, 0.8, 0, 1.7);
  for (const u of [W - 1.5, W - 1.0]) { T2.V('terracotta', [[0.001, 0], [0.12, 0], [0.16, 0.2], [0.17, 0.4], [0.1, 0.55], [0.001, 0.55]], u, 1.3, 0, 10); T2.C(u, 1.3, 0.17, 0, 0.55); }
  T2.V('wood_dark', [[0.001, 0], [0.5, 0], [0.55, 0.5], [0.001, 0.5]], 7.0, 1.2, 0, 12); T2.C(7.0, 1.2, 0.55, 0, 0.5);
}

/** The frame of an insula one walks into (src/settlements/rome/flats.js), which turns a little differently on its other fronts. */
export function flatFrame(el) {
  const [X0, Z0, X1, Z1] = el.rect, f = el.front ?? 's';
  return (u, d) => (f === 's' ? [X0 + u, Z1 - d] : f === 'n' ? [X1 - u, Z0 + d] : f === 'e' ? [X1 - d, Z1 - u] : [X0 + d, Z0 + u]);
}
