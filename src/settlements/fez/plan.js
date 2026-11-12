// The Bou Inania madrasa and the Dar al-Magana (docs/settlements/fez.md §4): the court, the galleries, the hall, the classrooms, the cells above.
import { SITES, siteY, ground0 } from './layout.js';

const b = SITES.bou, y = siteY('bou'), cx = (b[0] + b[2]) / 2;
const E = [];
E.push({ t: 'bou_inania', rect: b, y, yLane: ground0(cx, b[1] - 3), seed: 5 });
E.push({ t: 'fez_darmagana', rect: SITES.daMagana, y: siteY('daMagana') });
E.push({ t: 'fez_sabat', rect: [-141, b[1] - 4, -137, b[1]], y: ground0(-139, b[1] - 2), clear: 4.4 });
const room = (id, rect, yy, kind) => ({ id, rect, y: yy, kind });
const zN = b[1] + 8, cz0 = zN + 2.4, cz1 = b[3] - 9.6 - 0.7;
const yu = y + 4.4, gx0 = b[0] + 6.4, gx1 = b[2] - 6.4, STX = 6.6, zb = b[1] + 1.0, ze = zN - 0.5;
export const bouInania = {
  id: 'fez-bou-inania',
  name: { en: 'Bou Inania Madrasa', zh: '布·伊纳尼亚经学院' },
  era: { en: 'Marinid Fez, about 1350', zh: '马林王朝非斯，约1350年' },
  style: 'marinid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [cx, b[1] - 2], facing: 's' },
  bounds: [b[0] - 30, b[1] - 20, b[2] + 6, b[3] + 6],
  view: [b[0], b[1], b[2], b[3]],
  viewY: y,
  bakeBounds: b,
  bakeTop: 26,
  elements: E,
  rooms: [
    room('court', [b[0] + 8.8, cz0, b[2] - 8.8, cz1], y, 'open'),
    room('galleries', [b[0] + 6.4, zN, b[2] - 6.4, cz1], y, 'open'),
    room('vestibule', [cx - 1.7, b[1], cx + 1.7, zN], y, 'hall'),
    room('upper gallery', [gx0 + STX + 0.4, zN + 0.3, gx1 - STX - 0.4, cz0 - 0.3], yu, 'hall'),
    room('cell north', [gx0 + 9.7, zb + 0.5, gx0 + 12.7, ze - 0.5], yu, 'hall'),
    room('cell west', [b[0] + 1.6, zN + 7.3, gx0 - 1.2, zN + 9.7], yu, 'hall'),
    room('cell east', [gx1 + 1.2, zN + 7.3, b[2] - 1.6, zN + 9.7], yu, 'hall'),
    room('prayer hall', [b[0] + 6.4, cz1 + 0.7, b[2] - 6.4, b[3] - 1], y, 'hall'),
  ],
  walks: [Object.assign([[cx, b[1] - 3], [cx, zN + 1], [cx, cz0 + 8]], { y0: y })],
};
export default bouInania;
