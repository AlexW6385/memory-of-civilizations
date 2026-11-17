// The five domes of San Marco seen from outside (docs/settlements/venice.md §4g): a brick drum ringed with sixteen
// arched windows between colonnettes under a cornice; over it the tall lead shell, ogival, with sixteen ribs; at its
// crown the lantern — eight columns on a marble base round a glazed core, a lead onion cap, the gilt ball and cross.
import { box, lathe, rod } from '../../core/geom.js';
import { ext, archOutline, merge } from '../renaissance/face.js';

const B = 'brick', M = 'marble', L = 'lead', GB = 'gilt_bronze', PC = 'proconnesian', O = 'opening';

/** dome(bag, { x, y, z, r }): the drum's foot at y, the shell's foot 3.4 m above it. */
export function dome(bag, { x, y, z, r }) {
  const dh = 3.4, N = 16, yd = y + dh;
  bag.add(B, lathe([[r, 0], [r, dh]], 24, null, x, y, z));
  bag.add(M, lathe([[r + 0.16, 0], [r + 0.16, 0.18], [r + 0.08, 0.3]], 24, null, x, y, z));                    // the plinth
  bag.add(M, lathe([[r + 0.05, 0], [r + 0.28, 0.1], [r + 0.28, 0.3], [r + 0.1, 0.36]], 24, null, x, y + dh - 0.36, z));   // the cornice
  const win = [], frm = [], col = [];
  for (let k = 0; k < N; k++) {
    const a = (k + 0.5) / N * Math.PI * 2, rot = Math.PI / 2 - a, cx = x + Math.cos(a) * (r + 0.02), cz = z + Math.sin(a) * (r + 0.02);
    const g = ext(archOutline(0, 0.55, 0.78, 1.75, 'round', 5), [], 0.0, 0.06); g.rotateY(rot); g.translate(cx, y + 0.5, cz); win.push(g);
    const f = ext(archOutline(0, 0.47, 1.12, 1.75, 'round', 5), [archOutline(0, 0.55, 0.78, 1.75, 'round', 5)], 0.0, 0.14); f.rotateY(rot); f.translate(cx, y + 0.5, cz); frm.push(f);
    const b = a + Math.PI / N, px = x + Math.cos(b) * (r + 0.08), pz = z + Math.sin(b) * (r + 0.08);
    col.push(rod([px, y + 0.35, pz], [px, y + dh - 0.4, pz], 0.1, 6));
  }
  bag.add(O, merge(win)); bag.add(M, merge(frm)); bag.add(PC, merge(col));
  // the shell: an onion of lead, ribbed
  const prof = [[r * 1.05, 0], [r * 1.08, r * 0.22], [r * 1.0, r * 0.62], [r * 0.78, r * 1.05], [r * 0.5, r * 1.4], [r * 0.24, r * 1.66], [r * 0.14, r * 1.82]];
  bag.add(L, lathe([...prof, [0.4, r * 1.9]], 32, null, x, yd, z));
  bag.add(M, lathe([[r * 1.05 + 0.1, 0], [r * 1.05 + 0.1, 0.22], [r * 1.05 - 0.05, 0.3]], 32, null, x, yd - 0.1, z));  // the shell's foot-ring
  const ribs = [];
  for (let k = 0; k < N; k++) {
    const a = k / N * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    for (let i = 0; i + 1 < prof.length; i++) {
      const [r0, h0] = prof[i], [r1, h1] = prof[i + 1];
      ribs.push(rod([x + c * (r0 + 0.05), yd + h0, z + s * (r0 + 0.05)], [x + c * (r1 + 0.05), yd + h1, z + s * (r1 + 0.05)], 0.1, 5));
    }
  }
  bag.add(M, merge(ribs));
  // the lantern
  const yl = yd + r * 1.9 - 0.2, cols = [];
  bag.add(M, lathe([[1.6, 0], [1.6, 0.2], [1.35, 0.35]], 12, null, x, yl, z));
  bag.add(O, lathe([[1.0, 0], [1.0, 2.1]], 12, null, x, yl + 0.35, z));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; cols.push(rod([x + Math.cos(a) * 1.2, yl + 0.35, z + Math.sin(a) * 1.2], [x + Math.cos(a) * 1.2, yl + 2.45, z + Math.sin(a) * 1.2], 0.1, 6)); }
  bag.add(PC, merge(cols));
  bag.add(M, lathe([[1.45, 0], [1.5, 0.15], [1.3, 0.3]], 12, null, x, yl + 2.45, z));
  bag.add(L, lathe([[1.4, 0], [1.6, 0.25], [1.3, 0.9], [0.7, 1.6], [0.25, 2.2], [0.1, 2.5]], 12, null, x, yl + 2.75, z));
  bag.add(GB, lathe([[0.001, 0], [0.28, 0.12], [0.3, 0.3], [0.001, 0.6]], 8, null, x, yl + 5.15, z));
  bag.add(GB, box(x - 0.05, yl + 5.7, z - 0.05, x + 0.05, yl + 7.1, z + 0.05));
  bag.add(GB, box(x - 0.45, yl + 6.4, z - 0.04, x + 0.45, yl + 6.52, z + 0.04));
  bag.add(GB, box(x - 0.04, yl + 6.4, z - 0.45, x + 0.04, yl + 6.52, z + 0.45));
}
