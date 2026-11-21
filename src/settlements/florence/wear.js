// Florence — wear where feet and hands went on the great buildings (docs/settlements/florence.md §22), and the two porphyry columns of the Baptistery.
// Smooth patches of `pietra_serena_carved` laid a centimetre or so over the treads and thresholds (stone worn to a polish and a dish, which the joints of
// the paving do not show), a rubbed band of dull bronze on the Gate of Paradise where the gilding went first, and two columns of porphyry. All in materials
// the always-shown plans already hold, in one element of the renaissance style (registered from here, as nightlamps.js does), world frame, no collision.

import { STYLES } from '../../core/build.js';
import '../../styles/renaissance/index.js';
import { box, lathe, quad, fromTriangles } from '../../core/geom.js';
import { RADIUS, DUOMO, BAPTISTERY, PALAZZO } from './layout.js';

const WORN = 'pietra_serena_carved', RUB = 'bronze', POR = 'porphyry';

/** A convex outline pts [[x, z], ...] raised to y with a skin of th: top and edges. */
function patch(out, pts, y, th = 0.012) {
  const n = pts.length, cx = pts.reduce((s, p) => s + p[0], 0) / n, cz = pts.reduce((s, p) => s + p[1], 0) / n;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    out.push(cx, y, cz, b[0], y, b[1], a[0], y, a[1]);                                  // the top (facing up)
    quad(out, [a[0], y - th, a[1]], [b[0], y - th, b[1]], [b[0], y, b[1]], [a[0], y, a[1]]);
  }
}
/** An ellipse of n corners, semi-axes rx, rz, turned by yaw. */
const ell = (cx, cz, rx, rz, n = 10, yaw = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, u = Math.cos(a) * rx, v = Math.sin(a) * rz; return [cx + u * Math.cos(yaw) - v * Math.sin(yaw), cz + u * Math.sin(yaw) + v * Math.cos(yaw)]; });

function wear(el, { bag }) {
  const worn = [], rub = [];
  const W = (pts, y, th) => patch(worn, pts, y, th);
  // ── the cathedral: the great door's threshold on its brick (the floor's top 0.05), the way to it across the square from the Baptistery's door, the side portals' plinth steps
  const nave0 = DUOMO.c[0] - DUOMO.nave - DUOMO.d / 2, cz = DUOMO.c[1], xw = nave0 - 1.9;
  W(ell(xw + 0.3, cz, 1.4, 1.9, 12), 0.062);                                              // under the leaves, where every foot crosses
  W(ell(xw - 1.6, cz, 1.2, 1.5, 12), 0.062);
  W([[BAPTISTERY[0] + 13.4, cz - 1.0], [-104, cz - 1.5], [-92, cz - 1.6], [-82, cz - 1.45], [xw - 2.4, cz - 1.9], [xw - 2.4, cz + 1.9], [-82, cz + 1.45], [-92, cz + 1.6], [-104, cz + 1.5], [BAPTISTERY[0] + 13.4, cz + 1.0]], 0.052, 0.01);
  const nz0 = cz - DUOMO.w / 2, nz1 = cz + DUOMO.w / 2;
  for (const x of [nave0 + 24, nave0 + 75]) W(ell(x, nz0 - 0.75, 1.2, 0.9, 10), 0.212);   // the north portals (pN: u 24 and 75 from the west end)
  for (const x of [DUOMO.c[0] - DUOMO.d / 2 - 17, DUOMO.c[0] - DUOMO.d / 2 - 62]) W(ell(x, nz1 + 0.75, 1.2, 0.9, 10), 0.212);   // the south ones (u 17 and 62 from the east end)
  // ── the Baptistery's east door, the Gate of Paradise: the threshold step's dish, the worn way out of it, the gilding rubbed off the lowest rail and where the hands push
  const bx = BAPTISTERY[0] + 12.8, bz = BAPTISTERY[1];
  W(ell(bx + 0.62, bz, 0.42, 1.2, 10), 0.312);
  W(ell(bx + 1.6, bz, 0.9, 1.4, 10), 0.056);
  for (const s of [-1, 1]) rub.push([bx + 0.132, 0.31, bz + s * 1.35 - (s < 0 ? 0 : 0), bx + 0.138, 0.47, bz + s * 0.05]);                          // the lowest rail of each leaf
  for (const s of [-1, 1]) rub.push([bx + 0.142, 1.15, bz + s * 0.12 - (s < 0 ? 0.2 : 0), bx + 0.148, 1.6, bz + s * 0.12 + (s > 0 ? 0.2 : 0)]);  // the stiles at the height of a hand
  // ── the Palazzo della Signoria's ringhiera: the three treads before the great door, and the platform's way to it
  const px = PALAZZO[0], pz = PALAZZO[1] + 13.5, D = 4.2, Hh = 1.05;
  [[px - D - 0.2, Hh - Hh / 4], [px - D - 0.6, Hh - 2 * Hh / 4], [px - D - 1.0, Hh - 3 * Hh / 4]].forEach(([x, y], i) => W(ell(x, pz, 0.15, 2.0 - i * 0.15, 10), y + 0.0125));
  W([[px - D + 0.3, pz - 1.4], [px - 1.2, pz - 1.6], [px - 0.1, pz - 1.7], [px - 0.1, pz + 1.7], [px - 1.2, pz + 1.6], [px - D + 0.3, pz + 1.4]], Hh + 0.02 + 0.012);
  if (worn.length) bag.add(WORN, fromTriangles(worn));
  for (const [x0, y0, z0, x1, y1, z1] of rub) bag.add(RUB, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
  // ── the two porphyry columns from Pisa beside the east door [stated: dossier §4; their place and size inferred]
  for (const s of [-1, 1]) {
    const x = bx + 0.75, z = bz + s * 3.8;
    bag.add(POR, lathe([[0.001, 0], [0.5, 0], [0.5, 0.18], [0.36, 0.3], [0.3, 0.45], [0.27, 2.9], [0.31, 3.0], [0.38, 3.12], [0.001, 3.14]], 14, null, x, 0, z));
  }
}
if (STYLES.renaissance) STYLES.renaissance.elements.florence_wear = wear;

/** The plan: near the visitor only. */
export function wearPlans() {
  return [{ id: 'florence-wear', style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, elements: [{ t: 'florence_wear' }] }];
}
