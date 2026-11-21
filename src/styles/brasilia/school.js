// Brasília style — the Escola Classe of the superquadra (docs/settlements/brasilia.md §12): Costa's plan gave each group of quadras
// its primary school, and the first Escola Classe of Brasília opened in the 308 Sul on 12 September 1959. Ours is a single-storey
// wing of five classrooms, the secretary's office and the cantina, a flat slab roof carried out over a covered gallery on slender
// piers, cobogó (perforated concrete) screens on the back wall and a panel of blue-and-white tiles on the gable in the manner of
// Athos Bulcão. Every classroom is furnished: double desks with benches, the teacher's desk, the blackboard, a map.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { tri2 } from './util.js';
import { rngOf, solidBox, stool } from './kit.js';
import { SCHOOL } from '../../settlements/brasilia/layout.js';
import { sign } from './sign.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';

export function school(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = SCHOOL, xw = x0 + 8, T = 0.25, H = 3.2, rand = rngOf(1959);
  const Z = [0, 1, 2, 3, 4, 5].map((k) => z0 + k * 9);                     // five classrooms of 9 m
  const zSec = Z[5] + 7;                                                  // the secretary's office to here, the cantina to z1
  const bounds = [...Z, zSec, z1];
  // the slab: floor of the wing and the gallery, the roof carried out over the gallery
  bag.add('cotto_floor', box(x0, 0, z0, xw, 0.05, z1)); col.floor([x0, z0, xw, z1], 0.05);
  bag.add('granite_grey', box(xw, 0, z0 - 0.3, x1 - 1, 0.05, z1 + 0.3)); col.floor([xw, z0 - 0.3, x1 - 1, z1 + 0.3], 0.05);
  bag.add(CONC, box(x0 - 0.5, H, z0 - 0.5, x1, H + 0.35, z1 + 0.5)); col.rect([x0 - 0.5, z0 - 0.5, x1, z1 + 0.5], H, H + 0.35);
  sign(bag, 'granite_black', 'escola', { x: x1, y: H + 0.05, zc: (z0 + z1) / 2, cell: 0.05, face: 'x+' });      // ESCOLA CLASSE on the roof slab's edge toward the lawn (docs §16)
  bag.add(WHITE, box(x0 - 0.5, H + 0.35, z0 - 0.5, x1, H + 0.6, z0 - 0.4)); bag.add(WHITE, box(x0 - 0.5, H + 0.35, z1 + 0.4, x1, H + 0.6, z1 + 0.5));
  // the walls: the back (west) wall with its cobogó screen outside, the end walls, the partitions, the front wall to the gallery with a door and a window for each room
  const wall = (a, b, c, d, ya = 0.05, yb = H, mat = WHITE) => { bag.add(mat, box(a, ya, b, c, yb, d)); col.rect([a, b, c, d], ya, yb); };
  wall(x0, z0, x0 + T, z1);
  for (let y = 1.1; y < 2.7; y += 0.32) for (let z = z0 + 0.4; z < z1 - 0.5; z += 0.32) bag.add('shutter_grey', box(x0 - 0.03, y, z, x0, y + 0.2, z + 0.2));   // the cobogó's holes in the back wall
  for (let y = 1.0; y < 2.8; y += 0.32) bag.add(CONC, box(x0 - 0.06, y - 0.06, z0, x0 - 0.0, y - 0.02, z1));                                                     // the cobogó's horizontal ribs (a thin line between rows)
  wall(x0, z1 - T, xw, z1); wall(x0, z0, xw, z0 + T);
  for (const zb of bounds.slice(1, -1)) wall(x0, zb - T / 2, xw, zb + T / 2);
  // the doors: 1.6 m, on the front wall at the middle of each room; windows beside them
  const rooms = [];
  for (let k = 0; k < bounds.length - 1; k++) {
    const a = bounds[k] + (k === 0 ? T : T / 2), b = bounds[k + 1] - (k === bounds.length - 2 ? T : T / 2), zc = (a + b) / 2, dw = 0.8;   // the door 1.6 m
    rooms.push({ a, b, zc, kind: k < 5 ? 'class' : k === 5 ? 'office' : 'cantina' });
    wall(xw - T, a, xw, zc - dw); wall(xw - T, zc + dw, xw, b);
    bag.add(WHITE, box(xw - T, 2.2, zc - dw, xw, H, zc + dw)); col.rect([xw - T, zc - dw, xw, zc + dw], 2.2, H);
    bag.add('wood_painted', box(xw - T - 0.02, 0.05, zc - dw - 0.06, xw + 0.02, 2.2, zc - dw)); bag.add('wood_painted', box(xw - T - 0.02, 0.05, zc + dw, xw + 0.02, 2.2, zc + dw + 0.06));
    for (const [wa, wb] of [[a + 0.6, zc - dw - 0.5], [zc + dw + 0.5, b - 0.6]]) if (wb - wa > 0.8) bag.add('glass_outer', box(xw, 1.0, wa, xw + 0.03, 2.4, wb));
    bag.add('lamp_white', box(x0 + 3.5, H - 0.1, zc - 0.3, x0 + 4.5, H, zc + 0.3));
    lights.push({ at: [x0 + 4, 2.7, zc], color: '#fff3d8', intensity: 2.2, distance: 9 });
  }
  // the covered gallery: slender piers on its outer edge, a bench against the wall between the doors, a drinking fountain, the flagpole on the lawn
  for (let z = z0 + 1; z < z1; z += 6) { bag.add(WHITE, lathe([[0.17, 0], [0.13, H], [0.17, H]], 8, null, x1 - 1.2, 0.05, z)); col.circle(x1 - 1.2, z, 0.2, 0.05, H); }
  for (const r of rooms.slice(0, 5)) { const zb = r.zc + 1.6; solidBox(bag, col, 'timber', xw + 0.2, 0.42, zb, xw + 0.75, 0.48, zb + 1.6); for (const e of [0.1, 1.4]) bag.add(CONC, box(xw + 0.25, 0.05, zb + e, xw + 0.7, 0.42, zb + e + 0.1)); }
  { const fz = z0 + 4.5; solidBox(bag, col, 'steel_chrome', xw + 0.2, 0.05, fz, xw + 0.7, 0.95, fz + 0.5); bag.add('steel_grey', box(xw + 0.3, 0.95, fz + 0.1, xw + 0.45, 1.05, fz + 0.4)); }
  bag.add('steel_chrome', lathe([[0.07, 0], [0.04, 5.5], [0.03, 8], [0.001, 8.1]], 6, null, x1 + 0.8, 0, z0 + 22)); col.circle(x1 + 0.8, z0 + 22, 0.1, 0, 8);
  bag.add('cloth_green', box(x1 + 0.8 + 0.03, 5.6, z0 + 22 - 0.02, x1 + 0.8 + 0.05, 7.8, z0 + 22 + 3.0)); bag.add('cloth_ochre', box(x1 + 0.8 + 0.02, 6.1, z0 + 22 + 0.5, x1 + 0.8 + 0.06, 7.3, z0 + 22 + 2.5));

  // ── the tile panel on the south gable (Bulcão's manner: modules of blue and white on the diagonal; the arrangement is ours) ──
  {
    const zp = z1 + 0.02, s = 0.4, nx = Math.floor((xw - x0 - 0.8) / s), ny = 6, xa = x0 + 0.4, ya = 0.4, blue = [], white = [];
    bag.add(WHITE, box(x0, ya - 0.05, z1, xw, ya + ny * s + 0.05, zp - 0.01));
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = xa + i * s, y = ya + j * s, A = [x, y, zp], B = [x + s, y, zp], C = [x + s, y + s, zp], D = [x, y + s, zp], v = (i + j * 2) % 4;
      if (v === 0) blue.push(A, B, C, A, C, D); else if (v === 1) { blue.push(A, B, D); white.push(B, C, D); } else if (v === 2) white.push(A, B, C, A, C, D); else { blue.push(B, C, D); white.push(A, B, D); }
    }
    const mk = (pts) => { const t = []; for (let k = 0; k < pts.length; k += 3) tri2(t, pts[k], pts[k + 2], pts[k + 1]); return fromTriangles(t); };
    bag.add('tile_lapis', mk(blue)); bag.add('tile_white', mk(white));
  }

  // ── the rooms ──
  for (const r of rooms) {
    const { a, b, zc } = r, ix0 = x0 + T, ix1 = xw - T;
    if (r.kind === 'class') {
      // the blackboard on the north partition with its chalk tray, a map and the clock; the teacher's desk; twelve double desks in three columns, benches behind
      bag.add('cloth_black', box(ix0 + 1.0, 0.95, a, ix0 + 6.0, 2.25, a + 0.06)); bag.add('timber', box(ix0 + 1.0, 0.9, a, ix0 + 6.0, 0.95, a + 0.16));
      bag.add('cloth_ochre', box(ix1 - 1.4, 1.2, a, ix1 - 0.2, 2.2, a + 0.05)); bag.add('cloth_green', box(ix1 - 1.3, 1.4, a + 0.05, ix1 + 0.8, 2.0, a + 0.07));
      bag.add('steel_chrome', lathe([[0.001, 0], [0.16, 0], [0.16, 0.03], [0.001, 0.03]], 12, null, ix0 + 3.5, 2.9, a + 0.03));
      solidBox(bag, col, 'timber', ix0 + 1.5, 0.72, a + 0.5, ix0 + 3.1, 0.78, a + 1.2); for (const [e, f] of [[0.05, 0.05], [1.5, 0.05], [0.05, 0.6], [1.5, 0.6]]) bag.add('timber', box(ix0 + 1.5 + e, 0.05, a + 0.5 + f, ix0 + 1.55 + e, 0.72, a + 0.55 + f));
      stool(bag, ix0 + 2.3, a + 1.6, 0.05, 0.46, 'timber'); col.circle(ix0 + 2.3, a + 1.6, 0.2, 0.05, 0.46);
      bag.add('cloth_white', box(ix0 + 2.0, 0.78, a + 0.7, ix0 + 2.4, 0.8, a + 0.95)); bag.add('cloth_red', box(ix0 + 2.6, 0.78, a + 0.7, ix0 + 2.75, 0.84, a + 0.85));
      for (let c = 0; c < 3; c++) for (let rr = 0; rr < 4; rr++) {
        const dx = x0 + 0.6 + c * 1.6, dz = a + 2.4 + rr * 1.5;
        solidBox(bag, col, 'wood_painted', dx, 0.7, dz, dx + 1.1, 0.74, dz + 0.5); bag.add('steel_grey', box(dx + 0.05, 0.05, dz + 0.05, dx + 0.1, 0.7, dz + 0.45)); bag.add('steel_grey', box(dx + 1.0, 0.05, dz + 0.05, dx + 1.05, 0.7, dz + 0.45));
        solidBox(bag, col, 'timber', dx, 0.4, dz + 0.62, dx + 1.1, 0.44, dz + 0.92); bag.add('steel_grey', box(dx + 0.05, 0.05, dz + 0.65, dx + 0.1, 0.4, dz + 0.9)); bag.add('steel_grey', box(dx + 1.0, 0.05, dz + 0.65, dx + 1.05, 0.4, dz + 0.9));
        if (rand() < 0.6) bag.add(['cloth_blue', 'cloth_white', 'cloth_red', 'cloth_green'][Math.floor(rand() * 4)], box(dx + 0.15 + rand() * 0.4, 0.74, dz + 0.1, dx + 0.55 + rand() * 0.4, 0.77, dz + 0.4));    // an exercise book
      }
      // a shelf with the class's books and a bin at the door's side, a coat rail with satchels on the back wall
      bag.add('wood_painted', box(ix1 - 0.5, 0.05, b - 1.6, ix1, 1.5, b - 0.1)); col.rect([ix1 - 0.5, b - 1.6, ix1, b - 0.1], 0.05, 1.5);
      for (let k = 0; k < 5; k++) bag.add(['cloth_blue', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green'][k], box(ix1 - 0.45, 0.4 + (k % 3) * 0.4, b - 1.5 + k * 0.27, ix1 - 0.05, 0.7 + (k % 3) * 0.4, b - 1.3 + k * 0.27));
      for (let k = 0; k < 4; k++) bag.add(['cloth_brown', 'cloth_blue', 'cloth_red', 'cloth_ochre'][k], box(ix0, 1.0, a + 2.0 + k * 1.4, ix0 + 0.25, 1.35, a + 2.35 + k * 1.4));
    } else if (r.kind === 'office') {
      // the secretary's office: a desk with a typewriter and telephone, two filing cabinets, a notice board, a portrait frame and a flag
      solidBox(bag, col, 'timber', ix0 + 0.5, 0.72, zc - 0.5, ix0 + 2.1, 0.78, zc + 0.5); for (const [e, f] of [[0.05, 0.05], [1.5, 0.05], [0.05, 0.9], [1.5, 0.9]]) bag.add('timber', box(ix0 + 0.5 + e, 0.05, zc - 0.5 + f, ix0 + 0.55 + e, 0.72, zc - 0.45 + f));
      bag.add('steel_grey', box(ix0 + 1.0, 0.78, zc - 0.3, ix0 + 1.5, 0.95, zc + 0.1)); bag.add('steel_grey', box(ix0 + 1.7, 0.78, zc + 0.1, ix0 + 1.95, 0.88, zc + 0.35));
      stool(bag, ix0 + 2.8, zc, 0.05, 0.48, 'leather_bench'); col.circle(ix0 + 2.8, zc, 0.2, 0.05, 0.48);
      for (const dz of [0.4, 1.1]) solidBox(bag, col, 'steel_grey', ix1 - 0.8, 0.05, a + dz, ix1 - 0.1, 1.3, a + dz + 0.6);
      bag.add('cloth_green', box(ix0, 1.2, zc - 1.3, ix0 + 0.06, 2.1, zc + 1.0)); for (let k = 0; k < 5; k++) bag.add('cloth_white', box(ix0 + 0.06, 1.4 + (k % 2) * 0.4, zc - 1.1 + k * 0.4, ix0 + 0.08, 1.75 + (k % 2) * 0.4, zc - 0.85 + k * 0.4));
      bag.add('timber', box(ix0, 1.9, b - 1.0, ix0 + 0.06, 2.4, b - 0.5)); bag.add('steel_chrome', lathe([[0.04, 0], [0.025, 1.7], [0.001, 1.75]], 6, null, ix1 - 0.4, 0.05, b - 0.4)); col.circle(ix1 - 0.4, b - 0.4, 0.06, 0.05, 1.8);
      bag.add('cloth_green', box(ix1 - 0.4 - 0.5, 1.2, b - 0.43, ix1 - 0.4, 1.7, b - 0.41));
    } else {
      // the cantina: a counter with the big aluminium pots on the stove, a stack of enamel bowls, and a long table with benches for the children's meal
      solidBox(bag, col, 'timber', ix0 + 0.4, 0.05, zc - 2.4, ix0 + 1.2, 0.95, zc + 0.6); bag.add('steel_chrome', box(ix0 + 0.35, 0.95, zc - 2.45, ix0 + 1.25, 0.99, zc + 0.65));
      for (const dz of [-1.7, -0.7]) bag.add('aluminium_dull', lathe([[0.001, 0], [0.3, 0], [0.32, 0.4], [0.26, 0.42], [0.001, 0.42]], 10, null, ix0 + 0.8, 0.99, zc + dz));
      for (let k = 0; k < 8; k++) bag.add('glaze_white', lathe([[0.001, 0], [0.1, 0], [0.12, 0.06 + (k % 3) * 0.0], [0.001, 0.06]], 8, null, ix0 + 0.8 + (k % 2) * 0.0, 0.99 + 0.06 * Math.floor(k / 2), zc + 0.2));
      solidBox(bag, col, 'timber', ix0 + 2.2, 0.7, zc - 1.8, ix0 + 4.8, 0.76, zc - 1.2); solidBox(bag, col, 'timber', ix0 + 2.2, 0.7, zc + 0.5, ix0 + 4.8, 0.76, zc + 1.1);
      for (const zz of [zc - 1.8, zc + 0.5]) for (const e of [0.1, 2.4]) bag.add('steel_grey', box(ix0 + 2.2 + e, 0.05, zz + 0.05, ix0 + 2.3 + e, 0.7, zz + 0.55));
      for (const zz of [zc - 2.3, zc - 0.8, zc + 0.0, zc + 1.4]) solidBox(bag, col, 'timber', ix0 + 2.4, 0.4, zz, ix0 + 4.6, 0.44, zz + 0.3);
      for (let k = 0; k < 6; k++) bag.add('glaze_white', lathe([[0.001, 0], [0.09, 0], [0.11, 0.05], [0.001, 0.05]], 8, null, ix0 + 2.6 + k * 0.35, 0.76, zc - 1.5));
    }
  }
}
