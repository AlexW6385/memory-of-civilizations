// Paris in 1248 — which lots are opened (docs/settlements/paris.md §6a): the shops and homes of the core that can be entered, and the
// shops along the visitor's walk. Pure data (no three.js): town.js builds the open plans from it, soundmap.js makes the shops' work
// heard from it, tests/paris-walk.test.mjs checks it.
//
// The walk: from the arrival in the palace court (the court's own row of lodgings is opened by court-houses.js) east through the
// palace gate and along the island's main street to the parvis of Notre-Dame; the Right Bank's street behind the Grève where the
// Grand Pont lands, and the Left Bank's street from the Petit Pont. The lots that front these streets, nearest the way in first,
// are opened as shops, so that a visitor passing along the street finds most fronts open as they were by day.
import { lots } from './layout.js';
import { openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';

export const RICH = { c: [60, 0], r: 250 };
export const OPEN_MAX = 170, OPEN_OUTER = 60, WALK_MAX = 64, WALK_REACH = 7.5;
/** The walk's streets as polylines [x, z]: the island's main street from the palace gate to the parvis; behind the Grève; from the Petit Pont. */
export const WALK = [
  [[-112, 2.4], [100, 2.4]],
  [[-60, -193.6], [100, -193.6]],
  [[60, 177.4], [170, 177.4]],
];
const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
export const rich = (l) => Math.hypot(mid(l)[0] - RICH.c[0], mid(l)[1] - RICH.c[1]) < RICH.r;
const dist = (l) => Math.hypot(mid(l)[0] - 70, mid(l)[1]);
export const wide = (l) => l.rect[2] - l.rect[0] >= 5.0;
/** The kind of front the rule gives a lot that is not opened (the same formula as frontKind in styles/gothic/houses.js: a test compares them). */
export function frontOf(l) {
  const along = l.front === 's' || l.front === 'n', L = along ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
  const k = (Math.imul((l.seed >>> 7) + 7, 2654435761) >>> 0) % 9;
  return k < 2 ? 'burgher' : k === 2 ? (L >= 6.2 ? 'gate' : 'burgher') : 'shop';
}
/** The middle of a lot's street front. */
export const frontAt = (l) => (l.front === 's' ? [mid(l)[0], l.rect[3]] : l.front === 'n' ? [mid(l)[0], l.rect[1]] : l.front === 'e' ? [l.rect[2], mid(l)[1]] : [l.rect[0], mid(l)[1]]);
/** Distance from a point to the walk, and how far along the first street (for the order). */
export function walkDist(p) {
  let best = Infinity;
  for (const line of WALK) for (let i = 0; i + 1 < line.length; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(p[0] - (ax + dx * t), p[1] - (az + dz * t)));
  }
  return best;
}
let WALKSET = null;
/** The lots opened for the walk: shop fronts of the core on the walk's streets, the nearest to the way in first. */
export function walkSet() {
  if (WALKSET) return WALKSET;
  const from = [ARRIVALS.paris[0], ARRIVALS.paris[2]];
  return (WALKSET = lots().filter((l) => rich(l) && wide(l) && frontOf(l) === 'shop' && walkDist(frontAt(l)) <= WALK_REACH)
    .sort((a, b) => Math.hypot(mid(a)[0] - from[0], mid(a)[1] - from[1]) - Math.hypot(mid(b)[0] - from[0], mid(b)[1] - from[1])).slice(0, WALK_MAX));
}
export const AJAR_MAX = 8;
let AJAR = null;
/** The burghers' houses on the walk with the door ajar and a furnished front room (docs/settlements/paris.md §6g): lots whose front the rule makes a burgher's, wide and deep enough, on the walk's streets, nearest the way in first. Lot → 'burgher'. */
export function ajarMap() {
  if (AJAR) return AJAR;
  const from = [ARRIVALS.paris[0], ARRIVALS.paris[2]], open = openMap();
  const deep = (l) => (l.front === 's' || l.front === 'n' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]);
  const c = lots().filter((l) => !open.has(l) && rich(l) && wide(l) && deep(l) >= 8.5 && frontOf(l) === 'burgher' && walkDist(frontAt(l)) <= WALK_REACH && mid(l)[1] > -12 && mid(l)[1] < 18 && mid(l)[0] < 0)   // (the main street's first tile only: the interiors cost draws per tile)
    .sort((a, b) => Math.hypot(mid(a)[0] - from[0], mid(a)[1] - from[1]) - Math.hypot(mid(b)[0] - from[0], mid(b)[1] - from[1])).slice(0, AJAR_MAX);
  return (AJAR = new Map(c.map((l) => [l, 'burgher'])));
}
export const outerOpen = (all) => all.filter((l) => !rich(l) && wide(l) && l.seed % 7 === 0).sort((a, b) => dist(a) - dist(b)).slice(0, OPEN_OUTER);
let MAP = null;
/** Lot → its use for every lot that can be entered: the three nearest the arrival ('inn', 'home'), the walk's shops, the core's shops (every fourth, nearest the Grand Pont and the parvis first), the outer rows' workshops. */
export function openMap() {
  if (MAP) return MAP;
  const all = lots(), open = new Map([...openLots(all, [ARRIVALS.paris[0], ARRIVALS.paris[2]], 2)]);
  for (const l of walkSet()) if (!open.has(l)) open.set(l, 'shop');
  all.filter((l) => rich(l) && wide(l) && l.seed % 4 === 0 && !open.has(l)).sort((a, b) => dist(a) - dist(b)).slice(0, OPEN_MAX).forEach((l) => open.set(l, 'shop'));
  outerOpen(all).forEach((l) => open.set(l, 'outer'));
  return (MAP = open);
}
