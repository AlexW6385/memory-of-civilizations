// Brasília style — a ministry of the Esplanade: ten floors of green glass in a white frame over open pilotis; no two alike at eye level
// (blinds drawn on some floors, rain streaks on the end walls, a different roof), a furnished lobby one can enter, the porters' counter,
// benches, planters and the flag under the pilotis.
import { box, lathe, rod } from '../../core/geom.js';
import { rngOf, solidBox, shrub, stool, letters } from './kit.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const BLIND = ['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_blue'];

/** ministry: { rect (16 × 52 m, long along z), side ('n' the lawn at its south end, 's' at its north end), h, seed }. */
export function ministry(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 38, y0 = 4.6, front = el.side === 'n' ? 1 : -1, rand = rngOf(el.seed * 13 + 5);
  bag.add('facade_glass', box(x0 + 0.3, y0, z0 + 0.3, x1 - 0.3, h, z1 - 0.3));
  for (let y = y0; y < h - 0.1; y += 3.7) for (const [a, b] of [[x0, x0 + 0.35], [x1 - 0.35, x1]]) bag.add(WHITE, box(a, y, z0, b, y + 0.34, z1));
  for (const zz of [z0, z1 - 0.4]) bag.add(WHITE, box(x0, y0, zz, x1, h, zz + 0.4));
  for (let k = 0; k < 10; k++) for (const dx of [3.0, 9.0]) bag.add('glass_outer', box(x0 + dx, y0 + 1.0 + k * 3.7, front > 0 ? z1 : z0 - 0.03, x0 + dx + 4.0, y0 + 2.8 + k * 3.7, front > 0 ? z1 + 0.03 : z0));
  // the blinds: on the lower floors, here and there a window strip is drawn (every ministry its own pattern), on both long faces
  const nb = 3 + Math.floor(rand() * 3);
  for (let f = 0; f < 6; f++) for (const [xa, xb] of [[x0 + 0.18, x0 + 0.3], [x1 - 0.3, x1 - 0.18]]) {
    for (let z = z0 + 1.2; z < z1 - 3; z += 1.8) if (rand() < 0.1 + nb * 0.035) bag.add(BLIND[Math.floor(rand() * BLIND.length)], box(xa, y0 + 0.5 + f * 3.7, z, xb, y0 + 0.5 + f * 3.7 + 1.9 * (0.4 + rand() * 0.6), z + 1.7));
  }
  // rain streaks down the blank back end (the weather of the rains) and under the front windows' sills
  for (let k = 0; k < 14; k++) { const x = x0 + 1 + rand() * (x1 - x0 - 2), len = 5 + rand() * 18; bag.add('plaster_streak', box(x, h - 0.4 - len, front > 0 ? z0 - 0.02 : z1, x + 0.35 + rand() * 0.4, h - 0.4, front > 0 ? z0 : z1 + 0.02)); }
  // the roof: the parapet, the machine room, tanks, the aerials and the lift head — each ministry its own mix
  bag.add(WHITE, box(x0 - 0.5, h, z0 - 0.5, x1 + 0.5, h + 0.9, z1 + 0.5)); bag.add(CONC, box(x0 + 5, h + 0.9, z0 + 8 + rand() * 6, x1 - 5, h + 3.4, z0 + 16 + rand() * 6));
  bag.add(WHITE, lathe([[2.2, 0], [2.2, 2.4], [0.001, 2.4]], 12, null, (x0 + x1) / 2, h + 0.9, z1 - 8 - rand() * 8));
  for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) { const ax = x0 + 2 + rand() * (x1 - x0 - 4), az = z0 + 3 + rand() * (z1 - z0 - 6), ah = 4 + rand() * 9; bag.add('steel_grey', rod([ax, h + 0.9, az], [ax, h + 0.9 + ah, az], 0.04, 5)); bag.add('steel_grey', rod([ax - 0.6, h + 0.9 + ah * 0.8, az], [ax + 0.6, h + 0.9 + ah * 0.8, az], 0.02, 4)); }
  // pilotis: slender piers along both long faces and two cores
  for (let z = z0 + 3; z < z1; z += 6.5) for (const x of [x0 + 1.0, x1 - 1.0]) { bag.add(WHITE, box(x - 0.4, 0, z - 0.4, x + 0.4, y0, z + 0.4)); col.circle(x, z, 0.5, 0, y0); }
  bag.add('marble', box(x0 + 0.5, 0.0, z0, x1 - 0.5, 0.04, z1)); bag.add('timber', box(x0 + 3, 0.0, front > 0 ? z1 - 5 : z0, x1 - 3, 0.9, front > 0 ? z1 : z0 + 5));
  col.rect([x0 + 3, front > 0 ? z1 - 5 : z0, x1 - 3, front > 0 ? z1 : z0 + 5], 0, 0.95);
  col.rect([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y0, h);
  // the lobby: the first core's room, its glazed door toward the pilotis' middle; the second core stays a closed stair
  const zcs = [z0 + (z1 - z0) * 0.3, z0 + (z1 - z0) * 0.7], cx0 = x0 + 5, cx1 = x1 - 5, T = 0.3;
  // (the cores are closed boxes of 6 m; the lobby is entered from the side of the nearer end)
  const stair = (zc) => { solidBox(bag, col, WHITE, cx0, 0, zc - 3, cx1, y0, zc + 3); bag.add('glass_outer', box(cx0 + 0.5, 0.1, zc - 3.04, cx1 - 0.5, 3.0, zc - 3)); bag.add('glass_outer', box(cx0 + 0.5, 0.1, zc + 3, cx1 - 0.5, 3.0, zc + 3.04)); };
  stair(zcs[1]);
  {
    const zc = zcs[0], zs = zc - 3, ze = zc + 3, dxm = (cx0 + cx1) / 2;
    const door = [dxm - 0.9, dxm + 0.9];
    // walls: sides full, the faces toward the end (z−) with the door's gap; the other face solid
    solidBox(bag, col, WHITE, cx0, 0, zs, cx0 + T, y0, ze); solidBox(bag, col, WHITE, cx1 - T, 0, zs, cx1, y0, ze); solidBox(bag, col, WHITE, cx0 + T, 0, ze - T, cx1 - T, y0, ze);
    for (const [a, b] of [[cx0 + T, door[0]], [door[1], cx1 - T]]) { bag.add('glass_outer', box(a, 0.1, zs, b, 3.0, zs + 0.06)); col.rect([a, zs, b, zs + 0.08], 0, 3.0); bag.add(WHITE, box(a, 3.0, zs - 0.02, b, y0, zs + T)); col.rect([a, zs, b, zs + T], 3.0, y0); }
    bag.add(WHITE, box(door[0], 3.0, zs - 0.02, door[1], y0, zs + T)); col.rect([door[0], zs, door[1], zs + T], 3.0, y0);
    bag.add('steel_chrome', box(door[0] - 0.05, 0, zs - 0.03, door[0], 3.0, zs + 0.08)); bag.add('steel_chrome', box(door[1], 0, zs - 0.03, door[1] + 0.05, 3.0, zs + 0.08));
    bag.add('marble_dark', box(cx0 + T, 0.0, zs, cx1 - T, 0.05, ze - T)); col.floor([cx0 + T, zs, cx1 - T, ze - T], 0.05);
    // inside: the lift doors on the back wall with their call plates, a bench, a notice board, plants, a ceiling light
    for (let k = 0; k < 2; k++) bag.add('steel_chrome', box(dxm - 1.4 + k * 1.5, 0.0, ze - T - 0.03, dxm - 0.2 + k * 1.5, 2.2, ze - T));
    bag.add('steel_grey', box(dxm - 1.6, 1.0, ze - T - 0.04, dxm - 1.5, 1.3, ze - T)); letters(bag, 'cloth_white', dxm, 2.4, ze - T - 0.03, 5, 'z-', rand, 0.25, 0.2);
    solidBox(bag, col, 'leather_bench', cx0 + T + 0.2, 0.0, zs + 1.2, cx0 + T + 0.7, 0.45, zs + 3.4);
    bag.add('cloth_green', box(cx1 - T - 0.04, 1.3, zs + 1.0, cx1 - T, 2.1, zs + 2.4));
    shrub(bag, cx1 - T - 0.6, zs + 4.4, 0.0, 0.5, 'palm_leaf'); bag.add('terracotta', lathe([[0.2, 0], [0.25, 0.4], [0.001, 0.4]], 8, null, cx1 - T - 0.6, 0, zs + 4.4));
    bag.add('lamp_white', box(dxm - 0.5, y0 - 0.12, zc - 0.3, dxm + 0.5, y0 - 0.02, zc + 0.3));
    lights.push({ at: [dxm, 3.3, zc], color: '#fff0d0', intensity: 2.5, distance: 8 });
  }
  // under the pilotis: the porters' desk with a flag, benches and planters of the staff's lunch hour, the notice board
  const zf = front > 0 ? z1 - 5 : z0 + 5, sg = front > 0 ? -1 : 1;
  const fx = x0 + 2.0, fz = front > 0 ? z1 - 1.3 : z0 + 1.3;
  bag.add('steel_chrome', lathe([[0.06, 0], [0.04, 4.0], [0.001, 4.1]], 6, null, fx, 0, fz)); col.circle(fx, fz, 0.1, 0, 4);
  bag.add('cloth_green', box(fx + 0.04, 2.6, fz - 0.02, fx + 1.5, 3.9, fz + 0.02)); bag.add('cloth_ochre', box(fx + 0.3, 2.95, fz - 0.03, fx + 1.2, 3.55, fz + 0.03));
  for (const bx of [x0 + 2.5, x1 - 4.5]) { solidBox(bag, col, 'timber', bx, 0.42, zf + sg * 3.2 - 0.3, bx + 1.8, 0.48, zf + sg * 3.2 + 0.3); for (const e of [0.1, 1.6]) bag.add(CONC, box(bx + e, 0, zf + sg * 3.2 - 0.25, bx + e + 0.1, 0.42, zf + sg * 3.2 + 0.25)); }
  for (const [px, pz] of [[x0 + 1.0, zf + sg * 6.5], [x1 - 1.0, zf + sg * 6.5], [x0 + 1.0, zf + sg * 12], [x1 - 1.0, zf + sg * 12]]) { solidBox(bag, col, CONC, px - 0.5, 0, pz - 0.5, px + 0.5, 0.5, pz + 0.5); shrub(bag, px, pz, 0.5, 0.45, 'palm_leaf'); }
  stool; void stool;
}
