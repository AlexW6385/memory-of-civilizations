import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The Borgo's houses and the palaces across the river (docs/settlements/baroque-rome.md §5).
import { RADIUS, lots, rows, LANES } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [125, 0], facing: 'w' } });
const TRADES = ['grocer', 'baker', 'cloth', 'wine', 'apothecary', 'osteria', 'cobbler'];
const CAS_H = [3.9, 3.4, 3.2, 2.9];
export async function houses() {
  const all = lots(), plans = [], arrival = ARRIVALS['baroque-rome'], homes = openLots(all, [arrival[0], arrival[2]], 5);
  // the lots about the Borgo and the oval's mouth are fronted like the Borgo's own houses (shops, madonnelle, awnings, notices);
  // the farther ones, and the three homes that can be entered, are the shared Roman house
  const fronted = all.filter((l) => l.fronted && !homes.has(l) && l.rect[2] - l.rect[0] >= 8.4);
  const bott = new Set(fronted.slice().sort((a, b) => Math.hypot(a.rect[0] - arrival[0], a.rect[1]) - Math.hypot(b.rect[0] - arrival[0], b.rect[1])).slice(0, 8));
  const rest = all.filter((l) => !fronted.includes(l));
  plans.push(...lodTiles('baroque-rome-houses', 'vernacular', rest.map((l) => ({ t: 'house_med', variant: 'roman', ...l, ...(homes.has(l) ? { open: true, use: homes.get(l) } : {}) })), { R: RADIUS }));
  const rand0 = (n) => ((Math.sin(n * 91.7) * 43758.5453) % 1 + 1) % 1;
  const lotRows = fronted.map((l, i) => {
    const w = l.rect[2] - l.rect[0], st = l.storeys, r = rand0(l.seed);
    return { t: 'borgo_row', rect: l.rect, face: l.front, y: 0, units: [{ u0: 0, w, kind: 'casa', storeys: st, H: CAS_H.slice(0, st).reduce((p, q) => p + q, 0), seed: l.seed, trade: TRADES[i % TRADES.length], madonna: r < 0.4, flip: r > 0.5, awning: rand0(l.seed + 3) < 0.4, birdcage: rand0(l.seed + 5) < 0.2, cat: false, open: bott.has(l) }] };
  });
  plans.push(...lodTiles('baroque-rome-lots', 'baroque', lotRows, { R: RADIUS }));
  // the Borgo's rows of palazzi and houses, and the laundry across the alley and the lanes
  const rand = (n) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const ropes = [];
  for (let x = 138; x < 226; x += 6 + Math.floor(rand(x) * 4)) ropes.push({ a: [x, -1.5], b: [x, 1.5], y: 6.5 + rand(x + 1) * 3.5 });
  for (const [a, b] of LANES) for (const y of [5.5, 8.8, 11.5]) { ropes.push({ a: [a, -6], b: [b, -6], y }); ropes.push({ a: [a, 3], b: [b, 3], y: y + 0.6 }); }
  const els = rows().map((r) => ({ t: 'borgo_row', rect: r.rect, face: r.face, units: r.units.map(({ x0, x1, ...u }) => u), laundry: r.id === 'N' ? ropes : [] }));
  plans.push(...lodTiles('baroque-rome-borgo', 'baroque', els, { R: RADIUS }));
  return plans;
}
