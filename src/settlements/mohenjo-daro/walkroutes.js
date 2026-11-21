// The routes walk-check follows into the opened lots of the visitor's walk (walk.js): from the lane in at the door, past the baffle wall, into the court.
// A pure function of the layout; the door's place is the style's own (src/styles/indus/house.js: the second draw of the lot's generator).
import { lots, houseEl, doorU } from './layout.js';
import { lotFrame } from '../../styles/indus/kit.js';

const sink = new Proxy(function () {}, { get: () => sink, apply: () => sink });
/** [{ l, route: [[x, z], …], y0 }] for every opened lot of the walk that has no upstairs route of its own. */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    if (!l.walk || l.up) continue;
    const el = houseEl(l);
    const F = lotFrame({ bag: sink, col: sink }, el.rect, el.front, el.y ?? 0), du = doorU(l);
    out.push({ l, route: [[du, -2.2], [du, 0.35], [du, 1.2], [du, 3.0]].map(([u, v]) => F.pt(u, v).map((q) => +q.toFixed(2))), y0: el.y ?? 0 });
  }
  return out;
}
