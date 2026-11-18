// The Khazneh's carved figures as modelled sculpture (docs/settlements/petra.md §22): the Amazons with the double axe and
// the pelta, the winged Victories, Isis-Tyche with her cornucopia under her mural crown, the eagles, the couchant lions
// and sphinxes, the griffins of the frieze with their kantharoi, the gorgoneia and the vine scrolls. Each is built in its
// own frame (x to the viewer's right, y up, w out of the wall; the figure's height 1) into a Sculpt, from rounded limbs,
// a torso, a head with brow, nose, lips and hair, drapery as folds that follow the body. `lod` 0 is the full carving
// (fingers, ears, eyes, every feather), 1 the reduced one for the far (fewer segments and feathers). Reliefs are
// flattened and cut at the wall by the Sculpt (flat, clip).

import { Sculpt, turned, blob, blobDir, tube as tube0, rodT as rodT0, torus, sheet, add, sub, mul, norm, len, cross, hash3 } from './sculpt.js';

const PI = Math.PI;
// heroic bulk: carved figures are fuller than life, so that they read from far (every section is this much thicker)
const FAT = 1.22;
const tube = (S, pts, o) => tube0(S, pts.map((p) => [p[0], p[1], p[2], p[3] * FAT, (p[4] ?? p[3]) * FAT]), o);
const rodT = (S, a, b, ra, rb = ra, o = {}) => rodT0(S, a, b, ra * FAT, rb * FAT, o);
/** A limb through the joints J (polyline), its section [fraction along it, ra, rb] — the swelling of thigh, knee, calf. */
function limb(S, J, prof, { lod = 0, ref = [0, 0, 1], cap = [1, 1] } = {}) {
  const cum = [0]; for (let i = 0; i + 1 < J.length; i++) cum.push(cum[i] + len(sub(J[i + 1], J[i])));
  const tot = cum[cum.length - 1];
  const at = (f) => { const d = f * tot; let i = 0; while (i + 2 < J.length && cum[i + 1] < d) i++; const t = (d - cum[i]) / ((cum[i + 1] - cum[i]) || 1); return add(J[i], mul(sub(J[i + 1], J[i]), Math.max(0, Math.min(1, t)))); };
  tube(S, prof.map(([f, ra, rb]) => [...at(f), ra, rb ?? ra]), { seg: lod ? 6 : 9, sub: 2, ref, cap });
}
/** A head: skull, jaw, brow ridge, nose, lips, eyes and ears, and hair. c the head's centre; looks along +w. */
function head(S, c, { female = false, lod = 0, hair = 'curls', k = 1 } = {}) {
  const [x, y, z] = c, q = (dx, dy, dz) => [x + dx * k, y + dy * k, z + dz * k], r = (a, b, d) => [a * k, b * k, d * k];
  const sg = lod ? 6 : 9;
  blob(S, c, r(0.05, 0.064, 0.058), 4, sg);                                          // the skull
  blob(S, q(0, -0.036, 0.016), r(0.036, 0.034, 0.038), 3, sg);                        // the jaw and chin
  for (const s of [-1, 1]) { blobDir(S, q(s * 0.024, 0.02, 0.045), [s, -0.15, 0.1], 0.02 * k, 0.006 * k, 0.008 * k, [0, 1, 0], 2, 6); blob(S, q(s * 0.02, 0.008, 0.048), r(0.009, 0.005, 0.006), 2, 6); }   // the brows and eyes
  blobDir(S, q(0, -0.004, 0.054), [0, -0.5, 0.55], 0.016 * k, 0.006 * k, 0.008 * k, [1, 0, 0], 3, 6);   // the nose
  blob(S, q(0, -0.025, 0.05), r(0.013, 0.004, 0.006), 2, 6); blob(S, q(0, -0.032, 0.049), r(0.011, 0.004, 0.006), 2, 6);   // the lips
  if (!lod) {
    for (const s of [-1, 1]) {
      blob(S, q(s * 0.051, 0, -0.004), r(0.005, 0.016, 0.011), 3, 6);                   // an ear
      blob(S, q(s * 0.03, -0.016, 0.046), r(0.011, 0.008, 0.007), 2, 6);               // a cheek
    }
  }
  if (hair === 'curls') {
    blob(S, q(0, 0.012, -0.01), r(0.054, 0.062, 0.058), 4, sg);
    for (let i = 0; i < (lod ? 5 : 9); i++) { const a = PI * (0.1 + 0.8 * i / ((lod ? 5 : 9) - 1)); blob(S, q(Math.cos(a) * 0.046, 0.05 + Math.sin(a) * 0.012, 0.042 - Math.abs(Math.cos(a)) * 0.01), r(0.013, 0.012, 0.012), 2, 5); }
  } else if (hair === 'bun') {
    blob(S, q(0, 0.014, -0.012), r(0.054, 0.062, 0.058), 4, sg);
    blob(S, q(0, -0.004, -0.06), r(0.026, 0.03, 0.02), 3, 6);                           // the knot behind
    for (const s of [-1, 1]) tube(S, [[x + s * 0.052 * k, y + 0.01 * k, z + 0.0, 0.011 * k], [x + s * 0.055 * k, y - 0.045 * k, z - 0.004 * k, 0.012 * k], [x + s * 0.045 * k, y - 0.1 * k, z - 0.012 * k, 0.008 * k]], { seg: 5, sub: 1, capN: 1 });
  } else if (hair === 'helm') {
    blob(S, q(0, 0.02, -0.004), r(0.057, 0.066, 0.062), 4, sg);                         // a plain cap (the pilos or helmet)
    blob(S, q(0, 0.07, -0.01), r(0.012, 0.02, 0.03), 3, 6);
  }
  void female;
}
/** A hand: the palm and the fingers together, a thumb. wr the wrist, d the direction along the hand, s the side the thumb is on. */
function hand(S, wr, d, side, lod, k = 1) {
  const dd = norm(d), c = add(wr, mul(dd, 0.02 * k));
  blobDir(S, c, dd, 0.022 * k, 0.012 * k, 0.007 * k, side, 3, 6);
  if (!lod) { blobDir(S, add(wr, mul(dd, 0.045 * k)), dd, 0.02 * k, 0.012 * k, 0.005 * k, side, 3, 6); rodT(S, add(wr, mul(side, 0.01 * k)), add(add(wr, mul(side, 0.022 * k)), mul(dd, 0.03 * k)), 0.006 * k, 0.004 * k); }
}
/** A foot in a sandal: from the ankle a forward along w. */
function foot(S, an, lod, dirx = 0) {
  blobDir(S, add(an, [dirx * 0.008, -0.026, 0.026]), [dirx * 0.2, -0.1, 1], 0.045, 0.017, 0.012, [1, 0, 0], 3, lod ? 5 : 7);
  blob(S, add(an, [0, -0.006, -0.005]), [0.018, 0.022, 0.02], 3, 6);
}
/** The body of a standing human: legs, torso, neck, arms, head (the clothes are added by each figure). */
function body(S, P, { female = true, lod = 0, hair = 'curls', legs = true, arms = true } = {}) {
  const w = female ? 0.9 : 1;
  if (legs) for (const s of ['L', 'R']) {
    const J = [P['hip' + s], P['knee' + s], P['ank' + s]];
    limb(S, J, [[0, 0.046, 0.046], [0.25, 0.05, 0.05], [0.5, 0.034, 0.036], [0.65, 0.038, 0.042], [0.92, 0.021, 0.023], [1, 0.02, 0.02]], { lod });
    foot(S, P['ank' + s], lod, s === 'L' ? -1 : 1);
  }
  // the torso: pelvis, waist, ribs, shoulders — wider across than deep
  tube(S, [[...P.pelvis, 0.07 * w, 0.048], [...P.waist, 0.055 * w, 0.042], [...P.chest, 0.088 * (female ? 0.92 : 1.05), 0.055], [...P.neckb, 0.07, 0.04]], { seg: lod ? 8 : 12, sub: 3, ref: [1, 0, 0] });
  const sh = (s) => P['sh' + s];
  for (const s of ['L', 'R']) blob(S, add(sh(s), [0, 0.004, -0.004]), [0.034, 0.03, 0.034], 3, 7);          // the shoulder
  if (female) for (const s of [-1, 1]) blob(S, add(P.chest, [s * 0.038, -0.01, 0.036]), [0.032, 0.03, 0.026], 3, 7);   // the breasts
  tube(S, [[...P.neckb, 0.03], [...P.head, 0.026]].map((p, i) => i ? [p[0], p[1] - 0.04, p[2], 0.027] : p), { seg: 7, sub: 1 });
  if (arms) for (const s of ['L', 'R']) {
    const J = [sh(s), P['el' + s], P['wr' + s]];
    limb(S, J, [[0, 0.036, 0.034], [0.3, 0.032, 0.032], [0.5, 0.022, 0.022], [0.62, 0.026, 0.024], [1, 0.015, 0.016]], { lod, ref: [0, 0, 1] });
  }
  head(S, P.head, { female, lod, hair });
}
const std = () => ({
  hipL: [-0.045, 0.5, 0], kneeL: [-0.05, 0.27, 0.01], ankL: [-0.05, 0.045, 0], hipR: [0.045, 0.5, 0], kneeR: [0.05, 0.27, 0.01], ankR: [0.05, 0.045, 0],
  pelvis: [0, 0.5, 0], waist: [0, 0.6, 0], chest: [0, 0.74, 0.004], neckb: [0, 0.83, 0], head: [0, 0.935, 0.01],
  shL: [-0.105, 0.8, 0], elL: [-0.13, 0.65, 0.01], wrL: [-0.12, 0.52, 0.03], shR: [0.105, 0.8, 0], elR: [0.13, 0.65, 0.01], wrR: [0.12, 0.52, 0.03],
});
/** Pleats: a section scale 1 + a·cos(n·θ + p·t) (folds that run down the cloth and drift with the body). */
const pleats = (a, n, p, a2 = 0) => (t, th) => 1 + (a + a2 * t) * Math.cos(n * th + p * t * 6.28);

/** A feather: a flat blade from root r along direction d, length L, width W, curving by `bend` (toward `bd`). */
function feather(S, r, d, L, W, bend = 0, bd = [0, -1, 0], th = 0.006) {
  const dd = norm(d), m = add(add(r, mul(dd, L * 0.5)), mul(bd, bend * 0.5)), e = add(add(r, mul(dd, L)), mul(bd, bend * 1.2));
  tube(S, [[r[0], r[1], r[2], W * 0.45, th], [m[0], m[1], m[2], W * 0.5, th], [e[0], e[1], e[2], W * 0.2, th * 0.6]], { seg: 6, sub: 1, capN: 1, ref: cross(dd, [0, 0, 1]) });
}
/** A wing spread to one side (s = ±1) from the shoulder blade `root`: rows of long flight feathers fanned over the coverts. */
function wing(S, root, s, { span = 0.4, up = 0.55, lod = 0, droop = 0.35 }) {
  const n = lod ? 6 : 10;
  for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
    const t = i / (n - 1), a = (up - droop * 2 * t) - (row ? 0.05 : 0), L = span * (row ? 0.62 : 1) * (1 - 0.18 * Math.abs(0.4 - t)), W = 0.072 * (row ? 0.9 : 1);
    const r = add(root, [s * 0.026 * i, 0.012 * i, 0.012 * (row ? 1 : 0) - 0.01 * row]);
    feather(S, add(r, [0, 0, row ? 0.012 : 0]), [s * Math.cos(a), Math.sin(a), 0], L, W, 0.04 + 0.04 * t, [0, -1, 0]);
  }
  blobDir(S, add(root, [s * 0.1, 0.02, 0.012]), [s, 0.4, 0], 0.15, 0.04, 0.02, [0, 0, 1], 3, 6);
}

/** An Amazon in the short belted chiton, raising the double axe in her right hand and the pelta on her left arm. */
export function amazon(S, lod) {
  const P = std();
  Object.assign(P, { hipL: [-0.05, 0.5, 0.01], kneeL: [-0.075, 0.27, 0.06], ankL: [-0.1, 0.045, 0.01], pelvis: [0, 0.5, 0], waist: [0.005, 0.6, 0.006], chest: [0.012, 0.74, 0.01], head: [0.02, 0.935, 0.018],
    shR: [0.108, 0.805, 0], elR: [0.175, 0.885, 0.02], wrR: [0.17, 0.99, 0.03], shL: [-0.098, 0.795, 0.005], elL: [-0.14, 0.68, 0.035], wrL: [-0.135, 0.585, 0.075] });
  body(S, P, { lod, hair: 'helm' });
  // the chiton: the tunic over the torso with its gathers above the belt, the skirt flared to mid thigh in pleats, the belt
  tube(S, [[0.004, 0.68, 0.006, 0.088, 0.058], [0.004, 0.62, 0.005, 0.066, 0.05]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.03, 5, 1.6) });
  tube(S, [[0.002, 0.62, 0.004, 0.071, 0.054], [0.0, 0.52, 0.006, 0.096, 0.072], [-0.004, 0.4, 0.01, 0.118, 0.092]], { seg: lod ? 10 : 16, sub: 3, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.05, 9, 1.2, 0.05) });
  torus(S, [0.003, 0.615, 0.004], [1, 0, 0], [0, 0, 1], 0.07, 0.011, { seg: lod ? 10 : 14, sec: 5, rb: 0.01 });
  // a cloak thrown back over the left shoulder and hanging in broad folds beside the body
  for (let i = 0; i < 2; i++) tube(S, [[-0.1 - i * 0.05, 0.85, -0.02, 0.05, 0.012], [-0.125 - i * 0.05, 0.62, -0.02, 0.058, 0.014], [-0.15 - i * 0.07, 0.36 - i * 0.05, -0.012, 0.05, 0.012]], { seg: lod ? 7 : 10, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.22, 4, 2 + i, 0.1) });
  // greaves and the thongs of the boots
  for (const s of [-1, 1]) { const J = s < 0 ? [P.kneeL, P.ankL] : [P.kneeR, P.ankR]; tube(S, [[J[0][0], J[0][1] - 0.02, J[0][2] + 0.005, 0.038], [J[1][0], J[1][1] + 0.03, J[1][2] + 0.002, 0.029]], { seg: lod ? 6 : 9, sub: 1, capN: 1 }); }
  hand(S, P.wrR, [0, 1, 0.1], [-1, 0, 0], lod); hand(S, P.wrL, [0, -1, 0.5], [1, 0, 0], lod);
  // the double axe: the haft through the fist, a crescent blade each side near its top
  rodT(S, [0.168, 0.86, 0.034], [0.172, 1.2, 0.034], 0.0085, 0.0075, { seg: 6 });
  for (const s of [-1, 1]) { const c = [0.17, 1.15, 0.034]; blobDir(S, add(c, [s * 0.045, 0, 0]), [s, 0.2, 0], 0.05, 0.062, 0.007, [0, 1, 0], 3, 8); blobDir(S, add(c, [s * 0.015, 0, 0]), [s, 0, 0], 0.03, 0.02, 0.016, [0, 1, 0], 2, 6); }
  // the pelta: a crescent shield held on the left arm
  torus(S, [-0.13, 0.5, 0.1], [1, 0, 0], [0, 1, 0.1], 0.08, 0.016, { seg: 14, sec: 5, arc: PI * 1.25, from: PI * 0.88, rb: 0.01 });
  blob(S, [-0.13, 0.485, 0.1], [0.08, 0.034, 0.008], 2, 8);
}
/** A winged Victory in the long peplos, a wreath raised in her right hand, the palm in her left. */
export function victory(S, lod) {
  const P = std();
  Object.assign(P, { hipL: [-0.04, 0.5, 0.01], kneeL: [-0.06, 0.28, 0.07], ankL: [-0.07, 0.05, 0.03], pelvis: [0.004, 0.5, 0.004], waist: [0.006, 0.6, 0.008], chest: [0.01, 0.74, 0.012], head: [0.016, 0.935, 0.02],
    shR: [0.1, 0.805, 0.004], elR: [0.15, 0.87, 0.03], wrR: [0.17, 0.97, 0.05], shL: [-0.092, 0.795, 0.008], elL: [-0.12, 0.68, 0.04], wrL: [-0.11, 0.6, 0.07] });
  body(S, P, { lod, hair: 'bun', legs: false });
  wing(S, [0.06, 0.78, -0.012], 1, { span: 0.36, up: 1.2, lod, droop: 0.62 }); wing(S, [-0.05, 0.78, -0.012], -1, { span: 0.36, up: 1.2, lod, droop: 0.62 });
  // the peplos: the bodice with its overfold and girdle, the skirt falling in folds from the free knee to the feet
  tube(S, [[0.01, 0.8, 0.012, 0.094, 0.06], [0.006, 0.7, 0.01, 0.08, 0.056], [0.004, 0.6, 0.01, 0.068, 0.05]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.02, 4, 2.2) });
  tube(S, [[0.004, 0.6, 0.008, 0.072, 0.054], [0.0, 0.42, 0.02, 0.1, 0.082], [-0.01, 0.2, 0.026, 0.118, 0.1], [-0.012, 0.025, 0.02, 0.128, 0.108]], { seg: lod ? 12 : 18, sub: 3, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.11, 11, 2.0, 0.05) });
  blob(S, [-0.052, 0.3, 0.085], [0.04, 0.07, 0.038], 3, 7);                                           // the free knee under the cloth
  torus(S, [0.006, 0.605, 0.012], [1, 0, 0], [0, 0, 1], 0.073, 0.008, { seg: lod ? 10 : 14, sec: 5 });
  // the swing of the himation's hem over the hip
  tube(S, [[-0.07, 0.58, 0.05, 0.014, 0.008], [0.0, 0.5, 0.075, 0.02, 0.01], [0.07, 0.4, 0.07, 0.016, 0.009]], { seg: 5, sub: 2, capN: 1, ref: [0, 1, 0] });
  hand(S, P.wrR, [0.3, 1, 0], [-1, 0, 0], lod);
  torus(S, [0.185, 1.04, 0.052], [1, 0, 0], [0, 1, 0], 0.052, 0.011, { seg: lod ? 10 : 14, sec: 5 });      // the wreath
  for (let i = 0; i < (lod ? 5 : 9); i++) { const a = i / (lod ? 5 : 9) * 6.28; blobDir(S, [0.185 + Math.cos(a) * 0.052, 1.04 + Math.sin(a) * 0.052, 0.058], [-Math.sin(a), Math.cos(a), 0.2], 0.014, 0.007, 0.003, [0, 0, 1], 2, 5); }
  hand(S, P.wrL, [0, -1, 0.3], [1, 0, 0], lod);
  rodT(S, [-0.115, 0.52, 0.08], [-0.15, 0.98, 0.04], 0.006, 0.004, { seg: 5 });                    // the palm branch
  for (let i = 0; i < (lod ? 4 : 7); i++) { const t = 0.55 + i * 0.07; for (const s of [-1, 1]) blobDir(S, [-0.115 - (t - 0.5) * 0.08 + s * 0.016, 0.5 + t * 0.5 + 0.02, 0.06], [s * 0.6, 0.8, 0], 0.03, 0.006, 0.003, [0, 0, 1], 2, 5); }
}
/** Isis-Tyche: the long chiton and the himation, the mural crown, the cornucopia on her left arm, the patera in her right hand. */
export function goddess(S, lod) {
  const P = std();
  Object.assign(P, { hipL: [-0.04, 0.5, 0.01], kneeL: [-0.055, 0.28, 0.06], ankL: [-0.06, 0.05, 0.02], pelvis: [0.004, 0.5, 0.004], waist: [0.005, 0.6, 0.006], chest: [0.008, 0.74, 0.01], head: [0.012, 0.935, 0.018],
    shR: [0.1, 0.805, 0.004], elR: [0.15, 0.7, 0.05], wrR: [0.18, 0.6, 0.11], shL: [-0.094, 0.795, 0.006], elL: [-0.13, 0.68, 0.03], wrL: [-0.12, 0.6, 0.08] });
  body(S, P, { lod, hair: 'bun', legs: false });
  tube(S, [[0.008, 0.8, 0.01, 0.09, 0.06], [0.005, 0.66, 0.009, 0.074, 0.054]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.025, 5, 1.4) });
  tube(S, [[0.004, 0.62, 0.008, 0.074, 0.056], [0.0, 0.42, 0.016, 0.1, 0.082], [-0.004, 0.2, 0.022, 0.118, 0.098], [-0.006, 0.03, 0.02, 0.128, 0.106]], { seg: lod ? 12 : 18, sub: 3, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.09, 10, 1.6, 0.05) });
  blob(S, [-0.05, 0.3, 0.07], [0.036, 0.06, 0.034], 3, 7);
  // the himation: from the left shoulder across the breast and down to the right hip, and the fold over the left forearm
  tube(S, [[-0.1, 0.83, 0.03, 0.022, 0.014], [-0.03, 0.74, 0.062, 0.026, 0.016], [0.05, 0.64, 0.07, 0.026, 0.016], [0.095, 0.5, 0.062, 0.03, 0.018]], { seg: 6, sub: 3, capN: 1, ref: [0, 0, 1], fold: pleats(0.12, 3, 1) });
  for (let i = 0; i < (lod ? 2 : 4); i++) tube(S, [[-0.13 - i * 0.012, 0.66, 0.05, 0.016, 0.01], [-0.16 - i * 0.014, 0.5, 0.045, 0.018, 0.01], [-0.165 - i * 0.016, 0.36 - i * 0.02, 0.04, 0.014, 0.009]], { seg: 5, sub: 1, capN: 1, ref: [1, 0, 0] });
  // the mural crown: a drum with its crenellations
  { const c = P.head; tube(S, [[c[0], c[1] + 0.056, c[2], 0.052], [c[0], c[1] + 0.09, c[2], 0.056]], { seg: lod ? 8 : 12, sub: 1, capN: 1, cap: [0, 1] }); for (let i = 0; i < (lod ? 6 : 8); i++) { const a = i / (lod ? 6 : 8) * 6.28; blob(S, [c[0] + Math.cos(a) * 0.052, c[1] + 0.104, c[2] + Math.sin(a) * 0.052], [0.014, 0.014, 0.014], 2, 5); } }
  hand(S, P.wrL, [0, 1, 0.2], [1, 0, 0], lod);
  // the cornucopia: a horn curling up from the left arm to its mouth heaped with fruit
  tube(S, [[-0.12, 0.58, 0.09, 0.012], [-0.17, 0.7, 0.1, 0.022], [-0.205, 0.84, 0.095, 0.036], [-0.2, 0.97, 0.08, 0.052]], { seg: lod ? 7 : 10, sub: 3, capN: 1, cap: [1, 0], ref: [0, 0, 1], fold: pleats(0.05, 6, 0, 0) });
  for (let i = 0; i < (lod ? 4 : 7); i++) { const a = i * 2.4; blob(S, [-0.2 + Math.cos(a) * 0.03, 1.0 + (i % 3) * 0.012, 0.08 + Math.sin(a) * 0.026], [0.018, 0.016, 0.018], 2, 6); }
  hand(S, P.wrR, [0.3, 0, 1], [0, 1, 0], lod);
  torus(S, [0.19, 0.6, 0.12], [1, 0, 0], [0, 0, 1], 0.036, 0.005, { seg: 12, sec: 4 });                // the patera
  blob(S, [0.19, 0.598, 0.12], [0.034, 0.006, 0.034], 2, 8);
}
/** An eagle with spread wings, its head high, the hooked beak, the talons gripping the cornice, the fan of the tail. */
export function eagle(S, lod) {
  blobDir(S, [0, 0.46, 0.08], [0, 1, 0.1], 0.2, 0.1, 0.085, [1, 0, 0], 4, lod ? 6 : 9);                      // the breast
  for (const s of [-1, 1]) {
    wing(S, [s * 0.09, 0.6, 0.04], s, { span: 0.52, up: 0.55, lod, droop: 0.6 });
    wing(S, [s * 0.09, 0.62, 0.052], s, { span: 0.34, up: 0.75, lod: 1, droop: 0.5 });
    rodT(S, [s * 0.05, 0.3, 0.07], [s * 0.052, 0.1, 0.12], 0.026, 0.018, { seg: 6 });                      // a leg
    for (let i = -1; i <= 1; i++) rodT(S, [s * 0.052, 0.1, 0.12], [s * 0.052 + i * 0.03, 0.02, 0.17], 0.01, 0.005, { seg: 4 });   // the talons
  }
  tube(S, [[0, 0.62, 0.09, 0.05, 0.045], [0, 0.76, 0.1, 0.034, 0.03], [0, 0.84, 0.115, 0.04, 0.04]], { seg: lod ? 6 : 8, sub: 2, ref: [1, 0, 0] });
  blob(S, [0, 0.86, 0.12], [0.044, 0.05, 0.05], 3, 7);                                                       // the head
  blobDir(S, [0, 0.83, 0.17], [0, -0.7, 0.7], 0.034, 0.016, 0.02, [1, 0, 0], 3, 6);                          // the hooked beak
  if (!lod) for (const s of [-1, 1]) blob(S, [s * 0.026, 0.88, 0.152], [0.01, 0.009, 0.008], 2, 5);
  for (let i = -2; i <= 2; i++) feather(S, [i * 0.012, 0.28, 0.06], [i * 0.2, -1, 0], 0.26, 0.034, 0.0, [0, -1, 0]);
}
/** A beast built along a spine: the barrel, chest and haunch, four legs by their joints, the tail. Facing +x. */
function beast(S, o) {
  const { lod = 0 } = o, sg = lod ? 7 : 10;
  tube(S, [[-0.3, o.rump, 0, 0.16, 0.14], [-0.05, o.back, 0, 0.14, 0.13], [0.2, o.back + 0.02, 0, 0.16, 0.15]], { seg: sg, sub: 3, ref: [0, 1, 0] });
  blob(S, [-0.3, o.rump - 0.02, 0.0], [0.17, 0.17, 0.14], 3, sg);                                             // the haunch
  blob(S, [0.2, o.back, 0], [0.17, 0.19, 0.15], 3, sg);                                                       // the chest and shoulder
  for (const s of [-1, 1]) {
    const f = o.fore.map((p) => [p[0], p[1], s * (p[2] || 0.08)]), h = o.hind.map((p) => [p[0], p[1], s * (p[2] || 0.08)]);
    limb(S, f, [[0, 0.06], [0.4, 0.05], [0.6, 0.032], [1, 0.034]], { lod, ref: [0, 0, 1] });
    limb(S, h, [[0, 0.075], [0.35, 0.06], [0.6, 0.035], [1, 0.036]], { lod, ref: [0, 0, 1] });
    blob(S, add(f[f.length - 1], [0.025, -0.004, 0]), [0.045, 0.02, 0.03], 2, 6);                              // the forepaw
    blob(S, add(h[h.length - 1], [0.025, -0.004, 0]), [0.045, 0.02, 0.03], 2, 6);
  }
  tube(S, o.tail.map((p, i, a) => [p[0], p[1], p[2], 0.02 - 0.008 * i / (a.length - 1)]), { seg: 5, sub: 2, capN: 1 });
  if (!lod) blob(S, add(o.tail[o.tail.length - 1], [-0.01, 0, 0]), [0.025, 0.03, 0.025], 2, 6);
}
/** The lion's head (looking along `f`, mane round it): muzzle, brow, nose, ears, the shaggy ruff. */
function lionHead(S, c, f, lod, mane = true) {
  const d = norm(f), side = norm(cross([0, 1, 0], d));
  blobDir(S, c, d, 0.085, 0.1, 0.095, [0, 1, 0], 4, lod ? 6 : 9);
  blobDir(S, add(c, add(mul(d, 0.09), [0, -0.025, 0])), d, 0.055, 0.052, 0.04, [0, 1, 0], 3, 7);                // the muzzle
  blobDir(S, add(c, add(mul(d, 0.13), [0, 0.012, 0])), d, 0.03, 0.026, 0.022, [0, 1, 0], 2, 6);                 // the nose
  blob(S, add(c, add(mul(d, 0.07), [0, 0.06, 0])), [0.1, 0.014, 0.04], 2, 7);
  for (const s of [-1, 1]) { blob(S, add(c, add(mul(side, s * 0.085), [0, 0.085, -0.01])), [0.022, 0.026, 0.014], 2, 6); if (!lod) blob(S, add(c, add(add(mul(d, 0.07), mul(side, s * 0.045)), [0, 0.04, 0])), [0.014, 0.01, 0.012], 2, 5); }
  if (mane) for (let i = 0; i < (lod ? 9 : 14); i++) { const a = i / (lod ? 9 : 14) * 6.28, ca = Math.cos(a), sa = Math.sin(a), p = add(c, add(mul(side, ca * 0.115), [0, sa * 0.115, -0.04])); blobDir(S, p, add(mul(side, ca), [0, sa, -0.5]), 0.07, 0.034, 0.024, [0, 0, 1], 2, 5); }
}
/** A couchant lion (length 1, facing +x) turning its mane-ringed head toward the viewer (+w). */
export function lion(S, lod) {
  beast(S, { lod, rump: 0.2, back: 0.24, fore: [[0.18, 0.26], [0.34, 0.12], [0.5, 0.045]], hind: [[-0.3, 0.2], [-0.14, 0.06, 0.12], [-0.02, 0.045, 0.1]], tail: [[-0.45, 0.14, 0.06], [-0.55, 0.06, 0.12], [-0.46, 0.035, 0.2], [-0.36, 0.05, 0.22]] });
  lionHead(S, [0.38, 0.42, 0.02], [0.15, -0.1, 1], lod);
  blob(S, [0.22, 0.3, 0.06], [0.1, 0.14, 0.07], 3, 7);
}
/** A winged sphinx couchant (length 1, facing +x), a woman's head under a diadem. */
export function sphinx(S, lod) {
  beast(S, { lod, rump: 0.2, back: 0.24, fore: [[0.18, 0.26], [0.34, 0.12], [0.5, 0.045]], hind: [[-0.3, 0.2], [-0.14, 0.06, 0.12], [-0.02, 0.045, 0.1]], tail: [[-0.45, 0.14, 0.06], [-0.55, 0.08, 0.12], [-0.5, 0.05, 0.2]] });
  head(S, [0.32, 0.62, 0.0], { female: true, lod, hair: 'bun', k: 1.7 });
  tube(S, [[0.32, 0.5, 0, 0.05, 0.05], [0.32, 0.56, 0, 0.044, 0.044]], { seg: 7, sub: 1, cap: [0, 0] });
  for (const s of [-1, 1]) for (let i = 0; i < (lod ? 4 : 7); i++) feather(S, [0.1 - i * 0.04, 0.34, s * 0.13], [-1, 0.25 - i * 0.07, s * 0.28], 0.42 - i * 0.025, 0.045, 0.02, [0, 0, s]);
}
/** A griffin of the frieze (a lion's body, an eagle's head and wings), seated and facing +x, built to be flattened. */
export function griffin(S, lod) {
  beast(S, { lod, rump: 0.2, back: 0.3, fore: [[0.18, 0.34], [0.34, 0.3], [0.46, 0.4]], hind: [[-0.3, 0.2], [-0.2, 0.06, 0.08], [-0.08, 0.04, 0.08]], tail: [[-0.45, 0.14, 0.02], [-0.58, 0.2, 0.02], [-0.62, 0.34, 0.02]] });
  tube(S, [[0.24, 0.36, 0, 0.06], [0.3, 0.52, 0, 0.048], [0.34, 0.64, 0, 0.044]], { seg: 7, sub: 2 });
  blob(S, [0.37, 0.68, 0], [0.055, 0.05, 0.045], 3, 7);
  blobDir(S, [0.45, 0.65, 0], [1, -0.55, 0], 0.045, 0.02, 0.022, [0, 0, 1], 3, 6);                              // the hooked beak
  blobDir(S, [0.34, 0.76, 0], [-0.4, 1, 0], 0.05, 0.012, 0.01, [0, 0, 1], 2, 5);                                // an ear
  for (let i = 0; i < (lod ? 5 : 8); i++) feather(S, [-0.12 + i * 0.02, 0.42, 0.02], [-0.5 - 0.12 * i, 0.9 - 0.05 * i, 0], 0.5 - i * 0.03, 0.045, 0.05, [0, -1, 0]);
}
/** A kantharos with its two loop handles, standing (height 1, centred on x = 0). */
export function kantharos(S, lod) {
  tube(S, [[0, 0, 0, 0.1], [0, 0.08, 0, 0.05], [0, 0.18, 0, 0.04], [0, 0.34, 0, 0.17], [0, 0.62, 0, 0.3], [0, 0.78, 0, 0.27]], { seg: lod ? 8 : 12, sub: 2, cap: [1, 0], capN: 1 });
  for (const s of [-1, 1]) torus(S, [s * 0.34, 0.62, 0], [s, 0, 0], [0, 1, 0], 0.13, 0.025, { seg: 10, sec: 5, arc: PI * 1.2, from: -PI * 0.6 });
}
/** A gorgoneion: the round face with its brow, wide eyes, nose and open mouth, the hair of snakes radiating, small wings. Radius 1, facing +w. */
export function medusa(S, lod) {
  blob(S, [0, 0, 0.1], [0.62, 0.7, 0.22], 4, lod ? 8 : 12);
  blob(S, [0, 0.25, 0.3], [0.5, 0.1, 0.1], 3, 8);
  blobDir(S, [0, -0.04, 0.34], [0, -0.3, 1], 0.17, 0.1, 0.12, [1, 0, 0], 3, 7);
  for (const s of [-1, 1]) { blob(S, [s * 0.26, 0.12, 0.3], [0.13, 0.08, 0.06], 2, 7); blob(S, [s * 0.5, -0.2, 0.18], [0.14, 0.14, 0.08], 2, 7); }
  blob(S, [0, -0.38, 0.28], [0.3, 0.08, 0.07], 2, 8); blob(S, [0, -0.52, 0.28], [0.12, 0.2, 0.06], 2, 6);       // the lips and the tongue
  const n = lod ? 9 : 14;
  for (let i = 0; i < n; i++) {
    const a = i / n * PI * 2 + 0.2, ca = Math.cos(a), sa = Math.sin(a), j = hash3(ca, sa, 3) * 0.2;
    tube(S, [[ca * 0.6, sa * 0.66, 0.1, 0.07], [ca * 0.85 + sa * 0.12, sa * 0.9 - ca * 0.12, 0.14, 0.06], [ca * 1.1 - sa * 0.1, sa * 1.12 + ca * 0.1, 0.14, 0.05], [ca * (1.3 + j) + sa * 0.05, sa * (1.3 + j) - ca * 0.05, 0.12, 0.03]], { seg: 5, sub: 2, capN: 1, ref: [0, 0, 1] });
  }
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) feather(S, [s * 0.5, 0.45, 0.2], [s * Math.cos(0.5 + i * 0.35), Math.sin(0.5 + i * 0.35), 0], 0.65 - i * 0.1, 0.1, 0.05, [0, -1, 0], 0.03);
}
/** A vine scroll along the points `path` ([x, y, w] in the figure's frame): the stem, a vine leaf and a bunch of grapes at each turn, curled tendrils. */
export function vine(S, path, lod, th = 0.05) {
  tube(S, path.map((p, i) => [p[0], p[1], p[2] + 0.02, th * (1 - 0.3 * i / path.length)]), { seg: 5, sub: 3, capN: 1 });
  path.forEach((p, i) => {
    if (i % 2 === 1 || i === 0) return;
    const s = i % 4 === 0 ? 1 : -1, k = hash3(p[0], p[1], 9);
    for (let q = 0; q < 5; q++) { const a = (q - 2) * 0.5 + (s > 0 ? 1.3 : 3.4); blobDir(S, [p[0] + Math.cos(a) * th * 3, p[1] + Math.sin(a) * th * 3, p[2] + 0.03], [Math.cos(a), Math.sin(a), 0], th * (3 - Math.abs(q - 2) * 0.5), th * 1.3, th * 0.5, [0, 0, 1], 2, 5); }
    if (!lod) for (let g = 0; g < 7; g++) blob(S, [p[0] + (g % 3 - 1) * th * 0.9 + s * th * 2, p[1] - th * (1.5 + Math.floor(g / 3) * 1.1), p[2] + 0.05 + 0.005 * k], [th * 0.5, th * 0.5, th * 0.5], 2, 5);
  });
}
/** A palmette acroterion (height 1): a fan of leaves on a scrolled base. */
export function palmette(S, lod) {
  const n = lod ? 7 : 9;
  for (let i = 0; i < n; i++) { const a = PI * (0.12 + 0.76 * i / (n - 1)), c = 1 - Math.abs(i / (n - 1) - 0.5) * 0.5; blobDir(S, [Math.cos(a) * 0.1, 0.3 + Math.sin(a) * 0.1, 0.05], [Math.cos(a), Math.sin(a), 0], 0.4 * c, 0.065, 0.025, [0, 0, 1], 3, 6); }
  tube(S, [[-0.22, 0.12, 0.05, 0.04], [-0.1, 0.02, 0.05, 0.05], [0.1, 0.02, 0.05, 0.05], [0.22, 0.12, 0.05, 0.04]], { seg: 6, sub: 2, capN: 1 });
  blob(S, [0, 0.2, 0.06], [0.07, 0.1, 0.05], 3, 6);
}

/** A dromedary (length 1, height 0.9, facing +x) with its pack saddle: the hump, the long neck carried forward, the lean legs. */
export function camel(S, lod) {
  const sg = lod ? 7 : 10;
  tube(S, [[-0.3, 0.5, 0, 0.09, 0.085], [-0.05, 0.5, 0, 0.11, 0.095], [0.2, 0.5, 0, 0.1, 0.085]], { seg: sg, sub: 3, ref: [0, 1, 0] });
  blob(S, [-0.08, 0.63, 0], [0.085, 0.085, 0.07], 3, sg); blob(S, [-0.3, 0.47, 0], [0.1, 0.11, 0.095], 3, sg); blob(S, [0.2, 0.5, 0], [0.11, 0.12, 0.1], 3, sg);
  tube(S, [[0.22, 0.56, 0, 0.06], [0.32, 0.72, 0, 0.044], [0.42, 0.86, 0, 0.035], [0.5, 0.92, 0, 0.033]], { seg: lod ? 6 : 8, sub: 3, ref: [0, 0, 1] });
  blob(S, [0.56, 0.9, 0], [0.058, 0.034, 0.032], 3, 7); blob(S, [0.62, 0.875, 0], [0.036, 0.026, 0.026], 2, 6);
  if (!lod) for (const q of [-1, 1]) blob(S, [0.5, 0.95, q * 0.026], [0.016, 0.022, 0.008], 2, 5);
  for (const q of [-1, 1]) {
    limb(S, [[0.17, 0.44, q * 0.065], [0.19, 0.22, q * 0.07], [0.18, 0.05, q * 0.07]], [[0, 0.05], [0.4, 0.034], [0.7, 0.026], [1, 0.03]], { lod });
    limb(S, [[-0.3, 0.42, q * 0.075], [-0.2, 0.22, q * 0.075], [-0.27, 0.05, q * 0.075]], [[0, 0.075], [0.4, 0.04], [0.7, 0.026], [1, 0.03]], { lod });
    blob(S, [0.2, 0.03, q * 0.07], [0.04, 0.02, 0.03], 2, 6); blob(S, [-0.25, 0.03, q * 0.075], [0.04, 0.02, 0.03], 2, 6);
    blob(S, [-0.08, 0.6, q * 0.1], [0.11, 0.09, 0.06], 3, 7);                                             // a bale of the load
  }
  tube(S, [[-0.4, 0.5, 0, 0.014], [-0.44, 0.38, 0, 0.012], [-0.43, 0.26, 0, 0.012]], { seg: 5, sub: 2, capN: 1 });
  tube(S, [[0.6, 0.86, 0, 0.007], [0.5, 0.66, 0.0, 0.006], [0.44, 0.56, 0.0, 0.006]], { seg: 4, sub: 2, capN: 1 });    // the halter's rope
}
/** A caravan man in the short tunic and the mantle, striding to the right (turned: built facing the viewer, see turned). */
export function driver(S, lod) {
  turned(S, PI / 2);
  const P = std();
  Object.assign(P, { hipL: [-0.045, 0.5, 0.0], kneeL: [-0.05, 0.28, 0.1], ankL: [-0.05, 0.045, 0.17], hipR: [0.045, 0.5, 0], kneeR: [0.05, 0.26, -0.02], ankR: [0.05, 0.06, -0.12],
    chest: [0, 0.74, 0.02], head: [0, 0.935, 0.03], shL: [-0.11, 0.8, 0.01], elL: [-0.12, 0.7, 0.1], wrL: [-0.1, 0.66, 0.22], shR: [0.11, 0.8, 0.01], elR: [0.13, 0.65, -0.02], wrR: [0.12, 0.54, -0.04] });
  body(S, P, { female: false, lod, hair: 'helm', legs: true });
  tube(S, [[0, 0.76, 0.01, 0.1, 0.062], [0, 0.6, 0.012, 0.08, 0.056]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.03, 5, 1.6) });
  tube(S, [[0, 0.6, 0.012, 0.082, 0.058], [0.0, 0.44, 0.04, 0.106, 0.082], [0, 0.36, 0.05, 0.11, 0.085]], { seg: lod ? 10 : 14, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.08, 7, 1.2, 0.04) });
  tube(S, [[-0.1, 0.86, -0.03, 0.045, 0.014], [-0.11, 0.62, -0.04, 0.05, 0.016], [-0.1, 0.4, -0.06, 0.044, 0.014]], { seg: 8, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.2, 3, 1.4) });    // the mantle
  hand(S, P.wrL, [0, -0.2, 1], [1, 0, 0], lod);
  turned(S, 0);
}
/** A betyl: the god's upright stone, tapering to a rounded top, its base in two steps (height 1). */
export function betyl(S, lod) {
  tube(S, [[0, 0.0, 0, 0.2, 0.15], [0, 0.45, 0, 0.19, 0.14], [0, 0.85, 0, 0.16, 0.12], [0, 0.97, 0, 0.1, 0.08]], { seg: lod ? 8 : 12, sub: 3, ref: [1, 0, 0], cap: [0, 1] });
}
/** A bust: the head and neck on a draped chest, for the frieze of the Urn Tomb (height 1 about, facing +w). */
export function bust(S, lod) {
  head(S, [0, 0.62, 0.0], { female: false, lod, hair: 'curls', k: 3.2 });
  tube(S, [[0, 0.4, 0, 0.1], [0, 0.5, 0, 0.09]], { seg: 8, sub: 1, cap: [0, 0] });
  tube(S, [[0, 0.1, 0, 0.36, 0.17], [0, 0.3, 0, 0.3, 0.15], [0, 0.4, 0, 0.14, 0.1]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], cap: [1, 0], fold: pleats(0.08, 5, 1.5) });
}
export { limb, head, hand, body, std, pleats, feather, wing };
