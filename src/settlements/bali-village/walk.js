// A Balinese temple village, c. 1900 — the visitor's walk (docs/settlements/bali-village.md §13.1). Pure data and one distance function (layout.js is the only import).
// The walk: the visitor arrives at the street's foot before the pura (0, -26 is the arrival's own point), so the walk runs from the temple's split gate at the north end
// of the village street south to the crossing and on to the pura dalem at the south end, and along the cross lane east and west. The lots that front it are the ones whose
// trades are open and whose gates and houses are furnished to walk into.
import { STREET, LANE } from './layout.js';

/** The walk's lines [x, z], along the middle of the streets. */
export const WALK = [
  [[0, -72], [0, STREET[3] - 4]],                          // the village street, from the temple's gate to the dalem's end
  [[LANE[0] + 6, (LANE[1] + LANE[3]) / 2], [LANE[2] - 6, (LANE[1] + LANE[3]) / 2]],   // the cross lane
];
/** A lot whose gate lies within this (m) of the walk is on the walk. */
export const WALK_REACH = 9;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
