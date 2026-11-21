// The row houses whose front parlour is open (docs/settlements/new-york.md §16): the three rows of brownstones nearest the arrival each open
// their first house (stoop walked, door ajar, a furnished front room). Pure data from layout.js, read by the town, the night light and the walks.
import { lots, toCity } from './layout.js';
import { face, rowPlan, parlourSpot } from '../../styles/artdeco/blocks.js';

const ARRIVAL = [-14.15, 37.89], HOW_MANY = 3;
let OPEN = null;
function decide() {
  if (OPEN) return;
  OPEN = new Map();
  const mid = (r) => toCity((r[0] + r[2]) / 2, (r[1] + r[3]) / 2);
  const cand = lots().filter((l) => l.row && l.front && l.rect[2] - l.rect[0] >= 5.8).map((l) => ({ l, d: Math.hypot(mid(l.rect)[0] - ARRIVAL[0], mid(l.rect)[1] - ARRIVAL[1]) })).sort((a, b) => a.d - b.d);
  for (const { l } of cand.slice(0, HOW_MANY)) OPEN.set(l, [0]);
}
/** The indices of a row lot's houses with an open parlour, or undefined. */
export const openRowOf = (l) => { decide(); return OPEN.get(l); };
export const openRows = () => { decide(); return [...OPEN].map(([l, idx]) => ({ l, idx })); };
/** The route in from the street, in the grid's frame: the pavement beside the stoop's foot, up the stoop along the front, through the door, into the room. */
export function parlourRoute(l, i = 0) {
  const F = face(l.rect, l.front), plan = rowPlan(l.rect, l.front, l.h, l.seed), { c0, c1, mir } = plan[i], left = (u) => (mir ? c1 - u : c0 + u), dU = 0.35, dW = 1.65, sU0 = dU + dW + 0.15, run = 2.2;
  const pt = (u, d) => { const p = F.P(left(u), d, 0); return [p[0], p[2]]; };
  // (the lane of the steps at 0.25 m from the wall, clear of the rail at their edge; on the landing at 0.6 m, between the jambs and the landing's rail)
  return { y0: l.y, pts: [pt(sU0 + run - 0.5, 2.6), pt(sU0 + run - 0.5, 0.25), pt(sU0 + 1.2, 0.25), pt(sU0 + 0.3, 0.45), pt(dU + dW / 2 + 0.4, 0.6), pt(dU + dW / 2, 0.5), pt(dU + dW / 2, -0.9), pt(dU + dW / 2, -2.6), pt(dU + dW / 2 + 1.0, -3.2)] };
}
/** Is the grid point in the pavement strip before an opened house (its stoop's foot and the way to it)? Street furniture is kept off it. */
export function inParlourFront(x, z, m = 0.6) {
  return openRows().some(({ l, idx }) => { const plan = rowPlan(l.rect, l.front, l.h, l.seed); return idx.some((i) => { const x0 = l.rect[0] + plan[i].c0 - m, x1 = l.rect[0] + plan[i].c1 + m; return x >= x0 && x <= x1 && (l.front === 's' ? z >= l.rect[3] - 0.5 && z <= l.rect[3] + 3.4 + m : z <= l.rect[1] + 0.5 && z >= l.rect[1] - 3.4 - m); }); });
}
export { parlourSpot, rowPlan };
