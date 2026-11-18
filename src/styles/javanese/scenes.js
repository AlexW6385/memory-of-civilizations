// The compositions of the narrative reliefs (docs/settlements/borobudur.md §20), modelled in the sculptor: an audience
// in a pavilion, a procession with an elephant, a sailing ship with outriggers, a hermitage in the forest, a wishing
// tree with its worshippers. A scene is drawn at (x, y) (its centre and its ground line) at size s, 1 being a canvas
// 2.2 m wide and 0.9 m high; h in [0, 1) (from the panel's own place) varies the details, so that no two are the same.
// lod 2 the full model, lod 1 the same with fewer rings and without the finest pieces.

import { stand, sit, head } from './figures.js';

const TAU = Math.PI * 2;

/** A tree: a trunk and two boughs, a crown of leaf masses in layers, fruits. */
export function tree(S, x, y, s, lod, h = 0.5, kind = 0) {
  const w = S.sink, P = (u, v, d = 0) => [x + u * s, y + v * s, w + d * s];
  S.tube([P(0, 0), P(0.012 * (h - 0.5), 0.22), P(-0.01, 0.42)], [[0.036 * s, 0.03 * s], [0.026 * s, 0.024 * s], [0.02 * s, 0.018 * s]], { seg: 3, n: 6, fold: (t, a) => 1 + 0.12 * Math.cos(a * 3 + t * 5) });
  for (const q of [-1, 1]) S.tube([P(0, 0.3), P(q * 0.07, 0.42, 0.004), P(q * 0.15, 0.52, 0.006)], [0.014 * s, 0.011 * s, 0.007 * s], { seg: 2, n: 4 });
  const full = lod >= 2, N = full ? 12 : 6;
  for (let i = 0; i < N; i++) {
    const a = i * 2.399 + h * 6, r = 0.04 + 0.19 * Math.sqrt((i + 0.5) / N), j = (Math.sin(i * 12.9 + h * 40) + 1) / 2;
    const u = Math.cos(a) * r * (kind ? 1.1 : 1.35), v = 0.58 + Math.sin(a) * r * 0.72 + (kind ? 0.05 : 0);
    const rr = (0.05 + 0.03 * j) * s;
    S.blob(P(u, v, 0.006 + 0.01 * j), [rr * 1.25, rr, 0.026 * s * (0.8 + j * 0.5)], { n: 7, m: 2, rot: a, mod: full ? (ph) => 1 + 0.12 * Math.cos(ph * 5 + i) : null });   // a mass of leaves
  }
  if (full) for (let i = 0; i < 5; i++) { const a = i * 1.7 + h * 9; S.blob(P(Math.cos(a) * 0.17, 0.52 + Math.sin(a * 1.3) * 0.1, 0.034), [0.013 * s, 0.013 * s, 0.011 * s], { n: 6, m: 2 }); }   // the fruits
}

/** A pavilion with real depth: a stepped platform, four posts, three tiers of roof overhanging, a finial, a throne under it. */
export function pavilion(S, x, y, s, lod) {
  const w = S.sink, full = lod >= 2, u = (a) => x + a * s, v = (a) => y + a * s;
  const box = (a0, a1, b0, b1, w0, w1, d) => S.plate([[u(a0), v(b0)], [u(a1), v(b0)], [u(a1), v(b1)], [u(a0), v(b1)]], w0, w1, d * s);
  box(-0.3, 0.3, 0, 0.04, w, 0.05, 0.006); box(-0.27, 0.27, 0.04, 0.085, w, 0.045, 0.006);
  for (const q of [-1, 1]) { S.turn([[0.012 * s, v(0.085)], [0.011 * s, v(0.1)], [0.009 * s, v(0.5)], [0.012 * s, v(0.53)]], u(q * 0.2), 0.03, { n: 8 }); if (full) S.turn([[0.01 * s, v(0.5)], [0.016 * s, v(0.53)], [0.001, v(0.555)]], u(q * 0.2), 0.03, { n: 8 }); }
  S.blob([u(0), v(0.085), w], [0.16 * s, 0.07 * s, 0.03 * s], { n: 10, m: 2 });                                      // the throne's cushion
  const tier = (hw, hw2, y0, y1, w1) => S.plate([[u(-hw), v(y0)], [u(hw), v(y0)], [u(hw2), v(y1)], [u(-hw2), v(y1)]], 0.012, w1, 0.028 * s);
  tier(0.33, 0.27, 0.5, 0.585, 0.07); tier(0.25, 0.18, 0.585, 0.665, 0.07); tier(0.17, 0.07, 0.665, 0.76, 0.07);
  for (const q of [-1, 1]) S.plate([[u(q * 0.33), v(0.5)], [u(q * 0.385), v(0.545)], [u(q * 0.36), v(0.505)]], 0.012, 0.07, 0.004 * s);   // the eaves turned up
  S.turn([[0.012 * s, v(0.76)], [0.007 * s, v(0.8)], [0.001, v(0.86)]], u(0), 0.05, { n: 6 });
  if (full) {
    for (let i = -2; i <= 2; i++) S.blob([u(i * 0.11), v(0.47), 0.03], [0.05 * s, 0.045 * s, 0.014 * s], { n: 6, m: 2 });   // the swags under the eaves
    for (let i = -3; i <= 3; i++) S.rod([u(i * 0.095), v(0.505), 0.04], [u(i * 0.095), v(0.585), 0.04], 0.004 * s, 0.004 * s, { n: 4, cap: 1, seg: 1 });   // the rafters' ends
  }
}

/** An apsara flying, a garland in her hands, her scarf streaming behind. */
export function apsara(S, x, y, s, lod, d = 1) {
  const w = S.sink, P = (u, v, e = 0) => [x + u * d * s, y + v * s, w + e * s];
  S.tube([P(-0.2, -0.01), P(-0.09, 0.0), P(0.02, 0.03), P(0.06, 0.07)], [[0.02 * s, 0.014 * s], [0.026 * s, 0.017 * s], [0.03 * s, 0.018 * s], [0.026 * s, 0.016 * s]], { seg: 3, n: 6 });   // the legs trailing and the body
  S.rod(P(0.0, 0.045, 0.004), P(0.05, 0.09, 0.008), 0.02 * s, 0.02 * s, { n: 6, cap: 1 });
  head(S, x + 0.095 * d * s, y + 0.125 * s, s * 0.62, lod, { f: true, crown: 'bun', tilt: 0.2 * d });
  const A = (a) => S.tube([P(0.05, 0.09, 0.01), P(0.1 + a * 0.02, 0.07, 0.015), P(0.15, 0.08 + a * 0.03, 0.02)], [0.009 * s, 0.007 * s, 0.006 * s], { seg: 2, n: 4 });
  A(0); if (lod >= 2) A(1);
  S.tube([P(0.14, 0.075, 0.016), P(0.1, 0.02, 0.016), P(0.06, -0.01, 0.016)], [0.005 * s, 0.006 * s, 0.005 * s], { seg: 3, n: 4 });   // the garland
  S.tube([P(0.01, 0.07, 0.012), P(-0.12, 0.13, 0.012), P(-0.25, 0.06, 0.012), P(-0.4, 0.14, 0.012)], [[0.012 * s, 0.004 * s], [0.016 * s, 0.004 * s], [0.014 * s, 0.004 * s], [0.004 * s, 0.003 * s]], { seg: 3, n: 4, fold: (t, a) => 1 + 0.3 * Math.sin(t * 9) });   // the scarf
}

/** A deer, standing, head up: body, neck, head with ears and antlers, four legs, the spots. */
export function deer(S, x, y, s, lod, d = 1, h = 0.5) {
  const w = S.sink, P = (u, v, e = 0) => [x + u * d * s, y + v * s, w + e * s];
  S.blob(P(0, 0.17), [0.1 * s, 0.05 * s, 0.032 * s], { n: 10, m: 3 });
  S.blob(P(-0.07, 0.165), [0.055 * s, 0.05 * s, 0.03 * s], { n: 8, m: 2 });
  S.tube([P(0.07, 0.19), P(0.12, 0.25), P(0.14, 0.31)], [[0.026 * s, 0.02 * s], [0.02 * s, 0.017 * s], [0.016 * s, 0.014 * s]], { seg: 2, n: 6 });
  S.blob(P(0.155, 0.325, 0.002), [0.03 * s, 0.017 * s, 0.015 * s], { n: 8, m: 2, rot: 0.4 * d });
  for (const q of [-1, 1]) {
    const a = 0.17 * q * 0 + (q < 0 ? -0.075 : 0.065), b = q < 0 ? -0.015 : 0.0;
    S.tube([P(a, 0.15, 0.004 * q), P(a + 0.008 * q, 0.07, 0.004 * q), P(a + 0.004 * q, 0.012, 0.004 * q)], [0.011 * s, 0.007 * s, 0.005 * s], { seg: 2, n: 4, cap: 1 });
    void b;
  }
  for (const a of [-0.045, 0.095]) S.tube([P(a, 0.15, 0.003), P(a + 0.01, 0.07, 0.003), P(a, 0.012, 0.003)], [0.01 * s, 0.006 * s, 0.005 * s], { seg: 2, n: 4, cap: 1 });
  S.blob(P(0.14, 0.355, 0.002), [0.007 * s, 0.022 * s, 0.006 * s], { n: 5, m: 2, rot: 0.5 });
  if (lod >= 2) {
    S.tube([P(0.15, 0.345), P(0.13, 0.4), P(0.16, 0.45)], [0.004 * s, 0.003 * s, 0.002 * s], { seg: 2, n: 4, cap: 1 });
    S.tube([P(0.15, 0.36), P(0.19, 0.4), P(0.2, 0.46)], [0.004 * s, 0.003 * s, 0.002 * s], { seg: 2, n: 4, cap: 1 });
    for (let i = 0; i < 5; i++) S.blob(P(-0.06 + i * 0.03 + (h - 0.5) * 0.01, 0.19 + (i % 2) * 0.012, 0.03), [0.006 * s, 0.006 * s, 0.004 * s], { n: 5, m: 2 });
  }
}

/** An elephant in profile with its mahout and a rider under a parasol; the caparison, the bell, the tusk, the trunk curled. */
export function elephant(S, x, y, s, lod, d = 1, h = 0.5) {
  const w = S.sink, full = lod >= 2, P = (u, v, e = 0) => [x + u * d * s, y + v * s, w + e * s];
  S.blob(P(-0.02, 0.33), [0.27 * s, 0.17 * s, 0.062 * s], { n: full ? 14 : 8, m: 4 });                                // the body
  S.blob(P(0.27, 0.42), [0.12 * s, 0.14 * s, 0.058 * s], { n: full ? 12 : 8, m: 3 });                                // the head
  S.blob(P(0.3, 0.55, 0.01), [0.075 * s, 0.05 * s, 0.05 * s], { n: 8, m: 3 });                                        // the forehead's boss
  S.tube([P(0.34, 0.4), P(0.42, 0.26), P(0.43, 0.1), P(0.38, 0.03), P(0.35, 0.07)], [[0.045 * s, 0.04 * s], [0.032 * s, 0.03 * s], [0.025 * s, 0.025 * s], [0.02 * s, 0.02 * s], [0.012 * s, 0.012 * s]], { seg: 3, n: 8, fold: full ? (t, a) => 1 + 0.07 * Math.cos(t * 30) : null });   // the trunk curled up at its tip
  S.blob(P(0.2, 0.44, 0.052), [0.07 * s, 0.1 * s, 0.014 * s], { n: 10, m: 2, rot: 0.25 * d });                          // the ear
  if (full) { S.blob(P(0.335, 0.5, 0.04), [0.008 * s, 0.008 * s, 0.006 * s], { n: 6, m: 2 }); S.tube([P(0.35, 0.37, 0.01), P(0.42, 0.33, 0.012), P(0.46, 0.36, 0.014)], [0.011 * s, 0.008 * s, 0.003 * s], { seg: 3, n: 5, cap: 1 }); }   // the eye, the tusk
  for (const [a, f] of [[-0.19, 0], [-0.11, 1], [0.13, 1], [0.2, 0]]) {
    S.tube([P(a, 0.22, f * 0.006), P(a + 0.005, 0.12, f * 0.006), P(a, 0.025, f * 0.006)], [[0.05 * s, 0.038 * s], [0.036 * s, 0.03 * s], [0.04 * s, 0.032 * s]], { seg: 2, n: 6 });
    S.blob(P(a, 0.012, f * 0.006), [0.044 * s, 0.02 * s, 0.026 * s], { n: 8, m: 2 });
    if (full) S.blob(P(a + 0.006, 0.12, f * 0.006 + 0.02), [0.026 * s, 0.026 * s, 0.01 * s], { n: 6, m: 2 });
  }
  S.tube([P(-0.28, 0.4), P(-0.34, 0.3), P(-0.33, 0.18)], [0.012 * s, 0.008 * s, 0.006 * s], { seg: 3, n: 4, cap: 1 });                    // the tail
  // the caparison: a cloth over the back with a fringe and its band, a bell on the neck
  S.blob(P(-0.04, 0.4, 0.03), [0.2 * s, 0.1 * s, 0.03 * s], { n: full ? 14 : 8, m: 3, mod: full ? (ph) => 1 + 0.06 * Math.cos(ph * 7) : null });
  if (full) {
    for (let i = 0; i < 9; i++) S.blob(P(-0.22 + i * 0.045, 0.285, 0.05), [0.014 * s, 0.026 * s, 0.01 * s], { n: 5, m: 2 });
    S.rod(P(0.1, 0.34, 0.04), P(0.1, 0.22, 0.04), 0.007 * s, 0.007 * s, { n: 4, cap: 1 });
    S.blob(P(0.11, 0.2, 0.046), [0.017 * s, 0.017 * s, 0.014 * s], { n: 6, m: 2 });
  }
  // the mahout on the neck, the rider on the back under his parasol
  const mp = P(0.17, 0.49), rp = P(-0.1, 0.46);
  sit(S, mp[0], mp[1], 0.52 * s, lod, { crown: 'bun' });
  S.rod(P(0.215, 0.6, 0.03), P(0.27, 0.65, 0.03), 0.0035 * s, 0.0035 * s, { n: 4, cap: 1, seg: 1 });                                        // his goad
  sit(S, rp[0], rp[1], 0.7 * s, lod, { throne: true });
  const t = [x - 0.1 * d * s, y + 0.46 * s + 0.31 * 0.7 * s];
  S.rod([t[0], t[1], w + 0.03], [t[0], t[1] + 0.11 * s, w + 0.03], 0.004 * s, 0.004 * s, { n: 4, cap: 1 });
  S.turn([[0.001, t[1] + 0.2 * s], [0.07 * s, t[1] + 0.15 * s], [0.1 * s, t[1] + 0.115 * s], [0.07 * s, t[1] + 0.11 * s]], t[0], w + 0.02, { n: 12, kw: 0.45 });
  void h;
}

/** A sailing ship with double outriggers (as on the reliefs): hull with raised prow and stern, planks, booms and floats, a tripod mast, the slanted sail, crew, the waves. */
export function ship(S, x, y, s, lod, d = 1, h = 0.5) {
  const w = S.sink, full = lod >= 2, P = (u, v, e = 0) => [x + u * d * s, y + v * s, w + e * s];
  const waves = (a, b, v0, n) => { for (let i = 0; i < n; i++) { const u = a + (b - a) * (i + 0.5) / n; S.blob(P(u, v0 + 0.012 * Math.sin(i * 2.1 + h * 5)), [0.085 * s, 0.026 * s, 0.014 * s], { n: 8, m: 2, rot: 0.15 * Math.sin(i) }); } };
  waves(-0.95, 0.95, 0.025, full ? 11 : 6);
  S.tube([P(-0.62, 0.3), P(-0.45, 0.14), P(-0.05, 0.1), P(0.45, 0.13), P(0.66, 0.32)], [[0.04 * s, 0.036 * s], [0.06 * s, 0.045 * s], [0.07 * s, 0.05 * s], [0.06 * s, 0.045 * s], [0.035 * s, 0.03 * s]], { seg: 3, n: 8 });
  if (full) { S.tube([P(-0.58, 0.3, 0.03), P(-0.4, 0.19, 0.04), P(0.4, 0.19, 0.04), P(0.6, 0.31, 0.03)], [0.008 * s, 0.008 * s, 0.008 * s, 0.008 * s], { seg: 3, n: 4, cap: 1 }); for (let i = 0; i < 9; i++) S.rod(P(-0.4 + i * 0.1, 0.13, 0.04), P(-0.4 + i * 0.1, 0.17, 0.04), 0.004 * s, 0.004 * s, { n: 4, cap: 1, seg: 1 }); }
  S.blob(P(-0.66, 0.36), [0.03 * s, 0.045 * s, 0.03 * s], { n: 8, m: 2 }); S.blob(P(0.7, 0.37), [0.03 * s, 0.05 * s, 0.03 * s], { n: 8, m: 2 });   // the curled stem and stern
  // the outriggers: floats and the booms joining them to the hull
  S.tube([P(-0.5, 0.075), P(0, 0.055), P(0.5, 0.075)], [[0.02 * s, 0.018 * s], [0.026 * s, 0.022 * s], [0.02 * s, 0.018 * s]], { seg: 3, n: 6 });
  for (const q of [-0.35, 0, 0.35]) S.rod(P(q, 0.12, 0.012), P(q + 0.03, 0.065, 0.014), 0.008 * s, 0.008 * s, { n: 4, cap: 1 });
  // the mast, the sail, its yards and stays
  S.rod(P(-0.1, 0.18, 0.03), P(0.0, 0.62, 0.032), 0.009 * s, 0.006 * s, { n: 5, cap: 1 }); S.rod(P(0.1, 0.18, 0.03), P(0.0, 0.62, 0.032), 0.009 * s, 0.006 * s, { n: 5, cap: 1 });
  const Q = (u, v) => { const p = P(u, v); return [p[0], p[1]]; };
  S.plate([Q(-0.34, 0.27), Q(0.4, 0.3), Q(0.28, 0.76), Q(-0.3, 0.68)], 0.018, 0.04, 0.012 * s);
  if (full) {
    for (let i = 1; i < 5; i++) { const f = i / 5, a0 = P(-0.34 + 0.74 * f, 0.27 + 0.03 * f, 0.045), a1 = P(-0.3 + 0.58 * f, 0.68 + 0.08 * f, 0.045); S.rod(a0, a1, 0.004 * s, 0.004 * s, { n: 4, cap: 1, seg: 1 }); }
    S.rod(P(0.66, 0.34, 0.03), P(0.02, 0.6, 0.03), 0.0035 * s, 0.0035 * s, { n: 4, cap: 1, seg: 1 }); S.rod(P(-0.62, 0.32, 0.03), P(0.0, 0.6, 0.03), 0.0035 * s, 0.0035 * s, { n: 4, cap: 1, seg: 1 });
  }
  // the crew
  for (const [u, k] of [[-0.35, 0.5], [-0.08, 0.46], [0.3, 0.5]]) { const p = P(u, 0.14); sit(S, p[0], p[1], k * s, lod, { crown: 'bun' }); }
}

/** A hut of leaves and thatch on posts, open to the front, with an ascetic seated in it. */
export function hut(S, x, y, s, lod) {
  const w = S.sink, u = (a) => x + a * s, v = (a) => y + a * s;
  S.plate([[u(-0.3), v(0)], [u(0.3), v(0)], [u(0.28), v(0.05)], [u(-0.28), v(0.05)]], w, 0.04, 0.006 * s);
  for (const q of [-1, 1]) S.turn([[0.011 * s, v(0.05)], [0.009 * s, v(0.45)], [0.012 * s, v(0.47)]], u(q * 0.25), 0.04, { n: 8 });
  S.plate([[u(-0.36), v(0.46)], [u(0.36), v(0.46)], [u(0.22), v(0.72)], [u(-0.22), v(0.72)]], 0.015, 0.075, 0.012 * s);
  if (lod >= 2) for (let i = 0; i < 6; i++) S.rod([u(-0.33 + i * 0.132), v(0.465), 0.075], [u(-0.2 + i * 0.08), v(0.7), 0.075], 0.004 * s, 0.004 * s, { n: 4, cap: 1, seg: 1 });
  sit(S, u(0), v(0.05), 0.9 * s, lod, { crown: 'bun', pose: 'lap' });
}

/** The compositions in rotation. */
export const SCENE_NAMES = ['audience', 'procession', 'ship', 'hermitage', 'wishing tree'];
export function scene(i, S, x, y, s, lod, h) {
  const L = h < 0.5 ? 1 : -1;
  switch (((i % 5) + 5) % 5) {
    case 0:   // the audience: a lord throned in his pavilion, attendants with parasol and whisk, worshippers, apsaras above
      pavilion(S, x - 0.35 * s, y, s, lod);
      sit(S, x - 0.35 * s, y + 0.085 * s, 0.86 * s, lod, { throne: true, pose: 'lap' });
      stand(S, x + 0.28 * s, y, s * 0.92, -1, lod, { pose: 'whisk' }); stand(S, x + 0.55 * s, y, s * 0.92, 1, lod, { pose: 'parasol', f: true });
      sit(S, x + 0.9 * s, y, 0.62 * s, lod, { pose: 'offer', crown: 'bun' });
      if (lod >= 2) stand(S, x - 0.9 * s, y, s * 0.9, L, lod, { pose: 'offer', f: h > 0.25 });
      apsara(S, x + 0.4 * s, y + 0.74 * s, s * 0.85, lod, 1);
      break;
    case 1:   // the procession: an elephant with its riders, attendants before and behind, a tree
      elephant(S, x - 0.1 * s, y, s * 1.05, lod, 1, h);
      stand(S, x + 0.58 * s, y, s * 0.95, -1, lod, { pose: 'lotus' }); stand(S, x + 0.8 * s, y, s * 0.9, 1, lod, { pose: 'whisk', f: true });
      if (lod >= 2) stand(S, x - 0.8 * s, y, s * 0.9, L, lod, { pose: 'hip' });
      tree(S, x + 1.08 * s, y, s * 0.7, lod, h, 1);
      break;
    case 2:   // a ship under sail on a rippling sea
      ship(S, x, y, s * 1.12, lod, h < 0.5 ? 1 : -1, h);
      if (lod >= 2) apsara(S, x - 0.5 * s, y + 0.8 * s, s * 0.7, lod, 1);
      break;
    case 3:   // the hermitage: a hut with its ascetic between trees, a disciple, deer
      tree(S, x - 0.98 * s, y, s * 0.95, lod, h, 0); hut(S, x - 0.35 * s, y, s, lod);
      deer(S, x + 0.3 * s, y, s * 1.05, lod, -1, h); deer(S, x + 0.62 * s, y + 0.0, s * 0.8, lod, 1, h + 0.3);
      stand(S, x + 0.9 * s, y, s * 0.88, -1, lod, { pose: 'offer' });
      tree(S, x + 1.02 * s, y, s * 0.6, lod, h + 0.4, 1);
      break;
    default:  // the wishing tree: worshippers in tribhanga bringing offerings
      tree(S, x, y, s * 1.4, lod, h, 0);
      stand(S, x - 0.62 * s, y, s * 0.95, 1, lod, { pose: 'lotus', f: true }); stand(S, x - 0.9 * s, y, s * 0.9, -1, lod, { pose: 'offer' });
      stand(S, x + 0.62 * s, y, s * 0.95, -1, lod, { pose: 'whisk' }); stand(S, x + 0.92 * s, y, s * 0.9, 1, lod, { pose: 'lotus', f: true });
      if (lod >= 2) deer(S, x + 0.28 * s, y, s * 0.6, lod, 1, h);
  }
}
void head; void TAU;
