// Brasília style — the street furniture of 1970: bus shelters, kiosks and vendors' carts, the car parks' painted bays, the carriageways'
// and the avenue's markings, medians, crossings and traffic lights, the playgrounds and the pitch of the superquadras.
import { box, lathe, rod } from '../../core/geom.js';
import { rngOf, solidBox, letters, stool, shrub } from './kit.js';
import { ROAD_N, ROAD_S, AVENUE, MEDIANS, MINISTRIES, MIN_Z, PITCH, MIN_W, SQS, RING } from '../../settlements/brasilia/layout.js';

const faceDir = (r) => ['z+', 'x+', 'z-', 'x-'][((r % 4) + 4) % 4];
/** A frame turned by quarter turns: local (u, v) to the world about (x, z); `box` in it. */
function frame(x, z, r) {
  const P = (u, v) => [[x + u, z + v], [x + v, z - u], [x - u, z - v], [x - v, z + u]][((r % 4) + 4) % 4];
  const B = (bag, mat, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); };
  const C = (col, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y0, y1); };
  return { P, B, C };
}

/** bus_shelter: { at, r (the open side toward local +v), n (the line's number) } — a slab on two piers, a glass back, a bench, the stop's pole. */
export function busShelter(el, { bag, col }) {
  const F = frame(el.at[0], el.at[1], el.r ?? 0), rand = rngOf(el.seed ?? 7);
  F.B(bag, 'concrete_light', -2.3, 2.55, -1.0, 2.3, 2.72, 1.1);
  for (const u of [-2.0, 2.0]) { F.B(bag, 'concrete_light', u - 0.1, 0, -0.9, u + 0.1, 2.55, -0.7); F.C(col, u - 0.12, 0, -0.92, u + 0.12, 2.6, -0.68); }
  F.B(bag, 'glass_outer', -1.9, 0.5, -0.9, 1.9, 2.5, -0.86); F.C(col, -1.9, 0, -0.92, 1.9, 2.5, -0.84);
  F.B(bag, 'timber', -1.5, 0.45, -0.7, 1.5, 0.5, -0.25); F.B(bag, 'steel_grey', -1.4, 0, -0.65, -1.3, 0.45, -0.3); F.B(bag, 'steel_grey', 1.3, 0, -0.65, 1.4, 0.45, -0.3); F.C(col, -1.5, 0, -0.7, 1.5, 0.5, -0.25);
  F.B(bag, 'paint_blue', -1.7, 1.6, -0.86, -0.6, 2.1, -0.84);                                             // the panel with the line's colour and its number
  { const q = F.P(-1.15, -0.84); letters(bag, 'cloth_white', q[0], 1.7, q[1], 3, faceDir(el.r ?? 0), rand, 0.28, 0.2); }
  // the stop's pole beside it with its round plate
  const q = F.P(2.8, 0.8); bag.add('steel_grey', rod([q[0], 0, q[1]], [q[0], 2.6, q[1]], 0.04, 6)); bag.add('paint_blue', lathe([[0.3, 0], [0.3, 0.03], [0.001, 0.03]], 12, null, q[0], 2.55, q[1]));
  bag.add('paint_blue', box(q[0] - 0.3, 2.3, q[1] - 0.02, q[0] + 0.3, 2.9, q[1] + 0.02)); col.circle(q[0], q[1], 0.08, 0, 2.6);
}

/** kiosk: { at, r, kind: 'banca' | 'lanchonete' | 'coco' | 'sorvete' } — a white kiosk with a service window, an awning, the goods outside. */
export function kiosk(el, { bag, col }) {
  const F = frame(el.at[0], el.at[1], el.r ?? 0), rand = rngOf(el.seed ?? 11), kind = el.kind ?? 'lanchonete';
  const band = { banca: 'cloth_red', lanchonete: 'cloth_blue', coco: 'cloth_green', sorvete: 'cloth_ochre' }[kind];
  F.B(bag, 'plaster_white', -1.3, 0, -1.2, 1.3, 2.4, 0.9); F.C(col, -1.3, 0, -1.2, 1.3, 2.4, 0.9);
  F.B(bag, 'concrete_light', -1.45, 2.4, -1.35, 1.45, 2.55, 1.35);
  F.B(bag, band, -1.32, 1.9, 0.9, 1.32, 2.4, 0.93); { const q = F.P(0, 0.93); letters(bag, 'cloth_white', q[0], 2.0, q[1], 7, faceDir(el.r ?? 0), rand, 0.28, 0.2); }
  F.B(bag, 'glass_outer', -1.0, 1.0, 0.9, 1.0, 1.85, 0.92);                                                // the service window
  F.B(bag, 'timber', -1.1, 0.95, 0.9, 1.1, 1.0, 1.3);                                                      // the ledge
  F.B(bag, band, -1.4, 2.2, 0.9, 1.4, 2.28, 2.0);                                                          // the awning over it
  for (const u of [-1.3, 1.3]) F.B(bag, 'steel_grey', u - 0.03, 0, 1.9, u + 0.03, 2.2, 1.95);
  if (kind === 'banca') { for (let k = 0; k < 6; k++) F.B(bag, ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_black'][k], -1.0 + k * 0.3, 1.0, 1.1, -0.75 + k * 0.3, 1.38, 1.14); for (let k = 0; k < 8; k++) F.B(bag, ['cloth_ochre', 'cloth_red', 'cloth_blue'][k % 3], -1.28, 0.3 + k * 0.2, -1.0 + (k % 4) * 0.5, -1.24, 0.46 + k * 0.2, -0.6 + (k % 4) * 0.5); }
  else if (kind === 'coco') { for (let k = 0; k < 14; k++) { const p = F.P(-1.0 + (k % 5) * 0.35, 1.2 + Math.floor(k / 5) * 0.3); bag.add('palm_leaf', lathe([[0.001, 0], [0.12, 0.1], [0.14, 0.2], [0.09, 0.3], [0.001, 0.32]], 7, null, p[0], 0, p[1])); } }
  else { const p = F.P(1.6, 0.4), q = F.P(1.6, -0.4); stool(bag, p[0], p[1], 0, 0.6, 'cloth_red'); stool(bag, q[0], q[1], 0, 0.6, 'cloth_red'); }
  // the cooler or cart beside it
  F.B(bag, 'steel_chrome', 1.4, 0, -0.4, 2.0, 0.8, 0.3); F.C(col, 1.4, 0, -0.4, 2.0, 0.8, 0.3);
}

/** cart: { at, r, kind: 'pipoca' | 'picole' | 'churro' } — a vendor's cart with a glass case, two wheels and an umbrella. */
export function cart(el, { bag, col }) {
  const F = frame(el.at[0], el.at[1], el.r ?? 0), kind = el.kind ?? 'pipoca';
  const um = { pipoca: 'cloth_red', picole: 'cloth_blue', churro: 'cloth_ochre' }[kind];
  F.B(bag, 'wood_painted', -0.5, 0.45, -0.35, 0.5, 0.95, 0.35); F.B(bag, 'glass_outer', -0.45, 0.95, -0.3, 0.45, 1.3, 0.3); F.C(col, -0.5, 0, -0.35, 0.5, 1.3, 0.35);
  F.B(bag, 'steel_chrome', -0.55, 0.4, -0.35, -0.5, 1.0, 0.35);
  for (const v of [-0.4, 0.4]) F.B(bag, 'rubber', -0.28, 0, v - 0.03, 0.28, 0.56, v + 0.03);
  const p = F.P(-0.6, 0); bag.add('steel_grey', rod([p[0], 0.9, p[1]], [p[0] - 0.3, 0.9, p[1]], 0.02, 5));         // the handle
  const u = F.P(0, 0); bag.add('steel_grey', rod([u[0], 1.3, u[1]], [u[0], 2.25, u[1]], 0.02, 5)); bag.add(um, lathe([[1.0, 0], [0.7, 0.14], [0.001, 0.32]], 12, null, u[0], 2.2, u[1]));
  const g = kind === 'pipoca' ? 'cloth_white' : kind === 'picole' ? 'glaze_blue' : 'hide_tan';
  for (let k = 0; k < 4; k++) { const q = F.P(-0.3 + k * 0.2, 0); bag.add(g, box(q[0] - 0.06, 1.0, q[1] - 0.15, q[0] + 0.06, 1.2, q[1] + 0.15)); }
}

/** parking: { rect, side } — bays of 2.5 × 5 m painted in two files on either side of the aisle, the kerb stones at the ends. */
export function parking(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = 0.01, y1 = 0.035, W = 2.5, D = 5;
  const line = (a, b, c, d) => bag.add('paint_white', box(a, y0, b, c, y1, d));
  for (const [xs, dir] of [[x0 + 0.5, 1], [x1 - 0.5, -1]]) {
    const xe = xs + dir * D;
    line(Math.min(xs, xe), z0, Math.max(xs, xe), z0 + 0.1);
    for (let z = z0; z <= z1 - W + 0.01; z += W) { line(Math.min(xs, xe), z + W - 0.05, Math.max(xs, xe), z + W + 0.05); }
    line(Math.min(xs, xe) - (dir > 0 ? 0 : 0.0), z0, Math.min(xs, xe) + 0.1, z1 - (z1 - z0) % W);
    line(Math.max(xs, xe) - 0.1, z0, Math.max(xs, xe), z1 - (z1 - z0) % W);
  }
  bag.add('concrete_light', box(x0 - 0.2, 0, z0 - 0.2, x1 + 0.2, 0.1, z0)); bag.add('concrete_light', box(x0 - 0.2, 0, z1, x1 + 0.2, 0.1, z1 + 0.2));
  bag.add('concrete_light', box(x0 - 0.2, 0, z0, x0, 0.1, z1)); bag.add('concrete_light', box(x1, 0, z0, x1 + 0.2, 0.1, z1));
  void col;
}

/** The marked-out roads: lane lines, edge lines, the avenue's double yellow, kerbed medians with grass, zebra crossings in the gaps, traffic lights. */
export function roadmarks(el, { bag, col }) {
  const y0 = 0.012, y1 = 0.03, W = 'paint_white', Y = 'paint_ochre';
  const dash = (mat, x, z, lx, lz) => bag.add(mat, box(x, y0, z, x + lx, y1, z + lz));
  for (const R of [ROAD_N, ROAD_S]) {
    const [x0, z0, x1] = R, zA = z0 + 0.3;
    for (let x = x0 + 20; x < x1 - 66; x += 9) for (const dz of [3.6, 16.4]) dash(W, x, zA + dz, 3.2, 0.12);
    dash(W, x0 + 20, zA - 0.0, x1 - 66 - x0 - 20, 0.14); dash(W, x0 + 20, zA + 21.2, x1 - 66 - x0 - 20, 0.14);
    dash(W, x0 + 20, zA + 7.0, x1 - 66 - x0 - 20, 0.14); dash(W, x0 + 20, zA + 12.9, x1 - 66 - x0 - 20, 0.14);
  }
  // the medians: a kerb, the grass between, a shrub every so often
  const rand = rngOf(5);
  for (const m of MEDIANS) {
    const [x0, z0, x1, z1] = m, xe = x1 - 66;
    bag.add('concrete_light', box(x0 + 20, 0, z0, xe, 0.16, z0 + 0.25)); bag.add('concrete_light', box(x0 + 20, 0, z1 - 0.25, xe, 0.16, z1));
    bag.add('sod', box(x0 + 20, 0, z0 + 0.25, xe, 0.13, z1 - 0.25));
    for (let x = x0 + 24; x < xe; x += 14 + rand() * 10) shrub(bag, x, (z0 + z1) / 2, 0.13, 0.55 + rand() * 0.25, 'palm_leaf');
  }
  // the avenue: double yellow at the middle, white lane dashes, edge lines
  const [ax0, az0, ax1, az1] = AVENUE, xm = (ax0 + ax1) / 2;
  dash(Y, xm - 0.25, az0 + 6, 0.12, az1 - az0 - 30); dash(Y, xm + 0.13, az0 + 6, 0.12, az1 - az0 - 30);
  for (let z = az0 + 6; z < az1 - 30; z += 9) for (const x of [ax0 + 6.5, ax1 - 6.5]) dash(W, x, z, 0.12, 3.2);
  dash(W, ax0 + 0.4, az0 + 6, 0.14, az1 - az0 - 30); dash(W, ax1 - 0.54, az0 + 6, 0.14, az1 - az0 - 30);
  // the zebras: across the carriageways in the gaps between the ministries (every second gap), across the avenue at the shops
  const zebra = (cx, cz, alongZ, len) => { for (let k = -len / 2 + 0.5; k < len / 2; k += 1.0) dash(W, alongZ ? cx - 1.6 : cx + k, alongZ ? cz + k : cz - 1.6, alongZ ? 3.2 : 0.5, alongZ ? 0.5 : 3.2); };
  const gaps = MINISTRIES.filter((m, i) => m.side === 'n' && i % 4 === 0).map((m) => m.rect[0] - (PITCH - MIN_W) / 2);
  for (const gx of gaps) for (const R of [ROAD_N, ROAD_S]) {
    zebra(gx, R[1] + 3.6, true, 7); zebra(gx, R[1] + 18.4, true, 7);
    // the lights at the crossing's ends
    for (const [dx, dz] of [[-3.0, 0.5], [3.0, 21.5]]) signal(bag, col, gx + dx, R[1] + dz);
  }
  for (const z of [318, 352, 396]) { zebra(xm, z, false, 26); signal(bag, col, ax0 - 1.4, z - 2.6); signal(bag, col, ax1 + 1.4, z + 2.6); }
  void MIN_Z; void SQS; void RING;
}
/** A traffic light: a pole with a three-lamp head and a pedestrian signal. */
function signal(bag, col, x, z) {
  bag.add('steel_grey', rod([x, 0, z], [x, 3.4, z], 0.05, 6)); col.circle(x, z, 0.1, 0, 3.4);
  bag.add('steel_grey', box(x - 0.12, 2.6, z - 0.1, x + 0.12, 3.4, z + 0.1));
  bag.add('glaze_red', box(x - 0.07, 3.15, z - 0.12, x + 0.07, 3.3, z + 0.12)); bag.add('glaze_yellow', box(x - 0.07, 2.95, z - 0.12, x + 0.07, 3.08, z + 0.12)); bag.add('glaze_green', box(x - 0.07, 2.72, z - 0.12, x + 0.07, 2.88, z + 0.12));
  bag.add('steel_grey', box(x - 0.1, 1.9, z - 0.08, x + 0.1, 2.3, z + 0.08)); bag.add('glaze_red', box(x - 0.06, 2.12, z - 0.1, x + 0.06, 2.24, z + 0.1));
}

/** playground: { rect } — a sandpit in a timber frame, a swing, a slide, a roundabout, benches. */
export function playground(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('pebbles', box(x0, 0, z0, x1, 0.03, z1));
  // sandpit
  for (const [a, b, c, d] of [[x0 + 1, z0 + 1, x0 + 5.2, z0 + 1.2], [x0 + 1, z0 + 4.8, x0 + 5.2, z0 + 5], [x0 + 1, z0 + 1.2, x0 + 1.2, z0 + 4.8], [x0 + 5, z0 + 1.2, x0 + 5.2, z0 + 4.8]]) bag.add('timber', box(a, 0.02, b, c, 0.3, d));
  bag.add('sandstone_dressed', box(x0 + 1.2, 0, z0 + 1.2, x0 + 5, 0.2, z0 + 4.8)); col.rect([x0 + 1, z0 + 1, x0 + 5.2, z0 + 5], 0, 0.3);
  // swing set: two A-frames, a bar, two swings
  const sx = cx + 1, sz = z1 - 3;
  for (const u of [-2.0, 2.0]) { bag.add('steel_grey', rod([sx + u, 0, sz - 0.8], [sx + u, 2.3, sz], 0.05, 6)); bag.add('steel_grey', rod([sx + u, 0, sz + 0.8], [sx + u, 2.3, sz], 0.05, 6)); }
  bag.add('steel_grey', rod([sx - 2, 2.3, sz], [sx + 2, 2.3, sz], 0.05, 6));
  for (const u of [-0.8, 0.8]) { bag.add('steel_chrome', rod([sx + u - 0.2, 2.3, sz], [sx + u - 0.2, 0.5, sz], 0.012, 4)); bag.add('steel_chrome', rod([sx + u + 0.2, 2.3, sz], [sx + u + 0.2, 0.5, sz], 0.012, 4)); bag.add('rubber', box(sx + u - 0.22, 0.45, sz - 0.1, sx + u + 0.22, 0.5, sz + 0.1)); }
  col.rect([sx - 2.1, sz - 0.9, sx + 2.1, sz + 0.9], 0, 2.4);
  // slide: a ladder, a platform, the chute
  const dx = x1 - 4, dz = z0 + 3;
  bag.add('steel_grey', box(dx - 0.5, 1.5, dz - 0.5, dx + 0.5, 1.55, dz + 0.5)); for (const [a, b] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) bag.add('steel_grey', rod([dx + a, 0, dz + b], [dx + a, 1.5, dz + b], 0.03, 5));
  bag.add('steel_chrome', rod([dx - 0.25, 1.55, dz + 0.5], [dx - 0.25, 0.05, dz + 2.4], 0.05, 6)); bag.add('steel_chrome', rod([dx + 0.25, 1.55, dz + 0.5], [dx + 0.25, 0.05, dz + 2.4], 0.05, 6)); bag.add('steel_chrome', box(dx - 0.25, 0.9, dz + 1.0, dx + 0.25, 0.92, dz + 1.3));
  for (let k = 0; k < 5; k++) bag.add('steel_grey', box(dx - 0.4, 0.2 + k * 0.28, dz - 0.5 - 0.06, dx + 0.4, 0.24 + k * 0.28, dz - 0.5));
  col.rect([dx - 0.6, dz - 0.6, dx + 0.6, dz + 2.4], 0, 1.6);
  // roundabout
  bag.add('steel_grey', lathe([[0.9, 0.25], [0.9, 0.3], [0.001, 0.3]], 12, null, cx - 3, 0, cz)); bag.add('steel_grey', rod([cx - 3, 0, cz], [cx - 3, 0.3, cz], 0.06, 6)); for (let k = 0; k < 4; k++) bag.add('steel_chrome', rod([cx - 3, 0.3, cz], [cx - 3 + Math.cos(k * 1.57) * 0.85, 0.85, cz + Math.sin(k * 1.57) * 0.85], 0.02, 4)); col.circle(cx - 3, cz, 0.9, 0, 0.9);
  // benches along the edge
  for (const u of [-3, 3]) { bag.add('timber', box(cx + u - 0.9, 0.42, z0 + 0.3, cx + u + 0.9, 0.47, z0 + 0.75)); bag.add('timber', box(cx + u - 0.9, 0.5, z0 + 0.25, cx + u + 0.9, 0.9, z0 + 0.3)); bag.add('concrete_light', box(cx + u - 0.8, 0, z0 + 0.3, cx + u - 0.7, 0.42, z0 + 0.7)); bag.add('concrete_light', box(cx + u + 0.7, 0, z0 + 0.3, cx + u + 0.8, 0.42, z0 + 0.7)); col.rect([cx + u - 0.9, z0 + 0.25, cx + u + 0.9, z0 + 0.75], 0, 0.5); }
}

/** pitch: { rect } — a small football field (the pelada): turf lines, two goals. */
export function pitch(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cz = (z0 + z1) / 2, cx = (x0 + x1) / 2, y0 = 0.01, y1 = 0.025;
  bag.add('sod', box(x0, 0, z0, x1, 0.02, z1));
  for (const [a, b, c, d] of [[x0, z0, x1, z0 + 0.12], [x0, z1 - 0.12, x1, z1], [x0, z0, x0 + 0.12, z1], [x1 - 0.12, z0, x1, z1], [cx - 0.06, z0, cx + 0.06, z1]]) bag.add('paint_white', box(a, y0, b, c, y1, d));
  for (const [gx, s] of [[x0, 1], [x1, -1]]) {
    for (const dz of [-1.8, 1.8]) bag.add('paint_white', rod([gx, 0, cz + dz], [gx, 2.2, cz + dz], 0.06, 6));
    bag.add('paint_white', rod([gx, 2.2, cz - 1.8], [gx, 2.2, cz + 1.8], 0.06, 6));
    bag.add('paint_white', rod([gx, 2.2, cz - 1.8], [gx - s * 1.0, 0, cz - 1.8], 0.02, 4)); bag.add('paint_white', rod([gx, 2.2, cz + 1.8], [gx - s * 1.0, 0, cz + 1.8], 0.02, 4));
    col.circle(gx, cz - 1.8, 0.1, 0, 2.3); col.circle(gx, cz + 1.8, 0.1, 0, 2.3);
  }
  void solidBox;
}
