import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The Albaicín and the town (docs/settlements/granada.md §5): whitewashed houses under tiled roofs.
import { RADIUS, lots, height, hillE } from './layout.js';
import { lifePlan, aljibeLife } from './life.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, 30], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['granada'][0], ARRIVALS['granada'][2]]);
  const patio = new Set(albaicinPatios(all).filter((l) => !open.has(l)));
  plans.push(...lodTiles('granada-houses', 'vernacular', all.filter((l) => !patio.has(l)).map((l) => ({ t: 'house_med', variant: 'moorish', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  // the Albaicín's houses round their patios and its cisterns (§5.1), in the Nasrid style
  const cis = aljibes(all);
  plans.push({ ...base('granada-albaicin', [...[...patio].map((l) => ({ t: 'patio_house', rect: l.rect, y: l.y, foot: l.foot, front: l.front, seed: l.seed })), ...cis]), style: 'nasrid' });
  plans.push({ ...base('granada-aljibe-life', aljibeLife(cis)), style: 'life' });
  return [...plans, lifePlan()];
}

/** The larger lots of the Albaicín across the Darro (z < -124), on gentle ground: about two in three become houses round a patio. */
export function albaicinPatios(all) {
  return all.filter((l) => { const [x0, z0, x1, z1] = l.rect; return (z0 + z1) / 2 < -124 && x1 - x0 >= 8.4 && z1 - z0 >= 8.4 && l.y - l.foot < 2.2 && l.seed % 3 !== 0; });
}
/**
 * The cisterns (aljibes) of the Albaicín (§5.1): in the open places the lots leave in the lanes' grid
 * (a cell with no house within 6 m), on level ground, one in about every 90 m.
 */
export function aljibes(all) {
  const out = [];
  for (let x = -RADIUS + 26; x < RADIUS - 26; x += 12) for (let z = -RADIUS + 25.5; z < -130; z += 11) {
    if (Math.hypot(x, z) > RADIUS - 50 || hillE(x, z) < 1.5 || out.some((a) => Math.hypot(a.at[0] - x, a.at[1] - z) < 90)) continue;
    if (all.some((l) => x > l.rect[0] - 3.6 && x < l.rect[2] + 3.6 && z > l.rect[1] - 3.4 && z < l.rect[3] + 3.4)) continue;
    const hs = [[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([a, b]) => height(x + a, z + b));
    if (Math.max(...hs) - Math.min(...hs) > 0.8) continue;
    out.push({ t: 'aljibe', at: [x, z], y: Math.max(...hs), rot: 0 });
  }
  return out;
}
