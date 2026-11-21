// The routes walk-check follows (walk.js): the whole way from the arrival to the palace's hall and to the market's tower, and in at the door of each opened place
// on it — the lodgings of the garden, the offices of the avenue, the houses of the first ward's lane, the market's shops (in at the counter's flap). A pure function
// of the layout; the doors are read from the style's own builder (houseDoors) and from the shop row's own numbers (houses.js shopRow).
import { lots, LODGES, MARKET, MARKET_WALL } from './layout.js';
import { walkDistance, frontPoint, WALK_REACH } from './walk.js';
import { houseDoors, shopDoors } from '../../styles/wei/houses.js';
import { marketRows } from './town.js';
import { lotFrame } from '../../styles/han/kit.js';

const NOOP = new Proxy({}, { get: () => () => {} });
const frame = (rect, front) => lotFrame({ bag: NOOP, col: NOOP }, rect, front);

/** The long ways: to the palace's hall, to the first ward's lane, to the market's tower (y0: the arrival's floor). */
export function mainRoutes() {
  const a = [[-119, -88], [-111, -88], [-111, -42], [-100, -42], [-100, 25], [0, 25], [0, 8], [0, -8], [0, -36], [0, -48], [0, -56], [0, -66], [0, -72]];
  const b = [[0, 25], [0, 60], [-14, 60], [-14, 74.15], [-30, 74.15], [-90, 74.15]];
  const c = [[0, 25], [182, 25], [182, 50], [182, 88]], d = [[134, 104], [170, 104]], e = [[194, 104], [230, 104]];
  const f = [[0, 60], [14, 60], [14, 74.15], [30, 74.15], [60, 74.15]];
  for (const r of [a, b, c, d, e, f]) r.y0 = 0;
  return [a, b, c, d, e, f];
}

/** [{ route, kind, id }] for each opened place on the walk, y0 on the route. */
export function walkRoutes() {
  const out = [], push = (r, kind, id) => { r.y0 = 0; r.kind = kind; r.id = id; out.push(r); };
  // the lodgings of the garden: from the path at the door's lane, through the gate or to the hall's door, in
  for (const l of LODGES) {
    const D = houseDoors({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, room: l.room }), F = frame(l.rect, l.front);
    push(doorRoute(F, D, l.kind), 'lodge', 'lodge:' + l.seed);
  }
  // the houses (and the offices) of the visitor's walk
  for (const l of lots()) {
    if (!l.walk) continue;
    if (l.kind === 'office') {
      const cx = (l.rect[0] + l.rect[2]) / 2, z1 = l.rect[3];
      push([[cx, z1 + 2.2], [cx, z1 - 0.5], [cx, z1 - 4.5], [cx, z1 - 7.6], [cx, z1 - 9.6]], 'office', 'lot:' + l.seed);
      continue;
    }
    const D = houseDoors({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed }), F = frame(l.rect, l.front);
    push(doorRoute(F, D, l.kind), l.kind, 'lot:' + l.seed);
  }
  // the market's shops along the walked lanes, in at the counter's end and to the middle of the room
  for (const row of marketRows(MARKET, 600)) {
    const F = frame(row.rect, row.front), ds = shopDoors(row);
    ds.forEach((d, i) => {
      if (walkDistance(F.pt(d.gate, 0)) > WALK_REACH + 1) return;
      push([F.pt(d.gate, -2.4), F.pt(d.gate, 0.3), F.pt(d.gate, 2.0), F.pt(d.gate, 3.4)], 'market-shop', `row:${row.seed}:${i}`);
    });
  }
  return out;
}

/** From the lane outside, through the gate (court and tower houses) to the hall's door and in. */
function doorRoute(F, D, kind) {
  const r = [F.pt(kind === 'row' ? D.du : D.gateU, -2.2)];
  if (kind !== 'row') r.push(F.pt(D.gateU, 0.3), F.pt(D.gateU, D.v - 1.0), F.pt(D.du, D.v - 1.0));
  else r.push(F.pt(D.du, D.v - 1.4));
  r.push(F.pt(D.du, D.v + 0.3), F.pt(D.du, D.v + 1.5));
  return r;
}
void walkDistance; void frontPoint; void WALK_REACH; void MARKET; void MARKET_WALL;
