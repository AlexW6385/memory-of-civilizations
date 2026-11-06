// Greek sculpture as geometry: figures in the round and in relief, for the pediments, the metopes,
// the friezes, the maidens of the Erechtheion and the bronzes (docs/settlements/athens.md §4a).
//
// Figures in the round are built from a pose (the joints of a body, in units of its height, facing
// +z, the viewer's right at +x, the feet at y = 0): a tapered limb between every two joints, a head,
// the drapery of the type the figure wears (the peplos falling in deep folds to the feet, the
// mantle over the legs of a seated or reclining figure, the short chiton of a warrior), and the
// attributes (helmet, shield, spear, trident, axe). Horses and centaurs likewise. Reliefs (the
// Ionic frieze) are built in profile: convex pieces (ellipses and capsules) raised a few
// centimetres from the ground, layered as the real relief is, the far legs flattest.
// A figure is never mirrored by a matrix (that turns the faces inside out): its pose is mirrored.

import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { lathe, box, fromTriangles } from '../../core/geom.js';
import { merge } from './columns.js';

const UP = new Vector3(0, 1, 0);
const fold = (k, a) => (a ? (th) => 1 + a * Math.cos(th * k) : null);

/** A tapered limb from a to b (rounded at both ends), n sides; mod: folds round it. */
export function limb(a, b, r0, r1, n = 6, mod = null) {
  const A = new Vector3(...a), B = new Vector3(...b), d = B.clone().sub(A), L = d.length() || 1e-4;
  const g = lathe([[0.001, -r0 * 0.5], [r0, 0], [r1, L], [0.001, L + r1 * 0.5]], n, mod);
  g.applyMatrix4(new Matrix4().compose(A, new Quaternion().setFromUnitVectors(UP, d.normalize()), new Vector3(1, 1, 1)));
  return g;
}
/** An ellipsoid at c with radius r stretched by s. */
export function blob(c, r, s = [1, 1, 1], n = 8) {
  const rows = n > 6 ? 5 : 4, p = [];
  for (let i = 0; i <= rows; i++) { const t = i / rows * Math.PI; p.push([Math.max(0.001, Math.sin(t) * r), -Math.cos(t) * r]); }
  const g = lathe(p, n);
  g.applyMatrix4(new Matrix4().makeScale(...s).setPosition(...c));
  return g;
}

// ── poses: joints in units of the figure's height ─────────────────────────────────────────────
const P = {
  stand: { pelvis: [0, 0.52, 0], neck: [0, 0.83, 0], head: [0, 0.915, 0.005], shL: [-0.115, 0.81, 0], shR: [0.115, 0.81, 0], hipL: [-0.055, 0.5, 0], hipR: [0.055, 0.5, 0],
    knL: [-0.06, 0.28, 0.01], knR: [0.06, 0.28, 0.01], ftL: [-0.07, 0.035, 0.0], ftR: [0.07, 0.035, 0.0], elL: [-0.145, 0.63, -0.01], elR: [0.145, 0.63, -0.01], haL: [-0.155, 0.47, 0.03], haR: [0.155, 0.47, 0.03] },
  // the weight on the left leg, the right knee forward and bent (the maidens, the gods at ease)
  ease: { pelvis: [0.01, 0.515, 0], neck: [0, 0.83, 0], head: [0, 0.915, 0.01], shL: [-0.115, 0.805, 0], shR: [0.115, 0.815, 0], hipL: [-0.05, 0.505, 0], hipR: [0.06, 0.49, 0.01],
    knL: [-0.055, 0.28, 0.0], knR: [0.075, 0.27, 0.07], ftL: [-0.07, 0.035, 0.0], ftR: [0.1, 0.035, -0.03], elL: [-0.15, 0.625, 0.0], elR: [0.15, 0.63, 0.02], haL: [-0.16, 0.47, 0.05], haR: [0.13, 0.58, 0.16] },
  // striding to the right (+x), the front arm forward, the back arm raised to strike
  stride: { pelvis: [0, 0.47, 0], neck: [0.07, 0.77, 0], head: [0.09, 0.855, 0.01], shL: [-0.04, 0.76, -0.03], shR: [0.15, 0.77, 0.03], hipL: [-0.045, 0.46, -0.02], hipR: [0.045, 0.47, 0.02],
    knL: [-0.15, 0.25, -0.02], knR: [0.2, 0.27, 0.03], ftL: [-0.31, 0.035, -0.02], ftR: [0.29, 0.035, 0.03], elL: [-0.1, 0.92, -0.02], elR: [0.26, 0.69, 0.06], haL: [0.0, 1.03, -0.01], haR: [0.33, 0.76, 0.09] },
  // seated on a block, hands in the lap
  seat: { pelvis: [0, 0.3, -0.02], neck: [0, 0.6, -0.04], head: [0, 0.685, -0.03], shL: [-0.115, 0.585, -0.04], shR: [0.115, 0.585, -0.04], hipL: [-0.06, 0.3, 0], hipR: [0.06, 0.3, 0],
    knL: [-0.075, 0.3, 0.22], knR: [0.075, 0.31, 0.22], ftL: [-0.085, 0.035, 0.25], ftR: [0.085, 0.035, 0.26], elL: [-0.16, 0.42, 0.0], elR: [0.16, 0.42, 0.0], haL: [-0.1, 0.33, 0.15], haR: [0.11, 0.34, 0.16] },
  // reclining toward the left on the left elbow, the legs out to the right (the corner figures)
  recline: { pelvis: [0.02, 0.13, 0], neck: [-0.24, 0.36, 0], head: [-0.27, 0.445, 0.02], shL: [-0.33, 0.3, -0.03], shR: [-0.14, 0.38, 0.03], hipL: [-0.01, 0.11, -0.05], hipR: [0.04, 0.14, 0.05],
    knL: [0.24, 0.09, -0.04], knR: [0.25, 0.22, 0.07], ftL: [0.48, 0.03, -0.03], ftR: [0.45, 0.035, 0.1], elL: [-0.37, 0.1, -0.02], elR: [-0.05, 0.27, 0.07], haL: [-0.3, 0.035, 0.02], haR: [0.08, 0.21, 0.1] },
  // fallen, propped on one arm (the beaten giant, the Lapith under the centaur)
  fallen: { pelvis: [0.04, 0.1, 0], neck: [-0.28, 0.24, 0], head: [-0.37, 0.29, 0.02], shL: [-0.34, 0.2, -0.04], shR: [-0.2, 0.27, 0.04], hipL: [0.01, 0.09, -0.05], hipR: [0.07, 0.11, 0.05],
    knL: [0.27, 0.07, -0.04], knR: [0.2, 0.3, 0.06], ftL: [0.5, 0.03, -0.03], ftR: [0.38, 0.03, 0.07], elL: [-0.4, 0.09, -0.01], elR: [-0.14, 0.42, 0.08], haL: [-0.36, 0.03, 0.02], haR: [-0.25, 0.52, 0.1] },
};
// the drapery each pose wears by default
const rot = (pt, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [pt[0] * c - pt[1] * s, pt[0] * s + pt[1] * c, pt[2]]; };

/** The joints of a pose, mirrored (left for right) when asked, with arm overrides { r: [elbow, hand], l: [...] }. */
function joints(o) {
  const J = {};
  const src = P[o.pose ?? 'stand'];
  for (const k in src) J[k] = src[k].slice();
  if (o.arms?.r) { J.elR = o.arms.r[0].slice(); J.haR = o.arms.r[1].slice(); }
  if (o.arms?.l) { J.elL = o.arms.l[0].slice(); J.haL = o.arms.l[1].slice(); }
  if (o.lean) for (const k of ['neck', 'head', 'shL', 'shR', 'elL', 'elR', 'haL', 'haR']) J[k] = rot([J[k][0] - J.pelvis[0], J[k][1] - J.pelvis[1], J[k][2]], -o.lean).map((v, i) => v + (i < 2 ? J.pelvis[i] : 0));
  if (o.mirror) {
    const M = {};
    for (const k in J) { const m = k.endsWith('L') ? k.slice(0, -1) + 'R' : k.endsWith('R') ? k.slice(0, -1) + 'L' : k; M[m] = [-J[k][0], J[k][1], J[k][2]]; }
    return M;
  }
  return J;
}

/**
 * A human figure in the round: { pose, h, drape ('peplos' | 'mantle' | 'chiton' | 'nude'), mirror, arms, lean,
 * helmet, shield ('l' | 'r'), spear ('l' | 'r'), hair ('rope': the maidens' braid), capital (a basket-capital on the head),
 * upper (only the body above the waist: rising or sinking), n (sides of a limb) }.
 * Returns { stone: [geometries], metal: [geometries] } at the origin, in metres.
 */
export function human(o) {
  const H = o.h ?? 1.8, n = o.n ?? 6, J = joints(o), S = (p) => [p[0] * H, p[1] * H, p[2] * H], j = {};
  for (const k in J) j[k] = S(J[k]);
  const g = [], metal = [], skin = o.skin ? [] : null, r = (v) => v * H, pose = o.pose ?? 'stand';
  const flesh = skin ?? g;                                          // head, neck, forearms, hands, feet: ivory on a chryselephantine statue
  const drape = o.drape ?? 'nude', upper = !!o.upper;
  const mid = (a, b, t = 0.5) => a.map((v, i) => v + (b[i] - v) * t);
  // torso: the belly and the chest, the shoulders and the hips as bars (they turn with the pose)
  const chest = mid(j.pelvis, j.neck, 0.68);
  g.push(limb(j.pelvis, chest, r(0.075), r(0.088), n), limb(chest, j.neck, r(0.088), r(0.05), n));
  g.push(limb(j.shL, j.shR, r(0.048), r(0.048), n));
  g.push(blob(mid(chest, j.neck, 0.15), r(0.075), [1.35, 0.9, 0.8], n));
  if (!upper) g.push(limb(j.hipL, j.hipR, r(0.07), r(0.07), n));
  // head and neck
  flesh.push(limb(j.neck, mid(j.neck, j.head, 0.6), r(0.034), r(0.031), n));
  flesh.push(blob(j.head, r(0.058), [0.86, 1.08, 0.98], n + 2));
  if (o.hair === 'rope') g.push(limb([j.head[0], j.head[1] - r(0.02), j.head[2] - r(0.05)], [j.neck[0], j.neck[1] - r(0.12), j.neck[2] - r(0.07)], r(0.03), r(0.022), 5));
  else g.push(blob([j.head[0], j.head[1] + r(0.018), j.head[2] - r(0.012)], r(0.057), [0.92, 0.82, 1.0], n + 2));
  if (o.helmet) {
    g.push(blob([j.head[0], j.head[1] + r(0.022), j.head[2] - r(0.005)], r(0.064), [0.95, 0.85, 1.05], n + 2));
    g.push(limb([j.head[0], j.head[1] + r(0.07), j.head[2] - r(0.06)], [j.head[0], j.head[1] + r(0.1), j.head[2] + r(0.04)], r(0.012), r(0.01), 4));
  }
  // arms and hands (the upper arm in its sleeve when the figure is draped)
  const dressed = drape !== 'nude';
  for (const s of ['L', 'R']) {
    const sh = j['sh' + s], el = j['el' + s], ha = j['ha' + s];
    g.push(limb(sh, el, r(dressed ? 0.046 : 0.04), r(dressed ? 0.036 : 0.031), n, dressed ? fold(5, 0.08) : null)); flesh.push(limb(el, ha, r(0.03), r(0.022), n));
    flesh.push(blob(ha, r(0.024), [1, 1.25, 0.8], 5));
  }
  // the legs: bare, or in the cloth that falls over them; the long peplos hides them but for the feet
  const longDress = (drape === 'peplos' || drape === 'mantle') && (pose === 'stand' || pose === 'ease');
  const clothLegs = !longDress && (drape === 'peplos' || drape === 'mantle');
  if (!upper) for (const s of ['L', 'R']) {
    const hip = j['hip' + s], kn = j['kn' + s], ft = j['ft' + s];
    if (clothLegs) g.push(limb(hip, kn, r(0.07), r(0.052), n + 1, fold(7, 0.1)), limb(kn, [ft[0], ft[1] + r(0.01), ft[2]], r(0.048), r(0.06), n + 1, fold(9, 0.12)));
    else if (!longDress) g.push(limb(hip, kn, r(0.058), r(0.04), n), limb(kn, ft, r(0.039), r(0.026), n));
    flesh.push(limb(ft, [ft[0], ft[1] - r(0.015), ft[2] + r(0.075)], r(0.024), r(0.018), 5));
  }
  // drapery
  const waist = mid(j.pelvis, chest, 0.35);
  if (longDress) {
    // the peplos (or the long mantle): from the waist to the feet in deep vertical folds, the overfold to the hips
    const cx = (j.ftL[0] + j.ftR[0]) / 2, cz = (j.ftL[2] + j.ftR[2]) / 2, k = drape === 'peplos' ? 18 : 11;
    const sk = lathe([[r(0.14), 0], [r(0.138), r(0.05)], [r(0.118), r(0.3)], [r(0.1), waist[1] - r(0.02)], [r(0.085), waist[1]], [0.001, waist[1] + r(0.01)]], n * 3, fold(k, 0.075));
    sk.applyMatrix4(new Matrix4().makeScale(1, 1, 0.78).setPosition(cx, 0, cz));
    g.push(sk);
    if (drape === 'peplos') {
      const ap = lathe([[r(0.112), 0], [r(0.106), r(0.12)], [r(0.092), r(0.2)], [0.001, r(0.205)]], n * 2, fold(12, 0.05));
      ap.applyMatrix4(new Matrix4().makeScale(1.1, 1, 0.8).setPosition(waist[0], waist[1] - r(0.14), waist[2]));
      g.push(ap);
    }
  } else if (clothLegs && !upper) {
    // the cloth gathered over the lap, between the thighs
    g.push(limb(mid(j.hipL, j.knL, 0.6), mid(j.hipR, j.knR, 0.6), r(0.05), r(0.05), n, fold(4, 0.15)));
    if (pose === 'seat') g.push(limb(mid(j.knL, j.knR), [(j.ftL[0] + j.ftR[0]) / 2, r(0.04), (j.ftL[2] + j.ftR[2]) / 2 - r(0.03)], r(0.06), r(0.09), n + 2, fold(7, 0.12)));
  } else if (drape === 'chiton' && !upper) {
    const sk = lathe([[r(0.13), 0], [r(0.11), r(0.12)], [r(0.09), r(0.2)], [0.001, r(0.205)]], n * 2, fold(14, 0.06));
    sk.applyMatrix4(new Matrix4().makeScale(1.1, 1, 0.85).setPosition(j.pelvis[0], j.pelvis[1] - r(0.11), j.pelvis[2]));
    g.push(sk);
  }
  if (dressed) {
    // the garment over the body: a shell round the belly and the breast in folds, its edge across the breast
    g.push(limb(mid(j.pelvis, chest, 0.1), mid(chest, j.neck, 0.35), r(0.086), r(0.094), n + 3, fold(13, 0.05)));
    if (drape !== 'chiton') g.push(limb(j.shL, mid(j.pelvis, j.hipR), r(0.032), r(0.042), n, fold(5, 0.1)));
  }
  if (pose === 'seat' && !o.noSeat) g.push(box(r(-0.14), 0, r(-0.17), r(0.14), r(0.26), r(0.06)), box(r(-0.155), r(0.26), r(-0.18), r(0.155), r(0.285), r(0.07)));
  // attributes
  // (the hands are named as in the unmirrored pose)
  const side = (k) => ((k === 'r') !== !!o.mirror ? 'R' : 'L');
  if (o.shield) { const ha = j['ha' + side(o.shield)], el = j['el' + side(o.shield)]; const c = mid(el, ha, 0.5); const sh = lathe([[0.001, -r(0.03)], [r(0.21), -r(0.012)], [r(0.22), r(0.01)], [0.001, r(0.035)]], 14); sh.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2).setPosition(c[0], c[1], c[2] + r(0.05))); (o.metalShield ? metal : g).push(sh); }
  if (o.spear) { const ha = j['ha' + side(o.spear)], d = (o.spearDir ?? [0.12, 1, 0]).slice(); if (o.mirror) d[0] = -d[0]; const L = Math.hypot(...d); metal.push(limb([ha[0] - d[0] / L * r(0.55), ha[1] - d[1] / L * r(0.55), ha[2]], [ha[0] + d[0] / L * r(0.6), ha[1] + d[1] / L * r(0.6), ha[2]], r(0.009), r(0.006), 4)); }
  return { stone: g, metal, skin: skin ?? [] };
}

/** Rearing: the body turned up about the hind hooves. */
function rearUp(x, y) { const a = 0.5, hx = -0.4, c = Math.cos(a), s = Math.sin(a), dx = x - hx; return [hx + dx * c - y * s, dx * s + y * c]; }
/**
 * A horse: { pose ('stand' | 'rear' | 'gallop' | 'head'), h (height at the withers), mirror (facing −x) } facing +x.
 * 'head': only the neck and head rising from the floor (the horses of the Sun and the Moon).
 */
export function horse(o) {
  const k = (o.h ?? 1.5) / 1.5, n = o.n ?? 6, sg = o.mirror ? -1 : 1, pose = o.pose ?? 'stand';
  const T = (p) => {
    let [x, y, z] = p;
    if (pose === 'rear') [x, y] = rearUp(x, y);
    return [sg * x * k, y * k, z * k];
  };
  const L = (a, b, r0, r1) => limb(T(a), T(b), r0 * k, r1 * k, n);
  const g = [];
  if (pose === 'head') {
    g.push(L([0.0, 0.0, 0], [0.18, 0.62, 0], 0.2, 0.13), L([0.18, 0.62, 0], [0.44, 0.42, 0], 0.12, 0.07));
    for (const z of [-0.06, 0.06]) g.push(L([0.15, 0.68, z], [0.12, 0.8, z], 0.035, 0.01));
    g.push(blob(T([0.08, 0.5, 0]), 0.09 * k, [1.2, 1, 0.5], 5));                     // the mane
    return { stone: g, metal: [] };
  }
  g.push(blob(T([0, 1.12, 0]), 0.5 * k, [1.05, 0.52, 0.48], n + 2));                  // the barrel
  g.push(L([0.4, 1.25, 0], [0.62, 1.6, 0], 0.2, 0.12), L([0.62, 1.6, 0], [0.8, 1.32, 0], 0.11, 0.065));
  for (const z of [-0.05, 0.05]) g.push(L([0.6, 1.66, z], [0.57, 1.76, z], 0.03, 0.01));
  g.push(L([0.42, 1.38, 0], [0.62, 1.66, 0], 0.05, 0.04));                              // the mane
  g.push(L([-0.5, 1.22, 0], [-0.66, 0.72, 0], 0.07, 0.04));                            // the tail
  const legs = pose === 'rear'
    ? [[[0.35, 1.0, 0.13], [0.55, 0.85, 0.13], [0.48, 0.62, 0.13]], [[0.35, 1.0, -0.13], [0.6, 0.95, -0.13], [0.58, 0.7, -0.13]], [[-0.36, 1.0, 0.13], [-0.46, 0.5, 0.13], [-0.4, 0.03, 0.13]], [[-0.36, 1.0, -0.13], [-0.3, 0.5, -0.13], [-0.36, 0.03, -0.13]]]
    : pose === 'gallop'
      ? [[[0.35, 1.0, 0.13], [0.62, 0.66, 0.13], [0.72, 0.35, 0.13]], [[0.35, 1.0, -0.13], [0.5, 0.55, -0.13], [0.4, 0.25, -0.13]], [[-0.36, 1.0, 0.13], [-0.55, 0.55, 0.13], [-0.8, 0.3, 0.13]], [[-0.36, 1.0, -0.13], [-0.4, 0.5, -0.13], [-0.5, 0.12, -0.13]]]
      : [[[0.35, 1.0, 0.13], [0.37, 0.5, 0.13], [0.36, 0.03, 0.13]], [[0.35, 1.0, -0.13], [0.39, 0.5, -0.13], [0.4, 0.03, -0.13]], [[-0.36, 1.0, 0.13], [-0.44, 0.5, 0.13], [-0.38, 0.03, 0.13]], [[-0.36, 1.0, -0.13], [-0.4, 0.5, -0.13], [-0.36, 0.03, -0.13]]];
  for (const [a, b, c] of legs) g.push(L(a, b, 0.085, 0.05), L(b, c, 0.05, 0.035));
  return { stone: g, metal: [] };
}

/** A centaur: a horse's body and a man's torso, arms raised (a rock overhead), facing +x. */
export function centaur(o) {
  const pose = o.pose ?? 'rear', hs = horse({ ...o, pose }).stone, k = (o.h ?? 1.5) / 1.5, sg = o.mirror ? -1 : 1;
  const body = [hs[0], ...hs.slice(6)];                                    // the barrel, the tail and the legs: no neck
  let [bx, by] = [0.4, 1.3];
  if (pose === 'rear') [bx, by] = rearUp(bx, by);
  const H = 1.7 * k, base = [bx * sg * k, by * k, 0];
  const man = human({ pose: 'stand', h: H, upper: true, mirror: o.mirror, lean: (pose === 'rear' ? -12 : 5) * sg, arms: { l: [[-0.12, 0.95, 0], [-0.03, 1.08, 0.02]], r: [[0.14, 0.97, 0.02], [0.05, 1.09, 0.03]] }, n: o.n });
  const off = new Matrix4().makeTranslation(base[0], base[1] - 0.52 * H, 0);
  for (const g of man.stone) g.applyMatrix4(off);
  const rock = blob([base[0], base[1] + 0.6 * H, 0.03 * H], 0.15 * k, [1.25, 0.8, 1], 6);
  return { stone: [...body, ...man.stone, rock], metal: [] };
}

/** Place the pieces of a figure: { x, y, z, yaw } — merged, one geometry per material. */
export function placed(fig, x, y, z, yaw = 0) {
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z), out = {};
  for (const key of ['stone', 'metal', 'leaf']) { if (!fig[key]?.length) continue; const g = merge(fig[key]); g.applyMatrix4(m); out[key] = g; }
  return out;
}

// ── relief in profile ────────────────────────────────────────────────────────────────────────
/** A convex outline (points [u, v], counter-clockwise) raised to depth d from the ground: the face and the sides (no back). */
function prism(pts, d, back = false) {
  const t = [], n = pts.length;
  for (let i = 1; i < n - 1; i++) t.push(pts[0][0], pts[0][1], d, pts[i][0], pts[i][1], d, pts[i + 1][0], pts[i + 1][1], d);
  if (back) for (let i = 1; i < n - 1; i++) t.push(pts[0][0], pts[0][1], 0, pts[i + 1][0], pts[i + 1][1], 0, pts[i][0], pts[i][1], 0);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    t.push(a[0], a[1], 0, b[0], b[1], 0, b[0], b[1], d, a[0], a[1], 0, b[0], b[1], d, a[0], a[1], d);
  }
  return fromTriangles(t);
}
const ell = (cx, cy, rx, ry, k = 10) => Array.from({ length: k }, (_, i) => { const a = i / k * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
function cap(a, b, r0, r1, k = 4) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-4, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, out = [];
  for (let i = 0; i <= k; i++) { const t = -Math.PI / 2 + i / k * Math.PI; out.push([b[0] + (ux * Math.cos(t) + nx * Math.sin(t)) * r1, b[1] + (uy * Math.cos(t) + ny * Math.sin(t)) * r1]); }
  for (let i = 0; i <= k; i++) { const t = Math.PI / 2 + i / k * Math.PI; out.push([a[0] + (ux * Math.cos(t) + nx * Math.sin(t)) * r0, a[1] + (uy * Math.cos(t) + ny * Math.sin(t)) * r0]); }
  return out;
}
const poly = (...p) => p;

/**
 * Relief groups of the Panathenaic frieze, in profile, moving toward +u, the ground at v = 0, about a metre high;
 * each piece [outline, depth]. Depths are fractions of the relief's full projection.
 */
const GROUPS = {
  horseman(v = 0) {
    const lift = [0, 0.04, -0.03][v % 3], out = [];
    out.push([cap([-0.31, 0.46], [-0.37, 0.24], 0.04, 0.03), 0.35], [cap([-0.37, 0.24], [-0.33, 0.02 + lift], 0.03, 0.022), 0.35], [cap([0.3, 0.46], [0.47, 0.32], 0.04, 0.03), 0.35], [cap([0.47, 0.32], [0.45, 0.17], 0.03, 0.022), 0.35]);
    out.push([ell(0, 0.52, 0.42, 0.165, 12), 0.75]);
    out.push([cap([0.28, 0.58], [0.47, 0.84], 0.11, 0.065), 0.75], [cap([0.47, 0.86], [0.61, 0.72], 0.065, 0.038), 0.8]);
    out.push([cap([-0.3, 0.45], [-0.26, 0.22], 0.045, 0.032), 0.6], [cap([-0.26, 0.22], [-0.31, 0.02], 0.032, 0.022), 0.6], [cap([0.33, 0.45], [0.36, 0.24 + lift], 0.045, 0.03), 0.6], [cap([0.36, 0.24 + lift], [0.33, 0.02 + lift * 2], 0.03, 0.022), 0.6]);
    out.push([cap([-0.4, 0.6], [-0.52, 0.34], 0.035, 0.02), 0.55]);
    // the rider: thigh, shin, torso leaning back a little, head, the arm on the reins, the cloak flying
    out.push([cap([-0.02, 0.66], [0.13, 0.5], 0.055, 0.04), 0.95], [cap([0.13, 0.5], [0.1, 0.31], 0.038, 0.028), 0.95]);
    out.push([cap([-0.02, 0.66], [0.0, 0.89], 0.07, 0.058), 0.9], [ell(0.02, 0.965, 0.05, 0.058, 9), 0.9], [cap([0.0, 0.86], [0.17, 0.76], 0.028, 0.022), 1.0]);
    out.push([poly([-0.06, 0.88], [-0.2, 0.8], [-0.24, 0.7], [-0.08, 0.76]), 0.7]);
    return out;
  },
  chariot(v = 0) {
    const out = [];
    for (const dx of [0.08, 0]) {
      out.push([ell(dx + 0.05, 0.53, 0.4, 0.155, 12), dx ? 0.45 : 0.75]);
      out.push([cap([dx + 0.33, 0.6], [dx + 0.5, 0.85], 0.1, 0.06), dx ? 0.45 : 0.75], [cap([dx + 0.5, 0.87], [dx + 0.64, 0.73], 0.06, 0.035), dx ? 0.5 : 0.8]);
      out.push([cap([dx + 0.36, 0.47], [dx + 0.6, 0.38], 0.04, 0.03), 0.5], [cap([dx + 0.6, 0.38], [dx + 0.68, 0.2], 0.03, 0.02), 0.5], [cap([dx - 0.26, 0.47], [dx - 0.38, 0.25], 0.04, 0.03), 0.5], [cap([dx - 0.38, 0.25], [dx - 0.42, 0.03], 0.03, 0.02), 0.5]);
    }
    out.push([ell(-0.62, 0.24, 0.24, 0.24, 14), 0.55], [ell(-0.62, 0.24, 0.05, 0.05, 6), 0.8]);
    out.push([poly([-0.82, 0.3], [-0.42, 0.3], [-0.45, 0.52], [-0.8, 0.5]), 0.7], [cap([-0.42, 0.42], [-0.3, 0.5], 0.02, 0.02), 0.6]);
    out.push([cap([-0.64, 0.5], [-0.6, 0.86], 0.06, 0.05), 0.9], [ell(-0.59, 0.93, 0.048, 0.055, 9), 0.9], [cap([-0.6, 0.8], [-0.36, 0.72], 0.026, 0.02), 1.0]);
    if (v % 2) out.push([cap([-0.85, 0.05], [-0.85, 0.6], 0.07, 0.05), 0.85], [ell(-0.85, 0.68, 0.048, 0.055, 9), 0.85], [poly([-0.92, 0.6], [-0.78, 0.6], [-0.8, 0.85], [-0.95, 0.7]), 0.75]);
    return out;
  },
  // a man in a mantle walking (the elders, the marshals, the bearers of trays)
  walker(v = 0) {
    const out = [], bend = [0, 0.03, -0.02][v % 3];
    out.push([poly([-0.11, 0.03], [0.12, 0.03], [0.13, 0.42], [0.1, 0.74], [-0.09, 0.78], [-0.13, 0.4]), 0.85]);
    out.push([cap([-0.08, 0.03], [-0.12, 0.25], 0.035, 0.04), 0.6], [cap([0.09, 0.03], [0.14, 0.2], 0.03, 0.035), 0.95]);
    out.push([ell(0.02 + bend, 0.86, 0.05, 0.058, 9), 0.9], [cap([0.0, 0.79], [0.03 + bend, 0.84], 0.03, 0.028), 0.9]);
    out.push([cap([0.06, 0.72], [0.18, 0.6 + (v % 2) * 0.12], 0.035, 0.025), 1.0]);
    if (v % 3 === 1) out.push([poly([0.12, 0.66], [0.28, 0.68], [0.28, 0.71], [0.12, 0.7]), 1.0]);   // a tray
    if (v % 3 === 2) out.push([ell(-0.02, 0.98, 0.1, 0.05, 8), 0.85]);                                 // a hydria on the shoulder
    return out;
  },
  // a maiden in a peplos with a jug or a basket (the east frieze)
  maiden(v = 0) {
    const out = [];
    out.push([poly([-0.1, 0.02], [0.11, 0.02], [0.1, 0.45], [0.08, 0.72], [-0.08, 0.74], [-0.1, 0.45]), 0.85]);
    for (let i = 0; i < 4; i++) out.push([poly([-0.08 + i * 0.05, 0.03], [-0.06 + i * 0.05, 0.03], [-0.065 + i * 0.05, 0.6], [-0.075 + i * 0.05, 0.6]), 0.95]);   // the folds
    out.push([ell(0.01, 0.82, 0.048, 0.057, 9), 0.9], [cap([0, 0.74], [0.01, 0.79], 0.028, 0.026), 0.9]);
    out.push([cap([0.06, 0.68], [0.13, 0.5], 0.03, 0.022), 1.0]);
    out.push([v % 2 ? ell(0.17, 0.48, 0.06, 0.08, 8) : poly([0.13, 0.45], [0.24, 0.45], [0.22, 0.52], [0.15, 0.52]), 1.0]);
    return out;
  },
  // a winged Victory (the parapet of the Nike bastion), her wings spread behind her
  nike(v = 0) {
    const out = [[poly([-0.04, 0.6], [-0.12, 0.52], [-0.36, 0.86], [-0.32, 0.95]), 0.4], [poly([0.0, 0.62], [-0.06, 0.56], [-0.24, 0.94], [-0.2, 1.0]), 0.55]];
    return out.concat(GROUPS.maiden(v));
  },
  // a heifer led to the sacrifice, a youth beside her
  heifer(v = 0) {
    const out = [];
    out.push([cap([-0.25, 0.38], [-0.28, 0.02], 0.04, 0.025), 0.4], [cap([0.25, 0.38], [0.28, 0.02], 0.04, 0.025), 0.4]);
    out.push([ell(0, 0.45, 0.38, 0.15, 12), 0.75], [cap([0.3, 0.48], [0.5, 0.4 + (v % 2) * 0.14], 0.1, 0.06), 0.75]);
    out.push([cap([-0.22, 0.38], [-0.2, 0.02], 0.045, 0.028), 0.65], [cap([0.22, 0.38], [0.24, 0.02], 0.045, 0.028), 0.65], [cap([-0.37, 0.48], [-0.42, 0.18], 0.025, 0.015), 0.6]);
    for (const p of GROUPS.walker(0)) out.push([p[0].map(([u, w]) => [u - 0.05, w]), Math.min(1, p[1] + 0.05)]);
    return out;
  },
  // a god seated on a stool (the east frieze)
  god(v = 0) {
    const out = [];
    out.push([poly([-0.16, 0.0], [0.14, 0.0], [0.14, 0.4], [-0.16, 0.4]), 0.45]);
    out.push([cap([-0.06, 0.45], [0.2, 0.43], 0.09, 0.075), 0.85], [cap([0.2, 0.43], [0.24, 0.04], 0.065, 0.05), 0.85]);
    out.push([cap([-0.06, 0.45], [-0.04, 0.78], 0.09, 0.07), 0.85], [ell(-0.02, 0.87, 0.055, 0.063, 9), 0.9], [cap([-0.04, 0.74], [0.12, 0.6], 0.032, 0.025), 1.0]);
    if (v % 2) out.push([cap([-0.12, 0.7], [-0.2, 0.95], 0.025, 0.02), 0.9]);
    return out;
  },
};
// the battles of the Hephaisteion's friezes (Theseus and the Pallantids; Lapiths and centaurs): a warrior lunging
// forward behind his round shield, the spear raised; his foe facing him; a centaur rearing with a rock
GROUPS.fighter = (v = 0) => {
  const out = [], k = [0, 0.03, -0.03][v % 3];
  out.push([cap([-0.02, 0.45], [-0.2, 0.22], 0.05, 0.035), 0.55], [cap([-0.2, 0.22], [-0.3, 0.02], 0.035, 0.025), 0.55]);
  out.push([cap([0.04, 0.45], [0.2, 0.28 + k], 0.05, 0.035), 0.85], [cap([0.2, 0.28 + k], [0.22, 0.02], 0.035, 0.025), 0.85]);
  out.push([cap([0.0, 0.45], [0.07, 0.76], 0.08, 0.065), 0.85], [ell(0.1, 0.84, 0.05, 0.058, 9), 0.9], [poly([0.06, 0.88], [0.12, 0.92], [0.02, 0.97], [-0.04, 0.9]), 0.8]);
  out.push([cap([0.04, 0.74], [-0.1, 0.86], 0.03, 0.025), 0.7], [cap([-0.32, 0.9], [0.36, 1.0], 0.012, 0.01), 0.75]);
  if (v % 2 === 0) out.push([poly([-0.02, 0.76], [-0.18, 0.62], [-0.22, 0.48], [-0.06, 0.6]), 0.5]);
  out.push([ell(0.2, 0.6, 0.13, 0.14, 12), 1.0]);
  return out;
};
GROUPS.foe = (v = 0) => GROUPS.fighter(v + 1).map(([pts, f]) => [pts.map(([a, b]) => [-a, b]).reverse(), f]);
GROUPS.centaurR = (v = 0) => {
  const out = [];
  out.push([cap([-0.28, 0.42], [-0.34, 0.02], 0.04, 0.025), 0.4], [cap([0.2, 0.44], [0.4, 0.3], 0.04, 0.03), 0.45], [cap([0.4, 0.3], [0.38, 0.1], 0.03, 0.02), 0.45]);
  out.push([ell(0, 0.48, 0.34, 0.14, 12), 0.75], [cap([-0.3, 0.5], [-0.46, 0.3], 0.03, 0.015), 0.6]);
  out.push([cap([-0.22, 0.4], [-0.26, 0.02], 0.045, 0.028), 0.65], [cap([0.24, 0.46], [0.46, 0.4 + (v % 2) * 0.1], 0.045, 0.03), 0.65]);
  out.push([cap([0.26, 0.54], [0.32, 0.86], 0.075, 0.06), 0.9], [ell(0.34, 0.94, 0.05, 0.058, 9), 0.9]);
  out.push([cap([0.3, 0.84], [0.42, 1.02], 0.03, 0.025), 1.0], [cap([0.3, 0.84], [0.18, 1.0], 0.03, 0.025), 1.0], [ell(0.31, 1.08, 0.12, 0.08, 9), 1.0]);
  return out;
};
export const RELIEF_KINDS = Object.keys(GROUPS);

/** One relief group as a geometry, in a plane: u along `u`, v up, out along `o` (unit 3-vectors), origin p, size s, depth d, facing −u when flipped. */
export function relief(kind, v, { p, u, o, s = 1, d = 0.056, flip = false }) {
  return profile(GROUPS[kind](v), { p, u, o, s, d, flip });
}
/** Pieces [outline, depth fraction] in profile (u, v), raised d from a plane and set into it (see relief). */
export function profile(parts, { p, u, o, s = 1, d = 0.056, flip = false }) {
  const geoms = parts.map(([pts, f]) => {
    let q = pts.map(([a, b]) => [a * s, b * s]);
    if (flip) q = q.map(([a, b]) => [-a, b]).reverse();
    return prism(q, d * f);
  });
  return toPlane(merge(geoms), p, u, o);
}
/** A geometry built in (u, v, depth) into a wall's plane: u along `u`, v up, depth along `o`, origin p. */
export function toPlane(g, p, u, o) {
  const m = new Matrix4().set(u[0], 0, o[0], p[0], u[1], 1, o[1], p[1], u[2], 0, o[2], p[2], 0, 0, 0, 1);
  // the basis is right-handed only when u × up = o; otherwise the winding is turned back
  if (-u[2] * o[0] + u[0] * o[2] < 0) {
    for (const name of ['position', 'normal']) {
      const a = g.attributes[name].array;
      for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { const t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; }
    }
  }
  g.applyMatrix4(m);
  return g;
}
export { prism, ell, cap, poly };
