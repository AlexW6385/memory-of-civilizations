// The brush table of Ming Suzhou (src/settlements/ming-suzhou/brush-data.js, docs/settlements/ming-suzhou.md §23): every
// character is a list of known stroke kinds inside the 100-unit cell, declares its standard stroke count, and the
// characters added in round two have the standard counts of their traditional forms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPH, COUNT } from '../src/settlements/ming-suzhou/brush-data.js';
import { outlines } from '../src/settlements/ming-suzhou/brush.js';

const KINDS = new Set(['h', 's', 'x', 'p', 'n', 'd', 't', 'e', 'sg', 'hz', 'hzg', 'sz', 'hg', 'wg', 'hp', 'z', 'c']);
// the characters added for the other settlements, with their standard stroke counts
const ADDED = { 少: 4, 林: 8, 年: 6, 清: 11, 宮: 10, 午: 4, 門: 8, 高: 10, 孔: 4, 莫: 10, 油: 8, 肉: 6, 魚: 11, 客: 9, 忠: 8, 厚: 9, 詩: 13, 仞: 5, 紙: 10, 雁: 12 };
// round three, each overlaid on the reference typeface (docs/settlements/ming-suzhou.md §27.1)
const ADDED3 = { 祈: 8, 乾: 11, 承: 8, 啟: 11, 煙: 13, 菜: 11, 窟: 13, 廟: 15, 成: 6, 萬: 12, 鞍: 15, 鐵: 21, 鹽: 24, 筆: 12, 棧: 12, 飯: 12, 傳: 13, 家: 10, 久: 3, 繼: 20, 世: 5, 長: 8 };
// numerals, directions and trade characters, same method
const ADDED4 = { 一: 1, 二: 2, 三: 3, 五: 4, 六: 4, 七: 2, 八: 2, 九: 2, 十: 2, 百: 6, 千: 3, 上: 3, 下: 3, 中: 4, 左: 5, 右: 5,
  木: 4, 石: 5, 井: 4, 東: 8, 西: 6, 車: 7, 行: 6, 店: 8, 記: 10, 炭: 9, 南: 9, 馬: 10,
  銀: 14, 銅: 14, 錫: 16, 針: 10, 絲: 12, 綢: 14, 帽: 12, 鞋: 15 };
Object.assign(ADDED, ADDED3, ADDED4);

test('every character uses known stroke kinds inside the cell and has a declared count', () => {
  for (const [c, strokes] of Object.entries(GLYPH)) {
    assert.ok(COUNT[c] > 0 && strokes.length >= 1, c);
    for (const [k, ...v] of strokes) {
      assert.ok(KINDS.has(k), `${c}: kind ${k}`);
      const n = ({ hz: 6, hzg: 6, sz: 6, hp: 6, wg: v.length, z: v.length, c: v.length })[k] ?? 4;   // (the rest are bend angles)
      for (let i = 0; i + 1 < n; i += 2) assert.ok(v[i] > -1 && v[i] < 101 && v[i + 1] > -1 && v[i + 1] < 101, `${c}: ${k} ${v}`);
    }
  }
});
test('the added characters have the standard stroke counts and draw to finite outlines', () => {
  for (const [c, n] of Object.entries(ADDED)) {
    assert.ok(GLYPH[c], `${c} is missing`);
    assert.equal(COUNT[c], n, c);
    assert.ok(GLYPH[c].length >= n, `${c}: ${GLYPH[c].length} pieces for ${n} strokes`);
    const polys = outlines(GLYPH[c]);
    assert.ok(polys.length >= n && polys.every((p) => p.poly.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && x > -8 && x < 108 && y > -8 && y < 108)), c);
  }
});
