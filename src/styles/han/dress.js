// The eye-level dress of Han Chang'an's house fronts and yards (docs/settlements/han-changan.md §9): rain streaks and flaked plaster on the earth
// walls, the doorstep, strings of corn, gourds and jujubes under the gate's eave, a woodpile, a water vat, a bench or a basket against the wall, the vine
// pads on the coping; in the yard a mat of drying grain, a millstone, a vat.
import { box, lathe } from '../../core/geom.js';
import { rngOf, weather, strings, woodpile, vat, qbox } from './props.js';

const Q = (F) => (F.V[1] > 0 ? 0 : 2);
/** Items on the lane's side of a lot's front. h: the wall's height (the gate's lintel stands above it). */
export function frontDress(F, W, D, gateU, gateW, h, seed, kind) {
  const r = rngOf(seed ^ 0x5bd1e995), bag = F.bag, q = Q(F), o = F.pt(q ? W : 0, 0);
  const g0 = gateU - gateW / 2, g1 = gateU + gateW / 2;
  if (kind !== 'row') {
    const seg = (a, b) => (q ? [W - b, W - a] : [a, b]);
    if (g0 > 1.2) { const [a, b] = seg(0, g0 - 0.15); weather(bag, o[0], o[1], q, a, b, h, seed + 1); }
    if (W - g1 > 1.2) { const [a, b] = seg(g1 + 0.15, W); weather(bag, o[0], o[1], q, a, b, h, seed + 2); }
    // the doorstep and the strings under the gate's eave
    F.b('bluestone', g0 - 0.1, 0, -0.55, g1 + 0.1, 0.12, 0.02, false);
    const p = F.pt(gateU, -0.18);
    strings(bag, p[0], h + 0.28, p[1], q, 3, seed + 4);
    // the vine pads on the coping
    for (let k = 0; k < 4; k++) if (r() < 0.55) { const uu = 0.6 + r() * (W - 1.2); if (uu > g0 - 0.4 && uu < g1 + 0.4) continue; const c = F.pt(uu, 0.25); bag.add('lotus_leaf', lathe([[0.001, 0], [0.32, 0.03], [0.4, 0.1], [0.2, 0.2], [0.001, 0.22]], 6, null, c[0], h + 0.28, c[1])); }
  }
  // things against the wall (or the row hall's front): one or two, chosen by the lot's seed, left and right of the gate
  const picks = [];
  const spots = kind === 'row' ? [W * 0.2, W * 0.8] : [g0 - 1.1, g1 + 1.1].filter((x) => x > 0.9 && x < W - 0.9);
  const vf = kind === 'row' ? 0.35 : -0.35;
  for (const sp of spots) {
    if (r() < 0.25) continue;
    const t = r(), p = F.pt(sp, vf);
    if (t < 0.28) woodpile(bag, p[0], 0, p[1], q ^ 2, 1.4, 0.8 + r() * 0.3);
    else if (t < 0.5) vat(bag, p[0], 0, p[1], 1.0 + r() * 0.15, r() < 0.5 ? 'pottery_dark' : 'terracotta');
    else if (t < 0.68) { qbox(bag, 'timber', p[0], p[1], q, -0.8, 0.42, -0.2, 0.8, 0.47, 0.2); for (const s of [-1, 1]) qbox(bag, 'timber', p[0], p[1], q, s * 0.65 - 0.04, 0, -0.15, s * 0.65 + 0.04, 0.42, 0.15); }
    else if (t < 0.84) { for (let k = 0; k < 3; k++) bag.add('wicker', lathe([[0.001, 0], [0.28, 0.02], [0.34, 0.3], [0.3, 0.34], [0.001, 0.3]], 8, null, p[0] + (k - 1) * 0.5, 0, p[1] + (k & 1) * 0.15)); }
    else { for (let k = 0; k < 4; k++) bag.add('sacking', lathe([[0.001, 0], [0.28, 0.04], [0.32, 0.26], [0.2, 0.55], [0.001, 0.6]], 7, null, p[0] + (k - 1.5) * 0.45, 0, p[1])); }
    picks.push(t);
  }
}
/** The yard behind the front: a mat of grain laid out to dry, a millstone, a vat; v from the lane. */
export function yardDress(F, W, D, vHall, seed) {
  const r = rngOf(seed ^ 0x2545f491), bag = F.bag, q = Q(F);
  if (vHall < 4.2) return;
  const v = 0.9 + r() * (vHall - 3.2), uu = 1.2 + r() * (W - 4.0), p = F.pt(uu, v);
  if (r() < 0.6) qbox(bag, 'reed_mat', p[0], p[1], q, 0, 0.02, 0, 2.2, 0.05, 1.5);
  if (r() < 0.6) { const m = F.pt(W - 1.4 - r() * 2.0, v + 0.3); bag.add('granite_grey', lathe([[0.001, 0], [0.5, 0], [0.5, 0.18], [0.001, 0.2]], 10, null, m[0], 0, m[1])); bag.add('granite_grey', lathe([[0.001, 0.2], [0.46, 0.2], [0.46, 0.36], [0.001, 0.38]], 10, null, m[0], 0, m[1])); }
  if (r() < 0.6) { const w = F.pt(0.8 + r() * 1.5, vHall - 1.0); vat(bag, w[0], 0, w[1], 1.1, 'pottery_dark'); }
  void box;
}
