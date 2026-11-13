// A Lasta round house you can enter (docs/settlements/lalibela.md §14): a drum of red stone with one
// low door, the thatch on rafters round a central post, and inside the furniture of a highland
// household — the hearth with its injera griddle (mitad) on three stones, a raised bed of mud and hide,
// great clay jars, the basket table (mesob), a stool.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';

const TU = 'tuff_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
/** A thin prism of n sides from p to q (flat triangles pushed into out). */
export function rod(out, p, q, r, n = 4) {
  const d = norm3([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm3(cross3(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross3(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = (k + 0.5) / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...B[k], ...B[k1], ...A[k], ...B[k1], ...A[k1]); }
  for (let k = 1; k + 1 < n; k++) out.push(...A[0], ...A[k], ...A[k + 1], ...B[0], ...B[k + 1], ...B[k]);
}

/**
 * hut: { c [x, z], r (the drum's outer radius), y (the ground), door (the angle the door faces, rad), seed }.
 * Walls 0.55 m thick in 22 straight lengths (the door the twenty-third's place), 2.8 m high, the
 * thatch's underside lined and its rafters showing; colliders for the wall, the post and the furniture.
 */
export function hut(el, { bag, col }) {
  const rand = rng(el.seed || 7), [x, z] = el.c, r = el.r ?? 3.9, y = el.y ?? 0, da = el.door ?? Math.PI, H = 2.8, N = 22, TH = 0.55, rm = r - TH / 2, ri = r - TH, dth = Math.PI * 2 / N;
  const nrm = [Math.cos(da), Math.sin(da)], tan = [-Math.sin(da), Math.cos(da)];
  const mir = (el.seed || 7) & 1 ? -1 : 1, W = (sx, sd) => [x + nrm[0] * sd + tan[0] * sx * mir, z + nrm[1] * sd + tan[1] * sx * mir];      // sx along the wall (to the left of the door's outward normal), sd from the centre toward the door
  // ---- the drum
  const ext = TH / 2 * Math.tan(dth / 2) + 0.01;
  for (let k = 0; k < N; k++) {
    const a0 = da + (k - 0.5) * dth, a1 = da + (k + 0.5) * dth, A = [x + Math.cos(a0) * rm, z + Math.sin(a0) * rm], B = [x + Math.cos(a1) * rm, z + Math.sin(a1) * rm];
    if (k === 0) {                                                  // the doorway: a lintel stone over it
      bag.add(TU, orientedBox(A, B, TH, y + 1.95, y + H, ext)); col.segment(A, B, TH, y + 1.95, y + H);
      continue;
    }
    bag.add(TU, orientedBox(A, B, TH, y - 0.3, y + H, ext)); col.segment(A, B, TH, y, y + H);
    for (const yy of [0.62, 1.3, 2.0]) bag.add('rubble', orientedBox(A, B, TH + 0.05, y + yy, y + yy + 0.08, ext));      // the courses' proud bands
  }
  // the door: timber jambs and lintel, the plank leaf standing ajar inside against the wall
  { const hw = rm * Math.sin(dth / 2), P = (s, d) => W(s, d);
    for (const sg of [-1, 1]) bag.add('timber', orientedBox(P(sg * (hw + 0.07), rm - 0.32), P(sg * (hw + 0.07), rm + 0.32), 0.14, y, y + 1.95));
    bag.add('timber', orientedBox(P(-hw - 0.2, rm), P(hw + 0.2, rm), TH + 0.2, y + 1.95, y + 2.12));
    bag.add('timber', orientedBox(P(hw - 0.05, rm - 0.35), P(hw - 0.05 - 0.55, rm - 0.95), 0.05, y, y + 1.75));
    bag.add('rubble', orientedBox(P(-hw - 0.3, rm + 0.3), P(hw + 0.3, rm + 0.3), 0.5, y - 0.1, y + 0.12)); }       // the threshold stone
  // ---- the floor: beaten earth, a hand above the ground
  bag.add('mud_plaster', lathe([[0.001, 0.05], [ri, 0.05], [ri, 0.0], [0.001, 0.0]], 24, null, x, y, z));
  // ---- the roof: thatch over the wall's top, its underside lined, the wedge between wall and thatch closed
  const Hc = 4.7, yw = y + H;
  const outer = [[r + 0.9, -0.4], [r + 0.5, -0.08], [r, 0.3], [r * 0.7, 1.55], [r * 0.4, 3.0], [0.2, Hc - 0.12], [0.001, Hc]];
  bag.add('thatch', lathe(outer, 22, (th) => 1 + 0.02 * Math.sin(th * 13 + (el.seed || 0)), x, yw, z));
  const under = outer.map(([rr, hh]) => [Math.max(0.001, rr - 0.06), hh - 0.3]);
  bag.add('thatch', lathe([...under].reverse(), 22, null, x, yw, z));
  bag.add('thatch', lathe([[ri - 0.01, 0.0], [ri - 0.01, 0.62]].reverse(), 22, null, x, yw, z));
  bag.add('terracotta', lathe([[0.001, Hc - 0.12], [0.16, Hc - 0.1], [0.2, Hc + 0.05], [0.15, Hc + 0.22], [0.09, Hc + 0.26], [0.001, Hc + 0.26]], 10, null, x, yw, z));
  bag.add('timber', lathe([[0.025, Hc + 0.2], [0.02, Hc + 0.75], [0.001, Hc + 0.76]], 5, null, x, yw, z));
  col.circle(x, z, r + 0.9, yw - 0.4, yw + 1.4);
  // rafters under the lining (poles from the wall plate to the apex), the plate and two purlin rings
  { const t = [], u = (rr, hh) => ({ rr, hh }), at = (rr, hh, a) => [x + Math.cos(a) * rr, yw + hh, z + Math.sin(a) * rr];
    const prof = under.map(([rr, hh]) => u(rr, hh - 0.06)).filter((p) => p.hh > 0.4).reverse();
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + 0.1; for (let i = 0; i + 1 < prof.length; i++) rod(t, at(prof[i].rr, prof[i].hh, a), at(prof[i + 1].rr, prof[i + 1].hh, a), 0.045); }
    for (const [rr, hh] of [[ri - 0.04, 0.06], [r * 0.7 - 0.06, 1.55 - 0.36], [r * 0.4 - 0.06, 3.0 - 0.36]]) for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2, a1 = (k + 1) / 20 * Math.PI * 2; rod(t, at(rr, hh, a0), at(rr, hh, a1), 0.05); }
    bag.add('timber', fromTriangles(t)); }
  // the central post, forked at the head, and a cross-tie to the rafters
  { const t = []; rod(t, [x, y, z], [x, yw + 3.1, z], 0.13, 8); for (const s of [-1, 1]) rod(t, [x, yw + 2.6, z], [x + s * 1.0 * Math.cos(da), yw + 3.2, z + s * 1.0 * Math.sin(da)], 0.05); bag.add('timber', fromTriangles(t)); col.circle(x, z, 0.16, y, y + H); }
  // ---- the hearth and its griddle: three hearthstones round an ash bed, the clay mitad (injera plate) on them
  { const [hx, hz] = W(0.0, 1.15);
    bag.add('rubble', lathe([[0.001, 0.07], [0.5, 0.07], [0.52, 0.0], [0.001, 0.0]], 12, null, hx, y, hz));
    bag.add('hide_grey', lathe([[0.001, 0.075], [0.38, 0.075], [0.001, 0.075]], 12, null, hx, y, hz));
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.3; bag.add('rubble', lathe([[0.001, 0.0], [0.1, 0.0], [0.11, 0.2], [0.08, 0.28], [0.001, 0.28]], 8, (th) => 1 + 0.12 * Math.sin(th * 3 + k), hx + Math.cos(a) * 0.26, y, hz + Math.sin(a) * 0.26)); }
    bag.add('pottery_dark', lathe([[0.001, 0.3], [0.36, 0.3], [0.38, 0.31], [0.38, 0.34], [0.34, 0.33], [0.001, 0.32]], 16, null, hx, y, hz));
    bag.add('flame', lathe([[0.001, 0.075], [0.14, 0.075], [0.08, 0.2], [0.001, 0.27]], 6, null, hx, y, hz));          // the embers' glow: the room's light
    col.circle(hx, hz, 0.5, y, y + 0.35); }
  // ---- the raised bed at the back: a platform of mud with hide spread on it and a rolled blanket
  { const a = W(-1.15, -2.45), b = W(1.15, -2.45);
    bag.add('mud_plaster', orientedBox(a, b, 1.1, y, y + 0.46)); col.segment(a, b, 1.1, y, y + 0.46);
    const a2 = W(-1.1, -2.45), b2 = W(1.1, -2.45);
    bag.add('hide_tan', orientedBox(a2, b2, 1.0, y + 0.46, y + 0.5));
    const [px, pz] = W(-0.7, -2.45);
    bag.add('cloth_white', lathe([[0.001, -0.5], [0.12, -0.5], [0.15, -0.3], [0.15, 0.3], [0.12, 0.5], [0.001, 0.5]], 8).rotateX(Math.PI / 2).rotateY(-da + Math.PI / 2).translate(px, y + 0.66, pz)); }
  // ---- clay: two great storage jars against the wall, a water pot by the door, the basket table, a stool
  const jar = (sx, sd, s, mat = 'terracotta') => { const [jx, jz] = W(sx, sd); bag.add(mat, lathe([[0.001, 0.0], [0.2 * s, 0.0], [0.4 * s, 0.35 * s], [0.47 * s, 0.7 * s], [0.42 * s, 1.05 * s], [0.27 * s, 1.22 * s], [0.3 * s, 1.3 * s], [0.001, 1.3 * s]], 14, (th) => 1 + 0.015 * Math.sin(th * 5 + rand() * 0), jx, y, jz)); col.circle(jx, jz, 0.42 * s, y, y + 1.3 * s); };
  jar(-2.35, -1.7, 1.0); jar(2.3, -1.85, 0.9, 'pottery_dark'); jar(-1.9, 1.95, 0.55);
  { const [mx, mz] = W(1.35, 0.5);                                // the mesob: a woven table, its lid a cone
    bag.add('wicker', lathe([[0.001, 0.0], [0.16, 0.0], [0.2, 0.3], [0.3, 0.52], [0.34, 0.6], [0.001, 0.6]], 14, null, mx, y, mz));
    bag.add('wicker', lathe([[0.001, 0.62], [0.36, 0.6], [0.3, 0.7], [0.14, 0.9], [0.05, 1.02], [0.001, 1.04]], 14, null, mx, y, mz));
    col.circle(mx, mz, 0.36, y, y + 1.0); }
  { const [sx2, sz2] = W(-1.25, 0.95);
    bag.add('wood_dark', lathe([[0.001, 0.32], [0.18, 0.32], [0.18, 0.28], [0.001, 0.28]], 10, null, sx2, y, sz2));
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('wood_dark', lathe([[0.001, 0.0], [0.03, 0.0], [0.03, 0.28], [0.001, 0.28]], 5, null, sx2 + Math.cos(a) * 0.12, y, sz2 + Math.sin(a) * 0.12)); }
    col.circle(sx2, sz2, 0.2, y, y + 0.35); }
  // a goatskin water bag and a hide hung on the wall pegs opposite the door (the stone wall has pegs of timber)
  { const [px, pz] = W(0.0, -ri + 0.04), t = [];
    bag.add('timber', orientedBox(W(-0.5, -ri + 0.06), W(0.5, -ri + 0.06), 0.06, y + 1.7, y + 1.76));
    bag.add('hide_brown', orientedBox(W(-0.35, -ri + 0.1), W(0.05, -ri + 0.1), 0.04, y + 0.95, y + 1.7));
    bag.add('hide_tan', lathe([[0.001, -0.3], [0.1, -0.22], [0.14, 0.0], [0.1, 0.2], [0.04, 0.3], [0.001, 0.3]], 8, null, ...W(0.32, -ri + 0.2).flatMap((v, i) => (i === 0 ? [v] : [y + 1.45, v]))));
    void px; void pz; void t; }
  variant(el.kind, { bag, col, W, y, yw, ri, rand, da, seed: el.seed || 7 });
  // ---- every house: smoke-dark thatch inside above the hearth, a hanging cross-tie with dried gourds and a string of peppers
  { const t = [], [hx, hz] = W(0.0, 1.15);
    for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.3; rod(t, [hx + Math.cos(a) * 0.5, yw + 0.7, hz + Math.sin(a) * 0.5], [hx + Math.cos(a) * 0.55, yw + 1.5, hz + Math.sin(a) * 0.55], 0.012, 3); }
    bag.add('rope_fibre', fromTriangles(t));
    for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.3; bag.add(k % 2 ? 'wicker' : 'cloth_red', lathe([[0.001, 0], [0.09, 0.08], [0.1, 0.18], [0.04, 0.3], [0.001, 0.32]], 7, null, hx + Math.cos(a) * 0.55, yw + 0.7 - 0.0, hz + Math.sin(a) * 0.55)); } }
}
/** The kinds of household: the extras that make a house a weaver's, a brewer's, a scribe's, a farmer's store. */
function variant(kind, { bag, col, W, y, yw, ri, rand, da, seed }) {
  const P3 = (sx, sd, h) => { const [px, pz] = W(sx, sd); return [px, y + h, pz]; };
  const along = (sx, sd) => { const a = W(sx - 0.5, sd), b = W(sx + 0.5, sd); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  if (kind === 'weaver') {
    // a frame loom (the cotton of the shamma): two posts, a top beam, the warp threads, the cloth woven up from the breast beam
    const t = [], th = [], c0 = W(1.9, 1.3), ang = along(1.9, 1.3), ca = Math.cos(ang), sa = Math.sin(ang);
    const Q = (a, h) => [c0[0] + ca * a, y + h, c0[1] + sa * a];
    for (const s of [-1, 1]) rod(t, Q(s * 0.55, 0), Q(s * 0.55, 1.55), 0.045, 5);
    rod(t, Q(-0.6, 1.5), Q(0.6, 1.5), 0.04, 5); rod(t, Q(-0.6, 0.34), Q(0.6, 0.34), 0.04, 5);
    for (let k = 0; k < 22; k++) { const a = -0.5 + k * 0.047; rod(th, Q(a, 0.36), Q(a, 1.48), 0.004, 3); }
    bag.add('timber', fromTriangles(t)); bag.add('cloth_white', fromTriangles(th));
    bag.add('cloth_ochre', orientedBox([c0[0] - ca * 0.5, c0[1] - sa * 0.5], [c0[0] + ca * 0.5, c0[1] + sa * 0.5], 0.03, y + 0.38, y + 0.78));
    bag.add('cloth_red', orientedBox([c0[0] - ca * 0.5, c0[1] - sa * 0.5], [c0[0] + ca * 0.5, c0[1] + sa * 0.5], 0.032, y + 0.78, y + 0.84));
    col.segment([c0[0] - ca * 0.6, c0[1] - sa * 0.6], [c0[0] + ca * 0.6, c0[1] + sa * 0.6], 0.2, y, y + 1.6);
    const [bx, bz] = W(2.4, 0.2); bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.001, 0.2]], 10, null, bx, y, bz)); bag.add('cloth_white', lathe([[0.001, 0.2], [0.18, 0.2], [0.1, 0.34], [0.001, 0.36]], 8, null, bx, y, bz)); col.circle(bx, bz, 0.26, y, y + 0.3);
    for (let k = 0; k < 3; k++) { const [px, pz] = W(-2.1 + k * 0.28, 2.1 - k * 0.1); bag.add('cloth_white', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.1], [0.001, 0.14]], 7, null, px, y, pz)); }
  } else if (kind === 'brewer') {
    // the beer (tella): great jars brewing, a dipper of gourd, cups on a shelf, a bundle of gesho leaves on the wall
    for (const [sx, sd, sc, m] of [[2.25, 0.5, 1.1, 'pottery_dark'], [2.1, 1.5, 0.95, 'terracotta'], [1.2, 2.3, 0.8, 'pottery_dark']]) {
      const [jx, jz] = W(sx, sd);
      bag.add(m, lathe([[0.001, 0], [0.22 * sc, 0], [0.42 * sc, 0.3 * sc], [0.5 * sc, 0.65 * sc], [0.42 * sc, 1.0 * sc], [0.26 * sc, 1.18 * sc], [0.3 * sc, 1.26 * sc], [0.001, 1.26 * sc]], 12, null, jx, y, jz));
      bag.add('cloth_white', lathe([[0.001, 1.25 * sc], [0.31 * sc, 1.26 * sc], [0.33 * sc, 1.2 * sc], [0.001, 1.22 * sc]], 10, null, jx, y, jz));
      col.circle(jx, jz, 0.5 * sc, y, y + 1.3 * sc);
    }
    const sh = [W(-0.9, -ri + 0.1), W(0.9, -ri + 0.1)];
    bag.add('timber', orientedBox(sh[0], sh[1], 0.22, y + 1.2, y + 1.26));
    for (let k = 0; k < 7; k++) { const [px, pz] = W(-0.8 + k * 0.26, -ri + 0.18); bag.add('terracotta', lathe([[0.001, 0], [0.05, 0], [0.07, 0.09], [0.06, 0.1], [0.001, 0.09]], 7, null, px, y + 1.26, pz)); }
    const [lx, lz] = W(1.3, -ri + 0.25); bag.add('fresco_green', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.4], [0.07, 0.6], [0.001, 0.62]], 8, null, lx, y + 1.0, lz));
    const [gx, gz] = W(2.25, 0.5); bag.add('wicker', lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.07], [0.001, 0.1]], 8, null, gx + 0.3, y + 0.35, gz + 0.1));
  } else if (kind === 'scribe') {
    // a priest-scribe's house: a folding book stand with a manuscript of parchment between wooden boards, a hand cross on the wall,
    // a prayer stick (maqomia) leaning, a mat, a clay lamp
    const c0 = W(2.0, 0.7), ang = along(2.0, 0.7), t = [];
    const Q = (a, d, h) => [c0[0] + Math.cos(ang) * a - Math.sin(ang) * d, y + h, c0[1] + Math.sin(ang) * a + Math.cos(ang) * d];
    for (const s of [-1, 1]) { rod(t, Q(s * 0.3, -0.2, 0), Q(-s * 0.3, 0.2, 0.9), 0.025, 4); rod(t, Q(s * 0.3, 0.2, 0), Q(-s * 0.3, -0.2, 0.9), 0.025, 4); }
    bag.add('wood_dark', fromTriangles(t));
    bag.add('wood_dark', orientedBox(Q(-0.3, 0, 0.9).filter((_, i) => i !== 1), Q(0.3, 0, 0.9).filter((_, i) => i !== 1), 0.34, y + 0.9, y + 0.94));
    bag.add('hide_brown', orientedBox(Q(-0.24, 0, 0).filter((_, i) => i !== 1), Q(0.24, 0, 0).filter((_, i) => i !== 1), 0.26, y + 0.94, y + 1.05));
    bag.add('hide_white', orientedBox(Q(-0.22, 0, 0).filter((_, i) => i !== 1), Q(0.22, 0, 0).filter((_, i) => i !== 1), 0.23, y + 1.05, y + 1.09));
    col.circle(c0[0], c0[1], 0.4, y, y + 1.1);
    bag.add('reed_mat', orientedBox(W(0.9, 1.4), W(2.3, 1.4), 1.0, y + 0.0, y + 0.02));
    const [mx, mz] = W(-2.5, 0.2), s2 = []; rod(s2, [mx, y, mz], [mx, y + 1.4, mz], 0.022, 4); rod(s2, [mx - 0.1, y + 1.4, mz], [mx + 0.1, y + 1.38, mz], 0.025, 4); bag.add('wood_dark', fromTriangles(s2));
    const [cx, cz] = W(0.2, -ri + 0.05), cr = []; rod(cr, [cx, y + 1.6, cz], [cx, y + 1.95, cz], 0.012, 4); rod(cr, [cx - 0.1, y + 1.82, cz], [cx + 0.1, y + 1.82, cz], 0.012, 4); bag.add('bronze', fromTriangles(cr));
    const [lx, lz] = W(2.5, -0.6); bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.04, 0.55], [0.1, 0.62], [0.001, 0.62]], 8, null, lx, y, lz)); bag.add('flame', lathe([[0.001, 0.62], [0.03, 0.62], [0.02, 0.7], [0.001, 0.73]], 6, null, lx, y, lz));
  } else if (kind === 'store') {
    // the farmer's store: sacks of grain along the wall, two mud grain bins with lids, the plough (maresha) and yoke leaning, hides
    for (let k = 0; k < 6; k++) { const [sx, sz] = W(-2.2 + (k % 3) * 0.55, 0.4 + Math.floor(k / 3) * 0.55); bag.add('sacking', lathe([[0.001, 0], [0.24, 0], [0.27, 0.2], [0.22, 0.5], [0.1, 0.62], [0.001, 0.62]], 8, (th) => 1 + 0.06 * Math.sin(th * 3 + k), sx, y + (k > 2 ? 0 : 0), sz)); col.circle(sx, sz, 0.27, y, y + 0.6); }
    for (const [sx, sd] of [[2.2, 0.4], [2.0, 1.5]]) { const [bx, bz] = W(sx, sd); bag.add('mud_plaster', lathe([[0.001, 0], [0.42, 0], [0.52, 0.5], [0.5, 1.0], [0.36, 1.3], [0.001, 1.34]], 12, null, bx, y, bz)); bag.add('timber', lathe([[0.001, 1.34], [0.2, 1.33], [0.18, 1.4], [0.001, 1.42]], 8, null, bx, y, bz)); col.circle(bx, bz, 0.52, y, y + 1.4); }
    const t = [], a = W(-2.7, -1.0), b = W(-2.9, 0.3);
    rod(t, [a[0], y, a[1]], [b[0], y + 2.3, b[1]], 0.035, 5); rod(t, [a[0], y + 0.05, a[1]], [a[0] + 0.5, y + 0.05, a[1] + 0.2], 0.04, 5); rod(t, [b[0], y + 2.2, b[1]], [b[0] + 0.1, y + 1.4, b[1] + 0.5], 0.03, 5);
    bag.add('wood_dark', fromTriangles(t));
    const [hx, hz] = W(-0.5, -ri + 0.3); for (let k = 0; k < 3; k++) bag.add(k === 1 ? 'hide_tan' : 'hide_brown', box(hx - 0.4, y + k * 0.06, hz - 0.3 + k * 0.03, hx + 0.4, y + k * 0.06 + 0.06, hz + 0.3));
    for (let k = 0; k < 3; k++) { const [px, pz] = W(0.6 + k * 0.35, -ri + 0.35); bag.add('wicker', lathe([[0.001, 0], [0.2, 0.02], [0.25, 0.28], [0.001, 0.3]], 8, null, px, y + 1.25, pz)); }
  }
  void rand; void da; void seed; void yw;
}
