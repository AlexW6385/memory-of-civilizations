// Greek capitals as strokes, for what was written in Athens about 410 BC (docs/settlements/athens.md §18e): the boundary stone of the
// Agora, the heading of a decree, the herms' sayings. Each letter is a few polylines in a box 0.72 wide and 1 high (M a little wider);
// `inscribe` lays them on a wall face as thin rods of one material (the red the letters were painted in). Only the letters of the Attic
// alphabet that these texts use are drawn: A B Γ Δ E Z H Θ I K Λ M N O Π P Σ T Υ Φ Χ; a letter not in the table makes the text refuse
// (it throws), so that nothing is ever written wrong.
import { rod } from '../../core/geom.js';

const arc = (cx, cy, rx, ry, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const PI = Math.PI;
/** The letters: { w (advance), s: [polyline, …] }. */
export const GLYPHS = {
  'Α': { w: 0.72, s: [[[0, 0], [0.36, 1], [0.72, 0]], [[0.14, 0.4], [0.58, 0.4]]] },
  'Β': { w: 0.62, s: [[[0, 0], [0, 1]], [[0, 1], [0.3, 1], ...arc(0.3, 0.76, 0.2, 0.24, PI / 2, -PI / 2, 6).slice(1), [0, 0.52]], [[0, 0.52], [0.36, 0.52], ...arc(0.36, 0.26, 0.24, 0.26, PI / 2, -PI / 2, 6).slice(1), [0, 0]]] },
  'Γ': { w: 0.62, s: [[[0, 0], [0, 1], [0.6, 1]]] },
  'Δ': { w: 0.72, s: [[[0, 0], [0.36, 1], [0.72, 0], [0, 0]]] },
  'Ε': { w: 0.62, s: [[[0.6, 1], [0, 1], [0, 0], [0.6, 0]], [[0, 0.5], [0.46, 0.5]]] },
  'Ζ': { w: 0.62, s: [[[0, 1], [0.6, 1], [0, 0], [0.6, 0]]] },
  'Η': { w: 0.66, s: [[[0, 0], [0, 1]], [[0.62, 0], [0.62, 1]], [[0, 0.5], [0.62, 0.5]]] },
  'Θ': { w: 0.74, s: [arc(0.36, 0.5, 0.36, 0.5, 0, 2 * PI, 14), [[0.12, 0.5], [0.6, 0.5]]] },
  'Ι': { w: 0.2, s: [[[0.08, 0], [0.08, 1]]] },
  'Κ': { w: 0.66, s: [[[0, 0], [0, 1]], [[0.62, 1], [0, 0.42]], [[0.14, 0.56], [0.62, 0]]] },
  'Λ': { w: 0.7, s: [[[0, 0], [0.32, 1], [0.64, 0]]] },
  'Μ': { w: 0.84, s: [[[0, 0], [0, 1], [0.42, 0.3], [0.84, 1], [0.84, 0]]] },
  'Ν': { w: 0.66, s: [[[0, 0], [0, 1], [0.62, 0], [0.62, 1]]] },
  'Ο': { w: 0.74, s: [arc(0.36, 0.5, 0.36, 0.5, 0, 2 * PI, 14)] },
  'Π': { w: 0.66, s: [[[0, 0], [0, 1], [0.62, 1], [0.62, 0]]] },
  'Ρ': { w: 0.58, s: [[[0, 0], [0, 1]], [[0, 1], [0.3, 1], ...arc(0.3, 0.74, 0.24, 0.26, PI / 2, -PI / 2, 6).slice(1), [0, 0.48]]] },
  'Σ': { w: 0.62, s: [[[0.6, 1], [0, 1], [0.32, 0.5], [0, 0], [0.6, 0]]] },
  'Τ': { w: 0.66, s: [[[0, 1], [0.62, 1]], [[0.31, 1], [0.31, 0]]] },
  'Υ': { w: 0.66, s: [[[0, 1], [0.32, 0.5], [0.64, 1]], [[0.32, 0.5], [0.32, 0]]] },
  'Φ': { w: 0.74, s: [arc(0.36, 0.52, 0.3, 0.26, 0, 2 * PI, 12), [[0.36, 0], [0.36, 1]]] },
  'Χ': { w: 0.66, s: [[[0, 0], [0.62, 1]], [[0, 1], [0.62, 0]]] },
};

/** The strokes of a line of text: { segs: [[x0, y0, x1, y1], …] in units of the letter height, from x = 0, width }. `pitch` the gap added after each letter (stoichedon: every letter in a cell of its own, the same width). */
export function layout(text, pitch = 0.28, cell = 0) {
  const segs = []; let x = 0;
  for (const ch of text) {
    if (ch === ' ') { x += cell || 0.5; continue; }
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch} (${text})`);
    const ox = cell ? (cell - g.w) / 2 : 0;
    for (const line of g.s) for (let i = 0; i + 1 < line.length; i++) segs.push([x + ox + line[i][0], line[i][1], x + ox + line[i + 1][0], line[i + 1][1]]);
    x += cell || g.w + pitch;
  }
  return { segs, width: Math.max(0, x - (cell ? 0 : pitch)) };
}

/**
 * Lay lines of text on a wall face: o = { at: [x, z] (the middle of the block), n: [nx, nz] (the face's outward normal), y (the top of
 * the first line), h (letter height, m), mat, line (line pitch in letter heights), stoichedon (cell width in letter heights: each letter
 * in a square cell, the lines' letters one beneath another, as the Athenian decrees were cut) }.
 * Each stroke is a three-sided rod, 3 mm clear of the face; `bag` takes one piece per material (the caller merges).
 */
export function inscribe(bag, lines, { at, n, y, h = 0.05, mat = 'wall_red', line = 1.55, stoichedon = 0, pitch = 0.28 }) {
  const r = [n[1], -n[0]], rad = Math.max(0.0016, h * 0.055), gap = 0.003 + rad * 0.4;
  const rows = lines.map((t) => layout(t, pitch, stoichedon ? stoichedon : 0));
  rows.forEach((row, i) => {
    const u0 = -row.width * h / 2, yy = y - h - i * line * h;
    for (const [x0, y0, x1, y1] of row.segs) {
      const P = (x, yv) => [at[0] + r[0] * (u0 + x * h) + n[0] * gap, yy + yv * h, at[1] + r[1] * (u0 + x * h) + n[1] * gap];
      bag.add(mat, rod(P(x0, y0), P(x1, y1), rad, 3));
    }
  });
  return rows.length;
}
