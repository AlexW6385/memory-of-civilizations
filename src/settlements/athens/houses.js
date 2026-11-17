// Walk-in houses of Athens beyond Simon's (docs/settlements/athens.md §15): three more plans, each furnished for its use and
// each with a front that follows from its rule (which cells, which side, one storey or two, shop opening, sign, door).
//   pastas   — street door into a passage, the andron (offset door, couches) and a shop or store on the street; the court with
//              its altar and well; across it the pastas (a roofed porch on posts) and the oikos with its brazier, the
//              bedchamber and the kitchen (after the Olynthian houses, MIT "House of Many Colors" and "House A vii 4")
//   small    — passage and workroom on the street, a yard with the oven and a fig, the oikos and, in the second storey
//              over the back range, the loft reached by a ladder through a hatch
//   workshop — a potter's or a sculptor's: the street workroom with its wheel or its blocks, the yard with the kiln and
//              settling basins or the stone and the unfinished herm, the family's rooms behind
// Registered into the greek style as `athens_walk_house` from this folder (the style files are read-only).

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/greek/ward.js';
import { frame } from '../../styles/greek/agora.js';
import { face, fig } from '../../styles/greek/ward.js';
import { kline, trapeza, krater, lampstand, loom, rangeRoof } from '../../styles/greek/house-interior.js';
import { furnishShop, TRADES } from '../../styles/greek/shops.js';
import { vase, kiln } from '../../styles/greek/vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = 0.5, TI = 0.4, H = 3.2, UP = 2.3;
const TONES = ['mud_plaster', 'mud_plaster', 'plaster_white', 'plaster_ochre', 'mud_plaster', 'plaster_grey'];
/** Lot sizes (width × depth) by kind: the street on the north. */
export const SIZES = { simon: [13, 14], pastas: [13.6, 15], small: [11.4, 15], workshop: [14, 15] };

/** The cells of a house: { FR, RD, PD, two, front: [{k, u0, u1}], back: [...] } in local u, v (v from the street). */
export function cfg(kind, L, seed) {
  const Li = L - 2 * T, mir = (seed & 1) === 1, mirB = (seed & 2) === 2, shop = seed % 3 !== 0;
  let FR = 4.4, RD = 3.2, PD = 0, two = (seed >> 2) % 3 === 0, front, back;
  const mk = (list, mirror) => { const rest = Li - list.reduce((a, c) => a + (c[1] ?? 0), 0) - TI * (list.length - 1); const l = list.map(([k, w]) => [k, w ?? rest]); if (mirror) l.reverse(); let u = T; return l.map(([k, w]) => { const c = { k, u0: u, u1: u + w }; u += w + TI; return c; }); };
  if (kind === 'pastas') { PD = 1.8; front = mk([['andron', 4.6], ['passage', 1.8], [shop ? 'shop' : 'store']], mir); back = mk([['oikos', 5.0], ['thalamos', 3.6], ['kitchen']], mirB); }
  else if (kind === 'small') { FR = 4.2; RD = 3.6; two = false; front = mk([['passage', 1.8], [shop ? 'shop' : 'work']], mir); back = mk([['oikos'], ['thalamos', 3.4]], mirB); }
  else { FR = 4.4; RD = 3.2; front = mk([['craft'], ['passage', 1.8], ['store', 2.4]], mir); back = mk([['oikos', 5.2], ['kitchen', 3.0], ['thalamos']], mirB); }
  return { FR, RD, PD, two, up: kind === 'small' ? 'back' : two ? 'front' : null, front, back, shop };
}
const geomOf = (kind, L, D, seed) => { const C = cfg(kind, L, seed), vp0 = T + C.FR, vq0 = D - T - C.RD - TI; return { C, vp0, vq0, cv0: vp0 + TI, cv1: vq0 - C.PD }; };
const NAMES = { andron: 'andron', shop: 'shop', store: 'store', work: 'workroom', craft: 'workshop', oikos: 'oikos', thalamos: 'bedchamber', kitchen: 'kitchen' };

/** Rooms (for the plan) of one house lot. */
export function houseRooms(l) {
  const F = frame(l.rect, l.front || 'n'), { L, D } = F, { C, vp0, vq0 } = geomOf(l.kind, L, D, l.seed), out = [];
  for (const c of C.front) if (c.k !== 'passage') out.push({ id: NAMES[c.k], rect: F.R(c.u0, T, c.u1, vp0), y: l.y, kind: 'inner', market: false });
  for (const c of C.back) out.push({ id: NAMES[c.k], rect: F.R(c.u0, vq0 + TI, c.u1, D - T), y: l.y, kind: 'inner' });
  return out;
}

// ── furnishings (world rectangles) ──────────────────────────────────────────────────────────────
function chest(bag, col, x, z, y, alongX, w = 1.1, d = 0.6, h = 0.62) {
  const hw = (alongX ? w : d) / 2, hd = (alongX ? d : w) / 2;
  bag.add('wood_dark', box(x - hw, y, z - hd, x + hw, y + h, z + hd)); bag.add('timber', box(x - hw - 0.02, y + h, z - hd - 0.02, x + hw + 0.02, y + h + 0.07, z + hd + 0.02));
  bag.add('bronze', alongX ? box(x - 0.03, y + 0.02, z - hd - 0.015, x + 0.03, y + h + 0.07, z + hd + 0.015) : box(x - hw - 0.015, y + 0.02, z - 0.03, x + hw + 0.015, y + h + 0.07, z + 0.03));
  col.rect([x - hw, z - hd, x + hw, z + hd], y, y + h + 0.07);
}
function andron(ctx, R, y, doorMax, rand) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = R, bw = 0.85, s = doorMax ? 1 : -1, zo = doorMax ? z0 : z1, cx = (x0 + x1) / 2;
  const Z = (a, b) => [Math.min(zo + s * a, zo + s * b), Math.max(zo + s * a, zo + s * b)], depth = Math.abs(z1 - z0), run = depth - 1.4;
  const strip = (xa, xb, a, b) => { const [za, zb] = Z(a, b); bag.add('plaster_white', box(xa, y, za, xb, y + 0.12, zb)); col.floor([xa, za, xb, zb], y + 0.12); };
  strip(x0, x1, 0, bw); strip(x0, x0 + bw, bw, run); strip(x1 - bw, x1, bw, run);
  { const [za, zb] = Z(bw, run); bag.add('pebble_mosaic', box(x0 + bw + 0.2, y, Math.min(za, zb) + 0.2, x1 - bw - 0.2, y + 0.012, Math.max(za, zb) - 0.2)); }
  const yb = y + 0.12, cl = Math.min(1.85, (run - bw - 0.1));
  kline(bag, col, cx - cl / 2, Z(0.03, 0.83)[0], cx + cl / 2, Z(0.03, 0.83)[1], yb, true, rand);
  const side = (xa, xb, head) => { const [za, zb] = Z(bw + 0.08, bw + 0.08 + cl); if (cl > 0.9) kline(bag, col, xa, za, xb, zb, yb, head, rand); };
  side(x0 + 0.03, x0 + 0.83, s > 0); side(x1 - 0.83, x1 - 0.03, s > 0);
  trapeza(bag, cx, Z(bw + 0.45, bw + 0.45)[0], y, true, rand);
  krater(bag, col, cx, zo + s * 2.4, y + 0.012);
  lampstand(ctx, x0 + bw + 0.4, Z(bw + 0.4, bw + 0.4)[0], y);
}
function loomAt(ctx, R, x, y, backMax) { const z0 = backMax ? R[3] - 0.62 : R[1] + 0.02; loom(ctx.bag, ctx.col, x, z0, y); }
function hearth(ctx, x, z, y, rand) {
  const { bag, col, lights } = ctx;
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; bag.add('limestone', box(x + Math.cos(a) * 0.45 - 0.09, y, z + Math.sin(a) * 0.45 - 0.07, x + Math.cos(a) * 0.45 + 0.09, y + 0.12, z + Math.sin(a) * 0.45 + 0.07)); }
  bag.add('lacquer_black', box(x - 0.36, y, z - 0.36, x + 0.36, y + 0.03, z + 0.36));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.15, 0.22], [0.12, 0.25], [0.13, 0.27], [0.001, 0.26]], 12, null, x, y + 0.13, z));
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; bag.add('iron', box(x + Math.cos(a) * 0.13 - 0.012, y, z + Math.sin(a) * 0.13 - 0.012, x + Math.cos(a) * 0.13 + 0.012, y + 0.15, z + Math.sin(a) * 0.13 + 0.012)); }
  lights.push({ at: [x, y + 0.4, z], color: '#ff8a3a', intensity: 1.6, distance: 4 }); col.circle(x, z, 0.55, y, y + 0.4); void rand;
}
function pot(bag, kind, x, y, z, o = {}) { vase(bag, kind, x, y, z, { seg: 10, ...o }); }
function kitchen(ctx, R, y, rand, farMax) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wz = farMax ? z1 : z0, sg = farMax ? -1 : 1;
  hearth(ctx, cx, cz, y, rand);
  for (let k = 0; k < 4; k++) pot(bag, 'amphora', x0 + 0.4 + k * 0.35, y, wz + sg * 0.35, { s: 0.9, dark: false, tilt: farMax ? -0.15 : 0.15 });
  bag.add('terracotta', lathe([[0.1, 0], [0.24, 0.12], [0.28, 0.42], [0.2, 0.62], [0.12, 0.66], [0.13, 0.7], [0.001, 0.7]], 12, null, x1 - 0.4, y, wz + sg * 0.4)); col.circle(x1 - 0.4, wz + sg * 0.4, 0.28, y, y + 0.7);
  bag.add('timber', box(x0 + 0.2, y + 0.9, Math.min(wz, wz + sg * 0.3), x0 + 1.6, y + 0.94, Math.max(wz, wz + sg * 0.3)));                              // a shelf of cooking pots
  for (let k = 0; k < 4; k++) bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.09, 0.08], [0.06, 0.12], [0.001, 0.1]], 8, null, x0 + 0.4 + k * 0.32, y + 0.94, wz + sg * 0.18));
}
function oikos(ctx, R, y, rand, front, withLoom) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = R, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, backMax = front === 'n';
  // the brazier (eschara): a bronze bowl of coals on a tripod, its glow; two stools and a low table by it
  bag.add('bronze', lathe([[0.001, 0.38], [0.2, 0.4], [0.26, 0.52], [0.24, 0.55], [0.001, 0.44]], 12, null, cx, y, cz));
  for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4; bag.add('bronze', rod([cx + Math.cos(a) * 0.1, y + 0.45, cz + Math.sin(a) * 0.1], [cx + Math.cos(a) * 0.24, y, cz + Math.sin(a) * 0.24], 0.016, 4)); }
  bag.add('flame', lathe([[0.001, 0], [0.18, 0.01], [0.001, 0.03]], 8, null, cx, y + 0.5, cz));
  lights.push({ at: [cx, y + 0.9, cz], color: '#ff8a3a', intensity: 1.5, distance: 5 }); col.circle(cx, cz, 0.3, y, y + 0.56);
  for (const [dx, dz] of [[-1.0, 0.7], [0.9, -0.6]]) { const sx = cx + dx, sz = cz + dz; bag.add('wood_dark', box(sx - 0.18, y + 0.38, sz - 0.18, sx + 0.18, y + 0.43, sz + 0.18)); for (const [a, b] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) bag.add('wood_dark', box(sx + a - 0.02, y, sz + b - 0.02, sx + a + 0.02, y + 0.38, sz + b + 0.02)); col.rect([sx - 0.2, sz - 0.2, sx + 0.2, sz + 0.2], y, y + 0.43); }
  trapeza(bag, cx + 0.1, cz + (backMax ? -0.9 : 0.9), y, true, rand);
  // the cupboard along the back wall, the spindle basket, a hung cloak
  const zw = backMax ? z1 : z0, d = backMax ? -0.5 : 0.5, cu = [Math.min(zw, zw + d), Math.max(zw, zw + d)];
  bag.add('timber', box(x0 + 0.2, y, cu[0], x0 + 1.5, y + 1.5, cu[1])); bag.add('wood_dark', box(x0 + 0.24, y + 0.1, backMax ? cu[0] - 0.01 : cu[1], x0 + 1.46, y + 1.4, backMax ? cu[0] : cu[1] + 0.01)); col.rect([x0 + 0.2, cu[0], x0 + 1.5, cu[1]], y, y + 1.5);
  bag.add('wicker', lathe([[0.001, 0], [0.16, 0], [0.2, 0.22], [0.18, 0.23], [0.14, 0.03], [0.001, 0.03]], 10, null, x1 - 0.5, y, cz + (backMax ? -0.9 : 0.9)));
  bag.add('cloth_white', lathe([[0.001, 0.2], [0.14, 0.2], [0.1, 0.3], [0.001, 0.31]], 10, null, x1 - 0.5, y, cz + (backMax ? -0.9 : 0.9)));
  if (withLoom && x1 - x0 > 3.6) loomAt(ctx, R, x1 - 1.1, y, backMax);
}
function thalamos(ctx, R, y, rand, front, ladder) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = R, backMax = front === 'n', zw = backMax ? z1 : z0, s = backMax ? -1 : 1, Z = (a, b) => [Math.min(zw + s * a, zw + s * b), Math.max(zw + s * a, zw + s * b)];
  kline(bag, col, x0 + 0.25, Z(0, 0.85)[0], x0 + 2.05, Z(0, 0.85)[1], y, true, rand);                     // the bed along the back wall
  if (!ladder) chest(bag, col, x0 + 2.55, zw + s * 0.34, y, true);
  const kx = x1 - 0.5, kz = zw + s * 1.4;                                                       // a klismos with a cushion
  bag.add('wood_dark', box(kx - 0.24, y + 0.44, kz - 0.24, kx + 0.24, y + 0.49, kz + 0.24)); bag.add('cloth_ochre', box(kx - 0.22, y + 0.49, kz - 0.22, kx + 0.22, y + 0.53, kz + 0.22));
  bag.add('wood_dark', box(kx - 0.26, y + 0.49, kz - 0.22, kx - 0.21, y + 0.95, kz + 0.22)); for (const [a, b] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) bag.add('wood_dark', box(kx + a - 0.02, y, kz + b - 0.02, kx + a + 0.02, y + 0.44, kz + b + 0.02));
  if (!ladder) col.rect([kx - 0.27, kz - 0.25, kx + 0.25, kz + 0.25], y, y + 0.95);
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.12, 0.012], [0.001, 0.012]], 14).rotateZ(-Math.PI / 2).translate(x0 + 0.01, y + 1.5, (z0 + z1) / 2));          // the mirror on the wall
  if (!ladder) pot(bag, 'lekythos', x0 + 2.55, y + 0.69, zw + s * 0.34, { s: 1, dark: false });
  if (ladder) {
    const lx = x1 - 0.7, a = zw + s * 0.45, b = zw + s * 0.12;
    for (const dx of [-0.24, 0.24]) bag.add('timber', rod([lx + dx, y, a], [lx + dx, y + H - 0.05, b], 0.03, 5));
    for (let k = 1; k < 9; k++) { const f = k / 9; bag.add('timber', rod([lx - 0.24, y + f * (H - 0.05), a + (b - a) * f], [lx + 0.24, y + f * (H - 0.05), a + (b - a) * f], 0.02, 4)); }
    bag.add('wood_dark', box(lx - 0.32, y + H - 0.14, Math.min(a, b) - 0.1, lx + 0.32, y + H - 0.12, Math.max(a, b) + 0.2));               // the hatch in the ceiling
    col.rect([lx - 0.3, Math.min(a, zw), lx + 0.3, Math.max(a, zw)], y, y + H);
  }
}
function store(ctx, R, y, rand, front) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = R, wz = front === 'n' ? z1 - 0.35 : z0 + 0.35;
  for (let k = 0; k < Math.floor((x1 - x0 - 0.8) / 0.42); k++) if (Math.abs(x0 + 0.5 + k * 0.42 - (x0 + x1) / 2) > 0.9) pot(bag, 'amphora', x0 + 0.5 + k * 0.42, y, wz, { s: 1.1, dark: false, tilt: front === 'n' ? -0.14 : 0.14 });
  const px = x0 + 0.7, pz = (z0 + z1) / 2; pot(bag, 'pithos', px, y, pz, { s: 0.9 }); col.circle(px, pz, 0.35, y, y + 1.0);
  bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.24, 0.26], [0.001, 0.26]], 10, null, x1 - 0.5, y, (z0 + z1) / 2 + 0.2)); col.circle(x1 - 0.5, (z0 + z1) / 2 + 0.2, 0.24, y, y + 0.26);
  void rand;
}
/** The potter's workroom: the wheel, the shelves of pots, the clay bin, pots drying on a plank; or the sculptor's. */
function craft(ctx, R, y, sculptor, rand, front) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = R, backMax = front === 'n', zw = backMax ? z1 : z0, s = backMax ? -1 : 1, cx = (x0 + x1) / 2;
  const sh = (h) => bag.add('timber', box(x0 + 0.3, y + h - 0.04, Math.min(zw, zw + s * 0.4), x1 - 1.6, y + h, Math.max(zw, zw + s * 0.4)));
  if (!sculptor) {
    const wx = cx - 0.4, wz = zw + s * 1.7;                                                                // the wheel: a flywheel low, a head above, on a stool frame
    bag.add('wood_dark', lathe([[0.001, 0.12], [0.34, 0.12], [0.34, 0.17], [0.001, 0.17]], 14, null, wx, y, wz)); bag.add('timber', rod([wx, y, wz], [wx, y + 0.62, wz], 0.03, 5));
    bag.add('wood_dark', lathe([[0.001, 0.62], [0.16, 0.62], [0.16, 0.66], [0.001, 0.66]], 12, null, wx, y, wz)); bag.add('terracotta', lathe([[0.001, 0.66], [0.1, 0.66], [0.09, 0.82], [0.001, 0.86]], 8, null, wx, y, wz));
    col.circle(wx, wz, 0.36, y, y + 0.9);
    bag.add('wood_dark', box(wx + 0.5, y + 0.3, wz - 0.2, wx + 0.9, y + 0.36, wz + 0.2)); col.rect([wx + 0.5, wz - 0.2, wx + 0.9, wz + 0.2], y, y + 0.36);
    sh(1.0); sh(1.6);
    for (let k = 0; k < 7; k++) { const hh = k % 2 ? 1.0 : 1.6; pot(bag, ['amphora', 'oinochoe', 'hydria', 'lekythos', 'kylix', 'krater'][k % 6], x0 + 0.6 + k * ((x1 - x0 - 2.6) / 7), y + hh, zw + s * 0.2, { s: 0.8, dark: k % 3 === 0 }); }
    bag.add('terracotta', box(x0 + 0.3, y, zw + s * 0.5 - 0.35, x0 + 1.4, y + 0.7, zw + s * 0.5 + 0.35)); col.rect([x0 + 0.3, zw + s * 0.5 - 0.35, x0 + 1.4, zw + s * 0.5 + 0.35], y, y + 0.7);   // the clay bin
  } else {
    const bx = cx - 0.6, bz = zw + s * 1.6;
    bag.add('wood_dark', box(bx - 0.6, y, bz - 0.4, bx - 0.5, y + 0.5, bz + 0.4)); bag.add('wood_dark', box(bx + 0.5, y, bz - 0.4, bx + 0.6, y + 0.5, bz + 0.4));
    bag.add('marble', box(bx - 0.5, y + 0.5, bz - 0.35, bx + 0.5, y + 1.05, bz + 0.35)); col.rect([bx - 0.6, bz - 0.4, bx + 0.6, bz + 0.4], y, y + 1.05);            // the block on trestles, half roughed out
    bag.add('marble', box(bx + 1.2, y, bz - 0.17, bx + 1.5, y + 1.2, bz + 0.17)); bag.add('marble', lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.2], [0.001, 0.27]], 10, null, bx + 1.35, y + 1.2, bz)); col.circle(bx + 1.35, bz, 0.25, y, y + 1.47);  // an unfinished herm
    sh(1.0); sh(1.6);
    for (let k = 0; k < Math.min(5, Math.floor((x1 - x0 - 2.2) / 0.5)); k++) bag.add('plaster_white', lathe([[0.001, 0], [0.1, 0.03], [0.12, 0.14], [0.07, 0.24], [0.001, 0.26]], 8, null, x0 + 0.6 + k * 0.5, y + 1.0 + 0, zw + s * 0.2));   // plaster casts
    for (let k = 0; k < 4; k++) bag.add('iron', box(x1 - 1.4 + k * 0.25, y + 0.94, zw + s * 0.6 - 0.02, x1 - 1.4 + k * 0.25 + 0.05, y + 0.96, zw + s * 0.6 + 0.2));
    bag.add('wood_dark', box(x1 - 1.6, y, zw + s * 0.45 - 0.25, x1 - 0.4, y + 0.94, zw + s * 0.45 + 0.25)); col.rect([x1 - 1.6, zw + s * 0.45 - 0.25, x1 - 0.4, zw + s * 0.45 + 0.25], y, y + 0.94);   // the tool bench
    bag.add('pebbles', box(bx - 0.9, y, bz - 0.8, bx + 0.9, y + 0.03, bz + 0.8));                                    // the chips
  }
  void rand;
}

/** athens_walk_house: { rect, front 'n'|'s', y, seed, kind: 'pastas'|'small'|'workshop' } */
function walkHouse(el, ctx) {
  const { bag, col, lights } = ctx, F = frame(el.rect, el.front || 'n'), { L, D } = F, y = el.y ?? 0, seed = el.seed || 1, rand = rng(seed * 3 + 1);
  const { C, vp0, vq0, cv0, cv1 } = geomOf(el.kind, L, D, seed), tone = TONES[seed % TONES.length], sol = F.out[1] < 0, front = sol ? 'n' : 's';
  const rr = (alongU, c, t, lo, hi) => (alongU ? F.R(lo, c - t / 2, hi, c + t / 2) : F.R(c - t / 2, lo, c + t / 2, hi));
  const seg = (alongU, c, t, lo, hi, y0, y1, m, solid = true) => { if (hi - lo < 0.01) return; const r = rr(alongU, c, t, lo, hi); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  const run = (alongU, c, t, a, b, doors) => {
    let u = a;
    for (const [d0, d1] of [...doors].sort((p, q) => p[0] - q[0])) {
      seg(alongU, c, t, u, d0, y - 0.6, y + 0.7, 'rubble'); seg(alongU, c, t, u, d0, y + 0.7, y + H, tone);
      seg(alongU, c, t, d0, d1, y + 2.2, y + H, tone);
      const l = rr(alongU, c, t + 0.04, d0 - 0.1, d1 + 0.1); bag.add('timber', box(l[0], y + 2.08, l[1], l[2], y + 2.22, l[3]));
      const th = rr(alongU, c, t, d0, d1); bag.add('limestone', box(th[0], y - 0.1, th[1], th[2], y + 0.04, th[3]));
      u = d1;
    }
    seg(alongU, c, t, u, b, y - 0.6, y + 0.7, 'rubble'); seg(alongU, c, t, u, b, y + 0.7, y + H, tone);
  };
  const mid = (c, w = 1.0) => [(c.u0 + c.u1) / 2 - w / 2, (c.u0 + c.u1) / 2 + w / 2];
  // floors: lime plaster in the rooms, limestone in the pastas, pebbles in the court
  const fl = (u0, v0, u1, v1, m, dy = 0) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y - 0.3, r[1], r[2], y + dy, r[3])); col.floor(r, y + dy); };
  fl(T, T, L - T, vp0 + TI, 'lime_plaster'); fl(T, vq0, L - T, D - T, 'lime_plaster');
  fl(T, cv0, L - T, cv1, 'pebbles', -0.02); if (C.PD) fl(T, cv1, L - T, vq0, 'limestone');
  // the doors and openings of the street wall and the partitions
  const frontGaps = [], midGaps = [], backGaps = [];
  for (const c of C.front) {
    if (c.k === 'passage') { frontGaps.push(mid(c, 1.1)); midGaps.push([c.u0, c.u1]); }
    else if (c.k === 'shop') { frontGaps.push([c.u0 + 1.2, c.u0 + 3.3]); midGaps.push([c.u1 - 1.3, c.u1 - 0.3]); }
    else if (c.k === 'craft') { frontGaps.push([c.u0 + 0.9, c.u0 + 3.9]); midGaps.push([c.u1 - 1.3, c.u1 - 0.3]); }
    else if (c.k === 'work') { frontGaps.push([c.u0 + 0.9, c.u0 + 3.9]); midGaps.push([c.u1 - 1.3, c.u1 - 0.3]); }
    else if (c.k === 'andron') midGaps.push((seed & 1) ? [c.u1 - 1.3, c.u1 - 0.3] : [c.u0 + 0.3, c.u0 + 1.3]);
    else midGaps.push(mid(c));
  }
  for (const c of C.back) backGaps.push(mid(c, c.k === 'oikos' ? 1.2 : 1.0));
  run(true, T / 2, T, 0, L, frontGaps); run(true, D - T / 2, T, 0, L, []);
  run(false, T / 2, T, T, D - T, []); run(false, L - T / 2, T, T, D - T, []);
  run(true, vp0 + TI / 2, TI, T, L - T, midGaps); run(true, vq0 + TI / 2, TI, T, L - T, backGaps);
  for (let i = 0; i + 1 < C.front.length; i++) run(false, C.front[i].u1 + TI / 2, TI, T, vp0, []);
  for (let i = 0; i + 1 < C.back.length; i++) run(false, C.back[i].u1 + TI / 2, TI, vq0 + TI, D - T, []);
  // the roofs: the front range, the back range (with the pastas under it); a second storey over one of them
  const upper = (u0, v0, u1, v1) => { const r = F.R(u0, v0, u1, v1);
    bag.add('timber', box(r[0] + 0.05, y + H - 0.12, r[1] + 0.05, r[2] - 0.05, y + H, r[3] - 0.05));
    bag.add(tone, box(r[0], y + H, r[1], r[2], y + H + UP - 0.02, r[3])); col.rect(r, y + H, y + H + UP);
    rangeRoof(ctx, r, y, H + UP); };
  const fr = [0, 0, L, vp0 + TI], bk = [0, vq0 - C.PD, L, D];
  if (C.up === 'front') upper(...fr); else rangeRoof(ctx, F.R(...fr), y, H);
  if (C.up === 'back') upper(...bk); else rangeRoof(ctx, F.R(...bk), y, H);
  // the pastas: posts carrying a beam on the court's edge
  if (C.PD) {
    const n = 4, vx = cv1 + 0.2;
    for (let k = 0; k < n; k++) { const u = T + 1.0 + k * (L - 2 * T - 2.0) / (n - 1), [px, pz] = F.P(u, vx);
      bag.add('limestone', box(px - 0.26, y, pz - 0.26, px + 0.26, y + 0.14, pz + 0.26)); bag.add('limestone', lathe([[0.2, 0], [0.18, 1.2], [0.17, H - 0.45], [0.001, H - 0.45]], 10, null, px, y + 0.14, pz)); bag.add('limestone', box(px - 0.26, y + H - 0.31, pz - 0.26, px + 0.26, y + H - 0.12, pz + 0.26)); col.circle(px, pz, 0.26, y, y + H); }
    const b = F.R(T, vx - 0.15, L - T, vx + 0.15); bag.add('timber', box(b[0], y + H - 0.4, b[1], b[2], y + H - 0.12, b[3]));
  }
  // the court
  const cw = F.R(T + TI, cv0, L - T - TI, cv1), cuc = (u, v) => F.P(u, v), cmid = [(cv0 + cv1) / 2];
  if (el.kind === 'pastas') {
    const [ax, az] = cuc(L / 2 + 0.6, cmid[0]), a = [ax - 0.35, az - 0.3, ax + 0.35, az + 0.3];
    bag.add('limestone', box(a[0], y, a[1], a[2], y + 0.7, a[3])); bag.add('limestone', box(a[0] - 0.07, y + 0.7, a[1] - 0.07, a[2] + 0.07, y + 0.8, a[3] + 0.07)); bag.add('lacquer_black', box(ax - 0.2, y + 0.8, az - 0.15, ax + 0.2, y + 0.805, az + 0.15)); col.rect([a[0] - 0.07, a[1] - 0.07, a[2] + 0.07, a[3] + 0.07], y, y + 0.8);
    const [wx, wz] = cuc(L - T - 1.2, cv0 + 0.7); bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, wx, y, wz)); col.circle(wx, wz, 0.42, y, y + 0.62);
    const [jx, jz] = cuc(T + 0.7, cv0 + 0.6); pot(bag, 'pithos', jx, y, jz, { s: 1 }); col.circle(jx, jz, 0.36, y, y + 1.1);
  } else if (el.kind === 'small') {
    const pcen = (() => { const q = C.front.find((c) => c.k === 'passage'); return (q.u0 + q.u1) / 2; })(), ou = pcen < L / 2 ? L - T - 1.4 : T + 1.4;
    const [ox, oz] = cuc(ou, cmid[0]);                                                                  // the bread oven and the fig, clear of the passage
    bag.add('mud_plaster', lathe([[0.7, 0], [0.7, 0.35], [0.55, 0.8], [0.25, 1.05], [0.001, 1.08]], 14, null, ox, y, oz)); bag.add('lacquer_black', box(ox - 0.2, y + 0.18, oz + (sol ? 0.55 : -0.7), ox + 0.2, y + 0.5, oz + (sol ? 0.7 : -0.55))); col.circle(ox, oz, 0.72, y, y + 1.1);
    const [fx, fz] = cuc(L - ou, cv1 - 1.0); fig(bag, fx, y, fz, 4.4, rand); col.circle(fx, fz, 0.14, y, y + 3);
    const [wx, wz] = cuc(L - ou, cv0 + 0.8); bag.add('limestone', lathe([[0.42, 0], [0.42, 0.62], [0.34, 0.62], [0.34, 0.5], [0.001, 0.5]], 14, null, wx, y, wz)); col.circle(wx, wz, 0.42, y, y + 0.62);
  } else {
    const q = C.front.find((c) => c.k === 'passage'), right = (q.u0 + q.u1) / 2 > L / 2, sd = (u) => (right ? u : L - u), v = (cv0 + cv1) / 2, potter = seed % 2 === 0;
    const [kx, kz] = cuc(sd(T + 3.0), v);
    if (potter) {
      kiln(ctx, kx, y, kz, right ? 0 : Math.PI, { glow: false });                                         // the updraught kiln, its mouth toward the middle of the yard
      for (const k of [0, 1]) { const b = F.R(sd(L - T - 1.0), v - 1.3 + k * 1.6, sd(L - T - 0.1), v - 0.3 + k * 1.6); bag.add('limestone', box(b[0], y, b[1], b[2], y + 0.35, b[3])); bag.add('water', box(b[0] + 0.08, y + 0.3, b[1] + 0.08, b[2] - 0.08, y + 0.32, b[3] - 0.08)); col.rect(b, y, y + 0.35); }   // settling basins
      const r = F.R(sd(T + 0.3), cv0 + 0.3, sd(T + 2.8), cv0 + 0.75); bag.add('timber', box(r[0], y + 0.5, r[1], r[2], y + 0.55, r[3])); for (const a2 of [r[0] + 0.1, r[2] - 0.15]) for (const b2 of [r[1], r[3] - 0.05]) bag.add('timber', box(a2, y, b2, a2 + 0.05, y + 0.5, b2 + 0.05));
      col.rect(r, y, y + 0.55);
      for (let k = 0; k < 5; k++) pot(bag, k % 2 ? 'oinochoe' : 'hydria', Math.min(r[0], r[2]) + 0.4 + k * 0.42, y + 0.55, (r[1] + r[3]) / 2, { s: 0.8, dark: false });
    } else {
      const b = F.R(sd(T + 0.4), cv0 + 0.4, sd(T + 2.6), cv0 + 1.9); bag.add('marble', box(b[0], y, b[1], b[2], y + 1.1, b[3])); col.rect(b, y, y + 1.1);
      for (let k = 0; k < 3; k++) { const [hx, hz] = cuc(sd(T + 1.0 + k * 1.1), v + 0.8); bag.add('marble', box(hx - 0.15, y, hz - 0.15, hx + 0.15, y + 1.25, hz + 0.15)); bag.add('marble', lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.2], [0.001, 0.27]], 10, null, hx, y + 1.25, hz)); col.circle(hx, hz, 0.22, y, y + 1.5); }
    }
  }
  // the rooms
  for (const c of C.front) {
    const r = F.R(c.u0, T, c.u1, vp0);
    if (c.k === 'andron') andron(ctx, r, y, F.out[1] < 0, rand);
    else if (c.k === 'shop') furnishShop(ctx, F, y, c.u0, c.u1, T, vp0, TRADES[(seed >> 3) % TRADES.length], rand);
    else if (c.k === 'store') store(ctx, r, y, rand, front);
    else if (c.k === 'craft') craft(ctx, r, y, seed % 2 !== 0, rand, front);
    else if (c.k === 'work') { furnishShop(ctx, F, y, c.u0, c.u1, T, vp0, TRADES[(seed >> 3) % TRADES.length], rand); }
  }
  for (const c of C.back) {
    const r = F.R(c.u0, vq0 + TI, c.u1, D - T);
    if (c.k === 'oikos') oikos(ctx, r, y, rand, front, el.kind !== 'workshop');
    else if (c.k === 'thalamos') thalamos(ctx, r, y, rand, front, el.kind === 'small');
    else if (c.k === 'kitchen') kitchen(ctx, r, y, rand, front === 'n');
  }
  void lights;
  // the dressing of the four faces, the herm and the sign
  const fh = C.up === 'front' ? H + UP : H;
  face(ctx, F, { u0: 0, u1: L, v: 0, s: -1, y, H: fh, rand, tier: 2, wins: 0, spout: true });
  face(ctx, F, { u0: 0, u1: L, v: D, s: 1, y, H: C.up === 'back' ? H + UP : H, rand, tier: 2, wins: 2, spout: true });
  for (const side of ['e', 'w']) { const G = frame(el.rect, side); face(ctx, G, { u0: 0, u1: G.L, v: 0, s: -1, y, H: H + (C.up ? 0.0 : 0), rand, tier: 2, wins: 1, spout: false }); }
  const door = C.front.find((c) => c.k === 'passage'), [d0, d1] = mid(door, 1.1);
  const P = (a, b, c2, d, y0, y1, m) => { const r = F.R(a, b, c2, d); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
  P(d0 - 0.14, -0.1, d0, 0.12, 0.05, 2.35, 'timber'); P(d1, -0.1, d1 + 0.14, 0.12, 0.05, 2.35, 'timber'); P(d0 - 0.22, -0.12, d1 + 0.22, 0.14, 2.2, 2.4, 'timber');
  P(d0 - 0.2, -0.45, d1 + 0.2, 0.0, -0.08, 0.06, 'limestone');
  STYLES.greek.elements.herm({ at: F.P(d1 + 0.9, -0.55), y, rot: F.yaw }, ctx);
  const sh = C.front.find((c) => c.k === 'shop' || c.k === 'craft' || c.k === 'work');
  if (sh) {
    const a = sh.u0 + (sh.k === 'shop' ? 1.2 : 0.9), b = sh.u0 + (sh.k === 'shop' ? 3.3 : 3.9);
    P(a - 0.1, -0.12, a + 0.08, 0.06, 0, 2.3, 'timber'); P(b - 0.08, -0.12, b + 0.1, 0.06, 0, 2.3, 'timber'); P(a - 0.14, -0.14, b + 0.14, 0.08, 2.2, 2.38, 'timber');
    P(a + 0.2, -0.5, b - 0.2, -0.44, 2.55, 2.98, 'wood_ochre'); P(a + 0.6, -0.52, b - 0.6, -0.5, 2.65, 2.88, ['paint_blue', 'wall_red', 'paint_ochre', 'pottery_dark'][seed % 4]);
  }
  if (C.up === 'front') for (const k of [0.22, 0.5, 0.78]) { const u = L * k + (rand() - 0.5) * 0.5; if (Math.abs(u - (d0 + d1) / 2) < 1.0) continue;
    P(u - 0.4, -0.06, u + 0.4, 0.08, H + 0.7, H + 1.6, 'wood_dark'); P(u - 0.48, -0.1, u + 0.48, 0.0, H + 1.6, H + 1.7, 'timber'); P(u - 0.5, -0.14, u + 0.5, 0.0, H + 0.62, H + 0.7, 'timber');
    if (k === 0.5) P(u + 0.4, -0.5, u + 0.46, 0.0, H + 0.7, H + 1.6, 'shutter_brown'); }
  else if (C.up === 'back') for (const k of [0.3, 0.7]) { const u = L * k; const r = F.R(u - 0.4, D - 0.06, u + 0.4, D + 0.06); bag.add('wood_dark', box(r[0], y + H + 0.7, r[1], r[2], y + H + 1.6, r[3])); }
}
STYLES.greek.elements.athens_walk_house = walkHouse;

/** The household of a house lot as figure elements (life style): where its people stand. */
export function houseLife(l) {
  const F = frame(l.rect, l.front || 'n'), { L, D } = F, { C, vp0, vq0, cv0, cv1 } = geomOf(l.kind, L, D, l.seed), y = l.y, out = [], R = rng(l.seed + 9), sd = () => Math.floor(R() * 1e9);
  const faceTo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  const at = (u, v) => F.P(u, v), fwd = (u, v) => F.P(u, v - 1), back = (u, v) => F.P(u, v + 1);
  const man = (p, to, o = {}) => out.push({ t: 'figure', at: p, y, rot: faceTo(p, to), seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: ['cloth_brown', 'linen', 'cloth_ochre', 'cloth_grey'][Math.floor(R() * 4)], over: 'belt', hair: 'short', beard: 0.8, hat: 'none', feet: 'bare', pose: 'stand', ...o });
  const woman = (p, to, o = {}) => out.push({ t: 'figure', at: p, y, rot: faceTo(p, to), seed: sd(), skin: 'skin_light', dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(R() * 3)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: 'none', pose: 'stand', ...o });
  for (const c of C.front) {
    if (c.k === 'shop' || c.k === 'work') man(at(c.u0 + 2.6, T + 0.85 + 0.7), at(c.u0 + 2.6, -3), {});
    if (c.k === 'craft') { const cx = (c.u0 + c.u1) / 2, pot = l.seed % 2 === 0, p = at(cx - (pot ? 0.4 : 0.6), vp0 - (pot ? 2.5 : 2.7)); man(p, at(cx - (pot ? 0.4 : 0.6), vp0 - 1.7), { pose: pot ? 'sit_low' : 'stand', beard: 1 }); }
  }
  const ok = C.back.find((c) => c.k === 'oikos'), kc = C.back.find((c) => c.k === 'kitchen');
  if (ok) woman(at(ok.u1 - 1.1 - 0.0, D - T - 1.5), at(ok.u1 - 1.1, D), {});
  if (kc) man(at(kc.u0 + 0.8, D - T - 1.2), at(kc.u0 + 1.5, D - T - 1.2), { pose: 'squat', beard: 0.2, cloth: 'cloth_grey' });
  const cy = (cv0 + cv1) / 2;
  woman(at(L * 0.3, cy), at(L * 0.6, cy + 0.5), { carry: 'pot', arms: 'head' });
  return out;
}
/** Where the hearth's smoke leaves the roof, for the smoke system. */
export function houseSmoke(l) { const F = frame(l.rect, l.front || 'n'), { L, D } = F, { C, vq0 } = geomOf(l.kind, L, D, l.seed), c = C.back.find((q) => q.k === 'kitchen') || C.back.find((q) => q.k === 'oikos'), p = F.P((c.u0 + c.u1) / 2, vq0 + TI + 1.6); return [p[0], l.y + (C.up === 'back' ? 3.2 + UP + 1.6 : 4.3), p[1]]; }
