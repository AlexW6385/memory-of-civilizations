// Mamluk architecture (14th c.; docs/settlements/mamluk-cairo.md §4): the great madrasa-mosque as a
// cliff of cut stone — tall recessed window bays, a crown of crenellations over a muqarnas cornice,
// the deep portal; the dome of the founder's tomb on a drum of stepped corners; minarets in tiers
// (square, octagonal, round) with balconies and a bulbous top; the Citadel's walls and towers on its
// spur; the city's houses (src/styles/vernacular's mud-brick house).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod, disc, fromTriangles, orientOutward, place } from '../../core/geom.js';
import '../qing/index.js';
import { cairoQaa } from './qaa.js';
import { baynFront, baynBed } from './bayn.js';
import { cairoWikala, cairoHammam } from './khan.js';
import { cairoShop, sharbatStall } from './shops.js';
import * as FN from '../mughal/furnish.js';

const S = 'limestone_yellow';
function crest(bag, r, y, mat = S) {
  const [x0, z0, x1, z1] = r;
  bag.add(mat, box(x0 - 0.9, y - 1.6, z0 - 0.9, x1 + 0.9, y, z1 + 0.9));            // the muqarnas cornice (a projecting band)
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 2.2);
    for (let i = 0; i < n; i += 2) {
      const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n;
      for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 : z0 - 0.4, u1, s ? z1 + 0.4 : z0] : [s ? x1 : x0 - 0.4, u0, s ? x1 + 0.4 : x0, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); bag.add(mat, lathe([[0.5, 0], [0.001, 0.8]], 6, null, (q[0] + q[2]) / 2, y + 1.3, (q[1] + q[3]) / 2)); }
    }
  }
}
/** A balcony on muqarnas round a shaft of radius ri (n sides): tiers of cells stepping out, the floor, a parapet of carved panels between posts, the rail. Returns the floor's top. */
function mBalcony(bag, x, z, yb, ri, n, rot = 0) {
  const out = 1.1, tiers = 4, step = out / tiers;
  for (let k = 0; k < tiers; k++) {
    const ra = ri + k * step, yy = yb - (tiers - k) * 0.45, cells = n * (k + 2);
    bag.add(S, lathe([[k ? ra - step : ra * 0.97, 0], [ra, 0], [ra, 0.45]], n * 2, null, x, yy, z));
    for (let i = 0; i < cells; i++) { const a = rot + (i + (k % 2) * 0.5) / cells * Math.PI * 2, w = ra * Math.PI / cells * 0.78; bag.add(S, place(box(-0.02, 0.06, -w, step, 0.45, w), x + Math.cos(a) * ra, yy, z + Math.sin(a) * ra, -a)); }
  }
  const rf = ri + out + 0.1;
  bag.add(S, lathe([[ri + out - 0.02, 0], [rf, 0.06], [rf, 0.28], [0.001, 0.28]], n * 2, null, x, yb, z));
  const np = n * 2;
  for (let i = 0; i < np; i++) {
    const a = rot + (i + 0.5) / np * Math.PI * 2, pr = rf * Math.cos(Math.PI / np) - 0.07, w = rf * Math.sin(Math.PI / np) - 0.08;
    bag.add(S, place(box(-0.05, 0, -w, 0.05, 0.95, w), x + Math.cos(a) * pr, yb + 0.28, z + Math.sin(a) * pr, -a));
    for (const [y0, y1] of [[0.15, 0.4], [0.55, 0.8]]) bag.add(S, place(box(0.05, y0, -w + 0.08, 0.075, y1, w - 0.08), x + Math.cos(a) * pr, yb + 0.28, z + Math.sin(a) * pr, -a));
    const b = rot + i / np * Math.PI * 2; bag.add(S, box(x + Math.cos(b) * (rf - 0.1) - 0.08, yb + 0.28, z + Math.sin(b) * (rf - 0.1) - 0.08, x + Math.cos(b) * (rf - 0.1) + 0.08, yb + 1.23, z + Math.sin(b) * (rf - 0.1) + 0.08));
  }
  bag.add(S, lathe([[rf + 0.03, 0], [rf + 0.03, 0.12], [rf - 0.2, 0.12], [rf - 0.2, 0]], np, null, x, yb + 1.23, z));
  return yb + 0.28;
}
/** A keel-arched niche framed in moulding on a face (frame R from the caller), its slit window: u across the face, y up. */
function mNiche(bag, R, u, y0, w, hgt) {
  for (const s of [-1, 1]) bag.add(S, R(u + s * w - 0.12, u + s * w + 0.12, y0, y0 + hgt, 0, 0.14));
  bag.add(S, R(u - w - 0.12, u + w + 0.12, y0 - 0.2, y0, 0, 0.16));
  for (let k = 0; k < 4; k++) { const ww = w * (1 - k * 0.24) + 0.12; bag.add(S, R(u - ww, u + ww, y0 + hgt + k * 0.32, y0 + hgt + (k + 1) * 0.32, 0, 0.14)); }
  bag.add('opening', R(u - 0.22, u + 0.22, y0 + hgt * 0.25, y0 + hgt * 0.85, -0.02, 0.03));
  for (let k = 0; k < 2; k++) bag.add('opening', R(u - 0.22 + (k + 1) * 0.07, u + 0.22 - (k + 1) * 0.07, y0 + hgt * 0.85 + k * 0.15, y0 + hgt * 0.85 + (k + 1) * 0.15, -0.02, 0.03));
}
/**
 * mamluk_minaret: { c, h, y, r } (docs/settlements/mamluk-cairo.md §4.1) — the Mamluk type: a square
 * stage, an octagonal stage and a round one, each closed by a balcony on muqarnas with a carved parapet;
 * keel-arched niches with slit windows on the faces; on top a pavilion of eight slender columns
 * carrying the bulb and its finial.
 */
function minaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 70, r = el.r ?? 3;
  const y1 = y + h * 0.4, y2 = y + h * 0.66, y3 = y + h * 0.81;
  bag.add(S, box(x - r, y - 0.5, z - r, x + r, y1, z + r)); col.rect([x - r, z - r, x + r, z + r], y, y1);
  for (const f of 'nsew') {
    const R = (u0, u1, ya, yb, d0, d1) => f === 'n' ? box(x + u0, ya, z - r - d1, x + u1, yb, z - r - d0) : f === 's' ? box(x - u1, ya, z + r + d0, x - u0, yb, z + r + d1) : f === 'w' ? box(x - r - d1, ya, z - u1, x - r - d0, yb, z - u0) : box(x + r + d0, ya, z + u0, x + r + d1, yb, z + u1);
    for (const yy of [y + h * 0.1, y + h * 0.24]) mNiche(bag, R, 0, yy, r * 0.42, h * 0.08);
    bag.add(S, R(-r, r, y1 - 2.2, y1 - 1.9, 0, 0.12));
  }
  let yb = mBalcony(bag, x, z, y1 + 1.0, r * 1.0, 4, Math.PI / 4);
  // the octagonal stage, its faces with niches
  const a8 = r * 0.78, c8 = a8 / Math.cos(Math.PI / 8);
  bag.add(S, place(lathe([[c8, 0], [c8, y2 - yb]], 8), x, yb, z, Math.PI / 8));
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4, R = (u0, u1, ya, yb2, d0, d1) => place(box(a8 + d0, ya, u0, a8 + d1, yb2, u1), x, 0, z, -a);
    mNiche(bag, R, 0, yb + (y2 - yb) * 0.2, a8 * 0.3, (y2 - yb) * 0.5);
  }
  yb = mBalcony(bag, x, z, y2 + 1.0, c8 * 0.98, 8, Math.PI / 8);
  // the round stage
  const r3 = r * 0.6;
  bag.add(S, lathe([[r3, 0], [r3 * 0.96, y3 - yb]], 16, (t) => 1 + 0.025 * Math.cos(t * 12), x, yb, z));
  yb = mBalcony(bag, x, z, y3 + 1.0, r3, 8, 0);
  // the pavilion: eight columns under a ring, the bulb on its neck, the finial
  const rp = r3 * 0.82, hp = h * 0.06;
  bag.add(S, lathe([[rp + 0.25, 0], [rp + 0.25, 0.25], [0.001, 0.25]], 16, null, x, yb, z));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add('marble_column', lathe([[0.16, 0], [0.12, 0.2], [0.11, hp - 0.4], [0.17, hp - 0.25], [0.17, hp]], 8, null, x + Math.cos(a) * rp, yb + 0.25, z + Math.sin(a) * rp)); }
  bag.add(S, lathe([[r3 * 0.35, 0], [r3 * 0.35, hp + 0.02]], 12, null, x, yb + 0.25, z));
  const yr = yb + 0.25 + hp;
  bag.add(S, lathe([[rp + 0.3, 0], [rp + 0.45, 0.35], [rp + 0.45, 0.6], [0.001, 0.6]], 16, null, x, yr, z));
  const rb = rp * 0.9;
  bag.add(S, lathe([[rb * 0.55, 0], [rb * 0.6, 0.5], [rb, rb * 0.75 + 0.5], [rb * 0.95, rb * 1.2 + 0.5], [rb * 0.55, rb * 1.75 + 0.5], [rb * 0.18, rb * 2.15 + 0.5], [0.001, rb * 2.4 + 0.5]], 16, null, x, yr + 0.6, z));
  const yt = yr + 0.6 + rb * 2.4 + 0.5;
  bag.add('bronze', rod([x, yt - 0.3, z], [x, yt + 2.2, z], 0.05, 6));
  for (const [rr, yy] of [[0.22, 0.3], [0.3, 0.9]]) bag.add('bronze', lathe([[0.05, 0], [rr, 0.15], [0.05, 0.3]], 8, null, x, yt + yy, z));
  const cr = []; for (let k = 0; k <= 10; k++) { const t = -0.3 + (Math.PI * 2 - 2.2) * k / 10 + 1.4; cr.push([x + Math.cos(t) * 0.3, yt + 1.95 + Math.sin(t) * 0.3, z]); }
  for (let k = 0; k + 1 < cr.length; k++) bag.add('bronze', rod(cr[k], cr[k + 1], 0.04, 5));
}
/** mamluk_dome: { c, r, y, drum } — a stone dome on a drum, its zone of transition as stepped corners. */
function dome(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, y = el.y ?? 0, dr = el.drum ?? r * 0.5;
  bag.add(S, box(x - r * 1.1, y, z - r * 1.1, x + r * 1.1, y + dr * 0.6, z + r * 1.1));
  bag.add(S, lathe([[r * 1.08, 0], [r * 1.02, dr * 0.4]], 8, null, x, y + dr * 0.6, z));
  bag.add(S, lathe([[r, 0], [r, dr * 0.4]], 16, null, x, y + dr, z));
  bag.add('stucco', lathe([[r * 0.98, 0], [r * 0.95, r * 0.35], [r * 0.8, r * 0.7], [r * 0.5, r * 0.95], [0.001, r * 1.08]], 24, null, x, y + dr * 1.4, z));
  bag.add('bronze', lathe([[0.15, 0], [0.4, 0.6], [0.05, 1.6], [0.001, 2]], 6, null, x, y + dr * 1.4 + r * 1.08, z));
  col.circle(x, z, r * 1.1, y, y + dr);
}
/** madrasa_block: { rect, h, y, portal ('n'|'s'|'e'|'w'), court (rect of the open court) } — the sheer stone block with window bays, the crown, the portal recess. */
function block(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 36, f = el.portal ?? 'n', court = el.court;
  const parts = court ? [[x0, z0, x1, court[1]], [x0, court[3], x1, z1], [x0, court[1], court[0], court[3]], [court[2], court[1], x1, court[3]]] : [[x0, z0, x1, z1]];
  // the voids cut into the solid: the iwans round the court (each to the apex of its vault), the mihrab's niche, the way in from the portal
  const voids = [];
  for (const iw of el.iwans || []) { const [a, b, c2, d] = iw.rect; voids.push([a, b, c2, d, y, y + iw.ys + iw.W * 0.59]); if (iw.qibla) { const m2 = iwanFrame(iw); voids.push([...m2.rect(-1.1, 1.1, iw.D, iw.D + 1.1), y, y + 5]); } }
  for (const r of el.entry || []) voids.push([r[0], r[1], r[2], r[3], y, y + (r[4] ?? 5.2)]);
  for (const r of parts) { if (r[2] - r[0] < 0.5 || r[3] - r[1] < 0.5) continue; carve(bag, col, S, r, y - 0.5, y + h, voids); }
  if (court) { bag.add('marble', box(court[0], y - 0.3, court[1], court[2], y + 0.06, court[3])); col.floor(court, y + 0.06); }
  for (const r of el.entry || []) { bag.add('marble_floor', box(r[0], y - 0.3, r[1], r[2], y + 0.06, r[3])); col.floor(r.slice(0, 4), y + 0.06); if (r[4] > 6) vestibule(bag, col, r, y); }
  for (const iw of el.iwans || []) iwan(bag, col, iw, y);
  if (court && el.iwans) courtFittings(bag, col, court, y, h);
  crest(bag, [x0, z0, x1, z1], y + h);
  // a frame on each face: u along it, d outward from it; R(u0, u1, y0, y1, d0, d1) is a box in that frame
  const frame = (face) => {
    const along = face === 'n' || face === 's', o = face === 'n' ? z0 : face === 's' ? z1 : face === 'w' ? x0 : x1, sg = face === 'n' || face === 'w' ? -1 : 1;
    return (u0, u1, y0, y1, d0, d1) => { const a = o + sg * d0, b = o + sg * d1; return along ? box(u0, y0, Math.min(a, b), u1, y1, Math.max(a, b)) : box(Math.min(a, b), y0, u0, Math.max(a, b), y1, u1); };
  };
  // the bays: pilasters standing out between them; in each, tiers of paired windows — the lower square
  // under grilles, the upper with pointed heads — and a muqarnas cap stepping out at the top of the bay
  const pm = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2;
  const inPortal = (face, u, half) => face === f && Math.abs(u - pm) < 5 + half + 0.6;
  for (const face of 'nsew') {
    const R = frame(face), along = face === 'n' || face === 's', a0 = along ? x0 : z0, L = along ? x1 - x0 : z1 - z0, n = Math.floor(L / 7);
    for (let i = 0; i <= n; i++) { const u = a0 + i * L / n; if (!inPortal(face, u, 0.7)) bag.add(S, R(u - 0.7, u + 0.7, y, y + h - 1.6, 0, 0.45)); }
    for (let i = 0; i < n; i++) {
      const u = a0 + (i + 0.5) * L / n, bw = L / n / 2 - 0.9;
      if (inPortal(face, u, bw)) continue;
      // (a low block, the Citadel's mosque, has only the tiers that fit under its cornice)
      for (const [yy, hh, pointed] of [[y + 4, 4.2, false], [y + 13, 5.5, true], [y + 23, 4.8, true]].filter(([yy, hh]) => yy + hh < y + h - 5.5)) for (const s2 of [-0.9, 0.9]) {
        bag.add('opening', R(u + s2 - 0.55, u + s2 + 0.55, yy, yy + hh, -0.02, 0.05));
        bag.add(S, R(u + s2 - 0.75, u + s2 + 0.75, yy - 0.25, yy, 0, 0.12));
        if (pointed) bag.add(S, R(u + s2 - 0.28, u + s2 + 0.28, yy + hh, yy + hh + 0.5, -0.02, 0.06));
        if (!pointed) for (let g = 1; g < 4; g++) bag.add('iron', R(u + s2 - 0.55, u + s2 + 0.55, yy + g * hh / 4 - 0.03, yy + g * hh / 4 + 0.03, 0.05, 0.1));
      }
      for (let k = 0; k < 4; k++) bag.add(S, R(u - bw + k * 0.25, u + bw - k * 0.25, y + h - 5.5 + k * 0.9, y + h - 4.6 + k * 0.9, 0, 0.12 + k * 0.1));
    }
  }
  // the portal: two piers standing out from the face, the hood of muqarnas stepping out across the top
  // of the recess between them, the door at the back under a grilled window, frames of moulding
  const R = frame(f), m = f === 'n' || f === 's' ? (x0 + x1) / 2 - (x1 - x0) * 0.25 : (z0 + z1) / 2, ph = h * 1.05, D = 3, W = 5;
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W : m + W - 1.6, s2 < 0 ? m - W + 1.6 : m + W, y - 0.5, y + ph, 0, D));
  bag.add(S, R(m - W, m + W, y + ph * 0.8, y + ph, 0, D));
  bag.add(S, R(m - W - 0.3, m + W + 0.3, y + ph - 1.2, y + ph - 0.6, D - 0.2, D + 0.3));
  for (let k = 0; k < 7; k++) {
    const yy = y + ph * 0.58 + k * (ph * 0.22) / 7, out = D * (k + 1) / 7, n2 = 7 - Math.floor(k / 2);
    for (let i = 0; i < n2; i++) { const u0 = m - W + 1.6 + i * (2 * W - 3.2) / n2, u1 = u0 + (2 * W - 3.2) / n2 - 0.08; bag.add(S, R(u0, u1, yy, yy + ph * 0.22 / 7, 0, out)); }
  }
  if (el.entry) { for (const s2 of [-1, 1]) bag.add('bronze', R(s2 < 0 ? m - 1.5 : m + 1.3, s2 < 0 ? m - 1.3 : m + 1.5, y, y + 5.2, -1.4, 0)); }
  else bag.add('opening', R(m - 1.3, m + 1.3, y, y + 5.2, -0.02, 0.06));
  bag.add(S, R(m - 1.7, m + 1.7, y + 5.2, y + 5.9, 0, 0.2));
  bag.add('opening', R(m - 1.0, m + 1.0, y + 7.5, y + 10.5, -0.02, 0.06));
  for (let g = 1; g < 5; g++) bag.add('iron', R(m - 1.0, m + 1.0, y + 7.5 + g * 0.6 - 0.03, y + 7.5 + g * 0.6 + 0.03, 0.06, 0.1));
  for (const s2 of [-1, 1]) bag.add(S, R(s2 < 0 ? m - W + 1.6 : m + W - 1.9, s2 < 0 ? m - W + 1.9 : m + W - 1.6, y, y + ph * 0.58, 0, 0.3));
}
/**
 * The domed vestibule behind the portal (Sultan Hasan's: the first room of the bent way in), in the void
 * r [x0, z0, x1, z1, height]: stone benches along its sides, a dado of dark and white marble courses, the
 * zone of transition as tiers of muqarnas niches stepping out across the corners, the dome of plastered
 * brick on its ring, the lamp from its crown.
 */
function vestibule(bag, col, r, y) {
  const [x0, z0, x1, z1, H] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.min(x1 - x0, z1 - z0) / 2, ys = y + H - w - 0.6;
  for (const [a, b] of [[x0, x0 + 0.7], [x1 - 0.7, x1]]) { bag.add(S, box(a, y, z0 + 1.2, b, y + 0.55, z1 - 1.2)); col.rect([a, z0 + 1.2, b, z1 - 1.2], y, y + 0.55); }
  for (let k = 0; k < 6; k++) { const yy = y + 0.6 + k * 0.4; for (const [a, c] of [[x0, x0 + 0.03], [x1 - 0.03, x1]]) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', box(a, yy, z0 + 0.4, c, yy + 0.4, z1 - 0.4)); }
  // the corners: tiers of cells stepping out until the square is an octagon, then the dome's ring
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) for (let k = 0; k < 4; k++) {
    const e = (k + 1) * 0.42, yy = ys - 2.0 + k * 0.5, px = sx < 0 ? x0 : x1, pz = sz < 0 ? z0 : z1;
    for (let i = 0; i <= k; i++) { const ox = sx * -(e - i * 0.42), oz = sz * -(i * 0.42 + 0.42); bag.add('stucco', box(Math.min(px, px + ox), yy, Math.min(pz, pz + oz), Math.max(px, px + ox), yy + 0.5, Math.max(pz, pz + oz))); }
  }
  bag.add('stucco', box(x0, ys - 0.1, z0, x1, ys + 0.3, z0 + 0.6)); bag.add('stucco', box(x0, ys - 0.1, z1 - 0.6, x1, ys + 0.3, z1));
  bag.add('stucco', box(x0, ys - 0.1, z0 + 0.6, x0 + 0.6, ys + 0.3, z1 - 0.6)); bag.add('stucco', box(x1 - 0.6, ys - 0.1, z0 + 0.6, x1, ys + 0.3, z1 - 0.6));
  bag.add('stucco', dbl(Array.from(lathe([[w - 0.05, 0], [w * 0.97, w * 0.3], [w * 0.8, w * 0.65], [w * 0.5, w * 0.9], [0.001, w + 0.3]], 20, null, cx, ys + 0.3, cz).attributes.position.array)));
  bag.add('lamp_glass', lathe([[0.001, 0], [0.09, 0.02], [0.2, 0.2], [0.2, 0.3], [0.11, 0.45], [0.2, 0.62], [0.001, 0.62]], 10, null, cx, y + 4.2, cz));
  bag.add('iron', rod([cx, y + 4.8, cz], [cx, ys + w + 0.5, cz], 0.012, 4));
}
/** Solid boxes filling rect r from ya to yb less the void boxes [x0, z0, x1, z1, y0, y1], on a grid cut at the voids' edges, runs merged along x. */
function carve(bag, col, mat, r, ya, yb, voids) {
  const vs = voids.filter((v) => v[0] < r[2] && v[2] > r[0] && v[1] < r[3] && v[3] > r[1]);
  const cuts = (a, b, k) => [...new Set([a, b, ...vs.flatMap((v) => [v[k], v[k + 2]]).filter((c) => c > a && c < b)])].sort((p, q) => p - q);
  const xs = cuts(r[0], r[2], 0), zs = cuts(r[1], r[3], 1);
  const solid = (x, z) => {
    const iv = vs.filter((v) => x > v[0] && x < v[2] && z > v[1] && z < v[3]).map((v) => [v[4], v[5]]).sort((p, q) => p[0] - q[0]);
    const out = []; let y0 = ya;
    for (const [a, b] of iv) { if (a > y0) out.push([y0, Math.min(a, yb)]); y0 = Math.max(y0, b); }
    if (y0 < yb) out.push([y0, yb]);
    return out;
  };
  for (let j = 0; j + 1 < zs.length; j++) {
    let run = null;
    const flush = () => { if (!run) return; for (const [a, b] of run.iv) { bag.add(mat, box(run.x0, a, zs[j], run.x1, b, zs[j + 1])); col.rect([run.x0, zs[j], run.x1, zs[j + 1]], a, b); } run = null; };
    for (let i = 0; i + 1 < xs.length; i++) {
      const iv = solid((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2), key = JSON.stringify(iv);
      if (run && run.key === key) run.x1 = xs[i + 1]; else { flush(); run = { key, iv, x0: xs[i], x1: xs[i + 1] }; }
    }
    flush();
  }
}

/** An iwan's frame: u across its mouth, d in from the court face (0) to the back wall (D); `rect` maps frame bounds to a world rect, `P` a point. */
function iwanFrame(iw) {
  const [x0, z0, x1, z1] = iw.rect, o = iw.open;   // o: the side open to the court ('n' = toward −z …)
  const P = (u, d) => o === 'n' ? [(x0 + x1) / 2 + u, z0 + d] : o === 's' ? [(x0 + x1) / 2 - u, z1 - d] : o === 'w' ? [x0 + d, (z0 + z1) / 2 - u] : [x1 - d, (z0 + z1) / 2 + u];
  const rect = (u0, u1, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { P, rect, B: (u0, u1, d0, d1, ya, yb) => { const q = rect(u0, u1, d0, d1); return box(q[0], ya, q[1], q[2], yb, q[3]); } };
}
const dbl = (t) => { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); };

/**
 * An iwan { rect, open (side to the court), W (width), D (depth), ys (springing above the floor), qibla }:
 * a hall under a pointed barrel vault open to the court through an arch with voussoirs of red and
 * black (ablaq); oil lamps hung on chains, all at one height. The qibla iwan (docs/settlements/mamluk-cairo.md §4):
 * a dado of coloured marble panels, the great stucco band of Kufic at the springing, the marble
 * mihrab with windows in bronze grilles either side and an oculus above, the bronze doors to the
 * tomb, the marble minbar, and the dikka on columns in front of the iwan.
 */
function iwan(bag, col, iw, y) {
  const F = iwanFrame(iw), { P, B } = F, W = iw.W, D = iw.D, ys = y + iw.ys, r = W * 0.6, cL = -W / 2 + r, ta = Math.acos((W / 2 - r) / r), N = 14;
  bag.add('marble_floor', B(-W / 2, W / 2, 0, D, y - 0.3, y + 0.06)); col.floor(F.rect(-W / 2, W / 2, 0, D), y + 0.06);
  // the vault: two arcs meeting at the point, swept from the mouth to the back wall
  const arc = []; for (let k = 0; k <= N; k++) { const t = Math.PI - (Math.PI - ta) * k / N; arc.push([cL + r * Math.cos(t), ys + r * Math.sin(t)]); }
  const prof = arc.concat(arc.slice(0, -1).reverse().map(([u, yy]) => [-u, yy]));
  const apex = ys + W * 0.59, V = [], SP = [], cen = (k) => (k <= N ? cL : -cL);
  const at = (u, d, yy) => { const p = P(u, d); return [p[0], yy, p[1]]; };
  for (let k = 0; k + 1 < prof.length; k++) {
    const [u0, y0] = prof[k], [u1, y1] = prof[k + 1];
    V.push(...at(u0, 0, y0), ...at(u1, 0, y1), ...at(u1, D, y1), ...at(u0, 0, y0), ...at(u1, D, y1), ...at(u0, D, y0));
    SP.push(...at(u0, 0, y0), ...at(u1, 0, y1), ...at(u1, 0, apex), ...at(u0, 0, y0), ...at(u1, 0, apex), ...at(u0, 0, apex));
    // the voussoirs round the arch on the court face, red and black in turn
    const n0 = [u0 - cen(k), y0 - ys], n1 = [u1 - cen(k + 1 === N ? k : k + 1), y1 - ys];
    const l0 = Math.hypot(...n0), l1 = Math.hypot(...n1), e = 1.0;
    const q = [at(u0, -0.06, y0), at(u1, -0.06, y1), at(u1 + n1[0] / l1 * e, -0.06, y1 + n1[1] / l1 * e), at(u0 + n0[0] / l0 * e, -0.06, y0 + n0[1] / l0 * e)];
    bag.add(k % 2 ? 'marble_dark' : 'stucco_red', dbl([...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]]));
  }
  bag.add('stucco', dbl(V)); bag.add(S, dbl(SP));
  // the back wall's tympanum under the vault, plastered like the walls
  const TY = []; for (let k = 0; k + 1 < prof.length; k++) { const [u0, y0] = prof[k], [u1, y1] = prof[k + 1]; TY.push(...at(u0, D - 0.04, ys), ...at(u1, D - 0.04, ys), ...at(u1, D - 0.04, y1), ...at(u0, D - 0.04, ys), ...at(u1, D - 0.04, y1), ...at(u0, D - 0.04, y0)); }
  bag.add('stucco', dbl(TY));
  // the walls inside: plaster above, a moulding at the springing
  for (const s of [-1, 1]) { bag.add('stucco', B(s * W / 2 - (s > 0 ? 0.04 : 0), s * W / 2 + (s < 0 ? 0.04 : 0), 0, D, y + (iw.qibla ? 4.4 : 0), ys)); }
  bag.add('stucco', B(-W / 2, W / 2, D - 0.04, D, y + (iw.qibla ? 4.4 : 0), ys));
  for (const s of [-1, 1]) bag.add(S, B(s * W / 2 - (s > 0 ? 0.25 : 0), s * W / 2 + (s < 0 ? 0.25 : 0), 0, D, ys - 0.3, ys));
  // the lamps: glass, on chains from the vault, all at one height
  const ly = y + 4.6, cols = Math.max(2, Math.round(W / 5)), rows = Math.max(2, Math.round(D / 3.2));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u = -W / 2 + (i + 0.5) * W / cols, d = (j + 0.6) * D / (rows + 0.2), p = P(u, d);
    const yv = ys + Math.sqrt(Math.max(0, r * r - (-Math.abs(u) - cL) ** 2)) - 0.2;
    // the enamelled glass lamp of Sultan Hasan (docs/settlements/mamluk-cairo.md §10): the globular body, the flaring neck
    // with the Light verse in blue enamel, the gilding, six loops for the chains
    FN.mosqueLamp(bag, null, p[0], ly, p[1], Math.max(ly + 1.2, yv), { enamel: true, k: 1.15 });
  }
  // the floor: reed mats laid across the iwan, carpets over them in the qibla iwan (§10)
  { const v0 = P(0, 0), v1 = P(0, 1), yawd = Math.atan2(v1[0] - v0[0], v1[1] - v0[1]), n = Math.max(1, Math.floor((D - 1.2) / 2.1));
    for (let j = 0; j < n; j++) { const p = P(0, 0.9 + (j + 0.5) * (D - 1.4) / n); FN.reedMat(bag, p[0], y + 0.06, p[1], W - 1.2, (D - 1.4) / n - 0.12, yawd); }
    if (iw.qibla) for (let j = 0; j < 3; j++) { const p = P(0, 2.2 + j * 3.6); FN.carpet(bag, p[0], y + 0.072, p[1], Math.min(9, W - 3), 2.8, yawd, j % 2 ? 'mamluk' : 'maroon'); } }
  if (!iw.qibla) return;
  // the Qur'an on its stand (kursi) by the minbar, a cushion for the reader
  { const v0 = P(0, 0), v1 = P(0, 1), yawd = Math.atan2(v1[0] - v0[0], v1[1] - v0[1]), p = P(3.4, D - 4.2), r = P(3.4, D - 4.8); FN.rahle(bag, p[0], y + 0.09, p[1], yawd + Math.PI, { h: 0.42, w: 0.4 }); FN.cushion(bag, r[0], y + 0.09, r[1], 0.55, 0.55, 0.09, yawd, 'cloth_green'); }
  // the dado: panels of white, dark and rose marble with dark frames, round the three walls
  const panel = (u0, u1, d0, d1, ya, yb, k) => bag.add(['marble_smooth', 'marble_pink', 'marble_smooth', 'marble_dark'][k % 4], B(u0, u1, d0, d1, ya, yb));
  for (const s of [-1, 1]) { const n = Math.round(D / 1.5); for (let k = 0; k < n; k++) { const d0 = k * D / n + 0.06, d1 = (k + 1) * D / n - 0.06, uu = s * W / 2; panel(uu - (s > 0 ? 0.06 : 0), uu + (s < 0 ? 0.06 : 0), d0, d1, y + 0.3, y + 3.9, k); bag.add('marble_dark', B(uu - (s > 0 ? 0.04 : 0), uu + (s < 0 ? 0.04 : 0), k * D / n, (k + 1) * D / n, y + 0.06, y + 4.4)); } }
  { const n = Math.round(W / 1.5); for (let k = 0; k < n; k++) { const u0 = -W / 2 + k * W / n, u1 = u0 + W / n; if (Math.abs(u0 + u1) / 2 < 2.6) continue; if (Math.abs(Math.abs((u0 + u1) / 2) - 7) < 1.4) continue; panel(u0 + 0.06, u1 - 0.06, D - 0.1, D, y + 0.3, y + 3.9, k); bag.add('marble_dark', B(u0, u1, D - 0.06, D, y + 0.06, y + 4.4)); } }
  // the Kufic band at the springing: tall stems and heads in relief on a ground, all round the iwan
  const by = ys - 2.2, bh = 1.7;
  const band = (len, place) => { place(0, len, -0.02, 0.12, by, by + bh, 'stucco_warm'); let u = 0.25, k = 0; while (u < len - 0.3) { const tall = (k * 7 + 3) % 5 !== 0, w = tall ? 0.09 : 0.28; place(u, u + w, 0.12, 0.2, by + 0.2, by + (tall ? bh - 0.2 : 0.45), 'stucco_cream'); if (tall && k % 3 === 0) place(u - 0.08, u + w + 0.08, 0.12, 0.2, by + bh - 0.35, by + bh - 0.2, 'stucco_cream'); u += tall ? 0.24 + ((k * 13) % 4) * 0.04 : 0.36; k++; } place(0, len, 0.12, 0.18, by + 0.12, by + 0.22, 'stucco_cream'); };
  for (const s of [-1, 1]) band(D, (a, b, i0, i1, ya, yb, m) => bag.add(m, B(s * W / 2 - s * i1, s * W / 2 - s * i0, a, b, ya, yb)));
  band(W, (a, b, i0, i1, ya, yb, m) => bag.add(m, B(-W / 2 + a, -W / 2 + b, D - i1, D - i0, ya, yb)));
  // the mihrab: its niche (cut into the wall), lined in dark and white marble, colonnettes, a frame and a pointed hood
  bag.add('marble_dark', B(-1.1, 1.1, D + 1.06, D + 1.1, y, y + 5));
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', B(s > 0 ? 1.06 : -1.1, s > 0 ? 1.1 : -1.06, D, D + 1.1, y + k * 5 / 6, y + (k + 1) * 5 / 6));
  bag.add('marble_pink', B(-1.1, 1.1, D, D + 1.1, y + 4.96, y + 5));
  for (const s of [-1, 1]) { const p = P(s * 1.3, D - 0.15); bag.add('marble_column', lathe([[0.12, 0], [0.12, 4.6], [0.18, 4.75], [0.18, 4.9], [0.001, 4.9]], 10, null, p[0], y, p[1])); }
  bag.add('marble_smooth', B(-2.4, 2.4, D - 0.12, D, y, y + 0.3));
  for (const [u0, u1, ya, yb, m] of [[-2.4, -1.6, y, y + 7.6, 'marble_pink'], [1.6, 2.4, y, y + 7.6, 'marble_pink'], [-2.4, 2.4, y + 7.0, y + 7.6, 'marble_pink'], [-1.6, 1.6, y + 5.0, y + 7.0, 'marble_smooth']]) bag.add(m, B(u0, u1, D - 0.1, D, ya, yb));
  // the pointed hood over the niche: a moulding along two arcs meeting at the point, dark on white
  { const hr = 1.55 * 1.2, hc = -1.55 + hr, hta = Math.acos(-hc / hr), pts = [];
    for (let k = 0; k <= 10; k++) { const t = Math.PI - (Math.PI - hta) * k / 10; pts.push([hc + hr * Math.cos(t), y + 5 + hr * Math.sin(t)]); }
    for (const sg of [1, -1]) for (let k = 0; k < 10; k++) bag.add('marble_dark', rod(at(sg * pts[k][0], D - 0.12, pts[k][1]), at(sg * pts[k + 1][0], D - 0.12, pts[k + 1][1]), 0.09, 6)); }
  // the windows either side in bronze grilles, the oculus above; the bronze doors to the tomb
  for (const s of [-1, 1]) {
    const u = s * 4.6;
    bag.add(S, B(u - 1.3, u + 1.3, D - 0.6, D, y + 6.2, y + 6.4));
    bag.add('daylight', B(u - 1.0, u + 1.0, D - 0.04, D, y + 6.4, y + 9.6));
    for (let g = 0; g <= 6; g++) bag.add('bronze', B(u - 1.0 + g / 3 - 0.03, u - 1.0 + g / 3 + 0.03, D - 0.1, D - 0.04, y + 6.4, y + 9.6));
    for (let g = 1; g < 6; g++) bag.add('bronze', B(u - 1.0, u + 1.0, D - 0.1, D - 0.04, y + 6.4 + g * 0.53 - 0.03, y + 6.4 + g * 0.53 + 0.03));
    const ud = s * 7;
    bag.add('bronze', B(ud - 1.1, ud + 1.1, D - 0.08, D, y + 0.06, y + 4.2));
    for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) bag.add('gilt_bronze', B(ud - 0.85 + a * 0.56, ud - 0.75 + a * 0.56, D - 0.13, D - 0.08, y + 0.5 + b * 0.6, y + 0.6 + b * 0.6));
    bag.add('marble_pink', B(ud - 1.4, ud + 1.4, D - 0.1, D, y + 4.2, y + 4.6));
  }
  {
    const p = P(0, D - 0.03), q = P(0, 0), b0 = P(0, D), b1 = P(1, D), vx = Math.sign(q[0] - b0[0]), vz = Math.sign(q[1] - b0[1]), oy = y + 12.2;
    const g = disc(1.3, 0, 20); if (vz) g.rotateX(vz * Math.PI / 2); else g.rotateZ(-vx * Math.PI / 2);
    bag.add('daylight', g.translate(p[0], oy, p[1]));
    const ux = b1[0] - b0[0], uz = b1[1] - b0[1];
    for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2, a1 = (k + 1) / 20 * Math.PI * 2; bag.add(k % 2 ? 'marble_dark' : 'marble_smooth', rod([p[0] + ux * Math.cos(a0) * 1.42 - vx * 0.05, oy + Math.sin(a0) * 1.42, p[1] + uz * Math.cos(a0) * 1.42 - vz * 0.05], [p[0] + ux * Math.cos(a1) * 1.42 - vx * 0.05, oy + Math.sin(a1) * 1.42, p[1] + uz * Math.cos(a1) * 1.42 - vz * 0.05], 0.13, 5)); }
  }
  // the minbar: steps of marble up to a seat under a little dome, to the right of the mihrab
  const mu = -3.1, steps = 12;
  for (let k = 0; k < steps; k++) { const d1 = D - 0.4 - k * 0.42, yy = y + 4.2 - k * 0.35; bag.add('marble_smooth', B(mu - 0.5, mu + 0.5, d1 - 0.42, d1, y + 0.06, yy)); col.floor(F.rect(mu - 0.5, mu + 0.5, d1 - 0.42, d1), yy); }
  { const t = []; for (const s of [-1, 1]) { const u = mu + s * 0.58, a = at(u, D - 0.4, y + 5.1), b = at(u, D - 0.4 - steps * 0.42, y + 1.3), c = at(u, D - 0.4 - steps * 0.42, y + 0.06), d = at(u, D - 0.4, y + 0.06); t.push(...a, ...b, ...c, ...a, ...c, ...d); } bag.add('marble_pink', dbl(t)); }
  for (const s of [-1, 1]) { bag.add('marble_smooth', B(mu + s * 0.58 - 0.08, mu + s * 0.58 + 0.08, D - 0.6 - steps * 0.42, D - 0.4 - steps * 0.42, y, y + 3.0)); bag.add('marble_smooth', B(mu + s * 0.5 - 0.06, mu + s * 0.5 + 0.06, D - 1.2, D - 1.08, y + 4.2, y + 6.4)); bag.add('marble_smooth', B(mu + s * 0.5 - 0.06, mu + s * 0.5 + 0.06, D - 0.36, D - 0.24, y + 4.2, y + 6.4)); }
  bag.add('marble_smooth', B(mu - 0.66, mu + 0.66, D - 0.6 - steps * 0.42, D - 0.4 - steps * 0.42, y + 3.0, y + 3.4));
  { const p = P(mu, D - 0.7); bag.add('marble_smooth', box(p[0] - 0.62, y + 6.4, p[1] - 0.52, p[0] + 0.62, y + 6.6, p[1] + 0.52)); bag.add('marble_smooth', lathe([[0.5, 0], [0.48, 0.3], [0.32, 0.7], [0.08, 0.95], [0.001, 1.25]], 12, null, p[0], y + 6.6, p[1])); }
  // the dikka: a marble platform on eight columns in front of the iwan, a parapet round it
  const dk = [-2.6, 2.6, -6.2, -1.6], dy = y + 2.6;
  bag.add('marble_smooth', B(dk[0], dk[1], dk[2], dk[3], dy, dy + 0.35));
  for (const [a, b] of [[dk[0], dk[1]]]) { bag.add('marble_pink', B(a, b, dk[2], dk[2] + 0.12, dy + 0.35, dy + 1.2)); bag.add('marble_pink', B(a, b, dk[3] - 0.12, dk[3], dy + 0.35, dy + 1.2)); }
  for (const s of [-1, 1]) bag.add('marble_pink', B(s > 0 ? dk[1] - 0.12 : dk[0], s > 0 ? dk[1] : dk[0] + 0.12, dk[2], dk[3], dy + 0.35, dy + 1.2));
  for (const u of [dk[0] + 0.3, dk[0] + 2.0, dk[1] - 2.0, dk[1] - 0.3]) for (const d of [dk[2] + 0.3, dk[3] - 0.3]) { const p = P(u, d); bag.add('marble_column', lathe([[0.16, 0], [0.14, 0.2], [0.12, 2.3], [0.2, 2.45], [0.2, 2.6], [0.001, 2.6]], 10, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.16, y, dy); }
}

/** The court's fittings: the octagonal basin of the fountain at the centre, the madrasas' doors in its corners, a cornice round its top. */
function courtFittings(bag, col, c, y, h) {
  const cx = (c[0] + c[2]) / 2, cz = (c[1] + c[3]) / 2;
  bag.add('marble_smooth', lathe([[3.4, 0], [3.4, 0.9], [3.6, 0.95], [3.6, 1.05], [3.1, 1.05], [3.1, 0.3], [0.001, 0.3]], 8, null, cx, y, cz));
  bag.add('water', disc(3.1, y + 0.8, 8, cx, cz));
  bag.add('marble_smooth', lathe([[0.3, 0], [0.22, 0.6], [0.5, 0.8], [0.5, 0.9], [0.12, 1.0], [0.08, 1.6], [0.001, 1.7]], 10, null, cx, y + 0.3, cz));
  col.circle(cx, cz, 3.6, y, y + 1.05);
  for (const [x, z, dx, dz] of [[c[0], c[1] + 2.5, 1, 0], [c[2], c[1] + 2.5, -1, 0], [c[0], c[3] - 2.5, 1, 0], [c[2], c[3] - 2.5, -1, 0]]) {
    const o = dx * 0.04;
    bag.add('opening', box(Math.min(x, x + o), y, z - 0.8, Math.max(x, x + o), y + 3.2, z + 0.8));
    for (const [a, b, ya, yb] of [[-1.2, -0.8, y, y + 3.6], [0.8, 1.2, y, y + 3.6], [-1.2, 1.2, y + 3.2, y + 3.6]]) bag.add('marble_dark', box(Math.min(x, x + dx * 0.1), ya, z + a, Math.max(x, x + dx * 0.1), yb, z + b));
    bag.add('stucco_red', box(Math.min(x, x + dx * 0.08), y + 3.6, z - 1.2, Math.max(x, x + dx * 0.08), y + 4.2, z + 1.2));
  }
  for (let k = 0; k < 3; k++) { const e = 0.3 + k * 0.3, yy = y + h - 2.4 + k * 0.5; for (const r of [[c[0], c[1], c[2], c[1] + e], [c[0], c[3] - e, c[2], c[3]], [c[0], c[1], c[0] + e, c[3]], [c[2] - e, c[1], c[2], c[3]]]) bag.add(S, box(r[0], yy, r[1], r[2], yy + 0.5, r[3])); }
}

/** An oriented box along a→b ([x, z]), thickness th, from y0 to y1, its geometry as triangles. */
function slab(a, b, th, y0, y1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L * th / 2, nz = (b[0] - a[0]) / L * th / 2;
  const P = (p, s, yy) => [p[0] + nx * s, yy, p[1] + nz * s], c = [[a, -1], [b, -1], [b, 1], [a, 1]];
  const t = [], q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
  const B = c.map(([p, s]) => P(p, s, y0)), T = c.map(([p, s]) => P(p, s, y1));
  q(B[0], B[1], B[2], B[3]); q(T[0], T[3], T[2], T[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(B[i], T[i], T[j], B[j]); }
  return fromTriangles(orientOutward(t));
}
/**
 * citadel_wall: a→b { h, th, y, gate (0…1 along, or none) } — the curtain of the Citadel in cut stone along
 * its line, a walk behind square merlons, a round tower at a (the next segment's wall brings the next); a
 * gate: an opening 4.4 m wide and 6.5 m high under the curtain, two half-round towers flanking it.
 */
function citadelWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 12, th = el.th ?? 3, y = el.y ?? 0, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, at = (u) => [a[0] + ux * u, a[1] + uz * u];
  const runs = el.gate === undefined ? [[0, L]] : [[0, el.gate * L - 2.2], [el.gate * L + 2.2, L]];
  for (const [u0, u1] of runs) { bag.add(S, slab(at(u0), at(u1), th, y - 3, y + h)); col.segment(at(u0), at(u1), th, y - 3, y + h); }
  if (el.gate !== undefined) {
    const g0 = at(el.gate * L - 2.2), g1 = at(el.gate * L + 2.2);
    bag.add(S, slab(g0, g1, th, y + 6.5, y + h));
    // the arch's voussoirs over the opening, red and white in turn on both faces
    for (let k = 0; k < 7; k++) for (const sg of [-1, 1]) { const p = at(el.gate * L - 2.2 + k * 4.4 / 7), q = at(el.gate * L - 2.2 + (k + 1) * 4.4 / 7); bag.add(k % 2 ? 'stucco_red' : 'marble_smooth', slab([p[0] - uz * sg * (th / 2 + 0.05), p[1] + ux * sg * (th / 2 + 0.05)], [q[0] - uz * sg * (th / 2 + 0.05), q[1] + ux * sg * (th / 2 + 0.05)], 0.1, y + 6.5, y + 7.4)); }
    for (const u of [el.gate * L - 2.2 - 3.0, el.gate * L + 2.2 + 3.0]) { const p = at(u); bag.add(S, lathe([[3.2, 0], [3.0, h + 5]], 16, null, p[0], y - 3, p[1])); col.circle(p[0], p[1], 3.2, y - 3, y + h + 5); for (let k = 0; k < 12; k += 2) { const t = k / 12 * Math.PI * 2; bag.add(S, box(p[0] + Math.cos(t) * 2.7 - 0.35, y + h + 5, p[1] + Math.sin(t) * 2.7 - 0.35, p[0] + Math.cos(t) * 2.7 + 0.35, y + h + 6.1, p[1] + Math.sin(t) * 2.7 + 0.35)); } }
  }
  // the merlons on the outer edge of the walk
  const nx = -uz, nz = ux, mo = th / 2 - 0.3;
  for (let u = 1; u < L - 1; u += 2.0) { if (el.gate !== undefined && Math.abs(u - el.gate * L) < 6) continue; const p = at(u), q = at(u + 1.1); bag.add(S, slab([p[0] + nx * mo, p[1] + nz * mo], [q[0] + nx * mo, q[1] + nz * mo], 0.6, y + h, y + h + 1.4)); }
  // the round tower at the segment's start
  bag.add(S, lathe([[th * 1.6, 0], [th * 1.5, h + 5]], 16, null, a[0], y - 3, a[1])); col.circle(a[0], a[1], th * 1.6, y - 3, y + h + 5);
  for (let k = 0; k < 14; k += 2) { const t = k / 14 * Math.PI * 2; bag.add(S, box(a[0] + Math.cos(t) * (th * 1.5 - 0.4) - 0.35, y + h + 5, a[1] + Math.sin(t) * (th * 1.5 - 0.4) - 0.35, a[0] + Math.cos(t) * (th * 1.5 - 0.4) + 0.35, y + h + 6.2, a[1] + Math.sin(t) * (th * 1.5 - 0.4) + 0.35)); }
}

/** road_wall: { pts [[x, z, y] …], th, below, above } — a revetment or parapet of cut stone along the road up to the Citadel. */
function roadWall(el, { bag, col }) {
  const th = el.th ?? 0.6;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const [ax, az, ay] = el.pts[i], [bx, bz, by] = el.pts[i + 1], y0 = Math.min(ay, by) - (el.below ?? 1), y1 = Math.max(ay, by) + (el.above ?? 0.9);
    bag.add(S, slab([ax, az], [bx, bz], th, y0, y1)); col.segment([ax, az], [bx, bz], th, y0, y1);
    bag.add(S, slab([ax, az], [bx, bz], th + 0.2, y1, y1 + 0.15));
  }
}

/**
 * nasir_minaret: { c, y, h, kind ('nw'|'ne') } — the two minarets of al-Nasir Muhammad's mosque in the Citadel
 * (1318; docs/settlements/mamluk-cairo.md §4.2), all of stone, their bases below the roof's line. 'nw' (over
 * the west portal): a round shaft carved in bands, a balcony, the upper stage sheathed in faience mosaic of
 * green, white and blue, the head a ribbed bulb shaped like a garlic, unique in Cairo. 'ne' (the taller, at the
 * north-east corner): a round shaft carved in chevrons, two balconies on muqarnas, a carved bulbous stage, an
 * open pavilion and a ribbed bulb with its finial.
 */
function nasirMinaret(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 40, r = el.r ?? 2.3;
  col.circle(x, z, r, y, y + h * 0.5);
  bag.add(S, box(x - r, y - 0.5, z - r, x + r, y + h * 0.12, z + r));
  const y1 = y + h * 0.12, y2 = y + h * (el.kind === 'nw' ? 0.5 : 0.48);
  // the first round stage: carved bands (nw) or chevrons (ne) in relief rings
  bag.add(S, lathe([[r * 0.92, 0], [r * 0.9, y2 - y1]], 16, el.kind === 'ne' ? (t, i) => 1 + 0.03 * Math.abs(((t * 8 / Math.PI) % 2) - 1) : null, x, y1, z));
  for (let k = 1; k < 6; k++) bag.add('limestone_carved', lathe([[r * 0.95, 0], [r * 0.95, 0.25]], 16, (t) => 1 + 0.02 * Math.cos(t * 16), x, y1 + (y2 - y1) * k / 6, z));
  let yb = mBalcony(bag, x, z, y2 + 1.0, r * 0.9, 8, 0);
  if (el.kind === 'nw') {
    // the upper stage in faience: bands of green and white, a blue band of inscription at its head
    const r2 = r * 0.7, y3 = yb + h * 0.2, n = 9;
    for (let k = 0; k < n; k++) bag.add(k % 3 === 1 ? 'tile_white' : 'glaze_green', lathe([[r2, 0], [r2, (y3 - yb) / n]], 16, (t, i) => (k % 3 === 1 ? 1 + 0.015 * Math.cos(t * 12) : 1), x, yb + (y3 - yb) * k / n, z));
    bag.add('tile_lapis', lathe([[r2 + 0.04, 0], [r2 + 0.04, 0.7]], 16, null, x, y3 - 0.7, z));
    bag.add(S, lathe([[r2 + 0.35, 0], [r2 + 0.35, 0.3], [0.001, 0.3]], 16, null, x, y3, z));
    // the neck and the garlic bulb in green faience, its ribs; the finial
    bag.add('glaze_green', lathe([[r2 * 0.55, 0], [r2 * 0.55, 0.9]], 12, null, x, y3 + 0.3, z));
    const rb = r2 * 1.15, yg = y3 + 1.2;
    bag.add('glaze_green', lathe([[r2 * 0.5, 0], [rb * 0.95, rb * 0.55], [rb, rb * 0.95], [rb * 0.8, rb * 1.35], [rb * 0.35, rb * 1.75], [rb * 0.12, rb * 2.1], [0.001, rb * 2.4]], 24, (t) => 1 + 0.07 * Math.abs(Math.cos(t * 6)), x, yg, z));
    yb = yg + rb * 2.4;
  } else {
    // the second round stage, a balcony, the carved bulbous stage, the pavilion and the ribbed bulb
    const r2 = r * 0.7, y3 = yb + h * 0.18;
    bag.add(S, lathe([[r2, 0], [r2, y3 - yb]], 16, (t) => 1 + 0.02 * Math.cos(t * 10), x, yb, z));
    yb = mBalcony(bag, x, z, y3 + 1.0, r2, 8, 0);
    bag.add('limestone_carved', lathe([[r2 * 0.8, 0], [r2 * 1.0, 0.9], [r2 * 0.9, 2.0], [r2 * 0.6, 2.6]], 16, (t) => 1 + 0.05 * Math.abs(Math.cos(t * 8)), x, yb, z));
    const yp = yb + 2.6, rp = r2 * 0.55, hp = 2.8;
    for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; bag.add('marble_column', lathe([[0.13, 0], [0.1, 0.2], [0.1, hp - 0.3], [0.15, hp]], 8, null, x + Math.cos(t) * rp, yp, z + Math.sin(t) * rp)); }
    bag.add(S, lathe([[rp + 0.3, 0], [rp + 0.3, 0.35], [0.001, 0.35]], 16, null, x, yp + hp, z));
    const rb = rp * 1.1, yg = yp + hp + 0.35;
    bag.add(S, lathe([[rb * 0.6, 0], [rb, rb * 0.7], [rb * 0.85, rb * 1.3], [rb * 0.3, rb * 1.8], [0.001, rb * 2.1]], 20, (t) => 1 + 0.06 * Math.abs(Math.cos(t * 6)), x, yg, z));
    yb = yg + rb * 2.1;
  }
  bag.add('bronze', rod([x, yb - 0.3, z], [x, yb + 1.8, z], 0.05, 6));
  for (const [rr, yy] of [[0.2, 0.3], [0.28, 0.85]]) bag.add('bronze', lathe([[0.05, 0], [rr, 0.14], [0.05, 0.28]], 8, null, x, yb + yy, z));
}

/**
 * suq_covered: { rect [x0, z0, x1, z1] (along z), y, street } — a market street covered with a timber roof, in the
 * manner of the Qasaba's markets (al-Maqrizi counted 12,000 shops there; some markets were roofed with wood,
 * one shaded with canvas drawn on ropes): a row of small shops each side, each a vaulted cell open to the
 * street behind its stone bench (the mastaba) where the seller sat, wooden shutters folded up, goods on shelves
 * and on the bench; over them a storey of rooms behind small lattice windows; across the street, beams with a
 * plank and mat roof, openings left between for light and air; the gate at each end.
 */
function suqCovered(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, st = el.street ?? 5, D = (x1 - x0 - st) / 2, L = z1 - z0, sw = 3.0, n = Math.floor(L / sw), w = L / n;
  const H1 = 3.6, H2 = 3.0, yr = y + H1 + H2 + 0.6, rng2 = rng(el.seed || 7);
  const goods = el.goods ?? [['pottery_dark', 'pot'], ['cloth_indigo', 'bolt'], ['cloth_red', 'bolt'], ['bronze', 'tray'], ['iron', 'blade'], ['wicker', 'basket'], ['cloth_ochre', 'bolt'], ['glaze_green', 'pot']];
  for (const side of [-1, 1]) {
    const xs = side < 0 ? x0 : x1 - D, xf = side < 0 ? x0 + D : x1 - D, out = side < 0 ? 1 : -1;   // the shops' fronts at xf, facing the street (out)
    const X = (d) => xf + out * d, xr = (a, b) => [Math.min(X(a), X(b)), Math.max(X(a), X(b))];
    // the back block of the row: the shops' party walls, back walls and the upper storey
    bag.add(S, box(xs, y - 0.4, z0, xs + D, y + 0.05, z1));
    bag.add('plaster_white', box(xs, y + H1 + 0.4, z0, xs + D, yr, z1));
    bag.add(S, box(Math.min(xs, xs + D), y + H1, z0, Math.max(xs, xs + D), y + H1 + 0.4, z1));
    const [bx0, bx1] = xr(-D, -D + 0.6); bag.add(S, box(bx0, y, z0, bx1, y + H1, z1));
    col.rect([Math.min(xs, xs + D), z0, Math.max(xs, xs + D), z1], y, yr);
    for (let i = 0; i < n; i++) {
      const za = z0 + i * w, zb = za + w, zc = (za + zb) / 2;
      // the piers between the shops, the lintel over each opening with its joggled voussoirs
      { const [p0, p1] = xr(-D + 0.6, 0); bag.add(S, box(p0, y, za, p1, y + H1, za + 0.4)); }
      for (let k = 0; k < 5; k++) { const [p0, p1] = xr(-0.05, 0.02); bag.add(k % 2 ? 'marble_dark' : S, box(p0, y + H1 - 0.6, za + 0.4 + k * (w - 0.4) / 5, p1, y + H1, za + 0.4 + (k + 1) * (w - 0.4) / 5)); }
      // the mastaba before the shop, and the shutter boards folded up under the lintel
      { const [m0, m1] = xr(0, 0.8); bag.add(S, box(m0, y, za + 0.45, m1, y + 0.7, zb - 0.05)); col.rect([m0, za + 0.45, m1, zb - 0.05], y, y + 0.7); }
      { const [s0, s1] = xr(0.02, 0.5); bag.add('wood_dark', box(s0, y + H1 - 0.75, za + 0.5, s1, y + H1 - 0.62, zb - 0.1)); }
      // the shop's floor raised, its shelves along the back, goods on them and on the bench
      { const [f0, f1] = xr(-D + 0.6, 0); bag.add('wood_dark', box(f0, y + 0.05, za + 0.4, f1, y + 0.7, zb)); }
      const [g, kind] = goods[Math.floor(rng2() * goods.length)];
      for (const hy of [1.5, 2.4]) { const [h0, h1] = xr(-D + 0.6, -D + 1.0); bag.add('timber', box(h0, y + hy, za + 0.5, h1, y + hy + 0.05, zb - 0.1));
        for (let k = 0; k < 3; k++) { const zz = za + 0.9 + k * (w - 1.2) / 3, xx = X(-D + 0.8); if (kind === 'pot') bag.add(g, lathe([[0.001, 0], [0.12, 0.03], [0.16, 0.18], [0.08, 0.32], [0.09, 0.38]], 8, null, xx, y + hy + 0.05, zz)); else if (kind === 'lamp') bag.add(g, lathe([[0.001, 0], [0.09, 0.02], [0.17, 0.18], [0.17, 0.26], [0.1, 0.4], [0.17, 0.55], [0.001, 0.55]], 10, null, xx, y + hy + 0.05, zz)); else if (kind === 'spice') bag.add(g, lathe([[0.17, 0], [0.15, 0.04], [0.001, 0.26]], 8, null, xx, y + hy + 0.05, zz)); else if (kind === 'bolt') bag.add(g, box(xx - 0.18, y + hy + 0.05, zz - 0.25, xx + 0.18, y + hy + 0.3, zz + 0.25)); else if (kind === 'blade') bag.add(g, box(xx - 0.02, y + hy + 0.05, zz - 0.04, xx + 0.02, y + hy + 0.85, zz + 0.04)); else if (kind === 'tray') bag.add(g, lathe([[0.001, 0], [0.3, 0.01], [0.32, 0.05]], 12, null, xx, y + hy + 0.05, zz)); else bag.add(g, lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.3]], 8, null, xx, y + hy + 0.05, zz)); } }
      { const xx = X(0.4); for (let k = 0; k < 2; k++) { const zz = za + 0.9 + k * (w - 1.0) / 2; if (kind === 'bolt') bag.add(g, box(xx - 0.2, y + 0.7, zz - 0.3, xx + 0.2, y + 0.95, zz + 0.3)); else bag.add(g === 'iron' ? 'wicker' : g, lathe([[0.001, 0], [0.16, 0.03], [0.2, 0.22], [0.1, 0.4], [0.11, 0.46]], 8, null, xx, y + 0.7, zz)); } }
      // the upper storey's window: a small projecting lattice on brackets
      { const [l0, l1] = xr(0, 0.5); bag.add('lattice', box(l0, y + H1 + 1.0, zc - 0.55, l1, y + H1 + 2.2, zc + 0.55)); const [k0, k1] = xr(0, 0.6); bag.add('wood_dark', box(k0, y + H1 + 0.85, zc - 0.65, k1, y + H1 + 1.0, zc + 0.65)); bag.add('wood_dark', box(k0, y + H1 + 2.2, zc - 0.65, k1, y + H1 + 2.35, zc + 0.65)); }
    }
    { const [p0, p1] = xr(-D + 0.6, 0); bag.add(S, box(p0, y, z1 - 0.4, p1, y + H1, z1)); }
    // the cornice of the row
    { const [c0, c1] = xr(-D, 0.35); bag.add(S, box(c0, yr, z0, c1, yr + 0.3, z1)); }
  }
  // the roof over the street: beams across, planks and mats laid on them, a slot open every fourth bay
  const xa = x0 + D, xb = x1 - D;
  for (let k = 0; k <= Math.floor(L / 1.5); k++) bag.add('timber', box(xa - 0.3, yr - 0.25, z0 + k * 1.5 - 0.1, xb + 0.3, yr, z0 + k * 1.5 + 0.1));
  for (let k = 0; k < Math.floor(L / 6); k++) { if (k % 4 === 3) continue; bag.add('reed_mat', box(xa - 0.3, yr, z0 + k * 6, xb + 0.3, yr + 0.06, z0 + (k + 1) * 6)); }
  // the gates at the ends: an arch through a wall the street's width, the roof's end over it
  for (const zz of [z0, z1]) {
    for (const s of [-1, 1]) bag.add(S, box(s < 0 ? xa : xb - 0.9, y - 0.4, zz - 0.5, s < 0 ? xa + 0.9 : xb, yr + 0.9, zz + 0.5));
    bag.add(S, box(xa + 0.9, y + 4.6, zz - 0.5, xb - 0.9, yr + 0.9, zz + 0.5));
    for (let k = 0; k < 7; k++) bag.add(k % 2 ? 'marble_dark' : 'marble_smooth', box(xa + 0.9 + k * (st - 1.8) / 7, y + 4.6, zz - 0.53, xa + 0.9 + (k + 1) * (st - 1.8) / 7, y + 5.2, zz + 0.53));
    col.rect([xa, zz - 0.5, xa + 0.9, zz + 0.5], y, yr); col.rect([xb - 0.9, zz - 0.5, xb, zz + 0.5], y, yr);
  }
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A face frame on rect r: f in 'nsew'; R(u0, u1, y0, y1, d0, d1) is a box with u along the face from its west/north end and d outward. */
function faceFrame(r, f) {
  const [x0, z0, x1, z1] = r;
  return (u0, u1, y0, y1, d0, d1) => f === 's' ? box(x0 + u0, y0, z1 + d0, x0 + u1, y1, z1 + d1) : f === 'n' ? box(x0 + u0, y0, z0 - d1, x0 + u1, y1, z0 - d0)
    : f === 'e' ? box(x1 + d0, y0, z0 + u0, x1 + d1, y1, z0 + u1) : box(x0 - d1, y0, z0 + u0, x0 - d0, y1, z0 + u1);
}
/**
 * cairo_front: the street front of a Cairene house of the 14th century laid on the shell of house_egypt
 * (the same lot fields: rect, y, storeys, front, seed) — docs/settlements/mamluk-cairo.md §5: a projecting
 * mashrabiya of turned wooden lattice on stepped corbels at the upper storey, a stone door frame with the
 * stone bench (mastaba) beside the door, and on some roofs a malqaf, the wind catcher open to the north.
 */
function cairoFront(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', st = 3.1, H = el.storeys * st + 0.2;
  const L = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, R = faceFrame(el.rect, f);
  const du = 0.6 + rng(el.seed || 1)() * Math.max(0.1, L - 2.2), r2 = rng(((el.seed || 1) * 7 + 3) >>> 0);
  const bays = [];
  if (r2() < 0.55 && L >= 4.2) bays.push(1);
  if (el.storeys > 2 && r2() < 0.4 && L >= 4.2) bays.push(2);
  for (const s of bays) {
    const w = Math.min(2.8, L - 1.6), um = Math.max(0.8 + w / 2, Math.min(L - 0.8 - w / 2, L / 2 + (r2() - 0.5) * (L - w - 1.6))), yo = y + s * st + 0.35, D = 0.62, a = um - w / 2, b = um + w / 2;
    if (el.simple) { bag.add('koshi', R(a, b, yo, yo + 2.3, 0, D)); continue; }
    for (const u of [a + 0.12, um, b - 0.12]) for (let k = 0; k < 3; k++) bag.add('wood_dark', R(u - 0.07, u + 0.07, yo - 0.62 + k * 0.2, yo - 0.42 + k * 0.2, 0, D * (k + 1) / 3));
    bag.add('wood_dark', R(a, b, yo - 0.12, yo + 0.05, 0, D));
    bag.add('wood_painted', R(a, b, yo + 0.05, yo + 0.4, D - 0.06, D));
    for (const s2 of [a, b]) bag.add('wood_painted', R(s2 - (s2 === a ? 0 : 0.06), s2 + (s2 === a ? 0.06 : 0), yo + 0.05, yo + 0.4, 0, D - 0.06));
    bag.add('koshi', R(a + 0.08, b - 0.08, yo + 0.4, yo + 1.95, D - 0.05, D - 0.01));
    for (const s2 of [a, b]) bag.add('koshi', R(s2 === a ? a : b - 0.04, s2 === a ? a + 0.04 : b, yo + 0.4, yo + 1.95, 0, D - 0.08));
    for (const u of [a, b]) bag.add('wood_dark', R(u - (u === a ? 0 : 0.08), u + (u === a ? 0.08 : 0), yo + 0.05, yo + 2.3, D - 0.08, D));
    bag.add('wood_dark', R(um - 0.04, um + 0.04, yo + 0.4, yo + 1.95, D - 0.08, D));
    bag.add('lattice', R(a + 0.08, b - 0.08, yo + 1.95, yo + 2.3, D - 0.05, D - 0.01));
    bag.add('wood_dark', R(a - 0.12, b + 0.12, yo + 2.3, yo + 2.44, 0, D + 0.16));
  }
  if (el.simple) return;
  // the door's stone frame and the bench beside it
  bag.add('limestone_yellow', R(du - 0.28, du, y + 0.35, y + 2.35, 0, 0.1)); bag.add('limestone_yellow', R(du + 1.0, du + 1.28, y + 0.35, y + 2.35, 0, 0.1));
  const left = du > 1.8, bu = left ? du - 1.75 : du + 1.35;
  if (left || L - (du + 1.28) > 1.6) { bag.add('limestone_yellow', R(bu, bu + 1.4, y + 0.35, y + 0.75, 0, 0.5)); bag.add('limestone_yellow', R(bu - 0.04, bu + 1.44, y + 0.75, y + 0.82, 0, 0.55)); }
  // the malqaf: a hood on the roof, its mouth to the north
  if (r2() < 0.32 && x1 - x0 > 4 && z1 - z0 > 4) {
    const mx = (x0 + x1) / 2 + (r2() - 0.5) * (x1 - x0 - 3), m0 = z0 + 0.3, m1 = z0 + 1.3, yt = y + H + 1.6, t = [];
    bag.add('plaster', box(mx - 0.75, y + H, m0 + 0.12, mx + 0.75, yt, m1));
    for (const s2 of [-1, 1]) bag.add('plaster', box(mx + s2 * 0.75 - (s2 > 0 ? 0.12 : 0), y + H, m0, mx + s2 * 0.75 + (s2 < 0 ? 0.12 : 0), yt, m0 + 0.12));
    bag.add('opening', box(mx - 0.63, y + H + 0.9, m0 + 0.1, mx + 0.63, yt - 0.05, m0 + 0.12));
    const P = [[mx - 0.75, yt, m0], [mx + 0.75, yt, m0], [mx + 0.75, yt, m1], [mx - 0.75, yt, m1], [mx - 0.75, yt + 0.7, m0], [mx + 0.75, yt + 0.7, m0]];
    t.push(...P[0], ...P[4], ...P[5], ...P[0], ...P[5], ...P[1], ...P[4], ...P[3], ...P[2], ...P[4], ...P[2], ...P[5], ...P[0], ...P[3], ...P[4], ...P[1], ...P[5], ...P[2]);
    bag.add('reed_mat', dbl(t));
  }
}
/**
 * sabil_kuttab: { rect, y, corner ([sx, sz]: the street corner's side, ±1 each) } — the corner building of a
 * public fountain below and a school above (docs/settlements/mamluk-cairo.md §5): the sabil room's great
 * windows on the two street faces with bronze grilles in marble frames and a marble ledge under each, an
 * engaged column at the corner, joggled voussoirs over the windows; above, the kuttab's loggia of arches
 * on marble columns with a wooden balustrade, shaded by a wide wooden awning on brackets; the crest.
 */
function sabilKuttab(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, [sx, sz] = el.corner, h1 = 5.4, h2 = 4.4, dep = 1.7;
  const fx = sx > 0 ? 'e' : 'w', fz = sz > 0 ? 's' : 'n', faces = [fx, fz];
  bag.add(S, box(x0, y - 0.6, z0, x1, y + h1, z1)); col.rect(el.rect, y, y + h1);
  // the kuttab's room, set back from the two street faces behind the loggia
  const kr = [sx > 0 ? x0 : x0 + dep, sz > 0 ? z0 : z0 + dep, sx > 0 ? x1 - dep : x1, sz > 0 ? z1 - dep : z1];
  bag.add(S, box(kr[0], y + h1, kr[1], kr[2], y + h1 + h2, kr[3]));
  bag.add('marble_floor', box(x0, y + h1, z0, x1, y + h1 + 0.04, z1));
  for (const f of faces) {
    const R = faceFrame(el.rect, f), L = f === 'n' || f === 's' ? x1 - x0 : z1 - z0;
    const atCorner = (f === 'e' || f === 'w') ? (sz > 0 ? L : 0) : (sx > 0 ? L : 0), m = L / 2;
    // courses of dark stone in the lower wall, the sabil's window with its grille, ledge and voussoirs
    for (const yy of [y + 0.6, y + 4.2]) bag.add('marble_dark', R(0, L, yy, yy + 0.18, 0, 0.03));
    bag.add('opening', R(m - 1.0, m + 1.0, y + 1.1, y + 3.6, -0.02, 0.03));
    bag.add('marble_smooth', R(m - 1.25, m - 1.0, y + 0.95, y + 3.85, 0, 0.12)); bag.add('marble_smooth', R(m + 1.0, m + 1.25, y + 0.95, y + 3.85, 0, 0.12));
    bag.add('marble_smooth', R(m - 1.25, m + 1.25, y + 3.6, y + 3.85, 0, 0.12));
    bag.add('marble_smooth', R(m - 1.15, m + 1.15, y + 0.8, y + 0.95, 0, 0.45)); bag.add('marble_smooth', R(m - 1.0, m + 1.0, y + 0.45, y + 0.8, 0, 0.3));
    for (let g = 0; g <= 8; g++) bag.add('bronze', R(m - 1.0 + g * 0.25 - 0.025, m - 1.0 + g * 0.25 + 0.025, y + 1.1, y + 3.6, 0.03, 0.08));
    for (let g = 1; g < 5; g++) bag.add('bronze', R(m - 1.0, m + 1.0, y + 1.1 + g * 0.5 - 0.025, y + 1.1 + g * 0.5 + 0.025, 0.03, 0.08));
    for (let k = 0; k < 9; k++) bag.add(k % 2 ? 'marble_smooth' : 'marble_dark', R(m - 1.25 + k * 2.5 / 9, m - 1.25 + (k + 1) * 2.5 / 9, y + 3.85, y + 4.2, 0, 0.1));
    // the loggia: piers at the ends, marble columns between, keel-headed arches, the balustrade, the awning on brackets
    const yl = y + h1, ya = yl + 2.9, n = 2;
    for (const u of [0, L]) bag.add(S, R(u === 0 ? 0 : L - 0.6, u === 0 ? 0.6 : L, yl, yl + h2, u === atCorner ? -0.6 : -dep, 0));
    const colU = []; for (let i = 1; i < n; i++) colU.push(i * L / n);
    for (const u of colU) { const g = R(u - 0.17, u + 0.17, yl, yl + 0.01, -0.37, -0.03), P = g.attributes.position.array; let cxq = 0, czq = 0; for (let k = 0; k < P.length; k += 3) { cxq += P[k]; czq += P[k + 2]; } cxq /= P.length / 3; czq /= P.length / 3; bag.add('marble_column', lathe([[0.18, 0], [0.18, 0.15], [0.13, 0.25], [0.12, ya - yl - 0.45], [0.2, ya - yl - 0.25], [0.2, ya - yl]], 10, null, cxq, yl, czq)); }
    // the arch wall over the columns: posts down to the capitals, keel heads stepped in, the frieze
    const posts = [[0.6, 0.6], ...colU.map((u) => [u - 0.2, u + 0.2]), [L - 0.6, L - 0.6]];
    for (let i = 0; i + 1 < posts.length; i++) {
      const u0 = posts[i][1], u1 = posts[i + 1][0], w = u1 - u0;
      for (let k = 0; k < 5; k++) { const inset = w / 2 * (k + 1) / 6; bag.add(S, R(u0, u0 + inset, ya + k * 0.22, ya + (k + 1) * 0.22, -0.4, 0)); bag.add(S, R(u1 - inset, u1, ya + k * 0.22, ya + (k + 1) * 0.22, -0.4, 0)); }
    }
    for (const [p0, p1] of posts) if (p1 > p0) bag.add(S, R(p0, p1, ya, ya + 1.1, -0.4, 0));
    bag.add(S, R(0, L, ya + 1.1, yl + h2, -0.4, 0));
    for (let i = 0; i + 1 < posts.length; i++) { const u0 = posts[i][1], u1 = posts[i + 1][0]; bag.add('koshi', R(u0, u1, yl, yl + 1.0, -0.25, -0.2)); bag.add('wood_dark', R(u0, u1, yl + 1.0, yl + 1.08, -0.28, -0.17)); }
    for (let u = 0.3; u < L; u += 0.9) for (let k = 0; k < 3; k++) bag.add('wood_dark', R(u - 0.06, u + 0.06, yl + h2 - 0.6 + k * 0.2, yl + h2 - 0.4 + k * 0.2, 0, 0.45 * (k + 1)));
    bag.add('wood_painted', R(-(atCorner === 0 ? 1.4 : 0), L + (atCorner === L ? 1.4 : 0), yl + h2, yl + h2 + 0.14, 0, 1.4));
    bag.add('wood_dark', R(-(atCorner === 0 ? 1.4 : 0), L + (atCorner === L ? 1.4 : 0), yl + h2 + 0.14, yl + h2 + 0.3, 1.25, 1.4));
    // the loggia's back: the kuttab's door and windows
    const back = (u0, u1, ya2, yb2, m2) => bag.add(m2, R(u0, u1, ya2, yb2, -dep - 0.03, -dep + 0.02));
    back(m - 0.6, m + 0.6, yl + 0.04, yl + 2.3, 'opening');
  }
  bag.add(S, box(x0, y + h1 + h2, z0, x1, y + h1 + h2 + 0.5, z1));
  for (let u = x0 + 0.4; u < x1 - 0.3; u += 1.1) for (const zz of [z0, z1 - 0.4]) bag.add(S, box(u, y + h1 + h2 + 0.5, zz, u + 0.6, y + h1 + h2 + 1.2, zz + 0.4));
  for (let u = z0 + 1.5; u < z1 - 1.4; u += 1.1) for (const xx of [x0, x1 - 0.4]) bag.add(S, box(xx, y + h1 + h2 + 0.5, u, xx + 0.4, y + h1 + h2 + 1.2, u + 0.6));
  // the engaged column at the street corner
  const ccx = sx > 0 ? x1 : x0, ccz = sz > 0 ? z1 : z0;
  bag.add('marble_column', lathe([[0.26, 0], [0.26, 0.3], [0.2, 0.45], [0.2, h1 - 0.6], [0.28, h1 - 0.4], [0.28, h1 - 0.05]], 12, null, ccx, y, ccz));
}

registerStyle('mamluk', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, mamluk_minaret: minaret, mamluk_dome: dome, madrasa_block: block, citadel_wall: citadelWall, road_wall: roadWall, nasir_minaret: nasirMinaret, suq_covered: suqCovered, cairo_front: cairoFront, sabil_kuttab: sabilKuttab, cairo_qaa: cairoQaa, bayn_front: baynFront, bayn_bed: baynBed, cairo_wikala: cairoWikala, cairo_hammam: cairoHammam, cairo_shop: cairoShop, sharbat_stall: sharbatStall },
  objects: {},
});
