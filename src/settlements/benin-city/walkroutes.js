// The routes walk-check follows into the compounds of the visitor's walk (walk.js): in at the street door (the gap of a trading front's counter), along the
// front room to the mouth of the passage, through it to the court. A pure function of the layout and of each compound's own numbers (house.js `houseDoor`).
import { frame } from '../../styles/greek/agora.js';
import { houseDoor } from '../../styles/benin/house.js';
import { lots, height } from './layout.js';
import { onWalk } from './walk.js';

let MEMO = null;
/** [{ l, kind, route: [[x, z], …] (world), y0 }] for every compound of the walk (the chief's houses too: their stair stands clear of the passage). */
export function walkRoutes() {
  if (MEMO) return MEMO;
  MEMO = [];
  for (const l of lots()) {
    if (!onWalk(l)) continue;
    const F = frame(l.rect, l.front), H = houseDoor(l, F.L), fd = H.fd;
    const route = H.kind === 'trade'
      ? [F.P(H.door, -2.4), F.P(H.door, 0.0), F.P(H.door, 2.4), F.P(H.pass, 2.4), F.P(H.pass, fd + 0.9)]
      : [F.P(H.door, -2.4), F.P(H.door, 0.6), F.P(H.door, 2.4), F.P(H.pass, fd + 0.9)];
    route.y0 = height(route[0][0], route[0][1]);
    MEMO.push({ l, kind: H.kind, route, y0: route.y0 });
  }
  return MEMO;
}
