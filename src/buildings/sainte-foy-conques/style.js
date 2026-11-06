// Sainte-Foy's own pieces, on top of the Romanesque style (src/styles/romanesque): the Majesty of Sainte Foy — the
// reliquary statue of the saint enthroned, gold over a core of yew, about 85 cm high — on its pedestal.
// docs/buildings/sainte-foy-conques.md §8.

import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/romanesque/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

/**
 * The Majesty { at, y, yaw (the way she faces; default −x, toward the choir) }: a pedestal of yellow limestone (moulded
 * base, round shaft, a cap); on it the throne of gilt silver — a box seat with a cushion, posts at the four corners
 * ending in knobs, a low back, bands of ornament along its rails — and the saint seated frontally, stiffly upright: the
 * gold robe falling over the knees to the feet on a footstool, the forearms held forward with the large hands open, the
 * oversized head with its staring blue eyes, a crown of gold with a band of stones; gems studding the robe. [stated:
 * tourisme-conques — the gold head from a late antique bust on the yew statue, the 10th-century crown, the large blue
 * eyes, the large hands, the gilt silver throne with its bands; the arms were refashioned in the 16th century and their
 * first position is unknown, the rock-crystal balls on the throne are Gothic, so neither is shown in their present form]
 */
function majesty(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, yaw = el.yaw ?? Math.PI;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  // local frame: f forward (the way she faces), l to her left, up y
  const P = (f, l, y) => [x + f * c - l * s, y, z + f * s + l * c];
  const bx = (out, f0, f1, l0, l1, ya, yb) => hexa(out, [P(f0, l0, ya), P(f1, l0, ya), P(f1, l1, ya), P(f0, l1, ya)], [P(f0, l0, yb), P(f1, l0, yb), P(f1, l1, yb), P(f0, l1, yb)]);
  /** a tapered block: bottom f0…f1 × l0…l1 at ya, top ff0…ff1 × ll0…ll1 at yb */
  const tb = (out, [f0, f1, l0, l1], [ff0, ff1, ll0, ll1], ya, yb) => hexa(out, [P(f0, l0, ya), P(f1, l0, ya), P(f1, l1, ya), P(f0, l1, ya)], [P(ff0, ll0, yb), P(ff1, ll0, yb), P(ff1, ll1, yb), P(ff0, ll1, yb)]);
  // the pedestal
  const st = 'limestone_yellow', H = 1.25;
  bag.add(st, lathe([[0.42, 0], [0.42, 0.14], [0.36, 0.2], [0.34, 0.28], [0.26, 0.34], [0.24, H - 0.2], [0.3, H - 0.14], [0.36, H - 0.06], [0.36, H], [0.001, H]], 20, null, x, y0, z));
  col.circle(x, z, 0.42, y0, y0 + H + 0.9);
  const y = y0 + H, sil = [], gold = [], gem = [], blue = [];
  /** a lathe solid g scaled sf along her forward axis and sl sideways, laid (tilt about her left axis) and set at p, y */
  const round = (g, sf, sl, p, yy, tilt, yw) => { if (tilt) g.rotateZ(-tilt); g.scale(sf, 1, sl); g.rotateY(-yw); g.translate(p[0], yy, p[2]); bag.add('gold', g); };
  const rod2 = (r, L) => lathe([[0.001, 0], [r * 0.8, 0.01], [r, 0.03], [r, L], [0.001, L]], 12).translate(0, 0, 0);
  // the throne: footstool, seat, cushion, corner posts with knobs, back, ornamental bands
  bx(sil, 0.16, 0.34, -0.17, 0.17, y, y + 0.08);
  bx(sil, -0.19, 0.17, -0.2, 0.2, y, y + 0.36);
  bx(gold, -0.18, 0.16, -0.18, 0.18, y + 0.36, y + 0.4);
  for (const [f, l] of [[0.17, -0.2], [0.17, 0.2], [-0.19, -0.2], [-0.19, 0.2]]) {
    const tall = f < 0 ? 0.62 : 0.46, p = P(f, l, 0);
    bag.add('silver', lathe([[0.03, 0], [0.03, tall - 0.06], [0.04, tall - 0.04], [0.001, tall]], 8, null, p[0], y, p[2]));
    bag.add('gold', lathe([[0.001, 0], [0.035, 0.012], [0.042, 0.04], [0.03, 0.07], [0.001, 0.08]], 10, null, p[0], y + tall - 0.01, p[2]));
  }
  bx(sil, -0.21, -0.17, -0.18, 0.18, y + 0.36, y + 0.58);                   // the back
  for (const yy of [y + 0.05, y + 0.31]) bx(gold, 0.165, 0.185, -0.2, 0.2, yy, yy + 0.035);   // the bands on the front rail
  for (const sd of [-1, 1]) for (const yy of [y + 0.05, y + 0.31]) bx(gold, -0.18, 0.16, sd * 0.2 - 0.01, sd * 0.2 + 0.01, yy, yy + 0.035);
  // the saint: shins and feet, lap, torso, shoulders, forearms and hands, neck, head, crown
  const ys = y + 0.4;
  tb(gold, [0.16, 0.24, -0.12, 0.12], [0.14, 0.24, -0.13, 0.13], y + 0.08, ys - 0.02);          // the robe over the shins
  for (const sd of [-1, 1]) bx(gold, 0.18, 0.31, sd * 0.065 - 0.045, sd * 0.065 + 0.045, y + 0.08, y + 0.13);   // the feet
  bx(gold, -0.13, 0.2, -0.13, 0.13, ys - 0.04, ys + 0.06);                                      // the lap
  // the knees, rounded, the robe drawn over them
  for (const sd of [-1, 1]) round(rod2(0.056, 0.13), 1, 1, P(0.1, sd * 0.062, 0), ys - 0.02, Math.PI / 2, yaw);
  // the torso and shoulders: an elliptic body, straight and frontal
  round(lathe([[0.125, 0], [0.118, 0.12], [0.122, 0.22], [0.14, 0.285], [0.12, 0.315], [0.06, 0.33], [0.001, 0.335]], 18), 0.68, 1, P(-0.05, 0, 0), ys + 0.04, 0, yaw);
  for (const sd of [-1, 1]) {
    tb(gold, [-0.08, 0.0, sd * 0.11, sd * 0.155], [-0.06, 0.02, sd * 0.115, sd * 0.155], ys + 0.34, ys + 0.18);  // upper arm
    bx(gold, -0.03, 0.17, sd * 0.1, sd * 0.155, ys + 0.13, ys + 0.19);                            // forearm, held forward
    bx(gold, 0.17, 0.25, sd * 0.09, sd * 0.165, ys + 0.12, ys + 0.21);                             // the large hand
    bx(gold, 0.2, 0.23, sd * 0.06, sd * 0.09, ys + 0.18, ys + 0.22);                               // the thumb, raised
  }
  bag.add('gold', lathe([[0.045, 0], [0.04, 0.05]], 10, null, ...(() => { const p = P(-0.055, 0, 0); return [p[0], ys + 0.36, p[2]]; })()));
  // the head: large, the chin held high; the crown with its band of stones
  const hc = P(-0.05, 0, 0), yh = ys + 0.41;
  round(lathe([[0.001, 0], [0.04, 0.005], [0.07, 0.03], [0.088, 0.07], [0.094, 0.11], [0.09, 0.15], [0.075, 0.185], [0.04, 0.205], [0.001, 0.21]], 18), 0.92, 1, hc, yh, 0, yaw);
  bag.add('gold', lathe([[0.092, 0], [0.096, 0.05], [0.102, 0.068], [0.096, 0.072], [0.084, 0.03], [0.084, 0.0]], 14, null, hc[0], yh + 0.15, hc[2]));
  for (let k = 0; k < 12; k++) {
    const a = 2 * Math.PI * k / 12, q = [hc[0] + Math.cos(a) * 0.094, hc[2] + Math.sin(a) * 0.094];
    bag.add(k % 2 ? 'inlay_carnelian' : 'inlay_lapis', lathe([[0.001, 0], [0.012, 0.004], [0.012, 0.016], [0.001, 0.02]], 6, null, q[0], yh + 0.172, q[1]));
  }
  // the eyes: wide, of blue enamel; a straight nose
  for (const sd of [-1, 1]) bx(blue, 0.028, 0.041, sd * 0.032 - 0.016, sd * 0.032 + 0.016, yh + 0.1, yh + 0.122);
  tb(gold, [0.03, 0.05, -0.008, 0.008], [0.03, 0.068, -0.013, 0.013], yh + 0.1, yh + 0.055);
  // stones on the robe: down the front of the torso, round the hem
  for (let k = 0; k < 5; k++) bx(gem, 0.025, 0.04, -0.015, 0.015, ys + 0.1 + k * 0.045, ys + 0.125 + k * 0.045);
  for (let k = -3; k <= 3; k++) bx(gem, 0.235, 0.25, k * 0.035 - 0.012, k * 0.035 + 0.012, y + 0.16, y + 0.185);
  bag.add('silver', fromTriangles(sil));
  bag.add('gold', fromTriangles(gold));
  bag.add('inlay_carnelian', fromTriangles(gem));
  bag.add('inlay_lapis', fromTriangles(blue));
}

const base = STYLES.romanesque;
registerStyle('romanesque-foy', {
  ...base,
  objects: { ...base.objects, reliquary: majesty },
});
