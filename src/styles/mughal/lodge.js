// The lodges of the Taj garden (docs/settlements/mughal-agra.md §13b): the small one-room buildings of the people who kept the
// charbagh — the gardeners' (mali) lodge, the store of tools and watering pots, the watchman's post (chowki) and the thatched
// hut of the day-labourers — each on a plinth level with the raised walk it opens on, its door on the walk, a lamp alight inside,
// the room furnished for its use. Four designs: plastered white with a flat parapeted roof and a verandah on two timber posts;
// ochre and taller with a wide double door; red sandstone with a white marble band under a small white dome; mud-walled under a
// hipped thatch roof on posts. Built in the local frame of townhouse.js `frameOf` (front at z = 0 facing +z, on the walk; body behind).

import { box, lathe, place, rod, frustum } from '../../core/geom.js';
import * as F from './furnish.js';
import { frameOf } from './townhouse.js';

const PI = Math.PI;
export const LODGE_KINDS = {
  mali: { wall: 'lime_plaster', trim: 'sandstone_red', H: 3.2, door: 1.1, roof: 'flat' },
  store: { wall: 'stucco_ochre', trim: 'sandstone_red', H: 3.9, door: 1.9, roof: 'flat' },
  chowki: { wall: 'sandstone_red', trim: 'marble_smooth', H: 3.5, door: 1.15, roof: 'dome' },
  hut: { wall: 'earth_wall', trim: 'timber', H: 2.7, door: 1.2, roof: 'thatch' },
};
export const LODGE_PD = 1.4;                                     // the verandah's depth

export function gardenLodge(el, { bag, col, lights }) {
  const f = frameOf(el.rect, el.front ?? 'w'), W = f.W, D = f.D, hw = W / 2, K = LODGE_KINDS[el.kind ?? 'mali'], y = el.y ?? 0.55;
  const B = { add: (m, g) => bag.add(m, place(g, f.ox, 0, f.oz, f.yaw)) };
  const C = { rect: (r, y0, y1) => col.rect(f.rect(r), y0, y1), floor: (r, yy) => col.floor(f.rect(r), yy), circle: (x, z, r, y0, y1) => { const [wx, wz] = f.pt(x, z); col.circle(wx, wz, r, y0, y1); } };
  const T = 0.38, H = K.H, PD = LODGE_PD, zf = -PD, zb = -D, yt = y + H, FY = y + 0.04, X0 = -hw + T, X1 = hw - T, Z0 = zb + T, Z1 = zf - T;
  const seed = el.seed | 0, sg = seed % 2 ? 1 : -1;
  const wall = (x0, z0, x1, z1, y0, y1, m = K.wall) => { B.add(m, box(x0, y0, z0, x1, y1, z1)); C.rect([x0, z0, x1, z1], y0, y1); };
  const lamp = (x, yy, z, glow = 1.4) => { F.oilLamp(B, null, x, yy, z, 'bronze', 0); const [wx, wz] = f.pt(x, z); lights?.push({ at: [wx, yy + 0.12, wz], color: '#ffb060', intensity: glow, distance: 5 }); };
  // ── the plinth, level with the walk, and the floor of the room ──
  B.add('sandstone_red', box(-hw, -0.3, zb, hw, y, 0)); C.rect([-hw, zb, hw, 0], -0.3, y); C.floor([-hw, zb, hw, 0], y);
  B.add(K.roof === 'thatch' ? 'mud_plaster' : 'lime_plaster', box(X0, y, Z0, X1, FY, Z1));
  // ── the walls: the front with the door (and a lattice window beside it), the sides, the back ──
  const dx = sg * 1.35, dw = K.door, dh = el.kind === 'store' ? 2.8 : 2.35;
  const wx = -sg * 1.9;
  const holes = [[dx - dw / 2, dx + dw / 2, 0, dh]];
  if (el.kind !== 'store') holes.push([wx - 0.45, wx + 0.45, 1.25, 2.25]);
  holes.sort((a, b) => a[0] - b[0]);
  { let x = -hw; const zA = zf - T;
    for (const [a, b, bb, tt] of holes) {
      if (a - x > 0.01) wall(x, zA, a, zf, y, yt); if (bb > 0) wall(a, zA, b, zf, y, y + bb); wall(a, zA, b, zf, y + tt, yt); x = b;
    }
    if (hw - x > 0.01) wall(x, zA, hw, zf, y, yt);
    if (el.kind !== 'store') { B.add('lattice', box(wx - 0.4, y + 1.3, zA + 0.14, wx + 0.4, y + 2.2, zA + 0.2)); B.add(K.trim, box(wx - 0.5, y + 1.17, zf - 0.02, wx + 0.5, y + 1.25, zf + 0.12)); B.add(K.trim, box(wx - 0.5, y + 2.25, zf - 0.02, wx + 0.5, y + 2.33, zf + 0.08)); }
    // the door's frame in the trim stone and a lintel
    B.add(K.trim, box(dx - dw / 2 - 0.1, y, zf - 0.02, dx - dw / 2, y + dh, zf + 0.1)); B.add(K.trim, box(dx + dw / 2, y, zf - 0.02, dx + dw / 2 + 0.1, y + dh, zf + 0.1)); B.add(K.trim, box(dx - dw / 2 - 0.14, y + dh, zf - 0.02, dx + dw / 2 + 0.14, y + dh + 0.2, zf + 0.12));
    // the leaves of the door swung back against the front, inside the reveal
    for (const s of [-1, 1]) B.add('wood_dark', box(dx + s * (dw / 2 - 0.04) - 0.03 * 0 - (s < 0 ? -0.0 : 0.05), y + 0.05, zf - 0.42, dx + s * (dw / 2 - 0.04) + (s < 0 ? 0.05 : 0.0), y + dh - 0.05, zf - 0.02 + 0.0)); }
  wall(-hw, zb, -hw + T, zf, y, yt); wall(hw - T, zb, hw, zf, y, yt); wall(-hw + T, zb, hw - T, zb + T, y, yt);
  for (const s of [-1, 1]) if (el.kind === 'mali' || el.kind === 'chowki') B.add('lattice', box(s * (hw - 0.02) - 0.03, y + 1.4, (zb + zf) / 2 - 0.4, s * (hw - 0.02) + 0.03, y + 2.3, (zb + zf) / 2 + 0.4));
  // wall washes weather: damp at the foot, plaster fallen in a patch or two
  for (const s of [-1, 1]) B.add('plaster_damp', box(s * hw - (s > 0 ? 0.02 : -0.0) - 0.0, y, zb + 0.4, s * hw + (s > 0 ? 0.02 : -0.02) + 0.0, y + 0.55, zf - 0.2));
  if (K.wall !== 'earth_wall') { B.add('brick', box(-hw + 0.6, y + 0.9, zf + 0.0, -hw + 1.2, y + 1.45, zf + 0.02)); B.add('plaster_damp', box(-hw + T, y, zf, hw - T, y + 0.5, zf + 0.03)); }
  if (el.kind === 'chowki') B.add('marble_smooth', box(-hw - 0.03, y + 0.9, zb, hw + 0.03, y + 1.05, zf + 0.04));
  // ── the verandah: two posts on the plinth under a beam, the roof carried out over them ──
  const post = (x) => { B.add(K.roof === 'thatch' ? 'timber' : 'wood_dark', lathe([[0.15, 0], [0.11, 0.12], [0.09, 0.5], [0.09, H - 1.0], [0.14, H - 0.8], [0.17, H - 0.62], [0.17, H - 0.3]], 8, null, x, y, -0.3)); C.circle(x, -0.3, 0.18, y, y + H); };
  post(-hw + 0.6); post(hw - 0.6); if (W > 5.5) post(0);
  B.add('wood_dark', box(-hw + 0.1, yt - 0.5, -0.5, hw - 0.1, yt - 0.18, -0.1));
  // ── the roof ──
  if (K.roof === 'thatch') {
    B.add('thatch', frustum([-hw - 0.55, zb - 0.55, hw + 0.55, 0.45], yt, yt + 1.5, 1.7, 1.7, (D + 1.0) / 2 - 0.1, (D + 1.0) / 2 - 0.1));
    for (let x = -hw + 0.2; x < hw; x += 0.9) B.add('thatch', box(x - 0.05, yt + 1.5 - 0.02, zb + D / 2 - 0.3, x + 0.07, yt + 1.7, zb + D / 2 + 0.3 - 0.4));
    B.add('timber', box(-hw - 0.3, yt - 0.08, zb - 0.3, hw + 0.3, yt, 0.3));
    for (let x = -hw + 0.3; x < hw; x += 1.1) B.add('wood_dark', box(x - 0.05, yt - 0.3, zb + T, x + 0.05, yt - 0.08, zf - T));   // the rafters under the thatch seen from within
    // a cloth awning of stripes before the hut, sloping from the beam over the walk's edge
    const cs = ['cloth_red', 'cloth_white'];
    for (let k = 0, x = -hw + 0.3; x < hw - 0.5; x += 0.55, k++) B.add(cs[k % 2], box(x, yt - 0.62 - 0.02, -0.5, x + 0.55, yt - 0.58, 0.5));
  } else {
    B.add(K.wall === 'sandstone_red' ? 'stucco_warm' : K.wall, box(-hw - 0.1, yt, zb - 0.1, hw + 0.1, yt + 0.25, 0.25)); C.rect([-hw - 0.1, zb - 0.1, hw + 0.1, 0.25], yt, yt + 0.25); C.floor([-hw - 0.1, zb - 0.1, hw + 0.1, 0.25], yt + 0.25);
    const pt = 0.26, ph = 0.8, py = yt + 0.25;
    B.add(K.wall, box(-hw - 0.1, py, zb - 0.1, hw + 0.1, py + ph, zb - 0.1 + pt)); B.add(K.wall, box(-hw - 0.1, py, zb - 0.1 + pt, -hw - 0.1 + pt, py + ph, 0.25)); B.add(K.wall, box(hw + 0.1 - pt, py, zb - 0.1 + pt, hw + 0.1, py + ph, 0.25)); B.add(K.wall, box(-hw - 0.1, py, 0.25 - pt, hw + 0.1, py + ph, 0.25));
    B.add(K.trim, box(-hw - 0.16, py + ph, zb - 0.16, hw + 0.16, py + ph + 0.08, 0.31));
    for (let x = -hw + 0.4; x < hw - 0.2; x += 0.85) B.add(K.trim === 'marble_smooth' ? 'marble_smooth' : K.trim, box(x - 0.22, py + ph + 0.08, 0.25 - pt, x + 0.22, py + ph + 0.5, 0.25));
    for (let x = -hw + 0.4; x < hw - 0.2; x += 0.85) B.add(K.trim, box(x - 0.2, py + ph + 0.08, zb - 0.1, x + 0.2, py + ph + 0.46, zb - 0.1 + pt));
    // a chhajja over the door on two brackets
    B.add(K.trim, box(dx - dw / 2 - 0.4, y + dh + 0.2, zf - 0.02, dx + dw / 2 + 0.4, y + dh + 0.32, zf + 0.7));
    for (const s of [-1, 1]) B.add(K.trim, box(dx + s * (dw / 2 + 0.2) - 0.05, y + dh - 0.2, zf, dx + s * (dw / 2 + 0.2) + 0.05, y + dh + 0.2, zf + 0.45));
    if (K.roof === 'dome') {
      // the small white dome on its drum, its lotus finial: the watchman's post is a kiosk on the roof of the room
      const cz = (zb + zf) / 2 - 0.2;
      B.add('marble_smooth', lathe([[1.55, 0], [1.55, 0.5], [1.45, 0.58], [1.38, 0.8], [1.2, 1.05], [0.86, 1.4], [0.5, 1.75], [0.18, 2.0], [0.001, 2.1]], 20, null, 0, py + ph + 0.1, cz));
      B.add('gilt_bronze', lathe([[0.001, 0], [0.06, 0.02], [0.05, 0.3], [0.001, 0.5]], 8, null, 0, py + ph + 2.15, cz));
    }
  }
  // ── the room's furnishing and its lamp alight ──
  if (el.kind === 'mali') {
    // the gardener's charpoy with its quilt, the hookah by it, the tools leaning on the back wall, baskets of marigold, water jars
    F.charpoy(B, null, X1 - 0.75, FY, Z0 + 1.15, PI / 2, { quilt: ['cloth_red', 'cloth_indigo'][seed % 2] }); C.circle(X1 - 0.75, Z0 + 1.15, 0.85, FY, FY + 0.45);
    F.hookah(B, X1 - 1.7, FY, Z0 + 0.55, 0.3);
    for (let i = 0; i < 4; i++) { const x = X0 + 0.45 + i * 0.28; B.add('timber', rod([x, FY, Z0 + 0.05], [x + 0.05, FY + 1.75 - (i % 2) * 0.2, Z0 + 0.03], 0.016, 5)); B.add('iron', box(x - 0.1, FY + (i % 2 ? 0.0 : 0.02), Z0 + 0.03, x + 0.1, FY + 0.22, Z0 + 0.06)); }
    for (let i = 0; i < 3; i++) { const x = X0 + 0.6 + i * 0.62, z = Z0 + 1.05; B.add('wicker', lathe([[0.001, 0], [0.27, 0], [0.34, 0.28], [0.001, 0.28]], 8, null, x, FY, z)); B.add(['cloth_ochre', 'cloth_red', 'cloth_white'][i], lathe([[0.001, 0.2], [0.3, 0.2], [0.3, 0.38], [0.001, 0.46]], 8, null, x, FY, z)); C.circle(x, z, 0.32, FY, FY + 0.45); }
    F.waterJar(B, X0 + 0.45, FY, Z1 - 0.5, 0.85); F.waterJar(B, X0 + 1.15, FY, Z1 - 0.45, 0.7); F.waterJar(B, X0 + 1.8, FY, Z1 - 0.5, 0.75, 'glaze_green');
    B.add(K.trim, box(-0.3, FY + 1.3, Z0, 0.3, FY + 1.36, Z0 + 0.2)); lamp(0, FY + 1.36, Z0 + 0.11);
  } else if (el.kind === 'store') {
    // shelves of plain clay pots and the watering pots along the back wall, ladders and baskets of cuttings, bales of manure-cloth and sacks of seed
    for (let t = 0; t < 3; t++) { B.add('wood_dark', box(X0 + 0.05, FY + 0.45 + t * 0.62, Z0, X1 - 0.05, FY + 0.5 + t * 0.62, Z0 + 0.5)); }
    for (const x of [X0 + 0.05, X1 - 0.07]) B.add('wood_dark', box(x, FY, Z0, x + 0.04, FY + 2.0, Z0 + 0.04));
    for (let t = 0; t < 3; t++) for (let i = 0; i < 4; i++) F.pots(B, X0 + 0.6 + i * 1.25, FY + 0.5 + t * 0.62, Z0 + 0.25, 0, 3, t === 1 ? ['terracotta', 'glaze_green', 'terracotta'] : ['terracotta', 'terracotta', 'glaze_blue']);
    for (let i = 0; i < 5; i++) F.waterJar(B, X1 - 0.5, FY, Z0 + 0.9 + i * 0.5, 0.8 - (i % 2) * 0.08);
    for (const x of [X0 + 0.3, X0 + 0.8]) B.add('timber', rod([x, FY, Z1 - 0.2], [x, FY + 2.7, Z1 - 0.25], 0.03, 5)); for (let k = 0; k < 7; k++) B.add('timber', rod([X0 + 0.3, FY + 0.3 + k * 0.38, Z1 - 0.21], [X0 + 0.8, FY + 0.3 + k * 0.38, Z1 - 0.23], 0.014, 4));
    F.bale(B, X0 + 1.9, FY, Z1 - 0.5, 0.9, 0.5, 0.6, 0, 'sacking'); F.bale(B, X0 + 2.9, FY, Z1 - 0.45, 0.8, 0.45, 0.6, 0.2, 'cloth_white');
    for (let i = 0; i < 3; i++) { const x = X0 + 0.8 + i * 0.7, z = Z0 + 1.5; B.add('wicker', lathe([[0.001, 0], [0.26, 0], [0.32, 0.3], [0.001, 0.3]], 8, null, x, FY, z)); B.add('cloth_green', lathe([[0.001, 0.25], [0.27, 0.25], [0.2, 0.5], [0.001, 0.6]], 8, null, x, FY, z)); }
    B.add('wood_dark', rod([0.4, yt - 0.02, (Z0 + Z1) / 2], [0.4, yt - 0.8, (Z0 + Z1) / 2], 0.01, 4)); B.add('lamp_glass', box(0.3, yt - 1.2, (Z0 + Z1) / 2 - 0.1, 0.5, yt - 0.8, (Z0 + Z1) / 2 + 0.1));
    lights?.push({ at: [...f.pt(0.4, (Z0 + Z1) / 2).slice(0, 1), yt - 1.1, f.pt(0.4, (Z0 + Z1) / 2)[1]], color: '#ffb060', intensity: 1.6, distance: 6 });
    F.oilLamp(B, null, X1 - 0.3, FY + 1.3, Z0 + 0.12, 'bronze', 0);
  } else if (el.kind === 'chowki') {
    // the watchman's charpoy and hookah, the spears and the staves in a rack, a drum for the hours, his water jar and a cup
    F.charpoy(B, null, X0 + 0.75, FY, Z0 + 1.15, PI / 2, { quilt: 'cloth_maroon' }); C.circle(X0 + 0.75, Z0 + 1.15, 0.85, FY, FY + 0.45);
    F.hookah(B, X0 + 1.7, FY, Z0 + 0.55, 0.3);
    B.add('wood_dark', box(X1 - 1.2, FY + 0.9, Z0, X1 - 0.1, FY + 0.95, Z0 + 0.1)); B.add('wood_dark', box(X1 - 1.2, FY + 0.15, Z0, X1 - 0.1, FY + 0.2, Z0 + 0.1));
    for (let i = 0; i < 4; i++) { const x = X1 - 1.05 + i * 0.28; B.add('timber', rod([x, FY, Z0 + 0.12], [x, FY + 2.1, Z0 + 0.12], 0.018, 5)); B.add('iron', rod([x, FY + 2.1, Z0 + 0.12], [x, FY + 2.3, Z0 + 0.12], 0.012, 4)); }
    B.add('hide_brown', lathe([[0.001, 0], [0.3, 0.02], [0.4, 0.3], [0.3, 0.55], [0.001, 0.57]], 12, null, X1 - 0.7, FY, Z1 - 0.8)); B.add('wood_dark', box(X1 - 1.15, FY, Z1 - 1.25, X1 - 0.25, FY + 0.02, Z1 - 0.35)); C.circle(X1 - 0.7, Z1 - 0.8, 0.42, FY, FY + 0.6);
    F.waterJar(B, X0 + 0.45, FY, Z1 - 0.5, 0.85);
    B.add(K.trim, box(-0.3, FY + 1.3, Z0, 0.3, FY + 1.36, Z0 + 0.2)); lamp(0, FY + 1.36, Z0 + 0.11);
  } else {
    // the labourers' hut: the clay stove (chulha) with its pot, the charpoy, bedding rolled, jars, a bunch of drying herbs and a hung lamp
    B.add('earth_wall', box(X1 - 1.3, FY, Z0 + 0.1, X1 - 0.2, FY + 0.4, Z0 + 0.9)); C.rect([X1 - 1.3, Z0 + 0.1, X1 - 0.2, Z0 + 0.9], FY, FY + 0.4);
    B.add('flame', box(X1 - 0.95, FY + 0.4, Z0 + 0.35, X1 - 0.75, FY + 0.47, Z0 + 0.55)); B.add('iron', lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.14], [0.2, 0.24], [0.001, 0.24]], 10, null, X1 - 0.75, FY + 0.4, Z0 + 0.5));
    F.charpoy(B, null, X0 + 0.75, FY, Z0 + 1.15, PI / 2, { quilt: 'cloth_ochre' }); C.circle(X0 + 0.75, Z0 + 1.15, 0.85, FY, FY + 0.45);
    F.bale(B, X0 + 0.55, FY, Z1 - 0.55, 0.9, 0.35, 0.55, 0.1, 'cloth_white');
    F.waterJar(B, X1 - 0.45, FY, Z1 - 0.5, 0.85); F.waterJar(B, X1 - 1.1, FY, Z1 - 0.45, 0.7);
    for (let k = 0; k < 4; k++) B.add('cloth_green', rod([-0.5 + k * 0.28, yt - 0.3, Z0 + 0.15], [-0.5 + k * 0.28, yt - 0.9, Z0 + 0.15], 0.03, 4));
    B.add('wood_dark', rod([0.9, yt - 0.02, (Z0 + Z1) / 2], [0.9, yt - 0.7, (Z0 + Z1) / 2], 0.01, 4)); B.add('lamp_glass', box(0.82, yt - 1.05, (Z0 + Z1) / 2 - 0.08, 0.98, yt - 0.7, (Z0 + Z1) / 2 + 0.08));
    { const [wx2, wz2] = f.pt(0.9, (Z0 + Z1) / 2); lights?.push({ at: [wx2, yt - 0.95, wz2], color: '#ffb060', intensity: 1.4, distance: 5 }); }
  }
  void rod;
}
