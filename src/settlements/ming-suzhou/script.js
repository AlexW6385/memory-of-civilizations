// The writing on Ming Suzhou's name boards and gate tablets: the characters of the names the dossier
// states (docs/settlements/ming-suzhou.md §19), as brush strokes on a 100-unit grid (y up).
// Each stroke is [kind, x0, y0, x1, y1]: h (heng), s (shu), p (pie), n (na), d (dian), t (ti), tapered
// as a signwriter's brush leaves them. The stroke lists are approximations of the characters (the
// radicals in their places, the counts of strokes kept where the size allows), not a calligrapher's
// hand; a name with a character not listed here falls back to the generic strokes of the board.
import { fromTriangles } from '../../core/geom.js';

const G = {
  拙: [['h', 6, 66, 36, 66], ['s', 22, 92, 22, 12], ['t', 8, 34, 34, 54],
    ['s', 52, 94, 52, 62], ['s', 90, 94, 90, 62], ['h', 52, 62, 90, 62], ['s', 71, 98, 71, 12],
    ['s', 48, 50, 48, 10], ['s', 94, 50, 94, 10], ['h', 48, 10, 94, 10]],
  政: [['h', 8, 88, 56, 88], ['s', 30, 88, 30, 20], ['s', 16, 64, 16, 32], ['h', 16, 50, 48, 50], ['h', 6, 18, 58, 18],
    ['p', 76, 96, 62, 70], ['h', 62, 70, 92, 72], ['p', 84, 66, 62, 14], ['n', 66, 50, 92, 14]],
  園: [['s', 8, 94, 8, 6], ['h', 8, 94, 92, 94], ['s', 92, 94, 92, 6], ['h', 8, 6, 92, 6],
    ['h', 30, 82, 70, 82], ['h', 36, 70, 64, 70], ['s', 36, 70, 36, 54], ['s', 64, 70, 64, 54], ['h', 36, 54, 64, 54], ['h', 28, 44, 72, 44],
    ['p', 50, 44, 30, 18], ['n', 54, 40, 74, 18]],
  遠: [['d', 14, 88, 22, 80], ['s', 20, 70, 20, 40], ['n', 20, 34, 92, 10],
    ['h', 44, 94, 88, 94], ['h', 48, 82, 84, 82], ['s', 48, 82, 48, 68], ['s', 84, 82, 84, 68], ['h', 48, 68, 84, 68],
    ['h', 40, 58, 92, 58], ['p', 66, 58, 48, 34], ['n', 70, 54, 90, 36]],
  香: [['p', 30, 96, 10, 88], ['h', 12, 84, 88, 84], ['s', 50, 98, 50, 52], ['p', 46, 78, 18, 56], ['n', 54, 78, 86, 56],
    ['s', 28, 46, 28, 8], ['s', 72, 46, 72, 8], ['h', 28, 46, 72, 46], ['h', 28, 28, 72, 28], ['h', 28, 8, 72, 8]],
  堂: [['s', 50, 98, 50, 84], ['p', 40, 92, 28, 80], ['d', 62, 92, 70, 82], ['s', 22, 74, 22, 64], ['h', 22, 74, 78, 74], ['s', 78, 74, 78, 64],
    ['s', 34, 62, 34, 46], ['s', 66, 62, 66, 46], ['h', 34, 62, 66, 62], ['h', 34, 46, 66, 46],
    ['h', 34, 34, 66, 34], ['s', 50, 34, 50, 12], ['h', 18, 12, 82, 12]],
  倚: [['p', 22, 94, 10, 64], ['s', 20, 74, 20, 8],
    ['h', 34, 92, 90, 92], ['p', 62, 92, 36, 64], ['n', 62, 90, 90, 64],
    ['h', 34, 56, 90, 56], ['s', 74, 56, 74, 10], ['s', 38, 40, 38, 14], ['h', 38, 40, 60, 40], ['s', 60, 40, 60, 14], ['h', 38, 14, 60, 14]],
  玉: [['h', 16, 86, 84, 86], ['h', 26, 58, 74, 58], ['s', 50, 86, 50, 14], ['h', 12, 14, 88, 14], ['d', 68, 34, 78, 26]],
  軒: [['s', 14, 76, 14, 38], ['s', 40, 76, 40, 38], ['h', 14, 76, 40, 76], ['h', 14, 58, 40, 58], ['h', 14, 38, 40, 38], ['s', 27, 94, 27, 10], ['h', 6, 24, 48, 24],
    ['h', 54, 84, 92, 84], ['h', 52, 56, 94, 56], ['s', 74, 84, 74, 10]],
  玲: [['h', 8, 84, 36, 84], ['h', 12, 58, 34, 58], ['s', 22, 84, 22, 14], ['h', 6, 14, 40, 14],
    ['p', 68, 98, 46, 72], ['n', 68, 98, 92, 72], ['h', 54, 62, 86, 62], ['h', 54, 44, 84, 44], ['p', 82, 44, 58, 12], ['d', 66, 28, 72, 22]],
  瓏: [['h', 4, 84, 30, 84], ['h', 8, 58, 28, 58], ['s', 18, 84, 18, 14], ['h', 2, 14, 34, 14],
    ['d', 52, 98, 58, 90], ['h', 38, 84, 64, 84], ['h', 40, 70, 60, 70], ['s', 42, 70, 42, 22], ['s', 58, 70, 58, 28], ['h', 42, 48, 58, 48], ['h', 42, 28, 58, 28],
    ['h', 68, 88, 94, 88], ['s', 70, 88, 70, 52], ['h', 68, 68, 92, 68], ['s', 82, 98, 82, 10], ['p', 72, 34, 64, 16]],
  館: [['p', 26, 98, 8, 80], ['n', 26, 98, 46, 82], ['h', 12, 74, 42, 74], ['s', 14, 64, 14, 14], ['s', 40, 64, 40, 14], ['h', 14, 64, 40, 64], ['h', 14, 46, 40, 46], ['h', 14, 14, 40, 14],
    ['d', 74, 98, 74, 92], ['h', 54, 86, 94, 86], ['s', 54, 86, 54, 76], ['s', 94, 86, 94, 76],
    ['s', 62, 70, 62, 46], ['s', 86, 70, 86, 46], ['h', 62, 70, 86, 70], ['h', 62, 46, 86, 46], ['s', 62, 38, 62, 14], ['s', 86, 38, 86, 14], ['h', 62, 38, 86, 38], ['h', 62, 14, 86, 14]],
  見: [['s', 26, 92, 26, 34], ['s', 74, 92, 74, 34], ['h', 26, 92, 74, 92], ['h', 26, 72, 74, 72], ['h', 26, 52, 74, 52], ['h', 26, 34, 74, 34],
    ['p', 42, 34, 26, 6], ['s', 62, 34, 62, 8], ['h', 62, 8, 86, 8]],
  山: [['s', 50, 90, 50, 14], ['s', 16, 60, 16, 10], ['s', 84, 60, 84, 10], ['h', 16, 10, 84, 10]],
  樓: [['h', 6, 66, 44, 66], ['s', 24, 96, 24, 6], ['p', 22, 60, 6, 30], ['n', 26, 60, 44, 30],
    ['s', 58, 92, 58, 66], ['s', 90, 92, 90, 66], ['h', 58, 92, 90, 92], ['h', 58, 66, 90, 66], ['h', 58, 80, 90, 80], ['s', 74, 98, 74, 60],
    ['p', 66, 54, 54, 28], ['p', 74, 52, 54, 8], ['h', 50, 36, 92, 36]],
};
/** Width at the start and end of a stroke, and how far its caps run on (grid units / 100). */
const STROKE = { h: [0.05, 0.065, 0.02, 0.035], s: [0.07, 0.04, 0.02, 0.05], p: [0.075, 0.012, 0.02, 0.06], n: [0.02, 0.1, 0.01, 0.045], d: [0.1, 0.06, 0.02, 0.03], t: [0.06, 0.02, 0.02, 0.05] };

/** One stroke's tapered outline as triangles extruded from z0 to z1 (front face and sides, no back); the cell is centred at (cx, cy), `k` m across. */
function stroke(out, [kind, ax, ay, bx, by], cx, cy, k, z0, z1, thick) {
  const [wa, wb, ca, cb] = STROKE[kind], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) / 100 || 1e-3, ux = dx / 100 / l, uy = dy / 100 / l, nx = -uy, ny = ux;
  const A = [ax / 100 - 0.5, ay / 100 - 0.5], B = [bx / 100 - 0.5, by / 100 - 0.5], ta = wa * thick / 2, tb = wb * thick / 2;
  const P = [
    [A[0] - ux * ca, A[1] - uy * ca], [A[0] - nx * ta, A[1] - ny * ta], [B[0] - nx * tb, B[1] - ny * tb],
    [B[0] + ux * cb, B[1] + uy * cb], [B[0] + nx * tb, B[1] + ny * tb], [A[0] + nx * ta, A[1] + ny * ta],
  ].map(([x, y]) => [cx + x * k, cy + y * k]);
  for (let i = 1; i < 5; i++) out.push(P[0][0], P[0][1], z1, P[i][0], P[i][1], z1, P[i + 1][0], P[i + 1][1], z1);
  for (let i = 0; i < 6; i++) {
    const p = P[i], q = P[(i + 1) % 6];
    out.push(p[0], p[1], z0, q[0], q[1], z0, q[0], q[1], z1, p[0], p[1], z0, q[0], q[1], z1, p[0], p[1], z1);
  }
}
/** Whether every character of the text is in the set. */
export const canWrite = (text) => !!text && [...text].every((c) => G[c]);
/**
 * The geometry of an inscription facing +z, centred on the origin: its characters left to right (top to bottom when vertical)
 * at `pitch` m, each `size` m across, from z0 to z1. `thick` scales the strokes (1: a signwriter's weight).
 */
export function inscription(text, { pitch, size, z0 = 0, z1 = 0.012, vertical = false, thick = 1 }) {
  const chars = [...text], out = [];
  chars.forEach((c, i) => {
    const o = (i - (chars.length - 1) / 2) * pitch, cx = vertical ? 0 : o, cy = vertical ? -o : 0;
    for (const s of G[c]) stroke(out, s, cx, cy, size, z0, z1, thick);
  });
  return fromTriangles(out);
}
