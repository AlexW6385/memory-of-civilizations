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
// the winged disc of Horus Behdety over the great gate spanning the lintel between its corner rolls, just over the
// doorway; above it the lintel's registers of offering scenes, and the scenes stacked up the jambs (§4.1)
const elements = edfuPlan.elements.map((e) => (e.kind === 'winged_disc' && e.w > 8 ? { ...e, w: 12.1, h: 3.5, y: 16.0 } : e.kind === 'naos' ? { ...e, mat: 'granite_black' } : e));
// the painted ceilings of the two hypostyle halls between their architraves (§4.4)
{
  const side = (xs, z0, z1) => xs.flatMap(([a, b]) => [[a, z0, b, z1, 'sky'], [-b, z0, -a, z1, 'sky']]);
  elements.push({ t: 'obj', kind: 'astro_ceiling', at: [0, -66], y: 14.25, bays: [[-2.6, -73, 2.6, -58.8, 'vultures'], ...side([[4.2, 8.2], [9.8, 13.8], [15.4, 17.5]], -73, -58.8)] });
  elements.push({ t: 'obj', kind: 'astro_ceiling', at: [0, -81], y: 11.5, bays: [[-2.25, -87.5, 2.25, -75.5, 'vultures'], ...side([[3.55, 6.65], [7.95, 10.3]], -87.5, -75.5)], holes: [[-1.6, -80.3, 1.6, -79.6], [-1.6, -83.4, 1.6, -82.7]] });
}
for (const [z, face] of [[-0.4, 'zp'], [-11.6, 'zn']]) elements.push({ t: 'obj', kind: 'gate_reliefs', at: [0, z], z, face, y: 0, x0: -6.1, x1: 6.1, door: [-3, 3], doorTop: 14, from: 18.0, top: 23.85 });
export const temple = { ...edfuPlan, elements, origin: TEMPLE.origin, base: 0, district: undefined, view: [-30, -60, 30, 0] };
export default temple;
