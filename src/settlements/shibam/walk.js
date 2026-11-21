// Shibam c. 1700 — the visitor's walk (docs/settlements/shibam.md §16). Pure data and distance helpers. From the arrival on the square
// across to the merchant's tower house, along the stalls under the palace, to the mosque door, and south down the main street to the gate.
export const ARRIVAL = [-6, -8];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-6, -8], [32, -21.7]],              // across the square to the merchant's door
  [[-30, -22], [30, -22]],              // under the stalls before the palace
  [[-6, -8], [-33, -12]],               // to the mosque's court door
  [[-6, 2.5], [-9.5, 20], [-9.5, 97]],  // south: the main street from the square to the gate
];
export const WALK_REACH = 7;
const seg = (p, a, b) => {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
};
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, seg(p, W[i], W[i + 1])); return best; }
