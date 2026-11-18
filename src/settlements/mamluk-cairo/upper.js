// The upper floors of the Cairene houses (docs/settlements/mamluk-cairo.md §16): the helpers shared by the town house (house.js) and
// the rab' (rab.js) — a stair that the walker climbs, the rooms by use (sleeping, workroom, store, the family's hall), and what stands
// in them. Pieces are placed in a house's own frame (u along the lane front, d inward), through the builder's closures.

import { box, rod } from '../../core/geom.js';
import * as F from '../../styles/mughal/furnish.js';
import { dbl } from '../../styles/mamluk/kit.js';

/** A vertical double-sided sheet from (ax, y0, az) to (bx, y1, bz). */
function quad(ax, y0, az, bx, y1, bz) { return dbl([ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az]); }

/** The colliders' direction word ('n' | 's' | 'e' | 'w') of a world vector. */
export function stairDir(vx, vz) { return Math.abs(vx) > Math.abs(vz) ? (vx > 0 ? 'e' : 'w') : (vz > 0 ? 's' : 'n'); }

/**
 * A straight stone flight in a house's frame: `n` rises from the floor at `y0` to `y1`, along u from u0 to u1 (treads 1…n−1; the n-th is the
 * landing's floor), across d0…d1; a solid parapet on the d1 side. The ramp under the walker follows the nosings. c: the builder's closures.
 */
export function stoneStair(c, { u0, u1, d0, d1, y0, y1, ybase, n = 16, mat = 'limestone_yellow', parapet = true, ph = 0.9 }) {
  const { bag, col, B, R, fr, mir } = c, tr = (u1 - u0) / (n - 1), rise = (y1 - y0) / n;
  for (let k = 1; k < n; k++) bag.add(mat, B(u0 + (k - 1) * tr, u0 + k * tr, ybase, y0 + k * rise, d0, d1));
  if (parapet) {
    for (let k = 1; k < n; k++) bag.add(mat, B(u0 + (k - 1) * tr, u0 + k * tr, y0 + k * rise, y0 + k * rise + ph, d1, d1 + 0.15));
    bag.add(mat, B(u0 - 0.04, u1, y0 + rise + ph, y0 + rise + ph + 0.07, d1 - 0.03, d1 + 0.18));
    for (let k = 1; k < n; k += 3) col.rect(R(u0 + (k - 1) * tr, u0 + Math.min(k + 2, n - 1) * tr, d1, d1 + 0.15), y0, y0 + Math.min(k + 2, n - 1) * rise + ph);
  }
  const wu = mir ? [-fr.U[0], -fr.U[1]] : fr.U;
  col.ramp(R(u0, u1, d0, d1), y0 + rise, y1, stairDir(wu[0], wu[1]));
  return { tr, rise };
}

/**
 * A steep boarded ladder-stair (sullam) against a wall, rising toward +d: `n` treads from the floor at `fl` to the surface `top` (the last
 * tread is at `top`, flush with a roof or a floor), across u0…u1, from d0 to d1; two stringers of poles. The ramp
 * under it is the way up.
 */
export function ladderStair(c, { u0, u1, d0, d1, fl, top, n = 13 }) {
  const { bag, col, B, R, fr } = c, tr = (d1 - d0) / n, rise = (top - fl) / n;
  for (let k = 0; k < n; k++) {
    { const dm = d0 + (k + 0.5) * tr, yy = fl + (k + 1) * rise, [ax, az] = fr.P(c.mir ? c.L - u0 : u0, -dm), [bx, bz] = fr.P(c.mir ? c.L - u1 : u1, -dm); bag.add('wood_dark', quad(ax, yy - 0.07, az, bx, yy, bz)); }   // (a rung is a vertical sheet seen from the climber: the engine reads every upward face as a roof to be refused)
  }
  for (const u of [u0, u1]) { const [ax, az] = fr.P(c.mir ? c.L - u : u, -d0), [bx, bz] = fr.P(c.mir ? c.L - u : u, -d1); bag.add('timber', dbl([ax, fl, az, bx, top - 0.02, bz, bx, top + 0.12, bz, ax, fl, az, bx, top + 0.12, bz, ax, fl + 0.14, az])); }
  const wv = [-fr.N[0], -fr.N[1]];
  // (the ramp runs from the floor, a rise under the nosings: the engine reads the treads in a half-metre cell as one top and refuses a body where that top stands more than 0.3 m over the floor it finds under the cell's centre, which must lie no more than a hand under it)
  col.ramp(R(u0 - 0.32, u1 + 0.32, d0 - 0.04, d1 - tr), fl, top - rise, stairDir(wv[0], wv[1]));
  col.floor(R(u0 - 0.04, u1 + 0.04, d1 - tr, d1), top);
  return { tr, rise };
}

/** A raised sleeping platform with its bedding and a bolster at the head (end `head`: -1 low u, +1 high u). */
export function bed(c, { u0, u1, d0, d1, y, head = 1, mat = 'cloth_white', quilt = 'cloth_indigo', bols = 'cloth_red' }) {
  const { bag, col, B, R, P, along } = c, h = 0.4, yw = along ? Math.PI / 2 : 0;
  bag.add('wood_dark', B(u0, u1, y, y + h, d0, d1)); col.rect(R(u0, u1, d0, d1), y, y + h + 0.05);
  const [mx, mz] = P((u0 + u1) / 2, (d0 + d1) / 2);
  F.cushion(bag, mx, y + h, mz, u1 - u0 - 0.06, d1 - d0 - 0.06, 0.1, yw, mat);
  const [qx, qz] = P(u0 + (u1 - u0) * (head > 0 ? 0.4 : 0.6), (d0 + d1) / 2);
  F.cushion(bag, qx, y + h + 0.08, qz, (u1 - u0) * 0.62, d1 - d0 - 0.2, 0.08, yw, quilt);
  const [bx, bz] = P(head > 0 ? u1 - 0.2 : u0 + 0.2, (d0 + d1) / 2);
  F.bolster(bag, bx, y + h + 0.1, bz, d1 - d0 - 0.25, 0.1, yw + Math.PI / 2, bols, 'cloth_ochre');
}

/** A sleeping room: a platform bed, chests, a carpet, a brazier and a tray, the window seat under the oriel, a washing ewer. */
export function bedroom(c, { u0, u1, d0, d1, y, seatAt = null, rand }) {
  const { bag, col, B, R, P, along, lights } = c, yw = along ? Math.PI / 2 : 0, N = c.fr.N, yawIn = Math.atan2(N[0], N[1]);
  bed(c, { u0: u1 - 1.25, u1: u1 - 0.03, d0: d0 + 0.05, d1: d0 + 1.75, y, head: 1, quilt: rand() < 0.5 ? 'cloth_indigo' : 'cloth_green' });
  for (const k of [0, 1]) { const [px, pz] = P(u0 + 0.7 + k * 0.95, d1 - 0.3); F.chest(bag, px, y, pz, 0.85, 0.5, 0.55, yawIn); col.rect(R(u0 + 0.3 + k * 0.95, u0 + 1.15 + k * 0.95, d1 - 0.55, d1 - 0.02), y, y + 0.6); }
  const [cx, cz] = P((u0 + u1) / 2 - 0.3, (d0 + d1) / 2 + 0.1), cw = Math.min(3.2, u1 - u0 - 2.3);
  if (cw > 1.4) { F.carpet(bag, cx, y + 0.012, cz, cw, 1.2, yw, ['persian', 'blue', 'maroon'][Math.floor(rand() * 3)]); F.trayTable(bag, cx, y + 0.026, cz, { seed: c.seed }); col.circle(cx, cz, 0.38, y, y + 0.4); }
  { const [bx, bz] = P(u0 + 0.5, d0 + 0.5); F.brazier(bag, null, bx, y, bz, 0.2); col.circle(bx, bz, 0.26, y, y + 0.3); }
  { const [ex, ez] = P(u1 - 1.6, d1 - 0.25); F.ewer(bag, ex, y + 0.0, ez, 0.8, 0); col.circle(ex, ez, 0.2, y, y + 0.3); }
  if (seatAt) for (const { c: uc, w } of seatAt) { const a = P(uc - w / 2 + 0.1, 0.08), b = P(uc + w / 2 - 0.1, 0.08), tw = P(uc, 1.6); F.divan(bag, col, a, b, y, tw, { h: 0.38, depth: 0.5, mattress: 'cloth_red', backs: ['cloth_ochre', 'cloth_green'] }); }
  { const [lx, lz] = P((u0 + u1) / 2, (d0 + d1) / 2); F.oilLamp(bag, lights, lx, y + 2.2, lz, 'bronze', 3); bag.add('rope_fibre', rod([lx, y + 2.34, lz], [lx, y + 2.9, lz], 0.01, 3)); }
}

/** A craftsman's workroom: a loom (two posts, the beams, the warp, the cloth woven so far), a bench with tools, bolts and pots, skeins on a pole. */
export function workroom(c, { u0, u1, d0, d1, y, rand }) {
  const { bag, col, B, R, P, along, lights } = c, yw = along ? Math.PI / 2 : 0, uc = (u0 + u1) / 2 - 0.4, w = 1.7;
  for (const s of [-1, 1]) bag.add('wood_dark', B(uc + s * w / 2 - 0.05, uc + s * w / 2 + 0.05, y, y + 1.75, d0 + 0.7, d0 + 0.85));
  bag.add('wood_dark', B(uc - w / 2 - 0.05, uc + w / 2 + 0.05, y + 1.7, y + 1.78, d0 + 0.68, d0 + 0.87)); bag.add('timber', B(uc - w / 2, uc + w / 2, y + 0.42, y + 0.5, d0 + 0.68, d0 + 0.8));
  for (let k = 0; k < 16; k++) bag.add('rope_fibre', B(uc - w / 2 + 0.06 + k * (w - 0.12) / 15, uc - w / 2 + 0.07 + k * (w - 0.12) / 15, y + 0.9, y + 1.7, d0 + 0.76, d0 + 0.775));
  bag.add(c.mats?.[0] ?? 'cloth_indigo', B(uc - w / 2 + 0.06, uc + w / 2 - 0.06, y + 0.5, y + 0.9, d0 + 0.75, d0 + 0.79));
  col.rect(R(uc - w / 2 - 0.07, uc + w / 2 + 0.07, d0 + 0.66, d0 + 0.88), y, y + 1.8);
  { const [bx, bz] = P(uc, d0 + 1.45); bag.add('timber', B(uc - 0.3, uc + 0.3, y + 0.38, y + 0.43, d0 + 1.25, d0 + 1.65)); for (const [a, b] of [[-0.25, 1.3], [0.25, 1.3], [-0.25, 1.6], [0.25, 1.6]]) bag.add('wood_dark', B(uc + a - 0.025, uc + a + 0.025, y, y + 0.38, d0 + b - 0.025, d0 + b + 0.025)); void bx; void bz; col.rect(R(uc - 0.3, uc + 0.3, d0 + 1.25, d0 + 1.65), y, y + 0.43); }
  // the bench along the court wall with tools, bolts and pots
  const bu0 = u1 - 5.0, bu1 = u1 - 2.3, bd = d1 - 0.65;
  bag.add('wood_dark', B(bu0, bu1, y + 0.82, y + 0.88, bd, d1 - 0.02)); for (const u of [bu0 + 0.05, bu1 - 0.1]) for (const d of [bd + 0.03, d1 - 0.1]) bag.add('wood_dark', B(u, u + 0.06, y, y + 0.82, d, d + 0.06));
  col.rect(R(bu0, bu1, bd, d1 - 0.02), y, y + 0.88);
  { const [px, pz] = P(bu0 + 0.55, d1 - 0.35); F.bolts(bag, px, y + 0.88, pz, 4, yw); const [qx, qz] = P(bu0 + 1.6, d1 - 0.35); F.pots(bag, qx, y + 0.88, qz, yw, 3); const [rx, rz] = P(bu1 - 0.4, d1 - 0.35); F.copperware(bag, rx, y + 0.88, rz, yw, c.seed, 3); }
  for (let k = 0; k < 4; k++) { const [tx, tz] = P(bu0 + 0.9 + k * 0.5, bd + 0.12); bag.add('iron', rod([tx, y + 0.88, tz], [tx + 0.002, y + 1.0, tz], 0.009, 4)); }
  // skeins on a pole under the ceiling, a sleeping mat rolled in the corner, a lamp
  { const [ax, az] = P(u0 + 0.2, d0 + 0.45), [bx, bz] = P(u0 + 0.2, d1 - 0.3); bag.add('timber', rod([ax, y + 2.05, az], [bx, y + 2.05, bz], 0.025, 5));
    for (let k = 0; k < 5; k++) { const [sx, sz] = P(u0 + 0.2, d0 + 0.7 + k * (d1 - d0 - 1.2) / 4); bag.add(['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][k], box(sx - 0.05, y + 1.5, sz - 0.05, sx + 0.05, y + 2.05, sz + 0.05)); } }
  { const [mx, mz] = P(u0 + 0.7, d1 - 0.6); F.reedMat(bag, mx, y + 0.01, mz, 0.9, 1.5, yw); F.cushion(bag, mx, y + 0.02, mz, 0.5, 0.4, 0.1, yw, 'cloth_white'); }
  { const [lx, lz] = P(uc, (d0 + d1) / 2 + 0.6); F.oilLamp(bag, lights, lx, y + 2.3, lz, 'bronze', 3); bag.add('rope_fibre', rod([lx, y + 2.44, lz], [lx, y + 2.9, lz], 0.01, 3)); }
  void rand;
}

/** A store: jars along a wall, sacks, a bale, a chest, a shelf of pots. */
export function storeroom(c, { u0, u1, d0, d1, y, rand }) {
  const { bag, col, B, R, P, along } = c, yw = along ? Math.PI / 2 : 0, N = c.fr.N, yawIn = Math.atan2(N[0], N[1]);
  for (let k = 0; k < 3; k++) { const [px, pz] = P(u0 + 0.4, d0 + 0.5 + k * 0.7); F.waterJar(bag, px, y, pz, 1.0 - 0.1 * (k % 2), k === 1 ? 'pottery_dark' : 'terracotta'); col.circle(px, pz, 0.32, y, y + 0.95); }
  { const [px, pz] = P(u1 - 0.55, d1 - 0.5); F.spiceSacks(bag, px, y, pz, yw, 3); col.rect(R(u1 - 1.05, u1 - 0.05, d1 - 0.95, d1 - 0.05), y, y + 0.7); }
  { const [px, pz] = P(u0 + 1.1, d1 - 0.45); F.chest(bag, px, y, pz, 0.9, 0.5, 0.6, yawIn); col.rect(R(u0 + 0.65, u0 + 1.55, d1 - 0.7, d1 - 0.2), y, y + 0.65); }
  { const [px, pz] = P(u1 - 0.5, d0 + 0.6); for (let k = 0; k < 2; k++) F.bale(bag, px, y + k * 0.32, pz, 0.8, 0.3, 0.6, yw, 'sacking'); col.rect(R(u1 - 0.95, u1 - 0.05, d0 + 0.25, d0 + 0.95), y, y + 0.62); }
  for (let k = 0; k < 2; k++) { const dd = d1 - 0.05; bag.add('timber', B(u0 + 1.7, u1 - 1.2, y + 1.15 + k * 0.7, y + 1.2 + k * 0.7, dd - 0.3, dd)); const [px, pz] = P((u0 + u1) / 2 + 0.3, dd - 0.15); F.pots(bag, px, y + 1.2 + k * 0.7, pz, yw, 3); }
  void rand;
}

/** The family's hall over the court (the upper maq'ad): the divan along the back wall, a carpet with its tray, the reading stand on a mat, a chest, lamps hung from the ceiling. */
export function familyHall(c, { u0, u1, d0, d1, y, ceil, rand, lights }) {
  const { bag, col, B, R, P, along, seed } = c, yw = along ? Math.PI / 2 : 0, N = c.fr.N, yawIn = Math.atan2(N[0], N[1]), uc = (u0 + u1) / 2;
  { const a = P(u0 + 0.05, d1 - 0.02), b = P(u1 - 0.05, d1 - 0.02), tw = P(uc, d0 + 0.5); F.divan(bag, col, a, b, y, tw, { h: 0.38, depth: 0.85, mattress: rand() < 0.5 ? 'cloth_red' : 'cloth_indigo', backs: ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_indigo'] }); }
  { const cw = Math.max(2.0, Math.min(4.0, u1 - u0 - 1.8)), [px, pz] = P(uc, (d0 + d1 - 0.85) / 2 + 0.1); F.carpet(bag, px, y + 0.012, pz, cw, 1.1, yw, ['persian', 'blue', 'maroon'][Math.floor(rand() * 3)]); F.trayTable(bag, px, y + 0.026, pz, { seed }); col.circle(px, pz, 0.4, y, y + 0.42); }
  { const [px, pz] = P(u0 + 0.6, d0 + 1.3); F.reedMat(bag, px, y + 0.01, pz, 0.9, 0.7, yw); F.rahle(bag, px, y + 0.012, pz, yawIn); col.circle(px, pz, 0.25, y, y + 0.4); }
  for (let k = 0; k < 2; k++) { const [px, pz] = P(uc + (k ? 1.1 : -1.1), d0 + 1.2); F.mosqueLamp(bag, k ? null : lights, px, ceil - 0.9, pz, ceil, { k: 1.2, enamel: true, glow: 5, reach: 9 }); }
}

/**
 * A straight stone flight along d (inward) in a house's frame: `n` rises from y0 to y1 between d0 and d1 (treads 1…n−1; the n-th is the
 * landing's floor), across u0…u1, solid below. The ramp under the walker follows the nosings.
 */
export function flightD(c, { u0, u1, d0, d1, y0, y1, ybase, n = 18, mat = 'limestone_yellow' }) {
  const { bag, col, B, R, fr } = c, tr = (d1 - d0) / (n - 1), rise = (y1 - y0) / n;
  for (let k = 1; k < n; k++) bag.add(mat, B(u0, u1, ybase, y0 + k * rise, d0 + (k - 1) * tr, d0 + k * tr));
  col.ramp(R(u0, u1, d0, d1), y0 + rise, y1, stairDir(-fr.N[0], -fr.N[1]));
  return { tr, rise };
}
