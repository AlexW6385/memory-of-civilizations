// Florentine sculpture seen from two metres (docs/settlements/florence.md §14): the standing saints and prophets of the
// niches, built as modelled volumes — rounded limbs, a torso, a head with brow, nose, lips, hair and beard, drapery whose
// folds follow the body — from the sculptor's kit of the Nabataean style (sculpt.js, figures.js), and the seated lion
// (the Marzocco). Each figure is built in its own frame (x to the viewer's right, y up, w toward the viewer; the figure's
// height 1) into a Sculpt, placed by `placeFigure` into the face frame (u, y, d) of the wall it stands before, and comes
// out as ONE geometry. `lod` 0 is the full carving (fingers, ears, every fold), 1 the reduced one for the far. Nothing is
// random: the variety of poses comes from the figure's index.

import { Sculpt, blob, blobDir, tube as tube0, rodT as rodT0, torus, add, mul } from '../nabataean/sculpt.js';
import { body, head, std, pleats, hand } from '../nabataean/figures.js';

const FAT = 1.16;                                                  // carved figures are fuller than life
const tube = (S, pts, o) => tube0(S, pts.map((p) => [p[0], p[1], p[2], p[3] * FAT, (p[4] ?? p[3]) * FAT]), o);
const rodT = (S, a, b, ra, rb = ra, o = {}) => rodT0(S, a, b, ra * FAT, rb * FAT, o);

/** A beard: the chin's fall of curls under the lips. */
function beard(S, c, lod) {
  blob(S, [c[0], c[1] - 0.05, c[2] + 0.034], [0.036, 0.04, 0.026], 3, lod ? 6 : 8);
  if (!lod) { blob(S, [c[0], c[1] - 0.085, c[2] + 0.03], [0.024, 0.03, 0.02], 2, 6); for (const s of [-1, 1]) blob(S, [c[0] + s * 0.03, c[1] - 0.026, c[2] + 0.03], [0.016, 0.026, 0.02], 2, 5); }
}

/**
 * A standing saint or prophet in the long tunic and the mantle, built facing +w. `v` picks the pose and the attributes:
 * 0 holds a book on the left arm and blesses; 1 leans on a cross-staff; 2 holds a scroll in both hands; 3 lays the right hand
 * on the breast and holds a book at the hip. v >= 4 turns the head the other way and reverses the pose.
 */
export function saint(S, lod, v = 0) {
  const pose = v % 4, flip = (v >> 2) & 1 ? -1 : 1, P = std(), x = (a) => a * flip;
  Object.assign(P, {
    hipL: [-0.045, 0.5, 0.0], kneeL: [-0.05, 0.27, 0.02], ankL: [-0.06, 0.045, 0.0], hipR: [0.045, 0.5, 0.0], kneeR: [0.055, 0.28, 0.07], ankR: [0.07, 0.045, 0.04],
    pelvis: [0, 0.5, 0], waist: [0.004, 0.6, 0.004], chest: [0.008, 0.74, 0.012], neckb: [0.01, 0.83, 0.012], head: [0.02 * flip, 0.935, 0.026],
  });
  const arms = [
    { shL: [-0.108, 0.8, 0], elL: [-0.14, 0.66, 0.04], wrL: [-0.1, 0.62, 0.11], shR: [0.108, 0.8, 0], elR: [0.17, 0.84, 0.035], wrR: [0.2, 0.94, 0.05] },
    { shL: [-0.108, 0.8, 0], elL: [-0.15, 0.66, 0.03], wrL: [-0.12, 0.56, 0.08], shR: [0.108, 0.8, 0.004], elR: [0.15, 0.68, 0.05], wrR: [0.15, 0.6, 0.11] },
    { shL: [-0.108, 0.8, 0.006], elL: [-0.09, 0.69, 0.06], wrL: [-0.025, 0.72, 0.1], shR: [0.108, 0.8, 0.006], elR: [0.09, 0.69, 0.06], wrR: [0.03, 0.73, 0.1] },
    { shL: [-0.108, 0.8, 0], elL: [-0.14, 0.64, 0.045], wrL: [-0.1, 0.55, 0.1], shR: [0.108, 0.8, 0.006], elR: [0.1, 0.7, 0.06], wrR: [0.04, 0.76, 0.095] },
  ][pose];
  if (flip < 0) for (const k of Object.keys(arms)) { const q = arms[k], t = k.replace(/[LR]$/, (m) => (m === 'L' ? 'R' : 'L')); P[t] = [-q[0], q[1], q[2]]; } else Object.assign(P, arms);
  body(S, P, { female: false, lod, hair: 'curls', legs: false });
  const hc = P.head;
  if (pose !== 3 && pose !== 1) beard(S, hc, lod);                                                       // prophets and apostles bearded
  blobDir(S, [hc[0], hc[1] + 0.028, hc[2] - 0.034], [0, 0.4, -1], 0.04, 0.056, 0.02, [1, 0, 0], 3, lod ? 6 : 8);   // the hair fallen behind the neck
  // the tunic: the bodice with its girdle, the skirt falling in folds from the hips to the feet, its hem on the plinth
  const seg = lod ? 12 : 20;
  tube(S, [[0.008, 0.815, 0.008, 0.096, 0.062], [0.006, 0.72, 0.01, 0.086, 0.06], [0.004, 0.62, 0.008, 0.074, 0.054]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.03, 5, 1.4) });
  tube(S, [[0.004, 0.62, 0.008, 0.076, 0.056], [0.0, 0.42, 0.012, 0.102, 0.082], [-0.004, 0.2, 0.02, 0.122, 0.1], [-0.006, 0.012, 0.024, 0.134, 0.112]], { seg, sub: 3, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.1, 11, 1.6 + 0.3 * (v % 3), 0.05) });
  blob(S, [x(0.052), 0.3, 0.078], [0.04, 0.07, 0.036], 3, 7);                                              // the free knee under the cloth
  torus(S, [0.004, 0.612, 0.01], [1, 0, 0], [0, 0, 1], 0.074, 0.007, { seg: lod ? 10 : 14, sec: 4 });      // the girdle
  // the mantle: over the left shoulder, across the breast to the right hip, the end hanging over the left forearm and down the back
  tube(S, [[x(-0.108), 0.84, 0.0, 0.034, 0.02], [x(-0.03), 0.75, 0.062, 0.036, 0.02], [x(0.05), 0.64, 0.07, 0.036, 0.02], [x(0.098), 0.5, 0.062, 0.04, 0.022]], { seg: lod ? 6 : 8, sub: 3, capN: 1, ref: [0, 0, 1], fold: pleats(0.14, 3, 1) });
  for (let i = 0; i < (lod ? 2 : 3); i++) tube(S, [[x(-0.13 - i * 0.014), 0.7, 0.05, 0.024, 0.012], [x(-0.165 - i * 0.016), 0.5, 0.05, 0.026, 0.013], [x(-0.17 - i * 0.02), 0.3 - i * 0.03, 0.044, 0.022, 0.011]], { seg: 6, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.15, 3, 2) });
  tube(S, [[x(-0.09), 0.84, -0.03, 0.07, 0.016], [x(-0.1), 0.55, -0.045, 0.084, 0.02], [x(-0.08), 0.2, -0.05, 0.1, 0.022]], { seg: lod ? 7 : 10, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.18, 4, 1.4) });   // the mantle behind
  // what he carries
  const L = (n) => (flip < 0 ? n.replace('L', 'X').replace('R', 'L').replace('X', 'R') : n);
  void L;
  const wl = P.wrL, wr = P.wrR;
  hand(S, wl, [0.1, pose === 1 ? -1 : 0.3, 0.6], [1, 0, 0], lod); hand(S, wr, [0.3, pose === 0 ? 1 : 0, pose === 0 ? 0.1 : 0.8], [-1, 0, 0], lod);
  if (pose === 0) { const a = flip > 0 ? wl : wr; blobBook(S, add(a, [0.0, 0.03, 0.03]), 0.07); }
  if (pose === 1) { const a = flip > 0 ? wr : wl; rodT(S, [a[0], a[1] - 0.45, a[2]], [a[0] + 0.005, a[1] + 0.42, a[2]], 0.0075, 0.007, { seg: 5 }); torus(S, [a[0] + 0.005, a[1] + 0.34, a[2]], [1, 0, 0], [0, 1, 0], 0.03, 0.006, { seg: 8, sec: 4 }); rodT(S, [a[0] - 0.03, a[1] + 0.34, a[2]], [a[0] + 0.04, a[1] + 0.34, a[2]], 0.006, 0.006, { seg: 4 }); }
  if (pose === 2) rodT(S, add(P.wrL, [0.01, 0.01, 0.01]), add(P.wrR, [-0.01, 0.01, 0.01]), 0.022, 0.022, { seg: 7 });   // the roll of the scroll
  if (pose === 3) { const a = flip > 0 ? wl : wr; blobBook(S, add(a, [0.02, 0.0, 0.02]), 0.06); }
}
/** A book held against the body (the Gospel): a block with its edge of leaves. */
function blobBook(S, c, s) { blob(S, c, [s * 0.9, s * 1.15, s * 0.28], 2, 6); }

/** A seated lion, the Marzocco, facing +w: upright on its haunches, the head high with its mane, the right forepaw on the shield with the lily. Height 1. */
export function marzocco(S, lod) {
  const sg = lod ? 8 : 12;
  tube0(S, [[0, 0.3, -0.12, 0.24, 0.2], [0, 0.55, -0.05, 0.2, 0.18], [0, 0.78, 0.02, 0.18, 0.17]], { seg: sg, sub: 3, ref: [1, 0, 0] });      // the body sitting up
  for (const s of [-1, 1]) {
    blob(S, [s * 0.15, 0.2, -0.12], [0.15, 0.2, 0.24], 3, sg);                                                                               // the haunch
    blob(S, [s * 0.1, 0.06, 0.18], [0.07, 0.06, 0.16], 3, 7);                                                                                // the hind foot
    blob(S, [s * 0.13, 0.78, 0.06], [0.1, 0.12, 0.1], 3, 8);                                                                                 // the shoulder
  }
  tube0(S, [[-0.1, 0.72, 0.1, 0.07], [-0.12, 0.4, 0.2, 0.06], [-0.12, 0.08, 0.26, 0.052]], { seg: lod ? 6 : 8, sub: 2 });                     // the left foreleg, straight down
  blob(S, [-0.12, 0.04, 0.32], [0.07, 0.04, 0.1], 3, 7);
  tube0(S, [[0.1, 0.72, 0.1, 0.07], [0.17, 0.55, 0.24, 0.06], [0.2, 0.46, 0.4, 0.052]], { seg: lod ? 6 : 8, sub: 2 });                        // the right foreleg, bent to the shield
  blob(S, [0.2, 0.44, 0.44], [0.07, 0.04, 0.08], 3, 7);
  if (!lod) for (const s of [-1, 1]) for (const dz of [0.03, 0.07]) blob(S, [-0.12 + s * 0.02, 0.04, 0.4 + dz * 0.4], [0.014, 0.014, 0.02], 2, 4);
  // the shield: a pointed shield with its lily, resting on the thigh and the plinth
  S.prism([[0.04, 0.5], [0.34, 0.5], [0.34, 0.26], [0.19, 0.1], [0.04, 0.26]], 0.2, 0.25);
  blob(S, [0.19, 0.36, 0.265], [0.05, 0.1, 0.02], 2, 6); blob(S, [0.19, 0.4, 0.27], [0.09, 0.025, 0.018], 2, 6);
  // the head: the skull in its great mane, brow, muzzle, nose, lips, ears, turned to the viewer
  const h = [0, 0.96, 0.16];
  blob(S, [h[0], h[1], h[2] - 0.04], [0.2, 0.2, 0.15], 4, sg);                                                                                // the mane
  if (!lod) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; blobDir(S, [h[0] + Math.cos(a) * 0.19, h[1] + Math.sin(a) * 0.19, h[2] - 0.05], [Math.cos(a), Math.sin(a), 0.1], 0.07, 0.036, 0.03, [0, 0, 1], 2, 5); }
  blob(S, h, [0.115, 0.125, 0.11], 4, sg);
  blob(S, [h[0], h[1] - 0.045, h[2] + 0.1], [0.07, 0.056, 0.07], 3, 8);                                                                       // the muzzle
  blob(S, [h[0], h[1] - 0.012, h[2] + 0.158], [0.032, 0.024, 0.024], 2, 6);                                                                   // the nose
  blob(S, [h[0], h[1] - 0.085, h[2] + 0.13], [0.04, 0.016, 0.03], 2, 6);                                                                      // the jaw
  for (const s of [-1, 1]) {
    blobDir(S, [h[0] + s * 0.05, h[1] + 0.045, h[2] + 0.1], [s, -0.2, 0.2], 0.046, 0.016, 0.018, [0, 1, 0], 2, 6);                            // the brow
    blob(S, [h[0] + s * 0.062, h[1] + 0.12, h[2] - 0.02], [0.03, 0.034, 0.016], 2, 6);                                                        // the ear
  }
  tube0(S, [[0.0, 0.2, -0.28, 0.026], [-0.2, 0.1, -0.3, 0.022], [-0.3, 0.14, -0.14, 0.02], [-0.22, 0.22, -0.02, 0.026]], { seg: 5, sub: 2, capN: 1 });   // the tail round the haunch
}

/** Build a figure `fn` (frame: height 1) into a new Sculpt placed by (u, y, d) with height H, turned `yaw` about the vertical, and return its geometry. */
export function placeFigure(fn, u, y, d, H, lod, v = 0, yaw = 0) {
  const S = new Sculpt(), c = Math.cos(yaw), s = Math.sin(yaw);
  S.xf = ([a, b, w]) => [u + (a * c + w * s) * H, y + b * H, d + (-a * s + w * c) * H];
  fn(S, lod, v);
  return S.geometry();
}
void mul;

/** A portrait head in a roundel (the heads of Ghiberti's frames: prophets, sibyls, the artist himself), facing +w, about 11 cm high at k 0.85. */
export function portraitHead(S, lod, v = 0) {
  const k = 0.85;
  head(S, [0, 0, 0], { lod, hair: v % 5 === 4 ? 'bun' : 'curls', k });
  if (v % 3 === 0) beard(S, [0, 0, 0], lod);
  tube(S, [[0, -0.05, 0, 0.034], [0, -0.1, -0.01, 0.04]], { seg: 6, sub: 1, cap: [0, 0] });
}
