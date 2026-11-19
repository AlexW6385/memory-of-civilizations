// The opened lots of the walk (openwalk.js, docs/settlements/ming-suzhou.md §26), as three elements of the style `suzhou-quarter`:
//   house_walk  the lot's closed shell, always drawn: the shared house builder's own pieces with the front (a shop's open bay, a house's
//               door, the back door of a house walked through) cut out of them, and the colliders of the walls round the room;
//   walk_far    what fills the cut where the lot is far (a plan shown beyond 45 m): one dark board, one material, one draw;
//   walk_near   what is there within 45 m (a plan shown within it): the open front (counter, doorway, posts), the room with its fittings from
//               the climbable houses' kits (rooms*.js), a house's lobby, screen wall and court, the ceiling, and the colliders of what stands in them.
// All three read the same of the shared builder (analyse): its pieces are cut, never rebuilt, so a lot's far form is the town's own.

import { fromTriangles, lathe } from '../../core/geom.js';
import { STYLES, registerStyle } from '../../core/build.js';
import './townwork.js';
import './quaywork.js';
import { Acc } from './townwork.js';
import { frameOf, layoutOf } from './uphouses.js';
import { analyse } from './openwalk.js';
import { kit, groundFit } from './rooms.js';

const BASE = STYLES['suzhou-quarter'].elements.house_jiangnan;
const SILL = 0.045;                              // the cut starts this far over the floor's top (the plinth's cap stays)
const ROOM = 6.4;                                // m: the deepest room a shop's front room is (a longer hall is walled off here)
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ── cutting a box out of triangles ───────────────────────────────────────────────────────────────────────────
const INF = 1e9;
function clipPlane(poly, k, v, keepGE) {
  const out = [], sg = keepGE ? 1 : -1;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], dp = (p[k] - v) * sg, dq = (q[k] - v) * sg;
    if (dp >= 0) out.push(p);
    if ((dp > 0 && dq < 0) || (dp < 0 && dq > 0)) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]); }
  }
  return out;
}
/** The frame of a house (a along the front, b into the lot, y) and its two maps. */
function xf(F) {
  const o = F.at(0, 0);
  return {
    to: (x, y, z) => [(x - o[0]) * F.u[0] + (z - o[1]) * F.u[1], (x - o[0]) * F.v[0] + (z - o[1]) * F.v[1], y],
    from: (a, b, y) => { const p = F.at(a, b); return [p[0], y, p[1]]; },
  };
}
/** The triangles of arr (world, flat) outside the box { a0, a1, b0, b1, y0, y1 } of the frame: the complement is six convex regions, each clipped plane by plane. */
function cutOut(arr, X, bx) {
  const regions = [[-INF, bx.a0, -INF, INF, -INF, INF], [bx.a1, INF, -INF, INF, -INF, INF], [bx.a0, bx.a1, -INF, bx.b0, -INF, INF], [bx.a0, bx.a1, bx.b1, INF, -INF, INF], [bx.a0, bx.a1, bx.b0, bx.b1, -INF, bx.y0], [bx.a0, bx.a1, bx.b0, bx.b1, bx.y1, INF]];
  const out = [];
  for (let i = 0; i < arr.length; i += 9) {
    const P = [X.to(arr[i], arr[i + 1], arr[i + 2]), X.to(arr[i + 3], arr[i + 4], arr[i + 5]), X.to(arr[i + 6], arr[i + 7], arr[i + 8])];
    const inBox = P.some((p) => p[0] > bx.a0 && p[0] < bx.a1 && p[1] > bx.b0 && p[1] < bx.b1 && p[2] > bx.y0 && p[2] < bx.y1);
    const lo = [Math.min(P[0][0], P[1][0], P[2][0]), Math.min(P[0][1], P[1][1], P[2][1]), Math.min(P[0][2], P[1][2], P[2][2])], hi = [Math.max(P[0][0], P[1][0], P[2][0]), Math.max(P[0][1], P[1][1], P[2][1]), Math.max(P[0][2], P[1][2], P[2][2])];
    if (!inBox && (hi[0] <= bx.a0 || lo[0] >= bx.a1 || hi[1] <= bx.b0 || lo[1] >= bx.b1 || hi[2] <= bx.y0 || lo[2] >= bx.y1)) { for (let k = 0; k < 9; k++) out.push(arr[i + k]); continue; }
    for (const r of regions) {
      let poly = P;
      for (let k = 0; k < 3 && poly.length >= 3; k++) {
        if (r[2 * k] > -INF) poly = clipPlane(poly, k, r[2 * k], true);
        if (poly.length >= 3 && r[2 * k + 1] < INF) poly = clipPlane(poly, k, r[2 * k + 1], false);
      }
      if (poly.length < 3) continue;
      for (let j = 1; j + 1 < poly.length; j++) {
        const A = poly[0], Bp = poly[j], C = poly[j + 1];
        const ux = Bp[0] - A[0], uy = Bp[1] - A[1], uz = Bp[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        if (nx * nx + ny * ny + nz * nz < 1e-12) continue;
        out.push(...X.from(...A), ...X.from(...Bp), ...X.from(...C));
      }
    }
  }
  return out;
}

// ── what is cut, where ───────────────────────────────────────────────────────────────────────────────────────
/** The boxes of the lot's front (and back door) taken out of the shell, in the house's frame. */
function cutsOf(el, A) {
  const { L, y0, yf } = A, cuts = [];
  if (el.wk === 'shop') {
    cuts.push({ a0: 0.252, a1: L - 0.252, b0: 0.25, b1: 1.5, y0: y0 + SILL, y1: yf - 0.955 });
    // (the 5 cm granite lip of the old front: the walker's raster takes its low faces for a wall in the doorway)
    cuts.push({ a0: 0.252, a1: L - 0.252, b0: 0.6, b1: 1.1, y0: y0 + 0.001, y1: y0 + 0.0525 });
  }
  else {
    const dc = A.dc ?? L / 2;
    cuts.push({ a0: dc - 0.473, a1: dc + 0.473, b0: 0.25, b1: 1.05, y0: y0 + SILL, y1: y0 + 2.297 });
    if (el.wk === 'house') cuts.push({ a0: dc - 0.598, a1: dc + 0.598, b0: A.vb0 - 0.4, b1: A.vb0 + 0.05, y0: y0 + SILL, y1: y0 + 2.097 });
  }
  return cuts;
}
const roomDepth = (A) => Math.min(A.vb0 - 0.25, ROOM);

// ── the shell ────────────────────────────────────────────────────────────────────────────────────────────────
function houseWalk(el, ctx) {
  const F = frameOf(el.rect, false, el.front), X = xf(F), A = analyse(el), { L, D, y0 } = A, y = el.y ?? 0;
  const cuts = cutsOf(el, A), recs = [];
  const spy = Object.create(ctx.bag);
  spy.add = (mat, g) => { recs.push([mat, g]); };
  const col = ctx.col, sc = Object.create(col), rect = (a0, b0, a1, b1) => { const p = F.at(a0, b0), q = F.at(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  // (a shop and a house walked through lose the shared builder's one collider over the whole footprint: the walls come back below, round the room)
  const drop = el.wk !== 'ajar';
  sc.rect = (r, ya, yb) => {
    const p = [F.at(0, 0), F.at(L, D)], w = Math.abs(r[2] - r[0]) * Math.abs(F.u[0]) + Math.abs(r[3] - r[1]) * Math.abs(F.u[1]);
    if (drop && w >= L - 0.02 && yb >= y0 + 3.1) { void p; return; }
    col.rect(r, ya, yb);
  };
  BASE(el, { ...ctx, bag: spy, col: sc });
  for (const [mat, g] of recs) {
    const ng = g.index ? g.toNonIndexed() : g, pos = ng.attributes.position.array;
    let hit = false;
    for (let i = 0; i < pos.length && !hit; i += 3) {
      const p = X.to(pos[i], pos[i + 1], pos[i + 2]);
      for (const c of cuts) if (p[0] > c.a0 - 1e-6 && p[0] < c.a1 + 1e-6 && p[1] > c.b0 - 1e-6 && p[1] < c.b1 + 1e-6 && p[2] > c.y0 - 1e-6 && p[2] < c.y1 + 1e-6) { hit = true; break; }
    }
    // (a piece none of whose corners lies in a cut may still cross one: a wall box has corners outside, so its extent is tested as well)
    if (!hit) {
      let lo = [INF, INF, INF], hi = [-INF, -INF, -INF];
      for (let i = 0; i < pos.length; i += 3) { const p = X.to(pos[i], pos[i + 1], pos[i + 2]); for (let k = 0; k < 3; k++) { if (p[k] < lo[k]) lo[k] = p[k]; if (p[k] > hi[k]) hi[k] = p[k]; } }
      for (const c of cuts) if (hi[0] > c.a0 && lo[0] < c.a1 && hi[1] > c.b0 && lo[1] < c.b1 && hi[2] > c.y0 && lo[2] < c.y1) { hit = true; break; }
    }
    if (!hit) { ctx.bag.add(mat, g); continue; }
    let arr = Array.from(pos);
    for (const c of cuts) arr = cutOut(arr, X, c);
    if (arr.length) ctx.bag.add(mat, fromTriangles(arr));
  }
  // the step from the street, and a house walked through has one down to its yard: in the shell's own plan, so that the walker's roof test finds a floor under the eave
  const acc = new Acc(), stepAt = (a0, a1, b0, b1, walk) => {
    const r = rect(a0, b0, a1, b1); acc.box('granite_grey', r[0], y - 0.2, r[1], r[2], y + 0.24, r[3]);
    if (walk) col.floor(r, y + 0.24);
  };
  const dcs = el.wk === 'shop' ? layoutOf(L).dc : (A.dc ?? L / 2);
  stepAt(dcs - 0.75, dcs + 0.75, 0.05, el.wk === 'shop' ? 0.62 : 0.6, el.wk !== 'ajar');
  if (el.wk === 'house') stepAt(dcs - 0.7, dcs + 0.7, A.vb0 + 0.02, A.vb0 + 0.5, true);
  acc.flush(ctx.bag);
  if (el.wk === 'ajar') return;
  // the walls round the room: both sides, the wall behind it, and for a house the front wall about its door and the wall about its back door
  const top = y0 + 3.2, bot = y - 0.4, rd = roomDepth(A);
  if (el.wk === 'shop') {
    const bk = A.kind === 'court' ? D : A.vb0 + 0.1;
    col.rect(rect(0, 0.4, 0.25, rd + 0.05), bot, top); col.rect(rect(L - 0.25, 0.4, L, rd + 0.05), bot, top);
    col.rect(rect(0, rd, L, bk), bot, top);
  } else {
    const dc = A.dc ?? L / 2, vb0 = A.vb0;
    col.rect(rect(0, 0.4, 0.25, vb0 + 0.1), bot, top); col.rect(rect(L - 0.25, 0.4, L, vb0 + 0.1), bot, top);
    col.rect(rect(0.25, 0.62, dc - 0.475, 0.95), bot, top); col.rect(rect(dc + 0.475, 0.62, L - 0.25, 0.95), bot, top);
    col.rect(rect(0.25, vb0 - 0.25, dc - 0.6, vb0 + 0.1), bot, top); col.rect(rect(dc + 0.6, vb0 - 0.25, L - 0.25, vb0 + 0.1), bot, top);
    // the yard behind a row house: its walls are drawn by the shared builder, with no collider of its own
    if (A.kind === 'row' && D - vb0 > 2.2) {
      const vy0 = vb0 + 0.2;
      col.rect(rect(0, vy0, 0.22, D), bot, y + 2.6); col.rect(rect(L - 0.22, vy0, L, D), bot, y + 2.6); col.rect(rect(0, D - 0.22, L, D), bot, y + 2.6);
    }
  }
}

// ── the far form: one dark board where the front was cut ─────────────────────────────────────────────────────
function walkFar(el, { bag }) {
  const F = frameOf(el.rect, false, el.front), A = analyse(el), { L, y0, yf } = A, acc = new Acc();
  const wr = (a0, b0, a1, b1) => { const p = F.at(a0, b0), q = F.at(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const B = (a0, b0, a1, b1, ya, yb) => { const r = wr(a0, b0, a1, b1); acc.box('wood_dark', r[0], ya, r[1], r[2], yb, r[3]); };
  if (el.wk === 'shop') B(0.25, 0.8, L - 0.25, 0.9, y0 + SILL, yf - 0.96);
  else {
    const dc = A.dc ?? L / 2;
    B(dc - 0.475, 0.68, dc + 0.475, 0.8, y0 + SILL, y0 + 2.3);
    if (el.wk === 'house') B(dc - 0.6, A.vb0 - 0.2, dc + 0.6, A.vb0 - 0.05, y0 + SILL, y0 + 2.1);
  }
  acc.flush(bag);
}

// ── the near form ────────────────────────────────────────────────────────────────────────────────────────────
function walkNear(el, { bag, col }) {
  const F = frameOf(el.rect, false, el.front), A = analyse(el), { L, y0, yf } = A, y = el.y ?? 0, acc = new Acc(), rand = rng(el.seed || 1);
  const fl = y0 + 0.04, rd = roomDepth(A);
  const W = (a, b, yy) => { const p = F.at(a, b); return [p[0], yy, p[1]]; };
  const wr = (a0, b0, a1, b1) => { const p = F.at(a0, b0), q = F.at(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const B = (a0, b0, a1, b1, ya, yb, mat) => { if (a1 - a0 < 1e-4 || b1 - b0 < 1e-4 || yb - ya < 1e-4) return; const r = wr(a0, b0, a1, b1); acc.box(mat, r[0], ya, r[1], r[2], yb, r[3]); };
  const blk = (a0, b0, a1, b1, ya, yb) => col.rect(wr(a0, b0, a1, b1), ya, yb);
  const flr = (a0, b0, a1, b1, yy) => col.floor(wr(a0, b0, a1, b1), yy);
  const put = (mat, arr) => { const t = acc.arr(mat); for (let i = 0; i < arr.length; i++) t.push(arr[i]); };
  const lat = (mat, profile, seg, a, b, yy, sx = 1, sz = 1) => {
    const p = W(a, b, yy), g = lathe(profile, seg, null, 0, 0, 0), arr = g.attributes.position.array, o = [];
    for (let i = 0; i < arr.length; i += 3) o.push(p[0] + arr[i] * sx, p[1] + arr[i + 1], p[2] + arr[i + 2] * sz);
    put(mat, o);
  };
  /** A thin leaf standing on the floor: the quad of points [a, b] ×4 in plan, from ya to yb, drawn both sides. */
  const leaf = (mat, P, ya, yb) => {
    const w = (p, yy) => W(p[0], p[1], yy);
    for (let i = 0; i < 4; i++) { const p = P[i], q = P[(i + 1) % 4]; acc.quad(mat, w(p, ya), w(q, ya), w(q, yb), w(p, yb), true); }
    acc.quad(mat, w(P[0], yb), w(P[1], yb), w(P[2], yb), w(P[3], yb), true);
  };
  const dc = el.wk === 'shop' ? layoutOf(L).dc : (A.dc ?? L / 2);
  const lay = layoutOf(L);
  const ctx = { B, F: B, latF: lat, blk, flr, put, lat, qF: () => {}, W, wr, slab: () => {}, quad4: () => {}, rand, L, D: A.D, y0, Y1: yf, Y2: yf + 2.7, lay, vb: rd + 0.25, ibB: rd, ibU: rd, S: { a0: 0.25, a1: 1.3, b0: 1.55 }, bh0: 3, use: el.use, el, wallMat: 'plaster_white', mir: false };
  const k = kit(ctx);
  // the ceiling under the roof, a floor of bricks over the cap (the steps from the street and to the yard are the shell's: its roof's eave needs a floor in its own plan)
  const ceiling = (b0, b1) => {
    B(0.25, b0, L - 0.25, b1, yf - 0.06, yf, 'timber');
    for (let a = 0.9; a < L - 0.3; a += 1.15) B(a - 0.07, b0, a + 0.07, b1, yf - 0.2, yf - 0.06, 'lacquer_chestnut');
  };
  const floorOf = (b0, b1) => { B(0.25, b0, L - 0.25, b1, fl, fl + 0.015, 'brick_grey'); flr(0.25, b0, L - 0.25, b1, fl + 0.015); };
  if (rd < A.vb0 - 0.3) B(0.25, rd, L - 0.25, rd + 0.2, fl, yf, 'plaster_white');                     // (a long hall is walled off where the room ends)

  if (el.wk === 'shop') {
    // the front: the posts of the doorway, the counter across the rest of the bay, the doorstep (as the climbable shops', upstairs.js)
    const d0 = dc - 0.6, d1 = dc + 0.6, span0 = 0.25, span1 = d0 - 0.1, sw = span1 - span0, top = yf - 0.5;
    for (const [a0, a1] of [[d0 - 0.1, d0], [d1, d1 + 0.1]]) { B(a0, 0.66, a1, 0.9, y0, top, 'lacquer_chestnut'); blk(a0, 0.66, a1, 0.9, y, y0 + 3.2); }
    B(span0, 0.7, span1, 0.84, y0, y0 + 0.95, 'timber'); B(span0, 0.6, span1, 0.9, y0 + 0.95, y0 + 1.0, 'wood_dark'); B(span0, 0.68, span1, 0.7, y0 + 0.2, y0 + 0.9, 'wood_dark');
    blk(span0, 0.6, span1, 0.9, y, y0 + 1.0);
    const npost = Math.max(0, Math.round(sw / 2.4) - 1);
    for (let q = 1; q <= npost; q++) { const a = span0 + sw * q / (npost + 1); B(a - 0.1, 0.66, a + 0.1, 0.9, y0, top, 'lacquer_chestnut'); blk(a - 0.1, 0.66, a + 0.1, 0.9, y, y0 + 3.2); }
    // (the shutters, stacked at the end post, are the shop's own: shops.js; the board over the opening is the shared builder's)
    floorOf(0.55, rd);
    ceiling(0.92, rd);
    groundFit(ctx);
  } else if (el.wk === 'ajar') {
    // a door standing ajar: the leaf swung 70° in on its hinge, the lobby, a screen wall facing the door, the court beyond it with a jar and a plant
    const hx = dc - 0.475, ang = 70 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), w = 0.9, t = 0.03;
    const P = [[hx - sa * t, 0.76 + ca * t], [hx + ca * w - sa * t, 0.76 + sa * w + ca * t], [hx + ca * w + sa * t, 0.76 + sa * w - ca * t], [hx + sa * t, 0.76 - ca * t]];
    leaf('lacquer_chestnut', P, y0 + 0.05, y0 + 2.28);
    floorOf(0.92, rd); ceiling(0.92, rd);
    const sa0 = Math.max(0.65, dc - 0.7), sa1 = Math.min(L - 0.65, dc + 0.7), sb = 2.5;
    B(sa0, sb, sa1, sb + 0.22, fl, fl + 0.4, 'granite_grey'); B(sa0 + 0.02, sb + 0.02, sa1 - 0.02, sb + 0.2, fl + 0.4, fl + 2.2, 'plaster_white');
    B(sa0 - 0.06, sb - 0.04, sa1 + 0.06, sb + 0.26, fl + 2.2, fl + 2.32, 'tile_dark'); B(sa0 + 0.22, sb - 0.012, sa1 - 0.22, sb, fl + 0.75, fl + 1.75, 'lacquer_red');
    B(sa0 + 0.2, sb - 0.016, sa1 - 0.2, sb - 0.012, fl + 0.72, fl + 0.78, 'gilt_bronze'); B(sa0 + 0.2, sb - 0.016, sa1 - 0.2, sb - 0.012, fl + 1.72, fl + 1.78, 'gilt_bronze');
    blk(sa0, sb, sa1, sb + 0.22, y, y0 + 3);
    k.lamp(dc, 1.5, y0 + 2.4);
    // the court: a stone water jar by one wall, a potted plant on a stand by the other, a bench
    const cb = Math.min(rd - 1.0, 3.7), side = dc < L / 2 ? 1 : -1, wa = side > 0 ? L - 0.65 : 0.65;
    lat('granite_grey', [[0.001, 0], [0.26, 0.02], [0.34, 0.3], [0.33, 0.6], [0.26, 0.72], [0.22, 0.72], [0.001, 0.62]], 10, wa, cb, fl + 0.015);
    const pa = side > 0 ? 0.7 : L - 0.7;
    B(pa - 0.22, cb + 0.5 - 0.22, pa + 0.22, cb + 0.5 + 0.22, fl, fl + 0.55, 'wood_dark');
    lat('pottery_dark', [[0.001, 0], [0.12, 0.01], [0.18, 0.22], [0.2, 0.3], [0.001, 0.28]], 8, pa, cb + 0.5, fl + 0.55);
    for (let q = 0; q < 5; q++) { const aa = pa + (q - 2) * 0.05, h = 0.7 + ((q * 37) % 5) * 0.08; B(aa - 0.012, cb + 0.5 - 0.012, aa + 0.012, cb + 0.5 + 0.012, fl + 0.8, fl + 0.8 + h, 'bamboo_culm'); }
    lat('papyrus', [[0.001, 0], [0.3, 0.12], [0.34, 0.3], [0.22, 0.52], [0.001, 0.6]], 8, pa, cb + 0.5, fl + 1.2);
  } else {
    // a house walked through: the door open (its leaf folded back on the inside), the hall with its table and the shrine cabinet, the kitchen at the
    // back, the back door open on a step down to the yard
    const vb0 = A.vb0;
    B(dc + 0.475, 0.94, dc + 0.51, 1.56, y0 + 0.05, y0 + 2.28, 'lacquer_chestnut');
    floorOf(0.58, rd); ceiling(0.92, rd);
    const right = (L - 0.25 - (dc + 0.55)) >= (dc - 0.55 - 0.25), s0 = right ? dc + 0.55 : 0.25, s1 = right ? L - 0.25 : dc - 0.55, wsd = s1 - s0, wall = right ? s1 : s0, dir = right ? -1 : 1;
    const aOn = (d0, d1) => (dir < 0 ? [wall - d1, wall - d0] : [wall + d0, wall + d1]);
    if (wsd >= 0.7) {
      // the hall: a table against the wall with two stools, a cabinet, a lamp
      const [t0, t1] = aOn(0.03, Math.min(0.62, wsd - 0.05)); k.table(t0, 1.35, t1, 2.35, fl, 0.76, 'lacquer_chestnut');
      k.bowl('glaze_white', (t0 + t1) / 2, 1.65, fl + 0.76, 1.1); k.jar('glaze_blue', (t0 + t1) / 2, 2.05, fl + 0.76, 0.7);
      k.stool(dir < 0 ? t0 - 0.2 : t1 + 0.2, 1.6, fl, 0.45, 0.14, false); k.stool(dir < 0 ? t0 - 0.2 : t1 + 0.2, 2.1, fl, 0.45, 0.14, false);
      const [c0, c1] = aOn(0.02, Math.min(0.5, wsd - 0.05)); k.cabinet(c0, 2.75, c1, 3.6, fl, 1.9, dir < 0 ? -1 : 1);
      k.lamp(dc, 2.2, y0 + 2.4);
      // the kitchen: the stove in the back corner with its chimney, the water jars, the firewood
      const kb = rd - 1.0, [s_0, s_1] = aOn(0.02, Math.min(1.05, wsd - 0.05)); k.stove(s_0, kb, s_1, rd - 0.05, fl);
      const [j0] = aOn(0.2, 0.3); k.jar('pottery_dark', j0, rd - 1.45, fl, 2.4); blk(j0 - 0.25, rd - 1.7, j0 + 0.25, rd - 1.2, fl, fl + 0.8);
      const [w0, w1] = aOn(0.05, Math.min(0.5, wsd - 0.1)); for (let q = 0; q < 6; q++) B(w0, rd - 2.5 + (q % 3) * 0.2, w1, rd - 2.5 + (q % 3) * 0.2 + 0.17, fl + Math.floor(q / 3) * 0.17, fl + Math.floor(q / 3) * 0.17 + 0.15, 'timber'); blk(w0, rd - 2.5, w1, rd - 1.9, fl, fl + 0.4);
    }
    // the back door: jambs, lintel, the leaf folded on the inside; the way out over the floor of the wall's thickness and down a granite step
    for (const a of [dc - 0.65, dc + 0.6]) B(a, vb0 - 0.28, a + 0.05, vb0 + 0.03, y0, y0 + 2.1, 'lacquer_chestnut');
    B(dc - 0.65, vb0 - 0.28, dc + 0.65, vb0 + 0.03, y0 + 2.1, y0 + 2.2, 'lacquer_chestnut');
    B(dc + 0.6 - 0.03, vb0 - 0.9, dc + 0.6, vb0 - 0.3, y0 + 0.05, y0 + 2.05, 'lacquer_chestnut');
    flr(dc - 0.6, rd, dc + 0.6, vb0 + 0.02, fl);
  }
  acc.flush(bag);
}

registerStyle('suzhou-quarter', {
  ...STYLES['suzhou-quarter'],
  elements: { ...STYLES['suzhou-quarter'].elements, house_walk: houseWalk, walk_far: walkFar, walk_near: walkNear, door_clear: () => {} },
});
