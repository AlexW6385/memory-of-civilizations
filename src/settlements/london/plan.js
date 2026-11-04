// Westminster about 1870 (docs/settlements/london.md §2–§4).
import { RADIUS, GROUND, PALACE, CLOCK, VICTORIA, ABBEY, BRIDGE, RIVER } from './layout.js';

const g = GROUND;
export const westminster = {
  id: 'london-westminster',
  name: { en: 'The Palace of Westminster', zh: '威斯敏斯特宫' },
  era: { en: 'Victorian London, about 1870', zh: '维多利亚时代伦敦，约1870年' },
  style: 'victorian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -180], facing: 'e' },
  bounds: [ABBEY[0] - 2, -200, PALACE[2] + 2, VICTORIA[1] + 14],
  view: [PALACE[0], -170, PALACE[2] + 4, -100],
  bakeTop: 100,
  elements: [
    { t: 'river_front', rect: [PALACE[2] - 24, PALACE[1], PALACE[2], PALACE[3]], h: 22, face: 'e', y: g },
    { t: 'river_front', rect: [PALACE[0], PALACE[1] + 20, PALACE[0] + 26, PALACE[3] - 10], h: 20, face: 'w', y: g },
    { t: 'river_front', rect: [PALACE[0] + 26, -20, PALACE[2] - 24, 10], h: 20, face: 'n', y: g },
    { t: 'great_hall', rect: [PALACE[0] - 30, -125, PALACE[0] - 6, -52], h: 28, y: g },
    { t: 'gothic_tower', c: CLOCK, s: 12, h: 96, clock: true, y: g },
    { t: 'gothic_tower', c: VICTORIA, s: 22, h: 98, y: g },
    { t: 'gothic_tower', c: [76, -5], s: 10, h: 91, spire: true, y: g + 20 },
    { t: 'cathedral', rect: ABBEY, nave: 31, towers: 69, y: g },
  ],
  rooms: [{ id: 'parliament square', rect: [-60, -215, 40, -150], y: g, kind: 'open' }],
  walks: [Object.assign([[0, -180], [60, -170]], { y0: g })],
};
export const bridge = {
  id: 'london-bridge', style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [RIVER.x0, BRIDGE.z], facing: 'e' }, bounds: [RIVER.x0 - 12, BRIDGE.z - BRIDGE.w / 2 - 2, RIVER.x1 + 12, BRIDGE.z + BRIDGE.w / 2 + 2], rooms: [],
  elements: [{ t: 'bridge_stone', rect: [RIVER.x0 - 10, BRIDGE.z - BRIDGE.w / 2, RIVER.x1 + 12, BRIDGE.z + BRIDGE.w / 2], y: GROUND + 0.4, bed: RIVER.bed, ramps: [] }],
};
export const river = {
  id: 'london-thames', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x0 - 10, -(RADIUS - 60), RIVER.x1 + 12, RADIUS - 60], y: RIVER.level, cell: 2, inside: (x, z) => x > RIVER.x0 + 6 * Math.sin(z / 90) + 1 && x < RIVER.x1 + 8 * Math.sin(z / 110) - 1 && Math.hypot(x, z) < RADIUS - 60 }],
};
export default westminster;
