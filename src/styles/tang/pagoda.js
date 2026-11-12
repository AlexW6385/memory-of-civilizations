// The Big Wild Goose Pagoda (Dayan ta) as rebuilt under Wu Zetian (c. 704): seven storeys of buff brick on a stepped platform
// of brick, each square, narrowing and shortening, the timber forms imitated in brick: flat pilasters dividing each face into
// bays (9, 9, 7, 7, 5, 5, 5), a brick arch in the middle bay of every face (the ground storey's a stone door framed in bluestone
// and carved), and under each storey's top a cornice of corbelled brick courses. A stepped roof and a gilt finial crown it.
// docs/settlements/tang-changan.md §1: about 58 m, the lowest storey 25 m on a side, the platform 4.2 m high.

import { box, frustum, lathe } from '../../core/geom.js';
import { statue } from '../chinese/statues.js';

const STOREYS = [
  { h: 10.0, s: 12.5, bays: 9 }, { h: 8.0, s: 11.7, bays: 9 }, { h: 7.2, s: 10.9, bays: 7 }, { h: 6.6, s: 10.2, bays: 7 },
  { h: 6.1, s: 9.6, bays: 5 }, { h: 5.7, s: 9.0, bays: 5 }, { h: 5.4, s: 8.5, bays: 5 },
];

export function tangPagoda(el, ctx) {
  const { bag, col } = ctx;
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
  // the tower: hollow. Each storey is a ring of thick brick walls round a chamber; the floors are timber slabs with a stairwell, a
  // two-flight stair (west strip up to a landing in the north, east strip up to the next floor) in every storey but the last;
  // the middle bay of each face is an open arched passage (ground storey) or a window with a sill (the upper ones)
  const { lights } = ctx, SW = 2.6, STEP_H = 0.25;
  const Tw = (s) => s * 0.36, AI = (s) => s - Tw(s);
  const slab = (r, ya, yb, mat) => { if (r[2] - r[0] < 1e-3 || r[3] - r[1] < 1e-3 || yb - ya < 1e-3) return; bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); };
  const solid = (r, ya, yb, mat) => { slab(r, ya, yb, mat); col.rect(r, ya, yb); };
  const ring = (o, ai, ya, yb, mat) => {   // a square ring, outer half-side o, inner ai, no collision (overhead)
    slab([cx - o, cz + ai, cx + o, cz + o], ya, yb, mat); slab([cx - o, cz - o, cx + o, cz - ai], ya, yb, mat);
    slab([cx + ai, cz - ai, cx + o, cz + ai], ya, yb, mat); slab([cx - o, cz - ai, cx - ai, cz + ai], ya, yb, mat);
  };
  const F0 = y0 + PH + 0.12;
  let y = F0;
  STOREYS.forEach((S, i) => {
    const { h, s, bays } = S, ch = 1.05, bodyH = h - ch, ai = AI(s), aN = i < STOREYS.length - 1 ? AI(STOREYS[i + 1].s) : ai;
    // the walls with the openings in their middle bays (rectangular passages; the carved frames outside make them arches)
    const bw = (2 * s) / bays, aw = Math.min(bw * 0.62, 2.8), ah = i === 0 ? 5.4 : Math.min(bodyH * 0.6, 3.6), sill = i === 0 ? 0 : 0.9;
    const face = (r, along) => {   // r: the wall's rectangle; the opening in its middle along `along` ('x' | 'z')
      const m = along === 'x' ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2, o0 = m - aw / 2, o1 = m + aw / 2;
      const P = (a0, a1, ya, yb) => solid(along === 'x' ? [a0, r[1], a1, r[3]] : [r[0], a0, r[2], a1], ya, yb, 'brick_buff');
      const lo = along === 'x' ? r[0] : r[1], hi = along === 'x' ? r[2] : r[3];
      P(lo, o0, y, y + bodyH); P(o1, hi, y, y + bodyH);
      if (sill > 0) P(o0, o1, y, y + sill);
      P(o0, o1, y + sill + ah, y + bodyH);
    };
    face([cx - s, cz + ai, cx + s, cz + s], 'x'); face([cx - s, cz - s, cx + s, cz - ai], 'x');
    // (the side walls between the end walls: their middle bay opens too)
    face([cx + ai, cz - ai, cx + s, cz + ai], 'z'); face([cx - s, cz - ai, cx - ai, cz + ai], 'z');
    // (the corners' extra: the N and S walls already run full width; the side walls fill between them)
    // the pilasters: flat columns dividing each face into bays, a lintel course above and a plinth below
    const wall = 'brick_buff', pw = 0.5, pr = 0.2, pos = (k) => -s + (2 * s * k) / bays;
    for (let k = 0; k <= bays; k++) {
      const a = pos(k), c0 = Math.min(Math.max(a, -s + pw / 2), s - pw / 2);
      bag.add(wall, box(cx + c0 - pw / 2, y, cz + s, cx + c0 + pw / 2, y + bodyH, cz + s + pr)); bag.add(wall, box(cx + c0 - pw / 2, y, cz - s - pr, cx + c0 + pw / 2, y + bodyH, cz - s));
      bag.add(wall, box(cx + s, y, cz + c0 - pw / 2, cx + s + pr, y + bodyH, cz + c0 + pw / 2)); bag.add(wall, box(cx - s - pr, y, cz + c0 - pw / 2, cx - s, y + bodyH, cz + c0 + pw / 2));
    }
    bag.add('limestone', frustum([cx - s - 0.02, cz - s - 0.02, cx + s + 0.02, cz + s + 0.02], y, y + 0.35, 0, 0, 0, 0));
    bag.add(wall, frustum([cx - s - pr - 0.04, cz - s - pr - 0.04, cx + s + pr + 0.04, cz + s + pr + 0.04], y + bodyH - 0.45, y + bodyH, 0, 0, 0, 0));   // the architrave course
    // the carved frames round the openings (the ground storey's south door in bluestone, its lintel with the Buddha figures)
    const ay = y + sill;
    for (const [fx, fz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const px = cx + fx * (s + pr + 0.02), pz = cz + fz * (s + pr + 0.02), along = fz !== 0, oz = fz, ox = fx;
      const fr = i === 0 && fz === 1 ? 'bluestone' : 'limestone';
      const B = (a0, y_a, a1, y_b, d, m) => along ? bag.add(m, box(px + a0, y_a, pz + (oz > 0 ? 0 : -d), px + a1, y_b, pz + (oz > 0 ? d : 0))) : bag.add(m, box(px + (ox > 0 ? 0 : -d), y_a, pz + a0, px + (ox > 0 ? d : 0), y_b, pz + a1));
      B(-aw / 2 - 0.3, ay, -aw / 2, ay + ah + 0.3, 0.08, fr); B(aw / 2, ay, aw / 2 + 0.3, ay + ah + 0.3, 0.08, fr); B(-aw / 2 - 0.3, ay + ah, aw / 2 + 0.3, ay + ah + 0.3, 0.08, fr);
      if (sill > 0) B(-aw / 2 - 0.3, ay - 0.12, aw / 2 + 0.3, ay, 0.12, fr);
      if (i === 0 && fz === 1) B(-aw / 2 - 0.45, ay + ah + 0.3, aw / 2 + 0.45, ay + ah + 1.2, 0.1, 'bluestone');
    }
    // the cornice: corbelled courses of brick (rings: the chamber stays hollow), then a sloping course
    let yy = y + bodyH;
    for (const [o, t] of [[0.2, 0.2], [0.4, 0.2], [0.65, 0.2], [0.9, 0.2]]) { ring(s + o, ai, yy, yy + t, wall); yy += t; }
    ring(s + 0.9, ai, yy, y + h, 'roof_ridge');
    // the chamber: the floor (storey 0: brick; the others the slab below), a ceiling = the next slab's underside
    if (i === 0) { slab([cx - ai, cz - ai, cx + ai, cz + ai], F0 - 0.01, F0 + 0.04, 'brick_grey'); col.floor([cx - ai, cz - ai, cx + ai, cz + ai], F0 + 0.04); }
    if (i < STOREYS.length - 1) {
      // the slab at the top of this storey (the next one's floor), with the stairwell over the east strip; the stair of this storey under it
      const a = aN, yT = y + h, yM = y + h / 2, hole = [cx + a - SW, cz - a + SW, cx + a, cz + a - SW];
      const pieces = [[cx - ai, cz - ai, cx + a - SW, cz + ai], [cx + a - SW, cz - ai, cx + ai, cz - a + SW], [cx + a - SW, cz + a - SW, cx + ai, cz + ai], [cx + a, cz - a + SW, cx + ai, cz + a - SW]];
      for (const r of pieces) { slab(r, yT - 0.35, yT, 'timber'); col.floor(r, yT); col.rect(r, yT - 0.35, yT); }
      bag.add('timber_red', box(hole[0], yT - 0.3, hole[1] - 0.06, hole[2], yT + 0.9, hole[1])); bag.add('timber_red', box(hole[0] - 0.06, yT - 0.3, hole[1], hole[0], yT + 0.9, hole[3]));
      col.rect([hole[0], hole[1] - 0.06, hole[2], hole[1]], yT - 0.3, yT + 0.9); col.rect([hole[0] - 0.06, hole[1], hole[0], hole[3]], yT - 0.3, yT + 0.9);
      // flight 1: the west strip, rising north from the floor to the landing; the landing across the north; flight 2: the east strip rising south
      const steps = (r, y_a, y_b, dir) => {
        const n = Math.max(4, Math.round((y_b - y_a) / STEP_H));
        for (let k = 0; k < n; k++) {
          const t0 = k / n, t1 = (k + 1) / n, yt = y_a + (y_b - y_a) * t1;
          const z0 = dir === 'n' ? r[3] - (r[3] - r[1]) * t1 : r[1] + (r[3] - r[1]) * t0, z1 = dir === 'n' ? r[3] - (r[3] - r[1]) * t0 : r[1] + (r[3] - r[1]) * t1;
          bag.add('timber', box(r[0], yt - 0.12, z0, r[2], yt, z1));
        }
        for (const x of [r[0] - 0.05, r[2]]) bag.add('timber_red', box(x, y_a, r[1], x + 0.05, y_b + 0.9, r[3]));
        col.ramp(r, y_a, y_b, dir);
      };
      steps([cx - a, cz - a + SW, cx - a + SW, cz + a], y, yM, 'n');
      slab([cx - a, cz - a, cx + a, cz - a + SW], yM - 0.2, yM, 'timber'); col.floor([cx - a, cz - a, cx + a, cz - a + SW], yM);
      steps([cx + a - SW, cz - a + SW, cx + a, cz + a - SW], yM, yT, 's');
      // a rail along the open edge of the landing and of the west flight's inner side
      bag.add('timber_red', box(cx - a + SW, yM, cz - a + SW - 0.05, cx + a - SW, yM + 0.9, cz - a + SW));
    }
    if (i === 0 || i % 2 === 1) lights.push({ at: [cx - ai + 1.5, y + 2.6, cz + ai - 1.5], color: '#ffc27a', intensity: 3.2, distance: 14 });
    if (i === 0) {
      // the ground chamber: the sutra altar with the figures of the Buddha's disciples, two tablets set in the walls, the lamps, a bench of the pilgrims
      bag.add('lacquer_red', box(cx - 2.6, F0, cz - ai + 0.5, cx + 2.6, F0 + 1.1, cz - ai + 2.1)); col.rect([cx - 2.6, cz - ai + 0.5, cx + 2.6, cz - ai + 2.1], F0, F0 + 1.1);
      bag.add('cloth_maroon', box(cx - 2.5, F0 + 1.1, cz - ai + 0.6, cx + 2.5, F0 + 1.14, cz - ai + 2.0));
      statue({ at: [cx, cz - ai + 1.4], y: F0 + 1.14, h: 2.8, dir: [0, 1], type: 'bodhisattva', flesh: 'clay_gilt' }, ctx);
      statue({ at: [cx - 1.9, cz - ai + 1.4], y: F0 + 1.14, h: 2.0, dir: [0.4, 1], type: 'disciple' }, ctx); statue({ at: [cx + 1.9, cz - ai + 1.4], y: F0 + 1.14, h: 2.0, dir: [-0.4, 1], type: 'disciple' }, ctx);
      for (const sx of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.25, 0], [0.3, 0.25], [0.2, 0.45], [0.001, 0.45]], 10, null, cx + sx * 3.4, F0, cz - ai + 1.4)); bag.add('timber_red', box(cx + sx * 3.4 - 0.15, F0 + 0.45, cz - ai + 1.25, cx + sx * 3.4 + 0.15, F0 + 1.7, cz - ai + 1.55)); bag.add('lamp_paper', box(cx + sx * 3.4 - 0.2, F0 + 1.7, cz - ai + 1.2, cx + sx * 3.4 + 0.2, F0 + 2.1, cz - ai + 1.6)); }
      for (const sx of [-1, 1]) { bag.add('limestone', box(cx + sx * (ai - 0.12) - 0.1, F0 + 0.4, cz - 1.3, cx + sx * (ai - 0.12) + 0.1, F0 + 3.4, cz + 1.3)); bag.add('paint_white', box(cx + sx * (ai - 0.12) - sx * 0.1 - 0.02, F0 + 0.7, cz - 1.0, cx + sx * (ai - 0.12) - sx * 0.1 + 0.02, F0 + 3.1, cz + 1.0)); }
      lights.push({ at: [cx, F0 + 3, cz - ai + 2.5], color: '#ffb46b', intensity: 3, distance: 12 });
    } else {
      // the upper chambers: a small altar with a lamp against the north wall, a mat and a sutra stand
      bag.add('lacquer_red', box(cx - 1.4, y, cz - ai + 0.3, cx + 1.4, y + 0.9, cz - ai + 1.2)); col.rect([cx - 1.4, cz - ai + 0.3, cx + 1.4, cz - ai + 1.2], y, y + 0.9);
      bag.add('lamp_paper', box(cx - 0.12, y + 0.9, cz - ai + 0.65, cx + 0.12, y + 1.25, cz - ai + 0.9));
      bag.add('reed_mat', box(cx - 1.2, y + 0.0, cz - ai + 2.0, cx + 1.2, y + 0.03, cz - ai + 3.4));
    }
    y += h;
  });
  // the crown: a stepped square roof and the finial
  const s = 8.5;
  bag.add('roof_ridge', frustum(R(s - 0.6), y, y + 0.5, 0, 0, 0, 0));   bag.add('tile_grey', frustum(R(s - 0.3), y + 0.5, y + 2.0, s - 1.2, s - 1.2, s - 1.2, s - 1.2));
  bag.add('gilt_bronze', lathe([[0.001, 2.0], [0.5, 2.0], [0.25, 2.5], [0.35, 3.0], [0.15, 3.6], [0.001, 4.2]], 10, null, cx, y, cz));
}

export const PAGODA_ELEMENTS = { tang_pagoda: tangPagoda };
