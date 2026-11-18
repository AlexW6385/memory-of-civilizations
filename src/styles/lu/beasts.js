// The bronze incense burners and the stone lions of the Dacheng Hall's terrace (docs/settlements/lu-qufu.md §13).
// The burner (ding): a stone base of mouldings, a round bronze bowl with a banded belly, two upright loop ears, three legs each topped by a beast's mask,
// a domed lid with its knob; level 'F' adds the band of thunder-pattern studs and the beads of the lid. The lions: the Beijing kit's seated guardian
// (src/settlements/qing-beijing/lion.js, read-only) in grey stone, the male with the ball, the female with her cub.
import { lathe } from '../../core/geom.js';
import { Parts, sumeru } from '../qing/carving.js';
import { curve, ell, ring, cone, h01 } from '../../settlements/qing-beijing/sculpt.js';
import { buildLion } from '../../settlements/qing-beijing/lion.js';

const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export function burner(P, level = 'R', seed = 0) {
  const m = 'bronze', y0 = 0.9;
  if (level === 'R') {
    sumeru(P, 'marble', -0.9, -0.9, 0.9, 0.9, y0);
    P.add(m, lathe([[0.001, 0.0], [0.5, 0.06], [0.7, 0.3], [0.78, 0.55], [0.74, 0.8], [0.64, 0.92], [0.7, 0.96], [0.7, 1.02], [0.58, 1.02], [0.001, 0.98]], 24, null, 0, y0 + 0.5, 0));   // the bowl, its rim rolled out
    for (const y of [0.62, 0.9]) P.add(m, ring([0, y0 + 0.5 + y - 0.05, 0], 0.76 - (y > 0.7 ? 0.03 : -0.02), 0.025, [0, 1, 0], 30, 5));   // the bands round the belly
    // the legs: a thigh with the beast's mask at the top, the cabriole shank, the clawed foot
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + Math.PI / 2 + 0.1 * h01(seed, k), c = Math.cos(a), s = Math.sin(a), ax = [[c, 0, s], [0, 1, 0], [-s, 0, c]];
      P.add(m, curve([[c * 0.52, y0 + 0.78, s * 0.52], [c * 0.62, y0 + 0.5, s * 0.62], [c * 0.66, y0 + 0.2, s * 0.66], [c * 0.6, y0 + 0.04, s * 0.6]], 0.13, 0.06, { n: 8, per: 3, swell: 0.1 }));
      P.add(m, ell([c * 0.66, y0 + 0.62, s * 0.66], [0.14, 0.17, 0.12], ax, 9, 5));                                     // the mask
      for (const sg of [-1, 1]) { P.add(m, ell([c * 0.72 - s * sg * 0.07, y0 + 0.66, s * 0.72 + c * sg * 0.07], [0.035, 0.03, 0.03], AX, 6, 3)); P.add(m, cone([c * 0.66 - s * sg * 0.08, y0 + 0.78, s * 0.66 + c * sg * 0.08], [c * 0.66 - s * sg * 0.13, y0 + 0.92, s * 0.66 + c * sg * 0.13], 0.025, 4)); }
      P.add(m, ell([c * 0.6, y0 + 0.04, s * 0.6], [0.1, 0.05, 0.12], ax, 8, 4));
    }
    // the two loop ears on the rim (a half ring each side, standing up)
    for (const sx of [-1, 1]) P.add(m, ring([sx * 0.74, y0 + 1.5, 0], 0.2, 0.045, [1, 0, 0], 16, 6, 0, Math.PI));
    // the lid: a dome with a ring of pierced lotus (the lathe's profile), the lion-ball knob
    P.add(m, lathe([[0.7, y0 + 1.5], [0.66, y0 + 1.6], [0.5, y0 + 1.82], [0.3, y0 + 1.96], [0.16, y0 + 2.03], [0.1, y0 + 2.1], [0.12, y0 + 2.2], [0.08, y0 + 2.28], [0.001, y0 + 2.4]], 20));
  } else {
    for (let q = 0; q < 28; q++) { const a = q / 28 * Math.PI * 2; P.add(m, ell([Math.cos(a) * 0.785, y0 + 0.5 + 0.62, Math.sin(a) * 0.785], [0.035, 0.03, 0.035], AX, 6, 3)); }
    for (let q = 0; q < 20; q++) { const a = q / 20 * Math.PI * 2 + 0.1; P.add(m, ell([Math.cos(a) * 0.53, y0 + 1.88, Math.sin(a) * 0.53], [0.03, 0.03, 0.03], AX, 6, 3)); }
  }
}
export function lionPair(P, level, ball) { buildLion(P, 'granite_grey', 'granite_grey', { paw: ball ? 'ball' : 'cub', fine: level === 'F', ped: 1.2 }); }
export { Parts };
