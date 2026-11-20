// The visitor's walk in Nara (docs/settlements/nara.md §20): from the arrival in the Great Buddha Hall's court down the axis through the
// Middle Gate, along the temple's service quarter, through the Great South Gate and down Suzaku Avenue to the East Market and the first
// blocks of the capital; and the lots on it that are opened. Pure data and functions of layout.js (no three.js).

import { ARRIVALS } from '../../planet/arrivals.js';
import { openLots } from '../lod.js';
import { height, lots, serviceLots, MARKET } from './layout.js';

const AR = ARRIVALS.nara;
export const ARRIVAL = [AR[0], AR[2]];

/** The main ways as polylines in world x, z (+z south): the axis from the court to the avenue's end, the service lane across it, the market's aisle and the avenue's cross streets. */
export const WALK = [
  [ARRIVAL, [0, 40], [0, 100], [0, 146], [0, 200], [0, 250]],
  [[-60, 104], [60, 104]],
  [[MARKET.block[0] + 2, (MARKET.block[1] + MARKET.block[3]) / 2], [MARKET.block[2] - 2, (MARKET.block[1] + MARKET.block[3]) / 2]],
  [[-60, 200], [-9, 200]],
];
const REACH = 28;                           // m: a lot whose door lies within this of the walk is on it

function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the nearest of the walk's ways. */
export function walkDistance(p) { let best = 1e9; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }

/** The door of a lot's house (the frame of the house builders, vernacular house_japan: the door in bay ⌊n/2⌋ of n = max(2, ⌊L / 3.2⌋)): { x, z, out: [dx, dz] (away from the house), du }. */
export function doorOf(l) {
  const [x0, z0, x1, z1] = l.rect, L = x1 - x0, nb = Math.max(2, Math.floor(L / 3.2)), du = (Math.floor(nb / 2) + 0.5) * L / nb;
  return l.front === 's' ? { x: x1 - du, z: z1, out: [0, 1], du } : { x: x0 + du, z: z0, out: [0, -1], du };
}
/** The doorway's lane: 2 m across and from 0.2 m inside to 3.4 m out, as a rect (the street life keeps clear of it). */
export function laneRect(l) {
  const d = doorOf(l), a = d.z - d.out[1] * 0.2, b = d.z + d.out[1] * 3.4;
  return [d.x - 1.0, Math.min(a, b), d.x + 1.0, Math.max(a, b)];
}
/** The route into a house from the way: in at the door and onto the floor (local waypoints are world x, z; the plan is not moved). */
export function routeInto(l) {
  const d = doorOf(l), at = (v) => [d.x, d.z + d.out[1] * v];
  return [at(2.4), at(0.2), at(-1.9)];
}
/** The opened lots on the walk (those in `open`, a Map or Set of lots), nearest the arrival first. */
export function walkLots(open = openedLots()) {
  const have = (l) => open.has(l);
  return [...lots(), ...serviceLots()].filter((l, i, a) => a.indexOf(l) === i && have(l) && walkDistance([doorOf(l).x, doorOf(l).z]) <= REACH)
    .sort((a, b) => Math.hypot(doorOf(a).x - ARRIVAL[0], doorOf(a).z - ARRIVAL[1]) - Math.hypot(doorOf(b).x - ARRIVAL[0], doorOf(b).z - ARRIVAL[1]));
}

function rngOf(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The height of the lowest edge of a lot's house's eave over the ground: the shared house builder (vernacular house_japan, gabledHouse) draws its roof's
 * overhang and pitch from the lot's seed after a fixed number of draws (one for the wall, one for each window of the front, one for each bay of the back), the
 * overhang 0.9 m and the pitch 0.8 (bark) or 1.0 (thatch) each jittered, on walls 2.9 m high, the slab 0.16 m thick — replayed here (tests/nara-walk.test.mjs checks
 * it against what the builder makes). The deep eaves of thatched houses run as low as 1.67 m, and the walker (1.75 m tall, 1.95 on a kerb or a step) cannot go
 * under one that low to its door.
 */
export function eaveOf(l) {
  const [x0, z0, x1, z1] = l.rect, L = l.front === 's' || l.front === 'n' ? x1 - x0 : z1 - z0, n = Math.max(2, Math.floor(L / 3.2));
  const thatch = rngOf((l.seed || 1) + 7)() >= 0.5, r = rngOf(l.seed || 1);
  for (let k = 0; k < 1 + (n - 1) + n; k++) r();
  const o = 0.9 * (0.9 + r() * 0.2), p = (thatch ? 1.0 : 0.8) * (0.92 + r() * 0.16);
  return (l.y ?? 0) + 2.9 - o * p - 0.16;
}
/** A lot whose door a walker can reach (its eave edge clears 1.9 m). */
export const enterable = (l) => eaveOf(l) >= 1.9;

let OPEN = null;
/** The houses that can be entered: the eight of the service quarter and the 130 nearest the arrival whose door a walker can reach, on level ground (a Map lot → use). */
export function openedLots() {
  if (OPEN) return OPEN;
  OPEN = openLots(lots().filter((l) => enterable(l) && l.rect[1] > -255 && height((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < 0.5), ARRIVAL, 130);
  for (const l of serviceLots()) if (l.use) OPEN.set(l, l.use);
  return OPEN;
}
