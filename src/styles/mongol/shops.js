// The shops of Karakorum's streets (docs/settlements/mongol-karakorum.md §3, §11): rows of bays of sun-dried brick with flat roofs, each bay a shop you
// can walk into — a counter at the front with a way in beside it, the stock on shelves and the floor, a beam under the lintel with hanging goods, a
// name board and a blade sign of the trade, a paper lantern, an awning in the wind — of eight trades (cloth, carpets and felts, saddlery, spices
// and dried fruit, pottery, metalwork, food, wine and kumiss). { a: [x, z] the min corner, n bays, w, d, face ('s'|'n'|'e'|'w': which way the fronts look), seed }
import { addCloth, clothBox } from '../../core/geom.js';
import { rng } from './util.js';
import { Local, frontFrame } from './local.js';

const TRADES = ['cloth', 'carpet', 'saddler', 'spice', 'pots', 'metal', 'food', 'wine'];
const BOLT = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_indigo'];

const bu0 = (u) => u + 0.3;
function stock(L, trade, ua, ub, d, rand, side) {
  const pk = (a) => a[Math.floor(rand() * a.length)], bz = -d + 0.4, y0 = 0.03, mid = (ua + ub) / 2;
  const shelf = (y) => { L.box('timber', ua + 0.25, bz, ub - 0.25, bz + 0.5, y, y + 0.05); };
  // the shelves at the back, stocked
  for (const y of [1.15, 1.85]) shelf(y);
  L.box('timber', ua + 0.25, bz, ua + 0.32, bz + 0.5, y0, 2.0); L.box('timber', ub - 0.32, bz, ub - 0.25, bz + 0.5, y0, 2.0);
  const nk = 5, span = ub - ua - 0.7;
  if (trade === 'cloth') {
    for (const y of [1.2, 1.9]) for (let k = 0; k < nk; k++) L.box(pk(BOLT), ua + 0.35 + k * span / nk, bz + 0.05, ua + 0.35 + (k + 0.85) * span / nk, bz + 0.45, y, y + 0.34);
    for (let k = 0; k < 3; k++) L.box(pk(BOLT), mid - 0.9 + k * 0.6, -d * 0.55 - 0.25, mid - 0.4 + k * 0.6, -d * 0.55 + 0.25, y0, y0 + 0.5 + (k % 2) * 0.25, true);
    for (let k = 0; k < 4; k++) L.box(pk(BOLT), ua + 0.5 + k * 0.7, -0.15 - 0.0, ua + 0.5 + k * 0.7 + 0.5, -0.1, 2.05 - (k % 2) * 0.12, 2.55);
  } else if (trade === 'carpet') {
    for (let k = 0; k < 6; k++) L.rod(pk(BOLT), [ua + 0.45 + k * span / 6, y0, bz + 0.25], [ua + 0.5 + k * span / 6, y0 + 1.5, bz + 0.2], 0.11, 6);
    L.box(pk(BOLT), mid - 1.0, -d * 0.55 - 0.7, mid + 1.0, -d * 0.55 + 0.7, y0, y0 + 0.02);
    L.box(pk(BOLT), mid - 0.8, -d * 0.55 - 0.5, mid + 0.8, -d * 0.55 + 0.5, y0 + 0.02, y0 + 0.04);
    L.box('cloth_red', ua + 0.3, -0.2, ub - 0.3, -0.16, 2.0, 2.6); L.box('cloth_blue', ua + 0.45, -0.16, ub - 0.45, -0.14, 2.1, 2.5); L.box('gilt_bronze', ua + 0.6, -0.14, ub - 0.6, -0.13, 2.25, 2.3); L.box('cloth_green', bu0(ua), bz + 0.02, bu0(ua) + 0.9, bz + 0.05, 1.0, 2.6);
    for (let k = 0; k < 3; k++) L.box('cloth_white', mid - 0.6 + k * 0.5, -d * 0.55 - 1.4, mid - 0.2 + k * 0.5, -d * 0.55 - 1.0, y0, y0 + 0.5 + k * 0.1);
  } else if (trade === 'saddler') {
    for (let k = 0; k < 2; k++) {
      const su = ua + 0.7 + k * 1.1;
      L.box('wood_dark', su, bz + 0.1, su + 0.12, bz + 0.2, y0, 1.0); L.box('wood_dark', su + 0.7, bz + 0.1, su + 0.82, bz + 0.2, y0, 1.0);
      L.box('hide_brown', su - 0.05, bz + 0.0, su + 0.9, bz + 0.5, 1.0, 1.12); L.box('hide_black', su + 0.05, bz + 0.05, su + 0.25, bz + 0.45, 1.12, 1.4); L.box('hide_black', su + 0.65, bz + 0.05, su + 0.85, bz + 0.45, 1.12, 1.4);
      L.box('gilt_bronze', su + 0.1, bz + 0.02, su + 0.2, bz + 0.48, 1.4, 1.43);
    }
    for (let k = 0; k < 4; k++) L.rod('hide_tan', [ua + 0.5 + k * 0.7, 2.4, -0.3], [ua + 0.5 + k * 0.7, 1.4, -0.3], 0.02, 4);
    for (let k = 0; k < 3; k++) L.box('hide_tan', mid - 0.9 + k * 0.7, -d * 0.55 - 0.3, mid - 0.3 + k * 0.7, -d * 0.55 + 0.3, y0, y0 + 0.3 + k * 0.1, true);
    L.lathe('iron', [[0.001, 0], [0.1, 0.0], [0.04, 0.2], [0.001, 0.2]], 6, ub - 0.7, -d * 0.55, y0);
  } else if (trade === 'spice') {
    for (let k = 0; k < 4; k++) L.lathe('sacking', [[0.001, 0], [0.26, 0.02], [0.3, 0.2], [0.22, 0.4], [0.001, 0.44]], 8, ua + 0.6 + k * 0.7, -d * 0.55, y0);
    for (const y of [1.2, 1.9]) for (let k = 0; k < nk; k++) L.lathe(pk(['glaze_white', 'glaze_green', 'glaze_blue']), [[0.001, 0], [0.1, 0.02], [0.12, 0.14], [0.07, 0.22], [0.001, 0.22]], 8, ua + 0.5 + k * span / nk, bz + 0.25, y + 0.05);
    for (let k = 0; k < 3; k++) L.lathe(pk(['cloth_ochre', 'cloth_red', 'cloth_maroon']), [[0.2, 0], [0.16, 0.12], [0.001, 0.24]], 8, ua + 0.8 + k * 0.5, -0.9, 0.95);
    L.circle(ua + 0.6, -d * 0.55, 0.3, 0, 0.45); L.circle(ua + 1.3, -d * 0.55, 0.3, 0, 0.45);
  } else if (trade === 'pots') {
    for (const y of [1.2, 1.9]) for (let k = 0; k < nk; k++) L.lathe(pk(['glaze_blue', 'glaze_green', 'terracotta', 'glaze_white']), [[0.001, 0], [0.1, 0.03], [0.14, 0.16], [0.08, 0.28], [0.09, 0.32], [0.001, 0.32]], 8, ua + 0.5 + k * span / nk, bz + 0.25, y + 0.05);
    for (let k = 0; k < 5; k++) { L.lathe(pk(['terracotta', 'pottery_dark', 'glaze_green']), [[0.1, 0], [0.24, 0.1], [0.3, 0.3], [0.2, 0.5], [0.12, 0.56], [0.001, 0.56]], 8, ua + 0.6 + k * 0.55, -d * 0.55 + (k % 2) * 0.5, y0); }
    L.circle(mid, -d * 0.55 + 0.25, 1.4, 0, 0.5);
  } else if (trade === 'metal') {
    for (const y of [1.2, 1.9]) for (let k = 0; k < nk; k++) L.lathe(pk(['silver', 'bronze', 'gilt_bronze']), [[0.001, 0], [0.1, 0.0], [0.07, 0.1], [0.12, 0.2], [0.001, 0.2]], 8, ua + 0.5 + k * span / nk, bz + 0.25, y + 0.05);
    L.box('wood_dark', mid - 0.6, -d * 0.55 - 0.4, mid + 0.6, -d * 0.55 + 0.4, y0, 0.75, true); L.box('iron', mid - 0.2, -d * 0.55 - 0.15, mid + 0.2, -d * 0.55 + 0.15, 0.75, 0.9);
    for (let k = 0; k < 4; k++) L.rod('bronze', [ua + 0.5 + k * 0.7, 2.6, -0.3], [ua + 0.5 + k * 0.7, 2.0, -0.3], 0.02, 4), L.lathe('bronze', [[0.001, 0], [0.12, 0.0], [0.1, 0.1], [0.001, 0.14]], 8, ua + 0.5 + k * 0.7, -0.3, 1.88);
  } else if (trade === 'food') {
    for (let k = 0; k < 4; k++) L.lathe('wicker', [[0.2, 0], [0.26, 0.1], [0.28, 0.22], [0.001, 0.22]], 8, ua + 0.6 + k * 0.7, -d * 0.55, y0);
    for (const y of [1.2, 1.9]) for (let k = 0; k < nk; k++) L.lathe(pk(['cloth_white', 'cloth_ochre', 'hide_tan']), [[0.001, 0], [0.12, 0.01], [0.13, 0.08], [0.001, 0.1]], 8, ua + 0.5 + k * span / nk, bz + 0.25, y + 0.05);
    for (let k = 0; k < 6; k++) L.lathe('cloth_white', [[0.001, 0], [0.07, 0.0], [0.07, 0.07], [0.001, 0.08]], 6, ua + 0.6 + k * 0.4, -0.55, 0.96);
    for (let k = 0; k < 5; k++) L.rod('cloth_white', [ua + 0.5 + k * 0.5, 2.5, -0.35], [ua + 0.5 + k * 0.5, 2.0, -0.35], 0.05, 5);
  } else {
    for (let k = 0; k < 4; k++) L.lathe('wood_dark', [[0.001, 0], [0.3, 0.02], [0.36, 0.2], [0.34, 0.5], [0.28, 0.6], [0.001, 0.6]], 9, ua + 0.65 + k * 0.7, bz + 0.45, y0);
    for (let k = 0; k < 3; k++) L.lathe('hide_tan', [[0.001, 0], [0.2, 0.04], [0.28, 0.24], [0.18, 0.46], [0.08, 0.54], [0.001, 0.54]], 8, ua + 0.7 + k * 0.8, -d * 0.55, y0);
    for (let k = 0; k < 4; k++) L.lathe('silver', [[0.001, 0], [0.07, 0.02], [0.09, 0.1], [0.001, 0.1]], 8, ua + 0.5 + k * 0.5, -0.55, 0.96);
    L.circle(ua + 0.7, -d * 0.55, 0.3, 0, 0.55); L.circle(ua + 1.5, -d * 0.55, 0.3, 0, 0.55);
  }
  void side;
}

export function shopRow(el, { bag, col, lights }) {
  const n = el.n ?? 4, w = el.w ?? 3.6, d = el.d ?? 5.0, rand = rng(el.seed || 9), face = el.face ?? 's', H = 3.3, T = 0.4;
  const r0 = face === 's' || face === 'n' ? [el.a[0], el.a[1], el.a[0] + n * w, el.a[1] + d] : [el.a[0], el.a[1], el.a[0] + d, el.a[1] + n * w];
  const F = frontFrame(r0, face), L = new Local(bag, col, lights, F.O, F.U, F.V);
  const awn = ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon'];
  const trades = TRADES.slice().sort(() => rand() - 0.5);
  // the shell: the back wall, the party walls (a doorway through between neighbours in some), the roof of poplar poles under earth
  L.wall('mudbrick', 0, -d + T / 2, n * w, -d + T / 2, T, 0, H);
  for (let i = 0; i <= n; i++) L.wall(i % 3 === 1 && i < n && i > 0 ? 'mud_plaster' : 'mudbrick', i * w, 0, i * w, -d, 0.4, 0, H, (i > 0 && i < n && rand() < 0.3) ? [{ at: d * 0.6, w: 0.9, h: 2.0 }] : []);
  L.box('mud_plaster', 0, 0.05, n * w, -d - 0.05, H, H + 0.14);
  L.box('mud_plaster', 0, 0.05, n * w, -0.3, H + 0.14, H + 0.8);
  L.box('mud_plaster', 0, -d + 0.3, n * w, -d - 0.05, H + 0.14, H + 0.8);
  L.box('mud_plaster', -0.05, 0.05, 0.3, -d, H + 0.14, H + 0.8); L.box('mud_plaster', n * w - 0.3, 0.05, n * w + 0.05, -d, H + 0.14, H + 0.8);
  // the front beam over the whole row, with the beam ends of the roof poles, the fascia
  L.box('wood_dark', -0.1, 0.12, n * w + 0.1, -0.2, 2.62, H);
  for (let u = 0.4; u < n * w; u += 0.6) L.rod('cedar', [u, H - 0.25, 0.0], [u, H - 0.25, 0.4], 0.06, 5);
  // the floor, the weathering of the front: the base band, patches and a streaked top
  L.box('mud_plaster', 0, -d, n * w, 0.0, -0.2, 0.03); L.floor(0.2, -d + 0.3, n * w - 0.2, -0.1, 0.03);
  L.box('mudbrick', 0, 0.03, n * w, 0.0, 0, 0.35);
  for (let k = 0; k < n; k++) { const u = rand() * (n * w - 1), y = 0.4 + rand() * 1.8; L.box('mudbrick', u, 0.03, u + 0.4 + rand() * 0.8, 0.0, y, y + 0.3 + rand() * 0.5); }
  for (let i = 0; i < n; i++) {
    const ua = i * w + 0.2, ub = (i + 1) * w - 0.2, mid = (ua + ub) / 2, trade = trades[i % trades.length], left = (i + Math.floor(rand() * 2)) % 2 === 0;
    stock(L, trade, ua, ub, d, rand, left);
    // the counter at the front on one side, the way in beside it: cloth over it, scales or goods on it
    const cu0 = left ? ua : ub - 1.5, cu1 = cu0 + 1.5;
    L.box('timber', cu0, -0.2, cu1, -0.85, 0.03, 0.95, true); L.box('cloth_ochre', cu0 - 0.02, -0.18, cu1 + 0.02, -0.87, 0.93, 0.97);
    L.box('wood_dark', cu0, -0.2, cu1, -0.85, 0.97, 1.0);
    for (let k = 0; k < 3; k++) L.lathe(BOLT[Math.floor(rand() * BOLT.length)], [[0.001, 0], [0.12, 0.02], [0.14, 0.12], [0.08, 0.22], [0.001, 0.23]], 8, cu0 + 0.35 + k * 0.4, -0.5, 1.0);
    // the name board over the opening (dark with a painted band) and the blade sign hung on its bracket at the party wall
    L.box('wood_dark', ua + 0.05, 0.14, ub - 0.05, 0.1, 2.85, 3.2); L.box(awn[(i + 2) % awn.length], ua + 0.2, 0.15, ub - 0.2, 0.14, 2.95, 3.1);
    L.box('gilt_bronze', mid - 0.35, 0.16, mid + 0.35, 0.15, 3.0, 3.05);
    const bu = left ? ub + 0.05 : ua - 0.05;
    L.rod('iron', [bu, 2.7, 0.1], [bu, 2.7, 0.9], 0.02, 4); L.box(awn[(i + 4) % awn.length], bu - 0.02, 0.9, bu + 0.02, 0.5, 1.7, 2.6);
    L.lathe('gilt_bronze', [[0.001, 0], [0.09, 0.0], [0.09, 0.02], [0.001, 0.02]], 8, bu, 0.5, 2.3);
    // the paper lantern from the beam
    { const lu = left ? ub - 0.3 : ua + 0.3; L.rod('iron', [lu, 2.6, 0.3], [lu, 2.2, 0.3], 0.008, 3); L.lathe('lamp_paper', [[0.001, 0], [0.15, 0.1], [0.15, 0.3], [0.001, 0.4]], 8, lu, 0.3, 1.85); }
    // the awning of cloth in the wind on two posts, sloping out from the fascia
    const am = awn[Math.floor(rand() * awn.length)];
    const p = L.P(ua - 0.05, 0.1), q = L.P(ub + 0.05, 1.8), xa = Math.min(p[0], q[0]), xb = Math.max(p[0], q[0]), za = Math.min(p[1], q[1]), zb = Math.max(p[1], q[1]);
    addCloth(bag, am, clothBox(xa, H - 0.55, za, xb, H - 0.48, zb, 0.35), H - 0.4);
    for (const u of [ua, ub]) { L.rod('timber', [u, 0, 1.8], [u, H - 0.45, 1.8], 0.05, 5); L.circle(u, 1.8, 0.06, 0, H); }
    // a trestle or a bale at the apron
    if (rand() < 0.5) { const su = left ? ub - 0.7 : ua + 0.7; L.box('timber', su - 0.5, 1.1, su + 0.5, 1.7, 0.0, 0.5, true); L.box(BOLT[Math.floor(rand() * BOLT.length)], su - 0.45, 1.15, su + 0.45, 1.65, 0.5, 0.6); }
  }
  // the weathered row's end: a slumped corner with rubble
  if (rand() < 0.5) L.lathe('mudbrick', [[0.9, 0], [0.6, 0.4], [0.3, 0.7], [0.001, 0.8]], 7, n * w + 0.7, -d * 0.3, 0);
  void lights;
}
