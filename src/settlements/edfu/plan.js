// Edfu in the 1st century BC (docs/settlements/edfu.md §2–§4): the Temple of Horus (the full
// building of the previous design, src/buildings/edfu); its mudbrick enclosure wall; the birth
// house; the sacred lake.

import { TEMPLE, ENCLOSURE, MAMMISI, LAKE } from './layout.js';
import edfuPlan from '../../buildings/edfu/plan.js';

const [x0, z0, x1, z1] = ENCLOSURE, gx = 22, E = [];
// the enclosure wall of mudbrick, 10 m high, open at the pylon
for (const r of [[x0, z0, x1, z0 + 4], [x0, z0, x0 + 4, z1], [x1 - 4, z0, x1, z1], [x0, z1 - 4, -gx, z1], [gx, z1 - 4, x1, z1]]) E.push({ t: 'block', rect: r, y0: -0.5, y1: 10, mat: 'mudbrick', batter: [0.4, 0.4, 0.4, 0.4] });
// the birth house: a small temple of pillars
E.push({ t: 'ok_temple', rect: MAMMISI, h: 7, court: [MAMMISI[0] + 6, MAMMISI[1] + 4, MAMMISI[2] - 6, MAMMISI[1] + 14], pillars: 4, door: 'n' });
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
export const temple = { ...edfuPlan, origin: TEMPLE.origin, base: 0, district: undefined, view: [-30, -60, 30, 0] };
export default temple;
