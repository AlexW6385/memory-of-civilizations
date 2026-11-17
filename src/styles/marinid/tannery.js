// The Chouara tannery (docs/settlements/fez.md §6): a yard of stone vats in rows, the pale ones for the lime and pigeon-dung
// baths, the dye vats red, yellow, blue, green and brown, narrow walks between them; the houses of the leather shops three storeys
// round it with hides drying on their roofs, a terrace over the yard from which the work is seen, the river at the south side.
import { box, lathe, disc } from '../../core/geom.js';
import { frame } from '../mamluk/kit.js';
import { rng } from './kit.js';
import { shop } from './souk.js';
import * as F from '../mughal/furnish.js';

const LIQ = ['limewash_white', 'limewash_white', 'plaster_white', 'cloth_red', 'paint_ochre', 'paint_blue', 'cloth_green', 'cloth_brown', 'cloth_maroon', 'cloth_ochre', 'cloth_red', 'paint_ochre'];
/** The pit field: pits' centres, [x, z, kind index], for the workers placed by the town plan. */
export function pits(rect) {
  const [x0, z0, x1, z1] = rect, out = [];
  const px = x0 + 11, pz = z0 + 13, cols = 12, rows = 10, pitch = 2.9;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wide = i === 4 || i === 8; const cx = px + i * pitch + (i > 4 ? 0.9 : 0) + (i > 8 ? 0.9 : 0) + 1.1;
    out.push({ x: cx, z: pz + j * pitch + (j > 4 ? 0.9 : 0) + 1.1, i, j, liq: LIQ[(i * 5 + j * 3 + (i > 3 ? 4 : 0)) % LIQ.length], wide });
  }
  return out;
}
export function tannery(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 21);
  // the yard's floor: stone flags; the walks between the vats are the floor itself
  bag.add('flagstone', box(x0, y - 0.4, z0, x1, y, z1)); col.floor(el.rect, y);
  const P = pits(el.rect);
  for (const p of P) {
    const s = 1.1, round = (p.i * 7 + p.j * 3) % 5 === 0, dyed = p.liq !== 'limewash_white' && p.liq !== 'plaster_white';
    if (round) {
      // a round vat: a whitewashed drum, a stone lip, the liquor a hand's breadth below it
      bag.add('plaster_white', lathe([[s, 0], [s, 0.5], [0.001, 0.5]], 18, null, p.x, y, p.z));
      bag.add('limestone', lathe([[s + 0.03, 0.5], [s + 0.03, 0.62], [s - 0.17, 0.62], [s - 0.17, 0.5]], 18, null, p.x, y, p.z));
      bag.add(p.liq, disc(s - 0.17, y + 0.53, 18, p.x, p.z)); col.circle(p.x, p.z, s + 0.03, y, y + 0.62);
    } else {
      bag.add('plaster_white', box(p.x - s, y, p.z - s, p.x + s, y + 0.5, p.z + s));
      // the lip: four stone slabs 0.17 wide, so the liquor lies below the rim and the inside wall shows
      for (const [a, b, c, d] of [[-s - 0.03, -s - 0.03, s + 0.03, -s + 0.17], [-s - 0.03, s - 0.17, s + 0.03, s + 0.03], [-s - 0.03, -s + 0.17, -s + 0.17, s - 0.17], [s - 0.17, -s + 0.17, s + 0.03, s - 0.17]]) bag.add('limestone', box(p.x + a, y + 0.5, p.z + b, p.x + c, y + 0.62, p.z + d));
      bag.add(p.liq, box(p.x - s + 0.17, y + 0.5, p.z - s + 0.17, p.x + s - 0.17, y + 0.53, p.z + s - 0.17));
      col.rect([p.x - s - 0.03, p.z - s - 0.03, p.x + s + 0.03, p.z + s + 0.03], y, y + 0.62);
    }
    // hides floating in some of the dye vats, a stick across the vat
    if (dyed && rand() < 0.45) bag.add('hide_tan', box(p.x - 0.5, y + 0.53, p.z - 0.4, p.x + 0.3, y + 0.545, p.z + 0.5));
    if (!round && rand() < 0.2) bag.add('timber', box(p.x - s + 0.1, y + 0.62, p.z - 0.03, p.x + s - 0.1, y + 0.67, p.z + 0.03));
    // a heap of dye stuff (poppy, henna, saffron, indigo cake) on the rim's corner; a skin hung over the rim to drain
    if (dyed && rand() < 0.5) bag.add(p.liq, lathe([[0.16, 0], [0.1, 0.1], [0.001, 0.2]], 7, null, p.x + s - 0.1, y + 0.62, p.z + s - 0.1));
    if (!round && rand() < 0.2) { bag.add('hide_tan', box(p.x - 0.4, y + 0.62, p.z + s - 0.17, p.x + 0.4, y + 0.64, p.z + s + 0.03)); bag.add('hide_tan', box(p.x - 0.4, y + 0.2, p.z + s + 0.03, p.x + 0.4, y + 0.64, p.z + s + 0.05)); }
  }
  // salted hides in stacks at the walk's ends; baskets of dye plants; pots of dye stuff
  for (let k = 0; k < 9; k++) { const x = x0 + 8 + rand() * (x1 - x0 - 18), z = z0 + 9 + rand() * 4; bag.add(k % 2 ? 'hide_white' : 'hide_tan', box(x - 0.5, y, z - 0.4, x + 0.5, y + 0.25 + rand() * 0.3, z + 0.4)); }
  for (let k = 0; k < 6; k++) { const x = x0 + 8 + rand() * (x1 - x0 - 18), z = z1 - 4 - rand() * 3; bag.add(['paint_ochre', 'cloth_red', 'cloth_green'][k % 3], lathe([[0.3, 0], [0.34, 0.2], [0.2, 0.28], [0.001, 0.3]], 8, null, x, y, z)); }
  // the shops along the north side, their fronts to the yard, a terrace walk above on arches (reached by a stair at its west end)
  const sw = 2.9;
  for (let x = x0 + 0.5; x + sw < x1 - 0.5; x += sw) shop(bag, col, [x, z0, x + sw, z0 + 9], 's', y, ['leather', 'slipper', 'leather'][Math.floor(rand() * 3)], rand, { top: 10.6 });
  const ty = y + 3.7, tz = [z0 + 9.3, z0 + 12.0], tx = [x0 + 17, x1 - 9];
  bag.add('cedar', box(tx[0], ty - 0.5, tz[0], tx[1], ty, tz[1])); col.floor([tx[0], tz[0], tx[1], tz[1]], ty);
  for (let x = tx[0]; x <= tx[1] + 0.01; x += 3.4) { bag.add('limestone', box(x - 0.25, y, tz[1] - 0.5, x + 0.25, ty - 0.5, tz[1])); col.rect([x - 0.25, tz[1] - 0.5, x + 0.25, tz[1]], y, ty); }
  for (let x = tx[0]; x < tx[1] - 0.2; x += 0.16) bag.add('cedar', box(x, ty, tz[1] - 0.03, x + 0.03, ty + 1.0, tz[1])); 
  bag.add('cedar', box(tx[0], ty + 1.0, tz[1] - 0.05, tx[1], ty + 1.07, tz[1] + 0.03)); col.segment([tx[0], tz[1] - 0.02], [tx[1], tz[1] - 0.02], 0.1, ty, ty + 1.0);
  { const sx = [x0 + 8, tx[0]], n = 22, rise = 3.7; for (let i = 0; i < n; i++) bag.add('limestone', box(sx[0] + (sx[1] - sx[0]) * i / n, y, tz[0] + 0.2, sx[0] + (sx[1] - sx[0]) * (i + 1) / n, y + rise * (i + 1) / n, tz[0] + 1.9)); col.ramp([sx[0], tz[0] + 0.2, sx[1], tz[0] + 1.9], y, ty, 'e'); }
  // west and east ranges: the tanners' houses, with the hides spread on their roofs
  const W = [x0, z0 + 9, x0 + 7, z0 + 24], E = [x1 - 7, z0 + 9, x1, z1 - 2];
  for (const r of [W, E]) { bag.add('stucco_ochre', box(r[0], y - 0.4, r[1], r[2], y + 10.2, r[3])); col.rect(r, y, y + 10.2); bag.add('plaster_white', box(r[0], y + 10.2, r[1], r[2], y + 10.35, r[3])); for (const [ux, uz] of [[r[0], r[1]], [r[2] - 0.3, r[1]]]) void ux; }
  // windows in the ranges' yard faces: dark, with lattices
  for (const [r, fx, n] of [[W, W[2], 1], [E, E[0], -1]]) for (let z = r[1] + 2; z < r[3] - 1; z += 3) for (const yk of [2.2, 5.6, 8.8]) { bag.add('opening', box(Math.min(fx, fx + n * 0.05), y + yk, z - 0.3, Math.max(fx, fx + n * 0.05), y + yk + 1.0, z + 0.3)); }
  // timber galleries on the yard faces of the ranges (the tanners' working balconies), hides drying over their rails
  for (const [r, fx, n, levels] of [[W, W[2], 1, [5.3]], [E, E[0], -1, [5.3, 8.5]]]) for (const yk of levels) {
    const xa = n > 0 ? fx : fx - 1.1, xb = n > 0 ? fx + 1.1 : fx, zA = r[1] + 0.6, zB = r[3] - 0.6, yb = y + yk, xo = n > 0 ? xb : xa;
    bag.add('cedar', box(xa, yb, zA, xb, yb + 0.1, zB));
    for (let z = zA + 0.3; z < zB; z += 1.4) { bag.add('cedar', box(xa, yb - 0.22, z - 0.06, xb, yb, z + 0.06)); const bx = n > 0 ? xb - 0.1 : xa; bag.add('cedar', box(bx, yb - 0.6, z - 0.05, bx + 0.1, yb - 0.22, z + 0.05)); }
    const rx = n > 0 ? xb - 0.06 : xa;
    bag.add('cedar', box(rx, yb + 1.0, zA, rx + 0.06, yb + 1.07, zB)); bag.add('cedar', box(rx, yb + 0.5, zA, rx + 0.06, yb + 0.55, zB));
    for (let z = zA; z <= zB + 0.01; z += 1.4) bag.add('cedar', box(rx - 0.01, yb + 0.1, z - 0.04, rx + 0.07, yb + 1.07, z + 0.04));
    for (let z = zA + 0.4, k = 0; z + 0.9 < zB; z += 1.4, k++) if ((k + (yk > 6 ? 1 : 0)) % 3 !== 2) bag.add(['hide_tan', 'hide_white', 'cloth_red', 'hide_brown'][k % 4], box(n > 0 ? xo - 0.02 : xo - 0.0, yb + 0.35, z, n > 0 ? xo + 0.02 : xo + 0.02, yb + 1.05, z + 0.9 - (k % 2) * 0.2));
    // the doors the gallery serves: a lintel over each opening at the gallery's level
  }
  // mint in jars on the terrace, for the visitor's nose
  for (let k = 0; k < 6; k++) { const x = tx[0] + 2 + k * 5.2; bag.add('terracotta', lathe([[0.12, 0], [0.16, 0.14], [0.12, 0.26], [0.001, 0.26]], 8, null, x, ty, tz[0] + 0.4)); bag.add('cloth_green', lathe([[0.001, 0.2], [0.18, 0.32], [0.14, 0.55], [0.001, 0.62]], 7, null, x, ty, tz[0] + 0.4)); }
  // hides on the roofs (spread flat to dry): rows of skins white, tan and red
  for (const r of [W, E, [x0, z0, x1, z0 + 9]]) for (let k = 0; k < 14; k++) { const x = r[0] + 0.8 + rand() * (r[2] - r[0] - 2), z = r[1] + 0.8 + rand() * (r[3] - r[1] - 2), top = r === W || r === E ? y + 10.35 : y + 10.6; bag.add(['hide_white', 'hide_tan', 'cloth_red', 'hide_white'][k % 4], box(x, top, z, x + 1.0, top + 0.02, z + 0.8)); }
  // a retaining wall to the river, a gap at the west for the lane
  bag.add('rubble', box(x0 + 7, y - 0.4, z1 - 0.7, x1, y + 0.9, z1)); col.rect([x0 + 7, z1 - 0.7, x1, z1], y, y + 0.9);
  F.waterJar(bag, x0 + 9, y, z1 - 2, 1.2);
}
