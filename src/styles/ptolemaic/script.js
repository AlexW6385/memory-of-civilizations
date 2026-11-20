// Greek capitals as strokes, for what was written in Alexandria about 250 BC (docs/settlements/alexandria.md §16.5): the shop signs, the heads of the
// stelae, the dedication of the Pharos. The letters are the verified ones of Athens (src/settlements/athens/script.js, read there, not changed): A B Γ Δ E Z H Θ I K Λ M N O Π P Σ T Υ Φ Χ,
// with Ξ (three bars, the middle one shorter) and Ω (the open ring on two feet) added here, both as the Ionic alphabet that Ptolemaic Egypt wrote has them. A letter not in the table
// makes the text refuse (it throws), so that nothing is ever written wrong. `inscribe` lays the strokes on a wall face as thin rods of one material.
import { rod } from '../../core/geom.js';
import { GLYPHS as ATHENS } from '../../settlements/athens/script.js';

const PI = Math.PI;
const arc = (cx, cy, rx, ry, a0, a1, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const OM = arc(0.36, 0.56, 0.32, 0.44, PI + 0.6, -0.6, 12);
export const GLYPHS = {
  ...ATHENS,
  'Ξ': { w: 0.62, s: [[[0, 1], [0.6, 1]], [[0.12, 0.5], [0.48, 0.5]], [[0, 0], [0.6, 0]]] },
  'Ω': { w: 0.74, s: [[[0.0, 0], [0.22, 0], OM[0], ...OM.slice(1, -1), OM[OM.length - 1], [0.5, 0], [0.72, 0]]] },
};
/** The letters a text uses that the table lacks ([] when it can be written). */
export const missing = (text) => [...new Set([...text].filter((c) => c !== ' ' && !GLYPHS[c]))];

/** The strokes of a line of text: { segs: [[x0, y0, x1, y1], …] in units of the letter height, from x = 0, width }. */
export function layout(text, pitch = 0.28) {
  const segs = []; let x = 0;
  for (const ch of text) {
    if (ch === ' ') { x += 0.5; continue; }
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch} (${text})`);
    for (const line of g.s) for (let i = 0; i + 1 < line.length; i++) segs.push([x + line[i][0], line[i][1], x + line[i + 1][0], line[i + 1][1]]);
    x += g.w + pitch;
  }
  return { segs, width: Math.max(0, x - pitch) };
}
/**
 * Lay lines of text on a wall face: o = { at: [x, z] (the middle of the block), n: [nx, nz] (the face's outward normal), y (the top of the first line), h (letter height, m),
 * mat, line (line pitch in letter heights), pitch }. Each stroke is a three-sided rod 3 mm clear of the face. Returns the width of the widest line (m).
 */
export function inscribe(bag, lines, { at, n, y, h = 0.05, mat = 'wall_red', line = 1.55, pitch = 0.28 }) {
  const r = [n[1], -n[0]], rad = Math.max(0.0016, h * 0.055), gap = 0.003 + rad * 0.4;
  const rows = lines.map((t) => layout(t, pitch));
  rows.forEach((row, i) => {
    const u0 = -row.width * h / 2, yy = y - h - i * line * h;
    for (const [x0, y0, x1, y1] of row.segs) {
      const P = (x, yv) => [at[0] + r[0] * (u0 + x * h) + n[0] * gap, yy + yv * h, at[1] + r[1] * (u0 + x * h) + n[1] * gap];
      bag.add(mat, rod(P(x0, y0), P(x1, y1), rad, 3));
    }
  });
  return Math.max(0, ...rows.map((q) => q.width * h));
}
/** What the signs and tablets say (each checked against the table by tests/alexandria-writing.test.mjs). */
export const SHOP_WORD = { bronze: 'ΧΑΛΚΟΣ', perfume: 'ΜΥΡΟΝ', cloth: 'ΙΜΑΤΙΑ', wine: 'ΟΙΝΟΣ', oil: 'ΕΛΑΙΟΝ', grain: 'ΣΙΤΟΣ', fish: 'ΙΧΘΥΕΣ', pottery: 'ΚΕΡΑΜΟΣ', papyrus: 'ΒΥΒΛΟΙ', bread: 'ΑΡΤΟΙ', sandals: 'ΥΠΟΔΗΜΑΤΑ' };
export const DECREE = ['ΒΑΣΙΛΕΥΣ', 'ΠΤΟΛΕΜΑΙΟΣ'];
export const TARIFF = ['ΤΕΛΟΣ'];
export const PHAROS_DEDICATION = ['ΣΩΣΤΡΑΤΟΣ ΔΕΞΙΦΑΝΟΥΣ ΚΝΙΔΙΟΣ', 'ΘΕΟΙΣ ΣΩΤΗΡΣΙΝ ΥΠΕΡ ΤΩΝ ΠΛΩΙΖΟΜΕΝΩΝ'];
