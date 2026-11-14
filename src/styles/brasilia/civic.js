// Brasília style — two small civic buildings one can enter: the Igrejinha (Nossa Senhora de Fátima, Niemeyer, 1958: a triangular roof on
// three pyramidal piers, tiled walls, an abstract mural behind the altar) in the first superquadra, and the City Museum on the Three
// Powers Square (a white pavilion with the marble Marco of the Pilot Plan, a model of the city, panels of photographs).
import { box, lathe, rod } from '../../core/geom.js';
import { turnedBox, tri2 } from './util.js';
import { fromTriangles } from '../../core/geom.js';
import { rngOf, solidBox, shrub, letters } from './kit.js';
import { CHAPEL, MUSEU } from '../../settlements/brasilia/layout.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';

/** A triangular prism with the points P (xz) from y0 to y1, both faces of each triangle (the roof slab). */
function prism(P, y0, y1) {
  const T = [], a = P.map(([x, z]) => [x, y0, z]), b = P.map(([x, z]) => [x, y1, z]);
  tri2(T, b[0], b[2], b[1]); tri2(T, a[0], a[1], a[2]);
  for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; tri2(T, a[i], a[j], b[j]); tri2(T, a[i], b[j], b[i]); }
  return fromTriangles(T);
}

/** chapel: { } — placed by layout.js's CHAPEL (18 × 16 m): the triangular church. */
export function chapel(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = CHAPEL, xm = (x0 + x1) / 2, rand = rngOf(1958);
  const A = [x0, z1], B = [x1, z1], C = [xm, z0 + 1];                          // the base on the south, the apex north
  const H = 5.2, T = 0.3, yR = 7.4;
  // floor and the apron of paving round it
  bag.add('granite_grey', box(x0 - 3, 0, z0 - 3, x1 + 3, 0.03, z1 + 3)); col.floor([x0 - 3, z0 - 3, x1 + 3, z1 + 3], 0.03);
  bag.add('marble_floor', box(x0, 0.03, z0 + 1, x1, 0.07, z1)); col.floor([x0, z0 + 1, x1, z1], 0.07);
  // the three piers: pyramids of concrete at the corners, carrying the roof
  for (const [px, pz] of [A, B, C]) { const g = lathe([[1.7, 0], [0.55, yR]], 4); g.rotateY(Math.PI / 4); g.translate(px, 0, pz); bag.add(CONC, g);
    // the pier narrows from a 2.4 m square at its foot to 0.8 m at the roof; its collider steps in with it, each step as wide as the pier at its foot
    for (let k = 0; k < 4; k++) { const hw = 1.2 - (1.2 - 0.39) * k / 4, y0p = yR * k / 4; col.rect([px - hw, pz - hw, px + hw, pz + hw], y0p, yR * (k + 1) / 4); } }
  // the roof: a triangular slab overhanging the walls, a cross on its apex
  const cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], sc = 1.12;
  const R = [A, B, C].map(([x, z]) => [cen[0] + (x - cen[0]) * sc, cen[1] + (z - cen[1]) * sc]);
  bag.add(WHITE, prism(R, yR - 0.1, yR + 0.55));
  bag.add('bronze', rod([xm, yR + 0.55, C[1] + 4], [xm, yR + 4.0, C[1] + 4], 0.06, 6)); bag.add('bronze', rod([xm - 0.7, yR + 3.2, C[1] + 4], [xm + 0.7, yR + 3.2, C[1] + 4], 0.05, 6));
  // the walls: tiled, blue and white, between the piers; the east wall with the door; a band of glass under the roof
  const edges = [[A, B, 'base'], [B, C, 'east'], [C, A, 'west']];
  for (const [P, Q, name] of edges) {
    const dx = Q[0] - P[0], dz = Q[1] - P[1], L = Math.hypot(dx, dz), yaw = Math.atan2(dz, dx), ux = dx / L, uz = dz / L;
    const piece = (s0, s1, y0w, y1w, mat, th = T) => { const cx = P[0] + ux * (s0 + s1) / 2, cz = P[1] + uz * (s0 + s1) / 2; bag.add(mat, turnedBox(cx, cz, s1 - s0, th, y0w, y1w, yaw)); };
    const gap = name === 'east' ? [L / 2 - 1.1, L / 2 + 1.1] : null;
    const runs = gap ? [[1.6, gap[0]], [gap[1], L - 1.6]] : [[1.6, L - 1.6]];
    for (const [s0, s1] of runs) {
      piece(s0, s1, 0, 2.6, 'tile_white'); piece(s0, s1, 2.6, H, 'tile_lapis', T + 0.02); piece(s0, s1, H, yR - 0.1, 'glass_outer', 0.06);
      col.segment([P[0] + ux * s0, P[1] + uz * s0], [P[0] + ux * s1, P[1] + uz * s1], T, 0, H);
      // the tile panel: figurative bands in white on the blue (doves and fishes stand as pale lozenges)
      for (let k = 0; k < Math.floor((s1 - s0) / 1.2); k++) { const s = s0 + 0.6 + k * 1.2; if (rand() < 0.7) { const cx = P[0] + ux * s + uz * 0.17, cz = P[1] + uz * s - ux * 0.17 * 0 - ux * 0.0; bag.add('tile_white', turnedBox(cx, cz, 0.5, 0.05, 3.0 + rand() * 1.4, 3.5 + rand() * 1.4, yaw)); } }
    }
    if (gap) { piece(gap[0], gap[1], H - 1.5, H, 'tile_lapis', T + 0.02); col.segment([P[0] + ux * gap[0], P[1] + uz * gap[0]], [P[0] + ux * gap[1], P[1] + uz * gap[1]], T, H - 1.5, H); piece(gap[0], gap[1], H, yR - 0.1, 'glass_outer', 0.06); }
    if (name === 'base') { /* the bell */ }
  }
  // inside: the altar at the apex under the abstract mural (Volpi: bands of colour), the pews in rows, the font by the door
  const az = C[1] + 3.8;
  bag.add(WHITE, turnedBox(xm, C[1] + 1.2, 6.0, 0.15, 0.07, 4.8, 0)); const mc = ['cloth_blue', 'cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_green'];
  for (let k = 0; k < 9; k++) bag.add(mc[k % 5], box(xm - 2.9 + k * 0.65, 0.5 + (k % 3) * 0.4, C[1] + 1.32, xm - 2.9 + (k + 1) * 0.65 - 0.05, 2.0 + (k * 7 % 3) * 0.7, C[1] + 1.36));
  for (let k = 0; k < 3; k++) { bag.add('marble', box(xm - 1.6 + k * 0.3, 0.07, az - 0.3 + k * 0.3, xm + 1.6 - k * 0.3, 0.07 + 0.15 * (k + 1), az + 0.9)); }
  solidBox(bag, col, 'marble', xm - 1.0, 0.5, az, xm + 1.0, 1.1, az + 0.8);
  bag.add('gilt_bronze', box(xm - 0.1, 1.1, az + 0.3, xm + 0.1, 1.5, az + 0.35));
  for (let i = 0; i < 6; i++) {
    const z = az + 3.4 + i * 1.6, w = (z - C[1]) / (B[1] - C[1]) * (x1 - xm) - 1.1;
    for (const s of [-1, 1]) { const a = xm + s * 0.9, b = xm + s * w; if (Math.abs(b - a) < 1.0) continue; const lo = Math.min(a, b), hi = Math.max(a, b); bag.add('timber', box(lo, 0.07, z, hi, 0.5, z + 0.5)); bag.add('timber', box(lo, 0.5, z + 0.42, hi, 1.0, z + 0.5)); col.rect([lo, z, hi, z + 0.5], 0.07, 1.0); }
  }
  bag.add('marble', lathe([[0.3, 0], [0.12, 0.45], [0.35, 0.9], [0.001, 0.9]], 10, null, xm + 6.0, 0.07, z1 - 3)); col.circle(xm + 6.0, z1 - 3, 0.35, 0, 1.0);
  lights.push({ at: [xm, 4.5, (A[1] + C[1]) / 2], color: '#ffe8c8', intensity: 4, distance: 18 });
  // outside: a few shrubs, a bench, a candle stand at the door's step
  for (const [dx, dz] of [[-4, 2.6], [4, 2.6], [-10, -2], [10, -2]]) shrub(bag, xm + dx, z1 + dz, 0, 0.8, 'palm_leaf');
  solidBox(bag, col, 'timber', xm - 3, 0.42, z1 + 3.6, xm + 3, 0.48, z1 + 4.1); bag.add(CONC, box(xm - 2.8, 0, z1 + 3.65, xm - 2.7, 0.42, z1 + 4.05)); bag.add(CONC, box(xm + 2.7, 0, z1 + 3.65, xm + 2.8, 0.42, z1 + 4.05));
  void letters;
}

/** museu: { } — the City Museum, MUSEU (26 × 26 m): a white single-storey pavilion with a glass band, the Marco inside. */
export function museu(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = MUSEU, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2, rand = rngOf(1960), H = 5.0, T = 0.4;
  bag.add('marble', box(x0 - 2, -0.2, z0 - 2, x1 + 2, 0.08, z1 + 2)); col.floor([x0 - 2, z0 - 2, x1 + 2, z1 + 2], 0.08);
  bag.add('marble_floor', box(x0 + T, 0.08, z0 + T, x1 - T, 0.12, z1 - T)); col.floor([x0 + T, z0 + T, x1 - T, z1 - T], 0.12);
  const door = [xm - 1.5, xm + 1.5];
  // walls: the south one (toward the square's middle) with the door; glass bands above the plinth; the flat roof with its wide overhang
  solidBox(bag, col, WHITE, x0, 0.08, z0, x1, 1.0, z0 + T); solidBox(bag, col, WHITE, x0, 0.08, z0, x0 + T, 1.0, z1); solidBox(bag, col, WHITE, x1 - T, 0.08, z0, x1, 1.0, z1);
  solidBox(bag, col, WHITE, x0, 0.08, z1 - T, door[0], 1.0, z1); solidBox(bag, col, WHITE, door[1], 0.08, z1 - T, x1, 1.0, z1);
  for (const [a, b, c, d] of [[x0 + 0.1, z0 + 0.1, x1 - 0.1, z0 + 0.2], [x0 + 0.1, z0 + 0.1, x0 + 0.2, z1 - 0.1], [x1 - 0.2, z0 + 0.1, x1 - 0.1, z1 - 0.1]]) { bag.add('glass_outer', box(a, 1.0, b, c, H - 0.6, d)); col.rect([a, b, c, d], 1.0, H - 0.6); }
  for (const [a, b] of [[x0, door[0]], [door[1], x1]]) { bag.add('glass_outer', box(a + 0.1, 1.0, z1 - 0.2, b - 0.1, H - 0.6, z1 - 0.1)); col.rect([a, z1 - 0.2, b, z1 - 0.1], 1.0, H - 0.6); }
  bag.add(WHITE, box(door[0], 3.2, z1 - T, door[1], H, z1)); col.rect([door[0], z1 - T, door[1], z1], 3.2, H);
  for (const s of [-1, 1]) bag.add('steel_chrome', box(xm + s * 1.5 - 0.04, 0.12, z1 - 0.3, xm + s * 1.5 + 0.04, 3.2, z1 - 0.1));
  bag.add(WHITE, box(x0 - 1.8, H - 0.6, z0 - 1.8, x1 + 1.8, H + 0.35, z1 + 1.8)); col.rect([x0, z0, x1, z1], H - 0.6, H + 0.35);
  // inside: the Marco — a white marble stele with the plan's report cut into it, on a stepped plinth; the model of the Pilot Plan on a table;
  // panels of photographs on stands; benches; a ceiling of lights
  bag.add('marble', box(xm - 1.8, 0.12, zm - 1.8, xm + 1.8, 0.35, zm + 1.8)); bag.add('marble', box(xm - 1.3, 0.35, zm - 1.3, xm + 1.3, 0.55, zm + 1.3)); col.rect([xm - 1.8, zm - 1.8, xm + 1.8, zm + 1.8], 0.12, 0.6);
  bag.add('marble_smooth', box(xm - 0.6, 0.55, zm - 0.3, xm + 0.6, 4.2, zm + 0.3)); col.rect([xm - 0.6, zm - 0.3, xm + 0.6, zm + 0.3], 0.55, 4.2);
  for (let k = 0; k < 14; k++) { const w = 0.5 + rand() * 0.4; bag.add('granite_black', box(xm - w / 2, 1.2 + k * 0.2, zm + 0.3, xm + w / 2, 1.24 + k * 0.2, zm + 0.32)); bag.add('granite_black', box(xm - w / 2, 1.2 + k * 0.2, zm - 0.32, xm + w / 2, 1.24 + k * 0.2, zm - 0.3)); }
  const mx0 = x0 + 3, mz0 = z0 + 3.5, mx1 = mx0 + 7, mz1 = mz0 + 5;
  solidBox(bag, col, 'timber', mx0, 0.12, mz0, mx1, 0.85, mz1);
  bag.add('plaster_white', box(mx0 + 0.15, 0.85, mz0 + 0.15, mx1 - 0.15, 0.9, mz1 - 0.15)); bag.add('sod', box(mx0 + 0.2, 0.9, mz0 + 0.2, mx1 - 0.2, 0.92, mz1 - 0.2));
  // the plan in miniature: the long axis (the Esplanade) and the bowed axis crossing it, small white blocks in rows
  bag.add(WHITE, box(mx0 + 0.4, 0.92, mz0 + 2.3, mx1 - 0.4, 0.96, mz0 + 2.7)); bag.add(WHITE, box(mx0 + 3.0, 0.92, mz0 + 0.4, mx0 + 3.4, 0.96, mz1 - 0.4));
  for (let i = 0; i < 10; i++) for (const dz of [-0.4, 0.6]) bag.add('facade_grey', box(mx0 + 0.6 + i * 0.35, 0.96, mz0 + 2.0 + dz - 0.15, mx0 + 0.6 + i * 0.35 + 0.2, 1.06, mz0 + 2.0 + dz + 0.15));
  for (let i = 0; i < 12; i++) for (const s of [-1, 1]) bag.add('concrete_light', box(mx0 + 3.6 + s * (0.3 + (i % 3) * 0.28) - 0.1, 0.96, mz0 + 0.4 + i * 0.3, mx0 + 3.6 + s * (0.3 + (i % 3) * 0.28) + 0.1, 1.04, mz0 + 0.5 + i * 0.3));
  bag.add('timber', box(mx0 + 0.3, 0.12, mz1 + 0.05, mx0 + 1.5, 1.0, mz1 + 0.08));            // a card with the plan's name
  letters(bag, 'cloth_white', mx0 + 0.9, 0.3, mz1 + 0.08, 4, 'z+', rand, 0.2, 0.2);
  // panels of photographs: stands in two rows down the hall
  for (let k = 0; k < 5; k++) for (const [bx, sg] of [[x1 - 4, 1], [xm + 5, -1]]) {
    const pz = z0 + 3 + k * 4.2;
    if (bx === xm + 5 && pz > zm - 3 && pz < zm + 3) continue;
    bag.add('steel_grey', box(bx - 0.05, 0.12, pz, bx + 0.05, 2.2, pz + 0.05)); bag.add('steel_grey', box(bx - 0.05, 0.12, pz + 1.9, bx + 0.05, 2.2, pz + 1.95)); col.rect([bx - 0.1, pz, bx + 0.1, pz + 1.95], 0.12, 2.2);
    bag.add('cloth_white', box(bx - 0.04, 0.5, pz, bx + 0.04, 2.1, pz + 1.95));
    for (let q = 0; q < 4; q++) bag.add(['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'][Math.floor(rand() * 4)], box(bx + sg * 0.05 - (sg > 0 ? 0 : 0.02), 0.8 + (q >> 1) * 0.65, pz + 0.15 + (q & 1) * 0.9, bx + sg * 0.07 + (sg > 0 ? 0.0 : -0.04), 1.3 + (q >> 1) * 0.65, pz + 0.95 + (q & 1) * 0.9));
  }
  for (const bz of [zm + 4.5, zm - 5.5]) { solidBox(bag, col, 'leather_bench', xm - 2.5, 0.12, bz, xm + 2.5, 0.55, bz + 0.6); }
  for (const [lx, lz] of [[xm, zm + 6], [xm, zm - 6], [x0 + 6, zm], [x1 - 6, zm]]) { bag.add('lamp_white', box(lx - 0.6, H - 0.7, lz - 0.2, lx + 0.6, H - 0.6, lz + 0.2)); }
  lights.push({ at: [xm, 3.8, zm], color: '#fff0d8', intensity: 4, distance: 20 }, { at: [xm, 3.8, zm + 7], color: '#fff0d8', intensity: 3, distance: 14 }, { at: [x0 + 7, 3.8, z0 + 7], color: '#fff0d8', intensity: 3, distance: 14 });
  // outside, before the door: a lawn strip with young trees
  shrub(bag, x0 - 1, z1 + 1.5, 0, 0.7, 'palm_leaf'); shrub(bag, x1 + 1, z1 + 1.5, 0, 0.7, 'palm_leaf');
}
