// The bas-relief galleries of Angkor Wat's third gallery (docs/settlements/angkor.md §28): on the wall's face to the open
// gallery a polished band 2 m high carries the panels (the Churning of the Sea of Milk, the battles, the procession of
// Suryavarman II, the heavens and hells), a frieze of lotus petals above it. The compositions are the khmer style's
// (src/styles/khmer/reliefs.js: where each figure stands, in the viewer's frame); this file carves them: every part of
// every figure as a faceted boss of 2–6 cm (a truncated pyramid for bodies, a pyramid for the thin limbs and spears),
// in the wall's own sandstone, all of a panel in one mesh, so that no material and no draw is added.
//   ak_relief — over a k_gallery with `reliefMap` ({ w: { s, n }, s: { w, e }, e: { s, n }, n: { e, w } } subjects).

import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, fromTriangles } from '../../core/geom.js';
import { panel } from '../../styles/khmer/reliefs.js';
import { composePanel } from './panels.js';
import { galleryPieces } from './dress.js';
import { puller, serpentRope, nagaFan } from './sculpt.js';
import { merge } from '../../objects/kit.js';
import { Matrix4, Vector3 } from '../../core/three.js';

const C = 'sandstone_carved';
const area = (o) => { let a = 0; for (let i = 0; i < o.length; i++) { const p = o[i], q = o[(i + 1) % o.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; };
const KITE = [[-0.5, 0.25], [0, 0], [0.5, 0.25], [0, 1]];
const DIAM = [[0, -1], [0.62, 0], [0, 1], [-0.62, 0]];
const sc = (o, w, h, du = 0, dv = 0) => o.map(([u, v]) => [u * w + du, v * h + dv]);

/** Triangles of a boss of outline (in the wall's frame) and height t, as mapP(u, v, w) → world; oriented away from the stone. */
function carve(out, outline, t, mapP, round) {
  const m = outline.length;
  let cu = 0, cv = 0;
  for (const [u, v] of outline) { cu += u; cv += v; }
  cu /= m; cv /= m;
  const B = outline.map(([u, v]) => mapP(u, v, 0)), I = mapP(cu, cv, -0.03), tri = [];
  if (round && m >= 5 && area(outline) > 0.006) {
    const k = 0.45, T = outline.map(([u, v]) => mapP(cu + (u - cu) * k, cv + (v - cv) * k, t));
    for (let i = 0; i < m; i++) { const j = (i + 1) % m; tri.push([B[i], B[j], T[j]], [B[i], T[j], T[i]]); }
    for (let i = 1; i + 1 < m; i++) tri.push([T[0], T[i], T[i + 1]]);
  } else {
    const A = mapP(cu, cv, t);
    for (let i = 0; i < m; i++) tri.push([B[i], B[(i + 1) % m], A]);
  }
  for (const [a, b, c] of tri) {
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
    if (nx * nx + ny * ny + nz * nz < 1e-12) continue;
    const d = nx * ((a[0] + b[0] + c[0]) / 3 - I[0]) + ny * ((a[1] + b[1] + c[1]) / 3 - I[1]) + nz * ((a[2] + b[2] + c[2]) / 3 - I[2]);
    if (d >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
  }
}

function akRelief(el, ctx) {
  const { bag } = ctx, y = el.y, [x0, , x1] = el.rect, { pieces } = galleryPieces(el), map = el.reliefMap ?? {};
  const rectOf = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  for (const pc of pieces) {
    const { wa, ux, uz, len, f } = pc, U = [ux, uz], n = pc.n;
    const side = n[0] ? (n[0] > 0 ? 'e' : 'w') : (n[1] > 0 ? 's' : 'n');
    const half = n[1] ? ((pc.A[0] + pc.B[0]) / 2 < (x0 + x1) / 2 ? 'w' : 'e') : ((pc.A[1] + pc.B[1]) / 2 < (el.rect[1] + el.rect[3]) / 2 ? 'n' : 's');
    const subject = map[side]?.[half] ?? null;
    const P = (s, o = 0) => [wa[0] + U[0] * s + f[0] * o, wa[1] + U[1] * s + f[1] * o];
    const bx = (s0, s1, o0, o1, y0, y1) => { const r = rectOf(P(s0, o0), P(s1, o1)); bag.add(C, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
    const a = 0.3, b = len - 0.3, W0 = 0.45;
    // the band: a polished slab 2 m high between a moulded foot and a moulded head
    bx(a, b, W0 - 0.01, W0 + 0.04, 0.8, 2.8);
    bx(a, b, W0 - 0.01, W0 + 0.1, 0.62, 0.8); bx(a - 0.06, b + 0.06, W0 - 0.01, W0 + 0.07, 0.56, 0.62);
    bx(a, b, W0 - 0.01, W0 + 0.1, 2.8, 2.98); bx(a - 0.06, b + 0.06, W0 - 0.01, W0 + 0.07, 2.98, 3.04);
    const toRight = ux * f[1] - uz * f[0] > 0, sAt = (x) => (toRight ? 0.4 + x : len - 0.4 - x);
    const mapFig = (u, v, w) => { const p = P(sAt(u), W0 + 0.04 + w); return [p[0], y + 0.8 + v, p[1]]; };
    const mapWall = (u, v, w) => { const p = P(sAt(u), W0 + w); return [p[0], y + v, p[1]]; };
    const T = [];
    // the lotus petals of the frieze over the band, on the wall's face
    const nP = Math.floor((len - 0.8) / 0.24);
    for (let i = 0; i < nP; i++) carve(T, sc(KITE, 0.2, 0.24, (i + 0.5) * (len - 0.8) / nP, 3.12), 0.035, mapWall, false);
    const mine = subject ? composePanel(subject, len - 0.8) : null;
    const pan = mine ? { unique: mine, tiles: [] } : subject ? panel(subject, len - 0.8) : null;
    if (pan) {
      const put = (outline, dx, thick) => carve(T, dx ? outline.map(([u, v]) => [u + dx, v]) : outline, thick >= 0.075 ? 0.06 : 0.035, mapFig, true);
      for (const part of pan.unique) put(part, 0, part.t ?? 0.05);
      for (const tl of pan.tiles) for (const x of tl.xs) for (const part of tl.parts) put(part, x, part.t ?? 0.05);
      const L = len - 0.8;
      if (subject === 'churning') {
        // the sea: ridges of waves along the foot
        for (let x = 0.3; x < L - 0.4; x += 0.15) carve(T, [[x, 0.03], [x + 0.15, 0.03], [x + 0.075, 0.1]], 0.02, mapFig, false);
        // the modelled pullers, the thick scaled serpent and its five-hooded head (sculpt.js), in the panel's frame
        const sg = toRight ? 1 : -1, s0 = toRight ? 0.4 : len - 0.4, o0 = P(s0, W0 + 0.04);
        const M = new Matrix4().makeBasis(new Vector3(U[0] * sg, 0, U[1] * sg), new Vector3(0, 1, 0), new Vector3(f[0], 0, f[1])).setPosition(o0[0], y + 0.8, o0[1]);
        const flip = M.determinant() < 0, G = [];
        const into = (g) => { g.applyMatrix4(M); if (flip) for (const a of ['position', 'normal']) { const r = g.attributes[a].array; for (let i = 0; i < r.length; i += 9) for (let k = 0; k < 3; k++) { const t = r[i + 3 + k]; r[i + 3 + k] = r[i + 6 + k]; r[i + 6 + k] = t; } } G.push(g); };
        for (const pl of mine.solids ?? []) into(puller(pl.kind, pl.d, pl.vr, pl.i, pl.k).translate(pl.x, pl.v, 0));
        for (const [a, b, v, r] of mine.ropes ?? []) into(serpentRope(a, b, v, r));
        if (mine.hood) { const h = mine.hood, g = nagaFan(0.8, h.heads, 0).scale(h.s, h.s, h.s * 0.6); into(g.translate(h.u, h.v - 0.8 * 0.95 * h.s, 0.03)); }
        if (G.length) bag.add(C, merge(G));
      } else if (subject === 'procession' || subject === 'heavens') {
        for (let x = 0.3; x < L - 0.4; x += 0.2) carve(T, sc(DIAM, 0.07, 0.035, x, 0.025), 0.015, mapFig, false);     // a lozenge dado along the foot
      } else {
        for (let x = 0.3; x < L - 0.4; x += 0.2) carve(T, sc(DIAM, 0.07, 0.035, x, 0.025), 0.015, mapFig, false);
      }
    }
    if (T.length) bag.add(C, fromTriangles(T));
  }
}

Object.assign(STYLES.khmer.elements, { ak_relief: akRelief });
export { akRelief };
