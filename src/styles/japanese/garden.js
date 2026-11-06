// The edges of a Heian pond garden (docs/settlements/heian-uji.md §6): the pebble beach (suhama) —
// rounded stones laid thick along a gently shelving shore, running down under the water — and the
// larger set stones (tateishi) standing at its points and on the islands, after the manner the
// Sakuteiki describes. Every stone is an instance of a few rounded shapes.

import { lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A rounded stone of unit size: a flattened, lumpy lathe (k its shape number). */
function stone(k, seg, rows, flat) {
  const r = rng(97 + k * 31), ph = [r() * 6.3, r() * 6.3], amp = [0.08 + r() * 0.1, 0.05 + r() * 0.06];
  const prof = Array.from({ length: rows + 1 }, (_, i) => { const t = i / rows * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.5), (0.5 - Math.cos(t) * 0.5) * flat]; });
  return lathe(prof, seg, (th, i) => (1 + amp[0] * Math.cos(th * 2 + ph[0]) + amp[1] * Math.cos(th * 3 + ph[1] + i)) * (1 + (k % 2 ? 0.25 : -0.1) * Math.cos(th) ** 2));
}
const PEBBLES = [0, 1, 2].map((k) => stone(k, 7, 4, 0.5)), ROCKS = [0, 1].map((k) => stone(k + 5, 9, 5, 0.75));
const _m = new Matrix4(), _r = new Matrix4(), _s = new Matrix4();
/** suhama { stones: [x, y, z, size, turn, …] (pebbles), rocks: [x, y, z, size, turn, …] (set stones) } */
export function suhama(el, { bag, col }) {
  const put = (list, protos, mat, sink) => {
    for (let i = 0, k = 0; i < list.length; i += 5, k++) {
      const [x, y, z, s, a] = list.slice(i, i + 5), g = protos[k % protos.length];
      _m.makeTranslation(x, y - s * sink, z).multiply(_r.makeRotationY(a)).multiply(_s.makeScale(s, s, s));
      if (bag.addInstance) bag.addInstance(mat, g.clone(), _m.clone(), { reach: 120 });
      else bag.add(mat, g.clone().applyMatrix4(_m));
    }
  };
  put(el.stones || [], PEBBLES, el.mat || 'granite_grey', 0.18);
  put(el.rocks || [], ROCKS, el.rockMat || 'rock_boulder', 0.25);
  for (let i = 0; i < (el.rocks || []).length; i += 5) { const [x, y, z, s] = el.rocks.slice(i, i + 5); if (s > 0.7) col.circle(x, z, s * 0.42, y, y + s * 0.55); }
}
