// The tympana and lintels of Notre-Dame's three west portals as modelled relief in registers
// (docs/settlements/paris.md §1a3): a continuous surface rising 2–8 cm from the wall, sculpted from rounded
// primitives (heads, torsos, limbs, robes with folds, wings, tombs) laid on a height grid, its normals from
// the grid's slope; each patch of surface has the material of the figure on top of it (painted robes, flesh,
// hair, gilt), the wall's blue ground showing between the figures.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { hash3 } from './nd-sculpture.js';

const MIN_H = 0.0035;

/**
 * Raise the primitives on a grid over u ∈ [u0, u1] (along z from zc), y ∈ [y0, y1], on the wall face x = X (the relief
 * stands out toward −x). prims: { a [u, y], b [u, y], ra, rb (radii at the ends, m), H (peak height, m), mat, fold? }.
 * inside(u, y): the vertices to keep (the arch's edge).
 */
export function relief(acc, { X, zc, u0, u1, y0, y1, cell = 0.04, prims, inside }) {
  const nu = Math.ceil((u1 - u0) / cell), nv = Math.ceil((y1 - y0) / cell), W = nu + 1;
  const Hh = new Float32Array(W * (nv + 1)), M = new Array(W * (nv + 1)).fill(null);
  for (const p of prims) {
    const rmax = Math.max(p.ra, p.rb) + cell;
    const ax = p.a[0], ay = p.a[1], bx = p.b[0], by = p.b[1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9;
    const iu0 = Math.max(0, Math.floor((Math.min(ax, bx) - rmax - u0) / cell)), iu1 = Math.min(nu, Math.ceil((Math.max(ax, bx) + rmax - u0) / cell));
    const jv0 = Math.max(0, Math.floor((Math.min(ay, by) - rmax - y0) / cell)), jv1 = Math.min(nv, Math.ceil((Math.max(ay, by) + rmax - y0) / cell));
    for (let j = jv0; j <= jv1; j++) for (let i = iu0; i <= iu1; i++) {
      const u = u0 + i * cell, y = y0 + j * cell;
      let t = ((u - ax) * dx + (y - ay) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const cx = ax + dx * t, cy = ay + dy * t, d = Math.hypot(u - cx, y - cy), r = p.ra + (p.rb - p.ra) * t;
      if (d >= r) continue;
      const q = d / r;
      let h = p.H * Math.sqrt(1 - q * q * (1 - 0.15 * q));
      if (p.fold) h *= 1 - p.fold.amp * (0.5 - 0.5 * Math.cos(6.2832 * ((u - cx) / p.fold.lam + p.fold.ph + (y - ay) * 0.35))) * (1 - 0.4 * q);
      const k = j * W + i;
      if (h > Hh[k]) { Hh[k] = h; M[k] = p.mat; }
    }
  }
  if (inside) for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) if (!inside(u0 + i * cell, y0 + j * cell)) { Hh[j * W + i] = 0; M[j * W + i] = null; }
  const H = (i, j) => Hh[Math.max(0, Math.min(nv, j)) * W + Math.max(0, Math.min(nu, i))];
  const pos = (i, j) => [X - Hh[j * W + i], y0 + j * cell, zc + u0 + i * cell];
  const nor = (i, j) => { const hu = (H(i + 1, j) - H(i - 1, j)) / (2 * cell), hy = (H(i, j + 1) - H(i, j - 1)) / (2 * cell), l = Math.hypot(1, hu, hy); return [-1 / l, -hy / l, -hu / l]; };
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const ks = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
    let best = -1, bm = null;
    for (const [a, b] of ks) { const h = Hh[b * W + a]; if (h > best) { best = h; bm = M[b * W + a]; } }
    if (best < MIN_H || !bm) continue;
    const e = acc.get(bm), v = ks.map(([a, b]) => pos(a, b)), n = ks.map(([a, b]) => nor(a, b));
    // the diagonal that follows the surface: the shorter of the two
    const d02 = Math.abs(Hh[ks[0][1] * W + ks[0][0]] - Hh[ks[2][1] * W + ks[2][0]]), d13 = Math.abs(Hh[ks[1][1] * W + ks[1][0]] - Hh[ks[3][1] * W + ks[3][0]]);
    const tri = (a, b, c) => {
      const A = v[a], B = v[b], C = v[c], g = [(B[1] - A[1]) * (C[2] - A[2]) - (B[2] - A[2]) * (C[1] - A[1]), (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]), (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])];
      const sw = g[0] * (n[a][0] + n[b][0] + n[c][0]) + g[1] * (n[a][1] + n[b][1] + n[c][1]) + g[2] * (n[a][2] + n[b][2] + n[c][2]) < 0;
      const o = sw ? [a, c, b] : [a, b, c];
      for (const k of o) { e.p.push(...v[k]); e.n.push(...n[k]); }
    };
    if (d02 <= d13) { tri(0, 2, 3); tri(0, 1, 2); } else { tri(0, 1, 3); tri(1, 2, 3); }
  }
}

// ── the figures of the relief ─────────────────────────────────────────────────────────────────────

const cap = (P, mat, a, b, ra, rb, H, fold = null) => P.push({ a, b, ra, rb, H, mat, fold });
const fo = (s, ph = 0, amp = 0.32) => ({ lam: 0.09 + 0.045 * s, amp, ph });

function headAt(P, u, v, s, o) {
  cap(P, o.hair || 'wood_dark', [u, v + 0.012 * s], [u, v + 0.012 * s], 0.078 * s, 0.078 * s, 0.062);
  cap(P, o.skin || 'ivory', [u, v - 0.004 * s], [u, v - 0.004 * s], 0.062 * s, 0.062 * s, 0.07);
  if (o.crown) cap(P, 'paint_ochre', [u - 0.05 * s, v + 0.065 * s], [u + 0.05 * s, v + 0.065 * s], 0.028 * s, 0.028 * s, 0.076);
  if (o.mitre) cap(P, 'paint_white', [u, v + 0.05 * s], [u, v + 0.17 * s], 0.06 * s, 0.025 * s, 0.075);
  if (o.nimbus) cap(P, 'paint_ochre', [u, v], [u, v], 0.14 * s, 0.14 * s, 0.03);
}

/** A standing figure s tall from the hem at v0; o: robe, hold ('book' 'scroll' 'cross' 'none'), lean (−1…1), arms ('down' 'up'), crown, mitre, nimbus, wings. */
export function stand(P, u, v0, s, o = {}) {
  const robe = o.robe, lean = (o.lean || 0) * 0.04 * s, ph = o.ph || 0;
  if (o.wings) for (const sg of [-1, 1]) cap(P, o.wings, [u + sg * 0.09 * s, v0 + 0.6 * s], [u + sg * 0.27 * s, v0 + 1.0 * s], 0.08 * s, 0.025 * s, 0.03, fo(s * 0.5, ph, 0.5));
  cap(P, robe, [u, v0 + 0.03 * s], [u + lean * 0.4, v0 + 0.5 * s], 0.175 * s, 0.12 * s, 0.046, fo(s, ph));
  cap(P, robe, [u + lean * 0.4, v0 + 0.5 * s], [u + lean, v0 + 0.73 * s], 0.11 * s, 0.145 * s, 0.054);
  cap(P, o.skin || 'ivory', [u + lean * 1.2, v0 + 0.79 * s], [u + lean * 1.2, v0 + 0.8 * s], 0.032 * s, 0.032 * s, 0.056);
  // the arms: the near one bent to hold, the other down in the folds
  const up = o.arms === 'up';
  cap(P, robe, [u - 0.125 * s, v0 + 0.71 * s], [u - 0.15 * s, v0 + 0.52 * s], 0.036 * s, 0.032 * s, 0.07, fo(s * 0.3, ph + 0.2, 0.2));
  if (up) cap(P, robe, [u + 0.12 * s, v0 + 0.71 * s], [u + 0.2 * s, v0 + 0.97 * s], 0.036 * s, 0.03 * s, 0.07);
  else cap(P, robe, [u + 0.125 * s, v0 + 0.71 * s], [u + 0.07 * s, v0 + 0.6 * s], 0.036 * s, 0.032 * s, 0.07);
  if (!up) cap(P, robe, [u + 0.07 * s, v0 + 0.6 * s], [u + 0.015 * s, v0 + 0.64 * s], 0.032 * s, 0.028 * s, 0.072);
  cap(P, o.skin || 'ivory', [u - 0.15 * s, v0 + 0.5 * s], [u - 0.15 * s, v0 + 0.5 * s], 0.026 * s, 0.026 * s, 0.075);
  if (up) cap(P, o.skin || 'ivory', [u + 0.2 * s, v0 + 0.99 * s], [u + 0.2 * s, v0 + 0.99 * s], 0.026 * s, 0.026 * s, 0.075);
  else cap(P, o.skin || 'ivory', [u + 0.015 * s, v0 + 0.65 * s], [u + 0.015 * s, v0 + 0.65 * s], 0.026 * s, 0.026 * s, 0.078);
  const hold = o.hold || 'none';
  if (hold === 'book') cap(P, 'paint_ochre', [u - 0.03 * s, v0 + 0.62 * s], [u + 0.03 * s, v0 + 0.62 * s], 0.05 * s, 0.05 * s, 0.082);
  else if (hold === 'scroll') cap(P, 'paint_white', [u + 0.015 * s, v0 + 0.5 * s], [u + 0.015 * s, v0 + 0.78 * s], 0.014 * s, 0.014 * s, 0.086);
  else if (hold === 'cross') cap(P, 'paint_ochre', [u - 0.15 * s, v0 + 0.5 * s], [u - 0.15 * s, v0 + 1.15 * s], 0.016 * s, 0.016 * s, 0.085), cap(P, 'paint_ochre', [u - 0.24 * s, v0 + 1.0 * s], [u - 0.06 * s, v0 + 1.0 * s], 0.014 * s, 0.014 * s, 0.085);
  else if (hold === 'trumpet') cap(P, 'paint_ochre', [u - 0.15 * s, v0 + 0.55 * s], [u - 0.02 * s, v0 + 0.98 * s], 0.012 * s, 0.045 * s, 0.085);
  headAt(P, u + lean * 1.4, v0 + 0.875 * s, s, o);
}

/** A seated figure (the Christ, the Virgin, kings): the legs from the knees, the torso over the lap; o as stand plus throne, show (wounds). */
export function sit(P, u, v0, s, o = {}) {
  const robe = o.robe, ph = o.ph || 0, skin = o.skin || 'ivory';
  if (o.throne) {
    cap(P, o.throne, [u, v0], [u, v0 + 1.05 * s], 0.25 * s, 0.2 * s, 0.026);
    cap(P, o.throne, [u - 0.24 * s, v0 + 0.3 * s], [u + 0.24 * s, v0 + 0.3 * s], 0.05 * s, 0.05 * s, 0.04);
  }
  for (const sg of [-1, 1]) {
    cap(P, robe, [u + sg * 0.14 * s, v0 + 0.31 * s], [u + sg * 0.15 * s, v0 + 0.03 * s], 0.075 * s, 0.065 * s, 0.07, fo(s * 0.5, ph + sg, 0.3));
    cap(P, skin, [u + sg * 0.15 * s, v0 + 0.015 * s], [u + sg * 0.15 * s, v0 + 0.015 * s], 0.04 * s, 0.04 * s, 0.06);
  }
  cap(P, robe, [u - 0.18 * s, v0 + 0.35 * s], [u + 0.18 * s, v0 + 0.35 * s], 0.1 * s, 0.09 * s, 0.082, fo(s * 0.7, ph, 0.28));
  cap(P, robe, [u, v0 + 0.42 * s], [u, v0 + 0.72 * s], 0.12 * s, 0.15 * s, 0.056, fo(s * 0.3, ph + 0.3, 0.12));
  cap(P, skin, [u, v0 + 0.78 * s], [u, v0 + 0.79 * s], 0.03 * s, 0.03 * s, 0.056);
  if (o.show) {
    // the arms raised and open, the palms shown, a wound in each; the wound in the side
    for (const sg of [-1, 1]) {
      cap(P, robe, [u + sg * 0.14 * s, v0 + 0.7 * s], [u + sg * 0.3 * s, v0 + 0.66 * s], 0.036 * s, 0.03 * s, 0.072);
      cap(P, skin, [u + sg * 0.33 * s, v0 + 0.66 * s], [u + sg * 0.33 * s, v0 + 0.66 * s], 0.036 * s, 0.036 * s, 0.078);
      cap(P, 'paint_robe', [u + sg * 0.33 * s, v0 + 0.66 * s], [u + sg * 0.33 * s, v0 + 0.66 * s], 0.012 * s, 0.012 * s, 0.084);
    }
    cap(P, 'paint_robe', [u + 0.06 * s, v0 + 0.55 * s], [u + 0.06 * s, v0 + 0.55 * s], 0.012 * s, 0.012 * s, 0.07);
  } else {
    cap(P, robe, [u - 0.13 * s, v0 + 0.7 * s], [u - 0.15 * s, v0 + 0.46 * s], 0.036 * s, 0.03 * s, 0.072);
    cap(P, robe, [u + 0.13 * s, v0 + 0.7 * s], [u + 0.22 * s, v0 + 0.6 * s], 0.036 * s, 0.03 * s, 0.072);
    cap(P, skin, [u + 0.23 * s, v0 + 0.6 * s], [u + 0.23 * s, v0 + 0.6 * s], 0.028 * s, 0.028 * s, 0.078);
    if (o.hold === 'orb') cap(P, 'paint_ochre', [u + 0.27 * s, v0 + 0.66 * s], [u + 0.27 * s, v0 + 0.66 * s], 0.03 * s, 0.03 * s, 0.088);
  }
  headAt(P, u, v0 + 0.89 * s, s, o);
}

/** A nude figure rising from a tomb: head, torso, arms lifted. */
export function rising(P, u, v0, s, o = {}) {
  const skin = o.skin || 'ivory';
  cap(P, skin, [u, v0], [u, v0 + 0.55 * s], 0.13 * s, 0.14 * s, 0.056);
  const l = o.lean || 0;
  cap(P, skin, [u - 0.14 * s, v0 + 0.5 * s], [u - 0.22 * s - l * 0.03, v0 + 0.85 * s], 0.04 * s, 0.032 * s, 0.07);
  cap(P, skin, [u + 0.14 * s, v0 + 0.5 * s], [u + 0.2 * s + l * 0.03, v0 + 0.78 * s], 0.04 * s, 0.032 * s, 0.07);
  headAt(P, u + l * 0.03, v0 + 0.68 * s, s * 1.15, { skin, hair: o.hair });
}

/** A kneeling figure facing dir (+1: toward +u): the skirt along the ground, the torso upright, the hands raised. */
export function kneel(P, u, v0, s, dir, o = {}) {
  const robe = o.robe;
  cap(P, robe, [u - dir * 0.34 * s, v0 + 0.09 * s], [u + dir * 0.02 * s, v0 + 0.2 * s], 0.1 * s, 0.14 * s, 0.05, fo(s * 0.5, o.ph || 0, 0.3));
  cap(P, robe, [u, v0 + 0.22 * s], [u + dir * 0.02 * s, v0 + 0.62 * s], 0.13 * s, 0.12 * s, 0.056);
  cap(P, robe, [u + dir * 0.04 * s, v0 + 0.55 * s], [u + dir * 0.2 * s, v0 + 0.68 * s], 0.035 * s, 0.03 * s, 0.07);
  cap(P, 'ivory', [u + dir * 0.22 * s, v0 + 0.69 * s], [u + dir * 0.22 * s, v0 + 0.69 * s], 0.03 * s, 0.03 * s, 0.076);
  headAt(P, u + dir * 0.07 * s, v0 + 0.76 * s, s, o);
}

/** A crouching devil: a hairy mass with horns, a long arm. */
export function devil(P, u, v0, s, dir) {
  cap(P, 'wood_dark', [u, v0 + 0.2 * s], [u + dir * 0.05 * s, v0 + 0.42 * s], 0.22 * s, 0.16 * s, 0.06, { lam: 0.07, amp: 0.4, ph: u * 7 });
  cap(P, 'wood_dark', [u + dir * 0.06 * s, v0 + 0.55 * s], [u + dir * 0.06 * s, v0 + 0.55 * s], 0.1 * s, 0.1 * s, 0.068);
  for (const sg of [-1, 1]) cap(P, 'iron', [u + dir * 0.06 * s + sg * 0.06 * s, v0 + 0.6 * s], [u + dir * 0.06 * s + sg * 0.1 * s, v0 + 0.78 * s], 0.025 * s, 0.006 * s, 0.075);
  cap(P, 'wood_dark', [u - dir * 0.1 * s, v0 + 0.4 * s], [u + dir * 0.36 * s, v0 + 0.5 * s], 0.045 * s, 0.035 * s, 0.07);
  cap(P, 'wood_dark', [u - dir * 0.14 * s, v0 + 0.05 * s], [u - dir * 0.05 * s, v0 + 0.26 * s], 0.06 * s, 0.07 * s, 0.062);
}

/** The tomb: a lid in cut stone with a moulded edge. */
export function tomb(P, u, v0, w) { cap(P, 'limestone_carved', [u - w / 2, v0 + 0.05], [u + w / 2, v0 + 0.05], 0.07, 0.07, 0.055); cap(P, 'limestone_carved', [u - w / 2, v0 + 0.02], [u + w / 2, v0 + 0.02], 0.03, 0.03, 0.065); }

export { hash3 };

// ── the three portals' scenes ───────────────────────────────────────────────────────────────────────
const ROBES = ['paint_robe', 'paint_blue', 'paint_ochre', 'cloth_red', 'paint_white', 'cloth_green'];

/**
 * The relief of a portal: the two lintels and the tympanum. q: { X (the wall face), zc, wN (the door's half-width), L1 (the door's head), lintel,
 * ty (the springing), arch (u half-width at height above the springing → m), apex (y of the arch's crown), scheme }.
 */
export function portalRelief(acc, q) {
  const { X, zc, wN, L1, lintel, ty, apex, scheme, arch } = q;
  const L2 = L1 + lintel, L3 = L2 + lintel * 1.15;
  const rob = (u, v, k = 0) => ROBES[Math.floor(hash3(u, v, k) * ROBES.length)];
  const hairOf = (u, v) => { const r = hash3(u, v, 9); return r < 0.2 ? 'paint_white' : r < 0.4 ? 'paint_ochre' : 'wood_dark'; };
  const fig = (P, kind, u, v, s, o = {}, dir = 1) => { const oo = { robe: rob(u, v), hair: hairOf(u, v), ph: hash3(u, v, 3) * 6, ...o }; return kind === kneel ? kneel(P, u, v, s, dir, oo) : kind(P, u, v, s, oo); };
  const reg = (v0, v1, P, wide = wN - 0.1) => relief(acc, { X, zc, u0: -wide, u1: wide, y0: v0, y1: v1, cell: 0.045, prims: P, inside: (u, y) => Math.abs(u) <= wide && y >= v0 && y <= v1 });
  const A = [L1 + 0.17, L2 - 0.17], B = [L2 + 0.17, L3 - 0.17], T0 = L3 + 0.03;
  const hA = A[1] - A[0], hB = B[1] - B[0];
  const P1 = [], P2 = [], P3 = [];
  const slots = (n, w = wN - 0.35) => Array.from({ length: n }, (_, i) => -w + (i + 0.5) * 2 * w / n);
  if (scheme === 'judgement') {
    // the dead rise from their tombs, angels with trumpets at either end; Michael weighs the souls, the elect to his right (the viewer's left)
    // toward Abraham, the damned to his left driven by devils toward the cauldron; above, Christ shows his wounds between the Virgin and Saint John
    // and the angels with the instruments of the Passion
    const us = slots(9);
    us.forEach((u, i) => {
      if (i === 0 || i === 8) { fig(P1, stand, u, A[0], hA * 0.98, { wings: 'paint_ochre', hold: 'trumpet', lean: i === 0 ? 1 : -1, arms: 'down' }); return; }
      tomb(P1, u, A[0], 0.5);
      fig(P1, rising, u, A[0] + 0.05, hA * 0.8, { lean: hash3(u, 1, 1) * 2 - 1 });
    });
    // the weighing
    fig(P2, stand, 0, B[0], hB * 0.98, { wings: 'paint_blue', hold: 'none', arms: 'down', nimbus: true });
    cap(P2, 'iron', [-0.55, B[0] + hB * 0.78], [0.55, B[0] + hB * 0.78], 0.016, 0.016, 0.09);
    for (const sg of [-1, 1]) { cap(P2, 'paint_ochre', [sg * 0.52, B[0] + hB * 0.55], [sg * 0.52, B[0] + hB * 0.55], 0.14, 0.14, 0.088); cap(P2, 'iron', [sg * 0.52, B[0] + hB * 0.78], [sg * 0.52, B[0] + hB * 0.58], 0.008, 0.008, 0.085); cap(P2, 'ivory', [sg * 0.52, B[0] + hB * 0.62], [sg * 0.52, B[0] + hB * 0.62], 0.05, 0.05, 0.095); }
    [-1.05, -1.6, -2.1].forEach((u, i) => fig(P2, stand, u, B[0], hB * 0.92, { lean: -1, crown: i === 1, mitre: i === 2, hold: i === 0 ? 'none' : 'scroll' }));
    fig(P2, sit, -2.62, B[0], hB * 0.85, { robe: 'paint_white', throne: 'limestone_carved' });
    [1.05, 1.65, 2.2].forEach((u, i) => fig(P2, stand, u, B[0], hB * 0.88, { lean: 1, arms: 'down', robe: 'wood_dark', hair: 'wood_dark' }));
    [1.35, 1.95].forEach((u) => devil(P2, u, B[0], hB * 0.7, -1));
    cap(P2, 'iron', [2.72, B[0] + 0.3], [2.72, B[0] + 0.34], 0.26, 0.22, 0.09);
    // the tympanum
    const ht = apex - T0 - 0.3;
    fig(P3, sit, 0, T0 + 0.1, ht * 0.92, { robe: 'paint_white', throne: 'paint_ochre', show: true, nimbus: true });
    fig(P3, kneel, -1.35, T0 + 0.05, ht * 0.42, { robe: 'paint_blue' }, 1);
    fig(P3, kneel, 1.35, T0 + 0.05, ht * 0.42, { robe: 'paint_robe' }, -1);
    for (const sg of [-1, 1]) {
      fig(P3, stand, sg * 2.1, T0 + 0.12, ht * 0.5, { wings: 'paint_blue', hold: sg < 0 ? 'cross' : 'trumpet', lean: -sg });
      fig(P3, stand, sg * 1.85, T0 + ht * 0.62, ht * 0.3, { wings: 'paint_ochre', hold: sg < 0 ? 'none' : 'scroll', lean: -sg });
    }
  } else if (scheme === 'virgin') {
    // prophets and kings by the ark; the Virgin's death among the apostles, Christ taking her soul; her coronation
    const us = slots(7);
    us.forEach((u, i) => {
      if (i === 3) { cap(P1, 'paint_ochre', [u - 0.4, A[0] + 0.28], [u + 0.4, A[0] + 0.28], 0.22, 0.22, 0.07); cap(P1, 'paint_white', [u - 0.4, A[0] + 0.5], [u + 0.4, A[0] + 0.5], 0.05, 0.05, 0.08); return; }
      fig(P1, stand, u, A[0], hA * 0.97, { crown: i === 1 || i === 5 || i === 2, hold: i === 0 || i === 4 ? 'scroll' : 'book', lean: u < 0 ? 1 : -1 });
    });
    const ap = slots(9);
    ap.forEach((u, i) => { if (i === 4) return; fig(P2, stand, u, B[0] + (Math.abs(i - 4) === 1 ? 0 : 0.0), hB * (Math.abs(i - 4) <= 1 ? 0.8 : 0.96), { lean: u < 0 ? 1 : -1, hold: i % 3 === 0 ? 'book' : 'none', nimbus: false }); });
    cap(P2, 'paint_ochre', [-0.8, B[0] + 0.2], [0.8, B[0] + 0.2], 0.16, 0.16, 0.06);
    cap(P2, 'paint_white', [-0.75, B[0] + 0.3], [0.75, B[0] + 0.32], 0.13, 0.13, 0.078, fo(1, 0, 0.3));
    cap(P2, 'ivory', [-0.7, B[0] + 0.45], [-0.7, B[0] + 0.45], 0.075, 0.075, 0.09);
    fig(P2, stand, 0, B[0] + hB * 0.35, hB * 0.62, { robe: 'paint_blue', nimbus: true, hold: 'none' });
    const ht = apex - T0 - 0.3;
    fig(P3, sit, -0.62, T0 + 0.1, ht * 0.6, { robe: 'paint_blue', throne: 'paint_ochre', nimbus: true });
    fig(P3, sit, 0.62, T0 + 0.1, ht * 0.58, { robe: 'cloth_red', throne: 'paint_ochre', crown: true });
    fig(P3, stand, 0, T0 + ht * 0.66, ht * 0.26, { wings: 'paint_white', hold: 'none', arms: 'up' });
    for (const sg of [-1, 1]) { fig(P3, stand, sg * 1.8, T0 + 0.1, ht * 0.5, { wings: 'paint_ochre', hold: 'none', lean: -sg }); fig(P3, stand, sg * 1.45, T0 + ht * 0.58, ht * 0.27, { wings: 'paint_blue', lean: -sg }); }
  } else {
    // Saint Anne: the story of Joachim and Anne and of Mary below; the Virgin enthroned with the Child, angels, the bishop and the king kneeling
    const us = slots(10);
    us.forEach((u, i) => { fig(P1, stand, u, A[0], hA * (i % 4 === 0 ? 0.78 : 0.96), { lean: u < 0 ? 1 : -1, hold: i % 3 === 1 ? 'scroll' : 'none', wings: i === 4 ? 'paint_ochre' : undefined }); });
    cap(P1, 'paint_white', [-2.5, A[0] + 0.12], [-1.7, A[0] + 0.12], 0.1, 0.1, 0.06);
    slots(8).forEach((u, i) => { fig(P2, stand, u, B[0], hB * (i === 3 ? 0.78 : 0.96), { lean: i < 4 ? 1 : -1, hold: i % 4 === 2 ? 'book' : 'none', wings: i === 1 ? 'paint_blue' : undefined }); });
    cap(P2, 'paint_ochre', [-0.2, B[0] + 0.2], [0.8, B[0] + 0.2], 0.17, 0.17, 0.06);
    cap(P2, 'paint_white', [-0.2, B[0] + 0.3], [0.8, B[0] + 0.3], 0.13, 0.13, 0.076, fo(1, 0.5, 0.3));
    const ht = apex - T0 - 0.3;
    fig(P3, sit, 0, T0 + 0.1, ht * 0.9, { robe: 'paint_blue', throne: 'paint_ochre', crown: true, nimbus: true, hold: 'orb' });
    // the Child on her knee
    cap(P3, 'paint_white', [0.12 * ht * 0.9, T0 + 0.1 + 0.42 * ht * 0.9], [0.12 * ht * 0.9, T0 + 0.1 + 0.6 * ht * 0.9], 0.07 * ht * 0.9, 0.06 * ht * 0.9, 0.09);
    cap(P3, 'ivory', [0.12 * ht * 0.9, T0 + 0.1 + 0.68 * ht * 0.9], [0.12 * ht * 0.9, T0 + 0.1 + 0.68 * ht * 0.9], 0.045 * ht * 0.9, 0.045 * ht * 0.9, 0.096);
    fig(P3, stand, -1.55, T0 + 0.1, ht * 0.5, { wings: 'paint_ochre', hold: 'none', lean: 1 });
    fig(P3, stand, -1.2, T0 + ht * 0.58, ht * 0.27, { wings: 'paint_blue', lean: 1 });
    fig(P3, kneel, 1.15, T0 + 0.05, ht * 0.46, { robe: 'cloth_red', mitre: true }, -1);
    fig(P3, kneel, 1.95, T0 + 0.05, ht * 0.46, { robe: 'paint_blue', crown: true }, -1);
    fig(P3, stand, 2.45, T0 + ht * 0.3, ht * 0.3, { wings: 'paint_ochre', lean: -1 });
  }
  reg(A[0] - 0.02, A[1] + 0.02, P1); reg(B[0] - 0.02, B[1] + 0.02, P2);
  relief(acc, { X, zc, u0: -wN + 0.1, u1: wN - 0.1, y0: T0, y1: apex, cell: 0.036, prims: P3, inside: (u, y) => y >= T0 && Math.abs(u) <= (y < ty ? wN - 0.1 : arch(y - ty) - 0.2) && y < apex - 0.15 });
}
