// Early Indian Buddhist architecture (2nd–1st century BCE): the vocabulary of the stupas at
// Sanchi. A hemispherical dome (anda) on a circular terrace (medhi) with a walk and a railing; a
// double stairway; on the flattened top a square railing (harmika) round the shaft of a triple
// parasol (chattra); the ground railing (vedika) of posts, lens-shaped crossbars and a rounded
// coping — timber construction turned into stone; gateways (torana) of two square posts with
// animal capitals and three architraves with volute ends; Ashoka's polished pillar with its lion
// capital; a monastery of cells round a court.

import { registerStyle, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, orientOutward, place } from '../../core/geom.js';
import { hexa, obox } from '../chinese/index.js';

const STONE = 'sandstone_dressed', RAIL = 'sandstone_rail', DOME = 'lime_plaster';

/**
 * A ring of railing { c, r, y, h, gaps: [angles in radians of openings], gap (half-width m), mat }:
 * octagonal posts, three crossbars, a rounded coping. Colliders follow each run of posts.
 */
function railRing(bag, col, c, r, y, h, gaps = [], gap = 1.8, mat = RAIL, walls = true) {
  const pitch = Math.max(0.7, h / 3.1), post = 0.3 * Math.max(0.45, h / 3.1);
  const N = Math.round(2 * Math.PI * r / pitch);
  const open = (a) => gaps.some((g) => { let d = Math.abs(((a - g) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d * r < gap; });
  const posts = [], bars = [];
  const pt = (a, rr = r) => [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr];
  for (let k = 0; k < N; k++) {
    const a = 2 * Math.PI * k / N, a1 = 2 * Math.PI * (k + 1) / N;
    if (open(a)) continue;
    const [px, pz] = pt(a);
    const u = [-Math.sin(a), Math.cos(a)], n = [Math.cos(a), Math.sin(a)];
    obox(posts, [px, pz], u, n, post, post, y, y + h - h * 0.19);
    if (open(a1)) continue;
    // three lens-shaped crossbars to the next post, and the coping over them
    const [qx, qz] = pt(a1), m = [(px + qx) / 2, (pz + qz) / 2], L = Math.hypot(qx - px, qz - pz) / 2;
    const uu = [(qx - px) / (2 * L), (qz - pz) / (2 * L)], nn = [-uu[1], uu[0]];
    for (let b = 0; b < 3; b++) { const yb = y + h * (0.2 + b * 0.22); obox(bars, m, uu, nn, L, post * 0.55, yb, yb + h * 0.14); }
    obox(bars, m, uu, nn, L + 0.02, post * 1.05, y + h * 0.81, y + h * 0.93);
    // the coping (uṣṇīṣa) rounded on top, as the timber rail it copies
    { const w = post * 0.8, y0 = y + h * 0.93 - y, ch = h * 0.07, L2 = L + 0.02;
      relief(bars, [[[-w, y0], [w, y0], [w, y0 + ch * 0.35], [w * 0.75, y0 + ch * 0.75], [0, y0 + ch], [-w * 0.75, y0 + ch * 0.75], [-w, y0 + ch * 0.35]]], [m[0] - uu[0] * L2, y, m[1] - uu[1] * L2], nn, uu, 2 * L2); }
    if (walls && col) col.segment([px, pz], [qx, qz], post * 2, y, y + h);
  }
  bag.add(mat, fromTriangles(posts));
  bag.add(mat, fromTriangles(bars));
}

// Figures carved in the round, built facing +x with the feet at the origin, about life-size at
// scale 1; placed with fig(), which turns +x to face the direction (dx, dz).
const ell = (rx, ry, x, y, z, n = 10, mod = null) => lathe([[0.001, -ry], [rx * 0.6, -ry * 0.8], [rx * 0.92, -ry * 0.4], [rx, 0], [rx * 0.92, ry * 0.4], [rx * 0.6, ry * 0.8], [0.001, ry]], n, mod, x, y + ry, z);
/** A lion seated on its haunches, the mane in flame-like locks, forelegs straight, jaws open: 1.2 m. */
function lionFig() {
  const g = [];
  g.push(ell(0.24, 0.25, -0.1, 0, 0, 8));
  g.push(lathe([[0.001, 0], [0.2, 0.03], [0.25, 0.25], [0.24, 0.5], [0.001, 0.6]], 10, null, 0.07, 0.04, 0));
  g.push(lathe([[0.001, 0], [0.22, 0.03], [0.29, 0.2], [0.3, 0.38], [0.24, 0.5], [0.12, 0.58], [0.001, 0.6]], 18, (th, i) => (i >= 2 && i <= 4 ? 1 + 0.12 * Math.abs(Math.cos(th * 9)) : 1), 0.1, 0.42, 0));
  for (const z of [-0.1, 0.1]) { g.push(rod([0.3, 0.02, z], [0.22, 0.62, z], 0.06, 6)); g.push(box(0.25, 0, z - 0.06, 0.4, 0.06, z + 0.06)); }
  g.push(lathe([[0.001, 0], [0.13, 0.03], [0.15, 0.13], [0.12, 0.24], [0.001, 0.27]], 10, null, 0.3, 0.84, 0));
  g.push(box(0.38, 0.92, -0.07, 0.5, 1.02, 0.07));
  g.push(box(0.38, 0.84, -0.06, 0.47, 0.88, 0.06));
  for (const z of [-0.09, 0.09]) g.push(lathe([[0.001, 0], [0.04, 0.03], [0.001, 0.07]], 5, null, 0.27, 1.08, z));
  return g;
}
/** An elephant standing, its trunk curling down, ears spread: 1.0 m to the back. */
function elephantFig() {
  const g = [];
  const body = lathe([[0.001, -0.45], [0.22, -0.38], [0.3, -0.15], [0.31, 0.1], [0.27, 0.35], [0.001, 0.45]], 12, null, 0, 0, 0);
  body.rotateZ(-Math.PI / 2).translate(0, 0.66, 0); g.push(body);
  for (const [x, z] of [[0.24, 0.15], [0.24, -0.15], [-0.26, 0.15], [-0.26, -0.15]]) g.push(lathe([[0.1, 0], [0.09, 0.62], [0.001, 0.62]], 8, null, x, 0, z));
  g.push(lathe([[0.001, 0], [0.18, 0.05], [0.2, 0.2], [0.15, 0.36], [0.001, 0.4]], 10, null, 0.46, 0.62, 0));
  g.push(rod([0.6, 0.82, 0], [0.68, 0.52, 0], 0.065, 6)); g.push(rod([0.68, 0.52, 0], [0.66, 0.22, 0], 0.05, 6)); g.push(rod([0.66, 0.22, 0], [0.74, 0.1, 0], 0.04, 6));
  for (const sd of [-1, 1]) { g.push(box(0.4, 0.58, sd > 0 ? 0.16 : -0.36, 0.46, 0.96, sd > 0 ? 0.36 : -0.16)); g.push(rod([0.58, 0.7, sd * 0.08], [0.72, 0.62, sd * 0.1], 0.025, 5)); }
  return g;
}
/** A pot-bellied dwarf (yaksha) squatting, both arms raised to carry the load: 0.92 m. */
function dwarfFig() {
  const g = [];
  g.push(lathe([[0.001, 0], [0.26, 0.02], [0.27, 0.12], [0.2, 0.18], [0.001, 0.18]], 10, null, 0.02, 0, 0));
  g.push(lathe([[0.16, 0], [0.28, 0.12], [0.28, 0.3], [0.2, 0.44], [0.12, 0.5], [0.001, 0.5]], 12, null, 0.03, 0.12, 0));
  g.push(lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.14], [0.08, 0.22], [0.001, 0.24]], 10, null, 0.06, 0.6, 0));
  for (const z of [-1, 1]) { g.push(rod([0.02, 0.52, z * 0.17], [0.04, 0.72, z * 0.24], 0.05, 6)); g.push(rod([0.04, 0.72, z * 0.24], [0.0, 0.9, z * 0.13], 0.045, 6)); }
  return g;
}
/** A woman (śālabhañjikā) standing in a triple bend, one leg crossed, an arm raised to a branch: 2.1 m to the hand. */
function yakshiFig() {
  const g = [];
  g.push(rod([0.02, 0, 0.08], [0.06, 0.48, 0.07], 0.06, 6)); g.push(rod([0.06, 0.48, 0.07], [0.05, 0.92, 0.07], 0.085, 6));
  g.push(rod([0.16, 0.04, -0.04], [0.1, 0.48, -0.06], 0.055, 6)); g.push(rod([0.1, 0.48, -0.06], [0.04, 0.92, -0.07], 0.085, 6));
  g.push(lathe([[0.12, 0], [0.2, 0.08], [0.2, 0.2], [0.13, 0.3], [0.001, 0.3]], 10, null, 0.06, 0.84, 0));
  g.push(lathe([[0.205, 0], [0.215, 0.03], [0.205, 0.06]], 12, null, 0.06, 0.98, 0));
  g.push(lathe([[0.11, 0], [0.12, 0.12], [0.16, 0.26], [0.13, 0.38], [0.06, 0.44], [0.001, 0.44]], 10, null, 0.02, 1.12, 0));
  for (const z of [-0.075, 0.075]) g.push(ell(0.07, 0.07, 0.11, 1.3, z, 8));
  g.push(lathe([[0.001, 0], [0.09, 0.04], [0.1, 0.14], [0.06, 0.22], [0.001, 0.24]], 10, null, 0.0, 1.58, 0));
  g.push(ell(0.07, 0.06, -0.06, 1.72, 0, 8));
  g.push(rod([0.0, 1.5, 0.14], [0.14, 1.78, 0.18], 0.04, 5)); g.push(rod([0.14, 1.78, 0.18], [0.28, 2.06, 0.1], 0.035, 5));
  g.push(rod([0.0, 1.5, -0.14], [-0.1, 1.28, -0.14], 0.04, 5)); g.push(rod([-0.1, 1.28, -0.14], [-0.2, 1.3, -0.02], 0.035, 5));
  return g;
}
/** Place a figure's parts: feet at (x, y, z), +x turned to (dx, dz), leaning outward by `lean`, scale s. */
function fig(bag, mat, parts, x, y, z, dx, dz, s = 1, lean = 0) {
  for (const g of parts) { if (lean) g.rotateZ(-lean); bag.add(mat, place(g, x, y, z, Math.atan2(-dz, dx), s)); }
}

// a beam along u through `at`, its ends rising (rise at the ends), section depth ±d in n, height h
function curvedBeam(out, at, u, n, half, d, y0, h, rise, segs = 12) {
  const P = (t, dn, dy) => { const yy = y0 + rise * t * t + dy; return [at[0] + u[0] * t * half + n[0] * dn, yy, at[1] + u[1] * t * half + n[1] * dn]; };
  const q = (A, B, C, D) => out.push(...A, ...B, ...C, ...A, ...C, ...D);
  for (let i = 0; i < segs; i++) {
    const t0 = -1 + 2 * i / segs, t1 = -1 + 2 * (i + 1) / segs;
    q(P(t0, d, 0), P(t1, d, 0), P(t1, d, h), P(t0, d, h));
    q(P(t1, -d, 0), P(t0, -d, 0), P(t0, -d, h), P(t1, -d, h));
    q(P(t0, -d, h), P(t0, d, h), P(t1, d, h), P(t1, -d, h));
    q(P(t0, d, 0), P(t0, -d, 0), P(t1, -d, 0), P(t1, d, 0));
  }
  for (const t of [-1, 1]) q(P(t, -d, 0), P(t, d, 0), P(t, d, h), P(t, -d, h));
}


// ---- the gateways' reliefs: scenes cut as shallow outlines on the faces (after the South Gateway's
// architraves and posts: the stūpas and trees adored by figures, the elephants of the Chaddanta, the
// processions of horsemen, elephants and footmen — photodharma, after Marshall) ----
/** Convex outlines [[u, v]] stood at O (u along U, v up), each extruded along N a little further than the last (no coplanar faces). */
function relief(out, outlines, O, U, N, t) {
  outlines.forEach((ol, k) => {
    const tk = t * (1 + 0.06 * (k % 5)), P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], T = [], m = ol.length;
    for (let i = 1; i + 1 < m; i++) { T.push(...P(...ol[0], 0), ...P(...ol[i], 0), ...P(...ol[i + 1], 0)); T.push(...P(...ol[0], tk), ...P(...ol[i], tk), ...P(...ol[i + 1], tk)); }
    for (let i = 0; i < m; i++) { const a = ol[i], b = ol[(i + 1) % m]; T.push(...P(...a, 0), ...P(...b, 0), ...P(...b, tk), ...P(...a, 0), ...P(...b, tk), ...P(...a, tk)); }
    out.push(...orientOutward(T));
  });
}
const RING = (cu, cv, rx, ry, m = 8, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: m }, (_, i) => { const a = a0 + (a1 - a0) * i / (a1 - a0 < 6 ? m - 1 : m); return [cu + Math.cos(a) * rx, cv + Math.sin(a) * ry]; });
const QUAD = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
/** The motifs, in a band 1 high (v 0…1), centred on u = 0; d = ±1 the way a beast faces. */
const MOTIF = {
  figure: () => [[[-0.07, 0], [0.07, 0], [0.06, 0.4], [-0.06, 0.4]], [[-0.07, 0.4], [0.07, 0.4], [0.06, 0.66], [-0.06, 0.66]], RING(0, 0.73, 0.055, 0.065, 8), RING(0, 0.81, 0.085, 0.045, 8)],
  bearer: () => [...MOTIF.figure(), [[0.06, 0.62], [0.2, 0.74], [0.18, 0.78], [0.05, 0.66]], [[-0.06, 0.62], [-0.05, 0.66], [-0.18, 0.78], [-0.2, 0.74]], RING(0, 0.78, 0.2, 0.03, 8, Math.PI * 1.05, Math.PI * 1.95)],
  stupa: () => [QUAD(-0.26, 0, 0.26, 0.12), QUAD(-0.22, 0.12, 0.22, 0.22), [[0.21, 0.22], ...RING(0, 0.22, 0.21, 0.36, 9, 0.12, Math.PI - 0.12).slice(1, -1), [-0.21, 0.22]], QUAD(-0.06, 0.55, 0.06, 0.66), QUAD(-0.01, 0.66, 0.01, 0.8), QUAD(-0.13, 0.8, 0.13, 0.84)],
  tree: () => [QUAD(-0.2, 0, 0.2, 0.16), QUAD(-0.03, 0.16, 0.03, 0.5), RING(0, 0.68, 0.22, 0.2, 10), RING(-0.17, 0.56, 0.09, 0.08, 7), RING(0.17, 0.56, 0.09, 0.08, 7)],
  wheel: () => [QUAD(-0.1, 0, 0.1, 0.06), QUAD(-0.035, 0.06, 0.035, 0.5), QUAD(-0.08, 0.5, 0.08, 0.56), RING(0, 0.76, 0.2, 0.2, 12), RING(0, 0.76, 0.06, 0.06, 8)],
  elephant: (d = 1) => [RING(0, 0.42, 0.3, 0.2, 10), RING(d * 0.3, 0.5, 0.13, 0.15, 8), [[d * 0.38, 0.5], [d * 0.44, 0.48], [d * 0.42, 0.06], [d * 0.37, 0.06]], ...[-0.2, -0.08, 0.08, 0.2].map((x) => QUAD(x - 0.045, 0, x + 0.045, 0.32)), [[-d * 0.12, 0.6], [d * 0.06, 0.6], [d * 0.04, 0.8], [-d * 0.1, 0.8]], RING(-d * 0.03, 0.86, 0.05, 0.06, 7)],
  horse: (d = 1) => [RING(0, 0.44, 0.22, 0.12, 9), [[d * 0.15, 0.46], [d * 0.24, 0.48], [d * 0.32, 0.7], [d * 0.24, 0.72]], RING(d * 0.32, 0.68, 0.07, 0.045, 7), ...[-0.16, -0.08, 0.08, 0.15].map((x) => QUAD(x - 0.025, 0, x + 0.025, 0.36)), [[-d * 0.06, 0.55], [d * 0.06, 0.55], [d * 0.05, 0.78], [-d * 0.05, 0.78]], RING(0, 0.84, 0.05, 0.06, 7)],
};
/** The programme of an architrave's face: b 0 lowest … 2 top; front the outer face. */
function scenes(b, front) {
  if (b === 2) return ['tree', 'figure', 'stupa', 'figure', 'tree', 'figure', 'stupa', 'figure', 'tree', 'figure', 'stupa', 'figure', 'tree'];
  if (b === 1) return front ? ['elephant', 'horse', 'figure', 'figure', 'bearer', 'stupa', 'bearer', 'figure', 'figure', 'horse', 'elephant'] : ['tree', 'elephant', 'elephant', 'elephant', 'tree', 'elephant', 'elephant', 'elephant', 'tree'];
  return front ? ['bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer', 'bearer'] : ['horse', 'figure', 'elephant', 'figure', 'figure', 'horse', 'figure', 'elephant', 'figure', 'horse'];
}
/**
 * A gateway (torana) at { at, dir (outward), y, s (scale) }: two square posts carved in panels,
 * capitals of four elephants back to back, three architraves curving up to their spiral ends and
 * carved with processions on both faces, the bracket figures (yakshis) leaning out from the posts
 * under the lowest one, uprights and small figures between them, the wheel and triratnas above.
 */
function torana(bag, col, at, dir, y, s = 1, kind = 'elephant') {
  const u = [-dir[1], dir[0]], out = [], caps = [], carve = [];
  const W = 2.1 * s, P = 0.35 * s, H = 6.4 * s;
  const at2 = (k, d = 0) => [at[0] + u[0] * k + dir[0] * d, at[1] + u[1] * k + dir[1] * d];
  for (const k of [-1, 1]) {
    const c = at2(k * W);
    obox(out, c, u, dir, P, P, y, y + H);
    // the carved panels on the front and back faces of the post
    for (const f of [-1, 1]) for (const [p0, p1] of [[0.8, 2.4], [2.6, 4.2], [4.4, 6.0]]) {
      obox(carve, [c[0] + dir[0] * f * (P + 0.025 * s), c[1] + dir[1] * f * (P + 0.025 * s)], u, dir, P * 0.82, 0.025 * s, y + p0 * s, y + p1 * s);
      // in each panel a scene: the wheel on its pillar, a stūpa, the tree of the Enlightenment, each adored by two figures
      const pc = [c[0] + dir[0] * f * (P + 0.05 * s), c[1] + dir[1] * f * (P + 0.05 * s)], sc = (p1 - p0 - 0.2) * s, mid = { 0.8: 'tree', 2.6: 'stupa', 4.4: 'wheel' }[p0];
      const pan = [...MOTIF[mid]().map((o) => o.map(([a, v]) => [a * 0.9, v])), ...[-1, 1].flatMap((g) => MOTIF.figure().map((o) => o.map(([a, v]) => [g * 0.34 + a * 0.75, v * 0.62])))];
      relief(carve, pan.map((o) => o.map(([a, v]) => [a * sc * 0.55, v * sc])), [pc[0], y + (p0 + 0.1) * s, pc[1]], u, [dir[0] * f, dir[1] * f], 0.03 * s);
    }
    // the capital: an abacus, four elephants standing back to back
    obox(caps, c, u, dir, P * 1.2, P * 1.2, y + H - 0.25 * s, y + H);
    obox(caps, c, u, dir, P * 1.9, P * 1.9, y + H, y + H + 0.18 * s);
    for (const ax of [u, [-u[0], -u[1]], dir, [-dir[0], -dir[1]]]) {
      // the capital's four beasts back to back: lions (the south gate), pot-bellied dwarfs (the west), elephants
      if (kind === 'lion') fig(bag, RAIL, lionFig(), c[0] + ax[0] * 0.2 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.2 * s, ax[0], ax[1], 0.72 * s);
      else if (kind === 'dwarf') fig(bag, RAIL, dwarfFig(), c[0] + ax[0] * 0.3 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.3 * s, ax[0], ax[1], 0.94 * s);
      else fig(bag, RAIL, elephantFig(), c[0] + ax[0] * 0.28 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.28 * s, ax[0], ax[1], 0.9 * s);
    }
    obox(caps, c, u, dir, P * 1.7, P * 1.7, y + H + 1.05 * s, y + H + 1.2 * s);
    if (col) col.rect([c[0] - P, c[1] - P, c[0] + P, c[1] + P], y, y + H);
    // the bracket figure: a woman leaning out from the post under a tree, one arm up to its branch
    const foot = at2(k * (W + P + 0.06 * s));
    fig(bag, RAIL, yakshiFig(), foot[0], y + H - 1.6 * s, foot[1], u[0] * k, u[1] * k, 1.2 * s, 0.45);
    // the tree she clings to: its trunk springing from the post up to the crown under the architrave's end, the branch in her hand
    { const t0 = at2(k * (W + P - 0.05 * s)), t1 = at2(k * (W + P + 1.45 * s)), hd = at2(k * (W + P + 1.44 * s));
      bag.add(RAIL, rod([t0[0], y + H - 1.2 * s, t0[1]], [t1[0], y + H + 0.95 * s, t1[1]], 0.1 * s, 6));
      bag.add(RAIL, rod([hd[0], y + H + 0.45 * s, hd[1]], [t1[0], y + H + 1.0 * s, t1[1]], 0.05 * s, 5)); }
    // the tree's crown, filling the angle under the architrave's end
    const crown = at2(k * (W + P + 1.62 * s));
    bag.add(RAIL, lathe([[0.001, -0.3 * s], [0.45 * s, -0.18 * s], [0.5 * s, 0.05 * s], [0.3 * s, 0.25 * s], [0.001, 0.3 * s]], 10, (th) => 1 + 0.12 * Math.cos(th * 5), crown[0], y + H + 1.15 * s, crown[1]));
  }
  // the three architraves, curving up to the ends, a spiral at either end, a procession on each face
  for (let b = 0; b < 3; b++) {
    const yb = y + H + 1.2 * s + b * 1.5 * s, half = 4.3 * s, rise = 0.22 * s, d = 0.32 * s;
    const beam = []; curvedBeam(beam, at, u, dir, half, d, yb, 0.6 * s, rise); out.push(...orientOutward(beam));
    for (const f of [-1, 1]) {
      // the face's scenes in a row along the beam, each at the beam's height where it stands, clear of the posts' crossings
      const base = scenes(b, f > 0), sc = 0.5 * s, nI = Math.floor(1.72 * half / (0.34 * s)), step = 1.72 / nI;
      const prog = Array.from({ length: nI }, (_, i) => base[Math.floor(i * base.length / nI)]);
      prog.forEach((m, i) => {
        const t = -0.86 + (i + 0.5) * step, uu = t * half;
        if (Math.abs(Math.abs(uu) - W) < 0.42 * s) return;
        const dd = uu < 0 ? 1 : -1, yy = yb + rise * t * t + 0.08 * s, pc = [at[0] + u[0] * uu + dir[0] * f * d, at[1] + u[1] * uu + dir[1] * f * d];
        relief(carve, MOTIF[m](dd * f).map((o) => o.map(([a, v]) => [a * sc, v * sc])), [pc[0], yy, pc[1]], u, [dir[0] * f, dir[1] * f], 0.035 * s);
      });
    }
    for (const k of [-1, 1]) {
      const e = at2(k * half), ye = yb + rise + 0.3 * s;
      for (const [r, th] of [[0.5, 0.36], [0.3, 0.42], [0.12, 0.46]]) {
        const vol = lathe([[0.001, -th * s], [r * s, -th * s], [r * s, th * s], [0.001, th * s]], 14, null, 0, 0, 0);
        vol.rotateX(Math.PI / 2).rotateY(Math.atan2(u[0], u[1]) + Math.PI / 2).translate(e[0], ye, e[1]);
        bag.add(STONE, vol);
      }
      // the scroll rolled up: a spiral in relief on both faces, two and a half turns inward
      for (const f of [-1, 1]) {
        const pts = [];
        for (let j = 0; j <= 30; j++) { const a = -k * j / 30 * 5 * Math.PI, r = (0.48 - 0.4 * j / 30) * s; const o = (r > 0.31 * s ? 0.37 : 0.43) * s; pts.push([e[0] - u[0] * k * Math.cos(a) * r + dir[0] * f * o, ye - Math.sin(a) * r * k, e[1] - u[1] * k * Math.cos(a) * r + dir[1] * f * o]); }
        for (let j = 0; j < 30; j++) bag.add(RAIL, rod(pts[j], pts[j + 1], 0.04 * s, 5));
      }
    }
    // short uprights and small figures between the architraves
    if (b < 2) for (const k of [-1, -0.33, 0.33, 1]) {
      const dd = k * W * (Math.abs(k) === 1 ? 1 : 1.3), tt = dd / half;
      obox(out, at2(dd), u, dir, 0.22 * s, 0.22 * s, yb + rise * tt * tt + 0.55 * s, yb + 1.55 * s);
    }
    if (b < 2) for (const k of [-0.66, 0, 0.66]) {
      const dd = k * W * 1.15, tt = dd / half;
      obox(carve, at2(dd), u, dir, 0.12 * s, 0.14 * s, yb + rise * tt * tt + 0.6 * s, yb + 1.35 * s);
      bag.add(RAIL, lathe([[0.001, -0.1 * s], [0.1 * s, 0], [0.001, 0.1 * s]], 8, null, ...((p) => [p[0], yb + 1.42 * s, p[1]])(at2(dd))));
    }
  }
  // the emblems on top: a wheel in the middle, a triratna over each post
  const top = y + H + 1.2 * s + 2 * 1.5 * s + 0.6 * s;
  for (const [r, th] of [[0.75, 0.1], [0.62, 0.13], [0.16, 0.18]]) {
    const wheel = lathe([[0.001, -th * s], [r * s, -th * s], [r * s, th * s], [0.001, th * s]], 20, null, 0, 0, 0);
    wheel.rotateX(Math.PI / 2).rotateY(Math.atan2(dir[0], dir[1])).translate(at[0], top + 0.85 * s, at[1]);
    bag.add(r === 0.62 ? RAIL : STONE, wheel);
  }
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, p0 = [at[0] + u[0] * Math.cos(a) * 0.16 * s, top + 0.85 * s + Math.sin(a) * 0.16 * s, at[1] + u[1] * Math.cos(a) * 0.16 * s];
    const p1 = [at[0] + u[0] * Math.cos(a) * 0.62 * s, top + 0.85 * s + Math.sin(a) * 0.62 * s, at[1] + u[1] * Math.cos(a) * 0.62 * s];
    bag.add(STONE, rod(p0, p1, 0.035 * s, 5));
  }
  obox(caps, at, u, dir, 0.18 * s, 0.14 * s, top, top + 0.12 * s);
  for (const k of [-1, 1]) {
    const c = at2(k * W);
    obox(caps, c, u, dir, 0.4 * s, 0.12 * s, top, top + 0.9 * s);
    obox(caps, c, u, dir, 0.15 * s, 0.12 * s, top + 0.9 * s, top + 1.3 * s);
  }
  bag.add(STONE, fromTriangles(out));
  bag.add(RAIL, fromTriangles(caps));
  bag.add(RAIL, fromTriangles(carve));
}

/**
 * A stupa { c, s (scale; 1 = the Great Stupa), y, gates: ['s','n','e','w'], stair }: drum, dome,
 * harmika and parasols, the terrace walk with its railing, the double stairway on the south, the
 * ground railing and the gateways.
 */
function stupa(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1, y = el.y ?? 0;
  const RM = 18.3 * s, HM = 4.3 * s, RA = 16.5 * s, TOP = 16.46 * s, RT = 5 * s;
  // the drum, its moulded top edge
  bag.add(STONE, lathe([[RM + 0.15 * s, -0.2], [RM + 0.15 * s, 0.3 * s], [RM, 0.45 * s], [RM, HM - 0.25 * s], [RM + 0.12 * s, HM - 0.15 * s], [RM + 0.12 * s, HM], [RA, HM]], 72, null, cx, y, cz));
  col.circle(cx, cz, RM, y, y + HM);
  // the walk on the drum's top, as tiles over the ring
  const step = 0.5;
  for (let x = -RM; x < RM; x += step) for (let z = -RM; z < RM; z += step) {
    const d = Math.hypot(x + step / 2, z + step / 2);
    if (d > RA - 0.3 && d < RM) col.floor([cx + x, cz + z, cx + x + step, cz + z + step], y + HM);
  }
  // the dome: a sphere's zone from the walk's inner edge to the flattened top
  const yc = ((RT * RT + (TOP - HM) ** 2) - RA * RA) / (2 * (TOP - HM));       // centre above the walk
  const R = Math.hypot(RA, yc);
  const prof = [];
  for (let k = 0; k <= 24; k++) {
    const yy = (TOP - HM) * k / 24, rr = Math.sqrt(Math.max(0, R * R - (yy - yc) ** 2));
    prof.push([rr, HM + yy]);
  }
  prof.push([0.001, TOP]);
  bag.add(DOME, lathe(prof, 72, null, cx, y, cz));
  col.circle(cx, cz, RA, y + HM, y + TOP);
  // the harmika: a square railing on the top, the shaft and three parasols
  const hm = 2.3 * s;
  bag.add(RAIL, box(cx - hm, y + TOP, cz - hm, cx + hm, y + TOP + 0.3 * s, cz + hm));
  for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) {
    const p = [cx + a[0] * hm, cz + a[1] * hm], q = [cx + b[0] * hm, cz + b[1] * hm], L = Math.hypot(q[0] - p[0], q[1] - p[1]) / 2;
    const uu = [(q[0] - p[0]) / (2 * L), (q[1] - p[1]) / (2 * L)], nn = [-uu[1], uu[0]], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], out = [];
    for (let k = 0; k <= 6; k++) obox(out, [p[0] + uu[0] * L * 2 * k / 6, p[1] + uu[1] * L * 2 * k / 6], uu, nn, 0.13 * s, 0.13 * s, y + TOP + 0.3 * s, y + TOP + 1.4 * s);
    for (const yb of [0.55, 0.85]) obox(out, m, uu, nn, L, 0.07 * s, y + TOP + yb * s, y + TOP + (yb + 0.14) * s);
    obox(out, m, uu, nn, L + 0.1 * s, 0.18 * s, y + TOP + 1.4 * s, y + TOP + 1.65 * s);
    bag.add(RAIL, fromTriangles(out));
  }
  bag.add(RAIL, lathe([[0.16 * s, 0], [0.13 * s, 5.0 * s], [0.001, 5.0 * s]], 8, null, cx, y + TOP, cz));
  for (const [d, h] of [[3.6, 2.6], [3.0, 3.6], [2.4, 4.5]]) {
    bag.add(STONE, lathe([[0.15 * s, h * s - 0.25 * s], [d / 2 * s, h * s - 0.12 * s], [d / 2 * s, h * s], [0.001, h * s + 0.18 * s]], 20, null, cx, y + TOP, cz));
  }
  // the railing on the terrace
  const gs = Math.PI / 2;                       // south (+z) in plan angles
  railRing(bag, col, [cx, cz], RM - 0.2 * s, y + HM, 1.3 * s, el.stair ? [gs] : [], 1.4 * s);
  // the double stairway on the south: two flights along the drum rising to a landing
  if (el.stair) {
    const zs0 = cz + RM - 0.1 * s, zs1 = cz + RM + 1.6 * s, xl = 1.6 * s, xr = 7.0 * s;
    bag.add(STONE, box(cx - xl, y, zs0 - 1.2 * s, cx + xl, y + HM, zs1));
    col.rect([cx - xl, cz + RM + 0.05, cx + xl, zs1], y, y + HM);
    col.floor([cx - xl, zs0 - 1.2 * s, cx + xl, zs1], y + HM);
    for (const k of [-1, 1]) {
      const x0 = Math.min(cx + k * xl, cx + k * xr), x1 = Math.max(cx + k * xl, cx + k * xr);
      const n = Math.round(HM / 0.18), dir = k > 0 ? 'w' : 'e';
      for (let i = 0; i < n; i++) {
        const t1 = (i + 1) / n, yTop = y + HM * t1;
        const xa = k > 0 ? cx + xr - (xr - xl) * t1 : x0, xb = k > 0 ? x1 : cx - xr + (xr - xl) * t1;
        bag.add(STONE, box(xa, y - 0.01, zs0 + 0.1 * s, xb, yTop, zs1));
      }
      col.ramp([x0, zs0 + 0.1 * s, x1, zs1], y, y + HM, dir);
      // the balustrade on the outer side
      const out = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6, xx = cx + k * (xl + (xr - xl) * t), yy = y + HM * (1 - t);
        obox(out, [xx, zs1 - 0.15 * s], [1, 0], [0, 1], 0.14 * s, 0.14 * s, yy, yy + 1.2 * s);
      }
      hexa(out, [[cx + k * xl, y + HM + 1.0 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.0 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.0 * s, zs1], [cx + k * xl, y + HM + 1.0 * s, zs1]],
        [[cx + k * xl, y + HM + 1.3 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.3 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.3 * s, zs1], [cx + k * xl, y + HM + 1.3 * s, zs1]]);
      bag.add(RAIL, fromTriangles(out));
      col.segment([cx + k * xl, zs1 - 0.15 * s], [cx + k * xr, zs1 - 0.15 * s], 0.3 * s, y, y + HM + 1.3 * s);
    }
  }
  // the ground railing with its four (or fewer) openings, and the gateways before them
  const RV = 24 * s, ang = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 };
  const gates = el.gates || [];
  railRing(bag, col, [cx, cz], RV, y, 3.1 * s, gates.map((g) => ang[g]), 2.0 * s);
  bag.add('sandstone_floor', lathe([[RV + 0.6 * s, 0.02], [RM + 0.15 * s, 0.02]], 72, null, cx, y, cz));
  for (const g of gates) {
    const a = ang[g], d = [Math.cos(a), Math.sin(a)];
    torana(bag, col, [cx + d[0] * (RV + 3 * s), cz + d[1] * (RV + 3 * s)], d, y, s, s >= 1 && g === 's' ? 'lion' : s >= 1 && g === 'w' ? 'dwarf' : 'elephant');
  }
}

/** Ashoka's pillar { at, y }: a polished tapering shaft of a single stone; the bell capital of lotus
 *  petals hanging down, a roped torus; the round abacus carved with pairs of geese alternating with
 *  honeysuckle; four lions seated back to back. */
function ashokaPillar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, PS = 'polished_sandstone', hs = 9.5;
  bag.add(PS, lathe([[0.4, 0], [0.31, hs], [0.001, hs]], 20, null, x, y, z));
  // the bell: sixteen petals turned down, narrowing to the neck
  const yb = y + hs;
  bag.add(PS, lathe([[0.3, 0], [0.56, 0.04], [0.6, 0.12], [0.55, 0.35], [0.45, 0.6], [0.34, 0.8], [0.3, 0.86], [0.001, 0.86]], 32, (th, i) => (i >= 2 && i <= 5 ? 1 + 0.06 * Math.abs(Math.cos(th * 8)) : 1), x, yb, z));
  bag.add(PS, lathe([[0.3, 0], [0.36, 0.05], [0.36, 0.13], [0.3, 0.18], [0.001, 0.18]], 20, (th, i) => (i === 1 || i === 2 ? 1 + 0.04 * Math.cos(th * 18) : 1), x, yb + 0.86, z));
  // the abacus, its frieze of geese and honeysuckle in relief
  const ya = yb + 1.04, ra = 0.52, ha = 0.3;
  bag.add(PS, lathe([[ra, 0], [ra, ha], [0.001, ha]], 32, null, x, ya, z));
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + Math.PI / 8, dx = Math.cos(a), dz = Math.sin(a), tx = -dz, tz = dx, px = x + dx * ra, pz = z + dz * ra;
    if (k % 2 === 0) for (const sd of [-1, 1]) {
      // a goose pecking: the body, the neck bowed to the ground
      const gx = px + tx * sd * 0.09, gz = pz + tz * sd * 0.09;
      bag.add(PS, lathe([[0.001, 0], [0.035, 0.02], [0.04, 0.06], [0.001, 0.09]], 6, null, gx, ya + 0.08, gz));
      bag.add(PS, rod([gx + tx * sd * 0.02, ya + 0.15, gz + tz * sd * 0.02], [gx - tx * sd * 0.07, ya + 0.07, gz - tz * sd * 0.07], 0.012, 4));
    } else for (let j = -2; j <= 2; j++) {
      // the honeysuckle (palmette): a fan of petals from a little volute
      const ang = j * 0.32;
      bag.add(PS, rod([px, ya + 0.06, pz], [px + tx * Math.sin(ang) * 0.12, ya + 0.06 + Math.cos(ang) * 0.17, pz + tz * Math.sin(ang) * 0.12], 0.014, 4));
    }
  }
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, d = [Math.cos(a), Math.sin(a)]; fig(bag, PS, lionFig(), x + d[0] * 0.2, ya + ha, z + d[1] * 0.2, d[0], d[1], 1.0); }
  col.circle(x, z, 0.45, y, y + hs);
}

/** Orient a triangle so its normal points up (up = 1) or down (up = -1). */
function triUp(out, a, b, c, up = 1) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const ny = uz * vx - ux * vz;
  if (ny * up >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
/** A sloping sheet a b c d (quad), facing up (or down for a soffit). */
function sheet(out, a, b, c, d, up = 1) { triUp(out, a, b, c, up); triUp(out, a, c, d, up); }

/**
 * A pitched roof round a ring of cells: outer eave rectangle O (height yo), ridge rectangle R (yr), inner eave rectangle I (yi),
 * each [x0, z0, x1, z1]; the slopes mitre at the corners (a hip); a soffit sheet under each, the ridge capped.
 */
function ringRoof(bag, O, R, I, yo, yr, yi, mat) {
  const T = [], S = [], corners = (r, y) => [[r[0], y, r[1]], [r[2], y, r[1]], [r[2], y, r[3]], [r[0], y, r[3]]];
  const co = corners(O, yo), cr = corners(R, yr), ci = corners(I, yi);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    sheet(T, co[i], co[j], cr[j], cr[i]); sheet(T, cr[i], cr[j], ci[j], ci[i]);
    const dn = (p) => [p[0], p[1] - 0.1, p[2]];
    sheet(S, dn(co[i]), dn(co[j]), dn(cr[j]), dn(cr[i]), -1); sheet(S, dn(cr[i]), dn(cr[j]), dn(ci[j]), dn(ci[i]), -1);
    bag.add('roof_ridge', orientedBox([cr[i][0], cr[i][2]], [cr[j][0], cr[j][2]], 0.3, yr, yr + 0.2, 0.15));
  }
  bag.add(mat, fromTriangles(T)); bag.add(mat, fromTriangles(S));
}

/** A verandah post: a round base stone, a square shaft with chamfered middle, a lotus-bell capital under a block with its two brackets. */
function post(bag, col, x, z, y, h, axis) {
  bag.add(STONE, lathe([[0.3, 0], [0.3, 0.12], [0.22, 0.2], [0.001, 0.2]], 12, null, x, y, z));
  bag.add(STONE, box(x - 0.15, y + 0.2, z - 0.15, x + 0.15, y + 0.5, z + 0.15));
  bag.add(STONE, lathe([[0.17, 0], [0.2, 0.05], [0.2, h - 0.5 - 0.5], [0.17, h - 0.5 - 0.45], [0.001, h - 0.5 - 0.45]], 8, null, x, y + 0.5, z));
  bag.add(STONE, lathe([[0.17, 0], [0.26, 0.1], [0.3, 0.26], [0.27, 0.42], [0.001, 0.42]], 12, (th, i) => (i === 2 ? 1 + 0.08 * Math.cos(th * 8) : 1), x, y + h - 0.5, z));
  bag.add(STONE, box(x - 0.3, y + h - 0.08, z - 0.3, x + 0.3, y + h + 0.1, z + 0.3));
  const [bx, bz] = axis === 'x' ? [0.55, 0.09] : [0.09, 0.55];
  bag.add('timber', box(x - bx, y + h + 0.1, z - bz, x + bx, y + h + 0.3, z + bz));
  col.circle(x, z, 0.28, y, y + h);
}

/**
 * A monastery { rect, y, cell, door }: a ring of brick cells round a court, each with its doorway under a timber lintel, a stone bed
 * and a water pot; a verandah of stone posts under a lean-to; a pitched tiled roof hipped round the ring; the walls on a dressed
 * base with a cornice; a well and a pavilion of the assembly in the court. docs/settlements/sanchi.md §12.
 */
function vihara(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, D = el.cell || 3.4, H = 4.0;
  const wall = (p, q, th, y0 = y - 0.1, y1 = y + H, mat = 'brick') => {
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.05) return;
    bag.add(mat, orientedBox(p, q, th, y0, y1, th / 2));
    col.segment(p, q, th, y0, y1);
  };
  const run = (a, b, th, doors, w) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], P = (d) => [a[0] + u[0] * d, a[1] + u[1] * d];
    let s0 = 0;
    for (const d of doors) {
      wall(P(s0), P(d - w / 2), th); wall(P(d - w / 2), P(d + w / 2), th, y + 2.3, y + H);
      // the timber lintel, its ends projecting, and a threshold stone
      bag.add('timber', orientedBox(P(d - w / 2 - 0.15), P(d + w / 2 + 0.15), th + 0.1, y + 2.15, y + 2.3, (th + 0.1) / 2));
      bag.add(STONE, orientedBox(P(d - w / 2), P(d + w / 2), th + 0.2, y, y + 0.08, (th + 0.2) / 2));
      s0 = d + w / 2;
    }
    wall(P(s0), P(L), th);
  };
  const midz = (z0 + z1) / 2;
  // the outer walls on a dressed base, under a cornice; the entrance in the middle of the west side
  run([x0, z0], [x1, z0], 0.6, [], 0); run([x1, z0], [x1, z1], 0.6, [], 0); run([x1, z1], [x0, z1], 0.6, [], 0);
  run([x0, z1], [x0, z0], 0.6, [(z1 - z0) / 2], 2.2);
  const ring = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  for (let i = 0; i < 4; i++) {
    const a = ring[i], b = ring[(i + 1) % 4];
    bag.add(STONE, orientedBox(a, b, 0.76, y - 0.1, y + 0.55, 0.38)); // the base course, proud of the wall
    bag.add(STONE, orientedBox(a, b, 0.78, y + H - 0.3, y + H, 0.39)); // the cornice
  }
  // the cells' inner wall, a doorway into each cell, the passage on the west
  const ix0 = x0 + D, iz0 = z0 + D, ix1 = x1 - D, iz1 = z1 - D;
  const cells = (a, b, skip = null) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 3.4)), doors = [];
    for (let k = 0; k < n; k++) { const d = (k + 0.5) * L / n; if (skip === null || Math.abs(d - skip) > 1.8) doors.push(d); }
    if (skip !== null) doors.push(skip);
    doors.sort((p, q) => p - q);
    run(a, b, 0.4, doors, 1.0);
  };
  cells([ix0, iz0], [ix1, iz0]); cells([ix1, iz0], [ix1, iz1]); cells([ix1, iz1], [ix0, iz1]);
  cells([ix0, iz1], [ix0, iz0], iz1 - midz);
  // partitions between the cells, and the passage from the entrance; in each cell a stone bed and a pot
  const bed = (cx, cz, nx, nz) => {
    // against the outer wall, to one side of the door (n = the direction from the door toward the outer wall)
    const tx = -nz, tz = nx, c0 = [cx + nx * 1.35 - tx * 0.7, cz + nz * 1.35 - tz * 0.7];
    bag.add(STONE, orientedBox([c0[0] - nx * 0.95, c0[1] - nz * 0.95], [c0[0] + nx * 0.95, c0[1] + nz * 0.95], 0.9, y, y + 0.42));
    bag.add(STONE, orientedBox([c0[0] - nx * 0.95, c0[1] - nz * 0.95], [c0[0] + nx * 0.95, c0[1] + nz * 0.95], 0.98, y + 0.42, y + 0.5));
    const p = [cx + nx * 1.5 + tx * 1.0, cz + nz * 1.5 + tz * 1.0];
    bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.14], [0.22, 0.26], [0.15, 0.38], [0.1, 0.42], [0.12, 0.46], [0.001, 0.46]], 12, null, p[0], y, p[1]));
  };
  for (const [side, n] of [['n', [0, -1]], ['s', [0, 1]]]) {
    const L = ix1 - ix0, k = Math.max(1, Math.round(L / 3.4));
    for (let i = 1; i < k; i++) { const x = ix0 + i * L / k; wall([x, side === 'n' ? z0 + 0.3 : iz1 + 0.2], [x, side === 'n' ? iz0 - 0.2 : z1 - 0.3], 0.3); }
    for (let i = 0; i < k; i++) bed(ix0 + (i + 0.5) * L / k, side === 'n' ? iz0 : iz1, n[0], n[1]);
  }
  // the east side's cells (partitions across x), the west side's two runs either side of the passage
  const sideCells = (za, zb, east) => {
    const L = zb - za, k = Math.max(1, Math.round(L / 3.4));
    for (let i = 0; i <= k; i++) { const z = za + i * L / k; if (i > 0 && i < k) wall([east ? ix1 + 0.2 : x0 + 0.3, z], [east ? x1 - 0.3 : ix0 - 0.2, z], 0.3); }
    for (let i = 0; i < k; i++) bed(east ? ix1 : ix0, za + (i + 0.5) * L / k, east ? 1 : -1, 0);
  };
  sideCells(iz0 + 0.2, iz1 - 0.2, true);
  for (const zz of [midz - 1.1, midz + 1.1]) wall([x0 + 0.3, zz], [ix0 - 0.2, zz], 0.3);
  sideCells(iz0 + 0.2, midz - 1.1, false); sideCells(midz + 1.1, iz1 - 0.2, false);
  // the pitched roof over the cells, hipped round the ring, the verandah's lean-to inside it
  const ov = 0.8, mid = D / 2, yo = y + H + 1.1 - (mid + ov) * 0.45;
  ringRoof(bag, [x0 - ov, z0 - ov, x1 + ov, z1 + ov], [x0 + mid, z0 + mid, x1 - mid, z1 - mid], [ix0 + ov, iz0 + ov, ix1 - ov, iz1 - ov], yo, y + H + 1.1, yo, 'roof_tile');
  // the verandah: posts at 3.2 m round the court, a beam on them, the lean-to roof from the cells' inner wall down to the beam
  const v = 2.0, vh = 2.95, vr = [[ix0 + v, iz0 + v], [ix1 - v, iz0 + v], [ix1 - v, iz1 - v], [ix0 + v, iz1 - v]];
  for (let i = 0; i < 4; i++) {
    const a = vr[i], b = vr[(i + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 3.2)), ax = i % 2 === 0 ? 'x' : 'z';
    for (let k = 0; k < n; k++) {
      const px = a[0] + (b[0] - a[0]) * k / n, pz = a[1] + (b[1] - a[1]) * k / n;
      if (i === 3 && Math.abs(pz - midz) < 1.6) continue;
      post(bag, col, px, pz, y, vh, ax);
    }
  }
  const lean = [], wl = [ix0, iz0, ix1, iz1], bo = [ix0 + v + 0.35, iz0 + v + 0.35, ix1 - v - 0.35, iz1 - v - 0.35];
  const cw = (r, yy) => [[r[0], yy, r[1]], [r[2], yy, r[1]], [r[2], yy, r[3]], [r[0], yy, r[3]]];
  const cA = cw(wl, y + 3.65), cB = cw(bo, y + vh + 0.3);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    sheet(lean, cA[i], cA[j], cB[j], cB[i]);
    const dn = (p) => [p[0], p[1] - 0.1, p[2]];
    sheet(lean, dn(cA[i]), dn(cA[j]), dn(cB[j]), dn(cB[i]), -1);
  }
  bag.add('roof_tile', fromTriangles(lean));
  for (let i = 0; i < 4; i++) { const a = vr[i], b = vr[(i + 1) % 4]; bag.add('timber', orientedBox(a, b, 0.3, y + vh + 0.1, y + vh + 0.3, 0.15)); }
  // the court: a well with a stone curb, and the assembly's pavilion, open on four sides under a thatched pyramid
  const cx = (x0 + x1) / 2, cz = midz;
  const wx = cx - 5.5, wz = cz + 4;
  bag.add(STONE, lathe([[0.95, 0], [0.95, 0.5], [0.8, 0.55], [0.001, 0.55]], 20, null, wx, y, wz));
  col.circle(wx, wz, 0.95, y, y + 0.55);
  const ph = 3.0, hs = 2.8;   // pavilion half-width and post height
  bag.add(STONE, box(cx - ph - 0.5, y, cz - ph - 0.5, cx + ph + 0.5, y + 0.4, cz + ph + 0.5));
  col.floor([cx - ph - 0.5, cz - ph - 0.5, cx + ph + 0.5, cz + ph + 0.5], y + 0.4);
  for (const sx of [-1, 0, 1]) for (const sz of [-1, 0, 1]) {
    if (sx === 0 && sz === 0) continue;
    post(bag, col, cx + sx * ph, cz + sz * ph, y + 0.4, hs, 'x');
  }
  for (const s of [-1, 1]) { bag.add('timber', box(cx - ph - 0.3, y + 0.4 + hs + 0.3, cz + s * ph - 0.12, cx + ph + 0.3, y + 0.4 + hs + 0.55, cz + s * ph + 0.12)); bag.add('timber', box(cx + s * ph - 0.12, y + 0.4 + hs + 0.55, cz - ph - 0.3, cx + s * ph + 0.12, y + 0.4 + hs + 0.8, cz + ph + 0.3)); }
  const pyr = [], by = y + 0.4 + hs + 0.8, pe = ph + 1.2, pc = [[cx - pe, by, cz - pe], [cx + pe, by, cz - pe], [cx + pe, by, cz + pe], [cx - pe, by, cz + pe]], apex = [cx, by + 2.0, cz];
  for (let i = 0; i < 4; i++) triUp(pyr, pc[i], pc[(i + 1) % 4], apex);
  bag.add('thatch', fromTriangles(pyr));
  const pyr2 = [];
  for (let i = 0; i < 4; i++) { const a = pc[i], b = pc[(i + 1) % 4]; triUp(pyr2, [a[0], a[1] - 0.12, a[2]], [b[0], b[1] - 0.12, b[2]], [apex[0], apex[1] - 0.12, apex[2]], -1); }
  bag.add('thatch', fromTriangles(pyr2));
  // the teacher's seat, a stone throne facing the door, and a lamp
  bag.add(STONE, box(cx - 0.6, y + 0.4, cz - ph + 0.1, cx + 0.6, y + 0.8, cz - ph + 0.9));
  bag.add('sandstone_floor', box(x0, y - 0.3, z0, x1, y + 0.02, z1));
  col.floor(el.rect, y + 0.02);
}

registerStyle('indian', {
  column: () => {},
  trim: () => {},
  opening: () => {},
  elements: { stupa },
  objects: { ashoka_pillar: ashokaPillar, vihara },
});
