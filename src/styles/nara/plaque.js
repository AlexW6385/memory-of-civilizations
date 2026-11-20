// The name boards over the gates (docs/settlements/nara.md §19.5): a board of black lacquer with a gilt rim, the characters raised in gilt from it, read
// from the right, hung by two gilt straps from the lintel, the same on both faces. The characters are those of the verified brush data read as they are:
// the brush (src/settlements/ming-suzhou/brush.js) through the writing of src/styles/muromachi/script.js (東 is that file's own; 大 and 寺 are
// Suzhou's, both unchanged). Nothing is written whose every character is not there (`canWrite`).
//
// nara_plaque { at: [x, z], y (the board's foot), w, h, text, rot (0: the front faces +z) }

import { box } from '../../core/geom.js';
import { inscription, canWrite } from '../muromachi/script.js';

export function naraPlaque(el, { bag }) {
  if (!canWrite(el.text)) return;
  const [x, z] = el.at, y = el.y, w = el.w ?? 3.0, h = el.h ?? 1.0, n = [...el.text].length, T = 0.05, a = el.rot ?? 0;
  const c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];       // (u along the board, v out of its front)
  const put = (m, u0, v0, u1, v1, y0, y1) => { const p = P(u0, v0), q = P(u1, v1); bag.add(m, box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]))); };
  put('lacquer_black', -w / 2, -T, w / 2, T, y, y + h);
  for (const [u0, u1, y0, y1] of [[-w / 2 - 0.04, w / 2 + 0.04, y - 0.04, y], [-w / 2 - 0.04, w / 2 + 0.04, y + h, y + h + 0.04], [-w / 2 - 0.04, -w / 2, y, y + h], [w / 2, w / 2 + 0.04, y, y + h]]) put('gilt_bronze', u0, -T - 0.01, u1, T + 0.01, y0, y1);
  for (const u of [-w * 0.33, w * 0.33]) put('gilt_bronze', u - 0.03, -0.03, u + 0.03, 0.03, y + h + 0.04, y + h + 0.5);
  const size = Math.min(h * 0.8, w / n / 1.1), pitch = Math.min(size * 1.12, w / n);
  for (const f of [1, -1]) {
    const g = inscription(el.text, { pitch, size, z0: 0, z1: 0.016, thick: 1.2 });
    g.translate(0, 0, T + 0.002); if (f < 0) g.rotateY(Math.PI);
    g.rotateY(a); g.translate(x, y + h / 2, z);
    bag.add('gilt_bronze', g);
  }
}
