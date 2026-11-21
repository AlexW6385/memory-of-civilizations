// The routes walk-check follows (walk.js; docs/settlements/qin-xianyang.md §10): the whole way from the arrival in the front gallery to the market's standards, and in at
// the door of each opened place on the walk — the row and court houses and the officials' halls of the main street, the figure-makers' yards (in at the gate) and the market's
// shop-houses (in at the counter's gap). A pure function of the layout; the doors are those of the style's own builders (doorOf).
import { doorOf, frame } from '../../styles/qin/houses.js';
import { lots, MARKET, MWALL } from './layout.js';
import { WALK, walkDistance, frontPoint } from './walk.js';
import { shopLots } from './town.js';

const NOP = new Proxy({}, { get: () => () => {} });
const fr = (rect, front) => frame(rect, front, NOP, NOP);
const SHOP_REACH = 14;

/** The whole way, from the arrival to the standards (one route; y0 the floor of the gallery). */
export function mainRoute() {
  const r = [...WALK[0], ...WALK[1].slice(1), ...WALK[2].slice(1), ...WALK[3].slice(1), ...WALK[4].slice(1)];
  r.y0 = -5;
  return r;
}
/** The way on to the palace's stair and the branch to the figure-makers' street (from the yard), each a route from its start. */
export function branchRoutes() {
  const a = WALK[5].slice(), b = WALK[6].slice();
  a.y0 = 0; b.y0 = 0;
  return [a, b];
}

/** [{ kind, id, route }] — one route for each opened place on the walk (y0 0). */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.open || walkDistance(frontPoint(l)) > 9.5) continue;
    const F = fr(l.rect, l.front), W = F.W, D = F.D, pt = (u, v) => [F.X(u), F.Z(v)];
    let r;
    if (l.trade) { const m = W / 2; r = [pt(m, -2.4), pt(m, 0.6), pt(m, 3.0)]; }
    else if (l.kind === 'row') { const d = doorOf({ kind: l.kind, seed: l.seed, rect: l.rect }); r = [pt(d.u, -2.4), pt(d.u, 0.3), pt(d.u, 1.8)]; }
    else if (l.kind === 'court') { const d = doorOf({ kind: l.kind, seed: l.seed, rect: l.rect }); r = [pt(d.u, -2.4), pt(d.u, 0.3), pt(d.u, 2.6)]; }
    else if (l.kind === 'official') r = [pt(W / 2, -2.4), pt(W / 2, 0.3), pt(W / 2, 3.2)];
    else continue;
    r.y0 = 0; r.kind = l.trade ? 'workshop' : l.kind; r.id = 'lot:' + l.seed;
    out.push(r);
  }
  for (const s of shopLots()) {
    if (walkDistance(frontPoint(s)) > SHOP_REACH) continue;
    const F = fr(s.rect, s.front), W = F.W, pt = (u, v) => [F.X(u), F.Z(v)];
    const r = [pt(W / 2, -2.2), pt(W / 2, 0.3), pt(W / 2, 2.0)];
    r.y0 = 0; r.kind = 'market-shop'; r.id = 'shop:' + s.seed;
    out.push(r);
  }
  void D0; void MARKET; void MWALL;
  return out;
}
const D0 = 0;
