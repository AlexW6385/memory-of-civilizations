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
