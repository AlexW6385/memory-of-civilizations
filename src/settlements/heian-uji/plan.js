// Uji in 1053 (docs/settlements/heian-uji.md §2–§4): the Phoenix Hall with its pond and bridge (the
// full building of the previous design, src/buildings/byodo-in-phoenix-hall); the Uji Bridge; the river.

import { RADIUS, HALL, RIVER, BRIDGE } from './layout.js';
import hallPlan from '../../buildings/byodo-in-phoenix-hall/plan.js';

const rx = RIVER.x + 15 * Math.sin(BRIDGE.z / 110);
export const bridge = {
  id: 'heian-uji-bridge', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [rx - 50, BRIDGE.z], facing: 'e' }, bounds: [rx - RIVER.w / 2 - 10, BRIDGE.z - 4, rx + RIVER.w / 2 + 10, BRIDGE.z + 7], rooms: [],
  // the Uji Bridge of timber on rows of piles, its railings with bronze finials, the san-no-ma
  // projecting upstream (the river flows north; upstream is +z) in the third bay from the west
  elements: [{ t: 'uji_bridge', x0: rx - RIVER.w / 2 - 8, x1: rx + RIVER.w / 2 + 8, z: BRIDGE.z, w: 6, y: 0.2, rise: 1.4, bed: RIVER.bed, bay: 5.4, sannoma: { at: rx - RIVER.w / 2 - 8 + 2.5 * (RIVER.w + 16) / Math.round((RIVER.w + 16) / 5.4), out: 2.4, len: 3.6 } }],
};
export const river = {
  id: 'heian-uji-river', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x - RIVER.w, -(RADIUS - 70), RIVER.x + RIVER.w, RADIUS - 70], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(x - (RIVER.x + 15 * Math.sin(z / 110))) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 70 }],
};
export const hall = { ...hallPlan, origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 9, -10, HALL.origin[0] + 10, 10] };
export default hall;
