// The castle's own buildings opened to walk into (docs/settlements/edo-himeji.md §5.8): the plastered storehouses (kura) of the baileys —
// rice in straw bales, the lord's arms and banners, cloth and the stores' ledgers — and the ground rooms of the turrets (yagura) with
// their gun racks, spear racks, a raised mat for the watch, an armour on its stand. Every room has its door on the bailey side, a plank
// floor, the barred windows letting daylight in high up, one hanging lantern. Frames are (u along the door's wall, v inward from it).

import { box, lathe, rod } from '../../core/geom.js';
import { chochin, barrel } from './town.js';

const PL = 'plaster_castle', WD = 'wood_dark', TL = 'tile_grey', CE = 'cedar';

/** The frame of a room whose door is in face `f` ('n' | 's' | 'e' | 'w') of rect, walls T thick: W (width along the face), D (depth), P(u, v) → [x, z], rot (facing inward). */
export function frameOf(rect, f, T) {
  const [x0, z0, x1, z1] = rect, along = f === 'n' || f === 's';
  const W = (along ? x1 - x0 : z1 - z0) - 2 * T, D = (along ? z1 - z0 : x1 - x0) - 2 * T;
  const P = (u, v) => (f === 'n' ? [x0 + T + u, z0 + T + v] : f === 's' ? [x1 - T - u, z1 - T - v] : f === 'w' ? [x0 + T + v, z1 - T - u] : [x1 - T - v, z0 + T + u]);
  const rot = { n: Math.PI, s: 0, w: -Math.PI / 2, e: Math.PI / 2 }[f];       // facing the door from inside = outward; inward is the opposite
  const o = P(0, 0), face = (du, dv) => { const p = P(du, dv); return Math.atan2(-(p[0] - o[0]), -(p[1] - o[1])); };
  return { W, D, P, rot, face, R: (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; } };
}

/** The wall of a room's face in two pieces with the door cut in it, and the lintel over: rect pieces [x0, z0, x1, z1] by face. */
export function doorWall(bag, col, r, f, at, w, dh, y, h, mat = PL, lintelTop = null) {
  const along = f === 'n' || f === 's', lo = at - w / 2, hi = at + w / 2, a0 = along ? r[0] : r[1], a1 = along ? r[2] : r[3];
  const piece = (p0, p1) => (along ? [p0, r[1], p1, r[3]] : [r[0], p0, r[2], p1]);
  for (const q of [piece(a0, lo), piece(hi, a1)]) if (q[2] - q[0] > 0.01 && q[3] - q[1] > 0.01) { bag.add(mat, box(q[0], y, q[1], q[2], y + h, q[3])); col.rect(q, y, y + h); }
  const l = piece(lo, hi); bag.add(mat, box(l[0], y + dh, l[1], l[2], y + (lintelTop ?? h), l[3]));
  // the jambs and the head beam of dark timber, standing a little out of the wall
  const e = 0.05, J = (u0, u1) => { const q = piece(u0, u1); return [q[0] - (along ? 0 : e), q[1] - (along ? e : 0), q[2] + (along ? 0 : e), q[3] + (along ? e : 0)]; };
  const jl = J(lo - 0.13, lo), jr = J(hi, hi + 0.13), hd = J(lo - 0.13, hi + 0.13);
  bag.add(WD, box(jl[0], y, jl[1], jl[2], y + dh + 0.12, jl[3])); bag.add(WD, box(jr[0], y, jr[1], jr[2], y + dh + 0.12, jr[3])); bag.add(WD, box(hd[0], y + dh, hd[1], hd[2], y + dh + 0.14, hd[3]));
}

const hang = (bag, lights, x, y, z, k = 1) => {
  chochin(bag, x, y, z, 0.17, 0.44, false);
  lights?.push({ at: [x, y - 0.25, z], color: '#ffcf8a', intensity: 2.6 * k, distance: 8 });
};

/** A bale of rice (tawara): a straw cylinder, bound twice. Stood upright. */
function tawara(bag, x, y, z) {
  bag.add('thatch', lathe([[0.001, 0], [0.2, 0], [0.23, 0.15], [0.23, 0.45], [0.2, 0.6], [0.001, 0.6]], 9, null, x, y, z));
}

/**
 * kura_in: a storehouse opened { rect (7 × 8 m), y, seed, face (the door's wall, 's' default), goods ('rice' | 'arms' | 'cloth') }.
 * Walls 0.5 m on the granite plinth and the dark namako base under the white plaster, the plank floor 0.15 m up, the ceiling at 3.6 m
 * under the loft's boards, small barred windows high in the long walls, the doors of the gable end folded back against its jambs.
 */
export function kuraIn(el, { bag, col, lights }) {
  const rect = el.rect, y = el.y ?? 0, f = el.face ?? 's', T = 0.5, H = 5.4, PH = 1.35, [x0, z0, x1, z1] = rect;
  const fr = frameOf(rect, f, T), fy = y + 0.15, along = f === 'n' || f === 's';
  // the plinth and the base: whole round, cut at the door
  const doorW = 1.7, doorH = 2.7, uc = fr.W / 2;
  const [dx, dz] = fr.P(uc, 0), at = along ? dx : dz;
  const sides = { n: [x0, z0, x1, z0 + T], s: [x0, z1 - T, x1, z1], w: [x0, z0 + T, x0 + T, z1 - T], e: [x1 - T, z0 + T, x1, z1 - T] };
  for (const [fc, r] of Object.entries(sides)) {
    if (fc === f) {
      doorWall(bag, col, r, fc, at, doorW, doorH, y, H, PL);
      // the plinth and the base on the door's wall, cut at the door
      for (const [m, ya, yb] of [['granite_grey', y, y + 0.28], ['tile_dark', y + 0.28, y + PH]]) {
        const lo = at - doorW / 2, hi = at + doorW / 2, a0 = along ? r[0] : r[1], a1 = along ? r[2] : r[3];
        for (const [p0, p1] of [[a0, lo], [hi, a1]]) { const q = along ? [p0 - (m === 'granite_grey' ? 0.04 : 0), r[1] - 0.04, p1 + 0.0, r[3] + 0.04] : [r[0] - 0.04, p0, r[2] + 0.04, p1]; bag.add(m, box(q[0], ya, q[1], q[2], yb, q[3])); }
      }
      continue;
    }
    bag.add('granite_grey', box(r[0] - (fc === 'w' ? 0.04 : 0), y, r[1] - (fc === 'n' ? 0.04 : 0), r[2] + (fc === 'e' ? 0.04 : 0), y + 0.28, r[3] + (fc === 's' ? 0.04 : 0)));
    bag.add('tile_dark', box(r[0], y + 0.28, r[1], r[2], y + PH, r[3]));
    bag.add(PL, box(r[0], y + PH, r[1], r[2], y + H, r[3]));
    col.rect(r, y, y + H);
  }
  // the corners the long faces' pieces do not cover are covered by the n/s pieces (they run the full length); the white seams on the outer faces
  const e = 0.012;
  for (let v = y + 0.43; v < y + PH - 0.05; v += 0.3) {
    for (const [a, b, c, d] of [[x0 - e, z0 - e, x1 + e, z0], [x0 - e, z1, x1 + e, z1 + e], [x0 - e, z0, x0, z1], [x1, z0, x1 + e, z1]]) bag.add(PL, box(a, v, b, c, v + 0.035, d));
  }
  // the barred windows high in the two long walls (outside: the dark opening with its grille; inside: daylight)
  const wy = y + PH + 1.5, longAlongX = x1 - x0 >= z1 - z0;
  for (const side of (along ? ['w', 'e'] : ['n', 's'])) {
    if (side === f) continue;
    for (const s of [0.3, 0.7]) {
      if (longAlongX === along) { /* the window's wall is a short one: the same */ }
      const c = side === 'n' || side === 's' ? [x0 + (x1 - x0) * s, side === 'n' ? z0 : z1] : [side === 'w' ? x0 : x1, z0 + (z1 - z0) * s], o = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[side];
      const ax = Math.abs(o[0]), az = Math.abs(o[1]);
      bag.add('opening', box(c[0] - (az ? 0.35 : 0) + (ax ? Math.min(0, o[0] * 0.03) : 0), wy, c[1] - (ax ? 0.35 : 0) + (az ? Math.min(0, o[1] * 0.03) : 0), c[0] + (az ? 0.35 : 0) + (ax ? Math.max(0, o[0] * 0.03) : 0), wy + 0.55, c[1] + (ax ? 0.35 : 0) + (az ? Math.max(0, o[1] * 0.03) : 0)));
      const ci = [c[0] - o[0] * (T - 0.02), c[1] - o[1] * (T - 0.02)];
      bag.add('daylight_plain', box(ci[0] - (az ? 0.35 : 0.01), wy, ci[1] - (ax ? 0.35 : 0.01), ci[0] + (az ? 0.35 : 0.01), wy + 0.55, ci[1] + (ax ? 0.35 : 0.01)));
      for (let k = -2; k <= 2; k++) { const q = [c[0] + (az ? k * 0.14 : 0) + o[0] * 0.04, c[1] + (ax ? k * 0.14 : 0) + o[1] * 0.04]; bag.add('iron', box(q[0] - 0.012, wy, q[1] - 0.012, q[0] + 0.012, wy + 0.55, q[1] + 0.012)); }
    }
  }
  // the roof, as the solid kura's: the loft's ceiling under it
  const inn = [x0 + T, z0 + T, x1 - T, z1 - T];
  bag.add(CE, box(inn[0], y + 3.45, inn[1], inn[2], y + 3.6, inn[3]));
  for (let a = 0.6; a < fr.D - 0.2; a += 1.1) { const q = fr.R(0, a, fr.W, a + 0.2); bag.add(WD, box(q[0], y + 3.2, q[1], q[2], y + 3.45, q[3])); }
  bag.add(PL, box(x0, y + 3.6, z0, x1, y + H, z1));            // the loft: not entered
  col.rect(rect, y + 3.6, y + H);
  col.floor(rect, y + H);
  // the floor: planks on joists, a threshold stone at the door
  bag.add(CE, box(inn[0], y, inn[1], inn[2], fy, inn[3])); col.floor(inn, fy);
  { const q = fr.R(uc - 0.9, -0.55, uc + 0.9, 0.02); bag.add('granite_grey', box(q[0], y, q[1], q[2], fy + 0.02, q[3])); col.floor(q, fy + 0.02); }
  // the door's leaves folded back against the outer face, plastered, thick, with iron bosses
  for (const s of [-1, 1]) { const q = fr.R(uc + s * (doorW / 2 + 0.1), -0.28, uc + s * (doorW / 2 + 1.05), -0.04); bag.add(PL, box(q[0], y + 0.3, q[1], q[2], y + doorH, q[3])); }
  // what the store holds, by its goods
  const B = (m, u0, v0, u1, v1, ya, yb, c = true) => { const r = fr.R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.05, yb); };
  const goods = el.goods ?? 'rice', W = fr.W, D = fr.D;
  // the clerk's low desk by the door (the ledger, the brush and the ink), with the cushion
  { const du = 0.45; B(WD, du, 0.5, du + 0.9, 1.0, fy, fy + 0.3); B('cloth_white', du + 0.1, 0.62, du + 0.55, 0.9, fy + 0.3, fy + 0.34, false); B('cloth_indigo', du + 0.15, 1.15, du + 0.75, 1.65, fy, fy + 0.07, false); }
  if (goods === 'rice') {
    // two blocks of bales on slatted pallets either side of the aisle, three tiers high; sacks of beans at the back
    for (const [u0, u1] of [[0.25, 2.0], [W - 2.0, W - 0.25]]) for (let v = 2.4; v < D - 0.5; v += 1.55) {
      B(WD, u0, v, u1, v + 1.3, fy, fy + 0.12, false);
      col.rect(fr.R(u0, v, u1, v + 1.3), fy, fy + 1.9);
      for (let k = 0; k < 3; k++) for (let a = u0 + 0.22; a < u1 - 0.1; a += 0.45) for (let b = v + 0.22; b < v + 1.25; b += 0.45) { const [px, pz] = fr.P(a, b); tawara(bag, px, fy + 0.12 + k * 0.6, pz); }
    }
  } else if (goods === 'arms') {
    // spear and halberd racks along the walls, armour chests, the lord's banners rolled in a rack, a stack of lacquered boxes
    for (const [u0, u1] of [[0.12, 0.55], [W - 0.55, W - 0.12]]) for (let v = 2.2; v < D - 0.6; v += 1.8) {
      B(WD, u0, v, u1, v + 1.5, fy, fy + 0.16); B(WD, u0 + 0.04, v + 0.1, u1 - 0.04, v + 1.4, fy + 1.55, fy + 1.62, false);
      for (let k = 0; k < 6; k++) { const [px, pz] = fr.P((u0 + u1) / 2, v + 0.2 + k * 0.22); bag.add(WD, rod([px, fy + 0.16, pz], [px, fy + 2.5, pz], 0.022, 5)); bag.add('iron', rod([px, fy + 2.5, pz], [px, fy + 2.78, pz], 0.014, 4)); }
    }
    for (const [u, v] of [[W / 2 - 1.5, D - 1.0], [W / 2, D - 1.0], [W / 2 + 1.5, D - 1.0]]) { B('lacquer_black', u - 0.55, v - 0.35, u + 0.55, v + 0.35, fy, fy + 0.6); B('gilt_bronze', u - 0.57, v - 0.04, u + 0.57, v + 0.04, fy + 0.28, fy + 0.36, false); B('lacquer_red', u - 0.4, v - 0.25, u + 0.4, v + 0.25, fy + 0.6, fy + 1.0, false); }
    for (let k = 0; k < 5; k++) { const [px, pz] = fr.P(W / 2 - 1.0 + k * 0.5, D - 0.3); bag.add(['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_black', 'cloth_maroon'][k], rod([px, fy + 0.1, pz], [px, fy + 2.2, pz], 0.06, 6)); }
  } else {
    // shelves of bolts of cloth and lacquered document boxes, chests of drawers, jars of oil
    for (const [u0, u1] of [[0.12, 0.55], [W - 0.55, W - 0.12]]) for (let v = 2.0; v < D - 0.5; v += 1.7) {
      B(WD, u0, v, u1, v + 1.5, fy, fy + 0.1, false); col.rect(fr.R(u0, v, u1, v + 1.5), fy, fy + 2.1);
      for (let r = 0; r < 4; r++) { B(WD, u0, v, u1, v + 1.5, fy + 0.5 + r * 0.5, fy + 0.54 + r * 0.5, false); for (let a = v + 0.12; a < v + 1.4; a += 0.4) B(['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_maroon'][(r + Math.floor(a * 3)) % 4], u0 + 0.04, a, u1 - 0.04, a + 0.32, fy + 0.54 + r * 0.5, fy + 0.8 + r * 0.5, false); }
    }
    for (let k = 0; k < 4; k++) { const [px, pz] = fr.P(W / 2 - 0.9 + k * 0.6, D - 0.5); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0], [0.26, 0.3], [0.2, 0.62], [0.14, 0.72], [0.001, 0.72]], 9, null, px, fy, pz)); col.circle(px, pz, 0.26, fy, fy + 0.72); }
    B('lacquer_black', W / 2 - 0.7, D - 1.6, W / 2 + 0.7, D - 1.1, fy, fy + 0.9); B('iron', W / 2 - 0.7, D - 1.12, W / 2 + 0.7, D - 1.1, fy + 0.2, fy + 0.7, false);
  }
  // fire buckets and a ladder (a stair to the loft would be here)
  for (const [u, v] of [[W - 0.4, 0.4], [W - 0.4, 0.9]]) barrel(bag, WD, ...(() => { const p = fr.P(u, v); return [p[0], fy, p[1]]; })(), 0.17, 0.3);
  { const p = fr.P(W / 2, D * 0.45); hang(bag, lights, p[0], y + 3.4, p[1]); }
}

/**
 * What a turret's ground room holds { rect (the turret's), y, h, T, face (the door's wall), seed }: a raised mat for the watch at the back with
 * its low table, brazier and ledger, a rack of spears, an armour on its stand, the powder kegs, a chest, the lantern; pieces placed in the room's
 * frame, clear of the aisle from the door and of the windows' racks.
 */
export function turretFurnish(bag, col, lights, { rect, y, h, T, face, seed = 1 }) {
  const fr = frameOf(rect, face, T), fy = y + 0.0, W = fr.W, D = fr.D, uc = W / 2;
  const B = (m, u0, v0, u1, v1, ya, yb, c = true) => { const r = fr.R(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const at = (u, v) => fr.P(u, v);
  // the watch's raised mat at the back left: planks 0.4 m up under the tatami, the low table, a brazier, the ledger
  { const u1 = Math.min(3.4, W * 0.5 - 0.5); B(CE, 0.1, D - 2.7, u1, D - 0.1, fy, fy + 0.4); col.floor(fr.R(0.1, D - 2.7, u1, D - 0.1), fy + 0.4); B('reed_mat', 0.1, D - 2.7, u1, D - 0.1, fy + 0.4, fy + 0.45, false);
    for (let a = 1.0; a < u1; a += 0.9) B('cloth_black', a - 0.015, D - 2.7, a + 0.015, D - 0.1, fy + 0.45, fy + 0.452, false);
    B(WD, 0.6, D - 1.8, 1.5, D - 1.2, fy + 0.45, fy + 0.72, false); B('cloth_white', 0.8, D - 1.7, 1.2, D - 1.4, fy + 0.72, fy + 0.74, false);
    const p = at(u1 - 0.45, D - 0.7); bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0], [0.22, 0.2], [0.001, 0.2]], 10, null, p[0], fy + 0.45, p[1])); bag.add('iron', lathe([[0.001, 0], [0.1, 0.02], [0.14, 0.12], [0.07, 0.18], [0.001, 0.2]], 10, null, p[0], fy + 0.65, p[1]));
    B('cloth_indigo', 0.3, D - 2.5, 0.95, D - 1.9, fy + 0.45, fy + 0.5, false); }
  // the spear rack along the right wall's far half: a bar at the foot and one at the top, the spears standing
  { const v0 = D * 0.5 + 0.3, v1 = D - 0.5; if (v1 - v0 > 1.0) { B(WD, W - 0.5, v0, W - 0.1, v1, fy, fy + 0.15); B(WD, W - 0.46, v0 + 0.04, W - 0.14, v1 - 0.04, fy + 1.5, fy + 1.58, false);
    for (let v = v0 + 0.2; v < v1 - 0.15; v += 0.22) { const p = at(W - 0.3, v); bag.add(WD, rod([p[0], fy + 0.15, p[1]], [p[0], fy + 2.5, p[1]], 0.022, 5)); bag.add('iron', rod([p[0], fy + 2.5, p[1]], [p[0], fy + 2.78, p[1]], 0.014, 4)); } } }
  // an armour on its stand at the back, between the mat and the rack: the cuirass in indigo lacing, the helmet with its crest
  { const [u, v] = [W * 0.72, D - 0.7], p = at(u, v);
    B(WD, u - 0.3, v - 0.25, u + 0.3, v + 0.25, fy, fy + 0.1); bag.add(WD, rod([p[0], fy + 0.1, p[1]], [p[0], fy + 1.2, p[1]], 0.03, 5));
    B('lacquer_black', u - 0.26, v - 0.17, u + 0.26, v + 0.17, fy + 0.85, fy + 1.4, false); B('cloth_indigo', u - 0.27, v - 0.12, u + 0.27, v + 0.12, fy + 0.85, fy + 1.05, false); B('lacquer_red', u - 0.4, v - 0.12, u - 0.26, v + 0.12, fy + 1.1, fy + 1.4, false); B('lacquer_red', u + 0.26, v - 0.12, u + 0.4, v + 0.12, fy + 1.1, fy + 1.4, false);
    bag.add('iron', lathe([[0.001, 0], [0.13, 0.02], [0.14, 0.12], [0.08, 0.2], [0.001, 0.22]], 9, null, p[0], fy + 1.4, p[1])); bag.add('gilt_bronze', rod([p[0], fy + 1.62, p[1]], [p[0], fy + 1.86, p[1]], 0.012, 4));
    col.circle(p[0], p[1], 0.38, fy, fy + 1.9); }
  // powder kegs and the shot chest by the door's side wall; a lacquered chest
  for (const [u, v] of [[W - 0.4, 0.5], [W - 0.4, 1.1], [W - 0.4, 1.7]]) { const p = at(u, v); barrel(bag, WD, p[0], fy, p[1], 0.24, 0.5); col.circle(p[0], p[1], 0.26, fy, fy + 0.5); }
  B('lacquer_black', 0.15, 0.5, 0.75, 1.5, fy, fy + 0.55); B('gilt_bronze', 0.14, 0.95, 0.76, 1.0, fy + 0.2, fy + 0.3, false);
  // the lantern
  { const p = at(uc, D * 0.5); hang(bag, lights, p[0], y + h - 0.3, p[1]); }
  void seed; void TL;
}

/** The people of the opened rooms (positions in the room's frame, for the town's life plan): [{ at, y, rot, kind, pose }]. */
export function insidePeople(kind, el) {
  const rect = el.rect, y = el.y ?? 0, f = el.face ?? 's';
  if (kind === 'kura') {
    const fr = frameOf(rect, f, 0.5), fy = y + 0.15;
    // the clerk kneeling at his desk before the bales, facing it (inward is +v: he looks toward the door side, v decreasing)
    return [{ at: fr.P(0.9, 1.4), y: fy + 0.07, rot: fr.face(0, -1), pose: 'seiza' }];
  }
  const fr = frameOf(rect, f, el.T ?? 0.5), W = fr.W, D = fr.D, fy = y;
  // the watch: a retainer kneeling on the raised mat at the back left, another standing at the spear rack
  return [{ at: fr.P(Math.min(3.4, W * 0.5 - 0.5) - 0.9, D - 0.55), y: fy + 0.45, rot: fr.face(-1, 0), pose: 'seiza' }, { at: fr.P(W - 1.0, D * 0.5 + 0.1), y: fy, rot: fr.face(1, 0), pose: 'stand' }];
}
