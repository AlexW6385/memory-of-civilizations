import { ARRIVALS } from '../../planet/arrivals.js';
// The houses and palaces of the streets (docs/settlements/florence.md §5).
import { RADIUS, MERCATO, lots } from './layout.js';

// The houses in two levels of detail as src/settlements/lod.js makes them, but in tiles of TILE m
// rather than 100 m: every house wears one of six stuccoes, so each tile costs a mesh per stucco per
// level, and fewer, larger tiles leave room in the mesh budget for the landmarks (DESIGN §8). The
// near distance grows with the tile so that the full houses still reach as far round the walker as
// before (220 m less the half-diagonal of a 100 m tile).
const TILE = 150, NEAR = 220 - 50 * Math.SQRT2 + (TILE / 2) * Math.SQRT2;
function tiles(id, style, elements) {
  const by = new Map();
  for (const e of elements) {
    const x = (e.rect[0] + e.rect[2]) / 2, z = (e.rect[1] + e.rect[3]) / 2;
    const k = `${Math.floor((x + TILE / 2) / TILE)},${Math.floor((z + TILE / 2) / TILE)}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of by) {
    const [i, j] = k.split(',').map(Number), center = [i * TILE, j * TILE];
    const base = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, center };
    plans.push({ ...base, id: `${id}-${k}`, near: NEAR, elements: list });
    plans.push({ ...base, id: `${id}-${k}-far`, far: NEAR, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}

/**
 * The houses that can be entered: the osteria and the homes round the arrival, and workshops of the trades
 * by the Mercato Vecchio and on the Via Calzaiuoli and the Via Larga: one of each trade where the lots allow.
 * Returns a map from lot to its use ('inn', 'home' or the trade).
 */
function enterable(all) {
  const ok = all.filter((l) => l.kind !== 'torre' && l.kind !== 'palazzo' && l.rect[2] - l.rect[0] >= 5.2 && l.rect[3] - l.rect[1] >= 7 && l.storeys >= 2);
  const out = new Map(), A = ARRIVALS['florence'];
  const dist = (l, x, z) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
  const take = (list, n, use) => { let k = 0; for (const l of list) { if (k >= n) break; if (out.has(l)) continue; out.set(l, typeof use === 'function' ? use(l, k) : use); k++; } };
  take([...ok].sort((a, b) => dist(a, A[0], A[2]) - dist(b, A[0], A[2])), 1, 'inn');
  take([...ok].filter((l) => l.kind === 'casa').sort((a, b) => dist(a, A[0], A[2]) - dist(b, A[0], A[2])), 2, 'home');
  // one workshop of each trade, the nearest to the market and to the arrival
  const mc = [(MERCATO[0] + MERCATO[2]) / 2, (MERCATO[1] + MERCATO[3]) / 2], seen = new Set();
  const shops = ok.filter((l) => l.kind === 'bottega').sort((a, b) => Math.min(dist(a, mc[0], mc[1]), dist(a, A[0], A[2]) + 40) - Math.min(dist(b, mc[0], mc[1]), dist(b, A[0], A[2]) + 40));
  for (const l of shops) { if (seen.has(l.trade) || out.size >= 14) continue; seen.add(l.trade); out.set(l, l.trade); }
  take([...ok].filter((l) => l.kind === 'casa').sort((a, b) => dist(a, mc[0], mc[1]) - dist(b, mc[0], mc[1])), 2, 'home');
  return out;
}

export async function houses() {
  const all = lots(), open = enterable(all);
  const mine = all.map((l) => ({ t: 'casa', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) }));
  return tiles('florence-houses', 'renaissance', mine);
}
