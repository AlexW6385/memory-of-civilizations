// The animals under the two bodhisattvas of the end bays: the white elephant (Samantabhadra) and the lion (the lion-rider Liang Sicheng read
// as Guanyin, the dossier's choice; the brief calls it Mañjuśrī, whose animal it is by the usual iconography). Modelled with muscle and joints:
// a barrel of ribs and a spine, pillar legs with the knee and the pad's nails, the dome of the forehead, ears, a wrinkled trunk; the lion
// crouched on its haunches with the shoulder, elbow and paw, the brow, muzzle, open mouth and a mane of curls. +z is the front.

import { lathe } from '../../core/geom.js';
import { Acc, skin, tube, blob, hash, smooth, limb, curve, ringZ, sash, band } from './sculpt-kit.js';

const TAU = Math.PI * 2;

export function elephant(o = {}) {
  const A = new Acc(), lod = o.lod ?? 2, seed = o.seed ?? 1, ph = hash(seed, 2, 2) * 6, n = lod > 1 ? 26 : 16, W = 'paint_white', T = 'paint_ochre';
  // the barrel: rings along the length, the ridge of the spine and the sag of the belly
  const prof = [[-1.32, 0.001, 0.001, 1.3], [-1.24, 0.34, 0.34, 1.3], [-1.0, 0.56, 0.56, 1.3], [-0.55, 0.68, 0.64, 1.27], [0.0, 0.71, 0.66, 1.25], [0.55, 0.69, 0.65, 1.28], [0.95, 0.56, 0.6, 1.38], [1.12, 0.001, 0.001, 1.45]];
  const f = (z) => (th) => 1 + 0.025 * Math.cos(th * 14 + ph) * smooth(-1.2, -0.6, z) + 0.05 * Math.exp(-Math.pow((th - Math.PI / 2) / 0.4, 2)) * smooth(-1, 0, z) * 0.0;
  A.add(W, skin(prof.map(([z, rx, ry, cy]) => ringZ(z, 0, cy, rx, ry, n, f(z))), true, true));
  // the legs: thigh and shoulder, a knee that bulges forward, the pad with its rim, four nails
  for (const [kx, kz, hind] of [[-1, 1, 0], [1, 1, 0], [-1, -1, 1], [1, -1, 1]]) {
    const x = kx * 0.4, z = kz * 0.72, kn = hind ? -0.05 : 0.05;
    A.add(W, limb([[x, 1.25, z, 0.3], [x * 1.02, 0.95, z, 0.27], [x * 1.02, 0.62, z + kn, 0.215], [x * 1.0, 0.5, z + kn * 1.8, 0.22], [x, 0.3, z, 0.2], [x, 0.1, z + 0.01, 0.225]], 12, (th, t, i) => 1 + 0.03 * Math.cos(th * 5 + i * 1.3 + ph) * (t > 0.3 ? 1 : 0.5)));
    A.add(W, blob([x, 0.52, z + kn * 3 + (hind ? -0.07 : 0.1)], 0.19, 0.15, 0.12, 9, 4));
    A.add(T, lathe([[0.25, 0], [0.26, 0.04], [0.24, 0.09], [0.21, 0.11]], 14, null, x, 0.0, z + 0.01));
    if (lod > 1) for (let i = 0; i < 4; i++) { const a = Math.PI * (0.25 + 0.5 * i / 3); A.add(T, blob([x + Math.cos(a - Math.PI / 2) * 0.16 * 0, x + 0 === 0 ? x + (i - 1.5) * 0.1 : 0, 0.06, z + 0.22], 0.035, 0.04, 0.03, 5, 3)); }
  }
  // the head: the dome of the forehead, the cheeks, the temples' hollow, the jaw; ears like flaps of leather; eyes with brows
  A.add(W, blob([0, 1.65, 1.22], 0.4, 0.44, 0.42, 14, 8));
  A.add(W, blob([0, 1.3, 1.52], 0.27, 0.3, 0.3, 12, 6));
  for (const s of [-1, 1]) {
    A.add(W, blob([s * 0.27, 1.45, 1.4], 0.14, 0.2, 0.17, 8, 5));
    const ear = blob([0, 0, 0], 0.07, 0.46, 0.36, 12, 8); ear.rotateY(s * 0.45).translate(s * 0.55, 1.58, 1.08); A.add(W, ear);
    A.add('lacquer_red', (() => { const e = blob([0, 0, 0], 0.03, 0.36, 0.27, 9, 6); e.rotateY(s * 0.45).translate(s * 0.5, 1.58, 1.1); return e; })());
    A.add('lacquer_black', blob([s * 0.28, 1.6, 1.52], 0.034, 0.03, 0.025, 6, 3));
    A.add(W, blob([s * 0.28, 1.65, 1.5], 0.06, 0.02, 0.04, 6, 3));
  }
  // the trunk, tapering, ringed with wrinkles, curling down and back at the tip
  const tr = curve([[0, 1.5, 1.5, 0.19], [0, 1.2, 1.72, 0.17], [0, 0.82, 1.84, 0.145], [0, 0.5, 1.8, 0.12], [0, 0.3, 1.68, 0.095], [0, 0.3, 1.52, 0.068], [0, 0.4, 1.46, 0.05]], 16);
  A.add(W, limb(tr, 12, (th, t, i) => 1 + 0.07 * Math.cos(i * 2.4 + ph) * (0.4 + t)));
  // the tusks, ivory, curving up and out
  for (const s of [-1, 1]) A.add(T, limb(curve([[s * 0.17, 1.28, 1.6, 0.06], [s * 0.26, 1.05, 1.9, 0.05], [s * 0.3, 0.95, 2.2, 0.035], [s * 0.28, 1.05, 2.42, 0.012]], 8), 8));
  // the tail with its tuft
  A.add(W, limb(curve([[0, 1.3, -1.27, 0.06], [0, 0.9, -1.4, 0.05], [0, 0.5, -1.38, 0.035]], 6), 7)); A.add('lacquer_black', blob([0, 0.4, -1.38], 0.07, 0.12, 0.06, 7, 4));
  // the saddle cloth over the back with its scalloped lower edge and fringe, the girth and the breastband of bells
  const rowsC = [], zs = [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7];
  for (const z of zs) {
    const r = prof.find(([pz]) => pz >= z) || prof[prof.length - 1], rx = (r[1] + 0.0) * 1.05, ry = r[2] * 1.05, row = [];
    for (let j = 0; j <= 14; j++) { const th = -0.5 + (j / 14) * (Math.PI + 1.0), sc = 1 + 0.0; row.push([Math.cos(th) * rx * sc, r[3] + Math.sin(th) * ry, z]); }
    rowsC.push(row);
  }
  const am = (zi) => 1; void am;
  A.add('clay_robe', skin(rowsC, false, false));
  A.add('clay_gilt', tube(rowsC.map((r) => [...r[0], 0.015]), 5), tube(rowsC.map((r) => [...r[r.length - 1], 0.015]), 5));
  A.add('lacquer_red', band(0, 1.2, -0.05, 0.74, 0.7, 0.03, 20, 4).rotateX(Math.PI / 2).rotateX(-Math.PI / 2));
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + 0.8 * i / 8); A.add('clay_gilt', blob([Math.cos(a) * 0.52, 1.12 - Math.sin(a) * 0.12, 0.95 + Math.sin(a) * 0.12], 0.05, 0.05, 0.05, 6, 3)); }
  // the lotus seat for the rider
  A.add('clay_gilt', lathe([[0.001, 1.9], [0.56, 1.93], [0.6, 1.98], [0.001, 2.0]], 18));
  return A;
}

export function lion(o = {}) {
  const A = new Acc(), lod = o.lod ?? 2, seed = o.seed ?? 1, ph = hash(seed, 4, 2) * 6, n = lod > 1 ? 22 : 14, Bd = 'paint_ochre', M = 'clay_green';
  // the torso on its haunches: a spine curving from the croup up over the shoulders to the neck, ribs and the deep chest
  const sp = curve([[0, 0.45, -0.7, 0.38], [0, 0.72, -0.3, 0.46], [0, 0.98, 0.25, 0.44], [0, 1.25, 0.48, 0.35], [0, 1.5, 0.6, 0.28]], 12);
  A.add(Bd, limb(sp, n, (th, t, i) => 1 + 0.03 * Math.cos(th * 6 + i + ph) * (1 - t)));
  // the hind legs folded: thigh, the hock, the paw flat on the ground; the forelegs straight, elbow out, the wrist, the paw with toes and claws
  for (const s of [-1, 1]) {
    A.add(Bd, blob([s * 0.38, 0.48, -0.45], 0.19, 0.4, 0.43, 11, 7));
    A.add(Bd, limb(curve([[s * 0.36, 0.4, -0.7, 0.14], [s * 0.34, 0.22, -0.55, 0.1], [s * 0.3, 0.1, -0.2, 0.08]], 5), 8));
    A.add(Bd, blob([s * 0.3, 0.07, -0.05], 0.12, 0.07, 0.2, 9, 4));
    A.add(Bd, limb(curve([[s * 0.28, 1.12, 0.38, 0.17], [s * 0.3, 0.8, 0.5, 0.13], [s * 0.27, 0.45, 0.58, 0.1], [s * 0.26, 0.14, 0.62, 0.095]], 7), 10, (th, t) => 1 + 0.1 * Math.exp(-Math.pow((t - 0.35) / 0.2, 2)) * Math.cos(th)));
    A.add(Bd, blob([s * 0.34, 0.9, 0.35], 0.1, 0.12, 0.1, 7, 4));      // the elbow
    A.add(Bd, blob([s * 0.26, 0.07, 0.76], 0.125, 0.07, 0.17, 9, 4));
    if (lod > 1) for (let i = 0; i < 4; i++) { A.add(Bd, blob([s * 0.26 + (i - 1.5) * 0.06, 0.05, 0.9], 0.028, 0.03, 0.05, 5, 3)); A.add('paint_white', blob([s * 0.26 + (i - 1.5) * 0.06, 0.03, 0.96], 0.014, 0.012, 0.03, 4, 2)); }
  }
  // the head up, the brow and the ridge of the nose, the muzzle, the jaw open on a red mouth with fangs, eyes, ears
  const hc = [0, 1.62, 0.78];
  A.add(Bd, blob(hc, 0.3, 0.28, 0.3, 14, 8));
  A.add(Bd, blob([0, hc[1] + 0.12, hc[2] + 0.2], 0.28, 0.07, 0.1, 10, 4));
  A.add(Bd, blob([0, hc[1] - 0.04, hc[2] + 0.3], 0.17, 0.14, 0.2, 10, 6));
  A.add(Bd, blob([0, hc[1] - 0.22, hc[2] + 0.2], 0.14, 0.05, 0.2, 9, 4));
  A.add('lacquer_red', blob([0, hc[1] - 0.15, hc[2] + 0.3], 0.1, 0.05, 0.14, 8, 3), blob([0, hc[1] - 0.17, hc[2] + 0.28], 0.07, 0.025, 0.1, 7, 3));
  A.add('lacquer_black', blob([0, hc[1] + 0.03, hc[2] + 0.48], 0.075, 0.05, 0.04, 8, 4));
  for (const s of [-1, 1]) {
    A.add('paint_white', blob([s * 0.06, hc[1] - 0.1, hc[2] + 0.43], 0.012, 0.045, 0.012, 4, 3), blob([s * 0.07, hc[1] - 0.2, hc[2] + 0.4], 0.01, 0.035, 0.01, 4, 3));
    A.add('lacquer_black', blob([s * 0.14, hc[1] + 0.1, hc[2] + 0.22], 0.05, 0.035, 0.03, 7, 3));
    A.add('paint_white', blob([s * 0.14, hc[1] + 0.1, hc[2] + 0.235], 0.025, 0.02, 0.01, 5, 3));
    A.add(Bd, blob([s * 0.2, hc[1] + 0.12, hc[2] - 0.05], 0.07, 0.09, 0.04, 8, 4));
    A.add(Bd, blob([s * 0.13, hc[1] + 0.16, hc[2] + 0.19], 0.1, 0.035, 0.07, 7, 3));       // the brow
  }
  // the mane: curls in overlapping rings round the head, the neck and the chest
  const rowsM = lod > 1 ? [[1.84, 0.28, 11, 0.7], [1.64, 0.4, 14, 0.5], [1.4, 0.48, 14, 0.35], [1.15, 0.5, 12, 0.25], [0.9, 0.46, 10, 0.2]] : [[1.7, 0.36, 8, 0.6], [1.3, 0.48, 9, 0.3]];
  for (const [ry, rr, cnt, zc] of rowsM) for (let i = 0; i < cnt; i++) {
    const a = Math.PI * (-0.1 + 1.2 * (i / (cnt - 1))) + Math.PI, h = hash(i, ry * 10, ph), cz = 0.45 + zc * 0.4;
    A.add(M, blob([Math.cos(a) * rr, ry + 0.04 * h, cz + Math.sin(a) * rr * 0.62 + (ry > 1.5 ? 0.15 : 0)], 0.1 + 0.025 * h, 0.1, 0.09, 7, 4));
  }
  // the tail rising with its tuft; the saddle cloth and a lotus seat
  A.add(Bd, limb(curve([[0, 0.5, -1.05, 0.06], [0, 0.8, -1.3, 0.055], [0, 1.15, -1.22, 0.05], [0, 1.4, -1.0, 0.04]], 8), 7));
  for (let i = 0; i < 6; i++) A.add(M, blob([(i - 2.5) * 0.04, 1.5 + 0.04 * Math.sin(i * 2), -0.98 - 0.03 * (i % 2)], 0.07, 0.11, 0.06, 6, 3));
  A.add('clay_robe', limb([[0, 1.26, -0.2, 0.001], [0, 1.26, -0.2, 0.54], [0, 1.23, -0.2, 0.55], [0, 1.2, -0.2, 0.5]].map((p) => p), 18));
  A.add('clay_gilt', lathe([[0.001, 1.3], [0.5, 1.32], [0.5, 1.36], [0.001, 1.38]], 18, null, 0, 0, -0.2));
  return A;
}
