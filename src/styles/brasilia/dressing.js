// Brasília style — eye-level dressing: the apron at the foot of the Congress ramp (flags, granite seats, planters with palms, bins,
// the bronze plaque, paving joints, red dust), the jets of the two pools, the ministries' verge (name slab, guard's hut, bicycle
// rack, bins), kerbside furniture along the Esplanade, and the candangos' camp (docs/settlements/brasilia.md §10).
import { box, lathe, rod } from '../../core/geom.js';
import { RAMP, POOLS, DECK, PLATFORM, TOWERS, MINISTRIES, CAMP, CAMP_FIRES } from '../../settlements/brasilia/layout.js';
import { wedgeX } from './util.js';
import { rngOf, solidBox, shrub, smallTree, letters } from './kit.js';

const CONC = 'concrete_light', WHITE = 'plaster_white';
const bin = (bag, col, x, z, mat = 'steel_grey') => { bag.add(mat, lathe([[0.2, 0.05], [0.24, 0.8], [0.22, 0.82], [0.001, 0.82]], 8, null, x, 0, z)); bag.add('steel_chrome', lathe([[0.25, 0.8], [0.25, 0.86], [0.001, 0.86]], 8, null, x, 0, z)); col.circle(x, z, 0.26, 0, 0.86); };
const gseat = (bag, col, x, z, along = 'z', len = 2.2) => {          // a granite seat on two blocks, its back a thin board
  const [dx, dz] = along === 'z' ? [0.26, len / 2] : [len / 2, 0.26];
  bag.add('granite_grey', box(x - dx, 0.42, z - dz, x + dx, 0.5, z + dz));
  for (const s of [-0.38, 0.38]) bag.add('granite_grey', along === 'z' ? box(x - dx + 0.04, 0, z + s * len * 0.5 - 0.1, x + dx - 0.04, 0.42, z + s * len * 0.5 + 0.1) : box(x + s * len * 0.5 - 0.1, 0, z - dz + 0.04, x + s * len * 0.5 + 0.1, 0.42, z + dz - 0.04));
  col.rect([x - dx, z - dz, x + dx, z + dz], 0, 0.5);
};
const flag = (bag, col, x, z, h = 9) => {                              // a mast with the national flag (green field, yellow lozenge, blue disc)
  bag.add('steel_chrome', rod([x, 0, z], [x, h, z], 0.06, 6)); bag.add('gilt_bronze', lathe([[0.1, h], [0.001, h + 0.2]], 6, null, x, 0, z)); col.circle(x, z, 0.12, 0, h);
  bag.add('cloth_green', box(x + 0.05, h - 1.9, z - 0.015, x + 2.9, h - 0.15, z + 0.015));
  bag.add('cloth_ochre', box(x + 0.7, h - 1.45, z - 0.02, x + 2.25, h - 0.6, z + 0.02)); bag.add('cloth_blue', box(x + 1.2, h - 1.25, z - 0.025, x + 1.75, h - 0.8, z + 0.025));
};

/** apron: the Congress ramp's foot — paving joints, dust, seats facing the ramp, flags, planters, bins, the bronze plaque, the pools' jets. */
export function apron(el, { bag, col }) {
  const rand = rngOf(3317), x0 = RAMP.x0 - 16, x1 = RAMP.x0, z0 = RAMP.z0 - 8, z1 = RAMP.z1 + 8, y = DECK;
  // the paving's joints (granite slabs of 4 m) and the ramp's seams along its slope
  for (let x = x0 + 4; x < x1 - 0.1; x += 4) bag.add('granite_black', box(x - 0.02, 0.02, z0, x + 0.02, 0.028, z1));
  for (let z = z0 + 4; z < z1 - 0.1; z += 4) bag.add('granite_black', box(x0, 0.02, z - 0.02, x1, 0.028, z + 0.02));
  for (let k = 1; k < 6; k++) { const z = RAMP.z0 + k * (RAMP.z1 - RAMP.z0) / 6; bag.add('marble_dark', wedgeX(RAMP.x0, RAMP.x1, z - 0.025, z + 0.025, 0.012, y + 0.012, 0.0)); }
  // red dust blown from the plateau's earth, lying in the corners and against the kerb of the lawn; a few wet stains
  for (let k = 0; k < 16; k++) {
    const a = rand(), bx = x0 + 0.5 + rand() * (x1 - x0 - 3), bz = rand() < 0.5 ? z0 + rand() * 4 : z1 - 4 + rand() * 4, w = 1.2 + rand() * 3.2, d = 0.5 + rand() * 1.6;
    bag.add(a < 0.75 ? 'laterite' : 'plaster_streak', box(bx, 0.022, bz, bx + w, 0.027, bz + d));
  }
  for (let k = 0; k < 10; k++) { const z = RAMP.z0 + rand() * (RAMP.z1 - RAMP.z0 - 1), x = RAMP.x0 + 3 + rand() * 12; bag.add('laterite', box(x, 0.0, z, x + 2 + rand() * 3, 0.05 + x / 3000, z + 0.4 + rand() * 1.2)); }
  // flags: four masts of the Union along the apron's west rim, two more at the lawn's edge
  for (const z of [-24, -12, 12, 24]) flag(bag, col, x0 + 1.5, z);
  // the granite seats facing the ramp, a litter bin at the end of each row
  for (const z of [-27, -20, -9, 9, 20, 27]) { gseat(bag, col, x1 - 8, z, 'z', 2.4); if (Math.abs(z) > 18) bin(bag, col, x1 - 8, z + Math.sign(z) * 1.9); }
  for (const z of [-15, 15]) gseat(bag, col, x1 - 3.5, z, 'z', 2.4);
  // round planters of concrete with young palms and ground cover (Burle Marx's beds: agave, bromeliads, low masses of one colour)
  for (const [px, pz] of [[x0 + 5, -6], [x0 + 5, 6], [x0 + 9, -18], [x0 + 9, 18], [x1 - 2, -26], [x1 - 2, 26]]) {
    bag.add(CONC, lathe([[1.45, 0], [1.45, 0.62], [1.25, 0.62], [1.25, 0.5], [0.001, 0.5]], 14, null, px, 0, pz)); col.circle(px, pz, 1.45, 0, 0.62);
    smallTree(bag, px, pz, 0.5, 3.4 + rand() * 0.8, 'palm_leaf');
    for (let k = 0; k < 4; k++) { const a = k * 1.6 + rand(), r = 0.7 + rand() * 0.3; shrub(bag, px + Math.cos(a) * r, pz + Math.sin(a) * r, 0.5, 0.22 + rand() * 0.15, rand() < 0.5 ? 'palm_leaf' : 'cloth_green'); }
  }
  // the lawn's beds on either side of the apron: low terraced beds of one plant each, the red earth showing between
  for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) {
    const bx = x0 - 20 - k * 1.2, bz0 = (sz > 0 ? z1 + 2.5 : z0 - 2.5 - 9) + k * 0.4, mat = ['palm_leaf', 'cloth_green', 'palm_leaf', 'cloth_ochre'][k];
    bag.add(CONC, box(bx, 0, bz0, bx + 7 + k, 0.22, bz0 + 0.18)); bag.add(CONC, box(bx, 0, bz0 + 8.8, bx + 7 + k, 0.22, bz0 + 9));
    bag.add('laterite', box(bx, 0, bz0, bx + 7 + k, 0.12, bz0 + 9));
    for (let q = 0; q < 6 + k * 2; q++) shrub(bag, bx + 0.8 + rand() * (5.4 + k), bz0 + 0.8 + rand() * 7.4, 0.12, 0.3 + rand() * 0.22, mat);
  }
  // the bronze plaque on a low block at the lawn's edge: pseudo-lettering of CONGRESSO NACIONAL
  solidBox(bag, col, 'granite_black', x0 + 2.2, 0, z1 - 8.5, x0 + 2.8, 1.1, z1 - 3.5);
  letters(bag, 'gilt_bronze', x0 + 2.2, 0.55, z1 - 6, 11, 'x-', rand, 0.26, 0.4);
  // the pools' jets: a row of slender plumes down the middle of each
  for (const p of POOLS) for (let z = p[1] + 6; z < p[3] - 3; z += 8) { const cx = (p[0] + p[2]) / 2; bag.add('water_jet', lathe([[0.04, 0.3], [0.1, 0.9], [0.14, 2.3], [0.05, 3.1], [0.001, 3.3]], 8, null, cx, 0, z)); bag.add('foam', lathe([[0.001, 0.3], [0.5, 0.31], [0.7, 0.32], [0.001, 0.33]], 10, null, cx, 0, z)); }
}

/** A bicycle: two wheels of rods, a frame — parked against a rack (local: along x). */
function bicycle(bag, x, z, along = 'x') {
  const a = (u, y, v) => along === 'x' ? [x + u, y, z + v] : [x + v, y, z + u];
  for (const u of [-0.45, 0.45]) { const c = a(u, 0.34, 0); bag.add('rubber', lathe([[0.34, -0.02], [0.34, 0.02], [0.3, 0.02], [0.3, -0.02]], 10, null, 0, 0, 0).rotateZ(along === 'x' ? 0 : 0).rotateX(Math.PI / 2).translate(c[0], c[1], c[2])); }
  bag.add('steel_grey', rod(a(-0.45, 0.34, 0), a(0.0, 0.34, 0), 0.015, 4)); bag.add('steel_grey', rod(a(0.0, 0.34, 0), a(0.25, 0.7, 0), 0.015, 4)); bag.add('steel_grey', rod(a(-0.45, 0.34, 0), a(0.25, 0.7, 0), 0.015, 4));
  bag.add('steel_grey', rod(a(0.45, 0.34, 0), a(0.3, 0.74, 0), 0.015, 4)); bag.add('steel_grey', rod(a(0.2, 0.74, -0.2), a(0.2, 0.74, 0.2), 0.012, 4)); bag.add('leather_bench', box(...a(-0.3, 0.72, -0.06), ...a(-0.1, 0.76, 0.06)));
}

/** The ministry's verge between its end wall and the carriageway: a name slab, the guard's hut, a bicycle rack, bins. el: { rect, side }. */
export function ministryVerge(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, front = el.side === 'n' ? 1 : -1, rand = rngOf((el.seed ?? 1) * 17 + 3), zf = front > 0 ? z1 : z0;
  const at = (d) => zf + front * d;                                     // d metres out from the end wall, toward the lawn
  // the name slab: a standing slab of concrete with the ministry's name in cut letters
  solidBox(bag, col, CONC, x0 + 3.5, 0, at(4.2) - 0.18, x0 + 8.5, 1.6, at(4.2) + 0.18);
  letters(bag, 'granite_black', x0 + 6, 0.8, at(4.2) + front * 0.2, 8, front > 0 ? 'z+' : 'z-', rand, 0.34, 0.5);
  // the guard's hut: a small white box with a window and a flat roof, a stool and a bin beside it
  { const gx = x1 - 4.2, gz = at(3.6);
    solidBox(bag, col, WHITE, gx - 1.1, 0, gz - 1.1, gx + 1.1, 2.4, gz + 1.1); bag.add(CONC, box(gx - 1.3, 2.4, gz - 1.3, gx + 1.3, 2.55, gz + 1.3));
    bag.add('glass_outer', box(gx - 0.7, 1.0, gz + front * 1.1 - (front > 0 ? 0.02 : -0.0), gx + 0.7, 2.0, gz + front * 1.1 + (front > 0 ? 0.0 : -0.02) + (front > 0 ? 0.02 : 0)));
    bin(bag, col, gx + 1.7, gz + front * 0.8); }
  // a rack with bicycles
  { const rz = at(2.4), rx = x0 + 11; bag.add('steel_grey', rod([rx, 0.4, rz], [rx + 3.0, 0.4, rz], 0.025, 5)); for (const u of [0.1, 2.9]) bag.add('steel_grey', rod([rx + u, 0, rz], [rx + u, 0.4, rz], 0.025, 5));
    for (let k = 0; k < 3; k++) if (rand() < 0.8) bicycle(bag, rx + 0.6 + k * 0.9, rz + 0.55, 'x'); }
  // a lamp's litter bin and the verge's red dust at the slab's foot
  bag.add('laterite', box(x0 + 3.2, 0, at(4.2) - 0.7, x0 + 8.8, 0.02, at(4.2) + 0.7));
}

/** lawn_kit: { items: [{ k: 'bin' | 'seat' | 'sign' | 'fountain' | 'flag', at: [x, z], r }] } — the Esplanade's kerbside furniture, small and many. */
export function lawnKit(el, { bag, col }) {
  const rand = rngOf(el.seed ?? 71);
  for (const it of el.items) {
    const [x, z] = it.at;
    if (it.k === 'bin') bin(bag, col, x, z);
    else if (it.k === 'seat') gseat(bag, col, x, z, it.r % 2 ? 'x' : 'z', 2.0);
    else if (it.k === 'fountain') {                                        // a drinking fountain: a stone post with a basin and a tap
      bag.add('granite_grey', box(x - 0.18, 0, z - 0.18, x + 0.18, 0.95, z + 0.18)); bag.add('granite_grey', box(x - 0.3, 0.95, z - 0.3, x + 0.3, 1.02, z + 0.3)); bag.add('steel_chrome', rod([x, 1.02, z], [x, 1.16, z], 0.015, 4)); col.circle(x, z, 0.3, 0, 1.02);
    } else if (it.k === 'sign') {                                          // a street-name plate on a pole: blue, white lettering
      bag.add('steel_grey', rod([x, 0, z], [x, 2.6, z], 0.035, 5)); bag.add('paint_blue', box(x - 0.5, 2.25, z - 0.02, x + 0.5, 2.55, z + 0.02)); letters(bag, 'cloth_white', x, 2.32, z + 0.03, 6, 'z+', rand, 0.15, 0.14); col.circle(x, z, 0.06, 0, 2.6);
    }
  }
}

// ── the candangos' camp ──────────────────────────────────────────────────────────────────────
const BOARDS = ['planks_grey', 'wood_ochre', 'wood_painted', 'planks_grey', 'timber'];
/** A plank shack: walls of boards, a monopitch roof of zinc sheet, a door and a window; `open` means a door gap and a furnished inside. face: +1 door toward +z, −1 toward −z. */
function shack(bag, col, lights, rand, x, z, w, d, h, face, open) {
  const wall = BOARDS[Math.floor(rand() * BOARDS.length)], T = 0.12, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  const zd = face > 0 ? z1 : z0, zb = face > 0 ? z0 : z1;                // the door wall and the back wall
  bag.add('laterite', box(x0, 0, z0, x1, 0.04, z1));
  const hb = h + 0.35, hf = h;                                            // the roof slopes down toward the front
  const side = (xa, xb) => { solidBox(bag, col, wall, xa, 0, z0, xb, h + 0.18, z1); };
  side(x0, x0 + T); side(x1 - T, x1);
  solidBox(bag, col, wall, x0 + T, 0, zb - (face > 0 ? 0 : T) + (face > 0 ? 0 : 0), x1 - T, hb, zb + (face > 0 ? T : 0) - (face > 0 ? 0 : 0));
  const door = [x - 0.45, x + 0.45];
  if (open) {
    for (const [a, b] of [[x0 + T, door[0]], [door[1], x1 - T]]) solidBox(bag, col, wall, a, 0, zd - (face > 0 ? T : 0), b, hf, zd + (face > 0 ? 0 : T));
    bag.add(wall, box(door[0], 1.95, zd - (face > 0 ? T : 0), door[1], hf, zd + (face > 0 ? 0 : T)));
    col.rect([door[0], zd - (face > 0 ? T : 0), door[1], zd + (face > 0 ? 0 : T)], 1.95, hf);
    // the roof, a window with a shutter propped open, and the inside: a bed with a blanket, a table, a stove, a shelf, a hammock, an oil lamp
    bag.add('laterite', box(x0 + T, 0.0, z0 + T, x1 - T, 0.045, z1 - T)); col.floor([x0 + T, z0 + T, x1 - T, z1 - T], 0.045);
    const bx = x0 + T + 0.05, bz = zb + (face > 0 ? T : -T) * 0 + (face > 0 ? T + 0.05 : -T - 0.05 - 1.9);
    solidBox(bag, col, 'timber', bx, 0.1, bz, bx + 0.9, 0.46, bz + 1.9);
    bag.add('cloth_ochre', box(bx + 0.02, 0.46, bz + 0.05, bx + 0.88, 0.52, bz + 1.4)); bag.add('cloth_white', box(bx + 0.1, 0.5, bz + (face > 0 ? 1.5 : 0.1), bx + 0.8, 0.58, bz + (face > 0 ? 1.85 : 0.45)));
    const tz = zb + (face > 0 ? 1.0 : -1.0); solidBox(bag, col, 'timber', x1 - T - 0.7, 0.0, tz - 0.4, x1 - T - 0.05, 0.75, tz + 0.4);
    bag.add('pottery_dark', lathe([[0.001, 0.75], [0.09, 0.77], [0.1, 0.85], [0.001, 0.86]], 8, null, x1 - T - 0.4, 0, tz)); bag.add('cloth_red', box(x1 - T - 0.65, 0.75, tz - 0.38, x1 - T - 0.1, 0.77, tz + 0.1));
    const sz = zd + (face > 0 ? -T - 0.4 : T + 0.4); bag.add('iron_galv', box(x1 - T - 0.55, 0, sz - 0.2, x1 - T - 0.05, 0.6, sz + 0.2)); col.rect([x1 - T - 0.55, sz - 0.2, x1 - T - 0.05, sz + 0.2], 0, 0.6);
    bag.add('timber', box(bx, 1.35, zb + (face > 0 ? T : -T - 0.25), bx + 0.9, 1.4, zb + (face > 0 ? T + 0.25 : -T)));
    for (let k = 0; k < 4; k++) bag.add(['pottery_dark', 'cloth_red', 'glaze_blue', 'cloth_ochre'][k], box(bx + 0.08 + k * 0.2, 1.4, zb + (face > 0 ? T + 0.04 : -T - 0.2), bx + 0.2 + k * 0.2, 1.4 + 0.12 + rand() * 0.14, zb + (face > 0 ? T + 0.2 : -T - 0.04)));
    bag.add('steel_grey', rod([x0 + T + 0.2, 2.2, z], [x0 + T + 0.2, 2.5, z], 0.01, 4)); bag.add('lamp_paper', lathe([[0.001, 2.0], [0.08, 2.05], [0.07, 2.25], [0.001, 2.3]], 6, null, x, 0, z + (face > 0 ? 0.2 : -0.2)));
    lights?.push({ at: [x, 2.1, z], color: '#ffd9a0', intensity: 1.6, distance: 7 });
  } else {
    bag.add(wall, box(x0 + T, 0, zd - (face > 0 ? T : 0), x1 - T, hf, zd + (face > 0 ? 0 : T)));
    bag.add('wood_dark', box(door[0], 0, zd + (face > 0 ? 0.0 : -0.03), door[1], 1.95, zd + (face > 0 ? 0.03 : 0.0)));
    col.rect([x0, z0, x1, z1], 0, hf + 0.2);
  }
  // board battens on the front, a window with its shutter, the roof with its corrugations and a stone or two on it, a stove pipe
  for (let k = 0; k < Math.floor(w); k++) bag.add('wood_dark', box(x0 + 0.3 + k, 0.1, zd + (face > 0 ? 0.0 : -0.03), x0 + 0.34 + k, hf - 0.05, zd + (face > 0 ? 0.03 : 0.0)));
  const wx = rand() < 0.5 ? x0 + 0.5 : x1 - 1.5; bag.add('glass_outer', box(wx, 1.1, zd + (face > 0 ? 0.02 : -0.05), wx + 0.9, 1.8, zd + (face > 0 ? 0.05 : -0.02))); bag.add('wood_dark', box(wx - 0.4, 1.1, zd + (face > 0 ? 0.04 : -0.1), wx, 1.8, zd + (face > 0 ? 0.1 : -0.04)));
  const ov = 0.5;
  bag.add('iron_galv', box(x0 - 0.25, hf - 0.02 + 0.0, z0 - (face > 0 ? 0.3 : ov), x1 + 0.25, hb + 0.08, z1 + (face > 0 ? ov : 0.3)));
  for (let k = 0; k < Math.floor(w * 2.2); k++) bag.add('steel_grey', box(x0 - 0.25 + 0.2 + k * 0.45, hb + 0.08, z0 - 0.2, x0 - 0.25 + 0.24 + k * 0.45, hb + 0.12, z1 + 0.4));
  if (rand() < 0.7) { const sx = x0 + 0.8 + rand() * (w - 1.6); bag.add('steel_grey', rod([sx, hb, z], [sx, hb + 0.9, z], 0.06, 6)); }
  for (let k = 0; k < 3; k++) bag.add('rubble', box(x0 + 0.5 + rand() * (w - 1), hb + 0.12, z0 + 0.4 + rand() * (d - 0.8), x0 + 0.9 + rand() * (w - 1), hb + 0.3, z0 + 0.8 + rand() * (d - 0.8)));
  // the front step of a plank and a mat; the red earth splashed up the lowest boards
  bag.add('timber', box(door[0] - 0.1, 0, zd + (face > 0 ? 0.0 : -0.4), door[1] + 0.1, 0.12, zd + (face > 0 ? 0.4 : 0.0)));
  bag.add('laterite', box(x0, 0, z0 - 0.02, x1, 0.55, z0 + 0.0)); bag.add('laterite', box(x0, 0, z1, x1, 0.55, z1 + 0.02));
}

/** A hearth: three stones, a blackened pot, a bundle of wood beside it. */
function hearth(bag, col, x, z, rand) {
  for (let k = 0; k < 3; k++) { const a = k * 2.09 + rand(); bag.add('rubble', box(x + Math.cos(a) * 0.3 - 0.1, 0, z + Math.sin(a) * 0.3 - 0.1, x + Math.cos(a) * 0.3 + 0.1, 0.22, z + Math.sin(a) * 0.3 + 0.1)); }
  bag.add('pottery_dark', lathe([[0.1, 0.22], [0.22, 0.38], [0.22, 0.56], [0.17, 0.58], [0.001, 0.58]], 10, null, x, 0, z)); bag.add('bark_dark', box(x - 0.15, 0, z + 0.32, x + 0.2, 0.06, z + 0.5)); col.circle(x, z, 0.4, 0, 0.5);
  for (let k = 0; k < 5; k++) bag.add('bark_grey', rod([x + 0.55, 0.12 + (k % 2) * 0.1, z - 0.3 + k * 0.1], [x + 1.5, 0.1 + (k % 2) * 0.1, z - 0.2 + k * 0.12], 0.05, 5));
}

/** camp: the candangos' camp inside CAMP: shacks in two rows round an open yard, hearths, water tank, wash lines, stores of materials, a signboard. */
export function camp(el, { bag, col, lights }) {
  const [cx0, cz0, cx1, cz1] = CAMP, rand = rngOf(1959);
  // the yard's ground: beaten red earth, the paths between the shacks darker
  bag.add('laterite', box(cx0, -0.02, cz0, cx1, 0.0, cz1));
  // two rows of shacks, facing the yard between them
  const rows = [{ z: cz0 + 9, face: 1 }, { z: cz1 - 9, face: -1 }];
  rows.forEach((r, ri) => { for (let x = cx0 + 4.5, k = 0; x < cx1 - 3; x += 5.6 + rand() * 1.3, k++) { const w = 3.2 + rand() * 1.0, d = 3.8 + rand() * 1.0, h = 2.3 + rand() * 0.5; shack(bag, col, lights, rand, x + w / 2 * 0, r.z, w, d, h, r.face, k % 3 === 1 || (ri && k % 3 === 0)); x += 0; } });
  // the hearths of the yard where the smoke rises, with a bench of planks and an oil drum of water each
  for (const [fx, fz] of CAMP_FIRES) { hearth(bag, col, fx, fz, rand); }
  for (const [bx, bz, along] of [[-486, 63.5, 'x'], [-479.5, 66.5, 'z']]) solidBox(bag, col, 'timber', along === 'x' ? bx - 0.9 : bx - 0.17, 0.3, along === 'x' ? bz - 0.17 : bz - 0.9, along === 'x' ? bx + 0.9 : bx + 0.17, 0.38, along === 'x' ? bz + 0.17 : bz + 0.9);
  // a water tank on a tower of timbers with its standpipe and a trough, the queue's buckets
  { const tx = cx0 + 14, tz = (cz0 + cz1) / 2 - 2;
    for (const [a, b] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) { bag.add('timber', rod([tx + a, 0, tz + b], [tx + a * 0.8, 3.0, tz + b * 0.8], 0.09, 6)); col.circle(tx + a, tz + b, 0.14, 0, 3); }
    bag.add('iron_galv', lathe([[0.001, 3.0], [1.0, 3.0], [1.0, 4.1], [0.9, 4.2], [0.001, 4.2]], 14, null, tx, 0, tz));
    bag.add('steel_grey', rod([tx, 3.0, tz], [tx, 0.9, tz + 1.3], 0.04, 5)); bag.add('steel_grey', rod([tx, 0.9, tz + 1.3], [tx, 0.1, tz + 1.3], 0.04, 5));
    solidBox(bag, col, 'timber', tx - 0.7, 0, tz + 1.8, tx + 0.7, 0.35, tz + 2.3);
    for (let k = 0; k < 4; k++) { const bx = tx - 0.7 + k * 0.5, bz = tz + 2.9 + rand() * 0.6; bag.add('iron_galv', lathe([[0.12, 0], [0.16, 0.3], [0.001, 0.3]], 8, null, bx, 0, bz)); } }
  // wash lines between posts: shirts and sheets, work trousers
  for (const [lz, lx0, lx1] of [[cz0 + 20.5, cx0 + 4, cx0 + 14], [cz1 - 21, cx0 + 17, cx1 - 5]]) {
    for (const px of [lx0, lx1]) bag.add('timber', rod([px, 0, lz], [px, 2.2, lz], 0.05, 5));
    bag.add('rope_fibre', rod([lx0, 2.15, lz], [lx1, 2.05, lz], 0.01, 4));
    for (let x = lx0 + 0.5; x < lx1 - 0.7; x += 0.7 + rand() * 0.7) { const m = ['cloth_white', 'cloth_blue', 'cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_white', 'cloth_grey'][Math.floor(rand() * 7)], len = 0.8 + rand() * 0.5; bag.add(m, box(x, 2.1 - len, lz - 0.015, x + 0.5 + rand() * 0.3, 2.1, lz + 0.015)); }
  }
  // stores of the works: stacked planks, a heap of sand, bricks, bags of cement under a tarpaulin, a wheelbarrow's tracks
  { const sx = cx1 - 9, sz = (cz0 + cz1) / 2 + 3;
    for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'timber' : 'wood_ochre', box(sx, k * 0.1, sz, sx + 3.4, k * 0.1 + 0.1, sz + 0.28 + (k % 3) * 0.02));
    for (const dz of [0.0, 1.2]) bag.add('timber', box(sx + 0.2, 0, sz + dz - 0.05, sx + 0.35, 0.05, sz + dz + 0.15));
    col.rect([sx, sz, sx + 3.4, sz + 0.34], 0, 0.62);
    bag.add('sandstone_yellow', lathe([[0.001, 0], [1.7, 0.0], [1.2, 0.5], [0.5, 0.85], [0.001, 0.95]], 10, null, sx - 2.5, 0, sz + 4.5));
    for (let k = 0; k < 18; k++) bag.add('brick', box(sx + 0.2 + (k % 6) * 0.26, Math.floor(k / 6) * 0.1, sz + 2.2, sx + 0.2 + (k % 6) * 0.26 + 0.24, Math.floor(k / 6) * 0.1 + 0.095, sz + 2.2 + 0.11));
    solidBox(bag, col, 'sacking', sx + 2.3, 0, sz + 2.0, sx + 3.4, 0.5, sz + 2.9); bag.add('cloth_blue', box(sx + 2.2, 0.5, sz + 1.9, sx + 3.5, 0.56, sz + 3.0)); }
  // the signboard of the works company at the camp's road end, a billboard on two posts: letters in white on a green field
  { const bx = cx1 + 0.5, bz = (cz0 + cz1) / 2;
    for (const dz of [-2.6, 2.6]) { bag.add('timber', rod([bx, 0, bz + dz], [bx, 3.6, bz + dz], 0.09, 6)); col.circle(bx, bz + dz, 0.12, 0, 3.6); }
    bag.add('paint_white', box(bx - 0.06, 1.8, bz - 3.0, bx + 0.06, 3.5, bz + 3.0)); bag.add('cloth_green', box(bx + 0.06, 2.0, bz - 2.8, bx + 0.08, 3.3, bz + 2.8));
    letters(bag, 'cloth_white', bx + 0.08, 2.5, bz, 14, 'x+', rand, 0.5, 0.36); letters(bag, 'cloth_ochre', bx + 0.08, 2.05, bz, 9, 'x+', rand, 0.22, 0.4); }
  // heaps of the plateau's red earth and a few oil drums and crates about the yard
  for (let k = 0; k < 7; k++) { const x = cx0 + 2 + rand() * (cx1 - cx0 - 4), z = cz0 + 18 + rand() * (cz1 - cz0 - 36); bag.add('laterite', lathe([[0.001, 0], [0.8 + rand() * 0.8, 0.0], [0.4, 0.4], [0.001, 0.6 + rand() * 0.3]], 8, null, x, 0, z)); }
  for (let k = 0; k < 5; k++) { const x = cx0 + 3 + rand() * (cx1 - cx0 - 6), z = cz0 + 19 + rand() * (cz1 - cz0 - 38); bag.add(['iron_galv', 'paint_blue', 'car_red'][k % 3], lathe([[0.27, 0.0], [0.29, 0.3], [0.29, 0.75], [0.001, 0.76]], 10, null, x, 0, z)); col.circle(x, z, 0.3, 0, 0.8); }
  // the scrub's edge: a few young trees (cerrado's shrubs) round the camp, planted where the planting function leaves a gap
  for (const [x, z] of [[cx0 + 1.5, cz0 + 2], [cx0 + 1.2, cz1 - 3], [cx1 - 1.5, cz1 - 2], [cx0 + 2, (cz0 + cz1) / 2 + 12]]) smallTree(bag, x, z, 0, 3.4 + rand() * 1.5, 'palm_leaf');
  void MINISTRIES;
}

/** The Congress in ten years of weather: dust-and-rain streaks down the towers' long faces and the platform's fascia, rust-red splash at the foot, dark waterlines on the pools' curbs. */
export function congressWeather(bag) {
  const rand = rngOf(1960), y = DECK, [tx0, tx1] = TOWERS.x;
  for (const [ta, tb] of TOWERS.z) for (const [xf, dir] of [[tx0, -1], [tx1, 1]]) {
    for (let k = 0; k < 16; k++) {
      const z = ta + 0.6 + rand() * (tb - ta - 1.2), len = 5 + rand() * 24, top = TOWERS.h - 3.4 - rand() * 18, w = 0.25 + rand() * 0.5;
      bag.add(rand() < 0.8 ? 'plaster_streak' : 'laterite', box(dir < 0 ? xf - 0.02 - 0.012 : xf + 0.02, Math.max(y + 1, top - len), z, dir < 0 ? xf - 0.02 : xf + 0.032, top, z + w));
    }
  }
  const [x0, z0, , z1] = PLATFORM;
  for (let z = z0 + 3; z < z1 - 3; z += 5 + rand() * 4) { if (z > RAMP.z0 - 5 && z < RAMP.z1 + 1) continue; bag.add('plaster_streak', box(x0 - 0.42, y - 2.2 - rand() * 1.4, z, x0 - 0.4, y - 1.0, z + 0.3 + rand() * 0.5)); }
  for (const [za, zb] of [[RAMP.z0 - 0.5, RAMP.z0], [RAMP.z1, RAMP.z1 + 0.5]]) for (let x = RAMP.x0 + 3; x < RAMP.x1 - 6; x += 6 + rand() * 8) bag.add('plaster_streak', box(x, 0.0, za - (za < 0 ? 0.01 : -0.0), x + 1 + rand() * 2.5, 0.02 + (x - RAMP.x0) / (RAMP.x1 - RAMP.x0) * y * 0.5, zb + (za < 0 ? 0.0 : 0.01)));
  for (const p of POOLS) for (const [a, b, c, d] of [[p[0], p[1] - 0.405, p[2], p[1] - 0.395], [p[0], p[3] + 0.395, p[2], p[3] + 0.405]]) bag.add('plaster_streak', box(a - 0.4, 0.22, b, c + 0.4, 0.32, d));
}
