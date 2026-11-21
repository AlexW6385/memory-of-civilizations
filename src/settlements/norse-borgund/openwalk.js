// The visitor's walk (docs/settlements/norse-borgund.md, "Round 6"): from the arrival at the churchyard's gate to the open buildings of the nearest farms.
// Borgund has no shops or street: the places a visitor enters are the farms' dwellings (stue), barns and the priest's farm's smithy, each reached from the
// yard by the door the layout gives it (layout.js doorOf). Routes ride on the landmark's plan (local = world frame, origin [0, 0]); the walk-check walks them.
import { YARD, buildings, doorOf, height } from './layout.js';

const ARRIVAL = [-30, -28];
const OPEN = new Set(['stue', 'barn', 'smithy']);

/** The open buildings nearest the arrival, nearest first (at most n). */
export function nearestOpen(n = 12) {
  const mid = (b) => [(b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2];
  return buildings().filter((b) => OPEN.has(b.kind) && b.farm >= 0)
    .map((b) => ({ b, d: Math.hypot(mid(b)[0] - ARRIVAL[0], mid(b)[1] - ARRIVAL[1]) }))
    .sort((p, q) => p.d - q.d).slice(0, n).map((p) => p.b);
}

/** One route per building: out in the yard (6 m from the door), the door's step, into the room (0.7 m past the door, the front of the room). */
export function openRoutes(n = 12) {
  return nearestOpen(n).map((b) => {
    const { at, n: nn } = doorOf(b);
    const out = [at[0] + nn[0] * 6, at[1] + nn[1] * 6], step = [at[0] + nn[0] * 1.3, at[1] + nn[1] * 1.3], inside = [at[0] - nn[0] * 0.7, at[1] - nn[1] * 0.7];
    return Object.assign([out, step, inside], { y0: height(...out) });
  });
}
void YARD;
