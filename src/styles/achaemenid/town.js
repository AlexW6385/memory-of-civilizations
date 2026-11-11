// The town of Parsa below the terrace (docs/settlements/persepolis.md §15): the flat-roofed mudbrick houses
// with their courts, doors, beam ends and roof stairs, and the royal workshops — the masons' yard with its
// blocks, drums and hoist, the brickmakers' and glaze-makers' kiln, and the hall of the carpenters, the metal-
// workers and the painters, which can be walked into.

import { box, lathe, rod } from '../../core/geom.js';
import { relief, strip } from './reliefs.js';

const C = 'marble_dark', S = 'limestone_persian', W = 'plaster_persian';
const RAND = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

export { house, houseVent, houseMake, houseDoor, houseRoom, frameOf, streetChannel, flagApron, gardenPlot } from './houses.js';

// ═══ the royal workshops ═══════════════════════════════════════════════════════════════════════════════════════════

/** Where the workshops smoke: the kiln's flue and the smiths' furnace hood. */
export function workshopVents(rect) {
  const [x0, , x1, z1] = rect, bay = (x1 - x0 - 4.4) / 3, hz0 = z1 - 0.9 - 0.2 - 22;
  return [[x0 + 0.9 + 8, 4.6, hz0 - 7], [x0 + 2.2 + bay + 0.3 + 4.2, 6.5, z1 - 0.9 - 0.2 - 4.2]];
}

/**
 * royal_workshops: { rect, y } — one walled compound (docs/settlements/persepolis.md §15): the masons' yard behind the gate on
 * the road (blocks of the grey stone in rows, column drums on timber cradles, a bull capital half-cut on its block, the
 * shear-legs hoist with its rope, a sledge on rollers, a heap of chips, a trough), the brickmakers' rows of drying bricks
 * and the kiln of the glaze-makers on the west; and across the south the long hall — three bays under one flat roof on
 * timber posts, open to the yard by wide doorways: the carpenters (cedar logs, planks, benches, a half-made door), the
 * metalworkers (the furnace and its bellows, the anvil, moulds, gilded rosettes and horns) and the painters (their
 * pigments, panels of relief with figures half-painted).
 */
export function workshops(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = RAND(4801), wh = 3.6;
  const B = (mat, a0, b0, a1, b1, y0, y1, solid = false) => { bag.add(mat, box(a0, y0, b0, a1, y1, b1)); if (solid) col.rect([a0, b0, a1, b1], y0, y1); };
  const xc = (x0 + x1) / 2, th = 0.9;
  // the compound's wall, the gate on the road (the north) with its stone jambs and the cedar lintel
  const run = (a0, a1, c0, c1, alongX, hh = wh) => { B('mudbrick', alongX ? a0 : c0, alongX ? c0 : a0, alongX ? a1 : c1, alongX ? c1 : a1, y, y + hh * 0.62, true); B('mud_plaster', alongX ? a0 : c0, alongX ? c0 : a0, alongX ? a1 : c1, alongX ? c1 : a1, y + hh * 0.62, y + hh); };
  const cap = (a0, a1, c0, c1, alongX) => B('mud_plaster', alongX ? a0 - 0.1 : c0 - 0.1, alongX ? c0 - 0.1 : a0 - 0.1, alongX ? a1 + 0.1 : c1 + 0.1, alongX ? c1 + 0.1 : a1 + 0.1, y + wh, y + wh + 0.18);
  const gw = 5.4;
  const jw = gw / 2 + 0.55;
  run(x0, xc - jw, z0, z0 + th, true); run(xc + jw, x1, z0, z0 + th, true); cap(x0, xc - jw, z0, z0 + th, true); cap(xc + jw, x1, z0, z0 + th, true);
  for (const s of [-1, 1]) { const gx = xc + s * (gw / 2 + 0.55); B(C, gx - 0.55, z0 - 0.15, gx + 0.55, z0 + th + 0.15, y, y + 4.4, true); }
  B(C, xc - gw / 2 - 1.1, z0 - 0.15, xc + gw / 2 + 1.1, z0 + th + 0.15, y + 4.4, y + 5.0);
  B('cedar', xc - gw / 2 - 0.6, z0 - 0.25, xc + gw / 2 + 0.6, z0 + th + 0.25, y + 3.9, y + 4.4);
  for (let a = xc - gw / 2 - 0.9; a < xc + gw / 2 + 1; a += 0.5) B('gilt_bronze', a, z0 - 0.17, a + 0.22, z0 - 0.15, y + 4.45, y + 4.95);   // a row of gilt rosettes' studs (the lintel's band)
  run(x0, x0 + th, z0, z1, false); run(x1 - th, x1, z0, z1, false); run(x0, x1, z1 - th, z1, true);
  cap(x0, x0 + th, z0, z1, false); cap(x1 - th, x1, z0, z1, false); cap(x0, x1, z1 - th, z1, true);
  // the ground of the yard: beaten earth over the plain (a slab, so that the stone and the bricks stand on it)
  B('mud_plaster', x0 + th, z0 + th, x1 - th, z1 - th, y - 0.01, y + 0.04);
  // ── the hall across the south: three bays
  const hx0 = x0 + 2.2, hx1 = x1 - 2.2, hz1 = z1 - th - 0.2, hz0 = hz1 - 22, hh = 4.5, HT = 0.7;
  const bay = (hx1 - hx0) / 3, top = y + hh + 0.8;
  B('flagstone', hx0, hz0, hx1, hz1, y + 0.04, y + 0.12); col.floor([hx0, hz0, hx1, hz1], y + 0.12);
  // (the hall's back is the compound's south wall; its ends are walls of their own beside the compound's walls)
  B('mudbrick', hx0, hz0, hx0 + HT, hz1, y + 0.12, y + hh * 0.62, true); B('mud_plaster', hx0, hz0, hx0 + HT, hz1, y + hh * 0.62, y + hh);
  B('mudbrick', hx1 - HT, hz0, hx1, hz1, y + 0.12, y + hh * 0.62, true); B('mud_plaster', hx1 - HT, hz0, hx1, hz1, y + hh * 0.62, y + hh);
  B('mudbrick', hx0, hz1 - 0.3, hx1, hz1, y + 0.12, y + hh * 0.62, true); B('mud_plaster', hx0, hz1 - 0.3, hx1, hz1, y + hh * 0.62, y + hh);
  // the front wall along z = hz0: a doorway of 3 m in the middle of each bay, two windows in each
  const doors = [];
  for (let i = 0; i < 3; i++) doors.push(hx0 + (i + 0.5) * bay);
  let p = hx0 + HT;
  const front = (a, b, openingH) => { if (b - a > 0.05) { B('mudbrick', a, hz0, b, hz0 + HT, y + 0.12, y + 0.12 + (openingH ?? hh) * 0.62, true); B('mud_plaster', a, hz0, b, hz0 + HT, y + 0.12 + (openingH ?? hh) * 0.62, y + hh); } };
  for (const d of doors) {
    front(p, d - 1.5); const dh = 3.2;
    B('mud_plaster', d - 1.5, hz0, d + 1.5, hz0 + HT, y + 0.12 + dh, y + hh);
    B('cedar', d - 1.8, hz0 - 0.1, d + 1.8, hz0 + HT + 0.1, y + 0.12 + dh, y + 0.12 + dh + 0.3);
    for (const s of [-1, 1]) B(C, d + s * 1.6 - 0.14, hz0 - 0.08, d + s * 1.6 + 0.14, hz0 + HT + 0.08, y + 0.12, y + 0.12 + dh);
    p = d + 1.5;
  }
  front(p, hx1 - HT);
  // clerestory slits along the front, between the doorways
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const a = doors[i] + s * 4.8; B('opening', a - 0.35, hz0 + 0.05, a + 0.35, hz0 + HT - 0.05, y + 2.9, y + 3.7); B('cedar', a - 0.45, hz0 - 0.06, a + 0.45, hz0 + HT + 0.06, y + 3.7, y + 3.85); }
  // the cross walls of the bays, each with a doorway of 3 m
  for (let i = 1; i < 3; i++) {
    const wx = hx0 + i * bay;
    B('mudbrick', wx - 0.3, hz0 + HT, wx + 0.3, (hz0 + hz1) / 2 - 1.6, y + 0.12, y + hh * 0.62, true); B('mud_plaster', wx - 0.3, hz0 + HT, wx + 0.3, (hz0 + hz1) / 2 - 1.6, y + hh * 0.62, y + hh);
    B('mudbrick', wx - 0.3, (hz0 + hz1) / 2 + 1.6, wx + 0.3, hz1 - 0.3, y + 0.12, y + hh * 0.62, true); B('mud_plaster', wx - 0.3, (hz0 + hz1) / 2 + 1.6, wx + 0.3, hz1 - 0.3, y + hh * 0.62, y + hh);
    B('mud_plaster', wx - 0.3, (hz0 + hz1) / 2 - 1.6, wx + 0.3, (hz0 + hz1) / 2 + 1.6, y + 0.12 + 2.9, y + hh);
    B('cedar', wx - 0.4, (hz0 + hz1) / 2 - 1.8, wx + 0.4, (hz0 + hz1) / 2 + 1.8, y + 0.12 + 2.75, y + 0.12 + 2.95);
  }
  // the roof: cedar beams across, the earth over them, the parapet
  B('cedar', hx0, hz0, hx1, hz1, y + hh, y + hh + 0.4);
  B('mud_plaster', hx0, hz0, hx1, hz1, y + hh + 0.4, y + hh + 0.8);
  for (let a = hx0 + 0.6; a < hx1 - 0.3; a += 0.9) B('cedar', a - 0.1, hz0 - 0.25, a + 0.1, hz0, y + hh - 0.5, y + hh - 0.1);   // beam ends on the front under the roof edge
  B('mud_plaster', hx0, hz0, hx1, hz0 + 0.3, y + hh + 0.8, y + hh + 1.2);
  // the posts in the bays: two in a row down the middle of each, on stone bases, with a beam along the bay
  const post = (px, pz) => {
    B(C, px - 0.4, pz - 0.4, px + 0.4, pz + 0.4, y + 0.12, y + 0.4); bag.add('wood_dark', lathe([[0.22, 0], [0.2, hh - 0.6]], 10, null, px, y + 0.4, pz)); B('cedar', px - 0.34, pz - 0.34, px + 0.34, pz + 0.34, y + hh - 0.7, y + hh);
    col.circle(px, pz, 0.35, y, y + hh);
  };
  const hzm = (hz0 + hz1) / 2 + 2;
  for (let i = 0; i < 3; i++) for (const s of [0.3, 0.7]) post(hx0 + (i + s) * bay, hzm);
  for (let i = 0; i < 3; i++) B('cedar', hx0 + (i + 0.3) * bay - 0.3, hzm - 0.2, hx0 + (i + 0.7) * bay + 0.3, hzm + 0.2, y + hh - 0.85, y + hh - 0.7);
  const fl = y + 0.12;
  // ── bay 1: the carpenters
  {
    const bx = hx0 + HT;
    for (const [dx, dz] of [[2.4, 6.2], [2.4, 11]]) {            // benches with their vises
      const a = bx + dx, b = hz0 + dz; B('wood_dark', a - 1.2, b - 0.45, a + 1.2, b + 0.45, fl + 0.78, fl + 0.88, true);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) B('timber', a + sx * 1.1 - 0.06, b + sz * 0.36 - 0.06, a + sx * 1.1 + 0.06, b + sz * 0.36 + 0.06, fl, fl + 0.78);
      B('iron', a - 1.0, b + 0.45, a - 0.8, b + 0.6, fl + 0.88, fl + 1.0);
      bag.add('timber', rod([a + 0.3, fl + 0.9, b - 0.1], [a + 0.55, fl + 0.9, b + 0.1], 0.025, 5));
    }
    // cedar logs on trestles and planks stacked along the end wall
    for (let k = 0; k < 3; k++) { const z = hz0 + 5.5 + k * 3.2; bag.add('cedar', rod([bx + 4.6, fl + 0.55 + (k % 2) * 0.05, z], [bx + 12.3, fl + 0.55 + (k % 2) * 0.05, z + 0.3], 0.27, 10)); col.rect([bx + 4.6, z - 0.3, bx + 12.3, z + 0.6], fl, fl + 0.85); for (const x of [bx + 6, bx + 11]) B('timber', x - 0.06, z - 0.3, x + 0.06, z + 0.3, fl, fl + 0.4); }
    for (let k = 0; k < 7; k++) B('timber', bx + 0.2, hz1 - 3.4 + k * 0.4 - 0.3, bx + 3.2, hz1 - 3.4 + k * 0.4 - 0.12, fl, fl + 0.14 + k * 0.1);
    col.rect([bx + 0.2, hz1 - 3.7, bx + 3.2, hz1 - 0.6], fl, fl + 0.9);
    // a door leaf standing on its edge, half-made, a gilt fitting on it; the tools on pegs along the back wall
    B('cedar', bx + 9, hz1 - 1.3, bx + 10.8, hz1 - 1.1, fl, fl + 2.6);
    for (let k = 0; k < 8; k++) B('bronze', bx + 9.15 + (k % 2) * 1.4, hz1 - 1.1, bx + 9.35 + (k % 2) * 1.4, hz1 - 1.06, fl + 0.4 + Math.floor(k / 2) * 0.55, fl + 0.6 + Math.floor(k / 2) * 0.55);
    col.rect([bx + 9, hz1 - 1.4, bx + 10.8, hz1 - 1.0], fl, fl + 2.6);
    for (let k = 0; k < 7; k++) { const a = bx + 1.3 + k * 2.1; bag.add('wood_dark', rod([a, fl + 1.55, hz1 - 0.34], [a + 0.1, fl + 2.15, hz1 - 0.34], 0.03, 5)); B('iron', a + 0.02, hz1 - 0.38, a + 0.28, hz1 - 0.34, fl + 2.1, fl + 2.2); }
    // shavings on the floor
    for (let k = 0; k < 22; k++) B('wood_dark', bx + 2 + rand() * 7, hz0 + 3 + rand() * 12, bx + 2.15 + rand() * 7, hz0 + 3.12 + rand() * 12, fl, fl + 0.02);
  }
  // ── bay 2: the metalworkers
  {
    const bx = hx0 + bay + 0.3, fz = hz1 - 4.2, fx = bx + 4.2;
    // the furnace: a brick drum with its fire mouth toward the hall, the hood and flue above, two bellows with their nozzles
    bag.add('mudbrick', lathe([[1.1, 0], [1.05, 1.05], [0.8, 1.2]], 14, null, fx, fl, fz)); col.circle(fx, fz, 1.1, fl, fl + 1.2);
    bag.add('opening', box(fx - 0.35, fl + 0.2, fz - 1.12, fx + 0.35, fl + 0.7, fz - 0.95));
    bag.add('flame', lathe([[0.28, 0], [0.14, 0.14], [0.001, 0.3]], 8, null, fx, fl + 0.22, fz - 0.9));
    bag.add('mud_plaster', lathe([[0.8, 0], [0.5, 1.2], [0.36, 2.4]], 12, null, fx, fl + 1.2, fz));
    bag.add('mudbrick', lathe([[0.36, 0], [0.34, 2.7]], 10, null, fx, fl + 3.6, fz));
    lights.push({ at: [fx, fl + 0.9, fz - 1.6], color: '#ff8a3c', intensity: 3.2, distance: 9 });
    for (const s of [-1, 1]) {
      const bz = fz - 1.6; bag.add('hide_tan', lathe([[0.001, 0], [0.3, 0.2], [0.32, 0.55], [0.18, 0.85], [0.001, 0.9]], 10, null, fx + s * 0.9, fl, bz));
      bag.add('iron', rod([fx + s * 0.9, fl + 0.4, bz + 0.2], [fx + s * 0.35, fl + 0.45, fz - 0.98], 0.03, 6)); col.circle(fx + s * 0.9, bz, 0.35, fl, fl + 0.9);
    }
    // the anvil stone and a quench trough, the bench with moulds and the gilded work
    B('marble_dark', bx + 7.6, fz - 2.0, bx + 8.4, fz - 1.3, fl, fl + 0.7, true); B('iron', bx + 7.5, fz - 1.9, bx + 8.5, fz - 1.4, fl + 0.7, fl + 0.78);
    bag.add('pottery_dark', lathe([[0.001, 0], [0.4, 0.1], [0.5, 0.6], [0.001, 0.62]], 12, null, bx + 6.4, fl, fz - 2.3)); col.circle(bx + 6.4, fz - 2.3, 0.5, fl, fl + 0.6);
    B('wood_dark', bx + 1.0, fz - 8.5, bx + 3.4, fz - 7.5, fl + 0.8, fl + 0.9, true);
    for (const s of [[-0.9, 0.1], [0.9, 0.1], [-0.9, 0.9], [0.9, 0.9]]) B('timber', bx + 2.2 + s[0] - 0.06, fz - 8.5 + s[1] - 0.06, bx + 2.2 + s[0] + 0.06, fz - 8.5 + s[1] + 0.06, fl, fl + 0.8);
    for (let k = 0; k < 5; k++) { const a = bx + 1.35 + k * 0.45; bag.add('gilt_bronze', lathe([[0.001, 0], [0.16, 0], [0.16, 0.04], [0.06, 0.07], [0.001, 0.09]], 12, null, a, fl + 0.9, fz - 8.0)); }
    for (let k = 0; k < 2; k++) { bag.add('gold', lathe([[0.001, 0], [0.12, 0], [0.12, 0.05], [0.001, 0.05]], 10, null, bx + 2.4 + k * 0.5, fl + 0.9, fz - 8.3)); }
    for (let k = 0; k < 3; k++) bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.09, 0.1], [0.05, 0.12], [0.001, 0.11]], 8, null, bx + 1.2 + k * 0.4, fl + 0.9, fz - 7.7));   // crucibles
    // a heap of charcoal and a rack of bronze ingots
    B('wood_dark', bx + 0.6, fz + 1.8, bx + 2.7, fz + 3.1, fl, fl + 0.75, true);
    for (let k = 0; k < 6; k++) B('bronze', bx + 12.3, fz - 5.2 + k * 0.5, bx + 13.4, fz - 4.85 + k * 0.5, fl + 0.55, fl + 0.7);
    B('wood_dark', bx + 12.1, fz - 5.4, bx + 13.6, fz - 2.2, fl + 0.4, fl + 0.55, true);
    for (const z of [-5.3, -2.5]) for (const x of [12.2, 13.5]) B('timber', bx + x - 0.05, fz + z - 0.05, bx + x + 0.05, fz + z + 0.05, fl, fl + 0.4);
  }
  // ── bay 3: the painters and polishers
  {
    const bx = hx0 + 2 * bay + 0.3, bw = bay - 0.6;
    // the long table of pigments in bowls: Egyptian blue, red ochre, green, white
    const tz = hz0 + 5.5; B('wood_dark', bx + 1.2, tz - 0.5, bx + 8.8, tz + 0.5, fl + 0.78, fl + 0.88, true);
    for (const sx of [0, 1]) for (const sz of [-1, 1]) B('timber', bx + 1.35 + sx * 7.3, tz + sz * 0.38 - 0.06, bx + 1.5 + sx * 7.3, tz + sz * 0.38 + 0.06, fl, fl + 0.78);
    ['egyptian_blue', 'stucco_red', 'cloth_green', 'plaster_white', 'cloth_ochre', 'egyptian_blue', 'stucco_red'].forEach((mat, k) => {
      const a = bx + 1.7 + k * 1.05; bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0], [0.16, 0.08], [0.15, 0.1], [0.12, 0.1], [0.001, 0.03]], 10, null, a, fl + 0.88, tz));
      bag.add(mat, lathe([[0.001, 0.07], [0.12, 0.07], [0.11, 0.09], [0.001, 0.12]], 10, null, a, fl + 0.88, tz));
    });
    // the panels leaning against the back wall: slabs of the grey stone with figures of the guard raised on them, some painted, some bare
    const zw = hz1 - 0.3, pw = 1.45;
    for (let k = 0; k < 4; k++) {
      const a = bx + 0.9 + k * (pw + 0.35);
      B(C, a, zw - 0.34, a + pw, zw - 0.14, fl, fl + 2.1);
      const place = (u, v, w) => [u, fl + v, zw - 0.14 - w * -1];
      const mats = [['egyptian_blue', 'persian'], ['stucco_red', 'mede'], [C, 'persian'], ['egyptian_blue', 'bearer']][k], Pm = (u, v, w) => [u, fl + v, zw - 0.14 - w];
      // (the wall's outward is −z: the relief stands out toward the hall)
      relief(bag, mats[0], mats[1], Pm, a + pw / 2, 0.25, 1.65, 1, 0.05);
      void place;
    }
    col.rect([bx + 0.9, zw - 0.4, bx + 0.9 + 4 * (pw + 0.35), zw - 0.1], fl, fl + 2.1);
    // a polishing slab with its block and stones, a stand with brushes, an oil lamp on a tall stand
    B('marble_dark', bx + 11.0, hz0 + 8.0, bx + 13.4, hz0 + 9.3, fl, fl + 0.6, true);
    B('limestone', bx + 11.3, hz0 + 8.3, bx + 12.4, hz0 + 8.9, fl + 0.6, fl + 0.7);
    for (let k = 0; k < 3; k++) bag.add('rubble', lathe([[0.001, 0], [0.1, 0.01], [0.08, 0.06], [0.001, 0.07]], 8, null, bx + 12.6 + k * 0.2, fl + 0.6, hz0 + 8.7));
    const lx = bx + bw - 1.2, lz = hz0 + 4.2;
    bag.add('bronze', lathe([[0.18, 0], [0.04, 0.1], [0.04, 1.5], [0.2, 1.58], [0.001, 1.6]], 10, null, lx, fl, lz)); col.circle(lx, lz, 0.2, fl, fl + 1.6);
    bag.add('flame', lathe([[0.06, 0], [0.03, 0.08], [0.001, 0.15]], 6, null, lx, fl + 1.6, lz));
    lights.push({ at: [lx, fl + 1.9, lz], color: '#ffb46b', intensity: 2.4, distance: 8 });
    for (let k = 0; k < 4; k++) bag.add('cedar', rod([bx + 4 + k * 0.1, fl, hz0 + 11.5], [bx + 4.4 + k * 0.1, fl + 1.2, hz0 + 11.5], 0.02, 5));
  }
  // lamps in the other bays and by the doors
  lights.push({ at: [hx0 + 0.5 * bay, y + 3.4, hzm], color: '#ffc58a', intensity: 1.8, distance: 12 }, { at: [hx0 + 1.5 * bay, y + 3.4, hzm - 4], color: '#ffc58a', intensity: 1.4, distance: 12 }, { at: [hx0 + 2.5 * bay, y + 3.4, hzm], color: '#ffc58a', intensity: 1.8, distance: 12 });
  // ── the masons' yard
  const yz0 = z0 + th + 1.2, yz1 = hz0 - 2;
  // blocks of the grey stone in rows, squared, with a few rough ones; a heap of chips
  for (let i = 0; i < 12; i++) {
    const rx = x0 + th + 2.5 + (i % 6) * 3.6, rz = yz1 - 3.2 - Math.floor(i / 6) * 2.6, sx = 1.9 + rand() * 0.5, sz = 0.9 + rand() * 0.3, sh = 0.7 + rand() * 0.3;
    B(S, rx, rz, rx + sx, rz + sz, y, y + sh, true);
    if (i % 3 === 0) B(S, rx + 0.2, rz + 0.1, rx + sx - 0.2, rz + sz - 0.1, y + sh, y + sh + 0.6, true);
  }
  // column drums lying on cradles: grey, with the flutes cut in the one nearest the door
  for (let i = 0; i < 3; i++) {
    const dx = x0 + th + 6 + i * 4.8, dz = yz0 + 11;
    bag.add(S, rod([dx - 1.1, y + 0.9, dz], [dx + 1.1, y + 0.9, dz], 0.8, i === 0 ? 24 : 16)); col.rect([dx - 1.1, dz - 0.8, dx + 1.1, dz + 0.8], y, y + 1.7);
    for (const s of [-1, 1]) B('timber', dx + s * 0.7 - 0.12, dz - 0.7, dx + s * 0.7 + 0.12, dz + 0.7, y, y + 0.18);
  }
  // the bull capital half-cut on its block: the block with the beast's forepart roughed out — chest, neck and head — the chisel marks, mallet and chisels beside it
  {
    const bx = xc + 3, bz = yz0 + 12;
    B(S, bx - 1.7, bz - 1.0, bx + 1.7, bz + 1.0, y, y + 1.1, true);
    bag.add(C, rod([bx - 1.2, y + 1.7, bz], [bx + 1.0, y + 1.8, bz], 0.55, 10));                               // the body of the beast, still round
    bag.add(C, rod([bx + 1.0, y + 1.8, bz], [bx + 1.9, y + 2.35, bz], 0.38, 10));                              // the neck rising
    bag.add(S, box(bx + 1.7, y + 2.2, bz - 0.28, bx + 2.45, y + 2.75, bz + 0.28));                             // the head, a block not yet carved
    col.rect([bx - 1.7, bz - 1.0, bx + 2.5, bz + 1.0], y, y + 2.8);
    B(S, bx - 1.7, bz + 1.0, bx - 0.3, bz + 1.5, y, y + 0.5, true);
    bag.add('iron', rod([bx - 1.0, y + 0.55, bz + 1.25], [bx - 0.7, y + 0.62, bz + 1.3], 0.02, 5)); bag.add('wood_dark', rod([bx - 0.5, y + 0.52, bz + 1.25], [bx - 0.1, y + 0.6, bz + 1.3], 0.05, 6));
    for (let k = 0; k < 12; k++) B(S, bx - 1.9 + rand() * 4.4, bz + 1.1 + rand() * 1.5, bx - 1.8 + rand() * 4.4, bz + 1.2 + rand() * 1.5, y, y + 0.05 + rand() * 0.08);
  }
  // the shear-legs hoist: three poles, a rope over the head and a stone hanging from it
  {
    const hx = xc - 9, hz = yz0 + 6;
    for (const [dx, dz] of [[-1.7, -1.2], [1.7, -1.2], [0, 2]]) bag.add('timber', rod([hx + dx, y, hz + dz], [hx, y + 6.2, hz], 0.1, 6));
    bag.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.18, 0.08], [0.001, 0.1]], 8, null, hx, y + 6.1, hz));
    bag.add('hide_tan', rod([hx, y + 6.1, hz], [hx, y + 2.9, hz + 0.1], 0.03, 5)); bag.add('hide_tan', rod([hx, y + 6.1, hz], [hx + 3, y + 0.2, hz + 4], 0.03, 5));
    B(S, hx - 0.8, hz + 0.0, hx + 0.8, hz + 0.8, y + 1.2, y + 2.9);
    B('timber', hx - 1.0, hz - 0.3, hx + 1.0, hz + 1.1, y + 0.5, y + 1.2);
    B('timber', hx - 0.1, hz - 0.3, hx + 0.1, hz + 1.1, y, y + 0.5);
    for (const [dx, dz] of [[-1.7, -1.2], [1.7, -1.2], [0, 2]]) col.circle(hx + dx * 0.9, hz + dz * 0.9, 0.2, y, y + 3);
  }
  // a sledge on rollers carrying a finished column drum toward the gate, its rope laid out
  {
    const sx = xc + 14, sz = yz0 + 3;
    for (let k = 0; k < 3; k++) bag.add('timber', rod([sx - 1.6 + k * 1.5, y + 0.1, sz - 1.0], [sx - 1.6 + k * 1.5, y + 0.1, sz + 1.0], 0.1, 7));
    B('timber', sx - 2.2, sz - 0.7, sx + 2.2, sz + 0.7, y + 0.2, y + 0.35);
    bag.add(C, rod([sx - 1.0, y + 1.1, sz], [sx + 1.0, y + 1.1, sz], 0.75, 20)); col.rect([sx - 2.2, sz - 0.9, sx + 2.2, sz + 0.9], y, y + 1.9);
    bag.add('hide_tan', rod([sx + 2.2, y + 0.3, sz], [sx + 8, y + 0.08, sz + 1.5], 0.04, 5));
  }
  // the trough and jars of water, a heap of reed mats and a stack of cedar poles for a scaffold along the west
  { const tx = x1 - th - 4, tz = yz0 + 4; B('limestone', tx, tz, tx + 2.4, tz + 0.9, y, y + 0.55, true); bag.add('wicker', lathe([[0.001, 0], [0.4, 0], [0.45, 0.4], [0.4, 0.5]], 10, null, tx + 3.2, y, tz + 0.4));
    for (let k = 0; k < 3; k++) { bag.add('terracotta', lathe([[0.001, 0], [0.16, 0], [0.34, 0.4], [0.3, 0.75], [0.15, 0.95], [0.001, 0.93]], 10, null, tx + 0.4 + k * 0.7, y, tz - 0.6)); col.circle(tx + 0.4 + k * 0.7, tz - 0.6, 0.3, y, y + 0.9); } }
  for (let k = 0; k < 5; k++) bag.add('timber', rod([x0 + th + 0.6 + k * 0.28, y + 0.14, yz0 + 1], [x0 + th + 0.6 + k * 0.28, y + 0.14, yz0 + 8], 0.1, 6));
  // ── the brickmakers and the kiln on the west of the yard: rows of bricks drying on edge, the kiln with its stoking hole
  for (let i = 0; i < 4; i++) { const bx = x1 - th - 4.2, bz = yz0 + 9 + i * 2.4; B('mudbrick', bx, bz, bx + 3.2, bz + 0.45, y, y + 0.55, true); B('mudbrick', bx + 0.15, bz, bx + 3.05, bz + 0.45, y + 0.55, y + 0.85); }
  {
    const kx = x0 + th + 8, kz = hz0 - 7;
    bag.add('brick', lathe([[2.0, 0], [2.0, 1.8], [1.5, 2.8], [0.5, 3.4]], 16, null, kx, y, kz)); col.circle(kx, kz, 2.0, y, y + 3);
    bag.add('brick', lathe([[0.55, 0], [0.5, 1.8]], 10, null, kx, y + 3.4, kz));
    bag.add('opening', box(kx - 0.5, y + 0.15, kz + 1.88, kx + 0.5, y + 1.0, kz + 2.05));
    bag.add('flame', lathe([[0.4, 0], [0.18, 0.18], [0.001, 0.4]], 8, null, kx, y + 0.2, kz + 1.85));
    lights.push({ at: [kx, y + 1.2, kz + 2.6], color: '#ff8a3c', intensity: 3.5, distance: 10 });
    // glazed bricks laid out to dry before it: blue, yellow and white in a row (after the glazed bricks of the Tol-e Ajori)
    ['glaze_lapis', 'plaster_white', 'glaze_red', 'glaze_lapis', 'plaster_white'].forEach((mat, k) => B(mat, kx - 2.4 + k * 1.0, kz + 3.3, kx - 1.5 + k * 1.0, kz + 3.75, y + 0.05, y + 0.14));
    for (let k = 0; k < 3; k++) B('wood_dark', kx + 2.6 + k * 0.1, kz - 1.0 + k * 0.5, kx + 3.4 + k * 0.1, kz - 0.7 + k * 0.5, y, y + 0.3 + k * 0.1);
  }
  // the gate's door leaves standing open against the inside wall
  for (const s of [-1, 1]) B('wood_dark', xc + s * (gw / 2 - 0.1) - 0.05, z0 + th, xc + s * (gw / 2 - 0.1) + 0.05, z0 + th + 2.6, y, y + 3.0);
  strip(bag, 'gilt_bronze', (u, v, w) => [u, y + v, z0 - 0.15 - w], xc - 2.4, 3.2, xc + 2.4, 3.2, 0.06, 0.03);
}
