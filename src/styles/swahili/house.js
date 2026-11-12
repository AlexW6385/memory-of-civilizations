// The stone house of 14th-century Kilwa and Songo Mnara (docs/settlements/kilwa.md §12): raised on
// a fill above the lane, entered from the street through a porch with stone benches (baraza) into a
// sunken, stepped court; behind it the long, narrow parallel rooms — the front room, the back room
// with its wall of niches (zidaka) where imported bowls and lamps stood, the inner room and the
// latrine — under flat roofs of lime concrete on mangrove poles; the back room sometimes thatched
// with palm (makuti). Coral rag in lime, plastered; the door frames of dressed coral; the street
// wall greyed by damp at its foot, the plaster fallen here and there from the rag.

import { box, fromTriangles } from '../../core/geom.js';
import { TRADES, DUKA, frontCuts, dressFront, furnishFront, furnishBack, furnishCourt } from './front.js';
import { C, RAG, DRESSED, SMOOTH, rng, solid, slab, wall, rooms, carvedPanel, wallFace, nicheHoles, lathe8, bowl, cut, face } from './kit.js';

const ROOM = 2.25, T = 0.42;

/** swahili_house: { rect, seed, y (the ground's highest corner), low (its lowest), open (furnished inside) } — the street on the north. */
/** The facts of a house that other layers need (the door's place, its trade), as house() draws them. */
export function houseFacts(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0;
  rand(); rand(); rand();
  const doorX = x0 + T + 0.9 + rand() * Math.max(0.1, W - 2 * T - 2.8), tr = rng((el.seed || 1) * 7 + 3);
  const duka = !!el.duka, trade = duka ? DUKA[Math.floor(tr() * DUKA.length)] : TRADES[Math.floor(tr() * TRADES.length)];
  return { doorX, trade, duka, front: el.flip ? z1 : z0, out: el.flip ? 1 : -1 };
}
/** Mirror a build context about the plane z = zc (a house turned to face the other way). */
function mirrorCtx(ctx, zc) {
  const m = (z) => 2 * zc - z, mr = (r) => [r[0], m(r[3]), r[2], m(r[1])];
  const flip = (g) => {
    if (g.index) g = g.toNonIndexed();
    for (const [name, a] of Object.entries(g.attributes)) {
      if (a.itemSize !== 3) continue;
      const arr = a.array;
      for (let i = 0; i < arr.length; i += 3) { if (name === 'position') arr[i + 2] = m(arr[i + 2]); else if (name === 'normal') arr[i + 2] = -arr[i + 2]; }
      for (let i = 0; i + 8 < arr.length; i += 9) for (let k = 0; k < 3; k++) { const t = arr[i + 3 + k]; arr[i + 3 + k] = arr[i + 6 + k]; arr[i + 6 + k] = t; }
      a.needsUpdate = true;
    }
    return g;
  };
  const bag = { add: (mat, g) => g && ctx.bag.add(mat, flip(g)), addInstance: (mat, g, mx) => ctx.bag.add(mat, flip(g.clone().applyMatrix4(mx))) };
  const col = { floor: (r, y, t) => ctx.col.floor(mr(r), y, t), rect: (r, y0, y1) => ctx.col.rect(mr(r), y0, y1), circle: (x, z, r, y0, y1) => ctx.col.circle(x, m(z), r, y0, y1), segment: (a, b, th, y0, y1) => ctx.col.segment([a[0], m(a[1])], [b[0], m(b[1])], th, y0, y1), ramp: (r, y0, y1, d) => ctx.col.ramp(mr(r), y0, y1, d === 'n' ? 's' : d === 's' ? 'n' : d) };
  return { ...ctx, bag, col };
}

/** swahili_house: see below. */
export function house(el, ctx0) {
  const ctx = el.flip ? mirrorCtx(ctx0, (el.rect[1] + el.rect[3]) / 2) : ctx0;
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, low = Math.min(el.low ?? y, y) - 0.3;
  if (el.simple) {
    // the outer ring: a solid block with its street door, step and bench (nothing inside)
    solid(ctx, C, x0, low, z0, x1, y + 3.4, z1);
    const f = houseFacts(el), dx = f.doorX;
    bag.add('wood_dark', box(dx - 0.45, y + 0.05, z0 - 0.04, dx + 0.45, y + 2.1, z0));
    for (const [a, b] of [[dx - 0.62, dx - 0.45], [dx + 0.45, dx + 0.62]]) bag.add(DRESSED, box(a, y + 0.05, z0 - 0.07, b, y + 2.2, z0));
    bag.add(DRESSED, box(dx - 0.62, y + 2.1, z0 - 0.07, dx + 0.62, y + 2.2, z0));
    bag.add(DRESSED, box(x0 - 0.03, y + 3.4, z0 - 0.04, x1 + 0.03, y + 3.48, z0 + 0.4));
    solid(ctx, C, dx + 0.8, low, z0 - 0.4, dx + 2.2, y + 0.45, z0, false);
    for (const p of cut(x0, low, x1, y + 0.55, [[dx - 0.7, y, dx + 0.7, y + 3]])) bag.add('plaster_damp', box(p[0], Math.max(p[1], low), z0 - 0.012, p[2], p[3], z0));
    return;
  }
  const fl = y + 0.35, cf = y + 0.05, W = x1 - x0, mx = (x0 + x1) / 2;
  // the back row from zb, the front row's inner face at zf (small plots: one row only); the court before them
  const deep = z1 - z0 >= 9.2, zb = z1 - (ROOM + 2 * T), zf = deep ? zb - ROOM : zb + T;
  const twoStorey = rand() < 0.28, thatch = rand() < 0.3, hs = 2.7, mat = rand() < 0.6 ? SMOOTH : 'plaster_white';
  // ---- the court: its floor sunk below the rooms, the street wall with the door and the porch's benches
  slab(ctx, 'plaster_grey', [x0 + T, z0 + T, x1 - T, zf - T], low, cf);
  const doorX = x0 + T + 0.9 + rand() * Math.max(0.1, W - 2 * T - 2.8), dH = { u0: doorX - 0.5, u1: doorX + 0.5, v0: cf, v1: cf + 2.15, frame: 'grand' };
  const yC = cf + 2.7 + (rand() < 0.5 ? 0.4 : 0);
  const facts = houseFacts(el), fo = { x0, z0, x1, z1, cf, fl, doorX, rand, W, yC, trade: facts.trade, duka: facts.duka, seed: el.seed || 1 };
  const cuts = frontCuts(fo);
  wall(ctx, { axis: 'x', c: z0 + T / 2, u0: x0, u1: x1, t: T, y0: low, y1: yC, holes: [dH, ...cuts.holes], rec: cuts.rec, mat });
  for (const xx of [x0 + T / 2, x1 - T / 2]) wall(ctx, { axis: 'z', c: xx, u0: z0 + T, u1: zf, t: T, y0: low, y1: yC, mat });
  bag.add(DRESSED, box(x0 - 0.03, yC, z0 - 0.03, x1 + 0.03, yC + 0.08, z0 + T + 0.03));
  // the carved door: two leaves of dark wood, one standing open into the court; studs and a carved lintel
  bag.add('wood_dark', box(doorX - 0.5, cf, z0 + T - 0.06, doorX, cf + 2.12, z0 + T - 0.01));
  bag.add('wood_dark', box(doorX + 0.45, cf, z0 + T, doorX + 0.5, cf + 2.12, z0 + T + 0.5));
  for (let k = 0; k < 4; k++) bag.add('iron', box(doorX - 0.46 + k * 0.13, cf + 1.0, z0 + T - 0.075, doorX - 0.42 + k * 0.13, cf + 1.04, z0 + T - 0.06));
  carvedPanel(ctx, wallFace('x', z0, -1, 0), doorX - 0.75, cf + 2.55, doorX + 0.75, cf + 2.85 > yC - 0.05 ? yC - 0.05 : cf + 2.85, ['cable', 'cable', 'arcade', 'boss'][(el.seed || 0) % 4]);
  // the porch's benches (baraza) either side of the door, on the lane
  for (const s of [-1, 1]) { const a = s < 0 ? doorX - 0.75 - 1.5 : doorX + 0.75, b = a + 1.5; if (a > x0 + 0.1 && b < x1 - 0.1) { solid(ctx, mat, a, low, z0 - 0.42, b, cf + 0.42, z0); bag.add(DRESSED, box(a - 0.02, cf + 0.42, z0 - 0.45, b + 0.02, cf + 0.47, z0)); } }
  // ---- the rooms: the front room across the house, the back row of the back room and the inner room
  const frontDoor = { u0: mx - 0.5 + (rand() - 0.5) * 1.5, v0: fl, v1: fl + 2.1, frame: 'door' }; frontDoor.u1 = frontDoor.u0 + 1.0;
  const backDoor = { u0: frontDoor.u0 > mx ? x0 + 1.0 : x1 - 2.0, v0: fl, v1: fl + 2.05, frame: 'door' }; backDoor.u1 = backDoor.u0 + 0.9;
  const open = !!el.open;
  const zid = []; if (open) { const n = Math.max(3, Math.floor((W - 2 * T - 2.4) / 0.55)); for (let j = 0; j < 2; j++) for (let i = 0; i < n; i++) { const u = x0 + T + 0.3 + (i + 0.5) * (W - 2 * T - 2.6) / n; zid.push({ u0: u - 0.18, u1: u + 0.18, v0: fl + 0.9 + j * 0.75, v1: fl + 1.35 + j * 0.75, d: 0.15, side: -1, holes: nicheHoles(u, fl + 0.9 + j * 0.75, 0.36, 0.36) }); } }
  const sideNiche = (zA, zB) => [{ u0: (zA + zB) / 2 - 0.22, u1: (zA + zB) / 2 + 0.22, v0: fl + 1.0, v1: fl + 1.5, d: 0.15, side: 1, holes: nicheHoles((zA + zB) / 2, fl + 1.0, 0.44, 0.45) }];
  const front = deep
    ? rooms(ctx, { mat, rect: [x0, zf - T, x1, zb + T], along: 'x', n: 1, fl, yB: low, hs, roof: 'poles', t: T, door: 'n', holes: { n: [frontDoor], s: [backDoor] }, parapet: 0.5,
      rec: open ? { w: sideNiche(zf, zb), e: sideNiche(zf, zb).map((r) => ({ ...r, side: -1 })) } : {}, doorW: 1.0 })
    : null;
  const back = rooms(ctx, { mat, rect: [x0, zb, x1, z1], along: 'x', at: [x1 - 2.1], fl, yB: low, hs, roof: thatch && deep ? null : 'poles', t: T, door: null, cross: true, skip: deep ? ['n'] : [], parapet: thatch && deep ? 0.05 : 0.5, rec: { s: zid }, holes: deep ? {} : { n: [frontDoor] } });
  const main = front || back;
  // ---- a second storey over the front room on some houses: closed rooms with small barred windows to the street
  if (twoStorey) {
    const yU = main.yR, wins = [];
    for (let x = x0 + 1.2; x < x1 - 1; x += 2.4) wins.push({ u0: x - 0.3, u1: x + 0.3, v0: yU + 1.1, v1: yU + 1.9 });
    rooms(ctx, { mat, rect: front ? [x0, zf - T, x1, zb + T] : [x0, zb, x1, z1], along: 'x', n: 1, fl: yU + 0.01, yB: yU, hs: 2.6, roof: 'poles', t: T, door: null, floor: null, holes: { n: wins }, parapet: 0.5 });
    for (const w of wins) for (const tt of [-0.15, 0, 0.15]) bag.add('wood_dark', box((w.u0 + w.u1) / 2 + tt - 0.02, w.v0, zf - T + 0.12, (w.u0 + w.u1) / 2 + tt + 0.02, w.v1, zf - T + 0.18));
  }
  // ---- the back room thatched with palm (makuti) on some houses: a steep ridge roof over the walls
  if (thatch && deep) {
    const yR = back.yR, a = zb - 0.1, b = z1 + 0.35, h = (b - a) * 0.75, tri = [];
    const P = (x, z, yy) => [x, yy, z], m = (a + b) / 2;
    for (const [sz, zz] of [[-1, a], [1, b]]) face(tri, [0, 0.7, sz], P(x0 - 0.3, zz, yR - 0.15), P(x1 + 0.3, zz, yR - 0.15), P(x1 + 0.3, m, yR + h), P(x0 - 0.3, m, yR + h));
    for (const [sz, zz] of [[-1, a], [1, b]]) face(tri, [0, -1, -sz * 0.6], P(x0 - 0.3, zz, yR - 0.15), P(x1 + 0.3, zz, yR - 0.15), P(x1 + 0.3, m, yR + h - 0.12), P(x0 - 0.3, m, yR + h - 0.12));
    for (const xx of [x0 - 0.3, x1 + 0.3]) { face(tri, [xx < mx ? -1 : 1, 0, 0], P(xx, a, yR - 0.15), P(xx, b, yR - 0.15), P(xx, m, yR + h)); }
    bag.add('thatch_palm', fromTriangles(tri));
    // the gable ends closed with plastered coral up to the thatch
    for (const xx of [x0, x1 - T]) { const g = []; face(g, [xx < mx ? -1 : 1, 0, 0], P(xx + (xx < mx ? 0 : T), zb, yR), P(xx + (xx < mx ? 0 : T), z1, yR), P(xx + (xx < mx ? 0 : T), m, yR + h - 0.2)); face(g, [xx < mx ? 1 : -1, 0, 0], P(xx + (xx < mx ? T : 0), zb, yR), P(xx + (xx < mx ? T : 0), z1, yR), P(xx + (xx < mx ? T : 0), m, yR + h - 0.2)); bag.add(mat, fromTriangles(g)); }
    col.rect([x0, zb, x1, z1], yR, yR + h);
  }
  // ---- the street front: damp at the foot of the walls, plaster fallen from the rag in patches, spouts from the roof
  for (const p of cut(x0, low, x1, cf + 0.55, [[dH.u0 - 0.2, cf - 0.01, dH.u1 + 0.2, cf + 3]])) bag.add('plaster_damp', box(p[0], Math.max(p[1], low), z0 - 0.012, p[2], p[3], z0));
  for (const zz of [z0, zf - T]) if (zz === z0 || twoStorey) for (let k = 0; k < 2; k++) {
    if (rand() < 0.4) continue;
    const yTop = zz === z0 ? yC : main.yR + 2.9, w = 0.4 + rand() * 0.9, h = 0.3 + rand() * 0.6, xa = x0 + 0.3 + rand() * (W - w - 0.6), ya = (zz === z0 ? cf + 0.7 : main.yR + 0.4) + rand() * Math.max(0.1, yTop - h - (zz === z0 ? cf + 1.0 : main.yR + 0.6));
    if (zz === z0 && xa < dH.u1 + 0.3 && xa + w > dH.u0 - 0.3) continue;
    // the rag showing where the plaster has fallen: a ragged patch of three courses
    for (let j = 0; j < 3; j++) { const i0 = rand() * w * 0.25, i1 = rand() * w * 0.25; bag.add(RAG, box(xa + i0, ya + j * h / 3, zz - 0.018 + j * 0.002, xa + w - i1, ya + (j + 1) * h / 3, zz)); }
  }
  dressFront(ctx, fo, cuts);
  const yS = (twoStorey ? main.yR + 2.6 + 0.3 : main.yR) + 0.02;
  for (const xx of [x0 + 0.6, x1 - 0.6]) bag.add(DRESSED, box(xx - 0.07, yS, zf - T - 0.55, xx + 0.07, yS + 0.1, zf - T));
  if (!open) return;
  fo.frontDoorU = [frontDoor.u0, frontDoor.u1];
  if (front) furnishFront(ctx, fo, front.rooms[0]);
  furnishBack(ctx, fo, back.rooms[1] ?? back.rooms[0]);
  furnishCourt(ctx, fo, [x0 + T, z0 + T, x1 - T, zf - T]);
  // ---- inside: a palm mat on the front room's floor, bowls of celadon and blue-and-white in the niches,
  // a lamp; water jars and a grinding stone in the court; the peg holes of hangings along the front room's wall
  const R0 = main.rooms[0], B0 = back.rooms[0];
  bag.add('reed_mat', box(R0[0] + 0.4, fl + 0.005, R0[1] + 0.3, R0[2] - 0.4, fl + 0.022, R0[3] - 0.3));
  for (const [i, r] of zid.entries()) {
    if (rand() < 0.35) continue;
    const u = (r.u0 + r.u1) / 2, g = bowl(u, r.v0 + 0.005, z1 - T + 0.075, 0.07);
    bag.add(['glaze_green', 'glaze_blue', 'glaze_white'][i % 3], g);
  }
  bag.add('pottery_dark', lathe8((R0[0] + R0[2]) / 2 + 1, fl, R0[3] - 0.3, 0.5));
  for (let x = R0[0] + 0.3; x < R0[2] - 0.3; x += 0.42) bag.add('opening', box(x - 0.02, fl + 2.35, R0[3] - 0.003, x + 0.02, fl + 2.39, R0[3] + 0.001));
  for (let k = 0; k < 2 + Math.floor(rand() * 2); k++) bag.add('pottery_dark', lathe8(x0 + T + 0.4 + k * 0.55, cf, zf - 0.4));
  bag.add(RAG, box(x1 - T - 0.9, cf, z0 + T + 0.3, x1 - T - 0.4, cf + 0.18, z0 + T + 0.8));
  // the step up from the court to the front room
  solid(ctx, DRESSED, frontDoor.u0 - 0.1, cf - 0.02, zf - T - 0.4, frontDoor.u1 + 0.1, cf + 0.15, zf - T, false);
  void B0;
}
