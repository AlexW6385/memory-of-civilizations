// The Viennese tenement and townhouse of 1902 (docs/settlements/vienna.md §3, §5): the Gründerzeit Mietshaus — a rusticated
// ground floor with shops and the Haustor, a piano nobile whose windows carry pediments over consoles, plainer floors above,
// a heavy cornice and a slate mansard with dormers — and the older Biedermeier house of two or three storeys under a tile roof.
// Everything is drawn on the face's own frame (u along the front, v up, d outward; styles/dutch/facade.js).

import { box, frustum } from '../../core/geom.js';
import { faceFrame, prism, fbox, outline, ngon } from '../dutch/facade.js';

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
  A('gold', u0 + 0.5, u1 - 0.5, (top + g) / 2 - 0.16, (top + g) / 2 + 0.12, 0.1, 0.12);          // the gilt lettering
  if (o.awning) { const c = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_blue'][Math.floor(r() * 4)]; bag.add(c, prism(F, y, [[u0 + 0.15, top + 0.02], [u1 - 0.15, top + 0.02], [u1 - 0.15, top - 0.45], [u0 + 0.15, top - 0.15]].map(([u, v]) => [u, v]), 0.1, 0.9)); }
}

/**
 * The street face of a house on frame F. o: { w, n (storeys), kind, seed, mat, floors (sill heights), fh (floor heights), ground, lod, from }.
 * Returns the height of the cornice's top.
 */
export function facade(bag, F, y, o) {
  const r = rng(o.seed * 7 + 3), w = F.w, A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), kind = o.kind, n = o.n;
  const G = kind === 'biedermeier' ? 3.6 : kind === 'ring' ? 5.4 : 4.5, PN = kind === 'biedermeier' ? 3.3 : kind === 'ring' ? 5.0 : 4.6, UP = kind === 'biedermeier' ? 3.2 : 3.8;
  const floors = [0, G]; for (let i = 2; i < n; i++) floors.push(G + PN + (i - 2) * UP);
  const H = n < 2 ? G : floors[n - 1] + (n === 2 ? PN : UP);
  const bays = Math.max(2, Math.round(w / (kind === 'ring' ? 3.8 : 3.3))), bw = w / bays, ww = Math.min(1.45, bw - 1.2) + (kind === 'ring' ? 0.15 : 0);
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
        A('wood_dark', u - hw, u + hw, 0, hh - hw * 0.3, -0.04, 0.08);
        A('opening', u - hw + 0.1, u + hw - 0.1, hh * 0.58, hh - hw * 0.3, 0.08, 0.1);
        A('wood_dark', u - 0.02, u + 0.02, 0, hh - hw * 0.3, 0.1, 0.12);
        if (kind !== 'biedermeier') {
          for (const q of outline(u, (v) => Math.max(0.05, hw * Math.sqrt(Math.max(0, 1 - ((v - (hh - hw * 0.3)) / (hw * 0.3 + 0.01)) ** 2))), hh - hw * 0.3, hh - 0.01, 3)) bag.add('wood_dark', prism(F, y, q, -0.04, 0.08));
          A(TRIM, u - hw - 0.25, u - hw, 0, hh + 0.2, 0, 0.14); A(TRIM, u + hw, u + hw + 0.25, 0, hh + 0.2, 0, 0.14); A(TRIM, u - hw - 0.3, u + hw + 0.3, hh + 0.2, hh + 0.5, 0, 0.22);
          A('iron', u - hw + 0.1, u + hw - 0.1, hh * 0.58 - 0.02, hh * 0.58 + 0.02, 0.1, 0.13);
        } else { A(TRIM, u - hw - 0.15, u + hw + 0.15, hh, hh + 0.14, 0, 0.1); A('limestone', u - hw - 0.1, u + hw + 0.1, 0, 0.12, 0, 0.45); }
        openings.push([u - hw - 0.3, u + hw + 0.3]);
      } else if (sh && !(o.noShop && o.noShop(i))) {
        shop(bag, F, y, u0 + 0.35, u1 - 0.35, g, { awning: r() < 0.55 }, r); openings.push([u0 + 0.25, u1 - 0.25]);
      } else {
        sashWindow(bag, F, y, u, 1.0, ww, kind === 'biedermeier' ? 1.6 : 2.4, { head: kind === 'biedermeier' ? 'plain' : 'seg', lod });
        if (kind !== 'biedermeier') A('iron', u - ww / 2 - 0.02, u + ww / 2 + 0.02, 1.0, 1.04, 0.1, 0.16);
        openings.push([u - ww / 2 - 0.25, u + ww / 2 + 0.25]);
      }
    }
    // the plinth and the rusticated courses on the piers
    if (kind !== 'biedermeier') {
      A('granite_grey', -0.02, w + 0.02, 0, 0.7, 0, 0.06);
      openings.sort((p, q) => p[0] - q[0]);
      let s0 = 0; const piers = []; for (const [a, b] of openings) { if (a > s0) piers.push([s0, a]); s0 = Math.max(s0, b); } if (s0 < w) piers.push([s0, w]);
      for (const [a, b] of piers) if (b - a > 0.3) for (let v = 0.7; v + 0.5 < g - 0.3; v += 0.62) A(TRIM, a, b, v, v + 0.5, 0, 0.045);
      A(TRIM, -0.04, w + 0.04, g - 0.3, g, 0, 0.16);                                                      // the string course
    } else { A('limestone', -0.02, w + 0.02, 0, 0.5, 0, 0.05); A(TRIM, -0.03, w + 0.03, G - 0.14, G, 0, 0.1); }
  }
  // ---- the upper floors
  for (let s = Math.max(1, from); s < n; s++) {
    const fh = s === 1 ? PN : UP, hh = fh - (kind === 'biedermeier' ? 1.5 : 1.45) + (s === 1 && kind !== 'biedermeier' ? 0.25 : 0) - (s === n - 1 && kind !== 'biedermeier' ? 0.35 : 0), v0 = floors[s] + (kind === 'biedermeier' ? 0.7 : 0.75);
    const head = kind === 'biedermeier' ? 'plain' : s === 1 ? (r() < 0.5 ? 'tri' : 'seg') : s === 2 ? 'cornice' : 'plain';
    const alt = s === 1 ? (i) => (i % 2 ? 'seg' : 'tri') : () => head;
    for (let i = 0; i < bays; i++) {
      const u = (i + 0.5) * bw;
      sashWindow(bag, F, y, u, v0, ww, hh, { head: kind === 'ring' && s === 1 ? alt(i) : head, lod });
      if (s === 1 && kind !== 'biedermeier' && (i === Math.floor(bays / 2) || kind === 'ring' || (bays > 3 && i === doorBay))) balcony(bag, F, y, u, v0, ww + 0.9, lod);
      else if (s === 2 && kind === 'ring' && i % 2 === 0) balcony(bag, F, y, u, v0, ww + 0.6, lod, 0.45);
    }
    if (kind !== 'biedermeier') A(TRIM, -0.03, w + 0.03, floors[s] - 0.2, floors[s] + 0.05, 0, 0.1);      // the floor's string
  }
  // the pilasters of a big ring house: a giant order up the piano nobile and the floor above
  if (kind === 'ring' && n > 2) for (let k = 0; k <= bays; k++) { const u = k * bw, a = Math.max(0.2, Math.min(w - 0.2, u)); A(TRIM, a - 0.2, a + 0.2, G, floors[3 <= n - 1 ? 3 : n - 1], 0, 0.12); }
  // ---- the cornice
  const top = H;
  if (kind === 'biedermeier') { A(TRIM, -0.05, w + 0.05, top - 0.3, top, 0, 0.25); A('stucco_cream', -0.05, w + 0.05, top - 0.5, top - 0.3, 0, 0.12); }
  else {
    A(TRIM, -0.05, w + 0.05, top - 0.95, top - 0.5, 0, 0.12);
    A(TRIM, -0.1, w + 0.1, top - 0.5, top - 0.3, 0, 0.38);
    A(TRIM, -0.15, w + 0.15, top - 0.3, top, 0, 0.62);
    if (!lod) for (let u = 0.3; u < w - 0.2; u += 0.5) A(TRIM, u - 0.1, u + 0.1, top - 0.5, top - 0.3, 0.38, 0.45);       // the dentils
  }
  return { H, floors };
}

/**
 * mietshaus: { rect, front ('n'|'s'|'e'|'w'), storeys, seed, y, kind: 'gruender' | 'biedermeier' | 'ring', side (a second street face), lod, shops }.
 */
export function mietshaus(el, { bag, col }) {
  const r = rng(el.seed || 1), y = el.y ?? 0, f = el.front ?? 's', kind = el.kind ?? 'gruender', n = el.storeys ?? (kind === 'biedermeier' ? 2 : 5);
  const [x0, z0, x1, z1] = el.rect, F = faceFrame(el.rect, f), mat = el.mat ?? (kind === 'biedermeier' ? ['stucco_cream', 'stucco_pale', 'stucco_ochre', 'stucco_saffron'][Math.floor(r() * 4)] : TINTS[Math.floor(r() * TINTS.length)]);
  const lod = el.lod ?? 0;
  const info = facade(bag, F, y, { n, kind, seed: el.seed || 1, lod, shops: el.shops, doorBay: el.doorBay, noShop: el.noShop, from: 0 });
  const H = info.H;
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
  let side = null;
  if (el.side) { const F2 = faceFrame(el.rect, el.side); side = facade(bag, F2, y, { n, kind, seed: (el.seed || 1) + 91, lod, shops: el.shops, doorBay: 99, noShop: el.noShop }); void side; }
  bag.add(mat, box(x0, y - 0.6, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.6, y + H);
  // the roof
  const along = f === 'n' || f === 's', D = F.D, W = F.w;
  const sx = [el.side === 'w' ? 1 : 0, el.side === 'e' ? 1 : 0], sz = [el.side === 'n' ? 1 : 0, el.side === 's' ? 1 : 0];
  if (kind === 'biedermeier') {
    const rh = Math.min(4.0, D * 0.3), ov = 0.35;
    const R = [x0 - (along ? 0 : ov), z0 - (along ? ov : 0), x1 + (along ? 0 : ov), z1 + (along ? ov : 0)];
    const ins = along ? [0, 0, D / 2 + ov - 0.1, D / 2 + ov - 0.1] : [D / 2 + ov - 0.1, D / 2 + ov - 0.1, 0, 0];
    bag.add('roof_tile', frustum(R, y + H, y + H + rh, ins[0], ins[1], ins[2], ins[3]));
    const cx = x0 + (x1 - x0) * (0.25 + r() * 0.5), cz = z0 + (z1 - z0) * (0.25 + r() * 0.5);
    bag.add('brick_baked', box(cx - 0.35, y + H, cz - 0.35, cx + 0.35, y + H + rh + 0.9, cz + 0.35)); bag.add('stucco_pale', box(cx - 0.42, y + H + rh + 0.9, cz - 0.42, cx + 0.42, y + H + rh + 1.0, cz + 0.42));
    return;
  }
  // mansard: steep lower slope (inset s1 over 3.4 m), flatter upper to the ridge
  const s0 = 0.05, s1 = 2.9, hl = 3.4, hu = Math.max(1.2, D / 2 - s1) * 0.55;
  const e = (a) => a ? 1 : 0;
  const lo = along ? [e(sx[0]) * s0, e(sx[1]) * s0, s0, s0] : [s0, s0, e(sz[0]) * s0, e(sz[1]) * s0];
  const mid = along ? [e(sx[0]) * s1, e(sx[1]) * s1, s1, s1] : [s1, s1, e(sz[0]) * s1, e(sz[1]) * s1];
  const lim = (v, a) => Math.min(v, a);
  const topIns = along ? [e(sx[0]) * lim(s1 + 1.5, W / 2 - 1), e(sx[1]) * lim(s1 + 1.5, W / 2 - 1), D / 2 - 0.01, D / 2 - 0.01] : [W / 2 - 0.01 - 0, W / 2 - 0.01, e(sz[0]) * lim(s1 + 1.5, D / 2 - 1), e(sz[1]) * lim(s1 + 1.5, D / 2 - 1)];
  // (frustum insets are in plan, per -x, +x, -z, +z; the front/back insets go with the street)
  bag.add('slate', frustum([x0 + lo[0], z0 + lo[2], x1 - lo[1], z1 - lo[3]], y + H + 0.02, y + H + hl, mid[0] - lo[0], mid[1] - lo[1], mid[2] - lo[2], mid[3] - lo[3]));
  bag.add('slate', frustum([x0 + mid[0], z0 + mid[2], x1 - mid[1], z1 - mid[3]], y + H + hl, y + H + hl + hu, topIns[0] - mid[0], topIns[1] - mid[1], topIns[2] - mid[2], topIns[3] - mid[3]));
  // dormers on the street slope
  const dB = F.w / Math.max(2, Math.round(F.w / 3.3)), nd = Math.max(1, Math.round(F.w / (dB * 2)));
  for (let k = 0; k < nd; k++) {
    const u = (k + 0.5) * F.w / nd, A = (m, ...q) => bag.add(m, fbox(F, y, ...q));
    A('stucco_pale', u - 0.8, u + 0.8, H + 0.7, H + 2.9, -2.8, -0.55);
    A('opening', u - 0.5, u + 0.5, H + 1.05, H + 2.5, -0.57, -0.5); A('paint_white', u - 0.55, u + 0.55, H + 0.95, H + 1.05, -0.6, -0.48); A('paint_white', u - 0.02, u + 0.02, H + 1.05, H + 2.5, -0.57, -0.48);
    bag.add('slate', prism(F, y, [[u - 1.0, H + 2.9], [u + 1.0, H + 2.9], [u, H + 3.8]], -2.8, -0.35));
    A('iron', u - 0.02, u + 0.02, H + 3.8, H + 4.2, -1.7, -1.66);
  }
  // chimneys in a row on the ridge
  for (let k = 0; k < 2 + (W > 12 ? 1 : 0); k++) { const u = (k + 0.5 + r() * 0.3) * W / 3, c = along ? [F.at(u, -D / 2)] : [F.at(u, -D / 2)]; const [cx, cz] = c[0]; bag.add('brick_baked', box(cx - 0.4, y + H + hl, cz - 0.4, cx + 0.4, y + H + hl + hu + 1.5, cz + 0.4)); bag.add('stucco_pale', box(cx - 0.5, y + H + hl + hu + 1.5, cz - 0.5, cx + 0.5, y + H + hl + hu + 1.62, cz + 0.5)); }
}
