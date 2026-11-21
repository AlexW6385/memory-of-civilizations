// Sailendra Java (Borobudur), c. 825 — the visitor's walk (docs/settlements/borobudur.md §20.1). Pure data and one distance function (no layout import).
// The walk: the visitor arrives on the pilgrims' way from the east (x 110) facing the monument; the way runs west through the precinct's gate (x 98) to the
// monument's east stair, and east between its stalls, rest halls and lodgings out to the fields. A second line follows the path round the monument's foot.
export const ARRIVAL = [110, 0];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[66, 0], [215, 0]],                    // the paved way
  [[-66, -66], [66, -66], [66, 66], [-66, 66], [-66, -66]],   // the path round the foot of the base
];
export const WALK_REACH = 16;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
