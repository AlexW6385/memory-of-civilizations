// The hexi painting of the Hall of Supreme Harmony's beams as real relief (docs/settlements/qing-beijing.md §37): on the panel of each bay the
// gilt dragon among its flames, rising 2 cm off the blue-green ground, the pearl before its head, the coiled dragon in each roundel of the
// zhaotou, and the gilt mouldings of the panel and the "M" lines raised as ribs. Laid over the painted films that caihua.js lays on the
// architraves (the ground, the fields and the flat gilt are there; this stands off them by 1.7 cm). Drawn only near (a plan of its own).
// Element of style `qing`: bj_hexi_relief { rect, y, H, bays, double, four, front, inset }, in the layout paintBeams (the style's) uses.
import { STYLES } from '../../core/build.js';
import { Parts, merge } from '../../styles/qing/carving.js';
import { Matrix4, Vector3 } from '../../core/three.js';
import { dragonRelief } from './dragonrelief.js';
import { reliefLine, spline, tube, ell, pearl } from './sculpt.js';

const G = 'gilt_bronze';
/** The gilt relief of one bay (L long, h high) in its own frame: x along the beam, y up, z out of the face. */
function bayRelief(P, L, h, dir) {
  const m = L / 2, half = L / 6, p = Math.min(half * 0.6, h * 0.35), v0 = h * 0.14, v1 = h * 0.86, hc = h / 2, add = (g) => P.add(G, g);
  const z = 0.0;
  // the panel's moulding and the M lines, as ribs
  const fx = [[m - half, v0], [m + half, v0], [m + half + p, hc], [m + half, v1], [m - half, v1], [m - half - p, hc], [m - half, v0]];
  add(reliefLine(fx, 0.011, 0.011, 0.012, { n: 5, z0: z }));
  for (const s of [-1, 1]) for (const k of [1, 2]) {
    const tip = m + s * (half + p + k * 0.11 * Math.max(1, h / 0.5)), back = tip - s * (p + 0.04);
    add(reliefLine([[back, h - 0.03], [tip, hc], [back, 0.03]], 0.009, 0.009, 0.01, { n: 4, z0: z }));
  }
  // the dragon of the panel, striding toward the pearl
  const fu0 = m - half - p * 0.4, fu1 = m + half + p * 0.4, fh = v1 - v0, w = Math.min(0.03, fh * 0.1);
  const ctl = [[0.04, 0.0], [0.2, 0.3], [0.38, -0.25], [0.55, 0.25], [0.72, -0.2], [0.9, 0.1]].map(([u, v]) => (dir > 0 ? [fu0 + (fu1 - fu0) * (0.12 + u * 0.8), hc + v * fh * 0.3] : [fu1 - (fu1 - fu0) * (0.12 + u * 0.8), hc + v * fh * 0.3]));
  const D = dragonRelief(spline(ctl, 6), w, 0.016, { lite: true, flip: dir, step: 0.03, pearlAt: [dir > 0 ? fu0 + (fu1 - fu0) * 0.03 : fu1 - (fu1 - fu0) * 0.03, hc + fh * 0.03], seed: dir });
  for (const g of D.out) add(g);
  for (const g of D.gilt) add(g);
  // the roundels of the zhaotou: a coiled dragon in each
  const gb = Math.min(0.3, Math.max(0.1, L * 0.055));
  for (const s of [-1, 1]) {
    const inner = m + s * (half + p + 0.22 * Math.max(1, h / 0.5) + 0.06), outer = s < 0 ? gb : L - gb, span = Math.abs(inner - outer);
    if (span < h * 0.75) continue;
    const cu = (inner + outer) / 2, r = Math.min(span * 0.4, h * 0.36);
    const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = t * Math.PI * 3.2 + (s > 0 ? 0 : Math.PI), rr = r * 0.8 * (0.9 - 0.75 * t); pts.push([cu + Math.cos(a) * rr, hc + Math.sin(a) * rr]); }
    const C = dragonRelief(spline(pts.reverse(), 3), r * 0.1, 0.012, { lite: true, flip: s, step: 0.022, seed: s });
    for (const g of C.out) add(g);
    add(reliefLine((() => { const q = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2; q.push([cu + Math.cos(a) * r * 1.12, hc + Math.sin(a) * r * 1.12]); } return q; })(), 0.008, 0.008, 0.008, { n: 4, z0: z }));
  }
}
const cache = new Map();
function bayParts(L, h, dir) {
  const k = `${L.toFixed(2)}|${h.toFixed(2)}|${dir}`;
  if (!cache.has(k)) { const P = new Parts(); bayRelief(P, L, h, dir); cache.set(k, P); }
  return cache.get(k);
}

function hexiRelief(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H, along = (x1 - x0) >= (z1 - z0), Lx = x1 - x0, Lz = z1 - z0;
  const nb = el.bays?.[0] ?? 7, nd = el.bays?.[1] ?? 4, nx = along ? nb : nd, nz = along ? nd : nb;
  const xs = Array.from({ length: nx + 1 }, (_, i) => Lx * i / nx), zs = Array.from({ length: nz + 1 }, (_, j) => Lz * j / nz);
  const d = H > 6 ? 0.28 + (H - 6) * 0.07 : 0.28, tall = H > 8, hd = Math.min(H - 0.5, 5.5 + (H - 8) * 0.15);
  const rev = (tk, L) => tk.map((v) => L - v).reverse();
  const sides = [['s', [x1, z1], [x0, z1], rev(xs, Lx), [0, 0, 1]], ['n', [x0, z0], [x1, z0], xs, [0, 0, -1]], ['e', [x1, z0], [x1, z1], zs, [1, 0, 0]], ['w', [x0, z1], [x0, z0], rev(zs, Lz), [-1, 0, 0]]];
  const runs = (a, b, ticks, n, yy, h, off, first, rr) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), t = [(b[0] - a[0]) / L, 0, (b[1] - a[1]) / L], cut = rr > off ? Math.sqrt(rr * rr - off * off) : 0;
    // a right-handed frame (t', up, n): the run's direction turned about if it is not
    const up = [0, 1, 0], cr = [t[1] * 0 - t[2] * 1, t[2] * 0 - t[0] * 0, t[0] * 1 - t[1] * 0];       // t × up
    const flip = (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2]) < 0;
    for (let i = 0; i + 1 < ticks.length; i++) {
      const u0 = ticks[i] + cut + 0.01, u1 = ticks[i + 1] - cut - 0.01, Lb = u1 - u0;
      if (Lb < 0.9 || h < 0.25) continue;
      const tt = flip ? [-t[0], 0, -t[2]] : t, uo = flip ? u1 : u0, dir = i < (ticks.length - 1) / 2 ? 1 : -1;
      const o = [a[0] + t[0] * uo + n[0] * (off + 0.017), yy, a[1] + t[2] * uo + n[2] * (off + 0.017)];
      const B = bayParts(Lb, h, flip ? -dir : dir), M = new Matrix4().makeBasis(new Vector3(...tt), new Vector3(0, 1, 0), new Vector3(...n)).setPosition(o[0], o[1], o[2]);
      for (const [mat, list] of B.m) bag.add(mat, merge(list).applyMatrix4(M));
    }
  };
  for (const [k, a, b, tk, n] of sides) {
    if (!(k === 's' || el.all)) continue;
    runs(a, b, tk, n, y + H - 0.55, 0.38, 0.14, k === 's' || k === 'e', d / 2);
    if (tall && (el.four || k === (el.front || 's'))) runs(a, b, tk, n, y + hd, 0.45, 0.17, !(k === 's' || k === 'e'), d / 2);
  }
}
STYLES.qing.elements.bj_hexi_relief = hexiRelief;
void tube; void ell; void pearl;
