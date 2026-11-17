// The brickyard on the wadi floor beside the south gate (docs/settlements/shibam.md §12): earth from the wadi mixed with chopped straw and water, pressed into
// simple wooden moulds laid on the ground and dried in the sun, then piled on edge; bricks about 45 × 30 cm [stated: Global Dispatches; Architectural League].
import { box } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const BL = 0.45, BW = 0.3, BT = 0.1;

/** brick_rows: { rect: [x0, z0, x1, z1] (about 24 × 6 m), y (the ground), seed } — the mud pit, the heap of straw, the wet bricks in rows on the ground, the piled stacks, a mould. */
function brickRows(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, r = rng(el.seed ?? 3), D = z1 - z0;
  // the pit: a low rim of beaten earth round a shallow bed of wet mud, a hoe of palm-wood leaning on it
  const px = x0 + 0.4, pz = z0 + 0.8, pw = 2.6, pd = 2.0;
  for (const rc of [[px, pz, px + pw, pz + 0.3], [px, pz + pd - 0.3, px + pw, pz + pd], [px, pz + 0.3, px + 0.3, pz + pd - 0.3], [px + pw - 0.3, pz + 0.3, px + pw, pz + pd - 0.3]]) { bag.add('mud_plaster', box(rc[0], y - 0.05, rc[1], rc[2], y + 0.28, rc[3])); col.rect(rc, y - 0.05, y + 0.28); }
  bag.add('plaster_damp', box(px + 0.3, y - 0.05, pz + 0.3, px + pw - 0.3, y + 0.1, pz + pd - 0.3));
  bag.add('wood_dark', box(px + 0.5, y + 0.1, pz + 0.7, px + 1.5, y + 0.13, pz + 0.76));
  // the straw heap, chopped, beside it
  bag.add('thatch', box(x0 + 3.5, y - 0.05, z0 + 0.6, x0 + 5.3, y + 0.5, z0 + 1.9)); bag.add('thatch', box(x0 + 3.8, y + 0.5, z0 + 0.8, x0 + 5.0, y + 0.85, z0 + 1.7));
  col.rect([x0 + 3.5, z0 + 0.6, x0 + 5.3, z0 + 1.9], y - 0.05, y + 0.85);
  // the wooden mould (two cells) lying by the rows
  const mx = x0 + 5.9, mz = z0 + 3.3;
  for (const rc of [[mx, mz, mx + 0.98, mz + 0.04], [mx, mz + 0.64, mx + 0.98, mz + 0.68], [mx, mz + 0.04, mx + 0.04, mz + 0.64], [mx + 0.47, mz + 0.04, mx + 0.51, mz + 0.64], [mx + 0.94, mz + 0.04, mx + 0.98, mz + 0.64]]) bag.add('timber', box(rc[0], y, rc[1], rc[2], y + 0.1, rc[3]));
  // the wet bricks pressed out on the ground in ranks, a few turned on edge as they dry
  for (let row = 0; row < 3; row++) for (let c = 0; c < 14; c++) {
    const bx = x0 + 7.2 + c * (BL + 0.06), bz = z0 + 0.5 + row * (BW + 0.08) + (row === 2 ? 0.2 : 0), skip = row === 2 && c > 10 + Math.floor(r() * 3);
    if (skip) continue;
    const edge = row === 0 && c < 7;
    bag.add('mudbrick', edge ? box(bx, y, bz, bx + BL, y + BW, bz + BT) : box(bx, y, bz, bx + BL, y + BT, bz + BW));
  }
  // the dried bricks piled in open stacks, courses crossed, with gaps for the air
  for (let st = 0; st < 3; st++) {
    const sx = x0 + 14.8 + st * 2.9 + (st === 2 ? 0.2 : 0), sz = z0 + 0.7 + (st % 2) * 0.4, layers = 12 - 2 * st;
    for (let l = 0; l < layers; l++) {
      const hy = y + l * BT * 1.0;
      for (let k = 0; k < 4; k++) {
        if (l % 2 === 0) bag.add('mudbrick', box(sx, hy, sz + k * (BW + 0.05), sx + 2 * BL + 0.04, hy + BT, sz + k * (BW + 0.05) + BW));
        else bag.add('mudbrick', box(sx + k * (BW + 0.05) * 0.9, hy, sz, sx + k * (BW + 0.05) * 0.9 + BW, hy + BT, sz + 2 * BL + 0.04));
      }
    }
    col.rect([sx, sz, sx + 2 * BL + 0.04 + 0.3, sz + 4 * (BW + 0.05)], y, y + layers * BT);
  }
  void D;
}
export const YARD_ELEMENTS = { brick_rows: brickRows };
