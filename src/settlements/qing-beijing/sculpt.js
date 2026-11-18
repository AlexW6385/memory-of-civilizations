// Modelling kit for the Beijing sculpture (docs/settlements/qing-beijing.md §37): smooth lofted tubes with per-vertex sections
// (limbs with muscle, scaled dragon bodies, horns, whiskers, claws), ellipsoids with a warp (heads, paws), spirals (cloud scrolls,
// snail curls, waves). Every piece is a BufferGeometry with position and normal (merged by Parts). Nothing here keeps state between
// builds: variation comes from hashes of a piece's own position or index, never from a counter or Math.random, so that a plan builds
// the same geometry every time (the light bake depends on it).
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** A hash of up to three numbers in [0, 1): the variation of a piece comes from where it is. */
export const h01 = (x, y = 0, z = 0) => { const t = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return t - Math.floor(t); };

/**
 * A mesh from rows of points (rows[i][j]); a row of one point is an apex. wrap: the columns close into rings. Smooth normals,
 * the faces turned outward of the mesh's middle (so that a row order that comes out inside-out is put right).
 */
export function mesh(rows, wrap = true) {
  const pos = [], idx = [], id = rows.map((r) => r.map((p) => { pos.push(p[0], p[1], p[2]); return pos.length / 3 - 1; }));
  for (let i = 0; i + 1 < rows.length; i++) {
    const A = id[i], B = id[i + 1], n = Math.max(A.length, B.length), last = wrap ? n : n - 1;
    for (let j = 0; j < last; j++) {
      const j1 = (j + 1) % n, a = A[A.length === 1 ? 0 : j], a1 = A[A.length === 1 ? 0 : j1], b = B[B.length === 1 ? 0 : j], b1 = B[B.length === 1 ? 0 : j1];
      if (a !== a1 && a1 !== b1) idx.push(a, a1, b1);
      if (b !== b1 && a !== b1) idx.push(a, b1, b);
    }
  }
  const nv = pos.length / 3, nor = new Float32Array(nv * 3);
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < pos.length; i += 3) { cx += pos[i]; cy += pos[i + 1]; cz += pos[i + 2]; }
  cx /= nv; cy /= nv; cz /= nv;
  let sgn = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    sgn += nx * (pos[a] - cx) + ny * (pos[a + 1] - cy) + nz * (pos[a + 2] - cz);
    for (const q of [a, b, c]) { nor[q] += nx; nor[q + 1] += ny; nor[q + 2] += nz; }
  }
  if (sgn < 0) { for (let t = 0; t < idx.length; t += 3) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; } for (let i = 0; i < nor.length; i++) nor[i] = -nor[i]; }
  for (let i = 0; i < nor.length; i += 3) { const l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1; nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l; }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** A Catmull–Rom curve through pts (2 or 3 numbers each), `per` samples a span. */
export function spline(pts, per = 6) {
  const out = [], n = pts.length, d = pts[0].length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t, q = [];
      for (let c = 0; c < d; c++) q.push(0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
      out.push(q);
    }
  }
  out.push(pts[n - 1].slice());
  return out;
}
/** The curve resampled at an even step along its length (points the same length apart). */
export function resample(pts, step) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(...pts[i].map((v, c) => v - pts[i - 1][c])));
  const total = L[L.length - 1], n = Math.max(2, Math.round(total / step)), out = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const s = total * k / n;
    while (j < pts.length - 2 && L[j + 1] < s) j++;
    const f = (s - L[j]) / ((L[j + 1] - L[j]) || 1);
    out.push(pts[j].map((v, c) => v + (pts[j + 1][c] - v) * f));
  }
  return out;
}

/**
 * A tube along `path` (points [x, y, z]); sec(t, th, i) the section's offset [side, up] at fraction t of the path and angle th round it
 * (or one number: a round radius). up: the direction the section's "up" is kept near (the surface's normal, for a relief).
 */
export function tube(path, sec, n = 10, { up = [0, 1, 0], capA = true, capB = true, capLen = 0.5 } = {}) {
  const m = path.length, rows = [];
  let U = up.slice();
  for (let i = 0; i < m; i++) {
    const T = norm(sub(path[Math.min(m - 1, i + 1)], path[Math.max(0, i - 1)]));
    let S = cross(T, U); if (len(S) < 1e-4) S = cross(T, Math.abs(T[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
    S = norm(S); U = norm(cross(S, T));
    const row = [];
    for (let j = 0; j < n; j++) {
      const th = j / n * Math.PI * 2, o = sec(i / (m - 1), th, i), a = typeof o === 'number' ? Math.cos(th) * o : o[0], b = typeof o === 'number' ? Math.sin(th) * o : o[1];
      row.push([path[i][0] + S[0] * a + U[0] * b, path[i][1] + S[1] * a + U[1] * b, path[i][2] + S[2] * a + U[2] * b]);
    }
    rows.push(row);
  }
  if (capA) { const T = norm(sub(path[0], path[Math.min(1, m - 1)])), r = Math.max(...rows[0].map((p) => len(sub(p, path[0])))); rows.unshift([add(path[0], T, r * capLen)]); }
  if (capB) { const T = norm(sub(path[m - 1], path[Math.max(0, m - 2)])), r = Math.max(...rows[rows.length - 1].map((p) => len(sub(p, path[m - 1])))); rows.push([add(path[m - 1], T, r * capLen)]); }
  return mesh(rows, true);
}
/** A straight round limb from a to b, radius r0 → r1 (n sides). */
export function rod(a, b, r0, r1 = r0, n = 7, o = {}) { return tube([a, lerp(a, b, 0.5), b], (t) => r0 + (r1 - r0) * t, n, o); }
/**
 * A smooth tapering curve through pts: radius r0 → r1 with an optional swell (a muscle: `swell` of the radius at the middle),
 * round (or flattened by `flat` across `up`).
 */
export function curve(pts, r0, r1 = r0, { swell = 0, per = 4, n = 7, flat = 1, up, capA = true, capB = true } = {}) {
  const p = pts.length > 2 || per > 1 ? spline(pts, per) : pts;
  return tube(p, (t, th) => { const r = (r0 + (r1 - r0) * t) * (1 + swell * Math.sin(Math.PI * t)); return [Math.cos(th) * r, Math.sin(th) * r * flat]; }, n, { up, capA, capB });
}
/** An ellipsoid at c with radii r = [a, b, c] along the axes ax = [f, s, u] (unit vectors), n × m; warp(x, y, z) a radial factor. */
export function ell(c, r, ax = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], n = 8, m = 5, warp = null) {
  const rows = [];
  for (let i = 0; i <= m; i++) {
    const ph = Math.PI * i / m, cx = Math.cos(ph), sx = Math.sin(ph);
    if (i === 0 || i === m) { const q = [cx, 0, 0], k = warp ? warp(...q) : 1; rows.push([add(c, ax[0], cx * r[0] * k)]); continue; }
    const row = [];
    for (let j = 0; j < n; j++) {
      const th = j / n * Math.PI * 2, q = [cx, sx * Math.cos(th), sx * Math.sin(th)], k = warp ? warp(...q) : 1;
      row.push(add(add(add(c, ax[0], q[0] * r[0] * k), ax[1], q[1] * r[1] * k), ax[2], q[2] * r[2] * k));
    }
    rows.push(row);
  }
  return mesh(rows, true);
}
/** A cone from base b to tip t, base radius r (a tooth, a claw), n sides, its axis curved by `bend` (a vector added at the tip). */
export function cone(b, t, r, n = 5, bend = null) {
  const mid = lerp(b, t, 0.5), m2 = bend ? add(mid, bend, 0.35) : mid, t2 = bend ? add(t, bend) : t;
  return tube([b, m2, t2], (k) => r * (1 - k * 0.92), n, { capA: false, capB: true, capLen: 0.2 });
}
/** A frame: local → world placement by an origin, three axes (unit) and a scale. */
export function frame(o, x, y, z, s = 1) {
  const p = (q) => [o[0] + (x[0] * q[0] + y[0] * q[1] + z[0] * q[2]) * s, o[1] + (x[1] * q[0] + y[1] * q[1] + z[1] * q[2]) * s, o[2] + (x[2] * q[0] + y[2] * q[1] + z[2] * q[2]) * s];
  const d = (q) => [x[0] * q[0] + y[0] * q[1] + z[0] * q[2], x[1] * q[0] + y[1] * q[1] + z[1] * q[2], x[2] * q[0] + y[2] * q[1] + z[2] * q[2]];
  return { p, d, s, ax: [x, y, z] };
}
/** An ellipsoid given in a frame's local terms. */
export const fell = (F, c, r, n = 8, m = 5, warp = null) => ell(F.p(c), mul(r, F.s), F.ax, n, m, warp);
/** A curve given in a frame's local terms (radii in local units). */
export const fcurve = (F, pts, r0, r1, o = {}) => curve(pts.map(F.p), r0 * F.s, r1 * F.s, o);
export const frod = (F, a, b, r0, r1, n = 6) => rod(F.p(a), F.p(b), r0 * F.s, r1 * F.s, n);
export const fcone = (F, b, t, r, n = 5, bend = null) => cone(F.p(b), F.p(t), r * F.s, n, bend && F.d(bend));
/** A torus of major radius R, minor r about the axis ax through c. */
export function ring(c, R, r, ax = [0, 1, 0], n = 16, m = 5, start = 0, span = Math.PI * 2) {
  const a = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], u = norm(cross(ax, a)), v = cross(ax, u), rows = [];
  const N = Math.max(3, Math.round(n * span / (Math.PI * 2)));
  for (let i = 0; i <= N; i++) {
    const th = start + span * i / N, ct = Math.cos(th), st = Math.sin(th), row = [];
    for (let j = 0; j < m; j++) {
      const ph = j / m * Math.PI * 2, rr = R + Math.cos(ph) * r;
      row.push([c[0] + (u[0] * ct + v[0] * st) * rr + ax[0] * Math.sin(ph) * r, c[1] + (u[1] * ct + v[1] * st) * rr + ax[1] * Math.sin(ph) * r, c[2] + (u[2] * ct + v[2] * st) * rr + ax[2] * Math.sin(ph) * r]);
    }
    rows.push(row);
  }
  if (span >= Math.PI * 2 - 1e-6) rows.pop();
  return mesh(rows, true);
}

/** Merge several geometries into one (positions and normals), the indexed ones expanded. */
export function join(list) {
  const gs = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of gs) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return m;
}
/** The triangles of a geometry (indexed or not). */
export const triCount = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

// ── relief: bodies, clouds, waves ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A relief is built in the plane of its stone: x and y along the surface, z out of it (z = 0 the surface). A body's section is a
// half-ellipse standing out of the stone; the half behind the surface is sunk 2 cm into it (hidden, so that nothing is coplanar).
const SINK = -0.02;
/**
 * A body along a planar path (points [x, y]) of half-width w(t) and height h(t) above the stone, its surface laid with overlapping
 * scales when `scales` (a pitch along the body): each scale rises a little at its leading edge and falls away behind it, in rows that
 * are staggered across; `lift` raises the shell off the plain body (the fine layer sits on the reduced one).
 */
export function reliefBody(path, w, h, { n = 12, scales = 0, lift = 0, z0 = 0, ridge = 0.12 } = {}) {
  const P = path.map(([x, y]) => [x, y, z0]);
  let L = 0; const S = [0];
  for (let i = 1; i < P.length; i++) { L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); S.push(L); }
  return tube(P, (t, th, i) => {
    const c = Math.cos(th), s = Math.sin(th), ww = w(t), hh = h(t);
    if (s < 0) return [c * ww, SINK];
    // the dorsal ridge: the back's middle a little higher; the belly's scutes by the sides
    let out = hh * Math.pow(s, 0.8) * (1 + ridge * Math.max(0, 1 - Math.abs(c) * 3));
    if (scales) {
      const row = Math.floor((th / Math.PI) * 5 + 0.5), ph = S[i] / scales + (row & 1) * 0.5, f = ph - Math.floor(ph);
      out *= 1 + 0.16 * (f - 0.5) * Math.min(1, s * 3) + 0.04 * Math.cos(th * 5) * s;
    }
    return [c * ww, out + (lift && s > 0.05 ? lift * Math.min(1, s * 4) : 0)];
  }, n, { up: [0, 0, 1], capA: true, capB: true, capLen: 0.6 });
}
/** The planar tube of a flame, whisker or cloud tail: a curve of [x, y] points with a half-round section standing out of the stone. */
export function reliefLine(path, w0, w1, h, { n = 6, z0 = 0, swell = 0 } = {}) {
  const P = path.map(([x, y]) => [x, y, z0]);
  return tube(P, (t, th) => {
    const c = Math.cos(th), s = Math.sin(th), ww = (w0 + (w1 - w0) * t) * (1 + swell * Math.sin(Math.PI * t));
    return [c * ww, s < 0 ? SINK : s * Math.min(h, ww * 1.1)];
  }, n, { up: [0, 0, 1], capA: true, capB: true, capLen: 0.3 });
}
/** A cloud scroll (ruyi) in relief: a head of three spiral lobes and a curling tail; at (x, y), `w` wide, rising `h` off the stone. */
export function cloudScroll(x, y, w, h, flip = 1, z0 = 0) {
  const out = [], sp = (cx, cy, r0, turns, dir, ph, wd) => {
    const pts = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8, a = ph + dir * t * turns * Math.PI * 2, r = r0 * (1 - 0.82 * t); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    out.push(reliefLine(pts, wd, wd * 0.6, h, { n: 5, z0 }));
  };
  const f = flip;
  sp(x, y, w * 0.28, 1.1, 1, Math.PI * 0.5, w * 0.075);                                    // the middle lobe
  sp(x - f * w * 0.3, y - w * 0.12, w * 0.2, 1.0, -f, Math.PI * 0.5, w * 0.06);                // the side lobes
  sp(x + f * w * 0.3, y - w * 0.12, w * 0.2, 1.0, f, Math.PI * 0.5, w * 0.06);
  const tail = spline([[x, y - w * 0.28], [x + f * w * 0.12, y - w * 0.5], [x + f * w * 0.5, y - w * 0.6], [x + f * w * 0.75, y - w * 0.45], [x + f * w * 0.72, y - w * 0.3]], 2);
  out.push(reliefLine(tail, w * 0.06, w * 0.025, h, { n: 5, z0 }));
  return out;
}
/** A breaking wave in relief: a curl of spiral crest over a swelling back, `w` wide; at (x, y) its foot. */
export function waveCurl(x, y, w, h, flip = 1, z0 = 0) {
  const out = [], f = flip;
  const crest = [];
  for (let k = 0; k <= 9; k++) { const t = k / 9, a = Math.PI * (1.15 - 1.55 * t), r = w * 0.32 * (1 - 0.62 * t); crest.push([x + f * (w * 0.1 + Math.cos(a) * r), y + w * 0.3 + Math.sin(a) * r * 0.9]); }
  out.push(reliefLine(crest, w * 0.07, w * 0.03, h, { n: 5, z0 }));
  out.push(reliefLine(spline([[x - f * w * 0.5, y], [x - f * w * 0.2, y + w * 0.12], [x + f * w * 0.05, y + w * 0.4], [x + f * w * 0.1, y + w * 0.62]], 2), w * 0.09, w * 0.06, h, { n: 5, z0 }));
  out.push(reliefLine(spline([[x - f * w * 0.1, y + w * 0.05], [x + f * w * 0.3, y + w * 0.1], [x + f * w * 0.5, y]], 2), w * 0.05, w * 0.02, h * 0.8, { n: 4, z0 }));
  return out;
}
/** A small round boss or pearl with `rays` flames, the geometry list; at (x, y, z). */
export function pearl(x, y, z, r, rays = 6, ph = 0) {
  const out = [ell([x, y, z], [r, r, r], undefined, 12, 7)];
  for (let k = 0; k < rays; k++) {
    const a = ph + k / rays * Math.PI * 2, d = [Math.cos(a), Math.sin(a), 0], q = [-d[1], d[0], 0];
    const base = add([x, y, z], d, r * 0.85), c = [add(base, q, 0), add(add(base, d, r * 0.7), q, r * 0.25 * (k % 2 ? 1 : -1)), add(add(base, d, r * 1.4), q, r * 0.08)];
    out.push(tube(spline(c, 3), (t) => r * 0.3 * (1 - t * 0.9), 5, { up: [0, 0, 1], capA: false }));
  }
  return out;
}
