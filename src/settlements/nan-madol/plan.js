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
// from the canal the walls must read: the log-cabin corners' columns run well past each other (0.55 m on the outer wall), the faces' headers stand proud by uneven amounts, the crown is skinned in pale coral
for (const e of E) if (e.t === 'crib_wall') Object.assign(e, { jut: e.th > 2 ? 0.55 : 0.4, rough: 0.12, cap: true });
E.push({ t: 'tomb', ...TOMB, seed: 31 });
for (const [x, z, yaw] of SAKAU) E.push({ t: 'sakau', c: [x, z], yaw });
// heaps of coral gravel against the inner court's walls, where the floor is raked
for (const [x, z] of [[-20.5, -30], [-20.5, -46], [0.5, -47]]) E.push({ t: 'pile', c: [x, z], r: 1.0 });

// ── the courts dressed: raked gravel, offerings, seats of laid columns, lamps and tabu markers, ferns on the walls' tops, moss at their feet ──
const sk = (r, m) => [r[0] - m, r[1] - m, r[2] + m, r[3] + m];
E.push({ t: 'court', kind: 'rake', rect: [ox0 + 1.8, oz0 + 1.8, ox1 - 1.8, oz1 - 1.8], step: 1.3,
  skip: [sk(INNER, 1.8), [-12, -18.5, 3.5, -13], [-12, -18.5, -8, -6.5], ...SAKAU.map(([x, z, yw]) => (Math.abs(Math.sin(yw)) > 0.5 ? [x - 3.2, z - 4, x + 3.2, z + 4] : [x - 4, z - 3.2, x + 4, z + 3.2]))] });
E.push({ t: 'court', kind: 'rake', rect: [ix0 + 1.2, iz0 + 1.2, ix1 - 1.2, iz1 - 1.2], step: 1.3,
  skip: [sk(TOMB.rect, 1.6), [TOMB.stair[0] - 1.5, TOMB.stair[1], TOMB.stair[2] + 1.5, TOMB.stair[3] + 0.8], [ix0, -28.6, ix1, -24.2]] });
// the apron between the causeway and the gate: gravel raked in lines up to the way, a seat of columns each side of the gate
E.push({ t: 'court', kind: 'rake', rect: [-38.5, -5.5, 18.5, -2.9], skip: [[-12.4, -6, -7.6, -2.4]], step: 1.3 });
for (const [a, b] of [[[-19.5, -4.2], [-14.2, -4.2]], [[-5.8, -4.2], [-0.5, -4.2]]]) E.push({ t: 'court', kind: 'seat', a, b });
for (const [x, z, yaw, sd] of [[-26, -47, 0.2, 1], [-25.5, -29.5, 0.9, 2], [6, -22.5, 0.1, 3], [10.5, -9.8, 1.3, 4], [-19, -38, 1.57, 5], [-1.6, -38, 1.57, 6], [-10, -50.5, 0, 7], [-1.5, -45, 0.5, 8]]) E.push({ t: 'court', kind: 'offering', c: [x, z], yaw, seed: sd });
for (const [a, b] of [[[-31.6, -64.2], [-13, -64.2]], [[-6.5, -64.2], [11.5, -64.2]], [[12.4, -60], [12.4, -44]], [[-32.2, -60], [-32.2, -45]], [[-32.2, -28], [-32.2, -14]], [[12.4, -36], [12.4, -22]]]) E.push({ t: 'court', kind: 'seat', a, b });
for (const c of [[-13, -5.4], [-7, -5.4], [-1.9, -20.2], [3.5, -20.2], [-26, -63], [9, -63]]) E.push({ t: 'court', kind: 'lamp', c });
E.push({ t: 'court', kind: 'tabu', c: [-5.4, -4.6], yaw: 0 }); E.push({ t: 'court', kind: 'tabu', c: [-16.4, -4.6], yaw: 0 }); E.push({ t: 'court', kind: 'tabu', c: [6.0, -20.4], yaw: 0 });
{ const bx = (TOMB.pit[0] + TOMB.pit[2]) / 2, bz = TOMB.pit[1] + 1.3; E.push({ t: 'court', kind: 'tombgift', c: [bx, bz], seed: 4 }); }
const wallsTop = [[[ox0, oz0], [ox1, oz0], outerTop, [0, -1]], [[ox1, oz0], [ox1, oz1], outerTop, [1, 0]], [[ox0, oz0], [ox0, oz1], outerTop, [-1, 0]], [[ox0, oz1], [OUTER_GATE[0], oz1], (u, L) => 5.8 + 2.3 * (1 - sm(0, 10, u)), [0, 1]], [[OUTER_GATE[1], oz1], [ox1, oz1], (u, L) => 5.8 + 2.3 * (1 - sm(0, 10, L - u)), [0, 1]]];
wallsTop.forEach(([a, b, top, out], i) => { E.push({ t: 'court', kind: 'topdress', a, b, top, seed: 40 + i }); E.push({ t: 'court', kind: 'foot', a, b, out, seed: 50 + i }); });
for (const [a, b, top, i] of [[[ix0, iz0], [ix1, iz0], innerTop, 0], [[ix1, iz0], [ix1, iz1], innerTop, 1], [[ix0, iz0], [ix0, iz1], innerTop, 2]]) E.push({ t: 'court', kind: 'topdress', a, b, top, seed: 70 + i });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('outer court', [ox0 + 2, oz0 + 2, ox1 - 2, oz1 - 2], 0, 'open'),
  room('inner court', [ix0 + 1.5, iz0 + 1.5, ix1 - 1.5, iz1 - 1.5], 0, 'hall'),
  room('crypt', [TOMB.pit[0] + 0.5, TOMB.pit[1] + 0.5, TOMB.pit[2] - 0.5, TOMB.roofZ - 0.2], 0, 'hall'),
  room('tomb top', [TOMB.rect[0] + 1.8, TOMB.rect[1] + 1, TOMB.rect[2] - 1.8, TOMB.rect[1] + 2.4], TOMB.h, 'open'),
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
  view: [ox0, oz0, ox1, 14],   // the walls and the canal before them: Nandauwas stands in the water, so it is seen from the palace islet's crossroads down the causeway's axis
  bakeTop: 12,
  elements: E,
  rooms,
  walks,
};
export default nandauwas;
void ISLET;
