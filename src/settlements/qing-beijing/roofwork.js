// The ridges of the Hall of Supreme Harmony's double roof (docs/settlements/qing-beijing.md §36): the main ridge (zhengji) as a
// raised band with a capping roll, the descending hip ridges (chuiji) of both eaves as raised bands with a cap and a row of
// round tile ends (ridge-tile "buttons"), laid on the roof the style's qing_hall builds (its formulas, caihua.js's bracket
// height included). Element of style `qing`, registered here.
import { STYLES } from '../../core/build.js';
import { fromTriangles } from '../../core/geom.js';
import { beamTris } from '../../styles/ming/index.js';
import { dougongHeight } from '../../styles/qing/caihua.js';
import { Parts } from '../../styles/qing/carving.js';
import { chiwen, beast, figureKind } from './roofbeasts.js';

/** The height of a hip roof's surface at (x, z), as src/styles/qing/carving.js roofFrame computes it. */
const hipH = (r, x, z) => {
  const ax = Math.abs(x - r.cx), az = Math.abs(z - r.cz), ts = Math.max(0, Math.min(1, (r.B - az) / r.B)), te = Math.max(0, (r.A - ax) / r.B);
  const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
  return r.y + r.rise * Math.pow(t, r.p) + r.sweep * corner * corner;
};

/** Raised bands along the hip ridges and the main ridge of roof r (alongZ false: ridge along x); tMax: how far up the hips. */
function ridges(bag, r, { tMax = 1, main = true, hipW = 0.2, hipH0 = 0.28, mainW = 0.4, mainH0 = 0.8, mat = 'tile_yellow' } = {}) {
  const t = [], cap = [], steps = 14, L = r.A - r.B;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const P = (tt) => { const x = r.cx + sx * (r.A - tt * r.B), z = r.cz + sz * (r.B - tt * r.B); return [x, hipH(r, x, z) - 0.04, z]; };
    for (let k = 0; k < steps; k++) {
      const a = P(tMax * k / steps), b = P(tMax * (k + 1) / steps);
      beamTris(t, a, b, hipW, hipH0, true);
      beamTris(cap, [a[0], a[1] + hipH0, a[2]], [b[0], b[1] + hipH0, b[2]], hipW * 1.3, 0.1, true);
    }
  }
  if (main && L > 2) {
    const y = r.y + r.rise - 0.05, x0 = r.cx - L - 0.1, x1 = r.cx + L + 0.1, n = Math.max(2, Math.round((x1 - x0) / 2.5));
    for (let k = 0; k < n; k++) {
      const a = x0 + (x1 - x0) * k / n, b = x0 + (x1 - x0) * (k + 1) / n;
      beamTris(t, [a, y, r.cz], [b, y, r.cz], mainW, mainH0, true);
      beamTris(cap, [a, y + mainH0, r.cz], [b, y + mainH0, r.cz], mainW * 1.25, 0.16, true);
    }
  }
  bag.add(mat, fromTriangles(t)); bag.add(mat, fromTriangles(cap));
}

/** The beasts along the four hips of roof r as the style lays them out (the immortal, ten beasts, the hanging beast), and the chiwen at the ridge's ends. */
function hipFigures(bag, r, { tLimit = 1, reach = 0.6, n = 12, mat = 'tile_yellow' } = {}) {
  const sc = Math.round(Math.max(0.22, Math.min(0.45, r.B * 0.03)) / 0.05) * 0.05, gap = sc * 1.25;
  for (const s of [-1, 1]) for (const sz of [-1, 1]) {
    const at = (tt) => { const x = r.cx + s * (r.A - tt * r.B), z = r.cz + sz * (r.B - tt * r.B); return [x, hipH(r, x, z) + 0.2, z]; };
    const lim = tLimit * reach, yaw = Math.atan2(s, sz);
    let prev = at(0), dist = 0, next = gap * 0.7, i = 0;
    for (let k = 1; k <= 400 && i < n; k++) {
      const q = at(lim * k / 400); dist += Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]); prev = q;
      if (dist >= next) {
        const P = new Parts(), kind = figureKind(i);
        beast((g) => P.add(mat, g), kind);
        P.emit(bag, q[0], q[1] - 0.03, q[2], yaw, sc * (i === n - 1 ? 1.5 : 1)); i++; next += i === n - 1 ? gap * 1.4 : gap;
      }
    }
  }
}
function ridgeEnds(bag, r, fine, mat = 'tile_yellow') {
  const h = Math.max(0.8, Math.min(3.4, r.B * 0.24)), L = r.A - r.B, xg = L + 0.3, top = r.y + r.rise;
  for (const s of [-1, 1]) { const P = new Parts(); chiwen((g) => P.add(mat, g), h, fine); P.emit(bag, r.cx + s * (xg - 0.4 * h), top + 0.3, r.cz, s > 0 ? 0 : Math.PI); }
}
export { hipFigures, ridgeEnds };

/**
 * bj_ridges: for a double-eaved hip-roofed hall as qing_hall lays it out { rect, y, H, double, eave, sweep, bays: [n, d], orn } (the
 * long side along x): the ridges of the lower skirt and of the upper roof.
 */
function bjRidges(el, { bag }) {
  const fineOnly = !!el.fine;
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H, D = el.double, o = el.eave ?? 1.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const inset = el.inset ?? Math.min(x1 - x0, z1 - z0) / ((el.bays?.[1] ?? 4) + 0.5);
  const bk = dougongHeight({ tiers: el.dougong?.tiers ?? (H > 8 ? 3 : 2), pitch: el.dougong?.pitch ?? 1.0 });
  const A = (x1 - x0) / 2 + o, B = (z1 - z0) / 2 + o;
  const skirt = { cx, cz, A, B, y: y + H - 0.25 + bk, rise: (inset + o) * 0.55, p: 1.25, sweep: el.sweep ?? 0.5 };
  if (!fineOnly) ridges(bag, skirt, { tMax: (inset + o) / B * 0.97, main: false, hipW: 0.17, hipH0: 0.22 });
  const yb = y + H + bk, A2 = (x1 - x0 - 2 * inset) / 2 + o * 1.1, B2 = (z1 - z0 - 2 * inset) / 2 + o * 1.1;
  const upper = { cx, cz, A: A2, B: B2, y: yb + D - 0.25 + bk, rise: B2 * 0.78, p: 1.7, sweep: el.sweep ?? 0.6 };
  if (!fineOnly) ridges(bag, upper, { tMax: 0.9, main: true, hipW: 0.24, hipH0: 0.34, mainW: 0.42, mainH0: 0.85 });
  if (el.fine) { ridgeEnds(bag, upper, true); return; }
  ridgeEnds(bag, upper, false);
  hipFigures(bag, upper, {});
  hipFigures(bag, skirt, { tLimit: (inset + o) / B, reach: 0.75 });
}

STYLES.qing.elements.bj_ridges = bjRidges;
