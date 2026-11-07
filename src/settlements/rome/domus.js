// A house of the Campus Martius one walks into (docs/settlements/rome.md §4.4): an atrium house behind its two
// street shops — on one side of the entrance passage (fauces) a thermopolium with its counter faced in coloured
// marble, the dolia sunk in its top, the stepped shelf of jugs, the hearth, the painted lararium; on the other a wine
// shop; then the atrium with its impluvium under the opening of the roof, the marble table, the strongbox, the
// household shrine, the bedrooms (cubicula) either side; at the back the tablinum, the triclinium with its three
// couches, the kitchen. And the litter (lectica) of the street, its couch under a canopy on four posts, curtains, poles.
// Registered as the style `rome-site` (the shared Roman style is left as it is).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A wall along x (alongX) or z at c from a to b, t thick, with doorways [u0, u1, h]; brick-faced concrete under stucco. */
function wall(ctx, alongX, c, a, b, t, y, H, doors = [], mat = 'stucco_rome') {
  const { bag, col } = ctx, ds = [...doors].sort((p, q) => p[0] - q[0]);
  const seg = (u0, u1, y0, y1, m) => { if (u1 - u0 < 0.01 || y1 - y0 < 0.01) return; const r = alongX ? [u0, c - t / 2, u1, c + t / 2] : [c - t / 2, u0, c + t / 2, u1]; bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  let u = a;
  for (const [d0, d1, dh = 2.4] of ds) {
    seg(u, d0, y - 0.4, y + H, mat); seg(d0, d1, y + dh, y + H, mat);
    const r = alongX ? [d0, c - t / 2, d1, c + t / 2] : [c - t / 2, d0, c + t / 2, d1];
    bag.add('travertine', box(r[0], y - 0.05, r[1], r[2], y + 0.02, r[3]));                  // the threshold, worn
    u = d1;
  }
  seg(u, b, y - 0.4, y + H, mat);
}
/**
 * The painted walls of a room: the dark dado, the coloured fields above, a band under the ceiling — a thin skin inside
 * the faces, left open over the doorways (doors: { n | s | w | e: [[u0, u1, h]] } along each side, world coordinates).
 */
function paint(bag, r, y, dado = 'lacquer_black', field = 'wall_red', band = 'paint_ochre', H = 2.9, doors = {}) {
  const [x0, z0, x1, z1] = r, e = 0.012;
  const strip = (side, mat, a, b) => {
    const alongX = side === 'n' || side === 's', u0 = alongX ? x0 + e : z0 + e, u1 = alongX ? x1 - e : z1 - e;
    const cuts = (doors[side] ?? []).filter(([d0, d1, h]) => y + a < y + (h ?? 2.4)).sort((p, q) => p[0] - q[0]);
    let u = u0;
    const put = (ua, ub) => {
      if (ub - ua < 0.01) return;
      const q = side === 'n' ? [ua, z0 + 0.002, ub, z0 + e] : side === 's' ? [ua, z1 - e, ub, z1 - 0.002] : side === 'w' ? [x0 + 0.002, ua, x0 + e, ub] : [x1 - e, ua, x1 - 0.002, ub];
      bag.add(mat, box(q[0], y + a, q[1], q[2], y + b, q[3]));
    };
    for (const [d0, d1, h] of cuts) {
      const top = h ?? 2.4;
      put(u, Math.max(u, d0));
      if (b > top) bag.add(mat, (() => { const ya = Math.max(a, top); const q = side === 'n' ? [d0, z0 + 0.002, d1, z0 + e] : side === 's' ? [d0, z1 - e, d1, z1 - 0.002] : side === 'w' ? [x0 + 0.002, d0, x0 + e, d1] : [x1 - e, d0, x1 - 0.002, d1]; return box(q[0], y + ya, q[1], q[2], y + b, q[3]); })());
      u = Math.min(u1, Math.max(u, d1));
    }
    put(u, u1);
  };
  for (const [a, b, mat] of [[0, 0.9, dado], [0.9, H - 0.25, field], [H - 0.25, H - 0.12, band]]) for (const side of 'nswe') if (!(doors.skip ?? '').includes(side)) strip(side, mat, a, b);
}
const lz = (p, n, x, y, z) => lathe(p, n, null, x, y, z);

/**
 * domus: { rect [x0, z0, x1, z1] (about 18 × 18.6 m; the street on the south, z1), y } — see the header.
 */
function domus(el, ctx) {
  const { bag, col, lights } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, rand = rng(128), t = 0.6, ti = 0.45, H = 5.2;
  const W = X1 - X0, mx = (X0 + X1) / 2;
  // the bands from the street: the shops (5 m), the atrium (8 m), the back rooms (the rest)
  const zs = Z1 - t - 5.0, za = zs - ti - 8.0;
  const xf0 = mx - 1.1, xf1 = mx + 1.1;                         // the fauces between the shops
  // floors: opus signinum (cotto) in the shops and the back rooms, the atrium's floor of marble flags round the basin
  bag.add('cotto_floor', box(X0 + t, y - 0.3, Z0 + t, X1 - t, y, Z1 - t)); col.floor([X0 + t, Z0 + t, X1 - t, Z1 - t], y);
  bag.add('marble_floor', box(X0 + t + 3.0, y, za + ti / 2, X1 - t - 3.0, y + 0.01, zs - ti / 2));
  // the outer walls; on the street the shops open wide (their shutters' grooves in the travertine sills), the house door
  wall(ctx, true, Z1 - t / 2, X0, X1, t, y, H, [[X0 + t + 0.5, xf0 - ti - 0.5, 3.2], [xf0 + 0.3, xf1 - 0.3, 3.0], [xf1 + ti + 0.5, X1 - t - 0.5, 3.2]]);
  wall(ctx, true, Z0 + t / 2, X0, X1, t, y, H);
  wall(ctx, false, X0 + t / 2, Z0 + t, Z1 - t, t, y, H);
  wall(ctx, false, X1 - t / 2, Z0 + t, Z1 - t, t, y, H);
  // the shops' side walls (the fauces between), the wall behind the shops with the door from the fauces to the atrium
  wall(ctx, false, xf0 - ti / 2, zs, Z1 - t, ti, y, H);
  wall(ctx, false, xf1 + ti / 2, zs, Z1 - t, ti, y, H);
  wall(ctx, true, zs, X0 + t, X1 - t, ti, y, H, [[xf0, xf1, 3.0], [X0 + t + 3.4, X0 + t + 4.3]]);
  // the atrium's sides: two cubicula each side (3 m deep), their doors on the atrium
  const xc0 = X0 + t + 3.0, xc1 = X1 - t - 3.0, zm = (za + zs) / 2;
  for (const xc of [xc0, xc1]) wall(ctx, false, xc, za + ti / 2, zs - ti / 2, ti, y, H, [[za + 1.2, za + 2.1], [zm + 1.0, zm + 1.9]]);
  for (const [a, b] of [[X0 + t, xc0], [xc1, X1 - t]]) wall(ctx, true, zm, a, b, ti, y, H);
  // the back: the tablinum open on the atrium in the middle, the triclinium on the west, the kitchen on the east
  const xt0 = mx - 2.4, xt1 = mx + 2.4;
  wall(ctx, true, za, X0 + t, X1 - t, ti, y, H, [[xc0 + 0.6, xc0 + 1.5], [xt0, xt1, 4.2], [xc1 - 1.5, xc1 - 0.6]]);
  for (const x of [xt0 - ti / 2, xt1 + ti / 2]) wall(ctx, false, x, Z0 + t, za - ti / 2, ti, y, H);
  // the roofs: tiled over the ranges, the atrium's roof sloping in to the opening (compluvium) over the basin
  const ip = [mx - 1.6, zm - 1.3, mx + 1.6, zm + 1.3];
  for (const r of [[X0, Z0, X1, za + ti / 2], [X0, zs - ti / 2, X1, Z1], [X0, za + ti / 2, xc0 + ti / 2, zs - ti / 2], [xc1 - ti / 2, za + ti / 2, X1, zs - ti / 2]]) {
    bag.add('timber', box(r[0] + 0.1, y + H - 0.15, r[1] + 0.1, r[2] - 0.1, y + H, r[3] - 0.1));
    bag.add('roof_tile', box(r[0] - 0.25, y + H, r[1] - 0.25, r[2] + 0.25, y + H + 0.35, r[3] + 0.25));
  }
  // the atrium roof: four slopes of tiles down from the walls to the opening, each a strip of boxes stepping down
  const ar = [xc0 + ti / 2, za + ti / 2, xc1 - ti / 2, zs - ti / 2], steps = 6;
  for (let k = 0; k < steps; k++) {
    const f0 = k / steps, f1 = (k + 1) / steps, yy = y + H + 0.1 - f0 * 0.9;
    const L = (a, b, f) => a + (b - a) * f;
    const r0 = [L(ar[0], ip[0], f0), L(ar[1], ip[1], f0), L(ar[2], ip[2], f0), L(ar[3], ip[3], f0)], r1 = [L(ar[0], ip[0], f1), L(ar[1], ip[1], f1), L(ar[2], ip[2], f1), L(ar[3], ip[3], f1)];
    for (const q of [[r0[0], r0[1], r0[2], r1[1]], [r0[0], r1[3], r0[2], r0[3]], [r0[0], r1[1], r1[0], r1[3]], [r1[2], r1[1], r0[2], r1[3]]]) bag.add('roof_tile', box(q[0], yy - 0.12, q[1], q[2], yy, q[3]));
  }
  for (const q of [[ip[0] - 0.12, ip[1] - 0.12, ip[2] + 0.12, ip[1]], [ip[0] - 0.12, ip[3], ip[2] + 0.12, ip[3] + 0.12], [ip[0] - 0.12, ip[1], ip[0], ip[3]], [ip[2], ip[1], ip[2] + 0.12, ip[3]]]) bag.add('terracotta', box(q[0], y + H - 0.95, q[1], q[2], y + H - 0.75, q[3]));
  // the impluvium: a shallow marble basin under the opening, the rain in it; the cistern head beside it
  bag.add('marble', box(ip[0], y, ip[1], ip[2], y + 0.22, ip[1] + 0.2)); bag.add('marble', box(ip[0], y, ip[3] - 0.2, ip[2], y + 0.22, ip[3]));
  bag.add('marble', box(ip[0], y, ip[1] + 0.2, ip[0] + 0.2, y + 0.22, ip[3] - 0.2)); bag.add('marble', box(ip[2] - 0.2, y, ip[1] + 0.2, ip[2], y + 0.22, ip[3] - 0.2));
  bag.add('marble_floor', box(ip[0] + 0.2, y, ip[1] + 0.2, ip[2] - 0.2, y + 0.03, ip[3] - 0.2));
  bag.add('water', box(ip[0] + 0.2, y + 0.08, ip[1] + 0.2, ip[2] - 0.2, y + 0.09, ip[3] - 0.2));
  col.rect(ip, y, y + 0.22);
  bag.add('marble', lz([[0.3, 0], [0.3, 0.55], [0.22, 0.55], [0.22, 0.45], [0.001, 0.45]], 14, ip[2] + 0.8, y, ip[1] + 0.3)); col.circle(ip[2] + 0.8, ip[1] + 0.3, 0.3, y, y + 0.55);
  lights.push({ at: [mx, y + 3.5, zm], color: '#fff2d8', intensity: 1.2, distance: 9 });
  // the cartibulum: the marble table between the basin and the tablinum, its legs carved as lions' feet (blocks here)
  const tz = ip[1] - 0.9;
  bag.add('marble', box(mx - 0.75, y + 0.82, tz - 0.32, mx + 0.75, y + 0.9, tz + 0.32));
  for (const s of [-1, 1]) bag.add('marble', box(mx + s * 0.55 - 0.08, y, tz - 0.25, mx + s * 0.55 + 0.08, y + 0.82, tz + 0.25));
  bag.add('bronze', lz([[0.001, 0], [0.1, 0], [0.12, 0.05], [0.07, 0.12], [0.001, 0.12]], 12, mx - 0.3, y + 0.9, tz));
  col.rect([mx - 0.75, tz - 0.32, mx + 0.75, tz + 0.32], y, y + 0.9);
  // the strongbox (arca) of wood bound with bronze, on a base, against the atrium's wall
  const ax = xc1 - ti / 2 - 0.55, az = zm - 0.2;
  bag.add('travertine', box(ax - 0.4, y, az - 0.7, ax + 0.45, y + 0.2, az + 0.7));
  bag.add('wood_dark', box(ax - 0.35, y + 0.2, az - 0.62, ax + 0.4, y + 1.0, az + 0.62));
  for (const z of [az - 0.5, az, az + 0.5]) bag.add('bronze', box(ax - 0.37, y + 0.2, z - 0.04, ax + 0.42, y + 1.02, z + 0.04));
  bag.add('bronze', box(ax - 0.37, y + 0.9, az - 0.64, ax + 0.42, y + 1.03, az + 0.64));
  col.rect([ax - 0.4, az - 0.7, ax + 0.45, az + 0.7], y, y + 1.03);
  // the lararium: a little temple front of stucco on a podium in the atrium's south-west corner, the gods painted in it
  const lx = xc0 + ti / 2 + 0.05, lzz = zm - 0.3;
  bag.add('stucco', box(lx, y, lzz - 0.6, lx + 0.7, y + 1.0, lzz + 0.6));
  bag.add('wall_red', box(lx, y + 1.0, lzz - 0.5, lx + 0.02, y + 1.8, lzz + 0.5));
  for (const z of [lzz - 0.42, lzz + 0.42]) bag.add('stucco', lz([[0.05, 0], [0.04, 0.8], [0.06, 0.82], [0.06, 0.86], [0.001, 0.86]], 8, lx + 0.55, y + 1.0, z));
  bag.add('stucco', box(lx, y + 1.86, lzz - 0.58, lx + 0.7, y + 1.98, lzz + 0.58));
  bag.add('stucco', box(lx, y + 1.98, lzz - 0.5, lx + 0.66, y + 2.2, lzz + 0.5));
  for (const [z, c] of [[lzz - 0.2, 'paint_ochre'], [lzz + 0.2, 'paint_ochre'], [lzz, 'paint_white']]) bag.add(c, box(lx + 0.02, y + 1.1, z - 0.06, lx + 0.03, y + 1.6, z + 0.06));
  bag.add('terracotta', lz([[0.001, 0], [0.05, 0.005], [0.055, 0.025], [0.02, 0.04], [0.001, 0.04]], 10, lx + 0.4, y + 1.0, lzz));
  bag.add('flame', lz([[0.001, 0], [0.01, 0.01], [0.001, 0.04]], 6, lx + 0.46, y + 1.03, lzz));
  lights.push({ at: [lx + 0.5, y + 1.25, lzz], color: '#ffb46b', intensity: 1.2, distance: 4 });
  col.rect([lx, lzz - 0.6, lx + 0.7, lzz + 0.6], y, y + 1.0);
  // the painted walls of the atrium, the cubicula, the tablinum and the triclinium
  paint(bag, ar, y, 'lacquer_black', 'wall_red', 'paint_ochre', 4.6, {
    n: [[xc0 + 0.6, xc0 + 1.5], [xt0, xt1, 4.2], [xc1 - 1.5, xc1 - 0.6]], s: [[xf0, xf1, 3.0], [X0 + t + 3.4, X0 + t + 4.3]],
    w: [[za + 1.2, za + 2.1], [zm + 1.0, zm + 1.9]], e: [[za + 1.2, za + 2.1], [zm + 1.0, zm + 1.9]] });
  paint(bag, [xt0, Z0 + t, xt1, za - ti / 2], y, 'lacquer_black', 'paint_ochre', 'wall_red', 4.0, { skip: 's' });
  paint(bag, [X0 + t, Z0 + t, xt0 - ti, za - ti / 2], y, 'wall_red', 'paint_white', 'wall_red', 3.4, { s: [[xc0 + 0.6, xc0 + 1.5]] });
  paint(bag, [X0 + t, za + ti / 2, xc0 - ti / 2, zm - ti / 2], y, 'wall_red', 'paint_white', 'paint_ochre', 3.0, { e: [[za + 1.2, za + 2.1]] });
  paint(bag, [X0 + t, zm + ti / 2, xc0 - ti / 2, zs - ti / 2], y, 'wall_red', 'paint_white', 'paint_ochre', 3.0, { e: [[zm + 1.0, zm + 1.9]] });
  paint(bag, [xc1 + ti / 2, za + ti / 2, X1 - t, zm - ti / 2], y, 'wall_red', 'paint_white', 'paint_ochre', 3.0, { w: [[za + 1.2, za + 2.1]] });
  paint(bag, [xc1 + ti / 2, zm + ti / 2, X1 - t, zs - ti / 2], y, 'wall_red', 'paint_white', 'paint_ochre', 3.0, { w: [[zm + 1.0, zm + 1.9]] });
  // the tablinum: its floor of coloured marble, the master's chair and the writing table, scrolls in a case
  bag.add('opus_sectile', box(xt0 + 0.05, y, Z0 + t + 0.05, xt1 - 0.05, y + 0.012, za - ti / 2 - 0.05));
  bag.add('wood_dark', box(mx - 0.6, y + 0.72, Z0 + t + 1.2, mx + 0.6, y + 0.78, Z0 + t + 1.9));
  for (const [dx, dz] of [[-0.5, 1.3], [0.5, 1.3], [-0.5, 1.8], [0.5, 1.8]]) bag.add('wood_dark', box(mx + dx - 0.03, y, Z0 + t + dz - 0.03, mx + dx + 0.03, y + 0.72, Z0 + t + dz + 0.03));
  col.rect([mx - 0.6, Z0 + t + 1.2, mx + 0.6, Z0 + t + 1.9], y, y + 0.78);
  bag.add('wood_dark', box(mx - 0.3, y, Z0 + t + 2.3, mx + 0.3, y + 0.48, Z0 + t + 2.8)); bag.add('wood_dark', box(mx - 0.3, y + 0.48, Z0 + t + 2.72, mx + 0.3, y + 1.0, Z0 + t + 2.8));
  bag.add('wood_dark', box(xt1 - 1.6, y, Z0 + t + 0.02, xt1 - 0.3, y + 1.6, Z0 + t + 0.45)); col.rect([xt1 - 1.6, Z0 + t, xt1 - 0.3, Z0 + t + 0.45], y, y + 1.6);
  const scroll = lathe([[0.035, 0], [0.035, 0.32], [0.001, 0.32]], 8); scroll.rotateZ(Math.PI / 2);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) bag.add('linen', scroll.clone().translate(xt1 - 1.5 + k * 0.17 + 0.32, y + 0.45 + r * 0.42, Z0 + t + 0.25));
  lights.push({ at: [mx, y + 3.0, Z0 + t + 2.0], color: '#ffe0b0', intensity: 0.8, distance: 6 });
  // the triclinium: three couches round a low table on three sides (the fourth open to the door), cushions, a lamp
  const tr = [X0 + t, Z0 + t, xt0 - ti, za - ti / 2], tcx = (tr[0] + tr[2]) / 2, tcz = (tr[1] + tr[3]) / 2;
  const couch = (r, cmat) => {
    bag.add('wood_dark', box(r[0], y, r[1], r[2], y + 0.55, r[3])); bag.add('linen', box(r[0] + 0.03, y + 0.55, r[1] + 0.03, r[2] - 0.03, y + 0.68, r[3] - 0.03));
    bag.add(cmat, box(r[0] + 0.05, y + 0.68, r[1] + 0.05, r[2] - 0.05, y + 0.7, r[3] - 0.05)); col.rect(r, y, y + 0.7);
  };
  couch([tr[0] + 0.1, tr[1] + 0.1, tr[2] - 0.1, tr[1] + 1.1], 'cloth_red');
  couch([tr[0] + 0.1, tr[1] + 1.2, tr[0] + 1.1, tr[3] - 0.9], 'cloth_indigo');
  couch([tr[2] - 1.1, tr[1] + 1.2, tr[2] - 0.1, tr[3] - 0.9], 'cloth_green');
  bag.add('marble', lz([[0.001, 0.5], [0.5, 0.5], [0.5, 0.56], [0.001, 0.56]], 20, tcx, y, tcz + 0.2));
  bag.add('marble', lz([[0.12, 0], [0.06, 0.1], [0.05, 0.5], [0.001, 0.5]], 10, tcx, y, tcz + 0.2)); col.circle(tcx, tcz + 0.2, 0.5, y, y + 0.56);
  bag.add('silver', lz([[0.001, 0], [0.15, 0], [0.2, 0.04], [0.19, 0.045], [0.001, 0.02]], 14, tcx, y + 0.56, tcz + 0.2));
  bag.add('glass_lamp', lz([[0.001, 0], [0.04, 0], [0.045, 0.1], [0.03, 0.12], [0.001, 0.12]], 10, tcx + 0.25, y + 0.56, tcz + 0.05));
  // the kitchen: the masonry hearth bench with its fire and the pots, the amphorae, the latrine's partition
  const kx0 = xt1 + ti, kx1 = X1 - t;
  bag.add('brick', box(kx0 + 0.1, y, Z0 + t + 0.05, kx1 - 0.1, y + 0.85, Z0 + t + 0.9)); col.rect([kx0 + 0.1, Z0 + t, kx1 - 0.1, Z0 + t + 0.9], y, y + 0.85);
  bag.add('lacquer_black', box(kx0 + 0.4, y + 0.85, Z0 + t + 0.2, kx0 + 1.3, y + 0.87, Z0 + t + 0.75));
  bag.add('lacquer_black', box(kx0 + 0.1, y + 1.4, Z0 + t + 0.002, kx1 - 0.1, y + H - 0.2, Z0 + t + 0.012));
  bag.add('pottery_dark', lz([[0.001, 0], [0.13, 0.02], [0.16, 0.12], [0.13, 0.2], [0.14, 0.22], [0.001, 0.21]], 12, kx0 + 0.85, y + 0.87, Z0 + t + 0.48));
  bag.add('bronze', lz([[0.001, 0], [0.15, 0], [0.17, 0.1], [0.16, 0.11], [0.001, 0.02]], 12, kx0 + 1.8, y + 0.85, Z0 + t + 0.48));
  lights.push({ at: [kx0 + 0.85, y + 1.2, Z0 + t + 0.6], color: '#ff8a3a', intensity: 1.5, distance: 4 });
  const amph = lathe([[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.9], [0.06, 0.95], [0.001, 0.95]], 12);
  for (let k = 0; k < 4; k++) { const g = amph.clone(); g.rotateX(0.2); bag.add('terracotta', g.translate(kx1 - 0.35, y, Z0 + t + 1.4 + k * 0.42)); }

  // ── the thermopolium (the west shop): the L-shaped counter faced with marble, dolia sunk in its top, the stepped
  // shelf at its end, the hearth at the corner, the painted lararium and the Nereid on the counter's front
  const sh0 = X0 + t, sh1 = xf0 - ti, szf = Z1 - t, szb = zs + ti / 2;
  const cz = szf - 1.4, cxr = sh1 - 1.4;                                   // the counter's front run (along x) and its return (along z)
  bag.add('brick', box(sh0 + 0.3, y, cz - 0.6, cxr, y + 0.95, cz)); col.rect([sh0 + 0.3, cz - 0.6, cxr, cz], y, y + 0.95);
  bag.add('brick', box(cxr - 0.6, y, szb + 0.6, cxr, y + 0.95, cz - 0.6)); col.rect([cxr - 0.6, szb + 0.6, cxr, cz - 0.6], y, y + 0.95);
  bag.add('marble_smooth', box(sh0 + 0.28, y + 0.95, cz - 0.62, cxr + 0.02, y + 1.0, cz + 0.02));
  bag.add('marble_smooth', box(cxr - 0.62, y + 0.95, szb + 0.58, cxr + 0.02, y + 1.0, cz - 0.62));
  // the facing of broken coloured marble on the front (opus sectile of offcuts), the painted Nereid panel on the return
  bag.add('opus_sectile', box(sh0 + 0.3, y + 0.05, cz, cxr, y + 0.9, cz + 0.012));
  bag.add('pavonazzetto', box(sh0 + 0.3, y + 0.9, cz, cxr, y + 0.95, cz + 0.02));
  bag.add('paint_ochre', box(cxr, y + 0.1, szb + 0.7, cxr + 0.012, y + 0.88, cz - 0.7));
  bag.add('egyptian_blue', box(cxr + 0.012, y + 0.18, szb + 0.85, cxr + 0.02, y + 0.5, cz - 0.85));
  bag.add('plaster_white', box(cxr + 0.02, y + 0.45, (szb + cz) / 2 - 0.3, cxr + 0.026, y + 0.75, (szb + cz) / 2 + 0.25));
  // three dolia sunk in the front run, their rims flush with the marble, a lid on one; the ladle
  for (let k = 0; k < 3; k++) {
    const dx = sh0 + 0.9 + k * 0.85, dz = cz - 0.3;
    bag.add('terracotta', lz([[0.2, 0], [0.22, 0.02], [0.22, 0.035], [0.18, 0.035], [0.18, 0.0]], 16, dx, y + 0.98, dz));
    bag.add('lacquer_black', lz([[0.001, 0], [0.18, 0], [0.001, 0.001]], 16, dx, y + 0.985, dz));
    if (k === 1) bag.add('wood_dark', lz([[0.001, 0], [0.21, 0], [0.21, 0.025], [0.001, 0.025]], 16, dx, y + 1.01, dz));
  }
  // the stepped shelf at the return's end for the jugs and cups
  for (let k = 0; k < 3; k++) bag.add('marble_smooth', box(cxr - 0.6, y + 1.0 + k * 0.16, szb + 0.6 + k * 0.12, cxr, y + 1.16 + k * 0.16, szb + 1.3));
  const jug = lathe([[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.03, 0.24], [0.04, 0.26], [0.001, 0.26]], 10);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) bag.add(j === 1 ? 'pottery_dark' : 'terracotta', jug.clone().translate(cxr - 0.45 + j * 0.15, y + 1.16 + k * 0.16, szb + 0.68 + k * 0.12 + 0.02));
  bag.add('bronze', lz([[0.001, 0], [0.11, 0], [0.13, 0.04], [0.12, 0.045], [0.001, 0.01]], 12, sh0 + 1.3, y + 1.0, cz - 0.15));
  // the hearth behind the counter in the corner, a pot on it, the soot on the wall; amphorae in a rack against the back wall
  bag.add('brick', box(sh0 + 0.05, y, szb + 0.05, sh0 + 1.1, y + 0.8, szb + 0.95)); col.rect([sh0 + 0.05, szb + 0.05, sh0 + 1.1, szb + 0.95], y, y + 0.8);
  bag.add('lacquer_black', box(sh0 + 0.2, y + 0.8, szb + 0.2, sh0 + 0.95, y + 0.82, szb + 0.8));
  bag.add('pottery_dark', lz([[0.001, 0], [0.12, 0.02], [0.15, 0.12], [0.12, 0.2], [0.13, 0.22], [0.001, 0.21]], 12, sh0 + 0.58, y + 0.82, szb + 0.5));
  bag.add('lacquer_black', box(sh0 + 0.05, y + 1.3, szb + 0.002, sh0 + 1.4, y + 3.2, szb + 0.012));
  lights.push({ at: [sh0 + 0.6, y + 1.1, szb + 0.6], color: '#ff8a3a', intensity: 1.5, distance: 4 });
  for (let k = 0; k < 4; k++) { const g = amph.clone(); g.rotateX(0.22); bag.add('terracotta', g.translate(sh0 + 1.6 + k * 0.42, y, szb + 0.3)); }
  // the painted lararium on the shop's back wall: the genius between the two lares, the serpent below
  bag.add('plaster_white', box(sh0 + 2.0, y + 1.5, szb + 0.002, sh0 + 3.4, y + 2.7, szb + 0.012));
  for (const [x, c] of [[sh0 + 2.25, 'wall_red'], [sh0 + 2.7, 'paint_white'], [sh0 + 3.15, 'wall_red']]) bag.add(c, box(x - 0.08, y + 1.85, szb + 0.012, x + 0.08, y + 2.5, szb + 0.016));
  bag.add('fresco_green', box(sh0 + 2.1, y + 1.6, szb + 0.012, sh0 + 3.3, y + 1.72, szb + 0.016));
  bag.add('travertine', box(sh0 + 2.3, y + 1.45, szb, sh0 + 3.1, y + 1.5, szb + 0.25));
  // a lamp hanging over the counter
  bag.add('bronze', box(cxr - 0.9, y + 2.2, cz - 0.31, cxr - 0.88, y + 3.0, cz - 0.29));
  bag.add('bronze', lz([[0.001, 0], [0.06, 0.01], [0.065, 0.03], [0.02, 0.05], [0.001, 0.05]], 10, cxr - 0.89, y + 2.15, cz - 0.3));
  lights.push({ at: [cxr - 0.89, y + 2.1, cz - 0.3], color: '#ffb46b', intensity: 1.8, distance: 6 });

  // ── the wine shop (the east shop): amphorae stacked along the walls, a counter of boards, a pair of scales
  const ex0 = xf1 + ti, ex1 = X1 - t;
  for (let k = 0; k < 8; k++) { const g = amph.clone(); g.rotateZ(k % 2 ? 0.2 : -0.2); bag.add('terracotta', g.translate(ex0 + 0.35 + (k % 4) * 0.45, y, szb + 0.35 + Math.floor(k / 4) * 0.55)); }
  col.rect([ex0, szb, ex0 + 2.0, szb + 1.0], y, y + 1.0);
  bag.add('timber', box(ex1 - 1.0, y, szb + 1.5, ex1 - 0.4, y + 0.9, szf - 1.0)); col.rect([ex1 - 1.0, szb + 1.5, ex1 - 0.4, szf - 1.0], y, y + 0.9);
  bag.add('bronze', box(ex1 - 0.72, y + 0.9, szb + 2.4, ex1 - 0.68, y + 1.35, szb + 2.44));
  bag.add('bronze', box(ex1 - 0.72, y + 1.33, szb + 2.1, ex1 - 0.68, y + 1.35, szb + 2.74));
  for (const z of [szb + 2.12, szb + 2.72]) bag.add('bronze', lz([[0.001, 0], [0.1, 0], [0.11, 0.03], [0.001, 0.01]], 10, ex1 - 0.7, y + 1.05, z));
  // a painted sign over the fauces' door: the house's name in red on white
  bag.add('plaster_white', box(xf0 + 0.2, y + 3.2, Z1 + 0.002, xf1 - 0.2, y + 3.65, Z1 + 0.014));
  bag.add('wall_red', box(xf0 + 0.35, y + 3.36, Z1 + 0.014, xf1 - 0.35, y + 3.49, Z1 + 0.02));
  // the cubicula: a bed (lectus) with its mattress and coverlet in two of them, a chest in another
  const bed = (x0, z0, x1, z1) => { bag.add('wood_dark', box(x0, y, z0, x1, y + 0.5, z1)); bag.add('linen', box(x0 + 0.04, y + 0.5, z0 + 0.04, x1 - 0.04, y + 0.66, z1 - 0.04)); bag.add('cloth_maroon', box(x0 + 0.05, y + 0.66, z0 + 0.5, x1 - 0.05, y + 0.68, z1 - 0.05)); bag.add('wood_dark', box(x0, y + 0.5, z0, x1, y + 0.95, z0 + 0.08)); col.rect([x0, z0, x1, z1], y, y + 0.95); };
  bed(X0 + t + 0.1, za + ti / 2 + 0.1, X0 + t + 1.0, za + ti / 2 + 2.0 - 0.95 + 1.0);
  bed(X1 - t - 1.0, zm + ti / 2 + 0.1, X1 - t - 0.1, zm + ti / 2 + 2.0);
  bag.add('wood_dark', box(X0 + t + 0.1, y, zs - ti / 2 - 0.7, X0 + t + 1.1, y + 0.6, zs - ti / 2 - 0.1)); col.rect([X0 + t + 0.1, zs - ti / 2 - 0.7, X0 + t + 1.1, zs - ti / 2 - 0.1], y, y + 0.6);
  void W; void rand;
}

/** litter: { at [x, z], y, rot } — the couch on its frame, the canopy on four posts with curtains drawn back, the two poles (at shoulder height). */
function litter(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a);
  const put = (mat, g) => { g.rotateY(a); g.translate(x, y, z); bag.add(mat, g); };
  const L = 2.1, B = 0.95, PY = 1.42;
  put('wood_dark', box(-B / 2, PY - 0.35, -L / 2, B / 2, PY - 0.15, L / 2));
  put('linen', box(-B / 2 + 0.05, PY - 0.15, -L / 2 + 0.05, B / 2 - 0.05, PY - 0.02, L / 2 - 0.05));
  put('cloth_red', box(-B / 2 + 0.06, PY - 0.02, -L / 2 + 0.06, B / 2 - 0.06, PY, -L / 2 + 0.5));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('wood_dark', box(dx * (B / 2 - 0.04) - 0.03, PY - 0.35, dz * (L / 2 - 0.04) - 0.03, dx * (B / 2 - 0.04) + 0.03, PY + 0.95, dz * (L / 2 - 0.04) + 0.03));
  put('cloth_maroon', box(-B / 2 - 0.04, PY + 0.95, -L / 2 - 0.04, B / 2 + 0.04, PY + 1.0, L / 2 + 0.04));
  // the curtains gathered at the posts
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('cloth_ochre', box(dx * (B / 2 - 0.04) - 0.07, PY + 0.05, dz * (L / 2 - 0.04) - 0.07, dx * (B / 2 - 0.04) + 0.07, PY + 0.95, dz * (L / 2 - 0.04) + 0.07));
  // the poles fastened along the sides, long enough for bearers before and behind
  for (const sx of [-1, 1]) put('timber', box(sx * 0.55 - 0.04, PY - 0.04, -2.4, sx * 0.55 + 0.04, PY + 0.04, 2.4));
  for (const sz of [-1, 1]) put('timber', box(-0.59, PY - 0.3, sz * (L / 2 - 0.1) - 0.03, 0.59, PY - 0.24, sz * (L / 2 - 0.1) + 0.03));
  col.circle(x, z, 1.0, y + PY - 0.4, y + PY + 1.0); void c; void s;
}

registerStyle('rome-site', { trim: () => {}, opening: () => {}, column: () => {}, elements: { ...STYLES.life.elements, domus, litter }, objects: {} });
