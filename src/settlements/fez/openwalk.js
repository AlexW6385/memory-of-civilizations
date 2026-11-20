// The routes into the opened places along the visitor's walk (docs/settlements/fez.md §16.4): from the lane, over the 0.3 m step into the cell of a dukkan
// (styles/marinid/front.js dukkan: 1.45 m deep, floor 0.3 m above the lane, the keeper's cushion at the back), and through the door and the passage
// of the open houses to the middle of the court. walk-check follows each; they are the landmark plan's `walks`.
//
// Which dukkans and houses are listed was found by walking every one of them near the visitor's stations (the arrival, the Talaa Kebira, the souk, the
// Place Seffarine, the funduq) with the viewer's own body (tools/walk-check.mjs): a cell can be entered only where the goods stand clear of the step's
// first half metre (the walker's stair rule reads a shelf there as a wall), so the list is the cells that pass, named by their house's rect and the bay.
import { ground0 } from './layout.js';
import { houseList } from './houses.js';
import { planOf } from '../../styles/marinid/house.js';
import { frame } from '../../styles/mamluk/kit.js';

/** [house rect rounded, bay index]: the dukkans entered. */
export const SHOPS = [
  ['-75,-104,-54,-87', 0], ['-75,-104,-54,-87', 1], ['-52,-102,-37,-87', 0], ['-128,-85,-115,-57', 1], ['-101,-54,-82,-23', 0], ['-101,-54,-82,-23', 1],
  ['-168,-19,-156,3', 0], ['-168,3,-156,21', 0], ['-102,2,-86,21', 0], ['-65,1,-54,21', 0], ['-42,-19,-27,2', 0], ['-42,2,-27,21', 0], ['-25,-19,-14,-1', 0],
  ['21,-19,33,3', 0], ['35,3,55,21', 0], ['57,3,71,21', 0], ['117,3,127,21', 0], ['73,59,91,87', 0], ['73,59,91,87', 1],
];
/** The open houses entered through the passage into the court. */
export const HOUSES = ['-132,-122,-115,-87', '103,-106,116,-87', '-114,-54,-103,-23', '-190,1,-180,21', '21,-19,33,3'];

const key = (h) => h.rect.map(Math.round).join(',');
/** The routes: [[x, z] in the lane, on the sill, in the cell (or: through the passage, in the court)], each with the lane's level as y0. */
export function openWalks() {
  const H = houseList(), out = [];
  for (const [k, i] of SHOPS) {
    const h = H.find((q) => key(q) === k && q.shops), P = h && planOf(h), b = P?.bays[i];
    if (!b) continue;
    const fr = frame(h.rect, h.door), um = (b.u0 + b.u1) / 2;
    out.push(Object.assign([fr.P(um, 1.6), fr.P(um, 0.3), fr.P(um, -0.4)], { y0: ground0(...fr.P(um, 1.5)) }));
  }
  for (const k of HOUSES) {
    const h = H.find((q) => key(q) === k && q.open && !q.up);
    if (!h) continue;
    const P = planOf(h), fr = frame(h.rect, h.door), uc = (P.cu0 + P.cu1) / 2;
    out.push(Object.assign([fr.P(P.ud, 1.8), fr.P(P.ud, 0.3), fr.P(P.ud, -(P.Dc0 - 0.3)), fr.P(uc, -(P.Dc0 + 0.7)), fr.P(uc, -(P.Dc0 + P.Dc1) / 2)], { y0: ground0(...fr.P(P.ud, 1.5)) }));
  }
  return out;
}
