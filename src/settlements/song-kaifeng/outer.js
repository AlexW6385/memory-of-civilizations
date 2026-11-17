// Bianjing's outer quarters (docs/settlements/song-kaifeng.md §16): the tiled houses and thatched cottages beyond the sights, which were
// shut wall blocks (far.js), now of several house types by rule — plain, with a front shop, with a loft, walled courtyard (tiled);
// plain, with a pen, with a granary, with a bed-garden (thatched) — most with their door open and a room one can walk into (floor, ceiling,
// bed, table, stove, stools), yards with their own things, and the people and goods of those rooms and yards (`outerLife`).
// A lot's spec is pure data (`specOf`): the element, the life and the doors all read the same one.
import { fromTriangles, lathe } from '../../core/geom.js';
import { doorOf } from './houses.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (r, a) => a[Math.floor(r() * a.length)];
const WALLS = ['plaster_white', 'plaster_white', 'plaster_grey', 'lime_plaster', 'plaster_damp'];
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

/** Which outer lots this builder takes: the plain houses and cottages of the outer quarters. */
export const isOuter = (l) => (l.kind === 'house' || l.kind === 'thatch') && l.det <= 0;

/** The pure description of a lot's house: type, size, door, window, whether it is entered. */
export function specOf(l) {
  const r = rng((l.seed || 1) * 31 + 7), [x0, z0, x1, z1] = l.foot, f = l.front, along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, thatch = l.kind !== 'house';
  const vt = thatch ? pick(r, ['hut', 'hut', 'pen', 'granary', 'garden']) : pick(r, ['plain', 'plain', 'plain', 'shopfront', 'loft', 'court', 'court', 'court']);
  const enter = r() < (thatch ? 0.22 : 0.24) && L >= 5.4 && D >= 4.8;
  const dr = doorOf(l), ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1], v = [-u[1], u[0]];
  const dc = (dr.at[0] - ox) * u[0] + (dr.at[1] - oz) * u[1];
  const wide = Math.min(L - dc, dc), farSide = dc < L / 2 ? 1 : -1;
  const hw = thatch ? 0.5 : 0.6;
  const wa = farSide > 0 ? (dc + hw + L - 0.3) / 2 : (dc - hw + 0.3) / 2;            // the window in the bigger side
  const alongRidge = L >= D * 0.9 || r() < 0.7;
  const trade = vt === 'shopfront' ? pick(r, ['cakes', 'tea', 'cloth', 'sundries']) : null;
  return { l, r, L, D, thatch, vt, enter, dc, hw, wa, wide, farSide, ox, oz, u, v, alongRidge, trade, wm: thatch ? (r() < 0.6 ? 'mud_plaster' : 'earth_wall') : pick(r, WALLS), tile: r() < 0.7 ? 'tile_grey' : 'tile_dark', Hw: thatch ? 2.35 + r() * 0.25 : 2.9 + r() * 0.3 };
}

/** One house { ...lot, door } — see the file's head. */
export function houseOuter(el, ctx) {
  const acc = new Map();
  for (const l of el.lots) one(l, ctx, acc);
  for (const [m, A] of acc) if (A.length) ctx.bag.add(m, fromTriangles(A));
}
function one(el, { bag, col }, acc) {
  const S = specOf(el), { L, D, thatch, vt, enter, dc, hw, wa, ox, oz, u, v, wm, tile, Hw, r, farSide } = S;
  const P0 = thatch ? 0.14 : 0.28, loft = vt === 'loft', yw = P0 + Hw + (loft ? 2.3 : 0), ceil = P0 + (thatch ? 2.0 : 2.7);
  const arr = (m) => acc.get(m) || (acc.set(m, []), acc.get(m));
  const W = (a, b, y) => [ox + u[0] * a + v[0] * b, y, oz + u[1] * a + v[1] * b];
  const quad = (A, a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
  /** a box in the house frame, with no bottom; skip: 't' leave out the top */
  const B = (mat, a0, b0, a1, b1, ya, yb, skip = '') => {
    const p = W(a0, b0, 0), q = W(a1, b1, 0), X0 = Math.min(p[0], q[0]), X1 = Math.max(p[0], q[0]), Z0 = Math.min(p[2], q[2]), Z1 = Math.max(p[2], q[2]), A = arr(mat);
    if (!skip.includes('t')) quad(A, [X0, yb, Z0], [X0, yb, Z1], [X1, yb, Z1], [X1, yb, Z0]);
    if (skip.includes('u')) quad(A, [X0, ya, Z0], [X1, ya, Z0], [X1, ya, Z1], [X0, ya, Z1]);
    quad(A, [X0, ya, Z0], [X0, yb, Z0], [X1, yb, Z0], [X1, ya, Z0]); quad(A, [X1, ya, Z0], [X1, yb, Z0], [X1, yb, Z1], [X1, ya, Z1]);
    quad(A, [X1, ya, Z1], [X1, yb, Z1], [X0, yb, Z1], [X0, ya, Z1]); quad(A, [X0, ya, Z1], [X0, yb, Z1], [X0, yb, Z0], [X0, ya, Z0]);
  };
  /** a top face only (a floor plate, an underside: dn) */
  const plate = (mat, a0, b0, a1, b1, y, dn = false) => {
    const p = W(a0, b0, 0), q = W(a1, b1, 0), X0 = Math.min(p[0], q[0]), X1 = Math.max(p[0], q[0]), Z0 = Math.min(p[2], q[2]), Z1 = Math.max(p[2], q[2]), A = arr(mat);
    if (dn) quad(A, [X0, y, Z0], [X1, y, Z0], [X1, y, Z1], [X0, y, Z1]); else quad(A, [X0, y, Z0], [X0, y, Z1], [X1, y, Z1], [X1, y, Z0]);
  };
  const tri2 = (mat, pts) => { const A = arr(mat); for (let i = 1; i + 1 < pts.length; i++) { A.push(...pts[0], ...pts[i], ...pts[i + 1]); A.push(...pts[0], ...pts[i + 1], ...pts[i]); } };   // both faces
  const cR = (a0, b0, a1, b1, ya, yb) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); col.rect([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], ya, yb); };
  const cF = (a0, b0, a1, b1, y) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); col.floor([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], y); };

  const fq = (mat, a0, a1, y0, y1, bb) => {
    const p0 = W(a0, bb, y0), p1 = W(a1, bb, y0), p2 = W(a1, bb, y1), p3 = W(a0, bb, y1), A = arr(mat);
    const ux = p1[0] - p0[0], uz = p1[2] - p0[2], wy = p3[1] - p0[1], nx = -uz * wy * -1 * -1, nz = ux * wy;   // (p1-p0) x (p3-p0) = (uy*wz-uz*wy, uz*wx-ux*wz, ux*wy-uy*wx) with uy=wx=wz=0
    void nx;
    const n = [-uz * wy, 0, ux * wy];
    if (n[0] * -v[0] + n[2] * -v[1] < 0) A.push(...p0, ...p2, ...p1, ...p0, ...p3, ...p2); else A.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    void nz;
  };
  const closed = () => {
    B(wm, 0, 0, L, D, P0, yw, 't');
    { const pd = thatch ? 0.6 : 0; cR(-pd, -pd, L + pd, D + pd, 0, yw + 1); }
    fq('wood_dark', dc - hw + 0.05, dc + hw - 0.05, P0, P0 + 2.05, -0.02);
    fq('timber', dc - hw - 0.05, dc - hw + 0.05, P0, P0 + 2.15, -0.025); fq('timber', dc + hw - 0.05, dc + hw + 0.05, P0, P0 + 2.15, -0.025); fq('timber', dc - hw - 0.05, dc + hw + 0.05, P0 + 2.05, P0 + 2.15, -0.025);
    if (vt === 'shopfront') { const a0 = farSide > 0 ? dc + hw + 0.5 : Math.max(0.4, dc - hw - 2.5), a1 = Math.min(L - 0.4, a0 + 2.0); if (a1 - a0 > 1) { fq('wood_dark', a0, a1, P0 + 0.9, P0 + 2.3, -0.02); fq('wicker', a0, a1, P0 + 0.9, P0 + 1.0, -0.04); } }
    else if (wa > 0.6 && wa < L - 0.6) fq(thatch ? 'wood_dark' : 'lattice', wa - (thatch ? 0.25 : 0.43), wa + (thatch ? 0.25 : 0.43), P0 + 1.05, P0 + (thatch ? 1.55 : 1.85), -0.02);
    if (loft) fq('lattice', L / 2 - 0.42, L / 2 + 0.42, yw - 1.57, yw - 0.83, -0.02);
  };
  if (!enter) closed(); else {
  // ---- plinth and walls
  B(thatch ? 'granite_grey' : 'granite_block', -0.04, -0.04, L + 0.04, D + 0.04, -0.4, P0);
  B(wm, 0, D - 0.3, L, D, P0, yw, 't'); B(wm, 0, 0.3, 0.3, D - 0.3, P0, yw, 't'); B(wm, L - 0.3, 0.3, L, D - 0.3, P0, yw, 't');
  const back = enter && (vt === 'court' || r() < 0.2);                    // a back door into the yard
  if (back) { /* the back wall is cut for the door: rebuilt below */ }
  // the front: openings (door, window or shop bay)
  const op = [{ a0: dc - hw, a1: dc + hw, y0: P0, y1: P0 + 2.1, door: true }];
  if (vt === 'shopfront') { const a0 = farSide > 0 ? dc + hw + 0.5 : Math.max(0.5, dc - hw - 2.5), a1 = a0 + Math.min(2.0, (farSide > 0 ? L - 0.5 - a0 : dc - hw - 0.5 - a0)); if (a1 - a0 > 1.2) op.push({ a0, a1, y0: P0 + 0.9, y1: P0 + 2.3, shop: true }); }
  else if (wa > 0.6 && wa < L - 0.6) op.push({ a0: wa - (thatch ? 0.25 : 0.43), a1: wa + (thatch ? 0.25 : 0.43), y0: P0 + 1.05, y1: P0 + (thatch ? 1.55 : 1.85), win: true });
  op.sort((p, q) => p.a0 - q.a0);
  let c = 0;
  const seg = (a0, a1, y0, y1) => { if (a1 - a0 > 0.02 && y1 - y0 > 0.02) B(wm, a0, 0, a1, 0.3, y0, y1, 't'); };
  for (const o of op) { seg(c, o.a0, P0, yw); if (o.y0 > P0 + 0.01) seg(o.a0, o.a1, P0, o.y0); seg(o.a0, o.a1, o.y1, yw); c = o.a1; }
  seg(c, L, P0, yw);
  if (loft) { const a = L / 2; B('timber', a - 0.5, -0.04, a + 0.5, 0.02, yw - 1.65, yw - 0.75); B('lattice', a - 0.42, -0.05, a + 0.42, 0.03, yw - 1.57, yw - 0.83); B('cloth_indigo', a + 0.6, -0.03, a + 1.0, 0.0, yw - 1.7, yw - 0.7); }
  for (const o of op) {
    if (o.win) { B(thatch ? 'wood_dark' : 'lattice', o.a0 + 0.02, 0.1, o.a1 - 0.02, 0.17, o.y0, o.y1, 'u'); }
    if (o.door) {
      B('timber', o.a0, -0.02, o.a1, 0.32, o.y1, o.y1 + 0.1);
      B('granite_block', o.a0 - 0.1, -0.5, o.a1 + 0.1, 0.3, P0 - 0.05, P0 + 0.05);
      if (enter) { B('wood_dark', o.a1 - 0.08, 0.3, o.a1 - 0.02, 0.3 + hw, P0, o.y1 - 0.05, 't'); }
      else { B('wood_dark', o.a0 + 0.09, 0.1, o.a1 - 0.09, 0.2, P0, o.y1 - 0.04, 't'); for (const y of [0.4, 1.1, 1.75]) B('timber', o.a0 + 0.09, 0.06, o.a1 - 0.09, 0.1, P0 + y, P0 + y + 0.12, 't'); }
    }
    if (o.shop) {
      B('wood_dark', o.a0, 0.45, o.a1, 1.0, P0, P0 + 0.9); B('timber', o.a0 - 0.05, 0.4, o.a1 + 0.05, 1.05, P0 + 0.9, P0 + 0.95);
      B('timber', o.a0 - 0.08, -0.02, o.a0 + 0.04, 0.3, P0, o.y1 + 0.06, 't'); B('timber', o.a1 - 0.04, -0.02, o.a1 + 0.08, 0.3, P0, o.y1 + 0.06, 't'); B('timber', o.a0 - 0.08, -0.04, o.a1 + 0.08, 0.3, o.y1, o.y1 + 0.12);
      // the mat awning over the counter, hung from the eave on two cords, a cloth valance
      const A = arr('reed_mat'), y = P0 + 2.7, ya = P0 + 2.3, o2 = -1.2;
      const q = [W(o.a0 - 0.2, -0.1, y), W(o.a1 + 0.2, -0.1, y), W(o.a1 + 0.2, o2, ya), W(o.a0 - 0.2, o2, ya)];
      A.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
      B('cloth_ochre', o.a0 - 0.2, o2 - 0.01, o.a1 + 0.2, o2 + 0.01, ya - 0.35, ya, 'u');
    }
  }
  if (enter) {
    cR(0, D - 0.3, L, D, 0, yw + 1); cR(0, 0, 0.3, D, 0, yw + 1); cR(L - 0.3, 0, L, D, 0, yw + 1);
    let cc = 0; for (const o of op) { if (o.a0 > cc) cR(cc, 0, o.a0, 0.3, 0, yw + 1); if (!o.door) cR(o.a0, 0, o.a1, 0.3, 0, o.y0 + 0.1 > P0 + 0.5 ? o.y0 : yw + 1); cc = o.a1; } cR(cc, 0, L, 0.3, 0, yw + 1);
    cF(0.3, 0.3, L - 0.3, D - 0.3, P0); cF(dc - hw + 0.05, -0.45, dc + hw - 0.05, 0.35, P0);
    plate('brick_paving', 0.3, 0.3, L - 0.3, D - 0.3, P0 + 0.012);
    plate('timber', 0.3, 0.3, L - 0.3, D - 0.3, ceil, true);
    B('wood_dark', L / 2 - 0.08, 0.3, L / 2 + 0.08, D - 0.3, ceil - 0.16, ceil, 'tu');
    if (back) {
      // the back door: the back wall is already built solid; open it by laying the door's jambs over a gap is not possible, so the back door is a painted one (shut) and the yard is reached by the side alley
    }
    furnish();
  }

  }
  // ---- the roof
  const oh = thatch ? 0.6 : 1.15, soh = thatch ? 0.6 : 0.5, th = thatch ? 0.3 : 0.15;
  const M = S.alongRidge ? (s, t, y) => W(s, t, y) : (s, t, y) => W(t, s, y);
  const s0 = S.alongRidge ? -soh : -oh, s1 = S.alongRidge ? L + soh : D + oh, t0 = S.alongRidge ? -oh : -soh, t1 = S.alongRidge ? D + oh : L + soh;
  const tm = (t0 + t1) / 2, hb = (t1 - t0) / 2, p = thatch ? 0.95 : 1.3;
  const rise = thatch ? hb * (0.78 + r() * 0.12) : (hb - 0.2) * (0.3 + r() * 0.06);
  const yE = yw - rise * Math.pow(Math.max(0, 1 - Math.abs(0 - tm) / hb), p);
  const prof = (t) => yE + rise * Math.pow(Math.max(0, 1 - Math.abs(t - tm) / hb), p);
  const yR = yE + rise, rm = thatch ? 'thatch' : tile;
  if (thatch) {
    const hip = Math.min(hb * 0.95, (s1 - s0) / 2 - 0.3), A = M(s0, t0, yE), Bb = M(s1, t0, yE), C = M(s1, t1, yE), Dd = M(s0, t1, yE), R0 = M(s0 + hip, tm, yR), R1 = M(s1 - hip, tm, yR);
    if (!enter) for (const [e0, e1] of [[A, Bb], [Bb, C], [C, Dd], [Dd, A]]) tri2(rm, [e0, e1, [e1[0], e1[1] - 1.5, e1[2]], [e0[0], e0[1] - 1.5, e0[2]]]);   // the thatch's low fringe at the eaves, down to the walker's height
    tri2(rm, [A, Bb, R1, R0]); tri2(rm, [C, Dd, R0, R1]); tri2(rm, [Dd, A, R0]); tri2(rm, [Bb, C, R1]);
    const rr = M(s0 + hip - 0.05, tm - 0.3, 0), r2 = M(s1 - hip + 0.05, tm + 0.3, 0);
    const X0 = Math.min(rr[0], r2[0]), X1 = Math.max(rr[0], r2[0]), Z0 = Math.min(rr[2], r2[2]), Z1 = Math.max(rr[2], r2[2]), Ar = arr('thatch');
    quad(Ar, [X0, yR + 0.3, Z0], [X0, yR + 0.3, Z1], [X1, yR + 0.3, Z1], [X1, yR + 0.3, Z0]);
    quad(Ar, [X0, yR - 0.03, Z0], [X0, yR + 0.3, Z0], [X1, yR + 0.3, Z0], [X1, yR - 0.03, Z0]); quad(Ar, [X1, yR - 0.03, Z1], [X1, yR + 0.3, Z1], [X0, yR + 0.3, Z1], [X0, yR - 0.03, Z1]);
    quad(Ar, [X0, yR - 0.03, Z1], [X0, yR + 0.3, Z1], [X0, yR + 0.3, Z0], [X0, yR - 0.03, Z0]); quad(Ar, [X1, yR - 0.03, Z0], [X1, yR + 0.3, Z0], [X1, yR + 0.3, Z1], [X1, yR - 0.03, Z1]);
  } else {
    const N = 1;
    for (const sg of [-1, 1]) for (let i = 0; i < N; i++) {
      const ta = tm + sg * hb * (1 - i / N), tb = tm + sg * hb * (1 - (i + 1) / N);
      tri2(rm, [M(s0, ta, prof(ta)), M(s1, ta, prof(ta)), M(s1, tb, prof(tb)), M(s0, tb, prof(tb))]);
    }
    // the ridge cap, and the gable ends filled to the roof's underside, the hanging fish on them
    const rr = M(s0 - 0.05, tm - 0.17, 0), r2 = M(s1 + 0.05, tm + 0.17, 0);
    if (enter || el.det === 0) ridgeCap(rr, r2);
  }
  function ridgeCap(rr, r2) {
    const X0 = Math.min(rr[0], r2[0]), X1 = Math.max(rr[0], r2[0]), Z0 = Math.min(rr[2], r2[2]), Z1 = Math.max(rr[2], r2[2]), Ar = arr(tile), ya = yR - 0.02, yb = yR + 0.24;
    quad(Ar, [X0, yb, Z0], [X0, yb, Z1], [X1, yb, Z1], [X1, yb, Z0]);
    quad(Ar, [X0, ya, Z0], [X0, yb, Z0], [X1, yb, Z0], [X1, ya, Z0]); quad(Ar, [X1, ya, Z1], [X1, yb, Z1], [X0, yb, Z1], [X0, ya, Z1]);
    quad(Ar, [X0, ya, Z1], [X0, yb, Z1], [X0, yb, Z0], [X0, ya, Z0]); quad(Ar, [X1, ya, Z0], [X1, yb, Z0], [X1, yb, Z1], [X1, ya, Z1]);
  }
  function gables() {
    const Gm = arr(wm), span = S.alongRidge ? D : L, K = enter ? 4 : 2;
    const ends = S.alongRidge ? [[0, 0], [L, 0]] : [[0, 1], [D, 1]];
    for (const [pc] of ends) {
      const pts = [];
      for (let k = 0; k <= K; k++) { const t = span * k / K; pts.push([t, Math.max(yw - 0.02, prof(t) - th)]); }
      const poly = pts.map(([t, y]) => (S.alongRidge ? W(pc, t, y) : W(t, pc, y)));
      poly.push(S.alongRidge ? W(pc, span, yw - 0.02) : W(span, pc, yw - 0.02), S.alongRidge ? W(pc, 0, yw - 0.02) : W(0, pc, yw - 0.02));
      for (let i = 1; i + 1 < poly.length; i++) { Gm.push(...poly[0], ...poly[i], ...poly[i + 1]); Gm.push(...poly[0], ...poly[i + 1], ...poly[i]); }
    }
  }
  if (enter) {
    // a flat soffit under the eaves' ring: with it the walker passes under the overhang (the collision field takes a single sheet of roof for a solid mass)
    const sy = yE - 0.12, ws0 = 0, ws1 = S.alongRidge ? L : D, wt1 = S.alongRidge ? D : L, A = arr(thatch ? 'wood_dark' : 'timber');
    const dn = (a, b, c, d) => { const q = [M(a[0], a[1], sy), M(b[0], b[1], sy), M(c[0], c[1], sy), M(d[0], d[1], sy)], n = (q[1][2] - q[0][2]) * (q[3][0] - q[0][0]) - (q[1][0] - q[0][0]) * (q[3][2] - q[0][2]); if (n < 0) A.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); else A.push(...q[0], ...q[3], ...q[2], ...q[0], ...q[2], ...q[1]); };
    if (S.alongRidge) dn([s0, t0], [s1, t0], [s1, 0], [s0, 0]); else dn([s0, t0], [0, t0], [0, t1], [s0, t1]);   // (the front's only: the door is reached under it)
    if (!thatch) gables();
  }
  if (!enter && !thatch) gables();
  yard();
  return;

  // ---- the room (enter): bed, table, stove, chest; the people and the small things are outerLife's
  function furnish() {
    const zA = farSide > 0 ? [dc + hw + 0.35, L - 0.3] : [0.3, dc - hw - 0.35], zB = farSide > 0 ? [0.3, dc - hw - 0.35] : [dc + hw + 0.35, L - 0.3];
    const wA = zA[1] - zA[0], wB = zB[1] - zB[0], bk = D - 0.3;
    if (wA >= 1.3) {   // the bed with its head to the back wall, a chest at its foot
      const a0 = farSide > 0 ? zA[1] - 1.15 : zA[0], a1 = a0 + 1.15, b0 = bk - 2.0;
      B('lacquer_chestnut', a0, b0, a1, bk, P0, P0 + 0.46); B('cloth_indigo', a0 + 0.05, b0 + 0.3, a1 - 0.05, bk - 0.05, P0 + 0.46, P0 + 0.52); B('cloth_white', a0 + 0.12, bk - 0.45, a1 - 0.12, bk - 0.1, P0 + 0.52, P0 + 0.62);
      cR(a0, b0, a1, bk, P0, P0 + 0.6);
      B('wood_dark', a0 + 0.1, b0 - 0.5, a1 - 0.1, b0 - 0.05, P0, P0 + 0.45, 'u'); cR(a0 + 0.1, b0 - 0.5, a1 - 0.1, b0 - 0.05, P0, P0 + 0.5);
      if (wA >= 2.4 && D >= 6.2) {   // a table by the window, a low bench each side
        const ta = (zA[0] + zA[1]) / 2 - (farSide > 0 ? 0.55 : -0.55) * 0, tb = 1.5;
        B('lacquer_chestnut', ta - 0.55, tb - 0.35, ta + 0.55, tb + 0.35, P0 + 0.74, P0 + 0.8, 'u'); B('wood_dark', ta - 0.45, tb - 0.25, ta + 0.45, tb + 0.25, P0, P0 + 0.74, 't');
        cR(ta - 0.55, tb - 0.35, ta + 0.55, tb + 0.35, P0, P0 + 0.8);
        for (const sg of [-1, 1]) B('timber', ta + sg * 0.85 - 0.17, tb - 0.17, ta + sg * 0.85 + 0.17, tb + 0.17, P0, P0 + 0.45, 'u');
      }
    }
    if (wB >= 0.9) {   // the stove: a brick block with a pot's mouth and a flue up through the ceiling
      const a0 = zB[0] + 0.05, a1 = a0 + 0.9, b0 = bk - 0.8;
      B('brick_grey', a0, b0, a1, bk, P0, P0 + 0.75); B('iron', a0 + 0.2, b0 + 0.1, a0 + 0.65, b0 + 0.55, P0 + 0.75, P0 + 0.8, 'u'); B('brick_grey', a0 + 0.55, bk - 0.2, a0 + 0.8, bk - 0.02, P0 + 0.75, ceil + 0.3, 'tu');
      cR(a0, b0, a1, bk, P0, ceil + 0.3);
      B('pottery_dark', a0 + 0.1, b0 - 0.75, a0 + 0.7, b0 - 0.15, P0, P0 + 0.7); cR(a0 + 0.1, b0 - 0.75, a0 + 0.7, b0 - 0.15, P0, P0 + 0.7);

    }
  }

  // ---- the yard: the walled court's walls with a lean-to wing, the thatched ones' pen, granary or beds; a well
  function yard() {
    const [rx0, rz0, rx1, rz1] = el.rect, f = el.front, ins = f === 's' || f === 'n' ? el.foot[0] - rx0 : el.foot[1] - rz0;
    const lb = (f === 's' || f === 'n') ? rz1 - rz0 : rx1 - rx0, yd = lb - D;
    if (yd < 2.5 || (!enter && el.det < 0)) return;
    const wing = (a0, a1) => { /* placeholder */ void a0; void a1; };
    void wing;
    if (enter) {   // the yard's small things: a stack of firewood against the back wall, a rain tub, a drying frame
      const k = (el.seed >> 4) % 5, ya = (k % 2 ? 0.5 : L - 2.2), yb = D + 0.35;
      if (k < 3) { B('bark_pine', ya, yb, ya + 1.7, yb + 0.45, 0, 0.9, 'u'); cR(ya, yb, ya + 1.7, yb + 0.45, 0, 0.95); }
      if (k === 0 || k === 4) { const ta = k % 2 ? L - 1.3 : 1.0; B('timber', ta - 0.4, yb + 0.7, ta + 0.4, yb + 1.5, 0, 0.7, 'u'); cR(ta - 0.4, yb + 0.7, ta + 0.4, yb + 1.5, 0, 0.7); }
      if (k >= 3 && yd >= 4) { for (const s2 of [-1, 1]) B('bamboo_culm', L / 2 + s2 * 1.1 - 0.03, D + 2.0, L / 2 + s2 * 1.1 + 0.03, D + 2.06, 0, 1.7, 't'); B('cloth_white', L / 2 - 1.05, D + 2.0, L / 2 + 1.05, D + 2.02, 0.9, 1.6, 'u'); }
    }
    if (vt === 'court' && yd >= 3.2) {
      const wA = Math.max(0.05, ins - 0.3), H = 2.2, b0 = 0.3, b1 = D + yd - 0.2;
      for (const [a0, a1] of [[-wA - 0.3, -wA], [L + wA, L + wA + 0.3]]) { B(wm, a0, b0, a1, b1, 0, H, 't'); B(tile, a0 - 0.08, b0, a1 + 0.08, b1, H, H + 0.14); cR(a0, b0, a1, b1, 0, H + 1); }
      B(wm, -wA - 0.3, b1 - 0.3, L + wA + 0.3, b1, 0, H, 't'); B(tile, -wA - 0.38, b1 - 0.38, L + wA + 0.38, b1 + 0.08, H, H + 0.14); cR(-wA - 0.3, b1 - 0.3, L + wA + 0.3, b1, 0, H + 1);
      // a lean-to wing along one side of the yard, open to the yard
      const ws = el.seed % 2 ? 1 : -1, wl = Math.min(yd - 1.2, 3.4), wb = D + 0.6, aw0 = ws > 0 ? L + wA - 1.9 : -wA + 0.0;
      B('wood_dark', aw0, wb, aw0 + 1.9, wb + wl, P0 * 0, 0.12, 't');
      for (const a of [aw0 + 0.1, aw0 + 1.8]) for (const b of [wb + 0.1, wb + wl - 0.1]) B('timber', a - 0.06, b - 0.06, a + 0.06, b + 0.06, 0.1, 2.1, 't');
      const T = arr('tile_dark'), q = [W(aw0 - 0.1, wb - 0.1, 2.5), W(aw0 + 2.0, wb - 0.1, 2.5), W(aw0 + 2.0, wb + wl + 0.1, 2.0), W(aw0 - 0.1, wb + wl + 0.1, 2.0)];
      T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
      for (const a of [aw0 + 0.1, aw0 + 1.8]) for (const b of [wb + 0.1, wb + wl - 0.1]) cR(a - 0.08, b - 0.08, a + 0.08, b + 0.08, 0, 2.2);
    }
    if (thatch && vt === 'garden') {
      // three raised beds of turned earth with rows of greens, within a wattle fence's posts
      for (let k = 0; k < 3; k++) { const a0 = 0.6 + k * Math.max(1.2, (L - 1.2) / 3), a1 = a0 + Math.max(1.0, (L - 1.2) / 3 - 0.3), b0 = D + 0.8; if (b0 + 1.6 < D + yd) { B('silt', a0, b0, a1, b0 + 1.6, 0, 0.14, 'u'); for (let j = 0; j < 3; j++) B('flax_leaf', a0 + 0.1 + j * (a1 - a0 - 0.3) / 2, b0 + 0.15, a0 + 0.25 + j * (a1 - a0 - 0.3) / 2, b0 + 1.45, 0.14, 0.3, 'u'); } }
    }
    if (thatch && vt === 'granary') {
      // a round granary on stilts, a cone of straw over it, a ladder
      const g = lathe([[0.001, 1.0], [0.9, 1.0], [0.95, 1.9], [0.7, 2.25], [0.001, 3.0]], 8), a = L * 0.5, b = D + Math.min(2.0, yd / 2), q = W(a, b, 0);
      g.translate(q[0], 0, q[2]); bag.add('thatch', g);
      const g2 = lathe([[0.001, 0.95], [0.85, 0.95], [0.85, 1.05], [0.001, 1.05]], 8); g2.translate(q[0], 0, q[2]); bag.add('timber', g2);
      for (const [da, db] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) B('timber', a + da - 0.06, b + db - 0.06, a + da + 0.06, b + db + 0.06, 0, 1.0, 't');
      col.circle(q[0], q[2], 1.0, 0, 3);
    }
    if (thatch && vt === 'pen') {
      // a low lean-to pen beside the house: three posts, a thatched slope, a rail across the front (the pig is outerLife's)
      const a0 = farSide > 0 ? L + 0.2 : -2.6, b0 = 0.4, a1 = a0 + 2.4, b1 = b0 + 2.4;
      if (el.foot && ins >= 0.6 || true) {
        B('wood_dark', a0, b0, a1, b1, 0, 0.1, 'u'); for (const [a, b] of [[a0, b0], [a1, b0], [a0, b1], [a1, b1]]) B('timber', a - 0.05, b - 0.05, a + 0.05, b + 0.05, 0, 1.9, 't');
        B('timber', a0, b0 - 0.03, a1, b0 + 0.03, 0.7, 0.76, 't'); B('timber', a1 - 0.03, b0, a1 + 0.03, b1, 0.7, 0.76, 't');
        const q = [W(a0 - 0.2, b0 - 0.2, 2.1), W(a1 + 0.2, b0 - 0.2, 2.1), W(a1 + 0.2, b1 + 0.2, 1.6), W(a0 - 0.2, b1 + 0.2, 1.6)], T = arr('thatch');
        T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
        for (const [a, b] of [[a0, b0], [a1, b0], [a0, b1], [a1, b1]]) col.circle(...[W(a, b, 0)[0], W(a, b, 0)[2]], 0.1, 0, 2);
      }
    }
    if (el.well) {
      const [wx, wz] = el.well, ring = lathe([[0.4, 0], [0.62, 0], [0.62, 0.55], [0.46, 0.55], [0.46, 0.2], [0.4, 0.2]], 8); ring.translate(wx, 0, wz); bag.add('granite_grey', ring);
      const A = arr('timber'), b = (a0, y0, z0, a1, y1, z1) => { quad(A, [a0, y1, z0], [a0, y1, z1], [a1, y1, z1], [a1, y1, z0]); quad(A, [a0, y0, z0], [a0, y1, z0], [a1, y1, z0], [a1, y0, z0]); quad(A, [a1, y0, z1], [a1, y1, z1], [a0, y1, z1], [a0, y0, z1]); quad(A, [a0, y0, z1], [a0, y1, z1], [a0, y1, z0], [a0, y0, z0]); quad(A, [a1, y0, z0], [a1, y1, z0], [a1, y1, z1], [a1, y0, z1]); };
      b(wx - 0.55, 0.55, wz - 0.05, wx - 0.45, 1.9, wz + 0.05); b(wx + 0.45, 0.55, wz - 0.05, wx + 0.55, 1.9, wz + 0.05); b(wx - 0.6, 1.8, wz - 0.04, wx + 0.6, 1.9, wz + 0.04);
      col.circle(wx, wz, 0.66, 0, 0.6);
    }
  }
}

/**
 * The people and small things of the outer houses (style life): in the rooms (stools at the table, the pot on the stove, a vat, the household
 * seated or at work) and in the yards (firewood, a rain tub, a wash pole, drying trays, hens, a pig in the pen, a haystack).
 */
export function outerLife(lots) {
  const out = [], CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_ochre', 'cloth_green'];
  for (const l of lots) {
    if (!isOuter(l)) continue;
    const S = specOf(l), { L, D, thatch, vt, enter, dc, hw, farSide, ox, oz, u, v } = S, r = rng(l.seed * 13 + 5), P0 = thatch ? 0.14 : 0.28, yard = (() => { const [rx0, rz0, rx1, rz1] = l.rect, f = l.front; return ((f === 's' || f === 'n') ? rz1 - rz0 : rx1 - rx0) - D; })();
    const WC = (a, b) => [ox + u[0] * a + v[0] * b, oz + u[1] * a + v[1] * b], rotOf = (a, b) => Math.atan2(-(u[0] * a + v[0] * b), -(u[1] * a + v[1] * b));   // yaw of a local direction
    const seed = () => Math.floor(r() * 1e9), bk = D - 0.3;
    const person = (a, b, da, db, o = {}) => out.push({ t: 'figure', at: WC(a, b), y: P0, rot: rotOf(da, db), seed: seed(), dress: thatch ? 'trousers' : 'robe', cloth: pick(r, CL), cloth2: pick(r, CL), skin: r() < 0.7 ? 'skin_light' : 'skin_medium', hat: thatch ? pick(r, ['straw', 'none']) : pick(r, ['cap', 'none']), carry: 'none', ...o });
    if (enter) {
      const zA = farSide > 0 ? [dc + hw + 0.35, L - 0.3] : [0.3, dc - hw - 0.35], zB = farSide > 0 ? [0.3, dc - hw - 0.35] : [dc + hw + 0.35, L - 0.3];
      const wA = zA[1] - zA[0], wB = zB[1] - zB[0];
      if (wA >= 2.4 && D >= 6.2 && r() < 0.4) person((zA[0] + zA[1]) / 2 + 0.85, 1.5, -1, 0, { pose: 'sit', hat: 'none' });
      if (r() < 0.12) person(farSide > 0 ? dc - hw - 0.7 : dc + hw + 0.7, 1.0, 0, 1, { pose: 'stand', hat: 'none', hair: 'bun', dress: 'robe', cloth: pick(r, ['cloth_green', 'cloth_indigo', 'cloth_ochre']) });
    }
    if (yard >= 2.5 && vt === 'pen' && (enter || l.det === 0) && r() < 0.5) out.push({ t: 'animal', kind: 'pig', at: WC(farSide > 0 ? L + 1.4 : -1.4, 1.6), y: 0, rot: r() * 6.28, seed: seed(), gear: false });
    if (yard >= 2.5 && r() < 0.04) person(L * (0.3 + r() * 0.4), D + yard * 0.5, 0, 1, { pose: pick(r, ['squat', 'stand']), carry: pick(r, ['basket', 'none']), y: 0 });
    if (vt === 'shopfront' && enter && r() < 0.6) person(farSide > 0 ? dc + hw + 1.5 : Math.max(0.9, dc - hw - 1.5), 0.45, 0, -1, { pose: 'stand', hat: 'cap', cloth: 'cloth_brown' });
  }
  void FR;
  return out;
}
