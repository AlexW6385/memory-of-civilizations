// Towers and pavilions (docs/settlements/bali-village.md §3, §4): the meru, the kulkul tower, the bale (open pavilion on a plinth), the wantilan with the gamelan,
// the compound's house (bale daja), the kitchen (paon), the rice barn (lumbung).
import { box, lathe } from '../../core/geom.js';
import { bx, post, thatchHip, steps, coping, canang, rng, pick, TAU } from './kit.js';

/** bali_meru: { c, y, tiers (3 | 5 | 7 | 9 | 11), a (half width of the base), seed } — a base with stair, the closed cell, then the roofs diminishing upward. */
export function meru(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, n = el.tiers ?? 5, a = el.a ?? 2.2, bh = 1.5;
  bx(ctx, 'andesite', cx - a - 0.25, y - 0.3, cz - a - 0.25, cx + a + 0.25, y + 0.5, cz + a + 0.25, true);
  bx(ctx, 'brick', cx - a, y + 0.5, cz - a, cx + a, y + bh, cz + a, true);
  coping(ctx, cx - a, cz - a, cx + a, cz + a, y + bh, 'tuff_hewn');
  steps(ctx, [cx - 0.8, cz + a + 0.25, cx + 0.8, cz + a + 1.5], y, y + bh + 0.2, 'n', 'andesite', 0.2, y - 0.3);
  const y0 = y + bh + 0.2, sp = 1.05 + (n > 5 ? 0.05 : 0);
  // the cell (a closed chamber of painted timber, in the lowest storey) and the frame of posts above
  const cw = a * 0.6;
  bx(ctx, 'wood_painted', cx - cw, y0, cz - cw, cx + cw, y0 + 1.5, cz + cw, true);
  bx(ctx, 'wood_dark', cx - 0.35, y0, cz + cw, cx + 0.35, y0 + 1.1, cz + cw + 0.05);
  for (let k = 0; k < n; k++) {
    const t = k / Math.max(1, n - 1), ek = a + 0.9 - t * (a + 0.2), ey = y0 + 1.5 + k * sp + (k === 0 ? 0 : 0.0);
    thatchHip(ctx, { c: [cx, cz], A: ek, B: ek, y: ey, rise: 0.75 + 0.3 * (k === n - 1), mat: 'ijuk', pow: 1.5, th: 0.34 });
    if (k < n - 1) {
      const pr = Math.max(0.35, ek * 0.45);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(ctx, 'wood_painted', cx + sx * pr, cz + sz * pr, ey - 0.0, ey + sp, 0.07, false);
      bx(ctx, 'wood_painted', cx - pr - 0.1, ey + sp - 0.12, cz - pr - 0.1, cx + pr + 0.1, ey + sp - 0.02, cz + pr + 0.1);
    }
  }
  const top = y0 + 1.5 + (n - 1) * sp + 1.05;
  ctx.bag.add('gilt_bronze', lathe([[0.001, 0], [0.16, 0], [0.1, 0.25], [0.14, 0.5], [0.07, 0.8], [0.001, 1.2]], 8, null, cx, top - 0.2, cz));
  ctx.col.rect([cx - cw, cz - cw, cx + cw, cz + cw], y0, top);
}

/** bali_kulkul: { c, y } — the drum tower: a stone and brick base with a stair, an open timber frame, a thatched hip roof, the log drum hung under it. */
export function kulkul(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, a = el.a ?? 1.9, H = el.h ?? 4.6;
  bx(ctx, 'andesite', cx - a - 0.2, y - 0.3, cz - a - 0.2, cx + a + 0.2, y + 0.4, cz + a + 0.2, true);
  bx(ctx, 'brick', cx - a, y + 0.4, cz - a, cx + a, y + 3.6, cz + a, true);
  for (const k of [1.2, 2.4]) bx(ctx, 'tuff_hewn', cx - a - 0.08, y + k, cz - a - 0.08, cx + a + 0.08, y + k + 0.1, cz + a + 0.08);
  coping(ctx, cx - a, cz - a, cx + a, cz + a, y + 3.6, 'tuff_hewn');
  steps(ctx, [cx - 0.7, cz + a, cx + 0.7, cz + a + 3.0], y, y + 3.7, 'n', 'brick', 0.2, y - 0.3);
  const f = y + 3.7;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(ctx, 'wood_painted', cx + sx * (a - 0.3), cz + sz * (a - 0.3), f, f + H - 1.0, 0.11, false);
  bx(ctx, 'wood_painted', cx - a, f + 0.9, cz - a, cx + a, f + 1.0, cz - a + 0.1); bx(ctx, 'wood_painted', cx - a, f + 0.9, cz + a - 0.1, cx + a, f + 1.0, cz + a);
  bx(ctx, 'wood_painted', cx - a, f + 0.9, cz - a, cx - a + 0.1, f + 1.0, cz + a); bx(ctx, 'wood_painted', cx + a - 0.1, f + 0.9, cz - a, cx + a, f + 1.0, cz + a);
  bx(ctx, 'wood_painted', cx - a, f + H - 1.15, cz - a, cx + a, f + H - 1.0, cz + a);
  ctx.col.floor([cx - a + 0.1, cz - a + 0.1, cx + a - 0.1, cz + a - 0.1], f);
  bx(ctx, 'wood_ochre', cx - a, f - 0.06, cz - a, cx + a, f, cz + a);
  thatchHip(ctx, { c: [cx, cz], A: a + 1.0, B: a + 1.0, y: f + H - 1.0, rise: 1.8, mat: 'thatch_palm', pow: 1.4 });
  // the drum: a hollow log hung on two ropes from the beam, a slit along it
  ctx.bag.add('wood_dark', lathe([[0.001, 0], [0.26, 0.0], [0.27, 1.0], [0.24, 1.3], [0.001, 1.3]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(cx - 0.65, f + H - 1.8, cz));
  bx(ctx, 'timber', cx - 0.14, f + H - 1.0 - 0.04, cz - 0.02, cx - 0.1, f + H - 0.0 - 1.0, cz + 0.02);
  bx(ctx, 'timber', cx + 0.5, f + H - 1.8, cz - 0.02, cx + 0.54, f + H - 1.0, cz + 0.02);
}

/**
 * bali_bale: { rect, y (the ground), floor (plinth height), h (post height), bays [cols, rows] (post grid), walls ('none' | 'back' | 'three'), furnish ('mats' | 'tray' | 'none'),
 * roof ('palm' | 'ijuk' | 'thatch'), tier2 (a second stage), door side for walls, seed, stairs ('s' | 'n' | 'e' | 'w') } — an open pavilion on a brick plinth; walkable from the stair.
 */
export function bale(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, pl = el.floor ?? 0.6, H = el.h ?? 2.5, [nc, nr] = el.bays ?? [3, 2], rand = rng(el.seed ?? 1);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, f = y + pl, st = el.stairs ?? 's';
  bx(ctx, 'brick', x0 - 0.15, y - 0.3, z0 - 0.15, x1 + 0.15, f - 0.08, z1 + 0.15, true);
  coping(ctx, x0 - 0.15, z0 - 0.15, x1 + 0.15, z1 + 0.15, f - 0.12, 'tuff_hewn');
  bx(ctx, el.floorMat ?? 'wood_ochre', x0, f - 0.04, z0, x1, f, z1);
  // the floor is walkable except under the walls' footprints, which are solid anyway
  ctx.col.floor([x0, z0, x1, z1], f);
  // the stair, in the middle of the chosen side
  const sw = Math.min(1.6, (st === 's' || st === 'n' ? x1 - x0 : z1 - z0) * 0.4);
  if (st === 's') steps(ctx, [cx - sw / 2, z1 + 0.15, cx + sw / 2, z1 + 0.15 + pl * 2.2], y, f, 'n', 'tuff_hewn', 0.2, y - 0.3);
  if (st === 'n') steps(ctx, [cx - sw / 2, z0 - 0.15 - pl * 2.2, cx + sw / 2, z0 - 0.15], y, f, 's', 'tuff_hewn', 0.2, y - 0.3);
  if (st === 'e') steps(ctx, [x1 + 0.15, cz - sw / 2, x1 + 0.15 + pl * 2.2, cz + sw / 2], y, f, 'w', 'tuff_hewn', 0.2, y - 0.3);
  if (st === 'w') steps(ctx, [x0 - 0.15 - pl * 2.2, cz - sw / 2, x0 - 0.15, cz + sw / 2], y, f, 'e', 'tuff_hewn', 0.2, y - 0.3);
  const pm = el.postMat ?? 'wood_painted', ins = 0.3, px0 = x0 + ins, px1 = x1 - ins, pz0 = z0 + ins, pz1 = z1 - ins;
  const posts = [];
  for (let i = 0; i <= nc; i++) for (let j = 0; j <= nr; j++) if (i === 0 || j === 0 || i === nc || j === nr) posts.push([px0 + (px1 - px0) * i / nc, pz0 + (pz1 - pz0) * j / nr]);
  for (const [x, z] of posts) { post(ctx, pm, x, z, f, f + H, 0.13); bx(ctx, 'wood_dark', x - 0.17, f, z - 0.17, x + 0.17, f + 0.12, z + 0.17); }
  // the tie-beams and the carved fascia under the eave
  bx(ctx, pm, px0 - 0.2, f + H - 0.28, pz0 - 0.1, px1 + 0.2, f + H - 0.06, pz0 + 0.1); bx(ctx, pm, px0 - 0.2, f + H - 0.28, pz1 - 0.1, px1 + 0.2, f + H - 0.06, pz1 + 0.1);
  bx(ctx, pm, px0 - 0.1, f + H - 0.28, pz0, px0 + 0.1, f + H - 0.06, pz1); bx(ctx, pm, px1 - 0.1, f + H - 0.28, pz0, px1 + 0.1, f + H - 0.06, pz1);
  if (el.gold) for (const [a, b, c, d] of [[px0 + 0.3, pz0 - 0.13, px1 - 0.3, pz0 - 0.08], [px0 + 0.3, pz1 + 0.08, px1 - 0.3, pz1 + 0.13]]) bx(ctx, 'gilt_bronze', a, f + H - 0.2, b, c, f + H - 0.12, d);
  // walls: a low brick wall and woven bamboo over it on the closed sides
  const wl = el.walls ?? 'none';
  const wallRun = (a, b, c, d) => { bx(ctx, 'brick', a, f, b, c, f + 0.9, d, true); bx(ctx, 'wicker', a, f + 0.9, b, c, f + H - 0.3, d, true); };
  const opp = { n: 's', s: 'n', e: 'w', w: 'e' }[st], sides = wl === 'three' ? ['n', 's', 'e', 'w'].filter((q) => q !== st) : wl === 'back' ? [opp] : [];
  for (const q of sides) {
    if (q === 'n') wallRun(px0, pz0 - 0.08, px1, pz0 + 0.08); else if (q === 's') wallRun(px0, pz1 - 0.08, px1, pz1 + 0.08);
    else if (q === 'w') wallRun(px0 - 0.08, pz0, px0 + 0.08, pz1); else wallRun(px1 - 0.08, pz0, px1 + 0.08, pz1);
  }
  // the roof: a hip of alang-alang, steep, the second stage above a band of open air
  const A = (x1 - x0) / 2 + 1.0, B = (z1 - z0) / 2 + 1.0, mat = el.roof === 'ijuk' ? 'ijuk' : el.roof === 'thatch' ? 'thatch' : 'thatch_palm';
  const rise = Math.max(1.4, Math.min(A, B) * 1.15);
  if (el.tier2) {
    thatchHip(ctx, { c: [cx, cz], A, B, y: f + H, rise: rise * 0.45, mat, pow: 1.3 });
    const a2 = A * 0.62, b2 = B * 0.62, y2 = f + H + rise * 0.45 + 0.7;
    for (const [x, z] of [[cx - a2 * 0.8, cz - b2 * 0.8], [cx + a2 * 0.8, cz - b2 * 0.8], [cx - a2 * 0.8, cz + b2 * 0.8], [cx + a2 * 0.8, cz + b2 * 0.8]]) post(ctx, 'wood_dark', x, z, y2 - 0.7, y2, 0.1, false);
    thatchHip(ctx, { c: [cx, cz], A: a2 + 0.6, B: b2 + 0.6, y: y2, rise: rise * 0.9, mat, pow: 1.3 });
  } else thatchHip(ctx, { c: [cx, cz], A, B, y: f + H, rise, mat, pow: 1.3 });
  // furnishing
  if (el.furnish === 'mats') {
    for (let k = 0; k < 3; k++) { const mx = x0 + 0.8 + rand() * (x1 - x0 - 2.4), mz = z0 + 0.8 + rand() * (z1 - z0 - 2.4); bx(ctx, 'reed_mat', mx, f, mz, mx + 1.3, f + 0.025, mz + 0.9); }
    bx(ctx, 'wood_dark', cx - 0.5, f, z0 + 0.6, cx + 0.5, f + 0.35, z0 + 1.1);
    canang(ctx, cx, f + 0.35, z0 + 0.85, 1);
  }
  if (el.furnish === 'tray') {
    bx(ctx, 'reed_mat', x0 + 0.5, f, z0 + 0.5, x1 - 0.5, f + 0.025, z0 + 1.7);
    for (let i = 0; i < Math.floor((x1 - x0 - 1.2) / 0.7); i++) { ctx.bag.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.2], [0.001, 0.2]], 8, null, x0 + 0.9 + i * 0.7, f + 0.025, z0 + 1.1)); canang(ctx, x0 + 0.9 + i * 0.7, f + 0.225, z0 + 1.1, i); }
  }
  void pick; void TAU; void box;
}

/** A gamelan in its place: rows of metallophones (gangsa) on carved red-and-gold frames, the jegogan, the reyong, drums, the gong ageng on its frame. c, y; the front toward +z. */
export function gamelan(ctx, cx, cz, y) {
  const frame = (x, z, len, h) => {
    bx(ctx, 'lacquer_red', x - len / 2, y, z - 0.28, x - len / 2 + 0.12, y + h, z + 0.28, true); bx(ctx, 'lacquer_red', x + len / 2 - 0.12, y, z - 0.28, x + len / 2, y + h, z + 0.28, true);
    bx(ctx, 'lacquer_red', x - len / 2, y + h * 0.5, z - 0.22, x + len / 2, y + h * 0.5 + 0.1, z + 0.22);
    bx(ctx, 'gilt_bronze', x - len / 2, y + h - 0.02, z - 0.24, x + len / 2, y + h + 0.03, z + 0.24);
    for (let k = 0; k < 7; k++) { const bxx = x - len / 2 + 0.2 + k * (len - 0.4) / 7; bx(ctx, 'bronze', bxx, y + h + 0.03, z - 0.2, bxx + (len - 0.4) / 7 - 0.03, y + h + 0.06, z + 0.2); }
  };
  for (let r = 0; r < 3; r++) { frame(cx - 2.6, cz - 1.0 + r * 1.1, 1.8, 0.55); frame(cx + 2.6, cz - 1.0 + r * 1.1, 1.8, 0.55); }
  frame(cx - 1.0, cz - 1.2, 1.5, 0.7); frame(cx + 1.0, cz - 1.2, 1.5, 0.7);
  // reyong: a row of twelve small kettle gongs on a long frame
  bx(ctx, 'lacquer_red', cx - 1.2, y + 0.3, cz + 0.6, cx + 1.2, y + 0.36, cz + 1.0);
  for (let k = 0; k < 12; k++) ctx.bag.add('bronze', lathe([[0.001, 0], [0.09, 0.0], [0.1, 0.07], [0.04, 0.12], [0.001, 0.13]], 8, null, cx - 1.1 + k * 0.2, y + 0.36, cz + 0.8));
  // the gong ageng: a tall frame with the great gong hanging in it, a drum at its foot
  const gx = cx, gz = cz - 2.8;
  bx(ctx, 'lacquer_red', gx - 0.9, y, gz - 0.2, gx - 0.75, y + 2.0, gz + 0.2, true); bx(ctx, 'lacquer_red', gx + 0.75, y, gz - 0.2, gx + 0.9, y + 2.0, gz + 0.2, true);
  bx(ctx, 'gilt_bronze', gx - 0.95, y + 1.95, gz - 0.22, gx + 0.95, y + 2.12, gz + 0.22);
  ctx.bag.add('bronze', lathe([[0.001, 0], [0.55, 0], [0.55, 0.1], [0.5, 0.14], [0.001, 0.14]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).translate(gx, y + 1.1, gz));
  bx(ctx, 'timber', gx - 0.02, y + 1.65, gz - 0.02, gx + 0.02, y + 1.95, gz + 0.02);
  for (const s of [-1, 1]) ctx.bag.add('wood_painted', lathe([[0.16, 0], [0.22, 0.2], [0.2, 0.55], [0.14, 0.7]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(cx + s * 1.4 - 0.35, y + 0.4, cz + 1.8));
}

/**
 * bali_wantilan: { rect, y, seed } — the banjar's hall: twelve columns, a floor of planks on a low plinth, a two-stage hip roof, the gamelan at the kaja end.
 */
export function wantilan(el, ctx) {
  bale({ rect: el.rect, y: el.y, floor: 0.5, h: 3.4, bays: [4, 3], tier2: true, roof: 'palm', furnish: 'none', stairs: 's', gold: true, seed: el.seed }, ctx);
  const [x0, z0, x1, z1] = el.rect, f = (el.y ?? 0) + 0.5, cx = (x0 + x1) / 2;
  gamelan(ctx, cx, z0 + 3.8, f);
  bx(ctx, 'reed_mat', x0 + 1, f, z1 - 4, x1 - 1, f + 0.025, z1 - 1);
}

/** bali_paon: { rect, y, seed } — the compound's kitchen: an open bale with a hearth of three stones, pots, a rack of firewood, a rice mortar. */
export function paon(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = y + 0.35;
  bale({ rect: el.rect, y, floor: 0.35, h: 2.2, bays: [2, 1], walls: 'three', roof: 'thatch', stairs: el.stairs ?? 's', seed: el.seed, furnish: 'none' }, ctx);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bx(ctx, 'brick_grey', cx - 0.6, f, cz - 0.5, cx + 0.6, f + 0.35, cz + 0.5);
  bx(ctx, 'basalt', cx - 0.45, f + 0.35, cz - 0.35, cx + 0.45, f + 0.38, cz + 0.35);
  ctx.bag.add('pottery_dark', lathe([[0.001, 0], [0.22, 0.02], [0.3, 0.2], [0.24, 0.38], [0.2, 0.4]], 10, null, cx - 0.2, f + 0.38, cz));
  ctx.bag.add('pottery_dark', lathe([[0.001, 0], [0.15, 0.02], [0.2, 0.14], [0.14, 0.28]], 10, null, cx + 0.25, f + 0.38, cz + 0.05));
  for (let k = 0; k < 5; k++) bx(ctx, 'log_pine', x1 - 0.9, f + k * 0.1, z0 + 0.5 + 0.0, x1 - 0.3, f + k * 0.1 + 0.09, z0 + 1.2);
  ctx.bag.add('wood_painted', lathe([[0.2, 0], [0.16, 0.2], [0.18, 0.4]], 8, null, x0 + 0.8, f, z1 - 0.8));
}

/** bali_lumbung: { c, y } — the rice barn: four posts with round rat-guards, a loft with a thatched roof that sweeps low and bulges. */
export function lumbung(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, a = 0.9;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = cx + sx * a * 0.8, z = cz + sz * a * 0.8;
    bx(ctx, 'tuff_hewn', x - 0.18, y, z - 0.18, x + 0.18, y + 0.25, z + 0.18);
    post(ctx, 'wood_painted', x, z, y + 0.25, y + 1.5, 0.11, true);
    ctx.bag.add('wood_dark', lathe([[0.001, 0], [0.3, 0.0], [0.3, 0.05], [0.12, 0.1]], 8, null, x, y + 1.15, z));
  }
  bx(ctx, 'wood_ochre', cx - a, y + 1.5, cz - a, cx + a, y + 1.6, cz + a);
  bx(ctx, 'wicker', cx - a + 0.1, y + 1.6, cz - a + 0.1, cx + a - 0.1, y + 2.3, cz + a - 0.1);
  bx(ctx, 'wood_dark', cx - 0.3, y + 1.6, cz + a - 0.12, cx + 0.3, y + 2.1, cz + a - 0.08);
  thatchHip(ctx, { c: [cx, cz], A: a + 0.7, B: a + 0.7, y: y + 2.3, rise: 1.5, mat: 'thatch_palm', pow: 1.2 });
  ctx.col.rect([cx - a, cz - a, cx + a, cz + a], y + 1.0, y + 2.3);
}

/** bali_house: { rect, y, door ('s'|'n'|'e'|'w'), seed } — the bale daja / meten: a closed house of brick on a plinth, a verandah under the eave, one door, a thatched hip roof. */
export function house(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, pl = 0.45, f = y + pl, d = el.door ?? 's', cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 2.5;
  bx(ctx, 'brick', x0 - 0.9, y - 0.3, z0 - 0.9, x1 + 0.9, f - 0.05, z1 + 0.9, false);
  const veranda = [x0 - 0.9, z0 - 0.9, x1 + 0.9, z1 + 0.9];
  ctx.col.floor(veranda, f);
  bx(ctx, 'wood_ochre', veranda[0], f - 0.04, veranda[1], veranda[2], f, veranda[3]);
  coping(ctx, veranda[0], veranda[1], veranda[2], veranda[3], f - 0.12, 'tuff_hewn');
  // walls with a door in the chosen face
  const t = 0.3, dw = 0.5;
  const wall4 = [['n', x0, z0, x1, z0 + t], ['s', x0, z1 - t, x1, z1], ['w', x0, z0, x0 + t, z1], ['e', x1 - t, z0, x1, z1]];
  for (const [s, a, b, c, e] of wall4) {
    if (s !== d) { bx(ctx, 'brick', a, f, b, c, f + H, e, true); continue; }
    const horiz = s === 'n' || s === 's', mid = horiz ? (a + c) / 2 : (b + e) / 2;
    if (horiz) { bx(ctx, 'brick', a, f, b, mid - dw, f + H, e, true); bx(ctx, 'brick', mid + dw, f, b, c, f + H, e, true); bx(ctx, 'brick', mid - dw, f + 2.0, b, mid + dw, f + H, e, true); bx(ctx, 'wood_dark', mid - dw, f, b + 0.05, mid + dw, f + 2.0, e - 0.05); }
    else { bx(ctx, 'brick', a, f, b, c, f + H, mid - dw, true); bx(ctx, 'brick', a, f, mid + dw, c, f + H, e, true); bx(ctx, 'brick', a, f + 2.0, mid - dw, c, f + H, mid + dw, true); bx(ctx, 'wood_dark', a + 0.05, f, mid - dw, c - 0.05, f + 2.0, mid + dw); }
  }
  coping(ctx, x0, z0, x1, z1, f + H, 'tuff_hewn');
  // carved door frame
  const df = d === 's' ? [cx - dw - 0.1, z1 - t - 0.04, cx + dw + 0.1, z1 + 0.02] : d === 'n' ? [cx - dw - 0.1, z0 - 0.02, cx + dw + 0.1, z0 + t + 0.04] : d === 'e' ? [x1 - t - 0.04, cz - dw - 0.1, x1 + 0.02, cz + dw + 0.1] : [x0 - 0.02, cz - dw - 0.1, x0 + t + 0.04, cz + dw + 0.1];
  bx(ctx, 'wood_painted', df[0], f + 2.0, df[1], df[2], f + 2.15, df[3]);
  thatchHip(ctx, { c: [cx, cz], A: (x1 - x0) / 2 + 1.3, B: (z1 - z0) / 2 + 1.3, y: f + H + 0.2, rise: Math.max(1.5, Math.min(x1 - x0, z1 - z0) * 0.6), mat: el.roof === 'ijuk' ? 'ijuk' : 'thatch_palm', pow: 1.3 });
  // the furnished room can be seen through the door: a sleeping platform and a chest inside (head toward kaja)
  bx(ctx, 'wood_ochre', x0 + t + 0.1, f, z0 + t + 0.1, x0 + t + 1.5, f + 0.4, z1 - t - 0.1);
  bx(ctx, 'reed_mat', x0 + t + 0.1, f + 0.4, z0 + t + 0.1, x0 + t + 1.5, f + 0.43, z1 - t - 0.1);
  bx(ctx, 'wood_dark', x1 - t - 0.9, f, z0 + t + 0.1, x1 - t - 0.1, f + 0.7, z0 + t + 0.8);
  void pick; void rng;
}
