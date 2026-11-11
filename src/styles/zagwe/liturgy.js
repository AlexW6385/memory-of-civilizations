// The processional furniture of the Ethiopian church (docs/settlements/lalibela.md §14): the ceremonial
// umbrella of velvet with its fringe, held over priests and the tabot, and the processional cross of
// cast brass on a staff (a trefoil cross inside a quatrefoil frame, Met 2011.159: a socket "could be
// mounted on a staff and carried during services or processions").

import { lathe, fromTriangles } from '../../core/geom.js';
import { rod } from './hut.js';

const frame = (el) => { const [X, Z] = el.at, r = el.rot ?? 0, Y = el.y ?? 0; return (g) => g.rotateY(r).translate(X, Y, Z); };

/** umbrella: { at [x, z] (the hand), y (the hand), rot, mat (velvet), trim } — a pole held upright, a ribbed dome, a gilt rim and finial, a fringe of tassels. */
export function umbrella(el, { bag }) {
  const W = frame(el), mat = el.mat || 'cloth_red', R = 0.82, top = 1.45, t = [];
  bag.add('wood_dark', W(lathe([[0.016, -0.7], [0.018, top - 0.05], [0.001, top]], 6)));
  const dome = [[0.001, top + 0.18], [0.12, top + 0.17], [0.3, top + 0.12], [0.55, top - 0.02], [0.75, top - 0.2], [R, top - 0.3]];
  const bulge = (th) => 1 + 0.035 * Math.cos(th * 8);               // the eight gores
  bag.add(mat, W(lathe(dome, 24, bulge)));
  bag.add(mat, W(lathe([...dome].reverse().map(([r, y]) => [Math.max(0.001, r - 0.01), y - 0.012]), 24, bulge)));
  bag.add('gilt_bronze', W(lathe([[R + 0.01, top - 0.3], [R + 0.01, top - 0.24], [R - 0.04, top - 0.24], [R - 0.04, top - 0.3]], 24, bulge)));
  bag.add('gilt_bronze', W(lathe([[0.001, top + 0.18], [0.05, top + 0.19], [0.03, top + 0.3], [0.012, top + 0.32], [0.012, top + 0.5], [0.001, top + 0.5]], 8)));
  for (const [a, b] of [[[-0.07, top + 0.44, 0], [0.07, top + 0.44, 0]]]) rod(t, a, b, 0.008, 4);
  bag.add('gilt_bronze', W(fromTriangles(t)));
  // the fringe: tassels hanging from the rim
  const fr = [];
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, x = Math.cos(a) * (R - 0.01), z = Math.sin(a) * (R - 0.01); rod(fr, [x, top - 0.3, z], [x, top - 0.43, z], 0.009, 4); }
  bag.add(el.trim || 'cloth_ochre', W(fromTriangles(fr)));
}

/** proc_cross: { at [x, z] (the hand), y, rot } — a staff and the open brass cross head: trefoil arms in a ring with small crosses budding from it. */
export function procCross(el, { bag }) {
  const W = frame(el), t = [], yc = 1.05, Rr = 0.17;
  bag.add('wood_dark', W(lathe([[0.017, -0.55], [0.019, yc - 0.18], [0.001, yc - 0.17]], 6)));
  bag.add('bronze', W(lathe([[0.001, yc - 0.28], [0.03, yc - 0.27], [0.04, yc - 0.2], [0.02, yc - 0.17], [0.001, yc - 0.17]], 8)));
  const P = (a, y) => [a, y, 0];
  for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2, a1 = (k + 1) / 20 * Math.PI * 2; rod(t, P(Math.cos(a0) * Rr, yc + Math.sin(a0) * Rr), P(Math.cos(a1) * Rr, yc + Math.sin(a1) * Rr), 0.009, 4); }
  rod(t, P(0, yc - Rr), P(0, yc + Rr), 0.011, 4); rod(t, P(-Rr, yc), P(Rr, yc), 0.011, 4);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {                                 // the flared arm ends and the little crosses outside the ring
    const e = [dx * Rr, yc + dy * Rr], o = [dx * (Rr + 0.07), yc + dy * (Rr + 0.07)];
    rod(t, P(...e), P(...o), 0.011, 4); rod(t, P(o[0] - dy * 0.04, o[1] - dx * 0.04), P(o[0] + dy * 0.04, o[1] + dx * 0.04), 0.008, 4); rod(t, P(o[0] - dx * 0.0, o[1]), P(o[0] + dx * 0.045, o[1] + dy * 0.045), 0.008, 4);
  }
  for (const s of [-1, 1]) { const q = Math.PI / 4, c = [s * Math.cos(q) * Rr, yc + Math.sin(q) * Rr]; rod(t, P(...c), P(c[0] + s * 0.05, c[1] + 0.05), 0.007, 4); }
  bag.add('bronze', W(fromTriangles(t)));
}
