// Gold and white lettering on the fascias of the shops and the café fronts (docs/settlements/vienna.md §5): a 3 × 5 block alphabet,
// each letter one shared shape placed as an instance (src/objects/kit.js), so that a street of signs costs a few hundred matrices.
import { box } from '../../core/geom.js';
import { assembly, placer } from '../../objects/kit.js';

const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '-': '000000111000000', '.': '000000000000010',
};
const UMLAUT = { Ä: 'A', Ö: 'O', Ü: 'U', É: 'E' };
const S = 0.2, DEP = 0.16;
function glyph(ch) {
  const base = UMLAUT[ch] ?? ch, rows = FONT[base];
  if (!rows) return null;
  return assembly(`vienna-glyph|${ch}`, (a) => {
    for (let k = 0; k < 15; k++) if (rows[k] === '1') { const cx = k % 3, ry = 4 - Math.floor(k / 3); a('g', box(cx * S, ry * S, 0, cx * S + S, ry * S + S, DEP)); }
    if (UMLAUT[ch] && ch !== 'É') { a('g', box(0.1 * S, 5 * S + 0.04, 0, 0.1 * S + S * 0.8, 5 * S + 0.04 + S * 0.8, DEP)); a('g', box(2 * S, 5 * S + 0.04, 0, 2 * S + S * 0.8, 5 * S + 0.04 + S * 0.8, DEP)); }
    if (ch === 'É') a('g', box(S, 5 * S + 0.04, 0, 2 * S, 5 * S + 0.04 + S * 0.8, DEP));
  });
}
const outward = (F) => { const a = F.at(0, 0), b = F.at(0, 1); return Math.atan2(b[0] - a[0], b[1] - a[1]); };
/** Lettering on frame F: the text centred on u, its baseline at v, letters h tall (shrunk to fit maxW), standing d out from the wall. */
export function lettering(bag, F, y, u, v, text, h, mat, maxW, d = 0.1) {
  const n = text.length, pitch0 = h * 0.8, k = Math.min(1, maxW / (n * pitch0 - h * 0.2)), hh = h * k, pitch = hh * 0.8;
  const rot = outward(F);
  for (let i = 0; i < n; i++) {
    const g = glyph(text[i]);
    if (!g) continue;
    const uc = u + (i - (n - 1) / 2) * pitch - hh * 0.3, [x, z] = F.at(uc, d);
    // (the shape grows along +x = along the front's u; its depth along +z = outward)
    const P = placer({ t: 'vienna_letter', at: [x, z], y: y + v, rot, s: 1 }, bag, hh);
    for (const g2 of Object.values(g)) P(mat, g2.clone());
  }
}
