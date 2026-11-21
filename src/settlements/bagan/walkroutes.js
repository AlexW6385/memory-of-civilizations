// The routes walk-check follows into the opened shops of the visitor's walk (walk.js): in over the front step by the shop's door gap, along the front room to the
// bench. A pure function of the layout (plan.js carries them as `walks`). The door's side is the one shop() draws (src/styles/burmese/shops.js: the second draw of the lot's seed).
import { lots } from './layout.js';
import { walkDistance, frontPoint, WALK_REACH } from './walk.js';
import { rng } from '../../styles/burmese/kit.js';
import { houseSpots } from '../../styles/burmese/houses.js';

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

/** The owner's house behind a shop (town.js houseEls): the same lot, its back part. */
export function ownerHouse(l) {
  const [x0, z0, x1, z1] = l.rect, S = 9.8;
  return { t: 'bgn_house', rect: l.front === 's' ? [x0, z0, x1, z1 - S] : [x0, z0 + S, x1, z1], front: l.front, seed: l.seed + 1, open: true, kind: 'small' };
}
const inR = (r, p) => p[0] > r[0] && p[0] < r[2] && p[1] > r[1] && p[1] < r[3];
/**
 * [{ l, route }] for the owners' houses reached by a lane (layout.js `lane`, `laneBefore`): from the road along the lane to the gap behind the shop, along it to the foot of the house's stair,
 * up the six treads and in at the door. [inferred: the owner's household does not pass through the shop]
 */
export function houseRoutes() {
  const out = [];
  for (const l of lots()) {
    const lane = l.lane ?? l.laneBefore;
    if (!l.shop || !lane || walkDistance(frontPoint(l)) > WALK_REACH) continue;
    const e = ownerHouse(l), sp = houseSpots(e); if (!sp) continue;
    const F = sp.F, W = F.W, a = F.pt(-1.3, 0), uL = inR(lane, a) ? -1.0 : W + 0.65;   // (kept off the lane's middle, where something stands at the lane between the shops at x -15, z 12)
    const pts = [[uL, -12.8], [uL, -0.15], [sp.du, -0.15], [sp.du, 1.0], [sp.du, sp.v0 + 0.4], [sp.du, sp.v0 + 1.6]];
    out.push({ l, route: pts.map(([u, v]) => F.pt(u, v)) });
  }
  return out;
}
