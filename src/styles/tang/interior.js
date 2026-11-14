// Furnished rooms of Tang Chang'an, in the hall's own frame (facing +z, the door in the front wall): the Hu wine shop (jiusi) and the
// official's hall. Tang rooms mixed the old way of sitting (mats on a raised wooden dais, low tables) with the new (the folding
// stool of the Hu, hu chuang; tables and benches): both are here. { c, face, w, d (the hall's column grid), y (the floor), kind }.

import { box, lathe } from '../../core/geom.js';
import { inFrame, YAW, rng } from './kit.js';

const jar = (bag, x, y, z, r, h, mat) => bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, h * 0.35], [r * 0.92, h * 0.7], [r * 0.5, h * 0.92], [r * 0.55, h], [0.001, h]], 10, null, x, y, z));
const stool = (L, x, z, y) => {   // a hu chuang: the folding stool, a cord seat on crossed legs
  const { bag, col } = L;
  bag.add('wood_dark', box(x - 0.24, y + 0.41, z - 0.2, x + 0.24, y + 0.45, z + 0.2)); bag.add('hide_tan', box(x - 0.2, y + 0.45, z - 0.16, x + 0.2, y + 0.47, z + 0.16));
  for (const s of [-1, 1]) bag.add('wood_dark', box(x + s * 0.2 - 0.02, y, z - 0.18, x + s * 0.2 + 0.02, y + 0.41, z + 0.18));
  col.circle(x, z, 0.28, y, y + 0.47);
};
const table = (L, x, z, y, w, d, h, mat = 'lacquer_red') => {
  const { bag, col } = L;
  bag.add(mat, box(x - w / 2, y + h - 0.05, z - d / 2, x + w / 2, y + h, z + d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', box(x + sx * (w / 2 - 0.08) - 0.03, y, z + sz * (d / 2 - 0.08) - 0.03, x + sx * (w / 2 - 0.08) + 0.03, y + h - 0.05, z + sz * (d / 2 - 0.08) + 0.03));
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h);
};
const cup = (bag, x, y, z, m = 'glaze_white') => bag.add(m, lathe([[0.001, 0], [0.035, 0], [0.05, 0.06], [0.045, 0.06], [0.001, 0.01]], 8, null, x, y, z));
/** A raised wooden dais with a mat on it. */
const dais = (L, x0, z0, x1, z1, y, h) => {
  const { bag, col } = L;
  bag.add('wood_dark', box(x0, y, z0, x1, y + h, z1)); bag.add('reed_mat', box(x0 + 0.12, y + h, z0 + 0.12, x1 - 0.12, y + h + 0.025, z1 - 0.12));
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0, z0, x1, z1], y + h + 0.025);
};

function wine(L, el) {
  const { bag, col, lights } = L, { w, d, y } = el, rand = rng(el.seed || 7), hx = w / 2 - 0.4, bz = -d / 2 + 0.4;
  // the earthen counter (lu) along the back right, wine jars set in its top, the dippers and cups
  const cx0 = 0.5, cx1 = hx;
  bag.add('mud_plaster', box(cx0, y, bz, cx1, y + 1.0, bz + 1.1)); bag.add('timber', box(cx0 - 0.05, y + 1.0, bz - 0.05, cx1 + 0.05, y + 1.06, bz + 1.15)); col.rect([cx0, bz, cx1, bz + 1.1], y, y + 1.06);
  for (let x = cx0 + 0.45; x < cx1 - 0.3; x += 0.62) { jar(bag, x, y + 1.06, bz + 0.55, 0.2 + rand() * 0.04, 0.5, 'pottery_dark'); bag.add('cloth_red', box(x - 0.07, y + 1.56, bz + 0.48, x + 0.07, y + 1.6, bz + 0.62)); }
  for (let k = 0; k < 6; k++) cup(bag, cx0 + 0.3 + k * 0.17, y + 1.06, bz + 1.0);
  // shelves of wine jars along the back wall left of the counter, a screen between
  bag.add('wood_dark', box(-hx, y, bz - 0.0, -1.0, y + 2.1, bz + 0.35)); col.rect([-hx, bz, -1.0, bz + 0.35], y, y + 2.1);
  for (let x = -hx + 0.3; x < -1.2; x += 0.45) for (const yy of [0.5, 1.15, 1.8]) jar(bag, x, y + yy, bz + 0.45, 0.15, 0.3, 'pottery_dark');
  // the dais on the left with its mats and low tables, the guests' cushions
  dais(L, -hx, bz + 1.2, -hx + 4.6, bz + 5.2, y, 0.32);
  for (const z of [bz + 2.3, bz + 4.1]) { table(L, -hx + 2.3, z, y + 0.35, 1.2, 0.6, 0.38); for (let k = 0; k < 3; k++) cup(bag, -hx + 1.9 + k * 0.3, y + 0.35 + 0.38, z); for (const s of [-1, 1]) bag.add(s < 0 ? 'cloth_ochre' : 'cloth_indigo', box(-hx + 2.3 + s * 1.2 - 0.3, y + 0.35, z - 0.3, -hx + 2.3 + s * 1.2 + 0.3, y + 0.43, z + 0.3)); }
  // tables with folding stools on the floor on the right
  for (const [x, z] of [[hx - 1.6, bz + 3.4], [hx - 1.6, bz + 5.6], [hx - 4.2, bz + 5.0]]) {
    table(L, x, z, y, 1.1, 0.8, 0.76);
    for (const [dx, dz] of [[-0.85, 0], [0.85, 0], [0, 0.7]]) stool(L, x + dx, z + dz, y);
    for (let k = 0; k < 3; k++) cup(bag, x - 0.3 + k * 0.28, y + 0.76, z);
    jar(bag, x, y + 0.76, z - 0.15, 0.1, 0.22, 'glaze_white');
  }
  // the round carpet where the Hu girl dances, in the middle of the room (carpet of red and indigo rings)
  const dx = -0.2, dz = bz + 4.4;
  bag.add('cloth_red', lathe([[0.001, 0.03], [1.55, 0.03], [1.55, 0.04], [0.001, 0.04]], 24, null, dx, y, dz)); bag.add('cloth_indigo', lathe([[0.001, 0.045], [1.1, 0.045], [1.1, 0.055], [0.001, 0.055]], 24, null, dx, y, dz)); bag.add('cloth_ochre', lathe([[0.001, 0.06], [0.55, 0.06], [0.55, 0.07], [0.001, 0.07]], 20, null, dx, y, dz));
  // the screen at the dais's end, the lamp stands, the hanging wine flag inside, lanterns
  bag.add('lacquer_red', box(-hx + 4.7, y, bz + 1.4, -hx + 4.78, y + 1.7, bz + 3.4)); bag.add('paint_white', box(-hx + 4.78, y + 0.15, bz + 1.5, -hx + 4.8, y + 1.6, bz + 3.3));
  for (const [x, z] of [[-hx + 0.3, bz + 5.4], [hx - 0.3, bz + 1.4]]) { bag.add('wood_dark', box(x - 0.03, y, z - 0.03, x + 0.03, y + 1.4, z + 0.03)); bag.add('lamp_paper', box(x - 0.12, y + 1.4, z - 0.12, x + 0.12, y + 1.68, z + 0.12)); lights.push({ at: [x, y + 1.5, z], color: '#ffb46b', intensity: 2.4, distance: 8 }); }
  for (const [x, z] of [[-1.5, bz + 2.2], [2.0, bz + 3.0]]) { bag.add('cloth_red', box(x - 0.2, y + 2.6, z - 0.2, x + 0.2, y + 3.05, z + 0.2)); bag.add('wood_dark', box(x - 0.01, y + 3.05, z - 0.01, x + 0.01, y + 3.4, z + 0.01)); }
}

function house(L, el) {
  const { bag, col, lights } = L, { w, d, y } = el, bz = -d / 2 + 0.4;
  // the dais at the back (ta): the master's seat on a mat, a low table before him, a great screen behind
  dais(L, -3.2, bz + 0.5, 3.2, bz + 3.6, y, 0.34);
  bag.add('lacquer_red', box(-3.0, y + 0.34, bz, 3.0, y + 2.3, bz + 0.12)); bag.add('paint_ochre', box(-2.85, y + 0.5, bz + 0.12, 2.85, y + 2.15, bz + 0.14));
  bag.add('paint_white', box(-2.4, y + 0.7, bz + 0.14, 2.4, y + 1.95, bz + 0.15));
  col.rect([-3.0, bz, 3.0, bz + 0.15], y + 0.34, y + 2.3);
  table(L, 0, bz + 2.2, y + 0.34, 1.5, 0.6, 0.4); for (let k = 0; k < 2; k++) cup(bag, -0.3 + k * 0.5, y + 0.74, bz + 2.2, 'glaze_green');
  bag.add('cloth_maroon', box(-0.6, y + 0.36, bz + 3.0, 0.6, y + 0.44, bz + 3.7));
  // the zither (qin) on its own low table at the dais's side, the incense burner, a lamp stand
  table(L, 2.3, bz + 2.8, y + 0.34, 1.3, 0.4, 0.3, 'wood_dark'); bag.add('lacquer_black', box(1.8, y + 0.64, bz + 2.7, 2.8, y + 0.7, bz + 2.9));
  bag.add('bronze', lathe([[0.001, 0], [0.1, 0], [0.14, 0.1], [0.12, 0.16], [0.001, 0.16]], 10, null, -2.3, y + 0.34, bz + 2.5));
  bag.add('wood_dark', box(-2.9, y + 0.34, bz + 1.0, -2.85, y + 1.7, bz + 1.05)); bag.add('lamp_paper', box(-3.0, y + 1.7, bz + 0.95, -2.75, y + 1.98, bz + 1.2)); lights.push({ at: [-2.9, y + 1.8, bz + 1.1], color: '#ffb46b', intensity: 2.2, distance: 8 });
  // the guests' side: two benches and a low table, a chest, a hanging scroll on the side wall, the hu chuang for the guest of honour
  for (const sx of [-1, 1]) { table(L, sx * (w / 2 - 1.0), 0.3, y, 0.7, 1.5, 0.42, 'lacquer_red'); stool(L, sx * (w / 2 - 1.9), 0.3, y); stool(L, sx * (w / 2 - 1.9), 1.3, y); }
  bag.add('lacquer_black', box(w / 2 - 1.1, y, bz + 0.2, w / 2 - 0.4, y + 0.55, bz + 1.4)); col.rect([w / 2 - 1.1, bz + 0.2, w / 2 - 0.4, bz + 1.4], y, y + 0.55);
  bag.add('paint_white', box(-w / 2 + 0.2, y + 1.2, -1.0, -w / 2 + 0.23, y + 2.5, 0.2)); bag.add('cloth_black', box(-w / 2 + 0.2, y + 1.15, -1.05, -w / 2 + 0.235, y + 1.2, 0.25));
  void col;
}


/** The translation hall of Daci'en (Xuanzang's scriptorium): shelves of sutra scrolls along the back wall, a long dais with a row of low desks, ink and brushes, the master's higher seat in the middle, braziers, lamps. */
function scriptorium(L, el) {
  const { bag, col, lights } = L, { w, d, y } = el, rand = rng(el.seed || 11), hx = w / 2 - 0.45, z0 = -d / 2 + 0.3;
  bag.add('wood_dark', box(-hx, y, z0, hx, y + 2.3, z0 + 0.5)); col.rect([-hx, z0, hx, z0 + 0.5], y, y + 2.3);
  for (const yy of [0.45, 1.05, 1.65]) for (let x = -hx + 0.2; x < hx - 0.3; x += 0.42) {
    bag.add(rand() < 0.5 ? 'paint_white' : 'paint_ochre', box(x, y + yy, z0 + 0.5, x + 0.3, y + yy + 0.2, z0 + 0.62)); bag.add('cloth_indigo', box(x + 0.02, y + yy + 0.2, z0 + 0.5, x + 0.28, y + yy + 0.24, z0 + 0.62));
  }
  dais(L, -hx + 0.3, z0 + 1.0, hx - 0.3, z0 + 4.3, y, 0.25);
  const n = Math.max(4, Math.floor((w - 4) / 2.4));
  for (let k = 0; k < n; k++) {
    const x = -hx + 2.0 + k * ((2 * hx - 4.0) / (n - 1)), mid = Math.abs(x) < 0.4;
    if (mid) continue;
    table(L, x, z0 + 2.2, y + 0.25, 1.3, 0.62, 0.4, 'lacquer_black');
    bag.add('paint_white', box(x - 0.45, y + 0.67, z0 + 2.05, x - 0.05, y + 0.672, z0 + 2.4)); bag.add('slate', box(x + 0.25, y + 0.65, z0 + 2.0, x + 0.45, y + 0.68, z0 + 2.2));
    bag.add('bamboo_culm', lathe([[0.04, 0], [0.045, 0.14], [0.001, 0.14]], 8, null, x + 0.5, y + 0.65, z0 + 2.45));
    bag.add(['cloth_ochre', 'cloth_maroon', 'cloth_grey'][k % 3], box(x - 0.3, y + 0.25, z0 + 2.9, x + 0.3, y + 0.31, z0 + 3.5));
  }
  // the master's seat: a higher dais with a larger desk, a screen behind
  dais(L, -1.6, z0 + 1.0, 1.6, z0 + 3.6, y + 0.25, 0.2, 'cloth_maroon');
  table(L, 0, z0 + 2.0, y + 0.45, 1.5, 0.7, 0.42, 'lacquer_red'); bag.add('paint_white', box(-0.5, y + 0.89, z0 + 1.85, 0.0, y + 0.892, z0 + 2.2));
  bag.add('lacquer_red', box(-1.5, y + 0.45, z0 + 0.75, 1.5, y + 2.1, z0 + 0.85)); bag.add('paint_ochre', box(-1.35, y + 0.6, z0 + 0.85, 1.35, y + 1.95, z0 + 0.87));
  for (const s2 of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.22, 0.0], [0.28, 0.2], [0.001, 0.22]], 10, null, s2 * (hx - 1.2), y, z0 + 4.8)); lights.push({ at: [s2 * (hx - 2.6), y + 2.2, z0 + 4.2], color: '#ffb46b', intensity: 2.4, distance: 9 }); lamp(L, s2 * (hx - 0.2), y, z0 + 5.4); }
}
const lamp = (L, x, y, z) => { L.bag.add('wood_dark', box(x - 0.03, y, z - 0.03, x + 0.03, y + 1.3, z + 0.03)); L.bag.add('lamp_paper', box(x - 0.11, y + 1.3, z - 0.11, x + 0.11, y + 1.56, z + 0.11)); };


// ── the monastery's ordinary rooms (docs/settlements/tang-changan.md §11a): the monks' cells, the refectory, the kitchen, the library of
//    cases, the guest house and the storehouse of Daci'en, each in its hall's frame (the door in the front wall at +z, the middle aisle kept clear)
const mat = (L, x, z, w, d, y, m = 'reed_mat') => { L.bag.add(m, box(x - w / 2, y, z - d / 2, x + w / 2, y + 0.02, z + d / 2)); };
const bed = (L, x0, z0, x1, z1, y, quilt) => {   // a sleeping platform (ta) with its mat, a folded quilt and a block of a pillow
  const { bag, col } = L;
  bag.add('wood_dark', box(x0, y, z0, x1, y + 0.42, z1)); bag.add('reed_mat', box(x0 + 0.05, y + 0.42, z0 + 0.05, x1 - 0.05, y + 0.445, z1 - 0.05));
  bag.add(quilt, box(x0 + 0.1, y + 0.445, z0 + 0.1, x1 - 0.1, y + 0.55, z0 + (z1 - z0) * 0.55)); bag.add('timber', box(x0 + 0.12, y + 0.55, z1 - 0.4, x1 - 0.12, y + 0.65, z1 - 0.15));
  col.rect([x0, z0, x1, z1], y, y + 0.55);
};
const chest = (L, x, z, y, w = 0.9, d = 0.5, h = 0.6, m = 'lacquer_black') => { L.bag.add(m, box(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2)); L.bag.add('bronze', box(x - 0.06, y + h * 0.6, z + d / 2, x + 0.06, y + h * 0.75, z + d / 2 + 0.02)); L.col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], y, y + h); };
const bowl = (bag, x, y, z) => bag.add('glaze_white', lathe([[0.001, 0], [0.05, 0], [0.08, 0.07], [0.075, 0.075], [0.001, 0.01]], 8, null, x, y, z));
const pot = (L, x, z, y, r, h, m = 'iron') => { L.bag.add(m, lathe([[0.001, 0], [r * 0.8, 0], [r, h * 0.45], [r * 0.9, h], [r * 0.82, h], [0.001, h * 0.92]], 12, null, x, y, z)); L.col.circle(x, z, r, y, y + h); };
const lampStand = (L, x, y, z) => { L.bag.add('wood_dark', box(x - 0.03, y, z - 0.03, x + 0.03, y + 1.3, z + 0.03)); L.bag.add('lamp_paper', box(x - 0.11, y + 1.3, z - 0.11, x + 0.11, y + 1.56, z + 0.11)); L.lights.push({ at: [x, y + 1.4, z], color: '#ffb46b', intensity: 2.2, distance: 8 }); };

function cell(L, el) {
  const { bag, col } = L, { w, d, y } = el, hx = w / 2 - 0.35, bz = -d / 2 + 0.3;
  for (const s of [-1, 1]) { const x0 = s < 0 ? -hx : hx - 1.9, x1 = x0 + 1.9; bed(L, x0, bz + 0.2, x1, bz + 2.5, y, s < 0 ? 'cloth_ochre' : 'cloth_grey'); bed(L, x0, bz + 3.0, x1, bz + 5.3, y, s < 0 ? 'cloth_grey' : 'cloth_brown'); }
  // the low desk under the back wall between the beds: a sutra open on it, brush and ink, the lamp; a cushion
  table(L, 0, bz + 0.55, y, 1.5, 0.6, 0.42, 'wood_dark'); bag.add('paint_white', box(-0.5, y + 0.42, bz + 0.4, 0.0, y + 0.43, bz + 0.75)); bag.add('slate', box(0.3, y + 0.42, bz + 0.4, 0.5, y + 0.45, bz + 0.6));
  bag.add('cloth_maroon', box(-0.3, y, bz + 1.15, 0.3, y + 0.07, bz + 1.7));
  // a niche shelf on the back wall: a small gilt Buddha, an incense burner, a lamp
  bag.add('wood_dark', box(-0.8, y + 1.5, bz - 0.12, 0.8, y + 1.56, bz + 0.2)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.08, 0], [0.07, 0.1], [0.05, 0.2], [0.04, 0.24], [0.001, 0.26]], 8, null, 0, y + 1.56, bz + 0.05)); bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.09, 0.07], [0.001, 0.09]], 8, null, 0.45, y + 1.56, bz + 0.05));
  // a clothes chest and a water jar and washbasin by the door's side, the monks' alms bowls on a shelf
  chest(L, -hx + 0.5, d / 2 - 0.7, y); jar(bag, hx - 0.4, y, d / 2 - 0.55, 0.26, 0.7, 'pottery_dark'); col.circle(hx - 0.4, d / 2 - 0.55, 0.28, y, y + 0.7);
  for (let k = 0; k < 4; k++) bowl(bag, -1.0 + k * 0.4, y + 1.0, bz - 0.0 + 0.0), void 0;
  bag.add('wood_dark', box(-1.1, y + 0.95, bz - 0.1, 1.1, y + 1.0, bz + 0.2));
  lampStand(L, 0.9, y, bz + 1.0);
  void col;
}

function refectory(L, el) {
  const { bag, col, lights } = L, { w, d, y } = el, hx = w / 2 - 0.5, bz = -d / 2 + 0.35;
  // the presiding monk's seat at the back: a dais with a table, the wooden fish (muyu) hung at its side, a screen behind
  dais(L, -2.4, bz, 2.4, bz + 2.2, y, 0.3); table(L, 0, bz + 1.1, y + 0.3, 1.6, 0.6, 0.4); for (let k = 0; k < 3; k++) bowl(bag, -0.4 + k * 0.4, y + 0.7, bz + 1.1);
  bag.add('lacquer_red', box(-2.2, y + 0.3, bz - 0.0, 2.2, y + 2.0, bz + 0.1)); bag.add('paint_ochre', box(-2.05, y + 0.5, bz + 0.1, 2.05, y + 1.85, bz + 0.12));
  bag.add('timber', lathe([[0.001, 0], [0.22, 0.02], [0.28, 0.2], [0.001, 0.38]], 10, null, 3.2, y + 1.3, bz + 0.6)); bag.add('iron', box(3.18, y + 1.68, bz + 0.58, 3.22, y + 2.4, bz + 0.62));
  // the long tables of the community in two rows, one each side of the aisle, with a cushion at each place and a bowl on the table
  for (const sx of [-1, 1]) for (const z of [bz + 3.2, bz + 5.4]) {
    const cx = sx * (hx - 3.6), len = 6.6; table(L, cx, z, y, len, 0.7, 0.62, 'wood_dark');
    for (let k = 0; k < 6; k++) { const x = cx - len / 2 + 0.6 + k * 1.1; for (const sz of [-1, 1]) bag.add(sz < 0 ? 'cloth_ochre' : 'cloth_brown', box(x - 0.25, y, z + sz * 0.75 - 0.25, x + 0.25, y + 0.07, z + sz * 0.75 + 0.25)); bowl(bag, x, y + 0.62, z - 0.18); bowl(bag, x + 0.18, y + 0.62, z + 0.18); }
  }
  // the serving counter and the tubs of rice and soup along the right wall, the water vat, ladles
  bag.add('wood_dark', box(hx - 0.6, y, bz + 2.6, hx, y + 0.8, bz + 6.8)); col.rect([hx - 0.6, bz + 2.6, hx, bz + 6.8], y, y + 0.8);
  for (let k = 0; k < 3; k++) { pot(L, hx - 0.3, bz + 3.2 + k * 1.3, y + 0.8, 0.32, 0.4, 'iron'); }
  jar(bag, -hx + 0.4, y, bz + 0.5, 0.36, 0.95, 'pottery_dark'); col.circle(-hx + 0.4, bz + 0.5, 0.38, y, y + 0.95);
  for (const x of [-hx + 3.0, hx - 3.0]) lampStand(L, x, y, bz + 0.8);
}

function kitchen(L, el) {
  const { bag, col, lights } = L, { w, d, y } = el, hx = w / 2 - 0.4, bz = -d / 2 + 0.35;
  // the stove (zao): a long brick range along the back wall with three iron pots under wooden lids, a flue, its fire-mouths aglow
  bag.add('brick_grey', box(-hx + 0.6, y, bz, hx - 0.6, y + 0.85, bz + 1.5)); col.rect([-hx + 0.6, bz, hx - 0.6, bz + 1.5], y, y + 0.85);
  for (const x of [-hx / 2 - 0.4, 0.2, hx / 2 + 0.8]) { bag.add('iron', lathe([[0.001, 0.0], [0.5, 0.02], [0.62, 0.2], [0.55, 0.3], [0.001, 0.3]], 14, null, x, y + 0.85, bz + 0.75)); bag.add('timber', lathe([[0.001, 0.3], [0.54, 0.3], [0.45, 0.42], [0.001, 0.46]], 12, null, x, y + 0.85, bz + 0.75)); bag.add('paint_cab_yellow', box(x - 0.12, y + 0.25, bz + 1.5, x + 0.12, y + 0.5, bz + 1.52)); }
  lights.push({ at: [0.2, y + 0.9, bz + 1.9], color: '#ff8f40', intensity: 2.4, distance: 7 });
  bag.add('brick_grey', box(-hx / 2 - 0.5, y + 0.85, bz, -hx / 2 + 0.3, y + 3.0, bz + 0.6));
  // the work table with its boards, cleavers and baskets of greens; the water vats and the firewood
  table(L, hx - 2.2, 1.0, y, 2.4, 0.9, 0.8, 'wood_dark'); bag.add('timber', box(hx - 3.1, y + 0.8, 0.7, hx - 2.2, y + 0.84, 1.2)); bag.add('iron', box(hx - 1.9, y + 0.8, 0.9, hx - 1.4, y + 0.82, 1.0));
  for (let k = 0; k < 3; k++) bag.add(['cloth_green', 'cloth_ochre', 'cloth_green'][k], lathe([[0.001, 0], [0.16, 0], [0.2, 0.15], [0.001, 0.15]], 8, null, hx - 1.4 + k * 0.25, y + 0.84, 1.3));
  for (const z of [bz + 2.6, bz + 3.6]) { jar(bag, -hx + 0.5, y, z, 0.4, 1.0, 'pottery_dark'); col.circle(-hx + 0.5, z, 0.42, y, y + 1.0); }
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) bag.add('timber', box(-hx + 1.4 + k * 0.28, y + r * 0.16, d / 2 - 1.1, -hx + 1.4 + k * 0.28 + 0.2, y + r * 0.16 + 0.14, d / 2 - 0.3)); col.rect([-hx + 1.4, d / 2 - 1.1, -hx + 3.1, d / 2 - 0.3], y, y + 0.64);
  bag.add('wood_dark', box(hx - 0.35, y + 1.3, -1, hx, y + 1.36, 3)); for (let k = 0; k < 9; k++) bowl(bag, hx - 0.18, y + 1.36, -0.8 + k * 0.4);
  for (let k = 0; k < 4; k++) bag.add('sacking', lathe([[0.2, 0], [0.26, 0.22], [0.2, 0.5], [0.001, 0.55]], 8, null, hx - 0.6 - k * 0.5, y, d / 2 - 0.6));
}

function library(L, el) {
  const { bag, col } = L, { w, d, y } = el, rand = rng(el.seed || 13), hx = w / 2 - 0.5, z0 = -d / 2 + 0.35;
  // the stacks: tall cases of pigeonholes full of scroll bundles in yellow and indigo wrappers, standing end-on, an aisle between each pair
  for (const x of [-hx + 0.6, -hx + 2.9, -hx + 5.2, hx - 5.2, hx - 2.9, hx - 0.6]) {
    if (Math.abs(x) < 1.6) continue;
    bag.add('wood_dark', box(x - 0.35, y, z0, x + 0.35, y + 2.3, z0 + 5.4)); col.rect([x - 0.35, z0, x + 0.35, z0 + 5.4], y, y + 2.3);
    for (const yy of [0.25, 0.8, 1.35, 1.9]) for (let z = z0 + 0.15; z < z0 + 5.2; z += 0.38) for (const sx of [-1, 1]) bag.add(rand() < 0.55 ? 'paint_ochre' : rand() < 0.5 ? 'cloth_indigo' : 'paint_white', box(x + sx * 0.36 - (sx > 0 ? 0.0 : 0.16), y + yy, z, x + sx * 0.36 + (sx > 0 ? 0.16 : 0.0), y + yy + 0.4, z + 0.3));
  }
  // the reading table at the back between the stacks, two stools, a lamp; a chest of the lesser rolls
  table(L, 0, z0 + 1.2, y, 2.4, 0.8, 0.76, 'lacquer_black'); stool(L, -0.7, z0 + 2.0, y); stool(L, 0.7, z0 + 2.0, y); bag.add('paint_white', box(-0.6, y + 0.76, z0 + 1.0, 0.0, y + 0.77, z0 + 1.4)); lampStand(L, 1.4, y, z0 + 0.7);
  chest(L, -1.4, z0 + 0.5, y, 1.1, 0.6, 0.7); chest(L, 1.4, z0 + 5.2, y, 1.1, 0.6, 0.7, 'wood_dark');
}

function guest(L, el) {
  const { bag, col } = L, { w, d, y } = el, hx = w / 2 - 0.4, bz = -d / 2 + 0.35;
  bed(L, -hx, bz, -hx + 2.2, bz + 2.6, y, 'cloth_maroon'); bed(L, hx - 2.2, bz, hx, bz + 2.6, y, 'cloth_indigo');
  dais(L, -2.0, bz, 2.0, bz + 2.4, y, 0.3); table(L, 0, bz + 1.2, y + 0.3, 1.3, 0.55, 0.4, 'lacquer_red'); for (let k = 0; k < 3; k++) cup(bag, -0.3 + k * 0.3, y + 0.7, bz + 1.2, 'glaze_green'); bag.add('cloth_ochre', box(-0.5, y + 0.32, bz + 1.75, 0.5, y + 0.4, bz + 2.3));
  bag.add('lacquer_red', box(-0.9, y, bz + 3.1, 0.9, y + 1.6, bz + 3.18)); bag.add('paint_white', box(-0.8, y + 0.15, bz + 3.18, 0.8, y + 1.5, bz + 3.2));          // a screen
  for (const sx of [-1, 1]) { table(L, sx * (hx - 1.4), 1.4, y, 1.1, 0.6, 0.7, 'wood_dark'); stool(L, sx * (hx - 2.4), 1.4, y); stool(L, sx * (hx - 0.4), 1.4, y); }
  chest(L, -hx + 0.4, d / 2 - 0.6, y); bag.add('bronze', lathe([[0.001, 0], [0.22, 0], [0.28, 0.2], [0.001, 0.22]], 10, null, hx - 0.7, y, d / 2 - 0.8)); lampStand(L, 0, y, bz + 0.5); lampStand(L, hx - 1.0, y, d / 2 - 1.5);
}

function store(L, el) {
  const { bag, col } = L, { w, d, y } = el, rand = rng(el.seed || 17), hx = w / 2 - 0.4, bz = -d / 2 + 0.35;
  // grain: stacked sacks against the left wall; oil, pickles and wine in great jars along the back and right; bolts of cloth on racks; coils of cord; a steelyard
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - r; k++) bag.add('sacking', lathe([[0.22, 0], [0.3, 0.22], [0.22, 0.55], [0.001, 0.6]], 8, null, -hx + 0.45 + r * 0.55, y + r * 0.0, bz + 0.5 + k * 0.62));
  col.rect([-hx + 0.1, bz + 0.1, -hx + 2.0, bz + 3.3], y, y + 0.7);
  for (let k = 0; k < 6; k++) { const x = -0.6 + k * 0.62 + (k > 2 ? 0.6 : 0.0) - 0.4; if (Math.abs(x) < 1.1) continue; jar(bag, x, y, bz + 0.5, 0.3, 0.85, 'pottery_dark'); bag.add('cloth_red', box(x - 0.1, y + 0.85, bz + 0.4, x + 0.1, y + 0.9, bz + 0.6)); col.circle(x, bz + 0.5, 0.32, y, y + 0.9); }
  for (let k = 0; k < 5; k++) { const z = bz + 0.9 + k * 0.85; jar(bag, hx - 0.45, y, z, 0.32, 0.9, 'pottery_dark'); col.circle(hx - 0.45, z, 0.34, y, y + 0.9); }
  bag.add('wood_dark', box(hx - 2.6, y, d / 2 - 1.0, hx - 0.4, y + 1.9, d / 2 - 0.3)); col.rect([hx - 2.6, d / 2 - 1.0, hx - 0.4, d / 2 - 0.3], y, y + 1.9);
  for (const yy of [0.3, 0.8, 1.3]) for (let k = 0; k < 5; k++) bag.add(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_grey'][(k + yy * 3 | 0) % 5], box(hx - 2.5 + k * 0.42, y + yy, d / 2 - 0.9, hx - 2.15 + k * 0.42, y + yy + 0.4, d / 2 - 0.4));
  for (let k = 0; k < 3; k++) bag.add('rope_fibre', lathe([[0.18, 0], [0.2, 0.1], [0.18, 0.2], [0.001, 0.2]], 8, null, -hx + 0.5 + k * 0.45, y, d / 2 - 0.5));
  bag.add('wood_dark', box(-0.35, y, 0.6, 0.35, y + 0.85, 1.2)); col.rect([-0.35, 0.6, 0.35, 1.2], y, y + 0.85); bag.add('bronze', box(-0.3, y + 0.85, 0.85, 0.3, y + 0.89, 0.95)); bag.add('iron', box(-0.01, y + 0.89, 0.55, 0.01, y + 1.9, 0.57));
  lampStand(L, hx - 1.2, y, 0.0);
}

/** tang_jars { at: [x, z], n, y, dir: [dx, dz], mat }: a row of wine jars with red cloth stoppers standing on the ground, as before a wine shop. */
function jars(el, { bag, col }) {
  const [x, z] = el.at, d = el.dir || [1, 0], rand = rng(el.seed || 3);
  for (let k = 0; k < (el.n || 4); k++) {
    const px = x + d[0] * k * 0.62, pz = z + d[1] * k * 0.62, h = 0.55 + rand() * 0.15;
    jar(bag, px, el.y ?? 0, pz, 0.26, h, el.mat || 'pottery_dark'); bag.add('cloth_red', box(px - 0.09, (el.y ?? 0) + h, pz - 0.09, px + 0.09, (el.y ?? 0) + h + 0.05, pz + 0.09)); col.circle(px, pz, 0.26, el.y ?? 0, (el.y ?? 0) + h + 0.05);
  }
}
export { wine as furnishWine, house as furnishHouse };
export function tangInterior(el, ctx) {
  inFrame(ctx, el.c, YAW[el.face || 's'], (L) => ({ wine, scriptorium, cell, refectory, kitchen, library, guest, store }[el.kind] ?? house)(L, el));
}
export const INTERIOR_ELEMENTS = { tang_interior: tangInterior, tang_jars: jars };
