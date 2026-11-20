// The characters of Himeji's writing (docs/settlements/edo-himeji.md §10.5): the trades named on the kanban boards of the
// merchants' fronts. The brush (src/settlements/ming-suzhou/brush.js) and the characters Suzhou and Kyoto already have and verified
// (酒 茶 米 布 藥 瓷 and the radicals 氵 and 糸) are read from them unchanged; the five below are Himeji's own, in the standard
// (traditional) form with its standard stroke count. Each was laid over a typeface stroke by stroke (tools/script-sheet-himeji.mjs
// then tools/script-sheet.py) and corrected until every stroke sits on its stroke. 油 takes the 氵 of Suzhou's 酒, 紙 the 糸 of its 綠.
import { glyphOf as base, countOf as baseCount } from '../muromachi/script.js';
import { GLYPH as SUZHOU } from '../../settlements/ming-suzhou/brush-data.js';
import { relief } from '../../settlements/ming-suzhou/brush.js';
import { fromTriangles } from '../../core/geom.js';

export const GLYPH = {}, COUNT = {};
const def = (ch, count, strokes) => { GLYPH[ch] = strokes; COUNT[ch] = count; };

const WATER = SUZHOU['酒'].slice(0, 3);     // 氵 as Suzhou's verified 酒 draws it
const SI = SUZHOU['綠'].slice(0, 8);        // 糸 as Suzhou's verified 綠 draws it

def('油', 8, [...WATER, ['s', 40.5, 74, 40.5, 8], ['hz', 41, 71, 86, 71, 86, 10], ['s', 63, 92, 63, 15], ['h', 43, 44, 86, 44], ['h', 41, 15.5, 87, 15.5]]);
def('染', 9, [['d', 15, 90.5, 29, 78, -1.2], ['d', 8, 77, 21, 63, -1.2], ['t', 9, 58, 36, 84],
  ['p', 56, 91, 29, 44, 1, -98, -150], ['hz', 36, 77.5, 75, 77.5, 75, 58], ['wg', 75, 62, 75, 53, 77, 50.5, 85, 50, 89, 64],
  ['h', 9, 36, 92, 36], ['s', 50, 48, 50, 6], ['p', 38, 28, 8, 9, 0.7], ['n', 58, 28, 89, 9, 0.8]]);
def('魚', 11, [['p', 34, 91, 8, 56, 0.5, -118, -150], ['hp', 41, 80, 63, 80, 46, 62],
  ['s', 23, 66, 23, 30], ['hz', 24, 64, 74, 64, 74, 32], ['s', 49, 64, 49, 32], ['h', 24, 50, 74, 50], ['h', 24, 33, 74, 33],
  ['d', 24, 27, 14, 8, -1.2], ['d', 34, 26, 41, 7, 0.5], ['d', 53, 26, 65, 7, 0.8], ['d', 70, 27, 91, 7, -0.9]]);
def('豆', 7, [['h', 8, 82, 91, 82], ['s', 25, 69, 25, 37], ['hz', 26, 68, 74.5, 68, 74.5, 38], ['h', 27, 42.5, 73, 42.5],
  ['d', 32, 36, 40, 13, -0.6], ['p', 70, 35, 53, 12, 0.7], ['h', 8, 10.5, 92, 10.5]]);
def('紙', 10, [...SI, ['s', 47.8, 82, 47.8, 16], ['t', 45, 13, 70, 24], ['h', 51, 79, 86, 90],
  ['wg', 70, 82, 70.5, 60, 72, 45, 77, 30, 84, 18, 89, 11, 92, 10, 91.5, 28], ['h', 51, 51, 92, 51]]);

/** The glyph of a character: Himeji's own, else Kyoto's or Suzhou's (read only). */
export const glyphOf = (c) => GLYPH[c] ?? base(c);
export const countOf = (c) => COUNT[c] ?? baseCount(c);
export const canWrite = (text) => !!text && [...text].every((c) => glyphOf(c));

/** The character a trade writes on its kanban (sandals and buckets have none that is verified: their boards stay plain). */
export const TRADE_MARK = { cloth: '布', pottery: '瓷', rice: '米', dye: '染', oil: '油', sake: '酒', tea: '茶', medicine: '藥', paper: '紙', fish: '魚', tofu: '豆' };

const UNIT = new Map();
/** One character as a flat piece 1 m across facing +z, centred on the origin (as Kyoto's markGeometry); `mirror` flips the strokes for a front the builder mirrors. */
export function markGeometry(ch, mirror = false) {
  const key = ch + (mirror ? '|m' : '');
  let g = UNIT.get(key);
  if (!g) {
    const src = glyphOf(ch), PAIRS = { h: 2, s: 2, x: 2, p: 2, n: 2, d: 2, t: 2, e: 2, sg: 2, hg: 2, hz: 3, hzg: 3, sz: 3, hp: 3 };
    const strokes = mirror ? src.map(([k, ...v]) => { const n = (PAIRS[k] ?? Math.floor(v.length / 2)) * 2, o = [k]; for (let i = 0; i < n; i += 2) o.push(100 - v[i], v[i + 1]); return o.concat(v.slice(n)); }) : src, out = [];
    relief(out, strokes, 0, 0, 1, 0, 0, { flat: true, thick: 1.9 });
    UNIT.set(key, (g = fromTriangles(out)));
  }
  return g;
}
export const markAt = (ch, cx, cy, z, size, mirror = false) => markGeometry(ch, mirror).clone().scale(size, size, 1).translate(cx, cy, z);
/** A mark on a plane facing yaw `face` (0: +z, PI/2: +x, PI: -z, -PI/2: -x), `size` m across, its centre at (cx, cy, cz). */
export function markFacing(ch, cx, cy, cz, size, face = 0) {
  return markGeometry(ch).clone().scale(size, size, 1).rotateY(face).translate(cx, cy, cz);
}
