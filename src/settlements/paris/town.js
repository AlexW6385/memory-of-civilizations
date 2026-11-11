import { openLots, lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses of the Cité and the banks (docs/settlements/paris.md §5, §5a): timber-framed, jettied, gabled.
// The core (RICH) is built as `paris_house` of the gothic style in two levels (full near, the mass far); the outer
// rows and the two houses that can be entered stay the vernacular timber house.
import { RADIUS, RIVER, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -60], facing: 'w' } });
export const RICH = { c: [60, 0], r: 250 };
const rich = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - RICH.c[0], (l.rect[1] + l.rect[3]) / 2 - RICH.c[1]) < RICH.r;
export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS.paris[0], ARRIVALS.paris[2]], 2);
  const core = all.filter((l) => rich(l) && !open.has(l)), rest = all.filter((l) => !core.includes(l));
  plans.push(...lodTiles('paris-houses', 'gothic', core.map((l) => ({ t: 'paris_house', y: RIVER.ground, foot: RIVER.ground, ...l })), { near: 200, R: RADIUS, entrance: { at: [0, -60], facing: 'w' } }));
  for (let i = 0; i < rest.length; i += 160) plans.push(base(`paris-outer-${i / 160}`, rest.slice(i, i + 160).map((l) => ({ t: 'house_timber', y: RIVER.ground, foot: RIVER.ground, ...l, ...(open.has(l) ? { open: true, use: open.get(l) === 'inn' ? 'inn' : 'workshop' } : {}) }))));
  return plans;
}
