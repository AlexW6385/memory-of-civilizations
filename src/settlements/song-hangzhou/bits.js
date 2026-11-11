// Southern Song Lin'an — small pure-array geometry helpers for the movers' shapes (boats, the
// extras of the figures): flat triangle lists (9 numbers a triangle), outward windings fixed by a
// reference point, so that no piece depends on three.js (the movers' worker has no import map but
// these need none).

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const smoothstep = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** A triangle a, b, c pushed so that its normal points away from `ref` (a point inside the solid). */
export function tri(out, a, b, c, ref) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - ref[0], my = (a[1] + b[1] + c[1]) / 3 - ref[1], mz = (a[2] + b[2] + c[2]) / 3 - ref[2];
  if (nx * mx + ny * my + nz * mz >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
/** A quad (a, b, c, d in order round it), facing away from ref. */
export function quad(out, a, b, c, d, ref) { tri(out, a, b, c, ref); tri(out, a, c, d, ref); }

/** An axis-aligned box (a closed solid). */
export function box(out, x0, y0, z0, x1, y1, z1) {
  const ref = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const P = (x, y, z) => [x, y, z];
  const v = [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0), P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
  for (const [a, b, c, d] of [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]]) quad(out, v[a], v[b], v[c], v[d], ref);
}
/** A thin prism of n sides from p to q (open tube with end caps). */
export function beam(out, p, q, r, n = 5, r2 = r) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c, rr) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * rr, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * rr, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * rr]; });
  const A = ring(p, r), B = ring(q, r2), ref = lerp3(p, q, 0.5);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; quad(out, A[k], A[k1], B[k1], B[k], ref); }
  for (let k = 1; k + 1 < n; k++) { tri(out, A[0], A[k], A[k + 1], ref); tri(out, B[0], B[k], B[k + 1], ref); }
}
/** A solid of revolution about the vertical axis at (cx, cz): profile [[r, y], …] from the bottom up. */
export function lathe(out, profile, seg, cx = 0, cy = 0, cz = 0) {
  const ref = [cx, cy + (profile[0][1] + profile[profile.length - 1][1]) / 2, cz];
  for (let i = 0; i + 1 < profile.length; i++) {
    const [r0, y0] = profile[i], [r1, y1] = profile[i + 1];
    for (let k = 0; k < seg; k++) {
      const a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2;
      const p = (r, y, a) => [cx + Math.cos(a) * r, cy + y, cz + Math.sin(a) * r];
      const A = p(r0, y0, a0), B = p(r0, y0, a1), C = p(r1, y1, a1), D = p(r1, y1, a0);
      if (r0 < 1e-4) tri(out, A, C, D, ref); else if (r1 < 1e-4) tri(out, A, B, C, ref); else quad(out, A, B, C, D, ref);
    }
  }
}
/** A ball (radius r, scaled sx, sy, sz) at c. */
export function ball(out, c, r, sx = 1, sy = 1, sz = 1, seg = 6) {
  const prof = []; for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + i / 4 * Math.PI; prof.push([Math.max(1e-5, Math.cos(a) * r), Math.sin(a) * r]); }
  const t = []; lathe(t, prof, seg, 0, 0, 0);
  for (let i = 0; i < t.length; i += 3) out.push(c[0] + t[i] * sx, c[1] + t[i + 1] * sy, c[2] + t[i + 2] * sz);
}
