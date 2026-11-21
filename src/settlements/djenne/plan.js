// The Great Mosque of Djenné and its square (docs/settlements/djenne.md §4): the mosque on its
// platform, its qibla wall with the three towers on the east facing the market.

import { MOSQUE, upperHomes } from './layout.js';
import { upperWalk, upperPlan } from '../../styles/sahel/homeplan.js';
import { ARRIVAL, SHOP_N, shopAt, courtAt } from './walk.js';

const E = [];
E.push({ t: 'lane', rect: [-58, -58, 58, 58], y: 0.03, mat: 'banco_smooth' });
E.push({ t: 'great_mosque', c: MOSQUE.c, a: MOSQUE.a, py: MOSQUE.py });
E.push({ t: 'mosque_fittings', c: MOSQUE.c, a: MOSQUE.a, py: MOSQUE.py });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('hall', [2, -29.5, 33.5, 29.5], 3, 'hall'), room('platform', [-37.5, -37.5, 37.5, 37.5], 3, 'open'), room('roof', [4, -27, 31, 27], 13.5, 'open')];
const walks = [[[70, 0], [48, 0], [44, -6], [43.4, -28], [43.2, -43.2], [38, -48], [0, -48], [0, -39]]];
walks[0].y0 = 0;
// the visitor's walk (docs §20.1): from the arrival to the foot of the mosque, and into each of the eight shops by the entry beside its counter and on to the shelf at the back
walks.push([ARRIVAL, [75, 22], [55, 22], [55, -43.2], [40, -43.2], [38, -48], [0, -48]]);
for (let i = 0; i < SHOP_N; i++) { const S = shopAt(i); walks.push([[S.entry, -43.2], [S.entry, -44.5], [S.entry, -47.2], [S.entry, S.zBack + 1.6]]); }
// the court house: through the door and the vestibule to the court, into the workshop, the reading room and up the court's stair to the east roof
{ const C = courtAt(), dz = C.zf + 0.0;
  walks.push([[C.xm, C.z1 + 1.8], [C.xm, C.z1 - 0.2], [C.xm, dz - 2], [C.xm, C.zp - 0.25], [C.xm, C.zp - 2.5], [C.west, C.zp - 2.5], [C.west, C.zp + 0.1], [C.west, C.zp + 2.0]]);
  walks.push([[C.xm, C.zp - 2.5], [C.xm + 0.5, C.zq + 0.65], [C.xe - 0.5, C.zq + 0.65], [C.xe + 2.5, C.zq + 0.65], [C.xe + 2.5, C.zp - 2.0]]); }
for (const w of walks) w.y0 ??= 0;
// the upper floors opened (docs §19): from the street through the door, vestibule and court up the court stair to the room above and on up the roof stair to the
// terrace; and into the loggia over the court where the house has one
for (const [h, kind] of upperHomes()) {
  const el = { rect: h.rect, front: h.front, kind };
  walks.push(upperWalk(el, 'roof'));
  if (upperPlan(el).loggia) walks.push(upperWalk(el, 'loggia'));
}

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
