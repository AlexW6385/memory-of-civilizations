// The Siamese style of Ayutthaya (docs/settlements/ayutthaya.md §4–§6): the bell-shaped chedi on its tiers of pedestals with a porch and
// a small chedi on each side, a ringed spire and a gilded finial; the wihan and ubosot, halls on a plinth with colonnaded aisles under
// stepped roofs of terracotta tile, gables of red and gold, the horns (chofa) at the ridge ends, a seated gilded Buddha on its dais; the
// mandapa, the cross-shaped prasat with its prang, the bell tower, the cloister; the brick bridge with its corbelled arch, the hurdle
// bridge; the canal's brick bank, the landing stage; the boats of the river and the floating house on its raft. The Khmer stilt house,
// granary, sala and sugar palm (the `khmer` style, read-only) serve for the houses of the town.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles, orientOutward, place } from '../../core/geom.js';
import '../khmer/index.js';

import { hull } from '../ptolemaic/harbour.js';
import { wallSeg } from '../ptolemaic/util.js';

const kh = STYLES.khmer;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const YAW = { n: 0, e: -Math.PI / 2, s: Math.PI, w: Math.PI / 2 };
const norm = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];

/** A closed gable prism: eave rectangle [x0, z0, x1, z1] at y, ridge along x (axis 'x') or z, rising `rise`, hung over by `over`. */
function gable(bag, mat, rect, y, rise, over, axis = 'x', th = 0.22) {
  const [x0, z0, x1, z1] = norm(rect), A = axis === 'x';
  const u0 = (A ? x0 : z0) - over, u1 = (A ? x1 : z1) + over, v0 = (A ? z0 : x0) - over, v1 = (A ? z1 : x1) + over, vm = (v0 + v1) / 2;
  const P = (u, v, h) => (A ? [u, y + h, v] : [v, y + h, u]);
  const T = [], quad = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
  // top slopes and underside (a thin slab of thickness th), both ends closed
  quad(P(u0, v0, 0), P(u1, v0, 0), P(u1, vm, rise), P(u0, vm, rise));
  quad(P(u0, vm, rise), P(u1, vm, rise), P(u1, v1, 0), P(u0, v1, 0));
  quad(P(u0, vm, rise - th), P(u1, vm, rise - th), P(u1, v0, -th), P(u0, v0, -th));
  quad(P(u0, v1, -th), P(u1, v1, -th), P(u1, vm, rise - th), P(u0, vm, rise - th));
  for (const u of [u0, u1]) { quad(P(u, v0, 0), P(u, vm, rise), P(u, vm, rise - th), P(u, v0, -th)); quad(P(u, vm, rise), P(u, v1, 0), P(u, v1, -th), P(u, vm, rise - th)); }
  quad(P(u0, v0, -th), P(u1, v0, -th), P(u1, v1, -th), P(u0, v1, -th));
  bag.add(mat, fromTriangles(orientOutward(T)));
}
/** The triangular gable board (the end of a stepped roof) — red, with gilded bargeboards — standing at u on its eave rectangle. */
function gableEnd(bag, rect, y, rise, over, axis, atEnd) {
  const [x0, z0, x1, z1] = norm(rect), A = axis === 'x';
  const u = A ? (atEnd > 0 ? x1 + over : x0 - over) : (atEnd > 0 ? z1 + over : z0 - over);
  const v0 = (A ? z0 : x0) - over, v1 = (A ? z1 : x1) + over, vm = (v0 + v1) / 2, dir = atEnd > 0 ? 1 : -1;
  const P = (uu, v, h) => (A ? [uu, y + h, v] : [v, y + h, uu]);
  const T = [], tri = (a, b, c) => T.push(...a, ...b, ...c);
  tri(P(u + dir * 0.02, v0, 0), P(u + dir * 0.02, vm, rise), P(u + dir * 0.02, v1, 0));
  const g = fromTriangles(orientOutwardFace(T, dir, A));
  bag.add('timber_red', g);
  // the gilded bargeboards along the two slopes, and the horns (chofa) at the ridge's end and the eave corners
  for (const s of [-1, 1]) {
    const a = P(u + dir * 0.05, vm + s * (v1 - vm) , 0), b = P(u + dir * 0.05, vm, rise);
    bag.add('clay_gilt', rod(a, b, 0.09, 5));
    const c = P(u + dir * 0.05, vm + s * (v1 - vm), 0), h1 = P(u + dir * 0.05, vm + s * (v1 - vm) + s * 0.35, 0.55);
    bag.add('clay_gilt', rod(c, h1, 0.07, 4));
  }
  const top = P(u + dir * 0.05, vm, rise), tip = P(u + dir * 0.05 + dir * 0.3, vm, rise + 1.1);
  bag.add('clay_gilt', rod(top, tip, 0.1, 5));
}
function orientOutwardFace(T, dir, A) {
  // make the board face outward along the ridge axis
  const out = [];
  for (let i = 0; i < T.length; i += 9) {
    const a = T.slice(i, i + 3), b = T.slice(i + 3, i + 6), c = T.slice(i + 6, i + 9);
    const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const along = A ? n[0] : n[2];
    out.push(...(along * dir >= 0 ? [...a, ...b, ...c] : [...a, ...c, ...b]));
  }
  return out;
}
const post = (bag, col, x, z, y0, y1, r = 0.22, mat = 'timber_red') => { bag.add(mat, lathe([[r * 1.25, 0], [r, 0.2], [r * 0.92, y1 - y0 - 0.2], [r * 1.1, y1 - y0]], 8, null, x, y0, z)); col.circle(x, z, r + 0.05, y0, y1); };
const wall = (ctx, a, b, th, y0, y1, mat, ops) => wallSeg(ctx, a, b, th, y0, y1, mat, ops);

// ── the chedi ─────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * chedi: { c, y, w (the pedestal's width), h (the height to the finial) } — three tiers of square pedestal with mouldings, on each side a
 * porch with a niche and a small chedi on its roof; two round tiers; the bell with its ring mouldings; the harmika; the spire of rings,
 * the lotus bud and the finial (gilded). Lime plaster, whitewashed.
 */
function chedi(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = el.w ?? 14, H = el.h ?? 36, k = w / 14, v = H / 36, a = w / 2, M = 'plaster_white';
  const tiers = [[a, 0, 1.7 * v], [a * 0.86, 1.7 * v, 3.2 * v], [a * 0.72, 3.2 * v, 4.5 * v]];
  for (const [r, y0, y1] of tiers) {
    bag.add(M, box(cx - r, y + y0, cz - r, cx + r, y + y1 - 0.25 * v, cz + r));
    bag.add('plaster_white', box(cx - r - 0.18 * k, y + y1 - 0.25 * v, cz - r - 0.18 * k, cx + r + 0.18 * k, y + y1, cz + r + 0.18 * k));
    bag.add('lime_plaster', box(cx - r - 0.1 * k, y + y0, cz - r - 0.1 * k, cx + r + 0.1 * k, y + y0 + 0.28 * v, cz + r + 0.1 * k));
  }
  col.rect([cx - a - 0.2, cz - a - 0.2, cx + a + 0.2, cz + a + 0.2], y, y + 4.5 * v);
  // the porches (four, to the quarters) with a niche holding a standing image, a small chedi above
  if (!el.mini && w > 3) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const px = cx + dx * (a + 0.9 * k), pz = cz + dz * (a + 0.9 * k), hw = 1.7 * k, hd = 1.1 * k;
    const r = dx ? [px - hd, pz - hw, px + hd, pz + hw] : [px - hw, pz - hd, px + hw, pz + hd];
    bag.add(M, box(r[0], y, r[1], r[2], y + 2.6 * v, r[3]));
    bag.add('lime_plaster', box(r[0] - 0.12, y + 2.6 * v, r[1] - 0.12, r[2] + 0.12, y + 2.85 * v, r[3] + 0.12));
    bag.add('opening', dx ? box(px + dx * hd - (dx > 0 ? 0.05 : -0.01) - 0.02, y + 0.5 * v, pz - 0.55 * k, px + dx * hd + (dx > 0 ? 0.02 : -0.05), y + 2.0 * v, pz + 0.55 * k) : box(px - 0.55 * k, y + 0.5 * v, pz + dz * hd - (dz > 0 ? 0.05 : -0.01) - 0.02, px + 0.55 * k, y + 2.0 * v, pz + dz * hd + (dz > 0 ? 0.02 : -0.05)));
    bag.add('gold', lathe([[0.001, 0], [0.22 * k, 0.05], [0.2 * k, 0.6 * v], [0.14 * k, 1.0 * v], [0.16 * k, 1.2 * v], [0.001, 1.4 * v]], 8, null, px + dx * (hd - 0.12), y + 0.55 * v, pz + dz * (hd - 0.12)));   // the standing image, small and gilded
    col.rect(r, y, y + 2.85 * v);
    chedi({ c: [px, pz], y: y + 2.85 * v, w: 1.9 * k, h: 5.2 * v, mini: true }, { bag, col: { rect() {}, circle() {} } });
  }
  const y0 = y + 4.5 * v, r0 = a * 0.62;
  // the round tiers and the bell
  const prof = [[r0, 0], [r0, 0.25], [r0 * 0.93, 0.3], [r0 * 0.93, 0.62], [r0 * 0.84, 0.7], [r0 * 0.84, 1.0], [r0 * 0.74, 1.08], [r0 * 0.74, 1.35]].map(([r, h]) => [r, h * v]);
  bag.add(M, lathe(prof, 20, null, cx, y0, cz));
  const bb = y0 + 1.35 * v, br = r0 * 0.74;
  const bell = [], N = 14;
  for (let i = 0; i <= N; i++) { const t = i / N; bell.push([br * (1.02 + 0.2 * Math.sin(Math.min(1, t * 2.2) * Math.PI / 2) - 0.78 * Math.pow(t, 1.55)) , t * 8.6 * v]); }
  bag.add(M, lathe(bell, 24, null, cx, bb, cz));
  // the ring mouldings round the bell's shoulder and neck
  for (const t of [0.34, 0.5, 0.78]) { const r = bell[Math.round(t * N)][0], hh = t * 8.6 * v; bag.add('lime_plaster', lathe([[r * 0.98, -0.12 * v], [r * 1.07, -0.04 * v], [r * 1.07, 0.1 * v], [r * 0.98, 0.16 * v]], 24, null, cx, bb + hh, cz)); }
  const topR = bell[N][0], yh = bb + 8.6 * v;
  // the harmika: a square box with pillars (sao han) round the neck, its gilded cornice
  bag.add(M, box(cx - topR * 1.15, yh, cz - topR * 1.15, cx + topR * 1.15, yh + 1.7 * v, cz + topR * 1.15));
  bag.add('gold', box(cx - topR * 1.25, yh + 1.7 * v, cz - topR * 1.25, cx + topR * 1.25, yh + 1.95 * v, cz + topR * 1.25));
  // the spire: rings of diminishing size, the lotus bud, the finial
  const sp = [], rings = 22, sh = H - (yh + 1.95 * v - y) - 3.2 * v, s0 = yh + 1.95 * v;
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, r = topR * 0.78 * Math.pow(1 - t, 0.9) + 0.07 * k, yy = t * sh;
    sp.push([r * 1.0, yy], [r * 1.0, yy + sh / rings * 0.35], [r * 1.18, yy + sh / rings * 0.45], [r * 1.18, yy + sh / rings * 0.7], [r * 0.9, yy + sh / rings * 0.82]);
  }
  bag.add(M, lathe(sp, 12, null, cx, s0, cz));
  const sb = s0 + sh;
  bag.add('gold', lathe([[0.001, 0], [0.38 * k, 0.1 * v], [0.5 * k, 0.5 * v], [0.38 * k, 1.1 * v], [0.2 * k, 1.8 * v], [0.1 * k, 2.4 * v], [0.07 * k, 2.9 * v], [0.001, 3.2 * v]], 10, null, cx, sb, cz));
}
// ── the Buddha on his dais ────────────────────────────────────────────────────────────────────────────────────────
/** buddha: { at, y, h (figure and throne), face ('n'|'e'|'s'|'w') } seated, the legs crossed, the right hand to the earth (Subduing Mara); all gilded. */
function buddha(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h ?? 6, s = H / 6, yaw = YAW[el.face ?? 'e'], mat = el.mat ?? 'gold', parts = [];
  const L = (g) => parts.push(g);
  // the throne: a lotus plinth in three stepped, moulded tiers (the base), then the cushion
  L(lathe([[1.75, 0], [1.75, 0.22], [1.55, 0.3], [1.55, 0.55], [1.7, 0.65], [1.7, 0.85], [1.4, 0.95], [1.4, 1.15]], 14));
  // the legs crossed: a wide low oval; the body; the shoulders; the neck; the head with its ushnisha flame
  L(lathe([[0.001, 1.15], [1.45, 1.2], [1.6, 1.5], [1.35, 1.8], [0.9, 1.95], [0.001, 1.95]], 16, (t, i, r) => 1).scale(1, 1, 0.9));
  L(lathe([[0.001, 1.9], [0.95, 2.0], [0.85, 2.7], [0.72, 3.6], [0.6, 4.2], [0.001, 4.2]], 14).scale(1, 1, 0.62));
  L(lathe([[0.001, 3.7], [0.82, 3.85], [0.9, 4.1], [0.5, 4.35], [0.001, 4.4]], 12).scale(1.4, 1, 0.62));
  L(lathe([[0.22, 4.3], [0.2, 4.75]], 8));
  L(lathe([[0.001, 4.7], [0.4, 4.75], [0.46, 5.05], [0.4, 5.3], [0.2, 5.5], [0.001, 5.55]], 14).scale(1, 1, 1.0));
  L(lathe([[0.2, 5.5], [0.17, 5.75], [0.1, 6.0], [0.045, 6.0 + 0.45], [0.001, 6.0 + 0.55]], 8));       // the ushnisha and its flame
  // the arms: the left hand in the lap, the right over the right knee reaching to the earth
  L(rod([-0.78, 3.7, 0.05], [-0.95, 2.55, -0.2], 0.17, 6)); L(rod([-0.95, 2.55, -0.2], [-0.35, 2.0, -0.62], 0.15, 6));
  L(rod([0.78, 3.7, 0.05], [1.05, 2.7, -0.35], 0.17, 6)); L(rod([1.05, 2.7, -0.35], [1.3, 1.75, -0.95], 0.14, 6));
  for (const g of parts) { g.scale(s, s, s); place(g, x, y, z, yaw); bag.add(mat, g); }
  void col;
  col.circle(x, z, 1.9 * s, y, y + H);
}
// ── halls ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * wihan: { rect (the plinth's edge), front ('e'|'w'), y, seed, image (a gilded Buddha at the back), throne (the king's seat instead),
 * open (an open hall: columns only), cella (half the width) } — the long hall on a plinth: the cella of brick walls with slits and a
 * door at the front, the aisles' colonnade of red posts, the aisles' lean-to roof, the main roof above on the clerestory, a lower
 * porch roof at the front, the horns at the ridge ends; inside the posts of the ceiling and the dais.
 */
function wihan(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = norm(el.rect), y = el.y ?? 0, east = (el.front ?? 'e') === 'e', rand = rng(el.seed ?? 1);
  const pl = el.plinth ?? 1.2, f = y + pl, W = z1 - z0, aisle = el.aisle ?? 2.8, cz0 = z0 + aisle, cz1 = z1 - aisle, wallH = el.wallH ?? 8.2, eave = el.eave ?? 4.3;
  const porch = el.porch ?? 4.6, back = 3.2, fx = east ? x1 : x0;
  const cx0 = east ? x0 + back : x0 + porch, cx1 = east ? x1 - porch : x1 - back;
  // the plinth: two moulded courses with its coping, the steps at the front and a stair at the back
  bag.add('brick_baked', box(x0 - 1.0, y, z0 - 1.0, x1 + 1.0, y + pl - 0.2, z1 + 1.0));
  bag.add('lime_plaster', box(x0 - 1.15, y + pl - 0.2, z0 - 1.15, x1 + 1.15, y + pl, z1 + 1.15));
  col.rect([x0 - 1.15, z0 - 1.15, x1 + 1.15, z1 + 1.15], y, y + pl);
  col.floor([x0 - 1.0, z0 - 1.0, x1 + 1.0, z1 + 1.0], f);
  const stairs = (rect, dir) => { const [a, b, c, d] = rect, n = Math.round(pl / 0.2); for (let i = 0; i < n; i++) { const t = (i + 1) / n; const r = dir === 'e' ? [a, b, a + (c - a) * (1 - (i) / n), d] : dir === 'w' ? [c - (c - a) * (1 - i / n), b, c, d] : [a, b, c, d]; bag.add('lime_plaster', box(...[r[0], y, r[1], r[2], y + pl * t, r[3]])); } col.ramp(rect, y, f, dir === 'e' ? 'w' : 'e'); };
  void stairs;
  const sx0 = east ? x1 + 1.15 : x0 - 3.35, sx1 = east ? x1 + 3.35 : x0 - 1.15, sz = (z0 + z1) / 2;
  { const n = 6; for (let i = 0; i < n; i++) { const t = (i + 1) / n, r = east ? [sx0 + (sx1 - sx0) * i / n, sz - 2.2, sx1, sz + 2.2] : [sx0, sz - 2.2, sx1 - (sx1 - sx0) * i / n, sz + 2.2]; bag.add('lime_plaster', box(r[0], y, r[1], r[2], y + pl * (1 - 0 * t) * (1 - (n - 1 - i) / n * 0 ) * ((n - i) / n), r[3])); } col.ramp([sx0, sz - 2.2, sx1, sz + 2.2], y, f, east ? 'w' : 'e'); }
  // the cella's walls, with slits; the front wall with its great door; the back wall solid
  const slit = (len) => { const ops = []; for (let t = 2.2; t < len - 1.5; t += 3.0) ops.push({ at: t, w: 0.28, h: 2.4, y0: f + 3.4 }); return ops; };
  const nz0 = [cx0, cz0], nz1 = [cx1, cz0], sz0 = [cx0, cz1], sz1 = [cx1, cz1];
  if (!el.open) {
    wall(ctx, nz0, nz1, 0.9, f, f + wallH, 'plaster_white', slit(cx1 - cx0)); wall(ctx, sz0, sz1, 0.9, f, f + wallH, 'plaster_white', slit(cx1 - cx0));
    const door = [{ at: (cz1 - cz0) / 2, w: 3.2, h: 4.6 }];
    const fa = east ? [cx1, cz0] : [cx0, cz0], fb = east ? [cx1, cz1] : [cx0, cz1], ba = east ? [cx0, cz0] : [cx1, cz0], bb = east ? [cx0, cz1] : [cx1, cz1];
    wall(ctx, fa, fb, 0.9, f, f + wallH, 'plaster_white', door); wall(ctx, ba, bb, 0.9, f, f + wallH, 'plaster_white', []);
    // the door's frame of red and gold
    const dx = east ? cx1 : cx0, dz = (cz0 + cz1) / 2;
    bag.add('timber_red', box(dx - 0.55, f + 4.6, dz - 1.9, dx + 0.55, f + 4.95, dz + 1.9));
    bag.add('clay_gilt', box(dx - 0.6, f + 4.95, dz - 1.95, dx + 0.6, f + 5.1, dz + 1.95));
  } else {
    for (const zz of [cz0, cz1]) for (let xx = cx0 + 1; xx < cx1; xx += 4.6) post(bag, col, xx, zz, f, f + wallH, 0.26);
  }
  // the colonnade of the aisles (red posts at the outer edge) and the clerestory's posts inside
  const nPost = Math.max(2, Math.round((x1 - x0) / 4.6));
  for (let i = 0; i <= nPost; i++) for (const zz of [z0 + 0.7, z1 - 0.7]) post(bag, col, x0 + 0.7 + (x1 - x0 - 1.4) * i / nPost, zz, f, f + eave, 0.24);
  if (!el.open) {
    const ix0 = cx0 + 1.0, ix1 = cx1 - 1.0, nI = Math.max(1, Math.round((ix1 - ix0) / 4.6));
    for (let i = 0; i <= nI; i++) for (const zz of [(cz0 + cz1) / 2 - 3.0, (cz0 + cz1) / 2 + 3.0]) post(bag, col, ix0 + (ix1 - ix0) * i / nI, zz, f, f + wallH, 0.3);
  }
  // beams across the aisles, the ceiling: red, with gold stars (ceiling_painted)
  bag.add('ceiling_painted', box(cx0, f + wallH - 0.2, cz0, cx1, f + wallH, cz1));
  bag.add('timber_red', box(x0 - 0.2, f + eave - 0.4, z0 + 0.45, x1 + 0.2, f + eave, z0 + 0.95)); bag.add('timber_red', box(x0 - 0.2, f + eave - 0.4, z1 - 0.95, x1 + 0.2, f + eave, z1 - 0.45));
  // the roofs: the aisles' lean-tos (two slopes rising to the wall), the main gable, the porch's gable
  const lean = (za, zb, up) => {
    const T = [], q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d), a = x0 - 0.9, b = x1 + 0.9, lo = f + eave, hi = f + wallH - 0.3, o = 1.1;
    const zl = za, zh = zb; void up;
    q([a, lo - 0.4, zl - o], [b, lo - 0.4, zl - o], [b, hi, zh], [a, hi, zh]); q([a, lo - 0.2, zl - o], [a, hi + 0.15, zh], [b, hi + 0.15, zh], [b, lo - 0.2, zl - o]);
    q([a, lo - 0.4, zl - o], [a, hi, zh], [a, hi + 0.15, zh], [a, lo - 0.2, zl - o]); q([b, lo - 0.4, zl - o], [b, lo - 0.2, zl - o], [b, hi + 0.15, zh], [b, hi, zh]);
    bag.add('roof_tile', fromTriangles(orientOutward(T)));
  };
  lean(z0, cz0, 1); lean(z1 + 0, cz1, -1);
  const mainRect = [cx0 - 0.6, cz0 - 0.5, cx1 + 0.6, cz1 + 0.5], rise = (cz1 - cz0) * 0.5 * 0.62;
  gable(bag, 'roof_tile', mainRect, f + wallH, rise, 1.5, 'x');
  bag.add('clay_gilt', box(mainRect[0] - 1.4, f + wallH + rise - 0.05, (cz0 + cz1) / 2 - 0.12, mainRect[2] + 1.4, f + wallH + rise + 0.16, (cz0 + cz1) / 2 + 0.12));
  gableEnd(bag, mainRect, f + wallH, rise, 1.5, 'x', 1); gableEnd(bag, mainRect, f + wallH, rise, 1.5, 'x', -1);
  // the porch: a lower gable over the front, on the posts
  const pr = east ? [cx1 - 0.4, z0 + 0.4, x1 + 0.2, z1 - 0.4] : [x0 - 0.2, z0 + 0.4, cx0 + 0.4, z1 - 0.4];
  gable(bag, 'roof_tile', pr, f + eave + 0.3, 2.4, 1.0, 'x');
  gableEnd(bag, pr, f + eave + 0.3, 2.4, 1.0, 'x', east ? 1 : -1);
  // the rear porch's lower roof, closing the back
  void W;
  // inside: the dais with the image, or the throne
  const dxm = east ? cx0 + 2.4 : cx1 - 2.4, dzm = (cz0 + cz1) / 2;
  if (!el.open && (el.image || el.throne)) {
    const dl = el.image ? 8 : 4;
    const dr = [dxm - 2.2, dzm - dl / 2, dxm + 2.2, dzm + dl / 2];
    bag.add('lime_plaster', box(dr[0] - 0.2, f, dr[1] - 0.2, dr[2] + 0.2, f + 0.5, dr[3] + 0.2)); bag.add('timber_red', box(dr[0], f + 0.5, dr[1], dr[2], f + 1.0, dr[3])); bag.add('clay_gilt', box(dr[0] - 0.1, f + 1.0, dr[1] - 0.1, dr[2] + 0.1, f + 1.15, dr[3] + 0.1));
    col.rect(dr, f, f + 1.15);
    if (el.image) buddha({ at: [dxm, dzm], y: f + 1.15, h: el.imageH ?? 6.4, face: east ? 'e' : 'w' }, ctx);
    else { bag.add('clay_gilt', box(dxm - 0.8, f + 1.15, dzm - 0.9, dxm + 0.8, f + 1.6, dzm + 0.9)); bag.add('timber_red', box(dxm + (east ? -0.9 : 0.6), f + 1.6, dzm - 1.0, dxm + (east ? -0.6 : 0.9), f + 3.6, dzm + 1.0)); }
  }
  // the floor inside: cotto; offerings and lamps
  bag.add('cotto_floor', box(cx0, f - 0.02, cz0, cx1, f + 0.02, cz1));
  const lights = ctx.lights;
  if (lights && !el.open) for (const t of [0.25, 0.6]) lights.push({ at: [cx0 + (cx1 - cx0) * (east ? t : 1 - t) + 0.01, f + 4.2, dzm], color: '#ffb860', intensity: 8, distance: 14 });
  // the apron's drum of the bell and the offering stands along the front are left to the town's furnishing
  void rand;
}
/** mandapa: a small square hall on the platform with its stepped, tiered spire — { c, y, w }. */
function mandapa(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, a = (el.w ?? 6) / 2;
  bag.add('plaster_white', box(cx - a, y, cz - a, cx + a, y + 0.9, cz + a)); bag.add('lime_plaster', box(cx - a - 0.12, y + 0.9, cz - a - 0.12, cx + a + 0.12, y + 1.05, cz + a + 0.12));
  bag.add('plaster_white', box(cx - a * 0.72, y + 1.05, cz - a * 0.72, cx + a * 0.72, y + 4.6, cz + a * 0.72));
  bag.add('opening', box(cx - 0.6, y + 1.05, cz - a * 0.72 - 0.02, cx + 0.6, y + 3.2, cz - a * 0.72 + 0.03)); bag.add('opening', box(cx - 0.6, y + 1.05, cz + a * 0.72 - 0.03, cx + 0.6, y + 3.2, cz + a * 0.72 + 0.02));
  let r = a * 0.78, yy = y + 4.6;
  for (let i = 0; i < 5; i++) { const h = 1.1 * (1 - i * 0.1); bag.add(i % 2 ? 'lime_plaster' : 'plaster_white', lathe([[r * 1.15, 0], [r * 1.15, 0.2], [r, 0.25], [r * 0.9, h]].map(([q, hh]) => [q, hh]), 4, (t) => 1.414, cx, yy, cz).rotateY(Math.PI / 4)); yy += h; r *= 0.78; }
  bag.add('gold', lathe([[0.2, 0], [0.12, 0.8], [0.001, 1.6]], 8, null, cx, yy, cz));
  col.rect([cx - a - 0.1, cz - a - 0.1, cx + a + 0.1, cz + a + 0.1], y, y + 7);
}
/** prasat: the cross-shaped hall with a slender prang — { rect, y, seed } four porches round a square cella under a tall tapering tower. */
function prasat(el, { bag, col }) {
  const [x0, z0, x1, z1] = norm(el.rect), y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, a = (x1 - x0) / 2, c = a * 0.55;
  bag.add('brick_baked', box(x0 - 0.6, y, z0 - 0.6, x1 + 0.6, y + 1.2, z1 + 0.6)); col.rect([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y, y + 1.2); col.floor([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y + 1.2);
  const f = y + 1.2;
  bag.add('plaster_white', box(cx - c, f, cz - c, cx + c, f + 7.4, cz + c));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const rr = dx ? [cx + dx * c - (dx < 0 ? a - c : 0), cz - 2.6, cx + dx * c + (dx > 0 ? a - c : 0), cz + 2.6] : [cx - 2.6, cz + dz * c - (dz < 0 ? a - c : 0), cx + 2.6, cz + dz * c + (dz > 0 ? a - c : 0)];
    bag.add('plaster_white', box(rr[0], f, rr[1], rr[2], f + 4.4, rr[3]));
    gable(bag, 'roof_tile', [rr[0], rr[1], rr[2], rr[3]], f + 4.4, 1.9, 0.5, dx ? 'x' : 'z');
    const ptx = dx ? cx + dx * (a - 0.02) : cx, ptz = dz ? cz + dz * (a - 0.02) : cz;
    bag.add('opening', dx ? box(ptx - 0.02 - (dx > 0 ? 0.05 : 0), f, ptz - 0.9, ptx + 0.02 + (dx < 0 ? 0.05 : 0), f + 2.8, ptz + 0.9) : box(ptx - 0.9, f, ptz - 0.02 - (dz > 0 ? 0.05 : 0), ptx + 0.9, f + 2.8, ptz + 0.02 + (dz < 0 ? 0.05 : 0)));
    col.rect(rr, f, f + 4.4);
  }
  col.rect([cx - c, cz - c, cx + c, cz + c], f, f + 7.4);
  // the prang: stacked, tapering tiers, each a storey in miniature, then the finial
  let r = c * 0.95, yy = f + 7.4;
  for (let i = 0; i < 6; i++) { const h = 1.55 - i * 0.1; bag.add(i % 2 ? 'lime_plaster' : 'plaster_white', box(cx - r, yy, cz - r, cx + r, yy + h, cz + r)); bag.add('lime_plaster', box(cx - r * 1.1, yy + h, cz - r * 1.1, cx + r * 1.1, yy + h + 0.2, cz + r * 1.1)); yy += h + 0.2; r *= 0.8; }
  bag.add('plaster_white', lathe([[r, 0], [r * 0.9, 1.6], [r * 0.5, 3.2], [0.001, 4.6]], 8, null, cx, yy, cz)); bag.add('gold', lathe([[0.14, 4.4], [0.08, 5.4], [0.001, 6.2]], 8, null, cx, yy, cz));
}
/** bell_tower: { rect, y } brick columns, a wooden floor, the roof in five tiers. */
function bellTower(el, { bag, col }) {
  const [x0, z0, x1, z1] = norm(el.rect), y = el.y ?? 0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, a = (x1 - x0) / 2;
  bag.add('brick_baked', box(x0, y, z0, x1, y + 1.0, z1)); col.rect([x0, z0, x1, z1], y, y + 1.0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { bag.add('brick', box(cx + sx * (a - 0.4) - 0.4, y + 1.0, cz + sz * (a - 0.4) - 0.4, cx + sx * (a - 0.4) + 0.4, y + 7.0, cz + sz * (a - 0.4) + 0.4)); }
  bag.add('timber', box(x0 + 0.1, y + 4.0, z0 + 0.1, x1 - 0.1, y + 4.25, z1 - 0.1));
  bag.add('bronze', lathe([[0.1, 0], [0.5, -0.2], [0.8, -1.1], [0.88, -1.4], [0.001, -1.4]], 10, null, cx, y + 6.6, cz));
  let r = a + 0.9, yy = y + 7.0;
  for (let i = 0; i < 5; i++) { const h = 1.0 - i * 0.08; bag.add('roof_tile', lathe([[r * 1.414, 0], [r * 0.7 * 1.414, h]], 4, null, cx, yy, cz).rotateY(Math.PI / 4)); yy += h * 0.8; r *= 0.74; }
  bag.add('gold', lathe([[0.15, 0], [0.001, 1.8]], 6, null, cx, yy + 0.2, cz));
}
/** cloister: the gallery round the platform — { rect, y, gate (the opening's centre on its south side) }, brick walls with a tiled lean-to roof, seated images facing outward. */
function cloister(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = norm(el.rect), y = el.y ?? 0, h = 2.4, gx = el.gate ?? (x0 + x1) / 2, gw = 3.2;
  const seg = (a, b, ops) => wall(ctx, a, b, 0.8, y, y + h, 'plaster_white', ops);
  seg([x0, z0], [x1, z0], []); seg([x0, z0], [x0, z1], []); seg([x1, z0], [x1, z1], []);
  seg([x0, z1], [gx - gw, z1], []); seg([gx + gw, z1], [x1, z1], []);
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [gx - gw, z1]], [[gx + gw, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) {
    bag.add('lime_plaster', rod([a[0], y + h + 0.1, a[1]], [b[0], y + h + 0.1, b[1]], 0.0, 3));
  }
  // the coping and the lean-to roof inside
  for (const [a, b] of [[[x0, z0, x1, z0 + 0.4]], [[x0, z0, x0 + 0.4, z1]], [[x1 - 0.4, z0, x1, z1]]].map((r) => [r[0]])) bag.add('lime_plaster', box(a[0] - 0.1, y + h, a[1] - 0.1, a[2] + 0.1, y + h + 0.2, a[3] + 0.1));
  bag.add('lime_plaster', box(x0 - 0.1, y + h, z1 - 0.5, gx - gw, y + h + 0.2, z1 + 0.5)); bag.add('lime_plaster', box(gx + gw, y + h, z1 - 0.5, x1 + 0.1, y + h + 0.2, z1 + 0.5));
  // the images facing outward on the south wall, seven each side of the gate, under a lean-to
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const x = gx + s * (gw + 2.5 + i * 3.2); if (x > x0 + 1.5 && x < x1 - 1.5) buddha({ at: [x, z1 + 1.2], y, h: 1.9, face: 's' }, ctx); }
  bag.add('roof_tile', box(x0 - 0.4, y + 2.3, z1 + 0.5, gx - gw, y + 2.45, z1 + 2.3)); bag.add('roof_tile', box(gx + gw, y + 2.3, z1 + 0.5, x1 + 0.4, y + 2.45, z1 + 2.3));
  // the platform inside, with the stair up from the gate
  const pf = el.platform ?? 0.8, ix0 = x0 + 0.4, ix1 = x1 - 0.4, iz0 = z0 + 0.4, iz1 = z1 - 0.4;
  bag.add('brick_baked', box(ix0, y, iz0, ix1, y + pf, iz1)); bag.add('flagstone', box(ix0, y + pf - 0.04, iz0, ix1, y + pf, iz1));
  col.floor([ix0, iz0, ix1, iz1], y + pf);
  // the stair through the gate
  const n = 4; for (let i = 0; i < n; i++) bag.add('brick_baked', box(gx - gw, y, z1 + 0.4 + 0.0, gx + gw, y + pf * (i + 1) / n, z1 + 0.4 + 0)) ;
  col.ramp([gx - gw, z1 - 0.6, gx + gw, z1 + 0.6], y, y + pf, 'n');
}
// ── the water ─────────────────────────────────────────────────────────────────────────────────────────────────────
/** canal_bank: { rect (the water's rect), bed, top } brick faces on the two long sides, a laterite coping; the ends open to the river. */
function canalBank(el, { bag, col }) {
  const [x0, z0, x1, z1] = norm(el.rect), bed = el.bed ?? -2.3, top = el.top ?? 0.1, ew = x1 - x0 > z1 - z0;
  const sides = ew ? [[x0, z0 - 1.0, x1, z0 + 0.5], [x0, z1 - 0.5, x1, z1 + 1.0]] : [[x0 - 1.0, z0, x0 + 0.5, z1], [x1 - 0.5, z0, x1 + 1.0, z1]];
  for (const r of sides) { bag.add('brick', box(r[0], bed, r[1], r[2], top, r[3])); col.rect(r, bed, top); }
  for (const r of sides) { const q = ew ? [r[0], r[1] === z0 - 1.0 ? z0 - 0.4 : z1 - 0.1, r[2], r[1] === z0 - 1.0 ? z0 + 0.1 : z1 + 0.4] : [r[0] === x0 - 1.0 ? x0 - 0.4 : x1 - 0.1, r[1], r[0] === x0 - 1.0 ? x0 + 0.1 : x1 + 0.4, r[3]]; bag.add('laterite', box(q[0], top, q[1], q[2], top + 0.1, q[3])); }
}
/** thai_bridge: { c, dir ('x'|'z' the way), kind ('brick'|'hurdle'), span (the canal's width, 8), y (the bank's level) } */
function thaiBridge(el, { bag, col }) {
  const [cx, cz] = el.c, A = el.dir === 'x', span = el.span ?? 8, y = el.y ?? 0, hw = 1.5, brick = el.kind === 'brick';
  const R = (u0, u1, v0, v1) => (A ? [cx + u0, cz + v0, cx + u1, cz + v1] : [cx + v0, cz + u0, cx + v1, cz + u1]);
  const B = (m, u0, u1, v0, v1, y0, y1) => { const r = R(u0, u1, v0, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); };
  const F = (u0, u1, v0, v1, yy) => col.floor(R(u0, u1, v0, v1), yy);
  const hs = span / 2;
  if (brick) {
    // the corbelled arch: three courses stepping in from the two banks, a crown slab, the road over it; approaches of stepped brick
    const top = y + 1.75, ramp = 4.5;
    for (let i = 0; i < 3; i++) { const e = 0.9 * (i + 1), y0 = y + 0.15 + i * 0.45; B('brick', -hs - 0.5, -hs + e, -hw - 0.3, hw + 0.3, y0, y0 + 0.45); B('brick', hs - e, hs + 0.5, -hw - 0.3, hw + 0.3, y0, y0 + 0.45); }
    B('brick', -hs, hs, -hw - 0.3, hw + 0.3, y + 1.5, top);
    for (const s of [-1, 1]) {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = ramp * i / n, b = ramp * (i + 1) / n, hh = y + (top - y) * (1 - i / n);
        if (s < 0) B('brick', -hs - b, -hs - a, -hw - 0.3, hw + 0.3, y, hh); else B('brick', hs + a, hs + b, -hw - 0.3, hw + 0.3, y, hh);
      }
    }
    for (const s of [-1, 1]) B('plaster_white', -hs - ramp, hs + ramp, s * (hw + 0.2) - 0.15, s * (hw + 0.2) + 0.15, y + 0.0, top + 0.8);
    F(-hs, hs, -hw, hw, top);
    col.ramp(R(-hs - ramp, -hs, -hw, hw), y, top, A ? 'e' : 's');
    col.ramp(R(hs, hs + ramp, -hw, hw), y, top, A ? 'w' : 'n');
    for (const s of [-1, 1]) col.rect(R(-hs - ramp, hs + ramp, s * (hw + 0.2) - 0.15, s * (hw + 0.2) + 0.15), y, top + 0.85);
  } else {
    // the hurdle bridge: a deck of woven bamboo and planks on posts driven into the canal's bed, a single rail of bamboo
    for (let u = -hs + 0.6; u <= hs - 0.5; u += 2.0) for (const s of [-1, 1]) { const q = A ? [cx + u, cz + s * (hw - 0.2)] : [cx + s * (hw - 0.2), cz + u]; bag.add('timber', lathe([[0.1, 0], [0.09, 3.0]], 6, null, q[0], -2.3, q[1])); }
    B('timber', -hs - 0.6, hs + 0.6, -hw, hw, y + 0.1, y + 0.2); B('reed_mat', -hs - 0.6, hs + 0.6, -hw + 0.05, hw - 0.05, y + 0.2, y + 0.26);
    for (const s of [-1, 1]) B('bamboo_culm', -hs - 0.6, hs + 0.6, s * (hw - 0.1) - 0.04, s * (hw - 0.1) + 0.04, y + 0.95, y + 1.04);
    F(-hs - 0.6, hs + 0.6, -hw, hw, y + 0.26);
    for (const s of [-1, 1]) col.rect(R(-hs - 0.6, hs + 0.6, s * (hw - 0.1) - 0.05, s * (hw - 0.1) + 0.05), y, y + 1.05);
  }
}
/** landing: a timber stage at a bank, { at, dir ('n'|'s'|'e'|'w' the water's side), y (the bank), len } on piles. */
function landing(el, { bag, col }) {
  const [x, z] = el.at, d = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.dir], len = el.len ?? 3, wd = 1.8, wl = el.water ?? -0.8, top = wl + 0.55;
  const R = (a, b) => { const p = [x + d[0] * a - d[1] * wd / 2, z + d[1] * a + d[0] * wd / 2], q = [x + d[0] * b + d[1] * wd / 2, z + d[1] * b - d[0] * wd / 2]; return norm([p[0], p[1], q[0], q[1]]); };
  const r = R(0, len);
  bag.add('timber', box(r[0], top - 0.12, r[1], r[2], top, r[3])); col.floor(r, top);
  for (const a of [0.3, len - 0.3]) for (const s of [-1, 1]) { const px = x + d[0] * a - d[1] * s * (wd / 2 - 0.1), pz = z + d[1] * a + d[0] * s * (wd / 2 - 0.1); bag.add('timber', lathe([[0.1, 0], [0.09, top + 0.9 + 2.3]], 6, null, px, -2.3, pz)); }
}
// ── boats ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The boat's measures by kind: [length, beam, draught, gunwale, bow rise, stern rise]. */
export const BOATS = { sampan: [6.0, 1.15, 0.22, 0.45, 0.6, 0.9], vendor: [5.2, 1.45, 0.25, 0.5, 0.45, 0.7], ruea: [11, 1.7, 0.3, 0.55, 1.3, 1.5], barge: [16, 2.3, 0.35, 0.6, 1.8, 2.0] };
/** boat: { at, rot, y (the waterline), kind, len, load ('fruit'|'pots'|'rice'|'fish'|'empty'), awning, seed } built along z, the bow toward −z at rot 0. */
export function boatParts(el) {
  const [L0, B0, dr, D, bow, stern] = BOATS[el.kind ?? 'sampan'], L = el.len ?? L0, k = L / L0, out = [], rand = rng(el.seed ?? 1);
  const add = (m, g) => out.push([m, g]);
  const H = hull(L, B0, dr, D, { bowRise: bow, sternRise: stern, sharp: 0.95 });
  add('wood_dark', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
  // the gunwale's strake and the thwarts
  const zs = (f) => -L / 2 + L * f;
  for (const f of [0.3, 0.45, 0.6, 0.75]) add('timber', box(-B0 * 0.45, D - 0.14, zs(f) - 0.05, B0 * 0.45, D - 0.08, zs(f) + 0.05));
  const load = el.load ?? 'empty', mid = zs(0.42);
  if (load === 'fruit') { const cols = ['glaze_yellow', 'cloth_green', 'cloth_red']; for (let i = 0; i < 5; i++) add(cols[i % 3], lathe([[0.4 * B0, 0], [0.3 * B0, 0.16], [0.001, 0.3]], 8, null, ((i % 2) - 0.5) * B0 * 0.45, D, zs(0.3 + i * 0.09))); for (let i = 0; i < 2; i++) add('wicker', lathe([[0.2, 0], [0.26, 0.28], [0.22, 0.3]], 8, null, (i - 0.5) * 0.5, D, zs(0.7))); }
  else if (load === 'pots') for (let i = 0; i < 8; i++) add('terracotta', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.2], [0.2, 0.42], [0.14, 0.46], [0.001, 0.46]], 8, null, ((i % 3) - 1) * 0.3, D, zs(0.28 + (i / 3 | 0) * 0.13)));
  else if (load === 'rice') for (let i = 0; i < 6; i++) add('sacking', lathe([[0.2, 0], [0.26, 0.15], [0.2, 0.35], [0.001, 0.38]], 7, null, ((i % 2) - 0.5) * 0.45, D, zs(0.28 + (i >> 1) * 0.12)));
  else if (load === 'fish') { add('wicker', lathe([[0.45, 0], [0.5, 0.25], [0.46, 0.3]], 9, null, 0, D, zs(0.4))); add('silver', lathe([[0.4, 0.2], [0.001, 0.32]], 9, null, 0, D, zs(0.4))); }
  if (el.awning) {
    // a roof of woven matting (atap or bamboo) on bent poles over the middle, open at both ends
    const hw = B0 * 0.52, z0 = zs(0.28), z1 = zs(0.7), ya = D + 0.95, T = [], q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
    q([-hw, ya, z0], [-hw, ya, z1], [0, ya + 0.32, z1], [0, ya + 0.32, z0]); q([hw, ya, z1], [hw, ya, z0], [0, ya + 0.32, z0], [0, ya + 0.32, z1]);
    add(el.awning === 'cloth' ? 'cloth_ochre' : 'thatch_palm', fromTriangles(T));
    for (const z of [z0, z1]) for (const s of [-1, 1]) add('bamboo_culm', rod([s * hw * 0.95, D, z], [s * hw, ya, z], 0.025, 4));
  }
  void k; void rand;
  return out;
}
function boat(el, { bag }) {
  for (const [m, g] of boatParts(el)) { g.rotateY(el.rot ?? 0); g.translate(el.at[0], el.y ?? -0.8, el.at[1]); bag.add(m, g); }
}
/** floating_house: { c, rot, y (the water), w, d, seed } on its bamboo raft: logs, a plank deck, walls of woven bamboo, a thatch roof, a platform at the front with its goods. */
function floatingHouse(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? -0.8, w = el.w ?? 4.4, d = el.d ?? 5.6, rot = el.rot ?? 0, rand = rng(el.seed ?? 1);
  const parts = [], add = (m, g) => parts.push([m, g]);
  const deck = y + 0.28, plat = 1.9, hd = d / 2, hw = w / 2;
  // the raft: logs of bamboo and big floats under the deck
  for (let i = 0; i < 6; i++) add('bamboo_culm', rod([-hw + (i + 0.5) * w / 6, y - 0.28, -hd - plat], [-hw + (i + 0.5) * w / 6, y - 0.28, hd], 0.17, 6));
  add('timber', box(-hw - 0.15, y - 0.12, -hd - plat - 0.1, hw + 0.15, deck, hd + 0.1));
  add('timber', box(-hw - 0.1, deck, -hd - plat, hw + 0.1, deck + 0.05, hd));
  // the house: walls of woven bamboo with the door and a window toward the front, the roof of thatch
  const wh = 2.0, th = 0.07;
  add('reed_mat', box(-hw, deck, hd - th, hw, deck + wh, hd)); add('reed_mat', box(-hw, deck, -hd, -hw + th, deck + wh, hd)); add('reed_mat', box(hw - th, deck, -hd, hw, deck + wh, hd));
  add('reed_mat', box(-hw, deck, -hd, -0.55, deck + wh, -hd + th)); add('reed_mat', box(0.55, deck, -hd, hw, deck + wh, -hd + th)); add('reed_mat', box(-hw, deck + 1.9, -hd, hw, deck + wh, -hd + th));
  add('opening', box(-0.5, deck, -hd - 0.01, 0.5, deck + 1.9, -hd + 0.01));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add('timber', lathe([[0.07, 0], [0.07, wh + 0.3]], 5, null, sx * hw, deck, sz * hd));
  const T = [], q = (a, b, c, e) => T.push(...a, ...b, ...c, ...a, ...c, ...e), ro = 0.5, rh = 1.5, yy = deck + wh;
  q([-hw - ro, yy, -hd - ro], [-hw - ro, yy, hd + ro], [0, yy + rh, hd + ro], [0, yy + rh, -hd - ro]); q([hw + ro, yy, hd + ro], [hw + ro, yy, -hd - ro], [0, yy + rh, -hd - ro], [0, yy + rh, hd + ro]);
  q([-hw - ro, yy - 0.2, hd + ro], [-hw - ro, yy - 0.2, -hd - ro], [0, yy + rh - 0.2, -hd - ro], [0, yy + rh - 0.2, hd + ro]); q([hw + ro, yy - 0.2, -hd - ro], [hw + ro, yy - 0.2, hd + ro], [0, yy + rh - 0.2, hd + ro], [0, yy + rh - 0.2, -hd - ro]);
  const tri = (a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);
  tri([-hw - ro, yy, -hd - ro], [0, yy + rh, -hd - ro], [hw + ro, yy, -hd - ro]); tri([hw + ro, yy, hd + ro], [0, yy + rh, hd + ro], [-hw - ro, yy, hd + ro]);
  add('thatch', fromTriangles(T));
  // the front platform's goods: baskets, a pot, a net hung to dry, a small shrine shelf
  for (let i = 0; i < 3; i++) add('wicker', lathe([[0.2, 0], [0.27, 0.3], [0.23, 0.32]], 8, null, -hw + 0.7 + i * 0.8 + (rand() - 0.5) * 0.2, deck + 0.05, -hd - 0.7));
  add('terracotta', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.22], [0.22, 0.5], [0.15, 0.55]], 8, null, hw - 0.5, deck + 0.05, -hd - 1.4));
  add('timber', box(-hw - 0.05, deck + 0.05, -hd - plat + 0.1, -hw + 0.05, deck + 1.0, -hd - plat + 0.2));
  add('bamboo_culm', rod([-hw, deck + 0.98, -hd - plat + 0.15], [hw, deck + 0.98, -hd - plat + 0.15], 0.03, 4));
  for (const [m, g] of parts) { g.rotateY(rot); g.translate(cx, 0, cz); bag.add(m, g); }
  // collision: the whole raft is a solid rect (no walking over water)
  const c = Math.cos(rot), s = Math.sin(rot), pts = [[-hw, -hd - plat], [hw, -hd - plat], [hw, hd], [-hw, hd]].map(([a, b]) => [cx + a * c + b * s, cz - a * s + b * c]);
  col.rect([Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))], y - 1, y + 4.5);
}
/** mooring_post: { at, y } a bamboo or timber pile a few boats are tied to. */
function pile(el, { bag, col }) { bag.add('timber', lathe([[0.12, 0], [0.1, 3.6]], 6, null, el.at[0], el.y ?? -2.3, el.at[1])); col.circle(el.at[0], el.at[1], 0.14, el.y ?? -2.3, 1.2); }

/** thai_house: { rect, front, seed, kind, simple } — the stilt house of the Khmer style in full; far off a plain box on posts under a thatched gable. */
function thaiHouse(el, ctx) {
  if (!el.simple) return kh.elements.stilt_house(el, ctx);
  const { bag } = ctx, [x0, z0, x1, z1] = norm(el.rect), up = 2.2, h = 2.2, alongX = (x1 - x0) >= (z1 - z0);
  bag.add('timber', box(x0, up - 0.2, z0, x1, up, z1));
  bag.add(el.seed % 2 ? 'reed_mat' : 'timber', box(x0 + 0.1, up, z0 + 0.1, x1 - 0.1, up + h, z1 - 0.1));
  for (const [x, z] of [[x0 + 0.3, z0 + 0.3], [x1 - 0.3, z0 + 0.3], [x0 + 0.3, z1 - 0.3], [x1 - 0.3, z1 - 0.3]]) bag.add('timber', box(x - 0.1, 0, z - 0.1, x + 0.1, up, z + 0.1));
  const rise = Math.min(x1 - x0, z1 - z0) * 0.55 + 0.4;
  gable(bag, 'thatch_palm', [x0, z0, x1, z1], up + h, rise, 0.5, alongX ? 'x' : 'z');
}
const SIAMESE = { thai_house: thaiHouse, chedi, buddha, wihan, mandapa, prasat, bell_tower: bellTower, cloister, canal_bank: canalBank, thai_bridge: thaiBridge, landing, boat, floating_house: floatingHouse, pile };
registerStyle('siamese', { ...kh, elements: { ...kh.elements, ...SIAMESE } });
