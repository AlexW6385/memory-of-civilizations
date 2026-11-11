// Brasília style — the Esplanade's ministries, the Itamaraty and Justice palaces, the Planalto and the Supreme Court with their
// Alvorada columns, the Three Powers Square's furniture, the superquadra's slabs on pilotis and the commercial strip.
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { turnedBox, ring, revSurf, quad2, tri2, TAU } from './util.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** ministry: { rect (16 × 52 m, long along z), side ('n' the lawn at its south end, 's' at its north end), h, seed } — ten floors of green glass in a white frame over open pilotis. */
export function ministry(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 38, y0 = 4.6, front = el.side === 'n' ? 1 : -1;
  bag.add('facade_glass', box(x0 + 0.3, y0, z0 + 0.3, x1 - 0.3, h, z1 - 0.3));
  // the white frame: the floors' edges along the long faces, the end walls with their narrow windows, the corner piers
  for (let y = y0; y < h - 0.1; y += 3.7) for (const [a, b] of [[x0, x0 + 0.35], [x1 - 0.35, x1]]) bag.add(WHITE, box(a, y, z0, b, y + 0.34, z1));
  for (const zz of [z0, z1 - 0.4]) { bag.add(WHITE, box(x0, y0, zz, x1, h, zz + 0.4)); }
  const zf = front > 0 ? z1 : z0 - 0.0;
  for (let k = 0; k < 10; k++) for (const dx of [3.0, 9.0]) bag.add('glass_outer', box(x0 + dx, y0 + 1.0 + k * 3.7, front > 0 ? z1 : z0 - 0.03, x0 + dx + 4.0, y0 + 2.8 + k * 3.7, front > 0 ? z1 + 0.03 : z0));
  void zf;
  bag.add(WHITE, box(x0 - 0.5, h, z0 - 0.5, x1 + 0.5, h + 0.9, z1 + 0.5)); bag.add(CONC, box(x0 + 5, h + 0.9, z0 + 8, x1 - 5, h + 3.4, z0 + 16));
  bag.add(WHITE, lathe([[2.2, 0], [2.2, 2.4], [0.001, 2.4]], 12, null, (x0 + x1) / 2, h + 0.9, z1 - 12));
  // pilotis: slender piers along both long faces and two cores
  for (let z = z0 + 3; z < z1; z += 6.5) for (const x of [x0 + 1.0, x1 - 1.0]) { bag.add(WHITE, box(x - 0.4, 0, z - 0.4, x + 0.4, y0, z + 0.4)); col.circle(x, z, 0.5, 0, y0); }
  for (const zc of [z0 + (z1 - z0) * 0.3, z0 + (z1 - z0) * 0.7]) { bag.add(WHITE, box(x0 + 5, 0, zc - 3, x1 - 5, y0, zc + 3)); col.rect([x0 + 5, zc - 3, x1 - 5, zc + 3], 0, y0); bag.add('glass_outer', box(x0 + 5.5, 0.1, zc - 3.04, x1 - 5.5, 3.0, zc - 3)); }
  bag.add('marble', box(x0 + 0.5, 0.0, z0, x1 - 0.5, 0.04, z1)); bag.add('timber', box(x0 + 3, 0.0, front > 0 ? z1 - 5 : z0, x1 - 3, 0.9, front > 0 ? z1 : z0 + 5));   // the porters' counter at the lawn end
  col.rect([x0 + 3, front > 0 ? z1 - 5 : z0, x1 - 3, front > 0 ? z1 : z0 + 5], 0, 0.95);
  col.rect([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y0, h);
}
/** An arch standing in the plane x or z: a half-ellipse of slender rods, width w, rise rise. */
function arch(bag, c, axis, w, rise, y, r = 0.3) {
  const pts = [];
  for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8, u = Math.cos(a) * w / 2, v = Math.sin(a) * rise; pts.push(axis === 'x' ? [c[0] + u, y + v, c[1]] : [c[0], y + v, c[1] + u]); }
  for (let k = 0; k < 8; k++) bag.add(WHITE, rod(pts[k], pts[k + 1], r * (1 - 0.35 * Math.sin(Math.PI * k / 8)), 6));
}
/** arcade_palace: { rect, variant ('arches' | 'curtain') } — Itamaraty: a glass block in a pool, ringed with tall arches; Justice: the glass block between white fins and curtains of falling water. */
export function arcadePalace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, v = el.variant ?? 'arches';
  bag.add('granite_grey', box(x0, -0.4, z0, x1, 0.02, z1));
  // the pool's rim and water
  const px0 = x0 + 7, pz0 = z0 + 7, px1 = x1 - 7, pz1 = z1 - 7;
  bag.add(CONC, box(px0 - 0.5, -0.3, pz0 - 0.5, px1 + 0.5, 0.5, pz0)); bag.add(CONC, box(px0 - 0.5, -0.3, pz1, px1 + 0.5, 0.5, pz1 + 0.5));
  bag.add(CONC, box(px0 - 0.5, -0.3, pz0, px0, 0.5, pz1)); bag.add(CONC, box(px1, -0.3, pz0, px1 + 0.5, 0.5, pz1));
  bag.add('water', box(px0, -0.3, pz0, px1, 0.28, pz1));
  col.rect([px0 - 0.5, pz0 - 0.5, px1 + 0.5, pz1 + 0.5], -0.3, 0.6);
  // the glass block: three storeys on a base, its roof slab
  const gx0 = px0 + 4, gx1 = px1 - 4, gz0 = pz0 + 4, gz1 = pz1 - 4;
  bag.add('facade_glass', box(gx0, 0.5, gz0, gx1, 13.5, gz1)); bag.add(WHITE, box(gx0 - 1.2, 13.5, gz0 - 1.2, gx1 + 1.2, 14.4, gz1 + 1.2));
  for (const y of [4.8, 9.2]) bag.add(WHITE, box(gx0 - 0.1, y, gz0 - 0.1, gx1 + 0.1, y + 0.3, gz1 + 0.1));
  if (v === 'arches') {
    const sx = (x1 - x0 - 6) / 10, sz = (z1 - z0 - 6) / 9;
    for (let i = 0; i <= 10; i++) for (const zz of [z0 + 3, z1 - 3]) arch(bag, [x0 + 3 + i * sx, zz], 'x', sx * 0.9, 13.5, 0);
    for (let i = 1; i < 9; i++) for (const xx of [x0 + 3, x1 - 3]) arch(bag, [xx, z0 + 3 + i * sz], 'z', sz * 0.9, 13.5, 0);
    bag.add(WHITE, box(x0 + 2, 13.4, z0 + 2, x1 - 2, 14.1, z0 + 4)); bag.add(WHITE, box(x0 + 2, 13.4, z1 - 4, x1 - 2, 14.1, z1 - 2));
    bag.add(WHITE, box(x0 + 2, 13.4, z0 + 4, x0 + 4, 14.1, z1 - 4)); bag.add(WHITE, box(x1 - 4, 13.4, z0 + 4, x1 - 2, 14.1, z1 - 4));
    // the stair across the pool at the lawn side and the sculpture in the pool (a bronze figure on a plinth)
    const ss = el.front === 'n' ? -1 : 1, zf = ss < 0 ? pz0 : pz1;
    bag.add('marble', box(cx - 3, -0.3, ss < 0 ? pz0 - 0.5 : zf - 0.1, cx + 3, 0.02, ss < 0 ? pz0 + 0.1 : zf + 0.5));
    bag.add('granite_black', box(px0 + 3, -0.3, pz1 - 4, px0 + 5, 1.2, pz1 - 2)); bag.add('bronze', lathe([[0.5, 0], [0.4, 1.6], [0.25, 2.4], [0.001, 2.9]], 10, null, px0 + 4, 1.2, pz1 - 3));
  } else {
    // white fins stood along the long sides and the cascades on the ends
    for (let x = x0 + 2; x < x1 - 1; x += 3.2) for (const zz of [z0 + 2.4, z1 - 2.8]) bag.add(WHITE, box(x, 0, zz, x + 0.35, 14.0, zz + 0.4));
    for (const zz of [z0 + 1.2, z1 - 1.6]) bag.add(WHITE, box(x0 + 1.5, 13.6, zz, x1 - 1.5, 14.4, zz + 0.5));
    for (const xx of [gx0 - 3.5, gx1 + 3.5]) { bag.add('water', box(xx - 0.1, 0.3, gz0, xx + 0.1, 13.2, gz1)); bag.add('stucco_pale', box(xx - 0.5, 13.2, gz0, xx + 0.5, 13.5, gz1)); }
  }
  col.rect([gx0 - 1.2, gz0 - 1.2, gx1 + 1.2, gz1 + 1.2], 0.5, 14.4);
}
/** The Alvorada column: its bow-like swelling profile, flat across its width (1 : 0.38). */
function alvorada(bag, x, z, h, yaw, y = 0) {
  const prof = [[0.08, 0], [0.22, 0.14], [0.4, 0.34], [0.34, 0.55], [0.27, 0.74], [0.36, 0.92], [0.46, 1.0]].map(([r, k]) => [r, k * h]);
  const c = Math.cos(yaw), s = Math.sin(yaw);
  bag.add(WHITE, lathe(prof, 14, (th) => { const a = Math.cos(th) * c + Math.sin(th) * s, b = -Math.cos(th) * s + Math.sin(th) * c; return 1 / Math.hypot(a / 1.0, b / 0.38) * 1.0; }, x, y, z));
}
/** colonnade_palace: { rect, floors, face ('x' | 'z': the long sides carry the colonnade), name } — Planalto, Supreme Court: a glass box behind two files of Alvorada columns under a white roof slab. */
export function colonnadePalace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, fl = el.floors ?? 3, H = fl * 4.4, ins = 4.2;
  const long = x1 - x0 >= z1 - z0 ? 'x' : 'z';
  bag.add('granite_grey', box(x0 - 3, -0.3, z0 - 3, x1 + 3, 0.5, z1 + 3)); bag.add('marble', box(x0 - 3, 0.5, z0 - 3, x1 + 3, 0.62, z1 + 3));
  const y0 = 0.62;
  bag.add('facade_glass', box(x0 + ins, y0, z0 + ins, x1 - ins, y0 + H, z1 - ins));
  for (let k = 1; k < fl; k++) bag.add(WHITE, box(x0 + ins - 0.1, y0 + k * 4.4 - 0.15, z0 + ins - 0.1, x1 - ins + 0.1, y0 + k * 4.4 + 0.15, z1 - ins + 0.1));
  bag.add(WHITE, box(x0, y0 + H, z0, x1, y0 + H + 1.1, z1)); bag.add(CONC, box(x0 + 0.6, y0 + H + 1.1, z0 + 0.6, x1 - 0.6, y0 + H + 1.3, z1 - 0.6));
  // the entrance: a shallow ramp at the middle of one long side, an open porch
  const n = Math.round((long === 'x' ? x1 - x0 : z1 - z0) / 6.2), sp = (long === 'x' ? x1 - x0 : z1 - z0) / n;
  for (let i = 0; i <= n; i++) {
    for (const side of [0, 1]) {
      const p = long === 'x' ? [x0 + i * sp, side ? z1 - 0.9 : z0 + 0.9] : [side ? x1 - 0.9 : x0 + 0.9, z0 + i * sp];
      alvorada(bag, p[0], p[1], H + 1.1, long === 'x' ? 0 : Math.PI / 2, y0);
      col.circle(p[0], p[1], 0.5, y0, y0 + H);
    }
  }
  col.rect([x0 + ins, z0 + ins, x1 - ins, z1 - ins], y0, y0 + H + 1.3);
}

/** praca: the Three Powers Square's paving with its black bands, the flagpole, the pillory column, the bronze Candangos, Justice. */
export function praca(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add('granite_grey', box(x0, -0.4, z0, x1, 0.04, z1));
  for (let x = x0 + 10; x < x1; x += 20) bag.add('granite_black', box(x, 0.04, z0, x + 0.8, 0.07, z1));
  for (let z = z0 + 10; z < z1; z += 20) bag.add('granite_black', box(x0, 0.04, z, x1, 0.07, z + 0.8));
  // the flagpole: a tapering mast of 100 m on a granite base, the national flag at its head
  const [fx, fz] = el.flag;
  bag.add('granite_grey', box(fx - 2.5, 0.04, fz - 2.5, fx + 2.5, 0.9, fz + 2.5)); col.rect([fx - 2.5, fz - 2.5, fx + 2.5, fz + 2.5], 0, 0.95);
  bag.add('steel_chrome', lathe([[0.55, 0.9], [0.4, 30], [0.3, 70], [0.17, 100], [0.001, 100.4]], 12, null, fx, 0, fz)); col.circle(fx, fz, 0.6, 0.9, 100);
  bag.add('cloth_green', box(fx + 0.4, 84, fz - 0.03, fx + 14.4, 98, fz + 0.03)); bag.add('cloth_ochre', box(fx + 1.4, 87.6, fz - 0.05, fx + 13.4, 94.4, fz + 0.05));
  bag.add('cloth_blue', disc(2.5, 91, 20, fx + 7.4, fz, true));
  // the pillory column of Pombal (a marble shaft with its ball), in the middle of the square
  const [px, pz] = el.pillory;
  bag.add('marble', box(px - 1.4, 0.04, pz - 1.4, px + 1.4, 0.4, pz + 1.4)); bag.add('marble', box(px - 1.0, 0.4, pz - 1.0, px + 1.0, 0.8, pz + 1.0));
  bag.add('marble', lathe([[0.55, 0], [0.45, 0.3], [0.38, 3.2], [0.5, 3.6], [0.45, 3.7], [0.001, 3.7]], 14, null, px, 0.8, pz)); bag.add('marble', lathe([[0.001, 0], [0.4, 0.12], [0.001, 0.5]], 10, null, px, 4.5, pz)); col.circle(px, pz, 1.5, 0, 5);
  // the Candangos: two tall bronze figures of Bruno Giorgi with spears, on a block
  const [wx, wz] = el.warriors;
  bag.add('granite_grey', box(wx - 3, 0.04, wz - 1.5, wx + 3, 1.2, wz + 1.5)); col.rect([wx - 3, wz - 1.5, wx + 3, wz + 1.5], 0, 1.25);
  for (const s of [-1, 1]) {
    bag.add('bronze', lathe([[0.7, 0], [0.55, 1.2], [0.38, 3.0], [0.34, 4.4], [0.2, 5.4], [0.001, 5.6]], 10, (th) => 1 / Math.hypot(Math.cos(th) / 1.0, Math.sin(th) / 0.45), wx + s * 1.5, 1.2, wz));
    bag.add('bronze', lathe([[0.001, 0], [0.25, 0.1], [0.27, 0.4], [0.001, 0.62]], 8, null, wx + s * 1.5, 6.8, wz));
    bag.add('bronze', rod([wx + s * 1.5 + 0.5, 1.6, wz - 0.1], [wx + s * 1.5 + 0.9 * s, 10.5, wz - 0.1], 0.09, 6));
  }
  // Justice: a seated blindfolded woman in granite, the sword across her knees (Ceschiatti)
  const [jx, jz] = el.justice;
  bag.add('granite_grey', box(jx - 2.8, 0.04, jz - 2.0, jx + 2.8, 0.7, jz + 2.0)); bag.add('granite_red', box(jx - 1.0, 0.7, jz - 0.8, jx + 1.0, 1.6, jz + 0.9));
  bag.add('granite_red', lathe([[0.7, 0], [0.62, 0.7], [0.5, 1.5], [0.3, 1.9], [0.001, 2.0]], 12, null, jx, 1.6, jz)); bag.add('granite_red', lathe([[0.001, 0], [0.22, 0.1], [0.24, 0.35], [0.001, 0.48]], 10, null, jx, 3.6, jz));
  bag.add('granite_red', box(jx - 0.9, 1.7, jz - 1.9, jx + 0.9, 2.1, jz - 0.5)); bag.add('steel_chrome', rod([jx - 1.2, 2.2, jz - 1.4], [jx + 1.2, 2.2, jz - 1.4], 0.04, 6));
  col.rect([jx - 2.8, jz - 2.0, jx + 2.8, jz + 2.0], 0, 4);
}

/** superblock: { rect (56 × 11.6, long along x), h, pilotis, seed, tile (0 | 1) } — six floors of flats on open pilotis, balconies on the south, brise-soleil on the north, azulejo end walls. */
export function superblock(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 21.6, p = el.pilotis ?? 3.6, rand = rngOf(el.seed);
  const L = x1 - x0, mid = (z0 + z1) / 2;
  bag.add('facade_grey', box(x0, p, z0 + 0.5, x1, h, z1 - 0.5));
  for (let y = p; y < h; y += 3.0) { bag.add(WHITE, box(x0 - 0.12, y, z0 + 0.4, x1 + 0.12, y + 0.26, z1 - 0.4)); }
  // south balconies (the front toward the sun): a slab and a railing at each floor, in runs between the stairs' bays
  for (let y = p + 3.0; y < h; y += 3.0) for (let x = x0 + 3; x < x1 - 3; x += 9.3) {
    bag.add(CONC, box(x, y - 0.1, z1 - 0.5, x + 7.4, y + 0.1, z1 + 1.15)); bag.add('steel_grey', box(x, y + 0.1, z1 + 1.1, x + 7.4, y + 1.05, z1 + 1.14));
    if (rand() < 0.5) bag.add('cloth_white', box(x + 1.0, y + 0.1, z1 + 0.9, x + 2.4, y + 0.9, z1 + 0.95));
  }
  // north brise-soleil: concrete fins before the glazing
  for (let x = x0 + 1.2; x < x1 - 1; x += 1.4) bag.add(WHITE, box(x, p + 0.2, z0 - 0.5, x + 0.1, h - 0.3, z0 + 0.5));
  // the azulejo end walls (Athos Bulcão's panels): a grid of blue and white tiles, in diagonals or bands
  for (const [xa, dir] of [[x0, -1], [x1, 1]]) {
    const xa0 = dir < 0 ? xa - 0.14 : xa, xa1 = dir < 0 ? xa : xa + 0.14;
    bag.add(WHITE, box(xa0 - (dir < 0 ? 0.0 : 0.0), p, z0 + 0.4, xa1, h, z1 - 0.4));
    const nx = 9, ny = 14, sz = (z1 - z0 - 1.4) / nx, sy = (h - p - 0.6) / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const on = el.tile ? (j % 4 < 2) !== (i % 3 === 0) : ((i + j) % 3 === 0);
      if (!on) continue;
      bag.add('tile_lapis', box(dir < 0 ? xa - 0.22 : xa + 0.14, p + 0.3 + j * sy, z0 + 0.7 + i * sz + 0.05, dir < 0 ? xa - 0.14 : xa + 0.22, p + 0.3 + (j + 1) * sy - 0.05, z0 + 0.7 + (i + 1) * sz - 0.05));
    }
  }
  // roof: parapet, water tank, stair heads
  bag.add(WHITE, box(x0 - 0.3, h, z0 + 0.1, x1 + 0.3, h + 0.5, z1 - 0.1));
  for (const t of [0.25, 0.75]) { bag.add(CONC, box(x0 + L * t - 2.0, h + 0.5, mid - 2.4, x0 + L * t + 2.0, h + 3.3, mid + 2.4)); }
  bag.add(WHITE, lathe([[1.6, 0], [1.6, 2.6], [1.4, 2.8], [0.001, 2.8]], 14, null, x0 + L * 0.5, h + 0.5, mid));
  // pilotis: piers in two files, the stairs' cores and glazed lobbies between them
  for (let x = x0 + 2; x <= x1 - 1.9; x += 6.9) for (const z of [z0 + 1.5, z1 - 1.5]) { bag.add(WHITE, lathe([[0.3, 0], [0.26, p - 0.3], [0.3, p]], 8, null, x, 0, z)); col.circle(x, z, 0.4, 0, p); }
  for (const t of [0.26, 0.74]) {
    const cx0 = x0 + L * t - 3.2, cx1 = x0 + L * t + 3.2;
    bag.add(WHITE, box(cx0, 0, z0 + 2.4, cx1, p, z1 - 2.4)); bag.add('glass_outer', box(cx0 + 0.6, 0.1, z1 - 2.45, cx1 - 0.6, 2.7, z1 - 2.4)); bag.add('glass_outer', box(cx0 + 0.6, 0.1, z0 + 2.4, cx1 - 0.6, 2.7, z0 + 2.45));
    col.rect([cx0, z0 + 2.4, cx1, z1 - 2.4], 0, p);
  }
  bag.add('marble', box(x0 + 0.5, 0.0, z0 + 0.5, x1 - 0.5, 0.05, z1 - 0.5));
  col.rect([x0, z0 + 0.4, x1, z1 - 0.4], p, h);
}
/** shops_row: { rect (long along z), floors } — the commercial strip: an arcade of shop fronts under two floors of offices, awnings. */
export function shopsRow(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rngOf(el.seed ?? 3), W = 4.2;
  bag.add('facade_grey', box(x0 + 3, 3.6, z0, x1, 8.4, z1)); bag.add(WHITE, box(x0 + 2.6, 8.4, z0 - 0.2, x1 + 0.2, 9.0, z1 + 0.2));
  bag.add(WHITE, box(x0 + 2.6, 3.4, z0, x0 + 3, 3.7, z1));
  bag.add('plaster_grey', box(x0 + 3.4, 0, z0, x1, 3.6, z1));
  const aw = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white'];
  for (let z = z0 + 0.4; z + W <= z1 + 0.01; z += W) {
    bag.add('glass_outer', box(x0 + 3.0, 0.2, z + 0.25, x0 + 3.4, 3.0, z + W - 0.55)); bag.add('wood_painted', box(x0 + 2.95, 3.0, z + 0.2, x0 + 3.45, 3.5, z + W - 0.5));
    bag.add(aw[Math.floor(rand() * 5)], box(x0 - 0.2, 2.9, z + 0.1, x0 + 3.0, 3.1, z + W - 0.3));
    bag.add(WHITE, box(x0 + 2.4, 0, z - 0.2, x0 + 2.85, 3.6, z + 0.2));
    col.circle(x0 + 2.6, z, 0.35, 0, 3.6);
    for (let k = 0; k < 2; k++) bag.add('glass_outer', box(x0 + 2.95, 4.4 + k * 2.2, z + 0.6, x0 + 3.0, 5.6 + k * 2.2, z + W - 0.6));
  }
  col.rect([x0 + 3, z0, x1, z1], 0, 9);
  bag.add('marble', box(x0 - 0.3, 0, z0, x0 + 3.0, 0.05, z1)); col.floor([x0 - 0.3, z0, x0 + 3, z1], 0.05);
}
void ring; void revSurf; void quad2; void tri2; void TAU; void fromTriangles; void turnedBox;
