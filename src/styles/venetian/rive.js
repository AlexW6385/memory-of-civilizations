// The canals' edges and the Rialto about 1500 (docs/settlements/venice.md §6, §4 "The Rialto").
//
// rive: the quay walls (rive, fondamente) along every canal and the basin — brick on a footing,
//   the band of green weed and slime below the high-water mark, a course of white Istrian stone at
//   the tide line, the brick above it bleached and crusted by the salt for half a metre, and a coping
//   of Istrian stone at the walk's edge.
// rialto: the timber bridge of 1458 as Carpaccio painted it in 1494 — two inclined ramps on piles,
//   the rows of shops along both sides of them, the movable middle span between two tall frames
//   that lift it for the masts.

import { box, rod, lathe, frustum } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
const shear = (a) => new Matrix4().fromArray(a);

/** A box in a piece's frame: u along the wall (−L/2..L/2), v toward the water (the face at v = 0), placed at (x, z) and turned so that v points along w. */
function framed(x, z, w, u0, y0, v0, u1, y1, v1) {
  const g = box(u0, y0, v0, u1, y1, v1);
  // local +x → t = (w.z, −w.x), local +z → w: rotateY(θ) maps x → (cos θ, −sin θ) and z → (sin θ, cos θ)
  g.rotateY(Math.atan2(w[0], w[1]));
  g.translate(x, 0, z);
  return g;
}

/** rive: { pieces: [[x, z, wx, wz, L]], sea, top } — wall pieces, each centred at (x, z), its face toward (wx, wz), L long. */
export function rive(el, { bag }) {
  const sea = el.sea, top = el.top;
  for (const [x, z, wx, wz, L] of el.pieces) {
    const w = [wx, wz], h = L / 2 + 0.06, P = (u0, y0, v0, u1, y1, v1, m) => bag.add(m, framed(x, z, w, u0, y0, v0, u1, y1, v1));
    P(-h, sea - 1.6, -0.8, h, sea + 0.55, 0, 'sandstone_green');           // weed and slime below the high water
    P(-h, sea + 0.55, -0.8, h, sea + 1.0, 0.01, 'limestone');             // the Istrian course at the tide line
    P(-h, sea + 1.0, -0.8, h, sea + 1.55, 0, 'brick_grey');               // the brick bleached by the salt
    P(-h, sea + 1.55, -0.8, h, top - 0.2, 0, 'brick');
    P(-h, top - 0.2, -0.6, h, top + 0.04, 0.13, 'limestone');             // the coping
    P(-h, top - 0.6, -2.3, h, top + 0.02, -0.6, 'bluestone');             // the walk's trachyte paving back over the bank to the ground
  }
}

/**
 * rialto: { x (the canal's middle), z, span (between the quay faces), y (the quays), w (the deck's width) } —
 * the bridge across the canal along x. Ramps rise from both quays to the middle span, 3.4 m higher.
 */
export function rialto(el, { bag, col }) {
  const xc = el.x, zc = el.z, sp = el.span, y = el.y, W = el.w ?? 8.4, rise = 3.4, mid = 3.4, sea = el.sea;
  const xa = xc - sp / 2, xb = xc + sp / 2, ram = sp / 2 - mid, hw = W / 2, walk = 1.6;
  const deck = (x) => { const d = Math.abs(x - xc); return d <= mid ? y + rise : y + Math.max(0, rise * (sp / 2 - d) / ram); };
  // the piles in the water: pairs of trestles of three piles under cross beams, braced
  for (let x = xa + 3.6; x < xb - 3; x += 4.4) {
    if (Math.abs(x - xc) < mid + 0.6) continue;
    const yt = deck(x) - 0.42;
    for (const dz of [-hw + 0.4, 0, hw - 0.4]) bag.add('timber', rod([x, sea - 1.5, zc + dz], [x, yt, zc + dz], 0.18, 8));
    bag.add('timber', box(x - 0.2, yt, zc - hw, x + 0.2, yt + 0.3, zc + hw));
    for (const s of [-1, 1]) bag.add('timber', rod([x, sea + 0.4, zc + s * (hw - 0.4)], [x, yt - 0.1, zc], 0.07, 5));
  }
  // the middle span's two tall frames on their piles, the beam across the top, the ropes to the span's ends
  for (const s of [-1, 1]) {
    const x = xc + s * (mid + 0.3);
    for (const dz of [-hw - 0.3, hw + 0.3]) { bag.add('timber', box(x - 0.22, sea - 1.5, zc + dz - 0.22, x + 0.22, y + rise + 7.5, zc + dz + 0.22)); col.rect([x - 0.22, zc + dz - 0.22, x + 0.22, zc + dz + 0.22], y, y + rise + 7.5); }
    bag.add('timber', box(x - 0.25, y + rise + 7.2, zc - hw - 0.55, x + 0.25, y + rise + 7.7, zc + hw + 0.55));
    for (const dz of [-hw + 0.5, hw - 0.5]) bag.add('rope_fibre', rod([x, y + rise + 7.2, zc + dz], [xc - s * (mid - 0.3), y + rise + 0.25, zc + dz], 0.025, 4));
    for (const dz of [-hw + 0.3, 0, hw - 0.3]) bag.add('timber', rod([x, sea - 1.5, zc + dz], [x, y + rise - 0.3, zc + dz], 0.2, 8));
  }
  // the deck: plank ramps and the level middle span (its leaves hinged at the frames)
  const plank = (x0, x1) => {
    const n = Math.max(1, Math.round((x1 - x0) / 0.9));
    for (let i = 0; i < n; i++) {
      const a = x0 + (x1 - x0) * i / n, b = x0 + (x1 - x0) * (i + 1) / n, ya = deck(a), yb = deck(b);
      bag.add('timber', frustum([0, -hw, b - a, hw], 0, 0.3, 0, 0, 0, 0).applyMatrix4(shear([1, (yb - ya) / (b - a), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, a, ya - 0.3, zc, 1])));
    }
  };
  plank(xa - 2.6, xc - mid); plank(xc + mid, xb + 2.6);
  bag.add('timber', box(xc - mid, y + rise - 0.3, zc - hw, xc + mid, y + rise, zc + hw));
  bag.add('iron', box(xc - 0.03, y + rise, zc - hw, xc + 0.03, y + rise + 0.012, zc + hw));          // the joint of the two leaves
  col.ramp([xa, zc - hw, xc - mid, zc + hw], y, y + rise, 'e');
  col.ramp([xc + mid, zc - hw, xb, zc + hw], y, y + rise, 'w');
  col.floor([xa - 2.6, zc - hw, xa, zc + hw], y); col.floor([xb, zc - hw, xb + 2.6, zc + hw], y);
  col.floor([xc - mid, zc - hw, xc + mid, zc + hw], y + rise);
  // the railings along the middle span
  for (const s of [-1, 1]) {
    const zr = zc + s * (hw - 0.08);
    bag.add('timber', box(xc - mid, y + rise + 1.0, zr - 0.06, xc + mid, y + rise + 1.1, zr + 0.06));
    for (let x = xc - mid; x <= xc + mid + 0.01; x += mid / 3) bag.add('timber', box(x - 0.05, y + rise, zr - 0.05, x + 0.05, y + rise + 1.0, zr + 0.05));
    col.rect([xc - mid, zr - 0.08, xc + mid, zr + 0.08], y + rise, y + rise + 1.1);
  }
  // the shops along both ramps: booths of boards under pent roofs of tile, open to the walk, each stepped to the slope
  const sd = hw - walk;                                                     // shop depth from the walk to the deck's edge
  for (const side of [-1, 1]) for (const zs of [-1, 1]) {
    const x0 = side < 0 ? xa + 0.6 : xc + mid + 0.6, x1 = side < 0 ? xc - mid - 0.6 : xb - 0.6, n = Math.round((x1 - x0) / 2.8), L = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * L, b = a + L, yl = Math.max(deck(a), deck(b)), zi = zc + zs * walk, zo = zc + zs * hw;
      const z0 = Math.min(zi, zo), z1 = Math.max(zi, zo), h = 2.5;
      bag.add('planks_grey', box(a, yl, zs < 0 ? z0 : z1 - 0.08, b, yl + h + 0.55, zs < 0 ? z0 + 0.08 : z1));            // the back wall, over the water
      bag.add('timber', box(a, yl, z0, a + 0.1, yl + h, z1));                                                  // the partition
      bag.add('timber', box(a, yl - 0.02, z0, b, yl + 0.06, z1));                                              // the floor
      bag.add('timber', box(a, yl + 0.06, zs < 0 ? zi - 0.65 : zi + 0.05, b, yl + 0.95, zs < 0 ? zi - 0.05 : zi + 0.65));   // the counter
      bag.add('wood_dark', box(a + 0.05, yl + h - 0.5, zs < 0 ? zi - 0.12 : zi + 0.06, b - 0.05, yl + h - 0.05, zs < 0 ? zi - 0.06 : zi + 0.12));   // the shutter propped up
      const g = frustum([a - 0.05, Math.min(zi, zo) - (zs > 0 ? 0.35 : 0.1), b + 0.05, Math.max(zi, zo) + (zs < 0 ? 0.35 : 0.1)], 0, 0.12, 0, 0, 0, 0);
      const k = 0.6 / (z1 - z0 + 0.45);                                                                        // the pent roof falls toward the walk
      g.applyMatrix4(shear([1, 0, 0, 0, 0, 1, 0, 0, 0, zs < 0 ? -k : k, 1, 0, 0, zs < 0 ? yl + h + k * z1 : yl + h - k * z0, 0, 1]));
      bag.add('roof_tile', g);
      col.rect([a, z0, b, z1 - (zs > 0 ? 0 : 0)].map((v, j) => (j === 1 && zs > 0 ? zi : j === 3 && zs < 0 ? zi : v)), yl, yl + h);
      // goods on the counters: cloth in bolts, jars, a scale
      if (i % 3 === 0) bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre'][(i + (zs > 0 ? 1 : 0)) % 3], box(a + 0.4, yl + 0.95, (zs < 0 ? zi - 0.55 : zi + 0.15), b - 0.4, yl + 1.15, (zs < 0 ? zi - 0.15 : zi + 0.55)));
      else if (i % 3 === 1) for (let k2 = 0; k2 < 3; k2++) bag.add('terracotta', lathe([[0.06, 0], [0.12, 0.1], [0.1, 0.24], [0.05, 0.3], [0.001, 0.3]], 8, null, a + 0.6 + k2 * 0.6, yl + 0.95, zs < 0 ? zi - 0.35 : zi + 0.35));
      else { bag.add('bronze', rod([a + L / 2, yl + 0.95, zs < 0 ? zi - 0.35 : zi + 0.35], [a + L / 2, yl + 1.45, zs < 0 ? zi - 0.35 : zi + 0.35], 0.015, 4)); bag.add('bronze', box(a + L / 2 - 0.3, yl + 1.42, (zs < 0 ? zi - 0.37 : zi + 0.33), a + L / 2 + 0.3, yl + 1.45, (zs < 0 ? zi - 0.33 : zi + 0.37))); }
    }
  }
}
