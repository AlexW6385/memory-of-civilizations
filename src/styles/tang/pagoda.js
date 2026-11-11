// The Big Wild Goose Pagoda (Dayan ta) as rebuilt under Wu Zetian (c. 704): seven storeys of buff brick on a stepped platform
// of brick, each square, narrowing and shortening, the timber forms imitated in brick: flat pilasters dividing each face into
// bays (9, 9, 7, 7, 5, 5, 5), a brick arch in the middle bay of every face (the ground storey's a stone door framed in bluestone
// and carved), and under each storey's top a cornice of corbelled brick courses. A stepped roof and a gilt finial crown it.
// docs/settlements/tang-changan.md §1: about 58 m, the lowest storey 25 m on a side, the platform 4.2 m high.

import { box, frustum, lathe } from '../../core/geom.js';

const STOREYS = [
  { h: 10.0, s: 12.5, bays: 9 }, { h: 8.0, s: 11.7, bays: 9 }, { h: 7.2, s: 10.9, bays: 7 }, { h: 6.6, s: 10.2, bays: 7 },
  { h: 6.1, s: 9.6, bays: 5 }, { h: 5.7, s: 9.0, bays: 5 }, { h: 5.4, s: 8.5, bays: 5 },
];

export function tangPagoda(el, { bag, col }) {
  const [cx, cz] = el.c, y0 = el.y ?? 0, PH = 4.2, W = 23, wall = 'brick_buff';
  const R = (s) => [cx - s, cz - s, cx + s, cz + s];
  // the platform: two courses, the stairs up the south side
  bag.add('brick_grey', frustum(R(W), y0 - 0.05, y0 + PH * 0.5, 0, 0, 0, 0, { noBottom: y0 <= 0.01 }));
  bag.add('brick_grey', frustum(R(W - 2), y0 + PH * 0.5 - 0.01, y0 + PH, 0, 0, 0, 0));
  bag.add('limestone', frustum(R(W - 2 + 0.25), y0 + PH, y0 + PH + 0.12, 0, 0, 0, 0));        // the coping
  col.rect(R(W), y0 - 0.05, y0 + PH + 0.12); col.floor(R(W - 2 + 0.25), y0 + PH + 0.12);
  const n = 21, run = 11, sw = 4.4, z0 = cz + W;
  for (let i = 0; i < n - 1; i++) {
    const t0 = i / n, t1 = (i + 1) / n, top = y0 + (PH + 0.12) * (1 - t0);
    bag.add('granite_block', box(cx - sw / 2 - 0.15, y0 - 0.02, z0 + run * t0 - 0.0, cx + sw / 2 + 0.15, top - (PH + 0.12) / n, z0 + run * t1));
  }
  // (the flight: the step i's tread at height (PH+0.12)(1 − i/n) over the run's i-th slice, shaped as a stack)
  col.ramp([cx - sw / 2, z0 - 2, cx + sw / 2, z0 + run], y0, y0 + PH + 0.12, 'n');
  for (const s of [-1, 1]) bag.add('granite_block', box(cx + s * (sw / 2 + 0.3) - 0.2, y0, z0 - 2, cx + s * (sw / 2 + 0.3) + 0.2, y0 + 0.9, z0 + run));
  // the tower
  let y = y0 + PH + 0.12;
  STOREYS.forEach((S, i) => {
    const { h, s, bays } = S, ch = 1.05, bodyH = h - ch;
    bag.add(wall, frustum(R(s), y, y + bodyH, 0, 0, 0, 0));
    // the pilasters: flat columns dividing each face into bays, a lintel course above and a plinth below
    const pw = 0.5, pr = 0.2, pos = (k) => -s + (2 * s * k) / bays;
    for (let k = 0; k <= bays; k++) {
      const a = pos(k), c0 = Math.min(Math.max(a, -s + pw / 2), s - pw / 2);
      bag.add(wall, box(cx + c0 - pw / 2, y, cz + s, cx + c0 + pw / 2, y + bodyH, cz + s + pr)); bag.add(wall, box(cx + c0 - pw / 2, y, cz - s - pr, cx + c0 + pw / 2, y + bodyH, cz - s));
      bag.add(wall, box(cx + s, y, cz + c0 - pw / 2, cx + s + pr, y + bodyH, cz + c0 + pw / 2)); bag.add(wall, box(cx - s - pr, y, cz + c0 - pw / 2, cx - s, y + bodyH, cz + c0 + pw / 2));
    }
    bag.add('limestone', frustum([cx - s - 0.02, cz - s - 0.02, cx + s + 0.02, cz + s + 0.02], y, y + 0.35, 0, 0, 0, 0));
    bag.add(wall, frustum([cx - s - pr - 0.04, cz - s - pr - 0.04, cx + s + pr + 0.04, cz + s + pr + 0.04], y + bodyH - 0.45, y + bodyH, 0, 0, 0, 0));   // the architrave course
    // the arched door or window in the middle bay of each face
    const bw = (2 * s) / bays, aw = Math.min(bw * 0.62, 2.8), ah = i === 0 ? 5.4 : Math.min(bodyH * 0.55, 3.8), ay = y + (i === 0 ? 0 : bodyH * 0.22);
    for (const [fx, fz, ox, oz] of [[0, 1, 0, 1], [0, -1, 0, -1], [1, 0, 1, 0], [-1, 0, -1, 0]]) {
      const px = cx + fx * (s + pr + 0.02), pz = cz + fz * (s + pr + 0.02);
      const fr = i === 0 && fz === 1 ? 'bluestone' : 'limestone', along = fz !== 0;
      const dark = i === 0 && fz !== 1 ? 'limestone' : 'wood_dark';
      const B = (a0, y_a, a1, y_b, d, m) => along ? bag.add(m, box(px + a0, y_a, pz + (oz > 0 ? 0 : -d), px + a1, y_b, pz + (oz > 0 ? d : 0))) : bag.add(m, box(px + (ox > 0 ? 0 : -d), y_a, pz + a0, px + (ox > 0 ? d : 0), y_b, pz + a1));
      B(-aw / 2 - 0.3, ay, -aw / 2, ay + ah + 0.3, 0.08, fr); B(aw / 2, ay, aw / 2 + 0.3, ay + ah + 0.3, 0.08, fr); B(-aw / 2 - 0.3, ay + ah, aw / 2 + 0.3, ay + ah + 0.3, 0.08, fr);
      B(-aw / 2, ay, aw / 2, ay + ah, 0.04, dark);
      if (i === 0 && fz === 1) { B(-aw / 2 - 0.45, ay + ah + 0.3, aw / 2 + 0.45, ay + ah + 1.2, 0.1, 'bluestone'); }   // the carved lintel with its Buddha figures
    }
    // the cornice: corbelled courses of brick, then a sloping course
    let yy = y + bodyH;
    for (const [o, t] of [[0.2, 0.2], [0.4, 0.2], [0.65, 0.2], [0.9, 0.2]]) { bag.add(wall, frustum([cx - s - o, cz - s - o, cx + s + o, cz + s + o], yy, yy + t, 0, 0, 0, 0)); yy += t; }
    bag.add('roof_ridge', frustum([cx - s - 0.9, cz - s - 0.9, cx + s + 0.9, cz + s + 0.9], yy, y + h, 0.4, 0.4, 0.4, 0.4));
    y += h;
  });
  // the crown: a stepped square roof and the finial
  const s = 8.5;
  bag.add('roof_ridge', frustum(R(s - 0.6), y, y + 0.5, 0, 0, 0, 0));   bag.add('tile_grey', frustum(R(s - 0.3), y + 0.5, y + 2.0, s - 1.2, s - 1.2, s - 1.2, s - 1.2));
  bag.add('gilt_bronze', lathe([[0.001, 2.0], [0.5, 2.0], [0.25, 2.5], [0.35, 3.0], [0.15, 3.6], [0.001, 4.2]], 10, null, cx, y, cz));
  col.rect(R(s + 0.5), y0 + PH + 0.12, y); // (the tower itself)
  col.rect(R(STOREYS[0].s + 0.9), y0 + PH + 0.12, y0 + PH + 0.12 + STOREYS[0].h);
}

export const PAGODA_ELEMENTS = { tang_pagoda: tangPagoda };
