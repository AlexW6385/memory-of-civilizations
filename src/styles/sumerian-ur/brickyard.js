// The brickyard of Ur (docs/settlements/ur.md §5.9): where the bricks of the temple and the town were made at the edge
// of the built ground — the clay beds where the mud was trodden with chopped straw and water, a shaduf lifting water
// from a pool, the drying fields (bricks moulded flat in rows, then stood on edge, then built into open hacks), two
// updraft kilns charged with the dried bricks and fed from the stoke-holes with reeds and dung, stacks of fired brick,
// the pot of bitumen over its fire, wooden moulds. Everything stands on the flat ground of the rect { rect, seed }.

import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { rng } from './util.js';

const BRICK = { w: 0.37, h: 0.1 };           // the Ur-Nammu brick of the city wall: 0.37 m square, 0.10 m thick [stated: Woolley 1974]

export function brickyard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5);
  const at = (u, v) => [x0 + u, z0 + v];
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const [a, b] = at(u0, v0), [c, d] = at(u1, v1); bag.add(mat, box(a, y0, b, c, y1, d)); };
  const C = (u0, v0, u1, v1, h) => { const [a, b] = at(u0, v0), [c, d] = at(u1, v1); col.rect([a, b, c, d], 0, h); };
  const L = (mat, prof, u, v, y, seg = 14) => { const [x, z] = at(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };

  // ---- the clay beds: a kerb of mud, the clay trodden wet inside it (silt), a skin of water on part of it, the heap of chopped straw
  const bed = (u, v, w, d) => {
    B('mudbrick', u, v, u + w, v + 0.4, 0, 0.45); B('mudbrick', u, v + d - 0.4, u + w, v + d, 0, 0.45); B('mudbrick', u, v + 0.4, u + 0.4, v + d - 0.4, 0, 0.45); B('mudbrick', u + w - 0.4, v + 0.4, u + w, v + d - 0.4, 0, 0.45);
    B('silt', u + 0.4, v + 0.4, u + w - 0.4, v + d - 0.4, 0, 0.3); B('water', u + 1.2, v + 1.0, u + w * 0.6, v + d * 0.55, 0.3, 0.305);
    C(u, v, u + w, v + d, 0.45);
  };
  bed(4, 4, 13, 10); bed(21, 4, 11, 10);
  for (const [u, v, s] of [[37, 9, 1.0], [40, 13, 0.7]]) { L('thatch', [[0.001, 0], [1.7 * s, 0], [1.35 * s, 0.5], [0.8 * s, 1.0], [0.001, 1.5 * s]], u, v, 0); const [cx, cz] = at(u, v); col.circle(cx, cz, 1.6 * s, 0, 1.2); }
  // footprints of the treaders' feet and the straw trodden in: a few lumps of clay at the beds' edge
  for (let k = 0; k < 5; k++) L('silt', [[0.001, 0], [0.3, 0], [0.22, 0.2], [0.001, 0.26]], 18 + rand() * 2, 5 + k * 1.8, 0, 7);

  // ---- the shaduf by its pool: two posts of mud brick carrying a cross-beam, the pole pivoted on it, a bitumen-coated basket on the long end, the clay counterweight on the short
  B('mudbrick', 0, 18, 8, 19, 0, 0.5); B('mudbrick', 0, 27, 8, 28, 0, 0.5); B('mudbrick', 0, 19, 1, 27, 0, 0.5); B('mudbrick', 7, 19, 8, 27, 0, 0.5);
  B('water', 1, 19, 7, 27, 0, 0.35); C(0, 18, 8, 28, 0.5);
  { const [sx, sz] = at(9.5, 22.5); for (const dz of [-0.9, 0.9]) bag.add('mudbrick', box(sx - 0.3, 0, sz + dz - 0.3, sx + 0.3, 2.3, sz + dz + 0.3)); col.rect([sx - 0.3, sz - 1.2, sx + 0.3, sz + 1.2], 0, 2.3);
    beam('palm_trunk', [sx, 2.38, sz - 0.95], [sx, 2.38, sz + 0.95], 0.07, 0.14);
    beam('palm_trunk', [sx - 4.2, 3.0, sz], [sx + 1.4, 2.33, sz], 0.07, 0.12);                       // the pole across the beam, its long end (west, over the pool) lifted
    bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.26, 0.3], [0.23, 0.31], [0.18, 0.05], [0.001, 0.05]], 12, null, sx - 4.2, 1.55, sz)); beam('rope_fibre', [sx - 4.2, 1.85, sz], [sx - 4.2, 3.0, sz], 0.012, 0.024);
    bag.add('mudbrick', lathe([[0.001, 0], [0.34, 0.02], [0.4, 0.3], [0.2, 0.52], [0.001, 0.54]], 10, null, sx + 1.4, 1.78, sz)); beam('rope_fibre', [sx + 1.4, 2.29, sz], [sx + 1.4, 2.33, sz], 0.012, 0.024); }

  // ---- the drying fields: bricks moulded flat in rows on the swept ground (wet, dark), the older rows stood on edge, then the open hacks
  const rows = (u, v, len, n, edge, mat) => {
    for (let k = 0; k < n; k++) { const l = len * (0.78 + 0.22 * rand()), vv = v + k * (edge ? 0.5 : 0.45); if (edge) B(mat, u, vv, u + l, vv + BRICK.h, 0, BRICK.w); else B(mat, u, vv, u + l, vv + BRICK.w, 0, BRICK.h); }
  };
  rows(8, 30, 11, 12, false, 'mudbrick'); rows(22, 30, 11, 12, false, 'mud_plaster'); rows(8, 37, 11, 10, true, 'mud_plaster'); rows(22, 37, 11, 10, true, 'brick_buff');
  // hacks: hollow stacks of dried brick laid in crossed courses with gaps for the air, to be carried to the kiln
  for (const [u, v] of [[8, 44], [14, 44], [20, 44], [26, 44], [8, 50], [14, 50]]) {
    for (let c = 0; c < 6; c++) {
      const along = c % 2 === 0;
      for (let k = 0; k < 4; k++) { if (along) B('brick_buff', u + 0.1, v + k * 0.42, u + 2.9, v + k * 0.42 + BRICK.w, c * 0.13, c * 0.13 + BRICK.h); else B('brick_buff', u + k * 0.8, v + 0.1, u + k * 0.8 + BRICK.w, v + 1.6, c * 0.13, c * 0.13 + BRICK.h); }
    }
    C(u, v, u + 3, v + 1.8, 0.8);
  }
  // wooden moulds lying about the field: a frame of four boards with a handle, one with its brick still in it
  for (const [u, v] of [[10, 28], [24, 28.2], [19.4, 35.3], [31, 28.1]]) {
    B('timber', u, v, u + 0.45, v + 0.04, 0, 0.1); B('timber', u, v + 0.41, u + 0.45, v + 0.45, 0, 0.1); B('timber', u, v + 0.04, u + 0.04, v + 0.41, 0, 0.1); B('timber', u + 0.41, v + 0.04, u + 0.45, v + 0.41, 0, 0.1);
    B('timber', u + 0.45, v + 0.19, u + 0.7, v + 0.25, 0.03, 0.07);
  }

  // ---- the kilns: an updraft kiln of clay, the stoke-hole's arch at its foot, the stacked bricks showing in open courses at its top under a skin of clay and potsherds, fuel before it
  const kiln = (u, v, face) => {
    const [kx, kz] = at(u, v), s = face;
    bag.add('mud_plaster', lathe([[0.001, 0], [2.6, 0], [2.5, 0.8], [2.3, 2.0], [2.0, 3.0], [1.9, 3.5], [1.6, 3.55], [0.001, 3.55]], 20, null, kx, 0, kz));
    // the stacked bricks in the setting chamber, seen through the top's open courses
    for (let c = 0; c < 3; c++) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + c * 0.3, rr = 1.3; bag.add('brick_buff', box(kx + Math.cos(a) * rr - 0.45, 3.5 + c * 0.14, kz + Math.sin(a) * rr - 0.18, kx + Math.cos(a) * rr + 0.45, 3.5 + c * 0.14 + 0.1, kz + Math.sin(a) * rr + 0.18)); }
    col.circle(kx, kz, 2.55, 0, 3.6);
    // the stoke-hole: an arched mouth of baked brick, dark inside, ash before it
    bag.add('brick_baked', box(kx - 0.95, 0, kz + s * 2.0, kx + 0.95, 1.5, kz + s * 3.0 - (s > 0 ? 0 : 0)));
    bag.add('opening', box(kx - 0.55, 0.1, kz + s * 2.98, kx + 0.55, 1.1, kz + s * 3.0 + (s > 0 ? 0.01 : -0.01)));
    bag.add('pottery_dark', box(kx - 1.2, 0, kz + s * 3.0, kx + 1.2, 0.05, kz + s * 3.9));
    col.rect([kx - 0.95, Math.min(kz + s * 2.0, kz + s * 3.0), kx + 0.95, Math.max(kz + s * 2.0, kz + s * 3.0)], 0, 1.5);
    // the fuel: bundles of reeds and a stack of dung cakes beside the mouth
    for (let k = 0; k < 5; k++) beam('reed_mat', [kx + 1.8, 0.18 + (k > 2 ? 0.3 : 0), kz + s * 3.3 + k * 0.0 + (k % 3) * 0.32 * s - 0.0], [kx + 4.2, 0.18 + (k > 2 ? 0.3 : 0), kz + s * 3.3 + (k % 3) * 0.32 * s], 0.14, 0.28);
    for (let c = 0; c < 4; c++) for (let k = 0; k < 4 - (c > 2 ? 1 : 0); k++) bag.add('hide_brown', lathe([[0.001, 0], [0.16, 0], [0.18, 0.04], [0.001, 0.05]], 8, null, kx - 2.0 + k * 0.38 - c * 0.04, c * 0.05, kz + s * 3.5));
  };
  kiln(54, 14, 1); kiln(63.5, 14, 1);

  // ---- the stacks of fired brick, in tight courses with alternate courses crossed, and a few tumbled
  for (const [u, v, n] of [[50, 36, 8], [55, 36, 10], [60, 36, 6], [50, 41, 9], [56, 41, 7]]) {
    for (let c = 0; c < n; c++) { const along = c % 2 === 0; for (let k = 0; k < (along ? 5 : 4); k++) { if (along) B('brick_baked', u + 0.05, v + k * 0.38, u + 2.0, v + k * 0.38 + BRICK.w, c * 0.1, (c + 1) * 0.1); else B('brick_baked', u + k * 0.5, v + 0.02, u + k * 0.5 + BRICK.w, v + 1.9, c * 0.1, (c + 1) * 0.1); } }
    C(u, v, u + 2.05, v + 1.95, n * 0.1);
  }
  // ---- the bitumen: lumps heaped on a mat, the pot over a small fire of three stones and reeds, the long ladle
  L('bitumen', [[0.001, 0], [0.7, 0], [0.55, 0.3], [0.3, 0.5], [0.001, 0.55]], 48, 49, 0, 9);
  { const [fx, fz] = at(52.5, 50);
    for (let k = 0; k < 3; k++) { const a = k * 2.094; bag.add('rubble', box(fx + Math.cos(a) * 0.42 - 0.13, 0, fz + Math.sin(a) * 0.42 - 0.13, fx + Math.cos(a) * 0.42 + 0.13, 0.3, fz + Math.sin(a) * 0.42 + 0.13)); }
    bag.add('flame', box(fx - 0.14, 0.04, fz - 0.14, fx + 0.14, 0.34, fz + 0.14));
    bag.add('bronze', lathe([[0.001, 0.3], [0.2, 0.3], [0.34, 0.5], [0.36, 0.72], [0.3, 0.74], [0.001, 0.62]], 14, null, fx, 0.04, fz)); bag.add('bitumen', lathe([[0.001, 0.7], [0.3, 0.7], [0.001, 0.71]], 12, null, fx, 0.04, fz));
    beam('palm_trunk', [fx + 0.5, 0.9, fz + 0.2], [fx + 1.6, 0.2, fz + 1.0], 0.025, 0.05); col.circle(fx, fz, 0.6, 0, 0.8); }
  // ---- a shade of reed mats on four palm posts for the brickmakers' water jars and their noon rest
  B('reed_mat', 18, 56, 26, 61, 2.35, 2.45);
  for (const [u, v] of [[18, 56], [26, 56], [18, 61], [26, 61]]) { const [px, pz] = at(u, v); bag.add('palm_trunk', box(px - 0.08, 0, pz - 0.08, px + 0.08, 2.4, pz + 0.08)); }
  B('mudbrick', 19.5, 60, 24.5, 60.6, 0, 0.45); C(19.5, 60, 24.5, 60.6, 0.45);
  for (const [u, v] of [[19.2, 56.8], [20, 57], [25, 56.8]]) L('terracotta', [[0.001, 0], [0.1, 0], [0.13, 0.03], [0.24, 0.25], [0.25, 0.42], [0.18, 0.6], [0.09, 0.68], [0.11, 0.74], [0.001, 0.72]], u, v, 0, 12);
}
