// Çatalhöyük, c. 6500 BC (docs/settlements/catalhoyuk.md §4–§5): houses of sun-dried mudbrick built wall to wall
// with no street between them, entered by ladder through the hatch in the flat mud roof; inside, a main room with the
// hearth and the oven under the hatch, raised plastered platforms along the north and east walls, white plaster, red
// paint, murals, bucrania (cattle horns set in plaster pedestals and pillars), a small storeroom through a low opening.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, place } from '../../core/geom.js';
import '../qing/index.js';

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
function flat(bag, mat, F, pts, d = 0.012) {
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

/**
 * catal_quarter: the packed town { x0, z0, cols (widths), rows (depths), kind[i][j] ('h' house, 'm' midden, 'c' court, 'L' the
 * landmark's cell (built by catal_house), '.' nothing), tops[i][j], seed }. Each house a block of mudbrick under a flat mud roof, the
 * faces that stand free eroded at the foot and patched with new plaster, a low lip round the roof edge, a hatch with its ladder
 * (and on those at the edge a ladder up from the ground), now and then a roof oven, baskets, reed bundles, hides drying.
 */
function quarter(el, { bag, col }) {
  const rand = rng(el.seed || 1), C = el.cols, R = el.rows, K = el.kind, T = el.tops;
  const X = (j) => el.x0 + C.slice(0, j).reduce((a, b) => a + b, 0), Z = (i) => el.z0 + R.slice(0, i).reduce((a, b) => a + b, 0);
  const topAt = (i, j) => (K[i]?.[j] === 'h' || K[i]?.[j] === 'L' ? T[i][j] : 0);
  for (let i = 0; i < R.length; i++) for (let j = 0; j < C.length; j++) {
    const k = K[i][j];
    if (k === '.' || k === 'L') continue;
    const x0 = X(j), z0 = Z(i), x1 = x0 + C[j], z1 = z0 + R[i], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (k === 'm') { midden(bag, x0, z0, x1, z1, rand); continue; }
    if (k === 'c') { court(bag, col, x0, z0, x1, z1, rand); continue; }
    const top = T[i][j];
    bag.add(WALL, box(x0, -0.3, z0, x1, top, z1));
    bag.add(MUD, box(x0 + 0.01, top, z0 + 0.01, x1 - 0.01, top + 0.09, z1 - 0.01));
    col.rect([x0, z0, x1, z1], 0, top); col.floor([x0, z0, x1, z1], top + 0.09);
    // the faces that stand free: a low lip on the roof edge, the foot eroded, patches of new plaster, soot above a vent
    for (const [di, dj, a, b, nx, nz] of [[-1, 0, [x0, z0], [x1, z0], 0, -1], [1, 0, [x0, z1], [x1, z1], 0, 1], [0, -1, [x0, z0], [x0, z1], -1, 0], [0, 1, [x1, z0], [x1, z1], 1, 0]]) {
      const m = topAt(i + di, j + dj), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (m >= top - 0.3 && m > 0) continue;
      // the lip along an edge with a drop beyond it
      const t = 0.18; onFace(bag, MUD, a, b, -nx, -nz, 0, L, top + 0.05, top + 0.2, t);
      onFace(bag, 'banco_rough', a, b, nx, nz, 0, L, -0.3, 0.3 + rand() * 0.25, 0.05);                       // eroded and re-mudded foot
      if (rand() < 0.7) { const u0 = rand() * L * 0.6, u1 = Math.min(L, u0 + 0.8 + rand() * 1.6), y0 = 0.5 + rand() * (top - 1.5); onFace(bag, rand() < 0.5 ? 'plaster_grey' : MUD, a, b, nx, nz, u0, u1, y0, Math.min(top - 0.1, y0 + 0.5 + rand() * 0.9), 0.014); }
      if (rand() < 0.3) { const u0 = rand() * (L - 0.3); onFace(bag, 'pottery_dark', a, b, nx, nz, u0, u0 + 0.25, top - 1.2 - rand() * 0.6, top - 0.02, 0.012); }   // soot streak from a roof vent
      if (m === 0 && rand() < 0.35) {                                                                       // fallen mud brick at the foot
        const u = rand() * (L - 0.6), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
        const g = lathe([[0.001, -0.02], [0.9, 0], [1, 0.2], [0.6, 0.7], [0.001, 1]], 6); g.scale(0.45, 0.2, 0.3).rotateY(rand() * 6).translate(a[0] + ux * u + nx * 0.4, 0, a[1] + uz * u + nz * 0.4); bag.add('banco_rough', g);
      }
    }
    // on the roof: the hatch with its ladder, and what a household keeps up there
    const hx = x0 + C[j] * (0.3 + rand() * 0.35), hz = z0 + R[i] * (0.3 + rand() * 0.35), ty = top + 0.09;
    hatch(bag, hx, ty, hz, rand, rand() < 0.4);
    col.rect([hx - 0.6, hz - 0.6, hx + 0.6, hz + 0.6], ty, ty + 0.2);
    const r = rand(), ox = hx > cx ? -1 : 1, oz = hz > cz ? -1 : 1, px = hx + ox * (1.4 + rand() * 0.8), pz = hz + oz * (1.2 + rand() * 0.9);
    if (r < 0.28) { dome(bag, MUD, px, ty, pz, 0.62, 0.62, 1.2, 0.95, rand() * 3); bag.add('opening', box(px - 0.2, ty + 0.12, pz - 0.65, px + 0.2, ty + 0.4, pz - 0.5)); col.circle(px, pz, 0.7, ty, ty + 0.6); }      // a roof oven
    else if (r < 0.5) { basket(bag, px, ty, pz, 0.24, rand() < 0.5 ? 'cloth_ochre' : 'reed_mat'); basket(bag, px + 0.5, ty, pz + 0.2, 0.2); }
    else if (r < 0.65) { for (let q = 0; q < 6; q++) bag.add('thatch', rod([px + q * 0.09, ty, pz], [px + q * 0.09 + 0.15, ty + 1.3, pz + 0.08], 0.03, 5)); bag.add('rope_fibre', rod([px - 0.05, ty + 0.6, pz], [px + 0.6, ty + 0.65, pz + 0.05], 0.015, 4)); }   // a bundle of reeds
    else if (r < 0.78) { for (const [dx, dz, m] of [[0, 0, 'hide_tan'], [0.9, 0.3, 'hide_brown'], [0.2, 0.9, 'hide_white']]) bag.add(m, box(px + dx, ty, pz + dz, px + dx + 0.8, ty + 0.025, pz + dz + 0.55)); }          // hides pegged to dry
    else if (r < 0.9) { jar(bag, px, ty, pz, 1.1); jar(bag, px + 0.55, ty, pz + 0.1, 0.8, 'pottery_dark'); }
    // a ladder up from the ground on some houses at the edge of the town
    const free = (di, dj) => !topAt(i + di, j + dj) && K[i + di]?.[j + dj] !== 'c' && K[i + di]?.[j + dj] !== 'm';
    for (const [di, dj, side] of [[1, 0, 's'], [-1, 0, 'n'], [0, 1, 'e'], [0, -1, 'w']]) {
      if (!free(di, dj) || K[i + di]?.[j + dj] !== undefined && K[i + di][j + dj] !== '.') continue;
      if (rand() > 0.3) continue;
      const len = 1.2;
      const f = side === 's' ? { x: x0 + C[j] * (0.2 + rand() * 0.6), z: z1, dx: 0, dz: 1, rect: (x) => [x - 0.45, z1, x + 0.45, z1 + len], dir: 'n' }
        : side === 'n' ? { x: x0 + C[j] * (0.2 + rand() * 0.6), z: z0, dx: 0, dz: -1, rect: (x) => [x - 0.45, z0 - len, x + 0.45, z0], dir: 's' }
        : side === 'e' ? { x: x1, z: z0 + R[i] * (0.2 + rand() * 0.6), dx: 1, dz: 0, rect: (z) => [x1, z - 0.45, x1 + len, z + 0.45], dir: 'w' }
          : { x: x0, z: z0 + R[i] * (0.2 + rand() * 0.6), dx: -1, dz: 0, rect: (z) => [x0 - len, z - 0.45, x0, z + 0.45], dir: 'e' };
      const along = f.dx ? f.z : f.x;
      ladder(bag, f.x + (f.dx ? f.dx * len : 0), 0, f.z + (f.dz ? f.dz * len : 0), top + 0.09, -f.dx, -f.dz, len, 1.0);
      col.ramp(f.rect(along), 0, top + 0.09, f.dir);
      break;
    }
  }
}
/** A midden: a heap of ash, burnt earth, bones and sherds, dark against the pale mud, with sprawling grey drifts. */
function midden(bag, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let q = 0; q < 5; q++) {
    const x = cx + (rand() - 0.5) * (x1 - x0) * 0.6, z = cz + (rand() - 0.5) * (z1 - z0) * 0.6, r = 0.9 + rand() * 1.3;
    dome(bag, q % 2 ? ASH : 'silt', x, -0.1, z, r, 0.45 + rand() * 0.55, 1 + rand() * 0.4, 1, rand() * 3, 0.12);
  }
  for (let q = 0; q < 26; q++) {
    const x = cx + (rand() - 0.5) * (x1 - x0) * 0.8, z = cz + (rand() - 0.5) * (z1 - z0) * 0.8, y = 0.25 + rand() * 0.5, a = rand() * 6;
    if (rand() < 0.5) bag.add(BONE, rod([x, y, z], [x + Math.cos(a) * 0.22, y + 0.04, z + Math.sin(a) * 0.22], 0.02, 4));
    else bag.add(rand() < 0.5 ? 'terracotta' : 'obsidian', box(x, y, z, x + 0.1, y + 0.03, z + 0.07));
  }
}
/** A court: open ground between houses with a domed baking oven on the ground, a mud bench, baskets, a grinding stone. */
function court(bag, col, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('banco_smooth', box(x0 + 0.2, -0.3, z0 + 0.2, x1 - 0.2, 0.03, z1 - 0.2));          // trodden, plastered earth
  dome(bag, MUD, cx - 1.1, 0.02, cz - 0.6, 0.8, 0.85, 1.25, 1, 0.4); bag.add('opening', box(cx - 1.3, 0.14, cz - 0.05, cx - 0.9, 0.45, cz + 0.08));
  col.circle(cx - 1.1, cz - 0.6, 0.85, 0, 0.8);
  bag.add(MUD, box(x1 - 1.6, 0, cz - 1.5, x1 - 0.9, 0.42, cz + 0.6)); col.rect([x1 - 1.6, cz - 1.5, x1 - 0.9, cz + 0.6], 0, 0.42);
  basket(bag, cx + 0.8, 0.03, cz + 1.0, 0.25, 'cloth_ochre'); basket(bag, cx + 1.3, 0.03, cz + 0.6, 0.2);
  bag.add('granite_rough', box(cx - 0.4, 0.03, cz + 1.2, cx + 0.3, 0.12, cz + 1.7));
  bag.add('granite_rough', lathe([[0.001, 0], [0.12, 0.01], [0.1, 0.07], [0.001, 0.08]], 8, null, cx - 0.1, 0.12, cz + 1.45));
  for (let q = 0; q < 3; q++) jar(bag, x0 + 0.7 + q * 0.5, 0.03, z0 + 0.7 + rand() * 0.2, 1 - q * 0.1, q ? 'pottery_dark' : 'terracotta');
}

/**
 * catal_pen: a hurdle pen for sheep and cattle { rect, gate ('n'|'s'|'e'|'w': the side with the gap) }: posts of poplar every 1.3 m, wattle
 * woven between them to 1.2 m, the ground inside trodden and dark with dung, a mud trough [inferred: Wikipedia states penned animals].
 */
function pen(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(Math.round(x0 * 3 + z0));
  bag.add('silt', box(x0, -0.3, z0, x1, 0.02, z1));
  const sides = [['n', [x0, z0], [x1, z0]], ['s', [x0, z1], [x1, z1]], ['w', [x0, z0], [x0, z1]], ['e', [x1, z0], [x1, z1]]];
  for (const [id, a, b] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L / 1.3), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const gap = id === el.gate ? [L / 2 - 1.1, L / 2 + 1.1] : [-1, -1];
    for (let i = 0; i <= n; i++) {
      const u = i / n * L; if (u > gap[0] && u < gap[1]) continue;
      bag.add(LOG, rod([a[0] + ux * u, -0.2, a[1] + uz * u], [a[0] + ux * u, 1.35 + rand() * 0.15, a[1] + uz * u], 0.055, 6));
    }
    for (const [y0, y1] of [[0.3, 0.42], [0.55, 0.67], [0.8, 0.92], [1.05, 1.17]]) {
      const segs = gap[0] > 0 ? [[0, gap[0]], [gap[1], L]] : [[0, L]];
      for (const [u0, u1] of segs) onFace(bag, 'wicker', a, b, 0, 0, u0, u1, y0, y1, 0.07);
    }
    for (const [u0, u1] of (gap[0] > 0 ? [[0, gap[0]], [gap[1], L]] : [[0, L]])) col.segment([a[0] + ux * u0, a[1] + uz * u0], [a[0] + ux * u1, a[1] + uz * u1], 0.2, 0, 1.3);
  }
  bag.add(MUD, box(x0 + 1, 0, (z0 + z1) / 2 - 0.2, x0 + 4, 0.35, (z0 + z1) / 2 + 0.2));
  dome(bag, ASH, x1 - 2, 0, z1 - 2, 1.0, 0.25, 1.4, 1, 1, 0.1);
}

/**
 * catal_house: the landmark, a house of the town opened { rect [x0, z0, x1, z1] (8.4 × 6.8 m), top (the roof, 2.5 m), seed }: walls
 * 0.45 m thick, a main room 4.9 × 5.9 m and a storeroom beside it through a low opening in the partition. The hatch in the roof is
 * the door and the smoke hole; a ladder stands under it from the floor, another against the south wall outside; under it a hearth and,
 * against the south wall, the domed oven; platforms 0.45 m high along the north and east walls plastered white and spread with mats, burials
 * beneath; bucrania on pedestals in the north wall and the pillar; red paint on the walls, the aurochs and hunters on the west, bands of
 * zig-zag and diamonds above the platforms; the storeroom with its mud bins of grain, jars, baskets and the grinding stone.
 */
function house(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5), ST = el.top ?? 2.5, T = 0.45, F = 0.05, CH = 2.1;
  const ix0 = x0 + T, iz0 = z0 + T, ix1 = x1 - T, iz1 = z1 - T, mx1 = ix0 + 4.9, sx0 = mx1 + 0.4;
  const lx = (u) => ix0 + u, lz = (v) => iz0 + v;
  const hole = [lx(0.8), lz(3.9), lx(2.4), lz(4.9)], PL = 0.025;
  // the outer walls, a floor of plaster, the partition with its low opening (v 4.2…5.0, 1.85 m high)
  for (const [a, b, c, d] of [[x0, z0, x1, iz0], [x0, iz1, x1, z1], [x0, iz0, ix0, iz1], [ix1, iz0, x1, iz1]]) { bag.add(WALL, box(a, -0.3, b, c, ST, d)); col.rect([a, b, c, d], 0, ST); }
  const part = [[mx1, iz0, sx0, lz(4.2), CH], [mx1, lz(5.0), sx0, iz1, CH], [mx1, lz(4.2), sx0, lz(5.0), 0]];
  for (const [a, b, c, d] of part.slice(0, 2)) { bag.add(WALL, box(a, 0, b, c, ST, d)); col.rect([a, b, c, d], 0, ST); }
  bag.add(WALL, box(mx1, 1.85, lz(4.2), sx0, ST, lz(5.0))); col.rect([mx1, lz(4.2), sx0, lz(5.0)], 1.85, ST);
  bag.add(LOG, box(mx1 - 0.03, 1.78, lz(4.2) - 0.05, sx0 + 0.03, 1.87, lz(5.0) + 0.05));      // the lintel pole
  bag.add(PLS, box(ix0, -0.25, iz0, ix1, F, iz1)); col.floor([ix0, iz0, ix1, iz1], F);
  // the plaster of the walls: white, 2.5 cm, cut at the partition
  const L = [[ix0, iz0, ix1, iz0 + PL], [ix0, iz1 - PL, ix1, iz1], [ix0, iz0, ix0 + PL, iz1], [ix1 - PL, iz0, ix1, iz1], [mx1 - PL, iz0, mx1, lz(4.2)], [mx1 - PL, lz(5.0), mx1, iz1], [sx0, iz0, sx0 + PL, lz(4.2)], [sx0, lz(5.0), sx0 + PL, iz1]];
  for (const [a, b, c, d] of L) bag.add(PLS, box(a, F, b, c, CH, d));
  // the roof: reed mat under, beams across (clear of the hatch), mud over, the hatch's coaming
  const slab = [[ix0 - T, iz0 - T, ix1 + T, hole[1]], [x0, hole[3], x1, z1], [x0, hole[1], hole[0], hole[3]], [hole[2], hole[1], x1, hole[3]]];
  for (const r of slab) { bag.add(REED, box(r[0], CH, r[1], r[2], CH + 0.1, r[3])); bag.add(MUD, box(r[0], CH + 0.1, r[1], r[2], ST + 0.09, r[3])); col.floor([r[0], r[1], r[2], r[3]], ST + 0.09); }
  for (let u = 0.35; u < 7.3; u += 0.78) {
    const bx = lx(u); if (bx > hole[0] - 0.1 && bx < hole[2] + 0.1 && u < 4.2) continue;
    const mid = bx > mx1 - 0.1 && bx < sx0 + 0.1;
    bag.add(LOG, rod([bx, CH - 0.07, iz0 + 0.02], [bx + (rand() - 0.5) * 0.03, CH - 0.07, iz1 - 0.02], 0.085 + rand() * 0.02, 8)); void mid;
  }
  for (const s of [-1, 1]) bag.add(LOG, rod([hole[0] - 0.1, CH - 0.06, (s < 0 ? hole[1] : hole[3]) + s * 0.07], [hole[2] + 0.1, CH - 0.06, (s < 0 ? hole[1] : hole[3]) + s * 0.07], 0.06, 6));
  const rim = [[hole[0] - 0.22, hole[1] - 0.22, hole[2] + 0.22, hole[1]], [hole[0] - 0.22, hole[3], hole[2] + 0.22, hole[3] + 0.22], [hole[0] - 0.22, hole[1], hole[0], hole[3]], [hole[2], hole[1], hole[2] + 0.22, hole[3]]];
  for (const r of rim) { bag.add(MUD, box(r[0], ST + 0.05, r[1], r[2], ST + 0.27, r[3])); col.rect(r, ST + 0.09, ST + 0.27); }
  for (const [a, b, c, d] of [[hole[0], hole[1] - 0.02, hole[2], hole[1] - 0.01]]) bag.add('pottery_dark', box(a, CH + 0.1, b, c, ST + 0.05, d));   // soot on the hatch's inner face
  // the roof's edge: a low lip
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + 0.18], [x0, z1 - 0.18, x1, z1], [x0, z0, x0 + 0.18, z1], [x1 - 0.18, z0, x1, z1]]) bag.add(MUD, box(a, ST + 0.09, b, c, ST + 0.2, d));
  // the ladder inside under the hatch, standing up through it; and the ramp one climbs it by
  ladder(bag, lx(1.95), F, hole[3] - 0.08, ST - F, 0, -1, 0.98, 0.9);
  col.ramp([lx(1.5), hole[1], lx(2.4), hole[3]], F, ST + 0.09, 'n');
  // outside, against the south wall: the ladder up from the ground
  const lxo = (x0 + x1) / 2;
  ladder(bag, lxo, 0, z1 + 1.25, ST + 0.09, 0, -1, 1.25, 1.0);
  col.ramp([lxo - 0.45, z1, lxo + 0.45, z1 + 1.25], 0, ST + 0.09, 'n');
  // ---- the main room ----
  // platforms, plastered, with their mats, burials' lids; hearth; oven
  const PH = 0.45;
  const plat = [[ix0, iz0, mx1, lz(1.5)], [lx(3.5), lz(1.5), mx1, lz(3.7)]];
  for (const r of plat) { bag.add(PLS, box(r[0], F, r[1], r[2], PH, r[3])); bag.add(LIME, box(r[0] - 0.02, PH - 0.03, r[1] - 0.02, r[2], PH + 0.005, r[3] + 0.02)); col.rect(r, F, PH); }
  for (const [a, b, c, d, m] of [[lx(0.3), lz(0.2), lx(2.0), lz(1.2), REED], [lx(2.2), lz(0.25), lx(4.5), lz(1.25), REED], [lx(3.7), lz(1.8), lx(4.7), lz(3.4), REED]]) bag.add(m, box(a, PH + 0.005, b, c, PH + 0.03, d));
  bag.add('hide_tan', box(lx(0.35), PH + 0.03, lz(0.25), lx(1.1), PH + 0.07, lz(1.1)));
  bag.add('hide_white', box(lx(3.8), PH + 0.03, lz(1.9), lx(4.5), PH + 0.06, lz(3.0)));
  bag.add('hide_grey', box(lx(2.6), PH + 0.03, lz(0.3), lx(3.3), PH + 0.06, lz(1.15)));
  // the lid of a burial: a patch of fresh plaster on the platform, and a painted skull set on the east platform
  bag.add('plaster_grey', box(lx(3.7), PH, lz(3.45), lx(4.8), PH + 0.015, lz(3.68)));
  bag.add(BONE, lathe([[0.001, 0], [0.07, 0.01], [0.095, 0.08], [0.08, 0.16], [0.04, 0.2], [0.001, 0.21]], 10, null, lx(4.45), PH + 0.03, lz(3.5)));
  bag.add(RED, lathe([[0.097, 0.1], [0.097, 0.13], [0.092, 0.13], [0.092, 0.1]], 10, null, lx(4.45), PH + 0.03, lz(3.5)));
  // the pillar, plastered, at the corner of the platforms, with a bucranium on its south face
  const pil = [lx(3.15), lz(1.5), lx(3.5), lz(1.85)];
  bag.add(PLS, box(pil[0], F, pil[1], pil[2], CH, pil[3])); col.rect(pil, F, CH);
  bucranium(bag, (pil[0] + pil[2]) / 2, 1.55, pil[3], 0, 0.9);
  // the north wall: red wash with white margins, a zig-zag band, three bucrania on pedestals above the platform
  const FN = frame([ix0, iz0], [1, 0], [0, 1]);
  flat(bag, RED, FN, [[0, PH], [4.9, PH], [4.9, 1.72], [0, 1.72]], 0.008);
  zigzag(bag, BLK, FN, 0.1, 4.8, 1.76, 2.04, 20);
  for (const u of [0.95, 2.3, 3.8]) bucranium(bag, lx(u), 1.15, iz0 + PL, 0, 1.0);
  hands(bag, FN, 0.35, 0.8, 3, 1);
  // the east face of the partition over the east platform: diamonds, and a bucranium at the platform's south end
  const FE = frame([mx1, iz0], [0, 1], [-1, 0]);
  diamonds(bag, FE, 1.6, 3.6, 0.85, 1.85, 5);
  bucranium(bag, mx1 - PL, 1.1, lz(2.2), -Math.PI / 2, 0.9);
  // the west wall: red band below, the aurochs and the hunters
  const FW = frame([ix0, iz0], [0, 1], [1, 0]);
  flat(bag, RED, FW, [[0.1, 0.35], [5.8, 0.35], [5.8, 0.55], [0.1, 0.55]], 0.008);
  aurochs(bag, FW, 2.0, 0.85, 1.35, rand);
  hands(bag, FW, 4.7, 1.5, 4, 1);
  // the south wall: white plaster, a red panel over the oven
  const FS = frame([ix0, iz1], [1, 0], [0, -1]);
  flat(bag, RED, FS, [[0.1, 0.9], [1.5, 0.9], [1.5, 1.7], [0.1, 1.7]], 0.008);
  bucranium(bag, lx(3.9), 1.3, iz1 - PL, Math.PI, 0.85);
  // hearth under the hatch (a ring of plaster, ash, a small fire), the oven in the south wall's corner, a mat of reeds before them
  const hx = lx(1.1), hz = lz(4.4);
  bag.add(LIME, lathe([[0.4, 0], [0.4, 0.1], [0.3, 0.1], [0.3, 0.04], [0.001, 0.04]], 14, null, hx, F, hz));
  bag.add(ASH, lathe([[0.3, 0.055], [0.001, 0.06]], 12, null, hx, 0, hz));
  for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4; bag.add('bark_dark', rod([hx + Math.cos(a) * 0.24, F + 0.08, hz + Math.sin(a) * 0.24], [hx + Math.cos(a) * 0.03, F + 0.12, hz + Math.sin(a) * 0.03], 0.025, 5)); }
  bag.add('flame', lathe([[0.1, 0], [0.08, 0.08], [0.04, 0.2], [0.001, 0.3]], 8, (t) => 1 + 0.25 * Math.sin(t * 3), hx, F + 0.08, hz));
  col.circle(hx, hz, 0.42, F, F + 0.12);
  const ox = lx(0.75), oz = iz1 - 0.6;
  dome(bag, MUD, ox, F, oz, 0.55, 0.78, 1.0, 1.0, 0, 0.02);
  bag.add('opening', box(ox + 0.25, F + 0.15, oz - 0.25, ox + 0.6, F + 0.5, oz + 0.25));
  col.circle(ox, oz, 0.6, F, F + 0.78);
  for (let q = 0; q < 3; q++) bag.add('hide_tan', box(ox + 0.7, F, oz - 0.25 + q * 0.0, ox + 1.1, F + 0.02 + q * 0.02, oz + 0.2));      // flat loaves by the oven's mouth
  bag.add(REED, box(lx(0.3), F, lz(2.6), lx(2.6), F + 0.012, lz(3.6)));                                   // a mat of reeds on the floor
  for (let k = 0; k < 4; k++) bag.add(rand() < 0.5 ? 'cloth_ochre' : 'hide_brown', box(lx(0.35 + k * 0.5), F + 0.012, lz(2.7), lx(0.8 + k * 0.5), F + 0.04, lz(3.0)));
  jar(bag, lx(0.45), F, lz(1.95), 1.2); jar(bag, lx(3.0), F, lz(4.9), 1.0, 'pottery_dark'); basket(bag, lx(3.9), F, lz(5.3), 0.26, 'cloth_ochre');
  col.circle(lx(0.45), lz(1.95), 0.3, F, 0.5);
  // ---- the storeroom ----
  const sx1 = ix1, bx = sx1 - 1.05;
  for (const [a, b, c, d] of [[bx, lz(0.3), sx1, lz(1.6)], [bx, lz(2.0), sx1, lz(3.3)]]) {
    for (const [p, q, r, s] of [[a, b, c, b + 0.1], [a, d - 0.1, c, d], [a, b + 0.1, a + 0.1, d - 0.1], [c - 0.1, b + 0.1, c, d - 0.1]]) bag.add(MUD, box(p, F, q, r, 0.75, s));
    bag.add(rand() < 0.5 ? 'cloth_ochre' : 'paint_ochre', lathe([[0.001, 0.55], [0.5, 0.55], [0.38, 0.7], [0.001, 0.82]], 10, null, (a + c) / 2, F, (b + d) / 2).scale(1, 1, 1));
    col.rect([a, b, c, d], F, 0.75);
  }
  for (let q = 0; q < 3; q++) jar(bag, sx0 + 0.4 + (q % 2) * 0.1, F, lz(0.5 + q * 0.75), 1.3 - q * 0.12, q === 1 ? 'pottery_dark' : 'terracotta');
  col.rect([sx0, lz(0.2), sx0 + 0.8, lz(2.6)], F, 0.6);
  bag.add('granite_rough', box(bx - 0.1, F, lz(5.1), bx + 0.8, F + 0.14, lz(5.6))); bag.add('granite_rough', box(bx + 0.05, F + 0.14, lz(5.2), bx + 0.5, F + 0.2, lz(5.45)));
  basket(bag, sx1 - 0.4, F, lz(4.3), 0.28, 'cloth_ochre'); basket(bag, sx1 - 0.45, F, lz(3.7), 0.22);
  bag.add(REED, rod([sx1 - 0.2, F, lz(5.6)], [sx1 - 0.2, F + 0.9, lz(5.6)], 0.1, 8)); bag.add(REED, rod([sx1 - 0.45, F, lz(5.7)], [sx1 - 0.45, F + 0.8, lz(5.7)], 0.09, 8));
  col.rect([bx - 0.1, lz(5.1), bx + 0.8, lz(5.6)], F, 0.2);
  // light: the fire's glow, the day through the hatch, the storeroom's dim lamp
  if (lights) {
    lights.push({ at: [hx, F + 0.6, hz], color: '#ff9a4a', intensity: 3, distance: 6 });
    lights.push({ at: [lx(1.6), CH - 0.2, lz(2.8)], color: '#fff1d6', intensity: 2.2, distance: 7 });
    lights.push({ at: [(sx0 + sx1) / 2, 1.8, lz(3)], color: '#ffe0b0', intensity: 1.2, distance: 5 });
  }
}

registerStyle('catal', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, catal_quarter: quarter, catal_house: house, catal_pen: pen },
  objects: {},
});
