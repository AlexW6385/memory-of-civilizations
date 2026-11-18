// The upper floors of the open houses of Victorian London about 1870 (docs/settlements/london.md §9): the dogleg stair of the
// hall with its balusters, the half landings, the first-floor drawing room, the bedrooms above and the servants' attic under the roof; the
// shop's parlour over it, the pub's club room and letting rooms. Everything is drawn in the frame of the lot, u along the street from the
// side wall nearest the stair (mirrored where the stair stands on the street's other side), v inward from the front face.
//
// The floors are real colliders (a slab of boards under a plaster ceiling, open over the stairwell); the stair is a pair of ramps with
// treads laid on them (ramp raised half a riser, so the feet rest on the middle of each tread), a half landing at the back; the
// windows are holes in the walls with a frame and a pane in them, and the walls are colliders right across (glass).
import { box, lathe, rod } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';

export const T = 0.34, SIDE = 0.22, SLAB = 0.25;
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (r, a) => a[Math.floor(r() * a.length)];
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The frame of a lot: (u, v) → world, mirrored where M; boxes, colliders, floors, ramps, lathes, rods and people in it. */
export function frame(el, ctx, M) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, f = el.front, L = x1 - x0, D = z1 - z0, y = el.y ?? 0;
  const P = (u, v) => [x0 + (M ? L - u : u), f === 's' ? z1 - v : z0 + v];
  const R = (u0, u1, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, u1, ya, yb, v0, v1) => { const r = R(u0, u1, v0, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); };
  const C = (u0, u1, ya, yb, v0, v1) => col.rect(R(u0, u1, v0, v1), ya, yb);
  const W = (m, u0, u1, ya, yb, v0, v1) => { B(m, u0, u1, ya, yb, v0, v1); C(u0, u1, ya, yb, v0, v1); };
  const FL = (u0, u1, v0, v1, yy) => col.floor(R(u0, u1, v0, v1), yy);
  const RP = (u0, u1, v0, v1, ya, yb, dv) => col.ramp(R(u0, u1, v0, v1), ya, yb, (dv > 0) === (f === 's') ? 'n' : 's');
  // small round things are drawn as boxes of their own radius and height: they merge into the house's mesh per material (a lathe would be a prototype of its own, a draw more)
  const LA = (m, prof, n, u, yy, v) => { const p = P(u, v), r = Math.max(...prof.map((q) => q[0])) * 0.85, y0 = Math.min(...prof.map((q) => q[1])), y1 = Math.max(...prof.map((q) => q[1])); bag.add(m, box(p[0] - r, yy + y0, p[1] - r, p[0] + r, yy + Math.max(y1, y0 + 0.01), p[1] + r)); void n; };
  // a rail is laid as a run of short boxes along its line (merged into the house's mesh like the rest)
  const ROD = (m, a, b, r) => { const p = P(a[0], a[2]), q = P(b[0], b[2]), k = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1], b[1] - a[1]) / 0.25)); for (let i = 0; i < k; i++) { const t0 = i / k, t1 = (i + 1) / k, x0 = lerp(p[0], q[0], t0), x1 = lerp(p[0], q[0], t1), z0 = lerp(p[1], q[1], t0), z1 = lerp(p[1], q[1], t1), y0 = lerp(a[1], b[1], t0), y1 = lerp(a[1], b[1], t1); bag.add(m, box(Math.min(x0, x1) - r, Math.min(y0, y1) - r, Math.min(z0, z1) - r, Math.max(x0, x1) + r, Math.max(y0, y1) + r, Math.max(z0, z1) + r)); } };
  const who = (u, v, yy, toward, o) => { return; const at = P(u, v), to = P(toward[0], toward[1]); figure({ t: 'figure', at, y: yy, rot: Math.atan2(-(to[0] - at[0]), -(to[1] - at[1])), h: 1.56 + (((u * 7 + v * 3) % 1 + 1) % 1) * 0.1, skin: 'skin_light', feet: 'shod', seed: Math.floor(u * 977 + v * 331) + 13, ...o }, ctx); };
  return { x0, z0, x1, z1, f, L, D, y, M, P, R, B, C, W, FL, RP, LA, ROD, who, bag, col };
}

// ── the stair ────────────────────────────────────────────────────────────────
/** The stair hall's zone: two strips of a flight side by side (a: up toward the back, b: back toward the front) and the half landing across the back. */
export function zoneOf(D, hw, N, run = 0.24) {
  const vEnd = D - T, ze = vEnd - 1.1, zs = ze - N * run, wa = (hw - SIDE - 0.06) / 2;
  return { hw, vEnd, ze, zs, N, run, ua0: SIDE, ua1: SIDE + wa, ub0: SIDE + wa + 0.06, ub1: hw };
}
/**
 * One storey of the dogleg, from the floor at fa up to the floor at fb: flight 1 in strip a toward the back (v rising), the half landing across the
 * back, flight 2 in strip b toward the front arriving at fb at v = zs. Treads on the ramps; base: the solid under the treads (the ground flight: a cupboard
 * under the stair), else each tread a deep board on its stringer; balusters on the strips' inner edges, a handrail on rods, three newel posts.
 */
export function dogleg(K, Z, fa, fb, o = {}) {
  const { B, C, FL, RP, ROD } = K, { N, run, zs, ze, vEnd, ua0, ua1, ub0, ub1, hw } = Z;
  const rise = (fb - fa) / (2 * N), half = fa + N * rise, base = o.base, under = (top) => base ?? top - 0.46;
  for (let k = 0; k < N; k++) {
    const top = fa + (k + 1) * rise, v0 = zs + k * run;
    B('wood_dark', ua0, ua1, under(top), top, v0, v0 + run); B('iron', ua0 + 0.08, ua1 - 0.08, top, top + 0.008, v0 + 0.03, v0 + run - 0.02);
  }
  RP(ua0, ua1, zs, ze, fa + rise / 2, half + rise / 2, +1);
  // the half landing across the back (boards on a plaster soffit)
  B('wood_dark', ua0, ub1, half - 0.2, half, ze, vEnd); FL(ua0, ub1, ze, vEnd, half);
  if (base !== undefined) { B('wood_dark', ua0, ub1, base, half - 0.2, ze, vEnd); K.C(ua0, ub1, base, half, ze, vEnd); }
  for (let k = 0; k < N; k++) {
    const top = half + (k + 1) * rise, v1 = ze - k * run;
    B('wood_dark', ub0, ub1, base !== undefined ? base : under(top), top, v1 - run, v1); B('iron', ub0 + 0.08, ub1 - 0.08, top, top + 0.008, v1 - run + 0.03, v1 - 0.02);
  }
  RP(ub0, ub1, zs, ze, half + rise / 2, fb + rise / 2, -1);
  if (base !== undefined) K.C(ub0, ub1, base, base + 2.5, zs - 0.25, zs);
  // the well between the strips: a wall of colliders (the banisters are drawn on it) from this floor to a head over the next
  C(ua1, ub0, fa, fb + 1.0, zs, ze);
  const rail = (u, v0, v1, y0, y1) => ROD('wood_dark', [u, y0, v0], [u, y1, v1], 0.03, 5);
  rail(ua1 - 0.03, zs + 0.1, ze - 0.1, fa + rise + 0.92, half + 0.92); rail(ub0 + 0.03, ze - 0.1, zs + 0.1, half + rise + 0.92, fb + 0.92);
  for (let k = 0; k < N; k += 2) {
    const t1 = fa + (k + 1) * rise, v1 = zs + k * run + 0.12, t2 = half + (k + 1) * rise, v2 = ze - k * run - 0.12;
    B('wood_dark', ua1 - 0.045, ua1 - 0.015, t1, t1 + 0.92, v1 - 0.015, v1 + 0.015); B('wood_dark', ub0 + 0.015, ub0 + 0.045, t2, t2 + 0.92, v2 - 0.015, v2 + 0.015);
  }
  for (const [u, v, y0, y1] of [[ua1 - 0.06, zs + 0.06, fa, fa + 1.15], [ua1 - 0.06, ze - 0.06, half, half + 1.2], [ub0 + 0.06, zs + 0.06, fb, fb + 1.15], [ub0 + 0.06, ze - 0.06, half, half + 1.2]])
    B('wood_dark', u - 0.05, u + 0.05, y0, y1, v - 0.05, v + 0.05);
}
/** At the top storey the stairwell is open: a rail across strip a at v = zs (the flight below it) and the well's wall of colliders up to the floor's rail. */
export function topGuard(K, Z, f) {
  const { B, C, ROD } = K, { ua0, ua1, zs } = Z;
  C(ua0, ua1, f, f + 1.0, zs - 0.03, zs + 0.03); ROD('wood_dark', [ua0, f + 0.92, zs], [ua1, f + 0.92, zs], 0.03, 5);
  for (let u = ua0 + 0.1; u < ua1; u += 0.18) B('wood_dark', u - 0.015, u + 0.015, f, f + 0.92, zs - 0.015, zs + 0.015);
  B('wood_dark', ua0, ua0 + 0.08, f, f + 1.1, zs - 0.04, zs + 0.04);
}

// ── floors, walls, linings ───────────────────────────────────────────────────
/** a floor: boards over a plaster ceiling, the zone left open */
export function slab(K, Z, y, uL, uR) {
  const piece = (u0, u1, v0, v1) => { K.B('stucco_cream', u0, u1, y, y + 0.05, v0, v1); K.B('wood_dark', u0, u1, y + 0.05, y + SLAB, v0, v1); K.FL(u0, u1, v0, v1, y + SLAB); };
  piece(SIDE, uR, T, Z.zs); piece(Z.hw, uR, Z.zs, Z.vEnd);
  void uL;
}
/** a wall along the front or back (v in [v0, v1]) between yb and yt, pierced by holes [{ u, w, y0, y1, gap }]: piers, sills and lintels; colliders right across except at a gap */
function pierced(K, m, v0, v1, L, yb, yt, holes, noVis = false) {
  let c = 0;
  const hs = [...holes].sort((a, b) => a.u - b.u);
  if (!noVis) {
    for (const h of hs) {
      const a = h.u - h.w / 2, b = h.u + h.w / 2;
      if (a - c > 0.005) K.B(m, c, a, yb, yt, v0, v1);
      if (h.y0 > yb + 0.005) K.B(m, a, b, yb, h.y0, v0, v1);
      if (yt > h.y1 + 0.005) K.B(m, a, b, h.y1, yt, v0, v1);
      c = b;
    }
    if (L - c > 0.005) K.B(m, c, L, yb, yt, v0, v1);
  }
  // colliders: everywhere but in a gap (a French window standing open)
  let u = 0;
  for (const h of hs.filter((q) => q.gap)) { const a = h.u - h.w / 2, b = h.u + h.w / 2; if (a - u > 0.005) K.C(u, a, yb, yt, v0, v1); K.C(a, b, h.y1, yt, v0, v1); u = b; }
  if (L - u > 0.005) K.C(u, L, yb, yt, v0, v1);
}
/** the glazing of a window hole in a wall of thickness v0..v1: frame, bars, the pane (unless a French window stands open) */
function glaze(K, h, v0, v1, curtain) {
  const { B } = K, m = (v0 + v1) / 2, a = h.u - h.w / 2, b = h.u + h.w / 2, fr = 0.05, hh = h.y1 - h.y0;
  B('plaster_white', a, a + fr, h.y0, h.y1, m - 0.04, m + 0.04); B('plaster_white', b - fr, b, h.y0, h.y1, m - 0.04, m + 0.04);
  B('plaster_white', a, b, h.y1 - fr, h.y1, m - 0.04, m + 0.04);
  if (h.gap) {
    // the French window: its two leaves folded back into the room, glazed
    const side = (h.u - K.L / 2) < 0 ? 1 : -1;
    for (const s of [-1, 1]) { const q = h.u + s * (h.w / 2 - 0.02); B('plaster_white', q - 0.025, q + 0.025, h.y0, h.y1 - fr, v1 + 0.02, v1 + 0.5 + s * 0.0); }
    void side;
  } else {
    B('plaster_white', a, b, h.y0, h.y0 + fr, m - 0.04, m + 0.05);
    B('plaster_white', a, b, lerp(h.y0, h.y1, 0.5) - 0.025, lerp(h.y0, h.y1, 0.5) + 0.025, m - 0.03, m + 0.03);       // the meeting rail
    B('plaster_white', h.u - 0.02, h.u + 0.02, h.y0, h.y1, m - 0.03, m + 0.03);
    B('wood_dark', a - 0.02, b + 0.02, h.y0 - 0.035, h.y0, v1 - 0.12, v1 + 0.1);                                           // the inner sill-board
  }
  if (curtain) {
    const w = Math.min(0.3, h.w * 0.28), y1 = h.y1 + 0.2;
    B(curtain, a - 0.04, a + w, h.y0 - 0.5, y1 - 0.12, v1 + 0.03, v1 + 0.09); B(curtain, b - w, b + 0.04, h.y0 - 0.5, y1 - 0.12, v1 + 0.03, v1 + 0.09);
    B(curtain, a - 0.06, b + 0.06, y1 - 0.12, y1, v1 + 0.03, v1 + 0.13);
  }
  void hh;
}

/** the paper on a room's walls: [u0, u1] × [v0, v1] between f and c; skipped on walls holding doors or windows where noted */
function paper(K, rm, o = {}) {
  const { B } = K, { u0, u1, v0, v1, f, c } = rm, m = rm.paper, e = 0.012, top = c - 0.0;
  const strip = (a0, a1, b0, b1) => { B(m, a0, a1, f, top, b0, b1); };
  // the two side walls (the hall partition has its doors: papered in pieces), the dividing wall
  strip(u1 - e, u1, v0, v1);
  if (!o.noHall) strip(u0, u0 + e, v0, v1);
  if (!o.noFront) strip(u0, u1, v0, v0 + e);
  if (!o.noBack) strip(u0, u1, v1 - e, v1);
}

// ── furniture ────────────────────────────────────────────────────────────────
function blk(K, m, u0, u1, v0, v1, ya, yb, collide = false) { K.B(m, u0, u1, ya, yb, v0, v1); if (collide) K.C(u0, u1, ya, yb, v0, v1); }
/** a plate on the face of a block that looks toward dir; a, b along the face as fractions */
function plate(K, m, dir, r, ya, yb, a = 0, b = 1, th = 0.02) {
  const [u0, u1, v0, v1] = r;
  if (dir === '+v') K.B(m, lerp(u0, u1, a), lerp(u0, u1, b), ya, yb, v1, v1 + th);
  else if (dir === '-v') K.B(m, lerp(u0, u1, a), lerp(u0, u1, b), ya, yb, v0 - th, v0);
  else if (dir === '+u') K.B(m, u1, u1 + th, ya, yb, lerp(v0, v1, a), lerp(v0, v1, b));
  else K.B(m, u0 - th, u0, ya, yb, lerp(v0, v1, a), lerp(v0, v1, b));
}
const OPP = { '+v': '-v', '-v': '+v', '+u': '-u', '-u': '+u' };
function bed(K, u, v, ax, f, o = {}) {
  const w = o.w ?? 1.4, len = o.len ?? 1.9, hd = o.head ?? -1, fm = o.frame ?? 'iron', L2 = len / 2, W2 = w / 2;
  const R = (a0, a1, b0, b1) => (hd < 0 ? [a0, a1] : [-a1, -a0]).concat([b0, b1]);
  const bx = (m, a0, a1, b0, b1, ya, yb) => { const [p0, p1, q0, q1] = R(a0, a1, b0, b1); if (ax === 'v') K.B(m, u + q0, u + q1, ya, yb, v + p0, v + p1); else K.B(m, u + p0, u + p1, ya, yb, v + q0, v + q1); };
  for (const a of [-L2, L2 - 0.04]) for (const b of [-W2, W2 - 0.04]) bx(fm, a, a + 0.04, b, b + 0.04, f, f + (a < 0 ? 1.15 : 0.62));
  bx(fm, -L2, L2, -W2, W2, f + 0.28, f + 0.31);
  bx(fm, -L2, -L2 + 0.03, -W2, W2, f + 0.92, f + 0.96); bx(fm, L2 - 0.03, L2, -W2, W2, f + 0.5, f + 0.53);
  for (let b = -W2 + 0.12; b < W2 - 0.08; b += 0.17) bx(fm, -L2 + 0.005, -L2 + 0.025, b, b + 0.016, f + 0.31, f + 0.92);
  if (o.brass) for (const b of [-W2 + 0.02, W2 - 0.06]) bx('gold', -L2 - 0.005, -L2 + 0.045, b, b + 0.06, f + 1.15, f + 1.2);
  bx(o.tick ?? 'cloth_white', -L2 + 0.05, L2 - 0.05, -W2 + 0.04, W2 - 0.04, f + 0.31, f + 0.52);
  bx(o.quilt ?? 'cloth_red', -L2 + 0.55, L2 - 0.02, -W2 + 0.02, W2 - 0.02, f + 0.52, f + 0.58);
  bx('cloth_white', -L2 + 0.08, -L2 + 0.5, -W2 + 0.1, W2 - 0.1, f + 0.5, f + 0.6);
  const [p0, p1, q0, q1] = R(-L2, L2, -W2, W2);
  if (ax === 'v') K.C(u + q0, u + q1, f, f + 0.62, v + p0, v + p1); else K.C(u + p0, u + p1, f, f + 0.62, v + q0, v + q1);
}
function chair(K, u, v, face, f, m = 'wood_dark') {
  K.B(m, u - 0.2, u + 0.2, f + 0.43, f + 0.47, v - 0.2, v + 0.2);
  for (const a of [-0.17, 0.17]) for (const b of [-0.17, 0.17]) K.B(m, u + a - 0.02, u + a + 0.02, f, f + 0.43, v + b - 0.02, v + b + 0.02);
  const [du, dv] = { '+v': [0, 1], '-v': [0, -1], '+u': [1, 0], '-u': [-1, 0] }[face];
  K.B(m, u - du * 0.2 - 0.2 * Math.abs(dv) + (du ? -0.015 : 0), u - du * 0.2 + 0.2 * Math.abs(dv) + (du ? 0.015 : 0), f + 0.47, f + 0.95, v - dv * 0.2 - 0.2 * Math.abs(du) + (dv ? -0.015 : 0), v - dv * 0.2 + 0.2 * Math.abs(du) + (dv ? 0.015 : 0));
  K.C(u - 0.2, u + 0.2, f, f + 0.9, v - 0.2, v + 0.2);
}
function table(K, u, v, w, d, h, f, top = 'wood_dark', cloth = null) {
  K.B(top, u - w / 2, u + w / 2, f + h - 0.04, f + h, v - d / 2, v + d / 2);
  for (const a of [-1, 1]) for (const b of [-1, 1]) K.B('wood_dark', u + a * (w / 2 - 0.07) - 0.03, u + a * (w / 2 - 0.07) + 0.03, f, f + h - 0.04, v + b * (d / 2 - 0.07) - 0.03, v + b * (d / 2 - 0.07) + 0.03);
  if (cloth) K.B(cloth, u - w / 2 - 0.03, u + w / 2 + 0.03, f + h - 0.2, f + h + 0.004, v - d / 2 - 0.03, v + d / 2 + 0.03);
  K.C(u - w / 2, u + w / 2, f, f + h, v - d / 2, v + d / 2);
}
function armchair(K, u, v, face, f, m, wide = 0.75) {
  const [du, dv] = { '+v': [0, 1], '-v': [0, -1], '+u': [1, 0], '-u': [-1, 0] }[face], hw = wide / 2;
  K.B('wood_dark', u - hw, u + hw, f, f + 0.12, v - hw, v + hw); K.B(m, u - hw, u + hw, f + 0.12, f + 0.44, v - hw, v + hw);
  // the back on the side away from the face; the arms
  if (du) { const x0 = du > 0 ? u - hw : u + hw - 0.14, x1 = x0 + 0.14; K.B(m, x0, x1, f + 0.44, f + 0.95, v - hw, v + hw); for (const s of [-1, 1]) K.B(m, u - hw, u + hw, f + 0.44, f + 0.65, v + s * hw - (s > 0 ? 0.12 : 0), v + s * hw + (s < 0 ? 0.12 : 0)); }
  else { const z0 = dv > 0 ? v - hw : v + hw - 0.14, z1 = z0 + 0.14; K.B(m, u - hw, u + hw, f + 0.44, f + 0.95, z0, z1); for (const s of [-1, 1]) K.B(m, u + s * hw - (s > 0 ? 0.12 : 0), u + s * hw + (s < 0 ? 0.12 : 0), f + 0.44, f + 0.65, v - hw, v + hw); }
  K.C(u - hw, u + hw, f, f + 0.9, v - hw, v + hw);
}
function sofa(K, u, v, face, f, m, len = 1.7) {
  // a sofa along u with its back on the dividing wall (face '-v': facing the front) or along v (faces '+u' / '-u')
  if (face === '-v' || face === '+v') { const s = face === '+v' ? 1 : -1; K.B('wood_dark', u - len / 2, u + len / 2, f, f + 0.12, v - 0.4, v + 0.4); K.B(m, u - len / 2, u + len / 2, f + 0.12, f + 0.44, v - 0.4, v + 0.4); K.B(m, u - len / 2, u + len / 2, f + 0.44, f + 0.92, v - s * 0.4 - 0.0 - (s > 0 ? 0 : -0.14) + (s > 0 ? 0 : 0), v - s * 0.4 + (s > 0 ? 0.14 : 0) + (s < 0 ? 0 : 0) + 0.0);
    for (const e of [-1, 1]) K.B(m, u + e * len / 2 - (e > 0 ? 0.12 : 0), u + e * len / 2 + (e < 0 ? 0.12 : 0), f + 0.44, f + 0.62, v - 0.4, v + 0.4);
    K.C(u - len / 2, u + len / 2, f, f + 0.9, v - 0.4, v + 0.4); }
}
function wardrobe(K, u0, u1, v0, v1, f, dir, h = 2.05) {
  blk(K, 'wood_dark', u0, u1, v0, v1, f, f + h, true); blk(K, 'wood_dark', u0 - 0.03, u1 + 0.03, v0 - 0.03, v1 + 0.03, f + h, f + h + 0.08);
  const r = [u0, u1, v0, v1]; plate(K, 'wood_dark', dir, r, f + 0.12, f + h - 0.12, 0.06, 0.47); plate(K, 'wood_dark', dir, r, f + 0.12, f + h - 0.12, 0.53, 0.94);
  plate(K, 'gold', dir, r, f + 1.0, f + 1.1, 0.44, 0.48, 0.03); plate(K, 'gold', dir, r, f + 1.0, f + 1.1, 0.52, 0.56, 0.03);
}
function drawers(K, u0, u1, v0, v1, f, dir, h = 0.92, mirror = false) {
  blk(K, 'wood_dark', u0, u1, v0, v1, f, f + h, true); blk(K, 'wood_dark', u0 - 0.02, u1 + 0.02, v0 - 0.02, v1 + 0.02, f + h, f + h + 0.03);
  const r = [u0, u1, v0, v1];
  for (const [a, b] of [[0.1, 0.3], [0.38, 0.58], [0.66, 0.9]]) { plate(K, 'wood_dark', dir, r, f + a * h, f + b * h, 0.06, 0.94); plate(K, 'gold', dir, r, f + (a + b) / 2 * h - 0.015, f + (a + b) / 2 * h + 0.015, 0.47, 0.53, 0.035); }
  if (mirror) { const q = OPP[dir]; void q; }
}
function washstand(K, u, v, f, dir, o = {}) {
  const w = 0.95, d = 0.5, ax = dir === '+u' || dir === '-u';
  const r = ax ? [u - d / 2, u + d / 2, v - w / 2, v + w / 2] : [u - w / 2, u + w / 2, v - d / 2, v + d / 2];
  blk(K, 'wood_dark', r[0], r[1], r[2], r[3], f, f + 0.8, true); blk(K, 'plaster_white', r[0] - 0.02, r[1] + 0.02, r[2] - 0.02, r[3] + 0.02, f + 0.8, f + 0.84);
  plate(K, 'wood_dark', dir, r, f + 0.12, f + 0.7, 0.08, 0.48); plate(K, 'wood_dark', dir, r, f + 0.12, f + 0.7, 0.52, 0.92);
  K.LA('wood_dark', [[0.001, 0], [0.16, 0], [0.2, 0.05], [0.22, 0.1], [0.001, 0.1]], 10, u + (ax ? 0 : -0.2), f + 0.84, v + (ax ? -0.2 : 0));
  K.LA('wood_dark', [[0.001, 0], [0.07, 0], [0.085, 0.14], [0.05, 0.24], [0.001, 0.26]], 8, u + (ax ? 0 : 0.28), f + 0.84, v + (ax ? 0.28 : 0));
  // the towel rail at the side, a towel
  const [du, dv] = { '+v': [0, 1], '-v': [0, -1], '+u': [1, 0], '-u': [-1, 0] }[dir];
  void du; void dv; void o;
}
function trunk(K, u0, u1, v0, v1, f, h = 0.5, m = 'wood_dark') {
  blk(K, m, u0, u1, v0, v1, f, f + h, true); blk(K, 'iron', u0 - 0.01, u1 + 0.01, v0 + (v1 - v0) * 0.2 - 0.02, v0 + (v1 - v0) * 0.2 + 0.02, f, f + h); blk(K, 'iron', u0 - 0.01, u1 + 0.01, v0 + (v1 - v0) * 0.8 - 0.02, v0 + (v1 - v0) * 0.8 + 0.02, f, f + h);
  blk(K, 'wood_dark', u0 - 0.02, u1 + 0.02, v0 - 0.02, v1 + 0.02, f + h, f + h + 0.04);
}
function rug(K, u0, u1, v0, v1, f, m1, m2) { K.B(m1, u0, u1, f + 0.02, f + 0.03, v0, v1); K.B(m2, u0 + 0.1, u1 - 0.1, f + 0.03, f + 0.036, v0 + 0.1, v1 - 0.1); }
function lamp(K, u, v, c, drop = 0.7, glass = 'lamp_glass') { K.LA('gold', [[0.012, 0], [0.012, drop]], 5, u, c - drop, v); K.LA(glass, [[0.03, 0], [0.12, 0.08], [0.16, 0.2], [0.1, 0.32], [0.001, 0.34]], 10, u, c - drop - 0.32, v); }
function candle(K, u, v, y) { K.LA('gold', [[0.04, 0], [0.025, 0.02], [0.015, 0.1], [0.025, 0.14], [0.001, 0.14]], 8, u, y, v);  }
function shelves(K, u0, u1, v0, v1, f, dir, tiers, h = 2.0) {
  blk(K, 'wood_dark', u0, u1, v0, v1, f, f + h, true);
  const r = [u0, u1, v0, v1];
  for (const t of tiers) { const q = OPP[dir]; void q; plate(K, 'wood_dark', dir, r, f + t, f + t + 0.03, 0, 1, 0.34); }
}
function barrel(K, u, v, f, h = 0.9, r = 0.3, m = 'wood_dark') { K.LA(m, [[0.001, 0], [r * 0.85, 0], [r, h * 0.25], [r * 1.1, h * 0.5], [r, h * 0.75], [r * 0.85, h], [0.001, h]], 10, u, f, v); K.col.circle(...K.P(u, v), r * 1.05, f, f + h); }
function sack(K, u, v, f, m = 'sacking') { K.LA(m, [[0.001, 0], [0.2, 0.0], [0.24, 0.2], [0.2, 0.45], [0.1, 0.55], [0.001, 0.56]], 8, u, f, v); K.col.circle(...K.P(u, v), 0.24, f, f + 0.5); }
function crate(K, u0, u1, v0, v1, f, h = 0.45, m = 'wood_dark') { blk(K, m, u0, u1, v0, v1, f, f + h, true); blk(K, 'wood_dark', u0 - 0.01, u1 + 0.01, v0 - 0.01, v1 + 0.01, f + h * 0.4, f + h * 0.46); }

/** the fireplace in a chimney breast on the party wall (u1 side) at v = rm.fv: breast, black grate with tiled sides, fender, mantel; over it a mirror (drawing rooms) or a print */
function hearth(K, rm, mat, o = {}) {
  const { u1, f, c, fv } = rm, cb = u1 - 0.36, { B, C } = K;
  B(mat, cb, u1, f, c, fv - 0.8, fv + 0.8); C(cb, u1, f, c, fv - 0.8, fv + 0.8);
  B(rm.paper, cb - 0.012, cb, f, c, fv - 0.8, fv + 0.8);
  B('iron', cb - 0.04, cb + 0.03, f, f + 0.85, fv - 0.32, fv + 0.32); B('opening', cb - 0.045, cb - 0.04, f + 0.15, f + 0.62, fv - 0.22, fv + 0.22);
  for (const s of [-1, 1]) B('tile_iznik', cb - 0.05, cb - 0.04, f + 0.05, f + 0.85, fv + s * 0.32 - (s < 0 ? 0.16 : 0), fv + s * 0.32 + (s > 0 ? 0.16 : 0));
  B('iron', cb - 0.5, cb - 0.46, f, f + 0.12, fv - 0.6, fv + 0.6); B('iron', cb - 0.5, cb - 0.12, f, f + 0.12, fv - 0.62, fv - 0.58); B('iron', cb - 0.5, cb - 0.12, f, f + 0.12, fv + 0.58, fv + 0.62);
  B('limestone', cb - 0.12, cb, f, f + 1.0, fv - 0.62, fv - 0.48); B('limestone', cb - 0.12, cb, f, f + 1.0, fv + 0.48, fv + 0.62); B('limestone', cb - 0.2, cb, f + 1.0, f + 1.05, fv - 0.7, fv + 0.7);
  if (o.mirror) { B('wood_dark', cb - 0.05, cb - 0.012, f + 1.25, f + 2.2, fv - 0.55, fv + 0.55); B('gold', cb - 0.055, cb - 0.05, f + 1.28, f + 2.17, fv - 0.52, fv + 0.52); B('mirror_tin', cb - 0.06, cb - 0.055, f + 1.33, f + 2.12, fv - 0.47, fv + 0.47); }
  else if (o.print) { B('wood_dark', cb - 0.04, cb - 0.012, f + 1.45, f + 1.95, fv - 0.3, fv + 0.3); B('cloth_white', cb - 0.045, cb - 0.04, f + 1.5, f + 1.9, fv - 0.25, fv + 0.25); }
  if (o.clock) { B('wood_dark', cb - 0.13, cb - 0.03, f + 1.05, f + 1.33, fv - 0.1, fv + 0.1); B('gold', cb - 0.135, cb - 0.13, f + 1.13, f + 1.25, fv - 0.05, fv + 0.05); }
}

// ── the rooms by use ─────────────────────────────────────────────────────────
// rm: { u0, u1, v0, v1, f, c, fv, paper, front, winU } — the room's inner faces and floor and ceiling levels; winU the window's u
const ROOMS = {
  /** the first-floor drawing room: the suite, the round table, the cabinet, the piano or the writing table, lace and plum velvet at the window */
  drawing(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2, qs = pick(rnd, ['cloth_green', 'cloth_red', 'cloth_indigo']);
    hearth(K, rm, mat, { mirror: true, clock: true });
    rug(K, u0 + 0.5, u1 - 0.7, v0 + 0.6, v1 - 0.6, f, 'cloth_red', 'cloth_red');
    sofa(K, mid + 0.15, v1 - 0.45, '-v', f, qs, 1.7);
    armchair(K, u1 - 1.3, rm.fv - 0.95, '+u', f, 'cloth_brown'); armchair(K, u1 - 1.3, rm.fv + 0.95, '+u', f, 'cloth_brown');
    table(K, mid - 0.05, v0 + 1.8, 0.7, 0.7, 0.72, f, 'wood_dark', 'cloth_red');
    K.LA('wood_dark', [[0.08, 0], [0.12, 0.05], [0.14, 0.18], [0.001, 0.22]], 10, mid - 0.05, f + 0.72, v0 + 1.8);
    // the cabinet of china against the hall wall below its doors, the upright piano by the front wall
    wardrobe(K, u0 + 0.02, u0 + 0.46, v0 + 2.75, v0 + 3.75, f, '+u', 1.75); K.LA('wood_dark', [[0.001, 0], [0.06, 0.005], [0.07, 0.1], [0.001, 0.1]], 8, u0 + 0.28, f + 1.2, v0 + 3.2);
    blk(K, 'wood_dark', u1 - 1.55, u1 - 0.5, v0 + 0.05, v0 + 0.6, f + 0.08, f + 1.3, true); blk(K, 'lacquer_black', u1 - 1.57, u1 - 0.48, v0 + 0.6, v0 + 0.78, f + 0.72, f + 0.76);
    blk(K, 'cloth_white', u1 - 1.5, u1 - 0.55, v0 + 0.6, v0 + 0.76, f + 0.76, f + 0.785); chair(K, u1 - 1.02, v0 + 1.1, '-v', f, 'wood_dark');
    K.LA('cloth_green', [[0.1, 0], [0.22, 0.25], [0.12, 0.5], [0.001, 0.55]], 8, rm.winU - 0.9, f + 0.45, v0 + 0.4);
    K.LA('wood_dark', [[0.001, 0], [0.12, 0], [0.14, 0.22], [0.11, 0.26]], 8, rm.winU - 0.9, f, v0 + 0.4);
    lamp(K, mid, (v0 + v1) / 2, c, 0.7); K.LA('plaster_white', [[0.25, 0], [0.2, -0.03], [0.001, -0.04]], 14, mid, c, (v0 + v1) / 2);
    for (const u of [mid - 0.9, mid + 0.6]) { K.B('wood_dark', u - 0.3, u + 0.3, f + 1.45, f + 2.05, v1 - 0.04, v1 - 0.012); K.B('cloth_white', u - 0.24, u + 0.24, f + 1.51, f + 1.99, v1 - 0.045, v1 - 0.04); K.B('paint_robe', u - 0.1, u + 0.1, f + 1.6, f + 1.9, v1 - 0.05, v1 - 0.045); }
    if (rm.maid) K.who(u1 - 1.3 - 0.0, rm.fv - 0.95, f + 0.0, [u1, rm.fv - 0.95], { dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_black', hat: 'none', over: 'shawl', pose: 'sit' });
  },
  /** a second sitting room / sewing room of a tradesman's family: the writing table and bookcase, the work-table with the machine */
  sitting(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { print: true, clock: true });
    rug(K, u0 + 0.5, u1 - 0.7, v0 + 0.7, v1 - 0.7, f, 'cloth_brown', 'cloth_ochre');
    table(K, mid, v0 + 1.7, 0.9, 0.6, 0.75, f, 'wood_dark', 'cloth_green'); chair(K, mid, v0 + 2.3, '-v', f); chair(K, mid, v0 + 1.1, '+v', f);
    blk(K, 'lacquer_black', mid - 0.1, mid + 0.1, v0 + 1.6, v0 + 1.8, f + 0.75, f + 0.8); K.B('cloth_white', mid - 0.3, mid + 0.0, f + 0.75, f + 0.76, v0 + 1.45, v0 + 1.75);
    shelves(K, u0 + 0.02, u0 + 0.4, v0 + 2.8, v0 + 3.9, f, '+u', [0.5, 1.0, 1.5], 1.9);
    armchair(K, u1 - 1.2, rm.fv + 1.0, '+u', f, 'cloth_brown');
    sofa(K, mid + 0.2, v1 - 0.45, '-v', f, 'cloth_ochre', 1.5);
    lamp(K, mid, (v0 + v1) / 2, c, 0.6);
  },
  /** the best bedroom: the brass bedstead with its quilt and bolster, the washstand with jug and basin, the wardrobe, the chest, the dressing table at the window, a chair by the fire */
  master(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2, bu = mid + 0.45;
    hearth(K, rm, mat, { print: true, clock: true });
    rug(K, bu - 1.1, bu + 1.1, v0 + 0.5, v1 - 0.5, f, 'cloth_red', 'cloth_ochre');
    bed(K, bu, v0 + 1.1, 'v', f, { w: 1.4, len: 1.9, head: -1, quilt: pick(rnd, ['cloth_red', 'cloth_blue', 'cloth_ochre']), brass: true, frame: 'gold' });
    drawers(K, u0 + 0.02, u0 + 0.5, v0 + 1.3, v0 + 2.3, f, '+u'); wardrobe(K, u0 + 0.02, u0 + 0.62, v1 - 1.45, v1 - 0.35, f, '+u');
    washstand(K, mid - 0.6, v1 - 0.4, f, '-v'); chair(K, u1 - 1.0, rm.fv + 1.1, '+u', f);
    table(K, bu - 0.0, v1 - 0.4, 0.95, 0.45, 0.78, f, 'wood_dark'); blk(K, 'wood_dark', bu - 0.3, bu + 0.3, v1 - 0.07, v1 - 0.03, f + 0.95, f + 1.5); blk(K, 'mirror_tin', bu - 0.25, bu + 0.25, v1 - 0.075, v1 - 0.07, f + 1.0, f + 1.45);
    candle(K, bu - 0.2, v1 - 0.4, f + 0.78);
    K.B('cloth_white', mid - 1.1, mid - 0.1, f + 0.96, f + 1.04, v1 - 0.06, v1 - 0.04);
  },
  /** the children's room / nursery: an iron bed, a cot, a toy chest, a rocking chair, the fireguard */
  nursery(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { print: true });
    K.B('iron', u1 - 1.0, u1 - 0.4, f, f + 0.7, rm.fv - 0.7, rm.fv - 0.67); K.B('iron', u1 - 1.0, u1 - 0.4, f, f + 0.7, rm.fv + 0.67, rm.fv + 0.7); K.B('iron', u1 - 1.0, u1 - 0.97, f, f + 0.7, rm.fv - 0.7, rm.fv + 0.7);
    rug(K, u0 + 1.2, u1 - 1.0, v0 + 0.8, v1 - 0.9, f, 'cloth_blue', 'cloth_white');
    bed(K, u0 + 1.85, v1 - 1.1, 'v', f, { w: 0.9, len: 1.8, head: +1, quilt: 'cloth_blue' });
    bed(K, u0 + 2.95, v1 - 0.85, 'v', f, { w: 0.6, len: 1.1, head: +1, quilt: 'cloth_white' });
    trunk(K, u0 + 0.25, u0 + 1.1, v0 + 0.05 + 0.0, v0 + 0.5, f, 0.45, 'wood_dark');
    table(K, mid + 0.2, v0 + 1.2, 0.8, 0.55, 0.5, f, 'wood_dark', 'cloth_green');
    K.LA('wood_dark', [[0.001, 0], [0.1, 0.0], [0.1, 0.4], [0.05, 0.5], [0.001, 0.5]], 8, mid - 0.3, f + 0.5, v0 + 1.2);
    chair(K, u1 - 1.45, rm.fv + 0.9, '+u', f, 'wood_dark');
    lamp(K, mid, (v0 + v1) / 2, c, 0.5);
  },
  /** the servants' attic: whitewashed boards, two iron beds, a deal washstand, a box, hooks with a gown, a candle, no fire */
  attic(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    bed(K, u1 - 0.6, v1 - 1.05, 'v', f, { w: 0.9, len: 1.85, head: +1, quilt: 'cloth_grey', tick: 'sacking' });
    bed(K, mid - 0.35, v1 - 1.05, 'v', f, { w: 0.9, len: 1.85, head: +1, quilt: 'cloth_brown', tick: 'sacking' });
    washstand(K, u0 + 0.35, v0 + 2.9, f, '+u'); trunk(K, u0 + 0.3, u0 + 0.9, v1 - 1.3, v1 - 0.4, f, 0.45, 'wood_dark');
    table(K, mid, v0 + 0.5, 0.6, 0.4, 0.74, f, 'wood_dark'); candle(K, mid + 0.1, v0 + 0.5, f + 0.74);
    for (let k = 0; k < 4; k++) K.B('iron', u1 - 0.025 - 0.0, u1 - 0.0, f + 1.6, f + 1.65, v0 + 0.5 + k * 0.3, v0 + 0.56 + k * 0.3);
    K.B('cloth_grey', u1 - 0.05, u1 - 0.025, f + 0.7, f + 1.6, v0 + 0.55, v0 + 0.95);
    K.B('wood_dark', mid - 0.85 - 0.0, mid - 0.5, f, f + 0.2, v0 + 0.3, v0 + 0.6);
    rug(K, mid - 0.6, mid + 0.4, v1 - 1.4, v0 + 1.5 + 0.0, f, 'cloth_brown', 'cloth_grey');
    if (rm.maid) K.who(mid + 0.1, v0 + 1.1, f, [mid - 0.35, v1 - 1.0], { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_white', over: 'apron', pose: 'stand' });
  },
  /** the box room: trunks and hat-boxes, the linen press, a dress-form, a cane chair, the old cradle, a rolled carpet */
  box(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { print: true });
    wardrobe(K, u0 + 0.02, u0 + 0.62, v1 - 1.5, v1 - 0.35, f, '+u', 1.95);
    trunk(K, mid - 0.5, mid + 0.5, v1 - 0.8, v1 - 0.1, f, 0.55, 'wood_dark'); trunk(K, mid - 0.4, mid + 0.4, v1 - 0.8, v1 - 0.1, f + 0.55, 0.35, 'wood_dark');
    trunk(K, mid + 0.65, mid + 1.35, v1 - 0.8, v1 - 0.1, f, 0.4, 'wood_dark');
    for (let k = 0; k < 3; k++) K.LA(['hide_tan', 'cloth_red', 'wood_dark'][k], [[0.001, 0], [0.18, 0], [0.18, 0.2], [0.001, 0.2]], 10, mid - 0.25 + k * 0.28, f + 0.95, v1 - 0.45);
    K.LA('wood_dark', [[0.2, 0], [0.04, 0.02], [0.04, 1.0], [0.001, 1.05]], 6, mid, f, v0 + 1.0); K.B('cloth_white', mid - 0.18, mid + 0.18, f + 0.9, f + 1.5, v0 + 0.88, v0 + 1.12); K.col.circle(...K.P(mid, v0 + 1.0), 0.2, f, f + 1.4);
    chair(K, u1 - 1.2, rm.fv + 0.7, '+u', f, 'wood_dark');
    K.LA('hide_tan', [[0.001, 0], [0.12, 0], [0.12, 1.2], [0.001, 1.2]], 8, u0 + 0.35, f, v0 + 0.5);
    lamp(K, mid, (v0 + v1) / 2, c, 0.5);
  },
  /** a craftsman's workroom: the long bench under the window with its lap-tools and work in hand, the cutting table, the stove, shelves of stock, the stool */
  workroom(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { clock: true });
    table(K, rm.winU, v0 + 0.5, 1.5, 0.7, 0.85, f, 'wood_dark'); K.B('cloth_brown', rm.winU - 0.6, rm.winU - 0.1, f + 0.85, f + 0.92, v0 + 0.3, v0 + 0.6); K.B('cloth_grey', rm.winU + 0.1, rm.winU + 0.5, f + 0.85, f + 0.9, v0 + 0.25, v0 + 0.55);
    K.B('iron', rm.winU + 0.5, rm.winU + 0.66, f + 0.85, f + 0.95, v0 + 0.3, v0 + 0.5);
    K.LA('wood_dark', [[0.2, 0], [0.04, 0.02], [0.04, 0.55], [0.18, 0.6], [0.001, 0.6]], 8, rm.winU, f, v0 + 1.1);
    table(K, mid - 0.3, v0 + 2.4, 1.6, 0.9, 0.85, f, 'wood_dark', 'cloth_ochre'); K.B('cloth_red', mid - 0.8, mid - 0.2, f + 0.86, f + 0.92, v0 + 2.2, v0 + 2.6); K.B('cloth_blue', mid - 0.1, mid + 0.4, f + 0.86, f + 0.94, v0 + 2.3, v0 + 2.7);
    shelves(K, u0 + 0.02, u0 + 0.4, v0 + 2.7, v0 + 3.9, f, '+u', [0.5, 1.0, 1.5], 2.0);
    for (let k = 0; k < 6; k++) K.B(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_white', 'hide_tan', 'cloth_ochre'][k], u0 + 0.4, u0 + 0.58, f + 0.53 + (k % 3) * 0.5, f + 0.8 + (k % 3) * 0.5, v0 + 2.85 + (k % 2) * 0.5, v0 + 3.2 + (k % 2) * 0.5);
    chair(K, mid + 0.5, v1 - 0.9, '-v', f); lamp(K, mid, (v0 + v1) / 2, c, 0.6);
  },
  /** a tenement room: one room for a family — iron bed, a cot, table and stools, the dresser with its blue plates, the washing on a line, a pail, a rag rug */
  lodge(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2, B = K.B;
    hearth(K, rm, mat, { print: false });
    const sdw = rm.front ? 1 : 0;
    bed(K, u0 + 1.2 + 0.0, v0 + 1.1 + (sdw ? 0.5 : 0), 'v', f, { w: 1.3, len: 1.85, head: -1, quilt: pick(rnd, ['cloth_ochre', 'cloth_green', 'cloth_red']) });
    bed(K, u0 + 2.2, v1 - 0.85, 'v', f, { w: 0.55, len: 1.0, head: +1, quilt: 'cloth_grey', tick: 'sacking' });
    table(K, mid + 0.6, rm.fv + 0.2 + (sdw ? 0.7 : 0), 0.8, 0.7, 0.74, f, 'wood_dark'); chair(K, mid + 0.6, rm.fv + 0.95 + (sdw ? 0.7 : 0), '-v', f); chair(K, mid + 0.6, rm.fv - 0.55 + (sdw ? 0.7 : 0), '+v', f);
    drawers(K, u0 + 0.02, u0 + 0.5, v1 - 1.5, v1 - 0.5, f, '+u', 1.7); for (let k = 0; k < 4; k++) K.LA('wood_dark', [[0.001, 0], [0.1, 0.004], [0.11, 0.012], [0.001, 0.012]], 10, u0 + 0.3, f + 0.95 + (k % 2) * 0.35, v1 - 1.35 + (k >> 1) * 0.4);
    K.LA('iron', [[0.1, 0], [0.12, 0.05], [0.12, 0.18], [0.1, 0.2]], 8, u1 - 0.75, f, v1 - 0.4); K.col.circle(...K.P(u1 - 0.75, v1 - 0.4), 0.14, f, f + 0.2);
    rug(K, mid - 0.3, mid + 1.2, v0 + 1.4, v0 + 2.4, f, 'cloth_brown', 'cloth_grey');
    B('cloth_white', u0 + 0.3, u1 - 0.3, f + 2.0, f + 2.004, (v0 + v1) / 2, (v0 + v1) / 2 + 0.005);
    for (const [u, w] of [[mid - 1.0, 0.5], [mid - 0.3, 0.42], [mid + 0.4, 0.55]]) B('cloth_white', u, u + w, f + 1.4, f + 2.0, (v0 + v1) / 2 - 0.01, (v0 + v1) / 2 + 0.01);
    K.LA('lamp_glass', [[0.025, 0], [0.05, 0.08], [0.03, 0.22], [0.001, 0.24]], 8, mid + 0.8, f + 0.74, rm.fv + 0.2 + (sdw ? 0.7 : 0));
    void c;
  },
  /** the club room of a pub: a long table with benches and pewter, a settle and a piano, spittoons, sawdust, the club's board and the clock */
  club(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { clock: true });
    K.B('sacking', u0 + 0.3, u1 - 0.7, f, f + 0.008, v0 + 0.5, v1 - 0.4);
    const tl = Math.min(4.6, u1 - u0 - 1.6), tu0 = mid - 0.5 - tl / 2 + 0.3, tu1 = tu0 + tl, tv = (v0 + v1) / 2;
    table(K, (tu0 + tu1) / 2, tv, tl, 0.85, 0.78, f, 'lacquer_chestnut', 'cloth_white');
    for (const s of [-1, 1]) { blk(K, 'wood_dark', tu0 + 0.2, tu1 - 0.2, tv + s * 0.8 - 0.17, tv + s * 0.8 + 0.17, f + 0.43, f + 0.47, true); for (const a of [tu0 + 0.3, tu1 - 0.3]) blk(K, 'wood_dark', a - 0.03, a + 0.03, tv + s * 0.8 - 0.15, tv + s * 0.8 + 0.15, f, f + 0.43); }
    for (let k = 0; k < 4; k++) { K.LA('iron', [[0.001, 0], [0.05, 0.0], [0.06, 0.1], [0.05, 0.12], [0.001, 0.12]], 8, tu0 + 0.7 + k * (tl - 1.4) / 3, f + 0.78, tv + (k % 2 ? 0.2 : -0.2)); }
    blk(K, 'wood_dark', u0 + 0.02, u0 + 0.6, v0 + 2.5, v0 + 3.8, f, f + 1.2, true); blk(K, 'cloth_red', u0 + 0.05, u0 + 0.55, v0 + 2.55, v0 + 3.75, f + 0.46, f + 0.52);
    blk(K, 'wood_dark', mid - 1.2, mid + 1.2, v1 - 0.55, v1 - 0.05, f, f + 0.95, true); blk(K, 'wood_dark', mid - 1.22, mid + 1.22, v1 - 0.58, v1 - 0.02, f + 0.95, f + 0.99);
    for (let k = 0; k < 6; k++) K.LA('wood_dark', [[0.001, 0], [0.04, 0.01], [0.045, 0.16], [0.02, 0.26], [0.02, 0.3]], 6, mid - 0.9 + k * 0.35, f + 0.99, v1 - 0.3);
    K.B('wood_dark', mid - 0.5, mid + 0.5, f + 1.5, f + 2.05, v1 - 0.04, v1 - 0.012); K.B('paint_fleur', mid - 0.46, mid + 0.46, f + 1.54, f + 2.0, v1 - 0.045, v1 - 0.04);
    for (const gu of [tu0 + 0.5, (tu0 + tu1) / 2, tu1 - 0.5]) lamp(K, gu, tv, c, 0.55);
    if (rm.maid) K.who(tu0 + 0.5, tv + 0.8, f, [tu0 + 0.5, tv], { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey', over: 'collar', pose: 'sit' });
  },
  /** the landlord's sitting room: a table laid, the sideboard, the armchair, the horsehair sofa, a stuffed bird under glass */
  landlord(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { mirror: true, clock: true });
    rug(K, u0 + 0.5, u1 - 0.8, v0 + 0.6, v1 - 0.6, f, 'cloth_red', 'cloth_red');
    table(K, mid, (v0 + v1) / 2, 1.2, 0.8, 0.74, f, 'lacquer_chestnut', 'cloth_white'); chair(K, mid, (v0 + v1) / 2 - 0.7, '+v', f); chair(K, mid, (v0 + v1) / 2 + 0.7, '-v', f);
    for (const du of [-0.3, 0.3]) K.LA('wood_dark', [[0.001, 0], [0.07, 0], [0.085, 0.04], [0.001, 0.04]], 8, mid + du, f + 0.74, (v0 + v1) / 2);
    armchair(K, u1 - 1.3, rm.fv + 0.95, '+u', f, 'cloth_green'); armchair(K, u1 - 1.3, rm.fv - 0.95, '+u', f, 'cloth_green');
    drawers(K, u0 + 0.02, u0 + 0.5, v0 + 2.6, v0 + 4.0, f, '+u', 1.0); K.LA('wood_dark', [[0.001, 0], [0.12, 0.0], [0.12, 0.3], [0.001, 0.34]], 10, u0 + 0.28, f + 1.0, v0 + 3.3);
    lamp(K, mid, (v0 + v1) / 2, c, 0.6);
  },
  /** a travellers' room to let: a double bed with its bolster, the washstand and ewer, a chair, a trunk-rack, the bill of the house on the wall */
  letting(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2;
    hearth(K, rm, mat, { print: true });
    bed(K, mid - 0.3, v1 - 1.05, 'v', f, { w: 1.3, len: 1.9, head: +1, quilt: pick(rnd, ['cloth_blue', 'cloth_red', 'cloth_green']), frame: 'iron' });
    washstand(K, u0 + 0.35, v0 + 2.9, f, '+u'); chair(K, u1 - 1.1, rm.fv + 1.0, '+u', f); trunk(K, mid + 0.7, mid + 1.5, v1 - 0.75, v1 - 0.1, f, 0.4, 'wood_dark');
    blk(K, 'wood_dark', u0 + 0.02, u0 + 0.5, v1 - 1.6, v1 - 0.45, f, f + 0.9, true);
    candle(K, mid + 0.85, v1 - 0.4, f + 0.4 + 0.0); rug(K, mid - 1.1, mid + 0.5, v0 + 0.6, v1 - 1.7, f, 'cloth_grey', 'cloth_brown');
    K.B('wood_dark', u0 + 0.5 - 0.0, u0 + 0.53, f + 1.5, f + 2.0, v1 - 1.2, v1 - 0.6);
  },
  /** a stock room over a shop, by the trade */
  stock(K, rm, rnd, mat) {
    const { u0, u1, v0, v1, f, c } = rm, mid = (u0 + u1) / 2, tr = rm.trade ?? 'draper';
    if (tr === 'draper') {
      // bolts of cloth on racks, the cutting table, a dress-form, boxes of trimmings
      for (const [a, b] of [[v0 + 2.4, v0 + 3.8]]) { shelves(K, u0 + 0.02, u0 + 0.4, a, b, f, '+u', [0.5, 1.0, 1.5, 2.0], 2.3); for (let k = 0; k < 8; k++) K.B(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'hide_tan'][k], u0 + 0.4, u0 + 0.52, f + 0.5 + (k % 4) * 0.5, f + 0.5 + (k % 4) * 0.5 + 0.3, a + 0.1 + (k >> 2) * 0.6, a + 0.6 + (k >> 2) * 0.6); }
      table(K, mid + 0.2, rm.fv, 1.9, 1.0, 0.88, f, 'wood_dark', 'cloth_white'); K.B('cloth_blue', mid - 0.3, mid + 0.4, f + 0.89, f + 0.96, rm.fv - 0.3, rm.fv + 0.3);
      K.LA('wood_dark', [[0.2, 0], [0.04, 0.02], [0.04, 1.0], [0.001, 1.05]], 6, u1 - 1.1, f, v1 - 0.6); K.B('cloth_red', u1 - 1.28, u1 - 0.92, f + 0.9, f + 1.5, v1 - 0.72, v1 - 0.48);
    } else if (tr === 'grocer' || tr === 'greengrocer' || tr === 'baker') {
      for (let k = 0; k < 6; k++) sack(K, u0 + 0.5 + (k % 3) * 0.5, v0 + 0.5 + (k >> 1) * 0.55, f, k % 2 ? 'sacking' : 'cloth_white');
      barrel(K, u1 - 0.7, v1 - 0.6, f); barrel(K, u1 - 1.4, v1 - 0.5, f, 0.8, 0.27); crate(K, mid, mid + 0.9, v1 - 1.0, v1 - 0.2, f, 0.5); crate(K, mid + 0.1, mid + 0.8, v1 - 0.9, v1 - 0.3, f + 0.5, 0.4, 'wood_dark');
      shelves(K, u0 + 0.02, u0 + 0.4, v1 - 1.9, v1 - 0.2, f, '+u', [0.5, 1.0, 1.5], 2.0);
      for (let k = 0; k < 6; k++) K.LA(k % 2 ? 'wood_dark' : 'wood_dark', [[0.001, 0], [0.07, 0.01], [0.075, 0.2], [0.05, 0.24], [0.001, 0.25]], 8, u0 + 0.22, f + 0.53 + (k % 3) * 0.5, v1 - 1.7 + (k >> 1) * 0.5);
    } else if (tr === 'butcher') {
      K.B('iron', u0 + 0.5, u1 - 0.9, f + 2.2, f + 2.24, v0 + 1.4, v0 + 1.44); for (let u = u0 + 0.8; u < u1 - 1.1; u += 0.45) K.B(u > mid ? 'cloth_red' : 'hide_tan', u - 0.1, u + 0.1, f + 1.6, f + 2.2, v0 + 1.36, v0 + 1.48);
      table(K, mid, v1 - 0.9, 1.6, 0.8, 0.85, f, 'wood_dark', 'cloth_white'); barrel(K, u1 - 0.7, v0 + 0.6, f); barrel(K, u1 - 0.7, v0 + 1.3, f, 0.8, 0.27);
    } else if (tr === 'chemist') {
      shelves(K, u0 + 0.02, u0 + 0.4, v0 + 2.4, v0 + 3.9, f, '+u', [0.5, 1.0, 1.5, 2.0], 2.3);
      for (let k = 0; k < 12; k++) K.LA('wood_dark', [[0.001, 0], [0.07, 0.01], [0.08, 0.14], [0.05, 0.22], [0.02, 0.28], [0.03, 0.34]], 8, u0 + 0.22, f + 0.53 + (k % 4) * 0.5, v0 + 2.6 + (k >> 2) * 0.5);
      table(K, mid + 0.3, v1 - 0.8, 1.5, 0.75, 0.85, f, 'wood_dark'); K.LA('iron', [[0.001, 0], [0.1, 0], [0.12, 0.1], [0.001, 0.1]], 8, mid, f + 0.85, v1 - 0.8); K.LA('wood_dark', [[0.001, 0], [0.09, 0], [0.11, 0.1], [0.001, 0.1]], 8, mid + 0.4, f + 0.85, v1 - 0.8);
    } else if (tr === 'bootmaker') {
      table(K, rm.winU, v0 + 0.5, 1.7, 0.7, 0.8, f, 'wood_dark'); for (let k = 0; k < 4; k++) K.B('hide_black', rm.winU - 0.7 + k * 0.4, rm.winU - 0.55 + k * 0.4, f + 0.8, f + 0.95, v0 + 0.35, v0 + 0.65); K.B('iron', rm.winU + 0.4, rm.winU + 0.6, f + 0.8, f + 0.9, v0 + 0.3, v0 + 0.5);
      chair(K, rm.winU - 0.4, v0 + 1.15, '-v', f); shelves(K, u0 + 0.02, u0 + 0.4, v0 + 2.4, v0 + 3.9, f, '+u', [0.5, 1.0, 1.5], 2.0);
      for (let k = 0; k < 6; k++) K.B(k % 3 ? 'wood_dark' : 'hide_black', u0 + 0.4, u0 + 0.5, f + 0.53 + (k % 3) * 0.5, f + 0.7 + (k % 3) * 0.5, v0 + 2.5 + (k >> 1) * 0.4, v0 + 2.8 + (k >> 1) * 0.4);
      for (let k = 0; k < 4; k++) K.LA('hide_tan', [[0.001, 0], [0.12, 0], [0.12, 0.12], [0.001, 0.12]], 8, mid + (k % 2) * 0.35, f, v1 - 0.6 - (k >> 1) * 0.35);
    } else {
      // pawnbroker, barber, tobacconist: pledges in bundles on shelves, trunks, boxes
      shelves(K, u0 + 0.02, u0 + 0.4, v0 + 2.4, v0 + 3.9, f, '+u', [0.5, 1.0, 1.5, 2.0], 2.3);
      for (let k = 0; k < 8; k++) K.B(['cloth_brown', 'cloth_white', 'cloth_grey', 'hide_tan', 'cloth_indigo'][k % 5], u0 + 0.4, u0 + 0.55, f + 0.53 + (k % 4) * 0.5, f + 0.8 + (k % 4) * 0.5, v0 + 2.5 + (k >> 2) * 0.7, v0 + 2.95 + (k >> 2) * 0.7);
      trunk(K, mid - 0.4, mid + 0.5, v1 - 0.9, v1 - 0.2, f, 0.5); crate(K, mid + 0.7, mid + 1.5, v1 - 0.9, v1 - 0.2, f, 0.45); crate(K, mid + 0.8, mid + 1.4, v1 - 0.8, v1 - 0.3, f + 0.45, 0.35, 'wood_dark');
    }
    lamp(K, mid, (v0 + v1) / 2, c, 0.5);
  },
};
void bed;

/**
 * The upper floors of a house: the walls pierced by their windows, the slabs, the dogleg of each storey, the partitions with their doors,
 * and the rooms by use. spec: { mat, y, g0 (the first floor's slab bottom over y), st, n (storeys), Z, pv (front/back division), L, D,
 * wins(s) → { front: [holes], back: [holes] } with u in the frame, doors: { hall: [[v0, v1], …], div: [u0, u1] }, kinds(s) → [front, back],
 * paper(kind) → material, extras }.
 */
export function upperFloors(K, spec, rnd, ctx) {
  const { mat, y, g0, st, n, Z, pv, L, D } = spec, H = g0 + (n - 1) * st, hw = Z.hw, uR = L - SIDE;
  const yb = (s) => y + g0 + (s - 1) * st, fl = (s) => yb(s) + SLAB, ceilOf = (s) => (s < n - 1 ? yb(s + 1) : y + H - 0.4);
  // the shell in few pieces (one box of brick is one piece of the mesh, and the engine turns a material of many boxes into a draw of its own): the piers
  // and the side walls run through all the storeys, only the sills and lintels are cut by storey; the colliders by storey (pierced)
  const top = y + H, p1 = yb(1);
  const spans = (side) => { const all = []; for (let s = 1; s < n; s++) for (const h of spec.wins(s)[side]) if (!all.some((q) => Math.abs(q.u - h.u) < 0.01)) all.push({ u: h.u, w: h.w }); return all.sort((a, b) => a.u - b.u); };
  for (const [side, v0, v1] of [['front', 0, T], ['back', D - T, D]]) {
    let c = 0; const sp = spans(side);
    for (const q of sp) { const a = q.u - q.w / 2, e = q.u + q.w / 2; if (a - c > 0.005) K.B(mat, c, a, p1, top, v0, v1); c = e; }
    if (L - c > 0.005) K.B(mat, c, L, p1, top, v0, v1);
    for (let s = 1; s < n; s++) for (const h of spec.wins(s)[side]) { const a = h.u - h.w / 2, e = h.u + h.w / 2, b = yb(s), t = s < n - 1 ? yb(s + 1) : top; if (h.y0 > b + 0.005) K.B(mat, a, e, b, h.y0, v0, v1); if (t > h.y1 + 0.005) K.B(mat, a, e, h.y1, t, v0, v1); }
  }
  K.B(mat, 0, SIDE, p1, top, T, D - T); K.B(mat, uR, L, p1, top, T, D - T);
  for (let s = 1; s < n; s++) {
    const b = yb(s), t = s < n - 1 ? yb(s + 1) : y + H, f = fl(s), c = ceilOf(s), w = spec.wins(s);
    pierced(K, mat, 0, T, L, b, t, w.front, true); pierced(K, mat, D - T, D, L, b, t, w.back, true);
    K.C(0, SIDE, b, t, T, D - T); K.C(uR, L, b, t, T, D - T);
    for (const h of w.front) glaze(K, h, 0, T, h.curtain);
    for (const h of w.back) glaze(K, { ...h, open: true }, D - T, D, h.curtain);
    slab(K, Z, b, 0, uR);
    // the hall's partition with its doors; the dividing wall between front and back room with its door
    let v = T;
    for (const [d0, d1] of [...spec.doors.hall, [D, D]]) { if (d0 - v > 0.01) K.W('stucco_cream', hw, hw + 0.12, f, t, v, Math.min(d0, D - T)); if (d1 < D - T) K.W('stucco_cream', hw, hw + 0.12, f + 2.1, t, d0, d1); v = d1; }
    const [du0, du1] = spec.doors.div;
    K.W('stucco_cream', hw + 0.12, du0, f, t, pv, pv + 0.14); K.W('stucco_cream', du1, uR, f, t, pv, pv + 0.14); K.W('stucco_cream', du0, du1, f + 2.1, t, pv, pv + 0.14);
    // the rooms
    const [kf, kb] = spec.kinds(s), mk = (kind, v0, v1, front) => ({ u0: hw + 0.12, u1: uR, v0, v1, f, c, fv: (v0 + v1) / 2, paper: spec.paper(kind, s), front, winU: spec.winU, trade: spec.trade, maid: spec.maid?.(s, front) });
    const rf = mk(kf, T, pv, true), rb = mk(kb, pv + 0.14, D - T, false);
    for (const [rm, kind] of [[rf, kf], [rb, kb]]) {
      paper(K, rm, { noHall: true, noFront: false, noBack: false });
      // the paper on the hall's partition (two pieces beside its door) and on the dividing wall's faces
      ROOMS[kind](K, rm, rnd, mat);
    }
    // stair for the next storey
    if (s < n - 1) dogleg(K, Z, f, fl(s + 1), {}); else topGuard(K, Z, f);
    // the stair hall's own finish: runner on the landing, a gas bracket
    K.B('iron', SIDE + 0.12, hw - 0.12, f, f + 0.008, T + 0.3, Z.zs - 0.15);
    K.LA('lamp_glass', [[0.03, 0], [0.1, 0.06], [0.1, 0.22], [0.001, 0.26]], 8, (SIDE + hw) / 2, f + 2.2, Math.max(T + 0.8, Z.zs - 0.9));
  }
}

// ── the terrace house ────────────────────────────────────────────────────────
/** the numbers of a terrace house's plan (houseinside.js: the hall beside the door, the front room to v = 4.6) */
export function terraceSpec(el) {
  const [x0, z0, x1, z1] = el.rect, L = x1 - x0, D = z1 - z0, hw = L / 4 + 0.6;
  return { L, D, hw, Z: zoneOf(D, hw, 8), pv: 4.6, n: el.storeys ?? 3, st: 3.2 };
}
/** the windows of the upper storeys in the frame's u: the landing's over the door, the room's over the parlour's; French windows (gap) onto the balcony at the first floor */
export function terraceWindows(el, type, s) {
  const { L, hw } = terraceSpec(el), y = el.y ?? 0, st = 3.2, f1 = y + st + SLAB, hh = s === 1 ? 2.2 : 1.8, y0 = y + s * st + 0.9;
  const door = { u: L / 4, w: 1.0, y0, y1: y0 + hh }, room = { u: 3 * L / 4, w: 1.0, y0, y1: y0 + hh };
  if (s === 1 && type === 'stucco') { door.y0 = f1; door.y1 = f1 + 2.5; door.gap = true; }
  else if (s === 1) { room.y0 = f1; room.y1 = f1 + 2.5; room.gap = true; }
  void hw;
  return { door, room };
}
export function terraceUp(el, ctx, o) {
  const K = frame(el, ctx, !!el.mirror), S = terraceSpec(el), { L, D, hw, Z, pv, n } = S, rnd = rng((el.seed || 1) ^ 0x5bd1), V = el.variant ?? 'parlour';
  const back = (s) => { const y0 = (el.y ?? 0) + s * 3.2 + 0.9; return { u: (hw + 0.12 + L - SIDE) / 2, w: 0.9, y0, y1: y0 + 1.5 }; };
  const spec = {
    mat: o.mat, y: el.y ?? 0, g0: 3.2, st: 3.2, n, Z, pv, L, D, winU: 3 * L / 4,
    wins: (s) => { const w = terraceWindows(el, o.type, s); return { front: [{ ...w.door, curtain: s === 1 ? 'cloth_red' : null }, { ...w.room, curtain: s === 1 ? 'cloth_red' : 'cloth_white' }], back: [{ ...back(s), curtain: 'cloth_white' }] }; },
    doors: { hall: Z.zs >= 6.0 ? [[1.5, 2.4], [5.0, 5.9]] : [[1.5, 2.4]], div: [hw + 0.25, hw + 1.15] },
    kinds: (s) => V === 'lodging' ? ['lodge', 'lodge'] : s === 1 ? (V === 'parlour' ? ['drawing', 'master'] : ['workroom', 'master']) : s === n - 1 ? ['attic', 'box'] : ['nursery', 'box'],
    paper: (k) => ({ drawing: 'cloth_red', master: 'paint_fleur', nursery: 'cloth_blue', sitting: 'cloth_green', workroom: 'stucco_cream', box: 'stucco_cream', attic: 'plaster_white', lodge: 'stucco_cream' }[k]),
    maid: (s, front) => front && V === 'parlour' && (s === 1 || s === n - 1),
  };
  upperFloors(K, spec, rnd, ctx);
}
/** walk-check route of a terrace house: from the pavement through the door, up every flight, into the top front room */
export function terraceRoute(el) {
  const K = frame(el, { bag: { add() {} }, col: { rect() {}, floor() {}, ramp() {}, circle() {} } }, !!el.mirror), { L, hw, Z, n } = terraceSpec(el);
  const pt = (u, v) => K.P(u, v), r = [], du = L / 4, ac = (Z.ua0 + Z.ua1) / 2, bc = (Z.ub0 + Z.ub1) / 2;
  r.push(pt(du, -1.0), pt(du, 1.0), pt(ac, Z.zs - 0.6));
  for (let s = 0; s < n - 1; s++) {
    r.push(pt(ac, Z.zs + 0.7), pt(ac, Z.ze - 0.5), pt((Z.ua0 + Z.ub1) / 2, Z.ze + 0.55), pt(bc, Z.ze - 0.5), pt(bc, Z.zs + 0.6), pt(bc, Z.zs - 0.7));
    if (s < n - 2) r.push(pt(ac, Z.zs - 0.7));
  }
  r.push(pt(hw - 0.3, 1.95), pt(hw + 0.4, 1.95));
  return r;
}

// ── the shop with its dwelling ───────────────────────────────────────────────
export const SHOP_HW = 1.9;
export function shopSpec(el) {
  const [x0, z0, x1, z1] = el.rect, Wd = x1 - x0, D = z1 - z0;
  const r = rng(el.seed || 1); r();                            // shops.js: brickOf takes the first draw, the side of the door the second
  return { Wd, D, hw: SHOP_HW, Z: zoneOf(D, SHOP_HW, 10), pv: 4.4, g0: 3.8, st: 3.2, n: el.storeys ?? 3, left: r() < 0.5 };
}
/** the upper windows of a shop in the frame's u (the stair side first): the hall's (over the landing) and the room's; the room's at the first floor is a French window onto the balcony */
export function shopWindows(el, s) {
  const { Wd, hw, g0, st } = shopSpec(el), y = el.y ?? 0, base = y + g0 + (s - 1) * st, f1 = y + g0 + SLAB, hh = s === 1 ? 2.2 : 1.8;
  const hall = { u: (SIDE + hw) / 2, w: 1.0, y0: base + 0.9, y1: base + 0.9 + hh }, room = { u: (hw + 0.12 + Wd - SIDE) / 2, w: 1.0, y0: base + 0.9, y1: base + 0.9 + hh };
  if (s === 1) { room.y0 = f1; room.y1 = f1 + 2.5; room.gap = true; }
  return { hall, room };
}
const PAPER = { drawing: 'cloth_red', master: 'paint_fleur', nursery: 'cloth_blue', sitting: 'cloth_green', workroom: 'stucco_cream', box: 'stucco_cream', attic: 'plaster_white', lodge: 'stucco_cream', club: 'cloth_red', landlord: 'paint_fleur', letting: 'cloth_green', stock: 'plaster_white' };
export function shopUp(el, ctx, o) {
  const S = shopSpec(el), { Wd, D, hw, Z, pv, g0, st, n } = S, K = frame(el, ctx, !o.left), rnd = rng((el.seed || 1) ^ 0x77f1);
  const back = (s) => { const y0 = (el.y ?? 0) + g0 + (s - 1) * st + 0.9; return { u: (hw + 0.12 + Wd - SIDE) / 2, w: 0.9, y0, y1: y0 + 1.5 }; };
  upperFloors(K, {
    mat: o.mat, y: el.y ?? 0, g0, st, n, Z, pv, L: Wd, D, winU: Wd * 0.73, trade: el.trade,
    wins: (s) => { const w = shopWindows(el, s); return { front: [{ ...w.hall, curtain: 'cloth_white' }, { ...w.room, curtain: s === 1 ? 'cloth_green' : 'cloth_white' }], back: [{ ...back(s), curtain: 'cloth_white' }] }; },
    doors: { hall: Z.zs >= 6.0 ? [[1.5, 2.4], [5.0, 5.9]] : [[1.5, 2.4]], div: [hw + 0.25, hw + 1.15] },
    kinds: (s) => s === 1 ? ['sitting', 'master'] : s === n - 1 ? ['stock', 'attic'] : ['nursery', 'box'],
    paper: (k) => PAPER[k], maid: () => false,
  }, rnd, ctx);
}
export function shopRoute(el) {
  const { hw, Z, n, left } = shopSpec(el), K = frame(el, { bag: { add() {} }, col: { rect() {}, floor() {}, ramp() {}, circle() {} } }, !left), pt = (u, v) => K.P(u, v), r = [];
  const ac = (Z.ua0 + Z.ua1) / 2, bc = (Z.ub0 + Z.ub1) / 2;
  r.push(pt(0.97, -1.0), pt(0.97, 1.0), pt(ac, Z.zs - 0.6));
  for (let s = 0; s < n - 1; s++) {
    r.push(pt(ac, Z.zs + 0.7), pt(ac, Z.ze - 0.5), pt((Z.ua0 + Z.ub1) / 2, Z.ze + 0.55), pt(bc, Z.ze - 0.5), pt(bc, Z.zs + 0.6), pt(bc, Z.zs - 0.7));
    if (s < n - 2) r.push(pt(ac, Z.zs - 0.7));
  }
  r.push(pt(hw - 0.3, 1.95), pt(hw + 0.4, 1.95));
  return r;
}

// ── the public house ─────────────────────────────────────────────────────────
export function pubSpec(el) {
  const [x0, z0, x1, z1] = el.rect, Wd = x1 - x0, D = z1 - z0;
  return { Wd, D, hw: SHOP_HW, Z: zoneOf(D, SHOP_HW, 10), pv: 4.4, g0: 4.0, st: 3.3, n: 3, nw: Math.max(2, Math.round(Wd / 2.6)), east: el.corner === 'e' };
}
/** the pub's upper windows in the frame's u (P = world u mirrored when the stair is on the high side): one per bay; the first-floor window nearest the middle of the club room is the French window */
export function pubWindows(el, s) {
  const { Wd, hw, g0, st, nw, east } = pubSpec(el), y = el.y ?? 0, base = y + g0 + (s - 1) * st, f1 = y + g0 + SLAB, hh = s === 1 ? 2.3 : 1.9, out = [];
  for (let i = 0; i < nw; i++) { const uw = (i + 0.5) * Wd / nw, u = east ? uw : Wd - uw; out.push({ u, uw, w: 0.95, y0: base + 0.9, y1: base + 0.9 + hh }); }
  if (s === 1) { const mid = (hw + Wd) / 2, cand = out.filter((h) => h.u > hw + 0.6).sort((a, b) => Math.abs(a.u - mid) - Math.abs(b.u - mid))[0]; if (cand) { cand.y0 = f1; cand.y1 = f1 + 2.5; cand.gap = true; } }
  return out;
}
export function pubUp(el, ctx, o) {
  const S = pubSpec(el), { Wd, D, hw, Z, pv, g0, st, n, east } = S, K = frame(el, ctx, !east), rnd = rng((el.seed || 1) ^ 0x33c5);
  const back = (s) => { const y0 = (el.y ?? 0) + g0 + (s - 1) * st + 0.9; return { u: (hw + 0.12 + Wd - SIDE) / 2, w: 0.9, y0, y1: y0 + 1.5 }; };
  upperFloors(K, {
    mat: o.mat, y: el.y ?? 0, g0, st, n, Z, pv, L: Wd, D, winU: (hw + Wd) / 2,
    wins: (s) => ({ front: pubWindows(el, s).map((h) => ({ ...h, curtain: s === 1 ? 'cloth_red' : 'cloth_white' })), back: [{ ...back(s), curtain: 'cloth_white' }] }),
    doors: { hall: [[1.5, 2.4]], div: [hw + 0.25, hw + 1.15] },
    kinds: (s) => s === 1 ? ['club', 'landlord'] : ['letting', 'attic'], paper: (k) => PAPER[k], maid: (s, front) => s === 1 && front,
  }, rnd, ctx);
}
export function pubRoute(el) {
  const { Wd, hw, Z, n } = pubSpec(el), K = frame(el, { bag: { add() {} }, col: { rect() {}, floor() {}, ramp() {}, circle() {} } }, el.corner !== 'e'), pt = (u, v) => K.P(u, v), r = [];
  const ac = (Z.ua0 + Z.ua1) / 2, bc = (Z.ub0 + Z.ub1) / 2;
  r.push(pt(Wd - 1.3, -1.0), pt(Wd - 1.3, 0.9), pt(1.4, 0.9), pt(ac, Z.zs - 0.6));
  for (let s = 0; s < n - 1; s++) {
    r.push(pt(ac, Z.zs + 0.7), pt(ac, Z.ze - 0.5), pt((Z.ua0 + Z.ub1) / 2, Z.ze + 0.55), pt(bc, Z.ze - 0.5), pt(bc, Z.zs + 0.6), pt(bc, Z.zs - 0.7));
    if (s < n - 2) r.push(pt(ac, Z.zs - 0.7));
  }
  r.push(pt(hw - 0.3, 1.95), pt(hw + 0.4, 1.95));
  return r;
}
