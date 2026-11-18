// The carved capitals of the Piazzetta arcade of the Doge's Palace: figures round the bell of each, the labours of the
// months and the trades (docs/settlements/venice.md §4j). Small figures of rounded tubes standing against the bell.
import { CV, V, tube, blob, limb, hash } from './stone.js';

const TAU = Math.PI * 2;
const TOOLS = ['hammer', 'sickle', 'saw', 'grapes', 'jug', 'flail', 'lute', 'book'];
/** One figure 0.46 m tall at (cx, cz) on the bell, facing outward at phi; the kind k picks its tool and its arms. */
function mini(L, cx, cz, y0, phi, k, seg) {
  const n = [Math.cos(phi), 0, Math.sin(phi)], t = [-n[2], 0, n[0]], P0 = [cx, y0, cz];
  const K = 1.45, pt = (a, b, c) => [P0[0] + t[0] * a * K + n[0] * c * K, P0[1] + b * K, P0[2] + t[2] * a * K + n[2] * c * K];
  const g = [];
  g.push(tube([pt(0, 0, 0), pt(0, 0.15, 0.005), pt(0, 0.31, 0.01)], [[0.085 * K, 0.06 * K], [0.07 * K, 0.052 * K], [0.062 * K, 0.05 * K]], { seg, sub: 0, side: t }));
  g.push(blob(pt(0, 0.385, 0.015), 0.042 * K, [0.95, 1.05, 0.95], 5));
  const up = k % 2 === 0, s = k % 3 === 0 ? -1 : 1;
  const hand = up ? pt(s * 0.13, 0.44, 0.07) : pt(s * 0.1, 0.22, 0.09), other = pt(-s * 0.1, 0.2, 0.08);
  g.push(limb(pt(s * 0.065, 0.32, 0.01), hand, 0.021 * K, 0.014 * K, 4), limb(pt(-s * 0.065, 0.32, 0.01), other, 0.021 * K, 0.014 * K, 4));
  const tool = TOOLS[k % 8];
  if (tool === 'hammer' || tool === 'sickle' || tool === 'flail') { g.push(limb(hand, V.add(hand, [0, 0.12, 0]), 0.009, 0.009, 4), blob(V.add(hand, [t[0] * 0.03, 0.13, t[2] * 0.03]), 0.022, [1.4, 0.8, 0.8], 4)); }
  else if (tool === 'saw') g.push(blob(pt(s * 0.2, 0.3, 0.1), 0.05, [1.8, 0.5, 0.25], 4));
  else if (tool === 'grapes') g.push(blob(V.add(hand, [0, -0.03, 0]), 0.03, [0.8, 1.5, 0.8], 5));
  else if (tool === 'jug') g.push(blob(V.add(hand, [0, 0.04, 0]), 0.032, [1, 1.2, 1], 5));
  else if (tool === 'lute') g.push(blob(pt(s * 0.08, 0.26, 0.1), 0.045, [1.1, 1.2, 0.5], 5), limb(pt(s * 0.08, 0.28, 0.11), pt(s * 0.16, 0.42, 0.12), 0.008, 0.008, 4));
  else g.push(blob(pt(-s * 0.07, 0.24, 0.1), 0.04, [1.2, 1, 0.3], 4));
  for (const x of g) L.add(CV, x);
}
/** el { x, y (the capital's foot), zs: [z of each column], r } — the bells' figures. */
export function capitalFigures(L, el, lod) {
  const nf = lod === 0 ? 8 : 4;
  for (const [i, cz] of el.zs.entries()) {
    const r = (i === 0 || i === el.zs.length - 1 ? 0.72 : 0.62) * 0.95;
    for (let k = 0; k < nf; k++) {
      const phi = (k + 0.5) / nf * TAU + (hash(i, k, 5) - 0.5) * 0.1;
      const R = 1.16 * r + 0.05, y0 = el.y + 0.2 + 0.03 * hash(i, k, 9);
      mini(L, el.x + Math.cos(phi) * R, cz + Math.sin(phi) * R, y0, phi, (i * 3 + k) % 8, lod === 0 ? 6 : 5);
    }
  }
}
