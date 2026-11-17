// The works yard on the terrace (docs/settlements/persepolis.md §20): building went on under Xerxes, and the stone for the halls still being
// raised was dressed on the terrace itself — stacks of squared blocks, column drums standing on end, a sledge with its rollers under a
// block, a shear-legs hoist lifting one by rope — beside the stone tank and trough that served the works and the court.
import { box, lathe, rod } from '../../core/geom.js';

const S = 'limestone_persian';

/** terrace_works: { at: [x, z] (its south-west corner, +x east, +z south), y } — about 40 × 30 m. */
export function terraceWorks(el, { bag, col }) {
  const [ox, oz] = el.at, y = el.y ?? 0;
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(ox + x0, y + y0, oz + z0, ox + x1, y + y1, oz + z1));
  const solid = (x0, z0, x1, z1, hh) => col.rect([ox + x0, oz + z0, ox + x1, oz + z1], y, y + hh);
  const at = (x, z) => [ox + x, oz + z];
  // the stacks of squared blocks, a hand's width between them (the joints read from a metre away)
  const stack = (x0, z0, rows) => {
    for (let r = 0; r < rows; r++) {
      const n = 3 - r, off = r * 0.72;
      for (let i = 0; i < n; i++) B(S, x0 + off + i * 1.45, r * 0.55, z0, x0 + off + i * 1.45 + 1.4, r * 0.55 + 0.55, z0 + 0.7);
    }
    solid(x0, z0, x0 + 4.3, z0 + 0.7, rows * 0.55);
  };
  stack(2, 2, 2); stack(2, 3.4, 1); stack(2, 4.8, 3);
  for (const [x0, z0, x1, z1, hh] of [[12, 2, 13.4, 2.7, 0.5], [14.4, 3.4, 15.8, 4.1, 0.45], [17.6, 2.4, 18.8, 3.2, 0.6], [12.6, 4.6, 14.2, 5.4, 0.55]]) { B(S, x0, 0, z0, x1, hh, z1); solid(x0, z0, x1, z1, hh); }
  // column drums standing on end, rough from the quarry's tool (a single, a pair stacked)
  for (const [x, z, n] of [[24, 4, 1], [27.2, 4, 2], [24, 7.2, 1]]) {
    for (let k = 0; k < n; k++) { const [px, pz] = at(x, z); bag.add(S, lathe([[0.001, 0], [0.8, 0], [0.8, 0.72], [0.001, 0.72]], 20, null, px, y + k * 0.72, pz)); }
    const [px, pz] = at(x, z); col.circle(px, pz, 0.82, y, y + n * 0.72);
  }
  // a sledge with its rollers under a squared block, the block on its deck
  B('timber', 6, 0, 12, 11, 0.12, 12.15); B('timber', 6, 0, 13.35, 11, 0.12, 13.5);
  B('wood_dark', 6, 0.12, 12, 11, 0.2, 13.5); B(S, 6.4, 0.2, 12.15, 10.2, 0.9, 13.35);
  for (const x of [11.6, 12.5, 13.4]) { const [px, pz] = at(x, 11.85), [qx, qz] = at(x, 13.65); bag.add('timber', rod([px, y + 0.12, pz], [qx, y + 0.12, qz], 0.12, 8)); }
  solid(6, 12, 11, 13.5, 0.9);
  // the shear-legs hoist: three poles lashed at the apex, a rope and a block hanging from it above the block it will lift
  const ap = at(20.4, 14);
  for (const [x, z] of [[18.3, 12.8], [18.3, 15.2], [23, 14]]) { const [px, pz] = at(x, z); bag.add('timber', rod([px, y, pz], [ap[0], y + 6.2, ap[1]], 0.09, 7)); col.circle(px, pz, 0.14, y, y + 1.5); }
  bag.add('sacking', rod([ap[0], y + 2.0, ap[1]], [ap[0], y + 6.1, ap[1]], 0.025, 5));
  B(S, 19.95, 1.2, 13.6, 20.85, 2.0, 14.4);
  B(S, 19.9, 0, 13.55, 20.9, 0.5, 14.45); solid(19.9, 13.55, 20.9, 14.45, 0.5);
  // the stone tank (a cistern of the terrace, its steps and the trough beside it) and the jars of those who carry from it
  const tx0 = 6, tz0 = 20, tx1 = 12, tz1 = 23.2, wt = 0.35, wh = 1.0;
  B(S, tx0, 0, tz0, tx1, wh, tz0 + wt); B(S, tx0, 0, tz1 - wt, tx1, wh, tz1); B(S, tx0, 0, tz0 + wt, tx0 + wt, wh, tz1 - wt); B(S, tx1 - wt, 0, tz0 + wt, tx1, wh, tz1 - wt);
  B(S, tx0 - 0.05, wh, tz0 - 0.05, tx1 + 0.05, wh + 0.08, tz0 + wt + 0.05); B(S, tx0 - 0.05, wh, tz1 - wt - 0.05, tx1 + 0.05, wh + 0.08, tz1 + 0.05);
  B(S, tx0 - 0.05, wh, tz0 + wt + 0.05, tx0 + wt + 0.05, wh + 0.08, tz1 - wt - 0.05); B(S, tx1 - wt - 0.05, wh, tz0 + wt + 0.05, tx1 + 0.05, wh + 0.08, tz1 - wt - 0.05);
  B('water', tx0 + wt, 0.02, tz0 + wt, tx1 - wt, 0.8, tz1 - wt);
  for (let k = 0; k < 3; k++) B(S, tx1 + 0.05 + (2 - k) * 0.38 - 0.0, 0, tz0 + 0.9, tx1 + 0.05 + (3 - k) * 0.38, (k + 1) * 0.33, tz1 - 0.9);
  solid(tx0, tz0, tx1, tz1, wh); solid(tx1, tz0 + 0.9, tx1 + 1.2, tz1 - 0.9, 0.99);
  B(S, 14.5, 0, 20.4, 16.7, 0.5, 21.0); B(S, 14.5, 0, 22.4 - 0.0, 16.7, 0.5, 23.0); B(S, 14.5, 0, 21.0, 14.85, 0.5, 22.4); B(S, 16.35, 0, 21.0, 16.7, 0.5, 22.4); B('water', 14.85, 0.02, 21.0, 16.35, 0.4, 22.4);
  solid(14.5, 20.4, 16.7, 23.0, 0.5);
  for (const [x, z, r] of [[4.9, 21.0, 0.3], [4.8, 22.4, 0.26], [13.2, 24.2, 0.3], [5.6, 24.2, 0.28]]) { const [px, pz] = at(x, z); bag.add('terracotta', lathe([[0.001, 0], [r * 0.45, 0], [r * 0.9, r * 0.5], [r, r * 1.2], [r * 0.82, r * 2.1], [r * 0.5, r * 2.5], [r * 0.58, r * 2.7], [0.001, 2.65 * r]], 10, null, px, y, pz)); col.circle(px, pz, r, y, y + 0.8); }
}
