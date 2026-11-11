// The Ajanta cliff (docs/settlements/ajanta.md §2–§5): the horseshoe of rock-cut caves, the ledge and its stair, the
// painted vihara (Cave 1), the chaitya hall (Cave 19), a monk's cell hall, the shrine niches, the Waghora with its ford and
// waterfall, the painters' scaffold in Cave 1 and a mason's at a niche of the north wing.
import { XF, ZW, ZOUT, WX1, ROCK, FLOOR, C1, C19, C12, FALL, SHELTER } from './layout.js';
import { viharaGeo, chaityaGeo } from '../../styles/ajanta/caves.js';

const E = [];
E.push({ t: 'aj_cliff' });
E.push({ t: 'aj_river' });
E.push({ t: 'aj_ford' });
E.push({ t: 'aj_fall' });
E.push({ t: 'aj_shelter', rect: SHELTER });
const y1 = FLOOR[1], v = viharaGeo(XF, C1.z, y1), ch = chaityaGeo(XF, C19.z, y1);
// the painters' scaffold at Vajrapani on the rear wall of Cave 1's hall; a mason's at a niche on the north wing
E.push({ t: 'aj_scaffold', at: [v.xh0, C1.z - 3.9], w: 2.2, h: 3.2, levels: 2, side: 1, y: y1, axis: 'z' });
E.push({ t: 'aj_scaffold', at: [XF + 14.5, -ZW], w: 5, h: 3.6, levels: 2, side: 1, y: 0, axis: 'x' });
E.push({ t: 'aj_chips', rect: [XF + 16, -ZW + 2.5, XF + 22, -ZW + 6], n: 16, seed: 2 });

const room = (id, rect, y, kind, sealed) => ({ id, rect, y, kind, ...(sealed ? { sealed } : {}) });
const HW = 9.75;
const rooms = [
  room('vihara-hall', [v.xh0, C1.z - HW, v.xw1, C1.z + HW], y1, 'hall', true),
  room('vihara-sanctum', [v.xh0 - 7.0, C1.z - 2.5, v.xh0 - 1.2, C1.z + 2.5], y1, 'hall', true),
  room('vihara-porch', [v.xp0, C1.z - 12, XF, C1.z + 12], y1, 'open'),
  room('chaitya', [ch.xn0, C19.z - 3.55, ch.xn1, C19.z + 3.55], y1, 'hall', true),
  room('cell-hall', [XF - 7.0, C12.z - 2.9, XF - 1.2, C12.z + 2.9], y1, 'hall', true),
  room('ledge', [XF, -57, XF + 6, 57], y1, 'open'),
  room('gorge', [XF + 6, -58, XF + 40, 58], 0, 'open'),
];
// from the path up the stair, along the ledge into the vihara's hall, a cell, the sanctum, the chaitya hall and the cell hall
const walks = [[[-48, -46], [-48, -58], [-52.8, -58.4], [-52.8, -43], [-56, -41], [-56, -26], [-62, -26], [-66, -26], [-74, -26], [-84, -26], [-87.5, -26], [-84, -26], [-66.75, -26], [-66.75, -33], [-66.75, -37.5],
  [-66.75, -33], [-66.75, -26], [-62, -26], [-56, -26], [-56, 24], [-62, 24], [-69.5, 24], [-62, 24], [-56, 24], [-56, 46], [-62, 46], [-65, 46]]];
walks[0].y0 = 0;

export const ajanta = {
  id: 'ajanta-caves',
  name: { en: 'The Ajanta caves', zh: '阿旃陀石窟' },
  era: { en: 'Vakataka, c. 480', zh: '伐卡塔卡王朝，约480年' },
  style: 'ajanta',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-48, -46], facing: 'e' },
  bounds: [XF - ROCK, -ZOUT - 4, WX1 + 4, ZOUT + 4],
  bakeBounds: [XF - 30, -42, XF + 8, -10],
  view: [XF, C1.z - 10, XF + 14, C1.z + 10],
  bakeTop: 16,
  elements: E,
  rooms,
  walks,
};
void FALL;
export default ajanta;
