// The Viennese tenement and townhouse of 1902 (docs/settlements/vienna.md §3, §5): the Gründerzeit Mietshaus — a rusticated
// ground floor with shops and the Haustor, a piano nobile whose windows carry pediments over consoles, plainer floors above,
// a heavy cornice and a slate mansard with dormers — and the older Biedermeier house of two or three storeys under a tile roof.
// Everything is drawn on the face's own frame (u along the front, v up, d outward; styles/dutch/facade.js).

import { box, frustum, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, outline, ngon } from '../dutch/facade.js';
import { weather, flowerBox, curtains, enamelSign, numberPlate, oriel, turret, rearFace, passage } from './detail.js';
import { lettering } from './lettering.js';
import { shopFront, shopRoom, SHOP_T, SHOP_RD, NAMES } from './shopint.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TINTS = ['stucco_cream', 'stucco_ochre', 'stucco_pale', 'stucco_rose', 'stucco_cream', 'stucco_ochre', 'stucco_saffron', 'stucco_pale'];
const TRIM = 'stucco_pale';
export const rectOf = (pts) => [Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])];

/** A double casement window in white with a transom and a middle post; `head`: 'tri', 'seg', 'cornice' or 'plain'. */
export function sashWindow(bag, F, y, u, v0, ww, hh, o = {}) {
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), u0 = u - ww / 2, u1 = u + ww / 2, b = 0.07, trim = o.trim ?? TRIM, vt = v0 + hh;
  A('opening', u0, u1, v0, vt, -0.02, 0.05);
  A('paint_white', u0, u0 + b, v0, vt, 0, 0.1); A('paint_white', u1 - b, u1, v0, vt, 0, 0.1);
  A('paint_white', u0 + b, u1 - b, vt - b, vt, 0, 0.1); A('paint_white', u0 + b, u1 - b, v0, v0 + b, 0, 0.1);
  if (!o.lod) { A('paint_white', u - b / 2, u + b / 2, v0 + b, vt - b, 0, 0.1); const tv = v0 + hh * 0.72; A('paint_white', u0 + b, u1 - b, tv - b / 2, tv + b / 2, 0, 0.1); }
  A(trim, u0 - 0.14, u1 + 0.14, v0 - 0.14, v0, 0, 0.17);                    // the sill
  if (o.head === 'plain') { A(trim, u0 - 0.12, u0, v0, vt + 0.1, 0, 0.08); A(trim, u1, u1 + 0.12, v0, vt + 0.1, 0, 0.08); A(trim, u0 - 0.12, u1 + 0.12, vt, vt + 0.14, 0, 0.1); return; }
  for (const s of [-1, 1]) A(trim, s < 0 ? u0 - 0.17 : u1, s < 0 ? u0 : u1 + 0.17, v0, vt + 0.1, 0, 0.1);
  A(trim, u0 - 0.17, u1 + 0.17, vt, vt + 0.2, 0, 0.15);                      // the lintel
  const hw = ww / 2 + 0.34;
  if (o.head === 'tri') {
    A(trim, u0 - 0.3, u1 + 0.3, vt + 0.2, vt + 0.34, 0, 0.22);
    bag.add(trim, prism(F, y, [[u - hw, vt + 0.34], [u + hw, vt + 0.34], [u, vt + 0.34 + hw * 0.32]], 0, 0.2));
    for (const s of [-1, 1]) A(trim, u + s * (ww / 2 + 0.05) - 0.07, u + s * (ww / 2 + 0.05) + 0.07, vt - 0.3, vt + 0.2, 0.1, 0.2);       // the consoles
  } else if (o.head === 'seg') {
    A(trim, u0 - 0.3, u1 + 0.3, vt + 0.2, vt + 0.34, 0, 0.22);
    const rise = 0.34;
    for (const q of outline(u, (v) => Math.max(0.05, hw * Math.sqrt(Math.max(0, 1 - ((v - vt - 0.34) / rise) ** 2))), vt + 0.34, vt + 0.34 + rise * 0.98, 3)) bag.add(trim, prism(F, y, q, 0, 0.2));
    for (const s of [-1, 1]) A(trim, u + s * (ww / 2 + 0.05) - 0.07, u + s * (ww / 2 + 0.05) + 0.07, vt - 0.3, vt + 0.2, 0.1, 0.2);
  } else {
    A(trim, u0 - 0.3, u1 + 0.3, vt + 0.2, vt + 0.34, 0, 0.24);
    for (const s of [-1, 1]) A(trim, u + s * (ww / 2 + 0.1) - 0.07, u + s * (ww / 2 + 0.1) + 0.07, vt - 0.2, vt + 0.2, 0.1, 0.2);
  }
}

/** An iron balcony on a stone slab with a railing of bars between posts, at the window's sill. */
export function balcony(bag, F, y, u, v0, bw, lod = 0, depth = 0.6) {
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), u0 = u - bw / 2, u1 = u + bw / 2;
  A('limestone', u0, u1, v0 - 0.42, v0 - 0.12, 0, depth);
  A('iron', u0, u1, v0 + 0.92, v0 + 0.97, depth - 0.04, depth); A('iron', u0, u1, v0 - 0.12, v0 - 0.07, depth - 0.04, depth);
  A('iron', u0, u0 + 0.04, v0 - 0.12, v0 + 0.97, 0, depth); A('iron', u1 - 0.04, u1, v0 - 0.12, v0 + 0.97, 0, depth);
  const n = Math.max(3, Math.round(bw / (lod ? 0.45 : 0.2)));
  for (let k = 1; k < n; k++) { const x = u0 + k * bw / n; A('iron', x - 0.012, x + 0.012, v0 - 0.07, v0 + 0.92, depth - 0.036, depth - 0.012); }
}

const SHOPWORDS = ['BÄCKEREI', 'TABAK', 'WEIN', 'FLEISCH', 'SCHUHE', 'HÜTE', 'KOHLEN', 'MILCH', 'BIER', 'UHREN', 'PAPIER', 'MODEN', 'SEIFE', 'KAFFEE', 'EISEN', 'GLAS', 'KÄSE', 'OBST'];
/** A shop front: the glazing in its wood frame under a sign board and a roll-up awning. */
function shop(bag, F, y, u0, u1, g, o, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), w = u1 - u0, sill = 0.6, top = Math.min(g - 1.0, 3.4);
  A('opening', u0 + 0.12, u1 - 0.12, sill, top, -0.02, 0.05);
  A('wood_dark', u0 + 0.08, u0 + 0.16, sill - 0.1, top + 0.08, 0, 0.12); A('wood_dark', u1 - 0.16, u1 - 0.08, sill - 0.1, top + 0.08, 0, 0.12);
  A('wood_dark', u0 + 0.08, u1 - 0.08, top, top + 0.1, 0, 0.12); A('wood_dark', u0 + 0.08, u1 - 0.08, sill - 0.1, sill, 0, 0.12);
  const posts = Math.round(w / 1.6); for (let k = 1; k < posts; k++) { const x = u0 + k * w / posts; A('wood_dark', x - 0.03, x + 0.03, sill, top, 0, 0.1); }
  A('wood_dark', u0 + 0.08, u1 - 0.08, 0.1, sill - 0.1, 0, 0.1);                                 // the stall board
  const sign = r() < 0.5 ? 'lacquer_black' : r() < 0.5 ? 'paint_ochre' : 'cloth_green';
  A(sign, u0 + 0.1, u1 - 0.1, top + 0.14, g - 0.25, 0, 0.1);
  if (o.lod) A('gold', u0 + 0.5, u1 - 0.5, (top + g) / 2 - 0.16, (top + g) / 2 + 0.12, 0.1, 0.12);          // the gilt lettering
  else {
    const words = SHOPWORDS, txt = words[Math.floor(r() * words.length)], fh = g - 0.25 - top - 0.14, lm = sign === 'lacquer_black' || sign === 'cloth_green' ? 'gold' : 'lacquer_black';
    lettering(bag, F, y, (u0 + u1) / 2, top + 0.14 + fh * 0.2, txt, Math.min(0.5, fh * 0.6), lm, u1 - u0 - 0.5);
    // the goods in the window: a few boxes and bottles on the sill, and a hanging board (Ausleger) on some
    const pal = ['cloth_red', 'cloth_green', 'paint_ochre', 'terracotta', 'cloth_blue', 'paint_white', 'wood_ochre'];
    for (let q = 0; q < 5; q++) { const c = u0 + 0.35 + r() * (w - 0.9), m = pal[Math.floor(r() * pal.length)]; A(m, c, c + 0.15 + r() * 0.3, sill + q * 0.02, sill + 0.15 + r() * 0.35, 0.04 + q * 0.02, 0.2 + q * 0.025); }
    if (r() < 0.22) { const uu = r() < 0.5 ? u0 + 0.1 : u1 - 0.1; A('iron', uu - 0.02, uu + 0.02, top + 0.3, top + 0.35, 0.0, 0.8); A(['cloth_red', 'paint_ochre', 'paint_blue'][Math.floor(r() * 3)], uu - 0.02, uu + 0.02, top - 0.45, top + 0.28, 0.4, 0.9); }
  }
  if (o.awning) { const c = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_blue'][Math.floor(r() * 4)]; bag.add(c, prism(F, y, [[u0 + 0.15, top + 0.02], [u1 - 0.15, top + 0.02], [u1 - 0.15, top - 0.45], [u0 + 0.15, top - 0.15]].map(([u, v]) => [u, v]), 0.1, 0.9)); }
}

/**
 * The street face of a house on frame F. o: { w, n (storeys), kind, seed, mat, floors (sill heights), fh (floor heights), ground, lod, from }.
 * Returns the height of the cornice's top.
 */
export function facade(bag, F, y, o) {
  const trimM = o.trim ?? TRIM, r = rng(o.seed * 7 + 3), w = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), kind = o.kind, n = o.n;
  const G = kind === 'biedermeier' ? 3.6 : kind === 'ring' ? 5.4 : 4.5, PN = kind === 'biedermeier' ? 3.3 : kind === 'ring' ? 5.0 : 4.6, UP = kind === 'biedermeier' ? 3.2 : 3.8;
  const floors = [0, G]; for (let i = 2; i < n; i++) floors.push(G + PN + (i - 2) * UP);
  const H = n < 2 ? G : floors[n - 1] + (n === 2 ? PN : UP);
  const bays = o.bays ?? Math.max(2, Math.round(w / (kind === 'ring' ? 3.8 : 3.3))), bw = w / bays, ww = Math.min(1.45, bw - 1.2) + (kind === 'ring' ? 0.15 : 0);
  const lod = o.lod ?? 0, from = o.from ?? 0, doorBay = o.doorBay ?? (bays % 2 ? (r() < 0.6 ? Math.floor(bays / 2) : 0) : (r() < 0.5 ? 0 : bays - 1));
  const openings = [];
  // ---- ground floor (unless the café draws it)
  if (from === 0) {
    const g = G, sh = kind !== 'biedermeier' && (o.shops ?? true);
    const doorW = kind === 'biedermeier' ? 1.3 : 2.9;
    for (let i = 0; i < bays; i++) {
      const u = (i + 0.5) * bw, u0 = i * bw, u1 = (i + 1) * bw;
      if (i === doorBay && kind !== 'biedermeier' || (kind === 'biedermeier' && i === doorBay)) {
        // the Haustor: a tall round-headed carriage gate with studded leaves, or a plain house door
        const hh = kind === 'biedermeier' ? 2.5 : 3.5, hw = doorW / 2;
        if (!o.passage) {
          A('wood_dark', u - hw, u + hw, 0, hh - hw * 0.3, -0.04, 0.08);
          A('opening', u - hw + 0.1, u + hw - 0.1, hh * 0.58, hh - hw * 0.3, 0.08, 0.1);
          A('wood_dark', u - 0.02, u + 0.02, 0, hh - hw * 0.3, 0.1, 0.12);
        }
        if (o.passage) {
          // the open carriage gate: a stone frame, a lintel with its keystone and the two guard stones (Prellsteine) at the foot
          A(trimM, u - hw - 0.3, u - hw, 0, hh + 0.25, 0, 0.2); A(trimM, u + hw, u + hw + 0.3, 0, hh + 0.25, 0, 0.2); A(trimM, u - hw - 0.35, u + hw + 0.35, hh, hh + 0.55, 0, 0.28); A('limestone', u - 0.25, u + 0.25, hh - 0.2, hh + 0.55, 0, 0.32);
          for (const sg of [-1, 1]) bag.add('granite_grey', lathe([[0.001, 0], [0.26, 0], [0.22, 0.2], [0.2, 0.7], [0.24, 0.8], [0.001, 0.86]], 8, null, ...(() => { const q = F.at(u + sg * (hw + 0.55), 0.45); return [q[0], y, q[1]]; })()));
          A('stucco_pale', u - hw - 0.7, u - hw - 0.3, hh + 0.7, hh + 1.0, 0, 0.1);
        } else if (kind !== 'biedermeier') {
          for (const q of outline(u, (v) => Math.max(0.05, hw * Math.sqrt(Math.max(0, 1 - ((v - (hh - hw * 0.3)) / (hw * 0.3 + 0.01)) ** 2))), hh - hw * 0.3, hh - 0.01, 3)) bag.add('wood_dark', prism(F, y, q, -0.04, 0.08));
          A(trimM, u - hw - 0.25, u - hw, 0, hh + 0.2, 0, 0.14); A(trimM, u + hw, u + hw + 0.25, 0, hh + 0.2, 0, 0.14); A(trimM, u - hw - 0.3, u + hw + 0.3, hh + 0.2, hh + 0.5, 0, 0.22);
          A('iron', u - hw + 0.1, u + hw - 0.1, hh * 0.58 - 0.02, hh * 0.58 + 0.02, 0.1, 0.13);
          if (!lod) { enamelSign(bag, F, y, u + hw + 0.9, 1.9, r); numberPlate(bag, F, y, u - hw - 0.7, 2.55); }
        } else { A(trimM, u - hw - 0.15, u + hw + 0.15, hh, hh + 0.14, 0, 0.1); A('limestone', u - hw - 0.1, u + hw + 0.1, 0, 0.12, 0, 0.45); }
        openings.push([u - hw - 0.3, u + hw + 0.3]);
      } else if (sh && !(o.noShop && o.noShop(i))) {
        shop(bag, F, y, u0 + 0.35, u1 - 0.35, g, { awning: r() < 0.55, lod, i }, r); openings.push([u0 + 0.25, u1 - 0.25]);
      } else {
        sashWindow(bag, F, y, u, 1.0, ww, kind === 'biedermeier' ? 1.6 : 2.4, { head: kind === 'biedermeier' ? 'plain' : 'seg', lod, trim: trimM });
        if (!lod && r() < (kind === 'biedermeier' ? 0.5 : 0.18)) flowerBox(bag, F, y, u, 1.0, ww, r);
        if (kind !== 'biedermeier') A('iron', u - ww / 2 - 0.02, u + ww / 2 + 0.02, 1.0, 1.04, 0.1, 0.16);
        openings.push([u - ww / 2 - 0.25, u + ww / 2 + 0.25]);
      }
    }
    // the plinth and the rusticated courses on the piers
    if (kind !== 'biedermeier') {
      A('granite_grey', -0.02, w + 0.02, 0, 0.7, 0, 0.06);
      openings.sort((p, q) => p[0] - q[0]);
      let s0 = 0; const piers = []; for (const [a, b] of openings) { if (a > s0) piers.push([s0, a]); s0 = Math.max(s0, b); } if (s0 < w) piers.push([s0, w]);
      for (const [a, b] of piers) if (b - a > 0.3) for (let v = 0.7; v + 0.5 < g - 0.3; v += 0.62) A(trimM, a, b, v, v + 0.5, 0, 0.045);
      A(trimM, -0.04, w + 0.04, g - 0.3, g, 0, 0.16);                                                      // the string course
    } else { A('limestone', -0.02, w + 0.02, 0, 0.5, 0, 0.05); A(trimM, -0.03, w + 0.03, G - 0.14, G, 0, 0.1); }
  }
  // ---- the upper floors
  for (let s = Math.max(1, from); s < n; s++) {
    const fh = s === 1 ? PN : UP, hh = fh - (kind === 'biedermeier' ? 1.5 : 1.45) + (s === 1 && kind !== 'biedermeier' ? 0.25 : 0) - (s === n - 1 && kind !== 'biedermeier' ? 0.35 : 0), v0 = floors[s] + (kind === 'biedermeier' ? 0.7 : 0.75);
    const head = kind === 'biedermeier' ? 'plain' : s === 1 ? (r() < 0.5 ? 'tri' : 'seg') : s === 2 ? 'cornice' : 'plain';
    const alt = s === 1 ? (i) => (i % 2 ? 'seg' : 'tri') : () => head;
    for (let i = 0; i < bays; i++) {
      const u = (i + 0.5) * bw;
      sashWindow(bag, F, y, u, v0, ww, hh, { head: kind === 'ring' && s === 1 ? alt(i) : head, lod, trim: trimM });
      if (!lod) {
        const q = r();
        if (q < (kind === 'biedermeier' ? 0.42 : s < 3 ? 0.2 : 0.12)) flowerBox(bag, F, y, u, v0, ww, r);
        else curtains(bag, F, y, u, v0, ww, hh, r);
      }
      if (s === 1 && kind !== 'biedermeier' && (i === Math.floor(bays / 2) || kind === 'ring' || (bays > 3 && i === doorBay))) balcony(bag, F, y, u, v0, ww + 0.9, lod);
      else if (s === 2 && kind === 'ring' && i % 2 === 0) balcony(bag, F, y, u, v0, ww + 0.6, lod, 0.45);
    }
    if (kind !== 'biedermeier') A(trimM, -0.03, w + 0.03, floors[s] - 0.2, floors[s] + 0.05, 0, 0.1);      // the floor's string
  }
  // the pilasters of a big ring house: a giant order up the piano nobile and the floor above
  if (kind === 'ring' && n > 2) for (let k = 0; k <= bays; k++) { const u = k * bw, a = Math.max(0.2, Math.min(w - 0.2, u)); A(trimM, a - 0.2, a + 0.2, G, floors[3 <= n - 1 ? 3 : n - 1], 0, 0.12); }
  // ---- the cornice
  const top = H;
  if (kind === 'biedermeier') { A(trimM, -0.05, w + 0.05, top - 0.3, top, 0, 0.25); A('stucco_cream', -0.05, w + 0.05, top - 0.5, top - 0.3, 0, 0.12); }
  else {
    A(trimM, -0.05, w + 0.05, top - 0.95, top - 0.5, 0, 0.12);
    A(trimM, -0.1, w + 0.1, top - 0.5, top - 0.3, 0, 0.38);
    A(trimM, -0.15, w + 0.15, top - 0.3, top, 0, 0.62);
    if (!lod) for (let u = 0.3; u < w - 0.2; u += 0.5) A(trimM, u - 0.1, u + 0.1, top - 0.5, top - 0.3, 0.38, 0.45);       // the dentils
  }
  // ---- the variety of the front: giant pilasters or sgraffito bands, an oriel, and then the weather
  if (kind === 'gruender' && !o.plain && n >= 4) {
    const v = r();
    if (v < 0.24) for (let k = 0; k <= bays; k++) { const u = Math.max(0.2, Math.min(w - 0.2, k * bw)); A(trimM, u - 0.17, u + 0.17, G, floors[n - 1] + 0.1, 0, 0.1); }
    else if (v < 0.5 && !lod) for (let sI = 2; sI < n; sI++) for (let k = 0; k < bays * 2; k++) { const u = (k + 0.5) * bw / 2; A(sI % 2 ? 'stucco_ochre' : 'stucco_rose', u - 0.14, u + 0.14, floors[sI] - 0.62, floors[sI] - 0.34, 0.02, 0.04); }
    if (w >= 10 && r() < 0.34 && !o.passage) { const bi = r() < 0.5 ? 1 : bays - 2, u = (bi + 0.5) * bw, ow = Math.min(3.8, bw * 1.15 + 0.6); oriel(bag, F, y, u, floors[2] - 0.15, floors[Math.min(n - 1, 4)] - 0.25, ow, o.mat ?? 'stucco_cream', trimM, lod); }
  }
  if (!lod && !o.noWeather) weather(bag, F, y, { w, H, G, floors, r, kind, bays });
  return { H, floors, bays, bw, doorBay };
}

/**
 * mietshaus: { rect, front ('n'|'s'|'e'|'w'), storeys, seed, y, kind: 'gruender' | 'biedermeier' | 'ring', side (a second street face), lod,
 * simple (the far tile), shops, passage (a Durchhaus: the lot's index of its yard), yardAt (the yard it backs onto), open (the trade of a shop
 * that can be walked into), mat, faience, medallions }.
 */
const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
export function mietshaus(el, ctx) {
  const { bag, col } = ctx;
  const r = rng(el.seed || 1), y = el.y ?? 0, f = el.front ?? 's', kind = el.kind ?? 'gruender', n = el.storeys ?? (kind === 'biedermeier' ? 2 : 5);
  const [x0, z0, x1, z1] = el.rect, F = faceFrame(el.rect, f), mat = el.mat ?? (kind === 'biedermeier' ? ['stucco_cream', 'stucco_pale', 'stucco_ochre', 'stucco_saffron'][Math.floor(r() * 4)] : TINTS[Math.floor(r() * TINTS.length)]);
  const lod = el.simple ? 2 : el.lod ?? 0, far = !!el.simple;
  const TRIMS = ['stucco_pale', 'stucco_pale', 'plaster_white', 'sandstone_white', 'stucco_cream'];
  const trim = kind === 'ring' ? 'sandstone_white' : TRIMS[Math.floor(rng((el.seed || 1) * 13 + 5)() * TRIMS.length)];
  const W = F.w, D = F.D;
  // the openings of the mass: a Durchhaus (an arched passage of the whole depth) or a shop (a room behind its front)
  const wantPass = el.passage !== undefined && el.passage !== null && !far, wantOpen = !!el.open && !far && !wantPass;
  const rb = rng((el.seed || 1) * 31 + 7), bays0 = kind === 'ring' ? Math.max(2, Math.round(W / 3.8)) : Math.max(2, Math.round(W / 3.3));
  const bays = wantPass ? (bays0 % 2 ? bays0 : bays0 + 1) : bays0;
  const info = facade(bag, F, y, { n, kind, seed: el.seed || 1, lod, shops: wantOpen ? false : el.shops, doorBay: wantPass ? Math.floor(bays / 2) : el.doorBay, noShop: el.noShop, from: wantOpen ? 1 : 0, trim, bays, passage: wantPass, mat });
  const H = info.H, G = kind === 'biedermeier' ? 3.6 : kind === 'ring' ? 5.4 : 4.5;
  if (el.faience || el.medallions) {
    const bays = Math.max(2, Math.round(F.w / 3.3)), bw = F.w / bays;
    for (let sI = 1; sI < n; sI++) for (let k = 0; k <= bays; k++) {
      const u = Math.max(0.35, Math.min(F.w - 0.35, k * bw)), v = info.floors[sI] + 1.0;
      if (el.faience) {
        for (let q = 0; q < 4; q++) { const vv = v + q * 0.75; if (vv + 0.3 > (info.floors[sI + 1] ?? H) - 0.4) break; bag.add(q % 2 ? 'paint_blue' : 'stucco_rose', prism(F, y, ngon(u, vv, 0.2, 9), 0.0, 0.05)); bag.add('glaze_green', prism(F, y, [[u - 0.32, vv - 0.1], [u - 0.08, vv - 0.03], [u - 0.1, vv + 0.08]], 0.0, 0.045)); bag.add('glaze_green', prism(F, y, [[u + 0.32, vv - 0.1], [u + 0.08, vv - 0.03], [u + 0.1, vv + 0.08]], 0.0, 0.045)); }
        bag.add('glaze_green', fbox(F, y, u - 0.02, u + 0.02, info.floors[sI], info.floors[sI] + 0.9, 0.0, 0.04));
      } else if (sI === 2) { bag.add('gold', prism(F, y, ngon(u, info.floors[sI] - 0.9, 0.5, 14), 0.0, 0.08)); bag.add('gilt_bronze', prism(F, y, ngon(u, info.floors[sI] - 0.9, 0.28, 10), 0.08, 0.12)); }
    }
  }
  let side = null, F2 = null;
  if (el.side) { F2 = faceFrame(el.rect, el.side); side = facade(bag, F2, y, { n, kind, seed: (el.seed || 1) + 91, lod, shops: el.shops, doorBay: 99, noShop: el.noShop, trim, mat }); void side; }
  // ── the mass
  const P = (u0, u1, d0, d1) => { const a = F.at(u0, d0), b = F.at(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const M = (m, u0, u1, v0, v1, d0, d1, hard = true) => { if (u1 - u0 < 1e-3 || v1 - v0 < 1e-3 || d1 - d0 < 1e-3) return; const q = P(u0, u1, d0, d1); bag.add(m, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); if (hard) col.rect(q, y + v0, y + v1); };
  if (wantPass) {
    const bw = W / bays, uc = (Math.floor(bays / 2) + 0.5) * bw, hw = 1.45, PH = 3.5;
    M(mat, 0, uc - hw, -0.6, H, -D, 0); M(mat, uc + hw, W, -0.6, H, -D, 0); M(mat, uc - hw, uc + hw, PH, H, -D, 0);
    passage(ctx, F, y, { u0: uc - hw, u1: uc + hw, D, PH, seed: el.seed || 1 });
    // the yard end: the arch's frame, and a sill of granite
    bag.add('granite_grey', fbox(F, y, uc - hw, uc + hw, 0.0, 0.05, -D, 0));
  } else if (wantOpen) {
    const sw = Math.min(W - 1, 1e9), RD = Math.min(SHOP_RD, D - 4);
    void sw; void RD;
    shopRoom(ctx, F, y, { w: W, D, g: G, H, mat, bays, trade: el.open, seed: el.seed || 1 });
    shopFront(bag, F, y, { w: W, g: G, bays, trade: el.open, seed: el.seed || 1, lod });
  } else { bag.add(mat, box(x0, y - 0.6, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.6, y + H); }
  // the rear face, to the yard it backs onto, with galleries on the houses that have a way in
  if (!far && el.yardAt !== undefined && el.yardAt !== null && kind !== 'biedermeier') {
    const Fr = faceFrame(el.rect, OPP[f]);
    rearFace(bag, Fr, y, { n, floors: info.floors, H, r: rb, lod, gallery: wantPass || rb() < 0.5 }, sashWindow);
  }
  // the corner turret of a corner house
  if (el.side && !far && kind !== 'biedermeier' && n >= 5 && rng((el.seed || 1) * 17 + 3)() < 0.55) {
    const cu = F2 && (el.side === 'w' ? (f === 's' || f === 'w' ? 0 : W) : el.side === 'e' ? (f === 's' ? W : f === 'n' ? 0 : W) : 0);
    const corner = el.side === 'w' ? (f === 's' ? [x0, z1] : [x0, z0]) : [x1, f === 's' ? z1 : z0];
    void cu;
    const dx = el.side === 'w' ? -1 : 1, dz = f === 's' ? 1 : -1;
    turret(bag, corner[0] + dx * 0.15, y, corner[1] + dz * 0.15, info.floors[2] - 0.3, Math.min(H - 0.5, info.floors[Math.min(n - 1, 4)] + 3.0), mat, trim, lod);
  }
  // the roof
  const along = f === 'n' || f === 's', FD = F.D, FW = F.w;
  const sx = [el.side === 'w' ? 1 : 0, el.side === 'e' ? 1 : 0], sz = [el.side === 'n' ? 1 : 0, el.side === 's' ? 1 : 0];
  if (kind === 'biedermeier') {
    const rh = Math.min(4.0, FD * 0.3), ov = 0.35;
    const R = [x0 - (along ? 0 : ov), z0 - (along ? ov : 0), x1 + (along ? 0 : ov), z1 + (along ? ov : 0)];
    const ins = along ? [0, 0, FD / 2 + ov - 0.1, FD / 2 + ov - 0.1] : [FD / 2 + ov - 0.1, FD / 2 + ov - 0.1, 0, 0];
    bag.add('roof_tile', frustum(R, y + H, y + H + rh, ins[0], ins[1], ins[2], ins[3]));
    const cx = x0 + (x1 - x0) * (0.25 + r() * 0.5), cz = z0 + (z1 - z0) * (0.25 + r() * 0.5);
    bag.add('brick_baked', box(cx - 0.35, y + H, cz - 0.35, cx + 0.35, y + H + rh + 0.9, cz + 0.35)); bag.add('stucco_pale', box(cx - 0.42, y + H + rh + 0.9, cz - 0.42, cx + 0.42, y + H + rh + 1.0, cz + 0.42));
    // the dormers of an attic: a row of little gabled ones on the street slope
    if (!far && FW > 7 && rng((el.seed || 1) + 55)() < 0.5) for (let k = 0; k < Math.max(1, Math.round(FW / 4.5)); k++) { const u = (k + 0.5) * FW / Math.max(1, Math.round(FW / 4.5)), A = (m, ...q) => bag.add(m, fbox(F, y, ...q)); A('stucco_pale', u - 0.55, u + 0.55, H + 0.2, H + 1.5, -1.2, 0.35); A('opening', u - 0.35, u + 0.35, H + 0.4, H + 1.3, 0.35, 0.4); bag.add('roof_tile', prism(F, y, [[u - 0.75, H + 1.5], [u + 0.75, H + 1.5], [u, H + 2.2]], -1.2, 0.5)); }
    return;
  }
  // mansard: steep lower slope (inset s1 over 3.4 m), flatter upper to the ridge
  const s0 = 0.05, s1 = 2.9, hl = 3.4, hu = Math.max(1.2, FD / 2 - s1) * 0.55;
  const e = (a) => a ? 1 : 0;
  const lo = along ? [e(sx[0]) * s0, e(sx[1]) * s0, s0, s0] : [s0, s0, e(sz[0]) * s0, e(sz[1]) * s0];
  const mid = along ? [e(sx[0]) * s1, e(sx[1]) * s1, s1, s1] : [s1, s1, e(sz[0]) * s1, e(sz[1]) * s1];
  const lim = (v, a) => Math.min(v, a);
  const topIns = along ? [e(sx[0]) * lim(s1 + 1.5, FW / 2 - 1), e(sx[1]) * lim(s1 + 1.5, FW / 2 - 1), FD / 2 - 0.01, FD / 2 - 0.01] : [FW / 2 - 0.01 - 0, FW / 2 - 0.01, e(sz[0]) * lim(s1 + 1.5, FD / 2 - 1), e(sz[1]) * lim(s1 + 1.5, FD / 2 - 1)];
  const roofMat = rng((el.seed || 1) * 3 + 9)() < 0.18 && !far ? 'tile_dark' : 'slate';
  bag.add(roofMat, frustum([x0 + lo[0], z0 + lo[2], x1 - lo[1], z1 - lo[3]], y + H + 0.02, y + H + hl, mid[0] - lo[0], mid[1] - lo[1], mid[2] - lo[2], mid[3] - lo[3]));
  bag.add(roofMat, frustum([x0 + mid[0], z0 + mid[2], x1 - mid[1], z1 - mid[3]], y + H + hl, y + H + hl + hu, topIns[0] - mid[0], topIns[1] - mid[1], topIns[2] - mid[2], topIns[3] - mid[3]));
  // dormers on the street slope: gabled, round-headed or a small pediment, each its own, with a lead apron
  const dB = F.w / Math.max(2, Math.round(F.w / 3.3)), nd = Math.max(1, Math.round(F.w / (dB * 2))), rd = rng((el.seed || 1) * 5 + 1);
  for (let k = 0; k < nd; k++) {
    const u = (k + 0.5) * F.w / nd, A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), t = rd();
    A('stucco_pale', u - 0.8, u + 0.8, H + 0.7, H + 2.9, -2.8, -0.55);
    A('opening', u - 0.5, u + 0.5, H + 1.05, H + 2.5, -0.57, -0.5); A('paint_white', u - 0.55, u + 0.55, H + 0.95, H + 1.05, -0.6, -0.48); A('paint_white', u - 0.02, u + 0.02, H + 1.05, H + 2.5, -0.57, -0.48);
    if (t < 0.5) bag.add(roofMat, prism(F, y, [[u - 1.0, H + 2.9], [u + 1.0, H + 2.9], [u, H + 3.8]], -2.8, -0.35));
    else if (t < 0.8) { A(roofMat, u - 1.0, u + 1.0, H + 2.9, H + 3.2, -2.8, -0.35); bag.add(roofMat, prism(F, y, [[u - 0.9, H + 3.2], [u + 0.9, H + 3.2], [u + 0.45, H + 3.55], [u - 0.45, H + 3.55]], -2.8, -0.35)); }
    else { bag.add('stucco_pale', prism(F, y, [[u - 0.9, H + 2.9], [u + 0.9, H + 2.9], [u, H + 3.55]], -0.9, -0.5)); A(roofMat, u - 1.0, u + 1.0, H + 2.9, H + 3.0, -2.8, -0.35); }
    A('iron', u - 0.02, u + 0.02, H + 3.8, H + 4.2, -1.7, -1.66);
    if (!far) A('lead', u - 1.05, u + 1.05, H + 0.55, H + 0.7, -0.6, 0.15);
  }
  // chimneys in a row on the ridge, with pots on some
  for (let k = 0; k < 2 + (FW > 12 ? 1 : 0); k++) { const u = (k + 0.5 + r() * 0.3) * FW / 3, c = F.at(u, -FD / 2); const [cx, cz] = c; bag.add('brick_baked', box(cx - 0.4, y + H + hl, cz - 0.4, cx + 0.4, y + H + hl + hu + 1.5, cz + 0.4)); bag.add('stucco_pale', box(cx - 0.5, y + H + hl + hu + 1.5, cz - 0.5, cx + 0.5, y + H + hl + hu + 1.62, cz + 0.5)); if (!far && r() < 0.6) bag.add('terracotta', lathe([[0.001, 0], [0.16, 0], [0.18, 0.5], [0.14, 0.6], [0.001, 0.6]], 8, null, cx, y + H + hl + hu + 1.62, cz)); }
  void shopRoomRect;
}
const shopRoomRect = null;
void SHOP_T; void NAMES; void numberPlate;
