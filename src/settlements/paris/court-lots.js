// Paris in 1248 — the lots of the row along the palace court's south side (docs/settlements/paris.md §5d), as pure data: shared by the
// builders (court-houses.js) and the sound map (soundmap.js). No three.js.
import { RIVER } from './layout.js';

function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ZA = 26, ZB = 36.2, X0 = -246, X1 = -128;
// the gaps in the row: the carters' passage to the kitchen yard, the woodyard
// (and the Sainte-Chapelle plan's keep, a tower 9.2 m across at (-170, 30), which stands in the row)
const GAPS = [[-199, -186], [-181, -164.2], [-155, -141]];
// trade index by (seed >>> 3) % 10: baker 0 draper 1 butcher 2 tavern 3 goldsmith 4 shoemaker 5 cooper 6 chandler 7 scribe 8 fishmonger 9
const TRADE_SEQ = [0, 3, 6, 7, 8, 2, 9, 5, 1, 0, 3, 7, 8];
// the trades and uses of the ten houses with rooms above, in the order of the row (merchant: draper, goldsmith; craftsman: chandler, scribe, cooper; tenements; the inn; baker and butcher with their dwellings)
const HOUSE_TRADE = [0, 3, 6, 2, 9, 5, 1, 8, 4, 7], HOUSE_UPPER = ['dwelling', 'inn', 'craft', 'dwelling', 'tenement', 'tenement', 'merchant', 'craft', 'merchant', 'craft'];
const HOUSE_N = [4, 4, 4, 2, 3, 5, 4, 2, 3, 4];
let LOTS = null;
export function courtLots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = lrng(1252);
  let x = X0, i = 0, h = 0;
  while (x < X1 - 5) {
    const gap = GAPS.find(([a, b]) => x >= a - 0.2 && x < b);
    if (gap) { x = gap[1]; continue; }
    let w = 5.4 + rand() * 3.4;
    const g2 = GAPS.find(([a]) => x + w > a && x < a); if (g2) w = Math.max(4.8, g2[0] - x - 0.3);
    const kind = i % 6 === 4 ? 'inn' : i % 6 === 2 ? 'joiner' : 'house', hh = kind === 'house' && h < HOUSE_TRADE.length ? h : -1;
    // (the pilgrims' inns are the tavern's trade below and the joiners' shops the cooper's, all in the one timber-and-stone house)
    const idx = kind === 'inn' ? 3 : kind === 'joiner' ? 6 : hh >= 0 ? HOUSE_TRADE[hh] : TRADE_SEQ[i % TRADE_SEQ.length], seed = (idx + 10 * (1 + (i % 7))) * 8 + Math.floor(rand() * 8);
    const st = 2 + (i % 3 === 1 ? 2 : i % 3 === 0 ? 1 : 0) + (rand() < 0.2 ? 1 : 0);
    LOTS.push({ rect: [x, ZA, x + w - 0.25, ZB], seed, front: 'n', storeys: hh >= 0 ? HOUSE_N[hh] : st, kind, i, upper: kind === 'inn' ? 'inn' : kind === 'joiner' ? 'craft' : hh >= 0 ? HOUSE_UPPER[hh] : undefined });
    if (kind === 'house') h++;
    x += w; i++;
  }
  return LOTS;
}
