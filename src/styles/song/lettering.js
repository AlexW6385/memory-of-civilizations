// Lettering for the Song style's boards, signs and banners: real characters from the checked table (GLYPH in
// ming-suzhou/brush-data.js, each laid over the reference typeface) drawn by the brush (ming-suzhou/brush.js); never a
// guess. Only TRADE WORDS go on shop boards (what is sold or done there), no invented names (docs/decisions.md).
// Horizontal writing runs right to left (the first character at the right as the reader faces the board), a vertical column
// top to bottom; a sign seen from both faces is lettered on both, each facing its reader (mapTris keeps the winding).
import { relief } from '../../settlements/ming-suzhou/brush.js';
import { GLYPH } from '../../settlements/ming-suzhou/brush-data.js';

/** True when every character of the text is in the checked table. */
export const canWrite = (text) => !!text && [...text].every((c) => GLYPH[c]);

/** The word a trade's board carries (one or two characters naming what is sold or done), or '' when the table has none (the board stays plain). */
const TRADE_WORD = {
  tea: '茶', wine: '酒', medicine: '藥', rice: '米', grain: '米', cloth: '布', silk: '絲綢', pawn: '當', books: '書', iron: '鐵', butcher: '肉',
  food: '飯店', inn: '客棧', lacquer: '漆', pottery: '瓷', incense: '香', saddlery: '鞍', oil: '油', paper: '紙', fans: '扇', noodles: '麵',
  sweets: '糖', salt: '鹽', fish: '魚', cakes: '餅', charcoal: '炭', thread: '線', hats: '帽', shoes: '鞋', needles: '針', umbrellas: '傘', dye: '染',
  vinegar: '醋', sauce: '醬', brush: '筆',
};
export const boardWord = (trade) => { const w = TRADE_WORD[trade]; return w && canWrite(w) ? w : ''; };

/** The triangles (flat xyz) of a text facing +z, centred on the origin: horizontal, the first character at +x (right to left); vertical, the first at the top. */
export function textTris(text, { pitch, size, vertical = false, z0 = 0, z1 = 0.012, flat = false, thick = 1.2, top = 0.55 }) {
  const out = [], cs = [...text], n = cs.length;
  cs.forEach((c, i) => {
    const o = (i - (n - 1) / 2) * pitch;
    relief(out, GLYPH[c], vertical ? 0 : -o, vertical ? -o : 0, size, z0, z1, { thick, top, flat });
  });
  return out;
}

/** The triangles moved by fn(u, v, k) → [x, y, z] (u right, v up, k out of the face); the winding is flipped when fn mirrors. */
export function mapTris(tris, fn) {
  const o = fn(0, 0, 0), a = fn(1, 0, 0), b = fn(0, 1, 0), c = fn(0, 0, 1);
  const A = [a[0] - o[0], a[1] - o[1], a[2] - o[2]], B = [b[0] - o[0], b[1] - o[1], b[2] - o[2]], C = [c[0] - o[0], c[1] - o[1], c[2] - o[2]];
  const det = A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0]);
  const out = new Array(tris.length);
  for (let i = 0; i < tris.length; i += 9) {
    const p = fn(tris[i], tris[i + 1], tris[i + 2]), q = fn(tris[i + 3], tris[i + 4], tris[i + 5]), r = fn(tris[i + 6], tris[i + 7], tris[i + 8]);
    const [s, t] = det < 0 ? [r, q] : [q, r];
    out[i] = p[0]; out[i + 1] = p[1]; out[i + 2] = p[2]; out[i + 3] = s[0]; out[i + 4] = s[1]; out[i + 5] = s[2]; out[i + 6] = t[0]; out[i + 7] = t[1]; out[i + 8] = t[2];
  }
  return out;
}

/** The mapping for mapTris onto a vertical face at (cx, cz) whose outward normal is (nx, nz): the reader outside sees u to the right; v is up from y. Pass the opposite normal for the back face. */
export const onFace = (cx, y, cz, nx, nz) => (u, v, k) => [cx + nz * u + nx * k, y + v, cz - nx * u + nz * k];
