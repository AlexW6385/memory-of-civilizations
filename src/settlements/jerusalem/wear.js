// Jerusalem about 700, worn (docs/settlements/jerusalem.md §12.5): what long use had done to the stone by then. Two things, both of the same kind as the
// reference's (src/settlements/ming-suzhou/quaywork.js: the treads worn along the middle, a street's worn centre line): the steps the pilgrims climbed, and
// the portico floors of the Cardo and the market street with the worn patch before every open shop's door. A band of pale, smoothed stone lies a hair above
// the tread or the flag, its edges ragged, in pieces with gaps; no geometry is cut. The Cardo's colonnades are the Byzantine street of the sixth century,
// 150 years of feet by the year 700 [stated: dossier §4a, §4d]; the wear itself is [inferred] from that age and from the traffic the dossier gives.
// Registered in the lit styles (nightlight.js registerNight): the element `jer_stair_wear`, and the colonnade wrapped once more.
import { fromTriangles } from '../../core/geom.js';
import { HARAM, CARDO, SEPULCHRE, SEP_Y, SEP_STAIR, CARDO_Y, height } from './layout.js';
import { colKey, TRADES_OF } from './shopline.js';

const MAT = 'limestone_carved';
function hash(a, b, c = 0) {
  let h = (Math.round(a * 16) * 73856093) ^ (Math.round(b * 16) * 19349663) ^ Math.imul(c + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** One triangle, wound so that it faces up (the geometry's normal is (c - b) x (a - b)). */
function up(out, a, b, c) {
  const ny = (c[2] - b[2]) * (a[0] - b[0]) - (c[0] - b[0]) * (a[2] - b[2]);
  if (ny >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const quadUp = (out, a, b, c, d) => { up(out, a, b, c); up(out, a, c, d); };

/**
 * jer_stair_wear { rect, dir, y0, y1, riser, half, off }: over a `stair` of the same numbers (core/build.js), on every tread a band of worn stone across
 * the middle of the flight (`half` m to each side of the middle plus `off`, ragged), a hair above the tread, short of its edges.
 */
export function stairWear(el, { bag }) {
  const [x0, z0, x1, z1] = [Math.min(el.rect[0], el.rect[2]), Math.min(el.rect[1], el.rect[3]), Math.max(el.rect[0], el.rect[2]), Math.max(el.rect[1], el.rect[3])];
  const rise = el.y1 - el.y0, n = Math.max(1, Math.round(Math.abs(rise) / (el.riser || 0.17))), alongX = el.dir === 'e' || el.dir === 'w', rising = el.dir === 'e' || el.dir === 's';
  const A0 = alongX ? x0 : z0, A1 = alongX ? x1 : z1, C = ((alongX ? z0 + z1 : x0 + x1) / 2) + (el.off ?? 0), half = el.half ?? 1.2, out = [];
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, yT = el.y0 + rise * f1 + 0.012;
    const a0 = rising ? A0 + (A1 - A0) * f0 : A1 - (A1 - A0) * f1, a1 = rising ? A0 + (A1 - A0) * f1 : A1 - (A1 - A0) * f0;
    const d = a1 - a0, lo = a0 + d * 0.1, hi = a1 - d * 0.04;
    const w0 = half * (0.78 + 0.44 * hash(A0, C + i, 1)), w1 = half * (0.78 + 0.44 * hash(A0 + i, C, 2)), o = (hash(A0, C, i + 3) - 0.5) * 0.4;
    const P = (a, c) => (alongX ? [a, yT, c] : [c, yT, a]);
    quadUp(out, P(lo, C + o - w0), P(hi, C + o - w1), P(hi, C + o + w1), P(lo, C + o + w0));
  }
  bag.add(MAT, fromTriangles(out));
}

/** The 17 m stair up from the Cardo to the Holy Sepulchre's terrace (city.js sepulchre()): a wide band, the pilgrims came up it all day [inferred]. */
export function sepulchreStairWear() {
  const [sx0, sz0, sx1, sz1] = SEPULCHRE, zc = (sz0 + sz1) / 2, xs = sx1 - SEP_STAIR;
  return [{ t: 'jer_stair_wear', rect: [xs, zc - 15, sx1, zc + 15], dir: 'w', y0: CARDO_Y + 0.18, y1: SEP_Y, riser: 0.17, half: 2.4, off: -1 }];
}
/** The stair up to the Haram's west gate (plan.js): the way of the Muslim pilgrims and the attendants [inferred]. */
export function haramStairWear() {
  const hx0 = HARAM.rect[0];
  return [{ t: 'jer_stair_wear', rect: [hx0 - 24, -6, hx0 - 3, 6], dir: 'e', y0: height(hx0 - 24, 0), y1: HARAM.top, riser: 0.18, half: 1.5 }];
}

/**
 * The colonnade over its base builder: a worn centre line down the portico's floor (pieces 1.3 to 2.9 m, a hand's width off the line, gaps between) and,
 * before every open shop's door, the patch that the customers' feet make. The shops that are shut (TRADES_OF has a dash) have none.
 */
export function colonnadeWear(base) {
  return (el, ctx) => {
    base(el, ctx);
    const [ax, az] = el.a, [bx, bz] = el.b, y = (el.y ?? 0) + 0.18 + 0.012, side = el.side ?? 1, D = el.depth ?? 5;
    const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], P = (s, t) => { const q = [ax + u[0] * s + n[0] * t * side, y, az + u[1] * s + n[1] * t * side]; return q; };
    const out = [], ns = Math.max(1, Math.round(L / 4.5)), sw = L / ns, codes = TRADES_OF[colKey(el)];
    // the centre line
    for (let s = 0.9 + 1.2 * hash(ax, az, 5); s < L - 2.4;) {
      const l = 1.3 + 1.6 * hash(ax + s, az, 6), t = D * 0.42 + (hash(ax, az + s, 7) - 0.5) * 0.5, w = 0.34 + 0.2 * hash(s, ax, 8);
      if (s + l > L - 1.2) break;
      quadUp(out, P(s, t - w), P(s + l, t - w * (0.85 + 0.3 * hash(s, az, 9))), P(s + l, t + w * (0.85 + 0.3 * hash(az, s, 10))), P(s, t + w));
      s += l + 0.5 + 1.1 * hash(s, ax, 11);
    }
    // the patch before each open door, and the ones the awnings' piers leave
    for (let k = 0; k < ns; k++) {
      if (codes && (codes[k] ?? '-') === '-') continue;
      const sc = (k + 0.5) * sw, w = 0.72 + 0.16 * hash(ax + k, az, 12), t0 = D - 1.35 - 0.3 * hash(ax, az + k, 13), t1 = D - 0.2;
      quadUp(out, P(sc - w, t0), P(sc - w * 0.8, t1), P(sc + w * 0.9, t1), P(sc + w, t0 + 0.2 * hash(az + k, ax, 14)));
    }
    if (out.length) ctx.bag.add(MAT, fromTriangles(out));
  };
}
void CARDO;
