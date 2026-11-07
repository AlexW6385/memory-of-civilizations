// The trees of the Swahili coast (docs/settlements/kilwa.md §15) and the ivory of its trade: the coconut palm,
// its slender ringed trunk curving up from a swollen foot, the crown of long arching pinnate fronds, the
// dead fronds hanging, the bunches of nuts under the crown; the baobab, its huge swollen trunk of smooth grey
// bark and its short thick branches, leafless in the dry season with the velvety fruits hanging on stalks;
// tusks of ivory stacked for shipping.

import { lathe, fromTriangles } from '../../core/geom.js';
import { Quaternion, Vector3, Matrix4 } from '../../core/three.js';
import { beamTris } from '../ming/index.js';

const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** coconut_palm: { at, y, h, lean (metres of lean at the crown), dir (radians), seed }. */
export function coconutPalm(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = rnd(el.seed ?? 3), h = el.h ?? 14, lean = el.lean ?? 1.5, dir = el.dir ?? r() * Math.PI * 2;
  const dx = Math.cos(dir), dz = Math.sin(dir), off = (t) => lean * t * t;           // the trunk curving out, steeper at the foot
  const n = Math.round(h / 0.5), rows = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, rad = (i === 0 ? 0.32 : 0.2 - 0.05 * t + 0.14 * Math.exp(-t * 18)) + (i % 2 ? 0.008 : 0);    // the bole, the rings of leaf scars
    rows.push([rad, t * h, off(t)]);
  }
  const N = 9, T = [];
  for (let i = 0; i < n; i++) for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, [r0, y0, o0] = rows[i], [r1, y1, o1] = rows[i + 1];
    const P = (rr, yy, o, a) => [x + dx * o + Math.cos(a) * rr, y + yy, z + dz * o + Math.sin(a) * rr];
    T.push(...P(r0, y0, o0, a0), ...P(r1, y1, o1, a1), ...P(r0, y0, o0, a1), ...P(r0, y0, o0, a0), ...P(r1, y1, o1, a0), ...P(r1, y1, o1, a1));
  }
  bag.add('palm_trunk', fromTriangles(T));
  const top = [x + dx * lean, y + h, z + dz * lean];
  const live = [], dead = [], nf = 20;
  for (let f = 0; f < nf; f++) {
    const az = f * 2.39996 + r() * 0.3, age = f / nf, isDead = age > 0.88;
    const up = isDead ? -1.35 : 0.85 - age * 1.4 + r() * 0.15, len = (isDead ? 3.2 : 4.6) + r() * 1.0, K = 10;
    const pts = [];
    for (let k = 0; k <= K; k++) { const d = k / K * len, yy = Math.sin(up) * d - (isDead ? 0.04 : 0.62) * d * d / len; pts.push([top[0] + Math.cos(az) * Math.cos(up) * d, top[1] + yy, top[2] + Math.sin(az) * Math.cos(up) * d]); }
    const sx = -Math.sin(az), sz = Math.cos(az), out = isDead ? dead : live;
    for (let k = 0; k < K; k++) { const p = pts[k], q = pts[k + 1]; out.push(p[0] + sx * 0.03, p[1], p[2] + sz * 0.03, q[0], q[1], q[2], p[0] - sx * 0.03, p[1], p[2] - sz * 0.03); }
    // the leaflets, long and hanging from both sides of the rachis (the coconut's droop, not the date's stiff V)
    const nl = isDead ? 6 : 13;
    for (let l = 1; l < nl; l++) {
      const t = l / nl, kf = t * K, k0 = Math.min(K - 1, Math.floor(kf)), fr = kf - k0;
      const p = [0, 1, 2].map((c) => pts[k0][c] * (1 - fr) + pts[k0 + 1][c] * fr), q = pts[Math.min(K, k0 + 1)];
      const fx = q[0] - p[0], fy = q[1] - p[1], fz = q[2] - p[2], fl = Math.hypot(fx, fy, fz) || 1, ll = (0.5 + 0.55 * Math.sin(Math.PI * t)) * (isDead ? 0.6 : 1);
      for (const side of [-1, 1]) {
        const tip = [p[0] + side * sx * ll * 0.75 + fx / fl * ll * 0.45, p[1] - ll * (isDead ? 0.6 : 0.45), p[2] + side * sz * ll * 0.75 + fz / fl * ll * 0.45];
        const b2 = [p[0] + fx / fl * 0.12, p[1] + fy / fl * 0.12, p[2] + fz / fl * 0.12];
        out.push(...p, ...b2, ...tip, ...p, ...tip, ...b2);          // both sides of the blade
      }
    }
  }
  bag.add('palm_leaf', fromTriangles(live));
  bag.add('thatch_palm', fromTriangles(dead));
  // the bunches of nuts under the crown, green and brown
  const nb = 2 + Math.floor(r() * 3);
  for (let b = 0; b < nb; b++) {
    const a = b / nb * Math.PI * 2 + r();
    for (let k = 0; k < 6; k++) { const aa = a + (k - 2.5) * 0.25, rr = 0.32 + (k % 2) * 0.1; bag.add(k % 3 ? 'doum_leaf' : 'hide_brown', lathe([[0.001, 0], [0.11, 0.05], [0.13, 0.15], [0.09, 0.25], [0.001, 0.28]], 7, null, top[0] + Math.cos(aa) * rr, top[1] - 0.55 - (k % 2) * 0.22, top[2] + Math.sin(aa) * rr)); }
  }
  col.circle(x, z, 0.35, y, y + 3);
}

/** baobab: { at, y, h, r (the trunk's radius at its widest), seed } — leafless in the dry season. */
export function baobab(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rd = rnd(el.seed ?? 5), h = el.h ?? 10, R = el.r ?? 2.4;
  // the trunk: flared at the foot, swollen, narrowing to the crown, its surface folded in shallow buttress ribs
  const prof = [[R * 1.12, -0.4], [R * 1.1, 0], [R * 1.0, h * 0.15], [R * 0.95, h * 0.35], [R * 0.82, h * 0.52], [R * 0.6, h * 0.62], [R * 0.4, h * 0.66], [0.001, h * 0.68]];
  const ph = rd() * 6;
  bag.add('bark_grey', lathe(prof, 20, (th, i) => 1 + (i < 6 ? 0.07 * Math.sin(th * 7 + ph) + 0.04 * Math.sin(th * 3 + ph * 2) : 0), x, y, z));
  // the branches: short and thick from the crown, forking once or twice, held out and up
  const fruits = [], q4 = new Quaternion(), m4 = new Matrix4(), UP = new Vector3(0, 1, 0);
  // a tapering round limb from p to q (a lathe along y turned onto the limb), a knuckle at its root
  const tube = (p, q, ra, rb) => {
    const d = new Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]), L = d.length();
    const g = lathe([[ra * 1.15, -ra * 0.3], [ra, 0], [rb, L], [0.001, L + rb * 0.6]], 7);
    q4.setFromUnitVectors(UP, d.normalize()); m4.compose(new Vector3(...p), q4, new Vector3(1, 1, 1));
    bag.add('bark_grey', g.applyMatrix4(m4));
  };
  const limb = (p, ang, el2, len, w, depth) => {
    const q = [p[0] + Math.cos(ang) * Math.cos(el2) * len, p[1] + Math.sin(el2) * len, p[2] + Math.sin(ang) * Math.cos(el2) * len];
    tube(p, q, w, w * 0.62);
    if (depth > 0) for (let k = 0; k < 2 + (rd() < 0.5 ? 1 : 0); k++) limb(q, ang + (rd() - 0.5) * 1.6, Math.max(0.05, Math.min(1.1, el2 + (rd() - 0.4) * 0.7)), len * 0.62, w * 0.58, depth - 1);
    else if (rd() < 0.6) fruits.push([q[0], q[1] - 0.05, q[2]]);
  };
  const nb = 6 + Math.floor(rd() * 3), top = [x, y + h * 0.6, z];
  for (let k = 0; k < nb; k++) { const a = k / nb * Math.PI * 2 + rd() * 0.4, rr = R * 0.42; limb([top[0] + Math.cos(a) * rr, top[1] - 0.2, top[2] + Math.sin(a) * rr], a, 0.25 + rd() * 0.45, h * 0.2, R * 0.2, 3); }
  // the fruits hanging on their long stalks
  for (const [fx, fy, fz] of fruits) { bag.add('hide_tan', lathe([[0.001, 0], [0.07, 0.04], [0.08, 0.16], [0.05, 0.26], [0.001, 0.28]], 7, null, fx, fy - 0.28, fz)); const st = []; beamTris(st, [fx, fy, fz], [fx + 0.01, fy, fz + 0.01], 0.006, 0.35); bag.add('rope_fibre', fromTriangles(st)); }
  col.circle(x, z, R, y, y + h * 0.6);
}

/** tusks: { at, y, rot, n } — elephant tusks laid in a stack for loading, butts one way, tips curving up. */
export function tusks(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, n = el.n ?? 6, c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const row = k < 4 ? 0 : 1, o = (k % 4 - 1.5) * 0.2 + row * 0.1, L = 1.5 + (k * 37 % 5) * 0.12, T = [], S = 8;
    const P = (t) => { const u = -L / 2 + L * t, lift = 0.09 + row * 0.16 + 0.35 * t * t; return [x + c * u - s * o, y + lift, z + s * u + c * o]; };
    for (let i = 0; i < S; i++) { const a = P(i / S), b = P((i + 1) / S), w = 0.07 * (1 - 0.8 * i / S); beamTris(T, [a[0], a[1] - w, a[2]], [b[0], b[1] - w, b[2]], w, w * 2); }
    bag.add('ivory', fromTriangles(T));
  }
}
