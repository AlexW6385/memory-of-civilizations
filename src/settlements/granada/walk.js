// The visitor's walk through Nasrid Granada (docs/settlements/granada.md §20): the way from the arrival in the Court of the Myrtles through the
// Comares palace and the Court of the Lions, out past the Rauda and the Partal into the medina's lanes, and the houses and shops opened along it.
// Pure data and functions of layout.js and the house builder's own rules (no three.js): the routes `tools/walk-check.mjs` follows (plan.walks).
import { lots, HILL, MYRTLES, LIONS, RAUDA, PARTAL, SOUK, GREAT_MOSQUE, SITES, siteY } from './layout.js';
import { isShop, tradeOf, useOf, TRADES, HOUSE_USES } from '../../styles/nasrid/houses.js';

const T = HILL.top;
export const ARRIVAL = [19.5, 3];
const cx = (r) => (r[0] + r[2]) / 2;

/** The frame of a house (docs §15: u along the front, v in from it): { F(u, v) → [x, z], L, D, du (the door's centre along the front) }. */
export function frameOf(l) {
  const [x0, z0, x1, z1] = l.rect, s = l.front === 's', L = x1 - x0, D = z1 - z0;
  const bays = Math.max(1, Math.round(L / 3.6)), du = (Math.floor(bays / 2) + 0.5) * L / bays;
  return { F: (u, v) => (s ? [x1 - u, z1 - v] : [x0 + u, z0 + v]), L, D, du, s };
}
const dist = (l) => Math.hypot(cx(l.rect) - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]);
/** The kind of place a medina house is: 'shop:<trade>' or 'house:<use>'. */
export const kindOf = (l) => (isShop(l.seed) ? 'shop:' + tradeOf(l.seed) : 'house:' + useOf(l.seed));

let SET = null;
/**
 * The houses opened along the walk, nearest the way in first: one of every kind (five trades, four uses), then the next nearest of each, up to `per`
 * of a kind. Each: { lot, kind, ...frame }.
 */
export function openedHouses(per = 2) {
  if (SET) return SET;
  const near = lots().filter((l) => l.y === T && Math.hypot(cx(l.rect) - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]) < 150).sort((a, b) => dist(a) - dist(b));
  const taken = {}; SET = [];
  for (const l of near) {
    const k = kindOf(l);
    if ((taken[k] = (taken[k] || 0) + 1) > per) continue;
    SET.push({ lot: l, kind: k, ...frameOf(l) });
  }
  return SET;
}

/** The route into a house: from the lane before its door, in over the step, into the room as far as its furniture allows. */
export function houseRoute(h) {
  const { F, du, L } = h, k = h.kind;
  const way = [[du, -2.4], [du, 0.3], [du, k.startsWith('shop') ? 1.5 : 2.2]];
  if (k === 'house:kitchen') way.push([du, 3.6], [L - 3.4, 3.7]);
  else if (k === 'house:weaver') way.push([du, 3.6], [L - 4.2, 3.6]);
  else if (k === 'house:store') way.push([du, 3.6], [L - 3.4, 4.4]);
  else if (k === 'house:home') way.push([du, 3.4], [du + 1.6, 3.4]);
  const r = way.map(([u, v]) => F(u, v)); r.y0 = T;
  return r;
}

/** The palaces' routes (docs §20.1): [name, waypoints]. */
const [mx0, mz0, mx1, mz1] = MYRTLES, mcx = (mx0 + mx1) / 2;
export const PALACE_ROUTES = [
  // the arrival up the west walk of the Myrtles (the pool and the men talking by the hedge to the east of it), through the north portico, the Barca's door, the Barca
  // and the arch of the tower into the Hall of the Ambassadors
  ['ambassadors', [[ARRIVAL[0], ARRIVAL[1]], [mx0 + 2.6, mz1 - 2.5], [mx0 + 2.4, -20], [mx0 + 2.6, mz0 + 1.0], [mcx - 0.2, mz0 - 2.5], [mcx + 0.25, -42.25], [mcx + 0.25, -46.75]]],
  // from the Myrtles' east door through the passage into the Court of the Lions, north of the fountain, to the Hall of the Two Sisters' door and in
  ['lions', [[mx1 - 1.25, -5.25], [mx1 - 1.25, -8.25], [37.75, -8.25], [45.25, -8.25], [47.75, -10.25], [48.25, -13.75], [48.75, -17.75], [56.75, -17.75]]],
  ['two sisters', [[56.75, -17.75], [58.25, -22.5], [58.25, -25.75], [58.25, -26.75]]],
  // the south side: the Abencerrajes' door from the court and out by the hall's far door to the lane
  ['abencerrajes', [[45.25, -8.25], [53.25, -7.25], [58.25, -7.25], [58.25, -3.75], [60.25, 1.25]]],
  // east across the court to the Hall of the Kings
  ['kings', [[49.75, -7.25], [50.25, -9.75], [58.25, -9.75], [66.25, -9.75], [68.25, -12.75], [71.25, -13.25], [75.25, -13.75]]],
  ['rauda', [[(RAUDA.rect[0] + RAUDA.rect[2]) / 2, RAUDA.rect[1] - 3], [(RAUDA.rect[0] + RAUDA.rect[2]) / 2, RAUDA.rect[1] + 1.5], [(RAUDA.rect[0] + RAUDA.rect[2]) / 2, RAUDA.rect[1] + 4]]],
  ['partal', [[cx(PARTAL.tower), PARTAL.pool[1] - 3.6], [cx(PARTAL.tower), PARTAL.tower[3] + 1.2], [cx(PARTAL.tower), (PARTAL.tower[1] + PARTAL.tower[3]) / 2]]],
];
/**
 * The town's great places, entered by their gates (docs §25; gates 2.2 m wide, probed with tools/door-probe.mjs): the Great Mosque by the gate in its north wall across
 * the sahn into the prayer hall, the Albaicín's mosque the same, the Alcaicería by its west and its east gate down the lane between the rows of booths.
 */
export function siteRoutes() {
  const mx = (GREAT_MOSQUE[0] + GREAT_MOSQUE[2]) / 2, a = SITES.albaicinMosque.rect, ax = (a[0] + a[2]) / 2, g = (z, y0) => Object.assign(z, y0 === undefined ? {} : { y0 });
  return [
    g([[mx, GREAT_MOSQUE[1] - 4], [mx, GREAT_MOSQUE[1] + 2], [mx, GREAT_MOSQUE[1] + 12], [mx, GREAT_MOSQUE[3] - 14]], 0),
    g([[ax, a[1] - 1.2], [ax, a[1] + 2], [ax, a[1] + 12], [ax, a[3] - 12]], siteY('albaicinMosque')),
    g([[SOUK[0] - 3, 133.36], [SOUK[0] + 2, 133.36], [SOUK[0] + 12, 133.36], [SOUK[0] + 18, 133.36]], 0),
    g([[SOUK[2] + 3, 140.64], [SOUK[2] - 2, 140.64], [SOUK[2] - 12, 140.64], [SOUK[2] - 18, 140.64]], 0),
  ];
}
export function routes() {
  const out = [];
  for (const [, w] of PALACE_ROUTES) { const r = w.map((p) => [...p]); r.y0 = T; out.push(r); }
  for (const h of openedHouses()) out.push(houseRoute(h));
  out.push(...siteRoutes());
  return out;
}
void TRADES; void HOUSE_USES;
