// Roofwork and joinery for the Nine-Storey building and the cave porches (dossier §14): rolls of cover tiles with
// round eave-end discs, the stepped corbels (queti) under the beams, the balustrade of the decks, the owl-tail
// ridge ends (chiwen) of the Tang roof. Everything goes into the bag's existing materials (merged per material).
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';

let _n = 0;
/** A millimetre of variation so that repeated turned pieces merge instead of becoming instanced prototypes. */
export const jit = () => 1 + (_n++ % 4000) * 0.00001;
/** The triangles of a geometry as a flat list (so that many small pieces can be pushed into one piece of geometry). */
export function trisOf(g) {
  const P = g.attributes.position.array, I = g.index?.array, o = [];
  if (I) for (let i = 0; i < I.length; i++) o.push(P[3 * I[i]], P[3 * I[i] + 1], P[3 * I[i] + 2]); else o.push(...P);
  return o;
}
/** Collects the small repeated pieces of a building into one piece of geometry per material (so that they are neither instanced nor detail meshes of their own). Used where a bag is: add(mat, geometry). */
export class Acc {
  constructor() { this.m = new Map(); }
  add(mat, g) { let a = this.m.get(mat); if (!a) this.m.set(mat, a = []); const P = g.attributes.position.array, I = g.index?.array; if (I) for (let i = 0; i < I.length; i++) a.push(P[3 * I[i]], P[3 * I[i] + 1], P[3 * I[i] + 2]); else for (let i = 0; i < P.length; i++) a.push(P[i]); }
  flush(bag) { for (const [mat, a] of this.m) if (a.length) bag.add(mat, fromTriangles(a)); this.m.clear(); }
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A cover-tile roll along the slope from p (high) to q (eave), lifted a little off the pan tiles, ending in a round disc facing out along dir. */
export function tileRoll(bag, p, q, dir, r = 0.035, disc = 'lacquer_black', withDisc = true) {
  r *= jit();
  bag.add('tile_grey', rod([p[0], p[1] + r, p[2]], [q[0], q[1] + r, q[2]], r, 4));
  const e = r * 1.7, nx = dir[0], nz = dir[1];
  if (withDisc) bag.add(disc, rod([q[0] - nx * 0.03, q[1] + r, q[2] - nz * 0.03], [q[0] + nx * 0.05, q[1] + r, q[2] + nz * 0.05], e, 5));
}

/** Rolls across a warped skirt strip between inner points P[k] and outer points Q[k] (arrays of [x,y,z]), two to a segment. */
export function skirtRolls(bag, P, Q, dir) {
  for (let k = 0; k < P.length - 1; k++) for (const f of [0.25, 0.75]) {
    const wd = f > 0.5;
    const p = lerp(lerp(P[k], P[k + 1], f), lerp(Q[k], Q[k + 1], f), 0.04), q = lerp(lerp(P[k], P[k + 1], f), lerp(Q[k], Q[k + 1], f), 0.985);
    tileRoll(bag, p, q, dir, 0.035, 'lacquer_black', wd);
  }
}

/** A stepped corbel (queti) hanging from a beam's underside beside a column at (xc, zc); sgn the side along z; ytop the beam's underside. */
export function corbel(bag, xc, ytop, zc, sgn, k = 1, tip = 'paint_blue') {
  const S = [[0.22, 0.95, 0.14], [0.22, 0.78, 0.14], [0.22, 0.46, 0.12]];
  let y = ytop;
  S.forEach(([a, len, h], i) => {
    const za = zc + sgn * a * k, zb = zc + sgn * len * k;
    bag.add(i === 2 ? tip : 'timber_red', box(xc - 0.16 * k, y - h * k, Math.min(za, zb), xc + 0.16 * k, y, Math.max(za, zb)));
    y -= h * k;
  });
}

/** The balustrade of a deck: posts with lotus-bud caps every ~1.5 m, a top rail, a lower rail, turned balusters between. y is the deck's top. */
export function balustrade(bag, x, y, z0, z1) {
  const n = Math.max(2, Math.round((z1 - z0) / 1.5)), step = (z1 - z0) / n;
  for (let i = 0; i <= n; i++) {
    const z = z0 + i * step;
    bag.add('timber_red', box(x - 0.07, y, z - 0.07, x + 0.07, y + 1.0, z + 0.07));
    { const j = jit(); bag.add('clay_gilt', lathe([[0.001, 0], [0.07 * j, 0.0], [0.09 * j, 0.05], [0.05 * j, 0.12], [0.001, 0.2]], 6, null, x, y + 1.0, z)); }
  }
  bag.add('timber_red', box(x - 0.06, y + 0.92, z0, x + 0.06, y + 1.0 - 0.0, z1));
  bag.add('lacquer_red', box(x - 0.05, y + 0.84, z0, x + 0.05, y + 0.91, z1));
  bag.add('timber_red', box(x - 0.05, y + 0.18, z0, x + 0.05, y + 0.25, z1));
  const bal = [];
  for (let i = 0; i < n; i++) {
    const za = z0 + i * step, m = Math.round(step / 0.3);
    for (let j = 1; j < m; j++) { const z = za + (j / m) * step; bal.push(...trisOf(rod([x, y + 0.25, z], [x, y + 0.84, z], 0.022, 4))); }
    bag.add('paint_ochre', box(x - 0.04, y + 0.4, za + step / 2 - 0.25, x + 0.04, y + 0.7, za + step / 2 + 0.25));     // a painted panel at the middle of each span
  }
  bag.add('lacquer_black', fromTriangles(bal));
}

/** A window's frame and bars in front of its lattice: a frame, seven upright bars and two cross rails. Face at x; opening from z−hw to z+hw, y0…y1. */
export function windowBars(bag, x, zm, hw, y0, y1) {
  const t = 0.03, B = (a, b, c, d, e, f) => bag.add('timber_red', box(x - t, b, zm + a, x + t, e, zm + d));
  B(-hw - 0.06, y0 - 0.06, 0, -hw + 0.04, y1 + 0.06, 0); B(hw - 0.04, y0 - 0.06, 0, hw + 0.06, y1 + 0.06, 0);
  B(-hw, y0 - 0.06, 0, hw, y0 + 0.04, 0); B(-hw, y1 - 0.04, 0, hw, y1 + 0.06, 0);
  for (let i = 1; i < 6; i++) { const z = -hw + (2 * hw * i) / 6; B(z - 0.016, y0, 0, z + 0.016, y1, 0); }
  for (const f of [1 / 3, 2 / 3]) { const y = y0 + (y1 - y0) * f; B(-hw, y - 0.02, 0, hw, y + 0.02, 0); }
}

/**
 * The owl-tail (chiwen) ridge end of a Tang roof: a tall body that leans out and curls its tip back over the ridge, with a fin.
 * Stands at (x, y, z) on the ridge's end, s = +1 / −1 the ridge's outward direction along z; k scales.
 */
export function chiwen(bag, x, y, z, s, k = 1) {
  const C = [[0.0, 0], [0.26, 0.35], [0.4, 0.8], [0.36, 1.25], [0.18, 1.58], [-0.08, 1.66], [-0.3, 1.5]];
  const W = [0.6, 0.55, 0.46, 0.36, 0.26, 0.17, 0.08], T = [0.24, 0.23, 0.2, 0.17, 0.13, 0.1, 0.06];
  const st = C.map(([u, v], i) => {
    const a = C[Math.min(i + 1, C.length - 1)], b = C[Math.max(i - 1, 0)];
    let du = a[0] - b[0], dv = a[1] - b[1]; const l = Math.hypot(du, dv); du /= l; dv /= l;
    const nu = -dv, nv = du, w = W[i] / 2;
    const P = (uu, vv, xx) => [x + xx * k, y + vv * k, z + s * uu * k];
    return { Lf: P(u + nu * w, v + nv * w, T[i]), Lb: P(u + nu * w, v + nv * w, -T[i]), Rf: P(u - nu * w, v - nv * w, T[i]), Rb: P(u - nu * w, v - nv * w, -T[i]) };
  });
  const t = [], q = (a, b, c, d) => { t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); };
  for (let i = 0; i < st.length - 1; i++) {
    const A = st[i], B = st[i + 1];
    q(A.Lf, B.Lf, B.Rf, A.Rf); q(A.Lb, B.Lb, B.Rb, A.Rb); q(A.Lf, B.Lf, B.Lb, A.Lb); q(A.Rf, B.Rf, B.Rb, A.Rb);
  }
  const E = st[st.length - 1], F = st[0];
  q(E.Lf, E.Rf, E.Rb, E.Lb); q(F.Lf, F.Rf, F.Rb, F.Lb);
  bag.add('gilt_bronze', fromTriangles(t));
  // a row of scales: three small gilt knobs up the back of the curve
  for (const [u, v] of [[0.3, 0.55], [0.4, 1.0], [0.28, 1.42]]) bag.add('clay_gilt', lathe([[0.001, 0], [0.07 * jit(), 0], [0.05, 0.08], [0.001, 0.12]], 6, null, x, y + v * k, z + s * (u + 0.22) * k));
}
