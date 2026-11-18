// The relief of an imperial ramp (docs/settlements/qing-beijing.md §37), rebuilt as a modelled surface standing 3–8 cm off the stone: the
// double border with its band of cloud scrolls, the sea's breaking waves and the three stepped mountains at the foot, two dragons among
// clouds rising to the flaming pearl between their heads (dragonrelief.js). Frame: x across, y up the slope, z out of the stone.
import { box, lathe } from '../../core/geom.js';
import { Parts, T, merge } from '../../styles/qing/carving.js';
import { dragonRelief } from './dragonrelief.js';
import { cloudScroll, waveCurl, spline, h01 } from './sculpt.js';

const m = 'marble';
export function rampParts(W, S, fine) {
  const P = new Parts(), e = 0.1, fw = 0.16;
  const put = (g) => P.add(m, g);
  if (!fine) {
    for (const sx of [-1, 1]) { put(box(sx * (W / 2 - e) - fw / 2, e, -0.02, sx * (W / 2 - e) + fw / 2, S - e, 0.05)); put(box(sx * (W / 2 - e - 0.3) - 0.04, e + 0.3, -0.02, sx * (W / 2 - e - 0.3) + 0.04, S - e - 0.3, 0.035)); }
    for (const y of [e, S - e - fw]) put(box(-W / 2 + e, y, -0.02, W / 2 - e, y + fw, 0.05));
    for (const y of [e + 0.3, S - e - 0.3 - 0.08]) put(box(-W / 2 + e + 0.3, y, -0.02, W / 2 - e - 0.3, y + 0.08, 0.035));
    // the band of cloud scrolls along the inner border's foot and head
    const nc = Math.max(3, Math.floor((W - 1.6) / 0.9));
    for (let i = 0; i < nc; i++) { const x = -W / 2 + 0.8 + (i + 0.5) * ((W - 1.6) / nc); for (const g of cloudScroll(x, e + 0.5, 0.5, 0.035, i % 2 ? 1 : -1)) put(g); for (const g of cloudScroll(x, S - e - 0.42, 0.5, 0.035, i % 2 ? -1 : 1)) put(g); }
    // the sea: two rows of breaking waves across the foot, the three mountains rising out of them
    const nw = Math.max(5, Math.round((W - 1.2) / 0.8));
    for (let row = 0; row < 2; row++) for (let i = 0; i < nw; i++) {
      const x = -W / 2 + 0.6 + (i + 0.5 + row * 0.5) * ((W - 1.2) / (nw + 0.5));
      if (Math.abs(x) > W / 2 - 0.85) continue;
      for (const g of waveCurl(x, 0.62 + row * 0.28, 0.58, 0.04 + 0.01 * row, (i + row) % 2 ? 1 : -1)) put(g);
    }
    for (const [x, hgt, wd] of [[-W * 0.2, 0.8, 0.5], [0, 1.1, 0.65], [W * 0.2, 0.8, 0.5]]) {
      const prof = [[wd, 0], [wd * 0.8, hgt * 0.3], [wd * 0.62, hgt * 0.42], [wd * 0.44, hgt * 0.7], [wd * 0.28, hgt * 0.78], [0.001, hgt]];
      put(T(lathe(prof, 6).scale(1, 1, 0.1), x, 1.28, 0));
    }
  }
  // the dragons, two facing each other over the pearl (one when the ramp is narrow), among scrolls of cloud
  const y0 = 2.35, hh = Math.max(1.8, S - y0 - 0.7), n = W > 5 ? 2 : 1, half = n === 2 ? (W / 2 - 0.9) : (W - 1.4);
  for (let k = 0; k < n; k++) {
    const dr = n === 2 ? (k ? 1 : -1) : 1, cx = n === 2 ? 0 : 0;
    const ctl = [[0.24, 0.86], [0.55, 0.9], [0.9, 0.78], [0.8, 0.6], [0.45, 0.5], [0.3, 0.38], [0.6, 0.26], [0.95, 0.2], [0.8, 0.08], [0.95, 0.02]];
    const pts = ctl.map(([u, v]) => [cx + dr * u * half * (n === 2 ? 1 : 0.5), y0 + v * hh]);
    const D = dragonRelief(spline(pts, 7), 0.24 + (n === 2 ? 0 : 0.03), 0.085, { fine, flip: dr, pearlAt: k === 0 && n === 2 ? [0, y0 + 0.9 * hh] : null, seed: dr });
    for (const g of D.out) put(g);
    for (const g of D.gilt) P.add('gilt_bronze', g);
  }
  if (!fine) {
    for (let k = 0; k < 5; k++) for (const sx of [-1, 1]) {
      const y = 2.15 + k * (S - 3.4) / 4, x = sx * (W / 2 - 0.85) * (k % 2 ? 0.82 : 1);
      if (n === 1 && sx > 0 && k % 2) continue;
      for (const g of cloudScroll(x, y, 0.62 + 0.1 * h01(x, y), 0.05, sx)) put(g);
    }
    if (n === 2) for (let k = 0; k < 4; k++) for (const g of cloudScroll(0, 2.7 + k * (S - 3.9) / 3, 0.55, 0.05, k % 2 ? 1 : -1)) put(g);
    // clouds between the dragons' coils
    for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) for (const g of cloudScroll(sx * (0.9 + 0.6 * (k % 2)), y0 + 0.3 * hh + k * 0.2 * hh, 0.45, 0.04, -sx)) put(g);
  }
  return P;
}
export { merge };
