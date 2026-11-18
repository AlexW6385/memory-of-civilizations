// The Cairene town house you can walk into (docs/settlements/mamluk-cairo.md §14): a lot of 8.5–13 × 9.5–11 m built round
// a small court — the street front of cased stone below and plaster above, its upper storey leaning out on corbels with
// lattice windows; the doorway in a pointed arch on one side; behind it the bent entrance (dihliz: a vestibule whose
// far wall blocks the view, the way turning aside into the court); the court with its fountain, stone bench and washing
// line, lit from above; across it the maq'ad (the loggia hall of the family's day, open to the court in pointed arches,
// its divan, carpet, tray, lamps); and in the front range beside the vestibule a kitchen or a stable. The upper storey is
// open (docs/settlements/mamluk-cairo.md §16): a stone stair along the court wall of the front range up to a wooden gallery
// on the court's east side, the front rooms over the lane (a sleeping room or a workroom with a lattice oriel or a balcony,
// a store over the vestibule), the upper maq'ad open to the court in arches, and from it a steep ladder-stair to the roof
// terrace with its malqaf.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/mamluk/index.js';
import * as F from '../../styles/mughal/furnish.js';
import { S, rng, frame, polyGeo, archPoly, voussoirs, dbl } from '../../styles/mamluk/kit.js';
import { stoneStair, ladderStair, bedroom, workroom, storeroom, familyHall } from './upper.js';

const T = 0.5, H = 3.4, HU = 6.6, DA = 2.9, SW = 0.4, ARC = 0.45, FL = 0.15, BD = 0.04, GW = 1.5, NS = 16;
const PLAST = ['plaster_white', 'plaster', 'plaster', 'plaster_white'];

/** The parts of the plan of a house for lot el: its rooms (world rectangles), used by the plan (rooms) and by the builder. */
export function houseDims(el) {
  const r = el.rect, fr = frame(r, el.face ?? el.front ?? 's'), along = fr.f === 'e' || fr.f === 'w';
  const L = along ? r[3] - r[1] : r[2] - r[0], D = along ? r[2] - r[0] : r[3] - r[1];
  const mir = (el.seed >>> 3) % 2 === 1, hb = D - T - 2.6;
  const m = (a, b) => (mir ? [L - b, L - a] : [a, b]);
  const R = (u0, u1, d0, d1) => { const [a, b] = m(u0, u1); return fr.rect(a, b, -d1, -d0); };
  return { fr, L, D, mir, hb, R, m, along };
}
export function houseRooms(el) {
  const { L, D, hb, R } = houseDims(el), y = el.y ?? 0;
  return [{ id: 'house vestibule', rect: R(T + 0.05, 3.35, T + 0.05, DA - 0.05), y: y + FL, kind: 'hall' },
    { id: 'house court', rect: R(T + 0.05, L - T - 0.05, DA + SW + 0.05, hb - ARC - 0.05), y: y + FL, kind: 'open' },
    { id: 'maqad', rect: R(T + 0.05, L - T - 0.05, hb + 0.05, D - T - 0.05), y: y + FL, kind: 'hall' },
    { id: 'house ' + (rng(el.seed + 5)() < 0.5 ? 'kitchen' : 'stable'), rect: R(3.95, L - T - 0.05, T + 0.05, DA - 0.05), y: y + FL, kind: 'hall' },
    { id: 'house upper room', rect: R(3.95, L - T - 0.05, 0.1, DA - 0.05), y: y + H + BD, kind: 'hall' },
    { id: 'house upper hall', rect: R(T + 1.2, L - T - 0.05, hb + 0.05, D - T - 0.05), y: y + H + BD, kind: 'hall' }];
}

/**
 * cairo_house_open: { rect, front ('n'|'e'|'s'|'w': the lane side), seed, y, storeys } — see the header.
 */
export function cairoHouseOpen(el, { bag, col, lights }) {
  const { fr, L, D, mir, hb, R, m, along } = houseDims(el), y = el.y ?? 0, fy = y + FL, rand = rng(el.seed + 9), UF = y + H, FB = UF + BD, RT = y + HU + 0.18;
  const kitchen = rng(el.seed + 5)() < 0.5, upper = PLAST[Math.floor(rand() * PLAST.length)];
  const B = (u0, u1, y0, y1, d0, d1) => { const [a, b] = m(u0, u1); return fr.B(a, b, y0, y1, -d1, -d0); };
  const J = (u0, u1, d0, d1, y0, y1) => B(u0, u1, y0, y1, d0, d1);
  const P = (u, d) => fr.P(mir ? L - u : u, -d);
  const wall = (u0, u1, d0, d1, y0, y1, mat = 'plaster_white') => { bag.add(mat, B(u0, u1, y0, y1, d0, d1)); col.rect(R(u0, u1, d0, d1), y0, y1); };
  const yawU = along ? -Math.PI / 2 : 0, yawIn = Math.atan2(fr.N[0], fr.N[1]);   // along the lane; facing into the house
  const dC0 = DA + SW, dC1 = hb - ARC, cu = L / 2, cd = (dC0 + dC1) / 2;
  // a balustrade: a low sill (under what the engine reads as a roof, half a metre) and a lattice screen above it as a bare vertical sheet
  const rail = (ua, ub, da, db) => { bag.add('wood_dark', B(Math.min(ua, ub) - 0.03, Math.max(ua, ub) + 0.03, FB, FB + 0.4, Math.min(da, db) - 0.03, Math.max(da, db) + 0.03));
    const [ax, az] = P(ua, da), [bx, bz] = P(ub, db), y0 = FB + 0.4, y1 = FB + 0.95; bag.add('lattice', dbl([ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az])); };
  const mu = (a, b) => (mir ? L - b : a);                                           // a frame-u start for a span [a, b] seen from the door's side
  const poly = (pts, d0, d1, holes) => polyGeo(fr, pts.map(([u, v]) => [mir ? L - u : u, v]), -d1, -d0, holes.map((h) => h.map(([u, v]) => [mir ? L - u : u, v])));
  // ── the front: stone below with the pointed doorway (and a grilled window to the store), plaster above leaning out on corbels
  const doorU = 0.8, doorW = 1.0, doorH = 2.5, wu = (3.95 + L - T) / 2 - 0.4, wy0 = fy + 1.35, wy1 = fy + 2.25;
  bag.add(S, poly([[0, y - 0.3], [L, y - 0.3], [L, y + H], [0, y + H]], 0, T, [archPoly(doorU, fy, doorW, doorH), [[wu, wy0], [wu + 0.8, wy0], [wu + 0.8, wy1], [wu, wy1]]]));
  col.rect(R(0, doorU, 0, T), y, y + H); col.rect(R(doorU + doorW, L, 0, T), y, y + H); col.rect(R(doorU, doorU + doorW, 0, T), y + 2.3, y + H);
  voussoirs(bag, fr, mu(doorU, doorU + doorW), fy, doorW, doorH, 0.2, 0, 0.1, ['marble_dark', 'marble_smooth'], 7);
  bag.add('lattice', B(wu, wu + 0.8, wy0, wy1, 0.18, 0.24)); bag.add('wood_dark', B(wu - 0.06, wu + 0.86, wy1, wy1 + 0.08, -0.04, 0.34)); bag.add('wood_dark', B(wu - 0.06, wu + 0.86, wy0 - 0.08, wy0, -0.04, 0.34));
  bag.add('wood_dark', B(doorU - 0.02, doorU + 0.05, fy, fy + 2.3, 0.5, 1.4)); col.rect(R(doorU - 0.02, doorU + 0.05, 0.5, 1.4), fy, fy + 2.3);   // the leaf, swung back against the jamb
  bag.add(S, B(doorU - 0.4, doorU + doorW + 0.4, y, y + FL, -0.5, 0.0));                                                                          // the sill and step out into the lane
  if (rand() < 0.4) { const u0 = rand() < 0.5 ? doorU + doorW + 0.35 : Math.max(0.2, doorU - 0.35 - 1.5); wall(u0, u0 + 1.4, -0.6, 0, y, y + 0.5, S); }   // a mastaba beside the door
  // the upper storey (§16): the lane wall leaning out 0.45 on corbels over the lane, its window openings cut through (an open reveal behind a
  // lattice oriel or with the shutters thrown back; a doorway to a wooden balcony), the roof over the rooms behind it
  const r2 = rng(el.seed + 31), balc = r2() < 0.5, work = r2() < 0.4, rawshan = rand() < 0.6;
  const WB = L - T - 3.9, nB = WB >= 6.4 ? 2 : 1, bdW = 1.1, bdH = 2.2;
  const wins = [{ c: 1.95, k: 'a', w: rawshan ? 1.2 : 0.9 }];
  for (let i = 0; i < nB; i++) wins.push({ c: 3.9 + WB * (i + 0.5) / nB, k: 'b', w: rawshan ? 1.6 : 0.9 });
  const bal = balc ? wins[wins.length - 1] : null;
  const fo = [[0, UF]], fh = [];
  if (bal) fo.push([bal.c - bdW / 2, UF], [bal.c - bdW / 2, UF + bdH], [bal.c + bdW / 2, UF + bdH], [bal.c + bdW / 2, UF]);
  fo.push([L, UF], [L, y + HU], [0, y + HU]);
  for (const w of wins) if (w !== bal) fh.push(rawshan ? [[w.c - w.w / 2 + 0.08, UF + 0.95], [w.c + w.w / 2 - 0.08, UF + 0.95], [w.c + w.w / 2 - 0.08, UF + 2.45], [w.c - w.w / 2 + 0.08, UF + 2.45]]
    : [[w.c - 0.45, UF + 1.05], [w.c + 0.45, UF + 1.05], [w.c + 0.45, UF + 2.35], [w.c - 0.45, UF + 2.35]]);
  bag.add(upper, poly(fo, -ARC, 0.05, fh));
  if (bal) { col.rect(R(0, bal.c - bdW / 2, -ARC, 0.05), UF, y + HU + 0.2); col.rect(R(bal.c + bdW / 2, L, -ARC, 0.05), UF, y + HU + 0.2); col.rect(R(bal.c - bdW / 2, bal.c + bdW / 2, -ARC, 0.05), UF + bdH, y + HU + 0.2); }
  else col.rect(R(0, L, -ARC, 0.05), UF, y + HU + 0.2);
  for (let u = 0.3; u < L - 0.3; u += 0.9) { bag.add('wood_dark', B(u, u + 0.16, y + H - 0.32, y + H, -0.2, 0)); bag.add('wood_dark', B(u, u + 0.16, y + H - 0.16, y + H, -ARC, -0.2)); }
  bag.add(S, B(-0.05, L + 0.05, y + H, y + H + 0.12, -ARC - 0.08, 0.1)); bag.add(S, B(-0.05, L + 0.05, y + HU, y + HU + 0.18, -ARC - 0.12, DA + SW + 0.05));
  for (const w of wins) {
    const c = w.c, ww = w.w;
    if (w === bal) {
      // the balcony: a floor of boards on three beams through the wall, braced from below, a lattice balustrade on three sides, a board hood on two posts
      const a = c - 1.0, b = c + 1.0, dd = -ARC - 1.0;
      bag.add('wood_dark', B(a, b, UF - 0.18, FB, dd, 0.05)); col.floor(R(a, b, dd, 0.05), FB);
      for (const u of [a + 0.15, c - 0.08, b - 0.31]) { bag.add('timber', B(u, u + 0.16, UF - 0.36, UF - 0.18, dd, 0.05)); const [px, pz] = P(u + 0.08, dd + 0.1), [qx, qz] = P(u + 0.08, -ARC + 0.1); bag.add('timber', rod([px, UF - 0.36, pz], [qx, UF - 1.2, qz], 0.045, 4)); }
      rail(a, b, dd + 0.025, dd + 0.025); rail(a + 0.025, a + 0.025, dd, -ARC); rail(b - 0.025, b - 0.025, dd, -ARC);

      for (const u of [a, b - 0.08]) bag.add('wood_dark', B(u, u + 0.08, FB, FB + 2.4, dd, dd + 0.08));
      bag.add('wood_dark', B(a - 0.1, b + 0.1, FB + 2.4, FB + 2.48, dd - 0.1, -ARC + 0.02)); for (let k = 0; k < 4; k++) bag.add('timber', B(a - 0.05 + k * (b - a) / 3.4, a + 0.05 + k * (b - a) / 3.4, FB + 2.34, FB + 2.4, dd - 0.06, -ARC));
      col.rect(R(a, b, dd, dd + 0.06), UF, UF + 1.05); col.rect(R(a, a + 0.06, dd, -ARC), UF, UF + 1.05); col.rect(R(b - 0.06, b, dd, -ARC), UF, UF + 1.05);
      continue;
    }
    if (rawshan) {
      bag.add('lattice', B(c - ww / 2, c + ww / 2, UF + 0.95, UF + 2.45, -ARC - 0.38, -ARC - 0.06));
      for (const s of [-1, 1]) { bag.add('lattice', B(c + s * ww / 2 - 0.03, c + s * ww / 2 + 0.03, UF + 0.95, UF + 2.45, -ARC - 0.38, -ARC)); bag.add('wood_dark', B(c + s * ww / 2 - 0.05, c + s * ww / 2 + 0.05, UF + 0.85, UF + 2.55, -ARC - 0.42, -ARC)); }
      bag.add('wood_dark', B(c - ww / 2 - 0.08, c + ww / 2 + 0.08, UF + 2.45, UF + 2.6, -ARC - 0.46, -ARC)); bag.add('wood_dark', B(c - ww / 2 - 0.08, c + ww / 2 + 0.08, UF + 0.78, UF + 0.95, -ARC - 0.46, -ARC));
      bag.add('wood_dark', B(c - ww / 2 - 0.04, c + ww / 2 + 0.04, UF + 2.6, UF + 2.66, -ARC - 0.5, -ARC + 0.04));
      bag.add('timber', B(c - ww / 2 + 0.3, c + ww / 2 - 0.3, UF + 1.35, UF + 1.4, -ARC - 0.4, -ARC - 0.38));       // the middle rail of the screen
    } else {
      // two leaves thrown back against the wall: the opening is bare to the lane, a few turned bars across it
      for (const s of [-1, 1]) bag.add('shutter_brown', B(s < 0 ? c - 0.9 : c + 0.45, s < 0 ? c - 0.45 : c + 0.9, UF + 1.05, UF + 2.35, -ARC - 0.05, -ARC));
      bag.add('wood_dark', B(c - 0.51, c + 0.51, UF + 2.35, UF + 2.45, -ARC - 0.08, -ARC)); bag.add(S, B(c - 0.53, c + 0.53, UF + 0.98, UF + 1.05, -ARC - 0.1, 0.05));
      for (let k = 0; k < 4; k++) bag.add('wood_dark', B(c - 0.36 + k * 0.24, c - 0.32 + k * 0.24, UF + 1.05, UF + 2.35, -ARC + 0.02, -ARC + 0.07));
    }
  }
  // a third storey set back from the lane over the front range; the roofs' copings and parapets (the terrace over the back range has its own, below)
  const top = (el.storeys ?? 2) >= 3 ? HU + 2.9 : HU;
  if (top > HU) { bag.add(upper, B(1.2, L - 1.2, y + HU + 0.2, y + top, 1.3, DA + SW)); col.rect(R(1.2, L - 1.2, 1.3, DA + SW), y + HU, y + top + 0.2); bag.add(S, B(1.1, L - 1.1, y + top, y + top + 0.16, 1.2, DA + SW + 0.1)); }
  for (const [u0, u1, d0, d1] of [[-0.05, T + 0.05, 0, D + 0.05], [L - T - 0.05, L + 0.05, 0, D + 0.05], [T, L - T, D - T - 0.05, D + 0.05]]) bag.add(S, B(u0, u1, y + HU, y + HU + 0.18, d0, d1));
  for (const [u0, u1, d0, d1] of [[-0.05, L + 0.05, -ARC - 0.1, -ARC + 0.3], [-0.05, L + 0.05, D - 0.3, D + 0.05], [-0.05, 0.3, 0, D], [L - 0.3, L + 0.05, 0, D], [T, L - T, hb - ARC - 0.08, hb - ARC + 0.25]]) bag.add(S, B(u0, u1, y + HU + 0.18, y + HU + 0.72, d0, d1));
  for (const [u0, u1, d0, d1] of [[-0.05, 0.3, hb - ARC, D], [L - 0.3, L + 0.05, hb - ARC, D], [T, L - T, D - 0.3, D + 0.05], [T, L - T, hb - ARC - 0.08, hb - ARC + 0.25]]) col.rect(R(u0, u1, d0, d1), y + HU, y + HU + 0.75);
  // the roof over the front range: beams, boards, the slab (its top is the cornice course above)
  for (const [a, b] of [[T, 3.4], [3.9, L - T]]) {
    bag.add('ceiling_painted', J(a, b, 0.05, DA, y + HU - 0.42, y + HU - 0.34));
    for (let k = 0; k < 5; k++) bag.add('timber', J(a, b, 0.3 + k * (DA - 0.6) / 4 - 0.08, 0.3 + k * (DA - 0.6) / 4 + 0.08, y + HU - 0.7, y + HU - 0.42));
  }
  bag.add(upper, B(T, L - T, y + HU - 0.34, y + HU, 0.05, DA + SW)); bag.add(upper, B(0, L, y + HU - 0.34, y + HU, -ARC, 0.05));
  col.rect(R(0, L, -ARC, DA + SW), y + HU - 0.34, y + HU + 0.2);
  // ── the shell round the court: the party walls and the back wall to the full height
  wall(0, T, 0, D, y, y + HU); wall(L - T, L, 0, D, y, y + HU); wall(T, L - T, D - T, D, y, UF); col.rect(R(T, L - T, D - T, D), UF, y + HU);
  { const bw = [0.3, 0.72].map((f) => T + f * (L - 2 * T)), hs = bw.map((c) => [[c - 0.4, FB + 1.0], [c + 0.4, FB + 1.0], [c + 0.4, FB + 2.1], [c - 0.4, FB + 2.1]]);
    bag.add('plaster_white', poly([[T, UF], [L - T, UF], [L - T, y + HU], [T, y + HU]], D - T, D, hs));
    for (const c of bw) { bag.add('lattice', B(c - 0.4, c + 0.4, FB + 1.0, FB + 2.1, D - 0.02, D + 0.04)); bag.add('wood_dark', B(c - 0.46, c + 0.46, FB + 2.1, FB + 2.2, D - 0.04, D + 0.1)); } }
  // ── the strip behind the front: the vestibule (u 0.5–3.4), the room beyond its partition (3.9–L−0.5), the wall to the court
  const sOpen = [2.2, 3.3], kd = [4.0, 5.0];
  wall(T, sOpen[0], DA, DA + SW, y, y + H); wall(sOpen[1], kd[0], DA, DA + SW, y, y + H); wall(kd[1], L - T, DA, DA + SW, y, y + H);
  for (const [a, b] of [sOpen, kd]) { bag.add('timber', B(a - 0.05, b + 0.05, y + 2.45, y + 2.6, DA - 0.04, DA + SW + 0.04)); bag.add('plaster_white', B(a, b, y + 2.6, y + H, DA, DA + SW)); col.rect(R(a, b, DA, DA + SW), y + 2.45, y + H); }
  wall(3.4, 3.9, T, DA, y, y + H);
  // ── the upper floor round the front range (§16): the court wall with its door at the stair's head and its lattice windows, the partition between the two rooms
  const dC0u = DA + SW, dA = L - T - 1.0, cb = (3.9 + L - T - 1.1) / 2, cwin = [{ c: 1.95, w: 1.2 }, { c: cb, w: 1.4 }];
  bag.add(upper, poly([[T, UF], ...archPoly(dA, UF, 0.9, 2.3), [L - T, UF], [L - T, y + HU], [T, y + HU]], DA, DA + SW, cwin.map(({ c, w }) => [[c - w / 2 + 0.05, UF + 0.95], [c + w / 2 - 0.05, UF + 0.95], [c + w / 2 - 0.05, UF + 2.4], [c - w / 2 + 0.05, UF + 2.4]])));
  col.rect(R(T, dA, DA, DA + SW), UF, y + HU - 0.34); col.rect(R(dA + 0.9, L - T, DA, DA + SW), UF, y + HU - 0.34); col.rect(R(dA, dA + 0.9, DA, DA + SW), UF + 2.3, y + HU - 0.34);
  voussoirs(bag, fr, mu(dA, dA + 0.9), UF, 0.9, 2.3, 0.1, -dC0u - 0.02, -dC0u + 0.03, ['marble_dark', 'marble_smooth'], 5);
  for (const { c, w } of cwin) { bag.add('lattice', B(c - w / 2, c + w / 2, UF + 0.95, UF + 2.4, dC0u, dC0u + 0.06)); bag.add('wood_dark', B(c - w / 2 - 0.06, c + w / 2 + 0.06, UF + 2.4, UF + 2.5, dC0u, dC0u + 0.2)); bag.add('wood_dark', B(c - w / 2 - 0.06, c + w / 2 + 0.06, UF + 0.86, UF + 0.95, dC0u, dC0u + 0.2)); }
  for (const [d0, d1] of [[0.05, 1.2], [2.2, DA]]) { bag.add('plaster_white', B(3.4, 3.9, UF, y + HU - 0.34, d0, d1)); col.rect(R(3.4, 3.9, d0, d1), UF, y + HU - 0.34); }
  bag.add('plaster_white', B(3.4, 3.9, UF + 2.2, y + HU - 0.34, 1.2, 2.2)); col.rect(R(3.4, 3.9, 1.2, 2.2), UF + 2.2, y + HU - 0.34);
  bag.add('wood_dark', B(3.4, 3.9, UF + 2.2, UF + 2.28, 1.15, 2.25));
  for (const [a, b, d0, d1] of [[T, 3.4, 0.05, DA], [3.9, L - T, 0.05, DA], [3.4, 3.9, 1.2, 2.2], [dA, dA + 0.9, DA, dC0u]]) { bag.add('wood_dark', J(a, b, d0, d1, UF, FB)); col.floor(R(a, b, d0, d1), FB); }
  bag.add('flagstone', J(T, 3.4, T, DA, y, fy)); col.floor(R(T, 3.4, T, DA), fy); bag.add('flagstone', J(3.9, L - T, T, DA, y, fy)); col.floor(R(3.9, L - T, T, DA), fy);
  for (const [a, b] of [[T, 3.4], [3.9, L - T]]) {
    bag.add('ceiling_painted', J(a, b, T, DA, y + H - 0.08, y + H));
    for (let k = 0; k < 4; k++) bag.add('timber', J(a, b, T + 0.3 + k * (DA - T - 0.6) / 3 - 0.08, T + 0.3 + k * (DA - T - 0.6) / 3 + 0.08, y + H - 0.3, y + H - 0.08));
  }
  // the vestibule: a mastaba, a jar on its stand, a lamp in the wall
  wall(2.55, 3.4, T, 1.5, y + FL, y + FL + 0.42, S);
  { const [px, pz] = P(3.0, 0.95); F.waterJar(bag, px, fy + 0.42, pz, 0.8); }
  { const [px, pz] = P(T + 0.15, 1.9); F.oilLamp(bag, lights, px, fy + 1.55, pz, 'bronze', 4); bag.add('wood_dark', B(T, T + 0.1, fy + 1.45, fy + 1.55, 1.8, 2.0)); }
  for (let k = 0; k < 3; k++) { const [px, pz] = P(T + 0.05, 1.0 + k * 0.35); bag.add('wood_dark', rod([px, fy + 1.9, pz], [px + 0.18 * fr.N[0] * -1, fy + 1.9, pz + 0.18 * fr.N[1] * -1], 0.015, 4)); }
  // ── the kitchen or the stable in the front range
  const sx0 = 3.9, sx1 = L - T;
  if (kitchen) {
    wall(4.3, sx1 - 0.9, T, T + 0.65, fy, fy + 0.85, S);                                       // the range: a masonry hob under the window
    { const [px, pz] = P((4.3 + sx1 - 0.9) / 2, T + 0.33); F.copperware(bag, px, fy + 0.85, pz, yawU, el.seed, 4); F.brazier(bag, lights, P(5.0, T + 0.33)[0], fy + 0.85, P(5.0, T + 0.33)[1], 0.17); }
    { const [px, pz] = P(sx0 + 0.55, 1.9); bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.42, 0.25], [0.4, 0.6], [0.3, 0.85], [0.2, 0.92], [0.2, 0.96], [0.001, 0.96]], 14, null, px, fy, pz)); bag.add('iron', lathe([[0.2, 0.9], [0.2, 0.93], [0.001, 0.93]], 12, null, px, fy, pz)); col.circle(px, pz, 0.42, fy, fy + 1.0); }  // the tannur
    { const [px, pz] = P(sx1 - 0.45, 1.9); F.waterJar(bag, px, fy, pz, 0.9); col.circle(px, pz, 0.3, fy, fy + 1.0); }
    { const [px, pz] = P(sx0 + 0.3, 1.1); F.pots(bag, px, fy, pz, yawU, 3); }
    for (const sd of [0, 1]) { const u = sd ? sx1 - 1.9 : sx0 + 1.5; bag.add('timber', B(u, u + 1.0, fy + 1.9, fy + 1.95, T, T + 0.25)); const [px, pz] = P(u + 0.5, T + 0.12); F.pots(bag, px, fy + 1.95, pz, yawU, 3); }
  } else {
    wall(4.4, sx1 - 1.0, T, T + 0.6, fy, fy + 0.55, S);                                        // the manger: a stone trough under the window
    bag.add('sacking', J(4.5, sx1 - 1.1, T + 0.1, T + 0.5, fy + 0.4, fy + 0.62));
    { const [px, pz] = P(sx0 + 0.6, 1.9); for (let k = 0; k < 3; k++) F.bale(bag, px, fy + k * 0.3, pz + 0.0, 0.8, 0.3, 0.7, yawU, 'sacking'); col.rect(R(sx0 + 0.2, sx0 + 1.0, 1.5, 2.3), fy, fy + 0.9); }
    { const u = sx1 - 0.9, d = 1.9; for (const s of [-0.5, 0.5]) bag.add('wood_dark', B(u + s - 0.04, u + s + 0.04, fy, fy + 1.1, d - 0.04, d + 0.04)); bag.add('timber', B(u - 0.55, u + 0.55, fy + 1.05, fy + 1.1, d - 0.04, d + 0.04)); const [px, pz] = P(u, d); F.saddlebag(bag, px, fy + 1.1, pz, yawU); col.rect(R(u - 0.55, u + 0.55, d - 0.1, d + 0.1), fy, fy + 1.2); }
    { const [px, pz] = P(sx1 - 0.5, T + 0.5); bag.add('wicker', lathe([[0.001, 0], [0.18, 0], [0.2, 0.3], [0.001, 0.3]], 10, null, px, fy, pz)); }
  }
  // ── the court: flagstones with a square of pebbles at the middle, the fountain, a stone bench, the washing line
  bag.add('flagstone', J(T, L - T, dC0, dC1, y, fy)); col.floor(R(T, L - T, dC0, dC1), fy);
  { const rr = Math.min(0.85, (dC1 - dC0 - 1.3) / 2), uf = Math.max(T + rr + 0.6, Math.min(cu, 5.2 - rr - 0.6)), [px, pz] = P(uf, cd);
    if (rr > 0.3) {
      bag.add('marble_smooth', J(uf - rr - 0.45, uf + rr + 0.45, y + FL, y + FL + 0.012, cd - rr - 0.45, cd + rr + 0.45));
      bag.add('marble_smooth', lathe([[0.001, 0], [rr, 0], [rr, 0.42], [rr - 0.1, 0.42], [rr - 0.1, 0.3], [0.001, 0.3]], 8, null, px, fy, pz)); bag.add('glaze_blue', lathe([[0.001, 0.36], [rr - 0.1, 0.36], [rr - 0.1, 0.34], [0.001, 0.34]], 8, null, px, fy, pz));
      bag.add('marble_smooth', lathe([[0.001, 0.3], [0.12, 0.3], [0.08, 0.5], [0.05, 0.56], [0.001, 0.58]], 8, null, px, fy, pz)); bag.add('water_jet', rod([px, fy + 0.58, pz], [px, fy + 0.82, pz], 0.012, 4)); col.circle(px, pz, rr, fy, fy + 0.45);
    } else { bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.45, 0.45], [0.4, 0.8], [0.25, 0.95], [0.001, 0.95]], 12, null, px, fy, pz)); col.circle(px, pz, 0.45, fy, fy + 1.0); }
  }
  if (dC1 - dC0 >= 2.4 && cu - 0.3 > 4) wall(T, T + 0.55, dC0 + 0.6, Math.min(dC1 - 0.9, dC0 + 3.4), y + FL, y + FL + 0.45, S);
  { const [px, pz] = P(1.7, dC1 - 0.4); F.waterJar(bag, px, fy, pz, 1.0); col.circle(px, pz, 0.3, fy, fy + 1.0); const [qx, qz] = P(2.4, dC1 - 0.35); F.waterJar(bag, qx, fy, qz, 0.8); col.circle(qx, qz, 0.28, fy, fy + 0.9); }
  { const ly = y + H + 1.8, [ax, az] = P(T, dC0 + 0.8), [bx, bz] = P(4.9, dC0 + 0.8); bag.add('rope_fibre', rod([ax, ly, az], [bx, ly, bz], 0.008, 3));
    for (let u = 1.2; u < 4.5; u += 0.45 + rand() * 0.5) { if (rand() < 0.6) { const [px, pz] = P(u, dC0 + 0.8); bag.add(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red'][Math.floor(rand() * 5)], B(u, u + 0.34 + rand() * 0.3, ly - 0.9 - rand() * 0.3, ly, dC0 + 0.78, dC0 + 0.82)); void px; void pz; } } }
  // ── the maq'ad: a loggia hall across the back, open to the court in pointed arches on piers, a painted ceiling on beams
  const n = Math.max(2, Math.min(4, Math.floor((L - 2 * T) / 2.7))), wA = 1.7, wp = (L - 2 * T - n * wA) / (n + 1), holes = [];
  for (let i = 0; i < n; i++) holes.push(archPoly(T + wp + i * (wA + wp), fy, wA, 2.6));
  bag.add('plaster_white', poly([[T, y - 0.3], [L - T, y - 0.3], [L - T, y + H], [T, y + H]], hb - ARC, hb, holes));
  for (let i = 0; i <= n; i++) { const a = T + i * (wA + wp); col.rect(R(a, a + wp, hb - ARC, hb), y, y + H); bag.add(S, B(a, a + wp, y, y + FL + 0.5, hb - ARC - 0.04, hb + 0.04)); }
  for (let i = 0; i < n; i++) { const a = T + wp + i * (wA + wp); col.rect(R(a, a + wA, hb - ARC, hb), y + 2.3, y + H); voussoirs(bag, fr, mu(a, a + wA), fy, wA, 2.6, 0.14, -hb + ARC - 0.07, -hb + ARC - 0.02 + 0.0, ['marble_dark', 'marble_smooth'], 6); }
  bag.add('flagstone', J(T, L - T, hb, D - T, y, fy)); col.floor(R(T, L - T, hb, D - T), fy);
  bag.add('marble_smooth', J(T + 1.5, L - T - 1.5, hb + 0.3, D - T - 0.9, fy, fy + 0.01));
  bag.add('ceiling_painted', J(T, L - T, hb, D - T, y + H - 0.08, y + H)); for (let u = T + 0.2; u < L - T; u += 0.9) bag.add('timber', J(u, u + 0.16, hb, D - T, y + H - 0.32, y + H - 0.08));
  { const a = P(T + 0.05, D - T - 0.02), b = P(L - T - 0.05, D - T - 0.02), tw = P(cu, hb + 1); F.divan(bag, col, a, b, fy, tw, { h: 0.38, depth: 0.85, mattress: rand() < 0.5 ? 'cloth_red' : 'cloth_indigo', backs: ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_indigo'] }); }
  { const cw = Math.max(2.0, Math.min(4.2, L - 2 * T - 3.0)), [px, pz] = P(cu, hb + (D - T - 0.85 - hb) / 2 + 0.05);
    F.carpet(bag, px, fy + 0.012, pz, cw, 1.15, along ? Math.PI / 2 : 0, ['persian', 'blue', 'maroon'][Math.floor(rand() * 3)]); F.trayTable(bag, px, fy + 0.026, pz, { seed: el.seed }); col.circle(px, pz, 0.4, fy, fy + 0.42); }
  { const [px, pz] = P(T + 0.55, hb + 0.55); F.reedMat(bag, px, fy + 0.01, pz, 0.9, 0.7, along ? Math.PI / 2 : 0); F.rahle(bag, px, fy + 0.012, pz, yawIn); F.cushion(bag, P(T + 0.55, hb + 1.2)[0], fy + 0.012, P(T + 0.55, hb + 1.2)[1], 0.6, 0.6, 0.12, 0, 'cloth_green'); col.circle(px, pz, 0.25, fy, fy + 0.4); }
  { const [px, pz] = P(L - T - 0.4, hb + 0.45); F.chest(bag, px, fy, pz, 0.9, 0.5, 0.55, yawIn + (along ? 0 : 0)); col.rect(R(L - T - 0.85, L - T, hb + 0.1, hb + 0.8), fy, fy + 0.6);
    const [bx, bz] = P(L - T - 1.4, hb + 0.6); F.brazier(bag, lights, bx, fy, bz, 0.22); col.circle(bx, bz, 0.28, fy, fy + 0.3); }
  for (let k = 0; k < 2; k++) { const [px, pz] = P(cu + (k ? 1.1 : -1.1), hb + 1.1); F.mosqueLamp(bag, k ? null : lights, px, y + H - 1.15, pz, y + H - 0.08, { k: 1.4, enamel: true, glow: 5, reach: 9 }); }
  { const u0 = cu - 0.9, d = D - T - 0.02; bag.add('timber', B(u0, u0 + 1.8, fy + 1.7, fy + 1.75, d - 0.3, d)); for (let k = 0; k < 4; k++) { const [px, pz] = P(u0 + 0.25 + k * 0.4, d - 0.15); if (k % 2) F.ewer(bag, px, fy + 1.75, pz, 0.6); else F.cup(bag, px, fy + 1.75, pz, k === 0 ? 'glaze_blue' : 'glaze_green', 1.5); } }
  // ══ the upper floor (§16) ══
  const C = { bag, col, lights, B, J, R, P, fr, mir, along, L, seed: el.seed }, Ust = L - T - GW, r3 = rng(el.seed + 77);
  // the stair: a stone flight along the court wall of the front range from beside the kitchen door, its parapet on the court side, to the gallery
  stoneStair(C, { u0: 5.2, u1: Ust, d0: dC0, d1: dC0 + 1.0, y0: fy, y1: FB, ybase: y, n: NS });
  // the gallery along the east wall of the court (boards on beams, two posts, a lattice balustrade on its open side) to the upper maq'ad
  bag.add('wood_dark', B(Ust, L - T, UF - 0.2, FB, dC0, dC1)); col.floor(R(Ust, L - T, dC0, dC1), FB);
  for (const dd of [dC0 + 0.15, (dC0 + dC1) / 2, dC1 - 0.29]) bag.add('timber', B(Ust, L - T, UF - 0.38, UF - 0.2, dd, dd + 0.14));
  for (const dd of [dC0 + 1.25, dC1 - 0.12]) { bag.add('wood_dark', B(Ust + 0.02, Ust + 0.2, y, UF - 0.2, dd - 0.09, dd + 0.09)); const [px, pz] = P(Ust + 0.11, dd); col.circle(px, pz, 0.12, fy, UF); }
  rail(Ust, Ust, dC0 + 1.15, dC1);

  col.rect(R(Ust - 0.04, Ust + 0.06, dC0 + 1.15, dC1), UF, UF + 1.05);
  // the upper maq'ad: boards over the ground one's ceiling, open to the court in pointed arches (the gallery enters by the east bay), a rail across the others
  const wB = 1.6, pier = 0.5, bays = []; for (let u1 = L - T; u1 - wB >= T + 0.3 + 1.08; u1 -= wB + pier) bays.push([u1 - wB, wB]);
  { const fo2 = [[T, UF]]; for (const [u0, w] of bays.slice().reverse()) fo2.push(...archPoly(u0, UF, w, 2.6)); fo2.push([L - T, UF], [L - T, y + HU], [T, y + HU]);
    bag.add('plaster_white', poly(fo2, hb - ARC, hb, [])); }
  bays.forEach(([u0, w], k) => {
    voussoirs(bag, fr, mu(u0, u0 + w), FB, w, 2.6, 0.14, -hb + ARC - 0.07, -hb + ARC - 0.02, ['marble_dark', 'marble_smooth'], 6);
    col.rect(R(u0, u0 + w, hb - ARC, hb), UF + 2.4, y + HU - 0.3);
    if (k > 0) { rail(u0, u0 + w, hb - ARC + 0.025, hb - ARC + 0.025); col.rect(R(u0, u0 + w, hb - ARC, hb - ARC + 0.08), UF, UF + 1.05); }
  });
  { const ends = [T, ...bays.slice().reverse().flatMap(([u0, w]) => [u0, u0 + w]), L - T]; for (let i = 0; i + 1 < ends.length; i += 2) if (ends[i + 1] - ends[i] > 0.01) col.rect(R(ends[i], ends[i + 1], hb - ARC, hb), UF, y + HU - 0.3); }
  bag.add('wood_dark', J(T, L - T, hb - ARC, D - T, UF, FB)); col.floor(R(T, L - T, hb - ARC, D - T), FB);
  // its roof: beams and boards below, the terrace slab above, left open over the ladder-stair on the west wall
  const dL = hb + 0.2, nL = 12, lw = 1.95, dTop = D - T - 0.75;
  for (const [u0, u1, d0, d1] of [[T, L - T, hb - ARC, hb], [T + lw, L - T, hb, D - T], [T + 1.15, T + lw, D - T - 1.2, D - T]]) {
    bag.add('ceiling_painted', J(u0, u1, d0, d1, y + HU - 0.42, y + HU - 0.34));
    for (let k = 0; k < 4; k++) { const a = u0 + 0.3 + k * (u1 - u0 - 0.6) / 3; bag.add('timber', J(a - 0.08, a + 0.08, d0, d1, y + HU - 0.7, y + HU - 0.42)); }
    bag.add(upper, J(u0, u1, d0, d1, y + HU - 0.34, RT));
  }
  col.floor(R(T, L - T, hb - ARC, hb), RT); col.floor(R(T + lw, L - T, hb, D - T), RT); col.floor(R(T + 1.1, T + lw, D - T - 1.2, D - T), RT);
  ladderStair(C, { u0: T + 0.15, u1: T + 1.1, d0: dL, d1: dTop, fl: FB, top: RT, n: nL });
  bag.add('wood_dark', B(T + 0.11, T + 1.14, RT - 0.1, RT, dTop, D - T)); col.floor(R(T + 0.11, T + 1.14, dTop, D - T), RT);   // the hatch landing at the ladder's head
  // the terrace: the malqaf (open shaft, board hood, barred mouth) facing the court, water jars along the parapet
  { const mc = 2.4 + r3() * (L - 3.8), d0 = hb + 0.3;
    bag.add('plaster_white', B(mc - 0.5, mc + 0.5, RT, RT + 1.9, d0 + 0.5, d0 + 0.7)); for (const s of [-1, 1]) bag.add(upper, B(mc + s * 0.5 - (s > 0 ? 0.12 : 0), mc + s * 0.5 + (s < 0 ? 0.12 : 0), RT, RT + 1.8, d0, d0 + 0.7));
    bag.add('wood_dark', B(mc - 0.6, mc + 0.6, RT + 1.8, RT + 1.92, d0 - 0.1, d0 + 0.78)); bag.add('wood_dark', B(mc - 0.5, mc + 0.5, RT + 1.7, RT + 1.8, d0 - 0.02, d0 + 0.02));
    for (let k = 0; k < 4; k++) bag.add('wood_dark', B(mc - 0.4 + k * 0.27, mc - 0.36 + k * 0.27, RT + 0.1, RT + 1.7, d0 - 0.02, d0 + 0.04));
    col.rect(R(mc - 0.6, mc + 0.6, d0 - 0.1, d0 + 0.78), RT - 0.1, RT + 2.0);
    for (let k = 0; k < 2; k++) { const [px, pz] = P(L - T - 0.5 - k * 0.7, D - 0.55); F.waterJar(bag, px, RT, pz, 0.8); col.circle(px, pz, 0.26, RT, RT + 0.8); } }
  // the rooms by use: a store over the vestibule; over the kitchen a sleeping room or a craftsman's workroom; the family's hall over the court
  const fh0 = { u0: T, u1: 3.4, d0: 0.05, d1: DA, y: FB, rand: r3 }, fh1 = { u0: 3.9, u1: L - T, d0: 0.05, d1: DA, y: FB, rand: r3 };
  storeroom(C, fh0);
  if (work) workroom(C, fh1); else bedroom(C, { ...fh1, seatAt: rawshan && !bal ? wins.filter((w) => w.k === 'b').map(({ c, w }) => ({ c, w })) : null });
  familyHall(C, { u0: T + lw + 0.1, u1: L - T, d0: hb, d1: D - T, y: FB, ceil: y + HU - 0.7, rand: r3, lights });
  { const [cx, cz] = P(cu, cd); lights.push({ at: [cx, y + 3.0, cz], color: '#fff0d0', intensity: 3.0, distance: 8 }); }
}

registerStyle('mamluk-cairo', { ...STYLES.mamluk, elements: { ...STYLES.mamluk.elements, cairo_house_open: cairoHouseOpen } });
void box;

/** Walk-check routes (world [x, z]) for the house of lot el: from the lane through the bent entrance and up the stair to the front room and the store, and on to the upper hall, the ladder-stair and the terrace. */
export function houseWalks(el) {
  const { fr, L, D, mir, hb } = houseDims(el), P = (u, d) => fr.P(mir ? L - u : u, -d), dC0 = DA + SW, Ust = L - T - GW, ue = L - T - 0.55;
  const up = [P(1.3, -2.0), P(1.3, 1.2), P(1.3, 2.4), P(2.75, 2.4), P(2.75, dC0 + 0.45), P(4.6, dC0 + 0.45), P(Ust - 0.3, dC0 + 0.45), P(ue, dC0 + 0.45), P(ue, 2.4), P(L - T - 1.9, 2.0), P(6.0, 1.6), P(3.65, 1.7), P(2.0, 1.7)];
  const hall = [...up.slice(0, 7), P(ue, dC0 + 0.45), P(ue, hb + 0.36), P(T + 1.5, hb + 0.36), P(T + 0.55, hb + 0.36), P(T + 0.55, D - T - 0.3), P(T + 1.9, D - T - 0.9)];
  return [up, hall];
}
