// The surfaces of Beijing's streets (docs/settlements/qing-beijing.md §16, §17): the avenue south of the moat as a Qing
// commercial street — a carriageway of packed earth with a worn strip of granite slabs down the middle (the old
// imperial way, broken where slabs were lost), cart ruts, and raised walks of bluestone behind a granite kerb before
// the shops — and the hutong as packed-earth lanes, ruts in the middle, drifts of paler dust, a dusty edge.
import { box, fromTriangles } from '../../core/geom.js';
import { rng } from './houses.js';
import { CARRIAGE, WALK_UP, STONE_STRIP, SHOP_FRONT } from './layout.js';

const EARTH = 'mud_plaster', DUST = 'earth_wall', RUT = 'mudbrick';

/** Scatter bands of a given material along z (or x) in a strip: segments of random length and offset. */
function segs(bag, r, mat, { a0, a1, across, w, jit = 0.0, len = [3, 9], gap = [0, 4], y0, y1, along = 'z' }) {
  let t = a0 + r() * len[0];
  while (t < a1) {
    const L = len[0] + r() * (len[1] - len[0]), c = across + (r() - 0.5) * 2 * jit, e = Math.min(a1, t + L);
    if (along === 'z') bag.add(mat, box(c - w / 2, y0, t, c + w / 2, y1, e)); else bag.add(mat, box(t, y0, c - w / 2, e, y1, c + w / 2));
    t = e + gap[0] + r() * (gap[1] - gap[0]);
  }
}

/** bj_street: { z0, z1, seed } — the avenue from z0 to z1 (x = 0 the axis). */
export function bjStreet(el, { bag, col }) {
  const r = rng(el.seed || 7), { z0, z1 } = el, C = CARRIAGE, W = SHOP_FRONT, y = 0.04, wy = y + WALK_UP;
  // the packed earth, across the whole width between the walks
  bag.add(EARTH, box(-C, -0.3, z0, C, y, z1));
  col.floor([-C, z0, C, z1], y);
  // patches of paler dust, and the cart ruts (two pairs: the carts' wheels run 1.5 m apart) in darker, damper earth
  for (let k = 0; k < 14; k++) { const c = (r() - 0.5) * 2 * (C - 0.6), a = z0 + r() * (z1 - z0 - 10); bag.add(DUST, box(c - 0.5 - r() * 0.6, y, a, c + 0.5 + r() * 0.8, y + 0.008, a + 3 + r() * 7)); }
  for (const cx of [-3.05, -0.0, 3.05]) {
    if (cx === 0) continue;
    for (const o of [-0.75, 0.75]) segs(bag, r, RUT, { a0: z0, a1: z1, across: cx + o, w: 0.12 + r() * 0.08, jit: 0.2, len: [2, 6], gap: [1.5, 9], y0: y, y1: y + 0.016 });
  }
  // the stone strip: granite slabs 1.5 m broad in a worn run (the old imperial way), lost in places and replaced by earth
  let t = z0;
  while (t < z1) {
    const L = 5 + r() * 14, e = Math.min(z1, t + L), wob = (r() - 0.5) * 0.14;
    bag.add('granite_block', box(-STONE_STRIP + wob, y - 0.01, t, STONE_STRIP + wob, y + 0.045, e));
    col.floor([-STONE_STRIP, t, STONE_STRIP, e], y + 0.045);
    t = e + (r() < 0.45 ? 0.6 + r() * 2.2 : 0.04);
  }
  // the raised walks before the shops: bluestone behind a granite kerb; a drain slot at the kerb's foot
  for (const s of [-1, 1]) {
    const a = s < 0 ? -W : C, b = s < 0 ? -C : W, kx = s < 0 ? -C - 0.26 : C;
    bag.add('bluestone', box(a, -0.3, z0, b, wy, z1));
    col.floor([a, z0, b, z1], wy);
    // the kerb, in 1.1 m stones of different height
    for (let z = z0; z < z1; z += 1.1) bag.add('granite_grey', box(kx, y - 0.02, z, kx + 0.26, wy + 0.02 + r() * 0.03, Math.min(z1, z + 1.08)));
    // the edge of the walk before the shop plinths: a worn dust line along the foot of the fronts
    for (let k = 0; k < 20; k++) { const zz = z0 + r() * (z1 - z0 - 5); bag.add(DUST, box(s < 0 ? -W : W - 0.9, wy, zz, s < 0 ? -W + 0.9 : W, wy + 0.01, zz + 1.5 + r() * 4)); }
  }
}

/** bj_lane: { rect, seed } — a hutong of packed earth: a crown of dust, ruts, patches, the edges worn paler. */
export function bjLane(el, { bag, col }) {
  const r = rng(el.seed || 9), [x0, z0, x1, z1] = el.rect, y = 0.03;
  bag.add(EARTH, box(x0, -0.3, z0, x1, y, z1));
  col.floor(el.rect, y);
  const horiz = x1 - x0 > z1 - z0, W = horiz ? z1 - z0 : x1 - x0, mid = horiz ? (z0 + z1) / 2 : (x0 + x1) / 2, a0 = horiz ? x0 : z0, a1 = horiz ? x1 : z1;
  const along = horiz ? 'x' : 'z';
  // dust drifts along the walls' feet (pale), ruts down the middle (dark), a few pale patches
  for (const s of [-1, 1]) segs(bag, r, DUST, { a0, a1, across: mid + s * (W / 2 - 0.4), w: 0.7 + r() * 0.3, jit: 0.1, len: [5, 16], gap: [0.5, 6], y0: y, y1: y + 0.01, along });
  const gauge = 0.7 + r() * 0.15;
  for (const o of [-gauge, gauge]) segs(bag, r, RUT, { a0, a1, across: mid + o, w: 0.12 + r() * 0.07, jit: 0.2, len: [2, 6], gap: [1.5, 9], y0: y + 0.004, y1: y + 0.018, along });
  for (let k = 0; k < Math.ceil((a1 - a0) / 18); k++) { const a = a0 + r() * (a1 - a0 - 4), c = mid + (r() - 0.5) * (W - 1.2); const L = 1.5 + r() * 3, w = 0.7 + r() * 0.9; bag.add(DUST, box(horiz ? a : c - w / 2, y + 0.004, horiz ? c - w / 2 : a, horiz ? a + L : c + w / 2, y + 0.012, horiz ? c + w / 2 : a + L)); }
  // a worn way of bluestone slabs down the lane's middle, here and there (the households' own paving, broken and mended), loose bricks and
  // stones kicked to the sides, and darker damp patches where the slops were thrown
  {
    let t = a0 + 2 + r() * 12;
    while (t < a1 - 3) {
      const L = 3 + r() * 9, e = Math.min(a1 - 1, t + L), wid = 0.8 + r() * 0.5, c = mid + (r() - 0.5) * 1.2;
      for (let u = t; u < e; u += 1.3) {
        const v = Math.min(e, u + 1.26), h = y + 0.012 + r() * 0.01, c0 = c - wid / 2 + r() * 0.04, c1 = c + wid / 2 - r() * 0.04;
        // (the slab's face only: its edges are a centimetre)
        const q = horiz ? [[u, h, c0], [u, h, c1], [v, h, c1], [v, h, c0]] : [[c0, h, u], [c1, h, u], [c1, h, v], [c0, h, v]];
        bag.add('bluestone', fromTriangles(horiz ? [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]] : [...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]]));      // (facing up)
      }
      t = e + 4 + r() * 16;
    }
    const n = Math.ceil((a1 - a0) / 14);
    for (let k = 0; k < n; k++) {
      const a = a0 + r() * (a1 - a0), c = mid + (r() - 0.5) * (W - 0.8), w = 0.12 + r() * 0.16, d = 0.07 + r() * 0.1, hh = 0.04 + r() * 0.06;
      const M = RUT;                                   // (the lane's own earth: a material the plan has already)
      if (horiz) bag.add(M, box(a, y, c, a + w, y + hh, c + d)); else bag.add(M, box(c, y, a, c + d, y + hh, a + w));
    }
    for (let k = 0; k < Math.ceil((a1 - a0) / 24); k++) {
      const a = a0 + r() * (a1 - a0 - 3), c = mid + (r() - 0.5) * (W - 1.5), L = 1 + r() * 2, w = 0.6 + r() * 0.8, h = y + 0.006;
      const q = horiz ? [[a, h, c - w / 2], [a, h, c + w / 2], [a + L, h, c + w / 2], [a + L, h, c - w / 2]] : [[c - w / 2, h, a], [c + w / 2, h, a], [c + w / 2, h, a + L], [c - w / 2, h, a + L]];
      bag.add(RUT, fromTriangles(horiz ? [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]] : [...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]]));      // a damp patch, its face only
    }
  }
}
