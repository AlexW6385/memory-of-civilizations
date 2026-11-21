// Ajanta c. 480 — the visitor's walk (docs/settlements/ajanta.md §16). Pure data and functions of layout.js and town.js.
// The walk: from the arrival on the east bank's path (src/planet/arrivals.js) south along the Waghora to the ford, across its stepping stones to the west
// bank's path, north along the foot of the cliff past the pilgrims' water-shed, the three booths and the pilgrims' shelter to the rock-cut stair, up to the
// ledge and into the caves (the landmark plan's own routes); and from the ford's east end along the road to the village, its open houses and its four trades.
import { ARRIVALS } from '../../planet/arrivals.js';
import { FORD, riverX, rng } from './layout.js';
import { lots } from './town.js';

export const ARRIVAL = [ARRIVALS.ajanta[0], ARRIVALS.ajanta[2]];
/** The walk's lines [[x, z], [x, z]]: the east path, the ford, the west path, the road to the village. */
export const WALK = [
  [ARRIVAL, [-15, 14]],
  [[-15, 14], [riverX(FORD.z) - 6.8, FORD.z]],
  [[-48, 14], [-48, -44]],
  [[-48, -44], [-8, -44]],
  [[-15, 14], [40, 30]],
];
export const WALK_REACH = 14;
const segDist = (p, a, b) => {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
};
export const walkDistance = (p) => Math.min(...WALK.map(([a, b]) => segDist(p, a, b)));

/** The houses that stand open (town.js marks the six nearest the road), nearest the road first. */
export const openHouses = () => lots().filter((l) => l.open);
/** The doorway of an open house: { uc (the door's middle along the front), W, D, f (front), P(u, v) → [x, z] }, from the house's own dice (styles/ajanta/houses.js). */
export function doorway(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, W = x1 - x0, D = z1 - z0, uc = W * (0.38 + rng(l.seed ?? 1)() * 0.24);
  const P = (u, v) => (f === 's' ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
  return { uc, W, D, f, P };
}
/** A route into an open house through its door to the front room (and, for the walled yard, through the yard's gate). */
export function houseRoute(l) {
  const d = doorway(l), { uc, P, W } = d, yard = l.variant === 2, v = [];
  if (yard) v.push(P(W / 2, -4.6), P(W / 2, -3.2), P(W / 2, -2.0), P(uc, -1.2));
  else v.push(P(uc, l.variant === 1 ? -3.4 : -2.8), P(uc, l.variant === 1 ? -1.6 : -1.2));
  v.push(P(uc, 0.3), P(uc, 1.0), P(uc, Math.min(1.5, d.D - 2.1)));
  return v;
}
/** A route into a trade's shed (the front open between two posts). */
export function shedRoute(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, W = x1 - x0, D = z1 - z0;
  const P = (u, v) => (f === 's' ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
  const u = l.craft === 'weaver' ? 1.0 : l.craft === 'oilpress' ? 0.95 : W * 0.5 - 0.9;           // clear of the ghani's mortar, the loom and its weaver
  const end = l.craft === 'weaver' ? 1.0 : 1.2;
  return [P(u, -3.2), P(u, -1.6), P(u, 0.4), P(u, Math.min(end, D - 1.6))];
}
/** The routes walk-check follows into the opened places (world metres), in the order of the walk. Each begins on the open ground before its door. */
export function walkRoutes() {
  const R = [];
  // the walk itself: arrival, the east path, the ford's stones, the west path past the booths to the stair's foot
  R.push({ id: 'walk: arrival to the stair', y0: 0, route: [ARRIVAL, [-22, 4], [-18.4, 12], [-15, 14], [riverX(FORD.z) + 5, FORD.z], [riverX(FORD.z) - 5, FORD.z], [-48, 14], [-48, -30], [-48, -41]] });
  // the water-shed (front west) on the east path, then the three booths (front south) and the shelter
  const wx = riverX(2) + 13.4;
  R.push({ id: 'water-shed', y0: 0, route: [[wx - 3.2, 0.6], [wx - 1.8, 0.6], [wx - 0.6, 0.6], [wx + 0.8, 0.6]] });
  for (const x of [-32, -27, -22]) R.push({ id: 'booth ' + x, y0: 0, route: [[x + 0.85, -43.6], [x + 0.85, -45.4], [x + 0.85, -46.4], [x + 0.85, -47.0]] });
  R.push({ id: 'shelter', y0: 0, route: [[-38.5, -51.2], [-41, -51.2], [-43, -51.2]] });
  for (const l of openHouses()) R.push({ id: 'house ' + l.seed, y0: 8, route: houseRoute(l) });
  for (const l of lots().filter((q) => q.craft)) R.push({ id: l.craft, y0: 8, route: shedRoute(l) });
  return R;
}
