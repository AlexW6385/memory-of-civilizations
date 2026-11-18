// The kala's head over a gateway, in high relief (docs/settlements/borobudur.md §20): the brow and the flame-like locks
// of the crown, the bulging eyes under arched brows, the broad nose with its flaring wings, the wide upper lip with a row
// of teeth and the two curved fangs (no lower jaw), the hands with their claws raised beside the jaw, the ear-scrolls.
// Drawn on the wall face in the sculptor's frame (u across, v up, w out); the face is 1 wide and 1.1 high at kw = kh = 1,
// the features standing out up to 0.22 m. lod 2 the whole; lod 1 the same with fewer pieces.

import { Sculpt } from './sculpt.js';

export function kala(S, x, y, kw, kh, lod, h = 0.5) {
  const full = lod >= 2, w = S.sink, P = (u, v, e = 0) => [x + u * kw, y + v * kh, w + e], tn = full ? 6 : 4;
  // the forehead and the crown's boss, the locks like flames above
  S.blob(P(0, 0.78), [0.34 * kw, 0.18 * kh, 0.1], { n: full ? 14 : 8, m: 4 });
  S.blob(P(0, 0.92, 0.05), [0.08 * kw, 0.07 * kh, 0.07], { n: 8, m: 3 });
  const nL = full ? 9 : 5;
  for (let i = 0; i < nL; i++) {
    const a = ((i + 0.5) / nL - 0.5) * 2.5, r0 = 0.2, sw = Math.sin(a), cs = Math.cos(a), j = Math.sin(i * 4.1 + h * 11) * 0.02;
    S.tube([P(sw * r0 * 1.2, 0.86 + cs * 0.06, 0.03), P(sw * 0.34 * 1.2 + j, 0.98 + cs * 0.1, 0.06), P(sw * 0.46 * 1.2, 1.04 + cs * 0.12 + sw * sw * 0.05, 0.05)], [[0.03 * kw, 0.04], [0.036 * kw, 0.05], [0.004, 0.012]], { seg: 2, n: tn, cap: 1 });
  }
  for (const q of [-1, 1]) {
    // the brow arched over the eye, curling at its end; the eye bulging with its pupil
    S.tube([P(q * 0.04, 0.66, 0.06), P(q * 0.2, 0.74, 0.1), P(q * 0.36, 0.68, 0.08), P(q * 0.42, 0.6, 0.06)], [[0.032, 0.045], [0.04, 0.06], [0.034, 0.05], [0.018, 0.03]], { seg: 2, n: tn, cap: 1 });
    S.blob(P(q * 0.21, 0.6, 0.02), [0.1 * kw, 0.095 * kh, 0.11], { n: full ? 10 : 7, m: 4 });
    if (full) {
      S.blob(P(q * 0.21, 0.6, 0.106), [0.035 * kw, 0.035 * kh, 0.02], { n: 7, m: 3 });
      S.tube([P(q * 0.12, 0.665, 0.1), P(q * 0.21, 0.69, 0.12), P(q * 0.3, 0.66, 0.1)], [0.013, 0.014, 0.012], { seg: 2, n: 5, cap: 1 });            // the upper lid
    }
    S.blob(P(q * 0.34, 0.42, 0.01), [0.12 * kw, 0.1 * kh, 0.08], { n: full ? 10 : 7, m: 3 });                                                  // the cheek
    S.blob(P(q * 0.085, 0.38, 0.04), [0.07 * kw, 0.05 * kh, 0.075], { n: 8, m: 3 });                                                           // the wing of the nose
    // the ear with its scroll and its heavy ring
    S.tube([P(q * 0.56, 0.7, 0.02), P(q * 0.66, 0.6, 0.05), P(q * 0.62, 0.46, 0.06), P(q * 0.52, 0.5, 0.07)], [[0.05, 0.04], [0.06, 0.06], [0.05, 0.06], [0.02, 0.04]], { seg: 2, n: tn, cap: 1 });
    if (full) S.blob(P(q * 0.64, 0.38, 0.05), [0.04, 0.06, 0.05], { n: 7, m: 3 });
    // the hand raised by the jaw, four claws curving up
    S.blob(P(q * 0.58, 0.22, 0.02), [0.09 * kw, 0.1 * kh, 0.07], { n: 8, m: 3, rot: -q * 0.3 });
    for (let k = 0; k < (full ? 4 : 3); k++) S.tube([P(q * (0.5 + k * 0.045), 0.3, 0.05), P(q * (0.52 + k * 0.05), 0.4 + k * 0.01, 0.08), P(q * (0.5 + k * 0.045), 0.47 + k * 0.012, 0.07)], [0.022, 0.018, 0.004], { seg: 2, n: 4, cap: 1 });
    // the great fang curving down at the corner of the mouth
    S.tube([P(q * 0.27, 0.24, 0.06), P(q * 0.3, 0.12, 0.08), P(q * 0.26, 0.03, 0.07)], [[0.035, 0.035], [0.028, 0.03], [0.003, 0.004]], { seg: 2, n: tn, cap: 1 });
  }
  // the broad nose, the upper lip and its teeth
  S.blob(P(0, 0.47, 0.03), [0.17 * kw, 0.13 * kh, 0.1], { n: full ? 12 : 8, m: 4 });
  S.tube([P(-0.34, 0.28, 0.05), P(-0.16, 0.22, 0.09), P(0, 0.2, 0.1), P(0.16, 0.22, 0.09), P(0.34, 0.28, 0.05)], [[0.04, 0.04], [0.045, 0.045], [0.05, 0.05], [0.045, 0.045], [0.04, 0.04]], { seg: 2, n: tn, cap: 1 });
  const nT = full ? 9 : 5;
  for (let i = 0; i < nT; i++) { const u = ((i + 0.5) / nT - 0.5) * 0.52, v = 0.2 - 0.0 * u; S.tube([P(u, v, 0.075), P(u, v - 0.05, 0.085), P(u, v - 0.085 - 0.012 * (i % 2), 0.08)], [[0.022 * kw, 0.022], [0.019 * kw, 0.019], [0.002, 0.002]], { seg: 1, n: 4, cap: 1 }); }
}

export function kalaGeometry(kw, kh, lod, h) {
  const S = new Sculpt({ O: [0, 0, 0], U: [1, 0], N: [0, 1] });
  kala(S, 0, 0, kw, kh, lod, h);
  return S.geometry();
}
