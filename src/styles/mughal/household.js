// The rooms of the Taj Ganj's ordinary houses (docs/settlements/mughal-agra.md §15): what a household of the town kept in the ground
// room behind its street door, by its work — the family's room with the hearth (chulha) and the quern (chakki), the weaver's
// with his loom and the yarn, the grain dealer's with the mud bins (kothi) and sacks, the embroiderer's with the frame (adda)
// of zardozi — and the room over it by its use (sleeping, store, sitting). Built in the house's local frame (front at z = 0,
// the body at −z, x along the frontage; see townhouse.js), with the stair along the left-hand wall when there is a room over.

import { box, lathe } from '../../core/geom.js';
import * as F from './furnish.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const KINDS = ['hearth', 'hearth', 'weaver', 'grain', 'grain', 'zardozi'];
/** The work of a household, from its lot's seed (one place for the room, the room over it and the people in them). */
export const householdOf = (seed) => KINDS[(Math.imul(seed | 0, 2654435761) >>> 16) % KINDS.length];

const R = 'sandstone_red';
const FH = 3.5, T = 0.4;

/** A timber stair of seventeen treads up the left-hand wall from the floor FY to the slab at FH, its well already cut in the slab. */
export function houseStairs(B, C, L, FY) {
  const { hw, D } = L, n = 17, rise = (FH - FY) / n, run = 0.27, x0 = -hw + T, x1 = -hw + T + 1.05, zb = -D + T + n * run;
  for (let i = 0; i < n; i++) B.add('wood_dark', box(x0, FY, zb - (i + 1) * run, x1, FY + rise * (i + 1), zb - i * run));
  C.ramp([x0, -D + T, x1, zb], FY, FH, 0, -1);
  B.add('wood_dark', box(x1 - 0.04, FY + 0.9, -D + T, x1, FY + 1.0, zb));
}

/** The lining of a room's walls: plaster, the lower part darkened by hands and smoke. */
function lining(B, L, y0, y1, zFront) {
  const { hw, D } = L, a = -hw + T, b = hw - T, z0 = -D + T;
  B.add('lime_plaster', box(a, y0, z0, a + 0.03, y1, zFront)); B.add('lime_plaster', box(b - 0.03, y0, z0, b, y1, zFront)); B.add('lime_plaster', box(a + 0.03, y0, z0, b - 0.03, y1, z0 + 0.03));
  B.add('earth_wall', box(a + 0.03, y0, z0 + 0.03, b - 0.03, y0 + 0.5, z0 + 0.05));
}

/** The hearth: a clay stove with a pot on it, soot over it on the wall, cakes of dung beside it. */
function chulha(B, C, x, FY, z, back) {
  B.add('mud_plaster', lathe([[0.4, 0], [0.42, 0.1], [0.36, 0.3], [0.3, 0.34], [0.001, 0.34]], 10, null, x, FY, z));
  for (const a of [0.4, 2.5, 4.6]) B.add('mud_plaster', box(x + Math.cos(a) * 0.24 - 0.04, FY + 0.34, z + Math.sin(a) * 0.24 - 0.04, x + Math.cos(a) * 0.24 + 0.04, FY + 0.42, z + Math.sin(a) * 0.24 + 0.04));
  B.add('lacquer_black', lathe([[0.1, 0], [0.22, 0.01], [0.26, 0.14], [0.2, 0.25], [0.15, 0.27], [0.14, 0.25]], 12, null, x, FY + 0.36, z));
  B.add('plaster_grey', box(x - 0.55, FY + 0.5, back + 0.03, x + 0.55, FY + 2.1, back + 0.05));
  for (let i = 0; i < 5; i++) B.add('mud_plaster', lathe([[0.001, 0], [0.13, 0], [0.14, 0.02], [0.12, 0.045], [0.001, 0.045]], 8, null, x - 0.78, FY + i * 0.045, back + 0.25));
  C.circle(x, z, 0.45, FY, FY + 0.5);
}

/** The quern (chakki): the lower stone, the upper one with its peg of a handle, on a reed mat. */
function chakki(B, C, x, FY, z) {
  F.reedMat(B, x, FY, z, 1.2, 1.2, 0.3);
  B.add('granite_grey', lathe([[0.001, 0], [0.32, 0], [0.34, 0.04], [0.32, 0.1], [0.001, 0.1]], 14, null, x, FY + 0.012, z));
  B.add('granite_grey', lathe([[0.3, 0], [0.31, 0.07], [0.2, 0.09], [0.07, 0.085], [0.07, 0.07], [0.001, 0.07]], 14, null, x, FY + 0.112, z));
  B.add('wood_dark', box(x + 0.18, FY + 0.19, z - 0.015, x + 0.2, FY + 0.35, z + 0.015));
  B.add('cloth_ochre', lathe([[0.001, 0], [0.22, 0], [0.12, 0.08], [0.001, 0.12]], 9, null, x + 0.42, FY + 0.012, z + 0.3));
  C.circle(x, z, 0.4, FY, FY + 0.3);
}

/** A mud grain bin (kothi): a fat jar of plastered mud with a neck, a wooden lid over it. */
function kothi(B, C, x, FY, z, k = 1) {
  B.add('mud_plaster', lathe([[0.5, 0], [0.56, 0.1], [0.62, 0.7], [0.52, 1.2], [0.3, 1.4], [0.27, 1.55], [0.001, 1.55]].map(([r, h]) => [r * k, h * k]), 12, null, x, FY, z));
  B.add('wood_dark', lathe([[0.001, 0], [0.33, 0], [0.33, 0.05], [0.001, 0.07]].map(([r, h]) => [r * k, h * k]), 12, null, x, FY + 1.55 * k, z));
  B.add('earth_wall', lathe([[0.5, 0], [0.56, 0.1], [0.58, 0.3]].map(([r, h]) => [r * k * 1.002, h * k]), 12, null, x, FY, z));
  C.circle(x, z, 0.62 * k, FY, FY + 1.6 * k);
}

/** The loom (a frame loom of the weaver's): posts and rails, the warp from the beam on the back to the cloth beam in front, the woven cloth, heddles and the reed. Warp along z. */
function loom(B, C, lx, FY, zA, zB, r) {
  const wd = 0.55, wood = 'wood_dark';
  for (const sx of [-1, 1]) for (const z of [zA, zB]) B.add(wood, box(lx + sx * wd - 0.04, FY, z - 0.04, lx + sx * wd + 0.04, FY + 1.5, z + 0.04));
  for (const sx of [-1, 1]) B.add(wood, box(lx + sx * wd - 0.035, FY + 1.46, zA - 0.04, lx + sx * wd + 0.035, FY + 1.54, zB + 0.04));
  B.add(wood, box(lx - wd, FY + 1.1, zA - 0.04, lx + wd, FY + 1.2, zA + 0.04));
  B.add(wood, box(lx - wd, FY + 0.7, zA - 0.05, lx + wd, FY + 0.8, zA + 0.05));                // the warp beam, on the back
  B.add(wood, box(lx - wd, FY + 0.62, zB - 0.05, lx + wd, FY + 0.72, zB + 0.05));              // the cloth beam, in front
  const nW = 32, wz = (zA + zB) / 2 + 0.15;
  for (let i = 0; i < nW; i++) {
    const x = lx - 0.47 + i * (0.94 / (nW - 1));
    B.add('cloth_white', box(x - 0.004, FY + 0.76, zA + 0.05, x + 0.004, FY + 0.78, wz));    // the warp, drawn out
    B.add(i % 8 < 2 ? 'cloth_red' : i % 8 < 5 ? 'cloth_ochre' : 'cloth_indigo', box(x - 0.014, FY + 0.7, wz, x + 0.014, FY + 0.715, zB - 0.06));   // the cloth woven: stripes along it
  }
  // the heddle frames hanging from the rail, and the beater with its reed
  for (const dz of [-0.35, -0.12]) {
    const z = wz + dz; B.add(wood, box(lx - 0.5, FY + 0.74, z - 0.015, lx + 0.5, FY + 0.78, z + 0.015)); B.add(wood, box(lx - 0.5, FY + 1.14, z - 0.015, lx + 0.5, FY + 1.18, z + 0.015));
    for (const sx of [-1, 1]) B.add('sacking', box(lx + sx * 0.5 - 0.005, FY + 1.18, z - 0.005, lx + sx * 0.5 + 0.005, FY + 1.46, z + 0.005));
  }
  B.add(wood, box(lx - 0.52, FY + 0.7, wz + 0.2, lx + 0.52, FY + 0.76, wz + 0.26)); B.add(wood, box(lx - 0.52, FY + 1.1, wz + 0.2, lx + 0.52, FY + 1.16, wz + 0.26));
  for (const sx of [-1, 1]) B.add(wood, box(lx + sx * 0.52 - 0.02, FY + 0.7, wz + 0.2, lx + sx * 0.52 + 0.02, FY + 1.46, wz + 0.26));
  for (let i = 0; i < 14; i++) B.add('wicker', box(lx - 0.46 + i * 0.066, FY + 0.76, wz + 0.215, lx - 0.46 + i * 0.066 + 0.006, FY + 1.1, wz + 0.245));
  // the weaver's seat in front of the cloth beam, the treadle boards low under the frame
  B.add(wood, box(lx - 0.35, FY, zB + 0.35, lx + 0.35, FY + 0.28, zB + 0.8)); B.add('cloth_white', box(lx - 0.3, FY + 0.28, zB + 0.4, lx + 0.3, FY + 0.31, zB + 0.75));
  for (const sx of [-1, 1]) B.add(wood, box(lx + sx * 0.2 - 0.05, FY + 0.04, zA + 0.5, lx + sx * 0.2 + 0.05, FY + 0.1, zB - 0.1));
  C.rect([lx - wd - 0.1, zA - 0.1, lx + wd + 0.1, zB + 0.1], FY, FY + 1.5);
  void r;
}

/** The adda: the embroiderer's frame, a timber frame on legs with a dark cloth stretched on it set with gold thread. */
function adda(B, C, x, FY, z, yaw, r) {
  const w = 1.7, d = 0.95, cos = Math.cos(yaw), sin = Math.sin(yaw), P = (lx, lz) => [x + lx * cos + lz * sin, z - lx * sin + lz * cos];
  const bx = (m, a, b, c, d2, e, f2) => { const p0 = P(a, c), p1 = P(b, f2); B.add(m, box(Math.min(p0[0], p1[0]), FY + d2, Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), FY + e, Math.max(p0[1], p1[1]))); };
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx('wood_dark', sx * w / 2 - 0.04, sx * w / 2 + 0.04, sz * d / 2 - 0.04, 0, 0.5, sz * d / 2 + 0.04);
  for (const sz of [-1, 1]) bx('wood_dark', -w / 2, w / 2, sz * d / 2 - 0.04, 0.46, 0.52, sz * d / 2 + 0.04);
  for (const sx of [-1, 1]) bx('wood_dark', sx * w / 2 - 0.04, sx * w / 2 + 0.04, -d / 2, 0.46, 0.52, d / 2);
  bx(r() < 0.5 ? 'cloth_maroon' : 'cloth_indigo', -w / 2 + 0.05, w / 2 - 0.05, -d / 2 + 0.05, 0.5, 0.515, d / 2 - 0.05);
  // the design in gold thread: a row of lozenges down the middle and a border of small studs
  for (let i = 0; i < 7; i++) { const u = -w / 2 + 0.25 + i * (w - 0.5) / 6; bx('gilt_bronze', u - 0.07, u + 0.07, -0.07, 0.515, 0.522, 0.07); bx('gilt_bronze', u - 0.03, u + 0.03, -0.25, 0.515, 0.521, -0.19); bx('gilt_bronze', u - 0.03, u + 0.03, 0.19, 0.515, 0.521, 0.25); }
  C.circle(x, z, 1.05, FY, FY + 0.55);
  // his stool-mat on one long side, a tray of spools and a little lamp on the other
  const [mx, mz] = P(0, d / 2 + 0.55); F.kilim(B, mx, FY + 0.005, mz, 1.0, 0.8, yaw, ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_white']);
  const [tx, tz] = P(w / 2 + 0.3, -d / 2 - 0.3); F.trayTable(B, tx, FY, tz, { r: 0.26, h: 0.2, things: false }); B.add('gilt_bronze', lathe([[0.001, 0], [0.03, 0], [0.03, 0.05], [0.001, 0.05]], 8, null, tx, FY + 0.205, tz));
  F.oilLamp(B, [], tx + 0.12, FY + 0.205, tz - 0.05, 'bronze', 0);
}

/**
 * The ground room of a house that stands open (L from `layoutOf`): `kind` = householdOf(seed). FY is its floor, `door` the x of the street door
 * (kept clear in front of it), `stair` whether a stair stands along the left-hand wall at the back.
 */
export function houseRoom(B, C, L, el, FY, kind) {
  const { hw, D, st, dx } = L, r = rng(((el.seed | 0) * 17 + 9) >>> 0), ix0 = -hw + T, ix1 = hw - T, back = -D + T;
  lining(B, L, FY, FH - 0.25, -0.02);
  const stair = st > 1, fx0 = ix0 + (stair ? 1.35 : 0.15), side = dx > 0 ? -1 : 1;                  // furniture goes to the side away from the door
  // every room: a niche in the back wall with its lamp, the water jars on their stand
  { const nx = side > 0 ? ix1 - 1.0 : fx0 + 0.6; B.add(R, box(nx - 0.2, FY + 1.4, back + 0.03, nx + 0.2, FY + 1.46, back + 0.22)); B.add('plaster_grey', box(nx - 0.12, FY + 1.5, back + 0.03, nx + 0.12, FY + 2.1, back + 0.05)); F.oilLamp(B, [], nx, FY + 1.46, back + 0.14, 'terracotta', 0); }
  if (kind === 'hearth') {
    const hx = side > 0 ? ix1 - 1.1 : fx0 + 1.1;
    chulha(B, C, hx, FY, back + 0.6, back);
    F.waterJar(B, side > 0 ? ix1 - 0.45 : fx0 + 0.45, FY, back + 0.5, 0.95, 'terracotta');
    chakki(B, C, side > 0 ? ix0 + 1.6 + (stair ? 1.3 : 0) : ix1 - 1.4, FY, back + 2.2);
    F.charpoy(B, C, side > 0 ? ix1 - 0.6 : fx0 + 0.6, FY, back + 4.0, Math.PI / 2, { quilt: ['cloth_red', 'cloth_indigo', 'cloth_green'][(el.seed | 0) % 3] });
    F.trayTable(B, hx - 0.2, FY, back + 1.7, { r: 0.3, h: 0.22, seed: el.seed | 0 });
    // a shelf along the wall with the cooking pots and the brass
    B.add('wood_dark', box(ix1 - 0.4, FY + 1.5, back + 2.5, ix1, FY + 1.55, back + 5.2));
    F.pots(B, ix1 - 0.22, FY + 1.55, back + 3.0, 0, 3); F.copperware(B, ix1 - 0.22, FY + 1.55, back + 4.4, 0, el.seed | 0, 3);
  } else if (kind === 'weaver') {
    const lx = side > 0 ? ix1 - 1.1 : fx0 + 1.1;
    loom(B, C, lx, FY, back + 0.5, back + 3.1, r);
    // the yarn: skeins hung on pegs along the back wall, a basket of cops, dyed cloth folded on a shelf, a water jar
    const px = side > 0 ? fx0 + 0.5 : ix1 - 3.0;
    B.add('wood_dark', box(px - 0.1, FY + 1.7, back + 0.03, px + 2.4, FY + 1.76, back + 0.08));
    for (let i = 0; i < 6; i++) { const m = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_green', 'cloth_maroon'][i]; B.add(m, box(px + i * 0.4, FY + 1.1, back + 0.08, px + i * 0.4 + 0.2, FY + 1.7, back + 0.2)); }
    F.bolts(B, side > 0 ? fx0 + 0.9 : ix1 - 1.0, FY, back + 3.8, 5, 0.4);
    B.add('wicker', lathe([[0.15, 0], [0.24, 0.2], [0.22, 0.24], [0.001, 0.24]], 10, null, side > 0 ? fx0 + 0.5 : ix1 - 0.5, FY, back + 5.0));
    F.waterJar(B, side > 0 ? ix1 - 0.45 : fx0 + 0.45, FY, back + 0.5, 0.95, 'terracotta');
    F.charpoy(B, C, side > 0 ? fx0 + 0.6 : ix1 - 0.6, FY, back + 6.0, Math.PI / 2, { quilt: 'cloth_indigo' });
  } else if (kind === 'grain') {
    const n = Math.max(2, Math.min(3, Math.floor((ix1 - fx0 - 0.2) / 1.35)));
    for (let i = 0; i < n; i++) kothi(B, C, (side > 0 ? ix1 - 0.75 - i * 1.3 : fx0 + 0.75 + i * 1.3), FY, back + 0.72, 0.9 + (i % 2) * 0.12);
    const bx = side > 0 ? fx0 + 0.6 : ix1 - 0.6;
    for (let i = 0; i < 3; i++) { F.bale(B, bx, FY, back + 1.0 + i * 0.75, 0.55, 0.5, 0.7, 0.1 * i, ['sacking', 'cloth_ochre', 'sacking'][i]); C.rect([bx - 0.3, back + 0.65 + i * 0.75, bx + 0.3, back + 1.35 + i * 0.75], FY, FY + 0.55); }
    F.bale(B, bx, FY + 0.5, back + 1.4, 0.5, 0.4, 0.6, 0.2, 'sacking');
    // grain heaped on a mat to dry, a winnowing tray beside it, the measure
    const mx = side > 0 ? ix1 - 1.4 : fx0 + 1.4;
    F.reedMat(B, mx, FY, back + 3.2, 1.5, 1.2, 0);
    B.add('cloth_ochre', lathe([[0.5, 0], [0.4, 0.06], [0.22, 0.14], [0.001, 0.18]], 12, null, mx, FY + 0.012, back + 3.2));
    B.add('wicker', lathe([[0.001, 0], [0.34, 0.01], [0.36, 0.05], [0.33, 0.05]], 12, null, mx + 0.9, FY, back + 3.4));
    B.add('terracotta', lathe([[0.001, 0], [0.1, 0], [0.12, 0.2], [0.1, 0.22], [0.08, 0.2]], 10, null, mx - 0.85, FY, back + 3.6));
    chakki(B, C, side > 0 ? fx0 + 1.2 : ix1 - 1.3, FY, back + 5.4);
  } else {
    const ax = side > 0 ? ix1 - 1.5 : fx0 + 1.5;
    adda(B, C, ax, FY, back + 1.8, 0, r);
    // bolts of silk and brocade on a shelf, a chest with the finished work, the water jar, a charpoy
    B.add('wood_dark', box(side > 0 ? ix1 - 0.5 : ix0 + (stair ? 1.3 : 0.1), FY + 1.5, back + 0.03, side > 0 ? ix1 : ix0 + (stair ? 1.3 : 0.1) + 0.5, FY + 1.55, back + 0.08));
    F.bolts(B, ax + 0.1, FY + 1.55, back + 0.3, 4, 0, ['cloth_maroon', 'cloth_indigo', 'cloth_white', 'cloth_red'], 0.4);
    F.chest(B, side > 0 ? ix1 - 0.4 : fx0 + 0.4, FY, back + 3.6, 0.9, 0.5, 0.55, Math.PI / 2); C.rect([(side > 0 ? ix1 - 0.7 : fx0 + 0.1), back + 3.15, (side > 0 ? ix1 - 0.1 : fx0 + 0.7), back + 4.05], FY, FY + 0.55);
    F.waterJar(B, side > 0 ? fx0 + 0.45 : ix1 - 0.45, FY, back + 0.5, 0.95, 'terracotta');
    F.charpoy(B, C, side > 0 ? fx0 + 0.6 : ix1 - 0.6, FY, back + 5.4, Math.PI / 2, { quilt: 'cloth_red' });
  }
}

/** The room over a house's ground room (floor UY, ceiling UY + 3.1): by the seed, a sleeping room, a store or a sitting room. */
export function houseUpper(B, C, L, el, UY) {
  const { hw, D } = L, r = rng(((el.seed | 0) * 29 + 5) >>> 0), ix0 = -hw + T, ix1 = hw - T, back = -D + T, HL = UY + 3.1, q = ((el.seed | 0) >>> 4) % 3;
  lining(B, L, UY, HL - 0.25, -0.5);
  const x = ix1 - 1.4;
  if (q === 0) {
    // the sleeping room: a dhurrie, two charpoys with their quilts, a chest, the niche
    F.kilim(B, 0.6, UY + 0.016, back + 3.2, Math.min(3.2, hw * 2 - 3.4), 3.8, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre']);
    F.charpoy(B, C, x, UY, back + 3.8, Math.PI / 2, { quilt: ['cloth_red', 'cloth_indigo', 'cloth_green'][(r() * 3) | 0] }); F.charpoy(B, C, x, UY, back + 5.9, Math.PI / 2, { quilt: 'cloth_indigo' });
    F.chest(B, ix1 - 0.4, UY, back + 1.3, 0.8, 0.5, 0.55, Math.PI / 2); C.rect([ix1 - 0.7, back + 0.9, ix1, back + 1.7], UY, UY + 0.55);
  } else if (q === 1) {
    // the store: bales and jars, trunks, a rope strung with hanging clothes
    for (let i = 0; i < 3; i++) { F.bale(B, ix1 - 0.6, UY, back + 1.0 + i * 0.8, 0.6, 0.55, 0.7, 0, ['sacking', 'cloth_white', 'cloth_ochre'][i]); C.rect([ix1 - 0.9, back + 0.65 + i * 0.8, ix1, back + 1.35 + i * 0.8], UY, UY + 0.6); }
    F.chest(B, ix1 - 0.4, UY, back + 4.0, 0.9, 0.55, 0.6, Math.PI / 2); C.rect([ix1 - 0.7, back + 3.55, ix1, back + 4.45], UY, UY + 0.6);
    F.pots(B, ix1 - 0.8, UY, back + 5.2, 0, 4); F.waterJar(B, ix1 - 0.45, UY, back + 6.2, 0.9, 'terracotta');
    B.add('sacking', box(ix0 + 0.1, UY + 2.2, back + 0.5, ix1 - 0.1, UY + 2.23, back + 0.53));
    for (let i = 0; i < 5; i++) B.add(['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white'][i], box(ix0 + 1.6 + i * 0.6, UY + 1.45, back + 0.5, ix0 + 2.0 + i * 0.6, UY + 2.2, back + 0.53));
  } else {
    // the sitting room: a dhurrie with bolsters along the wall, a tray table, the hookah, a Qur'an on its stand
    F.kilim(B, 0.2, UY + 0.016, back + 3.2, Math.min(3.0, hw * 2 - 3.6), 4.0, 0, ['cloth_maroon', 'cloth_white', 'cloth_ochre', 'cloth_indigo']);
    for (let i = 0; i < 3; i++) F.bolster(B, 0.2 + (i - 1) * 0.9, UY + 0.03, back + 1.3, 0.9, 0.13, Math.PI / 2, ['cloth_red', 'cloth_green', 'cloth_indigo'][i], 'cloth_ochre');
    F.trayTable(B, 0.2, UY, back + 3.2, { r: 0.34, h: 0.3, seed: el.seed | 0 }); F.hookah(B, 1.1, UY + 0.012, back + 3.5, 0.3);
    F.rahle(B, -0.5, UY + 0.012, back + 2.4, Math.PI, {});
  }
  B.add(R, box(ix0 + (L.st > 1 ? 1.5 : 0.4) - 0.2, UY + 1.3, back + 0.03, ix0 + (L.st > 1 ? 1.5 : 0.4) + 0.2, UY + 1.36, back + 0.22)); F.oilLamp(B, [], ix0 + (L.st > 1 ? 1.5 : 0.4), UY + 1.36, back + 0.14, 'terracotta', 0);
}
