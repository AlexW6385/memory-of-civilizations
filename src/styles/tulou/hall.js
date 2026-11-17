// The ancestral hall in the court of the landmark (docs/settlements/hakka-tulou.md §4.1): a hall of
// three bays on a granite platform, open in front, closed by plaster walls on the sides and back, a
// tiled gable roof on red-brown posts; at the back the altar with the tablets, incense and candles.
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, fromTriangles, lathe, rod } from '../../core/geom.js';
import { hexa } from './geo.js';
import { jbox, rnd } from './detail.js';

/** A rectangular slab sloping in z: from zA (height yA) to zB (yB), x0…x1, thickness t. */
export function zslab(x0, x1, zA, yA, zB, yB, t) {
  return hexa([[x0, yA, zA], [x1, yA, zA], [x1, yB, zB], [x0, yB, zB]], [[x0, yA - t, zA], [x1, yA - t, zA], [x1, yB - t, zB], [x0, yB - t, zB]]);
}
export function tulouHall(el, { bag, col, lights }) {
  const [cx, cz] = el.c ?? [0, 0], PY = 0.35, hw = 7, zb = -5.5, zf = 5.5;
  const X = (x) => cx + x, Z = (z) => cz + z;
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(X(x0), y0, Z(z0), X(x1), y1, Z(z1)));
  // platform and the two steps up to it in the middle bay
  B('granite_block', -hw - 0.5, 0, zb - 0.5, hw + 0.5, PY, zf + 0.5);
  B('bluestone', -hw - 0.5, PY - 0.01, zb - 0.5, hw + 0.5, PY + 0.01, zf + 0.5);
  B('granite_block', -1.8, 0, zf + 0.5, 1.8, 0.175, zf + 0.95);
  B('granite_block', -1.8, 0, zf + 0.5, 1.8, PY * 0.5, zf + 0.7);
  col.floor([X(-hw - 0.5), Z(zb - 0.5), X(hw + 0.5), Z(zf + 0.5)], PY);
  col.ramp([X(-1.8), Z(zf + 0.5), X(1.8), Z(zf + 0.95)], 0.0, PY, 'n');
  col.rect([X(-hw - 0.5), Z(zf + 0.5), X(-1.85), Z(zf + 0.95)], 0, PY);
  col.rect([X(1.85), Z(zf + 0.5), X(hw + 0.5), Z(zf + 0.95)], 0, PY);
  // posts: front row and an inner row, on stone bases; beams across them
  const xs = [-6.3, -2.1, 2.1, 6.3];
  for (const z of [zf - 0.6, -0.4]) for (const x of xs) {
    B('granite_block', x - 0.3, PY, z - 0.3, x + 0.3, PY + 0.25, z + 0.3);
    B('timber_red', x - 0.2, PY + 0.25, z - 0.2, x + 0.2, 4.1, z + 0.2);
    col.circle(X(x), Z(z), 0.3, PY, 4.1);
  }
  for (const z of [zf - 0.6, -0.4]) B('timber_red', -6.7, 4.1, z - 0.18, 6.7, 4.55, z + 0.18);
  for (const x of xs) B('timber_red', x - 0.15, 4.1, -0.4, x + 0.15, 4.5, zf - 0.6);
  // the walls: back, and the sides from the back to just past the inner row
  B('plaster_white', -hw + 0.1, PY, zb, hw - 0.1, 4.2, zb + 0.4); col.rect([X(-hw), Z(zb), X(hw), Z(zb + 0.4)], PY, 4.2);
  for (const s of [-1, 1]) {
    const x0 = s > 0 ? hw - 0.5 : -hw + 0.1, x1 = s > 0 ? hw - 0.1 : -hw + 0.5;
    B('plaster_white', x0, PY, zb, x1, 4.2, 0.6); col.rect([X(x0), Z(zb), X(x1), Z(0.6)], PY, 4.2);
  }
  // the roof: two slopes from the ridge, deep eaves, barge boards; gable ends in plaster
  const ye = 4.4, yr = 6.4, ez = 7.0, ex = 7.9;
  bag.add('tile_grey', zslab(X(-ex), X(ex), Z(-ez), ye, Z(0), yr, 0.12));
  bag.add('tile_grey', zslab(X(-ex), X(ex), Z(ez), ye, Z(0), yr, 0.12));
  bag.add('timber', zslab(X(-ex), X(ex), Z(-ez), ye - 0.12, Z(0), yr - 0.12, 0.05));
  bag.add('timber', zslab(X(-ex), X(ex), Z(ez), ye - 0.12, Z(0), yr - 0.12, 0.05));
  B('tile_dark', -ex - 0.1, yr - 0.05, -0.3, ex + 0.1, yr + 0.3, 0.3);
  // the ridge's upturned ends (the Hakka hall's swallow-tail curl) and a gourd finial at the middle
  for (const sg of [-1, 1]) {
    B('tile_dark', sg > 0 ? ex - 0.5 : -ex - 0.2, yr + 0.25, -0.2, sg > 0 ? ex + 0.2 : -ex + 0.5, yr + 0.45, 0.2);
    B('tile_dark', sg > 0 ? ex - 0.1 : -ex - 0.45, yr + 0.45, -0.17, sg > 0 ? ex + 0.45 : -ex + 0.1, yr + 0.68, 0.17);
    B('tile_dark', sg > 0 ? ex + 0.2 : -ex - 0.7, yr + 0.68, -0.12, sg > 0 ? ex + 0.7 : -ex - 0.2, yr + 0.86, 0.12);
  }
  bag.add('tile_dark', lathe([[0.001, 0], [0.16, 0.02], [0.2, 0.14], [0.12, 0.28], [0.1, 0.4], [0.16, 0.52], [0.1, 0.66], [0.001, 0.72]], 10, null, X(0), yr + 0.3, Z(0)));
  // brackets (stacked blocks) carrying the tie-beams on every post, drum caps on the stone bases
  for (const z of [zf - 0.6, -0.4]) for (const x of xs) {
    B('timber_red', x - 0.38, 3.8, z - 0.14, x + 0.38, 4.1, z + 0.14); B('timber_red', x - 0.26, 3.55, z - 0.12, x + 0.26, 3.8, z + 0.12);
    B('gilt_bronze', x - 0.2, 4.1, z - 0.15, x + 0.2, 4.14, z + 0.15);
    bag.add('granite_block', lathe([[0.001, 0], [0.31, 0], [0.34, 0.04], [0.3, 0.18], [0.001, 0.18]], 12, null, X(x), PY + 0.25, Z(z)));
  }
  // rows of cover tiles on both slopes, the eave-end tiles, rafters under the eaves, lattice windows on the side walls
  for (const sz of [-1, 1]) for (let q = 0; q < 40; q++) {
    const x = -ex + 0.2 + q * (2 * ex - 0.4) / 39, w = 0.06, zs = (z) => ye + (yr - ye) * (ez - Math.abs(z)) / ez;
    const T = (z, ww, h, y0) => [[X(x - ww), y0 + h, Z(sz * z)], [X(x + ww), y0 + h, Z(sz * z)]];
    const z0 = ez - 0.3, z1 = 0.42, hh = 0.07 + (rnd(q, sz + 3) - 0.5) * 0.004;
    const top = [[X(x - w * 0.5), zs(z0) + hh, Z(sz * z0)], [X(x - w * 0.5), zs(z1) + hh, Z(sz * z1)], [X(x + w * 0.5), zs(z1) + hh, Z(sz * z1)], [X(x + w * 0.5), zs(z0) + hh, Z(sz * z0)]];
    const bot = [[X(x - w), zs(z0) - 0.012, Z(sz * z0)], [X(x - w), zs(z1) - 0.012, Z(sz * z1)], [X(x + w), zs(z1) - 0.012, Z(sz * z1)], [X(x + w), zs(z0) - 0.012, Z(sz * z0)]];
    bag.add('tile_dark', hexa(top, bot)); void T;
    // the tile end at the eave
    bag.add('tile_dark', hexa([[X(x - 0.04), ye + 0.07, Z(sz * (ez - 0.4))], [X(x + 0.04), ye + 0.07, Z(sz * (ez - 0.4))], [X(x + 0.04), ye + 0.0, Z(sz * (ez + 0.04))], [X(x - 0.04), ye + 0.0 + (rnd(q, 8) - 0.5) * 0.003, Z(sz * (ez + 0.04))]],
      [[X(x - 0.06), ye - 0.03, Z(sz * (ez - 0.4))], [X(x + 0.06), ye - 0.03, Z(sz * (ez - 0.4))], [X(x + 0.06), ye - 0.06, Z(sz * (ez + 0.04))], [X(x - 0.06), ye - 0.06, Z(sz * (ez + 0.04))]]));
    if (q % 2 === 0) bag.add('timber', hexa([[X(x - 0.04), ye - 0.2, Z(sz * (ez - 1.0))], [X(x + 0.04), ye - 0.2, Z(sz * (ez - 1.0))], [X(x + 0.04), ye - 0.2, Z(sz * (ez + 0.02))], [X(x - 0.04), ye - 0.2 + (rnd(q, 9) - 0.5) * 0.003, Z(sz * (ez + 0.02))]],
      [[X(x - 0.04), ye - 0.28, Z(sz * (ez - 1.0))], [X(x + 0.04), ye - 0.28, Z(sz * (ez - 1.0))], [X(x + 0.04), ye - 0.28, Z(sz * (ez + 0.02))], [X(x - 0.04), ye - 0.28, Z(sz * (ez + 0.02))]]));
  }
  for (const sx of [-1, 1]) for (const zc of [-3.3, -1.5]) {
    const xs = sx * (hw - 0.1), s0 = sx > 0 ? hw - 0.1 : -hw + 0.1;
    void xs;
    // a window in the plaster side wall: timber frame, lattice, a lime sill; stands 0.03 proud of the wall's outer face
    const xo = sx > 0 ? hw - 0.1 : -hw + 0.1;
    const side = sx > 0 ? 1 : -1;
    const fb = (x0, y0, z0, x1, y1, z1, sd, m) => bag.add(m, jbox(cx, cz, 0, Math.min(x0, x1), y0, z0, Math.max(x0, x1), y1, z1, 40 + sd + zc * 3));
    fb(xo, 1.55, zc - 0.55, xo + side * 0.04, 2.5, zc + 0.55, 1, 'lattice');
    for (const [y0, y1, a, b] of [[1.5, 1.57, zc - 0.62, zc + 0.62], [2.5, 2.57, zc - 0.62, zc + 0.62]]) fb(xo, y0, a, xo + side * 0.07, y1, b, 2 + Math.round(y0), 'timber');
    for (const zz of [zc - 0.62, zc + 0.55]) fb(xo, 1.5, zz, xo + side * 0.07, 2.57, zz + 0.07, 5 + Math.round(zz), 'timber');
    void s0;
  }
  // the offering table before the altar, its red cloth, fruit and cups, kneeling cushions on the floor
  B('timber_red', -1.1, PY, zb + 2.1, 1.1, PY + 0.85, zb + 2.75); B('cloth_red', -1.15, PY + 0.8, zb + 2.05, 1.15, PY + 0.88, zb + 2.8);
  col.rect([X(-1.1), Z(zb + 2.1), X(1.1), Z(zb + 2.75)], PY, PY + 0.9);
  for (const x of [-0.7, 0, 0.7]) bag.add('terracotta', lathe([[0.001, 0], [0.11, 0.01], [0.14, 0.08], [0.1, 0.12], [0.001, 0.12]], 9, null, X(x), PY + 0.88, Z(zb + 2.45)));
  for (const x of [-0.35, 0.35]) bag.add('bronze', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.06], [0.001, 0.06]], 8, null, X(x), PY + 0.88, Z(zb + 2.6)));
  for (const x of [-0.8, 0, 0.8]) B('cloth_red', x - 0.25, PY, zb + 3.3, x + 0.25, PY + 0.06, zb + 3.7);
  for (let k = -3; k <= 3; k++) { const z = k * 1.0, y = yr - (yr - ye) * Math.abs(k) / 7; bag.add('timber', rod([X(-ex + 0.3), y - 0.2, Z(z)], [X(ex - 0.3), y - 0.2, Z(z)], 0.07, 5)); }
  for (const s of [-1, 1]) {
    const x = X(s * (hw - 0.3)), t = [x, 4.2, Z(-6.3), x, 4.2, Z(6.3), x, yr - 0.4, Z(0)];
    bag.add('plaster_white', fromTriangles(t.concat([t[3], t[4], t[5], t[0], t[1], t[2], t[6], t[7], t[8]])));
  }
  // the altar: tiers of tablets on the back wall, the table, the incense burner, candles, a lamp's light
  B('timber_red', -2.6, PY, zb + 0.55, 2.6, 1.15, zb + 1.2);
  for (let t = 0; t < 3; t++) {
    B('timber_red', -2.4 + t * 0.2, PY + 1.2 + t * 0.55, zb + 0.4, 2.4 - t * 0.2, PY + 1.28 + t * 0.55, zb + 0.75);
    const n = 9 - t * 2;
    for (let q = 0; q < n; q++) { const x = (q - (n - 1) / 2) * 0.46; B('lacquer_black', x - 0.1, PY + 1.28 + t * 0.55, zb + 0.46, x + 0.1, PY + 1.28 + t * 0.55 + 0.42, zb + 0.5); B('gilt_bronze', x - 0.04, PY + 1.28 + t * 0.55 + 0.1, zb + 0.5, x + 0.04, PY + 1.28 + t * 0.55 + 0.32, zb + 0.52); }
  }
  bag.add('bronze', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.1], [0.17, 0.2], [0.21, 0.24], [0.001, 0.24]], 12, null, X(0), 1.15, Z(zb + 0.9)));
  for (const x of [-1.6, -1.2, 1.2, 1.6]) { bag.add('cloth_red', rod([X(x), 1.15, Z(zb + 0.9)], [X(x), 1.5, Z(zb + 0.9)], 0.03, 5)); bag.add('flame', lathe([[0.03, 0], [0.01, 0.07], [0.001, 0.1]], 6, null, X(x), 1.5, Z(zb + 0.9))); }
  if (lights) { lights.push({ at: [X(0), 1.9, Z(zb + 1.4)], color: '#ffb46b', intensity: 5, distance: 8 }); }
  // couplets on the front posts, the name board over the middle bay
  for (const x of [-2.1, 2.1]) for (const s of [-1, 1]) { B('lacquer_red', x + s * 0.21 - (s > 0 ? 0 : 0.03), 1.0, zf - 0.8, x + s * 0.21 + (s > 0 ? 0.03 : 0), 3.6, zf - 0.4); }
  B('lacquer_black', -1.3, 3.1, zf - 0.55, 1.3, 3.9, zf - 0.45); B('gilt_bronze', -0.9, 3.35, zf - 0.45, 0.9, 3.65, zf - 0.43);
  // the hall's own benches either side of the aisle
  for (const s of [-1, 1]) B('timber', s * 4.1 - 0.9, PY, 2.9, s * 4.1 + 0.9, PY + 0.45, 3.35);
  void STYLES;
}
