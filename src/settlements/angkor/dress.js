// Angkor Wat itself, dressed (docs/settlements/angkor.md §27). The khmer style (shared, read-only) builds the temple's
// masses: galleries, towers, porticoes, cloister, naga balustrades. These elements lay the carving over them, in the same
// plan and the same materials (so they merge into the meshes already there):
//   ak_gdress  — over a k_gallery: carved square pillars (moulded base, ringed neck, lotus petals under the capital, a
//                stem of lotus medallions up each face); on the wall's outer or court face a moulded plinth, a cornice, a
//                frieze of lotus petals, blind windows of turned balusters under little pediments, devatas (apsaras) in
//                pointed niches on the piers, pilasters; and the lintels, pediment reliefs and tier niches of the gate
//                and corner towers the gallery carries.
//   ak_tdress  — over a k_tower: carved lintels over every doorway, pediment reliefs (ribs with flame teeth, a seated
//                deity in a halo, sprays of leaves) in the tympana of the porticoes, a niche in each tier's faces.
//   ak_ndress  — over a naga_rail: the scales on the serpent's flanks and the crest along its back.
//   ak_cdress  — over the k_cloister: carved pillars with praying ascetics on their bases, reliefs in the four pediments
//                of the crossing.
// Everything is fitted to the style's own numbers (the copies of its geometry rules below keep the pieces in register).

import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { assembly, placer } from '../../objects/kit.js';
import { devataGeom, nagaHood } from './sculpt.js';

const C = 'sandstone_carved';
const perp = (N) => [-N[1], N[0]];
const at3 = (p, N, d, y = 0) => [p[0] + N[0] * d, y, p[1] + N[1] * d];

// ── shapes ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** A convex outline [[u, v]] stood up at O (u along U, v up) with thickness t along N. */
function prism(out, outline, O, U, N, t) {
  const P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], T = [], m = outline.length;
  for (let i = 1; i + 1 < m; i++) {
    T.push(...P(...outline[0], 0), ...P(...outline[i], 0), ...P(...outline[i + 1], 0));
    T.push(...P(...outline[0], t), ...P(...outline[i], t), ...P(...outline[i + 1], t));
  }
  for (let i = 0; i < m; i++) { const a = outline[i], b = outline[(i + 1) % m]; T.push(...P(...a, 0), ...P(...b, 0), ...P(...b, t), ...P(...a, 0), ...P(...b, t), ...P(...a, t)); }
  for (const v of orientOutward(T)) out.push(v);
  return out;
}
/** A faceted boss: the outline stood on the face, rising to an apex [u, v, height] (a pyramid, open at the back: 4–8 triangles, lit in facets). */
function facet(out, outline, apex, O, U, N) {
  const P = (u, v, w) => [O[0] + U[0] * u + N[0] * w, O[1] + v, O[2] + U[1] * u + N[1] * w], A = P(...apex);
  for (let i = 0; i < outline.length; i++) {
    const a = P(...outline[i], 0), b = P(...outline[(i + 1) % outline.length], 0);
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [A[0] - a[0], A[1] - a[1], A[2] - a[2]];
    const nx = e1[1] * e2[2] - e1[2] * e2[1], nz = e1[0] * e2[1] - e1[1] * e2[0];
    if (nx * N[0] + nz * N[1] >= 0) out.push(...a, ...b, ...A); else out.push(...b, ...a, ...A);
  }
}
function boss(out, outline, O, U, N, t) {
  let cu = 0, cv = 0;
  for (const [u, v] of outline) { cu += u; cv += v; }
  facet(out, outline, [cu / outline.length, cv / outline.length, t], O, U, N);
}
const ARCH = (W, H, m = 12) => { const p = []; for (let i = 0; i <= m; i++) { const x = -1 + 2 * i / m; p.push([x * W / 2, H * Math.pow(1 - Math.abs(x), 0.6)]); } return p; };
const archH = (W, H, u) => (Math.abs(u) >= W / 2 ? 0 : H * Math.pow(1 - Math.abs(2 * u / W), 0.6));
const LEAF = [[-0.5, 0], [0.5, 0], [0.56, 0.22], [0.48, 0.5], [0.28, 0.76], [0, 1], [-0.28, 0.76], [-0.48, 0.5], [-0.56, 0.22]];
const LEAF7 = [[-0.5, 0], [0.5, 0], [0.55, 0.35], [0.25, 0.78], [0, 1], [-0.25, 0.78], [-0.55, 0.35]];
const KITE = [[-0.5, 0.25], [0, 0], [0.5, 0.25], [0, 1]];
const DIAM = [[0, -1], [0.62, 0], [0, 1], [-0.62, 0]];
const scaled = (o, w, h, du = 0, dv = 0) => o.map(([u, v]) => [u * w + du, v * h + dv]);
const turned = (o, a, cu = 0, cv = 0) => { const c = Math.cos(a), s = Math.sin(a); return o.map(([u, v]) => [cu + u * c - v * s, cv + u * s + v * c]); };
const disc = (cu, cv, r, m = 8, rv = r) => Array.from({ length: m }, (_, i) => [cu + Math.cos(i / m * Math.PI * 2) * r, cv + Math.sin(i / m * Math.PI * 2) * rv]);
function strip(out, p0, p1, wd, O, U, N, t) {
  const dx = p1[0] - p0[0], dv = p1[1] - p0[1], L = Math.hypot(dx, dv) || 1, nx = -dv / L * wd / 2, nv = dx / L * wd / 2;
  boss(out, [[p0[0] + nx, p0[1] + nv], [p1[0] + nx, p1[1] + nv], [p1[0] - nx, p1[1] - nv], [p0[0] - nx, p0[1] - nv]], O, U, N, t);
}

// ── assemblies: built once at the origin facing +z, placed as instances ─────────────────────────────────────────────
const asm = (key, fn) => assembly('ak|' + key, (a) => {
  const m = { c: [], o: [] };
  fn(m);
  for (const r of ['c', 'o']) for (const g of m[r]) a(r, g);
});
const tr = (m, role, tris) => { if (tris.length) m[role].push(fromTriangles(tris)); };
/**
 * A hair of difference (±1%) from one copy to the next, as in work cut by hand: and, as no two copies are then the same
 * shape, the engine merges them into the meshes of the cells they stand in rather than adding an instanced draw for each
 * kind of carving (the arrival frame's draw budget; the triangles are the same either way).
 */
function hand(a, b = 0) { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return 1 + (v - Math.floor(v) - 0.5) * 0.02; }
/** Place an assembly at plan point p, height y, facing N (its +z). */
function put(bag, A, p, y, N, inst = false) {
  // (inst: built apart, in a plan drawn only near the visitor: the copies are the same shape and the engine draws them as instances of one)
  const pl = placer({ at: p, y, rot: Math.atan2(N[0], N[1]) }, bag), k = inst ? 1 : hand(p[0] + y, p[1] + N[0] * 3 + N[1]);
  if (A.c) pl(C, A.c.clone().scale(k, k, k));
  if (A.o) pl('sandstone_khmer', A.o.clone().scale(k, k, k));
}
const FACE = [[0, 1], [1, 0], [0, -1], [-1, 0]];

// ── the carved square pillar ────────────────────────────────────────────────────────────────────────────────────
/**
 * A pillar of height ph, shaft half-width hs, centred at the origin on its floor: a moulded base, a ringed neck and a
 * row of lotus petals under the capital (which the style draws), and up each face a stem with lotus medallions between
 * two fine lines. `ascetic`: a praying ascetic in a pointed niche on each face of the base (the cloister's pillars).
 */
function pillarA(ph, hs, ascetic, lite = false) {
  return asm(`pil|${ph.toFixed(2)}|${hs}|${ascetic ? 1 : 0}${lite ? 'l' : ''}`, (m) => {
    const bs = hs + 0.08;
    m.c.push(box(-bs, 0, -bs, bs, 0.2, bs), box(-hs - 0.045, 0.2, -hs - 0.045, hs + 0.045, 0.34, hs + 0.045));
    m.c.push(box(-hs - 0.035, ph - 0.5, -hs - 0.035, hs + 0.035, ph - 0.42, hs + 0.035));
    const lo = ascetic ? 0.62 : 0.5, hi = ph - 0.95, n = lite ? 1 : Math.max(2, Math.round((hi - lo) / 0.8)), t = [];
    for (const N of FACE) {
      const U = perp(N), O = [N[0] * (hs - 0.005), 0, N[1] * (hs - 0.005)];
      facet(t, [[-0.025, lo], [0.025, lo], [0.025, hi], [-0.025, hi]], [0, (lo + hi) / 2, 0.035], O, U, N);
      for (let i = 0; i < n; i++) { const v = lo + (i + 0.5) * (hi - lo) / n; facet(t, scaled(DIAM, 0.2, 0.2, 0, v), [0, v, 0.06], O, U, N); }
      facet(t, scaled(LEAF7, 0.3, 0.32, 0, ph - 0.82), [0, ph - 0.62, 0.06], O, U, N);
      if (ascetic) {
        // on the base (its face at hs + 0.06): the ascetic seated in prayer in a pointed niche, hands joined
        const Ob = [N[0] * (hs + 0.055), 0, N[1] * (hs + 0.055)];
        prism(t, [[-0.17, 0.05], [0.17, 0.05], [0.17, 0.34], [0, 0.45], [-0.17, 0.34]], Ob, U, N, 0.012);
        facet(t, [[-0.12, 0.06], [0.12, 0.06], [0.07, 0.17], [-0.07, 0.17]], [0, 0.11, 0.045], Ob, U, N);
        facet(t, [[-0.06, 0.16], [0.06, 0.16], [0.05, 0.3], [-0.05, 0.3]], [0, 0.23, 0.045], Ob, U, N);
        facet(t, disc(0, 0.34, 0.04, 5), [0, 0.34, 0.06], Ob, U, N);
      }
    }
    tr(m, 'c', t);
  });
}

// ── devatas in their niches, the blind balustered window, a pilaster ─────────────────────────────────────────────
const DEVATA = [
  [[-0.17, 0], [-0.02, 0], [-0.03, 0.07], [-0.15, 0.07]], [[0.02, 0], [0.17, 0], [0.15, 0.07], [0.03, 0.07]],
  [[-0.1, 0.06], [0.1, 0.06], [0.15, 0.52], [-0.15, 0.52]], [[-0.08, 0.36], [0.08, 0.36], [0.06, 0.5], [-0.06, 0.5]],
  [[-0.11, 0.5], [0.11, 0.5], [0.14, 0.78], [-0.14, 0.78]],
  [[0.13, 0.55], [0.18, 0.56], [0.2, 0.76], [0.14, 0.78]], [[-0.18, 0.56], [-0.13, 0.55], [-0.14, 0.78], [-0.2, 0.76]],
  [[0.17, 0.64], [0.24, 0.72], [0.22, 0.82], [0.16, 0.74]],
  [[-0.045, 0.78], [0.045, 0.78], [0.065, 0.84], [0.06, 0.9], [-0.06, 0.9], [-0.065, 0.84]],
  [[-0.08, 0.89], [0.08, 0.89], [0.02, 1.04], [-0.02, 1.04]], [[-0.1, 0.89], [-0.05, 0.89], [-0.12, 0.99]], [[0.05, 0.89], [0.1, 0.89], [0.12, 0.99]],
];
/** An apsara 1.5 m tall in a pointed niche framed by a rib with a crest of leaves, standing on a small lotus ledge; the origin on the wall face, at her feet's level. */
function devataA(s, tier = 'old') {
  return asm(`dev|${s}|${tier}`, (m) => {
    const t = [], N = [0, 1], U = [1, 0], O = [0, 0, 0], modelled = tier !== 'old';
    const nw = (modelled ? 0.31 : 0.3) * s, nh = (modelled ? 1.02 : 0.92) * s;
    prism(t, [[-nw, -0.06], [nw, -0.06], [nw, nh], [0, nh + 0.26 * s], [-nw, nh]], O, U, N, 0.05);
    // the rib of the niche, and the crest
    const arc = [[-nw, nh], [-nw * 0.55, nh + 0.15 * s], [0, nh + 0.26 * s], [nw * 0.55, nh + 0.15 * s], [nw, nh]];
    for (let i = 0; i + 1 < arc.length; i++) strip(t, arc[i], arc[i + 1], 0.06, O, U, N, 0.08);
    for (const sg of [-1, 1]) strip(t, [sg * nw, -0.06], [sg * nw, nh], 0.06, O, U, N, 0.08);
    boss(t, scaled(LEAF7, 0.1 * s, 0.17 * s, 0, nh + 0.26 * s), O, U, N, 0.06);
    // the ledge: a lotus seat of three petals
    for (const k of [-1, 0, 1]) boss(t, scaled(KITE, 0.14 * s, 0.1 * s, k * 0.13 * s, -0.04), O, U, N, 0.09);
    if (modelled) {
      // a modelled figure on the lotus: volumes, not plates (sculpt.js), her back let into the niche's ground
      tr(m, 'c', t);
      m.c.push(devataGeom(tier === 'full' ? 1 : 0).scale(s, s, s).translate(0, 0.05, 0.05));
      return;
    }
    for (const part of DEVATA) boss(t, scaled(part, s, s, 0, 0.05), [0, 0, 0.04], U, N, 0.07 * s / 1.1);
    // her earrings, the armlets, the hanging end of the girdle
    for (const sg of [-1, 1]) boss(t, disc(sg * 0.075 * s, 0.83 * s + 0.05, 0.022 * s, 6), O, U, N, 0.13 * s);
    boss(t, [[-0.025 * s, 0.05], [0.025 * s, 0.05], [0.04 * s, 0.36 * s + 0.05], [-0.04 * s, 0.36 * s + 0.05]], [0, 0, 0.04], U, N, 0.1 * s);
    tr(m, 'c', t);
  });
}
const BAL = [[0.07, 0], [0.07, 0.05], [0.045, 0.12], [0.075, 0.3], [0.05, 0.45], [0.04, 0.75], [0.075, 0.95], [0.05, 1.1], [0.075, 1.25], [0.045, 1.4], [0.07, 1.55], [0.07, 1.7]];
/** A blind window, its sill at the origin: jambs and sill, a lintel under a little pediment with flame ends, the recessed ground, five turned balusters of wood. */
function windowA(wh, lite = false) {
  return asm(`win|${wh}${lite ? 'l' : ''}`, (m) => {
    const ww = 1.5, t = [];
    for (const sg of [-1, 1]) m.c.push(box(sg * (ww / 2 + 0.02) - 0.13, -0.1, -0.02, sg * (ww / 2 + 0.02) + 0.13, wh + 0.1, 0.16));
    m.c.push(box(-ww / 2 - 0.3, -0.18, -0.02, ww / 2 + 0.3, 0.02, 0.2), box(-ww / 2 - 0.3, wh - 0.02, -0.02, ww / 2 + 0.3, wh + 0.18, 0.2));
    m.o.push(box(-ww / 2 + 0.01, 0.01, -0.02, ww / 2 - 0.01, wh - 0.01, 0.04));
    const nb = lite ? 3 : 5;
    for (let i = 0; i < nb; i++) m.c.push(lathe(BAL.filter((_, k) => (lite ? [0, 5, 11] : [0, 3, 5, 8, 11]).includes(k)).map(([r, v]) => [r * 1.0, v * (wh - 0.04) / 1.7]), lite ? 3 : 4, null, -ww / 2 + 0.2 + i * (ww - 0.4) / (nb - 1), 0.02, 0.1));
    const Ob = [0, wh + 0.18, 0], U = [1, 0], N = [0, 1];
    prism(t, ARCH(ww + 0.5, 0.45, 6), Ob, U, N, 0.1);
    for (const sg of [-1, 1]) boss(t, scaled(LEAF7, 0.13, 0.26, sg * (ww / 2 + 0.3), -0.02), Ob, U, N, 0.09);
    boss(t, scaled(KITE, 0.2, 0.2, 0, 0.12), Ob, U, [0, 1], 0.14);
    tr(m, 'c', t);
  });
}
/** A pilaster 0.5 wide standing out 0.1 from the wall: a base, a shaft with a stem of three medallions, a capital of lotus petals; height ph. */
function pilasterA(ph) {
  return asm(`pil2|${ph}`, (m) => {
    const t = [], U = [1, 0], N = [0, 1], O = [0, 0, 0];
    m.c.push(box(-0.3, 0, -0.02, 0.3, 0.2, 0.14), box(-0.25, 0.2, -0.02, 0.25, ph - 0.3, 0.1), box(-0.3, ph - 0.3, -0.02, 0.3, ph, 0.14));
    strip(t, [0, 0.45], [0, ph - 0.55], 0.04, [0, 0, 0.1], U, N, 0.03);
    const n = Math.max(2, Math.round((ph - 1.1) / 0.55));
    for (let i = 0; i < n; i++) boss(t, scaled(DIAM, 0.16, 0.17, 0, 0.7 + (i + 0.5) * (ph - 1.5) / n), [0, 0, 0.1], U, N, 0.04);
    for (const k of [-1, 0, 1]) boss(t, scaled(LEAF7, 0.17, 0.22, k * 0.17, ph - 0.28), [0, 0, 0.14], U, N, 0.04);
    void O;
    tr(m, 'c', t);
  });
}

// ── the carved lintel ───────────────────────────────────────────────────────────────────────────────────────────
/**
 * A lintel of the Angkor Wat style, half-width W, 0.85 high, on the head of a doorway: a lotus medallion in
 * the middle, garlands hanging from it in swags with a leaf pendant at each junction, a bead band above and below,
 * a volute and a curling leaf at each end. Its origin is the foot of the lintel on the door's front plane.
 */
function lintelA(dw) {
  const W = dw + 0.5, key = dw.toFixed(2);
  return asm(`lin|${key}`, (m) => {
    const t = [], U = [1, 0], N = [0, 1], O = [0, 0, 0.14], th = 0.045;
    m.c.push(box(-W, 0, -0.02, W, 0.85, 0.14));
    strip(t, [-W + 0.05, 0.05], [W - 0.05, 0.05], 0.05, O, U, N, th);
    strip(t, [-W + 0.05, 0.8], [W - 0.05, 0.8], 0.05, O, U, N, th);
    // the medallion: a lotus rosette of eight petals round a boss (the garlands are centred on it and linked to it)
    boss(t, disc(0, 0.42, 0.3, 12), O, U, N, 0.03);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; boss(t, turned(scaled(KITE, 0.13, 0.2), a - Math.PI / 2, Math.cos(a) * 0.1, 0.42 + Math.sin(a) * 0.1), O, U, N, 0.06); }
    boss(t, disc(0, 0.42, 0.07, 8), O, U, N, 0.09);
    boss(t, scaled(LEAF7, 0.24, 0.16, 0, 0.7), O, U, N, 0.05);
    // the garlands, three swags a side
    const x0 = 0.34, x1 = Math.max(x0 + 0.5, dw + 0.12), ns = 3;
    for (const sg of [-1, 1]) for (let s = 0; s < ns; s++) {
      const a = x0 + (x1 - x0) * s / ns, b = x0 + (x1 - x0) * (s + 1) / ns, mid = (a + b) / 2, hh = (b - a) / 2;
      let prev = [sg * a, 0.72];
      for (let i = 1; i <= 6; i++) { const q = i / 6, u = a + (b - a) * q, v = 0.72 - 0.2 * (1 - Math.pow((u - mid) / hh, 2)); strip(t, prev, [sg * u, v], 0.05, O, U, N, th); prev = [sg * u, v]; }
      boss(t, disc(sg * b, 0.72, 0.05, 6), O, U, N, th + 0.015);
      boss(t, scaled(KITE, 0.1, -0.22, sg * mid, 0.62), O, U, N, th);
    }
    // the ends: a volute and a curling leaf
    for (const sg of [-1, 1]) {
      boss(t, disc(sg * (x1 + 0.12), 0.44, 0.1, 8), O, U, N, th + 0.01);
      boss(t, turned(scaled(LEAF7, 0.12, 0.3), -sg * 0.8, sg * (x1 + 0.12), 0.5), O, U, N, th);
      boss(t, turned(scaled(LEAF7, 0.1, 0.24), sg * 0.9, sg * (x1 + 0.12), 0.38), O, U, N, th);
    }
    tr(m, 'c', t);
  });
}

// ── the pediment relief ─────────────────────────────────────────────────────────────────────────────────────────
/**
 * The tympanum's carving, for a pediment of width W and height H (the style's ARCH): two ribs following the arch with
 * flame teeth along the outer one, a seated deity in a halo on a lotus, sprays of leaves rising either side of her.
 * `clip` (the back pediment of a tiered porch): the ribs only where they stand above the front pediment's arch.
 */
function pedimentA(W, H, th, clip) {
  return asm(`ped|${W.toFixed(2)}|${H.toFixed(2)}|${th.toFixed(3)}|${clip ? clip.W.toFixed(2) + '|' + clip.H.toFixed(2) + '|' + clip.dz.toFixed(2) : ''}`, (m) => {
    const t = [], U = [1, 0], N = [0, 1], O = [0, 0, 0];
    const vis = (u, v) => !clip || v > archH(clip.W, clip.H, u) + clip.m;
    for (const [k, wd] of [[0, 0.11], [1, 0.09]]) {
      const Wk = W * (0.9 - 0.2 * k), Hk = H * (0.88 - 0.2 * k), outer = ARCH(Wk, Hk, 12), inner = ARCH(Wk - 2 * wd, Hk - 1.3 * wd, 12);
      for (let i = 0; i + 1 < outer.length; i++) {
        const q = [outer[i], outer[i + 1], inner[i + 1], inner[i]];
        if (q.every(([u, v]) => vis(u, v))) boss(t, q, O, U, N, th);
      }
      if (k === 0) for (let i = 1; i < outer.length - 1; i += 1) {
        const [u, v] = outer[i], a = Math.atan2(outer[i + 1][1] - outer[i - 1][1], outer[i + 1][0] - outer[i - 1][0]);
        if (vis(u, v)) boss(t, turned(scaled(LEAF7, 0.12 * W / 3, 0.15 * W / 3), a - Math.PI / 2 + Math.PI, u, v), O, U, N, th * 0.8);
      }
    }
    if (!clip) {
      const f = H * 0.5, vb = H * 0.1;
      boss(t, disc(0, vb + 0.56 * f, 0.34 * f, 14), O, U, N, th * 0.45);                 // the halo
      for (const part of [
        [[-0.30, 0], [0.30, 0], [0.26, 0.12], [-0.26, 0.12]],                              // the lotus seat
        [[-0.34, 0.1], [0.34, 0.1], [0.2, 0.28], [-0.2, 0.28]],                            // the crossed legs
        [[-0.14, 0.26], [0.14, 0.26], [0.12, 0.52], [-0.12, 0.52]],                         // the body
        [[0.12, 0.46], [0.3, 0.34], [0.33, 0.39], [0.14, 0.52]], [[-0.12, 0.46], [-0.14, 0.52], [-0.33, 0.39], [-0.3, 0.34]],   // the arms
        disc(0, 0.6, 0.08, 8), [[-0.07, 0.66], [0.07, 0.66], [0, 0.88]],                    // the head and the mitre
      ]) boss(t, part.map(([u, v]) => [u * f, v * f + vb]), O, U, N, th);
      for (const sg of [-1, 1]) for (const a of [0.5, 0.95]) boss(t, turned(scaled(LEAF7, 0.1 * W / 3, 0.36 * H), -sg * a, sg * (0.3 + 0.14 * a) * W / 2, vb + 0.02), O, U, N, th * 0.8);
    }
    tr(m, 'c', t);
  });
}

// ── the towers ──────────────────────────────────────────────────────────────────────────────────────────────────
const SIDES = [['e', [1, 0]], ['w', [-1, 0]], ['s', [0, 1]], ['n', [0, -1]]];
/** A niche (a pointed frame round a recessed ground) on a tier's face, width w, height h. */
function nicheA(w, h, dp) {
  return asm(`niche|${w.toFixed(2)}|${h.toFixed(2)}|${dp.toFixed(2)}`, (m) => {
    const t = [], U = [1, 0], N = [0, 1];
    prism(t, ARCH(w, h, 8), [0, 0, 0], U, N, dp);
    tr(m, 'c', t);
    const r = [];
    prism(r, ARCH(w * 0.66, h * 0.84, 8), [0, h * 0.04, dp - 0.02], U, N, 0.05);
    tr(m, 'o', r);
  });
}
/** The door and pediment frames of a tower as k_tower builds them, and its tiers; then lays the carving over them. */
function towerDress(ctx, tw) {
  const { bag } = ctx, [cx, cz] = tw.c, y = tw.y, w = tw.w, H = tw.h, hw = w / 2, cel = tw.cella;
  const body = Math.min(H * 0.28, w * 1.1), n = 3, d = hw * 0.09, c = [cx, cz];
  for (const [f, N] of SIDES) {
    let door = null;
    if (tw.porches !== false) {
      const depth = w * 0.24, width = w * 0.36, hP = body * 0.7, d1 = hw + depth, tiers = w > 8 ? 2 : 1;
      door = cel ? { dw: cel.dw, dh: cel.dh, yd: y + 0.7, d: d1 } : { dw: Math.min(1.1, width * 0.16), dh: Math.min(3.2, (hP - 1.2) * 0.75), yd: y + 0.7, d: d1 };
      // the pediments (the style's pediment(): front of the tympanum 0.3 f past the plane, the frame 0.9 f)
      const W1 = width + 0.3, H1 = width * 0.42, f1 = Math.max(0.25, width * 0.05), th1 = Math.min(0.08, 0.6 * f1 - 0.04);
      put(bag, pedimentA(W1 - 0.5, H1 - 0.3, th1), at3(c, N, d1 - 0.05 + 0.3 * f1).filter((_, i) => i !== 1), y + hP, N);
      if (tiers > 1) {
        const d2 = hw + depth * 0.45, W2 = width * 0.78, H2 = H1 * 1.65, f2 = f1 * 0.85, th2 = Math.min(0.08, 0.6 * f2 - 0.04);
        // (the carving of the back pediment only above the front one's arch and its frame: 4 f beyond)
        put(bag, pedimentA(W2 - 0.5, H2 - 0.3, th2, { W: W1 + 2 * f1, H: H1 + 1.5 * f1, m: f1 * 0.6, dz: 0 }), at3(c, N, d2 - 0.05 + 0.3 * f2).filter((_, i) => i !== 1), y + hP, N);
      }
    } else if ((tw.doors ?? 'nesw').includes(f)) {
      door = cel ? { dw: cel.dw, dh: cel.dh, yd: y + 0.7, d: hw } : { dw: Math.min(1.1, w * 0.12), dh: Math.min(3.2, body * 0.55), yd: y + 0.8, d: hw };
    }
    if (door) put(bag, lintelA(door.dw), at3(c, N, door.d + 0.12).filter((_, i) => i !== 1), door.yd + door.dh, N);
  }
  // the niches of the tiers, as k_tower lays them out
  const tiers = tw.tiers ?? 5, zone = H - body, bud = zone * 0.2, curve = (q) => Math.pow(1 - Math.pow(q, 1.5), 0.8);
  let hs = [], tot = 0;
  for (let k = 0; k < tiers; k++) { hs.push(Math.pow(0.88, k)); tot += hs[k]; }
  hs = hs.map((v) => v / tot * (zone - bud));
  let yy = body, sk = 0.98 * curve(0);
  for (let k = 0; k < tiers; k++) {
    const h = hs[k], sn = 0.98 * curve((yy + h - body) / zone), half = hw * sk, cWide = (hw - n * d) * sk;
    const nw = Math.min(0.34 * cWide * 2 * 0.5, h * 0.5, 2.0), nh = Math.min(h * 0.46, nw * 1.6);
    if (nw > 0.45) for (const [, N] of SIDES) put(bag, nicheA(nw, nh, 0.12 + half * 0.05), at3(c, N, half * 0.95).filter((_, i) => i !== 1), y + yy + h * 0.09, N);
    yy += h; sk = sn;
  }
}
function akTDress(el, ctx) { towerDress(ctx, el); }

// ── the galleries ───────────────────────────────────────────────────────────────────────────────────────────────
/** The pieces of a k_gallery as the style builds them (its loops, copied): [{ A, B, len, ux, uz, n, out, np, s0, s1, L, wa, wb, f, gate }] and the towers it carries. */
function galleryPieces(el) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, w = el.w, h = el.h, hw = w / 2, pieces = [], towers = [];
  const sides = [[[x0, z0], [x1, z0], [0, -1]], [[x1, z1], [x0, z1], [0, 1]], [[x0, z1], [x0, z0], [-1, 0]], [[x1, z0], [x1, z1], [1, 0]]];
  for (const [a, b, n] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, out = el.solid === 'out' ? 1 : -1;
    const side = n[0] ? (n[0] > 0 ? 'e' : 'w') : (n[1] > 0 ? 's' : 'n');
    const gate = el.gates && (!el.gateSides || el.gateSides.includes(side)) ? el.gate ?? Math.min(18, L * 0.18) : 0;
    const ps = gate ? [[0, L / 2 - gate / 2], [L / 2 + gate / 2, L]] : [[0, L]];
    for (const [s0, s1] of ps) {
      const A = [a[0] + ux * s0, a[1] + uz * s0], B = [a[0] + ux * s1, a[1] + uz * s1], len = s1 - s0;
      const wa = [A[0] + n[0] * hw * out, A[1] + n[1] * hw * out], wb = [B[0] + n[0] * hw * out, B[1] + n[1] * hw * out];
      pieces.push({ A, B, len, ux, uz, n, out, np: Math.max(1, Math.round(len / 3.2)), s0, s1, L, wa, wb, f: [-n[0] * out, -n[1] * out], gate });
    }
    const gw = Math.min(gate * 0.55, 9);
    if (gate && !(el.gatePass && gw < 6)) towers.push({ c: [a[0] + ux * L / 2, a[1] + uz * L / 2], y: y - 0.6, w: gw, h: el.gateH ?? h * 3.2, tiers: 3, porches: false, ...(el.gatePass ? { cella: { half: Math.min(2.2, gw / 2 * (1 - 0.27) - 0.1), dw: 1.1, dh: 3.2 } } : {}) });
  }
  if (el.corner) for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) towers.push({ c: [x, z], y: y - 0.6, w: w * 1.1, h: el.corner, tiers: 4, porches: false });
  return { pieces, towers };
}
const rect = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];

function akGDress(el, ctx) {
  const { bag } = ctx, y = el.y, h = el.h, hw = el.w / 2, dr = el.dress ?? {};
  const { pieces, towers } = galleryPieces(el);
  const seen = new Set(), inst = !!el.inst;
  pieces.forEach((pc, pi) => {
    const emit = !el.dpieces || el.dpieces.includes(pi);      // (a pillar shared by two pieces is claimed by the first, whichever plan draws it)
    // ── the pillars
    for (let k = 0; k <= pc.np; k++) {
      const s = k / pc.np, p = [pc.A[0] + (pc.B[0] - pc.A[0]) * s, pc.A[1] + (pc.B[1] - pc.A[1]) * s];
      for (const off of el.half ? [-hw, -hw - 2.6] : [-hw]) {
        const q = [p[0] + pc.n[0] * off * pc.out, p[1] + pc.n[1] * off * pc.out], ph = off < -hw ? h * 0.62 : h, key = `${q[0].toFixed(2)}|${q[1].toFixed(2)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (emit) put(bag, pillarA(ph, 0.32, false, el.reliefMap && pc.n[0] >= 0 || el.devatas), q, y, [0, 1], inst);
      }
    }
    if (!emit) return;
    // ── the wall's carved face (the one opposite the relief's)
    const Nn = [-pc.f[0], -pc.f[1]], U = [pc.ux, pc.uz], len = pc.len, P = (s, o = 0) => [pc.wa[0] + U[0] * s + Nn[0] * o, pc.wa[1] + U[1] * s + Nn[1] * o];
    const t0 = pc.s0 === 0 ? 0.9 : 0.5, t1 = pc.s1 >= pc.L - 1e-6 ? 0.9 : 0.5, a = t0, b = len - t1;
    if (b - a < 1) return;
    const bx = (s0, s1, o0, o1, y0, y1, mat = C) => { const r = rect(P(s0, o0), P(s1, o1)); bag.add(mat, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
    // the moulded plinth, down to the floor's underside
    bx(a, b, 0.45, 0.56, -0.6, 0.3); bx(a, b, 0.45, 0.51, 0.3, 0.46);
    // the cornice and the frieze of lotus petals under it
    bx(a, b, 0.45, 0.51, h - 0.1, h + 0.1); bx(a, b, 0.45, 0.555, h + 0.1, h + 0.4);
    if (h >= 3.7) {
      bx(a, b, 0.45, 0.49, h - 0.82, h - 0.76);
      const t = [], n = Math.floor((b - a) / 0.5), O0 = (s) => at3(P(s, 0.44), [0, 0], 0, y + h - 0.76);
      for (let i = 0; i < n; i++) { const o = O0(a + (i + 0.5) * (b - a) / n); facet(t, scaled(KITE, 0.3 * hand(i, a), 0.46), [0, 0.2, 0.08], o, perp(Nn).map((v) => -v), Nn); }
      if (t.length) bag.add(C, fromTriangles(t));
    }
    // the piers between the bays: devatas, or pilasters
    const bay = len / pc.np, wh = Math.min(1.7, h - 2.0);
    for (let k = 1; k < pc.np; k++) {
      const s = k * bay;
      if (s < a + 0.4 || s > b - 0.4) continue;
      if (dr.dev) {
        const q = P(s, 0.45), west = pc.n[0] < 0;
        // full within reach of the way in (the gate wings' west face, seen from the causeway's end), reduced as far as 45 m of the temple's west gate, the old form beyond
        const tier = el.rect[0] < -100 ? (west ? 'full' : 'red') : (el.reliefMap && west && Math.abs(q[1]) <= 45 ? 'red' : 'old');
        put(bag, devataA(1.0, tier), q, y + 0.62, Nn, inst);
      }
      else if (dr.pil && k % 2 === 0) put(bag, pilasterA(h - 0.5), P(s, 0.45), y + 0.5, Nn, inst);
    }
    if (dr.win) for (let k = 0; k < pc.np; k++) {
      const s = (k + 0.5) * bay;
      if (s < a + 0.9 || s > b - 0.9) continue;
      put(bag, windowA(wh, !(pc.n[0] < 0 && Math.abs(P(s, 0.45)[1]) <= 45)), P(s, 0.45), y + 0.9, Nn, inst);
    }
  });
  if (el.dpieces && !el.dtowers) return;
  for (const tw of towers) towerDress(ctx, tw);
}

// ── the naga balustrade ────────────────────────────────────────────────────────────────────────────────────────
function akNDress(el, ctx) {
  const { bag } = ctx, [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = el.y, h = el.h ?? 1.0;
  const yb = y + h - 0.12, r = Math.min(0.27, h * 0.27), U = [ux, uz], Ns = perp(U);
  const trim = (k) => (el.hoods ? 1.15 : el.ends === false || (typeof el.ends === 'string' && el.ends !== k) ? 0.2 : 1.15);
  const s0 = trim('a'), s1 = L - trim('b'), t = [], crest = [];
  const pos = (s, o) => [ax + ux * s + Ns[0] * o, az + uz * s + Ns[1] * o];
  const ringAt = (s) => { const q = (s - 0.6) / 0.9; return Math.abs(q - Math.round(q)) * 0.9 < 0.24 && q > -0.5; };
  // the scales: two rows of diamonds on each flank, staggered
  for (const sg of [-1, 1]) {
    const N = [Ns[0] * sg, Ns[1] * sg], Uu = perp(N);
    for (const [row, dv, ph] of [[0, 0.085 * h / 0.9, 0], [1, -0.085 * h / 0.9, 0.5]]) {
      const step = 0.25 * Math.max(0.6, h);
      for (let s = s0 + 0.12 + ph * step; s < s1 - 0.1; s += step) {
        if (ringAt(s)) continue;
        const p = pos(s, sg * (r - 0.035)), O = [p[0], yb + dv, p[1]];
        facet(t, scaled(DIAM, step * 0.66 * hand(s, sg), step * 0.46), [0, 0, 0.032], O, Uu.map((v) => -v), N);
        void row;
      }
    }
  }
  // the crest: a row of flame-shaped lobes along the back, on a thin spine
  const step = 0.3 * Math.max(0.7, h);
  for (let s = s0 + 0.15; s < s1 - 0.1; s += step) {
    if (ringAt(s)) continue;
    const p = pos(s, -0.02);
    boss(crest, scaled(KITE, step * 0.62 * hand(s, 5), 0.17 * Math.max(0.7, h)), [p[0], yb + r - 0.035, p[1]], U, Ns, 0.04);
  }
  if (t.length) bag.add(C, fromTriangles(t));
  if (crest.length) bag.add(C, fromTriangles(crest));
}

/** The hood of a naga on each end of a rail that carries `hoods`: seven heads on a scalloped fan over a neck rising off a moulded pedestal (sculpt.js nagaHood). */
function hoodA(h, heads) {
  return asm(`hood|${h}|${heads}`, (m) => {
    const yb = h - 0.12, hd = nagaHood(h, heads);
    m.c.push(box(-0.62, 0, -0.35, 0.62, 0.16, 0.95), box(-0.6, yb - 0.32, -0.34, 0.6, yb - 0.2, 0.94), hd.c);
    m.o.push(box(-0.55, 0.16, -0.28, 0.55, yb - 0.32, 0.88), hd.s);
  });
}
function akNHood(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = el.y, h = el.h ?? 1.0;
  if (!el.hoods) return;
  for (const [p, sg] of [[el.a, -1], [el.b, 1]]) {
    const D = [ux * sg, uz * sg];
    put(bag, hoodA(h, el.heads ?? 7), p, y, D);
    col.rect([p[0] + D[0] * 0.4 - 0.8, p[1] + D[1] * 0.4 - 0.8, p[0] + D[0] * 0.4 + 0.8, p[1] + D[1] * 0.4 + 0.8], y, y + h + 2);
  }
}

// ── the cloister ────────────────────────────────────────────────────────────────────────────────────────────────
function akCDress(el, ctx) {
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, w = el.w ?? 4, h = el.h ?? 3.4, hw = w / 2, xs = el.stair, inst = !!el.inst;
  const xm = el.cross ?? (x0 + x1) / 2, gn = z0 + hw + 0.6, gs = z1 - hw - 0.6, fy = y + 0.4;
  const row = ({ axis, u0, u1, v, sides, skip = [] }) => {
    const X = axis === 'x', P = (u, o) => (X ? [u, v + o] : [v + o, u]), L = u1 - u0;
    sides.forEach((kind, i) => {
      if (kind !== 'pillars') return;
      const o = i ? hw : -hw, np = Math.max(1, Math.round(L / 3));
      for (let k = 0; k <= np; k++) {
        const u = u0 + L * k / np;
        if (skip.some(([a, b]) => u > a - 0.5 && u < b + 0.5)) continue;
        put(bag, pillarA(h, 0.3, true), P(u, o), fy, [0, 1], inst);
      }
    });
  };
  row({ axis: 'x', u0: x0, u1: x1, v: gs, sides: ['pillars', 'windows'], skip: [[xm - hw, xm + hw]] });
  row({ axis: 'x', u0: el.west ?? x0, u1: xs, v: 0, sides: ['pillars', 'pillars'], skip: [[xm - hw, xm + hw]] });
  for (const [a, b] of [[gn + hw + 0.6, -hw - 0.6], [hw + 0.6, gs - hw - 0.6]]) row({ axis: 'z', u0: a, u1: b, v: xm, sides: ['pillars', 'pillars'] });
  // the devatas on the piers between the windows of the walls (north gallery both faces, the south gallery's outer face): modelled figures, the first a visitor passes
  for (const [v, side, broken, tier] of [[gn, 0, false, 'red'], [gn, 1, true, 'full'], [gs, 1, false, 'red']]) {
    const o = side ? hw : -hw, Nz = side ? 1 : -1, gaps = broken ? [[xm - hw, xm + hw]] : [], segs = [];
    let s0 = x0;
    for (const [a, b] of [...gaps, [x1, x1]]) { if (a - s0 > 0.3) segs.push([s0, a]); s0 = Math.max(s0, b); }
    for (const [a, b] of segs) {
      const np = Math.max(1, Math.round((b - a) / 3.2));
      for (let k = 1; k < np; k++) put(bag, devataA(1.0, tier), [a + (b - a) * k / np, v + o + Nz * 0.45], fy + 0.5, [0, Nz], inst);
    }
  }
  // the four pediments of the crossing (the style's: width w + 1.2, height 0.9 w, frame 0.3, at hw + 0.85 from the middle)
  const W = w + 1.2, H = w * 0.9, f = 0.3, th = Math.min(0.08, 0.6 * f - 0.04);
  for (const N of [[1, 0], [-1, 0], [0, 1], [0, -1]]) put(bag, pedimentA(W - 0.5, H - 0.3, th), [xm + N[0] * (hw + 0.85 + 0.3 * f), N[1] * (hw + 0.85 + 0.3 * f)], fy + h + 1.1, N, inst);
}

// (the *_wall names: the carving built apart in plans near the visitor (plan.js CARVED); a name with `wall` is not taken by src/objects/life.js for a house)
Object.assign(STYLES.khmer.elements, { ak_gdress: akGDress, ak_tdress: akTDress, ak_ndress: akNDress, ak_nhood: akNHood, ak_cdress: akCDress, ak_gdress_wall: akGDress, ak_cdress_wall: akCDress });
export { akGDress, akTDress, akNDress, akCDress, galleryPieces, devataA, hoodA, put };
