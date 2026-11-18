// Upper floors of the houses of Abbasid Baghdad (docs/settlements/abbasid-baghdad.md §15): the stair of brick, the floor of palm-trunk joists
// and boards with its opening and rail, the balcony (shanashil) over the street, windows as open reveals. Pieces for a local frame (kit.js
// `local`), the front at +z. Only materials the plans already draw: brick_buff, timber, cedar, lattice, mud_plaster.

import { box, frustum } from '../../core/geom.js';

/** A piece with no top face (a rail: nobody stands on it). */
export const nb = (bag, mat, x0, y0, z0, x1, y1, z1) => { if (x1 - x0 > 1e-4 && y1 - y0 > 1e-4 && z1 - z0 > 1e-4) bag.add(mat, frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true })); };

/**
 * A rail along the line (x0, z0) → (x1, z1) standing on y: posts about 1.3 m apart, a top bar and a middle bar, 1 m high, with a collider.
 * Straight along x or z only.
 */
export function rail(c, x0, z0, x1, z1, y, { h = 1.0, mat = 'cedar', collide = true } = {}) {
  const { bag, col } = c, alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0), L = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), n = Math.max(1, Math.round(L / 1.3));
  const lo = [Math.min(x0, x1), Math.min(z0, z1)], hi = [Math.max(x0, x1), Math.max(z0, z1)], t = 0.035;
  for (let k = 0; k <= n; k++) {
    const f = k / n, px = alongX ? lo[0] + (hi[0] - lo[0]) * f : (lo[0] + hi[0]) / 2, pz = alongX ? (lo[1] + hi[1]) / 2 : lo[1] + (hi[1] - lo[1]) * f;
    nb(bag, mat, px - t, y, pz - t, px + t, y + h, pz + t);
  }
  for (const [a, b] of [[h - 0.07, h], [h * 0.45, h * 0.45 + 0.05]]) nb(bag, mat, lo[0] - (alongX ? t : 0.025), y + a, lo[1] - (alongX ? 0.025 : t), hi[0] + (alongX ? t : 0.025), y + b, hi[1] + (alongX ? 0.025 : t));
  if (collide) col.rect([lo[0] - 0.04, lo[1] - 0.04, hi[0] + 0.04, hi[1] + 0.04], y, y + h);
}

/**
 * A flight of brick steps in the plan rect x ∈ [x0, x1], z from zFoot to zTop, from the floor y up by `rise`: each step a block from the floor
 * (the flight is solid) and, over it, the walkable ramp. The treads about 0.17 high.
 */
export function stairRun(c, { x0, x1, zFoot, zTop, y, rise, mat = 'brick_buff', y0 = y }) {
  const { bag, col } = c, up = zTop > zFoot ? 1 : -1, L = Math.abs(zTop - zFoot), n = Math.max(2, Math.round(rise / 0.17)), run = L / n;
  for (let k = 1; k <= n; k++) {
    const za = zFoot + up * (k - 1) * run, zb = zFoot + up * k * run;
    bag.add(mat, box(x0, y0, Math.min(za, zb), x1, y0 + rise * k / n, Math.max(za, zb)));
  }
  col.ramp([x0, Math.min(zFoot, zTop), x1, Math.max(zFoot, zTop)], y0, y0 + rise, up > 0 ? 's' : 'n');
}

/** The floor over a rect: joists of palm trunk under boards, 0.16 thick, its top at yTop; walkable. `joists`: put the beams under it. */
export function slabPiece(c, x0, z0, x1, z1, yTop, mat = 'timber') {
  if (x1 - x0 < 0.05 || z1 - z0 < 0.05) return;
  c.bag.add(mat, box(x0, yTop - 0.16, z0, x1, yTop, z1));
  c.col.floor([x0, z0, x1, z1], yTop);
}

/** An open window in a wall: the op for wallRun (flat head), its sill 0.9 above the floor, 0.9 wide, 1.2 high; `at` along the wall. */
export const windowOp = (at, floorY, w = 0.9, h = 1.2, sill = 0.9) => ({ at, w, h, y0: floorY + sill, flat: true });

/**
 * A balcony over the street (a shanashil in the open: a deck on brackets with a lattice-filled rail): centred at x on the front wall's outer
 * face z = zf, `w` wide and `depth` out; its floor top at yTop; a collider floor and rail (the door of the wall opens onto it).
 */
export function balcony(c, { x, zf, w = 2.0, depth = 1.1, yTop, rand }) {
  const { bag, col } = c, x0 = x - w / 2, x1 = x + w / 2, z1 = zf + depth;
  bag.add('cedar', box(x0, yTop - 0.14, zf, x1, yTop, z1));
  for (const bx of [x0 + 0.15, x1 - 0.15, (x0 + x1) / 2]) { bag.add('cedar', box(bx - 0.06, yTop - 0.5, zf, bx + 0.06, yTop - 0.14, zf + 0.06)); bag.add('cedar', box(bx - 0.05, yTop - 0.42, zf, bx + 0.05, yTop - 0.36, z1 - 0.08)); }
  col.floor([x0, zf - 0.4, x1, z1], yTop);
  // the rail: lattice panels over a cedar sill, a handrail on posts; open at the wall
  const t = 0.04, ph = 1.05 + Math.floor(((x * 7 + zf * 13) % 1 + 1) % 1 * 3) * 0.02 + (rand ? rand() * 0.0 : 0);
  for (const [a0, b0, a1, b1] of [[x0, z1 - t, x1, z1], [x0, zf, x0 + t, z1], [x1 - t, zf, x1, z1]]) {
    bag.add('lattice', box(a0, yTop + 0.18, b0, a1, yTop + ph - 0.1, b1));
    nb(bag, 'cedar', a0 - 0.02, yTop, b0 - 0.02, a1 + 0.02, yTop + 0.18, b1 + 0.02);
    nb(bag, 'cedar', a0 - 0.03, yTop + ph - 0.1, b0 - 0.03, a1 + 0.03, yTop + ph, b1 + 0.03);
    col.rect([a0 - 0.03, b0 - 0.03, a1 + 0.03, b1 + 0.03], yTop, yTop + ph);
  }
  for (const px of [x0, x1]) nb(bag, 'cedar', px - 0.05, yTop, z1 - 0.05, px + 0.05, yTop + ph, z1 + 0.05);
}
