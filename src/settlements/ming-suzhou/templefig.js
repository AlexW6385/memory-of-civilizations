// The images of the Bao'en Temple, modelled (docs/settlements/ming-suzhou.md §26): the seated Buddha on his lotus
// throne with halo and mandorla, the disciples Ananda and Kasyapa, the arhats (lohans) in their poses, the four
// guardian kings in armour. Built with the sculptor's kit of the Nabataean carvings (src/styles/nabataean/sculpt.js,
// read-only): rounded limbs, torso, a head with brow, nose, lips, ears and hair, cloth with folds that follow the body.
// Each figure is built in its own frame (x to the viewer's right, y up, z out of the front; metres at scale k = 1,
// feet or seat at y = 0) into one Sculpt per material, and comes out as one geometry per material. `lod` 0 is the
// full figure (curls, ears, fingers), 1 the reduced one. Deterministic: variety only from a hash of the place.

import { Sculpt, blob, blobDir, tube, rodT, sheet, torus, hash3 } from '../../styles/nabataean/sculpt.js';

const PI = Math.PI, TAU = PI * 2;

/** The figure's Sculpts by material, scaled by k about the origin. */
export class Fig {
  constructor(k = 1) { this.k = k; this.S = {}; this.pre = null; }
  s(mat) {
    if (!this.S[mat]) { const S = new Sculpt(([x, y, z]) => [x * this.k, y * this.k, z * this.k]); S.pre = (p) => (this.pre ? this.pre(p) : p); this.S[mat] = S; }
    return this.S[mat];
  }
  get triangles() { return Object.values(this.S).reduce((a, s) => a + s.triangles, 0); }
  /** Into a Parts collector (src/styles/qing/carving.js). */
  into(P) { for (const [m, S] of Object.entries(this.S)) if (S.triangles) P.add(m, S.geometry()); }
}

// ── the head ─────────────────────────────────────────────────────────────────
/** o: kind 'buddha' | 'monk' | 'king' | 'lay'; skin (material), hair (material), brow, beard, lod, helmet (material), age 0…1, look (yaw of the face, radians). */
function head(F, c, o = {}) {
  if (o.k && o.k !== 1) {
    const k = o.k, prev = F.pre;
    F.pre = (p) => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k, c[2] + (p[2] - c[2]) * k];
    head(F, c, { ...o, k: 1 });
    F.pre = prev;
    return;
  }
  const lod = o.lod ?? 0, sk = F.s(o.skin ?? 'skin_light'), seg = lod ? 6 : 9, kind = o.kind ?? 'monk', [x, y, z] = c;
  const q = (dx, dy, dz) => [x + dx, y + dy, z + dz], B = (S, p, r, a = 3, b = seg) => blob(S, p, r, a, b);
  const old = o.age ?? 0.3, fierce = kind === 'king';
  B(sk, c, [0.078, 0.105, 0.092], 4);                                           // the skull and face
  B(sk, q(0, -0.064, 0.026), [0.058 + old * 0.004, 0.052, 0.062], 3);           // the jaw
  B(sk, q(0, -0.1, 0.05), [0.027, 0.022, 0.028], 2, 6);                         // the chin
  for (const s of [-1, 1]) B(sk, q(s * 0.046, -0.038, 0.066), [0.026, 0.034, 0.024], 2, 6);   // the cheeks
  blobDir(sk, q(0, -0.012, 0.09), [0, -0.6, 0.5], 0.034, 0.013, 0.016, [1, 0, 0], 3, 6);    // the nose
  B(sk, q(0, -0.039, 0.098), [0.019, 0.007, 0.01], 2, 6);                       // the nostrils' base
  for (const s of [-1, 1]) {
    blobDir(sk, q(s * 0.031, 0.034 - (fierce ? 0.004 : 0), 0.084), [s, fierce ? -0.45 : -0.1, 0.08], 0.032, fierce ? 0.009 : 0.006, 0.009, [0, 1, 0], 2, 6);   // the brows
    B(sk, q(s * 0.031, 0.016, 0.086), [0.017, kind === 'buddha' ? 0.006 : 0.009, 0.01], 2, 6);   // the eyelids (the Buddha's half closed)
    if (fierce) B(F.s('paint_white'), q(s * 0.031, 0.017, 0.094), [0.009, 0.007, 0.004], 2, 6);
  }
  B(sk, q(0, -0.059, 0.087), [0.022, 0.0065, 0.01], 2, 6);                       // the upper lip
  B(sk, q(0, -0.07, 0.083), [0.019, 0.007, 0.01], 2, 6);                         // the lower lip
  if (!lod || kind === 'buddha') for (const s of [-1, 1]) {
    if (kind === 'buddha') blobDir(sk, q(s * 0.084, -0.04, 0.0), [s * 0.1, -1, 0], 0.058, 0.012, 0.02, [1, 0, 0], 3, 6);   // the long lobes
    else B(sk, q(s * 0.082, -0.01, 0.0), [0.008, 0.026, 0.017], 2, 6);                                                   // the ears
  }
  const hr = F.s(o.hair ?? 'hair_dark');
  if (kind === 'buddha') {
    // the ushnisha and the snail curls in rows over the skull, the urna between the brows
    B(sk, q(0, 0.118, -0.002), [0.054, 0.042, 0.058], 3);
    B(F.s('gilt_bronze'), q(0, 0.036, 0.1), [0.007, 0.007, 0.004], 2, 5);
    const rows = lod ? [30, 58, 86] : [22, 40, 58, 76, 94];
    for (const ph of rows) {
      const n = Math.max(5, Math.round((lod ? 9 : 13) * Math.sin(ph * PI / 180)));
      for (let i = 0; i < n; i++) {
        const th = (i + 0.5) / n * TAU, front = Math.cos(th) > 0.2;
        if (front && ph > 60 && Math.abs(Math.sin(th)) < 0.95) continue;       // the hairline over the brow
        if (ph > 90 && Math.cos(th) > -0.2 && Math.abs(Math.sin(th)) < 0.9) continue;
        const sp = Math.sin(ph * PI / 180), cp = Math.cos(ph * PI / 180);
        const rx = ph < 30 ? 0.056 : 0.082, ry = ph < 30 ? 0.045 : 0.109;
        const cy = ph < 30 ? 0.118 : 0, rz = ph < 30 ? 0.058 : 0.096;
        B(hr, q(Math.sin(th) * sp * rx, cy + cp * ry, Math.cos(th) * sp * rz), [0.0165, 0.0165, 0.0165], 2, 5);
      }
    }
  } else if (o.helmet) {
    const hm = F.s(o.helmet);
    B(hm, q(0, 0.03, -0.006), [0.09, 0.09, 0.102], 4);                          // the helmet's bowl
    for (const s of [-1, 1]) blobDir(hm, q(s * 0.088, -0.02, -0.01), [0, -1, 0], 0.07, 0.02, 0.05, [1, 0, 0], 3, 6);   // the flaps over the ears
    blobDir(hm, q(0, 0.1, -0.005), [0, 1, -0.3], 0.065, 0.012, 0.03, [1, 0, 0], 3, 6);   // the crest
    B(hm, q(0, 0.065, 0.088), [0.07, 0.014, 0.02], 2, 7);                       // the brim over the brow
  } else if (o.hairStyle === 'knot') {
    B(hr, q(0, 0.03, -0.01), [0.082, 0.09, 0.098], 4);
    B(hr, q(0, 0.125, -0.01), [0.035, 0.04, 0.035], 3, 6);
  } else if (kind === 'monk' || kind === 'lay') {
    B(sk, q(0, 0.012, -0.012), [0.078, 0.1, 0.092], 3);                           // the shaven crown
    if (kind === 'monk' && !lod) for (let i = 0; i < 3; i++) B(F.s('lacquer_black'), q((i - 1) * 0.026, 0.1, 0.045), [0.0046, 0.0046, 0.0046], 1, 4);   // the ordination scars
  }
  if (o.beard) {
    const bd = F.s(o.beardMat ?? 'hair_dark');
    B(bd, q(0, -0.07, 0.04), [0.06, 0.07, 0.05], 3);
    blobDir(bd, q(0, -0.14 - old * 0.04, 0.05), [0, -1, 0.1], 0.07 + old * 0.04, 0.035, 0.025, [1, 0, 0], 3, 6);
    B(bd, q(0, -0.052, 0.096), [0.04, 0.012, 0.012], 2, 6);                       // the moustache
  }
  if (o.longBrows) for (const s of [-1, 1]) tube(F.s('paint_white'), [[x + s * 0.045, y + 0.035, z + 0.092, 0.005], [x + s * 0.07, y - 0.03, z + 0.09, 0.0045], [x + s * 0.076, y - 0.1, z + 0.08, 0.003]], { seg: 4, sub: 1, capN: 1 });
}
const eyeLine = (F, c) => void (F, c);
void eyeLine;

/** A hand at wrist `wr` along `d` (unit), the thumb on `side`; palm and fingers, a thumb. */
function hand(F, mat, wr, d, side, k = 1, lod = 0) {
  const S = F.s(mat), len = Math.hypot(...d) || 1, u = d.map((v) => v / len);
  const at = (t) => [wr[0] + u[0] * t * k, wr[1] + u[1] * t * k, wr[2] + u[2] * t * k];
  blobDir(S, at(0.05), u, 0.058 * k, 0.04 * k, 0.015 * k, side, 3, 6);                          // the palm
  if (!lod) blobDir(S, at(0.11), u, 0.05 * k, 0.037 * k, 0.012 * k, side, 3, 6);               // the fingers
  rodT(S, at(0.04), [at(0.09)[0] + side[0] * 0.032 * k, at(0.09)[1] + side[1] * 0.032 * k, at(0.09)[2] + side[2] * 0.032 * k], 0.012 * k, 0.009 * k);   // the thumb
}

// ── the lotus throne and the dais ────────────────────────────────────────────
/** A lotus throne, its top at y = 0 and its foot at y = −h: a stepped red base, two rows of petals, the seat. */
export function throne(F, r = 0.62, h = 0.6, lod = 0) {
  const red = F.s('lacquer_red'), gilt = F.s('clay_gilt'), W = r * 0.84;
  red.box(-r, -h, -r * 0.86, r, -h + 0.07, r * 0.86);
  red.box(-r * 0.92, -h + 0.07, -r * 0.8, r * 0.92, -h + 0.13, r * 0.8);
  red.box(-r * 0.78, -h + 0.13, -r * 0.66, r * 0.78, -h + h * 0.55, r * 0.66);
  gilt.box(-r * 0.82, -h + h * 0.55, -r * 0.7, r * 0.82, -h + h * 0.55 + 0.035, r * 0.7);
  const n = lod ? 12 : 18, y0 = -h + h * 0.55 + 0.03;
  for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
    const th = (i + row * 0.5) / n * TAU, ca = Math.cos(th), sa = Math.sin(th), R = (row ? 0.78 : 0.95) * W;
    // the petals' base is on the rim of the seat below; they curl out and up (the lower row opens wider)
    const dir = [ca * (row ? 0.35 : 0.8), row ? 0.95 : 0.55, sa * (row ? 0.35 : 0.8) * 0.86];
    const L = (row ? 0.17 : 0.19) * (0.7 + r), c = [ca * R * 0.98, y0 + (row ? 0.13 : 0.06), sa * R * 0.86 * 0.98];
    blobDir(gilt, c, dir, L * 0.7, 0.07 * (0.7 + r), 0.018, [-sa, 0, ca], 3, 6);
  }
  gilt.grid(Array.from({ length: 4 }, (_, i) => Array.from({ length: 20 }, (_, j) => { const th = j / 20 * TAU, rr = [0.001, 0.4, 0.8, 1][i] * W * 1.0; return [Math.cos(th) * rr, [0.03, 0.03, 0.0, -0.01][i] + 0.0, Math.sin(th) * rr * 0.86]; })));
  void red; void y0;
}

// ── the seated Buddha ────────────────────────────────────────────────────────
/** The Buddha seated in the lotus posture, the seat at y = 0, his right hand touching the earth (o.mudra 'earth') or both in the lap ('dhyana' / 'medicine' with the bowl). */
export function buddha(F, o = {}) {
  const lod = o.lod ?? 0, robe = o.robe ?? 'clay_robe', G = F.s('gilt_bronze'), R = F.s(robe), mud = o.mudra ?? 'earth';
  const fold = (ph, a) => (t, th) => 1 + a * (Math.cos(5 * th + 3 * t + ph) + 0.4 * Math.cos(11 * th + 7 * t));
  // the crossed legs under the robe, the soles of the feet showing
  tube(R, [[-0.42, 0.1, 0.12, 0.09], [-0.3, 0.085, 0.32, 0.08], [0.14, 0.14, 0.38, 0.066]], { seg: 8, sub: 2, fold: fold(0, 0.05) });
  tube(R, [[0.42, 0.1, 0.12, 0.09], [0.3, 0.08, 0.31, 0.075], [-0.14, 0.11, 0.36, 0.062]], { seg: 8, sub: 2, fold: fold(1.7, 0.05) });
  blob(R, [0, 0.08, 0.14], [0.4, 0.075, 0.22], 3, 10);
  for (const s of [-1, 1]) blobDir(G, [s * 0.2, 0.17, 0.39], [s * 0.3, 0.45, 0.2], 0.07, 0.045, 0.014, [0, 1, 0], 3, 6);
  // the trunk: bare gilt to the waist, the robe wrapped below it and drawn from the left shoulder across the breast to the right hip
  tube(G, [[0, 0.1, -0.005, 0.22, 0.15], [0, 0.4, 0.0, 0.2, 0.14], [0, 0.62, 0.0, 0.25, 0.155], [0, 0.72, 0.0, 0.19, 0.12]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0] });
  blob(G, [0, 0.55, 0.12], [0.13, 0.12, 0.06], 3, 9);                                                          // the breast
  tube(R, [[0, 0.1, 0, 0.235, 0.163], [0, 0.26, 0.0, 0.222, 0.158], [0, 0.4, 0.0, 0.215, 0.152]], { seg: lod ? 8 : 14, sub: 2, ref: [1, 0, 0], fold: fold(0.5, 0.05), capN: 1 });   // the wrap about the waist
  tube(R, [[-0.2, 0.7, 0.03, 0.09, 0.05], [-0.14, 0.58, 0.14, 0.085, 0.045], [0.0, 0.46, 0.165, 0.085, 0.045], [0.14, 0.34, 0.16, 0.08, 0.045]], { seg: 8, sub: 2, ref: [0, 1, 0], fold: fold(1.1, 0.07), capN: 1 });   // the sash across the breast
  tube(R, [[-0.27, 0.72, 0.0, 0.1, 0.13], [-0.28, 0.5, 0.0, 0.1, 0.14], [-0.24, 0.38, 0.0, 0.11, 0.155]], { seg: 8, sub: 2, ref: [1, 0, 0], fold: fold(2.4, 0.06), capN: 1 });   // the cloth over the left shoulder, falling at the back
  for (const s of [-1, 1]) blob(s < 0 ? R : G, [s * 0.265, 0.665, 0.0], [0.075, 0.07, 0.08], 3, 8);          // the shoulders
  tube(G, [[0, 0.72, 0, 0.068], [0, 0.82, 0.012, 0.062]], { seg: 8, sub: 1, capN: 1 });                    // the neck
  // the arms: sleeves of the robe from the shoulders, the forearms and hands in gilt
  const sh = [[-0.27, 0.66, 0.0], [0.27, 0.66, 0.0]];
  const hands = mud === 'earth' ? { R: [0.43, 0.2, 0.33], L: [-0.1, 0.18, 0.31] } : { R: [0.06, 0.18, 0.31], L: [-0.06, 0.18, 0.31] };
  tube(G, [[...sh[1], 0.07], [0.36, 0.42, 0.1, 0.064], [hands.R[0] - 0.015, hands.R[1] + 0.06, hands.R[2] - 0.05, 0.05]], { seg: 8, sub: 2 });
  tube(R, [[...sh[0], 0.075], [-0.34, 0.4, 0.1, 0.07], [hands.L[0] + 0.02, hands.L[1] + 0.06, hands.L[2] - 0.05, 0.062]], { seg: 8, sub: 2, fold: fold(3, 0.05) });
  tube(G, [[hands.R[0] - 0.015, hands.R[1] + 0.06, hands.R[2] - 0.05, 0.04], [...hands.R, 0.032]], { seg: 6, sub: 1, capN: 1 });
  tube(G, [[hands.L[0] + 0.02, hands.L[1] + 0.06, hands.L[2] - 0.05, 0.04], [...hands.L, 0.032]], { seg: 6, sub: 1, capN: 1 });
  if (mud === 'earth') hand(F, 'gilt_bronze', hands.R, [0.08, -0.7, 0.65], [-1, 0, 0.3], 1, lod);
  else hand(F, 'gilt_bronze', hands.R, [-0.7, -0.05, 0.5], [0, 1, 0], 1, lod);
  hand(F, 'gilt_bronze', hands.L, [0.7, -0.05, 0.5], [0, 1, 0], 1, lod);
  if (mud === 'medicine') {                                                                                       // the Medicine Buddha's bowl in his left hand
    F.s('bronze').grid(Array.from({ length: 5 }, (_, i) => Array.from({ length: 14 }, (_, j) => { const th = j / 14 * TAU, a = i / 4 * PI / 2; return [-0.06 + Math.cos(th) * Math.sin(a) * 0.075, 0.23 - Math.cos(a) * 0.06, 0.31 + Math.sin(th) * Math.sin(a) * 0.075]; })));
  }
  head(F, [0, 0.945, 0.016], { kind: 'buddha', skin: 'gilt_bronze', hair: 'prussian_blue', lod });
  // the halo (a disc and two rings) and the mandorla behind the whole figure
  const gd = F.s('clay_gilt');
  blob(gd, [0, 0.96, -0.15], [0.3, 0.3, 0.012], 5, 20);
  torus(gd, [0, 0.96, -0.136], [1, 0, 0], [0, 1, 0], 0.3, 0.012, { seg: 28, sec: 5 });
  torus(gd, [0, 0.96, -0.136], [1, 0, 0], [0, 1, 0], 0.2, 0.008, { seg: 24, sec: 5 });
  blob(F.s('lacquer_red'), [0, 0.64, -0.27], [0.8, 0.8, 0.014], 6, 24);
  torus(gd, [0, 0.64, -0.255], [1, 0, 0], [0, 1, 0], 0.8, 0.016, { seg: 36, sec: 5 });
  if (!lod) torus(gd, [0, 0.64, -0.255], [1, 0, 0], [0, 1, 0], 0.62, 0.01, { seg: 30, sec: 5 });
}

// ── standing figures ─────────────────────────────────────────────────────────
/** The long robe of a standing figure: a pleated shell from the waist to the hem. */
function longRobe(F, mat, top, hem, w, d, ph, a = 0.07, lod = 0) {
  tube(F.s(mat), [[0, top, 0, w * 0.62, d * 0.62], [0, top * 0.62 + hem * 0.38, 0, w * 0.76, d * 0.72], [0, hem + (top - hem) * 0.24, 0, w * 0.9, d * 0.85], [0, hem, 0.01, w, d]], { seg: lod ? 12 : 20, sub: 2, ref: [1, 0, 0], capN: 1, fold: (t, th) => 1 + a * (Math.cos(9 * th + 3 * t + ph) + 0.45 * Math.cos(17 * th + 5 * t + 2 * ph)) });
}

/** A standing disciple (Ananda young, Kasyapa old), o.age 0…1, hands joined at the breast, in a monk's robe and a kasaya over it. */
export function disciple(F, o = {}) {
  const lod = o.lod ?? 0, inner = o.inner ?? 'cloth_grey', outer = o.outer ?? 'cloth_ochre', old = o.age ?? 0.2, ph = o.ph ?? 0;
  longRobe(F, inner, 0.98, 0.03, 0.2, 0.15, ph, 0.06, lod);
  for (const s of [-1, 1]) blob(F.s('lacquer_black'), [s * 0.07, 0.025, 0.12], [0.05, 0.03, 0.09], 2, 6);                          // the shoes
  tube(F.s(inner), [[0, 0.98, 0, 0.17, 0.11], [0, 1.2, 0, 0.17, 0.115], [0, 1.4, 0, 0.2, 0.12], [0, 1.47, 0, 0.14, 0.095]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], fold: (t, th) => 1 + 0.03 * Math.cos(7 * th + 4 * t) });
  // the kasaya: from the left shoulder across the breast and the back to the right hip, a panelled cloth
  tube(F.s(outer), [[0.1, 1.46, 0.0, 0.15, 0.115], [0.02, 1.2, 0.0, 0.2, 0.125], [-0.04, 0.9, 0.0, 0.22, 0.14], [-0.04, 0.5, 0.0, 0.25, 0.17]], { seg: lod ? 10 : 16, sub: 2, ref: [1, 0, 0], fold: (t, th) => 1 + 0.06 * Math.cos(6 * th + 4 * t + ph) + 0.03 * Math.cos(15 * th + 9 * t) });
  for (const s of [-1, 1]) blob(F.s(inner), [s * 0.18, 1.43, 0.0], [0.065, 0.06, 0.065], 3, 8);
  const el = [[0.2, 1.17, 0.05], [-0.2, 1.17, 0.05]], wr = [[0.035, 1.33, 0.21], [-0.035, 1.33, 0.21]];
  for (const i of [0, 1]) {
    const sg = i ? -1 : 1;
    tube(F.s(inner), [[sg * 0.185, 1.43, 0, 0.055], [...el[i], 0.05], [wr[i][0] + sg * 0.03, wr[i][1] - 0.02, wr[i][2] - 0.06, 0.06]], { seg: 7, sub: 2, fold: (t, th) => 1 + 0.06 * Math.cos(5 * th + 3 * t) });   // the wide sleeves
    hand(F, o.skin ?? 'skin_light', [wr[i][0] * 0.4, wr[i][1], wr[i][2] - 0.02], [0, 0.55, 0.9], [sg, 0, 0], 0.9, lod);
  }
  tube(F.s(o.skin ?? 'skin_light'), [[0, 1.46, 0, 0.05], [0, 1.54, 0.01, 0.045]], { seg: 8, sub: 1, capN: 1 });
  head(F, [0, 1.64, 0.02], { kind: 'monk', skin: o.skin ?? 'skin_light', age: old, lod, longBrows: old > 0.6, beard: false });
  if (old > 0.6) for (const s of [-1, 1]) blob(F.s(o.skin ?? 'skin_light'), [s * 0.03, 1.69, 0.1], [0.02, 0.008, 0.01], 1, 5);
}

/** A guardian king in armour on a rock, 2.4 m at k = 1: o.skin (the face's paint), o.arm 'pipa' | 'sword' | 'snake' | 'umbrella', o.cloth (the skirt). */
export function king(F, o = {}) {
  const lod = o.lod ?? 0, skin = o.skin ?? 'paint_white', arm = o.arm ?? 'sword', gilt = F.s('gilt_bronze'), cl = o.cloth ?? 'clay_green', ph = o.ph ?? 0;
  const stone = F.s('granite_grey');
  blob(stone, [0, 0.14, 0.02], [0.62, 0.15, 0.5], 3, 10);                                                       // the rock he stands on
  blob(stone, [0.25, 0.22, 0.1], [0.3, 0.12, 0.26], 2, 8);
  // the legs, spread, in boots, the skirt of armour (tassets) over the thighs
  for (const s of [-1, 1]) {
    tube(F.s(cl), [[s * 0.2, 0.95, 0, 0.12], [s * 0.3, 0.6, 0.05, 0.1], [s * 0.34, 0.33, 0.06, 0.085]], { seg: 8, sub: 2, fold: (t, th) => 1 + 0.04 * Math.cos(6 * th + ph) });
    blob(F.s('lacquer_black'), [s * 0.36, 0.3, 0.1], [0.1, 0.12, 0.17], 3, 8);                               // the boots
    blob(F.s('lacquer_black'), [s * 0.36, 0.29, 0.16], [0.085, 0.07, 0.13], 2, 6);
  }
  longRobe(F, cl, 1.12, 0.62, 0.34, 0.2, ph, 0.04, lod);                                                       // the skirt
  for (let i = 0; i < (lod ? 5 : 9); i++) { const a = (i / (lod ? 4 : 8) - 0.5) * 2.3; blobDir(gilt, [Math.sin(a) * 0.33, 0.74, Math.cos(a) * 0.2 + 0.02], [Math.sin(a) * 0.2, -1, Math.cos(a) * 0.1], 0.15, 0.06, 0.015, [Math.cos(a), 0, -Math.sin(a)], 2, 6); }   // the plates
  // the trunk: breastplate and back, the belt with its beast-face buckle, the pauldrons
  tube(gilt, [[0, 1.0, 0, 0.27, 0.19], [0, 1.28, 0, 0.3, 0.2], [0, 1.52, 0, 0.36, 0.22], [0, 1.62, 0, 0.26, 0.15]], { seg: lod ? 10 : 14, sub: 2, ref: [1, 0, 0] });
  blob(F.s(cl), [0, 1.3, 0.08], [0.24, 0.2, 0.15], 3, 10);
  for (const s of [-1, 1]) { blob(gilt, [s * 0.15, 1.46, 0.185], [0.12, 0.095, 0.05], 3, 8); torus(F.s('lacquer_red'), [s * 0.15, 1.46, 0.2], [1, 0, 0], [0, 1, 0], 0.06, 0.012, { seg: 12, sec: 4 }); }
  tube(F.s('lacquer_red'), [[-0.3, 1.04, 0.06, 0.03], [-0.15, 1.04, 0.19, 0.03], [0.15, 1.04, 0.19, 0.03], [0.3, 1.04, 0.06, 0.03]], { seg: 6, sub: 2, capN: 1 });
  blob(gilt, [0, 1.04, 0.2], [0.08, 0.065, 0.03], 3, 8);
  for (const s of [-1, 1]) {
    blob(gilt, [s * 0.35, 1.62, 0.0], [0.17, 0.12, 0.15], 3, 9);                                                // the pauldrons
    blob(gilt, [s * 0.4, 1.66, 0.0], [0.1, 0.07, 0.11], 2, 8);
  }
  tube(F.s(skin), [[0, 1.62, 0, 0.09], [0, 1.74, 0.01, 0.085]], { seg: 8, sub: 1, capN: 1 });
  // the arms: the right raised with the weapon, the left at the hip or holding the second thing
  const R = { sh: [0.4, 1.58, 0.0], el: [0.62, 1.4, 0.22], wr: [0.5, 1.58, 0.5] }, L = { sh: [-0.4, 1.58, 0.0], el: [-0.58, 1.3, 0.14], wr: [-0.46, 1.08, 0.3] };
  if (arm === 'pipa') { R.el = [0.5, 1.2, 0.2]; R.wr = [0.2, 1.3, 0.46]; L.el = [-0.55, 1.38, 0.2]; L.wr = [-0.52, 1.62, 0.5]; }
  for (const [a, sg] of [[R, 1], [L, -1]]) {
    tube(F.s('cloth_green'), [[...a.sh, 0.09], [...a.el, 0.082]], { seg: 8, sub: 1 });
    tube(F.s(cl), [[...a.el, 0.08], [(a.el[0] + a.wr[0]) / 2, (a.el[1] + a.wr[1]) / 2, (a.el[2] + a.wr[2]) / 2, 0.082], [...a.wr, 0.06]], { seg: 8, sub: 1, fold: (t, th) => 1 + 0.07 * Math.cos(6 * th) });
    blob(gilt, a.el, [0.09, 0.09, 0.09], 2, 8);
    hand(F, skin, a.wr, [(a.wr[0] - a.el[0]), (a.wr[1] - a.el[1]), (a.wr[2] - a.el[2])], [sg, 0, 0], 1.3, lod);
  }
  head(F, [0, 1.88, 0.03], { kind: 'king', skin, helmet: 'gilt_bronze', beard: true, lod, k: 1.28 });
  // the attribute
  const m = F.s('bronze'), W = (p, k2) => [R.wr[0] + p[0] * k2, R.wr[1] + p[1] * k2, R.wr[2] + p[2] * k2];
  if (arm === 'sword') {
    rodT(m, W([0, -0.12, 0], 1), W([0, 0.0, 0], 1), 0.026);                                                    // the hilt
    rodT(F.s('steel_grey'), W([0, 0, 0], 1), W([0.05, 0.95, 0.05], 1), 0.034, 0.014);                                   // the blade, up
    rodT(m, W([-0.1, 0.0, 0], 1), W([0.1, 0.0, 0], 1), 0.016);
  } else if (arm === 'umbrella') {
    rodT(m, W([0, -0.4, 0], 1), W([0, 0.8, 0], 1), 0.014);
    const u = F.s('clay_robe');
    u.grid(Array.from({ length: 5 }, (_, i) => Array.from({ length: 16 }, (_, j) => { const th = j / 16 * TAU, rr = i / 4 * 0.58; return [R.wr[0] + Math.cos(th) * rr, R.wr[1] + 0.7 - rr * 0.34 + (j % 2 ? 0.015 : 0) * i, R.wr[2] + Math.sin(th) * rr]; })));
    blob(F.s('gilt_bronze'), [R.wr[0], R.wr[1] + 0.98, R.wr[2]], [0.035, 0.07, 0.035], 3, 6);
  } else if (arm === 'snake') {
    const p = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; p.push([R.wr[0] + Math.sin(t * 9) * 0.14, R.wr[1] - 0.2 + t * 0.9, R.wr[2] + Math.cos(t * 9) * 0.14, 0.04 - 0.018 * t]); }
    tube(F.s('clay_green'), p, { seg: 7, sub: 1, capN: 2 });
    blob(F.s('clay_green'), [R.wr[0] + Math.sin(9) * 0.14, R.wr[1] + 0.7, R.wr[2] + Math.cos(9) * 0.14], [0.05, 0.035, 0.065], 3, 7);
  } else if (arm === 'pipa') {
    // the lute: a pear-shaped body held across the breast, a long neck with its bent head
    const c0 = [0.12, 1.28, 0.5];
    blob(F.s('lacquer_chestnut'), c0, [0.17, 0.16, 0.035], 3, 12);
    rodT(F.s('lacquer_chestnut'), [c0[0] + 0.02, c0[1] + 0.12, c0[2]], [-0.4, 1.74, 0.5], 0.026, 0.02);
    blob(F.s('lacquer_chestnut'), [-0.46, 1.78, 0.5], [0.04, 0.07, 0.03], 2, 6);
    for (let i = 0; i < 4; i++) rodT(F.s('gilt_bronze'), [c0[0] + 0.03 + i * 0.012, c0[1] + 0.02, c0[2] + 0.04], [-0.44, 1.76, 0.52], 0.0035);
  }
}

// ── the arhats (lohans) ──────────────────────────────────────────────────────
const ROBES = ['cloth_ochre', 'cloth_red', 'cloth_grey', 'cloth_brown', 'cloth_green', 'cloth_maroon'];
/**
 * An arhat seated cross-legged, the seat at y = 0, about 1.0 m to the crown at k = 1. o.v (0…7) is the pose: 0 hands in the lap, 1 right hand raised
 * in teaching, 2 holding a staff, 3 a scroll open on the knee, 4 an elbow on the knee, the chin on the hand, 5 hands on the knees looking up, 6 an alms bowl,
 * 7 a fan. The robe, the beard, the brows and the age follow the hash of o.seed.
 */
export function lohan(F, o = {}) {
  const lod = o.lod ?? 1, v = ((o.v ?? 0) % 8 + 8) % 8, h = (k) => hash3(o.seed ?? 1, k, v), robe = o.robe ?? ROBES[Math.floor(h(1) * ROBES.length)], under = ROBES[Math.floor(h(2) * ROBES.length)];
  const skin = h(3) < 0.5 ? 'skin_light' : 'skin_medium', R = F.s(robe), U = F.s(under), lean = (h(4) - 0.5) * 0.12, seg = lod ? 7 : 9;
  const fold = (ph) => (t, th) => 1 + 0.06 * Math.cos(5 * th + 3 * t + ph);
  tube(U, [[-0.3, 0.08, 0.14, 0.075], [-0.18, 0.07, 0.3, 0.07], [0.1, 0.1, 0.32, 0.06]], { seg, sub: 1, fold: fold(0) });
  tube(U, [[0.3, 0.08, 0.14, 0.075], [0.18, 0.07, 0.28, 0.07], [-0.08, 0.09, 0.3, 0.06]], { seg, sub: 1, fold: fold(2) });
  blob(U, [0, 0.07, 0.12], [0.3, 0.07, 0.19], 2, 9);
  tube(R, [[lean, 0.08, 0, 0.2, 0.14], [lean * 1.4, 0.3, 0.0, 0.185, 0.13], [lean * 1.8, 0.5, 0, 0.215, 0.14], [lean * 2, 0.58, 0.0, 0.15, 0.1]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0], fold: fold(1) });
  tube(R, [[lean * 1.8, 0.58, 0, 0.16, 0.11], [lean * 1.9, 0.5, -0.02, 0.19, 0.15]], { seg: 8, sub: 1, ref: [1, 0, 0], capN: 1 });          // the cowl at the nape
  blob(F.s(under), [lean * 1.9, 0.5, 0.075], [0.07, 0.1, 0.045], 2, 7);                                                          // the inner robe at the breast
  for (const s of [-1, 1]) blob(R, [s * 0.19 + lean * 1.8, 0.52, 0], [0.05, 0.045, 0.05], 2, 7);
  tube(F.s(skin), [[lean * 1.9, 0.57, 0, 0.042], [lean * 2.1, 0.64, 0.01, 0.038]], { seg: 7, sub: 1, capN: 1 });
  const hy = 0.74, hx = lean * 2.2;
  const sh = [[0.19 + hx, 0.52, 0], [-0.19 + hx, 0.52, 0]];
  const arm = (i, el, wr, fingers = 'hand') => {
    const a = sh[i], sg = i ? -1 : 1;
    tube(R, [[...a, 0.05], [...el, 0.046], [(el[0] + wr[0]) / 2 + sg * 0.01, (el[1] + wr[1]) / 2, (el[2] + wr[2]) / 2, 0.055], [wr[0] - (wr[0] - el[0]) * 0.1, wr[1] - (wr[1] - el[1]) * 0.1, wr[2] - (wr[2] - el[2]) * 0.1, 0.045]], { seg: 7, sub: 1, fold: fold(i) });
    if (fingers) hand(F, skin, wr, [wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]], [sg, 0.5, 0], 0.8, lod);
  };
  let extra = null;
  switch (v) {
    case 1: arm(0, [0.3, 0.38, 0.12], [0.38, 0.62, 0.25]); arm(1, [-0.27, 0.3, 0.13], [-0.1, 0.2, 0.3]); break;
    case 2: arm(0, [0.3, 0.35, 0.14], [0.3, 0.25, 0.3]); arm(1, [-0.27, 0.32, 0.14], [-0.2, 0.22, 0.3]); extra = 'staff'; break;
    case 3: arm(0, [0.26, 0.3, 0.16], [0.1, 0.2, 0.32]); arm(1, [-0.26, 0.3, 0.16], [-0.1, 0.2, 0.32]); extra = 'scroll'; break;
    case 4: arm(0, [0.3, 0.38, 0.16], [0.14, 0.55, 0.14]); arm(1, [-0.27, 0.3, 0.14], [-0.2, 0.17, 0.28]); break;
    case 5: arm(0, [0.3, 0.34, 0.14], [0.27, 0.19, 0.3]); arm(1, [-0.3, 0.34, 0.14], [-0.27, 0.19, 0.3]); break;
    case 6: arm(0, [0.28, 0.32, 0.15], [0.1, 0.2, 0.3]); arm(1, [-0.28, 0.32, 0.15], [-0.1, 0.2, 0.3]); extra = 'bowl'; break;
    case 7: arm(0, [0.3, 0.4, 0.14], [0.34, 0.5, 0.3]); arm(1, [-0.27, 0.3, 0.14], [-0.18, 0.2, 0.3]); extra = 'fan'; break;
    default: arm(0, [0.26, 0.3, 0.15], [0.05, 0.19, 0.31]); arm(1, [-0.26, 0.3, 0.15], [-0.05, 0.19, 0.31]);
  }
  if (extra === 'staff') rodT(F.s('timber'), [0.3, 0.0, 0.32], [0.3, 1.1, 0.3], 0.02);
  if (extra === 'scroll') { blob(F.s('paint_white'), [0, 0.2, 0.32], [0.17, 0.012, 0.075], 1, 8); rodT(F.s('lacquer_chestnut'), [-0.18, 0.2, 0.32], [0.18, 0.2, 0.32], 0.012); }
  if (extra === 'bowl') F.s('bronze').grid(Array.from({ length: 4 }, (_, i) => Array.from({ length: 12 }, (_, j) => { const th = j / 12 * TAU, a = i / 3 * PI / 2; return [Math.cos(th) * Math.sin(a) * 0.09, 0.28 - Math.cos(a) * 0.07, 0.3 + Math.sin(th) * Math.sin(a) * 0.09]; })));
  if (extra === 'fan') blob(F.s('paint_white'), [0.36, 0.55, 0.3], [0.1, 0.12, 0.008], 2, 8);
  const old = h(5);
  head(F, [hx, hy, 0.02], { kind: 'monk', skin, age: old, lod, beard: h(6) < 0.35, longBrows: h(7) < 0.4, k: 1, beardMat: old > 0.6 ? 'paint_white' : 'hair_dark' });
  // the seat: a cushion or a rock
  if (h(8) < 0.5) blob(F.s('cloth_red'), [0, -0.03, 0.1], [0.46, 0.05, 0.38], 2, 10); else blob(F.s('granite_grey'), [0, -0.1, 0.05], [0.52, 0.12, 0.42], 2, 9);
}

/** A bodhisattva or an attendant standing (a lay figure in a long robe), for the side altars: o.female, o.robe. */
export function attendant(F, o = {}) {
  const lod = o.lod ?? 1, G = F.s('gilt_bronze'), cl = o.robe ?? 'cloth_red';
  longRobe(F, cl, 0.95, 0.03, 0.2, 0.15, o.ph ?? 0, 0.07, lod);
  tube(F.s(cl), [[0, 0.95, 0, 0.14, 0.1], [0, 1.2, 0, 0.16, 0.11], [0, 1.38, 0, 0.2, 0.115], [0, 1.45, 0, 0.12, 0.09]], { seg: lod ? 8 : 12, sub: 2, ref: [1, 0, 0] });
  for (const s of [-1, 1]) {
    tube(F.s(cl), [[s * 0.18, 1.4, 0, 0.05], [s * 0.2, 1.17, 0.06, 0.046], [s * 0.1, 1.2, 0.2, 0.04]], { seg: 7, sub: 1 });
    hand(F, 'skin_light', [s * 0.06, 1.24, 0.24], [-s * 0.2, 0.2, 1], [0, 1, 0], 0.8, lod);
  }
  tube(F.s('skin_light'), [[0, 1.44, 0, 0.045], [0, 1.52, 0.01, 0.04]], { seg: 7, sub: 1, capN: 1 });
  head(F, [0, 1.62, 0.02], { kind: 'lay', skin: 'skin_light', lod, hairStyle: 'knot', hair: 'hair_dark', age: 0.1 });
  torus(G, [0, 1.62, -0.08], [1, 0, 0], [0, 1, 0], 0.17, 0.008, { seg: 20, sec: 4 });
  void sheet;
}
