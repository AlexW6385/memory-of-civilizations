// The upper storeys of the houses that can be entered (docs/settlements/florence.md §15): a visitor climbs the
// straight steep stair of the house (about a metre wide, one flight above the other along the left wall, as
// the town houses of the quattrocento had it) and walks the floors above: the walls with the street windows cut
// through as open reveals, the floors with the stair's well left open and railed, the ceilings on their beams,
// and each floor furnished by the use of the house: sala and camera of a merchant's house, the guests' beds of
// the osteria, the family's one room of a tenement, the dwelling above a shop, the workroom and the stock of a
// craftsman, the kitchen at the top. The first floor of the centre bay may have a balcony on corbels to step on.
// Frame as casa-open.js: u along the front from the right-hand corner, v inward; floors at ys[k] + 0.1.

import { box, lathe } from '../../core/geom.js';
import { Local } from './face.js';

const T = 0.4, STEP = 0.25, SU1 = 1.4;
const W = 'wood_dark', TM = 'timber', IR = 'iron', TC = 'terracotta', PW = 'plaster_white', WP = 'wood_painted';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The storey heights as casa() takes them (the first rands of the house's seed): ys[k] is the top of storey k-1. */
export function heights(el) {
  const rand = rng(el.seed || 1), n = Math.max(2, el.storeys ?? 3), ys = [0];
  for (let i = 0; i < n; i++) ys.push(ys[i] + (i === 0 ? 4.1 : 3.5 + rand() * 0.4));
  return ys;
}

/**
 * Where everything of an open house with its upper floors lies: the frame (P, R: u, v → world), the
 * floors that can be climbed, and where each flight of the stair ends (ve[k]: the v at which the flight to floor k+1 reaches it).
 */
export function layout(el) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 'n' || f === 's';
  const ys = heights(el), n = ys.length - 1, gh = ys[1];
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const N0 = Math.ceil((gh - 0.05) / STEP), ve = [T + 0.3 + N0 * STEP];
  for (let j = 1; j < n - 1; j++) ve[j] = ve[j - 1] + Math.ceil((ys[j + 1] - ys[j]) / STEP) * STEP;
  // the floors that the depth of the house lets the stair reach (a landing of a metre behind the last flight)
  let m = n - 1;
  while (m >= 1 && D - T - 1.0 < ve[m - 1]) m--;
  return { f, along, L, D, ys, n, gh, P, R, ve, m, N0, du: L / 2 };
}

/** The class of the house, for its rooms. */
export function houseClass(el, L) {
  if (el.use === 'inn') return 'inn';
  if (el.kind === 'bottega') return ['cloth', 'wine', 'bread', 'spice', 'apothecary', 'weaver'].includes(el.use) ? 'shop' : 'craft';
  return el.use === 'home' && L >= 7.5 ? 'merchant' : 'tenement';
}
/** The balcony of the first floor's middle bay, or null: its bay (ib of nb), its place along the front from the left seen from the street (uf) and from the right-hand corner (u). */
export function balconyOf(el, lay) {
  const L = lay.L, nb = Math.max(0, Math.round((L - 0.8) / 3.1));
  if (!nb || L < 5 || lay.m < 1) return null;
  const cls = houseClass(el, L);
  if (!(cls === 'inn' || cls === 'merchant' || (el.seed || 0) % 2 === 0)) return null;
  // the bay nearest the middle whose door opens into the room, not into the well of the stair
  let ib = -1;
  for (let i = 0; i < nb; i++) { const u = L - (i + 0.5) * L / nb; if (u >= SU1 + 1.0 && (ib < 0 || Math.abs(u - L / 2) < Math.abs(L - (ib + 0.5) * L / nb - L / 2))) ib = i; }
  if (ib < 0) return null;
  const uf = (ib + 0.5) * L / nb;
  return { ib, nb, uf, u: L - uf };
}
const PROG = {
  inn: [['sala', 'dorm', 'dorm'], ['dorm', 'dorm', 'store'], ['dorm', 'store', 'store']],
  merchant: [['sala', 'camera', 'study'], ['camera', 'camera', 'store'], ['kitchen', 'store', 'store']],
  tenement: [['family', 'family', 'store'], ['family', 'store', 'family'], ['family', 'store', 'store']],
  shop: [['kitchen', 'camera', 'store'], ['camera', 'dorm', 'store'], ['store', 'store', 'store']],
  craft: [['kitchen', 'camera', 'dorm'], ['work', 'dorm', 'store'], ['work', 'store', 'store']],
};

/** A sloped bar from a to b ([x, y, z]), t square. */
function bar(G, mat, a, b, t) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
  const g = box(-len / 2, -t / 2, -t / 2, len / 2, t / 2, t / 2);
  g.rotateZ(Math.asin(dy / len)); g.rotateY(-Math.atan2(dz, dx));
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  G.add(mat, g);
}

/**
 * The floors above the ground floor of an open house. c: { y, wall (the wall's material), holes (the street windows of the
 * storeys: [{ s, u0, u1, y0, y1 }] in the front's own frame, u from the left seen from the street), bal (the balcony's door: { s, u0, u1 } or null) }.
 */
export function openFloors(bag, col, el, c) {
  const Lo = layout(el), { f, L, D, ys, n, gh, P, R, ve, m, du } = Lo, y = c.y, wall = c.wall, rand = rng((el.seed || 1) ^ 0x51ed);
  const G = new Local();
  const B = (mat, u0, v0, u1, v1, ya, yb, k = 0) => { const r = R(u0, v0, u1, v1); G.box(mat, r[0], ya, r[1], r[2], yb, r[3]); if (k) col.rect(r, k === 2 ? ya : ya - 0.3, yb); };
  const FL = (k) => y + ys[k] + 0.1, CE = (k) => y + ys[k + 1] - 0.02, bot = y + gh;
  const top = y + ys[n], mTop = y + ys[m + 1];
  // ── the shell: the walls above the ground storey, to the top of the floors that are open; above them a solid mass
  const wy0 = bot - 0.02;
  B(wall, 0, D - T, L, D, wy0, mTop, 1); B(wall, 0, T, T, D - T, wy0, mTop, 1); B(wall, L - T, T, L, D - T, wy0, mTop, 1);
  // the front wall, storey by storey, with the windows cut through it
  for (let s = 1; s <= m; s++) {
    const a = s === 1 ? wy0 : y + ys[s], b = y + ys[s + 1] - (s === m ? 0.0 : 0.0);
    const hs = c.holes.filter((h) => h.s === s).map((h) => ({ u0: L - h.u1, u1: L - h.u0, y0: y + h.y0, y1: y + h.y1 })).sort((p, q) => p.u0 - q.u0);
    let u = 0;
    const piece = (u0, u1, ya, yb) => { if (u1 - u0 > 0.01 && yb - ya > 0.01) B(wall, u0, 0, u1, T, ya, yb, 1); };
    for (const h of hs) { piece(u, h.u0, a, b); piece(h.u0, h.u1, a, h.y0); piece(h.u0, h.u1, h.y1, b); u = h.u1; }
    piece(u, L, a, b);
  }
  if (m < n - 1) { B(wall, 0, 0, L, D, mTop - 0.02, top, 1); }
  // ── the floors, the ceilings, the stair, the rails
  const holeOf = (k) => (k === 1 ? [T, T, SU1, ve[0]] : [T, ve[k - 1] - (Math.ceil((ys[k] - ys[k - 1]) / STEP)) * STEP, SU1, ve[k - 1]]);
  for (let k = 1; k <= m + 1; k++) {
    const fl = k <= m ? FL(k) : mTop - 0.1, h = k <= m ? holeOf(k) : null, ya = fl - 0.1;
    // the floor of storey k (k = m + 1: the ceiling of the top floor) round the well of the flight below
    const pieces = h ? [[SU1, T, L - T, D - T], [T, T, SU1, h[1]], [T, h[3], SU1, D - T]] : [[T, T, L - T, D - T]];
    for (const p of pieces) {
      if (p[2] - p[0] < 0.05 || p[3] - p[1] < 0.05) continue;
      if (k <= m) { B(TM, p[0], p[1], p[2], p[3], ya, fl); B('cotto_floor', p[0], p[1], p[2], p[3], fl - 0.005, fl + 0.01); const r = R(p[0], p[1], p[2], p[3]); col.floor(r, fl); }
      else B(TM, p[0], p[1], p[2], p[3], mTop - 0.14, mTop - 0.02);
    }
    // the ceiling's beams under the floor above
    const cy = k <= m ? FL(k) - 0.1 : mTop - 0.14;
    for (let v = T + 0.8; v < D - T - 0.3; v += 1.7) {
      const inWell = h && v > h[1] - 0.1 && v < h[3] + 0.1;
      B(W, inWell ? SU1 : T, v - 0.09, L - T, v + 0.09, cy - 0.2, cy);
    }
  }
  // the flights: the ground flight is openGround's; from floor 1 up, treads on a side string, a handrail, posts
  const rail = (k, v0, v1, ua, ub, base) => {
    // a railing along the line u = ua from v0 to v1 (a floor's well): posts, a top rail, a collider
    for (let v = v0; v <= v1 + 0.01; v += 0.45) B(W, ua - 0.03, v - 0.03, ua + 0.03, v + 0.03, base, base + 1.0);
    B(W, ua - 0.04, v0 - 0.04, ua + 0.04, v1 + 0.04, base + 1.0, base + 1.06); B(W, ua - 0.025, v0, ua + 0.025, v1, base + 0.5, base + 0.55);
    col.rect(R(ua - 0.05, v0, ua + 0.05, v1), base - 0.1, base + 1.06);
    void k; void ub;
  };
  const flight = (j, from) => {
    // flight j climbs from floor j (j = 0: the ground, openGround's) to floor j + 1 along the left wall
    const hsj = j === 0 ? gh - 0.05 : ys[j + 1] - ys[j], N = Math.ceil(hsj / STEP), r = hsj / N, v0 = from, base = j === 0 ? y + 0.15 : FL(j);
    for (let i = 0; i < N; i++) {
      const top2 = base + (i + 1) * r;
      if (j > 0) { B(W, T, v0 + i * STEP, SU1, v0 + (i + 1) * STEP, top2 - 0.07, top2); const rr = R(T, v0 + i * STEP, SU1, v0 + (i + 1) * STEP); col.floor(rr, top2); }
    }
    // the string at the open side (u = SU1) and the handrail with its posts
    const pA = P(SU1 - 0.04, v0), pB = P(SU1 - 0.04, v0 + N * STEP);
    if (j > 0) bar(G, W, [pA[0], base, pA[1]], [pB[0], base + hsj - 0.08, pB[1]], 0.08);
    for (let i = 2; i < N - 2; i++) {
      const hh = base + (i + 1) * r, vv = v0 + i * STEP + STEP / 2, q = R(SU1 - 0.07, vv - 0.1, SU1, vv + 0.1);
      col.rect(q, hh - 0.3, hh + 1.0);
      if (i % 3 === 0) B(W, SU1 - 0.06, vv - 0.03, SU1, vv + 0.03, hh, hh + 0.95);
    }
    const hA = P(SU1 - 0.03, v0 + 2 * STEP), hB = P(SU1 - 0.03, v0 + (N - 2) * STEP);
    bar(G, W, [hA[0], base + 3 * r + 0.9, hA[1]], [hB[0], base + (N - 1) * r + 0.9, hB[1]], 0.06);
    void rand;
  };
  flight(0, T + 0.3);
  for (let j = 1; j < m; j++) flight(j, ve[j - 1]);
  // the rails round the wells of the floors (the well's front edge and its side toward the room)
  for (let k = 1; k <= m; k++) {
    const h = holeOf(k), fl = FL(k);
    rail(k, h[1] + (k === 1 ? 0.0 : 0.0), h[3] - 0.7, SU1, null, fl);
    if (k > 1) { B(W, T, h[1] - 0.03, SU1, h[1] + 0.03, fl, fl + 1.0); B(W, T, h[1] - 0.04, SU1, h[1] + 0.04, fl + 1.0, fl + 1.06); col.rect(R(T, h[1] - 0.05, SU1, h[1] + 0.05), fl - 0.1, fl + 1.06); }
  }
  // ── the rooms, by the use of the house
  const cls = houseClass(el, L), prog = PROG[cls], bal = balconyOf(el, Lo);
  for (let k = 1; k <= m; k++) {
    const fl = FL(k), ce = CE(k), row = k === m && m > 1 ? 2 : Math.min(k - 1, 2), V = k < m ? ve[k] : ve[k - 1];
    // the room's cuts along v: the first behind the stair's end, the others by the depth
    const cuts = [T], c1 = Math.max(5.0, V + 0.3), restD = D - T - c1;
    let nr = restD < 3.0 ? 1 : Math.min(3, 1 + Math.floor(restD / 6.5));
    if (restD < 3.0) cuts.push(D - T); else { cuts.push(c1); for (let i = 1; i < nr; i++) cuts.push(c1 + restD * i / nr); cuts.push(D - T); }
    const rooms = cuts.slice(0, -1).map((v0, i) => ({ v0, v1: cuts[i + 1], role: prog[row][Math.min(i, 2)], front: i === 0 }));
    for (let i = 1; i < cuts.length - 1; i++) {
      // the partition with its door at the spine
      const v = cuts[i], d0 = SU1 + 0.3, d1 = d0 + 1.0;
      B(PW, T, v - 0.1, d0 - 0.0, v + 0.1, fl, ce, 1); B(PW, d1, v - 0.1, L - T, v + 0.1, fl, ce, 1); B(PW, d0, v - 0.1, d1, v + 0.1, fl + 2.2, ce);
      B(W, d0 - 0.04, v - 0.12, d0 + 0.02, v + 0.12, fl, fl + 2.2); B(W, d1 - 0.02, v - 0.12, d1 + 0.04, v + 0.12, fl, fl + 2.2); B(W, d0 - 0.04, v - 0.12, d1 + 0.04, v + 0.12, fl + 2.2, fl + 2.3);
    }
    const lampAt = (u, v) => { const p = P(u, v); G.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.05], [0.12, 0.18], [0.001, 0.26]], 8, null, p[0], ce - 0.75, p[1])); B(IR, u - 0.005, v - 0.005, u + 0.005, v + 0.005, ce - 0.5, ce - 0.2); };
    for (const rm of rooms) {
      const r2 = rng(((el.seed || 1) * 31 + k * 7 + Math.round(rm.v0 * 10)) >>> 0);
      const uA = rm.front || rm.v0 < V + 0.2 ? SU1 + 1.4 : T + 0.1, uB = L - T - 0.05;
      const vA = rm.v0 + (rm.front ? 0.0 : 0.15) + 0.05, vB = Math.min(rm.v1 - (rm.v1 < D - T - 0.1 ? 0.15 : 0.0), rm.front ? rm.v0 + 8.0 : rm.v1);
      if (uB - uA < 1.2 || vB - vA < 1.4) continue;
      furnish(bag, G, col, { keep: k === 1 && rm.front && bal ? { u0: SU1 + 0.2, u1: bal.u + 0.95, v1: 1.7 } : null, role: rm.role, trade: el.use, B, P, R, fl, ce, uA, uB, vA, vB, vEnd: rm.v1, r: r2, window: rm.front, ceil: ce });
      lampAt((uA + uB) / 2, (vA + vB) / 2);
    }
  }
  G.emit(bag);
}

// ── the furniture of the rooms
function furnish(bag, G, col, o) {
  const { role, trade, P, fl, ce, uA, uB, vA, vB, r, keep } = o, wd = uB - uA, dp = vB - vA;
  // (nothing stands in the way to the balcony's door)
  const inKeep = (u0, v0, u1, v1) => keep && u1 > keep.u0 && u0 < keep.u1 && v0 < keep.v1;
  const B = (mat, u0, v0, u1, v1, ya, yb, k) => { if (yb < fl + 2.0 && inKeep(Math.min(u0, u1), Math.min(v0, v1), Math.max(u0, u1), Math.max(v0, v1))) return; o.B(mat, u0, v0, u1, v1, ya, yb, k); };
  const lathe1 = (mat, pr, seg, u, v, yy) => { if (yy < fl + 2.0 && inKeep(u - 0.4, v - 0.4, u + 0.4, v + 0.4)) return; const p = P(u, v); G.add(mat, lathe(pr, seg, null, p[0], yy, p[1])); };
  const jar = (mat, u, v, yy, rr = 0.07, hh = 0.2) => lathe1(mat, [[rr * 0.6, 0], [rr, hh * 0.4], [rr * 0.7, hh * 0.85], [rr * 0.4, hh], [0.001, hh]], 7, u, v, yy);
  const barrel = (u, v, rr = 0.33, hh = 0.7, yy = fl) => { lathe1(TM, [[rr * 0.85, 0], [rr, hh * 0.45], [rr * 0.85, hh], [0.001, hh]], 8, u, v, yy); if (inKeep(u - rr, v - rr, u + rr, v + rr)) return; const p = P(u, v); col.circle(p[0], p[1], rr, yy, yy + hh); };
  const sack = (u, v, yy = fl) => lathe1('sacking', [[0.001, 0], [0.2, 0.01], [0.22, 0.25], [0.13, 0.45], [0.001, 0.48]], 7, u, v, yy);
  const stool = (u, v) => B(TM, u - 0.17, v - 0.17, u + 0.17, v + 0.17, fl + 0.4, fl + 0.45), leg4 = (u0, v0, u1, v1, hh, mat = W) => { for (const a of [u0 + 0.04, u1 - 0.04]) for (const b of [v0 + 0.04, v1 - 0.04]) B(mat, a - 0.035, b - 0.035, a + 0.035, b + 0.035, fl, fl + hh); };
  const stoolS = (u, v) => { stool(u, v); leg4(u - 0.17, v - 0.17, u + 0.17, v + 0.17, 0.4, TM); };
  const table = (u, v, w, d, hh = 0.78) => { B(W, u - w / 2, v - d / 2, u + w / 2, v + d / 2, fl + hh - 0.06, fl + hh, 2); leg4(u - w / 2, v - d / 2, u + w / 2, v + d / 2, hh - 0.06); };
  const chest = (u0, v0, u1, v1, mat = WP) => { B(mat, u0, v0, u1, v1, fl, fl + 0.55, 2); B(TM, u0 - 0.02, v0 - 0.02, u1 + 0.02, v1 + 0.02, fl + 0.55, fl + 0.6); B('gilt_bronze', u0 + 0.05, v0 - 0.005, u1 - 0.05, v0 + 0.005, fl + 0.3, fl + 0.4); };
  const shelf = (u0, v0, u1, v1, rows, mat = W) => { B(mat, u0, v0, u0 + 0.04, v1, fl, fl + 0.2 + rows * 0.42, 1); B(mat, u1 - 0.04, v0, u1, v1, fl, fl + 0.2 + rows * 0.42); for (let k = 0; k < rows; k++) B(mat, u0, v0, u1, v1, fl + 0.3 + k * 0.42, fl + 0.34 + k * 0.42); };
  const cupboard = (u0, v0, u1, v1, hh = 1.9) => { B(W, u0, v0, u1, v1, fl, fl + hh, 2); for (const h of [0.55, 1.0, 1.45]) B(WP, u0, v0, u0 + 0.01, v1, fl + h, fl + h + 0.03); };
  const bed = (u0, v0, u1, v1, canopy) => {
    // the head toward the back (v1)
    B(W, u0, v0, u1, v1, fl, fl + 0.45, 2); B(PW, u0 + 0.05, v0 + 0.05, u1 - 0.05, v1 - 0.05, fl + 0.45, fl + 0.56);
    B(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre'][Math.floor(r() * 4)], u0 + 0.05, v0 + 0.05, u1 - 0.05, v0 + (v1 - v0) * 0.62, fl + 0.56, fl + 0.62); B(PW, u0 + 0.15, v1 - 0.5, u1 - 0.15, v1 - 0.1, fl + 0.56, fl + 0.7);
    if (canopy) { for (const a of [u0, u1 - 0.06]) for (const b of [v0, v1 - 0.06]) B(W, a, b, a + 0.06, b + 0.06, fl, fl + 1.95); B('cloth_red', u0, v0, u1, v0 + 0.02, fl + 1.3, fl + 1.95); B(W, u0, v0, u1, v1, fl + 1.95, fl + 2.0); B('cloth_red', u0, v1 - 0.02, u1, v1, fl + 1.0, fl + 1.95); }
    else B(W, u0, v1 - 0.06, u1, v1, fl, fl + 0.9);
  };
  const hearth = (u) => {
    // a hood on the back wall (the room's far end), the flue to the ceiling
    const v1 = vB + 0.1;
    B('limestone_yellow', u - 0.8, v1 - 0.7, u + 0.8, v1, fl, fl + 0.4, 1); for (const s of [-1, 1]) B('limestone_yellow', u + s * 0.8 - 0.1, v1 - 0.7, u + s * 0.8 + 0.1, v1, fl + 0.4, fl + 1.6);
    B('limestone_yellow', u - 0.9, v1 - 0.75, u + 0.9, v1, fl + 1.6, fl + 1.85); B('limestone_yellow', u - 0.6, v1 - 0.5, u + 0.6, v1, fl + 1.85, ce); B(W, u - 0.5, v1 - 0.55, u + 0.5, v1 - 0.05, fl + 0.4, fl + 0.43);
    jar(TC, u, v1 - 0.35, fl + 0.43, 0.22, 0.3); B(IR, u - 0.5, v1 - 0.6, u + 0.5, v1 - 0.57, fl + 0.43, fl + 0.46);
  };
  const cu = (uA + uB) / 2, cv = (vA + vB) / 2;
  if (role === 'sala') {
    // the great room: a long table with benches, the credenza with crockery, the cassapanca under the window, the hearth at the back
    const tl = Math.min(3.2, dp - 2.2), tw = Math.min(0.95, wd - 1.3);
    table(cu, cv, tw, tl, 0.8); for (const s of [-1, 1]) B(TM, cu + s * (tw / 2 + 0.3) - 0.13, cv - tl / 2 + 0.2, cu + s * (tw / 2 + 0.3) + 0.13, cv + tl / 2 - 0.2, fl + 0.42, fl + 0.47, 2);
    for (let k = 0; k < 3; k++) { jar(k % 2 ? TC : PW, cu - 0.1, cv - tl / 2 + 0.6 + k * (tl - 1.2) / 2, fl + 0.8, 0.08, 0.22); }
    B('cloth_red', cu - tw / 2, cv - 0.6, cu + tw / 2, cv + 0.6, fl + 0.8, fl + 0.81);
    cupboard(uB - 0.55, cv - 0.8, uB, cv + 0.8, 1.5); for (let k = 0; k < 3; k++) jar(k % 2 ? TC : PW, uB - 0.3, cv - 0.5 + k * 0.5, fl + 1.5, 0.08, 0.2);
    B(WP, uA, vA + 0.1, uA + 1.8, vA + 0.6, fl, fl + 0.5, 2); B('cloth_ochre', uA, vA + 0.1, uA + 1.8, vA + 0.6, fl + 0.5, fl + 0.54);
    if (wd > 3.4 && dp > 4) hearth(Math.min(uB - 1.1, cu + 0.4));
    chest(uB - 0.9, vA + 0.1, uB - 0.05, vA + 0.6);
  } else if (role === 'camera') {
    // the bedroom: the great bed with its curtains, a cassone at its foot, the prie-dieu, a table with a candle and a book, a spinning wheel
    const bw = Math.min(1.6, wd - 0.6), bl = 2.1;
    bed(uB - bw, vB - bl, uB, vB, true);
    chest(uB - bw + 0.1, vB - bl - 0.7, uB - 0.2, vB - bl - 0.1);
    B(W, uA, vB - 1.0, uA + 0.6, vB - 0.4, fl, fl + 1.0, 2); B(W, uA, vB - 1.0, uA + 0.6, vB - 0.9, fl + 1.0, fl + 1.7); B('gilt_bronze', uA + 0.25, vB - 0.97, uA + 0.35, vB - 0.93, fl + 1.3, fl + 1.5);
    table(uA + 0.6, cv - 0.5, 0.8, 0.7, 0.75); B(PW, uA + 0.55, cv - 0.55, uA + 0.65, cv - 0.45, fl + 0.75, fl + 0.88); B('cloth_red', uA + 0.3, cv - 0.7, uA + 0.55, cv - 0.4, fl + 0.75, fl + 0.8);
    { const p = P(uA + 0.9, vA + 0.7); G.add(W, lathe([[0.3, 0], [0.34, 0.05], [0.04, 0.7], [0.001, 0.9]], 8, null, p[0], fl, p[1])); }
    cupboard(uB - 0.5, vA + 0.1, uB, vA + 1.2, 1.7);
  } else if (role === 'dorm') {
    // the guests' or the apprentices' beds: straw pallets on frames along the wall, pegs for cloaks, a stool and a basin
    const nb = Math.max(1, Math.min(4, Math.floor(dp / 1.25)));
    for (let k = 0; k < nb; k++) { const v = vB - 0.1 - (k + 1) * 1.2; if (v < vA) break; B(W, uB - 2.0, v, uB, v + 0.9, fl, fl + 0.4, 2); B('sacking', uB - 1.95, v + 0.05, uB - 0.05, v + 0.85, fl + 0.4, fl + 0.5); B(['cloth_brown', 'cloth_brown', 'cloth_ochre'][k % 3], uB - 1.4, v + 0.05, uB - 0.05, v + 0.85, fl + 0.5, fl + 0.55); }
    for (let k = 0; k < 4 && uA + 0.3 + k * 0.3 < uB - 2.1; k++) { B(IR, uA + 0.3 + k * 0.3, vB - 0.02, uA + 0.33 + k * 0.3, vB + 0.02, fl + 1.6, fl + 1.7); B(['cloth_brown', 'cloth_brown', 'cloth_blue', 'cloth_green'][k], uA + 0.25 + k * 0.3, vB - 0.06, uA + 0.38 + k * 0.3, vB, fl + 0.7, fl + 1.65); }
    stoolS(uA + 0.5, vA + 0.5); jar(TC, uA + 0.5, vA + 0.5, fl + 0.45, 0.12, 0.1); chest(uA + 0.1, cv - 0.3, uA + 0.9, cv + 0.3, W);
  } else if (role === 'store') {
    // stores: shelves of jars along the wall, barrels and sacks, baskets; the stock of the trade
    shelf(uB - 0.5, vA + 0.1, uB, Math.min(vB - 0.1, vA + 3.2), 3);
    for (let k = 0; k < 6; k++) jar(k % 2 ? TC : 'wicker', uB - 0.27, vA + 0.3 + (k % 3) * 0.9, fl + 0.34 + Math.floor(k / 3) * 0.42, 0.1, 0.22);
    const tr = trade, goods = tr === 'cloth' || tr === 'weaver' ? 'cloth' : tr === 'wine' ? 'wine' : tr === 'bread' ? 'bread' : null;
    if (goods === 'cloth') { for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) B(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][(k + j) % 6], uA + 0.1 + k * 0.55, cv - 0.2, uA + 0.55 + k * 0.55, cv + 0.4, fl + j * 0.2, fl + j * 0.2 + 0.19, k === 0 && j === 0 ? 2 : 0); }
    else if (goods === 'wine') { for (let k = 0; k < 4; k++) barrel(uA + 0.4 + k * 0.75, vB - 0.45); for (let k = 0; k < 3; k++) barrel(uA + 0.8 + k * 0.75, vB - 0.45, 0.33, 0.6, fl + 0.7); }
    else { for (let k = 0; k < 5; k++) sack(uA + 0.35 + (k % 3) * 0.5, cv - 0.2 + Math.floor(k / 3) * 0.5); B(W, uA + 0.1, vB - 0.9, uA + 1.2, vB - 0.1, fl, fl + 0.45, 2); for (let k = 0; k < 3; k++) B('hide_brown', uA + 0.2 + k * 0.3, vB - 0.8, uA + 0.45 + k * 0.3, vB - 0.2, fl + 0.45, fl + 0.55); }
    barrel(uB - 0.5, vB - 0.45); if (dp > 3.5) { barrel(uB - 1.2, vB - 0.45); sack(uB - 0.5, vB - 1.2); }
    B(TM, uA + 0.2, cv + 0.8, uB - 1.0, cv + 0.84, fl + 2.0, fl + 2.06); for (let k = 0; uA + 0.5 + k * 0.55 < uB - 1.2; k++) B(k % 2 ? 'hide_brown' : 'cloth_ochre', uA + 0.4 + k * 0.55, cv + 0.78, uA + 0.6 + k * 0.55, cv + 0.86, fl + 1.45, fl + 2.0);
  } else if (role === 'work') {
    // the workroom of the trade: a bench with its tools under the window, the work in hand, shelves, the stock beside
    B(W, cu - 1.1, vA + 0.2, cu + 1.1, vA + 0.9, fl + 0.82, fl + 0.9, 2); for (const s of [-1, 1]) B(W, cu + s * 1.0 - 0.05, vA + 0.25, cu + s * 1.0 + 0.05, vA + 0.85, fl, fl + 0.82);
    const t2 = trade;
    if (t2 === 'smith') { B(IR, cu - 0.6, vA + 0.35, cu + 0.1, vA + 0.75, fl + 0.9, fl + 0.96); for (let k = 0; k < 6; k++) B(IR, uA + 0.2 + k * 0.3, vB - 0.1, uA + 0.23 + k * 0.3, vB, fl + 1.0, fl + 1.9); for (let k = 0; k < 3; k++) sack(uA + 0.4 + k * 0.5, vB - 0.7); }
    else if (t2 === 'goldsmith') { jar('gilt_bronze', cu, vA + 0.55, fl + 0.9, 0.06, 0.12); B('cloth_red', cu + 0.3, vA + 0.3, cu + 0.9, vA + 0.8, fl + 0.9, fl + 0.92); B(IR, uA + 0.1, vB - 0.8, uA + 0.9, vB - 0.1, fl, fl + 0.6, 2); }
    else if (t2 === 'woodwork') { for (let k = 0; k < 6; k++) B(k % 2 ? TM : WP, uA + 0.1, vB - 0.9, uA + 2.0, vB - 0.1, fl + k * 0.09, fl + k * 0.09 + 0.08); B(WP, uB - 1.3, cv - 0.4, uB - 0.2, cv + 0.4, fl, fl + 0.6, 2); }
    else if (t2 === 'leather') { for (let k = 0; k < 5; k++) B(k % 2 ? 'hide_brown' : 'hide_brown', uA + 0.3 + k * 0.5, vB - 0.1, uA + 0.7 + k * 0.5, vB, fl + 0.4, fl + 2.0); B(TM, uA + 0.1, vB - 0.16, uB - 0.2, vB - 0.1, fl + 2.0, fl + 2.06); }
    else { for (let k = 0; k < 6; k++) B(PW, uA + 0.4 + k * 0.3, cv - 0.02, uA + 0.44 + k * 0.3, cv + 0.02, fl + 1.3, fl + 2.0); B(TM, uA + 0.3, cv - 0.04, uB - 0.3, cv + 0.04, fl + 2.0, fl + 2.08); for (let k = 0; k < 4; k++) B(PW, uB - 1.1 + (k % 2) * 0.4, vB - 0.9 + Math.floor(k / 2) * 0.4, uB - 0.8 + (k % 2) * 0.4, vB - 0.6 + Math.floor(k / 2) * 0.4, fl, fl + 0.12); }
    stoolS(cu, vA + 1.3); shelf(uB - 0.45, vB - 2.4, uB, vB - 0.2, 3); chest(uA + 0.1, cv, uA + 0.9, cv + 0.6, W);
  } else if (role === 'kitchen') {
    // the kitchen: the great hearth with pots, a long table with benches, hams and pans hung from a beam, a cupboard, a water jar
    hearth(Math.max(uA + 1.0, Math.min(uB - 1.0, cu)));
    for (const [a, rr] of [[-0.45, 0.2], [0.1, 0.16], [0.5, 0.18]]) jar(IR, Math.max(uA + 1.0, Math.min(uB - 1.0, cu)) + a, vB - 0.25, fl + 0.43, rr, 0.24);
    const tw = Math.min(2.2, wd - 0.8); table(cu, cv - 0.4, tw, 0.8); for (const s of [-1, 1]) B(TM, cu - tw / 2, cv - 0.4 + s * 0.6 - 0.13, cu + tw / 2, cv - 0.4 + s * 0.6 + 0.13, fl + 0.42, fl + 0.46, 2);
    for (let k = 0; k < 3; k++) jar(k % 2 ? PW : TC, cu - 0.6 + k * 0.5, cv - 0.4, fl + 0.78, 0.07, 0.2);
    B(TM, uA + 0.2, cv + 0.6, uB - 0.3, cv + 0.66, fl + 2.1, fl + 2.16); for (let k = 0, u = uA + 0.5; u < uB - 0.5; u += 0.55, k++) { if (k % 2) B(IR, u, cv + 0.62, u + 0.3, cv + 0.64, fl + 1.55, fl + 2.1); else lathe1('hide_brown', [[0.06, 0], [0.09, 0.2], [0.05, 0.4], [0.001, 0.42]], 6, u, cv + 0.63, fl + 1.7); }
    cupboard(uB - 0.5, vA + 0.1, uB, vA + 1.4, 1.9); barrel(uA + 0.4, vA + 0.5, 0.3, 0.6);
  } else if (role === 'family') {
    // the one room of a family: the bed and the cradle, the table with stools, a hearth, a chest, a spinning wheel
    bed(uB - 1.4, vB - 2.0, uB, vB, false); B(W, uB - 1.4 - 0.7, vB - 0.8, uB - 1.4 - 0.1, vB - 0.2, fl + 0.18, fl + 0.4, 1); B(PW, uB - 1.4 - 0.65, vB - 0.75, uB - 1.4 - 0.15, vB - 0.25, fl + 0.4, fl + 0.46);
    table(cu - 0.2, cv - 0.5, 1.2, 0.75); for (const [a, b] of [[-0.8, 0], [0.8, 0], [0, -0.6]]) stoolS(cu - 0.2 + a, cv - 0.5 + b);
    jar(TC, cu - 0.3, cv - 0.5, fl + 0.78, 0.08, 0.26); if (wd > 2.6 && dp > 3.4) hearth(Math.max(uA + 1.0, cu - 0.8));
    chest(uA + 0.05, vA + 0.1, uA + 0.9, vA + 0.6, W); { const p = P(uA + 0.9, vA + 1.3); G.add(W, lathe([[0.3, 0], [0.34, 0.05], [0.04, 0.7], [0.001, 0.9]], 8, null, p[0], fl, p[1])); }
  } else if (role === 'study') {
    // the scrittoio: a writing desk with books, a book chest, a globe-less shelf of volumes, a stool
    B(W, cu - 0.8, vB - 1.0, cu + 0.8, vB - 0.3, fl + 0.74, fl + 0.8, 2); leg4(cu - 0.8, vB - 1.0, cu + 0.8, vB - 0.3, 0.74); B(W, cu - 0.8, vB - 0.35, cu + 0.8, vB - 0.3, fl + 0.8, fl + 1.1);
    for (let k = 0; k < 4; k++) B(['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre'][k], cu - 0.4 + k * 0.22, vB - 0.7, cu - 0.22 + k * 0.22, vB - 0.4, fl + 0.8, fl + 0.88);
    stoolS(cu, vB - 1.5); chest(uB - 1.3, vA + 0.2, uB - 0.1, vA + 0.8); shelf(uA, vB - 0.35, uB - 0.2, vB, 4);
    for (let k = 0; k < 5; k++) B(['cloth_red', 'cloth_blue', 'cloth_brown', 'cloth_green', 'cloth_ochre'][k], uA + 0.2 + k * 0.28, vB - 0.3, uA + 0.45 + k * 0.28, vB - 0.05, fl + 0.34, fl + 0.7);
  }
}
