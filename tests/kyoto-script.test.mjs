// Kyoto's writing (src/styles/muromachi/script.js, boards.js; docs/settlements/muromachi-kyoto.md §12): every character that is written is a
// verified one, drawn inside its cell, and the boards and curtains are made of them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPH, COUNT, glyphOf, canWrite, markGeometry, inscription } from '../src/styles/muromachi/script.js';

const KINDS = new Set(['h', 's', 'x', 'p', 'n', 'd', 't', 'e', 'sg', 'hz', 'hzg', 'sz', 'hg', 'wg', 'hp', 'z', 'c']);
test('the six characters are drawn with the standard stroke counts, inside the cell', () => {
  assert.deepEqual(Object.keys(GLYPH).sort(), [...'慈照龍安東求'].sort());
  const standard = { 慈: 13, 照: 13, 龍: 16, 安: 6, 東: 8, 求: 7 };
  for (const [c, n] of Object.entries(standard)) {
    assert.equal(COUNT[c], n, c);
    for (const [k, ...v] of GLYPH[c]) { assert.ok(KINDS.has(k), `${c}: kind ${k}`); assert.ok(v.slice(0, 2).every((q) => q > -1 && q < 101), `${c}: ${k} ${v}`); }
    assert.ok(GLYPH[c].length >= n, c);       // (a stroke of two parts, as 安's 撇點, is two entries)
  }
});
test('what is written on the boards and the curtains can be written', () => {
  for (const t of ['慈照寺', '龍安寺', '東求堂']) assert.ok(canWrite(t), t);
  for (const c of '酒茶米布當瓷漆') assert.ok(glyphOf(c), c);
  assert.ok(!canWrite('鑫閣'), 'a character that is not drawn is refused');
});
test('the geometry of a mark and of an inscription is finite and lies where it is put', () => {
  for (const mirror of [false, true]) for (const c of '茶酒米布當瓷漆') {
    const g = markGeometry(c, mirror), P = g.attributes.position.array;
    assert.ok(P.length > 0 && P.every(Number.isFinite), c);
    for (let i = 0; i < P.length; i += 3) assert.ok(Math.abs(P[i]) < 0.6 && Math.abs(P[i + 1]) < 0.6, c);
  }
  const g = inscription('慈照寺', { pitch: 0.4, size: 0.38 }), P = g.attributes.position.array;
  let x0 = 1e9, x1 = -1e9; for (let i = 0; i < P.length; i += 3) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); }
  assert.ok(x0 > -0.7 && x1 < 0.7 && x1 - x0 > 0.9, `${x0} ${x1}`);
});
