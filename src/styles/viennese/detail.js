// The small things that make a Viennese front read as lived in and weathered (docs/settlements/vienna.md §5, §12): the soot under the
// cornice and the damp above the plinth, rain streaks under the sills, patches of exposed brick and of fresh plaster, drainpipes,
// flower boxes and curtains and blinds at the windows, enamel signs, the oriel (Erker) on a front, the round corner turret, the
// rear face of a house on its Hof with the Pawlatschen galleries, and the Durchhaus passage with its lamp, its Portier's window and
// its letter boxes. All drawn on a face's own frame (u along the front, v up, d outward; styles/dutch/facade.js).
import { box, lathe, rod } from '../../core/geom.js';
import { prism, fbox } from '../dutch/facade.js';

/** Soot, damp, streaks, patches and pipes on one front. o: { w, H, G (ground floor height), floors, kind, lod, seed-stream r, trim }. */
export function weather(bag, F, y, o) {
  const { w, H, G, floors, r, kind } = o, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  const bied = kind === 'biedermeier';
  // the soot under the cornice, in blotches of different lengths (the chimneys of a coal-fired city)
  const cTop = H - (bied ? 0.5 : 0.95);
  for (let u = 0.3 + r() * 1.5; u < w - 0.6; u += 1.6 + r() * 3.4) { const L = 0.9 + r() * 2.2; A('plaster_damp', u, Math.min(w - 0.1, u + L), cTop - 0.5 - r() * 0.9, cTop, 0.02, 0.04); }
  // the damp that rises from the plinth (the Biedermeier houses have no rustication to hide it)
  if (bied) for (let u = 0.2 + r() * 1.2; u < w - 0.5; u += 1.2 + r() * 2.4) A('plaster_damp', u, Math.min(w - 0.1, u + 0.7 + r() * 1.4), 0.5, 0.9 + r() * 0.9, 0.02, 0.04);
  // rain streaks under the sills of the upper floors, by a few windows
  const bays = o.bays, bw = w / bays;
  for (let s = 2; s < floors.length; s++) for (let i = 0; i < bays; i++) {
    if (r() > 0.34) continue;
    const u = (i + 0.5) * bw + (r() - 0.5) * 0.5, v0 = floors[s] + 0.55;
    A('plaster_streak', u - 0.55, u - 0.42, v0 - 1.5 - r() * 1.2, v0, 0.025, 0.05); A('plaster_streak', u + 0.42, u + 0.55, v0 - 1.1 - r() * 1.2, v0, 0.025, 0.05);
  }
  // a patch of the plaster gone (the brick showing) and one of fresh plaster, low on the front
  if (r() < 0.5) { const u = 0.4 + r() * (w - 1.6), v = G + 0.3 + r() * 1.2, pw = 0.5 + r() * 0.9, ph = 0.4 + r() * 0.8; A('brick_baked', u, u + pw, v, v + ph, 0.03, 0.06); A('plaster_streak', u - 0.1, u, v - 0.1, v + ph + 0.1, 0.025, 0.05); A('plaster_streak', u + pw, u + pw + 0.1, v - 0.1, v + ph + 0.1, 0.025, 0.05); }
  if (r() < 0.4) { const u = 0.4 + r() * (w - 2.4), v = G + 1.2 + r() * 4, pw = 1.2 + r() * 1.6, ph = 0.8 + r() * 1.4; A('plaster_white', u, u + pw, v, v + ph, 0.035, 0.07); }
  // the drainpipes at the two ends of the front, with their brackets, and the gutter's mouth at the pavement
  for (const u of [0.18, w - 0.18]) { A('iron', u - 0.045, u + 0.045, 0.2, H - 0.35, 0.02, 0.13); for (let v = 2.2; v < H - 1; v += 3.0) A('iron', u - 0.08, u + 0.08, v, v + 0.05, 0.0, 0.12); A('iron', u - 0.06, u + 0.06, 0.1, 0.35, 0.02, 0.24); }
}

/** A flower box under a window: the painted box, the green and the red, white and ochre of geraniums. */
export function flowerBox(bag, F, y, u, v0, ww, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), u0 = u - ww / 2 - 0.06, u1 = u + ww / 2 + 0.06;
  A('wood_painted', u0, u1, v0 - 0.42, v0 - 0.16, 0.14, 0.46); A('iron', u0 + 0.12, u0 + 0.16, v0 - 0.2, v0 - 0.1, 0.0, 0.16); A('iron', u1 - 0.16, u1 - 0.12, v0 - 0.2, v0 - 0.1, 0.0, 0.16);
  A('cloth_green', u0 + 0.04, u1 - 0.04, v0 - 0.16, v0 + 0.1, 0.16, 0.44);
  const f = ['cloth_red', 'paint_white', 'cloth_red', 'paint_ochre'], n = Math.max(3, Math.round((u1 - u0) / 0.28));
  for (let k = 0; k < n; k++) { const x = u0 + 0.14 + k * (u1 - u0 - 0.28) / Math.max(1, n - 1); A(f[Math.floor(r() * f.length)], x - 0.07, x + 0.07, v0 + 0.08, v0 + 0.2 + r() * 0.1, 0.22 + r() * 0.1, 0.36 + r() * 0.06); }
}

/** Curtains pulled aside or a half-lowered blind behind the panes of an upper window (frame u, sill v0, height hh). */
export function curtains(bag, F, y, u, v0, ww, hh, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), u0 = u - ww / 2 + 0.08, u1 = u + ww / 2 - 0.08, vt = v0 + hh - 0.08, k = r();
  if (k < 0.45) { const c = ['cloth_white', 'cloth_white', 'linen'][Math.floor(r() * 3)], cw = 0.24 + r() * 0.12; A(c, u0, u0 + cw, v0 + 0.1, vt, 0.055, 0.075); A(c, u1 - cw, u1, v0 + 0.1, vt, 0.055, 0.075); A(c, u0, u1, vt - 0.14, vt, 0.055, 0.075); }
  else if (k < 0.7) { const c = ['cloth_ochre', 'cloth_green', 'cloth_white', 'shutter_green'][Math.floor(r() * 4)]; A(c, u0, u1, vt - 0.3 - r() * 0.9, vt, 0.056, 0.074); }
  else if (k < 0.8) A('cloth_red', u0 + 0.02, u1 - 0.02, v0 + 0.1, v0 + 0.5, 0.0, 0.05);   // a red eiderdown airing on the sill
}

/** A small enamel advertising plate (blue and white, or red and white) beside a door. */
export function enamelSign(bag, F, y, u, v, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), a = r() < 0.5 ? 'paint_blue' : 'cloth_red';
  A(a, u - 0.3, u + 0.3, v, v + 0.42, 0.0, 0.03); A('paint_white', u - 0.24, u + 0.24, v + 0.12, v + 0.2, 0.03, 0.045); A('paint_white', u - 0.16, u + 0.16, v + 0.26, v + 0.32, 0.03, 0.045);
}

/** A house-number plate and the street lamp's bracket at the corner of a front. */
export function numberPlate(bag, F, y, u, v) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  A('paint_blue', u - 0.18, u + 0.18, v, v + 0.26, 0.0, 0.03); A('paint_white', u - 0.14, u + 0.14, v + 0.04, v + 0.22, 0.03, 0.04);
}

/** An oriel (Erker) over floors from..to at u: a bay of glass and plaster on a corbel, under a little slate roof. */
export function oriel(bag, F, y, u, v0, v1, w, mat, trim, lod) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), p = 1.0, u0 = u - w / 2, u1 = u + w / 2;
  bag.add(mat, prism(F, y, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], 0.3, p));
  bag.add(mat, prism(F, y, [[u0, v0], [u1, v0], [u + w / 4, v0 - 1.1], [u - w / 4, v0 - 1.1]], 0.3, p * 0.7));
  A(trim, u0 - 0.06, u1 + 0.06, v0 - 0.02, v0 + 0.14, 0, p + 0.06);
  const nWin = Math.max(2, Math.round(w / 1.15)), ww = (w - 0.4) / nWin;
  const fl = (v1 - v0);
  const nFl = Math.max(1, Math.round(fl / 3.6)), fh = fl / nFl;
  for (let f = 0; f < nFl; f++) {
    const a = v0 + f * fh + 0.55, b = v0 + (f + 1) * fh - 0.55;
    for (let k = 0; k < nWin; k++) {
      const c = u0 + 0.2 + (k + 0.5) * ww;
      A('opening', c - ww / 2 + 0.08, c + ww / 2 - 0.08, a, b, p - 0.02, p + 0.03); A('paint_white', c - ww / 2 + 0.05, c - ww / 2 + 0.1, a - 0.04, b + 0.04, p, p + 0.08); A('paint_white', c + ww / 2 - 0.1, c + ww / 2 - 0.05, a - 0.04, b + 0.04, p, p + 0.08);
      A('paint_white', c - ww / 2 + 0.05, c + ww / 2 - 0.05, b, b + 0.06, p, p + 0.08); A('paint_white', c - ww / 2 + 0.05, c + ww / 2 - 0.05, a - 0.06, a, p, p + 0.12);
      if (!lod) A('paint_white', c - 0.02, c + 0.02, a, b, p, p + 0.07);
    }
    A(trim, u0 - 0.03, u1 + 0.03, v0 + (f + 1) * fh - 0.12, v0 + (f + 1) * fh + 0.04, 0, p + 0.04);
  }
  A(trim, u0 - 0.12, u1 + 0.12, v1, v1 + 0.2, -0.05, p + 0.14);
  bag.add('glaze_green', prism(F, y, [[u0 - 0.2, v1 + 0.2], [u1 + 0.2, v1 + 0.2], [u + w / 4, v1 + 1.5], [u - w / 4, v1 + 1.5]], -0.1, p + 0.2));
  A('gilt_bronze', u - 0.03, u + 0.03, v1 + 1.5, v1 + 2.1, p / 2 - 0.03, p / 2 + 0.03);
}

/**
 * The round corner turret of a corner house at the plan point (x, z), standing out from the corner: a corbelled drum of plaster with a band of
 * windows to each floor from `v0`, a cornice and a copper spire.
 */
export function turret(bag, x, y, z, v0, H, mat, trim, lod) {
  const R = 1.35, nF = Math.max(1, Math.round((H - v0) / 3.8)), fh = (H - v0) / nF;
  bag.add(mat, lathe([[0.001, v0 - 1.5], [R * 0.45, v0 - 1.5], [R * 0.8, v0 - 0.9], [R, v0 - 0.4], [R, H]], 14, null, x, y, z));
  bag.add(trim, lathe([[R + 0.04, v0 - 0.45], [R + 0.1, v0 - 0.35], [R + 0.1, v0 - 0.2], [R + 0.04, v0 - 0.1]], 14, null, x, y, z));
  for (let f = 0; f < nF; f++) {
    const a = v0 + f * fh + 0.6, b = v0 + (f + 1) * fh - 0.6;
    bag.add('opening', lathe([[R + 0.012, a], [R + 0.03, a], [R + 0.03, b], [R + 0.012, b]], 14, null, x, y, z));
    if (!lod) for (let k = 0; k < 8; k++) { const th = k / 8 * Math.PI * 2 + 0.2; bag.add('paint_white', rod([x + Math.cos(th) * (R + 0.03), y + a - 0.05, z + Math.sin(th) * (R + 0.03)], [x + Math.cos(th) * (R + 0.03), y + b + 0.05, z + Math.sin(th) * (R + 0.03)], 0.03, 4)); }
    bag.add(trim, lathe([[R + 0.04, v0 + (f + 1) * fh - 0.18], [R + 0.08, v0 + (f + 1) * fh - 0.12], [R + 0.08, v0 + (f + 1) * fh], [R + 0.04, v0 + (f + 1) * fh]], 14, null, x, y, z));
  }
  bag.add(trim, lathe([[R + 0.02, H], [R + 0.35, H + 0.05], [R + 0.35, H + 0.35], [R + 0.1, H + 0.55], [R, H + 0.6]], 14, null, x, y, z));
  bag.add('glaze_green', lathe([[R + 0.1, H + 0.6], [R * 0.95, H + 1.6], [R * 0.6, H + 3.2], [R * 0.2, H + 5.4], [0.02, H + 6.6]], 14, null, x, y, z));
  bag.add('gilt_bronze', lathe([[0.001, H + 6.6], [0.08, H + 6.75], [0.001, H + 7.3]], 6, null, x, y, z));
}

/**
 * The rear face of a house, to its Hof: rows of plain windows, a cellar light, the back door; and, where `gallery`, the Pawlatschen — the
 * long open galleries of iron and wood on every floor, reached by an iron stair, from which the doors of the flats open.
 */
export function rearFace(bag, F, y, o, win) {
  const { n, floors, H, r, lod, gallery } = o, w = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
  const bays = Math.max(2, Math.round(w / 3.1)), bw = w / bays;
  const gfloor = floors[1] ?? 4.5;
  for (let s = 0; s < n; s++) {
    const f0 = floors[s], fh = (floors[s + 1] ?? H) - f0 - (s === n - 1 ? 0.6 : 0);
    for (let i = 0; i < bays; i++) {
      const u = (i + 0.5) * bw + (s % 2 ? 0.25 : -0.1);
      if (s === 0 && i === Math.floor(bays / 2)) { A('wood_dark', u - 0.55, u + 0.55, 0, 2.5, -0.02, 0.1); A('opening', u - 0.42, u + 0.42, 1.3, 2.3, 0.1, 0.12); A('limestone', u - 0.65, u + 0.65, 0, 0.12, 0, 0.4); continue; }
      win(bag, F, y, u, f0 + (s === 0 ? 1.4 : 0.9), 1.05, Math.min(1.7, fh - 1.5), { head: 'plain', lod: 1, trim: 'stucco_pale' });
      if (!lod && s > 0 && r() < 0.35) curtains(bag, F, y, u, f0 + 0.9, 1.05, Math.min(1.7, fh - 1.5), r);
    }
  }
  if (gallery) {
    const gd = 1.5;
    for (let s = 1; s < n; s++) {
      const v = floors[s] - 0.05;
      A('wood_dark', 0.0, w, v - 0.16, v, 0, gd); A('iron', 0.0, w, v + 0.96, v + 1.02, gd - 0.05, gd); A('iron', 0.0, w, v + 0.45, v + 0.48, gd - 0.04, gd - 0.01);
      for (let u = 0.1; u <= w; u += 2.6) A('iron', Math.min(w, u) - 0.03, Math.min(w, u) + 0.03, v, v + 1.02, gd - 0.06, gd);
      A('iron', 0.0, 0.05, v, v + 1.02, 0, gd); A('iron', w - 0.05, w, v, v + 1.02, 0, gd);
      if (s === 1) { for (let u = 0.35; u < w; u += 2.6) A('iron', u - 0.03, u + 0.03, 0, v - 0.16, gd - 0.1, gd - 0.04); }
      else for (let u = 0.35; u < w; u += 2.6) A('iron', u - 0.025, u + 0.025, floors[s - 1] - 0.05 + 0.02, v - 0.16, gd - 0.06, gd - 0.03);
    }
    // the stair up the end: the treads of a flight from the yard to the first gallery
    const sv = floors[1] - 0.05, nT = 14;
    for (let k = 0; k < nT; k++) A('iron', w - 1.35 + 0.0, w - 0.2, (k + 1) * sv / nT - 0.04, (k + 1) * sv / nT, gd + 0.02 + (k < nT - 1 ? 0 : 0) + 0, gd + 0.02 + 0.3 + ((nT - k) * 0.0));
    A('iron', w - 1.35, w - 1.3, 0, sv + 0.9, gd + 0.32, gd + 0.36); A('iron', w - 0.25, w - 0.2, 0, 0.12, gd + 0.02, gd + 0.34);
  }
  // a drainpipe and a washing line out of a gallery window (the wash of the Hof)
  if (!lod) for (const u of [0.2, w - 0.2]) A('iron', u - 0.045, u + 0.045, 0.2, H - 0.4, 0.02, 0.13);
}

/**
 * The Durchhaus: the passage's lining — a dado of granite to the springing, plaster above, cross-ribs under the vault, a gas bracket lamp,
 * the Portier's little window, the row of letter boxes, the Haus notice board, and the floor's two strips of granite kerb for the cart wheels.
 * The passage runs along d from 0 (the street) to -D, between u0 and u1.
 */
export function passage(ctx, F, y, { u0, u1, D, PH, seed }) {
  const { bag, lights } = ctx, r = rng(seed), A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), c = (u0 + u1) / 2;
  const W = u1 - u0;
  for (const s of [0, 1]) { const u = s ? u1 : u0, d0 = s ? 0.0 : 0.0; void d0; A('granite_grey', s ? u - 0.04 : u, s ? u : u + 0.04, 0, 1.3, -D + 0.5, -0.5); }
  for (let d = -2.5; d > -D + 1; d -= 3.0) A('plaster_white', u0, u1, PH - 0.22, PH, d - 0.12, d + 0.12);
  A('plaster_white', u0, u1, PH - 0.1, PH, -D, 0);
  A('granite_grey', c - W / 2 + 0.2, c - W / 2 + 0.55, 0.0, 0.07, -D, 0); A('granite_grey', c + W / 2 - 0.55, c + W / 2 - 0.2, 0.0, 0.07, -D, 0);
  // the Portier's window and the letter boxes on the left wall near the street
  A('wood_dark', u0 + 0.0, u0 + 0.05, 1.1, 2.3, -4.5, -2.9); A('opening', u0 + 0.05, u0 + 0.07, 1.25, 2.15, -4.4, -3.0); A('paint_white', u0 + 0.05, u0 + 0.09, 1.7, 1.75, -4.4, -3.0);
  for (let k = 0; k < 8; k++) A(k % 3 === 0 ? 'iron' : 'wood_painted', u1 - 0.05, u1 - 0.0, 1.3 + (k >> 2) * 0.22, 1.5 + (k >> 2) * 0.22, -6.0 + (k & 3) * 0.3, -5.76 + (k & 3) * 0.3);
  A('wood_dark', u1 - 0.04, u1, 1.8, 2.4, -9.0, -7.6); A('paint_white', u1 - 0.07, u1 - 0.04, 1.9, 2.3, -8.9, -7.7);
  // a bracket lamp on the right wall at the middle, the glass lit
  const lampAt = F.at(u1 - 0.3, -D * 0.45);
  bag.add('iron', rod([lampAt[0], y + 2.65, lampAt[1]], [lampAt[0], y + 2.65, lampAt[1]], 0.001, 3));
  A('iron', u1 - 0.35, u1, 2.55, 2.6, -D * 0.45 - 0.03, -D * 0.45 + 0.03);
  bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.3], [0.001, 0.38]], 8, null, lampAt[0], y + 2.58, lampAt[1]));
  lights?.push({ at: [lampAt[0], y + 2.9, lampAt[1]], color: '#ffd08a', intensity: 5, distance: 11 });
  // a hand-cart left at the wall by the second bay
  const cart = F.at(u0 + 0.9, -D * 0.7);
  bag.add('wood_dark', box(cart[0] - 0.45, y + 0.45, cart[1] - 0.8, cart[0] + 0.45, y + 0.55, cart[1] + 0.8));
  bag.add('wood_dark', box(cart[0] - 0.45, y + 0.55, cart[1] - 0.8, cart[0] - 0.4, y + 0.85, cart[1] + 0.8)); bag.add('wood_dark', box(cart[0] + 0.4, y + 0.55, cart[1] - 0.8, cart[0] + 0.45, y + 0.85, cart[1] + 0.8));
  for (const s of [-1, 1]) bag.add('iron', lathe([[0.001, -0.03], [0.4, -0.03], [0.4, 0.03], [0.001, 0.03]], 12, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(cart[0] + s * 0.5, y + 0.4, cart[1]));
  void r;
}

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
