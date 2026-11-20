// Baroque Rome — which lots are opened (docs/settlements/baroque-rome.md §6a): the shops and houses of the Borgo that can be entered along the
// visitor's walk. Pure data (no three.js): town.js builds the lots from it, soundmap.js makes the shops' work heard from it, street.js and
// plan.js place the keepers and the walk-check routes. The walk: from the arrival at the oval's mouth (110, 0) east into the Borgo's two streets,
// west across the oval to the steps; the rows (layout.js rows()) hold the shops on the streets, the fronted lots the ring of houses round them.
import { lots, openHomes, rows, frontPt, ROW_DEFS } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import { faceFrame, toW } from '../../styles/renaissance/face.js';

export const TRADES = ['grocer', 'baker', 'cloth', 'wine', 'apothecary', 'osteria', 'cobbler'];
/** How many of the fronted lots nearest the arrival have an open bottega (was 8). */
export const BOTTEGHE = 14;
const A = () => [ARRIVALS['baroque-rome'][0], ARRIVALS['baroque-rome'][2]];
/** Is there room before the lot's front (a strip `need` m deep, its width) for a visitor to come to the door: no other lot or row across it? */
export function clearFront(l, need = 3.6) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, st = f === 'n' ? [x0 + 0.5, z0 - need, x1 - 0.5, z0] : [x0 + 0.5, z1, x1 - 0.5, z1 + need];
  const hit = (r) => r[0] < st[2] && r[2] > st[0] && r[1] < st[3] && r[3] > st[1];
  return !lots().some((q) => q !== l && hit(q.rect)) && !ROW_DEFS.some((d) => hit(d.rect));
}
let FR = null;
/** The fronted lots (those about the Borgo that are not the open homes): [{ l, i, trade, open }], `i` the index that sets the trade. */
export function frontedLots() {
  if (FR) return FR;
  const a = A(), homes = openHomes(a);
  const fronted = lots().filter((l) => l.fronted && !homes.has(l) && l.rect[2] - l.rect[0] >= 8.4);
  const near = fronted.filter((l) => clearFront(l)).sort((p, q) => Math.hypot(p.rect[0] - a[0], p.rect[1]) - Math.hypot(q.rect[0] - a[0], q.rect[1])).slice(0, BOTTEGHE);
  return (FR = fronted.map((l, i) => ({ l, i, trade: TRADES[i % TRADES.length], open: near.includes(l) })));
}
/** The room of a bottega: depth 6.2 m behind the front of its unit (styles/baroque/borgo.js openBody). */
export function shopRect(rect, face, depth = 6.2) {
  const [x0, z0, x1, z1] = rect;
  return face === 'n' ? [x0, z0, x1, Math.min(z1, z0 + depth)] : face === 's' ? [x0, Math.max(z0, z1 - depth), x1, z1] : face === 'e' ? [Math.max(x0, x1 - depth), z0, x1, z1] : [x0, z0, Math.min(x1, x0 + depth), z1];
}
let OP = null;
/** Every bottega that can be entered: { trade, rect (its room), front, seed, at: [x, z] of the room's middle, door: [x, z] on the street, kind: 'row'|'lot', up }. */
export function openShops() {
  if (OP) return OP;
  OP = [];
  for (const r of rows()) for (const u of r.units) {
    if (u.kind !== 'casa' || !u.open || u.fountain) continue;
    const rect = r.face === 'n' ? [u.x0, r.rect[1], u.x1, r.rect[1] + 6.2] : [u.x0, r.rect[3] - 6.2, u.x1, r.rect[3]];
    OP.push({ trade: u.trade, rect, front: r.face, seed: u.seed, flip: u.flip, w: u.w, kind: 'row', up: u.up || null, row: r, unit: u, frame: [r.rect, r.face], at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2], door: frontPt(r, u.flip ? 1.25 : u.w - 1.25, -1.0).at });
  }
  for (const { l, trade, open } of frontedLots()) if (open) {
    const rect = shopRect(l.rect, l.front);
    OP.push({ trade, rect, front: l.front, seed: l.seed, kind: 'lot', lot: l, unit: lotRow({ l, trade, open: true }).units[0], frame: [l.rect, l.front], at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2] });
  }
  return OP;
}

const rand0 = (n) => ((Math.sin(n * 91.7) * 43758.5453) % 1 + 1) % 1;
const CAS_H = [3.9, 3.4, 3.2, 2.9];
/** The `borgo_row` element of one fronted lot (a single casa unit on the lot's own rect and front); town.js builds it, night.js lights it. */
export function lotRow({ l, trade, open }) {
  const w = l.rect[2] - l.rect[0], st = l.storeys, r = rand0(l.seed);
  return { t: 'borgo_row', rect: l.rect, face: l.front, y: 0, units: [{ u0: 0, w, kind: 'casa', storeys: st, H: CAS_H.slice(0, st).reduce((p, q) => p + q, 0), seed: l.seed, trade, madonna: r < 0.4, flip: r > 0.5, awning: rand0(l.seed + 3) < 0.4, birdcage: rand0(l.seed + 5) < 0.2, cat: false, open }] };
}

/** The way from the street through the arched opening of an open bottega into its front room, as [x, z] points (the counter stands 2.6 m in: the route stops short of it). */
export function shopRoute(s) {
  const u = s.unit, dw = 1.1, sw = Math.min(2.8, u.w - dw - 1.6), shopU = u.u0 + 0.7 + sw / 2 + (u.flip ? dw + 0.4 : 0);
  const { M } = faceFrame(s.frame[0], s.frame[1], 0);
  return [2.6, 1.4, -0.4, -1.4].map((d) => toW(M, shopU, d));
}
/** The routes into the `n` (all, by default) open bottegas, nearest the arrival first (the walk's first fronts), as walk-check routes. */
export function shopWalks(n = 40) {
  const a = A();
  return openShops().filter((s) => s.up == null || true).map((s) => ({ s, d: Math.hypot(s.at[0] - a[0], s.at[1] - a[1]) })).sort((p, q) => p.d - q.d).slice(0, n).map(({ s }) => Object.assign(shopRoute(s), { y0: 0 }));
}

/** The lanes of a casa unit's ground storey, in the unit's u: the shop's opening and the stair door, each with half a metre to either side — goods, gear and figures stay out of them. */
export function lanes(u) {
  const dw = 1.1, sw = Math.min(2.8, u.w - dw - 1.6), shopU = u.u0 + 0.7 + sw / 2 + (u.flip ? dw + 0.4 : 0), doorU = u.flip ? u.u0 + 0.7 + dw / 2 : u.u0 + u.w - 0.7 - dw / 2;
  return [[shopU - sw / 2 - 0.5, shopU + sw / 2 + 0.5], [doorU - dw / 2 - 0.5, doorU + dw / 2 + 0.5]];
}
/** A place `uu` along a unit's front, moved out of the lanes to the nearer edge (the other if that edge is in the neighbouring lane or past the unit's end). */
export function clearU(u, uu) {
  const L = lanes(u), lo = u.u0 + 0.25, hi = u.u0 + u.w - 0.25, inL = (x) => L.some(([a, b]) => x > a && x < b);
  if (!inL(uu)) return uu;
  const c = [];
  for (const [a, b] of L) if (uu > a && uu < b) c.push(a - 0.01, b + 0.01);
  c.sort((p, q) => Math.abs(p - uu) - Math.abs(q - uu));
  return c.find((x) => x >= lo && x <= hi && !inL(x)) ?? uu;
}
