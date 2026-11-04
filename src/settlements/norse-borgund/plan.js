// Norse Norway about 1250 (docs/settlements/norse-borgund.md §2–§4).
import { RADIUS, CHURCH, BELL, YARD, height, buildings } from './layout.js';

const cy = height(...CHURCH);
export const church = {
  id: 'norse-borgund-church',
  name: { en: 'Borgund stave church', zh: '博尔贡木板教堂' },
  era: { en: 'Lærdal, Norway, about 1250', zh: '挪威莱达尔，约1250年' },
  style: 'norse',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [CHURCH[0] - 18, CHURCH[1] + 1], facing: 'e' },
  bounds: [YARD[0] - 2, YARD[1] - 2, YARD[2] + 2, YARD[3] + 2],
  view: [CHURCH[0] - 9, CHURCH[1] - 7, CHURCH[0] + 13, CHURCH[1] + 7],
  bakeTop: 30,
  elements: [
    { t: 'stave_church', c: CHURCH, y: cy, s: 0.85 },
    { t: 'bell_house', c: BELL, y: height(...BELL), s: 4 },
    { t: 'fence', pts: [[YARD[0], YARD[1]], [YARD[2], YARD[1]], [YARD[2], YARD[3]], [3, YARD[3]]], y: cy - 0.6, h: 1.1 },
    { t: 'fence', pts: [[-3, YARD[3]], [YARD[0], YARD[3]], [YARD[0], YARD[1]]], y: cy - 0.6, h: 1.1 },
  ],
  rooms: [{ id: 'churchyard', rect: YARD, y: cy, kind: 'open' }],
  walks: [Object.assign([[0, YARD[3] + 6], [0, YARD[3] - 4], [CHURCH[0] - 14, CHURCH[1]]], { y0: cy })],
};
export function farms() {
  const all = buildings();
  return [{ id: 'norse-borgund-farms', style: 'norse', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, elements: all.map((b) => ({ t: 'log_house', ...b })) }];
}
export default church;
