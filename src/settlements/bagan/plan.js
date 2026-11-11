// Pagan, c. 1200: the Ananda Temple in its precinct (docs/settlements/bagan.md §4) — the cruciform brick temple with its four porches, the corridors, the four standing Buddhas
// and the gilded spire, the precinct's wall with its four gates, the brick monastery by it.
import '../../styles/burmese/index.js';
import { ANANDA, PRECINCT, OKKYAUNG, RADIUS } from './layout.js';

const [px0, pz0, px1, pz1] = PRECINCT, [ax, az] = ANANDA.c, f = ANANDA.f;
const E = [];
E.push({ t: 'bgn_ananda', c: ANANDA.c, f, seed: 1105 });
// the precinct wall (1.6 m of brick under a limewashed coping) with a gate in the middle of each side
const W = { th: 1.1, h: 2.6, mat: 'brick', merlon: false };
E.push({ t: 'bgn_wall', a: [px0, pz0], b: [px1, pz0], ...W, gaps: [{ at: ax - px0, w: 7 }] });
E.push({ t: 'bgn_wall', a: [px0, pz1], b: [px1, pz1], ...W, gaps: [{ at: ax - px0, w: 7 }] });
E.push({ t: 'bgn_wall', a: [px0, pz0], b: [px0, pz1], ...W, gaps: [{ at: az - pz0, w: 7 }] });
E.push({ t: 'bgn_wall', a: [px1, pz0], b: [px1, pz1], ...W, gaps: [{ at: az - pz0, w: 7 }] });
E.push({ t: 'bgn_gate', c: [ax, pz0], axis: 'z', th: 1.1, h: 5.4, pw: 3.6 });
E.push({ t: 'bgn_gate', c: [ax, pz1], axis: 'z', th: 1.1, h: 5.4, pw: 3.6 });
E.push({ t: 'bgn_gate', c: [px0, az], axis: 'x', th: 1.1, h: 5.4, pw: 3.6 });
E.push({ t: 'bgn_gate', c: [px1, az], axis: 'x', th: 1.1, h: 5.4, pw: 3.6 });
// the Ananda Okkyaung, the brick monastery of 1137 beside the precinct's east wall
E.push({ t: 'bgn_okkyaung', rect: OKKYAUNG, front: 'w', seed: 1137 });

const HI = 13.6, HW = 16.8, HM = 23, HO = 26.5;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('precinct', PRECINCT, 0, 'open'),
  room('ananda', [ax - HO, az - HO, ax + HO, az + HO], f, 'hall'),
  room('ananda-w', [ax - 48.6, az - 5, ax - HO, az + 5], f, 'hall'),
  room('ananda-e', [ax + HO, az - 5, ax + 48.6, az + 5], f, 'hall'),
  room('ananda-n', [ax - 5, az - 48.6, ax + 5, az - HO], f, 'hall'),
  room('ananda-s', [ax - 5, az + HO, ax + 5, az + 48.6], f, 'hall'),
];
// in by the west gate, up the porch and the cross passage to Gautama, then once round the inner corridor
const c1 = HI + (HW - HI) / 2;
const walks = [[[px0 - 8, az], [px0 + 10, az], [ax - 49, az], [ax - c1, az], [ax - c1, az - c1], [ax + c1, az - c1], [ax + c1, az + c1], [ax - c1, az + c1], [ax - c1, az]]];
walks[0].y0 = 0;

export const ananda = {
  id: 'ananda-temple',
  name: { en: 'Ananda Temple', zh: '阿难陀寺' },
  era: { en: 'Pagan, c. 1200', zh: '蒲甘王朝，约1200年' },
  style: 'burmese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [30, 0], facing: 'e' },
  bounds: [px0 - 10, pz0 - 10, px1 + 10, pz1 + 10],
  bakeBounds: [px0, pz0, px1, pz1],
  view: [ax - 54, az - 54, ax + 54, az + 54],
  bakeTop: 56,
  elements: E,
  rooms,
  walks,
};
void RADIUS;
export default ananda;
