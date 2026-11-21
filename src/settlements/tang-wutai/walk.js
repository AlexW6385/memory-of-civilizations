// The visitor's walk (docs/settlements/tang-wutai.md §19): the routes from the lane and the courtyard into the places that stand open — the four
// trades, the pilgrims' tea shed, the nearest of the open houses and cave dwellings (door by door, through the yard's gate), the monks' rooms,
// the Hall of Manjusri and the bell pavilion — as waypoints for tools/walk-check.mjs (the plan's `walks`, in the hall plan's local frame, where the
// hall plan's origin is HALL.origin). Pure data from the village's own elements, so a route follows its house when the village moves.

import { HALL, GATE_X, height } from './layout.js';
import { village } from './village.js';
import { frame } from '../../styles/chinese/village.js';
import { rooms as cellRooms } from './cells.js';
import { WENSHU, BELL } from './monastery.js';
import { TEASHED } from './teashed.js';

const [OX, OZ] = HALL.origin;
const loc = ([x, z]) => [+(x - OX).toFixed(2), +(z - OZ).toFixed(2)];
const route = (pts, y0) => { const r = pts.map(loc); r.y0 = y0; return r; };
/** The u of a settlement point in a frame's own axes (the fronts of the yards on the lanes are n or s). */
const uOf = (rect, front, [x, z]) => (front === 'n' ? x - rect[0] : front === 's' ? rect[2] - x : front === 'e' ? z - rect[1] : rect[3] - z);

/** The open houses and dwellings nearest the green, each as { id, route }: lane → gate → yard → door → inside. */
function houseRoutes(n) {
  const v = village(), yards = v.chinese.filter((e) => e.t === 'wutai_yard'), out = [];
  for (const e of v.chinese) {
    if (!((e.t === 'wutai_house' && e.open) || e.t === 'wutai_dwelling')) continue;
    const cx = (e.rect[0] + e.rect[2]) / 2, cz = (e.rect[1] + e.rect[3]) / 2, y = yards.find((q) => cx >= q.rect[0] && cx <= q.rect[2] && cz >= q.rect[1] && cz <= q.rect[3]);
    if (!y || (y.front !== 'n' && y.front !== 's')) continue;
    const fy = frame(y.rect, y.front), fh = frame(e.rect, e.front), gu = y.gate[0], nb = e.nb ?? 3, du = (Math.floor(nb / 2) + 0.5) * fh.L / nb;
    const door = fh.P(du, -1.3), inside = fh.P(du, 1.8), ud = uOf(y.rect, y.front, door);
    const start = fy.P(gu, -1.3);
    out.push({ d: Math.hypot(cx + 76, cz), kind: e.t, route: route([start, fy.P(gu, 1.6), fy.P(gu, 2.6), fy.P(ud, 2.6), door, inside], height(...start)) });
  }
  return out.sort((a, b) => a.d - b.d).slice(0, n);
}

/** The four trades on the main lane's first plots (shops.js: inn, smithy, store, hostel; village.js picks them by their distance from the green). */
function tradeRoutes() {
  // [door x, side of the lane (−1 north, +1 south), how far in]: the doors stand at the plots' middles, but the hostel's (the second cell's) is at its plot's u = 5.95
  return [[-106.6, -1, 8.5], [-106.6, 1, 10], [-126.8, -1, 7], [-127.85, 1, 8.5]].map(([x, s, d]) => route([[GATE_X - 8, 0], [x, 0], [x, s * 4.5], [x, s * d]], height(GATE_X - 8, 0)));
}

/** All the routes: { routes (hall-local waypoints with .y0), names } — at least eight opened places. */
export function visitorWalks() {
  const R = [], names = [];
  const add = (name, r) => { R.push(r); names.push(name); };
  tradeRoutes().forEach((r, i) => add(['inn', 'smithy', 'store', 'hostel'][i], r));
  // the tea shed before the gate: its front is open to the lane
  { const tx = GATE_X - 6.5 + 1.25, tz = 10.5; add('tea shed', route([[GATE_X - 2, 0], [tx, 4], [tx, tz - TEASHED.hd + 1.2]], height(GATE_X - 2, 0))); }   // between the posts (x +1.25)
  for (const h of houseRoutes(10)) add(h.kind === 'wutai_dwelling' ? 'dwelling' : 'house', h.route);
  // the monks' rooms off the lower courtyard (the doors face the axis)
  const at = (x, z) => [OX + x, z];
  for (const rm of cellRooms(at)) {
    const outZ = rm.frontI - rm.s * 3.0, inZ = rm.frontI + rm.s * 3.2;
    const cx = rm.r === 0 ? -40.5 : rm.doorX;                      // (the west rooms by the courtyard's west side: a stone lamp stands on the way down the axis)
    add('cell ' + rm.kind, route([[-34, 0], [cx, 0], [cx, outZ], [rm.doorX, outZ], [rm.doorX, inZ]], 0));
  }
  // the Hall of Manjusri (a door in its middle bay, the platform's stair before it) and the bell pavilion, from the middle terrace
  { const cx = (WENSHU.x0 + WENSHU.x1) / 2; add('Manjusri hall', route([[cx + 3.5, 0], [cx + 3.5, WENSHU.zf + 8], [cx + 3.5, WENSHU.zf + 1.8], [cx + 1.2, WENSHU.zf + 1.8], [cx + 1.2, WENSHU.zf - 2.5]], 6.5)); }   // (round the censer on the axis)
  add('bell pavilion', route([[BELL[0] - 4, 0], [BELL[0] - 4, BELL[1] - 5], [BELL[0] - 4, BELL[1] - 0.3]], 6.5));
  return { routes: R, names };
}
