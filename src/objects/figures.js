// The still figures of the streets (DESIGN §5 "Figures and life"): people in the dress of their
// place, standing, talking, sitting, squatting, carrying. A figure is built of a few assemblies —
// its skin (head with face, ears and nose, neck, hands, any bare limbs), its garment (body, sleeves,
// skirts with their folds), the second cloth (sash, collar, cape, apron, trousers, hose), the hair
// (with brows, eyes and beard), the hat and the shoes — each merged into one shape, cached, and put
// as one instance: about eight instances a figure. Each is varied by its seed: height, build, the
// shade of skin and cloth, the hair and its colour, a beard, the second garment.

import { box } from '../core/geom.js';
import { Matrix4 } from '../core/three.js';
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
  return [[s * 0.088, 0.86, 0.0], [s * 0.094, 0.48, -0.012], [s * 0.088, 0.1, 0.005]];
}
function legTubes(add, role, legs, { from = 0, thick = 1 } = {}) {
  for (const s of [-1, 1]) {
    const [Hp, K, A] = legsOf(legs, s), pts = [[...Hp, 0.078 * thick], [...va(Hp, va(K, Hp, -1), 0.5), 0.065 * thick], [...K, 0.054 * thick], [...va(K, va(A, K, -1), 0.4), 0.05 * thick], [...A, 0.04 * thick]];
    add(role, tube(pts.slice(from), 8, { capA: true, capB: from < 4 }));
  }
}
/** The feet (shoes or bare). */
function feet(add, role, legs) {
  for (const s of [-1, 1]) {
    const [, , A] = legsOf(legs, s), z = legs === 'sit' ? A[2] : legs === 'squat' ? A[2] : 0.0;
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
 * figure: { dress ('robe' | 'tunic' | 'trousers' | 'wrap'), cloth, cloth2, skin, hat ('none' | 'cap' | 'turban' |
 * 'straw' | 'veil' | 'brim'), hatMat, h (height), carry ('none' | 'pot' | 'basket' | 'pole' | 'hoe'), pose ('stand' |
 * 'talk' | 'sit' | 'squat'), hair ('short' | 'long' | 'bun' | 'shaven'), hairMat, beard, over ('sash' | 'collar' |
 * 'cape' | 'apron' | 'none'), legs ('hose' | 'bare'), feet ('bare' | 'shod') } — a still figure, facing −z.
 */
export function figure(el, { bag, col }) {
  const r0 = rng(el.seed), H = el.h ?? 1.56 + r0() * 0.2, girth = 0.92 + r0() * 0.18;
  const put = placer(el, bag, H / HB, [girth, 1, 0.94 + (girth - 0.92) * 0.6]);
  const c1 = el.cloth ?? 'cloth_white', c2 = el.cloth2 ?? c1, sk = el.skin ?? 'skin_medium', dress = el.dress ?? 'robe';
  const pose = el.pose ?? 'stand', carry = el.carry ?? 'none', hat = el.hat ?? 'none';
  const legs = pose === 'sit' ? 'sit' : pose === 'squat' ? 'squat' : 'stand';
  const armPose = carry === 'pot' || carry === 'basket' ? 'head' : carry === 'pole' ? 'pole' : carry === 'hoe' ? 'hoe' : legs !== 'stand' ? legs : pose === 'talk' ? 'talk' : (r0() < 0.3 ? 'clasp' : 'hang');
  const veiled = hat === 'veil';
  const style = veiled ? 'none' : hat === 'turban' ? 'under' : hat !== 'none' ? 'under' : el.hair ?? ['short', 'short', 'long', 'bun', 'short'][Math.floor(r0() * 5)];
  const beard = el.beard ?? (!veiled && style !== 'long' && style !== 'bun' && r0() < 0.35);
  const over = el.over ?? (dress === 'robe' ? ['sash', 'none', 'collar'][Math.floor(r0() * 3)] : dress === 'wrap' ? 'shawl' : dress === 'tunic' ? 'belt' : 'none');
  const bareLegs = dress === 'tunic' ? (el.legs ?? 'bare') === 'bare' : dress === 'wrap';
  const shod = (el.feet ?? (dress === 'wrap' ? 'bare' : 'shod')) !== 'bare';
  const shade = () => 0.86 + r0() * 0.22, cs = shade(), cs2 = shade(), ss = 0.9 + r0() * 0.16;
  const hairMat = el.hairMat ?? 'hide_black', hairShade = el.hairShade ?? (hairMat === 'hide_black' ? 0.7 : 1);
  const M = upperM(legs);

  // the skin: head, neck, hands, bare forearms and legs (and bare feet)
  // the skin: the head (with its neck), the hands (and bare forearms), any bare legs and feet — each
  // keyed only by what shapes it, so that few shapes serve every figure
  const up = (a) => (role, g) => a(role, g.applyMatrix4(M));
  put(sk, assembly(`fig-head|${legs}`, (a) => head(up(a))).skin.clone(), ss);
  put(sk, assembly(`fig-hands|${armPose}|${legs}|${dress === 'wrap' ? 'w' : ''}`, (a) => { hands(up(a), armPose); if (dress === 'wrap') forearms(up(a), armPose); }).skin.clone(), ss);
  if (bareLegs || !shod) put(sk, assembly(`fig-legs|${legs}|${bareLegs ? (dress === 'wrap' && legs === 'stand' ? 'l' : 'L') : ''}|${shod ? '' : 'F'}`, (a) => {
    if (bareLegs) legTubes(a, 'skin', legs, { from: dress === 'wrap' && legs === 'stand' ? 2 : 0 });
    if (!shod) feet(a, 'skin', legs);
  }).skin.clone(), ss);
  // the garment: the body with its sleeves; the skirts
  put(c1, assembly(`fig-body|${dress === 'trousers' ? 't' : dress === 'robe' ? 'r' : dress === 'wrap' ? 'w' : 'c'}|${armPose}|${legs}`, (a) => {
    torso(up(a), 'c1', dress === 'trousers' ? 1.06 : 1);
    sleeves(up(a), 'c1', armPose, { loose: dress === 'robe' ? 1 : 0, short: dress === 'wrap' });
  }).c1.clone(), cs);
  put(c1, assembly(`fig-skirt|${dress}|${legs}`, (a) => {
    if (dress === 'robe') skirt(a, 'c1', legs, { hem: 0.03, seed: 5 });
    else if (dress === 'wrap') skirt(a, 'c1', legs, { hem: legs === 'stand' ? 0.22 : 0.2, seed: 7, flare: 0.6 });
    else if (dress === 'tunic') { if (legs === 'stand') skirt(a, 'c1', legs, { hem: 0.5, flare: 1.4, seed: 9 }); else up(a)('c1', slathe([[0.2, 0.62], [0.16, 0.86], [0.001, 0.87]], 14).scale(1, 1, 0.8)); }
    else { if (legs === 'stand') a('c1', folded([[0.2, 0.7], [0.19, 0.8], [0.165, 0.92], [0.001, 0.93]], 14, 5, 0.04, 11).scale(1, 1, 0.78)); else up(a)('c1', slathe([[0.19, 0.74], [0.165, 0.9], [0.001, 0.91]], 14).scale(1, 1, 0.8)); }
  }).c1.clone(), cs);
  // the second cloth: trousers or hose, the sash, collar, cape, shawl or belt
  const C = assembly(`fig-c2|${dress}|${over}|${legs}|${bareLegs ? 'L' : ''}`, (a) => {
    const up = (role, g) => a(role, g.applyMatrix4(M));
    if (dress === 'trousers' || (dress === 'tunic' && !bareLegs)) legTubes(a, 'c2', legs);
    if (over === 'sash' || over === 'belt') up('c2', tube(Array.from({ length: 15 }, (_, k) => { const t = k / 14 * Math.PI * 2; return [Math.cos(t) * 0.152, 1.0, Math.sin(t) * 0.152 * 0.68, 0.03, over === 'belt' ? 0.018 : 0.032]; }), 5, { capA: false, capB: false }));
    if (over === 'sash' && legs === 'stand') a('c2', tube([[0.06, 0.99, -0.108, 0.035, 0.008], [0.07, 0.8, -0.13, 0.04, 0.007], [0.075, 0.64, -0.14, 0.035, 0.006]], 5));
    if (over === 'collar') for (const s of [-1, 1]) up('c2', tube([[s * 0.06, 1.43, 0.02, 0.022, 0.01], [s * 0.075, 1.4, -0.07, 0.024, 0.01], [-s * 0.02, 1.25, -0.125, 0.026, 0.012], [-s * 0.07, 1.05, -0.105, 0.024, 0.01]], 5));
    if (over === 'cape') up('c2', folded([[0.26, 1.02], [0.24, 1.15], [0.215, 1.3], [0.185, 1.36], [0.1, 1.42], [0.06, 1.445], [0.001, 1.446]], 16, 7, 0.06, 13).scale(1, 1, 0.78));
    if (over === 'shawl') up('c2', tube([[-0.16, 1.4, 0.0, 0.07, 0.02], [-0.05, 1.3, -0.12, 0.08, 0.02], [0.1, 1.08, -0.115, 0.075, 0.018], [0.16, 0.96, -0.02, 0.06, 0.018], [0.08, 1.12, 0.115, 0.075, 0.018], [-0.08, 1.32, 0.1, 0.075, 0.02], [-0.16, 1.4, 0.0, 0.07, 0.02]], 6, { capA: false, capB: false }));
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
  // what is carried
  if (carry !== 'none') {
    const K = assembly(`fig-carry|${carry}`, (a) => carried(a, carry));
    for (const [role, g] of Object.entries(K)) put(role, g.clone());
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 0.25, y, y + H);
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
    a('iron', box(-0.03, 0.0, -1.06, 0.19, 0.12, -1.04));
  }
}
