// Dunhuang c. 850 — the visitor's walk (docs/settlements/dunhuang.md §14). Pure data and two small functions of layout.js and town.js.
// The walk: from the arrival on the main street (14, 0) west over the timber bridge to the apron and the Great Buddha's hall
// (the landmark plan's own first route covers the apron), and east along the street through the market to the caravanserai's
// gate and the east gate. Every lot whose door is on this stretch of street is opened (the style's houses are all hollow and furnished:
// the shops of the nine trades with their keepers, the homes with kang and stove); `walkRoutes` gives the routes walk-check follows in.
import { lots } from './town.js';
import { frame } from '../../styles/dunhuang/town.js';
import { doorU } from '../../styles/dunhuang/homes.js';
import { rng, GATE } from './layout.js';

export const ARRIVAL = [14, 0];
/** The walk's lines [x, z] along the street's axis. */
export const WALK = [
  [[14, 0], [-34, 0]],                      // west: the stream's east bank, the bridge
  [[14, 0], [GATE.x - 4, 0]],               // east: the market, the serai's gate, the east gate
];
export const WALK_REACH = 8;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
export function walkDistance(p) { let b = Infinity; for (const W of WALK) b = Math.min(b, segDist(p, W[0], W[1])); return b; }

/** The routes into the lots that front the main street: [{ l, shop, door: [x, z], route: [[x, z], …] }]. In at the door, along the front room. */
export function walkRoutes() {
  const out = [];
  for (const l of lots()) {
    const f = frame(l.rect, l.front), W = f.W, du = doorU(W, !!l.trade, rng(l.seed * 7 + 3)());
    const door = f.P(du, 0);
    if (walkDistance(door) > WALK_REACH) continue;
    const deep = l.trade ? 1.4 : 2.2;
    out.push({ l, shop: !!l.trade, door, route: [f.P(du, -2.4), f.P(du, -0.4), f.P(du, 0.7), f.P(du, deep)] });
  }
  return out;
}
