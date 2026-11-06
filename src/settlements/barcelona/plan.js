// Barcelona about 1910 (docs/settlements/barcelona.md §2–§4).
import { SAGRADA, GRACIA_X, PITCH, BLOCK, PEDRERA, BATLLO, height } from './layout.js';

export const sagrada = {
  id: 'barcelona-sagrada',
  name: { en: 'The Sagrada Família and the Eixample', zh: '圣家堂与扩展区' },
  era: { en: 'Barcelona, about 1910', zh: '巴塞罗那，约1910年' },
  style: 'modernisme',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [SAGRADA[0] + 50, SAGRADA[1]], facing: 'w' },
  bounds: [GRACIA_X - BLOCK / 2 - 2, SAGRADA[1] - 48, SAGRADA[0] + 40, PITCH + BLOCK / 2 + 2],
  view: [SAGRADA[0] - 24, SAGRADA[1] - 46, SAGRADA[0] + 32, SAGRADA[1] + 46],
  bakeTop: 110,
  elements: [
    { t: 'sagrada', c: SAGRADA, y: height(...SAGRADA) },
    { t: 'pedrera', c: PEDRERA, y: height(PEDRERA[0] - 26, PEDRERA[1] - 26) },
    { t: 'batllo', a: BATLLO.a, b: BATLLO.b, y: height(...BATLLO.a), d: 18, h: 24 },
  ],
  rooms: [{ id: 'nativity', rect: [SAGRADA[0] + 30, SAGRADA[1] - 26, SAGRADA[0] + 50, SAGRADA[1] + 26], y: height(SAGRADA[0] + 40, SAGRADA[1]), kind: 'open' }],
  walks: [Object.assign([[SAGRADA[0] + 50, SAGRADA[1]], [SAGRADA[0] + 36, SAGRADA[1]]], { y0: height(SAGRADA[0] + 50, SAGRADA[1]) })],
};
export default sagrada;
