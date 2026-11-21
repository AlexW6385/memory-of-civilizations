// Ayutthaya about 1687 — the visitor's walk (docs/settlements/ayutthaya.md §13.1). Pure data and one distance function (no layout import: layout.js
// reads it to give the lots on the walk their trades). The walk: from the arrival inside the wat's wall out through the south gate, over the brick bridge
// on the axis of the gate, and along the bank road on the far side of the canal, east and west, where the shophouses front the water.
export const ARRIVAL = [10, -100];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[10, -100], [10, -70.5]],            // the forecourt, the gate and the brick bridge over the canal, to the bank road
  [[-62, -70.5], [122, -70.5]],         // the bank road south of the canal, the shophouses' fronts on its south side
];
export const WALK_REACH = 6;
export const WALK_MAX = 16;
/** The trades of the shops on the walk, in order from the gate (docs §13.1: what a shop beside a great wat and a canal sold [inferred]). */
export const TRADES = ['offerings', 'flowers', 'rice', 'pots', 'betel', 'cloth', 'fish', 'chinese'];
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (let i = 0; i < WALK.length; i++) best = Math.min(best, segDist(p, WALK[i][0], WALK[i][1])); return best; }
const FRONTS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** The middle of a lot's front on its way. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect, f = FRONTS[l.front], hF = Math.abs(f[0]) ? (x1 - x0) / 2 : (z1 - z0) / 2; return [(x0 + x1) / 2 + f[0] * hF, (z0 + z1) / 2 + f[1] * hF]; }
