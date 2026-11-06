// Neo-Babylonian architecture (6th c. BC; docs/settlements/babylon.md §4): the Mesopotamian mud-brick
// vocabulary (src/styles/sumerian) with Nebuchadnezzar's baked brick and glazed brick — the
// Ishtar Gate's towers in blue glaze with rows of beasts, crenellated; glazed walls along the
// Processional Way; the city's double walls with towers.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../sumerian/index.js';

const G = 'glaze_lapis', B = 'brick_baked', W = 'glaze_white', Y = 'glaze_yellow', K = 'lacquer_black';
/**
 * Stepped merlons along the top of a wall or tower r = [x0, z0, x1, z1] at y: each merlon three steps
 * narrowing upward (the Mesopotamian battlement), a row on each face of a thick wall or one across a
 * thin one. w: the merlon's width at the foot, gap: between merlons, tier: the height of a step.
 */
function crenels(bag, r, y, mat, w = 1.2, { gap = w * 0.5, tier = w * 0.38, depth = 0.6 } = {}) {
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
      relief(bag, 'mane', alt ? 'lacquer_red' : Y, place, size, d, 0.13);
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
  bag.add('asphalt', box(x0, y - 0.3, z0, x1, y - 0.012, z1));                     // the bitumen in the joints, on the brick bed
  const lane = (a, b, s, mat) => {
    const nx = Math.max(1, Math.round((b - a) / s)), sx = (b - a) / nx, nz = Math.max(1, Math.floor((z1 - z0) / s)), sz = (z1 - z0) / nz;
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const dy = Math.round(rand() * 3) * 0.002;                                  // the flags settled by a few millimetres
      bag.add(mat, box(a + i * sx + j / 2, y - 0.1, z0 + k * sz + j / 2, a + (i + 1) * sx - j / 2, y - dy, z0 + (k + 1) * sz - j / 2));
    }
  };
  const c0 = Math.max(x0, xc - C / 2), c1 = Math.min(x1, xc + C / 2);
  lane(c0, c1, 1.05, el.slab ?? 'limestone');
  if (c0 > x0 + 0.3) lane(x0, c0, 0.66, el.side ?? 'marble_pink');
  if (x1 > c1 + 0.3) lane(c1, x1, 0.66, el.side ?? 'marble_pink');
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
/** city_wall: a double wall with towers a→b { h, th, gap (between the two walls), y }. */
function cityWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 6, h = el.h ?? 15, gap = el.gap ?? 12, y = el.y ?? 0, alongX = az === bz;
  for (const [o, hh, t] of [[0, h, th], [gap + th, h * 0.75, th * 0.65]]) {
    const r = alongX ? [Math.min(ax, bx), az - t / 2 + o, Math.max(ax, bx), az + t / 2 + o] : [ax - t / 2 + o, Math.min(az, bz), ax + t / 2 + o, Math.max(az, bz)];
    if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue;
    bag.add(B, box(r[0], y - 0.5, r[1], r[2], y + hh, r[3])); col.rect(r, y, y + hh); col.floor(r, y + hh); crenels(bag, r, y + hh, B, 1.5);
    const L = alongX ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 20);
    for (let i = 0; i <= n; i++) { const u = (alongX ? r[0] : r[1]) + i * L / Math.max(1, n); const q = alongX ? [u - 4, r[1] - 2, u + 4, r[3] + 2] : [r[0] - 2, u - 4, r[2] + 2, u + 4]; bag.add(B, box(q[0], y - 0.5, q[1], q[2], y + hh + 3, q[3])); col.rect(q, y, y + hh + 3); crenels(bag, q, y + hh + 3, B, 1.5); }
  }
}
registerStyle('babylonian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.sumerian.elements, ishtar_gate: ishtarGate, glazed_wall: glazedWall, city_wall: cityWall, way_paving: wayPaving },
  objects: {},
});
