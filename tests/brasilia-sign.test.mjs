// The block alphabet of Brasília's signs (src/styles/brasilia/sign.js): every glyph well-formed and distinct, symmetric where the letter is,
// every word of the signs spelt only with glyphs that exist, the Portuguese trade names as written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPHS, WORDS, widthOf } from '../src/styles/brasilia/sign.js';
import { TRADES } from '../src/styles/brasilia/trades.js';

test('glyphs: five rows of one width, lit cells in every row-set, all different', () => {
  const seen = new Map();
  for (const [ch, g] of Object.entries(GLYPHS)) {
    assert.equal(g.length, 5, ch);
    assert.ok(g.every((r) => r.length === g[0].length && /^[01]+$/.test(r)), ch);
    const lit = g.join('').split('1').length - 1;
    assert.ok(lit >= 5 && lit <= 14, `${ch} has ${lit} lit cells`);
    assert.ok(!seen.has(g.join('/')), `${ch} is the same as ${seen.get(g.join('/'))}`);
    seen.set(g.join('/'), ch);
  }
  for (const ch of 'AHIMOTU') assert.ok(GLYPHS[ch].every((r) => r === [...r].reverse().join('')), `${ch} is symmetric`);
  assert.deepEqual(GLYPHS.L, ['100', '100', '100', '100', '111']);
  assert.deepEqual(GLYPHS.T, ['111', '010', '010', '010', '010']);
});

test('the words: spelt as written, with the glyphs that exist, a word for each trade', () => {
  const spelt = { padaria: 'PADARIA', banca: 'JORNAIS', armarinho: 'ARMARINHO', farmacia: 'FARMACIA', lanchonete: 'LANCHONETE', mercearia: 'MERCEARIA', sapataria: 'SAPATARIA', barbearia: 'BARBEARIA', papelaria: 'PAPELARIA', acougue: 'ACOUGUE', hortifruti: 'HORTIFRUTI', otica: 'OTICA', escola: 'ESCOLA CLASSE' };
  for (const t of TRADES) assert.ok(WORDS[t], t);
  for (const [k, w] of Object.entries(WORDS)) {
    assert.equal(w.text, spelt[k], k);
    for (const ch of w.text) assert.ok(ch === ' ' || GLYPHS[ch], `${k}: ${ch}`);
    for (const [i, kind] of w.marks ?? []) { assert.ok(['acute', 'cedilla'].includes(kind)); assert.equal(w.text[i], kind === 'cedilla' ? 'C' : w.text[i]); }
    assert.ok(widthOf(w.text) * 0.052 < 3.7, `${k} fits a 3.8 m board`);
  }
  assert.equal(WORDS.farmacia.marks[0][0], 1, 'the acute is on the A of FARMÁCIA');
  assert.equal(WORDS.otica.marks[0][0], 0, 'the acute is on the O of ÓTICA');
});
