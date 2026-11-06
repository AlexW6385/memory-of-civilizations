// Norse Norway about 1250 (docs/settlements/norse-borgund.md §2–§4).
import { CHURCH, BELL, YARD, height } from './layout.js';

const cy = height(...CHURCH), S = 0.85, GATE = { w: 3.2 };
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
    { t: 'stave_church', c: CHURCH, y: cy, s: S },
    { t: 'bell_house', c: BELL, y: height(...BELL), s: 4 },
    // the dry-stone churchyard wall, and the roofed gate in it on the south
    { t: 'stone_wall', pts: [[GATE.w / 2 + 0.8, YARD[3]], [YARD[2], YARD[3]], [YARD[2], YARD[1]], [YARD[0], YARD[1]], [YARD[0], YARD[3]], [-GATE.w / 2 - 0.8, YARD[3]]], y: height, h: 1.05, seed: 1250 },
    { t: 'lychgate', c: [0, YARD[3]], y: height(0, YARD[3]), w: GATE.w + 0.3, d: 2.6 },
  ],
  // the nave and chancel first: a point in them is in the churchyard too (the first room that holds it wins)
  rooms: [
    { id: 'nave', rect: [CHURCH[0] - 4.6, CHURCH[1] - 4.1, CHURCH[0] + 4.5, CHURCH[1] + 4.1], y: cy + 0.35 * S, kind: 'hall' },
    { id: 'chancel', rect: [CHURCH[0] + 4.8, CHURCH[1] - 2.1, CHURCH[0] + 9.3, CHURCH[1] + 2.1], y: cy + 0.35 * S, kind: 'hall' },
    { id: 'churchyard', rect: YARD, y: cy, kind: 'open' },
  ],
  walks: [
    Object.assign([[0, YARD[3] + 6], [0, YARD[3] - 4], [CHURCH[0] - 14, CHURCH[1]]], { y0: cy }),
    // in at the west porch, through the nave to the chancel
    Object.assign([[CHURCH[0] - 9, CHURCH[1]], [CHURCH[0] - 3.6, CHURCH[1]], [CHURCH[0], CHURCH[1]], [CHURCH[0] + 6.5, CHURCH[1]]], { y0: cy }),
  ],
};
export default church;
