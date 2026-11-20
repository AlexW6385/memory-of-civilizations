// Raised Latin capitals for Baroque Rome's inscriptions (docs/settlements/baroque-rome.md §6e). The letters are those of Rome's own verified set
// (src/settlements/rome/lettering.js, read-only: 23 letters, V for U, the interpunct), here turned into raised prisms on any plane: `P(u, v, d)`
// maps the reader's right (u, in letter heights, from the text's middle), up (v) and out of the surface (d, metres) to a point in the Local's frame.
import { inkOf, canWrite, widthOf } from '../../settlements/rome/lettering.js';
import { fromTriangles, orientOutward } from '../../core/geom.js';

export { canWrite, widthOf };
/** The geometry of `text` as raised letters of height h, standing `dep` out, or null if a letter is not in the set. */
export function letterGeometry(text, h, P, dep = 0.012, gap = 0.3) {
  if (!canWrite(text)) return null;
  const tris = [];
  for (const quad of inkOf(text, gap)) {
    const f = quad.map(([u, v]) => P(u, v, dep)), b = quad.map(([u, v]) => P(u, v, 0)), t = [], q = (a, c, d, e) => t.push(...a, ...c, ...d, ...a, ...d, ...e);
    q(f[0], f[1], f[2], f[3]);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], b[j], f[j], f[i]); }
    tris.push(...orientOutward(t));
  }
  void h;
  return fromTriangles(tris);
}
