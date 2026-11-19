// The writing of Ming–Qing Beijing (docs/settlements/qing-beijing.md §42): the characters of ming-suzhou's generic brush model (brush.js, read-only)
// and this folder's own brush-data.js (午 門 中 保 殿), made into relief. A character is written only if every stroke of it was laid over the
// reference typeface (tools/script-sheet.mjs): `canWrite` says so. Horizontal writing runs right to left (the first character at the right), as
// in the Qing; a vertical column runs top to bottom.
import { fromTriangles } from '../../core/geom.js';
import { relief } from '../ming-suzhou/brush.js';
import { GLYPH, COUNT } from './brush-data.js';

export { GLYPH, COUNT };
export const canWrite = (text) => !!text && [...text].every((c) => GLYPH[c]);
/** The trade's character on the fascia of a shop (the signs of §16; the characters stand for the trade, not for a shop's name). */
export const TRADE_TEXT = { tea: '茶', wine: '酒', medicine: '藥', cloth: '布', pawn: '當', grain: '米' };

/** The centres of a text's characters, [x, y] about its middle, in reading order. */
export function placesOf(text, pitch, vertical = false) {
  const n = [...text].length;
  return Array.from({ length: n }, (_, i) => { const o = (i - (n - 1) / 2) * pitch; return vertical ? [0, -o] : [-o, 0]; });
}
/** The triangles (flat xyz) of a text facing +z, centred on the origin (x to the right of the reader), its foot at z0 and face at z1 (flat when z0 = z1). */
export function inscriptionTris(text, { pitch, size, z0 = 0, z1 = 0.012, vertical = false, thick = 1, flat = false, cx = 0, cy = 0 }) {
  const out = [], at = placesOf(text, pitch, vertical);
  [...text].forEach((c, i) => relief(out, GLYPH[c], cx + at[i][0], cy + at[i][1], size, z0, z1, { thick, top: 0.55, flat }));
  return out;
}
/** The text as a geometry facing +z. */
export const inscription = (text, o) => fromTriangles(inscriptionTris(text, o));

/** Names of the shops' type (zihao: two auspicious characters) — only characters this writing has; [inferred] from the custom of the zihao + the trade. */
const NAMES = ['同和', '同昌', '同泰', '元昌', '元泰', '正泰', '正昌', '金泰', '金昌', '泰和', '正元', '元和', '昌泰', '泰昌'];
const TRADE_SUFFIX = { tea: '茶館', wine: '酒', medicine: '藥', cloth: '布', pawn: '當', grain: '米' };
/** The text of a shop's name board: its name and its trade's word, or undefined (the trade has no verified character; the board keeps its generic marks). Chosen from the shop's seed. */
export function shopText(trade, seed) {
  const suffix = TRADE_SUFFIX[trade];
  return suffix ? NAMES[Math.abs(Math.floor(seed)) % NAMES.length] + suffix : undefined;
}
