// The Treasury of Atreus as a landmark of its own (docs/settlements/mycenae.md §4.5): the dromos, the doorway, the tholos and the side chamber.
import { TREAS } from './layout.js';

const T = TREAS, y = T.y;
const E = [{ t: 'treasury', x: T.x, z: T.z, y, R: T.R, H: T.H, xf: T.xf, x0: T.x0, front: T.front, dromos: T.dromos, door: T.door, seed: 11 }];
const room = (id, rect, kind, extra = {}) => ({ id, rect, y, kind, ...extra });
const rooms = [
  room('the dromos', [T.x0 + 1, T.z - 2.6, T.xf - 0.5, T.z + 2.6], 'open'),
  room('the doorway', [T.xf + 0.6, T.z - 1.0, T.x - T.R + 0.2, T.z + 1.0], 'hall'),
  room('the tholos', [T.x - 4, T.z - 4, T.x + 4, T.z + 4], 'hall', { sealed: true }),
  room('the side chamber', [T.x - 2, T.z - T.R - 8.5, T.x + 2, T.z - T.R - 4.5], 'inner', { sealed: true }),
];
const walks = [[[T.x0 + 2, T.z], [T.xf - 2, T.z], [T.xf + 2.5, T.z], [T.x - T.R, T.z], [T.x, T.z]]];
walks[0].y0 = y;
export const treasury = {
  id: 'mycenae-treasury',
  name: { en: 'The Treasury of Atreus', zh: '阿特柔斯宝库' },
  era: { en: 'Late Helladic IIIB, c. 1250 BC', zh: '后期希拉迪克IIIB期，约公元前1250年' },
  style: 'mycenaean',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [T.x0 + 2, T.z], facing: 'e' },
  bounds: [T.x0 - 6, T.z - 20, T.x + 10, T.z + 12],
  view: [T.x0, T.z - 8, T.x + 8, T.z + 8],
  bakeTop: 22,
  elements: E,
  rooms,
  walks,
};
export default treasury;
