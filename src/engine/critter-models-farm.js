// The four farm animals the settlements lacked as moving figures, added to the critters' MODELS from here (critter-models.js is not changed): the HORSE (small
// pre-modern breed, withers 1.4 m), the OX (draught/plough/cart ox, withers 1.3 m; a hump and a dewlap make it the ZEBU), the DONKEY (withers 1.05 m) and the SHEEP
// (withers 0.65 m; a horned primitive kind too). All stand on the quadruped rig of the dog (parts 1 neck, 2 head, 3 tail, 4–7 legs: front −z, front +z, hind −z, hind +z;
// 11 the eyes) and move with the grazer pose (critter-poses.js): a walk to a spot, a stand with the head down to the grass or up and looking about, the head lifting
// and turning to the visitor. Colour variants are separate models (a model's colours are baked): horse_bay/chestnut/grey/black, ox_red/dun/white/pied,
// zebu_red/white/grey, donkey_grey/brown, sheep_white/dark/horned. Metres, +x forward, feet at y = 0. Proportions [inferred from the animals' standard measurements:
// the small pre-modern horse 13–14.2 hands (1.35–1.45 m), the donkey 0.9–1.1 m, the ox 1.2–1.4 m, primitive sheep 0.55–0.7 m at the withers].
// FARM_GAIT gives each model's walk (see fauna-critters.js): stride = 2 × hip height × sin(swing), so that the feet do not slide.
import { Model, MODELS } from './critter-models.js';

const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const hash3 = (p, s = 0) => { const k = Math.sin(p[0] * 127.1 + p[1] * 311.7 + p[2] * 74.7 + s * 19.19) * 43758.5453; return k - Math.floor(k); };
const cell = (p, k, s) => hash3([Math.round(p[0] * k), Math.round(p[1] * k), Math.round(p[2] * k)], s);
// (the eyes: as critter-models.js's, parts 11 blinking about the head's and the neck's pivots)
const eyes = (m, x, y, z, r, col) => { const hp = m.def.pv, np = m.def.pv2 || m.def.pv; for (const s of [-1, 1]) m.as(11, [x, y, s * z], hp, () => m.ball([x, y, s * z], [r, r * 1.05, r], col, { nu: 4, nv: 5 }), np); };
/** The hind leg's path with its hock rounded: a Catmull-Rom point is put in the two segments about the hock (indices 0-1, 1-2 and 2-3), radii averaged, so that the bend is three short turns, not one kink. */
function hock(path, rad) {
  const cr = (a, b, c, d) => a.map((_, i) => 0.5 * (2 * b[i] + (-a[i] + c[i]) * 0.5 + (2 * a[i] - 5 * b[i] + 4 * c[i] - d[i]) * 0.25 + (-a[i] + 3 * b[i] - 3 * c[i] + d[i]) * 0.125));
  const sx = path.map((q, i) => (i >= 1 && i <= path.length - 3 ? [q[0] * 0.5 + (path[i - 1][0] + path[i + 1][0]) * 0.25, q[1]] : q));   // (the zig-zag of x along the leg eased first)
  path = sx;
  const P = [], R = [];
  path.forEach((q, i) => {
    P.push(q); R.push(rad[i]);
    if (i <= 2) {
      const a = path[Math.max(i - 1, 0)], c = path[i + 1], d = path[Math.min(i + 2, path.length - 1)], r0 = rad[i], r1 = rad[i + 1];
      P.push(cr(a, q, c, d)); R.push(Array.isArray(r0) ? r0.map((v, k) => (v + r1[k]) / 2) : (r0 + r1) / 2);
    }
  });
  return [P, R];
}
/** The four legs of a quadruped: spec { fx, hx, fz, hz, front: [path, radii], hind: [path, radii], col(t, front), hoof: [rx, ry, rz], hoofCol } with paths made for x = 0 and shifted. */
function legs(m, o) {
  for (const [part, front, z] of [[4, 1, -1], [5, 1, 1], [6, 0, -1], [7, 0, 1]]) {
    const x = front ? o.fx : o.hx, zz = z * (front ? o.fz : o.hz), [path0, rad0] = front ? o.front : o.hind, [path, rad] = front ? [path0, rad0] : hock(path0, rad0), P = path.map((q) => [q[0] + x, q[1], zz]), hip = P[0];
    m.as(part, hip, null, () => {
      m.tube(P, rad, { sides: o.sides ?? 6, ref: [1, 0, 0], col: ({ t }) => o.col(t, front) });
      const h = P[P.length - 1]; m.ball([h[0] + o.hoof[3], o.hoof[1] * 0.9, zz], [o.hoof[0], o.hoof[1], o.hoof[2]], o.hoofCol, { nu: 4, nv: 5 });
    });
  }
}
/** A body tube from rows [x, y, ry, rz] (front to back). */
const body = (m, S, sides, col) => m.tube(S.map((q) => [q[0], q[1], 0]), S.map((q) => [q[2], q[3]]), { sides, col });

// ═════════ the horse ═════════
const HORSE = {
  bay: { c: [0.43, 0.22, 0.1], pts: [0.07, 0.055, 0.05], mane: [0.07, 0.055, 0.05], belly: 0.82, dapple: 0.03 },
  chestnut: { c: [0.5, 0.25, 0.09], pts: [0.46, 0.22, 0.08], mane: [0.62, 0.4, 0.2], belly: 0.88, dapple: 0.03, blaze: true },
  grey: { c: [0.7, 0.7, 0.68], pts: [0.42, 0.42, 0.42], mane: [0.5, 0.5, 0.5], belly: 0.94, dapple: 0.1 },
  black: { c: [0.085, 0.075, 0.075], pts: [0.07, 0.065, 0.065], mane: [0.06, 0.055, 0.055], belly: 1.0, dapple: 0.015 },
};
/** A horse of the small pre-modern kind, standing: deep barrel, sloping shoulder, arched neck with a mane, a long head carried at 45°, a full tail, hocked hind legs and hooves. */
export function horse(variant) {
  const m = new Model(), V = HORSE[variant], k = V.c;
  const coat = ({ p, n }) => lerp(lerp(k, k.map((v) => v * V.belly), sm(-0.1, -0.8, n[1])), lerp(k, [1, 1, 1], 0.12), (cell(p, 7, 3) - 0.5) * 6 * V.dapple);
  const S = [[0.6, 1.04, 0.27, 0.16], [0.46, 1.09, 0.31, 0.2], [0.2, 1.08, 0.32, 0.215], [-0.05, 1.06, 0.32, 0.215], [-0.3, 1.08, 0.31, 0.215], [-0.5, 1.1, 0.3, 0.215], [-0.7, 1.09, 0.25, 0.19], [-0.8, 1.1, 0.17, 0.13], [-0.86, 1.1, 0.07, 0.06]];
  body(m, S, 10, coat);
  const NP = [0.5, 1.25, 0], HP = [0.93, 1.6, 0], np = [[0.4, 1.18], [0.58, 1.34], [0.76, 1.48], [0.9, 1.56]], nr = [[0.2, 0.12], [0.16, 0.1], [0.125, 0.082], [0.1, 0.07]];
  m.as(1, NP, null, () => {
    m.tube(np.map((q) => [q[0], q[1], 0]), nr, { sides: 8, ref: [1, 0, 0], col: coat });
    m.tube(np.map((q, i) => [q[0] - 0.62 * nr[i][0] * 0.95, q[1] + 0.78 * nr[i][0] * 0.95, 0]), [[0.05, 0.03], [0.05, 0.035], [0.045, 0.03], [0.035, 0.025]], { sides: 5, ref: [1, 0, 0], col: V.mane });   // the mane
  });
  m.as(2, HP, NP, () => {
    m.ball([0.95, 1.61, 0], [0.12, 0.11, 0.085], coat, { nu: 6, nv: 8 });
    m.tube([[0.98, 1.58, 0], [1.1, 1.46, 0], [1.22, 1.34, 0], [1.28, 1.27, 0]], [[0.1, 0.08], [0.085, 0.062], [0.07, 0.052], [0.058, 0.055]], { sides: 7, ref: [1, 0, 0], col: ({ p, t, n }) => lerp(lerp(coat({ p, n }), [0.9, 0.86, 0.8], V.blaze && Math.abs(n[2]) < 0.35 && n[0] + n[1] > 0.1 ? 0.85 : 0), [0.1, 0.08, 0.07], sm(0.78, 1, t) * 0.5) });
    m.ball([1.285, 1.265, 0], [0.03, 0.04, 0.052], [0.14, 0.1, 0.09], { nu: 4, nv: 6 });
    m.tube([[0.94, 1.67, 0], [0.99, 1.62, 0], [1.03, 1.54, 0]], [[0.04, 0.025], [0.035, 0.025], [0.025, 0.02]], { sides: 4, ref: [1, 0, 0], col: V.mane });                                  // the forelock
    for (const s of [-1, 1]) m.tube([[0.9, 1.67, s * 0.05], [0.87, 1.76, s * 0.06], [0.86, 1.83, s * 0.055]], [[0.03, 0.022], [0.026, 0.02], [0.004, 0.004]], { sides: 4, col: V.pts });     // the ears
    eyes(m, 1.01, 1.62, 0.083, 0.014, [0.08, 0.05, 0.03]);
  });
  m.as(3, [-0.84, 1.18, 0], null, () => m.tube([[-0.84, 1.18, 0], [-0.95, 1.1, 0], [-1.0, 0.88, 0], [-1.0, 0.62, 0], [-0.99, 0.42, 0]], [[0.045, 0.04], [0.07, 0.05], [0.08, 0.05], [0.07, 0.04], [0.025, 0.015]], { sides: 5, col: V.mane }));
  legs(m, {
    fx: 0.42, hx: -0.55, fz: 0.17, hz: 0.18, hoof: [0.06, 0.032, 0.05, 0.03], hoofCol: [0.12, 0.1, 0.09],
    front: [[[0, 0.98], [0, 0.66], [0, 0.46], [0.01, 0.12], [0.03, 0.04]], [[0.1, 0.09], [0.07, 0.065], [0.052, 0.05], [0.036, 0.04], [0.05, 0.052]]],
    hind: [[[0, 1.0], [0.05, 0.72], [-0.02, 0.54], [-0.07, 0.34], [-0.07, 0.14], [-0.03, 0.04]], [[0.14, 0.1], [0.1, 0.085], [0.07, 0.06], [0.05, 0.045], [0.04, 0.04], [0.05, 0.05]]],
    col: (t) => lerp(coat({ p: [0, 0.6, 0], n: [0, 0, 1] }), V.pts, sm(0.35, 0.55, t)),
  });
  return m;
}

// ═════════ the ox and the zebu ═════════
const OX = {
  red: { c: [0.5, 0.2, 0.08], pale: [0.7, 0.5, 0.4], horn: [0.82, 0.77, 0.64], hump: 0 },
  dun: { c: [0.64, 0.5, 0.32], pale: [0.8, 0.7, 0.55], horn: [0.8, 0.76, 0.65], hump: 0 },
  white: { c: [0.88, 0.86, 0.8], pale: [0.9, 0.78, 0.74], horn: [0.82, 0.78, 0.68], hump: 0 },
  pied: { c: [0.5, 0.2, 0.08], pale: [0.7, 0.55, 0.5], horn: [0.82, 0.77, 0.64], hump: 0, pie: true },
  zebu_red: { c: [0.52, 0.24, 0.1], pale: [0.6, 0.4, 0.34], horn: [0.3, 0.26, 0.2], hump: 1 },
  zebu_white: { c: [0.86, 0.84, 0.78], pale: [0.7, 0.6, 0.58], horn: [0.3, 0.26, 0.2], hump: 1 },
  zebu_grey: { c: [0.66, 0.65, 0.62], pale: [0.4, 0.38, 0.36], horn: [0.18, 0.16, 0.14], hump: 1, dark: [0.28, 0.27, 0.27] },
};
/** An ox (withers 1.3 m, the zebu's hump a little higher), standing: a deep barrel on short legs, the head carried low and level with a broad pale muzzle, horns that rise from the poll, the dewlap, a long tail with a tuft; the zebu adds the hump over the shoulder, the dewlap and drooping ears. */
export function ox(variant) {
  const m = new Model(), V = OX[variant], zebu = V.hump, k = V.c, W = [0.88, 0.86, 0.8];
  const coat = ({ p, n }) => {
    let c = lerp(k, k.map((v) => v * 0.78), sm(-0.1, -0.8, n[1]) * 0.6);
    if (V.pie) c = lerp(c, W, sm(0.5, 0.56, cell(p, 2.6, 6)) * 0.95);
    if (V.dark) c = lerp(c, V.dark, sm(0.5, 0.95, p[0]) * 0.6 + sm(0.45, 0.7, p[0]) * sm(0.3, 0.8, p[1]) * 0.4);
    return lerp(c, k.map((v) => v * 0.7), hash3(p, 5) * 0.08);
  };
  const S = [[0.78, 0.95, 0.15, 0.13], [0.62, 1.0, 0.26, 0.2], [0.4, 0.99, 0.33, 0.26], [0.15, 0.97, 0.34, 0.27], [-0.1, 0.96, 0.34, 0.27], [-0.35, 0.98, 0.32, 0.26], [-0.55, 0.99, 0.27, 0.24], [-0.68, 0.96, 0.13, 0.13], [-0.72, 0.93, 0.03, 0.03]];
  body(m, S, 10, coat);
  if (zebu) m.ball([0.38, 1.22, 0], [0.27, 0.19, 0.17], coat, { nu: 5, nv: 8 });                                                                    // the hump
  m.ball([0.5, 0.8, 0], [zebu ? 0.3 : 0.2, zebu ? 0.09 : 0.05, zebu ? 0.06 : 0.04], ({ p }) => lerp(k, V.pale, 0.3), { nu: 4, nv: 6 });          // the dewlap
  const NP = [0.62, 1.0, 0], HP = [1.0, 0.96, 0];
  m.as(1, NP, null, () => m.tube([[0.54, 1.02, 0], [0.7, 1.03, 0], [0.86, 0.99, 0], [0.96, 0.97, 0]], [[0.26, 0.2], [0.2, 0.16], [0.15, 0.12], [0.13, 0.1]], { sides: 8, ref: [1, 0, 0], col: coat }));
  m.as(2, HP, NP, () => {
    m.ball([1.04, 0.96, 0], [0.13, 0.12, 0.09], coat, { nu: 6, nv: 8 });
    m.tube([[1.1, 0.93, 0], [1.22, 0.88, 0], [1.31, 0.83, 0]], [[0.1, 0.075], [0.085, 0.075], [0.075, 0.08]], { sides: 7, ref: [1, 0, 0], col: ({ p, t, n }) => lerp(coat({ p, n }), V.pale, sm(0.4, 1, t) * 0.8) });
    m.ball([1.325, 0.83, 0], [0.025, 0.05, 0.06], [0.16, 0.1, 0.1], { nu: 4, nv: 6 });                                                              // the muzzle's end
    for (const s of [-1, 1]) {
      m.tube([[1.0, 1.06, s * 0.08], [0.98, 1.1, s * 0.2], [1.01, 1.2, s * 0.3], [1.07, 1.32, s * 0.33], [1.1, 1.4, s * 0.3]].map((q) => zebu ? [q[0], 1.04 + (q[1] - 1.04) * 0.75, q[2] * 0.8] : q), [0.036, 0.032, 0.026, 0.017, 0.004], { sides: 5, col: ({ t }) => lerp(V.horn, [0.16, 0.14, 0.12], sm(0.55, 1, t)) });   // the horn
      m.tube([[0.98, 1.0, s * 0.1], [0.96, 1.01, s * 0.22], [0.95, zebu ? 0.94 : 1.0, s * 0.31]], [[0.02, 0.055], [0.018, 0.05], [0.003, 0.01]], { sides: 4, col: coat });  // the ear
      m.ball([1.07, 0.99, s * 0.093], [0.016, 0.017, 0.014], [0.07, 0.05, 0.03], { nu: 3, nv: 4 });
    }
    eyes(m, 1.08, 1.0, 0.098, 0.017, [0.09, 0.06, 0.04]);
  });
  m.as(3, [-0.7, 0.94, 0], null, () => m.tube([[-0.7, 0.94, 0], [-0.76, 0.72, 0], [-0.78, 0.45, 0], [-0.78, 0.2, 0]], [0.03, 0.022, 0.018, 0.035], { sides: 5, col: ({ t }) => (t > 0.78 ? k.map((v) => v * 0.35) : lerp(k, V.pale, 0.1)) }));
  legs(m, {
    fx: 0.5, hx: -0.48, fz: 0.17, hz: 0.17, hoof: [0.052, 0.027, 0.04, 0.02], hoofCol: [0.14, 0.11, 0.09],
    front: [[[0, 0.8], [0, 0.5], [0, 0.34], [0.005, 0.1], [0.02, 0.04]], [[0.115, 0.1], [0.07, 0.06], [0.05, 0.045], [0.04, 0.04], [0.045, 0.048]]],
    hind: [[[0, 0.82], [0.03, 0.58], [-0.03, 0.4], [-0.05, 0.24], [-0.05, 0.1], [-0.02, 0.04]], [[0.13, 0.1], [0.09, 0.075], [0.06, 0.055], [0.048, 0.045], [0.04, 0.04], [0.045, 0.048]]],
    col: (t) => lerp(coat({ p: [0, 0.5, 0], n: [0, 0, 1] }), k.map((v) => v * 0.85), sm(0.5, 0.7, t)), sides: 6,
  });
  return m;
}

// ═════════ the donkey ═════════
const DONKEY = { grey: { c: [0.5, 0.49, 0.47], mane: [0.2, 0.19, 0.19] }, brown: { c: [0.36, 0.26, 0.18], mane: [0.14, 0.1, 0.08] } };
/** A donkey (withers 1.05 m), standing: a light body on thin legs, a short stiff upright mane, a big plain head with very long ears, a pale muzzle ring and belly, the dark dorsal stripe and shoulder cross, a tail with a tuft. */
export function donkey(variant) {
  const m = new Model(), V = DONKEY[variant], k = V.c, pale = [0.82, 0.78, 0.7];
  const coat = ({ p, n }) => {
    let c = lerp(k, pale, sm(-0.15, -0.7, n[1]) * 0.8);
    c = lerp(c, V.mane, sm(0.5, 0.8, n[1]) * sm(0.035, 0.015, Math.abs(p[2])) * 0.9);                                                           // the dorsal stripe
    c = lerp(c, V.mane, sm(0.04, 0.0, Math.abs(p[0] - 0.4)) * sm(0.2, 0.7, n[1]) * 0.8);   // the cross over the shoulders
    return lerp(c, k.map((v) => v * 0.8), hash3(p, 2) * 0.1);
  };
  const S = [[0.5, 0.78, 0.2, 0.12], [0.36, 0.81, 0.24, 0.15], [0.14, 0.8, 0.245, 0.16], [-0.1, 0.79, 0.24, 0.16], [-0.3, 0.8, 0.23, 0.16], [-0.46, 0.81, 0.2, 0.14], [-0.55, 0.8, 0.12, 0.09], [-0.59, 0.79, 0.04, 0.04]];
  body(m, S, 9, coat);
  const NP = [0.38, 0.9, 0], HP = [0.7, 1.16, 0], np = [[0.3, 0.84], [0.45, 0.98], [0.6, 1.1], [0.7, 1.15]], nr = [[0.17, 0.1], [0.14, 0.09], [0.11, 0.08], [0.1, 0.07]];
  m.as(1, NP, null, () => {
    m.tube(np.map((q) => [q[0], q[1], 0]), nr, { sides: 7, ref: [1, 0, 0], col: coat });
    m.tube(np.map((q, i) => [q[0] - 0.62 * nr[i][0] * 0.95, q[1] + 0.78 * nr[i][0] * 0.95, 0]), [[0.035, 0.02], [0.04, 0.025], [0.04, 0.022], [0.03, 0.02]], { sides: 4, ref: [1, 0, 0], col: V.mane });   // the short stiff mane
  });
  m.as(2, HP, NP, () => {
    m.ball([0.74, 1.17, 0], [0.12, 0.1, 0.08], coat, { nu: 6, nv: 7 });
    m.tube([[0.78, 1.14, 0], [0.92, 1.07, 0], [1.05, 1.0, 0], [1.13, 0.96, 0]], [[0.1, 0.075], [0.085, 0.06], [0.07, 0.052], [0.062, 0.055]], { sides: 7, ref: [1, 0, 0], col: ({ p, t, n }) => lerp(coat({ p, n }), pale, sm(0.5, 0.8, t) * 0.9) });
    m.ball([1.135, 0.955, 0], [0.028, 0.04, 0.05], [0.12, 0.1, 0.09], { nu: 4, nv: 6 });
    for (const s of [-1, 1]) m.tube([[0.7, 1.23, s * 0.05], [0.67, 1.36, s * 0.08], [0.64, 1.5, s * 0.11], [0.62, 1.58, s * 0.115]], [[0.024, 0.038], [0.022, 0.045], [0.018, 0.04], [0.004, 0.008]], { sides: 5, col: ({ t }) => lerp(lerp(k, pale, 0.3), V.mane, sm(0.7, 0.95, t)) });   // the long ears
    eyes(m, 0.8, 1.19, 0.078, 0.014, [0.08, 0.05, 0.03]);
  });
  m.as(3, [-0.58, 0.79, 0], null, () => m.tube([[-0.58, 0.79, 0], [-0.64, 0.7, 0], [-0.66, 0.5, 0], [-0.66, 0.3, 0], [-0.66, 0.22, 0]], [0.026, 0.02, 0.016, 0.014, 0.04], { sides: 5, col: ({ t }) => (t > 0.8 ? V.mane : k) }));
  legs(m, {
    fx: 0.3, hx: -0.4, fz: 0.12, hz: 0.13, hoof: [0.045, 0.026, 0.036, 0.02], hoofCol: [0.12, 0.1, 0.09],
    front: [[[0, 0.74], [0, 0.5], [0, 0.35], [0.005, 0.1], [0.02, 0.035]], [[0.075, 0.065], [0.05, 0.045], [0.04, 0.036], [0.028, 0.03], [0.036, 0.04]]],
    hind: [[[0, 0.76], [0.03, 0.56], [-0.03, 0.4], [-0.05, 0.24], [-0.05, 0.1], [-0.02, 0.035]], [[0.1, 0.075], [0.07, 0.06], [0.05, 0.042], [0.036, 0.034], [0.03, 0.03], [0.036, 0.04]]],
    col: (t) => lerp(lerp(k, pale, 0.3), V.mane, sm(0.7, 0.9, t) * 0.5), sides: 5,
  });
  return m;
}

// ═════════ the sheep ═════════
const SHEEP = {
  white: { wool: [0.86, 0.83, 0.76], face: [0.78, 0.7, 0.6], leg: [0.7, 0.62, 0.52], horn: false },
  dark: { wool: [0.22, 0.17, 0.13], face: [0.14, 0.11, 0.09], leg: [0.14, 0.11, 0.09], horn: false },
  horned: { wool: [0.36, 0.26, 0.17], face: [0.3, 0.22, 0.15], leg: [0.3, 0.22, 0.15], horn: true, pale: [0.66, 0.58, 0.46] },
};
/** A sheep (withers 0.65 m), standing: a round fleecy body that hangs low over thin legs, a short neck, a small head with drooping ears; the horned kind (a primitive, Soay-like sheep) is brown with a pale belly and rump and curled horns, the others plain white or dark. */
export function sheep(variant) {
  const m = new Model(), V = SHEEP[variant], k = V.wool;
  const wool = ({ p, n }) => lerp(lerp(k, V.pale || k.map((v) => v * 0.85), sm(-0.2, -0.8, n[1]) * (V.pale ? 0.9 : 0.5) + (V.pale ? sm(-0.3, -0.42, p[0]) * 0.5 : 0)), k.map((v) => v * 0.78), cell(p, 14, 4) * 0.5);
  const S = [[0.34, 0.44, 0.1, 0.1], [0.25, 0.45, 0.17, 0.15], [0.1, 0.45, 0.21, 0.18], [-0.08, 0.45, 0.22, 0.19], [-0.24, 0.45, 0.21, 0.18], [-0.36, 0.44, 0.15, 0.14], [-0.41, 0.43, 0.05, 0.06]];
  body(m, S, 9, wool);
  for (const [x, y, rx, ry, rz] of [[0.14, 0.58, 0.14, 0.1, 0.13], [-0.04, 0.6, 0.15, 0.09, 0.14], [-0.22, 0.57, 0.13, 0.09, 0.12]]) m.ball([x, y, 0], [rx, ry, rz], wool, { nu: 4, nv: 7 });   // the fleece's lumps along the back
  const NP = [0.3, 0.5, 0], HP = [0.45, 0.55, 0];
  m.as(1, NP, null, () => m.tube([[0.26, 0.48, 0], [0.33, 0.52, 0], [0.42, 0.55, 0]], [[0.11, 0.1], [0.085, 0.08], [0.06, 0.055]], { sides: 7, ref: [1, 0, 0], col: wool }));
  m.as(2, HP, NP, () => {
    m.ball([0.47, 0.55, 0], [0.075, 0.068, 0.056], V.face, { nu: 5, nv: 7 });
    m.tube([[0.5, 0.54, 0], [0.57, 0.5, 0], [0.62, 0.47, 0]], [[0.045, 0.036], [0.036, 0.03], [0.026, 0.026]], { sides: 6, ref: [1, 0, 0], col: ({ t }) => lerp(V.face, V.horn ? [0.55, 0.45, 0.4] : [0.55, 0.42, 0.38], sm(0.6, 1, t) * 0.4) });
    m.ball([0.625, 0.465, 0], [0.012, 0.016, 0.022], [0.1, 0.07, 0.07], { nu: 3, nv: 5 });
    for (const s of [-1, 1]) {
      m.tube([[0.44, 0.58, s * 0.04], [0.42, 0.59, s * 0.09], [0.4, 0.55, s * 0.13]], [[0.012, 0.028], [0.01, 0.026], [0.003, 0.006]], { sides: 4, col: V.face });                  // the ear, hanging out
      if (V.horn) m.tube([[0.45, 0.6, s * 0.035], [0.4, 0.66, s * 0.07], [0.33, 0.67, s * 0.1], [0.3, 0.62, s * 0.095], [0.33, 0.58, s * 0.08]], [0.016, 0.015, 0.012, 0.008, 0.002], { sides: 4, col: [0.55, 0.5, 0.38] });  // the curled horn
    }
    eyes(m, 0.52, 0.575, 0.04, 0.009, [0.4, 0.3, 0.1]);
  });
  m.as(3, [-0.4, 0.43, 0], null, () => m.tube([[-0.4, 0.43, 0], [-0.45, 0.4, 0], [-0.47, 0.34, 0]], [0.035, 0.03, 0.012], { sides: 5, col: wool }));
  legs(m, {
    fx: 0.2, hx: -0.22, fz: 0.09, hz: 0.1, hoof: [0.024, 0.014, 0.02, 0.01], hoofCol: [0.1, 0.08, 0.07],
    front: [[[0, 0.3], [0, 0.18], [0, 0.08], [0.005, 0.02]], [[0.04, 0.036], [0.022, 0.02], [0.016, 0.016], [0.02, 0.02]]],
    hind: [[[0, 0.32], [0.01, 0.2], [-0.02, 0.1], [-0.01, 0.02]], [[0.05, 0.04], [0.025, 0.022], [0.017, 0.017], [0.02, 0.02]]],
    col: (t) => lerp(wool({ p: [0, 0.3, 0], n: [0, 0, 1] }), V.leg, sm(0.15, 0.4, t)), sides: 5,
  });
  return m;
}

for (const v of Object.keys(HORSE)) MODELS['horse_' + v] = () => horse(v);
for (const v of ['red', 'dun', 'white', 'pied']) MODELS['ox_' + v] = () => ox(v);
for (const v of ['zebu_red', 'zebu_white', 'zebu_grey']) MODELS[v] = () => ox(v);
for (const v of Object.keys(DONKEY)) MODELS['donkey_' + v] = () => donkey(v);
for (const v of Object.keys(SHEEP)) MODELS['sheep_' + v] = () => sheep(v);

/** The walk of each kind of model: hip height → swing (rad), stride (m), speed (m/s), graze (how far the neck reaches down). */
export const FARM_GAIT = { horse: { swing: 0.34, stride: 0.62, speed: 0.9, graze: 1.15 }, ox: { swing: 0.34, stride: 0.54, speed: 0.6, graze: 0.8 }, donkey: { swing: 0.36, stride: 0.5, speed: 0.7, graze: 1.1 }, sheep: { swing: 0.42, stride: 0.26, speed: 0.5, graze: 0.8 } };
export const farmKind = (model) => (model.startsWith('horse_') ? 'horse' : model.startsWith('ox_') || model.startsWith('zebu_') ? 'ox' : model.startsWith('donkey_') ? 'donkey' : model.startsWith('sheep_') ? 'sheep' : null);
