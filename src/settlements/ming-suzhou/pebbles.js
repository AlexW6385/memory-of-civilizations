// Ming Suzhou — the medallions of the pebble-mosaic courts (docs/settlements/ming-suzhou.md §13) as
// real pebbles: the disc of the medallion is laid out in cells about 8 cm across, each a low
// rounded pebble (four faces rising to a crown 1–2 cm over its neighbours' joints), its colour
// chosen by the figure it belongs to — a crane against the sun, a plum blossom, a lotus — so that
// the picture is made of pebbles and tile, not painted on a flat plate. Corners are shared between
// neighbours (jittered by a hash of the corner's own position), so the mosaic has no cracks.

import { fromTriangles } from '../../core/geom.js';
import { hash } from './corework.js';

const TAU = Math.PI * 2;
const DK = 'tile_dark', GR = 'pebbles', PL = 'plaster_grey', WH = 'plaster_white', CR = 'tile_cream', LP = 'tile_lapis', TQ = 'tile_turquoise', OC = 'paint_ochre', RD = 'lacquer_red';

const segDist = (x, z, a, b) => {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2));
  return [Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t), t];
};
/** Is (x, z) within the variable-radius capsule along the polyline pts [x, z, r]? */
const inPath = (x, z, pts) => {
  for (let i = 0; i + 1 < pts.length; i++) { const [d, t] = segDist(x, z, pts[i], pts[i + 1]); if (d <= pts[i][2] + (pts[i + 1][2] - pts[i][2]) * t) return true; }
  return false;
};
const inEllipse = (x, z, cx, cz, a, b, rot) => { const c = Math.cos(rot), s = Math.sin(rot), dx = x - cx, dz = z - cz, u = dx * c + dz * s, v = -dx * s + dz * c; return (u * u) / (a * a) + (v * v) / (b * b) <= 1; };
const inPoly = (x, z, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };

// ── the figures, in the medallion's unit frame (radius 1; x east, z south, the picture's top to the north) ──
const CRANE = {
  tail: [[-0.3, -0.06], [-0.62, -0.16], [-0.86, -0.1], [-0.84, 0.04], [-0.6, 0.1], [-0.34, 0.14]],
  wing: [[-0.28, -0.12], [0.02, -0.2], [0.26, -0.04], [0.12, 0.16], [-0.2, 0.24], [-0.5, 0.12]],
  quill: [[-0.5, 0.12], [-0.2, 0.24], [0.12, 0.16], [0.17, 0.08], [-0.15, 0.13], [-0.42, 0.03]],
  neck: [[0.3, -0.04, 0.085], [0.46, -0.2, 0.052], [0.44, -0.4, 0.045], [0.52, -0.55, 0.045], [0.57, -0.62, 0.04]],
  beak: [[0.64, -0.67, 0.024], [0.9, -0.61, 0.01]],
  legA: [[0.0, 0.16, 0.034], [0.06, 0.44, 0.024], [0.0, 0.8, 0.024]],
  legB: [[-0.1, 0.14, 0.032], [-0.2, 0.36, 0.022], [-0.04, 0.44, 0.022]],
  ground: [[-0.5, 0.84, 0.026], [-0.1, 0.8, 0.03], [0.3, 0.84, 0.026], [0.55, 0.82, 0.02]],
  clouds: [[[0.05, -0.82, 0.026], [0.3, -0.88, 0.026], [0.55, -0.82, 0.02]], [[-0.85, 0.5, 0.022], [-0.68, 0.46, 0.026], [-0.5, 0.52, 0.02]], [[0.5, 0.62, 0.02], [0.68, 0.56, 0.026], [0.85, 0.62, 0.02]]],
};
function crane(x, z, r, rd) {
  if (inPath(x, z, CRANE.beak)) return DK;
  if (Math.hypot(x - 0.575, z + 0.715) < 0.036) return RD;                              // the red crown
  if (Math.hypot(x - 0.59, z + 0.665) < 0.062) return WH;                               // the head
  if (inPath(x, z, CRANE.legA) || inPath(x, z, CRANE.legB) || inPath(x, z, CRANE.ground)) return DK;
  if (inPoly(x, z, CRANE.quill)) return DK;                                             // the wing's flight feathers
  if (inPoly(x, z, CRANE.wing)) return WH;
  if (inPoly(x, z, CRANE.tail)) return DK;
  if (inEllipse(x, z, 0.0, 0.03, 0.4, 0.17, -0.3)) return WH;                           // the body
  if (inPath(x, z, CRANE.neck)) return WH;
  if (Math.hypot(x + 0.46, z + 0.56) < 0.17) return Math.hypot(x + 0.46, z + 0.56) < 0.1 ? LP : TQ;   // the sun (blue porcelain, a turquoise rim)
  for (const c of CRANE.clouds) if (inPath(x, z, c)) return CR;
  void r; void rd;
  return null;
}
function plum(x, z) {
  let best = -1, bd = 9;
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k / 5 * TAU, d = Math.hypot(x - Math.cos(a) * 0.5, z - Math.sin(a) * 0.5); if (d < bd) { bd = d; best = k; } }
  if (Math.hypot(x, z) < 0.1) return OC;
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k + 0.5) / 5 * TAU; if (Math.hypot(x - Math.cos(a) * 0.27, z - Math.sin(a) * 0.27) < 0.035) return DK; }   // the stamens
  if (Math.hypot(x, z) < 0.19) return CR;
  if (bd < 0.42) return bd > 0.385 ? DK : (best % 2 ? CR : WH);                         // each petal outlined
  return null;
}
function lotus(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x);
  if (r < 0.14) return OC;
  if (r < 0.2) return DK;
  const petal = (phase, n, r0, r1, wd) => {
    const per = TAU / n, f = (((a - phase) % per) + per * 1.5) % per - per / 2;                  // the angle from the nearest petal's axis
    if (r < r0 || r > r1) return 0;
    const t = (r - r0) / (r1 - r0), half = wd * Math.sin(Math.PI * Math.pow(t, 0.8)) + 0.012;
    const off = Math.abs(f) * r;
    return off < half ? (off > half - 0.035 ? 1 : 2) : 0;                                      // 1 the outline, 2 the field
  };
  const s = petal(Math.PI / 8, 8, 0.2, 0.55, 0.15);
  if (s === 1) return DK; if (s === 2) return t2(x, z, CR);
  const l = petal(0, 8, 0.22, 0.95, 0.27);
  if (l === 1) return DK; if (l === 2) return r > 0.8 ? TQ : (Math.abs((((a * 8 / TAU) % 1) + 1) % 1 - 0.5) < 0.06 ? CR : WH);
  return null;
}
const t2 = (x, z, m) => (Math.hypot(x, z) > 0.4 && hash(x, z, 5) < 0.2 ? WH : m);
const FIG = { crane, plum, lotus };

/** pebble_medal { at: [x, z], y (the court's own level: the top of its flats), d (the medallion's diameter), medallion: 'crane' | 'plum' | 'lotus', seed } */
export function pebbleMedal(el, { bag }) {
  const fig = FIG[el.medallion]; if (!fig) return;
  const [cx, cz] = el.at, mr = el.d / 2, y0 = el.y + 0.034, cs = el.cell ?? 0.13, Rt = mr + 0.3;
  const n = Math.ceil(Rt / cs) + 1;
  const off = (el.seed ?? 0) * 53, hh = (i, j, k) => hash(i + off, j + off * 0.37, k);
  const jit = (i, j) => [(hh(i, j, 1) - 0.5) * cs * 0.4, (hh(i, j, 2) - 0.5) * cs * 0.4];
  const corner = (i, j) => { const [jx, jz] = jit(i, j); return [cx + (i - 0.5) * cs + jx, y0 + 0.002 * hh(i, j, 3), cz + (j - 0.5) * cs + jz]; };
  const out = {};
  const up = (m, a, b, c) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2], ny = uz * vx - ux * vz;
    (out[m] ||= []).push(...(ny >= 0 ? [...a, ...b, ...c] : [...a, ...c, ...b]));
  };
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const px = cx + i * cs, pz = cz + j * cs, r = Math.hypot(px - cx, pz - cz);
    if (r > Rt) continue;
    const u = (px - cx) / mr, v = (pz - cz) / mr, rr = r / mr;
    const rh = hh(i, j, 4);
    let m;
    if (r <= mr) {
      m = rr > 0.93 ? DK : fig(u, v, r, rr);                                                // the figure, in a ring of dark tile
      if (!m) m = rh < 0.08 ? DK : rh < 0.93 ? GR : PL;                                         // a bed of dark and grey pebbles
    } else if (r <= mr + 0.04) m = DK;
    else if (r <= mr + 0.2) m = rh < 0.25 ? CR : rh < 0.6 ? PL : WH;                         // a band of pale pebbles
    else m = DK;                                                                              // and a ring of tile on edge
    const c00 = corner(i, j), c10 = corner(i + 1, j), c11 = corner(i + 1, j + 1), c01 = corner(i, j + 1);
    const ap = [px + (hh(i, j, 6) - 0.5) * cs * 0.2, y0 + 0.006 + 0.006 * hh(i, j, 7), pz + (hh(i, j, 8) - 0.5) * cs * 0.2];
    up(m, c00, c10, ap); up(m, c10, c11, ap); up(m, c11, c01, ap); up(m, c01, c00, ap);
  }
  for (const [m, t] of Object.entries(out)) bag.add(m, fromTriangles(t));
}

/** The style's pebble_paving with the medallion laid in real pebbles: the court's field and borders as before, the medallion by pebbleMedal. */
export const pebbleCourt = (base) => (el, ctx) => { base({ ...el, medallion: null }, ctx); if (el.medallion) pebbleMedal(el, ctx); };
