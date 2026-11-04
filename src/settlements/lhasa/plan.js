// The Potala in 1694 (docs/settlements/lhasa.md §2–§4): battered blocks climbing Marpo Ri's south
// face — the lower white frontage, the White Palace east and west, the Red Palace in the middle
// rising to about 117 m with its gilded roofs, the yellow building of the Deyang Shar, the round
// towers at the ends; stairs up the front; Shöl's wall and gate at the foot.

import { SHOL, hill } from './layout.js';

const E = [];
const block = (rect, top, mat = 'limewash_white', windows = 's', seed = 1) => {
  const y0 = Math.min(hill(rect[0], rect[3]), hill(rect[2], rect[3]), hill((rect[0] + rect[2]) / 2, rect[3])) - 3;
  E.push({ t: 'dzong', rect, y0, y1: top, batter: (top - y0) * 0.05, mat, windows, seed, wy: y0 + 4 });
};
// the lower frontage and the terraces above it
block([-185, 5, -60, 30], 22, 'limewash_white', 's', 1); block([-60, 5, 40, 30], 24, 'limewash_white', 's', 2); block([40, 5, 170, 30], 22, 'limewash_white', 's', 3);
block([-190, -25, -60, 5], 44, 'limewash_white', 'se', 4); block([-60, -25, 40, 5], 50, 'limewash_white', 's', 5); block([40, -25, 175, 5], 46, 'limewash_white', 'sw', 6);
block([-170, -62, -60, -25], 70, 'limewash_white', 's', 7); block([30, -62, 150, -25], 92, 'limewash_white', 'se', 8); block([-55, -62, 30, -25], 98, 'limewash_red', 'se', 9);
block([-160, -100, -60, -62], 80, 'limewash_white', 'sw', 10); block([40, -98, 135, -62], 100, 'limewash_white', 'sew', 11); block([-48, -98, 24, -62], 117, 'limewash_red', 'sew', 12);
block([24, -84, 40, -62], 99, 'limewash_yellow', 's', 13);
// the round towers of the sun (east) and the moon (west)
block([170, -18, 192, 4], 38, 'limewash_white', 'sew', 14); block([-206, -14, -184, 8], 36, 'limewash_white', 'sew', 15);
// the gilded roofs on the Red Palace
for (const [x, z, w] of [[-30, -88, 10], [-12, -86, 12], [8, -88, 9], [-38, -70, 7], [14, -70, 7]]) E.push({ t: 'golden_roof', rect: [x - w / 2, z - w / 2, x + w / 2, z + w / 2], y: 117 });
for (const x of [-60, -10, 40, 90, 140]) E.push({ t: 'banner_pole', c: [x, -96], y: x > -48 && x < 24 ? 117 : 100, h: 5 });
// the stairs up the front, flight by flight, landings between
E.push({ t: 'stairs', rect: [-20, 30, 40, 36], y0: 0, y1: 11, dir: 'e', mat: 'limewash_white' });
E.push({ t: 'block', walk: true, rect: [40, 30, 52, 36], y0: 0, y1: 11, mat: 'limewash_white' });
E.push({ t: 'stairs', rect: [52, 30, 112, 36], y0: 11, y1: 22, dir: 'e', mat: 'limewash_white' });
E.push({ t: 'block', walk: true, rect: [112, 30, 124, 36], y0: 0, y1: 22, mat: 'limewash_white' });
// Shöl's wall with its corner towers and south gate
const [sx0, sz0, sx1, sz1] = SHOL, w = (a, b) => E.push({ t: 'dzong', rect: [Math.min(a[0], b[0]) - 1.2, Math.min(a[1], b[1]) - 1.2, Math.max(a[0], b[0]) + 1.2, Math.max(a[1], b[1]) + 1.2], y0: -0.5, y1: 5, batter: 0.4, windows: '', pembe: 0.5 });
w([sx0, sz1], [-12, sz1]); w([4, sz1], [sx1, sz1]); w([sx0, sz0 + 4], [sx0, sz1]); w([sx1, sz0 + 4], [sx1, sz1]);
for (const [x, z] of [[sx0, sz1], [sx1, sz1], [sx0, sz0 + 4], [sx1, sz0 + 4]]) E.push({ t: 'dzong', rect: [x - 5, z - 5, x + 5, z + 5], y0: -0.5, y1: 9, batter: 0.6, windows: 'nesw', pembe: 0.8 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('shol', SHOL, 0, 'open'), room('red palace roof', [-48, -98, 24, -62], 117, 'open')];
const walks = [[[-4, 240], [-4, 140], [-4, 50], [-20, 33]]];
walks[0].y0 = 0;

export const potala = {
  id: 'lhasa-potala',
  name: { en: 'The Potala', zh: '布达拉宫' },
  era: { en: 'Tibet, 1694', zh: '西藏，1694年' },
  style: 'tibetan',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-4, 60], facing: 'n' },
  bounds: [-210, -105, 195, 212],
  bakeBounds: [-210, -105, 195, 40],
  view: [-60, 5, 40, 30],
  bakeTop: 125,
  elements: E,
  rooms,
  walks,
};
export default potala;
