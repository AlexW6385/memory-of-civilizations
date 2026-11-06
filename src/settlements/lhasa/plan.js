// The Potala in 1694 (docs/settlements/lhasa.md §2–§4): battered blocks in many stepped masses
// climbing Marpo Ri's south face — the great white frontage below with the zigzag stairs on its face,
// the White Palace east and west stepping down to the ends, the Red Palace in the middle rising on its
// white base to about 117 m under its gilded roofs, the yellow banner store beside it, round bastions
// at the ends and walls stepping up the rock; Shöl walled below on three sides with its three gates,
// its inner pillar under the stairs and the outer pillar across the road outside the south gate.

import { SHOL, hill } from './layout.js';

const E = [];
/** The ground under a block's south face (the lowest of its edge), a little below it. */
const foot = (x0, x1, z) => { let m = Infinity; for (let i = 0; i <= 8; i++) m = Math.min(m, hill(x0 + (x1 - x0) * i / 8, z)); return m - 3; };
/** A battered mass of the palace: x from x0 to x1, z from front (south) to back, its roof at top. */
const mass = (x0, x1, front, back, top, o = {}) => {
  const y0 = foot(x0, x1, front);
  E.push({ t: 'dzong', rect: [x0, back, x1, front], y0, y1: top, mat: o.mat || 'limewash_white', windows: o.windows ?? 's', seed: o.seed ?? Math.round(x0 * 7 + top), wy: y0 + 4, pembe: o.pembe ?? (top - y0 > 40 ? 1.8 : 1.3), ...o });
};
// the great white frontage (its middle the blank wall where the giant thangkas were hung)
const STW = [-140, -100], STE = [46, 86];                     // the two zigzag stairs on its face
const KOKU = [[-16.1, -9.1], [-8.9, -3.9]];                   // the great banner's two panels, the larger west
mass(-186, -142, 28, 8, 19); mass(-142, -98, 30, 8, 22, { win: { skip: [[...STW, 23]] } }); mass(-98, -60, 29, 8, 21);
mass(-60, 40, 30, 8, 24, { win: { from: 15, step: 4.2, skip: [[KOKU[0][0], KOKU[1][1], 23]] } });
mass(40, 86, 30, 8, 22, { win: { skip: [[...STE, 23]] } }); mass(86, 132, 29, 8, 21); mass(132, 170, 27, 8, 18);
// the second tier
mass(-196, -150, 4, -26, 34); mass(-150, -104, 7, -26, 41); mass(-104, -60, 5, -26, 46);
mass(-60, 40, 8, -26, 52, { win: { bay: [0.4, 0.6] } });
mass(40, 96, 7, -26, 49); mass(96, 140, 4, -26, 44); mass(140, 176, 1, -26, 37);
// the third tier: the White Palace's west wing, the Red Palace's lower storeys red on the white base, the yellow banner store, the White Palace east
mass(-172, -128, -30, -62, 58); mass(-128, -60, -24, -62, 70, { windows: 'se' });
mass(-56, 26, -22, -62, 66, { mat: 'limewash_red', split: 50, pembe: 2.0, gilt: true, capMat: 'limewash_white' });
mass(26, 44, -30, -84, 86, { mat: 'limewash_yellow', windows: 's', pembe: 1.6 });
mass(44, 100, -24, -62, 86, { windows: 'se' });
// the Deyang Shar, the great eastern court before the White Palace (Richardson), raised on its
// platform at 70 m: galleries along its south side, a long range on the north, the massive
// three-storied building towering over its east end
const DY = 70;
mass(92, 150, -38, -90, DY, { windows: '', pembe: 0, batter: 0.4, mat: 'limewash_white', seed: 31 });
mass(100, 160, -24, -42, DY + 8, { windows: 'sn', win: { from: 50 } });
mass(146, 166, -36, -96, DY + 16, { windows: 'ew', win: { from: DY + 2 }, banners: 'black' });
mass(100, 148, -86, -104, DY + 8, { windows: 's', win: { from: DY + 1.5 } });
// the top tier: the Red Palace rising in two stages with its doubled, gilt-studded frieze; the White Palace east, its quarters' wide windows in the middle
mass(-160, -118, -64, -96, 72, { windows: 'sw', banners: 'black' }); mass(-118, -58, -60, -98, 86, { windows: 'sw', banners: 'black' });
mass(-52, 22, -56, -98, 104, { mat: 'limewash_red', split: 52, pembe: 2.6, gilt: true, windows: 'sew', banners: 'gilt' });
mass(-42, 12, -64, -94, 117, { mat: 'limewash_red', pembe: 2.8, gilt: true, windows: 'sew', banners: 'gilt', bannerS: 1.2 });
mass(44, 98, -60, -98, 100, { windows: 'se', pembe: 2.0, banners: 'black', win: { bay: [0.38, 0.66] } });

// the triple stair from the Deyang Shar up the White Palace's east face, the middle flight the Dalai Lama's
E.push({ t: 'triple_stair', xf: 114, xt: 98.5, zc: -74, y0: DY, y1: DY + 14, w: 2.2, land: 5.5 });
// the great appliqué banner (koku) of the Golden Procession hung down the frontage's blank middle
{
  const y0 = foot(-60, 40, 30), yw = 24 - 1.3 - 0.4, b = (yw - y0) * 0.08;
  E.push({ t: 'koku', panels: KOKU, y0: 1.2, y1: yw - 0.25, z0: 30, fy0: y0, k: b / (yw - y0) });
}
// the gilded roofs over the Red Palace's chapels and tombs
for (const [x, z, w] of [[-28, -82, 8], [-15, -82, 9], [-2, -82, 8], [-32, -72.3, 4.4], [2, -72.3, 4.4]]) E.push({ t: 'golden_roof', rect: [x - w / 2, z - w / 2, x + w / 2, z + w / 2], y: 117 });
// the round bastions at the ends, and the walls stepping up the rock behind them
const TW = [-200, -2], TE = [192, -4];
for (const [[x, z], top] of [[TW, 38], [TE, 40]]) E.push({ t: 'round_tower', c: [x, z], r: 10, y0: Math.min(hill(x, z + 10), hill(x - 10, z), hill(x + 10, z)) - 2, y1: top, from: 0.1, to: Math.PI - 0.1, seed: x });
for (const x of [TW[0], TE[0]]) for (let za = -14; za > -80; za -= 14) {
  const zb = za - 14, y0 = Math.min(hill(x, za), hill(x - 3, za), hill(x + 3, za)) - 1.5;
  E.push({ t: 'dzong', rect: [x - 3, zb, x + 3, za], y0, y1: hill(x, zb) + 5, batter: 0.5, pembe: 0.6, windows: '', seed: 4 });
}
// the zigzag stairs on the frontage, four flights each, the lowest outermost; the top landings onto the frontage roof
E.push({ t: 'zigzag', x0: STW[0], x1: STW[1], zf: 30, w: 4, n: 4, y1: 22.12, land: 6, start: 'e', bridge: 2.6 });
E.push({ t: 'zigzag', x0: STE[0], x1: STE[1], zf: 30, w: 4, n: 4, y1: 22.12, land: 6, start: 'w', bridge: 2.6 });
// Shöl: walled on three sides, the fourth the foot of the hill; its gates south, east and west; corner towers at the south
const [sx0, , sx1, sz1] = SHOL, GZ = 142, GX = -1;
const wall = (a, b) => E.push({ t: 'dzong', rect: [Math.min(a[0], b[0]) - 1.2, Math.min(a[1], b[1]) - 1.2, Math.max(a[0], b[0]) + 1.2, Math.max(a[1], b[1]) + 1.2], y0: -0.5, y1: 6, batter: 0.4, windows: '', pembe: 0.5 });
wall([sx0 + 5, sz1], [GX - 9, sz1]); wall([GX + 9, sz1], [sx1 - 5, sz1]);
wall([sx0, TW[1]], [sx0, GZ - 8]); wall([sx0, GZ + 8], [sx0, sz1 - 5]); wall([sx1, TE[1]], [sx1, GZ - 8]); wall([sx1, GZ + 8], [sx1, sz1 - 5]);
E.push({ t: 'shol_gate', c: [GX, sz1], along: 'x', w: 5, d: 9, len: 18, h: 10, seed: 21 });
E.push({ t: 'shol_gate', c: [sx0, GZ], along: 'z', w: 4.5, d: 8, len: 16, h: 9, seed: 23 });
E.push({ t: 'shol_gate', c: [sx1, GZ], along: 'z', w: 4.5, d: 8, len: 16, h: 9, seed: 25 });
for (const [x, z] of [[sx0, sz1], [sx1, sz1]]) E.push({ t: 'dzong', rect: [x - 5, z - 5, x + 5, z + 5], y0: -0.5, y1: 10, batter: 0.6, windows: 'nesw', pembe: 0.8, win: { step: 3.0, from: 4.5, dense: 0.6 }, seed: x });
// the inner pillar (doring nangma, uninscribed) under the stairs; the outer pillar (doring chima, inscribed, c. 764)
// across the road outside the south gate, with its heap of stones and incense burner beside it
E.push({ t: 'doring', at: [-4, 54], h: 6.5 });
E.push({ t: 'doring', at: [GX, 238], h: 7.5 });
E.push({ t: 'stone_heap', at: [GX - 6, 237], r: 1.2, seed: 5 }); E.push({ t: 'sangkhang', at: [GX - 9.5, 234], rot: 0 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('shol', SHOL, 0, 'open'), room('below the palace', [sx0 + 2, 47, sx1 - 2, 62], 0, 'open'), room('red palace roof', [-36, -88, 6, -70], 117, 'open')];
const walks = [[[-1, 228], [-1, 140], [-1, 58], [-103, 50], [-103, 44], [-137, 44], [-137, 40], [-103, 40], [-103, 36], [-137, 36], [-137, 32], [-103, 32], [-103, 18]]];
walks[0].y0 = 0;

export const potala = {
  id: 'lhasa-potala',
  name: { en: 'The Potala', zh: '布达拉宫' },
  era: { en: 'Tibet, 1694', zh: '西藏，1694年' },
  style: 'tibetan',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-4, 60], facing: 'n' },
  bounds: [-212, -105, 202, 244],
  bakeBounds: [-212, -105, 202, 48],
  view: [-60, 5, 40, 30],
  bakeTop: 125,
  elements: E,
  rooms,
  walks,
};
export default potala;
