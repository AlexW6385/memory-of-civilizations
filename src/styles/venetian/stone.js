// The carved and cast figures of the Piazza and the Piazzetta, seen from two metres (docs/settlements/venice.md §4j):
// real modelled volumes — rounded limbs, torsos, heads with brow, nose, lips and hair, drapery that follows the
// body, animals with muscle and joints — in place of the stacked silhouettes of the older `human()` and `horse()`.
// The people are made by the Parthenon's body kit (src/buildings/parthenon/bodies.js, read-only), the horses and
// the lion from its tube and blob. A figure is built at height 1 facing +z (the horse and the lion facing +x, the
// near side +z) and set by a Matrix4; every piece of an element goes into one Local, so that one material is one
// geometry (never instanced, never a swarm of small details). Levels: lod 0 in full for the visitor within a few
// tens of metres, lod 2 reduced beyond. No random numbers: whatever varies comes from a hash of a piece's own place.

import { Matrix4 } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { Local } from '../renaissance/face.js';
import { tube, blob, limb } from '../../buildings/parthenon/figures.js';
import { bodyOf, skeleton, vec as V } from '../../buildings/parthenon/bodies.js';

export const CV = 'limestone_carved', GB = 'gilt_bronze', BZ = 'bronze', MB = 'marble';
export { V, Local, tube, blob, limb, bodyOf, skeleton };

/** A repeatable number in [0, 1) from a position (the same on every build). */
export function hash(x, y, z, k = 0) {
  let h = Math.imul(Math.round(x * 997) | 0, 374761393) + Math.imul(Math.round(y * 991) | 0, 668265263) + Math.imul(Math.round(z * 983) | 0, 2147483647) + Math.imul(k | 0, 40503) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** scale s, turned yaw about y, at (x, y, z). */
export const at = (s, x, y, z, yaw = 0) => new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(s, s, s)).setPosition(x, y, z);
/** Put geometries (consumed) into Local `L` as `mat`, moved by matrix m (a Matrix4, or null). */
export function put(L, mat, geoms, m = null) { for (const g of geoms) { if (m) g.applyMatrix4(m); L.add(mat, g); } }
/** A figure of the body kit into `L`: stone → `mat`, metal → `metalMat`. opts as bodyOf; h its height. */
export function person(L, o, mat, m, metalMat = mat) {
  const f = bodyOf(o);
  put(L, mat, f.stone, m); put(L, metalMat, f.metal, m);
  return f;
}
/** Wind every triangle of a geometry back (after a mirror). */
export function flip(g) {
  for (const nm of ['position', 'normal']) { const a = g.attributes[nm].array; for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { const t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; } }
  return g;
}
/** A ring (torus) about the y axis: radius R along x and Rz along z, section radius r. */
export function ring(R, Rz, r, n = 18, m = 6) {
  const prof = Array.from({ length: m + 1 }, (_, i) => { const a = i / m * Math.PI * 2; return [R + Math.cos(a) * r, Math.sin(a) * r]; });
  const g = lathe(prof, n); if (Rz !== R) g.scale(1, 1, Rz / R); return g;
}
/** The matrix that turns +y into `axis` (a unit vector), then moves to c. */
export function along(axis, c) {
  const a = V.norm(axis), up = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const ex = V.norm(V.cross(up, a)), ez = V.cross(a, ex);
  const m = new Matrix4().set(ex[0], a[0], ez[0], c[0], ex[1], a[1], ez[1], c[1], ex[2], a[2], ez[2], c[2], 0, 0, 0, 1);
  return m;
}

// ── the gilt horses of the loggia: heavy, short in the neck, the neck arched, the mane cropped to a short brush,
// a collar with rosettes, one foreleg raised at the knee. Facing +x, the withers at about 1, near side +z.
/** o: { raise: 'n' | 'f' | null (which foreleg is lifted), lod, tilt } → list of geometries. */
export function quadrigaHorse(o = {}) {
  const lod = o.lod ?? 0, fine = lod === 0, seg = lod === 0 ? 9 : lod === 1 ? 7 : 6, T = { seg, sub: fine ? 1 : 0 }, g = [];
  const tilt = o.tilt ?? 0.3, nb = [0.44, 0.9, 0], pl = [0.8, 1.3, 0], mid = V.add(V.lerp(nb, pl, 0.5), [-0.03, 0.07, 0]);
  g.push(tube([nb, mid, pl], [[0.14, 0.25], [0.11, 0.17], [0.085, 0.115]], { ...T, side: [0, 0, 1], mod: (th) => 1 + 0.05 * Math.cos(3 * th) }));
  const hd = [pl, V.add(pl, [0.1 * Math.cos(tilt), -0.1 * Math.cos(tilt) - 0.04 * Math.sin(tilt), 0]), V.add(pl, [0.21 * Math.cos(tilt + 0.15), -0.28 * Math.cos(tilt) - 0.1 * Math.sin(tilt), 0])];
  const dir = V.norm(V.sub(hd[2], hd[0])), nrm = V.norm([-dir[1], dir[0], 0]);
  g.push(tube(hd, [[0.075, 0.09], [0.08, 0.105], [0.047, 0.058]], { ...T, side: [0, 0, 1], sub: 1 }));
  g.push(blob(V.add(V.lerp(hd[0], hd[1], 0.5), V.mul(nrm, 0.02)), 0.075, [1, 1.1, 1], fine ? 8 : 6));
  for (const z of [-1, 1]) {
    if (fine) {
      g.push(blob(V.add(V.lerp(hd[0], hd[1], 0.35), [0, 0.04, z * 0.062]), 0.019, [1, 1, 0.8], 5));              // the eye's prominence
      g.push(blob(V.add(hd[2], [-0.005, 0.016, z * 0.028]), 0.015, [1.2, 0.8, 0.7], 5));                           // the nostril
    }
    g.push(limb(V.add(pl, [-0.02, 0.06, z * 0.045]), V.add(pl, [-0.05, 0.15, z * 0.052]), 0.024, 0.007, 5));      // the ears, pricked
  }
  // the cropped mane: a short stiff brush along the crest and a forelock between the ears
  const nm = fine ? 10 : 5;
  for (let i = 0; i < nm; i++) { const t = i / (nm - 1), p = V.lerp(V.add(nb, [-0.02, 0.2, 0]), V.add(pl, [-0.03, 0.1, 0]), t); g.push(blob([p[0], p[1] + 0.01 * Math.sin(i * 2.1), 0.008 * (i % 2 ? 1 : -1)], 0.034 - 0.006 * t, [0.5, 1.25, 0.85], 5)); }
  g.push(blob(V.add(pl, [0.05, 0.05, 0]), 0.03, [0.7, 1.0, 0.8], 5));
  // the collar: a band about the neck with its rosettes and a pendant on the breast
  const cn = V.lerp(nb, pl, 0.28), ax = V.norm(V.sub(pl, nb)), cm = along(ax, [cn[0], cn[1] + 0.02, cn[2]]);
  const col = ring(0.2, 0.135, 0.022, fine ? 20 : 12, 5).applyMatrix4(cm); g.push(col);
  if (fine) for (let k = 0; k < 7; k++) {
    const a = k / 7 * Math.PI * 2, q = new Matrix4().makeTranslation(Math.cos(a) * 0.205, 0, Math.sin(a) * 0.14).premultiply(cm), r = blob([0, 0, 0], 0.03, [1, 0.5, 1], 6).applyMatrix4(new Matrix4().makeRotationZ(0).setPosition(0, 0, 0));
    g.push(r.applyMatrix4(q));
  }
  // the barrel with its chest and croup; the shoulder and the haunch as masses
  g.push(tube([[0.52, 0.8, 0], [0.18, 0.83, 0], [-0.2, 0.84, 0], [-0.5, 0.84, 0]], [[0.17, 0.28], [0.21, 0.31], [0.21, 0.31], [0.18, 0.27]], { ...T, side: [0, 0, 1], sub: 1, seg: seg + 2 }));
  for (const z of [-1, 1]) {
    g.push(blob([0.36, 0.78, z * 0.075], 0.15, [1.1, 1.3, 0.7], fine ? 7 : 6));
    g.push(blob([-0.38, 0.78, z * 0.085], 0.18, [1.15, 1.25, 0.7], fine ? 7 : 6));
  }
  g.push(tube([[-0.5, 0.88, 0], [-0.6, 0.76, 0], [-0.64, 0.55, 0], [-0.62, 0.36, 0]], [[0.03, 0.03], [0.045, 0.04], [0.05, 0.035], [0.035, 0.02]], { ...T, side: [0, 0, 1], sub: 1, mod: (th, t) => 1 + 0.15 * Math.cos(4 * th + 5 * t) }));
  const stand = { fore: [[0.36, 0.7], [0.4, 0.46], [0.38, 0.24], [0.4, 0.07], [0.42, 0.0]], hind: [[-0.38, 0.7], [-0.3, 0.46], [-0.42, 0.28], [-0.4, 0.09], [-0.38, 0.0]] };
  const lifted = [[0.36, 0.7], [0.44, 0.5], [0.62, 0.52], [0.6, 0.36], [0.6, 0.3]];
  const leg = (c, z, th) => {
    const r = [[0.088 * th, 0.095 * th], [0.06 * th, 0.06 * th], [0.046 * th, 0.052 * th], [0.031 * th, 0.031 * th], [0.036 * th, 0.036 * th]];
    g.push(tube(c.map(([x, y]) => [x, y, z]), r, { ...T, side: [0, 0, 1], sub: fine ? 1 : 0, capB: false }));
    g.push(blob([c[2][0], c[2][1], z], 0.05 * th, [1, 1.05, 1], 6));                                                // the knee or hock
    const h = c[4], sg = Math.sign(V.sub(c[4], c[3])[0] || 1);
    g.push(tube([[c[3][0], c[3][1] - 0.01, z], [h[0] + 0.02 * sg, h[1] + 0.025, z], [h[0] + 0.03 * sg, Math.max(0, h[1]), z]], [[0.037, 0.041], [0.045, 0.052], [0.047, 0.052]], { seg: 6, sub: 0, side: [0, 0, 1] }));   // the hoof
  };
  for (const z of [-0.115, 0.115]) {
    leg(o.raise && (o.raise === 'n') === (z > 0) ? lifted : stand.fore, z, 1);
    leg(stand.hind, z, 1.06);
  }
  return g;
}

// ── the winged lion of St Mark, standing, a forepaw on the open book. Facing +x, the near side +z, the soles at y = 0,
// about 2.9 m from tail to muzzle at s = 1.
/** o: { lod, book } → list of geometries. */
export function lionModel(o = {}) {
  const lod = o.lod ?? 0, fine = lod === 0, seg = fine ? 9 : lod === 1 ? 7 : 6, T = { seg, sub: fine ? 1 : 0, side: [0, 0, 1] }, g = [];
  g.push(tube([[-0.8, 1.0, 0], [-0.25, 1.05, 0], [0.3, 1.1, 0], [0.62, 1.1, 0]], [[0.3, 0.34], [0.33, 0.37], [0.36, 0.42], [0.33, 0.4]], { ...T, seg: seg + 2 }));   // the body
  for (const z of [-1, 1]) {
    g.push(blob([0.45, 1.02, z * 0.2], 0.27, [1.1, 1.25, 0.8], fine ? 8 : 6));                                       // the shoulders
    g.push(blob([-0.62, 0.95, z * 0.24], 0.31, [1.1, 1.2, 0.8], fine ? 8 : 6));                                      // the haunches
  }
  g.push(tube([[0.5, 1.12, 0], [0.8, 1.3, 0], [0.98, 1.42, 0]], [[0.3, 0.3], [0.28, 0.28], [0.24, 0.24]], T));        // the neck
  // the head: skull, brow, muzzle, nose, jaw, ears, eyes
  g.push(blob([1.05, 1.44, 0], 0.25, [1, 0.95, 0.9], fine ? 9 : 7));
  g.push(blob([1.28, 1.35, 0], 0.17, [1.15, 0.8, 0.82], fine ? 8 : 6));
  g.push(blob([1.42, 1.38, 0], 0.07, [1, 0.7, 1.1], 5));
  g.push(blob([1.22, 1.22, 0], 0.13, [1.2, 0.6, 0.8], 6));
  for (const z of [-1, 1]) {
    g.push(blob([1.06, 1.68, z * 0.13], 0.06, [0.8, 1, 0.6], 5));
    if (fine) { g.push(blob([1.2, 1.5, z * 0.13], 0.04, [1.2, 0.6, 0.8], 5)); g.push(blob([1.15, 1.44, z * 0.15], 0.025, [1, 1, 0.8], 4)); }
  }
  // the mane: locks radiating from the face, swept back over the neck and shoulders
  const nl = fine ? 18 : 9, c = [1.0, 1.42];
  for (let i = 0; i < nl; i++) {
    const a = i / nl * Math.PI * 2 + 0.1, ca = Math.cos(a), sa = Math.sin(a), k = 0.85 + 0.3 * hash(i, nl, 7), dn = ca < 0 ? 0.28 : 0.02;
    g.push(tube([[c[0] + 0.02, c[1] + 0.22 * ca, 0.22 * sa], [c[0] - 0.17, c[1] + 0.3 * ca - 0.05, 0.36 * sa], [c[0] - 0.4 * k, c[1] + 0.32 * ca - 0.16 - dn * 0.5, 0.42 * sa], [c[0] - 0.62 * k, c[1] + 0.26 * ca - 0.32 - dn, 0.36 * sa]], [[0.06, 0.05], [0.07, 0.05], [0.065, 0.045], [0.04, 0.03]], { seg: 5, sub: 0, side: [0, 1, 0] }));
  }
  // the legs: the near fore planted, the far fore raised onto the book, the hinds planted
  const lg = (pts, r) => { g.push(tube(pts, r, { seg: seg - 1, sub: fine ? 1 : 0, side: [0, 0, 1], capB: false })); const p = pts[pts.length - 1]; g.push(blob([p[0] + 0.06, 0.07, p[2]], 0.13, [1.15, 0.55, 0.95], 6)); };
  lg([[0.55, 0.95, 0.2], [0.52, 0.62, 0.2], [0.6, 0.3, 0.2], [0.66, 0.1, 0.2]], [[0.16, 0.16], [0.12, 0.12], [0.09, 0.09], [0.085, 0.085]]);
  const bk = o.book !== false;
  if (bk) {
    g.push(tube([[0.58, 0.97, -0.2], [0.8, 0.78, -0.2], [1.0, 0.5, -0.2], [1.1, 0.36, -0.2]], [[0.16, 0.16], [0.12, 0.12], [0.09, 0.09], [0.085, 0.085]], { seg: seg - 1, sub: 1, side: [0, 0, 1], capB: false }));
    g.push(blob([1.15, 0.32, -0.2], 0.13, [1.1, 0.6, 0.95], 6));
    const b1 = box(0.88, 0.0, -0.42, 1.4, 0.1, 0.12), b2 = box(0.9, 0.1, -0.4, 1.38, 0.2, 0.1); g.push(b1, b2);
    g.push(box(0.86, 0.2, -0.43, 1.0, 0.27, 0.13).rotateZ(0.0));
  } else lg([[0.58, 0.95, -0.2], [0.55, 0.62, -0.2], [0.62, 0.3, -0.2], [0.68, 0.1, -0.2]], [[0.16, 0.16], [0.12, 0.12], [0.09, 0.09], [0.085, 0.085]]);
  lg([[-0.7, 0.95, 0.24], [-0.52, 0.62, 0.22], [-0.76, 0.38, 0.21], [-0.72, 0.1, 0.21]], [[0.19, 0.19], [0.13, 0.13], [0.09, 0.09], [0.085, 0.085]]);
  lg([[-0.7, 0.95, -0.24], [-0.52, 0.62, -0.22], [-0.76, 0.38, -0.21], [-0.72, 0.1, -0.21]], [[0.19, 0.19], [0.13, 0.13], [0.09, 0.09], [0.085, 0.085]]);
  g.push(tube([[-0.92, 1.05, 0], [-1.25, 0.95, 0.02], [-1.42, 0.62, 0.05], [-1.3, 0.3, 0.04]], [[0.06, 0.06], [0.05, 0.05], [0.045, 0.045], [0.04, 0.04]], { seg: 5, sub: 1, side: [0, 0, 1] }));
  g.push(blob([-1.28, 0.2, 0.04], 0.1, [0.8, 1.5, 0.8], 6));                                                         // the tail's tuft
  // the wings: a row of long feathers fanned from the shoulder, a row of coverts, the arm of the wing
  for (const z of [-1, 1]) {
    const root = [0.22, 1.38, z * 0.3], nf = fine ? 9 : 5;
    g.push(tube([root, [0.2, 1.6, z * 0.33], [0.12, 1.75, z * 0.34]], [[0.07, 0.07], [0.06, 0.06], [0.04, 0.04]], { seg: 6, sub: 0, side: [0, 0, 1] }));
    for (let k = 0; k < nf; k++) {
      const t = k / (nf - 1), th = (118 + t * 58) * Math.PI / 180, L = 1.15 - 0.3 * t - 0.04 * hash(k, z, 3), d = [Math.cos(th), Math.sin(th)];
      const p0 = [0.12, 1.72, z * (0.34 + 0.012 * k)], p1 = [p0[0] + d[0] * L * 0.5, p0[1] + d[1] * L * 0.5, p0[2] + z * 0.01], p2 = [p0[0] + d[0] * L + 0.06 * t, p0[1] + d[1] * L - 0.05, p0[2] + z * 0.02];
      g.push(tube([p0, p1, p2], [[0.014, 0.05], [0.014, 0.07], [0.01, 0.045]], { seg: 5, sub: 0, side: [0, 0, 1] }));
    }
    if (fine) for (let k = 0; k < 6; k++) { const t = k / 5, th = (110 + t * 55) * Math.PI / 180, L = 0.5 - 0.1 * t; g.push(tube([[0.15, 1.6, z * 0.37], [0.15 + Math.cos(th) * L * 0.5, 1.6 + Math.sin(th) * L * 0.5, z * 0.38], [0.15 + Math.cos(th) * L, 1.6 + Math.sin(th) * L, z * 0.385]], [[0.014, 0.06], [0.014, 0.07], [0.01, 0.05]], { seg: 5, sub: 0, side: [0, 0, 1] })); }
  }
  return g;
}

// ── St Theodore on his crocodile: the warrior in cuirass-skirt and cloak, helmet, shield and spear; the beast at his feet.
/** The crocodile, along x from −1 to +1.1 at the origin, 0.5 m wide, its jaws open. */
export function crocodile(o = {}) {
  const lod = o.lod ?? 0, fine = lod === 0, g = [];
  g.push(tube([[-1.15, 0.12, 0.2], [-0.7, 0.14, 0.05], [-0.1, 0.2, 0], [0.5, 0.18, 0], [0.9, 0.14, 0]], [[0.04, 0.03], [0.1, 0.07], [0.24, 0.13], [0.2, 0.11], [0.12, 0.07]], { seg: 7, sub: 1, side: [0, 0, 1], mod: (th, t) => 1 + 0.12 * Math.max(0, Math.sin(th)) * Math.cos(t * 40) }));   // tail, trunk, neck, with the ridge of scutes
  g.push(tube([[0.88, 0.14, 0], [1.1, 0.13, 0], [1.38, 0.1, 0]], [[0.12, 0.07], [0.1, 0.055], [0.07, 0.04]], { seg: 6, sub: 0, side: [0, 0, 1] }));   // the upper jaw
  g.push(tube([[0.9, 0.08, 0], [1.1, 0.05, 0], [1.34, 0.03, 0]], [[0.1, 0.035], [0.08, 0.03], [0.055, 0.025]], { seg: 6, sub: 0, side: [0, 0, 1] }));   // the lower jaw, dropped
  for (const z of [-1, 1]) {
    g.push(blob([0.93, 0.22, z * 0.07], 0.035, [1, 1, 1], 5));
    for (const [x, k] of [[0.55, 1], [-0.45, 1.1]]) g.push(tube([[x, 0.13, z * 0.22], [x + 0.05, 0.08, z * 0.38 * k], [x + 0.14, 0.03, z * 0.44 * k]], [0.06, 0.045, 0.04], { seg: 5, sub: 0, side: [0, 1, 0] }));
  }
  return g;
}
export function theodore(o = {}) {
  const lod = o.lod ?? 0, g = [];
  const f = bodyOf({ pose: 'ease', drape: 'mantle', bareLegs: true, beard: true, helmet: true, lod, shield: 'L', spear: 'R', spearDir: [0.04, 1, 0], cloak: { dir: [-0.25, -0.9, -0.35], len: 0.5, w: 0.19 }, hair: 'curls', arms: { R: [-0.17, 0.62, 0.1], L: [0.16, 0.6, 0.1] } });
  return f;
}
