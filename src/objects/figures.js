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
  // seated low (opt-in poses: 'sit' is at the height of a chair or a bench, its seat 0.46 m up)
  low: { drop: 0.58, lean: -0.12 },              // on a step or a low stool (seat ~0.22 m), the knees up, the feet flat before it
  ground: { drop: 0.75, lean: -0.04 },           // on the ground or a floor, the legs out before, a little bent, the heels down
  seiza: { drop: 0.61, lean: 0 },                // kneeling sat back on the heels, the shins along the ground beneath
  // the dances (opt-in): the apsara's deep bend of the knees turned out, one foot lifted behind (plieR: the right);
  // a folk dancer's step, the right foot lifted forward a little; astride (riding), the legs spread round a neck or a back
  plieR: { drop: 0.12, lean: 0.04 }, plieL: { drop: 0.12, lean: 0.04 },
  step: { drop: 0.03, lean: 0.03 },
  astride: { drop: 0, lean: 0 },
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
    case 'knees': return [S, [s * 0.21, 1.15, -0.1], [s * 0.12, 1.12, -0.34], [0, -0.5, -0.85]];                              // the forearms over the raised knees
    case 'thighs': return [S, [s * 0.21, 1.12, 0.02], [s * 0.14, 1.02, -0.22], [0, -0.35, -0.94]];                            // the hands on the outstretched thighs
    case 'lap': return [S, [s * 0.2, 1.1, -0.02], [s * 0.13, 0.89, -0.22], [0, -0.3, -0.95]];                                 // the hands on the thighs, sat on the heels
    case 'hoe': return s > 0 ? [S, [0.22, 1.1, -0.12], [0.08, 1.07, -0.33], [-0.4, -0.1, -0.9]] : [S, [-0.2, 1.06, -0.1], [-0.02, 0.88, -0.42], [0.4, -0.2, -0.9]];
    // the dances (opt-in). The Khmer apsara of the reliefs: the right arm raised, the elbow out, the hand above the
    // shoulder with its fingers bent back; the left lowered and out to the side at the hip, the palm up, the fingers
    // curled back too (the fifth entry: the way the fingers bend back). 'apsara2' is its mirror.
    case 'apsara': return s > 0 ? [S, [0.37, 1.41, -0.03], [0.38, 1.64, -0.08], [0.12, 1, -0.15], [1, 0, 0.3]] : [S, [-0.34, 1.17, -0.01], [-0.46, 1.16, -0.21], [-0.35, 0.15, -0.92], [0, 1, 0]];
    case 'apsara2': { const q = arms('apsara', -s); return q.map((v) => [-v[0], v[1], v[2]]); }
    // a folk dance: the right arm up over the head, curved; the left hand on the hip
    case 'folk': return s > 0 ? [S, [0.31, 1.6, 0.0], [0.18, 1.84, -0.03], [-0.65, 0.6, 0]] : [S, [-0.33, 1.13, 0.06], [-0.2, 0.99, -0.04], [0.45, -0.3, -0.6]];
    // the musicians, seated: both hands on the heads of a drum across the lap; at an end-blown flute held down
    // before the face; plucking a harp upright on the lap; a lute across the chest, the left hand on its neck
    case 'drum': return [S, [s * 0.24, 1.1, -0.03], [s * 0.3, 1.1, -0.2], [-s * 0.45, -0.3, -0.8]];
    case 'flute': return s > 0 ? [S, [0.2, 1.1, -0.14], [0.075, 1.25, -0.29], [-0.85, -0.1, -0.5]] : [S, [-0.2, 1.14, -0.12], [-0.075, 1.375, -0.19], [0.85, -0.1, -0.5]];
    case 'harp': return s > 0 ? [S, [0.24, 1.12, -0.06], [0.1, 1.24, -0.22], [-0.55, 0, -0.8]] : [S, [-0.24, 1.14, -0.1], [-0.1, 1.3, -0.3], [0.55, 0, -0.8]];
    case 'lute': return s > 0 ? [S, [0.26, 1.12, 0.0], [0.2, 1.08, -0.2], [-0.5, 0, -0.85]] : [S, [-0.32, 1.12, -0.04], [-0.26, 1.28, -0.14], [0.2, 0.5, -0.8]];
    // riding astride (a mahout on an elephant's neck): the right hand forward holding the goad, the left on the thigh
    case 'ride': return s > 0 ? [S, [0.24, 1.12, -0.08], [0.2, 1.1, -0.32], [0, 0.2, -1]] : [S, [-0.25, 1.1, 0.0], [-0.27, 0.88, -0.12], [-0.35, -0.3, -0.85]];
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
function hands(add, pose) { for (const s of [-1, 1]) { const [, , W, d, bk] = arms(pose, s); if (bk) danceHand(add, W, d, bk, s); else hand(add, W, d, s); } }
/**
 * A dancer's hand (the Khmer kbach): the palm along d, the fingers together and bent far back (toward bk),
 * the thumb drawn in toward the index finger. Skin.
 */
function danceHand(add, W, d, bk, s) {
  d = norm(d);
  const kk = bk[0] * d[0] + bk[1] * d[1] + bk[2] * d[2], b = norm(va(bk, d, -kk));                // bk made square to d
  const P0 = va(W, d, 0.08), P1 = va(va(P0, d, 0.028), b, 0.012), P2 = va(va(P1, d, 0.016), b, 0.026), P3 = va(va(P2, d, 0.002), b, 0.026);
  add('skin', tube([[...W, 0.03, 0.026], [...va(W, d, 0.04), 0.037, 0.016], [...P0, 0.036, 0.013], [...P1, 0.032, 0.011], [...P2, 0.026, 0.009], [...P3, 0.014, 0.007]], 6));
  const side = norm([d[1] * b[2] - d[2] * b[1], d[2] * b[0] - d[0] * b[2], d[0] * b[1] - d[1] * b[0]]);
  const T0 = va(va(W, d, 0.03), side, -s * 0.026), T1 = va(va(T0, d, 0.045), side, s * 0.008);
  add('skin', tube([[...T0, 0.012], [...T1, 0.009], [...va(va(T1, d, 0.012), side, s * 0.008), 0.006]], 5));
}

/** The legs (role: trousers, hose or skin), by the pose of the legs. */
function legsOf(legs, s) {
  if (legs === 'sit') return [[s * 0.09, 0.57, 0.0], [s * 0.105, 0.56, -0.42], [s * 0.1, 0.1, -0.44]];
  if (legs === 'squat') return [[s * 0.1, 0.33, 0.03], [s * 0.15, 0.55, -0.28], [s * 0.11, 0.1, -0.15]];
  if (legs === 'kneel') return [[s * 0.09, 0.52, 0.0], [s * 0.1, 0.075, -0.05], [s * 0.095, 0.07, 0.36]];
  if (legs === 'cross') return [[s * 0.1, 0.15, 0.02], [s * 0.34, 0.12, -0.22], [-s * 0.07, s > 0 ? 0.135 : 0.075, -0.3]];
  if (legs === 'low') return [[s * 0.09, 0.3, 0.0], [s * 0.1, 0.47, -0.38], [s * 0.095, 0.1, -0.36]];
  if (legs === 'ground') return [[s * 0.09, 0.13, 0.0], [s * 0.1, 0.2, -0.4], [s * 0.09, 0.09, -0.77]];
  if (legs === 'seiza') return [[s * 0.09, 0.27, 0.0], [s * 0.1, 0.08, -0.38], [s * 0.095, 0.07, 0.0]];
  if (legs === 'plieR' || legs === 'plieL') {
    // the supporting leg bent, the knee turned out over the turned-out foot; the other knee out and forward, its
    // shin back and level, the foot lifted behind (the Khmer apsara)
    const up = (legs === 'plieR') === (s > 0);
    return up ? [[s * 0.09, 0.74, 0.0], [s * 0.24, 0.45, -0.12], [s * 0.2, 0.44, 0.22]] : [[s * 0.09, 0.74, 0.0], [s * 0.21, 0.42, -0.12], [s * 0.12, 0.1, 0.0]];
  }
  if (legs === 'step') return s > 0 ? [[0.088, 0.83, 0.0], [0.1, 0.49, -0.15], [0.096, 0.17, -0.09]] : [[-0.088, 0.83, 0.0], [-0.094, 0.46, 0.01], [-0.09, 0.1, 0.03]];
  if (legs === 'astride') return [[s * 0.1, 0.86, 0.0], [s * 0.42, 0.68, -0.14], [s * 0.5, 0.36, 0.04]];
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
    const [, , A] = legsOf(legs, s), z = legs === 'sit' || legs === 'squat' || legs === 'brace' || legs === 'low' ? A[2] : 0.0;
    // kneeling: the feet lie behind, toes and instep on the ground; cross-legged: each foot under the other knee
    // legs out on the ground: the foot up from the heel, the toes turned a little out
    if (legs === 'ground') { add(role, tube([[A[0], 0.07, A[2] + 0.045, 0.035, 0.035], [A[0], 0.09, A[2] - 0.015, 0.045, 0.04], [A[0] + s * 0.012, 0.165, A[2] - 0.06, 0.044, 0.03], [A[0] + s * 0.02, 0.215, A[2] - 0.075, 0.03, 0.022]], 7)); continue; }
    if (legs === 'kneel' || legs === 'seiza') { add(role, tube([[A[0], 0.075, A[2] - 0.04, 0.038, 0.035], [A[0], 0.055, A[2] + 0.06, 0.044, 0.032], [A[0] + s * 0.004, 0.035, A[2] + 0.15, 0.04, 0.022], [A[0] + s * 0.006, 0.028, A[2] + 0.2, 0.028, 0.016]], 7)); continue; }
    if (legs === 'plieR' || legs === 'plieL' || legs === 'step' || legs === 'astride') {
      const up = legs === 'astride' || (legs === 'plieR') === (s > 0) && legs !== 'step', lift = legs === 'step' && s > 0;
      if (legs === 'astride') { add(role, tube([[A[0], A[1] - 0.02, A[2] + 0.05, 0.035, 0.035], [A[0], A[1] - 0.05, A[2] - 0.01, 0.045, 0.04], [A[0] - s * 0.01, A[1] - 0.1, A[2] - 0.1, 0.042, 0.03], [A[0] - s * 0.015, A[1] - 0.12, A[2] - 0.15, 0.028, 0.02]], 7)); continue; }
      // the lifted foot flexed: the sole turned up behind, the toes bent up
      if (up) { add(role, tube([[A[0], A[1] - 0.02, A[2] - 0.02, 0.036, 0.034], [A[0], A[1] - 0.045, A[2] + 0.05, 0.045, 0.034], [A[0] + s * 0.004, A[1] - 0.03, A[2] + 0.13, 0.042, 0.025], [A[0] + s * 0.006, A[1] + 0.01, A[2] + 0.17, 0.03, 0.018]], 7)); continue; }
      // the foot on the ground turned out (the apsara), or lifted a hand's breadth, the toes down (the folk step)
      const o = legs === 'step' ? 0.12 : 0.55, dx = s * Math.sin(o), dz = -Math.cos(o), y0 = lift ? A[1] - 0.06 : 0.045, dy = lift ? -0.02 : 0;
      add(role, tube([[A[0] - dx * 0.06, y0, A[2] - dz * 0.06, 0.035, 0.035], [A[0] + dx * 0.02, y0 - 0.005 + dy * 0.3, A[2] + dz * 0.02, 0.045, 0.04], [A[0] + dx * 0.12, y0 - 0.013 + dy, A[2] + dz * 0.12, 0.044, 0.03], [A[0] + dx * 0.175, y0 - 0.017 + dy * 1.4, A[2] + dz * 0.175, 0.03, 0.022]], 7));
      continue;
    }
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
  const bot = sq ? 0.05 : Math.min(Math.max(Math.min(0.46, hipY - 0.11), hem), hipY - 0.08);       // the seat (0.46 m on a bench), lower seated low
  add(role, folded([[sq ? 0.24 : 0.2, bot], [0.19, hipY - 0.05], [0.16, hipY + 0.05], [0.001, hipY + 0.06]], 14, 6, 0.06, seed).scale(1, 1, 0.8).translate(0, 0, sq ? 0.05 : 0.04));
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
  } else if (legs === 'seiza') {
    // sat on the heels: the cloth spread round the hips on the ground, over the thighs to the knees and the shins beneath
    up('c1', folded([[0.001, 0.622], [0.23, 0.625], [0.25, 0.68], [0.215, 0.8], [0.165, 0.95], [0.155, 1.0], [0.001, 1.01]], 16, 7, 0.05, seed).scale(1, 1, 0.8));
    legTubes(a, 'c1', 'seiza', { to: 3, thick: 1.3 });
    if (long) legTubes(a, 'c1', 'seiza', { from: 2, thick: 1.3 });
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
  else { legTubes(a, 'c1', legs, { to: 3, thick: 1.28 }); up('c1', slathe([[0.2, Math.max(0.66, LEGS[legs].drop + 0.04)], [0.16, 0.86], [0.15, 1.0], [0.001, 1.01]], 14).scale(1, 1, 0.82)); }
  // the pleated front panel: the tucked end of the wrap, flaring to the hem (standing and kneeling)
  if (legs === 'stand' || legs === 'kneel') { const g = tube([[0.02, 0.97, -0.124, 0.03, 0.006], [0.03, 0.8, -0.15, 0.06, 0.006], [0.035, 0.575, -0.168, 0.085, 0.005]], 5); if (legs === 'stand') a('c1', g); else up('c1', g); }
}
/**
 * The Māori kilt of free-hanging strands (the rāpaki; the piupiu of rolled flax is its later form): a
 * plaited waistband and from it rolled flax strands to the knee, swinging a little apart. Standing, the
 * strands hang free; seated, they lie over the thighs.
 */
function strands(a, up, legs, seed) {
  up('c1', slathe([[0.16, 0.93], [0.168, 0.95], [0.168, 0.995], [0.16, 1.01]], 14, (th) => ell(1, 0.7)(th)));
  const n = 34, r = rng(seed);
  if (legs === 'stand' || legs === 'brace') {
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t), j = r(), hem = 0.47 + j * 0.05, fl = 0.2 + j * 0.02;
      const P = (rr, y) => [c * rr, y, sn * rr * 0.74];
      a('c1', tube([[...P(0.163, 0.95), 0.0075], [...P(0.18, 0.8), 0.007], [...P(fl, 0.62), 0.0065], [...P(fl + 0.012, hem), 0.006]], 4, { capA: false }));
    }
  } else {
    legTubes(a, 'c1', legs, { to: 3, thick: 1.3 });
    up('c1', folded([[0.2, Math.max(0.66, LEGS[legs].drop + 0.04)], [0.17, 0.86], [0.16, 0.95], [0.001, 0.96]], 18, 9, 0.03, seed).scale(1, 1, 0.82));
  }
}
function sheath(a, up, legs, seed) {
  const k = 1.065, top = 1.255;
  // the bodice over the torso, from under the breast to the hips
  const body = TORSO.filter(([, y]) => y < top).map(([r, y]) => [r * k, y]);
  if (legs === 'stand') a('c1', slathe([[0.001, 0.065], [0.185, 0.06], [0.192, 0.1], [0.19, 0.4], [0.178, 0.7], ...body, [0.17 * k, top], [0.162, top + 0.004]], 16, torsoMod(1)));
  else {
    if (legs === 'kneel' || legs === 'cross' || legs === 'seiza') pool(a, up, legs, seed); else skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: 0.06, seed });
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

/**
 * The short skirt of a dancer in the apsara's bend (the sampot to mid-thigh, its pleated front fold hanging
 * between the knees), or the long flaring skirt of a robe or a wrap in the folk dancer's step. In the upper body's
 * frame (lowered and leant with it).
 */
function danceSkirt(up, legs, dress, seed) {
  if (legs === 'step') {
    const hem = dress === 'robe' ? 0.15 : dress === 'wrap' ? 0.3 : 0.55, r0 = dress === 'robe' ? 0.34 : dress === 'wrap' ? 0.29 : 0.27;
    up('c1', folded([[0.001, hem + 0.006], [r0 * 0.97, hem], [r0, hem + 0.012], [r0 * 0.96, hem + 0.06], [(r0 + 0.16) / 2 + 0.02, (hem + 0.92) / 2], [0.162, 0.92], [0.15, 1.0], [0.001, 1.01]], 18, 9, 0.08, seed).scale(1, 1, 0.86));
    return;
  }
  up('c1', folded([[0.001, 0.606], [0.205, 0.6], [0.21, 0.614], [0.195, 0.72], [0.163, 0.92], [0.15, 1.0], [0.001, 1.01]], 16, 9, 0.06, seed).scale(1, 1, 0.86));
  up('c1', tube([[0, 0.97, -0.127, 0.03, 0.006], [0, 0.8, -0.153, 0.055, 0.006], [0, 0.6, -0.17, 0.07, 0.005], [0, 0.5, -0.16, 0.06, 0.004]], 5));
}
/**
 * The instruments of the seated musicians, in the upper body's frame (where the posed hands are): a barrel drum
 * across the lap, its two heads laced to each other; an end-blown flute of cane from the lips; an arched harp, its
 * boat-shaped sound box on the lap and its neck curving up from the far end, the strings between them (the Khmer
 * pin of the Angkor reliefs); a lute, its bowl at the right hip and its neck up to the left, the pegbox bent back.
 * Roles: timber, hide (drumheads), lacing, cane, string.
 */
function instrument(a, kind) {
  if (kind === 'drum') {
    const c = [0, 1.04, -0.27], L = 0.46, R = 0.14;
    a('timber', slathe([[0.12, -L / 2], [0.135, -L / 4], [R, 0], [0.135, L / 4], [0.12, L / 2]], 16).rotateZ(Math.PI / 2).translate(...c));
    for (const sx of [-1, 1]) {
      a('hide', slathe([[0.001, 0], [0.122, 0], [0.126, 0.012], [0.001, 0.014]], 16).rotateZ(-sx * Math.PI / 2).translate(c[0] + sx * (L / 2 - 0.004), c[1], c[2]));
      a('lacing', tube(Array.from({ length: 17 }, (_, k) => { const t = k / 16 * Math.PI * 2; return [c[0] + sx * (L / 2 - 0.02), c[1] + Math.cos(t) * 0.127, c[2] + Math.sin(t) * 0.127, 0.008]; }), 4, { capA: false, capB: false }));
    }
    for (let k = 0; k < 10; k++) {                                       // the laces from head to head, zigzag
      const t0 = k / 10 * Math.PI * 2, t1 = (k + 0.5) / 10 * Math.PI * 2, P = (t, x, r) => [c[0] + x, c[1] + Math.cos(t) * r, c[2] + Math.sin(t) * r, 0.004];
      a('lacing', tube([P(t0, -L / 2 + 0.02, 0.127), P((t0 + t1) / 2, -L / 4, 0.14), P(t1, 0, R + 0.004), P((t0 + t1) / 2 + 0.3, L / 4, 0.14), P(t0 + 0.6, L / 2 - 0.02, 0.127)], 3));
    }
  } else if (kind === 'flute') {
    const m = [0, 1.507, -0.098], e = [0, 1.122, -0.438];
    a('cane', tube([[...m, 0.011], [...va(m, va(e, m, -1), 0.5), 0.012], [...e, 0.013]], 7));
    for (let k = 0; k < 6; k++) { const p = va(m, va(e, m, -1), 0.34 + k * 0.08); a('string', tube([[p[0], p[1] + 0.004, p[2] - 0.0115, 0.004], [p[0], p[1] + 0.006, p[2] - 0.0135, 0.0045]], 4)); }   // the finger holes
    a('lacing', tube([[...va(m, va(e, m, -1), 0.2), 0.0125], [...va(m, va(e, m, -1), 0.23), 0.0125]], 7, { capA: false, capB: false }));
  } else if (kind === 'harp') {
    a('timber', tube([[0, 0.985, -0.05, 0.03, 0.02], [0, 0.995, -0.12, 0.07, 0.05], [0, 1.0, -0.26, 0.085, 0.06], [0, 1.0, -0.39, 0.07, 0.05], [0, 1.015, -0.47, 0.035, 0.03]], 10));
    a('hide', tube([[0, 1.03, -0.1, 0.045, 0.006], [0, 1.045, -0.26, 0.062, 0.006], [0, 1.045, -0.4, 0.04, 0.006]], 8));    // the soundboard
    const N = [[0, 1.02, -0.47], [0, 1.18, -0.52], [0, 1.36, -0.5], [0, 1.5, -0.41], [0, 1.58, -0.29], [0, 1.6, -0.2]];
    a('timber', tube(N.map((p, i) => [...p, 0.022 - i * 0.002]), 7));
    for (let k = 0; k < 5; k++) {                                           // the strings, from the neck to the soundboard
      const t = 0.3 + k * 0.13, i = Math.min(N.length - 2, Math.floor(t * (N.length - 1))), f = t * (N.length - 1) - i, p = N[i].map((v, j) => v + (N[i + 1][j] - v) * f);
      a('string', tube([[p[0], p[1], p[2] + 0.018, 0.0025], [0, 1.046, -0.12 - k * 0.055, 0.0025]], 3));
    }
  } else if (kind === 'lute') {
    const b = new Vector3(0.12, 1.06, -0.17), h = new Vector3(-0.32, 1.38, -0.21), u = h.clone().sub(b).normalize();
    const zA = new Vector3(0, 0, -1), xA = new Vector3().crossVectors(u, zA).normalize(), zB = new Vector3().crossVectors(xA, u).normalize();
    const B = new Matrix4().makeBasis(xA, u, zB).setPosition(b);
    const g = (geo) => geo.applyMatrix4(B);
    a('timber', g(slathe([[0.001, -0.17], [0.09, -0.15], [0.13, -0.07], [0.125, 0.03], [0.085, 0.12], [0.03, 0.17], [0.022, 0.18]], 14, (th) => (Math.sin(th) < 0 ? 0.55 : 0.08))));   // the bowl behind (toward the player)
    a('hide', g(slathe([[0.001, -0.16], [0.085, -0.145], [0.122, -0.07], [0.118, 0.03], [0.08, 0.115], [0.022, 0.17], [0.001, 0.171]], 14, (th) => (Math.sin(th) > 0 ? 0.1 : 0.04))));     // the soundboard
    a('timber', g(tube([[0, 0.16, 0.0, 0.021, 0.014], [0, 0.4, 0.0, 0.017, 0.013]], 7)));
    a('timber', g(tube([[0, 0.39, -0.002, 0.018, 0.012], [0, 0.45, -0.03, 0.017, 0.012], [0, 0.5, -0.06, 0.013, 0.01]], 6)));            // the pegbox bent back
    for (const dx of [-0.008, 0.0, 0.008]) a('string', g(tube([[dx, -0.1, 0.017, 0.0018], [dx, 0.4, 0.018, 0.0018]], 3)));
  } else if (kind === 'ankus') {
    // the elephant goad: a short rod, its iron head with the point forward and the hook curved back
    const w = [0.2, 1.1, -0.32], d = norm([0, 0.2, -1]), p = va(w, d, 0.06);
    a('timber', tube([[...va(p, d, -0.22), 0.016], [...p, 0.017], [...va(p, d, 0.2), 0.016]], 6));
    const t = va(p, d, 0.2);
    a('iron', tube([[...t, 0.014], [...va(t, d, 0.08), 0.009], [...va(t, d, 0.14), 0.001]], 5));
    a('iron', tube([[...va(t, d, 0.03), 0.01], [t[0], t[1] - 0.05, t[2] - 0.08, 0.008], [t[0], t[1] - 0.09, t[2] - 0.03, 0.006], [t[0], t[1] - 0.07, t[2] + 0.01, 0.001]], 5));
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
  if (style === 'short' || style === 'long' || style === 'bun' || style === 'under' || style === 'topknot') {
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
  // the topknot (tikitiki, rāhiri): the hair drawn up from all round and twisted into a knot on the crown
  if (style === 'topknot') { const b = ball(0.052, 10, 7); b.scale(1, 0.9, 1); b.translate(0, 1.655, 0.012); add('hair', b); add('hair', tube([[0, 1.64, 0.01, 0.035], [0, 1.67, 0.012, 0.032], [0, 1.69, 0.012, 0.022]], 8)); }
  if (style === 'bun') { const b = ball(0.05, 9, 6); b.scale(1, 0.85, 0.9); b.translate(0, 1.565, 0.098); add('hair', b); }
}
function hatOf(add, hat) {
  if (hat === 'cap') {                                // a soft cap, a little full at the back
    add('hat', slathe([[0.097, 1.56], [0.1, 1.6], [0.094, 1.64], [0.075, 1.67], [0.04, 1.688], [0.001, 1.692]], 14, ell(0.9, 1.05)).translate(0, 0, 0.004));
    add('hat', slathe([[0.1, 1.555], [0.103, 1.56], [0.103, 1.585], [0.098, 1.59], [0.001, 1.59]], 14, ell(0.9, 1.05)).translate(0, 0, 0.004));
  } else if (hat === 'corno') {                      // the doge's corno: a stiff cap rising behind to a rounded horn, over the white linen cuffia
    add('hat', slathe([[0.1, 1.555], [0.104, 1.565], [0.104, 1.6], [0.098, 1.605], [0.001, 1.605]], 14, ell(0.9, 1.05)).translate(0, 0, 0.004));
    add('hat', tube([[0, 1.58, 0.0, 0.098, 0.1], [0, 1.65, 0.02, 0.088, 0.09], [0, 1.72, 0.05, 0.068, 0.072], [0, 1.775, 0.075, 0.045, 0.05], [0, 1.8, 0.088, 0.022, 0.026]], 12));
    for (const s of [-1, 1]) add('hat', tube([[s * 0.085, 1.565, 0.01, 0.022, 0.012], [s * 0.088, 1.5, 0.02, 0.02, 0.01]], 6));      // the cuffia's lappets over the ears
  } else if (hat === 'turban') {                      // the cloth wound round: a coil of turns rising
    const pts = [];
    for (let k = 0; k <= 30; k++) { const t = k / 30, a = t * Math.PI * 2 * 2.6, r = 0.098 + 0.012 * Math.sin(t * Math.PI) - t * 0.03; pts.push([Math.cos(a) * r * 0.92, 1.57 + t * 0.085, Math.sin(a) * r * 1.02, 0.026, 0.024]); }
    add('hat', tube(pts, 6));
    add('hat', slathe([[0.075, 1.6], [0.07, 1.65], [0.04, 1.68], [0.001, 1.685]], 12));
  } else if (hat === 'straw') {                       // the conical straw hat, its rim turned down a little
    add('hat', slathe([[0.31, 1.618], [0.315, 1.625], [0.29, 1.636], [0.16, 1.7], [0.06, 1.77], [0.012, 1.8], [0.001, 1.802], [0.001, 1.79], [0.05, 1.755], [0.15, 1.69], [0.28, 1.628], [0.31, 1.618]], 18));
    add('hat', slathe([[0.096, 1.585], [0.1, 1.62], [0.001, 1.64]], 12));
  } else if (hat === 'mkot') {
    // the dancer's crown (the Khmer mkot, as the apsaras of Angkor Wat wear it): a diadem round the head, over it a
    // tall cone rising in tiers to a spire, two lesser points either side of it; long earrings to the shoulder
    add('hat', slathe([[0.001, 1.598], [0.097, 1.598], [0.101, 1.606], [0.101, 1.636], [0.094, 1.642], [0.086, 1.656], [0.089, 1.672], [0.079, 1.688], [0.071, 1.698],
      [0.074, 1.713], [0.063, 1.728], [0.056, 1.738], [0.059, 1.753], [0.046, 1.773], [0.04, 1.783], [0.043, 1.798], [0.031, 1.818], [0.025, 1.838], [0.027, 1.852],
      [0.015, 1.888], [0.007, 1.928], [0.001, 1.958]], 14, ell(0.92, 1.0)));
    for (const s of [-1, 1]) {
      add('hat', tube([[s * 0.06, 1.62, -0.015, 0.028, 0.02], [s * 0.085, 1.68, -0.02, 0.02, 0.014], [s * 0.105, 1.73, -0.022, 0.01, 0.008], [s * 0.115, 1.765, -0.022, 0.002]], 6));
      add('hat', tube([[s * 0.086, 1.515, 0.0, 0.007], [s * 0.088, 1.46, 0.002, 0.009], [s * 0.09, 1.4, 0.004, 0.006]], 5));
      add('hat', ball(0.012, 6, 5).translate(s * 0.09, 1.384, 0.004));
    }
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

/** The comb (heru) of wood or bone set upright in a topknot: a rounded head and a row of teeth into the knot. */
function heru(add) {
  const z = 0.0, w = 0.05;
  add('comb', slathe([[0.001, 0], [w, 0], [w, 0.02], [w * 0.92, 0.04], [w * 0.62, 0.062], [0.001, 0.07]], 12, (th) => (Math.abs(Math.sin(th)) < 0.25 ? 1 : 0.08)).translate(0, 1.7, z));
  for (let k = 0; k < 7; k++) { const x = -w * 0.8 + k * (w * 1.6 / 6); add('comb', tube([[x, 1.702, z, 0.0035], [x, 1.66, z, 0.0025]], 3)); }
}

// ---- the figure ----------------------------------------------------------------------------------------
/**
 * figure: { dress ('robe' | 'tunic' | 'trousers' | 'wrap' | 'loincloth' | 'shendyt' | 'sheath' | 'strands' (the Māori kilt of flax strands)), top ('bare': no
 * garment above the waist — the default of the loincloth and the shendyt; with a wrap or trousers too), cloth, cloth2,
 * skin, hat ('none' | 'cap' | 'turban' | 'straw' | 'veil' | 'brim' | 'corno' (the doge's)), hatMat, h (height), carry ('none' | 'pot' | 'basket' |
 * 'pole' | 'hoe' | 'staff' | 'rope' | 'child' | 'oars' | 'punt'), len (of the staff, rope, oars or pole), pose ('stand' |
 * 'talk' | 'sit' (on a chair or bench, seat 0.46 m) | 'sit_low' (on a step or low stool, seat ~0.22 m, y at the feet) | 'sit_ground' (on the
 * ground or a floor, legs out) | 'seiza' (sat back on the heels) | 'squat' | 'kneel' | 'cross' (seated cross-legged) | 'pray' | 'pull' (hauling a rope) | 'staff' |
 * 'row' (seated at the oars) | 'punt' (standing, poling)), staffMat, poleMat (of the staff or oars, of the punting pole), arms (an arm pose of its own, e.g. 'pray' with pose 'kneel'),
 * hair ('short' | 'long' | 'bun' | 'shaven' | 'wig' | 'topknot'), comb (a heru in the topknot), combMat, hairMat, beard, over ('sash' | 'collar' | 'cape' |
 * 'cloak' (to below the knee) | 'apron' | 'belt' | 'shawl' | 'wesekh' (the broad collar) | 'none'), legs ('hose' | 'bare'), feet ('bare' | 'shod') } — a still figure, facing −z.
 * The poses, dresses and things held beyond the first ones are opt-in: a figure without them is as it was.
 */
const LEGS_OF = { sit: 'sit', squat: 'squat', row: 'sit', kneel: 'kneel', cross: 'cross', pull: 'brace', sit_low: 'low', sit_ground: 'ground', seiza: 'seiza',
  apsara: 'plieR', apsara2: 'plieL', folk: 'step', drum: 'cross', flute: 'cross', harp: 'cross', lute: 'cross', ride: 'astride' };
const SEAT_ARMS = { low: 'knees', ground: 'thighs', seiza: 'lap' };
const HELD = { staff: 'staff', rope: 'pull', oars: 'row', punt: 'punt', child: 'child', drum: 'drum', flute: 'flute', harp: 'harp', lute: 'lute', ankus: 'ride' };
const POSE_HELD = { staff: 'staff', pull: 'rope', punt: 'punt', drum: 'drum', flute: 'flute', harp: 'harp', lute: 'lute', ride: 'ankus' };
const INSTR = new Set(['drum', 'flute', 'harp', 'lute', 'ankus']), DANCE = new Set(['plieR', 'plieL', 'step']);
const POSE_ARMS = ['pray', 'pull', 'staff', 'row', 'punt', 'apsara', 'apsara2', 'folk', 'ride'];
// a child (el.child): about 1.0–1.3 m, slighter, its head larger for its height (scaled about the base of the neck)
const CHILD_HEAD = new Matrix4().makeTranslation(0, 1.36, 0).multiply(new Matrix4().makeScale(1.24, 1.24, 1.24)).multiply(new Matrix4().makeTranslation(0, -1.36, 0));
export function figure(el, { bag, col }) {
  const r0 = rng(el.seed), kid = !!el.child, H = el.h ?? (kid ? 1.0 + r0() * 0.3 : 1.56 + r0() * 0.2), girth = (kid ? 0.84 : 0.92) + r0() * 0.18;
  const put = placer(el, bag, H / HB, [girth, 1, 0.94 + (girth - 0.92) * 0.6]);
  const c1 = el.cloth ?? 'cloth_white', c2 = el.cloth2 ?? c1, sk = el.skin ?? 'skin_medium', dress = el.dress ?? 'robe';
  const pose = el.pose ?? 'stand', carry = el.carry && el.carry !== 'none' ? el.carry : POSE_HELD[pose] ?? 'none', hat = el.hat ?? 'none';
  const legs = LEGS_OF[pose] ?? 'stand';
  const armPose = el.arms ?? (carry === 'pot' || carry === 'basket' ? 'head' : carry === 'pole' ? 'pole' : carry === 'hoe' ? 'hoe' : HELD[carry] ? HELD[carry]
    : legs === 'sit' || legs === 'squat' ? legs : SEAT_ARMS[legs] ? SEAT_ARMS[legs] : legs === 'cross' ? (pose === 'pray' ? 'pray' : 'cross')
      : POSE_ARMS.includes(pose) ? pose : pose === 'talk' ? 'talk' : (r0() < 0.3 ? 'clasp' : 'hang'));
  const veiled = hat === 'veil';
  const style = veiled ? 'none' : hat === 'turban' ? 'under' : hat !== 'none' ? 'under' : el.hair ?? ['short', 'short', 'long', 'bun', 'short'][Math.floor(r0() * 5)];
  const beard = !kid && (el.beard ?? (!veiled && style !== 'long' && style !== 'bun' && r0() < 0.35));
  const lower = dress === 'loincloth' || dress === 'shendyt' || dress === 'sheath' || dress === 'strands';             // the dresses of the lower body alone
  const bare = lower || ((el.top ?? (dress === 'loincloth' || dress === 'shendyt' ? 'bare' : '')) === 'bare' && (dress === 'wrap' || dress === 'trousers'));
  const over = el.over ?? (dress === 'robe' ? ['sash', 'none', 'collar'][Math.floor(r0() * 3)] : dress === 'wrap' ? (bare ? 'none' : 'shawl') : dress === 'tunic' || dress === 'shendyt' ? 'belt' : 'none');
  const bareLegs = dress === 'tunic' ? (el.legs ?? 'bare') === 'bare' : dress === 'wrap' || dress === 'loincloth' || dress === 'shendyt' || dress === 'strands';
  const shod = (el.feet ?? (dress === 'wrap' || lower ? 'bare' : 'shod')) !== 'bare';
  // the skin's shade and its undertone (warmer or cooler, a little more olive), drawn from a stream of its own so
  // that the rest of the figure is as it was
  const shade = () => 0.86 + r0() * 0.22, cs = shade(), cs2 = shade(), sv = 0.9 + r0() * 0.16, ru = rng((el.seed ^ 0x5bd1e995) >>> 0), wu = (ru() - 0.5) * 0.1, ou = (ru() - 0.5) * 0.05;
  const ss = [sv * (1 + wu), sv * (1 + ou), sv * (1 - wu)];
  const hairMat = el.hairMat ?? 'hide_black', hairShade = el.hairShade ?? (hairMat === 'hide_black' ? 0.7 : 1);
  const M = upperM(legs);

  // the skin: the head (with its neck), the hands (and bare forearms, or the bare arms and chest), any bare legs
  // and feet — each keyed only by what shapes it, so that few shapes serve every figure
  const up = (a) => (role, g) => a(role, g.applyMatrix4(M));
  // the head's pieces (skin, face, hair, hat, comb): a child's larger for its height
  const KH = kid ? '|k' : '', uph = kid ? (a) => (role, g) => a(role, g.applyMatrix4(CHILD_HEAD).applyMatrix4(M)) : up;
  put(sk, assembly(`fig-head|${legs}${KH}`, (a) => head(uph(a))).skin.clone(), ss);
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
    else if (dress === 'strands') strands(a, up(a), legs, 8);
    // dancing: the apsara's short sampot, or the folk dancer's flaring skirt
    else if (DANCE.has(legs) && (dress === 'robe' || dress === 'wrap' || dress === 'tunic')) danceSkirt(up(a), legs, dress, dress === 'robe' ? 5 : 7);
    // kneeling or cross-legged, a robe or a wrap lies pooled round the legs
    else if ((legs === 'kneel' || legs === 'cross' || legs === 'seiza') && (dress === 'robe' || dress === 'wrap')) pool(a, up(a), legs, dress === 'robe' ? 5 : 7, dress === 'robe');
    else if (dress === 'robe') skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: 0.03, seed: 5 });
    else if (dress === 'wrap') skirt(a, 'c1', legs === 'brace' ? 'stand' : legs, { hem: legs === 'stand' || legs === 'brace' ? 0.22 : 0.2, seed: 7, flare: 0.6 });
    else if (dress === 'tunic') { if (legs === 'stand' || legs === 'brace') skirt(a, 'c1', 'stand', { hem: 0.5, flare: 1.4, seed: 9 }); else up(a)('c1', slathe([[0.2, Math.max(0.62, (LEGS[legs]?.drop ?? 0) + 0.04)], [0.16, 0.86], [0.001, 0.87]], 14).scale(1, 1, 0.8)); }
    else { if (legs === 'stand' || legs === 'brace') a('c1', folded([[0.2, 0.7], [0.19, 0.8], [0.165, 0.92], [0.001, 0.93]], 14, 5, 0.04, 11).scale(1, 1, 0.78)); else up(a)('c1', slathe([[0.19, Math.max(0.74, (LEGS[legs]?.drop ?? 0) + 0.04)], [0.165, 0.9], [0.001, 0.91]], 14).scale(1, 1, 0.8)); }
  }).c1.clone(), cs);
  // the second cloth: trousers or hose, the sash, collar, cape, shawl, belt or broad collar
  const C = assembly(`fig-c2|${dress}|${over}|${legs}|${bareLegs ? 'L' : ''}`, (a) => {
    const up = (role, g) => a(role, g.applyMatrix4(M));
    if (dress === 'trousers' || (dress === 'tunic' && !bareLegs)) legTubes(a, 'c2', legs);
    if (over === 'sash' || over === 'belt') up('c2', tube(Array.from({ length: 15 }, (_, k) => { const t = k / 14 * Math.PI * 2; return [Math.cos(t) * 0.152, 1.0, Math.sin(t) * 0.152 * 0.68, 0.03, over === 'belt' ? 0.018 : 0.032]; }), 5, { capA: false, capB: false }));
    if (over === 'sash' && legs === 'stand') a('c2', tube([[0.06, 0.99, -0.108, 0.035, 0.008], [0.07, 0.8, -0.13, 0.04, 0.007], [0.075, 0.64, -0.14, 0.035, 0.006]], 5));
    if (over === 'collar') for (const s of [-1, 1]) up('c2', tube([[s * 0.06, 1.43, 0.02, 0.022, 0.01], [s * 0.075, 1.4, -0.07, 0.024, 0.01], [-s * 0.02, 1.25, -0.125, 0.026, 0.012], [-s * 0.07, 1.05, -0.105, 0.024, 0.01]], 5));
    if (over === 'cape') up('c2', folded([[0.26, 1.02], [0.24, 1.15], [0.215, 1.3], [0.185, 1.36], [0.1, 1.42], [0.06, 1.445], [0.001, 1.446]], 16, 7, 0.06, 13).scale(1, 1, 0.78));
    // a cloak (kahu) of flax or dog skin from the shoulders to below the knees, wrapped round: standing; seated it lies as a cape
    if (over === 'cloak') { if (legs === 'stand' || legs === 'brace') a('c2', folded([[0.29, 0.42], [0.285, 0.45], [0.27, 0.7], [0.262, 0.95], [0.262, 1.15], [0.255, 1.3], [0.215, 1.37], [0.11, 1.425], [0.06, 1.448], [0.001, 1.449]], 18, 9, 0.05, 15).scale(1, 1, 0.8)); else up('c2', folded([[0.27, 0.9], [0.24, 1.15], [0.215, 1.3], [0.185, 1.36], [0.1, 1.42], [0.06, 1.445], [0.001, 1.446]], 16, 7, 0.06, 13).scale(1, 1, 0.78)); }
    if (over === 'shawl') up('c2', tube([[-0.16, 1.4, 0.0, 0.07, 0.02], [-0.05, 1.3, -0.12, 0.08, 0.02], [0.1, 1.08, -0.115, 0.075, 0.018], [0.16, 0.96, -0.02, 0.06, 0.018], [0.08, 1.12, 0.115, 0.075, 0.018], [-0.08, 1.32, 0.1, 0.075, 0.02], [-0.16, 1.4, 0.0, 0.07, 0.02]], 6, { capA: false, capB: false }));
    if (over === 'wesekh') wesekh(up);
  });
  if (C.c2) put(c2, C.c2.clone(), cs2);
  // the hair (eyes, brows, beard) and the hat
  put(hairMat, assembly(`fig-face|${legs}|${beard ? 'b' : ''}${KH}`, (a) => faceOf(uph(a), beard)).hair.clone(), hairShade);
  if (style !== 'shaven' && style !== 'none') put(hairMat, assembly(`fig-hair|${style}|${legs}${KH}`, (a) => hairOf(uph(a), style)).hair.clone(), hairShade);
  if (el.comb && style === 'topknot') put(el.combMat ?? 'ivory', assembly(`fig-heru|${legs}${KH}`, (a) => heru(uph(a))).comb.clone());
  if (hat !== 'none') {
    const T = assembly(`fig-hat|${hat}|${legs}${KH}`, (a) => { const up = uph(a); if (hat === 'veil') veil(up); else hatOf(up, hat); });
    const hm = el.hatMat ?? (hat === 'straw' ? 'thatch' : hat === 'turban' ? 'cloth_white' : hat === 'brim' ? 'cloth_black' : hat === 'mkot' ? 'gilt_bronze' : hat === 'veil' ? c1 : c2);
    put(hm, T.hat.clone(), hat === 'veil' ? cs : 1);
  }
  if (shod) { const F = assembly(`fig-feet|${legs}`, (a) => feet(a, 'shoe', legs)); put('cloth_brown', F.shoe.clone()); }
  // what is carried: on the head or the shoulder; held in the hands of the pose; a child on the hip
  if (carry === 'child') {
    const K = assembly(`fig-child|${legs}`, (a) => child(up(a)));
    put(sk, K.skin.clone(), ss.map((v) => v * 1.03)); put(el.childCloth ?? c2, K.c2.clone(), cs2); put(hairMat, K.hair.clone(), hairShade);
  } else if (INSTR.has(carry)) {
    const K = assembly(`fig-instr|${carry}|${legs}`, (a) => instrument(up(a), carry));
    const MAT = { timber: el.staffMat ?? 'timber', hide: 'hide_white', lacing: 'hide_brown', cane: 'bamboo_culm', string: 'cloth_white', iron: 'iron' };
    for (const [role, g] of Object.entries(K)) put(MAT[role] ?? role, g.clone(), role === 'lacing' ? 0.6 : role === 'hide' ? 0.95 : 1);
  } else if (carry === 'staff' || carry === 'rope' || carry === 'oars' || carry === 'punt') {
    const K = assembly(`fig-held|${carry}|${armPose}|${legs}|${el.len ?? ''}`, (a) => heldThing(a, carry, armPose, M, legs, el.len));
    for (const [role, g] of Object.entries(K)) put(role === 'timber' ? el.staffMat ?? 'timber' : role === 'bamboo_culm' ? el.poleMat ?? 'bamboo_culm' : role === 'rope' ? 'cloth_brown' : role, g.clone(), role === 'rope' ? 0.85 : 1);
  } else if (carry !== 'none') {
    const K = assembly(`fig-carry|${carry}`, (a) => carried(a, carry));
    for (const [role, g] of Object.entries(K)) put(role, g.clone());
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 0.25, y, y + H * (legs === 'kneel' ? 0.78 : legs === 'cross' || legs === 'ground' ? 0.55 : legs === 'seiza' ? 0.6 : legs === 'low' ? 0.68 : 1));
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
