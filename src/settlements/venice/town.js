import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses of the islands (docs/settlements/venice.md §5).
import { RADIUS, lots, PIAZZA, PIAZZETTA, GROUND, MERCERIA } from './layout.js';
import { molo, doge, iconostasis, masts } from './plan.js';
import { canalPlans } from './rialto.js';
import { dressPlans } from './dress.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [molo, doge, iconostasis, masts, ...canalPlans()], open = openLots(all, [ARRIVALS['venice'][0], ARRIVALS['venice'][2]], 26);
  [...open.keys()].forEach((l, i) => open.set(l, i % 4 === 0 ? 'inn' : 'home'));                 // 26 houses to enter: an inn in every fourth
  plans.push(...dressPlans());
  plans.push(...lodTiles('venice-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'venetian', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  // the piazza and the piazzetta paved in herringbone brick, laid from 1264, in fields between bands of white
  // Istrian stone (relaid in trachyte only from 1723) [stated: Wikipedia "Piazza San Marco"]; the bands every 10 m [inferred]
  const pave = [];
  for (const r of [PIAZZA, PIAZZETTA]) {
    pave.push({ t: 'floor', rect: r, y: GROUND + 0.03, th: 0.1, mat: 'brick_paving' });
    for (let x = r[0] + 5; x < r[2] - 2; x += 10) pave.push({ t: 'floor', rect: [x - 0.25, r[1], x + 0.25, r[3]], y: GROUND + 0.035, th: 0.1, mat: 'limestone' });
  }
  pave.push({ t: 'floor', rect: [MERCERIA[0], MERCERIA[1], MERCERIA[2], MERCERIA[3] - 2.5], y: GROUND + 0.03, th: 0.1, mat: 'brick_paving' });
  pave.push({ t: 'floor', rect: [(MERCERIA[0] + MERCERIA[2]) / 2 - 0.25, MERCERIA[1], (MERCERIA[0] + MERCERIA[2]) / 2 + 0.25, MERCERIA[3] - 2.5], y: GROUND + 0.035, th: 0.1, mat: 'bluestone' });
  plans.push(base('venice-piazza-paving', pave));
  // (the water of the canals, the basin and the lagoon is the planet's sea: ground.js, sea)
  return plans;
}
