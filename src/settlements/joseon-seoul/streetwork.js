// The street furniture of Gojong's Hanyang that the shared life elements do not have (docs/settlements/joseon-seoul.md §19.1): the hamabi,
// the stone that told those who came on horse to dismount before the palace gate. An element of the joseon style, registered here (the style
// file stays as it was); placed in the palace plan by index.js. Built facing +z, placed by `at` and `face`.
import { STYLES } from '../../core/build.js';
import { box, fromTriangles, orientOutward } from '../../core/geom.js';
import { Parts } from '../../styles/qing/carving.js';

/**
 * hamabi { at: [x, z], face: [fx, fz] (toward the road), y, text? }: a granite stele 0.5 m wide, 0.18 m thick and 1.3 m high with a hipped cap, on a
 * two-step base (a foot slab and a plinth), the face's panel cut shallow for the characters. [inferred: the form of Joseon's dismount markers
 * as photographed at the royal shrines and palaces; the size is ours]
 */
function hamabi(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, f = el.face ?? [0, 1], yaw = Math.atan2(f[0], f[1]), g = 'granite_korea', P = new Parts();
  P.add(g, box(-0.5, 0, -0.38, 0.5, 0.14, 0.38)); P.add(g, box(-0.4, 0.14, -0.3, 0.4, 0.3, 0.3));
  const w = 0.25, d = 0.09, h0 = 0.3, h1 = 1.5, t = [], q = (a, b, c, e) => t.push(...a, ...b, ...c, ...a, ...c, ...e);
  // the shaft, a little narrower toward the top, and the cap: four sloping faces to a short ridge
  const A = [-w, h0, -d], B = [w, h0, -d], C = [w, h0, d], D = [-w, h0, d], s = 0.03, A2 = [-w + s, h1 - 0.16, -d + 0.01], B2 = [w - s, h1 - 0.16, -d + 0.01], C2 = [w - s, h1 - 0.16, d - 0.01], D2 = [-w + s, h1 - 0.16, d - 0.01];
  q(A, B, B2, A2); q(B, C, C2, B2); q(C, D, D2, C2); q(D, A, A2, D2);
  P.add(g, fromTriangles(orientOutward(t)));
  const u = [], r = (a, b, c, e) => u.push(...a, ...b, ...c, ...a, ...c, ...e), ov = 0.05, z0 = d + 0.02;
  const a0 = [-w + s - ov, h1 - 0.16, -z0], b0 = [w - s + ov, h1 - 0.16, -z0], c0 = [w - s + ov, h1 - 0.16, z0], d0 = [-w + s - ov, h1 - 0.16, z0], a1 = [-0.09, h1, -0.04], b1 = [0.09, h1, -0.04], c1 = [0.09, h1, 0.04], d1 = [-0.09, h1, 0.04];
  r(a0, b0, b1, a1); r(b0, c0, c1, b1); r(c0, d0, d1, c1); r(d0, a0, a1, d1); r(d0, c0, b0, a0);
  P.add(g, fromTriangles(orientOutward(u)));
  // the panel on the face: a frame of four strips round a recess
  const pf = d + 0.004, y0p = h0 + 0.2, y1p = h1 - 0.3;
  for (const [a, b, c, e] of [[-w + 0.04, w - 0.04, y0p - 0.03, y0p], [-w + 0.04, w - 0.04, y1p, y1p + 0.03], [-w + 0.04, -w + 0.07, y0p, y1p], [w - 0.07, w - 0.04, y0p, y1p]]) P.add(g, box(a, c, pf, b, e, pf + 0.02));
  P.emit(bag, x, y, z, yaw);
  col.rect([x - 0.5, z - 0.38, x + 0.5, z + 0.38], y, y + h1);
}

/** Register the elements (idempotent). */
export function registerStreet() {
  if (STYLES.joseon) STYLES.joseon.elements.hamabi = hamabi;
}
registerStreet();
