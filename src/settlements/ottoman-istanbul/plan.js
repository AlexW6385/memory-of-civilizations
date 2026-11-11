// The Süleymaniye about 1560 (docs/settlements/ottoman-istanbul.md §2–§4): the mosque, its outer
// court's wall, the külliye (medreses, shops, hospital, soup kitchen, bath, dar'ül-hadis), Süleyman's tomb, the terrace's retaining wall to the north.

import { MOSQUE, PRECINCT, MEDRESES, ARASTA, DARUSSIFA, IMARET, HAMAM, DARULHADIS, TERRACE, TOP, TOMB, GRAVES, ROSES, CARSI, CESMES } from './layout.js';

const E = [];
E.push({ t: 'sinan_mosque', c: MOSQUE.c, d: MOSQUE.d, h: MOSQUE.h, y: TOP, court: 38.1 });
const [p0, q0, p1, q1] = PRECINCT;
for (const r of [[p0, q0, -6, q0 + 1.2], [6, q0, p1, q0 + 1.2], [p0, q1 - 1.2, p1, q1], [p0, q0, p0 + 1.2, q1], [p1 - 1.2, q0, p1, q1]]) E.push({ t: 'block', rect: r, y0: TOP - 0.5, y1: TOP + 4, mat: 'limestone' });
for (const q of MEDRESES) E.push({ t: 'kulliye_medrese', rect: q.rect, out: q.out, y: TOP, shopFace: true });
// the shops before the medreses, the gaps at the medreses' gates and the alley between them
for (const f of ['w', 'e']) {
  const gates = MEDRESES.filter((q) => (q.out === 'w') === (f === 'w')).map((q) => [q.rect[1] + 5 * 4.2 - 1.6, q.rect[1] + 6 * 4.2 + 1.6]);
  E.push({ t: 'arasta', x: ARASTA[f], z0: ARASTA.z0, z1: ARASTA.z1, face: f === 'w' ? 'e' : 'w', d: ARASTA.d, y: TOP, gaps: [...gates, [-9.8, -6.8]], goods: f === 'w' ? 'cloth' : 'copper' });
}
E.push({ t: 'darussifa', rect: DARUSSIFA, y: TOP });
E.push({ t: 'imaret', rect: IMARET, y: TOP });
E.push({ t: 'hamam', rect: HAMAM, y: TOP });
E.push({ t: 'darulhadis', at: DARULHADIS.at, m: DARULHADIS.m, y: TOP });
E.push({ t: 'turbe', c: TOMB.c, r: TOMB.r, h: 7.6, y: TOP, door: 'n' });
E.push({ t: 'graves', list: GRAVES, roses: ROSES, y: TOP });
E.push({ t: 'carsi', ...CARSI });
for (const [x, z, face] of CESMES) E.push({ t: 'cesme', at: [x, z], face, y: TOP });
const [t0, u0, t1, u1] = TERRACE;
E.push({ t: 'block', rect: [t0, u0 - 0.6, t1, u0], y0: 0, y1: TOP + 1, mat: 'limestone' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const hw = MOSQUE.d * 1.1 - 2.6, hd = MOSQUE.d * 1.1 - 2.6;
const rooms = [room('prayer hall', [MOSQUE.c[0] - hw, MOSQUE.c[1] - hd, MOSQUE.c[0] + hw, MOSQUE.c[1] + hd], TOP + 0.05, 'hall'), room('outer court', PRECINCT, TOP, 'open'), room('tomb of hurrem sultan', [TOMB.c[0] - TOMB.r, TOMB.c[1] - TOMB.r, TOMB.c[0] + TOMB.r, TOMB.c[1] + TOMB.r], TOP + 0.26, 'hall'), room('bedesten', CARSI.bedesten, TOP + 0.05, 'hall')];
const walks = [[[0, -100], [0, -80], [0, -40]]];
walks[0].y0 = TOP;

export const suleymaniye = {
  id: 'ottoman-istanbul-suleymaniye',
  name: { en: 'The Süleymaniye', zh: '苏莱曼尼耶清真寺' },
  era: { en: 'Ottoman Istanbul, about 1560', zh: '奥斯曼伊斯坦布尔，约1560年' },
  style: 'ottoman',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -100], facing: 's' },
  bounds: [t0 - 2, u0 - 3, t1 + 2, u1 + 2],
  view: [-66, -8, 66, 48],
  viewY: TOP,
  bakeTop: 80,
  elements: E,
  rooms,
  walks,
};
export default suleymaniye;
