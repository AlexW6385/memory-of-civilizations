// The Mercat de la Concepció (docs/settlements/barcelona.md §5d): the Eixample's market hall of 1888 by Antoni Rovira
// i Trias, its iron made by La Maquinista Terrestre y Marítima — three naves side by side under gabled roofs of
// glazed ceramic tiles, the middle one the widest and tallest and lit from the sides over the roofs of the lower
// ones; the iron structure open to the street above a base of Montjuïc stone with cast- and wrought-iron rails;
// glazed iron gables at the ends. Inside, rows of stalls under the iron (set by the life plan); round it a paved
// square, the flower sellers on its pavements.

import { box, fromTriangles } from '../../core/geom.js';

const IRON = 'iron', ST = 'sandstone_dressed';
const q2 = (T, a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);

/** mercat: { c, y, L (along x), W (across z) } — the hall centred at c, its naves along x. */
export function mercat(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, L = el.L ?? 60, Wd = el.W ?? 44, x0 = cx - L / 2, x1 = cx + L / 2;
  const zc = 9, zo = Wd / 2, eL = y + 7.2, eC = y + 12.6, rL = y + 10.2, rC = y + 17.2, bay = 7.5;
  // the floor of flags; the paved square round the hall
  bag.add('flagstone', box(x0 - 4, y - 0.6, cz - zo - 4, x1 + 4, y + 0.05, cz + zo + 4)); col.floor([x0 - 4, cz - zo - 4, x1 + 4, cz + zo + 4], y + 0.05);
  const F = y + 0.05;
  // the base of Montjuïc stone with its iron rail along the long sides, the openings to the street every other bay
  for (const sg of [-1, 1]) {
    const z = cz + sg * zo;
    for (let x = x0; x < x1 - 0.01; x += bay) {
      const k = Math.round((x - x0) / bay), door = k % 2 === 1;
      if (door) continue;
      bag.add(ST, box(x, F, z - 0.35, x + bay, F + 1.2, z + 0.35)); col.rect([x, z - 0.35, x + bay, z + 0.35], F, F + 2.4);
      bag.add(ST, box(x - 0.03, F + 1.2, z - 0.4, x + bay + 0.03, F + 1.3, z + 0.4));
      for (let xx = x + 0.15; xx < x + bay; xx += 0.15) bag.add(IRON, box(xx - 0.012, F + 1.3, z - 0.012, xx + 0.012, F + 2.4, z + 0.012));
      bag.add(IRON, box(x, F + 2.36, z - 0.03, x + bay, F + 2.42, z + 0.03));
    }
  }
  // the cast-iron columns: down the long sides and the two lines between the naves, a bay apart; the beams and the
  // lattice of the walls over the base (louvred iron panels high up for the air, glass arches in the middle)
  for (let x = x0, k = 0; x <= x1 + 0.01; x += bay, k++) {
    for (const [z, top] of [[cz - zo, eL], [cz + zo, eL], [cz - zc, eC], [cz + zc, eC]]) {
      bag.add(IRON, box(x - 0.14, F, z - 0.14, x + 0.14, F + 0.5, z + 0.14));
      bag.add(IRON, box(x - 0.08, F + 0.5, z - 0.08, x + 0.08, top, z + 0.08));
      bag.add(IRON, box(x - 0.16, top - 0.4, z - 0.16, x + 0.16, top - 0.25, z + 0.16));
      col.rect([x - 0.14, z - 0.14, x + 0.14, z + 0.14], F, top);
    }
  }
  for (const [z, top] of [[cz - zo, eL], [cz + zo, eL], [cz - zc, eC], [cz + zc, eC]]) {
    bag.add(IRON, box(x0, top - 0.25, z - 0.1, x1, top, z + 0.1));
    if (Math.abs(z - cz) > zc + 1) {
      // the long walls over the base: glass arches between the columns, louvres above them
      for (let x = x0; x < x1 - 0.01; x += bay) {
        bag.add('glass_outer', box(x + 0.1, F + 2.45, z - 0.02, x + bay - 0.1, top - 1.6, z + 0.02));
        for (let xx = x + bay / 4; xx < x + bay - 0.1; xx += bay / 4) bag.add(IRON, box(xx - 0.025, F + 2.45, z - 0.04, xx + 0.025, top - 1.6, z + 0.04));
        for (let yy = top - 1.5; yy < top - 0.3; yy += 0.18) bag.add(IRON, box(x + 0.1, yy, z - 0.06, x + bay - 0.1, yy + 0.06, z + 0.06));
      }
    } else {
      // the clerestory of the middle nave over the side naves' roofs: glass between iron mullions
      bag.add('glass_outer', box(x0, eL, z - 0.02, x1, top - 0.3, z + 0.02));
      for (let x = x0; x <= x1; x += 1.25) bag.add(IRON, box(x - 0.03, eL, z - 0.05, x + 0.03, top - 0.3, z + 0.05));
    }
  }
  // the roofs of glazed tiles: the side naves' gables, the middle nave's, their ridges; iron trusses under them
  const R = [], ridge = [];
  const gable = (za, zb, eave, top) => {
    const zm = (za + zb) / 2;
    q2(R, [x0 - 0.6, eave, za], [x1 + 0.6, eave, za], [x1 + 0.6, top, zm], [x0 - 0.6, top, zm]);
    q2(R, [x0 - 0.6, eave, zb], [x1 + 0.6, eave, zb], [x1 + 0.6, top, zm], [x0 - 0.6, top, zm]);
    ridge.push(box(x0 - 0.6, top - 0.05, zm - 0.15, x1 + 0.6, top + 0.12, zm + 0.15));
    for (let x = x0; x <= x1 + 0.01; x += bay) {
      const T = [];
      for (const [p, qq] of [[[x, eave - 0.2, za], [x, top - 0.2, zm]], [[x, eave - 0.2, zb], [x, top - 0.2, zm]], [[x, eave - 0.2, za], [x, eave - 0.2, zb]]]) q2(T, [p[0] - 0.04, p[1], p[2]], [p[0] + 0.04, p[1], p[2]], [qq[0] + 0.04, qq[1], qq[2]], [qq[0] - 0.04, qq[1], qq[2]]);
      for (let t = 0.2; t < 1; t += 0.2) { const zA = za + (zm - za) * t, yA = eave - 0.2 + (top - eave) * t; for (const zz of [zA, zb - (zA - za)]) q2(T, [x - 0.03, eave - 0.2, zz], [x + 0.03, eave - 0.2, zz], [x + 0.03, yA, zz], [x - 0.03, yA, zz]); }
      bag.add(IRON, fromTriangles(T));
    }
  };
  gable(cz - zo - 0.6, cz - zc, eL, rL);
  gable(cz + zc, cz + zo + 0.6, eL, rL);
  gable(cz - zc - 0.6, cz + zc + 0.6, eC, rC);
  bag.add('tile_green', fromTriangles(R));
  for (const g of ridge) bag.add('tile_yellow', g);
  // the gables at the ends: iron frames glazed, a great arched window in the middle nave's, the date over it
  for (const x of [x0, x1]) {
    const G = [];
    for (const [za, zb, eave, top] of [[cz - zo, cz - zc, eL, rL], [cz + zc, cz + zo, eL, rL], [cz - zc, cz + zc, eC, rC]]) {
      const zm = (za + zb) / 2;
      G.push(...[x, eave, za], ...[x, top, zm], ...[x, eave, zb], ...[x, eave, za], ...[x, eave, zb], ...[x, top, zm]);
      for (let k = 1; k < 6; k++) { const z = za + (zb - za) * k / 6, tt = top - (top - eave) * Math.abs(z - zm) / ((zb - za) / 2); bag.add(IRON, box(x - 0.05, eave, z - 0.04, x + 0.05, tt, z + 0.04)); }
      bag.add(IRON, box(x - 0.06, eave - 0.1, za, x + 0.06, eave + 0.1, zb));
    }
    bag.add('glass_outer', fromTriangles(G));
    // the end walls below the gables: the middle nave open as the entrance, the side naves glazed over the base
    for (const [za, zb] of [[cz - zo, cz - zc - 1], [cz + zc + 1, cz + zo]]) {
      bag.add(ST, box(x - 0.35, F, za, x + 0.35, F + 1.2, zb)); col.rect([x - 0.35, za, x + 0.35, zb], F, F + 2.4);
      bag.add('glass_outer', box(x - 0.02, F + 1.2, za, x + 0.02, eL - 0.25, zb));
      for (let z = za + 1.2; z < zb; z += 1.2) bag.add(IRON, box(x - 0.04, F + 1.2, z - 0.03, x + 0.04, eL - 0.25, z + 0.03));
    }
    bag.add(ST, box(x - 0.3, eC - 1.8, cz - zc, x + 0.3, eC - 0.25, cz + zc));
    bag.add('gilt_bronze', box(x + (x > cx ? 0.3 : -0.32), eC - 1.4, cz - 1.6, x + (x > cx ? 0.32 : -0.3), eC - 0.7, cz + 1.6));
  }
}
