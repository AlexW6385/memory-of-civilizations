// The ships of the Tagus about 1520 (docs/settlements/manueline-lisbon.md §7): the nau or carrack with its high stern castle and
// forecastle, three masts, square courses with the red cross of the Order of Christ and a lateen mizzen; the caravel, lateen-rigged;
// the little lateen boat of the river (barca). Hulls lofted by ptolemaic/harbour.js's `hull` (read-only). Element `ship`.
import { box, rod, fromTriangles, lathe } from '../../core/geom.js';
import { hull } from '../ptolemaic/harbour.js';
import { orderCross } from './util.js';

function sail(w, y0, y1, z, bulge, nx = 6, ny = 4) {
  const P = (i, j) => { const u = i / nx * 2 - 1, v = j / ny; return [u * w / 2 * (1 - 0.1 * v), y1 + (y0 - y1) * v, z - bulge * (1 - u * u) * Math.sin(Math.PI * (0.12 + 0.76 * v))]; };
  const T = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }
  return fromTriangles(T);
}
/** A lateen sail: a triangle from the yard (a long spar rising forward) down to the tack and clew on the deck, both faces. */
function lateen(p0, p1, p2, bulge) {
  // p0 the yard's lower (fore) end, p1 its upper (aft) end, p2 the clew low aft; bulged to port
  const N = 5, T = [], P = (a, b) => { const u = a / N, v = b / N, x = p0[0] * (1 - u - v) + p1[0] * u + p2[0] * v; return [x + bulge * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, (u + v) / 1.0)), p0[1] * (1 - u - v) + p1[1] * u + p2[1] * v, p0[2] * (1 - u - v) + p1[2] * u + p2[2] * v]; };
  for (let a = 0; a < N; a++) for (let b = 0; b < N - a; b++) {
    const A = P(a, b), B = P(a + 1, b), C = P(a, b + 1);
    T.push(...A, ...B, ...C, ...A, ...C, ...B);
    if (a + b < N - 1) { const D = P(a + 1, b + 1); T.push(...B, ...D, ...C, ...B, ...C, ...D); }
  }
  return fromTriangles(T);
}
/** [material, geometry] pairs of a ship, bow toward −z, waterline y 0. kind: 'carrack' | 'caravel' | 'barca'. */
export function shipParts(kind, L, seed = 1) {
  const out = [], add = (m, g) => out.push([m, g]), S = L / 30;
  if (kind === 'barca') {
    const H = hull(L, L * 0.32, 0.45 * L / 9, 0.8 * L / 9, { bowRise: 0.5, sternRise: 0.3, sharp: 0.7 });
    add('wood_painted', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
    add('timber', rod([0, 0.3, -L * 0.18], [0, L * 0.55, -L * 0.18], 0.04 * L / 9, 5));
    add('linen', lateen([0, L * 0.12, -L * 0.2], [0, L * 0.72, L * 0.18], [0, L * 0.18, L * 0.34], 0.25));
    return out;
  }
  if (kind === 'caravel') {
    const H = hull(L, L * 0.28, 1.6 * S, 2.0 * S, { bowRise: 1.0 * S, sternRise: 2.6 * S, sharp: 0.6 });
    add('wood_dark', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
    add('wood_ochre', box(-L * 0.12, 2.0 * S, L * 0.28, L * 0.12, 3.8 * S, L * 0.48));                                // the little stern castle
    for (const [z, h, k] of [[-L * 0.2, 14 * S, 1], [L * 0.1, 17 * S, 1.1]]) {
      add('timber', rod([0, 1.5 * S, z], [0, h, z], 0.12 * S, 6));
      add('timber', rod([0, h * 0.35, z - 1.0 * S], [0, h * 0.98, z + 5.5 * S], 0.07 * S, 5));                         // the lateen yard
      add('linen', lateen([0, h * 0.35, z - 1.0 * S], [0, h * 0.98, z + 5.5 * S], [0, 3.0 * S, z + L * 0.2], 0.4 * S * k));
      orderCross(null || { add: (m, g) => add(m, g) }, 'cloth_red', 0.55 * S * k, h * 0.58, z + 3 * S, 1.1 * S, 'e');
    }
    return out;
  }
  // the carrack
  const H = hull(L, L * 0.31, 2.8 * S, 3.4 * S, { bowRise: 2.0 * S, sternRise: 6.0 * S, sharp: 0.55 });
  add('wood_dark', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
  const hb = H.st[8].b;
  // wales, gun ports, the stern castle with its windows, the forecastle
  for (const s of [-1, 1]) {
    add('wood_ochre', box(s * (hb + 0.02) - 0.06, 1.2 * S, -L * 0.3, s * (hb + 0.02) + 0.06, 1.55 * S, L * 0.34));
    for (let k = 0; k < 6; k++) add('opening', box(s * (hb + 0.05) - 0.08, 0.55 * S, -L * 0.2 + k * L * 0.075, s * (hb + 0.05) + 0.08, 1.05 * S, -L * 0.2 + k * L * 0.075 + 1.0 * S));
  }
  add('wood_painted', box(-hb * 0.82, 3.4 * S, L * 0.2, hb * 0.82, 7.4 * S, L * 0.5)); add('timber', box(-hb * 0.9, 7.4 * S, L * 0.19, hb * 0.9, 7.7 * S, L * 0.5));
  add('wood_painted', box(-hb * 0.65, 7.7 * S, L * 0.34, hb * 0.65, 10.2 * S, L * 0.5)); add('timber', box(-hb * 0.72, 10.2 * S, L * 0.33, hb * 0.72, 10.5 * S, L * 0.5));
  for (let k = 0; k < 5; k++) add('opening', box(-hb * 0.7 + k * hb * 0.35, 4.6 * S, L * 0.5 - 0.02, -hb * 0.7 + k * hb * 0.35 + 0.7 * S, 5.8 * S, L * 0.5 + 0.1));
  add('wood_painted', box(-hb * 0.7, 3.4 * S, -L * 0.5, hb * 0.7, 6.2 * S, -L * 0.36)); add('timber', box(-hb * 0.78, 6.2 * S, -L * 0.5, hb * 0.78, 6.5 * S, -L * 0.35));
  add('timber', rod([0, 4 * S, -L * 0.48], [0, 7.5 * S, -L * 0.7], 0.12 * S, 5));                                      // the bowsprit
  // masts and sails: fore, main (the great course with the cross), mizzen (lateen), topsails
  const masts = [[-L * 0.3, 21 * S, 11 * S], [L * 0.02, 28 * S, 15 * S]];
  for (const [z, h, w] of masts) {
    add('timber', rod([0, 3 * S, z], [0, h, z], 0.2 * S, 6));
    add('timber', rod([-w * 0.54, h * 0.55, z], [w * 0.54, h * 0.55, z], 0.1 * S, 6));
    add('linen', sail(w, h * 0.2, h * 0.55, z - 0.1, 2.0 * S));
    add('timber', rod([-w * 0.34, h * 0.9, z], [w * 0.34, h * 0.9, z], 0.07 * S, 5));
    add('linen', sail(w * 0.62, h * 0.57, h * 0.9, z - 0.1, 1.0 * S, 5, 3));
    orderCross({ add: (m, g) => add(m, g) }, 'cloth_red', 0, h * 0.37, z - 2.0 * S * 0.95 - 0.1, w * 0.3, 'n', 0.06);
    add('wood_dark', box(-0.6 * S, h * 0.93, z - 0.6 * S, 0.6 * S, h * 0.99, z + 0.6 * S));             // the crow's nest
    add('cloth_red', box(-0.05, h * 1.0, z, 0.05, h * 1.0 + 1.6 * S, z + 2.4 * S));                      // the pennant
  }
  const zm = L * 0.34;
  add('timber', rod([0, 6 * S, zm], [0, 19 * S, zm], 0.14 * S, 5));
  add('timber', rod([0, 8 * S, zm - 3 * S], [0, 20 * S, zm + 7 * S], 0.07 * S, 5));
  add('linen', lateen([0, 8 * S, zm - 3 * S], [0, 20 * S, zm + 7 * S], [0, 7 * S, zm + L * 0.15], 0.5 * S));
  add('cloth_red', box(-0.05, 19.5 * S, zm, 0.05, 21 * S, zm + 2 * S));
  void seed;
  return out;
}
/** ship: { at [x, z], rot (yaw), y (waterline), kind, len, seed } */
export function ship(el, { bag }) {
  const L = el.len ?? 30;
  for (const [m, g] of shipParts(el.kind ?? 'carrack', L, el.seed ?? 1)) { g.rotateY(el.rot ?? 0); g.translate(el.at[0], el.y ?? 0, el.at[1]); bag.add(m, g); }
}
void lathe;
