// The Great Stupa's gateways (torana), rebuilt for the close look. docs/buildings/sanchi-great-stupa.md §4, §8 and
// docs/settlements/sanchi.md §18: two square pillars, chamfered, on a plinth, carved in framed panels on all four faces,
// each capped by a lotus cushion, an abacus and four beasts back to back; three architraves of moulded section that
// rise toward their ends, their faces recessed into a frieze of relief scenes and their ends rolled into spiral
// volutes (a ribbon standing proud of a deep core); riders in the round between them; the spoked wheel on its pillar
// and a triratna over each post; the yakshis leaning from the pillars under the lowest beam, each with her tree.
// Everything goes into two materials (sandstone_dressed for the structure, sandstone_rail for the carving).

import { lathe, rod, fromTriangles, orientOutward, place } from '../../core/geom.js';
import { hexa, obox } from '../../styles/chinese/index.js';

const STONE = 'sandstone_dressed', RAIL = 'sandstone_rail';

let jitter = 12345;
function vary(g) {
  const P = g.attributes.position.array;
  for (let i = 0; i < P.length; i++) { jitter = (jitter * 1103515245 + 12345) & 0x7fffffff; P[i] += (jitter / 0x7fffffff - 0.5) * 0.003; }
  g.attributes.position.needsUpdate = true;
  return g;
}
/** A frame: a = along the gateway, d = out of it, y up. */
function frame(at, dir) {
  const u = [-dir[1], dir[0]];
  return { u, dir, at, p: (a, d, y) => [at[0] + u[0] * a + dir[0] * d, y, at[1] + u[1] * a + dir[1] * d] };
}
/** A triangle whose normal points away from `ref`. */
function tri(out, a, b, c, ref) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - ref[0], my = (a[1] + b[1] + c[1]) / 3 - ref[1], mz = (a[2] + b[2] + c[2]) / 3 - ref[2];
  if (nx * mx + ny * my + nz * mz < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
const centroid = (pts) => { const c = [0, 0, 0]; for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; } return c.map((v) => v / pts.length); };
/** A solid swept through rings of equal point counts (star-shaped about their centres); closed = the last ring joins the first. */
function loft(out, rings, caps = true, closed = false) {
  const n = rings[0].length, cs = rings.map(centroid);
  for (let i = 0; i + 1 < rings.length; i++) {
    const ref = [(cs[i][0] + cs[i + 1][0]) / 2, (cs[i][1] + cs[i + 1][1]) / 2, (cs[i][2] + cs[i + 1][2]) / 2];
    for (let j = 0; j < n; j++) {
      const a = rings[i][j], b = rings[i][(j + 1) % n], c = rings[i + 1][(j + 1) % n], d = rings[i + 1][j];
      const r = [0, 0, 0].map((_, k) => (a[k] + b[k] + c[k] + d[k]) / 4);
      // the outward side of this quad: away from the centre line of the two rings (nearest point of it)
      const m = ref; void r;
      tri(out, a, b, c, m); tri(out, a, c, d, m);
    }
  }
  if (caps && !closed) {
    const last = rings.length - 1;
    for (let j = 1; j + 1 < n; j++) { tri(out, rings[0][0], rings[0][j], rings[0][j + 1], cs[last]); tri(out, rings[last][0], rings[last][j], rings[last][j + 1], cs[0]); }
  }
}
/** A convex outline [[a, y]] extruded from depth d0 to d1 in frame f. */
function slab(out, f, ol, d0, d1) {
  const T = [], m = ol.length;
  for (let i = 1; i + 1 < m; i++) { T.push(...f.p(ol[0][0], d0, ol[0][1]), ...f.p(ol[i][0], d0, ol[i][1]), ...f.p(ol[i + 1][0], d0, ol[i + 1][1])); T.push(...f.p(ol[0][0], d1, ol[0][1]), ...f.p(ol[i][0], d1, ol[i][1]), ...f.p(ol[i + 1][0], d1, ol[i + 1][1])); }
  for (let i = 0; i < m; i++) { const a = ol[i], b = ol[(i + 1) % m]; T.push(...f.p(a[0], d0, a[1]), ...f.p(b[0], d0, b[1]), ...f.p(b[0], d1, b[1]), ...f.p(a[0], d0, a[1]), ...f.p(b[0], d1, b[1]), ...f.p(a[0], d1, a[1])); }
  out.push(...orientOutward(T));
}
const RING = (cu, cv, rx, ry, m = 8, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: m }, (_, i) => { const a = a0 + (a1 - a0) * i / (a1 - a0 < 6 ? m - 1 : m); return [cu + Math.cos(a) * rx, cv + Math.sin(a) * ry]; });
const QUAD = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

// ---- the figures, built facing +x with the feet at the origin (about life size at scale 1) ----
const ell = (rx, ry, x, y, z, n = 10, mod = null) => lathe([[0.001, -ry], [rx * 0.6, -ry * 0.8], [rx * 0.92, -ry * 0.4], [rx, 0], [rx * 0.92, ry * 0.4], [rx * 0.6, ry * 0.8], [0.001, ry]], n, mod, x, y + ry, z);
function lionFig() {
  const g = [];
  g.push(ell(0.24, 0.25, -0.1, 0, 0, 8));
  g.push(lathe([[0.001, 0], [0.2, 0.03], [0.25, 0.25], [0.24, 0.5], [0.001, 0.6]], 10, null, 0.07, 0.04, 0));
  g.push(lathe([[0.001, 0], [0.22, 0.03], [0.29, 0.2], [0.3, 0.38], [0.24, 0.5], [0.12, 0.58], [0.001, 0.6]], 18, (th, i) => (i >= 2 && i <= 4 ? 1 + 0.12 * Math.abs(Math.cos(th * 9)) : 1), 0.1, 0.42, 0));
  for (const z of [-0.1, 0.1]) { g.push(rod([0.3, 0.02, z], [0.22, 0.62, z], 0.06, 6)); g.push(rod([0.04, 0.02, z * 1.1], [-0.12, 0.3, z * 1.1], 0.07, 6)); }
  g.push(lathe([[0.001, 0], [0.13, 0.03], [0.15, 0.13], [0.12, 0.24], [0.001, 0.27]], 10, null, 0.3, 0.84, 0));
  g.push(lathe([[0.001, 0], [0.08, 0.02], [0.09, 0.08], [0.001, 0.12]], 8, null, 0.43, 0.88, 0));
  for (const z of [-0.09, 0.09]) { g.push(lathe([[0.001, 0], [0.04, 0.03], [0.001, 0.07]], 5, null, 0.27, 1.08, z)); g.push(ell(0.025, 0.025, 0.42, 0.98, z * 0.8, 5)); }
  g.push(rod([-0.3, 0.3, 0], [-0.52, 0.08, 0], 0.025, 5));
  return g;
}
function elephantFig() {
  const g = [];
  const body = lathe([[0.001, -0.45], [0.22, -0.38], [0.3, -0.15], [0.31, 0.1], [0.27, 0.35], [0.001, 0.45]], 12, null, 0, 0, 0);
  body.rotateZ(-Math.PI / 2).translate(0, 0.66, 0); g.push(body);
  for (const [x, z] of [[0.24, 0.15], [0.24, -0.15], [-0.26, 0.15], [-0.26, -0.15]]) { g.push(lathe([[0.1, 0], [0.09, 0.62], [0.001, 0.62]], 8, null, x, 0, z)); g.push(lathe([[0.12, 0], [0.12, 0.05], [0.09, 0.08], [0.001, 0.08]], 8, null, x, 0, z)); }
  g.push(lathe([[0.001, 0], [0.18, 0.05], [0.2, 0.2], [0.15, 0.36], [0.001, 0.4]], 10, null, 0.46, 0.62, 0));
  g.push(rod([0.6, 0.82, 0], [0.68, 0.52, 0], 0.065, 6)); g.push(rod([0.68, 0.52, 0], [0.66, 0.22, 0], 0.05, 6)); g.push(rod([0.66, 0.22, 0], [0.74, 0.1, 0], 0.04, 6));
  for (const sd of [-1, 1]) {
    g.push(lathe([[0.001, 0], [0.16, 0.03], [0.2, 0.18], [0.14, 0.34], [0.001, 0.38]], 10, null, 0.4, 0.64, sd * 0.2).rotateX(0)); // the ear, a plate hanging by the head
    g.push(rod([0.58, 0.7, sd * 0.08], [0.72, 0.62, sd * 0.1], 0.025, 5));
    g.push(ell(0.022, 0.022, 0.62, 0.86, sd * 0.1, 5));
  }
  g.push(rod([-0.44, 0.78, 0], [-0.5, 0.3, 0], 0.025, 5));
  return g;
}
function dwarfFig() {
  const g = [];
  g.push(lathe([[0.001, 0], [0.26, 0.02], [0.27, 0.12], [0.2, 0.18], [0.001, 0.18]], 10, null, 0.02, 0, 0));
  g.push(lathe([[0.16, 0], [0.28, 0.12], [0.28, 0.3], [0.2, 0.44], [0.12, 0.5], [0.001, 0.5]], 12, null, 0.03, 0.12, 0));
  g.push(lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.14], [0.08, 0.22], [0.001, 0.24]], 10, null, 0.06, 0.6, 0));
  g.push(lathe([[0.001, 0], [0.07, 0.01], [0.001, 0.07]], 8, null, 0.06, 0.82, 0));
  for (const z of [-1, 1]) { g.push(rod([0.02, 0.52, z * 0.17], [0.04, 0.72, z * 0.24], 0.05, 6)); g.push(rod([0.04, 0.72, z * 0.24], [0.0, 0.9, z * 0.13], 0.045, 6)); g.push(rod([0.1, 0.1, z * 0.22], [0.22, 0.02, z * 0.3], 0.05, 6)); }
  return g;
}
/** A yakshi in the triple bend (tribhanga), a hip thrown out, one arm up to her tree's branch, jewelled: 2.1 m to the hand. */
function yakshiFig() {
  const g = [];
  g.push(rod([0.02, 0, 0.08], [0.06, 0.48, 0.07], 0.06, 6)); g.push(rod([0.06, 0.48, 0.07], [0.05, 0.92, 0.07], 0.085, 6));
  g.push(rod([0.16, 0.04, -0.04], [0.1, 0.48, -0.06], 0.055, 6)); g.push(rod([0.1, 0.48, -0.06], [0.04, 0.92, -0.07], 0.085, 6));
  for (const z of [0.07, -0.05]) { g.push(lathe([[0.075, 0], [0.075, 0.025], [0.065, 0.03]], 8, null, 0.04, 0.06, z)); g.push(lathe([[0.1, 0], [0.1, 0.02]], 8, null, 0.04, 0.5, z)); }
  g.push(lathe([[0.12, 0], [0.2, 0.08], [0.2, 0.2], [0.13, 0.3], [0.001, 0.3]], 12, null, 0.06, 0.84, 0));
  g.push(lathe([[0.205, 0], [0.225, 0.03], [0.225, 0.055], [0.205, 0.08]], 14, (th) => 1 + 0.05 * Math.cos(th * 12), 0.06, 0.98, 0));   // the girdle
  g.push(lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.14], [0.2, 0.27], [0.26, 0.33], [0.26, 0.4], [0.2, 0.5]], 14, null, 0.05, 0.3, 0)); // skirt falling to the feet
  g.push(lathe([[0.11, 0], [0.12, 0.12], [0.16, 0.26], [0.13, 0.38], [0.06, 0.44], [0.001, 0.44]], 12, null, 0.02, 1.12, 0));
  for (const z of [-0.075, 0.075]) g.push(ell(0.07, 0.07, 0.11, 1.3, z, 8));
  g.push(lathe([[0.1, 0], [0.12, 0.02], [0.1, 0.04]], 12, null, 0.05, 1.34, 0));                                                              // a necklace
  g.push(lathe([[0.001, 0], [0.09, 0.04], [0.1, 0.14], [0.06, 0.22], [0.001, 0.24]], 12, null, 0.0, 1.58, 0));
  g.push(ell(0.07, 0.06, -0.06, 1.72, 0, 8));                                                                                                  // the hair knot
  g.push(lathe([[0.001, 0], [0.1, 0.01], [0.1, 0.05], [0.001, 0.07]], 10, null, 0.01, 1.84, 0));
  g.push(rod([0.0, 1.5, 0.14], [0.14, 1.78, 0.18], 0.04, 5)); g.push(rod([0.14, 1.78, 0.18], [0.28, 2.06, 0.1], 0.035, 5));
  g.push(lathe([[0.05, 0], [0.05, 0.03]], 8, null, 0.2, 1.9, 0.14));                                                                         // bangles
  g.push(rod([0.0, 1.5, -0.14], [-0.1, 1.28, -0.14], 0.04, 5)); g.push(rod([-0.1, 1.28, -0.14], [-0.2, 1.3, -0.02], 0.035, 5));
  return g;
}
function riderParts(x, y) {
  const g = [];
  g.push(lathe([[0.001, 0], [0.11, 0.02], [0.13, 0.12], [0.1, 0.3], [0.07, 0.38], [0.001, 0.4]], 8, null, x, y, 0));
  g.push(ell(0.065, 0.07, x + 0.01, y + 0.44, 0, 8));
  g.push(lathe([[0.001, 0], [0.075, 0.02], [0.07, 0.07], [0.001, 0.1]], 8, null, x + 0.01, y + 0.5, 0));
  for (const z of [-1, 1]) {
    g.push(rod([x, y + 0.03, z * 0.1], [x + 0.14, y - 0.06, z * 0.17], 0.05, 5)); g.push(rod([x + 0.14, y - 0.06, z * 0.17], [x + 0.1, y - 0.32, z * 0.2], 0.04, 5));
    g.push(rod([x + 0.02, y + 0.34, z * 0.12], [x + 0.17, y + 0.22, z * 0.07], 0.035, 5));
  }
  return g;
}
const elephantRiderFig = () => [...elephantFig(), ...riderParts(0.2, 0.93)];
function horseRiderFig() {
  const g = [], body = lathe([[0.001, -0.42], [0.12, -0.36], [0.17, -0.15], [0.17, 0.1], [0.15, 0.3], [0.001, 0.42]], 8, null, 0, 0, 0);
  body.rotateZ(-Math.PI / 2).translate(0, 0.62, 0); g.push(body);
  for (const [x, z] of [[0.28, 0.08], [0.28, -0.08], [-0.28, 0.08], [-0.28, -0.08]]) g.push(rod([x, 0.58, z], [x + (x > 0 ? 0.02 : -0.02), 0, z], 0.035, 5));
  g.push(rod([0.3, 0.68, 0], [0.5, 0.98, 0], 0.075, 6)); g.push(rod([0.5, 0.98, 0], [0.68, 0.88, 0], 0.05, 6));
  g.push(rod([-0.4, 0.74, 0], [-0.5, 0.3, 0], 0.03, 5));
  return [...g, ...riderParts(0.02, 0.77)];
}
/** Place a figure's parts: feet at (x, y, z), +x turned to (dx, dz), leaning outward by `lean`, scale s. */
function fig(bag, parts, x, y, z, dx, dz, s = 1, lean = 0) {
  for (const g of parts) { if (lean) g.rotateZ(-lean); bag.add(RAIL, place(g, x, y, z, Math.atan2(-dz, dx), s)); }
}

// ---- the reliefs: convex outlines in a band 1 high (v 0…1) centred on u = 0, d = ±1 the way a beast faces ----
const MOTIF = {
  figure: () => [QUAD(-0.07, 0, -0.01, 0.4), QUAD(0.01, 0, 0.07, 0.4), [[-0.07, 0.4], [0.07, 0.4], [0.06, 0.66], [-0.06, 0.66]], RING(0, 0.73, 0.055, 0.065, 8), RING(0, 0.81, 0.085, 0.045, 8)],
  bearer: () => [...MOTIF.figure(), [[0.06, 0.62], [0.2, 0.74], [0.18, 0.78], [0.05, 0.66]], [[-0.06, 0.62], [-0.05, 0.66], [-0.18, 0.78], [-0.2, 0.74]], RING(0, 0.78, 0.2, 0.03, 8, Math.PI * 1.05, Math.PI * 1.95)],
  stupa: () => [QUAD(-0.28, 0, 0.28, 0.1), QUAD(-0.24, 0.1, 0.24, 0.2), [[0.22, 0.2], ...RING(0, 0.2, 0.22, 0.36, 9, 0.12, Math.PI - 0.12).slice(1, -1), [-0.22, 0.2]], QUAD(-0.07, 0.54, 0.07, 0.62), QUAD(-0.012, 0.62, 0.012, 0.8), QUAD(-0.15, 0.78, 0.15, 0.83), QUAD(-0.1, 0.83, 0.1, 0.87)],
  tree: () => [QUAD(-0.22, 0, 0.22, 0.12), QUAD(-0.17, 0.12, 0.17, 0.2), QUAD(-0.03, 0.2, 0.03, 0.5), RING(0, 0.7, 0.24, 0.2, 10), RING(-0.18, 0.58, 0.1, 0.09, 7), RING(0.18, 0.58, 0.1, 0.09, 7)],
  wheel: () => [QUAD(-0.1, 0, 0.1, 0.06), QUAD(-0.035, 0.06, 0.035, 0.5), QUAD(-0.08, 0.5, 0.08, 0.56), RING(0, 0.76, 0.2, 0.2, 14), RING(0, 0.76, 0.06, 0.06, 8)],
  elephant: (d = 1) => [RING(0, 0.42, 0.3, 0.2, 10), RING(d * 0.3, 0.5, 0.13, 0.15, 8), [[d * 0.38, 0.5], [d * 0.44, 0.48], [d * 0.42, 0.06], [d * 0.37, 0.06]], ...[-0.2, -0.08, 0.08, 0.2].map((x) => QUAD(x - 0.045, 0, x + 0.045, 0.32)), [[-d * 0.12, 0.6], [d * 0.06, 0.6], [d * 0.04, 0.8], [-d * 0.1, 0.8]], RING(-d * 0.03, 0.86, 0.05, 0.06, 7), RING(d * 0.12, 0.52, 0.1, 0.14, 7)],
  horse: (d = 1) => [RING(0, 0.44, 0.22, 0.12, 9), [[d * 0.15, 0.46], [d * 0.24, 0.48], [d * 0.32, 0.7], [d * 0.24, 0.72]], RING(d * 0.32, 0.68, 0.07, 0.045, 7), ...[-0.16, -0.08, 0.08, 0.15].map((x) => QUAD(x - 0.025, 0, x + 0.025, 0.36)), [[-d * 0.06, 0.55], [d * 0.06, 0.55], [d * 0.05, 0.78], [-d * 0.05, 0.78]], RING(0, 0.84, 0.05, 0.06, 7)],
};
/** The programme of an architrave's face (b 0 lowest … 2 top), after the South Gateway [docs/settlements/sanchi.md §11]. */
function scenes(b, front) {
  if (b === 2) return ['tree', 'figure', 'stupa', 'figure', 'tree', 'figure', 'stupa', 'figure', 'tree', 'figure', 'stupa', 'figure', 'tree'];
  if (b === 1) return front ? ['elephant', 'horse', 'figure', 'figure', 'bearer', 'stupa', 'bearer', 'figure', 'figure', 'horse', 'elephant'] : ['tree', 'elephant', 'elephant', 'elephant', 'tree', 'elephant', 'elephant', 'elephant', 'tree'];
  return front ? Array(11).fill('bearer') : ['horse', 'figure', 'elephant', 'figure', 'figure', 'horse', 'figure', 'elephant', 'figure', 'horse'];
}
const mapOl = (ols, a0, v0, sc, flip = 1) => ols.map((o) => o.map(([a, v]) => [a0 + a * sc * flip, v0 + v * sc]));
/** A scene on a face at depth d (the face's plane), standing out by t, layers lifted so that none is coplanar. */
function carve(out, f, motifs, d, sgn, t) {
  motifs.forEach((ol, k) => { const tk = t * (1 + 0.07 * (k % 5)); slab(out, f, ol, d, d + sgn * tk); });
}

/**
 * A gateway at { at [x, z], dir (outward), y, s, kind: 'elephant' | 'lion' | 'dwarf' } into `bag` (merged per material), its
 * pillars' colliders into `col`.
 */
export function torana(bag0, col, at, dir, y, s = 1, kind = 'elephant') {
  // every piece is moved by a millimetre or so, so that no two are the same shape: they merge into the material's one mesh instead of being
  // found as repeated shapes and instanced (each instanced shape is a draw of its own)
  const bag = { add(mat, g) { vary(g); bag0.add(mat, g); } };
  const f = frame(at, dir), { u } = f, W = 2.1 * s, P = 0.35 * s, H = 6.4 * s;
  const S = [], R = [], at2 = (k, d = 0) => [at[0] + u[0] * k + dir[0] * d, at[1] + u[1] * k + dir[1] * d];
  const sq = (a, d, hw, hd, ch, yy) => [[a - hw + ch, d - hd, yy], [a + hw - ch, d - hd, yy], [a + hw, d - hd + ch, yy], [a + hw, d + hd - ch, yy], [a + hw - ch, d + hd, yy], [a - hw + ch, d + hd, yy], [a - hw, d + hd - ch, yy], [a - hw, d - hd + ch, yy]].map(([a2, d2, y2]) => f.p(a2, d2, y2));
  // ---- the pillars ----
  for (const k of [-1, 1]) {
    const a = k * W, ch = 0.06 * s;
    // plinth of two courses, the chamfered shaft, a neck
    loft(S, [sq(a, 0, P * 1.28, P * 1.28, 0.04 * s, y - 0.02), sq(a, 0, P * 1.28, P * 1.28, 0.04 * s, y + 0.2 * s)]);
    loft(S, [sq(a, 0, P * 1.14, P * 1.14, 0.04 * s, y + 0.2 * s), sq(a, 0, P * 1.14, P * 1.14, 0.04 * s, y + 0.42 * s)]);
    loft(S, [sq(a, 0, P, P, ch, y + 0.42 * s), sq(a, 0, P, P, ch, y + H - 0.5 * s)]);
    // the capital: a lotus cushion, a square abacus with a moulded edge, the beasts, a second abacus carrying the architrave
    bag.add(STONE, lathe([[P * 0.95, 0], [P * 1.2, 0.1 * s], [P * 1.45, 0.28 * s], [P * 1.5, 0.45 * s], [P * 1.0, 0.5 * s], [0.001, 0.5 * s]], 24, (th, i) => (i >= 1 && i <= 3 ? 1 + 0.07 * Math.abs(Math.cos(th * 6)) : 1), at2(a)[0], y + H - 0.5 * s, at2(a)[1]));
    loft(S, [sq(a, 0, P * 1.55, P * 1.55, 0.05 * s, y + H), sq(a, 0, P * 1.55, P * 1.55, 0.05 * s, y + H + 0.1 * s)]);
    loft(S, [sq(a, 0, P * 1.9, P * 1.9, 0.08 * s, y + H + 0.1 * s), sq(a, 0, P * 1.9, P * 1.9, 0.08 * s, y + H + 0.2 * s)]);
    const c = at2(a);
    for (const ax of [u, [-u[0], -u[1]], dir, [-dir[0], -dir[1]]]) {
      if (kind === 'lion') fig(bag, lionFig(), c[0] + ax[0] * 0.2 * s, y + H + 0.2 * s, c[1] + ax[1] * 0.2 * s, ax[0], ax[1], 0.72 * s);
      else if (kind === 'dwarf') fig(bag, dwarfFig(), c[0] + ax[0] * 0.3 * s, y + H + 0.2 * s, c[1] + ax[1] * 0.3 * s, ax[0], ax[1], 0.94 * s);
      else fig(bag, elephantFig(), c[0] + ax[0] * 0.28 * s, y + H + 0.2 * s, c[1] + ax[1] * 0.28 * s, ax[0], ax[1], 0.9 * s);
    }
    loft(S, [sq(a, 0, P * 1.7, P * 1.7, 0.06 * s, y + H + 1.05 * s), sq(a, 0, P * 1.7, P * 1.7, 0.06 * s, y + H + 1.2 * s)]);
    if (col) col.rect([c[0] - P, c[1] - P, c[0] + P, c[1] + P], y, y + H);
    // the panels on all four faces, each a frame of four fillets round a recessed field with its scene (the wheel on its pillar,
    // a stupa, the Enlightenment tree, each between two worshippers); the inner and outer faces carry two
    for (const face of [0, 1, 2, 3]) {
      const sg = face % 2 ? -1 : 1, onDir = face < 2, panels = onDir ? [[0.8, 2.4], [2.6, 4.2], [4.4, 6.0]] : [[1.2, 3.4], [3.8, 5.8]];
      // front and back faces lie in the gateway's frame; the inner and outer faces in one turned a quarter, along the passage
      const gf = onDir ? f : { u: dir, dir: [u[0] * sg, u[1] * sg], p: (a2, d2, y2) => [c[0] + dir[0] * a2 + u[0] * sg * d2, y2, c[1] + dir[1] * a2 + u[1] * sg * d2] };
      const ca = onDir ? a : 0, dep = onDir ? sg * P : P, out = onDir ? sg : 1, hw = P * 0.8;
      panels.forEach(([p0, p1], pi) => {
        const y0 = y + p0 * s, y1 = y + p1 * s, sc = (y1 - y0) - 0.3 * s, e = 0.07 * s;
        for (const [ua, ub, va, vb] of [[-hw, hw, y0, y0 + e], [-hw, hw, y1 - e, y1], [-hw, -hw + e, y0, y1], [hw - e, hw, y0, y1]]) slab(R, gf, QUAD(ca + ua, va, ca + ub, vb), dep - out * 0.001 * s, dep + out * 0.03 * s);
        const main = onDir ? ['tree', 'stupa', 'wheel'][pi] : (pi ? 'tree' : 'stupa');
        carve(R, gf, mapOl(MOTIF[main](), ca, y0 + 0.15 * s, sc * 0.62), dep + out * 0.005 * s, out, 0.035 * s);
        if (onDir) for (const g of [-1, 1]) carve(R, gf, mapOl(MOTIF.figure(), ca + g * P * 0.62, y0 + 0.15 * s, sc * 0.38), dep + out * 0.005 * s, out, 0.035 * s);
      });
    }
  }
  // ---- the architraves ----
  const HB = 0.85 * s, D = 0.32 * s, half = 4.3 * s, rise = 0.3 * s, gapY = 1.6 * s, y1st = y + H + 1.2 * s;
  const yAt = (b, t) => y1st + b * gapY + rise * t * t;
  const prof = [[-D + 0.06 * s, 0], [D - 0.06 * s, 0], [D, 0.06 * s], [D, 0.15 * s], [D - 0.035 * s, 0.17 * s], [D - 0.035 * s, HB - 0.2 * s], [D, HB - 0.18 * s], [D, HB - 0.1 * s], [D - 0.05 * s, HB - 0.02 * s], [D - 0.12 * s, HB],
    [-D + 0.12 * s, HB], [-D + 0.05 * s, HB - 0.02 * s], [-D, HB - 0.1 * s], [-D, HB - 0.18 * s], [-D + 0.035 * s, HB - 0.2 * s], [-D + 0.035 * s, 0.17 * s], [-D, 0.15 * s], [-D, 0.06 * s]];
  for (let b = 0; b < 3; b++) {
    const rings = [], N = 28;
    for (let i = 0; i <= N; i++) { const t = -1 + 2 * i / N; rings.push(prof.map(([d, h]) => f.p(t * half, d, yAt(b, t) + h))); }
    loft(S, rings);
    // the frieze of scenes on both faces, in the recessed field (h 0.17 … HB-0.2), clear of the pillars' crossings
    for (const sg of [-1, 1]) {
      const base = scenes(b, sg > 0), sc = 0.46 * s, nI = Math.floor(1.72 * half / (0.34 * s)), step = 1.72 / nI;
      const prog = Array.from({ length: nI }, (_, i) => base[Math.floor(i * base.length / nI)]);
      prog.forEach((m, i) => {
        const t = -0.86 + (i + 0.5) * step, uu = t * half;
        if (Math.abs(Math.abs(uu) - W) < 0.42 * s) return;
        carve(R, f, mapOl(MOTIF[m](uu < 0 ? sg : -sg), uu, yAt(b, t) + 0.2 * s, sc, 1), sg * (D - 0.035 * s), sg, 0.05 * s);
      });
    }
    // the volutes: the beam's end rolled up — a core, and the spiral ribbon standing proud of it on both faces
    for (const k of [-1, 1]) {
      const cu = k * (half + 0.1 * s), cy = yAt(b, k) + HB * 0.62, r0 = 0.5 * s, turns = 2.4, segs = 26, wr = 0.085 * s, dep = D + 0.03 * s;
      const rr = [];
      for (let j = 0; j <= segs; j++) {
        const th = j / segs * turns * 2 * Math.PI, r = r0 - (r0 - 0.07 * s) * j / segs, a = k * th;
        const ca = Math.cos(a), sa = Math.sin(a);
        rr.push([[cu + k * ca * (r - wr / 2), -dep, cy - sa * (r - wr / 2) * k], [cu + k * ca * (r + wr / 2), -dep, cy - sa * (r + wr / 2) * k], [cu + k * ca * (r + wr / 2), dep, cy - sa * (r + wr / 2) * k], [cu + k * ca * (r - wr / 2), dep, cy - sa * (r - wr / 2) * k]].map(([a2, d2, y2]) => f.p(a2, d2, y2)));
      }
      loft(R, rr);
      const core = [];
      for (const d2 of [-(D - 0.075 * s), D - 0.075 * s]) core.push(Array.from({ length: 20 }, (_, j) => { const th = j / 20 * Math.PI * 2; return f.p(cu + Math.cos(th) * r0 * 0.99, d2, cy + Math.sin(th) * r0 * 0.99); }));
      loft(S, core);
    }
    // uprights between this architrave and the next (square, chamfered, a capital), and the riders in the round between them
    if (b < 2) {
      for (const aa of [-W, -0.91 * s, 0.91 * s, W]) {
        const t = aa / half, y0 = yAt(b, t) + HB * 0.5, y1 = yAt(b + 1, t) + 0.2 * s;
        loft(S, [sq(aa, 0, 0.2 * s, 0.2 * s, 0.04 * s, y0), sq(aa, 0, 0.2 * s, 0.2 * s, 0.04 * s, y1)]);
      }
      for (const dd of [-1.5 * W / 2.1, 0, 1.5 * W / 2.1, -(W + 1.4 * s), W + 1.4 * s]) {
        const t = dd / half, base = yAt(b, t) + HB - 0.02 * s, outer = Math.abs(dd) > W + 0.5 * s;
        for (const sg of [-1, 1]) {
          const p = at2(dd, sg * 0.1 * s);
          if (outer) fig(bag, b === 0 ? elephantRiderFig() : lionFig(), p[0], base, p[1], dir[0] * sg, dir[1] * sg, (b === 0 ? 0.5 : 0.56) * s);
          else fig(bag, b === 0 ? elephantRiderFig() : horseRiderFig(), p[0], base, p[1], dir[0] * sg, dir[1] * sg, 0.5 * s);
        }
      }
    }
  }
  // ---- the yakshis and their trees under the lowest architrave's ends: each stands on a corbel from the pillar's shaft, facing out,
  // one arm up to a branch of the mango tree that rises behind her to a crown under the beam's end [stated: dossier §8; forms inferred]
  for (const k of [-1, 1]) {
    const cy = y + H - 1.9 * s, a0 = k * (W + P), a1 = k * (W + P + 1.2 * s), ax = k * (W + P + 0.62 * s);
    const lo = Math.min(a0 - k * 0.1 * s, a1), hi = Math.max(a0 - k * 0.1 * s, a1);
    slab(S, f, [[lo, cy - 0.3 * s], [hi, cy - 0.1 * s], [hi, cy + 0.08 * s], [lo, cy + 0.08 * s]], -0.28 * s, 0.28 * s);
    const fp = f.p(ax, 0, cy + 0.08 * s);
    fig(bag, yakshiFig(), fp[0], fp[1], fp[2], dir[0], dir[1], 1.0 * s, 0.06);
    const tb = f.p(k * (W + P + 1.05 * s), -0.14 * s, cy + 0.08 * s), tc = f.p(ax + k * 0.05 * s, 0.1 * s, y + H + 0.85 * s);
    bag.add(RAIL, rod(tb, tc, 0.09 * s, 7));
    const br = f.p(ax + k * 0.02 * s, 0.38 * s, cy + 2.05 * s);
    bag.add(RAIL, rod(br, tc, 0.04 * s, 5));
    // the crown: leaf masses with hanging fruit, filling the angle under the beam's end
    for (const [da, dd, dy, rs] of [[0.62, 0.1, 1.05, 1.0], [0.1, 0.1, 0.85, 0.7], [1.2, 0.1, 0.85, 0.7], [0.65, 0.4, 0.75, 0.55], [0.65, -0.25, 0.8, 0.55]]) {
      const cr = f.p(k * (W + P + da * s), dd * s, y + H + dy * s);
      bag.add(RAIL, lathe([[0.001, -0.3 * s * rs], [0.45 * s * rs, -0.18 * s * rs], [0.5 * s * rs, 0.05 * s * rs], [0.3 * s * rs, 0.25 * s * rs], [0.001, 0.3 * s * rs]], 10, (th) => 1 + 0.14 * Math.cos(th * 5 + da), cr[0], cr[1], cr[2]));
    }
  }
  // ---- the emblems: the spoked wheel on its pillar at the middle, a triratna over each post ----
  const topY = yAt(2, 0) + HB, wy = topY + 0.95 * s, wr0 = 0.75 * s;
  loft(S, [sq(0, 0, 0.3 * s, 0.2 * s, 0.05 * s, topY), sq(0, 0, 0.3 * s, 0.2 * s, 0.05 * s, topY + 0.15 * s)]);
  loft(S, [sq(0, 0, 0.16 * s, 0.1 * s, 0.03 * s, topY + 0.15 * s), sq(0, 0, 0.16 * s, 0.1 * s, 0.03 * s, wy - wr0 + 0.02 * s)]);
  const rim = [];
  for (let j = 0; j <= 24; j++) { const th = j / 24 * Math.PI * 2, co = Math.cos(th), si = Math.sin(th); rim.push([[wr0, -0.1 * s], [wr0, 0.1 * s], [wr0 - 0.13 * s, 0.1 * s], [wr0 - 0.13 * s, -0.1 * s]].map(([r, d2]) => f.p(co * r, d2, wy + si * r))); }
  loft(R, rim);
  for (let i = 0; i < 16; i++) { const th = i * Math.PI / 8; bag.add(STONE, rod(f.p(Math.cos(th) * 0.12 * s, 0, wy + Math.sin(th) * 0.12 * s), f.p(Math.cos(th) * (wr0 - 0.1 * s), 0, wy + Math.sin(th) * (wr0 - 0.1 * s)), 0.032 * s, 5)); }
  bag.add(STONE, lathe([[0.001, -0.14 * s], [0.14 * s, -0.12 * s], [0.14 * s, 0.12 * s], [0.001, 0.14 * s]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(Math.atan2(dir[0], dir[1])).translate(at[0], wy, at[1]));
  for (const k of [-1, 1]) {
    const a = k * W;
    loft(S, [sq(a, 0, 0.4 * s, 0.14 * s, 0.05 * s, topY - 0.02 * s), sq(a, 0, 0.4 * s, 0.14 * s, 0.05 * s, topY + 0.14 * s)]);
    const o = [[a - 0.07 * s, topY + 0.14 * s], [a + 0.07 * s, topY + 0.14 * s], [a + 0.14 * s, topY + 0.7 * s], [a, topY + 1.35 * s], [a - 0.14 * s, topY + 0.7 * s]];
    slab(R, f, o, -0.1 * s, 0.1 * s);
    for (const g of [-1, 1]) {
      slab(R, f, RING(a + g * 0.3 * s, topY + 0.72 * s, 0.13 * s, 0.34 * s, 10), -0.1 * s, 0.1 * s);
      slab(R, f, [[a + g * 0.1 * s, topY + 0.14 * s], [a + g * 0.36 * s, topY + 0.14 * s], [a + g * 0.34 * s, topY + 0.45 * s], [a + g * 0.14 * s, topY + 0.4 * s]], -0.1 * s, 0.1 * s);
    }
  }
  bag.add(STONE, fromTriangles(S));
  bag.add(RAIL, fromTriangles(R));
}
void hexa; void obox;
