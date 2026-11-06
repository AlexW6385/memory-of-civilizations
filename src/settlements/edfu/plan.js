// Edfu in the 1st century BC (docs/settlements/edfu.md §2–§4): the Temple of Horus (the full
// building of the previous design, src/buildings/edfu); its mudbrick enclosure wall; the birth
// house (mammisi.js); the sacred lake.

import { TEMPLE, ENCLOSURE, MAMMISI, LAKE } from './layout.js';
export { mammisi } from './mammisi.js';
import edfuPlan from '../../buildings/edfu/plan.js';

const [x0, z0, x1, z1] = ENCLOSURE, gx = 22, E = [];
// the enclosure wall of mudbrick, 10 m high, open at the pylon
for (const r of [[x0, z0, x1, z0 + 4], [x0, z0, x0 + 4, z1], [x1 - 4, z0, x1, z1], [x0, z1 - 4, -gx, z1], [gx, z1 - 4, x1, z1]]) E.push({ t: 'block', rect: r, y0: -0.5, y1: 10, mat: 'mudbrick', batter: [0.4, 0.4, 0.4, 0.4] });
export const precinct = {
  id: 'edfu-precinct', style: 'oldkingdom', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 170], facing: 'n' }, bounds: [x0 - 2, z0 - 2, x1 + 2, MAMMISI[3] + 2], rooms: [], elements: E,
};
// the sacred lake's water (and the stone steps down into it)
export const lake = {
  id: 'edfu-lake', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 170], facing: 'n' }, bounds: [LAKE[0] - 2, LAKE[1] - 2, LAKE[2] + 2, LAKE[3] + 2], rooms: [],
  elements: [
    { t: 'water_rect', rect: [LAKE[0] + 2, LAKE[1] + 2, LAKE[2] - 2, LAKE[3] - 2], y: -1.5 },
    ...[[LAKE[0] - 1, LAKE[1] - 1, LAKE[2] + 1, LAKE[1] + 2], [LAKE[0] - 1, LAKE[3] - 2, LAKE[2] + 1, LAKE[3] + 1], [LAKE[0] - 1, LAKE[1] + 2, LAKE[0] + 2, LAKE[3] - 2], [LAKE[2] - 2, LAKE[1] + 2, LAKE[2] + 1, LAKE[3] - 2]]
      .map((rect) => ({ t: 'block', rect, y0: -3, y1: 0.1, mat: 'sandstone', walk: true })),
  ],
};
// the winged disc of Horus Behdety over the great gate drawn to the width of the lintel (§4.1)
const elements = edfuPlan.elements.map((e) => (e.kind === 'winged_disc' && e.w > 8 ? { ...e, w: 11.6, h: 3.4, y: 17.2 } : e));
export const temple = { ...edfuPlan, elements, origin: TEMPLE.origin, base: 0, district: undefined, view: [-30, -60, 30, 0] };
export default temple;
