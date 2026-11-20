// The routes into the opened places along the visitor's walk (docs/settlements/manueline-lisbon.md §13.4): from the street, through the
// arched door of each open shop or home, to the front room (the shop: the counter's side, the goods, the keeper). The ten plaza houses
// whose upper floors are open have their own routes (plan.js houseWalks); these are the others. walk-check follows each; they are the
// church landmark plan's `walks`.
import { frame } from '../../styles/greek/agora.js';
import { lots, height } from './layout.js';

/** A way in at u metres along the front: [in the street, the threshold, in the door, in the front room]. */
export function doorRoute(l, u, d = 2.2) {
  const F = frame(l.rect, l.front), { P } = F;
  return Object.assign([P(u, -3.2), P(u, -0.9), P(u, 0.9), P(u, d)], { y0: height(...P(u, -3.2)) });
}
/** Where each lot's way in runs: the door's middle unless a counter, a stove or a stall of goods stands on it (found on the colliders, by walk-check). */
const SHIFT = { '-78,-78': [0, 1.8], '-80,4': [0.7, 2.2], '66,4': [-0.7, 2.2] };
export const keyOf = (l) => `${Math.round(l.rect[0])},${Math.round(l.rect[1])}`;
export function openRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.open || l.up) continue;
    const L = l.rect[2] - l.rect[0], [du, d] = SHIFT[keyOf(l)] ?? [0, 2.2];
    out.push(doorRoute(l, L / 2 + du, d));
  }
  return out;
}
