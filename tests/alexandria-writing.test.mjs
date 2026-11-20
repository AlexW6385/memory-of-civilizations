// What is written in Alexandria (docs/settlements/alexandria.md §16.5): every text is made of letters in the table of src/styles/ptolemaic/script.js, fits its board, and the table has the letters it claims.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPHS, layout, missing, SHOP_WORD, DECREE, TARIFF, PHAROS_DEDICATION } from '../src/styles/ptolemaic/script.js';

test('every word of every sign and tablet can be written, and nothing else is accepted', () => {
  const texts = [...Object.values(SHOP_WORD), ...DECREE, ...TARIFF, ...PHAROS_DEDICATION];
  for (const t of texts) assert.deepEqual(missing(t), [], t);
  assert.throws(() => layout('ΑΒΓ q'), /no glyph/);
  assert.ok(GLYPHS['Ω'] && GLYPHS['Ξ']);
  for (const g of Object.values(GLYPHS)) for (const line of g.s) for (const [x, y] of line) assert.ok(x >= -0.01 && x <= g.w + 0.05 && y >= -0.01 && y <= 1.01);
});
test('the words are the Greek words (spelling fixed here)', () => {
  assert.deepEqual(SHOP_WORD, { bronze: 'ΧΑΛΚΟΣ', perfume: 'ΜΥΡΟΝ', cloth: 'ΙΜΑΤΙΑ', wine: 'ΟΙΝΟΣ', oil: 'ΕΛΑΙΟΝ', grain: 'ΣΙΤΟΣ', fish: 'ΙΧΘΥΕΣ', pottery: 'ΚΕΡΑΜΟΣ', papyrus: 'ΒΥΒΛΟΙ', bread: 'ΑΡΤΟΙ', sandals: 'ΥΠΟΔΗΜΑΤΑ' });
  assert.equal(PHAROS_DEDICATION.join(' '), 'ΣΩΣΤΡΑΤΟΣ ΔΕΞΙΦΑΝΟΥΣ ΚΝΙΔΙΟΣ ΘΕΟΙΣ ΣΩΤΗΡΣΙΝ ΥΠΕΡ ΤΩΝ ΠΛΩΙΖΟΜΕΝΩΝ');
});
test('the texts fit: the signs on a one-metre board, the dedication in the ten-metre band', () => {
  for (const w of Object.values(SHOP_WORD)) assert.ok(layout(w, 0.2).width * Math.min(0.26, 0.86 / layout(w, 0.2).width) <= 0.87, w);
  for (const t of PHAROS_DEDICATION) assert.ok(layout(t, 0.16).width * 0.31 < 9.6, `${t}: ${layout(t, 0.16).width * 0.31} m`);
  assert.ok(layout(DECREE[1], 0.2).width * 0.06 < 0.55 && layout(TARIFF[0], 0.2).width * 0.09 < 0.55);
});
