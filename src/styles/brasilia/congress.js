// The National Congress (docs/settlements/brasilia.md §1a): the marble-roofed platform on its lawn, the ramp up to the deck, the two
// pools, the twin 28-storey towers joined by a bridge, the Senate's dome and the Chamber's bowl — each hollow, a plenary of
// tiered seats round the presiding table, entered by a door on the deck.
import { box, lathe, rod, fromTriangles, frustum } from '../../core/geom.js';
import { revSurf, ring, wedgeX, turnedBox, ringSegments, dAng, tri2, TAU, quad2 } from './util.js';
import { DECK, PLATFORM, RAMP, POOLS, DOME, BOWL, TOWERS } from '../../settlements/brasilia/layout.js';

const WHITE = 'plaster_white', CONC = 'concrete_light';
const rOfEllipse = (R, h, y) => R * Math.sqrt(Math.max(0, 1 - (y / h) ** 2));

/** A hemicycle of tiered seats on the west side of a presiding table at D, facing it; only inside the room's circle. */
function hemicycle(bag, col, o) {
  const { room, R, D, rows, r0, dr, half, aisles, y, seat, seed = 1 } = o;
  void seed;
  for (let k = 0; k < rows; k++) {
    const rk = r0 + k * dr, ty = y + 0.26 * k, step = 1.5 / rk;
    for (let ph = -half; ph <= half; ph += step) {
      if (aisles.some((a) => Math.abs(ph - a) < 1.5 / rk)) continue;
      const a = Math.PI + ph, px = D[0] + Math.cos(a) * rk, pz = D[1] + Math.sin(a) * rk;
      if (Math.hypot(px - room[0], pz - room[1]) > R - 1.0) continue;
      const yaw = a + Math.PI / 2;
      bag.add(CONC, turnedBox(px, pz, 1.52, 1.5, y, ty + 0.02, yaw));                                  // the tier
      const qx = px + Math.cos(a) * 0.45, qz = pz + Math.sin(a) * 0.45;
      bag.add(seat, turnedBox(qx, qz, 0.95, 0.5, ty + 0.02, ty + 0.5, yaw));                           // the chair's seat
      bag.add(seat, turnedBox(px + Math.cos(a) * 0.62, pz + Math.sin(a) * 0.62, 0.95, 0.1, ty + 0.5, ty + 1.05, yaw));   // its back
      bag.add('timber', turnedBox(px - Math.cos(a) * 0.3, pz - Math.sin(a) * 0.3, 1.4, 0.55, ty + 0.78, ty + 0.84, yaw));   // the desk before it
      col.segment([px - Math.sin(a) * 0.72, pz + Math.cos(a) * 0.72], [px + Math.sin(a) * 0.72, pz - Math.cos(a) * 0.72], 1.5, y, ty + 1.1);
    }
  }
}
/** The presiding table on its dais at D, the speaker's rostrum, flags and the wall behind. */
function dais(bag, col, D, y, wallX, flagMat) {
  bag.add('marble_dark', box(D[0] - 1.5, y + 0.012, D[1] - 5.5, D[0] + 3.2, y + 0.45, D[1] + 5.5));
  col.rect([D[0] - 1.5, D[1] - 5.5, D[0] + 3.2, D[1] + 5.5], y, y + 0.5);
  bag.add('timber', box(D[0] + 0.6, y + 0.45, D[1] - 3.8, D[0] + 1.7, y + 1.2, D[1] + 3.8));
  for (const dz of [-2.2, 0, 2.2]) { bag.add('leather_bench', box(D[0] + 1.9, y + 0.45, D[1] + dz - 0.4, D[0] + 2.5, y + 1.0, D[1] + dz + 0.4)); bag.add('leather_bench', box(D[0] + 2.5, y + 0.45, D[1] + dz - 0.4, D[0] + 2.65, y + 1.7, D[1] + dz + 0.4)); }
  bag.add('timber', box(D[0] - 3.2, y, D[1] - 0.6, D[0] - 2.2, y + 1.25, D[1] + 0.6)); col.rect([D[0] - 3.2, D[1] - 0.6, D[0] - 2.2, D[1] + 0.6], y, y + 1.3);
  // the wall behind: white panels with a band of blue and white tiles, and the flag
  bag.add(WHITE, box(wallX - 0.3, y, D[1] - 8, wallX, y + 6.5, D[1] + 8));
  for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) bag.add((i + j) % 2 ? 'tile_lapis' : 'tile_white', box(wallX - 0.34, y + 0.4 + j * 0.5, D[1] - 5 + i * 1.0, wallX - 0.3, y + 0.85 + j * 0.5, D[1] - 4.1 + i * 1.0));
  bag.add(flagMat, box(wallX - 0.36, y + 2.6, D[1] - 1.6, wallX - 0.3, y + 5.0, D[1] + 1.6));
  bag.add('cloth_ochre', box(wallX - 0.4, y + 3.2, D[1] - 1.0, wallX - 0.36, y + 4.4, D[1] + 1.0));
  bag.add('cloth_blue', box(wallX - 0.42, y + 3.5, D[1] - 0.45, wallX - 0.4, y + 4.1, D[1] + 0.45));
}
function door(bag, c, R0, R1, ang, w, h, y) {
  // jambs and soffit of a doorway cut in a wall between radii R0 and R1 at angle ang (the wall's thickness R1 − R0)
  const rm = (R0 + R1) / 2, t = R1 - R0, dx = Math.cos(ang), dz = Math.sin(ang);
  for (const s of [-1, 1]) bag.add(CONC, turnedBox(c[0] + dx * rm - dz * s * w / 2, c[1] + dz * rm + dx * s * w / 2, t + 0.1, 0.34, y, y + h, ang));
  bag.add(CONC, turnedBox(c[0] + dx * rm, c[1] + dz * rm, t + 0.1, w + 0.34, y + h - 0.2, y + h, ang));
  bag.add('timber', box(c[0] + dx * (rm - t / 2 - 0.1) - 0.3, y, c[1] - w / 2 - 0.1, c[0] + dx * (rm - t / 2 - 0.1) + 0.3, y + 0.04, c[1] + w / 2 + 0.1));
}

/** The Salão Negro: black granite floor and walls, two files of round piers, panels, a reception, the bust of Kubitschek's era, benches, flags. */
function salaoNegro(bag, col, lights, H, hy) {
  const [hx0, hz0, hx1, hz1] = H, T = 0.4, rnd = (() => { let s = 1960; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  bag.add('granite_black', box(hx0, 0.0, hz0, hx1, 0.06, hz1)); col.floor(H, 0.06);
  for (let k = 0; k < 8; k++) bag.add('granite_grey', box(hx0 + 2 + k * 4.4, 0.03, hz0 + 0.3, hx0 + 2.15 + k * 4.4, 0.09, hz1 - 0.3));       // joints in the floor
  // the walls: black granite on the north, south and east inner faces, the west a glazed front with a door
  const wl = (a, b, c, d) => { bag.add('granite_black', box(a, 0.06, b, c, hy, d)); };
  wl(hx0, hz0, hx1, hz0 + 0.3); wl(hx0, hz1 - 0.3, hx1, hz1); wl(hx1 - 0.3, hz0, hx1, hz1);
  const door = [-94, -90];
  for (const [a, b] of [[hz0, door[0]], [door[1], hz1]]) { bag.add('glass_outer', box(hx0 - 0.12, 0.2, a, hx0, hy - 0.5, b)); col.rect([hx0 - 0.12, a, hx0, b], 0, hy); bag.add('granite_black', box(hx0 - 0.12, 0, a, hx0, 0.2, b)); }
  bag.add(CONC, box(hx0 - 0.12, hy - 0.5, hz0, hx0, hy, hz1));
  for (const zz of [door[0] - 0.08, door[1]]) bag.add('steel_chrome', box(hx0 - 0.15, 0, zz, hx0 + 0.05, 3.2, zz + 0.08));
  // two files of round piers (the roof deck's supports), the upper floors' lamps between
  for (let x = hx0 + 6; x < hx1 - 3; x += 6) for (const z of [hz0 + 9, hz1 - 9]) { bag.add(WHITE, lathe([[0.5, 0], [0.4, hy - 0.4], [0.5, hy]], 12, null, x, 0.06, z)); col.circle(x, z, 0.55, 0, hy); }
  // the Brazilian flag on its stand and the pedestals with bronze busts along the north wall
  bag.add('steel_chrome', lathe([[0.06, 0], [0.04, 3.6], [0.001, 3.7]], 6, null, hx0 + 4, 0.06, hz0 + 3)); bag.add('cloth_green', box(hx0 + 4.04, 1.9, hz0 + 2.98, hx0 + 6.0, 3.4, hz0 + 3.02)); bag.add('cloth_ochre', box(hx0 + 4.5, 2.25, hz0 + 2.97, hx0 + 5.6, 3.05, hz0 + 3.03)); col.circle(hx0 + 4, hz0 + 3, 0.1, 0, 3.7);
  for (let k = 0; k < 4; k++) { const bx = hx0 + 10 + k * 7, bz = hz0 + 1.2; bag.add('granite_grey', box(bx - 0.4, 0.06, bz - 0.4, bx + 0.4, 1.2, bz + 0.4)); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.05], [0.22, 0.3], [0.16, 0.48], [0.001, 0.52]], 10, null, bx, 1.2, bz)); col.rect([bx - 0.4, bz - 0.4, bx + 0.4, bz + 0.4], 0, 1.8); }
  // painted panels on the east wall (abstract bands, Brazilian modernist: colour fields) and a long inscription wall
  const mc = ['cloth_blue', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_white', 'cloth_maroon'];
  for (let k = 0; k < 3; k++) { const pz = hz0 + 3 + k * 7.5; bag.add('timber', box(hx1 - 0.36, 0.9, pz, hx1 - 0.3, 3.9, pz + 5.2)); for (let b = 0; b < 6; b++) bag.add(mc[Math.floor(rnd() * 6)], box(hx1 - 0.4, 1.0 + b * 0.48, pz + 0.1, hx1 - 0.36, 1.4 + b * 0.48, pz + 5.1)); }
  // the reception desk and the benches in groups, exhibition stands with their glass
  solidB(bag, col, 'timber', hx0 + 5, 0.06, hz1 - 6, hx0 + 11, 1.1, hz1 - 5); bag.add('marble', box(hx0 + 4.9, 1.1, hz1 - 6.1, hx0 + 11.1, 1.16, hz1 - 4.9));
  for (let k = 0; k < 4; k++) for (const s of [0, 1]) { const bx = hx0 + 14 + k * 5, bz = (s ? hz0 + 6 : hz1 - 7); solidB(bag, col, 'leather_bench', bx, 0.06, bz, bx + 2.2, 0.5, bz + 0.6); bag.add('leather_bench', box(bx, 0.5, bz + (s ? 0.5 : 0.0), bx + 2.2, 0.95, bz + (s ? 0.6 : 0.1))); }
  for (let k = 0; k < 3; k++) { const ex = hx0 + 16 + k * 6, ez = (hz0 + hz1) / 2; solidB(bag, col, 'timber', ex, 0.06, ez - 0.7, ex + 2.0, 0.95, ez + 0.7); bag.add('glass_outer', box(ex + 0.05, 0.95, ez - 0.65, ex + 1.95, 1.35, ez + 0.65)); bag.add(['bronze', 'gilt_bronze', 'marble'][k], lathe([[0.001, 0], [0.18, 0.04], [0.15, 0.3], [0.001, 0.36]], 8, null, ex + 1.0, 0.95, ez)); }
  for (let x = hx0 + 3; x < hx1 - 3; x += 9) for (const z of [hz0 + 5, hz1 - 5]) { bag.add('lamp_white', box(x - 0.8, hy - 0.12, z - 0.25, x + 0.8, hy - 0.02, z + 0.25)); }
  lights.push({ at: [hx0 + 8, 3.8, (hz0 + hz1) / 2], color: '#ffe8c8', intensity: 4, distance: 18 }, { at: [hx0 + 24, 3.8, (hz0 + hz1) / 2], color: '#ffe8c8', intensity: 4, distance: 18 }, { at: [hx0 + 16, 3.8, hz0 + 8], color: '#ffe8c8', intensity: 3, distance: 14 }, { at: [hx0 + 16, 3.8, hz1 - 8], color: '#ffe8c8', intensity: 3, distance: 14 });
}
function solidB(bag, col, mat, x0, y0, z0, x1, y1, z1) { bag.add(mat, box(x0, y0, z0, x1, y1, z1)); col.rect([x0, z0, x1, z1], y0, y1); }
export function congress(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = PLATFORM, y = DECK;
  // ── the platform: a mass of white concrete, the marble roof deck, a parapet, the glazed band of the Salão Negro along its front ──
  // the mass is cut for the Salão Negro, the black hall under the deck north of the pool (36 × 26 m, 4.8 m high), entered by a glazed door in the west face
  const HALL = [x0, -106, x0 + 36, -80], hy = 4.8;
  const mass = (a, b, c, d) => { bag.add(CONC, box(a, -1, b, c, y - 0.35, d)); col.rect([a, b, c, d], -1, y); };
  mass(x0, z0, x1, HALL[1]); mass(x0, HALL[3], x1, z1); mass(HALL[2], HALL[1], x1, HALL[3]);
  bag.add(CONC, box(HALL[0], hy, HALL[1], HALL[2], y - 0.35, HALL[3])); col.rect([HALL[0], HALL[1], HALL[2], HALL[3]], hy, y);
  bag.add('marble', box(x0, y - 0.35, z0, x1, y, z1));
  col.floor(PLATFORM, y);
  salaoNegro(bag, col, lights, HALL, hy);
  for (let z = z0 + 2; z < z1 - 2; z += 4.4) {
    if (z > RAMP.z0 - 4.4 && z < RAMP.z1 + 0.2) continue;
    if (z + 4.4 > HALL[1] && z < HALL[3]) continue;
    bag.add('glass_outer', box(x0 - 0.12, 0.8, z, x0, y - 1.6, z + 3.8));
    bag.add(CONC, box(x0 - 0.2, 0.4, z + 3.8, x0 + 0.05, y - 1.0, z + 4.4));
  }
  bag.add(CONC, box(x0 - 0.4, y - 1.0, z0 - 0.4, x0, y - 0.35, z1 + 0.4));                                  // the fascia
  // parapet round the deck, open at the ramp's head
  const P = 0.28, ph = 1.05, pw = [x0 + P / 2, z0 + P / 2, x1 - P / 2, z1 - P / 2];
  const par = (a, b, gap) => { const pts = gap ? [[a, b[0]], [gap[0], b[0]]] : [a, b]; void pts; };
  void par;
  const seg = (a, b) => { bag.add(CONC, box(Math.min(a[0], b[0]) - P / 2, y, Math.min(a[1], b[1]) - P / 2, Math.max(a[0], b[0]) + P / 2, y + ph, Math.max(a[1], b[1]) + P / 2)); col.segment(a, b, P, y, y + ph); };
  seg([pw[0], pw[1]], [pw[2], pw[1]]); seg([pw[0], pw[3]], [pw[2], pw[3]]); seg([pw[2], pw[1]], [pw[2], pw[3]]);
  seg([pw[0], pw[1]], [pw[0], RAMP.z0 - 0.6]); seg([pw[0], RAMP.z1 + 0.6], [pw[0], pw[3]]);
  // ── the ramp from the lawn to the deck, with its cheeks, and the paved apron at its foot ──
  bag.add('marble', wedgeX(RAMP.x0, RAMP.x1, RAMP.z0, RAMP.z1, 0, y));
  col.ramp([RAMP.x0, RAMP.z0, RAMP.x1, RAMP.z1], 0, y, 'e');
  for (const [za, zb] of [[RAMP.z0 - 0.5, RAMP.z0], [RAMP.z1, RAMP.z1 + 0.5]]) bag.add(CONC, wedgeX(RAMP.x0, RAMP.x1, za, zb, 0.7, y + 0.7));
  bag.add('granite_grey', box(RAMP.x0 - 16, -0.4, RAMP.z0 - 8, RAMP.x0, 0.02, RAMP.z1 + 8)); col.floor([RAMP.x0 - 16, RAMP.z0 - 8, RAMP.x0, RAMP.z1 + 8], 0.02);
  for (let k = 0; k < 8; k++) bag.add('granite_black', box(RAMP.x0 + 10 + k * 10, 0.0, RAMP.z0, RAMP.x0 + 10.25 + k * 10, 0.0 + 0.05 + (10 + k * 10) / (RAMP.x1 - RAMP.x0) * y, RAMP.z1));
  // ── the pools along the front: low curbs, still water ──
  for (const r of POOLS) {
    const [a, b, c, d] = r;
    bag.add(CONC, box(a - 0.4, -0.3, b - 0.4, c + 0.4, 0.45, b)); bag.add(CONC, box(a - 0.4, -0.3, d, c + 0.4, 0.45, d + 0.4));
    bag.add(CONC, box(a - 0.4, -0.3, b, a, 0.45, d)); bag.add(CONC, box(c, -0.3, b, c + 0.4, 0.45, d));
    bag.add('water', box(a, -0.3, b, c, 0.3, d));
    col.rect([a - 0.4, b - 0.4, c + 0.4, d + 0.4], -0.3, 0.6);
  }
  // ── the towers ──
  const [tx0, tx1] = TOWERS.x, top = TOWERS.h;
  for (const [ta, tb] of TOWERS.z) {
    bag.add('facade_glass', box(tx0, y, ta, tx1, top - 3.2, tb));
    bag.add(WHITE, box(tx0 - 0.15, y, ta - 0.15, tx0, top - 3.0, ta + 1.6)); bag.add(WHITE, box(tx0 - 0.15, y, tb - 1.6, tx0, top - 3.0, tb + 0.15));
    bag.add(WHITE, box(tx1, y, ta - 0.15, tx1 + 0.15, top - 3.0, ta + 1.6)); bag.add(WHITE, box(tx1, y, tb - 1.6, tx1 + 0.15, top - 3.0, tb + 0.15));
    bag.add(WHITE, box(tx0 - 0.3, y, ta - 0.4, tx1 + 0.3, top - 3.2, ta)); bag.add(WHITE, box(tx0 - 0.3, y, tb, tx1 + 0.3, top - 3.2, tb + 0.4));   // the end walls, blank
    for (let h = y + 3.5; h < top - 3.4; h += 3.5) bag.add(WHITE, box(tx0 - 0.25, h - 0.18, ta - 0.4, tx1 + 0.25, h + 0.12, tb + 0.4));   // the floor slabs' edges
    bag.add(WHITE, box(tx0 - 0.5, top - 3.2, ta - 0.6, tx1 + 0.5, top, tb + 0.6));                           // the crown
    bag.add(CONC, box(tx0 + 3, top, ta + 4, tx1 - 3, top + 3.2, tb - 4));                                     // the machine room
    col.rect([tx0 - 0.5, ta - 0.6, tx1 + 0.5, tb + 0.6], y, top);
    bag.add('steel_chrome', rod([(tx0 + tx1) / 2, top + 3.2, (ta + tb) / 2], [(tx0 + tx1) / 2, top + 14, (ta + tb) / 2], 0.12, 6));
  }
  // the bridge joining the two towers high up
  const zb0 = TOWERS.z[0][1], zb1 = TOWERS.z[1][0];
  bag.add(WHITE, box(tx0 + 1, TOWERS.bridge[0], zb0, tx1 - 1, TOWERS.bridge[1], zb1));
  bag.add('glass_outer', box(tx0 + 0.9, TOWERS.bridge[0] + 0.6, zb0 + 0.1, tx1 - 0.9, TOWERS.bridge[1] - 0.6, zb1 - 0.1));
  col.rect([tx0 + 1, zb0, tx1 - 1, zb1], TOWERS.bridge[0], TOWERS.bridge[1]);

  // ── the deck's furniture: benches along the parapet, planters, the lamp posts, a guard's booth at the chambers' doors ──
  for (const zz of [z0 + 6, z1 - 6]) for (let xx = x0 + 8; xx < x1 - 6; xx += 14) { if (Math.abs(xx - DOME.c[0]) < 26 && Math.abs(zz - DOME.c[1]) < 30) continue; if (Math.abs(xx - BOWL.c[0]) < 36 && Math.abs(zz - BOWL.c[1]) < 36) continue; bag.add('timber', box(xx, y + 0.42, zz, xx + 1.9, y + 0.48, zz + 0.5)); bag.add(CONC, box(xx + 0.1, y, zz + 0.05, xx + 0.2, y + 0.42, zz + 0.45)); bag.add(CONC, box(xx + 1.7, y, zz + 0.05, xx + 1.8, y + 0.42, zz + 0.45)); col.rect([xx, zz, xx + 1.9, zz + 0.5], y, y + 0.5); }
  for (const [px, pz] of [[x0 + 4, -30], [x0 + 4, 30], [x0 + 4, -2], [x0 + 4, 2]]) { bag.add(CONC, box(px - 0.6, y, pz - 0.6, px + 0.6, y + 0.55, pz + 0.6)); bag.add('palm_leaf', lathe([[0.001, 0], [0.5, 0.12], [0.7, 0.5], [0.4, 0.9], [0.001, 1.0]], 8, null, px, y + 0.55, pz)); col.rect([px - 0.6, pz - 0.6, px + 0.6, pz + 0.6], y, y + 0.6); }
  for (const [gx, gz] of [[DOME.c[0] - DOME.R - 3, DOME.c[1] - 9], [BOWL.c[0] - BOWL.R - 3, BOWL.c[1] + 12]]) { bag.add('plaster_white', box(gx - 0.8, y, gz - 0.8, gx + 0.8, y + 2.4, gz + 0.8)); bag.add('glass_outer', box(gx - 0.6, y + 1.0, gz - 0.82, gx + 0.6, y + 2.0, gz - 0.8)); bag.add(CONC, box(gx - 1.0, y + 2.4, gz - 1.0, gx + 1.0, y + 2.55, gz + 1.0)); col.rect([gx - 0.8, gz - 0.8, gx + 0.8, gz + 0.8], y, y + 2.55); }
  // ── the Senate: the dome, hollow, its door on the west ──
  {
    const { c, R, h, r: rIn, door: ang, doorW } = DOME, hIn = h * 0.86, dh = 3.6, half = doorW / 2 / rIn;
    const lv = [0, 1.2, 2.4, dh, 5, 6.5, 8, 9.5, 10.8, 11.8, 12.6, 13.2, 13.6, 13.85, h - 0.001];
    const prof = (RR, HH) => lv.map((v) => { const yy = Math.min(v, HH - 0.001); return [Math.max(0.05, rOfEllipse(RR, HH, yy)), yy]; });
    const RE = rIn + 1.5, ys = hIn * Math.sqrt(1 - (rIn / RE) ** 2);                // the inner shell springs from a vertical wall at the room's rim, its slope never steeper than 55°
    const outer = prof(R, h), inner = [[rIn, 0], [rIn, dh], [rIn, ys], ...prof(RE, hIn).filter(([, yy]) => yy > ys + 0.3)];
    const cut = (th, y0, y1) => Math.abs(dAng(th, ang)) < half && Math.max(y0, y1) <= dh + 1e-6;
    bag.add(WHITE, revSurf(outer, 72, { cx: c[0], cz: c[1], y, skip: cut }));
    bag.add(WHITE, revSurf(inner.slice().reverse(), 72, { cx: c[0], cz: c[1], y, flip: false, skip: (th, y0, y1) => cut(th, Math.min(y0, y1), Math.max(y0, y1)) }));
    // the shell's closing at the base is the deck; the ring beam's lip, a white band round the foot
    bag.add(CONC, ring(R, R + 0.9, y + 0.04, 72, c[0], c[1], true));
    bag.add('daylight', ring(0.01, 3.4, y + hIn - 0.35, 24, c[0], c[1], false));                               // the skylight of the lantern
    door(bag, c, rIn, R, ang, doorW, dh, y);
    // the room: carpet, the hemicycle of 81 seats' desks, the dais at the east
    bag.add('cloth_blue', box(c[0] - rIn + 0.3, y, c[1] - 1.7, c[0] + 0.3, y + 0.04, c[1] + 1.7));            // the carpet from the door
    const D = [c[0] + 12, c[1]];
    dais(bag, col, D, y, c[0] + rIn - 2.6, 'cloth_green');
    hemicycle(bag, col, { room: c, R: rIn, D, rows: 6, r0: 5.8, dr: 1.9, half: 1.25, aisles: [-0.62, 0, 0.62], y, seat: 'leather_bench' });
    ringSegments(col, c[0], c[1], (rIn + R) / 2 + 0.2, R - rIn + 0.4, y, y + h, 56, (m) => Math.abs(dAng(m, ang)) < half * 1.25);
    lights.push({ at: [c[0], y + 9, c[1]], color: '#fff0d8', intensity: 7, distance: 26 });
  }
  // ── the Chamber: the bowl on its drum, hollow, its door on the west ──
  {
    const { c, R, rim, rin, wall, ceil, door: ang, doorW } = BOWL, dh = 2.6, half = doorW / 2 / wall;
    const flare = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; flare.push([rin + (R - rin) * t ** 1.6, 3.0 + (rim - 3.0) * t]); }
    const pr = [[rin, 0], [rin, dh], [rin, 3.0], ...flare.slice(1), [R, rim + 0.35]];
    for (let i = 1; i <= 12; i++) { const s = i / 12, r = (R - 0.6) * (1 - s); pr.push([Math.max(0.01, r), 8.4 + 3.0 * (r / (R - 0.6)) ** 2 + (r > R - 1 ? 0.35 : 0)]); }
    pr[pr.length - 1] = [0.01, 8.4];
    const cut = (th, y0, y1) => Math.abs(dAng(th, ang)) < half && Math.max(y0, y1) <= dh + 1e-6;
    bag.add(WHITE, revSurf(pr, 72, { cx: c[0], cz: c[1], y, skip: cut }));
    bag.add(WHITE, revSurf([[wall, ceil], [wall, dh], [wall, 0]], 72, { cx: c[0], cz: c[1], y, flip: false, skip: cut }));
    bag.add(WHITE, ring(6.2, wall, y + ceil, 72, c[0], c[1], false));                                         // the ceiling
    bag.add('daylight', ring(0.01, 6.2, y + ceil - 0.02, 36, c[0], c[1], false));                              // the luminous ceiling at the middle
    bag.add(CONC, ring(rin, rin + 0.8, y + 0.04, 72, c[0], c[1], true));
    door(bag, c, wall, rin, ang, doorW, dh, y);
    bag.add('cloth_green', box(c[0] - wall + 0.3, y, c[1] - 1.7, c[0] + 0.3, y + 0.04, c[1] + 1.7));
    const D = [c[0] + 11, c[1]];
    dais(bag, col, D, y, c[0] + wall - 0.6, 'cloth_green');
    hemicycle(bag, col, { room: c, R: wall, D, rows: 9, r0: 5.5, dr: 1.55, half: 1.35, aisles: [-0.7, 0, 0.7], y, seat: 'leather_bench' });
    ringSegments(col, c[0], c[1], (wall + rin) / 2, rin - wall + 0.2, y, y + 3.0, 56, (m) => Math.abs(dAng(m, ang)) < half * 1.25);
    col.circle(c[0], c[1], rin + 0.5, y + 3.0, y + rim);
    lights.push({ at: [c[0], y + 6.2, c[1]], color: '#fff0d8', intensity: 7, distance: 26 });
  }
  void lathe; void fromTriangles; void frustum; void tri2; void TAU; void quad2;
}
