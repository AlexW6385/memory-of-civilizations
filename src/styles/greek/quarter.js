// The potters' workshops of the Kerameikos and the South-East Fountain House (docs/settlements/athens.md §11a–§11b).
// potter_works: a workshop of 17 × 15 m on a lane — the workroom on the street with its wide opening (the wheel, the shelves
// of vases, the bench, by trade: potter, vase-painter, tile-maker, coroplast), the store, and behind them the yard walled
// in mudbrick: the updraught kiln with its firewood and ash, two settling pits for the clay, racks of unfired pots drying,
// a lean-to shed, a pithos of water, finished ware stacked. Built in a local frame (u along the front, v from the front
// back). fountain_house: the long limestone fountain with its colonnaded front, four lion-head spouts over a trough.

import { STYLES } from '../../core/build.js';
import { box, lathe, frustum, rod } from '../../core/geom.js';
import { frame, B } from './agora.js';
import { rangeRoof, trapeza } from './house-interior.js';
import { vase, leaning, roofTiles, kiln } from './vessels.js';
import { basin } from './objects.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The things every local-frame builder needs: rect writers, walls with doorways. */
export function kit(ctx, rect, front, y) {
  const { bag, col } = ctx, F = frame(rect, front);
  const R = (u0, v0, u1, v1, y0, y1, m, solid = true) => { const r = F.R(u0, v0, u1, v1); B(bag, m, r, y + y0, y + y1); if (solid) col.rect(r, y + y0, y + y1); };
  /** A wall along u (alongU) at v = c, or along v at u = c, from a to b, thickness t, height H, doorways [[d0, d1, height?]]; a stone socle, plaster above, a timber lintel. */
  const wall = (alongU, c, a, b, H, doors = [], m = 'mud_plaster', t = 0.45) => {
    const rr = (p, q, y0, y1, mat, solid = true) => (alongU ? R(p, c - t / 2, q, c + t / 2, y0, y1, mat, solid) : R(c - t / 2, p, c + t / 2, q, y0, y1, mat, solid));
    const seg = (p, q) => { if (q - p < 0.02) return; rr(p, q, -0.6, 0.7, 'rubble'); rr(p, q, 0.7, H, m); };
    let u = a;
    for (const [d0, d1, dh = 2.15] of [...doors].sort((p, q) => p[0] - q[0])) {
      seg(u, d0); rr(d0, d1, dh, H, m); rr(d0 - 0.1, d1 + 0.1, dh - 0.12, dh + 0.02, 'timber', false);
      rr(d0, d1, -0.1, 0.04, 'limestone', false); u = d1;
    }
    seg(u, b);
  };
  return { F, R, wall };
}
/** A pent roof of tile over a local rectangle, rising toward the back (v larger); a timber ceiling under it. */
function shed(ctx, F, [u0, v0, u1, v1], y, yLow, yHigh) {
  const r = F.R(u0, v0, u1, v1), { bag } = ctx, [x0, z0, x1, z1] = r;
  const lowZ = F.out[1] > 0 ? 'zp' : F.out[1] < 0 ? 'zn' : null;
  const lowX = F.out[0] > 0 ? 'xp' : F.out[0] < 0 ? 'xn' : null;
  const ins = { 0: 0, 1: 0, 2: 0, 3: 0 };       // xn, xp, zn, zp
  if (lowZ === 'zp') ins[3] = z1 - z0; else if (lowZ === 'zn') ins[2] = z1 - z0; else if (lowX === 'xp') ins[1] = x1 - x0; else ins[0] = x1 - x0;
  bag.add('roof_tile', frustum([x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], y + yLow, y + yHigh, ins[0], ins[1], ins[2], ins[3]));
  bag.add('timber', box(x0, y + yLow - 0.1, z0, x1, y + yLow, z1));
}
/** A pent roof of tile over a world rectangle, its low edge on `low` ('xn' | 'xp' | 'zn' | 'zp'), from yLow up to yHigh, with a timber ceiling at yLow. */
export function pent(ctx, [x0, z0, x1, z1], low, y, yLow, yHigh, over = 0.2) {
  const ins = [0, 0, 0, 0], k = { xn: 0, xp: 1, zn: 2, zp: 3 }[low];
  ins[k] = k < 2 ? x1 - x0 : z1 - z0;
  ctx.bag.add('roof_tile', frustum([x0 - over, z0 - over, x1 + over, z1 + over], y + yLow, y + yHigh, ...ins));
  ctx.bag.add('timber', box(x0, y + yLow - 0.1, z0, x1, y + yLow, z1));
}
export function figurine(bag, x, y, z, s = 1, mat = 'terracotta') {
  bag.add(mat, lathe([[0.001, 0], [0.05 * s, 0], [0.05 * s, 0.04 * s], [0.032 * s, 0.13 * s], [0.04 * s, 0.2 * s], [0.026 * s, 0.22 * s], [0.03 * s, 0.26 * s], [0.02 * s, 0.29 * s], [0.001, 0.29 * s]], 8, null, x, y, z));
}

/**
 * potter_works: { rect [x0, z0, x1, z1] (17 × 15), front ('s' | 'n': the lane), y, seed, trade ('potter' | 'painter' | 'tile' | 'coroplast'),
 * kiln: [x, z, rot] (world), shed ('l' | 'r': the side of the yard under the lean-to), firing (a fire in the kiln's mouth) }.
 */
function potterWorks(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, rand = rng(el.seed ?? 1), [x0, z0, x1, z1] = el.rect, front = el.front ?? 's';
  const { F, R, wall } = kit(ctx, el.rect, front, y), L = F.L, D = F.D, Dr = 5.4, ur = 9.6, H = 3.0, YH = 2.7, t = 0.45, trade = el.trade ?? 'potter';
  const flip = el.shed === 'r';                                   // the yard's free side is on the left unless the kiln stands on the left
  const U = (u) => (flip ? L - u : u), RU = (a, b) => (flip ? [L - b, L - a] : [a, b]);
  const Y = (a, v0, b, v1, y0, y1, m, solid = true) => { const [p, q] = RU(a, b); R(p, v0, q, v1, y0, y1, m, solid); };
  // the floors: the workroom and the store of beaten lime-earth, the yard of pebbles
  R(0, 0, L, Dr, -0.3, 0, 'lime_plaster', false); col.floor(F.R(0, 0, L, Dr), y);
  R(0, Dr, L, D, -0.3, -0.02, 'pebbles', false); col.floor(F.R(0, Dr, L, D), y - 0.02);
  // the walls: the street front with the wide opening and the store's door, the range's back wall to the yard, the partition, the sides, the yard's back wall
  wall(true, t / 2, 0, L, H, [[1.0, ur - 1.0, 2.45], [ur + 1.2, ur + 2.2]]);
  wall(true, Dr - t / 2, 0, L, H, [[1.6, 3.9, 2.35], [5.4, 6.4], [ur + 1.2, ur + 2.2]]);
  wall(false, ur, t, Dr - t, H, [[Dr / 2 - 0.5, Dr / 2 + 0.5]]);
  for (const c of [t / 2, L - t / 2]) { wall(false, c, 0, Dr, H); wall(false, c, Dr, D, YH); }
  wall(true, D - t / 2, 0, L, YH);
  rangeRoof(ctx, F.R(0, 0, L, Dr), y, H);
  // the yard walls' coping of tile
  for (const [a, b, c, d] of [[0, D - t - 0.05, L, D + 0.05], [-0.05, Dr, t + 0.05, D], [L - t - 0.05, Dr, L + 0.05, D]]) R(a, b, c, d, YH, YH + 0.1, 'roof_tile', false);
  // the lane in front: ware on display — a bench with vases and two leaning stacks of amphorae against the wall
  const [bu0, bu1] = [ur - 1.0 + 0.2, ur - 0.1];
  void bu0; void bu1;
  {
    const [sx, sz] = F.P(0.4, -0.45), [sx2, sz2] = F.P(ur + 0.9, -0.45);
    leaning(bag, sx, y, sz, 3, F.alongX ? 0.28 : 0, F.alongX ? 0 : 0.28, { s: 1, dark: false, tilt: -0.1 * F.out[1], rot: 0 });
    leaning(bag, sx2, y, sz2, 3, 0.28, 0, { s: 0.9, dark: rand() < 0.5, tilt: 0.1 * F.out[1] });
  }

  // ── the workroom (u 0.45…ur − 0.2, v 0.45…Dr − 0.45): shelves of vases along the west wall, then by trade
  const WU = [t, ur - t / 2], WV = [t, Dr - t];
  const tiers = [0.5, 1.1, 1.7], shelfNames = [['amphora', 'krater', 'amphora', 'psykter'], ['hydria', 'oinochoe', 'hydria', 'oinochoe'], ['lekythos', 'kylix', 'lekythos', 'kylix']];
  R(WU[0], 0.9, WU[0] + 0.42, Dr - 0.9, 0, 0.04, 'wood_dark', false);
  for (const [i, h] of tiers.entries()) {
    R(WU[0], 0.9, WU[0] + 0.42, Dr - 0.9, h - 0.04, h, 'timber', false);
    for (const v of [0.95, Dr - 0.95]) R(WU[0], v - 0.04, WU[0] + 0.42, v + 0.04, 0, h, 'wood_dark', false);
    let k = 0;
    for (let v = 1.2; v < Dr - 1.0; v += i === 2 ? 0.34 : 0.55, k++) {
      const [px, pz] = F.P(WU[0] + 0.21, v), nm = shelfNames[i][(k + Math.floor(rand() * 3)) % 4];
      vase(bag, nm, px, y + h, pz, { s: i === 0 ? 1 : 0.9, dark: rand() < 0.65, seg: 10 });
    }
  }
  col.rect(F.R(WU[0], 0.9, WU[0] + 0.42, Dr - 0.9), y, y + 1.9);
  // the wheel: a stone socket and the turned disc, a vase half-risen on it, the stool; the clay bin; a bucket
  const wheelAt = (u, v, withPot) => {
    const [wx, wz] = F.P(u, v);
    bag.add('limestone', lathe([[0.24, 0], [0.22, 0.4], [0.001, 0.42]], 12, null, wx, y, wz));
    bag.add('wood_dark', lathe([[0.04, 0.4], [0.04, 0.52]], 6, null, wx, y, wz));
    bag.add('timber', lathe([[0.001, 0.5], [0.36, 0.5], [0.36, 0.56], [0.001, 0.56]], 16, null, wx, y, wz));
    if (withPot) bag.add('terracotta', lathe([[0.001, 0.56], [0.1, 0.56], [0.15, 0.62], [0.17, 0.7], [0.13, 0.78], [0.07, 0.83], [0.08, 0.88], [0.055, 0.88], [0.05, 0.8], [0.12, 0.7], [0.1, 0.62], [0.001, 0.6]], 12, null, wx, y, wz));
    col.circle(wx, wz, 0.4, y, y + 0.56);
  };
  const stool = (u, v) => { const [sx, sz] = F.P(u, v); bag.add('wood_dark', box(sx - 0.17, y + 0.34, sz - 0.17, sx + 0.17, y + 0.38, sz + 0.17)); for (const [a, b] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) bag.add('wood_dark', box(sx + a - 0.025, y, sz + b - 0.025, sx + a + 0.025, y + 0.34, sz + b + 0.025)); col.rect([sx - 0.2, sz - 0.2, sx + 0.2, sz + 0.2], y, y + 0.4); };
  const bin = (u0, v0, u1, v1) => { R(u0, v0, u1, v1, 0, 0.6, 'rubble'); R(u0 + 0.08, v0 + 0.08, u1 - 0.08, v1 - 0.08, 0.6, 0.64, 'earth_wall', false); };
  const bench = (u0, v0, u1, v1, h = 0.8) => { R(u0, v0, u1, v1, h - 0.06, h, 'timber'); for (const [a, b] of [[u0 + 0.08, v0 + 0.08], [u1 - 0.14, v0 + 0.08], [u0 + 0.08, v1 - 0.14], [u1 - 0.14, v1 - 0.14]]) R(a, b, a + 0.06, b + 0.06, 0, h - 0.06, 'wood_dark', false); };
  if (trade === 'potter') {
    wheelAt(4.2, 2.6, true); stool(4.2, 3.5); wheelAt(6.8, 3.4, false);
    bin(7.0, 0.9, 8.4, 1.9); bench(5.0, 4.0, 8.3, 4.6, 0.7);
    for (let k = 0; k < 6; k++) { const [px, pz] = F.P(5.3 + k * 0.5, 4.3); vase(bag, ['oinochoe', 'kylix', 'lekythos'][k % 3], px, y + 0.7, pz, { mat: 'earth_wall', seg: 10 }); }
    for (let k = 0; k < 3; k++) { const [px, pz] = F.P(2.0 + k * 0.7, 0.95); vase(bag, 'amphora', px, y, pz, { s: 0.9, mat: 'earth_wall', seg: 10 }); }
  } else if (trade === 'painter') {
    bench(3.0, 1.4, 5.8, 2.3, 0.78); bench(3.2, 3.6, 6.0, 4.3, 0.74);
    const [vx, vz] = F.P(4.4, 1.9);
    bag.add('wood_dark', lathe([[0.16, 0], [0.12, 0.05], [0.12, 0.1], [0.001, 0.1]], 10, null, vx, y + 0.78, vz));
    vase(bag, 'krater', vx, y + 0.88, vz, { s: 0.9, dark: false, seg: 12 });
    for (const [u, v] of [[3.4, 1.7], [5.4, 2.1]]) { const [px, pz] = F.P(u, v); bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0], [0.055, 0.05], [0.04, 0.07], [0.001, 0.07]], 8, null, px, y + 0.78, pz)); bag.add('iron', rod([px + 0.04, y + 0.84, pz], [px + 0.1, y + 0.96, pz + 0.02], 0.004, 3)); }
    for (let k = 0; k < 5; k++) { const [px, pz] = F.P(3.4 + k * 0.5, 4.0); vase(bag, ['hydria', 'lekythos', 'oinochoe', 'krater', 'kylix'][k], px, y + 0.74, pz, { s: 0.85, dark: k % 2 === 0, seg: 10 }); }
    stool(4.4, 2.9); wheelAt(7.2, 2.4, false); stool(7.2, 3.2);
  } else if (trade === 'tile') {
    for (let r = 0; r < 3; r++) { const [px, pz] = F.P(3.0, 1.4 + r * 1.0); roofTiles(bag, F.alongX ? px : px - 0.62, y, F.alongX ? pz - 0.3 : pz, F.alongX ? 'z' : 'x', 6); }
    for (let r = 0; r < 2; r++) { const [px, pz] = F.P(6.4, 1.4 + r * 1.4); for (let k = 0; k < 4; k++) bag.add('roof_tile', box(px - 0.3, y + k * 0.03, pz - 0.28, px + 0.3, y + k * 0.03 + 0.025, pz + 0.28)); }
    bin(7.0, 3.5, 8.6, 4.8); R(5.2, 2.8, 6.2, 3.6, 0, 0.08, 'timber', true);
  } else {
    bench(3.0, 1.2, 6.2, 2.0, 0.8); bench(3.0, 3.8, 5.6, 4.4, 0.76); bin(7.0, 1.0, 8.4, 2.0);
    for (let k = 0; k < 7; k++) { const [px, pz] = F.P(3.2 + k * 0.42, 1.6); figurine(bag, px, y + 0.8, pz, 0.8 + (k % 3) * 0.1, k % 2 ? 'terracotta' : 'earth_wall'); }
    for (let k = 0; k < 4; k++) { const [px, pz] = F.P(3.3 + k * 0.55, 4.1); bag.add('terracotta', box(px - 0.08, y + 0.76, pz - 0.1, px + 0.08, y + 0.82, pz + 0.1)); }
    stool(4.5, 2.7);
  }
  // the store: unfired and fired ware on the floor in rows, sacks of ash
  {
    const [su0, su1] = [ur + t, L - t];
    for (let r = 0; r < 2; r++) for (let k = 0; k < 6; k++) { const [px, pz] = F.P(su0 + 0.7 + k * 0.62, 0.9 + r * 0.75 + (r ? 0.5 : 0)); vase(bag, ['amphora', 'hydria', 'krater'][(k + r) % 3], px, y, pz, { s: 0.95, dark: rand() < 0.5, seg: 10 }); }
    for (const v of [Dr - 1.0]) { const [px, pz] = F.P(su0 + 1.0, v); vase(bag, 'pithos', px, y, pz, { s: 0.8, seg: 12 }); col.circle(px, pz, 0.3, y, y + 0.9); const [qx, qz] = F.P(su0 + 2.2, v); vase(bag, 'pithos', qx, y, qz, { s: 0.8, seg: 12 }); col.circle(qx, qz, 0.3, y, y + 0.9); }
  }

  // ── the yard
  kiln(ctx, el.kiln[0], y, el.kiln[1], el.kiln[2], { glow: !!el.firing });
  for (const [a, b] of [[1.0, 2.9], [3.3, 5.2]]) {                // the settling pits: clay, then water over it
    const wet = a > 2;
    Y(a, 6.7, b, 7.9, 0, 0.32, 'rubble'); Y(a + 0.14, 6.84, b - 0.14, 7.76, 0.3, 0.34, wet ? 'water' : 'earth_wall', false);
  }
  for (const [a, b] of [[1.0, 3.8], [4.6, 7.4]]) {                // racks of unfired pots drying in the sun
    for (const h of [0.35, 0.95, 1.55]) {
      Y(a, 9.1, b, 9.75, h - 0.04, h, 'timber', false);
      for (let u = a + 0.3; u < b - 0.2; u += 0.48) { const [pu] = RU(u, u); const [px, pz] = F.P(pu, 9.42); vase(bag, ['oinochoe', 'amphora', 'hydria', 'lekythos'][Math.floor(rand() * 4)], px, y + h, pz, { s: 0.85, mat: 'earth_wall', seg: 8 }); }
    }
    for (const u of [a + 0.05, b - 0.11]) for (const v of [9.1, 9.69]) Y(u, v, u + 0.06, v + 0.06, 0, 1.6, 'wood_dark', false);
    { const [p, q] = RU(a, b); col.rect(F.R(p, 9.1, q, 9.75), y, y + 1.7); }
  }
  for (const [u, v] of [[9.0, 6.8], [9.9, 7.0]]) { const [px, pz] = F.P(U(u), v); vase(bag, 'pithos', px, y, pz, { s: 0.9, seg: 12 }); col.circle(px, pz, 0.34, y, y + 1.0); bag.add('water', lathe([[0.001, 0], [0.2, 0]], 8, null, px, y + 0.95, pz)); }
  // finished ware stacked in a pyramid by the wall of the range, leaning in rows
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const [px, pz] = F.P(U(5.6 + r * 0.3 + k * 0.6), Dr + 0.6 + r * 0.0); vase(bag, 'amphora', px, y + r * 0.0, pz, { s: 0.9, dark: (k + r) % 2 === 0, seg: 8, tilt: 0 }); }
  // the lean-to shed along the back, its posts of timber; under it wood, tiles and a heap of clay
  {
    const sa = U(0.45), sb = U(8.9), [su0, su1] = sa < sb ? [sa, sb] : [sb, sa], vs = D - 3.4;
    shed(ctx, F, [su0, vs, su1, D - t], y, 2.2, 2.7);
    for (let u = su0 + 0.2; u <= su1 - 0.1; u += 2.9) R(u, vs, u + 0.14, vs + 0.14, 0, 2.2, 'timber', true);
    const [, za] = F.P(0, D - t - 1.1), [, zb] = F.P(0, D - t - 0.25);
    for (let k = 0; k < 4; k++) for (let j = 0; j < 6 - k; j++) { const [lx] = F.P(su0 + 0.6 + j * 0.2 + k * 0.1, 0); bag.add('log_pine', rod([lx, y + 0.1 + k * 0.17, za], [lx, y + 0.1 + k * 0.17, zb], 0.085, 6)); }
    { const [wa, wb] = [F.P(su0 + 0.5, 0)[0] - 0.2, F.P(su0 + 1.9, 0)[0] + 0.2]; col.rect([wa, Math.min(za, zb), wb, Math.max(za, zb)], y, y + 0.9); }
    const [cx, cz] = F.P((su0 + su1) / 2 + 1.2, D - t - 1.2);
    bag.add('earth_wall', lathe([[1.0, 0], [0.8, 0.28], [0.4, 0.5], [0.001, 0.55]], 12, null, cx, y, cz)); col.circle(cx, cz, 1.0, y, y + 0.5);
    const [tx, tz] = F.P(su0 + 3.5, D - t - 1.0);
    for (let k = 0; k < 6; k++) roofTiles(bag, tx - 0.3, y + k * 0.085, tz - 0.3, 'z', 1 + (5 - k) % 3);
  }
  void trapeza; void STYLES;
}

/**
 * fountain_house: { rect, front, y, seed } — the South-East Fountain House of about 520 BC, 16 × 8 m here (the excavated building is about
 * 18 × 7): a Doric front of limestone columns on two steps, the back wall of the hall with four lion-head spouts over a trough, water
 * running from each, a stone ledge to stand the hydriai on, its two cisterns the closed ends.
 */
function fountainHouse(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, front = el.front ?? 'n', F = frame(el.rect, front), { L, D } = F;
  STYLES.greek.elements.stoa({ rect: el.rect, front, y, h: 3.2, d: 0.55, sp: 2.667, flutes: 0, arch: 0.4, frieze: 0.4, geison: 0.22, tw: 0.3, mat: 'limestone', wall: 'limestone', triglyphMat: 'egyptian_blue' }, ctx);
  const wt = 0.7, vb = D - wt;
  const R = (u0, v0, u1, v1, y0, y1, m, solid = true) => { const r = F.R(u0, v0, u1, v1); B(bag, m, r, y + y0, y + y1); if (solid) col.rect(r, y + y0, y + y1); };
  // the trough along the back wall: a curb of limestone round water
  basin({ rect: F.R(1.4, vb - 1.05, L - 1.4, vb), y, h: 0.5, curb: 0.2, mat: 'marble_dark' }, ctx);
  // the spouts: a lion's head of bronze set in the wall, the water falling in a thin stream into the trough
  for (let k = 0; k < 4; k++) {
    const u = L * (1 + 2 * k) / 8, [x, z] = F.P(u, vb - 0.02), [ox, oz] = F.out;
    const head = lathe([[0.001, 0.0], [0.11, 0.0], [0.13, 0.12], [0.1, 0.2], [0.07, 0.26], [0.001, 0.27]], 10);
    head.rotateX(-Math.PI / 2);
    const rotY = Math.atan2(-ox, -oz);
    head.rotateY(rotY).translate(x, y + 1.15, z);
    bag.add('bronze', head);
    const sx = x + ox * 0.3, sz = z + oz * 0.3;
    bag.add('water', box(sx - 0.02, y + 0.42, sz - 0.02, sx + 0.02, y + 1.0, sz + 0.02));
  }
  // the stone ledge before the trough where the women stand their hydriai, and a few waiting there
  R(1.2, vb - 1.9, L - 1.2, vb - 1.55, 0, 0.12, 'limestone', false);
  for (let k = 0; k < 4; k++) { const [x, z] = F.P(L * (1 + 2 * k) / 8, vb - 1.72); vase(bag, 'hydria', x, y + 0.12, z, { s: 1, dark: k % 2 === 0, seg: 10 }); }
  // the closed ends: the cisterns' houses, a bronze grille in each little door
  void col;
}

Object.assign(STYLES.greek.elements, { potter_works: potterWorks, fountain_house: fountainHouse });
