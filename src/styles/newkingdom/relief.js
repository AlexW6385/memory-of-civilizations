// Continuous sunk relief (docs/settlements/thebes.md §14): one modelled surface laid over a wall or a column, a grid of cells whose heights come from the
// figures drawn on it — each figure cut in below the ground (its outline the deepest, the body rounded back up toward the middle) — and whose paint is the
// colour of the figure a cell belongs to. A scene is drawn in the plane of the surface (u along it, v up it) from shapes with a signed distance; the surface
// is a function of its inputs, so the same plan builds the same geometry. Flat stretches are single quads (planar surfaces).
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const sm = (t) => t * t * (3 - 2 * t);

// ---- shapes: { mat, sd(u, v) (negative inside), bb [u0, v0, u1, v1], sink (m below the ground at the outline), rise (0..1 of it given back inside), r (the rounding's reach, m) }
/** A tapered capsule from a to b, radius ra → rb. */
export function cap(mat, ax, ay, bx, by, ra, rb = ra, o = {}) {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9, m = Math.max(ra, rb);
  return { mat, ...o, bb: [Math.min(ax, bx) - m, Math.min(ay, by) - m, Math.max(ax, bx) + m, Math.max(ay, by) + m], r: o.r ?? m * 0.9,
    sd: (u, v) => { const h = clamp(((u - ax) * dx + (v - ay) * dy) / L2, 0, 1); return Math.hypot(u - ax - dx * h, v - ay - dy * h) - (ra + (rb - ra) * h); } };
}
/** An ellipse (approximate distance), turned by `rot`. */
export function elp(mat, cx, cy, rx, ry, rot = 0, o = {}) {
  const c = Math.cos(rot), s = Math.sin(rot), m = Math.max(rx, ry), k = Math.min(rx, ry);
  return { mat, ...o, bb: [cx - m, cy - m, cx + m, cy + m], r: o.r ?? k * 0.9,
    sd: (u, v) => { const x = ((u - cx) * c + (v - cy) * s) / rx, y = (-(u - cx) * s + (v - cy) * c) / ry; return (Math.hypot(x, y) - 1) * k; } };
}
/** A polygon, given as [[u, v]] (exact distance). */
export function pol(mat, pts, o = {}) {
  let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9;
  for (const [u, v] of pts) { u0 = Math.min(u0, u); v0 = Math.min(v0, v); u1 = Math.max(u1, u); v1 = Math.max(v1, v); }
  const n = pts.length;
  return { mat, ...o, bb: [u0, v0, u1, v1], r: o.r ?? Math.min(u1 - u0, v1 - v0) * 0.4,
    sd: (u, v) => {
      let d = 1e18, sgn = 1;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const ex = pts[j][0] - pts[i][0], ey = pts[j][1] - pts[i][1], wx = u - pts[i][0], wy = v - pts[i][1];
        const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey || 1e-9), 0, 1), bx = wx - ex * t, by = wy - ey * t;
        d = Math.min(d, bx * bx + by * by);
        const c1 = v >= pts[i][1], c2 = v < pts[j][1], c3 = ex * wy > ey * wx;
        if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) sgn = -sgn;
      }
      return sgn * Math.sqrt(d);
    } };
}
/** An axis-aligned rectangle. */
export function rct(mat, u0, v0, u1, v1, o = {}) {
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, hu = (u1 - u0) / 2, hv = (v1 - v0) / 2;
  return { mat, ...o, bb: [u0, v0, u1, v1], r: o.r ?? Math.min(hu, hv) * 0.8, sd: (u, v) => { const x = Math.abs(u - cu) - hu, y = Math.abs(v - cv) - hv; return Math.hypot(Math.max(x, 0), Math.max(y, 0)) + Math.min(Math.max(x, y), 0); } };
}

/**
 * The relief: { u0, u1, v0, v1 (the panel, m along the surface), cell (m), pos(u, v) → [x, y, z] of the surface, nrm(u, v) → its outward unit normal,
 * shapes (painted in order, later over earlier), field (the ground's material), frame (the edge's), off (the ground's height over the wall, m), sink (default depth at the outline),
 * planar (the surface is a plane: flat stretches become single quads) } → Map(material → geometry).
 */
export function relief(o) {
  const { u0, u1, v0, v1, cell, pos, nrm, shapes, field, frame = field, off = 0.09, sink = 0.07, planar = false } = o;
  const nu = Math.max(1, Math.ceil((u1 - u0) / cell)), nv = Math.max(1, Math.ceil((v1 - v0) / cell)), du = (u1 - u0) / nu, dv = (v1 - v0) / nv, w = 1.1 * Math.max(du, dv);
  const W = nu + 1, H = new Float32Array(W * (nv + 1));
  const near = (u, v) => shapes.filter((s) => u > s.bb[0] - w && u < s.bb[2] + w && v > s.bb[1] - w && v < s.bb[3] + w);
  // buckets of shapes by 1 m column, to keep the sampling cheap
  const bk = new Map(), BS = 1.0;
  shapes.forEach((s, i) => { for (let a = Math.floor((s.bb[0] - w - u0) / BS); a <= Math.floor((s.bb[2] + w - u0) / BS); a++) { if (!bk.has(a)) bk.set(a, []); bk.get(a).push(i); } });
  const cand = (u, v) => (bk.get(Math.floor((u - u0) / BS)) ?? []).filter((i) => { const s = shapes[i]; return v > s.bb[1] - w && v < s.bb[3] + w && u > s.bb[0] - w && u < s.bb[2] + w; });
  void near;
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = u0 + i * du, v = v0 + j * dv;
    let h = off;
    for (const k of cand(u, v)) {
      const s = shapes[k], d = s.sd(u, v), f = clamp(0.5 - d / w, 0, 1);
      if (f <= 0) continue;
      const sk = s.sink ?? sink, tgt = off - sk * (1 - (s.rise ?? 0.45) * sm(clamp(-d / (s.r ?? 0.2), 0, 1)));
      h += (tgt - h) * f;
    }
    H[j * W + i] = h;
  }
  const mats = new Map(), out = (m) => { if (!mats.has(m)) mats.set(m, { P: [], N: [] }); return mats.get(m); };
  const cellMat = (u, v) => { let m = field; for (const k of cand(u, v)) { const s = shapes[k]; if (s.sd(u, v) <= 0) m = s.mat; } return m; };
  const flat = new Uint8Array(nu * nv), cm = new Array(nu * nv);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const m = cellMat(u0 + (i + 0.5) * du, v0 + (j + 0.5) * dv); cm[j * nv * 0 + j * nu + i] = m; flat[j * nu + i] = m === field && H[j * W + i] === off && H[j * W + i + 1] === off && H[(j + 1) * W + i] === off && H[(j + 1) * W + i + 1] === off ? 1 : 0; }
  const at = (i, j) => { const u = u0 + i * du, v = v0 + j * dv, p = pos(u, v), n = nrm(u, v), h = H[j * W + i]; return [p[0] + n[0] * h, p[1] + n[1] * h, p[2] + n[2] * h]; };
  const normal = (i, j) => {
    const u = u0 + i * du, v = v0 + j * dv, n = nrm(u, v), pu0 = pos(u - du, v), pu1 = pos(u + du, v), pv0 = pos(u, v - dv), pv1 = pos(u, v + dv);
    const tu = [pu1[0] - pu0[0], pu1[1] - pu0[1], pu1[2] - pu0[2]], tv = [pv1[0] - pv0[0], pv1[1] - pv0[1], pv1[2] - pv0[2]], lu = Math.hypot(...tu) || 1, lv = Math.hypot(...tv) || 1;
    const hu = (H[j * W + Math.min(nu, i + 1)] - H[j * W + Math.max(0, i - 1)]) / ((Math.min(nu, i + 1) - Math.max(0, i - 1)) * du), hv = (H[Math.min(nv, j + 1) * W + i] - H[Math.max(0, j - 1) * W + i]) / ((Math.min(nv, j + 1) - Math.max(0, j - 1)) * dv);
    const q = [n[0] - hu * tu[0] / lu - hv * tv[0] / lv, n[1] - hu * tu[1] / lu - hv * tv[1] / lv, n[2] - hu * tu[2] / lu - hv * tv[2] / lv], l = Math.hypot(...q) || 1;
    return [q[0] / l, q[1] / l, q[2] / l];
  };
  const tri = (m, a, b, c, na, nb, nc) => { const o2 = out(m); o2.P.push(...a, ...b, ...c); o2.N.push(...na, ...nb, ...nc); };
  // winding: counter-clockwise seen along the normal; checked once and flipped if the panel's u × v runs against the normal
  const p00 = pos(u0, v0), pu = pos(u0 + du, v0), pv = pos(u0, v0 + dv), nn = nrm(u0, v0);
  const e1 = [pu[0] - p00[0], pu[1] - p00[1], pu[2] - p00[2]], e2 = [pv[0] - p00[0], pv[1] - p00[1], pv[2] - p00[2]];
  const cx = e1[1] * e2[2] - e1[2] * e2[1], cy = e1[2] * e2[0] - e1[0] * e2[2], cz = e1[0] * e2[1] - e1[1] * e2[0], flip = cx * nn[0] + cy * nn[1] + cz * nn[2] < 0;
  const quadT = (m, A, B, C, D, nA, nB, nC, nD) => { if (flip) { tri(m, A, C, B, nA, nC, nB); tri(m, A, D, C, nA, nD, nC); } else { tri(m, A, B, C, nA, nB, nC); tri(m, A, C, D, nA, nC, nD); } };
  const done = new Uint8Array(nu * nv);
  // flat stretches as single quads: blocks of 8, then 4, then 2 cells a side
  if (planar) for (const BL of [8, 4, 2]) for (let j0 = 0; j0 + BL <= nv; j0 += BL) for (let i0 = 0; i0 + BL <= nu; i0 += BL) {
    let ok = true;
    for (let j = j0; j < j0 + BL && ok; j++) for (let i = i0; i < i0 + BL; i++) if (!flat[j * nu + i] || done[j * nu + i]) { ok = false; break; }
    if (!ok) continue;
    for (let j = j0; j < j0 + BL; j++) for (let i = i0; i < i0 + BL; i++) done[j * nu + i] = 1;
    const A = at(i0, j0), B = at(i0 + BL, j0), C = at(i0 + BL, j0 + BL), D = at(i0, j0 + BL), n = nrm(u0 + i0 * du, v0 + j0 * dv);
    quadT(field, A, B, C, D, n, n, n, n);
  }
  const NR = new Map(), nrmAt = (i, j) => { const k = j * W + i; if (!NR.has(k)) NR.set(k, normal(i, j)); return NR.get(k); };
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    if (done[j * nu + i]) continue;
    const m = cm[j * nu + i];
    quadT(m, at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1), nrmAt(i, j), nrmAt(i + 1, j), nrmAt(i + 1, j + 1), nrmAt(i, j + 1));
  }
  // the edge: the ground's rim down to the wall on the four sides
  const rim = (i0, j0, i1, j1, out_) => {
    const n = Math.max(Math.abs(i1 - i0), Math.abs(j1 - j0));
    for (let k = 0; k < n; k++) {
      const a = [i0 + Math.sign(i1 - i0) * k, j0 + Math.sign(j1 - j0) * k], b = [i0 + Math.sign(i1 - i0) * (k + 1), j0 + Math.sign(j1 - j0) * (k + 1)];
      const Pa = at(a[0], a[1]), Pb = at(b[0], b[1]), pa = pos(u0 + a[0] * du, v0 + a[1] * dv), pb = pos(u0 + b[0] * du, v0 + b[1] * dv);
      const e = [Pb[0] - Pa[0], Pb[1] - Pa[1], Pb[2] - Pa[2]], nA = nrm(u0 + a[0] * du, v0 + a[1] * dv), s = [e[1] * nA[2] - e[2] * nA[1], e[2] * nA[0] - e[0] * nA[2], e[0] * nA[1] - e[1] * nA[0]], l = Math.hypot(...s) || 1, sn = [s[0] / l * out_, s[1] / l * out_, s[2] / l * out_];
      tri(frame, Pa, pb, Pb, sn, sn, sn); tri(frame, Pa, pa, pb, sn, sn, sn);
    }
  };
  rim(0, 0, nu, 0, 1); rim(nu, 0, nu, nv, 1); rim(nu, nv, 0, nv, 1); rim(0, nv, 0, 0, 1);
  const res = new Map();
  for (const [m, { P, N }] of mats) {
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3)); res.set(m, g);
  }
  return res;
}
