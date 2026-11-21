// Brasília style — real lettering for the signs that can honestly carry it: the trade names over the shops' doors (Portuguese capitals,
// plain generic words, no brand or personal names) and the school's board. A 5-row block alphabet of boxes (3 cells wide, M and N 4):
// each glyph is written out below row by row and checked in tests/brasilia-sign.test.mjs. Accents (Á Ó) are a small slanted bar above the
// letter, the cedilla (Ç) a short hook under it.
import { box } from '../../core/geom.js';

/** Rows from the top, 1 = a lit cell. */
export const GLYPHS = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'],
  F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'],
  H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'],
  J: ['001', '001', '001', '101', '010'],
  L: ['100', '100', '100', '100', '111'],
  M: ['1001', '1111', '1111', '1001', '1001'],
  N: ['1001', '1101', '1011', '1001', '1001'],
  O: ['010', '101', '101', '101', '010'],
  P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'],
};
/** The words of the signs, with the accents as written: [letter index, 'acute' | 'cedilla'] marks. */
export const WORDS = {
  padaria: { text: 'PADARIA' }, banca: { text: 'JORNAIS' }, armarinho: { text: 'ARMARINHO' }, farmacia: { text: 'FARMACIA', marks: [[1, 'acute']] },
  lanchonete: { text: 'LANCHONETE' }, mercearia: { text: 'MERCEARIA' }, sapataria: { text: 'SAPATARIA' }, barbearia: { text: 'BARBEARIA' },
  papelaria: { text: 'PAPELARIA' }, acougue: { text: 'ACOUGUE', marks: [[1, 'cedilla']] }, hortifruti: { text: 'HORTIFRUTI' }, otica: { text: 'OTICA', marks: [[0, 'acute']] },
  escola: { text: 'ESCOLA CLASSE' },
};
/** The width in cells of a text, with one cell between letters and three for a space. */
export function widthOf(text) { let w = 0; for (const ch of text) w += (ch === ' ' ? 3 : GLYPHS[ch][0].length) + 1; return w - 1; }

/**
 * A text on a board facing −x (read from the west, left to right toward +z) or +x (read from the east, toward −z), centred on z = zc,
 * its baseline at y, plane x, cells of `cell` metres, 0.02 m thick; runs of lit cells in a row are one box.
 */
export function sign(bag, mat, word, { x, y, zc, cell = 0.05, face = 'x-' }) {
  const { text, marks = [] } = WORDS[word], s = face === 'x-' ? 1 : -1, w = widthOf(text), t = 0.02, x0 = face === 'x-' ? x - t : x, x1 = face === 'x-' ? x : x + t;
  const at = (c) => zc + s * (c - w / 2) * cell;
  // (each box's depth varies by a hash of its place, so that no two are the same shape: they merge as fine detail and are not made an instanced draw)
  const cellBox = (c0, c1, row, up = 0) => {
    const a = at(c0), b = at(c1), yy = y + (4 - row) * cell + up, h = Math.abs(Math.sin(a * 12.9898 + yy * 78.233 + x * 37.719) * 43758.5453) % 1, d = 0.004 * h;
    bag.add(mat, box(face === 'x-' ? x0 - d : x0, yy, Math.min(a, b), face === 'x-' ? x1 : x1 + d, yy + cell, Math.max(a, b)));
  };
  let c = 0, li = 0;
  for (const ch of text) {
    if (ch === ' ') { c += 4; continue; }
    const g = GLYPHS[ch], gw = g[0].length;
    g.forEach((row, r) => { for (let k = 0; k < gw;) { if (row[k] !== '1') { k++; continue; } let e = k; while (e < gw && row[e] === '1') e++; cellBox(c + k, c + e, r); k = e; } });
    for (const [i, kind] of marks) if (i === li) {
      if (kind === 'acute') cellBox(c + gw - 2, c + gw - 1, -1.2, cell * 0.2);          // a small bar over the right of the letter, raised
      else cellBox(c + 1, c + 2, 5, -cell * 0.2);                                           // the cedilla's hook under the letter
    }
    c += gw + 1; li++;
  }
}
