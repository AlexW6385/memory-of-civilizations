// The Great Mosque of Djenné and its square (docs/settlements/djenne.md §4): the mosque on its
// platform, its qibla wall with the three towers on the east facing the market.

import { MOSQUE } from './layout.js';

const E = [];
E.push({ t: 'lane', rect: [-58, -58, 58, 58], y: 0.03, mat: 'banco_smooth' });
E.push({ t: 'great_mosque', c: MOSQUE.c, a: MOSQUE.a, py: MOSQUE.py });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('hall', [2, -29.5, 33.5, 29.5], 3, 'hall'), room('platform', [-37.5, -37.5, 37.5, 37.5], 3, 'open')];
const walks = [[[70, 0], [48, 0], [42, 0], [37, 0]]];
walks[0].y0 = 0;

export const mosque = {
  id: 'djenne-great-mosque',
  name: { en: 'The Great Mosque of Djenné', zh: '杰内大清真寺' },
  era: { en: 'Founded in the 13th c.; its form as rebuilt in 1907', zh: '13世纪始建；按1907年重建的形制' },
  style: 'sahel',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [70, 0], facing: 'w' },
  bounds: [-60, -60, 60, 60],
  bakeBounds: [-38, -38, 40, 38],
  view: [-38, -38, 40, 38],
  bakeTop: 22,
  elements: E,
  rooms,
  walks,
};
export default mosque;
