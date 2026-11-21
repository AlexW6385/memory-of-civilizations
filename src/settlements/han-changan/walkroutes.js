// The routes walk-check follows into the opened places of the visitor's walk (walk.js): the whole way from the arrival to the market tower, and in at the
// door of each opened place on it — the service quarters' row and store houses, the avenue's offices, the East Market's shops (in at the counter's flap).
// A pure function of the layout; the doors are read from the style's own builders (houseDoors) and from the shop row's own numbers (market.js).
import { lots, inService, serviceKind, marketShops, EAST_MARKET } from './layout.js';
import { WALK, ARRIVAL, WALK_REACH, OFFICE_REACH, walkDistance, frontPoint } from './walk.js';
import { houseDoors } from '../../styles/hanlodge/index.js';
import { lotFrame } from '../../styles/han/kit.js';

const NOOP = new Proxy({}, { get: () => () => {} });
const frame = (rect, front) => lotFrame({ bag: NOOP, col: NOOP }, rect, front);
const SEED_SHOP = 700;                                                 // the East Market's shop rows (town.js)

/** The whole way: the arrival at the ramp's head to the market tower (one route, y0 the arrival's floor). */
export function mainRoute() {
  const r = [[ARRIVAL[0], ARRIVAL[1]], [-110, -91.5], [-110, -76], [-60, -75.75], [-36.5, -75.75], [-33, -80], [-33, -104], [100, -104], [150, -104], [150, -262], [190, -262], [190, -280], [203, -280], [252, -280]];
  r.y0 = 7.3;
  return r;
}

/** [{ kind, id, route: [[x, z], …], y0: 0 }] for each opened place on the walk. */
export function walkRoutes() {
  const out = [];
  // the service quarters' houses whose fronts give on the walk's lanes: a row house or a store is entered at its door off the lane
  for (const l of lots()) {
    if (!inService(l) || walkDistance(frontPoint(l)) > WALK_REACH) continue;
    const kind = serviceKind(l);
    if (kind !== 'row' && kind !== 'shop') continue;
    const D = houseDoors({ rect: l.rect, front: l.front, kind, seed: l.seed }), F = frame(l.rect, l.front);
    if (D.du === undefined) continue;
    const r = [F.pt(D.du, -2.2), F.pt(D.du, 0.1), F.pt(D.du, D.v0 + 1.4), F.pt(D.du, D.v0 + 2.6)];
    r.y0 = 0; r.kind = kind; r.id = 'lot:' + l.seed;
    out.push(r);
  }
  // the avenue's offices: in at the compound's gate, across the yard to the hall's middle bay
  for (const l of lots()) {
    if (l.kind !== 'office') continue;
    const fp = frontPoint(l);
    if (walkDistance(fp) > OFFICE_REACH) continue;
    const cx = (l.rect[0] + l.rect[2]) / 2, z1 = l.rect[3], r = [[cx, z1 + 2.2], [cx, z1 - 3], [cx, z1 - 6.2], [cx, z1 - 9.5]];
    r.y0 = 0; r.kind = 'office'; r.id = 'lot:' + l.seed;
    out.push(r);
  }
  // the East Market's shops along the walked lanes, in at the counter's flap (the opening's middle) and to the table behind
  marketShops(EAST_MARKET, SEED_SHOP).forEach((row) => {
    const F = frame(row.rect, row.front), sw = (row.rect[2] - row.rect[0]) / row.n;
    for (let i = 0; i < row.n; i++) {
      const u0 = i * sw, mid = u0 + sw / 2, c = F.pt(mid, 0);
      if (walkDistance(c) > WALK_REACH + 1) continue;
      const r = [F.pt(mid, -2.4), F.pt(mid, 0.3), F.pt(mid, 2.0), F.pt(mid, 3.4)];
      r.y0 = 0; r.kind = 'market-shop'; r.id = `row:${row.seed}:${i}`;
      out.push(r);
    }
  });
  void WALK;
  return out;
}
