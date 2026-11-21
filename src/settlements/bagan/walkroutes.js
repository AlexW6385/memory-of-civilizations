// The routes walk-check follows into the opened shops of the visitor's walk (walk.js): in over the front step by the shop's door gap, along the front room to the
// bench. A pure function of the layout (plan.js carries them as `walks`). The door's side is the one shop() draws (src/styles/burmese/shops.js: the second draw of the lot's seed).
import { lots } from './layout.js';
import { walkDistance, frontPoint, WALK_REACH } from './walk.js';
import { rng } from '../../styles/burmese/kit.js';

/** The door gap's distance along the shop's front (shop(): `dpos`). */
export function shopDoorU(l) {
  const r = rng(l.seed); r();
  const W = (l.front === 'n' || l.front === 's') ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
  return r() < 0.5 ? 0.1 + 1.2 : W - 0.1 - 1.2;
}
/** The world point of a shop's (u along the front from its corner, v into the lot from the street edge). */
export function shopPoint(l, u, v) {
  const [x0, z0, x1, z1] = l.rect;
  return l.front === 's' ? [x0 + u, z1 - v] : l.front === 'n' ? [x0 + u, z0 + v] : l.front === 'e' ? [x1 - v, z0 + u] : [x0 + v, z0 + u];
}
/** [{ l, route: [[x, z], …] }] for every shop on the walk. */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.shop || walkDistance(frontPoint(l)) > WALK_REACH) continue;
    const u = shopDoorU(l);
    out.push({ l, u, route: [shopPoint(l, u, -2.3), shopPoint(l, u, -0.7), shopPoint(l, u, 1.2), shopPoint(l, u, 2.6)] });
  }
  return out;
}
