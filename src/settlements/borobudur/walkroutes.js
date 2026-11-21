// Sailendra Java — routes of the visitor's walk into the opened places (docs/settlements/borobudur.md §20.1), for tools/walk-check.mjs (plan.walks): each lodging by the way
// (from the yard up its stair, over the veranda, through the door to the middle of the room) and the rest halls. Local [x, z] = world, the plan's origin being 0, 0.
import { houses, WAYHOUSES, wayStalls, HAMLETS, coreOf, CELLS, cellRoom } from './layout.js';
import { rumahPlace } from '../../styles/javanese/index.js';

/** One route into a house: the way's edge, the yard before the stair, the stair's head, the veranda, the door, the room. */
export function houseRoute(h) {
  const Pl = rumahPlace(h), { P, su, u0, vw, D, run } = Pl, vm = (vw + D / 2 - 0.3) / 2;
  const sgn = h.front === 's' ? -1 : 1;
  return [P(su, D / 2 + run + 2.2), P(su, D / 2 + run + 0.4), P(su, D / 2 - 0.4), P(u0, vm), P(u0, vw), P(u0, vw - 1.0)];
}
/** Into an open hall by the stair of its `side` ('n' | 's' | 'e' | 'w'): from 3 m out, up the stair, to the hall's middle. */
export function hallRoute(rect, side, y = 0) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const [ux, uz] = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[side], d = side === 'n' || side === 's' ? (z1 - z0) / 2 : (x1 - x0) / 2;
  const at = (k) => [cx + ux * (d + k), cz + uz * (d + k)];
  return [at(3.4), at(1.9), at(0.8), at(-0.4), at(-2.4)];
}
/** Into a furnished monks' house on the yard: from the yard to the door (a monk's house takes the door's `front`). */
export function walkRoutes() {
  const R = [];
  for (const h of houses()) if (h.hamlet === -1) R.push(houseRoute(h));
  for (const s of wayStalls()) if (s.kind === 'rest') { const [x, z] = s.at; R.push(hallRoute([x - s.w / 2, z - 2.2, x + s.w / 2, z + 2.2], s.side < 0 ? 's' : 'n')); }
  HAMLETS.forEach(([hx, hz], hi) => { if (coreOf(hi) === 'balai') R.push(hallRoute([hx - 4.5, hz - 3.5, hx + 4.5, hz + 3.5], 'e')); });
  R.push(hallRoute([-182, -150, -158, -132], 'e'));
  void CELLS; void cellRoom;
  return R;
}
void WAYHOUSES;
