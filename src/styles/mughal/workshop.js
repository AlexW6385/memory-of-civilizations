// The inlay workshop of the Taj Ganj (docs/settlements/mughal-agra.md §12): a pietra dura (parchinkari) workshop open to the
// bazaar street, where the craftsmen of the Taj's works worked and sold: a hall on a plinth with its front on the street (a
// beam on three columns), a lightwell in the roof, the craftsmen's stations on reed mats — the stone-cutter's bow-driven
// grinding wheel with its water pot, the inlayer's low bench with a marble panel part inlaid with flowers of carnelian,
// jade, lapis and yellow jasper, the tray of cut stones —, stacks of marble slabs, a finished panel on the back wall, the
// master's cushion and hookah. Built in the local frame of townhouse.js `frameOf` (front at z = 0 facing +z).

import { box, lathe, place, rod } from '../../core/geom.js';
import * as F from './furnish.js';
import { frameOf } from './townhouse.js';

const PI = Math.PI;
const STONES = ['inlay_carnelian', 'inlay_jade', 'inlay_lapis', 'inlay_yellow'];

/** A flower of inlaid stone on a panel (centre x, z at height y): a round heart and n petals, one stone each. */
function flower(B, x, y, z, k, n = 5, s = 0) {
  const hw = 0.035 * k;
  B.add(STONES[(s + 3) % 4], lathe([[0.001, 0], [hw, 0], [hw, 0.006], [0.001, 0.006]], 8, null, x, y, z));
  for (let i = 0; i < n; i++) {
    const a = i / n * PI * 2, g = box(-0.018 * k, 0, 0.03 * k, 0.018 * k, 0.006, 0.085 * k);
    B.add(STONES[(s + i) % 3], place(g, x, y, z, a));
  }
}
/** A panel of white marble lying flat or standing: with a border of inlay and flowers; built lying at (x, y, z), w × d. */
function panel(B, x, y, z, w, d, seed = 0) {
  B.add('marble_smooth', box(x - w / 2, y, z - d / 2, x + w / 2, y + 0.04, z + d / 2));
  const t = y + 0.04;
  B.add('inlay_lapis', box(x - w / 2 + 0.03, t, z - d / 2 + 0.03, x + w / 2 - 0.03, t + 0.004, z - d / 2 + 0.05)); B.add('inlay_lapis', box(x - w / 2 + 0.03, t, z + d / 2 - 0.05, x + w / 2 - 0.03, t + 0.004, z + d / 2 - 0.03));
  B.add('inlay_lapis', box(x - w / 2 + 0.03, t, z - d / 2 + 0.05, x - w / 2 + 0.05, t + 0.004, z + d / 2 - 0.05)); B.add('inlay_lapis', box(x + w / 2 - 0.05, t, z - d / 2 + 0.05, x + w / 2 - 0.03, t + 0.004, z + d / 2 - 0.05));
  const n = Math.max(1, Math.round(w / 0.22));
  for (let i = 0; i < n; i++) { const fx = x - w / 2 + (i + 0.5) * w / n; flower(B, fx, t, z, Math.min(w / n / 0.18, 1.2), 5, seed + i); }
  B.add('inlay_jade', box(x - w / 2 + 0.07, t, z - 0.006, x + w / 2 - 0.07, t + 0.004, z + 0.006));
}

export function inlayWorkshop(el, { bag, col }) {
  const f = frameOf(el.rect, el.front ?? 'e'), W = f.W, D = f.D, hw = W / 2;
  const B = { add: (m, g) => bag.add(m, place(g, f.ox, 0, f.oz, f.yaw)) };
  const C = { rect: (r, y0, y1) => col.rect(f.rect(r), y0, y1), floor: (r, y) => col.floor(f.rect(r), y), circle: (x, z, r, y0, y1) => { const [wx, wz] = f.pt(x, z); col.circle(wx, wz, r, y0, y1); } };
  const FY = 0.35, H = 4.6, T = 0.4;
  // the plinth, the walls on three sides, the roof with its lightwell, the beam and columns of the front
  B.add('sandstone_red', box(-hw, 0, -D, hw, FY, 0)); C.floor([-hw + T, -D + T, hw - T, -0.3], FY);
  B.add('stucco_warm', box(-hw, FY, -D, hw, H, -D + T)); B.add('stucco_warm', box(-hw, FY, -D + T, -hw + T, H, 0)); B.add('stucco_warm', box(hw - T, FY, -D + T, hw, H, 0));
  C.rect([-hw, -D, hw, -D + T], FY, H); C.rect([-hw, -D + T, -hw + T, 0], FY, H); C.rect([hw - T, -D + T, hw, 0], FY, H);
  const lw = [-1.5, -D / 2 - 1.5, 1.5, -D / 2 + 1.5];
  for (const r of [[-hw, -D, hw, lw[1]], [-hw, lw[3], hw, 0], [-hw, lw[1], lw[0], lw[3]], [lw[2], lw[1], hw, lw[3]]]) B.add('stucco_warm', box(r[0], H, r[1], r[2], H + 0.3, r[3]));
  for (const r of [[lw[0] - 0.25, lw[1] - 0.25, lw[2] + 0.25, lw[1]], [lw[0] - 0.25, lw[3], lw[2] + 0.25, lw[3] + 0.25], [lw[0] - 0.25, lw[1], lw[0], lw[3]], [lw[2], lw[1], lw[2] + 0.25, lw[3]]]) B.add('sandstone_red', box(r[0], H + 0.3, r[1], r[2], H + 0.65, r[3]));
  C.rect([-hw, -D, hw, 0], H, H + 0.3); C.floor([-hw, -D, hw, 0], H + 0.3);
  B.add('wood_dark', box(-hw + T, H - 0.7, -0.45, hw - T, H, -0.02));
  for (const x of [-3, 3]) { B.add('sandstone_red', lathe([[0.2, 0], [0.14, 0.15], [0.12, 0.5], [0.12, H - 1.4], [0.18, H - 1.15], [0.24, H - 1.0], [0.24, H - 0.72]], 8, null, x, FY, -0.22)); C.circle(x, -0.22, 0.24, FY, H); }
  for (let z = -1.5; z > -D + 0.5; z -= 1.6) if (z < lw[1] - 0.3 || z > lw[3] + 0.3) B.add('wood_dark', box(-hw + T, H - 0.2, z - 0.1, hw - T, H, z + 0.1));
  // the parapet at the front and a cornice
  B.add('stucco_warm', box(-hw, H + 0.3, -0.3, hw, H + 1.1, 0)); B.add('sandstone_red', box(-hw - 0.08, H + 1.1, -0.38, hw + 0.08, H + 1.2, 0.06));
  for (let x = -hw + 0.5; x < hw - 0.3; x += 0.9) B.add('sandstone_red', box(x - 0.24, H + 1.2, -0.3, x + 0.24, H + 1.65, -0.02));
  // the mats, the stations
  F.reedMat(B, -2.6, FY, -6.2, 5.4, 7.4); F.kilim(B, 3.0, FY + 0.01, -5.8, 3.0, 4.6, 0, ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white']);
  // 1. the stone-cutter's wheel: two posts, the axle with the grinding disc, a bow with its cord, a water pot and a dish of grit
  for (const [sx, sz] of [[-4.0, -4.6], [-1.6, -4.6]]) {
    B.add('wood_dark', box(sx - 0.38, FY + 0.01, sz - 0.04, sx - 0.3, FY + 0.34, sz + 0.04)); B.add('wood_dark', box(sx + 0.3, FY + 0.01, sz - 0.04, sx + 0.38, FY + 0.34, sz + 0.04));
    B.add('iron', rod([sx - 0.45, FY + 0.28, sz], [sx + 0.45, FY + 0.28, sz], 0.012, 6));
    B.add('granite_grey', lathe([[0.001, -0.015], [0.15, -0.015], [0.15, 0.015], [0.001, 0.015]], 16).rotateZ(PI / 2).translate(sx, FY + 0.28, sz));
    B.add('timber', rod([sx - 0.9, FY + 0.34, sz + 0.28], [sx + 0.7, FY + 0.3, sz + 0.34], 0.012, 6)); B.add('hide_tan', rod([sx - 0.9, FY + 0.34, sz + 0.28], [sx + 0.05, FY + 0.28, sz + 0.02], 0.004, 4));
    F.waterJar(B, sx + 0.7, FY + 0.01, sz - 0.5, 0.55);
  }
  // 2. the inlayers' benches: a low table with a panel being set, the tray of cut stones, a stylus and a little pot of adhesive
  for (const [bx, bz, s] of [[-3.8, -8.4, 1], [-1.2, -8.4, 5], [3.0, -9.2, 2]]) {
    B.add('wood_dark', box(bx - 0.5, FY + 0.12, bz - 0.35, bx + 0.5, FY + 0.17, bz + 0.35));
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add('wood_dark', box(bx + a * 0.45 - 0.03, FY, bz + b * 0.3 - 0.03, bx + a * 0.45 + 0.03, FY + 0.12, bz + b * 0.3 + 0.03));
    panel(B, bx, FY + 0.17, bz, 0.62, 0.46, s);
    B.add('bronze', lathe([[0.001, 0], [0.1, 0], [0.11, 0.015], [0.001, 0.015]], 12, null, bx + 0.7, FY + 0.01, bz - 0.1));
    for (let i = 0; i < 7; i++) B.add(STONES[i % 4], box(bx + 0.62 + (i % 3) * 0.04, FY + 0.026, bz - 0.17 + Math.floor(i / 3) * 0.05, bx + 0.66 + (i % 3) * 0.04, FY + 0.036, bz - 0.13 + Math.floor(i / 3) * 0.05));
    B.add('terracotta', lathe([[0.001, 0], [0.04, 0], [0.05, 0.04], [0.04, 0.06], [0.001, 0.05]], 8, null, bx + 0.72, FY + 0.01, bz + 0.2));
  }
  // 3. stacks of marble slabs against the back wall and in the corner, panels leaning against them
  for (const [sx, sz, n] of [[-5.0, -D + 1.2, 9], [-5.0, -D + 2.6, 6], [4.6, -D + 1.0, 7]]) for (let i = 0; i < n; i++) B.add('marble_smooth', box(sx - 0.55, FY + i * 0.05, sz - 0.4 + (i % 2) * 0.01, sx + 0.55, FY + i * 0.05 + 0.045, sz + 0.4));
  for (const [sx, s] of [[-2.2, 0], [0.3, 2]]) { const g = box(-0.45, 0, -0.025, 0.45, 1.1, 0.025); g.rotateX(-0.12); B.add('marble_smooth', place(g, sx, FY, -D + 0.55, 0)); const h = box(-0.4, 0.05, -0.02, 0.4, 0.07, 0.03); h.rotateX(-0.12); B.add('inlay_lapis', place(h, sx, FY + 0.6, -D + 0.55, 0)); flower(B, sx, FY + 0.55, -D + 0.52, 1.4, 5, s); }
  // the finished panel on the back wall: marble in a frame of red sandstone, an inlaid vase of flowers
  { const px = 2.2, py = FY + 1.2, pz = -D + T;
    B.add('sandstone_red', box(px - 0.8, py - 0.08, pz, px + 0.8, py + 1.5, pz + 0.07)); B.add('marble_smooth', box(px - 0.72, py, pz + 0.07, px + 0.72, py + 1.42, pz + 0.1));
    const fl = [[0, 0.95, 1.5, 0], [-0.4, 0.55, 1.1, 1], [0.4, 0.55, 1.1, 2]];
    for (const [dx, dy, k, s] of fl) { const sub = []; const BB = { add: (m, g) => sub.push([m, g]) }; flower(BB, 0, 0, 0, k, 5, s); for (const [m, g] of sub) { g.rotateX(PI / 2); B.add(m, place(g, px + dx, py + dy, pz + 0.1, 0)); } }
    B.add('inlay_jade', box(px - 0.01, py + 0.1, pz + 0.1, px + 0.01, py + 0.95, pz + 0.104)); B.add('inlay_lapis', box(px - 0.15, py + 0.05, pz + 0.1, px + 0.15, py + 0.2, pz + 0.104));
  }
  // the master's place by the lightwell: cushion, bolster, hookah, a brass tray with cups
  F.cushion(B, 4.3, FY + 0.01, -4.0, 1.0, 0.8, 0.12, 0.3, 'cloth_red'); F.bolster(B, 4.9, FY + 0.12, -4.0, 0.7, 0.12, PI / 2 + 0.3, 'cloth_indigo');
  F.hookah(B, 3.4, FY + 0.01, -3.4, 0.4); F.trayTable(B, 3.9, FY + 0.01, -2.4, { seed: 3 });
  F.copperware(B, 4.8, FY + 0.01, -10.6, 0, el.seed ?? 5, 3);
  // the light from the lightwell falls on the floor; the kerb of it stands on the roof (above)
}
