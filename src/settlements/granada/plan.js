// The Alhambra about 1390 (docs/settlements/granada.md §2–§4): the Nasrid palaces' two courts and
// the Comares Tower, the Alcazaba, the walls and towers round the hill.
import { HILL, MYRTLES, COMARES, LIONS, ALCAZABA, height } from './layout.js';

const T = HILL.top, E = [];
// the Comares palace: the Court of the Myrtles, its porticoes, the Sala de la Barca, the Comares Tower
// with the Hall of the Ambassadors (§4.2); the Court of the Lions and the halls round it (§4.1, §4.3)
E.push({ t: 'comares', rect: MYRTLES, y: T });
E.push({ t: 'court', rect: LIONS, y: T, kind: 'lions', h: 9 });
E.push({ t: 'lions_halls', rect: LIONS, y: T });
// the Alcazaba: its walls and towers at the hill's west end, the Torre de la Vela the tallest
const [a0, b0, a1, b1] = ALCAZABA;
for (const [a, b] of [[[a0, b0], [a1, b0]], [[a0, b1], [a1, b1]], [[a0, b0], [a0, b1]], [[a1, b0], [a1, b1]]]) E.push({ t: 'nasrid_wall', a, b, h: 11, th: 3, y: T });
E.push({ t: 'nasrid_tower', rect: [a0 - 6, b0 - 6, a0 + 10, b0 + 10], h: 26, y: T });
for (const [x, z] of [[a1, b0], [a0, b1], [a1, b1]]) E.push({ t: 'nasrid_tower', rect: [x - 5, z - 5, x + 5, z + 5], h: 16, y: T });
// the walls round the rim with square towers
const n = 26;
for (let k = 0; k < n; k++) {
  const t0 = k / n * Math.PI * 2, t1 = (k + 1) / n * Math.PI * 2, rx = HILL.r[0] - 4, rz = HILL.r[1] - 4;
  const a = [HILL.c[0] + Math.cos(t0) * rx, HILL.c[1] + Math.sin(t0) * rz], b = [HILL.c[0] + Math.cos(t1) * rx, HILL.c[1] + Math.sin(t1) * rz];
  if (Math.cos((t0 + t1) / 2) < -0.85) continue;                                   // the Alcazaba closes the west end
  // the Comares Tower stands in the line of the north wall: the run is cut round it
  if (Math.abs(a[1] - b[1]) < 0.1 && a[1] > COMARES[1] && a[1] < COMARES[3]) {
    const [lo, hi] = a[0] < b[0] ? [a, b] : [b, a];
    E.push({ t: 'nasrid_wall', a: lo, b: [COMARES[0], lo[1]], h: 8, th: 2.4, y: T }, { t: 'nasrid_wall', a: [COMARES[2], hi[1]], b: hi, h: 8, th: 2.4, y: T });
  } else E.push({ t: 'nasrid_wall', a, b, h: 8, th: 2.4, y: T });
  if (k % 2 === 0) E.push({ t: 'nasrid_tower', rect: [a[0] - 4, a[1] - 4, a[0] + 4, a[1] + 4], h: 15, y: T });
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const alhambra = {
  id: 'granada-alhambra',
  name: { en: 'The Alhambra', zh: '阿尔罕布拉宫' },
  era: { en: 'Nasrid Granada, about 1390', zh: '纳斯里德王朝格拉纳达，约1390年' },
  style: 'nasrid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [20, 30], facing: 'n' },
  bounds: [HILL.c[0] - HILL.r[0] - 2, HILL.c[1] - HILL.r[1] - 2, HILL.c[0] + HILL.r[0] + 2, HILL.c[1] + HILL.r[1] + 2],
  view: [MYRTLES[0] - 8, MYRTLES[1] - 8, LIONS[2] + 8, LIONS[3] + 12],
  viewY: T,
  bakeTop: 80,
  elements: E,
  rooms: [room('court of the myrtles', MYRTLES, T, 'open'), room('court of the lions', LIONS, T, 'open'),
    room('hall of the ambassadors', [COMARES[0] + 2.35, COMARES[1] + 2.35, COMARES[2] - 2.35, COMARES[3] - 2.35], T, 'hall'),
    room('sala de la barca', [MYRTLES[0], MYRTLES[1] - 9.6, MYRTLES[2], MYRTLES[1] - 5.3], T, 'hall'),
    room('hall of the two sisters', [LIONS[0] + 10, LIONS[1] - 9.4, LIONS[2] - 10, LIONS[1] - 1.4], T, 'hall'),
    room('hall of the abencerrajes', [LIONS[0] + 10.6, LIONS[3] + 1.4, LIONS[2] - 10.6, LIONS[3] + 8.2], T, 'hall'),
    room('hall of the kings', [LIONS[2] + 0.8, LIONS[1] - 2.2, LIONS[2] + 5.6, LIONS[3] + 2.2], T, 'hall')],
  walks: [Object.assign([[20, 30], [20, 14]], { y0: T })],
};
void height;
export default alhambra;
