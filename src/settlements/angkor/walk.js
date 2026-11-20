// The visitor's walk in Angkor (docs/settlements/angkor.md §31): from the arrival on the outer causeway the ways a visitor takes, and the
// routes into the places they pass (`plan.walks`, walked by tools/walk-check.mjs). Pure data and helpers (no three.js). World frame: +x east,
// +z south; the landmark plan is not turned or moved, so its local frame is the world's.
//
// The walk: A) in along the causeway, through the western gate, along the inner causeway between the libraries to the Terrace of Honour,
// the third gallery's west gate, the cruciform cloister and up the stairs to the central sanctuary; B) from the causeway's foot west across the
// moat road to the market and along the road past the village's fronts, its workshops and rest houses (the first 120 m of the way).
import { ROAD, MOAT, MARKET, CX, T, CAUSEWAY, LIBRARIES, houses, shops, stores, inRect } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import { frame, houseUp } from '../../styles/khmer/village.js';

const AR = ARRIVALS.angkor;
export const ARRIVAL = [AR[0], AR[2]];

/** The main walks as polylines in world x, z. */
export const WALKS = {
  temple: [ARRIVAL, [-150, 0], [-112, 0], [CX - 99, 0], [CX - 93.5, 0], [CX - 60, 0], [CX - 32, 0], [CX - 14, 0], [CX, 0]],
  road: [[-196, 0], [ROAD[0] + 4, 0], [ROAD[0] + 4, 60], [ROAD[0] + 4, 120], [ROAD[0] + 4, -60], [ROAD[0] + 4, -120]],
  market: [[-196, 4], [-210, 20], [-222, 26], [-222, 38]],
};
/** The distance (m) of a point from the nearest of the walks. */
export function walkDist(x, z) {
  let best = Infinity;
  for (const W of Object.values(WALKS)) for (let i = 0; i + 1 < W.length; i++) {
    const a = W[i], b = W[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t));
  }
  return best;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const fromArrival = (r) => { const [x, z] = mid(r); return Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]); };

/** The houses of the walk that can be entered (a deck and a stair: not the small kind), nearest the arrival first. */
export function walkHouses(n = 12, maxD = 125) {
  return houses().filter((h) => h.kind !== 'small' && !h.enc && fromArrival(h.rect) < maxD)
    .sort((a, b) => fromArrival(a.rect) - fromArrival(b.rect)).slice(0, n);
}
/** The open workshops within `maxD` of the arrival, nearest first. */
export function walkShops(n = 6, maxD = 125) {
  // (not those whose front lane, 2 m wide and 6 m out, runs into a house's yard)
  const laneFree = (s) => { const { W } = frame(s.rect, s.front), { hF } = frame(s.rect, s.front), a = W(-1.1, hF), b = W(1.1, hF + 3), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; return !houses().some((h) => h.rect[0] < r[2] && h.rect[2] > r[0] && h.rect[1] < r[3] && h.rect[3] > r[1]); };
  return shops().filter((s) => fromArrival(s.rect) < maxD && laneFree(s)).sort((a, b) => fromArrival(a.rect) - fromArrival(b.rect)).slice(0, n);
}
/** The rest houses within `maxD` of the arrival. */
export function walkSalas(n = 2, maxD = 125) { return stores().salas.filter((s) => fromArrival(s.rect) < maxD).slice(0, n); }

/** Waypoints (world x, z) into a house from the road: the foot of its stair, up it, over the deck, through its door, into the room. */
export function houseRoute(h) {
  const { W, hF } = frame(h.rect, h.front), up = houseUp(h), steps = Math.ceil(up / 0.3), vd = hF + 0.95, foot = vd + steps * 0.34;
  return [W(0, foot + 1.6), W(0, foot + 0.15), W(0, vd + 1.2), W(0, vd + 0.2), W(0, hF - 0.5), W(0, hF - 1.6)];
}
/** Waypoints into an open workshop: from before its steps up onto the floor and along the middle. */
export function shopRoute(s) {
  const { W, hF } = frame(s.rect, s.front);
  return [W(0, hF + 2.4), W(0, hF + 1.2), W(0, hF - 0.2), W(0, hF - 1.4)];
}
/** Waypoints into a rest house: from the south, up its steps (centre of its south side) onto the floor. */
export function salaRoute(s) {
  const [x0, z0, x1, z1] = s.rect, cx = (x0 + x1) / 2;
  return [[cx, z1 + 2.4], [cx, z1 + 0.6], [cx, (z0 + z1) / 2 + 0.4]];
}
/** Waypoints through a library: in at its west end, along the hall to the east door. */
export function libraryRoute(r) {
  const lz = (r[1] + r[3]) / 2, o = lz < 0 ? 1.4 : -1.4;           // (round the fire pit on the side toward the middle of the temple's court)
  return [[r[0] - 5, lz], [r[0] - 1.2, lz], [r[0] + 1.5, lz], [r[0] + 3, lz + o], [r[2] - 3, lz + o], [r[2] - 1.5, lz], [r[2] + 1.2, lz]];
}

/** The routes walk-check follows (plan.walks): [{ pts, y0 }] as arrays with y0 on them. */
export function walkRoutes({ houses: nh = 8, shops: ns = 4, salas: nsa = 1 } = {}) {
  const out = [];
  const add = (pts, y0 = 0) => { const r = pts.map((p) => [p[0], p[1]]); r.y0 = y0; out.push(r); };
  for (const h of walkHouses(nh)) add(houseRoute(h));
  for (const s of walkShops(ns)) add(shopRoute(s));
  for (const s of walkSalas(nsa)) add(salaRoute(s));
  for (const r of LIBRARIES) add(libraryRoute(r), 0);
  return out;
}
void MOAT; void MARKET; void T; void CAUSEWAY; void inRect;
