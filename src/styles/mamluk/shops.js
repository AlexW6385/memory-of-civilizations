// A shop you can walk into and the sherbet seller's stand (docs/settlements/mamluk-cairo.md §11).

import { box, lathe, rod } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { S, rng, frame, polyGeo, archPoly, archRing } from './kit.js';

/**
 * cairo_shop: { rect (about 9 × 8), face ('e' | 'w' | 'n' | 's': the open front), y, seed } — a spice-and-drugs merchant's
 * shop of one room (a cell opening on the lane under a lintel, its wide front closed by shutters that fold up): the raised
 * wooden floor, shelves on three walls with jars and bottles, sacks of spices and grain, the counter with the scale, the
 * merchant's mat and cushion behind it, a chest, hanging brass, a lamp; stone benches (mastaba) either side of the front.
 * An upper storey of plastered brick over it with a lattice window; the roof flat.
 */
export function cairoShop(el, { bag, col, lights }) {
  const r = el.rect, y = el.y ?? 0, f = el.face ?? 'e', rand = rng(el.seed || 4), t = 0.5, H = 3.7, fr = frame(r, f);
  const [x0, z0, x1, z1] = r, along = f === 'e' || f === 'w', L = along ? z1 - z0 : x1 - x0, D = along ? x1 - x0 : z1 - z0;
  // local frame inside: u along the front, d inward from the front plane (negative outward in `fr`): in(d) = −d
  const I = (u0, u1, y0, y1, d0, d1) => fr.B(u0, u1, y0, y1, -d1, -d0);
  const IR = (u0, u1, d0, d1) => fr.rect(u0, u1, -d1, -d0);
  const op = 3.4, uc = L / 2;
  // the walls: the two sides and the back from the floor to the roof, the front with its opening under the lintel
  const wall = (u0, u1, d0, d1, y0, y1, m = S) => { bag.add(m, I(u0, u1, y0 - (y0 === y ? 0.3 : 0), y1, d0, d1)); col.rect(IR(u0, u1, d0, d1), y0, y1); };
  wall(0, t, 0, D, y, y + H + 3.0); wall(L - t, L, 0, D, y, y + H + 3.0); wall(t, L - t, D - t, D, y, y + H + 3.0);
  wall(0, uc - op / 2, 0, t, y, y + H + 3.0); wall(uc + op / 2, L, 0, t, y, y + H + 3.0);
  wall(uc - op / 2, uc + op / 2, 0, t, y + 3.0, y + H + 3.0);                     // over the opening: the lintel and the wall above
  // the upper storey over the roof: a block in plaster with a lattice window on the street side, the cornice
  bag.add('plaster', I(0.0, L, y + H + 0.5, y + H + 3.0, 0, D)); col.rect(IR(0, L, 0, D), y + H, y + H + 3.0);
  bag.add(S, I(-0.1, L + 0.1, y + H + 3.0, y + H + 3.4, -0.35, D + 0.1));
  bag.add('lattice', I(uc - 0.9, uc + 0.9, y + H + 1.0, y + H + 2.4, -0.47, -0.38)); bag.add('wood_dark', I(uc - 1.0, uc + 1.0, y + H + 0.9, y + H + 1.05, -0.5, 0.0));
  for (const s of [-1, 1]) bag.add('wood_dark', I(uc + s * 0.85 - 0.04, uc + s * 0.85 + 0.04, y + H + 1.0, y + H + 2.4, -0.45, 0));
  // the front's lintel course of joggled stones, the shutters folded up, the benches before the front, the step
  for (let k = 0; k < 7; k++) bag.add(k % 2 ? 'marble_dark' : S, I(uc - op / 2 + k * op / 7, uc - op / 2 + (k + 1) * op / 7, y + 2.65, y + 3.0, -0.05, 0.02));
  bag.add('wood_dark', I(uc - op / 2 + 0.1, uc + op / 2 - 0.1, y + 2.45, y + 2.62, -0.45, -0.05));
  for (const s of [-1, 1]) { const a = s < 0 ? 0 : uc + op / 2, b = s < 0 ? uc - op / 2 : L; bag.add(S, I(a + 0.2, b - 0.2, y, y + 0.7, -0.85, -0.04)); col.rect(IR(a + 0.2, b - 0.2, -0.85, -0.04), y, y + 0.7); }
  bag.add(S, I(uc - op / 2, uc + op / 2, y, y + 0.18, -0.7, 0.2));
  // the floor: boards on joists, raised a hand over the step
  bag.add('wood_dark', I(t, L - t, t * 0 + 0.2, D - t, y, y + 0.2)); col.floor(IR(t, L - t, 0.2, D - t), y + 0.2);
  const fy = y + 0.2;
  // the ceiling: boards on beams
  bag.add('wood_dark', I(t, L - t, t, D - t, y + H - 0.08, y + H)); for (let k = 0; k < 10; k++) bag.add('timber', I(t, L - t, 0.8 + k * (D - 1.6) / 9 - 0.08, 0.8 + k * (D - 1.6) / 9 + 0.08, y + H - 0.32, y + H - 0.08));
  // the plastered lining of the room
  bag.add('stucco_warm', I(t, L - t, D - t - 0.03, D - t, fy, y + H - 0.1)); for (const [a, b] of [[t, t + 0.03], [L - t - 0.03, L - t]]) bag.add('stucco_warm', I(a, b, t, D - t, fy, y + H - 0.1));
  // shelves on the back and side walls: planks at three heights, jars, bottles, boxes
  const potM = ['pottery_dark', 'terracotta', 'glaze_blue', 'glaze_green', 'glaze_white'];
  const shelf = (u0, u1, d) => {
    for (const yy of [1.0, 1.75, 2.5]) {
      bag.add('timber', I(u0, u1, d - 0.4, d, fy + yy, fy + yy + 0.05));
      const n = Math.floor((u1 - u0) / 0.42);
      for (let i = 0; i < n; i++) {
        const u = u0 + (i + 0.5) * (u1 - u0) / n, m = potM[Math.floor(rand() * potM.length)], [px, pz] = fr.P(u, -(d - 0.22)), hh = 0.2 + rand() * 0.14;
        if (rand() < 0.25) bag.add('wood_dark', I(u - 0.15, u + 0.15, fy + yy + 0.05, fy + yy + 0.05 + hh, d - 0.38, d - 0.06));
        else bag.add(m, lathe([[0.001, 0], [0.09, 0.01], [0.14, 0.12 + hh * 0.3], [0.09, hh + 0.12], [0.075, hh + 0.2], [0.095, hh + 0.23]], 8, null, px, fy + yy + 0.05, pz));
      }
    }
    for (let q = 0; q < 2; q++) bag.add('timber', I(u0 + q * (u1 - u0 - 0.1), u0 + q * (u1 - u0 - 0.1) + 0.1, d - 0.4, d, fy, fy + 2.6));
  };
  shelf(t + 0.3, L - t - 0.3, D - t - 0.03);
  // the side walls' shelves: boards along them (a run of planks and what stands on them)
  for (const sd of [-1, 1]) {
    const uw = sd < 0 ? t + 0.03 : L - t - 0.03;
    for (const yy of [1.1, 1.9]) {
      bag.add('timber', I(uw - (sd < 0 ? 0 : 0.35), uw + (sd < 0 ? 0.35 : 0), 1.2, D - t - 0.5, fy + yy, fy + yy + 0.05));
      const n = 8;
      for (let i = 0; i < n; i++) { const d = 1.4 + (i + 0.5) * (D - t - 2.3) / n, u = sd < 0 ? uw + 0.18 : uw - 0.18, [px, pz] = fr.P(u, -d); bag.add(potM[Math.floor(rand() * potM.length)], lathe([[0.001, 0], [0.08, 0.01], [0.12, 0.1], [0.08, 0.26], [0.07, 0.31], [0.09, 0.33]], 8, null, px, fy + yy + 0.05, pz)); }
    }
  }
  // the counter with the scale; the merchant's mat and cushion behind it; the sacks, the chest, brass, the lamp
  const cD = 2.6, cu0 = 1.2, cu1 = L - 1.2;
  bag.add('wood_dark', I(cu0, cu1, cD, cD + 0.7, fy, fy + 1.0)); col.rect(IR(cu0, cu1, cD, cD + 0.7), fy, fy + 1.0);
  bag.add('timber', I(cu0 - 0.05, cu1 + 0.05, cD - 0.05, cD + 0.75, fy + 1.0, fy + 1.06));
  { const [sx, sz] = fr.P(uc + 0.6, -(cD + 0.35)); bag.add('bronze', rod([sx, fy + 1.06, sz], [sx, fy + 1.9, sz], 0.012, 5)); bag.add('bronze', rod([sx - 0.35, fy + 1.9, sz], [sx + 0.35, fy + 1.9, sz], 0.012, 5));
    for (const s of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.12, 0.03], [0.16, 0.06], [0.001, 0.03]], 10, null, sx + s * 0.35, fy + 1.45, sz)); for (const tt of [-0.1, 0.1]) bag.add('iron', rod([sx + s * 0.35 + tt, fy + 1.47, sz], [sx + s * 0.35, fy + 1.9, sz], 0.004, 3)); } }
  { const [bx, bz] = fr.P(uc - 1.2, -(cD + 0.35)); F.cup(bag, bx, fy + 1.06, bz, 'glaze_white', 1.3); F.cup(bag, bx + 0.15, fy + 1.06, bz + 0.05, 'bronze', 1.3); }
  { const [mx, mz] = fr.P(uc - 1.4, -(cD + 1.9)); F.reedMat(bag, mx, fy, mz, 1.6, 1.3, 0); F.cushion(bag, mx, fy + 0.01, mz, 0.8, 0.8, 0.14, 0, 'cloth_red'); }
  // sacks of spices and grain, open at the mouth, before the shelves; a chest; brass trays on the wall
  for (let k = 0; k < 4; k++) { const [px, pz] = fr.P(1.0 + k * 0.9, -(D - 1.3)); F.spiceSacks(bag, px, fy, pz, k * 0.7, 2); col.circle(px, pz, 0.45, fy, fy + 0.7); }
  { const [px, pz] = fr.P(L - 1.2, -(D - 1.0)); F.chest(bag, px, fy, pz, 0.9, 0.55, 0.55, 0); col.circle(px, pz, 0.55, fy, fy + 0.55); }
  { const [px, pz] = fr.P(uc + 1.0, -(D * 0.45)); F.oilLamp(bag, lights, px, fy + 2.6, pz, 'bronze', 0); lights.push({ at: [px, fy + 2.9, pz], color: '#ffc27a', intensity: 3.0, distance: 8 }); bag.add('iron', rod([px, fy + 2.9, pz], [px, y + H - 0.1, pz], 0.01, 4)); }
  // bunches of herbs and bags hung from the beams
  for (let k = 0; k < 5; k++) { const [px, pz] = fr.P(0.9 + k * (L - 1.8) / 4, -(1.8 + rand() * 1.0)); bag.add('rope_fibre', rod([px, y + H - 0.3, pz], [px, y + H - 0.8, pz], 0.01, 3)); bag.add(k % 2 ? 'cloth_green' : 'cloth_brown', lathe([[0.001, 0], [0.07, 0.05], [0.1, 0.25], [0.04, 0.45], [0.001, 0.5]], 7, null, px, y + H - 1.3, pz)); }
  void polyGeo; void archPoly; void archRing;
}

/**
 * sharbat_stall: { at ([x, z]), face, y } — the sherbet and fuqqa' seller's stand on a lane: a counter of wood and stone, behind
 * it a rack of big glazed jars with sealed mouths (the foamy fuqqa'), a tray of brass cups, a brass-lidded jar, a pail, sugar
 * loaves; a cloth awning on two poles striped white and red.
 */
export function sharbatStall(el, { bag, col }) {
  const [ax, az] = el.at, y = el.y ?? 0, f = el.face ?? 'e', w = 2.8, d = 1.5, r = [ax - w / 2, az - d / 2, ax + w / 2, az + d / 2], fr = frame(r, f);
  // the stand's front faces `face` (customers on that side): counter along the face, the rack and jars behind it
  bag.add('wood_dark', fr.B(0, w, y, y + 0.95, 0, 0.55)); col.rect(fr.rect(0, w, 0, 0.55), y, y + 0.95);
  bag.add('timber', fr.B(-0.05, w + 0.05, y + 0.95, y + 1.01, -0.02, 0.6));
  for (const u of [0.0, w - 0.08]) bag.add('wood_dark', fr.B(u, u + 0.08, y + 1.01, y + 2.3, 0.0, 0.08));
  // the rack behind the counter: three big jars on a wooden stand
  bag.add('wood_dark', fr.B(0.1, w - 0.1, y, y + 0.35, -1.0, -0.2)); col.rect(fr.rect(0.1, w - 0.1, -1.0, -0.2), y, y + 1.4);
  for (let k = 0; k < 3; k++) {
    const u = 0.6 + k * 0.8, [px, pz] = fr.P(u, -0.6), m = ['glaze_green', 'glaze_blue', 'terracotta'][k];
    bag.add(m, lathe([[0.001, 0], [0.12, 0.02], [0.27, 0.3], [0.3, 0.5], [0.22, 0.75], [0.14, 0.88], [0.15, 0.95], [0.13, 0.97]], 12, null, px, y + 0.35, pz));
    bag.add('timber', lathe([[0.14, 0], [0.14, 0.04], [0.001, 0.05]], 8, null, px, y + 1.32, pz));
  }
  // the tray of cups, a brass-lidded jar and ladle, sugar loaves
  { const [tx, tz] = fr.P(0.7, 0.28); bag.add('bronze', lathe([[0.001, 0], [0.28, 0.012], [0.3, 0.04], [0.26, 0.04], [0.001, 0.02]], 12, null, tx, y + 1.01, tz)); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; F.cup(bag, tx + Math.cos(a) * 0.14, y + 1.03, tz + Math.sin(a) * 0.14, 'bronze', 1.2); } }
  { const [jx, jz] = fr.P(1.6, 0.28); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.2], [0.14, 0.32], [0.08, 0.38], [0.001, 0.42]], 10, null, jx, y + 1.01, jz)); }
  for (let k = 0; k < 3; k++) { const [sx, sz] = fr.P(2.2 + k * 0.17, 0.3); bag.add('plaster_white', lathe([[0.001, 0], [0.07, 0.01], [0.05, 0.3], [0.001, 0.34]], 7, null, sx, y + 1.01, sz)); }
  { const [px, pz] = fr.P(w + 0.45, 0.2); bag.add('wood_dark', lathe([[0.001, 0], [0.18, 0.0], [0.2, 0.34], [0.001, 0.34]], 10, null, px, y, pz)); }
  // the awning: striped cloth sloping down toward the customers, on two poles
  for (let k = 0; k < 7; k++) bag.add(k % 2 ? 'cloth_red' : 'cloth_white', fr.B(-0.2 + k * (w + 0.4) / 7, -0.2 + (k + 1) * (w + 0.4) / 7, y + 2.35 - 0.0, y + 2.4, -0.9, 1.3));
  for (const u of [-0.15, w + 0.15]) { bag.add('wood_dark', fr.B(u - 0.04, u + 0.04, y, y + 2.4, 1.15, 1.23)); col.rect(fr.rect(u - 0.04, u + 0.04, 1.15, 1.23), y, y + 2.4); }
}
