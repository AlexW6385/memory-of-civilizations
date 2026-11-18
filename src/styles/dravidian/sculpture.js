// The figures of the Nayaka temple as modelled sculpture (docs/settlements/madurai.md §17): gods, goddesses, a couple, a
// seated deity and the club-bearing guardian, built from rounded limbs, a torso, a head with brow, nose, lips and ears,
// drapery that follows the body in pleats, and gilded crown, collar, belt, armlets and emblems; the door guardians
// (dvarapalas) of the gopuram's passage at three times the size; the carved deity on a pillar's shaft.
// Everything is built in the figure's own frame (x to the viewer's right, y up, w out toward the viewer, the height of
// the god with his crown 1.16) with the Sculpt kit of the Nabataean pass (src/styles/nabataean/sculpt.js); a figure comes
// out as two geometries, the body (cream, tinted to the paint it stands for) and the gilt (crown, jewels, emblems, the
// flame arch behind it). `lod` 0 is the full carving (fingers, ears, eyes), 1 the reduced one (the base's niches),
// 2 the far one (a few dozen triangles: the upper tiers and the other gopurams, seen from 60 m and more).
// No random numbers: every build is the same.

import { Sculpt, blob, blobDir, tube, rodT, torus, add, sub, mul, norm, hash3 } from '../nabataean/sculpt.js';
import { merge } from '../../objects/kit.js';

const PI = Math.PI;
const pleats = (a, n, p, a2 = 0) => (t, th) => 1 + (a + a2 * t) * Math.cos(n * th + p * t * 6.28);

/** A standing figure's joints (the god, 1.0 high to the crown of the head). */
const std = () => ({
  hipL: [-0.05, 0.5, 0], kneeL: [-0.055, 0.27, 0.01], ankL: [-0.055, 0.05, 0], hipR: [0.05, 0.5, 0], kneeR: [0.055, 0.27, 0.01], ankR: [0.055, 0.05, 0],
  pelvis: [0, 0.5, 0], waist: [0, 0.6, 0], chest: [0, 0.74, 0.004], neckb: [0, 0.83, 0], head: [0, 0.935, 0.01],
  shL: [-0.105, 0.8, 0], shR: [0.105, 0.8, 0],
});

/** A limb through the joints J, its section [fraction along it, ra, rb] (the swelling of the muscle). */
function limb(S, J, prof, { seg = 8, ref = [0, 0, 1], cap = [1, 1] } = {}) {
  const cum = [0]; for (let i = 0; i + 1 < J.length; i++) cum.push(cum[i] + Math.hypot(...sub(J[i + 1], J[i])));
  const tot = cum[cum.length - 1];
  const at = (f) => { const d = f * tot; let i = 0; while (i + 2 < J.length && cum[i + 1] < d) i++; const t = (d - cum[i]) / ((cum[i + 1] - cum[i]) || 1); return add(J[i], mul(sub(J[i + 1], J[i]), Math.max(0, Math.min(1, t)))); };
  tube(S, prof.map(([f, ra, rb]) => [...at(f), ra, rb ?? ra]), { seg, sub: 2, ref, cap, capN: 1 });
}

/** The head: skull, jaw, brows, eyes, nose, lips, cheeks, ears; `ugra` the fierce face of a guardian (bulging eyes, heavy brows, moustache, fangs). */
function head(Sb, Sg, c, { lod = 0, k = 1, ugra = false, female = false, crown = 'mukuta', ring = true } = {}) {
  const [x, y, z] = c, q = (dx, dy, dz) => [x + dx * k, y + dy * k, z + dz * k], r = (a, b, d) => [a * k, b * k, d * k];
  const sg = lod ? 6 : 8;
  blob(Sb, c, r(0.05, 0.062, 0.056), 4, sg);                                         // the skull
  blob(Sb, q(0, -0.034, 0.014), r(0.037, 0.036, 0.04), 3, sg);                        // the jaw and the chin
  if (lod === 0) {
    for (const s of [-1, 1]) {
      blobDir(Sb, q(s * 0.025, 0.021, 0.047), [s, ugra ? -0.5 : -0.12, 0.1], (ugra ? 0.026 : 0.022) * k, (ugra ? 0.009 : 0.006) * k, (ugra ? 0.012 : 0.008) * k, [0, 1, 0], 2, 6);   // the brow
      blob(Sb, q(s * 0.02, 0.008, 0.048), r(ugra ? 0.014 : 0.01, ugra ? 0.011 : 0.005, ugra ? 0.009 : 0.006), 2, 6);                                                              // the eye
      blob(Sb, q(s * 0.052, 0, -0.004), r(0.006, ugra ? 0.022 : 0.018, 0.012), 3, 6);                                                                                              // the ear
      blob(Sb, q(s * 0.03, -0.016, 0.046), r(0.012, 0.009, 0.008), 2, 6);                                                                                                          // the cheek
    }
    blobDir(Sb, q(0, -0.004, 0.056), [0, -0.5, 0.6], 0.017 * k, 0.007 * k, 0.009 * k, [1, 0, 0], 3, 6);        // the nose
    blob(Sb, q(0, -0.026, 0.05), r(0.014, 0.0045, 0.0065), 2, 6); blob(Sb, q(0, -0.034, 0.048), r(0.012, 0.0045, 0.0065), 2, 6);   // the lips
    if (ugra) {
      for (const s of [-1, 1]) blobDir(Sb, q(s * 0.022, -0.018, 0.054), [s, -0.25, 0.1], 0.026 * k, 0.005 * k, 0.005 * k, [0, 1, 0], 2, 5);    // the moustache
      for (const s of [-1, 1]) rodT(Sb, q(s * 0.01, -0.03, 0.053), q(s * 0.012, -0.042, 0.054), 0.0035 * k, 0.001 * k, { seg: 4 });            // the fangs
    }
  } else {
    blobDir(Sb, q(0, -0.004, 0.056), [0, -0.5, 0.6], 0.017 * k, 0.007 * k, 0.009 * k, [1, 0, 0], 2, 5);
    for (const s of [-1, 1]) blobDir(Sb, q(s * 0.025, 0.021, 0.047), [s, -0.12, 0.1], 0.022 * k, 0.006 * k, 0.008 * k, [0, 1, 0], 2, 5);
  }
  tube(Sb, [[x, y - 0.045 * k, z - 0.005, 0.027 * k], [x, y - 0.1 * k, z - 0.012, 0.03 * k]], { seg: lod ? 6 : 8, sub: 1, capN: 1 });   // the neck
  // the hair: a high knot (jata) of the guardian, a bun of the goddess, the crown of the god
  if (crown === 'mukuta') {
    // the karanda mukuta: a tall cone of tiers on a diadem band, scalloped, with a finial
    const pts = [[x, y + 0.04 * k, z - 0.004, 0.056 * k], [x, y + 0.075 * k, z - 0.004, 0.06 * k], [x, y + 0.095 * k, z - 0.004, 0.05 * k], [x, y + 0.125 * k, z - 0.004, 0.047 * k], [x, y + 0.15 * k, z - 0.004, 0.034 * k], [x, y + 0.178 * k, z - 0.004, 0.026 * k], [x, y + 0.2 * k, z - 0.004, 0.011 * k]];
    tube(Sg, pts, { seg: lod ? 6 : 10, sub: 1, capN: 1, ref: [1, 0, 0], fold: pleats(lod ? 0.05 : 0.09, 8, 0, 0) });
    if (!lod) { blob(Sg, q(0, 0.215, -0.004), r(0.012, 0.016, 0.012), 3, 6); for (const s of [-1, 1]) blob(Sg, q(s * 0.055, 0.0, 0.0), r(0.009, 0.026, 0.01), 3, 6); }
    if (ring && !lod) torus(Sg, q(0, 0.058, 0.003), [1, 0, 0], [0, 0, 1], 0.052 * k, 0.005 * k, { seg: 10, sec: 3 });
  } else if (crown === 'jata') {
    blob(Sb, q(0, 0.05, -0.012), r(0.046, 0.05, 0.05), 3, sg);
    tube(Sb, [[x, y + 0.07 * k, z - 0.012, 0.04 * k], [x, y + 0.11 * k, z - 0.014, 0.034 * k], [x, y + 0.15 * k, z - 0.012, 0.022 * k], [x, y + 0.18 * k, z - 0.01, 0.006 * k]], { seg: lod ? 6 : 8, sub: 1, capN: 1, ref: [1, 0, 0], fold: pleats(0.12, 6, 1) });
    if (!lod) torus(Sg, q(0, 0.075, -0.008), [1, 0, 0], [0, 0, 1], 0.046 * k, 0.006 * k, { seg: 10, sec: 3 });
  } else {            // a bun at the back (a goddess without the high crown)
    blob(Sb, q(0, 0.012, -0.012), r(0.054, 0.062, 0.058), 4, sg);
    blob(Sb, q(0, -0.004, -0.06), r(0.026, 0.03, 0.02), 3, 6);
  }
  if (!lod && !ugra) for (const s of [-1, 1]) blob(Sg, q(s * 0.057, -0.024, 0.0), r(0.005, 0.015, 0.008), 2, 5);   // the ear-rings
  void female;
}

/** A hand: palm and fingers, a thumb; wr the wrist, d the direction along the hand, side the thumb's side. */
function hand(S, wr, d, side, lod, k = 1) {
  const dd = norm(d), c = add(wr, mul(dd, 0.02 * k));
  blobDir(S, c, dd, 0.022 * k, 0.012 * k, 0.007 * k, side, 3, 6);
  if (lod === 0) { blobDir(S, add(wr, mul(dd, 0.046 * k)), dd, 0.02 * k, 0.012 * k, 0.005 * k, side, 2, 6); rodT(S, add(wr, mul(side, 0.01 * k)), add(add(wr, mul(side, 0.022 * k)), mul(dd, 0.03 * k)), 0.006 * k, 0.004 * k, { seg: 4 }); }
}
/** A foot: instep and toes, the heel; an anklet in the gilt. */
function foot(S, Sg, an, lod, dirx = 0, anklet = true) {
  blobDir(S, add(an, [dirx * 0.008, -0.026, 0.026]), [dirx * 0.2, -0.1, 1], 0.045, 0.017, 0.012, [1, 0, 0], 2, lod ? 5 : 6);
  blob(S, add(an, [0, -0.006, -0.005]), [0.018, 0.022, 0.02], 3, 6);
  if (anklet && !lod) torus(Sg, add(an, [0, 0.01, 0]), [1, 0, 0], [0, 0, 1], 0.021, 0.0055, { seg: 6, sec: 3 });
}

/** The jewels of a figure in the gilt: the collar, the armlets and bracelets, the belt with its clasp, the sacred thread. */
function jewels(Sg, P, arms, { lod = 0, female = false, belt = 0.61 } = {}) {
  torus(Sg, [0, P.neckb[1] - 0.012, 0.012], [1, 0, 0], [0, 0, 1], 0.05, 0.008, { seg: lod ? 8 : 12, sec: 3, rb: 0.011 });          // the collar
  if (!lod) {
    // the chain of beads hanging to the breast
    tube(Sg, [[-0.05, P.neckb[1] - 0.02, 0.025, 0.006], [-0.03, P.neckb[1] - 0.06, 0.058, 0.007], [0, P.neckb[1] - 0.085, 0.066, 0.008], [0.03, P.neckb[1] - 0.06, 0.058, 0.007], [0.05, P.neckb[1] - 0.02, 0.025, 0.006]], { seg: 5, sub: 2, capN: 1, ref: [0, 0, 1] });
    blob(Sg, [0, P.neckb[1] - 0.088, 0.07], [0.014, 0.016, 0.008], 2, 6);
  }
  torus(Sg, [P.waist[0], belt, 0.006], [1, 0, 0], [0, 0, 1], female ? 0.062 : 0.074, 0.011, { seg: lod ? 8 : 12, sec: 3, rb: 0.014 });   // the belt
  if (!lod) blob(Sg, [P.waist[0], belt, (female ? 0.062 : 0.074) * 0.78 + 0.02], [0.024, 0.02, 0.012], 2, 6);                              // its clasp
  if (!lod) for (const A of arms) {
    const [sh, el, wr] = A.J;
    torus(Sg, add(sh, mul(sub(el, sh), 0.42)), norm(cross3(sub(el, sh), [0, 0, 1])), norm(cross3(sub(el, sh), norm(cross3(sub(el, sh), [0, 0, 1])))), 0.031, 0.007, { seg: 6, sec: 3 });
    torus(Sg, add(wr, mul(sub(wr, el), -0.06)), norm(cross3(sub(wr, el), [0, 0, 1])), norm(cross3(sub(wr, el), norm(cross3(sub(wr, el), [0, 0, 1])))), 0.0185, 0.005, { seg: 6, sec: 3 });
  }
}
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The lower garment: a dhoti (or a sari) to the hem, in pleats, the sash end hanging in front, drawn between the knees. */
function lowerCloth(Sb, P, { lod = 0, hem = 0.17, belt = 0.64, spread = 1, female = false, hip = 0 } = {}) {
  const w = female ? 0.9 : 1;
  tube(Sb, [[hip, belt, 0.0, 0.08 * w, 0.056], [hip * 0.8, belt - 0.12, 0.004, 0.098 * w * spread, 0.07], [0, (belt + hem) / 2 - 0.02, 0.01, 0.108 * spread, 0.078], [0, hem, 0.012, 0.126 * spread, 0.086]], { seg: lod ? 8 : 12, sub: 1, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.06, 7, 1.0, 0.04) });
  if (lod === 0) {
    // the pleated tail of the dhoti falling between the legs in a fan, and the end of the sash at the hip
    tube(Sb, [[0, belt - 0.02, 0.058, 0.022, 0.012], [0.004, (belt + hem) / 2, 0.088, 0.036, 0.016], [0, hem + 0.01, 0.094, 0.05, 0.018]], { seg: 8, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.18, 4, 0.5, 0.1) });
    tube(Sb, [[-0.075, belt - 0.01, 0.04, 0.02, 0.012], [-0.098, belt - 0.12, 0.064, 0.028, 0.014], [-0.1, hem + 0.06, 0.074, 0.04, 0.016]], { seg: 6, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.14, 3, 0.4) });
  }
}

/** The body of a standing human: the torso, shoulders, neck, the arms (A = [{J: [shoulder, elbow, wrist], hand: [d, side]}]), the legs below the cloth. */
function body(Sb, Sg, P, arms, o = {}) {
  const { lod = 0, female = false, fat = 1, legs = true, hem = 0.17, ugra = false } = o;
  const w = female ? 0.9 : 1;
  tube(Sb, [[...P.pelvis, 0.07 * w * fat, 0.05], [...P.waist, 0.055 * w * fat, 0.044], [...P.chest, (female ? 0.082 : 0.093) * fat, 0.057], [...P.neckb, 0.07, 0.04]], { seg: lod ? 7 : 10, sub: 2, ref: [1, 0, 0], capN: 1 });
  for (const s of [-1, 1]) blob(Sb, add(P['sh' + (s < 0 ? 'L' : 'R')], [0, 0.004, -0.004]), [0.034 * fat, 0.03, 0.034], 3, lod ? 5 : 7);
  if (female) for (const s of [-1, 1]) blob(Sb, add(P.chest, [s * 0.036, -0.012, 0.038]), [0.031, 0.03, 0.026], 3, lod ? 5 : 7);
  else if (!lod) { for (const s of [-1, 1]) blob(Sb, add(P.chest, [s * 0.04, 0.0, 0.034]), [0.04, 0.03, 0.024], 3, 7); blob(Sb, add(P.waist, [0, 0.0, 0.03]), [0.052 * fat, 0.05, 0.026], 3, 7); }
  for (const A of arms) {
    const [sh, el, wr] = A.J;
    limb(Sb, [sh, el, wr], [[0, 0.036 * fat, 0.034 * fat], [0.28, 0.034 * fat, 0.032 * fat], [0.5, 0.024, 0.024], [0.62, 0.027, 0.025], [1, 0.015, 0.016]], { seg: lod ? 5 : 7 });
    hand(Sb, wr, A.hand[0], A.hand[1], lod);
  }
  if (legs) for (const s of ['L', 'R']) {
    const J = [add(P['knee' + s], [0, -0.1, 0]), P['ank' + s]];
    tube(Sb, [[...J[0], 0.036 * fat, 0.036 * fat], [...add(J[0], mul(sub(J[1], J[0]), 0.35)), 0.04 * fat, 0.04 * fat], [...J[1], 0.02]], { seg: lod ? 6 : 8, sub: 1, capN: 1 });
    foot(Sb, Sg, P['ank' + s], lod, s === 'L' ? -1 : 1);
  }
  void hem; void ugra;
}

/** A figure's emblem held in a raised hand: a discus (chakra) or a conch (shankha), a lotus bud, a club's head. */
function emblem(Sg, kind, c, lod) {
  if (kind === 'chakra') {
    torus(Sg, c, [1, 0, 0], [0, 1, 0], 0.062, 0.008, { seg: lod ? 10 : 16, sec: 3, rb: 0.012 });
    blob(Sg, c, [0.016, 0.016, 0.014], 2, 6);
    if (!lod) for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; blobDir(Sg, add(c, [Math.cos(a) * 0.072, Math.sin(a) * 0.072, 0]), [Math.cos(a), Math.sin(a), 0], 0.012, 0.007, 0.006, [0, 0, 1], 2, 4); }
  } else if (kind === 'shankha') {
    blobDir(Sg, add(c, [0, 0.03, 0]), [0.15, 1, 0], 0.052, 0.026, 0.022, [0, 0, 1], 3, lod ? 6 : 8);
    if (!lod) blobDir(Sg, add(c, [0.004, 0.082, 0]), [0.2, 1, 0], 0.016, 0.01, 0.01, [0, 0, 1], 2, 5);
  } else if (kind === 'bud') {
    blobDir(Sg, add(c, [0, 0.04, 0]), [0, 1, 0], 0.045, 0.02, 0.02, [0, 0, 1], 3, 7);
    if (!lod) for (const s of [-1, 1]) blobDir(Sg, add(c, [s * 0.016, 0.034, 0]), [s * 0.5, 1, 0], 0.035, 0.012, 0.007, [0, 0, 1], 2, 5);
  }
}

/** A lotus flower (open, in the gilt) on a stem from `from` to `to`. */
function lotus(Sb, Sg, from, to, lod) {
  rodT(Sb, from, to, 0.006, 0.0045, { seg: 4 });
  for (let i = 0; i < (lod ? 5 : 8); i++) {
    const a = i / (lod ? 5 : 8) * PI * 2, dx = Math.cos(a), dz = Math.sin(a);
    blobDir(Sg, add(to, [dx * 0.022, 0.012, dz * 0.022]), [dx * 0.8, 1, dz * 0.8], 0.036, 0.011, 0.005, [dz, 0, -dx], 2, 5);
  }
  blob(Sg, add(to, [0, 0.01, 0]), [0.016, 0.014, 0.016], 2, 6);
}

/** Pose tables: the joints of the arms (the viewer's right x > 0) and the legs of each standing kind. */
function pose(kind) {
  const P = std();
  if (kind === 0) {            // a god: the front right hand raised in blessing (abhaya), the left at the hip, the back hands holding discus and conch
    Object.assign(P, { hipL: [-0.06, 0.5, 0.0], kneeL: [-0.062, 0.27, 0.014], pelvis: [-0.008, 0.5, 0], waist: [-0.004, 0.6, 0.004], chest: [0.006, 0.74, 0.008], head: [0.012, 0.935, 0.02] });
    return { P, arms: [{ J: [[0.105, 0.8, 0], [0.17, 0.68, 0.034], [0.205, 0.8, 0.075]], hand: [[0.05, 1, 0.12], [-1, 0, 0]] }, { J: [[-0.105, 0.8, 0], [-0.155, 0.66, 0.01], [-0.108, 0.57, 0.05]], hand: [[0.5, -1, 0.5], [1, 0, 0]] },
      { J: [[0.112, 0.815, -0.03], [0.2, 0.93, -0.034], [0.222, 1.04, -0.03]], hand: [[0, 1, 0], [-1, 0, 0]], back: 'chakra' }, { J: [[-0.112, 0.815, -0.03], [-0.2, 0.93, -0.034], [-0.222, 1.04, -0.03]], hand: [[0, 1, 0], [1, 0, 0]], back: 'shankha' }] };
  }
  if (kind === 1) {            // a goddess holding a lotus in the right hand, the left hanging
    Object.assign(P, { hipL: [-0.052, 0.5, 0.01], kneeL: [-0.058, 0.27, 0.03], pelvis: [-0.012, 0.5, 0.004], waist: [0.0, 0.6, 0.006], chest: [0.01, 0.74, 0.012], head: [0.02, 0.935, 0.022] });
    return { P, arms: [{ J: [[0.1, 0.8, 0.004], [0.165, 0.69, 0.03], [0.15, 0.81, 0.066]], hand: [[-0.1, 1, 0.1], [-1, 0, 0]], lotus: [0.15, 0.81, 0.066] }, { J: [[-0.1, 0.795, 0.004], [-0.125, 0.65, 0.02], [-0.118, 0.51, 0.045]], hand: [[0, -1, 0.3], [1, 0, 0]] }] };
  }
  if (kind === 6) {            // a goddess with the right hand raised, the left on her hip
    Object.assign(P, { hipR: [0.052, 0.5, 0.01], kneeR: [0.058, 0.27, 0.03], pelvis: [0.012, 0.5, 0.004], waist: [0.0, 0.6, 0.006], chest: [-0.008, 0.74, 0.012], head: [-0.016, 0.935, 0.022] });
    return { P, arms: [{ J: [[0.1, 0.8, 0.004], [0.175, 0.7, 0.03], [0.2, 0.83, 0.06]], hand: [[0.05, 1, 0.1], [-1, 0, 0]] }, { J: [[-0.1, 0.795, 0.004], [-0.17, 0.66, 0.012], [-0.09, 0.595, 0.05]], hand: [[0.7, -0.3, 0.5], [0, 1, 0]] }] };
  }
  // 5: the guardian: legs apart, the right hand on the club's head, the left raised with the finger pointing
  Object.assign(P, { hipL: [-0.07, 0.5, 0.0], kneeL: [-0.115, 0.28, 0.04], ankL: [-0.135, 0.05, 0.02], hipR: [0.07, 0.5, 0.0], kneeR: [0.115, 0.28, 0.04], ankR: [0.135, 0.05, 0.02], pelvis: [0, 0.5, 0], waist: [0.004, 0.6, 0.006], chest: [0.008, 0.74, 0.01], head: [0.01, 0.935, 0.026] });
  return { P, arms: [{ J: [[0.115, 0.8, 0.004], [0.2, 0.7, 0.04], [0.245, 0.585, 0.07]], hand: [[0.2, -1, 0.3], [-1, 0, 0]], club: true }, { J: [[-0.115, 0.8, 0.004], [-0.205, 0.74, 0.044], [-0.2, 0.88, 0.075]], hand: [[0, 1, 0.1], [1, 0, 0]] }] };
}

/** A standing figure of `kind` into the body sculpt Sb and the gilt Sg. */
function standing(Sb, Sg, kind, lod, hero = false) {
  const { P, arms } = pose(kind), female = kind === 1 || kind === 6, ugra = kind === 5, fat = ugra ? 1.3 : 1;
  const l = hero ? 0 : lod;
  body(Sb, Sg, P, arms, { lod: l, female, fat, ugra });
  head(Sb, Sg, P.head, { lod: l, ugra, female, crown: ugra ? 'jata' : 'mukuta' });
  // the lower garment: the guardian's short dhoti to above the knee, the others' to the calf (the god) or the ankle (the goddess)
  if (ugra) {
    lowerCloth(Sb, P, { lod: l, hem: 0.33, belt: 0.64, spread: 1.25, hip: 0 });
    // the powerful calves, the thighs above the knee
    for (const s of [-1, 1]) { const hp = s < 0 ? P.hipL : P.hipR, kn = s < 0 ? P.kneeL : P.kneeR; tube(Sb, [[hp[0] + s * 0.006, 0.4, hp[2], 0.052, 0.05], [kn[0], kn[1] + 0.03, kn[2] + 0.01, 0.046, 0.044], [kn[0], kn[1] - 0.06, kn[2] + 0.014, 0.04]], { seg: l ? 6 : 8, sub: 1, capN: 1 }); }
    torus(Sg, [0, 0.605, 0.01], [1, 0, 0], [0, 0, 1], 0.09, 0.012, { seg: l ? 9 : 14, sec: 3, rb: 0.016 });            // a broad belt
    for (const s of [-1, 1]) blob(Sg, [s * 0.1, 0.45, 0.062], [0.02, 0.02, 0.016], 2, 5);                                  // its bosses
  } else lowerCloth(Sb, P, { lod: l, hem: female ? 0.08 : 0.17, belt: 0.64, female, spread: female ? 1.05 : 1, hip: P.pelvis[0] });
  if (female && !l) {            // the sari's end over the left shoulder, falling in pleats at the back, the breast-band
    tube(Sb, [[-0.11, 0.84, 0.0, 0.022, 0.014], [-0.06, 0.76, 0.05, 0.026, 0.016], [0.0, 0.69, 0.062, 0.026, 0.016], [0.07, 0.63, 0.06, 0.02, 0.014]], { seg: 6, sub: 2, capN: 1, ref: [0, 0, 1], fold: pleats(0.2, 3, 0.7) });
    tube(Sb, [[-0.125, 0.8, -0.02, 0.03, 0.01], [-0.14, 0.55, -0.03, 0.04, 0.012], [-0.15, 0.2, -0.02, 0.05, 0.012]], { seg: 6, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(0.2, 3, 1.2) });
  }
  if (!female && !ugra && !l) {   // the upper cloth across the shoulder (uttariya) and the sacred thread
    tube(Sb, [[-0.1, 0.84, 0.026, 0.014, 0.01], [-0.04, 0.76, 0.06, 0.016, 0.01], [0.03, 0.68, 0.063, 0.016, 0.01], [0.09, 0.6, 0.05, 0.014, 0.01]], { seg: 5, sub: 2, capN: 1, ref: [0, 0, 1] });
  }
  jewels(Sg, P, arms, { lod: l, female, belt: ugra ? 0.605 : 0.615 });
  for (const A of arms) {
    if (A.back) emblem(Sg, A.back, add(A.J[2], A.back === 'chakra' ? [0.0, 0.048, 0] : [0, 0.0, 0]), l);
    if (A.lotus) lotus(Sb, Sg, add(A.J[2], [0, 0.0, 0]), add(A.J[2], [0.02, 0.19, 0.005]), l);
    if (A.club) {
      const [wx, , wz] = A.J[2];
      rodT(Sg, [wx, 0.02, wz], [wx, 0.74, wz], 0.017, 0.015, { seg: l ? 5 : 7 });           // the shaft
      tube(Sg, [[wx, 0.6, wz, 0.022], [wx, 0.72, wz, 0.043], [wx, 0.84, wz, 0.05], [wx, 0.95, wz, 0.036], [wx, 1.0, wz, 0.012]], { seg: l ? 7 : 10, sub: 2, capN: 1, ref: [1, 0, 0], fold: pleats(l ? 0.1 : 0.16, 8, 0) });   // its ribbed head
      if (!l) torus(Sg, [wx, 0.62, wz], [1, 0, 0], [0, 0, 1], 0.026, 0.006, { seg: 8, sec: 3 });
    }
  }
  // the flame arch behind the god (prabhavali), gilt
  if (!hero) torus(Sg, [P.chest[0], 0.78, -0.07], [1, 0, 0], [0, 1, 0], 0.2, 0.0085, { seg: l ? 12 : 16, sec: 3, arc: PI * 1.16, from: -PI * 0.08, rb: 0.012 });
}

/** A seated deity: the legs crossed, the hands in the lap and raised, on a lotus seat; the crown, the flame arch. */
function seated(Sb, Sg, lod) {
  const P = { pelvis: [0, 0.2, 0], waist: [0, 0.31, 0.0], chest: [0, 0.45, 0.006], neckb: [0, 0.54, 0], head: [0, 0.645, 0.012], shL: [-0.105, 0.51, 0], shR: [0.105, 0.51, 0] };
  const arms = [{ J: [[0.105, 0.51, 0], [0.17, 0.4, 0.04], [0.19, 0.5, 0.08]], hand: [[0.05, 1, 0.1], [-1, 0, 0]] }, { J: [[-0.105, 0.51, 0], [-0.165, 0.37, 0.03], [-0.09, 0.27, 0.11]], hand: [[0.8, -0.2, 0.6], [0, 1, 0]] }];
  tube(Sb, [[...P.pelvis, 0.085, 0.06], [...P.waist, 0.058, 0.045], [...P.chest, 0.092, 0.057], [...P.neckb, 0.07, 0.04]], { seg: lod ? 9 : 13, sub: 2, ref: [1, 0, 0], capN: 1 });
  for (const s of [-1, 1]) blob(Sb, add(P[s < 0 ? 'shL' : 'shR'], [0, 0.004, -0.004]), [0.034, 0.03, 0.034], 3, lod ? 5 : 7);
  if (!lod) for (const s of [-1, 1]) blob(Sb, add(P.chest, [s * 0.04, 0.0, 0.034]), [0.04, 0.03, 0.024], 3, 7);
  for (const A of arms) { limb(Sb, A.J, [[0, 0.036, 0.034], [0.28, 0.034, 0.032], [0.5, 0.024, 0.024], [0.62, 0.027, 0.025], [1, 0.015, 0.016]], { seg: lod ? 6 : 8 }); hand(Sb, A.J[2], A.hand[0], A.hand[1], lod); }
  // the crossed legs: thighs out to the sides, the shins crossed in front, the feet turned up
  for (const s of [-1, 1]) {
    tube(Sb, [[s * 0.06, 0.2, 0.03, 0.05, 0.05], [s * 0.15, 0.17, 0.09, 0.052, 0.052], [s * 0.2, 0.15, 0.13, 0.04, 0.04]], { seg: lod ? 7 : 9, sub: 2, capN: 1 });
    tube(Sb, [[s * 0.2, 0.15, 0.13, 0.04, 0.04], [s * 0.07, 0.12, 0.17, 0.034, 0.034], [-s * 0.04, 0.13, 0.19, 0.03, 0.03]], { seg: lod ? 7 : 9, sub: 2, capN: 1 });
    blobDir(Sb, [-s * 0.07, 0.15, 0.2], [-s, 0.5, 0.3], 0.04, 0.013, 0.02, [0, 1, 0], 3, lod ? 5 : 6);
  }
  // the cloth over the lap in a wide fan of folds
  tube(Sb, [[0, 0.24, 0.05, 0.1, 0.07], [0, 0.17, 0.1, 0.17, 0.1], [0, 0.1, 0.13, 0.22, 0.11]], { seg: lod ? 9 : 14, sub: 2, ref: [1, 0, 0], cap: [0, 0], fold: pleats(0.08, 7, 1.0, 0.04) });
  // the lotus seat: two rows of petals, in the gilt
  for (let i = 0; i < (lod ? 8 : 12); i++) { const a = i / (lod ? 8 : 12) * PI * 2, dx = Math.sin(a), dz = Math.cos(a); blobDir(Sg, [dx * 0.2, 0.04, dz * 0.15 + 0.04], [dx, 0.25, dz], 0.06, 0.026, 0.01, [0, 1, 0], 2, 5); }
  tube(Sg, [[0, 0.065, 0.04, 0.24, 0.19], [0, 0.085, 0.04, 0.2, 0.16]], { seg: lod ? 12 : 18, sub: 1, ref: [1, 0, 0], capN: 1, cap: [1, 1] });
  head(Sb, Sg, P.head, { lod, crown: 'mukuta' });
  jewels(Sg, { ...P, waist: [0, 0.3, 0] }, arms, { lod, belt: 0.3 });
  torus(Sg, [0, 0.64, -0.07], [1, 0, 0], [0, 1, 0], 0.18, 0.0085, { seg: lod ? 12 : 16, sec: 3, arc: PI * 1.2, from: -PI * 0.1, rb: 0.012 });
}

/** The far form: a tapered body, a head and a crown, a few dozen triangles, with a flat arch behind it (one geometry in the body's colour). */
function farFigure(Sb, seated) {
  if (seated) {
    tube(Sb, [[0, 0.1, 0.06, 0.2, 0.13], [0, 0.42, 0.0, 0.1, 0.06], [0, 0.5, 0, 0.08, 0.05]], { seg: 6, sub: 1, ref: [1, 0, 0], capN: 1 });
    blob(Sb, [0, 0.62, 0.01], [0.05, 0.06, 0.05], 2, 6);
    tube(Sb, [[0, 0.68, 0, 0.045], [0, 0.88, 0, 0.012]], { seg: 5, sub: 1, capN: 1 });
  } else {
    tube(Sb, [[0, 0.05, 0.01, 0.13, 0.09], [0, 0.5, 0, 0.08, 0.055], [0, 0.78, 0, 0.1, 0.06], [0, 0.86, 0, 0.05, 0.04]], { seg: 6, sub: 1, ref: [1, 0, 0], capN: 1 });
    blob(Sb, [0, 0.93, 0.01], [0.05, 0.06, 0.05], 2, 6);
    tube(Sb, [[0, 0.99, 0, 0.044], [0, 1.15, 0, 0.012]], { seg: 5, sub: 1, capN: 1 });
  }
  // the arms hanging out a little (the silhouette of four arms or a club): one flat blade each side
  Sb.box(-0.2, seated ? 0.3 : 0.55, -0.03, -0.1, seated ? 0.48 : 0.88, 0.03); Sb.box(0.1, seated ? 0.3 : 0.55, -0.03, 0.2, seated ? 0.48 : 0.88, 0.03);
}

const FIG = new Map();
/**
 * The pieces of a figure kind (0 god with four arms, 1 goddess with a lotus, 2 a couple, 3 a seated deity, 5 the guardian with a
 * club, 6 a goddess with a raised hand) at a level of detail: [['body', geometry], ['gilt', geometry]]; cached.
 */
export function figureParts(kind, lod) {
  const key = `${kind}/${lod}`;
  if (FIG.has(key)) return FIG.get(key);
  const flat = 0.78;
  let Sb = new Sculpt((p) => p, { flat }), Sg = new Sculpt((p) => p, { flat });
  if (lod === 2) { Sb = new Sculpt((p) => p, { flat }); farFigure(Sb, kind === 3 || kind === 2); }
  else if (kind === 3) seated(Sb, Sg, lod);
  else if (kind === 2) {
    // a couple: two standing figures at four fifths of the height, side by side
    const lc = Math.max(lod, 1), mk = (dx, k, female) => { const xf = ([x, y, w]) => [x * 0.8 + dx, y * 0.8, w * 0.8]; const b = new Sculpt(xf, { flat }), g = new Sculpt(xf, { flat }); standing(b, g, k, lc); return [b, g]; };
    const [b1, g1] = mk(-0.15, 0), [b2, g2] = mk(0.15, 1);
    void mk; Sb = { geometry: () => merge([b1.geometry(), b2.geometry()]), triangles: b1.triangles + b2.triangles };
    Sg = { geometry: () => merge([g1.geometry(), g2.geometry()]), triangles: g1.triangles + g2.triangles };
  } else standing(Sb, Sg, kind, lod);
  const res = [['body', Sb.geometry()]];
  if (lod !== 2) res.push(['gilt', Sg.geometry()]);
  FIG.set(key, res);
  return res;
}
/** The figure kinds in the order of the niches' rule. */
export const FIGURE_KINDS = [0, 1, 2, 3, 5, 6];

export { standing, seated, head, hand, foot, jewels, lowerCloth, body, emblem, lotus, pleats, limb, hash3, Sculpt, blob, blobDir, tube, rodT, torus };

const HERO = new Map();
/** The door guardian (dvarapala) of a gopuram's passage, full round (no relief flattening), the club on the side away from the door when `mirror` is false (the viewer's right). */
export function heroGuardian(mirror) {
  const k = mirror ? 1 : 0;
  if (HERO.has(k)) return HERO.get(k);
  const xf = mirror ? ([x, y, w]) => [-x, y, w] : (p) => p;
  const Sb = new Sculpt(xf, { flat: 1 }), Sg = new Sculpt(xf, { flat: 1 });
  standing(Sb, Sg, 5, 0, true);
  const res = [Sb.geometry(), Sg.geometry()];
  HERO.set(k, res);
  return res;
}
