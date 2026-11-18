// The visitor's ways up (docs/settlements/mughal-agra.md §16): for each house with an open upper floor, a route from the street through
// the door (or the shop's front), up the stair to the first upper room, out onto the balcony or loggia and back, on up to the third
// storey where there is one, and out onto the roof through the stair head.
import { houses } from './layout.js';
import { layoutOf } from '../../styles/mughal/townhouse.js';
import { wellOf, mumtyOf } from '../../styles/mughal/upper.js';

export function upWalks() {
  const out = [];
  for (const h of houses()) {
    if (!h.up) continue;
    const L = layoutOf({ t: 'haveli', ...h }), { f, hw, D, dx, shop, st } = L, T = 0.4, w = wellOf(L), m = mumtyOf(L);
    const xs = (w.x0 + w.x1) / 2, back = -D + T, zb = back + 15 * 0.27, zb1 = back + 17 * 0.27, ex = w.x1 + 0.9, dxr = w.x1 + 0.55;
    const nCol = Math.max(1, Math.round((L.W - 0.8) / 2.7)), bw = (L.W - 0.8) / nCol, xin = shop ? -hw + 0.4 + bw * (Math.min(nCol, 2) - 0.5) : dx;
    const jx = shop ? 0 : dx;
    const P = [[xin, 1.8], [xin, 0.6], [xin, -1.2], [xs, -1.6], [xs, zb1 + 0.6], [xs, back + 0.4], [ex, back + 0.45], [ex, back + 5],           // street, door, ground room, up to the first upper room
      [jx, -2.2], ...(L.variant === 'jharokha' ? [[jx, -0.3], [jx, 0.6]] : [[jx, -0.3], [jx, 0.1]]), [jx, -2.2], [ex, -2.2], [ex, zb + 0.6],     // the balcony and back
      [xs, zb + 0.6], [xs, back + 0.4], [ex, back + 0.45]];
    if (st === 3) P.push([ex, back + 5], [ex, zb + 0.6], [xs, zb + 0.6], [xs, back + 0.4], [ex, back + 0.45]);
    P.push([dxr, m.z1 - 0.5], [dxr, m.z1 + 1.1], [dxr + 0.5, m.z1 + 2.5]);                                                                     // the stair head's door, the roof
    const route = P.map(([a, b]) => f.pt(a, b)); route.y0 = 0;
    out.push(route);
  }
  return out;
}
