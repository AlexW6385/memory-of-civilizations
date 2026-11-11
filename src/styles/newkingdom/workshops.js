// The workshops of the workshop street (docs/settlements/thebes.md §6.2): houses that were places of production — a yard open to the
// street under a shade of mats, the trade's things in it, a store behind with the family's rooms over it: the potter's kiln and
// wheel, the weaver's looms, the carpenter's bench and half-made chair, the mason's statue blank, the baker's ovens and vats,
// the smith's furnace and bellows, the tanner's frames.
import { box, lathe, addCloth, clothBox } from '../../core/geom.js';
import { rng } from './kit.js';
import { frame, roof, door, WALLS, JAR } from './houses.js';

const POT = (r, k = 1) => [[0.001, 0], [r * 0.45, 0.02], [r, r * 1.0 * k], [r * 0.9, r * 1.8 * k], [r * 0.5, r * 2.3 * k], [r * 0.56, r * 2.45 * k], [0.001, r * 2.45 * k]];
function shade(F, u, v, w, d, h = 2.3) {
  for (const [a, b] of [[u, v], [u + w, v], [u, v + d], [u + w, v + d]]) F.b('timber', a - 0.05, 0, b - 0.05, a + 0.05, h, b + 0.05, false);
  F.b('reed_mat', u - 0.2, h, v - 0.2, u + w + 0.2, h + 0.07, v + d + 0.2, false);
  F.bag.add('timber', box(F.X(u - 0.05), h - 0.14, Math.min(F.Z(v), F.Z(v + d)), F.X(u + w + 0.05), h, Math.max(F.Z(v), F.Z(v + d))));
}
const PROPS = {
  potter(F, rand, W) {
    const ku = W - 2.4, kv = 3.6;
    F.lathe('mudbrick', [[1.2, 0], [1.26, 0.3], [1.12, 1.8], [0.72, 2.4], [0.38, 2.7], [0.001, 2.7]], ku, 0, kv, 16); F.col.circle(F.X(ku), F.Z(kv), 1.22, 0, 2.7);
    F.lathe('opening', [[0.001, 0], [0.3, 0], [0.3, 0.02], [0.001, 0.02]], ku, 2.69, kv, 8);
    F.b('opening', ku - 0.45, 0.05, kv - 1.27, ku + 0.45, 0.9, kv - 1.2, false); F.lathe('pottery_dark', JAR(0.35), ku + 1.6, 0, kv + 0.4, 9);        // the firing mouth, soot, the fuel's jar
    F.b('mud_plaster', 1.0, 0, 2.0, 1.7, 0.42, 2.7); F.lathe('timber', [[0.35, 0], [0.35, 0.05], [0.001, 0.05]], 1.35, 0.44, 2.35, 10);          // the wheel on its stool
    F.lathe('mud_plaster', [[1.0, 0], [0.8, 0.35], [0.4, 0.55], [0.001, 0.6]], 3.0, 0, 1.4, 10);                                                // the clay heap
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const u = 2.0 + i * 0.8 + (r % 2) * 0.35, v = 5.2 + r * 0.9; if (u < W - 3.6) F.lathe('terracotta', POT(0.17 + rand() * 0.07, 0.8 + rand() * 0.5), u, 0, v, 8); }
    F.b('timber', 0.8, 0.9, 4.8, 1.0, 1.0, 7.2, false); F.b('timber', 0.5, 0, 4.9, 0.6, 1.0, 5.0, false); F.b('timber', 0.5, 0, 7.0, 0.6, 1.0, 7.1, false);
    for (let i = 0; i < 4; i++) F.lathe('terracotta', POT(0.1), 0.85, 1.0, 5.1 + i * 0.6, 7);
  },
  weaver(F, rand, W) {
    for (const u of [1.6, 3.8]) F.b('timber', u, 0, 2.3, u + 0.12, 1.9, 2.42, false);
    F.b('timber', 1.6, 1.8, 2.28, 3.92, 1.9, 2.44, false); F.b('timber', 1.6, 0.15, 2.28, 3.92, 0.25, 2.44, false);
    F.b('cloth_white', 1.75, 0.25, 2.33, 3.8, 1.8, 2.37, false); F.b('cloth_indigo', 1.75, 0.25, 2.3, 3.8, 0.7, 2.4, false);                    // the upright loom: the warp, the woven band at its foot
    for (const [u, v] of [[1.3, 5.0], [4.5, 5.0], [1.3, 5.7], [4.5, 5.7]]) F.b('timber', u, 0, v, u + 0.1, 0.18, v + 0.1, false);                  // the ground loom's pegs
    F.b('timber', 1.3, 0.15, 5.0, 4.7, 0.23, 5.1, false); F.b('timber', 1.3, 0.15, 5.7, 4.7, 0.23, 5.8, false); F.b('cloth_white', 1.4, 0.2, 5.1, 4.6, 0.22, 5.7, false);
    F.lathe('wicker', [[0.3, 0], [0.38, 0.3], [0.34, 0.34], [0.001, 0.05]], W - 2, 0, 3.0, 10); F.lathe('cloth_white', [[0.001, 0], [0.3, 0.02], [0.25, 0.25], [0.001, 0.3]], W - 2, 0.32, 3.0, 8);
    for (let i = 0; i < 4; i++) F.lathe('wicker', [[0.2, 0], [0.26, 0.2], [0.001, 0.2]], W - 3 + i * 0.5, 0, 6.2 + (i % 2) * 0.5, 8);
    addCloth(F.bag, 'cloth_white', clothBox(F.X(W - 2.6), 1.0, Math.min(F.Z(1.1), F.Z(1.12)), F.X(W - 0.9), 2.2, Math.max(F.Z(1.1), F.Z(1.12)), 0.25), 2.2);   // linen on the line
  },
  carpenter(F, rand, W) {
    F.b('timber', 1.0, 0.9, 2.0, 3.6, 1.0, 2.8); for (const [u, v] of [[1.1, 2.1], [3.4, 2.1], [1.1, 2.6], [3.4, 2.6]]) F.b('timber', u, 0, v, u + 0.12, 0.9, v + 0.12, false);
    F.b('bronze', 1.5, 1.0, 2.2, 1.85, 1.04, 2.28, false); F.b('timber', 2.2, 1.0, 2.2, 2.9, 1.06, 2.4, false);                                  // the adze and a plank on the bench
    for (const [u, v] of [[W - 2.4, 5.0], [W - 1.7, 5.0], [W - 2.4, 5.7], [W - 1.7, 5.7]]) F.b('timber', u, 0, v, u + 0.07, 0.45, v + 0.07, false);   // a chair's four legs
    F.b('timber', W - 2.45, 0.45, 4.95, W - 1.6, 0.52, 5.8, false); F.b('timber', W - 2.45, 0.52, 5.7, W - 1.6, 1.05, 5.8, false);
    for (let i = 0; i < 5; i++) F.b('timber', 1.2 + i * 0.07, i * 0.07, 6.0, 1.2 + i * 0.07 + 2.6, i * 0.07 + 0.06, 6.9, false);              // planks stacked
    for (let i = 0; i < 3; i++) F.b('palm_trunk', W - 4 + i * 0.35, 0, 1.4, W - 3.7 + i * 0.35, 0.3, 4.0, false);
    F.b('cedar', 4.2, 0, 6.3, 5.3, 0.6, 7.0); F.b('bronze', 4.2, 0.6, 6.35, 4.35, 0.68, 6.45, false);                                              // a chest
  },
  mason(F, rand, W) {
    F.b('timber', 1.2, 0, 2.2, 4.4, 0.18, 3.2); F.b('limestone_core', 1.4, 0.18, 2.35, 4.2, 0.78, 3.05);
    F.bag.add('limestone_carved', lathe([[0.001, 0], [0.26, 0.02], [0.25, 0.2], [0.001, 0.22]], 8, null, F.X(4.4), 0.78, F.Z(2.7)));                // the statue's blank with the head just found in it
    F.lathe('limestone_carved', [[0.001, 0], [0.22, 0], [0.25, 0.3], [0.2, 0.46], [0.001, 0.5]], 4.0, 0.78, 2.7, 10);
    for (const [u, v, h] of [[W - 2.6, 3.0, 0.9], [W - 1.4, 3.4, 0.9], [W - 2.4, 4.4, 0.7], [1.2, 5.4, 0.9]]) F.b('limestone_core', u, 0, v, u + 1.0, h, v + 0.8);
    F.lathe('rubble', [[1.0, 0], [0.8, 0.2], [0.001, 0.3]], 3.2, 0, 6.2, 8); F.b('bronze', 2.2, 0.18, 3.4, 2.3, 0.22, 3.55, false);
    F.b('limestone_core', W - 2.8, 0, 6.0, W - 1.6, 0.4, 6.9);
  },
  baker(F, rand, W) {
    for (const u of [1.3, 3.3]) { F.lathe('mudbrick', [[0.75, 0], [0.78, 0.4], [0.6, 0.9], [0.3, 1.2], [0.001, 1.3]], u, 0, 2.5, 12); F.col.circle(F.X(u), F.Z(2.5), 0.78, 0, 1.3); F.b('opening', u - 0.2, 0.2, 1.75, u + 0.2, 0.6, 1.8, false); }
    for (const u of [W - 2.2, W - 1.1]) F.lathe('pottery_dark', [[0.3, 0], [0.45, 0.3], [0.44, 0.6], [0.001, 0.62]], u, 0, 3.0, 12);
    F.b('timber', 1.0, 0.7, 5.0, 3.8, 0.78, 5.7); for (const [u, v] of [[1.1, 5.1], [3.6, 5.1], [1.1, 5.55], [3.6, 5.55]]) F.b('timber', u, 0, v, u + 0.08, 0.7, v + 0.08, false);
    for (let i = 0; i < 8; i++) F.lathe('limewash_yellow', [[0.001, 0], [0.17, 0.01], [0.15, 0.07], [0.001, 0.1]], 1.2 + i * 0.33, 0.78, 5.35, 8);
    for (let i = 0; i < 3; i++) F.lathe('terracotta', JAR(0.24), W - 1.2, 0, 5.2 + i * 0.7, 9);
  },
  smith(F, rand, W) {
    F.b('mudbrick', 1.2, 0, 2.2, 2.6, 0.9, 3.3); F.b('mudbrick', 1.7, 0.9, 2.5, 2.1, 2.2, 2.9); F.b('opening', 1.4, 0.5, 2.15, 2.4, 0.8, 2.22, false);   // the furnace and its chimney
    F.b('hide_tan', 0.2, 0.2, 2.5, 0.9, 0.55, 3.1); F.lathe('hide_tan', [[0.25, 0], [0.001, 0.4]], 1.0, 0.3, 2.8, 8);                              // the bellows
    F.b('basalt', 3.5, 0, 3.2, 4.0, 0.42, 3.6); F.b('bronze', 3.6, 0.42, 3.3, 3.9, 0.47, 3.5, false);
    for (let i = 0; i < 5; i++) F.b('bronze', 3.3 + i * 0.22, 0, 4.7, 3.45 + i * 0.22, 0.04, 5.2, false);
    F.lathe('pottery_dark', [[1.0, 0], [0.7, 0.3], [0.001, 0.4]], W - 2, 0, 3.2, 9); F.b('timber', 0.8, 0, 5.8, 1.4, 0.5, 6.4);
  },
  leather(F, rand, W) {
    for (let i = 0; i < 3; i++) { const u = 1.2 + i * 1.7; F.b('timber', u, 0, 2.2, u + 0.08, 1.9, 2.28, false); F.b('timber', u + 1.1, 0, 2.2, u + 1.18, 1.9, 2.28, false); F.b('timber', u, 1.85, 2.2, u + 1.18, 1.92, 2.28, false); F.b('hide_tan', u + 0.1, 0.5, 2.22, u + 1.08, 1.85, 2.26, false); }
    for (let i = 0; i < 2; i++) F.lathe('pottery_dark', [[0.5, 0], [0.55, 0.4], [0.5, 0.6], [0.001, 0.6]], W - 2 + i * 0.4, 0, 5 + i * 1.0, 10);
    for (let i = 0; i < 5; i++) F.b('hide_brown', 1.2 + i * 0.4, 0, 5.5, 1.5 + i * 0.4, 0.04, 5.9, false);
    F.b('timber', 1.0, 0, 6.6, 3.0, 0.5, 7.2);
  },
};
/** nk_workshop: { rect, front, seed, trade } */
export function workshop(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.4, H = 3.2, wm = WALLS[Math.floor(rand() * WALLS.length)];
  const yardV = 7.6;
  // the yard: open to the street through a wide gate between two stout posts; low walls at the sides, the street front a low wall with the gap
  F.b(wm, 0, 0, 0, W / 2 - 1.2, 1.1, th); F.b(wm, W / 2 + 1.2, 0, 0, W, 1.1, th); F.b(wm, 0, 0, th, th, 2.4, yardV); F.b(wm, W - th, 0, th, W, 2.4, yardV);
  for (const s of [-1, 1]) F.b('palm_trunk', W / 2 + s * 1.3 - 0.15, 0, -0.08, W / 2 + s * 1.3 + 0.15, 2.6, 0.2, false);
  F.b('mud_plaster', th, -0.02, th, W - th, 0.02, yardV, false);
  F.b('banco_rough', 0, 0, -0.03, W, 0.3, 0.0, false);
  shade(F, 0.7, 1.2, Math.min(W - 1.4, 5.2), 2.6 + 0.0, 2.4);
  // the rear: the store and the family's rooms, a door from the yard, the roof terrace with its stair
  F.b(wm, 0, 0, yardV, th, H, D); F.b(wm, W - th, 0, yardV, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  door(F, wm, W * 0.5, 1.0, 2.0, yardV, yardV + 0.4, true, H);
  F.b('mud_plaster', th, -0.02, yardV + 0.4, W - th, 0.03, D - th, false);
  for (let i = 0; i < 3; i++) F.lathe('terracotta', JAR(0.3), th + 0.5 + i * 0.8, 0, D - th - 0.5, 9);
  F.b('timber', W - 2.4, 0, D - th - 1.2, W - th - 0.1, 0.5, D - th - 0.2); F.b('reed_mat', W - 2.35, 0.5, D - th - 1.15, W - th - 0.15, 0.52, D - th - 0.25, false);
  const hole = [W - 1.5, yardV + 0.5, W - th, yardV + 3.6], n = 17, rise = (H + 0.28) / n, run = (hole[3] - hole[1]) / n;
  for (let i = 0; i < n; i++) F.b('mud_plaster', hole[0], 0, hole[1] + i * run, hole[2], rise * (i + 1), hole[3], false);
  col.ramp(F.R(hole[0], hole[1], hole[2], hole[3]), 0, H + 0.28, F.rise);
  roof(F, rand, H, [hole[0], hole[1], hole[2], hole[3]], true, [0, yardV, W, D]);
  (PROPS[el.trade] ?? PROPS.potter)(F, rand, W);
}
