// The houses whose upper floors are walked (docs/settlements/bhaktapur.md §16): the enterable houses nearest the arrival and along the way from it,
// of the trades and kinds the town has (the family house on the square, shop-houses of cloth, brass, the carver and the grain merchant, the weaver's
// and the farmer's dwellings), each of three or four storeys, wide and deep enough for the ladder-stairs.

import { lots, HOUSE, fp } from './layout.js';

const AR = [19, 21];
const dims = (l) => (l.front === 'n' || l.front === 's' ? [l.rect[2] - l.rect[0], l.rect[3] - l.rect[1]] : [l.rect[3] - l.rect[1], l.rect[2] - l.rect[0]]);
const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - AR[0], (l.rect[1] + l.rect[3]) / 2 - AR[1]);
let _sel = null;
/** The opened lots (not HOUSE), nearest first: { l, kind }. */
export function openedLots() {
  if (_sel) return _sel;
  const out = [], seen = {};
  for (const l of lots().filter((q) => q.open && (q.light || q.upper) && !q.use && q.trade !== 'curd' && q.trade !== 'pots' && q.n >= 3).sort((a, b) => dist(a) - dist(b))) {
    const [W, D] = dims(l);
    if (W < 6.8 || D < 9.6 || dist(l) > 62) continue;
    const key = l.trade + l.n;
    if ((seen[key] ?? 0) >= 2) continue;
    seen[key] = (seen[key] ?? 0) + 1;
    out.push(l);
    if (out.length >= 11) break;
  }
  for (const l of out) { l.floors = true; l.balcony = l.n >= 4 ? true : l.seed % 2 === 0; }
  return (_sel = out);
}
export { HOUSE, fp, dims };

const T = 0.55;
/** Walk-check routes (world [x, z]) for each opened house: from the street through the door and up the ground flight to its first floor, round the rooms, up each ladder-stair, onto the long window's seat and the balcony, to the kitchen under the roof. */
export function upRoutes() {
  const all = [{ l: HOUSE, home: true, trade: 'home', dx: 4.5, balcony: true, rect: HOUSE.rect, front: HOUSE.front, n: HOUSE.n }, ...openedLots()];
  return all.map((l) => {
    const [W, D] = dims(l), n = l.n, xs = W - T - 2.95, home = !!l.door;
    const OW = home ? 1.3 : Math.min(4.6, W - 2.4), ox = home ? Math.max(T + 0.45, Math.min(l.dpos ?? 1.2, W - T - 3.65 - OW)) : (W - OW) / 2, dc = ox + OW / 2;
    const r = [], p = (lx, lz) => fp(l, lx, lz), add = (lx, lz) => r.push(p(lx, lz));
    const sx = W / 2 - 1.15, rx = xs + 1.7, back = D - T - 1.0;
    add(dc, -2.0); add(dc, 0.7); add(xs, 1.4); add(xs, 4.7);                    // the street, the door, the foot of the stair, the first floor
    if (n >= 4) {
      add(rx, 4.9); add(rx, 2.0); add(rx, 4.9); add(xs, 7.8); add(xs, 4.8); add(xs, 5.4); add(xs, 6.9);          // the sleeping floor: the front and back rooms
      add(rx, 6.9); add(rx, 3.6); add(sx, 3.6); add(sx, 1.2); add(sx, 0.4);                            // the living floor: the long window's seat
      if (l.balcony) { add(W / 2, 1.6); add(W / 2, -0.35); add(W / 2, 1.6); }
      add(T + 0.65, 1.3); add(T + 0.65, 3.6);                                                          // the ladder-stair to the kitchen
      add(xs - 0.5, 5.4); add(xs - 0.5, back);
    } else {
      add(rx, 4.9); add(sx, 4.9); add(sx, 1.2); add(sx, 0.4);                            // the living floor: the long window's seat
      if (l.balcony) { add(sx, 1.6); add(sx, -0.35); add(sx, 1.6); }
      add(sx, 4.7); add(xs, 4.75); add(xs, 5.3); add(xs, 6.9); add(xs, back > 8 ? 8.2 : 7.3);
    }
    return r;
  });
}
