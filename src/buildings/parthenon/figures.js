// A figure kit for the standing women of the Acropolis in the peplos: the maidens of the Erechtheion, the Athena
// Parthenos, the Athena Promachos (docs/settlements/athens.md §4g). The older `human()` of the greek style stacks
// tapered tubes, which gives mannequins; here the cloth is lofted: a skirt falling in deep folds on the weight-bearing
// leg, the free leg's knee pushing forward through it under diagonal folds, the overfold (apoptygma) with its
// scalloped hem and belt, the shoulders, the bare arms, the head with a brow, nose, eyes, lips and dressed hair.
// Everything is built at height 1 (feet at y = 0, facing +z, her right at −x) and scaled by `h` at the end.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Vector3 } from '../../core/three.js';
import { box } from '../../core/geom.js';
import { limb, blob } from '../../styles/greek/sculpture.js';
import { merge } from '../../styles/greek/columns.js';

const TAU = Math.PI * 2;
const _u = new Vector3(), _v = new Vector3(), _w = new Vector3();

/** Catmull-Rom between p1 and p2 (p0, p3 the neighbours) at t. */
const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
/** Rows between the given ones, `sub` more between each pair, along a smooth curve. */
function subdivide(rows, sub) {
  if (!sub) return rows;
  const out = [];
  for (let i = 0; i < rows.length - 1; i++) {
    const p0 = rows[Math.max(0, i - 1)], p1 = rows[i], p2 = rows[i + 1], p3 = rows[Math.min(rows.length - 1, i + 2)];
    for (let k = 0; k <= sub; k++) {
      const t = k / (sub + 1), r = {};
      for (const f of ['y', 'cx', 'cz', 'rx', 'rz']) r[f] = cr(p0[f], p1[f], p2[f], p3[f], t);
      out.push(r);
    }
  }
  out.push(rows[rows.length - 1]);
  return out;
}

/**
 * A surface through elliptical sections: rows [{ y, cx, cz, rx, rz }] bottom to top (sub rows added between each pair on
 * a smooth curve), seg sides, mod(th, y, i) a radial multiplier (folds), lift(th, y) a height offset (a hem that dips).
 * Smooth normals both ways. th = 0 at +x, π/2 at +z.
 */
export function loft(rows0, seg = 32, mod = null, sub = 0, lift = null) {
  const rows = subdivide(rows0, sub);
  const ring = rows.map((r, i) => {
    const line = [];
    for (let s = 0; s <= seg; s++) {
      const th = (s / seg) * TAU, k = mod ? mod(th, r.y, i) : 1;
      line.push([r.cx + Math.cos(th) * r.rx * k, r.y + (lift ? lift(th, r.y) : 0), r.cz + Math.sin(th) * r.rz * k]);
    }
    return line;
  });
  return ringsToGeometry(ring, seg);
}

/** The surface through closed rings (arrays of seg + 1 points, the last a copy of the first), smooth normals both ways. */
export function ringsToGeometry(ring, seg) {
  const R = ring.length, N = ring.map((line, i) => line.map((p, s) => {
    const sp = s === 0 ? seg - 1 : s - 1, sn = s === seg ? 1 : s + 1, lo = ring[Math.max(0, i - 1)][s], hi = ring[Math.min(R - 1, i + 1)][s];
    _u.set(line[sn][0] - line[sp][0], line[sn][1] - line[sp][1], line[sn][2] - line[sp][2]);
    _v.set(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
    _w.crossVectors(_v, _u).normalize();
    if (!Number.isFinite(_w.x)) _w.set(0, 1, 0);
    return [_w.x, _w.y, _w.z];
  }));
  const pos = [], nor = [];
  for (let i = 0; i < R - 1; i++) {
    const A = ring[i], B = ring[i + 1], NA = N[i], NB = N[i + 1];
    for (let s = 0; s < seg; s++) {
      pos.push(...A[s], ...B[s + 1], ...A[s + 1], ...A[s], ...B[s], ...B[s + 1]);
      nor.push(...NA[s], ...NB[s + 1], ...NA[s + 1], ...NA[s], ...NB[s], ...NB[s + 1]);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/**
 * A rounded tube along a path of centres, its sections elliptical: path [[x, y, z]], radii [rx, rz] (or one number) for each
 * centre, smoothed between them on a Catmull-Rom curve (`sub` rows between each pair). rx runs along `side` (a vector, or
 * t => vector; default +x) and rz along side × tangent. mod(th, t, i) multiplies both radii (folds, muscle); the ends are
 * rounded off unless capA / capB are false. This is the limb, the neck, the horse's barrel and the fold of cloth.
 */
export function tube(path, radii, o = {}) {
  const seg = o.seg ?? 8, sub = o.sub ?? 1, n = path.length;
  const rs = radii.map((r) => (Array.isArray(r) ? r : [r, r]));
  let rows = path.map((p, i) => ({ x: p[0], y: p[1], z: p[2], rx: rs[i][0], rz: rs[i][1] }));
  if (sub) {
    const out = [];
    for (let i = 0; i < n - 1; i++) {
      const a = rows[Math.max(0, i - 1)], b = rows[i], c = rows[i + 1], d = rows[Math.min(n - 1, i + 2)];
      for (let k = 0; k <= sub; k++) { const t = k / (sub + 1), r = {}; for (const f of ['x', 'y', 'z', 'rx', 'rz']) r[f] = cr(a[f], b[f], c[f], d[f], t); out.push(r); }
    }
    out.push(rows[n - 1]); rows = out;
  }
  const m = rows.length, tan = rows.map((r, i) => { const a = rows[Math.max(0, i - 1)], b = rows[Math.min(m - 1, i + 1)]; const v = [b.x - a.x, b.y - a.y, b.z - a.z], L = Math.hypot(...v) || 1; return [v[0] / L, v[1] / L, v[2] / L]; });
  // the rounded ends
  const caps = (end) => {
    const i = end ? m - 1 : 0, r = rows[i], T = tan[i], s = end ? 1 : -1, rm = (r.rx + r.rz) / 2, out = [];
    for (const [d, k] of [[0.5, 0.8], [0.92, 0.4], [1.0, 0.001]]) out.push({ x: r.x + s * T[0] * rm * d, y: r.y + s * T[1] * rm * d, z: r.z + s * T[2] * rm * d, rx: r.rx * k, rz: r.rz * k, T });
    return out;
  };
  const head = o.capA === false ? [] : caps(false).reverse(), tail = o.capB === false ? [] : caps(true);
  const all = [...head, ...rows.map((r, i) => ({ ...r, T: tan[i], i })), ...tail];
  const ring = all.map((r, k) => {
    const sd = typeof o.side === 'function' ? o.side(k / (all.length - 1)) : (o.side ?? [1, 0, 0]);
    const T = r.T; let d = sd[0] * T[0] + sd[1] * T[1] + sd[2] * T[2], S = [sd[0] - T[0] * d, sd[1] - T[1] * d, sd[2] - T[2] * d], L = Math.hypot(...S);
    if (L < 1e-3) { const alt = Math.abs(T[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]; d = alt[0] * T[0] + alt[1] * T[1] + alt[2] * T[2]; S = [alt[0] - T[0] * d, alt[1] - T[1] * d, alt[2] - T[2] * d]; L = Math.hypot(...S); }
    S = [S[0] / L, S[1] / L, S[2] / L];
    const B = [S[1] * T[2] - S[2] * T[1], S[2] * T[0] - S[0] * T[2], S[0] * T[1] - S[1] * T[0]], t = k / (all.length - 1), line = [];
    for (let s = 0; s <= seg; s++) {
      const th = (s / seg) * TAU, f = o.mod ? o.mod(th, t, k) : 1, cx = Math.cos(th) * r.rx * f, cz = Math.sin(th) * r.rz * f;
      line.push([r.x + S[0] * cx + B[0] * cz, r.y + S[1] * cx + B[1] * cz, r.z + S[2] * cx + B[2] * cz]);
    }
    return line;
  });
  return ringsToGeometry(ring, seg);
}

/** Radial multiplier of pleats: k folds round, amplitude a (a fraction of the radius), a second harmonic for sharp ridges. */
export const pleats = (k, a, ph = 0) => (th) => 1 + a * (Math.cos(k * th + ph) + 0.3 * Math.cos(2 * k * th + 2 * ph + 0.7)) / 1.3;

const row = (y, cx, cz, rx, rz = rx) => ({ y, cx, cz, rx, rz });

/**
 * The standing woman in the peplos, height 1 (scale by h). Options:
 *  weight  'r' | 'l': the leg that carries her (the other knee is bent forward), default 'r' (her right is −x)
 *  arms    { r: [elbow, hand], l: [elbow, hand] } in units of the height (defaults: hanging, the forearms forward)
 *  hair    'rope' (the maidens: a thick braid down the back) | 'bun' (Athena under a helmet) | 'long' (waves on the shoulders)
 *  helmet  true: an Attic helmet with its cheek-pieces and a crest
 *  folds   fold count of the skirt (16), depth multiplier d (1)
 *  n       sides (a skirt side count = n * 3)
 * Returns { cloth, skin, hair, trim (belt, pins), dark (eyes), metal (helmet) } as lists of geometries.
 */
export function peplosFigure(o = {}) {
  const sw = (o.weight ?? 'r') === 'r' ? -1 : 1;                   // x of the leg that bears her weight
  const n = o.n ?? 16, K = o.folds ?? 16, D = o.d ?? 1;
  const cloth = [], skin = [], hair = [], trim = [], dark = [], metal = [];
  const L = (a, b, r0, r1, s = 6, mod = null) => limb(a, b, r0, r1, s, mod);
  // ── the skirt: the cloth falls in vertical pleats, deeper and wider toward the hem; at the front the folds are strongest;
  // over the free knee the cloth swells forward and its folds turn into diagonals that radiate from the knee
  const f = -sw, th0 = Math.PI / 2 - f * 0.42, gs = (th) => { const d = Math.atan2(Math.sin(th - th0), Math.cos(th - th0)) / 0.62; return Math.exp(-d * d); };
  const skirtMod = (th, y) => {
    const t = Math.max(0, 1 - y / 0.52), a = D * (0.05 + 0.1 * t * t + 0.03 * t) * 1.1 * (0.55 + 0.45 * Math.max(0, Math.sin(th)));
    const g = gs(th), knee = Math.exp(-(((y - 0.27) / 0.2) ** 2)), foot = Math.exp(-((y / 0.1) ** 2));
    const ph = g * 7 * (0.3 - y) * f;
    const pl = (Math.pow(Math.abs(Math.sin(0.5 * (K * th + ph))), 0.7) - 0.62) * 2.2;
    return (1 + a * pl) * (1 + 0.46 * g * knee + 0.2 * g * foot);
  };
  cloth.push(loft([
    row(0.0, -sw * 0.012, 0.0, 0.158, 0.112), row(0.02, -sw * 0.01, 0.0, 0.152, 0.108), row(0.1, -sw * 0.006, 0.004, 0.14, 0.1), row(0.22, 0, 0.008, 0.124, 0.094),
    row(0.34, 0, 0.012, 0.114, 0.09), row(0.44, 0, 0.008, 0.108, 0.086), row(0.51, 0, 0.0, 0.1, 0.08), row(0.55, 0, 0, 0.088, 0.07),
  ], K * 6, skirtMod, 2));
  // ── the torso: the waist, the cloth blousing over the belt (kolpos), the breast, the shoulders
  const bx = Math.PI / 2;
  const breast = (th) => Math.exp(-(((th - bx - 0.42) / 0.3) ** 2)) + Math.exp(-(((th - bx + 0.42) / 0.3) ** 2));
  cloth.push(loft([
    row(0.52, 0, 0, 0.092, 0.072), row(0.6, 0, 0.002, 0.09, 0.07), row(0.655, 0, 0.004, 0.098, 0.073), row(0.69, 0, 0.007, 0.108, 0.078),
    row(0.725, 0, 0.004, 0.11, 0.07), row(0.775, 0, 0, 0.125, 0.06), row(0.8, 0, 0, 0.098, 0.05), row(0.815, 0, 0.004, 0.05, 0.042),
  ], 56, (th, y) => 1 + (y > 0.66 && y < 0.78 ? 0.13 * breast(th) * Math.exp(-(((y - 0.72) / 0.045) ** 2)) : 0) + 0.018 * Math.cos(9 * th) * (y < 0.7 ? 1 : 0.2), 2));
  // the shoulders are rounded: the cloth over the arm's root, pinned (the peplos' two pins) with brooches
  for (const s of [-1, 1]) {
    cloth.push(blob([s * 0.126, 0.775, 0], 0.036, [1, 0.9, 0.9], 8));
    trim.push(blob([s * 0.108, 0.795, 0.03], 0.011, [1, 1, 0.6], 6));
  }
  // ── the overfold (apoptygma): a short second layer from under the belt to below the hip, the hem dipping to one side,
  // the cloth lying in loose folds
  cloth.push(loft([
    row(0.505, 0, 0.004, 0.128, 0.103), row(0.515, 0, 0.004, 0.123, 0.099), row(0.57, 0, 0.006, 0.117, 0.092), row(0.63, 0, 0.007, 0.111, 0.084), row(0.665, 0, 0.007, 0.106, 0.078),
  ], 66, (th, y) => 1 + D * 0.08 * (Math.cos(11 * th + 8 * y) + 0.3 * Math.cos(22 * th + 16 * y)) / 1.3 * (0.4 + 0.6 * Math.max(0, Math.sin(th))) + (y < 0.53 ? 0.025 * Math.cos(5 * th) : 0), 2,
  (th, y) => (y < 0.58 ? -0.05 * (0.5 + 0.5 * Math.cos(th - Math.PI / 2 + 0.9 * f)) * Math.max(0, (0.58 - y) / 0.075) : 0)));
  // the belt over the overfold's top, a roll
  trim.push(loft([row(0.65, 0, 0.007, 0.104, 0.08), row(0.658, 0, 0.007, 0.108, 0.084), row(0.672, 0, 0.007, 0.108, 0.084), row(0.68, 0, 0.007, 0.103, 0.079)], 40, null, 1));
  // ── neck, head
  skin.push(L([0, 0.795, 0.006], [0, 0.87, 0.012], 0.034, 0.029, 8));
  const hy = 0.918, hz = 0.012;
  skin.push(blob([0, hy, hz], 0.056, [0.84, 1.1, 1.0], 12));                                                    // the skull and face
  skin.push(blob([0, hy - 0.052, hz + 0.034], 0.026, [0.9, 0.78, 0.9], 8));                                     // the chin
  skin.push(L([0, hy + 0.004, hz + 0.052], [0, hy - 0.03, hz + 0.066], 0.011, 0.0085, 5));                       // the nose
  skin.push(blob([0, hy - 0.036, hz + 0.058], 0.0075, [1.5, 0.8, 0.8], 5));                                     // the nostrils' ball
  skin.push(L([-0.026, hy + 0.027, hz + 0.05], [0.026, hy + 0.027, hz + 0.05], 0.0065, 0.0065, 5));              // the brow, a bar across
  for (const s of [-1, 1]) {
    skin.push(blob([s * 0.025, hy + 0.012, hz + 0.0465], 0.0092, [1.15, 0.62, 0.55], 6));                       // the eyelids
    dark.push(blob([s * 0.025, hy + 0.012, hz + 0.0525], 0.0052, [1, 0.8, 0.5], 5));                            // the eyes
    skin.push(blob([s * 0.049, hy - 0.005, hz - 0.004], 0.011, [0.45, 1.1, 0.7], 5));                           // the ears
    skin.push(blob([s * 0.033, hy - 0.026, hz + 0.047], 0.015, [1, 0.8, 0.55], 5));                             // the cheeks
  }
  skin.push(blob([0, hy - 0.04, hz + 0.052], 0.0105, [1.9, 0.55, 0.6], 6));                                     // the lips
  // hair: a cap with the hair parted and waved over the brow, then the style
  const hair0 = hair;
  hair0.push(blob([0, hy + 0.012, hz - 0.012], 0.058, [0.89, 1.02, 1.04], 12));
  for (let i = -5; i <= 5; i++) {                                                                                // the waves over the forehead
    const a = i * 0.27, r = 0.05;
    hair0.push(blob([Math.sin(a) * r * 0.9, hy + 0.043 - Math.abs(i) * 0.0025, hz + Math.cos(a) * r * 0.82], 0.0145, [1.1, 0.8, 1.0], 6));
  }
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) hair0.push(blob([s * 0.047, hy + 0.012 - j * 0.014, hz + 0.0 - j * 0.004], 0.014, [0.8, 1.1, 1.0], 5));   // the locks before the ears
  if ((o.hair ?? 'long') === 'rope') {
    // the thick braid down the back of the neck to the shoulder blades, of three plaited strands (bulbs, each turned)
    for (let k = 0; k < 11; k++) {
      const t = k / 10, y = 0.875 - t * 0.27, z = -0.048 - t * 0.026, w = 0.026 - t * 0.006;
      for (const s of [-1, 0, 1]) hair0.push(blob([s * w * 0.7 + Math.sin(k * 1.6 + s) * 0.004, y - s * 0.006 * Math.sin(k), z], 0.016 - t * 0.003, [0.95, 1.25, 0.9], 5));
    }
    hair0.push(L([0, 0.62, -0.078], [0, 0.585, -0.084], 0.012, 0.01, 5));
  } else if (o.hair === 'bun') {
    hair0.push(blob([0, hy - 0.02, hz - 0.058], 0.032, [1, 1.05, 0.9], 8));                                       // the knot at the nape
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) hair0.push(blob([s * (0.044 + k * 0.004), 0.855 - k * 0.04, -0.01 - k * 0.012], 0.014, [0.8, 1.2, 0.9], 5));   // the locks on the shoulders
  } else {
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) hair0.push(blob([s * (0.046 + k * 0.005), 0.86 - k * 0.032, -0.012 - k * 0.012], 0.0145, [0.8, 1.2, 0.9], 5));
    hair0.push(blob([0, 0.85, -0.052], 0.04, [1.2, 1.5, 0.7], 7));
  }
  // ── the arms: bare, a little bent
  const A = o.arms ?? {};
  const arm = { r: A.r ?? [[-0.145, 0.62, 0.0], [-0.148, 0.5, 0.075]], l: A.l ?? [[0.145, 0.62, 0.0], [0.148, 0.5, 0.075]] };
  for (const s of ['r', 'l']) {
    const sh = [(s === 'r' ? -1 : 1) * 0.128, 0.77, 0], [el, ha] = arm[s];
    skin.push(L(sh, el, 0.031, 0.026, 7), blob(el, 0.026, [1, 1, 1], 6), L(el, ha, 0.026, 0.019, 7), blob(ha, 0.02, [0.9, 1.25, 0.7], 6));
    // the fingers: four small bars from the knuckles
    const d = new Vector3(ha[0] - el[0], ha[1] - el[1], ha[2] - el[2]).normalize();
    for (let f = -1.5; f <= 1.5; f++) skin.push(L([ha[0] + f * 0.006, ha[1], ha[2]], [ha[0] + f * 0.007 + d.x * 0.03, ha[1] + d.y * 0.03 - 0.004, ha[2] + d.z * 0.03], 0.0055, 0.0042, 4));
  }
  // ── the feet in their sandals: the free foot a little forward
  for (const [fx, fz] of [[sw * 0.062, 0.06], [-sw * 0.082, 0.155]]) {
    skin.push(L([fx, 0.02, fz - 0.03], [fx, 0.012, fz + 0.04], 0.021, 0.015, 5), blob([fx, 0.014, fz + 0.045], 0.016, [1, 0.5, 1.1], 5));
  }
  // ── the helmet: an Attic helmet over the hair, the cheek-pieces turned up, a crest on a ridge
  if (o.helmet) {
    metal.push(blob([0, hy + 0.03, hz - 0.012], 0.067, [0.93, 0.9, 1.14], 12));                                     // the bowl
    for (const s of [-1, 1]) {
      metal.push(blob([s * 0.049, hy - 0.004, hz + 0.014], 0.034, [0.26, 1.55, 1.0], 7));                              // the cheek-pieces, hinged up
      metal.push(limb([s * 0.018, hy + 0.052, hz + 0.058], [s * 0.054, hy + 0.04, hz + 0.04], 0.0085, 0.0085, 4));     // the brow-ridge
    }
    metal.push(blob([0, hy - 0.026, hz - 0.066], 0.04, [1.35, 0.7, 0.42], 7));                                       // the neck-guard, flared
    // the crest: a ridge over the bowl and a plume of overlapping lobes rising and falling to the back
    metal.push(L([0, hy + 0.088, hz + 0.036], [0, hy + 0.098, hz - 0.07], 0.012, 0.011, 5));
    for (let k = 0; k < 9; k++) { const t = k / 8; metal.push(blob([0, hy + 0.12 + Math.sin(t * 3.1) * 0.052, hz + 0.02 - t * 0.14], 0.022 - 0.003 * t, [0.35, 1.0, 1.0], 5)); }
  }
  return { cloth, skin, hair, trim, dark, metal };
}

/** Scale a figure's pieces by h and set them at (x, y, z) turned by yaw; merged per list. */
export function placeFigure(fig, h, x, y, z, yaw = 0) {
  const m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)).setPosition(x, y, z), out = {};
  for (const key of Object.keys(fig)) { if (!fig[key]?.length) continue; const g = merge(fig[key]); g.applyMatrix4(m); out[key] = g; }
  return out;
}
export { limb, blob };
