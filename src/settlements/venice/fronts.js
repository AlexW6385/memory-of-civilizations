// The fronts of the houses, varied by a rule (docs/settlements/venice.md §5d): from the width of the house, its seed and the free ground before
// its front, each house gets one or more of: the Gothic polifora panel (wide houses), a pilastered stone doorway, a liagò (the glazed timber
// loggia on the top storey), chain quoins; some stay plain. Pure data; the builder is `ven_facade` of the venetian style.
import { ARRIVALS } from '../../planet/arrivals.js';
import { GROUND, RADIUS, lots, inLot, wet } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const A = ARRIVALS['venice'];

/** How deep the ground free of other houses and water is before the middle of a lot's front (0.5, 1.4 or 3). */
export function freeBefore(l) {
  const [x0, z0, x1, z1] = l.rect, s = l.front === 's' ? 1 : -1, zf = s > 0 ? z1 : z0;
  let best = 3;
  for (const t of [0.35, 0.5, 0.65]) for (const d of [0.5, 1.4, 2.4]) {
    const x = x0 + (x1 - x0) * t, z = zf + s * d;
    if (inLot(x, z, 0.1) || wet(x, z) < 1.2 || Math.hypot(x, z) > RADIUS - 72) { best = Math.min(best, d === 0.5 ? 0 : d === 1.4 ? 0.5 : 1.4); break; }
  }
  return best;
}
/** The kinds of front of one lot. */
export function kindsOf(l, open, up = false) {
  const W = l.rect[2] - l.rect[0], f = freeBefore(l), r = rng(l.seed + 4141), h = Math.floor(r() * 12), out = [];
  if (f < 0.5) return out;
  const c = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], awning = !open && W >= 6.5 && Math.hypot(c[0] - A[0], c[1] - A[2]) <= 170 && rng(l.seed + 909)() <= 0.34;
  if (up) { if (!awning && h % 2 === 0) out.push('portal'); if (h % 3 === 0) out.push('quoins'); return out; }
  if (W >= 9.2) { out.push('polifora'); if (!awning) out.push('portal'); if (h % 3 === 0) out.push('quoins'); }
  else switch (h % 4) {
    case 0: if (!awning) out.push('portal'); break;
    case 1: if (f >= 1.4 && l.storeys >= 3) out.push('liago'); if (!awning) out.push('portal'); break;
    case 2: out.push('quoins'); if (!awning) out.push('portal'); break;
    default: break;
  }
  return out;
}
/** Plans of the fronts, one per 100 m tile, built within 150 m of the tile's centre. */
export function frontPlans(open, up = new Set()) {
  const tiles = new Map();
  for (const l of lots()) {
    const kinds = kindsOf(l, open.has(l), up.has(l));
    if (!kinds.length) continue;
    const c = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], k = `${Math.floor(c[0] / 100)},${Math.floor(c[1] / 100)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push({ rect: l.rect, front: l.front, y: l.y ?? GROUND, seed: l.seed, storeys: l.storeys, kinds });
  }
  return [...tiles].map(([k, items]) => {
    const [i, j] = k.split(',').map(Number);
    return { id: `venice-fronts-${k}`, style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' }, center: [i * 100 + 50, j * 100 + 50], near: 150, elements: [{ t: 'ven_facade', items }] };
  });
}
