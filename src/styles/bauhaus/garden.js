// The school's garden south of the workshop wing (docs/settlements/bauhaus-dessau.md §12): a clipped hedge along Mauerstrasse with a gate, a gravel-and-flag
// path with benches, the students' vegetable and flower beds, a table under the birches, the bicycle shed with its rows of bicycles, a notice board.
// Plan coordinates, metres. One element carries the rects computed in layout.js.
import { S, rng, table, chair } from './kit.js';
import { GARDEN, GARDEN_GATE, GARDEN_PATHS, GARDEN_BEDS, GARDEN_SHED } from '../../settlements/bauhaus-dessau/layout.js';

/** Near-alike palette names folded into fewer materials: the garden's ~30 names cost ten draws. */
const FOLD = { plaster_grey: 'concrete_light', plaster_damp: 'concrete_light', wood_ochre: 'timber', wood_painted: 'timber', wood_dark: 'timber', iron_galv: 'iron', steel_grey: 'iron', steel_chrome: 'iron',
  paint_white: 'plaster_white', car_cream: 'plaster_white', cloth_white: 'plaster_white', flax_leaf: 'sod', cloth_green: 'sod', tile_dark: 'asphalt', cloth_ochre: 'paint_cab_yellow', cloth_red: 'car_red', paint_blue: 'car_red' };
const BLOOM = ['car_red', 'paint_cab_yellow', 'cloth_ochre', 'paint_white', 'cloth_red', 'paint_cab_yellow'];

/** A clipped hedge from a to b along an axis, 0.62 thick, its top a little uneven, as a solid. */
function hedge(sk, r, alongX, c, u0, u1) {
  for (let u = u0; u < u1 - 0.01; u += 1.2) {
    const e = Math.min(u + 1.2, u1), h = 0.86 + r() * 0.16;
    if (alongX) { sk.s('sod', u, 0, c - 0.31, e, h, c + 0.31); sk.b('sod', u + 0.05, h, c - 0.25, e - 0.05, h + 0.07, c + 0.25); }
    else { sk.s('sod', c - 0.31, 0, u, c + 0.31, h, e); sk.b('sod', c - 0.25, h, u + 0.05, c + 0.25, h + 0.07, e - 0.05); }
  }
}
/** A park bench with a back (slats of timber, cast-iron ends) at (x, z) facing `rot` (0: the sitter looks to −z). */
function bench(sk, x, z, rot) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const bx = (m, u0, u1, y0, y1, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); sk.b(m, Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1])); };
  for (const u of [-0.8, 0.8]) { bx('iron', u - 0.04, u + 0.04, 0, 0.45, -0.2, 0.2); bx('iron', u - 0.04, u + 0.04, 0.45, 0.92, 0.18, 0.24); }
  for (let k = 0; k < 3; k++) bx('timber', -0.95, 0.95, 0.44, 0.47, -0.22 + k * 0.15, -0.1 + k * 0.15);
  for (let k = 0; k < 3; k++) bx('timber', -0.95, 0.95, 0.56 + k * 0.13, 0.63 + k * 0.13, 0.19, 0.23);
  const a = P(-1, -0.25), b = P(1, 0.27); sk.k(Math.min(a[0], b[0]), 0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), 0.9, Math.max(a[1], b[1]));
}
/** bauhaus_garden: the garden of the school. */
export function bauhausGarden(el, ctx) {
  const sk = new S(ctx, FOLD), r = rng(el.seed || 12), [x0, z0, x1, z1] = GARDEN;
  // the hedge: Mauerstrasse's side with the gate's gap, the south side along Ebertallee's pavement
  hedge(sk, r, false, x0 + 0.3, z0 + 0.6, GARDEN_GATE[0]); hedge(sk, r, false, x0 + 0.3, GARDEN_GATE[1], z1 - 0.6);
  hedge(sk, r, true, z1 - 0.3, x0 + 0.6, x1);
  // the gate: two plastered posts with lamps of iron, the Bauhaus name board's blue on one, a bin
  for (const z of [GARDEN_GATE[0] - 0.25, GARDEN_GATE[1] + 0.25]) { sk.s('plaster_white', x0 - 0.1, 0, z - 0.2, x0 + 0.5, 1.5, z + 0.2); sk.b('concrete_light', x0 - 0.14, 1.5, z - 0.24, x0 + 0.54, 1.57, z + 0.24); }
  sk.b('paint_blue', x0 - 0.12, 1.0, GARDEN_GATE[0] - 0.4, x0 - 0.09, 1.35, GARDEN_GATE[0] - 0.1);
  // the paths: concrete flags with a gravel margin
  for (const [a, b, c, d] of GARDEN_PATHS) { sk.b('concrete_light', a, 0, b, c, 0.03, d); sk.b('plaster_grey', a, 0.03, b + 0.02, c, 0.035, b + 0.14); sk.b('plaster_grey', a, 0.03, d - 0.14, c, 0.035, d - 0.02); }
  for (let x = x0 + 3; x < 30; x += 3) sk.b('plaster_damp', x, 0.03, GARDEN_PATHS[0][1], x + 0.03, 0.04, GARDEN_PATHS[0][3]);   // the flags' joints
  // benches along the main path, on both sides, a bin by the first
  for (const x of [-8, 2, 20]) bench(sk, x, GARDEN_PATHS[0][1] - 0.6, Math.PI);
  for (const x of [-4, 14]) bench(sk, x, GARDEN_PATHS[0][3] + 0.6, 0);
  sk.lathe('iron_galv', [[0.2, 0], [0.24, 0.85], [0.001, 0.85]], -9.6, 0, 49.4, 8);
  // the students' beds: dark soil, the rows of cabbages, beans on poles, dahlias and sunflowers by the end beds
  GARDEN_BEDS.forEach(([a, b, c, d], i) => {
    sk.b('bark_dark', a, 0, b, c, 0.14, d);
    const kind = i % 4, mx = (a + c) / 2;
    for (let z = b + 0.6; z < d - 0.3; z += 0.7) {
      if (kind === 0) { sk.b('cloth_green', mx - 0.38, 0.14, z - 0.2, mx - 0.02, 0.46, z + 0.16); sk.b('cloth_green', mx + 0.02, 0.14, z - 0.2, mx + 0.38, 0.4, z + 0.16); }   // cabbages in two rows
      else if (kind === 1) { sk.b('flax_leaf', mx - 0.45, 0.14, z - 0.28, mx + 0.45, 0.34, z + 0.28); }                                                                  // carrots and beet: a leafy carpet
      else if (kind === 2) { const c0 = BLOOM[Math.floor(r() * BLOOM.length)]; sk.b('cloth_green', mx - 0.25, 0.14, z - 0.2, mx + 0.25, 0.5, z + 0.2); sk.b(c0, mx - 0.2, 0.5, z - 0.16, mx + 0.2, 0.62, z + 0.16); }   // dahlias
    }
    if (kind === 3) {                      // runner beans: poles in a row joined by a ridge pole, the leaves along them
      for (const z of [b + 0.8, (b + d) / 2, d - 0.8]) for (const dx of [-0.35, 0.35]) sk.rod('timber', [mx + dx, 0.14, z], [mx + dx * 0.1, 1.9, z], 0.02, 4);
      sk.rod('timber', [mx, 1.88, b + 0.8], [mx, 1.88, d - 0.8], 0.02, 4);
      for (const z of [b + 0.8, (b + d) / 2, d - 0.8]) sk.b('cloth_green', mx - 0.3, 0.5, z - 0.2, mx + 0.3, 1.7, z + 0.2);
    }
    sk.b('wood_ochre', a, 0.14, b - 0.03, c, 0.2, b + 0.0); sk.b('wood_ochre', a, 0.14, d, c, 0.2, d + 0.03);   // the bed's board ends
  });
  // a watering trough and a tub, a tool shed's lean-to at the garden's south-east corner of the beds
  sk.s('timber', 9.6, 0, 66.2, 10.6, 0.5, 68.6); sk.b('water', 9.65, 0.42, 66.25, 10.55, 0.44, 68.55);
  sk.s('wood_ochre', 12.0, 0, 64.0, 15.0, 2.3, 66.4); sk.b('tile_dark', 11.8, 2.3, 63.8, 15.2, 2.4, 66.6); sk.b('wood_dark', 12.7, 0, 66.4, 13.7, 1.9, 66.45);
  // the table under the birches: a long table with four tubular chairs, a second one for the draughtsmen's lunch
  table(sk, -6.0, 44.0, -3.6, 45.0, 0, 0.74, 'wood_painted', 'steel_chrome');
  for (const [x, z, d] of [[-5.6, 43.4, 2], [-4.0, 43.4, 2], [-5.6, 45.6, 0], [-4.0, 45.6, 0]]) chair(sk, x, 0, z, d);
  // the notice board at the gate: a pitched board on two posts, with sheets pinned to it
  for (const x of [x0 + 1.6, x0 + 3.0]) sk.rod('timber', [x, 0, GARDEN_GATE[1] + 1.3], [x, 1.9, GARDEN_GATE[1] + 1.3], 0.04, 5);
  sk.b('wood_painted', x0 + 1.5, 1.2, GARDEN_GATE[1] + 1.26, x0 + 3.1, 1.9, GARDEN_GATE[1] + 1.32);
  for (let k = 0; k < 6; k++) sk.b(['paint_white', 'cloth_ochre', 'car_red', 'paint_white', 'car_cream', 'paint_blue'][k], x0 + 1.55 + (k % 3) * 0.5, 1.28 + Math.floor(k / 3) * 0.32, GARDEN_GATE[1] + 1.2, x0 + 1.95 + (k % 3) * 0.5, 1.52 + Math.floor(k / 3) * 0.32, GARDEN_GATE[1] + 1.26);
  // the bicycle shed: a flat roof on white posts, open to the south, a low back wall; the racks of the students' bicycles stand in it (the elements are the plan's)
  const [sx0, sz0, sx1, sz1] = GARDEN_SHED;
  sk.b('concrete_light', sx0 - 0.15, 2.45, sz0 - 0.15, sx1 + 0.15, 2.6, sz1 + 0.35); sk.b('asphalt', sx0 - 0.1, 2.6, sz0 - 0.1, sx1 + 0.1, 2.64, sz1 + 0.3);
  sk.s('plaster_white', sx0, 0, sz0, sx1, 1.1, sz0 + 0.25); sk.b('steel_grey', sx0, 1.1, sz0 + 0.1, sx1, 2.45, sz0 + 0.15);
  for (let x = sx0; x <= sx1 + 0.01; x += 2.75) sk.s('plaster_white', x - 0.1, 0, sz1 - 0.1, x + 0.1, 2.45, sz1 + 0.1);
  for (let x = sx0 + 0.3; x < sx1; x += 0.6) sk.rod('steel_grey', [x, 0, sz0 + 0.5], [x, 0.7, sz0 + 0.5], 0.012, 4);
  sk.rod('steel_grey', [sx0 + 0.3, 0.7, sz0 + 0.5], [sx1 - 0.2, 0.7, sz0 + 0.5], 0.012, 4);
  sk.b('plaster_damp', sx0, 0, sz0 - 0.01, sx1, 0.45, sz0 + 0.27);
  // a volleyball net on the lawn: two posts, a net of white cord
  for (const z of [56.5, 63.5]) sk.rod('timber', [24, 0, z], [24, 2.4, z], 0.04, 5);
  for (let h = 1.6; h <= 2.4; h += 0.2) sk.rod('cloth_white', [24, h, 56.5], [24, h, 63.5], 0.006, 3);
  for (let z = 56.5; z <= 63.51; z += 0.5) sk.rod('cloth_white', [24, 1.6, z], [24, 2.4, z], 0.005, 3);
  // the lawn's edging against the paths and the hedge's foot: damp, as the Dessau sand holds it
  sk.b('plaster_damp', x0 + 0.0, 0, z0 + 0.6, x0 + 0.7, 0.03, GARDEN_GATE[0]); sk.b('plaster_damp', x0 + 0.0, 0, GARDEN_GATE[1], x0 + 0.7, 0.03, z1 - 0.6);
}
