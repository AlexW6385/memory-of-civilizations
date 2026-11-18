// A dragon in bold relief (docs/settlements/qing-beijing.md §37), for the imperial ramps: a thick body with a ridge and overlapping scales,
// four legs with the five-clawed foot, flames along the thighs, the head with brow, bulging eye, horns, open jaws with teeth and a
// tongue, nose, whiskers and mane; the tail ending in a tuft. Built in the plane of the stone (x, y along it, z out of it).
// reduced: the whole sculpture without the scales; fine: the scales laid over the body, the teeth, the claws' nails and the finer
// hair, to be drawn over the reduced one when the visitor is near (they lie on it: nothing is coplanar).
import { tube, curve, ell, cone, spline, resample, reliefBody, reliefLine, frame, fell, fcurve, fcone, add, sub, norm, mul, h01, pearl } from './sculpt.js';

const Z = [0, 0, 1];
const n2 = (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
/** The head, built in a frame at `o` looking along f (unit, in the plane), scale s (a head of s = 1 is 0.5 m from the nape to the nose). */
function head(out, o, f, s, h, fine, lite = false) {
  const up = [-f[1], f[0], 0], F = frame([o[0], o[1], 0], [f[0], f[1], 0], up, Z, s);
  const k = h / s;                                              // the height of the relief in the head's own units
  const c3 = (q) => [q[0], q[1], q[2] * k];
  const E = (c, r, n = 7, m = 4) => out.push(fell(F, c3(c), [r[0], r[1], r[2] * k], n, m));
  const cv = (pts, r0, r1, o) => out.push(fcurve(F, pts.map(c3), r0, r1, o)), cn = (bb, t, r, n) => out.push(fcone(F, c3(bb), c3(t), r, n));
  E([0, 0, 0.5], [0.55, 0.42, 0.7]);                              // the skull
  E([0.95, 0.04, 0.4], [0.62, 0.3, 0.6]);                         // the upper jaw and the snout
  E([1.5, 0.08, 0.4], [0.25, 0.22, 0.6], 8, 5);                   // the nose bulb
  E([1.15, 0.28, 0.45], [0.38, 0.14, 0.5]);                       // the upper lip's roll, the cheek over the teeth
  for (const sy of [-1, 1]) E([1.62, 0.06 + sy * 0.1, 0.5], [0.07, 0.06, 0.2], 6, 4);          // the nostrils
  E([0.35, -0.5, 0.3], [0.5, 0.17, 0.45], 8, 4);                  // the lower jaw (open: hanging down from the skull's hinge)
  E([0.75, -0.62, 0.3], [0.3, 0.1, 0.35], 7, 4);
  cv([[0.4, -0.38, 0.35], [0.9, -0.42, 0.3], [1.3, -0.4, 0.3]], 0.1, 0.05, { n: 5, up: Z });      // the tongue
  E([0.45, 0.4, 0.78], [0.2, 0.2, 0.28], 8, 5);                   // the eye, bulging
  cv([[0.15, 0.55, 0.65], [0.5, 0.68, 0.82], [0.85, 0.55, 0.7]], 0.12, 0.08, { n: 6, up: Z, swell: 0.2 });     // the brow's ridge
  E([-0.05, 0.12, 0.85], [0.22, 0.2, 0.18]);                      // the forehead's boss
  // the horns: two, swept back and branching; the ears
  for (const [a, b, c] of [[[-0.05, 0.38, 0.6], [-0.7, 0.9, 0.7], [-1.45, 1.05, 0.5]], [[0.0, 0.3, 0.55], [-0.5, 0.2, 0.7], [-1.2, 0.1, 0.45]]]) cv([a, b, c], 0.1, 0.02, { n: 6, up: Z, per: 4 });
  cv([[-0.7, 0.9, 0.7], [-0.95, 1.4, 0.6]], 0.05, 0.015, { n: 5, up: Z });
  E([-0.25, -0.2, 0.55], [0.2, 0.3, 0.12], 6, 4);                 // the ear
  if (lite) { for (const q of [0, 1]) cn([0.75 + q * 0.4, -0.14, 0.34], [0.77 + q * 0.4, -0.36, 0.34], 0.05, 4); return; }
  // the whiskers and the beard: long wavy curves trailing back from the lip and the chin
  for (const sy of [-1, 1]) {
    const w = []; for (let q = 0; q <= 10; q++) { const t = q / 10; w.push([1.2 - t * 2.4, sy * (0.18 + t * 0.55) + Math.sin(t * 6 + sy) * 0.1, 0.35]); }
    cv(w, 0.045, 0.012, { n: 4, up: Z, per: 1 });
  }
  for (let q = 0; q < 4; q++) cv([[-0.3 - q * 0.12, 0.35 + q * 0.12, 0.55], [-0.9 - q * 0.2, 0.55 + q * 0.2 + Math.sin(q) * 0.1, 0.5], [-1.5 - q * 0.25, 0.4 + q * 0.2, 0.4]], 0.12, 0.02, { n: 5, up: Z, per: 3 });   // the mane, in flames
  for (let q = 0; q < 3; q++) cv([[0.55 + q * 0.2, -0.75, 0.28], [0.35 + q * 0.2, -1.05 - q * 0.05, 0.25], [0.1 + q * 0.2, -1.2 - q * 0.1, 0.2]], 0.08, 0.015, { n: 5, up: Z });   // the beard under the chin
  // the teeth: fangs in both jaws
  const teeth = fine ? 5 : 2;
  for (let q = 0; q < teeth; q++) {
    const x = 0.75 + q * (fine ? 0.17 : 0.4);
    cn([x, -0.14, 0.34], [x + 0.02, -0.36 - (q === 0 ? 0.1 : 0), 0.34], 0.05, 4);
    cn([x - 0.05, -0.42, 0.3], [x, -0.24, 0.3], 0.04, 4);
  }
}
/** A foot with five claws at p, pointing along d (unit, in the plane); r the size. */
function foot(out, p, d, r, h, fine) {
  const q = [-d[1], d[0]];
  out.push(ell([p[0], p[1], 0], [r * 0.9, r * 0.75, h * 0.55], [[d[0], d[1], 0], [q[0], q[1], 0], Z], 8, 5));
  for (let k = -2; k <= 2; k++) {
    const a = k * 0.4, dir = [d[0] * Math.cos(a) - q[0] * Math.sin(a), d[1] * Math.cos(a) - q[1] * Math.sin(a)];
    const b = [p[0] + dir[0] * r * 0.75, p[1] + dir[1] * r * 0.75, h * 0.3], t = [p[0] + dir[0] * r * 2.0, p[1] + dir[1] * r * 2.0, h * 0.18], bend = [-dir[1] * r * 0.2 * Math.sign(k || 1), dir[0] * r * 0.2 * Math.sign(k || 1), 0];
    out.push(cone(b, t, r * 0.34, fine ? 6 : 5, bend));
  }
}
/**
 * The dragon along `path` (dense [x, y] points, head first), half-width w, relief height h. o: { fine, scales, flip (which side the legs'
 * knees point to), pearlAt }. Returns the list of geometries (marble) and the pearl's (gilt) in out.pearl.
 */
export function dragonRelief(path0, w, h, { fine = false, flip = 1, pearlAt = null, seed = 0, lite = false, step = 0 } = {}) {
  const out = [], gilt = [];
  const path = resample(path0, step || (fine ? 0.035 : 0.075)), n = path.length;
  const tw = (t) => w * (t < 0.05 ? 0.45 + 9 * t : 1 - 0.78 * Math.pow(Math.max(0, (t - 0.1) / 0.9), 1.1)), th = (t) => h * (0.6 + 0.4 * Math.min(1, (1 - t) * 1.6));
  if (fine) out.push(reliefBody(path, (t) => tw(t) * 1.02, (t) => th(t) * 1.02, { n: 12, scales: w * 0.5, lift: 0.004 }));
  else out.push(reliefBody(path, tw, th, { n: 8 }));
  if (fine) { /* the fine layer: the scales, nails, teeth, finer hair; the head and legs are in the reduced layer */ }
  const dirAt = (i) => n2(sub(path[Math.min(n - 1, i + 1)], path[Math.max(0, i - 1)]));
  if (!fine) {
    if (!lite) {
    // the fins along the back: flames, every few steps, leaning toward the tail
    const step = 5;
    for (let i = Math.round(n * 0.1); i < n - 3; i += step) {
      const d = dirAt(i), t = i / (n - 1), s = [-d[1] * flip, d[0] * flip], b = [path[i][0] + s[0] * tw(t) * 0.8, path[i][1] + s[1] * tw(t) * 0.8], k = 0.9 + 0.3 * h01(b[0] * 7, b[1] * 5);
      out.push(reliefLine([b, [b[0] + s[0] * w * 0.9 * k + d[0] * w * 0.4, b[1] + s[1] * w * 0.9 * k + d[1] * w * 0.4], [b[0] + s[0] * w * 1.1 * k + d[0] * w * 1.1, b[1] + s[1] * w * 1.1 * k + d[1] * w * 1.1]], w * 0.2 * (1 - t * 0.5), w * 0.02, h * 0.5, { n: 5, z0: 0 }));
    }
    }
    // the legs: the forelegs behind the head and the hind legs near the tail's root, a thigh with its flames, a shin, the foot
    for (const [ft, kneeOut, k] of [[0.2, 1, 1], [0.24, -1, -1], [0.55, 1, -1], [0.6, -1, 1]]) {
      const i = Math.round(ft * (n - 1)), d = dirAt(i), s = [-d[1] * kneeOut * flip, d[0] * kneeOut * flip], c = path[i], tt = i / (n - 1);
      const hip = [c[0] + s[0] * tw(tt) * 0.5, c[1] + s[1] * tw(tt) * 0.5], knee = [hip[0] + s[0] * w * 1.6 - d[0] * w * 0.5, hip[1] + s[1] * w * 1.6 - d[1] * w * 0.5], ankle = [knee[0] + s[0] * w * 0.5 + d[0] * w * 1.5 * k, knee[1] + s[1] * w * 0.5 + d[1] * w * 1.5 * k];
      out.push(curve([[hip[0], hip[1], 0], [knee[0], knee[1], 0]], w * 0.55, w * 0.38, { n: 8, up: Z, flat: h / (w * 0.5), swell: 0.25, per: 3 }));
      out.push(curve([[knee[0], knee[1], 0], [ankle[0], ankle[1], 0]], w * 0.38, w * 0.26, { n: 8, up: Z, flat: h / (w * 0.4), per: 3 }));
      out.push(ell([knee[0], knee[1], 0], [w * 0.4, w * 0.4, h * 0.7], [[1, 0, 0], [0, 1, 0], Z], 8, 5));
      for (let q = 0; q < 3; q++) out.push(reliefLine([knee, [knee[0] - d[0] * w * (0.6 + q * 0.4) + s[0] * w * 0.5, knee[1] - d[1] * w * (0.6 + q * 0.4) + s[1] * w * 0.5], [knee[0] - d[0] * w * (1.4 + q * 0.5) + s[0] * w * (1.0 + q * 0.3), knee[1] - d[1] * w * (1.4 + q * 0.5) + s[1] * w * (1.0 + q * 0.3)]], w * 0.14, w * 0.02, h * 0.4, { n: 5 }));   // the flames of the leg
      foot(out, ankle, n2(sub(ankle, knee)), w * 0.5, h, false);
    }
    // the tail's tuft
    if (!lite) {
    const e = path[n - 1], d = dirAt(n - 1);
    for (const a of [-0.7, 0, 0.7]) { const dd = [d[0] * Math.cos(a) - d[1] * Math.sin(a), d[0] * Math.sin(a) + d[1] * Math.cos(a)]; out.push(reliefLine([e, [e[0] + dd[0] * w * 1.2, e[1] + dd[1] * w * 1.2], [e[0] + dd[0] * w * 2.4 + dd[1] * w * 0.4 * a, e[1] + dd[1] * w * 2.4 - dd[0] * w * 0.4 * a]], w * 0.3, w * 0.03, h * 0.5, { n: 5 })); }
    }
    // the head
    const f = n2(sub(path[0], path[Math.min(3, n - 1)]));
    head(out, path[0], f, w * 2.2, h * 1.35, false, lite);
    if (pearlAt) for (const g of pearl(pearlAt[0], pearlAt[1], h * 0.9, w * 0.95, 8, seed)) gilt.push(g);
  } else {
    const f = n2(sub(path[0], path[Math.min(3, n - 1)]));
    head(out, [path[0][0], path[0][1]], f, w * 2.2, h * 1.35 * 1.03, true);
  }
  return { out, gilt };
}
