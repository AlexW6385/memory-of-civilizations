// The Baths of Agrippa, walked into (docs/settlements/rome.md §4.11): an outer wall of brick-faced concrete with arched
// windows and three gates; inside it two palaestrae (exercise courts) either side, each with its colonnade, a pool and
// statues; and the bathing block on the axis from the Pantheon: the frigidarium, a hall 60 × 32 m lit from the clerestory
// with eight granite columns, two cold pools and statues; the tepidarium behind it with its warm tubs; the apodyteria
// (changing rooms) with their benches and shelves either side; and the caldarium, the round hot hall under its dome with
// an oculus, with the great basin (labrum) in the middle and the hot tubs (alvei) along the walls, the floor of coloured
// marble. A `baths_agrippa` element of the `roman` style: { rect (about 140 × 100 m, the entrance on the north), y }.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../objects/index.js';
import './index.js';
import './town.js';
import { putAt } from './dress.js';

const lz = (p, n, x = 0, y = 0, z = 0) => lathe(p, n, null, x, y, z);

/** A wall along x (axis 'x') or z at c from a to b, t thick, to height H, with doorways [u0, u1, h]; `lo` below `split`, `hi` above. */
function wall(ctx, axis, c, a, b, t, H, doors = [], lo = 'brick', hi = lo, split = 0) {
  const { bag, col } = ctx, ds = [...doors].sort((p, q) => p[0] - q[0]);
  const seg = (u0, u1, y0, y1, m) => {
    if (u1 - u0 < 0.01 || y1 - y0 < 0.01) return;
    const r = axis === 'x' ? [u0, c - t / 2, u1, c + t / 2] : [c - t / 2, u0, c + t / 2, u1];
    bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3]));
    if (y0 < 0.1 || m === lo) col.rect(r, y0 < 0 ? -0.4 : y0, y1);
  };
  const both = (u0, u1, y0, y1) => { if (split > y0 && split < y1) { seg(u0, u1, y0, split, lo); seg(u0, u1, split, y1, hi); } else seg(u0, u1, y0, y1, y0 >= split && split > 0 ? hi : lo); };
  let u = a;
  for (const [d0, d1, dh = 3] of ds) {
    both(u, d0, -0.4, H); both(d0, d1, dh, H);
    const r = axis === 'x' ? [d0, c - t / 2, d1, c + t / 2] : [c - t / 2, d0, c + t / 2, d1];
    bag.add('travertine', box(r[0], -0.05, r[1], r[2], 0.02, r[3]));
    // the jambs and the lintel in marble
    if (axis === 'x') { bag.add('marble', box(d0 - 0.3, 0, c - t / 2 - 0.1, d0, dh, c + t / 2 + 0.1)); bag.add('marble', box(d1, 0, c - t / 2 - 0.1, d1 + 0.3, dh, c + t / 2 + 0.1)); bag.add('marble', box(d0 - 0.3, dh, c - t / 2 - 0.12, d1 + 0.3, dh + 0.35, c + t / 2 + 0.12)); }
    else { bag.add('marble', box(c - t / 2 - 0.1, 0, d0 - 0.3, c + t / 2 + 0.1, dh, d0)); bag.add('marble', box(c - t / 2 - 0.1, 0, d1, c + t / 2 + 0.1, dh, d1 + 0.3)); bag.add('marble', box(c - t / 2 - 0.12, dh, d0 - 0.3, c + t / 2 + 0.12, dh + 0.35, d1 + 0.3)); }
    u = d1;
  }
  both(u, b, -0.4, H);
}
/** A plain Tuscan-Doric column of the palaestrae's porticoes (a shaft with a swelling, a square abacus), cheap: one shape for all. */
function plainColumn(ctx, x, z, y, h, d, mat) {
  const r = d / 2, shaft = lz([[r * 1.2, 0], [r * 1.2, 0.25], [r, 0.3], [r * 1.04, h * 0.4], [r * 0.86, h - 0.55], [r * 1.1, h - 0.5], [r * 1.1, h - 0.3]], 12);
  putAt(ctx.bag, mat, shaft, x, y, z); putAt(ctx.bag, mat, box(-r * 1.5, h - 0.3, -r * 1.5, r * 1.5, h, r * 1.5), x, y, z);
  ctx.col.circle(x, z, r * 1.2, y, y + h);
}
const floorOf = (ctx, rect, mat, y = 0.04) => { ctx.bag.add(mat, box(rect[0], y - 0.3, rect[1], rect[2], y, rect[3])); ctx.col.floor(rect, y); };
/** A pool: a travertine rim, the water in it, steps; blocks the floor inside the rim. */
function pool(ctx, r, y0, depth = 1.2, rim = 'marble') {
  const [x0, z0, x1, z1] = r, { bag, col } = ctx;
  bag.add(rim, box(x0 - 0.4, y0, z0 - 0.4, x1 + 0.4, y0 + 0.5, z0)); bag.add(rim, box(x0 - 0.4, y0, z1, x1 + 0.4, y0 + 0.5, z1 + 0.4));
  bag.add(rim, box(x0 - 0.4, y0, z0, x0, y0 + 0.5, z1)); bag.add(rim, box(x1, y0, z0, x1 + 0.4, y0 + 0.5, z1));
  bag.add('water', box(x0, y0 + 0.2, z0, x1, y0 + 0.23, z1));
  col.rect([x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4], y0, y0 + 0.5);
  void depth;
}
function statueAt(ctx, x, z, rot, mat = 'marble', h = 2.3, base = 1.1) { STYLES.roman.elements.statue({ at: [x, z], y: 0.04, rot, h, base, mat }, ctx); }
function bench(ctx, x0, z0, x1, z1, h = 0.45, mat = 'marble') { ctx.bag.add(mat, box(x0, 0.04, z0, x1, 0.04 + h, z1)); ctx.col.rect([x0, z0, x1, z1], 0.04, 0.04 + h); }

function bathsAgrippa(el, ctx) {
  const { bag, col, lights } = ctx, [X0, Z0, X1, Z1] = el.rect, cx = (X0 + X1) / 2, y = el.y ?? 0, far = !!el.simple;
  const B = [cx - 30, Z0 + 6, cx + 30, Z0 + 92];         // the bathing block
  const OH = 12.5, BH = 17;                              // the outer wall, the block
  const t = 1.6, ti = 1.4;
  const colm = STYLES.roman.column;
  // ── the ground: flagstones over the whole site, sand in the palaestrae
  bag.add('flagstone', box(X0, y - 0.3, Z0, X1, y, Z1)); col.floor(el.rect, y);
  // ── the outer wall with three gates and tall arched windows, pilasters and a cornice
  const north = [[cx - 3.8, cx + 3.8, 7.5], [cx - 52, cx - 47.5, 4.4], [cx + 47.5, cx + 52, 4.4]];
  wall(ctx, 'x', Z0 + t / 2, X0, X1, t, OH, north);
  wall(ctx, 'x', Z1 - t / 2, X0, X1, t, OH, [[cx - 2, cx + 2, 4]]);
  wall(ctx, 'z', X0 + t / 2, Z0, Z1, t, OH, [[(Z0 + Z1) / 2 - 2, (Z0 + Z1) / 2 + 2, 4.4]]);
  wall(ctx, 'z', X1 - t / 2, Z0, Z1, t, OH, [[(Z0 + Z1) / 2 - 2, (Z0 + Z1) / 2 + 2, 4.4]]);
  // (a window is a dark panel on the outer face, a sill and a lintel of travertine)
  const win = (x0, z0, x1, z1, ax) => {
    bag.add('opening', box(x0, y + 5.2, z0, x1, y + 10.4, z1));
    if (far) return;
    const g = ax === 'x' ? [[x0 - 0.2, z0 - 0.06, x1 + 0.2, z1 + 0.06]] : [[x0 - 0.06, z0 - 0.2, x1 + 0.06, z1 + 0.2]];
    for (const [a, b, c, d] of g) { bag.add('travertine', box(a, y + 10.4, b, c, y + 10.7, d)); bag.add('travertine', box(a, y + 5.0, b, c, y + 5.2, d)); }
  };
  for (let u = X0 + 6; u < X1 - 4; u += 8) {
    if (!north.some(([a, b]) => u > a - 3 && u < b + 3)) win(u - 1.5, Z0 - 0.06, u + 1.5, Z0 + 0.04, 'x');
    win(u - 1.5, Z1 - 0.04, u + 1.5, Z1 + 0.06, 'x');
  }
  for (let u = Z0 + 8; u < Z1 - 4; u += 8) {
    if (Math.abs(u - (Z0 + Z1) / 2) < 3.5) continue;
    win(X0 - 0.06, u - 1.5, X0 + 0.04, u + 1.5, 'z'); win(X1 - 0.04, u - 1.5, X1 + 0.06, u + 1.5, 'z');
  }
  bag.add('travertine', box(X0 - 0.2, y + OH, Z0 - 0.2, X1 + 0.2, y + OH + 0.5, Z0 + t + 0.2)); bag.add('travertine', box(X0 - 0.2, y + OH, Z1 - t - 0.2, X1 + 0.2, y + OH + 0.5, Z1 + 0.2));
  bag.add('travertine', box(X0 - 0.2, y + OH, Z0, X0 + t + 0.2, y + OH + 0.5, Z1)); bag.add('travertine', box(X1 - t - 0.2, y + OH, Z0, X1 + 0.2, y + OH + 0.5, Z1));
  // the grand gate: a marble frame and a pediment-like attic over it
  bag.add('marble', box(cx - 5.6, OH - 0.1, Z0 - 0.8, cx + 5.6, OH + 2.4, Z0 + 0.2));
  bag.add('marble', box(cx - 6.2, OH + 2.4, Z0 - 1.0, cx + 6.2, OH + 2.9, Z0 + 0.3));
  // ── the palaestrae: a portico of columns along the inside of the outer wall, a tiled lean-to roof, sand and a pool in the court, statues
  for (const s of [-1, 1]) {
    const xi = s < 0 ? X0 + t : X1 - t, xc = s < 0 ? X0 + t + 5.2 : X1 - t - 5.2, c0 = s < 0 ? xi : xc, c1 = s < 0 ? xc : xi, court = [Math.min(xc, B[0] - ti / 2 - 0.0), Z0 + t + 5.2, Math.max(xc, B[2] + ti / 2), Z1 - t - 5.2];
    void c0; void c1; void court;
    const east = s > 0, cxl = east ? B[2] + ti / 2 : X0 + t + 5.2, cxr = east ? X1 - t - 5.2 : B[0] - ti / 2;      // the court's x range
    if (!far) for (let z = Z0 + t + 4; z <= Z1 - t - 4; z += 5.5) plainColumn(ctx, xc, z, y, 8, 0.8, 'travertine');
    for (let x = Math.min(cxl, cxr) + 4.5; x < Math.max(cxl, cxr) - 3; x += 5.5) for (const zc of [Z0 + t + 5.2, Z1 - t - 5.2]) if (!far) plainColumn(ctx, x, zc, y, 8, 0.8, 'travertine');
    const lo = Math.min(cxl, cxr), hi = Math.max(cxl, cxr);
    bag.add('travertine', box(east ? xc : X0 + t, y + 8, Z0 + t, east ? X1 - t : xc, y + 8.7, Z1 - t)); void lo; void hi;
    bag.add('roof_tile', box(east ? xc - 0.3 : X0 + t, y + 8.7, Z0 + t, east ? X1 - t : xc + 0.3, y + 9.3, Z1 - t));
    for (const zc of [[Z0 + t, Z0 + t + 5.2], [Z1 - t - 5.2, Z1 - t]]) { bag.add('travertine', box(Math.min(cxl, cxr), y + 8, zc[0], Math.max(cxl, cxr), y + 8.7, zc[1])); bag.add('roof_tile', box(Math.min(cxl, cxr), y + 8.7, zc[0], Math.max(cxl, cxr), y + 9.3, zc[1])); }
    bag.add('ground', box(Math.min(cxl, cxr), y - 0.28, Z0 + t + 5.2, Math.max(cxl, cxr), y + 0.02, Z1 - t - 5.2)); col.floor([Math.min(cxl, cxr), Z0 + t + 5.2, Math.max(cxl, cxr), Z1 - t - 5.2], y + 0.02);
    const mx = (cxl + cxr) / 2, mz = (Z0 + Z1) / 2;
    if (!far) {
      pool(ctx, [mx - 7, mz - 12, mx + 7, mz + 12], y, 1.4);
      for (const dz of [-30, -20, 20, 30]) statueAt(ctx, east ? cxl + 3 : cxr - 3, mz + dz, east ? Math.PI / 2 : -Math.PI / 2, dz % 20 ? 'gilt_bronze' : 'marble');
      for (const dz of [-34, 34]) bench(ctx, mx - 1.6, mz + dz - 0.3, mx + 1.6, mz + dz + 0.3);
    }
  }
  // ── the bathing block
  const cz0 = B[1], cz1 = B[3], z86 = Z0 + 38, z104 = Z0 + 56, ccx = cx, ccz = Z0 + 72, R0 = 14, R1 = 16;
  // floors
  floorOf(ctx, [B[0] + 0.7, cz0 + 0.7, B[2] - 0.7, z86 - 0.7], 'marble_floor');
  floorOf(ctx, [cx - 14 + 0.7, z86 + 0.7, cx + 14 - 0.7, z104 - 0.7], 'opus_sectile');
  for (const s of [-1, 1]) floorOf(ctx, s < 0 ? [B[0] + 0.7, z86 + 0.7, cx - 14 - 0.7, z104 - 0.7] : [cx + 14 + 0.7, z86 + 0.7, B[2] - 0.7, z104 - 0.7], 'cotto_floor');
  bag.add('opus_sectile', lz([[R0 + 0.2, 0.04], [0.001, 0.04]], 40, ccx, y, ccz)); col.floor([ccx - R0, ccz - R0, ccx + R0, ccz + R0], y + 0.04);
  // the shell: lower walls faced in marble inside, brick without
  const shell = (axis, c, a, b, doors) => wall(ctx, axis, c, a, b, ti, BH, doors, 'brick', 'brick', 0);
  shell('x', cz0, B[0] - ti / 2, B[2] + ti / 2, [[cx - 6, cx + 6, 9.5]]);
  shell('x', cz1, B[0] - ti / 2, B[2] + ti / 2, []);
  shell('z', B[0], cz0, cz1, [[Z0 + 20, Z0 + 24, 5], [z86 + 6, z86 + 10, 4.5]]);
  shell('z', B[2], cz0, cz1, [[Z0 + 20, Z0 + 24, 5], [z86 + 6, z86 + 10, 4.5]]);
  const inner = (axis, c, a, b, doors) => wall(ctx, axis, c, a, b, ti, 15.6, doors, 'revetment', 'stucco_rome', 5.5);
  inner('x', z86, B[0] + ti / 2, B[2] - ti / 2, [[cx - 7, cx + 7, 10], [cx - 25, cx - 21, 4.5], [cx + 21, cx + 25, 4.5]]);
  inner('z', cx - 14, z86, z104, [[z86 + 6, z86 + 10, 4.5]]);
  inner('z', cx + 14, z86, z104, [[z86 + 6, z86 + 10, 4.5]]);
  inner('x', z104, B[0] + ti / 2, B[2] - ti / 2, [[cx - 6, cx + 6, 9]]);
  // marble facing inside the frigidarium and brick above, the shell's inner skins
  const skin = (r, mat, ya, yb) => bag.add(mat, box(r[0], y + ya, r[1], r[2], y + yb, r[3]));
  skin([B[0] + ti / 2, cz0 + ti / 2, B[0] + ti / 2 + 0.02, z86 - ti / 2], 'revetment', 0, 5.5); skin([B[2] - ti / 2 - 0.02, cz0 + ti / 2, B[2] - ti / 2, z86 - ti / 2], 'revetment', 0, 5.5);
  skin([B[0] + ti / 2, cz0 + ti / 2, B[2] - ti / 2, cz0 + ti / 2 + 0.02], 'revetment', 0, 5.5);
  // the caldarium: the round hall
  STYLES.roman.elements.ring_wall({ c: [ccx, ccz], r0: R0, r1: R1, y0: -0.4, y1: 16.6, gaps: [{ a: 0, w: 12, y1: 9, y0: 0 }] }, ctx);
  // the haunches: the corners between the ring and its bounding square, in steps
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let i = 0; i < 8; i++) {
    const xin = i * R1 / 8, xo = (i + 1) * R1 / 8, zin = Math.sqrt(Math.max(0, R1 * R1 - xin * xin)) + 0.05;
    const zz0 = ccz + sz * zin, zz1 = ccz + sz * (R1 + 1.0), xa = ccx + sx * xin, xb = ccx + sx * xo;
    bag.add('brick', box(Math.min(xa, xb), y - 0.4, Math.min(zz0, zz1), Math.max(xa, xb), y + 16.6, Math.max(zz0, zz1)));
    col.rect([Math.min(xa, xb), Math.min(zz0, zz1), Math.max(xa, xb), Math.max(zz0, zz1)], y, y + 16.6);
  }
  // the dome: outer shell, inner shell (turned the other way, to be seen from below), the oculus rim; roof slabs round it
  const prof = [[16, 0], [14.7, 6.4], [11.2, 11.5], [6.1, 14.9], [3.0, 15.9]].map(([r, h]) => [r, h]);
  bag.add('dome_stucco', lz(prof, 40, ccx, y + 16.6, ccz));
  const inn = [[14, 0], [12.9, 5.6], [9.8, 10.1], [5.3, 13.0], [2.6, 13.9]];
  bag.add('dome_stucco', lz(inn.slice().reverse(), 40, ccx, y + 16.6, ccz));
  bag.add('dome_stucco', lz([[2.6, 13.9], [3.0, 15.9]], 40, ccx, y + 16.6, ccz)); bag.add('dome_stucco', lz([[3.0, 15.9], [2.6, 13.9]], 40, ccx, y + 16.6, ccz));
  for (let k = 0; k < 5; k++) { const rr = [13.2, 11.2, 9.0, 6.6, 4.4][k], hh = [3.6, 8.3, 11.8, 14.0, 14.9][k]; bag.add('gilt_bronze', lz([[rr, 0], [rr - 0.12, 0.12], [rr - 0.12, 0.0]], 40, ccx, y + 16.6 + hh - 1.2, ccz)); }
  bag.add('roof_tile', box(B[0] - 0.4, y + 16.6, cz0 - 0.4, B[2] + 0.4, y + 17.2, z104 + 0.7));   // over the halls
  bag.add('roof_tile', box(B[0] - 0.4, y + 16.6, z104 + 0.7, ccx - R1 - 0.4, y + 17.2, cz1 + 0.4)); bag.add('roof_tile', box(ccx + R1 + 0.4, y + 16.6, z104 + 0.7, B[2] + 0.4, y + 17.2, cz1 + 0.4));
  bag.add('roof_tile', box(ccx - R1 - 0.4, y + 16.6, cz1 - 1.0, ccx + R1 + 0.4, y + 17.2, cz1 + 0.4));
  // the ceilings: coffers over the frigidarium, painted vault over the tepidarium and the changing rooms
  bag.add('ceiling_coffer', box(B[0] + ti / 2, y + 15.0, cz0 + ti / 2, B[2] - ti / 2, y + 15.4, z86 - ti / 2));
  bag.add('ceiling_painted', box(cx - 14 + ti / 2, y + 12.0, z86 + ti / 2, cx + 14 - ti / 2, y + 12.4, z104 - ti / 2));
  for (const s of [-1, 1]) bag.add('ceiling_painted', box(s < 0 ? B[0] + ti / 2 : cx + 14 + ti / 2, y + 8.0, z86 + ti / 2, s < 0 ? cx - 14 - ti / 2 : B[2] - ti / 2, y + 8.4, z104 - ti / 2));
  // the clerestory: a row of arched windows high in the frigidarium's end walls
  for (let u = B[0] + 6; u < B[2] - 3; u += 8) { bag.add('daylight', box(u - 1.6, y + 10.0, cz0 + ti / 2 - 0.02, u + 1.6, y + 14.4, cz0 + ti / 2 + 0.01)); bag.add('opening', box(u - 1.6, y + 10.0, cz0 - ti / 2 - 0.02, u + 1.6, y + 14.4, cz0 - ti / 2 + 0.01)); }
  if (far) return;
  // the frigidarium: eight granite columns, two cold pools at its ends, statues in the bays, the light from the clerestory
  for (const dx of [-21, -7, 7, 21]) for (const dz of [cz0 + 9, z86 - 9]) colm({ at: [cx + dx, dz], y: y + 0.04, h: 13, d: 1.3, mat: 'marble', shaftMat: 'granite_grey' }, ctx);
  pool(ctx, [cx - 26.5, cz0 + 12, cx - 16.5, z86 - 12], y + 0.04, 1.4); pool(ctx, [cx + 16.5, cz0 + 12, cx + 26.5, z86 - 12], y + 0.04, 1.4);
  for (let k = 0; k < 6; k++) statueAt(ctx, cx - 25 + k * 10, cz0 + 2.2, 0, k % 2 ? 'gilt_bronze' : 'marble');
  for (let k = 0; k < 4; k++) statueAt(ctx, cx - 15 + k * 10, z86 - 2.2, Math.PI, k % 2 ? 'marble' : 'gilt_bronze');
  for (const s of [-1, 1]) bench(ctx, cx + s * 11 - 2.5, cz0 + 12, cx + s * 11 + 2.5, cz0 + 12.7);
  lights?.push({ at: [cx - 15, y + 9, (cz0 + z86) / 2], color: '#ffe9c4', intensity: 2.4, distance: 30 }, { at: [cx + 15, y + 9, (cz0 + z86) / 2], color: '#ffe9c4', intensity: 2.4, distance: 30 });
  // the tepidarium: two warm tubs in alcoves, a marble bench along the walls
  for (const s of [-1, 1]) { pool(ctx, [cx + s * 10 - 2, z86 + 3, cx + s * 10 + 2, z86 + 12], y + 0.04, 1.0, 'marble'); bench(ctx, cx + s * 13 - 0.3, z86 + 13.5, cx + s * 13 + 0.3, z104 - 1.0); }
  lights?.push({ at: [cx, y + 8, z86 + 9], color: '#ffd9a0', intensity: 1.8, distance: 20 });
  // the apodyteria: benches along the walls, rows of cubbyholes (shelves) over them
  for (const s of [-1, 1]) {
    const xa = s < 0 ? B[0] + ti / 2 : cx + 14 + ti / 2, xb = s < 0 ? cx - 14 - ti / 2 : B[2] - ti / 2;
    bench(ctx, xa + 0.2, z86 + 1.2, xb - 0.2, z86 + 1.8, 0.45, 'timber'); bench(ctx, xa + 0.2, z104 - 1.8, xb - 0.2, z104 - 1.2, 0.45, 'timber');
    for (const sy of [1.4, 2.2, 3.0]) { bag.add('timber', box(xa + 0.1, y + sy, z104 - ti / 2 - 0.5, xb - 0.1, y + sy + 0.05, z104 - ti / 2)); bag.add('timber', box(xa + 0.1, y + sy, z86 + ti / 2, xb - 0.1, y + sy + 0.05, z86 + ti / 2 + 0.5)); }
    for (let k = 0; k < 6; k++) bag.add(['cloth_white', 'cloth_ochre', 'linen', 'cloth_red', 'cloth_grey', 'cloth_indigo'][k], box(xa + 1.0 + k * 1.8, y + 1.45, z104 - ti / 2 - 0.4, xa + 1.7 + k * 1.8, y + 1.6, z104 - ti / 2 - 0.1));
    lights?.push({ at: [(xa + xb) / 2, y + 6.5, (z86 + z104) / 2], color: '#ffe6bd', intensity: 1.4, distance: 14 });
  }
  // the caldarium: the great basin on its baluster, hot tubs in the alcoves, a bench round the wall
  bag.add('marble', lz([[2.4, 0], [2.4, 0.55], [2.0, 0.6], [1.9, 0.18], [0.001, 0.18]], 28, ccx, y + 0.04, ccz));
  bag.add('water', lz([[0.001, 0.46], [1.95, 0.46], [0.001, 0.46]], 24, ccx, y + 0.04, ccz));
  bag.add('granite_red', lz([[1.4, 0], [1.1, 0.4], [0.5, 0.9], [0.4, 1.4], [0.7, 1.6], [0.001, 1.6]], 20, ccx, y + 0.2, ccz).translate(0, 0, 0));
  col.circle(ccx, ccz, 2.4, y, y + 0.7);
  for (const a of [0.9, 2.4, 3.9, 5.4]) { const px = ccx + Math.cos(a) * (R0 - 3.2), pz = ccz + Math.sin(a) * (R0 - 3.2); pool(ctx, [px - 1.6, pz - 1.6, px + 1.6, pz + 1.6], y + 0.04, 1.0, 'marble'); }
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + 0.26; if (Math.abs(Math.cos(a)) > 0.9 || Math.abs(Math.sin(a) + 1) < 0.32) continue; bag.add('marble', lz([[0.001, 0], [0.5, 0], [0.5, 0.45], [0.001, 0.45]], 8, ccx + Math.cos(a) * (R0 - 0.6), y + 0.04, ccz + Math.sin(a) * (R0 - 0.6))); }
  lights?.push({ at: [ccx, y + 12, ccz], color: '#ffe0a8', intensity: 3.0, distance: 30 });
}
Object.assign(STYLES.roman.elements, { baths_agrippa: bathsAgrippa });
