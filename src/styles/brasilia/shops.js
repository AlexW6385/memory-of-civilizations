// Brasília style — the commercial strip (comércio local) of the superquadra, 1970: nineteen shop units under an arcade, each one
// entered by its door, its trade furnished (bakery, news stand, haberdashery, pharmacy, snack bar, grocery, shoemaker, barber,
// stationer, butcher, greengrocer, optician), fascia boards with pseudo-lettering, goods out under the arcade.
import { box, lathe, rod } from '../../core/geom.js';
import { rngOf, solidBox, shelving, counter, stool, letters } from './kit.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const FASCIA = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'paint_blue', 'wood_painted', 'cloth_maroon', 'paint_ochre'];
const GOODS = {
  padaria: { frame: 'wood_ochre', mats: ['hide_tan', 'wood_ochre', 'stucco_pale', 'hide_brown'], rows: 4, counter: { body: 'tile_cream', top: 'marble', glass: true } },
  banca: { frame: 'steel_grey', mats: ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_black'], rows: 5, h: [0.26, 0.34], counter: { body: 'wood_painted', top: 'timber' } },
  armarinho: { frame: 'timber', mats: ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_maroon', 'cloth_white'], rows: 5, h: [0.2, 0.3], counter: { body: 'timber', top: 'timber' } },
  farmacia: { frame: 'paint_white', mats: ['glaze_white', 'glaze_green', 'cloth_white', 'glaze_blue', 'glaze_red'], rows: 5, h: [0.12, 0.26], counter: { body: 'paint_white', top: 'marble', glass: true } },
  lanchonete: { frame: 'steel_chrome', mats: ['glaze_white', 'cloth_red', 'glaze_yellow'], rows: 3, counter: { body: 'tile_white', top: 'marble_dark' } },
  mercearia: { frame: 'timber', mats: ['cloth_ochre', 'sacking', 'glaze_yellow', 'tile_turquoise', 'cloth_red', 'cloth_green'], rows: 5, h: [0.14, 0.3], counter: { body: 'timber', top: 'timber' } },
  sapataria: { frame: 'wood_painted', mats: ['hide_black', 'hide_brown', 'hide_tan', 'hide_white'], rows: 5, h: [0.12, 0.2], counter: { body: 'wood_painted', top: 'timber' } },
  barbearia: { frame: 'wood_painted', mats: ['glaze_blue', 'glaze_green', 'glaze_white', 'cloth_red'], rows: 2, h: [0.12, 0.22], counter: { body: 'wood_painted', top: 'marble' } },
  papelaria: { frame: 'wood_painted', mats: ['cloth_white', 'cloth_blue', 'cloth_red', 'cloth_ochre', 'cloth_green'], rows: 5, h: [0.1, 0.3], counter: { body: 'wood_painted', top: 'timber', glass: true } },
  acougue: { frame: 'steel_chrome', mats: ['cloth_red', 'cloth_maroon'], rows: 1, h: [0.1, 0.18], counter: { body: 'tile_white', top: 'marble', glass: true } },
  hortifruti: { frame: 'timber', mats: ['cloth_red', 'cloth_green', 'cloth_ochre', 'glaze_yellow'], rows: 2, h: [0.1, 0.18], counter: { body: 'timber', top: 'timber' } },
  otica: { frame: 'paint_white', mats: ['glaze_white', 'steel_chrome', 'cloth_black'], rows: 3, h: [0.06, 0.12], counter: { body: 'paint_white', top: 'marble', glass: true } },
};
const TRADES = Object.keys(GOODS);

/** The inside of one shop unit: x from xa to xb (front to back), z from za to zb, the aisle from the door left clear. */
function furnish(bag, col, trade, xa, xb, za, zb, rand) {
  const G = GOODS[trade], zm = (za + zb) / 2;
  const wallTile = trade === 'acougue' || trade === 'lanchonete' || trade === 'farmacia';
  if (wallTile) { bag.add('tile_white', box(xa, 0.05, za, xb, 1.6, za + 0.03)); bag.add('tile_white', box(xa, 0.05, zb - 0.03, xb, 1.6, zb)); bag.add('tile_white', box(xb - 0.03, 0.05, za, xb, 1.6, zb)); }
  // the left wall's shelves and the back wall's, goods on every board
  if (trade !== 'barbearia') shelving(bag, col, [xa + 0.7, za + 0.04, xb - 0.5, za + 0.42], 0.05, G.rows, G.mats, rand, { h: G.h, frame: G.frame });
  shelving(bag, col, [xb - 0.45, za + 0.46, xb - 0.04, zb - 0.1], 0.05, Math.max(2, G.rows - 1), G.mats, rand, { h: G.h, frame: G.frame });
  // the counter on the right, with its till and scale
  const cz0 = zb - 1.45, cz1 = zb - 0.85;
  counter(bag, col, [xa + 1.3, cz0, xb - 2.4, cz1], G.counter);
  bag.add('steel_grey', box(xa + 1.7, 1.0, cz0 + 0.1, xa + 2.2, 1.22 + (G.counter.glass ? 0.4 : 0), cz0 + 0.45));           // the till
  bag.add('cloth_white', box(xa + 1.4, 0.0, cz1 + 0.02, xb - 2.5, 0.01, cz1 + 0.04));
  const t = trade;
  if (t === 'padaria') {
    for (let k = 0; k < 4; k++) bag.add('wicker', lathe([[0.2, 0], [0.26, 0.1], [0.22, 0.12], [0.001, 0.12]], 10, null, xa + 3.2 + k * 0.7, 1.4, cz0 + 0.3));
    for (let k = 0; k < 7; k++) bag.add('hide_tan', box(xa + 3.0 + k * 0.38, 1.0, cz0 + 0.15, xa + 3.3 + k * 0.38, 1.09, cz0 + 0.4));
    solidBox(bag, col, 'steel_grey', xb - 1.8, 0.05, zm - 0.9, xb - 0.5, 1.9, zm + 0.9);                                    // the oven's front
    bag.add('flame', box(xb - 1.82, 0.5, zm - 0.5, xb - 1.8, 0.8, zm + 0.5));
  } else if (t === 'banca') {
    for (let k = 0; k < 3; k++) bag.add(G.mats[k], box(xa + 3.0 + k * 0.5, 1.0, cz0 + 0.12, xa + 3.4 + k * 0.5, 1.03, cz0 + 0.5));
    solidBox(bag, col, 'steel_grey', xa + 3.0, 0.05, zm - 0.35, xa + 3.7, 1.6, zm + 0.1);                                  // a stand of papers in the aisle's side
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) bag.add(G.mats[(r + k) % 6], box(xa + 3.04, 0.35 + r * 0.32, zm - 0.3 + k * 0.1, xa + 3.66, 0.62 + r * 0.32, zm - 0.22 + k * 0.1));
  } else if (t === 'lanchonete') {
    for (let k = 0; k < 4; k++) stool(bag, xa + 1.9 + k * 0.9, cz0 - 0.4, 0.0, 0.7, k % 2 ? 'cloth_red' : 'leather_bench');
    bag.add('steel_chrome', box(xb - 3.0, 1.0, cz0 + 0.1, xb - 2.5, 1.5, cz0 + 0.5)); bag.add('steel_chrome', lathe([[0.13, 0], [0.15, 0.28], [0.001, 0.3]], 8, null, xb - 3.3, 1.0, cz0 + 0.3));   // coffee machine, a jar
    for (let k = 0; k < 2; k++) { const tx = xa + 3.2 + k * 1.5, tz = za + 1.1; bag.add('steel_chrome', lathe([[0.03, 0], [0.03, 0.72], [0.001, 0.72]], 6, null, tx, 0, tz)); bag.add('tile_white', lathe([[0.001, 0.72], [0.4, 0.72], [0.4, 0.75], [0.001, 0.75]], 12, null, tx, 0, tz)); col.circle(tx, tz, 0.4, 0, 0.76); stool(bag, tx - 0.55, tz, 0, 0.45, 'cloth_red'); stool(bag, tx + 0.55, tz, 0, 0.45, 'cloth_red'); }
  } else if (t === 'mercearia') {
    for (let k = 0; k < 4; k++) solidBox(bag, col, 'sacking', xa + 3.0 + k * 0.5, 0.05, zm - 0.55, xa + 3.45 + k * 0.5, 0.6 + (k % 2) * 0.1, zm - 0.1);
    for (let k = 0; k < 3; k++) bag.add('glaze_yellow', lathe([[0.001, 0], [0.12, 0.01], [0.12, 0.28], [0.001, 0.3]], 8, null, xa + 3.1 + k * 0.5, 0.6, zm - 0.3));
  } else if (t === 'sapataria') {
    solidBox(bag, col, 'leather_bench', xa + 2.8, 0.05, zm - 0.4, xa + 3.8, 0.45, zm + 0.1);                                 // the fitting bench
    bag.add('mirror_tin', box(xa + 2.5, 0.0, za + 0.45, xa + 3.7, 1.7, za + 0.48));
  } else if (t === 'barbearia') {
    for (let k = 0; k < 2; k++) { const cx = xa + 2.6 + k * 1.7, cz = zm - 0.2; bag.add('leather_bench', box(cx - 0.3, 0.45, cz - 0.3, cx + 0.3, 0.6, cz + 0.3)); bag.add('leather_bench', box(cx - 0.3, 0.6, cz + 0.22, cx + 0.3, 1.2, cz + 0.32)); bag.add('steel_chrome', lathe([[0.2, 0], [0.06, 0.04], [0.06, 0.45], [0.001, 0.45]], 8, null, cx, 0, cz)); col.circle(cx, cz, 0.38, 0, 1.2); bag.add('mirror_tin', box(cx - 0.6, 0.9, za + 0.05, cx + 0.6, 2.2, za + 0.08)); bag.add('marble', box(cx - 0.6, 0.85, za + 0.04, cx + 0.6, 0.9, za + 0.3)); }
    solidBox(bag, col, 'leather_bench', xb - 2.6, 0.05, zb - 0.6, xb - 1.0, 0.5, zb - 0.1);                                  // the waiting bench
  } else if (t === 'acougue') {
    for (let k = 0; k < 4; k++) { const hx = xa + 3.0 + k * 0.6; bag.add('steel_chrome', rod([hx, 2.3, za + 0.5], [hx, 2.0, za + 0.5], 0.01, 4)); bag.add('cloth_red', lathe([[0.001, 0], [0.12, 0.2], [0.1, 0.5], [0.001, 0.62]], 8, null, hx, 1.4, za + 0.5)); }
    bag.add('steel_chrome', rod([xa + 2.8, 2.3, za + 0.5], [xa + 5.4, 2.3, za + 0.5], 0.02, 6));
    solidBox(bag, col, 'timber', xb - 3.0, 0.05, zm - 0.5, xb - 2.2, 0.95, zm + 0.5);                                         // the block
  } else if (t === 'hortifruti') {
    for (let k = 0; k < 4; k++) { const cx = xa + 2.4 + k * 1.0, cz = zm - 0.2; solidBox(bag, col, 'timber', cx, 0.05, cz - 0.3, cx + 0.8, 0.55, cz + 0.3); for (let j = 0; j < 6; j++) bag.add(G.mats[(k + j) % 4], lathe([[0.001, 0], [0.07, 0.03], [0.08, 0.1], [0.001, 0.15]], 6, null, cx + 0.15 + (j % 3) * 0.25, 0.55, cz - 0.1 + Math.floor(j / 3) * 0.2)); }
  } else if (t === 'armarinho') {
    for (let k = 0; k < 6; k++) bag.add(G.mats[k], lathe([[0.001, 0], [0.09, 0.01], [0.09, 0.5], [0.001, 0.51]], 8, null, xa + 3.0 + k * 0.28, 1.0, cz0 + 0.3));   // bolts of cloth standing on the counter
  } else if (t === 'otica') {
    bag.add('mirror_tin', box(xa + 2.4, 0.9, za + 0.05, xa + 3.8, 2.0, za + 0.08));
  } else if (t === 'farmacia') {
    bag.add('glaze_green', box(xa + 0.1, 2.3, za + 0.05, xa + 0.14, 2.9, za + 0.7)); bag.add('cloth_white', box(xa + 0.12, 2.55, za + 0.22, xa + 0.16, 2.65, za + 0.55));
  } else if (t === 'papelaria') {
    solidBox(bag, col, 'timber', xa + 2.8, 0.05, zm - 0.3, xa + 4.0, 0.8, zm + 0.1);
    for (let k = 0; k < 8; k++) bag.add(G.mats[k % 5], box(xa + 2.85 + k * 0.14, 0.8, zm - 0.25, xa + 2.95 + k * 0.14, 0.88, zm + 0.05));
  }
  // a bare bulb or tube, a ceiling fan on the larger shops: a light fitting the eye finds
  bag.add('lamp_white', box(xa + 1.2, 3.33, zm - 0.6, xa + 1.5, 3.43, zm + 0.6)); bag.add('lamp_white', box(xb - 3.0, 3.33, zm - 0.6, xb - 2.7, 3.43, zm + 0.6));
  void rand;
}

/** shops_row: { rect (long along z), floors } — the commercial strip: an arcade of shop fronts under two floors of offices, each shop furnished and entered. */
export function shopsRow(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, rand = rngOf(el.seed ?? 3), W = 4.2, fx = x0 + 3.0;      // fx: the glazed fronts' plane
  const n = Math.floor((z1 - z0 - 0.4) / W + 0.01);
  bag.add('facade_grey', box(fx, 3.6, z0, x1, 8.4, z1)); bag.add(WHITE, box(x0 + 2.6, 8.4, z0 - 0.2, x1 + 0.2, 9.0, z1 + 0.2));
  bag.add(WHITE, box(x0 + 2.6, 3.4, z0, x0 + 3, 3.7, z1));
  col.rect([fx, z0, x1, z1], 3.6, 9);
  // the upper floors: windows with louvres and the balcony rails of the flats' fronts
  for (let k = 0; k < n; k++) {
    const z = z0 + 0.4 + k * W;
    for (let r = 0; r < 2; r++) {
      bag.add('glass_outer', box(fx - 0.04, 4.4 + r * 2.2, z + 0.6, fx, 5.6 + r * 2.2, z + W - 0.6));
      for (let s = 0; s < 6; s++) if (rand() < 0.3) bag.add('cloth_white', box(fx - 0.06, 4.4 + r * 2.2 + s * 0.2, z + 0.6, fx - 0.04, 4.55 + r * 2.2 + s * 0.2, z + W - 0.6));
    }
    if (rand() < 0.3) bag.add('cloth_blue', box(fx - 0.02, 6.2, z + 0.8, fx - 0.01, 6.9, z + 2.0));
  }
  const order = TRADES.slice();
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  // the shell: back wall, the end walls, the party walls between the units
  const xa = fx + 0.4, xb = x1 - 0.25, z0u = z0 + 0.4;
  const WALL = 0.2;
  solidBox(bag, col, 'plaster_grey', x1 - 0.25, 0, z0, x1, 3.6, z1);
  for (let k = 0; k <= n; k++) { const z = z0u + k * W; solidBox(bag, col, 'plaster_grey', fx + 0.4, 0, z - WALL / 2, xb, 3.6, z + WALL / 2); bag.add(WHITE, box(fx - 0.1, 0, z - 0.2, fx + 0.45, 3.6, z + 0.2)); }
  solidBox(bag, col, 'plaster_grey', fx + 0.4, 0, z0, xb, 3.6, z0 + 0.3); solidBox(bag, col, 'plaster_grey', fx + 0.4, 0, z1 - 0.3, xb, 3.6, z1);
  const aw = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white'];
  for (let k = 0; k < n; k++) {
    const z = z0u + k * W, za = z + 0.15, zb = z + W - 0.15, trade = order[k % order.length], zd0 = z + 1.5, zd1 = z + 2.7;
    const R = rngOf((el.seed ?? 3) * 977 + k * 31 + 1);
    // the glazed front with the door's gap; a kick plate, the transom, the lintel board with the shop's name
    for (const [a, b] of [[z + 0.1, zd0], [zd1, z + W - 0.1]]) { bag.add('glass_outer', box(fx, 0.35, a + 0.04, fx + 0.04, 3.0, b - 0.04)); bag.add('granite_black', box(fx - 0.04, 0, a, fx + 0.06, 0.35, b)); col.rect([fx - 0.04, a, fx + 0.06, b], 0, 3.0); }
    bag.add('steel_chrome', box(fx - 0.03, 0, zd0 - 0.05, fx + 0.07, 2.45, zd0)); bag.add('steel_chrome', box(fx - 0.03, 0, zd1, fx + 0.07, 2.45, zd1 + 0.05)); bag.add('steel_chrome', box(fx - 0.03, 2.4, zd0 - 0.05, fx + 0.07, 2.47, zd1 + 0.05));
    bag.add('glass_outer', box(fx, 2.47, zd0, fx + 0.03, 3.0, zd1));
    bag.add('wood_painted', box(fx - 0.06, 3.0, z + 0.05, fx + 0.1, 3.55, z + W - 0.05));
    const fc = FASCIA[Math.floor(R() * FASCIA.length)];
    bag.add(fc, box(fx - 0.1, 3.05, z + 0.2, fx - 0.06, 3.5, z + W - 0.2));
    letters(bag, 'cloth_white', fx - 0.1, 3.12, z + W / 2, 8 + Math.floor(R() * 3), 'x-', R, 0.3, 0.19);
    bag.add(aw[Math.floor(R() * 5)], box(x0 - 0.2, 2.9, z + 0.1, fx, 3.1, z + W - 0.3));
    // out under the arcade: the trade's goods at the door
    const gx = x0 + 1.0;
    if (trade === 'banca' || trade === 'hortifruti' || trade === 'mercearia') { solidBox(bag, col, 'timber', gx, 0.02, z + 0.3, gx + 0.6, 0.55, z + 1.2); for (let j = 0; j < 5; j++) bag.add(trade === 'banca' ? ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white'][j] : ['cloth_red', 'cloth_green', 'cloth_ochre', 'glaze_yellow', 'cloth_red'][j], box(gx + 0.05 + j * 0.1, 0.55, z + 0.4, gx + 0.14 + j * 0.1, 0.55 + (trade === 'banca' ? 0.3 : 0.12), z + 1.1)); }
    else if (trade === 'lanchonete' || trade === 'padaria') { const tx = gx + 0.3, tz = z + 3.2; bag.add('steel_chrome', lathe([[0.03, 0], [0.03, 0.72], [0.001, 0.72]], 6, null, tx, 0, tz)); bag.add('tile_white', lathe([[0.001, 0.72], [0.38, 0.72], [0.38, 0.75], [0.001, 0.75]], 12, null, tx, 0, tz)); col.circle(tx, tz, 0.4, 0, 0.76); stool(bag, tx, tz - 0.62, 0, 0.45, 'cloth_red'); stool(bag, tx, tz + 0.62, 0, 0.45, 'cloth_red'); }
    else if (trade === 'sapataria' || trade === 'armarinho') { bag.add('cloth_blue', box(gx - 0.1, 0.0, z + 0.4, gx + 0.7, 1.0, z + 0.45)); }
    furnish(bag, col, trade, xa, xb, za, zb, R);
    bag.add('cotto_floor', box(fx + 0.05, 0.0, z + 0.1, xb, 0.05, z + W - 0.1)); col.floor([fx + 0.05, z + 0.1, xb, z + W - 0.1], 0.05);
    if (k % 3 === 1) lights.push({ at: [fx + 4.2, 3.0, z + W / 2], color: '#ffe2b0', intensity: 2.2, distance: 8 });
  }
  // the piers of the arcade, the pavement under it
  for (let k = 0; k <= n; k++) { const z = z0u + k * W; bag.add(WHITE, box(x0 + 2.4, 0, z - 0.2, x0 + 2.85, 3.6, z + 0.2)); col.circle(x0 + 2.6, z, 0.3, 0, 3.6); }
  bag.add('marble', box(x0 - 0.3, 0, z0, fx, 0.05, z1)); col.floor([x0 - 0.3, z0, fx, z1], 0.05);
  void CONC;
}
