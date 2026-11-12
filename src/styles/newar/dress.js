// The dressing of Taumadhi's open ground (docs/settlements/bhaktapur.md §13): the stone inlay of the brick paving, the lamps and marigolds of the
// worshippers on the Nyatapola's treads and at the guardians' feet, the iron tridents at the Bhairabnath, the wall niches' offerings.
// Small shapes only; every one a palette material, repeated ones identical so they instance.

import { box, lathe, rod } from '../../core/geom.js';
import { pot } from './pottery.js';

const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A ring of marigolds (a garland) of radius r at (x, y, z). */
export function garland(bag, x, y, z, r, mat = 'cloth_ochre') {
  bag.add(mat, lathe([[r, 0], [r + 0.05, 0.035], [r + 0.04, 0.07], [r - 0.04, 0.07], [r - 0.05, 0.035]], 9, null, x, y, z));
}
/** A heap of flower petals or rice, `r` wide. */
export function heap(bag, x, y, z, r, mat = 'cloth_ochre') {
  bag.add(mat, lathe([[r, 0], [r * 0.8, r * 0.18], [r * 0.45, r * 0.34], [0.001, r * 0.42]], 7, null, x, y, z));
}
const diya = (bag, x, y, z) => { pot(bag, x, y, z, 'diya', 1); bag.add('flame', lathe([[0.012, 0], [0.001, 0.035]], 4, null, x, y + 0.045, z)); };

/**
 * newar_inlay { rect, rings: [[x0, z0, x1, z1] ...] (the footprints the bands run round), seed }: bands of dressed sandstone let into the
 * brick paving of the square [inferred: the stone-edged bands of the old squares] — the margin along the edges, a ring round each temple,
 * and straight bands across the open ground every 9 m; 1.2 cm proud of the brick, so they cost nothing underfoot.
 */
export function inlay(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = 0.05, h = 0.022, M = 'sandstone_floor';
  const band = (a, b, c, d) => { if (c - a > 0.02 && d - b > 0.02) bag.add(M, bx(a, y, b, c, y + h, d)); };
  const ring = (r, w) => { band(r[0], r[1], r[2], r[1] + w); band(r[0], r[3] - w, r[2], r[3]); band(r[0], r[1] + w, r[0] + w, r[3] - w); band(r[2] - w, r[1] + w, r[2], r[3] - w); };
  ring([x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.5], 0.4);
  ring([x0 + 1.3, z0 + 1.3, x1 - 1.3, z1 - 1.3], 0.16);
  const keeps = el.rings ?? [];
  for (const k of keeps) for (const [m, w] of [[1.6, 0.3], [2.4, 0.14]]) { const r = [k[0] - m, k[1] - m, k[2] + m, k[3] + m]; if (r[0] > x0 && r[1] > z0 && r[2] < x1 && r[3] < z1) ring(r, w); }
  const free = (a, b, c, d) => !keeps.some((k) => a < k[2] + 1.6 && c > k[0] - 1.6 && b < k[3] + 1.6 && d > k[1] - 1.6);
  for (let x = x0 + 4.5; x < x1 - 3; x += 9) for (let z = z0 + 1.6; z < z1 - 1.6; z += 4.5) if (free(x, z, x + 0.2, z + 4.5)) band(x, z + 0.6, x + 0.2, z + 3.9);
  for (let z = z0 + 5; z < z1 - 3; z += 9) for (let x = x0 + 1.6; x < x1 - 1.6; x += 4.5) if (free(x, z, x + 4.5, z + 0.2)) band(x + 0.6, z, x + 3.9, z + 0.2);
}

/**
 * newar_offerings { pagoda: the pagoda's data (layout.js NYATAPOLA), seed }: the worshippers' lamps in a row on the front edge of each stage's
 * tread, a garland on every guardian's pedestal, marigold heaps and a rice offering at the foot of each flight, a tray of lamps by the door.
 */
export function offerings(el, { bag }) {
  const P = el.pagoda, [cx, cz] = P.c, sx = P.front === 'w' ? -1 : 1, pl = P.plinth, h = pl.h, n = pl.hw.length, rand = rng(el.seed ?? 11);
  const X = (u) => cx + sx * u;
  const uFace = []; for (let k = n - 1, u = pl.hw[n - 1] + (pl.top ?? 1); k >= 0; k--, u += pl.tread) uFace[k] = u;
  const W = pl.stair ?? 4.4;
  for (let k = 0; k < n - 1; k++) {
    const y = (k + 1) * h + 0.1 - 0.1 + 0.0;
    for (const side of [-1, 1]) for (let v = W / 2 + 0.7; v < pl.hw[k] - 0.5; v += 0.52) if (rand() < 0.78) diya(bag, X(uFace[k] - 0.3), y, cz + side * v);
  }
  for (let k = 0; k < n; k++) for (const v of [-1, 1]) {
    const s = 0.85 + 0.12 * k, px = X(uFace[k] + 1.25), pz = cz + v * (W / 2 + 1.05), y = k * h + 0.45 * s;
    garland(bag, px, y, pz, 0.5 * s);
    heap(bag, X(uFace[k] + 0.55), k * h, cz + v * (W / 2 - 0.4), 0.22, k % 2 ? 'cloth_red' : 'cloth_ochre');
  }
  // the lamp tray and the rice before the temple's door (the top stage)
  const yT = n * h;
  for (let j = 0; j < 7; j++) diya(bag, X(uFace[n - 1] - 0.6), yT, cz - 1.2 + j * 0.4);
  heap(bag, X(uFace[n - 1] - 1.2), yT, cz, 0.34, 'cloth_white'); heap(bag, X(uFace[n - 1] - 1.2), yT, cz - 0.8, 0.22, 'cloth_red'); heap(bag, X(uFace[n - 1] - 1.2), yT, cz + 0.8, 0.22, 'cloth_ochre');
}

/** newar_trisul { c, s }: an iron trident on a stone seat (the weapon of Bhairab set before his shrine), a marigold garland on its shaft. */
export function trisul(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 1;
  bag.add('sandstone_dressed', bx(x - 0.3 * s, 0, z - 0.3 * s, x + 0.3 * s, 0.35 * s, z + 0.3 * s)); col.rect([x - 0.3 * s, z - 0.3 * s, x + 0.3 * s, z + 0.3 * s], 0, 0.35 * s);
  bag.add('iron', rod([x, 0.35 * s, z], [x, 2.3 * s, z], 0.03 * s, 6));
  for (const d of [-1, 0, 1]) bag.add('iron', rod([x, 2.1 * s, z], [x + d * 0.14 * s, 2.55 * s + (d === 0 ? 0.15 * s : 0), z], 0.02 * s, 5));
  bag.add('iron', rod([x - 0.14 * s, 2.1 * s, z], [x + 0.14 * s, 2.1 * s, z], 0.02 * s, 5));
  garland(bag, x, 1.2 * s, z, 0.09 * s); garland(bag, x, 1.5 * s, z, 0.08 * s, 'cloth_red');
  void col;
}
