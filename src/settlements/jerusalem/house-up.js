// The open courtyard house of Jerusalem about 700 with its upper storey (docs/settlements/jerusalem.md §5d): the house of
// src/styles/islamic/house.js (read-only; this is its open form, rebuilt here) with the main room's roof raised a storey into
// two upper chambers under their own flat roof, reached by the court's stone stair to the store's roof (a terrace under a
// timber loggia, with a balcony over the street where the lane is wide) and a door into the west chamber; a gallery over
// the court from the east chamber; the chambers furnished by the house's use (upstairs.js). Ground floor as the shared house's.

import { box, lathe, rod } from '../../core/geom.js';
import { furnishUpper } from './upstairs.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const L = 'limestone', CUT = 'limestone_carved';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** A slab on a vertical face: the face plane at `p` across the axis ('x': a face at x = p, its span along z; 'z': at z = p, along x), out by sg. */
function onFace(bag, mat, axis, p, sg, u0, u1, y0, y1, d0, d1) {
  if (d0 === 0) d0 = -0.03;                       // (stones set into the wall, so that their backs lie inside it)
  const a = p + sg * d0, b = p + sg * d1;
  bag.add(mat, axis === 'x' ? box(Math.min(a, b), y0, u0, Math.max(a, b), y1, u1) : box(u0, y0, Math.min(a, b), u1, y1, Math.max(a, b)));
}

/** Parapets round a roof [x0, z0, x1, z1] at `top` (the x-runs whole, the z-runs between them, so no two overlap), the roof's plaster within. */
function parapets(bag, [x0, z0, x1, z1], top, h = 0.55, t = 0.28, skip = '') {
  if (!skip.includes('n')) bag.add(L, box(x0, top, z0, x1, top + h, z0 + t));
  if (!skip.includes('s')) bag.add(L, box(x0, top, z1 - t, x1, top + h, z1));
  if (!skip.includes('w')) bag.add(L, box(x0, top, z0 + t, x0 + t, top + h, z1 - t));
  if (!skip.includes('e')) bag.add(L, box(x1 - t, top, z0 + t, x1, top + h, z1 - t));
  for (const [k, [a, b, c, d]] of Object.entries({ n: [x0, z0, x1, z0 + t], s: [x0, z1 - t, x1, z1], w: [x0, z0 + t, x0 + t, z1 - t], e: [x1 - t, z0 + t, x1, z1 - t] })) if (!skip.includes(k)) bag.add(CUT, box(a - 0.03, top + h, b - 0.03, c + 0.03, top + h + 0.08, d + 0.03));
  bag.add('lime_plaster', box(x0 + t, top, z0 + t, x1 - t, top + 0.05, z1 - t));
}
/** A doorway on a face: dark opening (or none when it is open and real), jambs and lintel proud of the face. */
function doorway(bag, axis, p, sg, uc, w, F, h, dark = true) {
  if (dark) onFace(bag, 'opening', axis, p, sg, uc - w / 2, uc + w / 2, F, F + h, 0.005, 0.02);
  for (const s of [-1, 1]) onFace(bag, CUT, axis, p, sg, Math.min(uc + s * w / 2, uc + s * (w / 2 + 0.22)), Math.max(uc + s * w / 2, uc + s * (w / 2 + 0.22)), F, F + h, 0, 0.05);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.32, uc + w / 2 + 0.32, F + h, F + h + 0.36, 0, 0.07);
  // a relieving arch of five voussoirs over the lintel
  for (let k = 0; k < 5; k++) { const a0 = Math.PI * k / 5, a1 = Math.PI * (k + 1) / 5, r = w / 2 + 0.1; onFace(bag, CUT, axis, p, sg, uc - Math.cos(a0) * r - 0.02, uc - Math.cos(a1) * r + 0.02, F + h + 0.36 + Math.sin(Math.min(a0, a1)) * r * 0.5, F + h + 0.36 + Math.max(Math.sin(a0), Math.sin(a1)) * r * 0.5 + 0.18, 0, 0.04); }
}
/** A small window high in a face: the dark opening, a sill, a lintel. */
function windowAt(bag, axis, p, sg, uc, y0, w = 0.5, h = 0.75) {
  onFace(bag, 'opening', axis, p, sg, uc - w / 2, uc + w / 2, y0, y0 + h, 0.005, 0.02);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.12, uc + w / 2 + 0.12, y0 - 0.12, y0, 0, 0.08);
  onFace(bag, CUT, axis, p, sg, uc - w / 2 - 0.15, uc + w / 2 + 0.15, y0 + h, y0 + h + 0.22, 0, 0.05);
}
/** A timber spout through the parapet's foot, out over the face, and the streak greyed down the wall under it. */
function spout(bag, axis, p, sg, uc, top, run) {
  onFace(bag, 'timber', axis, p, sg, uc - 0.07, uc + 0.07, top - 0.02, top + 0.1, -0.1, 0.55);
  onFace(bag, 'plaster_streak', axis, p, sg, uc - 0.16, uc + 0.16, top - run, top - 0.02, 0.004, 0.012);
}
/** The damp at the foot of a face from u0 to u1, its top wavering, broken where `cuts` are. */
function damp(bag, axis, p, sg, u0, u1, yb, yt, cuts = []) {
  let u = u0;
  for (const [c0, c1] of [...cuts.filter(([a, b]) => b > u0 && a < u1).sort((a, b) => a[0] - b[0]), [u1, u1]]) {
    for (let s = u; s < Math.min(c0, u1) - 0.05; s += 1.4) { const e = Math.min(s + 1.4, c0, u1); onFace(bag, 'plaster_damp', axis, p, sg, s, e, yb, yt + 0.12 * Math.sin(s * 2.1) + 0.08 * Math.sin(s * 5.3), 0.003, 0.012); }
    u = Math.max(u, c1);
  }
}


// ── the plan of the upper storey ────────────────────────────────────────────────────────────────

/**
 * Where the upper storey's parts stand (for the building, the furnishing and the walk routes): the chambers over the main room
 * (ri: their inner rectangle; xp: the partition between them), the door from the store's roof terrace (xdA), the gallery over
 * the court (xb), the court stair (stair: its ramp's rectangle, foot at z1 end).
 */
export function upperLayout(el) {
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, T = 0.65, F = Math.max(el.y ?? 0, el.y1 ?? el.y ?? 0) + 0.05;
  const dN = clamp(D * 0.36, 4.2, 5.4), dW = clamp(W * 0.27, 3.4, 4.2), xc0 = x0 + dW, xc1 = x1 - 3.4, zc0 = z0 + dN, zc1 = z1 - T;
  const hN = F + 4.2, hW = F + 3.9, Y = hN + 0.05, t = 0.5, ri = [x0 + t, z0 + t, x1 - t, zc0 - t];
  const xp = Math.round((x0 + W * 0.47) * 10) / 10, xdA = x0 + dW / 2, xb = clamp((xp + ri[2]) / 2, xc0 + 1.8, xc1 - 1.8);
  const sx0 = xc0, sx1 = xc0 + 0.85, sLen = Math.min(zc1 - zc0 - 1.4, (hW - F) / 0.2 * 0.26), sz1 = zc1 - 0.2, sz0 = sz1 - sLen;
  const lane = el.lane ?? 99, proj = lane >= 2.2 ? 0.9 : 0;
  return { F, hN, hW, Y, t, ri, xp, xdA, xb, x0, z0, x1, z1, xc0, xc1, zc0, zc1, N: [x0, z0, x1, zc0], stair: [sx0, sz0, sx1, sz1], proj, dW, hU: hN + 3.75, C2: hN + 3.05, bal: [xb - 1.5, zc0, xb + 1.5, zc0 + 1.15] };
}

/** A wall along x at z in [za, zb] from xa to xb, y0..y1, with openings [{ a, b, ya, yt }] (x range, sill, head): the sills and the piers collide. */
function wallX(ctx, xa, xb, za, zb, y0, y1, holes) {
  const { bag, col } = ctx; let u = xa;
  const solid = (a, b) => { if (b - a > 0.005) { bag.add(L, box(a, y0, za, b, y1, zb)); col.rect([a, za, b, zb], y0, y1); } };
  for (const h of [...holes].sort((p, q) => p.a - q.a)) {
    solid(u, h.a);
    if (h.ya > y0 + 0.01) { bag.add(L, box(h.a, y0, za, h.b, h.ya, zb)); col.rect([h.a, za, h.b, zb], y0, h.ya); }
    if (h.yt < y1 - 0.01) bag.add(L, box(h.a, h.yt, za, h.b, y1, zb));
    u = h.b;
  }
  solid(u, xb);
}
/** The same for a wall along z at x in [xa, xb], from za to zb: openings [{ a, b, ya, yt }] along z. */
function wallZ(ctx, xa, xb, za, zb, y0, y1, holes) {
  const { bag, col } = ctx; let u = za;
  const solid = (a, b) => { if (b - a > 0.005) { bag.add(L, box(xa, y0, a, xb, y1, b)); col.rect([xa, a, xb, b], y0, y1); } };
  for (const h of [...holes].sort((p, q) => p.a - q.a)) {
    solid(u, h.a);
    if (h.ya > y0 + 0.01) { bag.add(L, box(xa, y0, h.a, xb, h.ya, h.b)); col.rect([xa, h.a, xb, h.b], y0, h.ya); }
    if (h.yt < y1 - 0.01) bag.add(L, box(xa, h.yt, h.a, xb, y1, h.b));
    u = h.b;
  }
  solid(u, zb);
}
/** The trim of an open window on an outer face: a sill, a lintel, a grille of cedar bars across the reveal's middle. */
function winTrim(bag, axis, p, sg, a, b, ya, yt, wall) {
  onFace(bag, CUT, axis, p, sg, a - 0.12, b + 0.12, ya - 0.1, ya, 0, 0.09);
  onFace(bag, CUT, axis, p, sg, a - 0.14, b + 0.14, yt, yt + 0.2, 0, 0.06);
  const q = p - sg * wall / 2;
  for (let k = 1; k < 5; k++) { const u = a + (b - a) * k / 5; bag.add('cedar', axis === 'z' ? box(u - 0.02, ya, q - 0.02, u + 0.02, yt, q + 0.02) : box(q - 0.02, ya, u - 0.02, q + 0.02, yt, u + 0.02)); }
}

/** The upper storey over the main room: two chambers under a flat roof, their openings, the gallery over the court, the furnishing. */
function upper(ctx, el, U) {
  const { bag, col, lights } = ctx, { hN, Y, t, ri, xp, xdA, xb, x0, z0, x1, zc0, C2, hU, N } = U, T2 = C2 + 0.04;
  const win = (a, w, ya = Y + 0.95, yt = Y + 2.1) => ({ a: a - w / 2, b: a + w / 2, ya, yt });
  // the floor of plaster over the slab; the ceiling of beams under reeds; the roof's mass over it; the parapets
  bag.add('lime_plaster', box(ri[0], hN, ri[1], ri[2], Y, ri[3])); col.floor(ri, Y);
  for (let x = ri[0] + 0.35; x < ri[2] - 0.2; x += 0.62) bag.add('cedar', box(x - 0.09, C2 - 0.2, ri[1], x + 0.09, C2, ri[3]));
  bag.add('reed_mat', box(ri[0], C2, ri[1], ri[2], C2 + 0.04, ri[3]));
  bag.add(L, box(x0, T2, z0, x1, hU, zc0)); col.floor(N, hU);
  parapets(bag, N, hU);
  // the walls: north to the lane behind (two windows to a chamber), south to the court (the door from the terrace, the gallery's door, windows), the ends
  const pA = xp - 0.15, pB = xp + 0.15, cA = (ri[0] + pA) / 2, cB = (pB + ri[2]) / 2;
  const north = [win(ri[0] + (pA - ri[0]) * 0.28, 0.8), win(ri[0] + (pA - ri[0]) * 0.72, 0.8), win(pB + (ri[2] - pB) * 0.28, 0.8), win(pB + (ri[2] - pB) * 0.72, 0.8)];
  wallX(ctx, x0, x1, z0, z0 + t, hN, T2, north);
  for (const h of north) winTrim(bag, 'z', z0, -1, h.a, h.b, h.ya, h.yt, t);
  const south = [{ a: xdA - 0.5, b: xdA + 0.5, ya: Y, yt: Y + 2.1 }, win(pA - 1.3, 0.9), { a: xb - 0.6, b: xb + 0.6, ya: Y, yt: Y + 2.25 }];
  if (xb - 2.3 > pB + 0.7) south.push(win(xb - 2.3, 0.9));
  if (xb + 2.3 < ri[2] - 0.7) south.push(win(xb + 2.3, 0.9));
  wallX(ctx, x0, x1, zc0 - t, zc0, hN, T2, south);
  doorway(bag, 'z', zc0, 1, xdA, 1.0, Y, 2.1, false); doorway(bag, 'z', zc0, 1, xb, 1.2, Y, 2.25, false);
  for (const h of south.slice(1)) if (h.ya > Y) winTrim(bag, 'z', zc0, 1, h.a, h.b, h.ya, h.yt, t);
  // (the court's faces of the ground floor and the damp reach the old wall's top, hN)
  const zm = (ri[1] + ri[3]) / 2;
  wallZ(ctx, x0, x0 + t, z0 + t, zc0 - t, hN, T2, [{ a: zm - 0.4, b: zm + 0.4, ya: Y + 1.0, yt: Y + 2.0 }]);
  winTrim(bag, 'x', x0, -1, zm - 0.4, zm + 0.4, Y + 1.0, Y + 2.0, t);
  wallZ(ctx, x1 - t, x1, z0 + t, zc0 - t, hN, T2, [{ a: zm - 0.4, b: zm + 0.4, ya: Y + 1.0, yt: Y + 2.0 }]);
  winTrim(bag, 'x', x1, 1, zm - 0.4, zm + 0.4, Y + 1.0, Y + 2.0, t);
  // the partition, its door near the court wall
  const zd = ri[3] - 1.15;
  wallZ(ctx, pA, pB, ri[1], ri[3], hN, T2, [{ a: zd - 0.5, b: zd + 0.5, ya: Y, yt: Y + 2.1 }]);
  for (const s of [-1, 1]) bag.add(CUT, box(pA - 0.04, Y, zd + s * 0.5 + (s < 0 ? -0.1 : 0), pB + 0.04, Y + 2.2, zd + s * 0.5 + (s < 0 ? 0 : 0.1)));
  // the gallery over the court: beams out from the wall, a deck, a rail of posts and balusters, the sides closed
  const [gx0, gz0, gx1, gz1] = U.bal;
  for (let x = gx0 + 0.25; x < gx1 - 0.1; x += (gx1 - gx0 - 0.5) / 4) bag.add('cedar', box(x - 0.08, hN - 0.34, zc0 - 0.3, x + 0.08, hN - 0.02, gz1 - 0.05));
  bag.add('cedar', box(gx0, hN - 0.02, gz0, gx1, Y, gz1)); col.floor([gx0, gz0, gx1, gz1], Y);
  rails(ctx, [gx0, gz0, gx1, gz1], Y, ['w', 'e', 's']);
  // the lamp: a niche in the partition, the clay lamp burning; one light for the two chambers
  bag.add('opening', box(pB, Y + 1.45, zd - 1.6 - 0.25, pB + 0.005, Y + 1.9, zd - 1.6 + 0.25));
  bag.add(CUT, box(pB, Y + 1.4, zd - 1.6 - 0.3, pB + 0.12, Y + 1.45, zd - 1.6 + 0.3));
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.03], [0.03, 0.045], [0.001, 0.05]], 10, null, pB + 0.06, Y + 1.45, zd - 1.6));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.04]], 6, null, pB + 0.06, Y + 1.5, zd - 1.55));
  lights?.push({ at: [pB + 0.4, Y + 1.6, zd - 1.6], color: '#ffae5e', intensity: 2.2, distance: 7 });
  void cA; void cB;
  furnishUpper(ctx, el, U);
}

/** A rail round a rectangle at deck level y: posts at the corners, a top rail, balusters; on the sides named ('n','s','w','e'); it collides. */
export function rails(ctx, [x0, z0, x1, z1], y, sides) {
  const { bag, col } = ctx, hh = 0.95, put = (a0, b0, a1, b1) => {
    const alongX = a1 - a0 > b1 - b0;
    bag.add('cedar', box(a0 - (alongX ? 0 : 0.0), y + hh - 0.05, b0, a1, y + hh + 0.01, b1));
    if (alongX) for (let x = a0 + 0.1; x < a1 - 0.05; x += 0.2) bag.add('cedar', box(x - 0.015, y, b0 + 0.01, x + 0.015, y + hh - 0.05, b0 + 0.04));
    else for (let z = b0 + 0.1; z < b1 - 0.05; z += 0.2) bag.add('cedar', box(a0 + 0.01, y, z - 0.015, a0 + 0.04, y + hh - 0.05, z + 0.015));
    col.rect([a0, b0, a1, b1], y, y + hh);
  };
  if (sides.includes('s')) put(x0, z1 - 0.05, x1, z1);
  if (sides.includes('n')) put(x0, z0, x1, z0 + 0.05);
  if (sides.includes('w')) put(x0, z0, x0 + 0.05, z1);
  if (sides.includes('e')) put(x1 - 0.05, z0, x1, z1);
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
    if (!sides.includes(px === x0 ? 'w' : 'e') && !sides.includes(pz === z0 ? 'n' : 's')) continue;
    const cx = px === x0 ? px + 0.045 : px - 0.045, cz = pz === z0 ? pz + 0.045 : pz - 0.045;
    bag.add('cedar', box(cx - 0.04, y, cz - 0.04, cx + 0.04, y + hh + 0.03, cz + 0.04));
  }
}

/**
 * The store's roof as a terrace: parapets with a gap at the stair's head and one for the balcony over the street, a loggia of timber over the part
 * before the chambers' door (posts, a beam, rafters, a roof of reeds), a stone step at the door, and the balcony over the lane where it is wide.
 */
function terrace(ctx, el, U) {
  const { bag, col } = ctx, { x0, z1, xc0, zc0, hW, hN, Y, xdA, proj, stair: [, sz0] } = U, p = 0.28;
  const bx0 = (x0 + xc0) / 2 - 1.2, bx1 = (x0 + xc0) / 2 + 1.2, g0 = sz0 - 0.5, g1 = sz0 + 1.5;
  const run = (a, b, c, d) => { if (c - a > 0.01 && d - b > 0.01) { bag.add(L, box(a, hW, b, c, hW + 0.55, d)); bag.add(CUT, box(a - 0.03, hW + 0.55, b - 0.03, c + 0.03, hW + 0.63, d + 0.03)); } };
  if (proj > 0) { run(x0, z1 - p, bx0, z1); run(bx1, z1 - p, xc0, z1); } else run(x0, z1 - p, xc0, z1);
  run(x0, zc0, x0 + p, z1 - p); run(xc0 - p, zc0, xc0, g0); run(xc0 - p, g1, xc0, z1 - p);
  bag.add('lime_plaster', box(x0 + p, hW, zc0, xc0 - p, hW + 0.05, z1 - p)); bag.add('lime_plaster', box(xc0 - p, hW, g0, xc0, hW + 0.05, g1));
  // a stone step over the sill of the chambers' door: the terrace is 0.35 m under the floor within
  bag.add(CUT, box(xdA - 0.65, hW, zc0, xdA + 0.65, hW + 0.18, zc0 + 0.38)); col.floor([xdA - 0.65, zc0, xdA + 0.65, zc0 + 0.38], hW + 0.18);
  // the loggia: two posts, a beam across, rafters to a ledger on the wall, a roof of reed mat
  const pz = zc0 + 2.55, py = hW + 2.5, xa = x0 + 0.55, xb2 = xc0 - 0.55;
  for (const x of [xa, xb2]) { bag.add('cedar', box(x - 0.08, hW + 0.05, pz - 0.08, x + 0.08, py, pz + 0.08)); col.circle(x, pz, 0.12, hW, py); }
  bag.add('cedar', box(x0 + 0.3, py, pz - 0.09, xc0 - 0.3, py + 0.15, pz + 0.09));
  bag.add('cedar', box(x0 + 0.3, py, zc0, xc0 - 0.3, py + 0.15, zc0 + 0.12));
  for (let x = x0 + 0.45; x < xc0 - 0.3; x += 0.55) bag.add('cedar', box(x - 0.05, py + 0.15, zc0, x + 0.05, py + 0.25, pz + 0.3));
  bag.add('reed_mat', box(x0 + 0.3, py + 0.25, zc0, xc0 - 0.3, py + 0.3, pz + 0.3));
  // the balcony over the lane: beams from the wall, a deck, a rail round three sides
  if (proj > 0) {
    for (let x = bx0 + 0.2; x < bx1; x += 0.65) bag.add('cedar', box(x - 0.07, hW - 0.3, z1 - 0.5, x + 0.07, hW - 0.02, z1 + proj - 0.05));
    bag.add('cedar', box(bx0, hW - 0.02, z1 - p, bx1, hW + 0.05, z1 + proj)); col.floor([bx0, z1 - p, bx1, z1 + proj], hW);
    rails(ctx, [bx0, z1 - p, bx1, z1 + proj], hW + 0.05, ['w', 'e', 's']);
  }
  void Y; void hN;
}

/** levant_house, open and of two storeys: { rect, y, y1, seed, ys, lane (the gap to the lot south), up (the use of the upper chambers), trade }. */
export function levantHouseUp(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, yb = (el.y ?? 0) - 0.6;
  const U = upperLayout(el), { F, hN, hW, xc0, xc1, zc0, zc1, N } = U, T = 0.65, hE = F + 3.6, hS = F + 3.0;
  const Wr = [x0, zc0, xc0, z1], Er = [xc1, zc0, x1, z1];
  bag.add('flagstone', box(xc0, yb, zc0, xc1, F, zc1)); col.floor([xc0, zc0, xc1, zc1], F);
  groundRanges(ctx, el, U, { x0, z0, x1, z1, F, yb, T, N, Wr, Er, hN, hW, hE });
  // the court wall on the street with the house door, standing open
  const dc = (xc0 + xc1) / 2, dw = 1.1, dh = 2.1;
  for (const [a, b] of [[xc0, dc - dw / 2], [dc + dw / 2, xc1]]) { bag.add(L, box(a, yb, zc1, b, hS, z1)); col.rect([a, zc1, b, z1], yb, hS); }
  bag.add(L, box(dc - dw / 2, F + dh, zc1, dc + dw / 2, hS, z1));
  bag.add(L, box(dc - dw / 2, yb, zc1, dc + dw / 2, F, z1));
  bag.add(CUT, box(xc0, hS, zc1 - 0.03, xc1, hS + 0.1, z1 + 0.03));
  doorway(bag, 'z', z1, 1, dc, dw, F, dh, false);
  for (const s of [-1, 1]) { const hx = dc + s * dw / 2; bag.add('cedar', box(Math.min(hx, hx + s * 0.06), F + 0.02, zc1 - 0.56, Math.max(hx, hx + s * 0.06), F + dh - 0.04, zc1 - 0.01)); }
  col.floor([dc - dw / 2, zc1, dc + dw / 2, z1], F);
  bag.add(CUT, box(dc - dw / 2 - 0.1, F - 0.12, z1 - 0.05, dc + dw / 2 + 0.1, F + 0.04, z1 + 0.32));
  const drop = F - (el.ys ?? el.y ?? F), nS = Math.min(3, Math.ceil((drop - 0.08) / 0.18)), rS = nS > 0 ? drop / (nS + 1) : 0;
  for (let k = 1; k <= nS; k++) bag.add(CUT, box(dc - 0.75, yb, z1 + 0.32 + (k - 1) * 0.2, dc + 0.75, F - k * rS, z1 + 0.32 + k * 0.2));
  if (nS > 0) col.ramp([dc - 0.75, z1, dc + 0.75, z1 + 0.32 + nS * 0.2], el.ys ?? F, F, 'n');
  // the faces: small windows to the streets, spouts, the damp
  const nDoor = (xc0 + xc1) / 2;
  for (const [axis, p, sg, a, b, top] of [['z', z0, -1, x0, x1, hN], ['x', x0, -1, z0, z1, hW], ['x', x1, 1, z0, z1, hE]]) {
    const n = Math.max(1, Math.floor((b - a) / 4.5));
    for (let i = 0; i < n; i++) { const u = a + (i + 0.5) * (b - a) / n; if (top - F > 3.5) windowAt(bag, axis, p, sg, u, top - 1.4, 0.38, 0.6); }
    damp(bag, axis, p, sg, a, b, yb + 0.55, F + 0.55);
    for (let i = 0; i <= n; i++) if (rand() < 0.6) { const u = i === 0 ? a + 0.7 : i === n ? b - 0.7 : a + i * (b - a) / n; onFace(bag, 'plaster_streak', axis, p, sg, u - 0.18, u + 0.18, Math.max(F + 1.0, top - 1.0 - rand() * 1.4), top - 0.02, 0.004, 0.012); }
  }
  damp(bag, 'z', z1, 1, x0, x1, yb + 0.55, F + 0.5, [[dc - dw / 2 - 0.25, dc + dw / 2 + 0.25]]);
  damp(bag, 'z', zc0, 1, xc0, xc1, F, F + 0.45, [[nDoor - 1.0, nDoor + 1.0], [nDoor - 2.6, nDoor - 1.5], [nDoor + 1.5, nDoor + 2.6]]);
  spout(bag, 'z', zc0, 1, xc1 - 0.45, U.hU, 1.6 + rand()); spout(bag, 'x', xc1, -1, zc0 + 0.9, hE, 1.2 + rand());
  // the stair to the terrace along the store's court face, rising north; a timber rail on its open side
  const [sx0, sz0, sx1, sz1] = U.stair, sLen = sz1 - sz0, nst = Math.round((hW - F) / 0.2);
  for (let k = 0; k < nst; k++) { const t1 = (k + 1) / nst; bag.add(L, box(sx0, F, sz1 - sLen * t1, sx1, F + (hW - F) * t1, sz1 - sLen * k / nst)); }
  col.ramp([sx0, sz0, sx1, sz1], F, hW, 'n');
  for (const [z, y] of [[sz1 - 0.1, F], [(sz0 + sz1) / 2, (F + hW) / 2], [sz0 + 0.1, hW]]) bag.add('cedar', box(sx1 - 0.03, y, z - 0.04, sx1 + 0.03, y + 1.0 + 0.0, z + 0.04));
  bag.add('cedar', rod([sx1, F + 1.0, sz1 - 0.1], [sx1, hW + 1.0, sz0 + 0.1], 0.03, 6));
  // the cistern's mouth and the oven in the court
  const cx = xc1 - 1.3, cz = zc0 + 1.4;
  if (xc1 - xc0 > 3.6 && zc1 - zc0 > 3.4) {
    bag.add(CUT, lathe([[0.34, 0], [0.46, 0.04], [0.46, 0.5], [0.4, 0.56], [0.28, 0.56], [0.28, 0.4], [0.001, 0.4]], 14, null, cx, F, cz));
    bag.add(L, lathe([[0.32, 0], [0.32, 0.07], [0.12, 0.1], [0.1, 0.16], [0.001, 0.17]], 12, null, cx, F + 0.54, cz));
    col.circle(cx, cz, 0.48, F, F + 0.6);
    const ox = xc1 - 0.85, oz = zc1 - 0.95;
    bag.add('mud_plaster', lathe([[0.55, 0], [0.56, 0.18], [0.48, 0.42], [0.3, 0.58], [0.16, 0.62], [0.16, 0.66], [0.001, 0.66]], 14, null, ox, F, oz));
    bag.add('pottery_dark', lathe([[0.18, 0], [0.18, 0.03], [0.05, 0.06], [0.001, 0.08]], 10, null, ox, F + 0.66, oz));
    bag.add('basalt', box(ox - 0.7, F, oz - 0.95, ox + 0.2, F + 0.015, oz - 0.5));
    col.circle(ox, oz, 0.56, F, F + 0.66);
  }
}

/** The ground-floor ranges of the open house with an upper storey: the main room on the north and the store on the west hollow, with their ceilings of beams; the kitchen range solid. */
function groundRanges(ctx, el, U, { x0, z0, x1, z1, F, yb, T, N, Wr, Er, hN, hW, hE }) {
  const { bag, col, lights } = ctx, C = F + 3.3;
  const wall = (r, y1 = hN) => { bag.add(L, box(r[0], yb, r[1], r[2], y1, r[3])); col.rect(r, yb, y1); };
  // the main room: walls, its door and two windows onto the court
  const [nx0, nz0, nx1, nz1] = N, mid = (x0 + x1) / 2, dw = 1.2, dh = 2.3;
  wall([nx0, nz0, nx1, nz0 + T]); wall([nx0, nz0 + T, nx0 + T, nz1]); wall([nx1 - T, nz0 + T, nx1, nz1]);
  const ws = [[mid - dw / 2, mid + dw / 2, F, F + dh], [mid - 2.5, mid - 1.6, F + 1.25, F + 2.2], [mid + 1.6, mid + 2.5, F + 1.25, F + 2.2]];
  let u = nx0 + T;
  for (const [a, b, ya, yt] of [...ws].sort((p, q) => p[0] - q[0])) {
    bag.add(L, box(u, yb, nz1 - T, a, hN, nz1)); col.rect([u, nz1 - T, a, nz1], yb, hN);
    bag.add(L, box(a, yb, nz1 - T, b, ya, nz1)); if (ya > F) col.rect([a, nz1 - T, b, nz1], yb, ya);
    bag.add(L, box(a, yt, nz1 - T, b, hN, nz1));
    u = b;
  }
  bag.add(L, box(u, yb, nz1 - T, nx1 - T, hN, nz1)); col.rect([u, nz1 - T, nx1 - T, nz1], yb, hN);
  doorway(bag, 'z', nz1, 1, mid, dw, F, dh, false);
  for (const [a, b, ya, yt] of ws.slice(1)) {
    onFace(bag, CUT, 'z', nz1, 1, a - 0.12, b + 0.12, ya - 0.12, ya, 0, 0.08);
    // a wooden grille in each window
    for (let k = 1; k < 4; k++) bag.add('cedar', box(a + (b - a) * k / 4 - 0.025, ya, nz1 - T / 2 - 0.025, a + (b - a) * k / 4 + 0.025, yt, nz1 - T / 2 + 0.025));
    for (let k = 1; k < 4; k++) bag.add('cedar', box(a, ya + (yt - ya) * k / 4 - 0.025, nz1 - T / 2 - 0.025, b, ya + (yt - ya) * k / 4 + 0.025, nz1 - T / 2 + 0.025));
  }
  // the floor, the ceiling of beams under reeds, the roof's mass over it
  const ri = [nx0 + T, nz0 + T, nx1 - T, nz1 - T];
  bag.add('flagstone', box(ri[0], yb, ri[1], ri[2], F, ri[3])); col.floor(ri, F);
  for (let x = ri[0] + 0.35; x < ri[2] - 0.2; x += 0.62) bag.add('cedar', box(x - 0.09, C - 0.2, ri[1], x + 0.09, C, ri[3]));
  bag.add('reed_mat', box(ri[0], C, ri[1], ri[2], C + 0.04, ri[3]));
  bag.add(L, box(nx0, C + 0.04, nz0, nx1, hN, nz1)); col.floor([nx0, nz0, nx1, nz1], hN);
  upper(ctx, el, U);
  // its things: mats over the floor, a mattress and cushions along three walls, bolsters, a chest, a tray on its stand, the lamp in a niche
  bag.add('reed_mat', box(ri[0] + 0.1, F, ri[1] + 0.1, ri[2] - 0.1, F + 0.02, ri[3] - 0.15));
  const cl = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
  bag.add('cloth_indigo', box(ri[0] + 0.05, F + 0.02, ri[1] + 0.05, ri[2] - 0.05, F + 0.16, ri[1] + 0.85));
  bag.add('cloth_red', box(ri[0] + 0.05, F + 0.02, ri[1] + 0.85, ri[0] + 0.85, F + 0.16, ri[3] - 0.3));
  bag.add('cloth_red', box(ri[2] - 0.85, F + 0.02, ri[1] + 0.85, ri[2] - 0.05, F + 0.16, ri[3] - 0.3));
  for (let x = ri[0] + 1.1, k = 0; x < ri[2] - 1.0; x += 0.9, k++) bag.add(cl[k % 4], lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.35], [0.12, 0.68], [0.001, 0.7]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x + 0.35, F + 0.3, ri[1] + 0.22));
  bag.add('cedar', box(ri[2] - 1.5, F, ri[3] - 0.62, ri[2] - 0.4, F + 0.62, ri[3] - 0.08));
  bag.add('cedar', box(ri[2] - 1.54, F + 0.62, ri[3] - 0.66, ri[2] - 0.36, F + 0.66, ri[3] - 0.04));
  bag.add('iron', box(ri[2] - 1.5, F + 0.3, ri[3] - 0.64, ri[2] - 0.4, F + 0.35, ri[3] - 0.62));
  const tx = mid, tz = (ri[1] + ri[3]) / 2 + 0.2;
  for (const s of [-1, 1]) bag.add('cedar', box(tx - 0.3, F + 0.02, tz + s * 0.24 - 0.02, tx + 0.3, F + 0.34, tz + s * 0.24 + 0.02).rotateY(0));
  bag.add('bronze', lathe([[0.001, 0], [0.42, 0], [0.44, 0.04], [0.42, 0.05], [0.001, 0.02]], 24, null, tx, F + 0.34, tz));
  bag.add('pottery_dark', lathe([[0.04, 0], [0.07, 0.04], [0.06, 0.09], [0.035, 0.12], [0.04, 0.14], [0.001, 0.14]], 10, null, tx + 0.15, F + 0.37, tz - 0.05));
  // the lamp's niche in the back wall, the clay lamp in it burning; the soot over it
  const lx = mid - 1.8, lz = ri[1];
  bag.add('opening', box(lx - 0.25, F + 1.5, lz - 0.01, lx + 0.25, F + 1.95, lz + 0.005));
  bag.add(CUT, box(lx - 0.3, F + 1.45, lz, lx + 0.3, F + 1.5, lz + 0.12));
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.03], [0.03, 0.045], [0.001, 0.05]], 10, null, lx, F + 1.5, lz + 0.06));
  bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.04]], 6, null, lx + 0.055, F + 1.55, lz + 0.06));
  bag.add('pottery_dark', box(lx - 0.22, F + 1.95, lz + 0.001, lx + 0.22, F + 2.6, lz + 0.006));
  lights?.push({ at: [lx + 0.05, F + 1.6, lz + 0.2], color: '#ffae5e', intensity: 2.2, distance: 6 });
  // the store on the west: walls, its door, the floor; the roof over it
  const [wx0, wz0, wx1, wz1] = Wr, wc = wz0 + 1.0;
  wall([wx0, wz0, wx0 + T, wz1], hW); wall([wx0 + T, wz1 - T, wx1, wz1], hW);
  for (const [a, b] of [[wz0, wc - 0.5], [wc + 0.5, wz1 - T]]) { bag.add(L, box(wx1 - T, yb, a, wx1, hW, b)); col.rect([wx1 - T, a, wx1, b], yb, hW); }
  bag.add(L, box(wx1 - T, F + 2.0, wc - 0.5, wx1, hW, wc + 0.5));
  doorway(bag, 'x', wx1, 1, wc, 1.0, F, 2.0, false);
  const si = [wx0 + T, wz0, wx1 - T, wz1 - T];
  bag.add('flagstone', box(si[0], yb, si[1], si[2], F, si[3])); col.floor(si, F);
  for (let z = si[1] + 0.4; z < si[3] - 0.2; z += 0.66) bag.add('cedar', box(si[0], C - 0.18, z - 0.08, si[2], C, z + 0.08));
  bag.add('reed_mat', box(si[0], C, si[1], si[2], C + 0.04, si[3]));
  bag.add(L, box(wx0, C + 0.04, wz0, wx1, hW, wz1)); col.floor(Wr, hW);
  terrace(ctx, el, U);
  // the kitchen range on the east: solid, its door and a smoke hole's soot over it
  bag.add(L, box(Er[0], yb, Er[1], Er[2], hE, Er[3])); col.rect(Er, yb, hE); col.floor(Er, hE);
  parapets(bag, Er, hE, 0.55, 0.28, 'n');
  doorway(bag, 'x', Er[0], -1, (Er[1] + Er[3]) / 2, 0.9, F, 2.0);
  onFace(bag, 'pottery_dark', 'x', Er[0], -1, (Er[1] + Er[3]) / 2 - 0.5, (Er[1] + Er[3]) / 2 + 0.5, F + 2.75, hE - 0.05, 0.004, 0.01);
}
