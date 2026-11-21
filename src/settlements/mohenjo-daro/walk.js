// Mohenjo-daro, c. 2500 BC — the visitor's walk (docs/settlements/mohenjo-daro.md §16.1). Pure data and one distance function (no layout import:
// layout.js reads it to open the lots on it). The walk: from the arrival at the south edge of the Great Bath's court out by the Bath's south doors
// into the platform's street, east past the College's north face to the corner at x -116, along the street at z -79 to the lane of the eastern
// quarter (x -91) and down its length (the platform's houses with their doors on the lane), then east to the head of the stair and down it to the plain,
// along the street at z -40 to the market place, with the first lane of the first block (x -4.9) for the workshops of the Lower Town. [inferred: the way]
export const ARRIVAL = [-155, -72.5];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-147.8, -70], [-147.8, -62], [-116, -62]],                    // the Bath's south doors and the street of the platform before the College
  [[-116, -62], [-116, -79], [-65.5, -79]],                       // the corner and the street along the Pillared Hall's south face
  [[-91, -79], [-91, -20]],                                       // the lane of the eastern quarter, both rows of houses with their doors on it
  [[-67, -78], [-67, -48], [-64, -44], [-30, -44]],               // the way to the stair's head and down to the plain
  [[-30, -40], [60, -40]],                                        // the street to the market place
  [[-4.9, -40], [-4.9, 40]],                                      // the first lane of the first block: the workshops
];
/** How far from the walk's middle a lot's door may be and the lot is opened. */
export const WALK_REACH = 4.2;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front on its lane. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
/** The trades of the workshops of the walk's lane in turn (the trades of docs §6), and how many lots are opened at most. */
export const WALK_TRADES = ['bronze', 'shell', 'potter', 'bead', 'seal', 'bronze'];
export const WALK_MAX = 22;
