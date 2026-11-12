// The shops and coffee houses of the Gründerzeit tenement that can be walked into (docs/settlements/vienna.md §12): the ground floor's
// front with its door and its windows cut through the wall, the room behind (floor, panelled walls, ceiling, a lit lamp) and its
// furnishing by trade — the baker's loaves and baskets, the Tabak's drawers and papers, the chemist's jars and carboys, the grocer's
// sacks and barrels, the butcher's hooks and marble, the bookshop's shelves and ladder, the hatter's stands, the wine cellar's
// casks, the tailor's bolts and table, the confectioner's glass cases, the watchmaker's clocks, the cobbler's lasts, the florist's
// buckets, the Kaffeehaus's marble tables with bentwood chairs and newspapers on their holders. Everything is on the face's frame
// (u along the front, v up, d outward); the room is SHOP_RD deep behind a wall SHOP_T thick (layout.js keeps the same numbers).
import { box, lathe, rod } from '../../core/geom.js';
import { fbox } from '../dutch/facade.js';
import { FURNITURE } from '../modernisme/furniture.js';
import { lettering } from './lettering.js';
import { rng } from './detail.js';

export const SHOP_T = 0.5, SHOP_RD = 8;
export const NAMES = {
  kaffeehaus: ['KAFFEEHAUS', 'CAFÉ'], baeckerei: ['BÄCKEREI', 'BROT'], tabak: ['TABAK', 'TRAFIK'], apotheke: ['APOTHEKE'], greissler: ['GREISSLER', 'SPEZEREI'],
  fleischhauer: ['FLEISCH', 'SELCHER'], buchhandlung: ['BÜCHER', 'BUCH'], huetemacher: ['HÜTE', 'MODEN'], weinstube: ['WEIN', 'HEURIGER'], schneider: ['SCHNEIDER', 'STOFFE'],
  konditorei: ['KONDITOREI', 'TORTEN'], uhrmacher: ['UHREN', 'JUWELEN'], schuster: ['SCHUHE', 'SCHUSTER'], blumen: ['BLUMEN', 'GÄRTNER'],
};
const SIGNC = { kaffeehaus: 'lacquer_black', baeckerei: 'shutter_green', tabak: 'lacquer_black', apotheke: 'paint_white', greissler: 'cloth_green', fleischhauer: 'cloth_maroon', buchhandlung: 'lacquer_black', huetemacher: 'paint_blue', weinstube: 'cloth_maroon', schneider: 'lacquer_black', konditorei: 'paint_white', uhrmacher: 'lacquer_black', schuster: 'cloth_maroon', blumen: 'shutter_green' };
const LETTERC = { paint_white: 'lacquer_black', paint_blue: 'gold' };

/** The tables of a Kaffeehaus or a Konditorei in frame coordinates (u along the front, d inward-negative): [[u, d]…], as shopRoom sets them. */
export function tables(trade, w) {
  const T = SHOP_T, db = -(T + SHOP_RD), out = [];
  if (trade === 'konditorei') { for (let a = T + 1.3; a < w - T - 1; a += 2.6) for (const dd of [db + 4.2, db + 6.2]) out.push([a, dd]); }
  else if (trade === 'kaffeehaus') { let n = 0; for (let a = T + 1.3; a < w - T - 1; a += 2.3) for (const dd of [db + 3.6, db + 5.4, db + 7.2]) { if (n % 5 === 4) { n++; continue; } out.push([a, dd]); n++; } }
  return out;
}
/** The ground floor's front of a shop house: piers, window frames, door, name board with its lettering, awning, goods in the windows. */
export function shopFront(bag, F, y, { w, g, bays, trade, seed, lod }) {
  const r = rng(seed * 3 + 1), A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), bw = w / bays, top = Math.min(g - 0.9, 3.3), sill = 0.65, doorB = Math.floor(bays / 2);
  const sign = SIGNC[trade] ?? 'lacquer_black', lm = LETTERC[sign] ?? 'gold';
  A('granite_grey', -0.02, w + 0.02, 0, 0.62, 0, 0.07);
  for (let i = 0; i < bays; i++) {
    const u0 = i * bw, u1 = (i + 1) * bw, u = (u0 + u1) / 2;
    if (i === doorB) {
      const dw = 1.7;
      A('wood_dark', u - dw / 2 - 0.12, u - dw / 2, 0, 3.0, 0, 0.14); A('wood_dark', u + dw / 2, u + dw / 2 + 0.12, 0, 3.0, 0, 0.14); A('wood_dark', u - dw / 2 - 0.12, u + dw / 2 + 0.12, 3.0, 3.14, 0, 0.14);
      A('limestone', u - dw / 2 - 0.3, u + dw / 2 + 0.3, 0.0, 0.1, 0, 0.5);
    } else {
      A('wood_dark', u0 + 0.28, u1 - 0.28, sill - 0.12, sill, 0, 0.14); A('wood_dark', u0 + 0.28, u1 - 0.28, top, top + 0.12, 0, 0.14);
      A('wood_dark', u0 + 0.28, u0 + 0.38, sill, top, 0, 0.12); A('wood_dark', u1 - 0.38, u1 - 0.28, sill, top, 0, 0.12);
      A('opening', u0 + 0.38, u1 - 0.38, sill, top, -0.04, -0.02);
      // the goods in the window, in a row on the sill and a second step, in the trade's colours
      const pal = WINDOWGOODS[trade] ?? WINDOWGOODS.baeckerei;
      for (let q = 0; q < 4 + (lod ? 0 : 3); q++) { const c = u0 + 0.55 + r() * (bw - 1.5), m = pal[Math.floor(r() * pal.length)], hh = 0.18 + r() * 0.3; A(m, c, c + 0.2 + r() * 0.25, sill + q * 0.02, sill + hh, 0.05 + q * 0.025, 0.3 + q * 0.025); }
      A('wood_dark', u0 + 0.38, u1 - 0.38, sill + 0.55, sill + 0.58, 0.0, 0.34);
    }
    // the rusticated pier between
    if (!lod) for (let v = 0.7; v + 0.5 < g - 0.3; v += 0.62) { A('stucco_pale', u0, u0 + 0.28, v, v + 0.5, 0, 0.05); A('stucco_pale', u1 - 0.28, u1, v, v + 0.5, 0, 0.05); }
  }
  A('stucco_pale', -0.04, w + 0.04, g - 0.3, g, 0, 0.16);
  // the name board over the whole front and its lettering; a hanging sign (Ausleger) on an iron bracket
  A(sign, 0.3, w - 0.3, top + 0.2, g - 0.4, 0.02, 0.1); A('gold', 0.26, w - 0.26, top + 0.16, top + 0.2, 0.02, 0.12); A('gold', 0.26, w - 0.26, g - 0.4, g - 0.36, 0.02, 0.12);
  const names = NAMES[trade] ?? ['LADEN'], txt = names[Math.floor(r() * names.length)], fh = g - 0.4 - top - 0.2;
  if (!lod) lettering(bag, F, y, w / 2, top + 0.2 + fh * 0.22, txt, Math.min(0.56, fh * 0.56), lm, w - 1.4);
  else A('gold', w / 2 - txt.length * 0.14, w / 2 + txt.length * 0.14, top + 0.2 + fh * 0.3, top + 0.2 + fh * 0.65, 0.1, 0.12);
  if (!lod) {
    const u = r() < 0.5 ? 0.45 : w - 0.45;
    A('iron', u - 0.025, u + 0.025, top + 0.35, top + 0.4, 0.0, 0.9); A('iron', u - 0.015, u + 0.015, top + 0.4, top + 0.62, 0.8, 0.84);
    A(sign === 'paint_white' ? 'cloth_red' : 'paint_ochre', u - 0.02, u + 0.02, top - 0.6, top + 0.38, 0.45, 1.0);
  }
  // the awning, rolled out over the windows
  if (r() < 0.7) { const c = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_blue'][Math.floor(r() * 4)], c2 = r() < 0.5 ? 'cloth_white' : c; const doorU = (doorB + 0.5) * bw;
    for (const [a, b] of [[0.35, doorU - 1.15], [doorU + 1.15, w - 0.35]]) if (b - a > 1.2) { const n = Math.max(2, Math.round((b - a) / 0.34)); for (let k = 0; k < n; k++) A(k % 2 ? c2 : c, a + k * (b - a) / n, a + (k + 1) * (b - a) / n, top - 0.35 - 0.0, top + 0.05, 0.0, 1.0); } }
}
const WINDOWGOODS = {
  baeckerei: ['terracotta', 'paint_ochre', 'wood_ochre', 'cloth_white'], tabak: ['cloth_brown', 'paint_white', 'cloth_red', 'wood_dark'], apotheke: ['glaze_green', 'glaze_white', 'cloth_red', 'glass_lamp'],
  greissler: ['cloth_green', 'sacking', 'terracotta', 'cloth_red'], fleischhauer: ['cloth_maroon', 'hide_tan', 'cloth_red'], buchhandlung: ['cloth_red', 'cloth_green', 'cloth_brown', 'cloth_blue', 'paint_white'],
  huetemacher: ['hide_black', 'cloth_grey', 'hide_brown', 'cloth_white'], weinstube: ['glaze_green', 'wood_dark', 'glass_lamp'], schneider: ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_grey'],
  konditorei: ['paint_white', 'cloth_red', 'wood_dark', 'paint_ochre', 'cloth_maroon'], uhrmacher: ['gilt_bronze', 'paint_white', 'steel_grey'], schuster: ['hide_black', 'hide_brown', 'hide_tan'],
  blumen: ['cloth_red', 'cloth_green', 'cloth_ochre', 'paint_white', 'cloth_maroon'], kaffeehaus: ['paint_white', 'wood_dark', 'cloth_red'],
};

/**
 * The room: walls with the cuts, floor, ceiling, lining, lamp and furnishing. { w, D, g (ground floor height), H, mat, bays, trade, seed }.
 * Returns nothing; the upper floors and the roof are the caller's.
 */
export function shopRoom(ctx, F, y, { w, D, g, H, mat, bays, trade, seed }) {
  const { bag, col, lights } = ctx, r = rng(seed * 5 + 2), T = SHOP_T, RD = SHOP_RD, db = -(T + RD);
  const P = (u0, u1, d0, d1) => { const a = F.at(u0, d0), b = F.at(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, u1, v0, v1, d0, d1, hard = false) => { if (u1 - u0 < 1e-4 || v1 - v0 < 1e-4 || d1 - d0 < 1e-4) return; const q = P(u0, u1, d0, d1); bag.add(m, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); if (hard) col.rect(q, y + v0, y + v1); };
  const bw = w / bays, top = Math.min(g - 0.9, 3.3), sill = 0.65, doorB = Math.floor(bays / 2), dw = 1.7, doorU = (doorB + 0.5) * bw;
  // the walls round the room, the front cut for the windows and the door
  B(mat, 0, T, -0.6, g, db, 0, true); B(mat, w - T, w, -0.6, g, db, 0, true); B(mat, 0, w, -0.6, H, -D, db, true); B(mat, 0, w, g, H, db, 0, true);
  const cuts = [];
  for (let i = 0; i < bays; i++) { const u = (i + 0.5) * bw; if (i === doorB) cuts.push({ a: u - dw / 2, b: u + dw / 2, v0: 0.0, v1: 2.9, door: true }); else cuts.push({ a: i * bw + 0.38, b: (i + 1) * bw - 0.38, v0: sill, v1: top }); }
  let s = 0;
  for (const c of cuts) { B(mat, s, c.a, -0.6, g, -T, 0, true); if (c.v0 > 0.01) B(mat, c.a, c.b, -0.6, c.v0, -T, 0, true); B(mat, c.a, c.b, c.v1, g, -T, 0, true); s = c.b; }
  B(mat, s, w, -0.6, g, -T, 0, true);
  // the floor (planks, or red tile for the baker, the butcher and the grocer), the threshold, the ceiling
  const fl = ['baeckerei', 'fleischhauer', 'greissler', 'blumen', 'weinstube'].includes(trade) ? 'cotto_floor' : 'wood_ochre';
  B(fl, T, w - T, 0.0, 0.12, db, -T); B('limestone', doorU - dw / 2, doorU + dw / 2, 0.0, 0.12, -T, 0.02);
  col.floor(P(T, w - T, db, -T), y + 0.12); col.floor(P(doorU - dw / 2, doorU + dw / 2, -T, 0.0), y + 0.1);
  B('plaster_white', T, w - T, g - 0.14, g, db, -T);
  for (let u = 2.0; u < w - 1; u += 3.2) B('plaster_white', u - 0.12, u + 0.12, g - 0.3, g - 0.14, db, -T);
  // the lining: a panelled dado on the three walls, a picture rail
  const dado = trade === 'fleischhauer' ? 'glaze_white' : 'wood_dark';
  B(dado, T, w - T, 0.12, 1.5, db, db + 0.05); B(dado, T, T + 0.05, 0.12, 1.5, db, -T); B(dado, w - T - 0.05, w - T, 0.12, 1.5, db, -T);
  B('wood_dark', T, w - T, 1.5, 1.56, db, db + 0.08);
  // the lamps: opal globes hanging from the ceiling over the counter and the room
  const nl = Math.max(2, Math.round(w / 3.4));
  for (let k = 0; k < nl; k++) { const u = (k + 0.5) * w / nl, p = F.at(u, db + 3.6); bag.add('iron', rod([p[0], y + g - 0.14, p[1]], [p[0], y + g - 0.8, p[1]], 0.012, 4)); bag.add('lamp_white', lathe([[0.001, -0.15], [0.14, -0.07], [0.16, 0.04], [0.1, 0.13], [0.001, 0.15]], 10, null, p[0], y + g - 0.9, p[1])); }
  { const p = F.at(w / 2, db + 3.6); lights?.push({ at: [p[0], y + g - 1.2, p[1]], color: '#ffd9a0', intensity: 7, distance: 12 }); }
  // the counter along the back, with a gap at one end, and the shelves behind it
  const gapR = r() < 0.5, c0 = gapR ? T + 0.7 : T + 1.6, c1 = gapR ? w - T - 1.6 : w - T - 0.7;
  const cb = db + 1.35, ce = db + 2.05;
  const kaffee = trade === 'kaffeehaus' || trade === 'konditorei' || trade === 'weinstube';
  if (trade !== 'blumen') {
    B('wood_dark', c0, c1, 0.12, 1.02, cb, ce, true); B(kaffee || trade === 'fleischhauer' || trade === 'konditorei' ? 'marble' : 'wood_ochre', c0 - 0.04, c1 + 0.04, 1.02, 1.07, cb - 0.04, ce + 0.04);
    for (let u = c0 + 0.3; u < c1 - 0.2; u += 0.9) B('wood_painted', u, u + 0.7, 0.3, 0.9, ce, ce + 0.02);
  }
  const shelf = (u0, u1, d0, d1, levels, mats, hgt) => {
    for (const v of levels) {
      B('wood_dark', u0, u1, v, v + 0.04, d0, d1);
      for (let u = u0 + 0.1; u < u1 - 0.15;) { const m = mats[Math.floor(r() * mats.length)], ww = 0.1 + r() * 0.2, hh = (hgt?.[0] ?? 0.15) + r() * (hgt?.[1] ?? 0.2); B(m, u, u + ww, v + 0.04 + r() * 0.03, v + 0.04 + hh, d0 + 0.03 + r() * 0.03, d1 - 0.03 - r() * 0.03); u += ww + 0.03 + r() * 0.1; }
    }
    B('wood_dark', u0, u1, 0.12, levels[levels.length - 1] + 0.6, d0 - 0.02, d0 + 0.02);
  };
  const wall = [T + 0.1, w - T - 0.1, db, db + 0.4];
  const vase = (m, u, d, v, rr, hh) => { const p = F.at(u, d); bag.add(m, lathe([[0.001, 0], [rr * 0.7, 0], [rr, hh * 0.3], [rr * 0.8, hh * 0.75], [rr * 0.45, hh * 0.9], [rr * 0.5, hh], [0.001, hh]], 8, null, p[0], y + v, p[1])); };
  switch (trade) {
    case 'baeckerei':
      shelf(...wall, [0.5, 1.15, 1.8, 2.4], ['terracotta', 'paint_ochre', 'wood_ochre', 'terracotta'], [0.1, 0.12]);
      for (let k = 0; k < 4; k++) { const u = c0 + 0.4 + k * (c1 - c0 - 0.8) / 3; B('glass_outer', u - 0.4, u + 0.4, 1.07, 1.45, cb + 0.05, ce - 0.05); for (let q = 0; q < 4; q++) { const p = F.at(u - 0.3 + q * 0.2, (cb + ce) / 2); bag.add(q % 2 ? 'terracotta' : 'paint_ochre', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.07], [0.001, 0.1]], 8, null, p[0], y + 1.07, p[1])); } }
      for (let k = 0; k < 3; k++) { const u = T + 0.8 + k * 1.4; B('wicker', u, u + 0.6, 0.12, 0.5, db + 2.9, db + 3.5); B('terracotta', u + 0.05, u + 0.55, 0.5, 0.62, db + 2.95, db + 3.45); }
      break;
    case 'tabak':
      for (let q = 0; q < 6; q++) for (let k = 0; k < 10; k++) B(k % 4 === 0 ? 'iron' : 'wood_painted', T + 0.4 + k * ((w - 2 * T - 0.8) / 10), T + 0.4 + (k + 0.85) * ((w - 2 * T - 0.8) / 10), 0.9 + q * 0.28, 1.1 + q * 0.28, db, db + 0.35);
      B('wood_dark', T + 0.3, w - T - 0.3, 2.6, 2.7, db, db + 0.45);
      for (let k = 0; k < 6; k++) B(['cloth_red', 'paint_white', 'paint_ochre'][k % 3], c0 + 0.2 + k * 0.5, c0 + 0.6 + k * 0.5, 1.07, 1.12, cb + 0.1, ce - 0.1);
      B('wood_dark', w - T - 1.0, w - T - 0.05, 0.12, 1.7, db + 3.2, db + 3.35); for (let k = 0; k < 8; k++) B(['paint_white', 'cloth_ochre'][k & 1], w - T - 0.95 + (k & 3) * 0.2, w - T - 0.8 + (k & 3) * 0.2, 0.8 + (k >> 2) * 0.5, 1.2 + (k >> 2) * 0.5, db + 3.35, db + 3.4);
      break;
    case 'apotheke':
      shelf(...wall, [0.6, 1.2, 1.8, 2.4], ['glaze_white', 'glaze_green', 'glass_lamp', 'paint_white'], [0.2, 0.18]);
      for (let k = 0; k < 6; k++) vase(['glaze_green', 'glaze_red', 'paint_blue'][k % 3], T + 0.7 + k * (w - 2 * T - 1.4) / 5, db + 0.25, 2.72, 0.17, 0.6);
      for (let q = 0; q < 4; q++) for (let k = 0; k < 8; k++) B('wood_painted', T + 0.3 + k * 0.32, T + 0.3 + k * 0.32 + 0.28, 0.12 + q * 0.2, 0.3 + q * 0.2, db + 0.42, db + 0.5);
      for (let k = 0; k < 3; k++) vase('glass_lamp', c0 + 0.5 + k * 1.2, (cb + ce) / 2, 1.07, 0.13, 0.4);
      break;
    case 'greissler':
      shelf(...wall, [0.6, 1.2, 1.8], ['sacking', 'terracotta', 'paint_ochre', 'glaze_white', 'cloth_red'], [0.12, 0.14]);
      for (let k = 0; k < 4; k++) { const u = T + 0.7 + k * 0.9, p = F.at(u, db + 3.5); bag.add('wood_dark', lathe([[0.001, 0], [0.3, 0], [0.4, 0.45], [0.3, 0.9], [0.001, 0.9]], 10, null, p[0], y + 0.12, p[1])); bag.add('iron', lathe([[0.31, 0.2], [0.33, 0.24]], 10, null, p[0], y + 0.12, p[1])); bag.add('iron', lathe([[0.37, 0.55], [0.39, 0.6]], 10, null, p[0], y + 0.12, p[1])); col.circle(p[0], p[1], 0.42, y + 0.12, y + 1.0); }
      for (let k = 0; k < 4; k++) B('sacking', w - T - 0.8 - (k & 1) * 0.7, w - T - 0.1 - (k & 1) * 0.7, 0.12 + (k >> 1) * 0.35, 0.47 + (k >> 1) * 0.35, db + 3.2, db + 3.8);
      for (let k = 0; k < 7; k++) { const u = c0 + 0.3 + k * 0.5, p = F.at(u, (cb + ce) / 2 + 1.0); bag.add('cloth_red', rod([p[0], y + g - 0.2, p[1]], [p[0], y + g - 0.8, p[1]], 0.03, 5)); }
      B('steel_grey', c0 + 1.0, c0 + 1.4, 1.07, 1.12, cb + 0.1, cb + 0.5); B('steel_grey', c0 + 1.18, c0 + 1.22, 1.12, 1.45, cb + 0.28, cb + 0.32);
      break;
    case 'fleischhauer':
      for (let k = 0; k < 9; k++) { const u = T + 0.5 + k * (w - 2 * T - 1) / 8, p = F.at(u, db + 0.5); bag.add('iron', rod([p[0], y + 2.9, p[1]], [p[0], y + 2.3, p[1]], 0.015, 4)); bag.add(k % 2 ? 'hide_tan' : 'cloth_maroon', lathe([[0.001, 0], [0.1, 0.08], [0.13, 0.3], [0.08, 0.55], [0.001, 0.6]], 8, null, p[0], y + 1.75, p[1])); }
      B('wood_dark', T + 0.3, w - T - 0.3, 2.9, 2.96, db, db + 0.2);
      for (let k = 0; k < 5; k++) B(['cloth_maroon', 'hide_tan', 'cloth_red'][k % 3], c0 + 0.3 + k * 0.7, c0 + 0.8 + k * 0.7, 1.07, 1.2, cb + 0.1, ce - 0.1);
      { const p = F.at(w - T - 1.2, db + 3.5); bag.add('wood_ochre', lathe([[0.001, 0], [0.4, 0], [0.4, 0.8], [0.001, 0.8]], 12, null, p[0], y + 0.12, p[1])); col.circle(p[0], p[1], 0.42, y + 0.12, y + 0.9); }
      break;
    case 'buchhandlung': {
      for (const [u0, u1, d0, d1] of [wall, [T, T + 0.4, db + 0.4, -T - 0.3], [w - T - 0.4, w - T, db + 0.4, -T - 0.3]]) { shelf(u0, u1, d0, d1, [0.3, 0.8, 1.3, 1.8, 2.3], ['cloth_red', 'cloth_green', 'cloth_brown', 'cloth_blue', 'paint_white', 'cloth_ochre', 'cloth_maroon', 'cloth_black'], [0.18, 0.12]); }
      B('wood_ochre', w / 2 - 1.2, w / 2 + 1.2, 0.12, 0.85, db + 4.2, db + 5.4, true);
      for (let k = 0; k < 6; k++) B(['cloth_red', 'cloth_blue', 'cloth_green'][k % 3], w / 2 - 1.1 + k * 0.38, w / 2 - 0.8 + k * 0.38, 0.85, 0.9 + (k % 2) * 0.04, db + 4.3, db + 4.7);
      B('wood_dark', T + 0.45, T + 0.5, 0.12, 2.5, db + 2.0, db + 2.05); B('wood_dark', T + 0.55, T + 0.6, 0.12, 2.5, db + 2.0, db + 2.05);
      break; }
    case 'huetemacher':
      for (let k = 0; k < 6; k++) { const u = T + 0.7 + k * (w - 2 * T - 1.4) / 5, p = F.at(u, db + 0.5); bag.add('wood_dark', lathe([[0.001, 0], [0.18, 0], [0.04, 0.05], [0.03, 1.25], [0.12, 1.3], [0.001, 1.32]], 8, null, p[0], y + 0.12, p[1])); const m = ['hide_black', 'cloth_grey', 'hide_brown'][k % 3]; bag.add(m, lathe([[0.001, 0], [0.16, 0], [0.16, 0.03], [0.1, 0.04], [0.1, 0.18], [0.001, 0.19]], 10, null, p[0], y + 1.32, p[1])); bag.add(m, lathe([[0.17, 0], [0.24, 0.0], [0.24, 0.015], [0.17, 0.02]], 10, null, p[0], y + 1.32, p[1])); }
      shelf(...wall, [1.9, 2.4], ['hide_black', 'cloth_grey', 'hide_brown', 'cloth_white'], [0.18, 0.1]);
      B('mirror_tin', w - T - 0.06, w - T - 0.02, 0.9, 2.5, db + 2.4, db + 3.6); B('wood_dark', w - T - 0.09, w - T - 0.06, 0.85, 2.55, db + 2.35, db + 3.65);
      for (let k = 0; k < 4; k++) B('cloth_white', c0 + 0.3 + k * 0.6, c0 + 0.75 + k * 0.6, 1.07, 1.3, cb + 0.1, ce - 0.1);
      break;
    case 'weinstube':
      for (let k = 0; k < 5; k++) { const u = T + 0.8 + k * 1.3, p = F.at(u, db + 0.7); bag.add('wood_dark', lathe([[0.001, 0.5], [0.42, 0.5], [0.58, 1.0], [0.62, 1.2], [0.58, 1.4], [0.42, 1.9], [0.001, 1.9]], 12, null, p[0], y + 0.12, p[1]).rotateX(0)); bag.add('iron', lathe([[0.5, 0.85], [0.62, 0.9], [0.62, 0.94], [0.5, 0.97]], 12, null, p[0], y + 0.12, p[1])); col.circle(p[0], p[1], 0.62, y + 0.12, y + 2.0); }
      shelf(T + 6.8 > w - T ? T + 0.1 : T + 6.8, w - T - 0.1, db, db + 0.4, [1.2, 1.8], ['glaze_green', 'glass_lamp', 'wood_dark'], [0.25, 0.1]);
      for (let k = 0; k < 3; k++) for (const dd of [db + 4.2, db + 6.0]) { const u = T + 1.4 + k * 2.4; if (u > w - T - 1) continue; B('wood_ochre', u, u + 1.4, 0.12, 0.78, dd, dd + 0.8, true); B('wood_dark', u, u + 1.4, 0.4, 0.45, dd - 0.35, dd - 0.05); B('wood_dark', u, u + 1.4, 0.4, 0.45, dd + 0.85, dd + 1.15); B('glaze_green', u + 0.3, u + 0.4, 0.78, 1.0, dd + 0.3, dd + 0.4); B('glass_lamp', u + 0.8, u + 0.9, 0.78, 0.95, dd + 0.4, dd + 0.5); }
      break;
    case 'schneider':
      for (const [u0, u1, d0, d1] of [wall, [T, T + 0.5, db + 0.4, -T - 0.3]]) shelf(u0, u1, d0, d1, [0.4, 0.95, 1.5, 2.05, 2.6], ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_grey', 'cloth_ochre', 'cloth_black', 'cloth_brown', 'cloth_maroon'], [0.28, 0.1]);
      B('wood_ochre', w / 2 - 1.3, w / 2 + 1.3, 0.12, 0.92, db + 3.8, db + 5.2, true); B('cloth_grey', w / 2 - 0.9, w / 2 + 0.2, 0.92, 0.96, db + 4.1, db + 5.0); B('steel_grey', w / 2 + 0.3, w / 2 + 1.1, 0.96, 0.98, db + 4.3, db + 4.35);
      { const p = F.at(w - T - 1.0, db + 1.0); bag.add('wood_dark', lathe([[0.001, 0], [0.2, 0], [0.04, 0.05], [0.03, 0.9]], 8, null, p[0], y + 0.12, p[1])); bag.add('cloth_white', lathe([[0.001, 0.8], [0.2, 0.9], [0.17, 1.25], [0.12, 1.5], [0.06, 1.55], [0.001, 1.6]], 10, null, p[0], y + 0.12, p[1])); }
      break;
    case 'konditorei':
      for (let k = 0; k < 4; k++) { const u = c0 + 0.4 + k * (c1 - c0 - 0.8) / 3; B('glass_outer', u - 0.45, u + 0.45, 1.07, 1.6, cb + 0.05, ce - 0.05); B('marble', u - 0.45, u + 0.45, 1.3, 1.33, cb + 0.05, ce - 0.05); for (let q = 0; q < 4; q++) { const p = F.at(u - 0.32 + q * 0.21, (cb + ce) / 2); bag.add(['paint_white', 'wood_dark', 'cloth_red', 'paint_ochre'][(q + k) % 4], lathe([[0.001, 0], [0.1, 0], [0.1, 0.1], [0.001, 0.12]], 10, null, p[0], y + 1.07, p[1])); } }
      shelf(...wall, [0.9, 1.5, 2.1], ['paint_white', 'wood_dark', 'cloth_red', 'paint_ochre', 'glaze_white'], [0.15, 0.2]);
      tables('konditorei', w).forEach(([a, dd]) => FURNITURE.terrace_set({ at: [...F.at(a, dd)], y: y + 0.12, seed: Math.floor(a * 7) }, ctx));
      break;
    case 'uhrmacher':
      for (let k = 0; k < 7; k++) { const u = T + 0.7 + k * (w - 2 * T - 1.4) / 6, p = F.at(u, db + 0.06), rot = Math.atan2(F.at(0, 1)[0] - F.at(0, 0)[0], F.at(0, 1)[1] - F.at(0, 0)[1]); bag.add('wood_dark', lathe([[0.001, 0], [0.26, 0], [0.28, 0.03], [0.001, 0.05]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(rot).translate(p[0], y + 1.9 + (k % 2) * 0.35, p[1])); bag.add('paint_white', lathe([[0.001, 0.04], [0.22, 0.04], [0.22, 0.06], [0.001, 0.06]], 14, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(rot).translate(p[0] + Math.sin(rot) * 0.02, y + 1.9 + (k % 2) * 0.35, p[1] + Math.cos(rot) * 0.02)); }
      for (let k = 0; k < 4; k++) { const u = c0 + 0.4 + k * (c1 - c0 - 0.8) / 3; B('glass_outer', u - 0.4, u + 0.4, 1.07, 1.4, cb + 0.05, ce - 0.05); B('cloth_red', u - 0.35, u + 0.35, 1.07, 1.1, cb + 0.1, ce - 0.1); B('gilt_bronze', u - 0.1, u + 0.1, 1.1, 1.18, cb + 0.3, cb + 0.5); }
      break;
    case 'schuster':
      for (const [u0, u1, d0, d1] of [wall, [T, T + 0.4, db + 0.4, -T - 0.3]]) shelf(u0, u1, d0, d1, [0.3, 0.75, 1.2, 1.65, 2.1], ['hide_black', 'hide_brown', 'hide_tan', 'hide_black'], [0.12, 0.08]);
      for (let k = 0; k < 2; k++) { const u = w / 2 - 1.0 + k * 1.6; B('wood_dark', u, u + 0.6, 0.12, 0.45, db + 4.5, db + 5.1, true); B('hide_brown', u + 0.1, u + 0.3, 0.45, 0.55, db + 4.6, db + 4.9); }
      break;
    case 'blumen':
      for (let k = 0; k < 8; k++) { const u = T + 0.6 + (k % 4) * 0.9 + (k >= 4 ? 0.0 : 0), dd = db + 1.0 + (k >> 2) * 1.3, p = F.at(u, dd); bag.add('iron_galv', lathe([[0.001, 0], [0.16, 0], [0.2, 0.4], [0.001, 0.4]], 10, null, p[0], y + 0.12, p[1])); for (let q = 0; q < 5; q++) { const a = q * 1.256; B(['cloth_red', 'cloth_ochre', 'paint_white', 'cloth_maroon', 'cloth_green'][(q + k) % 5], u + Math.cos(a) * 0.08 - 0.05, u + Math.cos(a) * 0.08 + 0.05, 0.5 + q % 2 * 0.1, 0.9 + q % 3 * 0.1, dd + Math.sin(a) * 0.08 - 0.05, dd + Math.sin(a) * 0.08 + 0.05); } }
      B('wood_ochre', w / 2 - 1.2, w / 2 + 1.2, 0.12, 0.8, db + 4.4, db + 5.4, true);
      for (let k = 0; k < 7; k++) B(['cloth_red', 'cloth_ochre', 'paint_white', 'cloth_green'][k % 4], w / 2 - 1.1 + k * 0.3, w / 2 - 0.9 + k * 0.3, 0.8, 0.95 + (k % 3) * 0.08, db + 4.5, db + 5.3);
      break;
    default: {  // the Kaffeehaus: marble tables with bentwood chairs in rows, newspapers on their holders, mirrors, the billiard table
      for (let k = 0; k < 5; k++) { const u = T + 1.2 + k * (w - 2 * T - 2.4) / 4; B('wood_dark', u - 0.02, u + 0.02, 1.2, 2.1, db + 0.06, db + 0.09); B('paint_white', u - 0.28, u + 0.28, 1.3, 2.0, db + 0.09, db + 0.12); B('mirror_tin', u - 0.5, u + 0.5, 2.2, 3.0, db + 0.01, db + 0.04); }
      tables('kaffeehaus', w).forEach(([a, dd], n) => FURNITURE.terrace_set({ at: [...F.at(a, dd)], y: y + 0.12, seed: n }, ctx));
      B('wood_dark', T + 0.1, w - T - 0.1, 0.12, 1.5, db, db + 0.05);
    }
  }
}
