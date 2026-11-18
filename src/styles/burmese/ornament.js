// The ornament of the Ananda (docs/settlements/bagan.md §12): the four standing Buddhas (lotus pedestal, pleated robe, face, hands in the pose of each), the 80 stone reliefs of the corridors
// each in its own pilastered frame with the small stone images above, the glazed plaques as single tiles, the pierced stone windows, the carved teak doors and the finials of the roofs.
// Every helper draws into the frame's bag; local (u, v) of a frame F (kit.js).
import { lathe, frustum, box } from '../../core/geom.js';
import { pointedNiche } from './flame.js';

const CREAM = 'stucco_cream', GILT = 'gilt_bronze';

/** A small four-sided pyramid (a merlon, a finial of a gable's step): half width hw at y, height h. */
export function pyramid(bag, mat, x, y, z, hw, h) {
  const i = hw * 0.78;
  bag.add(mat, frustum([x - hw, z - hw, x + hw, z + hw], y, y + h, i, i, i, i));
}

/** The glazed plaques of a terrace: a cream band round the square (centre c, half h) from y0, hgt high, the plaques standing proud of it one by one (every ninth in white glaze). */
export function plaqueBand(bag, c, h, y0, hgt, o = {}) {
  const [cx, cz] = c, e = 0.04, w = o.w ?? 0.5, st = o.step ?? 0.64, py0 = y0 + (hgt - w) / 2, py1 = py0 + w, mat = o.mat ?? 'glaze_green';
  bag.add(o.back ?? CREAM, box(cx - h - e, y0, cz - h - e, cx + h + e, y0 + hgt, cz + h + e));
  let n = 0;
  const n1 = Math.max(2, Math.floor((2 * h - 1.0) / st));
  for (let i = 0; i < n1; i++) {
    const a = -h + 0.5 + (i + 0.5) * ((2 * h - 1.0) / n1), m = n++ % 9 === 8 ? 'glaze_white' : mat;
    bag.add(m, box(cx + a - w / 2, py0, cz - h - e - 0.05, cx + a + w / 2, py1, cz - h - e));
    bag.add(m, box(cx + a - w / 2, py0, cz + h + e, cx + a + w / 2, py1, cz + h + e + 0.05));
    bag.add(m, box(cx - h - e - 0.05, py0, cz + a - w / 2, cx - h - e, py1, cz + a + w / 2));
    bag.add(m, box(cx + h + e, py0, cz + a - w / 2, cx + h + e + 0.05, py1, cz + a + w / 2));
  }
}

/** A row of plaques along a straight run of a frame (u0..u1) on the face v (dir: +1 the plaque stands out toward +v). */
export function plaqueRow(F, u0, u1, y0, hgt, v, dir = 1) {
  const w = 0.5, st = 0.64, n = Math.max(1, Math.floor((u1 - u0) / st)), py0 = y0 + (hgt - w) / 2;
  F.b(CREAM, u0, y0, dir > 0 ? v : v - 0.04, u1, y0 + hgt, dir > 0 ? v + 0.04 : v, false);
  for (let i = 0; i < n; i++) {
    const a = u0 + (i + 0.5) * ((u1 - u0) / n);
    F.b(i % 9 === 8 ? 'glaze_white' : 'glaze_green', a - w / 2, py0, dir > 0 ? v + 0.04 : v - 0.09, a + w / 2, py0 + w, dir > 0 ? v + 0.09 : v - 0.04, false);
  }
}

/** A blind arched niche of a wall's frieze: the dark recess, a cream frame and a pointed cap (the kudu arch); face at v looking toward `dir`. */
export function kuduNiche(F, u, y, v, dir, w = 0.8, h = 1.1, mat = 'lacquer_black') {
  pointedNiche(F, u, y, v, dir, w, h + 0.32, mat, 'stucco_ochre');
}

/**
 * One of the 80 stone reliefs of the corridors: a slab of volcanic stone, 0.74 m wide and 1.07 high, in a frame of two pilasters, a sill and a stepped pointed cap, a seated Buddha cut in it.
 * The wall face is at v; the panel stands out toward `dir`; y0 the slab's foot.
 */
export function reliefPanel(F, u, y0, v, dir, k = 0, figure = true) {
  const hw = 0.37, t = 0.05, P = (a, b) => (dir > 0 ? [v + a, v + b] : [v - b, v - a]);
  const put = (mat, a0, ya, b0, a1, yb, b1) => { const [p, q] = P(b0, b1); F.b(mat, a0, ya, p, a1, yb, q, false); };
  put(CREAM, u - hw - 0.14, y0 - 0.12, 0, u + hw + 0.14, y0, 0.16);                           // the sill
  for (const sg of [-1, 1]) put(CREAM, sg < 0 ? u - hw - 0.14 : u + hw, y0, 0, sg < 0 ? u - hw : u + hw + 0.14, y0 + 1.25, 0.13);   // the pilasters
  put('sandstone_relief', u - hw, y0, 0, u + hw, y0 + 1.07, t);                                // the slab
  if (figure) reliefFigure(F, u, y0, v, dir, k);
  // the stepped pointed cap
  put(CREAM, u - hw - 0.14, y0 + 1.25, 0, u + hw + 0.14, y0 + 1.37, 0.16);
  put(CREAM, u - 0.3, y0 + 1.37, 0.01, u + 0.3, y0 + 1.47, 0.14);
  put(CREAM, u - 0.14, y0 + 1.47, 0.02, u + 0.14, y0 + 1.58, 0.12);
}

/** The first form of a relief's seated Buddha (stacked plates), drawn beyond the modelled scenes' distance. */
export function reliefFigure(F, u, y0, v, dir, k = 0) {
  const t = 0.05, P = (a, b) => (dir > 0 ? [v + a, v + b] : [v - b, v - a]);
  const put = (mat, a0, ya, b0, a1, yb, b1) => { const [p, q] = P(b0, b1); F.b(mat, a0, ya, p, a1, yb, q, false); };
  put('sandstone_dressed', u - 0.24, y0 + 0.1, t, u + 0.24, y0 + 0.36, t + 0.035);
  put('sandstone_dressed', u - 0.15, y0 + 0.36, t, u + 0.15, y0 + 0.66, t + 0.035);
  put('sandstone_dressed', u - 0.075, y0 + 0.66, t, u + 0.075, y0 + 0.82, t + 0.035);
  put('sandstone_dressed', u - 0.03, y0 + 0.82, t, u + 0.03, y0 + 0.9, t + 0.035);
  put('sandstone_dressed', u - 0.2, y0 + 0.58, t, u + 0.2, y0 + 0.62 + (k % 2) * 0.04, t + 0.02);
}

/** The small stone images of a corridor wall: a row of little niches with a seated figure each, between u0 and u1 at height y, the wall face at v. */
export function imageRow(F, u0, u1, y, v, dir, step = 0.46) {
  const n = Math.max(1, Math.floor((u1 - u0) / step));
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * ((u1 - u0) / n), a = dir > 0 ? v : v - 0.06, b = dir > 0 ? v + 0.06 : v;
    F.b('wood_dark', u - 0.15, y, a, u + 0.15, y + 0.4, b, false);
    F.b('sandstone_dressed', u - 0.075, y + 0.04, dir > 0 ? v + 0.02 : v - 0.075, u + 0.075, y + 0.24, dir > 0 ? v + 0.075 : v - 0.02, false);
    F.b('sandstone_dressed', u - 0.035, y + 0.24, dir > 0 ? v + 0.025 : v - 0.07, u + 0.035, y + 0.32, dir > 0 ? v + 0.07 : v - 0.025, false);
  }
}

/** A pierced stone window: the grille of vertical bars and two rails in the outer face of its opening (centre u, from y0 to y1, the face at v, standing in toward `dir`). */
export function grille(F, u, w, y0, y1, v, dir) {
  const n = 4, a = dir > 0 ? v : v - 0.14, b = dir > 0 ? v + 0.14 : v;
  for (let i = 0; i < n; i++) { const x = u - w / 2 + (w * (i + 0.5)) / n; F.b('sandstone_dressed', x - 0.03, y0, a + 0.03, x + 0.03, y1, b - 0.03, false); }
  for (const y of [y0, (y0 + y1) / 2, y1 - 0.06]) F.b('sandstone_dressed', u - w / 2, y, a, u + w / 2, y + 0.06, b, false);
}

/** The two leaves of a carved teak door folded back against the reveals of a passage (centre u, clear width w): panelled, with studs of gilt. v0..v1 the length along the passage. */
export function doorLeaves(F, u, w, y0, y1, v0, v1) {
  for (const sg of [-1, 1]) {
    const a = sg < 0 ? u - w / 2 : u + w / 2 - 0.14, b = sg < 0 ? u - w / 2 + 0.14 : u + w / 2, inner = sg < 0 ? b : a;
    F.b('wood_dark', a, y0, v0, b, y1, v1, false);
    const rows = 4, cols = 2, pw = (v1 - v0 - 0.4) / cols, ph = (y1 - y0 - 0.5) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p0 = v0 + 0.15 + c * (pw + 0.1), q0 = y0 + 0.2 + r * (ph + 0.0);
      const x0 = sg < 0 ? inner : inner - 0.03, x1 = sg < 0 ? inner + 0.03 : inner;
      F.b('wood_ochre', x0, q0 + 0.05, p0, x1, q0 + ph - 0.05, p0 + pw, false);
      F.b(GILT, sg < 0 ? inner + 0.025 : inner - 0.045, q0 + ph / 2 - 0.04, p0 + pw / 2 - 0.04, sg < 0 ? inner + 0.045 : inner - 0.025, q0 + ph / 2 + 0.04, p0 + pw / 2 + 0.04, false);
    }
  }
}

/**
 * A standing Buddha facing +v of the frame at (u, v), total height H with its throne (2.4 m): the throne of a lacquered base, a waist with gilt panels and a gilded rim, a lotus pedestal, the pleated
 * robe with the sash across the chest, the neck's rings, the face (brow, half-closed eyes, nose, lips, the long ears), the curled hair, the ushnisha and its flame, the arched halo of rays and the hands
 * of the pose: 'dhamma' (both hands before the chest: the first sermon, Kakusandha and Kassapa), 'hang' (both arms down, palms out: Konagamana), 'abhaya' (the right hand raised: Gautama).
 */
export function buddha(F, u, v, H, throne = 2.4, pose = 'abhaya', part = 'all') {
  const B = F.base ?? 0, k = (H - throne) / 9.75, by0 = B + throne;
  // the throne
  if (part !== 'figure') {
  F.b('lacquer_red', u - 2.3, B, v - 1.5, u + 2.3, B + 0.55, v + 1.6, false);
  F.b(GILT, u - 2.34, B + 0.55, v - 1.54, u + 2.34, B + 0.65, v + 1.64, false);
  F.b('lacquer_red', u - 2.0, B + 0.65, v - 1.2, u + 2.0, B + 1.85, v + 1.3, false);
  for (const [a, b] of [[-1.5, -0.6], [-0.4, 0.4], [0.6, 1.5]]) F.b(GILT, u + a, B + 0.9, v + 1.3, u + b, B + 1.6, v + 1.34, false);
  for (const sg of [-1, 1]) for (const [a, b] of [[-0.9, -0.1], [0.2, 1.0]]) F.b(GILT, sg < 0 ? u - 2.04 : u + 2.0, B + 0.9, v + a, sg < 0 ? u - 2.0 : u + 2.04, B + 1.6, v + b, false);
  F.b(GILT, u - 2.1, B + 1.85, v - 1.3, u + 2.1, B + 2.0, v + 1.4, false);
  F.b('lacquer_red', u - 1.9, B + 2.0, v - 1.1, u + 1.9, by0, v + 1.2, false);
  for (let i = 0; i < 9; i++) pyramid(F.bag, GILT, u - 1.8 + i * 0.45, B + 2.0, v + 1.18, 0.15, 0.28);
  F.col.rect(F.R(u - 2.3, v - 1.5, u + 2.3, v + 1.6), B, B + H);
  }
  if (part === 'throne') return;
  // the lotus pedestal
  const [px, pz] = F.pt(u, v + 0.05), by = by0 + 0.34 * k, W = (prof, mat, seg = 16, mod = null, y = by) => F.bag.add(mat, lathe(prof.map(([r, h]) => [r * k, h * k]), seg, mod, px, y, pz));
  F.bag.add(GILT, lathe([[1.5, 0], [1.55, 0.1], [1.3, 0.24], [1.15, 0.3], [1.0, 0.34]].map(([r, h]) => [r * k, h * k]), 28, (th, i) => (i >= 1 && i <= 3 ? 1 + 0.07 * Math.cos(th * 14) : 1), px, by0, pz));
  // the body: the robe's folds run down it
  const robe = [[1.35, 0], [1.28, 0.4], [1.05, 2.2], [0.98, 3.8], [1.05, 5.0], [1.5, 5.8], [1.42, 6.15], [0.62, 6.35], [0.42, 6.5]];
  W(robe, 'gold', 36, (th, i) => 1 + (i <= 4 ? 0.05 : 0.018) * Math.cos(th * 12));
  // the sash over the left shoulder across the chest, the hem at the feet
  for (let i = 0; i < 7; i++) F.b(GILT, u - 1.05 * k + i * 0.3 * k, by + (5.95 - i * 0.36) * k, v + 0.9 * k, u - 0.75 * k + i * 0.3 * k, by + (5.55 - i * 0.36) * k, v + 1.08 * k, false);
  W([[1.37, 0.25], [1.37, 0.4], [1.3, 0.45], [1.3, 0.3]], GILT, 28);
  // the neck's three rings
  W([[0.5, 6.42], [0.56, 6.46], [0.5, 6.5]], GILT, 12);
  // the head: the face, the hair in rows of curls, the ushnisha, the flame
  W([[0.42, 6.5], [0.62, 6.9], [0.74, 7.3], [0.78, 7.6]], GILT, 16);
  W([[0.78, 7.5], [0.8, 7.8], [0.74, 8.1], [0.5, 8.4], [0.32, 8.62]], 'lacquer_black', 24, (th, i) => 1 + 0.045 * Math.cos(th * 12) * Math.cos(i * 2.4));
  W([[0.32, 8.6], [0.34, 8.85], [0.22, 9.05], [0.001, 9.12]], 'gold', 12);
  W([[0.1, 9.05], [0.14, 9.2], [0.07, 9.4], [0.001, 9.55]], GILT, 8);
  const fb = (mat, u0, y0, v0, u1, y1, v1) => F.b(mat, u + u0 * k, by + y0 * k, v + v0 * k, u + u1 * k, by + y1 * k, v + v1 * k, false);
  fb('lacquer_black', -0.4, 7.27, 0.66, -0.12, 7.32, 0.76); fb('lacquer_black', 0.12, 7.27, 0.66, 0.4, 7.32, 0.76);       // the brows
  fb('lacquer_black', -0.36, 7.13, 0.66, -0.14, 7.18, 0.75); fb('lacquer_black', 0.14, 7.13, 0.66, 0.36, 7.18, 0.75);     // the eyes, lids lowered
  fb(GILT, -0.06, 6.93, 0.68, 0.06, 7.2, 0.82);                                                                              // the nose
  fb('lacquer_red', -0.14, 6.76, 0.66, 0.14, 6.83, 0.76);                                                                    // the lips
  for (const sg of [-1, 1]) fb(GILT, sg < 0 ? -0.9 : 0.76, 6.55, -0.12, sg < 0 ? -0.76 : 0.9, 7.45, 0.12);                  // the long ears
  // the halo: arched rays on a stem behind the head
  fb(GILT, -0.12, 6.2, -1.0, 0.12, 8.0, -0.6);
  for (let i = -9; i <= 9; i++) {
    const t = Math.abs(i) / 9.6, top = 8.5 + 1.15 * (1 - Math.pow(t, 1.6)) + (i % 2 ? 0.28 : 0);
    fb(i % 2 ? 'gold' : GILT, i * 0.17 - 0.065, 6.45 + t * 0.9, -1.04, i * 0.17 + 0.065, top, -0.94);
  }
  fb(GILT, -1.65, 6.35, -1.04, 1.65, 6.5, -0.94);
  // the arms and hands
  const gold = (a, b, c, d, e, f) => fb('gold', a, b, c, d, e, f);
  const arm = (s) => gold(s * 1.3, 4.3, 0.05, s * 1.7, 5.75, 0.55);
  if (pose === 'dhamma') {
    for (const s of [-1, 1]) { arm(s); gold(Math.min(s * 1.3, s * 1.7), 4.3, 0.05, Math.max(s * 1.3, s * 1.7), 4.8, 1.4); gold(Math.min(s * 1.7, s * 0.35), 4.35, 1.0, Math.max(s * 1.7, s * 0.35), 4.75, 1.4); }
    gold(-0.5, 4.5, 1.3, 0.05, 5.4, 1.42); gold(0.0, 4.3, 1.2, 0.5, 5.2, 1.32);
  } else if (pose === 'hang') {
    for (const s of [-1, 1]) { gold(s * 1.3, 3.2, 0.05, s * 1.7, 5.75, 0.55); gold(Math.min(s * 1.25, s * 1.8), 2.4, 0.4, Math.max(s * 1.25, s * 1.8), 3.3, 0.55); }
  } else {
    gold(-1.7, 3.0, 0.05, -1.3, 5.75, 0.55); gold(-1.75, 2.85, 0.05, -1.15, 3.4, 0.7);
    gold(1.3, 4.3, 0.05, 1.7, 5.75, 0.55); gold(1.0, 4.4, 0.55, 1.5, 6.1, 1.0); gold(0.85, 6.0, 0.95, 1.65, 7.0, 1.12);
  }
}

export { lathe };
