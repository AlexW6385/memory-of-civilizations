// The drum and lantern of Brunelleschi's dome (docs/settlements/florence.md §4, "The dome's crown"): the drum's eight
// round oculi in marble rings under a cornice, and the lantern Michelozzo built from Brunelleschi's design: an
// octagonal marble shaft of arched openings between corner pilasters, eight scrolled buttresses rising from the ribs,
// its cornice, the conical cap, Verrocchio's gilt copper ball of 1471 and the cross. Built in the frame of the
// cathedral's turned bag `TB` (the octagon's corners at angle 0 before its half-turn), like the rest of the crossing.

import { box, lathe, rod, disc } from '../../core/geom.js';

const M = 'marble', GB = 'gilt_bronze', O = 'opening';

/** The drum (apothem of its faces from the vertex radius R0 + 1.5): the round oculi in their rings and the cornice under the dome. dy: the height 4 m above its foot. */
export function drumDetail(TB, cx, cz, R0, dy) {
  const ap = (R0 + 1.5) * Math.cos(Math.PI / 8), yc = dy + 4.5, ro = 2.15, N = 16;
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a), ux = -nz, uz = nx;
    const P = (u, v, d) => [cx + nx * (ap + d) + ux * u, yc + v, cz + nz * (ap + d) + uz * u];
    const g = disc(ro - 0.35, 0, 20); g.rotateZ(-Math.PI / 2); g.translate(ap + 0.12, 0, 0); g.rotateY(-a); g.translate(cx, yc, cz); TB.add(O, g);
    for (let i = 0; i < N; i++) {
      const t0 = i / N * Math.PI * 2, t1 = (i + 1) / N * Math.PI * 2;
      TB.add(M, rod(P(Math.cos(t0) * ro, Math.sin(t0) * ro, 0.16), P(Math.cos(t1) * ro, Math.sin(t1) * ro, 0.16), 0.2, 4));
    }
  }
  // the cornice at the drum's top, projecting under the dome's foot (vertex radii; its inner edge inside the wall)
  TB.add(M, lathe([[R0 + 1.3, 0], [R0 + 2.7, 0], [R0 + 2.7, 0.8], [R0 + 1.3, 0.8]], 8, null, cx, dy + 9 - 0.0, cz));
}

/** The lantern on the dome's crown at height ly (the dome closes at the radius R0 * 0.16 there). */
export function lantern(TB, bag, cx, cz, ly, R0) {
  const r = R0 * 0.2, rb = r + 0.9;                      // the shaft's vertex radius, the plinth's
  // the plinth, the shaft's eight arched openings between corner pilasters, the cornice
  TB.add(M, lathe([[rb, 0], [rb, 1.6], [r + 0.2, 1.9], [0.001, 1.9]], 8, null, cx, ly, cz));
  const y0 = ly + 1.9, hs = 6.6, ap = (r - 0.15) * Math.cos(Math.PI / 8) - 0.05;
  TB.add(M, lathe([[r - 0.15, 0], [r - 0.15, hs], [0.001, hs]], 8, null, cx, y0, cz));
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    // the opening: a dark arched light (a box and a half-round head) in the face's middle, framed in marble
    const w = 1.5, hh = 3.5, head = 12;
    const g = box(ap + 0.0, 0, -w / 2, ap + 0.08, hh, w / 2); g.rotateY(-a); g.translate(cx, y0 + 1.3, cz); TB.add(O, g);
    // the frame: two jambs, a sill and a round head of rods
    for (const sg of [-1, 1]) { const j = box(ap, 0, sg * (w / 2 + 0.1) - 0.1, ap + 0.2, hh + 0.4, sg * (w / 2 + 0.1) + 0.1); j.rotateY(-a); j.translate(cx, y0 + 1.3, cz); TB.add(M, j); }
    const sl = box(ap, 0, -w / 2 - 0.2, ap + 0.3, 0.2, w / 2 + 0.2); sl.rotateY(-a); sl.translate(cx, y0 + 1.1, cz); TB.add(M, sl);
    const nx = c, nz = s, ux = -s, uz = c, yh = y0 + 1.3 + hh;
    const hd = disc(w / 2, 0, 12); hd.rotateZ(-Math.PI / 2); hd.translate(ap + 0.09, 0, 0); hd.rotateY(-a); hd.translate(cx, yh, cz); TB.add(O, hd);
    const P = (u, v, d) => [cx + nx * (ap + d) + ux * u, yh + v, cz + nz * (ap + d) + uz * u];
    for (let i = 0; i < head; i++) {
      const t0 = Math.PI * i / head, t1 = Math.PI * (i + 1) / head;
      TB.add(M, rod(P(Math.cos(t0) * (w / 2 + 0.1), Math.sin(t0) * (w / 2 + 0.1), 0.1), P(Math.cos(t1) * (w / 2 + 0.1), Math.sin(t1) * (w / 2 + 0.1), 0.1), 0.12, 4));
    }
  }
  // the corner pilasters
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const g = box(r - 0.5, 0, -0.32, r + 0.3, hs + 0.4, 0.32); g.rotateY(-a); g.translate(cx, y0, cz); TB.add(M, g);
    // the scroll buttress outside it: a curve from the rib's top up to the shaft, ending in a curl
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([r + 2.6 * (1 - t) ** 1.8 + 0.4, ly - 1.8 + 5.6 * Math.sin(t * Math.PI / 2) ** 1.3]); }
    for (let i = 0; i < 8; i++) TB.add(M, rod([cx + c * pts[i][0], pts[i][1], cz + s * pts[i][0]], [cx + c * pts[i + 1][0], pts[i + 1][1], cz + s * pts[i + 1][0]], 0.42 - i * 0.03, 5));
    const top = pts[8]; TB.add(M, lathe([[0.5, 0], [0.5, 0.15], [0.2, 0.3], [0.001, 0.3]], 6, null, cx + c * (top[0] + 0.05), top[1] - 0.1, cz + s * (top[0] + 0.05)));
  }
  // the cornice, the cap and Verrocchio's ball and the cross
  const yc = y0 + hs;
  TB.add(M, lathe([[r + 0.9, 0], [r + 0.9, 0.35], [r + 0.4, 0.55], [r + 0.4, 0.9], [r - 0.2, 0.9]], 8, null, cx, yc, cz));
  TB.add(M, lathe([[r - 0.2, 0.9], [r - 0.6, 1.5], [r - 1.4, 3.5], [r - 2.6, 6.0], [0.9, 8.2], [0.001, 8.4]], 8, null, cx, yc, cz));
  const yb = yc + 8.4;
  bag.add(GB, lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [Math.sin(t) * 1.15 + 0.001, 1.15 - Math.cos(t) * 1.15]; }), 14, null, cx, yb, cz));
  bag.add(GB, rod([cx, yb + 2.2, cz], [cx, yb + 5.6, cz], 0.12, 6));
  bag.add(GB, rod([cx - 0.9, yb + 4.5, cz], [cx + 0.9, yb + 4.5, cz], 0.1, 6));
}
