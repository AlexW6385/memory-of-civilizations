// Small shape helpers shared by the Japanese styles (japanese, nara, edo): triangles turned toward
// a wanted side, a tube swept along a path in a vertical plane (for sculpture: the phoenix, the
// shachi), thin plates (fins, feathers), and a wall panel with a hole of any convex shape cut
// through it (loopholes). All write flat triangle lists for fromTriangles.

/** Push triangle a b c, flipped if needed so that its normal points along `want` (a vector, or a function of the centroid). */
export function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  const w = typeof want === 'function' ? want([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]) : want;
  if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
/** Push quad a b c d (a closed loop) facing `want`. */
export function quad4(out, a, b, c, d, want) { tri(out, a, b, c, want); tri(out, a, c, d, want); }

/**
 * A tube in a vertical plane: `pts` are [u, v] in the plane (u along the horizontal direction d,
 * v up) from the origin o; `rad` [rw, rv] per point — the half-width across the plane (along the
 * side vector) and the half-depth within it. Elliptic rings of n sides, ends capped.
 */
export function tube(out, o, d, pts, rad, n = 10) {
  const s = [-d[1], d[0]];                                     // the side vector, horizontal, across the plane
  const P = (u, v) => [o[0] + d[0] * u, o[1] + v, o[2] + d[1] * u];
  const rings = pts.map(([u, v], i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tu = b[0] - a[0], tv = b[1] - a[1]; const l = Math.hypot(tu, tv) || 1; tu /= l; tv /= l;
    const nu = -tv, nv = tu, [rw, rv] = rad[i], c = P(u, v), ring = [];
    for (let k = 0; k < n; k++) {
      const th = k / n * Math.PI * 2, cs = Math.cos(th), sn = Math.sin(th);
      ring.push([c[0] + s[0] * rw * cs + d[0] * nu * rv * sn, c[1] + nv * rv * sn, c[2] + s[1] * rw * cs + d[1] * nu * rv * sn]);
    }
    return { c, ring };
  });
  for (let i = 0; i < rings.length - 1; i++) {
    const A = rings[i], B = rings[i + 1], mid = [(A.c[0] + B.c[0]) / 2, (A.c[1] + B.c[1]) / 2, (A.c[2] + B.c[2]) / 2];
    const want = (p) => [p[0] - mid[0], p[1] - mid[1], p[2] - mid[2]];
    for (let k = 0; k < n; k++) quad4(out, A.ring[k], A.ring[(k + 1) % n], B.ring[(k + 1) % n], B.ring[k], want);
  }
  for (const [R, nb] of [[rings[0], rings[1]], [rings[rings.length - 1], rings[rings.length - 2]]]) {
    const w = [R.c[0] - nb.c[0], R.c[1] - nb.c[1], R.c[2] - nb.c[2]];
    for (let k = 0; k < n; k++) tri(out, R.c, R.ring[k], R.ring[(k + 1) % n], w);
  }
}

/** A thin plate: the polygon `pts` (3-D, roughly planar, convex or fan-able from pts[0]) given thickness t along its normal `nrm`. */
export function plate(out, pts, nrm, t) {
  const h = t / 2, up = pts.map((p) => [p[0] + nrm[0] * h, p[1] + nrm[1] * h, p[2] + nrm[2] * h]), dn = pts.map((p) => [p[0] - nrm[0] * h, p[1] - nrm[1] * h, p[2] - nrm[2] * h]);
  const neg = [-nrm[0], -nrm[1], -nrm[2]];
  for (let k = 1; k < pts.length - 1; k++) { tri(out, up[0], up[k], up[k + 1], nrm); tri(out, dn[0], dn[k], dn[k + 1], neg); }
  let cx = 0, cy = 0, cz = 0; for (const p of pts) { cx += p[0]; cy += p[1]; cz += p[2]; } cx /= pts.length; cy /= pts.length; cz /= pts.length;
  for (let k = 0; k < pts.length; k++) { const j = (k + 1) % pts.length; quad4(out, up[k], up[j], dn[j], dn[k], (p) => [p[0] - cx, p[1] - cy, p[2] - cz]); }
}

/**
 * A panel of a wall with a hole through it: the panel is cw × ch centred at c (3-D), in the plane
 * spanned by the horizontal unit u (along the wall) and up, thickness 2·T along n (the wall's
 * normal, horizontal); `shape` is a convex polygon [[s, t]…] round the centre (counter-clockwise),
 * or { circle: r }. Writes the two faces with the hole and the tunnel's sides (into `tun`, which
 * may be another material's list).
 */
export function holePanel(out, tun, c, u, n, cw, ch, T, shape) {
  const angs = new Set();
  for (const [a, b] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) angs.add(Math.atan2(b * ch / 2, a * cw / 2));
  let poly = shape.circle ? null : shape;
  if (poly) for (const [s, t] of poly) angs.add(Math.atan2(t, s));
  const nu = shape.circle ? 12 : 4;
  for (let k = 0; k < nu; k++) angs.add(-Math.PI + (k + 0.5) / nu * Math.PI * 2);
  const list = [...angs].map((a) => (a <= -Math.PI + 1e-9 ? a + Math.PI * 2 : a)).sort((a, b) => a - b).filter((a, i, l) => i === 0 || a - l[i - 1] > 1e-4);
  const rayRect = (dx, dy) => { const k = Math.min(Math.abs(dx) > 1e-9 ? cw / 2 / Math.abs(dx) : 1e9, Math.abs(dy) > 1e-9 ? ch / 2 / Math.abs(dy) : 1e9); return [dx * k, dy * k]; };
  const rayPoly = (dx, dy) => {
    if (!poly) return [dx * shape.circle, dy * shape.circle];
    let best = 1e9;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const k = (p[0] * ey - p[1] * ex) / den, m = (p[0] * dy - p[1] * dx) / den;
      if (k > 0 && m >= -1e-6 && m <= 1 + 1e-6) best = Math.min(best, k);
    }
    return [dx * best, dy * best];
  };
  const W = (s, t, o) => [c[0] + u[0] * s + n[0] * o, c[1] + t, c[2] + u[1] * s + n[1] * o];
  const outer = list.map((a) => rayRect(Math.cos(a), Math.sin(a))), inner = list.map((a) => rayPoly(Math.cos(a), Math.sin(a)));
  const N = list.length, nf = [n[0], 0, n[1]], nb = [-n[0], 0, -n[1]];
  for (let k = 0; k < N; k++) {
    const j = (k + 1) % N;
    for (const [o, w] of [[T, nf], [-T, nb]]) quad4(out, W(...outer[k], o), W(...outer[j], o), W(...inner[j], o), W(...inner[k], o), w);
    const m = [(inner[k][0] + inner[j][0]) / 2, (inner[k][1] + inner[j][1]) / 2];
    quad4(tun, W(...inner[k], T), W(...inner[j], T), W(...inner[j], -T), W(...inner[k], -T), [-(u[0] * m[0]), -m[1], -(u[1] * m[0])]);
  }
}
