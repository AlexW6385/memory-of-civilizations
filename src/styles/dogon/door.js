// Dogon doors and their locks (docs/settlements/dogon.md §13): the pivoted plank door (two or three planks joined by iron clamps, the
// pivots projecting top and bottom into lintel and sill), carved in rows of figures (nommo with raised arms, men and women), chevrons,
// a lizard; and the sliding-bolt lock: a vertical beam on the leaf with the cross-beam sliding in a cut on its back, the carved head of
// the lock (a lizard between two figures). All geometry is built in the door's local frame — x across, y up from the sill, z outward
// from the wall's face — and handed to `add(material, geometry)`, so the same leaf serves a house door and a granary shutter.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

const DK = 'wood_dark', LG = 'log_pine', HL = 'opening', IR = 'iron', ST = 'schist_rubble', WL = 'banco_rough';

/** One carved figure (nommo): legs, trunk, head, the arms raised; base at (x, y), scale s (the whole figure about 1.0 s tall); relief from z0, d deep. */
export function figure(add, x, y, s, female, z0, d) {
  for (const k of [-1, 1]) add(LG, box(x + k * 0.07 * s - 0.04 * s, y, z0, x + k * 0.07 * s + 0.04 * s, y + 0.26 * s, z0 + d));
  add(LG, box(x - 0.17 * s, y + 0.26 * s, z0, x + 0.17 * s, y + 0.62 * s, z0 + d));
  add(LG, box(x - 0.1 * s, y + 0.64 * s, z0, x + 0.1 * s, y + 0.84 * s, z0 + d));
  for (const k of [-1, 1]) add(LG, box(x + k * 0.27 * s - 0.045 * s, y + 0.48 * s, z0, x + k * 0.27 * s + 0.045 * s, y + 1.02 * s, z0 + d));
  if (female) for (const k of [-1, 1]) add(LG, box(x + k * 0.085 * s - 0.04 * s, y + 0.46 * s, z0, x + k * 0.085 * s + 0.04 * s, y + 0.54 * s, z0 + d * 1.9));
}

/** A lizard in relief, crawling along x (length L): body, head, four bent legs, a tail. */
function lizard(add, x, y, L, z0, d) {
  add(LG, box(x - L * 0.36, y + 0.03, z0, x + L * 0.3, y + 0.075, z0 + d));
  add(LG, box(x + L * 0.3, y + 0.025, z0, x + L * 0.46, y + 0.085, z0 + d));
  for (const [u, s] of [[-0.22, 1], [-0.22, -1], [0.18, 1], [0.18, -1]]) add(LG, box(x + L * u - 0.012, y + 0.05 + (s > 0 ? 0.0 : -0.05), z0, x + L * u + 0.012, y + 0.075 + (s > 0 ? 0.05 : 0.0), z0 + d));
  add(LG, box(x - L * 0.5, y + 0.045, z0, x - L * 0.36, y + 0.06, z0 + d));
}

/** The sliding-bolt lock at (x, y) (its foot), scale k: the vertical beam with the carved head, the cross-beam drawn across toward the post, the keeper on the post. dir +1 the post is east, -1 west. */
export function lock(add, x, y, k, dir = 1, z0 = 0.075, open = false) {
  const zb = z0 + 0.03;
  add(DK, box(x - 0.05 * k, y, z0, x + 0.05 * k, y + 0.36 * k, zb + 0.05 * k));                       // the vertical beam, on the leaf
  add(DK, box(x - 0.085 * k, y + 0.36 * k, z0, x + 0.085 * k, y + 0.42 * k, zb + 0.05 * k));           // the head's block
  for (const s of [-1, 1]) figure(add, x + s * 0.045 * k, y + 0.42 * k, 0.13 * k, s > 0, z0, 0.03 * k + 0.03);     // two nommo on the head
  lizard(add, x, y + 0.16 * k, 0.1 * k * 2, zb + 0.05 * k, 0.012 * k + 0.004);                          // the lizard between them, down the beam's face
  const reach = open ? 0.12 : 0.52;                                                                      // the cross-beam: drawn back to the beam, or across to the keeper
  add(DK, box(Math.min(x, x + dir * reach * k) - 0.0, y + 0.14 * k, zb + 0.05 * k, Math.max(x, x + dir * reach * k), y + 0.19 * k, zb + 0.09 * k));
  for (const q of [0.06, 0.12]) add(IR, box(x + dir * q * k - 0.012 * k, y + 0.19 * k, zb + 0.05 * k, x + dir * q * k + 0.012 * k, y + 0.225 * k, zb + 0.08 * k));   // the iron prongs dropping into the holes
  for (const q of [0.0, 0.3]) add(IR, box(x - 0.03 * k, y + 0.02 * k + q * k, zb + 0.05 * k, x + 0.03 * k, y + 0.035 * k + q * k, zb + 0.062 * k));   // clamps binding the beam
}

/**
 * The leaf of a carved plank door: local frame, x from -w/2 to w/2, y from 0 to h, the leaf's face at z = 0.075 (planks 0.03…0.075).
 * o: { rand, planks (2 or 3), rows (registers of carving), lockAt: 'e' | 'w' | null, lockK (scale) }.
 * The registers cycle through figures, chevrons, a lizard and dots by the door's own seed, so no two doors carry the same rows.
 */
export function leaf(add, w, h, o = {}) {
  const rand = o.rand ?? Math.random, np = o.planks ?? 3, rows = o.rows ?? 4, zf = 0.075;
  add(HL, box(-w / 2, 0, 0.02, w / 2, h, 0.03));
  const pw = (w - 0.04) / np;
  for (let i = 0; i < np; i++) {
    const x0 = -w / 2 + 0.02 + i * pw + 0.006, x1 = -w / 2 + 0.02 + (i + 1) * pw - 0.006;
    add(DK, box(x0, 0.01, 0.03, x1, h - 0.02, zf));
  }
  for (let i = 1; i < np; i++) for (const v of [0.2, 0.55, 0.85]) add(IR, box(-w / 2 + 0.02 + i * pw - 0.05, h * v, zf, -w / 2 + 0.02 + i * pw + 0.05, h * v + 0.028, zf + 0.008));   // the clamps across the joints
  const kinds = ['fig', 'chev', 'fig', 'liz', 'fig', 'dots', 'chev'], off = Math.floor(rand() * kinds.length);
  const lockSide = o.lockAt === 'w' ? -1 : 1, free = o.lockAt ? [-w / 2 + 0.07 + (lockSide < 0 ? 0.2 : 0), w / 2 - 0.07 - (lockSide > 0 ? 0.2 : 0)] : [-w / 2 + 0.07, w / 2 - 0.07];
  const ry0 = h * 0.07, band = (h * 0.86) / rows;
  for (let r = 0; r < rows; r++) {
    const y0 = ry0 + r * band, kind = kinds[(off + r) % kinds.length], m = Math.max(0.04, band * 0.12);
    add(LG, box(-w / 2 + 0.04, y0 + band - 0.012, zf, w / 2 - 0.04, y0 + band, zf + 0.012));    // the bar closing the register
    const u0 = free[0], u1 = free[1];
    if (kind === 'fig') {
      const s = Math.min(band * 0.78, 0.2), n = Math.max(2, Math.floor((u1 - u0) / (s * 0.85)));
      for (let k = 0; k < n; k++) figure(add, u0 + (k + 0.5) * (u1 - u0) / n, y0 + m * 0.5, s * 0.82, (k + r) % 2 === 1, zf, 0.016);
    } else if (kind === 'chev') {
      const n = Math.max(3, Math.floor((u1 - u0) / 0.09)), T = [];
      for (let k = 0; k < n; k++) { const a = u0 + k * (u1 - u0) / n, b = u0 + (k + 1) * (u1 - u0) / n; T.push(a, y0 + m, zf + 0.012, (a + b) / 2, y0 + band - m, zf + 0.012, b, y0 + m, zf + 0.012); }
      add(LG, fromTriangles(T));
    } else if (kind === 'liz') {
      lizard(add, (u0 + u1) / 2, y0 + band * 0.25, Math.min(0.62, (u1 - u0) * 0.9), zf, 0.016);
    } else {
      const n = Math.max(3, Math.floor((u1 - u0) / 0.075));
      for (let k = 0; k < n; k++) add(LG, box(u0 + (k + 0.25) * (u1 - u0) / n, y0 + band * 0.4, zf, u0 + (k + 0.75) * (u1 - u0) / n, y0 + band * 0.4 + 0.045, zf + 0.014));
    }
  }
  if (o.lockAt) lock(add, lockSide * (w / 2 - 0.1), h * 0.42, o.lockK ?? 1, lockSide, zf);
}

/** The frame of a door of the wall: jambs, a lintel beam whose ends stand proud (the upper pivot's socket), a sill stone; open doors show their leaf swung back. */
export function frame(add, w, h, o = {}) {
  const t = o.jamb ?? 0.1;
  add(DK, box(-w / 2 - t, 0, -0.02, -w / 2, h + 0.1, 0.12));
  add(DK, box(w / 2, 0, -0.02, w / 2 + t, h + 0.1, 0.12));
  add(DK, box(-w / 2 - t - 0.09, h, -0.02, w / 2 + t + 0.09, h + 0.13, 0.14));                      // the lintel beam, its ends proud of the jambs
  add(ST, box(-w / 2 - t, -0.03, 0.0, w / 2 + t, 0.05, 0.3));                                      // the sill stone (the lower pivot turns in it)
  if (o.fill) add(WL, box(-w / 2, h + 0.1, -0.45, w / 2, h + o.fill, 0.0));                        // the wall's own mud closing the gap above the lintel (a thick wall)
  add(WL, box(-w / 2 - t - 0.04, h + 0.13, -0.02, w / 2 + t + 0.04, h + 0.2, 0.16));              // the mud course laid over the lintel
}
