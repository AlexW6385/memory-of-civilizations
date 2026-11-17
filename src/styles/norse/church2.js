// Borgund's finer carving and ironwork (docs/settlements/norse-borgund.md §1, "The south portal", "The west
// door's iron", "The leaf work on the crosses", "The bell in its tower"): the south portal's smooth shafts on
// their cat-head bases carrying capitals with a pair of lions, its archivolt of spiral vine; the iron of the west
// door (strap hinges, key plate, door ring, the latch with its animal head); the leaf-carved arms and rosettes of
// the great St Andrew's crosses; the bell with its headstock and uprights inside the belfry. All flat relief cut from
// a plank, as the carvers worked (carving.js).
import { Shape, Path, Matrix4, Vector3 } from '../../core/three.js';
import { lathe, box } from '../../core/geom.js';
import { relief, poly, ribbon, spiral, dragonHead, staveMask } from './carving.js';

/** A seated lion in profile, facing +u (its head at the right), about 1 wide and 1.1 high; scaled by k and set at (u0, v0). */
function lionShape(k, u0, v0, flip) {
  const P = [[0, 0], [0.02, 0.3], [0.1, 0.55], [0.3, 0.62], [0.42, 0.66], [0.47, 0.78], [0.5, 0.92], [0.58, 1.0], [0.7, 1.02], [0.82, 0.96], [0.9, 0.86], [1.0, 0.8], [0.99, 0.7], [0.88, 0.66], [0.8, 0.62], [0.72, 0.56], [0.7, 0.42], [0.74, 0.28], [0.76, 0.1], [0.82, 0.0]];
  return poly(P.map(([u, v]) => [u0 + (flip ? -u : u) * k, v0 + v * k]));
}
/** A leaf: a pointed lens from p along angle ang, len long and 2·w wide at its belly. */
function leaf(p, ang, len, w) {
  const pts = [], n = 8, c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 0; i <= n; i++) { const t = i / n, u = len * t, v = w * Math.sin(Math.PI * t) * (1 - 0.35 * t); pts.push([p[0] + u * c - v * s, p[1] + u * s + v * c]); }
  for (let i = n - 1; i > 0; i--) { const t = i / n, u = len * t, v = -w * Math.sin(Math.PI * t) * (1 - 0.35 * t); pts.push([p[0] + u * c - v * s, p[1] + u * s + v * c]); }
  return poly(pts);
}
const ring = (r0, r1, c, seg = 14) => { const s = new Shape(); s.absarc(c[0], c[1], r1, 0, Math.PI * 2, false); const h = new Path(); h.absarc(c[0], c[1], r0, 0, Math.PI * 2, true); s.holes.push(h); return s; };
const disc = (r, c) => { const s = new Shape(); s.absarc(c[0], c[1], r, 0, Math.PI * 2, false); return s; };

/**
 * The south portal on a wall facing n = [nx, nz], the door's foot centred at O = [x, y, z]: not cut from the wall's planks but
 * plugged onto it (SNL) — jamb boards and an archivolt band with a spiral vine; two smooth shafts on bases shaped as
 * downward-facing cat-like heads, each carrying a capital with vine work and a lion. The door w wide, springing at hs.
 */
export function southPortal(bag, mat, O, n, { w, hs }) {
  const [nx, nz] = n, W2 = w / 2 + 0.02, jw = 0.2, U = W2 + jw;
  const P = (u, v, d) => [O[0] + nz * u + nx * d, O[1] + v, O[2] - nx * u + nz * d];
  const R = (sh, d0, d1, seg = 6) => bag.add(mat, relief(sh, O, n, d0, d1, seg));
  // the jamb boards and the arch's band, plugged on the wall
  for (const sg of [-1, 1]) R(poly([[sg * W2, 0], [sg * U, 0], [sg * U, hs], [sg * W2, hs]]), -0.01, 0.04);
  { const a = new Shape(); a.absarc(0, hs, U, Math.PI, 0, true); a.lineTo(W2, hs); a.absarc(0, hs, W2, 0, Math.PI, false); a.lineTo(-U, hs); R(a, -0.01, 0.045, 16); }
  // the spiral vine in the archivolt: a stem waving along the band with a curl on alternate sides
  { const m = 44, rm = (W2 + U) / 2, stem = [];
    for (let i = 0; i <= m; i++) { const t = Math.PI * (1 - i / m), rr = rm + 0.04 * Math.sin(i * Math.PI / 4); stem.push([Math.cos(t) * rr, hs + Math.sin(t) * rr]); }
    R(ribbon(stem, 0.03), 0.04, 0.07);
    for (let i = 2; i < m - 1; i += 4) { const t = Math.PI * (1 - i / m), side = (i / 4) % 2 ? 1 : -1, rr = rm + side * 0.05, c = [Math.cos(t) * rr, hs + Math.sin(t) * rr]; R(ribbon(spiral(c, t + (side > 0 ? 0 : Math.PI), 0.032, 1.1, side, 0.3, 10), 0.016), 0.04, 0.062); }
    R(ribbon(Array.from({ length: m + 1 }, (_, i) => { const t = Math.PI * (1 - i / m); return [Math.cos(t) * (U - 0.012), hs + Math.sin(t) * (U - 0.012)]; }), 0.016), 0.04, 0.058); }
  for (const sg of [-1, 1]) {
    const uc = sg * (W2 + jw / 2), capH = 0.3, capV = hs - capH, shaftR = 0.062, d = 0.1;
    // the smooth shaft, with a ring at each end
    const p = P(uc, 0.3, d);
    bag.add(mat, lathe([[shaftR + 0.012, 0], [shaftR + 0.012, 0.03], [shaftR, 0.04], [shaftR, capV - 0.3 - 0.04], [shaftR + 0.012, capV - 0.3 - 0.03], [shaftR + 0.012, capV - 0.3], [0.001, capV - 0.3]], 10, null, p[0], p[1], p[2]));
    // the base: a cat-like head turned face down, ears to the floor (the mask turned upside down about the wall's normal)
    { const geoms = [], tmp = { add: (m, g) => geoms.push(g) }, c = P(uc, 0.2, d - 0.045), ax = new Vector3(nx, 0, nz);
      staveMask(tmp, mat, [0, 0, 0], [nx, nz], 'beast', 0.66);
      for (const g of geoms) { g.applyMatrix4(new Matrix4().makeRotationAxis(ax, Math.PI)); g.translate(c[0], c[1], c[2]); bag.add(mat, g); } }
    // the capital: a cushion block under the springing, framed by mouldings, a vine curling across it, and the lion seated on it facing the door
    R(poly([[uc - 0.125, capV], [uc + 0.125, capV], [uc + 0.14, hs], [uc - 0.14, hs]]), 0.0, 0.1);
    R(poly([[uc - 0.14, hs - 0.03], [uc + 0.14, hs - 0.03], [uc + 0.145, hs], [uc - 0.145, hs]]), 0.0, 0.12);
    R(poly([[uc - 0.13, capV], [uc + 0.13, capV], [uc + 0.13, capV + 0.025], [uc - 0.13, capV + 0.025]]), 0.0, 0.115);
    R(lionShape(0.17, uc + sg * 0.085, capV + 0.05, sg > 0), 0.1, 0.13, 6);
    R(ribbon(spiral([uc - sg * 0.07, capV + 0.215], 0, 0.03, 1.3, sg, 0.3, 10), 0.014), 0.1, 0.12);
    R(ribbon([[uc + sg * 0.1, capV + 0.045], [uc + sg * 0.115, capV + 0.15], [uc + sg * 0.095, capV + 0.24]], 0.014), 0.1, 0.12);
    // the lion's tail, curled up behind it
    R(ribbon(spiral([uc + sg * 0.1, capV + 0.14], -Math.PI / 2, 0.03, 0.9, sg, 0.5, 8), 0.012), 0.1, 0.12);
  }
}

/**
 * The iron on a door leaf: the leaf's face at z = zf (normal −z), spanning x0 (the hinge) to x1 from y, hf high —
 * two strap hinges (gangjern) ending in forked scrolls, a key plate with its keyhole, the door ring, and the latch
 * bar with the carved animal head that bites at a curl (the head on Borgund's west door latch — SNL).
 */
export function doorIron(bag, { x0, x1, y, zf, hf }) {
  const Lw = x1 - x0, O = [x1, y, zf], n = [0, -1];
  const R = (sh, d0, d1, seg = 6) => bag.add('iron', relief(sh, O, n, d0, d1, seg));
  for (const v of [0.28, hf - 0.3]) {
    R(ribbon([[Lw, v], [Lw * 0.55, v], [Lw * 0.3, v]], 0.05), 0.0, 0.016);
    R(ribbon(spiral([Lw * 0.3, v + 0.045], -Math.PI / 2, 0.045, 1.2, -1, 0.3, 12), 0.022), 0.0, 0.014);
    R(ribbon(spiral([Lw * 0.3, v - 0.045], Math.PI / 2, 0.045, 1.2, 1, 0.3, 12), 0.022), 0.0, 0.014);
    R(disc(0.05, [Lw - 0.02, v]), 0.0, 0.022, 10);
    for (let k = 0; k < 4; k++) R(disc(0.014, [Lw * (0.5 + k * 0.12), v]), 0.016, 0.026, 6);
  }
  // the key plate with its keyhole, the ring below it
  { const sh = poly([[0.14, 0.86], [0.26, 0.86], [0.27, 0.92], [0.27, 1.12], [0.26, 1.18], [0.14, 1.18], [0.13, 1.12], [0.13, 0.92]]);
    const kh = new Path(); kh.absarc(0.2, 1.06, 0.018, 0, Math.PI * 2, true); sh.holes.push(kh);
    const sl = new Path(); sl.moveTo(0.192, 1.03); sl.lineTo(0.192, 0.95); sl.lineTo(0.208, 0.95); sl.lineTo(0.208, 1.03); sh.holes.push(sl);
    R(sh, 0.0, 0.012, 8); }
  R(disc(0.03, [0.2, 0.74]), 0.0, 0.03, 8);
  R(ring(0.055, 0.075, [0.2, 0.66]), 0.0, 0.026, 12);
  // the latch bar, and its carved head biting a curl
  R(ribbon([[0.05, 0.79], [0.4, 0.79]], 0.028), 0.0, 0.02);
  dragonHead(bag, 'iron', [x1 - 0.42, y + 0.77, zf], [-1, 0], 0.085, 0.14);
  R(ribbon(spiral([0.7, 0.8], Math.PI, 0.03, 1.2, -1, 0.3, 10), 0.014), 0.0, 0.016);
}

/**
 * The leaf-carved decoration of a great St Andrew's cross whose face is visible from `side` (+1: the left of a→b
 * looking along it, i.e. normal (−uz, ux); −1: the other): a vine stem along each arm with a pair of leaves at
 * every step, a rosette at the crossing. Same arguments as `andrew`, which the arms are laid by.
 */
export function crossLeaves(bag, mat, a, b, u0, u1, v0, v1, side) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, Lu = u1 - u0;
  const O = side > 0 ? [a[0] + ux * u0, 0, a[1] + uz * u0] : [a[0] + ux * u1, 0, a[1] + uz * u1], n = side > 0 ? [-uz, ux] : [uz, -ux];
  const R = (sh, d0, d1, seg = 4) => bag.add(mat, relief(sh, O, n, d0, d1, seg));
  for (const [s, e] of [[[0, v0], [Lu, v1]], [[0, v1], [Lu, v0]]]) {
    const dx = e[0] - s[0], dy = e[1] - s[1], len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), steps = Math.max(3, Math.round(len / 0.34));
    R(ribbon([[s[0] + dx * 0.06, s[1] + dy * 0.06], [s[0] + dx * 0.94, s[1] + dy * 0.94]], 0.022), 0.02, 0.034);
    for (let i = 0; i < steps; i++) {
      const t = 0.1 + 0.8 * (i + 0.5) / steps, p = [s[0] + dx * t, s[1] + dy * t];
      if (Math.abs(t - 0.5) < 0.09) continue;                                   // the rosette stands at the crossing
      R(leaf(p, ang + 0.75, 0.115, 0.028), 0.02, 0.036); R(leaf(p, ang - 0.75, 0.115, 0.028), 0.02, 0.036);
    }
    R(disc(0.03, [s[0] + dx * 0.05, s[1] + dy * 0.05]), 0.02, 0.04, 8); R(disc(0.03, [s[0] + dx * 0.95, s[1] + dy * 0.95]), 0.02, 0.04, 8);
  }
  const c = [Lu / 2, (v0 + v1) / 2];
  R(ring(0.075, 0.1, c), 0.02, 0.04, 12);
  for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4; R(leaf([c[0] + Math.cos(t) * 0.1, c[1] + Math.sin(t) * 0.1], t, 0.055, 0.016), 0.02, 0.036); }
  R(disc(0.05, c), 0.02, 0.046, 10);
}

/** The bell inside the belfry at (x, z) from the floor y: two uprights, the headstock across them, the bell hung from it, its clapper. */
export function bellFrame(bag, W, x, y, z, a) {
  for (const sx of [-1, 1]) bag.add(W, box(x + sx * (a - 0.4) - 0.1, y, z - 0.12, x + sx * (a - 0.4) + 0.1, y + 2.1, z + 0.12));
  bag.add(W, box(x - (a - 0.3), y + 1.9, z - 0.1, x + (a - 0.3), y + 2.1, z + 0.1));                        // the headstock the bell hangs from
  for (const sx of [-1, 1]) bag.add('iron', box(x + sx * 0.24 - 0.025, y + 1.5, z - 0.12, x + sx * 0.24 + 0.025, y + 1.9, z + 0.12));   // the straps from it to the crown
  bag.add('bronze', lathe([[0.5, 0], [0.52, 0.04], [0.5, 0.1], [0.42, 0.24], [0.33, 0.45], [0.26, 0.62], [0.22, 0.8], [0.13, 0.88], [0.001, 0.9]], 16, null, x, y + 1.0, z));
  bag.add('iron', lathe([[0.001, 0], [0.04, 0.04], [0.03, 0.12], [0.001, 0.14]], 8, null, x, y + 0.9, z));  // the clapper
}
