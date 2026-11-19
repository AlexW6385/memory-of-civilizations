// Which lots of Ming Suzhou are shops and of what trade, and which houses are open (docs/settlements/ming-suzhou.md §6, §25, §26): the
// preparation of the lots that town.js, openwalk.js and the garden's walk routes (plan.js) all need to agree on. It sets fields on the
// layout's lots (shop, trade, overhang) once, in a fixed order from seeds of its own, so that any of them may call it first.

import { STREETS, lots } from './layout.js';
import { upOf } from './uphouses.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
/** A lot's front: P(t, off) a point at fraction t along it, off out from it (negative: in); rot turns an object's +z outward. */
export function frontOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, n = FR[f], along = f === 'n' || f === 's';
  const P = (t, off) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) + n[1] * off] : [(f === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t]);
  return { P, n, L: along ? x1 - x0 : z1 - z0, rot: Math.atan2(n[0], n[1]) };
}

export const TRADE_ORDER = ['cloth', 'medicine', 'tea', 'books', 'rice', 'lacquer'];
// the trades of the shops outside the six open ones (weights), and the interior the house builder gives each (it knows six)
export const TRADE_W = { cloth: 1, tea: 1.2, rice: 1, medicine: 0.9, lacquer: 0.7, books: 0.8, wine: 1.2, pottery: 0.9, iron: 0.7, fans: 0.7, food: 1.2 };
export const HOUSE_TRADE = { wine: 'tea', food: 'tea', pottery: 'lacquer', iron: 'lacquer', fans: 'books', pawn: 'lacquer' };

/** More shops along the main streets, and every shop but the open six given one of the eleven trades (a separate stream: the lots stay as they were). */
function prepareShops(open) {
  const all = lots();
  const r = rng(2718);
  for (const l of all) { l.shop0 = l.shop; l.trade0 = l.trade; }
  const main = STREETS.slice(0, 4);
  for (const l of all) {
    if (open.has(l) || l.kind === 'yard' || l.kind === 'grand' || l.water) continue;
    const F = frontOf(l), p = F.P(0.5, 3), near = main.some((s) => p[0] > s[0] - 1 && p[0] < s[2] + 1 && p[1] > s[1] - 1 && p[1] < s[3] + 1);
    const q = r(), d = Math.hypot(p[0], p[1] - 40);
    if (!l.shop && F.L > 3.3 && q < (near ? (d < 150 ? 1 : 0.9) : 0.4)) l.shop = true;
  }
  // every shop but the open six takes its trade in turn from a shuffled list, so that each trade has as many as another
  const mine = all.filter((l) => l.shop && !open.has(l));
  for (let i = mine.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mine[i], mine[j]] = [mine[j], mine[i]]; }
  const names = Object.keys(TRADE_W);
  mine.sort((a, b) => (a.water ? 1 : 0) - (b.water ? 1 : 0));            // (the shops on the canals show no goods outside: the others first, so that each trade has as many)
  mine.forEach((l, i) => { l.trade = names[i % names.length]; });
  // a few of the wide dry shops are pawnshops (dang pu: a great 當 on the wall), by the lot's own seed: about one in twenty
  for (const l of mine) if (!l.water && frontOf(l).L > 4.3 && ((l.seed * 2246822519) >>> 0) % 100 < 6) l.trade = 'pawn';
}

let OPEN = null;
/**
 * Prepare the lots (once) and return the set of the open ones: the six shops (one of each trade) and three homes nearest the way in
 * by the south street, and the houses whose upper floors can be climbed (uphouses.js).
 */
export function prepareTown() {
  if (OPEN) return OPEN;
  const all = lots(), open = new Set();
  const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 60);
  const depth = (l) => (l.front === 's' || l.front === 'n' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]);
  const dry = all.filter((l) => !l.water && (l.front === 's' || l.front === 'n') && l.kind === 'row' && depth(l) < 7.4 && l.rect[2] - l.rect[0] > 4.2).sort((a, b) => near(a) - near(b));
  const shopsNear = dry.filter((l) => l.shop).slice(0, 6);
  shopsNear.forEach((l, k) => { l.trade = TRADE_ORDER[k]; l.overhang = false; open.add(l); });
  for (const l of dry.filter((q) => !q.shop).slice(0, 3)) { l.overhang = false; open.add(l); }
  prepareShops(open);
  // the houses whose upper floors can be climbed (uphouses.js): the open ones, and the weaver's beside them
  for (const l of all) if (upOf(l) && !open.has(l)) { l.overhang = false; open.add(l); const u = upOf(l); if (u.trade && !u.fresh) { l.trade = u.trade; l.shop = true; } }       // (the later houses keep the flags the lots have, so that the street life's stream stays as it was: their shop front, if any, is shopFronts()'s)
  OPEN = open;
  return open;
}
