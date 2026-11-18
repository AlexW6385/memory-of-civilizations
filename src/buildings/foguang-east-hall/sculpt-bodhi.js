// The standing and kneeling bodhisattvas of the altar (the attendants, the offering figures): the weight on one leg and the
// hips, shoulders and head swung against one another (tribhanga), a skirt whose folds hang from the hips and bunch over the knee of the
// resting leg, a bare torso with a necklace, armlets and bracelets, a scarf over both shoulders, a crowned head with a halo.
// Built in a 2.4 m frame with the pedestal, +z forward; the caller scales it. (docs/settlements/tang-wutai.md §18.)

import { lathe } from '../../core/geom.js';
import { Acc, skin, tube, blob, sub, add3, hash, smooth, ring, body, petal, head, hair, hand, band, limb, sash } from './sculpt-kit.js';

const TAU = Math.PI * 2;

/** The lotus pedestal: a drum on a plinth, two rows of upturned petals, a pad. */
function lotus(A, r, h, lod, ph) {
  A.add('clay_robe', lathe([[0.001, 0], [r * 1.12, 0], [r * 1.12, h * 0.1], [r * 0.98, h * 0.15], [r * 0.82, h * 0.22], [r * 0.82, h * 0.46], [r * 0.9, h * 0.5], [0.001, h * 0.5]], lod > 1 ? 22 : 14));
  A.add('clay_gilt', band(0, h * 0.14, 0, r * 1.0, r * 1.0, 0.01, 22, 4));
  const n = lod > 1 ? 14 : 10;
  for (let i = 0; i < n; i++) A.add('clay_gilt', petal((i / n) * TAU, r * 0.46, h * 0.18, r * 0.36, r * 0.27, 1.1, 0.02, 4));
  for (let i = 0; i < n; i++) A.add('lacquer_red', petal(((i + 0.5) / n) * TAU, r * 0.4, h * 0.36, r * 0.34, r * 0.24, 1.3, 0.018, 4));
  A.add('clay_gilt', lathe([[0.001, h * 0.46], [r * 0.5, h * 0.52], [r * 0.6, h * 0.8], [r * 0.5, h], [0.001, h]], 16));
  void ph;
}

/** The crown of a bodhisattva: a gilt band with leaf-shaped points and a red jewel, flaming ties and discs at the ears, c the head's centre. */
export function crown(A, c, k, lod = 2) {
  A.add('clay_gilt', lathe([[0.1, 0], [0.108, 0.01], [0.112, 0.045], [0.106, 0.062], [0.102, 0.05]], 20, (th) => 1 + 0.04 * Math.max(0, Math.cos(th * 5)), c[0], c[1] + 0.07 * k, c[2]).scale(1, 1, 1));
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.12 + 0.76 * i / 6), r = 0.112 * k, mid = i === 3;
    A.add('clay_gilt', blob([c[0] + Math.cos(a) * r, c[1] + (0.14 + (mid ? 0.03 : 0)) * k, c[2] + Math.sin(a) * r * 0.95], 0.013 * k, (0.034 + (mid ? 0.012 : 0)) * k, 0.009 * k, 6, 3));
  }
  A.add('lacquer_red', blob([c[0], c[1] + 0.105 * k, c[2] + 0.114 * k], 0.013 * k, 0.017 * k, 0.008 * k, 7, 4));
  if (lod > 1) for (const s of [-1, 1]) {
    A.add('clay_gilt', tube([[c[0] + s * 0.105 * k, c[1] + 0.07 * k, c[2], 0.007 * k], [c[0] + s * 0.125 * k, c[1] - 0.02 * k, c[2] - 0.02 * k, 0.007 * k], [c[0] + s * 0.14 * k, c[1] - 0.12 * k, c[2] - 0.03 * k, 0.006 * k]], 5));
    A.add('clay_gilt', blob([c[0] + s * 0.108 * k, c[1] - 0.04 * k, c[2] + 0.01 * k], 0.008 * k, 0.03 * k, 0.03 * k, 6, 3));
  }
}

/** The halo behind the head: a disc of blue within a red band and a gilt rim, flame points, a boss. */
export function halo(A, c, r) {
  const mk = (r0, r1, z) => lathe([[r0, -0.006], [r1, -0.006], [r1, 0.006], [r0, 0.006]], 28).rotateX(Math.PI / 2).translate(c[0], c[1], c[2] + z);
  A.add('paint_blue', mk(0.001, r * 0.78, 0.0)); A.add('lacquer_red', mk(r * 0.78, r * 0.93, 0.004)); A.add('clay_gilt', mk(r * 0.93, r, 0.006), mk(r * 0.25, r * 0.3, 0.007));
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, tx = Math.cos(a), ty = Math.sin(a); A.add('clay_gilt', skin([[[c[0] + tx * r * 0.98 - ty * 0.04, c[1] + ty * r * 0.98 + tx * 0.04, c[2] + 0.002], [c[0] + tx * r * 0.98 + ty * 0.04, c[1] + ty * r * 0.98 - tx * 0.04, c[2] + 0.002], [c[0] + tx * r * 0.98 + ty * 0.04, c[1] + ty * r * 0.98 - tx * 0.04, c[2] + 0.012], [c[0] + tx * r * 0.98 - ty * 0.04, c[1] + ty * r * 0.98 + tx * 0.04, c[2] + 0.012]], [[c[0] + tx * r * 1.14, c[1] + ty * r * 1.14, c[2] + 0.005], [c[0] + tx * r * 1.14, c[1] + ty * r * 1.14, c[2] + 0.005], [c[0] + tx * r * 1.14, c[1] + ty * r * 1.14, c[2] + 0.01], [c[0] + tx * r * 1.14, c[1] + ty * r * 1.14, c[2] + 0.01]]], true, false)); }
}

/** One arm from the shoulder s through the elbow e to the wrist w (radii r0 → r1), bangles at the wrist and the arm's top; the hand if given. */
function armOf(A, s, e, w, hnd, lod) {
  const m1 = add3(s, sub(e, s), 0.5), m2 = add3(e, sub(w, e), 0.5);
  A.add('skin_light', limb([[...s, 0.056], [...m1, 0.05], [...e, 0.043], [...m2, 0.04], [...w, 0.03]], lod > 1 ? 9 : 6, (th, t) => 1 + 0.06 * Math.sin(Math.PI * t) * Math.cos(th * 1)));
  A.add('clay_gilt', limb([[...add3(s, sub(e, s), 0.22), 0.057], [...add3(s, sub(e, s), 0.3), 0.057]], 10), limb([[...add3(e, sub(w, e), 0.86), 0.038], [...add3(e, sub(w, e), 0.93), 0.038]], 8));
  if (hnd && lod > 1) hand(A, 'skin_light', w, hnd.f, hnd.n, hnd.o);
  else if (hnd) A.add('skin_light', blob(add3(w, hnd.f, 0.05), 0.028, 0.05, 0.022, 6, 3));
}

/**
 * { pose: 'stand' | 'kneel', seed, lod, robe, robe2 } into an Acc, 2.4 m with the pedestal, +z the front. The weight rests on one leg: the hips swing
 * toward it, the shoulders away, the head back (the S of the tribhanga), by `mir` (±1, from the seed).
 */
export function bodhisattva(o = {}) {
  const A = new Acc(), lod = o.lod ?? 2, kneel = o.pose === 'kneel', seed = o.seed ?? 1;
  const mir = hash(seed, 3, 1) < 0.5 ? -1 : 1, ph = hash(seed, 5, 2) * 6, v = Math.floor(hash(seed, 9, 4) * 3);
  const robe = o.robe || 'clay_robe', robe2 = o.robe2 || 'clay_green', b = kneel ? 0.5 : 0.42, n = lod > 1 ? 26 : 16;
  lotus(A, kneel ? 0.42 : 0.38, b, lod, ph);
  const sw = kneel ? 0.02 : 0.085 * mir;                  // the hips' swing
  const cxT = (y) => sw * (1 - smooth(0.9, 1.5, y)) - sw * 0.8 * smooth(0.9, 1.5, y);
  let y0, yW;                                            // the waist and the shoulders' height above the pedestal
  if (!kneel) {
    yW = 1.0; y0 = 0;
    // the skirt: folds deepening toward the hem, a bulge over the knee of the resting leg, the weight leg straight
    const rows = [[0, 0.31, 0.25], [0.04, 0.325, 0.265], [0.16, 0.285, 0.23], [0.45, 0.255, 0.2], [0.8, 0.205, 0.165], [1.0, 0.185, 0.14]];
    const thK = Math.PI / 2 - mir * 0.55;
    const sk = skin(rows.map(([y, rx, rz], i) => ring(sw * smooth(0, 0.9, y), b + y, 0.0, rx, rz, n, (th) => {
      const fo = 1 + (0.05 * (1 - y) + 0.01) * Math.cos(th * 9 + y * 2.2 + ph) + 0.03 * (1 - y) * Math.cos(th * 5 - y * 1.5);
      const kb = 0.16 * Math.exp(-Math.pow((th - thK) / 0.55, 2)) * smooth(0.1, 0.4, y) * (1 - smooth(0.5, 0.85, y));
      return fo + kb; })), true, true);
    A.add(robe, sk);
    A.add('clay_gilt', band(0, b + 0.03, 0, 0.332, 0.282, 0.016, 26, 4));
    // folds that follow the legs: ropes from the hip's bunch down over the thigh to the hem, swung with the hips
    for (let j = 0; j < (lod > 1 ? 7 : 3); j++) {
      const th = Math.PI / 2 + (j - 3) * 0.32 + 0.04 * Math.sin(ph + j), pts = [];
      for (let i = 0; i <= 5; i++) { const y = 0.9 - i * 0.16, rx = 0.2 + 0.1 * (1 - y), rz = 0.165 + 0.085 * (1 - y); pts.push([sw * smooth(0, 0.9, y) + Math.cos(th + (th - Math.PI / 2) * 0.12 * i) * rx * 1.012, b + y, Math.sin(th + (th - Math.PI / 2) * 0.12 * i) * rz * 1.02, 0.012]); }
      A.add(robe2, tube(pts, 5, 0.8));
    }
    // the feet at the hem: the weight foot flat, the other toe-forward
    for (const s of [-1, 1]) {
      const rest = s === -mir, fx = s * 0.1 + sw * 0.5, fz = rest ? 0.26 : 0.22;
      A.add('skin_light', blob([fx, b + 0.03, fz], 0.05, 0.03, 0.095, 7, 4));
      if (lod > 1) for (let i = 0; i < 5; i++) A.add('skin_light', blob([fx + (i - 2) * 0.017 * s * -1, b + 0.025, fz + 0.09 - 0.005 * Math.abs(i - 2)], 0.01, 0.01, 0.016, 4, 2));
    }
  } else {
    yW = 0.84; y0 = -0.2;
    // kneeling: sat on the heels, the knees forward under the skirt, the shins back; the skirt pooled
    A.add(robe, body([{ y: b + 0.02, cz: -0.03, rx: 0.3, rz: 0.4 }, { y: b + 0.12, cz: 0.0, rx: 0.33, rz: 0.4, f: (th) => 1 + 0.05 * Math.cos(th * 8 + ph) }, { y: b + 0.3, cz: 0.04, rx: 0.3, rz: 0.36 }, { y: b + 0.5, cz: 0.02, rx: 0.24, rz: 0.27, f: (th) => 1 + 0.05 * Math.cos(th * 7 + ph) }, { y: b + 0.66, cz: 0.02, rx: 0.2, rz: 0.2 }], n));
    for (const s of [-1, 1]) A.add(robe, blob([s * 0.14, b + 0.2, 0.34], 0.14, 0.12, 0.18, 9, 5));
    A.add('clay_gilt', band(0, b + 0.05, 0, 0.33, 0.4, 0.015, 24, 4));
    A.add(robe2, strap0([[-0.2, b + 0.5, 0.2, 0.12], [-0.12, b + 0.4, 0.36, 0.14], [0.06, b + 0.34, 0.42, 0.14]], [0, 1, 0.3]));
    for (let j = 0; j < 5; j++) { const th = Math.PI / 2 + (j - 2) * 0.4, pts = []; for (let i = 0; i <= 4; i++) { const y = 0.62 - i * 0.12; pts.push([Math.cos(th) * (0.2 + 0.06 * (0.62 - y)) , b + y, Math.sin(th) * (0.22 + 0.2 * (0.62 - y)), 0.012]); } A.add(robe2, tube(pts, 5, 0.8)); }
    A.add('skin_light', blob([0.1, b + 0.05, 0.5], 0.05, 0.03, 0.09, 7, 4));
  }
  // ── the torso: from the waist to the shoulders, the belly's swell, the breasts and the collarbone, the shoulders turned against the hips
  const yb = kneel ? b + y0 : b;
  const trows = [[yW, 0.185, 0.13], [yW + 0.12, 0.178, 0.135], [yW + 0.26, 0.175, 0.13], [yW + 0.4, 0.2, 0.14], [yW + 0.5, 0.228, 0.14], [yW + 0.58, 0.215, 0.115], [yW + 0.64, 0.1, 0.085], [yW + 0.68, 0.001, 0.001]];
  const lean = kneel ? 0.05 : 0.04;
  A.add('skin_light', skin(trows.map(([y, rx, rz]) => ring(cxT(y) - (kneel ? 0 : 0), yb + y, 0.012 + lean * ((y - yW) / 0.7), rx, rz, n, null)), true, true));
  for (const s of [-1, 1]) A.add('skin_light', blob([s * 0.085 + cxT(yW + 0.42), yb + yW + 0.42, 0.125 + lean], 0.07, 0.065, 0.05, 9, 5));
  A.add('skin_light', blob([cxT(yW + 0.12), yb + yW + 0.12, 0.14 + lean * 0.4], 0.14, 0.1, 0.05, 9, 5));
  const nx = cxT(yW + 0.65), nz = 0.01 + lean;
  A.add('skin_light', tube([[nx, yb + yW + 0.6, nz, 0.052], [nx, yb + yW + 0.7, nz + 0.005, 0.048], [nx, yb + yW + 0.76, nz + 0.01, 0.047]], 8));
  // the waist's belt and the sash's knot; the necklace of beads in a U and its pendant
  A.add('clay_gilt', band(cxT(yW), yb + yW - 0.04, 0.0, 0.215, 0.145, 0.02, 22, 4));
  A.add('paint_blue', blob([cxT(yW), yb + yW - 0.02, 0.17], 0.045, 0.035, 0.02, 8, 4));
  if (lod > 1) {
    for (let i = 0; i <= 12; i++) { const t = i / 12, a = Math.PI * (0.1 + 0.8 * t), px = Math.cos(a) * 0.17 + cxT(yW + 0.58); A.add('clay_gilt', blob([px, yb + yW + 0.54 - 0.15 * Math.sin(Math.PI * t) ** 1.2, 0.125 + Math.sin(a) * 0.04 + lean], 0.016, 0.016, 0.014, 5, 3)); }
    A.add('clay_gilt', blob([cxT(yW + 0.33), yb + yW + 0.33, 0.165 + lean], 0.05, 0.065, 0.014, 8, 4)); A.add('lacquer_red', blob([cxT(yW + 0.33), yb + yW + 0.33, 0.176 + lean], 0.02, 0.028, 0.006, 6, 3));
  }
  // the scarf over both shoulders, hanging in front and looping across the thighs (not for the kneeling: it falls at the sides)
  const sc = [ 'paint_blue', 'paint_white', robe2 ][v];
  for (const s of [-1, 1]) A.add(sc, sash([[s * 0.22 + cxT(yW + 0.6), yb + yW + 0.58, -0.02 + lean, 0.08], [s * 0.3 + cxT(yW + 0.5), yb + yW + 0.45, 0.07, 0.085], [s * 0.34 + cxT(yW + 0.2), yb + yW + 0.12, 0.12, 0.09], [s * 0.35, yb + yW - 0.3, 0.15, 0.09], [s * 0.33, yb + yW - 0.72, 0.13, 0.085], [s * 0.32, yb + yW - 0.9, 0.1, 0.08]].slice(0, kneel ? 4 : 6), [0, 0.1, 1], 0.01, ph));
  if (!kneel) A.add(sc, sash([[-0.27 + sw, b + 1.0, 0.15, 0.075], [-0.15, b + 0.8, 0.21, 0.08], [0.0, b + 0.74, 0.225, 0.08], [0.15, b + 0.8, 0.21, 0.08], [0.27 + sw, b + 1.0, 0.15, 0.075]], [0, 0.4, 1], 0.01, ph));
  // ── the arms: the shoulders and the arms follow the swing (the raised arm on the side of the resting leg)
  const sh = (s) => [s * 0.225 + cxT(yW + 0.54), yb + yW + 0.54, lean];
  if (!kneel) {
    const raised = v !== 2 ? -mir : mir, low = -raised, rA = raised;
    const sR = sh(rA), E1 = [rA * 0.3 + sw * -0.6, b + 1.22, 0.1], H1 = [rA * 0.24 + sw * -0.6, b + 1.42, 0.27];
    armOf(A, sR, E1, H1, { f: [0, 0.9, 0.2], n: [rA * -0.1, -0.2, 1], o: { curl: 0.28, spread: 0.12, s: 1 } }, lod);
    const sL = sh(low), E2 = [low * 0.3 - sw * 0.6, b + 1.1, 0.06], H2 = [low * 0.27 - sw * 0.6, b + 0.9, 0.17];
    armOf(A, sL, E2, H2, { f: [low * 0.1, -0.5, 0.8], n: [0, 0.8, 0.5], o: { curl: 0.7, spread: 0.05, s: 1, thumb: 0.9 } }, lod);
    if (v === 0) A.add('clay_gilt', lathe([[0.001, 0], [0.035, 0.015], [0.045, 0.07], [0.02, 0.12], [0.016, 0.19], [0.03, 0.22], [0.001, 0.22]], 10, null, low * 0.27 - sw * 0.6, b + 0.93, 0.2));
    else if (v === 1) A.add('lacquer_red', blob([low * 0.27 - sw * 0.6, b + 0.92, 0.2], 0.028, 0.05, 0.028, 7, 4));
  } else {
    // both forearms forward carrying a tray of fruit
    for (const s of [-1, 1]) {
      const sp = sh(s), E = [s * 0.26, yb + yW + 0.32, 0.14], W = [s * 0.15, yb + yW + 0.3, 0.42];
      armOf(A, sp, E, W, { f: [-s * 0.3, 0.1, 0.8], n: [0, 1, 0], o: { curl: 0.45, spread: 0.08, s: 0.92 } }, lod);
    }
    A.add('clay_gilt', lathe([[0.001, 0], [0.12, 0], [0.15, 0.03], [0.14, 0.04], [0.001, 0.02]], 16, null, 0, yb + yW + 0.27, 0.52));
    for (const [px, pz, c] of [[0, 0.52, 0], [0.07, 0.56, 1], [-0.06, 0.58, 0], [0.01, 0.48, 1], [-0.02, 0.62, 1]]) A.add(c ? 'lacquer_red' : 'clay_gilt', blob([px, yb + yW + 0.34, pz], 0.034, 0.034, 0.034, 7, 4));
  }
  // ── the head, its hair and crown, the halo
  const hc = [cxT(yW + 0.88) + (kneel ? 0 : -mir * 0.0) + (kneel ? 0 : mir * 0.03), yb + yW + 0.88, 0.016 + lean * 1.3];
  head(A, hc, 1.0, { kind: 'bodhi', lod, tilt: 0, turn: kneel ? 0 : mir * 0.12 });
  hair(A, hc, 1.0, { chignon: true, locks: lod > 1 });
  crown(A, hc, 1.0, lod);
  halo(A, [hc[0], hc[1] + 0.02, hc[2] - 0.15], 0.25);
  void y0; void robe;
  return A;
}

// a hanging band with its face toward `nrm`
function strap0(path, nrm) { return sash(path, nrm, 0.008, 0); }
