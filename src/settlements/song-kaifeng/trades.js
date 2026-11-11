// The trades of Bianjing's shops (dossier §11, "The trades of the scroll"): which trade each shop of
// layout.js's lots keeps, from where it stands — the wine shops and tea houses by the bridge, the
// physician near the gate, the grain and iron shops by the landings and the gate, the cloth, book and
// incense shops on the main street. A pure function of layout.js (a lot's rect, seed, storeys), so
// the shop fronts (shops.js), the smoke (smoke.js) and the interiors (interiors.js) agree.
import { RIVER, BRIDGE, WALL_X, lots } from './layout.js';

const centre = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const distBridge = (l) => { const [x, z] = centre(l); return Math.hypot(x - BRIDGE.at[0], z - BRIDGE.at[1]); };

let CACHE = null;
/** The wine shops: the five largest two-storey shops nearest the bridge (the scroll has five colour gates; as town.js picks them). */
export function wineShops() { return all().wine; }
/** The tea houses: the two one-storey shops on the north riverside street nearest the bridge (as town.js picks them). */
export function teaHouses() { return all().tea; }
function all() {
  if (CACHE) return CACHE;
  const L = lots();
  const near = (l) => distBridge(l);
  const wine = L.filter((l) => l.shop && l.storeys === 2 && l.rect[2] - l.rect[0] > 0 && near(l) < 140).sort((a, b) => near(a) - near(b))
    .filter((l, i, a) => a.slice(0, i).every((m) => Math.hypot(m.rect[0] - l.rect[0], m.rect[1] - l.rect[1]) > 18)).slice(0, 5);
  const tea = L.filter((l) => l.front === 's' && l.shop && l.storeys === 1 && Math.abs(l.rect[3] - (RIVER.z0 - 14)) < 1 && l.rect[2] - l.rect[0] > 8 && l.rect[3] - l.rect[1] > 11)
    .sort((a, b) => Math.abs(centre(a)[0] - BRIDGE.at[0]) - Math.abs(centre(b)[0] - BRIDGE.at[0])).slice(0, 2);
  const trade = new Map();
  for (const l of wine) trade.set(l, 'wine');
  for (const l of tea) trade.set(l, 'tea');
  // the physician: the shop of the scroll's end, by the gate road (as town.js places Physician Zhao's)
  const doc = L.filter((q) => q.shop && q.front === 's' && q.rect[3] > -85 && q.rect[3] < -83 && q.rect[0] > WALL_X + 25 && q.rect[0] < WALL_X + 38)[0];
  if (doc) trade.set(doc, 'medicine');
  let inns = 0;
  for (const l of L) {
    if (trade.has(l) || !l.shop) continue;
    const d = near(l), [x, z] = centre(l), s = l.seed % 100;
    let t;
    if (d < 70) t = ['cloth', 'medicine', 'books', 'food', 'cloth', 'lacquer', 'incense', 'tea', 'pottery', 'food'][s % 10];            // the bridge's markets: the finer trades
    else if (x < WALL_X + 70) t = ['inn', 'iron', 'rice', 'saddlery', 'food', 'wine', 'rice', 'inn', 'iron', 'tea'][s % 10];              // the gate: inns, saddlers, smiths
    else if (z > RIVER.z1 && z < RIVER.z1 + 30 || z < RIVER.z0 && z > RIVER.z0 - 30) t = ['rice', 'food', 'rice', 'butcher', 'iron', 'wine', 'pottery', 'inn', 'rice', 'tea'][s % 10];   // the landings
    else t = ['food', 'cloth', 'butcher', 'rice', 'pottery', 'saddlery', 'incense', 'iron', 'books', 'inn', 'tea', 'medicine'][s % 12];
    if (t === 'inn' && ++inns > 14) t = 'food';
    trade.set(l, t);
  }
  CACHE = { wine, tea, trade };
  return CACHE;
}
/** The trade of a lot (a lot of layout.js's lots()), or null for a house. */
export function tradeOf(l) { return all().trade.get(l) ?? null; }
