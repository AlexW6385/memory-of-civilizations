// Pagan c. 1200 — the visitor's walk (docs/settlements/bagan.md §14.1). Pure data and one distance function (no layout import).
// The way in (src/planet/arrivals.js) is inside the Ananda precinct's west gate, looking east to the temple. The walk: east along the cross passage
// between the pilgrims' stalls to the west porch, and the other way out of the gate and along the main road between the two shop rows to the Tharabar
// Gate, through it and on along the market street of the city to the cross street.
export const ARRIVAL = [30, 0];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[30, 0], [56, 0]],                    // the cross passage to the Ananda's west porch, between the stalls
  [[15, 0], [-290, 0]],                  // the main road: the west gate, the shop rows, the Tharabar Gate, the market street of the city
];
export const WALK_REACH = 8;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front on its street. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
