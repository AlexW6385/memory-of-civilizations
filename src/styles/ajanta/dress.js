// The dressing of Ajanta's cliff and gorge floor (docs/settlements/ajanta.md §5–§7, §10): the ledge before the painted
// caves (a low kerb at the drop, rock-cut benches, votive stupas, a cistern, lamp stands), the workyard of the masons and
// painters (blocks and an unfinished pillar on rollers, a lime pit, the colour shed with its pigment pots), the washing
// place on the river bank (stones, cloths spread to dry, a coracle, a fish trap) and the growth on the cliff (creepers,
// shrubs on the tiers, fallen boulders, a bees' comb under an overhang).
import { box, lathe, rod, frustum, disc } from '../../core/geom.js';
import { XF, ZW, FLOOR, LEDGE, RIVER, riverX, rng } from '../../settlements/ajanta/layout.js';

const oil = (bag, x, y, z, h = 0.7) => {
  bag.add('bronze', lathe([[0.12, 0], [0.12, 0.03], [0.05, 0.1], [0.04, h - 0.1], [0.1, h - 0.04], [0.11, h], [0.001, h]], 8, null, x, y, z));
  bag.add('flame', lathe([[0.01, 0], [0.016, 0.025], [0.001, 0.06]], 5, null, x, y + h + 0.01, z));
};
/** A small rock-cut votive stupa: square base, drum, dome, harmika and a stack of discs, h high. */
function stupa(bag, col, x, y, z, h) {
  const k = h / 2.2;
  bag.add('sandstone_carved', box(x - 0.55 * k, y, z - 0.55 * k, x + 0.55 * k, y + 0.25 * k, z + 0.55 * k));
  bag.add('sandstone_carved', lathe([[0.45 * k, 0], [0.45 * k, 0.5 * k], [0.5 * k, 0.55 * k], [0.001, 0.55 * k]], 12, null, x, y + 0.25 * k, z));
  bag.add('lime_plaster', lathe([[0.001, 0], [0.45 * k, 0.02], [0.52 * k, 0.28 * k], [0.4 * k, 0.55 * k], [0.15 * k, 0.72 * k], [0.001, 0.75 * k]], 14, null, x, y + 0.8 * k, z));
  bag.add('sandstone_carved', box(x - 0.14 * k, y + 1.5 * k, z - 0.14 * k, x + 0.14 * k, y + 1.7 * k, z + 0.14 * k));
  for (let i = 0; i < 3; i++) bag.add('sandstone_carved', lathe([[0.001, 0], [(0.3 - i * 0.07) * k, 0], [(0.3 - i * 0.07) * k, 0.05 * k], [0.001, 0.05 * k]], 10, null, x, y + (1.7 + i * 0.1) * k, z));
  col.circle(x, z, 0.58 * k, y, y + h);
}
/** aj_ledge: the ledge (x XF…XF+6, y = FLOOR[1]) dressed. */
export function ledge(el, { bag, col }) {
  const y = FLOOR[1], { x0, x1, z0, z1 } = LEDGE, r = rng(77), kx = x1 - 0.45;
  // the kerb at the drop: a low rubble wall in runs, gaps before each stupa and at the stair's head
  for (let z = -41; z < z1 - 0.5; z += 5.2 + r() * 2) { const L = 3.2 + r() * 1.4, a = z, b = Math.min(z1, z + L); bag.add('rubble', box(kx, y, a, kx + 0.4, y + 0.4 + r() * 0.12, b)); col.rect([kx, a, kx + 0.4, b], y, y + 0.5); z += 0; }
  // rock-cut benches against the face between the caves, a stone lamp stand beside each, pigeons' droppings are the weather's
  for (const z of [-45, -11.5, 7.5, 31, 40]) {
    bag.add('sandstone_carved', box(x0 + 0.02, y, z - 1.1, x0 + 0.55, y + 0.42, z + 1.1)); col.rect([x0 + 0.02, z - 1.1, x0 + 0.55, z + 1.1], y, y + 0.42);
    bag.add('sandstone_carved', box(x0 + 0.02, y + 0.42, z - 1.1, x0 + 0.2, y + 0.9, z + 1.1));
  }
  for (const z of [-34, -17, -9.5, 14.5, 30, 41]) { bag.add('sandstone_carved', box(x0 + 1.7, y, z - 0.17, x0 + 2.05, y + 0.8, z + 0.17)); col.rect([x0 + 1.7, z - 0.17, x0 + 2.05, z + 0.17], y, y + 0.8); oil(bag, x0 + 1.875, y + 0.8, z, 0.28); }
  // votive stupas of the pilgrims, left on the ledge
  for (const [z, h] of [[-3, 1.7], [18, 2.0], [41.5, 1.5]]) stupa(bag, col, x0 + 4.85, y, z, h);
  // the cistern: a rock-cut tank at the south end, with its water and a ladle on the rim
  { const cx0 = x0 + 2.4, cz0 = 53.2, cx1 = x0 + 5.4, cz1 = 56.4;
    bag.add('sandstone_carved', box(cx0, y, cz0, cx1, y + 0.55, cz0 + 0.3)); bag.add('sandstone_carved', box(cx0, y, cz1 - 0.3, cx1, y + 0.55, cz1)); bag.add('sandstone_carved', box(cx0, y, cz0, cx0 + 0.3, y + 0.55, cz1)); bag.add('sandstone_carved', box(cx1 - 0.3, y, cz0, cx1, y + 0.55, cz1));
    bag.add('water', box(cx0 + 0.3, y + 0.38, cz0 + 0.3, cx1 - 0.3, y + 0.4, cz1 - 0.3)); col.rect([cx0, cz0, cx1, cz1], y, y + 0.55); }
  // marigold garlands and offerings of rice laid on the benches' ends
  for (const z of [-45, 7.5, 31]) for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'paint_ochre' : 'cloth_red', lathe([[0.001, 0], [0.09, 0.01], [0.07, 0.06], [0.001, 0.08]], 6, null, x0 + 0.28 + (k % 3) * 0.08, y + 0.42, z - 0.35 + k * 0.14));
}
/** aj_workyard: the masons' and painters' yard at the foot of the north wing: blocks, an unfinished pillar on rollers, a lime pit, the colour shed. */
export function workyard(el, { bag, col }) {
  const z = -ZW, r = rng(21), x = XF;
  // squared blocks and spoil along the foot of the wing, east of the mason's chips
  for (let i = 0; i < 9; i++) { const bx = x + 23.5 + (i % 4) * 1.5 + r() * 0.4, bz = z + 1.4 + Math.floor(i / 4) * 1.4 + r() * 0.3, w = 0.8 + r() * 0.5, h = 0.5 + r() * 0.5; bag.add(i % 3 ? 'sandstone_carved' : 'granite_rough', box(bx, 0, bz, bx + w, h, bz + 0.8 + r() * 0.3)); col.rect([bx, bz, bx + w, bz + 1], 0, h); }
  // an unfinished octagonal pillar on three round rollers, a chalk line down it, chisels beside
  { const px = x + 24.5, pz = z + 5.3;
    for (const dx of [-1.6, 0, 1.6]) bag.add('log_pine', rod([px + dx, 0.13, pz - 0.5], [px + dx, 0.13, pz + 0.5], 0.13, 6));
    bag.add('sandstone_carved', rod([px - 2.2, 0.55, pz], [px + 2.2, 0.55, pz], 0.42, 8)); bag.add('sandstone_white', rod([px - 2.2, 0.97, pz], [px + 2.2, 0.97, pz], 0.01, 4)); col.rect([px - 2.2, pz - 0.45, px + 2.2, pz + 0.45], 0, 1.0);
    for (let k = 0; k < 4; k++) bag.add('iron', rod([px - 1.2 + k * 0.5, 0.01, pz + 0.9], [px - 0.9 + k * 0.5, 0.04, pz + 1.1], 0.012, 4)); }
  // the lime pit: a dug basin of white slurry with a stirring pole; plaster trough beside it
  { const lx = x + 31, lz = z + 11.5; bag.add('earth_wall', box(lx - 1.3, 0, lz - 1.0, lx + 1.3, 0.25, lz + 1.0)); bag.add('lime_plaster', box(lx - 1.05, 0.16, lz - 0.75, lx + 1.05, 0.27, lz + 0.75)); col.rect([lx - 1.3, lz - 1.0, lx + 1.3, lz + 1.0], 0, 0.3);
    bag.add('timber', rod([lx + 1.5, 0, lz + 0.8], [lx + 0.2, 1.9, lz - 0.3], 0.03, 4)); bag.add('timber', box(lx + 1.6, 0, lz - 0.7, lx + 2.9, 0.3, lz - 0.1)); bag.add('plaster_ochre', box(lx + 1.7, 0.2, lz - 0.6, lx + 2.8, 0.31, lz - 0.2)); col.rect([lx + 1.6, lz - 0.7, lx + 2.9, lz - 0.1], 0, 0.3); }
  // the colour shed: four posts, a thatch roof, a shelf of pigment pots, grinding stones, a water jar
  { const sx0 = x + 21.5, sz0 = z + 8.5, sx1 = x + 27.5, sz1 = z + 12.5, h = 2.5;
    for (const px of [sx0 + 0.2, sx1 - 0.2]) for (const pz of [sz0 + 0.2, sz1 - 0.2]) { bag.add('timber', rod([px, 0, pz], [px, h, pz], 0.09, 6)); col.circle(px, pz, 0.11, 0, h); }
    bag.add('thatch', frustum([sx0 - 0.6, sz0 - 0.6, sx1 + 0.6, sz1 + 0.6], h, h + 1.3, 0.7, 0.7, 0.7, 0.7)); bag.add('earth_wall', box(sx0, -0.05, sz0, sx1, 0.04, sz1)); col.floor([sx0, sz0, sx1, sz1], 0.04);
    bag.add('planks_grey', box(sx0 + 0.3, 0.9, sz1 - 0.55, sx1 - 0.3, 0.97, sz1 - 0.2)); col.rect([sx0 + 0.3, sz1 - 0.55, sx1 - 0.3, sz1 - 0.2], 0, 1.0);
    for (const px of [sx0 + 0.5, sx1 - 0.5]) bag.add('timber', box(px - 0.05, 0, sz1 - 0.5, px + 0.05, 0.9, sz1 - 0.25));
    const COL = ['paint_ochre', 'egyptian_blue', 'fresco_green', 'wall_red', 'paint_white', 'lacquer_black', 'tuff_red', 'clay_green'];
    for (let k = 0; k < 14; k++) { const px = sx0 + 0.6 + k * 0.38; bag.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.07], [0.07, 0.12], [0.001, 0.12]], 8, null, px, 0.97, sz1 - 0.38)); bag.add(COL[k % COL.length], disc(0.062, 1.088, 8, px, sz1 - 0.38)); }
    for (const [gx, gz] of [[sx0 + 1.2, sz0 + 1.1], [sx0 + 3.6, sz0 + 1.3]]) { bag.add('granite_rough', box(gx - 0.4, 0, gz - 0.28, gx + 0.4, 0.2, gz + 0.28)); bag.add('egyptian_blue', box(gx - 0.2, 0.2, gz - 0.14, gx + 0.2, 0.215, gz + 0.14)); bag.add('granite_rough', rod([gx - 0.12, 0.26, gz], [gx + 0.15, 0.26, gz], 0.05, 6)); col.rect([gx - 0.4, gz - 0.28, gx + 0.4, gz + 0.28], 0, 0.22); }
    bag.add('terracotta', lathe([[0.001, 0], [0.3, 0.05], [0.4, 0.4], [0.3, 0.8], [0.18, 0.9], [0.001, 0.9]], 10, null, sx1 - 0.7, 0.04, sz0 + 0.7)); col.circle(sx1 - 0.7, sz0 + 0.7, 0.4, 0, 0.9); }
  // firewood for the lime-burning and a stack of lashing poles
  for (let k = 0; k < 6; k++) bag.add('bamboo_culm', rod([x + 28.5, 0.05 + (k % 3) * 0.08, z + 2.2 + k * 0.12 - (k % 3) * 0.1], [x + 33.5, 0.05 + (k % 3) * 0.08, z + 2.4 + k * 0.12], 0.04, 5));
}
/** aj_ghat: the washing place on the river's west bank at z = el.z: flat stones at the water, cloths spread, a coracle, a fish trap of stakes. */
export function ghat(el, { bag, col }) {
  const z0 = el.z, xr = riverX(z0), r = rng(el.seed ?? 5), W = RIVER.w / 2;
  for (let i = 0; i < 6; i++) { const zz = z0 - 3 + i * 1.2, xx = riverX(zz) - W - 0.4 - (i % 2) * 0.7; bag.add('granite_rough', box(xx - 0.55, 0, zz - 0.4, xx + 0.55, 0.12 + (i % 2) * 0.05, zz + 0.4)); col.floor([xx - 0.55, zz - 0.4, xx + 0.55, zz + 0.4], 0.12 + (i % 2) * 0.05); }
  const CL = ['cloth_white', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_maroon'];
  for (let i = 0; i < 9; i++) { const zz = z0 - 5 + r() * 9, xx = riverX(zz) - W - 2.2 - r() * 2.6, a = 1.1 + r() * 0.8, b = 0.5 + r() * 0.5; bag.add(CL[i % CL.length], box(xx, 0.02, zz, xx + a, 0.035, zz + b)); }
  // the coracle (a round basket-boat of hide on wicker) turned over on the bank, its paddle across it
  { const cx = xr - W - 3.4, cz = z0 + 5.6; bag.add('wicker', lathe([[0.001, 0.62], [0.55, 0.5], [0.85, 0.2], [0.9, 0.02], [0.82, 0.02], [0.001, 0.45]], 14, null, cx, 0, cz)); bag.add('hide_brown', lathe([[0.001, 0.64], [0.57, 0.52], [0.87, 0.22], [0.92, 0.0], [0.001, 0.0]], 14, null, cx, 0, cz)); bag.add('timber', rod([cx - 0.5, 0.7, cz - 0.9], [cx + 0.7, 0.2, cz + 0.8], 0.03, 5)); bag.add('timber', box(cx + 0.55, 0.12, cz + 0.65, cx + 0.95, 0.24, cz + 1.0)); col.circle(cx, cz, 0.92, 0, 0.65); }
  // the fish trap: a V of stakes and a wicker cone in the shallows, drawn with a stone weir
  { const zz = z0 - 4.5, xx = riverX(zz) - W + 0.7;
    for (let k = 0; k < 7; k++) { bag.add('timber', rod([xx + k * 0.45, -0.9, zz - k * 0.35], [xx + k * 0.45, 0.35, zz - k * 0.35], 0.025, 4)); bag.add('timber', rod([xx + k * 0.45, -0.9, zz + k * 0.35], [xx + k * 0.45, 0.35, zz + k * 0.35], 0.025, 4)); }
    bag.add('wicker', lathe([[0.4, 0], [0.18, 0.5], [0.001, 0.9]], 8, null, xx + 3.1, -0.3, zz)); }
}
/** aj_clifflife: creepers on the face, shrubs on the tiers and the top, boulders at the feet, a bees' comb under an overhang. */
export function clifflife(el, { bag, col }) {
  const r = rng(91), top = (s) => 34 + 2.5 * Math.sin(s * 0.09);
  // creepers (a pale-leaved strand) hanging from the lip over the main face
  for (let k = 0; k < 60; k++) { const s = -ZW + 2 + r() * (2 * ZW - 4), len = 2 + r() * 7, y1 = top(s) - 0.3; bag.add(k % 3 ? 'palm_leaf' : 'doum_leaf', box(XF + 0.05, y1 - len, s, XF + 0.12 + r() * 0.2, y1, s + 0.06 + r() * 0.14)); }
  // shrubs and fig seedlings on the tier ledges: dark mounds
  for (let k = 0; k < 90; k++) { const s = -ZW + 1 + r() * (2 * ZW - 2), y = k % 3 === 0 ? FLOOR[2] : k % 3 === 1 ? 24 + r() * 7 : FLOOR[1] + 11 + r() * 3, rr = 0.35 + r() * 0.55; bag.add(k % 2 ? 'palm_leaf' : 'cloth_green', lathe([[0.001, 0], [rr, 0.1], [rr * 0.9, rr * 0.8], [rr * 0.4, rr * 1.2], [0.001, rr * 1.3]], 6, null, XF + 0.4 + r() * 0.6, y, s)); }
  // boulders at the feet of the wings and the face's ends, fallen from the rock
  for (let k = 0; k < 26; k++) { const north = k % 2 === 0, z = (north ? -1 : 1) * (ZW + 0.6 + r() * 3), x = XF + 2 + r() * 46, w = 0.5 + r() * 1.3, h = w * (0.6 + r() * 0.5); bag.add('rubble', box(x, 0, z, x + w, h, z + w * 0.9)); col.rect([x, z, x + w, z + w * 0.9], 0, h); }
  // the comb of the rock bees: a hanging lens under the overhang of the north wing's top
  for (const [x, z] of [[XF + 28, -ZW + 0.5], [XF + 44, ZW - 0.5], [XF + 6, -ZW + 0.5]]) bag.add('paint_ochre', lathe([[0.001, 0], [0.38, 0.1], [0.3, 0.7], [0.12, 1.1], [0.001, 1.15]], 8, null, x, 26.5, z));
}
export const DRESS_ELEMENTS = { aj_ledge: ledge, aj_workyard: workyard, aj_ghat: ghat, aj_clifflife: clifflife };
