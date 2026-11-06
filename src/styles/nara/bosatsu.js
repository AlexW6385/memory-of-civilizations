// The two attendant bodhisattvas of the Great Buddha (docs/settlements/nara.md §4): Kokūzō
// (Ākāśagarbha, wisdom and memory) on the west — the visitor's left — and Nyoirin Kannon (the
// wish-fulfilling jewel and the wheel) on the east, each seated in the lotus posture on a lotus
// throne before a boat-shaped halo; gilt, the hair dark. A bodhisattva is a prince, not a monk: the
// hair drawn up in a high knot under a crown of openwork plaques with ribbons, strands of hair over
// the shoulders, long ears, a necklace of beads and pendants, armlets and bracelets, a sash across
// the bare chest, a skirt folded over the crossed legs, a scarf over the arms falling in loops at
// the sides. Kokūzō raises a sword in the right hand and holds the jewel on the left palm;
// Nyoirin holds the jewel before the chest in the right hand and the wheel on the left knee.

import { figure, setFigure, along, lerp } from './sculpt.js';

const GILT = 'clay_gilt', METAL = 'gilt_bronze', HAIR = 'lacquer_black', RED = 'lacquer_red', JEWEL = 'gold', BLADE = 'gilt_bronze';

/** bosatsu { at, y (the dais), dir (facing), bodhisattva ('kokuzo' | 'nyoirin'), h (seat to the top of the knot, 5.2 m) } */
export function bosatsu(el, { bag, col }) {
  const kind = el.bodhisattva === 'nyoirin' ? 'nyoirin' : 'kokuzo', s = (el.h ?? 5.2) / 5.2, P = 2.2;
  const f = figure(`bosatsu|${kind}`, (S) => build(S, kind));
  const [x, z] = el.at, y = el.y ?? 0;
  setFigure(bag, f, el.at, y + P * s, el.dir || [0, 1], s);
  col.circle(x, z, 2.7 * s, y, y + P * s);
  col.circle(x, z, 1.9 * s, y + P * s, y + (P + 5.2) * s);
}

function build(S, kind) {
  pedestal(S);
  // ---- the crossed legs under the skirt, the soles turned up, the folds over the lap
  S.lathe(GILT, [[0.001, 0], [1.85, 0], [1.97, 0.25], [1.78, 0.6], [1.15, 0.86], [0.001, 0.9]], 28, (th) => 1 + 0.022 * Math.cos(th * 15), [0, 0, 0.35], 0.62);
  for (const sx of [-1, 1]) S.ball(GILT, [sx * 0.75, 0.62, 0.75], 0.22, [1.5, 0.9, 2.2], 10, 7);
  for (let k = 0; k < 4; k++) S.tube(GILT, along((t) => { const u = -1 + 2 * t; return [u * (1.6 - k * 0.22), 0.72 - k * 0.12 - 0.18 * (1 - u * u), 1.32 + k * 0.1 - 0.32 * u * u, 0.045, 0.04]; }, 10), 6);
  // the skirt's hem falling over the front of the seat
  S.tube(GILT, along((t) => { const u = -1 + 2 * t; return [u * 1.5, 0.05 + 0.04 * Math.cos(u * 9), 1.42 - 0.35 * u * u, 0.06, 0.05]; }, 14), 6);
  // ---- the torso, bare; the sash across it from the left shoulder to the right hip
  const torso = [[0.001, 0.4], [0.95, 0.4], [0.86, 1.2], [0.82, 1.7], [0.95, 2.4], [1.02, 2.78], [0.86, 3.04], [0.42, 3.2], [0.001, 3.22]], TZ = -0.1, KZ = 0.62;
  S.lathe(GILT, torso, 24, null, [0, 0, TZ], KZ);
  const rad = (prof, y) => { for (let i = 0; i < prof.length - 1; i++) if (y >= prof[i][1] && y <= prof[i + 1][1]) return prof[i][0] + (prof[i + 1][0] - prof[i][0]) * (y - prof[i][1]) / ((prof[i + 1][1] - prof[i][1]) || 1); return 0; };
  const front = (x, y, o = 0) => TZ + KZ * Math.sqrt(Math.max(0.01, rad(torso, y) ** 2 - x * x)) + o;
  S.tube(GILT, along((t) => { const x = 0.72 - 1.5 * t, y = 2.95 - 1.75 * t; return [x, y, front(x, y, 0.03), 0.09, 0.03]; }, 10), 6);
  S.tube(GILT, along((t) => { const x = -0.95 + 1.9 * t, y = 1.25 + 0.05 * Math.sin(t * 9); return [x, y, front(x, y, 0.02), 0.07, 0.05]; }, 12), 6);   // the skirt's waistband
  // ---- the necklace: two strands of beads with pendants, a jewel at the middle
  for (const [yc, ys, dz] of [[2.42, 2.86, 0.04], [2.05, 2.8, 0.05]]) {
    const pts = along((t) => { const u = -1 + 2 * t, x = u * 0.62, y = yc + (ys - yc) * u * u; return [x, y, front(x, y, dz)]; }, 16);
    for (const p of pts) S.ball(METAL, p, 0.045, [1, 1, 1], 6, 5);
    for (let i = 2; i < pts.length - 2; i += 3) S.tube(METAL, [[...pts[i], 0.02], [pts[i][0], pts[i][1] - 0.14, pts[i][2] + 0.02, 0.035], [pts[i][0], pts[i][1] - 0.2, pts[i][2] + 0.03, 0.005]], 5);
  }
  S.ball(JEWEL, [0, 2.36, front(0, 2.36, 0.08)], 0.09, [1, 1.2, 0.6], 8, 6);
  // ---- the neck with its three folds, the head
  S.lathe(GILT, [[0.33, 3.05], [0.34, 3.14], [0.31, 3.2], [0.33, 3.27], [0.3, 3.33], [0.31, 3.4], [0.001, 3.45]], 16, null, [0, 0, 0.02]);
  const head = [[0.001, 3.36], [0.3, 3.39], [0.43, 3.56], [0.48, 3.85], [0.5, 4.1], [0.48, 4.3], [0.38, 4.5], [0.2, 4.6], [0.001, 4.62]], HZ = 0.06, HK = 1.08;
  S.lathe(GILT, head, 22, null, [0, 0, HZ], HK);
  const face = (x, y, o = 0) => HZ + HK * Math.sqrt(Math.max(0.005, rad(head, y) ** 2 - x * x)) + o;
  // the hair: a cap above the hairline, down the back of the head to the nape; the high knot
  S.lathe(HAIR, [[0.47, 4.15], [0.5, 4.3], [0.41, 4.5], [0.22, 4.61], [0.001, 4.64]], 22, null, [0, 0.015, HZ], HK * 1.03, 1.03);
  S.lathe(HAIR, [[0.32, 3.5], [0.47, 3.75], [0.51, 4.05], [0.5, 4.25]], 22, (th) => 1.04 - 0.3 * Math.min(1, Math.max(0, (Math.sin(th) + 0.3) / 0.5)), [0, 0, HZ], HK);
  S.lathe(HAIR, [[0.001, 4.5], [0.28, 4.54], [0.33, 4.75], [0.29, 4.98], [0.14, 5.1], [0.001, 5.13]], 16, (th) => 1 + 0.06 * Math.cos(th * 8), [0, 0, -0.04]);
  for (let k = 0; k < 3; k++) S.loop(HAIR, along((t) => { const a = t * Math.PI * 2; return [Math.cos(a) * (0.3 - k * 0.04), 4.66 + k * 0.13, -0.04 + Math.sin(a) * (0.3 - k * 0.04)]; }, 14).slice(0, 14), 0.03);
  // the strands of hair from behind the ears over the shoulders
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) S.tube(HAIR, [[sx * 0.44, 3.95, -0.1 - k * 0.07, 0.05], [sx * (0.62 + k * 0.05), 3.35, -0.08 - k * 0.04, 0.06], [sx * (0.88 + k * 0.05), 2.95, -0.02 - k * 0.05, 0.055], [sx * (1.02 + k * 0.03), 2.55, 0.05 - k * 0.05, 0.03]], 6);
  // the crown: a band round the head, the openwork plaques standing on it (a tall one at the front
  // and lower ones at the sides), rosettes at the temples, ribbons falling from them to the shoulders
  const band = along((t) => { const a = t * Math.PI * 2; return [Math.cos(a) * 0.53, 4.27, HZ + Math.sin(a) * 0.58]; }, 24).slice(0, 24);
  S.loop(METAL, band, 0.035, 0.06);
  for (const [a, hgt, w] of [[0, 0.58, 0.26], [0.55, 0.42, 0.2], [-0.55, 0.42, 0.2], [1.1, 0.3, 0.16], [-1.1, 0.3, 0.16]]) {
    const th = Math.PI / 2 - a, c = [Math.cos(th) * 0.55, 4.27, HZ + Math.sin(th) * 0.6], n = [Math.cos(th), 0.25, Math.sin(th)], t = [-Math.sin(th), 0, Math.cos(th)];
    const P = (u, v) => [c[0] + t[0] * u * w + n[0] * v * 0.12, c[1] + v * hgt, c[2] + t[2] * u * w + n[2] * v * 0.12];
    S.plate(METAL, [P(0, 0), P(1, 0.05), P(0.95, 0.4), P(0.55, 0.55), P(0.6, 0.8), P(0.2, 0.82), P(0, 1), P(-0.2, 0.82), P(-0.6, 0.8), P(-0.55, 0.55), P(-0.95, 0.4), P(-1, 0.05)], n, 0.04);
    S.ball(JEWEL, P(0, 0.42).map((v, i) => v + (i === 1 ? 0 : n[i] * 0.04)), 0.055, [1, 1, 1], 7, 5);
  }
  for (const sx of [-1, 1]) {
    S.ball(METAL, [sx * 0.55, 4.27, HZ - 0.02], 0.09, [0.6, 1, 1], 8, 6);
    S.tube(METAL, [[sx * 0.58, 4.25, HZ - 0.05, 0.04, 0.015], [sx * 0.7, 3.8, HZ - 0.12, 0.05, 0.015], [sx * 0.86, 3.2, HZ - 0.08, 0.055, 0.015], [sx * 1.0, 2.7, HZ + 0.02, 0.04, 0.012]], 5);
  }
  // the face: brows, lowered lids, nose, lips, the urna; the long ears
  for (const sx of [-1, 1]) {
    S.tube(GILT, along((t) => { const x = sx * (0.06 + 0.3 * t); return [x, 4.03 + 0.05 * Math.sin(Math.PI * t) - 0.03 * t, face(x, 4.03, 0.012), 0.022, 0.02]; }, 6), 5);
    S.tube(GILT, along((t) => { const x = sx * (0.09 + 0.24 * t); return [x, 3.9 + 0.025 * Math.sin(Math.PI * t), face(x, 3.9, 0.006), 0.018, 0.014]; }, 6), 5);
    const E = (y, o, f) => [sx * (0.47 + o), y, HZ + 0.02 + f];
    S.plate(GILT, [E(4.0, 0, 0.06), E(3.98, 0.08, -0.06), E(3.78, 0.1, -0.1), E(3.55, 0.08, -0.07), E(3.45, 0.03, 0), E(3.52, 0.01, 0.06), E(3.82, 0.02, 0.09)], [sx, 0, 0], 0.07);
  }
  S.tube(GILT, [[0, 3.98, face(0, 3.98, -0.02), 0.045], [0, 3.78, face(0, 3.78, 0.05), 0.06], [0, 3.72, face(0, 3.72, 0.07), 0.065, 0.05]], 7);
  for (const sx of [-1, 1]) S.ball(GILT, [sx * 0.06, 3.7, face(sx * 0.06, 3.7, 0.03)], 0.035, [1, 1, 1], 6, 5);
  S.tube(GILT, along((t) => { const x = -0.13 + 0.26 * t; return [x, 3.58 + 0.012 * Math.cos(x * 22), face(x, 3.58, 0.012), 0.018, 0.024]; }, 6), 5);
  S.ball(JEWEL, [0, 4.07, face(0, 4.07, 0.0)], 0.035, [1, 1, 1], 6, 5);
  // ---- the arms, the armlets and bracelets, the scarf
  const SH = (sx) => [sx * 0.98, 2.82, -0.12];
  const arm = (sx, E, Wr) => {
    S.tube(GILT, [[...SH(sx), 0.27], [...lerp(SH(sx), E, 0.5), 0.23], [...E, 0.2]], 10);
    S.tube(GILT, [[...E, 0.2], [...lerp(E, Wr, 0.5), 0.17], [...Wr, 0.13]], 10);
    S.ball(GILT, E, 0.2, [1, 1, 1], 8, 6);
    const ar = lerp(SH(sx), E, 0.38), d = E.map((v, i) => v - SH(sx)[i]);
    S.tube(METAL, [[...ar.map((v, i) => v - d[i] * 0.05), 0.26], [...ar.map((v, i) => v + d[i] * 0.05), 0.26]], 10);
    S.ball(JEWEL, ar.map((v, i) => v + [sx * 0.24, 0.02, 0.05][i]), 0.05);
    const dw = Wr.map((v, i) => v - E[i]), br = lerp(E, Wr, 0.9);
    S.tube(METAL, [[...br.map((v, i) => v - dw[i] * 0.04), 0.155], [...br.map((v, i) => v + dw[i] * 0.04), 0.155]], 10);
  };
  // the scarf: over the back and the shoulders, along the outside of the upper arms, under the
  // elbows, then hanging in a loop beside the knees onto the throne
  for (const sx of [-1, 1]) {
    S.tube(GILT, [[0, 2.95, -0.66, 0.1, 0.025], [sx * 0.6, 3.02, -0.55, 0.1, 0.025], [sx * 1.05, 2.92, -0.25, 0.1, 0.025], [sx * 1.27, 2.45, -0.05, 0.09, 0.025], [sx * 1.45, 1.95, 0.12, 0.08, 0.025], [sx * 1.6, 1.55, 0.35, 0.07, 0.025], [sx * 1.85, 0.95, 0.75, 0.07, 0.025], [sx * 2.02, 0.45, 1.05, 0.07, 0.025], [sx * 2.08, 0.05, 1.3, 0.06, 0.025]], 6);
    S.tube(GILT, [[sx * 2.08, 0.05, 1.3, 0.06, 0.025], [sx * 2.0, -0.25, 1.55, 0.06, 0.025], [sx * 1.85, -0.3, 1.75, 0.05, 0.02], [sx * 1.7, -0.12, 1.85, 0.04, 0.02]], 6);
  }
  if (kind === 'kokuzo') {
    // the right hand (−x) raised before the shoulder holding the sword upright
    const E = [-1.36, 1.92, 0.32], Wr = [-1.02, 2.18, 1.02];
    arm(-1, E, Wr);
    fist(S, Wr, [0.3, 0.6, 1]);
    sword(S, [-0.98, 2.3, 1.14]);
    // the left hand on the knee, palm up, the jewel on it
    const E2 = [1.36, 1.74, 0.24], W2 = [1.36, 0.97, 0.95];
    arm(1, E2, W2);
    palmUp(S, [1.36, 0.93, 1.16], 1);
    jewel(S, [1.36, 1.02, 1.2], 0.15);
  } else {
    // the right hand before the chest, palm up, holding the jewel
    const E = [-1.3, 1.86, 0.3], Wr = [-0.62, 2.2, 0.86];
    arm(-1, E, Wr);
    palmUp(S, [-0.5, 2.18, 1.0], -1);
    jewel(S, [-0.5, 2.27, 1.02], 0.14);
    // the left hand on the knee holding the wheel of the law upright
    const E2 = [1.36, 1.74, 0.24], W2 = [1.36, 0.97, 0.95];
    arm(1, E2, W2);
    fist(S, [1.38, 0.95, 1.12], [0, 1, 0.2]);
    wheel(S, [1.38, 1.5, 1.18], 0.34);
  }
  halo(S);
}

/** The lotus throne under the seat (y −2.2 to 0): the octagonal plinth in two steps, the drum, the downturned petals, the lotus of three rows of upturned petals, the seat. */
function pedestal(S) {
  S.lathe1(RED, [[2.75, -2.2], [2.75, -1.95], [2.55, -1.95], [2.55, -1.72], [0.001, -1.72]], 8, [0, 0, 0]);
  S.lathe1(METAL, [[2.78, -1.98], [2.78, -1.92], [2.58, -1.92], [2.58, -1.98]], 8);
  S.lathe1(RED, [[2.3, -1.72], [2.3, -1.6], [1.6, -1.55], [1.55, -1.05], [0.001, -1.0]], 8);
  S.lathe1(METAL, [[1.62, -1.4], [1.62, -1.32], [1.58, -1.32], [1.58, -1.4]], 16);
  for (let k = 0; k < 16; k++) {
    const a = (k + 0.5) / 16 * Math.PI * 2, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]];
    const P = (w, r, y) => [d[0] * r + t[0] * w, y, d[1] * r + t[1] * w];
    S.plate(GILT, [P(0, 1.5, -1.0), P(0.38, 1.75, -1.05), P(0.36, 2.05, -1.2), P(0, 2.3, -1.42), P(-0.36, 2.05, -1.2), P(-0.38, 1.75, -1.05)], [d[0] * 0.3, 1, d[1] * 0.3], 0.06);
  }
  S.lathe(GILT, [[0.001, -1.05], [1.25, -1.0], [1.8, -0.75], [2.15, -0.4], [2.25, -0.12], [0.001, -0.1]], 24, null, [0, 0, 0]);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 16; k++) {
    const a = (k + row * 0.5) / 16 * Math.PI * 2, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], r0 = 1.35 + row * 0.32, y0 = -0.95 + row * 0.24, hgt = 0.8 - row * 0.12, w = 0.42 - row * 0.03;
    const P = (u, v, o) => [d[0] * (r0 + o) + t[0] * u, y0 + v, d[1] * (r0 + o) + t[1] * u];
    S.plate(GILT, [P(0, 0, 0), P(w, 0.12, 0.1), P(w * 0.95, 0.45, 0.28), P(w * 0.5, hgt * 0.85, 0.42), P(0, hgt, 0.5), P(-w * 0.5, hgt * 0.85, 0.42), P(-w * 0.95, 0.45, 0.28), P(-w, 0.12, 0.1)], [d[0], -0.5, d[1]], 0.06);
    S.tube(METAL, [[...P(0, 0.1, 0.08), 0.012], [...P(0, hgt - 0.08, 0.49), 0.012]], 4);
  }
  S.lathe1(GILT, [[2.05, -0.14], [2.08, -0.06], [2.0, 0.0], [0.001, 0.0]], 24);
}

/** The boat-shaped halo behind the figure: a gilt plate with a raised rim and flame tongues round it, the round head halo and the body halo in rings on it, on a post from the throne. */
function halo(S) {
  const Z = -1.02, shape = (t) => { const a = t * Math.PI; const w = 2.3 * Math.sin(Math.min(Math.PI / 2, a * 1.25 + 0.5)) * (t > 0.5 ? Math.pow(Math.cos((t - 0.5) * Math.PI), 0.9) : 1); return w; };
  const outline = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12, y = 0.15 + 6.6 * t; outline.push([shape(t), y]); }
  const R = outline.map(([w, y]) => [w, y, Z]), Lf = outline.slice().reverse().map(([w, y]) => [-w, y, Z]);
  const pts = [...R, ...Lf.slice(1)];
  // the plate (the outline is convex: a fan from its first point)
  const c = [0, 3.0, Z];
  S.plate(METAL, pts, [0, 0, 1], 0.1);
  S.tube(METAL, pts.map((p) => [p[0] * 0.97, p[1] + (p[1] > 6 ? -0.05 : 0), Z + 0.07, 0.06, 0.05]), 6);
  // flame tongues round the upper rim
  for (let i = 2; i < pts.length - 3; i++) {
    if (pts[i][1] < 1.2) continue;
    const a = pts[i], b = pts[i + 1], m = lerp(a, b, 0.5), o = [m[0] - c[0], m[1] - c[1]], l = Math.hypot(...o) || 1, n = [o[0] / l, o[1] / l];
    S.plate(METAL, [[a[0], a[1], Z], [b[0], b[1], Z], [m[0] + n[0] * 0.32 + n[1] * 0.12, m[1] + n[1] * 0.32 - n[0] * 0.12, Z]], [0, 0, 1], 0.06);
  }
  // the head halo: concentric rings and rays; the body halo: two rings
  const hc = [0, 3.98, Z + 0.06];
  for (const r of [0.98, 0.72, 0.42]) S.loop(METAL, along((t) => [hc[0] + Math.cos(t * Math.PI * 2) * r, hc[1] + Math.sin(t * Math.PI * 2) * r, hc[2]], 28).slice(0, 28), 0.035, 0.035, 5);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; S.tube(METAL, [[hc[0] + Math.cos(a) * 0.45, hc[1] + Math.sin(a) * 0.45, hc[2], 0.022], [hc[0] + Math.cos(a) * 0.7, hc[1] + Math.sin(a) * 0.7, hc[2], 0.022]], 4); }
  for (const r of [1.6, 1.4]) S.loop(METAL, along((t) => [Math.cos(t * Math.PI * 2) * r * 1.05, 1.95 + Math.sin(t * Math.PI * 2) * r, Z + 0.06], 32).slice(0, 32).filter((p) => p[1] > 0.3), 0.035, 0.035, 5);
  S.tube(METAL, [[0, -1.0, Z - 0.05, 0.14], [0, 0.3, Z - 0.05, 0.12]], 8);
}

function sword(S, h) {
  // the hilt in the fist, the guard, the straight double-edged blade pointing up
  S.tube(METAL, [[h[0], h[1] - 0.22, h[2], 0.045], [h[0], h[1] + 0.12, h[2], 0.045]], 6);
  S.ball(METAL, [h[0], h[1] - 0.22, h[2]], 0.06);
  S.tube(METAL, [[h[0] - 0.17, h[1] + 0.14, h[2], 0.03, 0.035], [h[0] + 0.17, h[1] + 0.14, h[2], 0.03, 0.035]], 6);
  const y0 = h[1] + 0.18, y1 = y0 + 1.85, w = 0.07;
  S.plate(BLADE, [[h[0] - w, y0, h[2]], [h[0] + w, y0, h[2]], [h[0] + w * 0.9, y1 - 0.18, h[2]], [h[0], y1, h[2]], [h[0] - w * 0.9, y1 - 0.18, h[2]]], [0, 0, 1], 0.025);
}
function jewel(S, p, r) {
  // the wish-fulfilling jewel: a pearl drawn up to a point, flames round it, on a little lotus
  S.ball(JEWEL, [p[0], p[1] + 0.02, p[2]], r * 0.55, [1, 1, 1], 8, 5);
  S.tube(JEWEL, [[p[0], p[1] + r * 0.5, p[2], r * 0.8], [p[0], p[1] + r * 1.25, p[2], r * 0.55], [p[0], p[1] + r * 1.9, p[2], 0.005]], 9);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; S.tube(METAL, [[p[0] + Math.cos(a) * r * 0.6, p[1] + r * 0.9, p[2] + Math.sin(a) * r * 0.6, r * 0.2], [p[0] + Math.cos(a) * r * 0.95, p[1] + r * 1.6, p[2] + Math.sin(a) * r * 0.95, 0.004]], 5); }
}
function wheel(S, c, r) {
  // the wheel of the law: rim, hub, eight spokes, eight points beyond the rim; on a short stem
  S.loop(JEWEL, along((t) => [c[0], c[1] + Math.cos(t * Math.PI * 2) * r, c[2] + Math.sin(t * Math.PI * 2) * r * 0.25], 24).slice(0, 24), 0.035, 0.03, 5);
  S.ball(JEWEL, c, 0.07);
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, d = [0, Math.cos(a), Math.sin(a) * 0.25];
    S.tube(JEWEL, [[c[0], c[1] + d[1] * 0.06, c[2] + d[2] * 0.06, 0.018], [c[0], c[1] + d[1] * r, c[2] + d[2] * r, 0.018]], 4);
    S.tube(JEWEL, [[c[0], c[1] + d[1] * r, c[2] + d[2] * r, 0.03], [c[0], c[1] + d[1] * (r + 0.12), c[2] + d[2] * (r + 0.12), 0.004]], 5);
  }
  S.tube(METAL, [[c[0], c[1] - r - 0.15, c[2], 0.03], [c[0], c[1] - r, c[2], 0.03]], 5);
}
function palmUp(S, c, sx) {
  // the palm up, the fingers forward and a little curled, the thumb at the side toward the body
  S.ball(GILT, [c[0], c[1] + 0.05, c[2]], 0.05, [2.4, 1, 2.6], 8, 6);
  for (let f = 0; f < 4; f++) { const x = c[0] - 0.09 + f * 0.06; S.tube(GILT, [[x, c[1] + 0.01, c[2] + 0.1, 0.028], [x, c[1] - 0.005, c[2] + 0.2, 0.024], [x, c[1] + 0.02, c[2] + 0.27 - (f === 0 || f === 3 ? 0.03 : 0), 0.02]], 6); }
  S.tube(GILT, [[c[0] - sx * 0.12, c[1] + 0.02, c[2] - 0.02, 0.03], [c[0] - sx * 0.18, c[1] + 0.06, c[2] + 0.1, 0.022]], 6);
}
function fist(S, c, dir) {
  // a closed hand round a hilt or a stem: the fist, the knuckles, the thumb over them
  S.ball(GILT, [c[0], c[1] - 0.12, c[2]], 0.12, [1, 1.1, 1.1], 8, 6);
  for (let f = 0; f < 4; f++) S.ball(GILT, [c[0] + 0.1 * (dir[2] > 0.5 ? 1 : 0.6), c[1] - 0.05 - f * 0.055, c[2] + 0.06], 0.035, [1, 1, 1], 6, 5);
  S.tube(GILT, [[c[0] - 0.07, c[1] - 0.02, c[2] - 0.06, 0.035], [c[0] - 0.02, c[1] + 0.03, c[2] + 0.08, 0.028]], 6);
}
