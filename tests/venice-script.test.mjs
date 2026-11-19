// The Roman capitals of Venice's signs (src/settlements/venice/script.js): every letter exists only if it was drawn and checked. The test prints each
// letter as a bitmap (run `node --test tests/venice-script.test.mjs` with VENICE_SCRIPT_SHOW=1 to see them) and checks the shapes' structure, so that no
// sign is ever written with a glyph that does not read as its letter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLYPHS, LETTERS, widthOf, strokesOf, bitmap } from '../src/settlements/venice/script.js';
import { TRADES, TRADE_NAMES } from '../src/styles/venetian/shops.js';

// the letters as they were looked at (11 rows, 5 columns per unit of width): each reads as its letter; a change to a glyph must be looked at again and this table updated
const GOLDEN = {
  A: ["   #", "   ##", "  ###", "  # #", "  # ##", " ##  #", " #####", " #   ##", " #    #", "#     #", "#     #"],
  B: ["#####", "#   ##", "#    #", "#    #", "#####", "#   ##", "#    ##", "#    ##", "#    #", "#   ##", "#####"],
  C: ["  ####", " ##  #", " #    #", " #", "##", "#", "##", " #", " #    #", " ##  #", "  ####"],
  D: ["#####", "#   ##", "#    #", "#     #", "#     #", "#     #", "#     #", "#     #", "#    #", "#   ##", "#####"],
  E: ["######", "#", "#", "#", "#", "#####", "#", "#", "#", "#", "######"],
  F: ["######", "#", "#", "#", "#", "#####", "#", "#", "#", "#", "#"],
  G: ["  ####", " ##  #", " #    #", " #", "##", "#   ###", "##    #", " #    #", " #    #", " ##  ##", "  ####"],
  H: ["#     #", "#     #", "#     #", "#     #", "#     #", "#######", "#     #", "#     #", "#     #", "#     #", "#     #"],
  I: ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  L: ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "######"],
  M: ["#       #", "##     ##", "##     ##", "###   # #", "# #  ## #", "#  # #  #", "#  ###  #", "#   #   #", "#       #", "#       #", "#       #"],
  N: ["#     #", "##    #", "###   #", "# #   #", "# ##  #", "#  #  #", "#  ## #", "#   ###", "#    ##", "#    ##", "#     #"],
  O: ["  ####", " ##  ##", " #    #", "#      #", "#      #", "#      #", "#      #", "#      #", " #    #", " ##  ##", "  ####"],
  P: ["#####", "#   ##", "#    #", "#    #", "#   ##", "#####", "#", "#", "#", "#", "#"],
  R: ["#####", "#   ##", "#    #", "#    #", "#   ##", "#####", "#  ##", "#   #", "#   ##", "#    #", "#     #"],
  S: [" ####", "##  ##", "#", "##", " ##", "  ###", "    ##", "     #", "     #", "##  ##", " ####"],
  T: ["#######", "   #", "   #", "   #", "   #", "   #", "   #", "   #", "   #", "   #", "   #"],
  U: ["#     #", "#     #", "#     #", "#     #", "#     #", "#     #", "#     #", "#     #", "##   ##", " ## ##", "  ###"],
  V: ["#     #", "#     #", " #    #", " #   ##", " #   #", " ##  #", "  # ##", "  # #", "  ###", "   ##", "   #"],
  X: ["#     #", "##   ##", " ##  #", "  # ##", "  ###", "   #", "  ###", "  # ##", " #   #", "##   ##", "#     #"],
  Z: ["#######", "     #", "    ##", "    #", "   ##", "   #", "  #", " ##", " #", "##", "#######"],
};

test('every glyph is inside its cell, has strokes of at least two points, and joins up', () => {
  assert.equal(LETTERS, 'ABCDEFGHILMNOPRSTUVXZ');
  for (const [c, g] of Object.entries(GLYPHS)) {
    assert.ok(g.w > 0 && g.s.length >= 1, c);
    for (const s of g.s) {
      assert.ok(s.length >= 2, `${c}: a stroke of one point`);
      for (const [x, y] of s) assert.ok(x >= -1e-9 && x <= g.w + 1e-9 && y >= -1e-9 && y <= 1 + 1e-9, `${c}: (${x}, ${y}) outside its cell`);
      for (let i = 0; i + 1 < s.length; i++) assert.ok(Math.hypot(s[i + 1][0] - s[i][0], s[i + 1][1] - s[i][1]) > 1e-6, `${c}: a zero-length segment`);
    }
    // every letter touches the baseline or the cap line, and reaches both sides of its cell (but I, a single stem)
    const ys = g.s.flat().map((p) => p[1]), xs = g.s.flat().map((p) => p[0]);
    assert.ok(Math.max(...ys) > 0.95 || c === 'O' || c === 'C' || c === 'G' || c === 'S' || c === 'U', `${c} reaches the cap line`);
    assert.ok(Math.max(...xs) - Math.min(...xs) > g.w * 0.8 || c === 'I', `${c} fills its width`);
  }
});

test('letters read as themselves: each bitmap is the one that was looked at', () => {
  if (process.env.VENICE_SCRIPT_SHOW) for (const c of LETTERS) console.log(c + '\n' + bitmap(c, 11, 0.3, 5));
  for (const c of LETTERS) assert.deepEqual(bitmap(c, 11, 0.3, 5).split('\n'), GOLDEN[c], c);
  assert.deepEqual(Object.keys(GOLDEN).join(''), LETTERS);
  // a few structural facts besides: I is a stem; H has two stems; E and F share their top and middle bars; O is closed
  assert.ok(GOLDEN.I.every((r) => r === '#') && GOLDEN.H[0] === '#     #' && GOLDEN.E[0] === GOLDEN.F[0] && GOLDEN.E[5] === GOLDEN.F[5] && GOLDEN.E[10] !== GOLDEN.F[10]);
  assert.ok(GOLDEN.O[0].trim().length > 2 && GOLDEN.O[10].trim().length > 2 && GOLDEN.C[5].trim().length === 1);
});

test('words: widths, no unknown letter, and every shop sign can be written', () => {
  assert.throws(() => strokesOf('KAPPA'), /no glyph/);
  assert.throws(() => widthOf('QUI'), /no glyph/);
  assert.ok(Math.abs(widthOf('ORO', 0.2) - (0.7 * 2 + 0.58 * 0 + GLYPHS.R.w + 0.4)) < 1e-9);
  for (const t of TRADE_NAMES) {
    const word = TRADES[t].word;
    assert.match(word, /^[A-Z]+$/);
    const w = widthOf(word, 0.2), s = strokesOf(word, 0.2);
    assert.ok(w > 1 && w < 7 && s.length >= word.length, `${t}: ${word}`);
    for (const stroke of s) for (const [x, y] of stroke) assert.ok(x >= 0 && x <= w + 1e-6 && y >= 0 && y <= 1, `${word}: a stroke leaves the line`);
  }
  // the words are Italian or Venetian, as the trades [inferred]
  assert.deepEqual(TRADE_NAMES.map((t) => TRADES[t].word).sort(), ['BARBIER', 'BERETE', 'CALEGHER', 'LIBRI', 'ORO', 'PAN', 'PANNI', 'SETA', 'SPEZIE', 'VETRO', 'VIN']);
});
