// Otto Wagner's Stadtbahn pavilion at the Karlsplatz, 1899 (docs/settlements/vienna.md §1): a steel frame painted apple green
// clad in white marble slabs bolted to it, a shallow barrel roof with deep eaves, the gold sunflower and the gold-patterned
// entrance arch under the eaves, a hall inside with a checkered floor. { at: [x, z] (its centre), rot (0: door to the south), y }.
import { box, lathe } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';

const L = 10.6, B = 6.4, H = 4.3;

export function stadtbahnPavilion(el, { bag, col, lights }) {
  const y = el.y ?? 0, [cx, cz] = el.at, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  // local (p along the long side, q across) → world; rot turns the plan by quarter turns
  const P = (p, q) => [cx + p * c + q * s, cz - p * s + q * c];
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  const ob = (p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + v0, y + v1); };
  const solid = (m, ...q) => { bx(m, ...q); ob(...q); };
  const hl = L / 2, hb = B / 2, GR = 'shutter_green', MB = 'marble', FL = 0.18;
  bx('granite_grey', -hl - 0.15, -hb - 0.15, hl + 0.15, hb + 0.15, -0.5, 0.0);
  bx('granite_grey', -hl - 0.1, -hb - 0.1, hl + 0.1, hb + 0.1, 0.0, FL);
  // the checkered floor
  for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) bx((i + j) % 2 ? 'marble_dark' : 'marble_floor', -hl + 0.3 + i * (L - 0.6) / 9, -hb + 0.3 + j * (B - 0.6) / 5, -hl + 0.3 + (i + 1) * (L - 0.6) / 9, -hb + 0.3 + (j + 1) * (B - 0.6) / 5, FL, FL + 0.02);
  { const a = P(-hl + 0.3, -hb + 0.3), b = P(hl - 0.3, hb - 0.3); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + FL + 0.02); }
  // the walls: marble panels between the frame's posts, the long sides closed, the short ends open to the hall by the door
  const post = (p, q) => solid(GR, p - 0.07, q - 0.07, p + 0.07, q + 0.07, 0, H);
  const panels = 5, pw = L / panels;
  for (const sg of [-1, 1]) for (let k = 0; k < panels; k++) {
    const p0 = -hl + k * pw, p1 = p0 + pw, q = sg * hb;
    solid(MB, p0 + 0.06, q - 0.09, p1 - 0.06, q + 0.09, 0, 0.9); solid(MB, p0 + 0.06, q - 0.09, p1 - 0.06, q + 0.09, 3.0, H - 0.4);
    if (k === 1 || k === 3) { bx('opening', p0 + 0.35, q - 0.05, p1 - 0.35, q + 0.05, 1.0, 2.9); ob(p0 + 0.35, q - 0.09, p1 - 0.35, q + 0.09, 0.9, 3.0); bx(GR, p0 + 0.3, q - 0.08, p1 - 0.3, q + 0.08, 0.9, 1.0); bx(GR, p0 + 0.3, q - 0.08, p1 - 0.3, q + 0.08, 2.9, 3.0); bx(GR, (p0 + p1) / 2 - 0.02, q - 0.08, (p0 + p1) / 2 + 0.02, q + 0.08, 1.0, 2.9); }
    else { solid(MB, p0 + 0.06, q - 0.09, p1 - 0.06, q + 0.09, 0.9, 3.0); for (const [a, b] of [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]]) bx('iron', p0 + pw * a - 0.03, q - 0.11, p0 + pw * a + 0.03, q + 0.11, 0.9 + 2.1 * b - 0.03, 0.9 + 2.1 * b + 0.03); }
    bx('gold', p0 + 0.2, q - 0.1, p1 - 0.2, q + 0.1, H - 0.4, H - 0.34);
  }
  for (let k = 0; k <= panels; k++) for (const sg of [-1, 1]) post(-hl + k * pw, sg * hb);
  // the short ends: the north one closed with marble, the south one the entrance (a door 2.4 m wide, the arch over it in gold pattern)
  for (const sg of [-1, 1]) {
    const p = sg * hl;
    solid(MB, p - 0.09, -hb + 0.06, p + 0.09, hb - 0.06, 0, 0.9); solid(MB, p - 0.09, -hb + 0.06, p + 0.09, hb - 0.06, 3.6, H - 0.4);
    if (sg < 0) solid(MB, p - 0.09, -hb + 0.06, p + 0.09, hb - 0.06, 0.9, 3.6);
    else { solid(MB, p - 0.09, -hb + 0.06, p + 0.09, -1.3, 0.9, 3.6); solid(MB, p - 0.09, 1.3, p + 0.09, hb - 0.06, 0.9, 3.6); solid(GR, p - 0.07, -1.3, p + 0.07, -1.18, 0, 3.6); solid(GR, p - 0.07, 1.18, p + 0.07, 1.3, 0, 3.6);
      bx('gold', p + 0.1, -1.3, p + 0.14, 1.3, 3.5, 3.6);
      // the arch: a ring of gold between the posts
      for (let k = 0; k < 9; k++) { const th = Math.PI * (k + 0.5) / 9, qq = Math.cos(th) * 1.25, vv = 3.6 + Math.sin(th) * 0.5; bx('gold', p + 0.1, qq - 0.08, p + 0.18, qq + 0.08, vv - 0.08, vv + 0.08); }
      bx('opening', p - 0.04, -1.05, p + 0.04, 1.05, 1.0, 3.5); for (const t of [-1, 1]) bx('wood_dark', p - 0.05, t * 0.5 - 0.5 + 0.5 - 0.5, p + 0.05, t * 0.5 + 0.5 - 0.5, 0, 0.02);
    }
    for (const t of [-1, 1]) post(p, t * hb);
    // the sunflower: a gold disc ringed with petals over the entrance, and on the north end
    const q0 = 0, v0 = H - 0.9;
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, qq = Math.cos(a) * 0.38, vv = v0 + Math.sin(a) * 0.38; bx('gold', p + (sg < 0 ? -0.14 : 0.1), qq - 0.07, p + (sg < 0 ? -0.09 : 0.15), qq + 0.07, vv - 0.07, vv + 0.07); }
    bx('gilt_bronze', p + (sg < 0 ? -0.15 : 0.1), q0 - 0.2, p + (sg < 0 ? -0.09 : 0.16), q0 + 0.2, v0 - 0.2, v0 + 0.2);
  }
  // the roof: a shallow barrel vault on the frame with deep eaves, covered in grey metal; a gold-patterned fascia
  const ov = 0.9, rise = 0.75, n = 8, pe = hl + ov;
  for (let k = 0; k < n; k++) {
    const t0 = -1 + 2 * k / n, t1 = -1 + 2 * (k + 1) / n, h = (t) => H + rise * (1 - t * t), q0 = t0 * (hb + ov), q1 = t1 * (hb + ov);
    const hh0 = h(t0), hh1 = h(t1), top = Math.max(hh0, hh1);
    bx('lead', -pe, q0, pe, q1, Math.min(hh0, hh1) - 0.12, top);
  }
  for (const sg of [-1, 1]) bx('gold', -pe, sg * (hb + ov) - 0.05, pe, sg * (hb + ov) + 0.05, H - 0.02, H + 0.14);
  lights?.push({ at: [cx, y + 3.4, cz], color: '#ffe7b8', intensity: 6, distance: 9 });
  void lathe; void subtractRects;
}
