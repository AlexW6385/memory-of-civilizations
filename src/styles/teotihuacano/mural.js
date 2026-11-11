// Painted murals of the apartment compounds' rooms (docs/settlements/teotihuacan.md §13): the Tlalocan of
// Tepantitla — the mountain pouring water, the Great Goddess and her flowering tree above it, ball-players,
// butterfly hunters, swimmers in the stream — and a procession of priests in profile on the side walls.
// Paint is thin flat pieces (stepped shapes and blobs) laid in layers 5 mm apart on a wall's face.

import { box } from '../../core/geom.js';
import { patch } from '../maya/household.js';

const RED = 'stucco_red', FRAME = 'limewash_red', WHITE = 'stucco_pale', BLUE = 'maya_blue', GREEN = 'clay_green', JADE = 'inlay_jade',
  OCHRE = 'paint_ochre', YEL = 'paint_cab_yellow', BLACK = 'paint_minoan_black', BROWN = 'cloth_brown', WB = 'prussian_blue';

/**
 * A wall to paint on: the plane `axis` ('x' | 'z') = c, facing ns (+1 | −1 along it); a1 − a0 the width along the wall
 * (world, from the left as seen facing it), y0 the floor of the field. All shapes in metres from the field's bottom left.
 */
export class Wall {
  constructor(bag, axis, c, ns, a0, a1, y0) { Object.assign(this, { bag, axis, c, ns, a0, a1, y0, sy: 1, dir: Math.sign(a1 - a0) || 1 }); }
  rect(mat, x0, x1, y0, y1, L = 0) {
    const o0 = this.c + this.ns * (0.003 + L * 0.005), o1 = o0 + this.ns * 0.005, lo = Math.min(o0, o1), hi = Math.max(o0, o1);
    const p0 = this.a0 + this.dir * x0, p1 = this.a0 + this.dir * x1, a = Math.min(p0, p1), b = Math.max(p0, p1);
    this.bag.add(mat, this.axis === 'x' ? box(lo, this.y0 + y0 * this.sy, a, hi, this.y0 + y1 * this.sy, b) : box(a, this.y0 + y0 * this.sy, lo, b, this.y0 + y1 * this.sy, hi));
  }
  /** An irregular painted blob (a head, a flower, a ball, a fish) w × h centred at (x, y). */
  blob(mat, x, y, w, h, L = 1, seed = 1) {
    const o = this.c, p = this.a0 + this.dir * x, c = this.axis === 'x' ? [o, this.y0 + y * this.sy, p] : [p, this.y0 + y * this.sy, o];
    patch(this.bag, mat, c, this.axis === 'x' ? [this.ns, 0, 0] : [0, 0, this.ns], w, h * this.sy, seed, 0.003 + L * 0.005 + 0.005);
  }
}

/** A person in profile (about 0.3 m): the loincloth, the torso and head, an arm reaching, bent legs; `f` +1 facing right, −1 left; `top` a headdress material. */
function person(w, x, y, c, f, { top = null, big = 1, arm = 1, L = 2, seed = 1 } = {}) {
  const u = 0.03 * big;
  w.rect(c, x - u, x + u, y + 6 * u, y + 11 * u, L);                              // the torso
  w.rect(c, x - u * 0.9, x + u * 0.9, y + 2.2 * u, y + 6 * u, L);                  // the hips
  w.rect(WHITE, x - u, x + u, y + 3.4 * u, y + 5.6 * u, L + 1);                    // the loincloth
  w.rect(c, x + f * u * 0.2, x + f * u * 1.5, y, y + 2.4 * u, L);                  // the legs, one forward
  w.rect(c, x - f * u * 1.5, x - f * u * 0.2, y, y + 2.4 * u, L);
  w.rect(c, Math.min(x, x + f * 3.2 * u * arm), Math.max(x, x + f * 3.2 * u * arm), y + 8.6 * u, y + 9.4 * u, L);   // the arm
  w.blob(OCHRE, x + f * u * 0.2, y + 12.4 * u, 2.6 * u, 2.9 * u, L + 1, seed);       // the head
  w.rect(BLACK, x + f * u * 0.9, x + f * u * 1.35, y + 12.6 * u, y + 12.85 * u, L + 2);   // the eye
  if (top) { w.rect(top, x - u, x + u, y + 13.8 * u, y + 15 * u, L + 1); for (const k of [-1, 0, 1]) w.rect(GREEN, x - f * (u * (1.1 + k * 0.5)), x - f * (u * (0.9 + k * 0.5)), y + 14.4 * u - Math.abs(k) * 0.3 * u, y + 18 * u - Math.abs(k) * 2 * u, L + 2); }
}

/** A stepped fret band (xicalcoliuhqui) along a wall's top: white steps on red, x0..x1 at y. */
function fret(w, x0, x1, y, h = 0.1) {
  w.rect(FRAME, x0, x1, y, y + h * 1.6, 1);
  for (let x = x0 + 0.04; x < x1 - h * 1.7; x += h * 2.4) { w.rect(WHITE, x, x + h * 1.3, y + h * 0.3, y + h * 0.5, 2); w.rect(WHITE, x + h * 1.1, x + h * 1.3, y + h * 0.3, y + h * 1.1, 2); w.rect(WHITE, x + h * 0.4, x + h * 1.3, y + h * 0.9, y + h * 1.1, 2); }
}

/**
 * The Tlalocan on a wall W wide (the paradise of Tlaloc, Tepantitla): in the red field a stream along the foot with
 * fish and swimmers; the stepped green mountain pouring water from its cave; on the flanks maize and the ball-players,
 * a butterfly hunter; above the mountain the Great Goddess in her green headdress, drops falling from her hands, the
 * flowering tree growing from her head.
 */
export function tlalocan(w, W, Hw, seed = 1) {
  const H = 2.2, m = W / 2, F = 0.09;
  w.sy = Hw / H;
  w.rect(RED, 0, W, 0, H, 0);
  for (const [a, b, c, d] of [[0, W, 0, F], [0, W, H - F, H], [0, F, 0, H], [W - F, W, 0, H]]) w.rect(FRAME, a, b, c, d, 1);
  w.rect(WHITE, F, W - F, F, F + 0.012, 1); w.rect(WHITE, F, W - F, H - F - 0.012, H - F, 1);
  // the stream along the foot: rippling bands, fish, swimmers in the three colours
  w.rect(BLUE, F, W - F, F, 0.48, 1);
  for (let i = 0; i < 3; i++) for (let x = F + 0.1 + (i % 2) * 0.2; x < W - F - 0.3; x += 0.55) w.rect(WHITE, x, x + 0.22, 0.14 + i * 0.12, 0.155 + i * 0.12, 2);
  for (let i = 0; i < 9; i++) { const x = 0.25 + i * (W - 0.5) / 8, y = 0.2 + ((i * 5) % 3) * 0.12; w.blob(OCHRE, x, y, 0.15, 0.06, 3, seed + i); w.rect(OCHRE, x + 0.07, x + 0.11, y - 0.025, y + 0.025, 3); }
  [[0.5, RED], [1.05, YEL], [W - 1.1, YEL], [W - 0.55, RED], [m + 0.9, YEL], [m - 0.95, RED]].forEach(([x, c], i) => person(w, x, 0.2 + (i % 2) * 0.07, c, i % 2 ? -1 : 1, { big: 0.7, L: 3, seed: seed + 40 + i }));
  // the mountain: four steps in green, the cave at its foot, water down its faces into the stream
  [[0.82, 0.48, 0.74], [0.62, 0.74, 0.98], [0.42, 0.98, 1.18], [0.22, 1.18, 1.32]].forEach(([hw, y0, y1]) => { w.rect(GREEN, m - hw, m + hw, y0, y1, 2); w.rect(JADE, m - hw, m + hw, y1 - 0.03, y1, 3); });
  w.rect(BLACK, m - 0.12, m + 0.12, 0.48, 0.7, 3);
  for (const s of [-1, 0, 1]) w.rect(BLUE, m + s * 0.3 - 0.045, m + s * 0.3 + 0.045, 0.48, s ? 1.15 - Math.abs(s) * 0.1 : 0.7, 4);
  for (let k = 0; k < 6; k++) w.blob(WHITE, m + (k % 2 ? 0.35 : -0.35) * (1 + k * 0.2), 0.62 + k * 0.1, 0.05, 0.05, 4, seed + k);
  // maize in the fields either side, the ball game on the left, the butterfly hunter on the right
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const x = m + side * (1.15 + i * 0.2), h = 0.34 + ((i * 7) % 3) * 0.05;
    w.rect(GREEN, x - 0.012, x + 0.012, 0.48, 0.48 + h, 2); w.rect(GREEN, x, x + side * 0.1, 0.48 + h * 0.6, 0.495 + h * 0.6, 2); w.rect(YEL, x - 0.03, x + 0.03, 0.48 + h, 0.55 + h, 3);
  }
  person(w, m - 1.3, 0.9, RED, 1, { top: GREEN, L: 2, seed: seed + 50 }); person(w, m - 0.9, 0.9, YEL, -1, { L: 2, seed: seed + 51 }); w.blob(WB, m - 1.1, 0.98, 0.1, 0.1, 3, seed + 52);
  person(w, m + 1.25, 0.9, YEL, -1, { arm: 1.4, top: OCHRE, L: 2, seed: seed + 53 }); w.rect(BROWN, m + 0.85, m + 1.1, 1.17, 1.19, 3);
  for (const [dx, dy] of [[1.55, 1.25], [1.85, 1.12], [1.45, 0.95]]) { w.blob(OCHRE, m + dx - 0.04, dy, 0.07, 0.05, 3, seed + dx * 10); w.blob(OCHRE, m + dx + 0.04, dy, 0.07, 0.05, 3, seed + dx * 10 + 1); w.rect(BLACK, m + dx - 0.006, m + dx + 0.006, dy - 0.03, dy + 0.03, 4); }
  // the Great Goddess: robe, hands with falling drops, the masked face, the green headdress, the tree from her head
  const gy = 1.25;
  w.rect(WB, m - 0.17, m + 0.17, gy - 0.08, gy + 0.3, 2); w.rect(RED, m - 0.15, m + 0.15, gy - 0.08, gy + 0.02, 3); w.rect(WHITE, m - 0.17, m + 0.17, gy + 0.12, gy + 0.14, 3);
  for (const s of [-1, 1]) {
    w.rect(OCHRE, m + s * 0.17, m + s * 0.5, gy + 0.18, gy + 0.23, 3); w.blob(OCHRE, m + s * 0.55, gy + 0.205, 0.1, 0.09, 4, seed + 60 + s);
    for (let k = 0; k < 3; k++) w.rect(BLUE, m + s * (0.5 + k * 0.06) - 0.012, m + s * (0.5 + k * 0.06) + 0.012, gy - 0.05 - k * 0.1, gy + 0.12, 4);
  }
  w.blob(OCHRE, m, gy + 0.46, 0.3, 0.3, 3, seed + 61); w.rect(BLACK, m - 0.12, m + 0.12, gy + 0.46, gy + 0.5, 4); w.rect(YEL, m - 0.04, m + 0.04, gy + 0.36, gy + 0.4, 4);
  w.rect(GREEN, m - 0.26, m + 0.26, gy + 0.6, gy + 0.68, 3); for (let k = -3; k <= 3; k++) w.rect(JADE, m + k * 0.075 - 0.02, m + k * 0.075 + 0.02, gy + 0.64, gy + 0.64 + 0.1 + (3 - Math.abs(k)) * 0.02, 4);
  w.rect(BROWN, m - 0.025, m + 0.025, gy + 0.68, H - 0.2, 3);
  for (let k = 0; k < 11; k++) { const a = k / 10 * Math.PI, x = m + Math.cos(a) * 0.62, y = H - 0.25 + Math.sin(a) * 0.12; w.blob(k % 3 === 0 ? RED : k % 3 === 1 ? YEL : WHITE, x, y, 0.1, 0.09, 4, seed + 70 + k); w.rect(BROWN, Math.min(m, x) - 0.005, Math.max(m, x) + 0.005, gy + 0.78 + k * 0.012, gy + 0.795 + k * 0.012, 3); }
}

/** A procession of priests in profile on a side wall D deep (x from the front, walking toward the back wall) under a fret band, water-drop glyphs between them. */
export function procession(w, D, H, seed = 1) {
  w.sy = 1;
  w.rect(RED, 0, D, 0, H, 0);
  fret(w, 0.05, D - 0.05, H - 0.24); w.rect(FRAME, 0, D, 0, 0.07, 1);
  const n = Math.max(3, Math.floor(D / 1.0));
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * D / n;
    person(w, x, 0.3, i % 2 ? WB : YEL, 1, { top: i % 3 === 1 ? JADE : OCHRE, big: 1.9, arm: 1, L: 1, seed: seed + i });
    for (let k = 0; k < 3; k++) w.rect(BLUE, x + 0.35 - 0.012 + k * 0.05, x + 0.35 + 0.012 + k * 0.05, 0.85 - k * 0.12, 0.98 - k * 0.12, 3);   // the drops from the hand's offering
    w.rect(BLACK, x - 0.12, x - 0.02, 0.12, 0.14, 2); w.rect(BLACK, x + 0.12, x + 0.24, 0.1, 0.12, 2);                                          // footprints
  }
}
