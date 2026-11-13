// Paris in 1248 — the lodgings and offices along the palace court's south side (docs/settlements/paris.md §5d): the court has no
// ordinary houses of its own at the arrival, so the row that served it is built and furnished here: the panetier's bakehouse, the
// buttery, the cooper, the chandler who lit the chapel, the clerks' scriveners, the fishmonger and butcher of the kitchens, a
// pilgrims' inn at the gate and a joiner's shop. Each can be entered, has its hanging lamp, its goods and its people.
import { RIVER } from './layout.js';
import { lodTiles } from '../lod.js';
import { shopPoint } from '../../styles/gothic/houses.js';

function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const ZA = 26, ZB = 36.2, X0 = -246, X1 = -128;
// the gaps in the row: the carters' passage to the kitchen yard, the woodyard
const GAPS = [[-199, -186], [-155, -141]];
// trade index by (seed >>> 3) % 10: baker 0 draper 1 butcher 2 tavern 3 goldsmith 4 shoemaker 5 cooper 6 chandler 7 scribe 8 fishmonger 9
const TRADE_SEQ = [0, 3, 6, 7, 8, 2, 9, 5, 1, 0, 3, 7, 8];
let LOTS = null;
export function courtLots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = lrng(1252);
  let x = X0, i = 0;
  while (x < X1 - 5) {
    const gap = GAPS.find(([a, b]) => x >= a - 0.2 && x < b);
    if (gap) { x = gap[1]; continue; }
    let w = 5.4 + rand() * 3.4;
    const g2 = GAPS.find(([a]) => x + w > a && x < a); if (g2) w = Math.max(4.8, g2[0] - x - 0.3);
    const idx = TRADE_SEQ[i % TRADE_SEQ.length], seed = (idx + 10 * (1 + (i % 7))) * 8 + Math.floor(rand() * 8);
    const kind = i % 6 === 4 ? 'inn' : i % 6 === 2 ? 'joiner' : 'house';
    LOTS.push({ rect: [x, ZA, x + w - 0.25, ZB], seed, front: 'n', storeys: 2 + (i % 3 === 1 ? 2 : i % 3 === 0 ? 1 : 0) + (rand() < 0.2 ? 1 : 0), kind, i });
    x += w; i++;
  }
  return LOTS;
}
export function courtHouses() {
  const y = RIVER.ground, opts = { near: 200, R: 420, entrance: { at: [-250, -10], facing: 'e' } };
  const gothic = [], timber = [];
  for (const l of courtLots()) {
    if (l.kind === 'house') gothic.push({ t: 'paris_house', y, foot: y, rect: l.rect, seed: l.seed, front: 'n', storeys: l.storeys, open: true, lit: true });
    else timber.push({ t: 'house_timber', y, foot: y, rect: l.rect, seed: l.seed, front: 'n', storeys: Math.max(2, l.storeys - 1), open: true, use: l.kind === 'inn' ? 'inn' : 'workshop' });
  }
  return [...lodTiles('paris-court-houses', 'gothic', gothic, opts), ...lodTiles('paris-court-timber', 'vernacular', timber, opts)];
}
/** Who is inside and at the doors: the master behind the counter, a customer, goods and a lantern outside. */
export function courtHouseLife() {
  const rand = lrng(1261), L = [], y0 = RIVER.ground, pick = (a) => a[Math.floor(rand() * a.length)];
  const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.56 + rand() * 0.18, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim', 'cap']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_white']), legs: 'hose', feet: 'shod', hair: pick(['short', 'long', 'short']), ...o });
  for (const l of courtLots()) {
    const [x0, z0, x1] = l.rect, cx = (x0 + x1) / 2, front = z0;
    if (l.kind === 'house') {
      const sp = shopPoint({ rect: l.rect, y: 1, seed: l.seed, front: 'n' }), [ox, oz] = sp.out, q = (a, b) => [sp.at[0] + ox * a - oz * b, sp.at[1] + oz * a + ox * b];
      if (l.i % 3 !== 2) fig(sp.inside, y0 + 0.1, faceTo(sp.inside, sp.at), { pose: 'stand', over: pick(['sash', 'none']), carry: 'none' });
      if (l.i % 2 === 0) { const a = q(0.2, (rand() - 0.5) * 1.2); fig(a, y0, faceTo(a, [a[0] - ox, a[1] - oz]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.4 ? 'basket' : 'none' }); }
      switch (sp.trade) {
        case 'cooper': L.push({ t: 'barrel', at: q(1.4, 1.2), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }); break;
        case 'baker': L.push({ t: 'sacks', at: q(1.3, 1.5), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }); break;
        case 'tavern': L.push({ t: 'bench', at: q(1.5, 1.4), y: y0, rot: Math.PI / 2, len: 1.6 }, { t: 'barrel', at: q(1.0, -1.7), y: y0, rot: 0, n: 2, seed: Math.floor(rand() * 1e6) }); break;
        case 'butcher': L.push({ t: 'crates', at: q(1.2, 1.4), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) }); break;
        case 'fishmonger': L.push({ t: 'basket', at: q(1.1, 1.0), y: y0, rot: 0, s: 1, seed: Math.floor(rand() * 1e6) }); break;
        default: L.push({ t: 'basket', at: q(1.1, 1.2), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
      }
      L.push({ t: 'lantern', at: q(0.3, 1.9), y: y0, rot: 0, kind: 'iron', h: 2.7 });
    } else {
      // the timber houses' door is at the middle of the front (house_timber): the innkeeper or the joiner just inside, a guest at the table
      const inside = [cx, front + 1.6];
      fig(inside, y0 + 0.25, faceTo(inside, [cx, front - 4]), { pose: l.kind === 'inn' ? 'stand' : 'low', over: 'belt', carry: 'none', dress: 'tunic' });
      if (l.kind === 'inn') { const a = [cx - 0.6, front + 3.6]; fig(a, y0 + 0.25, faceTo(a, [cx + 0.6, front + 3.6]), { pose: 'sit', dress: 'tunic', hat: 'cap' }); L.push({ t: 'bench', at: [cx - 1.8, front - 1.4], y: y0, rot: 0, len: 1.6 }); }
      else L.push({ t: 'firewood', at: [x1 - 1.2, front - 1.2], y: y0, rot: 0, len: 1.2, seed: l.i }, { t: 'crates', at: [x0 + 1.2, front - 1.1], y: y0, rot: 0.3, seed: l.i + 5 });
      L.push({ t: 'lantern', at: [cx + 1.3, front - 1.0], y: y0, rot: 0, kind: 'iron', h: 2.7 });
    }
  }
  return { id: 'paris-court-houses-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [-250, -10], facing: 'e' }, bounds: [-260, 10, -120, 60], rooms: [], elements: L };
}
