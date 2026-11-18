// The sculptor's tools of the Ananda's figures and reliefs (docs/settlements/bagan.md §14): the Nabataean kit's rounded solids (tubes, ellipsoids, sheets),
// gathered per material into ONE geometry each for a whole element, placed in a frame of the temple; a loft of superellipse rings for robes and lotus petals; a height field
// for the stone reliefs (a continuous surface rising from the slab). Nothing random: any variation is a hash of a piece's own place.
import { Sculpt, tube, blob, blobDir, ellipsoid, sheet, torus, rodT, hash3, add, sub, mul, norm, cross, dot, len } from '../nabataean/sculpt.js';

export { Sculpt, tube, blob, blobDir, ellipsoid, sheet, torus, rodT, hash3, add, sub, mul, norm, cross, dot, len };
export const TAU = Math.PI * 2;

/**
 * A figure's kit: `xf` takes the figure's own frame (x to the viewer's right, y up, z toward the viewer; metres) to the world. K.S(mat) is the Sculpt of one material;
 * K.emit(bag) adds each as one geometry.
 */
export class Kit {
  /** only: build the fine extras alone (what `K.x(fn)` runs is kept; everything else goes into a sink). */
  constructor(xf, only = false) { this.xf = xf; this.m = new Map(); this.only = only; this.live = false; this.sink = new Sculpt(xf); }
  x(fn) { const o = this.live; this.live = true; fn(); this.live = o; }
  S(mat) {
    let s = this.m.get(mat); if (!s) this.m.set(mat, (s = new Sculpt(this.xf)));
    if (!this.only) return s;
    // (extras only: a handle that writes to the real sculpt while `x` runs and to the sink otherwise)
    let h = this.h?.get(mat);
    if (!h) { (this.h ||= new Map()).set(mat, (h = { grid: (...a) => this.pick(s).grid(...a), solid: (...a) => this.pick(s).solid(...a), box: (...a) => this.pick(s).box(...a), prism: (...a) => this.pick(s).prism(...a) })); }
    return h;
  }
  pick(s) { if (this.live) return s; this.sink.pos.length = 0; this.sink.nor.length = 0; return this.sink; }
  get tris() { let n = 0; for (const s of this.m.values()) n += s.triangles; return n; }
  emit(bag) { for (const [mat, s] of this.m) if (s.pos.length) bag.add(mat, s.geometry()); }
}
/** The figure's frame to the world through a side frame F of the temple: standing at (u, v) on height y, turned `yaw` about the vertical (0: facing +v), scaled s. */
export function frameXf(F, u, v, y = 0, yaw = 0, s = 1) {
  const c = Math.cos(yaw), sn = Math.sin(yaw);
  return (p) => {
    const rx = p[0] * c + p[2] * sn, rz = -p[0] * sn + p[2] * c, [X, Z] = F.pt(u - rx * s, v + rz * s);
    return [X, y + p[1] * s, Z];
  };
}

/** A table [[y, a, b, …], …] (rows ascending in y) sampled at y, smooth through the rows (Catmull–Rom). */
export function sampleTable(T, y) {
  const n = T.length;
  if (y <= T[0][0]) return T[0].slice(1);
  if (y >= T[n - 1][0]) return T[n - 1].slice(1);
  let i = 0; while (i + 2 < n && T[i + 1][0] < y) i++;
  const h = T[i + 1][0] - T[i][0], t = (y - T[i][0]) / h, t2 = t * t, t3 = t2 * t, out = [];
  for (let k = 1; k < T[i].length; k++) {
    const p0 = T[i][k], p1 = T[i + 1][k];
    const m0 = i === 0 ? (p1 - p0) : (p1 - T[i - 1][k]) / (T[i + 1][0] - T[i - 1][0]) * h;
    const m1 = i + 2 >= n ? (p1 - p0) : (T[i + 2][k] - p0) / (T[i + 2][0] - T[i][0]) * h;
    out.push((2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1);
  }
  return out;
}

/**
 * A loft: rings at the heights ys (ascending), each a superellipse of half-widths rx, rz about (cx, cz) (from `table` rows [y, rx, rz, cz, cx]),
 * `mod(y, th)` scaling the radius (folds, petals, a flared hem); n points round; th = 0 toward +x, π/2 toward +z (the front). The ends are closed.
 */
export function loft(S, table, ys, n, { p = 2.3, mod = null, capTop = true, capBottom = true } = {}) {
  const rows = [];
  const ring = (y, sc = 1) => {
    const [rx, rz, cz = 0, cx = 0] = sampleTable(table, y), row = [];
    for (let j = 0; j < n; j++) {
      const th = j / n * TAU, c = Math.cos(th), s = Math.sin(th), m = (mod ? mod(y, th) : 1) * sc, q = Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(s), p), -1 / p);
      row.push([cx + rx * m * q * c, y, cz + rz * m * q * s]);
    }
    return row;
  };
  if (capBottom) rows.push(ring(ys[0], 1e-3));
  for (const y of ys) rows.push(ring(y));
  if (capTop) rows.push(ring(ys[ys.length - 1], 1e-3));
  S.grid(rows);
}

/**
 * A relief's height field: over x in [x0, x1], y in [y0, y1] at cell `res`, the surface z = base + fn(x, y) in the relief's own frame (z out of the slab), emitted where it rises
 * above 0.4 mm (or a neighbour does). Normals from the field's own slope, so the carving shades as one continuous surface.
 */
export function heightField(S, x0, x1, y0, y1, res, fn, base = 0.0015) {
  const nx = Math.max(2, Math.round((x1 - x0) / res)), ny = Math.max(2, Math.round((y1 - y0) / res)), h = [], X = (i) => x0 + (x1 - x0) * i / nx, Y = (j) => y0 + (y1 - y0) * j / ny;
  for (let i = 0; i <= nx; i++) { const col = []; for (let j = 0; j <= ny; j++) col.push(fn(X(i), Y(j))); h.push(col); }
  const P = S.pos, N = S.nor, xf = S.xf;
  const nrm = (i, j) => {
    const i0 = Math.max(0, i - 1), i1 = Math.min(nx, i + 1), j0 = Math.max(0, j - 1), j1 = Math.min(ny, j + 1);
    return norm([-(h[i1][j] - h[i0][j]) / (X(i1) - X(i0)), -(h[i][j1] - h[i][j0]) / (Y(j1) - Y(j0)), 1]);
  };
  const vert = (i, j) => {
    const z = base + h[i][j], n = nrm(i, j), a = xf([X(i), Y(j), z]), b = xf([X(i) + n[0], Y(j) + n[1], z + n[2]]), w = norm(sub(b, a));
    P.push(a[0], a[1], a[2]); N.push(w[0], w[1], w[2]);
  };
  // (the winding is chosen so that the front faces +z of the relief's frame as the frame maps it)
  const o = xf([0, 0, 0]), flip = dot(cross(sub(xf([1, 0, 0]), o), sub(xf([0, 1, 0]), o)), sub(xf([0, 0, 1]), o)) < 0, e = 0.0004;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if (base < 0.01 && !(h[i][j] > e || h[i + 1][j] > e || h[i][j + 1] > e || h[i + 1][j + 1] > e)) continue;
    const A = [i, j], B = [i + 1, j], C = [i + 1, j + 1], D = [i, j + 1];
    for (const t of flip ? [[A, C, B], [A, D, C]] : [[A, B, C], [A, C, D]]) for (const q of t) vert(q[0], q[1]);
  }
}

/** A mound of a height field: centre (cx, cy), radii (rx, ry) turned by `a`, height h, the profile (1 − r²)^e (small e: a steep, rounded edge). */
export const mound = (x, y, cx, cy, rx, ry, h, e = 0.38, a = 0) => {
  const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy, u = (dx * c + dy * s) / rx, w = (-dx * s + dy * c) / ry, r2 = u * u + w * w;
  return r2 >= 1 ? 0 : h * Math.pow(1 - r2, e);
};
/** A ring mound (a wheel's rim, a halo): radius R, half-width w, height h. */
export const ringMound = (x, y, cx, cy, R, w, h) => { const d = Math.abs(Math.hypot(x - cx, y - cy) - R) / w; return d >= 1 ? 0 : h * Math.pow(1 - d * d, 0.6); };
/** A line of a height field from (ax, ay) to (bx, by), half-width w, height h (a rail, a spoke, a branch, a limb). */
export const streak = (x, y, ax, ay, bx, by, w, h) => {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), d = Math.hypot(x - ax - dx * t, y - ay - dy * t) / w;
  return d >= 1 ? 0 : h * Math.pow(1 - d * d, 0.6);
};
/** The figure's frame to the world at (x, y, z), turned `yaw` (local +z toward (sin yaw, cos yaw)), scaled s. */
export const worldXf = (x, y, z, yaw = 0, s = 1) => {
  const c = Math.cos(yaw), sn = Math.sin(yaw);
  return (p) => [x + (p[0] * c + p[2] * sn) * s, y + p[1] * s, z + (-p[0] * sn + p[2] * c) * s];
};
