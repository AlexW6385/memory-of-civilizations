// The upper floor of the houses of Conques that can be entered (docs/settlements/conques.md §1m): from the room below a timber stair of one
// straight flight rises along a side wall (the left wall, the right one in a barn-house) to a floor of boards over the whole house; the
// stair's well is edged with a rail; the walls are the ground storey's, 0.5 m of rubble, with the windows open (their sills, their shutters
// folded back against the reveal) and, in some houses, a door to a timber balcony over the lane. The room is furnished by the house's kind
// (the pilgrims' hostel's dormitory, the inn's guest chambers, the merchant's chamber, the shops' dwellings, the craftsmen's and farmers'
// lofts). Everything is drawn in the house's own frame (u along the front, v inward from it, h up) with the meshes of the house: no new
// material, no instanced shape (each piece is varied a little by a hash of its own place).
import { box, frustum, lathe, rod, fromTriangles } from '../../core/geom.js';

export const DEP = 0.5;
const hs = (a, b) => { let h = (Math.floor(a * 37.1) * 73856093) ^ (Math.floor(b * 53.3) * 19349663); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
// (the materials the tiles that hold these houses all have already: a material a tile lacked would be a draw of its own; the rest stand in for what they are not)
const MAT = { thatch: 'wood_ochre', linen: 'cloth_white', cloth_red: 'cloth_ochre', cloth_green: 'cloth_indigo', cloth_brown: 'cloth_ochre', cloth_grey: 'cloth_white', hide_white: 'cloth_white', hide_grey: 'sacking', hide_brown: 'sacking', hide_tan: 'sacking', wicker: 'wood_ochre', ivory: 'cloth_white', cloth_black: 'cloth_indigo', cloth_maroon: 'cloth_indigo' };
const mt = (m) => MAT[m] ?? m;
const rb = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true });     // a box with no top face (rails: nothing to stand on)

/** The upper floor's plan as data (the same for the style, the settlement's walks and the furnishing), or null. */
export function upPlan(l) {
  if (!l.up || (l.storeys ?? 2) < 2) return null;
  const f = l.front || 's', [x0, z0, x1, z1] = l.rect, along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const G = l.G ?? 2.7, G2 = l.G2 ?? 2.4, y = l.y, fy = y + 0.1, ceil = y + G, yc = ceil + G2;
  const hay = l.up === 'hay', R = ceil - fy, N = Math.round(R / 0.2), t = hay ? 0.2 : 0.24, rise = R / N;
  const side = hay ? 'R' : 'L', su0 = side === 'L' ? 0.5 : L - 1.5, su1 = su0 + 1.0, v0 = DEP + 0.6, vT = v0 + N * t;
  const hole = side === 'L' ? [0.5, v0 + 0.6, su1 + 0.34, vT] : [su0 - 0.34, v0 + 0.6, L - 0.5, vT];
  const r = rng(l.seed || 1), mir = r() < 0.5, hostel = !!l.hostel, shop = !!l.shop && !hostel;
  const du = hostel ? L / 2 : shop && L >= 5.3 ? (mir ? L - 4.52 : 4.52) : hay ? L / 2 : L * (0.3 + r() * 0.4);
  const nw = Math.max(1, Math.floor(L / 2.3)), win = Array.from({ length: nw }, (_, k) => (k + 0.5) * L / nw);
  const bal = !!l.bal && !hay && nw >= 2, balK = bal ? nw - 1 : -1, ub = bal ? win[balK] : null;
  const uc = side === 'L' ? hole[2] + 0.55 : hole[0] - 0.55;
  return { L, D, f, fy, ceil, yc, N, rise, t, side, su0, su1, v0, vT, hole, du, nw, win, bal, balK, ub, uc, bu: bal ? [Math.max(0.4, ub - 1.25), Math.min(L - 0.4, ub + 1.25)] : null, kind: l.up, y, G, G2, seed: l.seed || 1, hostel, shop, trade: l.trade, hk: l.homeKind };
}
/** A house's frame: (u, v) → world [x, z] (front 's' faces +z, 'n' −z, 'e' +x, 'w' −x). */
export function upMap(l) {
  const f = l.front || 's', [x0, z0, x1, z1] = l.rect;
  return (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
}
/** The walk from the lane up the stair to the upper room (world waypoints [x, z]): the door, the stair's foot and head, the aisle, the window (or the balcony). */
export function upRoute(l) {
  const P = upPlan(l), M = upMap(l), s = P.side === 'L' ? 1 : -1, m = (u) => (s > 0 ? u : P.L - u);
  const uw = P.win.filter((_, k) => k !== P.balK).sort((a, b) => Math.abs(a - P.uc) - Math.abs(b - P.uc))[0];
  const end = P.bal ? [[P.ub, 1.2], [P.ub, -0.55]] : [[uw, 1.0]];
  const pts = [[P.du, -2.0], [P.du, 1.5], [m(1.9), 1.5], [m(1.0), 1.5], [m(1.0), P.vT + 0.25], [P.uc, P.vT + 0.3], [P.uc, 1.3], ...end];
  return pts.map(([u, v]) => M(u, v));
}
/** The floor's slab round the stair's well: rectangles [u0, v0, u1, v1] of the footprint. */
export function slabPieces(P) {
  const [a, b, c, d] = P.hole, { L, D } = P, out = [[0, 0, L, b], [0, d, L, D]];
  if (a > 0.01) out.push([0, b, a, d]);
  if (c < L - 0.01) out.push([c, b, L, d]);
  return out;
}
/** Where the stair stands below, for the ground floor's furniture to keep out of (u0, v0, u1, v1). */
export function stairZone(P) {
  const R = P.ceil - P.fy, end = P.v0 + 1.8 / R * P.N * P.t + 0.3;
  return P.side === 'L' ? [P.su0 - 0.08, P.v0 - 0.15, P.su1 + 0.1, end] : [P.su0 - 0.1, P.v0 - 0.15, P.su1 + 0.08, end];
}
/** The ground storey's frame with what lies in `z` left out (the furniture is drawn through it: boxes, lathes by their place, colliders). */
export function guard(c, z) {
  const inz = (u0, v0, u1, v1) => Math.min(u0, u1) < z[2] && Math.max(u0, u1) > z[0] && Math.min(v0, v1) < z[3] && Math.max(v0, v1) > z[1];
  let hit = false;
  const bag = { add: (m, g) => { if (hit) { hit = false; return; } c.bag.add(m, g); } };
  const P = (u, v) => { if (inz(u - 0.3, v - 0.3, u + 0.3, v + 0.3)) hit = true; return c.P(u, v); };
  const B = (m, u0, v0, u1, v1, ya, yb, k = false) => { if (inz(u0, v0, u1, v1)) return; c.B(m, u0, v0, u1, v1, ya, yb, k); };
  const wz = c.R(z[0], z[1], z[2], z[3]);
  const col = { rect: (r, y0, y1) => { if (r[0] < wz[2] && r[2] > wz[0] && r[1] < wz[3] && r[3] > wz[1]) return; c.col.rect(r, y0, y1); }, floor: (...a) => c.col.floor(...a), ramp: (...a) => c.col.ramp(...a), circle: (...a) => c.col.circle(...a) };
  return { ...c, bag, P, B, col };
}

/** The upper floor of an open house, drawn into its frame c: the ceiling, the stair, the rails, the windows' reveals, the balcony, the furniture, the light. */
export function upperFloor(c, el, P, lights) {
  const { L, D, ceil, yc, fy, N, rise, t, side, su0, su1, v0, vT, hole, bal, uc } = P, F = ceil, W = L - 0.5, Bk = D - 0.5;
  const bag = { add: (m, g) => c.bag.add(mt(m), g) }, col = c.col;
  // each piece is varied a little by a hash of its own place: no two of a shape are alike (so none is drawn as an instance)
  const wv = (u, v, y) => { const p = c.P(u, v); return hs(p[0] * 1.3 + y * 2.9, p[1] * 1.7 + y); };
  const B = (m, u0, v1, u1, v2, ya, yb, k = false) => { const h = wv((u0 + u1) / 2, (v1 + v2) / 2, ya + yb), e = 0.014 * (h - 0.5); c.B(mt(m), u0, v1, u1 + e, v2 + e * 1.3, ya, yb + e * 0.8, k); };
  const vase = (m, u, v, y, r, hh) => { const p = c.P(u, v), k = 0.93 + 0.14 * wv(u, v, y); bag.add(m, lathe([[r * 0.6 * k, 0], [r * k, hh * 0.45], [r * 0.75 * k, hh * 0.85], [r * 0.55 * k, hh], [0.001, hh]], 10, null, p[0], y, p[1])); };
  const cask = (u, v, y, s = 1) => { const p = c.P(u, v), k = s * (0.94 + 0.12 * wv(u, v, y)), pr = [[0.25, 0], [0.3, 0.22], [0.31, 0.42], [0.3, 0.62], [0.25, 0.84], [0.001, 0.84]].map(([r, h]) => [r * k, h * k]);
    bag.add('timber', lathe(pr, 12, null, p[0], y, p[1])); for (const yy of [0.1, 0.7]) bag.add('iron', lathe([[0.295 * k, 0], [0.295 * k, 0.04], [0.001, 0.04]], 12, null, p[0], y + yy * k, p[1])); col.circle(p[0], p[1], 0.3 * k, y, y + 0.84 * k); };
  const rail = (a, b) => {                                         // a rail on the floor from (u, v) a to b: posts, top rail, middle rail, balusters; blocks the way. One piece, its posts placed by a hash of its place (no two rails of a shape)
    const [ua, va] = a, [ub, vb] = b, n = Math.max(1, Math.ceil(Math.hypot(ub - ua, vb - va) / 1.0)), h = 0.95 + 0.06 * wv(ua, va, F), tt = 0.04, tri = [];
    const put = (g) => { const q = g.index ? g.toNonIndexed().attributes.position.array : g.attributes.position.array; for (const x of q) tri.push(x); };
    for (let i = 0; i <= n; i++) { const f = Math.min(1, Math.max(0, i / n + (i > 0 && i < n ? 0.06 * (wv(ua + i, va, 3) - 0.5) : 0))), u = ua + (ub - ua) * f, v = va + (vb - va) * f, r = c.R(u - tt, v - tt, u + tt, v + tt); put(rb(r[0], F, r[1], r[2], F + h, r[3])); }
    for (const [yy, hh] of [[h - 0.07, 0.07], [0.45, 0.05]]) { const r = c.R(Math.min(ua, ub) - 0.03, Math.min(va, vb) - 0.03, Math.max(ua, ub) + 0.03, Math.max(va, vb) + 0.03); put(rb(r[0], F + yy, r[1], r[2], F + yy + hh, r[3])); }
    for (let i = 1; i < n * 3; i++) { const f = (i + 0.4 * (wv(ub + i, vb, 4) - 0.5)) / (n * 3), u = ua + (ub - ua) * f, v = va + (vb - va) * f, r = c.R(u - 0.02, v - 0.02, u + 0.02, v + 0.02); put(rb(r[0], F + 0.1, r[1], r[2], F + h - 0.07, r[3])); }
    bag.add('wood_dark', fromTriangles(tri));
    col.rect(c.R(Math.min(ua, ub) - 0.06, Math.min(va, vb) - 0.06, Math.max(ua, ub) + 0.06, Math.max(va, vb) + 0.06), F, F + h);
  };
  // — the floor of boards: the slab round the well (the ceiling of the room below), and the ceiling of this room on beams
  for (const q of slabPieces(P)) { const r = c.R(...q); col.floor(r, F); col.rect(r, F - 0.22, F); }
  B('timber', 0, 0, L, D, yc - 0.23, yc - 0.03);
  for (let u = 0.9; u < L - 0.5; u += 0.95) B('wood_dark', u - 0.1, DEP, u + 0.1, D - 0.5, yc - 0.46, yc - 0.23);
  // — the stair: treads let into the wall, the stringer a stepped mass on the open side, a handrail on posts; the walker's ramp runs through the treads
  const sO = side === 'L' ? su1 - 0.06 : su0, sW = side === 'L' ? su0 : su0;
  for (let k = 0; k < N; k++) {
    const top = fy + (k + 1) * rise, va = v0 + k * t, vb = va + t;
    B('timber', su0, va - 0.03, su1, vb, top - 0.06, top);
    B('wood_dark', sO, va, sO + 0.06, vb, fy, top - 0.06);
  }
  void sW;
  const hu = side === 'L' ? su1 - 0.03 : su0 + 0.03, a = c.P(hu, v0 + 0.1), b = c.P(hu, vT - 0.1);
  bag.add('wood_dark', rod([a[0], fy + rise + 0.88, a[1]], [b[0], ceil + 0.9, b[1]], 0.03, 6));
  for (const [v, y] of [[v0 + 0.1, fy + rise], [vT - 0.1, ceil]]) { const r = c.R(hu - 0.04, v - 0.04, hu + 0.04, v + 0.04); bag.add('wood_dark', box(r[0], y, r[1], r[2], y + 0.95 + 0.04 * wv(hu, v, y), r[3])); }
  col.ramp(c.R(su0, v0, su1, vT), fy + 0.5 * rise, ceil, { s: 'n', n: 's', e: 'w', w: 'e' }[c.f]);
  // — the rail round the well's open sides (front, and the long side toward the room)
  const edge = side === 'L' ? hole[2] : hole[0];
  rail([hole[0], hole[1]], [hole[2], hole[1]]);
  rail([edge, hole[1]], [edge, hole[3]]);
  // — the chimney's breast on the right wall (the flue of the hearth below), a corbel on it
  if (P.kind !== 'hay') { B('schist_rubble', L - 1.1, D / 2 - 0.6, W, D / 2 + 0.6, F, yc - 0.23, true); B('limestone_yellow', L - 1.22, D / 2 - 0.7, W - 0.5, D / 2 + 0.7, F + 1.3, F + 1.42); }
  // — the windows of the front wall seen from the room: a sill board, the shutters folded back against the reveal
  for (const [k, u] of P.win.entries()) {
    if (k === P.balK) continue;
    const w = (el.twin || el.kind === 'ashlar') && L / P.nw > 2.1 ? 0.95 : 0.55;
    B('timber', u - w / 2 - 0.08, DEP - 0.02, u + w / 2 + 0.08, DEP + 0.13, F + 0.8, F + 0.85);
    for (const s of [-1, 1]) { const e = u + s * (w / 2 + 0.02); B('timber', Math.min(e, e + s * 0.3), DEP, Math.max(e, e + s * 0.3), DEP + 0.045, F + 0.88, F + 1.5); }
  }
  // — the balcony onto the lane: a door in the front wall (its leaf folded back), the floor of boards on joists and stone corbels, a rail
  if (bal) {
    const [b0, b1] = P.bu, ub = P.ub;
    for (let u = b0 + 0.2; u < b1; u += 0.5) B('wood_dark', u - 0.06, -1.0, u + 0.06, 0.0, F - 0.3, F - 0.12);
    B('timber', b0, -1.02, b1, 0.0, F - 0.12, F);
    for (const u of [b0 + 0.3, b1 - 0.3]) B('limestone_yellow', u - 0.15, -0.8, u + 0.15, 0.0, F - 0.62, F - 0.3);
    col.floor(c.R(b0, -1.02, b1, 0), F);
    const f0 = c.R(b0, -1.02, b1, -0.96);
    rail([b0 + 0.05, -1.0], [b1 - 0.05, -1.0]); rail([b0 + 0.05, -1.0], [b0 + 0.05, -0.1]); rail([b1 - 0.05, -1.0], [b1 - 0.05, -0.1]);
    void f0;
    B('timber', ub + 0.52, DEP, ub + 0.98, DEP + 0.05, F + 0.05, F + 1.9);
    B('iron', ub + 0.52, DEP + 0.05, ub + 0.98, DEP + 0.075, F + 0.5, F + 0.57); B('iron', ub + 0.52, DEP + 0.05, ub + 0.98, DEP + 0.075, F + 1.35, F + 1.42);
  }
  // — the room, by use
  const K = { B, vase, cask, rail, F, W, Bk, L, D, uc, uA: uc + 0.5, vT, P, wv, bag, c, col };
  (KINDS[P.kind] ?? KINDS.family)(K);
  // the room is lit by a rushlight on its stand (the dormitory has two)
  for (const u of P.kind === 'hostel' ? [L * 0.3, L * 0.7] : [L * 0.55]) { const q = c.P(u, D * 0.62); lights?.push({ at: [q[0], F + 1.7, q[1]], color: '#ffb46b', intensity: 3, distance: 7 }); }
}

// ── the things of the rooms ───────────────────────────────────────────────────
const CL = ['cloth_indigo', 'cloth_ochre', 'cloth_white'];
const clOf = (K, u, v) => CL[Math.floor(K.wv(u, v, 7) * CL.length)];
/** A bed of boards with straw, a blanket over its foot, a bolster and a headboard; its head at the back (v1). */
function bed(K, u0, v0, u1, v1, cl) {
  const { B, F } = K, len = v1 - v0, c1 = cl ?? clOf(K, u0, v0);
  B('timber', u0, v0, u1, v1, F, F + 0.4, true);
  B('thatch', u0 + 0.05, v0 + 0.05, u1 - 0.05, v1 - 0.05, F + 0.4, F + 0.5);
  B(c1, u0 + 0.04, v0 + 0.04, u1 - 0.04, v0 + 0.04 + len * 0.66, F + 0.5, F + 0.55);
  B('linen', u0 + 0.1, v1 - 0.5, u1 - 0.1, v1 - 0.08, F + 0.5, F + 0.62);
  B('wood_dark', u0, v1 - 0.05, u1, v1, F + 0.4, F + 0.95);
}
/** A chest with iron straps. */
function chest(K, u, v, w = 0.9, d = 0.5) {
  const { B, F } = K;
  B('wood_dark', u, v, u + w, v + d, F, F + 0.5, true);
  for (const e of [0.12, w - 0.2]) B('iron', u + e, v - 0.01, u + e + 0.08, v + d + 0.01, F + 0.5, F + 0.53);
}
function table(K, u, v, w = 0.9, d = 0.6) {
  const { B, F } = K;
  B('timber', u, v, u + w, v + d, F + 0.72, F + 0.77, true);
  for (const [a, b] of [[0.04, 0.04], [w - 0.1, 0.04], [0.04, d - 0.1], [w - 0.1, d - 0.1]]) B('wood_dark', u + a, v + b, u + a + 0.06, v + b + 0.06, F, F + 0.72);
}
const stool = (K, u, v) => K.B('timber', u, v, u + 0.32, v + 0.32, K.F, K.F + 0.42, true);
const sack = (K, u, v, m = 'sacking') => K.B(m, u, v, u + 0.5, v + 0.4, K.F, K.F + 0.55, true);
/** A cloth hung on the wall: against the back wall (face 'b'), the right ('r') or the left ('l'). */
function hang(K, face, a, b, y0, y1, cl) {
  const { B, Bk, W } = K, m = cl ?? clOf(K, a, b);
  if (face === 'b') B(m, a, Bk - 0.03, b, Bk, K.F + y0, K.F + y1); else if (face === 'r') B(m, W - 0.03, a, W, b, K.F + y0, K.F + y1); else B(m, 0.5, a, 0.53, b, K.F + y0, K.F + y1);
}
function shelf(K, u0, u1, y, n = 5, m = 'terracotta') {
  const { B, F, Bk, vase } = K;
  B('timber', u0, Bk - 0.3, u1, Bk, F + y, F + y + 0.04);
  for (let i = 0; i < n; i++) vase(i % 3 === 2 ? 'pottery_dark' : m, u0 + 0.15 + i * (u1 - u0 - 0.3) / Math.max(1, n - 1), Bk - 0.15, F + y + 0.04, 0.08, 0.17);
}
/** An upright loom on its two posts, its warp hung from the beam, the cloth woven at the foot, the weights; along v at u. */
function loom(K, u, v0, v1, cl = 'cloth_red') {
  const { B, F } = K;
  for (const v of [v0, v1 - 0.1]) B('wood_dark', u, v, u + 0.1, v + 0.1, F, F + 2.0, true);
  B('wood_dark', u - 0.03, v0, u + 0.13, v1, F + 1.95, F + 2.05); B('wood_dark', u - 0.03, v0, u + 0.13, v1, F + 0.4, F + 0.48);
  B('linen', u + 0.03, v0 + 0.1, u + 0.06, v1 - 0.1, F + 0.9, F + 1.95); B(cl, u + 0.02, v0 + 0.1, u + 0.07, v1 - 0.1, F + 0.48, F + 0.9);
  for (let v = v0 + 0.25; v < v1 - 0.2; v += 0.22) B('terracotta', u + 0.0, v, u + 0.1, v + 0.08, F + 0.48, F + 0.62);
}
const mattress = (K, u0, v0, u1, v1, cl) => {          // a pallet of straw on the boards, a blanket
  const { B, F } = K;
  B('thatch', u0, v0, u1, v1, F, F + 0.16, true); B(cl ?? clOf(K, u0, v0), u0 + 0.05, v0 + 0.05, u1 - 0.05, v0 + (v1 - v0) * 0.62, F + 0.16, F + 0.21);
  B('linen', u0 + 0.12, v1 - 0.45, u1 - 0.12, v1 - 0.06, F + 0.16, F + 0.27);
};
const hayPile = (K, u0, v0, u1, v1, h) => K.B('thatch', u0, v0, u1, v1, K.F, K.F + h, true);

// ── the kinds ─────────────────────────────────────────────────────────────────
const KINDS = {
  // an ordinary family's chamber: the parents' bed in the back corner, a child's beside it in a wide house, a chest, a shelf of pots, clothes on the wall
  family(K) {
    const { W, Bk, L, F, uA } = K;
    bed(K, W - 1.05, Bk - 2.0, W, Bk);
    if (L >= 7.2) bed(K, W - 2.2, Bk - 1.75, W - 1.2, Bk);
    chest(K, 0.55, Bk - 0.55, 0.9, 0.5); shelf(K, 0.55, 1.5, 1.4, 3);
    if (L >= 6) { hang(K, 'b', uA + 0.3, uA + 1.0, 0.7, 1.7, 'cloth_brown'); hang(K, 'b', uA + 1.15, uA + 1.8, 0.7, 1.6, 'cloth_grey'); }
    if (K.P.balK !== 1 && K.P.nw > 1) { const u = K.P.win[1]; table(K, u - 0.4, 0.55, 0.8, 0.5); stool(K, u - 0.16, 1.2); K.vase('terracotta', u, 0.8, F + 0.77, 0.07, 0.14); }
  },
  // the spinner's loft: a loom against the left wall at the stair's head, baskets of fleece, her bed, distaffs
  spinner(K) {
    const { W, Bk, F, vT, uA, P } = K;
    bed(K, W - 1.05, Bk - 2.0, W, Bk);
    loom(K, 0.55, vT + 0.3, Bk - 0.1, 'cloth_indigo');
    for (let i = 0; i < 3; i++) { const p = K.c.P(uA + 0.3 + i * 0.55, Bk - 0.35); K.bag.add('wicker', lathe([[0.2, 0], [0.26, 0.15], [0.3, 0.3], [0.001, 0.3]], 10, null, p[0], F, p[1])); K.B(i % 2 ? 'hide_grey' : 'hide_white', uA + 0.15 + i * 0.55, Bk - 0.5, uA + 0.45 + i * 0.55, Bk - 0.2, F + 0.3, F + 0.4); }
    stool(K, 1.2, vT + 1.0); void P;
    K.B('wood_dark', 0.5, Bk - 0.5, 0.56, Bk - 0.2, F + 0.3, F + 0.36);
  },
  // the farmer's granary: bins of grain along the back wall, sacks, a flail and a rake on the wall, a farmhand's pallet
  farmer(K) {
    const { W, Bk, F, uA, L } = K;
    for (let i = 0; i < 2; i++) { const u = uA + 0.1 + i * 1.05; if (u + 0.95 < W - 1.2 || L < 6) { K.B('timber', u, Bk - 0.95, u + 0.95, Bk, F, F + 0.75, true); K.B('thatch', u + 0.06, Bk - 0.89, u + 0.89, Bk - 0.06, F + 0.4, F + 0.7); } }
    mattress(K, W - 1.0, Bk - 1.9, W, Bk);
    for (let i = 0; i < 2; i++) sack(K, 0.55 + i * 0.6, K.Bk - 0.45);
    for (let i = 0; i < 4; i++) K.B('wood_dark', W - 0.03, 2.0 + i * 0.28, W, 2.04 + i * 0.28, F + 0.5, F + 1.9 - (i % 2) * 0.25);
  },
  // the vintner's loft: casks along the back wall, baskets of grapes, a pallet in the corner
  vintner(K) {
    const { W, Bk, F, uA, L } = K;
    for (let u = uA + 0.35; u < W - 1.3; u += 0.78) K.cask(u, Bk - 0.38, F);
    mattress(K, W - 1.0, Bk - 1.9, W, Bk);
    for (let i = 0; i < 3; i++) { const p = K.c.P(K.uc + 0.55 + i * 0.5, 0.95); K.bag.add('wicker', lathe([[0.17, 0], [0.24, 0.2], [0.27, 0.4], [0.001, 0.4]], 10, null, p[0], F, p[1])); }
    for (let i = 0; i < 4; i++) K.vase('terracotta', 0.75 + i * 0.3, Bk - 0.2, F, 0.12, 0.3);
    if (L >= 6) K.B('wood_dark', K.uA + 0.1, K.vT - 0.1, W - 1.2, K.vT, F + 0.6, F + 0.66);
  },
  // the hay loft of a barn-house: hay piled along the back and the left, a rope for the hoist, forks against the wall, a farmhand's pallet (the stair on the right)
  hay(K) {
    const { L, Bk, F, vT, uc } = K;
    hayPile(K, 0.55, Bk - 1.8, uc - 0.55, Bk, 1.15); hayPile(K, 0.55, vT + 0.5, 1.6, Bk - 1.85, 0.8);
    hayPile(K, uc + 0.5, Bk - 1.2, L - 0.5, Bk, 0.7);
    K.B('wood_dark', L / 2 - 0.05, 0.55, L / 2 + 0.05, 0.62, F + 0.1, F + 1.95);
    for (let i = 0; i < 3; i++) K.B('wood_dark', 0.52, 2.0 + i * 0.3, 0.56, 2.04 + i * 0.3, F + 0.4, F + 1.9 - (i % 2) * 0.3);
    mattress(K, 0.6, 1.0, 1.6, 2.4);
    K.B('rope_fibre', L / 2 + 0.3, 0.6, L / 2 + 0.7, 0.95, F, F + 0.16);
  },
  // the herder's cheese loft: boards of cheeses, churns, fleeces in heaps, a bed
  herder(K) {
    const { W, Bk, F, uA } = K;
    mattress(K, W - 1.0, Bk - 1.9, W, Bk);
    for (let r = 0; r < 2; r++) {
      K.B('timber', uA, Bk - 0.55, W - 1.3, Bk - 0.1, F + 0.5 + r * 0.6, F + 0.55 + r * 0.6, true);
      for (let u = uA + 0.2; u < W - 1.5; u += 0.34) { const p = K.c.P(u, Bk - 0.32), k = 0.9 + 0.2 * K.wv(u, r, 3); K.bag.add('hide_white', lathe([[0.001, 0], [0.16 * k, 0], [0.17 * k, 0.04], [0.15 * k, 0.1], [0.001, 0.1]], 9, null, p[0], F + 0.55 + r * 0.6, p[1])); }
    }
    for (let i = 0; i < 2; i++) { const p = K.c.P(0.85 + i * 0.5, K.Bk - 0.3); K.bag.add('wood_dark', lathe([[0.17, 0], [0.19, 0.1], [0.15, 0.85], [0.001, 0.85]], 10, null, p[0], F, p[1])); K.col.circle(p[0], p[1], 0.19, F, F + 0.85); }
    K.B(K.wv(1, 1, 1) > 0.5 ? 'hide_white' : 'hide_grey', 1.2, K.vT + 0.95, 1.8, K.vT + 1.35, F, F + 0.3, true);
  },
  // the fisher's net loft: nets hung from the beams and spread on the wall, creels, fish drying on a line, a bed
  fisher(K) {
    const { W, Bk, F, uA, L } = K;
    mattress(K, W - 1.0, Bk - 1.9, W, Bk);
    K.B('rope_fibre', uA, Bk - 0.04, W - 1.2, Bk, F + 0.3, F + 2.0); for (let u = uA + 0.1; u < W - 1.3; u += 0.3) K.B('wood_ochre', u, Bk - 0.07, u + 0.09, Bk, F + 2.0, F + 2.07);
    for (let i = 0; i < 3; i++) { const p = K.c.P(uA + 0.3 + i * 0.55, Bk - 0.5); K.bag.add('wicker', lathe([[0.2, 0], [0.24, 0.2], [0.17, 0.4], [0.001, 0.4]], 10, null, p[0], F, p[1])); K.col.circle(p[0], p[1], 0.22, F, F + 0.4); }
    const a = K.c.P(uA, K.vT + 1.0), b = K.c.P(W - 1.4, K.vT + 1.0); K.bag.add('wood_dark', rod([a[0], F + 1.9, a[1]], [b[0], F + 1.9, b[1]], 0.02, 5));
    for (let u = uA + 0.2; u < W - 1.5; u += 0.3) { const q = K.c.P(u, K.vT + 1.0), k = 0.9 + 0.2 * K.wv(u, 2, 2); K.bag.add('hide_grey', lathe([[0.001, 0], [0.03 * k, 0.03], [0.045 * k, 0.11], [0.022 * k, 0.2], [0.001, 0.23 * k]], 6, null, q[0], F + 1.67, q[1])); }
    if (L >= 6) chest(K, 0.55, Bk - 0.55, 0.9, 0.5);
  },
  // the merchant's chamber: a great bed with posts, a strongbox, a writing table with a balance, bales of cloth, hangings on the wall
  merchant(K) {
    const { W, Bk, F, uA, L } = K;
    const u0 = W - 1.35;
    K.B('wood_dark', u0, Bk - 2.15, W, Bk, F, F + 0.45, true); K.B('thatch', u0 + 0.05, Bk - 2.1, W - 0.05, Bk - 0.05, F + 0.45, F + 0.56); K.B('cloth_red', u0 + 0.04, Bk - 2.06, W - 0.04, Bk - 0.7, F + 0.56, F + 0.62);
    K.B('linen', u0 + 0.12, Bk - 0.58, W - 0.12, Bk - 0.1, F + 0.56, F + 0.7); K.B('wood_dark', u0, Bk - 0.05, W, Bk, F + 0.45, F + 1.2);
    for (const u of [u0, W - 0.09]) K.B('wood_dark', u, Bk - 2.15, u + 0.09, Bk - 2.06, F + 0.45, F + 1.5);
    chest(K, 0.55, Bk - 0.6, 1.0, 0.55);
    if (L >= 6) { table(K, uA + 0.1, Bk - 0.7, 1.1, 0.6); K.B('linen', uA + 0.25, Bk - 0.6, uA + 0.65, Bk - 0.2, F + 0.77, F + 0.8); K.B('iron', uA + 0.8, Bk - 0.5, uA + 1.0, Bk - 0.4, F + 0.77, F + 0.93); stool(K, uA + 0.45, Bk - 1.25); }
    for (let i = 0; i < 3; i++) K.B(['cloth_indigo', 'cloth_red', 'cloth_green'][i], 0.55 + (i % 2) * 0.05, K.vT + 0.55 + i * 0.0, 1.35, K.vT + 0.95, F + i * 0.28, F + 0.26 + i * 0.28, true);
    hang(K, 'b', uA + 0.1, uA + 1.0, 0.8, 1.9, 'cloth_indigo'); hang(K, 'r', D(K) / 2 - 1.8, D(K) / 2 - 0.8, 0.9, 1.9, 'cloth_red');
  },
  // the inn's guest chambers: beds in a row against the back wall, chests at their feet, a washstand, clothes on the pegs
  inn(K) {
    const { W, Bk, F, uA } = K;
    let n = 0;
    for (let u = W - 1.05; u >= uA - 0.01 && n < 3; u -= 1.15, n++) bed(K, u, Bk - 2.0, u + 1.05, Bk);
    chest(K, W - 1.0, Bk - 2.55, 0.8, 0.45);
    if (n < 2) chest(K, 0.55, Bk - 0.55, 0.9, 0.5);
    table(K, 0.6, K.vT + 0.95, 0.55, 0.45); K.vase('pottery_dark', 0.88, K.vT + 1.17, F + 0.77, 0.16, 0.1); K.vase('terracotta', 1.1, K.vT + 1.05, F + 0.77, 0.07, 0.2);
    for (let i = 0; i < 3; i++) K.B(['cloth_brown', 'cloth_grey', 'cloth_ochre'][i], W - 0.03, 1.4 + i * 0.7, W, 1.9 + i * 0.7, F + 0.9, F + 1.75);
  },
  // the pilgrims' dormitory: a row of straw pallets along the back wall with their packs at the head, a bench by the windows, cloaks on pegs
  hostel(K) {
    const { W, Bk, F, uA, L } = K;
    let n = 0;
    for (let u = uA; u + 1.0 <= W - 1.3; u += 1.18, n++) { mattress(K, u, Bk - 2.0, u + 1.0, Bk); sack(K, u + 0.25, Bk - 2.45, n % 2 ? 'sacking' : 'hide_brown'); }
    for (let i = 0; i < 3; i++) for (const [a, b] of [[0.7, 1.4]]) K.B(['cloth_brown', 'cloth_grey', 'cloth_ochre'][i], W - 0.03, 1.0 + i * 1.5 + a - 0.7, W, 1.0 + i * 1.5 + b, F + 0.8, F + 1.75);
    for (const u of [P2(K, 1), P2(K, 3)]) if (u !== null) { K.B('timber', u - 0.9, 0.55, u + 0.9, 0.9, F + 0.4, F + 0.45, true); for (const e of [-0.8, 0.8]) K.B('wood_dark', u + e - 0.04, 0.6, u + e + 0.04, 0.85, F, F + 0.4); }
    void L;
  },
  // the dwelling over a shop: the master's bed and chest, and the store of the trade in the rest
  shop(K) {
    const { W, Bk, F, uA, P, L } = K;
    bed(K, W - 1.05, Bk - 2.0, W, Bk); chest(K, 0.55, Bk - 0.55, 0.9, 0.5);
    const T = P.trade;
    if (T === 'staffs' || T === 'shells') { for (let i = 0; i < 9; i++) { const u = uA + 0.1 + i * 0.16, a = K.c.P(u, Bk - 0.2 - (i % 2) * 0.05), h = 1.65 + 0.1 * (i % 3); K.bag.add('wood_ochre', rod([a[0], F, a[1]], [a[0], F + h, a[1]], 0.025, 5)); } K.B('timber', uA, Bk - 0.35, uA + 1.5, Bk - 0.1, F + 0.4, F + 0.44); }
    else if (T === 'cloth' || T === 'weaver') { const cs = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green']; for (let i = 0; i < 4; i++) K.B(cs[i], uA + 0.1 + (i % 2) * 0.5, Bk - 0.75 + 0.1 * (i % 2), uA + 0.55 + (i % 2) * 0.5, Bk - 0.1, F + Math.floor(i / 2) * 0.3, F + 0.28 + Math.floor(i / 2) * 0.3, true); }
    else if (T === 'pots') { K.B('timber', uA, Bk - 0.4, uA + 1.7, Bk, F + 0.6, F + 0.65, true); for (let i = 0; i < 5; i++) K.vase(i % 2 ? 'terracotta' : 'pottery_dark', uA + 0.2 + i * 0.32, Bk - 0.2, F + 0.65, 0.1, 0.22); for (let i = 0; i < 3; i++) K.vase('terracotta', uA + 0.2 + i * 0.4, Bk - 0.2, F, 0.16, 0.4); }
    else if (T === 'smith') { for (let i = 0; i < 5; i++) K.B('iron', uA + 0.1, Bk - 0.5 + 0.0, uA + 1.3 + (i % 2) * 0.1, Bk - 0.42, F + i * 0.07, F + 0.07 + i * 0.07, true); sack(K, uA + 1.5, Bk - 0.45, 'hide_brown'); }
    else { for (let i = 0; i < 4; i++) sack(K, uA + 0.1 + (i % 2) * 0.55, Bk - 0.45 - Math.floor(i / 2) * 0.0 - 0.0 * i, 'sacking'); if (T === 'bread') K.B('timber', uA + 1.2, Bk - 0.8, uA + 2.0, Bk - 0.1, F, F + 0.5, true); }
    void L;
  },
};
const D = (K) => K.D;
/** The x of the n-th window of the front wall that is not the balcony's door, or null. */
const P2 = (K, n) => { const w = K.P.win.filter((_, k) => k !== K.P.balK); return w[n] !== undefined && w[n] > K.uc + 0.9 ? w[n] : null; };
