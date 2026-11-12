// The courtyard house of Fez (dar / riad; docs/settlements/fez.md §5.1): a blank plastered wall to the lane, a door in a plain frame,
// a bent passage (skifa) into a court that is a deep light-well three storeys high, a basin in its tiled floor, the rooms
// round it behind zellij dados and cedar doors, balustrades on the upper floors, a ring of green tiles at the court's rim,
// the roof a plastered terrace behind a parapet.
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { frame } from '../mamluk/kit.js';
import { face, dado, dadoFlat, stucco, rng, q4, dbl, basin, door, gable } from './kit.js';
import * as F from '../mughal/furnish.js';
import { dukkan, wallLamp, bench, weather, beamEnds, shutters, spout, roofTop, orangeTree, potRow, jar } from './front.js';

const WALLS = ['stucco_ochre', 'stucco_ochre', 'stucco_warm', 'stucco_warm', 'mud_plaster', 'limewash_white', 'lime_plaster', 'lime_plaster'];
export const FLOOR = 3.7, UPPER = 3.25;

/** The plan of a house from its element (shared with the town's life): the court, the passage, the dukkan bays, the side rooms. */
export function planOf(el) {
  const r = el.rect, e = el.door ?? 's', rand = rng(el.seed || 3), n = el.storeys ?? 3;
  const [x0, z0, x1, z1] = r, fr = frame(r, e), along = e === 'n' || e === 's';
  const Lw = along ? x1 - x0 : z1 - z0, Dp = along ? z1 - z0 : x1 - x0;
  const mat = WALLS[Math.floor(rand() * WALLS.length)], t = 0.55;
  const cw = Math.max(2.9, Math.min(5.2, Lw * 0.36)), cd = Math.max(3.8, Math.min(8.5, Dp * 0.4));
  let ud = rand() < 0.5 ? 1.5 + rand() * 1.2 : Lw - 1.5 - rand() * 1.2;
  const cu0 = Math.max(t + 2.2, Math.min(Lw - t - 2.2 - cw, Lw / 2 - cw / 2 + (rand() - 0.5) * 1.0)), cu1 = cu0 + cw;
  if (ud > cu0 - 0.8 && ud < cu1 + 0.8) ud = ud < Lw / 2 ? Math.max(0.95, cu0 - 1.0) : Math.min(Lw - 0.95, cu1 + 1.0);
  const dw = 1.25, Dc0 = t + 1.6, Dc1 = Math.min(Dp - t - 3.0, Dc0 + cd), BD = 1.45;
  // the dukkans: bays 2.2–2.6 m wide on the front either side of the passage and the court's way in
  const bays = [];
  if (el.shops?.length && Dc1 - Dc0 >= 3) {
    const lo = Math.min(ud - dw / 2, cu0 + 1.2 - dw / 2) - 0.95, hi = Math.max(ud + dw / 2, cu1 - 1.2 + dw / 2) + 0.95;
    for (const [a, b] of [[0.4, lo], [hi, Lw - 0.4]]) {
      const s = b - a, nb = Math.min(2, Math.floor(s / 2.7)); if (nb < 1) continue;
      const w = Math.min(2.6, s / nb - 0.45);
      for (let k = 0; k < nb; k++) { const c = a + s * (k + 0.5) / nb; bays.push({ u0: c - w / 2, u1: c + w / 2, trade: el.shops[bays.length % el.shops.length] }); }
    }
  }
  // the side rooms of an open house, either side of the court, and their doorways
  const rooms = [];
  if (el.open) {
    const dm = (Dc0 + Dc1) / 2;
    if (cu0 - 0.4 - (t + 0.05) >= 1.9) rooms.push({ u0: t + 0.05, u1: cu0 - 0.4, d0: Dc0 + 0.3, d1: Dc1 - 0.3, door: [cu0 - 0.42, cu0 + 0.02, dm - 0.6, dm + 0.6], side: -1 });
    if (Lw - t - 0.05 - (cu1 + 0.4) >= 1.9) rooms.push({ u0: cu1 + 0.4, u1: Lw - t - 0.05, d0: Dc0 + 0.3, d1: Dc1 - 0.3, door: [cu1 - 0.02, cu1 + 0.42, dm - 0.6, dm + 0.6], side: 1 });
  }
  return { rand, mat, t, cw, cd, ud, cu0, cu1, dw, Dc0, Dc1, Lw, Dp, along, fr, bays, rooms, BD, e, n };
}

export function house(el, ctx) {
  const { bag, col } = ctx;
  const P0 = planOf(el), { rand, mat, t, cw, cd, ud, cu0, cu1, dw, Dc0, Dc1, Lw, Dp, along, fr, bays, rooms: sideRooms, BD, n } = P0;
  const r = el.rect, y = el.y, foot = el.foot ?? y - 0.4, e = el.door ?? 's';
  const [x0, z0, x1, z1] = r;
  const H = FLOOR + UPPER * (n - 1), yT = y + H;
  const W = (u0, u1, D0, D1) => fr.rect(u0, u1, -D1, -D0);
  // the far view: a block with its parapet
  if (el.simple) {
    bag.add(mat, box(x0, foot, z0, x1, yT + 0.8, z1)); if (el.collide !== false) col.rect(r, y, yT + 0.8);
    return;
  }
  // — plan: the court, its passage
  void cw; void cd;
  if (Dc1 - Dc0 < 3) { bag.add(mat, box(x0, foot, z0, x1, yT + 0.8, z1)); col.rect(r, y, yT + 0.8); return; }
  const court = W(cu0, cu1, Dc0, Dc1), leg1 = W(ud - dw / 2, ud + dw / 2, 0, t + 1.6), leg2 = W(Math.min(ud, cu0 + 1.2) - dw / 2, Math.max(ud, cu1 - 1.2) + dw / 2, t + 0.05, t + 1.6);
  // an enterable salon behind the court's rear edge (open houses): the room fills the back range, opening to the court
  const salonD = Dp - t - Dc1;
  const salon = el.open && salonD >= 3.0 ? W(cu0 + 0.35, cu1 - 0.35, Dc1, Dp - t - 0.05) : null;
  // — the ground storey: the solid between the outer walls and the voids
  const inner = fr.rect(0, Lw, -Dp, 0), bayR = bays.map((b) => W(b.u0, b.u1, 0, BD)), roomR = sideRooms.map((q) => W(q.u0, q.u1, q.d0, q.d1)), doorR = sideRooms.map((q) => W(q.door[0], q.door[1], q.door[2], q.door[3])), voids = [court, leg1, leg2, ...(salon ? [salon] : []), ...bayR, ...roomR, ...doorR];
  bag.add(mat, box(x0, foot, z0, x1, y - 0.3, z1));
  for (const p of subtractRects(inner, voids)) { bag.add(mat, box(p[0], y - 0.3, p[1], p[2], y + FLOOR, p[3])); col.rect(p, y - 0.3, y + FLOOR); }
  // the dukkans of the front; the side rooms of an open house (floor, ceiling, dado, divans, a lamp)
  const eye = [];
  bays.forEach((b, i) => { const k = dukkan(bag, col, bayR[i], e, y, b.trade, rand, { laneW: el.laneW, mat }); bag.add(mat, fr.B(b.u0 - 0.0, b.u1, y + 2.8, y + FLOOR + 0.02, -BD, 0)); eye.push({ ...k, trade: b.trade }); });
  sideRooms.forEach((q, i) => {
    const R = roomR[i], dR = doorR[i], [rx0, rz0, rx1, rz1] = R, cx = (rx0 + rx1) / 2, cz = (rz0 + rz1) / 2;
    bag.add('tile_cream', box(rx0, y - 0.3, rz0, rx1, y, rz1)); col.floor(R, y); bag.add('tile_cream', box(dR[0], y - 0.3, dR[1], dR[2], y, dR[3])); col.floor(dR, y);
    bag.add('ceiling_painted', box(rx0, y + 3.2, rz0, rx1, y + FLOOR, rz1));
    const sq = [face('x', rx0, 1), face('x', rx1, -1), face('z', rz0, 1), face('z', rz1, -1)];
    sq.forEach((f, k) => { const [a, b] = k < 2 ? [rz0, rz1] : [rx0, rx1]; const hs = (k < 2 && ((k === 0 && q.side > 0) || (k === 1 && q.side < 0))) || false; void hs; dadoFlat(bag, f, a, b, y, 1.2, []); });
    const wide = rx1 - rx0, deep = rz1 - rz0;
    F.carpet(bag, cx, y + 0.01, cz, Math.max(1.0, Math.min(wide - 0.9, 2.2)), Math.max(1.0, Math.min(deep - 0.9, 2.8)), 0);
    if (wide >= deep) { F.divan(bag, col, [rx0 + 0.3, rz0 + 0.15], [rx1 - 0.3, rz0 + 0.15], y, 's', { depth: 0.7 }); F.chest(bag, rx1 - 0.55, y, rz1 - 0.4, 0.8, 0.45, 0.5, 0); }
    else { F.divan(bag, col, [rx0 + 0.15, rz0 + 0.3], [rx0 + 0.15, rz1 - 0.3], y, 'e', { depth: 0.7 }); F.chest(bag, rx1 - 0.4, y, rz1 - 0.55, 0.45, 0.8, 0.5, 0); }
    F.trayTable(bag, cx, y, cz, { r: 0.32, seed: el.seed + i });
    F.mosqueLamp(bag, ctx.lights, cx, y + 2.5, cz, y + 3.2, { k: 0.7, glow: 1.6, reach: 5 });
  });
  // the passage's floor and the court's; a tile floor with a border; the basin
  for (const v of [leg1, leg2]) { bag.add('cotto_floor', box(v[0], y - 0.3, v[1], v[2], y, v[3])); col.floor(v, y); }
  bag.add('tile_cream', box(court[0], y - 0.3, court[1], court[2], y, court[3])); col.floor(court, y);
  const ccx = (court[0] + court[2]) / 2, ccz = (court[1] + court[3]) / 2;
  bag.add('tile_turquoise', box(court[0] + 0.12, y, court[1] + 0.12, court[2] - 0.12, y + 0.012, court[1] + 0.2)); bag.add('tile_turquoise', box(court[0] + 0.12, y, court[3] - 0.2, court[2] - 0.12, y + 0.012, court[3] - 0.12));
  basin(bag, col, ccx, ccz, y, Math.min(0.6, Math.min(court[2] - court[0], court[3] - court[1]) / 4));
  // the court's planting: a bitter orange in a tub in the corner, pots along the back wall
  if (rand() < 0.85) { const [tx, tz] = fr.P(cu1 - 0.68, -(Dc1 - 0.78)); orangeTree(bag, col, tx, tz, y, 0.85 + rand() * 0.2, !!el.open, el.seed % 17); }
  { const pts = []; for (let k = 0; k < 3; k++) pts.push(fr.P(cu0 + 0.35 + k * 0.5, -(Dc0 + 0.3))); potRow(bag, pts, y); }
  // the passage's ceiling (boards over beams) one storey up is the upper floors' walls: closed by the mass above
  for (const v of [leg1, leg2]) bag.add('cedar', box(v[0], y + 2.9, v[1], v[2], y + FLOOR, v[3]));
  // upper floors over the passage and the salon: the mass again
  const over = (rect) => { if (n > 1) { bag.add(mat, box(rect[0], y + FLOOR, rect[1], rect[2], yT, rect[3])); col.rect(rect, y + FLOOR, yT); } };
  for (const p of subtractRects(inner, [court])) { if (n > 1) { bag.add(mat, box(p[0], y + FLOOR, p[1], p[2], yT, p[3])); col.rect(p, y + FLOOR, yT); } }
  void over;
  // the roof: a terrace over everything but the court, a parapet round the outside, the pent roof of green tiles round the court's rim
  for (const p of subtractRects(inner, [court])) bag.add('plaster_white', box(p[0], yT, p[1], p[2], yT + 0.2, p[3]));
  const par = [[x0, z0, x1, z0 + 0.3], [x0, z1 - 0.3, x1, z1], [x0, z0 + 0.3, x0 + 0.3, z1 - 0.3], [x1 - 0.3, z0 + 0.3, x1, z1 - 0.3]];
  for (const p of par) bag.add(mat, box(p[0], yT + 0.2, p[1], p[2], yT + 0.95, p[3]));
  roofTop(bag, r, yT, court, rand, !!el.rich, gable);
  { const c = court, o = [c[0] - 0.9, c[1] - 0.9, c[2] + 0.9, c[3] + 0.9], tr = [], yo = yT + 0.55, yi = yT + 0.1;
    const ring = (A, yy) => [[A[0], yy, A[1]], [A[2], yy, A[1]], [A[2], yy, A[3]], [A[0], yy, A[3]]], oo = ring(o, yo), ii = ring(c, yi);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q4(tr, oo[i], oo[j], ii[j], ii[i]); }
    bag.add('tile_green', dbl(tr)); bag.add('cedar', box(c[0] - 0.05, yi - 0.2, c[1] - 0.05, c[2] + 0.05, yi, c[3] + 0.05)); // eaves board (the rim)
    // (the rim board must not cover the opening: it is a frame: leave the middle out)
  }
  // — the court's walls: dado and plaster, doors, windows, balustrades
  const fs = [face('z', court[1], 1), face('z', court[3], -1), face('x', court[0], 1), face('x', court[2], -1)];
  const spans = [[court[0], court[2]], [court[0], court[2]], [court[1], court[3]], [court[1], court[3]]];
  const yF = y + FLOOR;
  fs.forEach((f, i) => {
    const [a, b] = spans[i], uc = (a + b) / 2, holes = [];
    // a doorway to a room in the middle of each side but the one the passage enters, and a pair of narrow ones on wide sides
    if (!(i === 1 && !salon && false)) holes.push([uc - 0.55, uc + 0.55, y, y + 2.5]);
    if (salon && i === 1 && f.at === court[3]) holes.length = 0;
    for (const h of holes) { const rr = f.R(0, 0.04, h[0], h[1]); bag.add('opening', box(rr[0], h[2], rr[1], rr[2], h[3], rr[3])); door(bag, f, h[0] + 0.02, h[1] - 0.02, h[2], 2.3, 0.04, { studs: false }); }
    if (el.rich) dado(bag, f, a, b, y, 1.35, salon && i === 1 ? [] : holes, { ribbon: true }); else dadoFlat(bag, f, a, b, y, 1.35, salon && i === 1 ? [] : holes);
    for (let k = 1; k < n; k++) {
      const yk = yF + UPPER * (k - 1);
      // upper windows: a pair of dark, lattice-closed openings; a balustrade of turned cedar at the floor edge
      for (const dd of [-0.9, 0.9]) { if ((b - a) < 2.6 && dd > 0) continue; const rr = f.R(0, 0.05, uc + dd - 0.32, uc + dd + 0.32); bag.add('opening', box(rr[0], yk + 0.5, rr[1], rr[2], yk + 2.3, rr[3])); const g = f.R(0.05, 0.1, uc + dd - 0.36, uc + dd + 0.36); bag.add('lattice', box(g[0], yk + 0.5, g[1], g[2], yk + 2.3, g[3])); }
      const bb = f.R(0.16, 0.2, a + 0.05, b - 0.05); bag.add('cedar', box(bb[0], yk, bb[1], bb[2], yk + 0.1, bb[3])); bag.add('cedar', box(bb[0], yk + 0.95, bb[1], bb[2], yk + 1.03, bb[3]));
      const lp = f.R(0.17, 0.19, a + 0.08, b - 0.08); bag.add('lattice', box(lp[0], yk + 0.1, lp[1], lp[2], yk + 0.95, lp[3]));
    }
    // a stucco band under the rim on the rich houses
    if (el.rich) stucco(bag, f, a, b, yT - 1.3, yT, [], { cell: 0.4, cornice: true });
  });
  // the salon: its floor, ceiling, divans, carpet, lamp; the dado on its walls
  if (salon) {
    const [sx0, sz0, sx1, sz1] = salon;
    bag.add('tile_cream', box(sx0, y - 0.3, sz0, sx1, y, sz1)); col.floor(salon, y);
    bag.add('ceiling_painted', box(sx0, y + 3.2, sz0, sx1, y + FLOOR, sz1));
    for (let k = 0; k < 4; k++) { const f = [face('x', sx0, 1), face('x', sx1, -1), face('z', salon[3] , -1), face('z', salon[1], 1)][k]; if (k === 3) continue; const [a, b] = k < 2 ? [sz0, sz1] : [sx0, sx1]; dadoFlat(bag, f, a, b, y, 1.3, []); }
    const cx = (sx0 + sx1) / 2, cz = (sz0 + sz1) / 2;
    F.carpet(bag, cx, y + 0.01, cz, Math.min(sx1 - sx0 - 1.4, 2.6), Math.min(sz1 - sz0 - 1.0, 3.2), 0);
    F.divan(bag, col, [sx0 + 0.15, sz0 + 0.3], [sx0 + 0.15, sz1 - 0.15], y, 'e', { depth: 0.75 }); F.divan(bag, col, [sx1 - 0.15, sz0 + 0.3], [sx1 - 0.15, sz1 - 0.15], y, 'w', { depth: 0.75 });
    F.trayTable(bag, cx, y + 0.0, cz + 0.2, { r: 0.4, seed: el.seed });
    F.mosqueLamp(bag, ctx.lights, cx, y + 2.6, cz, y + 3.2, { k: 0.8, glow: 2, reach: 6 });
  }
  // — the outer faces: the door in its frame; small windows high up; a cantilevered bay now and then
  const fo = e === 's' ? face('z', z1, 1) : e === 'n' ? face('z', z0, -1) : e === 'e' ? face('x', x1, 1) : face('x', x0, -1);
  const O0 = fr.O, U = fr.U; void O0; void U;
  const uA = ud - dw / 2, uB = ud + dw / 2;
  const base = along ? x0 : z0; const ua = base + uA, ub = base + uB;      // along the wall in world coordinates
  const FR = (d0, d1, u0, u1) => fo.R(d0, d1, u0, u1);
  // the opening is a void in the wall (the passage is hollow right up to the face); frame and leaves
  const fb = [FR(0, 0.12, ua - 0.2, ua), FR(0, 0.12, ub, ub + 0.2), FR(0, 0.12, ua - 0.2, ub + 0.2)];
  bag.add('stucco_cream', box(fb[0][0], y, fb[0][1], fb[0][2], y + 2.7, fb[0][3])); bag.add('stucco_cream', box(fb[1][0], y, fb[1][1], fb[1][2], y + 2.7, fb[1][3]));
  bag.add('stucco_cream', box(fb[2][0], y + 2.5, fb[2][1], fb[2][2], y + 2.7, fb[2][3]));
  // the leaves, opened against the passage's side
  { const lf = fo.R(-0.55, -0.4, ua, ua + 0.1); bag.add('cedar', box(lf[0], y + 0.02, lf[1], lf[2], y + 2.45, lf[3])); }
  const sill = FR(0, 0.25, ua, ub); bag.add('limestone', box(sill[0], y - 0.05, sill[1], sill[2], y + 0.06, sill[3]));
  // eye level on the lane: the foot of the wall, the lamp and the bench by the door, beam ends under the first floor, spouts at the roof
  { const holes = [[ua - 0.3, ub + 0.3], ...bays.map((q) => [base + q.u0 - 0.3, base + q.u1 + 0.3])];
    weather(bag, fo, base, base + Lw, y, H, rand, { holes, seed: el.seed % 7 });
    if (n > 1) beamEnds(bag, fo, base, base + Lw, y + FLOOR - 0.4, holes, 1.0);
    for (let u = base + 1.2; u < base + Lw - 0.5; u += 3.1) spout(bag, fo, u, yT);
    const lampU = ub + 0.55 < base + Lw - 0.3 ? ub + 0.55 : ua - 0.55;
    if (!holes.slice(1).some(([h0, h1]) => lampU > h0 && lampU < h1)) wallLamp(bag, fo, lampU, y + 2.35);
    if ((el.laneW ?? 0) >= 2.6 && (el.seed % 5) < 2 && ub + 2.2 < base + Lw && !bays.length) bench(bag, col, fo, ub + 0.4, ub + 1.9, y);
  }
  if (rand() < 0.5 || el.rich) { const canW = 1.2; void canW; import_canopy(bag, fo, ua - 0.4, ub + 0.4, y + 3.0); }
  // windows: dark openings with cedar lattices high on the facade and the other faces, one or two a storey
  const faces = [fo, ...(along ? [face('x', x0, -1), face('x', x1, 1), face(e === 's' ? 'z' : 'z', e === 's' ? z0 : z1, e === 's' ? -1 : 1)] : [face('z', z0, -1), face('z', z1, 1), face('x', e === 'e' ? x0 : x1, e === 'e' ? -1 : 1)])];
  for (const f of faces) {
    const lenF = (f.ax === 'z') ? x1 - x0 : z1 - z0, a = f.ax === 'z' ? x0 : z0;
    for (let k = 1; k < n; k++) { const m = 1 + Math.floor(rand() * 2); for (let q = 0; q < m; q++) { const u = a + lenF * (0.18 + 0.64 * rand()); if (f === fo && Math.abs(u - (ua + ub) / 2) < 1.0 && k === 1) continue; const yk = y + FLOOR + UPPER * (k - 1) + 1.2; const rr = f.R(0, 0.04, u - 0.25, u + 0.25); bag.add('opening', box(rr[0], yk, rr[1], rr[2], yk + 0.85, rr[3])); const g = f.R(0.04, 0.09, u - 0.3, u + 0.3); bag.add('lattice', box(g[0], yk - 0.04, g[1], g[2], yk + 0.9, g[3])); if (rand() < 0.6) shutters(bag, f, u, yk, 0.5, 0.85, rand() < 0.5 ? 'shutter_brown' : 'shutter_green'); } }
  }
  if (n > 1 && rand() < 0.55 && Lw > 7) {
    // a cantilevered bay over the lane: a cedar box on corbels, lattice on its three faces
    const u = base + Lw * (0.3 + 0.4 * rand()), yb = y + FLOOR + 0.5, w = 1.5, rr = fo.R(0, 0.5, u - w / 2, u + w / 2);
    bag.add('cedar', box(rr[0], yb, rr[1], rr[2], yb + 1.7, rr[3]));
    const g = fo.R(0.5, 0.54, u - w / 2 + 0.12, u + w / 2 - 0.12); bag.add('lattice', box(g[0], yb + 0.25, g[1], g[2], yb + 1.45, g[3]));
    for (const dx of [-0.55, 0.55]) { const c = fo.R(0, 0.4, u + dx - 0.05, u + dx + 0.05); bag.add('cedar', box(c[0], yb - 0.4, c[1], c[2], yb, c[3])); }
    const rf = fo.R(-0.05, 0.6, u - w / 2 - 0.05, u + w / 2 + 0.05); bag.add('tile_green', box(rf[0], yb + 1.7, rf[1], rf[2], yb + 1.8, rf[3]));
  }
  void jar; void WALLS; void disc; void rod; void lathe; void fromTriangles;
}
import { canopy } from './kit.js';
function import_canopy(bag, f, a, b, y) { canopy(bag, f, a, b, y, 0.7, { rise: 0.4 }); }

/** A mass of wall closing a gap between houses (the end of a dead-end lane, a lot the lanes left over). */
export function mass(el, { bag, col }) {
  const r = el.rect, y = el.y, rand = rng(el.seed || 7), n = el.storeys ?? 2, H = FLOOR + UPPER * (n - 1);
  const mat = WALLS[Math.floor(rand() * WALLS.length)];
  bag.add(mat, box(r[0], (el.foot ?? y - 1) - 0.0, r[1], r[2], y + H + 0.8, r[3])); col.rect(r, y, y + H + 0.8);
}
