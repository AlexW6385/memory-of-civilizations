// The stairs of the Qing palace's terraces and altars (docs/settlements/qing-beijing.md §16): the
// imperial ramp (yu lu, danbi) between the flights, its marble carved in relief with dragons among
// cloud scrolls above sea waves and mountains, and the inclined balustrades (the "rakes") on the
// flights' sides, with their carved posts and the drum stones at the foot.

import { Matrix4, Vector3 } from '../../core/three.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { Parts, ball, limb, T, merge, post } from './carving.js';
import { reliefDragon, cloud } from './throne.js';

/** Where a point at run distance s (up the stairs) and lateral q lies: [x, z], for a flight { rect, dir }. */
function place(rect, dir) {
  const [x0, z0, x1, z1] = rect;
  return dir === 'n' ? (q, s) => [q, z1 - s] : dir === 's' ? (q, s) => [q, z0 + s] : dir === 'e' ? (q, s) => [x0 + s, q] : (q, s) => [x1 - s, q];
}
const hdir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

const cache = new Map();
/** The relief on a ramp W wide and S long (along the slope), in its own frame: x across, y up the slope, z out of the stone. */
function reliefParts(W, S) {
  const key = `${W.toFixed(2)}x${S.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  const P = new Parts(), m = 'marble';
  // the frame: a raised border all round
  const e = 0.1, fw = 0.16;
  for (const sx of [-1, 1]) P.add(m, box(sx * (W / 2 - e) - fw / 2, e, 0, sx * (W / 2 - e) + fw / 2, S - e, 0.05));
  for (const y of [e, S - e - fw]) P.add(m, box(-W / 2 + e, y, 0, W / 2 - e, y + fw, 0.05));
  // the sea at the foot: rows of breaking waves (half-discs, alternate rows offset), the mountains rising from it
  const nw = Math.max(5, Math.round(W / 0.55));
  for (let row = 0; row < 2; row++) for (let i = 0; i < nw + row; i++) {
    const x = -W / 2 + (i + (row ? 0 : 0.5)) * (W / nw) - (row ? W / nw / 2 : 0) + 0.0;
    if (Math.abs(x) > W / 2 - 0.35) continue;
    P.add(m, T(ball(W / nw * 0.55, 0.17, 0.05, 8, 4), x, 0.42 + row * 0.26, 0.02));
    P.add(m, T(ball(W / nw * 0.3, 0.08, 0.06, 6, 3), x + 0.06, 0.5 + row * 0.26, 0.05));
  }
  for (const [x, hgt, wd] of [[-W * 0.18, 0.8, 0.5], [0, 1.05, 0.6], [W * 0.18, 0.8, 0.5]]) P.add(m, T(lathe([[wd, 0], [wd * 0.55, hgt * 0.5], [0.001, hgt]], 6).scale(1, 1, 0.12), x, 1.0, 0.02));
  // the dragons, rising among clouds, the flaming pearl before each head
  const n = W > 5 ? 2 : 1, y0 = 1.9, hh = Math.max(1.5, S - y0 - 0.5), cw = (W - 0.5) / n;
  for (let k = 0; k < n; k++) {
    const D = new Parts(), cx = -W / 2 + 0.25 + cw * (k + 0.5), dir = n === 2 ? (k ? -1 : 1) : 1;
    reliefDragon(D, m, cw, hh, Math.min(0.32, cw * 0.075), { lite: true, pearl: true, pearlMat: 'gilt_bronze', dir, phase: k ? Math.PI : 0 });
    for (const [mm, list] of D.m) P.add(mm, T(merge(list), cx, y0, 0.04));
  }
  for (let k = 0; k < 5; k++) for (const sx of [-1, 1]) {
    const y = 1.7 + k * (S - 2.4) / 4, x = sx * (W / 2 - 0.55) * (k % 2 ? 0.8 : 1);
    if (n === 1 && sx > 0 && k % 2) continue;
    cloud(P, m, x, y, 0.5, 0.03);
  }
  if (n === 2) for (let k = 0; k < 4; k++) cloud(P, m, 0, 2.6 + k * (S - 3.4) / 3, 0.45, 0.03);
  cache.set(key, P);
  return P;
}

/** The carved ramp on the slab of a flight { rect, y0, y1, dir }. */
export function rampRelief(bag, el) {
  const [x0, z0, x1, z1] = el.rect, dir = el.dir, alongZ = dir === 'n' || dir === 's';
  const len = alongZ ? z1 - z0 : x1 - x0, rise = el.y1 - el.y0, S = Math.hypot(len, rise), W = alongZ ? x1 - x0 : z1 - z0;
  if (W < 2 || S < 2.5) return;
  const P = reliefParts(W, S), pl = place(el.rect, dir), qc = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
  const [fx, fz] = pl(qc, 0), h = hdir[dir], c = len / S, s = rise / S;
  const Y = new Vector3(h[0] * c, s, h[1] * c), Z = new Vector3(-h[0] * s, c, -h[1] * s), X = new Vector3().crossVectors(Y, Z);
  const M = new Matrix4().makeBasis(X, Y, Z).setPosition(fx, el.y0, fz);
  for (const [mat, list] of P.m) bag.add(mat, merge(list).applyMatrix4(M));
}

/**
 * The inclined balustrades along a flight's sides { rect, y0, y1, dir, rakeOff }: a cheek wall
 * following the steps' nosings, over it the panel, cloud band and handrail between carved posts every
 * 1.6 m, at the foot a pier carrying a drum stone (baogushi).
 */
export function stairRakes(bag, col, el) {
  const [x0, z0, x1, z1] = el.rect, dir = el.dir, alongZ = dir === 'n' || dir === 's';
  const len = alongZ ? z1 - z0 : x1 - x0, y0 = el.y0, y1 = el.y1, rise = y1 - y0, n = Math.max(1, Math.round(rise / 0.16)), tread = rise / n;
  const pl = place(el.rect, dir), g = el.rakeOff ?? 0.2, [qa, qb] = alongZ ? [x0, x1] : [z0, z1];
  const lineY = (s) => y0 + rise * s / len;                       // the nosing line
  const yc = (s) => lineY(s) + tread + 0.14;                      // the cheek's top
  const m = 'marble_smooth', k = Math.max(1, Math.round(len / 1.6)), P = new Parts();
  for (const q of el.rakeSides === 'out' ? [qa - g, qb + g] : [qa - g, qb + g]) {
    const A = (s) => pl(q, s), t = [];
    const a = A(0), b = A(len);
    beamTris(t, [a[0], y0 - 0.25, a[1]], [b[0], y1 - 0.25, b[1]], 0.1, tread + 0.14 + 0.25, true);           // the cheek wall
    const posts = [];
    for (let i = 0; i <= k; i++) {
      const s = len * i / k, p = A(s), Pp = new Parts();
      post(Pp, m, i % 2 ? 'phoenix' : 'dragon', 0.98); Pp.emit(bag, p[0], yc(s) - 0.12, p[1]);
      posts.push([p, s]);
    }
    for (let i = 0; i < k; i++) {
      const [pa, sa] = posts[i], [pb, sb] = posts[i + 1], f = (u) => [pa[0] + (pb[0] - pa[0]) * u, pa[1] + (pb[1] - pa[1]) * u];
      const u0 = 0.08, u1 = 0.92, la = f(u0), lb = f(u1), ya = yc(sa + (sb - sa) * u0), yb = yc(sa + (sb - sa) * u1);
      beamTris(t, [la[0], ya, la[1]], [lb[0], yb, lb[1]], 0.07, 0.4, true);                                 // the panel
      beamTris(t, [la[0], ya + 0.4, la[1]], [lb[0], yb + 0.4, lb[1]], 0.085, 0.06, true);                   // its upper frame
      beamTris(t, [la[0], ya + 0.5, la[1]], [lb[0], yb + 0.5, lb[1]], 0.055, 0.06, true);                   // the cloud band
      P.add(m, limb([la[0], ya + 0.86, la[1]], [lb[0], yb + 0.86, lb[1]], 0.045, 0.045, 6));
      for (const j of [1, 2]) { const u = u0 + (u1 - u0) * j / 3, p = f(u), yy = yc(sa + (sb - sa) * u); P.add(m, lathe([[0.055, 0], [0.07, 0.09], [0.03, 0.18], [0.05, 0.2], [0.001, 0.2]].map(([r, v]) => [r, v + 0.56]), 6, null, p[0], yy, p[1])); }
    }
    P.add(m, fromTriangles(t));
    // the foot: a pier and the drum stone on it, set before the first post
    const sgn = q < (qa + qb) / 2 ? -1 : 1, fp = A(-0.45);
    P.add(m, box(fp[0] - 0.22, y0 - 0.1, fp[1] - 0.22, fp[0] + 0.22, y0 + 0.62, fp[1] + 0.22));
    const dr = lathe([[0.001, -0.17], [0.34, -0.17], [0.38, -0.12], [0.38, 0.12], [0.34, 0.17], [0.001, 0.17]], 14);
    dr.rotateZ(Math.PI / 2); dr.rotateY(alongZ ? 0 : Math.PI / 2); dr.translate(fp[0], y0 + 0.62 + 0.4, fp[1]);
    P.add(m, dr);
    P.add(m, box(fp[0] - 0.26, y0 + 0.62, fp[1] - 0.26, fp[0] + 0.26, y0 + 0.7, fp[1] + 0.26));
    void sgn;
    const lo = A(-0.5), hi = A(len);
    col.segment(lo, hi, 0.13, Math.min(y0, y1) - 0.2, y1 + 1.1);
  }
  for (const [mat, list] of P.m) bag.add(mat, merge(list));
}
