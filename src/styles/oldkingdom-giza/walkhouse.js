// The houses and bakeries of Giza's workers' town built for a visitor who walks into them (docs/settlements/giza.md §19): the Old
// Kingdom's mud_house and bakery (../oldkingdom/index.js, read-only: Abu Simbel's workmen's quarter uses them) copied with the same
// dice, so that every wall, bench, oven and jar lies where it did, and changed only where the walk needs it: the house's door and its
// passage from court to room 1.6 m wide (the walker's raster wants 1.5), the bakery's door 1.6 m wide and moved off the vats; a
// pair of door leaves folded back against the inner wall, a clay lamp on the bench of the room and a banked ember at the oven's mouth.
// Pure builders of elements `mud_house` and `bakery`, and the places of their fires for the night (nightlight.js).

import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { houseFront, houseRoof, bakeryShade } from '../oldkingdom/dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const DOOR = 1.6;                                   // m: a house's door, the passage from its court to its room, a bakery's door
const TH = 0.45;

/** The plan of a house { rect, seed }: the dice of the Old Kingdom's mud_house, the room, the court, the door and the places of the lamp and the oven. */
export function plan(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0;
  const h = 2.6 + rand() * 0.6, court = rand() < 0.7, split = court ? x0 + W * (0.45 + rand() * 0.2) : x1;
  const xd = court ? (split + x1) / 2 : (x0 + split) / 2;
  const ix0 = x0 + TH / 2, iz0 = z0 + TH / 2, ix1 = split - TH / 2;
  const P = { h, court, split, xd, z1, ix0, iz0, ix1, iz1: z1 - TH / 2, lamp: [ix1 - 1.0, 0.38, iz0 + 0.24], oven: null };
  if (court) { const cx0 = split + TH / 2, cz0 = z0 + TH / 2; P.oven = [cx0 + 0.65, cz0 + 0.65]; }
  return P;
}

/** A shallow clay lamp (a bowl with a pinched lip, oil in it, a twisted linen wick, a small flame) standing at (x, y, z). */
export function lampMesh(bag, x, y, z, rot = 0) {
  const bowl = lathe([[0.001, 0], [0.035, 0.0], [0.06, 0.018], [0.065, 0.04], [0.05, 0.042], [0.045, 0.028], [0.001, 0.026]], 9, null, x, y, z);
  bag.add('terracotta', bowl);
  bag.add('pottery_dark', lathe([[0.001, 0.0], [0.03, 0.0], [0.028, 0.03], [0.001, 0.03]], 7, null, x + Math.cos(rot) * 0.055, y + 0.022, z + Math.sin(rot) * 0.055));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.012], [0.001, 0.055]], 6, null, x + Math.cos(rot) * 0.055, y + 0.05, z + Math.sin(rot) * 0.055));
}

/** The far form of a house { rect, seed }: a closed shell (outer walls with the door walled up, the wall between court and room, the roof over the room), no interior, no detail. */
function houseShell(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 2.6 + rand() * 0.6, th = TH, W = x1 - x0, court = rand() < 0.7, split = court ? x0 + W * (0.45 + rand() * 0.2) : x1;
  bag.add('mud_plaster', box(x0 - th / 2, 0, z0 - th / 2, x1 + th / 2, h, z0 + th / 2));
  bag.add('mud_plaster', box(x0 - th / 2, 0, z1 - th / 2, x1 + th / 2, h, z1 + th / 2));
  bag.add('mud_plaster', box(x0 - th / 2, 0, z0 + th / 2, x0 + th / 2, h, z1 - th / 2));
  bag.add('mud_plaster', box(x1 - th / 2, 0, z0 + th / 2, x1 + th / 2, h, z1 - th / 2));
  if (court) bag.add('mud_plaster', box(split - th / 2, 0, z0 + th / 2, split + th / 2, h, z1 - th / 2));
  const rx1 = split + (court ? th / 2 : 0);
  bag.add('mud_plaster', box(x0 - 0.25, h, z0 - 0.25, rx1 + 0.1, h + 0.3, z1 + 0.25));
}

/** mud_house { rect, seed, furnish } — see the module's note. With `simple`: the far form (houseShell). */
export function gizaHouse(el, { bag, col }) {
  if (el.simple) return houseShell(el, { bag, col });
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 2.6 + rand() * 0.6, th = TH;
  const W = x1 - x0, court = rand() < 0.7, split = court ? x0 + W * (0.45 + rand() * 0.2) : x1, F = !!el.furnish;
  const xd = court ? (split + x1) / 2 : (x0 + split) / 2, dw = DOOR;
  const seg = (p, q, mat = 'mud_plaster', y1 = h) => { const t = []; beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, y1); bag.add(mat, fromTriangles(t)); col.segment(p, q, th, 0, y1); };
  // the outer walls (the long ones run past the corners, the ends stop against them), the door in the south wall
  seg([x0 - th / 2, z0], [x1 + th / 2, z0]); seg([x0, z0 + th / 2], [x0, z1 - th / 2]); seg([x1, z0 + th / 2], [x1, z1 - th / 2]);
  seg([x0 - th / 2, z1], [xd - dw / 2, z1]); seg([xd + dw / 2, z1], [x1 + th / 2, z1]);
  bag.add('timber', box(xd - dw / 2 - 0.25, 1.95, z1 - th / 2 - 0.02, xd + dw / 2 + 0.25, 2.12, z1 + th / 2 + 0.02));
  bag.add('mud_plaster', box(xd - dw / 2 - 0.02, 2.11, z1 - th / 2 + 0.01, xd + dw / 2 + 0.02, h - 0.01, z1 + th / 2 - 0.01));
  bag.add('limestone_core', box(xd - dw / 2 + 0.01, -0.05, z1 - th / 2 - 0.05, xd + dw / 2 - 0.01, 0.08, z1 + th / 2 + 0.05));
  // the lane's dirt on the foot of the outer walls
  const e = 0.012, o = th / 2;
  [[x0 - o - e, z0 - o - e, x1 + o + e, z0 - o + 0.003, 0.45], [x0 - o - e, z0 - o, x0 - o + 0.003, z1 + o, 0.5], [x1 + o - 0.003, z0 - o, x1 + o + e, z1 + o, 0.55],
    [x0 - o - e, z1 + o - 0.003, xd - dw / 2 - 0.01, z1 + o + e, 0.6], [xd + dw / 2 + 0.01, z1 + o - 0.003, x1 + o + e, z1 + o + e, 0.62]].forEach(([p0, p1, q0, q1, t]) => bag.add('banco_rough', box(p0, -0.05, p1, q0, t, q1)));
  houseFront(bag, col, { x0, z0, x1, z1, h, th, xd, dw, seed: el.seed });
  // the door's two leaves, folded back against the inner face of the wall (as far as the room or the court allows)
  {
    const lo = court ? split + th / 2 : x0 + th / 2, hi = court ? x1 - th / 2 : split - th / 2, zi = z1 - th / 2;
    for (const [a, b] of [[xd - dw / 2 - Math.min(0.78, xd - dw / 2 - lo - 0.02), xd - dw / 2], [xd + dw / 2, xd + dw / 2 + Math.min(0.78, hi - xd - dw / 2 - 0.02)]]) {
      if (b - a < 0.3) continue;
      bag.add('timber', box(a, 0.06, zi - 0.05, b, 1.9, zi - 0.004));
      bag.add('wood_dark', box(a + 0.04, 0.5, zi - 0.07, b - 0.04, 0.56, zi - 0.05)); bag.add('wood_dark', box(a + 0.04, 1.4, zi - 0.07, b - 0.04, 1.46, zi - 0.05));
    }
  }
  if (court) {
    // the wall between court and room, with the passage to it 1.6 m wide at its south end
    seg([split, z0 + th / 2], [split, z1 - th / 2 - DOOR]);
    if (!F) { bag.add('mudbrick', box(split + 0.6, 0, z0 + 0.6, split + 1.6, 0.9, z0 + 1.6)); bag.add('mud_plaster', box(x1 - 1.4, 0, z0 + 0.6, x1 - 0.6, 1.2, z0 + 1.4)); }
    // (the lintel over the passage, so that the wall's top is whole)
    bag.add('timber', box(split - th / 2 - 0.02, 1.95, z1 - th / 2 - DOOR - 0.1, split + th / 2 + 0.02, 2.12, z1 - th / 2 + 0.02));
    bag.add('mud_plaster', box(split - th / 2 + 0.01, 2.11, z1 - th / 2 - DOOR, split + th / 2 - 0.01, h - 0.01, z1 - th / 2));
  }
  // the roof: palm logs under mud, the eaves of the logs showing
  const rx1 = split + (court ? th / 2 : 0);
  bag.add('timber', box(x0 - 0.25, h, z0 - 0.25, rx1 + 0.1, h + 0.12, z1 + 0.25));
  bag.add('mud_plaster', box(x0 - 0.25, h + 0.12, z0 - 0.25, rx1 + 0.1, h + 0.3, z1 + 0.25));
  col.floor([x0, z0, rx1, z1], h + 0.3);
  houseRoof(bag, { x0, z0, rx1, z1, h, seed: el.seed });
  if (!F) return;
  const ix0 = x0 + th / 2, iz0 = z0 + th / 2, iz1 = z1 - th / 2, ix1 = split - th / 2, logs = [];
  // the logs seen from beneath, across the short span
  for (let x = ix0 + 0.12; x < ix1 - 0.05; x += 0.26) beamTris(logs, [x, h - 0.12, iz0], [x, h - 0.12, iz1], 0.1, 0.12);
  bag.add('palm_trunk', fromTriangles(logs));
  // the sitting bench along the back (north) wall, the sleeping niche walled off at the west end
  const nw = Math.min(2.0, (ix1 - ix0) * 0.4);
  bag.add('mud_plaster', box(ix0 + nw + 0.13, 0, iz0 - 0.02, ix1 - 0.1, 0.38, iz0 + 0.48)); col.rect([ix0 + nw + 0.15, iz0, ix1 - 0.1, iz0 + 0.48], 0, 0.38);
  bag.add('mud_plaster', box(ix0 - 0.02, 0, iz0 - 0.02, ix0 + nw + 0.02, 0.42, iz0 + 1.0)); col.rect([ix0, iz0, ix0 + nw, iz0 + 1.0], 0, 0.42);
  bag.add('mud_plaster', box(ix0 + nw, 0, iz0 - 0.02, ix0 + nw + 0.15, 1.5, iz0 + 1.15)); col.rect([ix0 + nw, iz0, ix0 + nw + 0.15, iz0 + 1.15], 0, 1.5);
  bag.add('reed_mat', box(ix0 + 0.05, 0.425, iz0 + 0.06, ix0 + nw - 0.08, 0.442, iz0 + 0.94));
  bag.add('limestone_core', lathe([[0.001, 0], [0.09, 0.0], [0.03, 0.03], [0.03, 0.12], [0.1, 0.17], [0.11, 0.19], [0.001, 0.18]], 8).scale(1, 1, 0.45).translate(ix0 + 0.25, 0.442, iz0 + 0.5));
  bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.13, 0.12], [0.12, 0.25], [0.07, 0.32], [0.08, 0.35], [0.001, 0.35]], 10, null, ix1 - 0.4, 0.38, iz0 + 0.24));
  // the clay lamp on the bench, beside the jar, a smoke-black stain on the wall over it
  { const L = plan(el).lamp; lampMesh(bag, L[0], L[1], L[2], 0); bag.add('cloth_black', box(L[0] - 0.12, 0.62, iz0 - 0.005, L[0] + 0.12, 0.98, iz0 + 0.004)); }
  if (!court) return;
  const cx0 = split + th / 2, cz0 = z0 + th / 2, cx1 = x1 - th / 2;
  // the domed oven in the court's north-west corner, its mouth to the south, soot over the mouth
  const ox = cx0 + 0.65, oz = cz0 + 0.65;
  bag.add('mudbrick', lathe([[0.55, 0], [0.56, 0.3], [0.45, 0.65], [0.25, 0.85], [0.001, 0.9]], 14, null, ox, 0, oz));
  bag.add('pottery_dark', box(ox - 0.18, 0.05, oz + 0.47, ox + 0.18, 0.4, oz + 0.53));
  col.circle(ox, oz, 0.56, 0, 0.9);
  // the small circular granary in the north-east corner, its filling hole at the top, a stone on it
  const gx = cx1 - 0.6, gz = cz0 + 0.6;
  bag.add('mud_plaster', lathe([[0.52, 0], [0.55, 0.5], [0.5, 1.0], [0.32, 1.35], [0.1, 1.45], [0.1, 1.5], [0.001, 1.5]], 14, null, gx, 0, gz));
  bag.add('limestone_core', lathe([[0.001, 0], [0.13, 0], [0.12, 0.06], [0.001, 0.08]], 8, null, gx, 1.5, gz));
  col.circle(gx, gz, 0.55, 0, 1.5);
  // jars set in the floor (their rims and dark mouths at the floor) along the east wall
  for (let k = 0; k < 2; k++) { const jz = gz + 1.1 + k * 0.62; if (jz > z1 - 1.0) break; bag.add('terracotta', lathe([[0.22, 0], [0.23, 0.04], [0.17, 0.05], [0.16, 0.03]], 12, null, cx1 - 0.45, 0, jz)); bag.add('pottery_dark', lathe([[0.16, 0.0], [0.16, 0.012], [0.001, 0.012]], 10, null, cx1 - 0.45, 0, jz)); }
  // the saddle quern on its low kerb, its grinding stone on it, by the court's west wall
  const qz = Math.min(z1 - 1.6, cz0 + 1.9), qx = cx0 + 0.45;
  if (qz > oz + 0.9) {
    bag.add('mud_plaster', box(qx - 0.3, 0, qz - 0.45, qx + 0.3, 0.18, qz + 0.45));
    const g = frustum([-0.2, -0.32, 0.2, 0.32], 0, 0.1, 0.02, 0.02, 0.02, 0.02); g.rotateX(-0.12); g.translate(qx, 0.2, qz); bag.add('granite_red', g);
    bag.add('basalt', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.04], [0.04, 0.07], [0.001, 0.075]], 8).scale(2.6, 1, 1).rotateY(Math.PI / 2).translate(qx, 0.29, qz + 0.05));
    col.rect([qx - 0.3, qz - 0.45, qx + 0.3, qz + 0.45], 0, 0.35);
  }
  // a water jar by the court door: against the south wall on the side the door's lane leaves free (none where the court is too narrow)
  { const lane = [xd - dw / 2 - 0.2, xd + dw / 2 + 0.2], jx = cx1 - 0.3 > lane[1] + 0.2 ? cx1 - 0.3 : cx0 + 0.3 < lane[0] - 0.2 ? cx0 + 0.3 : null;
    if (jx !== null) bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]], 10, null, jx, 0, z1 - th / 2 - 0.3)); }
}

/** The bakery's door: its middle x from the west wall, 2.5 m (the pots' stack stands to the west of it, the first vat to the east). */
export const BAKERY_DOOR = 2.5;
/** The places of a bakery's fires { rect }: the open fire under the stack of pots, the bed of ash along the south wall. */
export function bakeryFires(el) {
  const [x0, z0, x1, z1] = el.rect, th = 0.5, hz0 = z1 - th / 2 - 1.5;
  return { stack: [x0 + th / 2 + 0.7, z0 + th / 2 + 0.7], bed: [(x0 + x1) / 2, hz0 + 0.8] };
}

/** bakery { rect, seed }: the Old Kingdom's, its door 1.6 m wide, in the north wall west of the middle. */
export function gizaBakery(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = 1.3, th = 0.5, rand = rng(el.seed || 3);
  if (el.simple) {                                             // the far form: the four walls closed, the hearth platform, nothing inside
    bag.add('limestone_core', box(x0 - th / 2, 0, z0 - th / 2, x1 + th / 2, h, z0 + th / 2)); bag.add('limestone_core', box(x0 - th / 2, 0, z1 - th / 2, x1 + th / 2, h, z1 + th / 2));
    bag.add('limestone_core', box(x0 - th / 2, 0, z0 + th / 2, x0 + th / 2, h, z1 - th / 2)); bag.add('limestone_core', box(x1 - th / 2, 0, z0 + th / 2, x1 + th / 2, h, z1 - th / 2));
    bag.add('mudbrick', box(x0 + th / 2, 0, z1 - th / 2 - 1.5, x1 - th / 2, 0.4, z1 - th / 2));
    return;
  }
  const walls = [[[x0, z1], [x1, z1]], [[x1, z0], [x1, z1]], [[x0, z0], [x0, z1]]];
  const mx = (x0 + x1) / 2, xd = x0 + BAKERY_DOOR, dh = DOOR / 2;
  walls.push([[x0, z0], [xd - dh, z0]], [[xd + dh, z0], [x1, z0]]);
  walls.forEach(([a, b], i) => {
    // the long walls run past the corners; the end walls stop against them (no faces in one plane)
    const e0 = i === 0 || i === 3 ? th / 2 : 0, e1 = i === 0 || i === 4 ? th / 2 : 0, ux = Math.sign(b[0] - a[0]), uz = Math.sign(b[1] - a[1]);
    const p = [a[0] - ux * e0, a[1] - uz * e0 + (i === 1 || i === 2 ? th / 2 : 0)], q = [b[0] + ux * e1, b[1] + uz * e1 - (i === 1 || i === 2 ? th / 2 : 0)], t = [];
    beamTris(t, [p[0], 0, p[1]], [q[0], 0, q[1]], th / 2, h);
    bag.add('limestone_core', fromTriangles(t));
    col.segment(p, q, th, 0, h);
  });
  // the hearth platform along the south wall and its bed of ash
  const hz0 = z1 - th / 2 - 1.5, hz1 = z1 - th / 2;
  bag.add('mudbrick', box(x0 + th / 2, 0, hz0, x1 - th / 2, 0.3, hz1));
  bag.add('plaster_grey', box(x0 + th / 2 + 0.15, 0.3, hz0 + 0.12, x1 - th / 2 - 0.15, 0.4, hz1 - 0.05));
  col.rect([x0, hz0, x1, hz1], 0, 0.4);
  // the bread pots in rows, bedded in the ash, mouths up; lids (pots upturned) on some
  const bell = [[0.04, 0], [0.09, 0.02], [0.15, 0.2], [0.17, 0.3], [0.15, 0.31], [0.13, 0.22], [0.001, 0.08]];
  const n = Math.floor((x1 - x0 - th - 0.5) / 0.42);
  for (let r = 0; r < 3; r++) for (let k = 0; k < n; k++) {
    if (rand() < 0.12) continue;
    const px = x0 + th / 2 + 0.45 + k * 0.42 + (r % 2) * 0.12, pz = hz0 + 0.35 + r * 0.42;
    bag.add('terracotta', lathe(bell, 9, null, px, 0.28, pz));
    if (rand() < 0.4) { const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(px, 0.28 + 0.31 + 0.3, pz); bag.add('terracotta', g); }
  }
  // the stack of pots heating upturned over an open fire, in the north-west corner
  const sx = x0 + th / 2 + 0.7, sz = z0 + th / 2 + 0.7;
  bag.add('pottery_dark', box(sx - 0.55, 0, sz - 0.55, sx + 0.55, 0.08, sz + 0.55));
  for (let k = 0; k < 3; k++) for (const [ox, oz] of k === 2 ? [[0, 0]] : [[-0.2, -0.15], [0.2, -0.15], [0, 0.2]]) {
    const g = lathe(bell, 9); g.rotateX(Math.PI); g.translate(sx + ox, 0.08 + 0.31 + k * 0.24, sz + oz); bag.add('pottery_dark', g);
  }
  col.rect([sx - 0.55, sz - 0.55, sx + 0.55, sz + 0.55], 0, 0.9);
  // beer brewed from the same dough (AERA: grain distributed "to create the beer and bread"): tall jars stoppered
  // with mud, stood in a row along the east wall
  for (let k = 0; k < 4; k++) {
    const jx = x1 - th / 2 - 0.25, jz = z0 + th / 2 + 2.2 + k * 0.42; if (jz > hz0 - 0.3) break;
    bag.add('terracotta', lathe([[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]], 10, null, jx, 0, jz));
    bag.add('mud_plaster', lathe([[0.09, 0], [0.09, 0.03], [0.06, 0.1], [0.001, 0.12]], 8, null, jx, 0.75, jz));
  }
  bakeryShade(bag, col, { rect: el.rect });
  // the two vats for the dough, sunk in rings of mudbrick
  for (const vx of [mx + 0.9, x1 - th / 2 - 0.8]) {
    const vz = z0 + th / 2 + 1.1;
    bag.add('mudbrick', lathe([[0.62, 0], [0.62, 0.45], [0.5, 0.5], [0.001, 0.5]], 14, null, vx, 0, vz));
    bag.add('terracotta', lathe([[0.5, 0.5], [0.56, 0.62], [0.52, 0.64], [0.4, 0.56], [0.001, 0.54]], 14, null, vx, 0, vz));
    col.circle(vx, vz, 0.62, 0, 0.64);
  }
  // a lintel-less low door: a limestone sill in the gap, worn hollow in the middle
  bag.add('limestone_core', box(xd - dh, 0, z0 - th / 2 - 0.05, xd + dh, 0.06, z0 + th / 2 + 0.05));
}
