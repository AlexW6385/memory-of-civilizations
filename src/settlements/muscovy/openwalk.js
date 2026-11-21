// The visitor's walk in Muscovy about 1600 and which shops of the trading rows stand open on it (docs/settlements/muscovy.md §12).
// Pure data and functions of layout.js and the style's rowsgeo.js (no three.js): plan.js gives the rows the opened shops' keys, town.js builds
// their contents near the visitor (lavki.js), soundmap.js and nightlight.js read the same shops, the walk check follows `walkRoutes`.
//
// The walk: from the arrival in Red Square (40, 20), south past the Lobnoye Mesto and the Tsar Cannon to St Basil's; east to the lane before the
// trading rows and along the rows' square front; through the cross passages into the two inner lanes; west across the square to the moat and
// the Spassky bridge, and through the gate into the Kremlin.
import { lots, openIzba, WALK_LINES, ROWS, SQUARE, LOBNOYE, BASIL, SPASSKY, MOAT, wallX, gateZ, height } from './layout.js';
import { shopList, DOOR_OPEN } from '../../styles/muscovite/rowsgeo.js';

export const ARRIVAL = [40, 20];
const zs = gateZ(SPASSKY[1]), xb = wallX(zs) + MOAT.d1 + 2;
/** The walk's lines [x, z]. */
export const WALK = WALK_LINES();

// ── the trades: the rows (ryady) of Moscow kept shops of one trade side by side ──
export const TRADES = ['cloth', 'hats', 'boots', 'candles', 'icons', 'pots', 'iron', 'furs', 'fish', 'flour', 'bread', 'saddles'];
const H3 = (a, b, c) => { let h = Math.imul(a * 73856093 ^ b * 19349663 ^ c * 83492791, 0x5bd1e995); h ^= h >>> 15; return (h >>> 0) % 4096; };
/** The trade of a shop: runs of four neighbours in a front share one (a row), the run's trade by the hash of its place. */
export const tradeOf = (s) => TRADES[(H3(s.b + 3, s.r * 2 + (s.sg > 0 ? 1 : 0) + 1, s.q >> 2) >> 2) % TRADES.length];

let SET = null;
/**
 * The opened shops: Map key → { ...shop, trade }. The square front's shops of blocks 2–5 (the four nearest the arrival; the first and last shop of a
 * block keep their end walls), every second shop of the first inner lane's west fronts and every third of the second lane's east fronts in blocks 3–5.
 */
export function openShops() {
  if (SET) return SET;
  SET = new Map();
  for (const s of shopList(ROWS)) {
    if (s.q < 1 || s.q > 10) continue;
    const ok = (s.r === 0 && s.b >= 2) || (s.r === 1 && s.sg < 0 && s.b >= 3 && s.q % 2 === 0) || (s.r === 1 && s.sg > 0 && s.b >= 3 && s.q % 3 === 1);
    if (ok) SET.set(s.key, { ...s, trade: tradeOf(s) });
  }
  return SET;
}
export const openKeys = () => [...openShops().keys()];

/** Routes into opened shops for the walk check: from the lane at the front, in at the door and one and a half metres into the room. */
export function walkRoutes(n = 10) {
  const out = [], all = [...openShops().values()], pick = [];
  // the nearest to the arrival of each front, then spread along the rows
  for (const f of [[0, -1], [1, -1], [1, 1]]) pick.push(...all.filter((s) => s.r === f[0] && s.sg === f[1]).sort((a, b) => Math.hypot(a.fx - 68, a.zc - 20) - Math.hypot(b.fx - 68, b.zc - 20)).filter((_, i) => i % 3 === 0).slice(0, Math.ceil(n / 3)));
  for (const s of pick) {
    const d = -s.sg, y = height(s.fx, s.zc);
    const r = [[s.fx - d * 1.5, s.zc], [s.fx + d * 0.4, s.zc], [s.fx + d * 2.0, s.zc]];
    r.y0 = y; out.push(r);
  }
  return out;
}

// the front (the gable end turned to the nearer street) as town.js chooses it: 'x0' | 'x1' | 'z0' | 'z1'
function frontOf([x0, z0, x1, z1]) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (x1 - x0 >= z1 - z0) { const sx = Math.round((cx + 378) / 84) * 84 - 378; return sx < cx ? 'x0' : 'x1'; }
  const sz = Math.round((cz + 385) / 70) * 70 - 385; return sz < cz ? 'z0' : 'z1';
}
/** Routes into the open izby on the walk: from the street to the side door (in the wall at the lot's u0 side), over the sill and into the room. */
export function izbaRoutes() {
  const out = [], zones = WALK_LINES();
  const near = (x, z) => zones.some((w) => w.some((_, i) => i < w.length - 1 && segDist(x, z, w[i], w[i + 1]) < 30));
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (l.kind === 'barn' || !openIzba(l) || !near(cx, cz)) continue;
    const f = frontOf(l.rect), ex = f[0] === 'x', dLo = ex ? (f === 'x0' ? x1 - 2.2 : x0 + 1.2) : (f === 'z0' ? z1 - 2.2 : z0 + 1.2), dc = dLo + 0.475;
    const r = ex ? [[dc, z0 - 2.2], [dc, z0 + 0.5], [dc, z0 + 1.7]] : [[x0 - 2.2, dc], [x0 + 0.5, dc], [x0 + 1.7, dc]];
    r.y0 = l.y; out.push(r);
  }
  return out;
}
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); }
void SQUARE; void LOBNOYE; void DOOR_OPEN;
