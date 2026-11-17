// The roof of a great house seen close and from afar (docs/settlements/cahokia.md §5.16): the seams of
// the thatch where one bundle's width meets the next, tied down with a pole every few seams, and along
// the ridge three carved birds on a board — after the temple of the Natchez, whose ridge carried "three
// birds of carved wood on flat boards", white with red feathers, facing east (Le Page du Pratz, tr. Sayre).
import { rod } from '../../core/geom.js';
import { fromTriangles } from '../../core/geom.js';
import { tri } from './kit.js';

/**
 * The seams of a hipped roof (as kit.js thatchHip lays it: eave rect grown by o, eave at y, rise): a rib
 * of bundled grass up each slope every ~1.05 m, one in four a lashed pole, standing a hand off the thatch.
 */
export function roofRibs(bag, [x0, z0, x1, z1], y, rise, o, rand) {
  const X0 = x0 - o, Z0 = z0 - o, X1 = x1 + o, Z1 = z1 + o, m = Math.min(X1 - X0, Z1 - Z0) / 2 - 0.02, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  const sides = [[[X0, Z0], [X1, Z0]], [[X1, Z0], [X1, Z1]], [[X1, Z1], [X0, Z1]], [[X0, Z1], [X0, Z0]]];
  for (const [P, Q] of sides) {
    const Le = Math.hypot(Q[0] - P[0], Q[1] - P[1]), ux = (Q[0] - P[0]) / Le, uz = (Q[1] - P[1]) / Le;
    let dx = -uz, dz = ux; if ((cx - P[0]) * dx + (cz - P[1]) * dz < 0) { dx = -dx; dz = -dz; }
    const n = Math.max(2, Math.round(Le / 1.05));
    for (let k = 1; k < n; k++) {
      const s = Le * k / n + (rand() - 0.5) * 0.08, tmax = Math.min(1, Math.min(s, Le - s) / m), pole = k % 4 === 0;
      const at = (t) => [P[0] + ux * s + dx * m * t - dx * 0.16, y + rise * t + 0.1 + 0.12 * (1 - t), P[1] + uz * s + dz * m * t - dz * 0.16];
      const a = at(0.03), b = at(tmax * 0.97);
      bag.add(pole ? 'timber' : 'thatch', rod(a, b, pole ? 0.05 : 0.075, 5));
    }
  }
}

/** Extrude a convex polygon of [x, y] (in the xy plane, x along the ridge) between z0 and z1 into triangles. */
function prism(out, poly, x, y, z0, z1, k) {
  const P = poly.map(([u, v]) => [x + u * k, y + v * k]), c = P.reduce((s, p) => [s[0] + p[0] / P.length, s[1] + p[1] / P.length], [0, 0]);
  for (let i = 1; i + 1 < P.length; i++) { tri(out, [P[0][0], P[0][1], z1], [P[i][0], P[i][1], z1], [P[i + 1][0], P[i + 1][1], z1], [0, 0, 1]); tri(out, [P[0][0], P[0][1], z0], [P[i][0], P[i][1], z0], [P[i + 1][0], P[i + 1][1], z0], [0, 0, -1]); }
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], mx = (a[0] + b[0]) / 2 - c[0], my = (a[1] + b[1]) / 2 - c[1];
    tri(out, [a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [mx, my, 0]); tri(out, [a[0], a[1], z0], [b[0], b[1], z1], [a[0], a[1], z1], [mx, my, 0]);
  }
}
const BODY = [[-0.55, 0.08], [-0.25, 0.0], [0.3, 0.02], [0.5, 0.22], [0.42, 0.5], [-0.1, 0.55], [-0.5, 0.42]];
const NECK = [[0.2, 0.4], [0.52, 0.36], [0.62, 0.95], [0.4, 0.98]];
const HEAD = [[0.38, 0.9], [0.72, 0.88], [0.78, 1.12], [0.52, 1.2], [0.36, 1.08]];
const BEAK = [[0.7, 0.9], [1.18, 0.95], [0.72, 1.06]];
const TAIL = [[-0.5, 0.3], [-0.52, 0.5], [-1.15, 0.78], [-1.2, 0.46], [-0.95, 0.2]];
const WING = [[-0.4, 0.15], [0.12, 0.12], [0.3, 0.28], [0.05, 0.48], [-0.45, 0.4]];

/** Three carved birds on a flat board along the ridge a → b, facing east (+x), scale k, the first of them at fraction `at`. */
export function ridgeBirds(bag, a, b, k = 1.3, fr = [0.4, 0.5, 0.6]) {
  const len = b[0] - a[0], zc = a[2], base = a[1] + 0.3;
  if (len < 6) fr = [0.5];
  // the board they stand on, one board along the ridge for each bird, edged in red
  for (const f of fr) {
    const x = a[0] + len * f, white = [], red = [], ochre = [];
    prism(white, BODY, x, base + 0.45, zc - 0.07, zc + 0.07, k); prism(white, NECK, x, base + 0.45, zc - 0.07, zc + 0.07, k); prism(white, HEAD, x, base + 0.45, zc - 0.07, zc + 0.07, k);
    prism(ochre, BEAK, x, base + 0.45, zc - 0.06, zc + 0.06, k);
    prism(red, TAIL, x, base + 0.45, zc - 0.075, zc + 0.075, k); prism(red, WING, x, base + 0.45, zc - 0.08, zc + 0.08, k);
    bag.add('paint_white', fromTriangles(white)); bag.add('paint_ochre', fromTriangles(ochre)); bag.add('timber_red', fromTriangles(red));
    bag.add('timber_red', rod([x - 1.25 * k, base + 0.28, zc], [x + 1.0 * k, base + 0.28, zc], 0.09, 6));
    for (const dx of [-0.5, 0.3]) bag.add('timber', rod([x + dx * k, base - 0.05, zc], [x + dx * k, base + 0.45, zc], 0.05, 5));
  }
}
