// Block capitals of Dessau's signs (docs/settlements/bauhaus-dessau.md §15.5): the 3 x 5 alphabet of src/styles/viennese/lettering.js (its glyphs were checked
// there, and are copied here so that a letter is plain boxes and merges into the walls' own detail meshes, instead of an instanced draw per glyph), laid in
// horizontal runs of cells on a face frame (faceFrame of styles/dutch/facade.js: u along the face left to right as read from outside, d outward).
import { box } from '../../core/geom.js';

const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '-': '000000111000000', '.': '000000000000010', ' ': '000000000000000',
};
const UMLAUT = { Ä: 'A', Ö: 'O', Ü: 'U' };

/**
 * Text centred on u at baseline v (metres above y), capitals h tall (shrunk to fit maxW), standing dep out from the face plane d0 of frame F, in material mat.
 * bag: the builder's bag (bag.add(mat, geometry)).
 */
export function letters(bag, F, y, u, v, text, h, mat, maxW, d0 = 0, dep = 0.025) {
  const n = text.length, pitch0 = h * 0.8, k = Math.min(1, maxW / (n * pitch0 - h * 0.2)), c = h * k / 5, pitch = c * 4;
  const left = u - (n * pitch - c) / 2;
  const put = (a0, a1, b0, b1) => {                                  // a cell run: u a0..a1, height b0..b1
    const p = F.at(a0, d0), q = F.at(a1, d0 + dep);
    bag.add(mat, box(Math.min(p[0], q[0]), y + v + b0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + v + b1, Math.max(p[1], q[1])));
  };
  for (let i = 0; i < n; i++) {
    const ch = text[i], base = UMLAUT[ch] ?? ch, rows = FONT[base];
    if (!rows) continue;
    const x0 = left + i * pitch;
    for (let r = 0; r < 5; r++) {
      let s = -1;
      for (let col = 0; col <= 3; col++) {
        const on = col < 3 && rows[r * 3 + col] === '1';
        if (on && s < 0) s = col;
        if (!on && s >= 0) { put(x0 + s * c, x0 + col * c, (4 - r) * c, (5 - r) * c); s = -1; }
      }
    }
    if (UMLAUT[ch]) for (const dc of [0, 2]) put(x0 + dc * c + c * 0.1, x0 + dc * c + c * 0.9, 5 * c + c * 0.25, 5 * c + c * 1.05);
  }
}
