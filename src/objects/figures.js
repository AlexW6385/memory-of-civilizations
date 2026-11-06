// The still figures of the streets (DESIGN §5 "Figures and life"): people in the dress of their
// place, standing, talking, sitting, squatting, carrying. A figure is built of a few assemblies —
// its skin (head with face, ears and nose, neck, hands, any bare limbs), its garment (body, sleeves,
// skirts with their folds), the second cloth (sash, collar, cape, apron, trousers, hose), the hair
// (with brows, eyes and beard), the hat and the shoes — each merged into one shape, cached, and put
// as one instance: about eight instances a figure. Each is varied by its seed: height, build, the
// shade of skin and cloth, the hair and its colour, a beard, the second garment.

import { box } from '../core/geom.js';
import { Matrix4, Vector3 } from '../core/three.js';
import { rng, placer, assembly, tube, folded, slathe } from './kit.js';

const ball = (r, n = 8, m = 6) => slathe(Array.from({ length: m }, (_, i) => { const t = i / (m - 1) * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);

const HB = 1.65;                                   // the height the figure is built at
const ell = (ax, az) => (th) => 1 / Math.hypot(Math.cos(th) / ax, Math.sin(th) / az);   // an elliptical section
const FRONT = (th) => Math.sin(th) < 0;           // −z is the front (the face)

// ---- the poses: the drop of the hips, the lean of the body, the arms ------------------------------------
// positions are given standing (y up from the soles, the figure facing −z); the upper body is then
// lowered by `drop` and leant forward by `lean` about the hips
const LEGS = {
  stand: { drop: 0, lean: 0 },
  sit: { drop: 0.31, lean: -0.05 },
  squat: { drop: 0.56, lean: -0.42 },
  kneel: { drop: 0.36, lean: 0 },                // upright on both knees, the shins along the ground behind
  cross: { drop: 0.74, lean: -0.04 },            // seated cross-legged on the ground
  brace: { drop: 0.05, lean: 0.3 },              // hauling: one foot forward, the body leant back on the rope
};
/** arm = [shoulder, elbow, wrist, hand direction] for the left (s = −1) and right (s = +1) arms. */
function arms(pose, s) {
  const S = [s * 0.172, 1.365, 0.005];
  switch (pose) {
    case 'clasp': return [S, [s * 0.205, 1.1, 0.01], [s * 0.075, 0.96, -0.12], [-s * 0.6, -0.3, -0.5]];
    case 'talk': return s > 0 ? [S, [0.215, 1.1, -0.03], [0.17, 1.13, -0.26], [-0.12, -0.2, -0.95]] : arms('hang', s);
    case 'sit': return [S, [s * 0.21, 1.1, -0.06], [s * 0.13, 0.95, -0.33], [0, -0.45, -0.85]];
    case 'squat': return [S, [s * 0.2, 1.12, -0.12], [s * 0.12, 1.06, -0.38], [0, -0.75, -0.6]];
    case 'head': return s > 0 ? [S, [0.255, 1.56, -0.02], [0.11, 1.74, -0.01], [-0.5, 0.75, 0]] : arms('hang', s);
    case 'pole': return s > 0 ? [S, [0.215, 1.15, -0.1], [0.16, 1.36, -0.28], [0, 0.85, 0.2]] : [S, [-0.205, 1.09, 0.0], [-0.17, 0.86, -0.08], [0.1, -0.9, -0.3]];
    case 'pray': return [S, [s * 0.19, 1.1, -0.07], [s * 0.024, 1.17, -0.2], [0, 0.88, -0.28]];                                  // the palms joined before the chest
    case 'pull': return s > 0 ? [S, [0.2, 1.12, -0.13], [0.045, 1.06, -0.4], [-0.1, 0, -1]] : [S, [-0.2, 1.11, -0.09], [-0.015, 1.05, -0.27], [0.12, 0, -1]];
    case 'staff': return s > 0 ? [S, [0.235, 1.1, -0.06], [0.25, 1.05, -0.25], [0, 1, 0.05]] : arms('hang', s);              // the staff grasped upright at the right side
    case 'child': return s < 0 ? [S, [-0.3, 1.12, 0.04], [-0.2, 0.97, -0.15], [0.55, 0.1, -0.35]] : arms('hang', s);           // the child held on the left hip
    case 'row': return [S, [s * 0.2, 1.13, -0.17], [s * 0.12, 1.13, -0.45], [0, -0.1, -1]];                                     // the oar handles drawn to the chest
    case 'punt': return s > 0 ? [S, [0.26, 1.13, -0.08], [0.3, 1.0, -0.16], [-0.3, 0.9, 0.05]] : [S, [-0.08, 1.3, -0.2], [0.12, 1.5, -0.12], [-0.25, 0.95, 0]];
    case 'cross': return [S, [s * 0.22, 1.1, -0.07], [s * 0.25, 0.96, -0.2], [s * 0.25, -0.5, -0.6]];                          // the hands on the knees
    case 'hoe': return s > 0 ? [S, [0.22, 1.1, -0.12], [0.08, 1.07, -0.33], [-0.4, -0.1, -0.9]] : [S, [-0.2, 1.06, -0.1], [-0.02, 0.88, -0.42], [0.4, -0.2, -0.9]];
    default: return [S, [s * 0.205, 1.085, 0.025], [s * 0.21, 0.84, -0.02], [s * 0.05, -1, -0.12]];
  }
}
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const va = (a, b, k = 1) => a.map((x, i) => x + b[i] * k);

/** The matrix taking a standing upper body to its pose (hips lowered, body leant forward about them). */
function upperM(legs) {
  const L = LEGS[legs] ?? LEGS.stand, hip = 0.88;
  return new Matrix4().makeTranslation(0, hip - L.drop, 0).multiply(new Matrix4().makeRotationX(L.lean)).multiply(new Matrix4().makeTranslation(0, -hip, 0));
}

// ---- the pieces ---------------------------------------------------------------------------------------
/** The head: skull and jaw, brow, nose, ears, chin; and the neck. Skin. */
function head(add) {
  const fx = ell(0.86, 1.0);
  const skull = slathe([[0.001, 1.448], [0.03, 1.452], [0.052, 1.468], [0.066, 1.495], [0.077, 1.53], [0.084, 1.565], [0.084, 1.6], [0.075, 1.628], [0.055, 1.648], [0.028, 1.658], [0.001, 1.66]], 12,
    (th, i, r, y) => fx(th) * (FRONT(th) ? 1.04 + (y < 1.5 ? 0.06 : 0) : 1.08) * (1 - (y < 1.52 && !FRONT(th) ? 0.08 : 0)));
  skull.translate(0, 0, -0.005); add('skin', skull);
  add('skin', tube([[0, 1.58, -0.087, 0.006], [0, 1.55, -0.098, 0.011, 0.009], [0, 1.54, -0.1, 0.007, 0.005]], 6));                       // the nose
  for (const s of [-1, 1]) { const e = ball(0.026, 6, 4); e.scale(0.35, 1.05, 0.75); e.translate(s * 0.08, 1.525, 0.0); add('skin', e); }        // the ears
  add('skin', tube([[0, 1.36, 0.005, 0.052, 0.046], [0, 1.43, 0.0, 0.046, 0.042], [0, 1.49, 0.01, 0.045, 0.042]], 8, { capA: false, capB: false }));
}
/** The eyes and the brows (dark), part of the hair assembly. */
function eyes(add) {
  for (const s of [-1, 1]) {
    const e = ball(0.0085, 5, 4); e.scale(1.25, 0.7, 0.5); e.translate(s * 0.031, 1.563, -0.0855); add('hair', e);
    if (s > 0) add('hair', tube([[-0.018, 1.509, -0.0875, 0.0022, 0.0018], [0, 1.507, -0.091, 0.0028, 0.002], [0.018, 1.509, -0.0875, 0.0022, 0.0018]], 4));   // the mouth
    add('hair', tube([[s * 0.016, 1.586, -0.0935, 0.004, 0.0022], [s * 0.034, 1.59, -0.0915, 0.0045, 0.0026], [s * 0.052, 1.586, -0.0835, 0.003, 0.002]], 4));
  }
}
/** A hand at wrist W, along d: palm, fingers a little curled, the thumb. Skin. */
function hand(add, W, d, s) {
  d = norm(d);
  const P = (k, dy = 0) => add_(W, d, k, dy);
  add('skin', tube([[...W, 0.03, 0.027], [...P(0.04), 0.037, 0.016], [...P(0.085), 0.035, 0.013], [...P(0.12, -0.008), 0.027, 0.011], [...P(0.14, -0.018), 0.012, 0.008]], 6));
  const side = norm([d[2] * s, 0, -d[0] * s]), T0 = va(va(W, d, 0.03), side, -0.025), T1 = va(va(T0, d, 0.055), side, -0.01);
  add('skin', tube([[...T0, 0.012], [...T1, 0.009], [...va(T1, d, 0.012), 0.005]], 5));
}
function add_(W, d, k, dy) { return [W[0] + d[0] * k, W[1] + d[1] * k + dy, W[2] + d[2] * k]; }

/** The torso of a garment (the shoulders sloping, the chest forward), standing. */
function torso(add, role, wide = 1) {
  const fx = ell(1, 0.66);
  add(role, slathe([[0.15 * wide, 0.84], [0.142 * wide, 0.96], [0.148, 1.08], [0.165, 1.22], [0.178, 1.3], [0.172, 1.345], [0.13, 1.39], [0.075, 1.425], [0.05, 1.44], [0.001, 1.442]], 14,
    (th, i, r, y) => fx(th) * (FRONT(th) && y > 1.12 && y < 1.36 ? 1.08 : 1)));
}
/** The sleeves: shoulder to wrist, a cap over the shoulder; loose (robes) or close. */
function sleeves(add, role, pose, { loose = 0, short = false } = {}) {
  for (const s of [-1, 1]) {
    const [S, E, W] = arms(pose, s), Wn = short ? va(E, norm(va(W, E, -1)), 0.07) : W;
    const rW = 0.04 + loose * 0.035;
    const pts = [[...va(S, [-s * 0.045, -0.025, 0]), 0.045], [...va(S, [0, -0.012, 0]), 0.056], [...va(S, va(E, S, -1), 0.5), 0.052], [...E, 0.047]];
    if (short) pts.push([...Wn, 0.05]);
    else pts.push([...va(E, va(W, E, -1), 0.5), 0.043 + loose * 0.012], [...Wn, rW]);
    add(role, tube(pts, 8, { capA: true, capB: false }));
    if (loose) { const d = norm(va(W, E, -1)); add(role, tube([[...va(W, d, -0.07), rW * 0.95], [...W, rW], [...va(W, d, 0.005), rW * 0.8]], 8, { capA: false, capB: false })); }
  }
}
/** The bare forearms from the elbow (a wrap or short sleeve). Skin. */
function forearms(add, pose) {
  for (const s of [-1, 1]) { const [, E, W] = arms(pose, s); add('skin', tube([[...E, 0.042], [...va(E, va(W, E, -1), 0.5), 0.036], [...W, 0.03]], 7, { capA: false, capB: false })); }
}
/** The hands at the ends of the arms. */
function hands(add, pose) { for (const s of [-1, 1]) { const [, , W, d] = arms(pose, s); hand(add, W, d, s); } }

/** The legs (role: trousers, hose or skin), by the pose of the legs. */
function legsOf(legs, s) {
  if (legs === 'sit') return [[s * 0.09, 0.57, 0.0], [s * 0.105, 0.56, -0.42], [s * 0.1, 0.1, -0.44]];
  if (legs === 'squat') return [[s * 0.1, 0.33, 0.03], [s * 0.15, 0.55, -0.28], [s * 0.11, 0.1, -0.15]];
  if (legs === 'kneel') return [[s * 0.09, 0.52, 0.0], [s * 0.1, 0.075, -0.05], [s * 0.095, 0.07, 0.36]];
  if (legs === 'cross') return [[s * 0.1, 0.15, 0.02], [s * 0.34, 0.12, -0.22], [-s * 0.07, s > 0 ? 0.135 : 0.075, -0.3]];
  if (legs === 'brace') return s < 0 ? [[-0.088, 0.82, 0.0], [-0.094, 0.47, -0.2], [-0.088, 0.1, -0.2]] : [[0.088, 0.82, 0.0], [0.094, 0.46, 0.17], [0.088, 0.1, 0.36]];
  return [[s * 0.088, 0.86, 0.0], [s * 0.094, 0.48, -0.012], [s * 0.088, 0.1, 0.005]];
}
function legTubes(add, role, legs, { from = 0, to = 5, thick = 1 } = {}) {
  for (const s of [-1, 1]) {
    const [Hp, K, A] = legsOf(legs, s), pts = [[...Hp, 0.078 * thick], [...va(Hp, va(K, Hp, -1), 0.5), 0.065 * thick], [...K, 0.054 * thick], [...va(K, va(A, K, -1), 0.4), 0.05 * thick], [...A, 0.04 * thick]];
    add(role, tube(pts.slice(from, to), 8, { capA: true, capB: from < 4 }));
  }
}
/** The feet (shoes or bare). */
function feet(add, role, legs) {
  for (const s of [-1, 1]) {
    const [, , A] = legsOf(legs, s), z = legs === 'sit' || legs === 'squat' || legs === 'brace' ? A[2] : 0.0;
    // kneeling: the feet lie behind, toes and instep on the ground; cross-legged: each foot under the other knee
    if (legs === 'kneel') { add(role, tube([[A[0], 0.075, A[2] - 0.04, 0.038, 0.035], [A[0], 0.055, A[2] + 0.06, 0.044, 0.032], [A[0] + s * 0.004, 0.035, A[2] + 0.15, 0.04, 0.022], [A[0] + s * 0.006, 0.028, A[2] + 0.2, 0.028, 0.016]], 7)); continue; }
    if (legs === 'cross') { add(role, tube([[A[0], A[1], A[2] + 0.03, 0.035, 0.035], [A[0] - s * 0.06, A[1] - 0.01, A[2] + 0.02, 0.042, 0.038], [A[0] - s * 0.15, A[1] - 0.025, A[2] + 0.04, 0.04, 0.026], [A[0] - s * 0.2, A[1] - 0.03, A[2] + 0.05, 0.026, 0.018]], 7)); continue; }
    add(role, tube([[A[0], 0.045, z + 0.06, 0.035, 0.035], [A[0], 0.04, z - 0.02, 0.045, 0.04], [A[0] + s * 0.004, 0.032, z - 0.12, 0.044, 0.03], [A[0] + s * 0.006, 0.028, z - 0.175, 0.03, 0.022]], 7));
  }
}

/** The skirt of a robe or a wrap (hem at `hem`, flaring), standing; or over the lap seated, squatting. */
function skirt(add, role, legs, { hem = 0.03, top = 1.0, flare = 1, seed = 1 } = {}) {
  if (legs === 'stand') {
    const len = top - hem, r0 = 0.15 + (0.1 * flare) * len;
    add(role, folded([[0.001, hem + 0.006], [r0 * 0.96, hem], [r0, hem + 0.012], [r0 * 0.97, hem + 0.05 * len], [0.2 * Math.min(1, 0.6 + len), hem + 0.45 * len], [0.162, top - 0.08], [0.15, top], [0.001, top + 0.01]], 16, 7, 0.07, seed).scale(1, 1, 0.86));
    return;
  }
  // seated or squatting: the robe over the thighs and down the shins to the hem, a fold of it behind
  legTubes(add, role, legs, { thick: 1.35 });
  const [, K, A] = legsOf(legs, 1), sq = legs === 'squat';
  add(role, tube([[0, K[1] + 0.02, K[2] - 0.03, 0.2, 0.07], [0, (K[1] + Math.max(hem, 0.06)) / 2, (K[2] + A[2]) / 2 - 0.06, 0.21, 0.06], [0, Math.max(hem, 0.05), A[2] - 0.08, 0.22, 0.05]], 10));
  const hipY = 0.88 - LEGS[legs].drop;
  add(role, folded([[sq ? 0.24 : 0.2, sq ? 0.05 : Math.max(0.46, hem)], [0.19, hipY - 0.05], [0.16, hipY + 0.05], [0.001, hipY + 0.06]], 14, 6, 0.06, seed).scale(1, 1, 0.8).translate(0, 0, sq ? 0.05 : 0.04));
}

/** Bare arms, shoulder to wrist (a bare-chested figure, a sheath dress's straps). Skin. */
function bareArms(add, pose) {
  for (const s of [-1, 1]) {
    const [S, E, W] = arms(pose, s);
    add('skin', tube([[...va(S, [-s * 0.045, -0.025, 0]), 0.045], [...va(S, [0, -0.012, 0]), 0.05], [...va(S, va(E, S, -1), 0.5), 0.045, 0.047], [...E, 0.038], [...va(E, va(W, E, -1), 0.45), 0.037, 0.034], [...W, 0.029, 0.026]], 8, { capA: true, capB: false }));
  }
}
/** The torso's half-width at height y (the profile of torso()), for the cloth laid over it. */
const TORSO = [[0.15, 0.84], [0.142, 0.96], [0.148, 1.08], [0.165, 1.22], [0.178, 1.3], [0.172, 1.345], [0.13, 1.39], [0.075, 1.425], [0.05, 1.44]];
const torsoMod = (k) => { const fx = ell(1, 0.66); return (th, i, r, y) => fx(th) * (FRONT(th) && y > 1.12 && y < 1.36 ? 1.08 : 1) * k; };
/**
 * The cloth of the lower body that is not a robe's skirt: the loincloth (a band at the hips, a flap
 * before and behind, the cloth between the legs), the shendyt (the wrapped linen kilt to above the
 * knee with its belt and the pleated front panel where the end is tucked), the sheath dress (close from
 * under the breast to the ankle, held by two straps over the shoulders). Standing or in any pose.
 */
/** A robe, wrap or dress kneeling or seated cross-legged: its skirt pooled round the legs on the ground (and kneeling the calves under it). */
function pool(a, up, legs, seed, long = true) {
  if (legs === 'kneel') {
    up('c1', folded([[0.001, 0.395], [0.23, 0.39], [0.24, 0.41], [0.215, 0.62], [0.17, 0.8], [0.155, 1.0], [0.001, 1.01]], 16, 9, 0.06, seed).scale(1, 1, 0.86));
    if (long) legTubes(a, 'c1', 'kneel', { from: 2, thick: 1.45 });
  } else {
    // cross-legged: the cloth over the lap and along the thighs to the knees; a robe's down the shins too
    up('c1', folded([[0.001, 0.752], [0.22, 0.755], [0.245, 0.8], [0.21, 0.9], [0.16, 1.0], [0.001, 1.01]], 16, 7, 0.05, seed).scale(1, 1, 0.8));
    legTubes(a, 'c1', 'cross', { to: 3, thick: 1.3 });
    if (long) legTubes(a, 'c1', 'cross', { from: 2, thick: 1.3 });
  }
}
/** A point on the torso's surface at height y, x across (front: −z), lifted off it by `off`. */
function onTorso(x, y, front, off = 0.006) {
  let r = TORSO[0][0];
  for (let i = 0; i + 1 < TORSO.length; i++) { const [ra, ya] = TORSO[i], [rb, yb] = TORSO[i + 1]; if (y >= ya && y <= yb) r = ra + (rb - ra) * (y - ya) / (yb - ya); }
  if (y > TORSO[TORSO.length - 1][1]) r = TORSO[TORSO.length - 1][0];
  const k = front && y > 1.12 && y < 1.36 ? 1.08 : 1, rx = r * k, rz = r * 0.66 * k;
  return [x, y, (front ? -1 : 1) * (rz * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2)) + off)];
}
function loinCloth(a, up, legs, seed) {
  up('c1', slathe([[0.158, 0.79], [0.163, 0.82], [0.163, 0.9], [0.156, 0.935], [0.142, 0.94]], 14, (th) => ell(1, 0.7)(th)));
  if (legs === 'stand' || legs === 'kneel' || legs === 'brace') for (const f of [-1, 1]) up('c1', tube([[0, 0.9, f * 0.112, 0.055, 0.008], [0, 0.78, f * 0.118, 0.065, 0.007], [0, 0.62, f * 0.112, 0.06, 0.006]], 5));
  up('c1', tube([[0, 0.84, -0.1, 0.045, 0.02], [0, 0.765, -0.03, 0.04, 0.022], [0, 0.765, 0.03, 0.04, 0.022], [0, 0.84, 0.1, 0.045, 0.02]], 6));
}
function kilt(a, up, legs, seed) {
  if (legs === 'stand' || legs === 'brace') skirt(a, 'c1', 'stand', { hem: 0.53, top: 1.0, flare: 0.7, seed });
  else if (legs === 'kneel') up('c1', folded([[0.001, 0.545], [0.19, 0.54], [0.196, 0.555], [0.19, 0.7], [0.162, 0.92], [0.15, 1.0], [0.001, 1.01]], 16, 9, 0.04, seed).scale(1, 1, 0.86));
  else { legTubes(a, 'c1', legs, { to: 3, thick: 1.28 }); up('c1', slathe([[0.2, 0.66], [0.16, 0.86], [0.15, 1.0], [0.001, 1.01]], 14).scale(1, 1, 0.82)); }
  // the pleated front panel: the tucked end of the wrap, flaring to the hem (standing and kneeling)
  if (legs === 'stand' || legs === 'kneel') { const g = tube([[0.02, 0.97, -0.124, 0.03, 0.006], [0.03, 0.8, -0.15, 0.06, 0.006], [0.035, 0.575, -0.168, 0.085, 0.005]], 5); if (legs === 'stand') a('c1', g); else up('c1', g); }
}
function sheath(a, up, legs, seed) {
  const k = 1.065, top = 1.255;
  // the bodice over the torso, from under the breast to the hips
  const body = TORSO.filter(([, y]) => y < top).map(([r, y]) => [r * k, y]);
  if (legs === 'stand') a('c1', slathe([[0.001, 0.065], [0.185, 0.06], [0.192, 0.1], [0.19, 0.4], [0.178, 0.7], ...body, [0.17 * k, top], [0.162, top + 0.004]], 16, torsoMod(1)));
  else {
    if (legs === 'kneel' || legs === 'cross') pool(a, up, legs, seed); else skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: 0.06, seed });
    up('c1', slathe([[0.17, 0.8], ...body, [0.17 * k, top], [0.162, top + 0.004]], 16, torsoMod(1)));
  }
  // the two straps over the shoulders, front to back, lying on the skin
  for (const sx of [-1, 1]) {
    const ys = [1.235, 1.29, 1.34, 1.38], x = sx * 0.085;
    const pts = [...ys.map((y) => onTorso(x, y, true)), [sx * 0.098, 1.416, 0], ...ys.slice().reverse().map((y) => onTorso(x, y, false))];
    up('c1', tube(pts.map((p) => [...p, 0.017, 0.005]), 4, { capA: false, capB: false }));
  }
}
/** The broad collar (Egypt's wesekh) of beads on the shoulders: a disc round the neck to the shoulder points. */
function wesekh(up) {
  up('c2', slathe([[0.162, 1.335], [0.186, 1.343], [0.148, 1.393], [0.1, 1.424], [0.066, 1.444], [0.052, 1.451]], 16, torsoMod(1)));
}
/** A small child held on the left hip, astride it, facing its mother's side: skin, its shirt (c2), its hair. */
function child(add) {
  const ox = -0.3, b = [ox, 1.0, -0.04];
  add('c2', tube([[...b, 0.065, 0.06], [ox - 0.01, 1.12, -0.05, 0.072, 0.064], [ox - 0.02, 1.22, -0.055, 0.065, 0.055], [ox - 0.02, 1.26, -0.055, 0.04]], 8));
  add('skin', tube([[ox - 0.02, 1.25, -0.055, 0.028], [ox - 0.025, 1.3, -0.06, 0.03]], 6, { capA: false, capB: false }));
  const h = ball(0.068, 10, 7); h.scale(0.95, 1.05, 1); h.translate(ox - 0.025, 1.29, -0.065); add('skin', h);
  const hr = ball(0.072, 10, 6); hr.scale(1, 0.75, 1.02); hr.translate(ox - 0.03, 1.335, -0.06); add('hair', hr);
  // the legs astride the hip, one before, one behind; the arms, one round the mother, one in its lap
  add('skin', tube([[ox + 0.02, 1.0, -0.08, 0.04], [0.02 + ox + 0.08, 0.98, -0.16, 0.036], [ox + 0.13, 0.86, -0.17, 0.03], [ox + 0.14, 0.8, -0.18, 0.026]], 6));
  add('skin', tube([[ox + 0.02, 1.0, 0.0, 0.04], [ox + 0.1, 0.98, 0.09, 0.036], [ox + 0.13, 0.86, 0.11, 0.03], [ox + 0.14, 0.8, 0.12, 0.026]], 6));
  add('skin', tube([[ox + 0.03, 1.2, -0.05, 0.026], [ox + 0.12, 1.25, -0.08, 0.022], [ox + 0.2, 1.3, -0.07, 0.018]], 5));
  add('skin', tube([[ox - 0.07, 1.2, -0.06, 0.026], [ox - 0.06, 1.08, -0.12, 0.022], [ox - 0.02, 1.04, -0.15, 0.018]], 5));
}
/**
 * The things held in the hands of the new poses, built where the posed hands are (M the pose's
 * matrix): the staff, upright from the ground through the right hand; the rope hauled on, from the
 * load ahead through both hands and trailing behind; two oars from the hands out over the sides; the
 * punting pole through both hands down into the water beside.
 */
function heldThing(a, carry, armPose, M, legs, len) {
  const hp = (s, k = 0.07) => { const [, , W, d] = arms(armPose, s), n = norm(d); return new Vector3(...va(W, n, k)).applyMatrix4(M).toArray(); };
  if (carry === 'staff') {
    const h = hp(1, 0.06), top = h[1] + 0.55 * (len ?? 1), z = h[2] - 0.012;
    a('timber', tube([[h[0], 0.0, z + 0.03, 0.016], [h[0], h[1], z, 0.018], [h[0], top, z - 0.01, 0.019]], 6));
  } else if (carry === 'rope') {
    const r = hp(1, 0.06), l = hp(-1, 0.06), L = len ?? 3.5, d = [0, 0, -1];
    const far = [r[0] + d[0] * L, Math.max(0.3, r[1] - 0.12 * L), r[2] + d[2] * L];
    a('rope', tube([[...far, 0.022], [...r, 0.022], [...l, 0.022], [l[0] - 0.03, l[1] - 0.25, l[2] + 0.18, 0.021], [l[0] - 0.05, 0.03, l[2] + 0.45, 0.02], [l[0] - 0.06, 0.02, l[2] + 0.75, 0.018]], 6));
  } else if (carry === 'oars') {
    for (const s of [-1, 1]) {
      const h = hp(s, 0.03), L = len ?? 2.6, o = [h[0] + s * L * 0.55, h[1] - 0.85, h[2] + 0.15], e = [h[0] + s * L, h[1] - 1.3, h[2] + 0.25];
      a('timber', tube([[h[0] - s * 0.1, h[1], h[2], 0.018], [...h, 0.02], [...o, 0.024], [...e, 0.022]], 6));
      a('timber', tube([[...va(o, va(e, o, -1), 0.5), 0.07, 0.012], [...e, 0.075, 0.01], [...va(e, norm(va(e, o, -1)), 0.06), 0.06, 0.008]], 6));
    }
  } else if (carry === 'punt') {
    const lo = hp(1, 0.04), hi = hp(-1, 0.04), d = norm(va(lo, hi, -1)), L = len ?? 4.5;
    a('bamboo_culm', tube([[...va(lo, d, 2.6), 0.022], [...lo, 0.025], [...hi, 0.025], [...va(hi, d, -(L - 2.6 - 0.55)), 0.022]], 6));
  }
}

// ---- hair and hats -----------------------------------------------------------------------------------
/** The face's dark parts (eyes, brows, mouth) and the beard. */
function faceOf(add, beard) {
  eyes(add);
  if (beard) {
    add('hair', tube([[-0.074, 1.54, -0.01, 0.012], [-0.062, 1.49, -0.052, 0.02], [0, 1.452, -0.088, 0.026, 0.024], [0.062, 1.49, -0.052, 0.02], [0.074, 1.54, -0.01, 0.012]], 7));
    add('hair', tube([[-0.03, 1.515, -0.095, 0.006], [0, 1.52, -0.105, 0.009], [0.03, 1.515, -0.095, 0.006]], 5));
  }
}
/** hair: { style: 'short' | 'long' | 'bun' | 'shaven' | 'under' (beneath a hat) } */
function hairOf(add, style) {
  if (style === 'short' || style === 'long' || style === 'bun' || style === 'under') {
    const fx = ell(0.88, 1.0), low = style === 'under' ? 1.54 : 1.5;
    add('hair', slathe([[0.075, low], [0.086, 1.54], [0.093, 1.585], [0.091, 1.618], [0.08, 1.645], [0.056, 1.665], [0.028, 1.674], [0.001, 1.676]], 12,
      (th, i, r, y) => fx(th) * 1.08 * (FRONT(th) && y < 1.612 ? (Math.abs(Math.cos(th)) < 0.55 ? 0.62 : 0.86) : 1)).translate(0, 0, -0.004));
  }
  if (style === 'wig') {                              // Egypt's bobbed wig: full over the ears to the jaw, the face open
    const fx = ell(0.9, 1.0);
    add('hair', slathe([[0.104, 1.44], [0.112, 1.47], [0.115, 1.53], [0.108, 1.6], [0.094, 1.645], [0.07, 1.676], [0.036, 1.69], [0.001, 1.693]], 14,
      (th, i, r, y) => fx(th) * 1.06 * (FRONT(th) && Math.abs(Math.cos(th)) < 0.6 ? (y < 1.535 ? 0.32 : y < 1.615 ? 0.66 : 0.9) : 1)).translate(0, 0, 0.004));
  }
  if (style === 'long') add('hair', tube([[0, 1.6, 0.075, 0.075, 0.03], [0, 1.47, 0.1, 0.085, 0.028], [0, 1.3, 0.1, 0.075, 0.022], [0, 1.24, 0.095, 0.05, 0.015]], 8));
  if (style === 'bun') { const b = ball(0.05, 9, 6); b.scale(1, 0.85, 0.9); b.translate(0, 1.565, 0.098); add('hair', b); }
}
function hatOf(add, hat) {
  if (hat === 'cap') {                                // a soft cap, a little full at the back
    add('hat', slathe([[0.097, 1.56], [0.1, 1.6], [0.094, 1.64], [0.075, 1.67], [0.04, 1.688], [0.001, 1.692]], 14, ell(0.9, 1.05)).translate(0, 0, 0.004));
    add('hat', slathe([[0.1, 1.555], [0.103, 1.56], [0.103, 1.585], [0.098, 1.59], [0.001, 1.59]], 14, ell(0.9, 1.05)).translate(0, 0, 0.004));
  } else if (hat === 'turban') {                      // the cloth wound round: a coil of turns rising
    const pts = [];
    for (let k = 0; k <= 30; k++) { const t = k / 30, a = t * Math.PI * 2 * 2.6, r = 0.098 + 0.012 * Math.sin(t * Math.PI) - t * 0.03; pts.push([Math.cos(a) * r * 0.92, 1.57 + t * 0.085, Math.sin(a) * r * 1.02, 0.026, 0.024]); }
    add('hat', tube(pts, 6));
    add('hat', slathe([[0.075, 1.6], [0.07, 1.65], [0.04, 1.68], [0.001, 1.685]], 12));
  } else if (hat === 'straw') {                       // the conical straw hat, its rim turned down a little
    add('hat', slathe([[0.31, 1.618], [0.315, 1.625], [0.29, 1.636], [0.16, 1.7], [0.06, 1.77], [0.012, 1.8], [0.001, 1.802], [0.001, 1.79], [0.05, 1.755], [0.15, 1.69], [0.28, 1.628], [0.31, 1.618]], 18));
    add('hat', slathe([[0.096, 1.585], [0.1, 1.62], [0.001, 1.64]], 12));
  } else if (hat === 'brim') {                        // a felt hat: a crown with a dent, a broad brim
    add('hat', slathe([[0.2, 1.61], [0.205, 1.618], [0.12, 1.628], [0.105, 1.64], [0.1, 1.72], [0.085, 1.745], [0.05, 1.738], [0.001, 1.732], [0.001, 1.722], [0.09, 1.705], [0.09, 1.632], [0.12, 1.616], [0.198, 1.604], [0.2, 1.61]], 18, ell(0.92, 1.05)));
  }
}
/** A veil with its opening at the face: rows of the cover pulled in toward the skull where the face is. */
function veil(add) {
  const fx = ell(0.92, 1.0), prof = [[0.27, 1.17], [0.24, 1.26], [0.19, 1.35], [0.135, 1.43], [0.108, 1.5], [0.103, 1.56], [0.106, 1.61], [0.096, 1.65], [0.062, 1.682], [0.001, 1.692]];
  add('hat', slathe(prof, 18, (th, i, r, y) => {
    const c = Math.abs(Math.cos(th));
    let k = fx(th) * (FRONT(th) ? 1.02 : 1.08);
    if (FRONT(th) && c < 0.55 && y > 1.4 && y < 1.63) k *= 0.55;                           // round the face: in behind it
    if (y < 1.4) k *= 1 + 0.06 * Math.cos(th * 7);                                         // folds over the shoulders
    return k;
  }).scale(1, 1, 0.9));
}

// ---- the figure ----------------------------------------------------------------------------------------
/**
 * figure: { dress ('robe' | 'tunic' | 'trousers' | 'wrap' | 'loincloth' | 'shendyt' | 'sheath'), top ('bare': no
 * garment above the waist — the default of the loincloth and the shendyt; with a wrap or trousers too), cloth, cloth2,
 * skin, hat ('none' | 'cap' | 'turban' | 'straw' | 'veil' | 'brim'), hatMat, h (height), carry ('none' | 'pot' | 'basket' |
 * 'pole' | 'hoe' | 'staff' | 'rope' | 'child' | 'oars' | 'punt'), len (of the staff, rope, oars or pole), pose ('stand' |
 * 'talk' | 'sit' | 'squat' | 'kneel' | 'cross' (seated cross-legged) | 'pray' | 'pull' (hauling a rope) | 'staff' |
 * 'row' (seated at the oars) | 'punt' (standing, poling)), staffMat, poleMat (of the staff or oars, of the punting pole), arms (an arm pose of its own, e.g. 'pray' with pose 'kneel'),
 * hair ('short' | 'long' | 'bun' | 'shaven' | 'wig'), hairMat, beard, over ('sash' | 'collar' | 'cape' | 'apron' | 'belt' |
 * 'shawl' | 'wesekh' (the broad collar) | 'none'), legs ('hose' | 'bare'), feet ('bare' | 'shod') } — a still figure, facing −z.
 * The poses, dresses and things held beyond the first ones are opt-in: a figure without them is as it was.
 */
const LEGS_OF = { sit: 'sit', squat: 'squat', row: 'sit', kneel: 'kneel', cross: 'cross', pull: 'brace' };
const HELD = { staff: 'staff', rope: 'pull', oars: 'row', punt: 'punt', child: 'child' };
const POSE_HELD = { staff: 'staff', pull: 'rope', punt: 'punt' };
export function figure(el, { bag, col }) {
  const r0 = rng(el.seed), H = el.h ?? 1.56 + r0() * 0.2, girth = 0.92 + r0() * 0.18;
  const put = placer(el, bag, H / HB, [girth, 1, 0.94 + (girth - 0.92) * 0.6]);
  const c1 = el.cloth ?? 'cloth_white', c2 = el.cloth2 ?? c1, sk = el.skin ?? 'skin_medium', dress = el.dress ?? 'robe';
  const pose = el.pose ?? 'stand', carry = el.carry && el.carry !== 'none' ? el.carry : POSE_HELD[pose] ?? 'none', hat = el.hat ?? 'none';
  const legs = LEGS_OF[pose] ?? 'stand';
  const armPose = el.arms ?? (carry === 'pot' || carry === 'basket' ? 'head' : carry === 'pole' ? 'pole' : carry === 'hoe' ? 'hoe' : HELD[carry] ? HELD[carry]
    : legs === 'sit' || legs === 'squat' ? legs : legs === 'cross' ? (pose === 'pray' ? 'pray' : 'cross') : ['pray', 'pull', 'staff', 'row', 'punt'].includes(pose) ? pose
      : pose === 'talk' ? 'talk' : (r0() < 0.3 ? 'clasp' : 'hang'));
  const veiled = hat === 'veil';
  const style = veiled ? 'none' : hat === 'turban' ? 'under' : hat !== 'none' ? 'under' : el.hair ?? ['short', 'short', 'long', 'bun', 'short'][Math.floor(r0() * 5)];
  const beard = el.beard ?? (!veiled && style !== 'long' && style !== 'bun' && r0() < 0.35);
  const lower = dress === 'loincloth' || dress === 'shendyt' || dress === 'sheath';             // the dresses of the lower body alone
  const bare = lower || ((el.top ?? (dress === 'loincloth' || dress === 'shendyt' ? 'bare' : '')) === 'bare' && (dress === 'wrap' || dress === 'trousers'));
  const over = el.over ?? (dress === 'robe' ? ['sash', 'none', 'collar'][Math.floor(r0() * 3)] : dress === 'wrap' ? (bare ? 'none' : 'shawl') : dress === 'tunic' || dress === 'shendyt' ? 'belt' : 'none');
  const bareLegs = dress === 'tunic' ? (el.legs ?? 'bare') === 'bare' : dress === 'wrap' || dress === 'loincloth' || dress === 'shendyt';
  const shod = (el.feet ?? (dress === 'wrap' || lower ? 'bare' : 'shod')) !== 'bare';
  const shade = () => 0.86 + r0() * 0.22, cs = shade(), cs2 = shade(), ss = 0.9 + r0() * 0.16;
  const hairMat = el.hairMat ?? 'hide_black', hairShade = el.hairShade ?? (hairMat === 'hide_black' ? 0.7 : 1);
  const M = upperM(legs);

  // the skin: the head (with its neck), the hands (and bare forearms, or the bare arms and chest), any bare legs
  // and feet — each keyed only by what shapes it, so that few shapes serve every figure
  const up = (a) => (role, g) => a(role, g.applyMatrix4(M));
  put(sk, assembly(`fig-head|${legs}`, (a) => head(up(a))).skin.clone(), ss);
  put(sk, assembly(`fig-hands|${armPose}|${legs}|${bare ? 'B' : dress === 'wrap' ? 'w' : ''}`, (a) => {
    hands(up(a), armPose);
    if (bare) { bareArms(up(a), armPose); torso(up(a), 'skin', 0.97); } else if (dress === 'wrap') forearms(up(a), armPose);
  }).skin.clone(), ss);
  const legFrom = (dress === 'wrap' && legs === 'stand') ? 2 : 0;
  if (bareLegs || !shod) put(sk, assembly(`fig-legs|${legs}|${bareLegs ? (legFrom ? 'l' : 'L') : ''}|${shod ? '' : 'F'}`, (a) => {
    if (bareLegs) legTubes(a, 'skin', legs, { from: legFrom });
    if (!shod) feet(a, 'skin', legs);
  }).skin.clone(), ss);
  // the garment: the body with its sleeves (none on a bare chest); the skirts, the loincloth, the kilt, the sheath
  if (!bare) put(c1, assembly(`fig-body|${dress === 'trousers' ? 't' : dress === 'robe' ? 'r' : dress === 'wrap' ? 'w' : 'c'}|${armPose}|${legs}`, (a) => {
    torso(up(a), 'c1', dress === 'trousers' ? 1.06 : 1);
    sleeves(up(a), 'c1', armPose, { loose: dress === 'robe' ? 1 : 0, short: dress === 'wrap' });
  }).c1.clone(), cs);
  put(c1, assembly(`fig-skirt|${dress}|${legs}`, (a) => {
    if (dress === 'loincloth') loinCloth(a, up(a), legs, 3);
    else if (dress === 'shendyt') kilt(a, up(a), legs, 4);
    else if (dress === 'sheath') sheath(a, up(a), legs, 6);
    // kneeling or cross-legged, a robe or a wrap lies pooled round the legs
    else if ((legs === 'kneel' || legs === 'cross') && (dress === 'robe' || dress === 'wrap')) pool(a, up(a), legs, dress === 'robe' ? 5 : 7, dress === 'robe');
    else if (dress === 'robe') skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: 0.03, seed: 5 });
    else if (dress === 'wrap') skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: legs === 'stand' || legs === 'brace' ? 0.22 : 0.2, seed: 7, flare: 0.6 });
    else if (dress === 'tunic') { if (legs === 'stand' || legs === 'brace') skirt(a, 'c1', 'stand', { hem: 0.5, flare: 1.4, seed: 9 }); else up(a)('c1', slathe([[0.2, 0.62], [0.16, 0.86], [0.001, 0.87]], 14).scale(1, 1, 0.8)); }
    else { if (legs === 'stand' || legs === 'brace') a('c1', folded([[0.2, 0.7], [0.19, 0.8], [0.165, 0.92], [0.001, 0.93]], 14, 5, 0.04, 11).scale(1, 1, 0.78)); else up(a)('c1', slathe([[0.19, 0.74], [0.165, 0.9], [0.001, 0.91]], 14).scale(1, 1, 0.8)); }
  }).c1.clone(), cs);
  // the second cloth: trousers or hose, the sash, collar, cape, shawl, belt or broad collar
  const C = assembly(`fig-c2|${dress}|${over}|${legs}|${bareLegs ? 'L' : ''}`, (a) => {
    const up = (role, g) => a(role, g.applyMatrix4(M));
    if (dress === 'trousers' || (dress === 'tunic' && !bareLegs)) legTubes(a, 'c2', legs);
    if (over === 'sash' || over === 'belt') up('c2', tube(Array.from({ length: 15 }, (_, k) => { const t = k / 14 * Math.PI * 2; return [Math.cos(t) * 0.152, 1.0, Math.sin(t) * 0.152 * 0.68, 0.03, over === 'belt' ? 0.018 : 0.032]; }), 5, { capA: false, capB: false }));
    if (over === 'sash' && legs === 'stand') a('c2', tube([[0.06, 0.99, -0.108, 0.035, 0.008], [0.07, 0.8, -0.13, 0.04, 0.007], [0.075, 0.64, -0.14, 0.035, 0.006]], 5));
    if (over === 'collar') for (const s of [-1, 1]) up('c2', tube([[s * 0.06, 1.43, 0.02, 0.022, 0.01], [s * 0.075, 1.4, -0.07, 0.024, 0.01], [-s * 0.02, 1.25, -0.125, 0.026, 0.012], [-s * 0.07, 1.05, -0.105, 0.024, 0.01]], 5));
    if (over === 'cape') up('c2', folded([[0.26, 1.02], [0.24, 1.15], [0.215, 1.3], [0.185, 1.36], [0.1, 1.42], [0.06, 1.445], [0.001, 1.446]], 16, 7, 0.06, 13).scale(1, 1, 0.78));
    if (over === 'shawl') up('c2', tube([[-0.16, 1.4, 0.0, 0.07, 0.02], [-0.05, 1.3, -0.12, 0.08, 0.02], [0.1, 1.08, -0.115, 0.075, 0.018], [0.16, 0.96, -0.02, 0.06, 0.018], [0.08, 1.12, 0.115, 0.075, 0.018], [-0.08, 1.32, 0.1, 0.075, 0.02], [-0.16, 1.4, 0.0, 0.07, 0.02]], 6, { capA: false, capB: false }));
    if (over === 'wesekh') wesekh(up);
  });
  if (C.c2) put(c2, C.c2.clone(), cs2);
  // the hair (eyes, brows, beard) and the hat
  put(hairMat, assembly(`fig-face|${legs}|${beard ? 'b' : ''}`, (a) => faceOf(up(a), beard)).hair.clone(), hairShade);
  if (style !== 'shaven' && style !== 'none') put(hairMat, assembly(`fig-hair|${style}|${legs}`, (a) => hairOf(up(a), style)).hair.clone(), hairShade);
  if (hat !== 'none') {
    const T = assembly(`fig-hat|${hat}|${legs}`, (a) => { const up = (role, g) => a(role, g.applyMatrix4(M)); if (hat === 'veil') veil(up); else hatOf(up, hat); });
    const hm = el.hatMat ?? (hat === 'straw' ? 'thatch' : hat === 'turban' ? 'cloth_white' : hat === 'brim' ? 'cloth_black' : hat === 'veil' ? c1 : c2);
    put(hm, T.hat.clone(), hat === 'veil' ? cs : 1);
  }
  if (shod) { const F = assembly(`fig-feet|${legs}`, (a) => feet(a, 'shoe', legs)); put('cloth_brown', F.shoe.clone()); }
  // what is carried: on the head or the shoulder; held in the hands of the pose; a child on the hip
  if (carry === 'child') {
    const K = assembly(`fig-child|${legs}`, (a) => child(up(a)));
    put(sk, K.skin.clone(), ss * 1.03); put(el.childCloth ?? c2, K.c2.clone(), cs2); put(hairMat, K.hair.clone(), hairShade);
  } else if (carry === 'staff' || carry === 'rope' || carry === 'oars' || carry === 'punt') {
    const K = assembly(`fig-held|${carry}|${armPose}|${legs}|${el.len ?? ''}`, (a) => heldThing(a, carry, armPose, M, legs, el.len));
    for (const [role, g] of Object.entries(K)) put(role === 'timber' ? el.staffMat ?? 'timber' : role === 'bamboo_culm' ? el.poleMat ?? 'bamboo_culm' : role === 'rope' ? 'cloth_brown' : role, g.clone(), role === 'rope' ? 0.85 : 1);
  } else if (carry !== 'none') {
    const K = assembly(`fig-carry|${carry}`, (a) => carried(a, carry));
    for (const [role, g] of Object.entries(K)) put(role, g.clone());
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 0.25, y, y + H * (legs === 'kneel' ? 0.78 : legs === 'cross' ? 0.55 : 1));
}
/** The things carried: a water pot or a basket on the head, the carrying pole with its two baskets, the hoe. */
function carried(a, carry) {
  if (carry === 'pot') {
    a('terracotta', slathe([[0.001, 1.7], [0.06, 1.702], [0.13, 1.74], [0.165, 1.8], [0.15, 1.87], [0.09, 1.915], [0.06, 1.94], [0.075, 1.965], [0.065, 1.97], [0.05, 1.95], [0.001, 1.95]], 14));
    a('cloth_white', slathe([[0.05, 1.682], [0.075, 1.69], [0.07, 1.705], [0.045, 1.7]], 10));                              // the pad
  } else if (carry === 'basket') {
    a('wicker', slathe([[0.001, 1.69], [0.15, 1.69], [0.24, 1.86], [0.225, 1.865], [0.14, 1.715], [0.001, 1.715]], 14));
    a('cloth_ochre', slathe([[0.22, 1.85], [0.15, 1.9], [0.06, 1.925], [0.001, 1.93]], 12));
  } else if (carry === 'pole') {
    // the pole on the right shoulder, front and back; a basket hanging from each end on three cords
    a('bamboo_culm', tube([[0.15, 1.33, -0.95, 0.02], [0.15, 1.455, 0, 0.024], [0.15, 1.33, 0.95, 0.02]], 6));
    for (const zz of [-0.88, 0.88]) {
      const top = [0.15, 1.35, zz];
      for (let k = 0; k < 3; k++) { const b = k / 3 * Math.PI * 2; a('timber', tube([[...top, 0.005], [0.15 + Math.cos(b) * 0.17, 0.62, zz + Math.sin(b) * 0.17, 0.005]], 3)); }
      a('wicker', slathe([[0.001, 0.3], [0.14, 0.3], [0.2, 0.42], [0.21, 0.6], [0.195, 0.61], [0.185, 0.43], [0.13, 0.33], [0.001, 0.33]], 12).translate(0.15, 0, zz));
      a('cloth_green', slathe([[0.19, 0.56], [0.12, 0.64], [0.001, 0.67]], 10).translate(0.15, 0, zz));
    }
  } else if (carry === 'hoe') {
    a('timber', tube([[0.11, 1.12, -0.2, 0.017], [0.08, 0.13, -0.95, 0.017]], 6));
    a('iron', tube([[0.08, 0.16, -0.97, 0.012], [0.08, 0.05, -1.02, 0.01]], 5));
    a('iron', box(0.0, 0.0, -1.055, 0.16, 0.1, -1.04));
  }
}
