// The building yard at the pit's east end and the haul road (docs/settlements/qin-xianyang.md §4b): where a visitor arrives. The
// three ramps with their timber portals, the black banners of the works, shear-leg hoists on the bare roof, stacks of pine logs
// and rolls of reed mat, heaps of earth, the overseers' pavilion with its ledgers, the watch tower, the haul road with its ruts.
import { box, lathe, frustum, rod, addCloth, clothBox } from '../../core/geom.js';
import { hipRoof } from '../chinese/index.js';
import { rng } from '../../objects/kit.js';
import { PIT, RAMP, ROOF, rampZ, HAUL } from '../../settlements/qin-xianyang/layout.js';
import { frame, gable } from './houses.js';

const X1 = PIT.x1 + RAMP.len;                                            // the ramps' top end

/** qin_yard: {} — everything of the yard, in the settlement's frame. */
export function qinYard(el, { bag, col }) {
  const r = rng(4242);
  const post = (x, z, h, rad = 0.2, mat = 'timber', y0 = 0) => { bag.add(mat, lathe([[rad, 0], [rad * 0.9, h]], 8, null, x, y0, z)); col.circle(x, z, rad + 0.03, y0, y0 + h); };
  // the portals: two posts and a lintel with a black cloth over each ramp's head, an iron brazier either side
  for (let i = 0; i < 3; i++) {
    const zc = rampZ(i), x = X1 - 1.0, hw = RAMP.w / 2 + 0.55;
    for (const s of [-1, 1]) { post(x, zc + s * hw, 4.4, 0.24, 'timber_red'); bag.add('granite_grey', lathe([[0.4, 0], [0.4, 0.22], [0.3, 0.26]], 10, null, x, 0, zc + s * hw)); }
    bag.add('lacquer_black', box(x - 0.3, 4.1, zc - hw - 0.5, x + 0.3, 4.6, zc + hw + 0.5));
    bag.add('paint_ochre', box(x - 0.31, 4.6, zc - hw - 0.55, x + 0.31, 4.68, zc + hw + 0.55));
    for (let k = 0; k < 7; k++) bag.add('timber_red', rod([x - 0.9, 4.4, zc - hw - 0.3 + k * (hw * 2 + 0.6) / 6], [x + 0.9, 4.9, zc - hw - 0.3 + k * (hw * 2 + 0.6) / 6], 0.05, 5));   // the rafters of a little roof of reed
    bag.add('reed_mat', box(x - 1.0, 4.85, zc - hw - 0.45, x + 1.0, 4.95, zc + hw + 0.45));
    addCloth(bag, 'cloth_black', clothBox(x + 0.32, 2.2, zc - hw + 0.3, x + 0.36, 4.1, zc + hw - 0.3), 4.1);
    for (const s of [-1, 1]) { const bx = X1 + 2.2, bz = zc + s * (hw + 1.6); bag.add('iron', lathe([[0.001, 0.85], [0.3, 0.9], [0.34, 1.05], [0.28, 1.05]], 10, null, bx, 0, bz)); for (const a of [0, 2.1, 4.2]) bag.add('iron', rod([bx + Math.cos(a) * 0.24, 0, bz + Math.sin(a) * 0.24], [bx, 0.88, bz], 0.025, 4)); bag.add('flame', lathe([[0.001, 1.0], [0.1, 1.08], [0.001, 1.4]], 6, null, bx, 0, bz)); col.circle(bx, bz, 0.35, 0, 1.2); }
  }
  // the paved apron before the ramps (small bricks) with the ruts of sledges across it
  bag.add('brick_grey', box(X1 - 0.5, -0.02, rampZ(0) - 6, X1 + 7, 0.03, rampZ(2) + 6));
  // the banners of the works: tall poles of pine, a crossbar, a long black pennant and a red streamer
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const bx = X1 + 6.5 + (s > 0 ? 0 : 3), bz = rampZ(i) + s * (RAMP.w / 2 + 3.4);
    post(bx, bz, 8.2, 0.1, 'log_pine');
    bag.add('timber', box(bx - 0.04, 7.6, bz - 0.8, bx + 0.04, 7.68, bz + 0.1));
    addCloth(bag, 'cloth_black', clothBox(bx - 0.03, 4.4, bz - 0.78, bx + 0.03, 7.6, bz - 0.05), 7.6);
    addCloth(bag, 'cloth_red', clothBox(bx - 0.03, 7.0, bz + 0.15, bx + 0.03, 8.1, bz + 1.5), 8.1);
  }
  // shear-leg hoists on the bare roof: two poles leaning together, a pulley, a rope with a log hanging from it
  for (const [hx, hi] of [[ROOF.bareX + 28, 0], [ROOF.bareX + 52, 2]]) {
    const zc = rampZ(hi) + (hi ? 3 : 4.5), y0 = ROOF.top;
    for (const s of [-1, 1]) { bag.add('log_pine', rod([hx, y0, zc + s * 2.4], [hx + 0.6, y0 + 8.4, zc + s * 0.15], 0.14, 7)); col.circle(hx, zc + s * 2.4, 0.2, y0, y0 + 2); }
    bag.add('log_pine', rod([hx + 0.6, y0 + 8.3, zc - 0.15], [hx + 0.6, y0 + 8.3, zc + 0.15], 0.13, 6));
    bag.add('iron', lathe([[0.001, -0.14], [0.17, -0.04], [0.17, 0.04], [0.001, 0.14]], 8).rotateX(Math.PI / 2).translate(hx + 0.6, y0 + 8.1, zc));
    bag.add('rope_fibre', rod([hx + 0.6, y0 + 8.1, zc], [hx + 0.6, y0 + 4.6, zc], 0.018, 4));
    bag.add('rope_fibre', rod([hx + 0.6, y0 + 4.9, zc], [hx + 0.62, y0 + 4.4, zc - 1.2], 0.014, 4)); bag.add('rope_fibre', rod([hx + 0.6, y0 + 4.9, zc], [hx + 0.58, y0 + 4.4, zc + 1.2], 0.014, 4));
    bag.add('log_pine', rod([hx + 0.6, y0 + 4.4, zc - 2.7], [hx + 0.6, y0 + 4.4, zc + 2.7], 0.19, 8));
    for (const s of [-1, 1]) bag.add('rope_fibre', rod([hx + 0.6, y0 + 4.4, zc + s * 2.7], [hx + 12, y0, zc + s * 3.5], 0.02, 4));   // the guy ropes
  }
  // stacks of pine logs for the roof (north of the ramps), each end on two skids; reed mats rolled and stacked
  for (let k = 0; k < 7; k++) {
    const sx = X1 + 10 + (k % 4) * 6.4, sz = rampZ(0) - 12 - Math.floor(k / 4) * 8, len = 5.4;
    for (const dx of [-1.6, 1.6]) bag.add('timber', box(sx + dx - 0.1, 0, sz - len / 2, sx + dx + 0.1, 0.16, sz + len / 2));
    let n = 5, y = 0.16;
    for (let layer = 0; layer < 5; layer++, n--) for (let q = 0; q < n; q++) bag.add('log_pine', rod([sx - (n - 1) * 0.19 + q * 0.38, y + 0.19, sz - len / 2], [sx - (n - 1) * 0.19 + q * 0.38, y + 0.19, sz + len / 2], 0.19, 7)), y += 0;
    col.rect([sx - 1.2, sz - len / 2, sx + 1.2, sz + len / 2], 0, 1.2);
  }
  for (let k = 0; k < 4; k++) { const mx = X1 + 12 + k * 2.2, mz = rampZ(2) + 11; for (let q = 0; q < 6; q++) bag.add('reed_mat', lathe([[0.26, 0], [0.26, 1.8]], 8).rotateX(Math.PI / 2).translate(mx + (q % 3) * 0.5 - 0.5, 0.26 + Math.floor(q / 3) * 0.45, mz)); col.rect([mx - 0.8, mz - 0.95, mx + 0.8, mz + 0.95], 0, 1.0); }
  // heaps of earth for the roof, with baskets (life elements, town.js); a ramming ground: the trodden floor
  for (let k = 0; k < 6; k++) { const hx = X1 + 6 + k * 5.5, hz = rampZ(2) + 5 + r() * 3, s = 1.6 + r() * 1.4; bag.add('earth_wall', frustum([hx - s * 1.8, hz - s * 1.4, hx + s * 1.8, hz + s * 1.4], 0, s * 0.9, 0.7, 0.7, 0.6, 0.6, { noBottom: true })); col.rect([hx - s * 1.4, hz - s * 1.1, hx + s * 1.4, hz + s * 1.1], 0, s * 0.8); }
  // the overseers' pavilion: four posts, a roof of black cloth on a ridge-pole, a table with the ledgers (bamboo slips), a scribe's mat
  { const px = X1 + 20, pz = rampZ(2) + 9.5, w = 5.4, d = 3.8;
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) post(px + dx * w / 2, pz + dz * d / 2, 2.8, 0.1);
    bag.add('timber', box(px - w / 2 - 0.3, 2.8, pz - 0.06, px + w / 2 + 0.3, 3.4, pz + 0.06));
    for (const s of [-1, 1]) { bag.add('timber', rod([px - w / 2 - 0.3, 2.75, pz + s * (d / 2 + 0.3)], [px + w / 2 + 0.3, 2.75, pz + s * (d / 2 + 0.3)], 0.05, 4)); }
    addCloth(bag, 'cloth_black', clothBox(px - w / 2 - 0.3, 2.8, pz - d / 2 - 0.3, px + w / 2 + 0.3, 3.4, pz - 0.05), 3.4);
    addCloth(bag, 'cloth_black', clothBox(px - w / 2 - 0.3, 2.8, pz + 0.05, px + w / 2 + 0.3, 3.4, pz + d / 2 + 0.3), 3.4);
    bag.add('reed_mat', box(px - 2.2, 0.02, pz - 1.4, px + 2.2, 0.05, pz + 1.4));
    bag.add('lacquer_red', box(px - 0.9, 0.05, pz - 0.35, px + 0.9, 0.42, pz + 0.35)); col.rect([px - 0.9, pz - 0.35, px + 0.9, pz + 0.35], 0, 0.42);
    for (let q = 0; q < 6; q++) bag.add('bamboo_culm', box(px - 0.7 + q * 0.2, 0.42, pz - 0.2, px - 0.55 + q * 0.2, 0.455, pz + 0.2));    // the slips
    bag.add('lacquer_black', box(px + 1.2, 0.05, pz - 0.2, px + 1.5, 0.3, pz + 0.2));
  }
  // the reed sheds of the gangs (lean-to: posts, a sloping roof of thatch), the water jars before them
  for (let k = 0; k < 4; k++) {
    const sx = X1 + 28 + (k % 2) * 11, sz = rampZ(0) - 6 - Math.floor(k / 2) * 11 - 4;
    const F = frame([sx, sz, sx + 8, sz + 5], 's', bag, col);
    for (const u of [0.3, 4, 7.7]) F.b('timber', u - 0.1, 0, 4.8, u + 0.1, 2.4, 5, false);
    for (const u of [0.3, 4, 7.7]) F.b('timber', u - 0.1, 0, 0, u + 0.1, 1.6, 0.2, false);
    gable(F, 0, 0, 8, 5, 2.1, 0.9, 'thatch', 0.4);
    F.b('earth_wall', 0.2, 0, 4.8, 7.8, 1.6, 5.1);                                                           // the back wall of earth
    F.b('reed_mat', 0.4, 0.02, 0.6, 7.6, 0.05, 4.6, false);
    for (let q = 0; q < 3; q++) F.lathe('terracotta', [[0.001, 0], [0.12, 0.02], [0.3, 0.3], [0.26, 0.62], [0.16, 0.76], [0.001, 0.76]], 1.2 + q * 0.8, 0, -1.0, 10);
  }
  // the watch tower: a base of beaten earth with a ladder, a timber room with a railed walk, a hipped roof; a beacon basket
  { const tx = X1 + 52, tz = rampZ(0) - 22, hw = 3.2, bh = 5.0;
    bag.add('earth_wall', frustum([tx - hw, tz - hw, tx + hw, tz + hw], 0, bh, 0.8, 0.8, 0.8, 0.8, { noBottom: true })); col.rect([tx - hw, tz - hw, tx + hw, tz + hw], 0, bh);
    for (let k = 0; k < 16; k++) bag.add('timber', box(tx - 0.5, k * bh / 16, tz + hw + 0.3 - (k + 1) * 0.28, tx + 0.5, (k + 1) * bh / 16, tz + hw + 0.3 - k * 0.28));
    col.ramp([tx - 0.5, tz + hw - 0.3, tx + 0.5, tz + hw + 4.2], 0, bh, 'n');
    col.floor([tx - hw + 0.4, tz - hw + 0.4, tx + hw - 0.4, tz + hw - 0.4], bh);
    bag.add('planks_grey', box(tx - hw + 0.4, bh, tz - hw + 0.4, tx + hw - 0.4, bh + 0.1, tz + hw - 0.4));
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) post(tx + dx * (hw - 0.8), tz + dz * (hw - 0.8), 3.0, 0.16, 'timber_red', bh + 0.1);
    for (const [a, b, c2, d] of [[tx - hw + 0.65, tz - hw + 0.65, tx + hw - 0.65, tz - hw + 0.8], [tx - hw + 0.65, tz - hw + 0.65, tx - hw + 0.8, tz + hw - 0.65], [tx + hw - 0.8, tz - hw + 0.65, tx + hw - 0.65, tz + hw - 0.65]]) { bag.add('palace_wall', box(a, bh + 0.1, b, c2, bh + 1.9, d)); col.rect([a, b, c2, d], bh, bh + 1.9); }
    for (const dz of [-0.9]) bag.add('lacquer_black', box(tx - hw + 0.6, bh + 2.9, tz - hw + 0.6, tx + hw - 0.6, bh + 3.2, tz + hw - 0.6));
    hipRoof({ c: [tx, tz], A: hw + 1.6, B: hw + 1.6, y: bh + 3.2, rise: 2.4, lift: 0.3, pow: 1.3, mat: 'tile_dark', soffit: 'timber_red', ridgeMat: 'tile_dark', noChiwei: true }, { bag });
    post(tx, tz, 3.4, 0.07, 'timber', bh + 5.5);
    addCloth(bag, 'cloth_black', clothBox(tx + 0.07, bh + 6.6, tz - 0.03, tx + 2.0, bh + 8.8, tz + 0.03), bh + 8.8);
    bag.add('wicker', lathe([[0.2, 0], [0.5, 0.25], [0.45, 0.7], [0.3, 0.7]], 8, null, tx + 2.0, bh + 0.1, tz - 2.0));                   // the beacon's basket and its fuel
    bag.add('flame', lathe([[0.001, 0.6], [0.2, 0.7], [0.001, 1.3]], 6, null, tx + 2.0, bh + 0.1, tz - 2.0));
  }
}

/** qin_haulroad: {} — the road east from the ramps' apron: two ruts of one gauge, low earth banks, culvert logs, a milestone. */
export function qinHaulRoad(el, { bag }) {
  const { z, x0, x1, w } = HAUL;
  bag.add('earth_wall', box(x0, 0, z - w / 2, x1, 0.05, z + w / 2));
  for (const dz of [-1.4, 0, 1.4]) for (const s of [-1, 1]) bag.add('mud_plaster', box(x0, 0.05, z + dz + s * 0.695 - 0.09, x1, 0.062, z + dz + s * 0.695 + 0.09));
  for (const s of [-1, 1]) bag.add('earth_wall', frustum([x0, z + s * (w / 2) - (s > 0 ? 0 : 1.6), x1, z + s * (w / 2) + (s > 0 ? 1.6 : 0)], 0, 0.35, 0, 0, 1.0, 1.0, { noBottom: true }));
  for (let x = x0 + 12; x < x1; x += 40) bag.add('granite_grey', lathe([[0.2, 0], [0.18, 0.7], [0.001, 0.76]], 7, null, x, 0, z + w / 2 + 1.0));   // the milestones
}
