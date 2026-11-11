// Tōgu-dō with its Dōjinsai, the Ryōan-ji hōjō and its rock garden (docs/settlements/muromachi-kyoto.md §3.1, §4).
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { local, tatami, rng, WD, PL, BARK, TM } from './kit.js';

/** A thin screen (fusuma or shoji) from x0 to x1 at z (or from z0 to z1 at x) with the mid-section open: panels of paper in dark frames. */
function screenZ(B, col, x0, x1, z, y0, y1, open = null, mat = 'shoji', th = 0.06) {
  const n = Math.max(1, Math.round((x1 - x0) / 0.9)), w = (x1 - x0) / n;
  B(WD, x0, y1 - 0.12, z - th, x1, y1, z + th); B(WD, x0, y0, z - th, x1, y0 + 0.05, z + th);
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w, b = a + w;
    if (open && a >= open[0] - 1e-6 && b <= open[1] + 1e-6) continue;
    B(mat, a + 0.02, y0 + 0.05, z - th * 0.5, b - 0.02, y1 - 0.12, z + th * 0.5);
    B(WD, a, y0 + 0.05, z - th, a + 0.03, y1 - 0.12, z + th);
    col.rect([a, z - th, b, z + th], y0, y1);
  }
  if (open) { col.rect([x0, z - th, open[0], z + th], y0, y1); col.rect([open[1], z - th, x1, z + th], y0, y1); }
}
function screenX(B, col, z0, z1, x, y0, y1, open = null, mat = 'shoji', th = 0.06) {
  const n = Math.max(1, Math.round((z1 - z0) / 0.9)), w = (z1 - z0) / n;
  B(WD, x - th, y1 - 0.12, z0, x + th, y1, z1); B(WD, x - th, y0, z0, x + th, y0 + 0.05, z1);
  for (let i = 0; i < n; i++) {
    const a = z0 + i * w, b = a + w;
    if (open && a >= open[0] - 1e-6 && b <= open[1] + 1e-6) continue;
    B(mat, x - th * 0.5, y0 + 0.05, a + 0.02, x + th * 0.5, y1 - 0.12, b - 0.02);
    B(WD, x - th, y0 + 0.05, a, x + th, y1 - 0.12, a + 0.03);
    col.rect([x - th, a, x + th, b], y0, y1);
  }
  if (open) { col.rect([x - th, z0, x + th, open[0]], y0, y1); col.rect([x - th, open[1], x + th, z1], y0, y1); }
}

function togudo(el, ctx) {
  local(el, ctx, ({ bag, col, B, L }, y0) => {
    const h = 3.5, F = 0.7, H = 2.7, y1 = y0 + F, yc = y1 + H;
    // plinth stones and posts, the floor, the shell
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) { const x = -h + i * 1.75, z = -h + j * 1.75; B('granite_block', x - 0.2, y0, z - 0.2, x + 0.2, y0 + 0.34, z + 0.2); B(WD, x - 0.1, y0 + 0.34, z - 0.1, x + 0.1, yc + 0.2, z + 0.1); }
    B(TM, -h, y1 - 0.25, -h, h, y1, h);
    B(WD, -h - 0.04, y0 + 0.4, -h - 0.04, h + 0.04, y1 - 0.25, -h + 0.02);
    for (const sx of [-1, 1]) B(WD, sx > 0 ? h - 0.02 : -h - 0.04, y0 + 0.4, -h, sx > 0 ? h + 0.04 : -h + 0.02, y1 - 0.25, h);
    B(PL, -h + 0.1, y1, -h + 0.02, h - 0.1, yc, -h + 0.13);
    B(PL, -h + 0.02, y1, -h + 0.1, -h + 0.13, yc, h - 0.1);
    // the east side wall: plaster, the window of the writing bay cut out of it (z −0.9…0.3)
    B(PL, h - 0.13, y1, -h + 0.1, h - 0.02, yc, -1.0); B(PL, h - 0.13, y1, 0.4, h - 0.02, yc, h - 0.1);
    B(PL, h - 0.13, y1, -1.0, h - 0.02, y1 + 0.55, 0.4); B(PL, h - 0.13, y1 + 1.55, -1.0, h - 0.02, yc, 0.4);
    B('shoji', h - 0.1, y1 + 0.55, -0.9, h - 0.05, y1 + 1.55, 0.3);
    for (let z = -0.9; z <= 0.31; z += 0.4) B(WD, h - 0.12, y1 + 0.55, z - 0.012, h - 0.04, y1 + 1.55, z + 0.012);
    col.rect([-h, -h, h, -h + 0.15], y0, yc); col.rect([-h, -h, -h + 0.15, h], y0, yc); col.rect([h - 0.15, -h, h, h], y0, yc);
    // the front: shoji drawn back, the middle three bays open to the verandah
    for (const [a, b] of [[-h, -h + 1.75], [h - 1.75, h]]) { B('shoji', a + 0.05, y1, h - 0.06, b - 0.05, yc - 0.3, h - 0.02); col.rect([a, h - 0.1, b, h], y0, yc); }
    B(WD, -h, yc - 0.3, h - 0.1, h, yc, h + 0.04);
    B(PL, -h + 0.1, yc, -h, h - 0.1, yc + 0.2, h);                                    // the ceiling board under the roof
    // the verandah (engawa) and its steps
    B(TM, -h - 0.3, y1 - 0.14, h, h + 0.3, y1, h + 1.3);
    for (const x of [-h - 0.2, -1.8, 0, 1.8, h + 0.2]) B(WD, x - 0.07, y0 + 0.2, h + 1.18, x + 0.07, y1 - 0.14, h + 1.3);
    col.floor([-h - 0.3, h, h + 0.3, h + 1.3], y1);
    for (const [a, b, c, d] of [[-h - 0.3, h + 1.2, -0.9, h + 1.3], [0.9, h + 1.2, h + 0.3, h + 1.3], [-h - 0.3, h, -h - 0.2, h + 1.3], [h + 0.2, h, h + 0.3, h + 1.3]]) { B(WD, a, y0 + 0.3, c === h + 1.3 ? b : c, b, y1 - 0.14, d); col.rect([a, b, c, d], y0, y1 - 0.1); }
    for (let k = 0; k < 2; k++) B('granite_block', -0.9, y0 + k * 0.33, h + 1.3 + (1 - k) * 0.35, 0.9, y0 + (k + 1) * 0.33, h + 1.3 + (2 - k) * 0.35);
    col.ramp([-0.9, h + 1.3, 0.9, h + 2.0], y0, y1 - 0.14, 'n');
    col.floor([-h + 0.1, -h + 0.1, h - 0.1, h - 0.1], y1);
    // ---- the rooms: butsuma (west), san-no-ma (front), Dōjinsai (east middle), ni-no-ma (back) [dossier §3.1]
    screenX(B, col, -h + 0.1, h - 0.1, -0.4, y1, yc, [1.5, 2.7]);                                // butsuma | rest
    screenZ(B, col, -0.4, h - 0.1, 1.0, y1, yc, [1.0, 3.3]);                                      // san-no-ma | Dōjinsai (drawn back)
    screenZ(B, col, -0.4, h - 0.1, -1.7, y1, yc, [1.3, 2.5]);                                     // Dōjinsai | ni-no-ma
    screenX(B, col, -1.7, 1.0, 0.8, y1, yc, null, PL);                                             // the closet beside the Dōjinsai
    tatami(B, -0.4, h - 0.1, 1.0, h - 0.1, y1, true);                                             // san-no-ma
    tatami(B, 0.8, h - 0.1, -1.7, 1.0, y1, true);                                                 // Dōjinsai, 4½ mats
    B(MAT_HALF, 1.9, y1, -0.15, 2.8, y1 + 0.004, 0.45);
    tatami(B, -0.4, h - 0.1, -h + 0.1, -1.7, y1, true);                                           // ni-no-ma
    B(TM, -h + 0.1, y1 - 0.02, -h + 0.1, -0.4, y1 + 0.002, h - 0.1);                              // butsuma: boards
    // butsuma: the altar on the west wall — a stepped dais, the shrine, Kannon, flowers, candles, the incense burner
    B('lacquer_black', -h + 0.12, y1, -0.9, -h + 1.1, y1 + 0.5, 0.9); B('lacquer_black', -h + 0.12, y1 + 0.5, -0.7, -h + 0.95, y1 + 0.58, 0.7);
    B('gold', -h + 0.14, y1 + 0.58, -0.45, -h + 0.7, y1 + 1.55, 0.45); B('lacquer_black', -h + 0.12, y1 + 1.55, -0.52, -h + 0.78, y1 + 1.62, 0.52);
    B('opening', -h + 0.5, y1 + 0.72, -0.3, -h + 0.7, y1 + 1.4, 0.3);
    L('gold', [[0.001, 0], [0.12, 0], [0.1, 0.25], [0.16, 0.5], [0.12, 0.62], [0.001, 0.72]], 12, -h + 0.6, y1 + 0.72, 0);
    for (const z of [-0.6, 0.6]) { B('bronze', -h + 0.8, y1 + 0.58, z - 0.04, -h + 0.88, y1 + 0.84, z + 0.04); B('flame', -h + 0.82, y1 + 0.84, z - 0.01, -h + 0.86, y1 + 0.9, z + 0.01); }
    L('bronze', [[0.001, 0], [0.12, 0], [0.14, 0.1], [0.001, 0.1]], 12, -h + 0.85, y1 + 0.5, 0);
    col.rect([-h + 0.1, -0.9, -h + 1.1, 0.9], y1, y1 + 1.7);
    // the Dōjinsai (dossier §3.1): the writing bay (tsukeshoin) under the window of the east wall — a shelf-desk with its ink
    // stone, brush, a book and a roll — the staggered shelves (chigaidana) with the little cabinet in the half bay, a hanging scroll on the closet wall
    B(WD, h - 0.52, y1 + 0.32, -0.9, h - 0.1, y1 + 0.38, 0.3); B(WD, h - 0.52, y1, -0.9, h - 0.46, y1 + 0.32, -0.84); B(WD, h - 0.52, y1, 0.24, h - 0.46, y1 + 0.32, 0.3);
    B('lacquer_black', h - 0.45, y1 + 0.38, -0.5, h - 0.25, y1 + 0.4, -0.2); B('iron', h - 0.4, y1 + 0.4, -0.45, h - 0.3, y1 + 0.42, -0.35);
    B('cloth_ochre', h - 0.44, y1 + 0.38, -0.05, h - 0.2, y1 + 0.43, 0.2); B('linen', h - 0.4, y1 + 0.43, -0.02, h - 0.24, y1 + 0.46, 0.14);
    B(WD, h - 0.45, y1 + 0.38, -0.8, h - 0.42, y1 + 0.52, -0.6);
    col.rect([h - 0.52, -0.9, h - 0.1, 0.3], y1, y1 + 0.45);
    { const x0 = 2.55, x1 = h - 0.1, z = -1.7 + 0.06;
      B(WD, x0, y1 + 0.05, z, x0 + 0.04, y1 + 1.55, z + 0.4); B(WD, x1 - 0.04, y1 + 0.05, z, x1, y1 + 1.55, z + 0.4);
      B(TM, x0, y1 + 0.9, z, x0 + 0.5, y1 + 0.94, z + 0.4); B(TM, x0 + 0.4, y1 + 0.55, z, x1, y1 + 0.59, z + 0.4); B(TM, x0, y1 + 1.5, z, x1, y1 + 1.54, z + 0.4);
      B('lacquer_black', x0 + 0.04, y1 + 0.05, z, x0 + 0.42, y1 + 0.55, z + 0.38); B('lacquer_black', x0 + 0.5, y1 + 0.94, z, x1 - 0.04, y1 + 1.5, z + 0.38);
      B('gold', x0 + 0.17, y1 + 0.3, z + 0.38, x0 + 0.22, y1 + 0.36, z + 0.39);
      L('glaze_white', [[0.001, 0], [0.05, 0], [0.07, 0.07], [0.04, 0.14], [0.03, 0.17], [0.001, 0.17]], 8, x0 + 0.9, y1 + 0.59, z + 0.2);
      B(WD, x0 + 0.04, y1 + 0.58, z + 0.02, x0 + 0.34, y1 + 0.61, z + 0.34); }
    B('cloth_ochre', 0.82, y1 + 0.5, -1.2, 0.87, y1 + 2.0, -0.6); B('linen', 0.87, y1 + 0.6, -1.15, 0.88, y1 + 1.9, -0.65);
    col.rect([0.8, -1.7, 1.2, 1.0], y1, y1 + 0.01);
    // the roof (hip-and-gable, cypress bark) — the eaves reach out over the verandah
    STYLES.japanese.elements.irimoya({ c: [0, 0.4], A: 4.8, B: 4.9, y: yc + 0.35, rise: 3.0, lift: 0.6, gable: 0.4, mat: BARK, soffit: TM }, { bag, col });
  });
}
const MAT_HALF = 'reed_mat';

/** The hōjō (abbot's quarters) { at (its centre), facing: the veranda's side, W, D }: six rooms in two rows of three, the veranda along the front. */
function hojo(el, ctx) {
  local(el, ctx, ({ bag, col, B, L }, y0) => {
    const W = el.W ?? 26, D = el.D ?? 12, hw = W / 2, hd = D / 2, F = 0.85, H = 2.9, y1 = y0 + F, yc = y1 + H, bay = W / 12;
    for (let i = 0; i <= 12; i++) for (const z of [-hd, -hd + D / 2, hd]) { const x = -hw + i * bay; B('granite_block', x - 0.22, y0, z - 0.22, x + 0.22, y0 + 0.36, z + 0.22); B(WD, x - 0.1, y0 + 0.36, z - 0.1, x + 0.1, yc + 0.2, z + 0.1); }
    B(TM, -hw, y1 - 0.25, -hd, hw, y1, hd);
    B(WD, -hw, y0 + 0.4, -hd - 0.04, hw, y1 - 0.25, -hd + 0.02);
    // the back and side walls, plastered between the posts
    B(PL, -hw + 0.1, y1, -hd + 0.02, hw - 0.1, yc, -hd + 0.13);
    for (const sx of [-1, 1]) B(PL, sx > 0 ? hw - 0.13 : -hw + 0.02, y1, -hd + 0.1, sx > 0 ? hw - 0.02 : -hw + 0.13, yc, hd - 0.1);
    col.rect([-hw, -hd, hw, -hd + 0.15], y0, yc); col.rect([-hw, -hd, -hw + 0.15, hd], y0, yc); col.rect([hw - 0.15, -hd, hw, hd], y0, yc);
    // the front: bays 2, 3, 8, 9 closed with shoji, the rest open to the veranda
    for (let i = 0; i < 12; i++) { const a = -hw + i * bay; if ([0, 5, 6, 11].includes(i)) { B('shoji', a + 0.06, y1, hd - 0.06, a + bay - 0.06, yc - 0.35, hd - 0.02); col.rect([a, hd - 0.1, a + bay, hd], y0, yc); } B(WD, a, yc - 0.35, hd - 0.1, a + bay, yc, hd + 0.04); }
    B(PL, -hw + 0.1, yc, -hd, hw - 0.1, yc + 0.2, hd);
    // the veranda, its floor of boards on posts, steps at the middle
    B(TM, -hw - 0.3, y1 - 0.14, hd, hw + 0.3, y1, hd + 1.9);
    for (let i = 0; i <= 12; i++) B(WD, -hw + i * bay - 0.08, y0 + 0.2, hd + 1.78, -hw + i * bay + 0.08, y1 - 0.14, hd + 1.9);
    col.floor([-hw - 0.3, hd, hw + 0.3, hd + 1.9], y1);
    for (let k = 0; k < 3; k++) B('granite_block', hw + 0.3 + (2 - k) * 0.4, y0 + k * 0.28, hd + 0.2, hw + 0.3 + (3 - k) * 0.4, y0 + (k + 1) * 0.28, hd + 1.7);
    col.ramp([hw + 0.3, hd + 0.2, hw + 1.5, hd + 1.7], y0, y1 - 0.14, 'w');
    for (const [p0, q0, p1, q1] of [[-hw - 0.3, hd + 1.8, hw + 0.3, hd + 1.9], [-hw - 0.3, hd, -hw - 0.2, hd + 1.9], [hw + 0.2, hd, hw + 0.3, hd + 1.9]]) col.rect([p0, q0, p1, q1], y0, y1 - 0.1);
    B(WD, -hw - 0.3, y0 + 0.3, hd + 1.8, hw + 0.3, y1 - 0.14, hd + 1.9);
    // rooms: two rows of three; screens with the gaps where the way goes
    const cx = [-hw, -hw + W / 3, -hw + 2 * W / 3, hw], zm = 0;
    col.floor([-hw + 0.1, -hd + 0.1, hw - 0.1, hd - 0.1], y1);
    for (const i of [1, 2]) screenX(B, col, -hd + 0.1, hd - 0.1, cx[i], y1, yc, i === 1 ? [-1.8, -0.6] : [-hd + 1, -hd + 2.2]);
    screenZ(B, col, -hw + 0.1, hw - 0.1, zm, y1, yc, [cx[1] + 1.0, cx[1] + 3.6]);
    for (let r = 0; r < 3; r++) { const a = cx[r] + (r === 0 ? 0.1 : 0.06), b = cx[r + 1] - (r === 2 ? 0.1 : 0.06);
      tatami(B, a, b, zm + 0.06, hd - 0.1, y1, true); if (r === 1) B(TM, a, y1 - 0.02, -hd + 0.1, b, y1 + 0.002, zm - 0.06); else tatami(B, a, b, -hd + 0.1, zm - 0.06, y1, true); }
    // the Buddha room (middle, rear): the altar against the back wall
    { const x = (cx[1] + cx[2]) / 2;
      B('lacquer_black', x - 1.4, y1, -hd + 0.14, x + 1.4, y1 + 0.55, -hd + 1.1); B('gold', x - 1.0, y1 + 0.55, -hd + 0.2, x + 1.0, y1 + 1.9, -hd + 0.9);
      B('opening', x - 0.6, y1 + 0.7, -hd + 0.5, x + 0.6, y1 + 1.7, -hd + 0.9);
      L('gold', [[0.001, 0], [0.2, 0], [0.18, 0.4], [0.26, 0.9], [0.18, 1.1], [0.001, 1.3]], 14, x, y1 + 0.7, -hd + 0.7);
      for (const dx of [-1.15, 1.15]) { B('bronze', x + dx - 0.06, y1 + 0.55, -hd + 0.5, x + dx + 0.06, y1 + 0.95, -hd + 0.62); B('flame', x + dx - 0.015, y1 + 0.95, -hd + 0.555, x + dx + 0.015, y1 + 1.03, -hd + 0.585); }
      col.rect([x - 1.4, -hd + 0.1, x + 1.4, -hd + 1.1], y1, y1 + 1.9); }
    // the abbot's room (right front): a writing desk and a cushion; the left front room: an empty room with a brazier
    B('lacquer_black', cx[2] + 0.5, y1, hd - 1.4, cx[2] + 1.6, y1 + 0.35, hd - 0.8); B('cloth_maroon', cx[2] + 0.6, y1, hd - 2.1, cx[2] + 1.4, y1 + 0.06, hd - 1.6);
    L('pottery_dark', [[0.001, 0], [0.22, 0], [0.26, 0.3], [0.001, 0.3]], 12, cx[0] + 2.5, y1, hd - 2.5);
    STYLES.japanese.elements.irimoya({ c: [0, 0.8], A: hw + 1.4, B: hd + 2.0, y: yc + 0.4, rise: 4.3, lift: 0.7, gable: 0.35, mat: BARK, soffit: TM }, { bag, col });
  });
}

/** The rock garden { rect, y, seed }: white gravel raked in lines along x and in rings round the five groups of stones (3, 2, 3, 2, 5 from west to east), moss under each group, the clay wall on three sides. */
function karesansui(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 15), gy = y + 0.07;
  bag.add('pebbles', STYLES.japanese.elements && boxGeo(x0, y - 0.2, z0, x1, gy, z1));
  col.rect([x0, z0, x1, z1], y - 0.2, y + 1.2);
  const W = x1 - x0, D = z1 - z0, G = [[0.12, 0.62, 3], [0.34, 0.45, 2], [0.5, 0.68, 3], [0.68, 0.4, 2], [0.88, 0.6, 5]];
  const centres = G.map(([u, v]) => [x0 + u * W, z0 + v * D]);
  // moss under each group, the stones standing on it
  const stones = [];
  G.forEach(([, , n], gi) => {
    const [cx, cz] = centres[gi], R = n === 5 ? 1.9 : n === 3 ? 1.5 : 1.15;
    bag.add('sod', lathe([[0.001, 0.0], [R * 0.9, 0.0], [R, 0.045], [R * 0.7, 0.1], [0.001, 0.11]], 14, (th) => 0.8 + 0.2 * Math.sin(th * 3 + gi * 2), cx, gy, cz));
    for (let k = 0; k < n; k++) {
      const a = k / n * 6.28 + gi, d = n === 1 ? 0 : (0.25 + 0.55 * r()) * R * 0.85, sx = cx + Math.cos(a) * d, sz = cz + Math.sin(a) * d * 0.7;
      const s = (k === 0 ? 1.0 : 0.55 + 0.4 * r()) * (n === 5 ? 1.1 : 1), w = 0.5 * s + 0.15, h = (0.45 + 0.5 * r()) * s;
      stones.push([sx, sz, w]);
      const ph = r() * 6, sk = 0.35 * r();
      bag.add('rock_boulder', lathe([[0.001, -0.05], [w, -0.05], [w * 1.0, h * 0.3], [w * 0.86, h * 0.7], [w * 0.5, h * 0.95], [0.001, h]], 11, (th, i) => 1 + 0.22 * Math.sin(th * 2 + ph) + 0.12 * Math.sin(th * 5 + ph * 2) + (i > 2 ? -sk * Math.cos(th) * 0.5 : 0), sx, gy, sz));
      col.circle(sx, sz, w * 0.95, gy, gy + h);
    }
  });
  // the raked lines along the garden, broken at the groups, the rings round them
  const near = (px, pz, m) => centres.some(([cx, cz], gi) => Math.hypot((px - cx) / 1.0, (pz - cz) / 0.8) < (G[gi][2] === 5 ? 2.5 : G[gi][2] === 3 ? 2.0 : 1.6) + m);
  for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.21) {
    let a = null;
    for (let x = x0 + 0.2; x <= x1 - 0.15; x += 0.4) {
      const bad = near(x, z, 0.0);
      if (!bad && a === null) a = x;
      if ((bad || x + 0.4 > x1 - 0.15) && a !== null) { bag.add('plaster_white', boxGeo(a, gy, z - 0.025, bad ? x - 0.2 : x, gy + 0.035, z + 0.025)); a = null; }
    }
  }
  G.forEach(([, , n], gi) => { const [cx, cz] = centres[gi]; for (let k = 0; k < (n === 5 ? 4 : 3); k++) { const R = (n === 5 ? 2.1 : n === 3 ? 1.7 : 1.35) + k * 0.24; const g = lathe([[R - 0.03, 0], [R, 0.04], [R + 0.03, 0]], 40, null, 0, 0, 0); g.scale(1, 1, 0.8); g.translate(cx, gy, cz); bag.add('plaster_white', g); } });
  // the clay wall on the north, east and west, a bark coping; a kerb of stone along the south
  const wl = (a, b, c, d) => { bag.add('earth_wall', boxGeo(a, y, b, c, y + 1.45, d)); bag.add(BARK, boxGeo(a - 0.2, y + 1.45, b - 0.2, c + 0.2, y + 1.6, d + 0.2)); col.rect([a, b, c, d], y, y + 1.6); };
  wl(x0 - 0.5, z0 - 0.5, x1 + 0.5, z0); wl(x0 - 0.5, z0, x0, z1); wl(x1, z0, x1 + 0.5, z1);
  bag.add('granite_block', boxGeo(x0, y, z1, x1, gy + 0.02, z1 + 0.25));
  void PL; void WD;
}
import { box as boxGeo } from '../../core/geom.js';

export const zenElements = { togudo, hojo, karesansui };
