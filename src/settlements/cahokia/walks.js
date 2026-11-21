// The visitor's walk at Cahokia (docs/settlements/cahokia.md §10.1): the routes the walk check follows, from the arrival in the corridor between the chunkey
// yards up the log stairs of Monks Mound to its halls, and into the nearest opened houses. Pure data from layout.js and town.js (local = world: origin [0, 0]).
import { HALLS, LODGES, SUMMIT, MOUNDS, FOX, lots, mRamp } from './layout.js';
import { openSet } from './town.js';

const STAIR_X = -25;
/** The opened house's door is in its south wall (toward the plaza), its middle at the rect's middle: [outside, in the door, inside]. */
const houseRoute = (l) => { const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; return [[cx, z1 + 3], [cx, z1 + 0.4], [cx, Math.max(cz + 0.2, z1 - 1.3)]]; };
const hallDoor = (r) => { const cx = (r[0] + r[2]) / 2; return [[cx, r[3] + 3], [cx, r[3] + 0.4], [cx, r[3] - 2]]; };
/** The routes of the landmark plan: [[x, z], ...] each, the first leg starting on the floor. */
export function walks() {
  const L = lots(), open = [...openSet().keys()].slice(0, 8);
  const R = [];
  // the stair: from the arrival to the foot of the first stair, up to the terrace's court, in at the first hall's door, out, along the court to the second stair, up to the summit, in at the great house's door
  R.push(Object.assign([[STAIR_X, -5], [STAIR_X, -36], [STAIR_X, -76], [STAIR_X, -84], ...hallDoor(HALLS[1]).slice(0, 2).map(([x, z]) => [x, z]), [(HALLS[1][0] + HALLS[1][2]) / 2, HALLS[1][3] - 3]], { y0: 0 }));
  // the second stair, from the terrace to the summit and in at the great house's door (the door in its south wall, the great post to one side)
  { const dx = (HALLS[0][0] + HALLS[0][2]) / 2, ds = HALLS[0][3]; R.push(Object.assign([[STAIR_X, -100], [STAIR_X, -150], [STAIR_X, ds + 9], [dx, ds + 3], [dx, ds + 0.4], [dx, ds - 2.5]], { y0: 12 })); }
  // the two lodges of the first terrace, from the court below the stair's head
  for (const r of LODGES) { const dx = (r[0] + r[2]) / 2; R.push(Object.assign([[dx, r[3] + 4], [dx, r[3] + 0.4], [dx, r[3] - 2.5]], { y0: 12 })); }
  // each lesser mound: up its log stair and in at the lodge's door
  for (const m of MOUNDS) { const r = mRamp(m), ls = m[1] + 0.33 * m[2]; R.push(Object.assign([[m[0], r.zOut + 3], [m[0], r.zIn + 1], [m[0], ls + 3], [m[0], ls + 0.4], [m[0], ls - 2.5]], { y0: 0 })); }
  for (const k of open) R.push(Object.assign(houseRoute(L[k]), { y0: L[k].y }));
  return R;
}
export { hallDoor, LODGES, SUMMIT, MOUNDS, FOX };
