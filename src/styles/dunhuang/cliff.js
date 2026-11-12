// The Mogao cliff (docs/settlements/dunhuang.md §2, §3, §5): a wall of conglomerate cut in slabs between the caves,
// each cave a hole in it (chamber, passage, tier by tier), timber porches and galleries on its face, the stair
// up to the second tier, the stone apron at its foot. The cave interiors are caves.js; the Great Buddha's hall
// and the Nine-Storey building are nine.js.
import { box, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { XF, ROCK, ZEND, FLOOR, CAVES, STAIR, GALLERY, APRON, cliffTop, rng } from '../../settlements/dunhuang/layout.js';
import { hallCave, pillarCave, cellCave } from './caves.js';
import { greatCave, nineStorey } from './nine.js';
import { Panel, wallPanel, PAL, tableauM, buddhaM, apsaraM, lotusM } from './paint.js';

const ROCKM = 'rubble';
const MATS = ['rubble', 'sandstone_relief', 'sandstone_carved'];
/** The chamber and passage boxes of a cave: { x0, x1, z0, z1, y0, y1 }. */
function holes(c) {
  const y = FLOOR[c.tier], z = c.z;
  if (c.kind === 'hall') return [{ x0: XF - 7.8, x1: XF - 1.4, z0: z - 3, z1: z + 3, y0: y - 0.12, y1: y + 5.4 }, { x0: XF - 1.4, x1: XF, z0: z - 1, z1: z + 1, y0: y - 0.12, y1: y + 2.6 }];
  if (c.kind === 'pillar') return [{ x0: XF - 10, x1: XF - 1.6, z0: z - 3.5, z1: z + 3.5, y0: y - 0.12, y1: y + 5.0 }, { x0: XF - 1.6, x1: XF, z0: z - 1, z1: z + 1, y0: y - 0.12, y1: y + 2.6 }];
  if (c.kind === 'cell') return [{ x0: XF - 5, x1: XF - 1.2, z0: z - 1.6, z1: z + 1.6, y0: y - 0.12, y1: y + 2.3 }, { x0: XF - 1.2, x1: XF, z0: z - 1, z1: z + 1, y0: y - 0.12, y1: y + 2.3 }];
  if (c.kind === 'great') return [{ x0: XF - 26, x1: XF - 1, z0: -11.5, z1: 11.5, y0: y - 0.12, y1: 39 }, { x0: XF - 1, x1: XF, z0: -7, z1: 7, y0: y - 0.12, y1: 20 }, { x0: XF - 1, x1: XF, z0: -3.2, z1: 3.2, y0: 27, y1: 37 }];
  return [{ x0: XF - 1.9, x1: XF, z0: z - c.w / 2, z1: z + c.w / 2, y0: FLOOR[c.tier] - 0.1, y1: FLOOR[c.tier] + c.h }];
}

/** A timber porch before a cave's door at tier floor y: columns, beam, a tiled shed roof from the cliff. */
function porch(ctx, c, y, w, h) {
  const { bag, col } = ctx, z = c.z, e = 2.3, ye = y + h;
  const z0 = z - w / 2, z1 = z + w / 2;
  for (const zz of [z0, z1]) {
    bag.add('timber_red', lathe([[0.2, 0], [0.2, 0.06], [0.17, 0.12], [0.16, h - 0.2], [0.18, h]], 10, null, XF + e - 0.3, y, zz));
    col.circle(XF + e - 0.3, zz, 0.2, y, ye);
  }
  bag.add('timber_red', box(XF + e - 0.5, ye, z0 - 0.35, XF + e - 0.1, ye + 0.34, z1 + 0.35));
  bag.add('lacquer_red', box(XF + e - 0.5, ye - 0.22, z0 - 0.1, XF + e - 0.1, ye, z1 + 0.1));
  // brackets: two projecting arms on each column
  for (const zz of [z0, z1]) for (let k = 0; k < 2; k++) bag.add('timber_red', box(XF + e - 0.3 - 0.15 - k * 0.5, ye + 0.0 + k * 0.17, zz - 0.1, XF + e - 0.3 + 0.6 + k * 0.3, ye + 0.17 + k * 0.17, zz + 0.1));
  // the roof: tiles from the cliff face (a little above the beam) out over the beam and down
  const yo = ye + 0.9, yi = ye + 1.9, xo = XF + e + 0.5, t = [], u = [];
  const A = [XF, yi, z0 - 0.6], B = [XF, yi, z1 + 0.6], C = [xo, yo, z1 + 1.0], D = [xo, yo, z0 - 1.0];
  quad(t, A, B, C, D);                                          // seen from above: A B C D must wind counter-clockwise from above
  const down = (p) => [p[0], p[1] - 0.2, p[2]];
  quad(u, down(D), down(C), down(B), down(A));
  bag.add('tile_grey', fromTriangles(flipUp(t, true)));
  bag.add('timber_red', fromTriangles(flipUp(u, false)));
  // eave front (fascia) and bells at the corners
  bag.add('timber_red', box(xo - 0.1, yo - 0.3, z0 - 1.0, xo + 0.03, yo - 0.02, z1 + 1.0));
  for (const zz of [z0 - 1.0, z1 + 1.0]) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.03], [0.08, 0.13], [0.001, 0.15]], 8, null, xo - 0.05, yo - 0.52, zz));
  // the side walls of the roof (two triangles of plaster) so that the roof's ends are closed
}
/** Make every triangle of a list face up (up) or down (!up). */
function flipUp(t, up) {
  const o = [];
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const ny = uz * vx - ux * vz;
    if ((ny >= 0) === up) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6));
  }
  return o;
}

/** A shallow shrine: the painted back, a seated Buddha painted large, a red frame; seen from outside. */
function recess(ctx, c) {
  const { bag } = ctx, y = FLOOR[c.tier], z = c.z, x1 = XF, x0 = XF - 1.9, w = c.w, h = c.h, t = 0.04;
  bag.add('brick_grey', box(x0, y - 0.12, z - w / 2, x1, y, z + w / 2));
  bag.add('lime_plaster', box(x0, y, z - w / 2, x0 + t, y + h, z + w / 2));
  bag.add('lime_plaster', box(x0, y, z - w / 2, x1, y + h, z - w / 2 + t));
  bag.add('lime_plaster', box(x0, y, z + w / 2 - t, x1, y + h, z + w / 2));
  const P = wallPanel(bag, [x0, z + w / 2], [x0, z - w / 2], y, [1, 0]);
  P.rect(PAL.green2, 0.05, 0.05, w - 0.05, h - 0.05, 1);
  P.ell(PAL.red, w / 2, h * 0.5, w * 0.34, h * 0.42, 2, 14);
  buddhaM(P, w / 2, 0.15, Math.min(h, w) * 0.95, { robe: PAL.red2 }, 3);
  if (c.seed % 2) { apsaraM(P, w * 0.25, h * 0.85, 0.7, 1, {}, 3); apsaraM(P, w * 0.75, h * 0.85, 0.7, -1, {}, 3); }
  P.flush();
  // the frame: two posts and a lintel painted red, set on the face
  bag.add('lacquer_red', box(XF - 0.04, y, z - w / 2 - 0.1, XF + 0.12, y + h + 0.2, z - w / 2));
  bag.add('lacquer_red', box(XF - 0.04, y, z + w / 2, XF + 0.12, y + h + 0.2, z + w / 2 + 0.1));
  bag.add('lacquer_red', box(XF - 0.04, y + h, z - w / 2 - 0.1, XF + 0.12, y + h + 0.2, z + w / 2 + 0.1));
}

export function cliff(el, ctx) {
  const { bag, col } = ctx, rand = rng(7);
  const H = [];
  for (const c of CAVES) for (const h of holes(c)) H.push({ ...h, cave: c });
  // cut planes in z: every hole's edges, and rhythm cuts (so that the face is not one slab)
  const cuts = new Set([-ZEND, ZEND]);
  for (const h of H) { cuts.add(h.z0); cuts.add(h.z1); }
  for (let z = -ZEND + 5; z < ZEND; z += 5 + rand() * 7) cuts.add(Math.round(z * 4) / 4);
  const Z = [...cuts].sort((a, b) => a - b);
  for (let i = 0; i < Z.length - 1; i++) {
    const za = Z[i], zb = Z[i + 1], zm = (za + zb) / 2;
    if (zb - za < 0.02) continue;
    const here = H.filter((h) => zm > h.z0 && zm < h.z1);
    const top = cliffTop(zm) + (rand() - 0.5) * 1.6;
    const off = here.length ? 0 : [0, 0.4, 0.35, 0.9, 0.2][Math.floor(rand() * 5)];
    const rects = subtractRects([XF - ROCK, 0, XF + off, top], here.map((h) => [h.x0, h.y0, h.x1, h.y1]));
    for (const [x0, y0, x1, y1] of rects) {
      bag.add(here.length ? ROCKM : MATS[Math.floor(Math.abs(Math.sin(zm * 12.9898)) * 43758) % 3], box(x0, y0, za, x1, y1, zb));
      col.rect([x0, za, x1, zb], y0, y1);
    }
    // a stepped, broken crest: boulders on the top of the cliff in the slabs without a hole
    if (!here.length && rand() < 0.4) { const w = Math.min(zb - za, 2 + rand() * 2); bag.add(ROCKM, box(XF - ROCK * (0.3 + rand() * 0.4), top, za, XF - 1 - rand() * 6, top + 1 + rand() * 2, za + w)); }
  }
  // apron along the foot, its edge worn; the stair; the gallery of tier 1
  bag.add('flagstone', box(APRON[0], -0.4, APRON[1], APRON[2], FLOOR[0], APRON[3]));
  col.floor([APRON[0], APRON[1], APRON[2], APRON[3]], FLOOR[0]);
  const { x0: sx0, x1: sx1, z0: sz0, z1: sz1 } = STAIR;
  {
    const n = Math.round((FLOOR[1] - FLOOR[0]) / 0.17), L = (sz1 - sz0) / n;
    for (let k = 0; k < n; k++) bag.add(ROCKM, box(sx0, -0.4, sz0 + k * L, sx1, FLOOR[0] + (FLOOR[1] - FLOOR[0]) * (k + 1) / n, sz0 + (k + 1) * L + 0.02));
    col.ramp([sx0, sz0, sx1, sz1], FLOOR[0], FLOOR[1], 's');
    // the outer rail of the stair
    for (let k = 0; k <= 8; k++) { const z = sz0 + k * (sz1 - sz0) / 8, y = FLOOR[0] + (FLOOR[1] - FLOOR[0]) * k / 8; bag.add('timber_red', rod([sx1 - 0.08, y, z], [sx1 - 0.08, y + 1.0, z], 0.05, 6)); }
    bag.add('timber_red', rod([sx1 - 0.08, FLOOR[0] + 1.0, sz0], [sx1 - 0.08, FLOOR[1] + 1.0, sz1], 0.045, 6));
  }
  gallery(ctx);
  // the caves
  for (const c of CAVES) {
    const y = FLOOR[c.tier];
    if (c.kind === 'hall') { hallCave(ctx, { xf: XF, zc: c.z, y, seed: c.seed ?? 3 }); porch(ctx, c, y, 3.0, 3.6); }
    else if (c.kind === 'pillar') { pillarCave(ctx, { xf: XF, zc: c.z, y }); porch(ctx, c, y, 3.0, 3.6); }
    else if (c.kind === 'cell') { cellCave(ctx, { xf: XF, zc: c.z, y }); bag.add('lacquer_red', box(XF - 0.02, y, c.z - 1.15, XF + 0.1, y + 2.45, c.z - 1.0)); bag.add('lacquer_red', box(XF - 0.02, y, c.z + 1.0, XF + 0.1, y + 2.45, c.z + 1.15)); bag.add('lacquer_red', box(XF - 0.02, y + 2.3, c.z - 1.15, XF + 0.1, y + 2.45, c.z + 1.15)); }
    else if (c.kind === 'great') greatCave(ctx, c);
    else recess(ctx, c);
  }
  nineStorey(ctx);
  // the face's weathering: pale salt streaks under the cave mouths (small pieces on the face), dark soot over the cell's door
  const r2 = rng(19);
  for (let k = 0; k < 90; k++) {
    const z = -ZEND + 4 + r2() * (2 * ZEND - 8);
    if (Math.abs(z) < 16) continue;
    const y = 2 + r2() * 24, hh = 0.8 + r2() * 3;
    if (CAVES.some((c) => Math.abs(c.z - z) < c.w / 2 + 1.2 && Math.abs(FLOOR[c.tier] + 1.4 - y) < 3.5)) continue;
    bag.add('sandstone_white', box(XF - 0.02, y, z, XF + 0.012, y + hh, z + 0.12 + r2() * 0.3));
  }
}

/** The timber gallery of tier 1 (zhandao): a deck on beams let into the rock, posts and a rail; walkable. */
function gallery(ctx) {
  const { bag, col } = ctx, y = FLOOR[1], { x0, x1, z0, z1 } = GALLERY;
  bag.add('planks_grey', box(x0, y - 0.14, z0, x1, y, z1));
  col.floor([x0, z0, x1, z1], y);
  for (let z = z0 + 2; z < z1; z += 4) {
    bag.add('timber', box(x0, y - 0.34, z - 0.1, x1 + 0.1, y - 0.14, z + 0.1));
    bag.add('timber', rod([x0, y - 2.2, z], [x1 - 0.1, y - 0.3, z], 0.08, 6));
    bag.add('timber_red', rod([x1 - 0.1, y, z], [x1 - 0.1, y + 1.05, z], 0.06, 6));
  }
  bag.add('timber_red', box(x1 - 0.14, y + 1.0, z0, x1 - 0.06, y + 1.1, z1));
  bag.add('timber_red', box(x1 - 0.14, y + 0.5, z0, x1 - 0.1, y + 0.56, z1));
  col.segment([x1 - 0.1, z0], [x1 - 0.1, z1], 0.12, y, y + 1.1);
}
