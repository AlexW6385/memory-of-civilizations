import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The Borgo's houses and the palaces across the river (docs/settlements/baroque-rome.md §5).
import { RADIUS, lots, rows, LANES } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [125, 0], facing: 'w' } });
export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['baroque-rome'][0], ARRIVALS['baroque-rome'][2]]);
  plans.push(...lodTiles('baroque-rome-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'roman', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  // the Borgo's rows of palazzi and houses, and the laundry across the alley and the lanes
  const rand = (n) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;
  const ropes = [];
  for (let x = 138; x < 226; x += 6 + Math.floor(rand(x) * 4)) ropes.push({ a: [x, -1.5], b: [x, 1.5], y: 6.5 + rand(x + 1) * 3.5 });
  for (const [a, b] of LANES) for (const y of [5.5, 8.8, 11.5]) { ropes.push({ a: [a, -6], b: [b, -6], y }); ropes.push({ a: [a, 3], b: [b, 3], y: y + 0.6 }); }
  const els = rows().map((r) => ({ t: 'borgo_row', rect: r.rect, face: r.face, units: r.units.map(({ x0, x1, ...u }) => u), laundry: r.id === 'N' ? ropes : [] }));
  plans.push(...lodTiles('baroque-rome-borgo', 'baroque', els, { R: RADIUS }));
  return plans;
}
