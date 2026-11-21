import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses of the islands (docs/settlements/venice.md §5).
import { RADIUS, lots, PIAZZA, PIAZZETTA, GROUND, MERCERIA_ST } from './layout.js';
import { molo, moloFine, doge, iconostasis, masts, sculptPlans } from './plan.js';
import { canalPlans } from './rialto.js';
import { dressPlans } from './dress.js';
import { roomPlans } from './rooms.js';
import { frontPlans } from './fronts.js';
import { upHouses } from './upper.js';
import { shopPlans, shopGlowPlan, merceriaPlans } from './shops.js';
import { nightPlans } from './nightlight.js';
import { inLot, wet } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-120, -5], facing: 'e' } });
export async function town() {
  const all = lots(), plans = [molo, moloFine, doge, iconostasis, masts, ...sculptPlans(), ...canalPlans()], open = openLots(all, [ARRIVALS['venice'][0], ARRIVALS['venice'][2]], 26);
  [...open.keys()].forEach((l, i) => open.set(l, i % 4 === 0 ? 'inn' : 'home'));                 // 26 houses to enter: an inn in every fourth
  // beyond the first 120 m: more houses to enter, spread over the islands by a rule (a hash of the seed, a free calle before the front), an inn in every fifth
  const A = ARRIVALS['venice'], far = all.filter((l) => !open.has(l) && l.rect[2] - l.rect[0] >= 6 && Math.hypot((l.rect[0] + l.rect[2]) / 2 - A[0], (l.rect[1] + l.rect[3]) / 2 - A[2]) > 120 && Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) < 300 && (l.seed % 6) === 3);
  let nf = 0;
  for (const l of far) {
    const s = l.front === 's' ? 1 : -1, zf = s > 0 ? l.rect[3] : l.rect[1];
    if ([0.35, 0.5, 0.65].some((t) => { const x = l.rect[0] + (l.rect[2] - l.rect[0]) * t; return [1.0, 2.0].some((d) => inLot(x, zf + s * d, 0.1) || wet(x, zf + s * d) < 1.2); })) continue;
    open.set(l, nf++ % 5 === 2 ? 'inn' : 'home');
  }
  for (const u of upHouses()) open.set(u.lot, u.use);                       // the climbable houses are entered too (upper.js; set after the far rule, so its inns stay where they were)
  const dress = dressPlans();
  plans.push(...dress, ...merceriaPlans(), ...shopPlans(), shopGlowPlan(), ...nightPlans(dress));
  const up = new Map(upHouses().map((u) => [u.lot, u]));
  plans.push(...frontPlans(open, new Set(up.keys())));
  plans.push(...roomPlans(open, up));
  plans.push(...lodTiles('venice-houses', 'vernacular', all.filter((l) => !up.has(l)).map((l) => ({ t: 'house_med', variant: 'venetian', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  // the houses whose upper floors can be climbed: the same houses, built by ven_house (the far copy is house_med's simple one)
  plans.push(...lodTiles('venice-houses-up', 'venetian', [...up.values()].map(({ lot, use, kind, balcony }) => ({ t: 'ven_house', variant: 'venetian', ...lot, open: true, use, up: { kind, balcony } })), { R: RADIUS }));
  // the piazza and the piazzetta paved in herringbone brick, laid from 1264, in fields between bands of white
  // Istrian stone (relaid in trachyte only from 1723) [stated: Wikipedia "Piazza San Marco"]; the bands every 10 m [inferred]
  const pave = [];
  for (const r of [PIAZZA, PIAZZETTA]) {
    pave.push({ t: 'floor', rect: r, y: GROUND + 0.03, th: 0.1, mat: 'cotto_floor' });
    for (let x = r[0] + 5; x < r[2] - 2; x += 10) pave.push({ t: 'floor', rect: [x - 0.25, r[1], x + 0.25, r[3]], y: GROUND + 0.035, th: 0.1, mat: 'limestone' });
    // cross bands (the fields are squares of brick between the bands) and a stone kerb along the edge [inferred: the layout of the fields]
    for (let z = r[1] + 4.5; z < r[3] - 2; z += 9) pave.push({ t: 'floor', rect: [r[0], z - 0.2, r[2], z + 0.2], y: GROUND + 0.04, th: 0.1, mat: 'limestone' });
  }
  // the ground south of the Campanile and along the west side of the Piazzetta, bare earth before: the same brick, a band of stone every 9 m [inferred: the Piazzetta's paving ran on there]
  for (const r of [[0, PIAZZA[3], PIAZZETTA[0], PIAZZA[3] + 4], [11, PIAZZA[3] + 4, PIAZZETTA[0], PIAZZETTA[3]]]) {
    pave.push({ t: 'floor', rect: r, y: GROUND + 0.03, th: 0.1, mat: 'cotto_floor' });
    for (let z = r[1] + 4.5; z < r[3] - 2; z += 9) pave.push({ t: 'floor', rect: [r[0], z - 0.2, r[2], z + 0.2], y: GROUND + 0.04, th: 0.1, mat: 'limestone' });
  }
  pave.push({ t: 'floor', rect: [MERCERIA_ST[0], MERCERIA_ST[1], MERCERIA_ST[2], MERCERIA_ST[3]], y: GROUND + 0.03, th: 0.1, mat: 'cotto_floor' });
  pave.push({ t: 'floor', rect: [(MERCERIA_ST[0] + MERCERIA_ST[2]) / 2 - 0.25, MERCERIA_ST[1], (MERCERIA_ST[0] + MERCERIA_ST[2]) / 2 + 0.25, MERCERIA_ST[3]], y: GROUND + 0.035, th: 0.1, mat: 'bluestone' });
  plans.push(base('venice-piazza-paving', pave));
  // (the water of the canals, the basin and the lagoon is the planet's sea: ground.js, sea)
  return plans;
}
