// The dragon columns of the Dacheng Hall as sculpture (docs/settlements/lu-qufu.md §13): each of the ten front columns of carved stone has two
// dragons coiling up and down the shaft in deep relief among clouds chasing a flaming pearl, over a base of waves and mountains. The relief is
// modelled flat, in the plane of the unrolled shaft (the Beijing kit of src/settlements/qing-beijing/sculpt.js and dragonrelief.js, read-only:
// the dragon's body with ridge and legs, the head with brow, horns, jaws, the clouds, the waves), then bent round the shaft: x → the angle, y
// stays, z → the radius. Two levels: 'R' (reduced, always drawn: the dragons without scales and the finest hair) and 'F' (the fine layer
// over it, drawn near: scales, teeth, more clouds and waves, the lotus petals of the drum). Each column differs by a hash of its own position
// (the dragons' pitch, phase, undulation, the clouds' places), never by a counter: the same plan builds the same geometry.
import { box, lathe } from '../../core/geom.js';
import { Parts, merge } from '../qing/carving.js';
import { dragonRelief } from '../../settlements/qing-beijing/dragonrelief.js';
import { cloudScroll, waveCurl, spline, ell, ring, reliefLine, h01, triCount } from '../../settlements/qing-beijing/sculpt.js';

export const COL_R = 0.4;
/** The shaft's radius at height y (a plain taper from 0.4 at the foot of the shaft to 0.375 under the neck). */
export const shaftR = (y, h) => COL_R - 0.025 * Math.min(1, Math.max(0, (y - 0.62) / (h - 1.1)));

/** Bend a geometry built in the plane of the unrolled shaft (x arc length, y height, z out of the stone) round the shaft, in place. */
function bend(g, th0, h, dr = 0) {
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    const s = p.getX(i), y = p.getY(i), z = p.getZ(i) + dr, th = th0 + s / COL_R, st = Math.sin(th), ct = Math.cos(th), r = shaftR(y, h) + z;
    p.setXYZ(i, r * st, y, r * ct);
    if (n) { const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i); n.setXYZ(i, nx * ct + nz * st, ny, -nx * st + nz * ct); }
  }
  p.needsUpdate = true; if (n) n.needsUpdate = true;
  return g;
}

/** The control points of one dragon's body, head first, on the unrolled shaft: a helix of `slope` metres of arc a metre of height, undulating. */
function bodyPath(yHead, yTail, s0, slope, amp, lam, ph) {
  const up = yTail < yHead, y1 = up ? yTail : yTail, ctl = [];
  const N = 14, d = Math.abs(yHead - y1);
  for (let k = 0; k <= N; k++) {
    const t = k / N, y = yHead + (yTail - yHead) * t, dy = y - yHead;
    // the neck rises steeper into the head (the head is carried up or down, not sideways), the undulation grows from the neck to the tail
    const nk = Math.min(1, t * 6), u = Math.sin(ph + (Math.abs(dy) / lam) * Math.PI * 2) * amp * nk;
    ctl.push([s0 + slope * dy * (0.4 + 0.6 * nk) + u, y]);
  }
  void d;
  return ctl;
}

/**
 * One column's relief parts in the plane of the shaft, by `level` ('R' | 'F'). Returns { m: Map(mat → geometries) } built unbent, in `Parts`.
 * (x, z): the column's place, the seed of its hash; h the shaft's height.
 */
function reliefParts(x, z, h, level) {
  const P = new Parts(), F = level === 'F', C = 2 * Math.PI * COL_R;
  const H = (k) => h01(x * 0.371 + k * 1.913, z * 0.173 + k * 0.617 + 3.1);
  const hand = H(0) < 0.5 ? 1 : -1, amp = 0.17 + 0.1 * H(2), lam = 1.5 + 0.5 * H(3), ph = H(4) * 6.28, sOff = (H(5) - 0.5) * 0.3;
  const th0 = (H(6) - 0.5) * 0.3;                                   // the whole column turned a little: the dragons' heads face the court within ±15°
  const yA = h * 0.8 + 0.5 * (H(7) - 0.5), yAt = 1.35 + 0.2 * H(8), yB = h * 0.3 + 0.4 * (H(9) - 0.5), yBt = h - 0.75 - 0.2 * H(10);
  // the pitch is chosen so that the two helices, a turn and a half apart over the height between the heads, lie half a turn apart and the two heads
  // both come to the front of the shaft
  const slope = 1.5 * C / (yA - yB);
  // the two dragons wound on the same hand, half a turn apart: the one going up, its head raised to the pearl; the one coming down
  const dragons = [
    { ctl: bodyPath(yA, yAt, hand * 0.0 + sOff, hand * slope, amp, lam, ph), w: 0.125, hh: 0.065, flip: hand, pearl: true },
    { ctl: bodyPath(yB, yBt, sOff + 0.1, hand * slope, amp, lam, ph + 1.7), w: 0.12, hh: 0.063, flip: hand, pearl: true },
  ];
  const road = [];                                                   // where the dragons lie (s mod C, y), that the clouds keep off
  const keep = (s, y, r) => road.some(([a, b]) => { let d = Math.abs(((s - a) % C + C) % C); d = Math.min(d, C - d); return Math.hypot(d, y - b) < r; });
  const m = P;
  for (const [i, D] of dragons.entries()) {
    const path = spline(D.ctl, 6);
    const f = [path[0][0] - path[3][0], path[0][1] - path[3][1]], fl = Math.hypot(...f) || 1;
    const pa = [path[0][0] + f[0] / fl * 0.62, path[0][1] + f[1] / fl * 0.62];
    for (const q of path) road.push(q);
    const R = dragonRelief(path, D.w, D.hh, { fine: F, flip: D.flip, pearlAt: F ? null : pa, seed: i + hand, lite: !F, step: F ? 0.04 : 0.16 });
    for (const g of R.out) m.add('granite_grey', g);
    if (!F) for (const g of R.gilt) m.add('clay_gilt', g);
    D.pa = pa;
  }
  // the clouds among the coils: a jittered grid, those clear of the dragons kept
  const cw = F ? 0.4 : 0.55, step = F ? 0.62 : 1.4;
  for (let y = 1.7; y < h - 0.9; y += step) for (let s = 0; s < C; s += step * 0.95) {
    const jx = (H(20 + Math.floor(y * 3) + Math.floor(s * 7)) - 0.5) * 0.3, jy = (H(40 + Math.floor(y * 5) + Math.floor(s * 11)) - 0.5) * 0.3, sx = s + jx + (Math.floor(y / step) % 2) * step * 0.45, sy = y + jy;
    if (keep(sx, sy, 0.3)) continue;
    const fl = (Math.floor(y / step) + Math.floor(s / step)) % 2 ? 1 : -1;
    for (const g of cloudScroll(sx, sy, cw * (0.85 + 0.3 * H(60 + Math.floor(s * 9) + Math.floor(y * 4))), 0.034, fl)) m.add('granite_grey', g);
  }
  // the flaming pearls: the gilt pearl of each dragon is already in R; in F the clouds also gather round it (done by the grid above)
  // the base: two rows of breaking waves and three stepped mountains rising out of them, over the lotus drum
  const nw = Math.round(C / 0.5);
  for (let row = 0; row < (F ? 2 : 1); row++) for (let i = 0; i < nw; i++) {
    const s = (i + 0.5 + row * 0.5) * C / nw;
    for (const g of waveCurl(s, 0.58 + row * 0.26, 0.5, 0.035 + 0.008 * row, (i + row) % 2 ? 1 : -1)) m.add('granite_grey', g);
  }
  for (let k = 0; k < 3; k++) {
    const s = (k + 0.5 + 0.2 * (H(70) - 0.5)) * C / 3, hg = 0.62 + 0.12 * H(71 + k), wd = 0.26 + 0.05 * H(74 + k);
    const prof = [[wd, 0], [wd * 0.8, hg * 0.3], [wd * 0.64, hg * 0.42], [wd * 0.46, hg * 0.7], [wd * 0.3, hg * 0.78], [0.001, hg]];
    const g = lathe(prof, 8); g.scale(1, 1, 0.09); g.translate(s, 0.86, 0);
    m.add('granite_grey', g);
  }
  return P;
}

/**
 * The shaft, plinth and neck of a column at the origin (feet at y = 0), the dragons and base in relief when `level` is given. 'R' also carries the
 * shaft (28 sides, so that the relief stands on a round stone), the plinth, the lotus drum and the banded neck; 'F' only the fine layer.
 */
export function columnParts(x, z, h, level) {
  const P = new Parts();
  if (level === 'R') {
    const prof = [[0.52, 0.34], [0.5, 0.5], [0.44, 0.56], [COL_R, 0.62]];
    for (let i = 1; i <= 10; i++) { const y = 0.62 + (h - 1.1) * i / 10; prof.push([shaftR(y, h), y]); }
    prof.push([0.42, h - 0.46], [0.46, h - 0.4], [0.46, h - 0.26], [0.42, h - 0.2], [0.41, h - 0.1], [0.001, h - 0.1]);
    P.add('granite_grey', lathe(prof, 28));
    P.add('marble', box(-0.68, 0, -0.68, 0.68, 0.22, 0.68));
    P.add('marble', lathe([[0.001, 0.22], [0.6, 0.22], [0.6, 0.3], [0.56, 0.34], [0.001, 0.34]], 20));
  }
  const rel = reliefParts(x, z, h, level);
  for (const [mat, list] of rel.m) for (const g of list) {
    const k = h01(x * 0.371 + 0.5, z * 0.173 + 3.7);
    P.add(mat, bend(g, (k - 0.5) * 0.5, h));
  }
  if (level === 'F') {
    // the petals of the lotus drum: each an ellipsoid standing on the drum's rim, leaning out
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + 0.1 * h01(x + i, z), c = [Math.sin(a) * 0.585, 0.285, Math.cos(a) * 0.585];
      const out = [Math.sin(a), 0, Math.cos(a)], tg = [Math.cos(a), 0, -Math.sin(a)];
      P.add('marble', ell(c, [0.075, 0.05, 0.018 + 0.004 * h01(i, x)], [tg, [0, 1, 0], out], 7, 4));
    }
    // two bands of beads on the neck's mouldings
    for (const y of [h - 0.4, h - 0.26]) P.add('granite_grey', ring([0, y, 0], 0.465, 0.014, [0, 1, 0], 40, 4));
    void reliefLine;
  }
  return P;
}

export function placeColumn(bag, x, z, y, h, level) {
  const P = columnParts(x, z, h, level);
  P.emit(bag, x, y, z, 0);
}
export { merge, triCount };
