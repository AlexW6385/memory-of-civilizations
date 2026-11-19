// The Bao'en pagoda climbed and looked at close (docs/settlements/ming-suzhou.md §26): the walk-check route up the inside of
// the song style's double-tube shaft to the top and out on the galleries, the treads worn by the pilgrims' feet, the flights'
// landings. The shaft's geometry is the song style's (src/styles/song/index.js `shaft`, interiorStorey), reproduced here
// from its formulas so that the route and the wear follow it.

import { Acc } from './townwork.js';
import { hash } from './townwork.js';

const C8 = Math.cos(Math.PI / 8), T8 = Math.tan(Math.PI / 8);
/** The shaft of the song style's inside from the tiers: { aw (the corridor's outer apothem), ac, ai (the chamber's), sw (half the side) }. */
export function shaft(tiers) { const rt = tiers[tiers.length - 1].r * C8, aw = rt - Math.max(1.4, rt * 0.22), ac = aw - 2.0; return { aw, ac, ai: ac - 0.8, sw: aw * T8 }; }
/** The height of each storey's floor from the first (y1) and the tiers. */
export const floors = (y1, tiers) => { const out = []; let y = y1; for (const t of tiers) { out.push(y); y += t.h; } return out; };

/**
 * The walk up the pagoda: from the street through the gate, round the main hall, up the terrace's steps, onto the lowest gallery, in by the south-west
 * door and up storey by storey (round the corridor to the stair on the east side, the landing, the stair on the south) to the top; there out onto the gallery.
 */
export function pagodaWalk({ c, y0, tiers, gate, hallW }) {
  const [cx, cz] = c, { aw, ai, sw } = shaft(tiers), mid = (ai + aw) / 2, cor = (aw * Math.SQRT2 - 0.5) / 2;   // (a corner's point: the diagonal wall's clear distance)
  const hC = 2.2, yg = y0 + hC + 0.34, ys = floors(yg, tiers), gt = tiers[0].r + 2.4;
  const R = [[gate[0] + 1.15, gate[1] + 4], [gate[0] + 1.15, gate[1] - 1.5], [gate[0] + 1.15, gate[1] - 4.5], [hallW, gate[1] - 4.5], [hallW, cz + 15.2], [cx, cz + 15.2]];
  const out = R.slice();
  // up the three flights of the terrace (south side, each in the middle), onto the lowest gallery at the south, round to the south-west door
  for (const dz of [14.0, 11.0, 9.7]) out.push([cx, cz + dz]);
  const dSW = (gt - 0.3) * C8;
  out.push([cx, cz + dSW]);
  out.push([cx - dSW * 0.7071, cz + dSW * 0.7071]);
  // storeys
  const aSW = [cx - (aw + (tiers[0].r * C8)) / 2 * 0.7071, cz + (aw + (tiers[0].r * C8)) / 2 * 0.7071];
  void aSW;
  tiers.forEach((t, i) => {
    const through = [[cx - cor, cz + cor]];
    if (i === 0) out.push([cx - ((aw + t.r * C8) / 2) * 0.7071 + 0.4, cz + ((aw + t.r * C8) / 2) * 0.7071 - 0.4]);
    out.push(through[0]);
    out.push([cx - mid, cz], [cx - cor, cz - cor], [cx, cz - mid], [cx + cor, cz - cor]);
    if (i < tiers.length - 1) {
      out.push([cx + mid, cz - sw + 0.15], [cx + mid, cz + sw - 0.15], [cx + cor, cz + cor], [cx + sw - 0.15, cz + mid], [cx - sw + 0.15, cz + mid]);
    } else {
      // at the top storey out by the south-west door onto the gallery and round to the south
      const d = ((aw + t.r * C8) / 2) * 0.7071, dg = (t.r + 2.4 - 0.5) * C8;
      out.push([cx + cor, cz - cor], [cx, cz - mid], [cx - cor, cz - cor], [cx - mid, cz], [cx - cor, cz + cor], [cx - d - 0.2, cz + d + 0.2], [cx - dg * 0.7071, cz + dg * 0.7071], [cx, cz + dg]);
    }
  });
  out.y0 = 0;
  out.ys = ys;
  return out;
}

/**
 * pagoda_wear { c, y, tiers }: the treads of every flight worn by the pilgrims' feet: a darker, smoother band down the middle of each tread, hollowed a
 * little, the edges kept; moss in the corners of the lowest flights. (Overlays a hair above the style's treads: one geometry per material.)
 */
export function pagodaWear(el, { bag }) {
  const [cx, cz] = el.c, { ai, aw, sw } = shaft(el.tiers), acc = new Acc(), ys = floors(el.y, el.tiers);
  el.tiers.forEach((t, i) => {
    if (i === el.tiers.length - 1) return;
    const y = ys[i], h = t.h, n = Math.ceil(h / 2 / 0.2), run = 2 * sw / n, xm = cx + (ai + aw) / 2, ym = y + h / 2, xw = 0.7;
    for (let j = 0; j < n; j++) {
      const top = y + (j + 1) * h / 2 / n, hol = 0.004 + 0.004 * hash(i, j, 1), d = (hash(i, j, 2) - 0.5) * 0.12;
      const z0 = cz - sw + j * run + 0.012, z1 = cz - sw + (j + 1) * run - 0.004;
      acc.box('granite_grey', xm + d - xw, top + 0.002, z0, xm + d + xw, top + 0.002 + hol, z1);
      const top2 = ym + (j + 1) * h / 2 / n, x1 = cx + sw - j * run - 0.004, x0 = cx + sw - (j + 1) * run + 0.012, zm = cz + (ai + aw) / 2;
      acc.box('granite_grey', x0, top2 + 0.002, zm + d - xw, x1, top2 + 0.002 + hol, zm + d + xw);
    }
  });
  acc.flush(bag);
}
