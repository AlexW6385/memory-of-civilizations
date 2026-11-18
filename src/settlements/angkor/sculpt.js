// Modelled sculpture for Angkor Wat (docs/settlements/angkor.md §29): volumes with smooth normals, not stacked flat
// plates — the devatas of the walls (a torso, limbs, a head with brow, nose and lips, the three-pointed crown, the
// pleated sampot, necklaces, the flower in the hand), the pullers of the Churning relief, the seven-headed hoods of
// the naga. Every builder returns geometries (non-indexed, position + normal) in a local frame and is deterministic:
// what differs from one copy to the next comes from `hash` of the copy's own place or index, never from a counter
// or a random generator, so the same plan builds the same geometry every time (the light bake depends on it).

import { tube, slathe, merge } from '../../objects/kit.js';
import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

/** A hash of numbers in [0, 1): the same numbers, the same value. */
export function hash(a, b = 0, c = 0) { const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return v - Math.floor(v); }

const T = (g, M) => g.applyMatrix4(M);
const sc = (g, x, y, z) => T(g, new Matrix4().makeScale(x, y, z));
/** An ellipsoid at (cx, cy, cz) with half-axes (rx, ry, rz); n round, m rows. */
export function ell(cx, cy, cz, rx, ry, rz, n = 8, m = 5) {
  const g = slathe(Array.from({ length: m }, (_, i) => { const t = i / (m - 1) * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), n);
  return sc(g, rx, ry, rz).translate(cx, cy, cz);
}
/** A turned piece (profile [[r, y]]) squashed to (kx, kz) across and moved to (cx, cy, cz). */
const turn = (prof, n, kx, kz, cx = 0, cy = 0, cz = 0, mod = null) => sc(slathe(prof, n, mod), kx, 1, kz).translate(cx, cy, cz);
const rotX = (g, a) => T(g, new Matrix4().makeRotationX(a));
const rotY = (g, a) => T(g, new Matrix4().makeRotationY(a));
const rotZ = (g, a) => T(g, new Matrix4().makeRotationZ(a));
const lerp = (a, b, t) => a + (b - a) * t;
const prof = (rows, y) => { for (let i = 0; i + 1 < rows.length; i++) if (y <= rows[i + 1][0]) return lerp(rows[i][1], rows[i + 1][1], (y - rows[i][0]) / (rows[i + 1][0] - rows[i][0])); return rows[rows.length - 1][1]; };

// ── the devata ───────────────────────────────────────────────────────────────────────────────────────────────────
// The wall's face is z = 0, the figure stands on y = 0 at x = 0, frontal, 1.1 m to the tip of her crown; her back is
// let into the wall, the breast stands 9 cm out. `q` 1 = full (about 1,300 triangles), 0 = reduced (about 330).
const TORSO_W = [[0.4, 0.098], [0.47, 0.082], [0.54, 0.066], [0.62, 0.082], [0.7, 0.105], [0.745, 0.034]];
const TORSO_D = [[0.4, 0.05], [0.47, 0.046], [0.54, 0.04], [0.62, 0.048], [0.7, 0.042], [0.745, 0.032]];
const SKIRT = [[0.1, 0.15], [0.18, 0.145], [0.28, 0.13], [0.38, 0.12], [0.46, 0.108], [0.5, 0.105]];
const onTorso = (x, y, off = 0.006) => { const w = prof(TORSO_W, y), d = prof(TORSO_D, y), r = Math.min(0.97, Math.abs(x) / w); return Math.sqrt(1 - r * r) * d + off; };
/** A garland on the breast from (x0, y0) hanging to y1 at the middle: a tube along the torso's own surface. */
function garland(x0, y0, y1, r, n, k = 7) {
  const pts = [];
  for (let i = 0; i < k; i++) { const t = i / (k - 1), x = lerp(-x0, x0, t), y = y0 - (y0 - y1) * (1 - Math.pow(2 * t - 1, 2)); pts.push([x, y, onTorso(x, y, r * 0.9 + (y < 0.68 && y > 0.58 ? 0.03 : 0)), r]); }
  return tube(pts, n);
}

export function devataParts(q = 1) {
  const G = [], nl = q ? 6 : 4;
  // the torso, the breasts, the neck
  G.push(tube(TORSO_W.map(([y, w], i) => [0, y, 0, w, TORSO_D[i][1]]).filter((_, i) => q || i % 2 === 0 || i === 5), q ? 9 : 6));
  if (q) for (const sg of [-1, 1]) G.push(ell(sg * 0.043, 0.625, 0.05, 0.037, 0.034, 0.03, 6, 4));
  G.push(tube([[0, 0.735, 0, 0.026], [0, 0.79, 0.008, 0.023]], nl));
  // the head: skull, hair, brow, eyes, nose, lips, the long-lobed ears with their earrings
  G.push(ell(0, 0.83, 0.012, 0.058, 0.07, 0.062, q ? 10 : 6, q ? 7 : 3));
  if (q) G.push(ell(0, 0.866, 0.0, 0.061, 0.058, 0.066, 8, 5));
  G.push(tube([[0, 0.832, 0.064, 0.01, 0.008], [0, 0.814, 0.086, 0.012, 0.011]], 5));
  if (q) {
    G.push(tube([[-0.042, 0.852, 0.052, 0.006], [0, 0.858, 0.069, 0.006], [0.042, 0.852, 0.052, 0.006]], 4));
    for (const sg of [-1, 1]) {
      G.push(ell(sg * 0.024, 0.838, 0.064, 0.013, 0.006, 0.005, 5, 3));
      G.push(ell(sg * 0.065, 0.815, 0.005, 0.008, 0.035, 0.014, 5, 3), ell(sg * 0.069, 0.768, 0.006, 0.011, 0.014, 0.006, 5, 3));
    }
    G.push(ell(0, 0.788, 0.072, 0.017, 0.009, 0.006, 6, 3));
  }
  // the three-pointed crown: a diadem, the tiered central point, the two side points
  G.push(turn([[0.062, 0.885], [0.069, 0.9], [0.067, 0.915], [0.06, 0.925]], q ? 9 : 6, 1, 1, 0, 0, 0.012));
  G.push(turn(q ? [[0.058, 0.92], [0.046, 0.96], [0.05, 0.965], [0.036, 0.995], [0.04, 1.0], [0.024, 1.03], [0.026, 1.035], [0.001, 1.1]] : [[0.058, 0.92], [0.04, 0.98], [0.001, 1.1]], q ? 8 : 5, 1, 0.85, 0, 0, 0.012));
  for (const sg of [-1, 1]) {
    G.push(tube([[sg * 0.045, 0.92, 0.014, 0.014, 0.007], [sg * 0.075, 0.975, 0.014, 0.017, 0.008], [sg * 0.088, 1.03, 0.014, 0.001]], 4));
    if (q) G.push(tube([[sg * 0.062, 0.915, 0.016, 0.01, 0.006], [sg * 0.098, 0.95, 0.016, 0.001]], 4));
  }
  // the arms: the one raised, the hand holding a lotus flower at the shoulder; the other down, the hand on the sash
  const arm = (pts, k) => tube(pts, k);
  G.push(arm(q ? [[0.112, 0.71, 0.0, 0.021], [0.158, 0.645, 0.014, 0.02], [0.2, 0.588, 0.02, 0.0215], [0.205, 0.628, 0.04, 0.016], [0.178, 0.675, 0.056, 0.0145], [0.174, 0.682, 0.057, 0.0185]] : [[0.112, 0.71, 0.0, 0.021], [0.2, 0.588, 0.02, 0.02], [0.176, 0.68, 0.056, 0.016]], q ? 6 : 4));
  G.push(arm(q ? [[-0.112, 0.71, 0.0, 0.021], [-0.152, 0.635, 0.012, 0.02], [-0.168, 0.555, 0.02, 0.0215], [-0.15, 0.51, 0.04, 0.016], [-0.124, 0.472, 0.052, 0.0145]] : [[-0.112, 0.71, 0.0, 0.021], [-0.168, 0.555, 0.02, 0.02], [-0.124, 0.472, 0.052, 0.016]], q ? 6 : 4));
  if (q) {
    G.push(ell(0.17, 0.69, 0.058, 0.017, 0.02, 0.012, 5, 3), ell(-0.116, 0.46, 0.054, 0.016, 0.02, 0.012, 5, 3));
    G.push(tube([[0.175, 0.7, 0.06, 0.004], [0.2, 0.822, 0.06, 0.004]], 3));
    G.push(turn([[0.001, 0.0], [0.018, 0.003], [0.033, 0.02], [0.026, 0.044], [0.011, 0.04], [0.001, 0.036]], 8, 1, 1, 0.2, 0.82, 0.06, (th) => 1 + 0.25 * Math.cos(th * 4)));
  } else G.push(turn([[0.001, 0.0], [0.03, 0.02], [0.02, 0.042], [0.001, 0.036]], 6, 1, 1, 0.2, 0.82, 0.06));
  // the necklaces, the girdle with its jewel, the sash, the pleated sampot and its fishtail
  G.push(garland(0.082, 0.722, 0.686, 0.0075, 4, q ? 6 : 4));
  if (q) {
    G.push(garland(0.088, 0.715, 0.655, 0.0065, 4, 6), ell(0, 0.636, onTorso(0, 0.636, 0.012) + 0.004, 0.013, 0.017, 0.008, 5, 3));
    G.push(turn([[0.108, 0.455], [0.118, 0.465], [0.118, 0.5], [0.108, 0.51]], 9, 1, 0.46, 0, 0, 0), ell(0, 0.482, 0.058, 0.022, 0.027, 0.01, 5, 3));
    G.push(tube([[0, 0.46, 0.066, 0.011], [0.004, 0.26, 0.074, 0.011]], 4), ell(0.004, 0.235, 0.075, 0.014, 0.024, 0.009, 5, 3));
  }
  G.push(turn(SKIRT.map(([y, r]) => [r, y]), q ? 12 : 8, 1, 0.45, 0, 0, 0, (th, i) => 1 + (i > 0 ? 0.055 : 0) * Math.cos(th * 9 + 0.7) * (Math.sin(th) > -0.1 ? 1 : 0.4)));
  const FL = [[0.5, 0.036], [0.4, 0.06], [0.26, 0.085], [0.12, 0.104], [0.045, 0.116]], cols = q ? 6 : 4, fl = [];
  const fz = (y, c) => prof(SKIRT, y) * 0.45 + 0.012 + (c % 2 ? 0.011 : 0) + (0.5 - y) * 0.03;
  for (let r = 0; r + 1 < FL.length; r++) for (let c = 0; c < cols; c++) {
    const P = (rr, cc) => [lerp(-FL[rr][1], FL[rr][1], cc / cols), FL[rr][0], fz(FL[rr][0], cc)];
    const a = P(r, c), b = P(r, c + 1), d = P(r + 1, c), e = P(r + 1, c + 1);
    fl.push(...a, ...d, ...b, ...b, ...d, ...e);
  }
  G.push(flat(fl));
  for (const sg of [-1, 1]) {
    G.push(tube([[sg * 0.046, 0.125, 0.012, 0.025], [sg * 0.052, 0.04, 0.026, 0.016]], q ? 5 : 4));
    if (q) G.push(ell(sg * 0.056, 0.014, 0.04, 0.028, 0.014, 0.04, 5, 3));
  }
  return G;
}
/** Triangles (a flat list, wound facing +z) as a geometry with smooth-enough normals: flat per face. */
function flat(tris) {
  const nor = new Float32Array(tris.length);
  for (let i = 0; i < tris.length; i += 9) {
    const ax = tris[i + 3] - tris[i], ay = tris[i + 4] - tris[i + 1], az = tris[i + 5] - tris[i + 2], bx = tris[i + 6] - tris[i], by = tris[i + 7] - tris[i + 1], bz = tris[i + 8] - tris[i + 2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; } }
    for (let k = 0; k < 3; k++) { nor[i + 3 * k] = nx; nor[i + 3 * k + 1] = ny; nor[i + 3 * k + 2] = nz; }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(new Float32Array(tris), 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}
/** The devata as one geometry (role 'c' of an assembly). */
export const devataGeom = (q) => merge(devataParts(q));

// ── the naga's hood ─────────────────────────────────────────────────────────────────────────────────────────────
/** A naga's head, facing +z, about 0.3 m long at s = 1: the skull, the snout with its flared nostrils, the lower jaw, bulging eyes under a heavy brow, a crest of flames, the frills. */
export function nagaHead(cx, cy, cz, s, q = 1, yaw = 0, pitch = 0) {
  const G = [], e = (...a) => G.push(ell(...a));
  e(0, 0, 0, 0.13, 0.1, 0.14, 7, 4); e(0, -0.03, 0.2, 0.075, 0.05, 0.12, 6, 4);
  e(0, -0.088, 0.17, 0.062, 0.024, 0.11, 5, 3);
  for (const sg of [-1, 1]) {
    e(sg * 0.036, -0.012, 0.31, 0.022, 0.018, 0.02, 4, 3);
    e(sg * 0.076, 0.045, 0.11, 0.03, 0.028, 0.028, 5, 3);
    G.push(tube([[sg * 0.11, 0.078, 0.05, 0.014], [sg * 0.03, 0.082, 0.17, 0.011]], 3));
    if (q) { e(sg * 0.14, 0.0, -0.02, 0.02, 0.07, 0.06, 5, 3); G.push(tube([[sg * 0.05, -0.06, 0.28, 0.009], [sg * 0.05, -0.115, 0.285, 0.001]], 3)); }
  }
  G.push(tube([[0, 0.085, 0.0, 0.03, 0.022], [0, 0.15, -0.03, 0.02, 0.015], [0, 0.17, -0.04, 0.001]], 4));
  if (q) for (const sg of [-1, 1]) G.push(tube([[sg * 0.06, 0.08, -0.02, 0.02, 0.015], [sg * 0.09, 0.12, -0.04, 0.001]], 3));
  const g = merge(G);
  T(g, new Matrix4().makeRotationFromEuler({ x: pitch, y: yaw, z: 0, order: 'YXZ', isEuler: true }));
  return sc(g, s, s, s).translate(cx, cy, cz);
}
/**
 * The hood: a scalloped fan standing across x, y (facing +z) with `heads` hooded heads on rays round its upper edge,
 * the middle one the largest. Origin at the centre of the fan's foot (the neck), R the radius of the heads' ring.
 */
export function nagaFan(R = 0.8, heads = 7, q = 1, flatten = 1) {
  const G = [], hub = [0, R * 0.95];
  // the fan: a lens-shaped plate round the hub, its rim scalloped in as many lobes as there are heads
  const lobes = heads, plate = turn([[0.001, 0.09], [0.55, 0.085], [0.93, 0.045], [1, 0.0], [0.93, -0.045], [0.55, -0.075], [0.001, -0.08]], 2 * lobes, 1, 1, 0, 0, 0, (th, i, r) => (i === 0 || i === 6 ? 1 : 1 + 0.12 * Math.cos((th - Math.PI / 2) * lobes / 2)));
  G.push(sc(rotX(plate, Math.PI / 2), R * 1.3, R * 1.3, 1).translate(hub[0], hub[1], -0.1));
  // the ribs from the neck up the fan to each head
  for (let k = 0; k < heads; k++) {
    const a = Math.PI * (0.13 + 0.74 * k / (heads - 1)), mid = Math.abs(k - (heads - 1) / 2) < 0.6, rr = (mid ? 1.1 : 1) * R * 1.3;
    const hx = Math.cos(a) * rr, hy = hub[1] + Math.sin(a) * rr * (mid ? 1.05 : 0.96);
    G.push(tube([[0, hub[1] - R * 0.5, -0.02, 0.05, 0.03], [hx * 0.5, hub[1] + (hy - hub[1]) * 0.5 - R * 0.12, 0.03, 0.055, 0.04], [hx, hy, 0.02, 0.06, 0.04]], q ? 5 : 4));
    G.push(nagaHead(hx, hy, 0.06, mid ? 1.9 : 1.5, mid ? q : 0, Math.cos(a) * -0.28, 0.12 - Math.sin(a) * 0.1));
  }
  // the lappets hanging from the plate's rim between the heads
  if (q) for (let k = 0; k < heads - 1; k++) { const a = Math.PI * (0.13 + 0.74 * (k + 0.5) / (heads - 1)); G.push(tube([[Math.cos(a) * R * 1.3, hub[1] + Math.sin(a) * R * 1.3, -0.02, 0.05, 0.02], [Math.cos(a) * R * 1.5, hub[1] + Math.sin(a) * R * 1.45 + 0.05, -0.03, 0.001]], 3)); }
  const g = merge(G);
  return flatten === 1 ? g : sc(g, 1, 1, flatten);
}
/**
 * A hood on the end of a balustrade, in the frame of the rail's end: the body bends up from the rail (running along −z
 * toward it) off a moulded pedestal into an upright neck that opens into the fan, which faces +z, away from the rail.
 * `h` the rail's height, so that its body's top is at h − 0.12. Returns { c, s } geometries (carved stone, plain stone).
 */
export function nagaHood(h, heads = 7) {
  const yb = h - 0.12, bend = 0.6, d0 = -0.3, pts = [], S = [], C = [];
  for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; pts.push([0, yb + (1 - Math.cos(a)) * bend, d0 + Math.sin(a) * bend, 0.27 - i * 0.004]); }
  pts.push([0, yb + bend + 0.7, d0 + bend, 0.25]);
  S.push(tube(pts, 12));
  const R = Math.max(0.6, h * 0.8) * 0.95, top = yb + bend + 0.7;
  C.push(T(nagaFan(R, heads, 1), new Matrix4().makeTranslation(0, top - R * 0.4, d0 + bend + 0.1)));
  return { c: merge(C), s: merge(S) };
}

// ── the pullers of the Churning ──────────────────────────────────────────────────────────────────────────────────
// A figure in the relief's frame (u along the panel, v up, w out of the wall), facing `d` (±1), feet at v = 0, hands
// at the rope at v = vr, rounded (the depth is 70 % of the width: the back is let into the 4 cm slab, the body stands
// 6 cm out). `kind`: 'asura' (helmeted, a beard) or 'deva' (the crown); `i` an index for the hash that gives each its own
// head, lean and grip.
const HEADS = {
  asura: [
    (x, y, d) => [turn([[0.052, 0], [0.058, 0.018], [0.046, 0.05], [0.02, 0.07], [0.001, 0.075]], 5, 1, 1, x, y + 0.03, 0)],                 // a round cap
    (x, y, d) => [turn([[0.06, 0], [0.062, 0.015], [0.04, 0.045], [0.026, 0.085], [0.001, 0.12]], 6, 1, 1, x, y + 0.03, 0)],                  // a tall pointed helmet
    (x, y, d) => [turn([[0.056, 0], [0.066, 0.012], [0.066, 0.03], [0.04, 0.062], [0.001, 0.07]], 6, 1, 1, x, y + 0.03, 0), ell(x - 0.05 * d, y + 0.06, 0, 0.014, 0.03, 0.014, 5, 3), ell(x + 0.05 * d, y + 0.075, 0, 0.014, 0.03, 0.014, 5, 3)],   // a brimmed helmet with two horns
  ],
  deva: [
    (x, y, d) => [turn([[0.045, 0], [0.04, 0.03], [0.044, 0.034], [0.03, 0.065], [0.033, 0.069], [0.017, 0.098], [0.001, 0.14]], 6, 1, 1, x, y + 0.03, 0)],     // a tiered crown
    (x, y, d) => [turn([[0.048, 0], [0.036, 0.04], [0.04, 0.044], [0.001, 0.115]], 6, 1, 1, x, y + 0.03, 0)],
    (x, y, d) => [turn([[0.05, 0], [0.042, 0.03], [0.045, 0.034], [0.034, 0.06], [0.036, 0.064], [0.024, 0.09], [0.026, 0.094], [0.001, 0.13]], 6, 1, 1, x, y + 0.03, 0)],
  ],
};
/**
 * @param {number} d facing (+1 toward +u)
 * @param {number} vr height of the rope above the feet (m)
 */
export function puller(kind, d, vr, i, k = 1) {
  const h1 = hash(i, 1), h2 = hash(i, 2), h3 = hash(i, 3);
  const lean = 0.85 + h1 * 0.35, X = (u) => u * d * k, Y = (v) => v * k;
  const G = [], hipx = -0.05 * lean, hipy = 0.3, shx = -0.15 * lean, shy = 0.6;
  const L = (u, v, w, r) => [X(u), Y(v), w * k, r * k * 1.2];
  // the legs: the front bent forward, the rear straight and braced; the thigh full, the calf rounded
  const stride = 0.9 + h2 * 0.3;
  G.push(tube([L(hipx + 0.02, hipy, 0, 0.05), L(0.1 * stride, 0.15, 0, 0.038), L(0.11 * stride, 0.015, 0, 0.024)], 4));
  G.push(tube([L(hipx - 0.02, hipy, 0, 0.05), L(-0.1 * stride, 0.16, 0, 0.036), L(-0.16 * stride, 0.015, 0, 0.022)], 4));
  // the loincloth, the torso leaning back, the neck
  G.push(tube([L(hipx, hipy + 0.02, 0, 0.065), L((hipx + shx) / 2 - 0.01, (hipy + shy) / 2, 0, 0.07), L(shx, shy, 0, 0.075), L(shx - 0.02 * lean, shy + 0.04, 0, 0.032)], 5));
  const hx = shx - 0.045 * lean, hy = shy + 0.1;
  // the head: skull, nose, brow, the headdress of its kind; the beard of the asuras
  G.push(ell(X(hx), Y(hy), 0, 0.045 * k, 0.052 * k, 0.045 * k, 6, 4));
  G.push(ell(X(hx + 0.046), Y(hy - 0.008), 0, 0.016 * k, 0.014 * k, 0.012 * k, 4, 3));
  if (kind === 'asura') G.push(ell(X(hx + 0.022), Y(hy - 0.05), 0, 0.02 * k, 0.026 * k, 0.026 * k, 4, 3));
  const v = Math.min(2, Math.floor(hash(i, 5) * 3));
  for (const g of HEADS[kind][v](X(hx), Y(hy) + 0.02 * k, d)) G.push(g);
  // the arms: shoulder, elbow, the hands over the rope
  const gv = vr - 0.005 + (h3 - 0.5) * 0.04;
  G.push(tube([L(shx + 0.01, shy - 0.02, 0.0, 0.032), L(0.0, shy - 0.07 + (h2 - 0.5) * 0.03, 0.01, 0.027), L(0.1, gv, 0.03, 0.02)], 4));
  G.push(tube([L(shx + 0.03, shy - 0.04, 0.0, 0.03), L(0.03, shy - 0.1, 0.01, 0.026), L(0.17, gv, 0.03, 0.02)], 4));
  const g = merge(G);
  return sc(g, 1, 1, 0.7).translate(0, 0, 0.022);        // depth 70 %, the back let into the slab
}
/** The long serpent: a thick scaled rope along the panel from u0 to u1 at height v, bellying and rising between the hands. */
export function serpentRope(u0, u1, v, r = 0.085, step = 0.2) {
  const pts = [], n = Math.max(2, Math.round((u1 - u0) / step));
  // (the bands of the scales: the radius swells and eases from one ring to the next)
  for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, k = i % 2 ? 0.92 : 1; pts.push([u, v + Math.sin(u * 2.3) * 0.018, 0.012, r * 0.62 * k, r * k]); }
  return tube(pts, 8);
}
