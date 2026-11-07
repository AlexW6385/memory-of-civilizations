// The offerings on the altar before the Great Buddha (docs/settlements/nara.md §10): in the middle a
// bronze censer on three feet with its domed, pierced lid; either side a tall bronze vase holding
// lotus — a flower, a bud and two leaves on their stalks; at the ends a lamp: a dish of oil with
// its flame on a slender stand.

import { lathe, rod, box } from '../../core/geom.js';

/** nara_altar_set { at: [x, z] (the altar top's centre), y (its top), w (the altar's length along x) } */
export function naraAltarSet(el, { bag, lights }) {
  const [x, z] = el.at, y = el.y, w = el.w ?? 6.0, B = 'bronze', G = 'gilt_bronze';
  // the censer: a round bowl with a rim, three curved feet, the lid in two stages with a knob
  bag.add(B, lathe([[0.001, 0.12], [0.22, 0.13], [0.3, 0.22], [0.31, 0.36], [0.27, 0.42], [0.29, 0.44], [0.28, 0.46], [0.001, 0.46]], 20, null, x, y, z));
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + Math.PI / 2, c = Math.cos(a), s = Math.sin(a); bag.add(B, rod([x + c * 0.2, y + 0.2, z + s * 0.2], [x + c * 0.27, y, z + s * 0.27], 0.035, 6)); }
  bag.add(B, lathe([[0.27, 0], [0.26, 0.1], [0.18, 0.2], [0.1, 0.24], [0.06, 0.3], [0.08, 0.36], [0.001, 0.4]], 16, (th, i) => (i > 0 && i < 4 ? 1 + 0.06 * Math.cos(th * 8) : 1), x, y + 0.46, z));
  // the vases and their lotus
  for (const s of [-1, 1]) {
    const vx = x + s * w * 0.27;
    bag.add(B, lathe([[0.001, 0], [0.12, 0], [0.14, 0.04], [0.11, 0.08], [0.16, 0.22], [0.18, 0.36], [0.13, 0.5], [0.07, 0.6], [0.07, 0.72], [0.11, 0.78], [0.1, 0.8], [0.06, 0.76], [0.001, 0.76]], 16, null, vx, y, z));
    bag.add(G, lathe([[0.165, 0.27], [0.185, 0.3], [0.185, 0.33], [0.17, 0.36]], 16, null, vx, y, z));
    const stalk = (dx, dz, h) => { const top = [vx + dx, y + h, z + dz]; bag.add('lotus_leaf', rod([vx, y + 0.7, z], top, 0.012, 5)); return top; };
    // the flower: petals in two rings round a seed head
    const f = stalk(0.02, 0.0, 1.55);
    bag.add('lotus_leaf', lathe([[0.001, 0], [0.05, 0.02], [0.06, 0.06], [0.001, 0.07]], 10, null, f[0], f[1], f[2]));
    for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) {
      const a = (k + r * 0.5) / 8 * Math.PI * 2, g = lathe([[0.001, 0], [0.05, 0.05], [0.04, 0.12], [0.001, 0.16 - r * 0.03]], 6);
      g.scale(1, 1, 0.35); g.rotateX(0.35 + r * 0.45); g.rotateY(-a + Math.PI / 2); g.translate(f[0] + Math.cos(a) * 0.04, f[1] - 0.02, f[2] + Math.sin(a) * 0.04);
      bag.add('stucco_rose', g);
    }
    // the bud, and the leaves held out on their stalks, cupped
    const b = stalk(-s * 0.18, 0.06, 1.25);
    bag.add('stucco_rose', lathe([[0.001, 0], [0.045, 0.04], [0.04, 0.1], [0.001, 0.16]], 8, null, b[0], b[1], b[2]));
    for (const [dx, dz, h, r] of [[s * 0.32, -0.08, 1.05, 0.26], [-s * 0.08, -0.24, 0.95, 0.22]]) {
      const t = stalk(dx, dz, h);
      bag.add('lotus_leaf', lathe([[0.001, 0.0], [r * 0.5, 0.03], [r, 0.09], [r * 1.02, 0.08]], 14, (th) => 1 + 0.05 * Math.cos(th * 3), t[0], t[1], t[2]));
    }
    // the lamp at the altar's end: foot, shaft, dish and flame
    const lx = x + s * w * 0.43;
    bag.add(B, lathe([[0.001, 0], [0.14, 0], [0.14, 0.03], [0.05, 0.08], [0.03, 0.1]], 12, null, lx, y, z));
    bag.add(B, box(lx - 0.02, y + 0.09, z - 0.02, lx + 0.02, y + 0.62, z + 0.02));
    bag.add(B, lathe([[0.001, 0.6], [0.11, 0.62], [0.13, 0.67], [0.12, 0.68], [0.001, 0.65]], 12, null, lx, y, z));
    bag.add('flame', lathe([[0.001, 0.66], [0.018, 0.69], [0.012, 0.74], [0.001, 0.78]], 6, null, lx, y, z));
    lights?.push({ at: [lx, y + 0.75, z], color: '#ffb46b', intensity: 2.0, distance: 6 });
  }
}
