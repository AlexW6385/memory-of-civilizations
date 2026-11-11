// The trades of Bianjing's shops (dossier §11, "The trades of the scroll"): which trade each shop of
// layout.js's lots keeps, from where it stands — the wine shops and tea houses by the bridge, the
// physician near the gate, the grain and iron shops by the landings and the gate, the cloth, book and
// incense shops on the main street. A pure function of layout.js (a lot's rect, seed, storeys), so
// the shop fronts (shops.js), the smoke (smoke.js) and the interiors (interiors.js) agree.
import { RIVER, BRIDGE, WALL_X, lots, wineLots, teaLots } from './layout.js';

const centre = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const distBridge = (l) => { const [x, z] = centre(l); return Math.hypot(x - BRIDGE.at[0], z - BRIDGE.at[1]); };

let CACHE = null;
/** The wine shops: layout.js's five (kind 'wine'; the scroll has five colour gates). */
export function wineShops() { return all().wine; }
/** The tea houses: layout.js's two on the north riverside street by the bridge (kind 'tea'; their front is the style's tea_house). */
export function teaHouses() { return all().tea; }
function all() {
  if (CACHE) return CACHE;
  const L = lots(), near = (l) => distBridge(l), wine = wineLots(), tea = teaLots();
  const trade = new Map();
  for (const l of wine) trade.set(l, 'wine');
  for (const l of tea) trade.set(l, 'tea');
  // the physician: the shop of the scroll's end, by the gate road (as town.js places Physician Zhao's)
  const doc = L.filter((q) => q.kind === 'shop' && q.front === 's' && q.rect[3] > -85 && q.rect[3] < -83 && q.rect[0] > WALL_X + 25 && q.rect[0] < WALL_X + 38)[0];
  if (doc) trade.set(doc, 'medicine');
  let inns = 0;
  for (const l of L) {
    if (trade.has(l) || !l.shop) continue;
    if (l.kind === 'inn') { trade.set(l, 'inn'); continue; }
    if (l.kind === 'warehouse') { trade.set(l, 'rice'); continue; }
    const d = near(l), [x, z] = centre(l), s = l.seed % 100;
    let t;
    if (d < 70) t = ['cloth', 'medicine', 'books', 'food', 'cloth', 'lacquer', 'incense', 'tea', 'pottery', 'food'][s % 10];            // the bridge's markets: the finer trades
    else if (x < WALL_X + 70) t = ['food', 'iron', 'rice', 'saddlery', 'food', 'wine', 'rice', 'food', 'iron', 'tea'][s % 10];              // the gate: eating houses, saddlers, smiths
    else if (z > RIVER.z1 && z < RIVER.z1 + 30 || z < RIVER.z0 && z > RIVER.z0 - 30) t = ['rice', 'food', 'rice', 'butcher', 'iron', 'wine', 'pottery', 'food', 'rice', 'tea'][s % 10];   // the landings
    else t = ['food', 'cloth', 'butcher', 'rice', 'pottery', 'saddlery', 'incense', 'iron', 'books', 'food', 'tea', 'medicine'][s % 12];
    if (t === 'food' && ++inns > 400) t = 'cloth';
    trade.set(l, t);
  }
  CACHE = { wine, tea, trade };
  return CACHE;
}
/** The trade of a lot (a lot of layout.js's lots()), or null for a house. */
export function tradeOf(l) { return all().trade.get(l) ?? null; }
