// The people of the Parthenon's sculpture (docs/settlements/athens.md §4a, §4h): men and women of the gods' company in
// the round, from a skeleton. A pose gives the joints of the trunk, the head, the feet and the wrists; the knees and
// elbows come from two-bone solutions (ik2), so a leg that bends does it at a knee that is where a knee is. The body is
// then lofted: a trunk with its breast and ribs, rounded limbs with their muscle (a tube whose section swells and
// narrows), a neck, a head with brow, nose, lips and hair; the cloth follows the body (pleats that run with each limb
// and turn at the knee, a mantle across the chest, the hem flaring at the ankle). The same figure is built flat for
// relief (reliefOf): its depth squeezed so that a metope or a frieze keeps its modelled surface in a few centimetres.
// Height 1 (feet at y = 0, facing +z, her right at −x); scaled by the caller. Standing women in the peplos are
// figures.peplosFigure; everything else is here.

import { Matrix4, Vector3, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { merge } from '../../styles/greek/columns.js';
import { tube, loft, limb, blob } from './figures.js';

const TAU = Math.PI * 2;
const A = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len: (a) => Math.hypot(a[0], a[1], a[2]),
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
};
/** Two bones a–m–c of lengths l1, l2: the middle joint, bent toward `bend`; the end is pulled in if out of reach. */
export function ik2(a, c, l1, l2, bend) {
  let d = A.sub(c, a), L = A.len(d);
  const reach = (l1 + l2) * 0.998;
  if (L > reach) { c = A.add(a, A.mul(d, reach / L)); d = A.sub(c, a); L = reach; }
  L = Math.max(L, Math.abs(l1 - l2) + 1e-3);
  const dn = A.mul(d, 1 / (A.len(d) || 1)), x = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  let b = A.sub(bend, A.mul(dn, A.dot(bend, dn))); const bl = A.len(b);
  b = bl < 1e-4 ? [0, 0, 1] : A.mul(b, 1 / bl);
  return { mid: A.add(A.add(a, A.mul(dn, x)), A.mul(b, h)), end: c };
}

// ── poses: the trunk, the head, the shoulders, the ankles and the wrists, in units of the height ─────────────
const POSES = {
  stand: { pelvis: [0, 0.515, 0], chest: [0, 0.67, 0.004], neck: [0, 0.815, 0.01], head: [0, 0.915, 0.02], shR: [-0.118, 0.79, 0], shL: [0.118, 0.79, 0], anR: [-0.065, 0.04, 0], anL: [0.065, 0.04, 0.01], wrR: [-0.155, 0.495, 0.02], wrL: [0.155, 0.495, 0.02] },
  // the weight on her right leg, the other knee forward, the hip dropped
  ease: { pelvis: [0.012, 0.512, 0], chest: [-0.002, 0.668, 0.004], neck: [-0.008, 0.813, 0.01], head: [-0.012, 0.915, 0.025], shR: [-0.118, 0.8, 0], shL: [0.118, 0.782, 0], hipR: [-0.045, 0.518, 0], hipL: [0.072, 0.494, 0],
    anR: [-0.06, 0.04, -0.005], anL: [0.105, 0.04, 0.065], wrR: [-0.16, 0.49, 0.02], wrL: [0.15, 0.5, 0.05] },
  // a long step to the right (+x), the right (back) leg straight behind
  stride: { pelvis: [0.01, 0.47, 0], chest: [0.03, 0.635, 0.005], neck: [0.065, 0.775, 0.01], head: [0.09, 0.86, 0.025], shR: [-0.06, 0.765, -0.035], shL: [0.14, 0.775, 0.035], anR: [-0.3, 0.04, -0.02], anL: [0.31, 0.04, 0.03], wrR: [-0.1, 0.62, 0.02], wrL: [0.28, 0.7, 0.08] },
  // seated on a block, the hands in the lap
  seat: { pelvis: [0, 0.3, -0.02], chest: [0, 0.45, -0.03], neck: [0, 0.585, -0.04], head: [0, 0.685, -0.025], shR: [-0.118, 0.575, -0.04], shL: [0.118, 0.575, -0.04], hipR: [-0.058, 0.3, 0], hipL: [0.058, 0.3, 0],
    anR: [-0.085, 0.04, 0.26], anL: [0.085, 0.04, 0.275], wrR: [-0.11, 0.34, 0.15], wrL: [0.115, 0.35, 0.16], legBend: [0, 1, 1] },
  // reclining on the left elbow toward the viewer's left, the legs out to the right (the corner figures)
  recline: { pelvis: [0.03, 0.13, 0], chest: [-0.1, 0.25, 0.01], neck: [-0.215, 0.345, 0.0], head: [-0.255, 0.43, 0.035], shR: [-0.16, 0.385, 0.06], shL: [-0.285, 0.275, -0.05], hipR: [0.0, 0.15, 0.06], hipL: [0.05, 0.1, -0.05],
    anR: [0.44, 0.17, 0.09], anL: [0.5, 0.04, -0.01], wrR: [-0.02, 0.2, 0.1], wrL: [-0.32, 0.04, 0.03], legBend: [0.2, 1, 0.5], armBendL: [0, 0.4, -1] },
  // fallen and propped on one arm
  fallen: { pelvis: [0.04, 0.1, 0], chest: [-0.12, 0.185, 0.01], neck: [-0.27, 0.25, 0.0], head: [-0.34, 0.29, 0.03], shR: [-0.2, 0.275, 0.06], shL: [-0.33, 0.2, -0.05], hipR: [0.06, 0.12, 0.05], hipL: [0.02, 0.085, -0.04],
    anR: [0.38, 0.05, 0.07], anL: [0.5, 0.04, -0.03], wrR: [-0.27, 0.5, 0.1], wrL: [-0.37, 0.04, 0.03], legBend: [0, 1, 0.6] },
};
const LEG = [0.245, 0.245], ARM = [0.168, 0.156];

/** The joints of a pose with the knees and elbows solved: { pelvis, chest, neck, head, shR, shL, hipR, hipL, knR, knL, anR, anL, elR, elL, wrR, wrL }. */
export function skeleton(o = {}) {
  const P = POSES[o.pose ?? 'stand'], J = {};
  for (const k in P) J[k] = Array.isArray(P[k]) ? P[k].slice() : P[k];
  const set = (src) => { for (const k in src ?? {}) J[k] = Array.isArray(src[k]) ? src[k].slice() : src[k]; };
  set(o.J);
  if (o.arms) { if (o.arms.R) J.wrR = o.arms.R.slice(); if (o.arms.L) J.wrL = o.arms.L.slice(); }
  if (o.feet) { if (o.feet.R) J.anR = o.feet.R.slice(); if (o.feet.L) J.anL = o.feet.L.slice(); }
  if (o.lean) {                                                     // the trunk and head turned about the pelvis, degrees (+: toward +x)
    const a = o.lean * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    for (const k of ['chest', 'neck', 'head', 'shR', 'shL']) { const p = A.sub(J[k], J.pelvis); J[k] = A.add(J.pelvis, [p[0] * c + p[1] * s, -p[0] * s + p[1] * c, p[2]]); }
  }
  if (o.pitch) {                                                    // the trunk bent forward (+) or back, degrees
    const a = o.pitch * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    for (const k of ['chest', 'neck', 'head', 'shR', 'shL']) { const p = A.sub(J[k], J.pelvis); J[k] = A.add(J.pelvis, [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]); }
  }
  J.hipR ??= A.add(J.pelvis, [-0.055, 0, 0]); J.hipL ??= A.add(J.pelvis, [0.055, 0, 0]);
  const lb = P.legBend ?? [0, 0.1, 1];
  for (const s of ['R', 'L']) {
    const sg = s === 'R' ? -1 : 1;
    const kn = ik2(J['hip' + s], J['an' + s], LEG[0], LEG[1], o['legBend' + s] ?? [lb[0] + sg * 0.12, lb[1], lb[2]]);
    J['kn' + s] = kn.mid; J['an' + s] = kn.end;
    const el = ik2(J['sh' + s], J['wr' + s], ARM[0], ARM[1], o['armBend' + s] ?? P['armBend' + s] ?? [sg * 0.35, -0.45, -0.8]);
    J['el' + s] = el.mid; J['wr' + s] = el.end;
  }
  if (o.mirror) { const M = {}; for (const k in J) { const m = k.endsWith('L') ? k.slice(0, -1) + 'R' : k.endsWith('R') ? k.slice(0, -1) + 'L' : k; M[m] = [-J[k][0], J[k][1], J[k][2]]; } return M; }
  return J;
}

// ── the head ────────────────────────────────────────────────────────────────────────────────
/** A bump of the section at angle c, width w (a Gaussian round the tube). */
const around = (th, c, w) => { const d = Math.atan2(Math.sin(th - c), Math.cos(th - c)) / w; return Math.exp(-d * d); };
const bell = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));

/**
 * The head at the origin (the centre of the skull), height of the whole figure 1: o.hair ('curls' | 'waves' | 'long' | 'bun' | 'rope' | 'cap' | 'none'),
 * o.beard (true: a full beard and moustache), o.helmet, o.female, o.lod. Returns { stone, metal } lists.
 */
export function headOf(o = {}) {
  const stone = [], metal = [], lod = o.lod ?? 0, fine = lod === 0, S = (v) => v, F = !!o.female;
  const sk = (g) => stone.push(g);
  sk(blob([0, 0, 0.012], 0.056, [0.84, 1.1, 1.0], fine ? 10 : 7));                                                 // the skull and face
  sk(blob([0, -0.052, 0.04], F ? 0.024 : 0.028, [0.9, 0.78, 0.9], 8));                                           // the chin
  sk(limb([0, 0.0, 0.058], [0, -0.034, 0.075], 0.0115, 0.0088, 5));                                              // the nose
  if (fine) {
    sk(blob([0, -0.036, 0.07], 0.0078, [1.5, 0.8, 0.8], 5));                                                      // the nostrils
    sk(limb([-0.027, 0.023, 0.052], [0.027, 0.023, 0.052], F ? 0.0058 : 0.0075, F ? 0.0058 : 0.0075, 5));         // the brow
    for (const s of [-1, 1]) {
      sk(blob([s * 0.025, 0.007, 0.049], 0.0092, [1.15, 0.6, 0.55], 6));                                          // the eyelids
      sk(blob([s * 0.05, -0.012, -0.004], 0.011, [0.45, 1.1, 0.7], 4));                                           // the ears
      
    }
    sk(blob([0, -0.044, 0.062], 0.0105, [1.9, 0.55, 0.6], 6));                                                    // the lips
  }
  const hr = [];
  const hy = 0.0, hz = 0.012;
  const hairKind = o.hair ?? (F ? 'long' : 'curls');
  if (o.helmet) {
    metal.push(blob([0, hy + 0.03, hz - 0.012], 0.067, [0.93, 0.9, 1.14], fine ? 12 : 8));                         // the bowl
    for (const s of [-1, 1]) {
      metal.push(blob([s * 0.049, hy - 0.004, hz + 0.014], 0.034, [0.26, 1.55, 1.0], 7));                          // the cheek-pieces, hinged up
      metal.push(limb([s * 0.018, hy + 0.052, hz + 0.058], [s * 0.054, hy + 0.04, hz + 0.04], 0.0085, 0.0085, 4));
    }
    metal.push(blob([0, hy - 0.026, hz - 0.066], 0.04, [1.35, 0.7, 0.42], 7));
    metal.push(limb([0, hy + 0.088, hz + 0.036], [0, hy + 0.098, hz - 0.07], 0.012, 0.011, 5));
    if (fine) for (let k = 0; k < 9; k++) { const t = k / 8; metal.push(blob([0, hy + 0.12 + Math.sin(t * 3.1) * 0.052, hz + 0.02 - t * 0.14], 0.022 - 0.003 * t, [0.35, 1.0, 1.0], 5)); }
    else metal.push(blob([0, hy + 0.14, hz - 0.04], 0.04, [0.35, 1.0, 2.2], 6));
    for (const s of [-1, 1]) hr.push(blob([s * 0.046, hy - 0.004, hz - 0.002], 0.014, [0.8, 1.1, 1.0], 5));
  } else if (hairKind !== 'none') {
    hr.push(blob([0, hy + 0.012, hz - 0.012], 0.058, [0.89, 1.02, 1.04], fine ? 10 : 7));
    if (hairKind === 'curls') {
      // short curls in rows over the brow and round the head
      if (fine) for (let i = -3; i <= 3; i++) { const a = i * 0.4; hr.push(blob([Math.sin(a) * 0.05, hy + 0.045 - Math.abs(i) * 0.003, hz + Math.cos(a) * 0.044], 0.0145, [1, 0.85, 1], 5)); }
      if (fine) for (let i = 0; i < 6; i++) { const a = 1.3 + (i / 6) * (TAU - 2.6); hr.push(blob([Math.sin(a) * 0.05, hy + 0.04, hz - 0.012 + Math.cos(a) * 0.048], 0.014, [1, 0.9, 1], 5)); }
    } else {
      if (fine) for (let i = -3; i <= 3; i++) { const a = i * 0.4; hr.push(blob([Math.sin(a) * 0.045, hy + 0.043 - Math.abs(i) * 0.003, hz + Math.cos(a) * 0.041], 0.0155, [1.1, 0.8, 1.0], 5)); }
      if (fine) for (const s of [-1, 1]) for (let j = 0; j < 2; j++) hr.push(blob([s * 0.047, hy - 0.003 - j * 0.016, hz - j * 0.004], 0.014, [0.8, 1.1, 1.0], 5));
      if (hairKind === 'rope') {
        for (let k = 0; k < 9; k++) { const t = k / 8, y = -0.04 - t * 0.27, z = -0.034 - t * 0.026, w = 0.026 - t * 0.006; for (const s of [-1, 0, 1]) hr.push(blob([s * w * 0.7, y - s * 0.006 * Math.sin(k), z], 0.016 - t * 0.003, [0.95, 1.25, 0.9], 5)); }
      } else if (hairKind === 'bun') hr.push(blob([0, -0.04, hz - 0.058], 0.032, [1, 1.05, 0.9], 8));
      else if (hairKind === 'long') {
        hr.push(tube([[0, 0.0, -0.05], [0, -0.1, -0.062], [0, -0.2, -0.05]], [[0.04, 0.02], [0.046, 0.026], [0.04, 0.02]], { seg: 6 }));
        for (const s of [-1, 1]) hr.push(tube([[s * 0.046, -0.02, -0.012], [s * 0.055, -0.1, -0.03], [s * 0.052, -0.19, -0.04]], [0.015, 0.017, 0.012], { seg: 5, sub: 0 }));
      }
    }
  }
  if (o.beard) {
    // the beard: a mass along the jaw, a point at the chin, the moustache over the lips
    hr.push(blob([0, -0.045, 0.036], 0.04, [1.0, 1.0, 0.9], 8));
    for (const s of [-1, 1]) hr.push(blob([s * 0.036, -0.03, 0.026], 0.028, [0.7, 1.2, 1.2], 6), blob([s * 0.014, -0.046, 0.065], 0.016, [1.4, 0.55, 0.7], 5));
    hr.push(blob([0, -0.088, 0.046], 0.021, [1, 1.7, 0.9], 6));
  }
  return { stone: [...stone, ...hr], metal, S };
}

// ── the body ────────────────────────────────────────────────────────────────────────────────
const placeAt = (parts, m) => parts.map((g) => g.applyMatrix4(m));

/**
 * A figure: { pose, drape ('nude' | 'chiton' | 'peplos' | 'mantle'), female, hair, beard, helmet, lod (0 full, 1 reduced, 2 least), mirror,
 * arms { R, L } (wrist targets), feet { R, L }, J (joint overrides), lean (degrees), look (head turned, degrees), seat (a block under a
 * seated figure), cloak (a mantle falling from the shoulders), attributes: spear, axe, trident, shield, wreath }.
 * Returns { stone, metal } (lists of geometries; metal: bronze or iron) at height 1.
 */
export function bodyOf(o = {}) {
  const J = skeleton(o), lod = o.lod ?? 0, fine = lod === 0, seg = lod === 2 ? 5 : lod === 1 ? 7 : 9, sub = lod === 0 ? 1 : 0;
  const F = !!o.female, drape = o.drape ?? 'nude', stone = [], metal = [];
  const sgm = o.mirror ? -1 : 1;                                        // (J is already mirrored: the pieces' own sides follow it)
  const side = A.norm(A.sub(J.shL, J.shR)), P = (g) => stone.push(g);
  const T = { seg, sub };
  const nude = drape === 'nude' || drape === 'mantle';
  // ── the trunk: pelvis, waist, ribs, shoulders
  const spine = [J.pelvis, A.lerp(J.pelvis, J.chest, 0.55), J.chest, A.lerp(J.chest, J.neck, 0.72)];
  const k = F ? 0.92 : 1;
  const trunkMod = (th, t) => {
    let m = 1;
    if (!F && nude) {
      m += 0.09 * (around(th, Math.PI / 2 - 0.55, 0.4) + around(th, Math.PI / 2 + 0.55, 0.4)) * bell(t, 0.72, 0.17);               // the pectorals
      m -= 0.035 * around(th, Math.PI / 2, 0.14) * bell(t, 0.5, 0.45);                                                              // the midline
      m += 0.03 * (around(th, Math.PI / 2 - 0.3, 0.2) + around(th, Math.PI / 2 + 0.3, 0.2)) * (bell(t, 0.28, 0.07) + bell(t, 0.42, 0.07) + bell(t, 0.56, 0.07));   // the abdomen's blocks
      m += 0.025 * (around(th, 0, 0.4) + around(th, Math.PI, 0.4)) * bell(t, 0.35, 0.25);                                          // the flanks
    }
    if (F) m += 0.07 * (around(th, Math.PI / 2 - 0.5, 0.33) + around(th, Math.PI / 2 + 0.5, 0.33)) * bell(t, 0.74, 0.1);          // the breasts under the cloth
    return m;
  };
  P(tube(spine, [[0.086 * k, 0.062 * k], [0.072 * k, 0.054], [0.096 * k, 0.068], [0.092 * k, 0.056]], { ...T, side, mod: trunkMod, seg: seg + 3, sub: lod === 0 ? 2 : 0 }));
  P(blob(A.add(J.pelvis, [0, -0.03, 0]), 0.09, [1.05, 0.8, 0.78], 8));                                                              // the hips
  // the neck and the shoulders
  const nk = A.lerp(J.neck, J.head, 0.55);
  P(tube([A.lerp(J.chest, J.neck, 0.7), J.neck, nk], [[0.045, 0.04], [0.032, 0.031], [0.03, 0.03]], { seg: 7, sub: 0, side: [1, 0, 0] }));
  for (const s of ['R', 'L']) P(blob(J['sh' + s], 0.04, [1, 0.95, 0.95], 7));
  // ── the limbs: muscle in the profile of the tube (rows: top, the belly of the muscle, the narrowing, the end)
  const limbTube = (a, b, rows, mod = null, sideRef = [1, 0, 0]) => P(tube([a, A.lerp(a, b, 0.33), b], [rows[0], rows[1], rows[3]], { ...T, side: sideRef, mod }));
  const dressedArm = drape === 'chiton' || drape === 'peplos';
  for (const s of ['R', 'L']) {
    const sg = s === 'R' ? -1 : 1;
    limbTube(J['sh' + s], J['el' + s], dressedArm ? [[0.037, 0.037], [0.04, 0.039], [0.033, 0.033], [0.028, 0.028]] : [[0.036, 0.037], [0.041, 0.039], [0.032, 0.031], [0.027, 0.027]]);
    P(blob(J['el' + s], 0.028, [1, 1, 1], 6));
    limbTube(J['el' + s], J['wr' + s], [[0.03, 0.03], [0.032, 0.031], [0.022, 0.021], [0.017, 0.016]], (th, t) => 1 + 0.07 * around(th, Math.PI / 2, 0.8) * bell(t, 0.2, 0.25));
    // the hand: the palm, four fingers a little curled, the thumb
    const dir = A.norm(A.sub(J['wr' + s], J['el' + s])), hp = A.add(J['wr' + s], A.mul(dir, 0.034));
    P(blob(hp, 0.02, [1, 1, 1], 6).applyMatrix4(new Matrix4().identity()));
    if (fine) {
      const outv = A.norm(A.cross(dir, [0, 0, 1])), curl = A.norm(A.add(dir, [0, 0, 0.35]));
      const base = A.add(J['wr' + s], A.mul(dir, 0.055));
      for (const f of [-1, 1]) { const fb = A.add(base, A.mul(outv, f * 0.009)); P(tube([fb, A.add(fb, A.mul(dir, 0.028)), A.add(A.add(fb, A.mul(dir, 0.05)), A.mul(curl, 0.012))], [[0.0105, 0.009], [0.009, 0.008], [0.0065, 0.006]], { seg: 5, sub: 0 })); }
      P(tube([A.add(J['wr' + s], A.mul(dir, 0.03)), A.add(A.add(J['wr' + s], A.mul(dir, 0.05)), A.mul(outv, -sg * 0.018)), A.add(A.add(J['wr' + s], A.mul(dir, 0.065)), A.mul(outv, -sg * 0.018))], [0.0085, 0.0075, 0.006], { seg: 5, sub: 0 }));
    } else P(blob(A.add(hp, A.mul(dir, 0.03)), 0.016, [0.7, 1, 0.7], 5));
    // legs
    const hip = J['hip' + s], kn = J['kn' + s], an = J['an' + s];
    const clothLegs = drape === 'peplos';
    if (!clothLegs) {
      limbTube(hip, kn, [[0.066, 0.07], [0.073, 0.077], [0.056, 0.058], [0.043, 0.043]], (th, t) => 1 + 0.08 * around(th, Math.PI * 1.5, 0.9) * bell(t, 0.35, 0.3));
      P(blob(kn, 0.043, [1, 1, 1], 6));
      limbTube(kn, an, [[0.043, 0.045], [0.046, 0.052], [0.03, 0.032], [0.021, 0.021]], (th, t) => 1 + 0.11 * around(th, Math.PI / 2 * (A.sub(an, kn)[1] < 0 ? 1 : 3), 0.9) * bell(t, 0.25, 0.22));
    }
    // the foot, the sole on the ground
    const fz = Math.max(0.02, Math.min(0.1, 0.04 + (an[1] < 0.08 ? 0.05 : 0)));
    P(tube([[an[0], an[1] + 0.005, an[2] - 0.012], [an[0], an[1] - 0.012, an[2] + 0.04], [an[0], Math.max(0.006, an[1] - 0.03), an[2] + 0.055 + fz]], [[0.021, 0.022], [0.021, 0.016], [0.018, 0.009]], { seg: 6, sub: 0 }));
  }
  // ── the head
  const head = headOf({ hair: o.hair, beard: o.beard, helmet: o.helmet, female: F, lod });
  const hm = new Matrix4().makeTranslation(...J.head).multiply(new Matrix4().makeRotationY((o.look ?? 0) * Math.PI / 180 * sgm));
  for (const g of head.stone) P(g.applyMatrix4(hm));
  for (const g of head.metal) metal.push(g.applyMatrix4(hm));
  // ── the cloth
  // a long skirt over both legs (standing figures): the cloth falls from the hips in pleats that flare toward the hem
  const skirt = (hemY, K, amp) => {
    const hip = A.lerp(J.hipR, J.hipL, 0.5), ak = A.lerp(J.anR, J.anL, 0.5), kk = A.lerp(J.knR, J.knL, 0.5);
    const at = (y) => (y > kk[1] ? A.lerp(hip, kk, (hip[1] - y) / Math.max(0.01, hip[1] - kk[1])) : A.lerp(kk, ak, (kk[1] - y) / Math.max(0.01, kk[1] - ak[1])));
    const ys = [J.pelvis[1] + 0.02, hip[1] - 0.12, kk[1] + 0.02, (kk[1] + hemY) / 2, hemY];
    const wid = Math.abs(J.anR[0] - J.anL[0]) * 0.5 + Math.abs(J.knR[0] - J.knL[0]) * 0.1;
    const rad = [[0.112, 0.088], [0.118, 0.092], [0.122 + wid * 0.3, 0.098], [0.13 + wid * 0.5, 0.104], [0.145 + wid * 0.6, 0.112]];
    P(tube(ys.map((y) => { const c = at(Math.min(y, hip[1])); return [c[0], y, c[2]]; }), rad, { ...T, seg: seg * 3 + 3, sub: 1, side: [1, 0, 0], capB: false, capA: false,
      mod: (th, t) => 1 + amp * (0.6 + 0.4 * t) * (Math.pow(Math.abs(Math.sin(0.5 * (K * th + 2.2 * t))), 0.7) - 0.62) * 2.2 }));
  };
  const front = (th) => around(th, Math.PI / 2, 1.0);
  if (drape === 'peplos' || drape === 'chiton') {
    // the garment over the trunk: a shell from the hips to the shoulders with its fall under the breast, and over each leg a pleated sleeve of cloth
    const cm = (th, t) => 1 + 0.03 * Math.cos(9 * th + 5 * t) + (F ? 0.06 * (around(th, Math.PI / 2 - 0.5, 0.33) + around(th, Math.PI / 2 + 0.5, 0.33)) * bell(t, 0.7, 0.1) : 0);
    P(tube([A.add(J.pelvis, [0, -0.02, 0]), A.lerp(J.pelvis, J.chest, 0.55), J.chest, A.lerp(J.chest, J.neck, 0.7)], [[0.1, 0.075], [0.08, 0.06], [0.104, 0.072], [0.1, 0.06]], { ...T, side, mod: cm, seg: seg + 4, sub: 1 }));
    const walking = o.pose === 'stand' || o.pose === 'ease';
    if (walking) skirt(0.035, 16, 0.07);
    else for (const s of ['R', 'L']) {
      const hip = J['hip' + s], kn = J['kn' + s], an = J['an' + s], ph = s === 'R' ? 0 : 1.7;
      const fold = (th, t) => 1 + 0.1 * Math.cos(7 * th + 5 * t + ph) + 0.04 * Math.cos(14 * th + 9 * t) + (t > 0.9 ? 0.18 * (t - 0.9) * 10 : 0);
      P(tube([A.lerp(J.pelvis, hip, 0.4), hip, A.lerp(hip, kn, 0.55), kn, A.lerp(kn, an, 0.5), A.add(an, [0, 0.015, 0])], [[0.085, 0.08], [0.082, 0.078], [0.075, 0.074], [0.066, 0.068], [0.055, 0.058], [0.062, 0.064]], { ...T, side: [1, 0, 0], mod: fold, seg: seg + 2, sub: 1 }));
    }
    // the overfold: a short skirt of cloth hanging from the waist, its hem dipping
    const sk = loft([{ y: 0, cx: 0, cz: 0.0, rx: 0.135, rz: 0.1 }, { y: 0.07, cx: 0, cz: 0, rx: 0.124, rz: 0.094 }, { y: 0.13, cx: 0, cz: 0, rx: 0.114, rz: 0.088 }], seg * 5, (th, y) => 1 + 0.06 * Math.cos(10 * th + 8 * y) * front(th) + 0.02 * Math.cos(5 * th), 1);
    sk.applyMatrix4(new Matrix4().makeTranslation(J.pelvis[0], J.pelvis[1] - 0.04, J.pelvis[2] + 0.004));
    if (!(o.pose === 'seat' || o.pose === 'recline' || o.pose === 'fallen')) P(sk);
    if (o.pose === 'seat') {
      // the cloth falls between the knees in a pleated apron to the shins, and over the seat's edge
      const mid = A.lerp(J.knR, J.knL, 0.5), top = [mid[0], mid[1] + 0.04, mid[2] + 0.01];
      P(tube([top, [mid[0], mid[1] - 0.1, mid[2] + 0.025], [mid[0], 0.07, mid[2] + 0.035], [mid[0], 0.045, mid[2] + 0.04]], [[0.065, 0.03], [0.072, 0.034], [0.082, 0.036], [0.09, 0.034]], { ...T, side: [1, 0, 0], seg: seg + 4, sub: 2, capA: false, mod: (th, t) => 1 + 0.1 * Math.cos(11 * th + 3 * t) * (0.5 + 0.5 * Math.sin(th)) }));
    }
  } else if (drape === 'mantle') {
    // the himation: wrapped round the hips and the legs, its rolled upper edge at the waist, one end thrown over the left shoulder
    const roll = tube([A.add(J.pelvis, [-0.095, 0.045, 0.01]), A.add(J.pelvis, [-0.04, 0.05, 0.085]), A.add(J.pelvis, [0.05, 0.06, 0.09]), A.add(J.pelvis, [0.1, 0.07, 0.01])], [0.034, 0.038, 0.04, 0.03], { ...T, seg: seg - 1, mod: (th, t) => 1 + 0.12 * Math.cos(5 * th + 6 * t) });
    P(roll);
    for (const s of ['R', 'L']) {
      const hip = J['hip' + s], kn = J['kn' + s], an = J['an' + s], ph = s === 'R' ? 0 : 1.9;
      const fold = (th, t) => 1 + 0.12 * Math.cos(6 * th + 6 * t + ph) + 0.05 * Math.cos(13 * th + 7 * t) + (t > 0.94 ? 0.12 : 0);
      const lower = o.pose === 'recline' || o.pose === 'seat';
      if (!lower && o.bareLegs && (o.pose === 'stand' || o.pose === 'ease')) { if (s === 'R') skirt(0.2, 11, 0.09); continue; }
      if (!lower && !o.bareLegs) continue;
      P(tube([A.lerp(J.pelvis, hip, 0.3), hip, A.lerp(hip, kn, 0.5), kn], [[0.09, 0.085], [0.088, 0.086], [0.082, 0.082], [0.07, 0.072]], { ...T, side: [1, 0, 0], mod: fold, seg: seg + 2, sub: 1, capB: false }));
      if (o.pose === 'seat') P(tube([kn, A.lerp(kn, an, 0.5), A.add(an, [0, 0.03, 0])], [[0.066, 0.07], [0.058, 0.062], [0.056, 0.058]], { ...T, side: [1, 0, 0], mod: fold, seg: seg + 2, capB: false }));
    }
    if (o.pose === 'seat') {
      const mid = A.lerp(J.knR, J.knL, 0.5);
      P(tube([[mid[0], mid[1] + 0.03, mid[2] + 0.01], [mid[0], mid[1] - 0.1, mid[2] + 0.02], [mid[0], 0.06, mid[2] + 0.03]], [[0.07, 0.03], [0.08, 0.034], [0.092, 0.034]], { ...T, side: [1, 0, 0], seg: seg + 3, sub: 2, capA: false, mod: (th, t) => 1 + 0.1 * Math.cos(10 * th + 3 * t) * (0.5 + 0.5 * Math.sin(th)) }));
    }
    // the end over the left shoulder, falling down the back
    P(tube([A.add(J.shL, [0.01, 0.025, -0.01]), A.add(J.shL, [0.05, -0.1, -0.06]), A.add(J.shL, [0.06, -0.25, -0.06])], [[0.05, 0.016], [0.065, 0.02], [0.06, 0.018]], { ...T, side: [0.7, 0, 0.7], mod: (th, t) => 1 + 0.1 * Math.cos(7 * th + 4 * t) }));
    P(tube([A.add(J.shL, [0.01, 0.02, 0.03]), A.lerp(A.add(J.chest, [0, 0, 0.065]), A.add(J.pelvis, [0, 0, 0.09]), 0.2), A.add(A.add(J.pelvis, [-0.06, 0.03, 0.09]), [0, 0, 0])], [[0.034, 0.014], [0.048, 0.016], [0.04, 0.016]], { ...T, side: [0.7, 0.7, 0], mod: (th, t) => 1 + 0.12 * Math.cos(6 * th + 5 * t) }));
  }
  if (o.cloak) {
    // a mantle flying from the shoulders: a broad flat sheet with a wave through it
    const c = o.cloak, a0 = A.add(J.neck, [0, 0, -0.03]), d = c.dir ?? [-1, -0.3, -0.2], L = c.len ?? 0.42, w = c.w ?? 0.17;
    const pts = [], rad = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(A.add(A.add(a0, A.mul(A.norm(d), L * t)), [0, Math.sin(t * 6 + (c.ph ?? 0)) * 0.03, Math.sin(t * 5 + 1) * 0.02])); rad.push([w * (0.55 + 0.7 * t), 0.012]); }
    P(tube(pts, rad, { ...T, side: c.side ?? [0, 0.3, 1], seg: 8, sub: 1, mod: (th, t) => 1 + 0.1 * Math.cos(4 * th + 8 * t) }));
  }
  if (o.seat && o.pose === 'seat') {
    const sy = J.pelvis[1] - 0.04, sd = o.seat === true ? {} : o.seat;
    P(box(-(sd.w ?? 0.17), 0, -(sd.back ?? 0.19), sd.w ?? 0.17, sy, 0.07));
    P(box(-((sd.w ?? 0.17) + 0.012), sy, -(sd.back ?? 0.19) - 0.005, (sd.w ?? 0.17) + 0.012, sy + 0.022, 0.082));
    if (sd.backrest) P(box(-(sd.w ?? 0.17), sy, -(sd.back ?? 0.19), sd.w ?? 0.17, sy + 0.4, -(sd.back ?? 0.19) + 0.03));
  } else if (o.seat === 'rock' && o.pose === 'recline') {
    P(blob([J.pelvis[0] * 0.5, 0.045, 0], 0.2, [2.1, 0.32, 1], 8));
  }
  // ── attributes (bronze)
  const hand = (s) => { const w = J['wr' + s], e = J['el' + s]; return A.add(w, A.mul(A.norm(A.sub(w, e)), 0.04)); };
  const want = (v) => (o.mirror ? (v === 'R' ? 'L' : 'R') : v);          // attribute sides are given as the figure's own, before the mirror
  const rod = (h, d, a, b, r0, r1) => limb(A.add(h, A.mul(A.norm(d), a)), A.add(h, A.mul(A.norm(d), b)), r0, r1, 5);
  if (o.spear) { const h = hand(want(o.spear)), d = o.spearDir ?? [0.05, 1, 0]; metal.push(rod(h, d, -0.45, 0.5, 0.009, 0.007)); metal.push(rod(h, d, 0.5, 0.58, 0.012, 0.0015)); }
  if (o.trident) { const h = hand(want(o.trident)), d = o.tridentDir ?? [0.1, 1, 0]; metal.push(rod(h, d, -0.42, 0.42, 0.01, 0.007)); for (const f of [-1, 0, 1]) metal.push(limb(A.add(A.add(h, A.mul(A.norm(d), 0.4)), [f * 0.05, 0, 0]), A.add(A.add(h, A.mul(A.norm(d), 0.5)), [f * 0.06, 0, 0]), 0.006, 0.002, 4)); }
  if (o.axe) { const h = hand(want(o.axe)), d = o.axeDir ?? [0.2, 1, 0]; metal.push(rod(h, d, -0.1, 0.22, 0.01, 0.009)); const t = A.add(h, A.mul(A.norm(d), 0.2)); metal.push(blob(A.add(t, [0.04 * sgm, 0.0, 0]), 0.04, [1.5, 1, 0.25], 6)); }
  if (o.shield) {
    const h = hand(want(o.shield)), r = o.shieldR ?? 0.16;
    const sh = lathe([[0.001, 0.05], [r * 0.2, 0.04], [r * 0.4, 0.018], [r * 0.97, 0.014], [r, 0.0], [r * 0.97, -0.012], [0.001, -0.012]], fine ? 16 : 10);
    sh.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2).setPosition(h[0], h[1] + 0.02, h[2] + 0.06)); (o.shieldMetal === false ? stone : metal).push(sh);
  }
  return { stone, metal };
}

/** Pieces [lists] merged and set: scale h, turned yaw about y, at (x, y, z). */
export function setFigure(fig, h, x, y, z, yaw = 0, flatten = null) {
  const m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)).setPosition(x, y, z), out = {};
  for (const key of Object.keys(fig)) { if (!fig[key]?.length) continue; const g = merge(fig[key]); if (flatten) flatten(g); g.applyMatrix4(m); out[key] = g; }
  return out;
}

/**
 * Squeeze a figure's geometry into relief: its depth (z) multiplied by `k`, what lies behind z = `cut` removed (the body
 * goes into the wall), the normals of the squeezed surface kept right. The ground plane is z = 0 afterwards.
 */
export function reliefSqueeze(k, cut = 0) {
  return (g) => {
    const P = g.attributes.position, N = g.attributes.normal, pa = P.array, na = N.array, keepP = [], keepN = [];
    for (let i = 0; i < pa.length; i += 9) {
      if (pa[i + 2] < cut && pa[i + 5] < cut && pa[i + 8] < cut) continue;
      for (let v = 0; v < 9; v += 3) { keepP.push(pa[i + v], pa[i + v + 1], Math.max(0, (pa[i + v + 2] - cut)) * k); const nx = na[i + v], ny = na[i + v + 1], nz = na[i + v + 2] / k, l = Math.hypot(nx, ny, nz) || 1; keepN.push(nx / l, ny / l, nz / l); }
    }
    g.setAttribute('position', new Float32BufferAttribute(keepP, 3)); g.setAttribute('normal', new Float32BufferAttribute(keepN, 3));
  };
}
/** Remove the triangles that lie wholly below y (a bust rising from the floor). */
export function clipBelow(g, y) {
  const P = g.attributes.position, N = g.attributes.normal, pa = P.array, na = N.array, kp = [], kn = [];
  for (let i = 0; i < pa.length; i += 9) { if (pa[i + 1] < y && pa[i + 4] < y && pa[i + 7] < y) continue; for (let k = 0; k < 9; k++) { kp.push(pa[i + k]); kn.push(na[i + k]); } }
  g.setAttribute('position', new Float32BufferAttribute(kp, 3)); g.setAttribute('normal', new Float32BufferAttribute(kn, 3));
  return g;
}
export { A as vec, Vector3 };
