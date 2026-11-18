// The guardian kings of the Great South Gate (Niō, Kongō Rikishi; docs/settlements/nara.md §4): a
// pair facing each other across the passage, the "a" figure with the mouth open, the "un" with it
// closed; standing with the feet planted wide on rocks, bare to the waist, the muscles of the
// chest, belly and arms swelling, a skirt knotted at the waist and swinging out, a scarf flying in
// a loop over the shoulders; the hair in a knot, the brows drawn together, the eyes staring. The
// "a" raises a vajra over his head in one hand and thrusts the other hand down, fingers spread;
// the "un" holds the vajra down at his side and lifts the other hand open before the chest.

import { figure, setFigure, along } from './sculpt.js';

const BODY = 'cedar', CLOTH = 'timber', ROCK = 'rock_boulder', METAL = 'gilt_bronze', DARK = 'lacquer_black';

/** nio { at, y, dir (facing), form ('a' | 'un'), h (the figure, about 5.7 m) } — on a rock 0.5 m high. */
export function nio(el, { bag, col }) {
  const form = el.form === 'un' ? 'un' : 'a', s = (el.h ?? 5.7) / 2.0, y = el.y ?? 0, [x, z] = el.at;
  const f = figure(`nio|${form}`, (S) => build(S, form));
  setFigure(bag, f, el.at, y, el.dir || [0, 1], s);
  col.circle(x, z, 0.5 * s, y, y + 2.1 * s);
}

function build(S, form) {
  const A = form === 'a', B = 0.18;                    // the rock's height in figure units (× 2.85 m)
  // ---- the rock, rough and lumpy
  S.lathe(ROCK, [[0.001, 0], [0.62, 0], [0.66, 0.05], [0.6, 0.12], [0.5, B], [0.001, B]], 14, (th) => 1 + 0.09 * Math.sin(th * 3 + 1) + 0.06 * Math.cos(th * 7), [0, 0, 0], 0.75);
  const Y = (v) => B + v;
  // ---- the legs: the feet planted wide, the knees bent out
  for (const sx of [-1, 1]) {
    const fwd = A ? sx * 0.06 : -sx * 0.06;
    S.tube(BODY, [[sx * 0.14, Y(1.0), 0, 0.11], [sx * 0.3, Y(0.56), 0.04 + fwd, 0.085], [sx * 0.36, Y(0.42), 0.04 + fwd, 0.07], [sx * 0.39, Y(0.08), fwd, 0.055]], 14);
    S.ball(BODY, [sx * 0.31, Y(0.53), 0.08 + fwd], 0.075, [1, 1, 1], 12, 8);                       // the knee
    S.ball(BODY, [sx * 0.33, Y(0.32), -0.03 + fwd], 0.06, [0.9, 1.6, 0.9], 12, 8);                  // the calf
    S.tube(BODY, [[sx * 0.39, Y(0.05), fwd - 0.05, 0.05, 0.04], [sx * 0.4, Y(0.03), fwd + 0.08, 0.06, 0.035], [sx * 0.41, Y(0.025), fwd + 0.15, 0.055, 0.025]], 8);
    for (let k = 0; k < 5; k++) S.ball(BODY, [sx * (0.37 + k * 0.012), Y(0.015), fwd + 0.17 + (k === 0 ? 0.01 : -k * 0.005)], 0.017, [1, 1, 1.3], 5, 4);
  }
  // ---- the skirt: knotted at the waist, falling to the knees in folds, swinging out to one side
  const sw = A ? 1 : -1;
  S.lathe(CLOTH, [[0.48, Y(0.5)], [0.43, Y(0.6)], [0.33, Y(0.8)], [0.24, Y(1.0)], [0.2, Y(1.16)]], 28, (th) => 1 + 0.08 * Math.cos(th * 9) + 0.18 * Math.max(0, Math.cos(th - (sw > 0 ? 0 : Math.PI))) * 0.8, [0, 0, 0], 0.6);
  S.tube(CLOTH, along((t) => { const a = t * Math.PI * 2; return [Math.cos(a) * 0.21, Y(1.12 + 0.02 * Math.sin(a * 3)), Math.sin(a) * 0.15, 0.03]; }, 18), 6);
  S.tube(CLOTH, [[0, Y(1.12), 0.15, 0.04], [0.04, Y(0.98), 0.19, 0.03], [-0.02, Y(0.8), 0.2, 0.025]], 6);       // the knot's ends
  S.tube(CLOTH, [[sw * 0.42, Y(0.62), 0, 0.04, 0.012], [sw * 0.58, Y(0.55), -0.05, 0.05, 0.012], [sw * 0.72, Y(0.6), -0.1, 0.04, 0.01]], 6);
  // ---- the torso: the chest and the belly swelling, the broad shoulders
  S.lathe(BODY, [[0.17, Y(1.0)], [0.2, Y(1.15)], [0.18, Y(1.25)], [0.21, Y(1.4)], [0.26, Y(1.52)], [0.22, Y(1.6)], [0.1, Y(1.66)], [0.001, Y(1.67)]], 18, null, [0, 0, 0], 0.7, 1.15);
  for (const sx of [-1, 1]) {
    S.ball(BODY, [sx * 0.11, Y(1.47), 0.1], 0.1, [1.15, 0.8, 0.6], 14, 10);                          // the chest
    S.ball(BODY, [sx * 0.27, Y(1.56), -0.01], 0.1, [1, 1, 1], 12, 9);                                // the shoulder
    for (let k = 0; k < 3; k++) S.ball(BODY, [sx * 0.06, Y(1.31 - k * 0.075), 0.115 - k * 0.004], 0.04, [1.1, 0.8, 0.6], 10, 7);
  }
  S.ball(BODY, [0, Y(1.09), 0.08], 0.13, [1.25, 0.9, 0.8], 14, 10);                                   // the belly
  // ---- the neck, thick; the head: the brows knotted, the staring eyes, the broad nose, the mouth
  S.tube(BODY, [[0, Y(1.6), -0.01, 0.1], [0, Y(1.74), 0.01, 0.085]], 10);
  const H = (v) => Y(1.7 + v);
  S.lathe(BODY, [[0.001, H(0)], [0.08, H(0.01)], [0.12, H(0.06)], [0.135, H(0.14)], [0.13, H(0.22)], [0.1, H(0.28)], [0.001, H(0.3)]], 16, null, [0, 0, 0.02], 1.1);
  S.lathe(DARK, [[0.001, H(0.23)], [0.12, H(0.22)], [0.12, H(0.27)], [0.06, H(0.31)], [0.001, H(0.32)]], 14, null, [0, 0, 0.0], 1.1);
  S.ball(DARK, [0, H(0.31), -0.02], 0.06, [1, 1.1, 1], 12, 8);                                         // the knot
  for (const sx of [-1, 1]) {
    S.tube(BODY, [[sx * 0.02, H(0.18), 0.155, 0.02], [sx * 0.06, H(0.2), 0.15, 0.024], [sx * 0.11, H(0.19), 0.12, 0.018]], 6);   // the brow
    S.ball(BODY, [sx * 0.055, H(0.16), 0.14], 0.022, [1.2, 1, 0.9], 10, 7);                         // the eye
    S.ball(DARK, [sx * 0.055, H(0.162), 0.16], 0.008, [1, 1, 1], 5, 4);
    S.plate(BODY, [[sx * 0.14, H(0.19), 0.02], [sx * 0.155, H(0.17), -0.02], [sx * 0.15, H(0.1), -0.02], [sx * 0.14, H(0.07), 0.01]], [sx, 0, 0], 0.02);    // the ear
  }
  S.tube(BODY, [[0, H(0.17), 0.16, 0.014], [0, H(0.11), 0.18, 0.025], [0, H(0.095), 0.175, 0.035, 0.02]], 6);              // the nose
  if (A) { S.ball(DARK, [0, H(0.055), 0.14], 0.03, [1.4, 1, 0.6], 12, 8); S.tube(BODY, [[-0.05, H(0.07), 0.145, 0.01], [0, H(0.08), 0.155, 0.012], [0.05, H(0.07), 0.145, 0.01]], 5); }
  else S.tube(BODY, [[-0.045, H(0.055), 0.14, 0.012], [0, H(0.05), 0.152, 0.015], [0.045, H(0.055), 0.14, 0.012]], 5);
  // ---- the arms
  const sh = (sx) => [sx * 0.3, Y(1.56), -0.01];
  const arm = (sx, E, W) => {
    S.tube(BODY, [[...sh(sx), 0.085], [(sh(sx)[0] + E[0]) / 2, (sh(sx)[1] + E[1]) / 2, (sh(sx)[2] + E[2]) / 2, 0.08], [...E, 0.06]], 14);
    S.tube(BODY, [[...E, 0.06], [(E[0] + W[0]) / 2, (E[1] + W[1]) / 2, (E[2] + W[2]) / 2, 0.062], [...W, 0.042]], 14);
    S.ball(BODY, E, 0.06, [1, 1, 1], 12, 8);
  };
  const vajra = (c, up) => {
    // the vajra: the grip, a lotus each side, the prongs closing to a point at each end
    S.tube(METAL, [[c[0], c[1] - 0.06 * up, c[2], 0.02], [c[0], c[1] + 0.06 * up, c[2], 0.02]], 6);
    for (const e of [-1, 1]) {
      const b = [c[0], c[1] + e * 0.07, c[2]];
      S.ball(METAL, b, 0.03, [1, 0.8, 1], 10, 7);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, r = k ? 0.035 : 0; S.tube(METAL, [[b[0], b[1], b[2], 0.008], [b[0] + Math.cos(a) * r, b[1] + e * 0.08, b[2] + Math.sin(a) * r, 0.008], [b[0], b[1] + e * 0.16, b[2], 0.003]], 4); }
    }
  };
  const openHand = (c, d, sx) => {
    S.ball(BODY, c, 0.05, [0.9, 1.2, 0.5], 12, 8);
    for (let f = 0; f < 4; f++) { const o = (f - 1.5) * 0.028; S.tube(BODY, [[c[0] + o, c[1] + d[1] * 0.05, c[2] + d[2] * 0.05, 0.014], [c[0] + o * 1.6 + d[0] * 0.09, c[1] + d[1] * 0.12, c[2] + d[2] * 0.12, 0.012]], 5); }
    S.tube(BODY, [[c[0] - sx * 0.04, c[1], c[2], 0.016], [c[0] - sx * 0.1, c[1] + d[1] * 0.04 + 0.03, c[2] + 0.04, 0.012]], 5);
  };
  if (A) {
    arm(1, [0.45, Y(1.78), 0.0], [0.38, Y(2.0), 0.06]);
    S.ball(BODY, [0.38, Y(2.04), 0.06], 0.05, [1, 1.1, 1], 12, 8);
    vajra([0.38, Y(2.04), 0.06], 1);
    arm(-1, [-0.46, Y(1.3), 0.04], [-0.55, Y(1.08), 0.12]);
    openHand([-0.57, Y(1.02), 0.14], [0, -1, 0.2], -1);
  } else {
    arm(1, [0.44, Y(1.3), 0.0], [0.47, Y(1.06), 0.06]);
    S.ball(BODY, [0.47, Y(1.02), 0.07], 0.05, [1, 1.1, 1], 12, 8);
    vajra([0.47, Y(1.0), 0.07], -1);
    arm(-1, [-0.4, Y(1.3), 0.12], [-0.22, Y(1.5), 0.3]);
    openHand([-0.2, Y(1.56), 0.32], [0, 1, 0.2], -1);
  }
  // ---- the scarf in a loop over the shoulders, its ends flying out
  S.tube(CLOTH, along((t) => { const a = Math.PI * (0.05 + 0.9 * t); return [Math.cos(a) * 0.42, Y(1.78 + 0.22 * Math.sin(a)), -0.18 - 0.05 * Math.sin(a), 0.04, 0.012]; }, 14), 6);
  for (const sx of [-1, 1]) S.tube(CLOTH, along((t) => [sx * (0.42 + 0.12 * t + 0.04 * Math.sin(t * 9)), Y(1.79 - 1.3 * t), -0.17 - 0.08 * t + 0.05 * Math.sin(t * 7 + sx), 0.035 - 0.012 * t, 0.012], 12), 6);
}

// ── the near levels (docs/settlements/nara.md §19): the same pair modelled as muscle and cloth ─────────────────────────────────────
import { curve, ell, shell, head as headMesh, faceField, strand, hand, frame, smooth, pleat, tube as mtube, spline, add as vadd, h01 } from './model.js';

const NIO_FEATS = (A) => {
  const F = [[0, 0.35, 0.55, 0.3, 0.16], [0, 2.62, 0.3, 0.14, 0.12], [0, 2.35, 0.2, 0.18, 0.2], [0, 2.0, 0.22, 0.17, 0.3], [0, 1.72, 0.27, 0.15, 0.42], [0, 1.5, 0.22, 0.05, -0.06], [0, 3.0, 0.12, 0.12, 0.06]];
  if (A) F.push([0, 0.95, 0.44, 0.22, -0.3], [0, 1.27, 0.4, 0.07, 0.15], [0, 0.6, 0.42, 0.08, 0.14]);
  else { F.push([0, 0.8, 0.45, 0.1, 0.15], [0, 1.12, 0.4, 0.09, 0.13]); F.push(...strand([[-0.62, 0.9], [-0.3, 0.95], [0, 0.96], [0.3, 0.95], [0.62, 0.9]], 0.035, -0.15)); }
  for (const s of [-1, 1]) {
    F.push([s * 0.4, 1.68, 0.15, 0.12, 0.3], [s * 0.82, 2.1, 0.4, 0.24, 0.12], [s * 1.2, 1.7, 0.55, 0.4, 0.12], [s * 1.1, 1.2, 0.4, 0.4, -0.05]);
    F.push(...strand([[s * 0.45, 2.3], [s * 0.8, 2.38], [s * 1.2, 2.26]], 0.07, 0.14));         // the upper lids, drawn low over the stare
    F.push(...strand([[s * 0.5, 1.92], [s * 0.85, 1.88], [s * 1.2, 1.94]], 0.05, 0.08));
    F.push(...strand([[s * 0.15, 2.52], [s * 0.55, 2.68], [s * 1.0, 2.84], [s * 1.35, 2.95]], 0.13, 0.22));   // the heavy brows, knotted over the nose
    F.push(...strand([[s * 0.42, 1.74], [s * 0.6, 1.34], [s * 0.74, 0.98]], 0.07, -0.07));
    F.push([s * 0.12, 2.6, 0.04, 0.2, -0.07]);
  }
  return F;
};
const NIO_HEAD = [[0.001, 0], [0.08, 0.01], [0.12, 0.06], [0.135, 0.14], [0.13, 0.22], [0.1, 0.28], [0.001, 0.3]];

export const nioMid = (el, { bag }) => {
  const form = el.form === 'un' ? 'un' : 'a', s = (el.h ?? 5.7) / 2.0;
  setFigure(bag, figure(`nio|${form}|mid`, (S) => buildMid(S, form)), el.at, el.y ?? 0, el.dir || [0, 1], s);
};

function buildMid(S, form) {
  const A = form === 'a', B = 0.18, Y = (v) => B + v, sw = A ? 1 : -1;
  const body = (g) => S.add(BODY, g), cloth = (g) => S.add(CLOTH, g), dark = (g) => S.add(DARK, g), metal = (g) => S.add(METAL, g);
  S.lathe(ROCK, [[0.001, 0], [0.62, 0], [0.66, 0.05], [0.6, 0.12], [0.5, B], [0.001, B]], 18, (th) => 1 + 0.09 * Math.sin(th * 3 + 1) + 0.06 * Math.cos(th * 7), [0, 0, 0], 0.75);
  // ---- the legs: thigh, knee, calf with its swell, the foot with its toes gripping the rock
  for (const sx of [-1, 1]) {
    const fwd = A ? sx * 0.06 : -sx * 0.06, hip = [sx * 0.14, Y(1.0), 0], kn = [sx * 0.3, Y(0.56), 0.06 + fwd], an = [sx * 0.39, Y(0.1), fwd];
    body(curve([hip, [sx * 0.23, Y(0.8), 0.04], kn], 0.125, 0.082, { n: 10, per: 3, swell: 0.14 }));
    body(ell(kn, [0.085, 0.085, 0.09], undefined, 10, 6));
    body(curve([kn, [sx * 0.33, Y(0.38), 0.0 + fwd], an], 0.082, 0.045, { n: 10, per: 3, swell: 0.26 }));
    body(ell([sx * 0.4, Y(0.045), fwd + 0.07], [0.055, 0.032, 0.12], undefined, 8, 5));
    for (let k = 0; k < 5; k++) body(ell([sx * (0.37 + k * 0.016), Y(0.03), fwd + 0.18 - Math.abs(k - 2) * 0.006], [0.018, 0.018, 0.04], undefined, 6, 4));
  }
  // ---- the skirt, knotted at the waist, hanging in folds and swinging out to one side
  const skirt = (a, y, r) => { const ca = Math.cos(a - (sw > 0 ? Math.PI / 2 : -Math.PI / 2)); return 0.014 * pleat(a / (Math.PI * 2) * 11 + y * 1.5) + 0.07 * Math.max(0, ca) * (1 - smooth(0.5, 1.0, y - B)) * 0.0 + 0.1 * Math.max(0, ca) * smooth(0.55, 0.9, 1.2 - (y - B)); };
  cloth(shell([[0.5, Y(0.48)], [0.44, Y(0.6)], [0.34, Y(0.8)], [0.25, Y(1.0)], [0.2, Y(1.16)]], { n: 44, rows: 18, kz: 0.62, disp: skirt, cap: false }));
  cloth(mtube(Array.from({ length: 19 }, (_, i) => { const a = i / 18 * Math.PI * 2; return [Math.cos(a) * 0.21, Y(1.12 + 0.02 * Math.sin(a * 3)), Math.sin(a) * 0.14]; }), () => 0.03, 6, { capA: false, capB: false }));
  cloth(curve([[0, Y(1.12), 0.14], [0.04, Y(0.98), 0.19], [-0.02, Y(0.78), 0.2]], 0.04, 0.025, { n: 6, per: 2 }));
  cloth(curve([[sw * 0.4, Y(0.64), 0], [sw * 0.58, Y(0.55), -0.05], [sw * 0.74, Y(0.62), -0.1]], 0.05, 0.012, { n: 6, per: 3, flat: 0.3, up: [0, 1, 0] }));
  // ---- the torso: pectorals, the ridged belly, the swell of the ribs, the broad shoulders
  const td = (a, y, r) => {
    const ca = Math.cos(a); if (ca < -0.2) return 0; const lx = r * Math.sin(a), w = smooth(-0.2, 0.5, ca), ax = Math.abs(lx), v = y - B;
    let d = 0.08 * Math.exp(-0.5 * (((ax - 0.11) / 0.07) ** 2 + ((v - 1.46) / 0.055) ** 2));                         // the pectorals
    d += 0.012 * Math.exp(-0.5 * (((ax - 0.11) / 0.07) ** 2 + ((v - 1.4) / 0.02) ** 2));
    for (let k = 0; k < 3; k++) d += 0.035 * Math.exp(-0.5 * (((ax - 0.05) / 0.035) ** 2 + ((v - (1.31 - k * 0.075)) / 0.03) ** 2));   // the ridged belly
    d -= 0.014 * Math.exp(-0.5 * (ax / 0.012) ** 2) * smooth(1.05, 1.25, v) * (1 - smooth(1.45, 1.6, v));
    return d * w;
  };
  body(shell([[0.2, Y(1.0)], [0.23, Y(1.15)], [0.21, Y(1.25)], [0.24, Y(1.4)], [0.3, Y(1.52)], [0.25, Y(1.6)], [0.11, Y(1.66)], [0.001, Y(1.68)]], { n: 48, rows: 28, kz: 0.6, disp: td }));
  body(ell([0, Y(1.09), 0.08], [0.17, 0.12, 0.11], undefined, 10, 6));
  for (const sx of [-1, 1]) body(ell([sx * 0.29, Y(1.55), -0.01], [0.11, 0.1, 0.1], undefined, 10, 6));
  body(curve([[0, Y(1.58), -0.01], [0, Y(1.68), 0.0], [0, Y(1.74), 0.01]], 0.11, 0.085, { n: 10, per: 2 }));
  // ---- the head: staring eyes under heavy brows, the broad nose, the mouth open or shut, the hair knotted
  const hc = [0, Y(1.7), 0.02];
  body(headMesh(NIO_HEAD.map(([r, y]) => [r, y + hc[1]]), { c: [0, 0, 0.02], kz: 1.1, field: faceField(NIO_FEATS(A), 0.07), chinY: hc[1], n: 56, rows: 36 }));
  dark(ell([0, Y(1.7) + 0.26, 0.0], [0.13, 0.07, 0.14], undefined, 12, 5));
  dark(ell([0, Y(1.7) + 0.34, -0.03], [0.06, 0.065, 0.06], undefined, 8, 5));
  if (A) dark(ell([0, Y(1.7) + 0.062, 0.14], [0.05, 0.025, 0.02], undefined, 10, 5));
  for (const sx of [-1, 1]) {
    body(ell([sx * 0.058, Y(1.7) + 0.155, 0.135], [0.026, 0.02, 0.02], undefined, 8, 5)); dark(ell([sx * 0.058, Y(1.7) + 0.155, 0.152], [0.011, 0.011, 0.006], undefined, 6, 4));
    body(mtube(spline([[sx * 0.135, hc[1] + 0.2, 0.02], [sx * 0.158, hc[1] + 0.14, -0.015], [sx * 0.152, hc[1] + 0.07, 0.0]], 3), (t) => 0.02 * (1 - 0.2 * t), 6));
  }
  // ---- the arms: shoulder, the biceps' swell, the elbow, the forearm's bulk; the hands with their fingers
  const sh = (sx) => [sx * 0.3, Y(1.56), -0.01];
  const arm = (sx, E, W) => {
    const m1 = [(sh(sx)[0] + E[0]) / 2, (sh(sx)[1] + E[1]) / 2, (sh(sx)[2] + E[2]) / 2 + 0.03], m2 = [(E[0] + W[0]) / 2, (E[1] + W[1]) / 2, (E[2] + W[2]) / 2];
    body(curve([sh(sx), m1, E], 0.092, 0.062, { n: 10, per: 3, swell: 0.2 })); body(ell(E, [0.062, 0.062, 0.062], undefined, 8, 5));
    body(curve([E, m2, W], 0.068, 0.04, { n: 10, per: 3, swell: 0.22 }));
  };
  const grip = (w, sx) => { for (const g of hand(frame([w[0] - sx * 0.005, w[1] - 0.022, w[2] - 0.03], [0, 1, 0], [0, 0, 1], [-sx, 0, 0], 0.085), { curl: [0.8, 0.8, 0.8, 0.8], spread: 0.02, thumb: [0.3, 0.6], thumbCurl: 0.8, n: 6 })) body(g); };
  const vajra = (c) => {
    metal(curve([[c[0], c[1] - 0.07, c[2]], [c[0], c[1] + 0.07, c[2]]], 0.02, 0.02, { n: 8, per: 1 }));
    for (const e of [-1, 1]) {
      const b = [c[0], c[1] + e * 0.08, c[2]]; metal(ell(b, [0.034, 0.025, 0.034], undefined, 8, 5));
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, r = k ? 0.04 : 0; metal(curve([b, [b[0] + Math.cos(a) * r, b[1] + e * 0.09, b[2] + Math.sin(a) * r], [b[0], b[1] + e * 0.18, b[2]]], 0.011, 0.003, { n: 5, per: 3 })); }
    }
  };
  if (A) {
    arm(1, [0.45, Y(1.78), 0.0], [0.38, Y(2.0), 0.06]); grip([0.38, Y(2.03), 0.06], 1); vajra([0.38, Y(2.03), 0.06]);
    arm(-1, [-0.46, Y(1.3), 0.04], [-0.55, Y(1.08), 0.12]);
    for (const g of hand(frame([-0.55, Y(1.07), 0.13], [-1, 0, 0], [0, -1, 0.1], [0, 0, 1], 0.1), { curl: [0.05, 0.08, 0.08, 0.1], spread: 0.22, thumb: [0.9, 0.1], n: 6 })) body(g);
  } else {
    arm(1, [0.44, Y(1.3), 0.0], [0.47, Y(1.06), 0.06]); grip([0.47, Y(1.04), 0.07], 1); vajra([0.47, Y(1.03), 0.07]);
    arm(-1, [-0.4, Y(1.3), 0.12], [-0.22, Y(1.5), 0.3]);
    for (const g of hand(frame([-0.22, Y(1.52), 0.31], [1, 0, 0], [0, 1, 0.1], [0, 0, 1], 0.1), { curl: [0.1, 0.12, 0.15, 0.2], spread: 0.1, thumb: [0.8, 0.1], n: 6 })) body(g);
  }
  // ---- the scarf: a ribbon over the shoulders, its ends streaming out in waves
  const ribbon = (pts, w) => cloth(mtube(spline(pts, 4), (t, th) => { const ww = w * (1 - 0.35 * t) * (1 + 0.1 * Math.sin(t * 25)); return [Math.cos(th) * ww, Math.sin(th) * 0.01]; }, 6, { up: [0, 0, 1] }));
  ribbon(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.05 + 0.9 * i / 8); return [Math.cos(a) * 0.42, Y(1.78 + 0.22 * Math.sin(a)), -0.18 - 0.05 * Math.sin(a)]; }), 0.045);
  for (const sx of [-1, 1]) ribbon(Array.from({ length: 10 }, (_, i) => { const t = i / 9; return [sx * (0.42 + 0.2 * t + 0.05 * Math.sin(t * 9)), Y(1.79 - 1.3 * t), -0.17 - 0.12 * t + 0.07 * Math.sin(t * 7 + sx)]; }), 0.05);
}
