// Baroque Rome — which lots are opened (docs/settlements/baroque-rome.md §6a): the shops and houses of the Borgo that can be entered along the
// visitor's walk. Pure data (no three.js): town.js builds the lots from it, soundmap.js makes the shops' work heard from it, street.js and
// plan.js place the keepers and the walk-check routes. The walk: from the arrival at the oval's mouth (110, 0) east into the Borgo's two streets,
// west across the oval to the steps; the rows (layout.js rows()) hold the shops on the streets, the fronted lots the ring of houses round them.
import { lots, openHomes, rows, frontPt } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';

export const TRADES = ['grocer', 'baker', 'cloth', 'wine', 'apothecary', 'osteria', 'cobbler'];
/** How many of the fronted lots nearest the arrival have an open bottega (was 8). */
export const BOTTEGHE = 14;
const A = () => [ARRIVALS['baroque-rome'][0], ARRIVALS['baroque-rome'][2]];
let FR = null;
/** The fronted lots (those about the Borgo that are not the open homes): [{ l, i, trade, open }], `i` the index that sets the trade. */
export function frontedLots() {
  if (FR) return FR;
  const a = A(), homes = openHomes(a);
  const fronted = lots().filter((l) => l.fronted && !homes.has(l) && l.rect[2] - l.rect[0] >= 8.4);
  const near = fronted.slice().sort((p, q) => Math.hypot(p.rect[0] - a[0], p.rect[1]) - Math.hypot(q.rect[0] - a[0], q.rect[1])).slice(0, BOTTEGHE);
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
    OP.push({ trade: u.trade, rect, front: r.face, seed: u.seed, flip: u.flip, w: u.w, kind: 'row', up: u.up || null, row: r, unit: u, at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2], door: frontPt(r, u.flip ? 1.25 : u.w - 1.25, -1.0).at });
  }
  for (const { l, trade, open } of frontedLots()) if (open) {
    const rect = shopRect(l.rect, l.front);
    OP.push({ trade, rect, front: l.front, seed: l.seed, kind: 'lot', lot: l, at: [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2] });
  }
  return OP;
}
