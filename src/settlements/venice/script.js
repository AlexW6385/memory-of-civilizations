// Roman capitals drawn as strokes (docs/settlements/venice.md §5f.5): the lettering of the shop signs and tablets of Venice about 1500.
// Each letter is a few polylines on a unit-high cell, x from 0 to the letter's width, y from 0 (the baseline) to 1 (the cap height);
// curves are polylines of 6–12 points. Only the letters below exist: `strokesOf(word)` throws for any other, so that nothing is ever
// written with a glyph that was not drawn and checked (tests/venice-script.test.mjs prints every letter as a bitmap).
// Pure data and functions; the strokes become thin rods in the styles' builders (venetian/shops.js).

const arc = (cx, cy, rx, ry, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [+(cx + rx * Math.cos(a)).toFixed(3), +(cy + ry * Math.sin(a)).toFixed(3)]; });

/** { letter: { w (the advance's width), s: [polyline, …] } } */
export const GLYPHS = {
  A: { w: 0.64, s: [[[0, 0], [0.32, 1], [0.64, 0]], [[0.12, 0.36], [0.52, 0.36]]] },
  B: { w: 0.56, s: [[[0, 0], [0, 1], [0.32, 1], [0.46, 0.94], [0.5, 0.8], [0.46, 0.66], [0.32, 0.56], [0, 0.56]], [[0.32, 0.56], [0.48, 0.5], [0.56, 0.36], [0.5, 0.14], [0.34, 0.02], [0.28, 0], [0, 0]]] },
  C: { w: 0.62, s: [arc(0.34, 0.5, 0.3, 0.5, 42, 318, 12)] },
  D: { w: 0.62, s: [[[0, 0], [0, 1], [0.24, 1], [0.44, 0.92], [0.56, 0.74], [0.6, 0.5], [0.56, 0.26], [0.44, 0.08], [0.24, 0], [0, 0]]] },
  E: { w: 0.5, s: [[[0.5, 1], [0, 1], [0, 0], [0.5, 0]], [[0, 0.52], [0.4, 0.52]]] },
  F: { w: 0.5, s: [[[0.5, 1], [0, 1], [0, 0]], [[0, 0.52], [0.4, 0.52]]] },
  G: { w: 0.66, s: [[...arc(0.34, 0.5, 0.3, 0.5, 42, 360, 14), [0.36, 0.5]]] },
  H: { w: 0.6, s: [[[0, 0], [0, 1]], [[0.6, 0], [0.6, 1]], [[0, 0.52], [0.6, 0.52]]] },
  I: { w: 0.04, s: [[[0, 0], [0, 1]]] },
  L: { w: 0.48, s: [[[0, 1], [0, 0], [0.48, 0]]] },
  M: { w: 0.78, s: [[[0, 0], [0, 1], [0.39, 0.3], [0.78, 1], [0.78, 0]]] },
  N: { w: 0.62, s: [[[0, 0], [0, 1], [0.62, 0], [0.62, 1]]] },
  O: { w: 0.7, s: [arc(0.35, 0.5, 0.35, 0.5, 0, 360, 16)] },
  P: { w: 0.54, s: [[[0, 0], [0, 1], [0.32, 1], [0.48, 0.92], [0.54, 0.76], [0.48, 0.6], [0.32, 0.5], [0, 0.5]]] },
  R: { w: 0.58, s: [[[0, 0], [0, 1], [0.32, 1], [0.48, 0.92], [0.54, 0.76], [0.48, 0.6], [0.32, 0.5], [0, 0.5]], [[0.3, 0.5], [0.58, 0]]] },
  S: { w: 0.54, s: [[[0.52, 0.86], [0.38, 1], [0.2, 1], [0.05, 0.9], [0.03, 0.72], [0.16, 0.57], [0.34, 0.48], [0.5, 0.36], [0.53, 0.18], [0.4, 0.03], [0.2, 0], [0.04, 0.12]]] },
  T: { w: 0.62, s: [[[0, 1], [0.62, 1]], [[0.31, 1], [0.31, 0]]] },
  U: { w: 0.58, s: [[[0, 1], [0, 0.3], [0.08, 0.1], [0.29, 0], [0.5, 0.1], [0.58, 0.3], [0.58, 1]]] },
  V: { w: 0.64, s: [[[0, 1], [0.32, 0], [0.64, 1]]] },
  X: { w: 0.62, s: [[[0, 1], [0.62, 0]], [[0, 0], [0.62, 1]]] },
  Z: { w: 0.56, s: [[[0, 1], [0.56, 1], [0, 0], [0.56, 0]]] },
};
export const LETTERS = Object.keys(GLYPHS).join('');

/** Width of a word (cap height 1) with the letters `gap` apart and spaces of 0.5. */
export function widthOf(word, gap = 0.2) {
  let w = 0;
  for (const c of word) w += c === ' ' ? 0.5 : (GLYPHS[c] ?? (() => { throw new Error(`no glyph for "${c}"`); })()).w + gap;
  return w - gap;
}
/** The strokes of a word, laid left to right from x = 0 (cap height 1): [[[x, y], …], …]. */
export function strokesOf(word, gap = 0.2) {
  const out = [];
  let x = 0;
  for (const c of word) {
    if (c === ' ') { x += 0.5; continue; }
    const g = GLYPHS[c];
    if (!g) throw new Error(`no glyph for "${c}"`);
    for (const s of g.s) out.push(s.map(([a, b]) => [+(x + a).toFixed(3), b]));
    x += g.w + gap;
  }
  return out;
}
/** A word as a bitmap of characters (for the test: each letter is checked by looking at it). */
export function bitmap(word, rows = 11, gap = 0.3, cols = 5) {
  const W = widthOf(word, gap), nx = Math.ceil(W * cols * 2) + 1, grid = Array.from({ length: rows }, () => Array(nx).fill(' '));
  for (const s of strokesOf(word, gap)) for (let i = 0; i + 1 < s.length; i++) {
    const [a, b] = s[i], [c, d] = s[i + 1], n = Math.max(1, Math.ceil(Math.hypot(c - a, d - b) * 40));
    for (let k = 0; k <= n; k++) { const x = a + (c - a) * k / n, y = b + (d - b) * k / n; grid[rows - 1 - Math.round(y * (rows - 1))][Math.round(x * cols * 2)] = '#'; }
  }
  return grid.map((r) => r.join('').replace(/\s+$/, '')).join('\n');
}
