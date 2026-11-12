// The feast-day procession of Baroque Rome (docs/settlements/baroque-rome.md §5, "The papal blessing day"): the
// things a confraternity carries through the piazza — the processional cross, the gonfalone (the banner hung from
// a cross-bar on its pole), the baldacchino of the Sacrament on four poles with its fringed valance — and the
// stalls of the pilgrims' fair (a table under a cloth with its medals and rosaries). Built facing −z at the origin
// and placed by { at, rot, y }; the bearers are the shared figures.

import { box, lathe, rod } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { Local } from '../renaissance/face.js';

const G = 'gilt_bronze';
const place = (L, bag, el) => L.emit(bag, new Matrix4().makeRotationY(el.rot ?? 0).setPosition(el.at[0], el.y ?? 0, el.at[1]));

/** proc_cross: { at, rot, y } — a pole of 3.1 m with a gilt cross and a hanging veil, carried upright. */
export function procCross(el, { bag }) {
  const L = new Local();
  L.add('wood_dark', rod([0, 0.1, 0], [0, 2.85, 0], 0.025, 6));
  L.add(G, box(-0.025, 2.8, -0.02, 0.025, 3.55, 0.02));
  L.add(G, box(-0.2, 3.28, -0.02, 0.2, 3.34, 0.02));
  L.add(G, lathe([[0.05, 0], [0.07, 0.04], [0.001, 0.1]], 6, null, 0, 3.55, 0));
  L.add('cloth_red', box(-0.14, 2.35, -0.012, 0.14, 2.8, 0.012));
  place(L, bag, el);
}

/** gonfalone: { at, rot, y, cloth, trim } — a pole of 3.9 m with a cross-bar, the banner of a confraternity (1.0 × 1.5 m) hanging from it with a gilt border and an emblem. */
export function gonfalone(el, { bag }) {
  const L = new Local(), cl = el.cloth ?? 'cloth_red';
  L.add('wood_dark', rod([0, 0.1, 0], [0, 3.8, 0], 0.028, 6));
  L.add(G, lathe([[0.05, 0], [0.07, 0.05], [0.001, 0.16]], 6, null, 0, 3.8, 0));
  L.add('wood_dark', box(-0.55, 3.32, -0.02, 0.55, 3.38, 0.02));
  L.add(cl, box(-0.5, 1.82, -0.012, 0.5, 3.3, 0.012));
  L.add(G, box(-0.5, 1.82, -0.016, 0.5, 1.88, 0.016)); L.add(G, box(-0.5, 3.24, -0.016, 0.5, 3.3, 0.016));
  for (const s of [-1, 1]) L.add(G, box(s * 0.5 - 0.03, 1.82, -0.016, s * 0.5 + 0.03, 3.3, 0.016));
  { const disc = lathe([[0.2, 0], [0.18, 0.012], [0.001, 0.02]], 14); disc.rotateX(-Math.PI / 2); disc.translate(0, 2.56, 0); L.add(G, disc); }   // the emblem's disc, facing −z
  for (const x of [-0.45, -0.15, 0.15, 0.45]) L.add(G, rod([x, 1.82, 0], [x, 1.62, 0], 0.012, 4));
  place(L, bag, el);
}

/** baldachin: { at, rot, y, cloth, w, d } — the canopy of the Sacrament on four poles at the bearers' hands: the flat roof, the scalloped valance with gilt fringe, the finial. */
export function baldachin(el, { bag, col }) {
  const L = new Local(), cl = el.cloth ?? 'cloth_white', w = el.w ?? 2.2, d = el.d ?? 1.5, y = 2.75;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) L.add('wood_dark', rod([sx * (w / 2 - 0.08), 0.95, sz * (d / 2 - 0.08)], [sx * (w / 2 - 0.08), y, sz * (d / 2 - 0.08)], 0.028, 6));
  L.add(cl, box(-w / 2, y, -d / 2, w / 2, y + 0.07, d / 2));
  L.add(G, box(-w / 2 - 0.02, y - 0.03, -d / 2 - 0.02, w / 2 + 0.02, y, d / 2 + 0.02));
  // the valance: a hanging band on every side, the gilt fringe along its lower edge
  L.add('cloth_red', box(-w / 2, y - 0.3, -d / 2 - 0.02, w / 2, y, -d / 2)); L.add('cloth_red', box(-w / 2, y - 0.3, d / 2, w / 2, y, d / 2 + 0.02));
  L.add('cloth_red', box(-w / 2 - 0.02, y - 0.3, -d / 2, -w / 2, y, d / 2)); L.add('cloth_red', box(w / 2, y - 0.3, -d / 2, w / 2 + 0.02, y, d / 2));
  L.add(G, box(-w / 2, y - 0.34, -d / 2 - 0.03, w / 2, y - 0.3, -d / 2 + 0.01)); L.add(G, box(-w / 2, y - 0.34, d / 2 - 0.01, w / 2, y - 0.3, d / 2 + 0.03));
  L.add(G, box(-w / 2 - 0.03, y - 0.34, -d / 2, -w / 2 + 0.01, y - 0.3, d / 2)); L.add(G, box(w / 2 - 0.01, y - 0.34, -d / 2, w / 2 + 0.03, y - 0.3, d / 2));
  for (let k = 0, n = Math.round(w / 0.2); k <= n; k++) { L.add(G, rod([-w / 2 + k * w / n, y - 0.34, -d / 2 - 0.02], [-w / 2 + k * w / n, y - 0.44, -d / 2 - 0.02], 0.01, 3)); L.add(G, rod([-w / 2 + k * w / n, y - 0.34, d / 2 + 0.02], [-w / 2 + k * w / n, y - 0.44, d / 2 + 0.02], 0.01, 3)); }
  for (const s of [-1, 1]) for (const [x, z] of [[s * (w / 2 - 0.04), -d / 2], [s * (w / 2 - 0.04), d / 2]]) L.add(G, lathe([[0.06, 0], [0.09, 0.07], [0.001, 0.14]], 6, null, x, y + 0.07, z));
  L.add(G, lathe([[0.09, 0], [0.14, 0.05], [0.07, 0.14], [0.001, 0.26]], 8, null, 0, y + 0.07, 0));
  place(L, bag, el);
  const c = Math.cos(el.rot ?? 0), s2 = Math.sin(el.rot ?? 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) col.circle(el.at[0] + c * sx * (w / 2 - 0.08) + s2 * sz * (d / 2 - 0.08), el.at[1] - s2 * sx * (w / 2 - 0.08) + c * sz * (d / 2 - 0.08), 0.06, el.y ?? 0, (el.y ?? 0) + 2.8);
}
