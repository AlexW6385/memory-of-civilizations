// Nabataean houses of the valley (docs/settlements/petra.md §15): houses of rose ashlar standing on the slopes north and
// south of the colonnaded street, each facing it. Two kinds, by the lot's size: the room house (one vaulted-flat room
// under a timber ceiling, a doorway in a stone frame, a few window slits, a stair up the side wall to the roof) and the
// court house (a walled court with a cistern lid and an oven, the range of rooms across its back, a stair in the court to
// the roof). Walls are the stone as it was laid; a stuccoed cornice band, a parapet with crow-step corners, scuppers.
// The inside of both can be walked and is furnished (src/settlements/petra/shops.js `houseLife`, from `houseLayout`).

import { box, lathe } from '../../core/geom.js';

const A = 'sandstone_rose_ashlar', W = 'sandstone_white', PL = 'plaster', TI = 'timber', FL = 'flagstone', RD = 'stucco_red', TC = 'terracotta';
const T = 0.55, DOOR = 1.3, DOOR_H = 2.35, RISER = 0.26, TREAD = 0.25;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * The plan of a house in its own frame (u along the front from the west end, v in from the street front), from { rect,
 * seed, y, front } alone: used by the builder and by the furnishing, so that both agree.
 */
export function houseLayout(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, Wd = x1 - x0, Dp = z1 - z0, front = el.front ?? 's', y = el.y ?? 0;
  const court = Wd >= 9 && Dp >= 8.6 && rand() < 0.75;
  const tall = rand() < 0.4;
  const P = (u, v) => [x0 + u, front === 'n' ? z0 + v : z1 - v];
  const Rc = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const L = { x0, z0, x1, z1, W: Wd, D: Dp, front, y, court, tall, P, Rc, seed: el.seed || 1, rand: rng((el.seed || 1) * 7 + 3) };
  const du = (rand() * 0.5 + 0.25);
  if (court) {
    const R0 = Dp - 4.4;                                                   // the range's court-side wall begins here
    L.range = { v0: R0, h: tall ? 6.4 : 13 * RISER, hc: 3.05 };
    L.wall = { h: 3.3 };
    L.gate = { u: Math.round((Wd * (0.3 + rand() * 0.4)) * 2) / 2, w: 1.7, h: 2.9 };
    L.stair = { u0: T, u1: T + 0.95, v0: R0 - 13 * TREAD, n: 13, side: 'w' };
    L.doorIn = { u: Wd * (0.35 + rand() * 0.3), w: DOOR };
    L.court = { rect: [T, T, Wd - T, R0], cx: Wd - T - 2.2, cz: R0 * 0.5 };
    L.room = { rect: [T, R0 + T, Wd - T, Dp - T] };
    L.h = L.range.h;
  } else {
    L.h = tall ? 6.4 : 13 * RISER + 0.04;
    L.range = { v0: 0, h: L.h, hc: 3.05 };
    L.door = { u: Math.round((Wd * du) * 2) / 2 + 0.25, w: DOOR };
    L.room = { rect: [T, T, Wd - T, Dp - T] };
    L.stair = tall ? null : { u0: Wd, u1: Wd + 0.9, side: 'e', n: 13 };
  }
  return L;
}

/** A wall run: along `axis` ('u' | 'v') between a0 and a1, across it between c0 and c1, from y0 to y1, with holes [{ a0, a1, y0, y1 }]. */
function run(L, bag, C, mat, axis, a0, a1, c0, c1, y0, y1, holes = [], coll = true) {
  const put = (p0, p1, q0, q1) => {
    if (p1 - p0 < 1e-4 || q1 - q0 < 1e-4) return;
    const r = axis === 'u' ? L.Rc(p0, c0, p1, c1) : L.Rc(c0, p0, c1, p1);
    bag.add(mat, box(r[0], q0, r[1], r[2], q1, r[3]));
    if (coll) C.rect(r, q0, q1);
  };
  const hs = holes.slice().sort((a, b) => a.a0 - b.a0);
  let p = a0;
  for (const h of hs) {
    put(p, h.a0, y0, y1);
    put(h.a0, h.a1, y0, h.y0); put(h.a0, h.a1, h.y1, y1);
    p = h.a1;
  }
  put(p, a1, y0, y1);
}

/** The stone frame of a doorway or window (on the wall's outer face `v` facing out by `dir`): jambs, lintel, sill. */
function frame(L, bag, axis, c, dir, h, sill) {
  const g = (a0, a1, y0, y1, out) => {
    const r = axis === 'u' ? L.Rc(a0, c + (dir > 0 ? 0 : -out), a1, c + (dir > 0 ? out : 0)) : L.Rc(c + (dir > 0 ? 0 : -out), a0, c + (dir > 0 ? out : 0), a1);
    bag.add(W, box(r[0], y0, r[1], r[2], y1, r[3]));
  };
  const { a0, a1, y0, y1 } = h;
  g(a0 - 0.18, a0, y0, y1, 0.07); g(a1, a1 + 0.18, y0, y1, 0.07);
  g(a0 - 0.28, a1 + 0.28, y1, y1 + 0.28, 0.11);
  if (sill) g(a0 - 0.12, a1 + 0.12, y0 - 0.12, y0, 0.13);
}

/** The roof: its floor, the cornice band, the parapet with crow-step corners and a scupper, over rect r (local), at y. */
function roof(L, bag, C, r, y, opts = {}) {
  const [u0, v0, u1, v1] = r, rc = L.Rc(u0, v0, u1, v1);
  bag.add(PL, box(rc[0] + 0.05, y - 0.05, rc[1] + 0.05, rc[2] - 0.05, y + 0.02, rc[3] - 0.05));
  C.floor(rc, y + 0.02);
  // the stuccoed cornice band round the head of the wall, red on some houses (painted stucco, docs §15)
  const cb = L.Rc(u0 - 0.1, v0 - 0.1, u1 + 0.1, v1 + 0.1);
  bag.add(opts.red ? RD : PL, box(cb[0], y - 0.34, cb[1], cb[2], y - 0.1, cb[3]));
  bag.add(W, box(cb[0] - 0.04, y - 0.1, cb[1] - 0.04, cb[2] + 0.04, y, cb[3] + 0.04));
  // the parapet (0.45 m high, 0.3 thick), open where the stair comes up
  const pw = 0.3, gap = opts.gap;
  const sides = [['u', v0, v0 + pw], ['u', v1 - pw, v1], ['v', u0, u0 + pw], ['v', u1 - pw, u1]];
  for (const [ax, c0, c1] of sides) {
    const a0 = ax === 'u' ? u0 : v0 + pw, a1 = ax === 'u' ? u1 : v1 - pw;
    const holes = gap && gap.ax === ax && Math.abs(gap.c - c0) < 1 ? [{ a0: gap.a0, a1: gap.a1, y0: y, y1: y + 0.45 }] : [];
    run(L, bag, C, A, ax, a0, a1, c0, c1, y, y + 0.45, holes, false);
    // collide as a rail where the visitor could walk the roof
    const rr = ax === 'u' ? L.Rc(a0, c0, a1, c1) : L.Rc(c0, a0, c1, a1);
    if (!holes.length) C.rect(rr, y, y + 0.45);
    else { const [g0, g1] = [holes[0].a0, holes[0].a1]; for (const [p, q] of [[a0, g0], [g1, a1]]) if (q - p > 1e-3) { const r2 = ax === 'u' ? L.Rc(p, c0, q, c1) : L.Rc(c0, p, c1, q); C.rect(r2, y, y + 0.45); } }
  }
  // crow-step corners: two tiers on each corner of the parapet
  for (const [cu, cv] of [[u0, v0], [u1, v0], [u0, v1], [u1, v1]]) {
    const a = cu === u0 ? 0 : -pw, b = cv === v0 ? 0 : -pw;
    const t1 = L.Rc(cu + a, cv + b, cu + a + pw, cv + b + pw), t2 = L.Rc(cu + a + 0.05, cv + b + 0.05, cu + a + pw - 0.05, cv + b + pw - 0.05);
    bag.add(A, box(t1[0], y + 0.45, t1[1], t1[2], y + 0.68, t1[3]));
    bag.add(A, box(t2[0], y + 0.68, t2[1], t2[2], y + 0.86, t2[3]));
  }
  // a stone scupper through the parapet on the street side
  if (opts.scupper !== false) {
    const um = (u0 + u1) / 2 + (opts.su ?? 0), s = L.Rc(um - 0.12, v0 - 0.32, um + 0.12, v0 + 0.2);
    bag.add(W, box(s[0], y - 0.08, s[1], s[2], y + 0.06, s[3]));
  }
}

/** The outer stair up a house's east side (room houses) or the court stair: 13 risers of 0.26 from the ground to the roof. */
function stair(L, bag, C, u0, u1, v0, dir, y0) {
  for (let k = 1; k <= 13; k++) {
    const a = dir > 0 ? v0 + (k - 1) * TREAD : v0 - (k - 1) * TREAD + 0, r = L.Rc(u0, Math.min(a, a + dir * TREAD), u1, Math.max(a, a + dir * TREAD));
    bag.add(A, box(r[0], y0 - 0.5, r[1], r[2], y0 + k * RISER, r[3]));
    C.floor(r, y0 + k * RISER);
  }
}

/** nabataean_house: { rect, seed, y, front }. */
export function house(el, { bag, col: C }) {
  const L = houseLayout(el), { W: Wd, D, y, tall, rand } = L, y0 = y - 2.2;
  const red = rand() < 0.35, hc = L.range.hc;
  // ---------- the window and door holes
  const win = (u, ya = hc - 1.1, w = 0.55, h = 0.8) => ({ a0: u - w / 2, a1: u + w / 2, y0: y + ya, y1: y + ya + h });
  if (!L.court) {
    const d = L.door, door = { a0: d.u - d.w / 2, a1: d.u + d.w / 2, y0: y, y1: y + DOOR_H };
    const nWin = 1 + Math.floor(rand() * 2), fw = [];
    for (let i = 0; i < nWin; i++) { const u = (i + 0.5) / nWin * (Wd - 1.6) + 0.8; if (Math.abs(u - d.u) > 1.4) fw.push(win(u, 1.55, 0.6, 0.9)); }
    // the whole walls: front (with the door and ground windows), back, sides
    run(L, bag, C, A, 'u', 0, Wd, 0, T, y0, y + L.h, [door, ...fw]);
    run(L, bag, C, A, 'u', 0, Wd, L.D - T, L.D, y0, y + L.h, tall ? [win(Wd * 0.3, hc - 1.2), win(Wd * 0.7, hc - 1.2)] : [win(Wd * 0.5, 1.6, 0.5, 0.7)]);
    run(L, bag, C, A, 'v', T, L.D - T, 0, T, y0, y + L.h, [win(L.D * 0.5, 1.5, 0.5, 0.8)]);
    run(L, bag, C, A, 'v', T, L.D - T, Wd - T, Wd, y0, y + L.h, [win(L.D * 0.5, 1.5, 0.5, 0.8)]);
    frame(L, bag, 'u', 0, -1, door, false);
    for (const h of fw) frame(L, bag, 'u', 0, -1, h, true);
    // (the step before the door and the door's sill)
    { const r = L.Rc(d.u - d.w / 2 - 0.1, -0.5, d.u + d.w / 2 + 0.1, T); bag.add(A, box(r[0], y - 0.6, r[1], r[2], y + 0.08, r[3])); C.floor(r, y + 0.08); }
    // the interior: floor, timber ceiling with its beams, the roof block above
    const ri = L.room.rect, rc = L.Rc(...ri);
    bag.add(FL, box(rc[0], y - 0.3, rc[1], rc[2], y + 0.03, rc[3])); C.floor(rc, y + 0.03);
    bag.add(TI, box(rc[0], y + hc, rc[1], rc[2], y + hc + 0.12, rc[3]));
    for (let k = 1; k <= 3; k++) { const v = ri[1] + (ri[3] - ri[1]) * k / 4, r = L.Rc(ri[0], v - 0.12, ri[2], v + 0.12); bag.add(TI, box(r[0], y + hc - 0.24, r[1], r[2], y + hc, r[3])); }
    // (the walls stand up round the room's whole height; the block above the ceiling is solid)
    bag.add(A, box(rc[0], y + hc + 0.12, rc[1], rc[2], y + L.h - 0.12, rc[3])); C.rect(rc, y + hc, y + L.h);
    roof(L, bag, C, [0, 0, Wd, D], y + L.h, { red, gap: L.stair ? { ax: 'v', c: Wd - 0.3, a0: D * 0.4, a1: D * 0.4 + 1.0 } : null });
    if (tall) { // the upper storey's windows in the front and a stone balcony slab over the door
      for (const u of [Wd * 0.3, Wd * 0.7]) { const h = win(u, hc + 0.9, 0.6, 0.95), r = L.Rc(h.a0, -0.03, h.a1, 0); bag.add('opening', box(r[0], h.y0, r[1], r[2], h.y1, r[3])); frame(L, bag, 'u', 0, -1, h, true); }
    }
    if (L.stair) {
      // the stair up the east wall, from the front to the roof's gap at the back
      const sv = D * 0.4 + 1.0, vs = sv - 13 * TREAD;
      if (vs >= 0) stair(L, bag, C, Wd, Wd + 0.9, vs, 1, y);
    }
    return;
  }
  // ---------- court house
  const g = L.gate, R0 = L.range.v0, hr = L.range.h, hw = L.wall.h;
  const gate = { a0: g.u - g.w / 2, a1: g.u + g.w / 2, y0: y, y1: y + g.h };
  // the court's walls (front with the gate, the sides up to the range), their tops with the cornice and parapet
  run(L, bag, C, A, 'u', 0, Wd, 0, T, y0, y + hw, [gate]);
  run(L, bag, C, A, 'v', T, R0, 0, T, y0, y + hw);
  run(L, bag, C, A, 'v', T, R0, Wd - T, Wd, y0, y + hw);
  frame(L, bag, 'u', 0, -1, gate, false);
  { const r = L.Rc(g.u - g.w / 2 - 0.1, -0.5, g.u + g.w / 2 + 0.1, T); bag.add(A, box(r[0], y - 0.6, r[1], r[2], y + 0.08, r[3])); C.floor(r, y + 0.08); }
  // the court's floor of flagstones, the cistern's lid and mouth, the oven by the side wall
  { const r = L.Rc(T, T, Wd - T, R0); bag.add(FL, box(r[0], y - 0.3, r[1], r[2], y + 0.03, r[3])); C.floor(r, y + 0.03); }
  { const [cx, cz] = L.P(L.court.cx, L.court.cz);
    bag.add(W, lathe([[0.62, 0], [0.62, 0.16], [0.5, 0.2], [0.5, 0.26], [0.18, 0.26], [0.18, 0.12], [0.001, 0.12]], 14, null, cx, y + 0.03, cz));
    C.circle(cx, cz, 0.62, y, y + 0.26); }
  // the range across the back: its court-side wall with door and windows, the back and side walls, the room, ceiling, roof
  const door = { a0: L.doorIn.u - L.doorIn.w / 2, a1: L.doorIn.u + L.doorIn.w / 2, y0: y, y1: y + DOOR_H };
  const wins = [0.12, 0.88].map((k) => win(Wd * k, 1.5, 0.55, 0.85)).filter((h) => h.a1 < door.a0 - 0.3 || h.a0 > door.a1 + 0.3);
  run(L, bag, C, A, 'u', 0, Wd, R0, R0 + T, y0, y + hr, [door, ...wins]);
  run(L, bag, C, A, 'u', 0, Wd, D - T, D, y0, y + hr, tall ? [win(Wd * 0.25, hc - 1.2), win(Wd * 0.75, hc - 1.2)] : []);
  run(L, bag, C, A, 'v', R0 + T, D - T, 0, T, y0, y + hr, [win((R0 + D) / 2, 1.5, 0.5, 0.8)]);
  run(L, bag, C, A, 'v', R0 + T, D - T, Wd - T, Wd, y0, y + hr);
  frame(L, bag, 'u', R0, 1, door, false);
  for (const h of wins) frame(L, bag, 'u', R0, 1, h, true);
  { const rc = L.Rc(...L.room.rect);
    bag.add(FL, box(rc[0], y - 0.3, rc[1], rc[2], y + 0.03, rc[3])); C.floor(rc, y + 0.03);
    bag.add(TI, box(rc[0], y + hc, rc[1], rc[2], y + hc + 0.12, rc[3]));
    const ri = L.room.rect;
    for (let k = 1; k <= 3; k++) { const v = ri[1] + (ri[3] - ri[1]) * k / 4, r = L.Rc(ri[0], v - 0.12, ri[2], v + 0.12); bag.add(TI, box(r[0], y + hc - 0.24, r[1], r[2], y + hc, r[3])); }
    bag.add(A, box(rc[0], y + hc + 0.12, rc[1], rc[2], y + hr - 0.12, rc[3])); C.rect(rc, y + hc, y + hr); }
  // roofs: the range's, with a gap in its parapet where the stair comes up; the walls' coping
  roof(L, bag, C, [0, R0, Wd, D], y + hr, { red, gap: L.stair && !tall ? { ax: 'u', c: R0, a0: L.stair.u0, a1: L.stair.u1 } : null, scupper: false });
  // the court walls' coping: a cap on top of the walls (a roof-less parapet)
  for (const [ax, a0, a1, c0, c1] of [['u', 0, Wd, 0, T], ['v', T, R0, 0, T], ['v', T, R0, Wd - T, Wd]]) run(L, bag, C, W, ax, a0, a1, c0, c1, y + hw, y + hw + 0.16, [], false);
  if (!tall) stair(L, bag, C, L.stair.u0, L.stair.u1, L.stair.v0, 1, y);
  else { // a stair of the same kind up the other wall serves the tall range's roof: here a stone block with the water jar instead
    const r = L.Rc(Wd - T - 1.4, R0 - 1.1, Wd - T - 0.2, R0 - 0.2); bag.add(TC, lathe([[0.001, 0], [0.18, 0.06], [0.28, 0.3], [0.2, 0.5], [0.12, 0.58], [0.001, 0.58]], 10, null, (r[0] + r[2]) / 2, y + 0.03, (r[1] + r[3]) / 2));
  }
}
