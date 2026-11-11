// Street life's furniture (docs/settlements/vienna.md §5): the Naschmarkt's stalls under striped awnings with boxes of vegetables
// and fruit, the gas lamp of the older streets, the park bench, the Fiaker rank's water trough.
import { box, lathe } from '../../core/geom.js';
import { faceFrame, fbox } from '../dutch/facade.js';
import { rng } from './mietshaus.js';

const GOODS = ['cloth_green', 'cloth_red', 'paint_ochre', 'glaze_yellow', 'terracotta', 'cloth_green', 'cloth_maroon', 'linen'];
/** naschmarkt_stall: { rect, front ('n'|'s'), y, seed } — a stall 3–4 m wide: a counter with crates of produce, a striped awning on poles, a hanging scale. */
export function naschmarktStall(el, { bag, col }) {
  const r = rng(el.seed || 3), y = el.y ?? 0, f = el.front ?? 's', F = faceFrame(el.rect, f), w = F.w, D = F.D;
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  const stripe = [['cloth_white', 'cloth_red'], ['cloth_white', 'cloth_green'], ['cloth_white', 'cloth_blue']][Math.floor(r() * 2)];
  // the back: a plank wall and a shelf; the counter; the crates in a row on it and on the ground before it
  A('wood_dark', 0.05, w - 0.05, 0, 2.3, D - 0.12, D - 0.04); A('wood_ochre', 0.2, w - 0.2, 1.2, 1.26, D - 0.5, D - 0.12); A('wood_ochre', 0.2, w - 0.2, 1.7, 1.76, D - 0.5, D - 0.12);
  A('wood_ochre', 0.0, w, 0, 0.85, D * 0.45, D * 0.45 + 0.7); A('wood_dark', -0.02, w + 0.02, 0.85, 0.9, D * 0.45 - 0.05, D * 0.45 + 0.75);
  const n = Math.max(2, Math.round(w / 0.9)), cw = w / n;
  for (let k = 0; k < n; k++) {
    const u = k * cw, m = GOODS[Math.floor(r() * GOODS.length)], m2 = GOODS[Math.floor(r() * GOODS.length)];
    A('wood_ochre', u + 0.08, u + cw - 0.08, 0.9, 1.08, D * 0.45 + 0.02, D * 0.45 + 0.68); A(m, u + 0.12, u + cw - 0.12, 1.08, 1.2 + r() * 0.1, D * 0.45 + 0.06, D * 0.45 + 0.64);
    A('wood_ochre', u + 0.1, u + cw - 0.1, 0, 0.3, D * 0.45 + 0.8, D * 0.45 + 1.3); A(m2, u + 0.14, u + cw - 0.14, 0.3, 0.38 + r() * 0.08, D * 0.45 + 0.84, D * 0.45 + 1.26);
    A(GOODS[Math.floor(r() * GOODS.length)], u + 0.15, u + cw - 0.15, 1.26, 1.5 + r() * 0.2, D - 0.45, D - 0.15);
  }
  // the poles and the awning (stripes of 0.3 m along the front, the valance hanging)
  for (const u of [0.04, w - 0.04]) A('wood_dark', u - 0.04, u + 0.04, 0, 2.5, D * 0.45 + 0.9, D * 0.45 + 0.98);
  const sw = 0.32;
  for (let u = 0, k = 0; u < w; u += sw, k++) { const u1 = Math.min(w, u + sw); A(stripe[k % 2], u, u1, 2.45, 2.52, D - 0.4, D * 0.45 + 1.4); A(stripe[k % 2], u, u1, 2.12, 2.45, D * 0.45 + 1.36, D * 0.45 + 1.4); }
  A('iron', w * 0.5 - 0.02, w * 0.5 + 0.02, 1.9, 2.45, D * 0.45 + 0.4, D * 0.45 + 0.44);
  const a = F.at(0, D * 0.45), b = F.at(w, D * 0.45 + 1.4);
  col.rect([Math.min(a[0], F.at(w, D * 0.45 + 0.7)[0]), Math.min(a[1], F.at(w, D * 0.45 + 0.7)[1]), Math.max(a[0], F.at(w, D * 0.45 + 0.7)[0]), Math.max(a[1], F.at(w, D * 0.45 + 0.7)[1])], y, y + 1.2);
  void b;
}
/** gaslamp: { at: [x, z], y } — the cast-iron post with its lantern, 3.8 m. */
export function gaslamp(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('iron', lathe([[0.001, 0], [0.2, 0], [0.18, 0.5], [0.1, 0.7], [0.07, 1.0], [0.06, 3.2], [0.1, 3.3], [0.001, 3.3]], 8, null, x, y, z));
  bag.add('iron', box(x - 0.22, y + 3.3, z - 0.22, x + 0.22, y + 3.38, z + 0.22));
  bag.add('lamp_glass', box(x - 0.18, y + 3.38, z - 0.18, x + 0.18, y + 3.85, z + 0.18));
  bag.add('iron', box(x - 0.26, y + 3.85, z - 0.26, x + 0.26, y + 3.9, z + 0.26)); bag.add('iron', lathe([[0.2, 3.9], [0.05, 4.05], [0.001, 4.1]], 4, null, x, y, z));
  col.circle(x, z, 0.2, y, y + 3.3);
}
/** bench: { at: [x, z], y, rot (0: along x, seat facing south) } — slatted seat and back on iron ends. */
export function bench(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const P = (p, q) => [x + p * c + q * s, z - p * s + q * c];
  const bx = (m, p0, q0, p1, q1, v0, v1) => { const a = P(p0, q0), b = P(p1, q1); bag.add(m, box(Math.min(a[0], b[0]), y + v0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + v1, Math.max(a[1], b[1]))); };
  for (const sg of [-1, 1]) bx('iron', sg * 0.8 - 0.04, -0.25, sg * 0.8 + 0.04, 0.25, 0, 0.8);
  for (let k = 0; k < 4; k++) bx('wood_painted', -0.9, -0.23 + k * 0.11, 0.9, -0.14 + k * 0.11, 0.44, 0.48);
  for (let k = 0; k < 3; k++) bx('wood_painted', -0.9, -0.27, 0.9, -0.23, 0.55 + k * 0.12, 0.62 + k * 0.12);
  const a = P(-0.95, -0.3), b = P(0.95, 0.3); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 0.9);
}
