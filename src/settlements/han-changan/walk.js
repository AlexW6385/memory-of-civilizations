// Han Chang'an, c. 100 BC — the visitor's walk (docs/settlements/han-changan.md §13). Pure data and one distance function (no layout import: layout.js,
// life.js and the routes read it). The way: from the arrival at the ramp's head down the ramp-stair to the paved court at its foot, across it into the
// lanes of the palace's service quarters (the clerks', guards' and stewards' houses, west and east), out round the quarters' end to the road
// to the palace's east gate (the gate between the que), through it to the great avenue, up the avenue past the offices (shu) to the street that
// runs east to the East Market, in at the market's west gate and along its cross lane to the market tower.
export const ARRIVAL = [-110, -122];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-110, -122], [-110, -91.5], [-110, -75.75]],                                // the ramp-stair, the paved court
  [[-170, -75.75], [-110, -75.75], [-36.5, -75.75]],                            // the lanes of the two service quarters (west, east)
  [[-33, -76], [-33, -104], [100, -104], [150, -104]],                          // round the east quarter's end, along the road, through the palace's east gate
  [[150, -104], [150, -262], [190, -262], [190, -280]],                         // the great avenue north, the street east, to the market's gate
  [[190, -280], [203, -280], [252, -280]],                                      // through the East Market's west gate, along its cross lane to the tower
  [[265, -250], [265, -268]], [[265, -292], [265, -310]],                        // the market's other cross lane, either side of the tower
  // the branches (second pass): down the axial way through the south gate to the street, west to the ward's gate and along its first lane
  [[-110, -75.75], [-110, 126], [-124, 126], [-124, 162.4], [-111, 162.4], [-20, 162.4]],
  // and north: east of the terrace, round the Jiaofang hall, out at the palace's north gate, along the street to the West Market's east gate and its cross lane to the tower
  [[-36.5, -75.75], [-33, -80], [-33, -104], [-33, -244.5], [-110, -244.5], [-110, -262], [-55, -262], [-55, -330], [-70, -330], [-122, -330]],
];
export const WALK_REACH = 9.5;
export const OFFICE_REACH = 34;                                                 // the avenue's offices stand 15–25 m off its middle
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's (or a shop row unit's) front. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
