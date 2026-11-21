// A Balinese temple village — routes of the visitor's walk into the opened places (docs/settlements/bali-village.md §13.1), for tools/walk-check.mjs (plan.walks): into each
// trade's stall by its two steps, and from each gate on the walk round the spirit wall to the natah and across it to the sleeping house's door and into its room. World
// [x, z] (the pura plan's origin is 0, 0). Pure data and functions of layout.js and the compound's own frame (compoundParts).
import { lots, lotFrame, WANTILAN, DALEM_C } from './layout.js';
import { compoundParts } from '../../styles/balinese/compound.js';
import { walkDistance, WALK_REACH } from './walk.js';

/** A lot's own (u, v) of a world point: u along the street from the left as one looks in, v inward. */
function uvOf(l, x, z) {
  const [x0, z0, x1, z1] = l.rect;
  return l.front === 'n' ? [x - x0, z - z0] : l.front === 's' ? [x1 - x, z1 - z] : l.front === 'w' ? [z1 - z, x - x0] : [z - z0, x1 - x];
}
const faceVec = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };

/** Where along the stall's width (from its middle, in m) each trade's aisle runs: clear of the loom's bench, the table, the wheel, the counter and the stacked baskets. */
const LANE = { warung: 0, pande: 0, carver: 0, weaver: -1.9, offerings: 1.9, potter: -1.0, cloth: 1.0, basket: -1.0 };
/** Into a trade's stall: from the street, up the steps, along the aisle to the stall's depth. */
export function shopRoute(l) {
  const F = lotFrame(l), { u0, u1, d, kind } = l.shop, um = (u0 + u1) / 2, ua = um + (LANE[kind] ?? 0);
  return [F(um, -2.2), F(um, -0.4), F(um, 0.25), F(ua, 0.5), F(ua, d - 1.1)];
}

/**
 * From the street through the gate, round the spirit wall's far end (the door leaf stands on the near one), along the natah's front strip at depth `cv`, across to the
 * door's line and in at the sleeping house's door. `side` ±1: which end of the spirit wall; null if the lot has no sleeping house.
 */
export function houseRoute(l, cv = 2.9, side = 1, dl = 0, into = 1.0) {
  const parts = compoundParts({ rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF, shop: l.shop });
  if (!parts.house) return null;
  const F = lotFrame(l), [gu] = uvOf(l, l.gate[0], l.gate[1]), [hx0, hz0, hx1, hz1] = parts.house.rect, dv = faceVec[parts.house.door];
  const hc = [(hx0 + hx1) / 2, (hz0 + hz1) / 2], half = [(hx1 - hx0) / 2, (hz1 - hz0) / 2];
  const door = [hc[0] + dv[0] * half[0], hc[1] + dv[1] * half[1]];
  const [du, dvv] = uvOf(l, door[0] + dv[0] * 1.6, door[1] + dv[1] * 1.6), [iu, iv] = uvOf(l, door[0] - dv[0] * into, door[1] - dv[1] * into), [ju, jv] = uvOf(l, door[0] + dv[0] * 0.4, door[1] + dv[1] * 0.4);
  const out = [F(gu, -2.0), F(gu, 0.3), F(gu, 1.0), F(gu + side * 2.4, 1.0), F(gu + side * 2.4, cv)];
  out.push(F(du + dl, cv), F(du + dl, dvv), F(du, dvv), F(ju, jv), F(iu, iv));
  return out;
}

/** The way across the natah that clears each compound's furniture, found by walking it (tools/walk-check.mjs): the lateral offset of the door's approach, by lot seed; 2.4 else. */
const ACROSS = { 1771: [-2.4], 173854: [-2.4], 603935: [-2.4], 838592: [-2.4], 887181: [-2.4], 66531: [0], 975018: [3.2, 3.6] };
/** Lots whose sleeping house the natah's furniture shuts off from the gate (a shallow lot at the crossing): no route. */
const NO_HOUSE = new Set([880688]);

/** The lots on the walk. */
export const onWalk = (l) => walkDistance(l.gate) <= WALK_REACH;
/** The routes (world [x, z] waypoints): every stall on the walk, every sleeping house that can be reached. */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!onWalk(l)) continue;
    if (l.shop) out.push(shopRoute(l));
    if (!NO_HOUSE.has(l.seed)) { const [dl, cv] = ACROSS[l.seed] ?? [2.4, 2.9], r = houseRoute(l, cv ?? 2.9, 1, dl); if (r) out.push(r); }
  }
  // the banjar's wantilan by its south stair from the cross lane, and the pura dalem through its split gate from the street
  const wx = (WANTILAN[0] + WANTILAN[2]) / 2;
  out.push([[3, 9.5], [12, 9.5], [wx, 9.5], [wx, WANTILAN[3] + 1.6], [wx, WANTILAN[3] - 1.0]]);
  out.push([[2, DALEM_C[1]], [5, DALEM_C[1]], [9, DALEM_C[1]], [15, DALEM_C[1]]]);
  return out;
}
