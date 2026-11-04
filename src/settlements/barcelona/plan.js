// Barcelona about 1910 (docs/settlements/barcelona.md §2–§4).
import { SAGRADA, GRACIA_X, PITCH, BLOCK } from './layout.js';

export const sagrada = {
  id: 'barcelona-sagrada',
  name: { en: 'The Sagrada Família and the Eixample', zh: '圣家堂与扩展区' },
  era: { en: 'Barcelona, about 1910', zh: '巴塞罗那，约1910年' },
  style: 'modernisme',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [SAGRADA[0] + 58, SAGRADA[1]], facing: 'w' },
  bounds: [GRACIA_X - BLOCK / 2 - 2, SAGRADA[1] - 48, SAGRADA[0] + 40, PITCH + BLOCK / 2 + 2],
  view: [SAGRADA[0] - 24, SAGRADA[1] - 46, SAGRADA[0] + 32, SAGRADA[1] + 46],
  bakeTop: 110,
  elements: [
    { t: 'sagrada', c: SAGRADA },
    { t: 'pedrera', rect: [GRACIA_X - BLOCK / 2, PITCH - BLOCK / 2, GRACIA_X - BLOCK / 2 + 34, PITCH - BLOCK / 2 + 26], h: 22 },
    { t: 'batllo', rect: [GRACIA_X + BLOCK / 2 - 15, -BLOCK / 2, GRACIA_X + BLOCK / 2, -BLOCK / 2 + 18], h: 21 },
  ],
  rooms: [{ id: 'nativity', rect: [SAGRADA[0] + 30, SAGRADA[1] - 26, SAGRADA[0] + 50, SAGRADA[1] + 26], y: 0, kind: 'open' }],
  walks: [Object.assign([[SAGRADA[0] + 58, SAGRADA[1]], [SAGRADA[0] + 36, SAGRADA[1]]], { y0: 0 })],
};
export default sagrada;
