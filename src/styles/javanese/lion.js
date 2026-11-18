// The guardian lion (singa) of the stairs, modelled for the eye at two metres (docs/settlements/borobudur.md §20): seated upright on
// its haunches on a low plinth, the thighs and hind paws with their toes, the straight forelegs with shoulder, elbow and
// claws, the chest, the head with its mane in rows of curls, bulging eyes under a heavy brow, the broad nose, the open jaws
// with teeth, tongue and fangs, the tail curled up its back. Faces +z, plinth at the origin, 1.25 m to the top of the head
// at scale 1. h in [0, 1) turns the head a little and sets the curls (no two lions are the same shape).

import { lathe } from '../../core/geom.js';
import { Sculpt } from './sculpt.js';

export function lion(lod, h = 0.5) {
  const full = lod >= 2, S = new Sculpt({ O: [0, 0, 0], U: [1, 0], N: [0, 1] }, !full), o = (a) => (h - 0.5) * a;
  const sol = (c, r, op = {}) => S.solid(c, r, { n: full ? 9 : 7, m: full ? 5 : 4, ...op });
  const plinth = lathe([[0.4, 0], [0.4, 0.12], [0.35, 0.15], [0.35, 0.2], [0.001, 0.2]], 4).rotateY(Math.PI / 4).scale(1, 1, 1.2);
  // haunches, thighs, hind paws
  sol([0, 0.42, -0.12], [0.26, 0.22, 0.27]);
  for (const q of [-1, 1]) {
    S.pipe([[q * 0.19, 0.5, -0.1], [q * 0.2, 0.34, 0.06], [q * 0.17, 0.25, 0.2]], [[0.1, 0.09], [0.085, 0.08], [0.06, 0.055]], { seg: 2, n: full ? 8 : 6 });          // the thigh and shin
    sol([q * 0.17, 0.225, 0.26], [0.065, 0.032, 0.09], { n: 8, m: 3 });                                                                                     // the hind paw
    if (full) for (let k = -1; k <= 1; k++) sol([q * 0.17 + k * 0.03, 0.222, 0.345], [0.017, 0.016, 0.022], { n: 5, m: 3 });                                   // its toes
  }
  // the body rising to the chest, the shoulders, the forelegs straight down to the paws
  S.pipe([[0, 0.4, -0.04], [0, 0.65, 0.04], [0, 0.85, 0.1]], [[0.2, 0.17], [0.19, 0.16], [0.17, 0.15]], { seg: 3, n: full ? 10 : 7, capLen: 0.06 });
  sol([0, 0.7, 0.14], [0.17, 0.22, 0.11], { tilt: -0.2 });                                                                                                     // the chest
  for (const q of [-1, 1]) {
    sol([q * 0.17, 0.78, 0.1], [0.085, 0.12, 0.09]);                                                                                                           // the shoulder
    S.pipe([[q * 0.13, 0.7, 0.18], [q * 0.12, 0.46, 0.22], [q * 0.115, 0.24, 0.25]], [[0.06, 0.055], [0.048, 0.044], [0.05, 0.044]], { seg: 2, n: full ? 8 : 6 });  // the foreleg
    sol([q * 0.12, 0.24, 0.3], [0.058, 0.03, 0.075], { n: 8, m: 3 });                                                                                          // the paw
    if (full) for (let k = -1; k <= 1; k++) S.pipe([[q * 0.12 + k * 0.026, 0.235, 0.345], [q * 0.12 + k * 0.028, 0.225, 0.375]], [0.013, 0.004], { seg: 1, n: 4, cap: 1 });   // its claws
  }
  // the head: mane in rows of curls round the face, brow, eyes, nose, jaws
  const hy = 1.02, yaw = o(0.14), hc = [0, hy, 0.1];
  sol([0, hy - 0.02, 0.04], [0.25, 0.24, 0.17], { yaw, n: full ? 12 : 8, m: full ? 6 : 4 });                                                                   // the mane's mass
  const nR = full ? 3 : 2;
  for (let r = 0; r < nR; r++) {
    const cnt = 8 + r * 2;
    for (let k = 0; k < cnt; k++) {
      const a = ((k + 0.5) / cnt) * Math.PI * 2 + r * 0.4 + Math.sin(k * 7.1 + h * 9) * 0.05, rad = 0.175 + r * 0.05;
      sol([Math.sin(a) * rad * 1.05, hy - 0.02 + Math.cos(a) * rad, 0.07 - r * 0.03], [0.08, 0.065, 0.06], { n: 6, m: 3, yaw: a });
    }
  }
  const fc = [Math.sin(yaw) * 0.14, hy, 0.17 + Math.cos(yaw) * 0.0];
  sol(fc, [0.14, 0.125, 0.12], { yaw });
  const cy = Math.cos(yaw), sy = Math.sin(yaw), at = (u, v, z) => [fc[0] + u * cy + z * sy, fc[1] + v, fc[2] - u * sy + z * cy];
  for (const q of [-1, 1]) {
    sol(at(q * 0.07, 0.065, 0.1), [0.04, 0.034, 0.035], { n: 7, m: 3 });                                                                                      // the bulging eye
    if (full) sol(at(q * 0.07, 0.065, 0.132), [0.015, 0.015, 0.01], { n: 5, m: 2 });
    S.pipe([at(q * 0.02, 0.115, 0.09), at(q * 0.075, 0.12, 0.1), at(q * 0.12, 0.095, 0.07)], [0.014, 0.014, 0.01], { seg: 2, n: 5, cap: 1 });             // the heavy brow
    sol(at(q * 0.115, 0.115, 0.03), [0.03, 0.04, 0.02], { n: 6, m: 3 });                                                                                      // the ear
  }
  sol(at(0, 0.0, 0.14), [0.05, 0.06, 0.05], { n: 8, m: 3 });                                                                                                  // the broad nose
  sol(at(0, -0.045, 0.15), [0.07, 0.03, 0.05], { n: 8, m: 3 });                                                                                               // the upper lip
  S.pipe([at(-0.07, -0.05, 0.12), at(0, -0.065, 0.17), at(0.07, -0.05, 0.12)], [0.014, 0.014, 0.014], { seg: 2, n: 5, cap: 1 });
  sol(at(0, -0.1, 0.12), [0.06, 0.022, 0.065], { yaw, tilt: 0.1, n: 8, m: 3 });                                                                                // the lower jaw, open
  if (full) {
    for (let i = 0; i < 6; i++) { const u = (i - 2.5) * 0.022; S.pipe([at(u, -0.058, 0.155), at(u, -0.08, 0.158)], [0.007, 0.001], { seg: 1, n: 4, cap: 1 }); S.pipe([at(u, -0.082, 0.14), at(u, -0.062, 0.143)], [0.007, 0.001], { seg: 1, n: 4, cap: 1 }); }   // the teeth
    for (const q of [-1, 1]) S.pipe([at(q * 0.05, -0.055, 0.15), at(q * 0.052, -0.095, 0.16)], [0.011, 0.002], { seg: 1, n: 4, cap: 1 });                    // the fangs
    sol(at(0, -0.088, 0.15), [0.03, 0.008, 0.04], { n: 6, m: 2 });                                                                                              // the tongue
  }
  // the tail curled up the back to a tuft
  S.pipe([[0, 0.28, -0.34], [0.03, 0.5, -0.42], [-0.02, 0.72, -0.34], [0.03, 0.88, -0.22]], [0.035, 0.03, 0.026, 0.02], { seg: 3, n: 6 });
  sol([0.03, 0.94, -0.2], [0.05, 0.065, 0.045], { n: 6, m: 3 });
  const g = S.geometry();
  return [plinth, g];
}
