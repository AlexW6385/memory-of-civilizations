// Parliament Square about 1870 (docs/settlements/london.md §5c): the new square laid out in 1868 with the
// Westminster Improvements — lawns inside a low granite kerb and iron railings, gravel walks crossing at
// round plazas, Canning's bronze on its granite plinth (moved here in 1867), benches, flower beds, a horse
// trough and a cab rank; round it the cabs, the barrel organ and the Punch and Judy booth of the London street.
//
// parliament_square: { rect, y, gates: [[x, z]…], walkZ, walkX, statue: [x, z], bed: [x, z] }

import { box, lathe, rod } from '../../core/geom.js';
import { statue } from './rooms.js';

const RAIL = 'iron', KERB = 'granite_grey';
/** an iron railing of spear-headed bars between two points, the kerb of granite under it; gaps [[a, b]…] (fractions) are gates */
function railing(bag, col, [ax, az], [bx, bz], y, gaps = [], { h = 1.05, pitch = 0.21, kerb = true } = {}) {
  const L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L, along = Math.abs(dx) > 0.5;
  const spans = []; let a = 0;
  for (const [p, q] of [...gaps].sort((m, n) => m[0] - n[0])) { if (p * L > a) spans.push([a, p * L]); a = q * L; }
  if (a < L) spans.push([a, L]);
  for (const [s0, s1] of spans) {
    const x0 = ax + dx * s0, z0 = az + dz * s0, x1 = ax + dx * s1, z1 = az + dz * s1, e = 0.05;
    const R = (m, ya, yb, w) => bag.add(m, along ? box(Math.min(x0, x1), ya, z0 - w, Math.max(x0, x1), yb, z0 + w) : box(x0 - w, ya, Math.min(z0, z1), x0 + w, yb, Math.max(z0, z1)));
    if (kerb) R(KERB, y - 0.1, y + 0.16, 0.16);
    R(RAIL, y + 0.2, y + 0.26, e * 0.6); R(RAIL, y + h - 0.12, y + h - 0.06, e * 0.6);
    const n = Math.max(1, Math.round((s1 - s0) / pitch));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n;
      bag.add(RAIL, box(x - 0.011, y + 0.16, z - 0.011, x + 0.011, y + h - 0.05, z + 0.011));
      if (i % 2 === 0) bag.add(RAIL, lathe([[0.03, 0], [0.012, 0.03], [0.001, 0.1]], 4, null, x, y + h - 0.05, z));
      if (i % 12 === 0) bag.add(RAIL, box(x - 0.04, y + 0.16, z - 0.04, x + 0.04, y + h + 0.02, z + 0.04));       // a standard
    }
    col.segment([x0, z0], [x1, z1], 0.12, y, y + h);
  }
}
/** a gravel walk: a flat slab a hair over the lawn, edged in kerb */
function walk(bag, r, y) { bag.add('pebbles', box(r[0], y + 0.01, r[1], r[2], y + 0.045, r[3])); }
/** a bench on cast-iron ends with timber slats, facing +z (rot 0), −z, +x or −x by rot */
export function parkBench(bag, col, x, z, y, rot) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + yb, Math.max(a[1], b[1]))); };
  for (const u of [-0.8, 0.8]) { B('iron', u - 0.03, u + 0.03, 0, 0.45, -0.22, 0.22); B('iron', u - 0.03, u + 0.03, 0.45, 0.9, -0.22, -0.16); B('iron', u - 0.04, u + 0.04, 0, 0.05, -0.26, 0.26); }
  for (const [ya, yb, v0, v1] of [[0.44, 0.47, -0.22, -0.04], [0.44, 0.47, -0.02, 0.2], [0.55, 0.62, -0.24, -0.19], [0.7, 0.77, -0.24, -0.19], [0.85, 0.92, -0.24, -0.19]]) B('timber', -0.88, 0.88, ya, yb, v0, v1);
  const a = P(-0.9, -0.26), b = P(0.9, 0.26); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 0.9);
}
/** a round bed of bedding plants in rings of colour on a mound, edged in a low kerb */
function roundBed(bag, col, x, z, y, r, rings) {
  bag.add(KERB, lathe([[r + 0.14, 0], [r + 0.14, 0.2], [r, 0.2], [r, 0.12]], 20, null, x, y, z));
  bag.add('sod', lathe([[r, 0.12], [r * 0.7, 0.3], [0.001, 0.46]], 20, null, x, y, z));
  rings.forEach((m, i) => { const r0 = r * (0.96 - i * 0.26), r1 = r * (0.74 - i * 0.26); if (r1 > 0.1) bag.add(m, lathe([[r0, 0.13 + 0.17 * (1 - r0 / r) * 1.4], [r1, 0.14 + 0.17 * (1 - r1 / r) * 1.4 + 0.05]], 20, null, x, y + 0.03, z)); });
  col.circle(x, z, r + 0.15, y, y + 0.3);
}
/** Canning on his plinth: stepped granite, a die with a bronze plate, a cornice, the bronze figure in his classical robe */
function canning(ctx, x, z, y, rot) {
  const { bag, col } = ctx;
  for (const [h, w] of [[0.3, 4.4], [0.3, 3.9], [0.3, 3.4]]) { bag.add('granite_block', box(x - w / 2, y, z - w / 2, x + w / 2, y + h, z + w / 2)); y += h; }
  bag.add('granite_block', box(x - 1.3, y, z - 1.3, x + 1.3, y + 2.6, z + 1.3));
  bag.add('granite_grey', box(x - 1.5, y + 2.6, z - 1.5, x + 1.5, y + 2.85, z + 1.5)); bag.add('granite_grey', box(x - 1.4, y + 2.85, z - 1.4, x + 1.4, y + 3.0, z + 1.4));
  bag.add('granite_grey', box(x - 1.45, y, z - 1.45, x + 1.45, y + 0.25, z + 1.45));
  for (const [dx, dz] of [[0, 1.31], [0, -1.31], [1.31, 0], [-1.31, 0]]) bag.add('bronze', dx ? box(x + dx - 0.02 + (dx > 0 ? 0.02 : -0.02), y + 0.9, z - 0.5, x + dx + 0.02 + (dx > 0 ? 0.02 : -0.02), y + 1.9, z + 0.5) : box(x - 0.5, y + 0.9, z + dz - 0.02 + (dz > 0 ? 0.02 : -0.02), x + 0.5, y + 1.9, z + dz + 0.02 + (dz > 0 ? 0.02 : -0.02)));
  col.rect([x - 2.2, z - 2.2, x + 2.2, z + 2.2], ctx.y0 ?? y - 0.9, y + 3.2);
  statue(ctx, x, z, y + 3.0, rot, 1827, { m: 'bronze', h: 2.9, over: 'cloak', hair: 'short' });
}
/** a horse trough of granite for the cab rank (the Metropolitan Free Drinking Fountain and Cattle Trough Association's pattern), a water-filled top */
function trough(bag, col, x, z, y, rot) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + yb, Math.max(a[1], b[1]))); };
  B('granite_grey', -1.3, 1.3, 0, 0.7, -0.4, 0.4); B('water', -1.2, 1.2, 0.62, 0.66, -0.3, 0.3);
  B('granite_grey', -1.3, 1.3, 0.7, 0.78, -0.45, 0.45);
  const a = P(-1.35, -0.5), b = P(1.35, 0.5); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 0.8);
}

export function parliamentSquare(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, wz = el.walkZ ?? (z0 + z1) / 2, wx = el.walkX ?? (x0 + x1) / 2;
  const ix0 = x0 + 1.6, iz0 = z0 + 1.6, ix1 = x1 - 1.6, iz1 = z1 - 1.6, hw = 1.5, W = (a, b) => (a - 0.0) / (b - 0.0);
  // the railing round the lawns with a gate where each walk meets it, and the gaps for the street crossings at the cab rank side
  const fz = (z) => (z - iz0) / (iz1 - iz0), fx = (x) => (x - ix0) / (ix1 - ix0), g = 1.7;
  railing(bag, col, [ix0, iz0], [ix1, iz0], y, [[fx(wx) - g / (ix1 - ix0), fx(wx) + g / (ix1 - ix0)]]);
  railing(bag, col, [ix0, iz1], [ix1, iz1], y, [[fx(wx) - g / (ix1 - ix0), fx(wx) + g / (ix1 - ix0)], [fx(ix0 + 14) - 0.01, fx(ix0 + 16) + 0.01]]);
  railing(bag, col, [ix0, iz0], [ix0, iz1], y, [[fz(wz) - g / (iz1 - iz0), fz(wz) + g / (iz1 - iz0)]]);
  railing(bag, col, [ix1, iz0], [ix1, iz1], y, [[fz(wz) - g / (iz1 - iz0), fz(wz) + g / (iz1 - iz0)]]);
  void W;
  // the gravel walks: along z = walkZ and x = walkX, and the diagonals to the corners' beds; the round plazas where they meet
  walk(bag, [ix0, wz - hw, ix1, wz + hw], y); walk(bag, [wx - hw, iz0, wx + hw, iz1], y);
  for (const [px, pz] of [el.statue, [wx, wz]]) bag.add('pebbles', lathe([[6.2, 0.01], [6.2, 0.045], [0.001, 0.045]], 28, null, px, y, pz));
  for (const [px, pz] of [el.statue, [wx, wz]]) bag.add(KERB, lathe([[6.3, 0.0], [6.3, 0.1], [6.12, 0.1], [6.12, 0.0]], 28, null, px, y, pz));
  // Canning at the east plaza, a round bed of bedding plants at the centre, the beds in the four quarters
  canning(ctx, el.statue[0], el.statue[1], y, Math.PI / 2 + 0.2);
  const beds = [['cloth_red', 'cloth_ochre', 'cloth_blue'], ['cloth_blue', 'cloth_white', 'cloth_red'], ['cloth_ochre', 'cloth_red', 'cloth_green'], ['cloth_white', 'cloth_blue', 'cloth_ochre']];
  roundBed(bag, col, wx, wz, y, 3.4, beds[0]);
  [[(ix0 + wx) / 2, (iz0 + wz) / 2], [(ix0 + wx) / 2, (iz1 + wz) / 2], [(wx + el.statue[0]) / 2 - 6, (iz0 + wz) / 2], [(wx + el.statue[0]) / 2 - 6, (iz1 + wz) / 2], [ix1 - 7, (iz0 + wz) / 2], [ix1 - 7, (iz1 + wz) / 2]]
    .forEach(([bx, bz], i) => roundBed(bag, col, bx, bz, y, 2.0, beds[(i + 1) % 4]));
  // clipped privet beside the walks' gates: low boxes of leaf
  for (const [hx0, hz0, hx1, hz1] of [[ix0 + 0.4, iz0 + 0.4, ix0 + 6, iz0 + 1.1], [ix1 - 6, iz0 + 0.4, ix1 - 0.4, iz0 + 1.1], [ix0 + 0.4, iz1 - 1.1, ix0 + 6, iz1 - 0.4], [ix1 - 6, iz1 - 1.1, ix1 - 0.4, iz1 - 0.4]]) { bag.add('flax_leaf', box(hx0, y, hz0, hx1, y + 0.9, hz1)); col.rect([hx0, hz0, hx1, hz1], y, y + 0.9); }
  // the benches along the walks, backs to the lawns
  for (const [bx, bz, rot] of [[wx - 12, wz - 2.0, Math.PI], [wx - 12, wz + 2.0, 0], [wx + 8, wz - 2.0, Math.PI], [wx + 8, wz + 2.0, 0], [wx - 34, wz - 2.0, Math.PI], [wx - 34, wz + 2.0, 0],
    [wx - 2.0, iz0 + 12, -Math.PI / 2], [wx + 2.0, iz0 + 12, Math.PI / 2], [wx - 2.0, iz1 - 12, -Math.PI / 2], [wx + 2.0, iz1 - 12, Math.PI / 2], [el.statue[0] - 5.2, el.statue[1] - 3, Math.PI], [el.statue[0] - 5.2, el.statue[1] + 3, 0]]) parkBench(bag, col, bx, bz, y, rot);
  // the cab rank on the south side: a horse trough at the kerb
  trough(bag, col, ix0 + 20, iz1 + 0.9 + 1.3, y, 0);
}

/** barrel_organ: { at, y, rot } — the street organ on its two wheels and a pair of shafts, the crank at the end, the painted front */
export function barrelOrgan(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + yb, Math.max(a[1], b[1]))); };
  B('wood_dark', -0.45, 0.45, 0.62, 1.12, -0.28, 0.28); B('timber', -0.47, 0.47, 1.12, 1.17, -0.3, 0.3);
  B('paint_blue', -0.4, 0.4, 0.7, 1.05, -0.285, -0.27); B('gold', -0.3, 0.3, 0.85, 0.9, -0.288, -0.285);
  for (let k = -3; k <= 3; k++) B('gold', k * 0.1 - 0.012, k * 0.1 + 0.012, 0.95, 1.1, -0.29, -0.285);       // the pipes' fronts
  B('wood_dark', 0.46, 0.6, 0.9, 0.96, -0.03, 0.03); B('iron', 0.58, 0.64, 0.9, 1.05, 0.02, 0.05);               // the crank
  for (const sd of [-1, 1]) { const p = P(0, sd * 0.36); bag.add('wood_dark', lathe([[0.3, -0.03], [0.3, 0.03], [0.26, 0.03], [0.26, -0.03]], 14, null, p[0], y + 0.3, p[1])); bag.add('iron', lathe([[0.04, 0], [0.04, 0.02]], 5, null, p[0], y + 0.3, p[1])); }
  for (const sd of [-1, 1]) B('timber', -0.45, 1.6, 0.58, 0.62, sd * 0.3 - 0.02, sd * 0.3 + 0.02);
  for (const [u, v] of [[-0.4, -0.2], [-0.4, 0.2], [0.4, -0.2], [0.4, 0.2]]) B('wood_dark', u - 0.03, u + 0.03, 0.3, 0.62, v - 0.03, v + 0.03);
  const a = P(-0.6, -0.4), b = P(0.7, 0.4); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 1.2);
}

/** punch_booth: { at, y, rot } — the striped canvas booth on its trestle frame, the proscenium with its little stage and the bag below */
export function punchBooth(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (m, u0, u1, ya, yb, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(m, box(Math.min(a[0], b[0]), y + ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + yb, Math.max(a[1], b[1]))); };
  const stripes = (u0, u1, v0, v1, ya, yb, along) => { const n = 8; for (let k = 0; k < n; k++) { const m = k % 2 ? 'cloth_white' : 'cloth_red'; if (along === 'u') B(m, u0 + (u1 - u0) * k / n, u0 + (u1 - u0) * (k + 1) / n, ya, yb, v0, v1); else B(m, u0, u1, ya, yb, v0 + (v1 - v0) * k / n, v0 + (v1 - v0) * (k + 1) / n); } };
  // the front with its opening, the sides and the back, the sloped canopy; the stage ledge, the frame of the proscenium
  stripes(-0.6, 0.6, -0.5, -0.47, 0, 0.95, 'u'); stripes(-0.6, 0.6, -0.5, -0.47, 1.65, 2.35, 'u'); stripes(-0.6, -0.32, -0.5, -0.47, 0.95, 1.65, 'u'); stripes(0.32, 0.6, -0.5, -0.47, 0.95, 1.65, 'u');
  stripes(-0.6, -0.57, -0.5, 0.5, 0, 2.35, 'v'); stripes(0.57, 0.6, -0.5, 0.5, 0, 2.35, 'v'); stripes(-0.6, 0.6, 0.47, 0.5, 0, 2.35, 'u');
  B('cloth_red', -0.65, 0.65, 2.35, 2.42, -0.55, 0.55);
  B('gold', -0.34, 0.34, 0.93, 0.97, -0.55, -0.45); B('gold', -0.34, -0.31, 0.95, 1.67, -0.52, -0.46); B('gold', 0.31, 0.34, 0.95, 1.67, -0.52, -0.46); B('gold', -0.34, 0.34, 1.65, 1.69, -0.52, -0.46);
  B('paint_blue', -0.3, 0.3, 0.97, 1.65, -0.46, -0.44);
  for (const [u, v] of [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]]) B('wood_dark', u - 0.03, u + 0.03, 0, 2.35, v - 0.03, v + 0.03);
  const a = P(-0.7, -0.6), b = P(0.7, 0.6); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 2.4);
  void rod;
}
