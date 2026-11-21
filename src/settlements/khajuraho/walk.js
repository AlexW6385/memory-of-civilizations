// Khajuraho about 1050 — the visitor's walk (docs/settlements/khajuraho.md §18). Pure data and functions of layout.js.
// The walk: from the arrival in the pilgrims' approach (src/planet/arrivals.js: x -14, z -60, facing east) west along the lane of flower, ghee and sweet shops
// to the stair of Kandariya Mahadeva's terrace; back east to the bend of the road and along the bazaar road to the lane up to Lakshmana and the Varaha;
// south by the tank way to the Shivsagar's ghat; east along the road and its lanes into the village.
import { STREETS, lots, tankD } from './layout.js';
import { frame, homeDoorU } from './doors.js';
import { ARRIVALS } from '../../planet/arrivals.js';

export const ARRIVAL = [ARRIVALS.khajuraho[0], ARRIVALS.khajuraho[2]];
/** The walk's lines [[x, z], [x, z]], along the middle of each way. */
export const WALK = [
  [[-14, -60], [-30, -60]],        // the approach to the stair of Kandariya's terrace
  [[-14, -60], [22, -60]],         // east along the approach to the road's bend
  [[-26, 10], [84, 10]],           // the bazaar road from the temples' end
  [[85, 10], [85, -96]],           // the lane up to Lakshmana's platform and the Varaha pavilion
  [[40, 14], [40, 104]],           // the tank way to the ghat
  [[88, 10], [316, 10]],           // the road on into the village
];
export const WALK_REACH = 12;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
export const walkDistance = (p) => Math.min(...WALK.map(([a, b]) => segDist(p, a, b)));

export { frame, homeDoorU };
const dist = (l, p) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - p[0], (l.rect[1] + l.rect[3]) / 2 - p[1]);
/** The shops, sheds and homes that stand open (layout.js `open`), nearest the arrival first. */
export function openPlaces(kinds = ['shop', 'shed', 'home', 'haveli', 'mud', 'hut']) {
  return lots().filter((l) => l.open && !l.farm && kinds.includes(l.kind)).sort((a, b) => dist(a, ARRIVAL) - dist(b, ARRIVAL));
}
/** The way in: the lane, the platform's edge, the door, a metre inside (an open shop's front is its whole width). */
export function doorway(l) {
  const { L, P } = frame(l), shopish = l.kind === 'shop' || l.kind === 'shed';
  // the verandah's posts, the plates, the bell and the dressing standing before a shop (random places) block the middle of its front: the walker goes in 0.9 m from its end,
  // which the probe (every 0.3 m along twelve shops) found open in all twelve; a home's door is where the style cut it
  const u = shopish ? L - 0.9 : homeDoorU(l);
  return { u, route: [P(u, -2.6), P(u, -1.0), P(u, 0.3), P(u, shopish ? 0.55 : 1.0)] };
}
/** Lots whose door is clear of a crossing lane or a wayside thing is not known here: walk-check says which are stuck. */
export const STUCK = [];
/** The routes walk-check follows (landmark plan `walks`, world metres): into the open places nearest the arrival, shops first. */
export function walkRoutes(nShops = 10, nHomes = 4) {
  const R = [];
  for (const l of openPlaces(['shop', 'shed']).filter((q) => !STUCK.includes(q.seed)).slice(0, nShops)) R.push({ id: l.kind + ' ' + l.seed, route: doorway(l).route });
  for (const l of openPlaces(['home', 'haveli', 'mud']).filter((q) => !STUCK.includes(q.seed)).slice(0, nHomes)) R.push({ id: l.kind + ' ' + l.seed, route: doorway(l).route });
  return R;
}
void STREETS; void tankD;
