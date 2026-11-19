// Which lots of Florence are opened and which climbed (docs/settlements/florence.md §5, §11, §15, §16): pure rules of the layout and the
// walk, kept apart from the house builder so that the sound map and the street life can read them without loading it.
import { ARRIVALS } from '../../planet/arrivals.js';
import { MERCATO } from './layout.js';
import { rectWalkDist } from './walk.js';

/**
 * The houses that can be entered: the osteria and the homes round the arrival, and workshops of the trades
 * by the Mercato Vecchio and on the Via Calzaiuoli and the Via Larga: one of each trade where the lots allow.
 * Returns a map from lot to its use ('inn', 'home' or the trade).
 */
/** The lots opened before the walk's extension (the others are opened to their front room only: a stair costs 400 KB of geometry a house). */
const EARLY = new WeakSet();
/** How far from the walk (m) the shop-houses are all open. */
export const OPEN_ALONG = 24;
export function enterable(all) {
  const ok = all.filter((l) => l.kind !== 'torre' && l.kind !== 'palazzo' && (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] >= 5.2 && l.rect[3] - l.rect[1] >= 8 : l.rect[3] - l.rect[1] >= 5.2 && l.rect[2] - l.rect[0] >= 8) && l.storeys >= 2);
  const out = new Map(), A = ARRIVALS['florence'];
  const dist = (l, x, z) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
  const take = (list, n, use) => { let k = 0; for (const l of list) { if (k >= n) break; if (out.has(l)) continue; out.set(l, typeof use === 'function' ? use(l, k) : use); k++; } };
  const byArrival = (a, b) => dist(a, A[0], A[2]) - dist(b, A[0], A[2]);
  take([...ok].sort(byArrival), 1, 'inn');
  take([...ok].filter((l) => l.kind === 'casa').sort(byArrival), 3, 'home');
  // the botteghe round the arrival first: one of each trade, the nearest to the walker (the first streets west and south of the square), then those at the market
  const mc = [(MERCATO[0] + MERCATO[2]) / 2, (MERCATO[1] + MERCATO[3]) / 2], seen = new Set(), botteghe = ok.filter((l) => l.kind === 'bottega');
  for (const l of [...botteghe].sort(byArrival)) { if (seen.has(l.trade) || seen.size >= 5 || dist(l, A[0], A[2]) > 115) continue; seen.add(l.trade); out.set(l, l.trade); }
  take([...ok].filter((l) => l.kind === 'casa' && dist(l, A[0], A[2]) < 115).sort(byArrival), 2, 'home');
  seen.clear();
  for (const l of [...botteghe].sort((a, b) => Math.min(dist(a, mc[0], mc[1]), dist(a, A[0], A[2]) + 40) - Math.min(dist(b, mc[0], mc[1]), dist(b, A[0], A[2]) + 40))) { if (out.has(l) || seen.has(l.trade) || out.size >= 18) continue; seen.add(l.trade); out.set(l, l.trade); }
  take([...ok].filter((l) => l.kind === 'casa').sort((a, b) => dist(a, mc[0], mc[1]) - dist(b, mc[0], mc[1])), 2, 'home');
  for (const l of out.keys()) EARLY.add(l);
  // the streets the visitor walks (walk.js, docs/settlements/florence.md §16): every shop-house within OPEN_ALONG m of the walk is open, with its goods at the door and
  // its keeper at the bench, and one house in three of the casas beside them is lived in (the door ajar on the hearth room, the table, the cupboard)
  { let k = 0; for (const l of [...ok].sort(byArrival)) { if (out.has(l) || rectWalkDist(l.rect) > OPEN_ALONG) continue; if (l.kind === 'bottega') out.set(l, l.trade); else if (l.kind === 'casa' && k++ % 3 === 0) out.set(l, l.seed % 2 ? 'kitchen' : 'home'); } }
  // beyond the first 120 m: a house or workshop in about every 40 m cell of the town, so that the streets away from the arrival
  // are lived in too (homes with a hearth room or a kitchen; the spice shops as apothecaries or spice sellers, the cloth shops as weavers' or drapers'; the other trades as they are)
  const cells = new Map(), far = [...ok].filter((l) => !out.has(l) && dist(l, A[0], A[2]) >= 120 && dist(l, A[0], A[2]) < 340 && Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < 330);
  for (const l of far) {
    const cx = Math.floor((l.rect[0] + l.rect[2]) / 80), cz = Math.floor((l.rect[1] + l.rect[3]) / 80);
    for (const [dx, dz] of [[0, 0]]) { const k = `${cx + dx},${cz + dz},${l.kind}`; if (!cells.has(k)) cells.set(k, l); }
  }
  for (const l of cells.values()) {
    const odd = l.seed % 2 === 1;
    out.set(l, l.kind === 'bottega' ? (l.trade === 'spice' && !odd ? 'apothecary' : l.trade === 'cloth' && !odd ? 'weaver' : l.trade) : odd ? 'kitchen' : 'home');
  }
  return out;
}

/** The houses whose upper floors can be climbed (docs/settlements/florence.md §15): the enterable ones within UPPER_REACH m of the arrival, along the first streets. */
export const UPPER_REACH = 70;
export function upper(l) {
  const A = ARRIVALS['florence'];
  return EARLY.has(l) && Math.hypot((l.rect[0] + l.rect[2]) / 2 - A[0], (l.rect[1] + l.rect[3]) / 2 - A[2]) <= UPPER_REACH;
}

