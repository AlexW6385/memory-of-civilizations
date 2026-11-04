// Mississippian Cahokia about 1175 (docs/settlements/cahokia.md §2–§4).
import { RADIUS, SUMMIT, PLAZA, PALISADE, WOODHENGE, MOUNDS, FOX, height } from './layout.js';

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
export const monks = {
  id: 'cahokia-monks',
  name: { en: 'Monks Mound and the Grand Plaza', zh: '僧侣丘与大广场' },
  era: { en: 'Cahokia, about 1175', zh: '卡霍基亚，约1175年' },
  style: 'mississippian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-25, -5], facing: 'n' },
  bounds: [-90, -270, 90, PLAZA[3]],
  view: [-82, -240, 82, -50],
  bakeTop: 60,
  elements: [
    { t: 'great_house', rect: [SUMMIT[0], SUMMIT[1] + 20, SUMMIT[2], SUMMIT[1] + 40], y: height(...mid(SUMMIT)), h: 4.5, rise: 11 },
    { t: 'great_house', rect: [-14, -100, 6, -86], y: height(-4, -93), h: 3.5, rise: 7 },
    { t: 'plaza_pole', c: [0, 55], y: 0, h: 14 },
  ],
  rooms: [{ id: 'plaza', rect: PLAZA, y: 0, kind: 'open' }],
  walks: [Object.assign([[-25, -5], [-25, -36]], { y0: 0 })],
};
export const precinct = {
  id: 'cahokia-precinct', style: 'mississippian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [-25, -5], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'palisade', rect: PALISADE, y: height, every: 26, gates: [[2, 0.5], [3, 0.45], [1, 0.55]] },
    { t: 'woodhenge', c: WOODHENGE.c, r: WOODHENGE.r, n: 48, y: height(...WOODHENGE.c) },
    { t: 'great_house', rect: [FOX[0] + 14, FOX[1] + 14, FOX[2] - 14, FOX[3] - 14], y: height(...mid(FOX)), h: 3, rise: 6 },
    ...MOUNDS.map(([x, z, s, h]) => ({ t: 'great_house', rect: [x - s * 0.4, z - s * 0.3, x + s * 0.4, z + s * 0.3], y: height(x, z), h: 3, rise: 5 })),
  ],
};
export default monks;
