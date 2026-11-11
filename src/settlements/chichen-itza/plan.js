// The Great Plaza of Chichén Itzá, c. 1000 (docs/settlements/chichen-itza.md §4): the Castillo —
// nine terraces, four stairways of 91 steps, serpent heads at the foot of the north stair, the temple
// on top — the Great Ball Court with its temples, the Temple of the Warriors with its colonnade and
// the Group of the Thousand Columns, the Platform of Venus, the Tzompantli, the sacbe to the Sacred
// Cenote and the small temple on its rim. The buildings at their true sizes; the distances between
// them shortened a little (§2).

import { PLAZA, CENOTE, SACBE } from './layout.js';

const E = [];
E.push({ t: 'lane', rect: PLAZA, y: 0.04, mat: 'lime_plaster' });
// the Castillo: 55.3 m at the base, 24 m to the top platform, the temple 6 m more
E.push({ t: 'm_pyramid', c: [0, 0], base: 27.6, top: 9.8, h: 24, tiers: 9, stairs: 'nesw', steps: 91, stairW: 8.8, stairOut: 6.2, serpents: 'n', temple: { w: 13.5, d: 13.5, h: 6, doors: 'n', furnish: 'castillo' } });
E.push({ t: 'maya_weather', c: [0, 0], base: 27.6, top: 9.8, h: 24, tiers: 9, stairW: 8.8, seed: 11 });
// the Great Ball Court: the alley 146 × 36 m, walls 8.5 m high
E.push({ t: 'm_ballcourt', rect: [-133, -110, -97, 36], wallH: 8.5, bench: 4.5 });
// the Temple of the Warriors, its colonnade, the Thousand Columns
// the temple's floor 45 ft (13.7 m) up; the chacmool before the serpent columns; the rain god's masks on the frieze's corners and middles
E.push({ t: 'm_pyramid', c: [112, -14], base: 20, top: 14, h: 13, tiers: 4, stairs: 'w', steps: 52, stairW: 9, serpents: 'w', temple: { w: 21, d: 18, h: 6.5, doors: 'w', masks: true, chacmool: true, inner: 'warriors' } });
E.push({ t: 'maya_weather', c: [112, -14], base: 20, top: 14, h: 13, tiers: 4, stairW: 9, seed: 12 });
E.push({ t: 'm_colonnade', rect: [62, -36, 86, 8], rows: 8, cols: 4, h: 4.2 });
E.push({ t: 'm_colonnade', rect: [84, 28, 164, 46], rows: 4, cols: 20, h: 4.2 });
E.push({ t: 'm_colonnade', rect: [146, -36, 164, 28], rows: 10, cols: 3, h: 4.2 });
// the Platform of Venus, the Tzompantli, the Platform of the Eagles and Jaguars
E.push({ t: 'm_platform', c: [0, -64], a: 12.5, h: 4.2, serpents: 'nesw', venus: true });
E.push({ t: 'm_platform', c: [-58, -46], a: 9, h: 1.9, stairs: 'e', skulls: true });
E.push({ t: 'm_platform', c: [-48, -12], a: 7, h: 3.2 });
// El Caracol, the round observatory, south-west of the Castillo (its stair facing west)
E.push({ t: 'm_caracol', c: [-50, 75] });
// the sacbe to the cenote, the cenote's rim temple
E.push({ t: 'sacbe', a: SACBE.a, b: SACBE.b, w: SACBE.w, h: 0.8 });
E.push({ t: 'm_platform', c: [0, CENOTE.c[1] + CENOTE.r + 5], a: 4, h: 1.6, stairs: 'n', stairOut: 0 });
E.push({ t: 'm_temple', c: [0, CENOTE.c[1] + CENOTE.r + 5], y: 1.6, w: 5, d: 4, h: 4, doors: 's', serpentCols: false });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('castillo-top', [-9.8, -9.8, 9.8, 9.8], 24, 'open'),
  room('plaza', PLAZA, 0, 'open'),
];
const walks = [[[0, 60], [0, 37], [0, 34], [0, 12], [0, 9.6]]];
walks[0].y0 = 0;

export const plaza = {
  id: 'chichen-itza-plaza',
  name: { en: 'Chichén Itzá: the Great Plaza and the Castillo', zh: '奇琴伊察：大广场与卡斯蒂略金字塔' },
  era: { en: 'Maya–Toltec, c. 900–1050', zh: '玛雅—托尔特克，约900–1050年' },
  style: 'maya',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 62], facing: 'n' },
  bounds: [PLAZA[0], CENOTE.c[1] - CENOTE.r - 5, PLAZA[2], PLAZA[3]],
  bakeBounds: [-30, -30, 30, 30],
  view: [-29, -29, 29, 29],
  bakeTop: 30,
  elements: E,
  rooms,
  walks,
};
export default plaza;
