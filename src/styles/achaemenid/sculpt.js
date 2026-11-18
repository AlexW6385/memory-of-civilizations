// Modelled low relief for the Achaemenid stairways (docs/settlements/persepolis.md §21): a figure is a continuous
// surface — a height field over the wall, rounded at its edges, with the body's forms (head, arm, beard in curls,
// fluted tiara, pleated robe, ribs, mane in rows of curls) raised on it — meshed with smooth normals and rising
// 2-8 cm out of the wall. Three levels of detail (grid cell). Everything is deterministic: the small differences
// between figures come from a hash of the figure's own position, never from a counter or a random generator.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { OUTLINES } from './reliefs.js';

/** An integer hash of two numbers (to the millimetre) in [0, 1). */
export function hash2(a, b) {
  let h = Math.imul(Math.round(a * 1000) | 0, 374761393) ^ Math.imul(Math.round(b * 1000) | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles gathered per material, cut into geometries of at most `max` triangles. */
export class Acc {
  constructor() { this.m = new Map(); }
  add(mat, P, N) { let e = this.m.get(mat); if (!e) this.m.set(mat, (e = { P: [], N: [] })); for (let i = 0; i < P.length; i++) { e.P.push(P[i]); e.N.push(N[i]); } }
  get tris() { let n = 0; for (const e of this.m.values()) n += e.P.length / 9; return n; }
  flush(bag, max = 24000) {
    for (const [mat, e] of this.m) {
      for (let s = 0; s < e.P.length; s += max * 9) {
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(e.P.slice(s, s + max * 9), 3));
        g.setAttribute('normal', new Float32BufferAttribute(e.N.slice(s, s + max * 9), 3));
        bag.add(mat, g);
      }
    }
    this.m.clear();
  }
}

// ---- the grid of a figure: signed distance to its outline (positive inside), in outline units
function sdPoly(P, x, y) {
  let d2 = Infinity, inside = false;
  for (let i = 0, n = P.length; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], l2 = ex * ex + ey * ey;
    const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * ex + (y - a[1]) * ey) / l2)) : 0, dx = x - a[0] - ex * t, dy = y - a[1] - ey * t;
    d2 = Math.min(d2, dx * dx + dy * dy);
    if ((a[1] > y) !== (b[1] > y) && x < a[0] + (y - a[1]) / (b[1] - a[1]) * ex) inside = !inside;
  }
  return inside ? Math.sqrt(d2) : -Math.sqrt(d2);
}
const BASE = new Map();
/** The cached signed-distance grid of an outline at cells cu × cv (outline units). */
function baseGrid(key, P, cu, cv) {
  const k = `${key}|${cu.toFixed(5)}|${cv.toFixed(5)}`;
  let g = BASE.get(k);
  if (g) return g;
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (const [x, y] of P) { u0 = Math.min(u0, x); u1 = Math.max(u1, x); v0 = Math.min(v0, y); v1 = Math.max(v1, y); }
  u0 = Math.floor((u0 - 2 * cu) / cu) * cu; v0 = Math.floor((v0 - 2 * cv) / cv) * cv;
  const nu = Math.ceil((u1 + 2 * cu - u0) / cu), nv = Math.ceil((v1 + 2 * cv - v0) / cv), sd = new Float32Array((nu + 1) * (nv + 1));
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) sd[j * (nu + 1) + i] = sdPoly(P, u0 + i * cu, v0 + j * cv);
  return BASE.set(k, g = { u0, v0, nu, nv, cu, cv, sd }), g;
}

// ---- the forms raised on a figure. Each feature adds metres of height to the grid H (positions in outline units).
function dome(G, H, cu, cv, ru, rv, h, p = 0.5, inside = true) {
  const { u0, v0, nu, nv } = G, W = nu + 1;
  const i0 = Math.max(0, Math.floor((cu - ru - u0) / G.cu)), i1 = Math.min(nu, Math.ceil((cu + ru - u0) / G.cu));
  const j0 = Math.max(0, Math.floor((cv - rv - v0) / G.cv)), j1 = Math.min(nv, Math.ceil((cv + rv - v0) / G.cv));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const x = (u0 + i * G.cu - cu) / ru, y = (v0 + j * G.cv - cv) / rv, q = x * x + y * y;
    if (q >= 1) continue;
    const k = j * W + i;
    if (inside && G.sd[k] <= 0) continue;
    H[k] += h * (1 - q) ** p;
  }
}
/** A ridge along a segment (a capsule of radius r, outline units). */
function ridge(G, H, a, b, r, h) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / (r * 0.6)));
  for (let s = 0; s <= n; s++) dome(G, H, a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n, r, r, h * 0.55, 0.6);
}

/**
 * Pillow height of a node: the edge rounded over `r` metres, then flat-topped to `d`.
 */
const pillow = (sdm, d, r, e) => { const t = Math.max(0, Math.min(1, (sdm + e) / (r + e))); return d * Math.sqrt(1 - (1 - t) * (1 - t)); };

const HUMAN = new Set(['persian', 'mede', 'bearer', 'hero']);
// where the stone shows and where the paint of the robe: (u, v) in outline units
const isRobe = (kind, u, v) => kind === 'cypress' || (kind === 'persian' ? v < 0.745 && !(v > 0.5 && u > 0.1) : kind === 'mede' || kind === 'bearer' ? v < 0.73 && !(v > 0.5 && u > 0.09) : false);
const isGift = (kind, u, v) => kind === 'bearer' && u > 0.115 && v > 0.56 && v < 0.76;

/** Features of the human figures, by level. */
function humanFeatures(kind, G, H, size, lod, hs) {
  const m = (x) => x / size;                                          // metres → outline units
  // the head: a rounder dome than the body, brow, nose, lips, eye
  const head = kind === 'persian' ? [0.012, 0.865, 0.095, 0.115] : [0.0, 0.865, 0.088, 0.12];
  dome(G, H, head[0], head[1], head[2], head[3], 0.03, 0.45);
  // the arm: a rounded forearm from the elbow to the hand holding the flower (or the vessel)
  if (kind === 'persian') ridge(G, H, [-0.05, 0.69], [0.112, 0.57], 0.034, 0.02);
  else ridge(G, H, [-0.04, 0.68], [0.12, 0.62], 0.032, 0.018);
  dome(G, H, 0.14, 0.565, 0.032, 0.032, 0.016, 0.5, false);                // the hand
  if (lod < 2) return;
  // lod 2 (the nearest): the face's features
  dome(G, H, 0.096, 0.862, 0.02, 0.034, 0.011, 0.5, false);             // the nose
  dome(G, H, 0.068, 0.885, 0.02, 0.012, -0.008, 0.5, false);           // the eye socket
  dome(G, H, 0.058, 0.9, 0.034, 0.012, 0.007, 0.5, false);                // the brow
  dome(G, H, 0.085, 0.815, 0.02, 0.01, 0.006, 0.5, false);            // the lips
  // the beard in rows of curls
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) dome(G, H, 0.062 + c * 0.022 + (r % 2) * 0.01, 0.795 + r * 0.018, 0.013, 0.012, 0.009, 0.5);
  // the tiara of the Persian (fluted) and the cap of the Mede (a felt dome with its flap)
  if (kind === 'persian') for (let k = 0; k < 7; k++) ridge(G, H, [-0.055 + k * 0.0185, 0.915], [-0.055 + k * 0.0185, 0.995], 0.0085, 0.011);
  else dome(G, H, 0.0, 0.965, 0.07, 0.04, 0.012, 0.5);
  // the belt, and the pleats of the robe falling to the hem (their width and depth by the figure's hash)
  ridge(G, H, [-0.085, 0.505], [0.085, 0.505], 0.014, 0.01);
  const lam = m(0.026), ph = hs * 6.28;
  const { u0, v0, nu, nv, cu, cv, sd } = G, W = nu + 1;
  for (let j = 0; j <= nv; j++) {
    const v = v0 + j * cv;
    if (v > 0.495 || v < 0.03) continue;
    const gain = Math.min(1, (0.495 - v) / 0.05);
    for (let i = 0; i <= nu; i++) {
      const k = j * W + i;
      if (sd[k] <= m(0.006)) continue;
      const u = u0 + i * cu;
      H[k] += 0.0065 * gain * (0.5 + 0.5 * Math.cos((u / lam) * 6.28318 + ph + v * 7)) + (kind === 'persian' && v < 0.2 ? 0.004 * (0.2 - v) * 5 : 0);
    }
  }
}

/** Features of the animals of the delegations. */
function animalFeatures(kind, G, H, lod) {
  const D = {
    ram: [[-0.28, 0.3, 0.13, 0.15, 0.012], [0.16, 0.33, 0.11, 0.13, 0.01], [0.4, 0.48, 0.07, 0.08, 0.012]],
    horse: [[-0.3, 0.45, 0.14, 0.17, 0.014], [0.16, 0.5, 0.12, 0.15, 0.012], [0.5, 0.78, 0.1, 0.17, 0.012], [0.58, 0.72, 0.05, 0.05, 0.006]],
    zebu: [[-0.28, 0.5, 0.14, 0.17, 0.013], [0.12, 0.62, 0.16, 0.16, 0.016], [0.45, 0.66, 0.08, 0.12, 0.01]],
    camel: [[-0.28, 0.58, 0.14, 0.18, 0.014], [0.0, 0.75, 0.1, 0.1, 0.025], [0.55, 0.9, 0.09, 0.1, 0.008]],
  }[kind] || [];
  for (const [cu, cv, ru, rv, h] of D) dome(G, H, cu, cv, ru, rv, h, 0.5);
  if (lod < 2) return;
  // the legs' joints as ridges
  const j = { ram: [[-0.31, 0.02, -0.31, 0.18], [0.24, 0.02, 0.25, 0.2]], horse: [[-0.34, 0.04, -0.32, 0.4], [0.24, 0.02, 0.26, 0.4]], zebu: [[-0.34, 0.02, -0.29, 0.3], [0.2, 0.02, 0.23, 0.3]], camel: [[-0.37, 0.04, -0.3, 0.38], [0.25, 0.04, 0.27, 0.4]] }[kind] || [];
  for (const [a, b, c, d] of j) ridge(G, H, [a, b], [c, d], 0.025, 0.008);
}

// ---- the lion and the bull are built of volumes (capsules and domes of the body), not cut from an outline: each volume
// raises the field by its own rounded section, and gives its signed distance (positive inside) for the edge
function vol(G, H, SD, a, b, ra, rb, h, sy = 1) {
  const { u0, v0, nu, nv } = G, W = nu + 1, R = Math.max(ra, rb);
  const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - u0) / G.cu)), i1 = Math.min(nu, Math.ceil((Math.max(a[0], b[0]) + R - u0) / G.cu));
  const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - v0) / G.cv)), j1 = Math.min(nv, Math.ceil((Math.max(a[1], b[1]) + R - v0) / G.cv));
  const ex = b[0] - a[0], ey = b[1] - a[1], l2 = ex * ex + ey * ey;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const x = u0 + i * G.cu, y = v0 + j * G.cv;
    if (y < (G.floor ?? -1e9)) continue;
    const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * ex + (y - a[1]) * ey) / l2)) : 0;
    const r = ra + (rb - ra) * t, dx = (x - a[0] - ex * t), dy = (y - a[1] - ey * t) * sy, dist = Math.hypot(dx, dy), k = j * W + i;
    if (r - dist > SD[k]) SD[k] = r - dist;
    if (dist < r) { const q = dist / r, hh = h * Math.sqrt(1 - q * q); if (hh > H[k]) H[k] = hh; }
  }
}
/** An ornament added on a figure's surface (curls, ribs, features): positive h raises, negative cuts. */
function bump(G, H, SD, cx, cy, rx, ry, h) {
  const { u0, v0, nu, nv } = G, W = nu + 1;
  const i0 = Math.max(0, Math.floor((cx - rx - u0) / G.cu)), i1 = Math.min(nu, Math.ceil((cx + rx - u0) / G.cu));
  const j0 = Math.max(0, Math.floor((cy - ry - v0) / G.cv)), j1 = Math.min(nv, Math.ceil((cy + ry - v0) / G.cv));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const x = (u0 + i * G.cu - cx) / rx, y = (v0 + j * G.cv - cy) / ry, q = x * x + y * y, k = j * W + i;
    if (q < 1 && SD[k] > 0.01) H[k] += h * Math.sqrt(1 - q);
  }
}
function rib(G, H, SD, a, b, r, h) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (r * 0.7))); for (let s = 0; s <= n; s++) bump(G, H, SD, a[0] + (b[0] - a[0]) * s / n, a[1] + (b[1] - a[1]) * s / n, r, r, h); }

/** The bull, thrown down under the lion: forequarters buckling, head flung up and back, horns, dewlap, ribs. Heights in metres. */
function bullField(G, H, SD, lod, hs, hB) {
  const V = (a, b, ra, rb, h, sy) => vol(G, H, SD, a, b, ra, rb, h, sy);
  V([-0.42, 0.68], [0.12, 0.72], 0.2, 0.2, hB * 1.0);                       // the barrel
  V([-0.46, 0.62], [-0.44, 0.62], 0.22, 0.22, hB * 1.25);                   // the haunch
  V([0.1, 0.78], [0.12, 0.78], 0.2, 0.2, hB * 1.25);                        // the shoulder
  V([0.16, 0.84], [0.4, 1.04], 0.14, 0.1, hB * 1.1);                        // the neck, arched
  V([0.28, 0.8], [0.3, 0.78], 0.11, 0.11, hB * 0.9);                        // the dewlap
  V([0.42, 1.06], [0.56, 1.22], 0.095, 0.062, hB * 1.15);                   // the head, flung up
  V([0.6, 1.25], [0.62, 1.27], 0.05, 0.05, hB * 0.9);                       // the muzzle
  V([0.4, 1.17], [0.46, 1.36], 0.024, 0.01, hB * 0.5);                      // the near horn
  V([0.44, 1.14], [0.54, 1.3], 0.022, 0.01, hB * 0.45);                     // the far horn
  V([-0.5, 0.52], [-0.58, 0.3], 0.1, 0.058, hB * 0.9); V([-0.58, 0.3], [-0.54, 0.03], 0.058, 0.04, hB * 0.7);   // the hind leg, hock bent back
  V([-0.36, 0.5], [-0.38, 0.28], 0.085, 0.05, hB * 0.75); V([-0.38, 0.28], [-0.36, 0.03], 0.05, 0.038, hB * 0.6);  // the other hind leg
  V([0.14, 0.55], [0.3, 0.36], 0.08, 0.052, hB * 0.85); V([0.3, 0.36], [0.5, 0.3], 0.05, 0.036, hB * 0.65);      // the foreleg buckled under, folded forward
  V([0.08, 0.5], [0.2, 0.3], 0.08, 0.05, hB * 0.8); V([0.2, 0.3], [0.22, 0.03], 0.05, 0.036, hB * 0.62);          // the standing foreleg
  V([-0.62, 0.8], [-0.74, 0.52], 0.022, 0.016, hB * 0.4); V([-0.74, 0.5], [-0.75, 0.42], 0.04, 0.04, hB * 0.5);   // the tail and its tuft
  // the ribs: a row of curved ridges across the barrel
  const nr = lod >= 2 ? 9 : 6;
  for (let k = 0; k < nr; k++) { const t = k / (nr - 1), x = -0.34 + t * 0.38; rib(G, H, SD, [x, 0.5 + 0.03 * Math.sin(t * 3)], [x + 0.07, 0.86 + 0.02 * Math.sin(t * 3 + hs)], lod >= 2 ? 0.016 : 0.026, 0.009); }
  bump(G, H, SD, 0.52, 1.2, 0.03, 0.016, -0.007);                           // the eye, under its brow
  bump(G, H, SD, 0.62, 1.27, 0.015, 0.012, -0.006);                         // the nostril
  if (lod >= 2) {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) bump(G, H, SD, 0.3 + c * 0.04 + (r % 2) * 0.02, 0.97 + r * 0.04, 0.017, 0.017, 0.007);   // the curls of the dewlap
    for (let c = 0; c < 6; c++) bump(G, H, SD, 0.22 + c * 0.035, 1.0 + c * 0.03, 0.016, 0.016, 0.006);                                                   // the crest of the neck
  }
}
/** The lion leaping on its back: the arched body, the haunch, the forepaws clawing, the head with its mane in rows of curls. */
function lionField(G, H, SD, lod, hs, hL) {
  const V = (a, b, ra, rb, h, sy) => vol(G, H, SD, a, b, ra, rb, h, sy);
  V([-0.92, 0.56], [-0.52, 0.94], 0.17, 0.18, hL);                          // the body, arched
  V([-0.92, 0.5], [-0.9, 0.52], 0.2, 0.2, hL * 1.15);                       // the haunch
  V([-0.9, 0.5], [-1.02, 0.3], 0.1, 0.055, hL * 0.85); V([-1.02, 0.3], [-1.0, 0.03], 0.055, 0.04, hL * 0.65);    // the hind leg
  V([-0.76, 0.42], [-0.82, 0.28], 0.08, 0.05, hL * 0.7); V([-0.82, 0.28], [-0.8, 0.03], 0.05, 0.036, hL * 0.55);  // the other
  V([-0.54, 0.92], [-0.3, 0.94], 0.075, 0.055, hL * 0.8); V([-0.3, 0.94], [-0.18, 0.96], 0.055, 0.045, hL * 0.7); // the forearm and paw on the bull's back
  V([-0.6, 0.84], [-0.42, 0.78], 0.07, 0.05, hL * 0.7); V([-0.42, 0.78], [-0.3, 0.78], 0.05, 0.04, hL * 0.6);    // the other, lower
  V([-0.98, 0.66], [-1.16, 0.8], 0.026, 0.014, hL * 0.4); V([-1.16, 0.8], [-1.22, 0.52], 0.014, 0.014, hL * 0.35); V([-1.22, 0.52], [-1.21, 0.44], 0.04, 0.04, hL * 0.5);   // the tail and its tuft
  V([-0.46, 1.08], [-0.36, 1.04], 0.13, 0.115, hL * 1.2);                   // the head, bent to the bull's haunch
  V([-0.28, 1.0], [-0.24, 0.99], 0.06, 0.05, hL * 1.0);                     // the muzzle, jaws open
  // the mane in rows of curls round the head and down the neck and shoulders
  const rows = lod >= 2 ? [0.18, 0.235, 0.29, 0.345] : lod === 1 ? [0.2, 0.3] : [0.24];
  rows.forEach((rr, ri) => {
    const n = Math.round(Math.PI * 2 * rr / (lod >= 2 ? 0.05 : 0.075));
    for (let k = 0; k < n; k++) {
      const a = (k + 0.5 * (ri % 2) + (hs - 0.5) * 0.3) * Math.PI * 2 / n, cx = -0.52 + Math.cos(a) * rr * 1.05, cy = 1.1 + Math.sin(a) * rr;
      if (Math.cos(a) > 0.4 && Math.sin(a) < 0.5) continue;                 // the face is bare
      bump(G, H, SD, cx, cy, lod >= 2 ? 0.028 : 0.042, lod >= 2 ? 0.028 : 0.042, 0.02);
    }
  });
  bump(G, H, SD, -0.3, 1.1, 0.03, 0.016, -0.008);                            // the eye
  bump(G, H, SD, -0.42, 1.17, 0.05, 0.016, 0.008);                           // the brow
  bump(G, H, SD, -0.2, 0.99, 0.022, 0.02, -0.006);                           // the nose
  if (lod >= 2) {
    for (let t = 0; t < 7; t++) rib(G, H, SD, [-0.8 + t * 0.045, 0.52 + t * 0.02], [-0.76 + t * 0.045, 0.74 + t * 0.02], 0.014, 0.006);   // the ribs
    for (const [x, y] of [[-0.2, 0.97], [-0.17, 0.95], [-0.15, 0.93], [-0.3, 0.8], [-0.28, 0.78]]) bump(G, H, SD, x, y, 0.011, 0.011, 0.006);  // the claws
  }
}

/** A figure in the long robe (Persian) or the tunic and trousers (Mede), in profile, built of volumes: head with brow, nose, lips and beard in curls under the tiara or cap, arm and hand, the body, the robe's pleats. */
function humanField(kind, G, H, SD, lod, hs, h) {
  const V = (a, b, ra, rb, hh, sy) => vol(G, H, SD, a, b, ra, rb, h * hh, sy);
  const persian = kind === 'persian' || kind === 'hero';
  if (persian) {
    V([0.0, 0.1], [0.0, 0.5], 0.135, 0.092, 0.8);                      // the robe, flaring to the hem
    V([-0.075, 0.1], [-0.045, 0.45], 0.1, 0.075, 0.95);                // the drape hanging behind
  } else {
    V([0.0, 0.3], [0.0, 0.52], 0.1, 0.09, 0.8);                        // the tunic to the knee
    V([-0.025, 0.05], [-0.015, 0.3], 0.05, 0.05, 0.7); V([0.03, 0.05], [0.04, 0.3], 0.048, 0.048, 0.75);   // the trousered legs
    V([0.05, 0.02], [0.1, 0.03], 0.03, 0.03, 0.6);                     // the foot
  }
  V([0.0, 0.52], [0.0, 0.72], 0.095, 0.085, 0.95);                     // the chest and shoulders
  V([0.0, 0.72], [0.01, 0.77], 0.047, 0.045, 0.9);                     // the neck
  V([0.012, 0.82], [0.02, 0.9], 0.088, 0.082, 1.15, 1);                // the head
  V([0.07, 0.77], [0.085, 0.83], 0.045, 0.04, 1.2);                    // the beard
  if (persian) V([0.0, 0.935], [0.004, 0.985], 0.078, 0.07, 1.25); else V([0.0, 0.93], [0.0, 0.975], 0.078, 0.07, 1.2);   // the tiara / the cap
  V([-0.01, 0.7], [0.07, 0.6], 0.042, 0.036, 1.3); V([0.07, 0.6], [0.14, 0.595], 0.036, 0.03, 1.3);   // the arm bent to the hand
  V([0.155, 0.59], [0.16, 0.595], 0.032, 0.032, 1.25);                 // the hand (a flower, or the vessel's foot)
  if (kind === 'bearer') { V([0.17, 0.62], [0.22, 0.64], 0.04, 0.045, 1.4); V([0.2, 0.66], [0.22, 0.7], 0.07, 0.055, 1.5); }   // the vessel carried before him
  if (lod < 2) return;
  const bp = (x, y, rx, ry, hh) => bump(G, H, SD, x, y, rx, ry, hh * h);
  bp(0.093, 0.862, 0.02, 0.036, 0.35);                                 // the nose
  bp(0.075, 0.885, 0.02, 0.011, -0.25);                                // the eye
  bp(0.074, 0.903, 0.035, 0.011, 0.25);                                // the brow
  bp(0.088, 0.815, 0.02, 0.01, 0.2);                                   // the lips
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) bp(0.058 + c * 0.021 + (r % 2) * 0.01, 0.775 + r * 0.016, 0.0135, 0.012, 0.3);   // the beard in rows of curls
  if (persian) for (let k = 0; k < 7; k++) rib(G, H, SD, [-0.05 + k * 0.0165, 0.935], [-0.05 + k * 0.0165, 0.99], 0.0075, 0.3 * h);   // the tiara's flutes
  else bp(-0.06, 0.9, 0.03, 0.05, 0.3);                                // the flap of the cap behind
  rib(G, H, SD, [-0.085, 0.505], [0.085, 0.505], 0.011, 0.3 * h);      // the belt
  // the pleats of the robe falling to the hem (their phase by the figure's hash)
  const { u0, v0, nu, nv, cu, cv } = G, W = nu + 1, lam = 0.04, ph = hs * 6.28;
  for (let j = 0; j <= nv; j++) {
    const v = v0 + j * cv;
    if (v > 0.495 || v < (persian ? 0.1 : 0.32)) continue;
    const gain = Math.min(1, (0.495 - v) / 0.04);
    for (let i = 0; i <= nu; i++) { const k = j * W + i; if (SD[k] > 0.01 && H[k] > 0) H[k] += 0.005 * gain * (0.5 + 0.5 * Math.cos(((u0 + i * cu) / lam) * 6.28318 + ph + v * 5)); }
  }
}

const ANIMAL = {
  horse: { body: [[-0.3, 0.52], [0.15, 0.52], 0.15, 0.15], neck: [[0.17, 0.58], [0.42, 0.83], 0.1, 0.07], head: [[0.43, 0.83], [0.62, 0.7], 0.06, 0.04], legs: [[0.2, 0.42, 0.045], [0.1, 0.42, 0.04], [-0.28, 0.44, 0.055], [-0.18, 0.44, 0.05]], tail: [[-0.44, 0.58], [-0.52, 0.3], 0.03] },
  zebu: { body: [[-0.3, 0.46], [0.15, 0.46], 0.17, 0.17], neck: [[0.2, 0.5], [0.4, 0.6], 0.12, 0.085], head: [[0.4, 0.6], [0.52, 0.52], 0.07, 0.045], hump: [[0.12, 0.66], 0.1], legs: [[0.2, 0.32, 0.05], [0.1, 0.32, 0.045], [-0.26, 0.34, 0.055], [-0.16, 0.34, 0.05]], tail: [[-0.45, 0.55], [-0.48, 0.25], 0.025] },
  camel: { body: [[-0.28, 0.55], [0.12, 0.55], 0.16, 0.16], neck: [[0.2, 0.62], [0.52, 0.93], 0.08, 0.05], head: [[0.54, 0.94], [0.68, 0.9], 0.05, 0.035], hump: [[-0.05, 0.76], 0.1], legs: [[0.2, 0.4, 0.04], [0.1, 0.4, 0.038], [-0.3, 0.4, 0.045], [-0.2, 0.4, 0.04]], tail: [[-0.44, 0.6], [-0.46, 0.4], 0.02] },
  ram: { body: [[-0.28, 0.3], [0.14, 0.3], 0.14, 0.14], neck: [[0.17, 0.34], [0.34, 0.46], 0.09, 0.07], head: [[0.34, 0.46], [0.46, 0.42], 0.06, 0.04], legs: [[0.2, 0.2, 0.035], [0.1, 0.2, 0.032], [-0.26, 0.2, 0.04], [-0.16, 0.2, 0.036]], tail: [[-0.41, 0.34], [-0.44, 0.24], 0.025] },
};
/** The animals led by the delegations, built of volumes: barrel, neck, head, four legs, tail; the hump of the zebu and the camel, the ram's horn. */
function animalField(kind, G, H, SD, lod, h) {
  const A = ANIMAL[kind], V = (a, b, ra, rb, hh) => vol(G, H, SD, a, b, ra, rb, h * hh);
  V(A.body[0], A.body[1], A.body[2], A.body[3], 1);
  V(A.neck[0], A.neck[1], A.neck[2], A.neck[3], 0.9); V(A.head[0], A.head[1], A.head[2], A.head[3], 0.85);
  if (A.hump) V(A.hump[0], [A.hump[0][0] + 0.01, A.hump[0][1]], A.hump[1], A.hump[1], 1.1);
  for (const [x, y, r] of A.legs) { V([x, y], [x + 0.01, y * 0.45], r * 1.15, r, 0.7); V([x + 0.01, y * 0.45], [x, 0.015], r, r * 0.7, 0.6); }
  V(A.tail[0], A.tail[1], A.tail[2], A.tail[2] * 0.7, 0.5);
  if (kind === 'ram') { V([0.36, 0.5], [0.33, 0.55], 0.04, 0.035, 1.0); V([0.33, 0.55], [0.4, 0.56], 0.035, 0.025, 0.9); }
  if (lod >= 2) {
    bump(G, H, SD, A.head[0][0] + 0.04, A.head[0][1] + 0.02, 0.012, 0.01, -0.006);                        // the eye
    for (let t = 0; t < 6; t++) bump(G, H, SD, A.neck[0][0] + (A.neck[1][0] - A.neck[0][0]) * (t + 0.5) / 6 - 0.02, A.neck[0][1] + (A.neck[1][1] - A.neck[0][1]) * (t + 0.5) / 6 + A.neck[2] * 0.7, 0.014, 0.014, 0.007);   // the mane
    for (let t = 0; t < 5; t++) rib(G, H, SD, [A.body[0][0] + 0.07 + t * 0.065, A.body[0][1] - 0.1], [A.body[0][0] + 0.09 + t * 0.065, A.body[0][1] + 0.08], 0.012, 0.005);   // the ribs
  }
}

const CELLS = [[0.05, 0.06], [0.026, 0.03], [0.0085, 0.02]];     // [cu, cv] in metres at lod 0 (far), 1, 2 (the nearest)
const CELLS_BIG = [[0.075, 0.075], [0.04, 0.04], [0.025, 0.025]];  // the lion and the bull

/**
 * A modelled figure of the outline `kind`, raised out of a wall (as reliefs.js `relief`): `place(u, v, w)` the wall's
 * frame, [u0, v0] its foot, `size`, `dir` (-1 mirrors), `lod` 0 (far), 1, 2 (near), `d` its height (m). `mats`: stone,
 * paint (the robe) and gift (the vessel) materials. Triangles go to `acc`.
 */
export function figure(acc, kind, place, u0, v0, size, dir, lod, d, mats) {
  const big = kind === 'lionbull';
  const [cmu, cmv] = (big ? CELLS_BIG : CELLS)[lod], cu = cmu / size, cv = cmv / size;
  const hs = hash2(u0 * 1.7 + v0, v0 * 3.1 + u0);                        // this figure's own difference
  const S = 1 + (hs - 0.5) * 0.06;                                        // height varies by ±3 %
  // the union grid for the lion and the bull
  let G, H;
  if (big) {
    const u0g = Math.floor(-1.45 / cu) * cu, v0g = Math.floor(-0.05 / cv) * cv, nu = Math.ceil((0.75 - u0g) / cu), nv = Math.ceil((1.55 - v0g) / cv);
    G = { u0: u0g, v0: v0g, nu, nv, cu, cv, sd: new Float32Array((nu + 1) * (nv + 1)) };
    const n = G.sd.length, hB = new Float32Array(n), hL = new Float32Array(n), sB = new Float32Array(n).fill(-1), sL = new Float32Array(n).fill(-1);
    bullField(G, hB, sB, lod, hs, 0.062 * S); lionField(G, hL, sL, lod, hs, 0.088 * S);
    H = new Float32Array(n);
    // the lion lies on the bull: its height added on the bull's where they overlap, the bull's own face elsewhere
    for (let k = 0; k < n; k++) { H[k] = Math.max(hB[k], hL[k] > 0 ? hL[k] + 0.6 * hB[k] : 0); G.sd[k] = Math.max(sB[k], sL[k]); }
  } else {
    if (HUMAN.has(kind) || ANIMAL[kind]) {
      // built of volumes (a figure's grid: its box)
      const [bu0, bu1, bv1] = HUMAN.has(kind) ? [-0.2, 0.3, 1.02] : [-0.6, 0.8, 1.05], u0g = Math.floor(bu0 / cu) * cu, nu = Math.ceil((bu1 - u0g) / cu), nv = Math.ceil((bv1 + 0.02) / cv);
      G = { u0: u0g, v0: 0, nu, nv, cu, cv, sd: new Float32Array((nu + 1) * (nv + 1)).fill(-1), floor: 0 };
      H = new Float32Array(G.sd.length);
      if (HUMAN.has(kind)) humanField(kind, G, H, G.sd, lod, hs, d * S * 1.15); else animalField(kind, G, H, G.sd, lod, d * S * 1.1);
    } else {
      G = baseGrid(kind, OUTLINES[kind], cu, cv);
      H = new Float32Array(G.sd.length);
      const r = Math.min(0.06, d * 2);
      for (let k = 0; k < H.length; k++) H[k] = pillow(G.sd[k] * size, d * S, r, 0.4 * cmu);
    }
  }
  emit(acc, kind, G, H, size, place, u0, v0, dir, mats);
}

function emit(acc, kind, G, H, size, place, u0, v0, dir, mats) {
  const { u0: gu, v0: gv, nu, nv, cu, cv } = G, W = nu + 1, o = place(0, 0, 0);
  const sub = (p) => [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
  const ex = sub(place(1, 0, 0)), ey = sub(place(0, 1, 0)), ez = sub(place(0, 0, 1));
  const Hs = (i, j) => H[Math.max(0, Math.min(nv, j)) * W + Math.max(0, Math.min(nu, i))];
  const vert = (i, j) => {
    const h = H[j * W + i] + (H[j * W + i] > 1e-5 ? 0.002 : 0);
    let u = gu + i * cu, v = gv + j * cv;
    // an outer node beside the figure is drawn onto its outline, so that the edge is smooth and not stepped
    if (H[j * W + i] <= 1e-5 && G.sd[j * W + i] < 0 && G.sd[j * W + i] > -1.5 * Math.max(cu, cv)) {
      const S0 = (a, b) => G.sd[Math.max(0, Math.min(nv, b)) * W + Math.max(0, Math.min(nu, a))];
      let gx = (S0(i + 1, j) - S0(i - 1, j)) / (2 * cu), gy = (S0(i, j + 1) - S0(i, j - 1)) / (2 * cv); const gl = Math.hypot(gx, gy);
      if (gl > 1e-6 && (H[j * W + i + 1] > 1e-5 || H[j * W + i - 1] > 1e-5 || H[(j + 1) * W + i] > 1e-5 || H[(j - 1) * W + i] > 1e-5 || H[(j + 1) * W + i + 1] > 1e-5 || H[(j - 1) * W + i - 1] > 1e-5 || H[(j + 1) * W + i - 1] > 1e-5 || H[(j - 1) * W + i + 1] > 1e-5)) {
        const t = -G.sd[j * W + i] / gl * 0.85; u += gx * t; v += gy * t;
      }
    }
    const hu = dir * (Hs(i + 1, j) - Hs(i - 1, j)) / (2 * cu * size), hv = (Hs(i, j + 1) - Hs(i, j - 1)) / (2 * cv * size);
    const p = place(u0 + dir * u * size, v0 + v * size, h);
    let n = [ez[0] - hu * ex[0] - hv * ey[0], ez[1] - hu * ex[1] - hv * ey[1], ez[2] - hu * ex[2] - hv * ey[2]];
    const l = Math.hypot(...n) || 1; n = [n[0] / l, n[1] / l, n[2] / l];
    return { p, n, u, v, h };
  };
  const cache = new Map(), V = (i, j) => { const k = j * W + i; let r = cache.get(k); if (!r) cache.set(k, (r = vert(i, j))); return r; };
  const pick = (a, b, c) => {
    const u = (a.u + b.u + c.u) / 3, v = (a.v + b.v + c.v) / 3;
    if (mats.gift && isGift(kind, u, v)) return mats.gift;
    return mats.paint && isRobe(kind, u, v) ? mats.paint : mats.stone;
  };
  const push = (a, b, c) => {
    if (a.h <= 1e-5 && b.h <= 1e-5 && c.h <= 1e-5) return;
    const ux = b.p[0] - a.p[0], uy = b.p[1] - a.p[1], uz = b.p[2] - a.p[2], wx = c.p[0] - a.p[0], wy = c.p[1] - a.p[1], wz = c.p[2] - a.p[2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    if (nx * ez[0] + ny * ez[1] + nz * ez[2] < 0) [b, c] = [c, b];
    acc.add(pick(a, b, c), [...a.p, ...b.p, ...c.p], [...a.n, ...b.n, ...c.n]);
  };
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * W + i;
    if (H[k] <= 1e-5 && H[k + 1] <= 1e-5 && H[k + W] <= 1e-5 && H[k + W + 1] <= 1e-5) continue;
    const a = V(i, j), b = V(i + 1, j), c = V(i, j + 1), d = V(i + 1, j + 1);
    // the diagonal along the shorter rise
    if (Math.abs(a.h - d.h) <= Math.abs(b.h - c.h)) { push(a, b, d); push(a, d, c); } else { push(a, b, c); push(b, d, c); }
  }
}
