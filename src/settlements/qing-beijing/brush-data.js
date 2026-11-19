// The characters Beijing's writing needs that Suzhou's brush data (the generic brush model, read-only) does not hold: 午 門 中 保 殿,
// for the plaques of the Meridian Gate and the three great halls (docs/settlements/qing-beijing.md §42). Written the same way as
// ming-suzhou/brush-data.js: traditional forms in regular script, each a list of strokes on a 100-unit grid (y up), its stroke count the
// standard one, every one laid over the reference typeface stroke by stroke (tools/script-sheet.mjs, tools/script-sheet.py) before use.
// GLYPH here is Suzhou's characters plus these (太 和 are Suzhou's; 午 門 中 保 殿 are ours).
import { GLYPH as BASE, COUNT as BASE_COUNT } from '../ming-suzhou/brush-data.js';

export const GLYPH = { ...BASE };
export const COUNT = { ...BASE_COUNT };
const def = (ch, count, strokes) => { GLYPH[ch] = strokes; COUNT[ch] = count; };
export const OWN = '午門中保殿';

def('午', 4, [['p', 28, 91, 10, 52], ['h', 27, 74, 85, 74], ['h', 8, 46, 91, 46], ['s', 49, 76, 49, 7]]);
def('門', 8, [['s', 16, 87, 16, 7], ['hz', 16, 84, 40, 84, 40, 51], ['h', 17, 70, 40, 70], ['h', 17, 56, 40, 56],
  ['s', 58, 86, 58, 52], ['hzg', 58, 84, 84, 84, 84, 8, 18], ['h', 59, 70, 84, 70], ['h', 59, 56, 84, 56]]);
def('中', 4, [['s', 16, 74, 16, 33], ['hz', 16, 71, 85, 71, 84, 34], ['h', 18, 43, 83, 43], ['s', 50, 91, 50, 6]]);
def('保', 9, [['p', 29, 91, 6, 45], ['s', 22, 66, 22, 7], ['s', 43, 88, 43, 53], ['hz', 43, 84, 79, 84, 79, 54], ['h', 44, 61, 78, 61],
  ['h', 30, 43, 92, 43], ['s', 61, 62, 61, 6], ['p', 52, 38, 28, 10], ['n', 69, 38, 91, 11, 1.5]]);
def('殿', 13, [['hz', 14, 85, 47, 85, 47, 66], ['h', 15, 69, 47, 69], ['p', 16, 88, 7, 7, 1, -92, -118],
  ['h', 19, 50.5, 52, 50.5], ['s', 28.4, 63, 28.4, 33], ['s', 40.4, 63, 40.4, 33], ['h', 18, 32.5, 54, 32.5],
  ['p', 27, 27, 15, 8], ['n', 38, 27, 49, 12],
  ['p', 60, 89, 53, 53, 1, -88, -135], ['wg', 64, 85, 77, 85, 79, 72, 79, 62, 82, 59.5, 90, 59.5, 93, 62],
  ['hp', 54, 48, 86, 48, 46, 7], ['n', 60, 47, 92, 8]]);
