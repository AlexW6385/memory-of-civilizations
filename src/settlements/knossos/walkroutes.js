// The routes walk-check follows into the opened lots of the visitor's walk (walk.js): in at the door, along the front room to the counter or the
// middle of the room. A pure function of the layout (town.js puts them on a plan of their own: `walks`).
import { openHouses, upstairsHouses, height } from './layout.js';
import { walkDistance, frontPoint, WALK_REACH } from './walk.js';
import { dwellingFrame } from '../../styles/minoan/town.js';

/** [{ l, kind, route: [[x, z], …], y0 }] for every opened lot on the walk (one route each). */
export function walkRoutes() {
  const open = openHouses(), up = upstairsHouses(), out = [];
  for (const [l, kind] of open) {
    if (walkDistance(frontPoint(l)) > WALK_REACH) continue;
    const F = dwellingFrame({ rect: l.rect, front: l.front, seed: l.seed }), deep = Math.min(F.D - 2.2, kind === 'shop' ? 1.3 : 3.6);
    const route = [F.P(F.du, -2.4), F.P(F.du, 0.3), F.P(F.du, 1.0), F.P(F.du, deep)];
    const [x, z] = route[0];
    out.push({ l, kind, up: up.has(l), route, y0: height(x, z) });
  }
  return out;
}
