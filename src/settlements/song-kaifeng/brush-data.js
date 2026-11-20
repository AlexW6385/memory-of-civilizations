// The characters Bianjing's writing needs that Suzhou's brush data (the generic brush model, read-only) does not hold: 店 肉
// (the shop signs and flags of the scroll: 正店, the butcher's block) and the sign-and-flag set 酒 茶 米 藥 書 金 that Suzhou's data has.
// Written as ming-suzhou/brush-data.js is: traditional forms in regular script, each a list of strokes for brush.js on a 100-unit grid
// (y up), its stroke count the standard one, each laid over the reference typeface stroke by stroke (tools/script-sheet.mjs and
// tools/script-sheet.py, pointed at this file) before use. GLYPH here is Suzhou's characters plus these.
import { GLYPH as BASE, COUNT as BASE_COUNT } from '../ming-suzhou/brush-data.js';

export const GLYPH = { ...BASE };
export const COUNT = { ...BASE_COUNT };
const def = (ch, count, strokes) => { GLYPH[ch] = strokes; COUNT[ch] = count; };
export const OWN = '店肉';

def('店', 8, [['d', 50, 93, 57, 80], ['h', 18, 76, 93, 76], ['p', 19, 76, 7, 6], ['s', 52, 78, 52, 39], ['h', 52, 57, 88, 57],
  ['s', 35, 39, 35, 12], ['hzg', 35, 39, 79, 39, 79, 10, 8], ['h', 35, 12, 80, 12]]);
def('肉', 6, [['s', 15, 74, 15, 8], ['hzg', 15, 74, 85, 74, 85, 8, 8], ['p', 50, 91, 27, 47], ['n', 50, 91, 77, 47],
  ['p', 50, 52, 28, 22], ['n', 50, 52, 76, 22]]);
