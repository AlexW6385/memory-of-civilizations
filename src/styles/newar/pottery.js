// The potters of Bhaktapur (docs/settlements/bhaktapur.md §1): pots thrown on wheels along the square,
// dried in the sun in rows in the open middle, fired in straw-covered kilns behind the wheels.

import { box, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const PROFILES = {
  round: [[0.001, 0], [0.09, 0.01], [0.17, 0.08], [0.2, 0.19], [0.16, 0.3], [0.09, 0.36], [0.1, 0.4], [0.13, 0.42], [0.11, 0.42], [0.08, 0.38], [0.001, 0.3]],   // the water pot (matka)
  jar: [[0.001, 0], [0.12, 0.01], [0.24, 0.1], [0.28, 0.26], [0.22, 0.44], [0.13, 0.52], [0.15, 0.56], [0.12, 0.56], [0.001, 0.5]],
  cup: [[0.001, 0], [0.06, 0.005], [0.1, 0.06], [0.12, 0.13], [0.1, 0.13], [0.001, 0.02]],                                    // the small curd pot
  bowl: [[0.001, 0], [0.1, 0.005], [0.2, 0.08], [0.24, 0.12], [0.2, 0.12], [0.001, 0.02]],
  diya: [[0.001, 0], [0.04, 0.005], [0.07, 0.03], [0.075, 0.045], [0.001, 0.02]],
};
/** One pot of a kind at (x, y, z), scaled by s (terracotta, or the dark fired clay now and then). */
export function pot(bag, x, y, z, kind = 'round', s = 1, dark = false) {
  bag.add(dark ? 'pottery_dark' : 'terracotta', lathe(PROFILES[kind].map(([r, h]) => [r * s, h * s]), 8, null, x, y, z));
}

/**
 * newar_pot_court { rect, seed, skip: [[x0, z0, x1, z1] ...] (kept clear: wheels, kilns, aisles) }: the drying ground — rows of pots on the
 * packed earth, a row to a kind, an aisle across every fifth row.
 */
export function potCourt(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed ?? 9), skip = el.skip ?? [];
  const kinds = ['round', 'cup', 'jar', 'bowl', 'cup', 'round', 'diya', 'bowl'];
  let row = 0;
  for (let z = z0 + 1.2; z < z1 - 0.8; z += 1.05, row++) {
    if (row % 5 === 4) continue;
    const kind = kinds[row % kinds.length], dark = row % 7 === 3;
    for (let x = x0 + 1; x < x1 - 0.6; x += kind === 'jar' ? 1.1 : kind === 'diya' ? 0.45 : 0.75) {
      if (skip.some((r) => x > r[0] && x < r[2] && z > r[1] && z < r[3]) || rand() < 0.12) continue;
      pot(bag, x + (rand() - 0.5) * 0.06, 0, z + (rand() - 0.5) * 0.06, kind, 0.9 + rand() * 0.2, dark);
      if (kind !== 'diya') col.circle(x, z, kind === 'jar' ? 0.3 : 0.2, 0, 0.4);
    }
  }
}

/** newar_wheel { c, yaw }: a potter's seat and wheel, a basin of clay, a board of new pots; ~1.6 m. */
export function potterWheel(el, { bag, col }) {
  const [cx, cz] = el.c, yaw = el.yaw ?? 0, co = Math.cos(yaw), si = Math.sin(yaw);
  const P = (u, v) => [cx + u * co + v * si, cz - u * si + v * co];
  const wheel = P(0, 0);
  bag.add('wood_dark', rod([wheel[0], 0, wheel[1]], [wheel[0], 0.22, wheel[1]], 0.05, 6));
  bag.add('wood_ochre', lathe([[0.001, 0.22], [0.32, 0.22], [0.32, 0.27], [0.001, 0.27]], 14, null, wheel[0], 0, wheel[1]));
  bag.add('mud_plaster', lathe([[0.001, 0.27], [0.1, 0.27], [0.12, 0.34], [0.07, 0.42], [0.001, 0.43]], 8, null, wheel[0], 0, wheel[1]));
  const b = P(0.7, -0.2); bag.add('terracotta', lathe([[0.001, 0], [0.2, 0.01], [0.26, 0.1], [0.28, 0.16], [0.24, 0.16], [0.001, 0.05]], 10, null, b[0], 0, b[1]));
  bag.add('mud_plaster', lathe([[0.001, 0.04], [0.22, 0.05], [0.2, 0.12], [0.001, 0.13]], 8, null, b[0], 0.0, b[1]));
  const s = P(-0.1, 0.55); bag.add('wood_painted', box(s[0] - 0.2, 0, s[1] - 0.2, s[0] + 0.2, 0.12, s[1] + 0.2));
  const q0 = P(-1.0, -0.6), q1 = P(-0.4, -0.3);
  bag.add('wood_ochre', box(Math.min(q0[0], q1[0]), 0.1, Math.min(q0[1], q1[1]), Math.max(q0[0], q1[0]), 0.14, Math.max(q0[1], q1[1])));
  for (let i = 0; i < 3; i++) { const p = P(-0.9 + i * 0.2, -0.45 + (i % 2) * 0.05); pot(bag, p[0], 0.14, p[1], i === 1 ? 'cup' : 'round', 0.7); }
  col.circle(wheel[0], wheel[1], 0.4, 0, 0.5);
}

/** newar_kiln { c, r }: the straw-fired kiln — a low brick ring, a mound of straw and clay over the stacked ware, a dark smoke hole; straw bundles beside it. */
export function kiln(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 1.8, rand = rng(Math.round(cx * 7 + cz));
  bag.add('brick', lathe([[r + 0.2, 0], [r + 0.2, 0.35], [r - 0.1, 0.35], [r - 0.1, 0]], 14, null, cx, 0, cz));
  bag.add('thatch', lathe([[r, 0.3], [r * 0.94, 0.7], [r * 0.7, 1.25], [r * 0.38, 1.65], [r * 0.14, 1.8], [0.001, 1.8]], 12, (t) => 1 + 0.05 * Math.sin(t * 4), cx, 0, cz));
  bag.add('bitumen', lathe([[0.3, 1.78], [0.3, 1.83], [0.001, 1.85]], 8, null, cx, 0, cz));
  col.circle(cx, cz, r + 0.25, 0, 1.9);
  for (let k = 0; k < 5; k++) {
    const a = 0.6 + k * 0.5, d = r + 1.5 + rand() * 0.4, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    bag.add('thatch', box(x - 0.45, 0, z - 0.2, x + 0.45, 0.4 + (k % 2) * 0.35, z + 0.2));
    col.rect([x - 0.45, z - 0.2, x + 0.45, z + 0.2], 0, 0.5);
  }
}
