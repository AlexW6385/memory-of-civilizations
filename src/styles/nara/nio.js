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
