// Sculpture for the Sanchi gateways: modelled volumes and modelled relief, built procedurally and deterministically.
//   - a figure is a signed-distance field (rounded limbs blended into a torso, a head with brow, nose and lips), cut into a
//     smooth surface by surface nets (`nets`), with its jewellery laid on the surface by `wrap`/`tube`;
//   - a relief is a height field rastered from 2D shapes with rounded edges (`Relief`), meshed as one continuous surface
//     that follows the beam or the pillar face;
//   - a `Soup` gathers every piece of one material into ONE geometry (no piece under 0.4 m is left alone, no two pieces
//     alike: the tiny shift of each vertex comes from a hash of its own place, never from a counter or a random number).
// docs/settlements/sanchi.md §19.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

// ---------------------------------------------------------------- signed-distance fields

const sqrt = Math.sqrt, abs = Math.abs, min = Math.min, max = Math.max;

/** Polynomial smooth minimum (blend radius k). */
const smin = (a, b, k) => { if (k <= 0) return min(a, b); const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);

/**
 * A shape is built from primitives, each { d(x, y, z) → distance, k (blend), sub (a cut) }, evaluated in order.
 * Primitives: ball / ellipsoid, a tapered capsule (round cone), a rounded box. All take the places in the figure's frame.
 */
export class Field {
  constructor() { this.P = []; }
  add(p) { this.P.push(p); return this; }
  /** An ellipsoid at c with radii r (a number or [rx, ry, rz]), turned about z by `rz` and about y by `ry`. */
  ball(c, r, k = 0.03, o = {}) {
    const R = Array.isArray(r) ? r : [r, r, r], [cx, cy, cz] = c, rz = o.rz || 0, ry = o.ry || 0, cr = Math.cos(rz), sr = Math.sin(rz), cy2 = Math.cos(ry), sy2 = Math.sin(ry);
    const sm = min(R[0], R[1], R[2]);
    return this.add({ k, sub: !!o.sub, bb: [cx, cy, cz, max(R[0], R[1], R[2])], d: (x, y, z) => {
      let a = x - cx, b = y - cy, e = z - cz;
      if (rz) { const t = a * cr + b * sr; b = -a * sr + b * cr; a = t; }
      if (ry) { const t = a * cy2 + e * sy2; e = -a * sy2 + e * cy2; a = t; }
      a /= R[0]; b /= R[1]; e /= R[2];
      const k0 = sqrt(a * a + b * b + e * e);
      return (k0 - 1) * sm * (R[0] === R[1] && R[1] === R[2] ? 1 : 0.85);
    } });
  }
  /** A limb: from a (radius ra) to b (radius rb), blended with the rest by k. */
  limb(a, b, ra, rb = ra, k = 0.04, o = {}) {
    const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], l2 = bx * bx + by * by + bz * bz || 1e-9, sy = o.flat || 1;
    return this.add({ k, sub: !!o.sub, bb: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, sqrt(l2) / 2 + max(ra, rb)], d: (x, y, z) => {
      const px = x - a[0], py = y - a[1], pz = z - a[2];
      const t = min(1, max(0, (px * bx + py * by + pz * bz) / l2));
      const dx = px - bx * t, dy = py - by * t, dz = pz - bz * t;
      return sqrt(dx * dx + dy * dy * sy * sy + dz * dz) - (ra + (rb - ra) * t);
    } });
  }
  /** A rounded box centred at c with half-sizes h and rounding r. */
  slab(c, h, r = 0.02, k = 0.02, o = {}) {
    return this.add({ k, sub: !!o.sub, bb: [c[0], c[1], c[2], sqrt(h[0] * h[0] + h[1] * h[1] + h[2] * h[2])], d: (x, y, z) => {
      const qx = abs(x - c[0]) - h[0] + r, qy = abs(y - c[1]) - h[1] + r, qz = abs(z - c[2]) - h[2] + r;
      return sqrt(max(qx, 0) ** 2 + max(qy, 0) ** 2 + max(qz, 0) ** 2) + min(max(qx, qy, qz), 0) - r;
    } });
  }
  eval(x, y, z) {
    let d = 1e9;
    const P = this.P;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], pd = p.d(x, y, z);
      d = i === 0 ? pd : p.sub ? smax(d, -pd, p.k) : smin(d, pd, p.k);
    }
    return d;
  }
  /** The bounding box of the primitives (blend radius and `pad` added). */
  box(pad = 0.05) {
    const b = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
    for (const p of this.P) { if (p.sub) continue; const [x, y, z, r] = p.bb; b[0] = min(b[0], x - r); b[1] = min(b[1], y - r); b[2] = min(b[2], z - r); b[3] = max(b[3], x + r); b[4] = max(b[4], y + r); b[5] = max(b[5], z + r); }
    return b.map((v, i) => v + (i < 3 ? -pad : pad));
  }
}

// ---------------------------------------------------------------- surface nets

/**
 * The surface d = 0 of `f` (negative inside) within `box` [x0, y0, z0, x1, y1, z1] on a grid of `h` metres, as a smooth
 * indexed mesh { pos, nor, idx }: a vertex in each cell the surface crosses, quads across each crossed edge, normals from
 * the field's gradient.
 */
export function nets(field, box, h) {
  const f = field.eval ? (x, y, z) => field.eval(x, y, z) : field;
  const [x0, y0, z0, x1, y1, z1] = box;
  const nx = Math.ceil((x1 - x0) / h) + 1, ny = Math.ceil((y1 - y0) / h) + 1, nz = Math.ceil((z1 - z0) / h) + 1;
  const V = new Float32Array(nx * ny * nz), id = (i, j, k) => (k * ny + j) * nx + i;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) V[id(i, j, k)] = f(x0 + i * h, y0 + j * h, z0 + k * h);
  const cx = nx - 1, cy = ny - 1, cz = nz - 1, cell = new Int32Array(cx * cy * cz).fill(-1), cid = (i, j, k) => (k * cy + j) * cx + i;
  const pos = [], nor = [], idx = [];
  const CO = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const ED = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const e = h * 0.5;
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0; const v = new Array(8);
    for (let c = 0; c < 8; c++) { const o = CO[c]; v[c] = V[id(i + o[0], j + o[1], k + o[2])]; if (v[c] < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of ED) {
      if ((v[a] < 0) === (v[b] < 0)) continue;
      const t = v[a] / (v[a] - v[b]), A = CO[a], B = CO[b];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; n++;
    }
    const px = x0 + (i + sx / n) * h, py = y0 + (j + sy / n) * h, pz = z0 + (k + sz / n) * h;
    let gx = f(px + e, py, pz) - f(px - e, py, pz), gy = f(px, py + e, pz) - f(px, py - e, pz), gz = f(px, py, pz + e) - f(px, py, pz - e);
    const gl = sqrt(gx * gx + gy * gy + gz * gz) || 1;
    cell[cid(i, j, k)] = pos.length / 3;
    pos.push(px, py, pz); nor.push(gx / gl, gy / gl, gz / gl);
  }
  const quadAt = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, d, c, a, c, b); else idx.push(a, b, c, a, c, d);
  };
  for (let k = 1; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 0; i < cx; i++) {   // edges along x
    const a = V[id(i, j, k)], b = V[id(i + 1, j, k)];
    if ((a < 0) !== (b < 0)) quadAt(cell[cid(i, j - 1, k - 1)], cell[cid(i, j, k - 1)], cell[cid(i, j, k)], cell[cid(i, j - 1, k)], a >= 0);
  }
  for (let k = 1; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 1; i < cx; i++) {   // along y
    const a = V[id(i, j, k)], b = V[id(i, j + 1, k)];
    if ((a < 0) !== (b < 0)) quadAt(cell[cid(i - 1, j, k - 1)], cell[cid(i - 1, j, k)], cell[cid(i, j, k)], cell[cid(i, j, k - 1)], a >= 0);
  }
  for (let k = 0; k < cz; k++) for (let j = 1; j < cy; j++) for (let i = 1; i < cx; i++) {   // along z
    const a = V[id(i, j, k)], b = V[id(i, j, k + 1)];
    if ((a < 0) !== (b < 0)) quadAt(cell[cid(i - 1, j - 1, k)], cell[cid(i, j - 1, k)], cell[cid(i, j, k)], cell[cid(i - 1, j, k)], a >= 0);
  }
  // the winding follows the normals
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx2 = uy * vz - uz * vy, ny2 = uz * vx - ux * vz, nz2 = ux * vy - uy * vx;
    if (nx2 * (nor[a] + nor[b] + nor[c]) + ny2 * (nor[a + 1] + nor[b + 1] + nor[c + 1]) + nz2 * (nor[a + 2] + nor[b + 2] + nor[c + 2]) < 0) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  }
  return { pos, nor, idx };
}

/** The point where a ray from c (inside the field) along unit direction d leaves it (bisection), nudged out by `out`. */
export function leave(field, c, d, rMax = 0.6, out = 0) {
  let lo = 0, hi = rMax;
  if (field.eval(c[0] + d[0] * hi, c[1] + d[1] * hi, c[2] + d[2] * hi) < 0) return [c[0] + d[0] * hi, c[1] + d[1] * hi, c[2] + d[2] * hi];
  for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (field.eval(c[0] + d[0] * m, c[1] + d[1] * m, c[2] + d[2] * m) < 0) lo = m; else hi = m; }
  return [c[0] + d[0] * (lo + out), c[1] + d[1] * (lo + out), c[2] + d[2] * (lo + out)];
}
/** Points on the surface round an axis: from the centre c, in the plane spanned by unit vectors a and b, at `n` angles. */
export function ringOn(field, c, a, b, n, rMax = 0.6, out = 0, a0 = 0, a1 = Math.PI * 2) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const th = a0 + (a1 - a0) * i / (a1 - a0 < 6.2 ? n - 1 : n), co = Math.cos(th), si = Math.sin(th);
    P.push(leave(field, c, [a[0] * co + b[0] * si, a[1] * co + b[1] * si, a[2] * co + b[2] * si], rMax, out));
  }
  return P;
}

// ---------------------------------------------------------------- small solids (jewellery, tufts)

/** A smooth tube of radius r (a number or a function of 0…1) along points; closed joins the ends. Returns a mesh { pos, nor, idx }. */
export function tube(pts, r, seg = 6, closed = false) {
  const pos = [], nor = [], idx = [], n = pts.length, rf = typeof r === 'function' ? r : () => r;
  let prev = null;
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i + n - 1) % n : max(i - 1, 0)], b = pts[closed ? (i + 1) % n : min(i + 1, n - 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2]; const tl = sqrt(tx * tx + ty * ty + tz * tz) || 1; tx /= tl; ty /= tl; tz /= tl;
    let ux, uy, uz;
    if (!prev) { if (abs(ty) < 0.9) { ux = -tz; uy = 0; uz = tx; } else { ux = 0; uy = tz; uz = -ty; } }
    else { const d = prev[0] * tx + prev[1] * ty + prev[2] * tz; ux = prev[0] - tx * d; uy = prev[1] - ty * d; uz = prev[2] - tz * d; }
    const ul = sqrt(ux * ux + uy * uy + uz * uz) || 1; ux /= ul; uy /= ul; uz /= ul; prev = [ux, uy, uz];
    const vx = ty * uz - tz * uy, vy = tz * ux - tx * uz, vz = tx * uy - ty * ux, rr = rf(i / max(n - 1, 1));
    for (let s = 0; s < seg; s++) {
      const th = s / seg * Math.PI * 2, co = Math.cos(th), si = Math.sin(th);
      nor.push(ux * co + vx * si, uy * co + vy * si, uz * co + vz * si);
      pos.push(pts[i][0] + nor[nor.length - 3] * rr, pts[i][1] + nor[nor.length - 2] * rr, pts[i][2] + nor[nor.length - 1] * rr);
    }
  }
  const rows = closed ? n : n - 1;
  for (let i = 0; i < rows; i++) for (let s = 0; s < seg; s++) {
    const a = i * seg + s, b = i * seg + (s + 1) % seg, c = ((i + 1) % n) * seg + (s + 1) % seg, d = ((i + 1) % n) * seg + s;
    idx.push(a, b, c, a, c, d);
  }
  return orient({ pos, nor, idx });
}
/** A little ball (bead) at c. */
export function bead(c, r, seg = 6, rings = 4) {
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= rings; i++) {
    const ph = Math.PI * i / rings, y = Math.cos(ph), rr = Math.sin(ph);
    for (let s = 0; s < seg; s++) { const th = s / seg * Math.PI * 2, x = Math.cos(th) * rr, z = Math.sin(th) * rr; nor.push(x, y, z); pos.push(c[0] + x * r, c[1] + y * r, c[2] + z * r); }
  }
  for (let i = 0; i < rings; i++) for (let s = 0; s < seg; s++) { const a = i * seg + s, b = i * seg + (s + 1) % seg, d = (i + 1) * seg + s, e = (i + 1) * seg + (s + 1) % seg; idx.push(a, d, e, a, e, b); }
  return orient({ pos, nor, idx });
}
/** A closed-surface mesh whose triangles face the way its normals do. */
export function orient(m) {
  const { pos, nor, idx } = m;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * (nor[a] + nor[b] + nor[c]) + ny * (nor[a + 1] + nor[b + 1] + nor[c + 1]) + nz * (nor[a + 2] + nor[b + 2] + nor[c + 2]) < 0) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  }
  return m;
}
/** Several meshes as one. */
export function join(...ms) {
  const pos = [], nor = [], idx = [];
  for (const m of ms) { if (!m) continue; const o = pos.length / 3; for (const v of m.pos) pos.push(v); for (const v of m.nor) nor.push(v); for (const i of m.idx) idx.push(i + o); }
  return { pos, nor, idx };
}

// ---------------------------------------------------------------- the soup: everything of one material in one geometry

/** A hash of a place (millimetres), 0…1: the same place gives the same number in every build. */
export function hash3(x, y, z) {
  let h = (Math.round(x * 1000) * 374761393 + Math.round(y * 1000) * 668265263 + Math.round(z * 1000) * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

export class Soup {
  constructor() { this.P = []; this.N = []; }
  /** Flat triangles [x y z …, 9 a triangle], flat normals. */
  flat(tris) {
    for (let i = 0; i < tris.length; i += 9) {
      const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
      for (let k = 0; k < 3; k++) { this.P.push(tris[i + 3 * k], tris[i + 3 * k + 1], tris[i + 3 * k + 2]); this.N.push(nx, ny, nz); }
    }
  }
  /**
   * A smooth mesh { pos, nor, idx } placed: scaled by s, leaned about z by `lean`, mirrored across z if `mirror`, turned about y by yaw
   * (as core/geom place()), moved to (x, y, z).
   */
  mesh(m, T = {}) {
    const { x = 0, y = 0, z = 0, yaw = 0, s = 1, lean = 0, mirror = false } = T, cy = Math.cos(yaw), sy = Math.sin(yaw), cl = Math.cos(lean), sl = Math.sin(lean);
    const xf = (a, b, c, isPos) => {
      if (mirror) c = -c;
      if (lean) { const t = a * cl + b * sl; b = -a * sl + b * cl; a = t; }
      if (isPos) { a *= s; b *= s; c *= s; }
      return [a * cy + c * sy + (isPos ? x : 0), b + (isPos ? y : 0), -a * sy + c * cy + (isPos ? z : 0)];
    };
    const { pos, nor, idx } = m;
    for (let t = 0; t < idx.length; t += 3) {
      const o = mirror ? [0, 2, 1] : [0, 1, 2];
      for (const q of o) {
        const v = idx[t + q] * 3, p = xf(pos[v], pos[v + 1], pos[v + 2], true), n = xf(nor[v], nor[v + 1], nor[v + 2], false);
        this.P.push(p[0], p[1], p[2]); this.N.push(n[0], n[1], n[2]);
      }
    }
  }
  /** A non-indexed geometry with normals (core/geom's lathe, rod …), placed as it is. */
  geom(g) {
    const P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i++) { this.P.push(P[i]); this.N.push(N[i]); }
  }
  get tris() { return this.P.length / 9; }
  /** The geometry, each vertex shifted by up to ±1.5 mm by a hash of its own place (so that no two pieces are alike). */
  geometry(shift = 0.003) {
    const P = new Float32Array(this.P);
    for (let i = 0; i < P.length; i += 3) {
      const h = hash3(P[i], P[i + 1], P[i + 2]), h2 = hash3(P[i + 2], P[i], P[i + 1]), h3 = hash3(P[i + 1], P[i + 2], P[i]);
      P[i] += (h - 0.5) * shift; P[i + 1] += (h2 - 0.5) * shift; P[i + 2] += (h3 - 0.5) * shift;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(this.N), 3));
    return g;
  }
}

// ---------------------------------------------------------------- relief: a height field from 2D shapes

/** Signed distances in the plane (negative inside). */
export const S2 = {
  circle: (c, r) => ({ bb: [c[0] - r, c[1] - r, c[0] + r, c[1] + r], sd: (u, v) => Math.hypot(u - c[0], v - c[1]) - r }),
  ellipse: (c, rx, ry, rot = 0) => {
    const co = Math.cos(rot), si = Math.sin(rot), m = min(rx, ry), R = max(rx, ry);
    return { bb: [c[0] - R, c[1] - R, c[0] + R, c[1] + R], sd: (u, v) => { const a = (u - c[0]) * co + (v - c[1]) * si, b = -(u - c[0]) * si + (v - c[1]) * co; return (Math.hypot(a / rx, b / ry) - 1) * m; } };
  },
  capsule: (a, b, ra, rb = ra) => {
    const bx = b[0] - a[0], by = b[1] - a[1], l2 = bx * bx + by * by || 1e-9, R = max(ra, rb);
    return { bb: [min(a[0], b[0]) - R, min(a[1], b[1]) - R, max(a[0], b[0]) + R, max(a[1], b[1]) + R], sd: (u, v) => { const t = min(1, max(0, ((u - a[0]) * bx + (v - a[1]) * by) / l2)); return Math.hypot(u - a[0] - bx * t, v - a[1] - by * t) - (ra + (rb - ra) * t); } };
  },
  box: (c, hw, hh, r = 0, rot = 0) => {
    const co = Math.cos(rot), si = Math.sin(rot), R = Math.hypot(hw, hh);
    return { bb: [c[0] - R, c[1] - R, c[0] + R, c[1] + R], sd: (u, v) => { const a = abs((u - c[0]) * co + (v - c[1]) * si) - hw + r, b = abs(-(u - c[0]) * si + (v - c[1]) * co) - hh + r; return Math.hypot(max(a, 0), max(b, 0)) + min(max(a, b), 0) - r; } };
  },
  /** A convex polygon (counter-clockwise points). */
  poly: (pts) => {
    const n = pts.length; let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9;
    for (const [u, v] of pts) { u0 = min(u0, u); v0 = min(v0, v); u1 = max(u1, u); v1 = max(v1, v); }
    return { bb: [u0, v0, u1, v1], sd: (u, v) => {
      let d = -1e9;
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey) || 1; d = max(d, ((u - a[0]) * ey - (v - a[1]) * ex) / l); }
      return d;
    } };
  },
};

/**
 * A relief on a plane: a grid over u0…u1 × v0…v1 of `h` metres. Shapes are added with a height range [lo, hi] (m above the
 * ground) and a rounding width w; the field is the highest of them; `cut` takes a groove out of what is there.
 */
export class Relief {
  constructor(u0, v0, u1, v1, h) {
    this.u0 = u0; this.v0 = v0; this.h = h;
    this.nu = Math.ceil((u1 - u0) / h); this.nv = Math.ceil((v1 - v0) / h);
    this.H = new Float32Array((this.nu + 1) * (this.nv + 1)); this.k = 1;
  }
  /** Rastered over the shape's box; inside depth q gives lo + (hi - lo) · quarter-round(q / w). */
  add(shape, hi, lo = 0, w = 0.02) {
    const { bb, sd } = shape, { u0, v0, h, nu, nv, H } = this, pad = 1;
    const i0 = max(0, Math.floor((bb[0] - u0) / h) - pad), i1 = min(nu, Math.ceil((bb[2] - u0) / h) + pad), j0 = max(0, Math.floor((bb[1] - v0) / h) - pad), j1 = min(nv, Math.ceil((bb[3] - v0) / h) + pad);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const q = -sd(u0 + i * h, v0 + j * h);
      if (q <= 0) continue;
      const t = 1 - min(q / w, 1), p = sqrt(max(0, 1 - t * t)), val = (lo + (hi - lo) * p) * this.k;
      const o = j * (nu + 1) + i; if (val > H[o]) H[o] = val;
    }
    return this;
  }
  /** A groove of depth `dep` and rounding w, taken out of the field (not below `floor`). */
  cut(shape, dep, w = 0.012, floor = 0) {
    const { bb, sd } = shape, { u0, v0, h, nu, nv, H } = this, pad = 1;
    const i0 = max(0, Math.floor((bb[0] - u0) / h) - pad), i1 = min(nu, Math.ceil((bb[2] - u0) / h) + pad), j0 = max(0, Math.floor((bb[1] - v0) / h) - pad), j1 = min(nv, Math.ceil((bb[3] - v0) / h) + pad);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const q = -sd(u0 + i * h, v0 + j * h);
      if (q <= 0) continue;
      const t = 1 - min(q / w, 1), p = sqrt(max(0, 1 - t * t)), o = j * (nu + 1) + i;
      H[o] = max(floor, H[o] - dep * p);
    }
    return this;
  }
  at(i, j) { return this.H[j * (this.nu + 1) + i]; }
  /**
   * Mesh into `soup`: `P(u, v, hh)` → [x, y, z] of the point at height hh over the ground at (u, v); axes eu (along u), ev (along v)
   * and en (out of the ground) for the normals. `base` is the ground's own height offset (a field meshed in full, as the recessed
   * field of a beam: flat runs are emitted as one quad); without `full`, flat cells are left out (a relief on a wall's face).
   */
  mesh(soup, P, eu, ev, en, { full = false } = {}) {
    const { nu, nv, h, u0, v0 } = this, tris = [];
    // the winding: eu × ev against en
    const cx = eu[1] * ev[2] - eu[2] * ev[1], cy = eu[2] * ev[0] - eu[0] * ev[2], cz = eu[0] * ev[1] - eu[1] * ev[0], ccw = cx * en[0] + cy * en[1] + cz * en[2] > 0;
    const hs = (i, j) => this.H[j * (nu + 1) + min(max(j, 0), nv) * 0 + min(max(i, 0), nu)];
    const normal = (i, j) => {
      const du = (hs(min(i + 1, nu), j) - hs(max(i - 1, 0), j)) / ((min(i + 1, nu) - max(i - 1, 0)) * h), dv = (hs(i, min(j + 1, nv)) - hs(i, max(j - 1, 0))) / ((min(j + 1, nv) - max(j - 1, 0)) * h);
      const x = en[0] - eu[0] * du - ev[0] * dv, y = en[1] - eu[1] * du - ev[1] * dv, z = en[2] - eu[2] * du - ev[2] * dv, l = Math.hypot(x, y, z);
      return [x / l, y / l, z / l];
    };
    const vt = (i, j) => P(u0 + i * h, v0 + j * h, hs(i, j));
    const push = (a, b, c, na, nb, nc) => {
      const o = ccw ? [a, b, c] : [a, c, b], on = ccw ? [na, nb, nc] : [na, nc, nb];
      for (let k = 0; k < 3; k++) { soup.P.push(...o[k]); soup.N.push(...on[k]); }
    };
    for (let j = 0; j < nv; j++) {
      let run = -1;
      const flushRun = (iEnd) => {
        if (run < 0) return;
        const a = vt(run, j), b = vt(iEnd, j), c = vt(iEnd, j + 1), d = vt(run, j + 1);
        push(a, b, c, en, en, en); push(a, c, d, en, en, en); run = -1;
      };
      for (let i = 0; i < nu; i++) {
        const flat = this.at(i, j) === 0 && this.at(i + 1, j) === 0 && this.at(i, j + 1) === 0 && this.at(i + 1, j + 1) === 0;
        if (flat) { if (full) { if (run < 0) run = i; else if ((i - run) * h >= 0.3) { flushRun(i); run = i; } } continue; }
        flushRun(i);
        const a = vt(i, j), b = vt(i + 1, j), c = vt(i + 1, j + 1), d = vt(i, j + 1), na = normal(i, j), nb = normal(i + 1, j), nc = normal(i + 1, j + 1), nd = normal(i, j + 1);
        // the diagonal along the lower slope, so that no ridge is cut flat
        if (abs(this.at(i, j) - this.at(i + 1, j + 1)) <= abs(this.at(i + 1, j) - this.at(i, j + 1))) { push(a, b, c, na, nb, nc); push(a, c, d, na, nc, nd); } else { push(a, b, d, na, nb, nd); push(b, c, d, nb, nc, nd); }
      }
      flushRun(nu);
    }
    void tris;
  }
}
