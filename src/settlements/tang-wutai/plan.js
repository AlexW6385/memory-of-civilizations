// Foguang Monastery in 857 (docs/settlements/tang-wutai.md §2–§4): the Great East Hall with its
// terraces and courtyard (the full building of the previous design, src/buildings/foguang-east-hall)
// and the founding master's brick pagoda.

import { HALL, PAGODA, height } from './layout.js';
import hallPlan from '../../buildings/foguang-east-hall/plan.js';

export const pagoda = {
  id: 'tang-wutai-pagoda', style: 'song', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [PAGODA[0] - 10, PAGODA[1]], facing: 'e' }, bounds: [PAGODA[0] - 6, PAGODA[1] - 6, PAGODA[0] + 6, PAGODA[1] + 6], rooms: [],
  elements: [{ t: 'pagoda_oct', c: PAGODA, y: height(...PAGODA) - 0.4, base: { r: 3.2, h: 1.0 }, tiers: [{ r: 2.4, h: 4.2 }, { r: 2.0, h: 2.6 }], galleries: false, core: 'plaster_white', eave: 'brick_grey', frame: 'brick_grey', spire: 1.8 }],
};
export const hall = { ...hallPlan, origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 14, -20, HALL.origin[0] + 11, 20], viewY: 13 };
export default hall;
