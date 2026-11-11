// Dressing of the Old Kingdom settlement at eye level (docs/settlements/giza.md §13): the fronts of the workers' houses
// (doorsteps, benches, water-jar stands, reed shades, weathering, roofs in use), the yards between them (pens, brickyards,
// silos, middens, threshing floors), the lane's furniture, the cemetery streets' work in progress and the tombs' wear, the
// storerooms along the pyramid's court, the quay's goods. Elements: ok_yard, ok_lane, ok_cemetery, ok_magazines,
// ok_quay; functions houseFront, houseRoof, mastabaWear, galleryOutside, bakeryShade (called by the style's elements).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const BEER = [[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]];
const jar = (bag, x, y, z, s = 1, mat = 'terracotta', prof = JAR) => bag.add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), 9, null, x, y, z));
const post = (bag, x, y0, y1, z, r = 0.05) => bag.add('palm_trunk', lathe([[r, y0], [r * 0.9, y1], [0.001, y1]], 6, null, x, 0, z));
/** A small block of core stone / mudbrick, turned by `a`. */
function blockAt(bag, mat, x, y, z, a, hx, hy, hz) {
  const c = Math.cos(a), s = Math.sin(a), t = [];
  const P = (u, v, h) => [x + c * u - s * v, y + h, z + s * u + c * v], q = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]];
  for (let i = 0; i < 4; i++) { const [p0, p1] = [q[i], q[(i + 1) % 4]]; t.push(...P(...p0, 0), ...P(...p1, 0), ...P(...p1, 2 * hy), ...P(...p0, 0), ...P(...p1, 2 * hy), ...P(...p0, 2 * hy)); }
  t.push(...P(...q[0], 2 * hy), ...P(...q[2], 2 * hy), ...P(...q[1], 2 * hy), ...P(...q[0], 2 * hy), ...P(...q[3], 2 * hy), ...P(...q[2], 2 * hy));
  bag.add(mat, fromTriangles(t));
}

/**
 * The front of a house (called by mud_house) { x0, z0, x1, z1, h, th, xd, dw, seed }: a limestone doorstep, a mud bench
 * on one side of the door and the water jar on its ring stand on the other, a reed shade over the door on thin poles,
 * high slits under the roof, the plaster fallen away in patches to show the brick, the rain's streaks under the eaves.
 */
export function houseFront(bag, col, g) {
  const { x0, z0, x1, z1, h, th, xd, dw } = g, rand = rng((g.seed || 1) * 7 + 13), zf = z1 + th / 2;
  bag.add('limestone_core', box(xd - dw / 2 - 0.12, 0, zf, xd + dw / 2 + 0.12, 0.1, zf + 0.42));
  const left = xd - dw / 2 - x0 - 0.1, right = x1 - xd - dw / 2 - 0.1, s = right > left ? 1 : -1, room = Math.max(left, right);
  if (room > 1.7 && rand() < 0.75) {
    const b0 = s > 0 ? xd + dw / 2 + 0.2 : xd - dw / 2 - 0.2 - Math.min(1.7, room - 0.2), L = Math.min(1.7, room - 0.2);
    bag.add('mud_plaster', box(b0, 0, zf, b0 + L, 0.4, zf + 0.4)); col.rect([b0, zf, b0 + L, zf + 0.4], 0, 0.4);
    if (rand() < 0.5) jar(bag, b0 + L * 0.3, 0.4, zf + 0.2, 0.55);
    if (rand() < 0.4) bag.add('reed_mat', box(b0 + L * 0.5, 0.4, zf + 0.04, b0 + L * 0.95, 0.43, zf + 0.36));
  }
  // the zir stand: a ring of mudbrick with the big water jar in it, a palm-leaf cover, a cup on the rim
  const sx = s > 0 ? xd - dw / 2 - 0.4 : xd + dw / 2 + 0.4;
  if (Math.min(left, right) > 0.7) {
    bag.add('mudbrick', lathe([[0.26, 0], [0.26, 0.3], [0.17, 0.33], [0.001, 0.33]], 10, null, sx, 0, zf + 0.3));
    jar(bag, sx, 0.3, zf + 0.3, 1.15, rand() < 0.5 ? 'terracotta' : 'pottery_dark');
    bag.add('palm_leaf', lathe([[0.14, 0.95], [0.1, 0.99], [0.001, 1.0]], 8, null, sx, 0, zf + 0.3));
    col.circle(sx, zf + 0.3, 0.27, 0, 0.9);
  }
  // the reed shade over the door on two thin poles
  if (rand() < 0.5) {
    const a = xd - dw / 2 - 0.35, b = xd + dw / 2 + 0.35, d = zf + 0.9;
    post(bag, a, 0, 2.25, d); post(bag, b, 0, 2.25, d);
    const t = []; beamTris(t, [a - 0.1, 2.3, zf], [a - 0.1, 2.3, d + 0.15], 0.06, 0.06); beamTris(t, [b + 0.1, 2.3, zf], [b + 0.1, 2.3, d + 0.15], 0.06, 0.06);
    bag.add('timber', fromTriangles(t));
    bag.add('reed_mat', box(a - 0.15, 2.36, zf, b + 0.15, 2.42, d + 0.2));
  }
  // slits under the roof on the three blind walls, with a timber lintel above
  const slit = (cx, cz, along) => {
    const [w, d] = along === 'x' ? [0.5, 0.03] : [0.03, 0.5];
    bag.add('pottery_dark', box(cx - w / 2, 2.0, cz - d / 2, cx + w / 2, 2.25, cz + d / 2));
    bag.add('timber', box(cx - w / 2 - (along === 'x' ? 0.08 : 0), 2.25, cz - d / 2 - (along === 'x' ? 0 : 0.08), cx + w / 2 + (along === 'x' ? 0.08 : 0), 2.32, cz + d / 2 + (along === 'x' ? 0 : 0.08)));
  };
  const W = x1 - x0, D = z1 - z0;
  for (const k of [0.3, 0.7]) { slit(x0 + W * k, z0 - th / 2 - 0.012, 'x'); }
  for (const k of [0.35, 0.7]) { slit(x0 - th / 2 - 0.012, z0 + D * k, 'z'); slit(x1 + th / 2 + 0.012, z0 + D * k, 'z'); }
  // the plaster fallen in patches (bare brick beneath) and the streaks under the eaves
  const faces = [
    (u, v, w, hh) => [x0 + u * W, v, z0 - th / 2 - 0.03, x0 + u * W + w, v + hh, z0 - th / 2 - 0.02],
    (u, v, w, hh) => [x0 - th / 2 - 0.03, v, z0 + u * D, x0 - th / 2 - 0.02, v + hh, z0 + u * D + w],
    (u, v, w, hh) => [x1 + th / 2 + 0.02, v, z0 + u * D, x1 + th / 2 + 0.03, v + hh, z0 + u * D + w],
    (u, v, w, hh) => [x0 + u * W, v, z1 + th / 2 + 0.02, x0 + u * W + w, v + hh, z1 + th / 2 + 0.03],
  ];
  for (let k = 0, n = 3 + Math.floor(rand() * 3); k < n; k++) {
    const f = Math.floor(rand() * 4), w = 0.4 + rand() * 0.7, hh = 0.35 + rand() * 0.6, v = 0.7 + rand() * 0.9, u = 0.05 + rand() * 0.8;
    const r = faces[f](u, v, w, hh);
    if (f === 3 && r[0] < xd + dw / 2 + 0.3 && r[3] > xd - dw / 2 - 0.3) continue;
    if (f < 3 && (f === 0 ? r[3] : r[5]) > (f === 0 ? x1 : z1) + 0.3) continue;
    bag.add('mudbrick', box(...r));
  }
  for (let k = 0, n = 2 + Math.floor(rand() * 3); k < n; k++) {
    const f = Math.floor(rand() * 4), hh = 0.7 + rand() * 0.9, u = 0.05 + rand() * 0.85, r = faces[f](u, h - hh, 0.12, hh);
    if (f === 0) { r[2] -= 0.02; r[5] -= 0.02; } else if (f === 1) { r[0] -= 0.02; r[3] -= 0.02; } else if (f === 2) { r[0] += 0.02; r[3] += 0.02; } else { r[2] += 0.02; r[5] += 0.02; }
    if (f === 3 && r[0] < xd + dw / 2 + 0.3 && r[3] > xd - dw / 2 - 0.3) continue;
    bag.add('plaster_streak', box(...r));
  }
}

/** The roof in use { x0, z0, rx1, z1, h, seed }: the parapet, a spout, a reed shade on poles, mats with things drying, jars, a heap of fodder. */
export function houseRoof(bag, g) {
  const { x0, z0, rx1, z1, h } = g, rand = rng((g.seed || 1) * 11 + 5), y = h + 0.3;
  const p = 0.2;
  bag.add('mud_plaster', box(x0 - 0.25, y, z0 - 0.25, rx1 + 0.1, y + 0.22, z0 - 0.25 + p));
  bag.add('mud_plaster', box(x0 - 0.25, y, z1 + 0.25 - p, rx1 + 0.1, y + 0.22, z1 + 0.25));
  bag.add('mud_plaster', box(x0 - 0.25, y, z0 - 0.25 + p, x0 - 0.25 + p, y + 0.22, z1 + 0.25 - p));
  bag.add('mud_plaster', box(rx1 + 0.1 - p, y, z0 - 0.25 + p, rx1 + 0.1, y + 0.22, z1 + 0.25 - p));
  bag.add('timber', box(x0 + (rx1 - x0) * 0.5 - 0.06, y + 0.04, z1 + 0.25, x0 + (rx1 - x0) * 0.5 + 0.06, y + 0.1, z1 + 0.75));
  const W = rx1 - x0, D = z1 - z0, at = (u, v) => [x0 + 0.5 + u * (W - 1.0), z0 + 0.5 + v * (D - 1.0)];
  if (W < 3 || D < 3) return;
  let r = rand();
  if (r < 0.45) {
    const [cx, cz] = at(0.3 + rand() * 0.4, 0.3 + rand() * 0.4);
    for (const [dx, dz] of [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]]) post(bag, cx + dx, y, y + 1.8, cz + dz, 0.04);
    bag.add('reed_mat', box(cx - 0.95, y + 1.8, cz - 0.75, cx + 0.95, y + 1.86, cz + 0.75));
    if (rand() < 0.6) bag.add('reed_mat', box(cx - 0.6, y + 0.01, cz - 0.3, cx + 0.6, y + 0.03, cz + 0.3));
  } else if (r < 0.75) {
    const [cx, cz] = at(0.2 + rand() * 0.6, 0.2 + rand() * 0.6);
    bag.add('reed_mat', box(cx - 0.7, y + 0.005, cz - 0.45, cx + 0.7, y + 0.025, cz + 0.45));
    for (let k = 0; k < 9; k++) bag.add(rand() < 0.6 ? 'cloth_ochre' : 'cloth_brown', box(cx - 0.6 + (k % 5) * 0.27, y + 0.025, cz - 0.3 + Math.floor(k / 5) * 0.4, cx - 0.6 + (k % 5) * 0.27 + 0.16, y + 0.06, cz - 0.3 + Math.floor(k / 5) * 0.4 + 0.22));
  }
  if (rand() < 0.5) { const [cx, cz] = at(rand() * 0.2 + 0.05, rand()); for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) jar(bag, cx + (k % 2) * 0.35, y, cz + Math.floor(k / 2) * 0.4, 0.8); }
  if (rand() < 0.3) { const [cx, cz] = at(0.75 + rand() * 0.2, rand()); bag.add('thatch', lathe([[0.7, 0], [0.62, 0.3], [0.35, 0.55], [0.001, 0.62]], 9, null, cx, y, cz)); }
}

/** The tomb's wear { cx, cz, a, b, h, cased, seed } (called by mastaba): fallen blocks and rubble at the foot, sand banked against the walls, stains below the top, cracks. */
export function mastabaWear(bag, g) {
  const { cx, cz, a, b, h } = g, rand = rng((g.seed || 1) * 5 + 3), cased = g.cased;
  const n = 5 + Math.floor(rand() * 5);
  for (let k = 0; k < n; k++) {
    const side = Math.floor(rand() * 4), t = rand();
    const [px, pz] = side === 0 ? [cx - a - 0.5 - rand() * 0.6, cz - b + t * 2 * b] : side === 1 ? [cx + a + 3.4 + rand() * 0.6, cz - b + t * 2 * b] : side === 2 ? [cx - a + t * 2 * a, cz - b - 0.5 - rand() * 0.6] : [cx - a + t * 2 * a, cz + b + 0.5 + rand() * 0.6];
    if (side === 1 && Math.abs(pz - (cz + b - 2.6)) < 2.4) continue;
    blockAt(bag, cased ? 'tura_limestone' : 'limestone_core', px, -0.05, pz, rand() * 3.1, 0.3 + rand() * 0.2, 0.12 + rand() * 0.14, 0.2 + rand() * 0.14);
    if (rand() < 0.5) bag.add('rubble', lathe([[0.45, -0.05], [0.3, 0.12], [0.001, 0.2]], 7, null, px + 0.5, 0, pz + 0.3));
  }
  // sand drifted against the north and west faces (the wind from the north-west)
  for (const [x0, z0, x1, z1] of [[cx - a - 1.1, cz - b + 0.5, cx - a + 0.1, cz + b - 0.5], [cx - a + 0.5, cz - b - 1.0, cx + a - 0.5, cz - b + 0.1]]) bag.add('limestone_yellow', lathe([[1, 0], [0.7, 0.1], [0.001, 0.18]], 8, null, 0, 0, 0).scale((x1 - x0) / 2, 1, (z1 - z0) / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2));
  void cased;
}

/** The outside of a gallery { rect, h } (called by gallery_hall): buttress-like pilasters, patches, the porch's roof shade, jars and bundles by the porch, roof clerestory slits. */
export function galleryOutside(bag, col, g) {
  const [x0, z0, x1, z1] = g.rect, h = g.h, th = 0.6, rand = rng(Math.floor(x0 * 13 + z0 * 7 + 5));
  for (let x = x0 + 4; x < x1 - 2; x += 4.2) for (const z of [z0 - th / 2, z1 + th / 2]) {
    const s = z < (z0 + z1) / 2 ? -1 : 1;
    if (rand() < 0.35) bag.add('plaster_streak', box(x, h - 1.4, Math.min(z, z + s * 0.012), x + 0.14, h, Math.max(z, z + s * 0.012)));
    else if (rand() < 0.5) bag.add('mudbrick', box(x, 0.4 + rand() * 0.6, Math.min(z, z + s * 0.012), x + 0.5 + rand() * 0.6, 1.2 + rand() * 0.8, Math.max(z, z + s * 0.012)));
    bag.add('pottery_dark', box(x + 1.2, h - 0.8, Math.min(z, z + s * 0.025), x + 1.9, h - 0.6, Math.max(z, z + s * 0.025)));
  }
  // the roof edge: a low parapet, the reed shade over the western porch
  const y = h + 0.4;
  for (const z of [z0 - 0.2, z1 + 0.2 - 0.18]) bag.add('mud_plaster', box(x0 - 0.2, y, z, x1 + 0.2, y + 0.2, z + 0.18));
  bag.add('mud_plaster', box(x1 + 0.02, y, z0 - 0.2, x1 + 0.2, y + 0.2, z1 + 0.2));
  const zc = (z0 + z1) / 2;
  for (const z of [z0 + 0.2, z1 - 0.2]) { post(bag, x0 + 0.1, 0, 2.7, z, 0.07); }
  bag.add('reed_mat', box(x0 - 0.3, 2.7, z0 - 0.05, x0 + 2.1, 2.76, z1 + 0.05));
  void zc; void col;
}

/** The reed shade over a bakery's hearth { rect } (called by bakery): poles at the corners of the hearth platform, the reed mat roof black with smoke, firewood stacked by the door. */
export function bakeryShade(bag, col, g) {
  const [x0, z0, x1, z1] = g.rect, rand = rng(Math.floor(x0 * 11 + z0 * 3 + 9)), hz0 = z1 - 0.25 - 1.5;
  for (const x of [x0 + 0.3, (x0 + x1) / 2, x1 - 0.3]) for (const z of [hz0 - 0.2, z1 - 0.25]) post(bag, x, 0, 2.4, z, 0.06);
  bag.add('reed_mat', box(x0 - 0.1, 2.4, hz0 - 0.4, x1 + 0.1, 2.46, z1 + 0.15));
  bag.add('cloth_black', box(x0 + 0.5, 2.39, hz0 - 0.2, x1 - 0.5, 2.395, z1 - 0.3));
  // the firewood (palm-rib and acacia) stacked outside the door, the heaps of ash and broken pots
  const fx = x0 - 0.5, fz = z0 - 0.3;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) bag.add('palm_trunk', lathe([[0.07, 0], [0.07, 1.1]], 6).rotateZ(Math.PI / 2).translate(fx - 0.55, 0.08 + r * 0.14, fz - 0.3 + k * 0.17 + r * 0.08));
  bag.add('plaster_grey', lathe([[0.7, 0], [0.5, 0.1], [0.001, 0.2]], 8, null, x1 + 0.9, 0, z0 + 0.8));
  if (rand() < 0.7) bag.add('terracotta', lathe([[0.3, 0], [0.18, 0.08], [0.001, 0.12]], 7, null, x0 - 0.2, 0, z1 + 0.6));
  void col;
}

/**
 * ok_yard { rect, kind, seed }: the open ground between the houses. kind 'pen' (a mudbrick wall to the hip, a gate, a
 * trough, straw), 'brickyard' (the mud pit, the rows of bricks laid to dry and stacked in herringbone, a mould,
 * water jars, the heap of chaff), 'silo' (a row of beehive granaries on a platform, a stone on each filling hole,
 * a ladder), 'midden' (ash and sherds, dung cakes stacked to dry), 'threshing' (a beaten floor, a heap of grain,
 * winnowing mats, a sledge with its teeth).
 */
export function yard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 7), W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const seg = (a, b, hh, mat = 'mudbrick', th = 0.3) => { const t = []; beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], th / 2, hh); bag.add(mat, fromTriangles(t)); col.segment(a, b, th, 0, hh); };
  const k = el.kind;
  if (k === 'pen') {
    const gx = x0 + W * (0.3 + rand() * 0.4), gw = 1.3;
    seg([x0, z0], [x1, z0], 1.15); seg([x0, z0], [x0, z1], 1.15); seg([x1, z0], [x1, z1], 1.15);
    seg([x0, z1], [gx - gw / 2, z1], 1.15); seg([gx + gw / 2, z1], [x1, z1], 1.15);
    bag.add('timber', box(gx - gw / 2 - 0.1, 1.2, z1 - 0.15, gx + gw / 2 + 0.1, 1.32, z1 + 0.15));
    bag.add('banco_rough', box(x0 + 0.2, 0, z0 + 0.2, x1 - 0.2, 0.015, z1 - 0.2));
    bag.add('mud_plaster', box(x0 + 0.5, 0, z0 + 0.4, x0 + 0.5 + Math.min(2.6, W * 0.4), 0.28, z0 + 0.8));     // the trough
    bag.add('wicker', box(x0 + 0.6, 0.28, z0 + 0.46, x0 + 0.5 + Math.min(2.6, W * 0.4) - 0.1, 0.34, z0 + 0.74));
    bag.add('thatch', lathe([[0.9, 0], [0.8, 0.25], [0.4, 0.5], [0.001, 0.58]], 9, null, x1 - 1.3, 0, z0 + 1.2));
    for (let i = 0; i < 4; i++) bag.add('thatch', lathe([[0.4, 0], [0.001, 0.05]], 7, null, cx + (rand() - 0.5) * W * 0.6, 0, cz + (rand() - 0.5) * D * 0.5));
    return;
  }
  if (k === 'brickyard') {
    // the pit of wet clay and chaff, dark, with a rim; rows of bricks on edge to dry, stacks laid crosswise
    const px = x0 + 1.0, pz = z0 + 1.0, pw = Math.min(3.0, W * 0.4), pd = Math.min(2.2, D * 0.35);
    bag.add('mud_plaster', box(px - 0.2, 0, pz - 0.2, px + pw + 0.2, 0.22, pz + pd + 0.2));
    bag.add('plaster_damp', box(px, 0.2, pz, px + pw, 0.215, pz + pd));
    col.rect([px - 0.2, pz - 0.2, px + pw + 0.2, pz + pd + 0.2], 0, 0.22);
    const bw = 0.34, bh = 0.16, bl = 0.17;
    for (let r = 0; r < 5; r++) {
      const zz = z0 + 0.8 + r * 0.7; if (zz > z1 - 0.8) break;
      const x00 = x0 + pw + 1.8, n = Math.floor((x1 - x00 - 0.6) / (bw + 0.04));
      for (let i = 0; i < n; i++) if (rand() > 0.08) bag.add('mudbrick', box(x00 + i * (bw + 0.04), 0, zz, x00 + i * (bw + 0.04) + bw, bh, zz + bl * 2));
      if (r === 4) col.rect([x00, zz, x00 + n * (bw + 0.04), zz + bl * 2], 0, bh);
    }
    for (const [sx, sz] of [[x0 + 1.0, z1 - 2.3], [x0 + 3.0, z1 - 2.3]]) if (sz > pz + pd + 0.4) for (let c = 0; c < 4; c++) for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) bag.add('mudbrick', c % 2 ? box(sx + i * 0.3, c * 0.17, sz + j * 0.36, sx + i * 0.3 + 0.28, c * 0.17 + 0.16, sz + j * 0.36 + 0.34) : box(sx + j * 0.36 + (i > 1 ? 0 : 0), c * 0.17, sz + i * 0.3, sx + j * 0.36 + 0.34, c * 0.17 + 0.16, sz + i * 0.3 + 0.28));
    bag.add('timber', box(px + pw + 0.5, 0, pz + 0.2, px + pw + 0.5 + 0.38, 0.06, pz + 0.2 + 0.2));
    jar(bag, px + pw + 0.9, 0, pz + 0.3, 1.1); jar(bag, px + pw + 1.2, 0, pz + 0.7, 0.9);
    bag.add('thatch', lathe([[0.8, 0], [0.7, 0.2], [0.001, 0.5]], 9, null, px + pw + 1.0, 0, z1 - 1.0));
    return;
  }
  if (k === 'silo') {
    bag.add('mudbrick', box(x0 + 0.4, 0, z0 + 0.4, x1 - 0.4, 0.3, z1 - 0.4)); col.rect([x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], 0, 0.3);
    const n = Math.max(2, Math.floor((W - 1.2) / 1.9)), rz = cz;
    for (let i = 0; i < n; i++) {
      const sx = x0 + 0.9 + (i + 0.5) * (W - 1.8) / n, r0 = 0.7 + rand() * 0.15;
      bag.add('mud_plaster', lathe([[r0, 0.3], [r0 + 0.05, 0.9], [r0, 1.7], [r0 * 0.6, 2.2], [0.2, 2.35], [0.2, 2.4], [0.001, 2.4]], 12, null, sx, 0, rz));
      bag.add('limestone_core', lathe([[0.001, 2.4], [0.28, 2.4], [0.26, 2.5], [0.001, 2.52]], 8, null, sx, 0, rz));
      col.circle(sx, rz, r0 + 0.05, 0, 2.4);
    }
    bag.add('timber', box(x0 + 0.6, 0.3, z1 - 0.9, x0 + 1.0, 2.0, z1 - 0.8)); bag.add('timber', box(x0 + 0.6, 0.3, z1 - 0.7, x0 + 1.0, 2.0, z1 - 0.6));
    for (let r = 0; r < 6; r++) bag.add('timber', box(x0 + 0.6, 0.45 + r * 0.28, z1 - 0.9, x0 + 1.0, 0.5 + r * 0.28, z1 - 0.6));
    bag.add('sacking', box(x1 - 1.6, 0.3, z1 - 1.0, x1 - 0.7, 0.55, z1 - 0.5));
    return;
  }
  if (k === 'threshing') {
    bag.add('mud_plaster', lathe([[0.001, 0.004], [Math.min(W, D) * 0.46, 0.004], [Math.min(W, D) * 0.47, 0.0]], 18, null, cx, 0, cz));
    bag.add('thatch', lathe([[1.1, 0], [0.9, 0.35], [0.4, 0.65], [0.001, 0.75]], 10, null, cx - 0.4, 0.005, cz));
    for (let i = 0; i < 3; i++) bag.add('reed_mat', box(cx + 0.8 + i * 0.5, 0.006, cz - 1.3 + i * 0.3, cx + 1.9 + i * 0.5, 0.02, cz - 0.4 + i * 0.3));
    for (let i = 0; i < 5; i++) bag.add('cloth_ochre', lathe([[0.18, 0], [0.12, 0.08], [0.001, 0.12]], 6, null, cx + 1.4 + (rand() - 0.5) * 1.4, 0.006, cz + 0.7 + (rand() - 0.5) * 1.0));
    post(bag, x0 + 0.6, 0, 1.6, z0 + 0.6, 0.06); post(bag, x0 + 0.6, 0, 1.4, z0 + 1.8, 0.06); bag.add('timber', box(x0 + 0.5, 1.4, z0 + 0.5, x0 + 0.7, 1.5, z0 + 1.9));
    bag.add('timber', box(x1 - 2.4, 0.04, z1 - 1.4, x1 - 0.8, 0.14, z1 - 0.8)); bag.add('limestone_core', box(x1 - 2.2, 0.14, z1 - 1.3, x1 - 1.0, 0.2, z1 - 0.9));
    return;
  }
  // midden: ash, sherds, dung cakes stacked in a low wall to dry, bones, a broken quern
  bag.add('plaster_grey', lathe([[1.6, 0], [1.2, 0.18], [0.5, 0.34], [0.001, 0.4]], 10, null, x0 + 1.8, 0, z0 + 1.6));
  for (let i = 0; i < 12; i++) { const sx = x0 + 0.5 + rand() * (W - 1), sz = z0 + 0.5 + rand() * (D - 1); blockAt(bag, rand() < 0.5 ? 'terracotta' : 'pottery_dark', sx, 0, sz, rand() * 3, 0.07 + rand() * 0.07, 0.012, 0.05 + rand() * 0.06); }
  const dz = z1 - 0.7;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 8 - r; i++) bag.add('banco_rough', box(x1 - 0.5 - (i + 1) * 0.3 - r * 0.15, r * 0.1, dz, x1 - 0.5 - i * 0.3 - r * 0.15 - 0.04, r * 0.1 + 0.09, dz + 0.3));
  col.rect([x1 - 3.0, dz, x1 - 0.5, dz + 0.3], 0, 0.35);
  jar(bag, x1 - 3.4, 0, z0 + 1.0, 0.9, 'pottery_dark');
}

/** ok_lane { items: [[x, z, kind, rot, seed]] }: the lane's furniture. kind 'stand' (the public water jars on a mud platform under a reed shade), 'ash', 'sherds', 'bench', 'pots' (jars drying upturned), 'wood' (a stack of palm logs and ribs), 'basket'. */
export function lane(el, { bag, col }) {
  for (const [x, z, kind, rot = 0, seed = 1] of el.items) {
    const rand = rng(seed * 3 + 1);
    if (kind === 'stand') {
      bag.add('mud_plaster', box(x - 0.55, 0, z - 0.4, x + 0.55, 0.35, z + 0.4)); col.rect([x - 0.55, z - 0.4, x + 0.55, z + 0.4], 0, 0.35);
      for (const dx of [-0.3, 0, 0.3]) { jar(bag, x + dx, 0.35, z, 1.0 + rand() * 0.3, rand() < 0.4 ? 'pottery_dark' : 'terracotta'); }
      for (const dx of [-0.55, 0.55]) post(bag, x + dx, 0, 2.0, z - 0.4, 0.05);
      bag.add('reed_mat', box(x - 0.7, 2.0, z - 0.55, x + 0.7, 2.05, z + 0.45));
    } else if (kind === 'ash') {
      bag.add('plaster_grey', lathe([[0.7, 0], [0.45, 0.1], [0.001, 0.18]], 8, null, x, 0, z));
      blockAt(bag, 'terracotta', x + 0.6, 0, z + 0.2, rand() * 3, 0.1, 0.012, 0.07);
    } else if (kind === 'sherds') {
      for (let i = 0; i < 6; i++) blockAt(bag, rand() < 0.5 ? 'terracotta' : 'pottery_dark', x + (rand() - 0.5) * 1.2, 0, z + (rand() - 0.5) * 0.9, rand() * 3, 0.06 + rand() * 0.08, 0.012, 0.05 + rand() * 0.05);
    } else if (kind === 'bench') {
      const c = Math.cos(rot), s = Math.sin(rot);
      blockAt(bag, 'mud_plaster', x, 0, z, rot, 0.8, 0.19, 0.22);
      if (rand() < 0.5) jar(bag, x + c * 0.3, 0.38, z + s * 0.3, 0.5);
    } else if (kind === 'pots') {
      for (let i = 0; i < 4; i++) { const g = lathe(JAR.map(([r, h]) => [r * 0.8, h * 0.8]), 9); g.rotateX(Math.PI); g.translate(x + (i % 2) * 0.36, 0.44, z + Math.floor(i / 2) * 0.36); bag.add('terracotta', g); }
    } else if (kind === 'wood') {
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) bag.add('palm_trunk', lathe([[0.075, 0], [0.075, 1.2]], 6).rotateX(Math.PI / 2).translate(x - 0.3 + i * 0.16 + r * 0.08, 0.08 + r * 0.14, z - 0.6));
      col.rect([x - 0.35, z - 0.6, x + 0.4, z + 0.6], 0, 0.5);
    } else if (kind === 'basket') {
      bag.add('wicker', lathe([[0.001, 0], [0.22, 0.01], [0.28, 0.28], [0.25, 0.3], [0.001, 0.05]], 9, null, x, 0, z));
      for (let i = 0; i < 3; i++) bag.add('cloth_ochre', lathe([[0.09, 0], [0.001, 0.07]], 6, null, x - 0.1 + i * 0.1, 0.28, z));
    }
  }
}

/**
 * ok_cemetery { items: [{ kind, x, z, rot, seed, a, b }] }: the cemetery's work and wear. 'unfinished' (a tomb in the
 * building: its stepped core at a few courses, an earth-and-rubble ramp up one side, casing blocks stacked, a
 * timber lever and rollers), 'shaft' (a shaft tomb: a low rubble rectangle with its square mouth black and the stone that
 * covers it set beside), 'blocks' (casing blocks stacked), 'shade' (the masons' shelter of poles and reed mat, jars, a mat),
 * 'offering' (a limestone offering table with loaves and a jar, a reed fan), 'cache' (a tool basket and a mallet
 * and chisels laid on a cloth).
 */
export function cemetery(el, { bag, col }) {
  for (const it of el.items) {
    const { x, z, kind } = it, rand = rng((it.seed || 1) * 3 + 7), rot = it.rot || 0;
    if (kind === 'unfinished') {
      const a = it.a ?? 4.8, b0 = it.b ?? 10, b = b0 - 1.5, n = 3 + Math.floor(rand() * 2), zc = z - 1.5;
      for (let k = 0; k < n; k++) { const i = 0.15 * k; bag.add('limestone_core', box(x - a + i, k ? 0.8 * k : -0.3, zc - b + i, x + a - i, 0.8 * (k + 1), zc + b - i)); }
      col.rect([x - a, zc - b, x + a, zc + b], 0, 0.8 * n);
      // the foot of the ramp of earth and rubble at the south end: four steps rising to the core's side
      for (let s = 0; s < 4; s++) { const r = [x - 1.3, zc + b + (3 - s) * 0.75, x + 1.3, zc + b + (4 - s) * 0.75]; bag.add('rubble', box(r[0], -0.1, r[1], r[2], 0.25 * (s + 1), r[3])); col.rect(r, 0, 0.25 * (s + 1)); }
      bag.add('rubble', box(x - 1.3, -0.1, zc + b - 0.1, x + 1.3, 1.0, zc + b + 0.0));
      for (let s = 0; s < 2; s++) blockAt(bag, 'tura_limestone', x + a + 1.6, s * 0.5, z - 3 + rand() * 6, rand() * 0.3, 0.7, 0.25, 0.5);
      continue;
    }
    if (kind === 'shaft') {
      const a = it.a ?? 1.4, b = it.b ?? 2.2, c = Math.cos(rot), s = Math.sin(rot);
      blockAt(bag, 'limestone_core', x, -0.1, z, rot, a, 0.55, b);
      bag.add('basalt', box(x - 0.45, 0.45, z - 0.45, x + 0.45, 0.455, z + 0.45));
      blockAt(bag, 'tura_limestone', x + 1.9 * c, 0, z + 1.9 * s, rot + 0.4, 0.5, 0.12, 0.35);
      col.rect([x - a - 0.1, z - b - 0.1, x + a + 0.1, z + b + 0.1], 0, 1.0);
      continue;
    }
    if (kind === 'blocks') {
      const n = 3 + Math.floor(rand() * 4);
      for (let i = 0; i < n; i++) blockAt(bag, rand() < 0.5 ? 'tura_limestone' : 'limestone_core', x + (i % 3) * 1.35 * Math.cos(rot) , Math.floor(i / 3) * 0.7, z + (i % 3) * 1.35 * Math.sin(rot), rot + (rand() - 0.5) * 0.12, 0.65, 0.34, 0.5);
      col.rect([x - 0.8, z - 0.8, x + 3.5, z + 0.8], 0, 0.7 * Math.ceil(n / 3));
      continue;
    }
    if (kind === 'shade') {
      for (const [dx, dz] of [[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]]) post(bag, x + dx, 0, 2.0, z + dz, 0.05);
      bag.add('reed_mat', box(x - 1.5, 2.0, z - 1.2, x + 1.5, 2.06, z + 1.2));
      bag.add('reed_mat', box(x - 1.0, 0.005, z - 0.6, x + 1.0, 0.02, z + 0.6));
      jar(bag, x + 1.1, 0, z - 0.8, 1.0); jar(bag, x + 1.1, 0, z - 0.4, 0.8, 'pottery_dark'); jar(bag, x - 1.1, 0, z + 0.7, 0.9);
      bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.25, 0.25], [0.001, 0.02]], 8, null, x - 0.5, 0.02, z + 0.1));
      continue;
    }
    if (kind === 'offering') {
      bag.add('limestone_core', box(x - 0.4, 0, z - 0.4, x + 0.4, 0.5, z + 0.4)); col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], 0, 0.5);
      bag.add('limestone_carved', box(x - 0.46, 0.5, z - 0.46, x + 0.46, 0.56, z + 0.46));
      for (let k = 0; k < 5; k++) bag.add('limewash_yellow', lathe([[0.06, 0], [0.065, 0.03], [0.04, 0.07], [0.001, 0.08]], 8, null, x - 0.25 + k * 0.11, 0.56, z - 0.1 + (k % 2) * 0.16));
      jar(bag, x + 0.2, 0.56, z + 0.25, 0.4);
      continue;
    }
    if (kind === 'cache') {
      bag.add('cloth_white', box(x - 0.5, 0.005, z - 0.35, x + 0.5, 0.02, z + 0.35));
      bag.add('timber', box(x - 0.3, 0.02, z - 0.05, x + 0.1, 0.1, z + 0.05)); bag.add('timber', box(x - 0.34, 0.02, z - 0.1, x - 0.28, 0.14, z + 0.1));
      bag.add('bronze', box(x + 0.15, 0.02, z - 0.2, x + 0.4, 0.035, z - 0.17)); bag.add('bronze', box(x + 0.15, 0.02, z + 0.1, x + 0.38, 0.035, z + 0.13));
      bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.25, 0.25], [0.001, 0.02]], 8, null, x + 0.8, 0, z));
    }
  }
}

/** ok_magazines { rect: [x0, z0, x1, z1] (the row), side: 'n' | 's' (the way its doors face), n }: the storerooms along the court's inner wall, each 5.6 × 5 m, mudbrick and mud, a door, a log roof, within it rows of jars, a grain bin and a shelf of linen. */
export function magazines(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, n = el.n, w = (x1 - x0) / n, th = 0.5, H = 3.0, south = el.side === 's';
  const f = south ? z1 : z0, back = south ? z0 : z1, sgn = south ? 1 : -1, rand = rng(el.seed || 5);
  const W = (r, y0, y1, mat = 'mudbrick') => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  for (let i = 0; i <= n; i++) { const x = x0 + i * w; W([x - th / 2, Math.min(f, back), x + th / 2, Math.max(f, back)], 0, H, 'mud_plaster'); }
  W([x0, Math.min(back, back + sgn * -th), x1, Math.max(back, back - sgn * th)], 0, H, 'mud_plaster');
  const dw = 1.0;
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * w, xb = xa + w, xd = (xa + xb) / 2, zf0 = south ? f - th : f, zf1 = south ? f : f + th;
    W([xa + th / 2, zf0, xd - dw / 2, zf1], 0, H, 'mud_plaster'); W([xd + dw / 2, zf0, xb - th / 2, zf1], 0, H, 'mud_plaster'); W([xd - dw / 2, zf0, xd + dw / 2, zf1], 2.0, H, 'mud_plaster');
    bag.add('palm_trunk', box(xd - dw / 2 - 0.2, 1.9, zf0 - 0.04, xd + dw / 2 + 0.2, 2.05, zf1 + 0.04));
    bag.add('limestone_core', box(xd - dw / 2, 0, south ? zf1 : zf0 - 0.3, xd + dw / 2, 0.09, south ? zf1 + 0.3 : zf0));
    const logs = []; for (let x = xa + th; x < xb - th / 2; x += 0.28) beamTris(logs, [x, H - 0.12, Math.min(f, back)], [x, H - 0.12, Math.max(f, back)], 0.1, 0.12);
    bag.add('palm_trunk', fromTriangles(logs));
    bag.add('mud_plaster', box(xa, H, Math.min(f, back) - 0.1, xb, H + 0.28, Math.max(f, back) + 0.1)); col.floor([xa, Math.min(f, back), xb, Math.max(f, back)], H + 0.28);
    // within: along the back wall rows of tall jars sealed with mud, a grain bin (a mud box with a plank lid), a shelf of linen bolts on the side wall
    const iz = back - sgn * th / 2 * -1, kind = Math.floor(rand() * 3), zi = south ? back + th / 2 : back - th / 2, dir = south ? 1 : -1;
    void iz;
    if (kind !== 1) for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { const jx = xa + th / 2 + 0.45 + k * 0.9; if (jx > xb - 0.5) break; jar(bag, jx, 0, zi + dir * (0.3 + r * 0.55), 1.15, 'terracotta', BEER); bag.add('mud_plaster', lathe([[0.09, 0], [0.09, 0.03], [0.06, 0.1], [0.001, 0.12]], 8, null, jx, 0.87, zi + dir * (0.3 + r * 0.55))); }
    if (kind === 1) {
      const bx = xa + th / 2 + 0.3; bag.add('mud_plaster', box(bx, 0, Math.min(zi, zi + dir * 1.6), bx + 1.6, 0.9, Math.max(zi, zi + dir * 1.6))); col.rect([bx, Math.min(zi, zi + dir * 1.6), bx + 1.6, Math.max(zi, zi + dir * 1.6)], 0, 0.9);
      bag.add('timber', box(bx + 0.05, 0.9, Math.min(zi, zi + dir * 1.6) + 0.05, bx + 1.55, 0.95, Math.max(zi, zi + dir * 1.6) - 0.05));
      bag.add('mud_plaster', box(bx + 2.0, 0, Math.min(zi, zi + dir * 1.6), bx + 3.2, 0.9, Math.max(zi, zi + dir * 1.6)));
      col.rect([bx + 2.0, Math.min(zi, zi + dir * 1.6), bx + 3.2, Math.max(zi, zi + dir * 1.6)], 0, 0.9);
    }
    const sx = xb - th / 2 - 0.3, zs = (f + back) / 2;
    bag.add('timber', box(sx - 0.02, 1.4, zs - 1.0, sx + 0.3, 1.45, zs + 1.0));
    for (let k = 0; k < 4; k++) bag.add('cloth_white', box(sx - 0.0, 1.45, zs - 0.9 + k * 0.45, sx + 0.28, 1.6, zs - 0.6 + k * 0.45));
    bag.add('reed_mat', box(xa + th / 2 + 0.3, 0.005, (f + back) / 2 - 0.5, xa + th / 2 + 1.8, 0.02, (f + back) / 2 + 0.5));
  }
}

/** ok_quay { rect: [x0, z0, x1, z1] (the quay's strip, its west 1.8 m for goods, the rest left for walking), y, seed }: the quay's goods and furniture — mooring posts on the water side with their rope coils, stacks of cedar logs, grain heaps and sacks, jars stood in rows, a net hung to dry on poles, the reed boat on trestles. */
export function quay(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 11);
  const along = (t) => z0 + (z1 - z0) * t, ex = x1 - 0.3;
  for (let t = 0.04; t < 1; t += 0.07) {
    const z = along(t);
    bag.add('palm_trunk', lathe([[0.12, y], [0.11, y + 0.7], [0.14, y + 0.76], [0.001, y + 0.8]], 7, null, ex, 0, z)); col.circle(ex, z, 0.13, y, y + 0.8);
    if (rand() < 0.5) bag.add('rope_fibre', lathe([[0.17, y + 0.3], [0.17, y + 0.4], [0.13, y + 0.4], [0.13, y + 0.3]], 8, null, ex, 0, z));
  }
  const slots = [0.1, 0.27, 0.44, 0.61, 0.78], kinds = ['logs', 'grain', 'jars', 'net', 'jars'];
  slots.forEach((t, n) => {
    const z = along(t), k = kinds[(n + Math.floor(rand() * 5)) % 5];
    if (k === 'logs') { for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) bag.add('cedar', lathe([[0.2, 0], [0.19, 3.2]], 7).rotateX(Math.PI / 2).translate(x0 + 0.35 + i * 0.4 + r * 0.2, y + 0.2 + r * 0.34, z - 1.6)); col.rect([x0, z - 1.7, x0 + 1.5, z + 1.7], y, y + 1.0); }
    else if (k === 'grain') { bag.add('thatch', lathe([[0.9, 0], [0.8, 0.35], [0.4, 0.65], [0.001, 0.75]], 10, null, x0 + 0.95, y, z)); for (let q = 0; q < 3; q++) bag.add('sacking', lathe([[0.001, 0], [0.26, 0.02], [0.28, 0.2], [0.18, 0.4], [0.001, 0.42]], 8, null, x0 + 0.4 + (q % 2) * 0.55, y, z + 1.3 + q * 0.2)); col.circle(x0 + 0.95, z, 0.9, y, y + 0.7); }
    else if (k === 'jars') { for (let r = 0; r < 2; r++) for (let q = 0; q < 6; q++) jar(bag, x0 + 0.4 + r * 0.5, y, z - 1.2 + q * 0.45, 1.2, rand() < 0.3 ? 'pottery_dark' : 'terracotta', BEER); col.rect([x0, z - 1.4, x0 + 1.3, z + 1.4], y, y + 0.9); }
    else {
      for (const dz of [-1.8, 1.8]) post(bag, x0 + 0.15, y, y + 2.2, z + dz, 0.05);
      bag.add('timber', box(x0 + 0.1, y + 2.15, z - 1.85, x0 + 0.2, y + 2.25, z + 1.85));
      for (let i = 0; i < 12; i++) bag.add('rope_fibre', box(x0 + 0.16, y + 0.6 + (i % 3) * 0.5, z - 1.75 + i * 0.3, x0 + 0.19, y + 2.15, z - 1.45 + i * 0.3));
    }
  });
  const z2 = along(0.93);
  for (const dz of [-1.0, 1.0]) bag.add('timber', box(x0 + 0.5, y, z2 + dz - 0.1, x0 + 1.2, y + 0.6, z2 + dz + 0.1));
  const t = []; beamTris(t, [x0 + 0.85, y + 0.65, z2 - 2.2], [x0 + 0.85, y + 0.65, z2 + 2.2], 0.45, 0.3); bag.add('papyrus', fromTriangles(t));
  col.rect([x0 + 0.3, z2 - 2.3, x0 + 1.4, z2 + 2.3], y, y + 0.95);
}
