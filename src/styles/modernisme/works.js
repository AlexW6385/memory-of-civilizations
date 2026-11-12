// The Sagrada Família's works as the street sees them (docs/settlements/barcelona.md §12): the timber hoarding round the site on
// the Marina and the cross street — boarded bays between posts, bills pasted on some, a gateway for the carts and the visitors —
// and the stone stacked inside it.
import { box } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * works_fence: { a: [x, z], b: [x, z], y (a function of x, z: the ground, or a number), h, gates: [[s0, s1]], seed } — a hoarding along a → b,
 * its street side to the right of the way a → b. Bays of 2.4 m: vertical boards between posts, a rail along the top, a bill on some bays;
 * gaps for the gates (metres along from a), their posts taller with caps and the leaves stood open inward.
 */
export function worksFence(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bz - az, bx - ax), h = el.h ?? 1.5, rand = rng(el.seed ?? 1);
  const gy = typeof el.y === 'function' ? el.y : () => el.y ?? 0, gates = el.gates ?? [];
  const at = (s) => [ax + Math.cos(ang) * s, az + Math.sin(ang) * s];
  const inGate = (s0, s1) => gates.some(([g0, g1]) => s1 > g0 + 0.01 && s0 < g1 - 0.01);
  const BILLS = ['cloth_red', 'cloth_ochre', 'paint_white', 'cloth_green', 'cloth_blue'];
  // local frame: u along the way, v to the right (the street side); built about the origin then turned and moved to s
  const put = (mat, [u0, y0, v0, u1, y1, v1], s, y) => { const [x, z] = at(s); bag.add(mat, box(u0, y + y0, v0, u1, y + y1, v1).rotateY(-ang).translate(x, 0, z)); };
  const n = Math.ceil(L / 2.4), step = L / n;
  for (let i = 0; i < n; i++) {
    const s0 = i * step, s1 = s0 + step, sm = (s0 + s1) / 2, y = gy(...at(sm));
    if (!inGate(s0, s1)) {
      // the boards: one vertical-planked panel between the posts, a rail, a bill on some
      put('planks_grey', [-step / 2 + 0.07, 0.05, -0.03, step / 2 - 0.07, h - 0.1, 0.03], sm, y);
      put('timber', [-step / 2, h - 0.1, -0.06, step / 2, h, 0.06], sm, y);
      put('timber', [-step / 2 + 0.05, 0.35, 0.03, step / 2 - 0.05, 0.42, 0.07], sm, y);
      if (rand() < 0.35) put(BILLS[Math.floor(rand() * BILLS.length)], [-0.55, 0.45, 0.031, 0.55, 1.3, 0.036], sm, y);
      col.segment(at(s0), at(s1), 0.16, y, y + h);
    }
    const [px, pz] = at(s0), py = gy(px, pz), gatePost = gates.some(([g0, g1]) => Math.abs(s0 - g0) < 0.01 || Math.abs(s0 - g1) < 0.01);
    bag.add('timber', box(-0.07, py, -0.07, 0.07, py + (gatePost ? h + 0.9 : h + 0.08), 0.07).rotateY(-ang).translate(px, 0, pz));
  }
  const [ex, ez] = at(L), ey = gy(ex, ez);
  bag.add('timber', box(-0.07, ey, -0.07, 0.07, ey + h + 0.08, 0.07).rotateY(-ang).translate(ex, 0, ez));
  // the gates: caps on the tall posts, the two leaves open, turned inward
  for (const [g0, g1] of gates) {
    for (const s of [g0, g1]) { const [px, pz] = at(s), py = gy(px, pz); bag.add('timber', box(-0.1, py + h + 0.9, -0.1, 0.1, py + h + 1.0, 0.1).rotateY(-ang).translate(px, 0, pz)); }
    const gyy = gy(...at((g0 + g1) / 2));
    for (const s of [g0, g1]) {
      const [px, pz] = at(s), leaf = (g1 - g0) / 2 - 0.1;
      // (a leaf hangs on its post and stands open at right angles, inward: toward −v)
      bag.add('planks_grey', box(-0.03, gyy + 0.05, -leaf, 0.03, gyy + h + 0.4, 0).rotateY(-ang).translate(px, 0, pz));
    }
    // (a lintel's name board over the gateway)
    const sm = (g0 + g1) / 2, [mx, mz] = at(sm); bag.add('timber', box(-(g1 - g0) / 2, gyy + h + 0.95, -0.06, (g1 - g0) / 2, gyy + h + 1.05, 0.06).rotateY(-ang).translate(mx, 0, mz));
  }
}

/**
 * stone_yard: { at: [x, z] (the corner), size: [dx, dz], y, seed, clear: [[z0, z1]] } — the yard of the Nativity façade's foot: blocks of Montjuïc
 * stone stacked and standing singly, rough and dressed, a timber sledge on rollers, a mason's trestle with a block half carved, lime barrels
 * and a heap of chippings; the strips in `clear` (along z) kept open for the walk to the façade.
 */
export function stoneYard(el, { bag, col }) {
  const [x0, z0] = el.at, [dx, dz] = el.size ?? [8, 12], y = el.y ?? 0, rand = rng(el.seed ?? 7), clear = el.clear ?? [];
  const free = (z, d) => !clear.some(([a, b]) => z + d > a && z < b);
  const rough = ['sandstone', 'limestone_yellow'];
  for (let k = 0; k < 22; k++) {
    const w = 0.9 + rand() * 1.1, d = 0.7 + rand() * 0.7, h = 0.55 + rand() * 0.6, x = x0 + rand() * (dx - w), z = z0 + rand() * (dz - d);
    if (!free(z, d)) continue;
    const mat = rough[Math.floor(rand() * 2)], st = rand() < 0.4 ? 2 : 1;
    for (let s = 0; s < st; s++) bag.add(s ? rough[1 - rough.indexOf(mat)] : mat, box(x + s * 0.12, y + s * h, z + s * 0.08, x + w - s * 0.12, y + (s + 1) * h, z + d - s * 0.08));
    col.rect([x, z, x + w, z + d], y, y + st * h);
  }
  // dressed pieces: a capital's block with a leaf carved on it, a standing slab, a drum of a column, laid on timber
  for (let k = 0; k < 5; k++) {
    const x = x0 + 0.4 + rand() * (dx - 1.6), z = z0 + rand() * (dz - 0.8);
    if (!free(z, 0.8)) continue;
    bag.add('timber', box(x, y, z, x + 1.2, y + 0.12, z + 0.1)); bag.add('timber', box(x, y, z + 0.6, x + 1.2, y + 0.12, z + 0.7));
    bag.add('limestone_carved', box(x + 0.05, y + 0.12, z + 0.05, x + 1.1, y + 0.7, z + 0.7));
    col.rect([x, z, x + 1.2, z + 0.7], y, y + 0.7);
  }
  // a sledge on rollers carrying a big block, the trestle and its half-carved block, barrels, chippings
  const sz = z0 + dz * 0.5 + 3.6;
  if (free(sz, 1.6)) {
    bag.add('timber', box(x0 + 0.5, y + 0.22, sz, x0 + 3.1, y + 0.34, sz + 1.5));
    for (const rx of [0.8, 1.7, 2.6]) bag.add('timber', box(x0 + rx, y, sz - 0.1, x0 + rx + 0.14, y + 0.22, sz + 1.6));
    bag.add('sandstone', box(x0 + 0.7, y + 0.34, sz + 0.1, x0 + 2.9, y + 1.3, sz + 1.4)); col.rect([x0 + 0.5, sz, x0 + 3.1, sz + 1.5], y, y + 1.3);
  }
  const tz = z0 + 1.2;
  if (free(tz, 1)) {
    for (const px of [x0 + 0.4, x0 + 2.0]) { bag.add('timber', box(px, y, tz, px + 0.1, y + 0.8, tz + 0.1)); bag.add('timber', box(px, y, tz + 0.7, px + 0.1, y + 0.8, tz + 0.8)); }
    bag.add('timber', box(x0 + 0.3, y + 0.8, tz - 0.05, x0 + 2.2, y + 0.9, tz + 0.85));
    bag.add('limestone_carved', box(x0 + 0.6, y + 0.9, tz + 0.1, x0 + 1.9, y + 1.4, tz + 0.7)); col.rect([x0 + 0.3, tz - 0.05, x0 + 2.2, tz + 0.85], y, y + 1.4);
  }
  for (const [bx, bz] of [[0.6, dz - 1.2], [1.7, dz - 0.9]]) if (free(z0 + bz, 0.9)) { bag.add('timber', box(x0 + bx, y, z0 + bz, x0 + bx + 0.7, y + 0.9, z0 + bz + 0.7)); col.rect([x0 + bx, z0 + bz, x0 + bx + 0.7, z0 + bz + 0.7], y, y + 0.9); }
  for (let k = 0; k < 14; k++) { const x = x0 + dx * 0.5 + rand() * 1.2, z = z0 + dz - 2.2 + rand() * 1.8, s = 0.12 + rand() * 0.18; if (free(z, s)) bag.add('limestone', box(x, y, z, x + s * 2, y + s, z + s * 1.6)); }
}
