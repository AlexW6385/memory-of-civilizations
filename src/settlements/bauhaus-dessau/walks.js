// The visitor's walk (docs/settlements/bauhaus-dessau.md §15): from the arrival on Mauerstrasse's pavement to the doors of the nearest shops and pubs, and
// into each one's front room (tools/walk-check.mjs walks these routes in the whole settlement). Pure functions of the lots.
import { ARRIVALS } from '../../planet/arrivals.js';
import { Fr } from '../../styles/bauhaus/frame.js';
import { frontOf } from '../../styles/bauhaus/tenement.js';
import { lots } from './layout.js';

/** The door of a lot's ground floor in world metres: { out: a point on the pavement before it, door: on its sill, in: inside, front, lot }. */
export function doorOf(l) {
  const f = frontOf(l), F = new Fr(null, l.rect, l.front);
  return { lot: l, kind: f.kind, out: F.at(f.du, -1.7), door: F.at(f.du, -0.3), in: F.at(f.du, 1.6), inner: F.at(f.du, 3.0) };
}

/** The enterable shops nearest the arrival, nearest first. */
export function nearShops(n = 10) {
  const A = ARRIVALS['bauhaus-dessau'];
  return lots().filter((l) => l.shop).map(doorOf).sort((p, q) => Math.hypot(p.out[0] - A[0], p.out[1] - A[2]) - Math.hypot(q.out[0] - A[0], q.out[1] - A[2])).slice(0, n);
}

/** Routes for plan.walks: each from the pavement before a door, through it, to the room behind. */
export function shopWalks(n = 10) { return nearShops(n).map((d) => [d.out, d.door, d.in, d.inner]); }

/** The modern flats' ground floors (always enterable: tenement.js `enter`) nearest the arrival, nearest first. */
export function nearFlats(n = 6) {
  const A = ARRIVALS['bauhaus-dessau'];
  return lots().filter((l) => !l.shop && l.modern).map(doorOf).sort((p, q) => Math.hypot(p.out[0] - A[0], p.out[1] - A[2]) - Math.hypot(q.out[0] - A[0], q.out[1] - A[2])).slice(0, n);
}
