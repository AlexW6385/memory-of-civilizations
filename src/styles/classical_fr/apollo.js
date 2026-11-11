// The Apollo fountain (docs/settlements/versailles.md §1a; Tuby, 1668–71): the god in his chariot rising from the water at the
// dawn, drawn by four plunging horses and driven by the sun's rays, tritons blowing conches before them and sea monsters
// about, all of gilt lead; the basin's ring of jets and the plumes from the horses' nostrils and the conches. Built in a local
// frame (x toward the Grand Canal's side, z across) and turned to `d`.

import { lathe, rod } from '../../core/geom.js';

export function apolloGroup(bag, x, y, z, d, r) {
  const rot = -Math.atan2(d[1], d[0]), G = (mat, g) => { g.rotateY(rot); g.translate(x, y, z); bag.add(mat, g); };
  const L = (mat, prof, px, py, pz, seg = 10, mod = null) => G(mat, lathe(prof, seg, mod, px, py, pz));
  const R = (mat, a, b, rr, seg = 6) => G(mat, rod(a, b, rr, seg));
  const GB = 'gilt_bronze';
  // the rock of shell and spray the group stands on
  L('marble', [[3.6, 0], [3.4, 0.5], [2.4, 0.95], [1.4, 1.1], [0.001, 1.1]], 0, 0, 0, 20, (th, i) => 1 + 0.07 * Math.cos(5 * th + i));
  // the chariot: a shell of the sun on two wheels, the god standing in it
  L(GB, [[0.001, 0.5], [0.9, 0.7], [1.15, 1.2], [0.85, 1.7], [0.4, 1.95], [0.001, 1.95]], -1.3, 0.6, 0, 14, (th, i) => (i > 1 ? 1 + 0.12 * Math.cos(th * 4) : 1));
  for (const s of [-1, 1]) {
    R(GB, [-1.3, 1.25, s * 1.2], [-1.3, 1.25, s * 1.32], 0.62, 14); R('lead', [-1.3, 1.25, s * 1.24], [-1.3, 1.25, s * 1.3], 0.5, 14);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 6; R(GB, [-1.3 + Math.cos(a) * 0.6, 1.25 + Math.sin(a) * 0.6, s * 1.31], [-1.3 - Math.cos(a) * 0.6, 1.25 - Math.sin(a) * 0.6, s * 1.31], 0.03, 4); }
  }
  R(GB, [-1.3, 1.25, -1.3], [-1.3, 1.25, 1.3], 0.05, 6);                                      // the axle
  R(GB, [-0.2, 1.4, 0], [1.6, 2.0, 0], 0.07, 6);                                               // the pole
  // the god: draped body, head with its rays, one arm out to the reins, the other raised
  L('marble_smooth', [[0.001, 0], [0.3, 0.05], [0.32, 0.5], [0.24, 1.0], [0.26, 1.3], [0.13, 1.5], [0.001, 1.52]], -1.4, 1.95, 0, 10);
  L('marble_smooth', [[0.001, 0], [0.12, 0.03], [0.13, 0.16], [0.08, 0.26], [0.001, 0.28]], -1.4, 3.42, 0, 8);
  R('marble_smooth', [-1.35, 3.1, 0.2], [-0.4, 2.55, 0.5], 0.06, 6); R('marble_smooth', [-1.4, 3.15, -0.2], [-1.5, 3.9, -0.5], 0.06, 6);
  for (let k = 0; k < 11; k++) { const a = -0.5 + k * 0.2 * Math.PI / 2 * 1.0 + 0.0, ang = (k / 10) * Math.PI * 1.4 - 0.2 * Math.PI; R(GB, [-1.4 - Math.cos(ang) * 0.1, 3.58 + Math.sin(ang) * 0.1, 0], [-1.4 - Math.cos(ang) * 0.55 * 1.0, 3.58 + Math.sin(ang) * 0.55, 0], 0.025, 4); void a; }
  // four horses abreast, rearing out of the water, forelegs folded high, necks arched, manes and tails of gilt
  for (let i = 0; i < 4; i++) {
    const z0 = (i - 1.5) * 1.0, a0 = 1.9 + (i % 2) * 0.35, hy = 2.1 + (i % 2) * 0.15;
    const body = lathe([[0.001, -0.9], [0.34, -0.65], [0.42, 0], [0.36, 0.55], [0.001, 0.95]], 10, null, 0, 0, 0);
    body.rotateZ(-(Math.PI / 2 - 0.55)); body.translate(a0, hy, z0); G(GB, body);                    // the body, raised at the forehand
    R(GB, [a0 + 0.55, hy + 0.5, z0], [a0 + 0.95, hy + 1.45, z0], 0.17, 7);                           // the neck
    const head = lathe([[0.001, 0], [0.13, 0.04], [0.16, 0.3], [0.1, 0.55], [0.07, 0.6], [0.001, 0.62]], 8, null, 0, 0, 0); head.rotateZ(-(Math.PI / 2 + 0.7)); head.translate(a0 + 0.95, hy + 1.5, z0); G(GB, head);
    for (let m = 0; m < 5; m++) R(GB, [a0 + 0.62 + m * 0.08, hy + 0.7 + m * 0.18, z0], [a0 + 0.35 + m * 0.06, hy + 0.85 + m * 0.2, z0 + (m % 2 ? 0.07 : -0.07)], 0.025, 4);   // the mane
    for (const s of [-1, 1]) {
      R(GB, [a0 + 0.55, hy + 0.15, z0 + s * 0.2], [a0 + 1.0, hy + 0.6, z0 + s * 0.24], 0.07, 6); R(GB, [a0 + 1.0, hy + 0.6, z0 + s * 0.24], [a0 + 1.3, hy + 0.35, z0 + s * 0.24], 0.06, 6);        // a foreleg folded
      R(GB, [a0 - 0.55, hy - 0.05, z0 + s * 0.2], [a0 - 0.75, hy - 0.8, z0 + s * 0.22], 0.08, 6); R(GB, [a0 - 0.75, hy - 0.8, z0 + s * 0.22], [a0 - 0.5, 0.9, z0 + s * 0.22], 0.06, 6);        // a hind leg planted in the spray
    }
    R(GB, [a0 - 0.85, hy + 0.1, z0], [a0 - 1.5, hy - 0.5, z0 + (i % 2 ? 0.3 : -0.3)], 0.07, 6);       // the tail
    // the plume at its nostrils
    for (let k = 0; k < 4; k++) R('water_jet', [a0 + 1.4 + k * 0.1, hy + 1.2 + k * 0.2, z0], [a0 + 1.8 + k * 0.25, hy + 1.7 + k * 0.05, z0 + (k - 1.5) * 0.12], 0.02, 4);
  }
  // tritons blowing conches either side, sea monsters (dolphins) at the front
  for (const s of [-1, 1]) {
    const tz = s * 4.6, ta = 0.6;
    L(GB, [[0.001, 0], [0.3, 0.1], [0.34, 0.6], [0.24, 1.05], [0.001, 1.1]], ta, 0.8, tz, 9);
    L(GB, [[0.001, 0], [0.11, 0.03], [0.12, 0.15], [0.07, 0.24], [0.001, 0.26]], ta, 1.9, tz, 8);
    R(GB, [ta, 1.7, tz], [ta - 0.1, 2.5, tz - s * 0.2], 0.06, 6);                                      // the arm raising the shell
    R(GB, [ta - 0.1, 2.5, tz - s * 0.2], [ta + 0.3, 2.95, tz - s * 0.25], 0.09, 6);                    // the conch
    for (let k = 0; k < 7; k++) R(GB, [ta - 0.1 - 0.1 * k, 0.8 - 0.1 * k, tz + s * (0.15 + 0.12 * k)], [ta - 0.2 - 0.12 * k, 0.8 - 0.12 * k, tz + s * (0.25 + 0.13 * k)], 0.2 - 0.02 * k, 6);   // the fish tail curling
    for (let k = 0; k < 6; k++) { const t = k / 6; R('water_jet', [ta + 0.3 + t * 1.6, 2.95 + 4 * 1.8 * t * (1 - t), tz - s * (0.25 + t * 0.8)], [ta + 0.3 + (t + 1 / 6) * 1.6, 2.95 + 4 * 1.8 * (t + 1 / 6) * (1 - t - 1 / 6), tz - s * (0.25 + (t + 1 / 6) * 0.8)], 0.035, 4); }
    const da = 5.0, dz = s * 2.4;
    for (const dd of [0, 1]) { const zz = dz + s * dd * 1.6, aa = da - dd * 0.6;
      R(GB, [aa - 0.4, 0.8, zz], [aa + 0.6, 1.5, zz], 0.22, 7); R(GB, [aa + 0.6, 1.5, zz], [aa + 1.0, 1.9, zz], 0.1, 6); R(GB, [aa - 0.4, 0.8, zz], [aa - 1.1, 0.5, zz], 0.1, 6);
      R('water_jet', [aa + 1.0, 1.9, zz], [aa + 1.7, 2.6, zz + s * 0.15], 0.03, 4); R('water_jet', [aa + 1.7, 2.6, zz + s * 0.15], [aa + 2.2, 1.6, zz + s * 0.3], 0.03, 4); }
  }
  // the ring of jets round the basin: sixteen arcs of water rising toward the group
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, rr = r - 1.6, c = Math.cos(a), s = Math.sin(a);
    for (let j = 0; j < 6; j++) { const t0 = j / 6, t1 = (j + 1) / 6, e = (t) => [c * (rr - t * 5.5), 0.25 + 4 * 3.2 * t * (1 - t), s * (rr - t * 5.5)]; R('water_jet', e(t0), e(t1), 0.04, 4); }
  }
}
