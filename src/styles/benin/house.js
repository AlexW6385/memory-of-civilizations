// The Edo compound (docs/settlements/benin-city.md §5, §10): a gabled range on the street with its doorway open (no doors, Pinto), a
// passage to the court, ranges on three sides under lean-to roofs sloping to the impluvium, the back range higher with a verandah on
// posts; walls of red clay polished and ridged in bands, weathered; roofs of palm thatch (a chief's of shingle). Four fronts: plain,
// verandah on posts over the street, trading (the front room open behind a clay counter), chief's (an upper storey with windows,
// reached by a stair from the court). Furnished: beds of clay, stools, chests, hearth, mortar, pots, the ancestral altar.
import { fromTriangles, quad } from '../../core/geom.js';
import { frame } from '../greek/agora.js';
import { rng, wallMat, clayWall, gable, lean, pillar, box, lathe, rod } from './kit.js';
import { homeAltar, pot, pots, stool, bed, chest, hearth, mortar, rack, wash, wood, plantain, wear, claySeat, hung } from './props.js';

const toStreet = (F) => { const o = F.out; return o[1] !== 0 ? (o[1] > 0 ? 'zp' : 'zn') : (o[0] > 0 ? 'xp' : 'xn'); };

/** benin_house: { rect, front ('n' | 's': the street), seed, y, chief, kind ('plain' | 'porch' | 'trade' | 'chief'), du, simple (far) }. */
function house(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), rv = rng((el.seed || 1) * 7 + 3), y = el.y ?? 0, F = frame(el.rect, el.front ?? 's'), { L, D } = F, simple = el.simple;
  const chief = !!el.chief, kind = el.kind ?? (chief ? 'chief' : 'plain');
  const wm = wallMat(rand), roof = chief ? 'roof_bark' : 'thatch_palm', P = F.P, R = F.R;
  const H1 = chief ? 3.8 : 3.1, Y = 0.25, H2 = chief ? H1 + 2.9 : H1;
  const rr = (u0, v0, u1, v1) => R(u0, v0, u1, v1);
  const fd = 5.4, bd = 6.4, sw = 3.8, dw = 2.4, du = el.du ?? L * (0.3 + 0.4 * rand());
  const wall = (u0, v0, u1, v1, h, op = [], y0 = y + Y) => { const a = P(u0, v0), b = P(u1, v1); clayWall(ctx, a, b, 0.55, y0, y + h, wm, op.map((o) => ({ ...o })), !simple); };
  const worn = (u0, v0, u1, v1, ya, yb, seed) => { if (!simple) wear(ctx, P(u0, v0), P(u1, v1), 0.55, y + ya, y + yb, seed); };
  // the platform of beaten clay under all, the steps at the door
  bag.add('tuff_red', box(el.rect[0], y - 0.3, el.rect[1], el.rect[2], y + Y, el.rect[3])); col.floor(el.rect, y + Y);
  const wide = kind === 'trade' ? Math.min(L - 3, 6.4) : dw, dc = kind === 'trade' ? L / 2 : du + dw / 2;
  for (let i = 0; i < 2; i++) { const r = rr(dc - wide / 2 - 1.1 - i * 0.2, -0.5 - i * 0.45, dc + wide / 2 + 1.1 + i * 0.2, 0); bag.add('tuff_red', box(r[0], y - 0.3, r[1], r[2], y + 0.12, r[3])); col.floor(r, y + 0.12); }
  // the walls round the compound: the street front with the open doorway, the sides, the back
  const frontOp = [{ at: dc, w: wide, h: kind === 'trade' ? 2.3 : 2.5 }];
  wall(0, 0.3, L, 0.3, H1, frontOp);
  wall(0.3, 0, 0.3, D, H1); wall(L - 0.3, 0, L - 0.3, D, H1);
  wall(0, D - 0.3, L, D - 0.3, H1 + 0.6, [{ at: L * 0.5, w: 1.4, h: 2.3 }]);
  // the front range: the cross wall to the court with the passage, a gable of thatch along the street
  wall(0, fd, L, fd, H1, [{ at: du + dw / 2, w: dw, h: 2.5 }]);
  const fr = rr(0, 0, L, fd);
  bag.add('timber', box(fr[0], y + H1 - 0.1, fr[1], fr[2], y + H1, fr[3]));
  if (chief) {
    // the upper storey over the front range: walls with two windows on the street, the door to the stair on the court, the floor
    for (const u of [0.3, L - 0.3]) wall(u, 0, u, fd, H2, [], y + H1);
    wall(0, 0.3, L, 0.3, H1 + 0.9, [], y + H1);
    wall(0, 0.3, L, 0.3, H2, [{ at: L * 0.27, w: 0.85, h: 1.15 }, { at: L * 0.73, w: 0.85, h: 1.15 }], y + H1 + 0.9);
    wall(0, fd, L, fd, H2, [{ at: 8.5, w: 1.0, h: 2.1 }], y + H1);
    for (const f of [0.27, 0.73]) { const r = rr(L * f - 0.55, 0.0, L * f + 0.55, 0.1); bag.add('wood_dark', box(r[0], y + H1 + 2.05, r[1], r[2], y + H1 + 2.2, r[3])); bag.add('lattice', box(r[0] + 0.1, y + H1 + 1.0, rr(0, 0.25, 1, 0.3)[1] - 0.0, r[2] - 0.1, y + H1 + 2.05, rr(0, 0.25, 1, 0.3)[1] + 0.02)); }
    col.floor(rr(0.6, 0.6, L - 0.6, fd - 0.3), y + H1);
    gable(ctx, fr, y + H2, 2.6, roof, F.alongX ? 'x' : 'z', 0.7);
  } else gable(ctx, fr, y + H1, 2.9, roof, F.alongX ? 'x' : 'z', 0.55);
  // the side ranges (lean-to, sloping to the court) and the back range with its verandah
  const sideR = (u0, u1) => rr(u0, fd, u1, D - bd);
  const sidesLow = (side) => { const o = F.out; if (o[1] !== 0) return side === 0 ? 'xp' : 'xn'; return side === 0 ? 'zp' : 'zn'; };
  lean(ctx, sideR(0, sw), sidesLow(0), y + H1 - 0.7, y + H1 + 0.7, roof, 0.4, !simple);
  lean(ctx, sideR(L - sw, L), sidesLow(1), y + H1 - 0.7, y + H1 + 0.7, roof, 0.4, !simple);
  const back = rr(0, D - bd, L, D);
  lean(ctx, back, toStreet(F), y + H1 - 0.5, y + H1 + 1.4, roof, 0.4, !simple);
  // the posts of the verandahs on the court's edge (the chief's sheathed in brass)
  const posts = [], nb = Math.max(3, Math.round(L / 3.4));
  for (let i = 0; i <= nb; i++) posts.push([0.9 + i * (L - 1.8) / nb, D - bd + 0.3]);
  for (let v = fd + 1; v < D - bd - 1; v += 3.2) { posts.push([sw - 0.3, v], [L - sw + 0.3, v]); }
  for (const [u, v] of posts) {
    const [px, pz] = P(u, v);
    if (chief) pillar(ctx, px, pz, y + Y, H1 - 0.5, 0.18);
    else { bag.add('palm_trunk', lathe([[0.13, 0], [0.12, H1 - 0.5]], 6, null, px, y + Y, pz)); col.circle(px, pz, 0.14, y + Y, y + H1); }
  }
  // the court: an impluvium, a well-head, pots
  const cu = L / 2, cv = (fd + D - bd) / 2, iw = Math.min(3.0, (L - 2 * sw) * 0.4), id = Math.min(2.4, (D - bd - fd) * 0.4);
  if (iw > 1.2 && id > 1.2) {
    const out = rr(cu - iw / 2 - 0.35, cv - id / 2 - 0.35, cu + iw / 2 + 0.35, cv + id / 2 + 0.35), inn = rr(cu - iw / 2, cv - id / 2, cu + iw / 2, cv + id / 2);
    bag.add('stucco_red', box(out[0], y + Y, out[1], out[2], y + Y + 0.2, out[3]));
    bag.add('pottery_dark', box(inn[0], y + Y, inn[1], inn[2], y + Y + 0.21, inn[3]));
    const t = []; quad(t, [inn[0], y + Y + 0.22, inn[1]], [inn[0], y + Y + 0.22, inn[3]], [inn[2], y + Y + 0.22, inn[3]], [inn[2], y + Y + 0.22, inn[1]]);
    bag.add('water', fromTriangles(t));
  }
  if (simple) return;
  const Yf = y + Y;
  // ── weathering on the outer faces ──
  worn(0, 0.3, L, 0.3, Y, H1, (el.seed || 1) + 11);
  worn(0.3, 0, 0.3, D, Y, H1, (el.seed || 1) + 12); worn(L - 0.3, 0, L - 0.3, D, Y, H1, (el.seed || 1) + 13); worn(0, D - 0.3, L, D - 0.3, Y, H1 + 0.6, (el.seed || 1) + 14);
  // ── the street front: lintel, jambs, chalk bands and lozenges, grilles ──
  const fo = (u, v0, u1, v1) => rr(u, v0, u1, v1);
  { const r = fo(dc - wide / 2 - 0.35, -0.12, dc + wide / 2 + 0.35, 0.05); bag.add('wood_dark', box(r[0], Yf + frontOp[0].h, r[1], r[2], Yf + frontOp[0].h + 0.2, r[3])); }
  for (const s of [-1, 1]) { const u = dc + s * (wide / 2 + 0.12), r = fo(u - 0.1, -0.1, u + 0.1, 0.1); bag.add('kokowai', box(r[0], Yf, r[1], r[2], Yf + frontOp[0].h, r[3])); }
  const side = [[0.9, dc - wide / 2 - 0.5], [dc + wide / 2 + 0.5, L - 0.9]];
  for (const [a, b] of side) {
    if (b - a < 1.2) continue;
    for (const hh of [1.05, 1.2]) { const r = fo(a, -0.01, b, 0.01); bag.add('chalk', box(r[0], Yf + hh, r[1] - 0.012, r[2], Yf + hh + 0.08, r[3] + 0.012)); }
    const lo = rv() < 0.5;
    for (let u = a + 0.2; u < b - 0.2; u += 0.42) { const r = fo(u, -0.01, u + 0.16, 0.01); bag.add(lo ? 'chalk' : 'kokowai', box(r[0], Yf + 1.28, r[1] - 0.014, r[2], Yf + 1.44, r[3] + 0.014)); }
    // a grille of lattice set in the wall (the air of the room)
    const gu = (a + b) / 2, r = fo(gu - 0.34, -0.01, gu + 0.34, 0.01);
    bag.add('wood_dark', box(r[0] - 0.05, Yf + 1.8, r[1] - 0.03, r[2] + 0.05, Yf + 2.4, r[3] + 0.03)); bag.add('lattice', box(r[0], Yf + 1.85, r[1] - 0.045, r[2], Yf + 2.35, r[3] + 0.045));
  }
  // the ridge of the thatch: a pole with its two crossed ends
  { const ridgeA = P(0.2, fd / 2), ridgeB = P(L - 0.2, fd / 2), ry = y + H2 + (chief ? 2.6 : 2.9); bag.add('timber', rod([ridgeA[0], ry, ridgeA[1]], [ridgeB[0], ry, ridgeB[1]], 0.07, 5)); }
  // ── the front, by its kind ──
  if (kind === 'porch' || kind === 'trade') {
    // a verandah on palm posts 1.3 m over the street, a seat of clay under it, goods hung from its beam
    const po = rr(0.4, -1.4, L - 0.4, 0.3);
    lean(ctx, po, toStreet(F), y + 2.15, y + H1 - 0.15, 'thatch_palm', 0.15, true);
    const np = Math.max(3, Math.round((L - 0.8) / 3.2));
    for (let i = 0; i <= np; i++) { const u = 0.7 + i * (L - 1.4) / np; if (Math.abs(u - dc) < wide / 2 - 0.1 && kind !== 'trade') continue; const [px, pz] = P(u, -1.2); bag.add('palm_trunk', lathe([[0.1, 0], [0.09, 2.2]], 6, null, px, Yf - 0.1, pz)); col.circle(px, pz, 0.12, Yf, Yf + 2.2); }
    const bmA = P(0.5, -1.2), bmB = P(L - 0.5, -1.2); bag.add('wood_dark', rod([bmA[0], Yf + 2.2, bmA[1]], [bmB[0], Yf + 2.2, bmB[1]], 0.09, 5));
    { const f = rr(0.4, -1.5, L - 0.4, -1.3); bag.add('tuff_red', box(f[0], y - 0.3, f[1], f[2], y + 0.12, f[3])); }
    col.floor(rr(0.4, -1.5, L - 0.4, 0), y + 0.12);
    for (const [a, b] of side) if (b - a > 2.2) claySeat(ctx, rr(a + 0.3, -0.75, Math.min(b - 0.3, a + 3.6), -0.3), y + 0.12, Math.floor(rv() * 1e3));
    if (kind === 'porch') for (const [a, b] of side) if (b - a > 2) { const m = P((a + b) / 2, -1.2); hung(ctx, m[0], Yf + 2.1, m[1], F.along, 3, (el.seed || 1) + Math.floor(a), 0.8); }
  }
  if (kind === 'trade') {
    // the counter across the opening, goods on it, shelves behind
    const cr = rr(dc - wide / 2, 0.55, dc + wide / 2, 1.2);
    bag.add('stucco_red', box(cr[0], Yf, cr[1], cr[2], Yf + 1.0, cr[3])); col.rect(cr, Yf, Yf + 1.0);
    bag.add('timber', box(cr[0] - 0.05, Yf + 1.0, cr[1] - 0.05, cr[2] + 0.05, Yf + 1.06, cr[3] + 0.05));
    const goods = ['pots', 'yam', 'cloth', 'pepper'][Math.floor(rv() * 4)];
    for (let i = 0; i < 7; i++) {
      const [gx, gz] = P(dc - wide / 2 + 0.4 + i * (wide - 0.8) / 6, 0.88);
      if (goods === 'pots') pot(ctx, gx, Yf + 1.06, gz, 0.14, 0.26, i % 2 ? 'pottery_dark' : 'terracotta');
      else if (goods === 'yam') bag.add('tuff_red', rod([gx - 0.18, Yf + 1.12, gz], [gx + 0.18, Yf + 1.2, gz], 0.08, 5));
      else if (goods === 'cloth') bag.add(['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_blue', 'cloth_maroon'][i], box(gx - 0.18, Yf + 1.06, gz - 0.2, gx + 0.18, Yf + 1.2 + (i % 3) * 0.05, gz + 0.2));
      else bag.add('wall_red', lathe([[0.2, Yf + 1.06], [0.12, Yf + 1.2], [0.001, Yf + 1.3]], 7, null, gx, 0, gz));
    }
    const sh = (u0, u1) => { const r = rr(u0, 3.8, u1, 4.3); bag.add('timber', box(r[0], Yf + 1.2, r[1], r[2], Yf + 1.26, r[3])); bag.add('timber', box(r[0], Yf + 1.9, r[1], r[2], Yf + 1.96, r[3])); };
    sh(0.7, Math.min(dc - wide / 2, 3.5)); if (L - 0.7 > dc + wide / 2) sh(dc + wide / 2, L - 0.7);
  }
  // ── the room behind the street front, by its kind: beds, stools, chests, a hearth, pots, calabashes, mats, cloth on pegs ──
  {
    const lw = du - 0.9, rw = L - (du + dw) - 0.9;           // the room's free width left and right of the passage
    const big = lw >= rw, u0 = big ? 0.9 : du + dw + 0.3, uw = big ? lw : rw;
    if (kind !== 'trade' && uw > 2.0) {
      bed(ctx, rr(u0, fd - 1.5, u0 + Math.min(2.4, uw - 0.2), fd - 0.65), Yf, (el.seed || 1) + 5);
      const [sx, sz] = P(u0 + uw * 0.55, 2.2); stool(ctx, sx, Yf, sz);
      const [cx, cz] = P(u0 + 0.5, 1.0); chest(ctx, cx, Yf, cz, 0.85, 0.5);
    } else if (uw > 1.2) { const [cx, cz] = P(u0 + 0.5, fd - 0.9); chest(ctx, cx, Yf, cz, 0.85, 0.5); }
    // the other side: the hearth and the mortar, pots
    const o0 = big ? du + dw + 0.3 : 0.9, ow = big ? rw : lw;
    if (ow > 1.6) {
      const [hx, hz] = P(o0 + ow / 2, 2.3); hearth(ctx, hx, Yf, hz, (el.seed || 1) + 6);
      ctx.lights?.push({ at: [hx, Yf + 0.15, hz], color: '#ff9c52', intensity: 2.4, distance: 7 });                // the hearth's fire lights the room
      const [a1, a2] = P(o0 + 0.5, fd - 0.8); pots(ctx, a1, Yf, a2, (el.seed || 1) + 7, 3);
    }
    // calabashes on a shelf and cloth on pegs on the room's side wall
    { const r = rr(0.62, 1.2, 0.95, fd - 1.2); bag.add('timber', box(r[0], Yf + 1.55, r[1], r[2], Yf + 1.6, r[3])); for (let k = 0; k < 4; k++) { const [qx, qz] = P(0.8, 1.7 + k * 0.7); bag.add('wicker', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.13], [0.11, 0.16], [0.001, 0.14]], 7, null, qx, Yf + 1.6, qz)); } }
    for (let k = 0; k < 3; k++) { const [qx, qz] = P(L - 0.7, 1.5 + k * 1.1); const c = ['cloth_indigo', 'cloth_ochre', 'cloth_red'][k]; bag.add(c, box(qx - 0.04, Yf + 1.4, qz - 0.2, qx + 0.04, Yf + 2.3, qz + 0.2)); }
  }
  // ── the court and the back range: the shrine, the kitchen, drying racks, the yam mortar, firewood, washing, a plantain ──
  {
    const bz = D - bd, cvd = fd + 1.0;
    // the ancestral altar on the back range, against the back wall, facing the court: mud rectangle, rattle staffs, the bell
    const au = L * 0.22, ar = rr(au - 1.1, D - 1.6, au + 1.1, D - 0.7);
    homeAltar(ctx, ar, el.front === 'n' ? 'n' : 's', (el.seed || 1) % 997, chief, Yf);
    // the kitchen in the back range: a hearth with pots beside the door, a bed, a stool
    const ku = L * 0.7; { const [x, z] = P(ku, bz + 2.4); hearth(ctx, x, Yf, z, (el.seed || 1) + 9); if (kind === 'trade') ctx.lights?.push({ at: [x, Yf + 0.15, z], color: '#ff9c52', intensity: 2.2, distance: 7 }); }
    const [k1, k2] = P(ku + 1.4, bz + 3.2); pots(ctx, k1, Yf, k2, (el.seed || 1) + 10, 4);
    const [m1, m2] = P(ku - 1.4, bz + 1.4); stool(ctx, m1, Yf, m2);
    const [w1, w2] = P(L - 1.4, D - 1.0); wood(ctx, w1, Yf, w2, F.along, 1.5, (el.seed || 1) + 15);
    // the court: the mortar, a drying rack, washing between posts, a plantain clump in the corner
    const [mx, mz] = P(sw + 0.8, bz - 2.2); mortar(ctx, mx, Yf, mz, (el.seed || 1) + 16);
    const [rx, rz] = P(L - sw - 1.2, cvd + 1.2); rack(ctx, rx, rz, Yf, F.along, 2.0, (el.seed || 1) + 17, ['pepper', 'cassava', 'cloth'][(el.seed || 0) % 3]);
    if (L > 17) wash(ctx, P(sw + 0.4, bz - 0.7), P(Math.min(L - sw - 0.4, sw + 6), bz - 0.7), Yf, (el.seed || 1) + 18, 4);
    const [px, pz] = P(L - 1.3, fd + 1.2); plantain(ctx, px, Yf, pz, (el.seed || 1) + 19, 3);
    // the pots at the corners of the court (those of the engine's life pass stand at the street door)
    const [qx, qz] = P(sw + 1.4, fd + 1.5); void qx; void qz;
    const [q1, q2] = P(L - sw - 1.2, fd + 1.4); pot(ctx, q1, Yf, q2, 0.32, 0.68, 'terracotta', true);
  }
  // ── the chief's upper room: the stair on the court, the bed, chests, a tusk pair on the wall ──
  if (chief) {
    const u0 = sw + 0.4, nr = 15, tr = 0.25, rise = (H1 - Y) / nr;
    for (let k = 0; k < nr; k++) { const r = rr(u0 + k * tr, fd + 0.28, u0 + (k + 1) * tr, fd + 1.2); bag.add('tuff_red', box(r[0], y - 0.1, r[1], r[2], Yf + (k + 1) * rise, r[3])); }
    col.ramp(rr(u0, fd + 0.28, u0 + nr * tr, fd + 1.2), Yf, y + H1, 'e');
    const lr = rr(u0 + nr * tr, fd + 0.28, 9.2, fd + 1.2); bag.add('tuff_red', box(lr[0], y - 0.1, lr[1], lr[2], y + H1, lr[3])); col.floor(lr, y + H1);
    const U = y + H1;
    bed(ctx, rr(0.9, 0.9, 2.2, 3.3), U, (el.seed || 1) + 21);
    for (const v of [1.1, 2.0]) { const [x, z] = P(L - 1.2, v); chest(ctx, x, U, z, 0.9, 0.5); }
    { const [x, z] = P(L * 0.5, 1.8); stool(ctx, x, U, z); const [x2, z2] = P(L * 0.5 + 0.8, 2.2); stool(ctx, x2, U, z2); }
    for (const s of [-1, 1]) { const a = P(L * 0.5 + s * 0.6, fd - 0.4); bag.add('ivory', rod([a[0], U + 1.0, a[1]], [a[0] + s * 0.1, U + 2.3, a[1] - (F.out[1] || 0) * 0.15], 0.05, 6)); }
  }
}
export const HOUSES = { benin_house: house };
