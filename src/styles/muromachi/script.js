// The characters of Muromachi Kyoto's writing (docs/settlements/muromachi-kyoto.md §12): the names on the temples' boards and
// the marks of the trades on the shop curtains. The brush (src/settlements/ming-suzhou/brush.js) is generic: a character is a list of
// strokes [kind, x0, y0, x1, y1, ...] on a 100-unit grid (y up). The characters the Suzhou data already has and that Kyoto needs
// (酒 茶 米 布 金 當 寺 堂 藥) are read from it unchanged; the six below are Kyoto's own, drawn from the standard (traditional)
// form with its standard stroke count, each laid over a typeface stroke by stroke (tools/script-sheet.py, as for Suzhou's) and
// corrected until every stroke sits on its stroke. 龍 is the right-hand part of Suzhou's verified 瓏 (its own 16 strokes) drawn
// across the whole cell, and the heart of 慈 is the heart of Suzhou's verified 恩.
import { GLYPH as SUZHOU, COUNT as SUZHOU_COUNT } from '../../settlements/ming-suzhou/brush-data.js';

export const GLYPH = {}, COUNT = {};
/** How many numbers of a stroke are coordinates (pairs of x, y), by kind; the rest are shape parameters. */
const PAIRS = { h: 2, s: 2, x: 2, p: 2, n: 2, d: 2, t: 2, e: 2, sg: 2, hg: 2, hz: 3, hzg: 3, sz: 3, hp: 3 };
/** A set of strokes with every coordinate mapped by f(x, y). */
const map = (strokes, f) => strokes.map(([k, ...v]) => {
  const n = (PAIRS[k] ?? Math.floor(v.length / 2)) * 2, o = [k];
  for (let i = 0; i < n; i += 2) o.push(...f(v[i], v[i + 1]).map((q) => Math.round(q * 10) / 10));
  return o.concat(v.slice(n));
});
const def = (ch, count, strokes) => { GLYPH[ch] = strokes; COUNT[ch] = count; };

// 恩's heart (x 10…89, y 11…40) as the heart of 慈 (y 4…31)
const HEART = SUZHOU['恩'].slice(6);
// 龍 from 瓏: its last sixteen strokes (x 32…92) across the cell
const LONG = map(SUZHOU['瓏'].slice(4), (x, y) => [3 + (x - 32) * 94 / 60, y]);
// the left 幺 of 慈 and the same shifted to the right
const YAO = [['p', 28, 71, 12, 56, 0.8], ['t', 13, 54, 33, 58], ['p', 40, 65, 13, 41, 0.6], ['t', 14, 36, 42, 40], ['d', 37, 50, 47, 34, -0.8]];

def('慈', 13, [['d', 30, 91, 40, 77, -1.2], ['p', 64, 91, 57, 78, 0.4], ['h', 8, 75, 92, 75],
  ...YAO, ...map(YAO, (x, y) => [x + 38.5, y]),
  ...map(HEART, (x, y) => [x, 11 + (y - 11) * 0.8])]);
def('照', 13, [['s', 16, 86, 16, 29], ['hz', 17, 84, 37, 84, 37, 29], ['h', 17, 61, 37, 61], ['h', 17, 38, 37, 38],
  ['hzg', 47, 84, 86, 84, 80, 62, 14], ['p', 69, 84, 44, 57, 1],
  ['s', 52, 54, 52, 30], ['hz', 53, 54, 84, 54, 84, 30], ['h', 53, 34, 84, 34],
  ['d', 22, 28, 14, 4, 0.5], ['d', 36, 26, 44, 8, -0.5], ['d', 51, 26, 66, 6, -0.6], ['d', 72, 27, 90, 4, -0.8]]);
def('龍', 16, LONG);
def('安', 6, [['d', 45, 92, 56, 81, -0.8], ['d', 16, 74, 9, 60, 0.5], ['hg', 11, 72, 84, 72, 7],
  ['p', 41, 69, 22, 29, 0.6], ['n', 22, 29, 84, 6, 0.4], ['p', 70, 61, 3, 4, 1.3], ['h', 8, 50, 90, 50]]);
def('東', 8, [['h', 9, 76, 91, 76], ['s', 48, 93, 48, 3],
  ['s', 24, 66, 24, 33], ['hz', 25, 64, 77, 64, 77, 33], ['h', 26, 49, 75, 49], ['h', 26, 36, 75, 36],
  ['p', 46, 33, 3, 6, 0.7], ['n', 52, 32, 93, 6, 0.8]]);
def('求', 7, [['h', 9, 69, 91, 69], ['sg', 50, 93, 50, 8, 10], ['d', 20, 62, 35, 43, -0.8], ['t', 10, 22, 47, 42],
  ['d', 60, 87, 76, 73, -1], ['p', 84, 64, 62, 42, 0.6], ['n', 52, 62, 91, 18, 0.8]]);

/** The glyph of a character: Kyoto's own, else the Suzhou data's (read only). */
export const glyphOf = (c) => GLYPH[c] ?? SUZHOU[c];
export const countOf = (c) => COUNT[c] ?? SUZHOU_COUNT[c];
/** Whether every character of the text is one that is drawn and verified. */
export const canWrite = (text) => !!text && [...text].every((c) => glyphOf(c));

// ── the writing as geometry ─────────────────────────────────────────────────────────────────────────
import { relief } from '../../settlements/ming-suzhou/brush.js';
import { fromTriangles } from '../../core/geom.js';
const UNIT = new Map();
/** One character as a flat piece (front faces only, at z = 0.0005 .. 0) 1 m across, facing +z, centred on the origin; `mirror` for a house the style builds mirrored (its builder flips x, so the strokes are flipped first). Cached: clone before use. */
export function markGeometry(ch, mirror = false) {
  const key = ch + (mirror ? '|m' : '');
  let g = UNIT.get(key);
  if (!g) {
    const strokes = mirror ? map(glyphOf(ch), (x, y) => [100 - x, y]) : glyphOf(ch), out = [];
    relief(out, strokes, 0, 0, 1, 0, 0, { flat: true, thick: 1.9 });   // (a curtain's character is bold: dyed in, seen from a street's width)
    UNIT.set(key, (g = fromTriangles(out)));
  }
  return g;
}
/** A mark on a plane z, `size` m across, its centre at (cx, cy): a copy of the cached piece. */
export const markAt = (ch, cx, cy, z, size, mirror = false) => markGeometry(ch, mirror).clone().scale(size, size, 1).translate(cx, cy, z);
/**
 * An inscription of several characters (a gate's plaque), right to left (the first character at the right) facing +z, centred on the origin, as a relief
 * from z0 to z1: `pitch` m between the characters' centres, `size` m across each.
 */
export function inscription(text, { pitch, size, z0 = 0, z1 = 0.012, thick = 1, top = 0.55 }) {
  const out = [], n = [...text].length;
  [...text].forEach((c, i) => relief(out, glyphOf(c), -(i - (n - 1) / 2) * pitch, 0, size, z0, z1, { thick, top }));
  return fromTriangles(out);
}
