// The landmarks (docs/settlements/shang-yinxu.md §2, §4): the ancestral hall of the kings on its rammed-earth platform with the two
// flanking halls, the court with its sacrificial pits and the gate; Fu Hao's tomb with its small hall and chariot pits; the
// oracle-bone archive with the diviners' shed. All in the settlement's frame.
import { HALL, FLANKS, GATE, COURT, AXIS, TOMB, ARCHIVE } from './layout.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const walk = (pts, y0 = 0) => { const w = [pts]; w[0].y0 = y0; return w; };

const E = [
  { t: 'shang_hall', plat: HALL.plat, h: HALL.h, rot: 0, bays: 9, bw: 4, deep: 3, porch: 3.6, over: 2.8, rise: 6.0, rich: true },
  ...FLANKS.map((f, i) => ({ t: 'shang_hall', plat: f.plat, h: f.h, rot: 1, flip: i === 1, bays: 5, bw: 4, deep: 2, porch: 3.2, over: 2.2, rise: 3.6, rich: false })),
  { t: 'shang_pits' },
  { t: 'shang_gate', plat: GATE.plat, axis: GATE.axis, h: GATE.h },
];
const hallRoom = [HALL.plat[0] + 4, HALL.plat[1] + 3, HALL.plat[2] - 4, HALL.plat[3] - 2];
export const hall = {
  id: 'yinxu-hall',
  name: { en: 'Ancestral hall of the kings', zh: '殷王宗庙' },
  era: { en: 'Shang, c. 1200 BC', zh: '商，约公元前1200年' },
  style: 'shang',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [AXIS, 40], facing: 'n' },
  bounds: [-34, -108, 74, 62],
  bakeBounds: [-30, -104, 70, 58],
  view: [-34, -108, 74, 62],
  bakeTop: 14,
  elements: E,
  rooms: [
    room('court', COURT, 0, 'open'),
    room('hall', hallRoom, HALL.h, 'hall'),
  ],
  walks: walk([[AXIS, 44], [AXIS, 20], [AXIS, -40], [AXIS, -70], [AXIS, -76 + 0.01], [AXIS, -88]]),
};
hall.walks[0].y0 = 0;

const TE = [{ t: 'shang_tomb' }];
export const tomb = {
  id: 'yinxu-tomb',
  name: { en: 'Tomb of Fu Hao', zh: '妇好墓' },
  era: { en: 'Shang, c. 1200 BC', zh: '商，约公元前1200年' },
  style: 'shang',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [(TOMB.plat[0] + TOMB.plat[2]) / 2, TOMB.plat[3] + 8], facing: 'n' },
  bounds: [-84, -130, -22, -90],
  bakeBounds: [-80, -126, -26, -94],
  view: [-84, -130, -22, -90],
  bakeTop: 8,
  elements: TE,
  rooms: [room('tomb', [-80, -126, -26, -94], 0, 'open'), room('tomb-hall', TOMB.hall, TOMB.h, 'hall')],
  walks: walk([[(TOMB.plat[0] + TOMB.plat[2]) / 2, TOMB.plat[3] + 6], [(TOMB.plat[0] + TOMB.plat[2]) / 2, TOMB.plat[3] + 0.5], [(TOMB.plat[0] + TOMB.plat[2]) / 2, TOMB.plat[3] - 2]]),
};

const AE = [{ t: 'shang_archive' }];
const ax = (ARCHIVE.rect[0] + ARCHIVE.rect[2]) / 2;
export const archive = {
  id: 'yinxu-archive',
  name: { en: 'Oracle-bone archive', zh: '甲骨档案库' },
  era: { en: 'Shang, c. 1200 BC', zh: '商，约公元前1200年' },
  style: 'shang',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [ax, -56], facing: 'n' },
  bounds: [90, -98, 132, -44],
  bakeBounds: [92, -96, 130, -46],
  view: [90, -98, 132, -44],
  bakeTop: 8,
  elements: AE,
  rooms: [room('archive', ARCHIVE.rect, ARCHIVE.h, 'hall'), room('shed', ARCHIVE.shed, 0, 'open')],
  walks: walk([[ax, -56], [ax, ARCHIVE.rect[3] + 2.6], [ax, ARCHIVE.rect[3] - 1.2], [ax, ARCHIVE.rect[1] + 8]]),
};
export default hall;
