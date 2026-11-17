// The house of the Deir el-Medina plan (docs/settlements/abu-simbel.md §16): a front room with the raised plastered bed (lit clos) painted with Bes
// above it and a niche with a stela, a door through the cross wall into the back room, the kitchen and store with the oven, the quern, the granary,
// jars sunk in the floor, a cellar lid, and the steep stair along the back wall up to the roof through a hatch; the roof furnished. Four fronts by rule:
// the plain painted door, the porch of two palm columns, the stone doorframe with the name plaque and the barred window, the reed awning on its bench.
// { rect, seed, front ('s' | 'n'), furnish, wash, variant (0-3), rich (the bedroom of the deep lots) }. Front to the south in its own frame.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { figure } from '../egyptian/objects.js';
import { mirrored } from './mirror.js';
import { rng } from './util.js';

const H = 3.0, TH = 0.45, ROOF = H + 0.3, STEPS = 13, TREAD = 0.26, SW = 0.85;
const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const jar = (bag, x, y, z, s = 1, mat = 'terracotta') => bag.add(mat, lathe(JAR.map(([r, h]) => [r * s, h * s]), 9, null, x, y, z));
const post = (bag, x, y0, y1, z, r = 0.05) => bag.add('palm_trunk', lathe([[r, y0], [r * 0.9, y1], [0.001, y1]], 6, null, x, 0, z));

/** A palm column on a stone base with a bud capital, from y0 to y1. */
function column(bag, col, x, z, y0, y1, r = 0.17) {
  bag.add('limestone_core', lathe([[r * 1.7, y0], [r * 1.7, y0 + 0.1], [r * 1.2, y0 + 0.16], [0.001, y0 + 0.16]], 10, null, x, 0, z));
  bag.add('palm_trunk', lathe([[r, y0 + 0.15], [r * 0.85, y1 - 0.3], [0.001, y1 - 0.3]], 10, null, x, 0, z));
  bag.add('paint_ochre', lathe([[r * 0.9, y1 - 0.3], [r * 1.15, y1 - 0.22], [r * 1.25, y1 - 0.1], [r * 1.5, y1 - 0.02], [0.001, y1 - 0.02]], 10, null, x, 0, z));
  col.circle(x, z, r * 1.7, y0, y1);
}

export function dmHouse(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, c = el.front === 'n' ? mirrored(ctx, (z0 + z1) / 2) : ctx, { bag, col } = c;
  const rand = rng((el.seed || 1) * 5 + 3), W = x1 - x0, D = z1 - z0, variant = el.variant ?? 0, F = el.furnish !== false;
  const ix0 = x0 + TH / 2, ix1 = x1 - TH / 2, iz0 = z0 + TH / 2, iz1 = z1 - TH / 2, zf = z1 + TH / 2;
  const left = rand() < 0.5;                                                          // the door at the west or the east end of the front
  const xd = left ? x0 + 1.3 + rand() * 0.5 : x1 - 1.3 - rand() * 0.5, dw = 0.95;
  const fd = D > 6.8 ? 2.9 : 2.6, pz = iz1 - fd, pth = 0.3;                           // the cross wall's centre line
  const xp = xd < (x0 + x1) / 2 ? x1 - 1.9 : x0 + 1.9, pw = 0.9;                      // its doorway, at the other end
  const seg = (p, q, t = TH, mat = 'mud_plaster', y0 = 0, y1 = H) => { const T = []; beamTris(T, [p[0], y0, p[1]], [q[0], y0, q[1]], t / 2, y1 - y0); bag.add(mat, fromTriangles(T)); col.segment(p, q, t, y0, y1); };
  // ── the walls: the three blind ones, the front with its door, the cross wall with its doorway
  seg([x0 - TH / 2, z0], [x1 + TH / 2, z0]); seg([x0, z0 + TH / 2], [x0, z1 - TH / 2]); seg([x1, z0 + TH / 2], [x1, z1 - TH / 2]);
  seg([x0 - TH / 2, z1], [xd - dw / 2, z1]); seg([xd + dw / 2, z1], [x1 + TH / 2, z1]);
  seg([ix0, pz], [xp - pw / 2, pz], pth); seg([xp + pw / 2, pz], [ix1, pz], pth);
  for (const [a, b, z, t] of [[xd - dw / 2, xd + dw / 2, z1, TH], [xp - pw / 2, xp + pw / 2, pz, pth]]) {
    bag.add('timber', box(a - 0.22, 1.95, z - t / 2 - 0.02, b + 0.22, 2.12, z + t / 2 + 0.02));
    bag.add('mud_plaster', box(a - 0.02, 2.11, z - t / 2 + 0.01, b + 0.02, H - 0.01, z + t / 2 - 0.01));
    bag.add('limestone_core', box(a + 0.01, -0.05, z - t / 2 - 0.05, b - 0.01, 0.08, z + t / 2 + 0.05));
  }
  // the lane's dirt on the feet of the walls, the slits under the roof on the blind walls
  { const o = TH / 2, e = 0.012;
    [[x0 - o - e, z0 - o - e, x1 + o + e, z0 - o + 0.003, 0.45], [x0 - o - e, z0 - o, x0 - o + 0.003, z1 + o, 0.5], [x1 + o - 0.003, z0 - o, x1 + o + e, z1 + o, 0.55]]
      .forEach(([a, b, q, r, t]) => bag.add('banco_rough', box(a, -0.05, b, q, t, r)));
    for (const k of [0.3, 0.7]) { const cx = x0 + W * k; bag.add('pottery_dark', box(cx - 0.25, 2.1, z0 - o - 0.012, cx + 0.25, 2.35, z0 - o)); bag.add('timber', box(cx - 0.33, 2.35, z0 - o - 0.012, cx + 0.33, 2.42, z0 - o)); }
    for (const [x, s] of [[x0 - o - 0.012, -1], [x1 + o + 0.012, 1]]) for (const k of [0.3, 0.7]) { const cz = z0 + D * k; bag.add('pottery_dark', box(Math.min(x, x - s * 0.012), 2.1, cz - 0.25, Math.max(x, x - s * 0.012), 2.35, cz + 0.25)); }
  }
  // ── the roof: a slab of logs under mud with the hatch over the stair's upper steps, the parapet, the roof's things
  const sx0 = ix0, ax = sx0 + 3 * TREAD, bx = sx0 + STEPS * TREAD, hz1 = iz0 + SW;      // the hatch lies over x ax..bx, z iz0..hz1
  const slab = (a, b, q, r) => { bag.add('timber', box(a, H, b, q, H + 0.12, r)); bag.add('mud_plaster', box(a, H + 0.12, b, q, ROOF, r)); col.floor([a, b, q, r], ROOF); };
  const ex0 = x0 - 0.25, ex1 = x1 + 0.25, ez0 = z0 - 0.25, ez1 = z1 + 0.25;
  slab(ex0, ez0, ax, ez1); slab(bx, ez0, ex1, ez1); slab(ax, ez0, bx, iz0); slab(ax, hz1, bx, ez1);
  const P = 0.2, y = ROOF;                                                              // the parapet round the edge
  bag.add('mud_plaster', box(ex0, y, ez0, ex1, y + 0.22, ez0 + P)); bag.add('mud_plaster', box(ex0, y, ez1 - P, ex1, y + 0.22, ez1));
  bag.add('mud_plaster', box(ex0, y, ez0 + P, ex0 + P, y + 0.22, ez1 - P)); bag.add('mud_plaster', box(ex1 - P, y, ez0 + P, ex1, y + 0.22, ez1 - P));
  bag.add('timber', box((x0 + x1) / 2 - 0.06, y + 0.04, ez1, (x0 + x1) / 2 + 0.06, y + 0.1, ez1 + 0.5));      // the rain spout
  { // on the roof, in the south-east, clear of the hatch: a shade on four poles with a mat and a bench under it, jars, a mat with things drying
    const cx = x1 - 1.9, cz = z1 - 1.3;
    if (W > 5.4 && cx - 1.1 > bx + 0.3) {
      for (const [dx, dz] of [[-1.0, -0.7], [1.0, -0.7], [-1.0, 0.7], [1.0, 0.7]]) post(bag, cx + dx, y, y + 1.9, cz + dz, 0.04);
      bag.add('reed_mat', box(cx - 1.2, y + 1.9, cz - 0.9, cx + 1.2, y + 1.96, cz + 0.9));
      bag.add('mud_plaster', box(cx - 0.8, y, cz + 0.45, cx + 0.8, y + 0.36, cz + 0.8)); col.rect([cx - 0.8, cz + 0.45, cx + 0.8, cz + 0.8], y, y + 0.36);
      bag.add('reed_mat', box(cx - 0.6, y + 0.002, cz - 0.4, cx + 0.6, y + 0.02, cz + 0.4));
    }
    const mx = (x0 + x1) / 2 + 0.6, mz = z0 + 1.7 + rand() * 0.6;
    bag.add('reed_mat', box(mx - 0.7, y + 0.005, mz - 0.45, mx + 0.7, y + 0.025, mz + 0.45));
    for (let k = 0; k < 8; k++) bag.add(rand() < 0.6 ? 'cloth_ochre' : 'linen', box(mx - 0.6 + (k % 4) * 0.3, y + 0.025, mz - 0.3 + Math.floor(k / 4) * 0.38, mx - 0.6 + (k % 4) * 0.3 + 0.18, y + 0.055, mz - 0.3 + Math.floor(k / 4) * 0.38 + 0.22));
    for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) jar(bag, ex1 - 0.55 - k * 0.4, y, ez0 + 0.55, 0.85);
  }
  // ── the front, by rule
  front(c, variant, { x0, x1, z1, zf, xd, dw, rand, W });
  // the painted door: a lintel board and two jambs in the house's colour
  { const ac = ['paint_ochre', 'egyptian_blue', 'limewash_red', 'paint_ochre'][Math.floor(rand() * 4)];
    if (variant !== 2) { bag.add(ac, box(xd - dw / 2 - 0.3, 2.12, zf + 0.004, xd + dw / 2 + 0.3, 2.44, zf + 0.016)); for (const s of [-1, 1]) bag.add(ac, box(xd + s * (dw / 2 + 0.07) - 0.07, 0, zf + 0.004, xd + s * (dw / 2 + 0.07) + 0.07, 2.12, zf + 0.014)); }
    if (el.wash) for (const [a, b] of [[x0 - TH / 2, xd - dw / 2 - 0.37], [xd + dw / 2 + 0.37, x1 + TH / 2]]) if (b - a > 0.2) { bag.add('plaster_white', box(a, 0.4, zf + 0.002, b, 2.5, zf + 0.012)); bag.add('limewash_red', box(a, 0.0, zf + 0.002, b, 0.4, zf + 0.012)); } }
  if (!F) return;
  // ── the logs seen from beneath, over the front room, the back room, with the hatch cut out of them
  { const logs = []; for (let x = ix0 + 0.12; x < ix1 - 0.05; x += 0.26) {
      if (x > ax - 0.05 && x < bx) beamTris(logs, [x, H - 0.12, hz1], [x, H - 0.12, iz1], 0.1, 0.12); else beamTris(logs, [x, H - 0.12, iz0], [x, H - 0.12, iz1], 0.1, 0.12); }
    bag.add('palm_trunk', fromTriangles(logs)); }
  const lamp = (x, yy, z) => { bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.012], [0.085, 0.045], [0.08, 0.06], [0.05, 0.05], [0.001, 0.045]], 8, null, x, yy, z)); c.lights.push({ at: [x, yy + 0.12, el.front === 'n' ? z0 + z1 - z : z], color: '#ffb46b', intensity: 3, distance: 7 }); };
  // ── the front room: the raised bed against the side wall opposite the door, Bes painted over it, the niche with a stela on the cross wall, a column, a stool and a table
  { const east = xd < (x0 + x1) / 2, wx = east ? ix1 : ix0, dir = east ? -1 : 1, zA = pz + pth / 2 + 0.25, zB = Math.min(iz1 - 0.55, zA + 1.95), zm = (zA + zB) / 2;
    const bxa = east ? wx - 0.95 : wx, bxb = east ? wx : wx + 0.95;
    bag.add('mud_plaster', box(bxa, 0, zA, bxb, 0.55, zB)); col.rect([bxa, zA, bxb, zB], 0, 0.55);
    bag.add('reed_mat', box(bxa + 0.04, 0.552, zA + 0.05, bxb - 0.04, 0.568, zB - 0.05));
    bag.add('limestone_core', lathe([[0.001, 0], [0.09, 0.0], [0.03, 0.03], [0.03, 0.12], [0.1, 0.17], [0.11, 0.19], [0.001, 0.18]], 8).scale(1, 1, 0.45).translate(east ? wx - 0.7 : wx + 0.7, 0.568, zA + 0.3));
    // Bes, frontal, in ochre on a blue panel above the bed (the figure's plane is the wall's, facing into the room)
    const wp = (u, v, w) => [wx + dir * (0.012 + w), v, zm + u];
    bag.add('plaster_white', box(Math.min(wx + dir * 0.004, wx + dir * 0.012), 1.0, zm - 0.75, Math.max(wx + dir * 0.004, wx + dir * 0.012), 2.15, zm + 0.75));
    figure(bag, 'egyptian_blue', 'bes', wp, 0, 1.1, 0.95, 1, 0.03);
    // the niche on the cross wall: a framed panel with a small limestone stela and a lamp
    const nx = xd < (x0 + x1) / 2 ? (ix0 + xp - pw / 2) / 2 : (xp + pw / 2 + ix1) / 2, nz = pz + pth / 2 + 0.004;
    {
      bag.add('limewash_red', box(nx - 0.34, 1.05, nz, nx + 0.34, 1.75, nz + 0.012)); bag.add('plaster_white', box(nx - 0.28, 1.11, nz + 0.012, nx + 0.28, 1.69, nz + 0.024));
      bag.add('limestone_core', box(nx - 0.16, 1.15, nz + 0.024, nx + 0.16, 1.55, nz + 0.07)); bag.add('egyptian_blue', box(nx - 0.1, 1.2, nz + 0.07, nx + 0.1, 1.45, nz + 0.078));
      bag.add('limestone_core', box(nx - 0.3, 1.0, nz, nx + 0.3, 1.05, nz + 0.2)); lamp(nx + 0.15, 1.05, nz + 0.1);
    }
    if (W > 5.2) column(bag, col, (x0 + x1) / 2 + (east ? 0.25 : -0.25), pz + fd * 0.5 + 0.05, 0, H - 0.12);
    // a stool and a low table with bread and a bowl
    const tx = nx, tz = nz + 0.55;
    bag.add('timber', box(tx - 0.3, 0.38, tz - 0.3, tx + 0.3, 0.43, tz + 0.3)); for (const [dx, dz] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) bag.add('timber', box(tx + dx - 0.025, 0, tz + dz - 0.025, tx + dx + 0.025, 0.38, tz + dz + 0.025));
    col.rect([tx - 0.32, tz - 0.32, tx + 0.32, tz + 0.32], 0, 0.43);
    bag.add('terracotta', lathe([[0.001, 0], [0.08, 0.005], [0.17, 0.09], [0.16, 0.095], [0.07, 0.03], [0.001, 0.025]], 9, null, tx, 0.43, tz));
    for (const [dx, dz] of [[-0.15, 0.12], [0.12, -0.12]]) bag.add('limewash_yellow', lathe([[0.001, 0], [0.08, 0.01], [0.075, 0.05], [0.001, 0.06]], 8, null, tx + dx, 0.43, tz + dz));
    jar(bag, xd + (xd < (x0 + x1) / 2 ? 0.95 : -0.95), 0, iz1 - 0.3, 1.1);
  }
  // ── the back room: the stair up to the roof along the north wall, the oven, the granary, the quern, the jars sunk in the floor, a cellar lid
  for (let k = 0; k < STEPS; k++) bag.add(k % 4 === 3 ? 'limestone_core' : 'mudbrick', box(sx0 + k * TREAD, 0, iz0, sx0 + (k + 1) * TREAD, (k + 1) * ROOF / STEPS, hz1));
  col.ramp([sx0, iz0, sx0 + STEPS * TREAD, hz1], 0, ROOF, 'e');
  const bz1 = pz - pth / 2 - 0.15;                                                                      // the back room's south limit
  const ox = ix1 - 0.7, oz = iz0 + 0.7;
  bag.add('mudbrick', lathe([[0.55, 0], [0.56, 0.3], [0.45, 0.65], [0.25, 0.85], [0.001, 0.9]], 14, null, ox, 0, oz));
  bag.add('pottery_dark', box(ox - 0.18, 0.05, oz + 0.47, ox + 0.18, 0.4, oz + 0.53)); col.circle(ox, oz, 0.57, 0, 0.9);
  const gx = ox - 1.25, gz = iz0 + 1.2;
  if (gx > bx + 0.7) { bag.add('mud_plaster', lathe([[0.45, 0], [0.48, 0.45], [0.43, 0.9], [0.28, 1.2], [0.09, 1.3], [0.09, 1.34], [0.001, 1.34]], 12, null, gx, 0, gz)); bag.add('limestone_core', lathe([[0.001, 0], [0.12, 0], [0.11, 0.05], [0.001, 0.07]], 8, null, gx, 1.34, gz)); col.circle(gx, gz, 0.48, 0, 1.34); }
  const qx = Math.min(ix1 - 0.5, bx + 1.0 + rand() * 0.4), qz = Math.min(bz1 - 0.5, iz0 + 1.55);
  if (qz > hz1 + 0.5 && qx < ox - 0.9) {
    bag.add('mud_plaster', box(qx - 0.3, 0, qz - 0.4, qx + 0.3, 0.18, qz + 0.4)); bag.add('granite_red', box(qx - 0.2, 0.18, qz - 0.3, qx + 0.2, 0.26, qz + 0.3));
    bag.add('basalt', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.04], [0.04, 0.07], [0.001, 0.075]], 8).scale(2.6, 1, 1).rotateY(Math.PI / 2).translate(qx, 0.26, qz + 0.05)); col.rect([qx - 0.3, qz - 0.4, qx + 0.3, qz + 0.4], 0, 0.3);
  }
  for (let k = 0; k < 2; k++) { const jx = ix1 - 0.4, jz = oz + 0.95 + k * 0.6; if (jz > bz1 - 0.3) break; bag.add('terracotta', lathe([[0.22, 0], [0.23, 0.04], [0.17, 0.05], [0.16, 0.03]], 12, null, jx, 0, jz)); bag.add('pottery_dark', lathe([[0.16, 0], [0.16, 0.012], [0.001, 0.012]], 10, null, jx, 0, jz)); }
  { const cx = bx + 0.5, cz = hz1 + 0.55;                                                               // the cellar's lid, a ring of stone in it
    if (cz < bz1 - 0.3 && cx < ox - 1.0) { bag.add('limestone_core', box(cx - 0.4, 0, cz - 0.4, cx + 0.4, 0.04, cz + 0.4)); bag.add('basalt', lathe([[0.001, 0], [0.07, 0.0], [0.06, 0.03], [0.001, 0.035]], 8, null, cx, 0.04, cz)); } }
  { const lz = Math.min(iz0 + 1.9, bz1 - 0.3); bag.add('limestone_core', box(ix1 - 0.3, 1.0, lz - 0.2, ix1, 1.05, lz + 0.2)); lamp(ix1 - 0.15, 1.05, lz); }
  // the bedroom of the deep houses: a bed on legs with a headrest, a chest, mats in the back room's south part
  if (el.rich && bz1 - (hz1 + 0.5) > 1.4) {
    const bxm = ix0 + 1.0, bzm = bz1 - 0.5;
    bag.add('timber', box(bxm - 0.4, 0.34, bzm - 0.9, bxm + 0.4, 0.4, bzm + 0.9)); for (const [dx, dz] of [[-0.36, -0.86], [0.36, -0.86], [-0.36, 0.86], [0.36, 0.86]]) bag.add('wood_ochre', box(bxm + dx - 0.03, 0, bzm + dz - 0.03, bxm + dx + 0.03, 0.34, bzm + dz + 0.03));
    bag.add('reed_mat', box(bxm - 0.38, 0.4, bzm - 0.88, bxm + 0.38, 0.42, bzm + 0.88)); bag.add('wood_ochre', box(bxm - 0.2, 0.42, bzm - 0.88, bxm + 0.2, 0.62, bzm - 0.8));
    col.rect([bxm - 0.42, bzm - 0.92, bxm + 0.42, bzm + 0.92], 0, 0.42);
    const cx = ix0 + 2.2, cz = bz1 - 0.35; bag.add('wood_ochre', box(cx - 0.4, 0, cz - 0.25, cx + 0.4, 0.5, cz + 0.25)); bag.add('bronze', box(cx - 0.05, 0.3, cz + 0.25, cx + 0.05, 0.4, cz + 0.27)); col.rect([cx - 0.4, cz - 0.25, cx + 0.4, cz + 0.25], 0, 0.5);
  }
}

/** The four fronts, in the house's frame (front to the south at z1). */
function front(c, variant, g) {
  const { bag, col } = c, { x0, x1, z1, zf, xd, dw, rand } = g;
  if (variant === 1) {
    // the porch: two palm columns either side of the door under a beam, a roof of logs and mats, a bench
    const d = zf + 1.35, a = xd - dw / 2 - 0.65, b = xd + dw / 2 + 0.65, hh = 2.65;
    column(bag, col, a, d, 0, hh, 0.14); column(bag, col, b, d, 0, hh, 0.14);
    const T = []; beamTris(T, [a - 0.25, hh, d], [b + 0.25, hh, d], 0.1, 0.2); for (let x = a - 0.2; x <= b + 0.2; x += 0.3) beamTris(T, [x, hh + 0.2, zf], [x, hh + 0.2, d + 0.2], 0.05, 0.1);
    bag.add('timber', fromTriangles(T)); bag.add('reed_mat', box(a - 0.3, hh + 0.3, zf, b + 0.3, hh + 0.36, d + 0.25));
    bag.add('limestone_core', box(a - 0.2, 0, zf, b + 0.2, 0.06, d + 0.2));
    const room = (x1 - b > b - x0 ? [b + 0.3, Math.min(x1 + 0.2, b + 1.9)] : [Math.max(x0 - 0.2, a - 1.9), a - 0.3]);
    if (room[1] - room[0] > 0.8) { bag.add('mud_plaster', box(room[0], 0, zf, room[1], 0.4, zf + 0.42)); col.rect([room[0], zf, room[1], zf + 0.42], 0, 0.4); jar(bag, room[0] + 0.3, 0.4, zf + 0.21, 0.55); }
  } else if (variant === 2) {
    // the stone doorframe proud of the wall, a cornice, the name plaque over it, the barred window
    const a = xd - dw / 2 - 0.2, b = xd + dw / 2 + 0.2;
    for (const [p, q] of [[a, a + 0.2], [b - 0.2, b]]) { bag.add('limestone_core', box(p, 0, zf, q, 2.25, zf + 0.1)); col.rect([p, zf, q, zf + 0.1], 0, 2.25); }
    bag.add('limestone_core', box(a - 0.1, 2.25, zf, b + 0.1, 2.4, zf + 0.14)); bag.add('limestone_core', box(a - 0.18, 2.4, zf, b + 0.18, 2.5, zf + 0.2));
    bag.add('plaster_white', box(xd - 0.4, 2.52, zf + 0.004, xd + 0.4, 2.9, zf + 0.02));
    for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'egyptian_blue' : 'limewash_red', box(xd - 0.34 + k * 0.14, 2.58, zf + 0.02, xd - 0.26 + k * 0.14, 2.82, zf + 0.03));
    const wx = xd < (x0 + x1) / 2 ? xd + dw / 2 + 1.1 : xd - dw / 2 - 1.1;
    if (wx > x0 + 0.5 && wx < x1 - 0.5) { bag.add('pottery_dark', box(wx - 0.25, 1.55, zf - 0.02, wx + 0.25, 2.05, zf + 0.0)); for (let k = 0; k < 4; k++) bag.add('timber', box(wx - 0.2 + k * 0.13, 1.55, zf + 0.0, wx - 0.17 + k * 0.13, 2.05, zf + 0.03)); bag.add('limestone_core', box(wx - 0.32, 1.5, zf, wx + 0.32, 1.55, zf + 0.1)); }
    bag.add('limestone_core', box(xd - dw / 2 - 0.2, 0, zf + 0.1, xd + dw / 2 + 0.2, 0.1, zf + 0.5));
  } else if (variant === 3) {
    // the reed awning along the front on poles, a long bench under it, jars, a mat
    const a = Math.max(x0, xd - 2.4), b = Math.min(x1, xd + 2.4), d = zf + 1.0;
    for (const x of [a + 0.1, b - 0.1]) post(bag, x, 0, 2.55, d, 0.06);
    const T = []; beamTris(T, [a, 2.6, zf], [a, 2.6, d + 0.1], 0.05, 0.06); beamTris(T, [b, 2.6, zf], [b, 2.6, d + 0.1], 0.05, 0.06); bag.add('timber', fromTriangles(T));
    bag.add('reed_mat', box(a - 0.1, 2.66, zf, b + 0.1, 2.72, d + 0.2));
    for (const x of [a + 0.1, b - 0.1]) col.circle(x, d, 0.07, 0, 2.55);
    const bs = xd < (x0 + x1) / 2 ? [xd + dw / 2 + 0.3, b - 0.3] : [a + 0.3, xd - dw / 2 - 0.3];
    if (bs[1] - bs[0] > 0.8) { bag.add('mud_plaster', box(bs[0], 0, zf, bs[1], 0.42, zf + 0.42)); col.rect([bs[0], zf, bs[1], zf + 0.42], 0, 0.42); bag.add('reed_mat', box(bs[0] + 0.1, 0.42, zf + 0.03, bs[1] - 0.1, 0.44, zf + 0.39)); }
    jar(bag, xd + (rand() < 0.5 ? -0.8 : 0.8), 0, zf + 0.3, 0.9, 'pottery_dark');
    bag.add('limestone_core', box(xd - dw / 2 - 0.1, 0, zf, xd + dw / 2 + 0.1, 0.1, zf + 0.42));
  } else bag.add('limestone_core', box(xd - dw / 2 - 0.12, 0, zf, xd + dw / 2 + 0.12, 0.1, zf + 0.42));
}
