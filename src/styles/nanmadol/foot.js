// The footing of Nan Madol's walls (docs/settlements/nan-madol.md §12): the walls "stand on a foundation of boulders, some over 20 tonnes"
// [stated: NRHP 1974; McCoy & Athens 2012] — big rounded basalt boulders set along the foot of a wall, uneven in size and standing
// in and out of line, a few columns laid among them. Pure geometry; instanced from three shapes.
import { lathe } from '../../core/geom.js';
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { rng, laid } from './crib.js';

// a rounded block, 1 m across and 1 m high, flat-bedded: a stubby barrel of 7 sides, three different profiles
const PROF = [
  [[0.001, 0], [0.44, 0.04], [0.52, 0.34], [0.5, 0.66], [0.36, 0.92], [0.001, 1]],
  [[0.001, 0], [0.5, 0.06], [0.46, 0.3], [0.54, 0.62], [0.4, 0.9], [0.001, 0.98]],
  [[0.001, 0], [0.4, 0.03], [0.5, 0.25], [0.44, 0.7], [0.3, 0.95], [0.001, 1]],
];
const SH = PROF.map((p, i) => lathe(p, 7 + i));
const Q = new Quaternion(), P = new Vector3(), S = new Vector3(), UP = new Vector3(0, 1, 0);

/**
 * boulder_foot { a, b, out: [nx, nz], off, y0, h, size, gap, seed, margin }: boulders along the line a → b, their centres `off` m out
 * from it (toward `out`), from y0 up to about y0 + h, `size` m across on average, `margin` m left clear at each end. Columns lie
 * between some of them. `col` (optional) makes each a round collider of height `colH`.
 */
export function boulder_foot(el, { bag, col }) {
  const [a, b] = [el.a, el.b], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, [nx, nz] = el.out;
  const rand = rng(el.seed ?? 1), size = el.size ?? 1.2, h = el.h ?? 0.9, off = el.off ?? 0.8, y0 = el.y0 ?? -0.1, m = el.margin ?? 1.2;
  let u = m + rand() * 0.6;
  while (u < L - m - size * 0.5) {
    const s = size * (0.7 + rand() * 0.7), sx = s * (0.9 + rand() * 0.3), sz = s * (0.8 + rand() * 0.4), sy = h * (0.6 + rand() * 0.55);
    const o = off + (rand() - 0.5) * (el.jit ?? 0.2 * size), cx = a[0] + ux * u + nx * o, cz = a[1] + uz * u + nz * o;
    Q.setFromAxisAngle(UP, rand() * 6.283);
    const M = new Matrix4().compose(P.set(cx, y0 - 0.1 + rand() * 0.12, cz), Q, S.set(sx, sy, sz));
    const mat = rand() < 0.65 ? 'granite_black' : 'dolerite_spotted';
    bag.addInstance(mat, SH[Math.floor(rand() * 3)], M, { reach: el.reach ?? 140 });
    if (col && el.colH) col.circle(cx, cz, Math.min(Math.min(sx, sz) * 0.33, el.rmax ?? 0.5), 0, el.colH);
    // a column laid in the gap between this boulder and the next, parallel to the wall, now and then
    const adv = Math.max(sx, sz) * 0.5 + 0.12 + rand() * 0.25;
    u += adv * 2 - 0.1;
    if (el.beds !== false && rand() < 0.3 && u + 2.2 < L - m) {
      const len = [1.4, 1.8, 2.2][Math.floor(rand() * 3)];
      laid(bag, 'dolerite_spotted', len, a[0] + ux * u + nx * (off - 0.25), y0 + 0.2, a[1] + uz * u + nz * (off - 0.25), ux, uz, el.reach ?? 140, 0.2);
      u += len + 0.1;
    }
  }
}
