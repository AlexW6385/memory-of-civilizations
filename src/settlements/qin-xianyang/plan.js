// The two landmarks (docs/settlements/qin-xianyang.md §2, §4): Pit 1 of the terracotta army as it was when new, and the Xianyang
// palace hall on its rammed-earth terrace with the great stair and the twin que. Both are authored in the settlement's frame.
import { PIT, RAMP, GALLERY, CORR, ROOF, TERRACE, STAIR, HALL, QUE, FORECOURT, corrZ, rampZ } from './layout.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });

// ── Pit 1 ──
const PE = [{ t: 'qin_pit' }, { t: 'qin_army' }];
const zc = rampZ(1);
const pitWalks = [[[PIT.x1 + RAMP.len + 8, zc], [PIT.x1 + RAMP.len, zc], [PIT.x1 + 10, zc], [PIT.x1 - 4, zc], [GALLERY[0] + 4, zc], [CORR.x1 - 8, zc], [60, zc], [10, zc]]];
pitWalks[0].y0 = 0;
export const pit = {
  id: 'qin-pit1',
  name: { en: 'Pit 1 of the terracotta army', zh: '兵马俑一号坑' },
  era: { en: 'Qin, c. 210 BC', zh: '秦，约公元前210年' },
  style: 'qin',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [PIT.x1 + RAMP.len + 8, zc], facing: 'w' },
  bounds: [PIT.x0 - 12, PIT.z0 - 12, PIT.x1 + RAMP.len + 14, PIT.z1 + 12],
  bakeBounds: [PIT.x0 - 4, PIT.z0 - 4, PIT.x1 + RAMP.len + 4, PIT.z1 + 4],
  view: [PIT.x0 - 12, PIT.z0 - 12, PIT.x1 + RAMP.len + 14, PIT.z1 + 12],
  bakeTop: ROOF.mound + 2,
  elements: PE,
  rooms: [
    room('pit-gallery', [GALLERY[0], PIT.z0 + PIT.wall, GALLERY[1], PIT.z1 - PIT.wall], PIT.floor, 'hall'),
    room('pit-corridors', [CORR.x0, PIT.z0 + PIT.wall, CORR.x1, PIT.z1 - PIT.wall], PIT.floor, 'hall'),
    room('pit-deck', [ROOF.bareX + 20, PIT.z0, PIT.x1 - 2, PIT.z1], ROOF.top, 'open'),
  ],
  walks: pitWalks,
};

// ── the palace ──
const x = STAIR.x;
const PL = [
  { t: 'qin_terrace' },
  { t: 'stair', rect: [x - STAIR.w / 2, TERRACE.z1, x + STAIR.w / 2, TERRACE.z1 + STAIR.run], y0: 0, y1: TERRACE.h, dir: 'n', riser: TERRACE.h / Math.round(TERRACE.h / 0.16), mat: 'brick_grey' },
  { t: 'qin_hall' }, { t: 'qin_court' },
  { t: 'qin_que', at: [x - QUE.off - QUE.w / 2, QUE.z] }, { t: 'qin_que', at: [x + QUE.off + QUE.w / 2, QUE.z] },
  { t: 'floor', rect: FORECOURT, y: 0.02, mat: 'brick_grey', th: 0.4 },
];
const palWalks = [[[x, -26], [x, TERRACE.z1 + STAIR.run], [x, TERRACE.z1], [x, HALL.z1 - 3.4], [x, (HALL.z0 + HALL.z1) / 2], [x, HALL.z0 + 14]]];
palWalks[0].y0 = 0;
export const palace = {
  id: 'qin-palace',
  name: { en: 'Xianyang palace hall', zh: '咸阳宫大殿' },
  era: { en: 'Qin, c. 210 BC', zh: '秦，约公元前210年' },
  style: 'qin',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [x, -26], facing: 'n' },
  bounds: [FORECOURT[0] - 6, TERRACE.z0 - TERRACE.rim - 6, FORECOURT[2] + 6, FORECOURT[3] + 4],
  bakeBounds: [TERRACE.x0 - TERRACE.rim - 4, TERRACE.z0 - TERRACE.rim - 4, TERRACE.x1 + TERRACE.rim + 4, FORECOURT[3]],
  view: [FORECOURT[0] - 6, TERRACE.z0 - TERRACE.rim - 6, FORECOURT[2] + 6, FORECOURT[3] + 4],
  bakeTop: TERRACE.h + 14,
  elements: PL,
  rooms: [
    room('forecourt', FORECOURT, 0, 'open'),
    room('hall', [HALL.x0 + 3.4, HALL.z0 + 3.4, HALL.x1 - 3.4, HALL.z1 - 3.4], TERRACE.h + 0.08, 'hall'),
    room('terrace', [TERRACE.x0 + 1, TERRACE.z0 + 1, TERRACE.x1 - 1, HALL.z0 + 3], TERRACE.h, 'open'),
  ],
  walks: palWalks,
};
void corrZ;
export default pit;
