// Qin Xianyang, c. 210 BC — the visitor's walk (docs/settlements/qin-xianyang.md §10). Pure data and one distance function (no layout import: layout.js,
// town.js and the routes read it). The way: from the arrival in the front gallery of Pit 1 up the middle ramp to the building yard at its head; from the
// yard, one branch north to the figure-makers' street (the workshops open to it, west along it), the other round the yard's south edge into the lane at
// x 180 and down to the street at z -58 (the town's main street: row houses and court houses on both sides), west along it to the lane at x 60, down that
// to the imperial road, west along the road to the market's north gate, across the market to the tower and the standards; and on west along the road to
// the palace's forecourt, the stair and the que. The waypoints were found by a flood of the collision world (tools/lib/reach.mjs) and keep clear of the
// yard's gear, so a walker can follow every leg in a straight line.
export const ARRIVAL = [126.5, -121];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[126.5, -121], [152.5, -120.5], [170.5, -120.5]],                                          // the gallery, the middle ramp, the yard
  [[170.5, -120.5], [184, -119.5], [183.6, -112.5], [183.6, -106], [190.25, -106], [191.6, -105.5], [191.6, -94], [181, -93.5], [181, -57]],   // round the yard's gear into the lane, down to the main street
  [[181, -57], [171, -58], [165, -58.6], [116.5, -58.6], [61, -57]],                                          // the main street west, to the lane at x 60
  [[61, -57], [61, 1], [-29, 1]],                                                             // down the lane, west along the imperial road to the market's gate
  [[-29, 1], [-29, 27], [-29, 50.5], [-38.5, 51], [-38.5, 52.5], [-37.5, 54.5], [-37.5, 71]], // the market: through the north gate, the aisle, round the tower to the standards
  [[-29, 1], [-149, 1], [-194, 0.5], [-217.5, 0], [-218, -29], [-219, -46]],                  // on west along the road, the palace's forecourt, the great stair's foot
  [[170.5, -120.5], [164, -121], [163.5, -160.5], [161, -161], [161, -206], [138.5, -206.5], [92, -206], [88.5, -206], [87.5, -205.45], [84.5, -205.45], [80, -205.2], [57, -207.5], [1, -206.5]],   // the branch north to the figure-makers' street, west along it
];
export const WALK_REACH = 9.5;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front (its door side). */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : [(x0 + x1) / 2, z1]; }
/** Is the lot's front on the walk? */
export const onWalk = (l) => walkDistance(frontPoint(l)) <= WALK_REACH;
