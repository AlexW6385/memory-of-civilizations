// New York by night, 1931 (docs/settlements/new-york.md §12): the electric light of the street — lit windows of the offices and lofts,
// the shop windows with their pools on the pavement, the street lamps — as geometry of the engine's `halo` material (light added over
// what is behind it, at night only, no light, no shadow, no collision), as Ming Suzhou's lanterns are (ming-suzhou/nightlight.js).
// Pure functions of the lots' places and of hashes: no counters, no Math.random.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { registerStyle, STYLES } from '../../core/build.js';
import '../../styles/artdeco/index.js';
import { lots, toCity, GRID } from './layout.js';
import { nearEntrance } from '../../styles/artdeco/dress.js';

const TAU = Math.PI * 2;
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The windows' grid of the engine's `facade` material (palette.js): bay, storey, window width and height as fractions. */
export const FACADE = { facade_limestone: [1.6, 3.7], facade_buff: [1.5, 3.4], facade_brick: [1.5, 3.3], facade_grey: [1.7, 3.8] };
const WU = 0.5, WV = 0.6;

class Halo {
  constructor() { this.pos = []; this.nor = []; this.n = 0; }
  tri(a, na, b, nb, c, nc) { this.pos.push(...a, ...b, ...c); this.nor.push(...na, ...nb, ...nc); }
  /** A sheet a b c d of brightness f facing n = [x, z] (both faces seen). */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); this.n++; }
  disc(c, U, V, su, sv, nh, segs, F, R, sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < R.length - 1; r++) { this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1)); this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1)); }
    }
    this.n++;
  }
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) { const s = Math.sin(yaw), c = Math.cos(yaw); this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]); }
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  geometry() { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3)); return g; }
}

/** The lit windows and shop windows of one lot, in the grid's frame turned into the city's (the facade shader reads the city's x or z). */
function lotLight(H, l, share) {
  const [x0, z0, x1, z1] = l.rect, spec = FACADE[l.mat], y = l.y;
  const faces = [];
  if (l.front === 'n') faces.push(['n', [x0, z0], [x1, z0], [0, -1]]); else faces.push(['s', [x0, z1], [x1, z1], [0, 1]]);
  if (l.shops.includes('w')) faces.push(['w', [x0, z0], [x0, z1], [-1, 0]]);
  if (l.shops.includes('e')) faces.push(['e', [x1, z0], [x1, z1], [1, 0]]);
  const top = y + Math.min(l.h, 70) - 1.8;
  for (const [f, A, B, nG] of faces) {
    const a = toCity(...A), b = toCity(...B), n = toCity(...nG).map((v, i) => v - toCity(0, 0)[i]);
    const alongX = Math.abs(n[1]) > Math.abs(n[0]), ua = alongX ? a[0] : a[1], ub = alongX ? b[0] : b[1], du = ub - ua;
    if (Math.abs(du) < 1) continue;
    const P = (u, yy, d) => { const t = (u - ua) / du; return [a[0] + (b[0] - a[0]) * t + n[0] * d, yy, a[1] + (b[1] - a[1]) * t + n[1] * d]; };
    // the shop windows: a bright sheet in front of the plate glass of each shop (about six metres of front each) and its pool on the pavement
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ns = Math.max(1, Math.floor(L / 6));
    for (let i = 0; i < ns; i++) {
      const s0 = (i + 0.1) / ns, s1 = (i + 0.9) / ns, k = 0.45 + 0.4 * hashAt(A[0] + i * 7, A[1] + i, 31);
      if (hashAt(A[0] + i * 7, A[1] + i, 33) > 0.8) continue;
      const pa = [a[0] + (b[0] - a[0]) * s0, a[1] + (b[1] - a[1]) * s0], pb = [a[0] + (b[0] - a[0]) * s1, a[1] + (b[1] - a[1]) * s1], d = 0.3;
      const Q = (p, yy) => [p[0] + n[0] * d, yy, p[1] + n[1] * d];
      // (a shop with its room built shows the room through its glass: only a lit band under the fascia, over the room's tin ceiling)
      H.quad(Q(pa, l.room && f === l.front ? y + 2.7 : y + 0.95), Q(pb, l.room && f === l.front ? y + 2.7 : y + 0.95), Q(pb, y + 3.1), Q(pa, y + 3.1), n, k);
      const pm = [(pa[0] + pb[0]) / 2 + n[0] * 1.8, (pa[1] + pb[1]) / 2 + n[1] * 1.8];
      H.floor(pm[0], y + 0.08, pm[1], Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * 0.55, 1.9, Math.atan2(n[0], n[1]) + Math.PI / 2 * 0, 8, 0.7 * k);
    }
    // the offices' and lofts' windows above: the facade shader's grid (windows 0.5 bay wide, 0.6 storey high, centred 0.55 up), a share of them lit
    if (!spec) continue;
    const [bay, st] = spec, hw = WU * bay / 2, hh = WV * st / 2, lo = Math.min(ua, ub), hi = Math.max(ua, ub);
    for (let kk = Math.ceil(lo / bay - 0.5); (kk + 0.5) * bay < hi; kk++) {
      const uc = (kk + 0.5) * bay; if (uc - hw < lo + 0.3 || uc + hw > hi - 0.3) continue;
      for (let j = Math.ceil((y + 4.6) / st - 0.55); (j + 0.55) * st + hh < top; j++) {
        if (hashAt(uc, (j + 0.55) * st, 41 + (alongX ? 0 : 1)) > share) continue;
        const vc = (j + 0.55) * st, f = 0.38 + 0.4 * hashAt(uc, vc, 43);
        H.quad(P(uc - hw, vc - hh, 0.04), P(uc + hw, vc - hh, 0.04), P(uc + hw, vc + hh, 0.04), P(uc - hw, vc + hh, 0.04), n, f);
      }
    }
  }
}
/** The street lamps (grid frame [x, z] of life elements `street_lamp`, 5.5 m): the glow of the globe and the pool under it. */
function lampLight(H, lamps) { for (const [x, z, y, h] of lamps) { const [cx, cz] = toCity(x, z); H.ball(cx, y + h - 0.35, cz, 1.25); H.floor(cx, y + 0.06, cz, 4.2, 4.2, 0, 10, 0.8); } }

/** ny_night: { lots: [...], lamps: [[x, z, y, h]] } in the grid's frame (inside `turned`: positions here are the city's, so the element is built beside it). */
function nyNight(el, { bag }) {
  const H = new Halo();
  for (const l of el.lots) lotLight(H, l, el.share ?? 0.15);
  lampLight(H, el.lamps ?? []);
  if (H.pos.length) bag.add('halo', H.geometry());
}
registerStyle('ny_night', { trim: () => {}, opening: () => {}, column: () => {}, elements: { ny_night: nyNight }, objects: {} });
/** The night plan: within `reach` m of the arrival (the budget), all in the city's frame. */
export function nightPlan(lamps, base) {
  const near = lots().filter((l) => nearEntrance((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 160));
  return { ...base('new-york-night', []), style: 'ny_night', elements: [{ t: 'ny_night', lots: near, lamps: lamps.filter(([x, z]) => nearEntrance(x, z, 160)) }] };
}
void STYLES; void GRID;
