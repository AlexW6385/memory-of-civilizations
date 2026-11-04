// Uji in 1053 (docs/settlements/heian-uji.md §2–§4): the Phoenix Hall with its pond and bridge (the
// full building of the previous design, src/buildings/byodo-in-phoenix-hall); the Uji Bridge; the river.

import { RADIUS, HALL, RIVER, BRIDGE } from './layout.js';
import hallPlan from '../../buildings/byodo-in-phoenix-hall/plan.js';

const rx = RIVER.x + 15 * Math.sin(BRIDGE.z / 110);
export const bridge = {
  id: 'heian-uji-bridge', style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [rx - 50, BRIDGE.z], facing: 'e' }, bounds: [rx - RIVER.w / 2 - 10, BRIDGE.z - 4, rx + RIVER.w / 2 + 10, BRIDGE.z + 4], rooms: [],
  elements: [{ t: 'bridge_stone', rect: [rx - RIVER.w / 2 - 8, BRIDGE.z - 3, rx + RIVER.w / 2 + 8, BRIDGE.z + 3], y: 0.4, bed: RIVER.bed, ramps: [] }],
};
export const river = {
  id: 'heian-uji-river', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x - RIVER.w, -(RADIUS - 70), RIVER.x + RIVER.w, RADIUS - 70], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(x - (RIVER.x + 15 * Math.sin(z / 110))) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 70 }],
};
export const hall = { ...hallPlan, origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 9, -10, HALL.origin[0] + 10, 10] };
export default hall;
