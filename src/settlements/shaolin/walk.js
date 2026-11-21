// Shaolin — the visitor's walk (docs/settlements/shaolin.md §11). Pure data and functions (no three.js): from the arrival on the approach road
// north to the forecourt and the gate, and along the village street east and west of the crossing. The houses whose fronts lie within REACH of
// it are the opened ones: the doorway in the middle bay stands open (the village houses have no leaves, `ming_hall` cuts the bay through), the
// room behind it is furnished (styles/shaolin/rooms.js), and walk-check follows a route into each (town.js puts them on the village plan).
import { HOUSES } from './layout.js';

export const ARRIVAL = [0, 160];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[0, 188], [0, 132]],           // the approach road, from the village's south end to the forecourt
  [[-52, 155], [52, 155]],        // the village street, the stretch either side of the crossing
];
export const REACH = 9;
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The frame of a house front: P(t, d) = the point at fraction t along the front and d out from the posts (negative d: into the house). */
export function frontOf(h) {
  const [x0, z0, x1, z1] = h.rect, o = OUT[h.front], along = h.front === 'n' || h.front === 's';
  const L = along ? x1 - x0 : z1 - z0, edge = { n: z0, s: z1, w: x0, e: x1 }[h.front];
  const P = (t, d) => (along ? [x0 + L * t, edge + o[1] * d] : [edge + o[0] * d, z0 + L * t]);
  return { P, L, rot: Math.atan2(o[0], o[1]), o, along };
}
/** The distance of a house's front from the walk. */
export function walkDistance(h) {
  const p = frontOf(h).P(0.5, 0); let best = Infinity;
  for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1]));
  return best;
}
/** The opened houses: [{ i, h }] in order of their distance from the arrival. */
export function openedHouses() {
  const out = [];
  HOUSES.forEach((h, i) => { if (walkDistance(h) <= REACH) out.push({ i, h }); });
  return out.sort((a, b) => Math.hypot(...frontOf(a.h).P(0.5, 0).map((v, k) => v - ARRIVAL[k])) - Math.hypot(...frontOf(b.h).P(0.5, 0).map((v, k) => v - ARRIVAL[k])));
}
/** The routes walk-check follows: out in the street, in at the doorway, into the front room (a shop to its counter, a home to its table). */
export function walkRoutes() {
  return openedHouses().map(({ h }) => {
    const F = frontOf(h), deep = h.kind === 'shop' ? 1.3 : 1.1;
    const r = [F.P(0.5, 2.4), F.P(0.5, 0.9), F.P(0.5, -0.3), F.P(0.5, -deep)];
    r.y0 = 0.25;
    return r;
  });
}
