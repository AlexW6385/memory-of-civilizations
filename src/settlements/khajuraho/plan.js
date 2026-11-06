// The Western Group about 1050 (docs/settlements/khajuraho.md §2–§4): the temples on their
// terraces, Lakshmana's and Vishvanatha's corner shrines, the tank's water.

import { RADIUS, TEMPLES, TANK, VARAHA } from './layout.js';

const E = [];
for (const t of TEMPLES) {
  E.push({ t: 'nagara_temple', ...t });
  // the corner shrines, each a little temple with its porch: the two at the back face east, the two
  // at the front face each other across the way to the stair (hindutemples-india)
  if (t.corners) {
    const [x0, z0, x1, z1] = t.terrace, m = 3.4;
    for (const [x, z, face] of [[x0 + m, z0 + m, 'e'], [x0 + m, z1 - m, 'e'], [x1 - m - 1.5, z0 + m, 's'], [x1 - m - 1.5, z1 - m, 'n']]) E.push({ t: 'sub_shrine', c: [x, z], w: 3.2, h: 9, y: t.jagati, face });
  }
}
E.push({ t: 'varaha_mandapa', rect: VARAHA, plinth: 2.6, h: 3.6 });
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const K = TEMPLES[0];
export const temples = {
  id: 'khajuraho-temples',
  name: { en: 'The Western Group of Khajuraho', zh: '卡久拉霍西部神庙群' },
  era: { en: 'Chandela India, about 1050', zh: '金德拉王朝，约1050年' },
  style: 'nagara',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [K.c[0] + K.len + 30, K.c[1]], facing: 'w' },
  bounds: [-100, -120, 80, 50],
  view: [K.c[0] - K.w, K.c[1] - K.w, K.c[0] + K.len + 6, K.c[1] + K.w],
  bakeTop: 36,
  elements: E,
  rooms: [room('kandariya terrace', [K.c[0] - K.w * 0.85, K.c[1] - K.w * 0.95, K.c[0] + K.len + 4, K.c[1] + K.w * 0.95], K.jagati, 'open')],
  walks: Object.assign([[[K.c[0] + K.len + 30, K.c[1]], [K.c[0] + K.len + 15, K.c[1]]]], {}),
};
temples.walks[0].y0 = 0;
export const tank = {
  id: 'khajuraho-tank', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [TANK.c[0] - TANK.r[0], TANK.c[1] - TANK.r[1], TANK.c[0] + TANK.r[0], TANK.c[1] + TANK.r[1]], y: TANK.level, cell: 1.5, inside: (x, z) => Math.hypot((x - TANK.c[0]) / TANK.r[0], (z - TANK.c[1]) / TANK.r[1]) < 0.985 }],
};
export default temples;
