// The houses of the town (docs/settlements/qin-xianyang.md §6): rammed-earth walls on a footing of tile, ramming courses and
// mud-wash patches, a door under a timber lintel with a little hood of tile, a window with a lattice or a shutter, roofs of grey
// tile with round tile-ends (wadang), of thatch, or flat of beams and clay with the beam-ends showing; the workman's row house, the
// courtyard house with its gate and yard, the official's house on a raised earth platform, the raised granary (cang), the garden plot.
// A lot's `front` is the side its door is on; in the lot's own frame u runs along the street and v from the street into the lot.
// Furnished interiors (a lot with `open`): the family room, the weaver's, the smith's, the potter's, the cook's.
import { box, lathe, fromTriangles, quad, rod, frustum } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';

export function frame(rect, front, bag, col, lights) {
  const [x0, z0, x1, z1] = rect, zs = front === 's' ? z1 : z0, sg = front === 's' ? -1 : 1, Z = (v) => zs + sg * v;
  const R = (u0, v0, u1, v1) => { const a = Z(v0), b = Z(v1); return [x0 + u0, Math.min(a, b), x0 + u1, Math.max(a, b)]; };
  return {
    W: x1 - x0, D: z1 - z0, X: (u) => x0 + u, Z, R, rise: front === 's' ? 'n' : 's', bag, col, sg,
    b(mat, u0, y0, v0, u1, y1, v1, solid = true) { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); },
    /** A lamp's light (one a room) in the lot's frame, where the house is asked to be lit. */
    light(u, y, v, intensity = 3) { lights?.push({ at: [x0 + u, y, Z(v)], color: '#ffb46b', intensity, distance: 8 }); },
    lathe(mat, prof, u, y, v, seg = 10) { bag.add(mat, lathe(prof, seg, null, x0 + u, y, Z(v))); },
    rod(mat, a, b, r, seg = 6) { bag.add(mat, rod([x0 + a[0], a[1], Z(a[2])], [x0 + b[0], b[1], Z(b[2])], r, seg)); },
  };
}
export const WALLS = ['earth_wall', 'earth_wall', 'mud_plaster', 'earth_wall', 'mud_plaster'];
export const JAR = (r) => [[0.001, 0], [r * 0.5, 0.02], [r, r * 0.9], [r * 0.9, r * 1.6], [r * 0.5, r * 2.0], [r * 0.58, r * 2.2], [0.001, r * 2.2]];
const DOORS = ['timber_red', 'timber', 'planks_grey', 'timber_red'];

/** A gabled roof over rect [u0, v0, u1, v1] (frame units), eaves at height H, rising `rise`, the ridge along the street (u), overhang `o`. */
export function gable(F, u0, v0, u1, v1, H, rise, mat, o = 0.5) {
  const a = F.X(u0 - o), b = F.X(u1 + o), za = F.Z(v0 - o), zb = F.Z(v1 + o), zm = (za + zb) / 2, yr = H + rise, T = [];
  const slope = (zE) => { quad(T, [a, H, zE], [a, yr, zm], [b, yr, zm], [b, H, zE]); quad(T, [a, H, zE], [b, H, zE], [b, yr, zm], [a, yr, zm]); };
  slope(za); slope(zb);
  F.bag.add(mat, fromTriangles(T));
  // the gable ends: the wall's triangle in earth
  const E = [];
  for (const x of [F.X(u0), F.X(u1)]) { const zz0 = F.Z(v0), zz1 = F.Z(v1); E.push(x, H, zz0, x, H, zz1, x, yr - 0.1, zm, x, H, zz0, x, yr - 0.1, zm, x, H, zz1); }
  F.bag.add('earth_wall', fromTriangles(E));
  // the ridge: a row of tile
  F.bag.add(mat === 'thatch' ? 'roof_ridge' : 'tile_dark', box(a, yr - 0.05, zm - 0.18, b, yr + 0.25, zm + 0.18));
}
/** The eave's under-side on the street: rafter ends below, and on a tile roof the round tile-ends (wadang) along its edge. */
function eave(F, u0, u1, v, H, tile, both = false) {
  for (let u = u0 + 0.25; u < u1 - 0.1; u += 0.42) F.b('timber', u - 0.04, H - 0.13, v, u + 0.04, H - 0.04, v + 0.5, false);
  if (tile) for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.3) F.b('tile_dark', u - 0.06, H - 0.03, v - 0.02, u + 0.06, H + 0.12, v + 0.04, false);
  void both;
}
/** The roof's fittings: ridge ends and ties of thatch. */
function ridgeEnds(F, u0, u1, v0, v1, yr, tile) {
  const vm = (v0 + v1) / 2;
  for (const u of [u0 - 0.5, u1 + 0.5]) F.b(tile ? 'tile_dark' : 'thatch', u - 0.1, yr + 0.2, vm - 0.2, u + 0.1, yr + (tile ? 0.5 : 0.4), vm + 0.2, false);
  if (!tile) for (let u = u0; u < u1; u += 0.9) F.b('rope_fibre', u, yr + 0.18, vm - 0.2, u + 0.04, yr + 0.3, vm + 0.2, false);
}
/** A flat roof of beams and clay: the slab with a low parapet, the beam-ends under the eave, a spout. */
function flatRoof(F, u0, v0, u1, v1, H, rand) {
  F.b('mud_plaster', u0 - 0.3, H, v0 - 0.35, u1 + 0.3, H + 0.3, v1 + 0.3, false);
  for (const [a, b, c, d] of [[u0 - 0.3, v0 - 0.35, u1 + 0.3, v0 - 0.2], [u0 - 0.3, v1 + 0.15, u1 + 0.3, v1 + 0.3], [u0 - 0.3, v0 - 0.35, u0 - 0.15, v1 + 0.3], [u1 + 0.15, v0 - 0.35, u1 + 0.3, v1 + 0.3]]) F.b('earth_wall', a, H + 0.3, b, c, H + 0.7, d, false);
  for (let u = u0 + 0.3; u < u1; u += 0.55) F.lathe('log_pine', [[0.09, 0], [0.09, 0.35]], u, H - 0.2, v0 - 0.35, 6), void 0;
  F.b('timber', u0 + 1.5, H + 0.1, v0 - 0.55, u0 + 1.9, H + 0.2, v0 - 0.2, false);
  if (rand() < 0.6) F.b('timber', u1 - 2.2, H + 0.55, v0 - 0.7, u1 - 1.4, H + 0.65, v0 - 0.15, false);                  // the roof's spout
}
const BEAMS = (F, H, rise, W, D, v0 = 0.6) => {
  // the tie-beams across, the ridge-pole and the rafters under a gable
  for (let v = v0 + 1.2; v < D - 0.6; v += 2.4) F.b('timber', 0.1, H - 0.2, v - 0.08, W - 0.1, H - 0.04, v + 0.08, false);
  F.b('timber', 0.1, H + rise - 0.3, D / 2 - 0.1, W - 0.1, H + rise - 0.15, D / 2 + 0.1, false);
  for (let u = 1.0; u < W - 0.5; u += 1.6) { F.rod('timber', [u, H - 0.05, 0.2], [u, H + rise - 0.2, D / 2], 0.035, 4); F.rod('timber', [u, H - 0.05, D - 0.2], [u, H + rise - 0.2, D / 2], 0.035, 4); }
};

/** The front wall with its openings cut: [{ u, w, y0, y1 }] across the wall's thickness v0…v1. */
function frontWall(F, wm, v0, v1, H, ops) {
  let u = 0;
  for (const o of [...ops].sort((a, b) => a.u - b.u)) {
    const a = o.u - o.w / 2, b = o.u + o.w / 2;
    if (a > u + 0.01) F.b(wm, u, 0, v0, a, H, v1);
    if (o.y0 > 0) F.b(wm, a, 0, v0, b, o.y0, v1);
    if (o.y1 < H) F.b(wm, a, o.y1, v0, b, H, v1);
    u = b;
  }
  if (u < F.W - 0.01) F.b(wm, u, 0, v0, F.W, H, v1);
}
/** The door: a footing of tile, jambs, a timber lintel under a little hood of tile, the leaf with its studs (shut unless the house is open). */
function doorFit(F, u, w, h, v0, v1, open, rand, hood = true) {
  F.b('timber', u - w / 2 - 0.15, h - 0.16, v0 - 0.06, u + w / 2 + 0.15, h + 0.1, v1 + 0.06, false);
  F.b('brick_grey', u - w / 2 - 0.05, -0.03, v0 - 0.12, u + w / 2 + 0.05, 0.1, v1 + 0.08, false);                     // the threshold
  F.b('timber', u - w / 2 - 0.06, 0, v0 - 0.03, u - w / 2 + 0.02, h, v1 + 0.03, false); F.b('timber', u + w / 2 - 0.02, 0, v0 - 0.03, u + w / 2 + 0.06, h, v1 + 0.03, false);
  if (hood) {
    F.b('tile_grey', u - w / 2 - 0.4, h + 0.1, v0 - 0.6, u + w / 2 + 0.4, h + 0.2, v1 - 0.1, false);                         // the hood
    for (const s of [-1, 1]) F.rod('timber', [u + s * (w / 2 + 0.25), h + 0.1, v0 - 0.02], [u + s * (w / 2 + 0.25), h - 0.4, v0 - 0.5], 0.03, 4);
  }
  if (!open) {
    const m = DOORS[Math.floor(rand() * DOORS.length)];
    F.b(m, u - w / 2 + 0.02, 0.02, v0 + 0.1, u + w / 2 - 0.02, h - 0.02, v0 + 0.2);
    F.b('timber', u - 0.02, 0.02, v0 + 0.05, u + 0.02, h - 0.02, v0 + 0.1, false);                                      // the meeting of the leaves
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) for (const s of [-1, 1]) F.b('iron', u + s * (0.12 + i * 0.13) - 0.025, 0.3 + j * 0.42, v0 + 0.03, u + s * (0.12 + i * 0.13) + 0.025, 0.34 + j * 0.42, v0 + 0.1, false);
    F.b('bronze', u - 0.2, 0.95, v0 + 0.02, u - 0.1, 1.05, v0 + 0.07, false); F.b('bronze', u + 0.1, 0.95, v0 + 0.02, u + 0.2, 1.05, v0 + 0.07, false);   // the ring-pulls
  }
}
/** A window in the front wall: a lattice (open house or not), or a shutter of boards; the dark behind it if the room is not furnished. */
function windowFit(F, u, y, w, h, v0, v1, kind, open) {
  if (!open) F.b('opening', u - w / 2, y, v0 + (v1 - v0) * 0.6, u + w / 2, y + h, v1, false);
  F.b('timber', u - w / 2 - 0.07, y - 0.07, v0 - 0.04, u + w / 2 + 0.07, y, v0 + 0.06, false); F.b('timber', u - w / 2 - 0.07, y + h, v0 - 0.04, u + w / 2 + 0.07, y + h + 0.07, v0 + 0.06, false);
  F.b('timber', u - w / 2 - 0.07, y, v0 - 0.04, u - w / 2, y + h, v0 + 0.06, false); F.b('timber', u + w / 2, y, v0 - 0.04, u + w / 2 + 0.07, y + h, v0 + 0.06, false);
  if (kind === 'shutter') { F.b('planks_grey', u - w / 2, y, v0 + 0.02, u, y + h, v0 + 0.07, false); F.b('planks_grey', u + 0.04, y + 0.04, v0 - 0.02, u + w / 2, y + h - 0.04, v0 + 0.03, false); }
  else for (let q = 1; q < Math.round(w / 0.12); q++) F.b('timber', u - w / 2 + q * 0.12 - 0.012, y, v0 + 0.03, u - w / 2 + q * 0.12 + 0.012, y + h, v0 + 0.06, false);
}
/** The wear of a street front: ramming courses, patches of mud wash, the splash of the foot, a tie-post, hanging bundles and gourds. */
function frontWear(F, rand, W, H, uDoor, v0 = 0) {
  F.b('tile_grey', -0.02, 0.02, v0 - 0.02, W + 0.02, 0.285, v0 + 0.04, false);
  F.b('granite_grey', -0.02, 0.02, v0 - 0.04, W + 0.02, 0.11, v0 + 0.02, false);                                           // the plinth
  for (const y of [0.9, 1.8, 2.6]) if (y < H - 0.2) F.b('mud_plaster', 0.0, y, v0 - 0.012, W, y + 0.045, v0 + 0.02, false);                   // the ramming courses show as ledges
  for (let k = 0; k < 3; k++) { const u = rand() * (W - 1.6), w = 0.5 + rand() * 0.9; if (Math.abs(u + w / 2 - uDoor) > 1.2) F.b(rand() < 0.5 ? 'mud_plaster' : 'plaster_damp', u, 0.35 + rand() * 1.8, v0 - 0.02, u + w, 0.7 + rand() * 2.0, v0 + 0.015, false); }
  if (rand() < 0.5) { const u = uDoor + (rand() < 0.5 ? -1 : 1) * (1.2 + rand() * 0.8); if (u > 0.3 && u < W - 0.3) { F.b('log_pine', u - 0.07, 0, v0 - 0.45, u + 0.07, 1.25, v0 - 0.31, false); F.b('iron', u - 0.09, 1.0, v0 - 0.47, u + 0.09, 1.04, v0 - 0.29, false); } }   // a tie-post
  for (let k = 0; k < 2; k++) { const u = 0.7 + rand() * (W - 1.4); if (Math.abs(u - uDoor) < 0.9) continue; F.b('rope_fibre', u - 0.01, 2.3, v0 - 0.18, u + 0.01, H - 0.1, v0 - 0.16, false); F.lathe(rand() < 0.5 ? 'wicker' : 'thatch', [[0.001, 0], [0.12, 0.08], [0.1, 0.4], [0.001, 0.46]], u, 1.85, v0 - 0.17, 7); }
}

/** The room's furnishings, by the kind of household: a low table on a mat, a stove with a pot, jars, a chest, a loom, a forge, a wheel. */
function furnish(F, rand, u0, v0, u1, v1, kind = 'family') {
  F.b('earth_wall', u0, -0.02, v0, u1, 0.04, v1, false);
  const mid = (u0 + u1) / 2;
  const stove = (u, v) => { F.b('brick_grey', u, 0, v, u + 1.5, 0.72, v + 1.0); F.lathe('pottery_dark', [[0.001, 0.72], [0.3, 0.76], [0.36, 0.98], [0.28, 1.12], [0.001, 1.12]], u + 0.75, 0, v + 0.5, 10); F.b('brick_grey', u + 1.1, 0.72, v + 0.1, u + 1.4, 1.6, v + 0.4, false); };   // the stove and its pot, the flue
  const jars = (u, v, n) => { for (let i = 0; i < n; i++) F.lathe('terracotta', JAR(0.2 + 0.05 * (i % 2)), u + i * 0.55, 0, v + (i % 2) * 0.15, 9); };
  const lamp = (u, v) => { F.b('lacquer_black', u - 0.2, 0, v - 0.2, u + 0.2, 0.7, v + 0.2, false); F.lathe('bronze', [[0.001, 0.7], [0.12, 0.72], [0.14, 0.8], [0.001, 0.8]], u, 0, v, 8); };
  const chest = (u, v) => { F.b('timber', u, 0, v, u + 1.2, 0.55, v + 0.8); F.b('timber_red', u, 0.55, v, u + 1.2, 0.62, v + 0.8, false); F.b('bronze', u + 0.5, 0.45, v - 0.02, u + 0.7, 0.58, v + 0.02, false); };
  F.b('reed_mat', u0 + 0.6, 0.04, v0 + 1.0, u0 + 3.2, 0.06, v0 + 3.6, false);
  if (kind === 'family') {
    F.b('lacquer_red', u0 + 1.2, 0.06, v0 + 1.6, u0 + 2.4, 0.34, v0 + 2.3);                                              // the low table
    for (let i = 0; i < 3; i++) F.lathe('glaze_green', [[0.001, 0.34], [0.07, 0.35], [0.09, 0.4], [0.001, 0.38]], u0 + 1.5 + i * 0.3, 0, v0 + 1.95, 8);
    F.b('cloth_ochre', u0 + 0.8, 0.06, v0 + 1.1, u0 + 1.2, 0.2, v0 + 1.5, false); F.b('cloth_ochre', u0 + 2.6, 0.06, v0 + 1.1, u0 + 3.0, 0.2, v0 + 1.5, false);   // seat cushions
    stove(u1 - 1.7, v1 - 1.2); jars(u1 - 0.8, v0 + 0.5, 3); chest(u0 + 0.3, v1 - 1.2); lamp(u0 + 3.6, v0 + 0.8);
    if (rand() < 0.6) { F.b('timber', u0 + 3.4, 0, v1 - 1.6, u0 + 3.52, 1.4, v1 - 1.5, false); F.b('timber', u0 + 4.6, 0, v1 - 1.6, u0 + 4.72, 1.4, v1 - 1.5, false); F.b('cloth_white', u0 + 3.52, 0.3, v1 - 1.58, u0 + 4.6, 1.3, v1 - 1.52, false); }   // an upright loom
  } else if (kind === 'weaver') {
    // the loom: a frame, the warp threads (white), the beam, a bench; spindles and a basket of wool, cloth folded on a shelf
    const lu = u0 + 1.2, lv = v0 + 1.4;
    for (const s of [0, 1.4]) { F.b('timber', lu + s, 0, lv, lu + s + 0.12, 1.5, lv + 0.12, false); F.b('timber', lu + s, 0, lv + 1.1, lu + s + 0.12, 1.5, lv + 1.22, false); }
    F.b('timber', lu, 1.4, lv, lu + 1.52, 1.5, lv + 0.12, false); F.b('timber', lu, 0.9, lv + 1.1, lu + 1.52, 1.0, lv + 1.22, false);
    F.b('cloth_white', lu + 0.15, 0.95, lv + 0.2, lu + 1.4, 1.4, lv + 0.22, false); F.b('cloth_indigo', lu + 0.15, 0.95, lv + 0.5, lu + 1.4, 1.15, lv + 0.52, false);
    F.b('timber', lu + 0.2, 0, lv + 1.4, lu + 1.3, 0.4, lv + 1.8);
    for (let i = 0; i < 4; i++) F.lathe('wicker', [[0.001, 0], [0.18, 0.02], [0.22, 0.2], [0.001, 0.22]], u1 - 1.2 + (i % 2) * 0.5, 0, v0 + 1.0 + Math.floor(i / 2) * 0.5, 8);
    F.b('timber', u1 - 1.8, 1.0, v1 - 0.5, u1 - 0.3, 1.05, v1 - 0.1, false); F.b('cloth_red', u1 - 1.7, 1.05, v1 - 0.45, u1 - 0.9, 1.25, v1 - 0.15, false); F.b('cloth_indigo', u1 - 0.85, 1.05, v1 - 0.45, u1 - 0.4, 1.3, v1 - 0.15, false);
    stove(u0 + 0.3, v1 - 1.2); chest(mid + 1.0, v1 - 1.0);
  } else if (kind === 'smith') {
    // the forge: a hearth of brick with its bellows (a bag on a frame), an anvil block, tongs and hammers on the wall, charcoal, a quench trough
    const fu = mid - 0.6, fv = v1 - 1.8;
    F.b('brick_grey', fu, 0, fv, fu + 1.6, 0.8, fv + 1.4); F.b('iron', fu + 0.3, 0.8, fv + 0.3, fu + 1.3, 0.86, fv + 1.1, false); F.b('flame', fu + 0.55, 0.86, fv + 0.55, fu + 1.05, 0.95, fv + 0.9, false);
    F.b('brick_grey', fu + 0.4, 0.8, fv + 1.35, fu + 1.2, 2.2, fv + 1.4, false);
    F.b('timber', fu + 1.8, 0.2, fv + 0.2, fu + 2.8, 0.55, fv + 1.0); F.lathe('hide_brown', [[0.35, 0.55], [0.4, 0.8], [0.3, 1.05], [0.001, 1.1]], fu + 2.3, 0, fv + 0.6, 8);
    F.b('granite_black', mid + 1.8, 0, v0 + 1.6, mid + 2.4, 0.5, v0 + 2.2); F.b('iron', mid + 1.82, 0.5, v0 + 1.62, mid + 2.38, 0.56, v0 + 2.18, false);
    for (let k = 0; k < 6; k++) F.rod('iron', [u0 + 0.5 + k * 0.45, 1.9, v1 - 0.12], [u0 + 0.5 + k * 0.45 + 0.04, 1.2, v1 - 0.12], 0.018, 4);
    F.b('log_pine', u0 + 0.3, 0, v0 + 0.6, u0 + 1.9, 0.55, v0 + 1.3, false); F.b('water', u0 + 0.38, 0.4, v0 + 0.68, u0 + 1.82, 0.42, v0 + 1.22, false);
    F.b('granite_black', u1 - 1.6, 0, v0 + 0.5, u1 - 0.4, 0.4, v0 + 1.3, false); jars(u0 + 0.5, v1 - 0.7, 3);
  } else if (kind === 'potter') {
    // the wheel (a disc on a shaft with a flywheel below), wet pots on a board, a heap of clay, pots drying, a water jar
    const wu = mid - 1.0, wv = v0 + 2.2;
    F.lathe('timber', [[0.35, 0.55], [0.35, 0.6], [0.001, 0.6]], wu, 0, wv, 12); F.lathe('timber', [[0.05, 0], [0.05, 0.55]], wu, 0, wv, 6); F.lathe('timber', [[0.5, 0.05], [0.5, 0.15], [0.001, 0.15]], wu, 0, wv, 12);
    F.lathe('terracotta', [[0.001, 0.6], [0.14, 0.62], [0.17, 0.72], [0.1, 0.82], [0.001, 0.82]], wu, 0, wv, 9);
    F.b('timber', mid + 0.5, 0, v0 + 1.6, mid + 2.6, 0.5, v0 + 2.1); for (let i = 0; i < 5; i++) F.lathe('terracotta', JAR(0.1 + 0.02 * (i % 3)), mid + 0.7 + i * 0.38, 0.5, v0 + 1.85, 8);
    F.b('mud_plaster', u0 + 0.5, 0, v0 + 0.5, u0 + 1.8, 0.8, v0 + 1.8);
    for (let i = 0; i < 8; i++) F.lathe('terracotta', JAR(0.14 + 0.03 * (i % 3)), u1 - 3.2 + (i % 4) * 0.6, 0, v1 - 1.3 + Math.floor(i / 4) * 0.6, 8);
    jars(u0 + 0.4, v1 - 0.8, 3); stove(u1 - 1.8, v0 + 0.4);
  } else {
    // the cook's: a long table with a board and a cleaver, a big stove with two pots and a steamer, jars of salt and meal, strings of dried fish
    stove(u0 + 0.4, v1 - 1.3); F.b('brick_grey', u0 + 2.1, 0, v1 - 1.3, u0 + 3.6, 0.72, v1 - 0.3); F.lathe('pottery_dark', [[0.001, 0.72], [0.34, 0.78], [0.4, 1.0], [0.001, 1.1]], u0 + 2.85, 0, v1 - 0.8, 10);
    for (let k = 0; k < 3; k++) F.lathe('timber', [[0.3, 1.1 + k * 0.12], [0.3, 1.2 + k * 0.12]], u0 + 2.85, 0, v1 - 0.8, 10);   // the steamer's tiers
    F.b('timber', mid, 0, v0 + 1.2, mid + 2.4, 0.78, v0 + 2.0); F.b('log_pine', mid + 0.2, 0.78, v0 + 1.3, mid + 1.0, 0.86, v0 + 1.9, false); F.b('iron', mid + 1.4, 0.78, v0 + 1.4, mid + 1.8, 0.8, v0 + 1.55, false);
    jars(u1 - 1.8, v1 - 0.8, 3); jars(u1 - 1.8, v0 + 0.5, 3);
    for (let k = 0; k < 5; k++) F.rod('rope_fibre', [mid - 1 + k * 0.5, 2.4, v1 - 0.4], [mid - 1 + k * 0.5, 1.7, v1 - 0.4], 0.01, 3), F.b('hide_tan', mid - 1.05 + k * 0.5, 1.4, v1 - 0.43, mid - 0.95 + k * 0.5, 1.75, v1 - 0.37, false);
  }
}
/** Which household: by seed. */
const HOUSEHOLDS = ['family', 'family', 'weaver', 'smith', 'potter', 'cook', 'family', 'weaver'];

/** The doors' places in a lot's frame (u), for dressing laid outside by town.js: { u, w, kind }. */
export function doorOf(el) {
  const rand = rng(el.seed), W = el.rect[2] - el.rect[0];
  if (el.kind === 'row') { rand(); rand(); return { u: W * (0.3 + rand() * 0.4), w: 1.0 }; }
  if (el.kind === 'court') { rand(); return { u: W * (0.25 + rand() * 0.5), w: 1.8 }; }
  if (el.kind === 'official') return { u: W / 2, w: 3.2 };
  return { u: W / 2, w: 1.2 };
}

/** qin_row_house: { rect, front, seed, open } — the workman's house: door and one room, a back room, a roof of grey tile, of thatch or flat. */
export function rowHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col, ctx.lights), W = F.W, D = F.D, th = 0.55, H = 3.0 + rand() * 0.3, wm = WALLS[Math.floor(rand() * WALLS.length)], open = !!el.open;
  const uD = W * (0.3 + rand() * 0.4), rk = rand(), roof = rk < 0.42 ? 'tile' : rk < 0.72 ? 'thatch' : 'flat', rise = 1.5 + rand() * 0.5;
  const uW = uD < W / 2 ? W * 0.5 + (W - W * 0.5) * 0.5 : W * 0.25;
  const wk = rand() < 0.5 ? 'lattice' : 'shutter', hh = HOUSEHOLDS[Math.floor(rand() * HOUSEHOLDS.length)];
  frontWall(F, wm, 0, th, H, [{ u: uD, w: 1.0, y0: 0, y1: 1.95 }, { u: Math.min(W - 0.9, Math.max(0.9, uW)), w: 0.8, y0: 1.2, y1: 1.95 }]);
  doorFit(F, uD, 1.0, 1.95, 0, th, open, rand);
  windowFit(F, Math.min(W - 0.9, Math.max(0.9, uW)), 1.2, 0.8, 0.75, 0, th, wk, open);
  F.b(wm, 0, 0, th, th, H, D); F.b(wm, W - th, 0, th, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  F.b('opening', W * 0.7, 2.2, D - th - 0.02, W * 0.7 + 0.4, 2.55, D - th + 0.02, false);                                 // the back's vent
  frontWear(F, rand, W, H, uD);
  if (open) {
    F.b(wm, th, 0, D * 0.55, W * 0.55 - 0.5, H, D * 0.55 + 0.4); F.b(wm, W * 0.55 + 0.5, 0, D * 0.55, W - th, H, D * 0.55 + 0.4); F.b('timber', W * 0.55 - 0.5, 2.0, D * 0.55, W * 0.55 + 0.5, H, D * 0.55 + 0.4, false);
    furnish(F, rand, th, th, W - th, D * 0.55, hh);
    if (el.lit) F.light(W * 0.5, 2.3, D * 0.28);
    // the back room: the bed (a low platform with mats and a quilt), a chest, a lamp, a basket of mending
    const bu = th + 0.4, bv = D * 0.55 + 0.9;
    F.b('timber', bu, 0, bv, bu + 2.4, 0.32, bv + 1.5); F.b('reed_mat', bu + 0.05, 0.32, bv + 0.05, bu + 2.35, 0.34, bv + 1.45, false); F.b(rand() < 0.5 ? 'cloth_indigo' : 'cloth_brown', bu + 0.9, 0.34, bv + 0.1, bu + 2.3, 0.5, bv + 1.4, false);
    F.b('timber', W - 2.2, 0, D - th - 0.9, W - th - 0.1, 0.55, D - th - 0.1); F.lathe('wicker', [[0.001, 0], [0.22, 0.03], [0.26, 0.24], [0.001, 0.26]], W - 3, 0, D - 1.0, 8);
  }
  if (roof === 'flat') flatRoof(F, 0, 0, W, D, H, rand);
  else { gable(F, 0, 0, W, D, H, rise, roof === 'tile' ? 'tile_grey' : 'thatch', 0.55); eave(F, -0.4, W + 0.4, -0.55, H, roof === 'tile'); ridgeEnds(F, 0, W, 0, D, H + rise, roof === 'tile'); }
  if (open && roof !== 'flat') BEAMS(F, H, rise, W, D);
  if (roof !== 'flat' && rand() < 0.5) { const u = W * (0.15 + rand() * 0.2); F.lathe('pottery_dark', [[0.2, 0], [0.18, 0.5], [0.12, 0.55], [0.12, 0.8]], u, H + rise * 0.55, D * 0.7, 8); }      // a chimney pot
}

/** qin_court_house: { rect, front, seed, open } — a walled court with a gate, the house of two rooms behind, a shed, the court's furniture. */
export function courtHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col, ctx.lights), W = F.W, D = F.D, th = 0.55, wm = WALLS[Math.floor(rand() * WALLS.length)], open = !!el.open;
  const cv = 5.8 + rand() * 1.6, uD = W * (0.25 + rand() * 0.5), H = 3.3 + rand() * 0.4, HW = 2.6, tile = rand() < 0.7;
  frontWall(F, wm, 0, th, HW, [{ u: uD, w: 1.8, y0: 0, y1: 2.3 }]);
  doorFit(F, uD, 1.8, 2.3, 0, th, open, rand, false);
  F.b(wm, 0, 0, th, th, HW, cv); F.b(wm, W - th, 0, th, W, HW, cv);
  frontWear(F, rand, W, HW, uD);
  gable(F, uD - 1.4, -0.1, uD + 1.4, th + 0.2, HW, 0.7, 'tile_grey', 0.5);                               // the little roof over the gate
  eave(F, uD - 1.8, uD + 1.8, -0.6, HW, true);
  for (const s of [-1, 1]) F.b('timber', uD + s * 1.25 - 0.1, 0, -0.35, uD + s * 1.25 + 0.1, HW + 0.1, -0.15, false);          // the gate posts under the roof
  F.b(wm, 0, 0, cv, th, H, D); F.b(wm, W - th, 0, cv, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  frontWall(F, wm, cv, cv + th, H, [{ u: W * 0.5, w: 1.2, y0: 0, y1: 2.1 }, { u: W * 0.2, w: 0.7, y0: 1.2, y1: 1.95 }, { u: W * 0.8, w: 0.7, y0: 1.2, y1: 1.95 }]);
  F.b('timber', W * 0.5 - 0.6, 2.1, cv, W * 0.5 + 0.6, H, cv + th, false);
  F.b('timber', W * 0.5 - 0.7, 0, cv - 0.05, W * 0.5 - 0.6, 2.1, cv + th + 0.05, false); F.b('timber', W * 0.5 + 0.6, 0, cv - 0.05, W * 0.5 + 0.7, 2.1, cv + th + 0.05, false);
  windowFit(F, W * 0.2, 1.2, 0.7, 0.75, cv, cv + th, 'lattice', open); windowFit(F, W * 0.8, 1.2, 0.7, 0.75, cv, cv + th, 'lattice', open);
  F.b('tile_grey', -0.02, 0.02, cv - 0.02, W + 0.02, 0.285, cv + 0.04, false);
  if (open) furnish(F, rand, th, cv + th, W - th, D - th, HOUSEHOLDS[Math.floor(rand() * HOUSEHOLDS.length)]);
  if (open && el.lit) F.light(W * 0.5, 2.3, cv + (D - cv) * 0.5);
  const rise = 1.7 + rand() * 0.4;
  gable(F, 0, cv, W, D, H, rise, tile ? 'tile_grey' : 'thatch', 0.7);
  eave(F, -0.5, W + 0.5, cv - 0.7, H, tile); ridgeEnds(F, 0, W, cv, D, H + rise, tile);
  if (open) BEAMS(F, H, rise, W, D - cv + cv, cv + 0.6);
  // in the court: a well with its windlass, a pen of wicker, the oven, a millstone, jars; a shed along one wall; a woodpile; a haystack
  const side = rand() < 0.5 ? 1 : -1, uw = side > 0 ? W - 1.6 : 1.6;
  F.b('brick_grey', uw - 0.5, 0, 2.2, uw + 0.5, 0.5, 3.2); F.lathe('timber', [[0.5, 0.5], [0.001, 0.5]], uw, 0, 2.7, 8);
  F.b('timber', uw - 0.5, 0.5, 2.15, uw - 0.4, 1.9, 2.25, false); F.b('timber', uw + 0.4, 0.5, 2.15, uw + 0.5, 1.9, 2.25, false); F.b('timber', uw - 0.5, 1.9, 2.15, uw + 0.5, 2.0, 2.25, false);
  F.rod('timber', [uw - 0.55, 1.85, 2.7], [uw + 0.55, 1.85, 2.7], 0.04, 5); F.rod('rope_fibre', [uw, 1.85, 2.7], [uw, 1.2, 2.7], 0.012, 3); F.lathe('timber', [[0.12, 0], [0.14, 0.25]], uw, 1.0, 2.7, 7);
  const sh = side > 0 ? [th + 0.1, 2.8, th + 3.2, 5.2] : [W - th - 3.2, 2.8, W - th - 0.1, 5.2];
  F.b('timber', sh[0], 0, sh[1], sh[0] + 0.1, 2.0, sh[1] + 0.1, false); F.b('timber', sh[2] - 0.1, 0, sh[1], sh[2], 2.0, sh[1] + 0.1, false); F.b('timber', sh[0], 0, sh[3] - 0.1, sh[0] + 0.1, 2.0, sh[3], false); F.b('timber', sh[2] - 0.1, 0, sh[3] - 0.1, sh[2], 2.0, sh[3], false);
  F.b('thatch', sh[0] - 0.2, 2.0, sh[1] - 0.2, sh[2] + 0.2, 2.25, sh[3] + 0.2, false);
  for (let i = 0; i < 4; i++) F.lathe('terracotta', JAR(0.2), sh[0] + 0.5 + i * 0.7, 0, sh[3] - 0.7, 8);
  const mu = side > 0 ? 3.6 : W - 3.6;
  F.lathe('granite_grey', [[0.55, 0], [0.55, 0.3], [0.5, 0.3]], mu, 0, 4.4, 14); F.lathe('granite_grey', [[0.5, 0.3], [0.5, 0.5], [0.001, 0.5]], mu, 0.0, 4.4, 14); F.rod('timber', [mu, 0.5, 4.4], [mu + 0.5, 0.9, 4.4], 0.025, 4);   // the quern
  col.circle(F.X(mu), F.Z(4.4), 0.6, 0, 0.55);
  F.b('lattice', W * 0.5 - 1.2, 0, 1.0, W * 0.5 + 1.2, 0.9, 1.1, false);                                               // a wicker hurdle behind the gate
  if (rand() < 0.6) F.lathe('thatch', [[1.0, 0], [1.1, 0.5], [0.95, 1.2], [0.6, 1.8], [0.001, 2.1]], side > 0 ? 3.5 : W - 3.5, 0, cv - 1.5, 10);                     // a stack of straw
}

/** qin_official: { rect, front, seed, open } — an official's house on a raised earth platform, a gate with a plaque, a hall with a porch of columns. */
export function official(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col, ctx.lights), W = F.W, D = F.D, th = 0.65, P = 0.9, H = 4.0, open = !!el.open;
  const uD = W / 2, cv = 6.5;
  // the gate: a bay on the street wall with a tile roof, doors of red lacquer, a plaque above, two banner posts before it
  F.b('earth_wall', 0, 0, 0, uD - 1.6, 2.9, th); F.b('earth_wall', uD + 1.6, 0, 0, W, 2.9, th);
  F.b('timber_red', uD - 1.6, 2.4, 0, uD + 1.6, 3.2, th, false);
  for (const s of [-1, 1]) F.b('timber_red', uD + s * 1.6 - 0.15, 0, -0.05, uD + s * 1.6 + 0.15, 3.2, th + 0.05, true);
  if (!open) { F.b('lacquer_red', uD - 1.45, 0.02, 0.2, uD + 1.45, 2.4, 0.32); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (const s of [-1, 1]) F.b('bronze', uD + s * (0.2 + i * 0.34) - 0.04, 0.3 + j * 0.55, 0.32, uD + s * (0.2 + i * 0.34) + 0.04, 0.38 + j * 0.55, 0.37, false); }
  gable(F, uD - 2.4, -0.2, uD + 2.4, th + 0.3, 3.2, 1.0, 'tile_grey', 0.5); eave(F, uD - 2.9, uD + 2.9, -0.7, 3.2, true);
  F.b('lacquer_black', uD - 1.0, 3.2, -0.12, uD + 1.0, 3.7, -0.04, false); F.b('paint_ochre', uD - 0.9, 3.28, -0.13, uD + 0.9, 3.62, -0.1, false);    // the plaque
  for (const s of [-1, 1]) { const px = uD + s * 4.2; F.lathe('log_pine', [[0.12, 0], [0.1, 6.0]], px, 0, -1.4, 8); F.b('timber', px - 0.35, 5.4, -1.45, px + 0.35, 5.5, -1.35, false); F.b('cloth_black', px - 0.3, 3.0, -1.44, px + 0.3, 5.3, -1.36, false); col.circle(F.X(px), F.Z(-1.4), 0.2, 0, 6); }
  F.b('earth_wall', 0, 0, th, th, 2.9, D); F.b('earth_wall', W - th, 0, th, W, 2.9, D); F.b('earth_wall', 0, 0, D - th, W, 2.9, D);
  frontWear(F, rand, W, 2.9, uD);
  // the hall on its platform
  const hu0 = 2.2, hu1 = W - 2.2, hv0 = cv, hv1 = Math.min(D - 2.2, cv + 9);
  F.b('earth_wall', hu0 - 0.8, 0, hv0 - 0.8, hu1 + 0.8, P, hv1 + 0.8, true);
  F.b('brick_grey', hu0 - 0.85, P - 0.08, hv0 - 0.85, hu1 + 0.85, P + 0.04, hv1 + 0.85, false);
  const wallsH = 3.6;
  F.b('palace_wall', hu0, P, hv1 - th, hu1, P + wallsH, hv1); F.b('palace_wall', hu0, P, hv0, hu0 + th, P + wallsH, hv1); F.b('palace_wall', hu1 - th, P, hv0, hu1, P + wallsH, hv1);
  const dc = (hu0 + hu1) / 2;
  F.b('palace_wall', hu0 + th, P, hv0, dc - 1.2, P + wallsH, hv0 + th); F.b('palace_wall', dc + 1.2, P, hv0, hu1 - th, P + wallsH, hv0 + th); F.b('timber_red', dc - 1.2, P + 2.4, hv0, dc + 1.2, P + wallsH, hv0 + th, false);
  for (let u = hu0; u <= hu1 + 0.01; u += (hu1 - hu0) / 4) { F.b('timber_red', u - 0.2, P, hv0 - 1.4, u + 0.2, P + wallsH, hv0 - 1.0); F.b('granite_grey', u - 0.3, P, hv0 - 1.5, u + 0.3, P + 0.15, hv0 - 0.9, false); }
  F.b('lacquer_black', hu0 - 0.3, P + wallsH + 0.02, hv0 - 1.5, hu1 + 0.3, P + wallsH + 0.37, hv0 - 0.9, false);
  F.col.ramp(F.R(dc - 2, hv0 - 4.8, dc + 2, hv0 - 0.8), 0, P, F.rise);
  for (let i = 0; i < 5; i++) F.b('brick_grey', dc - 2, 0, hv0 - 4.8 + i * 0.8, dc + 2, (i + 1) * 0.18, hv0 - 4.0 + i * 0.8, false);
  F.b('earth_wall', hu0 - 0.6, P + wallsH, hv0 - 1.5, hu1 + 0.6, P + wallsH + 0.01, hv1 + 0.6, false);
  gable(F, hu0 - 0.6, hv0 - 1.5, hu1 + 0.6, hv1 + 0.2, P + wallsH + 0.3, 2.3, 'tile_grey', 0.9);
  eave(F, hu0 - 1.4, hu1 + 1.4, hv0 - 2.4, P + wallsH + 0.3, true); ridgeEnds(F, hu0 - 0.6, hu1 + 0.6, hv0 - 1.5, hv1 + 0.2, P + wallsH + 0.3 + 2.3, true);
  if (open && el.lit) F.light(dc, P + 2.5, (hv0 + hv1) / 2);
  if (open) {
    F.b('reed_mat', hu0 + th + 1, P + 0.08, hv0 + th + 1, hu1 - th - 1, P + 0.11, hv1 - th - 1, false); F.b('lacquer_black', dc - 1.2, P + 0.05, hv1 - th - 1.6, dc + 1.2, P + 0.6, hv1 - th - 0.3); F.b('lacquer_red', dc - 1.0, P + 0.6, hv1 - th - 1.5, dc + 1.0, P + 0.66, hv1 - th - 0.4, false);
    F.b('lacquer_black', dc - 2.6, P + 0.08, hv1 - th - 3.8, dc - 0.8, P + 0.38, hv1 - th - 3.0); F.b('lacquer_black', dc + 0.8, P + 0.08, hv1 - th - 3.8, dc + 2.6, P + 0.38, hv1 - th - 3.0);   // two low tables
    F.b('lacquer_black', hu0 + th + 0.2, P + 0.08, hv1 - th - 3.2, hu0 + th + 0.5, P + 1.9, hv1 - th - 0.4, false); F.b('paint_white', hu0 + th + 0.5, P + 0.5, hv1 - th - 3.1, hu0 + th + 0.55, P + 1.8, hv1 - th - 0.5, false);   // a screen
    for (const s of [-1, 1]) { F.lathe('bronze', [[0.2, 0], [0.04, 0.2], [0.04, 1.3], [0.2, 1.4], [0.001, 1.5]], dc + s * 3.2, P + 0.08, hv1 - th - 1.2, 9); F.lathe('flame', [[0.001, 1.5], [0.07, 1.58], [0.001, 1.85]], dc + s * 3.2, P + 0.08, hv1 - th - 1.2, 6); }
    for (let k = 0; k < 4 && hu0 + th + 0.2 + k * 2.2 < hu1 - th - 0.3; k++) F.rod('timber', [hu0 + th + 0.2 + k * 2.2, P + wallsH - 0.2, hv0 + th + 0.1], [hu0 + th + 0.2 + k * 2.2, P + wallsH - 0.2, hv1 - th - 0.1], 0.07, 5);
  }
  F.lathe('bronze', [[0.001, 0], [0.4, 0.05], [0.5, 0.5], [0.001, 0.55]], dc + 4, 0, 3.4, 12);
  F.b('granite_grey', dc - 7, 0, 3.2, dc - 6.2, 0.8, 4.0);                                                              // a horse-block
  void rand;
}

/** qin_granary: { rect, front, seed } — a granary (cang): a floor of planks on posts and a stone footing, walls of boards, a thatched roof, a ladder, sacks. */
export function granary(el, ctx) {
  const { bag } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, ctx.col), W = F.W, D = F.D;
  const w = Math.min(W - 2, 6), d = Math.min(D - 4, 6), u0 = (W - w) / 2, v0 = 3, h = 0.9, H = 2.6;
  for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) F.b('brick_grey', u0 + i * (w - 0.4) / 3, 0, v0 + j * (d - 0.4) / 3, u0 + i * (w - 0.4) / 3 + 0.4, h, v0 + j * (d - 0.4) / 3 + 0.4, i === 0 || j === 0 || i === 3 || j === 3);
  for (let i = 0; i <= 3; i++) for (const j of [0, 3]) F.b('granite_grey', u0 + i * (w - 0.4) / 3 - 0.08, h, v0 + j * (d - 0.4) / 3 - 0.08, u0 + i * (w - 0.4) / 3 + 0.48, h + 0.06, v0 + j * (d - 0.4) / 3 + 0.48, false);   // the rat-guards
  F.b('timber', u0 - 0.1, h, v0 - 0.1, u0 + w + 0.1, h + 0.15, v0 + d + 0.1);
  F.b('planks_grey', u0, h + 0.15, v0, u0 + w, h + H, v0 + d);
  for (let k = 1; k < 6; k++) F.b('timber', u0 + k * w / 6 - 0.02, h + 0.15, v0 - 0.025, u0 + k * w / 6 + 0.02, h + H, v0, false);
  F.b('timber', u0 + w / 2 - 0.6, h + 0.15, v0 - 0.04, u0 + w / 2 + 0.6, h + 1.9, v0 + 0.02, false);
  F.b('opening', u0 + w / 2 + 1.4, h + 1.7, v0 - 0.02, u0 + w / 2 + 1.9, h + 2.1, v0 + 0.03, false);
  gable(F, u0, v0, u0 + w, v0 + d, h + H, 1.5, 'thatch', 0.7); ridgeEnds(F, u0, u0 + w, v0, v0 + d, h + H + 1.5, false);
  F.b('timber', u0 + w / 2 - 0.3, 0, v0 - 1.2, u0 + w / 2 - 0.2, 0.2, v0 - 0.2, false);
  for (let k = 0; k < 4; k++) F.b('timber', u0 + w / 2 - 0.5, 0.2 + k * 0.1, v0 - 1.4 + k * 0.28, u0 + w / 2 + 0.5, 0.3 + k * 0.1, v0 - 1.2 + k * 0.28, false);
  F.b('mud_plaster', u0 - 1.5, 0, v0 + d - 1.5, u0 - 0.3, 0.3, v0 + d + 1.0, false);                                  // a threshing floor's edge
  void rand;
}

/** qin_garden: { rect, front, seed } — a fenced plot of vegetables, a well and a coop. */
export function garden(el, ctx) {
  const { bag } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, ctx.col), W = F.W, D = F.D;
  for (const [a, b, c, d] of [[0, 0, W, 0.1], [0, D - 0.1, W, D], [0, 0, 0.1, D], [W - 0.1, 0, W, D]]) F.b('timber', a, 0, b, c, 1.1, d, false);
  for (let u = 0; u < W; u += 1.6) for (const v of [0, D - 0.1]) F.b('timber', u, 0, v - 0.05, u + 0.12, 1.4, v + 0.15, false);
  for (let i = 0; i < 4; i++) F.b('earth_wall', 1.5 + i * 2.2, 0, 3, 2.5 + i * 2.2, 0.25, D - 3, false);
  for (let i = 0; i < 4; i++) F.b('cloth_green', 1.6 + i * 2.2, 0.25, 3.1, 2.4 + i * 2.2, 0.55, D - 3.1, false);
  F.b('brick_grey', W - 2.2, 0, D - 2.4, W - 1.2, 0.6, D - 1.4);
  // a gate in the fence, a bean trellis of poles, a scarecrow of straw and a coop on legs
  F.b('timber_red', W * 0.5 - 0.5, 0, -0.05, W * 0.5 + 0.5, 1.2, 0.12, false);
  for (let k = 0; k < 6; k++) F.rod('timber', [1.4 + k * 0.6, 0, 3.0], [1.7 + k * 0.6, 1.8, 3.4], 0.025, 4);
  F.lathe('thatch', [[0.2, 0], [0.12, 1.0], [0.18, 1.3], [0.001, 1.6]], 3.5, 0.2, D * 0.55, 8); F.b('timber', 3.0, 1.3, D * 0.55 - 0.03, 4.0, 1.34, D * 0.55 + 0.03, false);
  F.b('timber', 1.0, 0.5, D - 2.0, 2.2, 0.55, D - 1.2, false); F.b('wicker', 1.05, 0.55, D - 1.95, 2.15, 1.0, D - 1.25, false); F.b('thatch', 0.9, 1.0, D - 2.1, 2.3, 1.1, D - 1.1, false);
  void rand;
}
