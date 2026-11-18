// Khafre seated (docs/settlements/giza.md §18): the diorite king on a throne with lion's legs, the falcon of Horus behind his head with
// its wings round the nemes, the shendyt over the thighs, the torso with its chest and shoulders, the hands flat on the knees (the right
// a fist on a folded cloth), the head with brow, eyes, nose, lips, the nemes' lappets and the false beard; on a low base of alabaster.
// One call places one statue; `S` = { g: Sculpt (the dark stone), m: Sculpt (the alabaster) }, whose transforms it sets.

import { stand, ik, limb, head, hairOf, hash3 } from './anatomy.js';
import { blob, blobDir, tube } from '../nabataean/sculpt.js';

const HEAD = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 };

export function khafre(S, x, y, z, face, lod = 0) {
  const { g: G, m: M } = S, h = hash3(x, y, z, 3), xf = stand(x, y, z, HEAD[face]);
  G.xf = M.xf = xf;
  const sg8 = lod ? 6 : 10, hs = 1 + (h - 0.5) * 0.04;
  M.box(-0.5, 0, -0.5, 0.5, 0.22, 0.5);                                              // the alabaster base
  // the throne: the seat, the back slab, the sides with the lion's legs, the footboard
  G.box(-0.3, 0.22, -0.4, 0.3, 0.6, 0.04); G.box(-0.3, 0.6, -0.42, 0.3, 1.46 + h * 0.02, -0.3); G.box(-0.3, 0.22, 0.34, 0.3, 0.3, 0.5);
  for (const sg of [-1, 1]) {
    const lx = sg * 0.39;
    tube(G, [[lx, 0.62, 0.3, 0.05, 0.085], [lx, 0.48, 0.345, 0.05, 0.075], [lx, 0.33, 0.37, 0.05, 0.065]], { seg: sg8, sub: 2, ref: [1, 0, 0] });          // the foreleg
    blobDir(G, [lx, 0.27, 0.44], [0, 0, 1], 0.12, 0.05, 0.065, [0, 1, 0], 3, sg8);                                                                       // its paw
    tube(G, [[lx, 0.62, -0.3, 0.05, 0.1], [lx, 0.45, -0.37, 0.05, 0.07], [lx, 0.3, -0.35, 0.05, 0.06]], { seg: sg8, sub: 2, ref: [1, 0, 0] });         // the hind leg
    blobDir(G, [lx, 0.265, -0.28], [0, 0, 1], 0.11, 0.05, 0.06, [0, 1, 0], 3, sg8);
    G.box(Math.min(sg * 0.3, sg * 0.34), 0.22, -0.4, Math.max(sg * 0.3, sg * 0.34), 0.62, 0.36);                                                       // the side panel
    blob(G, [sg * 0.34, 0.6, 0.31], [0.06, 0.05, 0.06], 2, 6);                                                                                         // the knuckle of the thigh
  }
  // the body: pelvis, belly, chest, shoulders; the legs bent on the seat, the feet on the footboard
  const L = (a) => a, P = [0, 0.66, -0.1];
  tube(G, [[...P, 0.15, 0.1], [0, 0.82, -0.1, 0.14, 0.095], [0, 0.98, -0.1, 0.135, 0.095], [0, 1.14, -0.095, 0.175 * hs, 0.115], [0, 1.27, -0.09, 0.2 * hs, 0.1], [0, 1.34, -0.09, 0.09, 0.07]], { seg: lod ? 10 : 16, sub: 2, ref: [1, 0, 0] });
  if (!lod) for (const sg of [-1, 1]) { blobDir(G, [sg * 0.09, 1.1, 0.0], [sg * 0.4, -0.2, 1], 0.07, 0.07, 0.035, [0, 1, 0], 3, 8); blob(G, [sg * 0.1, 1.1, -0.18], [0.085, 0.11, 0.035], 3, 8); }
  for (const sg of [-1, 1]) {
    const hip = [sg * 0.1, 0.7, -0.08], t = [sg * 0.12, 0.3, 0.3], { knee, end } = ik(hip, t, 0.38, 0.4, [0, 1, 0.2]);
    const kn = [sg * 0.12, 0.74, 0.3];
    limb(G, [hip, kn, [sg * 0.12, 0.3, 0.34]], [[0, 0.09, 0.09], [0.4, 0.078, 0.07], [0.52, 0.056, 0.058], [0.68, 0.052, 0.05], [1, 0.034, 0.034]], { lod });
    blob(G, [sg * 0.12, 0.76, 0.32], [0.05, 0.05, 0.04], 2, 7);                                                                                   // the kneecap
    blobDir(G, [sg * 0.12, 0.26, 0.4], [0, 0, 1], 0.12, 0.045, 0.05, [0, 1, 0], 3, sg8);                                                         // the foot
    void knee; void end;
    // the arm: down to the elbow, the forearm forward to the knee
    const a = [sg * 0.21, 1.26, -0.09], el = [sg * 0.23, 1.0, -0.12], wr = [sg * 0.13, 0.84, 0.22];
    limb(G, [a, el, wr], [[0, 0.052, 0.055], [0.3, 0.054, 0.056], [0.5, 0.04, 0.042], [0.6, 0.044, 0.042], [1, 0.026, 0.022]], { lod });
    blob(G, [sg * 0.215, 1.26, -0.09], [0.065, 0.07, 0.065], 3, 8);                                                                              // the shoulder
    if (sg < 0) blobDir(G, [sg * 0.13, 0.83, 0.31], [0, 0, 1], 0.1, 0.042, 0.016, [0, 1, 0], 2, 7);                                              // the left hand, flat on the knee
    else { blob(G, [sg * 0.125, 0.835, 0.27], [0.04, 0.036, 0.05], 3, 7); tube(G, [[0.125, 0.85, 0.2, 0.012], [0.125, 0.85, 0.34, 0.012]], { seg: 5, sub: 1, capN: 1 }); }
  }
  // the shendyt over the lap: the wrapped cloth on the thighs, the stiff apron's wedge between the knees, the belt
  tube(G, [[0, 0.98, -0.1, 0.15, 0.11], [0, 0.8, -0.1, 0.175, 0.125], [0, 0.7, -0.04, 0.19, 0.14]], { seg: lod ? 10 : 16, sub: 1, ref: [1, 0, 0], cap: [0, 0] });
  for (const sg of [-1, 1]) blobDir(G, [sg * 0.11, 0.775, 0.1], [0, 0, 1], 0.24, 0.1, 0.05, [0, 1, 0], 3, sg8);
  blobDir(G, [0, 0.74, 0.22], [0, -0.1, 1], 0.2, 0.07, 0.025, [0, 1, 0], 2, 7);
  // the head: the face, the nemes' dome and its lappets on the chest, the false beard, the uraeus
  const hc = [0, 1.47, -0.07], fw = [0, -0.04, 1];
  head(G, null, hc, fw, [0, 1, 0], { k: 1, lod });
  hairOf(G, hc, fw, [0, 1, 0], { k: 1, lod, hair: 'wig' });
  for (const sg of [-1, 1]) tube(G, [[sg * 0.13, 1.4, 0.0, 0.05, 0.02], [sg * 0.15, 1.22, 0.075, 0.055, 0.02], [sg * 0.15, 1.06, 0.11, 0.055, 0.02]], { seg: 6, sub: 2, ref: [1, 0, 0], capN: 1 });   // the lappets
  tube(G, [[0, 1.4, 0.075, 0.018, 0.022], [0, 1.31, 0.095, 0.026, 0.03], [0, 1.25, 0.12, 0.024, 0.026]], { seg: 6, sub: 2, ref: [1, 0, 0], capN: 1 });   // the beard
  blob(G, [0, 1.575, 0.04], [0.012, 0.025, 0.012], 2, 5);                                                                                         // the uraeus
  // the falcon: its head above the nape, the body against the back slab, its wings reaching round the head
  blob(G, [0, 1.57, -0.33], [0.05, 0.075, 0.06], 3, 8); blobDir(G, [0, 1.55, -0.28], [0, -0.4, 1], 0.045, 0.022, 0.022, [1, 0, 0], 2, 6);
  blobDir(G, [0, 1.36, -0.33], [0, 1, 0], 0.17, 0.09, 0.07, [1, 0, 0], 3, 8);
  for (const sg of [-1, 1]) tube(G, [[sg * 0.08, 1.44, -0.34, 0.12, 0.02], [sg * 0.17, 1.44, -0.27, 0.12, 0.02], [sg * 0.2, 1.43, -0.17, 0.12, 0.02], [sg * 0.2, 1.42, -0.1, 0.1, 0.02]], { seg: 6, sub: 2, ref: [0, 1, 0], capN: 1 });
  void L;
}
