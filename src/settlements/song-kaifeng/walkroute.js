// The visitor's walk through Bianjing (docs/settlements/song-kaifeng.md §19.4): from the arrival in the Kaibao monastery out by the gate hall and the
// 14 m approach to the shop street, west along it to the gate, down the main street over the Rainbow Bridge, and along the two river streets by the
// wine shops and the tea houses. Pure data and a distance: the lots on it are the ones opened (interiors.js) and dressed (street life, night, sound).
import { RIVER } from './layout.js';

/** Polylines [x, z] along the middle of the streets walked. */
export const WALK = [
  [[160, -130], [160, -80]],                                   // from the gate hall down the approach
  [[160, -80], [-290, -80]],                                   // the shop street west to the city gate (the physician, the tax office)
  [[0, -80], [0, RIVER.z1 + 12]],                              // the main street south, over the bridge
  [[-150, RIVER.z0 - 5.5], [150, RIVER.z0 - 5.5]],             // the north river street (the tea houses, the wine shops)
  [[-150, RIVER.z1 + 5.5], [150, RIVER.z1 + 5.5]],             // the south river street (the grain landing, the inns)
];
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The point on a lot's front line, in the middle. */
export const frontPoint = (l) => { const [x0, z0, x1, z1] = l.foot; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; };
/** The distance of a lot's front from the walk. */
export function walkDistance(l) { const p = frontPoint(l); let best = 1e9; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
