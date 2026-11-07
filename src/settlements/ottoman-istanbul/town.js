import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The timber houses of the slopes (docs/settlements/ottoman-istanbul.md §5); the coffee house on the lane west of the
// terrace by the Tiryaki shops (§10); the street life (§10, life.js).
import { RADIUS, lots, COFFEE } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -100], facing: 's' } });
export async function town() {
  const coffee = COFFEE(), all = lots().filter((l) => l !== coffee), plans = [], open = openLots(all, [ARRIVALS['ottoman-istanbul'][0], ARRIVALS['ottoman-istanbul'][2]]);
  plans.push(...lodTiles('ottoman-istanbul-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'ottoman', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  const [x0, z0, x1, z1] = coffee.rect;
  plans.push({ ...base('ottoman-istanbul-kahvehane', [{ t: 'kahvehane', rect: coffee.rect, y: coffee.y, foot: coffee.foot, front: 'e', seed: coffee.seed }]), style: 'ottoman', bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2],
    rooms: [{ id: 'coffee house', rect: [x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], y: coffee.y + 0.45, kind: 'hall' }] });
  plans.push(lifePlan());
  return plans;
}
