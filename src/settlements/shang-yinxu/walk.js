// Shang Yinxu, c. 1200 BC — the visitor's walk (docs/settlements/shang-yinxu.md §9). Pure data and one distance function (layout.js, walkroutes.js, fauna.js,
// life and the night/sound maps read it). The way: from the arrival in the court of the ancestral halls (20, -34) up the axis between the covered pits to
// the stair of the kings' hall; back down the court to the west flanking hall (the Jia group) and the east one (the Bing group); out of the court's
// east side across the open ground to the lane of the eastern quarter, past its courtyard houses, row houses and the diviners' workshop, to the
// oracle-bone archive and its shed; west of the hall to Fu Hao's tomb; south out of the gate and over the moat's causeway to the quarter's lanes and
// the bronze foundry with its furnace shed and the casters' pit house.
export const ARRIVAL = [20, -34];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[20, -34], [20, -62], [20, -76], [20, -90]],                          // the axis to the kings' hall
  [[20, -34], [-1, -34], [-1, -48.5], [-14, -48.5]],                     // the west flanking hall
  [[20, -34], [20, -20], [76, -20], [86, -24]],                          // out of the court by its east side
  [[86, -58], [86, -8], [140, -8]],                                      // the eastern lane (north-south) and the lane along the row houses
  [[86, -40], [140, -40]],                                               // the lane before the courtyard houses and the diviners' workshop
  [[86, -58], [110, -58], [110, -76]],                                   // the archive's shed and door
  [[-1, -34], [-1, -70], [-12, -82], [-30, -91], [-62, -94]],            // west of the hall to the tomb
  [[-1, -34], [-1, -20], [-40, -20], [-40, -8], [-70, -8]],              // the west quarter's lane
  [[-1, -70], [-30, -72], [-70, -72]],                                   // the north-west lane
  [[20, -34], [20, 30], [20, 50], [20, 72], [20, 88]],                   // the gate and the south causeway
  [[20, 88], [-100, 88], [-100, 98]],                                    // the lane west to the foundry
];
export const WALK_REACH = 15;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return [(x0 + x1) / 2, l.front === 's' ? z1 : z0]; }
