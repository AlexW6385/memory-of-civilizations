// The Cairene town house you can walk into (docs/settlements/mamluk-cairo.md §14): a lot of 8.5–13 × 9.5–11 m built round
// a small court — the street front of cased stone below and plaster above, its upper storey leaning out on corbels with
// lattice windows; the doorway in a pointed arch on one side; behind it the bent entrance (dihliz: a vestibule whose
// far wall blocks the view, the way turning aside into the court); the court with its fountain, stone bench and washing
// line, lit from above; across it the maq'ad (the loggia hall of the family's day, open to the court in pointed arches,
// its divan, carpet, tray, lamps); and in the front range beside the vestibule a kitchen or a stable. The upper storeys
// are shut (plastered mass with lattice windows to the lane and to the court).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import '../../styles/mamluk/index.js';
import * as F from '../../styles/mughal/furnish.js';
import { S, rng, frame, polyGeo, archPoly, voussoirs } from '../../styles/mamluk/kit.js';

const T = 0.5, H = 3.4, HU = 6.6, DA = 2.9, SW = 0.4, ARC = 0.45, FL = 0.15;
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
    { id: 'house ' + (rng(el.seed + 5)() < 0.5 ? 'kitchen' : 'stable'), rect: R(3.95, L - T - 0.05, T + 0.05, DA - 0.05), y: y + FL, kind: 'hall' }];
}

/**
 * cairo_house_open: { rect, front ('n'|'e'|'s'|'w': the lane side), seed, y, storeys } — see the header.
 */
export function cairoHouseOpen(el, { bag, col, lights }) {
  const { fr, L, D, mir, hb, R, m, along } = houseDims(el), y = el.y ?? 0, fy = y + FL, rand = rng(el.seed + 9);
  const kitchen = rng(el.seed + 5)() < 0.5, upper = PLAST[Math.floor(rand() * PLAST.length)];
  const B = (u0, u1, y0, y1, d0, d1) => { const [a, b] = m(u0, u1); return fr.B(a, b, y0, y1, -d1, -d0); };
  const P = (u, d) => fr.P(mir ? L - u : u, -d);
  const wall = (u0, u1, d0, d1, y0, y1, mat = 'plaster_white') => { bag.add(mat, B(u0, u1, y0, y1, d0, d1)); col.rect(R(u0, u1, d0, d1), y0, y1); };
  const yawU = along ? -Math.PI / 2 : 0, yawIn = Math.atan2(fr.N[0], fr.N[1]);   // along the lane; facing into the house
  const dC0 = DA + SW, dC1 = hb - ARC, cu = L / 2, cd = (dC0 + dC1) / 2;
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
  // the upper storeys: a plaster mass leaning out 0.45 on corbels over the lane (stone cornice course, a dentil band under it)
  bag.add(upper, B(0, L, y + H, y + HU, -ARC, DA + SW)); col.rect(R(0, L, -ARC, DA + SW), y + H, y + HU + 0.2);
  for (let u = 0.3; u < L - 0.3; u += 0.9) { bag.add('wood_dark', B(u, u + 0.16, y + H - 0.32, y + H, -0.2, 0)); bag.add('wood_dark', B(u, u + 0.16, y + H - 0.16, y + H, -ARC, -0.2)); }
  bag.add(S, B(-0.05, L + 0.05, y + H, y + H + 0.12, -ARC - 0.08, 0.1)); bag.add(S, B(-0.05, L + 0.05, y + HU, y + HU + 0.18, -ARC - 0.12, DA + SW + 0.05));
  // the windows of the lane: lattice oriels (rawshan) of turned wood, plain shuttered ones; their number and kind by the lot
  const nw = Math.max(1, Math.min(3, Math.floor(L / 3.6))), rawshan = rand() < 0.6;
  for (let i = 0; i < nw; i++) {
    const c = (i + 0.5) * L / nw + (rand() - 0.5) * 0.5, big = rawshan && (i !== 1 || rand() < 0.5), w = big ? 1.6 : 0.9;
    if (big) {
      bag.add('lattice', B(c - w / 2, c + w / 2, y + H + 0.95, y + H + 2.45, -ARC - 0.38, -ARC - 0.06));
      for (const s of [-1, 1]) bag.add('wood_dark', B(c + s * w / 2 - 0.05, c + s * w / 2 + 0.05, y + H + 0.85, y + H + 2.55, -ARC - 0.42, -ARC));
      bag.add('wood_dark', B(c - w / 2 - 0.08, c + w / 2 + 0.08, y + H + 2.45, y + H + 2.6, -ARC - 0.46, -ARC)); bag.add('wood_dark', B(c - w / 2 - 0.08, c + w / 2 + 0.08, y + H + 0.78, y + H + 0.95, -ARC - 0.46, -ARC));
      bag.add('wood_dark', B(c - w / 2 - 0.04, c + w / 2 + 0.04, y + H + 2.6, y + H + 2.66, -ARC - 0.5, -ARC + 0.04));
      bag.add('timber', B(c - 0.4, c + 0.4, y + H + 1.35, y + H + 1.4, -ARC - 0.4, -ARC - 0.38));       // the middle rail of the screen
    } else {
      bag.add('shutter_brown', B(c - w / 2, c + w / 2, y + H + 1.05, y + H + 2.35, -ARC - 0.03, -ARC)); bag.add('wood_dark', B(c - w / 2 - 0.06, c + w / 2 + 0.06, y + H + 2.35, y + H + 2.45, -ARC - 0.08, -ARC));
      bag.add('wood_dark', B(c - 0.02, c + 0.02, y + H + 1.05, y + H + 2.35, -ARC - 0.06, -ARC - 0.03));
    }
  }
  // a third storey set back from the lane, its terrace parapet; the roof's parapet and a malqaf (wind catcher) facing the court
  const top = (el.storeys ?? 2) >= 3 ? HU + 2.9 : HU;
  if (top > HU) { bag.add(upper, B(1.2, L - 1.2, y + HU + 0.2, y + top, 1.3, 5.0)); col.rect(R(1.2, L - 1.2, 1.3, 5.0), y + HU, y + top + 0.2); bag.add(S, B(1.1, L - 1.1, y + top, y + top + 0.16, 1.2, 5.1)); }
  for (const [u0, u1, d0, d1] of [[-0.05, L + 0.05, -ARC - 0.1, -ARC + 0.3], [-0.05, L + 0.05, D - 0.3, D + 0.05], [-0.05, 0.3, 0, D], [L - 0.3, L + 0.05, 0, D]]) bag.add(S, B(u0, u1, y + HU + 0.18, y + HU + 0.72, d0, d1));
  if (rand() < 0.6) { const mc = 1.5 + rand() * (L - 3), d0 = hb + 0.3; bag.add(upper, B(mc - 0.5, mc + 0.5, y + HU + 0.2, y + HU + 1.9, d0, d0 + 0.7)); bag.add('wood_dark', B(mc - 0.58, mc + 0.58, y + HU + 1.9, y + HU + 2.02, d0 - 0.06, d0 + 0.76)); bag.add('plaster_white', B(mc - 0.4, mc + 0.4, y + HU + 0.9, y + HU + 1.7, d0 - 0.03, d0)); }
  for (let k = 0; k < 2; k++) if (rand() < 0.6) { const [px, pz] = P(0.7 + rand() * (L - 1.4), 0.25 - ARC * 0); F.waterJar(bag, px, y + HU + 0.18, pz + 0, 0.7); }
  // ── the shell round the court: the party walls and the back wall to the full height
  wall(0, T, 0, D, y, y + HU); wall(L - T, L, 0, D, y, y + HU); wall(T, L - T, D - T, D, y, y + HU);
  // ── the strip behind the front: the vestibule (u 0.5–3.4), the room beyond its partition (3.9–L−0.5), the wall to the court
  const sOpen = [2.2, 3.3], kd = [L - T - 2.3, L - T - 1.3];
  wall(T, sOpen[0], DA, DA + SW, y, y + H); wall(sOpen[1], kd[0], DA, DA + SW, y, y + H); wall(kd[1], L - T, DA, DA + SW, y, y + H);
  for (const [a, b] of [sOpen, kd]) { bag.add('timber', B(a - 0.05, b + 0.05, y + 2.45, y + 2.6, DA - 0.04, DA + SW + 0.04)); bag.add('plaster_white', B(a, b, y + 2.6, y + H, DA, DA + SW)); col.rect(R(a, b, DA, DA + SW), y + 2.45, y + H); }
  wall(3.4, 3.9, T, DA, y, y + H);
  bag.add('flagstone', B(T, 3.4, T, DA, y, fy)); col.floor(R(T, 3.4, T, DA), fy); bag.add('flagstone', B(3.9, L - T, T, DA, y, fy)); col.floor(R(3.9, L - T, T, DA), fy);
  for (const [a, b] of [[T, 3.4], [3.9, L - T]]) {
    bag.add('ceiling_painted', B(a, b, T, DA, y + H - 0.08, y + H));
    for (let k = 0; k < 4; k++) bag.add('timber', B(a, b, T + 0.3 + k * (DA - T - 0.6) / 3 - 0.08, T + 0.3 + k * (DA - T - 0.6) / 3 + 0.08, y + H - 0.3, y + H - 0.08));
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
    for (const sd of [0, 1]) { const u = sd ? sx1 - 1.9 : sx0 + 1.5; bag.add('timber', B(u, u + 1.0, 1.9 + fy - y, 1.95 + fy - y, T, T + 0.25)); const [px, pz] = P(u + 0.5, T + 0.12); F.pots(bag, px, y + 1.95 + FL + 0.05, pz, yawU, 3); }
  } else {
    wall(4.4, sx1 - 1.0, T, T + 0.6, fy, fy + 0.55, S);                                        // the manger: a stone trough under the window
    bag.add('sacking', B(4.5, sx1 - 1.1, T + 0.1, T + 0.5, fy + 0.4, fy + 0.62));
    { const [px, pz] = P(sx0 + 0.6, 1.9); for (let k = 0; k < 3; k++) F.bale(bag, px, fy + k * 0.3, pz + 0.0, 0.8, 0.3, 0.7, yawU, 'sacking'); col.rect(R(sx0 + 0.2, sx0 + 1.0, 1.5, 2.3), fy, fy + 0.9); }
    { const u = sx1 - 0.9, d = 1.9; for (const s of [-0.5, 0.5]) bag.add('wood_dark', B(u + s - 0.04, u + s + 0.04, fy, fy + 1.1, d - 0.04, d + 0.04)); bag.add('timber', B(u - 0.55, u + 0.55, fy + 1.05, fy + 1.1, d - 0.04, d + 0.04)); const [px, pz] = P(u, d); F.saddlebag(bag, px, fy + 1.1, pz, yawU); col.rect(R(u - 0.55, u + 0.55, d - 0.1, d + 0.1), fy, fy + 1.2); }
    { const [px, pz] = P(sx1 - 0.5, T + 0.5); bag.add('wicker', lathe([[0.001, 0], [0.18, 0], [0.2, 0.3], [0.001, 0.3]], 10, null, px, fy, pz)); }
  }
  // ── the court: flagstones with a square of pebbles at the middle, the fountain, a stone bench, the washing line
  bag.add('flagstone', B(T, L - T, dC0, dC1, y, fy)); col.floor(R(T, L - T, dC0, dC1), fy);
  { const rr = Math.min(0.85, (dC1 - dC0 - 1.3) / 2), [px, pz] = P(cu, cd);
    if (rr > 0.3) {
      bag.add('marble_smooth', B(cu - rr - 0.45, cu + rr + 0.45, y + FL, y + FL + 0.012, cd - rr - 0.45, cd + rr + 0.45));
      bag.add('marble_smooth', lathe([[0.001, 0], [rr, 0], [rr, 0.42], [rr - 0.1, 0.42], [rr - 0.1, 0.3], [0.001, 0.3]], 8, null, px, fy, pz)); bag.add('glaze_blue', lathe([[0.001, 0.36], [rr - 0.1, 0.36], [rr - 0.1, 0.34], [0.001, 0.34]], 8, null, px, fy, pz));
      bag.add('marble_smooth', lathe([[0.001, 0.3], [0.12, 0.3], [0.08, 0.5], [0.05, 0.56], [0.001, 0.58]], 8, null, px, fy, pz)); bag.add('water_jet', rod([px, fy + 0.58, pz], [px, fy + 0.82, pz], 0.012, 4)); col.circle(px, pz, rr, fy, fy + 0.45);
    } else { bag.add('terracotta', lathe([[0.001, 0], [0.3, 0], [0.45, 0.45], [0.4, 0.8], [0.25, 0.95], [0.001, 0.95]], 12, null, px, fy, pz)); col.circle(px, pz, 0.45, fy, fy + 1.0); }
  }
  if (dC1 - dC0 >= 2.4 && cu - 0.3 > 5) wall(T, T + 0.55, dC0 + 0.6, Math.min(dC1 - 0.5, dC0 + 3.4), y + FL, y + FL + 0.45, S);
  { const [px, pz] = P(L - T - 0.5, dC0 + 0.5); F.waterJar(bag, px, fy, pz, 1.0); col.circle(px, pz, 0.3, fy, fy + 1.0); const [qx, qz] = P(L - T - 0.5, dC0 + 1.2); F.waterJar(bag, qx, fy, qz, 0.8); col.circle(qx, qz, 0.28, fy, fy + 0.9); }
  { const ly = y + H + 1.8, [ax, az] = P(T, dC0 + 0.8), [bx, bz] = P(L - T, dC0 + 0.8); bag.add('rope_fibre', rod([ax, ly, az], [bx, ly, bz], 0.008, 3));
    for (let u = 1.2; u < L - 1.4; u += 0.45 + rand() * 0.5) { if (rand() < 0.6) { const [px, pz] = P(u, dC0 + 0.8); bag.add(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red'][Math.floor(rand() * 5)], B(u, u + 0.34 + rand() * 0.3, ly - 0.9 - rand() * 0.3, ly, dC0 + 0.78, dC0 + 0.82)); void px; void pz; } } }
  // the court's upper walls: lattice windows of the women's rooms looking down into it, on the strip's wall and the hall's
  for (const [dd, dir] of [[dC0, 1], [dC1, -1]]) {
    const n = Math.max(1, Math.floor((L - 2 * T) / 3.4));
    for (let i = 0; i < n; i++) { const c = T + (i + 0.5) * (L - 2 * T) / n; bag.add('lattice', B(c - 0.7, c + 0.7, y + H + 0.9, y + H + 2.4, dir > 0 ? dd : dd - 0.12, dir > 0 ? dd + 0.12 : dd)); bag.add('wood_dark', B(c - 0.78, c + 0.78, y + H + 2.4, y + H + 2.5, dir > 0 ? dd - 0.0 : dd - 0.2, dir > 0 ? dd + 0.2 : dd + 0.0)); }
  }
  // ── the maq'ad: a loggia hall across the back, open to the court in pointed arches on piers, a painted ceiling on beams
  const n = Math.max(2, Math.min(4, Math.floor((L - 2 * T) / 2.7))), wA = 1.7, wp = (L - 2 * T - n * wA) / (n + 1), holes = [];
  for (let i = 0; i < n; i++) holes.push(archPoly(T + wp + i * (wA + wp), fy, wA, 2.6));
  bag.add('plaster_white', poly([[T, y - 0.3], [L - T, y - 0.3], [L - T, y + H], [T, y + H]], hb - ARC, hb, holes));
  for (let i = 0; i <= n; i++) { const a = T + i * (wA + wp); col.rect(R(a, a + wp, hb - ARC, hb), y, y + H); bag.add(S, B(a, a + wp, y, y + FL + 0.5, hb - ARC - 0.04, hb + 0.04)); }
  for (let i = 0; i < n; i++) { const a = T + wp + i * (wA + wp); col.rect(R(a, a + wA, hb - ARC, hb), y + 2.3, y + H); voussoirs(bag, fr, mu(a, a + wA), fy, wA, 2.6, 0.14, -hb + ARC - 0.07, -hb + ARC - 0.02 + 0.0, ['marble_dark', 'marble_smooth'], 6); }
  bag.add('flagstone', B(T, L - T, hb, D - T, y, fy)); col.floor(R(T, L - T, hb, D - T), fy);
  bag.add('marble_smooth', B(T + 1.5, L - T - 1.5, hb + 0.3, D - T - 0.9, fy, fy + 0.01));
  bag.add('ceiling_painted', B(T, L - T, hb, D - T, y + H - 0.08, y + H)); for (let u = T + 0.2; u < L - T; u += 0.9) bag.add('timber', B(u, u + 0.16, hb, D - T, y + H - 0.32, y + H - 0.08));
  { const a = P(T + 0.05, D - T - 0.02), b = P(L - T - 0.05, D - T - 0.02), tw = P(cu, hb + 1); F.divan(bag, col, a, b, fy, tw, { h: 0.38, depth: 0.85, mattress: rand() < 0.5 ? 'cloth_red' : 'cloth_indigo', backs: ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_indigo'] }); }
  { const cw = Math.max(2.0, Math.min(4.2, L - 2 * T - 3.0)), [px, pz] = P(cu, hb + (D - T - 0.85 - hb) / 2 + 0.05);
    F.carpet(bag, px, fy + 0.012, pz, cw, 1.15, along ? Math.PI / 2 : 0, ['persian', 'blue', 'maroon'][Math.floor(rand() * 3)]); F.trayTable(bag, px, fy + 0.026, pz, { seed: el.seed }); col.circle(px, pz, 0.4, fy, fy + 0.42); }
  { const [px, pz] = P(T + 0.55, hb + 0.55); F.reedMat(bag, px, fy + 0.01, pz, 0.9, 0.7, along ? Math.PI / 2 : 0); F.rahle(bag, px, fy + 0.012, pz, yawIn); F.cushion(bag, P(T + 0.55, hb + 1.2)[0], fy + 0.012, P(T + 0.55, hb + 1.2)[1], 0.6, 0.6, 0.12, 0, 'cloth_green'); col.circle(px, pz, 0.25, fy, fy + 0.4); }
  { const [px, pz] = P(L - T - 0.4, hb + 0.45); F.chest(bag, px, fy, pz, 0.9, 0.5, 0.55, yawIn + (along ? 0 : 0)); col.rect(R(L - T - 0.85, L - T, hb + 0.1, hb + 0.8), fy, fy + 0.6);
    const [bx, bz] = P(L - T - 1.4, hb + 0.6); F.brazier(bag, lights, bx, fy, bz, 0.22); col.circle(bx, bz, 0.28, fy, fy + 0.3); }
  for (let k = 0; k < 2; k++) { const [px, pz] = P(cu + (k ? 1.1 : -1.1), hb + 1.1); F.mosqueLamp(bag, k ? null : lights, px, y + H - 1.15, pz, y + H - 0.08, { k: 1.4, enamel: true, glow: 5, reach: 9 }); }
  { const u0 = cu - 0.9, d = D - T - 0.02; bag.add('timber', B(u0, u0 + 1.8, fy + 1.7, fy + 1.75, d - 0.3, d)); for (let k = 0; k < 4; k++) { const [px, pz] = P(u0 + 0.25 + k * 0.4, d - 0.15); if (k % 2) F.ewer(bag, px, fy + 1.75, pz, 0.6); else F.cup(bag, px, fy + 1.75, pz, k === 0 ? 'glaze_blue' : 'glaze_green', 1.5); } }
  { const [cx, cz] = P(cu, cd); lights.push({ at: [cx, y + 3.0, cz], color: '#fff0d0', intensity: 3.0, distance: 8 }); }
}

registerStyle('mamluk-cairo', { ...STYLES.mamluk, elements: { ...STYLES.mamluk.elements, cairo_house_open: cairoHouseOpen } });
void box;
