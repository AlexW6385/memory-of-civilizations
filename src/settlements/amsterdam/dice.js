// What a lot of the town is, from its own numbers alone (no builders, no three.js): which houses stand open, which of those are the shops of the walk and of what
// trade, and what the houses are (warehouse, tavern, craftsman's...). The same dice as src/styles/dutch/upper.js profile() draws (the sound map and the night read
// them here without loading the house builder; tests/amsterdam-sound.test.mjs checks the two agree).
import { HALL, lots } from './layout.js';
import { onWalk, walkSet, ARRIVAL } from './openwalk.js';

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const TRADES = ['baker', 'cheese', 'draper', 'grocer', 'delft', 'tobacco'];
/** The rule before the walk's lots were added (the upper floors' set is chosen by it): the Dam's south row, and one house in four near the Dam (one in three beyond 190 m). */
export const isOpenBase = (l) => (l.front === 'n' && l.rect[1] === -203) || l.seed % (Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 + 230) < 190 ? 4 : 3) === 0;
export const isOpen = (l) => isOpenBase(l) || onWalk(l);
/** The house's use and trade, as profile() has them: { warehouse, use: 'zaal' | 'kitchen' | 'office' | 'store', trade: 'inn' | 'merchant' | 'lodgers' | 'craftsman' | 'counting' | 'store' }. */
export function dice(l) {
  const seed = l.seed || 1, rand = rng(seed); rand(); rand(); rand();
  const kr = rand(), kind = l.gable ?? (kr > 0.9 ? 'spout' : kr < 0.3 ? 'step' : kr < 0.65 ? 'neck' : 'bell'), warehouse = kind === 'spout';
  const use = warehouse ? 'store' : ((q) => (q < 0.45 ? 'zaal' : q < 0.75 ? 'kitchen' : 'office'))(rng(seed * 19 + 7)());
  const tr = rng(seed * 29 + 5)();
  const trade = warehouse ? 'store' : use === 'zaal' ? (tr < 0.3 ? 'inn' : 'merchant') : use === 'kitchen' ? (tr < 0.5 ? 'lodgers' : 'craftsman') : 'counting';
  return { warehouse, use, trade };
}
const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const atCorner = (q) => q.rect[0] <= HALL[2] + 0.5 && q.rect[1] - HALL[3] < 3;       // the lot at the Town Hall's corner stays shut
let SHOPS = null;
/** The shop lots: [{ lot, trade }], nearest the arrival first, no two neighbours of one trade; warehouses and the shut corner lot excepted. */
export function shopSites(max = 8) {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  const d = (l) => Math.hypot(mid(l)[0] - ARRIVAL[0], mid(l)[1] - ARRIVAL[1]);
  let k = 0;
  for (const l of [...walkSet()].filter((q) => isOpen(q) && !dice(q).warehouse && !atCorner(q)).sort((a, b) => d(a) - d(b)).slice(0, max)) {
    let t = TRADES[(l.seed + k) % TRADES.length];
    if (SHOPS.length && SHOPS[SHOPS.length - 1].trade === t) t = TRADES[(TRADES.indexOf(t) + 1) % TRADES.length];
    SHOPS.push({ lot: l, trade: t }); k++;
  }
  return SHOPS;
}
export { lots };
