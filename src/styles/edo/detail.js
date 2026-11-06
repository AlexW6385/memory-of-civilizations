// Details of the castle (docs/settlements/edo-himeji.md §4): the barred windows of the keep and
// turrets, the shachi on the ridges, the cusped kara-hafu gable, the loopholes (sama) of the walls.

import { fromTriangles, box, lathe } from '../../core/geom.js';
import { tri, quad4, tube, plate, holePanel } from '../japanese/shape.js';

const PL = 'plaster_castle', TL = 'tile_grey', DARK = 'lacquer_black';

/**
 * Windows in a row along a wall face from a to b (outward normal on the left): each a dark opening
 * with a plastered frame standing proud of the wall and thick plastered vertical bars (the castle's
 * renji windows), n of them, w wide and h tall from y.
 */
export function barredWindows(bag, a, b, y, h, n, w) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const dark = [], pl = [];
  // an axis-aligned box from along-wall s0..s1, out o0..o1, height y0..y1 (faces are axis-aligned)
  const bx = (s0, s1, o0, o1, y0, y1, c, out) => {
    const p = [c[0] + ux * s0 + nx * o0, c[1] + uz * s0 + nz * o0], q = [c[0] + ux * s1 + nx * o1, c[1] + uz * s1 + nz * o1];
    out.push(box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1])));
  };
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) * L / n, c = [a[0] + ux * s, a[1] + uz * s], hw = w / 2;
    bx(-hw, hw, -0.02, 0.05, y, y + h, c, dark);
    // the frame: sill, head, jambs, standing 0.12 out of the wall
    bx(-hw - 0.12, hw + 0.12, -0.02, 0.14, y - 0.12, y, c, pl);
    bx(-hw - 0.12, hw + 0.12, -0.02, 0.12, y + h, y + h + 0.1, c, pl);
    for (const sd of [-1, 1]) bx(sd > 0 ? hw : -hw - 0.1, sd > 0 ? hw + 0.1 : -hw, -0.02, 0.12, y, y + h, c, pl);
    // the bars, square, about 0.12 m apart
    const nb = Math.max(3, Math.round(w / 0.17));
    for (let k = 1; k < nb; k++) { const sb = -hw + k * w / nb; bx(sb - 0.035, sb + 0.035, 0.04, 0.11, y, y + h, c, pl); }
  }
  for (const g of dark) bag.add(DARK, g);
  for (const g of pl) bag.add(PL, g);
}

/**
 * shachi: a fish of tile with a tiger's head standing on its head at the end of a ridge, its body
 * arched up and its tail flung forward over it, facing along the ridge toward its partner
 * { at [x, z], y (ridge top), dir (toward the ridge's centre), h (height) }.
 */
export function shachi(bag, at, y, dir, h = 1.9, mat = 'tile_dark') {
  const s = h / 1.9, o = [at[0], y, at[1]], d = dir, side = [-d[1], d[0]], out = [];
  const pts = [[0.42, 0.34], [0.3, 0.36], [0.14, 0.42], [0.0, 0.56], [-0.1, 0.78], [-0.13, 1.02], [-0.08, 1.25], [0.03, 1.42], [0.15, 1.52]].map(([u, v]) => [u * s, v * s]);
  const rad = [[0.1, 0.08], [0.19, 0.17], [0.22, 0.21], [0.21, 0.21], [0.19, 0.19], [0.16, 0.16], [0.12, 0.12], [0.08, 0.08], [0.05, 0.05]].map(([a, b]) => [a * s, b * s]);
  tube(out, o, d, pts, rad, 10);
  // the jaw below the snout, open
  tube(out, o, d, [[0.38 * s, 0.22 * s], [0.25 * s, 0.24 * s], [0.12 * s, 0.32 * s]], [[0.06 * s, 0.03 * s], [0.13 * s, 0.06 * s], [0.16 * s, 0.1 * s]], 8);
  const P = (u, v, w = 0) => [o[0] + d[0] * u * s + side[0] * w * s, o[1] + v * s, o[2] + d[1] * u * s + side[1] * w * s];
  const nside = [side[0], 0, side[1]];
  // the tail fin, two lobes flung forward, and the dorsal spines along the back (both in the plane)
  plate(out, [P(0.12, 1.5), P(0.5, 1.95), P(0.42, 1.68), P(0.3, 1.58)], nside, 0.05 * s);
  plate(out, [P(0.12, 1.5), P(0.2, 1.9), P(0.3, 1.72), P(0.26, 1.58)], nside, 0.05 * s);
  for (let k = 0; k < 6; k++) {
    const i = 2 + k * 0.9, a = pts[Math.floor(i)], b = pts[Math.min(pts.length - 1, Math.floor(i) + 1)], f = i - Math.floor(i);
    const u = (a[0] + (b[0] - a[0]) * f) / s, v = (a[1] + (b[1] - a[1]) * f) / s, r = 0.18;
    plate(out, [P(u - r * 0.9, v - 0.06), P(u - r - 0.17, v + 0.05), P(u - r * 0.8, v + 0.1)], nside, 0.035 * s);
  }
  // the pectoral fins out to the sides, the brows and eyes on the head, the whiskers
  for (const w of [-1, 1]) {
    plate(out, [P(0.02, 0.62, w * 0.18), P(-0.15, 0.95, w * 0.42), P(-0.02, 0.92, w * 0.38), P(0.1, 0.66, w * 0.2)], [d[0], 0, d[1]], 0.04 * s);
    const e = P(0.3, 0.48, w * 0.14);
    out.push(...ballTris(e, 0.045 * s));
    plate(out, [P(0.34, 0.32, w * 0.08), P(0.62, 0.42, w * 0.2), P(0.36, 0.36, w * 0.09)], [0, 1, 0], 0.02 * s);
  }
  bag.add(mat, fromTriangles(out));
}
function ballTris(c, r) {
  const g = lathe([[0.001, -r], [r * 0.7, -r * 0.7], [r, 0], [r * 0.7, r * 0.7], [0.001, r]], 8, null, c[0], c[1], c[2]);
  const p = g.getAttribute('position').array;
  return Array.from(p);
}

/**
 * kara-hafu: the cusped gable — a bow of roof rising in the middle and turning up at its ends —
 * standing on a lower roof against the wall of the storey above { c (the foot of that wall, its
 * middle, [x, z]), n (outward unit), W (width), D (reach out from the wall), yb (the bow's foot at
 * the front), H (its crown above that), roofAt (dd → the lower roof's height at dd from the wall) }.
 * Tiled on top, plastered under, a plastered bargeboard on the front, the gable's face plastered,
 * a pendant (gegyo) under the crown; the ends closed down into the roof.
 */
export function karaHafu(bag, { c, n, W, D, yb, H, roofAt, kind = 'kara' }) {
  const u = [-n[1], n[0]], N = 28, top = [], low = [], pl = [];
  // the kara-hafu's bow; the chidori-hafu's straight rakes, a little hollowed
  const f = kind === 'kara' ? (t) => { const a = Math.abs(t); return H * (0.5 + 0.5 * Math.cos(Math.PI * Math.min(1, a))) + 0.22 * Math.max(0, (a - 0.78) / 0.22) ** 2; }
    : (t) => H * Math.pow(Math.max(0, 1 - Math.abs(t)), 1.12);
  const P = (s, dd, y) => [c[0] + u[0] * s + n[0] * dd, y, c[1] + u[1] * s + n[1] * dd];
  const d0 = -0.4, d1 = D + 0.3, T = 0.24;
  for (let k = 0; k < N; k++) {
    const t0 = -1 + 2 * k / N, t1 = -1 + 2 * (k + 1) / N, s0 = t0 * W / 2, s1 = t1 * W / 2;
    const y0 = yb + f(t0), y1 = yb + f(t1);
    const up = (p) => { const tm = (t0 + t1) / 2, sl = (f(t1) - f(t0)) / ((t1 - t0) * W / 2); void p; return [-u[0] * sl, 1, -u[1] * sl]; };
    quad4(top, P(s0, d0, y0), P(s1, d0, y1), P(s1, d1, y1), P(s0, d1, y0), up(0));
    quad4(low, P(s0, d0, y0 - T), P(s1, d0, y1 - T), P(s1, d1, y1 - T), P(s0, d1, y0 - T), [0, -1, 0]);
    quad4(top, P(s0, d1, y0), P(s1, d1, y1), P(s1, d1, y1 - T), P(s0, d1, y0 - T), [n[0], 0, n[1]]);
    // the bargeboard, under the front edge
    const bd = D, bt = 0.16;
    quad4(pl, P(s0, bd + bt, y0 - T), P(s1, bd + bt, y1 - T), P(s1, bd + bt, y1 - T - 0.36), P(s0, bd + bt, y0 - T - 0.36), [n[0], 0, n[1]]);
    quad4(pl, P(s0, bd - bt, y0 - T - 0.36), P(s1, bd - bt, y1 - T - 0.36), P(s1, bd + bt, y1 - T - 0.36), P(s0, bd + bt, y0 - T - 0.36), [0, -1, 0]);
    // the gable's face: from under the bargeboard down into the lower roof
    const yf = roofAt(D - 0.3) - 0.3;
    if (y0 - T > yf) quad4(pl, P(s0, D - 0.3, y0 - T), P(s1, D - 0.3, y1 - T), P(s1, D - 0.3, yf), P(s0, D - 0.3, yf), [n[0], 0, n[1]]);
  }
  // the ends: closed from the bow's edge down into the lower roof, along the reach
  for (const sd of [-1, 1]) {
    const s = sd * W / 2, ye = yb + f(sd), M = 8;
    for (let k = 0; k < M; k++) {
      const da = d0 + (d1 - d0) * k / M, db = d0 + (d1 - d0) * (k + 1) / M, ba = Math.min(ye - T, roofAt(da) - 0.3), bb = Math.min(ye - T, roofAt(db) - 0.3);
      quad4(top, P(s, da, ye), P(s, db, ye), P(s, db, ye - T), P(s, da, ye - T), [u[0] * sd, 0, u[1] * sd]);
      if (ye - T > ba + 0.01 || ye - T > bb + 0.01) quad4(pl, P(s, da, ye - T), P(s, db, ye - T), P(s, db, bb), P(s, da, ba), [u[0] * sd, 0, u[1] * sd]);
    }
  }
  // a ridge of round tiles along the crown, the pendant under it
  const cr = [];
  quad4(cr, P(-0.18, d0, yb + H + 0.02), P(0.18, d0, yb + H + 0.02), P(0.18, d1 + 0.05, yb + H + 0.02), P(-0.18, d1 + 0.05, yb + H + 0.02), [0, 1, 0]);
  tube(cr, P(0, d0, yb + H + 0.02), n, [[0, 0], [d1 + 0.1 - d0, 0]], [[0.16, 0.14], [0.16, 0.14]], 8);
  bag.add(TL, fromTriangles(top.concat(cr)));
  bag.add(PL, fromTriangles(low.concat(pl)));
  const g = P(0, D + 0.12, yb + H - T - 0.36);
  const pend = lathe([[0.001, -0.42], [0.08, -0.38], [0.16, -0.24], [0.18, -0.1], [0.12, 0], [0.001, 0]], 8);
  pend.scale(1, 1, 0.35).rotateY(Math.atan2(n[0], n[1])).translate(g[0], g[1], g[2]);
  bag.add(PL, pend);
  // the demon tile closing the ridge at the front
  if (kind !== 'kara') { const q = P(0, d1 + 0.02, yb + H - 0.05); bag.add(TL, box(q[0] - 0.28, q[1], q[2] - 0.28, q[0] + 0.28, q[1] + 0.55, q[2] + 0.28)); }
}

/**
 * The loopholes (sama) of a plastered wall: along a→b (wall thickness 2T, standing on y0 to y1),
 * a pattern of gun ports — triangles, squares and circles — and tall arrow slits, at the height
 * of a kneeling archer or gunner. Returns the wall's plaster (with the holes) as triangles; the
 * tunnels' sides go to the plaster too.
 */
export function samaWall(bag, a, b, y0, y1, T, every = 3.6) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [-u[1], u[0]];
  const out = [], cw = 0.6, ch = 0.8, yc = y0 + 0.75;
  const k = Math.max(0, Math.floor((L - 1.2) / every)), m = (L - (k - 1) * every) / 2;
  const SH = [
    [[0, 0.2], [-0.19, -0.13], [0.19, -0.13]],                       // triangle (guns)
    [[-0.12, -0.12], [0.12, -0.12], [0.12, 0.12], [-0.12, 0.12]],     // square (guns)
    [[-0.07, -0.33], [0.07, -0.33], [0.07, 0.33], [-0.07, 0.33]],     // arrow slit
    { circle: 0.13 },                                                 // circle (guns)
  ];
  const seg = (s0, s1, ya, yb2) => { if (s1 - s0 < 0.01 || yb2 - ya < 0.01) return; const p0 = [a[0] + u[0] * s0, a[1] + u[1] * s0], p1 = [a[0] + u[0] * s1, a[1] + u[1] * s1]; boxAlong(out, p0, p1, n, T, ya, yb2); };
  let s = 0;
  for (let i = 0; i < k; i++) {
    const sc = m + i * every;
    seg(s, sc - cw / 2, y0, y1);
    seg(sc - cw / 2, sc + cw / 2, y0, yc - ch / 2);
    seg(sc - cw / 2, sc + cw / 2, yc + ch / 2, y1);
    holePanel(out, out, [a[0] + u[0] * sc, yc, a[1] + u[1] * sc], u, n, cw, ch, T, SH[i % 4]);
    s = sc + cw / 2;
  }
  seg(s, L, y0, y1);
  bag.add(PL, fromTriangles(out));
}
function boxAlong(out, p0, p1, n, T, y0, y1) {
  const C = (p, o, y) => [p[0] + n[0] * o, y, p[1] + n[1] * o];
  const v = [[p0, -T], [p1, -T], [p1, T], [p0, T]].map(([p, o]) => [C(p, o, y0), C(p, o, y1)]);
  const cx = (p0[0] + p1[0]) / 2, cz = (p0[1] + p1[1]) / 2, cy = (y0 + y1) / 2, w = (q) => [q[0] - cx, q[1] - cy, q[2] - cz];
  for (let k = 0; k < 4; k++) { const j = (k + 1) % 4; quad4(out, v[k][0], v[j][0], v[j][1], v[k][1], w); }
  quad4(out, v[0][1], v[1][1], v[2][1], v[3][1], [0, 1, 0]);
  quad4(out, v[0][0], v[1][0], v[2][0], v[3][0], [0, -1, 0]);
}
void tri;
