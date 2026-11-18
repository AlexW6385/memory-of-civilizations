// The seated Buddha of the niches and of the pierced stupas, modelled for the eye at a metre (docs/settlements/borobudur.md §20):
// in padmasana on a double lotus, the robe over both shoulders in folds with its edge across the chest, the face with
// downcast lids, brows, nose, lips, long ears, the urna, the ushnisha with its jewel and the hair in snail-shell curls,
// the hands in the mudra of his quarter. Faces +z, base at the origin, about 1.05 m seated. h in [0, 1) turns the head a
// little and sets the curls, so that no two niches hold the same shape (and the plan merges them instead of instancing).

import { lathe } from '../../core/geom.js';
import { Sculpt } from './sculpt.js';

const TAU = Math.PI * 2;

/** The double lotus seat of radius r: an upturned row of petals over a hanging one, on a moulded base. */
function lotus(r, n, h) {
  const petals = (th) => 1 + 0.055 * Math.pow(Math.abs(Math.cos(th * n / 2)), 0.6);
  const pend = (th) => 1 + 0.08 * Math.pow(Math.abs(Math.cos(th * n / 2 + 0.5)), 0.7);
  return [
    lathe([[r * 0.78, 0], [r * 0.95, h * 0.04], [r * 0.95, h * 0.1], [r * 0.84, h * 0.14], [r * 0.84, h * 0.2]], n * 2),              // the base's mouldings
    lathe([[r * 0.84, h * 0.2], [r * 1.0, h * 0.3], [r * 1.05, h * 0.42], [r * 0.99, h * 0.5], [r * 0.9, h * 0.52]], n * 2, pend),     // the petals hanging
    lathe([[r * 0.9, h * 0.52], [r * 0.96, h * 0.56], [r * 1.06, h * 0.72], [r * 1.07, h * 0.88], [r * 0.99, h], [r * 0.5, h]], n * 2, petals),   // the petals turned up
  ];
}

export function buddha(mudra, lod, h = 0.5) {
  const full = lod >= 2, S = new Sculpt({ O: [0, 0, 0], U: [1, 0], N: [0, 1] }, !full), o = (a) => (h - 0.5) * a;
  const geos = lotus(0.5, full ? 12 : 8, 0.2);
  const sol = (c, r, op = {}) => S.solid(c, r, { n: full ? 10 : 7, m: full ? 5 : 4, ...op });
  // the legs crossed: the thighs out to the knees, the shins crossing in front, the soles turned up
  for (const q of [-1, 1]) {
    S.pipe([[q * 0.1, 0.27, -0.04], [q * 0.26, 0.27, 0.1], [q * 0.38, 0.26, 0.2]], [[0.1, 0.075], [0.095, 0.07], [0.075, 0.06]], { seg: 2, n: full ? 10 : 7 });
    S.pipe([[q * 0.38, 0.26, 0.22], [q * 0.2, 0.285, 0.34], [-q * 0.06, 0.3, 0.33]], [[0.07, 0.055], [0.062, 0.05], [0.052, 0.045]], { seg: 2, n: full ? 9 : 6 });
    sol([-q * 0.1, 0.33, 0.33], [0.075, 0.025, 0.06], { yaw: -q * 0.3, n: 8, m: 3 });                                                      // the sole
    if (full) for (let k = 0; k < 4; k++) sol([-q * (0.045 + k * 0.026), 0.34, 0.385 - k * 0.006], [0.012, 0.011, 0.016], { n: 5, m: 3 });   // the toes
    sol([q * 0.38, 0.27, 0.2], [0.075, 0.075, 0.075], { n: 8, m: 4 });                                                                  // the knee
  }
  // the robe over the lap: a cloth over the thighs with its folds fanning from the middle to the knees
  sol([0, 0.31, 0.12], [0.44, 0.1, 0.27], { mod: full ? (ph) => 1 + 0.035 * Math.cos(ph * 9) : null });
  if (full) for (let i = -3; i <= 3; i++) S.pipe([[i * 0.03, 0.4, 0.28], [i * 0.075, 0.36, 0.34 + 0.012 * Math.abs(i)], [i * 0.11, 0.33, 0.35 - 0.02 * Math.abs(i)]], [0.012, 0.011, 0.007], { seg: 2, n: 5, cap: 1 });
  // the body: waist, chest, shoulders; the robe's edge and its folds
  S.pipe([[0, 0.34, 0], [0, 0.46, 0.005], [0, 0.58, 0.01], [0, 0.67, 0]], [[0.15, 0.1], [0.165, 0.105], [0.2, 0.11], [0.235, 0.1]], { seg: 3, n: full ? 12 : 8, capLen: 0.06, fold: full ? (t, ph) => 1 + 0.04 * Math.cos(ph * 6 + t * 3) : null });
  for (const q of [-1, 1]) sol([q * 0.245, 0.65, 0], [0.075, 0.065, 0.075]);
  if (full) {
    S.pipe([[0.22, 0.68, 0.085], [0.06, 0.52, 0.12], [-0.12, 0.4, 0.12]], [0.012, 0.012, 0.01], { seg: 3, n: 6, cap: 1 });             // the edge of the robe across the chest
    S.pipe([[0.2, 0.7, 0.09], [0.0, 0.5, 0.13], [-0.18, 0.37, 0.12]], [0.008, 0.008, 0.007], { seg: 3, n: 5, cap: 1 });
    for (let i = 0; i < 4; i++) S.pipe([[-0.21 + i * 0.01, 0.68, 0.08], [-0.17 + i * 0.03, 0.55, 0.12], [-0.13 + i * 0.05, 0.42, 0.125]], [0.007, 0.007, 0.005], { seg: 2, n: 5, cap: 1 });   // folds over the other shoulder
  }
  // the arms and the hands by the mudra (the right hand at −x as seen from the front)
  const arm = (q, el, wr) => { S.pipe([[q * 0.25, 0.65, 0], [q * 0.27, 0.56, 0.03], el], [0.052, 0.047, 0.043], { seg: 2, n: full ? 8 : 6 }); S.pipe([el, [(el[0] + wr[0]) / 2, (el[1] + wr[1]) / 2, (el[2] + wr[2]) / 2 + 0.01], wr], [0.04, 0.036, 0.03], { seg: 2, n: full ? 8 : 6 }); };
  const palm = (c, yaw, tilt, open = true) => {
    sol(c, [0.04, 0.012, 0.045], { yaw, tilt, n: 8, m: 3 });
    if (!full) return;
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (let i = -1.5; i <= 1.5; i++) {
      const lx = i * 0.021, f = open ? 0.056 : 0.032, base = [c[0] + lx * cs + 0.03 * sn * Math.cos(tilt), c[1] + 0.03 * Math.sin(tilt) * 0 + (open ? 0.03 * Math.sin(tilt) : 0), c[2] - lx * sn + 0.03 * cs * Math.cos(tilt)];
      S.pipe([base, [base[0] + f * 0.5 * sn, base[1] + f * 0.5 * Math.sin(tilt), base[2] + f * 0.5 * cs], [base[0] + f * sn, base[1] + f * Math.sin(tilt) - (open ? 0 : 0.012), base[2] + f * cs]], [0.0105, 0.0095, 0.007], { seg: 1, n: 4, cap: 1 });
    }
    S.pipe([[c[0] - 0.03 * cs, c[1], c[2] + 0.03 * sn], [c[0] - 0.045 * cs + 0.02 * sn, c[1], c[2] + 0.04 * sn + 0.02 * cs]], [0.011, 0.007], { seg: 1, n: 4, cap: 1 });   // the thumb
  };
  const lap = (q) => { arm(q, [q * 0.29, 0.43, 0.1], [q * 0.1, 0.36, 0.2]); palm([q * 0.085, 0.37, 0.215], -q * 0.4, 0); };
  if (mudra === 'meditation') { for (const q of [-1, 1]) { arm(q, [q * 0.29, 0.43, 0.1], [q * 0.07, 0.37, 0.2]); } palm([0, 0.375, 0.22], 0, 0); }
  else if (mudra === 'teaching') { for (const q of [-1, 1]) arm(q, [q * 0.29, 0.5, 0.1], [q * 0.07, 0.58, 0.19]); palm([-0.05, 0.6, 0.2], 0.9, 1.2); palm([0.05, 0.585, 0.2], -0.9, 1.2); }
  else {
    lap(1);
    if (mudra === 'earth') { arm(-1, [-0.31, 0.43, 0.12], [-0.34, 0.3, 0.3]); palm([-0.35, 0.27, 0.33], 0.2, -1.2); }
    else if (mudra === 'giving') { arm(-1, [-0.31, 0.43, 0.12], [-0.33, 0.33, 0.28]); palm([-0.335, 0.32, 0.3], 0.3, -0.5); }
    else if (mudra === 'fearless') { arm(-1, [-0.31, 0.47, 0.1], [-0.27, 0.6, 0.2]); palm([-0.265, 0.65, 0.23], 0.1, 1.3); }
    else { arm(-1, [-0.3, 0.46, 0.1], [-0.2, 0.58, 0.2]); palm([-0.19, 0.62, 0.22], 0.2, 1.3, false); }
  }
  // the neck with its three folds, the head
  S.pipe([[0, 0.7, 0], [0, 0.75, 0.005], [0, 0.78, 0.01]], [0.075, 0.07, 0.064], { seg: 2, n: 8 });
  const hy = 0.86, hc = [0, hy, 0.012], yaw = o(0.1);
  sol(hc, [0.092, 0.115, 0.1], { yaw, n: full ? 14 : 8, m: full ? 8 : 5 });
  // the face: where the surface stands at (du, dv)
  const on = (du, dv, up = 0) => { const q = 1 - (du / 0.092) ** 2 - (dv / 0.115) ** 2, z = 0.1 * Math.sqrt(Math.max(0.02, q)) + up; return [hc[0] + du * Math.cos(yaw) + z * Math.sin(yaw), hc[1] + dv, hc[2] - du * Math.sin(yaw) + z * Math.cos(yaw)]; };
  if (full) {
    for (const q of [-1, 1]) {
      S.pipe([on(q * 0.012, 0.047, 0.004), on(q * 0.04, 0.056, 0.004), on(q * 0.07, 0.042, 0.002)], [0.0065, 0.0055, 0.004], { seg: 2, n: 5, cap: 1 });   // the brow's arch
      sol(on(q * 0.037, 0.022, 0.002), [0.018, 0.0065, 0.009], { yaw: -q * 0.1, n: 8, m: 3 });                                                       // the lid, eye downcast
      sol([hc[0] + q * 0.0925 * Math.cos(yaw), hy - 0.012, hc[2] - q * 0.0925 * Math.sin(yaw)], [0.01, 0.036, 0.016], { n: 7, m: 4 });               // the ear
      S.pipe([[q * 0.098, hy - 0.04, 0.008], [q * 0.104, hy - 0.08, 0.012]], [0.012, 0.008], { seg: 1, n: 5, cap: 1 });                              // its long lobe
    }
    sol(on(0, -0.008, 0.002), [0.0135, 0.034, 0.02], { n: 8, m: 4 });                                                                              // the nose
    sol(on(0, -0.038, 0.002), [0.02, 0.0085, 0.011], { n: 8, m: 3 });                                                                              // the nostrils' wings
    sol(on(0, -0.056, 0.003), [0.027, 0.0085, 0.0115], { n: 10, m: 3 });                                                                           // the upper lip
    sol(on(0, -0.07, 0.003), [0.024, 0.0075, 0.0105], { n: 10, m: 3 });                                                                            // the lower lip
    sol(on(0, -0.093, 0.0), [0.022, 0.016, 0.012], { n: 8, m: 3 });                                                                                // the chin
    sol(on(0, 0.03, 0.004), [0.005, 0.005, 0.005], { n: 6, m: 3 });                                                                                // the urna
  } else {
    sol(on(0, -0.01, 0.002), [0.014, 0.034, 0.02], { n: 6, m: 3 });
    sol(on(0, -0.065, 0.003), [0.025, 0.012, 0.011], { n: 7, m: 3 });
    for (const q of [-1, 1]) sol(on(q * 0.037, 0.022, 0.002), [0.018, 0.007, 0.009], { n: 6, m: 2 });
  }
  // the ushnisha, the hair in curls over the skull, the jewel
  sol([0, hy + 0.1, -0.002], [0.065, 0.058, 0.066], { yaw, n: full ? 10 : 7, m: 4 });
  sol([0, hy + 0.158, -0.002], [0.012, 0.016, 0.012], { n: 6, m: 3 });
  if (full) {
    // curls: small snail-shells on the head and the ushnisha above the hairline, rows by height
    const rows = [[0.18, 11], [0.36, 10], [0.54, 8], [0.72, 6], [0.9, 3]];
    for (const [t, cnt] of rows) for (let k = 0; k < cnt; k++) {
      const el = 0.55 + t * 0.95, az = ((k + 0.5) / cnt - 0.5) * (Math.PI * (1.28 - 0.5 * t)) + Math.sin(k * 5.3 + h * 9 + t * 4) * 0.04 + yaw;
      const c = [Math.sin(az) * Math.cos(el) * 0.1, hy + Math.sin(el) * 0.118 * (1 + (t > 0.85 ? 0.45 : 0)), 0.012 + Math.cos(az) * Math.cos(el) * 0.104];
      S.solid(c, [0.015, 0.011, 0.015], { n: 5, m: 2, yaw: az });
    }
  }
  const g = S.geometry();
  g.userData = {};
  return [g, ...geos];
}
