// The routes walk-check follows into the opened houses and shops of the visitor's walk (docs/settlements/kilwa.md §22): in at the street door, along the
// court to the front room's door and one metre into the room. A function of the layout and of each house's own dry run (house.js `houseFront`).
import { houseFront } from '../../styles/swahili/house.js';
import { lots, isOpen, isDuka, upSet, height, SIMPLE_FROM } from './layout.js';
import { onWalk } from './walk.js';

let MEMO = null;
/** [{ l, f (the house's front facts), route: [[x, z], …] (world), y0 }] for each opened lot of the walk without a stair (those have their own routes, up.js). */
export function walkRoutes() {
  if (MEMO) return MEMO;
  MEMO = [];
  const ups = upSet();
  for (const l of lots()) {
    if (!isOpen(l) || ups.has(l) || !onWalk(l) || l.simple) continue;
    const f = houseFront({ t: 'swahili_house', ...l, open: true, simple: l.dh > SIMPLE_FROM, duka: isDuka(l) });
    if (!f) continue;
    const m = (z) => (f.flip ? 2 * f.zc - z : z);
    const route = [[f.doorX, f.z0 - 1.8], [f.doorX, f.z0 + f.T + 1.3], [f.fdc, f.z0 + f.T + 1.3], [f.fdc, f.zf + 0.9]].map(([x, z]) => [x, m(z)]);
    route.y0 = height(route[0][0], route[0][1]);
    MEMO.push({ l, f, route, y0: route.y0 });
  }
  return MEMO;
}
