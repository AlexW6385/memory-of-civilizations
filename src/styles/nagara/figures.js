// The carved figures of Kandariya Mahadeva's walls (docs/settlements/khajuraho.md §17), modelled: gods with their
// attributes, attendants, surasundaris at their toilet, musicians — standing in the three-bend pose (tribhaṅga: the
// hips swung one way, the bust the other, the head back again) with rounded limbs, a torso, a head with brow, nose,
// lips and hair, drapery that falls from the girdle in pleats, jewellery in the radii of the limbs themselves (an
// armlet and a bangle are swellings of the arm). Each figure is ONE geometry (Form, form.js) in the figure's own
// frame: u along the wall, v up (the figure 1.0 tall with its crown), d out of the wall; level 2 is the full
// figure, level 1 a reduced one (fewer sides, no face). All clothed, all standing, none in a couple (decorum).

import { Form } from './form.js';

export const KINDS = 12;
/** What each kind is, in the order of the rotation: the first six the surasundaris of the temple's well-known poses. */
export const KIND_NAMES = ['kohl', 'hair', 'mirror', 'thorn', 'flute', 'dancer', 'vishnu', 'shiva', 'chauri', 'vina', 'drummer', 'lotus'];

const v3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const dirOf = (a, b) => { const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1; return [d[0] / l, d[1] / l, d[2] / l]; };

/**
 * One figure into the Form F (feet on the lotus at the origin): kind 0..11, level 2 or 1, sw ±1 the side of the swing,
 * rnd a generator seeded from the figure's own place (the small differences between two of one kind).
 */
export function figure(F0, kind, lv, sw, rnd) {
  const hi = lv >= 2, male = kind === 6 || kind === 7 || kind === 10, god = kind === 6 || kind === 7;
  // authoring is for sw = +1: every point and axis is mirrored on its way into the form
  const mp = (p) => [p[0] * sw, p[1], p[2], ...p.slice(3)];
  const F = {
    tube: (path, o = {}) => F0.tube(path.map(mp), { ...o, dref: o.dref && mp(o.dref), fold: o.fold && ((th, t, i) => o.fold(sw === 1 ? th : Math.PI - th, t, i)), lift: o.lift && ((th, t, i) => o.lift(sw === 1 ? th : Math.PI - th, t, i)) }),
    ring: (c, R, r, e1, e2, o = {}) => F0.ring(mp(c), R, r, mp(e1), mp(e2), { ...o, dref: o.dref && mp(o.dref) }),
    ell: (c, r, o = {}) => F0.ell(mp(c), r, { ...o, axis: o.axis && mp(o.axis), dref: o.dref && mp(o.dref) }),
  };
  const sd = hi ? 9 : 6, j = () => (rnd() - 0.5);
  const lean = kind === 3 ? 0.12 : kind === 5 ? 0.03 : 0.01;
  const D = (v) => lean * (v - 0.46);                         // the body leans forward from the hips
  const stoop = kind === 3 ? 0.03 : 0;
  // ── the pedestal: a low lotus cushion
  F.ell([0, 0.011, 0], [0.17, 0.02, 0.1], { sides: hi ? 12 : 7, rings: hi ? 4 : 3 });
  // ── the legs and the lower garment
  const ank = [[0.045, 0.045, 0.02], [-0.045, 0.045, 0.02]];     // [weight leg (+u), free leg (−u)]
  let hem = 0.04;
  const short = kind === 10;
  const foot = (p, r = 1) => F.ell([p[0], p[1] - 0.018, p[2] + 0.022], [0.021 * r, 0.04 * r, 0.014], { axis: [0, 0, 1], dref: [0, 1, 0], sides: hi ? 8 : 5, rings: hi ? 4 : 3 });
  const leg = (hipP, knee, ank2, r = 1) => F.tube([[...hipP, 0.044 * r, 0.04 * r], [...v3(hipP, knee, 0.55), 0.04 * r, 0.037 * r], [...knee, 0.034 * r, 0.034 * r], [...v3(knee, ank2, 0.35), 0.035 * r, 0.033 * r], [...v3(knee, ank2, 0.85), 0.02 * r, 0.02 * r], [...ank2, 0.021 * r, 0.021 * r]], { sides: hi ? 7 : 5, sub: 1 });
  let freeAnk = ank[1];
  if (kind === 3) {                                              // the thorn: the free foot drawn up and held in the hand
    freeAnk = [-0.035, 0.31, 0.14];
    leg([-0.04, 0.46, 0], [-0.125, 0.385, 0.085], freeAnk);
    leg([0.04, 0.46, 0], [0.047, 0.25, 0.02], ank[0]);
    foot(ank[0]); foot(freeAnk, 0.9);
  } else if (kind === 5) {                                       // the dancer: one leg lifted aside
    freeAnk = [-0.15, 0.17, 0.03];
    leg([-0.04, 0.46, 0], [-0.125, 0.3, 0.07], freeAnk);
    leg([0.04, 0.46, 0], [0.05, 0.25, 0.015], ank[0]);
    foot(ank[0]); foot(freeAnk, 0.9);
  } else if (short) {                                            // a man in a knee-length dhoti: the shins bare
    leg([-0.04, 0.46, 0], [-0.052, 0.27, 0.04], ank[1]); leg([0.04, 0.46, 0], [0.056, 0.26, 0.01], ank[0]);
    foot(ank[0]); foot(ank[1]);
  } else { foot(ank[0]); foot(ank[1]); }
  // the long garment (a woman's skirt, a god's dhoti) from the girdle to the ankles: pleats that follow the legs, the hem lifted on the free side
  {
    const top = 0.545, bot = kind === 3 ? 0.06 : short ? 0.22 : 0.04;
    const rows = [[-0.01, 0.0, 0.142, 0.1, 0.035], [0.0, 0.01, 0.124, 0.09, 0.085], [0.012, 0.018, 0.108, 0.08, 0.17], [0.026, 0.02, 0.101, 0.075, 0.28], [0.042, 0.01, 0.104, 0.072, 0.38], [0.052, 0.004, 0.106, 0.068, 0.47], [0.04, 0.004, 0.088, 0.058, top]];
    const path = rows.filter((r) => r[4] >= bot - 0.001).map(([u, d, a, b, v]) => { const k = short ? 0.82 : 1; return [u, v, d, a * k, b * k]; });
    if (short) path.unshift([0.012, 0.22, 0.015, 0.082, 0.065]);
    const ph = 1.9 + j() * 0.5, K = hi ? 5 : 3, amp0 = hi ? 0.034 : 0.025;
    F.tube(path, {
      sides: hi ? 20 : 8, sub: 1, caps: [false, false],
      fold: (th, t) => 1 + (amp0 + 0.05 * (1 - t)) * Math.sin(K * th + ph * (1 - t)) + (th > 1.2 && th < 1.9 ? -0.02 * (1 - t) : 0),
      lift: kind === 3 || kind === 5 ? (th, t) => (Math.cos(th) < -0.2 ? 0.2 * (1 - t) ** 1.3 * -Math.cos(th) : 0) : (th, t) => (1 - t) * 0.012 * Math.sin(3 * th + 1),
    });
    if (hi && !short) {
      // the fish-tail of the cloth hanging in front between the legs, and the girdle with its pendants
      F.tube([[0.01, 0.06, 0.1, 0.05, 0.012], [0.014, 0.18, 0.108, 0.03, 0.012], [0.02, 0.32, 0.098, 0.033, 0.012], [0.03, 0.5, 0.08, 0.036, 0.013]], { sides: 5, sub: 1, caps: [false, true] });
    }
  }
  // the girdle (mekhalā): a swelling band about the hips, with three hanging beads
  if (hi) {
    const c = [0.05, 0.505, 0.004], n = 12, path = [];
    for (let k = 0; k < n; k++) { const th = (k / n) * Math.PI * 2; path.push([c[0] + Math.cos(th) * 0.098, c[1] + Math.sin(th * 2) * 0.004, c[2] + Math.sin(th) * 0.064, 0.0105, 0.0105]); }
    F.tube(path, { sides: hi ? 5 : 4, sub: 1, closed: true, dref: [0, 1, 0] });
    if (hi) for (const du of [-0.025, 0, 0.025]) F.ell([0.036 + du, 0.465 - Math.abs(du) * 0.8, 0.072], [0.009, 0.016, 0.009], { sides: 6, rings: 4 });
  }
  // ── the torso: hips, waist, the bust under its band (a woman), the chest and the shoulders (a man's broader)
  const bw = male ? 1.13 : 1, bs = male ? 0.82 : 1;
  const torso = [[0.054, 0.455, 0, 0.09, 0.054], [0.05, 0.5, 0, 0.082, 0.05], [0.016, 0.585, D(0.585) + 0.004, 0.047 * bw, 0.036], [-0.016, 0.66, D(0.66) + 0.01, 0.074 * bw * (male ? 0.95 : 1), 0.056 * bs + 0.0], [-0.032, 0.715, D(0.715) + 0.008, 0.077 * bw, 0.05], [-0.036, 0.775, D(0.775) + 0.004 + stoop, 0.088 * bw, 0.04]];
  F.tube(torso, { sides: hi ? 12 : 7, sub: 1, caps: [false, true], capRings: [1.0, Math.PI / 2] });
  if (hi && !male) { for (const s of [-1, 1]) F.ell([-0.012 + s * 0.034, 0.675, D(0.675) + 0.052], [0.034, 0.03, 0.03], { sides: 8, rings: 4, axis: [s * 0.15, 1, 0] }); }  // under the breast-band
  const sh = [[0.052 * bw, 0.763, D(0.775) + 0.004 + stoop], [-0.124 * bw, 0.789, D(0.775) + 0.004 + stoop]];
  // ── the neck, the head, the face
  const nk = [[-0.03, 0.775, 0.004 + stoop, 0.027, 0.027], [-0.02, 0.82, 0.014 + stoop, 0.022, 0.022], [0.004, 0.862, 0.02 + stoop * 1.3, 0.021, 0.021]];
  F.tube(nk, { sides: hi ? 8 : 5, sub: 1, caps: [false, false] });
  const down = kind === 3 ? -0.5 : 0, hc = [0.012, 0.917, 0.02 + stoop * 1.6], ax = [0.11, 1, down * 0.5];
  F.ell(hc, [0.046, 0.061, 0.049], { axis: ax, sides: hi ? 10 : 8, rings: hi ? 7 : 5 });
  if (hi) {
    const fz = hc[2] + 0.047, tilt = down * 0.012;
    F.ell([hc[0] + 0.0, hc[1] - 0.003, fz + 0.004], [0.0085, 0.021, 0.0125], { axis: [0, 1, -0.4], sides: 6, rings: 3 });                  // nose
    F.ell([hc[0], hc[1] - 0.03 + tilt, fz - 0.003], [0.016, 0.0055, 0.0075], { sides: 6, rings: 3 });                                     // the lips
    F.ell([hc[0], hc[1] - 0.039 + tilt, fz - 0.008], [0.012, 0.0045, 0.0055], { sides: 6, rings: 3 });
    for (const s of [-1, 1]) {
      F.ell([hc[0] + s * 0.0185, hc[1] + 0.011, fz - 0.004], [0.0052, 0.0125, 0.0052], { axis: [1, s * 0.25, 0], sides: 6, rings: 3 });         // the eyes, almond lids
      F.tube([[hc[0] + s * 0.007, hc[1] + 0.024, fz + 0.001, 0.0035, 0.0035], [hc[0] + s * 0.021, hc[1] + 0.03, fz - 0.003, 0.0038, 0.0038], [hc[0] + s * 0.035, hc[1] + 0.02, fz - 0.014, 0.003, 0.003]], { sides: 4, sub: 1, capRings: [Math.PI / 2] });   // the arched brow
      F.ell([hc[0] + s * 0.047, hc[1] - 0.004, hc[2] - 0.004], [0.005, 0.017, 0.011], { sides: 5, rings: 3 });                                      // the ear
      F.ell([hc[0] + s * 0.051, hc[1] - 0.033, hc[2] - 0.004], [0.0045, 0.019, 0.019], { sides: 6, rings: 3 });                                     // the earring
    }
    if (kind === 7) F.ell([hc[0], hc[1] + 0.03, fz - 0.004], [0.0035, 0.011, 0.004], { sides: 5, rings: 3 });                                  // Śiva's third eye
  }
  // ── the hair and the crown
  const top = hc[1] + 0.058;
  F.ell([hc[0] - 0.0, hc[1] + 0.013, hc[2] - 0.011], [0.0495, 0.058, 0.052], { axis: ax, sides: hi ? 10 : 7, rings: hi ? 5 : 4 });
  if (god) {
    const kir = [[hc[0], top - 0.03, hc[2] - 0.005, 0.054, 0.052], [hc[0], top - 0.005, hc[2] - 0.005, 0.048, 0.046], [hc[0], top + 0.03, hc[2] - 0.006, 0.047, 0.045], [hc[0], top + 0.062, hc[2] - 0.006, 0.036, 0.034], [hc[0], top + 0.09, hc[2] - 0.006, 0.02, 0.019]];
    if (kind === 6) F.tube(kir, { sides: hi ? 10 : 6, sub: 1, caps: [false, true] });
    else {                                                                                                       // Śiva's matted locks piled in a tall knot
      F.ell([hc[0], top + 0.03, hc[2] - 0.012], [0.04, 0.06, 0.038], { sides: hi ? 10 : 6, rings: hi ? 6 : 4 });
      if (hi) for (const s of [-1, 1]) F.tube([[hc[0] + s * 0.045, hc[1] + 0.03, hc[2] - 0.005, 0.009, 0.009], [hc[0] + s * 0.062, hc[1] - 0.02, hc[2] + 0.0, 0.008, 0.008], [hc[0] + s * 0.07, hc[1] - 0.07, hc[2] + 0.01, 0.006, 0.006]], { sides: 5, sub: 2 });
    }
    // the halo behind the head
    F.ell([hc[0], hc[1] + 0.004, 0.001], [0.098, 0.098, 0.006], { sides: hi ? 16 : 8, rings: 4 });
  } else {
    // a woman's chignon, the coil about its base, and the ringlets at her cheeks
    const bun = kind === 11 ? [hc[0] + 0.03, top + 0.0, hc[2] - 0.02] : [hc[0] - 0.005, top + 0.012, hc[2] - 0.016];
    F.ell(bun, [0.034, 0.032, 0.034], { sides: hi ? 10 : 6, rings: hi ? 5 : 3 });
    if (hi) {
      F.ring([hc[0] + 0.0, top - 0.015, hc[2] - 0.012], 0.046, 0.0075, [1, 0, 0], [0, 0, 1], { segs: 12, sides: 4, dref: [0, 1, 0] });
      F.ell([bun[0], bun[1] + 0.03, bun[2]], [0.012, 0.012, 0.012], { sides: 6, rings: 4 });
    }
  }
  // ── the necklace, the sacred thread, the armlets in the arms
  if (hi) {
    const nl = [[-0.07, 0.77, D(0.77) + 0.032], [-0.045, 0.725, D(0.72) + 0.056], [-0.012, 0.7, D(0.7) + 0.064], [0.02, 0.725, D(0.72) + 0.056], [0.046, 0.77, D(0.77) + 0.032]];
    F.tube(nl.map((p) => [...p, 0.0075, 0.0075]), { sides: 4, sub: 1, capRings: [Math.PI / 2] });
    F.ell([-0.012, 0.682, D(0.7) + 0.066], [0.012, 0.017, 0.0065], { sides: 7, rings: 4 });
    if (male) F.tube([[-0.1, 0.775, D(0.775) + 0.022, 0.0065, 0.0065], [-0.045, 0.68, D(0.68) + 0.052, 0.0065, 0.0065], [0.015, 0.58, D(0.58) + 0.044, 0.0065, 0.0065], [0.07, 0.5, 0.046, 0.0065, 0.0065]], { sides: 5, sub: 2 });
  }
  // ── the arms: a tube through the shoulder, elbow and wrist with its swellings (armlet, bangle), the hand
  const arm = (S, E, W, o = {}) => {
    const r = (o.r ?? 1) * (male ? 1.12 : 1), d = dirOf(E, W), thin = !hi;
    const pts = thin ? [[...S, 0.023 * r, 0.023 * r], [...E, 0.0165 * r, 0.0165 * r], [...W, 0.012 * r, 0.012 * r]]
      : [[...S, 0.024 * r, 0.024 * r], [...v3(S, E, 0.4), 0.0235 * r, 0.0235 * r], [...E, 0.0175 * r, 0.0175 * r], [...v3(E, W, 0.55), 0.0138 * r, 0.0138 * r], [...v3(E, W, 0.88), 0.0155 * r, 0.0155 * r], [...W, 0.0112 * r, 0.0112 * r]];
    F.tube(pts, { sides: hi ? 6 : 5, sub: 1, capRings: hi ? [1.0, Math.PI / 2] : [Math.PI / 2] });
    F.ell([W[0] + d[0] * 0.028, W[1] + d[1] * 0.028, W[2] + d[2] * 0.028], [0.0125, 0.03, 0.0065], { axis: d, sides: hi ? 6 : 5, rings: hi ? 4 : 3, dref: o.dref ?? [0, 0, 1] });
    return [W[0] + d[0] * 0.05, W[1] + d[1] * 0.05, W[2] + d[2] * 0.05];
  };
  const S1 = sh[0], S2 = sh[1];
  const prop = (fn) => { if (hi) fn(); };
  const pole = (a, b, r, ro = r) => { if (hi || r > 0.005) F.tube([[...a, r, r], [...b, ro, ro]], { sides: hi ? 6 : 4, sub: 1, capRings: [Math.PI / 2] }); };
  switch (kind) {
    case 0: {                                    // the woman applying kohl: one hand to the eye with the stick, the other on the hip
      const h = arm(S2, [-0.158, 0.7, D(0.7) + 0.05], [-0.062, 0.845, 0.095], { dref: [0, 1, 0] });
      pole([-0.03, 0.9, 0.087], [-0.012, 0.926, 0.076], 0.0032, 0.0022);
      arm(S1, [0.152, 0.67, D(0.67) + 0.03], [0.102, 0.58, D(0.58) + 0.048]); void h;
      break;
    }
    case 1: {                                    // wringing her hair: both hands at a lock that falls to the breast, drops falling from its end
      arm(S2, [-0.175, 0.845, 0.035], [-0.11, 0.935, 0.06], { dref: [0, 1, 0] });
      arm(S1, [0.158, 0.83, 0.03], [0.1, 0.915, 0.062], { dref: [0, 1, 0] });
      F.tube([[0.03, 0.985, 0.004, 0.012, 0.012], [0.105, 0.965, 0.03, 0.014, 0.014], [0.125, 0.89, 0.052, 0.014, 0.014], [0.108, 0.8, 0.07, 0.011, 0.011], [0.095, 0.72, 0.078, 0.0075, 0.0075]], { sides: hi ? 7 : 5, sub: 2 });
      prop(() => { for (const [dv, k] of [[0.69, 1], [0.655, 0.8], [0.62, 0.6]]) F.ell([0.094, dv, 0.08], [0.0042 * k, 0.0085 * k, 0.0042 * k], { sides: 5, rings: 3 }); });
      break;
    }
    case 2: {                                    // with a mirror: the hand held out before the breast, the disc turned to the face
      arm(S2, [-0.16, 0.7, D(0.7) + 0.05], [-0.07, 0.755, 0.115]);
      F.ell([-0.056, 0.826, 0.132], [0.049, 0.049, 0.0055], { sides: hi ? 16 : 8, rings: 4 });
      prop(() => F.ring([-0.056, 0.826, 0.132], 0.052, 0.0055, [1, 0, 0], [0, 1, 0], { segs: 16, sides: 5, dref: [0, 0, 1] }));
      pole([-0.06, 0.776, 0.126], [-0.066, 0.75, 0.12], 0.0055);
      arm(S1, [0.15, 0.665, D(0.665) + 0.03], [0.108, 0.575, D(0.58) + 0.05]);
      break;
    }
    case 3: {                                    // removing a thorn: the free foot held up in the hand, the head bent to it, the other arm out for balance
      arm(S1, [0.07, 0.585, D(0.585) + 0.07], [0.0, 0.405, 0.125]);
      arm(S2, [-0.21, 0.69, D(0.69) + 0.03], [-0.248, 0.56, 0.02]);
      break;
    }
    case 4: {                                    // playing the flute: held across, both hands on it, the elbows out
      pole([-0.03, 0.872, 0.092], [0.215, 0.835, 0.142], 0.0075, 0.0055);
      prop(() => { for (const f of [0.35, 0.5, 0.65, 0.8]) F.ell([-0.03 + (0.215 + 0.03) * f, 0.872 - 0.037 * f + 0.008, 0.092 + 0.05 * f], [0.0042, 0.0042, 0.0042], { sides: 5, rings: 3 }); });
      arm(S2, [-0.128, 0.72, D(0.72) + 0.06], [0.028, 0.862, 0.098]);
      arm(S1, [0.168, 0.7, D(0.7) + 0.06], [0.152, 0.845, 0.135]);
      break;
    }
    case 5: {                                    // the dancer: arms flung out and up, a long sash flying from the hand
      arm(S1, [0.185, 0.795, 0.03], [0.255, 0.9, 0.045]);
      arm(S2, [-0.205, 0.7, 0.04], [-0.285, 0.64, 0.06]);
      prop(() => F.tube([[0.255, 0.9, 0.045, 0.006, 0.002], [0.29, 0.83, 0.06, 0.007, 0.002], [0.26, 0.76, 0.085, 0.007, 0.002], [0.3, 0.68, 0.09, 0.0065, 0.002], [0.27, 0.6, 0.1, 0.006, 0.0015]], { sides: 4, sub: 3 }));
      break;
    }
    case 6: {                                    // Viṣṇu with his four attributes: the discus and the mace raised, the lotus and the conch lower
      arm(S1, [0.185, 0.8, 0.03], [0.175, 0.905, 0.07]); arm(S2, [-0.19, 0.8, 0.03], [-0.18, 0.9, 0.055]);
      F.ring([0.176, 0.97, 0.072], 0.052, 0.006, [1, 0, 0], [0, 1, 0], { segs: hi ? 12 : 8, sides: 4, dref: [0, 0, 1] });
      if (hi) for (let k = 0; k < 6; k++) { const th = k * Math.PI / 3; F.ell([0.176 + Math.cos(th) * 0.062, 0.97 + Math.sin(th) * 0.062, 0.072], [0.005, 0.009, 0.005], { axis: [Math.cos(th), Math.sin(th), 0], sides: 5, rings: 3 }); }
      pole([-0.18, 0.84, 0.056], [-0.19, 1.0, 0.06], 0.0085, 0.0085);
      F.ell([-0.19, 1.04, 0.06], [0.034, 0.05, 0.034], { sides: hi ? 8 : 5, rings: hi ? 5 : 3 });
      arm(S1, [0.215, 0.69, D(0.69) + 0.05], [0.232, 0.585, D(0.58) + 0.09], { dref: [0, 1, 0] });
      F.ell([0.236, 0.595, 0.105], [0.026, 0.026, 0.01], { sides: hi ? 10 : 6, rings: 4 });
      prop(() => { for (let k = 0; k < 6; k++) { const th = k * Math.PI / 3; F.ell([0.236 + Math.cos(th) * 0.03, 0.595 + Math.sin(th) * 0.03, 0.105], [0.0095, 0.02, 0.005], { axis: [Math.cos(th), Math.sin(th), 0], sides: 5, rings: 3 }); } });
      arm(S2, [-0.215, 0.69, D(0.69) + 0.05], [-0.222, 0.59, D(0.58) + 0.09], { dref: [0, 1, 0] });
      F.ell([-0.222, 0.55, 0.105], [0.017, 0.034, 0.016], { axis: [0.2, 1, 0], sides: hi ? 8 : 5, rings: hi ? 5 : 3 });
      break;
    }
    case 7: {                                    // Śiva: the trident raised in one upper hand, the little drum in the other, the open palm, the snake
      arm(S1, [0.185, 0.8, 0.03], [0.178, 0.9, 0.07]); arm(S2, [-0.19, 0.8, 0.03], [-0.185, 0.9, 0.06]);
      pole([0.178, 0.7, 0.075], [0.178, 1.03, 0.075], 0.0045);
      F.tube([[0.138, 1.0, 0.075, 0.0045, 0.0045], [0.138, 1.055, 0.075, 0.003, 0.003]], { sides: 4, sub: 1 });
      F.tube([[0.218, 1.0, 0.075, 0.0045, 0.0045], [0.218, 1.055, 0.075, 0.003, 0.003]], { sides: 4, sub: 1 });
      F.tube([[0.178, 1.01, 0.075, 0.005, 0.005], [0.178, 1.075, 0.075, 0.0025, 0.0025]], { sides: 4, sub: 1 });
      F.tube([[0.138, 1.0, 0.075, 0.0045, 0.0045], [0.178, 0.99, 0.075, 0.0045, 0.0045], [0.218, 1.0, 0.075, 0.0045, 0.0045]], { sides: 4, sub: 1, caps: [false, false] });
      F.ell([-0.19, 0.935, 0.06], [0.026, 0.034, 0.026], { axis: [1, 0, 0], sides: hi ? 8 : 5, rings: hi ? 5 : 3 });
      arm(S1, [0.215, 0.69, D(0.69) + 0.05], [0.236, 0.6, D(0.58) + 0.08], { dref: [0, 1, 0] });
      arm(S2, [-0.215, 0.69, D(0.69) + 0.05], [-0.226, 0.595, D(0.58) + 0.08], { dref: [0, 1, 0] });
      prop(() => F.tube([[-0.226, 0.56, 0.1, 0.007, 0.007], [-0.26, 0.5, 0.11, 0.0075, 0.0075], [-0.225, 0.44, 0.115, 0.0075, 0.0075], [-0.255, 0.38, 0.115, 0.007, 0.007], [-0.23, 0.33, 0.12, 0.0055, 0.0055]], { sides: 5, sub: 2 }));
      break;
    }
    case 8: {                                    // the whisk-bearer (cāmara): a whisk raised in one hand, its hair hanging in a bunch
      const h = arm(S2, [-0.17, 0.7, D(0.7) + 0.04], [-0.17, 0.86, 0.07], { dref: [0, 1, 0] });
      pole([-0.17, 0.83, 0.075], [-0.17, 0.96, 0.075], 0.0055);
      F.ell([-0.17, 0.955, 0.075], [0.014, 0.014, 0.014], { sides: hi ? 8 : 5, rings: hi ? 4 : 3 });
      F.tube([[-0.17, 0.95, 0.075, 0.016, 0.014], [-0.215, 0.9, 0.085, 0.026, 0.02], [-0.23, 0.82, 0.095, 0.03, 0.022], [-0.235, 0.75, 0.1, 0.018, 0.014], [-0.23, 0.7, 0.103, 0.005, 0.004]], { sides: hi ? 8 : 5, sub: 2 });
      arm(S1, [0.15, 0.67, D(0.67) + 0.035], [0.1, 0.585, D(0.58) + 0.05]); void h;
      break;
    }
    case 9: {                                    // the lute-player (vīṇā): the long neck slung across, a gourd at each end, one hand on the frets
      pole([-0.13, 0.43, 0.095], [0.215, 0.885, 0.1], 0.0085, 0.007);
      F.ell([-0.125, 0.44, 0.092], [0.052, 0.062, 0.04], { axis: [0.7, 0.7, 0], sides: hi ? 10 : 6, rings: hi ? 6 : 4 });
      F.ell([0.19, 0.855, 0.1], [0.04, 0.045, 0.035], { axis: [0.7, 0.7, 0], sides: hi ? 8 : 5, rings: hi ? 5 : 3 });
      arm(S1, [0.185, 0.75, D(0.75) + 0.07], [0.118, 0.77, 0.12]);
      arm(S2, [-0.158, 0.62, D(0.62) + 0.06], [-0.082, 0.585, 0.11]);
      break;
    }
    case 10: {                                   // the drummer: the barrel drum (mṛdaṅga) hung at his hip, a hand on each head
      F.ell([0.0, 0.52, 0.1], [0.055, 0.125, 0.055], { axis: [1, 0, 0], sides: hi ? 12 : 7, rings: hi ? 8 : 5 });
      if (hi) for (const k of [-0.07, -0.035, 0, 0.035, 0.07]) F.ell([k, 0.52, 0.1], [0.062 - Math.abs(k) * 0.09, 0.0065, 0.062 - Math.abs(k) * 0.09], { axis: [1, 0, 0], sides: 8, rings: 3 });
      arm(S1, [0.185, 0.68, D(0.68) + 0.06], [0.135, 0.548, 0.14], { dref: [1, 0, 0] });
      arm(S2, [-0.2, 0.68, D(0.68) + 0.06], [-0.135, 0.548, 0.14], { dref: [1, 0, 0] });
      break;
    }
    default: {                                   // 11: holding a lotus on its long stalk at the shoulder, the other hand on the hip
      arm(S2, [-0.165, 0.7, D(0.7) + 0.05], [-0.15, 0.8, 0.09]);
      F.tube([[-0.15, 0.55, 0.06, 0.004, 0.004], [-0.148, 0.8, 0.09, 0.005, 0.005], [-0.18, 0.95, 0.075, 0.005, 0.005]], { sides: hi ? 5 : 4, sub: 2 });
      const fc = [-0.18, 0.985, 0.075];
      for (let k = 0; k < (hi ? 8 : 5); k++) { const th = k * Math.PI * 2 / (hi ? 8 : 5); F.ell([fc[0] + Math.cos(th) * 0.022, fc[1] + 0.01, fc[2] + Math.sin(th) * 0.022], [0.011, 0.03, 0.006], { axis: [Math.cos(th) * 0.6, 1, Math.sin(th) * 0.6], sides: 5, rings: 3 }); }
      F.ell([fc[0], fc[1] + 0.004, fc[2]], [0.014, 0.016, 0.014], { sides: 6, rings: 3 });
      arm(S1, [0.15, 0.665, D(0.665) + 0.03], [0.105, 0.58, D(0.58) + 0.05]);
      break;
    }
  }
  void rnd;
}
