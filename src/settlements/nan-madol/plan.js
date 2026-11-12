// Nandauwas, the royal mortuary of Nan Madol, c. 1300 (docs/settlements/nan-madol.md §4): on its islet an outer wall of crib-laid
// basalt columns 50 × 60 m, 5.8 m high and rising at its corners to 8.1 m (the upturned corners), 2.6 m thick; inside it the outer
// court with the sakau stone, and the inner enclosure 26 × 32 m with walls to 4.6 m, entered at its south-east; in the inner court
// the tomb — a platform of columns 2.4 m high with a crypt, roofed in part with columns laid across — reached by stairs.

import { OUTER, OUTER_GATE, INNER, INNER_GATE, TOMB, SAKAU, ISLET } from './layout.js';

const E = [];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** The outer wall's top above its foot: 5.8 m, 8.1 m at the corners, the courses stepping up over the last 10 m. */
const outerTop = (u, L) => 5.8 + 2.3 * (1 - sm(0, 10, Math.min(u, L - u)));
const innerTop = (u, L) => 3.6 + 1.0 * (1 - sm(0, 6, Math.min(u, L - u)));
const [ox0, oz0, ox1, oz1] = OUTER, [ix0, iz0, ix1, iz1] = INNER;
const th = 2.6, ith = 1.6;
// the outer wall: north, east, west whole; the south in two pieces round the gate. Alternate corners' columns project.
E.push({ t: 'crib_wall', a: [ox0, oz0], b: [ox1, oz0], th, top: outerTop, seed: 11, proj: 0 });
E.push({ t: 'crib_wall', a: [ox1, oz0], b: [ox1, oz1], th, top: outerTop, seed: 12, proj: 1 });
E.push({ t: 'crib_wall', a: [ox0, oz0], b: [ox0, oz1], th, top: outerTop, seed: 13, proj: 1 });
E.push({ t: 'crib_wall', a: [ox0, oz1], b: [OUTER_GATE[0], oz1], th, top: (u, L) => 5.8 + 2.3 * (1 - sm(0, 10, u)), seed: 14, proj: 0, ends: [th / 2, 0] });
E.push({ t: 'crib_wall', a: [OUTER_GATE[1], oz1], b: [ox1, oz1], th, top: (u, L) => 5.8 + 2.3 * (1 - sm(0, 10, L - u)), seed: 15, proj: 0, ends: [0, th / 2] });
// the inner enclosure
E.push({ t: 'crib_wall', a: [ix0, iz0], b: [ix1, iz0], th: ith, top: innerTop, seed: 21, proj: 0 });
E.push({ t: 'crib_wall', a: [ix1, iz0], b: [ix1, iz1], th: ith, top: innerTop, seed: 22, proj: 1 });
E.push({ t: 'crib_wall', a: [ix0, iz0], b: [ix0, iz1], th: ith, top: innerTop, seed: 23, proj: 1 });
E.push({ t: 'crib_wall', a: [ix0, iz1], b: [INNER_GATE[0], iz1], th: ith, top: (u, L) => 3.6 + 1.0 * (1 - sm(0, 6, u)), seed: 24, proj: 0, ends: [ith / 2, 0] });
E.push({ t: 'crib_wall', a: [INNER_GATE[1], iz1], b: [ix1, iz1], th: ith, top: (u, L) => 3.6 + 1.0 * (1 - sm(0, 6, L - u)), seed: 25, proj: 0, ends: [0, ith / 2] });
E.push({ t: 'tomb', ...TOMB, seed: 31 });
for (const [x, z, yaw] of SAKAU) E.push({ t: 'sakau', c: [x, z], yaw });
// heaps of coral gravel against the inner court's walls, where the floor is raked
for (const [x, z] of [[-20.5, -30], [-20.5, -46], [0.5, -47]]) E.push({ t: 'pile', c: [x, z], r: 1.0 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('outer court', [ox0 + 2, oz0 + 2, ox1 - 2, oz1 - 2], 0, 'open'),
  room('inner court', [ix0 + 1.5, iz0 + 1.5, ix1 - 1.5, iz1 - 1.5], 0, 'hall'),
  room('crypt', [TOMB.pit[0] + 0.5, TOMB.pit[1] + 0.5, TOMB.pit[2] - 0.5, TOMB.roofZ - 0.2], 0, 'hall'),
  room('tomb top', [TOMB.rect[0] + 1.8, TOMB.rect[1] + 1, TOMB.rect[2] - 1.8, TOMB.rect[1] + 2.4], TOMB.h, 'hall'),
];
// from the landing's causeway, over the canal, in through the south gate, round into the inner court and to the crypt's stair
const walks = [[[-10, 80], [-10, 56], [-10, 8], [-10, -2], [-10, -9], [-10, -16], [1, -16], [1, -22], [1, -27], [-10, -26.6]]];
walks[0].y0 = 0;

export const nandauwas = {
  id: 'nandauwas',
  name: { en: 'Nandauwas', zh: '南达瓦斯' },
  era: { en: 'Saudeleur, c. 1300', zh: '绍德勒，约1300年' },
  style: 'nanmadol',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-10, 80], facing: 'n' },
  bounds: [-48, -80, 28, 12],
  bakeBounds: [-48, -80, 28, 12],
  view: [ox0, oz0, ox1, 40],   // the walls and the lagoon before them to the causeway's head: Nandauwas stands in the water, so it is seen from the landing
  bakeTop: 12,
  elements: E,
  rooms,
  walks,
};
export default nandauwas;
void ISLET;
