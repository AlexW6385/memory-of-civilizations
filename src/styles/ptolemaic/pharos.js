// The Pharos of Alexandria (docs/settlements/alexandria.md §3): the lighthouse of Sostratos of Knidos, finished about 280 BC,
// of three tiers each leaning a little in — a square tower of limestone with a granite foot and a Triton on each corner, an
// octagon, a cylinder carrying the lantern, the fire and the polished mirror, and on the top the statue of Zeus Soter.
// Square 30 m at the foot [stated: Arab accounts], octagon 16.4 m across, cylinder 8.7 m, lantern chamber 4.3 m [stated]; the
// heights 56 / 28 / 10 m [inferred from Thiersch]; about 104 m with the statue. Registered into the `ptolemaic` style.

import { box, lathe, rod, frustum, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

/** An eight-sided tapering prism (flat across `w` at the foot, `w2` at the top), turned so that a face looks along +z. */
function octagon(x, y0, y1, z, w, w2) {
  const R = (a) => a / 2 / Math.cos(Math.PI / 8), g = lathe([[R(w), 0], [R(w2), y1 - y0]], 8, null, 0, 0, 0);
  g.rotateY(Math.PI / 8); g.translate(x, y0, z); return g;
}
function triton(bag, x, y, z, yaw) {
  const g = lathe([[0.001, 0], [0.5, 0.05], [0.42, 0.9], [0.3, 1.5], [0.34, 2.1], [0.2, 2.5], [0.18, 3.0], [0.001, 3.1]], 8, null, 0, 0, 0);
  g.rotateY(yaw); g.translate(x, y, z); bag.add('bronze', g);
  const t = rod([x + Math.cos(yaw) * 0.2, y + 2.8, z - Math.sin(yaw) * 0.2], [x + Math.cos(yaw) * 0.9, y + 3.6, z - Math.sin(yaw) * 0.9], 0.05, 5);   // the horn (a conch)
  bag.add('bronze', t);
}
/**
 * pharos: { c [x, z], y (the ground), base (30) }. The podium and its steps, the tower, its windows, the door, the Tritons.
 */
function pharos(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 1.2, B = el.base ?? 30, h = B / 2;
  const S = STYLES.ptolemaic.elements;
  // the podium: three steps of limestone about the tower, the paving round it
  S.krepis({ rect: [cx - h - 4, cz - h - 4, cx + h + 4, cz + h + 4], y0: y, steps: 3, rise: 0.22, tread: 0.5, mat: 'limestone' }, ctx);
  const y0 = y + 0.66, H1 = 56, inset1 = 2.2;
  // tier 1: the foot of granite (the great blocks), then limestone; leaning in 2.2 m each side
  bag.add('granite_grey', box(cx - h - 0.5, y0 - 0.3, cz - h - 0.5, cx + h + 0.5, y0 + 4.0, cz + h + 0.5));
  bag.add('limestone', frustum([cx - h, cz - h, cx + h, cz + h], y0 + 4.0, y0 + H1, inset1, inset1, inset1, inset1));
  col.rect([cx - h - 0.5, cz - h - 0.5, cx + h + 0.5, cz + h + 0.5], y0 - 0.3, y0 + 8);
  // the string-courses (a moulded band at each fifth of the height), proud 0.3 m, and windows: tall narrow slits in the four faces
  const lean = (yy) => inset1 * (yy - 4.0) / (H1 - 4.0);
  for (const f of [0.22, 0.46, 0.7, 0.92]) {
    const yy = y0 + 4 + f * (H1 - 4), q = h - lean(yy) + 0.3;
    bag.add('limestone', box(cx - q, yy, cz - q, cx + q, yy + 0.45, cz + q));
  }
  for (const [k, f] of [[0, 0.1], [1, 0.34], [2, 0.58], [3, 0.82]]) {
    const yy = y0 + 4 + f * (H1 - 4), q = h - lean(yy);
    for (const s of [-1, 1]) for (const u of [-6, 0, 6]) {
      bag.add('opening', box(cx + u - 0.4, yy, cz + s * q - (s > 0 ? 0.05 : -0.0) - 0.05, cx + u + 0.4, yy + 2.2, cz + s * q + 0.05 + (s > 0 ? 0.0 : 0)));
      bag.add('opening', box(cx + s * q - 0.05, yy, cz + u - 0.4, cx + s * q + 0.05, yy + 2.2, cz + u + 0.4));
    }
    void k;
  }
  // the door on the harbour side (south): a great lintelled doorway of granite with the leaves of cedar shut within
  { const zf = cz + h + 0.5, dx = cx;
    bag.add('granite_grey', box(dx - 3.4, y0, zf, dx - 2.4, y0 + 7.2, zf + 0.9)); bag.add('granite_grey', box(dx + 2.4, y0, zf, dx + 3.4, y0 + 7.2, zf + 0.9));
    bag.add('granite_grey', box(dx - 3.7, y0 + 6.2, zf, dx + 3.7, y0 + 7.4, zf + 1.1));
    bag.add('limestone', box(dx - 4.0, y0 + 7.4, zf, dx + 4.0, y0 + 7.9, zf + 1.3));
    bag.add('cedar', box(dx - 2.4, y0, zf + 0.0, dx + 2.4, y0 + 6.2, zf + 0.5));
    for (let k = 0; k < 3; k++) for (const s of [-1, 1]) bag.add('bronze', box(dx + s * 1.2 - 0.3, y0 + 1.4 + k * 1.7, zf + 0.5, dx + s * 1.2 + 0.3, y0 + 1.8 + k * 1.7, zf + 0.56));
    col.rect([dx - 2.4, zf, dx + 2.4, zf + 0.5], y0, y0 + 6.2); }
  // the Zeus inscription over the door, a band of lettered stone on the seaward face
  bag.add('marble_smooth', box(cx - 5, y0 + 9.0, cz + h - lean(y0 + 9.0) + 0.0, cx + 5, y0 + 9.9, cz + h - lean(y0 + 9.0) + 0.14));
  // the platform on the tier: a slab with a parapet, a Triton on each corner
  const yt = y0 + H1, q1 = h - inset1;
  bag.add('limestone', box(cx - q1 - 0.5, yt, cz - q1 - 0.5, cx + q1 + 0.5, yt + 0.5, cz + q1 + 0.5));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) triton(bag, cx + sx * (q1 - 0.5), yt + 0.5, cz + sz * (q1 - 0.5), Math.atan2(sx, sz));
  // tier 2: the octagon, 16.4 m across at the foot; windows in four faces; a cornice
  const H2 = 28, y2 = yt + 0.5;
  bag.add('limestone', octagon(cx, y2, y2 + H2, cz, 16.4, 14.6));
  for (const f of [0.2, 0.5, 0.8]) for (let a = 0; a < 8; a++) {
    const ang = a * Math.PI / 4, rr = (16.4 - 1.8 * f) / 2 + 0.03;
    bag.add('opening', box(cx + Math.sin(ang) * rr - 0.35, y2 + f * H2, cz + Math.cos(ang) * rr - 0.35, cx + Math.sin(ang) * rr + 0.35, y2 + f * H2 + 1.8, cz + Math.cos(ang) * rr + 0.35));
  }
  bag.add('limestone', octagon(cx, y2 + H2, y2 + H2 + 0.7, cz, 16.0, 17.4));
  // tier 3: the cylinder, 8.7 m across; the lantern gallery on it
  const y3 = y2 + H2 + 0.7, H3 = 10;
  bag.add('limestone', lathe([[4.5, 0], [4.15, H3]], 20, null, cx, y3, cz));
  bag.add('limestone', lathe([[4.5, H3], [5.3, H3], [5.3, H3 + 0.4], [0.001, H3 + 0.4]], 20, null, cx, y3, cz));
  // the lantern: eight columns of marble round the fire, a dome of lead; the fire's bowl, the flame, the bronze mirror
  const yl = y3 + H3 + 0.4, HL = 4.2;
  for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4; bag.add('marble_column', lathe([[0.2, 0], [0.17, HL]], 8, null, cx + Math.sin(ang) * 2.0, yl, cz + Math.cos(ang) * 2.0)); }
  bag.add('marble', lathe([[2.5, HL], [2.5, HL + 0.35], [0.001, HL + 0.35]], 16, null, cx, yl, cz));
  bag.add('lead', lathe([[2.5, HL + 0.35], [2.2, HL + 0.9], [1.2, HL + 1.8], [0.4, HL + 2.3], [0.001, HL + 2.4]], 16, null, cx, yl, cz));
  bag.add('bronze', lathe([[0.7, 0.0], [0.9, 0.5], [0.8, 0.6], [0.001, 0.4]], 12, null, cx, yl + 0.2, cz));
  bag.add('flame', lathe([[0.001, 0], [0.55, 0.05], [0.3, 1.1], [0.001, 2.2]], 8, null, cx, yl + 0.8, cz));
  bag.add('silver', box(cx + 0.9, yl + 0.5, cz - 0.9, cx + 1.0, yl + 2.5, cz + 0.9));                             // the mirror
  if (ctx.lights) ctx.lights.push({ at: [cx, yl + 1.6, cz], color: '#ffb260', intensity: 60, distance: 140 });
  // on the dome, the statue of Zeus Soter: a standing figure on a drum, the cloak, the raised arm with the sceptre
  const ys = yl + HL + 2.4;
  bag.add('bronze', lathe([[0.7, 0], [0.7, 0.5], [0.001, 0.5]], 10, null, cx, ys, cz));
  bag.add('bronze', lathe([[0.001, 0.5], [0.8, 0.55], [0.7, 1.9], [0.5, 3.0], [0.55, 3.6], [0.3, 3.9], [0.32, 4.6], [0.001, 4.75]], 10, null, cx, ys, cz));
  bag.add('bronze', rod([cx + 0.4, ys + 3.4, cz], [cx + 1.3, ys + 5.4, cz], 0.07, 5));
  bag.add('bronze', rod([cx + 1.3, ys + 5.4, cz], [cx + 1.3, ys + 3.0, cz], 0.04, 5));
  void fromTriangles;
}
export const PHAROS_EL = { pharos };
