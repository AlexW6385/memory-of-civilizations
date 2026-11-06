// The fortification of the terrace and the gear of the people on it (docs/settlements/persepolis.md §13): the row of
// square mudbrick towers linked by a 10 m thick wall along the terrace's east edge at the foot of Kuh-e Rahmat, and
// the towered wall climbing from the terrace's corners up the slope (ISAC, "Miscellaneous Structures"); the guards'
// pleated felt headdress, spear with its golden pomegranate and tasselled quiver (British Museum 1818,0509.4;
// Livius: the "apple bearers"); the vessels the delegations carry.

import { Matrix4, Vector3, Quaternion } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';

const MB = 'mudbrick', MP = 'plaster_persian';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Stepped merlons of plastered mudbrick along a rect's edge (axis-aligned r, a single row when thin). */
function merlonRow(bag, r, y, w = 1.3, h = 1.5) {
  const [x0, z0, x1, z1] = r, alongX = x1 - x0 >= z1 - z0, L = alongX ? x1 - x0 : z1 - z0, gap = w * 0.6, n = Math.max(1, Math.floor((L + gap) / (w + gap))), o = (L - n * w - (n - 1) * gap) / 2;
  for (let i = 0; i < n; i++) {
    const u0 = (alongX ? x0 : z0) + o + i * (w + gap);
    for (let k = 0; k < 3; k++) {
      const s = w * k / 6, a = u0 + s, b = u0 + w - s, y0 = y + k * h / 3, y1 = y + (k + 1) * h / 3;
      bag.add(MP, alongX ? box(a, y0, z0 + k * 0.01, b, y1, z1 - k * 0.01) : box(x0 + k * 0.01, y0, a, x1 - k * 0.01, y1, b));
    }
  }
}
/** Merlons round the top of a block r at y: a row along each edge, 0.8 deep. */
function crown(bag, r, y) {
  const [x0, z0, x1, z1] = r, d = 0.8;
  merlonRow(bag, [x0, z0, x1, z0 + d], y); merlonRow(bag, [x0, z1 - d, x1, z1], y);
  merlonRow(bag, [x0, z0 + d, x0 + d, z1 - d], y); merlonRow(bag, [x1 - d, z0 + d, x1, z1 - d], y);
}

/**
 * fortification: { x0, x1 (the wall's west and east faces), z0, z1, y (the terrace), h, towers: { every, size, out },
 * climbs: [{ z, x1, th }], ground (x, z) → the mountain's height } — the east wall on the terrace's edge, its towers
 * standing out from both faces and founded on the plain where they pass the terrace's edge; from each end a lower
 * towered wall going east up the slope, stepped course by course on the ground.
 */
export function fortification(el, { bag, col }) {
  const { x0, x1, z0, z1, y, h } = el, T = el.towers ?? {}, every = T.every ?? 38, size = T.size ?? 13, out = T.out ?? 2.5, g = el.ground ?? (() => 0);
  const top = y + h;
  // the wall, plastered, a band of plaster renewed at its foot [inferred]
  bag.add(MB, box(x0, y, z0, x1, top, z1)); col.rect([x0, z0, x1, z1], y, top); col.floor([x0, z0, x1, z1], top);
  bag.add(MP, box(x0 - 0.04, y, z0, x0, y + 1.2, z1));
  merlonRow(bag, [x0, z0, x0 + 0.8, z1], top); merlonRow(bag, [x1 - 0.8, z0, x1, z1], top);
  // the towers: square, standing out `out` past both faces, 3 m higher; on the east their foot on the plain
  const n = Math.max(1, Math.round((z1 - z0) / every));
  for (let i = 0; i <= n; i++) {
    const zc = z0 + (z1 - z0) * i / n, ta = Math.max(z0, zc - size / 2), tb = Math.min(z1, zc + size / 2), r = [x0 - out, ta, x1 + out, tb], tt = top + 3;
    bag.add(MB, box(r[0], (el.foot ?? 0) - 0.4, r[1], r[2], tt, r[3]));            // one mass, its west part buried in the terrace
    col.rect(r, y, tt); col.rect([x1, r[1], r[2], r[3]], el.foot ?? 0, y); col.floor(r, tt);
    crown(bag, r, tt);
    // arrow slits in the tower faces [inferred]
    for (const yy of [top - 3, top]) for (const zz of [zc - size / 4, zc + size / 4]) if (zz > ta + 0.6 && zz < tb - 0.6) {
      bag.add('opening', box(r[0] - 0.01, yy, zz - 0.12, r[0] + 0.25, yy + 1.1, zz + 0.12));
      bag.add('opening', box(r[2] - 0.25, yy, zz - 0.12, r[2] + 0.01, yy + 1.1, zz + 0.12));
    }
  }
  // the walls up the slope from the corners: courses of 6 m stepped on the ground, a tower every fifth course
  for (const c of el.climbs ?? []) {
    const th = c.th ?? 5, step = 6, za = c.z - th / 2, zb = c.z + th / 2;
    let k = 0;
    for (let x = x1 + (c.from ?? 0); x < c.x1 - 1e-6; x += step, k++) {
      const xe = Math.min(c.x1, x + step), lo = Math.min(g(x, za), g(xe, za), g(x, zb), g(xe, zb)), hi = Math.max(g(x, c.z), g(xe, c.z));
      const tower = k % 5 === 4, tz = tower ? [za - 2, zb + 2] : [za, zb], t1 = hi + (tower ? 10 : 7);
      bag.add(MB, box(x, lo - 1, tz[0], xe, t1, tz[1])); col.rect([x, tz[0], xe, tz[1]], lo - 1, t1); col.floor([x, tz[0], xe, tz[1]], t1);
      merlonRow(bag, [x, tz[0], xe, tz[0] + 0.8], t1); merlonRow(bag, [x, tz[1] - 0.8, xe, tz[1]], t1);
    }
  }
}

// ---- the gear of figures placed by the settlement (built where the figure of the same seed and height stands) ----
/** The matrix of a figure (src/objects/figures.js): at, y, rot; scale h/1.65, its girth from its seed. */
function figureM(el) {
  const r0 = rng(el.seed), girth = 0.92 + r0() * 0.18, s = (el.h ?? 1.7) / 1.65;
  return new Matrix4().compose(new Vector3(el.at[0], el.y ?? 0, el.at[1]), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(s * girth, s, s * (0.94 + (girth - 0.92) * 0.6)));
}
/**
 * guard_gear: { at, y, rot, h, seed, len } for a figure with a staff (`len`) — the guard's pleated headdress (felt),
 * the spearhead on the staff and the golden pomegranate at its butt, the tasselled quiver on his back (courtier: the
 * headdress alone).
 */
export function guardGear(el, { bag }) {
  const M = figureM(el), len = el.len ?? 2.2, put = (mat, g) => bag.add(mat, g.applyMatrix4(M));
  put(el.hatMat ?? 'cloth_ochre', lathe([[0.104, 1.53], [0.106, 1.6], [0.112, 1.7], [0.116, 1.79], [0.11, 1.795], [0.001, 1.8]], 24, (th, i) => (i < 4 ? 1 + 0.06 * Math.abs(Math.cos(th * 12)) : 1), 0, 0, -0.005));
  if (el.courtier) return;                                                   // an usher: the headdress alone
  const hx = 0.25, hz = -0.259, top = 1.11 + 0.55 * len;
  put('bronze', lathe([[0.022, 0], [0.034, 0.05], [0.026, 0.12], [0.001, 0.2]], 8, null, hx, top - 0.01, hz));
  put('gold', lathe([[0.001, 0], [0.03, 0.01], [0.045, 0.045], [0.04, 0.08], [0.02, 0.1], [0.024, 0.12], [0.001, 0.125]], 10, null, hx, 0.0, hz + 0.04));
  // the quiver slung behind the left shoulder, its lid and tassel
  const q = lathe([[0.05, 0], [0.055, 0.5], [0.06, 0.52], [0.001, 0.53]], 10);
  q.applyMatrix4(new Matrix4().makeRotationZ(0.22)).translate(0.08, 0.86, 0.17);
  put(el.quiverMat ?? 'hide_tan', q);
  put('cloth_red', lathe([[0.02, 0], [0.03, 0.1], [0.001, 0.12]], 6, null, 0.06, 0.74, 0.17));
}
/** gift: { at, y, rot, h, seed, kind ('bowl' | 'jar' | 'phial'), mat } — the vessel held before a bearer with clasped hands. */
export function gift(el, { bag }) {
  const M = figureM(el), m = el.mat ?? 'gold';
  const g = el.kind === 'bowl' ? lathe([[0.001, 0], [0.06, 0.005], [0.12, 0.05], [0.13, 0.07], [0.118, 0.068], [0.001, 0.02]], 16, null, 0, 0.94, -0.22)
    : el.kind === 'phial' ? lathe([[0.001, 0], [0.1, 0.01], [0.11, 0.03], [0.001, 0.02]], 14, null, 0, 0.98, -0.22)
      : lathe([[0.04, 0], [0.07, 0.04], [0.085, 0.12], [0.06, 0.2], [0.035, 0.24], [0.045, 0.27], [0.001, 0.27]], 14, null, 0, 0.88, -0.23);
  bag.add(m, g.applyMatrix4(M));
}
