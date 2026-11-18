// The two portrait figures of the hall, life-size and seated: the donor Ning Gongyu (a woman, "the lady disciple Ning Gongyu" of the dhāraṇī
// pillar's inscription [stated]) beside the north king, and the monk Yuancheng beneath the south end-bay window. Poses and dress are
// inferred from Tang portrait sculpture [inferred]: she in a high-waisted gown with wide sleeves and a high bun, her hands together in
// her sleeves; he in a monk's robe with the kasaya across the chest, the shaven head, the hands joined.
// Built in metres on a low dais, +z forward, the dais' top at y = 0.18.

import { lathe } from '../../core/geom.js';
import { Acc, skin, tube, blob, hash, smooth, ring, body, head, hair, hand, band, limb, sash, add3 } from './sculpt-kit.js';

const TAU = Math.PI * 2;

export function portrait(o = {}) {
  const A = new Acc(), lod = o.lod ?? 2, monk = o.who === 'monk', seed = o.seed ?? 1, ph = hash(seed, 1, 1) * 6, n = lod > 1 ? 24 : 14;
  const y = 0.18, gown = monk ? 'clay_robe' : 'clay_green', gown2 = monk ? 'clay_green' : 'clay_robe';
  // the dais: a square plinth with a stepped moulding
  const dais = lathe([[0.001, 0], [0.62, 0], [0.62, 0.05], [0.56, 0.07], [0.56, 0.13], [0.6, 0.15], [0.6, 0.18], [0.001, 0.18]], 4); dais.rotateY(Math.PI / 4);
  A.add('granite_grey', dais);
  // the legs crossed under the robe (he) or folded under the long skirt (she): a loaf of cloth, the knees showing, folds hanging at the front
  const rows = [{ y, cz: 0.08, rx: 0.44, rz: 0.34 }, { y: y + 0.1, cz: 0.1, rx: 0.46, rz: 0.34, f: (th) => 1 + 0.045 * Math.cos(th * 9 + ph) }, { y: y + 0.24, cz: 0.08, rx: 0.38, rz: 0.29 }, { y: y + 0.33, cz: 0.02, rx: 0.28, rz: 0.22 }, { y: y + 0.4, cz: 0, rx: 0.001, rz: 0.001 }];
  A.add(gown, skin(rows.map((r) => ring(0, r.y, r.cz, r.rx, r.rz, n, r.f)), true, true));
  for (const s of [-1, 1]) A.add(gown, blob([s * 0.36, y + 0.16, 0.2], 0.14, 0.13, 0.17, 9, 5));
  for (let j = 0; j < (lod > 1 ? 6 : 3); j++) {
    const th = Math.PI / 2 + (j - 2.5) * 0.3, pts = [];
    for (let i = 0; i <= 3; i++) { const yy = y + 0.34 - i * 0.1; pts.push([Math.cos(th + (th - Math.PI / 2) * 0.1 * i) * (0.3 + 0.07 * i) * 1.015, yy, 0.05 + Math.sin(th) * (0.24 + 0.08 * i) * 1.02, 0.011]); }
    A.add(gown, tube(pts, 5, 0.8));
  }
  // the torso: the chest, the shoulders; the monk's robe closes high at the neck on the left, the lady's gown is cut round with a high waist
  const tr = [{ y: y + 0.28, rx: 0.27, rz: 0.2 }, { y: y + 0.45, rx: 0.23, rz: 0.17 }, { y: y + 0.6, rx: 0.2, rz: 0.15 }, { y: y + 0.76, rx: 0.245, rz: 0.17, cz: 0.01 }, { y: y + 0.9, rx: 0.265, rz: 0.165, cz: 0 }, { y: y + 0.97, rx: 0.14, rz: 0.11 }, { y: y + 1.02, rx: 0.065, rz: 0.065 }];
  A.add(gown2, skin(tr.map((r, i) => ring(0, r.y, r.cz ?? 0, r.rx, r.rz, n, (th) => 1 + 0.035 * Math.cos(th * 7 + i + ph) * (1 - smooth(0.7, 1.0, (r.y - y) / 1.0)))), true, true));
  if (monk) {
    // the kasaya: a band over the left shoulder crossing the chest to the right hip, patched in gilt lines; the robe's collar
    A.add(gown, sash([[0.2, y + 0.98, 0.06, 0.2], [0.1, y + 0.84, 0.15, 0.22], [-0.02, y + 0.6, 0.2, 0.22], [-0.14, y + 0.4, 0.22, 0.2]], [0, 0.3, 1], 0.012, ph));
    A.add('clay_gilt', sash([[0.2, y + 0.98, 0.075, 0.016], [0.1, y + 0.84, 0.166, 0.016], [-0.02, y + 0.6, 0.216, 0.016], [-0.14, y + 0.4, 0.236, 0.016]], [0, 0.3, 1], 0.004, 0));
    for (let j = 0; j < 4; j++) A.add('clay_gilt', tube([[0.2 - j * 0.07 - 0.05, y + 0.9 - j * 0.14, 0.12 + 0.03 * j, 0.004], [0.02 - j * 0.07, y + 0.78 - j * 0.14, 0.16 + 0.03 * j, 0.004]], 4));
    A.add('clay_gilt', band(0, y + 0.99, 0.0, 0.07, 0.07, 0.014, 12, 4));
  } else {
    // the high waist: a broad sash of red under the breast, its ends hanging; the bodice's edge at the neck; a shawl over the shoulders
    A.add(gown2, band(0, y + 0.68, 0.0, 0.215, 0.165, 0.035, 22, 5));
    A.add(gown2, sash([[0.02, y + 0.66, 0.17, 0.1], [0.04, y + 0.46, 0.22, 0.11], [0.03, y + 0.3, 0.26, 0.1]], [0, 0.2, 1], 0.01, ph));
    A.add('paint_white', sash([[-0.22, y + 0.94, 0.02, 0.1], [-0.2, y + 0.7, 0.15, 0.1], [0.0, y + 0.55, 0.2, 0.1], [0.2, y + 0.7, 0.15, 0.1], [0.22, y + 0.94, 0.02, 0.1]], [0, 0.4, 1], 0.008, ph));
  }
  // the sleeves, wide, falling from the shoulders to the hands joined at the chest (the lady's hands hidden in the sleeves)
  for (const s of [-1, 1]) {
    A.add(gown, limb([[s * 0.24, y + 0.88, 0, 0.07], [s * 0.3, y + 0.68, 0.06, 0.09], [s * 0.26, y + 0.52, 0.18, 0.115], [s * 0.1, y + 0.55, 0.3, 0.12], [s * 0.02, y + 0.6, 0.34, 0.085]], 10, (th, t) => 1 + 0.08 * t * Math.cos(th * 4 + ph)));
    A.add('clay_gilt', limb([[s * 0.1, y + 0.55, 0.3, 0.124], [s * 0.07, y + 0.56, 0.31, 0.124]], 10));
  }
  if (monk && lod > 1) hand(A, 'skin_medium', [0, y + 0.58, 0.37], [0, 0.9, 0.3], [1, 0, 0], { curl: 0.1, spread: 0.02, s: 0.95 });
  else if (monk) A.add('skin_medium', blob([0, y + 0.62, 0.38], 0.04, 0.07, 0.03, 6, 3));
  // the head: shaven and heavy-browed (the monk), round-faced with a high bun and hairpins (the lady)
  const hc = [0, y + 1.14, 0.03];
  A.add(monk ? 'skin_medium' : 'skin_light', tube([[0, y + 0.92, 0, 0.065], [0, y + 1.02, 0.01, 0.055]], 8));
  head(A, hc, 0.86, { kind: monk ? 'old' : 'lady', flesh: monk ? 'skin_medium' : 'skin_light', lod, turn: monk ? 0.06 : -0.08 });
  if (monk) A.add('paint_blue', blob([0, hc[1] + 0.045, hc[2] - 0.01], 0.087, 0.084, 0.09, 12, 5));
  else {
    hair(A, hc, 0.86, { chignon: true, locks: false });
    A.add('clay_gilt', blob([0, hc[1] + 0.12, hc[2] + 0.07], 0.05, 0.02, 0.012, 6, 3), blob([0, hc[1] + 0.075, hc[2] + 0.095], 0.01, 0.01, 0.01, 4, 3));
    A.add('lacquer_red', blob([0, hc[1] + 0.04, hc[2] + 0.092], 0.006, 0.006, 0.004, 4, 3));
  }
  void add3;
  return A;
}
