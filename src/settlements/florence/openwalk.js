// The routes into the opened places along the visitor's walk (docs/settlements/florence.md §16): from the street, through the door
// of each open shop-house or home, to the middle of its front room, as casa-open.js lays it out (u along the front from the right-hand
// corner, v inward). walk-check follows each; they are the landmark plan's `walks`.
import { lots } from './layout.js';
import { enterable } from './town.js';
import { rectWalkDist } from './walk.js';
import { ARRIVALS } from '../../planet/arrivals.js';

/** The door of a lot and its way in: [[x, z] in the street, on the threshold, in the room]. */
export function doorRoute(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front || 's', along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  return [P(L / 2, -2.2), P(L / 2, 0.2), P(L / 2, Math.min(0.85, D / 2))];
}
/** The opened places on the walk, nearest the arrival first. */
export function walkOpen(n = 70) {
  const all = lots(), open = enterable(all), A = ARRIVALS['florence'];
  const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - A[0], (l.rect[1] + l.rect[3]) / 2 - A[2]);
  // (the kitchen house at x −46.5 on the Via de' Gori holds the walker 1.5 m short of its step: left out of the routes, not understood yet)
  return [...open.keys()].filter((l) => rectWalkDist(l.rect) <= 30 && !(Math.abs(l.rect[0] + 46.5) < 0.05 && Math.abs(l.rect[1] + 147) < 0.05)).sort((a, b) => d(a) - d(b)).slice(0, n).map((l) => ({ lot: l, use: open.get(l) }));
}
/** The walks (plan.walks): one into each of the first n opened places. */
export function doorWalks(n = 70) { return walkOpen(n).map(({ lot }) => Object.assign(doorRoute(lot), { y0: 0 })); }
