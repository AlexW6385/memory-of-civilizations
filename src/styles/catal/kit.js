// Çatalhöyük style kit: the shared pieces (ladders, ovens, baskets, jars, wall paint, bucrania, hatches).
import { box, lathe, fromTriangles, rod, place } from '../../core/geom.js';

const WALL = 'mudbrick', MUD = 'mud_plaster', PLS = 'plaster_white', LIME = 'lime_plaster', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
const LOG = 'log_pine', REED = 'reed_mat', BONE = 'chalk', HORN = 'ivory', ASH = 'pottery_dark';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

/** A ladder: two poles (a notched log in life, two poles here) and rungs lashed on, foot at (x, y, z), leaning toward (dx, dz) over h, the poles running `over` past the top. */
function ladder(bag, x, y, z, h, dx, dz, lean = 0.6, over = 1.0) {
  const px = -dz, pz = dx, len = h + over, top = (f) => [x + dx * lean * f, y + h * f, z + dz * lean * f];
  for (const s of [-0.22, 0.22]) {
    const a = top(0), b = top(len / h);
    bag.add(LOG, rod([a[0] + px * s, a[1], a[2] + pz * s], [b[0] + px * s, b[1], b[2] + pz * s], 0.04, 6));
  }
  for (let k = 1; k * 0.34 < h + over * 0.7; k++) { const c = top(k * 0.34 / h); bag.add(LOG, rod([c[0] - px * 0.22, c[1], c[2] - pz * 0.22], [c[0] + px * 0.22, c[1], c[2] + pz * 0.22], 0.024, 5)); }
}
/** A mounded dome of mud (an oven, a heap) lathed at (x, y, z), scaled (sx, sy, sz). */
function dome(bag, mat, x, y, z, r, h, sx = 1, sz = 1, yaw = 0, wob = 0.03) {
  const g = lathe([[r, 0], [r * 0.98, h * 0.25], [r * 0.82, h * 0.6], [r * 0.5, h * 0.88], [0.001, h]], 14, (t, i) => 1 + wob * Math.sin(t * 4 + i * 2));
  g.scale(sx, 1, sz); bag.add(mat, place(g, x, y, z, yaw));
}
/** A basket (wicker) at (x, y, z) heaped with `goods` (a palette material) or empty. */
function basket(bag, x, y, z, r = 0.22, goods = null) {
  bag.add('wicker', lathe([[0.001, 0], [r * 0.7, 0.01], [r, 0.12], [r * 1.05, 0.25], [r * 0.95, 0.25], [r * 0.9, 0.12], [0.001, 0.03]], 12, null, x, y, z));
  if (goods) bag.add(goods, lathe([[0.001, 0.2], [r * 0.9, 0.2], [r * 0.7, 0.26], [0.001, 0.31]], 10, null, x, y, z));
}
/** A clay jar of a round-bellied, wide-mouthed form. */
function jar(bag, x, y, z, k = 1, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.26], [0.19, 0.38], [0.14, 0.45], [0.15, 0.49], [0.13, 0.49], [0.12, 0.44], [0.001, 0.43]].map(([r, h]) => [r * k, h * k]), 14, null, x, y, z));
}

/**
 * A wall's frame: the world point at (a along the wall, y, d out from it into the room), O the wall's origin on its inner
 * face, A the unit vector along it, N the unit normal into the room.
 */
const frame = (O, A, N) => ({ P: (a, y, d = 0) => [O[0] + A[0] * a + N[0] * d, y, O[1] + A[1] * a + N[1] * d], N, A });
/** A flat painted polygon on a wall (double-sided, set `d` off it), from (a, y) points, fanned from the centre. */
function flat(bag, mat, F, pts, d0 = 0.012) {
  const d = d0 + 0.03;                       // off the plaster lining (2.5 cm)
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length, T = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    T.push(...F.P(cx, cy, d), ...F.P(p[0], p[1], d), ...F.P(q[0], q[1], d));
  }
  // facing into the room: flip if the first triangle faces the wall
  const t0 = T.slice(0, 9), ux = t0[3] - t0[0], uy = t0[4] - t0[1], uz = t0[5] - t0[2], vx = t0[6] - t0[0], vy = t0[7] - t0[1], vz = t0[8] - t0[2];
  const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx;
  bag.add(mat, fromTriangles(nx * F.N[0] + nz * F.N[1] < 0 ? flip(T) : T));
}
const ellipse = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, X = Math.cos(a) * rx, Y = Math.sin(a) * ry; return [cx + X * Math.cos(rot) - Y * Math.sin(rot), cy + X * Math.sin(rot) + Y * Math.cos(rot)]; });

/** The aurochs of the wall paintings: a great bull in red, the horns forward, the legs short, a line of small black hunters round it. */
function aurochs(bag, F, a0, y0, k, rand) {
  const S = (p) => [a0 + p[0] * k, y0 + p[1] * k];
  flat(bag, RED, F, ellipse(0, 0.62, 0.78, 0.36, 16).map(S));                                  // body
  flat(bag, RED, F, [[0.45, 0.55], [0.95, 0.78], [1.18, 0.7], [1.2, 0.5], [0.9, 0.42], [0.55, 0.38]].map(S));    // head and neck
  flat(bag, RED, F, [[-0.7, 0.8], [-0.45, 0.98], [-0.2, 0.9], [-0.3, 0.7]].map(S));            // the hump
  flat(bag, RED, F, [[1.0, 0.78], [0.98, 0.95], [1.12, 1.1], [1.08, 0.97], [1.1, 0.78]].map(S));   // horn
  flat(bag, RED, F, [[1.12, 0.74], [1.28, 0.86], [1.4, 0.82], [1.3, 0.76], [1.18, 0.7]].map(S));  // horn, the far one
  for (const x of [-0.6, -0.3, 0.3, 0.6]) flat(bag, RED, F, [[x - 0.05, 0.4], [x + 0.05, 0.4], [x + 0.04, 0], [x - 0.04, 0]].map(S));   // legs
  flat(bag, RED, F, [[-0.76, 0.62], [-0.95, 0.4], [-0.9, 0.34], [-0.72, 0.52]].map(S));        // tail
  // the hunters: tiny black figures, arms up, round the beast
  for (const [x, y] of [[-1.15, 1.0], [-0.9, 0.12], [0.2, 1.25], [0.75, 1.15], [1.45, 0.45], [1.2, 0.02], [-0.2, -0.05]]) {
    const q = 0.1 * (0.9 + rand() * 0.3);
    flat(bag, BLK, F, [[x - q * 0.35, y + 0.55 * q], [x + q * 0.35, y + 0.55 * q], [x + q * 0.2, y - q], [x - q * 0.2, y - q]].map(S));
    flat(bag, BLK, F, [[x - q * 0.9, y + 1.5 * q], [x - q * 0.3, y + 0.55 * q], [x + q * 0.3, y + 0.55 * q], [x + q * 0.9, y + 1.5 * q], [x + q * 0.7, y + 0.5 * q], [x - q * 0.7, y + 0.5 * q]].map(S));
    flat(bag, BLK, F, ellipse(x, y + 0.8 * q, q * 0.28, q * 0.28, 6).map(S));
  }
}
/** A row of zig-zag triangles (the kilim-like bands of the walls) from a to b at heights y0..y1. */
function zigzag(bag, mat, F, a, b, y0, y1, n) {
  const w = (b - a) / n;
  for (let i = 0; i < n; i++) flat(bag, mat, F, [[a + i * w, y0], [a + (i + 1) * w, y0], [a + (i + 0.5) * w, y1]], 0.014);
}
/** A diamond lattice, outlined in black on a red ground. */
function diamonds(bag, F, a, b, y0, y1, n) {
  const w = (b - a) / n, h = (y1 - y0) / 2;
  flat(bag, RED, F, [[a, y0], [b, y0], [b, y1], [a, y1]], 0.011);
  for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) {
    const cx = a + (i + 0.5) * w, cy = y0 + (r + 0.5) * h;
    flat(bag, BLK, F, [[cx - w * 0.46, cy], [cx, cy - h * 0.46], [cx + w * 0.46, cy], [cx, cy + h * 0.46]], 0.013);
    flat(bag, PLS, F, [[cx - w * 0.3, cy], [cx, cy - h * 0.3], [cx + w * 0.3, cy], [cx, cy + h * 0.3]], 0.015);
  }
}
/** Hand prints in red (a palm and four fingers), a row of them. */
function hands(bag, F, a, y, n, k = 1) {
  for (let i = 0; i < n; i++) {
    const x = a + i * 0.22 * k, yy = y + (i % 2) * 0.05;
    flat(bag, RED, F, ellipse(x, yy, 0.045 * k, 0.055 * k, 8), 0.012);
    for (let f = 0; f < 4; f++) flat(bag, RED, F, [[x - 0.045 * k + f * 0.03 * k, yy + 0.04 * k], [x - 0.02 * k + f * 0.03 * k, yy + 0.04 * k], [x - 0.03 * k + f * 0.03 * k, yy + (0.13 - Math.abs(f - 1.5) * 0.015) * k]], 0.012);
  }
}

/**
 * A bucranium: the cow's skull plastered white on a pedestal of plaster, the two horns standing out of it, curving up and in,
 * its base at (x, y, z) on a wall whose normal into the room is `yaw` (local +z outward). Horns 0.9 m across.
 */
function bucranium(bag, x, y, z, yaw, k = 1, ped = true) {
  const parts = [];
  if (ped) parts.push([PLS, box(-0.2 * k, -0.45 * k, -0.02, 0.2 * k, 0.04 * k, 0.26 * k)]);       // the pedestal built out of the wall
  parts.push([BONE, lathe([[0.001, -0.1], [0.12, -0.08], [0.16, 0.06], [0.1, 0.2], [0.05, 0.3], [0.001, 0.31]], 10).scale(1.0 * k, 1, 0.75 * k).translate(0, 0.04 * k, 0.2 * k)]);
  for (const s of [-1, 1]) {
    let prev = null;
    for (let i = 0; i <= 6; i++) {
      const t = i / 6, p = [s * (0.1 + 0.4 * Math.sin(t * 1.25)) * k, (0.2 + 0.05 * t + 0.22 * t * t) * k, (0.22 + 0.05 * Math.sin(t * 3.1)) * k];
      if (prev) parts.push([HORN, rod(prev, p, (0.055 - 0.04 * t) * k, 7)]);
      prev = p;
    }
  }
  for (const [m, g] of parts) bag.add(m, place(g, x, y, z, yaw));
}

/** A hatch on a roof at (x, z): a low coaming of mud round the hole, soot on its inner face, the ladder standing up out of it. */
function hatch(bag, x, top, z, rand, lean) {
  const r = 0.45, t = 0.16, hc = 0.2;
  for (const [x0, z0, x1, z1] of [[x - r - t, z - r - t, x + r + t, z - r], [x - r - t, z + r, x + r + t, z + r + t], [x - r - t, z - r, x - r, z + r], [x + r, z - r, x + r + t, z + r]]) bag.add(MUD, box(x0, top - 0.03, z0, x1, top + hc, z1));
  bag.add('opening', box(x - r, top - 0.3, z - r, x + r, top + 0.02, z + r));
  const d = rand() < 0.5 ? 1 : -1;
  ladder(bag, x - 0.1, top - 1.9, z + d * (lean ? 0.35 : 0.1), 1.9, 0, -d, 0.35, 1.05);
}

/** A thin box laid along a face: u0..u1 along it from a, y0..y1, standing off by `off` on the normal side. */
function onFace(bag, mat, a, b, nx, nz, u0, u1, y0, y1, off) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const ax = a[0] + ux * u0, az = a[1] + uz * u0, bx = a[0] + ux * u1, bz = a[1] + uz * u1;
  bag.add(mat, box(Math.min(ax, bx, ax + nx * off), y0, Math.min(az, bz, az + nz * off), Math.max(ax, bx, ax + nx * off), y1, Math.max(az, bz, az + nz * off)));
}


export { WALL, MUD, PLS, LIME, RED, BLK, LOG, REED, BONE, HORN, ASH, rng, flip, ladder, dome, basket, jar, frame, flat, ellipse, aurochs, zigzag, diamonds, hands, bucranium, hatch, onFace };
