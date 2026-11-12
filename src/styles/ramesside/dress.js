// The dressing of Abu Simbel at eye level (docs/settlements/abu-simbel.md §13): the terrace before the great façade (benches along the enclosure,
// offering tables before the colossi, braziers, the washing basins, the pilgrims' shades, the sand banked against the mudbrick), the lanes (washing on
// lines from wall to wall, the market street under its reed shades, the talus at the cliff's foot), the quay (blocks and sacks and jars waiting to
// be carried up, nets on poles, the store of mud), the masons' yard, the shadufs on the bank, the furnishing of the temples' halls.

import { box, lathe, fromTriangles, clothBox, addCloth, frustum } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { put } from './great.js';
import { baboon } from './statues.js';
import { rng } from './util.js';
import { greatRooms, FLOOR } from './dims.js';

const post = (bag, x, y0, y1, z, r = 0.05, mat = 'palm_trunk') => bag.add(mat, lathe([[r, y0], [r * 0.9, y1], [0.001, y1]], 6, null, x, 0, z));
const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const jar = (bag, x, y, z, s = 1, mat = 'terracotta', prof = JAR) => bag.add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), 9, null, x, y, z));
const mound = (bag, mat, x, y, z, rx, h, rz) => bag.add(mat, lathe([[1, 0], [0.8, 0.2], [0.45, 0.62], [0.001, 1]], 9).scale(rx, h, rz).translate(x, y, z));
/** A lying cylinder along x. */
function lying(bag, mat, x0, x1, y, z, r) { const g = lathe([[r, 0], [r, x1 - x0], [0.001, x1 - x0]], 8); g.rotateZ(-Math.PI / 2); g.translate(x0, y, z); bag.add(mat, g); }
/** A turned box: centre, half-sizes, y range, angle about y. */
function turned(bag, mat, cx, cz, a, b, y0, y1, ang) {
  const ux = Math.cos(ang), uz = Math.sin(ang), t = [], P = (s, r, y) => [cx + ux * s - uz * r, y, cz + uz * s + ux * r], q = [[-a, -b], [a, -b], [a, b], [-a, b]];
  for (let i = 0; i < 4; i++) { const p0 = q[i], p1 = q[(i + 1) % 4]; t.push(...P(...p0, y0), ...P(...p1, y0), ...P(...p1, y1), ...P(...p0, y0), ...P(...p1, y1), ...P(...p0, y1)); }
  t.push(...P(...q[0], y1), ...P(...q[2], y1), ...P(...q[1], y1), ...P(...q[0], y1), ...P(...q[3], y1), ...P(...q[2], y1));
  // wind every face outward
  for (let i = 0; i < t.length; i += 9) {
    const A = t.slice(i, i + 3), B = t.slice(i + 3, i + 6), C = t.slice(i + 6, i + 9);
    const n = [(B[1] - A[1]) * (C[2] - A[2]) - (B[2] - A[2]) * (C[1] - A[1]), (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]), (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])];
    const m = [(A[0] + B[0] + C[0]) / 3 - cx, (A[1] + B[1] + C[1]) / 3 - (y0 + y1) / 2, (A[2] + B[2] + C[2]) / 3 - cz];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  bag.add(mat, fromTriangles(t));
}

/** A bench of dressed stone: two slabs and a seat, centred (x, z), length L along x, facing +z when s = 1. */
function bench(bag, col, x, z, L, y, s = 1) {
  for (const dx of [-L / 2 + 0.15, L / 2 - 0.15]) bag.add('sandstone_dressed', box(x + dx - 0.12, y, z - 0.25, x + dx + 0.12, y + 0.4, z + 0.25));
  bag.add('sandstone_dressed', box(x - L / 2, y + 0.4, z - 0.3, x + L / 2, y + 0.48, z + 0.3));
  bag.add('sandstone_dressed', box(x - L / 2, y + 0.48, z - 0.3 * s - (s > 0 ? 0.0 : 0.06), x + L / 2, y + 0.9, z - 0.3 * s + (s > 0 ? 0.06 : 0.0)));        // the back against the wall
  col.rect([x - L / 2, z - 0.3, x + L / 2, z + 0.3], y, y + 0.9);
}
/** A small offering table with loaves, a jar and flowers. */
function offering(bag, col, x, z, y, rand) {
  bag.add('sandstone_dressed', box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.14, z + 0.55)); bag.add('sandstone_dressed', box(x - 0.18, y + 0.14, z - 0.18, x + 0.18, y + 0.8, z + 0.18)); bag.add('sandstone_dressed', box(x - 0.5, y + 0.8, z - 0.5, x + 0.5, y + 0.9, z + 0.5));
  col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y, y + 0.9);
  for (let k = 0; k < 5; k++) bag.add('limestone_yellow', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.04], [0.001, 0.07]], 8, null, x - 0.3 + (k % 3) * 0.28 + rand() * 0.04, y + 0.9, z - 0.25 + Math.floor(k / 3) * 0.3));
  jar(bag, x + 0.28, y + 0.9, z + 0.28, 0.7, 'terracotta'); bag.add('papyrus', lathe([[0.02, 0], [0.02, 0.5], [0.001, 0.52]], 5, null, x + 0.28, y + 1.3, z + 0.28));
  bag.add('cloth_green', lathe([[0.001, 0], [0.09, 0.05], [0.001, 0.1]], 6, null, x + 0.28, y + 1.78, z + 0.28));
}
/** A bronze tripod brazier with its glowing bowl. */
function brazier(bag, col, x, z, y) {
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; bag.add('bronze', lathe([[0.025, 0], [0.02, 0.62], [0.001, 0.62]], 5).rotateZ(0).translate(0, 0, 0).translate(x + Math.cos(a) * 0.22, y, z + Math.sin(a) * 0.22)); }
  bag.add('bronze', lathe([[0.001, 0.6], [0.24, 0.62], [0.28, 0.78], [0.25, 0.8], [0.001, 0.7]], 12, null, x, y, z)); bag.add('flame', lathe([[0.001, 0.76], [0.2, 0.77], [0.001, 0.8]], 10, null, x, y, z));
  col.circle(x, z, 0.28, y, y + 0.8);
}

/**
 * The terrace's furniture { x0, x1, z0, z1 (the paved rect), y, gates: [x] (the gaps in the walls: no bench), seed }: benches along the enclosure walls,
 * offering tables before the colossi, braziers, two basins for the washing of the priests, two pilgrims' shades, sand against the walls.
 */
export function terraceDress(el, { bag, col }) {
  const { x0, x1, z0, z1, y } = el, rand = rng(el.seed || 31), gates = el.gates ?? [];
  // benches along both walls, between the gates
  for (const [zw, s] of [[z0 + 1.9, 1], [z1 - 1.9, -1]]) for (let x = x0 + 5; x < x1 - 8; x += 6.5) {
    if (gates.some((g) => Math.abs(x - g) < 3.6)) continue;
    bench(bag, col, x, zw, 2.6, y, s);
    if (rand() < 0.5) jar(bag, x + 1.7, y, zw + (s > 0 ? 0.0 : 0.0), 0.8, 'terracotta');
  }
  // the offering tables before the four colossi, a brazier between each pair
  for (const zc of el.colossi ?? [-13.7, -5.9, 5.9, 13.7]) offering(bag, col, x0 + 11.5, zc, y, rand);
  for (const zc of [-9.8, 9.8]) brazier(bag, col, x0 + 14.5, zc, y);
  // the washing basins: a ring of stone with a dark water, the jars on their stand
  for (const zb of [-17, 17]) {
    const bx = x0 + 22, bz = zb;
    bag.add('sandstone_dressed', lathe([[0.9, 0], [0.9, 0.5], [0.75, 0.5], [0.75, 0.12], [0.001, 0.12]], 18, null, bx, y, bz)); col.circle(bx, bz, 0.9, y, y + 0.5);
    bag.add('pottery_dark', lathe([[0.74, 0.4], [0.001, 0.4]], 18, null, bx, y, bz));
    for (let k = 0; k < 3; k++) jar(bag, bx + 1.5 + (k % 2) * 0.35, y, bz - 0.3 + k * 0.35, 1.0, k === 1 ? 'pottery_dark' : 'terracotta');
  }
  // the pilgrims' shades: four poles, a roof of reed mats, a bench under it
  for (const [sx, sz] of [[x0 + 14, -23.8], [x0 + 14, 23.8]]) {
    for (const [dx, dz] of [[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]]) { post(bag, sx + dx, y, y + 2.7, sz + dz, 0.07); col.circle(sx + dx, sz + dz, 0.08, y, y + 2.7); }
    bag.add('reed_mat', box(sx - 2.1, y + 2.7, sz - 1.5, sx + 2.1, y + 2.78, sz + 1.5));
    for (const dz of [-1.2, 0, 1.2]) bag.add('timber', box(sx - 2.0, y + 2.62, sz + dz - 0.04, sx + 2.0, y + 2.7, sz + dz + 0.04));
    bag.add('mud_plaster', box(sx - 1.6, y, sz + (sz < 0 ? -0.9 : 0.5), sx + 1.6, y + 0.42, sz + (sz < 0 ? -0.5 : 0.9))); col.rect([sx - 1.6, sz + (sz < 0 ? -0.9 : 0.5), sx + 1.6, sz + (sz < 0 ? -0.5 : 0.9)], y, y + 0.42);
    bag.add('reed_mat', box(sx - 1.2, y + 0.42, sz + (sz < 0 ? -0.85 : 0.55), sx + 0.2, y + 0.45, sz + (sz < 0 ? -0.55 : 0.85)));
  }
  // two mud-brick-and-sandstone stelae on the axis before the sun altar's way, a royal cartouche panel each (a pillar of dressed stone, a cavetto)
  for (const zs of [-9.8, 9.8]) { bag.add('sandstone_dressed', box(x0 + 33, y, zs - 0.5, x0 + 34, y + 0.5, zs + 0.5)); bag.add('sandstone_dressed', box(x0 + 33.2, y + 0.5, zs - 0.3, x0 + 33.8, y + 2.4, zs + 0.3)); bag.add('sandstone_relief', box(x0 + 33.15, y + 0.9, zs - 0.22, x0 + 33.2, y + 2.1, zs + 0.22)); col.rect([x0 + 33, zs - 0.5, x0 + 34, zs + 0.5], y, y + 2.4); }
  // sand banked along both walls' feet, drifted over the paving at the gates and corners; flakes of fallen stone
  for (const zw of [z0 + 0.3, z1 - 0.3]) for (let x = x0 + 1; x < x1 - 1; x += 2.2 + rand() * 2.5) mound(bag, 'sandstone_yellow', x, y - 0.02, zw + (zw < 0 ? 0.4 : -0.4), 1.2 + rand() * 1.4, 0.1 + rand() * 0.22, 0.6 + rand() * 0.5);
  for (let k = 0; k < 22; k++) mound(bag, 'sandstone_yellow', x0 + 2 + rand() * (x1 - x0 - 6), y - 0.02, z0 + 3 + rand() * (z1 - z0 - 6), 0.5 + rand() * 1.1, 0.025 + rand() * 0.05, 0.4 + rand() * 0.7);
  for (let k = 0; k < 14; k++) turned(bag, 'sandstone_dressed', x0 + 1 + rand() * (x1 - x0 - 4), z0 + 1 + rand() * (z1 - z0 - 2), 0.08 + rand() * 0.14, 0.05 + rand() * 0.1, y, y + 0.04 + rand() * 0.07, rand() * 3);
}

/** The talus at the cliff's foot, sand and fallen blocks: { pts: [[x, z]] (places along the foot), seed }. */
export function talus(el, { bag }) {
  const rand = rng(el.seed || 17);
  for (const [px, z] of el.pts) {
    const x = px + 0.6 + rand() * 0.6;
    mound(bag, 'sandstone_yellow', x, -0.05, z, 1.4 + rand() * 1.2, 0.5 + rand() * 1.2, 1.5 + rand() * 1.6);
    if (rand() < 0.5) turned(bag, 'sandstone_yellow', x + 1.0 + rand() * 0.8, z + (rand() - 0.5) * 2, 0.3 + rand() * 0.4, 0.25 + rand() * 0.3, -0.05, 0.3 + rand() * 0.5, rand() * 3);
  }
}

/**
 * The lanes' dressing { lanes: [{ r, kind }], market: rect, seed }: washing on lines from wall to wall across the lanes, the market street under its
 * reed shades (beams across from roof to roof, mats on them in strips), sand drifted in the lane ends.
 */
export function laneDress(el, { bag }) {
  const rand = rng(el.seed || 23);
  for (const L of el.lanes) {
    const [x0, z0, x1, z1] = L.r;
    if (L.kind === 'cross') {
      // a line across the cross lane at about every 14 m: rope from wall to wall, cloths hung
      for (let z = z0 + 6 + rand() * 6; z < z1 - 3; z += 12 + rand() * 6) {
        const xm = (x0 + x1) / 2, y = 2.35;
        bag.add('rope_fibre', box(x0 - 0.1, y, z - 0.008, x1 + 0.1, y + 0.016, z + 0.008));
        for (let k = 0, x = x0 + 0.25; x < x1 - 0.55; x += 0.75, k++) addCloth(bag, ['cloth_white', 'linen', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][Math.floor(rand() * 5)], clothBox(x, y - 0.4 - rand() * 0.55, z - 0.015, x + 0.6, y, z + 0.015), y);
        void xm;
      }
    } else if (L.kind === 'lane') {
      for (let x = x0 + 7 + rand() * 6; x < x1 - 4; x += 16 + rand() * 8) {
        const y = 2.45, za = z0 + 0.15, zb = z1 - 0.15;
        bag.add('rope_fibre', box(x - 0.008, y, za, x + 0.008, y + 0.016, zb));
        for (let z = za + 0.3; z < zb - 0.7; z += 0.9) addCloth(bag, ['cloth_white', 'linen', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], clothBox(x - 0.015, y - 0.45 - rand() * 0.5, z, x + 0.015, y, z + 0.7), y);
      }
    }
  }
  // the market street: beams across at every 5 m, resting on the shops' walls (y 3.0 is above any head), reed mats laid over them in strips
  if (el.market) {
    const [x0, z0, x1, z1] = el.market;
    for (let x = x0 + 2.5; x < x1 - 1; x += 4.6) {
      const t = []; beamTris(t, [x, 3.0, z0 - 0.2], [x, 3.0, z1 + 0.2], 0.07, 0.12); bag.add('palm_trunk', fromTriangles(t));
      if (rand() < 0.7) bag.add('reed_mat', box(x - 1.6, 3.12, z0 + 0.2, x + 1.6, 3.17, z1 - 0.2));
    }
    // a pole of the shade at the gate's end, strings of onions and dried fish hung from the beams
    for (let x = x0 + 5; x < x1 - 2; x += 4.6) for (let k = 0; k < 3; k++) { const z = z0 + 0.8 + k * 1.5; bag.add('rope_fibre', box(x + 0.15, 2.3, z, x + 0.17, 3.0, z + 0.02)); bag.add(k % 2 ? 'cloth_ochre' : 'hide_grey', lathe([[0.001, 0], [0.07, 0.05], [0.09, 0.15], [0.001, 0.3]], 7, null, x + 0.16, 2.0, z + 0.01)); }
  }
}

/** The quay's goods and its store { rect: [x0, z0, x1, z1], y, seed }: blocks of sandstone with their sledges, sacks, jars, rope, nets on poles, the mud store. */
export function quayDress(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed || 41);
  // a stack of cut sandstone blocks with a sledge beside, ropes coiled
  for (const [bx, bz, n] of [[x0 + 2, z0 + 5.0, 3], [x0 + 6.5, z1 - 2.6, 2]]) {
    for (let k = 0; k < n; k++) { const w = 1.0 + rand() * 0.3; turned(bag, 'sandstone_dressed', bx + (k % 2) * 1.5, bz + Math.floor(k / 2) * 1.3, w / 2 + 0.2, w / 2, y, y + 0.9 + rand() * 0.2, rand() * 0.3); col.rect([bx + (k % 2) * 1.5 - 0.7, bz + Math.floor(k / 2) * 1.3 - 0.6, bx + (k % 2) * 1.5 + 0.7, bz + Math.floor(k / 2) * 1.3 + 0.6], y, y + 1.0); }
    turned(bag, 'timber', bx + 3.6, bz, 1.4, 0.4, y + 0.06, y + 0.2, 0.05); for (const dz of [-0.3, 0.3]) turned(bag, 'timber', bx + 3.6, bz + dz, 1.5, 0.05, y, y + 0.08, 0.05);
    turned(bag, 'sandstone_dressed', bx + 3.6, bz, 0.7, 0.45, y + 0.2, y + 0.8, 0.05); col.rect([bx + 2.1, bz - 0.5, bx + 5.1, bz + 0.5], y, y + 0.8);
    bag.add('rope_fibre', lathe([[0.3, 0], [0.34, 0.1], [0.3, 0.2], [0.18, 0.2], [0.18, 0]], 12, null, bx + 5.8, y, bz + 0.6));
  }
  // sacks of grain and jars of oil and beer in heaps along the landward edge, a pile of reed bundles
  for (let k = 0; k < 9; k++) { const sx = x0 + 0.8 + (k % 3) * 0.6, sz = z0 + 6.5 + Math.floor(k / 3) * 0.5; bag.add('sacking', lathe([[0.25, 0], [0.3, 0.15], [0.27, 0.4], [0.12, 0.55], [0.001, 0.57]], 9, null, sx, y + (k > 5 ? 0.45 : 0), sz)); }
  col.rect([x0 + 0.4, z0 + 6.2, x0 + 2.4, z0 + 8.0], y, y + 0.9);
  for (let k = 0; k < 10; k++) jar(bag, x0 + 4.5 + (k % 5) * 0.45, y + (k > 4 ? 0.0 : 0), z1 - 8.4 + Math.floor(k / 5) * 0.45, 1.15, k % 3 === 0 ? 'pottery_dark' : 'terracotta', k % 4 === 0 ? [[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]] : JAR);
  col.rect([x0 + 4.2, z1 - 8.7, x0 + 6.8, z1 - 7.4], y, y + 0.8);
  for (let k = 0; k < 14; k++) bag.add('reed_mat', lathe([[0.1, 0], [0.1, 1.9], [0.001, 2.0]], 6).rotateZ(1.35).translate(x1 - 3.6 + (k % 5) * 0.12, y + 0.1 + Math.floor(k / 5) * 0.2, z1 - 4.0 + (k % 3) * 0.05));
  // fishermen's nets on poles at the water's edge, floats and a few fish drying on a rack
  for (const nz of [z0 + 1.0, z1 - 1.0]) {
    for (const dx of [0, 3.2]) { post(bag, x1 - 4.0 + dx * 0.4, y, y + 2.2, nz + dx * 0.0, 0.05); }
    addCloth(bag, 'rope_fibre', clothBox(x1 - 4.0, y + 0.8, nz - 0.02, x1 - 2.72, y + 2.1, nz + 0.02), y + 2.1);
  }
  bag.add('timber', box(x1 - 6.5, y + 1.5, z0 + 2.6, x1 - 3.5, y + 1.56, z0 + 2.7)); post(bag, x1 - 6.4, y, y + 1.56, z0 + 2.65); post(bag, x1 - 3.6, y, y + 1.56, z0 + 2.65);
  for (let k = 0; k < 7; k++) bag.add('hide_grey', box(x1 - 6.3 + k * 0.4, y + 0.95, z0 + 2.64, x1 - 6.2 + k * 0.4, y + 1.5, z0 + 2.68));
  // the store: a mud shed with a flat roof on the quay's north-west corner, a door to the south, jars stacked inside the door
  const sx0 = x0 + 0.4, sz0 = z0 + 0.1, sx1 = sx0 + 4.6, sz1 = sz0 + 3.2, th = 0.4, h = 2.7, dw0 = sx0 + 1.6, dw1 = sx0 + 2.7;
  const wall = (a0, b0, a1, b1) => { bag.add('mud_plaster', box(a0, y, b0, a1, y + h, b1)); col.rect([a0, b0, a1, b1], y, y + h); };
  wall(sx0, sz0, sx1, sz0 + th); wall(sx0, sz0 + th, sx0 + th, sz1); wall(sx1 - th, sz0 + th, sx1, sz1);
  wall(sx0 + th, sz1 - th, dw0, sz1); wall(dw1, sz1 - th, sx1 - th, sz1);
  bag.add('timber', box(dw0 - 0.2, y + 2.0, sz1 - th - 0.02, dw1 + 0.2, y + 2.18, sz1 + 0.02)); bag.add('mud_plaster', box(dw0, y + 2.18, sz1 - th, dw1, y + h, sz1));
  bag.add('timber', box(sx0 - 0.2, y + h, sz0 - 0.2, sx1 + 0.2, y + h + 0.12, sz1 + 0.2)); bag.add('mud_plaster', box(sx0 - 0.2, y + h + 0.12, sz0 - 0.2, sx1 + 0.2, y + h + 0.28, sz1 + 0.2));
  col.floor([sx0, sz0, sx1, sz1], y + h + 0.28);
  for (let k = 0; k < 6; k++) jar(bag, sx0 + 0.9 + (k % 3) * 0.45, y, sz0 + 0.8 + Math.floor(k / 3) * 0.45, 1.2, 'terracotta');
  for (let k = 0; k < 5; k++) bag.add('sacking', lathe([[0.25, 0], [0.3, 0.15], [0.27, 0.4], [0.12, 0.55], [0.001, 0.57]], 9, null, sx0 + 3.0 + (k % 2) * 0.6, y + (k > 2 ? 0.5 : 0), sz0 + 0.8 + Math.floor(k / 2) * 0.5));
  bag.add('mudbrick', box(sx0 - 0.1, y, sz1 - th - 0.02, sx0 + 1.0, y + 0.4, sz1 + 0.5)); col.rect([sx0 - 0.1, sz1 - th, sx0 + 1.0, sz1 + 0.5], y, y + 0.4);
  mound(bag, 'sandstone_yellow', sx0 - 0.4, y - 0.02, sz0 + 1.5, 1.0, 0.3, 1.4);
}

/** The masons' yard { rect, y, seed }: blocks in the rough and dressed, sledges, rollers, a ramp of mud, a tool rack and a shade, the chippings. */
export function masonsYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 53);
  for (let k = 0; k < 26; k++) {
    const bx = x0 + 2 + rand() * (x1 - x0 - 4), bz = z0 + 2 + rand() * (z1 - z0 - 8), a = 0.5 + rand() * 0.9, b = 0.4 + rand() * 0.6, h = 0.4 + rand() * 0.9;
    turned(bag, rand() < 0.55 ? 'sandstone_yellow' : 'sandstone_dressed', bx, bz, a, b, y - 0.02, y + h, rand() * 3.1);
    col.circle(bx, bz, Math.max(a, b) * 0.9, y, y + h);
    for (let c = 0; c < 4; c++) mound(bag, 'sandstone_yellow', bx + (rand() - 0.5) * 3, y - 0.02, bz + (rand() - 0.5) * 3, 0.3 + rand() * 0.5, 0.05 + rand() * 0.08, 0.3 + rand() * 0.4);
  }
  // three sledges with blocks on them, rollers of palm log, the rope
  for (let k = 0; k < 3; k++) {
    const sx = x0 + 6 + k * ((x1 - x0 - 12) / 2.2), sz = z1 - 5.5 + rand();
    for (const dz of [-0.5, 0.5]) turned(bag, 'timber', sx, sz + dz, 1.7, 0.07, y, y + 0.14, 0.04);
    turned(bag, 'timber', sx, sz, 1.5, 0.6, y + 0.14, y + 0.22, 0.04); turned(bag, 'sandstone_dressed', sx, sz, 1.0, 0.5, y + 0.22, y + 0.9, 0.04); col.rect([sx - 1.5, sz - 0.65, sx + 1.5, sz + 0.65], y, y + 0.9);
    for (let r = 0; r < 4; r++) lying(bag, 'palm_trunk', sx - 3.6 - r * 0.3 - 0.2, sx - 3.6 - r * 0.3 + 0.2, y + 0.14, sz - 0.5 + r * 0.3, 0.14);
    bag.add('rope_fibre', box(sx - 4.5, y + 0.1, sz - 0.03, sx - 1.6, y + 0.17, sz + 0.03));
  }
  // the mud ramp up to a stack of blocks on the south side, with a scaffold of poles lashed at the top
  { const rx = x0 + 3, rz = z0 + 2;
    for (let k = 0; k < 10; k++) { const top = y + 2.0 * (1 - (k + 1) / 10); if (top > y + 0.02) bag.add('mud_plaster', box(rx + k * 0.8, y, rz, rx + (k + 1) * 0.8, top, rz + 2.4)); }
    bag.add('mud_plaster', box(rx - 2.5, y, rz, rx, y + 2.0, rz + 2.4)); col.rect([rx - 2.5, rz, rx, rz + 2.4], y, y + 2.0);
    col.ramp([rx, rz, rx + 8, rz + 2.4], y + 2.0, y, 'w');
    for (const dz of [0.1, 2.3]) for (const dx of [-2.3, -0.2]) post(bag, rx + dx, y + 2.0, y + 5.2, rz + dz, 0.07);
    bag.add('timber', box(rx - 2.4, y + 4.4, rz + 0.05, rx - 0.1, y + 4.5, rz + 0.15)); bag.add('timber', box(rx - 2.4, y + 4.4, rz + 2.25, rx - 0.1, y + 4.5, rz + 2.35)); }
  // the tool rack under a shade: copper chisels, wooden mallets, a bow-saw, a plumb-line, water jars
  { const tx = x1 - 6, tz = z0 + 3.5;
    for (const [dx, dz] of [[-1.5, -1.0], [1.5, -1.0], [-1.5, 1.0], [1.5, 1.0]]) post(bag, tx + dx, y, y + 2.5, tz + dz, 0.06);
    bag.add('reed_mat', box(tx - 1.8, y + 2.5, tz - 1.3, tx + 1.8, y + 2.56, tz + 1.3));
    bag.add('timber', box(tx - 1.3, y + 0.9, tz - 0.9, tx + 1.3, y + 0.96, tz - 0.8));
    for (let k = 0; k < 8; k++) bag.add('bronze', box(tx - 1.2 + k * 0.32, y + 0.96, tz - 0.88, tx - 1.17 + k * 0.32, y + 1.4, tz - 0.84));
    for (let k = 0; k < 3; k++) { bag.add('palm_trunk', box(tx - 0.6 + k * 0.5, y + 0.96, tz - 0.9, tx - 0.5 + k * 0.5, y + 1.05, tz - 0.8)); }
    for (let k = 0; k < 4; k++) jar(bag, tx + 0.6 + (k % 2) * 0.4, y, tz + 0.6 + Math.floor(k / 2) * 0.4, 1.1, 'terracotta');
    turned(bag, 'timber', tx, tz + 0.2, 1.2, 0.35, y + 0.4, y + 0.46, 0); col.rect([tx - 1.3, tz - 0.9, tx + 1.3, tz - 0.8], y, y + 1); }
  // a baboon of the temple's frieze, half-carved on a block, to show the work (the statue left in the rough)
  put(bag, baboon(), x0 + (x1 - x0) * 0.55, y + 0.5, z0 + (z1 - z0) * 0.5, 0.6, 1.0);
  turned(bag, 'sandstone_dressed', x0 + (x1 - x0) * 0.55, z0 + (z1 - z0) * 0.5, 0.9, 0.7, y, y + 0.5, 0.6);
}

/** A shaduf (the counterpoise well of the Nile): the mud pier, the pole on it, the bucket on its rope and the lump of mud at the other end; { at, y, rot }. */
export function shaduf(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, a = el.rot ?? 0, c = Math.cos(a), s = Math.sin(a), P = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  for (const v of [-0.5, 0.5]) { const [px, pz] = P(0, v); bag.add('mud_plaster', box(px - 0.3, y - 0.3, pz - 0.3, px + 0.3, y + 1.9, pz + 0.3)); col.rect([px - 0.3, pz - 0.3, px + 0.3, pz + 0.3], y, y + 1.9); }
  const t = []; const p0 = P(-2.3, 0), p1 = P(1.6, 0); beamTris(t, [p0[0], y + 2.1, p0[1]], [p1[0], y + 2.3, p1[1]], 0.07, 0.14); bag.add('palm_trunk', fromTriangles(t));
  const b = P(1.5, 0); bag.add('rope_fibre', box(b[0] - 0.01, y + 0.5, b[1] - 0.01, b[0] + 0.01, y + 2.3, b[1] + 0.01));
  bag.add('wicker', lathe([[0.17, 0], [0.22, 0.28], [0.2, 0.3], [0.001, 0.28]], 10, null, b[0], y + 0.3, b[1]));
  const w = P(-2.2, 0); bag.add('mud_plaster', lathe([[0.001, 0], [0.2, 0.05], [0.24, 0.3], [0.1, 0.48], [0.001, 0.5]], 9, null, w[0], y + 1.5, w[1]));
}

/** The furnishing of the temples' halls { kind: 'great' | 'small', fx, z (centre) }: tables of offerings, braziers, the benches of the priests, the barque of the god on its stand. */
export function templeFurnish(el, { bag, col, lights }) {
  const rand = rng(el.seed || 61), X = (d) => el.fx - d, zc = el.z ?? 0;
  if (el.kind === 'great') {
    const R = greatRooms(), y1 = R[1].y0, y3 = R[3].y0, y5 = R[5].y0;
    // (off the axis, which the walkers keep, and clear of the side chambers' doors at d 10–12 and 22–24)
    [[16.8, 2.3], [21.0, -2.3]].forEach(([d, z]) => offering(bag, col, X(d), zc + z, y1, rand));
    [[12.6, -2.3], [24.6, 2.3]].forEach(([d, z]) => brazier(bag, col, X(d), zc + z, y1));
    for (const d of [14.8, 18.9]) for (const s of [-1, 1]) bench(bag, col, X(d), zc + s * 7.9, 2.2, y1, s);
    // hall 2: mats and offering stands between the pillars
    for (const s of [-1, 1]) { offering(bag, col, X(35.5), zc + s * 0.0 + s * 0.0 + (s > 0 ? 2.65 : -2.65), y3, rand); }
    // vestibule: the barque of the god in its shrine of cedar and gold on a stand, bearing-poles and a bench
    const bx = X(47.2), bz = zc - 2.9;
    bag.add('sandstone_dressed', box(bx - 1.3, y5, bz - 0.55, bx + 1.3, y5 + 0.45, bz + 0.55)); col.rect([bx - 1.3, bz - 0.55, bx + 1.3, bz + 0.55], y5, y5 + 0.45);
    const hull = lathe([[0.001, -1.0], [0.28, -0.8], [0.34, 0], [0.28, 0.8], [0.001, 1.0]], 10); hull.rotateX(Math.PI / 2); hull.scale(1, 0.45, 1); hull.rotateY(Math.PI / 2); hull.translate(bx, y5 + 0.72, bz);
    bag.add('cedar', hull); bag.add('gold', box(bx - 1.15, y5 + 0.84, bz - 0.04, bx - 1.0, y5 + 1.5, bz + 0.04)); bag.add('gold', box(bx + 1.0, y5 + 0.84, bz - 0.04, bx + 1.15, y5 + 1.5, bz + 0.04));
    bag.add('gold', box(bx - 0.35, y5 + 0.84, bz - 0.28, bx + 0.35, y5 + 1.5, bz + 0.28)); bag.add('linen', box(bx - 0.38, y5 + 1.5, bz - 0.31, bx + 0.38, y5 + 1.56, bz + 0.31));
    for (const dz of [-0.45, 0.45]) bag.add('timber', box(bx - 1.5, y5 + 0.46, bz + dz - 0.04, bx + 1.5, y5 + 0.54, bz + dz + 0.04));
    // the sanctuary's offerings: lotus bouquets before the gods
    for (let k = 0; k < 4; k++) { const z = zc + [1.5, 0.5, -0.5, -1.5][k]; bag.add('cloth_green', lathe([[0.001, 0], [0.1, 0.02], [0.08, 0.2], [0.001, 0.25]], 7, null, X(60.4), R[7].y0, z)); bag.add('papyrus', lathe([[0.02, 0], [0.02, 0.4], [0.001, 0.42]], 5, null, X(60.4), R[7].y0 + 0.2, z)); }
  } else {
    const y = FLOOR;
    for (const d of [9.6]) offering(bag, col, X(d), zc, y, rand);
    for (const s of [-1, 1]) brazier(bag, col, X(7.4), zc + s * 3.4, y);
    for (const d of [7.4, 9.8]) for (const s of [-1, 1]) bench(bag, col, X(d), zc + s * 3.7, 1.8, y, s);
  }
  void lights; void frustum;
}
