// The weathering of Daci'en's pagoda (docs/settlements/tang-changan.md §21): soot and rain streaks over every opening, a damp skirt on the platform's
// foot, a grey lichen band on the lowest course of the tower, worn treads at the stair's middle. Pure decals (thin boxes a few cm proud of the faces
// tang_pagoda builds); sizes follow the pagoda's own table (src/styles/tang/pagoda.js STOREYS, kept in step here).
import { box } from '../../core/geom.js';

const STOREYS = [
  { h: 10.0, s: 12.5, bays: 9 }, { h: 8.0, s: 11.7, bays: 9 }, { h: 7.2, s: 10.9, bays: 7 }, { h: 6.6, s: 10.2, bays: 7 },
  { h: 6.1, s: 9.6, bays: 5 }, { h: 5.7, s: 9.0, bays: 5 }, { h: 5.4, s: 8.5, bays: 5 },
];
const h01 = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };

/** tc_pagoda_wear { c: [x, z], y }: the decals on the pagoda at c. */
export function pagodaWear(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, y0 = el.y ?? 0, PH = 4.2, W = 23, F0 = y0 + PH + 0.12;
  // a decal on the face whose outward normal is (fx, fz): a box a..b along the face (from its middle), ya..yb high, at the plane `plane` out, 0.035 thick
  const decal = (mat, fx, fz, plane, a, b, ya, yb) => {
    const t0 = plane - 0.01, t1 = plane + 0.035;
    if (fz !== 0) bag.add(mat, box(cx + a, ya, cz + (fz > 0 ? t0 : -t1), cx + b, yb, cz + (fz > 0 ? t1 : -t0)));
    else bag.add(mat, box(cx + (fx > 0 ? t0 : -t1), ya, cz + a, cx + (fx > 0 ? t1 : -t0), yb, cz + b));
  };
  let y = F0;
  STOREYS.forEach((S, i) => {
    const { h, s, bays } = S, ch = 1.05, bodyH = h - ch, bw = (2 * s) / bays, aw = Math.min(bw * 0.62, 2.8), ah = i === 0 ? 5.4 : Math.min(bodyH * 0.6, 3.6), sill = i === 0 ? 0 : 0.9;
    const frameTop = y + sill + ah + 0.3, from = i === 0 ? frameTop + 1.25 + 0.14 : frameTop + 0.05, to = y + bodyH - 0.5;
    for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const q = h01(i * 4 + fx * 2 + fz, 3), q2 = h01(i + 11, fx * 5 + fz * 3);
      if (to - from > 0.6) {
        // the soot rising from the opening: a wide low smear, a narrower tall one, a thin rain streak beside
        const hgt = Math.min(to - from, 0.9 + (to - from) * (0.45 + 0.4 * q));
        decal('slate', fx, fz, s, -aw * 0.42, aw * 0.42, from, from + hgt * 0.4);
        decal('slate', fx, fz, s, -aw * (0.2 + 0.1 * q2), aw * (0.16 + 0.1 * q), from + hgt * 0.4, from + hgt);
        decal('plaster_streak', fx, fz, s, aw * (0.5 + 0.1 * q2), aw * (0.5 + 0.1 * q2) + 0.12, from + 0.1, Math.min(to, from + hgt * 1.3));
      }
      // under the window sills of the upper storeys: a damp stain
      if (i > 0) decal('plaster_damp', fx, fz, s, -aw * 0.55, aw * 0.55, y + sill - 0.9, y + sill - 0.12);
    }
    y += h;
  });
  // the platform's foot: damp skirt (the south side's stair kept clear)
  const sw = 4.4, ch = 0.6;
  for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    if (fz > 0) { decal('plaster_damp', fx, fz, W, -W, -(sw / 2 + 0.7), y0, y0 + ch); decal('plaster_damp', fx, fz, W, sw / 2 + 0.7, W, y0, y0 + ch); }
    else decal('plaster_damp', fx, fz, W, -W, W, y0, y0 + ch);
  }
}
