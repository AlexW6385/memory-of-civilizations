// The Museion lived in (docs/settlements/alexandria.md §14): the scholars at the long tables of the reading halls, the common meal's hall
// with its krater, braziers and diners, and the garden's instruments — Eratosthenes' gnomon on its pedestal over a marked pavement (he
// measured the Earth by the noon shadow at Alexandria against the well at Syene [stated: Wikipedia "Eratosthenes"]), a bronze armillary
// sphere (the instrument tradition gives him [stated, tradition]), stelae, benches, palms and figs, and the talkers in the peripatos.
// Positions follow plan.js (garden [196,-66,296,-36]; peripatos [190,-80,302,-66]; dining hall x 315–327, z -65…-37). [inferred] in form.
import { box, lathe, rod } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { krater, lampstand } from '../greek/house-interior.js';
import { bench, palm, fig, rng, pick, basket } from './dress.js';
import { figureAt } from './house.js';

const GARB = ['cloth_white', 'linen', 'cloth_ochre', 'cloth_white'];
/** reading_fit: { rect (a library hall's rect), front, y, seed } — scholars seated at the benches of its three long tables, one at the door. */
function readingFit(el, ctx) {
  const y = el.y ?? 0, rand = rng(el.seed ?? 5), F = frame(el.rect, el.front ?? 'n'), { D } = F, vi = D / 2;
  const at = (u, v) => F.P(u, v);
  for (let k = 0; k < 3; k++) for (const [sv, tv] of [[vi - 4.2 - 0.95, vi - 4.2], [vi + 4.2 + 0.95, vi + 4.2]]) {
    for (const du of [1.3, 3.9]) {
      if (rand() < 0.4) continue;
      const u = 5 + k * 9 + du, [x, z] = at(u, sv), [tx, tz] = at(u, tv);
      figureAt(ctx, x, z, y, tx - x, tz - z, { seed: Math.floor(rand() * 1e6), dress: 'robe', over: rand() < 0.5 ? 'cape' : 'none', cloth: pick(rand, GARB), skin: 'skin_medium', hair: rand() < 0.3 ? 'shaven' : 'short', beard: rand() < 0.6, pose: 'sit' });
    }
  }
  const [dx, dz] = at(F.L / 2 + 2.2, 3.2), [lx, lz] = at(F.L / 2, 6);
  figureAt(ctx, dx, dz, y, lx - dx, lz - dz, { seed: el.seed + 77, dress: 'robe', over: 'cape', cloth: 'cloth_ochre', skin: 'skin_medium', hair: 'short', beard: true, pose: 'stand', carry: 'staff' });
}
/** dining_fit: { c [x, z] of the hall's middle, y } — the common hall: krater on its stand, braziers, lampstands, diners, a servant. */
function diningFit(el, ctx) {
  const { bag, col, lights } = ctx, [cx, cz] = el.c, y = el.y ?? 0;
  krater(bag, col, cx, cz, y);
  bag.add('bronze', box(cx - 0.35, y + 0.0, cz - 0.35, cx + 0.35, y + 0.03, cz + 0.35));
  for (const dz of [-8, 8]) { const x = cx - 1.6, z = cz + dz; lampstand(ctx, x, z, y, 1.6); }
  for (const dz of [-4.5, 4.5]) {                                            // braziers on tripods
    const x = cx + 0.4, z = cz + dz;
    for (let a = 0; a < 3; a++) bag.add('iron', rod([x + Math.cos(a * 2.09) * 0.3, y, z + Math.sin(a * 2.09) * 0.3], [x + Math.cos(a * 2.09) * 0.12, y + 0.6, z + Math.sin(a * 2.09) * 0.12], 0.025, 4));
    bag.add('bronze', lathe([[0.001, 0], [0.34, 0.1], [0.38, 0.22], [0.3, 0.22], [0.001, 0.06]], 10, null, x, y + 0.6, z)); bag.add('flame', lathe([[0.001, 0], [0.2, 0.02], [0.001, 0.45]], 6, null, x, y + 0.78, z));
    col.circle(x, z, 0.38, y, y + 0.8); lights.push({ at: [x, y + 1.3, z], color: '#ffa04a', intensity: 3, distance: 10 });
  }
  const fig = (x, z, fx, fz, o) => figureAt(ctx, x, z, y, fx, fz, o);
  fig(cx + 1.2, cz - 1.8, -1, 0.4, { seed: 301, dress: 'robe', over: 'cape', cloth: 'cloth_white', hair: 'short', beard: true, skin: 'skin_medium', pose: 'talk' });
  fig(cx + 1.9, cz - 0.9, -1, -0.5, { seed: 302, dress: 'robe', cloth: 'cloth_ochre', hair: 'short', skin: 'skin_medium', pose: 'talk' });
  fig(cx - 0.2, cz + 3.0, 1, 0, { seed: 303, dress: 'tunic', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', carry: 'pot', pose: 'stand' });   // the servant with the water-jar
  fig(cx + 3.4, cz + 0.4, -1, 0, { seed: 304, dress: 'robe', over: 'cape', cloth: 'cloth_white', hair: 'short', beard: true, skin: 'skin_medium', pose: 'stand', carry: 'staff' });   // the priest of the Muses presiding
}
/** garden_fit: { y } — instruments, stelae, benches, trees and talkers in the Museion's garden and peripatos. */
function gardenFit(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, rand = rng(el.seed ?? 3);
  // Eratosthenes' gnomon: a bronze-shod needle of dark stone on a stepped pedestal, in a paved ring marked with the hours' lines
  { const x = 262, z = -51, yp = y + 0.06;
    bag.add('marble_floor', lathe([[0.001, 0], [3.2, 0], [3.2, 0.04], [0.001, 0.04]], 24, null, x, yp, z));
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; bag.add('bronze', rod([x + Math.sin(a) * 0.5, yp + 0.045, z + Math.cos(a) * 0.5], [x + Math.sin(a) * 3.15, yp + 0.045, z + Math.cos(a) * 3.15], 0.012, 3)); }
    bag.add('bronze', lathe([[3.18, 0.04], [3.18, 0.07], [3.1, 0.07], [3.1, 0.04]], 24, null, x, yp, z));
    bag.add('marble', box(x - 0.7, yp, z - 0.7, x + 0.7, yp + 0.3, z + 0.7)); bag.add('marble_smooth', box(x - 0.5, yp + 0.3, z - 0.5, x + 0.5, yp + 1.0, z + 0.5));
    bag.add('granite_black', lathe([[0.2, 0], [0.12, 3.6], [0.001, 3.8]], 8, null, x, yp + 1.0, z)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.13, 0.0], [0.13, 0.1], [0.001, 0.14]], 8, null, x, yp + 4.75, z));
    col.rect([x - 0.7, z - 0.7, x + 0.7, z + 0.7], yp, yp + 4.8); }
  // the armillary: three bronze rings on a stand, the axis tilted to the pole (31° N), a pedestal of limestone
  { const x = 214, z = -41, yp = y + 0.02, T = Math.PI / 2 - 0.54;
    bag.add('limestone', box(x - 0.45, yp, z - 0.45, x + 0.45, yp + 0.9, z + 0.45)); col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], yp, yp + 0.95);
    const ring = (r, rx, ry) => { const g = lathe([[r, 0.0], [r, 0.04], [r - 0.04, 0.04], [r - 0.04, 0]], 20); g.rotateX(rx); g.rotateZ(ry); g.translate(x, yp + 1.6, z); bag.add('bronze', g); };
    ring(0.62, 0, 0); ring(0.58, Math.PI / 2, 0); ring(0.54, Math.PI / 2, Math.PI / 2); ring(0.5, T, 0.4);
    bag.add('bronze', rod([x, yp + 0.9, z], [x, yp + 1.6, z], 0.04, 5)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.1], [0.001, 0.2]], 8, null, x, yp + 1.5, z)); }
  // benches by the paths, stelae with decrees, palms and figs in the beds, the beds' borders
  for (const x of [205, 222, 248, 270, 286]) { bench(bag, col, [x, -47.2, x + 2.0, -46.6], y + 0.06, 'marble'); bench(bag, col, [x + 3, -55.4, x + 5.0, -54.8], y + 0.06, 'marble'); }
  for (const [x, z] of [[212, -62], [222, -61], [250, -62], [276, -61], [290, -62], [250, -40], [276, -39], [290, -40], [222, -40]]) palm(bag, col, x, y + 0.02, z, 5.0 + rand() * 2.2, Math.round(x * 3 + z));
  for (const [x, z] of [[244, -61], [284, -60], [244, -41], [296 - 3, -45]]) fig(bag, col, x, y + 0.02, z, 3.2, Math.round(x + z));
  for (const x of [200, 255, 290]) { bag.add('marble_smooth', box(x, y + 0.06, -66.6, x + 0.7, y + 2.2, -66.3)); bag.add('limestone', box(x - 0.1, y + 0.06, -66.8, x + 0.8, y + 0.3, -66.1)); col.rect([x - 0.1, -66.8, x + 0.8, -66.1], y, y + 2.2); }
  // the peripatos: scholars walking and talking in pairs under the colonnade, a boy with a basket of scrolls
  const P = [[226, -70.2, 0], [227.3, -69.6, 2.8], [262, -71.2, 3.6], [263.2, -70.6, 0.3], [281, -69.8, 3.0], [282.2, -70.4, 0.1]];
  P.forEach(([x, z, r], i) => figureAt(ctx, x, z, y, Math.sin(r), -Math.cos(r), { seed: 500 + i, dress: 'robe', over: i % 2 ? 'cape' : 'none', cloth: pick(rand, GARB), skin: 'skin_medium', hair: 'short', beard: i % 3 !== 0, pose: 'talk' }));
  figureAt(ctx, 244, -70, y, 1, 0, { seed: 520, dress: 'tunic', cloth: 'linen', skin: 'skin_dark', hair: 'shaven', carry: 'basket', pose: 'stand' });
  basket(bag, 246.2, y, -69.2, 0.3, 0.3, 'ivory');
}
export const MUSEION_FIT = { reading_fit: readingFit, dining_fit: diningFit, garden_fit: gardenFit };
