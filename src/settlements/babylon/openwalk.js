// The visitor's walk in Babylon (docs/settlements/babylon.md §18): the shops, workshops and furnished houses that stand open along the way in from the arrival, and the
// lanes before their doors kept clear. The gate quarter (the two double rows of lots at the Way's mouth, outside the inner wall) is what the visitor reaches first: eight shops
// and seven furnished houses within 60 m of the arrival, then the houses on the Way's frontage beyond the gate. Pure data and functions (no three.js): the routes walk-check follows,
// and the door lanes the street-life pass reads as footprints.
import { lots } from './layout.js';
import { frame } from '../../styles/sumerian-ur/upper.js';
import { frameOf } from '../../styles/babylonian/shop.js';

/** The arrival (src/planet/arrivals.js: the Way's mouth, facing south). */
export const ARRIVAL = [-40, -370];
const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]);
/** The opened lots (shops and furnished houses), nearest the arrival first. */
export const opened = () => lots().filter((l) => l.open || l.shop).sort((a, b) => near(a) - near(b));

/** A shop's door (babylon_shop: 1.6 m wide, 0.4 to 2.0 m along the front) and an open house's (the Ur plan: its middle 1.27 m from the corner). */
const SHOP_DOOR = 1.2;
const DOOR_LANE = 3.6;

/** Per lot: the rectangle (in the settlement's frame) before its door where nothing of the street life stands. */
export function doorClear(l) {
  if (l.shop) { const F = frameOf(l.rect, l.door); return F.R(SHOP_DOOR - 1.2, -DOOR_LANE, SHOP_DOOR + 1.2, 0); }
  const F = frame({ rect: l.rect, door: l.door }), dc = F.t + 0.72;
  return F.R(dc - 1.2, -DOOR_LANE, dc + 1.2, 0);
}

/**
 * The routes into the opened lots nearest the arrival, for walk-check: a shop: in at the door and down the aisle (the trades keep their tools off the door's line:
 * the baker's trough, the potter's wheel, the loom, the vats stand to the sides); a furnished house: in at the lobby, into the court, along it to the reception room.
 */
export function routes(count = 15) {
  const out = [];
  for (const l of opened().slice(0, count)) {
    let w;
    if (l.shop) {
      const F = frameOf(l.rect, l.door), p = ([u, v]) => F.W(u, v);
      w = [[SHOP_DOOR, -2.2], [SHOP_DOOR, 0.3], [SHOP_DOOR, 1.9]].map(p);
    } else {
      const F = frame({ rect: l.rect, door: l.door }), { W, t, dF, vC0 } = F, dc = t + 0.72;
      w = [W(dc, -2.2), W(dc, 0.3), W(dc, t + 0.9), W(t + 1.4, t + dF - 0.3), W(t + 1.4, vC0 + 1.3), W(t + 1.4, vC0 + 0.5)];
    }
    w.y0 = 0;
    out.push(w);
  }
  return out;
}

/** A lot's door in the settlement's frame: { p (on the wall's outer face), out (unit, away from the house), side (unit, along the front, the way u grows) }. */
export function doorPoint(l) {
  let W, u;
  if (l.shop) { W = frameOf(l.rect, l.door).W; u = SHOP_DOOR; } else { const F = frame({ rect: l.rect, door: l.door }); W = F.W; u = F.t + 0.72; }
  const p = W(u, 0), o = W(u, -1), s = W(u + 1, 0);
  return { p, out: [o[0] - p[0], o[1] - p[1]], side: [s[0] - p[0], s[1] - p[1]] };
}
