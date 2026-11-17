// Angkor — the libraries of the inner causeway made enterable (docs/settlements/angkor.md §23).
// The khmer style's k_library draws the library as a solid hall under a nave vault with porticoes on four sides. This
// element runs that builder through a filter that drops its solid hall and the solid fill of its two end porticoes
// (and their blind doorways), and puts in their place a hollow hall with a passage through each end, and inside it the
// things of the building: shelves of palm-leaf manuscripts wrapped in cloth, a reading desk, chests, a homa fire pit,
// oil lamps. The exterior (platform, stairs, cornices, vaults, pediments, blind windows, the side porticoes) is the
// style's own, untouched.

import { STYLES } from '../../core/build.js';
import '../../styles/khmer/index.js';
import { box, lathe } from '../../core/geom.js';

const S = 'sandstone_khmer', C = 'sandstone_carved';
const perp = (N) => [-N[1], N[0]];
const boxR = (r, y0, y1) => box(r[0], y0, r[1], r[2], y1, r[3]);
function rUD(c, N, u0, u1, d0, d1) {
  const U = perp(N), pts = [[u0, d0], [u1, d1]].map(([u, d]) => [c[0] + U[0] * u + N[0] * d, c[1] + U[1] * u + N[1] * d]);
  return [Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])];
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 2e-3);

/** The dimensions the style's k_library uses, from its rectangle and height (so that the filter can find its pieces). */
export function libraryDims(el) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 5, c = [(x0 + x1) / 2, (z0 + z1) / 2], alongX = x1 - x0 >= z1 - z0;
  const A = (alongX ? x1 - x0 : z1 - z0) / 2, B = (alongX ? z1 - z0 : x1 - x0) / 2, NL = alongX ? [1, 0] : [0, 1];
  const dE = 1.5, h2 = h * 0.82, width = B * 1.3, dw0 = Math.min(1.1, width * 0.16), dh0 = Math.min(3.2, (h2 - 1.2) * 0.75);
  return { x0, z0, x1, z1, h, c, A, B, NL, dE, h2, width, dw0, dh0, d1: A + dE };
}

function akLibrary(el, ctx) {
  const D = libraryDims(el), { x0, z0, x1, z1, h, c, A, B, NL, h2, width, dw0, dh0, d1 } = D, y = el.y, th = 0.9;
  const ends = [NL, [-NL[0], -NL[1]]];
  // ── what the style's builder draws that we do not want, as boxes (material, [x0,y0,z0,x1,y1,z1])
  const gone = [[S, [x0, y + 0.6, z0, x1, y + h - 0.5, z1]]], goneCol = [[[x0, z0, x1, z1], y, y + h]];
  for (const N of ends) {
    const p = rUD(c, N, -width / 2, width / 2, A - 0.3, d1), f = rUD(c, N, -dw0 - 0.45, dw0 + 0.45, d1 - 0.05, d1 + 0.12), o = rUD(c, N, -dw0, dw0, d1 - 0.05, d1 + 0.16);
    gone.push([S, [p[0], y + 0.7, p[1], p[2], y + h2 - 0.45, p[3]]], [C, [f[0], y + 0.7, f[1], f[2], y + 0.7 + dh0 + 0.5, f[3]]], ['opening', [o[0], y + 0.7, o[1], o[2], y + 0.7 + dh0, o[3]]]);
    goneCol.push([rUD(c, N, -width / 2 - 0.3, width / 2 + 0.3, A - 0.3, d1 + 0.3), y, y + h2]);
  }
  const hit = gone.map(() => 0), hitCol = goneCol.map(() => 0);
  const bag = Object.create(ctx.bag), col = Object.create(ctx.col);
  bag.add = (mat, g, ...rest) => {
    g.computeBoundingBox?.();
    const b = g.boundingBox, bb = b ? [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z] : null;
    const i = bb ? gone.findIndex(([m, q]) => m === mat && same(q, bb)) : -1;
    if (i >= 0) { hit[i]++; return undefined; }
    return ctx.bag.add(mat, g, ...rest);
  };
  col.rect = (r, y0, y1, ...rest) => {
    const n = [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
    const i = goneCol.findIndex(([q, a, b]) => same(q, n) && Math.abs(a - y0) < 2e-3 && Math.abs(b - y1) < 2e-3);
    if (i >= 0) { hitCol[i]++; return undefined; }
    return ctx.col.rect(r, y0, y1, ...rest);
  };
  STYLES.khmer.elements.k_library(el, { ...ctx, bag, col });
  akLibrary.lastHits = { bag: hit, col: hitCol };

  const B0 = ctx.bag, K = ctx.col;
  const R = (u0, u1, d0, d1_) => rUD(c, NL, u0, u1, d0, d1_);
  // ── the hollow hall: long walls, end walls with a doorway through each, a head over each door
  const top = y + h - 0.5, fy = y + 0.6, ih = A - th, iw = B - th;
  for (const sg of [-1, 1]) {
    const r = R(sg < 0 ? -B : B - th, sg < 0 ? -B + th : B, -A, A);
    B0.add(S, boxR(r, fy, top)); K.rect(r, y, y + h);
  }
  for (const N of ends) {
    const e = (u0, u1, d0, d1_) => rUD(c, N, u0, u1, d0, d1_);
    for (const sg of [-1, 1]) { const r = e(sg < 0 ? -iw : dw0, sg < 0 ? -dw0 : iw, A - th, A); B0.add(S, boxR(r, fy, top)); K.rect(r, y, y + h); }
    const head = e(-dw0, dw0, A - th, A);
    B0.add(S, boxR(head, y + 0.7 + dh0, top)); K.rect(head, y + 0.7 + dh0, y + h);
    // the vestibule through the portico: thick side walls either side of the passage, a lintel over it
    for (const sg of [-1, 1]) { const r = e(sg < 0 ? -width / 2 : dw0, sg < 0 ? -dw0 : width / 2, A, d1); B0.add(S, boxR(r, y + 0.7, y + h2 - 0.45)); K.rect(e(sg < 0 ? -width / 2 - 0.3 : dw0, sg < 0 ? -dw0 : width / 2 + 0.3, A, d1 + 0.3), y, y + h2); }
    const lin = e(-dw0, dw0, A, d1); B0.add(S, boxR(lin, y + 0.7 + dh0, y + h2 - 0.45)); K.rect(lin, y + 0.7 + dh0, y + h2);
    // the carved jambs and head of the doorway (as the style's open doorways), the threshold, the step up
    for (const sg of [-1, 1]) B0.add(C, boxR(e(sg < 0 ? -dw0 - 0.45 : dw0, sg < 0 ? -dw0 : dw0 + 0.45, d1 - 0.05, d1 + 0.12), y + 0.7, y + 0.7 + dh0 + 0.5));
    B0.add(C, boxR(e(-dw0, dw0, d1 - 0.05, d1 + 0.12), y + 0.7 + dh0, y + 0.7 + dh0 + 0.5));
    B0.add(C, boxR(e(-dw0, dw0, A - th, A - 0.3), y + 0.6, y + 0.7));
    K.floor(e(-dw0, dw0, A - th, d1 + 0.3), y + 0.7);
    const st = e(-dw0 - 0.2, dw0 + 0.2, d1 + 0.3, d1 + 0.5);
    B0.add(S, boxR(st, y, y + 0.35)); K.floor(st, y + 0.35);
  }
  K.floor(R(-iw, iw, -ih, ih), fy);
  // the ceiling slab is the style's cornice course: a solid over the whole hall (the nave stands on it)
  K.rect(R(-iw, iw, -ih, ih), top, y + h + 1.3);
  // dark beams across, under the slab
  for (let d = -ih + 0.6; d < ih; d += 1.2) B0.add('timber', boxR(R(-iw, iw, d - 0.09, d + 0.09), top - 0.17, top));

  // ── inside. The shelves stand on the wall of side σ, the other side holds the chests; local u across (−3.1 at the shelf wall)
  const sig = el.side === 'n' ? -1 : 1, rand = rng(el.seed || 1);
  const P = (d, u) => [c[0] + NL[0] * d + perp(NL)[0] * u * sig * -1, c[1] + NL[1] * d + perp(NL)[1] * u * sig * -1];
  const Rr = (d0, d1_, u0, u1) => { const a = P(d0, u0), b = P(d1_, u1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const us = -(B - th);                                                             // the shelf wall's inner face (local u; −: toward the shelf)
  // a mat of reed over the floor, the aisle clear
  B0.add('reed_mat', boxR(Rr(-ih + 0.5, ih - 0.5, us + 0.8, -us - 0.8), fy, fy + 0.012));
  // the shelf rack: posts every 2.4 m, boards at 0.5, 1.05, 1.6 and a top board, on which the manuscripts lie in bundles
  const posts = []; for (let d = -4.8; d <= 4.81; d += 2.4) posts.push(d);
  for (const d of posts) { B0.add('timber', boxR(Rr(d - 0.05, d + 0.05, us + 0.02, us + 0.12), fy, fy + 1.9)); B0.add('timber', boxR(Rr(d - 0.05, d + 0.05, us + 0.48, us + 0.58), fy, fy + 1.9)); }
  const bundleMats = ['cloth_ochre', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'];
  for (const yy of [0.5, 1.05, 1.6]) {
    B0.add('timber', boxR(Rr(-4.85, 4.85, us + 0.02, us + 0.58), fy + yy, fy + yy + 0.035));
    for (let d = -4.65; d < 4.7; d += 0.62) {
      if (rand() < 0.12) continue;
      const n = 1 + Math.floor(rand() * 3), w = rand() < 0.5 ? 0.5 : 0.44;
      for (let k = 0; k < n; k++) {
        const y0 = fy + yy + 0.035 + k * 0.075;
        B0.add('reed_mat', boxR(Rr(d - w / 2, d + w / 2, us + 0.12, us + 0.46), y0, y0 + 0.07));      // the palm-leaf leaves, cut to a long narrow page
        B0.add(bundleMats[Math.floor(rand() * bundleMats.length)], boxR(Rr(d - w / 2 - 0.01, d + w / 2 + 0.01, us + 0.1, us + 0.2), y0, y0 + 0.071)); // the cloth wrapped round each bundle's end
      }
    }
  }
  K.rect(Rr(-4.85, 4.85, us, us + 0.6), fy, fy + 1.95);
  // the other wall: three chests with lids, a water pot and a bowl on them
  const uo = -us;
  for (const d of [-3.6, 0.2, 3.4]) {
    B0.add('timber', boxR(Rr(d - 0.55, d + 0.55, uo - 0.62, uo - 0.02), fy, fy + 0.52)); B0.add('timber_red', boxR(Rr(d - 0.58, d + 0.58, uo - 0.65, uo + 0.0), fy + 0.52, fy + 0.58));
    K.rect(Rr(d - 0.58, d + 0.58, uo - 0.65, uo), fy, fy + 0.6);
  }
  { const p = Rr(-3.6, -3.6, uo - 0.33, uo - 0.33); B0.add('terracotta', lathe([[0.001, 0], [0.18, 0.01], [0.26, 0.15], [0.28, 0.3], [0.2, 0.46], [0.16, 0.5], [0.001, 0.5]], 10, null, p[0], fy + 0.58, p[1])); }
  // the reading desk before the shelves: a low top on four legs, a bundle open on it; the reader's mat beside
  { const d = -2.4, u = us + 1.35, top2 = fy + 0.34;
    const a = Rr(d - 0.32, d + 0.32, u - 0.22, u + 0.22);
    B0.add('timber', boxR(a, top2, top2 + 0.035));
    for (const [dd, uu] of [[-0.28, -0.18], [0.28, -0.18], [-0.28, 0.18], [0.28, 0.18]]) { const q = Rr(d + dd - 0.025, d + dd + 0.025, u + uu - 0.025, u + uu + 0.025); B0.add('timber', boxR(q, fy, top2)); }
    B0.add('reed_mat', boxR(Rr(d - 0.24, d + 0.24, u - 0.15, u + 0.15), top2 + 0.035, top2 + 0.065));
    B0.add('cloth_white', boxR(Rr(d - 0.26, d + 0.26, u - 0.17, u - 0.1), top2 + 0.035, top2 + 0.07));
    K.rect(a, fy, top2 + 0.07);
    B0.add('reed_mat', boxR(Rr(d - 0.55, d + 0.55, u + 0.3, u + 1.15), fy + 0.012, fy + 0.03)); }
  // the homa fire pit in the middle: two stepped sandstone courses, a recess with ash and a low fire, ladles and a pot of ghee beside it
  { const p = Rr(0, 0, 0, 0), d0 = 0;
    B0.add(S, boxR(Rr(d0 - 0.7, d0 + 0.7, -0.7, 0.7), fy, fy + 0.14)); B0.add(C, boxR(Rr(d0 - 0.52, d0 + 0.52, -0.52, 0.52), fy + 0.14, fy + 0.3));
    B0.add('rubble', boxR(Rr(d0 - 0.36, d0 + 0.36, -0.36, 0.36), fy + 0.3, fy + 0.325));
    B0.add('flame', lathe([[0.001, 0], [0.12, 0], [0.07, 0.16], [0.001, 0.3]], 6, null, p[0], fy + 0.32, p[1]));
    K.rect(Rr(d0 - 0.7, d0 + 0.7, -0.7, 0.7), fy, fy + 0.34);
    const g = Rr(1.15, 1.15, 0.45, 0.45); B0.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.13, 0.05], [0.14, 0.12], [0.1, 0.13], [0.001, 0.1]], 10, null, g[0], fy + 0.012, g[1]));
    const l = Rr(0.95, 0.95, -0.85, -0.85); B0.add('bronze', lathe([[0.001, 0], [0.05, 0.005], [0.02, 0.2], [0.03, 0.24], [0.001, 0.24]], 6, null, l[0], fy + 0.012, l[1]));
    if (ctx.lights) ctx.lights.push({ at: [p[0], fy + 0.7, p[1]], color: '#ff9a4a', intensity: 3.2, distance: 8 }); }
  // two lamp stands at the door-end corners of the chest wall: a wooden pole, a dish of oil, a flame
  for (const d of [-4.6, 4.6]) {
    const p = Rr(d, d, uo - 0.55, uo - 0.55);
    B0.add('timber', lathe([[0.001, 0], [0.16, 0], [0.1, 0.08], [0.05, 0.2], [0.045, 1.0], [0.1, 1.04], [0.001, 1.04]], 6, null, p[0], fy, p[1]));
    B0.add('bronze', lathe([[0.001, 1.04], [0.1, 1.04], [0.13, 1.1], [0.001, 1.1]], 8, null, p[0], fy, p[1]));
    B0.add('flame', lathe([[0.001, 1.1], [0.016, 1.16], [0.001, 1.24]], 4, null, p[0], fy, p[1]));
    K.circle(p[0], p[1], 0.17, fy, fy + 1.1);
    if (ctx.lights) ctx.lights.push({ at: [p[0], fy + 1.35, p[1]], color: '#ffb25a', intensity: 2.6, distance: 7 });
  }
}
akLibrary.lastHits = null;
Object.assign(STYLES.khmer.elements, { ak_library: akLibrary });
export { akLibrary };
