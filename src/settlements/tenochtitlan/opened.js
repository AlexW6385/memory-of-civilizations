// Which compounds of Tenochtitlan are opened to the visitor (docs/settlements/tenochtitlan.md §20): the priests' nine, and those within reach of the
// ways walked. Pure data (layout.js only), read by walk.js (the routes), town.js (the doors) and soundmap.js (the rooms one can be inside).
import { houses, priestHouses } from './layout.js';

/** The ways walked: polylines (the avenue west of the precinct's gate, the market's quay, the priests' lane). */
export const WALK = [
  [[-150, 0], [-300, 0]],                 // the avenue from the west gate, over the canal's bridge, out toward the causeway
  [[-109, -50], [-109, 90]],              // the lane between the priests' compounds
  [[-168, 22], [-168, 92]],               // the market's east side
];
export const REACH = 52;                          // m: a compound within this of the avenue is opened
export const segDist = (p, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t); };
const mid = (h) => [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2];
const walkDist = (p) => Math.min(...WALK.map(([a, b]) => segDist(p, a, b)));

let SET = null;
/** The opened compounds: the priests' nine, and those within REACH of the avenue (west of the precinct); a Set of the houses() objects. */
export function openSet() {
  if (SET) return SET;
  SET = new Set(priestHouses());
  for (const h of houses()) { const c = mid(h); if (c[0] < -150 && c[0] > -300 && walkDist(c) < REACH) SET.add(h); }
  return SET;
}
export const isOpen = (h) => openSet().has(h);

