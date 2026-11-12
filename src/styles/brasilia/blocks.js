// Brasília style — the Esplanade's ministries, the Itamaraty and Justice palaces, the Planalto and the Supreme Court with their
// Alvorada columns, the Three Powers Square's furniture, the superquadra's slabs on pilotis and the commercial strip.
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { turnedBox, ring, revSurf, quad2, tri2, TAU } from './util.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const rngOf = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

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

void ring; void revSurf; void quad2; void tri2; void TAU; void fromTriangles; void turnedBox;
