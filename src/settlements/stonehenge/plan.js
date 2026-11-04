// Stonehenge about 2500 BC (docs/settlements/stonehenge.md §2–§4).
import { height } from './layout.js';
const E = [{ t: 'henge', c: [0, 0], y: height(0, 0) }];
export const henge = {
  id: 'stonehenge-henge',
  name: { en: 'Stonehenge', zh: '巨石阵' },
  era: { en: 'Neolithic Britain, about 2500 BC', zh: '新石器时代不列颠，约公元前2500年' },
  style: 'neolithic',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [40, -40], facing: 'w' },
  bounds: [-60, -60, 60, 60],
  view: [-19, -19, 19, 19],
  bakeTop: 10,
  elements: E,
  rooms: [{ id: 'circle', rect: [-14, -14, 14, 14], y: height(0, 0), kind: 'open' }],
  walks: [Object.assign([[40, -40], [18, -18], [0, 0]], { y0: height(40, -40) })],
};
export default henge;
