// The beasts of the Nayaka temple as modelled sculpture (docs/settlements/madurai.md §17): the yali — the rearing lion with the
// head of an elephant, its trunk curled, tusks and mane — that rises from the bracket of the Thousand-Pillar Hall's aisle
// pillars, and the Nandi, the bull of Shiva, seated before his shrine. Built with the Sculpt kit (src/styles/nabataean/sculpt.js)
// in the beast's own frame (x to its right, y up, w forward; each about 1 long or high) and put in the world by an xf that turns,
// scales and moves it; a beast comes out as a body geometry (stone or stucco) and a gilt one (its jewels).
// `lod` 0 is the full carving, 1 the reduced one. No random numbers.

import { Sculpt, blob, blobDir, tube, rodT, torus } from '../nabataean/sculpt.js';

const PI = Math.PI;
const pleats = (a, n, p = 0) => (t, th) => 1 + a * Math.cos(n * th + p * t * 6.28);

/** A world transform for a beast frame: scale s, turned about the vertical by yaw (the frame's +w toward (sin yaw, cos yaw)), moved to (x, y, z). */
export const xfAt = (x, y, z, yaw, s) => { const c = Math.cos(yaw), n = Math.sin(yaw); return ([a, b, w]) => [x + s * (a * c + w * n), y + s * b, z + s * (-a * n + w * c)]; };

/**
 * A yali rearing against a pillar: its back to the shaft (w < 0), hind legs crouched on the bracket, forelegs raised with the
 * claws out, the elephant's head with its mane, ears, tusks and the trunk curling down over the chest. 1 high.
 */
export function yaliInto(Sb, Sg, lod = 0) {
  const sg = lod ? 6 : 8;
  tube(Sb, [[0, 0.17, 0.03, 0.15, 0.11], [0, 0.4, 0.05, 0.14, 0.12], [0, 0.6, 0.08, 0.17, 0.14]], { seg: lod ? 8 : 11, sub: 2, ref: [1, 0, 0], capN: 1 });          // the body, rising
  blob(Sb, [0, 0.5, 0.15], [0.12, 0.17, 0.08], 3, sg);                                                                                                      // the chest
  for (const s of [-1, 1]) {
    blob(Sb, [s * 0.12, 0.17, 0.02], [0.07, 0.1, 0.09], 3, sg);                                                                                            // the haunch
    tube(Sb, [[s * 0.15, 0.17, 0.03, 0.06], [s * 0.15, 0.08, 0.13, 0.04], [s * 0.15, 0.015, 0.17, 0.036]], { seg: lod ? 5 : 7, sub: 1, capN: 1 });          // the hind leg
    blobDir(Sb, [s * 0.15, 0.012, 0.22], [0, 0, 1], 0.06, 0.04, 0.02, [0, 1, 0], 2, 6);                                                                    // the paw
    tube(Sb, [[s * 0.16, 0.64, 0.08, 0.05], [s * 0.2, 0.55, 0.15, 0.04], [s * 0.2, 0.62, 0.27, 0.034]], { seg: lod ? 5 : 7, sub: 2, capN: 1 });            // the foreleg, raised
    blobDir(Sb, [s * 0.2, 0.66, 0.31], [0, 0.2, 1], 0.05, 0.034, 0.024, [0, 1, 0], 2, 6);                                                                   // the paw
    if (!lod) for (const k of [-1, 0, 1]) rodT(Sb, [s * 0.2 + k * 0.016, 0.66, 0.34], [s * 0.2 + k * 0.024, 0.62, 0.4], 0.008, 0.002, { seg: 4 });          // the claws
    tube(Sb, [[s * 0.16, 0.2, -0.02, 0.016], [s * 0.2, 0.36, -0.03, 0.02], [s * 0.2, 0.55, -0.02, 0.016]], { seg: 4, sub: 1, capN: 1 });                  // a flank rib / the loin cord
  }
  // the head: the skull, the brow, the eyes, the great ears, the mane round it, the open jaw
  const hc = [0, 0.83, 0.15];
  blob(Sb, hc, [0.095, 0.105, 0.1], 4, sg);
  blob(Sb, [0, 0.76, 0.2], [0.07, 0.04, 0.07], 2, sg);                                                                                                      // the jaw
  for (const s of [-1, 1]) {
    blob(Sb, [s * 0.15, 0.85, 0.12], [0.03, 0.095, 0.07], 3, 6);                                                                                            // an ear
    if (!lod) { blob(Sb, [s * 0.045, 0.865, 0.235], [0.02, 0.012, 0.016], 2, 5); blobDir(Sb, [s * 0.05, 0.885, 0.235], [s, -0.2, 0.2], 0.03, 0.009, 0.01, [0, 1, 0], 2, 5); }   // the eye and the brow
    rodT(Sg, [s * 0.04, 0.78, 0.22], [s * 0.085, 0.69, 0.33], 0.013, 0.004, { seg: lod ? 4 : 5 });                                                          // the tusk
  }
  // the trunk: down from between the eyes, in a loop curled up over the chest
  tube(Sb, [[0, 0.82, 0.24, 0.036], [0, 0.74, 0.29, 0.034], [0, 0.64, 0.31, 0.03], [0.02, 0.56, 0.3, 0.026], [0.06, 0.52, 0.28, 0.022], [0.085, 0.54, 0.27, 0.017], [0.07, 0.58, 0.27, 0.012]], { seg: lod ? 5 : 7, sub: 2, capN: 1, ref: [1, 0, 0] });
  if (!lod) for (let i = 0; i < 9; i++) { const a = (i / 9) * PI * 2 + 0.3; blobDir(Sb, [hc[0] + Math.cos(a) * 0.115, hc[1] + Math.sin(a) * 0.115, hc[2] - 0.03], [Math.cos(a), Math.sin(a), 0.1], 0.04, 0.02, 0.016, [0, 0, 1], 2, 5); }   // the mane's locks
  // the tail curled up the side, a tassel at its end
  tube(Sb, [[0.1, 0.12, -0.03, 0.018], [0.2, 0.22, -0.04, 0.016], [0.22, 0.4, -0.03, 0.014], [0.16, 0.52, -0.02, 0.012]], { seg: 4, sub: 2, capN: 1 });
  blob(Sg, [0.15, 0.56, -0.02], [0.02, 0.035, 0.02], 2, 5);
  // the jewels in the gilt: the collar, the girdle, the bangles on the forelegs, the crest
  torus(Sg, [0, 0.74, 0.12], [1, 0, 0], [0, 0, 1], 0.1, 0.01, { seg: lod ? 8 : 12, sec: 3 });
  torus(Sg, [0, 0.31, 0.05], [1, 0, 0], [0, 0, 1], 0.14, 0.011, { seg: lod ? 8 : 12, sec: 3 });
  if (!lod) { for (const s of [-1, 1]) torus(Sg, [s * 0.2, 0.585, 0.19], [1, 0, 0], [0, 0, 1], 0.036, 0.007, { seg: 6, sec: 3 }); blob(Sg, [0, 0.94, 0.14], [0.03, 0.05, 0.03], 2, 6); }
}

/** A seated Nandi facing +w: the humped back, the folded legs, the raised head with horns, the dewlap, the bell collar and the cloth on his back. 0.7 high, 1.15 long. */
export function nandiInto(Sb, Sg, lod = 0) {
  const sg = lod ? 6 : 8;
  tube(Sb, [[0, 0.24, -0.34, 0.15, 0.17], [0, 0.27, -0.1, 0.2, 0.2], [0, 0.31, 0.12, 0.19, 0.2], [0, 0.36, 0.27, 0.15, 0.16]], { seg: lod ? 9 : 14, sub: 2, ref: [1, 0, 0], capN: 1 });   // the barrel
  blob(Sb, [0, 0.5, 0.06], [0.11, 0.13, 0.15], 3, sg + 2);                                                                                                  // the hump
  for (const s of [-1, 1]) {
    blob(Sb, [s * 0.19, 0.17, -0.22], [0.1, 0.11, 0.15], 3, sg);                                                                                            // the folded hind leg
    blobDir(Sb, [s * 0.17, 0.04, -0.06], [0, 0, 1], 0.1, 0.045, 0.03, [0, 1, 0], 2, 6);
    tube(Sb, [[s * 0.15, 0.1, 0.14, 0.055], [s * 0.16, 0.065, 0.3, 0.05], [s * 0.15, 0.045, 0.42, 0.042]], { seg: lod ? 5 : 8, sub: 2, capN: 1 });          // the folded foreleg
    blobDir(Sb, [s * 0.15, 0.04, 0.46], [0, 0, 1], 0.05, 0.036, 0.022, [0, 1, 0], 2, 6);                                                                    // the hoof
  }
  // the neck rising to the head, the dewlap hanging under it
  tube(Sb, [[0, 0.38, 0.22, 0.11, 0.12], [0, 0.5, 0.3, 0.1, 0.11], [0, 0.6, 0.38, 0.085, 0.095]], { seg: lod ? 7 : 10, sub: 2, ref: [1, 0, 0], capN: 1 });
  tube(Sb, [[0, 0.4, 0.34, 0.03, 0.01], [0, 0.3, 0.36, 0.03, 0.05], [0, 0.22, 0.34, 0.028, 0.035]], { seg: 6, sub: 1, ref: [1, 0, 0], capN: 1 });
  // the head: the skull, the long muzzle, the nostrils, the eyes, the ears, the horns
  blobDir(Sb, [0, 0.63, 0.44], [0, 0.1, 1], 0.12, 0.075, 0.08, [1, 0, 0], 3, sg + 1);
  blobDir(Sb, [0, 0.58, 0.56], [0, -0.15, 1], 0.08, 0.06, 0.055, [1, 0, 0], 3, sg);
  if (!lod) {
    for (const s of [-1, 1]) {
      blob(Sb, [s * 0.025, 0.575, 0.64], [0.012, 0.01, 0.01], 2, 5);                                                                                        // a nostril
      blob(Sb, [s * 0.06, 0.67, 0.5], [0.014, 0.014, 0.018], 2, 5);                                                                                         // an eye
      blobDir(Sb, [s * 0.1, 0.7, 0.4], [s, 0.4, -0.3], 0.05, 0.015, 0.03, [0, 1, 0], 2, 6);                                                                 // an ear
    }
  }
  for (const s of [-1, 1]) tube(Sb, [[s * 0.065, 0.69, 0.4, 0.022], [s * 0.125, 0.74, 0.4, 0.018], [s * 0.14, 0.82, 0.44, 0.014], [s * 0.1, 0.89, 0.49, 0.008]], { seg: lod ? 5 : 6, sub: 2, capN: 1 });   // the horns
  // the tail along the flank
  tube(Sb, [[0.1, 0.34, -0.44, 0.02], [0.2, 0.28, -0.36, 0.017], [0.21, 0.16, -0.28, 0.013]], { seg: 4, sub: 2, capN: 1 });
  // the jewels (gilt): the collar of bells, the cloth on the back with its fringe, the forehead plate
  torus(Sg, [0, 0.49, 0.28], [1, 0, 0], [0, 0.6, -0.8], 0.125, 0.014, { seg: lod ? 9 : 14, sec: 3 });
  if (!lod) for (let i = 0; i < 7; i++) { const a = PI * (0.1 + 0.8 * i / 6); blob(Sg, [Math.cos(a) * 0.125, 0.49 - Math.sin(a) * 0.1, 0.28 + Math.sin(a) * 0.075], [0.016, 0.022, 0.016], 2, 5); }
  tube(Sg, [[-0.17, 0.3, 0.02, 0.012, 0.05], [0, 0.5, 0.02, 0.012, 0.05], [0.17, 0.3, 0.02, 0.012, 0.05]], { seg: 4, sub: 2, capN: 1, ref: [0, 0, 1] });
  tube(Sg, [[-0.215, 0.24, -0.1, 0.01, 0.03], [-0.19, 0.4, -0.1, 0.012, 0.03], [0, 0.56, -0.1, 0.012, 0.03], [0.19, 0.4, -0.1, 0.012, 0.03], [0.215, 0.24, -0.1, 0.01, 0.03]], { seg: 4, sub: 2, capN: 1, ref: [0, 0, 1] });
  blob(Sg, [0, 0.7, 0.47], [0.03, 0.02, 0.02], 2, 6);
}

const CACHE = new Map();
/** The yali and Nandi in the beast frame, cached: [bodyGeometry, giltGeometry]. */
export function beastParts(kind, lod) {
  const k = `${kind}/${lod}`;
  if (CACHE.has(k)) return CACHE.get(k);
  const Sb = new Sculpt((p) => p), Sg = new Sculpt((p) => p);
  (kind === 'yali' ? yaliInto : nandiInto)(Sb, Sg, lod);
  const r = [Sb.geometry(), Sg.geometry()];
  CACHE.set(k, r);
  return r;
}
void pleats;
