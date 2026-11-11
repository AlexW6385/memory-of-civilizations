// The edge of Bianjing's river streets (docs/settlements/song-kaifeng.md §12): the paved walk by the shops is parted from the earth strip along the water by a low
// stone kerb (open where the landing paths and the bridge's approach cross), and along the water stand the mooring posts of the quays — driven timbers with a
// rounded head, an iron ring and a turn of rope — with now and then a stump-bollard and a stake for the net poles.

import { box, lathe, rod } from '../../core/geom.js';

const mulberry = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** river_edge { bank ('n' | 's'), x0, x1, gaps [[a, b]...] (no kerb there), z0, z1 (the river), walk, rs (the street's width) }. */
function riverEdge(el, { bag, col }) {
  const { bank, x0, x1, gaps = [], z0, z1, walk, rs } = el, n = bank === 'n', rnd = mulberry(Math.floor(x0 * 7 + (n ? 1 : 3)));
  const zk = n ? z0 - rs + walk : z1 + rs - walk;                       // the walk's water edge
  const segs = []; let a = x0;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > a) segs.push([a, g0]); a = Math.max(a, g1); }
  if (x1 > a) segs.push([a, x1]);
  for (const [s0, s1] of segs) {
    // the kerb: dressed blocks 1.2-1.8 m long, laid on the earth, their tops 0.1 above the walk
    for (let x = s0; x < s1 - 0.05;) {
      const l = Math.min(1.2 + rnd() * 0.6, s1 - x), zz = n ? [zk - 0.05, zk + 0.13] : [zk - 0.13, zk + 0.05];
      bag.add(rnd() < 0.25 ? 'granite_grey' : 'granite_block', box(x + 0.01, 0.0, zz[0], x + l - 0.01, 0.15, zz[1]));
      x += l;
    }
  }
  // the mooring posts along the water, every 7-10 m, clear of the landing paths
  const zp = n ? z0 - 0.62 : z1 + 0.62, d = n ? -1 : 1;
  for (let x = x0 + 3 + rnd() * 5; x < x1 - 2; x += 7 + rnd() * 3) {
    if (gaps.some(([g0, g1]) => x > g0 - 1.2 && x < g1 + 1.2)) continue;
    const h = 0.95 + rnd() * 0.3;
    bag.add('timber', rod([x, -0.3, zp], [x, h, zp], 0.1, 7));
    bag.add('timber', lathe([[0.001, 0], [0.12, 0], [0.13, 0.04], [0.09, 0.09], [0.001, 0.12]], 7, null, x, h, zp));
    bag.add('iron', rod([x, h - 0.2, zp - d * 0.11], [x, h - 0.38, zp - d * 0.11], 0.016, 4));
    for (let k = 0; k < 3; k++) bag.add('rope_fibre', lathe([[0.1, 0], [0.135, 0.015], [0.135, 0.04], [0.1, 0.055]], 8, null, x, h - 0.72 + k * 0.06, zp));
    col.circle(x, zp, 0.14, 0, h);
    if (rnd() < 0.4) { const xs = x + (rnd() < 0.5 ? -1 : 1) * (2.2 + rnd() * 1.5); bag.add('wood_dark', lathe([[0.001, 0], [0.17, 0], [0.15, 0.3], [0.19, 0.38], [0.001, 0.38]], 7, null, xs, 0, zp - d * 0.2)); col.circle(xs, zp - d * 0.2, 0.18, 0, 0.4); }
  }
}

export const RIVERSIDE_ELEMENTS = { river_edge: riverEdge };
