// The Khan of Jaharkas al-Khalili (a wikala, 1382–89) and a public bath (hammam) of Mamluk Cairo
// (docs/settlements/mamluk-cairo.md §11). cairo_wikala: a court of flags with a fountain, round it a portico of
// pointed arches under the merchants' galleries, behind it the storerooms; shops on the ground floor of the street
// front, the great portal through which the loaded camels come in, four storeys with lattice windows. cairo_hammam: the
// bent entrance, the maslakh with its fountain and platforms, the hot room with its central platform and the glass-
// lit domes, the furnace and its chimney behind.

import { box, lathe, rod } from '../../core/geom.js';
import { arcadeWall } from '../mughal/index.js';
import * as F from '../mughal/furnish.js';
import { S, rng, frame, polyGeo, archPoly, archRing, dbl, cornice } from './kit.js';
import { portalBlock } from './bayn.js';

// ───────────────────────────── the wikala ─────────────────────────────

/** Storey heights: the portico's ground floor, the merchants' floor, two floors of the rab' above. */
const ST = [4.6, 4.0, 3.3, 3.3];
const WH = ST.reduce((a, b) => a + b, 0);

/** Windows in rows on a face of a wing: fr the frame, from u0 to u1, face plane at d0 (outward positive). */
function windows(bag, fr, u0, u1, y, d0, rows, rand, lattice = true) {
  const pitch = 3.0, n = Math.floor((u1 - u0) / pitch), off = (u1 - u0 - n * pitch) / 2;
  for (const [yy, hh, kind] of rows) for (let i = 0; i < n; i++) {
    const u = u0 + off + (i + 0.5) * pitch;
    bag.add('opening', fr.B(u - 0.45, u + 0.45, yy, yy + hh, d0 - 0.02, d0 + 0.05));
    bag.add(S, fr.B(u - 0.6, u + 0.6, yy - 0.18, yy, d0, d0 + 0.14));
    if (kind === 'lattice' && lattice) {
      // a projecting mashrabiya: the hood, the front and sides of turned lattice on corbels
      const D = 0.5, w = 0.62;
      bag.add('wood_dark', fr.B(u - w - 0.08, u + w + 0.08, yy - 0.28, yy - 0.12, d0, d0 + D));
      bag.add('koshi', fr.B(u - w, u + w, yy - 0.12, yy + hh + 0.1, d0 + D - 0.06, d0 + D));
      for (const s of [-1, 1]) bag.add('koshi', fr.B(s < 0 ? u - w - 0.02 : u + w - 0.04, s < 0 ? u - w + 0.04 : u + w + 0.02, yy - 0.12, yy + hh + 0.1, d0, d0 + D - 0.06));
      bag.add('wood_dark', fr.B(u - w - 0.1, u + w + 0.1, yy + hh + 0.1, yy + hh + 0.24, d0, d0 + D + 0.1));
      for (const s of [-1, 1]) bag.add('wood_dark', fr.B(u + s * w * 0.55 - 0.05, u + s * w * 0.55 + 0.05, yy - 0.5, yy - 0.28, d0, d0 + D * 0.7));
    } else if (kind === 'grille') {
      for (let g = 1; g < 3; g++) bag.add('iron', fr.B(u - 0.45, u + 0.45, yy + g * hh / 3 - 0.02, yy + g * hh / 3 + 0.02, d0 + 0.05, d0 + 0.09));
      for (const s of [-0.2, 0.2]) bag.add('iron', fr.B(u + s - 0.02, u + s + 0.02, yy, yy + hh, d0 + 0.05, d0 + 0.09));
    } else bag.add('lattice', fr.B(u - 0.45, u + 0.45, yy, yy + hh, d0 + 0.03, d0 + 0.07));
  }
  void rand;
}

/**
 * cairo_wikala: { rect, y, seed } — the khan; the street front on the west (the portal through the west wing at the
 * middle of the rect), wings 10 m deep round a court of flags, a portico of pointed arches 3 m deep on the court's four
 * sides, the storerooms' doors behind it; the goods of the merchants stacked in the court.
 */
export function cairoWikala(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 9), d = 10, pd = 3;
  const ct = [x0 + d, z0 + d, x1 - d, z1 - d], pr = [ct[0] - pd, ct[1] - pd, ct[2] + pd, ct[3] + pd];   // the court and the portico's outer line
  const zc = (z0 + z1) / 2, pw = 4.4, ph = 7.2, yP = y + ST[0];
  // the court
  bag.add('flagstone', box(ct[0] - 0.3, y - 0.3, ct[1] - 0.3, ct[2] + 0.3, y + 0.04, ct[3] + 0.3)); col.floor(ct, y + 0.04);
  bag.add('flagstone', box(pr[0], y - 0.3, pr[1], pr[2], y + 0.06, pr[3])); col.floor(pr, y + 0.06);
  // the masses: north and south wings, east wing, the west wing split by the passage
  const mass = (r, y0 = y, y1 = y + WH) => { bag.add(S, box(r[0], y0 - 0.4, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  mass([x0, z0, x1, pr[1]]); mass([x0, pr[3], x1, z1]); mass([pr[2], pr[1], x1, pr[3]]);
  mass([x0, pr[1], pr[0], zc - pw / 2]); mass([x0, zc + pw / 2, pr[0], pr[3]]);
  bag.add(S, box(x0, y + ph, zc - pw / 2, pr[0], y + WH, zc + pw / 2)); col.rect([x0, zc - pw / 2, pr[0], zc + pw / 2], y + ph, y + WH);
  // the passage: its floor, its ceiling of boards on beams
  bag.add('flagstone', box(x0, y - 0.3, zc - pw / 2, pr[0], y + 0.06, zc + pw / 2)); col.floor([x0, zc - pw / 2, pr[0], zc + pw / 2], y + 0.06);
  bag.add('wood_dark', box(x0, y + ph - 0.1, zc - pw / 2, pr[0], y + ph, zc + pw / 2));
  for (let k = 0; k < 8; k++) bag.add('timber', box(x0 + 0.5 + k * (pr[0] - x0 - 0.8) / 7 - 0.1, y + ph - 0.35, zc - pw / 2, x0 + 0.5 + k * (pr[0] - x0 - 0.8) / 7 + 0.1, y + ph - 0.1, zc + pw / 2));
  // the portico: the arcade on the court's four edges, the ceiling over it, the wall above, the doors of the storerooms behind
  const arc = [[[ct[0], ct[1]], [ct[2], ct[1]]], [[ct[0], ct[3]], [ct[2], ct[3]]], [[ct[0], ct[1]], [ct[0], ct[3]]], [[ct[2], ct[1]], [ct[2], ct[3]]]];
  for (const [a, b] of arc) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 3.6), arches = [];
    for (let i = 0; i < n; i++) arches.push({ at: (i + 0.5) * L / n, w: Math.min(2.8, L / n - 0.9), h: 3.9, sill: 0, pass: true });
    arcadeWall(bag, col, a, b, y, ST[0], 0.9, S, arches, [(pr[0] + pr[2]) / 2, (pr[1] + pr[3]) / 2]);
  }
  for (const [px, pz] of [[ct[0], ct[1]], [ct[2], ct[1]], [ct[0], ct[3]], [ct[2], ct[3]]]) { bag.add(S, box(px - 0.6, y, pz - 0.6, px + 0.6, y + ST[0], pz + 0.6)); col.rect([px - 0.6, pz - 0.6, px + 0.6, pz + 0.6], y, y + ST[0]); }
  // the ceiling slabs over the portico (the gallery's floor) and the court walls above
  const ring = [[pr[0], pr[1], pr[2], ct[1]], [pr[0], ct[3], pr[2], pr[3]], [pr[0], ct[1], ct[0], ct[3]], [ct[2], ct[1], pr[2], ct[3]]];
  for (const r of ring) { bag.add('wood_dark', box(r[0], yP - 0.1, r[1], r[2], yP + 0.3, r[3])); bag.add(S, box(r[0], yP + 0.3, r[1], r[2], y + WH, r[3])); col.rect(r, yP - 0.1, y + WH); }
  // the court's four faces above the arcade: the galleries' windows, lattice on the third floor
  const cfr = { n: frame(ct, 'n'), s: frame(ct, 's'), w: frame(ct, 'w'), e: frame(ct, 'e') };
  const rows = [[yP + 0.9, 1.7, 'grille'], [yP + ST[1] + 0.9, 1.7, 'lattice'], [yP + ST[1] + ST[2] + 0.9, 1.7, 'lattice']];
  for (const [f, fr] of Object.entries(cfr)) {
    // the faces look into the court: depth from the face plane inward to the court is negative d of the outward frame
    const along = f === 'n' || f === 's', L = along ? ct[2] - ct[0] : ct[3] - ct[1];
    const inv = { O: fr.O, U: fr.U, N: fr.N.map((v) => -v), f, B: (u0, u1, y0, y1, d0, d1) => fr.B(u0, u1, y0, y1, -d1, -d0) };
    windows(bag, inv, 0.5, L - 0.5, y, -0.0, rows, rand);
    // the wall's thickness: the face stands 0.0 from the court edge; a string course over the arcade
    bag.add(S, inv.B(0, L, yP + 0.3, yP + 0.55, 0, 0.12));
  }
  // the outer faces: plain with windows; the west face: shops, the portal
  const faces = { w: frame(el.rect, 'w'), e: frame(el.rect, 'e'), n: frame(el.rect, 'n'), s: frame(el.rect, 's') };
  for (const [f, fr] of Object.entries(faces)) {
    const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0;
    const rowsO = [[y + ST[0] + 0.9, 1.5, 'grille'], [y + ST[0] + ST[1] + 0.9, 1.6, 'lattice'], [y + ST[0] + ST[1] + ST[2] + 0.9, 1.6, 'lattice']];
    windows(bag, fr, 0.8, L - 0.8, y, 0, rowsO, rand);
    cornice(bag, fr, 0, L, y + WH, f === 'w' ? S : S, false);
    bag.add(S, fr.B(0, L, y + WH + 0.28, y + WH + 0.9, 0.55, 0.95));
    bag.add(S, fr.B(0, L, y + ST[0] - 0.12, y + ST[0] + 0.1, 0, 0.1));
    bag.add(S, fr.B(0, L, y + ST[0] + ST[1] - 0.1, y + ST[0] + ST[1] + 0.1, 0, 0.08));
    if (f !== 'w') {
      // the ground storey of the other faces: blind, a few small high grilles
      for (let u = 3; u < L - 2; u += 5.5) { bag.add('opening', fr.B(u - 0.3, u + 0.3, y + 3.0, y + 3.8, -0.02, 0.05)); for (const s of [-0.12, 0.12]) bag.add('iron', fr.B(u + s - 0.015, u + s + 0.015, y + 3.0, y + 3.8, 0.05, 0.08)); }
    }
  }
  // the west face's ground storey: the portal, and shops either side (a pointed opening, the stone bench, the shutter, goods)
  const w = faces.w, uz = zc - z0, L = z1 - z0;
  portalBlock(bag, col, w, uz, pw, ph, y, 0, 'khan', true);
  const goods = ['pottery_dark', 'cloth_indigo', 'cloth_red', 'bronze', 'wicker', 'cloth_ochre', 'glaze_green', 'terracotta'];
  const shops = [];
  for (let u = 2.2; u < L - 2; u += 3.3) if (Math.abs(u - uz) > pw / 2 + 4.2) shops.push(u);
  for (const u of shops) {
    bag.add('opening', polyGeo(w, archPoly(u - 1.1, 0.2 + y, 2.2, 3.6), -0.03, 0.06));
    archRing(bag, 'marble_smooth', w, u - 1.1, 0.2 + y, 2.2, 3.6, 0.14, -0.02, 0.12);
    bag.add(S, w.B(u - 1.3, u + 1.3, y, y + 0.7, 0.04, 0.85)); col.rect(w.rect(u - 1.3, u + 1.3, 0.04, 0.85), y, y + 0.7);
    bag.add('wood_dark', w.B(u - 1.0, u + 1.0, y + 3.6, y + 3.72, 0.06, 0.6));
    const g = goods[Math.floor(rand() * goods.length)], [gx, gz] = w.P(u, 0.45);
    if (g.startsWith('cloth')) for (let k = 0; k < 3; k++) bag.add(g, box(gx - 0.35, y + 0.7 + k * 0.12, gz - 0.35, gx + 0.35, y + 0.82 + k * 0.12, gz + 0.35));
    else for (let k = 0; k < 3; k++) { const [px, pz] = w.P(u - 0.7 + k * 0.7, 0.45); bag.add(g, lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.18], [0.09, 0.34], [0.1, 0.4]], 8, null, px, y + 0.7, pz)); }
  }
  // the court: the fountain, the goods and the gear of the caravans
  const cx = (ct[0] + ct[2]) / 2, cz = (ct[1] + ct[3]) / 2;
  bag.add('marble_smooth', lathe([[1.5, 0], [1.5, 0.5], [1.65, 0.56], [1.65, 0.64], [1.35, 0.64], [1.35, 0.15], [0.001, 0.15]], 8, null, cx, y + 0.04, cz));
  bag.add('water', lathe([[0.001, 0], [1.33, 0]], 8, null, cx, y + 0.5, cz));
  bag.add('marble_smooth', lathe([[0.25, 0], [0.18, 0.5], [0.34, 0.7], [0.1, 0.9], [0.06, 1.5], [0.001, 1.6]], 10, null, cx, y + 0.2, cz));
  col.circle(cx, cz, 1.65, y, y + 0.64);
  for (const [dx, dz] of [[-4.2, -7], [3.8, 6.4], [-3.6, 8.5], [4.4, -9]]) { const ax = cx + dx, az = cz + dz; F.bale(bag, ax, y + 0.05, az, 1.0, 0.7, 0.6, rand() * 3); F.bale(bag, ax + 0.1, y + 0.75, az, 0.9, 0.6, 0.55, rand() * 3, 'cloth_ochre'); col.rect([ax - 0.6, az - 0.5, ax + 0.6, az + 0.5], y, y + 1.35); }
  for (const [dx, dz] of [[4.8, -2], [-4.8, 1.6], [5.2, 10.5]]) { F.waterJar(bag, cx + dx, y + 0.05, cz + dz, 1.3); col.circle(cx + dx, cz + dz, 0.4, y, y + 1.3); }
  F.rolledCarpets(bag, cx - 5.2, y + 0.05, cz - 10, 4, 1.6, 0.3); F.saddlebag(bag, cx + 5.4, y + 0.05, cz - 5, 0.4);
  // a hitching rail along the court's east portico, rings in the piers
  for (let i = 0; i < 5; i++) bag.add('iron', box(ct[2] - 0.75, y + 1.0, ct[1] + 2 + i * 4.8 - 0.05, ct[2] - 0.55, y + 1.12, ct[1] + 2 + i * 4.8 + 0.05));
  // the roof: a parapet and two malqafs over the merchants' rooms
  for (const [a, b, c2, d2] of [[x0, z0, x1, z0 + 0.35], [x0, z1 - 0.35, x1, z1], [x0, z0, x0 + 0.35, z1], [x1 - 0.35, z0, x1, z1]]) bag.add(S, box(a, y + WH, b, c2, y + WH + 0.9, d2));
  void lights;
}

// ───────────────────────────── the hammam ─────────────────────────────

function domeRoof(bag, cx, y, cz, r, h, holes = true) {
  const t = Array.from(lathe([[r, 0], [r * 0.99, h * 0.18], [r * 0.9, h * 0.5], [r * 0.62, h * 0.8], [r * 0.26, h * 0.95], [0.001, h]], 20, null, cx, y, cz).attributes.position.array);
  bag.add('plaster_white', dbl(t));
  if (holes) for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, rr = r * 0.62, hy = y + h * 0.8 - 0.05;
    for (const [off, m] of [[0, 'lamp_white']]) bag.add(m, box(cx + Math.cos(a) * rr * 0.97 - 0.13, hy - 0.13, cz + Math.sin(a) * rr * 0.97 - 0.13, cx + Math.cos(a) * rr * 0.97 + 0.13, hy + 0.13, cz + Math.sin(a) * rr * 0.97 + 0.13));
  }
  bag.add('bronze', lathe([[0.001, 0], [0.2, 0.15], [0.12, 0.4], [0.001, 0.7]], 8, null, cx, y + h, cz));
}

/**
 * cairo_hammam: { rect (24 × 24), y, seed } — the bath. The door on the west wall into a small vestibule, from it north
 * through a door into the maslakh (octagonal fountain, raised platforms along the walls with cushions and towels, a
 * dome with a ring of lights), from it east into the hot room (the wide octagonal marble platform with the hot
 * fountain, the plunge basin in its north end, the glass-lit dome); the furnace and fuel store in the south-east
 * corner under the chimney; blind outer walls, the door framed with a pointed arch.
 */
export function cairoHammam(el, { bag, col, lights }) {
  const [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, t = 0.7, tp = 0.5, HW = 6.4, rand = rng(el.seed || 3);
  const solid = (r, y0 = y, y1 = y + HW, m = S) => { if (r[2] - r[0] < 0.02 || r[3] - r[1] < 0.02) return; bag.add(m, box(r[0], y0 - 0.3, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const zD = Z1 - 3.2, dw = 1.4;                   // the door in the west wall
  // outer walls: west with the door gap
  solid([X0, Z0, X0 + t, zD - dw / 2]); solid([X0, zD + dw / 2, X0 + t, Z1]); solid([X0, zD - dw / 2, X0 + t, zD + dw / 2], y + 2.7, y + HW);
  solid([X1 - t, Z0, X1, Z1]); solid([X0 + t, Z0, X1 - t, Z0 + t]); solid([X0 + t, Z1 - t, X1 - t, Z1]);
  // the partitions: between the vestibule and the maslakh (a door 1.6 wide at x = X0 + 2.9), the furnace block, the maslakh–hot room wall (a door at z = Z0 + 9.6)
  const zP = Z1 - 6.0, xv = X0 + 4.8, xm = X0 + 12.0;
  solid([X0 + t, zP, X0 + 2.1, zP + tp]); solid([X0 + 3.7, zP, X1 - t, zP + tp]); solid([X0 + 2.1, zP, X0 + 3.7, zP + tp], y + 2.6, y + HW);
  solid([xv, zP + tp, X1 - t, Z1 - t]);                                // the furnace and fuel store (solid)
  solid([xm, Z0 + t, xm + tp, Z0 + 8.8]); solid([xm, Z0 + 10.4, xm + tp, zP]); solid([xm, Z0 + 8.8, xm + tp, Z0 + 10.4], y + 2.6, y + HW);
  // floors and the rooms' lining
  const V = [X0 + t, zP + tp, xv, Z1 - t], M = [X0 + t, Z0 + t, xm, zP], H = [xm + tp, Z0 + t, X1 - t, zP];
  bag.add('flagstone', box(V[0], y - 0.3, V[1], V[2], y + 0.04, V[3])); col.floor(V, y + 0.04);
  bag.add('marble_floor', box(M[0], y - 0.3, M[1], M[2], y + 0.04, M[3])); col.floor(M, y + 0.04);
  bag.add('marble_floor', box(H[0], y - 0.3, H[1], H[2], y + 0.04, H[3])); col.floor(H, y + 0.04);
  for (const r of [M, H]) { // a lining of plaster to dado height, darker marble dado
    bag.add('marble_dark', box(r[0], y, r[1], r[2], y + 0.05, r[1] + 0.03)); }
  // the rooms' lining: a dado of white marble with a dark course, plaster above, left open at the doors
  const lineWall = (alongX, at, inward, a, b, gaps, top = y + 4.95) => {
    const cuts = [a, ...gaps.flat(), b], segs = [];
    for (let i = 0; i < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > 0.02) segs.push([cuts[i], cuts[i + 1]]);
    const T = (u0, u1, y0, y1, m, d0, d1) => bag.add(m, alongX ? box(u0, y0, inward > 0 ? at + d0 : at - d1, u1, y1, inward > 0 ? at + d1 : at - d0) : box(inward > 0 ? at + d0 : at - d1, y0, u0, inward > 0 ? at + d1 : at - d0, y1, u1));
    for (const [u0, u1] of segs) { T(u0, u1, y, y + 1.6, 'marble_smooth', 0, 0.04); T(u0, u1, y + 1.6, y + 1.72, 'marble_dark', 0, 0.05); T(u0, u1, y + 1.72, top, 'stucco_warm', 0, 0.03); }
    for (const [g0, g1] of gaps) { T(g0, g1, y + 2.6, top, 'stucco_warm', 0, 0.03); }
  };
  const dM = [X0 + 2.1, X0 + 3.7], dH = [Z0 + 8.8, Z0 + 10.4];
  lineWall(false, M[0], 1, M[1], M[3], []); lineWall(true, M[1], 1, M[0], M[2], []); lineWall(true, M[3], -1, M[0], M[2], [dM]); lineWall(false, M[2], -1, M[1], M[3], [dH]);
  lineWall(false, H[0], 1, H[1], H[3], [dH]); lineWall(true, H[1], 1, H[0], H[2], []); lineWall(true, H[3], -1, H[0], H[2], []); lineWall(false, H[2], -1, H[1], H[3], []);
  lineWall(false, V[0], 1, V[1], V[3], [[zD - dw / 2, zD + dw / 2]], y + 3.3); lineWall(true, V[3], -1, V[0], V[2], [], y + 3.3);
  // the ceilings: slabs with a square hole under each dome; the domes
  const ceil = (r, hw) => {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, yc = y + 5.0, yt = y + HW;
    for (const q of [[r[0], r[1], r[2], cz - hw], [r[0], cz + hw, r[2], r[3]], [r[0], cz - hw, cx - hw, cz + hw], [cx + hw, cz - hw, r[2], cz + hw]]) if (q[2] - q[0] > 0.01 && q[3] - q[1] > 0.01) { bag.add('stucco_warm', box(q[0], yc, q[1], q[2], yt, q[3])); }
    // the zone of transition: a band round the hole stepping out to the dome's ring
    for (let k = 0; k < 2; k++) { const e = hw + 0.35 * (1 - k); bag.add('stucco', box(cx - e, yc - 0.35 - k * 0.0, cz - e, cx + e, yc, cz - e + 0.18)); bag.add('stucco', box(cx - e, yc - 0.35, cz + e - 0.18, cx + e, yc, cz + e)); bag.add('stucco', box(cx - e, yc - 0.35, cz - e, cx - e + 0.18, yc, cz + e)); bag.add('stucco', box(cx + e - 0.18, yc - 0.35, cz - e, cx + e, yc, cz + e)); }
    domeRoof(bag, cx, yc, cz, hw + 0.9, 3.4);
    col.rect(r, yc, yt);
    return [cx, cz];
  };
  const [mx, mz] = ceil(M, 2.6), [hx, hz] = ceil(H, 2.4);
  bag.add('stucco_warm', box(V[0], y + 3.4, V[1], V[2], y + HW, V[3])); col.rect(V, y + 3.4, y + HW);
  // the vestibule: a bench, the clogs, a lamp
  bag.add(S, box(V[0], y, V[1] + 0.6, V[0] + 0.5, y + 0.5, V[3] - 1.4)); col.rect([V[0], V[1] + 0.6, V[0] + 0.5, V[3] - 1.4], y, y + 0.5);
  for (let k = 0; k < 4; k++) bag.add('wood_dark', box(V[0] + 0.6 + k * 0.28, y + 0.04, V[1] + 0.1, V[0] + 0.78 + k * 0.28, y + 0.12, V[1] + 0.45));
  F.oilLamp(bag, lights, V[2] - 0.05, y + 1.6, (V[1] + V[3]) / 2, 'bronze', 1.2);
  // the maslakh: the octagonal fountain of cold water, platforms (mastaba) along the north and west walls with cushions
  bag.add('marble_smooth', lathe([[1.55, 0], [1.55, 0.5], [1.68, 0.55], [1.68, 0.62], [1.4, 0.62], [1.4, 0.12], [0.001, 0.12]], 8, null, mx, y + 0.04, mz));
  bag.add('water', lathe([[0.001, 0], [1.38, 0]], 8, null, mx, y + 0.5, mz));
  bag.add('marble_smooth', lathe([[0.22, 0], [0.16, 0.45], [0.3, 0.6], [0.08, 0.8], [0.001, 1.2]], 10, null, mx, y + 0.16, mz)); col.circle(mx, mz, 1.68, y, y + 0.62);
  bag.add('water_jet', lathe([[0.02, 0], [0.015, 0.5], [0.05, 0.6], [0.001, 0.7]], 6, null, mx, y + 1.35, mz));
  const plat = (r, side) => {
    bag.add('marble_smooth', box(r[0], y, r[1], r[2], y + 0.5, r[3])); col.floor(r, y + 0.5); col.rect(r, y, y + 0.5);
    bag.add('marble_dark', box(r[0], y + 0.5, r[1], r[2], y + 0.53, r[3]));
    const len = Math.max(r[2] - r[0], r[3] - r[1]), k = Math.floor(len / 1.4);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k, px = r[0] + (r[2] - r[0]) * (side === 'w' ? 0.5 : u), pz = r[1] + (r[3] - r[1]) * (side === 'w' ? u : 0.5); F.cushion(bag, px, y + 0.53, pz, side === 'w' ? 0.9 : 1.1, side === 'w' ? 1.1 : 0.9, 0.12, 0, i % 2 ? 'cloth_indigo' : 'cloth_red'); }
  };
  plat([M[0], M[1], M[0] + 1.8, zP - 0.0], 'w'); plat([M[0] + 1.8, M[1], xm, M[1] + 1.8], 'n');
  for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'cloth_white' : 'cloth_blue', box(M[0] + 2.2 + k * 1.2, y + 0.65, M[1] + 0.3, M[0] + 2.9 + k * 1.2, y + 0.82, M[1] + 0.9));   // folded towels
  F.ewer(bag, M[0] + 0.9, y + 0.53, M[3] - 1.0, 1, 0.3); F.brazier(bag, lights, M[2] - 1.4, y, M[3] - 1.4, 0.3);
  F.oilLamp(bag, lights, M[2] - 0.05, y + 2.2, (M[1] + M[3]) / 2 + 3.5, 'bronze', 1.6);
  // the hot room: the wide octagonal platform of marble with the hot fountain, the basin at the north end, bowls
  bag.add('marble_smooth', lathe([[3.3, 0], [3.3, 0.38], [3.1, 0.4], [0.001, 0.4]], 8, null, hx, y + 0.04, hz)); col.floor([hx - 2.2, hz - 2.2, hx + 2.2, hz + 2.2], y + 0.42);
  bag.add('marble_dark', lathe([[3.25, 0.39], [3.25, 0.41], [2.7, 0.41], [2.7, 0.39]], 8, null, hx, y + 0.04, hz));
  bag.add('marble_pink', lathe([[2.3, 0.41], [2.3, 0.42], [1.0, 0.42], [1.0, 0.41]], 8, null, hx, y + 0.04, hz));
  bag.add('marble_smooth', lathe([[0.9, 0.4], [0.9, 0.75], [0.8, 0.78], [0.001, 0.78]], 8, null, hx, y + 0.04, hz));
  bag.add('water', lathe([[0.001, 0], [0.82, 0]], 8, null, hx, y + 0.72, hz));
  bag.add('wood_dark', lathe([[0.001, 0], [0.16, 0], [0.17, 0.2], [0.14, 0.2], [0.001, 0.12]], 8, null, hx + 1.9, y + 0.44, hz + 0.4));
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.14], [0.19, 0.16], [0.001, 0.1]], 8, null, hx - 1.8, y + 0.44, hz - 0.8));
  col.circle(hx, hz, 3.3, y, y + 0.4);
  const pb = [H[0] + 1.0, H[1] + 0.3, H[2] - 1.0, H[1] + 2.8];                       // the basin
  bag.add('marble_smooth', box(pb[0] - 0.2, y, pb[1] - 0.2, pb[2] + 0.2, y + 0.6, pb[3] + 0.2)); bag.add('water', box(pb[0], y + 0.5, pb[1], pb[2], y + 0.53, pb[3])); col.rect([pb[0] - 0.2, pb[1] - 0.2, pb[2] + 0.2, pb[3] + 0.2], y, y + 0.6);
  for (const s of [-1, 1]) bag.add('marble_smooth', box(H[0] + (s < 0 ? 0 : H[2] - H[0] - 0.9), y, H[1] + 4.0, H[0] + (s < 0 ? 0.9 : H[2] - H[0]), y + 0.45, zP - 0.5));   // niches' benches
  for (const [px, pz] of [[H[0] + 0.45, H[1] + 6], [H[2] - 0.45, H[1] + 6]]) col.rect([px - 0.45, pz - 0.5, px + 0.45, pz + 0.5], y, y + 0.45);
  for (let k = 0; k < 4; k++) bag.add('wood_dark', box(H[0] + 0.1, y + 0.45, H[1] + 4.4 + k * 0.4, H[0] + 0.7, y + 0.52, H[1] + 4.7 + k * 0.4));
  F.oilLamp(bag, lights, H[2] - 0.05, y + 1.8, hz, 'bronze', 1.2);
  // the outside: the door's pointed frame, a lantern bracket, the chimney over the furnace, the fuel stacked on the roof's edge
  const wf = frame(el.rect, 'w'), uD = zD - Z0;
  bag.add('opening', polyGeo(wf, archPoly(uD - 0.7, y, 1.4, 2.7), -0.02, 0.06));
  archRing(bag, 'marble_smooth', wf, uD - 0.7, y, 1.4, 2.7, 0.18, -0.02, 0.16);
  bag.add('wood_dark', wf.B(uD - 0.6, uD + 0.6, y, y + 2.3, 0.0, 0.05));
  bag.add('marble_dark', polyGeo(wf, archPoly(uD - 1.0, y + 2.9, 2.0, 1.0), -0.02, 0.06));
  // a coloured band painted round the doorway: ablaq stripes
  for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'stucco_red' : 'stucco', wf.B(uD - 1.5, uD + 1.5, y + 3.1 + k * 0.12, y + 3.2 + k * 0.12, 0, 0.04));
  cornice(bag, wf, 0, Z1 - Z0, y + HW, S, false);
  const sf = frame(el.rect, 's'), nf = frame(el.rect, 'n'), ef = frame(el.rect, 'e');
  for (const fr of [sf, nf, ef]) cornice(bag, fr, 0, fr.f === 'e' ? Z1 - Z0 : X1 - X0, y + HW, S, false);
  for (const [dx, dz] of [[X1 - 5, Z1 - 3.5]]) {
    bag.add('brick', box(dx - 0.9, y + HW, dz - 0.9, dx + 0.9, y + HW + 9, dz + 0.9)); col.rect([dx - 0.9, dz - 0.9, dx + 0.9, dz + 0.9], y + HW, y + HW + 9);
    bag.add('brick', box(dx - 1.1, y + HW + 9, dz - 1.1, dx + 1.1, y + HW + 9.5, dz + 1.1));
  }
  // domes over the rooms are drawn; the lights in their rings
  bag.add('plaster', box(V[0], y + HW, V[1], V[2], y + HW + 0.5, V[3]));
  void rand; void rod;
}
