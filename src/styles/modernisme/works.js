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
