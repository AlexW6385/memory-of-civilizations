// The works round the pyramid in its last years (docs/settlements/giza.md §13): the ramp of rubble and mud by which the casing
// stones were hauled up, left half taken down (its upper end a sheer cut), the sleeper road to its foot, the masons' shades.
// Elements: ok_ramp { x0, x1, z, w, h, y } (a ramp along x, high at x0, low at x1), ok_shade { rect, h } (an awning of palm
// poles and reed mats), ok_casing { at: [[x, z, rot, n]] } (a dressed casing stone, or n stacked, with its chips about it).

import { box, fromTriangles, quad, lathe } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

/** The ramp: a wedge of rubble and tafla, a skin of mud on its top with sleepers laid across at every 1.2 m, a kerb of logs on both sides, the high end cut sheer. */
export function ramp(el, { bag, col }) {
  const { x0, x1, z, w, h } = el, y = el.y ?? 0, z0 = z - w / 2, z1 = z + w / 2, bt = Math.min(2.2, h * 0.5), d = 0.4;
  const b = [[x0, y - d, z0 - bt], [x1 + bt * 2, y - d, z0 - bt], [x1 + bt * 2, y - d, z1 + bt], [x0, y - d, z1 + bt]];
  const t = [[x0, y + h, z0], [x1, y + 0.02, z0], [x1, y + 0.02, z1], [x0, y + h, z1]];
  const body = [];
  quad(body, b[0], t[0], t[1], b[1]); quad(body, b[1], t[1], t[2], b[2]); quad(body, b[2], t[2], t[3], b[3]); quad(body, b[3], t[3], t[0], b[0]);
  bag.add('rubble', fromTriangles(body));
  const top = [];
  quad(top, t[0], t[3], t[2], t[1]);
  bag.add('mud_plaster', fromTriangles(top));
  const hy = (x) => y + h * (x1 - x) / (x1 - x0);
  // the sleepers across the top, the logs of the kerbs along it
  const L = [], K = [];
  for (let x = x0 + 0.6; x < x1 - 0.2; x += 1.2) beamTris(L, [x, hy(x) + 0.1, z0 + 0.3], [x, hy(x) + 0.1, z1 - 0.3], 0.1, 0.08);
  for (const s of [z0 + 0.12, z1 - 0.12]) beamTris(K, [x0, y + h + 0.16, s], [x1, y + 0.18, s], 0.12, 0.14);
  bag.add('palm_trunk', fromTriangles(L)); bag.add('timber', fromTriangles(K));
  // the cut end: layers of rubble and mud brick showing, the stumps of the posts that held the sides
  for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'mudbrick' : 'limestone_core', box(x0 - 0.02, y + (h * k) / 4, z0 + 0.1, x0 + 0.02, y + (h * (k + 1)) / 4 - 0.06, z1 - 0.1));
  for (let k = 0; k < 4; k++) bag.add('rubble', lathe([[1.1 + (k % 2) * 0.5, 0], [0.8, 0.5], [0.3, 0.9], [0.01, 1.0]], 8, null, x0 - 1.2 - k * 1.6, y - 0.1, z + (k - 1.5) * 1.6));   // the fallen rubble at the foot
  col.ramp([x0, z0, x1, z1], y, y + h, 'w');
}

/** An awning on palm poles with a roof of reed mats, for the masons' and scribes' shade: { rect: [x0, z0, x1, z1], h }. */
export function shade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 2.3, y = el.y ?? 0, P = [], R = [];
  for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) { beamTris(P, [x, y, z], [x, y + h, z], 0.07, 0.07); col.rect([x - 0.07, z - 0.07, x + 0.07, z + 0.07], y, y + h); }
  bag.add('palm_trunk', fromTriangles(P));
  for (let x = x0 - 0.1; x < x1 + 0.1; x += 0.35) beamTris(R, [x, y + h, z0 - 0.2], [x, y + h + 0.04, z1 + 0.2], 0.04, 0.04);
  bag.add('timber', fromTriangles(R));
  bag.add('reed_mat', box(x0 - 0.25, y + h + 0.04, z0 - 0.3, x1 + 0.25, y + h + 0.1, z1 + 0.3));
}

/** Dressed casing stones of white Tura limestone lying about the works: each { at: [x, z, rot, n] } one block or a stack of n (up to 3), with chips and a wetted patch of sand. */
export function casingStones(el, { bag, col }) {
  const y = el.y ?? 0, W = 1.25, D = 0.85, H = 0.8;
  for (const [x, z, rot, n = 1] of el.at) {
    const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + c * u - s * v, z + s * u + c * v];
    for (let k = 0; k < n; k++) {
      const q = [P(-W / 2, -D / 2), P(W / 2, -D / 2), P(W / 2, D / 2), P(-W / 2, D / 2)], xs = q.map((p) => p[0]), zs = q.map((p) => p[1]);
      // a turned box: the corners carry the rotation
      const y0 = y + k * H, y1 = y0 + H, tri = [], B = q.map((p) => [p[0], y0, p[1]]), T = q.map((p) => [p[0], y1, p[1]]);
      quad(tri, T[0], T[3], T[2], T[1]); quad(tri, B[0], B[1], B[2], B[3]);
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(tri, B[i], T[i], T[j], B[j]); }
      bag.add('tura_limestone', fromTriangles(tri));
      col.rect([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y0, y1);
    }
    for (let k = 0; k < 4; k++) { const [px, pz] = P(W / 2 + 0.4 + k * 0.25, (k - 1.5) * 0.5); bag.add('limestone_core', lathe([[0.22, 0], [0.12, 0.07], [0.01, 0.1]], 6, null, px, y, pz)); }
  }
}
