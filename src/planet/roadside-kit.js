// Low-poly solids for the country along the roads (src/planet/roadside-build.js): boxes, roofs,
// cones, domes and blobs emitted into one vertex-coloured mesh, in planet coordinates. Pure (no
// three.js): it runs in the roadside worker. Each vertex carries its colour in the summer (`col`),
// its colour out of season (`alt`) and `ses` = [hemisphere × how temperate the place is, how much of
// the colour is an annual crop's, roughness] — the material (src/planet/roadside.js) mixes them by
// the season of the open country (ENV.seasonWinter / seasonAutumn).

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const COLORS = new Map();
/** A colour '#rrggbb' as linear [r, g, b]. */
export function rgb(hex) {
  let c = COLORS.get(hex);
  if (!c) { const n = parseInt(hex.slice(1), 16); c = [lin((n >> 16) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)]; COLORS.set(hex, c); }
  return c;
}
/** A paint: colour (and its out-of-season colour), how annual it is (0 stays, 1 follows the crop's year), roughness. */
export function paint(hex, alt = hex, annual = 0, rough = 0.9) { return { c: rgb(hex), a: rgb(alt), y: annual, r: rough }; }
/** A paint with its colour varied by v (−1…1) in lightness. */
export function shade(p, v) { const k = 1 + v * 0.22; return { c: p.c.map((x) => x * k), a: p.a.map((x) => x * k), y: p.y, r: p.r }; }

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** A local frame at planet point P: x along S (right), y along U (up), z along F (forward). */
export class Frame {
  constructor(P, F, S, U) { this.P = P; this.F = F; this.S = S; this.U = U; }
  at(x, y, z) {
    const { P, F, S, U } = this;
    return [P[0] + S[0] * x + U[0] * y + F[0] * z, P[1] + S[1] * x + U[1] * y + F[1] * z, P[2] + S[2] * x + U[2] * y + F[2] * z];
  }
}

/** The mesh: unshared flat-shaded faces (smooth ones where a caller gives normals), appended in order. */
export class Mesh {
  constructor(hemi = 0) {
    this.hemi = hemi;
    this.pos = []; this.nrm = []; this.col = []; this.alt = []; this.ses = []; this.idx = [];
    this.n = 0;
  }
  get tris() { return this.idx.length / 3; }
  vert(p, n, pt) {
    this.pos.push(p[0], p[1], p[2]); this.nrm.push(n[0], n[1], n[2]);
    this.col.push(pt.c[0], pt.c[1], pt.c[2]); this.alt.push(pt.a[0], pt.a[1], pt.a[2]);
    this.ses.push(this.hemi, pt.y, pt.r);
    return this.n++;
  }
  /** A triangle, wound to face away from the interior point o (or as given when o is omitted). */
  tri(p0, p1, p2, pt, o) {
    let n = crs(sub(p1, p0), sub(p2, p0));
    const l = Math.hypot(n[0], n[1], n[2]);
    if (l < 1e-9) return;
    n = [n[0] / l, n[1] / l, n[2] / l];
    if (o && dt(n, sub(p0, o)) < 0) { [p1, p2] = [p2, p1]; n = [-n[0], -n[1], -n[2]]; }
    const a = this.vert(p0, n, pt), b = this.vert(p1, n, pt), c = this.vert(p2, n, pt);
    this.idx.push(a, b, c);
  }
  /** A quad p0 p1 p2 p3 (in order round it), facing away from o. */
  quad(p0, p1, p2, p3, pt, o) {
    let n = crs(sub(p2, p0), sub(p3, p1));
    const l = Math.hypot(n[0], n[1], n[2]);
    if (l < 1e-9) { this.tri(p0, p1, p2, pt, o); this.tri(p0, p2, p3, pt, o); return; }
    n = [n[0] / l, n[1] / l, n[2] / l];
    if (o && dt(n, sub(p0, o)) < 0) { [p1, p3] = [p3, p1]; n = [-n[0], -n[1], -n[2]]; }
    const a = this.vert(p0, n, pt), b = this.vert(p1, n, pt), c = this.vert(p2, n, pt), d = this.vert(p3, n, pt);
    this.idx.push(a, b, c, a, c, d);
  }
  /** A quad seen from both sides (a leaf, a frond, a banner). */
  card(p0, p1, p2, p3, pt) {
    const o1 = [(p0[0] + p1[0] + p2[0] + p3[0]) / 4, (p0[1] + p1[1] + p2[1] + p3[1]) / 4, (p0[2] + p1[2] + p2[2] + p3[2]) / 4];
    const n = crs(sub(p2, p0), sub(p3, p1));
    const o = [o1[0] - n[0], o1[1] - n[1], o1[2] - n[2]], o2 = [o1[0] + n[0], o1[1] + n[1], o1[2] + n[2]];
    this.quad(p0, p1, p2, p3, pt, o); this.quad(p0, p1, p2, p3, pt, o2);
  }
}

/** A box, its faces away from its middle (the bottom only if asked for). */
export function box(m, f, x0, x1, y0, y1, z0, z1, pt, bottom = false) {
  const c = (x, y, z) => f.at(x, y, z), o = f.at((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.quad(c(x0, y1, z0), c(x1, y1, z0), c(x1, y1, z1), c(x0, y1, z1), pt, o);
  m.quad(c(x0, y0, z0), c(x1, y0, z0), c(x1, y1, z0), c(x0, y1, z0), pt, o);
  m.quad(c(x0, y0, z1), c(x1, y0, z1), c(x1, y1, z1), c(x0, y1, z1), pt, o);
  m.quad(c(x0, y0, z0), c(x0, y0, z1), c(x0, y1, z1), c(x0, y1, z0), pt, o);
  m.quad(c(x1, y0, z0), c(x1, y0, z1), c(x1, y1, z1), c(x1, y1, z0), pt, o);
  if (bottom) m.quad(c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1), pt, o);
}

/** A frustum of a rectangle: base x0..x1 × z0..z1 at y0, top (centred on the base) tw × tl wide at y1 — hip roofs, pyramids, batters. */
export function frustum(m, f, x0, x1, z0, z1, y0, y1, tw, tl, pt, bottom = false) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, c = (x, y, z) => f.at(x, y, z), o = f.at(cx, y0 * 0.6 + y1 * 0.4 - 0.02 * Math.abs(y1 - y0), cz);
  const a = [c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1)];
  const t = [c(cx - tw / 2, y1, cz - tl / 2), c(cx + tw / 2, y1, cz - tl / 2), c(cx + tw / 2, y1, cz + tl / 2), c(cx - tw / 2, y1, cz + tl / 2)];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    if (Math.hypot(...sub(t[i], t[j])) < 1e-6) m.tri(a[i], a[j], t[i], pt, o); else m.quad(a[i], a[j], t[j], t[i], pt, o);
  }
  if (tw > 0 && tl > 0) m.quad(t[0], t[1], t[2], t[3], pt, o);
  if (bottom) m.quad(a[0], a[1], a[2], a[3], pt, f.at(cx, y1 + 1, cz));
}

/** A gable roof (ridge along z): eaves at y0 over x0..x1 × z0..z1 (overhanging by ov), ridge at y1; the gables in `gp`. */
export function gable(m, f, x0, x1, z0, z1, y0, y1, ov, pt, gp = pt) {
  const xm = (x0 + x1) / 2, c = (x, y, z) => f.at(x, y, z), o = f.at(xm, (y0 + y1) / 2 - 0.3, (z0 + z1) / 2);
  const ex0 = x0 - ov, ex1 = x1 + ov, ez0 = z0 - ov, ez1 = z1 + ov;
  m.quad(c(ex0, y0 - ov * 0.25, ez0), c(xm, y1, ez0), c(xm, y1, ez1), c(ex0, y0 - ov * 0.25, ez1), pt, o);
  m.quad(c(ex1, y0 - ov * 0.25, ez0), c(xm, y1, ez0), c(xm, y1, ez1), c(ex1, y0 - ov * 0.25, ez1), pt, o);
  m.tri(c(x0, y0, ez0), c(x1, y0, ez0), c(xm, y1, ez0), gp, o);
  m.tri(c(x0, y0, ez1), c(x1, y0, ez1), c(xm, y1, ez1), gp, o);
}

/** A cone or cylinder (r0 at y0, r1 at y1) of n sides about (cx, cz); a cap on the top when r1 > 0 and `cap`. */
export function cone(m, f, cx, cz, r0, y0, r1, y1, n, pt, cap = true, bottom = false, rot = 0) {
  const o = f.at(cx, (y0 + y1) / 2, cz), ring = (r, y, i) => { const a = rot + (i / n) * Math.PI * 2; return f.at(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r); };
  for (let i = 0; i < n; i++) {
    const j = i + 1;
    if (r1 < 1e-6) m.tri(ring(r0, y0, i), ring(r0, y0, j), f.at(cx, y1, cz), pt, o);
    else m.quad(ring(r0, y0, i), ring(r0, y0, j), ring(r1, y1, j), ring(r1, y1, i), pt, o);
    if (cap && r1 > 1e-6) m.tri(ring(r1, y1, i), ring(r1, y1, j), f.at(cx, y1, cz), pt, o);
    if (bottom) m.tri(ring(r0, y0, i), ring(r0, y0, j), f.at(cx, y0, cz), pt, f.at(cx, y1, cz));
  }
}

/** A hemisphere dome of radius r on y0 (n sides, `rings` bands). */
export function dome(m, f, cx, cz, r, y0, pt, n = 8, rings = 3) {
  const o = f.at(cx, y0, cz), p = (a, b) => f.at(cx + Math.cos(a) * Math.cos(b) * r, y0 + Math.sin(b) * r, cz + Math.sin(a) * Math.cos(b) * r);
  for (let k = 0; k < rings; k++) {
    const b0 = (k / rings) * Math.PI / 2, b1 = ((k + 1) / rings) * Math.PI / 2;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      if (k === rings - 1) m.tri(p(a0, b0), p(a1, b0), f.at(cx, y0 + r, cz), pt, o); else m.quad(p(a0, b0), p(a1, b0), p(a1, b1), p(a0, b1), pt, o);
    }
  }
}

/** A low-poly ellipsoid (a crown, a haystack, a bush): n sides, `rings` bands, each point drawn in or out by up to `jit` (a unit hash per point). */
export function blob(m, f, cx, cy, cz, rx, ry, rz, pt, n = 6, rings = 3, jit = 0, h = null) {
  const o = f.at(cx, cy, cz);
  const pts = [];
  for (let k = 0; k <= rings; k++) {
    const b = -Math.PI / 2 + (k / rings) * Math.PI, row = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, q = jit && h ? 1 + jit * (h(k * 31 + i) - 0.5) : 1;
      row.push(f.at(cx + Math.cos(a) * Math.cos(b) * rx * q, cy + Math.sin(b) * ry * q, cz + Math.sin(a) * Math.cos(b) * rz * q));
    }
    pts.push(row);
  }
  for (let k = 0; k < rings; k++) for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (k === 0) m.tri(pts[0][i], pts[1][i], pts[1][j], pt, o);
    else if (k === rings - 1) m.tri(pts[k][i], pts[k + 1][i], pts[k][j], pt, o);
    else m.quad(pts[k][i], pts[k][j], pts[k + 1][j], pts[k + 1][i], pt, o);
  }
}

/** A thin vertical rectangle on a wall (a door, a window): at local (x, z) facing +z or −z or ±x. */
export function opening(m, f, x, y0, y1, z, w, dir, pt) {
  if (dir === 'z+') m.quad(f.at(x - w / 2, y0, z + 0.03), f.at(x + w / 2, y0, z + 0.03), f.at(x + w / 2, y1, z + 0.03), f.at(x - w / 2, y1, z + 0.03), pt, f.at(x, (y0 + y1) / 2, z - 1));
  else if (dir === 'z-') m.quad(f.at(x - w / 2, y0, z - 0.03), f.at(x + w / 2, y0, z - 0.03), f.at(x + w / 2, y1, z - 0.03), f.at(x - w / 2, y1, z - 0.03), pt, f.at(x, (y0 + y1) / 2, z + 1));
}
