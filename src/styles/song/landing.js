// A grain boat unloading at the Bian's bank (docs/settlements/song-kaifeng.md §10, Landing): the gangplanks
// from the gunwale up to the bank, cleated against slipping; the mooring lines from the boat to stakes
// driven into the bank; the sacks of grain heaped on the bank and on the boat's deck.

import { box, lathe, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

/** gangplank { a: [x, y, z] (the low end), b: [x, y, z] (the high end), w (0.42) }: a plank 6 cm thick with cleats across it */
function gangplank(el, { bag }) {
  const [ax, ay, az] = el.a, [bx, by, bz] = el.b, w = el.w ?? 0.42, L = Math.hypot(bx - ax, by - ay, bz - az);
  const yaw = Math.atan2(bx - ax, bz - az), pitch = Math.atan2(by - ay, Math.hypot(bx - ax, bz - az));
  const M = new Matrix4().makeTranslation(ax, ay, az).multiply(new Matrix4().makeRotationY(yaw)).multiply(new Matrix4().makeRotationX(-pitch));
  bag.add('timber', box(-w / 2, -0.06, 0, w / 2, 0, L).applyMatrix4(M));
  for (let s = 0.35; s < L - 0.2; s += 0.38) bag.add('wood_dark', box(-w / 2 + 0.03, 0, s, w / 2 - 0.03, 0.035, s + 0.04).applyMatrix4(M));
}
/** mooring { a: [x, y, z] (the stake's foot on the bank), b: [x, y, z] (where the line is made fast on the boat) } */
function mooring(el, { bag }) {
  const [ax, ay, az] = el.a, [bx, by, bz] = el.b;
  bag.add('bark_dark', lathe([[0.07, -0.3], [0.07, 0.55], [0.05, 0.62], [0.001, 0.64]], 7, null, ax, ay, az));
  // the line: a sagging curve from the stake's head to the boat
  const n = 8, P = (t) => [ax + (bx - ax) * t, ay + 0.45 + (by - ay - 0.45) * t - 0.35 * Math.sin(Math.PI * t), az + (bz - az) * t];
  for (let i = 0; i < n; i++) bag.add('rope_fibre', rod(P(i / n), P((i + 1) / n), 0.018, 5));
  bag.add('rope_fibre', lathe([[0.085, 0.4], [0.09, 0.45], [0.085, 0.5]], 8, null, ax, ay, az));
}
/** A sack of grain lying on its side: a plump pillow, its tied neck toward +x. Unit length 0.9 m. */
const SACK = (() => {
  const g = lathe([[0.001, -0.45], [0.16, -0.43], [0.22, -0.3], [0.23, 0.0], [0.21, 0.28], [0.13, 0.4], [0.06, 0.45], [0.05, 0.5], [0.001, 0.52]], 10);
  g.rotateZ(-Math.PI / 2); g.scale(1, 0.62, 1); g.translate(0, 0.14, 0);
  return g;
})();
/** sack_pile { at, y, rot, rows: [n, n-1, …] (sacks in each layer, the lowest first) } */
function sackPile(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, rows = el.rows ?? [4, 3, 2], M = new Matrix4(), R = new Matrix4().makeRotationY(rot);
  let k = 0;
  rows.forEach((n, j) => {
    for (let i = 0; i < n; i++) {
      const lx = (j % 2 ? 0.08 : -0.05), lz = (i - (n - 1) / 2) * 0.46, ly = j * 0.26;
      M.makeTranslation(x, y + ly, z).multiply(R).multiply(new Matrix4().makeTranslation(lx, 0, lz)).multiply(new Matrix4().makeRotationY(((k++ * 37) % 7 - 3) * 0.03));
      bag.add('sacking', SACK.clone().applyMatrix4(M));
    }
  });
  const hw = (rows[0] * 0.46) / 2;
  col.circle(x, z, Math.max(0.55, hw), y, y + rows.length * 0.26 + 0.1);
}
export const LANDING_ELEMENTS = { gangplank, mooring, sack_pile: sackPile };
