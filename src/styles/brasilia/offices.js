// Brasília style — the second core of a ministry (docs/settlements/brasilia.md §12): a 6 × 6 m room under the slab beside the lobby,
// entered by a glazed door from the pilotis, whose use differs from ministry to ministry by the seed: the staff canteen, the library,
// the post and bank agency, the press room. The trades are those a federal ministry kept on its ground floor [inferred].
import { box, lathe } from '../../core/geom.js';
import { solidBox, shelving, stool, letters } from './kit.js';

const WHITE = 'plaster_white';
export const CORE_KINDS = ['canteen', 'library', 'post', 'press'];

/** coreRoom: the walls, door, floor and furnishing of one core. x0..x1 the room's outer span, zc its middle, y0 the slab's underside. */
export function coreRoom(bag, col, lights, { x0, x1, zc, y0, kind, rand }) {
  const T = 0.3, zs = zc - 3, ze = zc + 3, dxm = (x0 + x1) / 2, door = [dxm - 0.9, dxm + 0.9];
  const ix0 = x0 + T, ix1 = x1 - T, iz0 = zs + 0.2, iz1 = ze - T;
  solidBox(bag, col, WHITE, x0, 0, zs, x0 + T, y0, ze); solidBox(bag, col, WHITE, x1 - T, 0, zs, x1, y0, ze); solidBox(bag, col, WHITE, x0 + T, 0, ze - T, x1 - T, y0, ze);
  for (const [a, b] of [[x0 + T, door[0]], [door[1], x1 - T]]) { bag.add('glass_outer', box(a, 0.1, zs, b, 3.0, zs + 0.06)); col.rect([a, zs, b, zs + 0.08], 0, 3.0); bag.add(WHITE, box(a, 3.0, zs - 0.02, b, y0, zs + T)); col.rect([a, zs, b, zs + T], 3.0, y0); }
  bag.add(WHITE, box(door[0], 3.0, zs - 0.02, door[1], y0, zs + T)); col.rect([door[0], zs, door[1], zs + T], 3.0, y0);
  bag.add('steel_chrome', box(door[0] - 0.05, 0, zs - 0.03, door[0], 3.0, zs + 0.08)); bag.add('steel_chrome', box(door[1], 0, zs - 0.03, door[1] + 0.05, 3.0, zs + 0.08));
  letters(bag, 'cloth_white', dxm, 3.45, zs - 0.02, kind === 'post' ? 6 : 8, 'z-', rand, 0.3, 0.24);
  bag.add(kind === 'post' ? 'marble_dark' : 'marble_floor', box(ix0, 0, zs, ix1, 0.05, iz1)); col.floor([ix0, zs, ix1, iz1], 0.05);
  bag.add('lamp_white', box(dxm - 1.0, y0 - 0.12, zc - 0.3, dxm + 1.0, y0 - 0.02, zc + 0.3));
  lights.push({ at: [dxm, 3.3, zc], color: kind === 'canteen' ? '#ffe2b0' : '#fff0d0', intensity: 2.4, distance: 8 });
  const Y = 0.05, sideW = ix0 + 1.8, sideE = ix1 - 1.8;      // the two side zones are 1.8 m wide, the door's aisle between them stays clear
  if (kind === 'canteen') {
    // the serving counter on the back wall: steel top, the urn, stacked trays, a rail; menu board above; two tables with four stools each
    solidBox(bag, col, 'timber', ix0 + 0.2, Y, iz1 - 1.1, ix1 - 0.2, 1.0, iz1 - 0.4); bag.add('steel_chrome', box(ix0 + 0.15, 1.0, iz1 - 1.15, ix1 - 0.15, 1.04, iz1 - 0.35));
    bag.add('steel_chrome', lathe([[0.001, 0], [0.2, 0.02], [0.22, 0.55], [0.14, 0.65], [0.001, 0.66]], 10, null, ix0 + 1.0, 1.04, iz1 - 0.8));
    for (let k = 0; k < 4; k++) bag.add('steel_grey', box(dxm - 0.6 + k * 0.3, 1.04, iz1 - 1.0, dxm - 0.36 + k * 0.3, 1.1 + k * 0.04, iz1 - 0.6));
    for (let k = 0; k < 6; k++) bag.add(['glaze_white', 'cloth_ochre', 'cloth_red'][k % 3], lathe([[0.001, 0], [0.12, 0], [0.13, 0.08], [0.001, 0.08]], 8, null, ix1 - 1.8 + (k % 3) * 0.35, 1.04, iz1 - 0.95 + Math.floor(k / 3) * 0.3));
    bag.add('steel_chrome', box(ix0 + 0.3, 0.8, iz1 - 1.9, ix1 - 0.3, 0.84, iz1 - 1.86));                     // the tray rail in front
    bag.add('cloth_black', box(dxm - 1.2, 1.8, iz1 + 0.0 - 0.04, dxm + 1.2, 2.6, iz1 - 0.01)); for (let k = 0; k < 4; k++) bag.add('cloth_white', box(dxm - 1.0, 1.95 + k * 0.15, iz1 - 0.07, dxm - 1.0 + 1.0 + (k % 2) * 0.7, 2.0 + k * 0.15, iz1 - 0.05));
    for (const tx of [ix0 + 0.35, ix1 - 1.55]) { const tz = iz0 + 1.3;
      solidBox(bag, col, 'timber', tx, Y + 0.7, tz, tx + 1.2, 0.78, tz + 0.8); bag.add('steel_chrome', box(tx + 0.55, Y, tz + 0.35, tx + 0.65, Y + 0.7, tz + 0.45)); col.circle(tx + 0.6, tz + 0.4, 0.15, Y, 0.78);
      for (const [sx, sz] of [[0.3, -0.35], [0.9, -0.35], [0.3, 1.15], [0.9, 1.15]]) { stool(bag, tx + sx, tz + sz, Y, 0.5); col.circle(tx + sx, tz + sz, 0.2, Y, 0.5); }
      bag.add('glaze_white', box(tx + 0.2, 0.78, tz + 0.2, tx + 0.5, 0.8, tz + 0.5)); bag.add('cloth_ochre', box(tx + 0.7, 0.78, tz + 0.3, tx + 0.95, 0.83, tz + 0.55)); }
    for (const x of [ix0 + 0.4, ix1 - 0.4]) { bag.add('terracotta', lathe([[0.2, 0], [0.25, 0.4], [0.001, 0.4]], 8, null, x, Y, iz1 - 2.4)); bag.add('palm_leaf', lathe([[0.001, 0], [0.4, 0.2], [0.5, 0.7], [0.001, 1.2]], 8, null, x, Y + 0.4, iz1 - 2.4)); col.circle(x, iz1 - 2.4, 0.3, Y, 1.5); }
  } else if (kind === 'library') {
    // shelving along both side walls with the books, a reading table with four chairs, a card-index cabinet and a globe on the back wall
    shelving(bag, col, [ix0, iz0 + 0.6, ix0 + 0.4, iz1 - 0.2], Y, 5, ['cloth_maroon', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_white'], rand, { h: [0.2, 0.3], gap: 0.4 });
    shelving(bag, col, [ix1 - 0.4, iz0 + 0.6, ix1, iz1 - 0.2], Y, 5, ['cloth_maroon', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_white'], rand, { h: [0.2, 0.3], gap: 0.4 });
    solidBox(bag, col, 'timber', dxm - 0.9, Y + 0.68, zc - 0.6, dxm + 0.9, Y + 0.74, zc + 0.6); for (const [a, b] of [[-0.8, -0.5], [0.7, -0.5], [-0.8, 0.45], [0.7, 0.45]]) bag.add('timber', box(dxm + a, Y, zc + b, dxm + a + 0.1, Y + 0.68, zc + b + 0.1));
    for (const [a, b] of [[-0.4, -1.0], [0.4, -1.0], [-0.4, 1.0], [0.4, 1.0]]) { stool(bag, dxm + a, zc + b, Y, 0.46, 'timber'); col.circle(dxm + a, zc + b, 0.2, Y, 0.46); }
    for (let k = 0; k < 3; k++) bag.add(['cloth_blue', 'cloth_ochre', 'cloth_white'][k], box(dxm - 0.6 + k * 0.45, Y + 0.74, zc - 0.3 + (k % 2) * 0.15, dxm - 0.25 + k * 0.45, Y + 0.78, zc + 0.1 + (k % 2) * 0.15));
    bag.add('lamp_white', box(dxm - 0.15, Y + 0.74, zc - 0.05, dxm + 0.15, Y + 0.98, zc + 0.05));
    solidBox(bag, col, 'wood_painted', dxm - 1.0, Y, iz1 - 0.7, dxm + 1.0, 1.15, iz1 - 0.2); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) bag.add('steel_chrome', box(dxm - 0.9 + c * 0.32, 0.25 + r * 0.3, iz1 - 0.72, dxm - 0.7 + c * 0.32, 0.45 + r * 0.3, iz1 - 0.7));
    bag.add('steel_chrome', lathe([[0.001, 0], [0.12, 0.02], [0.03, 0.06], [0.03, 0.16]], 8, null, dxm - 0.6, 1.15, iz1 - 0.45)); bag.add('cloth_blue', lathe([[0.001, 0], [0.18, 0.1], [0.2, 0.2], [0.18, 0.3], [0.001, 0.4]], 10, null, dxm - 0.6, 1.3, iz1 - 0.45));
  } else if (kind === 'post') {
    // the post-and-bank agency: a long counter across the room behind a brass grille, two clerks' windows, pigeonholes on the wall, a queue rail, a red letter box
    const cz = iz1 - 2.2;
    solidBox(bag, col, 'timber', ix0, Y, cz, sideW - 0.2 + 0.2, 1.05, cz + 0.6); solidBox(bag, col, 'timber', sideE + 0.2 - 0.2, Y, cz, ix1, 1.05, cz + 0.6);
    for (const [a, b] of [[ix0, sideW], [sideE, ix1]]) { bag.add('marble', box(a - 0.03, 1.05, cz - 0.05, b + 0.03, 1.1, cz + 0.65)); bag.add('steel_chrome', box(a, 1.1, cz + 0.3, b, 1.14, cz + 0.34)); for (let k = 0; k <= 6; k++) bag.add('steel_chrome', box(a + k * (b - a - 0.03) / 6, 1.14, cz + 0.3, a + 0.03 + k * (b - a - 0.03) / 6, 2.0, cz + 0.33)); }
    for (const [a, b] of [[ix0, sideW], [sideE, ix1]]) { bag.add('timber', box(a, 1.1, iz1 - 0.6, b, 2.3, iz1)); col.rect([a, iz1 - 0.6, b, iz1], 1.1, 2.3); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) bag.add(r % 2 ? 'cloth_white' : 'cloth_ochre', box(dxm - 1.4 + c * 0.35, 0.3 + r * 0.45, iz1 - 0.1, dxm - 1.4 + c * 0.35 + 0.3, 0.6 + r * 0.45, iz1 - 0.05));   // the pigeonholes' fronts on the back wall
    // the queue rail of steel posts and rope before the windows, and the red post box by the door
    for (let k = 0; k < 4; k++) { const px = ix0 + 0.4 + k * 0.5; bag.add('steel_chrome', lathe([[0.1, 0], [0.025, 0.05], [0.025, 0.95], [0.001, 0.97]], 6, null, px, Y, cz - 1.0)); col.circle(px, cz - 1.0, 0.1, Y, 0.97); }
    for (let k = 0; k < 4; k++) { const px = ix1 - 0.4 - k * 0.5; bag.add('steel_chrome', lathe([[0.1, 0], [0.025, 0.05], [0.025, 0.95], [0.001, 0.97]], 6, null, px, Y, cz - 1.0)); col.circle(px, cz - 1.0, 0.1, Y, 0.97); }
    bag.add('cloth_red', box(ix0 + 0.4, 0.78, cz - 1.03, ix0 + 2.0, 0.82, cz - 0.97)); bag.add('cloth_red', box(ix1 - 2.0, 0.78, cz - 1.03, ix1 - 0.4, 0.82, cz - 0.97));
    solidBox(bag, col, 'cloth_red', ix1 - 0.9, Y, iz0 + 0.3, ix1 - 0.3, 1.1, iz0 + 0.9); bag.add('steel_grey', box(ix1 - 0.85, 0.9, iz0 + 0.28, ix1 - 0.35, 0.95, iz0 + 0.3));
    bag.add('steel_grey', box(ix0 + 0.6, 1.1, cz + 0.1, ix0 + 1.1, 1.18, cz + 0.5)); bag.add('steel_chrome', box(ix1 - 1.1, 1.1, cz + 0.1, ix1 - 0.7, 1.4, cz + 0.4));     // the scale and the stamp press
  } else {
    // the press room: three desks with typewriters and telephones, a teleprinter with its roll of paper, a board of cuttings, pigeonholes for the correspondents
    for (const [dx, dz, face] of [[ix0 + 0.2, iz0 + 0.5, 1], [ix1 - 1.6, iz0 + 0.5, -1], [ix0 + 0.2, iz0 + 2.6, 1], [ix1 - 1.6, iz0 + 2.6, -1]]) {
      solidBox(bag, col, 'timber', dx, Y + 0.68, dz, dx + 1.4, Y + 0.76, dz + 0.8); for (const [a, b] of [[0.05, 0.05], [1.25, 0.05], [0.05, 0.65], [1.25, 0.65]]) bag.add('steel_grey', box(dx + a, Y, dz + b, dx + a + 0.08, Y + 0.68, dz + b + 0.08));
      bag.add('steel_grey', box(dx + 0.4, Y + 0.76, dz + 0.2, dx + 0.9, Y + 0.95, dz + 0.6)); bag.add('cloth_white', box(dx + 0.5, Y + 0.95, dz + 0.55, dx + 0.8, Y + 1.15, dz + 0.58));
      bag.add('steel_chrome', box(dx + 1.05, Y + 0.76, dz + 0.15, dx + 1.3, Y + 0.84, dz + 0.4));
      const sz = dz + 1.1; stool(bag, dx + 0.7, sz, Y, 0.48); col.circle(dx + 0.7, sz, 0.2, Y, 0.48); void face; }
    solidBox(bag, col, 'steel_grey', dxm - 0.5, Y, iz1 - 0.7, dxm + 0.5, 1.0, iz1 - 0.2); bag.add('cloth_white', box(dxm - 0.3, 1.0, iz1 - 0.45, dxm + 0.3, 1.5, iz1 - 0.4)); bag.add('cloth_white', box(dxm - 0.2, 0.3, iz1 - 0.2, dxm + 0.2, 0.7, iz1 - 0.12));
    bag.add('cloth_ochre', box(dxm - 1.6, 1.4, iz1 - 0.04, dxm - 0.7, 2.4, iz1)); for (let k = 0; k < 7; k++) bag.add('cloth_white', box(dxm - 1.5 + (k % 4) * 0.2, 1.5 + Math.floor(k / 4) * 0.4, iz1 - 0.08, dxm - 1.35 + (k % 4) * 0.2, 1.8 + Math.floor(k / 4) * 0.4, iz1 - 0.06));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) bag.add(r % 2 ? 'cloth_white' : 'cloth_ochre', box(dxm + 0.7 + c * 0.28, 1.2 + r * 0.4, iz1 - 0.1, dxm + 0.7 + c * 0.28 + 0.24, 1.5 + r * 0.4, iz1 - 0.05));
  }
}
