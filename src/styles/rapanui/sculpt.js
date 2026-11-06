// Sculpted stone and wood: a closed surface lofted through horizontal sections (rounded boxes,
// superellipses), each point pushed out or in along its section's normal by a relief function —
// the way a moai is cut from a block of tuff or a Māori figure from a post. Used by the rapanui
// and maori styles for moai, pou, amo, tekoteko and koruru.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
/** 1 inside |u| < 1, falling smoothly to 0 by |u| = 1 + soft. */
export const bump = (u, soft = 0.35) => 1 - smooth(1 - soft, 1, Math.abs(u));
/** 1 inside the ellipse (u, v) scaled to the unit circle, smooth at its rim. */
export const blob = (u, v, soft = 0.3) => 1 - smooth(1 - soft, 1, Math.hypot(u, v));

/**
 * sculpt({ ys, cols, section, relief, warp }):
 *   ys: row heights, bottom to top; cols: points round each row;
 *   section(y) → { w, d, zc, n }: half-width (x), half-depth (z), centre offset in z, superellipse exponent;
 *   relief(x, y, z, front, side, back) → metres pushed out along the section's normal (negative: cut in);
 *     front / side / back are weights 0…1 of how much the point faces −z, ±x, +z;
 *   warp (0…0.8): crowd the columns toward the front (−z), where the carving is.
 * Returns a non-indexed BufferGeometry with smooth normals, closed by flat caps.
 */
export function sculpt({ ys, cols = 48, section, relief = null, warp = 0.4 }) {
  const R = ys.length, C = cols, P = [];
  for (let i = 0; i < R; i++) {
    const y = ys[i], s = section(y), n = s.n ?? 3, row = [];
    for (let j = 0; j < C; j++) {
      let ph = Math.PI * (2 * j / C - 1);
      ph = ph - warp * Math.sin(ph);                     // denser near ph = 0 (the front)
      const sp = Math.sin(ph), cp = Math.cos(ph);
      const x = s.w * Math.sign(sp) * Math.abs(sp) ** (2 / n), z = (s.zc ?? 0) - s.d * Math.sign(cp) * Math.abs(cp) ** (2 / n);
      // the outward normal of the superellipse |x/w|^n + |z/d|^n = 1
      const gx = Math.sign(x) * Math.abs(x / s.w) ** (n - 1) / s.w, gz = Math.sign(z - (s.zc ?? 0)) * Math.abs((z - (s.zc ?? 0)) / s.d) ** (n - 1) / s.d;
      const gl = Math.hypot(gx, gz) || 1, nx = gx / gl, nz = gz / gl;
      let px = x, pz = z;
      if (relief) {
        const front = clamp(-nz) ** 1.5, back = clamp(nz) ** 1.5, side = clamp(Math.abs(nx)) ** 1.5;
        const r = relief(x, y, z, front, side, back);
        px += nx * r; pz += nz * r;
      }
      row.push([px, y, pz]);
    }
    P.push(row);
  }
  // smooth vertex normals from the quads round each vertex
  const N = P.map((row) => row.map(() => [0, 0, 0]));
  const acc = (i, j, v) => { const t = N[i][j]; t[0] += v[0]; t[1] += v[1]; t[2] += v[2]; };
  for (let i = 0; i < R - 1; i++) for (let j = 0; j < C; j++) {
    const a = P[i][j], b = P[i][(j + 1) % C], c = P[i + 1][(j + 1) % C], d = P[i + 1][j];
    const u = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], v = [d[0] - b[0], d[1] - b[1], d[2] - b[2]];
    const nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    // orient outward: the cross product of the diagonals points inward for this winding
    const f = [-nn[0], -nn[1], -nn[2]];
    acc(i, j, f); acc(i, (j + 1) % C, f); acc(i + 1, (j + 1) % C, f); acc(i + 1, j, f);
  }
  for (const row of N) for (const t of row) { const l = Math.hypot(...t) || 1; t[0] /= l; t[1] /= l; t[2] /= l; }
  const pos = [], nor = [];
  const tri = (pa, na, pb, nb, pc, nc) => { pos.push(...pa, ...pb, ...pc); nor.push(...na, ...nb, ...nc); };
  for (let i = 0; i < R - 1; i++) for (let j = 0; j < C; j++) {
    const j1 = (j + 1) % C;
    const a = P[i][j], b = P[i][j1], c = P[i + 1][j1], d = P[i + 1][j];
    const na = N[i][j], nb = N[i][j1], nc = N[i + 1][j1], nd = N[i + 1][j];
    tri(a, na, d, nd, c, nc); tri(a, na, c, nc, b, nb);
  }
  // the caps: flat fans to each end row's centre
  for (const [i, up] of [[0, false], [R - 1, true]]) {
    const row = P[i]; let cx = 0, cz = 0;
    for (const p of row) { cx += p[0]; cz += p[2]; }
    const ctr = [cx / C, row[0][1], cz / C], n = [0, up ? 1 : -1, 0];
    for (let j = 0; j < C; j++) { const p = row[j], q = row[(j + 1) % C]; if (up) tri(ctr, n, q, n, p, n); else tri(ctr, n, p, n, q, n); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** Row heights from y0 to y1, `n` rows, crowded where `dense(y)` (≥ 1) is large. */
export function rows(y0, y1, n, dense = () => 1) {
  const S = 400, w = [];
  let tot = 0;
  for (let k = 0; k < S; k++) { const y = y0 + (y1 - y0) * (k + 0.5) / S; tot += dense(y); w.push(tot); }
  const out = [y0];
  for (let i = 1; i < n - 1; i++) { const t = tot * i / (n - 1); let k = w.findIndex((v) => v >= t); out.push(y0 + (y1 - y0) * (k + 0.5) / S); }
  out.push(y1);
  return out;
}
