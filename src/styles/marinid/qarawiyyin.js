// The Qarawiyyin mosque c. 1350 (docs/settlements/fez.md §5): a sahn with a fountain, arcades of horseshoe arches round it, the great
// hall of fourteen naves running toward the qibla wall (the south), the minaret over the north side of the court, a roofscape of
// green-tiled gables over the naves, bronze-clad doors in the outer wall.
import { box, lathe, rod } from '../../core/geom.js';
import { face, holedWall, archHead, dbl, dado, dadoFlat, stucco, canopy, basin, gable, q4, rng } from './kit.js';
import { minaret } from './minaret.js';
import { archRunLite } from './madrasa.js';
import * as F from '../mughal/furnish.js';

export function qarawiyyin(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, W = x1 - x0, D = z1 - z0, t = 1.2, HW = 9.6, NV = 14, nw = W / NV, rand = rng(el.seed || 17);
  const uX = (k) => x0 + nw * k;                         // the arcade lines (k = 0 … 14)
  const sahn = [uX(4), z0 + 3.5, uX(10), z0 + 23.5], hallZ0 = z0 + 23.5;
  const cx = (x0 + x1) / 2;
  // the floors: mats over marble through the naves, flags in the sahn
  bag.add('marble_floor', box(x0, y - 0.4, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('flagstone', box(sahn[0], y, sahn[1], sahn[2], y + 0.02, sahn[3]));
  for (let k = 0; k < NV; k++) { const a = uX(k) + 0.25, b = uX(k + 1) - 0.25; const m0 = (k >= 4 && k < 10) ? hallZ0 + 0.3 : z0 + 3.9, m1 = z1 - t - 0.3; bag.add('reed_mat', box(a, y, m0, b, y + 0.02, m1)); }
  col.floor(el.rect, y + 0.02);
  // the outer walls: the west with the great door to the Talaa Kebira, the others blind with bronze-clad doors in stucco frames
  const doorZ = -21 - 0.0, dz0 = doorZ - 1.7, dz1 = doorZ + 1.7;
  const outer = [[x0, z0, x1, z0 + t, true, [], 'z', z0, -1], [x0, z1 - t, x1, z1, true, [[cx - 1.6, cx + 1.6, y, y + 4.2]], 'z', z1, 1], [x0, z0 + t, x0 + t, z1 - t, false, [[dz0, dz1, y, y + 4.4]], 'x', x0, -1], [x1 - t, z0 + t, x1, z1 - t, false, [], 'x', x1, 1]];
  for (const [a, b, c, d, alongX, holes, ax, at, n] of outer) {
    holedWall(bag, col, 'limewash_white', [a, b, c, d], y - 0.8, y + HW + 1.0, holes, alongX);
    const f = face(ax, at, n);
    for (const h of holes) archHead(bag, face(ax, ax === 'x' ? (n < 0 ? x0 : x1) : at, -n * -1 * (n < 0 ? 1 : 1)), h[0], h[1], y + 2.9, h[3], t, 'horseshoe', { alfiz: true, side: 'near' });
    void f;
  }
  // the doors: leaves of bronze set against the jamb inside; stucco frames and cedar canopies, and the blind doors drawn flush
  for (const [f, u, w] of [[face('x', x0, -1), doorZ, 3.4], [face('z', z1, 1), cx, 3.2], [face('z', z0, -1), cx - 16, 3.0], [face('x', x1, 1), z0 + 38, 3.0]]) {
    const fr = f.R(0, 0.14, u - w / 2 - 0.45, u + w / 2 + 0.45); bag.add('stucco_cream', box(fr[0], y, fr[1], fr[2], y + 5.4, fr[3]));
    canopy(bag, f, u - w / 2 - 0.9, u + w / 2 + 0.9, y + 5.9, 1.2);
    const blind = !(f.ax === 'x' && f.n < 0 || f.ax === 'z' && f.n > 0 && Math.abs(u - cx) < 0.1);
    if (blind) { const d = f.R(0.14, 0.2, u - w / 2, u + w / 2); bag.add('bronze', box(d[0], y, d[1], d[2], y + 4.0, d[3])); for (let k = 0; k < 5; k++) for (let j = 0; j < 4; j++) { const dd = f.R(0.2, 0.23, u - w / 2 + 0.25 + k * (w - 0.5) / 4 - 0.03, u - w / 2 + 0.25 + k * (w - 0.5) / 4 + 0.03); bag.add('gilt_bronze', box(dd[0], y + 0.5 + j * 0.9, dd[1], dd[2], y + 0.56 + j * 0.9, dd[3])); } }
  }
  // blind panels (recessed arches) along the outer walls, in the limewash
  // the roofline of the walls: a plain parapet
  for (const p of [[x0, z0, x1, z0 + 0.4], [x0, z1 - 0.4, x1, z1], [x0, z0, x0 + 0.4, z1], [x1 - 0.4, z0, x1, z1]]) bag.add('limewash_white', box(p[0], y + HW + 1.0, p[1], p[2], y + HW + 1.8, p[3]));
  // ——— the arcades: piers and arches along each line, north to south, the central lines only from the hall's north edge
  const stations = (a, b) => { const n = Math.max(2, Math.round((b - a) / 4.4)), st = []; for (let i = 0; i <= n; i++) st.push(a + (b - a) * i / n); return st; };
  for (let k = 1; k < NV; k++) {
    const inSahn = k > 4 && k < 10, a = inSahn ? hallZ0 : z0 + t, b = z1 - t, X = uX(k);
    const zs = stations(a + 0.45, b - 0.45), st = zs.map((z) => ({ u: z - a, w: 0.45 }));
    for (const z of zs) { bag.add('stucco_cream', box(X - 0.45, y, z - 0.45, X + 0.45, y + 4.3, z + 0.45)); col.rect([X - 0.45, z - 0.45, X + 0.45, z + 0.45], y, y + 4.4); bag.add('tile_cream', box(X - 0.47, y + 0.02, z - 0.47, X + 0.47, y + 1.3, z + 0.47)); }
    archRunLite(bag, [X, a], [X, b], st.map((s) => ({ u: s.u, w: s.w })), y, 4.2, 6.4);
  }
  // the sahn's walls: its north gallery (a pent roof on piers), the sahn's own two arcades are the lines k = 4 and 10 above
  const gal = [sahn[0], z0 + t, sahn[2], sahn[1]];
  bag.add('wood_dark', box(gal[0], y + 3.5, gal[1], gal[2], y + 3.7, gal[3]));
  for (let x = gal[0] + 1.0; x < gal[2]; x += 3.2) { bag.add('stucco_cream', box(x - 0.3, y, gal[3] - 0.5, x + 0.3, y + 3.5, gal[3])); col.rect([x - 0.3, gal[3] - 0.5, x + 0.3, gal[3]], y, y + 3.6); }
  { const f = face('z', gal[1], 1); dado(bag, f, gal[0], gal[2], y, 1.8, [], { ribbon: true }); stucco(bag, f, gal[0], gal[2], y + 2.25, y + 3.5, [], { cornice: false }); }
  for (const f of [face('x', sahn[0], 1), face('x', sahn[2], -1)]) void f;
  // the sahn's fountain: a marble basin, a channel to the south
  basin(bag, col, cx, (sahn[1] + sahn[3]) / 2, y, 2.0);
  for (const s of [-1, 1]) bag.add('marble_smooth', box(cx + s * 0.28 - 0.06, y, (sahn[1] + sahn[3]) / 2 + 2.3, cx + s * 0.28 + 0.06, y + 0.14, sahn[3])); bag.add('water', box(cx - 0.22, y + 0.01, (sahn[1] + sahn[3]) / 2 + 2.3, cx + 0.22, y + 0.1, sahn[3]));
  // ——— the minaret over the north side of the court
  minaret(bag, col, [cx - 2.2, z0 + t, cx + 2.2, z0 + t + 4.4], y, 26.75);
  // ——— the qibla wall inside: dado, stucco, the mihrab at the centre with its arch, a minbar beside
  { const f = face('z', z1 - t, -1), mh = [cx - 1.3, cx + 1.3]; dadoFlat(bag, f, x0 + t, x1 - t, y, 1.8, [[mh[0], mh[1], y, y + 3.6]]); stucco(bag, f, x0 + t, x1 - t, y + 2.2, y + 6.4, [[mh[0] - 0.1, mh[1] + 0.1, y, y + 4.2]], { cell: 0.45 });
    bag.add('opening', box(mh[0], y + 0.02, z1 - t - 0.01, mh[1], y + 3.5, z1 - t + 0.0)); archHead(bag, f, mh[0], mh[1], y + 2.4, y + 3.6, 0.5, 'horseshoe', { alfiz: true });
    for (let k = 0; k < 7; k++) bag.add('timber', box(mh[1] + 0.8, y + k * 0.24, z1 - t - 0.8 - 0.3 * (6 - k), mh[1] + 1.9, y + (k + 1) * 0.24, z1 - t - 0.01)); bag.add('timber', box(mh[1] + 0.8, y + 1.6, z1 - t - 0.9, mh[1] + 1.9, y + 2.9, z1 - t - 0.01)); col.rect([mh[1] + 0.8, z1 - t - 2.2, mh[1] + 1.9, z1 - t], y, y + 2.9);
    for (const side of [[x0 + t, 1], [x1 - t, -1]]) { const ff = face('x', side[0], side[1]); dadoFlat(bag, ff, hallZ0, z1 - t, y, 1.6, []); }
  }
  // ——— the ceilings over the naves and the roofs: a painted cedar ceiling at the springing, a green-tiled gable per nave
  for (let k = 0; k < NV; k++) {
    const a = uX(k) + 0.1, b = uX(k + 1) - 0.1, zA = (k >= 4 && k < 10) ? hallZ0 : z0 + t, zB = z1 - t, zc = (a + b) / 2, ys = y + 6.5, rise = 1.6, tr = [];
    q4(tr, [a, ys, zA], [a, ys, zB], [zc, ys + rise, zB], [zc, ys + rise, zA]); q4(tr, [b, ys, zB], [b, ys, zA], [zc, ys + rise, zA], [zc, ys + rise, zB]);
    bag.add('ceiling_painted', dbl(tr));
    gable(bag, [a - 0.15, zA, b + 0.15, zB], y + HW + 1.2, 1.7, 0.4, 'z', { ends: false });
  }
  // the gallery's roof and the cloister roofs: flat plastered terraces for the rest
  bag.add('tile_green', box(gal[0] - 0.2, y + HW - 0.2, gal[1], gal[2] + 0.2, y + HW - 0.05, gal[3] + 0.3));
  // ——— lamps: the great chandeliers in the central nave, smaller ones down the aisles; mats' rows of prayer rugs
  for (const z of [hallZ0 + 8, hallZ0 + 20, z1 - 6]) F.mosqueLamp(bag, lights, cx, y + 3.6, z, y + 6.5, { k: 1.8, glow: 3, reach: 12 });
  for (let k = 0; k < 6; k++) F.mosqueLamp(bag, lights, uX(2 + k * 2) + nw / 2, y + 3.6, z0 + 14 + rand() * 30, y + 6.5, { k: 1, glow: 2, reach: 8 });
  for (let k = 0; k < 12; k++) F.prayerRug(bag, uX(1 + (k % 12)) + nw / 2 - 0.4, y + 0.025, z1 - 4, 0, 'persian');
  // ——— the teaching: rahles (folding Quran stands) with cushions where the circles of students sit along the naves and the sahn's gallery, jars of drinking water at the piers, cupboards of books against the west wall
  for (let k = 0; k < 14; k++) { const x = uX(1 + (k % 13)) + nw / 2 + 0.6 * ((k % 3) - 1), z = hallZ0 + 3 + Math.floor(k / 7) * 9 + (k % 4) * 1.3; F.rahle(bag, x, y + 0.03, z, (k % 5) * 0.3 - 0.6); F.cushion(bag, x + 0.1, y + 0.03, z + 0.7, 0.6, 0.6, 0.1, 0.2, ['cloth_green', 'cloth_indigo', 'cloth_red', 'cloth_ochre'][k % 4]); }
  for (let k = 0; k < 8; k++) F.waterJar(bag, gal[0] + 1.4 + k * 3.2, y, gal[3] - 0.7, 1.0);
  for (let k = 0; k < 4; k++) { const z = hallZ0 + 4 + k * 4.5; bag.add('cedar', box(x0 + t + 0.08, y + 0.05, z, x0 + t + 0.6, y + 2.2, z + 2.6)); for (let j = 0; j < 4; j++) bag.add('timber', box(x0 + t + 0.1, y + 0.5 + j * 0.5, z + 0.1, x0 + t + 0.5, y + 0.53 + j * 0.5, z + 2.5)); col.rect([x0 + t + 0.08, z, x0 + t + 0.6, z + 2.6], y, y + 2.2); }
  void rod; void lathe;
}
