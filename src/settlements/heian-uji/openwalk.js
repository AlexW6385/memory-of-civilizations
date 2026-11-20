// The streets a visitor walks in Uji (docs/settlements/heian-uji.md §19): from the viewing pier's end along the pond's east bank and south
// shore, out of the temple's south gate down the approach through the market and the south road, and out of the north gate up the road to the
// Uji Bridge and along the bridge road. The houses that front these streets are opened (settlement-wide the open set of town.js reaches 260):
// the ones on the walk are given their walker's route in at the door (the door 1.6 m wide, the room walked as far as the raised floor), their
// keeper at the counter or the hearth built into the near form (not a life element, whose figures reach 170 m), and the wayside shrine
// and stone at the crossings (waysides.js). Pure data and functions of layout.js and house.js.

import { lots, HALL } from './layout.js';
import { traits } from './house.js';
import { openSet } from './town.js';

/** The walk: polylines along the middle of the streets (the pier is walked first, from the arrival). */
export const WALK = [
  [[-40, 90], [-40, 250]],            // the temple's south approach, through the market (its gate at z 87)
  [[-120, 106], [40, 106]],           // the south road
  [[-40, -90], [-40, -190]],          // the road north from the temple's north gate to the bridge road
  [[-120, -190], [100, -190]],        // the bridge road, to the Uji Bridge
];
const REACH = 6.2;                    // m: a house whose front lies within this of the walk is on it
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The middle of a lot's front line. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
export function walkDistance(l) { const p = frontPoint(l); let best = 1e9; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }

/** The frame of a lot: P(u, v) a point u along its front from the left, v inward from the front line (the house builder's own). */
export function frame(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  return (u, v) => (f === 's' ? [x0 + u, z1 - v] : f === 'n' ? [x1 - u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
}

let SET = null;
/** The opened lots on the walk: Map lot → { use ('home' | 'inn'), tr (traits), n (its order along the way) }. */
export function walkSet() {
  if (SET) return SET;
  SET = new Map();
  const all = lots(), open = openSet(all);
  const list = [];
  for (const [l, use] of open) {
    if (walkDistance(l) > REACH) continue;
    const tr = traits({ ...l, open: true });
    list.push({ l, use, tr });
  }
  list.sort((a, b) => a.l.seed - b.l.seed);
  list.forEach((e, n) => SET.set(e.l, { use: e.use, tr: e.tr, n }));
  return SET;
}

/** The depth of the earth floor of an opened house and where the raised floor begins (house.js: earth = min(D − 2.4, 2.6), the plank floor from g0). */
export function depths(tr) { const T = 0.2, earth = Math.min(tr.D - 2.4, 2.6); return { T, earth, g0: T + earth }; }

/**
 * Routes into the opened houses of the walk, in the hall plan's local frame (origin at the hall; the plan's `walks`): in from the lane at the
 * door, across the earth floor, up the step board onto the raised floor. At most `max` of them, nearest the way first.
 */
export function walkRoutes(max = 40) {
  const out = [];
  for (const [l, s] of walkSet()) {
    if (out.length >= max) break;
    const P = frame(l), { g0 } = depths(s.tr), u = s.tr.door;
    const w = [P(u, -2.2), P(u, 0.25), P(u, g0 - 0.55), P(u, g0 + 0.55)].map(([x, z]) => [x - HALL.origin[0], z - HALL.origin[1]]);
    w.y0 = 0;
    out.push(w);
  }
  return out;
}

// ── the door lanes ────────────────────────────────────────────────────────────────────────────────────────────
// The street life of src/objects/life.js sets things and people by the doors of the houses; it reads the plans' elements with a rectangle as footprints,
// so each opened house gets a rectangle for its door's lane (the door and a half metre each side, from the room to the lane's far side), which it keeps
// clear (a figure standing in a doorway shut the walker out). The plans build nothing: the element is empty.
export const DOOR_CLEAR = 'uji_door_clear';
export function doorClear(l, tr = traits({ ...l, open: true })) {
  const P = frame(l), u0 = tr.door - tr.dw / 2 - 0.45, u1 = tr.door + tr.dw / 2 + 0.45, a = P(u0, -3.8), b = P(u1, 0.4);
  return { t: DOOR_CLEAR, rect: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])] };
}
export function doorLanePlans() {
  const tiles = new Map(), all = lots(), open = openSet(all);
  for (const [l] of open) { const e = doorClear(l), k = `${Math.floor((e.rect[0] + e.rect[2]) / 200)},${Math.floor((e.rect[1] + e.rect[3]) / 200)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, elements]) => {
    const [i, j] = k.split(',').map(Number);
    return { id: `heian-uji-doorlanes-${k}`, style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [-460, -460, 460, 460], entrance: { at: [0, 0], facing: 'n' }, center: [i * 100 + 100, j * 100 + 100], far: 220, nocollide: true };
  });
}
