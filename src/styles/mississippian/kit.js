// Shared helpers of the Mississippian style: the coursed thatch roof, a doorway, a seeded random.
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';

export const WALL = 'mud_plaster', TH = 'thatch';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A steep hipped thatch roof over rect from y, rising rise. */
export function hip(bag, [x0, z0, x1, z1], y, rise, o = 0.5) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, m = Math.min(w, d) / 2 - 0.05;
  bag.add(TH, frustum([x0 - o, z0 - o, x1 + o, z1 + o], y, y + rise, m, m, m, m));          // closed below: the eaves' underside
}
/** Push triangle a b c turned to face `want`. */
export function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
/**
 * A hipped roof of grass thatch laid in courses: each course's butt ends stand a little proud of the
 * course below, so the roof reads in tiers, thick at the eaves; a ridge roll on top. rect, eave y,
 * rise, overhang o, courses n.
 */
export function thatchHip(bag, [x0, z0, x1, z1], y, rise, o = 0.8, n = 5) {
  const X0 = x0 - o, Z0 = z0 - o, X1 = x1 + o, Z1 = z1 + o, m = Math.min(X1 - X0, Z1 - Z0) / 2 - 0.02, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  // the loop at slope parameter t (0 eave … 1 ridge), pushed out by p metres
  const loop = (t, p) => {
    const ix = m * t, yy = y + rise * t - p * 0.5;
    return [[X0 + ix - p, yy, Z0 + ix - p], [X1 - ix + p, yy, Z0 + ix - p], [X1 - ix + p, yy, Z1 - ix + p], [X0 + ix - p, yy, Z1 - ix + p]];
  };
  const T = [];
  for (let k = 0; k < n; k++) {
    const t0 = k / n * 0.92, t1 = k === n - 1 ? 1 : (k + 1) / n * 0.92 + 0.06, butt = (k ? 0.3 : 0.4) * (1 - 0.5 * k / n);
    const lo = loop(t0, butt), hi = loop(t1, 0), inner = loop(t0, 0);
    for (let e = 0; e < 4; e++) {
      const f = (e + 1) % 4, mid = [(lo[e][0] + lo[f][0]) / 2 - cx, 0, (lo[e][2] + lo[f][2]) / 2 - cz];
      const want = [mid[0], Math.hypot(mid[0], mid[2]) * 0.8, mid[2]];
      tri(T, lo[e], lo[f], hi[f], want); tri(T, lo[e], hi[f], hi[e], want);
      // the butt ends, facing down and out
      const dn = [mid[0], -Math.hypot(mid[0], mid[2]) * 2, mid[2]];
      tri(T, lo[e], lo[f], inner[f], dn); tri(T, lo[e], inner[f], inner[e], dn);
    }
  }
  bag.add(TH, fromTriangles(T));
  // the ridge roll
  const long = X1 - X0 >= Z1 - Z0, half = Math.abs((X1 - X0) - (Z1 - Z0)) / 2;
  const a = long ? [cx - half - 0.3, y + rise + 0.05, cz] : [cx, y + rise + 0.05, cz - half - 0.3], b = long ? [cx + half + 0.3, y + rise + 0.05, cz] : [cx, y + rise + 0.05, cz + half + 0.3];
  bag.add(TH, rod(a, b, 0.32, 8));
  return { a, b };
}
/** A doorway in a daubed wall: the dark opening, its two door posts and the lintel pole, a worn sill of clay. side: 'n'|'s'; at: x. */
export function doorway(bag, x, zf, y, sg, w = 0.8, h = 1.9) {
  bag.add('opening', box(x - w / 2, y, Math.min(zf, zf + sg * 0.03), x + w / 2, y + h, Math.max(zf, zf + sg * 0.03)));
  for (const s of [-1, 1]) bag.add('timber', rod([x + s * (w / 2 + 0.1), y - 0.3, zf + sg * 0.1], [x + s * (w / 2 + 0.1), y + h + 0.3, zf + sg * 0.1], 0.11, 7));
  bag.add('timber', rod([x - w / 2 - 0.35, y + h + 0.12, zf + sg * 0.12], [x + w / 2 + 0.35, y + h + 0.12, zf + sg * 0.12], 0.09, 7));
  bag.add(WALL, box(x - w / 2 - 0.25, y - 0.2, Math.min(zf, zf + sg * 0.5), x + w / 2 + 0.25, y + 0.08, Math.max(zf, zf + sg * 0.5)));
}
