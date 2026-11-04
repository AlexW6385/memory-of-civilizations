// Petra's monuments about AD 50 (docs/settlements/petra.md §2–§4): the Khazneh facing the Siq's
// mouth, the Street of Façades, the theatre, the Royal Tombs in the east cliff, the colonnaded
// street, the Great Temple and Qasr al-Bint.

import { PLAZA, STREET, RIM, VALLEY } from './layout.js';

const E = [];
// the Khazneh in the west wall of the little square, facing the Siq's mouth
E.push({ t: 'khazneh', at: [PLAZA.c[0] - PLAZA.r + 2, PLAZA.c[1]], dir: 'e', w: 25, h: 39, back: 26, top: RIM - 2 });
// the Street of Façades along the Outer Siq's south-west side
for (const [x, z, w, h, d] of [[105, -112, 9, 11, 'e'], [98, -96, 10, 13, 'e'], [90, -80, 8, 10, 'e'], [78, -64, 11, 14, 'e']]) E.push({ t: 'rock_tomb', at: [x, z], dir: d, w, h, kind: 'crowstep', back: 12, top: RIM - 4 });
// the theatre cut into the Outer Siq's east side, facing west
E.push({ t: 'theatre', c: [84, -44], dir: 'w', r0: 10, r1: 34, rows: 30, span: Math.PI * 1.05 });
// the Royal Tombs in the eastern cliff of the valley, facing west
const edge = (z) => VALLEY.c[0] + VALLEY.r[0] * Math.sqrt(Math.max(0, 1 - ((z - VALLEY.c[1]) / VALLEY.r[1]) ** 2));
for (const [z, w, h, k] of [[-40, 18, 26, 'pediment'], [-16, 22, 32, 'pediment'], [8, 14, 22, 'crowstep'], [48, 40, 40, 'palace']]) E.push({ t: 'rock_tomb', at: [Math.min(edge(z - w / 2), edge(z + w / 2)) + 1, z], dir: 'w', w, h, kind: k, back: 20, top: RIM - 4 });
// the colonnaded street, the Great Temple on the south, Qasr al-Bint at the west end
E.push({ t: 'colonnade_street', a: STREET.a, b: STREET.b, w: STREET.w });
E.push({ t: 'podium_temple', rect: [-72, 40, -44, 74], h: 18, podium: 2.5 });
E.push({ t: 'podium_temple', rect: [-164, -6, -132, 26], h: 23, podium: 3 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('the square', [PLAZA.c[0] - PLAZA.r, PLAZA.c[1] - PLAZA.r, PLAZA.c[0] + PLAZA.r, PLAZA.c[1] + PLAZA.r], 0, 'open'), room('the city', [-200, -80, 60, 100], 0, 'open')];
const walks = [[[180, -152], [150, -161], [132, -160], [126, -125], [100, -80], [40, -10], [0, 12]]];
walks[0].y0 = 0;

export const khazneh = {
  id: 'petra-khazneh',
  name: { en: 'The Khazneh and the city of Petra', zh: '卡兹尼神殿与佩特拉城' },
  era: { en: 'Nabataea, about AD 50', zh: '纳巴泰，约公元50年' },
  style: 'nabataean',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [140, -160], facing: 'w' },
  bounds: [-170, -200, 140, 80],
  view: [PLAZA.c[0] - PLAZA.r - 6, PLAZA.c[1] - 16, PLAZA.c[0] - 2, PLAZA.c[1] + 16],
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};
export default khazneh;
