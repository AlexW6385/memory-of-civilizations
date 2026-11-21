// Lalibela c. 1220 — what stands on the visitor's walk (docs/settlements/lalibela.md §18): the pilgrims' stalls, their keepers, and the routes
// walk-check follows into the opened houses. Pure functions of layout.js and walk.js.
import { slope, compounds, enterable, HUT, nearHouse, inCut, onLane } from './layout.js';
import { walkDistance, WALK_REACH } from './walk.js';

/** The stalls: { at (the middle of the front), rot (the way the front faces), kind, seed }. Each beside the way it serves, a few metres off its lane. */
export const STALLS = [
  { at: [-272, 118], rot: Math.PI / 2, kind: 'water', seed: 1 },        // at the trench's head, north of the road from the west
  { at: [-246.2, 96], rot: Math.PI, kind: 'candles', seed: 2 },         // on the footpath north, where it leaves the trench's head
  { at: [-205, -24], rot: Math.PI / 2, kind: 'cloth', seed: 3 },        // by the Jordan's road
  { at: [-44, -178], rot: Math.PI, kind: 'candles', seed: 4 },          // on the way to Golgotha's head
  { at: [20, -148], rot: Math.PI, kind: 'water', seed: 5 },             // at Medhane Alem's head
  { at: [1, -190], rot: 0, kind: 'cloth', seed: 6 },                    // on the way down from the north
].map((s) => {
  // on the lowest ground under the stall (the slopes outside the precinct rise): what stands on the higher side is sunk in it, nothing floats
  const c = Math.cos(s.rot), sn = Math.sin(s.rot);
  let y = Infinity; for (const u of [-1.8, 0, 1.8]) for (const v of [-2.3, 0.3]) y = Math.min(y, slope(s.at[0] + c * v - sn * u, s.at[1] + sn * v + c * u));
  return { ...s, y };
});

/** The keeper of a stall: seated behind the counter, facing the front. */
export function keepers() {
  return STALLS.map((s) => {
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    return { at: [s.at[0] + c * -1.55, s.at[1] + sn * -1.55], y: s.y + 0.02, rot: Math.atan2(-c, -sn), kind: s.kind, seed: s.seed };
  });
}
/** Where the keeper's wares are best reached from: the middle of the stall's front. */
export const frontOf = (s, d = 1.4) => [s.at[0] + Math.cos(s.rot) * d, s.at[1] + Math.sin(s.rot) * d];

/** Routes [{ plan: 'k' (the quadrant), route: [[x, z], …], y0 }] into every opened house within WALK_REACH of the walk, in at the door and on to the middle of the room. */
export function houseRoutes(quad) {
  const out = [];
  const byMain = new Map(compounds().map((q) => [q.main, q]));
  for (const h of enterable()) {
    const q = byMain.get(h); if (!q) continue;
    const u = [Math.cos(h.door), Math.sin(h.door)], at = (d) => [h.c[0] + u[0] * d, h.c[1] + u[1] * d];
    const back = Math.hypot(q.c[0] - h.c[0], q.c[1] - h.c[1]);
    const t = [-u[1], u[0]], P = (d, sd) => [h.c[0] + u[0] * d + t[0] * sd, h.c[1] + u[1] * d + t[1] * sd];
    // (the yard keeps the way from the gate to the door clear: zagwe/compound.js)
    out.push({ plan: quad(...h.c), id: h.enter, c: h.c, dist: walkDistance(h.c), route: [P(back + q.R + 3, 0), P(back + q.R, 0), P(h.r + 1.4, 0), P(h.r + 0.3, 0), P(2.4, 0)], y0: slope(...P(back + q.R + 3, 0)) });
  }
  return out;
}
/** The route into the house beside the arrival (HUT). */
export function hutRoute() {
  const u = [Math.cos(HUT.door), Math.sin(HUT.door)], at = (d) => [HUT.c[0] + u[0] * d, HUT.c[1] + u[1] * d];
  return { route: [at(HUT.r + 3.2), at(HUT.r + 0.3), at(2.4)], y0: slope(...at(HUT.r + 3.2)) };
}
/** Routes to the front of each stall, from the way. */
export function stallRoutes() { return STALLS.map((s) => ({ route: [frontOf(s, 5), frontOf(s, 1.5)], y0: slope(...frontOf(s, 5)) })); }
void nearHouse; void inCut; void onLane; void WALK_REACH;
