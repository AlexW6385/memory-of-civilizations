// Towers and pavilions (docs/settlements/bali-village.md §3, §4): the meru, the kulkul tower, the bale (open pavilion on a plinth), the wantilan with the gamelan,
// the compound's house (bale daja), the kitchen (paon), the rice barn (lumbung).
import { box, lathe, rod } from '../../core/geom.js';
import { bx, post, fringe, thatchHip, hipHeight, steps, coping, canang, sash, rng, pick, TAU } from './kit.js';
import { frame, patraField, lotusFinial, ukel } from './carve.js';

/** bali_meru: { c, y, tiers (3 | 5 | 7 | 9 | 11), a (half width of the base), seed } — a base with stair, the closed cell, then the roofs diminishing upward. */
export function meru(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, n = el.tiers ?? 5, a = el.a ?? 2.2, bh = 1.5;
  bx(ctx, 'andesite', cx - a - 0.25, y - 0.3, cz - a - 0.25, cx + a + 0.25, y + 0.5, cz + a + 0.25, true);
  bx(ctx, 'brick', cx - a, y + 0.5, cz - a, cx + a, y + bh, cz + a, true);
  coping(ctx, cx - a, cz - a, cx + a, cz + a, y + bh, 'tuff_hewn');
  steps(ctx, [cx - 0.8, cz + a + 0.25, cx + 0.8, cz + a + 1.5], y, y + bh + 0.2, 'n', 'andesite', 0.2, y - 0.3);
  // the base's carved fields on its four faces (the stair's face in two, either side of the stair)
  for (const face of ['s', 'n', 'e', 'w']) {
    const F = frame(ctx, cx, cz, face), v0 = y + 0.62, v1 = y + bh - 0.12;
    if (face === 's') { patraField(F, 'tuff_hewn', 'andesite', 0.95, v0, a - 0.25, v1, a, 0.3); patraField(F, 'tuff_hewn', 'andesite', -(a - 0.25), v0, -0.95, v1, a, 0.3); }
    else patraField(F, 'tuff_hewn', 'andesite', -(a - 0.25), v0, a - 0.25, v1, a, 0.3);
  }
  // the stair's cheek walls, stepping with it and ending at the foot in a scroll
  { const zs = cz + a + 0.25, zl = cz + a + 1.5, nst = Math.max(1, Math.round((bh + 0.2) / 0.2));
    for (const sd of [-1, 1]) {
      for (let i = 0; i < nst; i++) { const f0 = i / nst, f1 = (i + 1) / nst, zz0 = zl - (zl - zs) * f1, zz1 = zl - (zl - zs) * f0; bx(ctx, i % 2 ? 'tuff_hewn' : 'andesite', cx + sd * 0.8 - (sd > 0 ? 0 : 0.28), y - 0.3, zz0, cx + sd * 0.8 + (sd > 0 ? 0.28 : 0), y + (bh + 0.2) * f1 + 0.32, zz1); }
      const F = frame(ctx, cx + sd * (0.8 + 0.28 * (sd > 0 ? 1 : 0)) - (sd > 0 ? 0 : 0), zl - 0.3, sd > 0 ? 'e' : 'w');
      ukel(F, 'tuff_hewn', 0, y + 0.3, 0.015, 0.17, sd, 0.03);
      F.ballF('tuff_hewn', 0.0, y + 0.3, 0.03, 0.045, 5);
    }
    bx(ctx, 'tuff_hewn', cx - 1.12, y + bh + 0.2, zs - 0.02, cx + 1.12, y + bh + 0.5, zs + 0.3);
  }
  // pilasters at the base's corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bx(ctx, 'tuff_hewn', cx + sx * a - 0.17 - (sx > 0 ? 0 : -0.0), y + 0.5, cz + sz * a - 0.17, cx + sx * a + 0.17, y + bh, cz + sz * a + 0.17); }
  const y0 = y + bh + 0.2, sp = 1.05 + (n > 5 ? 0.05 : 0);
  // the cell (a closed chamber of painted timber, in the lowest storey): corner posts with poleng, framed carved door, carved fields on the three other faces
  const cw = a * 0.6, rnd = rng((el.seed ?? 1) * 7919 + 13);
  bx(ctx, 'wood_painted', cx - cw, y0, cz - cw, cx + cw, y0 + 1.5, cz + cw, true);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bx(ctx, 'wood_dark', cx + sx * cw - 0.09, y0, cz + sz * cw - 0.09, cx + sx * cw + 0.09, y0 + 1.5, cz + sz * cw + 0.09); sash(ctx, cx + sx * cw, cz + sz * cw, y0 + 0.5, 0.06); }
  bx(ctx, 'wood_dark', cx - 0.38, y0, cz + cw, cx + 0.38, y0 + 1.1, cz + cw + 0.05);
  for (const sd of [-1, 1]) bx(ctx, 'gilt_bronze', cx + sd * 0.42 - 0.04, y0, cz + cw, cx + sd * 0.42 + 0.04, y0 + 1.2, cz + cw + 0.09);
  bx(ctx, 'gilt_bronze', cx - 0.46, y0 + 1.1, cz + cw, cx + 0.46, y0 + 1.2, cz + cw + 0.09);
  patraField(frame(ctx, cx, cz, 's'), 'gilt_bronze', 'wood_dark', -0.28, y0 + 0.1, 0.28, y0 + 1.0, cw + 0.05, 0.28);
  { // framed panels of gilt on the cell's faces (a dark ground, a gilt edge): the south face either side of the door, and the other three faces
    const pan = (face, u0, u1) => { const G = 'wood_painted'; const F = frame(ctx, cx, cz, face), v0 = y0 + 0.2, v1 = y0 + 1.1, n = cw + 0.02; F.B('wood_dark', u0, v0, n, u1, v1, n + 0.02); F.B(G, u0, v0, n, u1, v0 + 0.04, n + 0.04); F.B(G, u0, v1 - 0.04, n, u1, v1, n + 0.04); F.B(G, u0, v0, n, u0 + 0.04, v1, n + 0.04); F.B(G, u1 - 0.04, v0, n, u1, v1, n + 0.04); F.B(G, (u0 + u1) / 2 - 0.03, v0 + 0.3, n, (u0 + u1) / 2 + 0.03, v1 - 0.3, n + 0.05); };
    const w2 = cw - 0.2 - 0.5; if (w2 > 0.3) { pan('s', 0.52, 0.52 + w2); pan('s', -0.52 - w2, -0.52); }
    for (const face of ['n', 'e', 'w']) pan(face, -cw + 0.3, cw - 0.3);
  }
  for (let k = 0; k < n; k++) {
    const t = k / Math.max(1, n - 1), ek = a + 0.9 - t * (a + 0.2), ey = y0 + 1.5 + k * sp;
    thatchHip(ctx, { c: [cx, cz], A: ek, B: ek, y: ey, rise: 0.75 + 0.3 * (k === n - 1), mat: 'ijuk', pow: 1.5, th: 0.34 });
    // the cut fringe of the thatch, bundles of uneven length, and the curl at each corner
    {
      fringe(ctx, 'ijuk', cx, cz, ey - 0.3, ek, rnd);
    }
    if (k < n - 1) {
      // the storey between two roofs: a dark closed core with carved posts at the corners and the faces' middles, a rail and a beam gilt along its edge
      const pr = Math.max(0.35, ek * 0.45);
      bx(ctx, 'wood_dark', cx - pr * 0.82, ey + 0.05, cz - pr * 0.82, cx + pr * 0.82, ey + sp - 0.12, cz + pr * 0.82, k === 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(ctx, 'wood_painted', cx + sx * pr, cz + sz * pr, ey - 0.0, ey + sp, 0.07, false);
      if (pr > 0.6) for (const q of [-1, 1]) { post(ctx, 'wood_painted', cx + q * pr, cz, ey, ey + sp, 0.06, false); post(ctx, 'wood_painted', cx, cz + q * pr, ey, ey + sp, 0.06, false); }
      if (k === 0) for (const sx of [-1, 1]) for (const sz of [-1, 1]) sash(ctx, cx + sx * pr, cz + sz * pr, ey + 0.35, 0.07);
      bx(ctx, 'wood_painted', cx - pr - 0.1, ey + sp - 0.12, cz - pr - 0.1, cx + pr + 0.1, ey + sp - 0.02, cz + pr + 0.1);
      bx(ctx, 'wood_painted', cx - pr - 0.06, ey + 0.1, cz - pr - 0.06, cx + pr + 0.06, ey + 0.17, cz + pr + 0.06);
    }
  }
  const top = y0 + 1.5 + (n - 1) * sp + 1.05;
  lotusFinial(ctx, cx, top - 0.2, cz, 0.15);
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
  // the posts rise to the underside of the first roof stage, which is higher over them than at the eave
  const rA = (x1 - x0) / 2 + 1.0, rB = (z1 - z0) / 2 + 1.0, rRise = Math.max(1.4, Math.min(rA, rB) * 1.15) * (el.tier2 ? 0.45 : 1);
  const postTop = (x, z) => f + H + hipHeight(rA, rB, rRise, 1.3, x - cx, z - cz) - 0.2;
  for (const [x, z] of posts) { post(ctx, pm, x, z, f, Math.max(f + H, postTop(x, z)), 0.13); bx(ctx, 'wood_dark', x - 0.17, f, z - 0.17, x + 0.17, f + 0.12, z + 0.17); }
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
    for (const [x, z] of [[cx - a2 * 0.8, cz - b2 * 0.8], [cx + a2 * 0.8, cz - b2 * 0.8], [cx - a2 * 0.8, cz + b2 * 0.8], [cx + a2 * 0.8, cz + b2 * 0.8]]) post(ctx, 'wood_dark', x, z, f + H, y2, 0.1, false);
    post(ctx, 'wood_dark', cx, cz, f + H + rise * 0.45 - 0.2, y2 + rise * 0.9 - 0.15, 0.12, false);  // the king post from the lower roof up to the ridge of the upper
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
  interior(ctx, { x0, z0, x1, z1, t, f, d, H, sd: el.seed ?? 1 });
  void pick; void rng;
}

/**
 * The sleeping house's room, furnished in the frame of its own door (lu along the back wall, lv from the back wall toward the door; the door's strip stays free) by one of four
 * variants: the sleepers' house, the weavers', the store, the elder's bed. docs/settlements/bali-village.md §11.
 */
function interior(ctx, { x0, z0, x1, z1, t, f, d, H, sd }) {
  const xi0 = x0 + t, xi1 = x1 - t, zi0 = z0 + t, zi1 = z1 - t;
  const along = d === 'n' || d === 's', U = along ? xi1 - xi0 : zi1 - zi0, V = along ? zi1 - zi0 : xi1 - xi0;
  const P = (lu, lv) => (d === 'n' ? [xi0 + lu, zi1 - lv] : d === 's' ? [xi1 - lu, zi0 + lv] : d === 'e' ? [xi0 + lv, zi1 - lu] : [xi1 - lv, zi0 + lu]);
  const B = (m, a, b, c, e, h0, h1, solid = false) => { const p = P(a, b), q = P(c, e); bx(ctx, m, Math.min(p[0], q[0]), f + h0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), f + h1, Math.max(p[1], q[1]), solid); };
  const L = (m, prof, lu, lv, h0 = 0, seg = 8) => { const p = P(lu, lv); ctx.bag.add(m, lathe(prof, seg, null, p[0], f + h0, p[1])); };
  const Rd = (m, a, b, r) => { const p = P(a[0], a[1]), q = P(b[0], b[1]); ctx.bag.add(m, rod([p[0], f + a[2], p[1]], [q[0], f + b[2], q[1]], r, 5)); };
  const variant = U >= 5.4 ? (sd >> 2) % 4 : 0, pw = Math.min(1.9, U - 1.7), cl = ['cloth_red', 'cloth_indigo', 'cloth_ochre'][sd % 3];
  // under the thatch: three tie-beams across the room; the offering ledge on the back wall at the left, a clay lamp lit on it
  for (let k = 0; k < 3; k++) B('wood_dark', 0, V * (k + 0.5) / 3 - 0.06, U, V * (k + 0.5) / 3 + 0.06, H - 0.22, H - 0.1);
  B('wood_dark', 0.1, 0, 1.3, 0.3, 1.1, 1.16); canang(ctx, ...(() => { const p = P(0.45, 0.15); return [p[0], f + 1.16, p[1]]; })(), sd);
  { const p = P(0.9, 0.15); ctx.bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0.01], [0.07, 0.04], [0.04, 0.06], [0.001, 0.06]], 8, null, p[0], f + 1.16, p[1])); ctx.lights?.push({ at: [p[0], f + 1.3, p[1]], color: '#ffb86a', intensity: 2.6, distance: 6 }); }
  const jar = (lu, lv, k = 0) => L(k ? 'terracotta' : 'pottery_dark', [[0.001, 0], [0.15, 0.02], [0.21, 0.2], [0.14, 0.4], [0.1, 0.44]], lu, lv);
  if (variant === 0) {
    // the sleepers: the platform with its mat, pillow and folded cloths; the chest, a sack, jars, a cloth on the end wall
    B('wood_ochre', 0.1, 0.1, pw, V - 0.1, 0, 0.4, true); B('reed_mat', 0.1, 0.1, pw, V - 0.1, 0.4, 0.43);
    B('cloth_white', 0.2, 0.2, 0.65, 0.65, 0.43, 0.52); B(cl, 0.8, 0.2, Math.max(0.9, pw - 0.2), 0.9, 0.43, 0.47);
    B('wood_dark', U - 0.9, 0.1, U - 0.1, 0.8, 0, 0.7, true); B('sacking', U - 1.5, 0.1, U - 0.95, 0.65, 0, 0.55);
    jar(U - 0.3, V - 0.3); jar(U - 0.75, V - 0.25, 1);
    B(['cloth_red', 'cloth_black', 'cloth_ochre'][(sd >> 4) % 3], U - 0.04, 0.3, U, 0.9, 0.9, 1.9);
  } else if (variant === 1) {
    // the weavers: a frame loom (posts, beams, the stretched warp, heddle frames, the cloth beam) with its bench, thread baskets, the finished cloths on the platform
    B('wood_ochre', 0.1, 0.1, 1.5, 1.3, 0, 0.4, true); B('reed_mat', 0.1, 0.1, 1.5, 1.3, 0.4, 0.43);
    B('cloth_indigo', 0.2, 0.2, 1.3, 0.6, 0.43, 0.5); B('cloth_red', 0.2, 0.62, 1.3, 1.0, 0.43, 0.49); B('cloth_ochre', 0.25, 0.25, 0.9, 0.55, 0.5, 0.55);
    for (const [a, b] of [[3.85, 0.2], [5.35, 0.2], [3.85, 1.15], [5.35, 1.15]]) B('wood_dark', a - 0.04, b - 0.04, a + 0.04, b + 0.04, 0, 1.5);
    for (const b of [0.2, 1.15]) B('wood_dark', 3.8, b - 0.04, 5.4, b + 0.04, 1.43, 1.5);
    B('wood_dark', 3.8, 0.2, 3.88, 1.15, 1.43, 1.5); B('wood_dark', 5.32, 0.2, 5.4, 1.15, 1.43, 1.5);
    B('cloth_ochre', 3.92, 0.24, 5.28, 1.1, 0.64, 0.655); B('cloth_white', 3.92, 0.24, 5.28, 0.6, 0.655, 0.665);
    B('cloth_red', 3.86, 1.1, 5.34, 1.22, 0.55, 0.66);
    for (const b of [0.62, 0.72]) { B('wood_painted', 3.95, b, 5.25, b + 0.03, 0.72, 0.78); B('wood_painted', 3.95, b, 5.25, b + 0.03, 1.15, 1.2); B('wood_painted', 3.95, b, 3.99, b + 0.03, 0.72, 1.2); B('wood_painted', 5.21, b, 5.25, b + 0.03, 0.72, 1.2); }
    B('wood_ochre', 4.3, 1.3, 5.0, 1.7, 0, 0.32); B('wood_dark', 4.35, 0.2, 4.45, 1.0, 0, 0.08); B('wood_dark', 4.75, 0.2, 4.85, 1.0, 0, 0.08);
    B('wood_dark', 3.8, 0.15, 5.4, 1.2, 0, 0.04); ctx.col.rect([...(() => { const p = P(3.8, 0.15), q = P(5.4, 1.2); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; })()], f, f + 1.5);
    for (const [lu, lv] of [[3.4, 0.3], [3.4, 1.9]]) L('wicker', [[0.001, 0], [0.2, 0.02], [0.24, 0.2], [0.2, 0.3]], lu, lv);
    B('cloth_indigo', 3.3, 0.2, 3.5, 0.4, 0.3, 0.38);
  } else if (variant === 2) {
    // the store: jars along the wall, sacks of rice piled, baskets hung from the tie-beams, the rice mortar with its two pestles
    for (let i = 0; i < 4; i++) L('terracotta', [[0.001, 0], [0.22, 0.02], [0.32, 0.3], [0.28, 0.6], [0.2, 0.72], [0.22, 0.76]], 0.4 + i * 0.7, 0.35);
    jar(0.5, 1.2); jar(1.2, 1.1, 1);
    for (const [a, b, h0] of [[3.8, 0.1, 0], [4.45, 0.1, 0], [5.1, 0.1, 0], [4.1, 0.1, 0.4], [4.75, 0.1, 0.4], [3.9, 0.75, 0], [4.55, 0.75, 0]]) B('sacking', a, b, a + 0.55, b + 0.6, h0, h0 + 0.4, h0 === 0);
    B('timber', 1.5, 1.6, 2.5, 2.1, 0, 0.38, false);
    Rd('timber', [1.7, 1.85, 0.4], [1.7, 1.85, 0.8], 0.04); Rd('timber', [2.3, 1.85, 0.4], [2.3, 1.85, 0.8], 0.04);
    Rd('timber', [5.5, 0.1, 0.05], [5.55, 0.1, 1.7], 0.04); Rd('timber', [5.35, 0.1, 0.05], [5.4, 0.1, 1.7], 0.04);
    for (const [lu, lv] of [[1.9, 0.9], [3.2, 0.8]]) { Rd('rope_fibre', [lu, lv, H - 0.22], [lu, lv, H - 0.62], 0.012); L('wicker', [[0.001, 0], [0.24, 0.0], [0.28, 0.16], [0.2, 0.34], [0.001, 0.34]], lu, lv, H - 0.96); }
  } else {
    // the elder's bed along the back wall: a broad bed with its mat and bolsters, four posts and a valance, a chest at the foot, an offering shelf with canang and a gebogan
    B('wood_ochre', 0.1, 0.1, 2.3, 1.4, 0, 0.45, true); B('reed_mat', 0.1, 0.1, 2.3, 1.4, 0.45, 0.48);
    B('cloth_white', 0.2, 0.2, 0.7, 0.6, 0.48, 0.58); B(cl, 0.9, 0.2, 2.2, 1.3, 0.48, 0.52);
    for (const [a, b] of [[0.1, 0.1], [2.3, 0.1], [0.1, 1.4], [2.3, 1.4]]) B('wood_painted', a - 0.04, b - 0.04, a + 0.04, b + 0.04, 0.45, 1.7);
    B('cloth_white', 0.06, 0.06, 2.34, 1.44, 1.5, 1.7);
    B('wood_dark', 2.5, 0.1, 3.2, 0.8, 0, 0.6, true);
    B('wood_dark', U - 2.2, 0, U - 0.1, 0.3, 0.55, 0.6);
    for (let i = 0; i < 3; i++) { const p = P(U - 1.9 + i * 0.5, 0.15); canang(ctx, p[0], f + 0.6, p[1], sd + i); }
    { const p = P(U - 0.5, 0.15); const rings = [['cloth_red', 0.2, 0.0], ['cloth_ochre', 0.17, 0.18], ['cloth_green', 0.14, 0.36], ['cloth_white', 0.08, 0.52]]; for (const [m, r, dy] of rings) ctx.bag.add(m, lathe([[0.001, 0.1 + dy], [r, 0.12 + dy], [r * 0.9, 0.28 + dy], [0.001, 0.3 + dy]], 8, null, p[0], f + 0.6, p[1])); }
    jar(U - 0.3, V - 0.3, 1);
  }
}
