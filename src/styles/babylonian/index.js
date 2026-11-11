// Neo-Babylonian architecture (6th c. BC; docs/settlements/babylon.md §4): the Mesopotamian mud-brick
// vocabulary (src/styles/sumerian) with Nebuchadnezzar's baked brick and glazed brick — the
// Ishtar Gate's towers in blue glaze with rows of beasts, crenellated; glazed walls along the
// Processional Way; the city's double walls with towers.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import '../sumerian/index.js';
import { esagila, etemenanki, bridge, quay, quffa } from './temple.js';
import { babylonianHouses } from './house.js';
import { babylonShop, babylonYard } from './shop.js';
import { babylonianLanes } from './lanes.js';

// K: black glaze (the outlines and enamelled lines; no black glaze in the palette, the black lacquer stands in);
// R: the opaque red enamel of the manes (Koldewey: since decomposed to green)
const G = 'glaze_lapis', B = 'brick_baked', W = 'glaze_white', Y = 'glaze_yellow', K = 'lacquer_black', R = 'glaze_red';
/**
 * Stepped merlons along the top of a wall or tower r = [x0, z0, x1, z1] at y: each merlon three steps
 * narrowing upward (the Mesopotamian battlement), a row on each face of a thick wall or one across a
 * thin one. w: the merlon's width at the foot, gap: between merlons, tier: the height of a step.
 */
export function crenels(bag, r, y, mat, w = 1.2, { gap = w * 0.5, tier = w * 0.38, depth = 0.6 } = {}) {
  const [x0, z0, x1, z1] = r, along = x1 - x0 >= z1 - z0, L = along ? x1 - x0 : z1 - z0, T = along ? z1 - z0 : x1 - x0;
  const n = Math.max(1, Math.floor((L + gap) / (w + gap))), o = (L - n * w - (n - 1) * gap) / 2;
  const rows = T > 2 * depth + 0.6 ? [[0, depth], [T - depth, T]] : [[0, T]];
  for (let i = 0; i < n; i++) {
    const u0 = (along ? x0 : z0) + o + i * (w + gap);
    for (const [t0, t1] of rows) for (let k = 0; k < 3; k++) {
      const s = w * k / 6, e = k * 0.015, a = u0 + s, b2 = u0 + w - s, c0 = (along ? z0 : x0) + t0 + e, c1 = (along ? z0 : x0) + t1 - e;
      bag.add(mat, along ? box(a, y + k * tier, c0, b2, y + (k + 1) * tier, c1) : box(c0, y + k * tier, a, c1, y + (k + 1) * tier, b2));
    }
  }
}
// The beasts of the glazed walls in outline (walking toward +u, feet at 0, about 1 high): Ishtar's lion,
// Marduk's dragon (mushhushshu) with its horned serpent head, eagle hind feet and scorpion tail, Adad's bull.
const OUTLINES = {
  // the lion striding: tail raised with its tuft, the mane, the open jaws, one fore and one hind leg forward
  lion: [[-1.02, 0.98], [-0.94, 1.02], [-0.9, 0.94], [-0.86, 0.8], [-0.78, 0.7], [-0.6, 0.73], [-0.3, 0.71], [0, 0.72], [0.2, 0.76], [0.32, 0.86], [0.44, 0.95], [0.56, 0.99], [0.64, 0.98], [0.74, 0.96], [0.78, 1.01], [0.83, 0.97], [0.86, 0.9], [0.95, 0.84], [0.98, 0.79], [0.92, 0.76], [0.97, 0.72], [0.94, 0.68], [0.84, 0.7], [0.8, 0.66], [0.74, 0.58], [0.68, 0.5], [0.72, 0.3], [0.78, 0.08], [0.85, 0.02], [0.85, 0], [0.7, 0], [0.7, 0.06], [0.62, 0.3], [0.58, 0.4], [0.52, 0.3], [0.46, 0.06], [0.5, 0.02], [0.5, 0], [0.37, 0], [0.38, 0.06], [0.42, 0.3], [0.4, 0.42], [0.1, 0.4], [-0.3, 0.42], [-0.36, 0.32], [-0.3, 0.08], [-0.25, 0.02], [-0.25, 0], [-0.4, 0], [-0.42, 0.08], [-0.48, 0.3], [-0.54, 0.34], [-0.66, 0.1], [-0.63, 0.02], [-0.63, 0], [-0.78, 0], [-0.78, 0.08], [-0.7, 0.36], [-0.76, 0.5], [-0.8, 0.62], [-0.86, 0.72], [-0.9, 0.86], [-0.96, 0.92]],
  // the mane over head, neck and chest, its edge in tufts
  mane: [[0.18, 0.74], [0.24, 0.84], [0.3, 0.83], [0.36, 0.93], [0.42, 0.91], [0.5, 1.0], [0.58, 0.99], [0.66, 0.95], [0.7, 0.86], [0.72, 0.74], [0.75, 0.64], [0.7, 0.58], [0.67, 0.5], [0.6, 0.53], [0.56, 0.44], [0.5, 0.5], [0.44, 0.44], [0.38, 0.52], [0.3, 0.54], [0.26, 0.64], [0.2, 0.64]],
  eye: [[0.83, 0.88], [0.86, 0.9], [0.88, 0.87], [0.85, 0.85]],
  // Marduk's mushhushshu: the horned serpent head with its forked tongue on a long upright neck, the
  // slender scaled body, feline forelegs, eagle hind legs with talons, the tail raised with a scorpion's sting
  dragon: [[-1.0, 1.02], [-0.96, 1.06], [-0.92, 1.0], [-0.9, 0.88], [-0.86, 0.76], [-0.78, 0.68], [-0.62, 0.66], [-0.3, 0.68], [0, 0.7], [0.22, 0.74], [0.32, 0.84], [0.38, 1.0], [0.42, 1.14], [0.46, 1.24], [0.48, 1.32], [0.47, 1.42], [0.52, 1.36], [0.55, 1.46], [0.58, 1.38], [0.66, 1.37], [0.76, 1.34], [0.8, 1.31], [0.88, 1.33], [0.84, 1.3], [0.88, 1.27], [0.79, 1.28], [0.68, 1.26], [0.58, 1.24], [0.56, 1.1], [0.53, 0.96], [0.5, 0.84], [0.52, 0.72], [0.54, 0.62], [0.6, 0.4], [0.64, 0.12], [0.66, 0.04], [0.74, 0.03], [0.74, 0], [0.56, 0], [0.56, 0.05], [0.54, 0.3], [0.5, 0.42], [0.47, 0.3], [0.44, 0.06], [0.48, 0.02], [0.48, 0], [0.34, 0], [0.35, 0.06], [0.38, 0.3], [0.36, 0.44], [0.1, 0.44], [-0.25, 0.44], [-0.3, 0.36], [-0.32, 0.2], [-0.3, 0.08], [-0.22, 0.03], [-0.22, 0], [-0.4, 0], [-0.38, 0.06], [-0.38, 0.2], [-0.42, 0.34], [-0.5, 0.3], [-0.56, 0.12], [-0.54, 0.05], [-0.48, 0.02], [-0.48, 0], [-0.66, 0], [-0.64, 0.08], [-0.66, 0.3], [-0.72, 0.5], [-0.82, 0.6], [-0.92, 0.7], [-0.97, 0.84], [-1.0, 0.95]],
  // its scaled neck and the crest behind the horns, in a second glaze
  dragon_crest: [[0.31, 0.8], [0.375, 0.96], [0.415, 1.1], [0.46, 1.24], [0.5, 1.3], [0.52, 1.2], [0.5, 1.06], [0.47, 0.92], [0.44, 0.8]],
  dragon_eye: [[0.6, 1.32], [0.63, 1.34], [0.65, 1.31], [0.62, 1.3]],
  // Adad's wild bull (aurochs): the hump, the horn curving forward, the dewlap, the tail with its tuft
  bull: [[-0.86, 0.86], [-0.5, 0.88], [-0.1, 0.88], [0.2, 0.9], [0.36, 0.98], [0.46, 1.0], [0.56, 0.96], [0.64, 0.98], [0.6, 1.08], [0.62, 1.18], [0.68, 1.24], [0.74, 1.22], [0.69, 1.16], [0.68, 1.06], [0.72, 1.0], [0.78, 0.96], [0.84, 0.86], [0.9, 0.74], [0.92, 0.68], [0.88, 0.64], [0.8, 0.66], [0.72, 0.62], [0.66, 0.56], [0.62, 0.48], [0.64, 0.3], [0.66, 0.08], [0.7, 0.02], [0.7, 0], [0.58, 0], [0.58, 0.06], [0.56, 0.3], [0.52, 0.38], [0.48, 0.28], [0.46, 0.06], [0.48, 0.02], [0.48, 0], [0.36, 0], [0.37, 0.06], [0.38, 0.3], [0.36, 0.42], [0.1, 0.4], [-0.3, 0.42], [-0.36, 0.34], [-0.4, 0.22], [-0.36, 0.1], [-0.36, 0.02], [-0.34, 0], [-0.46, 0], [-0.46, 0.08], [-0.48, 0.2], [-0.5, 0.32], [-0.56, 0.26], [-0.62, 0.14], [-0.58, 0.04], [-0.58, 0], [-0.7, 0], [-0.7, 0.08], [-0.72, 0.2], [-0.78, 0.36], [-0.84, 0.5], [-0.86, 0.62], [-0.89, 0.5], [-0.9, 0.3], [-0.88, 0.2], [-0.97, 0.18], [-0.95, 0.28], [-0.94, 0.5], [-0.92, 0.72], [-0.88, 0.84]],
  // the row of curled hair along the belly, in blue-green glaze
  bull_hair: [[0.34, 0.43], [0.1, 0.41], [-0.28, 0.43], [-0.28, 0.5], [-0.1, 0.48], [0.1, 0.48], [0.34, 0.5]],
  bull_eye: [[0.78, 0.88], [0.81, 0.9], [0.83, 0.87], [0.8, 0.86]],
};
// the palmette of the throne room's frieze: a fan of seven lobes on a short stem (u across, v up, about 1 high)
OUTLINES.palmette = (() => {
  const P = [[0.07, 0], [0.07, 0.16]], c = [0, 0.3], N = 7;
  for (let i = 0; i < N; i++) {
    const a0 = Math.PI * (0.06 + 0.88 * i / N), a1 = Math.PI * (0.06 + 0.88 * (i + 0.5) / N), a2 = Math.PI * (0.06 + 0.88 * (i + 1) / N);
    if (i === 0) P.push([c[0] + 0.24 * Math.cos(a0), c[1] + 0.24 * Math.sin(a0)]);
    P.push([c[0] + 0.62 * Math.cos(a1 - 0.12), c[1] + 0.62 * Math.sin(a1 - 0.12)], [c[0] + 0.7 * Math.cos(a1), c[1] + 0.7 * Math.sin(a1)], [c[0] + 0.62 * Math.cos(a1 + 0.12), c[1] + 0.62 * Math.sin(a1 + 0.12)], [c[0] + 0.24 * Math.cos(a2), c[1] + 0.24 * Math.sin(a2)]);
  }
  P.push([-0.07, 0.16], [-0.07, 0]);
  return P.map(([u, v]) => [-u, v]).reverse().map(([u, v]) => [-u, v]);
})();
/** Triangles of a simple polygon (ear clipping). */
function earcut(P) {
  const idx = P.map((_, i) => i), out = [];
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inTri = (p, a, b, c) => { const d1 = cross(a, b, p), d2 = cross(b, c, p), d3 = cross(c, a, p); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  let guard = 0;
  while (idx.length > 3 && guard++ < 2000) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], a = P[ia], b = P[ib], c = P[ic];
      const cv = cross(a, b, c);
      if (ccw ? cv <= 0 : cv >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inTri(P[j], a, b, c))) continue;
      out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  return out;
}
const CUT = {};
/**
 * A beast in relief on a face: its outline extruded `d` out of the wall plane, its body `mat`. Only what can be
 * seen is built: the front, wound outward, and the edges facing out (the back lies in the wall).
 */
function relief(bag, kind, mat, place, size, dir, d = 0.1) {
  const P = OUTLINES[kind], tri = (CUT[kind] ??= earcut(P)), T = [];
  const V = ([u, v], w) => place(dir * u * size, v * size, w);
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], cross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
  const o0 = V([0, 0], 0), n = sub(V([0, 0], 1), o0);                       // out of the wall
  const [i0, i1, i2] = tri[0], ccw = dot(cross(sub(V(P[i1], d), V(P[i0], d)), sub(V(P[i2], d), V(P[i0], d))), n) > 0;
  for (const [a, b, c] of tri) if (ccw) T.push(...V(P[a], d), ...V(P[b], d), ...V(P[c], d)); else T.push(...V(P[a], d), ...V(P[c], d), ...V(P[b], d));
  for (let i = 0; i < P.length; i++) {
    const a0 = V(P[i], 0), b0 = V(P[(i + 1) % P.length], 0), a1 = V(P[i], d), b1 = V(P[(i + 1) % P.length], d);
    // seen from outside the outline runs counter-clockwise when ccw: its outside is then to the right of each edge
    if (ccw) T.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1); else T.push(...a0, ...b1, ...b0, ...a0, ...a1, ...b1);
  }
  bag.add(mat, fromTriangles(T));
}
const NORMAL = { n: [0, 0, -1], s: [0, 0, 1], w: [-1, 0, 0], e: [1, 0, 0] };
/** A point on a face of r: u along the face, v up, w out of it. */
function facePoint(r, face) {
  const [x0, z0, x1, z1] = r;
  return (u, v, w) => face === 'n' ? [u, v, z0 - w] : face === 's' ? [u, v, z1 + w] : face === 'w' ? [x0 - w, v, u] : [x1 + w, v, u];
}
const faceSpan = (r, face) => (face === 'n' || face === 's' ? [r[0], r[2]] : [r[1], r[3]]);
/** Turn a piece built facing +y so that it faces out of `face`. */
function turnTo(g, face) { if (face === 'n') g.rotateX(-Math.PI / 2); else if (face === 's') g.rotateX(Math.PI / 2); else if (face === 'e') g.rotateZ(-Math.PI / 2); else g.rotateZ(Math.PI / 2); return g; }
// the rosette: a daisy of white petals round a yellow heart (radius r), built facing +y
const ROSETTE = {};
function rosette(r) {
  return (ROSETTE[r] ??= {
    petals: lathe([[r, 0], [r * 0.45, 0.05], [0.001, 0.055]], 24, (th, i) => (i < 1 ? 0.5 + 0.5 * Math.abs(Math.cos(th * 4)) ** 0.5 : 1)),
    heart: lathe([[r * 0.34, 0.03], [r * 0.22, 0.08], [0.001, 0.095]], 8),
  });
}
/** A row of rosettes along a face of r at height y (centres), spaced `step`, radius rad. */
function rosettes(bag, r, face, y, step = 0.7, rad = 0.2) {
  const [a, b] = faceSpan(r, face), L = b - a, m = Math.max(1, Math.floor(L / step)), P = facePoint(r, face), R = rosette(rad);
  for (let i = 0; i < m; i++) {
    const p = P(a + (i + 0.5) * L / m, y, 0.004);
    bag.add(W, turnTo(R.petals.clone(), face).translate(...p));
    bag.add(Y, turnTo(R.heart.clone(), face).translate(...p));
  }
}
/** A band of enamelled lines along a face: white, black, white (from y up), standing a little proud. */
function band(bag, r, face, y, t = 0.09) {
  const [a, b] = faceSpan(r, face), P = facePoint(r, face);
  [W, K, W].forEach((mat, k) => { const p0 = P(a, y + k * t, 0), p1 = P(b, y + (k + 1) * t, 0.025); bag.add(mat, box(Math.min(p0[0], p1[0]), p0[1], Math.min(p0[2], p1[2]), Math.max(p0[0], p1[0]), p1[1], Math.max(p0[2], p1[2]))); });
}
/**
 * A row of beasts on a face of r, feet at y, spaced `step`, `size` high (about), walking toward +u when dir = 1.
 * kind 'lion': white lions with yellow manes and yellow lions with red manes by turn (Koldewey).
 */
function beasts(bag, r, face, y, { kind = 'lion', step = 3, size = 1, dir = 1 } = {}) {
  const [a, b] = faceSpan(r, face), L = b - a, n = Math.max(1, Math.floor(L / step)), P = facePoint(r, face);
  for (let i = 0; i < n; i++) {
    const u0 = a + (i + 0.5) * L / n, place = (du, dv, w) => P(u0 + du, y + dv, 0.02 + w), d = dir;
    if (kind === 'lion') {
      const alt = i % 2 === 1;
      relief(bag, 'lion', alt ? Y : W, place, size, d);
      relief(bag, 'mane', alt ? R : Y, place, size, d, 0.13);
      relief(bag, 'eye', 'glaze_blue', place, size, d, 0.115);
    } else if (kind === 'dragon') {
      relief(bag, 'dragon', W, place, size, d);
      relief(bag, 'dragon_crest', Y, place, size, d, 0.12);
      relief(bag, 'dragon_eye', 'glaze_blue', place, size, d, 0.115);
    } else {
      relief(bag, 'bull', Y, place, size, d);
      relief(bag, 'bull_hair', 'glaze_blue', place, size, d, 0.12);
      relief(bag, 'bull_eye', K, place, size, d, 0.115);
    }
  }
}
/**
 * The arch over a passage between x0 and x1 (along z from z0 to z1): a solid from the springing ys to
 * yt with a round-headed opening, and a ring of white and yellow glaze round it on both faces.
 */
function archInfill(bag, col, x0, x1, ys, yt, z0, z1, mat) {
  const R = (x1 - x0) / 2, cx = (x0 + x1) / 2, N = 16, T = [], pt = (k) => { const a = Math.PI * (1 - k / N); return [cx + R * Math.cos(a), ys + R * Math.sin(a)]; };
  for (let k = 0; k < N; k++) {
    const [ax, ay] = pt(k), [bx, by] = pt(k + 1);
    T.push(ax, ay, z0, bx, yt, z0, bx, by, z0, ax, ay, z0, ax, yt, z0, bx, yt, z0);                // north face
    T.push(ax, ay, z1, bx, by, z1, bx, yt, z1, ax, ay, z1, bx, yt, z1, ax, yt, z1);                // south face
    T.push(ax, ay, z0, bx, by, z0, bx, by, z1, ax, ay, z0, bx, by, z1, ax, ay, z1);                // the soffit
  }
  T.push(x0, yt, z0, x0, yt, z1, x1, yt, z1, x0, yt, z0, x1, yt, z1, x1, yt, z0);                    // the top
  bag.add(mat, fromTriangles(T));
  col.rect([x0, z0, x1, z1], ys + R * 0.9, yt);
  // the archivolt: a white ring and a yellow one standing proud on each face
  for (const [z, s] of [[z0, -1], [z1, 1]]) for (const [r0, r1, m] of [[R, R + 0.25, W], [R + 0.25, R + 0.4, Y]]) {
    const A = [];
    for (let k = 0; k < N; k++) {
      const a0 = Math.PI * (1 - k / N), a1 = Math.PI * (1 - (k + 1) / N), q = (r, a, w) => [cx + r * Math.cos(a), ys + r * Math.sin(a), z + s * w];
      const p = [q(r0, a0, 0.03), q(r0, a1, 0.03), q(r1, a1, 0.03), q(r1, a0, 0.03)], b0 = [q(r0, a0, 0), q(r0, a1, 0), q(r1, a1, 0), q(r1, a0, 0)];
      if (s > 0) A.push(...p[0], ...p[2], ...p[1], ...p[0], ...p[3], ...p[2]); else A.push(...p[0], ...p[1], ...p[2], ...p[0], ...p[2], ...p[3]);
      // inner and outer edges
      for (const [e0, e1] of [[0, 1], [2, 3]]) A.push(...b0[e0], ...b0[e1], ...p[e1], ...b0[e0], ...p[e1], ...p[e0], ...b0[e0], ...p[e1], ...b0[e1], ...b0[e0], ...p[e0], ...p[e1]);
    }
    bag.add(m, fromTriangles(A));
  }
}
/**
 * way_paving: { rect, centre (width of the limestone lane), y (top), slab (limestone), side (breccia) }: the
 * paving of the Processional Way (Koldewey): a lane of limestone flags 1.05 m square down the middle, red
 * breccia flags 0.66 m square either side, their bevelled joints filled with bitumen, on a bed of baked brick.
 */
function wayPaving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.12, C = el.centre ?? 7.4, xc = (x0 + x1) / 2, j = 0.035;
  const rand = rng(el.seed ?? 575);
  bag.add('bitumen', frustum([x0, z0, x1, z1], y - 0.3, y - 0.012, 0, 0, 0, 0, { noBottom: true }));                     // the bitumen in the joints, on the brick bed
  const lane = (a, b, s, mat) => {
    const nx = Math.max(1, Math.round((b - a) / s)), sx = (b - a) / nx, nz = Math.max(1, Math.floor((z1 - z0) / s)), sz = (z1 - z0) / nz;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const dy = Math.round(rand() * 3) * 0.002;                                  // the flags settled by a few millimetres
      bag.add(mat, frustum([a + i * sx + j / 2, z0 + k * sz + j / 2, a + (i + 1) * sx - j / 2, z0 + (k + 1) * sz - j / 2], y - 0.06, y - dy, 0, 0, 0, 0, { noBottom: true }));
    }
  };
  const c0 = Math.max(x0, xc - C / 2), c1 = Math.min(x1, xc + C / 2);
  lane(c0, c1, 1.05, el.slab ?? 'limestone');
  if (c0 > x0 + 0.3) lane(x0, c0, 0.66, el.side ?? 'breccia_red');
  if (x1 > c1 + 0.3) lane(c1, x1, 0.66, el.side ?? 'breccia_red');
  col.floor(el.rect, y);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * ishtar_gate: { c, w (the passage), d (depth), h (outer), h2 (inner) } — the outer and inner gates, their
 * towers, the arched passages; rows of bulls and of dragons by turn every 2 m up the faces (24 brick courses,
 * Koldewey), walking toward the passage; rosette bands at the foot and under the battlements.
 */
function ishtarGate(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 5, D = el.d ?? 40, h = el.h ?? 14, h2 = el.h2 ?? 23, y = el.y ?? 0;
  const parts = [[cz - D / 2, cz - D / 2 + 14, h, 9], [cz - D / 2 + 16, cz + D / 2, h2, 12]];
  const deck = (r, H, out) => {
    for (const f of ['n', 's', out]) { band(bag, r, f, y + H - 0.7); rosettes(bag, r, f, y + H - 0.25, 0.6, 0.17); }
  };
  const rows = (r, f, H, dir) => {
    for (let k = 0; y + 1.6 + k * 2 + 1.4 < y + H - 1; k++) beasts(bag, r, f, y + 1.6 + k * 2, { kind: k % 2 ? 'dragon' : 'bull', step: 2.4, size: 0.82, dir });
    rosettes(bag, r, f, y + 0.9, 0.6, 0.17); band(bag, r, f, y + 0.3);
  };
  for (const [z0, z1, H, tw] of parts) {
    for (const s of [-1, 1]) {
      const r = s < 0 ? [cx - w / 2 - tw, z0, cx - w / 2, z1] : [cx + w / 2, z0, cx + w / 2 + tw, z1];
      bag.add(G, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); col.floor(r, y + H);
      crenels(bag, r, y + H, G, 1.2);
      // on the fronts the beasts walk toward the passage, on the outer side toward the city
      const out = s < 0 ? 'w' : 'e';
      rows(r, out, H, 1); deck(r, H, out);
      // the towers projecting at the corners
      for (const tz of [z0 - 1.5, z1 - 4.5]) {
        const t = s < 0 ? [r[0] - 1.5, tz, r[2], tz + 6] : [r[0], tz, r[2] + 1.5, tz + 6];
        bag.add(G, box(t[0], y - 0.5, t[1], t[2], y + H + 2, t[3])); col.rect(t, y, y + H + 2); crenels(bag, t, y + H + 2, G, 1.2);
        for (const f of [tz < z0 ? 'n' : 's', out]) { rows(t, f, H + 2, f === out ? 1 : -s); band(bag, t, f, y + H + 1.3); rosettes(bag, t, f, y + H + 1.75, 0.6, 0.17); }
      }
    }
    // the arched passage: springing at a little over half the height
    const ys = y + Math.min(H * 0.5, H - w / 2 - 2.5);
    archInfill(bag, col, cx - w / 2, cx + w / 2, ys, y + H, z0, z1, G);
    crenels(bag, [cx - w / 2, z0, cx + w / 2, z1], y + H, G, 1.2);
    for (const f of ['n', 's']) { const r = [cx - w / 2, z0, cx + w / 2, z1]; band(bag, r, f, y + H - 0.7); rosettes(bag, r, f, y + H - 0.25, 0.6, 0.17); }
  }
  // the passage paved with limestone flags through both gates and the court between
  wayPaving({ rect: [cx - w / 2, cz - D / 2 - 1.5, cx + w / 2, cz + D / 2], centre: w, y: y + 0.12, seed: 576 }, { bag, col });
}
/**
 * glazed_wall: a wall a→b { h, th } of glazed brick lining the Processional Way: slightly projecting towers
 * at intervals equal to their breadth (Koldewey), on each face a plinth with rows of rosettes, the frieze of
 * lions (about 2 m long) between enamelled bands walking toward `walk` (+1: toward b's side, along +u),
 * a rosette band above; stepped battlements.
 */
function glazedWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 2.5, h = el.h ?? 8, y = el.y ?? 0, mat = el.mat || G, alongZ = ax === bx;
  const r = [Math.min(ax, bx) - (alongZ ? th / 2 : 0), Math.min(az, bz) - (alongZ ? 0 : th / 2), Math.max(ax, bx) + (alongZ ? th / 2 : 0), Math.max(az, bz) + (alongZ ? 0 : th / 2)];
  bag.add(mat, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  const faces = alongZ ? ['w', 'e'] : ['n', 's'], u0 = alongZ ? r[1] : r[0], L = alongZ ? r[3] - r[1] : r[2] - r[0];
  const tw = el.tower ?? 6, pr = el.projection ?? 0.45, nt = el.towers === false ? 0 : Math.max(1, Math.round(L / (2 * tw))), seg = L / Math.max(1, 2 * nt);
  const sub = (a, b, out) => (alongZ ? [r[0] - out, a, r[2] + out, b] : [a, r[1] - out, b, r[3] + out]);
  const deco = (q, f, top) => {
    rosettes(bag, q, f, y + 0.55, 0.62, 0.2); rosettes(bag, q, f, y + 1.1, 0.62, 0.2);                 // the plinth
    band(bag, q, f, y + 1.45);
    if (el.lions !== false) beasts(bag, q, f, y + 1.85, { step: 3, size: 1.0, dir: el.walk ?? 1 });
    band(bag, q, f, y + 3.05);
    rosettes(bag, q, f, y + 3.6, 0.62, 0.2);
    band(bag, q, f, top - 0.6);
  };
  if (!nt) { for (const f of faces) deco(r, f, y + h); crenels(bag, r, y + h, mat, 1.1); return; }
  for (let i = 0; i < 2 * nt; i++) {
    const a = u0 + i * seg, b = a + seg, tower = i % 2 === 1;
    if (tower) {
      const q = sub(a, b, pr), H = h + 1.4;
      bag.add(mat, box(q[0], y - 0.5, q[1], q[2], y + H, q[3])); col.rect(q, y, y + H);
      for (const f of faces) deco(q, f, y + H);
      crenels(bag, q, y + H, mat, 1.1);
    } else {
      const q = sub(a, b, 0);
      for (const f of faces) deco(q, f, y + h);
      crenels(bag, q, y + h, mat, 1.1);
    }
  }
}
/**
 * The courses of reed matting laid through a brick wall every thirtieth course, each over its bed of bitumen
 * (Herodotus 1.179), showing as a band of reed ends standing a little out of the faces of r (those named in
 * `faces`, of 'nswe') every 30 × 8.5 cm from y up to y + h.
 */
function layers(bag, r, y, h, faces) {
  const [x0, z0, x1, z1] = r, step = 30 * 0.085, o = 0.018;
  for (let k = 1; y + k * step < y + h - 0.6; k++) {
    const yy = y + k * step;
    for (const f of faces) {
      const q = f === 'n' ? [x0, z0 - o, x1, z0] : f === 's' ? [x0, z1, x1, z1 + o] : f === 'w' ? [x0 - o, z0, x0, z1] : [x1, z0, x1 + o, z1];
      bag.add('reed_mat', box(q[0], yy, q[1], q[2], yy + 0.045, q[3]));
      bag.add('bitumen', box(q[0] + (f === 'w' ? -0.006 : 0), yy - 0.022, q[1] + (f === 'n' ? -0.006 : 0), q[2] + (f === 'e' ? 0.006 : 0), yy, q[3] + (f === 's' ? 0.006 : 0)));
    }
  }
}
/**
 * gate_inscription: { x0, x1, z (the face's plane), face ('n'|'s'), y0, y1, lines, seed } — Nebuchadnezzar's dedication
 * on the wall by the Ishtar Gate: a panel of blue glazed brick with lines of cuneiform in white glaze (Akkadian, 60
 * lines, Wikipedia after the Pergamon panel), framed by enamelled bands and rosettes. Each sign a cluster of wedges —
 * horizontal, vertical, oblique heads and the corner wedge — standing a little proud of the blue.
 */
function gateInscription(el, { bag }) {
  const { x0, x1, z, y0, y1 } = el, s = el.face === 's' ? 1 : -1, n = el.lines ?? 60, rand = rng(el.seed ?? 605);
  const r = [x0, s < 0 ? z - 0.12 : z, x1, s < 0 ? z : z + 0.12], f = el.face ?? 'n', zf = s < 0 ? r[1] : r[3];
  bag.add(G, box(r[0], y0, r[1], r[2], y1, r[3]));
  band(bag, r, f, y1 - 0.3); rosettes(bag, r, f, y1 - 0.62, 0.6, 0.17); band(bag, r, f, y0 + 0.05);
  // the frame's sides
  for (const xa of [x0, x1 - 0.27]) [W, K, W].forEach((m, k) => bag.add(m, box(xa + k * 0.09, y0 + 0.32, Math.min(zf, zf + s * 0.025), xa + (k + 1) * 0.09, y1 - 0.3, Math.max(zf, zf + s * 0.025))));
  const ta = y1 - 0.95, tb = y0 + 0.5, pitch = (ta - tb) / n, sh = pitch * 0.7, d = 0.012;
  const wedge = (x, y, w, h) => bag.add(W, box(x, y, Math.min(zf, zf + s * d), x + w, y + h, Math.max(zf, zf + s * d)));
  for (let l = 0; l < n; l++) {
    const yb = ta - (l + 1) * pitch + (pitch - sh) / 2;
    let x = x0 + 0.45;
    // a ruling line under each line of text
    bag.add(K, box(x0 + 0.4, yb - (pitch - sh) / 2 - 0.004, Math.min(zf, zf + s * 0.004), x1 - 0.4, yb - (pitch - sh) / 2 + 0.004, Math.max(zf, zf + s * 0.004)));
    while (x < x1 - 0.6) {
      const k = Math.floor(rand() * 6), w = sh * (0.8 + rand() * 0.9);
      if (k === 0 || k === 1) { wedge(x, yb + sh * 0.45, w, sh * 0.16); if (k) wedge(x + w * 0.2, yb + sh * 0.1, w * 0.7, sh * 0.14); }    // one or two horizontals
      else if (k === 2) { for (let j = 0; j < 3; j++) wedge(x + j * w / 3, yb, sh * 0.13, sh); }                                       // verticals
      else if (k === 3) { wedge(x, yb + sh * 0.42, w, sh * 0.15); wedge(x + w * 0.65, yb, sh * 0.13, sh); }                             // a horizontal crossed by a vertical
      else if (k === 4) { wedge(x, yb + sh * 0.55, sh * 0.35, sh * 0.35); wedge(x + sh * 0.45, yb + sh * 0.1, sh * 0.35, sh * 0.35); }  // corner wedges
      else { wedge(x, yb + sh * 0.7, w, sh * 0.14); wedge(x, yb + sh * 0.2, w, sh * 0.14); wedge(x + w * 0.5, yb, sh * 0.13, sh); }     // two horizontals and a vertical
      x += w + sh * (0.3 + rand() * 0.25);
    }
  }
}
/** city_wall: a double wall with towers a→b { h, th, gap (between the two walls), y }. */
function cityWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 6, h = el.h ?? 15, gap = el.gap ?? 12, y = el.y ?? 0, alongX = az === bz;
  for (const [o, hh, t] of [[0, h, th], [gap + th, h * 0.75, th * 0.65]]) {
    const r = alongX ? [Math.min(ax, bx), az - t / 2 + o, Math.max(ax, bx), az + t / 2 + o] : [ax - t / 2 + o, Math.min(az, bz), ax + t / 2 + o, Math.max(az, bz)];
    if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue;
    bag.add(B, frustum(r, y - 0.5, y + hh, 0, 0, 0, 0, { noBottom: true })); col.rect(r, y, y + hh); col.floor(r, y + hh); crenels(bag, r, y + hh, B, 1.5);
    layers(bag, r, y, hh, alongX ? 'ns' : 'we');
    const L = alongX ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 20);
    for (let i = 0; i <= n; i++) { const u = (alongX ? r[0] : r[1]) + i * L / Math.max(1, n); const q = alongX ? [u - 4, r[1] - 2, u + 4, r[3] + 2] : [r[0] - 2, u - 4, r[2] + 2, u + 4]; bag.add(B, frustum(q, y - 0.5, y + hh + 3, 0, 0, 0, 0, { noBottom: true })); col.rect(q, y, y + hh + 3); crenels(bag, q, y + hh + 3, B, 1.5); layers(bag, q, y, hh + 3, 'nswe'); }
  }
}
/**
 * palace: { rect, h, abut ('n'…: the side built against the city wall), courts: [rect], gates: [{ rect, h, towers ('n'|'s'|'e'|'w': the outer face it opens on) }],
 * throne: { court (index into courts), doors: [u, …] (centres along the court's south face) } — a palace of baked
 * brick round its courts (the Southern Palace): solid ranges of rooms between the courts, gateways through them,
 * the outer faces in shallow vertical steps (Koldewey: 80 steps on an 80 m front), stepped battlements, the courts
 * paved in brick; on the south side of the throne court the enamelled facade of the throne room (Koldewey: on a
 * dark blue ground yellow columns with bright blue capitals, above them a frieze of white double palmettes over a
 * band of yellow, black and white squares) with its three doors.
 */
function palace(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 11, courts = el.courts || [];
  // the throne room (§13.3): hollowed behind the facade, its three doors real passages through the 2.4 m wall
  const hall = el.throne ? (() => {
    const c = courts[el.throne.court], zf = c[3], X0 = c[0] + 2, X1 = c[2] - 2, wall = 2.4, xc = (c[0] + c[2]) / 2;
    return { rect: [X0, zf + wall, X1, zf + wall + 14.6], zf, xc, wall, doors: (el.throne.doors || [0]).map((u) => ({ u: xc + u, w: u === 0 ? 4.4 : 3.2, ht: u === 0 ? 7 : 5.4 })) };
  })() : null;
  const gates = [...(el.gates || []), ...(hall ? hall.doors.map((d) => ({ rect: [d.u - d.w / 2, hall.zf, d.u + d.w / 2, hall.zf + hall.wall], h: d.ht })) : [])];
  const ins = (r, x, z) => x > r[0] && x < r[2] && z > r[1] && z < r[3];
  const xs = [...new Set([x0, x1, ...courts.flatMap((r) => [r[0], r[2]]), ...gates.flatMap((g) => [g.rect[0], g.rect[2]]), ...(hall ? [hall.rect[0], hall.rect[2]] : [])])].sort((a, b) => a - b);
  const zs = [...new Set([z0, z1, ...courts.flatMap((r) => [r[1], r[3]]), ...gates.flatMap((g) => [g.rect[1], g.rect[3]]), ...(hall ? [hall.rect[1], hall.rect[3]] : [])])].sort((a, b) => a - b);
  // the cells of the grid of all edges, merged greedily into rectangles of one kind (fewer hidden faces)
  const NX = xs.length - 1, NZ = zs.length - 1, kind = [], done = [];
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2, mz = (zs[j] + zs[j + 1]) / 2, g = gates.find((q) => ins(q.rect, mx, mz));
    kind[j * NX + i] = courts.some((r) => ins(r, mx, mz)) ? 'court' : hall && ins(hall.rect, mx, mz) ? 'hall' : g ? 'gate:' + (g.h ?? 4.5) : 'solid';
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const k = kind[j * NX + i];
    if (k === 'court' || k === 'hall' || done[j * NX + i]) continue;
    let i1 = i; while (i1 + 1 < NX && kind[j * NX + i1 + 1] === k && !done[j * NX + i1 + 1]) i1++;
    let j1 = j; for (;;) { const jj = j1 + 1; if (jj >= NZ) break; let ok = true; for (let ii = i; ii <= i1; ii++) if (kind[jj * NX + ii] !== k || done[jj * NX + ii]) { ok = false; break; } if (!ok) break; j1 = jj; }
    for (let jj = j; jj <= j1; jj++) for (let ii = i; ii <= i1; ii++) done[jj * NX + ii] = true;
    const c = [xs[i], zs[j], xs[i1 + 1], zs[j1 + 1]];
    if (k === 'solid') { bag.add(B, frustum(c, -0.5, h, 0, 0, 0, 0, { noBottom: true })); col.rect(c, 0, h); col.floor(c, h); }
    else { const gh = +k.slice(5); bag.add(B, box(c[0], gh, c[1], c[2], h, c[3])); col.rect(c, gh, h); col.floor(c, h); bag.add(B, frustum(c, -0.3, 0.08, 0, 0, 0, 0, { noBottom: true })); }
  }
  for (const r of courts) { bag.add(B, frustum(r, -0.3, 0.08, 0, 0, 0, 0, { noBottom: true })); col.floor(r, 0.08); }
  // the outer faces in shallow vertical steps, broken by the gates; the battlements
  const near = (x, z, m) => gates.some((g) => g.towers && x > g.rect[0] - m && x < g.rect[2] + m && z > g.rect[1] - m && z < g.rect[3] + m);
  for (const [f, a, b] of [['n', x0, x1], ['s', x0, x1], ['w', z0, z1], ['e', z0, z1]]) {
    if (el.abut === f) continue;                                    // built against a wall there: no face of its own
    for (let u = a + 1; u < b - 1.5; u += 2) {
      const q = f === 'n' ? [u, z0 - 0.3, u + 1, z0] : f === 's' ? [u, z1, u + 1, z1 + 0.3] : f === 'w' ? [x0 - 0.3, u, x0, u + 1] : [x1, u, x1 + 0.3, u + 1];
      if (near((q[0] + q[2]) / 2, (q[1] + q[3]) / 2, 5)) continue;
      bag.add(B, box(q[0], -0.5, q[1], q[2], h, q[3]));
    }
    const t = f === 'n' ? [x0, z0, x1, z0 + 1.2] : f === 's' ? [x0, z1 - 1.2, x1, z1] : f === 'w' ? [x0, z0, x0 + 1.2, z1] : [x1 - 1.2, z0, x1, z1];
    crenels(bag, t, h, B, 1.3);
  }
  // the gate towers
  for (const g of gates) if (g.towers) {
    const [a0, b0, a1, b1] = g.rect, f = g.towers, H = h + 2.5;
    const tw = f === 'e' || f === 'w' ? [[f === 'e' ? x1 - 2 : x0 - 2.5, b0 - 4.5, f === 'e' ? x1 + 2.5 : x0 + 2, b0], [f === 'e' ? x1 - 2 : x0 - 2.5, b1, f === 'e' ? x1 + 2.5 : x0 + 2, b1 + 4.5]]
      : [[a0 - 4.5, f === 'n' ? z0 - 2.5 : z1 - 2, a0, f === 'n' ? z0 + 2 : z1 + 2.5], [a1, f === 'n' ? z0 - 2.5 : z1 - 2, a1 + 4.5, f === 'n' ? z0 + 2 : z1 + 2.5]];
    for (const t of tw) { bag.add(B, box(t[0], -0.5, t[1], t[2], H, t[3])); col.rect(t, 0, H); crenels(bag, t, H, B, 1.2); }
  }
  if (el.throne) { throneFacade(bag, col, courts[el.throne.court], el.throne.doors || [0], h); throneRoom(bag, col, lights, hall, h); }
}
/** The enamelled facade of the throne room on the south side of court r (facing north into it). */
/** The throne room: plastered walls with a dado of blue glaze, the dais with the king's throne, lampstands and braziers, long tables laid for a feast along the walls, hangings. */
function throneRoom(bag, col, lights, hall, h) {
  const [x0, z0, x1, z1] = hall.rect, xc = (x0 + x1) / 2, yc = h - 1.5;
  bag.add(B, box(x0, -0.3, z0, x1, 0.08, z1)); col.floor(hall.rect, 0.08);
  bag.add('cedar', box(x0, yc - 0.06, z0, x1, yc, z1)); bag.add(B, box(x0, yc, z0, x1, h, z1)); col.floor(hall.rect, h);
  for (let x = x0 + 0.8; x < x1 - 0.4; x += 1.4) bag.add('cedar', box(x - 0.2, yc - 0.55, z0, x + 0.2, yc - 0.06, z1));
  // the walls: plaster to the ceiling, a dado of blue glaze under a band of yellow, black and white squares
  const wall = (a, b, ax, at, s) => {   // a wall face x = at (ax 'x') or z = at (ax 'z'), the room on side s of it
    const t = 0.03, pl = (mat, v0, v1) => bag.add(mat, ax === 'x' ? box(Math.min(at, at + s * t), v0, a, Math.max(at, at + s * t), v1, b) : box(a, v0, Math.min(at, at + s * t), b, v1, Math.max(at, at + s * t)));
    pl('plaster', 0.08, yc); pl('glaze_lapis', 0.08, 2.0); [['glaze_white', 2.0, 2.08], [K, 2.08, 2.16], [Y, 2.16, 2.24]].forEach(([m, v0, v1]) => bag.add(m, ax === 'x' ? box(Math.min(at, at + s * 0.045), v0, a, Math.max(at, at + s * 0.045), v1, b) : box(a, v0, Math.min(at, at + s * 0.045), b, v1, Math.max(at, at + s * 0.045))));
  };
  wall(z0, z1, 'x', x0, 1); wall(z0, z1, 'x', x1, -1); wall(x0, x1, 'z', z1, -1); wall(x0, x1, 'z', z0, 1);
  // the dais: three steps and the throne, gold on a base of brick; two lampstands and braziers either side; a canopy of red cloth on posts
  for (let k = 0; k < 3; k++) {
    const f = z1 - 5.4 + k * 0.9, r = [xc - 4.5 + k * 0.5, f, xc + 4.5 - k * 0.5, z1];
    bag.add(B, box(r[0], 0.08, r[1], r[2], 0.08 + 0.3 * (k + 1), r[3])); col.floor(r, 0.08 + 0.3 * (k + 1));
  }
  const ty = 0.98;
  bag.add('gold', box(xc - 0.8, ty, z1 - 1.8, xc + 0.8, ty + 0.55, z1 - 0.7)); bag.add('gold', box(xc - 0.8, ty + 0.55, z1 - 0.85, xc + 0.8, ty + 2.2, z1 - 0.7)); bag.add('cloth_red', box(xc - 0.7, ty + 0.55, z1 - 1.75, xc + 0.7, ty + 0.62, z1 - 0.9));
  for (const sx of [-1, 1]) { bag.add('gold', box(xc + sx * 0.8 - 0.07, ty, z1 - 1.8, xc + sx * 0.8 + 0.07, ty + 1.0, z1 - 0.7)); bag.add('gold', box(xc - 0.7, ty, z1 - 2.5, xc + 0.7, ty + 0.2, z1 - 1.9)); }
  for (const sx of [-1, 1]) {
    const px = xc + sx * 3.4;
    bag.add('timber', box(px - 0.12, 0.98, z1 - 3.2, px + 0.12, 5.2, z1 - 2.96)); col.rect([px - 0.12, z1 - 3.2, px + 0.12, z1 - 2.96], 0.98, 5.2);
  }
  bag.add('cloth_red', box(xc - 3.5, 4.9, z1 - 3.2, xc + 3.5, 5.2, z1 - 0.1));
  col.rect([xc - 0.8, z1 - 2.5, xc + 0.8, z1 - 0.7], ty, ty + 2.2);
  for (const sx of [-1, 1]) {
    const lx = xc + sx * 6.2;
    bag.add(BZc, lathe([[0.4, 0], [0.3, 0.1], [0.06, 0.3], [0.05, 2.6], [0.14, 2.8], [0.3, 3.0], [0.001, 3.0]], 12, null, lx, 0.08, z1 - 2)); col.circle(lx, z1 - 2, 0.4, 0, 3);
    bag.add('flame', box(lx - 0.04, 3.05, z1 - 2.04, lx + 0.04, 3.2, z1 - 1.96));
    lights.push({ at: [lx, 3.4, z1 - 2], color: '#ffb46b', intensity: 4, distance: 14 });
  }
  lights.push({ at: [xc, 5.5, z1 - 6], color: '#ffc27a', intensity: 6, distance: 22 });
  // the feast: two long low tables with couches along them, gold and silver vessels, wine in jars of bronze on stands
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) {
    const tx = xc + sx * (9 + k * 5.5), a = z0 + 1.5, b = z1 - 7;
    bag.add('cedar', box(tx - 0.5, 0.45, a, tx + 0.5, 0.5, b)); for (let z = a + 0.4; z < b; z += 2.2) for (const dx of [-0.42, 0.42]) bag.add('cedar', box(tx + dx - 0.04, 0.08, z - 0.04, tx + dx + 0.04, 0.45, z + 0.04));
    col.rect([tx - 0.5, a, tx + 0.5, b], 0, 0.5);
    for (let z = a + 0.8; z < b - 0.4; z += 1.1) { bag.add(k ? 'silver' : 'gold', lathe([[0.001, 0], [0.04, 0], [0.1, 0.12], [0.001, 0.12]], 8, null, tx + (z % 2 > 1 ? 0.2 : -0.2), 0.5, z)); bag.add('linen', box(tx - 0.3, 0.5, z + 0.2, tx - 0.05, 0.53, z + 0.45)); }
    for (const s2 of [-1, 1]) { const cx = tx + s2 * 1.5; bag.add('cloth_red', box(cx - 0.4, 0.1, a, cx + 0.4, 0.4, b)); bag.add('linen', box(cx - 0.36, 0.4, a + 0.1, cx + 0.36, 0.5, b - 0.1)); }
  }
  // hangings: cloth in panels on the walls above the dado
  for (let z = z0 + 2; z < z1 - 3; z += 3.4) for (const [x, s] of [[x0, 1], [x1, -1]]) bag.add(Math.floor(z) % 2 ? 'cloth_indigo' : 'cloth_red', box(Math.min(x, x + s * 0.09), 3.2, z, Math.max(x, x + s * 0.09), 6.8, z + 2.0));
  lights.push({ at: [x0 + 6, 5.5, (z0 + z1) / 2], color: '#ffb46b', intensity: 3.5, distance: 16 }, { at: [x1 - 6, 5.5, (z0 + z1) / 2], color: '#ffb46b', intensity: 3.5, distance: 16 });
}
const BZc = 'bronze';
function throneFacade(bag, col, r, doors, h) {
  const [c0, , c1, zf] = r, xc = (c0 + c1) / 2, F = [c0, zf, c1, zf + 1], P = facePoint(F, 'n');
  const plate = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
  const top = h - 0.9;
  plate(G, c0 + 0.4, 0.08, c1 - 0.4, top, 0, 0.06);                                  // the dark blue ground
  const pan = [c0 + 0.4, zf, c1 - 0.4, zf + 1], PF = facePoint(pan, 'n'), pl = (mat, u0, v0, u1, v1, w) => { const a = PF(u0, v0, 0.06), b = PF(u1, v1, 0.06 + w); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
  const bandAt = (y0) => [W, K, W].forEach((m, k) => pl(m, pan[0], y0 + k * 0.09, pan[2], y0 + (k + 1) * 0.09, 0.025));
  bandAt(0.35);
  // the doors: a cedar leaf bound in bronze in a doorway rebated in three steps of glaze
  const D = doors.map((u, i) => ({ u: xc + u, w: u === 0 ? 4.4 : 3.2, ht: u === 0 ? 7 : 5.4, i }));
  for (const d of D) {
    [[0.45, W, 1.05], [0.3, Y, 0.7], [0.15, W, 0.35]].forEach(([w, m, o]) => {
      pl(m, d.u - d.w / 2 - o, 0.08, d.u - d.w / 2 - o + 0.35, d.ht + o, w); pl(m, d.u + d.w / 2 + o - 0.35, 0.08, d.u + d.w / 2 + o, d.ht + o, w);
      pl(m, d.u - d.w / 2 - o, d.ht + o - 0.35, d.u + d.w / 2 + o, d.ht + o, w);
    });
    // the leaves stand open against the sides of the passage
    for (const sx of [-1, 1]) {
      const xa = d.u + sx * d.w / 2, xb = xa - sx * 0.18, q = [Math.min(xa, xb), zf + 0.3, Math.max(xa, xb), zf + 0.3 + d.w / 2 - 0.1];
      bag.add('cedar', box(q[0], 0.08, q[1], q[2], d.ht - 0.05, q[3]));
      for (const v of [0.6, d.ht * 0.5, d.ht - 0.6]) bag.add('bronze', box(q[0] - 0.02 * sx, v - 0.08, q[1], q[2] + 0.02 * sx, v + 0.08, q[3]));
      col.rect(q, 0, d.ht);
    }
  }
  // the columns: a yellow shaft on a base, two tiers of bright blue volutes, an abacus
  const VOL = (rr) => lathe([[rr, 0], [rr, 0.07], [rr * 0.55, 0.1], [0.001, 0.11]], 16);
  const vol = VOL(0.3), eye = lathe([[0.1, 0.1], [0.001, 0.15]], 10), clear = (u) => D.every((d) => Math.abs(u - d.u) > d.w / 2 + 1.6);
  const step = 2.4, n = Math.floor((pan[2] - pan[0]) / step);
  for (let i = 0; i < n; i++) {
    const u = pan[0] + (i + 0.5) * (pan[2] - pan[0]) / n;
    if (!clear(u)) continue;
    pl(Y, u - 0.38, 0.7, u + 0.38, 0.95, 0.16);                                          // the base
    pl(Y, u - 0.2, 0.95, u + 0.2, 5.8, 0.12);                                            // the shaft
    for (const [v, k] of [[6.15, 1], [6.8, 0.85]]) {
      pl('tile_turquoise', u - 0.2, v - 0.33, u + 0.2, v + 0.3, 0.13);
      for (const sx of [-1, 1]) { const p = PF(u + sx * 0.36 * k, v, 0.06); bag.add('tile_turquoise', turnTo(vol.clone().scale(k, 1, k), 'n').translate(...p)); bag.add(Y, turnTo(eye.clone(), 'n').translate(...p)); }
    }
    pl(Y, u - 0.55, 7.12, u + 0.55, 7.32, 0.15);                                         // the abacus
  }
  // the band of squares, then the frieze of double palmettes, then the top band
  const sq = 0.3, m = Math.floor((pan[2] - pan[0]) / sq);
  for (let i = 0; i < m; i++) pl([Y, K, W][i % 3], pan[0] + i * (pan[2] - pan[0]) / m, 7.7, pan[0] + (i + 1) * (pan[2] - pan[0]) / m, 7.7 + sq, 0.03);
  const fy = 7.7 + sq + 0.75, np = Math.floor((pan[2] - pan[0]) / 1.1);
  for (let i = 0; i < np; i++) {
    const u = pan[0] + (i + 0.5) * (pan[2] - pan[0]) / np, place = (du, dv, w) => PF(u + du, fy + dv, 0.08 + w);
    relief(bag, 'palmette', W, place, 0.62, 1, 0.06); relief(bag, 'palmette', W, place, -0.62, -1, 0.06);
  }
  bandAt(top - 0.35);
}
registerStyle('babylonian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.sumerian.elements, gate_inscription: gateInscription, ishtar_gate: ishtarGate, glazed_wall: glazedWall, city_wall: cityWall, way_paving: wayPaving, palace, esagila, etemenanki, bridge, quay, quffa, ...babylonianHouses(), ...babylonianLanes(), babylon_shop: babylonShop, babylon_yard: babylonYard },
  objects: {},
});
