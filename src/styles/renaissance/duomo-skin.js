// The marble of Santa Maria del Fiore in relief (docs/settlements/florence.md §13): the skin of the walls with its
// pilasters, string courses, framed panels (pink and green fields, lozenges) and two-light pointed windows; the side
// portals under their steep gables; the west front of about 1480 (Arnolfo's lower order with its three portals and
// the statues in niches); the dome's eight white ribs and the herringbone of its brick sails; the drum's panelling;
// the tribunes' ribbed domes. Faces are built in their own frames (u along the wall left to right seen from outside,
// y up, d outward) and merged per material, like the Baptistery's.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Local, ext, archOutline, headPts, faceFrame, wrect } from './face.js';
import { ball, limb, T } from '../qing/carving.js';

const M = 'marble', G = 'verde_antico', PINK = 'marble_pink', PS = 'pietra_serena', GL = 'stained_glass', O = 'opening';

const ring = (cx, cy, r0, r1, n = 12) => {
  const o = [], i = [];
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; o.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]); i.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]); }
  return [o, i];
};
const lozenge = (cx, cy, hw, hh) => [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]];

/** A framed panel of the marble skin: a white frame, a green line, a field (pink or green) and a lozenge of the other colour. */
function panel(Lc, u0, u1, v0, v1, variant) {
  const f = 0.13, w = u1 - u0, h = v1 - v0;
  if (w < 0.8 || h < 0.8) return;
  Lc.box(M, u0, v0, 0, u1, v0 + f, 0.1); Lc.box(M, u0, v1 - f, 0, u1, v1, 0.1);
  Lc.box(M, u0, v0 + f, 0, u0 + f, v1 - f, 0.1); Lc.box(M, u1 - f, v0 + f, 0, u1, v1 - f, 0.1);
  const a0 = u0 + f, a1 = u1 - f, b0 = v0 + f, b1 = v1 - f;
  const pinkField = variant % 2 === 0;
  Lc.box(pinkField ? PINK : G, a0, b0, 0, a1, b1, 0.05);
  // the green (or white) line inside the frame, then the lozenge
  const g = 0.09;
  Lc.box(pinkField ? G : M, a0 + 0.12, b0 + 0.12, 0.05, a1 - 0.12, b0 + 0.12 + g, 0.08); Lc.box(pinkField ? G : M, a0 + 0.12, b1 - 0.12 - g, 0.05, a1 - 0.12, b1 - 0.12, 0.08);
  Lc.box(pinkField ? G : M, a0 + 0.12, b0 + 0.12 + g, 0.05, a0 + 0.12 + g, b1 - 0.12 - g, 0.08); Lc.box(pinkField ? G : M, a1 - 0.12 - g, b0 + 0.12 + g, 0.05, a1 - 0.12, b1 - 0.12 - g, 0.08);
  const cx = (a0 + a1) / 2, cy = (b0 + b1) / 2, hw = (a1 - a0) / 2 - 0.45, hh = Math.min((b1 - b0) / 2 - 0.45, hw * 1.5);
  if (hw > 0.3 && hh > 0.3) {
    Lc.add(pinkField ? G : PINK, ext(lozenge(cx, cy, hw, hh), [lozenge(cx, cy, hw * 0.8, hh * 0.8).reverse()], 0.05, 0.1, 1));
    if (hw > 0.9) Lc.add(M, ext(lozenge(cx, cy, hw * 0.34, hh * 0.34), [], 0.05, 0.09, 1));
  }
}

/** A string course of the skin across [u0, u1] at height v: green band, white drip below and cornice above. */
function string(Lc, u0, u1, v, deep = 0.28) {
  Lc.box(M, u0, v - 0.3, 0, u1, v - 0.17, deep - 0.08);
  Lc.box(G, u0, v - 0.17, 0, u1, v + 0.17, 0.1);
  Lc.box(M, u0, v + 0.17, 0, u1, v + 0.33, deep); Lc.box(M, u0, v + 0.33, 0, u1, v + 0.43, deep - 0.08);
}

/** A pointed two-light window of the skin, centred uc, glass from s0, total height th, width w. */
function window2(Lc, uc, s0, th, w) {
  const rise = w * Math.sin(Math.PI / 3), ys = s0 + th - rise;
  const inner = archOutline(uc, s0, w, ys, 'pointed', 5), outer = archOutline(uc, s0 - 0.15, w + 0.9, ys, 'pointed', 5), edge = archOutline(uc, s0 - 0.2, w + 1.25, ys, 'pointed', 5);
  Lc.add(GL, ext(inner, [], 0, 0.04, 2));
  Lc.add(M, ext(outer, [inner], 0, 0.2, 2));
  Lc.add(G, ext(edge, [outer], 0, 0.14, 2));
  Lc.box(M, uc - w / 2 - 0.7, s0 - 0.3, 0, uc + w / 2 + 0.7, s0 - 0.15, 0.32);
  // the tracery: a mullion, two small pointed lights and a ring in the head
  const sw = w / 2 - 0.12, sy = ys - 0.5;
  for (const sg of [-1, 1]) Lc.add(M, ext(headPts(uc + sg * w / 4, sy, sw, 'pointed', 3).concat(headPts(uc + sg * w / 4, sy, sw - 0.2, 'pointed', 3).reverse()), [], 0.04, 0.12, 2));
  Lc.box(M, uc - 0.06, s0, 0.04, uc + 0.06, sy + sw * 0.5, 0.12);
  const [ro, ri] = ring(uc, sy + sw * 0.866 + 0.4, 0.3, 0.19, 10); Lc.add(M, ext(ro, [ri], 0.04, 0.12, 1));
  for (const sg of [-1, 1]) Lc.add(G, rod([uc + sg * (w / 2 + 0.55), s0 - 0.1, 0.12], [uc + sg * (w / 2 + 0.55), ys + 0.15, 0.12], 0.07, 5));
}

/** A row of small blind pointed arches along u0..u1 under the cornice at height v (the arcaded frieze of the apses and the aisles). */
function frieze(Lc, u0, u1, v, n) {
  const p = (u1 - u0) / n, h = Math.min(1.1, p * 0.9);
  Lc.box(M, u0, v - 1.35, 0, u1, v - 1.2, 0.2);
  for (let i = 0; i < n; i++) {
    const uc = u0 + (i + 0.5) * p, w = p * 0.78, ys = v - 1.2 + 0.1;
    Lc.add(G, ext(archOutline(uc, ys, w, ys + h - w * 0.866 + 0.0001, 'pointed', 3).concat([]), [], 0, 0.06, 1));
    Lc.add(M, ext(archOutline(uc, ys, w * 0.74, ys + h - w * 0.866 + 0.0001, 'pointed', 3), [], 0.06, 0.09, 1));
    if (i < n - 1) Lc.box(M, u0 + (i + 1) * p - 0.08, ys, 0, u0 + (i + 1) * p + 0.08, v - 0.2, 0.14);
  }
}

/** A statue (a draped standing figure) at (u, y, d), h tall, facing outward. */
function statue(Lc, u, y, d, h, v) {
  const lean = ((v % 3) - 1) * 0.04 * h;
  Lc.add(M, limb([u, y, d], [u + lean, y + h * 0.8, d], h * 0.15, h * 0.09, 6));
  Lc.add(M, T(ball(h * 0.075, h * 0.09, h * 0.075, 6, 4), u + lean, y + h * 0.9, d));
  Lc.add(M, limb([u + lean + h * 0.09, y + h * 0.72, d], [u + lean + h * (0.13 + 0.04 * (v % 2)), y + h * (0.5 + 0.2 * (v % 2)), d + h * 0.07], h * 0.035, h * 0.025, 4));
  Lc.box(M, u - h * 0.2, y - 0.02, d - h * 0.2, u + h * 0.2, y + h * 0.04, d + h * 0.2);
}

/** A niche for a statue: a pointed recess in a white frame under a small gable, the statue in it. */
function niche(Lc, uc, y0, w, h, v) {
  const ys = y0 + h - w * 0.866, out = archOutline(uc, y0, w, ys, 'pointed', 4), outer = archOutline(uc, y0 - 0.1, w + 0.6, ys, 'pointed', 4);
  Lc.add(PS, ext(out, [], 0, 0.05, 2)); Lc.add(M, ext(outer, [out], 0, 0.3, 2));
  Lc.add(G, ext(archOutline(uc, y0 - 0.25, w + 0.9, ys, 'pointed', 4), [outer], 0, 0.14, 2));
  Lc.box(M, uc - w / 2 - 0.45, y0 - 0.35, 0, uc + w / 2 + 0.45, y0 - 0.2, 0.5);
  Lc.box(M, uc - w * 0.4, y0, 0.05, uc + w * 0.4, y0 + 0.28, 0.5);                  // the corbel the statue stands on
  statue(Lc, uc, y0 + 0.28, 0.3, h * 0.72, v);
  Lc.add(M, ext([[uc - w / 2 - 0.55, y0 + h + 0.35], [uc + w / 2 + 0.55, y0 + h + 0.35], [uc, y0 + h + 1.45]], [], 0, 0.26, 1));
  Lc.add(G, ext([[uc - 0.3, y0 + h + 0.7], [uc + 0.3, y0 + h + 0.7], [uc, y0 + h + 1.15]], [], 0.26, 0.3, 1));
}

/** A pinnacle (crocket-leaved finial) at (u, y, d), h tall. */
function pinnacle(Lc, u, y, d, h, r = 0.22) {
  Lc.add(M, lathe([[r * 1.3, 0], [r * 1.3, h * 0.1], [r, h * 0.14], [r, h * 0.62], [r * 1.5, h * 0.66], [r * 0.9, h * 0.74], [0.001, h]], 6, null, u, y, d));
}

/**
 * A Gothic portal at uc from y0: stepped jambs with colonnettes, three archivolts (white, green, white), a lintel and
 * a tympanum with its mandorla over the doors, the whole under a steep gable edged with crockets between pinnacles.
 * { w: the doorway, ys: its springing above y0, depth: how far the porch stands out, gh: the gable's height, gw: its half-width }
 */
export function portal(Lc, uc, y0, { w = 3, ys = 4.6, depth = 1.2, gh = 6.2, gw = 3.5, back = 0, v = 0 } = {}) {
  const orders = [0.42, 0.42, 0.42], mats = [M, G, M];
  // the plinth steps
  Lc.box(M, uc - w / 2 - 1.9, y0, back, uc + w / 2 + 1.9, y0 + 0.2, depth + 0.55);
  let o = 0;
  for (let j = 0; j < 3; j++) {
    const d = depth - 0.22 * (2 - j), wi = w / 2 + o, wo = wi + orders[j];
    for (const sg of [-1, 1]) Lc.box(mats[j], uc + (sg < 0 ? -wo : wi), y0 + 0.2, back, uc + (sg < 0 ? -wi : wo), y0 + ys, d);
    const ringPts = headPts(uc, y0 + ys, 2 * wo, 'pointed', 6).concat(headPts(uc, y0 + ys, 2 * wi, 'pointed', 6).reverse());
    Lc.add(mats[j], ext(ringPts, [], back, d, 2));
    // capitals between the jamb and the archivolt
    for (const sg of [-1, 1]) Lc.box(mats[j], uc + (sg < 0 ? -wo - 0.05 : wi - 0.05), y0 + ys - 0.18, back, uc + (sg < 0 ? -wi + 0.05 : wo + 0.05), y0 + ys + 0.08, d + 0.08);
    o += orders[j];
  }
  // the colonnettes in the corners of the jambs
  for (const sg of [-1, 1]) for (const q of [0, 1]) Lc.add(q ? G : M, rod([uc + sg * (w / 2 + 0.42 * (q + 1)), y0 + 0.2, depth - 0.22 * (1 - q) + 0.05], [uc + sg * (w / 2 + 0.42 * (q + 1)), y0 + ys - 0.18, depth - 0.22 * (1 - q) + 0.05], 0.085, 6));
  // the doors, the lintel, the tympanum under the arch
  const yl = y0 + ys * 0.74;
  Lc.box('wood_dark', uc - w / 2, y0 + 0.2, back, uc + w / 2, yl, back + 0.4);
  Lc.box(O, uc - 0.03, y0 + 0.2, back + 0.4, uc + 0.03, yl, back + 0.43);
  for (let i = 1; i < 4; i++) for (const sg of [-1, 1]) Lc.box(G, uc + sg * (i * w / 8) - 0.04, y0 + 0.2, back + 0.4, uc + sg * (i * w / 8) + 0.04, yl, back + 0.44);
  Lc.box(M, uc - w / 2 - 0.1, yl, back, uc + w / 2 + 0.1, yl + 0.35, back + 0.6);
  Lc.add(PINK, ext(archOutline(uc, yl + 0.35, w, y0 + ys, 'pointed', 6), [], back, back + 0.42, 2));
  const ty = (yl + 0.35 + y0 + ys + w * 0.5) / 2 + 0.05;
  Lc.add(M, ext(Array.from({ length: 14 }, (_, i) => [uc + Math.cos(i / 14 * Math.PI * 2) * w * 0.2, ty + Math.sin(i / 14 * Math.PI * 2) * w * 0.3]), [], back + 0.42, back + 0.5, 1));
  Lc.add(G, ext(Array.from({ length: 14 }, (_, i) => [uc + Math.cos(i / 14 * Math.PI * 2) * w * 0.12, ty + Math.sin(i / 14 * Math.PI * 2) * w * 0.2]), [], back + 0.5, back + 0.54, 1));
  // the gable: a white wall edged with a raking cornice, a pink field and a green rim; crockets on its slopes, a finial, flanking pinnacles
  const yb = y0 + ys + 0.7, ya = yb + gh;
  Lc.add(M, ext([[uc - gw, yb], [uc + gw, yb], [uc, ya]], [[[uc - gw + 0.55, yb + 0.3], [uc, ya - 1.25], [uc + gw - 0.55, yb + 0.3]]], back, 0.5, 1));
  Lc.add(PINK, ext([[uc - gw + 0.55, yb + 0.3], [uc + gw - 0.55, yb + 0.3], [uc, ya - 1.25]], [], back, 0.3, 1));
  const m = 0.8, hi = gw - m;
  Lc.add(G, ext([[uc - hi, yb + 0.9], [uc + hi, yb + 0.9], [uc, yb + 0.9 + gh * hi / gw * 0.92]], [[[uc - hi + 0.14, yb + 1.0], [uc, yb + 0.9 + gh * hi / gw * 0.92 - 0.28], [uc + hi - 0.14, yb + 1.0]].reverse()], 0.3, 0.36, 1));
  for (const sg of [-1, 1]) for (let i = 1; i <= 5; i++) {
    const t = i / 6, cu = uc + sg * gw * (1 - t), cv = yb + gh * t;
    Lc.add(M, T(ball(0.16, 0.22, 0.12, 5, 3), cu + sg * 0.05, cv + 0.28, 0.52));
  }
  pinnacle(Lc, uc, ya, 0.25, 1.9, 0.26);
  for (const sg of [-1, 1]) {
    Lc.box(M, uc + sg * (gw + 0.25) - 0.3, yb - 0.4, back, uc + sg * (gw + 0.25) + 0.3, yb + 1.5, 0.7);
    pinnacle(Lc, uc + sg * (gw + 0.25), yb + 1.5, 0.4, 2.2, 0.26);
  }
  return { half: gw + 0.6, depth: depth + 0.55 };
}

/**
 * The marble skin of a wall from a to b (outward normal to the right of a→b), y0..y1, in relief: pilaster strips with
 * capitals, string courses, framed panels in white, green and pink with lozenges, two-light pointed windows in some bays,
 * portals under gables (portals: [{ u (from a), ...portal options }]), the arcaded frieze under the top cornice.
 */
export function skin(bag, a, b, y0, y1, { pitch = 4.2, bands = 3, windows = 0, pink = true, plinth = false, frieze: fr = 0, portals = [], drum = false } = {}, col = null) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  const FM = new Matrix4().set(-ux, 0, uz, b[0], 0, 1, 0, 0, -uz, 0, -ux, b[1], 0, 0, 0, 1);
  const Lc = new Local(); Lc.noBack = true; Lc.L = L;
  const Ul = (ua) => L - ua;                                    // a→b distance to the frame's u
  const skips = portals.map((p) => [Ul(p.u) - (p.gw ?? 3.5) - 1.1, Ul(p.u) + (p.gw ?? 3.5) + 1.1]);
  const lim = y0 + 15, inSkip = (u0, u1, v = y0) => v < lim && skips.some(([s0, s1]) => u1 > s0 && u0 < s1);
  const n = Math.max(1, Math.round(L / pitch)), p = L / n, h = (y1 - y0) / bands;
  let yb = y0;
  if (plinth) { Lc.box(M, 0, y0, 0, L, y0 + 0.55, 0.3); Lc.box(G, 0, y0 + 0.55, 0, L, y0 + 0.7, 0.3); yb = y0 + 0.7; }
  // the pilasters (green, with a white base and capital at each storey)
  const lines = []; for (let k = 1; k < bands; k++) lines.push(y0 + k * h);
  for (let i = 0; i <= n; i++) {
    const u = i * p, u0 = Math.max(0, u - 0.32), u1 = Math.min(L, u + 0.32);
    const sk = inSkip(u0, u1);
    Lc.box(G, u0, sk ? lim : yb, 0, u1, y1, 0.13);
    for (let k = 0; k <= bands; k++) {
      const v = y0 + k * h;
      if (sk && v < lim + 0.7) continue;
      if (k > 0) Lc.box(M, Math.max(0, u - 0.46), v - 0.62, 0, Math.min(L, u + 0.46), v - 0.3, 0.2);
      if (k < bands) Lc.box(M, Math.max(0, u - 0.46), v + (k === 0 && plinth ? 0.7 : 0.43), 0, Math.min(L, u + 0.46), v + (k === 0 && plinth ? 0.95 : 0.7), 0.2);
    }
  }
  // the string courses between the storeys and the cornice at the top
  for (const v of lines) for (let i = 0; i < n; i++) { const u0 = i * p, u1 = (i + 1) * p; if (!inSkip(u0, u1, v)) string(Lc, u0, u1, v); }
  Lc.box(M, 0, y1 - 0.34, 0, L, y1 - 0.2, 0.34); Lc.box(M, 0, y1 - 0.2, 0, L, y1, 0.22);
  for (let u = 0.6; u < L; u += 1.1) if (!inSkip(u - 0.1, u + 0.1, y1)) Lc.box(M, u - 0.12, y1 - 0.62, 0, u + 0.12, y1 - 0.34, 0.24);
  if (fr) for (let i = 0; i < n; i++) { const u0 = i * p + 0.4, u1 = (i + 1) * p - 0.4; if (!inSkip(u0, u1, y1)) frieze(Lc, u0, u1, y1 - 0.62, fr); }
  // the bays
  for (let i = 0; i < n; i++) for (let k = 0; k < bands; k++) {
    let v0 = y0 + k * h + (k === 0 && plinth ? 1.05 : 0.55); const u0 = i * p + 0.4, u1 = (i + 1) * p - 0.4, v1 = y0 + (k + 1) * h - (k === bands - 1 ? 0.8 + (fr ? 1.55 : 0) : 0.7);
    const sk = inSkip(u0, u1, v0);
    if (sk) v0 = Math.max(v0, y0 + 15.4);
    if (v1 - v0 < 1.2) continue;
    const win = !sk && windows && k === bands - 2 + (bands > 2 ? 0 : 1) && i % windows === 1 % windows;
    if (win) { window2(Lc, (u0 + u1) / 2, v0 + 0.5, v1 - v0 - 0.7, Math.min(1.7, (u1 - u0) * 0.42)); continue; }
    if (drum) continue;
    const fw = u1 - u0, fh = v1 - v0, np = Math.max(1, Math.round(fh / (fw * 1.3))), ph = (fh - (np - 1) * 0.28) / np;
    for (let j = 0; j < np; j++) panel(Lc, u0, u1, v0 + j * (ph + 0.28), v0 + j * (ph + 0.28) + ph, pink ? i + k + j : 1);
  }
  for (const pt of portals) {
    const r = portal(Lc, Ul(pt.u), y0, pt);
    if (col) col.rect(wrect(FM, Ul(pt.u) - r.half, 0, Ul(pt.u) + r.half, r.depth), y0, y0 + 6);
  }
  Lc.emit(bag, FM);
  return { FM, L, Lc: null };
}

/** The drum's faces in relief: banded corner pilasters, a frame round the oculus, pink and green panels, a course of rough brick under the cornice where the gallery was to run. */
export function drumSkin(TB, cx, cz, R0, y0, h) {
  const ap = (R0 + 1.5) * Math.cos(Math.PI / 8) + 0.02, L = 2 * ap * Math.tan(Math.PI / 8);
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) / 8 * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a);
    const FM = new Matrix4().set(nz, 0, nx, cx + nx * ap, 0, 1, 0, y0, -nx, 0, nz, cz + nz * ap, 0, 0, 0, 1);
    const Lc = new Local(); Lc.noBack = true; Lc.L = undefined;
    const hl = L / 2, top = h - 1.6;
    // the corner pilasters in bands of white and green
    for (const s of [-1, 1]) for (let j = 0; j < 8; j++) Lc.box(j % 2 ? G : M, s * (hl - 0.8) - 0.4 + (s > 0 ? 0 : 0), j * top / 8, 0, s * (hl - 0.8) + 0.4, (j + 1) * top / 8, 0.22);
    Lc.box(M, -hl, 0, 0, hl, 0.45, 0.3); Lc.box(G, -hl, 0.45, 0, hl, 0.6, 0.3);
    string(Lc, -hl, hl, 3.2, 0.34);
    // the oculus's square frame (the oculus itself is drawn with the drum's detail), pink spandrels in its corners
    const yc = 8.5, sq = 2.9;
    Lc.box(M, -sq, yc - sq, 0, sq, yc - sq + 0.3, 0.3); Lc.box(M, -sq, yc + sq - 0.3, 0, sq, yc + sq, 0.3);
    Lc.box(M, -sq, yc - sq + 0.3, 0, -sq + 0.3, yc + sq - 0.3, 0.3); Lc.box(M, sq - 0.3, yc - sq + 0.3, 0, sq, yc + sq - 0.3, 0.3);
    Lc.box(G, -sq + 0.3, yc - sq + 0.3, 0, sq - 0.3, yc + sq - 0.3, 0.06);
    // the panels to its sides, the rough brick course under the cornice with the holes of the gallery's corbels that was not begun
    const wP = hl - 0.9 - sq - 0.55;
    panel(Lc, -(sq + 0.55) - wP, -(sq + 0.55), 3.9, top - 0.4, 0); panel(Lc, sq + 0.55, sq + 0.55 + wP, 3.9, top - 0.4, 0);
    panel(Lc, -sq, sq, 3.9, yc - sq - 0.3, 1); panel(Lc, -sq, sq, yc + sq + 0.3, top - 0.4, 1);
    Lc.box('brick', -hl + 0.9, top, 0, hl - 0.9, h, 0.1);
    for (let u = -hl + 1.6; u < hl - 1.2; u += 1.5) Lc.box(O, u, top + 0.55, 0.1, u + 0.28, top + 0.85, 0.14);
    Lc.emit(TB, FM);
  }
}

// ── the west front of about 1480 ────────────────────────────────────────────────────────────────────────────────────
/**
 * Arnolfo's lower order as it stood in 1480, drawn on the thin marble shell at x = nave[0] − 1.9: five divisions by
 * three portals (the middle one the passage, its lunette under rings of white and green), two columns of statues in
 * pointed niches between the portals and at the ends, corner piers banded white and green, a string course, the
 * cornice. The shell's top is at H·0.38.
 */
export function westFront(bag, col, nave, cz, y, H, W, IN) {
  const xw = nave[0] - 1.9, z0 = nave[1] - 0.4, z1 = nave[3] + 0.4, L = z1 - z0, uC = L / 2, yT = H * 0.38, pw = 4.6, ph = pw * 2.1;
  const { M: FM } = faceFrame([xw, z0, xw, z1], 'w', y), Lc = new Local();
  Lc.noBack = true; Lc.L = L;
  const side = 12, gaps = [[0, uC - side - 3.6], [uC - side + 3.6, uC - 3.5], [uC + 3.5, uC + side - 3.6], [uC + side + 3.6, L]];
  // plinth, cornice, corner piers
  for (const [u0, u1] of [[0, uC - 3.5], [uC + 3.5, L]]) { Lc.box(M, u0, 0, 0, u1, 0.8, 0.5); Lc.box(G, u0, 0.8, 0, u1, 0.95, 0.5); }
  for (const [u0, u1] of [[0, uC - 3.5], [uC + 3.5, L]]) { Lc.box(M, u0, yT - 0.5, 0, u1, yT, 0.55); Lc.box(M, u0, yT - 0.8, 0, u1, yT - 0.5, 0.3); for (let u = u0 + 0.5; u < u1 - 0.2; u += 1.1) Lc.box(M, u - 0.12, yT - 1.2, 0, u + 0.12, yT - 0.8, 0.32); }
  for (const u of [0.65, L - 0.65]) {
    for (let j = 0; j < 8; j++) Lc.box(j % 2 ? G : M, u - 0.65, 0.95 + j * (yT - 2.2) / 8, 0, u + 0.65, 0.95 + (j + 1) * (yT - 2.2) / 8, 0.42);
    pinnacle(Lc, u, yT - 1.25, 0.2, 3.2, 0.42);
  }
  // the side portals, with the gables that frame them
  for (const sg of [-1, 1]) portal(Lc, uC + sg * side, 0, { w: 3.2, ys: 5.0, depth: 1.0, gh: 4.6, gw: 3.6 });
  // the niches with their statues, and the field under them, between the portals and at the ends
  gaps.forEach(([u0, u1], gi) => {
    const uc = (u0 + u1) / 2;
    niche(Lc, uc, 2.7, 2.0, 4.0, gi * 2); niche(Lc, uc, 9.1, 2.0, 4.0, gi * 2 + 1);
    string(Lc, u0 + 0.3, u1 - 0.3, 8.6, 0.3);
    if (u1 - u0 > 3) panel(Lc, u0 + 0.5, u1 - 0.5, 1.15, 1.95, gi);
  });
  // the middle portal: piers, lintel, the lunette and its rings
  const dep = 1.0;
  for (const sg of [-1, 1]) {
    const a0 = sg < 0 ? uC - pw / 2 - 1.05 : uC + pw / 2, a1 = a0 + 1.05;
    Lc.box(M, a0, 0, 0, a1, ph, dep);
    Lc.box(PINK, a0 + 0.2, 1.2, dep, a1 - 0.2, ph - 1.2, dep + 0.04);
    Lc.add(G, ext(lozenge((a0 + a1) / 2, ph * 0.5, 0.3, 2.3), [lozenge((a0 + a1) / 2, ph * 0.5, 0.2, 2.1).reverse()], dep + 0.04, dep + 0.08, 1));
    Lc.box(M, a0 - 0.1, 0, 0, a1 + 0.1, 0.45, dep + 0.12);
    for (const [q, mat] of [[0, G], [1, M]]) Lc.add(mat, rod([sg * (pw / 2 + 0.2 + 0.0) + uC, 0.45, dep + 0.08 + q * 0.0], [sg * (pw / 2 + 0.2) + uC, ph - 0.2, dep + 0.08], 0.11, 6));
    Lc.box(M, a0 - 0.1, ph - 0.2, 0, a1 + 0.1, ph, dep + 0.12);
  }
  Lc.box(M, uC - pw / 2 - 1.15, ph, 0, uC + pw / 2 + 1.15, ph + 0.8, dep + 0.1);
  Lc.box(G, uC - pw / 2 - 1.15, ph + 0.8, 0, uC + pw / 2 + 1.15, ph + 1.05, dep + 0.14);
  const lw = pw + 2.1, ys = ph + 1.25, bk = -0.3, lc = uC;
  Lc.add(PINK, ext(archOutline(lc, ph + 1.05, lw, ys, 'pointed', 6), [], bk, 0.45, 2));
  let o = 0;
  for (const [j, mat] of [[0, M], [1, G], [2, M]]) { const wi = lw / 2 + o, wo = wi + 0.42; Lc.add(mat, ext(headPts(lc, ys, 2 * wo, 'pointed', 6).concat(headPts(lc, ys, 2 * wi, 'pointed', 6).reverse()), [], bk, dep - 0.2 + j * 0.1, 2)); o += 0.42; }
  for (const sg of [-1, 1]) for (const [j, mat] of [[0, M], [1, G], [2, M]]) { const wi = lw / 2 + 0.42 * j; Lc.box(mat, lc + (sg < 0 ? -(wi + 0.42) : wi), ph + 1.05, 0, lc + (sg < 0 ? -wi : wi + 0.42), ys, dep - 0.2 + j * 0.1); }
  // the lunette: the Virgin in a mandorla, the apostles about her bier below
  const ty = ph + 1.05 + 2.6;
  Lc.add(M, ext(Array.from({ length: 16 }, (_, i) => [lc + Math.cos(i / 16 * Math.PI * 2) * 1.0, ty + 0.5 + Math.sin(i / 16 * Math.PI * 2) * 1.7]), [], 0.45, 0.55, 1));
  Lc.add('gilt_bronze', ext(Array.from({ length: 16 }, (_, i) => [lc + Math.cos(i / 16 * Math.PI * 2) * 0.78, ty + 0.5 + Math.sin(i / 16 * Math.PI * 2) * 1.45]), [], 0.55, 0.6, 1));
  statue(Lc, lc, ty - 0.6, 0.62, 2.4, 1);
  Lc.add(M, limb([lc - 1.9, ph + 1.75, 0.6], [lc + 1.9, ph + 1.75, 0.6], 0.24, 0.24, 6));
  for (let i = 0; i < 6; i++) Lc.add(M, T(ball(0.16, 0.2, 0.14, 5, 3), lc - 2.2 + i * 0.88 + (i > 2 ? 0.3 : 0), ph + 2.3, 0.55));
  Lc.emit(bag, FM);
  // the colliders: the front stands out by its portals and niches, one slab of 1.2 m either side of the passage
  const zc = cz;
  if (col) {
    col.rect([xw - 1.2, z0, xw + 0.1, zc - pw / 2], y, y + yT);
    col.rect([xw - 1.2, zc + pw / 2, xw + 0.1, z1], y, y + yT);
  }
}

// ── the dome ───────────────────────────────────────────────────────────────────────────────────────────────────────
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const tri = (t, A, B, C, ref) => { const n = crs(sub(B, A), sub(C, A)); if (dot(n, ref) < 0) [B, C] = [C, B]; t.push(...A, ...B, ...C); };
const lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];

/**
 * A pointed dome of eight sails in the turned bag TB (corners of the octagon at angle k·45° before the turn): a lathe of
 * vertex radii rs at heights hs above y0 in `mat`, eight ribs of white marble over the corners (broad at the foot,
 * narrower and lower toward the crown), and — when herring is set — the herringbone of the brick laid in each sail,
 * as rows of shallow chevron ridges (nc columns, rows of s-step ds, from s = s0 to s1 of the profile's index).
 */
export function ribbedDome(TB, mat, cx, y0, cz, rs, hs, { ribW = 1.0, ribH = 0.45, herring = null } = {}) {
  const N = rs.length, pr = (k, i) => { const a = k / 8 * Math.PI * 2; return [cx + rs[i] * Math.cos(a), y0 + hs[i], cz + rs[i] * Math.sin(a)]; };
  TB.add(mat, lathe(rs.map((r, i) => [r, hs[i]]), 8, null, cx, y0, cz));
  // the ribs
  const t = [];
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, tx = -Math.sin(a), tz = Math.cos(a), secs = [];
    for (let i = 0; i < N; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(N - 1, i + 1), dr = rs[i1] - rs[i0], dh = hs[i1] - hs[i0], l = Math.hypot(dr, dh);
      const nr = dh / l, nh = -dr / l, f = i / (N - 1), hw = ribW * (1 - 0.5 * f), ht = ribH * (1 - 0.3 * f), P = pr(k, i);
      const n = [nr * Math.cos(a), nh, nr * Math.sin(a)];
      secs.push({ n, s: [[P[0] - tx * hw, P[1] - 0.02, P[2] - tz * hw], [P[0] - tx * hw * 0.6 + n[0] * ht, P[1] + n[1] * ht, P[2] - tz * hw * 0.6 + n[2] * ht], [P[0] + tx * hw * 0.6 + n[0] * ht, P[1] + n[1] * ht, P[2] + tz * hw * 0.6 + n[2] * ht], [P[0] + tx * hw, P[1] - 0.02, P[2] + tz * hw]] });
    }
    for (let i = 0; i + 1 < N; i++) {
      const A = secs[i], B = secs[i + 1], ref = A.n;
      for (let q = 0; q < 3; q++) { tri(t, A.s[q], A.s[q + 1], B.s[q + 1], ref); tri(t, A.s[q], B.s[q + 1], B.s[q], ref); }
    }
  }
  TB.add('marble', fromTriangles(t));
  if (!herring) return;
  // the herringbone: V-shaped ridges of brick on each sail
  const { nc, ds, s0, s1, w = 0.05, ht = 0.07, mat: bm = 'brick' } = herring, r = [];
  for (let k = 0; k < 8; k++) {
    const A = (i) => pr(k, i), B = (i) => pr(k + 1, i);
    const at = (s, tt) => { const i = Math.min(N - 2, Math.floor(s)), f = s - i; return lerp3(lerp3(A(i), A(i + 1), f), lerp3(B(i), B(i + 1), f), tt); };
    const sn = (s) => { const i = Math.min(N - 2, Math.floor(s)); return nrm(crs(sub(B(i), A(i)), sub(A(i + 1), A(i)))); };
    const am = (k + 0.5) / 8 * Math.PI * 2, out = [Math.cos(am), 0.2, Math.sin(am)];
    const ridge = (p, q, n0) => {
      if (dot(n0, out) < 0) n0 = [-n0[0], -n0[1], -n0[2]];
      const wv = nrm(crs(sub(q, p), n0)), P = [p[0] + n0[0] * 0.02, p[1] + n0[1] * 0.02, p[2] + n0[2] * 0.02], Q = [q[0] + n0[0] * 0.02, q[1] + n0[1] * 0.02, q[2] + n0[2] * 0.02];
      const pl = [P[0] - wv[0] * w, P[1] - wv[1] * w, P[2] - wv[2] * w], pr2 = [P[0] + wv[0] * w, P[1] + wv[1] * w, P[2] + wv[2] * w], ql = [Q[0] - wv[0] * w, Q[1] - wv[1] * w, Q[2] - wv[2] * w], qr = [Q[0] + wv[0] * w, Q[1] + wv[1] * w, Q[2] + wv[2] * w];
      const pa = [P[0] + n0[0] * ht, P[1] + n0[1] * ht, P[2] + n0[2] * ht], qa = [Q[0] + n0[0] * ht, Q[1] + n0[1] * ht, Q[2] + n0[2] * ht];
      tri(r, pl, ql, qa, n0); tri(r, pl, qa, pa, n0); tri(r, pr2, qa, qr, n0); tri(r, pr2, pa, qa, n0);
    };
    const tm = 0.07, span = (1 - 2 * tm) / nc;
    for (let j = 0; j < nc; j++) for (let s = s0 + (j % 2) * ds * 0.5; s + ds < s1; s += ds) {
      const tl = tm + j * span, tr = tl + span * 0.92, tc = (tl + tr) / 2, pa = at(s, tl), pb = at(s + ds * 0.72, tc), pc = at(s, tr), n0 = sn(s + ds * 0.3);
      ridge(pa, pb, n0); ridge(pb, pc, n0);
    }
  }
  TB.add(bm, fromTriangles(r));
}
