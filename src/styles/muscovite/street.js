// What stood at the crossings of the posad's streets about 1600 (docs/settlements/muscovy.md §5.4): the street well
// with its log frame, windlass and bucket under a small plank roof; the wayside chapel (chasovnya), a small open
// log shrine with an icon, a lamp and a gabled roof topped by a cross; the tall wooden wayside cross with its
// cap and its stone footing. All boxes and a few lathes, merged by the style's bag.

import { box, lathe, rod } from '../../core/geom.js';
import { hexa, pitched } from '../norse/index.js';

const LOG = 'log_pine';
const W = [[0, 1], [1, 0], [0, -1], [-1, 0]];                                       // the way each shrine faces: south, east, north, west

/** wayside: { kind: 'well' | 'chasovnya' | 'cross', c: [x, z], y, face: 0..3 } */
export function wayside(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, f = (el.face ?? 0) & 3, [wx, wz] = W[f], ux = -wz, uz = wx;
  const P = (u, v, w) => [cx + ux * u + wx * w, y + v, cz + uz * u + wz * w];
  const B = (u0, u1, v0, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); return box(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])); };
  const add = (m, ...a) => bag.add(m, B(...a));
  const C = (u0, u1, w0, w1, v0, v1) => { const a = P(u0, 0, w0), b = P(u1, 0, w1); col.rect([Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])], y + v0, y + v1); };
  const ridgeX = (alongU) => (alongU ? wz !== 0 : wx !== 0);                           // is a ridge along u (or along w) a ridge along the x axis
  if (el.kind === 'well') {
    // the log frame (srub) of four courses' height, the black of the water inside, the two posts with the windlass, the bucket on its rope
    add(LOG, -0.62, 0.62, -0.3, 0.9, -0.62, -0.38); add(LOG, -0.62, 0.62, -0.3, 0.9, 0.38, 0.62); add(LOG, -0.62, -0.38, -0.3, 0.9, -0.38, 0.38); add(LOG, 0.38, 0.62, -0.3, 0.9, -0.38, 0.38);
    for (let v = -0.02; v < 0.88; v += 0.3) add('wood_dark', -0.635, 0.635, v, v + 0.03, -0.635, 0.635);
    add('cloth_black', -0.38, 0.38, 0.5, 0.52, -0.38, 0.38);
    add('timber', -0.9, 0.9, 0.9, 0.96, -0.7, -0.64); add('timber', -0.9, 0.9, 0.9, 0.96, 0.64, 0.7);             // the kerb planks the buyers stand on... laid on the frame's sides
    for (const u of [-0.78, 0.78]) add('timber', u - 0.07, u + 0.07, -0.3, 2.2, -0.07, 0.07);
    { const a = P(-0.78, 1.55, 0), b = P(0.78, 1.55, 0); bag.add('timber', rod(a, b, 0.1, 8)); const c = P(0.78, 1.55, 0); bag.add('iron', rod(c, P(0.98, 1.55, 0), 0.02, 5)); bag.add('iron', rod(P(0.98, 1.55, 0), P(0.98, 1.3, 0.25), 0.02, 5)); }
    add('rope_fibre', -0.02, 0.02, 1.0, 1.52, -0.02, 0.02); bag.add('timber', lathe([[0.001, 0], [0.13, 0], [0.15, 0.25], [0.001, 0.25]], 8, null, ...P(0, 0.82, 0))); bag.add('iron', lathe([[0.152, 0.08], [0.152, 0.12], [0.001, 0.12]], 8, null, ...P(0, 0.82, 0)));
    // the small plank roof over the posts, ridge across them
    { const a = P(-0.95, 0, -0.6), b = P(0.95, 0, 0.6), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; pitched(bag, 'planks_grey', 'planks_grey', r, y + 2.2, 0.8, 0.25, ridgeX(true), 0.06); }
    // a drinking trough and a bucket on the kerb beside the well
    add('timber', 0.8, 1.7, -0.3, 0.45, 0.8, 1.2); add('cloth_black', 0.9, 1.6, 0.44, 0.45, 0.88, 1.12); add('timber', 0.8, 1.7, 0.2, 0.3, 0.76, 0.8);
    bag.add('timber', lathe([[0.001, 0], [0.12, 0], [0.14, 0.24], [0.001, 0.24]], 8, null, ...P(-0.9, 0.96, 0.75)));
    C(-0.65, 0.65, -0.65, 0.65, -0.3, 0.9); C(0.75, 1.75, 0.75, 1.25, -0.3, 0.45);
  } else if (el.kind === 'chasovnya') {
    // a small open log shrine on a plank base: back and side walls of logs, two front posts under a lintel, the icon on the back wall with its shelf and lamp
    add('planks_grey', -1.2, 1.2, -0.3, 0.3, -1.2, 1.2); add('planks_grey', -0.7, 0.7, -0.3, 0.15, 1.2, 1.6);
    add(LOG, -1.0, 1.0, 0.3, 2.3, -1.05, -0.82); add(LOG, -1.05, -0.82, 0.3, 2.3, -0.82, 0.95); add(LOG, 0.82, 1.05, 0.3, 2.3, -0.82, 0.95);
    for (let v = 0.5; v < 2.3; v += 0.3) { add('wood_dark', -1.02, 1.02, v, v + 0.025, -1.07, -0.8); add('wood_dark', -1.07, -0.8, v, v + 0.025, -0.8, 0.97); add('wood_dark', 0.8, 1.07, v, v + 0.025, -0.8, 0.97); }
    for (const u of [-0.95, 0.95]) add('timber', u - 0.09, u + 0.09, 0.3, 2.35, 0.86, 1.04);
    add('timber', -1.1, 1.1, 2.2, 2.4, 0.84, 1.06);
    add('timber', -0.45, 0.45, 0.95, 1.0, -0.82, -0.5);                                                         // the shelf
    add('timber', -0.34, 0.34, 1.0, 1.9, -0.82, -0.78); add('mosaic_gold', -0.3, 0.3, 1.04, 1.86, -0.78, -0.765); add('paint_robe', -0.12, 0.12, 1.1, 1.6, -0.765, -0.755);
    add('linen', 0.38, 0.5, 0.85, 1.75, -0.8, -0.78); add('cloth_red', 0.37, 0.51, 0.9, 0.97, -0.79, -0.77);              // an embroidered towel hung by the icon
    bag.add('glass_topaz', lathe([[0.001, -0.08], [0.04, -0.07], [0.05, -0.02], [0.045, 0], [0.001, 0]], 10, null, ...P(0, 1.85, -0.5)));
    bag.add('bronze', rod(P(0, 2.3, -0.5), P(0, 1.85, -0.5), 0.004, 4)); bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.04]], 6, null, ...P(0, 1.79, -0.5)));
    for (const u of [-0.25, 0.25]) { bag.add('linen', lathe([[0.012, 0], [0.012, 0.18], [0.003, 0.19]], 6, null, ...P(u, 1.0, -0.55))); bag.add('flame', lathe([[0.001, 0], [0.01, 0.012], [0.001, 0.04]], 5, null, ...P(u, 1.19, -0.55))); }
    { const a = P(-1.1, 0, -1.1), b = P(1.1, 0, 1.1), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])], yr = pitched(bag, 'planks_grey', LOG, r, y + 2.4 + 0.35 * 0.95, 0.95, 0.35, ridgeX(false), 0.08), tip = P(0, 0, 1.45);
      bag.add('gilt_bronze', box(tip[0] - 0.05, yr, tip[2] - 0.05, tip[0] + 0.05, yr + 0.75, tip[2] + 0.05));        // the cross at the ridge's front end
      const cb = P(0, 0, 1.45), s = (wx !== 0) ? [0.05, 0.28] : [0.28, 0.05]; bag.add('gilt_bronze', box(cb[0] - s[0], yr + 0.48, cb[2] - s[1], cb[0] + s[0], yr + 0.54, cb[2] + s[1])); }
    C(-1.2, 1.2, -1.2, 1.2, -0.3, 0.3); C(-1.05, 1.05, -1.05, -0.8, 0.3, 2.3); C(-1.05, -0.8, -1.05, 0.95, 0.3, 2.3); C(0.8, 1.05, -1.05, 0.95, 0.3, 2.3);
  } else {
    // the wayside cross: a squared post with the eight-ended cross at its head under a little gabled cap, set in a footing of fieldstones
    add('limestone', -0.5, 0.5, -0.3, 0.35, -0.5, 0.5); add('limestone', -0.4, 0.4, 0.35, 0.5, -0.4, 0.4);
    add('timber', -0.11, 0.11, 0.5, 3.3, -0.11, 0.11); add('timber', -0.5, 0.5, 2.55, 2.7, -0.07, 0.07); add('timber', -0.34, 0.34, 2.95, 3.05, -0.07, 0.07);
    { const a = P(0.0, 0, 0); bag.add('timber', rod([a[0] - ux * 0.3, y + 1.9, a[2] - uz * 0.3], [a[0] + ux * 0.3, y + 1.7, a[2] + uz * 0.3], 0.03, 5)); }   // the slanted foot-bar
    { const a = P(-0.6, 0, -0.17), b = P(0.6, 0, 0.17), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; pitched(bag, 'planks_grey', 'planks_grey', r, y + 3.2, 0.6, 0.1, ridgeX(true), 0.03); }
    add('gilt_bronze', -0.04, 0.04, 3.3, 3.85, -0.04, 0.04);
    col.circle(cx, cz, 0.6, y - 0.3, y + 3.3);
  }
}
