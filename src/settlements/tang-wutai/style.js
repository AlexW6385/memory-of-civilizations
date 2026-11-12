// Wutai's own pieces on top of the `chinese` style (docs/settlements/tang-wutai.md §13): a cheap broadleaf tree for the yards and
// lanes (jujube, poplar, willow), rows of millet on the terraced fields, a stone lamp pillar, a scarecrow, a cairn.

import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/chinese/index.js';
import { box, lathe } from '../../core/geom.js';
import { tube, blob } from '../../styles/chinese/statues.js';
import { height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** wutai_tree { at, y, h, kind: 'jujube' | 'poplar' | 'willow', seed } */
function wutaiTree({ at: [x, z], y, h = 6, kind = 'jujube', seed = 1 }, { bag, col }) {
  const rand = rng(seed * 7 + 3), leaf = kind === 'willow' ? 'flax_leaf' : 'flax_leaf';
  if (kind === 'poplar') {
    bag.add('bark_grey', tube([[x, y - 0.1, z, 0.2], [x + 0.05, y + h * 0.5, z, 0.12], [x, y + h * 0.9, z, 0.04]], 6));
    for (let k = 0; k < 4; k++) bag.add(leaf, blob([x + (rand() - 0.5) * 0.3, y + h * (0.38 + k * 0.17), z + (rand() - 0.5) * 0.3], 0.95 - k * 0.12, h * 0.17, 0.95 - k * 0.12, 7, 4));
  } else {
    const th = h * (kind === 'willow' ? 0.4 : 0.42), a0 = rand() * 6.28;
    bag.add('bark_dark', tube([[x, y - 0.1, z, 0.26], [x + Math.cos(a0) * 0.2, y + th * 0.5, z + Math.sin(a0) * 0.2, 0.2], [x + Math.cos(a0) * 0.3, y + th, z + Math.sin(a0) * 0.3, 0.14]], 7));
    for (let i = 0; i < 3; i++) { const a = a0 + i * 2.1 + rand() * 0.5, o = h * 0.28; bag.add('bark_dark', tube([[x + Math.cos(a0) * 0.3, y + th, z + Math.sin(a0) * 0.3, 0.12], [x + Math.cos(a) * o, y + th + h * 0.25, z + Math.sin(a) * o, 0.05]], 5)); }
    const n = kind === 'willow' ? 7 : 6;
    for (let k = 0; k < n; k++) {
      const a = a0 + k * (6.28 / n) + rand() * 0.4, o = h * (k ? 0.26 : 0.05), r = h * (kind === 'willow' ? 0.22 : 0.2) * (0.8 + rand() * 0.4);
      bag.add(leaf, blob([x + Math.cos(a) * o, y + th + h * (0.28 + rand() * 0.2) - (kind === 'willow' ? 0.15 * h : 0), z + Math.sin(a) * o], r, r * (kind === 'willow' ? 1.05 : 0.7), r, 7, 4));
    }
  }
  col.circle(x, z, 0.22, y, y + 3);
}

/** wutai_rows { rect, along ('x' | 'z'), spacing, h (the crop's height), seed }: rows of millet in a field, each in runs of 5 m that follow the ground. */
function wutaiRows({ rect, along = 'x', spacing = 0.85, h = 1.25, seed = 1, skip }, { bag }) {
  const [x0, z0, x1, z1] = rect, rand = rng(seed + 11), run = 5;
  const ax = along === 'x', a0 = ax ? x0 : z0, a1 = ax ? x1 : z1, b0 = ax ? z0 : x0, b1 = ax ? z1 : x1;
  for (let b = b0 + spacing / 2; b < b1; b += spacing) for (let a = a0; a < a1 - 0.5; a += run) {
    const e = Math.min(a1, a + run - 0.4 - rand() * 0.5), p = (u, v) => (ax ? [u, v] : [v, u]);
    const [sx, sz] = p((a + e) / 2, b);
    if (skip && skip(sx, sz)) continue;
    const g = Math.min(height(...p(a, b)), height(...p(e, b)), height(sx, sz)), top = g + h * (0.85 + rand() * 0.3);
    const [ra, rb] = [p(a, b - 0.2), p(e, b + 0.2)];
    bag.add('flax_leaf', box(Math.min(ra[0], rb[0]), g - 0.12, Math.min(ra[1], rb[1]), Math.max(ra[0], rb[0]), top, Math.max(ra[1], rb[1])));
    const [ta, tb] = [p(a + 0.4, b - 0.12), p(e - 0.4, b + 0.12)];
    bag.add('thatch', box(Math.min(ta[0], tb[0]), top - 0.02, Math.min(ta[1], tb[1]), Math.max(ta[0], tb[0]), top + 0.2, Math.max(ta[1], tb[1])));
  }
}

/** wutai_lamp { at, y }: a stone lamp pillar (shi deng): a square base, a shaft, a lamp box with four openings and a small roof. */
function wutaiLamp({ at: [x, z], y }, { bag, col }) {
  bag.add('limestone', box(x - 0.4, y - 0.1, z - 0.4, x + 0.4, y + 0.22, z + 0.4));
  bag.add('limestone', lathe([[0.2, 0], [0.16, 0.3], [0.14, 1.3], [0.2, 1.4]], 8, null, x, y + 0.22, z));
  bag.add('limestone', box(x - 0.3, y + 1.62, z - 0.3, x + 0.3, y + 1.72, z + 0.3));
  for (const [a, b] of [[-0.3, -0.3], [0.24, -0.3], [-0.3, 0.24], [0.24, 0.24]]) bag.add('limestone', box(x + a, y + 1.72, z + b, x + a + 0.06, y + 2.1, z + b + 0.06));
  bag.add('lacquer_black', box(x - 0.24, y + 1.74, z - 0.24, x + 0.24, y + 2.08, z + 0.24));
  bag.add('limestone', box(x - 0.45, y + 2.1, z - 0.45, x + 0.45, y + 2.2, z + 0.45));
  bag.add('limestone', box(x - 0.28, y + 2.2, z - 0.28, x + 0.28, y + 2.34, z + 0.28));
  bag.add('limestone', lathe([[0.001, 0], [0.1, 0.02], [0.001, 0.2]], 6, null, x, y + 2.34, z));
  col.circle(x, z, 0.35, y, y + 2.2);
}

/** wutai_scarecrow { at, y, seed }: a cross of poles in an old jacket and a straw hat. */
function wutaiScarecrow({ at: [x, z], y, seed = 1 }, { bag }) {
  const r = rng(seed);
  bag.add('timber', box(x - 0.025, y, z - 0.025, x + 0.025, y + 1.8, z + 0.025));
  bag.add('timber', box(x - 0.5, y + 1.2, z - 0.02, x + 0.5, y + 1.25, z + 0.02));
  bag.add(r() < 0.5 ? 'cloth_indigo' : 'cloth_brown', box(x - 0.42, y + 0.7, z - 0.08, x + 0.42, y + 1.25, z + 0.08));
  bag.add('thatch', lathe([[0.001, 0], [0.32, 0.01], [0.1, 0.12], [0.001, 0.14]], 8, null, x, y + 1.78, z));
  bag.add('cloth_white', box(x - 0.08, y + 1.4, z - 0.1, x + 0.08, y + 1.62, z + 0.1));
  bag.add('cloth_red', box(x + 0.4, y + 0.5, z - 0.01, x + 0.5, y + 0.9, z + 0.01));
}

/** wutai_cairn { at, y, seed, h }: a heap of flat stones piled by travellers. */
function wutaiCairn({ at: [x, z], y, seed = 1, h = 1.1 }, { bag, col }) {
  const r = rng(seed * 5 + 1);
  for (let k = 0; k < 7; k++) { const t = k / 7, w = (0.55 - t * 0.4) * (0.8 + r() * 0.4); const cx = x + (r() - 0.5) * 0.1, cz = z + (r() - 0.5) * 0.1; bag.add('schist_rubble', box(cx - w, y + t * h - 0.05, cz - w * 0.85, cx + w, y + (t + 1 / 7) * h, cz + w * 0.85)); }
  bag.add('cloth_red', box(x - 0.01, y + h, z - 0.01, x + 0.01, y + h + 0.5, z + 0.01));
  col.circle(x, z, 0.5, y, y + h);
}

const base = STYLES.chinese;
registerStyle('wutai-site', { ...base, elements: { ...base.elements, wutai_tree: wutaiTree, wutai_rows: wutaiRows, wutai_lamp: wutaiLamp, wutai_scarecrow: wutaiScarecrow, wutai_cairn: wutaiCairn } });
