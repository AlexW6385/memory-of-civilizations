// Block capitals for the fascia boards of London's shops and pubs (docs/settlements/london.md §10.4): a 5 by 7 alphabet, each letter cut into the
// fewest boxes that cover it, so a board reads its words (the keeper's name and trade on a shop, the sign's name on a public house).
// Latin letters only: the one script this builder can write correctly. A pure function of its text, no randomness.

const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '.': ['00', '00', '00', '00', '00', '11', '11'], ',': ['00', '00', '00', '00', '11', '01', '10'], '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};
const cache = new Map();
/** A glyph as boxes [c0, c1, r0, r1] in pixel units (rows from the top), a greedy cover: widest run first, grown downward while it still fits. */
function boxesOf(ch) {
  if (cache.has(ch)) return cache.get(ch);
  const g = GLYPHS[ch] || GLYPHS[' '], w = g[0].length, used = g.map(() => Array(w).fill(false)), out = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) {
    if (g[r][c] !== '1' || used[r][c]) continue;
    let c1 = c; while (c1 + 1 < w && g[r][c1 + 1] === '1' && !used[r][c1 + 1]) c1++;
    let r1 = r; while (r1 + 1 < 7 && Array.from({ length: c1 - c + 1 }, (_, i) => g[r1 + 1][c + i] === '1' && !used[r1 + 1][c + i]).every(Boolean)) r1++;
    for (let rr = r; rr <= r1; rr++) for (let cc = c; cc <= c1; cc++) used[rr][cc] = true;
    out.push([c, c1 + 1, r, r1 + 1]);
  }
  cache.set(ch, out);
  return out;
}
/** The width of a text in pixel units (letters a pixel apart). */
export const widthOf = (text) => [...text].reduce((s, ch) => s + (GLYPHS[ch] || GLYPHS[' '])[0].length + 1, -1);
/**
 * Write `text` in capitals centred on the board between u0 and u1 (along the lot's front), ya..yb high (the letters' height at most), standing
 * from depth d0 to d1. F is the lot's frame (victorian shops.js frameOf): the board is read from the street, so on a north front, whose
 * viewer looks south, the letters run to −x. Returns the number of boxes.
 */
export function write(F, text, u0, u1, ya, yb, d0, d1, m = 'gold') {
  const wp = widthOf(text), px = Math.min((yb - ya) / 7, (u1 - u0) / wp), tw = wp * px, yTop = (ya + yb) / 2 + 3.5 * px, uc = (u0 + u1) / 2;
  let n = 0, t = 0;
  for (const ch of text) {
    const glyph = GLYPHS[ch] || GLYPHS[' '];
    for (const [c0, c1, r0, r1] of boxesOf(ch)) {
      const a = t + c0 * px, b = t + c1 * px, ua = F.sg > 0 ? uc - tw / 2 + a : uc + tw / 2 - b, ub = F.sg > 0 ? uc - tw / 2 + b : uc + tw / 2 - a;
      F.B(m, ua, ub, yTop - r1 * px, yTop - r0 * px, d0, d1); n++;
    }
    t += (glyph[0].length + 1) * px;
  }
  return n;
}
const TITLE = { draper: 'DRAPER', grocer: 'GROCER', butcher: 'BUTCHER', chemist: 'CHEMIST', baker: 'BAKER', pawnbroker: 'PAWNBROKER', bootmaker: 'BOOTMAKER', barber: 'HAIRDRESSER', tobacconist: 'TOBACCONIST', greengrocer: 'GREENGROCER' };
/** The shop's board: the trade word only (no keeper's name: none is known for these lots). */
export function shopName(seed, trade) { return TITLE[trade] || 'DEALER'; }
/** The public house's board: the trade's own words, not a name (no named house is known for these corners; a name was the first pass's invention). The fascia of a gin palace advertised its goods [inferred, dossier §12]. */
export const pubName = () => 'WINES & SPIRITS';
/** Does this open shop hang a songbird's wicker cage from a bracket under its fascia (the bootmaker's lark, the barber's linnet, the greengrocer's canary [inferred; Mayhew's bird-sellers])? One shop in two of those trades, by seed. */
export const cagedAt = (el) => !!(el.open && !el.simple && (el.trade === 'bootmaker' || el.trade === 'barber' || el.trade === 'greengrocer') && (el.seed & 1) === 0);
/** Where such a cage hangs: [u, d, height over the shop's floor]. */
export const CAGE = { u: 0.5, d: 1.0, h: 2.76 };
