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
// the painted reliefs of the inner walls (§10): the sanctuary's side walls (the gods gilded), the hall of offerings,
// the hall of appearances, the pronaos's side walls; the offering tables in the hall of offerings and before the naos
{
  const W = (a, b, n, y, v0, top, reg, gaps = [], gods = 'paint') => elements.push({ t: 'obj', kind: 'wall_reliefs', at: a, a, b, n, y, v0, top, reg, gaps, gods, inward: 1 });
  W([-2.7, -104.5], [-2.7, -115.6], [1, 0], 1.85, 1.2, 6.5, 1.75, [], 'gold');
  W([2.7, -104.5], [2.7, -115.6], [-1, 0], 1.85, 1.2, 6.5, 1.75, [], 'gold');
  W([-10.3, -88.9], [-10.3, -95.9], [1, 0], 1.35, 1.3, 7.4, 2.0, [[0.15, 1.35]]);
  W([10.3, -88.9], [10.3, -95.9], [-1, 0], 1.35, 1.3, 7.4, 2.0, [[0.15, 1.35]]);
  W([-10.3, -75.5], [-10.3, -87.5], [1, 0], 0.9, 1.3, 9.0, 2.4, [[1.95, 3.55], [8.45, 10.05]]);
  W([10.3, -75.5], [10.3, -87.5], [-1, 0], 0.9, 1.3, 9.0, 2.4, [[1.95, 3.55], [8.45, 10.05]]);
  W([-17.5, -63], [-17.5, -74.5], [1, 0], 0.45, 1.5, 12.0, 2.6);
  W([17.5, -63], [17.5, -74.5], [-1, 0], 0.45, 1.5, 12.0, 2.6);
  elements.push({ t: 'obj', kind: 'offering_table', at: [0, -92.6], y: 1.35 });
  elements.push({ t: 'obj', kind: 'offering_table', at: [0, -113.0], y: 1.85 });
}
export const temple = { ...edfuPlan, elements, origin: TEMPLE.origin, base: 0, district: undefined, view: [-30, -60, 30, 0] };
export default temple;

// the priests of the daily rite (§10): shaven, in linen, censing before the naos, at the table of the hall of
// offerings, walking in the halls and the court (temple plan coordinates, origin as the temple's)
const priest = (at, rot, o = {}) => ({ t: 'figure', at, y: 0, rot, seed: Math.round(at[0] * 97 + at[1] * 13) >>> 0, dress: 'wrap', top: 'bare', cloth: 'linen', cloth2: 'linen', skin: 'skin_medium', hat: 'none', hair: 'shaven', feet: 'shod', over: 'none', carry: 'none', pose: 'stand', ...o });
export const priests = {
  id: 'edfu-priests', style: 'life', origin: TEMPLE.origin, base: 0, yaw: 0, feature: true, rooms: [],
  entrance: { at: [0, 110], facing: 'n' }, bounds: [-44, -139, 44, 31],
  elements: [
    priest([-1.25, -112.8], 0, { y: 1.85, pose: 'pray' }),
    priest([1.1, -92.0], Math.PI / 2, { y: 1.35, over: 'sash' }),
    priest([-2.6, -93.4], -Math.PI / 2, { y: 1.35, pose: 'pray' }),
    priest([-1.4, -81.0], 0.1, { y: 0.9 }), priest([1.5, -68.0], Math.PI, { y: 0.45, over: 'sash' }),
    priest([-5, -38], 0.3), priest([6, -30], -2.6, { carry: 'basket' }), priest([3.5, -44], 3.0),
  ],
};
