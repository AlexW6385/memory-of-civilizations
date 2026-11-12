// Çatalhöyük, c. 6500 BC (docs/settlements/catalhoyuk.md §4–§5): the packed town of mudbrick houses, the one house opened
// (the landmark, reached by its ladder up the south wall and through the roof hatch), the hurdle pens at the edge.

import { CW, CD, X0, Z0, KIND, TOP, LANDMARK, PENS, CLUSTER, RADIUS, ST, ENTER, height, POOLS, MARSH } from './layout.js';
import '../../styles/catal/index.js';
import { cellGeom } from '../../styles/catal/cell.js';
import { colX, rowZ } from './layout.js';

const E = [];
E.push({ t: 'catal_quarter', x0: X0, z0: Z0, cols: CW, rows: CD, kind: KIND, tops: TOP, seed: 6500, enter: ENTER });
E.push({ t: 'catal_house', rect: LANDMARK.rect, top: ST, seed: 77 });
for (const p of PENS) E.push({ t: 'catal_pen', rect: p.rect, gate: p.gate });
// the trodden ring and its outwork, clear of the arrival, the ladder, the lanes to the pens and the south lane
const keep = [[(LANDMARK.rect[0] + LANDMARK.rect[2]) / 2, LANDMARK.rect[3] + 3.5, 5], [0, CLUSTER[3] + 8, 3], [0, CLUSTER[1] - 8, 3]];
for (const p of PENS) { const my = (p.rect[1] + p.rect[3]) / 2, ex = p.gate === 'w' ? CLUSTER[2] : CLUSTER[0], px = p.gate === 'w' ? p.rect[0] : p.rect[2]; for (let t = 0; t <= 1; t += 0.2) keep.push([ex + (px - ex) * t, my, 3.2]); }
E.push({ t: 'catal_edge', rect: CLUSTER, seed: 6501, keep });
// landings on the marsh pools nearest the town: shore point toward the town, the water ahead
const landings = [];
for (const k of [0, 1, 3]) {
  const [pcx, pcz, a, b] = POOLS[k], th = Math.atan2(-pcz / b, -pcx / a), x = pcx + a * 1.12 * Math.cos(th), z = pcz + b * 1.12 * Math.sin(th);
  const e = { t: 'catal_landing', at: [x, z], y: Math.max(height(x, z), MARSH.water + 0.1), toward: Math.atan2(pcz - z, pcx - x), water: MARSH.water, seed: 40 + k };
  landings.push(e); E.push(e);
}
export { landings };

const [lx0, lz0, lx1, lz1] = LANDMARK.rect, T = 0.45;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('house', [lx0 + T + 0.3, lz0 + T + 0.3, lx0 + T + 4.6, lz1 - T - 0.3], 0.05, 'hall'),
  room('store', [lx0 + T + 5.4, lz0 + T + 0.3, lx1 - T - 0.2, lz1 - T - 0.3], 0.05, 'hall'),
];
for (const e of ENTER) rooms.push(room('house-' + e.i + '-' + e.j, cellGeom([colX(e.j), rowZ(e.i), colX(e.j) + CW[e.j], rowZ(e.i) + CD[e.i]], e.mirror).room, 0.05, 'hall'));
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
  bounds: [CLUSTER[0] - 42, CLUSTER[1] - 14, CLUSTER[2] + 42, CLUSTER[3] + 45],
  bakeBounds: [CLUSTER[0] - 5, CLUSTER[1] - 5, CLUSTER[2] + 5, CLUSTER[3] + 5],
  view: CLUSTER,
  bakeTop: 8,
  elements: E,
  rooms,
  walks,
};
void RADIUS;
export default catal;
