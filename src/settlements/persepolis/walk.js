// Persepolis about 480 BC — the visitor's walk (docs/settlements/persepolis.md §23.1). Pure data and distance functions (no three.js, no layout import).
// The visitor arrives on the terrace at the head of the royal way (src/planet/arrivals.js), walks east along the way to the Apadana's west stair, south
// across the court to the lodgings and workshops that served it (terrace-houses.js: nine houses, all walked into), north-west to the Gate of All Nations and
// along the file to the Apadana's north stair, and goes down the double stair and out along the road below, between the houses and the market of Parsa.
export const ARRIVAL = [-122, -60];
export const T = 14;
/** The walk's lines [x, z] along the middle of the way; `y` is the floor they run on (the terrace's top, or the plain). */
export const WALK = [
  { y: T, line: [[-148, -60], [-93, -60]] },                          // the royal way, from the head of the stair to the Apadana's west stair
  { y: T, line: [[-122, -60], [-122, -17]] },                         // south across the court to the lodgings' fronts
  { y: T, line: [[-147, -16.5], [-30, -16.5]] },                      // along the lodgings' fronts (their doors face the court)
  { y: T, line: [[-112, -132], [-91, -123], [-44, -123]] },           // from the Gate of All Nations along the Apadana's north stair
  { y: 0, line: [[-400, -140], [-176, -140]] },                       // the road on the plain, from the town to the foot of the stair
];
export const WALK_REACH = 30;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk on the plain (y = 0) or on the terrace (y = T). */
export function walkDistance(p, y = 0) {
  let best = Infinity;
  for (const W of WALK) if (W.y === y) for (let i = 0; i + 1 < W.line.length; i++) best = Math.min(best, segDist(p, W.line[i], W.line[i + 1]));
  return best;
}
