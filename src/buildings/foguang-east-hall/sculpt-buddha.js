// The seated figures of the great altar: a Buddha (or a crowned bodhisattva) on a waisted lotus throne or a sumeru seat, with the
// mandorla behind. Modelled as sculpture: rounded torso, limbs in sleeves with folds, hands with fingers in their mudras, the head
// with its lids, nose, lips and long lobes, the snail-shell curls, a robe that follows the body. Built at 5.2 m with the seat (b = 1.6 m),
// facing +z; the figure's right is −x. (docs/settlements/tang-wutai.md §18.)

import { lathe, fromTriangles } from '../../core/geom.js';
import { Acc, skin, tube, blob, strap, sub, add3, norm, hash, smooth, clamp, ring, body, petal, head, hand, rope, band, limb, at, raised } from './sculpt-kit.js';

const B = 1.6;                                  // the seat's top
const TAU = Math.PI * 2;

/** The throne: the waisted round lotus seat, or the six- or four-sided sumeru seat. */
function throne(A, o, robe, lod) {
  const gilt = 'clay_gilt';
  if (o.hexSeat || o.pendant) {
    const nS = o.pendant ? 4 : 6, k = (o.pendant ? Math.SQRT2 : 1 / Math.cos(Math.PI / 6)) * (o.pendant ? 0.62 : 1);
    const prof = [[0.001, 0], [1.56, 0], [1.56, 0.16], [1.46, 0.2], [1.46, 0.27], [1.34, 0.3], [1.22, 0.38], [1.06, 0.46], [1.0, 0.54], [1.0, 1.06], [1.06, 1.14], [1.2, 1.22], [1.3, 1.3], [1.4, 1.34], [1.46, 1.4], [1.46, B - 0.06], [1.5, B - 0.03], [1.5, B], [0.001, B]];
    const g = lathe(prof.map(([r, y]) => [r * k, y]), nS); g.rotateY(Math.PI / nS);
    A.add(robe, g);
    // the waist: a recessed panel to each face with a gilt frame and a lotus bud
    for (let i = 0; i < nS; i++) {
      const a = (i + 0.5) * TAU / nS + Math.PI / nS, apo = Math.cos(Math.PI / nS) * 1.0 * k, v = [Math.cos(a), 0, Math.sin(a)], u = [-Math.sin(a), 0, Math.cos(a)];
      const hw = apo * Math.tan(Math.PI / nS) * 0.72, c = [Math.cos(a) * apo, 0, Math.sin(a) * apo];
      A.add(gilt, raised(c, u, v, hw, 0.62, 1.0, 0.04));
      A.add('lacquer_red', raised(c, u, v, hw * 0.78, 0.7, 0.92, 0.06));
      A.add(gilt, blob([c[0] + v[0] * 0.07, 0.81, c[2] + v[2] * 0.07], 0.07, 0.09, 0.05, 6, 4).rotateY(-a + Math.PI / 2));
    }
    return;
  }
  // the round waisted lotus throne: a stepped plinth, the waist with its gilt bands, a row of upturned petals under the pad and a smaller row above it
  const prof = [[0.001, 0], [1.68, 0], [1.68, 0.1], [1.54, 0.14], [1.54, 0.2], [1.62, 0.25], [1.62, 0.33], [1.32, 0.4], [1.1, 0.52], [1.02, 0.64], [1.02, 0.84], [1.12, 0.93], [1.34, 0.98], [1.34, 1.04], [0.001, 1.04]];
  A.add(robe, lathe(prof, lod > 1 ? 32 : 20));
  A.add(gilt, band(0, 0.64, 0, 1.03, 1.03, 0.035, 24), band(0, 0.84, 0, 1.03, 1.03, 0.035, 24), band(0, 0.22, 0, 1.62, 1.62, 0.025, 24));
  const nP = lod > 1 ? 16 : 12;
  for (let i = 0; i < nP; i++) A.add(gilt, petal((i / nP) * TAU, 0.72, 1.0, 0.62, 0.32, 1.3, 0.04, 5));
  for (let i = 0; i < nP; i++) A.add('lacquer_red', petal(((i + 0.5) / nP) * TAU, 0.52, 1.16, 0.5, 0.26, 1.4, 0.035, 5));
  A.add(gilt, lathe([[0.001, 1.04], [0.7, 1.1], [0.8, 1.4], [0.86, B - 0.02], [0.8, B], [0.001, B]], 28));
}

/** The torso's rows (y from the seat): hips, waist, chest, shoulders, neck. */
const ROWS = [
  { y: -0.05, rx: 0.82, rz: 0.66 }, { y: 0.3, rx: 0.66, rz: 0.55, cz: 0.02 }, { y: 0.8, rx: 0.56, rz: 0.47, cz: 0.03 }, { y: 1.2, rx: 0.66, rz: 0.5, cz: 0.04 },
  { y: 1.55, rx: 0.78, rz: 0.47, cz: 0.02 }, { y: 1.72, rx: 0.6, rz: 0.4, cz: 0 }, { y: 1.84, rx: 0.36, rz: 0.28, cz: 0 }, { y: 1.97, rx: 0.2, rz: 0.2, cz: 0 },
];

/** The sleeve of an arm: from the shoulder along the points, the sleeve flaring toward the wrist, folds hanging along it. */
function arm(A, mat, pts, flare, phase) {
  A.add(mat, limb(pts.map((p, i) => [...p.slice(0, 3), p[3] * (1 + flare * smooth(0.45, 1, i / (pts.length - 1)))]), 12, (th, t) => 1 + 0.07 * t * Math.cos(th * 3 + phase) + 0.035 * t * Math.cos(th * 5 - phase)));
}

/**
 * A seated figure { pose: 'earth' | 'dhyana' | 'abhaya' (right hand raised, left on the knee), pendant (feet down), hexSeat, crown (a bodhisattva),
 * robe, robe2, noThrone, noHalo, lod (2 full, 1 reduced), seed } into an Acc, 5.2 m high with the seat.
 */
export function seated(o = {}) {
  const A = new Acc(), lod = o.lod ?? 2, robe = o.robe || 'clay_robe', robe2 = o.robe2 || 'clay_green', crown = !!o.crown, seed = o.seed ?? 1;
  const flesh = crown ? 'skin_light' : 'clay_gilt', nB = lod > 1 ? 28 : 18;
  if (o.rider) {
    // on an animal's back: only the lotus pad, its petals turned up round the seat (the throne's drum would be wider than the beast)
    for (let i = 0; i < 14; i++) A.add('clay_gilt', petal((i / 14) * TAU, 0.45, B - 0.5, 0.5, 0.26, 1.2, 0.035, 4));
    for (let i = 0; i < 14; i++) A.add('lacquer_red', petal(((i + 0.5) / 14) * TAU, 0.38, B - 0.42, 0.44, 0.23, 1.35, 0.03, 4));
    A.add('clay_gilt', lathe([[0.001, B - 0.55], [0.55, B - 0.5], [0.6, B - 0.3], [0.62, B - 0.02], [0.001, B]], 22));
  } else if (!o.noThrone) throne(A, o, robe, lod);
  const pose = o.pose || 'abhaya', ph = hash(seed, 7, 1) * 6;
  // ── the legs: crossed under a pile of robe whose folds fan from the lap, or hanging to the footrests
  if (o.pendant) {
    for (const k of [-1, 1]) {
      const hip = [k * 0.38, B + 0.3, -0.05], knee = [k * 0.42, B + 0.34, 1.06], ank = [k * 0.46, 0.5, 1.2];
      A.add(robe, limb([[...hip, 0.34], [...add3(hip, sub(knee, hip), 0.5), 0.31], [...knee, 0.27]], 14, (th, t) => 1 + 0.03 * Math.cos(th * 4 + ph)));
      A.add(robe, blob(knee, 0.27, 0.25, 0.27, 12, 6));
      A.add(robe, limb([[...knee, 0.25], [k * 0.45, B - 0.45, 1.14, 0.22], [k * 0.455, 1.1, 1.18, 0.19], [...ank, 0.16]], 12, (th, t) => 1 + 0.06 * Math.cos(th * 5 + k + ph) * (1 - t * 0.4)));
      // the feet on lotus footrests
      A.add(flesh, blob([k * 0.46, 0.4, 1.32], 0.15, 0.1, 0.27, 10, 5));
      for (let i = 0; i < 5; i++) A.add(flesh, blob([k * 0.46 + (i - 2) * 0.05 * k, 0.37, 1.57 - 0.012 * Math.abs(i - 2)], 0.028, 0.028, 0.045, 5, 3));
      A.add(robe2, lathe([[0.001, 0], [0.4, 0], [0.46, 0.1], [0.32, 0.18], [0.001, 0.2]], 16, (th) => 1 + 0.07 * Math.abs(Math.cos(th * 5)), k * 0.46, 0.0, 1.3));
      for (let i = 0; i < 9; i++) A.add('clay_gilt', petal((i / 9) * TAU, 0.34, 0.1, 0.12, 0.09, 1.2, 0.02, 3).translate(k * 0.46, 0, 1.3));
    }
    // the robe falling between the knees in a long cascade of folds
    const cas = body([{ y: B - 1.0, cz: 1.12, rx: 0.5, rz: 0.1 }, { y: B - 0.5, cz: 1.12, rx: 0.46, rz: 0.12, f: (th) => 1 + 0.1 * Math.cos(th * 6 + ph) }, { y: B + 0.1, cz: 1.0, rx: 0.4, rz: 0.2, f: (th) => 1 + 0.08 * Math.cos(th * 5) }, { y: B + 0.34, cz: 0.5, rx: 0.5, rz: 0.4 }, { y: B + 0.36, cz: 0.1, rx: 0.4, rz: 0.4 }], 18);
    A.add(robe, cas);
    A.add(robe, body([{ y: B + 0.02, cz: 0.3, rx: 0.8, rz: 0.78 }, { y: B + 0.28, cz: 0.32, rx: 0.78, rz: 0.7, f: (th) => 1 + 0.03 * Math.cos(th * 9 + ph) }, { y: B + 0.5, cz: 0.1, rx: 0.62, rz: 0.55 }, { y: B + 0.6, cz: 0, rx: 0.001, rz: 0.001 }], nB));
  } else {
    const rows = [{ y: B, cz: 0.14, rx: 1.22, rz: 0.88 }, { y: B + 0.12, cz: 0.14, rx: 1.28, rz: 0.9 }, { y: B + 0.3, cz: 0.12, rx: 1.12, rz: 0.78 }, { y: B + 0.46, cz: 0.08, rx: 0.88, rz: 0.66 }, { y: B + 0.56, cz: 0.02, rx: 0.6, rz: 0.55 }];
    const f = (th, i) => 1 + 0.035 * Math.cos(th * 13 + ph) * (i > 0 ? 1 : 0.3);
    A.add(robe, skin(rows.map((r, i) => ring(0, r.y, r.cz, r.rx, r.rz, nB, (th) => f(th, i))), true, true));
    for (const k of [-1, 1]) {
      A.add(robe, blob([k * 1.02, B + 0.26, 0.28], 0.38, 0.27, 0.42, 12, 6));
      // the pleats: robe-ropes fanning from the lap to the front edge, each following the surface of the legs
      const nR = lod > 1 ? 6 : 3;
      for (let j = 0; j < nR; j++) {
        const th = Math.PI / 2 + k * (0.08 + j * (1.2 / nR)) + 0.05 * Math.sin(ph + j), pts = [];
        for (let i = 0; i <= 4; i++) {
          const y = B + 0.5 - i * 0.12, rx = at(rows, y, 'rx') * 1.015, rz = at(rows, y, 'rz') * 1.015, cz = at(rows, y, 'cz'), tt = th + k * 0.06 * i;
          pts.push([Math.cos(tt) * rx, y, cz + Math.sin(tt) * rz, 0.026 + 0.008 * Math.sin(j * 2 + i)]);
        }
        A.add(robe, tube(pts, 5, 0.8));
      }
    }
    // the soles of the feet, turned up on the thighs: the heel, five toes
    if (lod > 1) for (const k of [-1, 1]) {
      const c = [k * 0.5, B + 0.55, 0.42];
      A.add(flesh, blob(c, 0.2, 0.05, 0.24, 10, 3));
      for (let i = 0; i < 5; i++) A.add(flesh, blob([c[0] + (i - 2) * 0.06 * k, c[1] + 0.02, c[2] + 0.23 - 0.01 * Math.abs(i - 2)], 0.027, 0.03, 0.04, 5, 3));
    }
  }
  // ── the torso: in the robe (a Buddha) or bare under jewels (a bodhisattva); the chest and the lapels' edge
  const torsoMat = crown ? flesh : robe;
  const wob = (th, i) => 1 + (crown ? 0 : 0.03 * Math.cos(th * 11 + i * 1.7 + ph)) * (1 - smooth(1.2, 1.7, ROWS[Math.min(i, ROWS.length - 1)].y));
  A.add(torsoMat, skin(ROWS.map((r, i) => ring(0, B + r.y, r.cz ?? 0, r.rx, r.rz, nB, (th) => wob(th, i))), true, true));
  if (!crown) {
    // the open neckline: the chest of the body (gilt) between the lapels, widening upward
    const rowsP = [];
    for (let i = 0; i <= 8; i++) {
      const y = 1.02 + i * 0.1, a = 0.2 + 0.5 * smooth(1.0, 1.85, y), rr = [];
      for (let j = 0; j <= 10; j++) {
        const th = Math.PI / 2 + (j / 10 - 0.5) * 2 * a, bump = 0.045 * Math.exp(-Math.pow((Math.abs(th - Math.PI / 2) - 0.34) / 0.22, 2)) * smooth(1.2, 1.45, y) * (1 - smooth(1.55, 1.75, y)), s = 1.09;
        rr.push([Math.cos(th) * at(ROWS, y, 'rx') * s, B + y, at(ROWS, y, 'cz') + Math.sin(th) * (at(ROWS, y, 'rz') * s + bump)]);
      }
      rowsP.push(rr);
    }
    A.add(flesh, skin(rowsP, false, false));
    for (const k of [-1, 1]) {
      const pts = []; for (let i = 0; i <= 8; i++) { const y = 1.02 + i * 0.1, a = 0.2 + 0.5 * smooth(1.0, 1.85, y), th = Math.PI / 2 + k * a; pts.push([Math.cos(th) * at(ROWS, y, 'rx') * 1.09, B + y, at(ROWS, y, 'cz') + Math.sin(th) * at(ROWS, y, 'rz') * 1.09, 0.04]); }
      A.add(robe, tube(pts, 6));
    }
    // the sash and its knot at the belly, a hanging end
    A.add('clay_gilt', band(0, B + 0.97, 0.03, 0.59, 0.5, 0.04, 22));
    A.add(robe2, blob([0.02, B + 0.95, 0.54], 0.12, 0.09, 0.05, 8, 4), strap([[0.04, B + 0.93, 0.55, 0.12], [0.06, B + 0.6, 0.62, 0.14], [0.05, B + 0.3, 0.7, 0.16]], 0.14, 0.02, 0.015));
  } else {
    // the bodhisattva's jewels: a necklace of beads and its pendant, armlets, a belt of plaques, the scarf over both shoulders
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = Math.PI * (0.08 + 0.84 * t); A.add('clay_gilt', blob([Math.cos(a) * 0.46, B + 1.58 - 0.4 * Math.sin(Math.PI * t) ** 1.2, 0.36 + Math.sin(a) * 0.1], 0.035, 0.035, 0.03, 5, 3)); }
    A.add('clay_gilt', blob([0, B + 1.14, 0.47], 0.1, 0.14, 0.03, 8, 5)); A.add('lacquer_red', blob([0, B + 1.14, 0.5], 0.04, 0.06, 0.012, 6, 3));
    A.add('clay_gilt', band(0, B + 0.88, 0.02, 0.6, 0.5, 0.05, 20));
    for (const k of [-1, 1]) A.add('clay_green', strap([[k * 0.52, B + 1.76, 0.0, 0.3], [k * 0.78, B + 1.5, 0.18, 0.3], [k * 0.86, B + 0.9, 0.3, 0.3], [k * 0.9, B + 0.4, 0.34, 0.3]], 0.3, 0.03, 0.02));
    A.add(robe, body([{ y: B + 0.0, rx: 0.8, rz: 0.66 }, { y: B + 0.3, rx: 0.66, rz: 0.55 }, { y: B + 0.7, rx: 0.575, rz: 0.48, f: (th) => 1 + 0.04 * Math.cos(th * 10 + ph) }, { y: B + 0.9, rx: 0.585, rz: 0.49 }], nB, false));
  }
  // ── the neck, with its three folds, and the head
  const hc = [0, B + 2.45, 0.03], hk = 2.5;
  A.add(flesh, tube([[0, B + 1.88, 0, 0.22], [0, B + 2.02, 0.01, 0.19], [0, B + 2.16, 0.02, 0.185]], 10));
  for (const y of [2.0, 2.07, 2.14]) A.add(flesh, band(0, B + y, 0.01, 0.2, 0.2, 0.012, 14, 4));
  head(A, hc, hk, { kind: crown ? 'bodhi' : 'buddha', flesh, lod });
  // ── the hair
  if (crown) {
    A.add('lacquer_black', blob([0, hc[1] + 0.09 * hk, hc[2] - 0.012 * hk], 0.103 * hk, 0.1 * hk, 0.108 * hk, 14, 6));
    A.add('lacquer_black', blob([0, hc[1] + 0.2 * hk, hc[2] - 0.02 * hk], 0.07 * hk, 0.075 * hk, 0.065 * hk, 10, 5), blob([0, hc[1] + 0.29 * hk, hc[2] - 0.02 * hk], 0.045 * hk, 0.055 * hk, 0.04 * hk, 8, 4));
    // the crown: a gilt band, seven leaf-shaped points with a red jewel in each, flaming ties at the ears, discs of the ears' jewels
    A.add('clay_gilt', lathe([[0.9, 0], [0.94, 0.03], [0.97, 0.16], [0.9, 0.2], [0.88, 0.07]], 22, (th) => 1 + 0.04 * Math.max(0, Math.cos(th * 5)), 0, hc[1] + 0.07 * hk, hc[2]));
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.12 + 0.76 * i / 6), r = 0.97, cx = Math.cos(a) * r * 0.95, cz = hc[2] + Math.sin(a) * r * 0.95; A.add('clay_gilt', blob([cx, hc[1] + 0.07 * hk + 0.36 + (i === 3 ? 0.1 : 0), cz], 0.1, 0.22 + (i === 3 ? 0.08 : 0), 0.04, 6, 4)); A.add('lacquer_red', blob([cx, hc[1] + 0.07 * hk + 0.16, cz + Math.sin(a) * 0.035], 0.04, 0.05, 0.02, 5, 3)); }
    for (const k of [-1, 1]) { A.add('clay_gilt', tube([[k * 0.92, hc[1] + 0.08, hc[2], 0.05], [k * 1.0, hc[1] - 0.2, hc[2] - 0.06, 0.05], [k * 1.06, hc[1] - 0.6, hc[2] - 0.1, 0.045]], 6, 0.5)); A.add('clay_gilt', blob([k * 0.89, hc[1] - 0.15, hc[2] + 0.02], 0.05, 0.14, 0.14, 8, 4)); }
  } else {
    // the snail-shell curls of blue, in rings over the skull and the topknot (ushnisha), a pearl at its crown, the hairline
    const bl = 'paint_blue', cr = (lod > 1 ? [[0.11, 0.9, 26], [0.2, 0.84, 22], [0.28, 0.72, 17], [0.34, 0.54, 11]] : [[0.14, 0.86, 14], [0.3, 0.68, 10]]);
    A.add(bl, blob([0, hc[1] + 0.085 * hk, hc[2] - 0.012 * hk], 0.102 * hk, 0.1 * hk, 0.107 * hk, 14, 6));
    for (const [yy, rr, n] of cr) for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + yy * 7, ca = Math.cos(a), sa = Math.sin(a);
      if (sa > 0.4 && yy < 0.25) continue;
      const y = hc[1] + hk * (0.06 + yy * 0.33), r = rr * hk * 0.108 * (1 + 0.05 * yy);
      A.add(bl, blob([ca * r, y, hc[2] + sa * r * 0.95], 0.034 * hk, 0.03 * hk, 0.034 * hk, 5, 2));
    }
    A.add('clay_gilt', blob([0, hc[1] + 0.2 * hk, hc[2] - 0.015 * hk], 0.075 * hk, 0.068 * hk, 0.075 * hk, 10, 5));       // the topknot, gilded
    A.add('lacquer_red', blob([0, hc[1] + 0.265 * hk, hc[2] - 0.01 * hk], 0.016 * hk, 0.016 * hk, 0.016 * hk, 6, 3));
  }
  // ── the arms and hands
  const sh = (k) => [k * 0.68, B + 1.62, -0.02];
  const hands = [];
  if (pose === 'earth' || pose === 'abhaya' || pose === 'dhyana') {
    // right (−x)
    const sR = sh(-1);
    if (pose === 'earth') {
      arm(A, robe, [[...sR, 0.22], [-0.86, B + 1.3, 0.04, 0.2], [-0.96, B + 0.98, 0.22, 0.17], [-0.98, B + 0.78, 0.46, 0.15], [-1.0, B + 0.66, 0.62, 0.16]], 0.5, ph);
      hands.push([[-1.02, B + 0.6, 0.66], [-0.05, -0.55, 0.85], [1, 0.25, 0.1], { curl: 0.15, spread: 0.12, s: 4.5, thumb: 0.5 }]);
    } else if (pose === 'abhaya') {
      arm(A, robe, [[...sR, 0.22], [-0.86, B + 1.35, 0.08, 0.2], [-1.0, B + 1.18, 0.28, 0.17], [-0.96, B + 1.42, 0.5, 0.15], [-0.9, B + 1.66, 0.58, 0.155]], 0.5, ph);
      hands.push([[-0.9, B + 1.7, 0.6], [0.06, 1, 0.2], [0.08, 0, 1], { curl: 0.05, spread: 0.1, s: 4.5, thumb: 0.5 }]);
    } else {
      arm(A, robe, [[...sR, 0.22], [-0.9, B + 1.2, 0.1, 0.2], [-0.8, B + 0.92, 0.36, 0.17], [-0.42, B + 0.72, 0.56, 0.155], [-0.3, B + 0.7, 0.62, 0.15]], 0.5, ph);
      hands.push([[-0.28, B + 0.7, 0.62], [0.9, 0.0, 0.25], [0, 1, 0], { curl: 0.35, spread: 0.06, s: 4.5, thumb: 0.8 }]);
    }
    // left (+x)
    const sL = sh(1);
    if (pose === 'earth') {
      arm(A, robe, [[...sL, 0.22], [0.9, B + 1.22, 0.04, 0.2], [0.94, B + 0.92, 0.2, 0.17], [0.66, B + 0.74, 0.46, 0.155], [0.34, B + 0.68, 0.58, 0.15]], 0.5, ph + 1);
      hands.push([[0.3, B + 0.68, 0.6], [-1, 0.05, 0.3], [0, 1, 0], { curl: 0.45, spread: 0.05, s: 4.5, thumb: 0.5 }]);
      A.add('lacquer_black', lathe([[0.001, 0], [0.12, 0.01], [0.2, 0.07], [0.235, 0.16], [0.22, 0.2], [0.19, 0.18], [0.001, 0.12]], 18, null, 0.18, B + 0.7, 0.62));      // the alms bowl
      A.add('clay_gilt', band(0.18, B + 0.9, 0.62, 0.22, 0.22, 0.012, 16, 4));
    } else if (pose === 'abhaya') {
      arm(A, robe, [[...sL, 0.22], [0.9, B + 1.2, 0.04, 0.2], [0.98, B + 0.96, 0.16, 0.17], [0.92, B + 0.74, 0.4, 0.155], [0.86, B + 0.66, 0.6, 0.15]], 0.5, ph + 1);
      hands.push([[0.84, B + 0.62, 0.64], [-0.1, 0.0, 1], [0, 1, 0], { curl: 0.3, spread: 0.1, s: 4.5, thumb: 0.5 }]);
    } else {
      arm(A, robe, [[...sL, 0.22], [0.9, B + 1.2, 0.1, 0.2], [0.8, B + 0.92, 0.36, 0.17], [0.42, B + 0.72, 0.56, 0.155], [0.3, B + 0.7, 0.62, 0.15]], 0.5, ph + 1);
      hands.push([[0.28, B + 0.67, 0.6], [-0.9, 0, 0.3], [0, 1, 0], { curl: 0.35, spread: 0.06, s: 4.5, thumb: 0.8 }]);
      // the thumbs touch: the circle of the meditation mudra, the two palms one over the other
    }
  }
  for (const [p, f, n, op] of hands) hand(A, flesh, p, f, n, { ...op, s: lod > 1 ? op.s : op.s });
  // ── the mandorla and the haloes
  if (!o.noHalo) mandorla(A, o, lod, B + 2.45, flesh);
  return A;
}

/** The mandorla: a leaf-shaped back that rises in a cushion from its edge, bands of raised rings, a flame border curling out, the head's and the body's haloes, small Buddhas on the band. */
function mandorla(A, o, lod, hy, flesh) {
  const n = lod > 1 ? 56 : 36, cy = 3.45, zb = -0.62, gilt = 'clay_gilt', ph = hash(o.seed ?? 1, 11, 2) * 6;
  const out = (a, k = 1) => {
    const sn = Math.sin(a), w = 1.55 * (1 - 0.32 * Math.max(0, sn) ** 2), h = 1.85 + 0.55 * Math.max(0, sn) ** 6;
    return [Math.cos(a) * w * k, cy + sn * h * k];
  };
  const rings = [];
  for (const [k, dz] of [[0.001, 0.0], [0.45, 0.012], [0.8, 0.0], [0.93, -0.03], [1.0, -0.09], [1.0, -0.12]]) {
    const r = [];
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * TAU, p = out(a, k); r.push([p[0], p[1], zb + dz - (k > 0.9 ? 0 : 0)]); }
    rings.push(r);
  }
  const T = [], tri = (a, b2, c) => { const n = (b2[0] - a[0]) * (c[1] - a[1]) - (b2[1] - a[1]) * (c[0] - a[0]); T.push(...(n >= 0 ? [...a, ...b2, ...c] : [...a, ...c, ...b2])); };
  for (let i = 0; i < rings.length - 1; i++) for (let s = 0; s < n; s++) {
    const t = (s + 1) % n, a0 = i === 0 ? [0, cy, zb] : rings[i][s], b0 = i === 0 ? [0, cy, zb] : rings[i][t];
    if (i === 0) tri(a0, rings[1][s], rings[1][t]); else { tri(rings[i][s], rings[i][t], rings[i + 1][t]); tri(rings[i][s], rings[i + 1][t], rings[i + 1][s]); }
    void b0;
  }
  const last = rings[rings.length - 1];
  for (let s = 0; s < n; s++) { const t = (s + 1) % n; const f = (p, q, r) => { const a = [p[0], p[1], p[2]]; T.push(...a, ...q, ...r); }; void f; T.push(0, cy, last[0][2], ...last[t], ...last[s]); }
  A.add(o.crown ? 'clay_green' : 'clay_robe', fromTriangles(T));
  // bands of raised rings (gilt), the outermost with a bead rim
  for (const [k, r] of [[0.93, 0.03], [0.64, 0.025], [0.3, 0.02]]) { const pts = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * TAU, p = out(a, k); pts.push([p[0], p[1], zb + 0.02 - (k > 0.9 ? 0.03 : 0), r]); } A.add(gilt, tube(pts, 6)); }
  // the flames: tongues round the rim, curling alternately to either side, longer toward the crown
  const nF = lod > 1 ? 40 : 22;
  for (let i = 0; i < nF; i++) {
    const a = -Math.PI / 2 + ((i + 0.5) / nF) * TAU, sn = Math.sin(a), len = 0.26 + 0.16 * Math.max(0, sn) + 0.06 * Math.sin(i * 2.3 + ph), p = out(a, 0.99), q = out(a, 1.0);
    const d = norm([Math.cos(a) * 0.9, Math.sin(a) * 0.9 + 0.3, 0]), sw = (i % 2 ? 1 : -1) * 0.12, side = [-d[1], d[0], 0], rr = [];
    for (let j = 0; j <= 4; j++) {
      const t = j / 4, cx = p[0] + d[0] * len * t + side[0] * sw * t * t * 1.5, cyy = p[1] + d[1] * len * t + side[1] * sw * t * t * 1.5, w = 0.15 * Math.pow(1 - t, 0.8) + 0.012, th = 0.03 * (1 - t) + 0.006;
      rr.push([[cx - side[0] * w, cyy - side[1] * w, zb - 0.1 - th], [cx + side[0] * w, cyy + side[1] * w, zb - 0.1 - th], [cx + side[0] * w, cyy + side[1] * w, zb - 0.1 + th], [cx - side[0] * w, cyy - side[1] * w, zb - 0.1 + th]]);
    }
    void q;
    A.add(gilt, skin(rr, true, true));
  }
  // the haloes of the head and of the body: raised bands with a bead row, and in the head's a lotus of petals
  const vr = (y, r, t, m) => band(0, 0, 0, r, r, t, m, 5).rotateX(Math.PI / 2).translate(0, y, zb + 0.06);
  A.add(gilt, vr(hy, 0.72, 0.035, 36), vr(hy, 0.4, 0.03, 28), vr(2.95, 1.18, 0.04, 40));
  A.add('lacquer_red', lathe([[0.4, 0], [0.7, 0], [0.7, 0.03], [0.4, 0.03]], 30).rotateX(Math.PI / 2).translate(0, hy, zb + 0.03));
  A.add('paint_blue', lathe([[0.001, 0], [0.4, 0], [0.4, 0.03], [0.001, 0.03]], 24).rotateX(Math.PI / 2).translate(0, hy, zb + 0.03));
  for (let i = 0; i < 16; i++) { const th = (i / 16) * TAU; A.add(gilt, blob([Math.cos(th) * 0.55, hy + Math.sin(th) * 0.55, zb + 0.07], 0.055, 0.055, 0.03, 5, 3)); }
  // small seated Buddhas round the outer band, each of three rounded parts: lotus, body in its robe, head with its knot
  if (lod > 1) for (let i = 0; i < 13; i++) {
    const a = Math.PI * (-0.12 + (i / 12) * 1.24), px = Math.cos(a) * 1.26, py = cy + Math.sin(a) * 1.56 - 0.2, z = zb + 0.03, r = 0.1 + 0.01 * hash(i, ph, 5);
    A.add(gilt, blob([px, py - 0.1, z - 0.02], 0.13, 0.04, 0.06, 7, 3), blob([px, py, z - 0.02], 0.1, 0.12, 0.05, 7, 4), blob([px, py + 0.2, z - 0.02], r * 0.75, r * 0.8, 0.05, 6, 4), blob([px, py + 0.31, z - 0.02], 0.03, 0.04, 0.03, 4, 3));
    A.add('paint_blue', blob([px, py + 0.22, z - 0.03], r * 0.8, r * 0.8, 0.05, 6, 3));
  }
}
