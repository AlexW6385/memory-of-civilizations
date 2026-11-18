// Low relief as one continuous modelled surface (docs/settlements/florence.md §14): a height field over a panel, to which
// rounded forms are added — heads as domes, limbs as tapered rods, drapery as cloth whose folds run down the body,
// buildings as stepped blocks with their arches cut in — and which comes out as a smooth mesh (normals from the
// surface's slope) rising 2–8 cm from the ground, only where it rises (the ground plate is the wall's own). The
// panel's frame is x right, y up, in metres from its lower-left corner; heights above the ground in metres.
// Nothing is random: variety comes from the index of the figure or the panel.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

export class Field {
  constructor(w, h, cell) { this.w = w; this.h = h; this.cell = cell; this.nx = Math.ceil(w / cell) + 1; this.ny = Math.ceil(h / cell) + 1; this.H = new Float32Array(this.nx * this.ny); }
  /** Visit the cells in the box x0..x1, y0..y1: fn(i, j, x, y). */
  each(x0, y0, x1, y1, fn) {
    const c = this.cell, i0 = Math.max(0, Math.floor(x0 / c)), i1 = Math.min(this.nx - 1, Math.ceil(x1 / c)), j0 = Math.max(0, Math.floor(y0 / c)), j1 = Math.min(this.ny - 1, Math.ceil(y1 / c));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(i, j, i * c, j * c);
  }
  up(i, j, v) { const k = j * this.nx + i; if (v > this.H[k]) this.H[k] = v; }
  set(i, j, v) { this.H[j * this.nx + i] = v; }
  /** A dome: ellipse centre (cx, cy), radii rx, ry, height h (a rounded profile, steep at the rim). */
  dome(cx, cy, rx, ry, h) {
    this.each(cx - rx, cy - ry, cx + rx, cy + ry, (i, j, x, y) => { const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (q < 1) this.up(i, j, h * (1 - q) ** 0.62); });
  }
  /** A rod from (x0, y0) to (x1, y1), radius r0 → r1, height h0 → h1; fold(x, y) scales the height (cloth). */
  rod(x0, y0, x1, y1, r0, r1, h0, h1, fold = null) {
    const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1e-9, R = Math.max(r0, r1);
    this.each(Math.min(x0, x1) - R, Math.min(y0, y1) - R, Math.max(x0, x1) + R, Math.max(y0, y1) + R, (i, j, x, y) => {
      const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l2)), px = x0 + dx * t, py = y0 + dy * t, r = r0 + (r1 - r0) * t, d = Math.hypot(x - px, y - py);
      if (d < r) this.up(i, j, (h0 + (h1 - h0) * t) * (1 - (d / r) ** 2) ** 0.62 * (fold ? fold(x, y) : 1));
    });
  }
  /** A block x0..x1 × y0..y1 of height h with rounded shoulders (width e). */
  block(x0, y0, x1, y1, h, e = 0.01) {
    this.each(x0, y0, x1, y1, (i, j, x, y) => { const m = Math.min(x - x0, x1 - x, y - y0, y1 - y); this.up(i, j, m >= e ? h : h * Math.sqrt(Math.max(0, 1 - ((e - m) / e) ** 2))); });
  }
  /** Overwrite the cells of the box where inside(x, y) with v (an opening cut in a wall). */
  cut(x0, y0, x1, y1, inside, v = 0) { this.each(x0, y0, x1, y1, (i, j, x, y) => { if (inside(x, y)) this.set(i, j, v); }); }
  /** The mesh in the frame of a face (u, y, d): origin (u0, y0), the ground at d0, only the cells that rise above `eps`. */
  /** One pass of a 3 × 3 blur over the surface (rounds the grid's staircase). */
  smooth() { const { nx, ny, H } = this, o = H.slice(), g = (i, j) => o[Math.max(0, Math.min(ny - 1, j)) * nx + Math.max(0, Math.min(nx - 1, i))]; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) H[j * nx + i] = (4 * g(i, j) + 2 * (g(i - 1, j) + g(i + 1, j) + g(i, j - 1) + g(i, j + 1)) + g(i - 1, j - 1) + g(i + 1, j - 1) + g(i - 1, j + 1) + g(i + 1, j + 1)) / 16; }
  geometry(u0, y0, d0, eps = 0.0008) {
    this.smooth();
    const { nx, ny, H, cell: c } = this, pos = [], nor = [], idx = [], at = new Map();
    const h = (i, j) => H[Math.max(0, Math.min(ny - 1, j)) * nx + Math.max(0, Math.min(nx - 1, i))];
    const vert = (i, j) => {
      const key = j * nx + i; let n = at.get(key); if (n !== undefined) return n;
      const gx = (h(i + 1, j) - h(i - 1, j)) / (2 * c), gy = (h(i, j + 1) - h(i, j - 1)) / (2 * c), l = Math.hypot(gx, gy, 1);
      pos.push(u0 + i * c, y0 + j * c, d0 + h(i, j)); nor.push(-gx / l, -gy / l, 1 / l); n = pos.length / 3 - 1; at.set(key, n); return n;
    };
    for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
      const a = h(i, j), b = h(i + 1, j), cc = h(i + 1, j + 1), d = h(i, j + 1);
      if (a < eps && b < eps && cc < eps && d < eps) continue;
      const A = vert(i, j), B = vert(i + 1, j), C = vert(i + 1, j + 1), D = vert(i, j + 1);
      if (Math.abs(a - cc) < Math.abs(b - d)) idx.push(A, B, C, A, C, D); else idx.push(A, B, D, B, C, D);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(nor), 3));
    g.setIndex(idx);
    return g;
  }
}

const folds = (n, a, p) => (x) => 1 + a * Math.cos(n * x + p);

/**
 * A figure in relief, feet at (x, yb), height H, relief s (the head's height above the ground), pose 'stand' | 'raise' |
 * 'reach' | 'kneel' | 'bow' | 'recline'; dir ±1 the side it faces; v the figure's index (drapery's phase).
 */
export function figure(F, x, yb, H, s, pose = 'stand', dir = 1, v = 0) {
  const ph = (v * 1.7) % 6.28, rf = folds(150 / (H + 0.2) + 20, 0.16, ph);
  if (pose === 'recline') {                                                         // lying along the ground, head to the left (dir 1)
    const hx = x - dir * H * 0.38, fy = yb + H * 0.1;
    F.rod(hx + dir * H * 0.12, fy, x + dir * H * 0.4, fy - H * 0.01, H * 0.1, H * 0.07, s * 0.8, s * 0.7, rf);        // the body and the legs in their cloth
    F.rod(hx + dir * H * 0.15, fy + H * 0.1, x + dir * H * 0.1, fy + H * 0.16, H * 0.035, H * 0.03, s * 0.75, s * 0.7);   // the raised arm
    F.dome(hx, fy + H * 0.04, H * 0.075, H * 0.09, s * 0.95);
    return;
  }
  const kn = pose === 'kneel', bw = pose === 'bow' ? dir * H * 0.12 : 0, top = kn ? 0.66 : 1, hy = yb + H * (0.87 * top + 0.04), hx = x + bw;
  F.rod(x, yb + H * 0.08, x + bw * 0.4, yb + H * 0.68 * top, H * (kn ? 0.2 : 0.15), H * 0.075, s * 0.55, s * 0.62, rf);
  F.rod(x + bw * 0.4 - H * 0.1, yb + H * 0.71 * top, x + bw * 0.4 + H * 0.1, yb + H * 0.71 * top, H * 0.05, H * 0.05, s * 0.66, s * 0.66);   // the shoulders       // the robe from the hem to the shoulders
  F.rod(x + bw * 0.4, yb + H * 0.72 * top, hx, hy - H * 0.06, H * 0.05, H * 0.04, s * 0.7, s * 0.75);                           // the neck
  F.dome(hx, hy, H * 0.082, H * 0.1, s * 1.0);                                                                                // the head
  F.dome(hx + dir * H * 0.025, hy, H * 0.022, H * 0.04, s * 1.12);                                                   // the face's ridge: brow and nose
  F.dome(hx - dir * H * 0.01, hy + H * 0.035, H * 0.086, H * 0.07, s * 0.94);                                                                      // the hair
  F.rod(x + bw * 0.4 - dir * H * 0.1, yb + H * 0.7 * top, x + dir * H * 0.09, yb + H * (kn ? 0.12 : 0.24), H * 0.055, H * 0.1, s * 0.74, s * 0.8, folds(110 / (H + 0.2) + 24, 0.2, ph + 1));   // the mantle across the body
  const sh = yb + H * 0.72 * top, a = (sx, tx, ty, hh) => F.rod(x + bw * 0.4 + sx * H * 0.11, sh, x + bw * 0.4 + tx * H, yb + H * ty * 1, H * 0.05, H * 0.035, s * 0.7, s * hh);
  if (pose === 'raise') { a(dir, dir * 0.26, 0.98, 0.66); a(-dir, -dir * 0.17, 0.46, 0.7); }
  else if (pose === 'reach') { a(dir, dir * 0.4, 0.78 * top, 0.62); a(-dir, -dir * 0.16, 0.5, 0.7); }
  else if (pose === 'kneel') { a(dir, dir * 0.2, 0.5, 0.7); a(-dir, dir * 0.18, 0.46, 0.72); }
  else { a(dir, dir * 0.15, 0.48, 0.7); a(-dir, -dir * 0.14, 0.5, 0.7); }
  if (pose === 'stand' || pose === 'bow') F.rod(x - H * 0.02, yb + H * 0.04, x + dir * H * 0.06, yb + H * 0.3, H * 0.05, H * 0.07, s * 0.72, s * 0.76);   // a foot-fold of the robe
}

/** A tree: a trunk and a crown of domes. */
export function tree(F, x, yb, H, s, v = 0) {
  F.rod(x, yb, x + H * 0.02 * (v % 3 - 1), yb + H * 0.5, H * 0.045, H * 0.03, s * 0.8, s * 0.7);
  for (let i = 0; i < 5; i++) { const a = i * 1.26 + v; F.dome(x + Math.cos(a) * H * 0.16, yb + H * (0.62 + 0.14 * Math.sin(a * 1.7)), H * 0.14, H * 0.12, s * (0.75 - 0.05 * (i % 2))); }
}
/** A hill: a long dome. */
export function hill(F, x, yb, w, h, s) { F.dome(x, yb, w / 2, h, s); }
/** An arcade in perspective: n round arches between piers on a podium, the openings cut back to the ground; x0..x1 across, from yb to yb + h. */
export function arcade(F, x0, yb, x1, h, n, s) {
  F.block(x0, yb, x1, yb + h, s, 0.008);
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i + 0.5) * w, r = w * 0.34, ys = yb + h * 0.46;
    F.cut(cx - r, yb + h * 0.1, cx + r, ys + r, (x, y) => (y <= ys ? Math.abs(x - cx) < r : Math.hypot(x - cx, y - ys) < r), 0.002);
    F.rod(cx - r - w * 0.1, yb + h * 0.1, cx - r - w * 0.1, ys, w * 0.06, w * 0.05, s * 1.25, s * 1.3);              // the column
  }
  F.block(x0 - 0.01, yb + h * 0.9, x1 + 0.01, yb + h, s * 1.4, 0.006);                                               // the cornice
}
/** A building seen from the side: a wall with a pitched roof and a door. */
export function house(F, x0, yb, x1, h, s) {
  F.block(x0, yb, x1, yb + h * 0.7, s, 0.006);
  const cx = (x0 + x1) / 2;
  F.each(x0, yb + h * 0.7, x1, yb + h, (i, j, x, y) => { const lim = (h * 0.3) * (1 - Math.abs(x - cx) / ((x1 - x0) / 2)); if (y - (yb + h * 0.7) < lim) F.up(i, j, s * 0.9); });
  F.cut(cx - (x1 - x0) * 0.1, yb, cx + (x1 - x0) * 0.1, yb + h * 0.4, () => true, 0.002);
}

/**
 * The scene of a panel of the Gate of Paradise (k = 0..9, read left to right, top to bottom) in the field F: the ten scenes
 * of the Old Testament as the type of each, generalised (a landscape, a building in perspective, figures near and far).
 */
export function paradiseScene(F, k) {
  const w = F.w, h = F.h, S = 0.06, M = 0.034, Fa = 0.018;                          // the relief of the near, middle and far
  const fx = (a) => a * w, fy = (a) => a * h;
  const crowd = (n, x0, x1, yb, H, s, pose, dir) => { for (let i = 0; i < n; i++) figure(F, fx(x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0.5)), fy(yb) + (i % 2) * fy(0.03), fy(H) * (1 - 0.06 * (i % 3)), s, i % 3 === 1 ? 'bow' : pose, dir, i + k * 5); };
  switch (k) {
    case 0:   // the creation of Adam and of Eve: Adam lying, Eve rising, God among angels, the garden
      hill(F, fx(0.3), fy(0.4), fx(0.7), fy(0.1), Fa); hill(F, fx(0.78), fy(0.46), fx(0.6), fy(0.1), Fa);
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; F.dome(fx(0.62) + Math.cos(a) * fx(0.1), fy(0.84) + Math.sin(a) * fy(0.1), fx(0.03), fy(0.035), M); }
      figure(F, fx(0.62), fy(0.66), fy(0.3), M, 'reach', -1, 1);
      figure(F, fx(0.3), fy(0.1), fy(0.2), S, 'recline', 1, 2); figure(F, fx(0.62), fy(0.1), fy(0.5), S, 'raise', -1, 3); tree(F, fx(0.88), fy(0.1), fy(0.5), M, 1); break;
    case 1:   // Cain and Abel: the offerings at the altar, the murder
      hill(F, fx(0.5), fy(0.5), fx(0.9), fy(0.1), Fa); F.block(fx(0.16), fy(0.1), fx(0.32), fy(0.24), M, 0.01);
      figure(F, fx(0.1), fy(0.1), fy(0.4), S, 'kneel', 1, 4); figure(F, fx(0.4), fy(0.1), fy(0.42), S, 'kneel', -1, 5);
      figure(F, fx(0.78), fy(0.1), fy(0.2), S, 'recline', -1, 6); figure(F, fx(0.66), fy(0.14), fy(0.55), S, 'raise', 1, 7); tree(F, fx(0.9), fy(0.2), fy(0.4), M, 2); break;
    case 2:   // Noah: the ark, the family coming out, the sacrifice
      F.block(fx(0.08), fy(0.46), fx(0.56), fy(0.62), M, 0.012); F.rod(fx(0.06), fy(0.62), fx(0.58), fy(0.62), fy(0.1), fy(0.1), M, M);
      for (let i = 0; i < 7; i++) F.cut(fx(0.14 + i * 0.06) - 0.006, fy(0.5), fx(0.14 + i * 0.06) + 0.006, fy(0.58), () => true, 0.004);
      hill(F, fx(0.7), fy(0.4), fx(0.7), fy(0.1), Fa); crowd(3, 0.14, 0.5, 0.08, 0.56, S, 'stand', 1); figure(F, fx(0.78), fy(0.1), fy(0.5), S, 'kneel', -1, 8); tree(F, fx(0.92), fy(0.15), fy(0.4), M, 3); break;
    case 3:   // Abraham and Isaac: the sacrifice, the angel, the servants and the ass below
      hill(F, fx(0.5), fy(0.4), fx(0.9), fy(0.14), Fa); F.block(fx(0.4), fy(0.12), fx(0.62), fy(0.22), M, 0.01);
      figure(F, fx(0.5), fy(0.2), fy(0.18), S, 'recline', 1, 9); figure(F, fx(0.32), fy(0.12), fy(0.58), S, 'raise', 1, 10); figure(F, fx(0.76), fy(0.62), fy(0.34), M, 'reach', -1, 11);
      crowd(2, 0.08, 0.2, 0.46, 0.26, M, 'stand', 1); F.rod(fx(0.2), fy(0.5), fx(0.3), fy(0.48), fy(0.05), fy(0.04), M, M); tree(F, fx(0.9), fy(0.1), fy(0.4), M, 4); break;
    case 4:   // Jacob and Esau: Isaac's bed, Rebecca, Jacob kneeling, Esau at the hunt
      F.block(fx(0.08), fy(0.1), fx(0.48), fy(0.22), M, 0.01); F.block(fx(0.1), fy(0.7), fx(0.46), fy(0.74), M, 0.006); for (const u of [0.1, 0.46]) F.rod(fx(u), fy(0.22), fx(u), fy(0.72), fy(0.012), fy(0.012), M, M);
      figure(F, fx(0.28), fy(0.18), fy(0.2), S, 'recline', 1, 12); figure(F, fx(0.1), fy(0.08), fy(0.48), S, 'stand', 1, 13); figure(F, fx(0.54), fy(0.08), fy(0.44), S, 'kneel', -1, 14);
      hill(F, fx(0.8), fy(0.42), fx(0.5), fy(0.1), Fa); figure(F, fx(0.8), fy(0.3), fy(0.3), M, 'reach', 1, 15); tree(F, fx(0.92), fy(0.1), fy(0.4), M, 5); break;
    case 5:   // Joseph and his brothers: the loggia, Joseph on its steps, the brothers kneeling
      arcade(F, fx(0.1), fy(0.42), fx(0.9), fy(0.44), 5, Fa + 0.004); F.block(fx(0.34), fy(0.14), fx(0.7), fy(0.2), M, 0.008);
      figure(F, fx(0.52), fy(0.2), fy(0.4), S, 'stand', -1, 16); crowd(3, 0.14, 0.84, 0.04, 0.54, S, 'kneel', 1); break;
    case 6:   // Moses on Sinai: the mountain, Moses kneeling on the summit, the people at its foot
      F.each(0, 0, w, h, (i, j, x, y) => { const m = 0.5 - Math.abs(x - fx(0.5)) / fx(0.6); const top = fy(0.84) * Math.max(0, m * 1.4); if (y < top && y > fy(0.2)) F.up(i, j, Fa * (0.4 + 0.6 * (1 - y / fy(0.9)))); });
      figure(F, fx(0.5), fy(0.66), fy(0.22), M, 'kneel', 1, 17); crowd(3, 0.16, 0.9, 0.06, 0.52, S, 'raise', -1); house(F, fx(0.06), fy(0.22), fx(0.24), fy(0.22), Fa); break;
    case 7:   // Joshua at Jericho: the walls and their tower, the priests with trumpets, the ark borne
      F.block(fx(0.08), fy(0.3), fx(0.5), fy(0.62), Fa + 0.006, 0.01); F.block(fx(0.28), fy(0.3), fx(0.42), fy(0.84), Fa + 0.008, 0.01);
      for (let i = 0; i < 6; i++) F.block(fx(0.08 + i * 0.07), fy(0.62), fx(0.08 + i * 0.07 + 0.04), fy(0.67), Fa + 0.006, 0.004);
      crowd(3, 0.56, 0.9, 0.08, 0.56, S, 'raise', 1); F.block(fx(0.58), fy(0.04), fx(0.74), fy(0.14), M, 0.008); figure(F, fx(0.14), fy(0.08), fy(0.44), S, 'reach', 1, 18); break;
    case 8:   // David and Goliath: the giant fallen, David standing over him with the sword, the two hosts
      for (let i = 0; i < 5; i++) { figure(F, fx(0.07 + i * 0.07), fy(0.58), fy(0.26), Fa + 0.004, 'stand', 1, 20 + i); figure(F, fx(0.93 - i * 0.07), fy(0.55), fy(0.26), Fa + 0.004, 'stand', -1, 40 + i); }
      figure(F, fx(0.42), fy(0.1), fy(0.22), S, 'recline', 1, 19); figure(F, fx(0.66), fy(0.1), fy(0.58), S, 'raise', -1, 18); tree(F, fx(0.1), fy(0.1), fy(0.36), M, 6); break;
    default:  // Solomon and the Queen of Sheba: the great hall in perspective, the two meeting on the steps, the court
      arcade(F, fx(0.08), fy(0.46), fx(0.92), fy(0.5), 6, Fa + 0.006); arcade(F, fx(0.2), fy(0.4), fx(0.8), fy(0.12), 3, M);
      F.block(fx(0.3), fy(0.1), fx(0.7), fy(0.16), M, 0.008); figure(F, fx(0.44), fy(0.16), fy(0.4), S, 'bow', 1, 22); figure(F, fx(0.58), fy(0.16), fy(0.42), S, 'reach', -1, 23);
      crowd(2, 0.1, 0.24, 0.06, 0.5, S, 'stand', 1); crowd(2, 0.76, 0.9, 0.06, 0.5, S, 'stand', -1); break;
  }
  void M;
}

/** The scene of one quatrefoil of the bronze doors (Pisano's figures and Ghiberti's first door's scenes, generalised): one or two figures, now and then a tree or a building. */
export function quatrefoilScene(F, k) {
  const w = F.w, h = F.h, S = 0.04, M = 0.024, P = ['stand', 'raise', 'reach', 'kneel', 'bow', 'stand'][k % 6], dir = k % 2 ? -1 : 1;
  if (k % 4 === 1) hill(F, w * 0.5, h * 0.3, w * 0.45, h * 0.1, 0.012);
  if (k % 5 === 2) house(F, w * 0.62, h * 0.12, w * 0.92, h * 0.42, 0.014);
  if (k % 3 === 0) { figure(F, w * (0.5 - dir * 0.16), h * 0.1, h * 0.7, S, P, dir, k); figure(F, w * (0.5 + dir * 0.22), h * 0.1, h * 0.5, M, k % 2 ? 'kneel' : 'stand', -dir, k + 7); }
  else figure(F, w * 0.5, h * 0.1, h * 0.76, S, P, dir, k);
  if (k % 7 === 4) tree(F, w * 0.82, h * 0.1, h * 0.4, M, k);
}

/** The figure of a campanile panel (the planets, the arts, the labours of Pisano's reliefs, generalised), by kind 0..2, in a field about 1.3 × 1.5: a figure raising an arm, a seated worker at his bench, a figure with a long tool. */
export function craftScene(F, kind, v = 0) {
  const w = F.w, h = F.h, s = 0.075, dir = v % 2 ? -1 : 1;
  if (kind === 0) { figure(F, w * (0.5 - dir * 0.14), h * 0.06, h * 0.84, s, 'raise', dir, v); figure(F, w * (0.5 + dir * 0.28), h * 0.06, h * 0.46, s * 0.8, 'kneel', -dir, v + 3); }
  else if (kind === 1) {
    F.block(w * 0.12, h * 0.2, w * 0.88, h * 0.27, s * 0.7, 0.012); for (const u of [0.18, 0.82]) F.block(w * u - 0.03, h * 0.04, w * u + 0.03, h * 0.2, s * 0.6, 0.01);
    figure(F, w * (0.5 - dir * 0.12), h * 0.2, h * 0.64, s, 'bow', dir, v); F.dome(w * (0.5 + dir * 0.26), h * 0.34, w * 0.08, h * 0.06, s * 0.85);
  } else { figure(F, w * (0.5 - dir * 0.1), h * 0.06, h * 0.84, s, 'reach', dir, v); F.rod(w * (0.5 + dir * 0.24), h * 0.06, w * (0.5 + dir * 0.24), h * 0.9, 0.022, 0.018, s * 0.7, s * 0.7); tree(F, w * (0.5 + dir * 0.34), h * 0.06, h * 0.4, s * 0.7, v); }
}

/** The lunette over the cathedral's middle door in a field 5.4 × 5 (the arch's springing at the bottom): the Virgin in a mandorla between two angels, the bier below her with the apostles behind it (generalised). */
export function lunetteScene(F) {
  const w = F.w, cx = w / 2, cy = 3.0, rx = 1.0, ry = 1.55, s = 0.15;
  F.each(cx - rx - 0.2, cy - ry - 0.2, cx + rx + 0.2, cy + ry + 0.2, (i, j, x, y) => { const q = Math.hypot((x - cx) / rx, (y - cy) / ry); if (q > 0.84 && q < 1.04) F.up(i, j, 0.07 * Math.cos((q - 0.94) / 0.1 * Math.PI / 2)); });
  figure(F, cx, 1.55, 2.5, s, 'raise', 1, 3);
  for (const sg of [-1, 1]) figure(F, cx + sg * 1.75, 2.9, 1.2, s * 0.7, 'reach', -sg, 4 + sg);
  F.block(cx - 2.3, 0.35, cx + 2.3, 0.75, s * 0.6, 0.06); F.block(cx - 2.4, 0.2, cx + 2.4, 0.4, s * 0.7, 0.05);
  for (let i = 0; i < 6; i++) figure(F, cx - 2.0 + i * 0.8, 0.75, 1.15, s * 0.9, i % 3 === 1 ? 'bow' : i % 3 === 2 ? 'raise' : 'stand', i < 3 ? 1 : -1, 10 + i);
}
