// The Western Group about 1050 (docs/settlements/khajuraho.md §2–§4): the temples on their
// terraces, Lakshmana's and Vishvanatha's corner shrines, the tank's water.

import { RADIUS, TEMPLES, TANK } from './layout.js';

const E = [];
for (const t of TEMPLES) {
  E.push({ t: 'nagara_temple', ...t });
  if (t.corners) for (const [dx, dz] of [[-t.w * 0.75, -t.w * 0.8], [-t.w * 0.75, t.w * 0.8], [t.len + 1, -t.w * 0.8], [t.len + 1, t.w * 0.8]]) E.push({ t: 'sub_shrine', c: [t.c[0] + dx, t.c[1] + dz], w: 3.2, h: 9, y: t.jagati });
}
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
