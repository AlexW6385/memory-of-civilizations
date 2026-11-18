// Figures for the reliefs and the sculpture of Borobudur (docs/settlements/borobudur.md §20), modelled in the
// sculptor (sculpt.js): rounded bodies in tribhanga, faces, jewellery, drapery whose folds follow the limb. Sizes in
// metres of the carved scale (a standing figure about 0.78 m to the top of its crown at s = 1). lod 2: the full model
// (faces, hands, jewels); lod 1: the same figure with fewer rings and without the finest pieces.

const SIN = Math.sin, COS = Math.cos;

/** The head at (x, y) (its centre), size k: skull, brow, eyes, nose, lips, chin, ears with their lobes and rings, hair. */
export function head(S, x, y, k, lod, { f = false, crown = 'tall', tilt = 0 } = {}) {
  const rw = 0.036 * k, base = S.sink, full = lod >= 2;
  const cs = [x, y, base];
  S.blob(cs, [0.036 * k, 0.046 * k, rw], { n: full ? 9 : 7, m: full ? 3 : 3, rot: tilt });
  // the face on the skull's front: where the surface stands at (du, dv)
  const on = (du, dv) => { const q = 1 - (du / (0.036 * k)) ** 2 - (dv / (0.046 * k)) ** 2; return [x + du, y + dv, base + rw * Math.sqrt(Math.max(0.02, q))]; };
  if (full) {
    for (const s of [-1, 1]) {
      S.blob(on(s * 0.0155 * k, 0.008 * k), [0.0085 * k, 0.003 * k, 0.0035 * k], { n: 5, m: 2, rot: -s * 0.18 });                  // the lid, eyes downcast
      S.rod(on(s * 0.007 * k, 0.0175 * k), on(s * 0.027 * k, 0.0195 * k), 0.0018 * k, 0.0012 * k, { n: 3, cap: 0, seg: 1 });          // the brow
      S.blob([x + s * 0.0365 * k, y - 0.006 * k, base + 0.003 * k], [0.0038 * k, 0.019 * k, 0.005 * k], { n: 6, m: 2 });               // the ear with its long lobe
      S.blob([x + s * 0.0388 * k, y - 0.027 * k, base + 0.004 * k], [0.0045 * k, 0.0045 * k, 0.004 * k], { n: 5, m: 2 });               // its ring
    }
    S.blob(on(0, -0.002 * k), [0.0055 * k, 0.0115 * k, 0.0085 * k], { n: 6, m: 3 });                                                  // the nose
    S.blob(on(0, -0.0125 * k), [0.0085 * k, 0.0035 * k, 0.0035 * k], { n: 6, m: 2 });                                                 // the nostrils
    S.blob(on(0, -0.0205 * k), [0.0105 * k, 0.0038 * k, 0.0048 * k], { n: 8, m: 2 });                                                 // the upper lip
    S.blob(on(0, -0.0265 * k), [0.0092 * k, 0.0034 * k, 0.0046 * k], { n: 8, m: 2 });                                                 // the lower lip
    S.blob(on(0, -0.037 * k), [0.0095 * k, 0.0075 * k, 0.005 * k], { n: 6, m: 2 });                                                   // the chin
    S.blob(on(0, 0.024 * k), [0.0025 * k, 0.0025 * k, 0.0025 * k], { n: 5, m: 2 });                                                   // the forehead mark
  } else {
    S.blob(on(0, -0.004 * k), [0.0055 * k, 0.012 * k, 0.008 * k], { n: 5, m: 2 });
    S.blob(on(0, -0.022 * k), [0.011 * k, 0.005 * k, 0.005 * k], { n: 6, m: 2 });
  }
  // the hair and what crowns it
  S.blob([x, y + 0.012 * k, base], [0.039 * k, 0.04 * k, 0.039 * k], { n: 8, m: 2, base: 0.002 });
  if (crown === 'tall') {
    const t = full ? [[0.046, 0.018, 0.012], [0.038, 0.034, 0.012], [0.026, 0.05, 0.012]] : [[0.044, 0.018, 0.014], [0.03, 0.034, 0.014]];
    let v = y + 0.044 * k;
    for (const [r, , h] of t) { S.turn([[r * k, v], [r * k * 1.05, v + h * 0.4 * k], [r * k * 0.86, v + h * k], [r * k * 0.5, v + h * 1.25 * k]], x, base, { n: full ? 6 : 5, kw: 0.8 }); v += h * k * 0.9; }
    S.turn([[0.011 * k, v], [0.008 * k, v + 0.012 * k], [0.001, v + 0.026 * k]], x, base, { n: 6 });
    if (full) S.blob([x, y + 0.058 * k, base + 0.03 * k], [0.007 * k, 0.007 * k, 0.005 * k], { n: 6, m: 2 });              // the jewel of the diadem
  } else if (crown === 'bun') {
    S.blob([x, y + 0.075 * k, base], [0.022 * k, 0.024 * k, 0.02 * k], { n: 8, m: 3 });
    if (full) S.blob([x + 0.012 * k, y + 0.07 * k, base + 0.012 * k], [0.007 * k, 0.007 * k, 0.006 * k], { n: 6, m: 2 });   // a flower
  }
}

/** A hand at p: palm and four fingers and thumb pointing along (dx, dy) (unit), closed round something or open. */
export function hand(S, p, dx, dy, k, lod, open = true) {
  S.blob(p, [0.011 * k, 0.014 * k, 0.007 * k], { n: 6, m: 2, rot: Math.atan2(dy, dx) - Math.PI / 2 });
  if (lod < 2) return;
  const nx = -dy, ny = dx;
  for (let i = -1; i <= 1; i += 2 / 3) {
    const b = [p[0] + dx * 0.011 * k + nx * i * 0.0075 * k, p[1] + dy * 0.011 * k + ny * i * 0.0075 * k, p[2]], l = (open ? 0.021 : 0.012) * k;
    S.rod(b, [b[0] + dx * l + (open ? 0 : nx * 0.002 * k), b[1] + dy * l + (open ? 0 : ny * 0.002 * k), p[2] + (open ? 0 : 0.004 * k)], 0.0032 * k, 0.0022 * k, { n: 3, cap: 1, seg: 1 });
  }
}

/** An arm from the shoulder a by the elbow b to the wrist c, a hand beyond; an armlet and a bracelet. */
export function arm(S, a, b, c, k, lod, open = true) {
  S.tube([a, b, c], [0.0165 * k, 0.014 * k, 0.0105 * k].map((r) => [r, r * 0.8]), { seg: 2, n: lod >= 2 ? 5 : 4, cap: 1 });
  const dx = c[0] - b[0], dy = c[1] - b[1], l = Math.hypot(dx, dy) || 1;
  hand(S, [c[0] + dx / l * 0.012 * k, c[1] + dy / l * 0.012 * k, c[2]], dx / l, dy / l, k, lod, open);
  if (lod >= 2) {
    const m = [a[0] * 0.65 + b[0] * 0.35, a[1] * 0.65 + b[1] * 0.35, a[2]];
    S.blob(m, [0.0185 * k, 0.0065 * k, 0.0185 * k], { n: 8, m: 2, rot: Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2 });
    S.blob([c[0] - dx / l * 0.004 * k, c[1] - dy / l * 0.004 * k, c[2]], [0.0125 * k, 0.0035 * k, 0.012 * k], { n: 8, m: 2, rot: Math.atan2(dy, dx) - Math.PI / 2 });
  }
}

/**
 * A standing figure in tribhanga at (x, y) (the foot line), size s, hips swung to side L (±1): the kain in folds to the
 * ankle with its hem, belt and jewel, the torso and shoulders, collar and sash, two arms by `pose` ('lotus', 'whisk',
 * 'offer', 'parasol', 'hip', 'down'), the head with its crown (or a bun, f: a woman with her bust).
 */
export function stand(S, x, y, s, L, lod, { pose = 'lotus', f = false, crown = f ? 'bun' : 'tall' } = {}) {
  const full = lod >= 2, w = S.sink, P = (u, v, d = 0) => [x + u * s, y + v * s, w + d * s];
  const hx = 0.028 * L, sx = -0.022 * L;
  // the feet, splayed
  for (const q of [-1, 1]) S.blob(P(0.05 * q + hx * 0.5, 0.008), [0.026 * s, 0.014 * s, 0.014 * s], { n: 8, m: 2, rot: q * 0.35 });
  // the kain: from the hem, narrowing to the hip, folds that follow the leg; the weight leg's knee under it
  S.tube([P(hx * 0.5, 0.03), P(hx * 0.8, 0.17), P(hx, 0.34)], [[0.088 * s, 0.017 * s], [0.07 * s, 0.021 * s], [0.058 * s, 0.022 * s]],
    { seg: 2, n: full ? 12 : 8, fold: (t, a) => 1 + (0.13 * (1 - 0.4 * t)) * Math.cos(a * 4 + 0.7 * L + t * 1.6 * L) });
  S.blob(P(hx * 0.8 - 0.03 * L, 0.2), [0.026 * s, 0.034 * s, 0.014 * s], { n: 8, m: 2 });
  if (full) {
    S.rod(P(hx * 0.5 - 0.082, 0.052), P(hx * 0.5 + 0.082, 0.052), 0.0065 * s, 0.0065 * s, { n: 4, cap: 1 });                                                      // the hem band
    S.tube([P(hx + 0.034 * L, 0.35, 0.012), P(hx + 0.05 * L, 0.24, 0.012), P(hx * 1.3 + 0.056 * L, 0.11, 0.012)], [[0.016 * s, 0.006 * s], [0.021 * s, 0.007 * s], [0.012 * s, 0.005 * s]], { seg: 3, n: 6 });   // the sash's end hanging
    S.rod(P(hx - 0.01 * L, 0.33, 0.01), P(hx - 0.006 * L, 0.06, 0.01), 0.005 * s, 0.003 * s, { n: 4, cap: 1 });                                                 // the pleat down the front
  }
  // belt and its jewel
  S.rod(P(hx - 0.06, 0.352), P(hx + 0.06, 0.352), 0.0075 * s, 0.0075 * s, { n: 5, cap: 1 });
  if (full) S.blob(P(hx, 0.352, 0.012), [0.01 * s, 0.01 * s, 0.006 * s], { n: 6, m: 2 });
  // the torso, shoulders
  S.tube([P(hx * 0.7, 0.36), P(hx * 0.1, 0.43), P(-0.012 * L, 0.495), P(sx, 0.527)], [[0.032 * s, 0.02 * s], [0.039 * s, 0.022 * s], [0.05 * s, 0.025 * s], [0.07 * s, 0.021 * s]], { seg: 2, n: full ? 8 : 6 });
  S.rod(P(sx - 0.068, 0.514), P(sx + 0.068, 0.514), 0.02 * s, 0.02 * s, { n: 6, cap: 2 });
  if (f) for (const q of [-1, 1]) S.blob(P(-0.012 * L + q * 0.022, 0.474, 0.012), [0.021 * s, 0.021 * s, 0.014 * s], { n: 8, m: 3 });
  if (full) {
    // the sash over the shoulder and the necklace
    S.rod(P(sx + 0.05 * L, 0.52, 0.014), P(hx - 0.05 * L, 0.37, 0.014), 0.0065 * s, 0.0065 * s, { n: 5, cap: 1 });
    S.tube([P(sx - 0.03, 0.53, 0.014), P(sx, 0.49, 0.016), P(sx + 0.03, 0.53, 0.014)], [0.004 * s, 0.004 * s, 0.004 * s], { seg: 3, n: 4, cap: 1 });
    S.blob(P(sx, 0.485, 0.017), [0.007 * s, 0.007 * s, 0.005 * s], { n: 6, m: 2 });
  }
  // the neck and the head
  S.rod(P(sx, 0.52), P(sx * 0.9, 0.575), 0.017 * s, 0.015 * s, { n: 6, cap: 1 });
  head(S, x + (sx * 0.55) * s, y + 0.612 * s, s, lod, { f, crown, tilt: 0.05 * L });
  // the arms; the shoulder on the side away from the hip carries the raised one
  const A = (q, e, wr, open = true) => arm(S, P(sx + q * 0.066, 0.512), P(...e), P(...wr), s, lod, open);
  if (pose === 'lotus') {
    A(L, [sx + L * 0.1, 0.42, 0.006], [hx + L * 0.078, 0.35, 0.01]);                                                    // the weight side's hand on the thigh
    A(-L, [sx - L * 0.105, 0.44, 0.008], [sx - L * 0.104, 0.56, 0.012], false);                                         // the other raised, holding a lotus
    const b = P(sx - L * 0.104, 0.605, 0.014);
    S.rod(P(sx - L * 0.104, 0.572, 0.012), b, 0.0032 * s, 0.0032 * s, { n: 4, cap: 1, seg: 1 });
    if (full) { for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; S.blob([b[0] + COS(a) * 0.014 * s, b[1] + 0.012 * s + SIN(a) * 0.016 * s, b[2] + 0.004], [0.007 * s, 0.014 * s, 0.006 * s], { n: 6, m: 2, rot: a - Math.PI / 2 }); } S.blob([b[0], b[1] + 0.012 * s, b[2] + 0.008], [0.008 * s, 0.008 * s, 0.006 * s], { n: 6, m: 2 }); }
    else S.blob([b[0], b[1] + 0.014 * s, b[2] + 0.004], [0.022 * s, 0.022 * s, 0.01 * s], { n: 6, m: 2 });
  } else if (pose === 'whisk') {
    A(L, [sx + L * 0.098, 0.43, 0.006], [hx + L * 0.07, 0.36, 0.01]);
    A(-L, [sx - L * 0.1, 0.43, 0.008], [sx - L * 0.1, 0.55, 0.012], false);
    const b = P(sx - L * 0.1, 0.585, 0.012);
    S.tube([b, [b[0] - L * 0.012 * s, b[1] + 0.05 * s, b[2]], [b[0] - L * 0.03 * s, b[1] + 0.12 * s, b[2]]], [[0.005 * s, 0.005 * s], [0.014 * s, 0.009 * s], [0.002 * s, 0.003 * s]], { seg: 3, n: 6 });   // the fly-whisk's tail
  } else if (pose === 'offer') {
    A(L, [sx + L * 0.075, 0.43, 0.01], [sx + L * 0.012, 0.5, 0.02], false);
    A(-L, [sx - L * 0.075, 0.43, 0.01], [sx - L * 0.012, 0.5, 0.02], false);
  } else if (pose === 'parasol') {
    A(-L, [sx - L * 0.1, 0.45, 0.008], [sx - L * 0.09, 0.64, 0.012], false);
    A(L, [sx + L * 0.095, 0.43, 0.006], [hx + L * 0.075, 0.35, 0.01]);
    const t = P(sx - L * 0.09, 0.66, 0.012);
    S.rod(t, [t[0], t[1] + 0.13 * s, t[2]], 0.0035 * s, 0.0035 * s, { n: 4, cap: 1 });
    S.turn([[0.001, t[1] + 0.2 * s], [0.07 * s, t[1] + 0.155 * s], [0.095 * s, t[1] + 0.12 * s], [0.07 * s, t[1] + 0.118 * s]], t[0], w, { n: 12, kw: 0.45 });
  } else if (pose === 'hip') {
    A(L, [sx + L * 0.115, 0.45, 0.008], [hx + L * 0.066, 0.385, 0.016], false);
    A(-L, [sx - L * 0.1, 0.43, 0.008], [sx - L * 0.09, 0.34, 0.012]);
  } else {
    A(L, [sx + L * 0.09, 0.43, 0.006], [hx + L * 0.078, 0.34, 0.01]);
    A(-L, [sx - L * 0.09, 0.43, 0.008], [hx - L * 0.1, 0.34, 0.01]);
  }
}

/** A figure seated on the ground, legs crossed, hands joined or open in the lap; k: size (the seat at y). */
export function sit(S, x, y, k, lod, { throne = false, crown = 'tall', pose = 'lap' } = {}) {
  const full = lod >= 2, w = S.sink, P = (u, v, d = 0) => [x + u * k, y + v * k, w + d * k];
  S.blob(P(0, 0.01), [0.15, 0.02, 0.022].map((r) => r * k), { n: 10, m: 2 });
  S.blob(P(0, 0.045), [0.128 * k, 0.04 * k, 0.026 * k], { n: 12, m: 3 });                                                      // the crossed legs
  for (const q of [-1, 1]) S.blob(P(q * 0.1, 0.06, 0.004), [0.04 * k, 0.04 * k, 0.026 * k], { n: 8, m: 2 });                  // the knees
  S.tube([P(0, 0.07), P(0, 0.16), P(0, 0.235)], [[0.066 * k, 0.026 * k], [0.054 * k, 0.025 * k], [0.064 * k, 0.022 * k]], { seg: 2, n: full ? 8 : 6 });
  S.rod(P(-0.07, 0.232), P(0.07, 0.232), 0.02 * k, 0.02 * k, { n: 6, cap: 2 });
  S.rod(P(0, 0.23), P(0, 0.272), 0.017 * k, 0.015 * k, { n: 6, cap: 1 });
  head(S, x, y + 0.3 * k, k * 0.95, lod, { crown });
  const open = pose !== 'lap';
  for (const q of [-1, 1]) arm(S, P(q * 0.068, 0.225), P(q * 0.094, 0.15, 0.008), P(q * (open ? 0.1 : 0.04), open ? 0.1 : 0.09, 0.012), k, lod, open);
  if (full) S.rod(P(-0.12, 0.052, 0.02), P(0.12, 0.052, 0.02), 0.006 * k, 0.006 * k, { n: 4, cap: 1 });
}
