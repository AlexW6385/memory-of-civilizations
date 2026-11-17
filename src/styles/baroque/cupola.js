// The dome of St Peter's as it shows outside (docs/settlements/baroque-rome.md §4, "The dome"): the drum on its
// base with sixteen pairs of Corinthian columns, between them sixteen windows under triangular and segmental
// pediments, the entablature and the attic; the pointed outer shell of della Porta in lead with sixteen tapering
// ribs and three tiers of dormers; the lantern with sixteen columns, scroll buttresses, a small ribbed cupola, the
// gilt ball and the cross, the whole at 136.6 m above the piazza.
import { box, lathe } from '../../core/geom.js';
import { ext } from '../renaissance/face.js';

const T = 'travertine', L = 'lead', GB = 'gilt_bronze', O = 'opening';

/** Rotates a piece built in the frame of the bay at polar angle a (x along the drum, y up, z outward) into place about (cx, dy, cz). */
function bay(g, a, cx, dy, cz) { g.rotateY(Math.PI / 2 - a); g.translate(cx, dy, cz); return g; }

/** cupola: the drum from dy (the attic's top of the church), R0 the dome's inner radius (21 m). Returns the height of the cross's tip above dy. */
export function cupola(bag, { cx, cz, dy, R0, IN }) {
  const Rw = R0 + 1.6, Rc = R0 + 2.5;
  // the drum: base, the wall behind the columns, the entablature, the attic
  const DH = 29;
  bag.add(T, lathe([[R0 + 3.3, 0], [R0 + 3.3, 5.8], [R0 + 3.7, 5.8], [R0 + 3.7, 6.1], [Rw, 6.1], [Rw, 21.9], [R0 + 3.4, 21.9], [R0 + 3.4, 23.1], [R0 + 3.1, 23.1], [R0 + 3.1, 24.5], [R0 + 3.8, 24.5], [R0 + 3.8, 24.8], [R0 + 4.4, 24.8], [R0 + 4.4, 25.3], [R0 + 3.9, 25.45], [R0 + 2.6, 25.45], [R0 + 2.6, 28.5], [R0 + 3.1, 28.5], [R0 + 3.1, DH], [R0 + 1.0, DH], ...(IN ? [] : [[0.001, DH]])], 64, null, cx, dy, cz));
  // sixteen pairs of columns on the base, a Corinthian capital over a tapering shaft
  const col = [[1.0, 0], [1.0, 0.3], [0.8, 0.38], [0.88, 0.5], [0.8, 0.62], [0.66, 0.7], [0.62, 7], [0.58, 14.1], [0.7, 14.2], [0.78, 14.55], [0.9, 15.0], [1.0, 15.45], [1.05, 15.55], [1.12, 15.55], [1.12, 15.8], [0.001, 15.8]];
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2;
    for (const d of [-0.052, 0.052]) bag.add(T, lathe(col, 10, (th) => 1 + 0.0007 * (k % 4), cx + Math.cos(a + d) * Rc, dy + 6.1, cz + Math.sin(a + d) * Rc));
    // between the pairs a window under a triangular or a segmental pediment, framed by pilasters and a hood
    const aw = a + Math.PI / 16, wy = 9.6, wh = 8.6, ww = 2.7, hw = ww / 2, zf = Rw;
    const add = (m, g) => bag.add(m, bay(g, aw, cx, dy, cz));
    add(O, box(-hw, wy, zf - 0.08, hw, wy + wh, zf + 0.12));
    for (const s of [-1, 1]) { add(T, box(s * (hw + 0.2) - 0.2, wy - 0.3, zf - 0.05, s * (hw + 0.2) + 0.2, wy + wh + 0.3, zf + 0.35)); }
    add(T, box(-hw - 0.5, wy - 0.45, zf - 0.05, hw + 0.5, wy - 0.15, zf + 0.5));                         // sill
    add(T, box(-hw - 0.5, wy + wh + 0.3, zf - 0.05, hw + 0.5, wy + wh + 0.6, zf + 0.5));                 // hood
    const base = wy + wh + 0.6, pw = hw + 0.5, pts = [];
    if (k % 2 === 0) pts.push([-pw, 0], [pw, 0], [0, 1.35]);                                             // triangular
    else { for (let i = 0; i <= 10; i++) { const t = i / 10 * Math.PI; pts.push([pw * Math.cos(Math.PI - t), 0.04 + 1.0 * Math.sin(t)]); } }   // segmental
    const ped = ext(pts, [], zf - 0.05, zf + 0.4, 1); ped.translate(0, base, 0); add(T, ped);
    // a tympanum recess is not cut; the field shows as a darker slab in the pediment's middle
    add(T, box(-0.3, base + 0.1, zf + 0.3, 0.3, base + 0.45, zf + 0.5));
  }
  // the dome: a pointed ellipse (a 21.9 m, b 33.8 m) from the attic to the lantern's foot at 32.5 m
  const yS = DH, ra = R0 + 0.9, hb = 33.8, Hd = 32.5, rAt = (h) => ra * Math.sqrt(Math.max(0, 1 - (h / hb) ** 2)), N = 18;
  const prof = []; for (let i = 0; i <= N; i++) { const h = Hd * i / N; prof.push([rAt(h), h]); }
  bag.add(L, lathe(prof, 64, null, cx, dy + yS, cz));
  // sixteen ribs, tapering from 1.5 m to 0.8 m, standing 0.22 m out of the shell
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2;
    for (let i = 0; i < N; i++) {
      const h0 = Hd * i / N, h1 = Hd * (i + 1) / N, r0 = rAt(h0) + 0.1, r1 = rAt(h1) + 0.1, w = 0.75 - 0.3 * (i + 0.5) / N, len = Math.hypot(r0 - r1, h1 - h0);
      const g = box(-w, 0, -0.17, w, len + 0.06, 0.17); g.rotateZ(Math.atan2(r0 - r1, h1 - h0)); g.translate(r0, h0, 0);
      g.rotateY(-a); g.translate(cx, dy + yS, cz); bag.add(T, g);
    }
  }
  // dormers between the ribs in three tiers, the lowest the largest
  for (const [f, sc] of [[0.22, 1.0], [0.5, 0.8], [0.76, 0.62]]) {
    const h = Hd * f, r = rAt(h);
    for (let k = 0; k < 16; k++) {
      const a = (k + 0.5) / 16 * Math.PI * 2, w = 0.55 * sc, hh = 1.9 * sc, z0 = r - 0.5;
      const g = (m, p) => bag.add(m, bay(p, a, cx, dy + yS + h, cz));
      g(T, box(-w - 0.15, 0, z0, w + 0.15, hh, z0 + 1.0 * sc));
      g(O, box(-w, 0.25 * sc, z0 + 1.0 * sc, w, hh - 0.25 * sc, z0 + 1.0 * sc + 0.05));
      const p = ext([[-w - 0.3, 0], [w + 0.3, 0], [0, 0.75 * sc]], [], z0, z0 + 1.1 * sc, 1); p.translate(0, hh, 0); g(T, p);
    }
  }
  // the lantern: a base with sixteen scroll buttresses, sixteen columns before a wall with tall windows, entablature, attic
  const ly = dy + yS + Hd, rl = 5.4;
  bag.add(T, lathe([[rl + 0.8, 0], [rl + 0.8, 0.9], [rl + 0.4, 1.0], [rl + 0.2, 2.4], [rl - 0.3, 2.4], [rl - 0.3, 2.6], [rl - 0.7, 2.6]], 32, null, cx, ly, cz));
  bag.add(T, lathe([[rl - 1.1, 2.6], [rl - 1.1, 10.2], [rl - 0.4, 10.2]], 32, null, cx, ly, cz));          // the wall behind the columns
  const lc = [[0.38, 0], [0.38, 0.22], [0.3, 0.3], [0.27, 0.45], [0.25, 6.8], [0.31, 6.9], [0.35, 7.35], [0.43, 7.6], [0.001, 7.6]];
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    bag.add(T, lathe(lc, 8, () => 1 + 0.001 * (k % 2), cx + ca * (rl - 0.4), ly + 2.6, cz + sa * (rl - 0.4)));
    const ab = a + Math.PI / 16, wb = box(-0.55, 2.9, -0.06, 0.55, 9.4, 0.06);
    wb.translate(0, 0, rl - 1.12); wb.rotateY(Math.PI / 2 - ab); wb.translate(cx, ly, cz); bag.add(O, wb);       // (the window between the columns)
  }
  // scroll buttresses as wedges: a block 0.6 m wide that rises 2.4 m at the lantern's wall and runs out on the shell
  for (let k = 0; k < 16; k++) {
    const a = (k + 0.5) / 16 * Math.PI * 2, g = box(-0.3, -1.4, 0, 0.3, 2.4, 1.2); g.translate(0, 0, rl + 0.1);
    g.rotateY(Math.PI / 2 - a); g.translate(cx, ly, cz); bag.add(T, g);
  }
  const ey = ly + 10.2;
  bag.add(T, lathe([[rl + 0.5, 0], [rl + 0.5, 0.5], [rl + 0.2, 0.55], [rl + 0.2, 1.1], [rl + 0.85, 1.1], [rl + 0.85, 1.4], [rl + 0.5, 1.5], [rl - 0.5, 1.5]], 32, null, cx, ey, cz));   // entablature
  bag.add(T, lathe([[rl - 0.5, 1.5], [rl - 0.5, 2.3], [rl + 0.1, 2.3], [rl + 0.1, 2.5], [rl - 0.3, 2.6]], 32, null, cx, ey, cz));   // attic
  // the lantern's cupola: an ogee of lead with sixteen small ribs, then the ball and the cross
  const cy = ey + 2.6, cup = [[rl - 0.3, 0], [rl - 0.8, 0.9], [rl - 1.9, 1.9], [rl - 3.2, 2.7], [0.7, 4.3], [0.5, 4.6], [0.001, 4.8]];
  bag.add(L, lathe(cup, 32, null, cx, cy, cz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; for (let i = 0; i + 1 < 4; i++) { const [r0, h0] = cup[i], [r1, h1] = cup[i + 1], len = Math.hypot(r0 - r1, h1 - h0); const g = box(-0.07, 0, -0.07, 0.07, len + 0.05, 0.07); g.rotateZ(Math.atan2(r0 - r1, h1 - h0)); g.translate(r0 + 0.05, h0, 0); g.rotateY(-a); g.translate(cx, cy, cz); bag.add(T, g); } }
  const by = cy + 4.7;
  bag.add(GB, lathe([[0.001, 0], [0.55, 0.25], [0.95, 0.9], [0.95, 1.15], [0.5, 1.75], [0.001, 1.9]], 16, null, cx, by, cz));               // the ball
  bag.add(GB, box(cx - 0.1, by + 1.8, cz - 0.1, cx + 0.1, by + 4.1, cz + 0.1)); bag.add(GB, box(cx - 0.8, by + 3.1, cz - 0.09, cx + 0.8, by + 3.3, cz + 0.09));   // the cross
  return by + 4.1 - dy;
}
