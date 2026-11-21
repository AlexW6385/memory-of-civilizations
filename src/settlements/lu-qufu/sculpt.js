// The fine layers of the Dacheng Hall's sculpture (docs/settlements/lu-qufu.md §13): plans drawn only near, over the reduced forms the main plan
// always has (the plan names a centre and a reach, src/engine/world.js): from the arrival and the great court none is drawn.
import './wear.js';
import { HALL, MOON, BASE, STELE_PAV } from './layout.js';

const detail = (id, center, reach, elements, bounds) => ({ id, style: 'lu', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds, entrance: { at: [0, -62], facing: 'n' }, center, near: reach });
const [x0, , x1, z1] = HALL.rect, bw = (x1 - x0) / 9, hc = HALL.H - 0.4;
const lift = 0.17, cut = 0.4, len = 5, y1s = 0.03 + lift + (HALL.y - 0.03) * (len - cut) / len;      // as plan.js lays the imperial way
const lions = (level) => [-1, 1].map((s) => ({ t: 'lu_lion', at: [s * 13.5, -95.5], y: 0.03, s: 0.95, ball: s > 0, face: [0, 1], level }));
// where feet went before the hall: the worn marble at the foot and at the head of the two side flights, and the way across the front of the hall to its middle doors
const wearAt = [[-1, 0], [1, 0]].flatMap(([s]) => [
  [s * 7.25 - 1.2, -93.5, s * 7.25 + 1.2, -91.7, 0.03, 0], [s * 7.25 - 0.6, -93.1, s * 7.25 + 0.6, -92.1, 0.03, 1],
  [s * 7.25 - 1.2, -100.3, s * 7.25 + 1.2, -98.6, HALL.y, 0], [s * 7.25 - 0.6, -99.9, s * 7.25 + 0.6, -99.0, HALL.y, 1],
]).concat([[-1.9, -116.0, 1.9, -112.0, HALL.y, 0], [-0.9, -115.6, 0.9, -112.6, HALL.y, 1]]);
export const detailPlans = [
  detail('lu-qufu-wear', [0, -104], 34, [{ t: 'lu_wear', patches: wearAt }], [-12, -118, 12, -90]),
  // the six columns nearest the stair carry the fine layer (the scales, the teeth, more clouds and waves, the lotus petals); the outer four stay reduced
  detail('lu-qufu-columns-fine', [0, z1 + 0.62], 30, [2, 3, 4, 5, 6, 7].map((i) => ({ t: 'lu_dragon_column', at: [x0 + i * bw, z1 + 0.62], y: HALL.y, h: hc, level: 'F' })), [-24, z1 - 3, 24, z1 + 5]),
  detail('lu-qufu-ramps-fine', [0, (MOON[3] + BASE[1]) / 2], 24, [
    { t: 'lu_ramp_fine', rect: [-1.5, MOON[3] + 0.4, 1.5, MOON[3] + 5], y0: 0.03 + lift, y1: y1s, dir: 'n', slab: true },
  ], [-4, MOON[3], 4, MOON[3] + 6]),
  // the stone lions at the foot of the moon terrace: the reduced form within 36 m, the fine layer (curls' inner coils, teeth, claws, beads) within 16 m
  detail('lu-qufu-lions', [0, -95.5], 36, lions('R'), [-17, -99, 17, -92]),
  detail('lu-qufu-lions-fine', [0, -95.5], 16, lions('F'), [-17, -99, 17, -92]),
  // the bronze burners on the terrace: the studs of the belly and the lid
  detail('lu-qufu-burners-fine', [0, HALL.y > 0 ? MOON[1] + 5 : 0], 24, [-1, 1].map((s) => ({ t: 'lu_burner', at: [s * 12.5, MOON[1] + 5], y: HALL.y, s: 0.8, level: 'F' })), [-16, MOON[1] + 1, 16, MOON[1] + 9]),
  // the statues in the hall: the beads, fingers and lids over the reduced figures, within 22 m of the shrine
  detail('lu-qufu-statues-fine', [0, HALL.rect[1] + 5.6], 22, [{ t: 'lu_statue', at: [0, HALL.rect[1] + 1.0 + 4.6], y: HALL.y + 1.6, kind: 'confucius', level: 'F' }], [-8, HALL.rect[1], 8, HALL.rect[1] + 12]),
  // the tortoise-borne steles of the pavilions nearest the axis: the fine layer within 15 m of each
  ...STELE_PAV.filter((p) => Math.abs(p.c[0]) <= 26).map((p, i) => detail(`lu-qufu-bixi-fine-${i}`, p.c, 15, [{ t: 'lu_bixi', at: p.c, y: 0.5, s: p.big ? 0.8 : 0.55, level: 'F' }], [p.c[0] - 5, p.c[1] - 5, p.c[0] + 5, p.c[1] + 5])),
];
