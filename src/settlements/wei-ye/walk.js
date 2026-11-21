// Ye, c. AD 215 — the visitor's walk (docs/settlements/wei-ye.md §15). Pure data and one distance function (no layout import: layout.js, town.js and the routes read it).
// The way: from the arrival in the Tongque Garden west up the Bronze Sparrow's stair to the tower on its crown (the landmark); back down and along the garden's
// path past the household's lodgings to the avenue; east along the royal way past the offices of the Wei court; north up the road to the palace's south gate, the
// forecourt and the Wenchang Hall; back to the avenue, south down the Zhongyang road into the first ward's lane (the houses of the wards); and east along the
// avenue to the market's north gate and its tower.
export const ARRIVAL = [-119, -91.5];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-119, -88], [-141, -88], [-172, -88], [-195, -88]],                        // the garden's paving, the stair of the Sparrow
  [[-111, -88], [-111, -40]],                                                  // the garden's path south, past the lodgings
  [[-111, -42], [-100, -42], [-100, 25]],                                      // the lane to the east, down between the offices to the avenue
  [[-100, 25], [0, 25], [182, 25]],                                            // the avenue, along the royal way
  [[0, 25], [0, -8], [0, -37], [0, -50]],                                      // the road north to the palace's south gate and the forecourt
  [[0, 25], [0, 60], [-14, 60], [-14, 74.15], [-30, 74.15], [-90, 74.15]],     // the Zhongyang road south, the first ward's east gate and its lane
  [[182, 25], [182, 50], [182, 88]],                                           // the market's north gate and its lane to the tower
  [[134, 104], [170, 104]], [[194, 104], [230, 104]],                          // the market's cross lane, either side of the tower
];
export const WALK_REACH = 9.5;
export const OFFICE_REACH = 34;                                                // the offices stand 15–25 m off the avenue's middle
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
