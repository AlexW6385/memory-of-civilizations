// The upper floors of the courtyard houses of Timurid Samarkand (docs/settlements/timurid-samarkand.md §18). Two kinds, both
// reached by the mud-brick stair of the court (houses.js) which climbs to the flat roof:
//   - the merchant's (rich) house: the street wing is two storeys; its upper floor is three rooms — a bedroom, the reception
//     room (mehmonkhona) with the timber balcony over the lane and a loggia over the court, and a store — entered from the
//     roof terrace of the side wing at the stair's head;
//   - every other house: a small upper room on the roof of the street wing (balakhona), over the end nearer the stair, with a
//     porch before its door, furnished by the trade of the house (the potter's store, the papermaker's drying loft …).
// All of it belongs to the full (near) form; the far form only gets the mass (upperMass). Nothing here draws a random number of
// houses.js's sequence: the decisions are taken from the house's own seed.

import { box, lathe } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { houseGeom } from '../../settlements/timurid-samarkand/layout.js';
import { rng } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
export const DN = 4.8, DW = 4.3, DS = 4.6, PW = 2.2;

/** What the house builder decides with its own draws (rng(seed + 7)): the wall's height, the wing that holds the room, and so the stair's side. */
export function facts(h) {
  const r = rng(h.seed + 7), H = 3.9 + r() * 0.5;
  if (!h.rich) r();
  const rsgn = r() < 0.5 ? -1 : 1, G = houseGeom(h), W = G.W, D = G.D;
  const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2, zf = z0 + DN, zs = z1 - DS, xl = x0 + DW, xr = x1 - DW;
  const xd = Math.max(x0 + 3.2, Math.min(x1 - 3.2, h.xd)), sg = -rsgn;                    // the stair's side
  const front = h.rich ? 'portal' : ['plain', 'canopy', 'gate', 'arch'][h.seed % 4];
  const HS = h.rich ? H + 3.15 : H;
  let room = null;
  if (!h.rich) {
    // the balakhona: over the street wing's end by the stair, else the other end; not where the raised gate stands
    const BW = 5.2 + (h.seed % 4) * 0.25, ends = [sg, -sg];
    for (const e of ends) {
      const ra = e < 0 ? x0 + 0.3 : x1 - 0.3 - BW, rb = ra + BW;
      if (front === 'gate' && ra < xd + 2.15 && rb > xd - 2.15) continue;
      room = { e, ra, rb, za: zs, zb: z1 - 0.3, BW };
      break;
    }
  }
  return { H, HS, rsgn, sg, G, W, D, x0, x1, z0, z1, zf, zs, xl, xr, xd, front, room, rich: !!h.rich, trade: h.trade };
}

/** The far form's addition: the mass of the balakhona (bare box of the wall). */
export function upperMass(bag, F0, WALL) {
  if (F0.rich || !F0.room) return;
  const { ra, rb, za, zb } = F0.room;
  bx(bag, WALL, ra, F0.H, za, rb, F0.H + 3.0, zb);
  bx(bag, 'wood_dark', F0.room.e < 0 ? ra - 0.03 : rb, F0.H + 0.95, (za + zb) / 2 - 0.4, F0.room.e < 0 ? ra : rb + 0.03, F0.H + 1.8, (za + zb) / 2 + 0.4);
}

/** The walk from the lane to the upper room (house local frame), as a list of [x, z]; the last point inside the room. */
export function upperRoute(h) {
  const f = facts(h);
  if (!f.rich && !f.room) return null;
  const xs = f.sg < 0 ? f.xl + 0.5 : f.xr - 0.5, tx = f.sg < 0 ? f.xl - 2.0 : f.xr + 2.0;
  const r = [[f.xd, f.z1 + 3.0], [f.xd, f.zs + 1.0], [f.xd, f.zs - 0.3], [xs, f.zs - 0.3], [xs, f.zf + 3], [xs, f.zf + 1.0], [tx, f.zf + 1.0]];
  if (f.rich) {
    const dx = f.sg < 0 ? f.x0 + 1.9 : f.x1 - 1.9;
    r.push([dx, f.zs - 1.2], [dx, f.zs + 1.2], [dx, f.zs + 2.4]);
    // through the partition door into the reception room, and out on the balcony
    const px = f.sg < 0 ? f.x0 + 3.5 : f.x1 - 3.5, zm = (f.zs + f.z1) / 2;
    r.push([dx, zm], [px + (f.sg < 0 ? 0.8 : -0.8), zm]);
    r.push([-3, zm], [-3, f.z1 + 0.5]);
  } else {
    const R = f.room, dx = (R.ra + R.rb) / 2, zmid = (R.za + R.zb) / 2;
    if (R.e === f.sg) r.push([dx, f.zf + 1.0], [dx, f.zs - 1.0], [dx, f.zs + 1.2], [dx, f.zs + 2.6]);
    else {      // the room at the far end: the door is in its inner end wall, reached over the street wing's roof
      const inner = R.e < 0 ? R.rb : R.ra, sgn = R.e < 0 ? 1 : -1;
      r.push([tx, f.zs - 1.0], [tx, zmid], [inner + sgn * 1.2, zmid], [inner - sgn * 1.0, zmid], [dx, zmid]);
    }
  }
  return r;
}

/** Wall run with openings: along x (axis 'x', thickness z c0…c1) or along z (axis 'z', thickness x c0…c1) from a0 to a1; ops: { a, b, ya, yb }. */
function run(E, mat, axis, a0, a1, c0, c1, y0, y1, ops = []) {
  const { bag, col } = E;
  const piece = (a, b, ya, yb) => {
    if (b - a < 0.01 || yb - ya < 0.01) return;
    const r = axis === 'x' ? [a, c0, b, c1] : [c0, a, c1, b];
    bx(bag, mat, r[0], ya, r[1], r[2], yb, r[3]); col.rect(r, ya, yb);
  };
  let cur = a0;
  for (const o of [...ops].sort((p, q) => p.a - q.a)) {
    piece(cur, o.a, y0, y1); piece(o.a, o.b, y0, o.ya); piece(o.a, o.b, o.yb, y1);
    // the lintel beam over the opening and a sill board
    const t = 0.04, r = axis === 'x' ? [o.a - 0.1, c0 - t, o.b + 0.1, c1 + t] : [c0 - t, o.a - 0.1, c1 + t, o.b + 0.1];
    if (o.yb < y1 - 0.12) bx(bag, 'timber', r[0], o.yb - 0.12, r[1], r[2], o.yb, r[3]);
    if (o.ya > y0 + 0.2) bx(bag, 'timber', r[0], o.ya - 0.05, r[1], r[2], o.ya, r[3]);
    cur = o.b;
  }
  piece(cur, a1, y0, y1);
}
const win = (c, w, ya, hgt) => ({ a: c - w / 2, b: c + w / 2, ya, yb: ya + hgt });

// ---- the goods ----------------------------------------------------------------------------------------------------
function quilts(bag, x, y, z, w, d, r, n) {
  const mats = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white'];
  let yy = y;
  for (let i = 0; i < n; i++) { const t = 0.09 + r() * 0.04, k = 0.9 + r() * 0.1; bx(bag, mats[Math.floor(r() * mats.length)], x - w * k / 2, yy, z - d * k / 2, x + w * k / 2, yy + t, z + d * k / 2); yy += t; }
}
/** A rolled mattress and bedding on the floor along a wall (u0…u1 along x), the sleeping place of the room. */
function bedding(bag, x, y, z, len, r, yaw) {
  const mats = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon'];
  F.kilim(bag, x, y, z, len, 1.0, yaw, mats);
  quilts(bag, x, y + 0.012, z, len * 0.8, 0.8, r, 2 + Math.floor(r() * 2));
  F.bolster(bag, x + (yaw ? 0 : -len * 0.38), y + 0.2, z + (yaw ? -len * 0.38 : 0), 0.7, 0.1, yaw, 'cloth_white', 'cloth_ochre');
}

/** The stores of a trade in the balakhona; X/Z positions are in the room's frame: u from the outer end wall inward (dir), v along the room's depth. */
function trade(kind, E, I, r) {
  const { bag, lights } = E, { H, dir, ox, z0, z1 } = I, y = H + 0.03;
  const X = (u) => ox + dir * u, yaw = dir > 0 ? -Math.PI / 2 : Math.PI / 2, zS = z1 - 0.06;       // zS: along the street wall (south)
  const sh = (u0, u1, yy, zz = zS - 0.15) => { bx(bag, 'timber', X(u0), yy, zz - 0.18, X(u1), yy + 0.04, zz + 0.18); for (const u of [u0 + 0.05, u1 - 0.05]) bx(bag, 'wood_dark', X(u) - 0.03, yy - 0.5, zz - 0.15, X(u) + 0.03, yy, zz + 0.15); };
  switch (kind) {
    case 'potter': {
      sh(0.5, 3.3, y + 0.55); sh(0.5, 3.3, y + 1.1);
      for (const yy of [y + 0.59, y + 1.14]) for (let u = 0.8; u < 3.1; u += 0.7 + r() * 0.2) F.pots(bag, X(u), yy, zS - 0.15, yaw, 2 + Math.floor(r() * 2));
      F.pots(bag, X(1.2), y, z0 + 1.0, yaw, 5, ['pottery_dark', 'terracotta', 'glaze_blue']); F.pots(bag, X(2.4), y, z0 + 0.9, yaw, 4);
      break;
    }
    case 'baker': {
      F.spiceSacks(bag, X(1.1), y, z0 + 0.6, yaw, 4, ['cloth_white', 'cloth_ochre', 'cloth_white']);
      F.bale(bag, X(2.3), y, z0 + 0.6, 0.7, 0.4 + r() * 0.1, 0.5, yaw, 'sacking'); F.bale(bag, X(2.3), y + 0.42, z0 + 0.6, 0.6, 0.35, 0.45, yaw, 'sacking');
      bag.add('wicker', lathe([[0.3, 0], [0.34, 0.2], [0.36, 0.3], [0.001, 0.3]], 10, null, X(3.2), y, z0 + 0.7));
      sh(0.5, 3.0, y + 0.9); for (let i = 0; i < 6; i++) F.pots(bag, X(0.7 + i * 0.4), y + 0.94, zS - 0.15, yaw, 1, ['terracotta']);
      break;
    }
    case 'smith': {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) bx(bag, 'iron', X(0.4 + j * 0.13), y + i * 0.06, z0 + 0.35, X(0.4 + j * 0.13 + 0.09), y + i * 0.06 + 0.055, z0 + 1.45);
      F.bale(bag, X(1.5), y, z0 + 0.6, 0.6, 0.45, 0.45, yaw, 'sacking'); F.bale(bag, X(2.2), y, z0 + 0.6, 0.6, 0.4, 0.45, yaw, 'sacking');
      sh(0.5, 3.0, y + 0.9); F.copperware(bag, X(1.5), y + 0.94, zS - 0.15, yaw, I.seed, 3);
      for (let i = 0; i < 5; i++) bx(bag, 'iron', X(3.0) - 0.02, y + 1.2 + i * 0.07, zS - 0.06 - i * 0.28, X(3.0) + 0.02, y + 1.25 + i * 0.07, zS - 0.05 - i * 0.28 + 0.2);
      break;
    }
    case 'weaver': {
      F.bolts(bag, X(1.3), y, zS - 0.3, 6, yaw, undefined, 0.5); F.bolts(bag, X(1.3), y + 0.5, zS - 0.3, 5, yaw);
      for (const u of [0.5, 3.2]) bx(bag, 'timber', X(u) - 0.03, y, z0 + 0.5, X(u) + 0.03, y + 1.9, z0 + 0.56);
      bx(bag, 'timber', X(0.5), y + 1.85, z0 + 0.5, X(3.2), y + 1.91, z0 + 0.56);
      ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_green', 'cloth_indigo'].forEach((m, i) => bx(bag, m, X(0.7 + i * 0.36) - 0.07, y + 1.0, z0 + 0.5, X(0.7 + i * 0.36) + 0.07, y + 1.85, z0 + 0.56));
      break;
    }
    case 'carpenter': {
      for (let i = 0; i < 6; i++) bx(bag, i % 3 ? 'timber' : 'wood_painted', X(0.4 + i * 0.5), y, z0 + 0.35, X(0.4 + i * 0.5 + 0.3), y + 0.09 + (i % 2) * 0.03, z0 + 2.1);
      for (let i = 0; i < 6; i++) bx(bag, 'timber', X(0.4 + i * 0.5), y + 0.12, z0 + 0.35, X(0.4 + i * 0.5 + 0.3), y + 0.2, z0 + 1.9 - (i % 3) * 0.1);
      for (let i = 0; i < 4; i++) bag.add('wood_painted', lathe([[0.06, 0], [0.05, 0.4], [0.07, 0.8], [0.05, 1.2], [0.001, 1.2]], 8, null, X(2.8 + (i % 2) * 0.2), y, zS - 0.3 - Math.floor(i / 2) * 0.25));
      break;
    }
    case 'grocer': {
      F.waterJar(bag, X(0.9), y, zS - 0.45, 0.9); F.waterJar(bag, X(1.6), y, zS - 0.45, 0.8);
      F.spiceSacks(bag, X(2.6), y, zS - 0.4, yaw, 3);
      const zz = z0 + 0.7; bx(bag, 'timber', X(0.4), y + 1.85, zz, X(3.2), y + 1.9, zz + 0.05);
      for (let i = 0; i < 9; i++) bx(bag, i % 3 ? 'cloth_ochre' : 'cloth_red', X(0.55 + i * 0.3) - 0.05, y + 1.2 + (i % 2) * 0.1, zz + 0.01, X(0.55 + i * 0.3) + 0.05, y + 1.85, zz + 0.04);
      break;
    }
    default: {      // papermaker: sheets of paper hung to dry on lines under the ceiling, a heap of bark
      for (const zz of [z0 + 0.9, z0 + 1.8]) {
        bx(bag, 'timber', X(0.3), y + 1.9, zz, X(3.6), y + 1.94, zz + 0.04);
        for (let i = 0; i < 8; i++) bx(bag, 'cloth_white', X(0.45 + i * 0.4) - 0.14, y + 1.15 + (i % 3) * 0.05, zz + 0.005, X(0.45 + i * 0.4) + 0.14, y + 1.9, zz + 0.03);
      }
      F.bale(bag, X(1.0), y, zS - 0.4, 0.8, 0.4, 0.6, yaw, 'sacking'); F.bale(bag, X(1.9), y, zS - 0.4, 0.6, 0.3, 0.5, yaw, 'rope_fibre');
    }
  }
  void lights;
}

/** The balakhona of a house that is not rich. */
function balakhona(E, F0, h, WALL) {
  const { bag, col, lights } = E, { H, room: R } = F0, r = rng(h.seed * 31 + 17);
  const T = 0.4, ya = H, yt = H + 2.6, e = R.e;
  const [ra, za, rb, zb] = [R.ra, R.za, R.rb, R.zb], xm = (ra + rb) / 2;
  const doorX = xm + (r() - 0.5) * 0.6, wy = H + 0.95;
  // walls: north (the terrace) with the door, south on the lane with two windows, the end walls with one window each toward the lane's side
  const northDoor = e === F0.sg, zc = (za + zb) / 2;
  run(E, WALL, 'x', ra, rb, za, za + T, ya, yt, northDoor ? [{ a: doorX - 0.5, b: doorX + 0.5, ya: ya, yb: ya + 2.05 }] : [win(xm, 0.8, wy, 0.85)]);
  run(E, WALL, 'x', ra, rb, zb - T, zb, ya, yt, [win(xm - 1.2, 0.8, wy, 0.85), win(xm + 1.2, 0.8, wy, 0.85)]);
  const outer = e < 0 ? [ra, ra + T] : [rb - T, rb], inner = e < 0 ? [rb - T, rb] : [ra, ra + T];
  run(E, WALL, 'z', za + T, zb - T, outer[0], outer[1], ya, yt, [win((za + zb) / 2, 0.8, wy, 0.85)]);
  run(E, WALL, 'z', za + T, zb - T, inner[0], inner[1], ya, yt, [northDoor ? win(zc, 0.8, wy, 0.85) : { a: zc - 0.5, b: zc + 0.5, ya: ya, yb: ya + 2.05 }]);
  // the ceiling of painted boards, its beams, and the roof slab with a lip
  bx(bag, 'ceiling_painted', ra + T, yt - 0.04, za + T, rb - T, yt, zb - T);
  for (let i = 0; i < 6; i++) bx(bag, 'wood_painted', ra + T + 0.2 + i * (rb - ra - 2 * T - 0.4) / 5 - 0.07, yt - 0.2, za + T, ra + T + 0.2 + i * (rb - ra - 2 * T - 0.4) / 5 + 0.07, yt - 0.04, zb - T);
  bx(bag, WALL, ra, yt, za, rb, yt + 0.28, zb); col.rect([ra, za, rb, zb], yt, yt + 0.28);
  bx(bag, 'brick_buff', ra - 0.04, yt + 0.28, za - 0.04, rb + 0.04, yt + 0.34, zb + 0.04);
  // the ends of the roof beams on the north and south faces
  for (let i = 0; i < Math.floor((rb - ra) / 0.6); i++) {
    const s = ra + 0.3 + i * 0.6, m = i % 4 === 3 ? 'wood_dark' : 'timber';
    bx(bag, m, s - 0.05, yt - 0.3, zb, s + 0.05, yt - 0.18, zb + 0.28); bx(bag, m, s - 0.05, yt - 0.3, za - 0.28, s + 0.05, yt - 0.18, za);
  }
  // the door's porch toward the terrace: two posts, a beam and a roof of reeds
  if (northDoor) { const w = 1.0, p0 = za - 1.3;
    for (const dx of [-0.75, 0.75]) { bag.add('wood_painted', lathe([[0.09, 0], [0.075, 1.2], [0.09, 2.3]], 8, null, doorX + dx, H, p0)); col.circle(doorX + dx, p0, 0.12, H, H + 2.4); }
    bx(bag, 'wood_ochre', doorX - 1.05, H + 2.3, p0 - 0.1, doorX + 1.05, H + 2.46, p0 + 0.1);
    bx(bag, 'timber', doorX - 1.1, H + 2.46, p0 - 0.1, doorX + 1.1, H + 2.5, za);
    bx(bag, 'reed_mat', doorX - 1.15, H + 2.5, p0 - 0.15, doorX + 1.15, H + 2.54, za - 0.0);
    bx(bag, 'limestone', doorX - w / 2, H, za - 0.0, doorX + w / 2, H + 0.06, za + T);
  }
  // inside: plank floor, a kilim, bedding, a chest with quilts, niches, a lamp, the stores of the trade
  const ix0 = ra + T, ix1 = rb - T, iz0 = za + T, iz1 = zb - T, y = H + 0.03, dir = e < 0 ? 1 : -1, ox = e < 0 ? ix0 : ix1;
  bx(E.bag, 'timber', ix0, H, iz0, ix1, y, iz1);
  F.kilim(bag, (ix0 + ix1) / 2, y, (iz0 + iz1) / 2 + 0.1, ix1 - ix0 - 1.4, 1.5, 0, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
  const opp = e < 0 ? ix1 : ix0;                                    // the end toward the room's other wall: the sleeping place
  bedding(bag, opp + (e < 0 ? -0.55 : 0.55), y, (iz0 + iz1) / 2 - 0.3, 1.5, r, Math.PI / 2);
  F.chest(bag, opp + (e < 0 ? -0.3 : 0.3), y, iz1 - 0.65, 0.5, 0.9, 0.5, Math.PI / 2, 'wood_painted');
  quilts(bag, opp + (e < 0 ? -0.3 : 0.3), y + 0.5, iz1 - 0.65, 0.5, 0.85, r, 3 + Math.floor(r() * 3));
  trade(h.trade, E, { H, dir, ox, z0: iz0, z1: iz1, seed: h.seed }, r);
  for (let i = 0; i < 2; i++) bx(bag, 'wood_dark', (e < 0 ? inner[0] : inner[1]) + (e < 0 ? -0.015 : 0.015) - 0.015, H + 1.0, iz0 + 0.6 + i * 1.5, (e < 0 ? inner[0] : inner[1]) + (e < 0 ? -0.015 : 0.015) + 0.015, H + 1.7, iz0 + 1.1 + i * 1.5);
  F.oilLamp(bag, lights, (ix0 + ix1) / 2, H + 1.55, iz1 - 0.02, 'terracotta', 1.1);
}

/** The upper floor of a rich house: street wing, three rooms, the balcony and the loggia. fy: the floor's height. */
function merchant(E, F0, h, WALL, balcony) {
  const { bag, col, lights } = E, { H: fy, HS, x0, x1, z1, zs, W, xd, sg } = F0, r = rng(h.seed * 31 + 29);
  const T = 0.4, cy = HS - 0.45, zm = (zs + z1) / 2, y = fy + 0.03, wy = 5.0;
  const pa = x0 + 3.4, pb = x1 - 3.4;               // the partitions
  const S = (s) => x0 + s;
  // the ground floor under it stays solid (houses.js); the walls of the upper floor
  const dr = (c, hgt = 2.1) => ({ a: c - 0.5, b: c + 0.5, ya: fy, yb: fy + hgt });
  const termS = sg < 0 ? 1.9 : W - 1.9;                // the room at the stair's head: its door on the terrace
  const north = [{ ...dr(S(termS)), }, win(S(sg < 0 ? W - 1.9 : 1.9), 0.9, fy + 0.9, 1.0), { a: S(W / 2) - 1.5, b: S(W / 2) + 1.5, ya: fy, yb: fy + 2.2 }, win(S(W / 2 - 4.4), 0.9, fy + 0.9, 1.0), win(S(W / 2 + 4.4), 0.9, fy + 0.9, 1.0)];
  run(E, WALL, 'x', x0, x1, zs, zs + T, fy, cy, north.map((o) => ({ ...o })));
  const south = [win(S(1.8), 0.7, wy, 0.5), win(S(4.5), 0.7, wy, 0.5), { a: S(W / 2 - 3) - 0.7, b: S(W / 2 - 3) + 0.7, ya: fy, yb: fy + 2.1 }, win(S(W / 2 + 3), 0.7, wy, 0.5), win(S(W - 4.5), 0.7, wy, 0.5), win(S(W - 1.8), 0.7, wy, 0.5)];
  run(E, WALL, 'x', x0, x1, z1 - T - 0.05, z1, fy, cy, south);
  run(E, WALL, 'z', zs + T, z1 - T - 0.05, x0, x0 + 0.45, fy, cy, [win(zm, 0.8, fy + 0.95, 0.9)]);
  run(E, WALL, 'z', zs + T, z1 - T - 0.05, x1 - 0.45, x1, fy, cy, [win(zm, 0.8, fy + 0.95, 0.9)]);
  // the partitions of the rooms, a door in each
  for (const p of [pa, pb]) run(E, 'mud_plaster', 'z', zs + T, z1 - T - 0.05, p - 0.1, p + 0.1, fy, cy, [{ a: zm - 0.5, b: zm + 0.5, ya: fy, yb: fy + 2.05 }]);
  // the roof slab, the painted ceiling and its beams
  bx(bag, WALL, x0, cy, zs, x1, HS, z1); col.rect([x0, zs, x1, z1], cy, HS);
  for (const [a, b] of [[x0 + 0.45, pa - 0.1], [pa + 0.1, pb - 0.1], [pb + 0.1, x1 - 0.45]]) {
    bx(bag, 'ceiling_painted', a, cy - 0.04, zs + T, b, cy, z1 - T - 0.05);
    const n = Math.max(2, Math.round((b - a) / 0.9));
    for (let i = 0; i <= n; i++) bx(bag, 'wood_painted', a + i * (b - a - 0.14) / n, cy - 0.2, zs + T, a + i * (b - a - 0.14) / n + 0.14, cy - 0.04, z1 - T - 0.05);
  }
  // floors: boards in each room (the solid wing's top is the walked floor)
  bx(bag, 'timber', x0 + 0.45, fy, zs + T, x1 - 0.45, y, z1 - T - 0.05);
  const zN = zs + T + 0.02, zS = z1 - T - 0.07;
  // room by the stair (bedroom) and the room at the other end (store): sides
  const A = sg < 0 ? [x0 + 0.45, pa - 0.1, 1] : [pb + 0.1, x1 - 0.45, -1], C = sg < 0 ? [pb + 0.1, x1 - 0.45, -1] : [x0 + 0.45, pa - 0.1, 1];
  // the bedroom: bedding, a charpoy, the chest with the stack of quilts, a cradle, a lamp
  { const [a, b, d] = A, ox = d > 0 ? a : b, mid = (a + b) / 2;
    F.kilim(bag, mid, y, (zN + zS) / 2, b - a - 0.5, 2.8, 0, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
    F.charpoy(bag, col, mid + d * 0.0, y, zS - 0.75, 0, { quilt: ['cloth_maroon', 'cloth_indigo', 'cloth_green'][h.seed % 3], L: 1.6, W: 0.8 });
    F.chest(bag, ox + d * 0.35, y, zN + 0.75, 0.5, 0.9, 0.55, Math.PI / 2, 'wood_painted'); quilts(bag, ox + d * 0.35, y + 0.56, zN + 0.75, 0.5, 0.85, r, 4 + Math.floor(r() * 3));
    quilts(bag, mid + d * 0.2, y, zN + 0.6, 0.9, 0.7, r, 2);
    bag.add('wood_painted', lathe([[0.001, 0], [0.12, 0], [0.18, 0.2], [0.17, 0.3], [0.001, 0.3]], 8, null, ox + d * 0.4, y, zS - 0.6));
    F.oilLamp(bag, lights, mid, fy + 1.4, zS + 0.01, 'terracotta', 1.1); }
  // the reception room: a carpet, bolsters and cushions along the walls, a tray table, the stand with a book, an ewer, lamps
  { const a = pa + 0.1, b = pb - 0.1, mid = (a + b) / 2;
    F.carpet(bag, mid, y, (zN + zS) / 2, b - a - 1.2, 2.6, 0, 'persian');
    for (let i = 0; i < 7; i++) { const x = a + 0.8 + i * (b - a - 1.6) / 6; F.bolster(bag, x, y, zS - 0.25, 0.9, 0.13, 0, i % 2 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre'); }
    for (let i = 0; i < 4; i++) F.cushion(bag, a + 2.5 + i * 1.9 + r() * 0.3, y, zN + 0.35, 0.7, 0.5, 0.12, r() * 0.4, ['cloth_green', 'cloth_maroon', 'cloth_red', 'cloth_ochre'][(i + h.seed) % 4]);
    F.trayTable(bag, mid - 0.6, y, (zN + zS) / 2, { seed: h.seed + 2 }); F.rahle(bag, mid + 1.5, y, (zN + zS) / 2 + 0.2, 0.5);
    F.ewer(bag, mid + 0.2, y, (zN + zS) / 2 - 0.2, 0.8);
    for (let i = 0; i < 4; i++) bx(bag, 'wood_dark', a + 1.4 + i * 2.2, fy + 1.1, zN + 0.005 + T, a + 2.1 + i * 2.2, fy + 1.9, zN + T + 0.03);
    F.oilLamp(bag, lights, mid - 2.5, fy + 1.4, zS + 0.01, 'bronze', 1.3); }
  // the store: sacks, bales, rolled carpets, jars and the merchant's strong-box
  { const [a, b, d] = C, ox = d > 0 ? a : b;
    F.spiceSacks(bag, ox + d * 0.7, y, zN + 0.4, 0, 3 + (h.seed % 2)); F.bale(bag, ox + d * 0.5, y, zS - 0.4, 0.6, 0.4, 0.5, 0, 'sacking');
    F.bale(bag, ox + d * 0.5, y + 0.42, zS - 0.4, 0.55, 0.35, 0.45, 0.2, 'cloth_brown');
    F.rolledCarpets(bag, ox + d * 1.8, y, zS - 0.3, 3, 1.4, 0); F.waterJar(bag, ox + d * 1.7, y, zN + 0.5, 0.8);
    F.chest(bag, ox + d * 1.2, y, (zN + zS) / 2, 0.55, 1.0, 0.6, Math.PI / 2, 'wood_painted');
    bx(bag, 'iron', ox + d * 1.2 - 0.3, y + 0.0, (zN + zS) / 2 - 0.52, ox + d * 1.2 + 0.3, y + 0.04, (zN + zS) / 2 + 0.52); }
  // the loggia over the court: a deck on timber brackets, rails on its three sides, two columns of the roof's beam
  { const cx = S(W / 2), w = 3.4, dp = 1.0;
    for (let i = 0; i < 4; i++) bx(bag, 'timber', cx - w / 2 + 0.2 + i * (w - 0.4) / 3 - 0.07, fy - 0.45, zs - dp, cx - w / 2 + 0.2 + i * (w - 0.4) / 3 + 0.07, fy - 0.1, zs + T);
    bx(bag, 'timber', cx - w / 2, fy - 0.1, zs - dp, cx + w / 2, fy - 0.03, zs); bx(bag, 'wood_painted', cx - w / 2, fy - 0.03, zs - dp, cx + w / 2, fy, zs);
    col.floor([cx - w / 2, zs - dp, cx + w / 2, zs], fy);
    for (let i = 0; i <= 6; i++) bx(bag, 'timber', cx - w / 2 + i * w / 6 - 0.03, fy, zs - dp, cx - w / 2 + i * w / 6 + 0.03, fy + 1.0, zs - dp + 0.06);
    for (const sx of [-1, 1]) for (let i = 1; i <= 2; i++) bx(bag, 'timber', cx + sx * w / 2 - 0.03, fy, zs - dp + i * dp / 3 - 0.03, cx + sx * w / 2 + 0.03, fy + 1.0, zs - dp + i * dp / 3 + 0.03);
    bx(bag, 'timber', cx - w / 2 - 0.04, fy + 1.0, zs - dp - 0.03, cx + w / 2 + 0.04, fy + 1.07, zs - dp + 0.09);
    for (const sx of [-1, 1]) bx(bag, 'timber', cx + sx * w / 2 - 0.04, fy + 1.0, zs - dp - 0.03, cx + sx * w / 2 + 0.04, fy + 1.07, zs);
    col.rect([cx - w / 2, zs - dp - 0.03, cx + w / 2, zs - dp + 0.06], fy, fy + 1.0);
    for (const sx of [-1, 1]) col.rect([cx + sx * w / 2 - 0.03, zs - dp, cx + sx * w / 2 + 0.03, zs], fy, fy + 1.0);
    for (const sx of [-1, 1]) { bag.add('wood_painted', lathe([[0.1, 0], [0.085, 1.4], [0.1, 2.1]], 8, null, cx + sx * (1.2), fy, zs - 0.18)); col.circle(cx + sx * 1.2, zs - 0.18, 0.12, fy, fy + 2.1); } }
  // the balcony over the lane: a real deck and rails
  balcony();
  void termS;
}

/** The whole upper floor of a house (the full form). `solidTop`: the street wing's ground part (houses.js builds it up to the floor). */
export function upperFloor(E, h, WALL, balcony) {
  const F0 = facts(h);
  if (F0.rich) merchant(E, F0, h, WALL, balcony);
  else if (F0.room) balakhona(E, F0, h, WALL);
}
