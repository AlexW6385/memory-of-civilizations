// Paris in 1248 (docs/settlements/paris.md §2–§4): the Sainte-Chapelle (the full building of the
// previous design, src/buildings/sainte-chapelle) in the palace court; the palace's great hall and
// towers; Notre-Dame and its parvis; the bridges; the river.

import { RADIUS, CHAPEL, CATHEDRAL, PALACE, BRIDGES, NORTH_ARM, SOUTH_ARM, ISLAND, RIVER } from './layout.js';
import chapelPlan from '../../buildings/sainte-chapelle/plan.js';

const g = RIVER.ground;
export const city = {
  id: 'paris-cite', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -60], facing: 'w' }, bounds: [PALACE[0] - 2, PALACE[1] - 2, CATHEDRAL[2] + 22, PALACE[3] + 2], rooms: [],
  elements: [
    { t: 'cathedral', rect: CATHEDRAL, nave: 33, towers: 69, y: g },
    { t: 'great_hall', rect: [-290, -88, -230, -58], h: 16, y: g },
    { t: 'great_hall', rect: [-150, -60, -118, 40], h: 12, y: g },
    { t: 'tower', at: [-300, -85], r: 5, h: 22, roof: 10, y: g }, { t: 'tower', at: [-260, -92], r: 6, h: 24, roof: 11, y: g }, { t: 'tower', at: [-215, -92], r: 6, h: 24, roof: 11, y: g },
    { t: 'tower', at: [-120, -88], r: 5, h: 26, roof: 12, y: g },
  ],
};
// the bridges, their decks running across the arms (plans turned a quarter so the deck runs north–south)
export const bridges = BRIDGES.map((b, i) => ({
  id: `paris-bridge-${i}`, style: 'vernacular', origin: [b.x, (b.arm[1] + b.arm[3]) / 2], base: 0, yaw: 90, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-38, -6, 38, 6], rooms: [],
  elements: [{ t: 'bridge_stone', rect: [-(b.arm[3] - b.arm[1]) / 2 - 4, -5, (b.arm[3] - b.arm[1]) / 2 + 4, 5], y: g + 0.4, bed: RIVER.bed, ramps: [] }],
}));
// the Seine's two arms
export const river = {
  id: 'paris-seine', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, -60], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [NORTH_ARM, SOUTH_ARM].map((a) => ({ t: 'water_rect', rect: [-(RADIUS - 72), a[1] + 2, RADIUS - 72, a[3] - 2], y: RIVER.level })),
};
void ISLAND;
export const chapel = { ...chapelPlan, origin: CHAPEL.origin, base: g, district: undefined, view: [CHAPEL.origin[0] - 20, CHAPEL.origin[1] - 12, CHAPEL.origin[0] + 38, CHAPEL.origin[1] + 12] };
export default chapel;
