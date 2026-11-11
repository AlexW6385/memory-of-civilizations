// Çatalhöyük, c. 6500 BC (docs/settlements/catalhoyuk.md §4–§5): the packed town of mudbrick houses, the one house opened
// (the landmark, reached by its ladder up the south wall and through the roof hatch), the hurdle pens at the edge.

import { CW, CD, X0, Z0, KIND, TOP, LANDMARK, PENS, CLUSTER, RADIUS, ST } from './layout.js';
import '../../styles/catal/index.js';

const E = [];
E.push({ t: 'catal_quarter', x0: X0, z0: Z0, cols: CW, rows: CD, kind: KIND, tops: TOP, seed: 6500 });
E.push({ t: 'catal_house', rect: LANDMARK.rect, top: ST, seed: 77 });
for (const p of PENS) E.push({ t: 'catal_pen', rect: p.rect, gate: p.gate });

const [lx0, lz0, lx1, lz1] = LANDMARK.rect, T = 0.45;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('house', [lx0 + T + 0.3, lz0 + T + 0.3, lx0 + T + 4.6, lz1 - T - 0.3], 0.05, 'hall'),
  room('store', [lx0 + T + 5.4, lz0 + T + 0.3, lx1 - T - 0.2, lz1 - T - 0.3], 0.05, 'hall'),
];
const cx = (lx0 + lx1) / 2;
const walks = [[[cx, lz1 + 6], [cx, lz1 + 1.0], [cx, lz0 + 3.5]]];
walks[0].y0 = 0;

export const catal = {
  id: 'catalhoyuk-town',
  name: { en: 'Çatalhöyük', zh: '加泰土丘' },
  era: { en: 'Neolithic, c. 6500 BC', zh: '新石器时代，约公元前6500年' },
  style: 'catal',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [cx, lz1 + 6], facing: 'n' },
  bounds: [CLUSTER[0] - 30, CLUSTER[1] - 12, CLUSTER[2] + 30, CLUSTER[3] + 14],
  bakeBounds: [CLUSTER[0] - 5, CLUSTER[1] - 5, CLUSTER[2] + 5, CLUSTER[3] + 5],
  view: CLUSTER,
  bakeTop: 8,
  elements: E,
  rooms,
  walks,
};
void RADIUS;
export default catal;
