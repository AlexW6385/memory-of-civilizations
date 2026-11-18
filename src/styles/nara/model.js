// Modelling kit for the Nara sculpture (docs/settlements/nara.md §19): lofted tubes with per-ring sections, ellipsoids with a warp,
// splines, and the figure parts shared by the Great Buddha, the attendants, the guardian kings and the lantern's reliefs (a head
// with its face modelled as a displaced surface, a hand with its fingers). Every piece is a BufferGeometry with position and
// normal. Nothing here keeps state between builds: variation comes from hashes of a piece's own position or index, never from a
// counter or Math.random, so that a plan builds the same geometry every time (the light bake depends on it).
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

// ── the parts shared by the figures ───────────────────────────────────────────────────────────────────────────────────────────────
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export { smooth };
/** The pleat of a drapery: a rounded ridge between hollows, phase φ (a whole number is a crest), in [−0.4, 1]. */
export const pleat = (phi) => Math.pow((1 + Math.cos(phi * Math.PI * 2)) / 2, 1.4) * 1.4 - 0.4;
/** Interpolated r at height y along a profile [[r, y], …] rising in y. */
export function radiusAt(prof, y) {
  if (y <= prof[0][1]) return prof[0][0];
  for (let i = 0; i < prof.length - 1; i++) if (y <= prof[i + 1][1]) return prof[i][0] + (prof[i + 1][0] - prof[i][0]) * (y - prof[i][1]) / ((prof[i + 1][1] - prof[i][1]) || 1);
  return prof[prof.length - 1][0];
}
/**
 * A shell of revolution about a vertical axis (a trunk, a skirt, a neck, a lap) with the sections squashed by kz in depth and its surface
 * pushed in or out by disp(a, y, r) (a = 0 the front, positive toward +x; r the section's radius): the drapery's folds, the muscles.
 * The profile is smoothed (a spline through its points) and cut in `rows` rings; the columns crowd at the front when `front`.
 */
export function shell(prof, { n = 48, rows = 24, kz = 1, c = [0, 0, 0], disp = null, front = 1.4, cap = true } = {}) {
  const sp = spline(prof.map(([r, y]) => [r, y]), 6), ys = sp.map((p) => p[1]), R = [];
  const y0 = prof[0][1], y1 = prof[prof.length - 1][1];
  for (let i = 0; i <= rows; i++) {
    const y = y0 + (y1 - y0) * i / rows; let r = sp[sp.length - 1][0];
    for (let k = 0; k < sp.length - 1; k++) if (y <= ys[k + 1] + 1e-9 && ys[k + 1] > ys[k]) { r = sp[k][0] + (sp[k + 1][0] - sp[k][0]) * (y - ys[k]) / (ys[k + 1] - ys[k]); break; }
    R.push([y, Math.max(r, 0.0015)]);
  }
  const rowsP = R.map(([y, r]) => {
    const row = [];
    for (let j = 0; j < n; j++) {
      const s = 2 * j / n - 1, a = Math.PI * Math.sign(s) * Math.pow(Math.abs(s), front), d = disp ? disp(a, y, r) : 0, rr = r + d;
      row.push([c[0] + Math.sin(a) * rr, y + c[1], c[2] + Math.cos(a) * rr * kz]);
    }
    return row;
  });
  if (cap) { const top = R[R.length - 1]; if (top[1] > 0.01) rowsP.push([[c[0], top[0] + c[1] + top[1] * 0.3, c[2]]]); const bot = R[0]; if (bot[1] > 0.01) rowsP.unshift([[c[0], bot[0] + c[1] - bot[1] * 0.1, c[2]]]); }
  return mesh(rowsP, true);
}
/**
 * A face as a field of soft bumps and hollows on a head's surface: feats = [[u, v, su, sv, amp, tilt], …] with u across (to the
 * figure's left), v up from the chin, in the head's own units (× k); returns the push (m, outward) at a point (u, v).
 */
export function faceField(feats, k = 1) {
  return (u, v) => {
    let d = 0;
    for (const [fu, fv, su, sv, amp, th = 0] of feats) {
      let du = (u / k - fu), dv = (v / k - fv);
      if (th) { const c = Math.cos(th), s = Math.sin(th); [du, dv] = [du * c + dv * s, -du * s + dv * c]; }
      d += amp * Math.exp(-0.5 * ((du / su) ** 2 + (dv / sv) ** 2));
    }
    return d * k;
  };
}
/** Gaussians strung along a curve (pts [u, v]) of width s and amplitude amp: a brow, a lid, a fold. */
export function strand(pts, s, amp, per = 4) {
  return spline(pts, per).map((p) => [p[0], p[1], s * 1.6, s, amp * 0.55, 0]);
}
/** A head: the profile (r, y) of its skull, depth squashed by kz, centred at c, its face given by field(u, v) (v measured from chinY). */
export function head(prof, { c = [0, 0, 0], kz = 1, field, chinY, n = 120, rows = 70, front = 1.5 }) {
  const f = (a, y, r) => {
    const ca = Math.cos(a); if (ca <= 0.05) return 0;
    const u = r * Math.sin(a);
    return field(u, y - chinY) * smooth(0.05, 0.45, ca);
  };
  return shell(prof, { n, rows, kz, c, disp: f, front });
}
/**
 * A hand in a frame F (frame(o, x, y, z, s)): local x toward the thumb, y toward the fingertips, z out of the palm; the wrist at the
 * origin, the palm 1 wide and 0.95 long, the middle finger 0.95; curl: how far each finger folds toward the palm (0 straight, 1 a fist);
 * spread: the fingers fanned; thumb: [out, forward] in radians. Returns a list of geometries.
 */
export function hand(F, { curl = [0, 0, 0, 0], spread = 0.1, thumb = [0.7, 0.25], thumbCurl = 0.2, n = 7, sink = 0 } = {}) {
  const out = [], P = (x, y, z) => F.p([x, y, z]);
  const blob = (c, r) => ell(P(...c), mul(r, F.s), F.ax, 12, 7);
  out.push(blob([0, 0.44, 0 - sink], [0.5, 0.52, 0.17]));                                     // the palm and the back of the hand
  out.push(blob([0.3, 0.26, 0.1 - sink], [0.22, 0.3, 0.1]));                                  // the ball of the thumb
  out.push(blob([-0.22, 0.2, 0.09 - sink], [0.2, 0.24, 0.07]));                               // the heel of the hand
  out.push(curve([P(0, -0.55, 0), P(0, -0.2, 0), P(0, 0.15, 0)], 0.26 * F.s, 0.36 * F.s, { n, per: 2, flat: 0.8, up: F.ax[2] }));   // the wrist and forearm's end
  const xs = [0.36, 0.12, -0.12, -0.35], L = [0.86, 0.96, 0.88, 0.68], ph = [0.44, 0.31, 0.25];
  for (let i = 0; i < 4; i++) {
    const rad = 0.105 - i * 0.004, ang = (1.5 - i) * spread * -1 * 0.0 + (i - 1.5) * -spread, pts = [[xs[i], 0.9, 0.0]];
    let x = xs[i], y = 0.9, z = 0, th = 0;
    for (let j = 0; j < 3; j++) {
      const l = ph[j] * L[i] / 0.95 * 0.98;
      th += curl[i] * [0.5, 1.0, 0.7][j];
      x += Math.sin(ang) * l * Math.cos(th); y += Math.cos(ang) * l * Math.cos(th); z += l * Math.sin(th);
      pts.push([x, y, z]);
    }
    const pp = pts.map((q) => P(...q));
    out.push(curve(pp, rad * F.s, rad * 0.7 * F.s, { n: 8, per: 4, flat: 0.9, up: F.ax[2], swell: 0.03 }));
    for (let j = 1; j < 3; j++) out.push(blob(pts[j], [rad * 0.98, rad * 0.98, rad * 0.9]));    // the knuckles
  }
  // the thumb: from the ball of the palm outward and forward
  { const a0 = [0.4, 0.3, 0.1], d = [Math.sin(thumb[0]), Math.cos(thumb[0]) * Math.cos(thumb[1]), Math.sin(thumb[1]) * 0.8], pts = [a0];
    let q = a0, dd = d.slice();
    for (let j = 0; j < 2; j++) { const l = [0.38, 0.32][j]; q = [q[0] + dd[0] * l, q[1] + dd[1] * l, q[2] + dd[2] * l]; pts.push(q); dd = [dd[0] - thumbCurl * 0.5, dd[1], dd[2] + thumbCurl * 0.6]; }
    out.push(curve(pts.map((p) => P(...p)), 0.14 * F.s, 0.095 * F.s, { n, per: 3, flat: 0.9, up: F.ax[2], swell: 0.06 }));
    out.push(blob(pts[1], [0.14, 0.14, 0.12])); }
  return out;
}
