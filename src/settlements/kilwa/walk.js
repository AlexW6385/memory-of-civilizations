// Kilwa about 1330 — the visitor's walk (docs/settlements/kilwa.md §22). Pure data and one distance function (layout.js reads it to open the lots on it).
// The walk: from the arrival in the Great Mosque's hall up the aisle to the north door, across the forecourt to the mosque street, the spine north to the
// market street (soko) along the harbour side of the town, and the lanes down to the beach's landing places. The walk's lots are all opened.
export const ARRIVAL = [-9.95, 32.5];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-15, 34], [-15, -22]],             // the hall's aisle to the north door and across the forecourt
  [[-70, -29.75], [45, -29.75]],       // the mosque street
  [[-14.75, -29.75], [-14.75, -84.3]], // the spine
  [[-150, -84.3], [70, -84.3]],        // the market street (soko)
  [[-45, -84.3], [-45, -112]],         // the lane to the third landing place
  [[-75, -84.3], [-75, -112]],         // the lane to the second landing place
];
export const WALK_REACH = 9.5;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) best = Math.min(best, segDist(p, W[0], W[1])); return best; }
/** The middle of a lot's front on its lane (the lot's `flip` turns its front to the south). */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return [(x0 + x1) / 2, l.flip ? z1 : z0]; }
/** Is the lot on the walk? */
export const onWalk = (l) => walkDistance(frontPoint(l)) <= WALK_REACH;
