// Low relief of Chichén Itzá in continuous modelled surface (docs/settlements/chichen-itza.md §18): figures of rounded limbs and torsos, their depth
// squeezed to a few centimetres and set on a slab, so that a pillar's warrior or the ball court's players read as carved volumes, not as plates.
// Frame of a panel: x along the wall, y up it, z out of it; the slab's face at z = Z0, the figures rising 2–5 cm above.
import { Parts, bodyOf, skeleton, blob, blobDir, tube, rodT, torus, hash3, reliefSqueeze, mergeGeos, ST, RD, BL, GR, OC, BK, WH } from './sculpt.js';
import { warrior } from './figures.js';
import { Matrix4 } from '../../core/three.js';

export const Z0 = 0.1;   // the slab's face over the carrier's (the old flat panels stand 9 cm out; the new ground clears them)

/** A figure's Parts placed into a panel: squeezed by k, scaled by h, standing at (x, y) on the ground, turned by yaw. */
function setIn(P, F, x, y, h, k = 0.25, yaw = 0) {
  for (const [mat, g] of F.merged()) {
    reliefSqueeze(k, 0)(g);
    g.applyMatrix4(new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)).setPosition(x, y, Z0));
    P.geo(mat, g);
  }
}
const fig = (part, o) => warrior(new Parts(), { part, ...o });
const cache = new Map();
const cached = (key, f) => { if (!cache.has(key)) cache.set(key, f()); return cache.get(key); };

/** One face of a warrior pillar: a framed slab 0.72 × 2.8 and the warrior on it (facing +x, face = 1, or −x). part: 'base' | 'fine'. */
export function pillarFace(part, face = 1) {
  return cached(`pf:${part}:${face}`, () => {
    const P = new Parts(), S = P.sc(ST), B = P.sc(BL);
    if (part === 'base') {
      const w = 0.72, h = 2.8, t = 0.07;
      S.box(-w / 2, 0, 0, w / 2, t, Z0 + 0.03); S.box(-w / 2, h - t, 0, w / 2, h, Z0 + 0.03);
      S.box(-w / 2, t, 0, -w / 2 + t, h - t, Z0 + 0.03); S.box(w / 2 - t, t, 0, w / 2, h - t, Z0 + 0.03);
      B.box(-w / 2 + t, t, 0, w / 2 - t, h - t, Z0);
    }
    setIn(P, fig(part, { pose: 'stand', face }), 0, 0.12, 1.75, 0.25);
    return P;
  });
}

/** The kneeling beheaded player of the Great Ball Court's panel, toward −x (his neck toward the ball): six serpents and a flowering vine. Height 1. */
function beheaded(part) {
  const P = new Parts();
  if (part !== 'base') return P;
  const J0 = { pose: 'stand', lod: 2, look: -82, J: { pelvis: [0, 0.27, 0], chest: [-0.02, 0.45, 0], neck: [-0.03, 0.6, 0], head: [-0.04, 0.68, 0], shR: [-0.14, 0.62, 0], shL: [0.1, 0.62, 0],
    hipR: [-0.05, 0.27, 0], hipL: [0.05, 0.27, 0], anL: [0.3, 0.05, 0], anR: [-0.22, 0.04, 0.0], wrL: [0.04, 0.38, 0.1], wrR: [-0.3, 0.5, 0.1] }, legBendR: [-1, 0.3, 0], legBendL: [0, -1, 0.2] };
  const f = bodyOf({ drape: 'nude', hair: 'none', ...J0 }), J = skeleton({ drape: 'nude', ...J0 });
  for (const g0 of f.stone) {
    const g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position.array, n = g.attributes.normal.array, A = [], N = [];
    for (let i = 0; i < p.length; i += 9) { const cy = (p[i + 1] + p[i + 4] + p[i + 7]) / 3, cx = (p[i] + p[i + 3] + p[i + 6]) / 3; if (Math.hypot(cx - J.head[0], cy - J.head[1]) < 0.075 && cy > J.neck[1] - 0.02) continue; for (let k = 0; k < 9; k++) { A.push(p[i + k]); N.push(n[i + k]); } }
    P.geo(ST, mergeGeos([{ index: null, attributes: { position: { array: new Float32Array(A) }, normal: { array: new Float32Array(N) } } }]));
  }
  const S = P.sc(ST), R = P.sc(RD), G = P.sc(GR), nk = J.neck;
  for (let i = 0; i < 6; i++) {      // the serpents of blood: each a curl rising from the stump of the neck, its head and tongue
    const a = (i - 2.5) * 0.3, L = 0.22 + 0.04 * (i % 3), pts = [[nk[0], nk[1] + 0.02, 0.01, 0.017, 0.017], [nk[0] + Math.sin(a) * 0.08, nk[1] + 0.09 + 0.03 * (i % 2), 0.02, 0.016, 0.016],
      [nk[0] + Math.sin(a) * L * 0.9 + 0.03 * (i % 2 ? 1 : -1), nk[1] + 0.2 + 0.03 * (i % 3), 0.02, 0.013, 0.013], [nk[0] + Math.sin(a) * L * 1.4, nk[1] + 0.3 + 0.03 * (i % 3), 0.02, 0.011, 0.011]];
    tube(i % 2 ? R : G, pts, { seg: 6, sub: 2, ref: [0, 0, 1] });
    const e = pts[3]; blob(S, [e[0] + 0.012, e[1] + 0.012, 0.022], [0.021, 0.015, 0.012], 3, 6);
  }
  tube(G, [[nk[0], nk[1] + 0.02, 0.01, 0.012, 0.012], [nk[0] - 0.02, nk[1] + 0.2, 0.02, 0.01, 0.01], [nk[0] + 0.01, nk[1] + 0.4, 0.02, 0.008, 0.008]], { seg: 5, sub: 2, ref: [0, 0, 1] });  // the vine
  for (const [dy, dx] of [[0.22, -0.04], [0.31, 0.04], [0.41, -0.01]]) blob(S, [nk[0] + dx, nk[1] + dy, 0.02], [0.03, 0.03, 0.012], 3, 7);        // its flowers
  return P;
}

/** The skull-ball: a carved skull with a scroll of speech. Radius 0.36. */
function skullBall() {
  const P = new Parts(), S = P.sc(ST), K = P.sc(BK), W = P.sc(WH);
  blob(S, [0, 0, 0.03], [0.36, 0.36, 0.1], 7, 14);
  blob(S, [0, -0.2, 0.04], [0.2, 0.12, 0.08], 4, 10);
  for (const sx of [-1, 1]) { blob(K, [sx * 0.13, 0.07, 0.1], [0.075, 0.08, 0.035], 4, 8); }
  blob(K, [0, -0.05, 0.1], [0.025, 0.045, 0.03], 3, 6);
  for (let i = 0; i < 6; i++) blob(W, [(i - 2.5) * 0.04, -0.2, 0.115], [0.017, 0.03, 0.012], 3, 5);
  tube(S, [[0.2, 0.2, 0.1, 0.03, 0.02], [0.38, 0.4, 0.1, 0.03, 0.02], [0.55, 0.48, 0.1, 0.03, 0.02], [0.5, 0.65, 0.1, 0.03, 0.02], [0.35, 0.62, 0.1, 0.03, 0.02]], { seg: 6, sub: 2, ref: [0, 0, 1] });   // the scroll of speech
  return P;
}

/**
 * One bench panel of the Great Ball Court, w long (x) and h up (y): a ground slab with a framed edge, the skull-ball in the middle, the beheaded
 * player kneeling on one side and the sacrificer on the other, six players behind each in yoke, knee pad and plumes. part 'base' | 'fine'.
 */
export function ballPanel(part, w = 12, h = 1.95) {
  return cached(`bp:${part}:${w}:${h}`, () => {
    const P = new Parts(), S = P.sc(ST), B = P.sc(BL), hw = w / 2;
    if (part === 'base') {
      const t = 0.12, d = Z0 + 0.03;
      S.box(-hw, 0, 0, hw, t, d); S.box(-hw, h - t, 0, hw, h, d); S.box(-hw, t, 0, -hw + t, h - t, d); S.box(hw - t, t, 0, hw, h - t, d);
      B.box(-hw + t, t, 0, hw - t, h - t, Z0);
      S.box(-hw + t, t, Z0 - 0.001, hw - t, 0.2, Z0 + 0.02);     // the ground line
      const sk = skullBall();
      for (const [mat, g] of sk.merged()) { g.applyMatrix4(new Matrix4().setPosition(0, 0.82, Z0)); P.geo(mat, g); }
      const bh = beheaded('base');
      for (const [mat, g] of bh.merged()) { reliefSqueeze(0.3, 0)(g); g.applyMatrix4(new Matrix4().makeScale(1.3, 1.3, 1.3).setPosition(0.95 + 0.05, 0.14, Z0)); g.applyMatrix4(new Matrix4()); P.geo(mat, g); }
    }
    // the victor, and the players walking in file: stride pose, toward the centre
    const players = [[-0.95, 1, 'victor']].concat(Array.from({ length: 6 }, (_, i) => [-1.75 - i * 0.74, 1, 'walk']), Array.from({ length: 6 }, (_, i) => [1.85 + i * 0.74, -1, 'walk']));
    players.forEach(([x, f]) => {
      const F = fig(part, { pose: 'stride', face: f, kind: 'player', v: hash3(x, 1, 2) });
      setIn(P, F, x, 0.16, 1.28, 0.28);
    });
    void hash3; void blobDir; void rodT; void torus; void OC;
    return P;
  });
}

// ---- the Tzompantli's rows of skulls, the eagle and the jaguar of the Eagles-and-Jaguars platform ----
const ZG = 0.14;   // the new ground over the old skulls' (0.125) and panels' (0.13) frames

/** A skull on a band, its middle at the origin, the cranium 0.3 m across: dome, cheek, jaw, two sockets and the nasal hole; fine: the teeth. part 'base' | 'fine'. */
function skull(P, x, y, z0, part, v) {
  const S = P.sc(ST), K = P.sc(BK), W = P.sc(WH);
  if (part === 'base') {
    blob(S, [x, y + 0.02, z0 + 0.01], [0.15, 0.17, 0.065 + 0.006 * v], 4, 8);
    blob(S, [x, y - 0.12, z0 + 0.012], [0.085, 0.06, 0.05], 3, 7);
    for (const sx of [-1, 1]) blob(K, [x + sx * 0.06, y + 0.03, z0 + 0.052 + 0.003 * v], [0.034, 0.038, 0.016], 3, 6);
  } else {
    blob(K, [x, y - 0.03, z0 + 0.062], [0.012, 0.025, 0.012], 3, 5);
    for (let i = 0; i < 5; i++) blob(W, [x + (i - 2) * 0.026, y - 0.095, z0 + 0.062], [0.011, 0.02, 0.012], 3, 5);
  }
}
/** A band of skulls len long (x), 0.46 high, on a slab at ZG: n rows of one. */
export function skullBand(part, len, key = 0) {
  return cached(`sb:${part}:${len}:${key}`, () => {
    const P = new Parts(), S = P.sc(ST), n = Math.floor(len / 0.5);
    if (part === 'base') S.box(0, -0.23, 0, len, 0.23, ZG);
    for (let i = 0; i < n; i++) skull(P, (i + 0.5) * len / n, 0, ZG, part, hash3(i, key, 3));
    return P;
  });
}

const strip = (S, a, b, ra, rb, z, o = {}) => tube(S, [[a[0], a[1], z, ra, rb], [b[0], b[1], z, ra, rb]], { seg: 6, sub: 1, ref: [0, 0, 1], ...o });

/** The eagle with a heart in its talons on the panel's ground (2.3 × 1.0), facing +x (f = 1) or −x: the body, the folded wing's layered feathers, the tail, a hooked beak, the head with its brow and eye. */
export function eaglePanel(part, f = 1) {
  return cached(`ep:${part}:${f}`, () => {
    const P = new Parts(), S = P.sc(ST), B = P.sc(BL), O = P.sc(OC), K = P.sc(BK), R = P.sc(RD), W = 1.15, H = 1.0, z = ZG, X = (x) => x * f;
    if (part === 'base') {
      const t = 0.1, d = z + 0.035;
      S.box(-W, 0, 0, W, t, d); S.box(-W, H - t, 0, W, H, d); S.box(-W, t, 0, -W + t, H - t, d); S.box(W - t, t, 0, W, H - t, d);
      B.box(-W + t, t, 0, W - t, H - t, z);
      blobDir(S, [X(-0.02), 0.5, z + 0.03], [X(1), 0.3, 0], 0.4, 0.06, 0.21, [0, 0, 1], 5, 10);                // the body
      blob(S, [X(0.08), 0.6, z + 0.04], [0.19, 0.17, 0.05], 5, 9);                                              // the shoulder under the wing
      blobDir(S, [X(0.28), 0.66, z + 0.03], [X(1), 1, 0], 0.17, 0.045, 0.1, [0, 0, 1], 4, 8);                   // the breast and neck
      blob(S, [X(0.46), 0.83, z + 0.04], [0.095, 0.08, 0.045], 4, 8);                                           // the head
      blob(S, [X(0.43), 0.89, z + 0.055], [0.05, 0.022, 0.03], 3, 6);                                           // the brow
      for (let i = 0; i < 6; i++) {                                                                              // the folded wing, feather over feather
        const a = 0.55 + i * 0.12, d = [X(-Math.cos(a) * 0.7), Math.sin(a) * 0.75 - 0.25 - i * 0.07, 0];
        blobDir(S, [X(0.05) + d[0] * 0.3, 0.6 + d[1] * 0.3, z + 0.045 + i * 0.006], d, 0.42 - i * 0.012, 0.02, 0.085, [0, 0, 1], 3, 6);
      }
      for (let i = 0; i < 3; i++) blobDir(S, [X(-0.5 - i * 0.04), 0.4 - i * 0.07, z + 0.04], [X(-1), -0.3 - i * 0.25, 0], 0.22, 0.02, 0.05, [0, 0, 1], 3, 6);   // the tail
      strip(S, [X(0.12), 0.36], [X(0.22), 0.22], 0.035, 0.05, z + 0.035);                                       // the leg
      for (const [dx, dy] of [[0.15, -0.04], [0.2, -0.015], [0.13, -0.09]]) strip(S, [X(0.22), 0.22], [X(0.22 + dx), 0.22 + dy], 0.016, 0.02, z + 0.04);   // the talons
    } else {
      strip(O, [X(0.52), 0.83], [X(0.65), 0.78], 0.028, 0.04, z + 0.045); strip(O, [X(0.65), 0.78], [X(0.64), 0.68], 0.018, 0.022, z + 0.045);   // the hooked beak
      blob(K, [X(0.47), 0.85, z + 0.085], [0.016, 0.016, 0.01], 3, 6);                                                                           // the eye
      for (const sx of [-1, 1]) blob(R, [X(0.40 + sx * 0.03 + 0.03), 0.17, z + 0.06], [0.045, 0.045, 0.03], 3, 7);                                // the heart's lobes
      blobDir(R, [X(0.42), 0.12, z + 0.06], [0, -1, 0], 0.07, 0.03, 0.06, [0, 0, 1], 3, 6);
      for (let i = 0; i < 6; i++) blob(O, [X(0.0 - i * 0.07), 0.62 + 0.02 * i, z + 0.075], [0.035, 0.012, 0.012], 3, 5);   // the painted bands of the wing
    }
    return P;
  });
}

/** The spotted jaguar with a heart, facing +x (f = 1) or −x: shoulder and haunch as muscle, the limbs with joints, the head with its muzzle, ears and open mouth, the tail curling up, rosettes. */
export function jaguarPanel(part, f = 1) {
  return cached(`jp:${part}:${f}`, () => {
    const P = new Parts(), S = P.sc(ST), B = P.sc(BL), O = P.sc(OC), K = P.sc(BK), R = P.sc(RD), W2 = P.sc(WH), W = 1.15, H = 1.0, z = ZG, X = (x) => x * f;
    if (part === 'base') {
      const t = 0.13, d = z + 0.045;
      S.box(-W, 0, 0, W, t, d); S.box(-W, H - t, 0, W, H, d); S.box(-W, t, 0, -W + t, H - t, d); S.box(W - t, t, 0, W, H - t, d);
      B.box(-W + t, t, 0, W - t, H - t, z);
      const J = (a, b, ra, rb) => strip(O, [X(a[0]), a[1]], [X(b[0]), b[1]], ra, rb, z + 0.04);
      blobDir(O, [X(-0.1), 0.5, z + 0.04], [X(1), 0.05, 0], 0.5, 0.06, 0.12, [0, 0, 1], 5, 10);                    // the long body
      blob(O, [X(0.28), 0.5, z + 0.045], [0.17, 0.16, 0.06], 5, 9);                                                // the shoulder
      blob(O, [X(-0.46), 0.48, z + 0.045], [0.19, 0.17, 0.06], 5, 9);                                              // the haunch
      for (const [hx, hy, kx, ky, ax, ay] of [[-0.5, 0.4, -0.38, 0.27, -0.45, 0.13], [0.3, 0.4, 0.34, 0.26, 0.4, 0.13], [-0.4, 0.36, -0.3, 0.22, -0.28, 0.13], [0.2, 0.36, 0.24, 0.24, 0.3, 0.13]]) {
        J([hx, hy], [kx, ky], 0.06, 0.05); J([kx, ky], [ax, ay], 0.04, 0.035);                                      // the limbs, bent at the joints
        blob(O, [X(ax + 0.02), ay - 0.025, z + 0.045], [0.05, 0.025, 0.03], 3, 6);                                  // the paw
      }
      strip(O, [X(0.36), 0.6], [X(0.5), 0.7], 0.045, 0.07, z + 0.04);                                              // the neck
      blob(O, [X(0.58), 0.7, z + 0.045], [0.12, 0.095, 0.05], 4, 8);                                                // the head
      blob(O, [X(0.7), 0.66, z + 0.045], [0.075, 0.05, 0.04], 3, 7);                                                // the muzzle
      for (const dx of [0.5, 0.58]) blob(O, [X(dx), 0.79, z + 0.04], [0.03, 0.035, 0.018], 3, 6);                   // the ears
      tube(O, [[X(-0.62), 0.5, z + 0.04, 0.03, 0.03], [X(-0.82), 0.52, z + 0.04, 0.026, 0.026], [X(-0.88), 0.7, z + 0.04, 0.022, 0.022], [X(-0.8), 0.84, z + 0.04, 0.02, 0.02]], { seg: 6, sub: 2, ref: [0, 0, 1] });   // the tail curling up
    } else {
      blob(K, [X(0.62), 0.725, z + 0.085], [0.016, 0.014, 0.01], 3, 6);
      strip(K, [X(0.7), 0.64], [X(0.78), 0.62], 0.01, 0.02, z + 0.07);
      for (let i = 0; i < 4; i++) blob(W2, [X(0.68 + i * 0.022), 0.61 - (i % 2) * 0.008, z + 0.065], [0.008, 0.016, 0.008], 3, 4);
      for (let i = 0; i < 11; i++) {   // rosettes: a ring of three dark spots
        const cx = -0.55 + i * 0.1 + 0.03 * hash3(i, 4, 1), cy = 0.5 + 0.1 * Math.sin(i * 1.7) + 0.02 * hash3(i, 5, 1);
        for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; blob(K, [X(cx + Math.cos(a) * 0.022), cy + Math.sin(a) * 0.022, z + 0.082], [0.013, 0.013, 0.012], 3, 5); }
      }
      for (const sx of [-1, 1]) blob(R, [X(0.55 + sx * 0.03 + 0.05), 0.17, z + 0.06], [0.04, 0.04, 0.03], 3, 7);
      blobDir(R, [X(0.55 + 0.05), 0.12, z + 0.06], [0, -1, 0], 0.06, 0.03, 0.05, [0, 0, 1], 3, 6);
    }
    return P;
  });
}
