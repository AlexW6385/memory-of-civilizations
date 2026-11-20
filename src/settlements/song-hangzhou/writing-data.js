// Characters of Lin'an's writing that Suzhou's brush data (src/settlements/ming-suzhou/brush-data.js, read-only) does not have: traditional forms in
// regular script, as strokes for brush.js on a 100-unit grid (y up), each checked stroke by stroke against the standard form with tools/script-sheet.mjs
// and .py (typeface Noto Serif CJK TC as the measure). Stroke counts are the standard counts.
export const GLYPH_HZ = {};
export const COUNT_HZ = {};
const def = (ch, count, strokes) => { GLYPH_HZ[ch] = strokes; COUNT_HZ[ch] = count; };

// 六 (4): dot, heng, then the pie and the dian of the 八 below
def('六', 4, [['d', 42, 93, 58, 74, -0.5], ['h', 10, 66, 90, 66], ['p', 47, 58, 8, 8], ['d', 56, 56, 89, 8, -1.2]]);
