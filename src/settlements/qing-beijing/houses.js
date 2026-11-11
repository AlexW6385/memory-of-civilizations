// Ming–Qing Beijing's courtyard houses, rebuilt (docs/settlements/qing-beijing.md §5, §17): the
// siheyuan of the lanes with the gate of their rank — Guangliang, Jinzhu, Manzi, Ruyi, or a gate in
// the wall — the screen wall inside it, the south row (daozuo) round the gate, the main house, the
// side houses, for the richer lots a second court behind a wall with its hanging-flower gate
// (chuihua men); grey brick under grey tiles with the plain rolled ridges of the city and the
// flush gable ends (yingshan), small brick chimneys at the back eaves, drum stones, door pins, a
// jar of goldfish, flower pots and the tree pits of the yard. Three levels of detail (lod 0 the
// core, 1 the middle ring, 2 the far town).
// Houses face south; each building is made in its own frame (s along its front, d out from it)
// and turned to its side of the yard.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { withPal, latticeBay } from '../../styles/ming/index.js';
import { HOUSE } from '../../styles/qing/index.js';
import { Parts, torus } from '../../styles/qing/carving.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const NOCOL = { segment() {}, rect() {}, floor() {}, ramp() {}, circle() {} };

/** A frame at (cx, cz) facing 'n' | 's' | 'e' | 'w': local (s along the front, d out of it) to world, orientation kept. */
export function Frame(cx, cz, face) {
  const n = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[face], u = { s: [1, 0], n: [-1, 0], e: [0, -1], w: [0, 1] }[face];
  const P = (s, d, y = 0) => [cx + u[0] * s + n[0] * d, y, cz + u[1] * s + n[1] * d];
  const rect = (s0, d0, s1, d1) => { const a = P(s0, d0), b = P(s1, d1); return [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; };
  const B = (bag, mat, s0, d0, s1, d1, y0, y1) => { const r = rect(s0, d0, s1, d1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); };
  return { P, rect, B, u, n, face };
}


/** A tuft of dry weed (grass and thistle of the north, yellowed in the autumn): a few thin blades splayed from a point. */
export function tuft(bag, x, y, z, k = 1, seed = 1) {
  const r = rng(seed | 0 || 3), mat = r() < 0.7 ? 'thatch' : 'flax_leaf';
  for (let i = 0; i < 5; i++) { const a = r() * 6.283, l = (0.22 + r() * 0.22) * k, t = 0.25 + r() * 0.4; bag.add(mat, rod([x, y, z], [x + Math.cos(a) * l * t, y + l, z + Math.sin(a) * l * t], 0.011 * Math.sqrt(k), 3)); }
}
const hashAt = (a, b, c = 0) => { let h = Math.imul(Math.floor(a * 7.3) | 0, 374761393) + Math.imul(Math.floor(b * 7.3) | 0, 668265263) + Math.imul(Math.floor(c * 7.3) | 0, 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** A thin patch laid on a wall's face (along t, up y) at the plane c, standing off the wall by `off` toward side (+1 / -1). */
function facePatch(bag, mat, horiz, t0, t1, c, side, y0, y1, off) {
  const p0 = side > 0 ? c - 0.05 : c - off, p1 = side > 0 ? c + off : c + 0.05;
  if (horiz) bag.add(mat, box(t0, y0, p0, t1, y1, p1)); else bag.add(mat, box(p0, y0, t0, p1, y1, t1));
}
/**
 * Dust and age on a brick wall's face (dry north: no moss): a paler dusty foot of wind-blown earth, salt bloom (efflorescence)
 * a little higher, patches of newer brick and of lime wash where it was mended, and the odd lost brick.
 */
function decayWall(bag, r, horiz, t0, t1, c, side, yb, hTop, lod) {
  const L = t1 - t0;
  // the wind-blown dust at the foot: a continuous low band and, over it, tapering plumes of different height (no hard-edged rectangles)
  facePatch(bag, 'earth_wall', horiz, t0, t1, c, side, yb, yb + 0.13, 0.012);
  for (let t = t0; t < t1 - 0.6; t += 0.9 + r() * 1.6) {
    const w = Math.min(t1 - t, 1.6 + r() * 2.2), h = 0.1 + r() * 0.22, off = 0.014, pl = side > 0 ? c + off : c - off, y0 = yb + 0.1;
    const P = (u, v) => (horiz ? [t + u, y0 + v, pl] : [pl, y0 + v, t + u]);
    const a = P(0, 0), b = P(w, 0), m = P(w * (0.3 + r() * 0.4), h), n = horiz ? [0, 0, side] : [side, 0, 0], T = [];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = m[0] - a[0], vy = m[1] - a[1], vz = m[2] - a[2];
    const dot = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
    T.push(...a, ...(dot >= 0 ? b : m), ...(dot >= 0 ? m : b));
    bag.add('earth_wall', fromTriangles(T));
  }
  if (lod > 0) return;
  for (let i = 0, n = Math.round(L / 4.5); i < n; i++) { const t = t0 + r() * (L - 0.6), w = 0.25 + r() * 0.4, y = yb + 0.3 + r() * 0.8; facePatch(bag, 'chalk', horiz, t, t + w, c, side, y, y + 0.12 + r() * 0.2, 0.014); }
  for (let i = 0, n = Math.round(L / 7); i < n; i++) {
    const t = t0 + r() * (L - 1), w = 0.4 + r() * 0.5, h = 0.3 + r() * 0.35, y = yb + 0.8 + r() * Math.max(0.1, hTop - yb - 1.8);
    facePatch(bag, r() < 0.6 ? 'brick' : 'plaster_grey', horiz, t, t + w, c, side, y, y + h, 0.03);
    if (r() < 0.5) facePatch(bag, 'brick_grey', horiz, t + 0.06, t + w * 0.7, c, side, y + 0.05, y + 0.12, 0.046);          // a course of the old brick showing through
  }
  for (let i = 0, n = Math.round(L / 8); i < n; i++) { const t = t0 + r() * (L - 0.4), y = yb + 0.6 + r() * Math.max(0.1, hTop - yb - 1.4); facePatch(bag, 'tile_dark', horiz, t, t + 0.14, c, side, y, y + 0.09, 0.012); }
}

/** A quad (four points) as two triangles, turned to face the `want` direction. */
function quadTo(out, a, b, c, d, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] >= 0) out.push(...a, ...b, ...c, ...a, ...c, ...d);
  else out.push(...a, ...c, ...b, ...a, ...d, ...c);
}

/**
 * A gabled roof with its ridge along the frame's s: from s0 to s1, eaves at depths dB (back) and dF
 * (front) at height ey, the ridge rising `rise` over the middle of the walls (dm); each slope
 * concave (steeper at the ridge), the gable ends flush with the walls (ovG 0) or just beyond them,
 * the rolled ridge, its ends turned up (the qingshui ridge) and a lip of eave tiles.
 * wd0, wd1: the wall's depths (the gable wall fills between them under the slopes), wy: its foot.
 */
export function gableRoof(bag, F, o) {
  const { s0, s1, dB, dF, dm, ey, rise, wd0, wd1, wy, ovG = 0, lod = 0, orn = true } = o;
  const p = 1.3, N = lod === 0 ? 6 : lod === 1 ? 4 : 3;
  const yAt = (d) => { const half = d >= dm ? dF - dm : dm - dB, t = 1 - Math.abs(d - dm) / half; return ey + rise * Math.pow(Math.max(0, t), p); };
  const ds = []; for (let i = 0; i <= N; i++) ds.push(dB + (dm - dB) * i / N); for (let i = 1; i <= N; i++) ds.push(dm + (dF - dm) * i / N);
  const a0 = s0 - ovG, a1 = s1 + ovG, roof = [], under = [], gab = [];
  for (let i = 0; i < ds.length - 1; i++) {
    const d0 = ds[i], d1 = ds[i + 1], up = d1 <= dm ? [0, 1, -0.5 * Math.sign(1)] : [0, 1, 0];
    const front = d0 >= dm;
    const w = front ? F.n : [-F.n[0], -F.n[1]];
    const want = [w[0] * 0.5, 1, w[1] * 0.5], wn = [-w[0] * 0.5, -1, -w[1] * 0.5];
    void up;
    const A = F.P(a0, d0, yAt(d0)), Bp = F.P(a1, d0, yAt(d0)), C = F.P(a1, d1, yAt(d1)), D = F.P(a0, d1, yAt(d1));
    quadTo(roof, A, Bp, C, D, want);
    // the underside (the roof's thickness shows only at the eaves: from the eave edge to the wall)
    if ((front && d1 > wd1) || (!front && d0 < wd0)) {
      const lo = (pt) => [pt[0], pt[1] - 0.16, pt[2]];
      quadTo(under, lo(A), lo(Bp), lo(C), lo(D), wn);
    }
  }
  bag.add(o.mat || 'tile_grey', fromTriangles(roof));
  if (under.length) bag.add('timber', fromTriangles(under));
  // the lip of eave tiles (the drip tiles), at the front and the back
  for (const d of [dF, dB]) {
    const y = yAt(d), tri = [], A = F.P(a0, d, y - 0.15), Bp = F.P(a1, d, y - 0.15), C = F.P(a1, d, y + 0.03), D = F.P(a0, d, y + 0.03);
    const w = d === dF ? F.n : [-F.n[0], -F.n[1]];
    quadTo(tri, A, Bp, C, D, [w[0], 0, w[1]]);
    bag.add('tile_grey', fromTriangles(tri));
  }
  // the gable walls: brick from the wall's top up to under the slopes, at both ends
  for (const sgn of [-1, 1]) {
    const s = sgn < 0 ? s0 : s1, tri = [];
    const dd = []; for (let i = 0; i <= N * 2; i++) dd.push(wd0 + (wd1 - wd0) * i / (N * 2));
    for (let i = 0; i < dd.length - 1; i++) {
      const t0 = Math.max(wy, yAt(dd[i]) - 0.1), t1 = Math.max(wy, yAt(dd[i + 1]) - 0.1);
      if (t0 - wy < 0.03 && t1 - wy < 0.03) continue;
      quadTo(tri, F.P(s, dd[i], wy), F.P(s, dd[i + 1], wy), F.P(s, dd[i + 1], t1), F.P(s, dd[i], t0), [F.u[0] * sgn, 0, F.u[1] * sgn]);
    }
    if (tri.length) bag.add('brick_grey', fromTriangles(tri));
  }
  // weeds on old tiles: tufts along the ridge, in the gutters of the slopes near the eaves, at the gable's foot
  if (lod === 0) {
    const ry0 = ey + rise;
    for (let s = s0 + 0.5; s < s1 - 0.3; s += 1.5) {
      const q = F.P(s, dm, 0), h = hashAt(q[0], q[2], 1);
      if (h < 0.3) { const p = F.P(s + (h - 0.15) * 2, dm, ry0 + 0.18); tuft(bag, p[0], p[1], p[2], 0.8 + h, Math.floor(h * 1e6)); }
      if (h > 0.82) { const d = dF - 0.3 - (h - 0.82) * 3, p = F.P(s, d, yAt(d) - 0.02); tuft(bag, p[0], p[1], p[2], 0.7, Math.floor(h * 9e5)); }
      if (h > 0.45 && h < 0.52) { const d = dB + 0.3, p = F.P(s, d, yAt(d) - 0.02); tuft(bag, p[0], p[1], p[2], 0.7, Math.floor(h * 8e5)); }
    }
  }
  // the rolled ridge and its ends turned up
  const ry = ey + rise;
  const r = rod(F.P(s0 - 0.05, dm, ry + 0.06), F.P(s1 + 0.05, dm, ry + 0.06), lod === 0 ? 0.16 : 0.14, lod === 0 ? 8 : 5);
  bag.add('tile_grey', r);
  if (orn && lod === 0) for (const [s, sg] of [[s0 - 0.05, -1], [s1 + 0.05, 1]]) {
    const a = F.P(s, dm, ry + 0.06), b = F.P(s + sg * 0.26, dm, ry + 0.52);
    bag.add('tile_grey', rod(a, b, 0.1, 6));
    bag.add('tile_grey', rod(F.P(s + sg * 0.26, dm, ry + 0.5), F.P(s + sg * 0.34, dm, ry + 0.58), 0.06, 5));
  }
  return yAt;
}

/**
 * A house in its frame: plinth, brick back and side walls, the posts of the front verandah, the
 * lattice windows and doors of the front wall, steps, the roof. o: { s0, s1 (its length), dB, dF (back wall's outer face, the front posts'
 * line), vw (the verandah's depth), y (the floor), H (the wall's height), bays, door (the door bay), lod, rich }.
 * Returns { rect, top }.
 */
export function house(bag, col, F, o) {
  const { s0, s1, dB, dF, vw = 1.0, y = 0.4, H = 3.3, bays = 3, door = Math.floor((bays - 1) / 2), lod = 0, rich = false, win = true, ridgeOnly = false } = o;
  const L = s1 - s0, bw = L / bays, dW = dF - vw;      // the front wall's line
  const rise = (dF - dB + 1.8) * 0.5 * 0.46;
  const plinth = rich ? 'granite_grey' : 'brick_grey';
  F.B(bag, plinth, s0 - 0.2, dB - 0.12, s1 + 0.2, dF + 0.05, -0.05, y);
  // back wall (it rises to the eave) and the side walls (chitou: they reach the front posts' line)
  F.B(bag, 'brick_grey', s0, dB, s1, dB + 0.5, y, y + H - 0.28);
  for (const [a, b] of [[s0, s0 + 0.5], [s1 - 0.5, s1]]) F.B(bag, 'brick_grey', a, dB + 0.5, b, dF, y, y + H);
  // the front: posts on the line dF, the wall behind them on dW, windows and the door
  const lintelY = y + H - 0.5;
  for (let i = 0; i <= bays; i++) {
    const s = s0 + 0.25 + (L - 0.5) * i / bays;
    if (i === 0 || i === bays || lod >= 3) continue;          // the ends are the walls (the far houses' posts are left out)
    F.B(bag, 'lacquer_red', s - 0.12, dF - 0.24, s + 0.12, dF, y, lintelY);
  }
  F.B(bag, 'lacquer_red', s0 + 0.5, dF - 0.26, s1 - 0.5, dF, lintelY, y + H - 0.2);                     // the lintel (feng)
  F.B(bag, 'brick_grey', s0 + 0.5, dW - 0.2, s1 - 0.5, dW, lintelY, y + H - 0.2);                        // the wall above the front wall's lattice
  if (lod === 0 && rich) F.B(bag, 'paint_caihua', s0 + 0.9, dF + 0.005, s1 - 0.9, dF + 0.02, lintelY + 0.06, lintelY + 0.3);      // the painted band on the lintel
  const P2 = (s) => { const p = F.P(s, dW, y); return [p[0], p[2]]; };
  const lx = (i0, i1) => [P2(s0 + 0.25 + (L - 0.5) * i0 / bays), P2(s0 + 0.25 + (L - 0.5) * i1 / bays)];
  const fh = lintelY - y;
  for (let i = 0; i < bays; i++) {
    const [a, b] = lx(i, i + 1), isDoor = i === door, inset = (pt, k) => [pt[0] + (i === 0 ? 0 : 0) * k, pt[1], pt[2]];
    void inset;
    // posts' faces on the verandah give each leaf its bay; the first and last bays are shortened by the end walls
    const aa = i === 0 ? P2(s0 + 0.5) : a, bb = i === bays - 1 ? P2(s1 - 0.5) : b;
    if (win || isDoor) {
      // beyond ~250 m (lod 2) one flat leaf a bay
      if (lod >= 2) F.B(bag, isDoor ? 'lacquer_red' : 'lattice_red', Math.min(i === 0 ? s0 + 0.5 : s0 + 0.25 + (L - 0.5) * i / bays, s1), dW - 0.05, Math.min(i === bays - 1 ? s1 - 0.5 : s0 + 0.25 + (L - 0.5) * (i + 1) / bays, s1), dW, y, lintelY);
      else latticeBay(bag, lod === 0 ? col : NOCOL, aa, bb, y, fh, isDoor ? 'door' : 'window', 0.06, 'lattice_red');
    }
    else F.B(bag, 'brick_grey', Math.min(i === 0 ? s0 + 0.5 : s0 + 0.25 + (L - 0.5) * i / bays, s1), dW - 0.2, Math.min(i === bays - 1 ? s1 - 0.5 : s0 + 0.25 + (L - 0.5) * (i + 1) / bays, s1), dW, y, lintelY);
  }
  // the verandah's floor (the plinth is its floor) and the steps to the door
  if (o.steps !== false && lod < 3) {
    const sc = s0 + 0.25 + (L - 0.5) * (door + 0.5) / bays, n = Math.max(1, Math.round(y / 0.17));
    for (let k = 0; k < n; k++) F.B(bag, 'granite_grey', sc - 0.9 - 0.0 * k, dF + 0.05 + 0.0, sc + 0.9, dF + 0.05 + 0.3 * (n - k), -0.05, y * (k + 1) / (n + 1) * 1 - (k === n - 1 ? 0 : 0));
  }
  const yAt = gableRoof(bag, F, { s0, s1, dB: dB - 0.4, dF: dF + 0.9, dm: (dB + dF) / 2 + 0.1, ey: y + H - 0.55, rise, wd0: dB, wd1: dF, wy: y + H, lod, orn: rich });
  // a chimney on the back slope: a brick stack with a tile cap
  if (lod <= 1 && !ridgeOnly && o.chimney !== false) {
    const sc = s0 + L * (o.chimneyAt ?? 0.28), dc = dB + (dF - dB) * 0.3, base = yAt(dc) - 0.1, top = base + 1.25;
    F.B(bag, 'brick_grey', sc - 0.22, dc - 0.22, sc + 0.22, dc + 0.22, base, top);
    F.B(bag, 'tile_grey', sc - 0.3, dc - 0.3, sc + 0.3, dc + 0.3, top, top + 0.09);
  }
  const rect = F.rect(s0 - 0.2, dB - 0.12, s1 + 0.2, dF + 0.05);
  col.rect(rect, 0, y + H + 1);
  return { rect, yAt };
}

const GATE = {
  guangliang: { gw: 3.4, rec: 2.2, open: 1.8, up: 0.7, plinth: 0.36, pins: 4, door: 'lacquer_red', drum: 'round', chitou: true },
  jinzhu: { gw: 3.2, rec: 1.2, open: 1.7, up: 0.45, plinth: 0.27, pins: 4, door: 'lacquer_red', drum: 'square', chitou: true },
  manzi: { gw: 2.7, rec: 0.28, open: 1.5, up: 0, plinth: 0.15, pins: 2, door: 'lacquer_black', drum: 'round', chitou: false },
  ruyi: { gw: 2.5, rec: 0.32, open: 1.4, up: 0, plinth: 0.15, pins: 2, door: 'lacquer_black', drum: 'square', chitou: false },
  wall: { gw: 1.8, rec: 0.12, open: 1.2, up: 0, plinth: 0.05, pins: 0, door: 'lacquer_black', drum: null, chitou: false },
};
export { GATE };

/** A wall along an axis-aligned line with a coping of grey tiles; gaps [[from, to]] along it are left open. */
function wallLine(bag, col, a, b, o = {}) {
  const { h = 3.0, th = 0.45, gaps = [], lod = 0, base = true } = o;
  const horiz = Math.abs(a[1] - b[1]) < 1e-6, x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
  const t0 = horiz ? x0 : z0, t1 = horiz ? x1 : z1;
  let segs = [[t0, t1]];
  for (const [g0, g1] of gaps) segs = segs.flatMap(([p, q]) => (g1 <= p || g0 >= q ? [[p, q]] : [[p, g0], [g1, q]].filter(([m, n]) => n - m > 0.05)));
  for (const [p, q] of segs) {
    const R = horiz ? [p, a[1] - th / 2, q, a[1] + th / 2] : [a[0] - th / 2, p, a[0] + th / 2, q];
    bag.add('brick_grey', box(R[0], 0, R[1], R[2], h - 0.2, R[3]));
    if (lod === 0) {
      bag.add('brick_grey', box(R[0] - (horiz ? 0 : 0.05), h - 0.2, R[1] - (horiz ? 0.05 : 0), R[2] + (horiz ? 0 : 0.05), h - 0.1, R[3] + (horiz ? 0.05 : 0)));    // the corbelled course
      if (base) bag.add('granite_grey', box(R[0] - (horiz ? 0 : 0.03), 0, R[1] - (horiz ? 0.03 : 0), R[2] + (horiz ? 0 : 0.03), 0.4, R[3] + (horiz ? 0.03 : 0)));   // the stone foot (jiaodang)
      // the coping in pieces of 1.6–3.4 m: some sunk, some lost (the brick course shows), tufts of weed on it
      const cr = rng(Math.floor(p * 13 + (horiz ? a[1] : a[0]) * 31) + 5);
      for (let t = p; t < q - 0.05;) {
        const e = Math.min(q, t + 1.6 + cr() * 1.8), k = cr(), dy = k < 0.15 ? -0.05 : 0;
        const [u0, u1] = [t, e], cx0 = horiz ? u0 : R[0] - 0.1, cx1 = horiz ? u1 : R[2] + 0.1, cz0 = horiz ? R[1] - 0.1 : u0, cz1 = horiz ? R[3] + 0.1 : u1;
        if (k > 0.88) { bag.add('brick_grey', box(horiz ? u0 : R[0], h - 0.1, horiz ? R[1] : u0, horiz ? u1 : R[2], h - 0.02, horiz ? R[3] : u1)); bag.add('tile_grey', box(cx0 + (horiz ? 0.1 : 0), h - 0.1, cz0 + (horiz ? 0 : 0.1), cx0 + (horiz ? 0.4 : 0.2) + (horiz ? 0 : 0), h + 0.0, cz0 + (horiz ? 0.2 : 0.4))); }
        else bag.add('tile_grey', box(cx0, h - 0.1 + dy, cz0, cx1, h + 0.1 + dy, cz1));
        if (cr() < 0.35) { const m = u0 + (u1 - u0) * cr(), tx = horiz ? m : (R[0] + R[2]) / 2, tz = horiz ? (R[1] + R[3]) / 2 : m; tuft(bag, tx, h + 0.08, tz, 0.9, Math.floor(m * 97)); }
        t = e;
      }
      const wr = rng(Math.floor(p * 7 + (horiz ? a[1] : a[0]) * 11) + 2);
      decayWall(bag, wr, horiz, p + 0.1, q - 0.1, horiz ? R[1] : R[0], -1, base ? 0.4 : 0, h, 0);
      decayWall(bag, wr, horiz, p + 0.1, q - 0.1, horiz ? R[3] : R[2], 1, base ? 0.4 : 0, h, 0);
    } else bag.add('tile_grey', box(R[0] - (horiz ? 0 : 0.06), h - 0.2, R[1] - (horiz ? 0.06 : 0), R[2] + (horiz ? 0 : 0.06), h, R[3] + (horiz ? 0.06 : 0)));
    col.segment(horiz ? [R[0], a[1]] : [a[0], R[1]], horiz ? [R[2], a[1]] : [a[0], R[3]], th, 0, h);
  }
}

// drum stones and the jar: repeated pieces (instances)
function drumStone(P, kind) {
  P.add('granite_grey', box(-0.17, 0, -0.26, 0.17, 0.42, 0.26));
  if (kind === 'round') {
    const drum = lathe([[0.001, -0.09], [0.24, -0.09], [0.27, -0.05], [0.27, 0.05], [0.24, 0.09], [0.001, 0.09]], 14); drum.rotateZ(Math.PI / 2);
    P.add('granite_grey', drum.translate(0, 0.68, 0));
  } else {
    P.add('granite_grey', box(-0.2, 0.42, -0.26, 0.2, 0.92, 0.26));                      // the square one, a seal (civil officers')
    P.add('granite_grey', box(-0.15, 0.92, -0.2, 0.15, 1.0, 0.2));
  }
  P.add('granite_grey', box(-0.12, 0.42, -0.12, 0.12, 0.47, 0.12));
}
function fishJar(P, glaze) {
  P.add('brick_grey', box(-0.5, 0, -0.5, 0.5, 0.34, 0.5));
  P.add(glaze, lathe([[0.001, 0.34], [0.34, 0.36], [0.5, 0.58], [0.58, 0.9], [0.52, 1.18], [0.42, 1.3], [0.45, 1.34], [0.43, 1.36], [0.34, 1.34], [0.4, 1.26], [0.46, 1.16], [0.52, 0.9], [0.46, 0.6], [0.3, 0.4]], 14));
  P.add('water', lathe([[0.001, 1.2], [0.4, 1.2]], 10));
}
function potPlant(P, glaze, h = 0.32) {
  P.add(glaze, lathe([[0.001, 0], [0.12, 0], [0.19, h], [0.21, h], [0.18, h * 0.9], [0.001, h * 0.9]], 8));
  P.add('glaze_green', lathe([[0.001, h * 0.9], [0.2, h * 1.2], [0.15, h * 1.9], [0.001, h * 2.1]], 7));
}
function pots(P, r) { for (let i = 0; i < 4; i++) { const Q = new Parts(); potPlant(Q, r() < 0.5 ? 'pottery_dark' : 'glaze_green', 0.3 + r() * 0.1); Q.emit(P, (i - 1.5) * 0.52, 0, (r() - 0.5) * 0.1); } }
function stove(P) {                       // a coal-ball pile and a chopped-wood stack (kept for the winter)
  P.add('granite_black', lathe([[0.001, 0.5], [0.3, 0.3], [0.55, 0.04], [0.55, 0], [0.001, 0]], 9));
}
function firewood(P) { for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i; j++) P.add('timber', box(-0.9 + i * 0.22 + j * 0.44, i * 0.2, -0.28, -0.9 + i * 0.22 + j * 0.44 + 0.38, i * 0.2 + 0.19, 0.28)); }

/**
 * The screen wall (yingbi) of the gate: a brick wall on a stone foot with the field panel (xinzi) set in it, a tile coping with
 * a little roof's lip; s0..s1 along x at z.
 */
function screenWall(bag, col, x0, x1, z, lod) {
  const h = 2.75, th = 0.42;
  bag.add('granite_grey', box(x0, 0, z - th / 2 - 0.04, x1, 0.34, z + th / 2 + 0.04));
  bag.add('brick_grey', box(x0 + 0.1, 0.34, z - th / 2, x1 - 0.1, h - 0.25, z + th / 2));
  if (lod === 0) {
    // the field: a panel of finer brick laid on the diagonal (a lighter plaster here), framed
    const cx = (x0 + x1) / 2, w = (x1 - x0) / 2 - 0.35;
    for (const k of [-1, 1]) bag.add('plaster_grey', box(cx - w, 0.62, z + k * (th / 2 + 0.005) - (k < 0 ? 0.02 : 0), cx + w, h - 0.55, z + k * (th / 2 + 0.005) + (k > 0 ? 0.02 : 0)));
    bag.add('granite_grey', box(x0 + 0.1, h - 0.25, z - th / 2 - 0.03, x1 - 0.1, h - 0.15, z + th / 2 + 0.03));
    bag.add('tile_grey', box(x0 + 0.02, h - 0.15, z - th / 2 - 0.12, x1 - 0.02, h + 0.1, z + th / 2 + 0.12));
  } else bag.add('tile_grey', box(x0 + 0.02, h - 0.25, z - th / 2 - 0.1, x1 - 0.02, h, z + th / 2 + 0.1));
  col.rect([x0, z - th / 2 - 0.04, x1, z + th / 2 + 0.04], 0, h);
}

/**
 * The south row, with the gate: a gabled block of brick on the lane, the gate's bay at its east
 * end — a passage through to the yard with the door leaves open — in the style of its rank.
 */
function southRow(bag, col, R, g, lod, rand, gxC) {
  const { x0, x1, z1, dS } = R, G = GATE[g.gate], zN = z1 - dS, y = G.plinth;
  const F = Frame((x0 + x1) / 2, z1 - dS / 2, 'n');       // facing the yard (north); the lane wall is its back
  const gL = gxC - G.gw / 2 - 0.15;
  const sOf = (x) => (x0 + x1) / 2 - x;                    // local s of a world x (u = −x)
  // the rooms west of the gate: facing the yard
  const s0 = sOf(gL), s1 = sOf(x0);
  const bays = Math.max(2, Math.round(Math.abs(s1 - s0) / 3.3));
  house(bag, col, F, { s0: Math.min(s0, s1), s1: Math.max(s0, s1), dB: -dS / 2, dF: dS / 2, vw: 0.9, y: 0.25, H: 3.05, bays, door: bays > 3 ? 1 : 0, lod, rich: g.wealth > 0.5, win: true, chimneyAt: 0.7 });
  // the gate block
  const gR = x1, Fg = Frame((gL + gR) / 2, z1 - dS / 2, 'n'), gwB = gR - gL, up = G.up, Hg = 3.05 + up;
  const zS = z1;                                           // the lane face
  const doorD = G.rec;                                      // the leaf's plane, back from the lane face
  // block walls: its two sides (the passage walls), the roof, the front (yard side) pier
  const side = (xa, xb) => { bag.add('brick_grey', box(xa, y, zN, xb, y + Hg - 0.28, zS)); };
  side(gL, gL + 0.5);                                                                         // the west wall of the passage
  side(gR - 0.5, gR);                                                                         // the east wall (the lot wall)
  // the roof: its own ridge, higher for the Guangliang and Jinzhu gates
  const dm = 0, dB = -dS / 2 - 0.35, dF = dS / 2 + 0.55;
  const sg0 = Fg.u[0] * 0, rise = (dF - dB) * 0.5 * 0.45;
  gableRoof(bag, Fg, { s0: -gwB / 2, s1: gwB / 2, dB, dF, dm, ey: y + Hg - 0.52, rise, wd0: -dS / 2, wd1: dS / 2, wy: y + Hg - 0.02, lod, orn: lod === 0 && up > 0 });
  void sg0;
  // the plinth under the gate block, with steps up from the lane and down to the yard
  bag.add('granite_grey', box(gL, -0.05, zN - 0.15, gR, y, zS + 0.05));
  const nst = Math.max(1, Math.round(y / 0.13));
  for (let k = 0; k < nst; k++) {
    const hh = y * (k + 1) / (nst + 1), dd = 0.3 * (nst - k);
    bag.add('granite_grey', box(gxC - G.open / 2 - 0.35, -0.05, zS + 0.05, gxC + G.open / 2 + 0.35, hh, zS + 0.05 + dd));
    bag.add('granite_grey', box(gxC - G.open / 2 - 0.35, -0.05, zN - 0.15 - dd, gxC + G.open / 2 + 0.35, hh, zN - 0.15));
  }
  // the front of the gate: the lintel with the door pins; the door's frame and leaves (open); the porch before them
  const zD = zS - doorD, jx0 = gxC - G.open / 2, jx1 = gxC + G.open / 2, hD = 2.3 + (up > 0 ? 0.2 : 0);
  // what the visitor stands on: the passage's floor, the steps up from the lane and down to the yard
  col.floor([jx0, zN - 0.15, jx1, zS + 0.05], y);
  col.ramp([jx0 - 0.35, zS + 0.05, jx1 + 0.35, zS + 0.05 + 0.3 * nst], 0.03, y, 'n');
  col.ramp([jx0 - 0.35, zN - 0.15 - 0.3 * nst, jx1 + 0.35, zN - 0.15], 0.03, y, 's');
  // the closing of the passage at the lane face: brick returns to the open width at the leaf's plane, and the lintel/transom
  bag.add('brick_grey', box(gL + 0.5, y, zD - 0.15, jx0, y + hD + 0.5, zD + 0.15));
  bag.add('brick_grey', box(jx1, y, zD - 0.15, gR - 0.5, y + hD + 0.5, zD + 0.15));
  bag.add('lacquer_black', box(jx0 - 0.02, y + hD, zD - 0.17, jx1 + 0.02, y + hD + 0.22, zD + 0.17));                // the lintel beam above the leaves
  bag.add('brick_grey', box(jx0, y + hD + 0.22, zD - 0.15, jx1, y + hD + 0.5, zD + 0.15));
  // the passage's ceiling (boards under the rafters)
  bag.add('timber', box(gL + 0.5, y + Hg - 0.62, zN - 0.15, gR - 0.5, y + Hg - 0.56, zS));
  // door frame and the two leaves standing open into the yard side
  for (const sx of [-1, 1]) {
    const xj = sx < 0 ? jx0 : jx1;
    bag.add('lacquer_black', box(xj - 0.1 * (sx > 0 ? 1 : 0) - 0.0, y, zD - 0.12, xj + 0.1 * (sx < 0 ? 1 : 0), y + hD, zD + 0.12));
    const xl = sx < 0 ? xj + 0.01 : xj - 0.07;
    bag.add(G.door, box(xl, y + 0.12, zD - 0.9, xl + 0.06, y + hD - 0.04, zD - 0.06));                                // the leaf swung back against the passage wall
  }
  // door pins on the lintel (men zan): round pegs standing out of the lintel, red
  const pins = G.pins;
  for (let i = 0; i < pins; i++) {
    const px = jx0 + (jx1 - jx0) * (i + 0.5) / pins;
    const pin = lathe([[0.001, 0], [0.07, 0], [0.075, 0.2], [0.001, 0.22]], 8); pin.rotateX(Math.PI / 2);
    bag.add('lacquer_red', pin.translate(px, y + hD + 0.11, zD + 0.17));
  }
  // drum stones: before the leaf, one each side (the stone's drum faces the lane)
  const Dr = new Parts(); drumStone(Dr, G.drum || 'round');
  if (G.drum) for (const sx of [-1, 1]) Dr.emit(bag, sx < 0 ? jx0 - 0.1 : jx1 + 0.1, y, zD + 0.55 + (g.gate === 'guangliang' ? 0.5 : 0), Math.PI / 2);
  // the two kinds of porch: the Guangliang and the Jinzhu gates have columns on the lane face and a deep hood
  if (G.chitou) {
    for (const sx of [-1, 1]) {
      const xp = sx < 0 ? gL + 0.5 : gR - 0.5, d = 0.14;
      bag.add('lacquer_red', box(xp - (sx < 0 ? 0.0 : 0.26), y, zS - 0.26, xp + (sx < 0 ? 0.26 : 0.0), y + Hg - 0.5, zS));
      void d;
    }
    bag.add('lacquer_red', box(gL + 0.5, y + Hg - 0.5, zS - 0.26, gR - 0.5, y + Hg - 0.25, zS));                                // the lintel across the porch front
    if (lod === 0) bag.add('paint_caihua', box(gL + 0.8, y + Hg - 0.45, zS + 0.005, gR - 0.8, y + Hg - 0.3, zS + 0.02));
    // the brick corner pieces (chitou) at the block's front corners, carved panels
    for (const sx of [-1, 1]) bag.add('granite_grey', box(sx < 0 ? gL - 0.04 : gR - 0.38, y + 1.05, zS - 0.01, sx < 0 ? gL + 0.38 : gR + 0.04, y + 1.85, zS + 0.04));
  } else if (g.gate === 'ruyi') {
    // the Ruyi gate: a brick surround on the wall with the carved ruyi head over the door
    bag.add('brick_grey', box(jx0 - 0.28, y, zS - 0.02, jx0, y + hD + 0.55, zS + 0.08));
    bag.add('brick_grey', box(jx1, y, zS - 0.02, jx1 + 0.28, y + hD + 0.55, zS + 0.08));
    bag.add('brick_grey', box(jx0 - 0.28, y + hD + 0.12, zS - 0.02, jx1 + 0.28, y + hD + 0.55, zS + 0.1));
    if (lod === 0) {
      bag.add('plaster_grey', box(jx0 - 0.12, y + hD + 0.2, zS + 0.1, jx1 + 0.12, y + hD + 0.48, zS + 0.115));
      bag.add('tile_grey', box(jx0 - 0.36, y + hD + 0.55, zS - 0.02, jx1 + 0.36, y + hD + 0.68, zS + 0.18));
    }
  } else if (g.gate === 'manzi') {
    // the Manzi gate: the door hung on the outer posts, a board lintel over it under the eave
    for (const sx of [-1, 1]) bag.add('lacquer_red', box(sx < 0 ? jx0 - 0.2 : jx1 - 0.0, y, zS - 0.22, sx < 0 ? jx0 + 0.0 : jx1 + 0.2, y + hD + 0.1, zS - 0.02));
    bag.add('lacquer_red', box(jx0 - 0.2, y + hD + 0.1, zS - 0.22, jx1 + 0.2, y + hD + 0.35, zS - 0.02));
  } else {
    // the gate in the wall: a plain lintel and a little hood of two courses of tile
    bag.add('tile_grey', box(jx0 - 0.3, y + hD + 0.4, zS - 0.1, jx1 + 0.3, y + hD + 0.55, zS + 0.2));
  }
  // ── the gate's dressing, by rank (lod 0): the lane face's dust and mending, couplets, door gods, knockers and studs, the mounting block
  if (lod === 0) {
    const gr = rng(Math.floor(gxC * 31 + zS * 17) + 9);
    // the lane face of the south row west of the gate, and the gate block's returns: dust foot, salt, patches (the back wall rises from the plinth)
    decayWall(bag, gr, true, x0 + 0.3, gL - 0.1, zS, 1, y, y + 3.05, 0);
    // couplets (duilian) in red paper with black characters on the wall either side of the gate, and the paper door gods on the open leaves
    const cw = G.chitou ? Math.min(0.3, (jx0 - (gL + 0.5)) - 0.1) : (g.gate === 'ruyi' ? 0.2 : 0);
    if (cw > 0.1) {
      const cz = (G.chitou ? zD + 0.15 : zS + 0.08) + 0.006, cy0 = y + 0.55, cl = 1.55;
      for (const [xc] of [[jx0 - (G.chitou ? (jx0 - (gL + 0.5)) / 2 : 0.14)], [jx1 + (G.chitou ? (gR - 0.5 - jx1) / 2 : 0.14)]]) {
        bag.add('cloth_red', box(xc - cw / 2, cy0, cz, xc + cw / 2, cy0 + cl, cz + 0.008));
        for (let k = 0; k < 5; k++) bag.add('lacquer_black', box(xc - cw * 0.28, cy0 + 0.12 + k * 0.28, cz + 0.008, xc + cw * 0.28, cy0 + 0.12 + k * 0.28 + 0.15, cz + 0.014));
      }
      bag.add('cloth_red', box(jx0 - 0.05, y + hD + 0.1, cz, jx1 + 0.05, y + hD + 0.3, cz + 0.008));           // the horizontal scroll over the door
      for (let k = 0; k < 4; k++) bag.add('lacquer_black', box(jx0 + 0.15 + k * (jx1 - jx0 - 0.4) / 3, y + hD + 0.14, cz + 0.008, jx0 + 0.3 + k * (jx1 - jx0 - 0.4) / 3, y + hD + 0.26, cz + 0.014));
    }
    if (g.gate !== 'wall') for (const sx of [-1, 1]) {
      const xf = sx < 0 ? jx0 + 0.07 : jx1 - 0.07, o = sx < 0 ? 1 : -1, zc = zD - 0.48;     // the leaf's face toward the passage
      const P = (xa, xb, ya, yb, za, zb, m) => bag.add(m, box(Math.min(xf + o * xa, xf + o * xb), y + ya, zc + za, Math.max(xf + o * xa, xf + o * xb), y + yb, zc + zb));
      P(-0.03, 0.008, 0.5, 1.9, -0.36, 0.36, 'cloth_red');                                                   // the print (a door god, a general in armour)
      P(-0.03, 0.024, 0.56, 1.52, -0.2, 0.2, 'paint_ochre'); P(-0.03, 0.024, 1.48, 1.72, -0.1, 0.1, 'lacquer_black');        // his robe and his helmet
      P(-0.03, 0.04, 1.68, 1.8, -0.06, 0.06, 'gilt_bronze'); P(-0.03, 0.056, 1.0, 1.1, -0.3, 0.3, 'cloth_maroon');      // the plume, the sash
      P(-0.03, 0.024, 0.5, 0.6, -0.24, 0.24, 'lacquer_black');
      // the door-knocker (pushou): a boss with its ring, brass
      const boss = lathe([[0.001, 0.016], [0.07, 0.012], [0.09, 0], [0.09, -0.012], [0.001, -0.012]], 10); boss.rotateZ(sx < 0 ? -Math.PI / 2 : Math.PI / 2);
      bag.add('gilt_bronze', boss.translate(xf + o * 0.045, y + 1.28, zc + 0.14));
      const ring = lathe([[0.075, -0.01], [0.095, -0.01], [0.095, 0.01], [0.075, 0.01]], 10); ring.rotateZ(sx < 0 ? -Math.PI / 2 : Math.PI / 2);
      bag.add('gilt_bronze', ring.translate(xf + o * 0.07, y + 1.1, zc + 0.14));
      if (G.up > 0) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) bag.add('gilt_bronze', box(Math.min(xf - o * 0.03, xf + o * 0.05), y + 0.62 + j * 0.14, zc - 0.3 + i * 0.12 - 0.02, Math.max(xf - o * 0.03, xf + o * 0.05), y + 0.62 + j * 0.14 + 0.04, zc - 0.3 + i * 0.12 + 0.02));
    }
    // the mounting block (shangmashi): two steps of granite on the lane beside the great gates, a carved face on its end
    if (g.gate === 'guangliang' || g.gate === 'jinzhu' || (g.gate === 'manzi' && gr() < 0.4)) {
      const mx = gL - 1.4, mz = zS + 0.02;
      bag.add('granite_grey', box(mx, 0, mz, mx + 1.0, 0.2, mz + 0.62)); bag.add('granite_grey', box(mx, 0.2, mz, mx + 0.6, 0.42, mz + 0.44));
      bag.add('granite_black', box(mx + 0.05, 0.42, mz + 0.03, mx + 0.55, 0.45, mz + 0.41));
      bag.add('granite_black', box(mx + 0.2, 0.08, mz + 0.62, mx + 0.8, 0.14, mz + 0.64));
      col.rect([mx, mz, mx + 1.0, mz + 0.62], 0, 0.45);
    }
  } else if (lod === 1) decayWall(bag, rng(Math.floor(gxC * 31) + 3), true, x0 + 0.3, gL - 0.1, zS, 1, y, y + 3.05, 1);
  // solid parts of the block; the passage itself is left open
  col.rect([gL, zN - 0.1, jx0 - 0.0, zS + 0.05], 0, Hg + 1);
  col.rect([jx1, zN - 0.1, gR, zS + 0.05], 0, Hg + 1);
  // between the passage walls and the open width: the brick returns
  col.rect([gL + 0.5, zD - 0.15, jx0, zD + 0.15], 0, 3);
  col.rect([jx1, zD - 0.15, gR - 0.5, zD + 0.15], 0, 3);
  return { gL, gR, jx0, jx1, zN };
}

/** The hanging-flower gate (chuihua men) in the wall between the outer and inner court: two posts with their hanging heads, a little roof, doors open. */
function chuihua(bag, col, cx, z, lod) {
  const hw = 0.95, y = 0.22;
  bag.add('granite_grey', box(cx - 1.9, -0.05, z - 1.35, cx + 1.9, y, z + 1.35));
  for (const sx of [-1, 1]) {
    const x = cx + sx * hw;
    bag.add('lacquer_red', box(x - 0.14, y, z - 0.7, x + 0.14, y + 2.85, z - 0.42));
    bag.add('lacquer_red', box(x - 0.14, y, z + 0.42, x + 0.14, y + 2.85, z + 0.7));
    // the hanging post (chuizhu), a lotus bud of green, at the front corners of the roof
    if (lod <= 1) {
      for (const dz of [-1.2, 1.2]) {
        bag.add('lacquer_red', box(x - 0.1, y + 2.55, z + dz - 0.1, x + 0.1, y + 3.0, z + dz + 0.1));
        bag.add('paint_caihua', lathe([[0.001, 2.5], [0.1, 2.5], [0.12, 2.38], [0.09, 2.2], [0.001, 2.15]], 8).translate(x, y + 0.2 + 0.0, z + dz));
        bag.add('lacquer_red', box(x - 0.08, y + 2.95, z + dz - 0.08, x + 0.08, y + 3.0, z + dz + 0.08));
      }
    }
    bag.add('lacquer_red', box(x - 0.1, y + 2.85, z - 1.25, x + 0.1, y + 3.0, z + 1.25));
    // door leaves, open
    bag.add('lacquer_red', box(x - 0.03 - sx * 0.12, y + 0.12, z - 0.4 - 0.0, x + 0.03 - sx * 0.12, y + 2.55, z + 0.4 - 0.0 - 0.0));
  }
  bag.add('lacquer_red', box(cx - hw - 0.14, y + 2.6, z - 0.7, cx + hw + 0.14, y + 2.85, z + 0.7));
  bag.add('paint_caihua', box(cx - hw - 0.14, y + 2.62, z - 0.72, cx + hw + 0.14, y + 2.82, z - 0.7));
  bag.add('paint_caihua', box(cx - hw - 0.14, y + 2.62, z + 0.7, cx + hw + 0.14, y + 2.82, z + 0.72));
  // the little roof: a gabled one rolled over the posts (juanpeng)
  const F = Frame(cx, z, 's');
  gableRoof(bag, F, { s0: -1.55, s1: 1.55, dB: -1.35, dF: 1.35, dm: 0, ey: y + 3.0, rise: 0.95, wd0: -0.2, wd1: 0.2, wy: y + 3.0, ovG: 0.1, lod, orn: lod === 0 });
  col.rect([cx - hw - 0.14, z - 0.7, cx - hw + 0.14, z + 0.7], 0, 3);
  col.rect([cx + hw - 0.14, z - 0.7, cx + hw + 0.14, z + 0.7], 0, 3);
}

/** One courtyard house, as an element: { rect, seed, gate, courts, wealth, lod, trees }. */
/**
 * The parts of a hutong house, from its lot alone (rect, courts, gate rank, lod): the main house's
 * footprint, its bays and the wings' footprints — used by the builder and by the furnishing (interiors.js)
 * so that the rooms always fit the shells.
 */
export function houseParts(el) {
  const lod = el.lod ?? 0, [x0, z0, x1, z1] = el.rect, W = x1 - x0, courts = el.courts || 1, G = GATE[el.gate || 'ruyi'];
  const dS = 4.6, dN = 6.45, dE = Math.min(3.8, W * 0.14), zN = z1 - 0.2 - dS;
  const sideM = lod >= 2 ? 1.0 : dE * 0.5;
  const main = [x0 + 0.44 + sideM, z0 + 0.3, x1 - 0.44 - sideM, z0 + 0.3 + dN], mb = W > 27 ? 5 : 3;
  const yardTop = z0 + 0.3 + dN + 0.9, zWall = courts === 2 ? z0 + 12.95 : null;
  const wingZ1 = (zWall ?? zN) - (courts === 2 ? 0.6 : 2.2), wingZ0 = yardTop + 0.2, ww = Math.min(3.4, W * 0.13);
  const wings = [];
  if (wingZ1 - wingZ0 > 3.5) for (const [side, xa] of [['e', x0 + 0.44], ['w', x1 - 0.44 - ww]]) wings.push({ side, rect: [xa, wingZ0, xa + ww, wingZ1], ww, L: wingZ1 - wingZ0 });
  void G;
  return { main, mb, mainY: 0.55, dN, wings, wingY: 0.35, zN, zWall };
}

export function hutongHouse(el, ctx0) {
  const { bag, col } = ctx0, lod = el.lod ?? 0, rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2;
  const g = { gate: el.gate || 'ruyi', wealth: el.wealth ?? 0.4, courts: el.courts || 1 };
  const G = GATE[g.gate], dS = 4.6, dN = 6.45, dE = Math.min(3.8, W * 0.14);
  const lw = { lod, h: 3.1 };
  // the lot's walls: north, west, east (the south is the south row's back)
  const gxC = x1 - 0.25 - G.gw / 2 - 0.15;
  wallLine(bag, col, [x0 + 0.22, z0], [x1 - 0.22, z0], { ...lw, base: lod === 0 });
  wallLine(bag, col, [x0 + 0.22, z0], [x0 + 0.22, z1], lw);
  wallLine(bag, col, [x1 - 0.22, z0], [x1 - 0.22, z1], lw);
  // the south row with the gate
  const gt = southRow(bag, col, { x0: x0 + 0.44, x1: x1 - 0.44, z1: z1 - 0.2, dS }, g, lod, rand, gxC);
  // the yard's floor: brick, paths of bluestone
  const zN = gt.zN;
  bag.add('brick_paving', box(x0 + 0.45, -0.2, z0 + 0.45, x1 - 0.45, 0.03, zN - 0.1));
  col.floor([x0 + 0.45, z0 + 0.45, x1 - 0.45, zN - 0.1], 0.03);
  // the main house: three bays or five, on the north side facing south
  const sideM = lod >= 2 ? 1.0 : dE * 0.5;
  const mainR = [x0 + 0.44 + sideM, z0 + 0.3, x1 - 0.44 - sideM, z0 + 0.3 + dN];
  const mb = W > 27 ? 5 : 3;
  const Fm = Frame((mainR[0] + mainR[2]) / 2, (mainR[1] + mainR[3]) / 2, 's'), mL = mainR[2] - mainR[0];
  house(bag, col, Fm, { s0: -mL / 2, s1: mL / 2, dB: -dN / 2, dF: dN / 2, vw: 1.1, y: 0.55, H: 3.45, bays: mb, lod, rich: g.wealth > 0.45, chimneyAt: 0.2 });
  // the ear rooms (erfang) of the grander main house, lower, at its two ends
  const earW = (sideM - 0.1);
  void earW;
  // the side houses, east and west, of the yard (the inner one for two courts)
  const yardTop = z0 + 0.3 + dN + 0.9;                                      // the main house's steps
  const zWall = g.courts === 2 ? z0 + 12.95 : null;                    // the hanging-flower gate's wall
  const wingZ1 = (zWall ?? zN) - (g.courts === 2 ? 0.6 : 2.2);
  const wingZ0 = yardTop + 0.2;
  const ww = Math.min(3.4, W * 0.13);
  if (wingZ1 - wingZ0 > 3.5) {
    for (const [side, xa] of [['e', x0 + 0.44], ['w', x1 - 0.44 - ww]]) {
      const F = Frame(xa + ww / 2, (wingZ0 + wingZ1) / 2, side), L = wingZ1 - wingZ0;
      // a wing's 'front' faces the yard: the west wing (at x0) faces east ('e'), the east wing faces west ('w'); local s runs along z
      const bk = side === 'e' ? -ww / 2 : -ww / 2;
      house(bag, col, F, { s0: -L / 2, s1: L / 2, dB: bk, dF: ww / 2, vw: 0.8, y: 0.35, H: 3.05, bays: Math.max(2, Math.round(L / 3.2)), lod, rich: g.wealth > 0.5, chimneyAt: 0.8 });
    }
  }
  // the second court: a wall across, with the hanging-flower gate in its middle; the screen wall near the gate
  if (g.courts === 2) {
    wallLine(bag, col, [x0 + 0.44, zWall], [x1 - 0.44, zWall], { lod, h: 2.9, th: 0.4, gaps: [[cx - 0.95, cx + 0.95]], base: false });
    chuihua(bag, col, cx, zWall, lod);
    // the covered walks (chaoshou youlang) are shown as the low brick bench walls beside the gate
  }
  // the screen wall inside the gate (yingbi)
  const gcx = gxC;
  const swZ = zN - (G.rec < 1 ? 2.6 : 3.1) - (G.up > 0 ? 0.2 : 0);
  screenWall(bag, col, gcx - 2.0, Math.min(gcx + 1.5, x1 - 1.45), swZ, lod);
  // the paths: from the gate round the screen to the main house, bluestone
  bag.add('bluestone', box(cx - 0.6, 0.0, mainR[3] + 1.2, cx + 0.6, 0.06, (zWall ?? swZ) - 0.4));
  if (g.courts === 2) bag.add('bluestone', box(cx - 0.6, 0.0, zWall + 0.8, cx + 0.6, 0.06, swZ - 0.3));
  bag.add('bluestone', box(gcx - G.open / 2, 0.0, zN - 0.8 - (G.chitou ? 0.0 : 0.0), gcx + G.open / 2, 0.06, swZ + 0.5));
  bag.add('bluestone', box(Math.min(gcx - 2.6, cx), 0.0, swZ - 0.5, Math.max(gcx - 2.0, cx + 0.6), 0.06, swZ + 0.5 + 0.0));
  // trees' brick-edged pits and the yard's things
  if (lod <= 1) {
    for (const t of el.trees || []) {
      const [tx, tz] = t, r = 0.9;
      bag.add('brick_grey', box(tx - r, 0.0, tz - r, tx + r, 0.12, tz - r + 0.12)); bag.add('brick_grey', box(tx - r, 0.0, tz + r - 0.12, tx + r, 0.12, tz + r));
      bag.add('brick_grey', box(tx - r, 0.0, tz - r + 0.12, tx - r + 0.12, 0.12, tz + r - 0.12)); bag.add('brick_grey', box(tx + r - 0.12, 0.0, tz - r + 0.12, tx + r, 0.12, tz + r - 0.12));
      bag.add('mud_plaster', box(tx - r + 0.12, 0.0, tz - r + 0.12, tx + r - 0.12, 0.09, tz + r - 0.12));
    }
  }
  if (lod === 0) {
    const yard = new Parts();
    if (rand() < 0.8) {
      const jz = Math.min(mainR[3] + 2.6, (zWall ?? swZ) - 1.6), jx = cx + (rand() < 0.5 ? -3.4 : 3.4);
      if (!(el.trees || []).some(([tx, tz]) => Math.hypot(tx - jx, tz - jz) < 1.6)) { fishJar(yard, rand() < 0.5 ? 'glaze_green' : 'pottery_dark'); yard.emit(bag, jx, 0.03, jz); col.circle(jx, jz, 0.6, 0, 1); }
    }
    const pt = new Parts(); pots(pt, rand); pt.emit(bag, cx + (rand() < 0.5 ? -4.6 : 3.6), 0.03, mainR[3] + 1.15);
    const st = new Parts(); if (rand() < 0.55) { firewood(st); st.emit(bag, x0 + 1.6, 0.03, mainR[3] + 3.2, Math.PI / 2); }
    const cp = new Parts(); if (rand() < 0.5) { stove(cp); cp.emit(bag, x1 - 1.5, 0.03, mainR[3] + 3.0); }
  }
}

export const hutongHouseEl = withPal((el, ctx) => hutongHouse(el, ctx));
export { HOUSE };
