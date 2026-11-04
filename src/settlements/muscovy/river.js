// The Moskva (docs/settlements/muscovy.md §6).
import { RADIUS, RIVER, riverZ } from './layout.js';
export const river = {
  id: 'muscovy-moskva', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-(RADIUS - 50), RIVER.z - 70, RADIUS - 50, RIVER.z + 70], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(z - riverZ(x)) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 50 }],
};
