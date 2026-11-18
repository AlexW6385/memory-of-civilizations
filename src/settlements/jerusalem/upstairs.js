// The upper chambers of the open houses, furnished by use (docs/settlements/jerusalem.md §5d): a pilgrims' guest house with
// pallets and staffs, a merchant's counting-room with its scales and bales, a craftsman's loft by his trade, the family's
// sleeping room and sitting room, a granary and a jar store, and a tenement of two households. Materials are those the
// houses' plans already hold; repeated pieces differ by a hash of their own place.

import { box, lathe } from '../../core/geom.js';

/** The uses of the upper chambers, in the order the rule hands them out; each is [west chamber, east chamber]. */
export const UPPER_USES = {
  inn: ['guest', 'guest'],
  merchant: ['counting', 'bales'],
  craftsman: ['loft', 'sleep'],
  family: ['sleep', 'sitting'],
  granary: ['grain', 'jars'],
  tenement: ['household', 'household'],
};

/** A number in [0, 1) from a place: the variation of repeated pieces. */
const hs = (x, z, k = 0) => { const s = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };
const CLOTHS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_brown'];
const pickCloth = (x, z, k = 0) => CLOTHS[Math.floor(hs(x, z, k) * CLOTHS.length)];

function bolster(bag, x, y, z, len, along, mat, r = 0.13) {
  const g = lathe([[0.001, 0], [r * 0.85, 0.02], [r, len * 0.5], [r * 0.85, len - 0.02], [0.001, len]], 8, null, 0, 0, 0);
  if (along === 'x') bag.add(mat, g.rotateZ(-Math.PI / 2).translate(x - len / 2, y + r, z)); else bag.add(mat, g.rotateX(Math.PI / 2).translate(x, y + r, z - len / 2));
}
/** A floor bed (a mattress, a quilt folded at the foot, a bolster at the head), centred at (x, z), its length along x or z. */
function pallet(ctx, x, z, Y, len, wid, along, mat, bedstead = false) {
  const { bag } = ctx, ax = along === 'x', a = ax ? len : wid, b = ax ? wid : len, lift = bedstead ? 0.2 : 0;
  if (bedstead) {
    bag.add('cedar', box(x - a / 2, Y + 0.14, z - b / 2, x + a / 2, Y + 0.2, z + b / 2));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('cedar', box(x + sx * (a / 2 - 0.05) - 0.03, Y, z + sz * (b / 2 - 0.05) - 0.03, x + sx * (a / 2 - 0.05) + 0.03, Y + 0.14, z + sz * (b / 2 - 0.05) + 0.03));
  }
  bag.add(mat, box(x - a / 2 + 0.03, Y + 0.02 + lift, z - b / 2 + 0.03, x + a / 2 - 0.03, Y + 0.13 + lift, z + b / 2 - 0.03));
  const fold = pickCloth(x, z, 3), t = 0.5 + hs(x, z, 4) * 0.12;
  bag.add(fold === mat ? 'cloth_white' : fold, ax ? box(x + a / 2 - 0.03 - t, Y + 0.13 + lift, z - b / 2 + 0.06, x + a / 2 - 0.05, Y + 0.2 + lift, z + b / 2 - 0.06) : box(x - a / 2 + 0.06, Y + 0.13 + lift, z + b / 2 - 0.03 - t, x + a / 2 - 0.06, Y + 0.2 + lift, z + b / 2 - 0.05));
  if (ax) bolster(bag, x - a / 2 + 0.3, Y + 0.13 + lift, z, Math.min(b - 0.1, 0.75), 'z', 'cloth_white', 0.1 + hs(x, z, 5) * 0.02);
  else bolster(bag, x, Y + 0.13 + lift, z - b / 2 + 0.3, Math.min(a - 0.1, 0.75), 'x', 'cloth_white', 0.1 + hs(x, z, 5) * 0.02);
}
/** A cedar chest with an iron band, lengthwise along x. */
function chest(ctx, x, z, Y, w = 1.0, d = 0.55, h = 0.6) {
  const { bag, col } = ctx, j = hs(x, z, 6) * 0.08;
  bag.add('cedar', box(x - w / 2, Y, z - d / 2, x + w / 2, Y + h + j, z + d / 2)); bag.add('cedar', box(x - w / 2 - 0.02, Y + h + j, z - d / 2 - 0.02, x + w / 2 + 0.02, Y + h + j + 0.04, z + d / 2 + 0.02));
  bag.add('iron', box(x - w / 2, Y + h * 0.5, z + d / 2, x + w / 2, Y + h * 0.5 + 0.05, z + d / 2 + 0.02));
  col.rect([x - w / 2 - 0.02, z - d / 2 - 0.02, x + w / 2 + 0.02, z + d / 2 + 0.02], Y, Y + h + j + 0.04);
}
/** A clay jar: its height and belly a little different with its place. */
function jar(ctx, x, z, Y, r, h, mat = 'terracotta') {
  const { bag, col } = ctx, a = 1 + (hs(x, z, 7) - 0.5) * 0.12, b = 1 + (hs(x, z, 8) - 0.5) * 0.1;
  bag.add(mat, lathe([[0.001, 0], [r * 0.5 * a, 0.02], [r * a, h * 0.4 * b], [r * 0.85 * a, h * 0.75 * b], [r * 0.5 * a, h * 0.92 * b], [r * 0.55 * a, h * b], [0.001, h * b]], 12, null, x, Y, z));
  col.circle(x, z, r * a + 0.02, Y, Y + h);
}
function sacks(ctx, x, z, Y, n) {
  const { bag, col } = ctx;
  for (let k = 0; k < n; k++) { const sx = x + (k % 2) * 0.55 - 0.27 + (hs(x, z, 10 + k) - 0.5) * 0.08, sy = Y + Math.floor(k / 2) * 0.3; bag.add('sacking', box(sx - 0.26, sy, z - 0.18, sx + 0.26, sy + 0.3 + hs(sx, z, 11) * 0.05, z + 0.18)); }
  col.rect([x - 0.55, z - 0.2, x + 0.55, z + 0.2], Y, Y + 0.3 * Math.ceil(n / 2));
}
/** A stack of cloth bales. */
function bales(ctx, x, z, Y, n) {
  const { bag, col } = ctx;
  for (let k = 0; k < n; k++) { const bx = x + (hs(x, z, 20 + k) - 0.5) * 0.06, by = Y + k * 0.42; bag.add(pickCloth(x, z, 21 + k), box(bx - 0.4, by, z - 0.28, bx + 0.4, by + 0.4, z + 0.28)); bag.add('sacking', box(bx - 0.41, by + 0.17, z - 0.06, bx + 0.41, by + 0.21, z + 0.06)); }
  col.rect([x - 0.42, z - 0.3, x + 0.42, z + 0.3], Y, Y + 0.42 * n);
}
/** A low table with a bronze tray or papers; its legs. */
function lowTable(ctx, x, z, Y, w, d, h) {
  const { bag, col } = ctx;
  bag.add('cedar', box(x - w / 2, Y + h - 0.05, z - d / 2, x + w / 2, Y + h, z + d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('cedar', box(x + sx * (w / 2 - 0.05) - 0.025, Y, z + sz * (d / 2 - 0.05) - 0.025, x + sx * (w / 2 - 0.05) + 0.025, Y + h - 0.05, z + sz * (d / 2 - 0.05) + 0.025));
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], Y, Y + h);
}
/** A wall shelf with jars, along x on the north wall. */
function shelf(ctx, x0, x1, z, Y, h, n) {
  const { bag } = ctx;
  bag.add('cedar', box(x0, Y + h, z, x1, Y + h + 0.05, z + 0.3));
  for (const px of [x0 + 0.05, x1 - 0.05]) bag.add('cedar', box(px - 0.03, Y + h - 0.2, z, px + 0.03, Y + h, z + 0.12));
  for (let k = 0; k < n; k++) { const x = x0 + 0.25 + k * (x1 - x0 - 0.5) / Math.max(1, n - 1), r = 0.07 + hs(x, z, 30) * 0.03; bag.add('terracotta', lathe([[0.001, 0], [r, 0.02], [r * 1.5, 0.12], [r, 0.22], [r * 0.7, 0.26], [0.001, 0.26]], 10, null, x, Y + h + 0.05, z + 0.15)); }
}
/** A brazier of clay with embers, on a stand of three legs. */
function brazier(ctx, x, z, Y) {
  const { bag, col } = ctx;
  bag.add('pottery_dark', lathe([[0.001, 0.12], [0.14, 0.14], [0.22, 0.3], [0.26, 0.34], [0.2, 0.34], [0.2, 0.3], [0.001, 0.26]], 12, null, x, Y, z));
  bag.add('flame', lathe([[0.001, 0], [0.1, 0.005], [0.001, 0.03]], 8, null, x, Y + 0.3, z));
  col.circle(x, z, 0.27, Y, Y + 0.34);
}
function basket(ctx, x, z, Y, r = 0.28, h = 0.3) {
  const { bag, col } = ctx, a = 1 + (hs(x, z, 40) - 0.5) * 0.2;
  bag.add('reed_mat', lathe([[0.001, 0], [r * 0.8 * a, 0], [r * a, h * 0.5], [r * 1.05 * a, h], [r * 0.9 * a, h], [0.001, h * 0.15]], 10, null, x, Y, z));
  col.circle(x, z, r * a + 0.02, Y, Y + h);
}

// ── the uses ──
const uses = {
  /** The family's sleeping room: floor beds (one on a frame) along the north wall, bolsters, quilts, chests, a cradle. */
  sleep(ctx, c, Y) {
    const { bag } = ctx, nb = c.w > 5.6 ? 2 : 1;
    bag.add('reed_mat', box(c.x0 + 0.1, Y, c.z0 + 0.1, c.x1 - 0.1, Y + 0.02, c.zl + 0.2));
    for (let k = 0; k < nb; k++) { const x = c.x0 + 1.15 + k * 2.2; pallet(ctx, x, c.z0 + 0.55, Y, 1.95, 0.9, 'x', k ? 'cloth_indigo' : 'cloth_red', k === 0); }
    chest(ctx, c.x1 - 0.65, c.z0 + 0.4, Y); chest(ctx, c.out - c.dir * 0.3, c.zl - 0.1, Y, 0.55, 0.9, 0.5);
    if (hs(c.x0, c.z0, 50) > 0.4) { const x = c.x0 + 1.15 + nb * 2.2, z = c.z0 + 0.45; bag.add('cedar', box(x - 0.4, Y + 0.1, z - 0.25, x + 0.4, Y + 0.14, z + 0.25)); bag.add('cedar', box(x - 0.4, Y + 0.14, z - 0.25, x + 0.4, Y + 0.42, z - 0.21)); bag.add('cedar', box(x - 0.4, Y + 0.14, z + 0.21, x + 0.4, Y + 0.42, z + 0.25)); bag.add('cloth_white', box(x - 0.36, Y + 0.14, z - 0.21, x + 0.36, Y + 0.2, z + 0.21)); ctx.col.rect([x - 0.4, z - 0.25, x + 0.4, z + 0.25], Y, Y + 0.42); }
  },
  /** The sitting room: cushions and bolsters along the north wall on a mat, a tray on its stand, a brazier, a distaff in a basket. */
  sitting(ctx, c, Y) {
    const { bag } = ctx;
    bag.add('reed_mat', box(c.x0 + 0.1, Y, c.z0 + 0.1, c.x1 - 0.1, Y + 0.02, c.zl + 0.2));
    for (let x = c.x0 + 0.5; x < c.x1 - 1.2; x += 0.95) bag.add(pickCloth(x, c.z0, 60), box(x - 0.42, Y + 0.02, c.z0 + 0.05, x + 0.42, Y + 0.14, c.z0 + 0.65));
    for (let x = c.x0 + 0.7, k = 0; x < c.x1 - 1.2; x += 0.95, k++) bolster(bag, x, Y + 0.14, c.z0 + 0.2, 0.6, 'x', pickCloth(x, c.z0, 61), 0.11);
    const tx = (c.x0 + c.x1) / 2, tz = c.z0 + 1.45;
    for (const s of [-1, 1]) bag.add('cedar', box(tx - 0.3, Y + 0.02, tz + s * 0.24 - 0.02, tx + 0.3, Y + 0.34, tz + s * 0.24 + 0.02));
    bag.add('bronze', lathe([[0.001, 0], [0.38, 0], [0.4, 0.04], [0.38, 0.05], [0.001, 0.02]], 22, null, tx, Y + 0.34, tz));
    bag.add('pottery_dark', lathe([[0.04, 0], [0.07, 0.04], [0.06, 0.09], [0.035, 0.12], [0.04, 0.14], [0.001, 0.14]], 10, null, tx + 0.12, Y + 0.37, tz));
    ctx.col.rect([tx - 0.34, tz - 0.3, tx + 0.34, tz + 0.3], Y, Y + 0.36);
    brazier(ctx, c.x1 - 0.55, c.zl - 0.1, Y); basket(ctx, c.x0 + 0.5, c.zl - 0.05, Y); chest(ctx, c.x1 - 0.5, c.z0 + 0.4, Y, 0.55, 0.9, 0.5);
    bag.add('timber', box(c.x0 + 0.46, Y + 0.3, c.zl - 0.07, c.x0 + 0.5, Y + 1.1, c.zl - 0.03));
  },
  /** A pilgrims' room: pallets side by side with a bundle at the head of each, staffs against the wall, a water jar and a basin. */
  guest(ctx, c, Y) {
    const { bag } = ctx, n = Math.max(2, Math.floor((c.w - 0.6) / 2.15));
    bag.add('reed_mat', box(c.x0 + 0.1, Y, c.z0 + 0.1, c.x1 - 0.1, Y + 0.02, c.zl + 0.2));
    for (let k = 0; k < n; k++) {
      const x = c.x0 + 0.3 + 1.0 + k * 2.15, z = c.z0 + 0.55;
      pallet(ctx, x, z, Y, 1.9, 0.85, 'x', pickCloth(x, z, 70) === 'cloth_white' ? 'cloth_brown' : pickCloth(x, z, 70));
      bag.add('sacking', box(x + 0.5, Y + 0.13, z + 0.45, x + 0.9, Y + 0.33 + hs(x, z, 71) * 0.06, z + 0.85));
    }
    for (let k = 0; k < 4; k++) { const x = c.x0 + 0.3 + k * 0.17 + hs(c.x0, k, 72) * 0.03, h = 1.45 + hs(x, c.z0, 73) * 0.2; bag.add('timber', box(x - 0.02, Y, c.z0 + 0.05, x + 0.02, Y + h, c.z0 + 0.09)); }
    jar(ctx, c.x1 - 0.5, c.z0 + 0.4, Y, 0.28, 0.8); jar(ctx, c.x1 - 1.15, c.z0 + 0.35, Y, 0.2, 0.55);
    bag.add('bronze', lathe([[0.001, 0], [0.26, 0.04], [0.32, 0.14], [0.001, 0.12]], 14, null, c.x1 - 0.5, Y, c.zl - 0.1));
    ctx.col.circle(c.x1 - 0.5, c.zl - 0.1, 0.32, Y, Y + 0.14);
  },
  /** The counting-room: a low desk with a ledger, ink and reeds, a balance on its stand, chests, a seat cushion, a shelf of sealed jars. */
  counting(ctx, c, Y) {
    const { bag, col } = ctx, dx = c.x0 + 1.5, dz = c.z0 + 0.5;
    bag.add('reed_mat', box(c.x0 + 0.1, Y, c.z0 + 0.1, c.x1 - 0.1, Y + 0.02, c.zl + 0.2));
    lowTable(ctx, dx, dz, Y, 1.3, 0.6, 0.45);
    bag.add('linen', box(dx - 0.3, Y + 0.45, dz - 0.15, dx + 0.1, Y + 0.5, dz + 0.15)); bag.add('pottery_dark', lathe([[0.001, 0], [0.04, 0], [0.04, 0.06], [0.001, 0.06]], 8, null, dx + 0.35, Y + 0.45, dz));
    for (let k = 0; k < 3; k++) bag.add('timber', box(dx + 0.45 + k * 0.03, Y + 0.45, dz - 0.18, dx + 0.47 + k * 0.03, Y + 0.47, dz + 0.1));
    bag.add(pickCloth(dx, dz, 80), box(dx - 0.4, Y + 0.02, dz + 0.5, dx + 0.4, Y + 0.12, dz + 0.95));
    const sx = c.x0 + 3.4, sz = c.z0 + 0.6;
    bag.add('timber', box(sx - 0.03, Y, sz - 0.03, sx + 0.03, Y + 0.95, sz + 0.03)); bag.add('timber', box(sx - 0.28, Y + 0.95, sz - 0.02, sx + 0.28, Y + 0.99, sz + 0.02));
    for (const s of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.1, 0.01], [0.1, 0.03], [0.001, 0.015]], 10, null, sx + s * 0.26, Y + 0.58, sz)); for (const q of [-0.05, 0.05]) bag.add('iron', box(sx + s * 0.26 + q - 0.004, Y + 0.6, sz - 0.004, sx + s * 0.26 + q + 0.004, Y + 0.95, sz + 0.004)); }
    col.circle(sx, sz, 0.14, Y, Y + 1.0);
    chest(ctx, c.x1 - 0.65, c.z0 + 0.4, Y); chest(ctx, c.x1 - 1.8, c.z0 + 0.4, Y, 0.9, 0.5, 0.5);
    shelf(ctx, c.x0 + 2.2, c.x0 + 3.9, c.z0 + 0.03, Y, 1.4, 5);
  },
  /** The warehouse of the merchant: stacks of bales, sacks, rows of amphorae, a coil of rope. */
  bales(ctx, c, Y) {
    const { bag } = ctx;
    bales(ctx, c.x0 + 0.7, c.z0 + 0.45, Y, 3); bales(ctx, c.x0 + 1.7, c.z0 + 0.45, Y, 2); bales(ctx, c.x0 + 2.7, c.z0 + 0.45, Y, 3);
    sacks(ctx, c.x1 - 1.0, c.z0 + 0.35, Y, 4);
    for (let k = 0; k < 3; k++) { const x = c.x0 + 3.7 + k * 0.6; jar(ctx, x, c.z0 + 0.4, Y, 0.24, 0.95); }
    bag.add('sacking', lathe([[0.2, 0], [0.26, 0.04], [0.26, 0.2], [0.2, 0.24], [0.1, 0.2], [0.1, 0.04]], 12, null, c.x0 + 0.55, Y, c.zl - 0.1));
    ctx.col.circle(c.x0 + 0.55, c.zl - 0.1, 0.27, Y, Y + 0.24);
  },
  /** A craftsman's loft: the stores and wares of his trade (the trade's name in the plan) with a bed beside. */
  loft(ctx, c, Y, trade) {
    const { bag, col } = ctx;
    if (trade === 'weaver' || !trade) {
      // wool in bundles, skeins on a peg-rail, finished cloth folded in a stack, a spinning basket
      for (let k = 0; k < 4; k++) { const x = c.x0 + 0.6 + k * 0.7; bag.add('linen', box(x - 0.3, Y, c.z0 + 0.15, x + 0.3, Y + 0.45 + hs(x, c.z0, 90) * 0.15, c.z0 + 0.65)); col.rect([x - 0.3, c.z0 + 0.15, x + 0.3, c.z0 + 0.65], Y, Y + 0.55); }
      bag.add('timber', box(c.x0 + 3.6, Y + 1.6, c.z0 + 0.05, c.x1 - 0.3, Y + 1.66, c.z0 + 0.12));
      for (let k = 0; k < 6; k++) { const x = c.x0 + 3.7 + k * 0.28; bag.add(k % 3 === 0 ? 'cloth_indigo' : k % 3 === 1 ? 'cloth_red' : 'cloth_ochre', box(x - 0.06, Y + 0.95 + hs(x, c.z0, 91) * 0.1, c.z0 + 0.1, x + 0.06, Y + 1.6, c.z0 + 0.16)); }
      bales(ctx, c.x1 - 0.8, c.z0 + 0.55, Y, 2); basket(ctx, c.x0 + 3.5, c.zl - 0.1, Y);
    } else if (trade === 'potter') {
      for (let t = 0; t < 2; t++) { const y = Y + 0.55 + t * 0.55; bag.add('timber', box(c.x0 + 0.3, y, c.z0 + 0.1, c.x1 - 0.3, y + 0.04, c.z0 + 0.5)); for (let k = 0; k < 8; k++) { const x = c.x0 + 0.6 + k * 0.52, r = 0.08 + hs(x, y, 92) * 0.04; bag.add('terracotta', lathe([[0.001, 0], [r * 0.7, 0.02], [r * 1.3, 0.11], [r, 0.2], [r * 0.8, 0.23], [0.001, 0.23]], 10, null, x, y + 0.04, c.z0 + 0.3)); } }
      for (const x of [c.x0 + 0.35, c.x1 - 0.35]) { bag.add('timber', box(x - 0.03, Y, c.z0 + 0.12, x + 0.03, Y + 1.1, c.z0 + 0.18)); }
      bag.add('mud_plaster', box(c.x0 + 1.2, Y, c.zl - 0.7, c.x0 + 2.2, Y + 0.5, c.zl - 0.1)); col.rect([c.x0 + 1.2, c.zl - 0.7, c.x0 + 2.2, c.zl - 0.1], Y, Y + 0.5);
      jar(ctx, c.x1 - 0.5, c.zl - 0.1, Y, 0.3, 0.7);
    } else if (trade === 'dyer') {
      // hanks drying from poles under the ceiling, sacks of madder and weld, jars of mordant
      for (const z of [c.z0 + 0.5, c.z0 + 1.3]) { bag.add('timber', box(c.x0 + 0.2, Y + 2.3, z - 0.03, c.x1 - 0.2, Y + 2.36, z + 0.03)); for (let k = 0; k < 9; k++) { const x = c.x0 + 0.5 + k * 0.55; bag.add(k % 3 === 0 ? 'cloth_indigo' : k % 3 === 1 ? 'cloth_red' : 'cloth_ochre', box(x - 0.07, Y + 1.5 + hs(x, z, 93) * 0.15, z - 0.03, x + 0.07, Y + 2.3, z + 0.03)); } }
      sacks(ctx, c.x1 - 0.8, c.zl - 0.1, Y, 3); jar(ctx, c.x0 + 0.5, c.zl - 0.1, Y, 0.26, 0.7); jar(ctx, c.x0 + 1.1, c.zl - 0.15, Y, 0.22, 0.6);
    } else if (trade === 'oil') {
      for (let k = 0; k < 6; k++) { const x = c.x0 + 0.6 + k * 0.85; jar(ctx, x, c.z0 + 0.55, Y, 0.36, 1.05); }
      basket(ctx, c.x0 + 1.0, c.zl - 0.1, Y); basket(ctx, c.x0 + 1.7, c.zl - 0.15, Y, 0.24, 0.26); shelf(ctx, c.x0 + 0.6, c.x0 + 2.4, c.z0 + 0.03, Y, 1.5, 5);
    } else {
      // coppersmith: ingots, finished wares on a rail, a sack of charcoal
      for (let k = 0; k < 4; k++) { const x = c.x0 + 0.5 + (k % 2) * 0.5; bag.add('bronze', box(x - 0.2, Y + Math.floor(k / 2) * 0.12, c.z0 + 0.2, x + 0.2, Y + 0.1 + Math.floor(k / 2) * 0.12, c.z0 + 0.45)); }
      bag.add('timber', box(c.x0 + 1.8, Y + 1.6, c.z0 + 0.1, c.x1 - 0.3, Y + 1.65, c.z0 + 0.16));
      for (let k = 0; k < 6; k++) { const x = c.x0 + 2.0 + k * 0.4, r = 0.07 + hs(x, c.z0, 94) * 0.03; bag.add('bronze', lathe([[0.001, 0], [r, 0.02], [r * 1.3, 0.2], [r * 0.6, 0.3], [0.001, 0.31]], 10, null, x, Y + 1.3, c.z0 + 0.13)); }
      sacks(ctx, c.x1 - 0.8, c.zl - 0.1, Y, 3);
    }
  },
  /** A granary: bins of grain, sacks, big storage jars, a measure basket and a wooden shovel. */
  grain(ctx, c, Y) {
    const { bag, col } = ctx;
    for (let k = 0; k < 2; k++) { const x = c.x0 + 0.95 + k * 1.7; bag.add('cedar', box(x - 0.75, Y, c.z0 + 0.1, x + 0.75, Y + 0.8, c.z0 + 1.1)); bag.add('cloth_ochre', box(x - 0.7, Y + 0.7, c.z0 + 0.15, x + 0.7, Y + 0.76 + hs(x, c.z0, 95) * 0.04, c.z0 + 1.05)); col.rect([x - 0.75, c.z0 + 0.1, x + 0.75, c.z0 + 1.1], Y, Y + 0.8); }
    sacks(ctx, c.x1 - 1.0, c.z0 + 0.35, Y, 6); sacks(ctx, c.x1 - 2.2, c.z0 + 0.35, Y, 4);
    jar(ctx, c.x0 + 4.0, c.z0 + 0.55, Y, 0.42, 1.2); basket(ctx, c.x0 + 0.8, c.zl - 0.1, Y, 0.3, 0.25);
    bag.add('timber', box(c.x0 + 1.5, Y, c.z0 + 1.2, c.x0 + 1.54, Y + 1.5, c.z0 + 1.24));
  },
  /** A jar store: great jars in a row, baskets of dates and figs, a hand quern of basalt. */
  jars(ctx, c, Y) {
    const { bag, col } = ctx;
    for (let k = 0; k < Math.floor(c.w / 0.95) - 1; k++) { const x = c.x0 + 0.6 + k * 0.95; jar(ctx, x, c.z0 + 0.55, Y, 0.4 + hs(x, c.z0, 96) * 0.04, 1.1); }
    for (let k = 0; k < 3; k++) basket(ctx, c.x0 + 0.7 + k * 0.7, c.zl - 0.15, Y, 0.26, 0.28);
    bag.add('basalt', lathe([[0.001, 0], [0.26, 0], [0.26, 0.07], [0.001, 0.09]], 14, null, c.x1 - 1.0, Y, c.zl - 0.2)); bag.add('basalt', lathe([[0.001, 0], [0.22, 0], [0.22, 0.06], [0.001, 0.08]], 14, null, c.x1 - 1.0, Y + 0.07, c.zl - 0.2));
    col.circle(c.x1 - 1.0, c.zl - 0.2, 0.28, Y, Y + 0.16);
  },
  /** One household of a tenement: its bed, chest, brazier with the cooking pot, water jar, a child's bundle. */
  household(ctx, c, Y) {
    const { bag } = ctx;
    bag.add('reed_mat', box(c.x0 + 0.1, Y, c.z0 + 0.1, c.x1 - 0.1, Y + 0.02, c.zl + 0.2));
    pallet(ctx, c.x0 + 1.15, c.z0 + 0.55, Y, 1.95, 0.9, 'x', pickCloth(c.x0, c.z0, 97));
    pallet(ctx, c.x0 + 3.1, c.z0 + 0.5, Y, 1.3, 0.7, 'x', pickCloth(c.x0, c.z0, 98));
    chest(ctx, c.x1 - 0.65, c.z0 + 0.4, Y);
    brazier(ctx, c.x1 - 0.5, c.zl - 0.15, Y); bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.12, 0.2], [0.001, 0.2]], 10, null, c.x1 - 0.5, Y + 0.34, c.zl - 0.15));
    jar(ctx, c.x1 - 1.3, c.zl - 0.1, Y, 0.26, 0.75); basket(ctx, c.x0 + 0.5, c.zl - 0.1, Y);
  },
};

/** Furnish the two chambers of an upper storey: ctx the build context, el the house element (up: the use, trade), U its upperLayout. */
export function furnishUpper(ctx, el, U) {
  const [a, b] = UPPER_USES[el.up] || UPPER_USES.family, { ri, xp, Y } = U, zl = ri[3] - 1.9;
  const A = { out: ri[0], dir: -1, x0: ri[0], x1: xp - 0.15, z0: ri[1], z1: ri[3], zl, w: xp - 0.15 - ri[0] }, B = { out: ri[2], dir: 1, x0: xp + 0.15, x1: ri[2], z0: ri[1], z1: ri[3], zl, w: ri[2] - xp - 0.15 };
  uses[a](ctx, A, Y, el.trade); uses[b](ctx, B, Y, el.trade);
}
