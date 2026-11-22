// The writing of the Dacheng Hall (docs/settlements/lu-qufu.md §10): the characters of its name board and of the imperial plaques hung in it,
// as tapered brush strokes on the grid of the shops' glyphs (shops.js). The strokes are schematic: right in kind and place, not calligraphy.
import { GLYPHS, glyph } from './shops.js';
import { fromTriangles } from '../../core/geom.js';
import { relief } from '../../settlements/ming-suzhou/brush.js';
import { GLYPH, COUNT } from '../../settlements/ming-suzhou/brush-data.js';

Object.assign(GLYPHS, {
  大: [['h', 8, 62, 92, 62], ['p', 52, 98, 14, 4], ['n', 50, 62, 94, 4]],
  成: [['h', 14, 84, 66, 84], ['p', 34, 96, 16, 36], ['h', 14, 58, 70, 58], ['s', 40, 58, 40, 14], ['n', 40, 14, 76, 8], ['d', 80, 66, 90, 56], ['p', 72, 90, 52, 60], ['d', 84, 92, 92, 84]],
  殿: [['h', 12, 88, 52, 88], ['s', 22, 88, 22, 46], ['h', 22, 46, 52, 46], ['h', 14, 66, 52, 66], ['s', 40, 88, 40, 20], ['h', 56, 90, 90, 90], ['p', 66, 78, 54, 40], ['h', 58, 56, 90, 56], ['p', 74, 56, 58, 6], ['n', 62, 42, 94, 8]],
  万: [['h', 10, 88, 90, 88], ['p', 48, 88, 12, 12], ['s', 54, 88, 54, 12], ['n', 54, 14, 82, 8]],
  世: [['s', 28, 94, 28, 36], ['s', 52, 98, 52, 34], ['s', 74, 94, 74, 36], ['h', 12, 70, 88, 70], ['h', 24, 34, 88, 34], ['h', 14, 14, 86, 14]],
  师: [['p', 20, 92, 10, 64], ['s', 22, 76, 22, 8], ['h', 22, 56, 40, 40], ['s', 44, 82, 44, 12], ['h', 44, 82, 90, 82], ['s', 64, 82, 64, 12], ['s', 84, 82, 84, 40]],
  表: [['h', 14, 92, 86, 92], ['h', 20, 74, 80, 74], ['s', 50, 98, 50, 46], ['p', 50, 54, 14, 20], ['n', 50, 54, 90, 20], ['p', 46, 44, 18, 8], ['n', 54, 44, 82, 8]],
  至: [['h', 18, 94, 82, 94], ['p', 70, 94, 24, 66], ['h', 30, 68, 74, 68], ['h', 22, 48, 78, 48], ['s', 50, 48, 50, 12], ['h', 10, 12, 90, 12]],
  圣: [['h', 14, 94, 78, 94], ['s', 46, 94, 46, 72], ['h', 12, 72, 88, 72], ['p', 60, 62, 22, 40], ['h', 30, 34, 70, 34], ['s', 50, 34, 50, 10], ['h', 12, 10, 88, 10]],
  杏: [['h', 10, 84, 90, 84], ['s', 50, 98, 50, 46], ['p', 48, 82, 12, 50], ['n', 52, 82, 90, 50], ['s', 30, 36, 30, 8], ['h', 30, 36, 70, 36], ['s', 70, 36, 70, 8], ['h', 30, 8, 70, 8]],
  坛: [['h', 12, 70, 42, 70], ['s', 28, 88, 28, 22], ['h', 8, 22, 48, 22], ['h', 58, 88, 90, 88], ['h', 52, 66, 94, 66], ['p', 82, 66, 58, 26], ['n', 58, 26, 92, 30], ['d', 80, 18, 90, 10]],
});

export { glyph };

/** True when every character of the text is in the checked table (ming-suzhou/brush-data.js: each laid over the reference typeface; docs/settlements/ming-suzhou.md §27). */
export const canWrite = (text) => [...text].every((c) => GLYPH[c] && COUNT[c]);
/** A vertical line of checked characters, raised in gilt: the first at the top, the next below at `pitch`; centre (x, y of the first), the board's face plane z0 to z1. Text with an unchecked character is not drawn. */
export function writeColumn(bag, text, x, y, z0, z1, pitch, size) {
  if (!canWrite(text)) return false;
  const out = [];
  [...text].forEach((c, k) => relief(out, GLYPH[c], x, y - k * pitch, size, z0, z1, { thick: 1.25, top: 0.55 }));
  bag.add('gilt_bronze', fromTriangles(out));
  return true;
}
/** A horizontal line of checked characters, raised in gilt and read right to left (the first character at the right): centre (x, y), face plane z0 to z1. Text with an unchecked character is not drawn. */
export function writeRow(bag, text, x, y, z0, z1, pitch, size) {
  if (!canWrite(text)) return false;
  const out = [], n = [...text].length;
  [...text].forEach((c, k) => relief(out, GLYPH[c], x + ((n - 1) / 2 - k) * pitch, y, size, z0, z1, { thick: 1.25, top: 0.55 }));
  bag.add('gilt_bronze', fromTriangles(out));
  return true;
}
