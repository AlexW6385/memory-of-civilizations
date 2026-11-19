// The writing on Ming Suzhou's boards, tablets and signs (docs/settlements/ming-suzhou.md §23): the characters
// of brush-data.js made into relief by brush.js, laid out as Ming writing reads: a horizontal board right to left
// (the first character at the right), a vertical one top to bottom.
import { fromTriangles } from '../../core/geom.js';
import { GLYPH, COUNT } from './brush-data.js';
import { relief, reliefGeometry, weightOf } from './brush.js';

export { GLYPH, COUNT };
/** Whether every character of the text is one the script has (each verified stroke by stroke: tools/script-sheet.mjs). */
export const canWrite = (text) => !!text && [...text].every((c) => GLYPH[c]);

/** The centres of an inscription's characters, [x, y] in metres about its middle, in reading order. */
export function placesOf(text, pitch, vertical = false) {
  const n = [...text].length;
  return Array.from({ length: n }, (_, i) => { const o = (i - (n - 1) / 2) * pitch; return vertical ? [0, -o] : [-o, 0]; });
}

/**
 * The geometry of an inscription facing +z, centred on the origin: its characters right to left (top to bottom when
 * vertical) at `pitch` m, each `size` m across, from z0 (the foot of the relief) to z1 (its face). `thick` scales the
 * strokes; `flat` gives the front faces only, at z0 (the form seen from far off).
 */
export function inscription(text, { pitch, size, z0 = 0, z1 = 0.012, vertical = false, thick = 1, top = 0.55, flat = false }) {
  const out = [], at = placesOf(text, pitch, vertical);
  [...text].forEach((c, i) => relief(out, GLYPH[c], at[i][0], at[i][1], size, z0, z1, { thick, top, flat }));
  return fromTriangles(out);
}

/** One character as a unit of 1 m across, centred on the origin, for placing by matrix (shop signs). */
export const glyphGeometry = (ch, z0, z1, o = {}) => reliefGeometry(GLYPH[ch], 0, 0, 1, z0, z1, o);
export { weightOf };
