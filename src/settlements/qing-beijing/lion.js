// The bronze lions of the Gate of Supreme Harmony and the Gate of Heavenly Purity, modelled (docs/settlements/qing-beijing.md §37): a seated
// guardian of lofted volumes — the chest, the haunches with their folded hind legs, forelegs with shoulder, elbow, wrist and paw —, the head
// with brow ridge, bulging eyes, the flared nose, cheeks, the open jaws with teeth and tongue, ears, the mane of 45 snail curls with its locks
// falling over the chest, the collar with its bell, the tail in a fan of plumes; the male with the embroidered ball under his right
// forepaw, the female with her cub under her left; both on a carved sumeru plinth with a band of lotus petals. Facing +z, feet at y = 0.
// fine: only the layer drawn over it when the visitor is near (the curls' inner coils, the teeth, the claws, the collar's beads, the
// ball's studs).
import { Parts, T, sumeru } from '../../styles/qing/carving.js';
import { curve, ell, cone, ring, spline, add, norm, sub, cross, h01 } from './sculpt.js';

const X = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** An ellipsoid with the x axis turned about y by `yaw` and tipped about z by `tilt`: a limb's muscle. */
const blob = (c, r, n = 8, m = 5, yaw = 0, tilt = 0) => {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const ax = [[cy * ct, st, -sy * ct], [-cy * st, ct, sy * st], [sy, 0, cy]];
  return ell(c, r, ax, n, m);
};
function paw(put, x, y, z, w, fine, sgn) {
  put(blob([x, y + 0.045, z], [w, 0.075, 0.2], 8, 4));
  for (let k = -1.5; k <= 1.5; k++) {
    const tx = x + k * w * 0.42;
    put(blob([tx, y + 0.04, z + 0.17], [w * 0.2, 0.05, 0.075], 6, 3));
    if (fine) put(cone([tx, y + 0.045, z + 0.23], [tx + sgn * 0.004, y + 0.01, z + 0.31], 0.026, 4));
  }
}
function curl(put, c, n, r, fine) {
  put(ell(c, [r * 0.9, r * 0.9, r * 0.55], (() => { const u = norm(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])); return [n, u, cross(n, u)]; })(), 7, 4));
  put(ring(add(c, n, r * 0.35), r * 0.62, r * 0.2, n, 10, 4));
  if (fine) put(ring(add(c, n, r * 0.5), r * 0.3, r * 0.14, n, 8, 4));
}
/** The lion on its pedestal-less base (the lion alone), standing at the origin on y = 0; put(g) adds a geometry to the metal. */
export function lion(put, { paw: pw = null, fine = false } = {}) {
  const body = !fine, ball = pw === 'ball', cub = pw === 'cub';
  if (body) {
    // the chest and body: wider than deep, rising to the neck
    put(curve([[0, 0.5, -0.5], [0, 0.82, -0.38], [0, 1.14, -0.1], [0, 1.4, 0.12]], 0.5, 0.42, { up: [0, 0, 1], flat: 0.86, n: 12, per: 3, swell: 0.12 }));
    put(blob([0, 0.42, -0.5], [0.5, 0.4, 0.45], 10, 6));                  // the rump
    for (const s of [-1, 1]) {
      put(blob([s * 0.4, 0.4, -0.34], [0.26, 0.36, 0.5], 9, 6, 0, 0));      // the haunch
      put(curve([[s * 0.42, 0.2, -0.6], [s * 0.42, 0.13, -0.2], [s * 0.43, 0.11, 0.1]], 0.13, 0.1, { n: 7, per: 3, swell: 0.1 }));   // the folded hind leg: hock to foot
      put(blob([s * 0.43, 0.085, 0.22], [0.13, 0.075, 0.2], 8, 4));
      put(blob([s * 0.46, 0.2, -0.64], [0.1, 0.12, 0.12], 7, 4));            // the hock
      // the shoulder and foreleg
      put(blob([s * 0.34, 1.08, 0.1], [0.2, 0.32, 0.26], 9, 6));
      const raised = (ball && s < 0) || (cub && s > 0), foot = ball && s < 0 ? [-0.38, 0.6, 0.55] : cub && s > 0 ? [0.38, 0.34, 0.6] : [s * 0.3, 0.1, 0.58];
      const el = raised ? [s * 0.36, 0.66, 0.2] : [s * 0.32, 0.64, 0.16], wr = raised ? [foot[0], foot[1] + 0.12, foot[2] - 0.05] : [s * 0.3, 0.2, 0.5];
      put(curve([[s * 0.33, 1.1, 0.14], el], 0.17, 0.12, { n: 8, per: 2, swell: 0.25 }));      // the upper arm, its muscle
      put(blob(el, [0.1, 0.1, 0.1], 7, 4));                                                    // the elbow
      put(curve([el, wr], 0.12, 0.085, { n: 8, per: 3, swell: 0.22 }));                        // the forearm
      put(blob(wr, [0.085, 0.085, 0.085], 7, 4));                                              // the wrist
      if (!raised) put(blob([s * 0.3, 0.1, 0.58], [0.15, 0.1, 0.22], 8, 5));
      else put(blob([foot[0], foot[1] + 0.04, foot[2] + 0.04], [0.15, 0.1, 0.2], 8, 5));
    }
    // the neck's mane, the head
    put(blob([0, 1.5, 0.05], [0.56, 0.55, 0.42], 12, 7));
    const hc = [0, 1.82, 0.32];
    put(blob(hc, [0.44, 0.4, 0.42], 12, 7));
    put(blob([0, 1.66, 0.68], [0.3, 0.2, 0.24], 9, 5));                                        // the muzzle
    put(blob([0, 1.78, 0.86], [0.14, 0.09, 0.09], 8, 4)); put(blob([0, 1.84, 0.8], [0.09, 0.08, 0.1], 7, 4));             // the nose's bridge and bulb
    for (const s of [-1, 1]) {
      put(blob([s * 0.09, 1.75, 0.92], [0.05, 0.045, 0.045], 6, 3));                            // the nostrils' flares
      put(blob([s * 0.3, 1.65, 0.56], [0.14, 0.14, 0.16], 8, 4));                              // the cheeks
      put(ell([s * 0.17, 1.93, 0.66], [0.085, 0.085, 0.085], X, 8, 5));                       // the eyes, bulging
      put(blob([s * 0.18, 2.03, 0.63], [0.17, 0.05, 0.1], 8, 4, 0, s * -0.25));                // the brow ridge
      put(blob([s * 0.41, 1.99, 0.3], [0.07, 0.13, 0.05], 7, 4));                              // the ears
      put(cone([s * 0.13, 1.56, 0.86], [s * 0.13, 1.4, 0.9], 0.032, 5));                      // the fangs
      put(cone([s * 0.1, 1.38, 0.82], [s * 0.1, 1.52, 0.84], 0.026, 4));
    }
    put(curve([[-0.28, 1.56, 0.76], [-0.14, 1.53, 0.9], [0, 1.52, 0.93], [0.14, 1.53, 0.9], [0.28, 1.56, 0.76]], 0.045, 0.045, { n: 6, per: 2 }));   // the upper lip
    put(blob([0, 1.42, 0.64], [0.2, 0.065, 0.2], 8, 4)); put(blob([0, 1.38, 0.78], [0.12, 0.07, 0.1], 7, 4));              // the lower jaw, open
    put(blob([0, 1.47, 0.7], [0.1, 0.03, 0.14], 7, 3));                                                                       // the tongue
    put(blob([0, 1.84, 0.36], [0.08, 0.09, 0.09], 7, 4));                                                                     // the forehead's boss
    // the snail curls: nine across, five rows (the stated forty-five)
    const D = Math.PI / 180, hr = [0.46, 0.42, 0.42];
    for (const be of [-25, 5, 35, 65, 95]) for (let k = -4; k <= 4; k++) {
      const al = k * 16 * D, bb = be * D, d = [Math.sin(al), Math.cos(al) * Math.cos(bb), -Math.cos(al) * Math.sin(bb)];
      const q = d.map((v, i) => v * hr[i] * 1.0), c = add(hc, [q[0], q[1], q[2]], 1);
      curl(put, c, norm([d[0] / hr[0], d[1] / hr[1], d[2] / hr[2]]), 0.072 + 0.008 * h01(c[0] * 9, c[1] * 7, c[2] * 5), false);
    }
    // the mane's own curls, in rows over the ruff round the head and down the shoulders, and three broad locks each side
    const mr = [0.56, 0.55, 0.42], mc = [0, 1.5, 0.05];
    for (const el of [-30, 0, 30, 60]) for (let az = -150; az <= 150; az += 30) {
      const ae = az * D, ee = el * D, d = [Math.sin(ae) * Math.cos(ee), Math.sin(ee), Math.cos(ae) * Math.cos(ee)];
      if (Math.abs(az) < 50 && el >= 0) continue;                      // under the head's cheeks
      const c = [mc[0] + d[0] * mr[0] * 1.0, mc[1] + d[1] * mr[1] * 1.0, mc[2] + d[2] * mr[2] * 1.0];
      if (c[2] > 0.3 && Math.abs(c[0]) < 0.25 && c[1] > 1.2) continue;
      curl(put, c, norm([d[0] / mr[0], d[1] / mr[1], d[2] / mr[2]]), 0.085 + 0.01 * h01(c[0] * 9, c[1] * 7, c[2] * 5), false);
    }
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const x0 = s * (0.22 + i * 0.13), z0 = 0.4 - i * 0.04, w = 0.04 * (h01(i, s) - 0.5);
      put(curve([[x0, 1.44, z0], [x0 + s * 0.04 + w, 1.26, z0 + 0.1], [x0 + s * 0.08 - w, 1.06, z0 + 0.12], [x0 + s * 0.06, 0.88 - i * 0.05, z0 + 0.06]], 0.1, 0.02, { n: 6, per: 3, flat: 0.6, up: [0, 0, 1], swell: 0.1 }));
    }
    // the collar and its bell
    put(ring([0, 1.24, 0.0], 0.47, 0.045, [0, 1, 0], 24, 5));
    put(ell([0, 1.09, 0.45], [0.105, 0.115, 0.105], X, 10, 6)); put(ring([0, 1.2, 0.46], 0.04, 0.012, [0, 0, 1], 8, 4));
    put(ell([0, 1.05, 0.55], [0.03, 0.05, 0.012], X, 5, 3));                                                     // the bell's slit
    // the tail: a root and a fan of seven plumes
    put(curve([[0, 0.5, -0.9], [0, 0.7, -1.0], [0, 0.95, -0.98]], 0.1, 0.08, { n: 7, per: 3 }));
    for (let k = -3; k <= 3; k++) {
      const a = k * 0.3;
      put(curve([[0, 0.95, -0.98], [Math.sin(a) * 0.3, 1.15 + Math.cos(a) * 0.15, -1.04 - 0.1], [Math.sin(a) * 0.55 + 0.04 * k, 1.35 + Math.cos(a) * 0.25, -1.1 - 0.04 * Math.abs(k)], [Math.sin(a) * 0.6, 1.55 + Math.cos(a) * 0.22 - Math.abs(k) * 0.07, -1.08]], 0.075, 0.01, { n: 5, per: 3, flat: 0.5, up: [0, 0, 1] }));
    }
    for (let i = 0; i < 6; i++) put(blob([0, 1.3 - i * 0.14, -0.04 - 0.0 * i + (-0.28 + 0.06 * i)], [0.09, 0.07, 0.06], 6, 3));      // the spine's knuckles
    // the ball under the right forepaw, the cub under the left
    if (ball) {
      put(ell([-0.38, 0.29, 0.55], [0.29, 0.29, 0.29], X, 14, 9));
      for (const [ax] of [[[1, 0, 0]], [[0, 0, 1]], [[0.7, 0, 0.7]]]) put(ring([-0.38, 0.29, 0.55], 0.292, 0.016, ax, 20, 4));
      for (const s of [-1, 1]) put(curve([[-0.38 + s * 0.04, 0.0, 0.8], [-0.38 + s * 0.08, -0.0 + 0.02, 0.9]], 0.03, 0.015, { n: 5, per: 1 }));
    } else if (cub) {
      put(blob([0.38, 0.14, 0.58], [0.17, 0.12, 0.25], 8, 5)); put(blob([0.38, 0.2, 0.84], [0.115, 0.105, 0.115], 8, 5));
      for (const s of [-1, 1]) {
        put(blob([0.38 + s * 0.09, 0.3, 0.9], [0.03, 0.045, 0.02], 5, 3));
        put(curve([[0.38 + s * 0.12, 0.2, 0.5], [0.38 + s * 0.15, 0.3, 0.44]], 0.04, 0.03, { n: 5, per: 1 }));
        put(curve([[0.38 + s * 0.1, 0.1, 0.7], [0.38 + s * 0.14, 0.2, 0.74]], 0.04, 0.03, { n: 5, per: 1 }));
      }
      put(blob([0.38, 0.17, 0.95], [0.05, 0.04, 0.04], 6, 3));
    }
  }
  // the fine layer and the feet's detail
  for (const s of [-1, 1]) {
    const raised = (ball && s < 0) || (cub && s > 0);
    if (!raised) paw(put, s * 0.3, 0.0, 0.58, 0.15, fine, s);
    paw(put, s * 0.43, 0.0, 0.22, 0.13, fine, s);
  }
  if (fine) {
    const hc = [0, 1.82, 0.32];
    for (let i = 0; i < 9; i++) put(ring([0, 1.24, 0.0], 0.47, 0.012, [0, 1, 0], 4, 3, i * 0.7, 0.5));
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; put(ell([Math.cos(a) * 0.47, 1.25, Math.sin(a) * 0.47], [0.035, 0.035, 0.035], X, 6, 3)); }   // the collar's beads
    for (let q = 0; q < 6; q++) { const x = -0.2 + q * 0.08; put(cone([x, 1.54, 0.84], [x, 1.46, 0.85], 0.016, 4)); put(cone([x + 0.02, 1.43, 0.8], [x + 0.02, 1.5, 0.81], 0.014, 4)); }   // the rows of teeth
    if (ball) for (let k = 0; k < 14; k++) { const a = k * 2.4, b = Math.acos(1 - 2 * ((k + 0.5) / 14)); put(ell([-0.38 + Math.sin(b) * Math.cos(a) * 0.3, 0.29 + Math.cos(b) * 0.3, 0.55 + Math.sin(b) * Math.sin(a) * 0.3], [0.024, 0.024, 0.024], X, 5, 3)); }
    for (let i = 0; i < 5; i++) { const c = add(hc, [(i - 2) * 0.15, 0.4, 0.04], 1); put(ring(add(c, [0, 0, 0.0], 1), 0.05, 0.012, [0, 1, 0.2], 8, 3)); }
  }
}
/** The carved plinth (the sumeru of the lions' seat): the stacked mouldings with a row of lotus petals above the waist and below it. */
export function plinth(P, stone, x0, z0, x1, z1, h) {
  sumeru(P, stone, x0, z0, x1, z1, h);
  const rows = [[0.24, 0.32, 0.1, 1], [0.66, 0.74, 0.1, -1]];
  for (const [a, b, ins, dir] of rows) {
    const ya = a * h, yb = b * h, ym = (ya + yb) / 2, hh = (yb - ya) / 2;
    const edges = [[[x0 + ins, z1 - ins], [x1 - ins, z1 - ins], [0, 1]], [[x1 - ins, z0 + ins], [x0 + ins, z0 + ins], [0, -1]], [[x1 - ins, z1 - ins], [x1 - ins, z0 + ins], [1, 0]], [[x0 + ins, z0 + ins], [x0 + ins, z1 - ins], [-1, 0]]];
    for (const [p, q, n] of edges) {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]), cnt = Math.max(2, Math.round(L / 0.2)), tx = (q[0] - p[0]) / L, tz = (q[1] - p[1]) / L;
      for (let i = 0; i < cnt; i++) {
        const u = (i + 0.5) / cnt * L, c = [p[0] + tx * u + n[0] * 0.012, ym, p[1] + tz * u + n[1] * 0.012], w = L / cnt * 0.48;
        const ax = [[tx, 0, tz], [0, dir, 0], [n[0], 0, n[1]]];
        P.add(stone, ell(c, [w, hh * 0.98, 0.03 + 0.008 * h01(c[0] * 13, c[2] * 7)], ax, 7, 5, (x, y) => (y > 0 ? 1 - 0.55 * y * y : 1)));
      }
    }
  }
}
export function buildLion(P, m, stone, { paw: pw, fine = false, ped = 1.4 }) {
  if (!fine) plinth(P, stone, -1.1, -1.5, 1.1, 1.5, ped);
  const L = new Parts();
  lion((g) => L.add(m, g), { paw: pw, fine });
  for (const [mm, list] of L.m) for (const g of list) { g.translate(0, ped - 0.02, 0); P.add(mm, g); }
}
