// The routes walk-check follows into the opened ground floors of the visitor's walk: from the lane, in at the door, along the front room.
import { shops, doorOf } from './layout.js';
import { walkDistance } from './walk.js';

/** One route per opened shop within reach of the walk (and the far ones within 40 m of it): [[x, z], …]. */
export function shopRoutes() {
  const out = [];
  for (const l of shops()) {
    const u = doorOf(l), n = l.front === 'n', zf = n ? l.rect[1] : l.rect[3], s = n ? 1 : -1;
    if (walkDistance([u, zf]) > 40 && !l.sq) continue;
    const r = [[u, zf - s * 2.0], [u, zf - s * 0.2], [u, zf + s * 1.0], [u, zf + s * 2.0]];
    r.shop = l.shop.trade;
    out.push(r);
  }
  return out;
}
