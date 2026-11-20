// The writing on Barcelona's shop fascias (src/styles/modernisme/signs.js, docs/settlements/barcelona.md §14.5): every word is in the alphabet the lettering can write,
// each of the town's 150 boards carries a text that fits its length at a legible height, and the house names are real Catalan surnames of the list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signText, writeSign, WORDS, HOUSES } from '../src/styles/modernisme/signs.js';
import { widthOf } from '../src/styles/victorian/letters.js';
import { blockElements } from '../src/settlements/barcelona/town.js';
import { blockShops } from '../src/styles/modernisme/index.js';

const ALPHABET = /^[A-Z.,& ]+$/;

test('every word and house name is writable (Latin capitals, no accents)', () => {
  for (const [trade, list] of Object.entries(WORDS)) for (const w of list) assert.match(w, ALPHABET, `${trade}: ${w}`);
  for (const h of HOUSES) assert.match(h, ALPHABET, h);
  assert.deepEqual(Object.keys(WORDS).sort(), ['bodega', 'colmado', 'draperia', 'farmacia', 'ferreteria', 'forn', 'perruqueria', 'sabater']);
});

test('every board of the town is written, fits, and stays legible', () => {
  const seen = new Set(); let n = 0, small = 0;
  for (const el of blockElements()) for (const sh of blockShops(el)) {
    const width = sh.s1 - sh.s0 - 0.7, tx = signText(sh.seed, sh.trade, width), px = Math.min(0.38 / 7, width / widthOf(tx));
    assert.match(tx, ALPHABET); assert.ok(width / widthOf(tx) >= 0.036 - 1e-9 || tx === WORDS[sh.trade][0], `${tx} on ${width.toFixed(1)} m`);
    assert.ok(px * 7 >= 0.2, `${tx} is ${(px * 7).toFixed(2)} m high`);
    if (px * 7 < 0.25) small++;
    seen.add(tx); n++;
  }
  assert.equal(n, 150);
  assert.ok(seen.size >= 25, `${seen.size} different texts`);
  assert.ok(small <= 5, `${small} boards under 0.25 m`);
  assert.ok([...seen].some((t) => /CASA /.test(t)), 'some boards carry the house\'s name');
});

test('writeSign makes boxes on the board, mirrored so that the text reads from the street', () => {
  const boxes = [], F = (u0, u1, d0, d1, y0, y1) => ({ u0, u1, d0, d1, y0, y1 });
  const n = writeSign({ F, add: (m, g) => boxes.push([m, g]) }, 'FORN', 0, 4, 3.58, 3.96, 0.2, 0.225, 'gilt_bronze');
  assert.equal(n, boxes.length); assert.ok(n >= 8);
  for (const [m, g] of boxes) { assert.equal(m, 'gilt_bronze'); assert.ok(g.u0 >= 0 && g.u1 <= 4 && g.u1 > g.u0 && g.y0 >= 3.58 - 1e-9 && g.y1 <= 3.96 + 1e-9 && g.d0 === 0.2); }
  // mirrored: the boxes come glyph by glyph, F first; F's first box stands at higher u than N's last
  assert.ok(boxes[0][1].u0 > boxes[boxes.length - 1][1].u1, 'the F is to the viewer\'s left, at the high-u end');
});
