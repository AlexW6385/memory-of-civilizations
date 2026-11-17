// The Montelbaanstoren (docs/settlements/amsterdam.md §5.17): the brick defence tower of 1516 on the IJ's shore, its top
// raised in 1606 to Hendrick de Keyser's design — an octagonal wooden clock stage and a carillon stage under a lead
// spire with a vane — 48 m in all. Built as octagons (flats to the four quarters) in plan.

import { lathe } from '../../core/geom.js';
import { vprism, ngon } from './facade.js';

const ST = 'sandstone_dressed';
/** The octagon's plan polygon: circumradius r, flats facing the four quarters. */
const oct = (x, z, r) => ngon(0, 0, r, 8).map(([a, b]) => { const t = Math.PI / 8, c = Math.cos(t), s = Math.sin(t); return [x + a * c - b * s, z + a * s + b * c]; });
/** montelbaan: { c: [x, z], y } */
export function montelbaan(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 1, add = (m, r, y0, y1) => bag.add(m, vprism(oct(x, z, r), y + y0, y + y1));
  const face = (k, r) => { const a = k * Math.PI / 4, ri = r * Math.cos(Math.PI / 8); return [x + Math.cos(a) * ri, z + Math.sin(a) * ri, a]; };
  // the brick body: a stone plinth, the walls battering in two stages, stone string courses
  add(ST, 6.6, -1.2, 1.6); add('brick', 6.2, 1.6, 12); add(ST, 6.3, 11.7, 12.15); add('brick', 5.9, 12.15, 21); add(ST, 6.45, 21, 22.1); add('brick', 6.55, 22.1, 22.45);
  for (const [v0, v1] of [[5.5, 5.75], [16.5, 16.75]]) add(ST, 6.28 - (v0 > 10 ? 0.4 : 0), v0, v1);
  // the walls' openings: slit windows in stone frames, on every face at three levels, a gun port low down; a round-arched door on the landward face
  for (let k = 0; k < 8; k++) {
    const [fx, fz, a] = face(k, k % 2 ? 5.9 : 6.2);
    for (const [v, hh, ww] of [[7.5, 1.3, 0.34], [14.2, 1.5, 0.4], [18.6, 1.3, 0.34]]) {
      if (k % 2 && v < 10) continue;
      const nx = Math.cos(a), nz = Math.sin(a), tx = -nz, tz = nx, p = (u, d) => [fx + tx * u + nx * d, fz + tz * u + nz * d];
      bag.add(ST, vprism([p(-ww - 0.12, -0.2), p(ww + 0.12, -0.2), p(ww + 0.12, 0.09), p(-ww - 0.12, 0.09)], y + v - 0.14, y + v + hh + 0.16));
      bag.add('opening', vprism([p(-ww, -0.2), p(ww, -0.2), p(ww, 0.12), p(-ww, 0.12)], y + v, y + v + hh));
    }
  }
  { const [fx, fz, a] = face(2, 6.2), nx = Math.cos(a), nz = Math.sin(a), tx = -nz, tz = nx, p = (u, d) => [fx + tx * u + nx * d, fz + tz * u + nz * d];
    bag.add(ST, vprism([p(-1.1, -0.2), p(1.1, -0.2), p(1.1, 0.1), p(-1.1, 0.1)], y + 1.55, y + 4.1)); bag.add('wood_dark', vprism([p(-0.85, -0.2), p(0.85, -0.2), p(0.85, 0.13), p(-0.85, 0.13)], y + 1.6, y + 3.7)); }
  // the 1606 top: a stone gallery cornice, the clock stage (wood, an arcade of tall round-arched louvres, a clock on each flat),
  // the stage of the bells, and the lead spire
  add('timber', 5.0, 22.45, 29.2); add(ST, 5.4, 29.2, 29.7); add('lead', 3.9, 29.7, 35.5); add(ST, 4.3, 35.5, 35.85);
  for (let k = 0; k < 8; k++) {
    const [fx, fz, a] = face(k, 5.0), nx = Math.cos(a), nz = Math.sin(a), tx = -nz, tz = nx, p = (u, d) => [fx + tx * u + nx * d, fz + tz * u + nz * d];
    bag.add('wood_dark', vprism([p(-1.85, 0), p(1.85, 0), p(1.85, 0.16), p(-1.85, 0.16)], y + 23.0, y + 28.6));                       // the stage's panelled face
    if (k % 2 === 0) {
      const [cx2, cz2] = p(0, 0.2); bag.add('gold', lathe([[0.001, 0], [1.28, 0], [1.28, 0.02], [0.001, 0.02]], 20).rotateZ(-Math.PI / 2).rotateY(Math.atan2(-nz, nx)).translate(cx2, y + 25.8, cz2));
      bag.add('paint_white', lathe([[0.001, 0.03], [1.16, 0.03], [1.16, 0.06], [0.001, 0.06]], 20).rotateZ(-Math.PI / 2).rotateY(Math.atan2(-nz, nx)).translate(cx2, y + 25.8, cz2));
      bag.add('lacquer_black', vprism([p(-0.04, 0.27), p(0.04, 0.27), p(0.04, 0.3), p(-0.04, 0.3)], y + 25.8, y + 26.9)); bag.add('lacquer_black', vprism([p(-0.03, 0.27), p(0.3, 0.27), p(0.3, 0.3), p(-0.03, 0.3)], y + 25.78, y + 25.84));
    }
    // the clock stage's corner posts in stone
    const c1 = oct(x, z, 5.0)[k]; bag.add(ST, vprism([[c1[0] - 0.14, c1[1] - 0.14], [c1[0] + 0.14, c1[1] - 0.14], [c1[0] + 0.14, c1[1] + 0.14], [c1[0] - 0.14, c1[1] + 0.14]], y + 22.45, y + 29.2));
  }
  for (let k = 0; k < 8; k++) {                                                                                       // the bell stage's louvres
    const [fx, fz, a] = face(k, 3.9), nx = Math.cos(a), nz = Math.sin(a), tx = -nz, tz = nx, p = (u, d) => [fx + tx * u + nx * d, fz + tz * u + nz * d];
    for (const u of [-0.9, 0.9]) bag.add('opening', vprism([p(u - 0.34, -0.1), p(u + 0.34, -0.1), p(u + 0.34, 0.03), p(u - 0.34, 0.03)], y + 30.4, y + 34.4));
  }
  { const g = lathe([[3.9, 0], [3.5, 0.5], [2.9, 2.2], [2.3, 4.6], [1.5, 7.4], [0.8, 9.6], [0.5, 11], [0.001, 12.2]], 8); g.rotateY(Math.PI / 8); g.translate(x, y + 35.85, z); bag.add('lead', g); }
  { const g = lathe([[0.001, 0], [0.36, 0.4], [0.001, 0.8]], 10); g.translate(x, y + 48.0, z); bag.add('gilt_bronze', g); bag.add('iron', vprism([[x - 0.03, z - 0.03], [x + 0.03, z - 0.03], [x + 0.03, z + 0.03], [x - 0.03, z + 0.03]], y + 48.8, y + 50.4)); bag.add('gilt_bronze', vprism([[x - 0.02, z - 0.5], [x + 0.02, z - 0.5], [x + 0.02, z + 0.5], [x - 0.02, z + 0.5]], y + 49.8, y + 50.2)); }
  // solid below the gallery: a cross of two blocks inside the flats, and the faces' segments
  const ri = 6.2 * Math.cos(Math.PI / 8), hs = 6.2 * Math.sin(Math.PI / 8);
  col.rect([x - ri, z - hs, x + ri, z + hs], y - 1.2, y + 22.5); col.rect([x - hs, z - ri, x + hs, z + ri], y - 1.2, y + 22.5);
  const O = oct(x, z, 6.2); for (let k = 0; k < 8; k++) col.segment(O[k], O[(k + 1) % 8], 1.0, y - 1.2, y + 22.5);
}
