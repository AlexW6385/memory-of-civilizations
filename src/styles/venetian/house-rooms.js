// The furniture of the upper rooms of the houses of Venice (docs/settlements/venice.md §5e), by use: beds and bedding, chests, a loom and a bench
// for the weaver's workroom, barrels, sacks, crates and bales for the store, a table, a cupboard, a cradle, a washstand. Every piece is drawn in
// the house's frame (u along the front from the door's side, v inward) through the helpers of `Q` (venetian/house-up.js) and carries its own
// collider. Materials are those the house plan already has: wood_dark, timber, plaster_white, terracotta, cloth_white, cloth_red, iron.
import { lathe } from '../../core/geom.js';

/** A pot: a turned vessel standing at (u, v) on a surface `ya` above the floor. */
const pot = (Q, mat, u, v, r, ht, ya) => Q.turn(mat, u, v, [[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], ya);

/** A bed in the rectangle (u0, v0, u1, v1), its head at the end `head` ('u0' | 'u1' | 'v0' | 'v1'); `kind` 'bed' (a frame with a mattress and a red cover) or 'pallet' (a mattress on the boards). */
export function bed(Q, u0, v0, u1, v1, head = 'v1', kind = 'bed') {
  const { B } = Q, lo = kind === 'bed' ? 0.3 : 0.12, along = head === 'u0' || head === 'u1';
  B('wood_dark', u0, v0, u1, v1, 0, lo, true);
  B('cloth_white', u0 + 0.04, v0 + 0.04, u1 - 0.04, v1 - 0.04, lo, lo + 0.13);
  const cut = (along ? u1 - u0 : v1 - v0) * 0.36;                                       // the cover over the foot's two thirds, the pillow at the head
  const cov = { u0: [u0 + 0.04 + cut, v0 + 0.02, u1 - 0.02, v1 - 0.02], u1: [u0 + 0.02, v0 + 0.02, u1 - 0.04 - cut, v1 - 0.02], v0: [u0 + 0.02, v0 + 0.04 + cut, u1 - 0.02, v1 - 0.02], v1: [u0 + 0.02, v0 + 0.02, u1 - 0.02, v1 - 0.04 - cut] }[head];
  B(kind === 'bed' ? 'cloth_red' : 'cloth_white', cov[0], cov[1], cov[2], cov[3], lo + 0.13, lo + 0.17);
  const pl = { u0: [u0 + 0.08, v0 + 0.1, u0 + 0.38, v1 - 0.1], u1: [u1 - 0.38, v0 + 0.1, u1 - 0.08, v1 - 0.1], v0: [u0 + 0.1, v0 + 0.08, u1 - 0.1, v0 + 0.38], v1: [u0 + 0.1, v1 - 0.38, u1 - 0.1, v1 - 0.08] }[head];
  B('cloth_white', pl[0], pl[1], pl[2], pl[3], lo + 0.13, lo + 0.24);
  if (kind === 'bed') {                                                                   // the headboard and the low footboard
    const hb = { u0: [u0, v0, u0 + 0.07, v1], u1: [u1 - 0.07, v0, u1, v1], v0: [u0, v0, u1, v0 + 0.07], v1: [u0, v1 - 0.07, u1, v1] }[head];
    B('wood_dark', hb[0], hb[1], hb[2], hb[3], lo, lo + 0.6);
    const fb = { u0: [u1 - 0.05, v0, u1, v1], u1: [u0, v0, u0 + 0.05, v1], v0: [u0, v1 - 0.05, u1, v1], v1: [u0, v0, u1, v0 + 0.05] }[head];
    B('wood_dark', fb[0], fb[1], fb[2], fb[3], lo, lo + 0.34);
  }
}

/** A chest (cassone) with an iron band, its long side along u (`w` along u, `d` along v). */
export function chest(Q, u, v, w = 1.0, d = 0.5, h = 0.55) {
  const { B } = Q;
  B('wood_dark', u - w / 2, v - d / 2, u + w / 2, v + d / 2, 0, h, true);
  B('timber', u - w / 2 - 0.02, v - d / 2 - 0.02, u + w / 2 + 0.02, v + d / 2 + 0.02, h, h + 0.05);
  B('iron', u - w / 2 + 0.12, v - d / 2 - 0.012, u - w / 2 + 0.17, v + d / 2 + 0.012, 0.05, h);
  B('iron', u + w / 2 - 0.17, v - d / 2 - 0.012, u + w / 2 - 0.12, v + d / 2 + 0.012, 0.05, h);
}

/** A table with a top and four legs. */
export function table(Q, u, v, w, d, h = 0.78, mat = 'wood_dark') {
  const { B } = Q;
  B(mat, u - w / 2, v - d / 2, u + w / 2, v + d / 2, h - 0.06, h, true);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(mat, u + a * (w / 2 - 0.08) - 0.04, v + b * (d / 2 - 0.08) - 0.04, u + a * (w / 2 - 0.08) + 0.04, v + b * (d / 2 - 0.08) + 0.04, 0, h - 0.06);
}
export const stool = (Q, u, v) => Q.B('timber', u - 0.18, v - 0.18, u + 0.18, v + 0.18, 0, 0.45, true);

/** A cupboard (credenza) against a wall: a body with shelves and the crockery on them. */
export function cupboard(Q, u0, v0, u1, v1, ht = 1.9) {
  const { B } = Q;
  B('wood_dark', u0, v0, u1, v1, 0, ht, true);
  const wide = u1 - u0 >= v1 - v0;
  for (const hh of [0.8, 1.3]) {
    for (let k = 0; k < 3; k++) { const f = (k + 0.5) / 3; pot(Q, (u0 * 7 + v0 * 3 + k) % 2 > 1 ? 'plaster_white' : 'terracotta', wide ? u0 + (u1 - u0) * f : (u0 + u1) / 2, wide ? (v0 + v1) / 2 : v0 + (v1 - v0) * f, 0.07, 0.15, hh + 0.03); }
  }
}

/** A barrel standing on its end. */
export function barrel(Q, u, v, r = 0.32, ht = 0.8) {
  Q.turn('timber', u, v, [[r * 0.85, 0], [r, ht * 0.35], [r, ht * 0.65], [r * 0.85, ht], [0.001, ht]], 0, 12);
  Q.circ(u, v, r, ht);
}
/** A sack of grain or flour. */
export function sack(Q, u, v, r = 0.28) {
  Q.turn('cloth_white', u, v, [[r * 0.7, 0], [r, 0.18], [r * 0.9, 0.42], [r * 0.4, 0.58], [0.001, 0.6]], 0, 8);
  Q.circ(u, v, r, 0.6);
}
/** A crate or a stack of them. */
export function crate(Q, u, v, s = 0.6, n = 1) {
  for (let k = 0; k < n; k++) Q.B(k % 2 ? 'timber' : 'wood_dark', u - s / 2 + k * 0.03, v - s / 2, u + s / 2 + k * 0.03, v + s / 2, k * s, (k + 1) * s, k === 0);
}
/** A bale of cloth, its wrapping white and a red band round it. */
export function bale(Q, u, v, w = 0.9, d = 0.55, h = 0.5, ya = 0) {
  Q.B('cloth_white', u - w / 2, v - d / 2, u + w / 2, v + d / 2, ya, ya + h, ya === 0);
  Q.B('cloth_red', u - 0.05, v - d / 2 - 0.012, u + 0.05, v + d / 2 + 0.012, ya, ya + h);
}
/** Shelves along a wall (the wall at the back of the rectangle) with rolls of cloth or pots. */
export function shelves(Q, u0, v0, u1, v1, rolls = true) {
  const { B } = Q, wide = u1 - u0 >= v1 - v0, n = 3;
  for (const s of [-1, 1]) B('wood_dark', wide ? u0 + (s < 0 ? 0 : (u1 - u0) - 0.05) : u0, wide ? v0 : v0 + (s < 0 ? 0 : (v1 - v0) - 0.05), wide ? u0 + (s < 0 ? 0.05 : (u1 - u0)) : u1, wide ? v1 : v0 + (s < 0 ? 0.05 : (v1 - v0)), 0, 2.0, true);
  for (let k = 0; k < n; k++) {
    const hh = 0.5 + k * 0.6;
    B('wood_dark', u0, v0, u1, v1, hh, hh + 0.04);
    for (let q = 0; q < 3; q++) { const f = (q + 0.5) / 3, uu = wide ? u0 + (u1 - u0) * f : (u0 + u1) / 2, vv = wide ? (v0 + v1) / 2 : v0 + (v1 - v0) * f; if (rolls) B((q + k) % 2 ? 'cloth_red' : 'cloth_white', uu - 0.14, vv - 0.14, uu + 0.14, vv + 0.14, hh + 0.04, hh + 0.3); else pot(Q, 'terracotta', uu, vv, 0.08, 0.2, hh + 0.04); }
  }
}
/** A standing loom of timber: two posts, the beams, the warp hanging in a red cloth, the weaver's bench. */
export function loom(Q, u, v, w = 1.5) {
  const { B } = Q;
  for (const s of [-1, 1]) B('wood_dark', u + s * w / 2 - 0.05, v - 0.05, u + s * w / 2 + 0.05, v + 0.05, 0, 1.9, true);
  B('timber', u - w / 2, v - 0.06, u + w / 2, v + 0.06, 1.75, 1.88);
  B('timber', u - w / 2, v - 0.06, u + w / 2, v + 0.06, 0.55, 0.65);
  B('cloth_red', u - w / 2 + 0.1, v - 0.02, u + w / 2 - 0.1, v + 0.02, 0.65, 1.75);
  for (let k = 0; k < 6; k++) { const x = u - w / 2 + 0.2 + k * (w - 0.4) / 5; B('cloth_white', x - 0.012, v + 0.03, x + 0.012, v + 0.05, 0.8, 1.75); }
  B('timber', u - 0.6, v + 0.55, u + 0.6, v + 0.95, 0, 0.45, true);                       // the bench
}
/** A work table with tools on it. */
export function bench(Q, u, v, w = 1.8, d = 0.8) {
  const { B } = Q;
  table(Q, u, v, w, d, 0.9, 'timber');
  B('iron', u - 0.5, v - 0.1, u - 0.3, v - 0.07, 0.9, 0.93); B('iron', u + 0.1, v + 0.1, u + 0.45, v + 0.13, 0.9, 0.93);
  B('cloth_red', u + 0.45, v - 0.25, u + 0.8, v + 0.15, 0.9, 1.0);
}
/** A cradle on rockers. */
export function cradle(Q, u, v) {
  const { B } = Q;
  B('wood_dark', u - 0.3, v - 0.2, u + 0.3, v + 0.2, 0.06, 0.35, true);
  B('cloth_white', u - 0.26, v - 0.16, u + 0.26, v + 0.16, 0.35, 0.4);
  for (const s of [-1, 1]) B('timber', u + s * 0.3 - 0.03, v - 0.3, u + s * 0.3 + 0.03, v + 0.3, 0, 0.06);
}
/** A washstand: a basin on a frame, a jug beside it. */
export function washstand(Q, u, v) {
  const { B } = Q;
  B('wood_dark', u - 0.3, v - 0.25, u + 0.3, v + 0.25, 0, 0.85, true);
  Q.turn('plaster_white', u - 0.08, v, [[0.001, 0], [0.12, 0.02], [0.2, 0.1], [0.001, 0.08]], 0.85, 10);
  pot(Q, 'terracotta', u + 0.2, v + 0.05, 0.06, 0.22, 0.85);
}
/** A table lamp (a lucerna) and the light it gives. */
export function lamp(Q, u, v, ya, k = 1.8) { pot(Q, 'terracotta', u, v, 0.05, 0.09, ya); Q.light(u, v, ya + 0.3, k); }

/** Hay and a rough bed on the boards: a pallet for a servant or a lodger. */
export const pallet = (Q, u0, v0, u1, v1, head) => bed(Q, u0, v0, u1, v1, head, 'pallet');

/**
 * Furnishes a room { u0, v0, u1, v1 } (its inside, in the house's frame; the door in `door` = [u, v] on its edge) of a house of `kind` on
 * floor `s` (1 = the piano nobile) of `n` storeys (the top one is the store under the roof).
 */
export function furnish(Q, R, { kind, s, top, back, use }) {
  const { u0, v0, u1, v1 } = R, W = u1 - u0, Dp = v1 - v0, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, r = Q.rand(cu, cv);
  const bedHere = (head = 'v1') => {                                                       // a bed in the corner far from the door, along the side wall
    const w = 1.05, l = 2.0;
    if (head === 'v1') bed(Q, u0 + 0.05, v1 - l - 0.05, u0 + 0.05 + w, v1 - 0.05, 'v1');
    else bed(Q, u0 + 0.05, v0 + 0.05, u0 + 0.05 + w, v0 + 0.05 + l, 'v0');
  };
  const wallBed = (head) => (Dp >= 2.4 ? bedHere(head) : null);
  const near = back ? 'v1' : 'v0';                                                         // the room's wall toward the street (front room) or the back
  if (top) {
    // under the roof: the store (barrels, sacks, crates, a bale or two) and a servant's pallet, kept to the wall away from the door
    const fv = (d) => (back ? v0 + d : v1 - d), sgn = back ? 1 : -1;
    barrel(Q, u0 + 0.5, fv(0.5)); barrel(Q, u0 + 1.25, fv(0.5)); sack(Q, u0 + 0.4, fv(1.3)); sack(Q, u0 + 0.55, fv(1.75), 0.24);
    crate(Q, u1 - 1.4, fv(0.5), 0.6, 2); crate(Q, u1 - 2.1, fv(0.45), 0.55, 1);
    bale(Q, cu, fv(1.6)); bale(Q, cu, fv(1.6), 0.9, 0.55, 0.5, 0.5);
    if (sgn > 0) pallet(Q, u1 - 1.15, v0 + 0.15, u1 - 0.15, v0 + 2.1, 'v0'); else pallet(Q, u1 - 1.15, v1 - 2.1, u1 - 0.15, v1 - 0.15, 'v1');
    chest(Q, u0 + 2.6, fv(0.4), 1.0, 0.5);
    return;
  }
  switch (kind) {
    case 'merchant':
      if (s === 1 && !back) {                                                              // the study: a writing table by the window, a chair, a chest, shelves of ledgers
        table(Q, cu, v0 + 0.6, Math.min(1.6, W - 1.2), 0.7, 0.8); stool(Q, cu, v0 + 1.2); chest(Q, u0 + 0.6, v1 - 0.4, 1.0, 0.5); chest(Q, u0 + 1.7, v1 - 0.4, 0.9, 0.5, 0.5);
        shelves(Q, u1 - 0.45, v0 + 1.2, u1 - 0.05, Math.min(v1 - 0.5, v0 + 3.0), false); lamp(Q, cu, v0 + 0.6, 0.8);
      } else if (s === 1) {                                                                // the master bedroom: the great bed, chests, a cupboard
        bed(Q, cu - 0.75, v1 - 2.15, cu + 0.75, v1 - 0.05, 'v1'); chest(Q, u0 + 0.6, v0 + 0.4, 1.1, 0.5); cupboard(Q, u1 - 0.5, v0 + 0.5, u1 - 0.05, v0 + 2.0); lamp(Q, cu + 1.3, v1 - 0.4, 0.0 + 0.5, 1.6); stool(Q, cu + 1.3, v1 - 1.0);
      } else { wallBed(near); chest(Q, u1 - 0.55, cv, 0.5, 1.0); if (back) bed(Q, u1 - 1.2, v0 + 0.15, u1 - 0.15, v0 + 2.1, 'v0'); else bed(Q, u1 - 1.2, v1 - 2.1, u1 - 0.15, v1 - 0.15, 'v1'); washstand(Q, u0 + 0.5, back ? v0 + 0.4 : v1 - 0.4); }
      break;
    case 'inn':
      // guest rooms: two or three beds with a chest at their feet, a washstand and a stool
      if (!back) { bed(Q, u0 + 0.05, v0 + 0.05, u0 + 1.0, v0 + 2.05, 'v0'); bed(Q, u0 + 1.3, v0 + 0.05, u0 + 2.25, v0 + 2.05, 'v0'); chest(Q, u0 + 1.15, v0 + 2.4, 1.6, 0.5); washstand(Q, u1 - 0.5, v1 - 0.4); }
      else { bed(Q, u1 - 1.0, v0 + 0.05, u1 - 0.05, v0 + 2.05, 'v0'); bed(Q, u1 - 2.25, v0 + 0.05, u1 - 1.3, v0 + 2.05, 'v0'); chest(Q, u1 - 1.6, v0 + 2.4, 1.6, 0.5); table(Q, u0 + 0.8, cv, 0.8, 0.7, 0.8); stool(Q, u0 + 0.8, cv + 0.6); lamp(Q, u0 + 0.8, cv, 0.8); }
      if (s >= 2 || W > 5.2) { pallet(Q, u0 + 0.15, cv - 0.9, u0 + 1.1, cv + 1.1, 'u0'); }
      break;
    case 'craft':
      if (!back) {                                                                          // the workroom: the loom by the window, the bench, bales and a cupboard of thread
        loom(Q, cu, v0 + 0.55, Math.min(1.7, W - 1.4)); bench(Q, u1 - 1.2, cv + 0.5, 1.5, 0.75); bale(Q, u0 + 0.6, v1 - 0.5); bale(Q, u0 + 1.6, v1 - 0.45, 0.8, 0.5, 0.45); shelves(Q, u0 + 0.05, cv - 0.3, u0 + 0.45, cv + 1.2, true); lamp(Q, u1 - 1.2, cv + 0.5, 0.9);
      } else { bed(Q, u1 - 1.5, v0 + 0.05, u1 - 0.05, v0 + 2.05, 'v0'); cradle(Q, u1 - 1.95, v0 + 0.4); chest(Q, u0 + 0.6, v1 - 0.4, 1.0, 0.5); table(Q, u0 + 1.0, cv - 0.3, 1.2, 0.7, 0.78); stool(Q, u0 + 1.0, cv + 0.3); }
      break;
    case 'tenement':
      if (!back) { table(Q, cu, cv, 1.3, 0.8, 0.78); stool(Q, cu - 0.9, cv); stool(Q, cu + 0.9, cv); stool(Q, cu, cv - 0.65); lamp(Q, cu, cv, 0.78); bed(Q, u0 + 0.05, v1 - 2.05, u0 + 1.05, v1 - 0.05, 'v1'); cupboard(Q, u1 - 0.5, cv + 0.2, u1 - 0.05, cv + 1.4); chest(Q, u1 - 0.6, v1 - 0.4, 1.0, 0.5); }
      else { bed(Q, u0 + 0.05, v0 + 0.05, u0 + 1.05, v0 + 2.05, 'v0'); pallet(Q, u1 - 1.0, v0 + 0.9, u1 - 0.05, v0 + 2.8, 'v0'); chest(Q, u1 - 0.6, v0 + 0.4, 1.0, 0.5); cradle(Q, u0 + 1.6, v0 + 0.45); }
      break;
    case 'shop':
    default:
      if (!back) {                                                                          // the store of the shop below: crates, barrels, sacks and bales on a shelf
        for (let k = 0; k < 3; k++) barrel(Q, u0 + 0.5 + k * 0.7, v1 - 0.45); crate(Q, u1 - 0.5, v1 - 0.5, 0.6, 2); crate(Q, u1 - 0.5, v1 - 1.3, 0.55, 1);
        shelves(Q, u0 + 0.05, v0 + 0.4, u0 + 0.45, v0 + 2.0, true); sack(Q, u1 - 0.5, v1 - 1.2); bale(Q, cu, cv + 0.2); lamp(Q, cu, cv + 0.2, 0.5);
      } else { bed(Q, u1 - 1.5, v0 + 0.05, u1 - 0.05, v0 + 2.05, 'v0'); chest(Q, u0 + 0.6, v1 - 0.4, 1.0, 0.5); table(Q, u0 + 1.2, cv, 1.0, 0.7, 0.78); stool(Q, u0 + 1.2, cv + 0.6); washstand(Q, u0 + 0.5, v0 + 0.45); }
      break;
  }
  void r; void use; void lathe;
}
