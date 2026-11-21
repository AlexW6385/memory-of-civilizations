// A Dogon village, c. 1930 — the visitor's walk (docs/settlements/dogon.md §16.1). Pure data and functions of layout.js, no three.js.
// From the arrival on the place (4.5, 27.5) north along the middle lane through the three rows; at each lane between the rows, east or west
// along the fronts to a ginna's open door and in to the central room. Every ginna of the first two rows is enterable (layout.js `open`).
import { COMPOUNDS, LANDMARK, PLACE, PLACE_Y, TOGUNA } from './layout.js';
import { houseOf, frontOf } from '../../styles/dogon/compound.js';

export const ARRIVAL = [4.5, 27.5];
/** z of the walking line in the lane before each row's fronts (the lane between the row and the one below, or the place). */
export const LANE_Z = { C: 12.6, B: -3.2, A: -19.5 };
/** The wells of the place: stone-curbed, one at each end of the place's north edge, clear of the stalls and the lanes. */
export const WELLS = [[17.4, 18.6], [-17.4, 18.4]];

/** The route to a compound's first door and in to the central room: [[x, z]…] (plan frame), with `y0` for the first waypoint's floor. */
export function routeTo(c) {
  const r = houseOf(c).rect, doorX = r[0] + 0.45 + 1.5, hz1 = r[3], iz0 = hz1 - 5.4 + 0.45, lz = LANE_Z[c.row];
  const way = [[-1.0, 36], [-1.0, 26], [-1.0, 14], [-1.0, 12.6], ...(c.row === 'C' ? [] : [[-1.0, lz]])];
  const dx = doorX - -1.0;
  const mid = Math.abs(dx) > 5 ? [[-1.0 + Math.sign(dx) * 4, lz]] : [];
  return Object.assign([...way, ...mid, [doorX, lz], [doorX, hz1 - 1.2], [doorX, iz0 + 1.2]], { y0: PLACE_Y });
}
/** The routes of the walk: the landmark's own (as before) and into eight more opened ginnas of rows C and B. */
export function walks() {
  const out = [], pick = [];
  for (const row of ['C', 'B']) for (const side of [1, -1]) for (const c of COMPOUNDS) if (c.row === row && Math.sign((c.rect[0] + c.rect[2]) / 2) === side && !c.landmark && pick.filter((p) => p.row === row && Math.sign(p.rect[0]) === side).length < 2) pick.push(c);
  out.push(routeTo(LANDMARK));
  for (const c of pick) out.push(routeTo(c));
  return out;
}
/** Where the visitor's eye rests on the walk, for views and for the sound test: the place, a lane crossing, a door. */
export const STOPS = [[4.5, 27.5], [-1, 12.6], [-1, -3.2], [frontOf(LANDMARK).doors[0], 12.6]];
void PLACE; void TOGUNA;
