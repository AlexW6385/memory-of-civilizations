// The houses of Venice whose upper floors can be climbed (docs/settlements/venice.md §5e): among the houses nearest the arrival that can be
// entered, the first fourteen that are deep enough for the stair, each of a kind (the inns, then the homes in turn a merchant's house, a
// craftsman's, a tenement, a shop with its dwelling), with the balcony the calle before it allows, and the routes that walk from the street up to
// their rooms (plan `walks`). Pure data from the lots.
import { ARRIVALS } from '../../planet/arrivals.js';
import { GROUND, PIAZZA, CAMPANILE, CLOCK, lots } from './layout.js';
import { shellOf, planStair } from '../../styles/venetian/house-up.js';
import { freeBefore } from './fronts.js';

const KINDS = ['merchant', 'craft', 'tenement', 'shop'], T = 0.4;
let MEMO = null;

/** [{ lot, use, kind, balcony, SP, st }] — the climbable houses, nearest the arrival first. */
export function upHouses() {
  if (MEMO) return MEMO;
  const A = ARRIVALS['venice'], out = [];
  // (the houses of the two rows nearest the square stand in the Procuratie's blocks: only the houses clear of them, a street's width from the arcades)
  const PR = [[PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16], [PIAZZA[0], PIAZZA[1] - 18, CLOCK[0], PIAZZA[1]], [PIAZZA[0] - 16, PIAZZA[1] - 18, PIAZZA[0], PIAZZA[3] + 16]];
  const hit = (a, r, m) => a[2] + m > r[0] && a[0] - m < r[2] && a[3] + m > r[1] && a[1] - m < r[3];
  const d = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - A[0], (l.rect[1] + l.rect[3]) / 2 - A[2]);
  const cand = lots().filter((l) => !PR.some((r) => hit(l.rect, r, 1.5)) && l.rect[2] - l.rect[0] >= 8 && l.rect[3] - l.rect[1] >= 8 && d(l) > 40).sort((a, b) => d(a) - d(b));
  let h = 0, i = 0;
  for (const lot of cand) {
    if (out.length >= 9) break;
    const use = i % 4 === 0 ? 'inn' : 'home';
    const { tower, st } = shellOf(lot.seed, lot.rect), L = lot.rect[2] - lot.rect[0], D = lot.rect[3] - lot.rect[1];
    const kind = use === 'inn' ? 'inn' : KINDS[h % 4];
    const SP = tower ? null : planStair({ L, D, st, n: lot.storeys, kind, use });
    if (!SP) continue;
    i++; if (use !== 'inn') h++;
    const free = freeBefore(lot);
    out.push({ lot, use, kind, balcony: free >= 3 ? 0.9 : free >= 1.4 ? 0.7 : 0, SP, st });
  }
  return (MEMO = out);
}

/** The routes (plan `walks`, world [x, z]) from the street before each house, in at its door, up its stair to a room of the first floor and to the top (the room under the roof; the terrace of a merchant's house). */
export function upWalks() {
  const routes = [];
  for (const { lot, SP } of upHouses()) {
    const [x0, z0, x1, z1] = lot.rect, f = lot.front || 's', L = x1 - x0, D = z1 - z0;
    const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : [x0 + u, z0 + v]);
    const bays = Math.max(1, Math.round(L / 2.5)), du = (Math.floor(bays / 2) + 0.5) * L / bays, um = (SP.uA0 + SP.uA1) / 2, ub = (SP.uB0 + SP.uB1) / 2;
    const to = [[du, -1.0], [du, 1.0], [SP.uA0 - 0.4, SP.vF - 0.6], [um - 0.25, SP.vF - 0.3], [um, SP.vF + 0.3]], stops = [];
    for (const fl of SP.flights) {
      const mid = fl.i % 2 ? ub : um, a = fl.dir > 0 ? SP.vF : SP.vB, b = fl.dir > 0 ? SP.vB : SP.vF, lv = b + (fl.dir > 0 ? 0.5 : -0.5);
      if (fl.i > 0) to.push([mid, a]);
      to.push([mid, lv]);
      stops.push({ n: to.length, dir: fl.dir, lv });
      if (fl.i < SP.flights.length - 1) to.push([(fl.i + 1) % 2 ? ub : um, lv]);
    }
    const room = (st) => { const dv = st.dir > 0 ? D - 0.975 : 0.975; return [[SP.uP + 0.06, dv], [SP.uP - 0.8, dv]]; };
    const r1 = [...to.slice(0, stops[0].n), ...room(stops[0])];
    routes.push(Object.assign(r1.map(([u, v]) => P(u, v)), { y0: GROUND }));
    if (stops.length > 1) {
      const st = stops[stops.length - 1], r2 = [...to.slice(0, st.n), ...(SP.merchant ? [[SP.uP + 1.2, st.lv]] : room(st))];
      routes.push(Object.assign(r2.map(([u, v]) => P(u, v)), { y0: GROUND }));
    }
  }
  return routes;
}
