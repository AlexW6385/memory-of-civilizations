// Florentine Gothic and early Renaissance (14th–15th c.; docs/settlements/florence.md §4): the
// cathedral of white, green and pink marble — the nave, the three apses round the octagonal crossing,
// the drum and Brunelleschi's ribbed dome of red tile with its marble lantern; the campanile; the
// octagonal Baptistery; the Palazzo della Signoria's rusticated block, gallery and tower; palaces
// with cornices; tiled roofs; houses of plaster and stone.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';
import { palazzo, loggia, ponteVecchio } from './signoria.js';
import { baptistery } from './baptistery.js';
import { orsanmichele } from './orsanmichele.js';
import { palazzoMedici } from './medici.js';
import { mercato } from './mercato.js';
import { novella } from './novella.js';
import { bottega, tintoria, tiratoio } from './craft.js';
import { casa } from './casa.js';

const M = 'marble', G = 'verde_antico', R = 'roof_tile', ST = 'limestone_yellow';
const oct = (bag, mat, cx, y, cz, r, h) => bag.add(mat, lathe([[r, 0], [r, h], [0.001, h]], 8, null, cx, y, cz));


/**
 * The Florentine marble skin on a wall from a to b (outward normal to the right of a→b): green
 * pilaster strips, green bands at the storeys, white fields framed in green with pink inner panels,
 * tall pointed windows with white mullions in some bays — the cathedral's, campanile's and
 * Baptistery's manner.
 */
function inlay(bag, a, b, y0, y1, { pitch = 4.2, bands = 3, windows = 0, pink = true } = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz, nz = -ux;
  const at = (u, d) => [a[0] + ux * u + nx * d, a[1] + uz * u + nz * d];
  const strip = (mat, u0, u1, v0, v1, d) => bag.add(mat, orientedBox(at(u0, d), at(u1, d), 0.05, v0, v1));
  const n = Math.max(1, Math.round(L / pitch)), p = L / n, h = (y1 - y0) / bands;
  for (let i = 0; i <= n; i++) strip(G, i * p - 0.3, i * p + 0.3, y0, y1, 0.04);
  for (let k = 0; k <= bands; k++) strip(G, 0, L, y0 + k * h - 0.25, y0 + k * h + 0.25, 0.05);
  for (let i = 0; i < n; i++) for (let k = 0; k < bands; k++) {
    const u0 = i * p + 0.3, u1 = (i + 1) * p - 0.3, v0 = y0 + k * h + 0.25, v1 = y0 + (k + 1) * h - 0.25, m = 0.35;
    const win = windows && k === bands - 2 + (bands > 2 ? 0 : 1) && i % windows === 1 % windows;
    if (win) {
      const c = (u0 + u1) / 2, w = Math.min(1.6, (u1 - u0) * 0.4), wh = (v1 - v0) * 0.85;
      strip(M, c - w / 2 - 0.3, c + w / 2 + 0.3, v0 + 0.2, v0 + wh + 0.5, 0.06);
      strip('stained_glass', c - w / 2, c + w / 2, v0 + 0.4, v0 + wh, 0.08);
      strip(M, c - 0.06, c + 0.06, v0 + 0.4, v0 + wh, 0.1);
      strip(G, c - w / 2 - 0.35, c + w / 2 + 0.35, v0 + wh + 0.2, v0 + wh + 0.45, 0.09);
      continue;
    }
    // a green frame and, inside, a pink (or green) panel
    strip(G, u0 + m, u1 - m, v0 + m, v0 + m + 0.12, 0.06); strip(G, u0 + m, u1 - m, v1 - m - 0.12, v1 - m, 0.06);
    strip(G, u0 + m, u0 + m + 0.12, v0 + m, v1 - m, 0.06); strip(G, u1 - m - 0.12, u1 - m, v0 + m, v1 - m, 0.06);
    if (pink && (u1 - u0) > 2) strip((i + k) % 2 ? 'marble_pink' : G, u0 + m + 0.6, u1 - m - 0.6, v0 + m + 0.6, v1 - m - 0.6, 0.055);
  }
}
/**
 * duomo: { c (the crossing), nave (length west), w, h (nave), d (dome diameter), y, interior } — the
 * church faces west. The crossing is an octagon with a face toward the nave and each apse.
 * interior: the church hollow as it stood in 1480 (docs/settlements/florence.md §4): the nave of four
 * great bays on composite piers of pietra serena, pointed arcades to the aisles, quadripartite rib
 * vaults, the walkway (ballatoio) on corbels at the springing, round windows of stained glass in the
 * clerestory and lancets in the aisles; the brick floor; the central west door open, Uccello's
 * clock over it; under the dome the octagonal wooden choir round the high altar; the three
 * tribunes with their chapels; the drum's eight round windows and the inner shell of the dome,
 * white between its ribs, open to the lantern.
 */
function duomo(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.nave ?? 90, W = el.w ?? 40, H = el.h ?? 40, D = el.d ?? 45, y = el.y ?? 0, R0 = D / 2, IN = !!el.interior;
  const nave = [cx - L - R0, cz - W / 2, cx - R0, cz + W / 2];
  // a bag that turns what is added by π/8 about a centre (the octagons' lathes have a corner at angle 0; ours a face)
  const turned = (ox, oz) => ({ add: (m, g) => bag.add(m, g.translate(-ox, 0, -oz).rotateY(Math.PI / 8).translate(ox, 0, oz)) });
  const TB = turned(cx, cz);
  if (!IN) { bag.add(M, box(nave[0], y - 0.5, nave[1], nave[2], y + H * 0.7, nave[3])); col.rect(nave, y, y + H * 0.7); bag.add(M, box(nave[0], y + H * 0.7, cz - W * 0.25, nave[2], y + H, cz + W * 0.25)); }
  else naveHollow(bag, col, nave, cx, cz, y, H, W);
  bag.add(R, frustum([nave[0], cz - W * 0.27, nave[2], cz + W * 0.27], y + H, y + H + W * 0.15, 0, 0, W * 0.26, W * 0.26));
  for (const s of [-1, 1]) bag.add(R, frustum([nave[0], s < 0 ? nave[1] : cz + W * 0.25, nave[2], s < 0 ? cz - W * 0.25 : nave[3]], y + H * 0.7, y + H * 0.76, 0, 0, s < 0 ? 0 : W * 0.24, s < 0 ? W * 0.24 : 0));
  // the marble skin of the aisles' walls (north and south), with the tall windows of the bays
  inlay(bag, [nave[0], nave[1]], [nave[2], nave[1]], y, y + H * 0.7, { pitch: 4.4, bands: 3, windows: 2 });
  inlay(bag, [nave[2], nave[3]], [nave[0], nave[3]], y, y + H * 0.7, { pitch: 4.4, bands: 3, windows: 2 });
  inlay(bag, [nave[0], cz - W * 0.25], [nave[2], cz - W * 0.25], y + H * 0.7 + 0.3, y + H, { pitch: 4.4, bands: 1, pink: false });
  inlay(bag, [nave[2], cz + W * 0.25], [nave[0], cz + W * 0.25], y + H * 0.7 + 0.3, y + H, { pitch: 4.4, bands: 1, pink: false });
  // the west front (as it stood in 1480: Arnolfo's lower third in marble with its three portals and niches, the rough wall above);
  // with the interior, the central portal goes through
  const pw = 4.6, ph = pw * 2.1, cut = (x0, x1, mat, y1) => {
    if (!IN) { bag.add(mat, box(x0, y - 0.5, nave[1] - (mat === M ? 0.4 : 0), x1, y1, nave[3] + (mat === M ? 0.4 : 0))); return; }
    const z0 = nave[1] - (mat === M ? 0.4 : 0), z1 = nave[3] + (mat === M ? 0.4 : 0);
    bag.add(mat, box(x0, y - 0.5, z0, x1, y1, cz - pw / 2)); bag.add(mat, box(x0, y - 0.5, cz + pw / 2, x1, y1, z1)); bag.add(mat, box(x0, y + ph, cz - pw / 2, x1, y1, cz + pw / 2));
  };
  // the unfinished upper front of 1480: rough courses of stone and brick with the putlog holes of the old scaffolding, the nave's gable
  // stepped and ragged at its top, a corner strip of pietra serena at each edge; the aisles' part stops at the aisle roof
  cut(nave[0] - 1.5, nave[0], 'sandstone', y + H * 0.74);
  roughFront(bag, nave, cz, y, H, W);
  cut(nave[0] - 1.9, nave[0] - 1.45, M, y + H * 0.38);
  inlay(bag, [nave[0] - 1.9, nave[3] + 0.4], [nave[0] - 1.9, nave[1] - 0.4], y, y + H * 0.38, { pitch: 4.6, bands: 2, pink: true });
  for (const [k, w] of [[-W * 0.3, 3.2], [0, pw], [W * 0.3, 3.2]]) {
    if (IN && k === 0) {
      for (const sg of [-1, 1]) bag.add(M, box(nave[0] - 2.7, y - 0.3, cz + sg * (w / 2 + 0.9) - (sg > 0 ? 0.9 : 0), nave[0] - 1.8, y + w * 2.4 + 1.2, cz + sg * (w / 2 + 0.9) + (sg < 0 ? 0.9 : 0)));
      bag.add(M, box(nave[0] - 2.7, y + w * 2.1, cz - w / 2, nave[0] - 1.8, y + w * 2.4 + 1.2, cz + w / 2));
      for (const sg of [-1, 1]) bag.add('wood_dark', box(nave[0] - 0.1, y, cz + sg * w / 2 - (sg > 0 ? 0.12 : 0), nave[0] + 2.3, y + w * 2.05, cz + sg * w / 2 + (sg < 0 ? 0.12 : 0)));
      bag.add('cotto_floor', box(nave[0] - 2.7, y - 0.3, cz - w / 2, nave[0] + 2.5, y + 0.05, cz + w / 2)); col.floor([nave[0] - 2.7, cz - w / 2, nave[0] + 2.5, cz + w / 2], y + 0.05);
    } else {
      bag.add(M, box(nave[0] - 2.7, y - 0.3, cz + k - w / 2 - 0.9, nave[0] - 1.8, y + w * 2.4 + 1.2, cz + k + w / 2 + 0.9));
      bag.add('opening', box(nave[0] - 2.75, y, cz + k - w / 2, nave[0] - 2.65, y + w * 2.1, cz + k + w / 2));
    }
    bag.add(G, box(nave[0] - 2.8, y + w * 2.1 + 0.2, cz + k - w / 2 - 0.6, nave[0] - 2.65, y + w * 2.1 + 0.6, cz + k + w / 2 + 0.6));
  }
  for (let i = 0; i < 6; i++) { const zz = cz - W * 0.45 + i * W * 0.18; if (Math.abs(zz - cz) < 4 || Math.abs(Math.abs(zz - cz) - W * 0.3) < 2.6) continue; bag.add(M, box(nave[0] - 2.4, y + H * 0.2, zz - 0.9, nave[0] - 1.85, y + H * 0.33, zz + 0.9)); bag.add('opening', box(nave[0] - 2.45, y + H * 0.21, zz - 0.6, nave[0] - 2.38, y + H * 0.32, zz + 0.6)); bag.add('marble', lathe([[0.35, 0], [0.3, 1.4], [0.18, 1.6], [0.001, 1.9]], 8, null, nave[0] - 2.1, y + H * 0.21, zz)); }
  // the crossing: the octagon and three apses with their small domes
  const apses = [[cx + R0 + 9, cz, 0], [cx, cz - R0 - 9, -Math.PI / 2], [cx, cz + R0 + 9, Math.PI / 2]];
  if (!IN) { oct(TB, M, cx, y - 0.5, cz, R0 + 2, H + 0.5); col.circle(cx, cz, R0 + 2, y, y + H); }
  const octInlay = (b2, ox, oz, r, y0, y1, o, skip) => { for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; if (skip && skip((a0 + a1) / 2)) continue; inlay(b2, [ox + Math.cos(a0) * r * 0.99, oz + Math.sin(a0) * r * 0.99], [ox + Math.cos(a1) * r * 0.99, oz + Math.sin(a1) * r * 0.99], y0, y1, o); } };
  // (with the interior, not on the tribune's open side toward the crossing: the face's centre after the π/8 turn, against the crossing's direction)
  const openSide = (ax, az) => (am) => { if (!IN) return false; const dx = Math.cos(am), dz = Math.sin(am), c = Math.cos(Math.PI / 8), sn = Math.sin(Math.PI / 8), tx = dx * c + dz * sn, tz = -dx * sn + dz * c, toC = Math.atan2(cz - az, cx - ax); return Math.abs(Math.atan2(Math.sin(Math.atan2(tz, tx) - toC), Math.cos(Math.atan2(tz, tx) - toC))) < Math.PI * 0.3; };
  for (const [ax, az] of apses) octInlay(turned(ax, az), ax, az, 11, y, y + H * 0.75, { pitch: 4, bands: 3, windows: 2 }, openSide(ax, az));
  octInlay(TB, cx, cz, R0 + 1.5, y + H, y + H + 13, { pitch: 6, bands: 1, pink: false });
  for (const [ax, az] of apses) { const AB = turned(ax, az); if (!IN) { oct(AB, M, ax, y - 0.5, az, 11, H * 0.75); col.circle(ax, az, 11, y, y + H * 0.75); } AB.add(R, lathe([[11.5, 0], [6, 4], [0.001, 6]], 8, null, ax, y + H * 0.75, az)); }
  // the drum with its round windows, the dome in eight ribbed sails, the lantern
  const dy = y + H + 4;
  if (!IN) oct(TB, M, cx, y + H, cz, R0 + 1.5, 13);
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; TB.add('opening', box(cx + Math.cos(a) * (R0 + 1.55) - 1.5, dy + 3, cz + Math.sin(a) * (R0 + 1.55) - 1.5, cx + Math.cos(a) * (R0 + 1.55) + 1.5, dy + 6, cz + Math.sin(a) * (R0 + 1.55) + 1.5)); }
  const dome = [[R0 + 1, 0], [R0 + 0.6, R0 * 0.35], [R0 * 0.92, R0 * 0.62], [R0 * 0.72, R0 * 0.88], [R0 * 0.42, R0 * 1.08], [R0 * 0.16, R0 * 1.18]];
  TB.add(R, lathe(dome, 8, null, cx, y + H + 13, cz));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; for (let i = 0; i + 1 < dome.length; i++) { const [r0, h0] = dome[i], [r1, h1] = dome[i + 1]; const g = box(-0.7, 0, -0.7, 0.7, Math.hypot(r1 - r0, h1 - h0) + 0.3, 0.7); g.rotateZ(Math.atan2(r0 - r1, h1 - h0)); g.translate(r0 + 0.2, h0, 0); g.rotateY(-a); g.translate(cx, y + H + 13, cz); TB.add(M, g); } }
  const ly = y + H + 13 + R0 * 1.18;
  oct(TB, M, cx, ly, cz, R0 * 0.18, 9); TB.add(M, lathe([[R0 * 0.2, 0], [0.4, 7], [0.001, 8]], 8, null, cx, ly + 9, cz));
  bag.add('gilt_bronze', lathe([[0.9, 0], [0.9, 0.3], [0.001, 1.8]], 12, null, cx, ly + 17, cz));
  if (IN) crossingHollow(bag, col, cx, cz, y, H, R0, apses);
}

/** The cathedral's unfinished west front above Arnolfo's marble (1480): the nave's wall in rough stone, brick patches, putlog holes and timber stubs, a ragged top, the round window framed. */
function roughFront(bag, nave, cz, y, H, W) {
  const xf = nave[0] - 1.5, hw = W * 0.25, top = y + H * 1.05;
  const rng = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), r = rng(1296);
  // the nave's gable wall above the aisle roofs
  bag.add('sandstone', box(xf - 0.12, y + H * 0.74, cz - hw, nave[0], top - 3, cz + hw));
  for (let i = 0; i < 9; i++) { const z0 = cz - hw + i * (2 * hw / 9), h = 1 + Math.floor(r() * 4) * 0.9; bag.add('sandstone', box(xf - 0.12, top - 3, z0, nave[0], top - 3 + h, z0 + 2 * hw / 9 - 0.05 + r() * 0.1)); }
  // brick patches where the facing was begun, then left (rough brick, not yet clad)
  for (let i = 0; i < 7; i++) { const w = 2.5 + r() * 3.5, h = 1.8 + r() * 3.2, z = cz - hw + 0.8 + r() * (2 * hw - w - 1.6), yy = y + H * 0.4 + r() * (H * 0.55 - h); bag.add('brick', box(xf - 0.2, yy, z, xf - 0.1, yy + h, z + w)); }
  // putlog holes and the stubs of beams, in rows; the holes dark, a stub in some
  for (let row = 0; row < 8; row++) for (let k = 0; k < 8; k++) {
    const yy = y + H * 0.42 + row * 2.6 + (k % 2) * 1.3, z = cz - hw + 1.4 + k * ((2 * hw - 2.8) / 7) + (r() - 0.5) * 0.8;
    if (yy > top - 2.2) continue;
    if (r() < 0.35) bag.add('timber', box(xf - 0.75, yy, z, xf - 0.1, yy + 0.22, z + 0.22)); else bag.add('opening', box(xf - 0.2, yy, z, xf - 0.05, yy + 0.26, z + 0.26));
  }
  // the edges and the sloping lines of the gable in dressed stone; the string above the marble
  for (const s of [-1, 1]) bag.add('pietra_serena', box(xf - 0.3, y + H * 0.38, cz + s * hw - (s > 0 ? 0.7 : 0), nave[0], top, cz + s * hw + (s < 0 ? 0.7 : 0)));
  bag.add('pietra_serena', box(xf - 0.35, y + H * 0.38 - 0.1, nave[1], nave[0], y + H * 0.38 + 0.5, nave[3]));
  bag.add('pietra_serena', box(xf - 0.3, top - 0.1, cz - hw, nave[0], top + 0.4, cz + hw));
  // the great round window: glass lit inside, ringed in marble with eight spokes, set in the wall's middle
  const wy = y + H * 0.74 - 2, rr = 3.6, wx = xf - 0.2;
  const g = disc(rr, 0, 24); g.rotateZ(-Math.PI / 2); bag.add('opening', g.translate(wx + 0.05, wy, cz));
  const g2 = disc(rr - 0.5, 0, 24); g2.rotateZ(Math.PI / 2); bag.add('stained_glass', g2.translate(wx - 0.02, wy, cz));
  for (let k = 0; k < 24; k++) { const a0 = k / 24 * Math.PI * 2, a1 = (k + 1) / 24 * Math.PI * 2; bag.add('marble', rod([wx - 0.05, wy + Math.cos(a0) * rr, cz + Math.sin(a0) * rr], [wx - 0.05, wy + Math.cos(a1) * rr, cz + Math.sin(a1) * rr], 0.3, 5)); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; bag.add('marble', rod([wx - 0.05, wy, cz], [wx - 0.05, wy + Math.cos(a) * rr, cz + Math.sin(a) * rr], 0.12, 4)); }
}

/** A wall a→b of thickness th from y0 to y1, with a pointed arch { w, spring, rise, pass } cut in its middle (pass: open; else a niche `depth` deep, closed by `back`). */
function archWall(bag, col, mat, a, b, th, y0, y1, ar) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const P = (u, o, yy) => [a[0] + ux * u + nx * o, yy, a[1] + uz * u + nz * o];
  const seg = (u0, u1, ya, yb) => { if (u1 - u0 < 0.01 || yb - ya < 0.01) return; const p0 = P(u0, 0, 0), p1 = P(u1, 0, 0); bag.add(mat, orientedBox([p0[0], p0[2]], [p1[0], p1[2]], th, ya, yb)); col.segment([p0[0], p0[2]], [p1[0], p1[2]], th, ya, yb); };
  if (!ar) { seg(0, L, y0, y1); return; }
  const m = L / 2, w = ar.w, ys = y0 + ar.spring, rise = ar.rise, apex = ys + rise, r = (rise * rise + w * w / 4) / w, N = 10;
  seg(0, m - w / 2, y0, y1); seg(m + w / 2, L, y0, y1);
  if (y1 > apex) seg(m - w / 2, m + w / 2, apex, y1);
  // the arch's curve: two arcs, centred on the springing line
  const prof = []; for (let k = 0; k <= N; k++) { const u = -w / 2 + (w / 2) * k / N; prof.push([u, ys + Math.sqrt(Math.max(0, r * r - (u - (-w / 2 + r)) ** 2))]); }
  const curve = prof.concat(prof.slice(0, -1).reverse().map(([u, yy]) => [-u, yy]));
  const T = [], I = [];
  for (let k = 0; k + 1 < curve.length; k++) {
    const [u0, v0] = curve[k], [u1, v1] = curve[k + 1];
    for (const o of [-th / 2, th / 2]) T.push(...P(m + u0, o, v0), ...P(m + u1, o, v1), ...P(m + u1, o, apex), ...P(m + u0, o, v0), ...P(m + u1, o, apex), ...P(m + u0, o, apex));
    I.push(...P(m + u0, -th / 2, v0), ...P(m + u1, -th / 2, v1), ...P(m + u1, th / 2, v1), ...P(m + u0, -th / 2, v0), ...P(m + u1, th / 2, v1), ...P(m + u0, th / 2, v0));
  }
  for (const s2 of [-1, 1]) { const q0 = P(m + s2 * w / 2, -th / 2, 0), q1 = P(m + s2 * w / 2, th / 2, 0); I.push(q0[0], y0, q0[2], q1[0], y0, q1[2], q1[0], ys, q1[2], q0[0], y0, q0[2], q1[0], ys, q1[2], q0[0], ys, q0[2]); }
  bag.add(mat, dbl(T)); bag.add(ar.soffit || mat, dbl(I));
  if (!ar.pass) { const p0 = P(m - w / 2, 0, 0), p1 = P(m + w / 2, 0, 0); bag.add(ar.back || mat, orientedBox([p0[0], p0[2]], [p1[0], p1[2]], 0.1, y0, apex)); col.segment([p0[0], p0[2]], [p1[0], p1[2]], th, y0, apex); }
  else col.segment(P(m - w / 2, 0, 0).filter((_, i) => i !== 1), P(m + w / 2, 0, 0).filter((_, i) => i !== 1), th, apex, y1);
}
const dbl = (t) => { const f = []; for (let i = 0; i < t.length; i += 9) f.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return fromTriangles(t.concat(f)); };
/** The pointed profile 0…1 over s = |2t − 1| (1 at the crown). */
const pointed = (s, r = 1.35) => Math.sqrt(Math.max(0, r * r - (s - 1 + r) ** 2)) / Math.sqrt(2 * r - 1);

/** A quadripartite rib vault over [x0, z0, x1, z1] springing at ys: two pointed barrels crossing (the higher wins, so the groins run down the diagonals), rx the rise of the arches spanning along x (the wall arches on the long sides), rz of those spanning along z; white cells, ribs of pietra serena. */
function ribVault(bag, x0, z0, x1, z1, ys, rx, rz) {
  const N = 14, h = (x, z) => { const sx = Math.abs(2 * (x - x0) / (x1 - x0) - 1), sz = Math.abs(2 * (z - z0) / (z1 - z0) - 1); return ys + Math.max(rz * pointed(sz), rx * pointed(sx)); };
  const t = [], V = (i, j) => { const x = x0 + (x1 - x0) * i / N, z = z0 + (z1 - z0) * j / N; return [x, h(x, z), z]; };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) t.push(...V(i, j), ...V(i + 1, j), ...V(i + 1, j + 1), ...V(i, j), ...V(i + 1, j + 1), ...V(i, j + 1));
  bag.add('stucco', dbl(t));
  for (const [ia, ja, ib, jb] of [[0, 0, 1, 1], [0, 1, 1, 0]]) for (let k = 0; k < N; k++) { const f0 = k / N, f1 = (k + 1) / N; const p0 = [x0 + (x1 - x0) * (ia + (ib - ia) * f0), 0, z0 + (z1 - z0) * (ja + (jb - ja) * f0)], p1 = [x0 + (x1 - x0) * (ia + (ib - ia) * f1), 0, z0 + (z1 - z0) * (ja + (jb - ja) * f1)]; p0[1] = h(p0[0], p0[2]) - 0.15; p1[1] = h(p1[0], p1[2]) - 0.15; bag.add('pietra_serena', rod(p0, p1, 0.2, 5)); }
  for (const z of [z0 + 0.05, z1 - 0.05]) for (let k = 0; k < N; k++) { const xa = x0 + (x1 - x0) * k / N, xb = x0 + (x1 - x0) * (k + 1) / N; bag.add('pietra_serena', rod([xa, h(xa, z0 + (z1 - z0) / 2) * 0 + ys + rx * pointed(Math.abs(2 * (xa - x0) / (x1 - x0) - 1)) - 0.2, z], [xb, ys + rx * pointed(Math.abs(2 * (xb - x0) / (x1 - x0) - 1)) - 0.2, z], 0.22, 5)); }
  for (const x of [x0 + 0.05, x1 - 0.05]) for (let k = 0; k < N; k++) { const za = z0 + (z1 - z0) * k / N, zb = z0 + (z1 - z0) * (k + 1) / N; bag.add('pietra_serena', rod([x, ys + rz * pointed(Math.abs(2 * (za - z0) / (z1 - z0) - 1)) - 0.2, za], [x, ys + rz * pointed(Math.abs(2 * (zb - z0) / (z1 - z0) - 1)) - 0.2, zb], 0.22, 5)); }
}

/** The nave hollow: the outer walls, the arcades on composite piers, the clerestory with its round windows, the vaults, the walkway, the floor, the clock. */
function naveHollow(bag, col, nave, cx, cz, y, H, W) {
  const [x0, z0, x1, z1] = nave, T = 2.5, hA = H * 0.7, zp = W * 0.25 - 0.75, PS = 'pietra_serena';
  const xa = x0 + T, xb = x1, nb = 4, bay = (xb - xa) / nb;
  // the outer walls (the west one with the central door)
  for (const [r, yb] of [[[x0, z0, x1, z0 + T], hA], [[x0, z1 - T, x1, z1], hA]]) { bag.add(M, box(r[0], y - 0.5, r[1], r[2], y + yb, r[3])); col.rect(r, y, y + yb); }
  for (const r of [[x0, z0 + T, xa, cz - 2.3], [x0, cz + 2.3, xa, z1 - T]]) { bag.add(M, box(r[0], y - 0.5, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); }
  bag.add(M, box(x0, y + 9.66, cz - 2.3, xa, y + H, cz + 2.3)); col.rect([x0, cz - 2.3, xa, cz + 2.3], y + 9.66, y + H);
  // the floor of brick
  bag.add('cotto_floor', box(xa, y - 0.3, z0 + T, xb + 3, y + 0.05, z1 - T)); col.floor([xa, z0 + T, xb + 3, z1 - T], y + 0.05);
  // the arcades and the clerestory above them: one wall each side at the piers' line, arched in every bay
  for (const s of [-1, 1]) {
    const zl = cz + s * zp;
    for (let i = 0; i < nb; i++) archWall(bag, col, 'stucco', [xa + i * bay, zl], [xa + (i + 1) * bay, zl], 1.5, y, y + H, { w: bay - 3.4, spring: 18, rise: 9, pass: true, soffit: PS });
    // the clerestory's round windows, glass inside and dark without, a ring of pietra serena
    for (let i = 0; i < nb; i++) {
      const x = xa + (i + 0.5) * bay, oy = y + 34.5;
      const gi = disc(1.7, 0, 20); gi.rotateX(s * Math.PI / 2); bag.add('stained_glass', gi.translate(x, oy, zl - s * 0.78));
      const go = disc(1.7, 0, 20); go.rotateX(-s * Math.PI / 2); bag.add('opening', go.translate(x, oy, zl + s * 0.8));
      for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2, a1 = (k + 1) / 20 * Math.PI * 2; bag.add(PS, rod([x + Math.cos(a0) * 1.85, oy + Math.sin(a0) * 1.85, zl - s * 0.8], [x + Math.cos(a1) * 1.85, oy + Math.sin(a1) * 1.85, zl - s * 0.8], 0.14, 5)); }
    }
    // the walkway on its corbels along the clerestory at the springing, its iron rail
    bag.add(PS, box(xa, y + 29.2, Math.min(zl - s * 0.75, zl - s * 1.75), xb, y + 29.5, Math.max(zl - s * 0.75, zl - s * 1.75)));
    for (let x = xa + 0.6; x < xb; x += 1.2) bag.add(PS, box(x - 0.15, y + 28.6, Math.min(zl - s * 0.75, zl - s * 1.6), x + 0.15, y + 29.2, Math.max(zl - s * 0.75, zl - s * 1.6)));
    bag.add('wood_dark', box(xa, y + 30.4, zl - s * 1.72 - 0.03, xb, y + 30.46, zl - s * 1.72 + 0.03));
    for (let x = xa + 0.6; x < xb; x += 1.2) bag.add('wood_dark', box(x - 0.025, y + 29.5, zl - s * 1.72 - 0.025, x + 0.025, y + 30.46, zl - s * 1.72 + 0.025));
    // the aisle's inner face: lancets where the outer skin has its windows
    const zw = s < 0 ? z0 + T + 0.02 : z1 - T - 0.02, p = (x1 - x0) / Math.round((x1 - x0) / 4.4), hb = hA / 3;
    for (let i = 1; i < Math.round((x1 - x0) / 4.4); i += 2) {
      const c = x0 + (i + 0.5) * p, ww = Math.min(1.6, (p - 0.6) * 0.4), v0 = y + hb + 0.25, wh = (hb - 0.5) * 0.85;
      if (c < xa + 1) continue;
      bag.add('stained_glass', box(c - ww / 2, v0 + 0.4, Math.min(zw, zw - s * 0.04), c + ww / 2, v0 + wh, Math.max(zw, zw - s * 0.04)));
      bag.add(PS, box(c - ww / 2 - 0.25, v0 + 0.25, Math.min(zw, zw - s * 0.1), c + ww / 2 + 0.25, v0 + 0.4, Math.max(zw, zw - s * 0.1)));
    }
  }
  // the piers: a square core with half-columns on its faces and a capital of leaves, the responds at the ends
  for (let i = 0; i <= nb; i++) for (const s of [-1, 1]) {
    const x = xa + i * bay, z = cz + s * zp, end = i === 0 || i === nb, hw = 1.7;
    bag.add(PS, box(x - (i === 0 ? 0 : hw), y, z - hw, x + (end && i === nb ? 0 : hw), y + 0.6, z + hw));
    bag.add(PS, box(x - (i === 0 ? 0 : 1.2), y + 0.6, z - 1.2, x + (i === nb ? 0 : 1.2), y + 17.2, z + 1.2));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if ((i === 0 && dx < 0) || (i === nb && dx > 0)) continue; const top = dz === -s ? y + 29 : y + 17.2; bag.add(PS, lathe([[0.55, 0], [0.55, top - y - 0.6]], 12, null, x + dx * 1.2, y + 0.6, z + dz * 1.2)); }
    bag.add(PS, frustum([x - (i === 0 ? 0 : 1.9), z - 1.9, x + (i === nb ? 0 : 1.9), z + 1.9], y + 17.2, y + 18.2, 0.4, 0.4, 0.4, 0.4));
    bag.add(PS, box(x - (i === 0 ? 0 : 2), y + 18.2, z - 2, x + (i === nb ? 0 : 2), y + 18.5, z + 2));
    col.rect([x - (i === 0 ? 0 : 1.75), z - 1.75, x + (i === nb ? 0 : 1.75), z + 1.75], y, y + 18.5);
    // the shaft on the nave side runs up to the vault's springing, under a small capital
    const pz = z - s * 1.2; bag.add(PS, frustum([x - 0.8, pz - 0.8, x + 0.8, pz + 0.8], y + 29, y + 29.8, 0.2, 0.2, 0.2, 0.2));
  }
  // the vaults: the nave's four great bays, the aisles' bays
  for (let i = 0; i < nb; i++) {
    ribVault(bag, xa + i * bay, cz - zp + 0.75, xa + (i + 1) * bay, cz + zp - 0.75, y + 30, 9, 8.2);
    for (const s of [-1, 1]) { const za = s < 0 ? z0 + T : cz + zp + 0.75, zb = s < 0 ? cz - zp - 0.75 : z1 - T; ribVault(bag, xa + i * bay, za, xa + (i + 1) * bay, zb, y + 19.5, 7.5, 5.5); }
  }
  // the west wall inside: plaster, and Uccello's clock over the door — one hand on a 24-hour dial
  bag.add('stucco', box(xa, y, cz - zp + 0.75, xa + 0.04, y + 29, cz + zp - 0.75));
  const ky = y + 21, kx = xa + 0.08;
  const dial = (r, m, dx) => { const g = disc(r, 0, 32); g.rotateZ(-Math.PI / 2); bag.add(m, g.translate(kx + dx, ky, cz)); };
  dial(3.0, 'marble_pink', 0); dial(2.55, 'verde_antico', 0.02); dial(1.0, 'gilt_bronze', 0.03);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bag.add('gilt_bronze', rod([kx + 0.04, ky + Math.cos(a) * 2.6, cz + Math.sin(a) * 2.6], [kx + 0.04, ky + Math.cos(a) * 2.9, cz + Math.sin(a) * 2.9], 0.06, 4)); }
  bag.add('gilt_bronze', rod([kx + 0.06, ky, cz], [kx + 0.06, ky - 2.2, cz + 0.9], 0.07, 4));
  for (const [dy, dz] of [[3.6, 3.6], [3.6, -3.6], [-3.6, 3.6], [-3.6, -3.6]]) bag.add('gilt_bronze', disc(0.5, 0, 12).rotateZ(-Math.PI / 2).translate(kx + 0.02, ky + dy * 0.85, cz + dz * 0.85));
}

/**
 * The crossing hollow: the octagon's walls (a great arch to the nave and to each tribune, a door on
 * the diagonals), the drum with its round windows, the inner shell of the dome, the choir and the
 * high altar; the tribunes as polygons with five chapels, each lit by a lancet, under a ribbed half-dome.
 */
function crossingHollow(bag, col, cx, cz, y, H, R0, apses) {
  const ai = R0 - 2.5, ao = (R0 + 2) * Math.cos(Math.PI / 8), th = ao - ai, am = (ai + ao) / 2, PS = 'pietra_serena';
  const V = (k, ap) => { const a = Math.PI / 8 + k * Math.PI / 4; const r = ap / Math.cos(Math.PI / 8); return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; };
  // faces: k = 0 is the east face (between corners at ±22.5°), then counter-clockwise in the maths sense (toward +z = south)
  for (let k = 0; k < 8; k++) {
    const a = V(k - 1, am), b = V(k, am), ang = k * Math.PI / 4, ax = Math.round(Math.cos(ang) * 10) / 10, az = Math.round(Math.sin(ang) * 10) / 10;
    const great = (Math.abs(ax) === 1 && az === 0) || (ax === 0 && Math.abs(az) === 1);
    archWall(bag, col, 'stucco', a, b, th, y, y + H, great ? { w: ax === -1 ? 15 : 13.5, spring: ax === -1 ? 18 : 16, rise: ax === -1 ? 12 : 10, pass: true, soffit: PS } : { w: 4, spring: 4, rise: 2.6, back: 'opening' });
    // the pietra serena: a cornice at the drum's foot and the corner pilasters
    const ai0 = V(k - 1, ai - 0.05), ai1 = V(k, ai - 0.05);
    bag.add(PS, orientedBox(ai0, ai1, 0.5, y + H - 0.8, y + H));
    const c0 = V(k, ai - 0.1); bag.add(PS, box(c0[0] - 0.8, y, c0[1] - 0.8, c0[0] + 0.8, y + H - 0.8, c0[1] + 0.8)); col.rect([c0[0] - 0.8, c0[1] - 0.8, c0[0] + 0.8, c0[1] + 0.8], y, y + H);
    // the drum: walls with a round window of stained glass in each face
    const da = V(k - 1, (ai + (R0 + 1.5) * Math.cos(Math.PI / 8)) / 2), db = V(k, (ai + (R0 + 1.5) * Math.cos(Math.PI / 8)) / 2), dth = (R0 + 1.5) * Math.cos(Math.PI / 8) - ai;
    bag.add('stucco', orientedBox(da, db, dth, y + H, y + H + 13));
    const n = [Math.cos(ang), Math.sin(ang)], oy = y + H + 8.5, gc = [cx + n[0] * (ai - 0.03), cz + n[1] * (ai - 0.03)];
    const g = disc(2.2, 0, 24); g.rotateZ(Math.PI / 2); g.rotateY(-ang + Math.PI); bag.add('stained_glass', g.translate(gc[0], oy, gc[1]));
    for (let j = 0; j < 24; j++) { const t0 = j / 24 * Math.PI * 2, t1 = (j + 1) / 24 * Math.PI * 2, ux = -n[1], uz = n[0]; bag.add(PS, rod([gc[0] + ux * Math.cos(t0) * 2.4 - n[0] * 0.05, oy + Math.sin(t0) * 2.4, gc[1] + uz * Math.cos(t0) * 2.4 - n[1] * 0.05], [gc[0] + ux * Math.cos(t1) * 2.4 - n[0] * 0.05, oy + Math.sin(t1) * 2.4, gc[1] + uz * Math.cos(t1) * 2.4 - n[1] * 0.05], 0.16, 5)); }
    const e0 = V(k - 1, ai - 0.05), e1 = V(k, ai - 0.05); bag.add(PS, orientedBox(e0, e1, 0.6, y + H + 12.4, y + H + 13));
  }
  // the inner shell: an octagonal vault, white between eight ribs, open at the top to the lantern
  const yd = y + H + 13, rv = ai / Math.cos(Math.PI / 8);
  const inner = [[rv * 0.12, 25.6], [rv * 0.38, 24.2], [rv * 0.66, 20], [rv * 0.86, 14], [rv * 0.97, 7], [rv, 0]];
  bag.add('stucco', lathe(inner, 8, null, 0, 0, 0).rotateY(Math.PI / 8).translate(cx, yd, cz));
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; for (let i = 0; i + 1 < inner.length; i++) { const [r0, h0] = inner[i], [r1, h1] = inner[i + 1]; bag.add(PS, rod([cx + Math.cos(a) * (r0 - 0.25), yd + h0 - 0.2, cz + Math.sin(a) * (r0 - 0.25)], [cx + Math.cos(a) * (r1 - 0.25), yd + h1 - 0.2, cz + Math.sin(a) * (r1 - 0.25)], 0.35, 6)); } }
  bag.add('stained_glass', disc(rv * 0.12, yd + 25.55, 16, cx, cz, false));
  bag.add(PS, lathe([[rv * 0.12, 0], [rv * 0.12 + 0.5, 0], [rv * 0.12 + 0.5, 0.5], [rv * 0.12, 0.5]], 16, null, cx, yd + 25.1, cz));
  // the floor under the dome and the tribunes
  bag.add('cotto_floor', box(cx - ai, y - 0.3, cz - ai, cx + ai, y + 0.05, cz + ai)); col.floor([cx - ai, cz - ai, cx + ai, cz + ai], y + 0.05);
  // the choir: an octagon of wooden panels between posts, open to the west, round the high altar
  const ca = 8.5, cr = ca / Math.cos(Math.PI / 8), cv = (k) => { const a = Math.PI / 8 + k * Math.PI / 4; return [cx + Math.cos(a) * cr, cz + Math.sin(a) * cr]; };
  for (let k = 0; k < 8; k++) {
    const p0 = cv(k - 1), p1 = cv(k), west = k === 4;
    bag.add('wood_dark', box(p1[0] - 0.2, y, p1[1] - 0.2, p1[0] + 0.2, y + 3.4, p1[1] + 0.2)); bag.add('gilt_bronze', lathe([[0.15, 0], [0.001, 0.5]], 6, null, p1[0], y + 3.4, p1[1]));
    if (west) { bag.add('wood_dark', orientedBox(p0, p1, 0.18, y + 2.8, y + 3.3)); continue; }
    bag.add('wood_dark', orientedBox(p0, p1, 0.14, y, y + 2.6)); col.segment(p0, p1, 0.2, y, y + 2.6);
    bag.add('wood_dark', orientedBox(p0, p1, 0.2, y + 2.6, y + 2.8)); bag.add('wood_dark', orientedBox(p0, p1, 0.2, y + 0.9, y + 1.0));
    const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); for (let j = 1; j < 4; j++) { const q = [p0[0] + (p1[0] - p0[0]) * j / 4, p0[1] + (p1[1] - p0[1]) * j / 4]; bag.add('wood_dark', box(q[0] - 0.1, y, q[1] - 0.1, q[0] + 0.1, y + 2.6, q[1] + 0.1)); } void L;
  }
  bag.add(M, box(cx + 2.2, y, cz - 1.8, cx + 4.0, y + 1.1, cz + 1.8)); bag.add('marble_pink', box(cx + 2.1, y + 1.1, cz - 1.9, cx + 4.1, y + 1.25, cz + 1.9)); col.rect([cx + 2.2, cz - 1.8, cx + 4.0, cz + 1.8], y, y + 1.25);
  bag.add('gilt_bronze', box(cx + 3.6, y + 1.25, cz - 0.05, cx + 3.7, y + 3.4, cz + 0.05)); bag.add('gilt_bronze', box(cx + 3.6, y + 2.6, cz - 0.6, cx + 3.7, y + 2.7, cz + 0.6));
  for (const sg of [-1, 1]) bag.add('gilt_bronze', lathe([[0.15, 0], [0.06, 0.1], [0.05, 0.9], [0.12, 1.0], [0.001, 1.0]], 8, null, cx + 3.1, y + 1.25, cz + sg * 1.4));
  // the tribunes
  for (const [ox, oz, dir] of apses) {
    const ia = 8.6, oa = 11 * Math.cos(Math.PI / 8), tm = (ia + oa) / 2, tt = oa - ia;
    const AV = (k, ap) => { const a = Math.PI / 8 + k * Math.PI / 4; const r = ap / Math.cos(Math.PI / 8); return [ox + Math.cos(a) * r, oz + Math.sin(a) * r]; };
    const toC = Math.atan2(cz - oz, cx - ox);
    for (let k = 0; k < 8; k++) {
      const fa = k * Math.PI / 4, dd = Math.abs(Math.atan2(Math.sin(fa - toC), Math.cos(fa - toC)));
      if (dd < Math.PI * 0.3) continue;                                     // the side toward the crossing stays open
      archWall(bag, col, 'stucco', AV(k - 1, tm), AV(k, tm), tt, y, y + H * 0.75, dd > Math.PI * 0.55 ? { w: 3.6, spring: 3.8, rise: 2.2, back: 'marble_pink' } : null);
      const n = [Math.cos(fa), Math.sin(fa)], wc = [ox + n[0] * (ia - 0.03), oz + n[1] * (ia - 0.03)], ux = -n[1], uz = n[0];
      if (dd > Math.PI * 0.55) {
        const g = []; const Pq = (u, yy) => [wc[0] + ux * u, yy, wc[1] + uz * u]; g.push(...Pq(-0.7, y + 9), ...Pq(0.7, y + 9), ...Pq(0.7, y + 17), ...Pq(-0.7, y + 9), ...Pq(0.7, y + 17), ...Pq(-0.7, y + 17), ...Pq(-0.7, y + 17), ...Pq(0.7, y + 17), ...Pq(0, y + 18.2));
        bag.add('stained_glass', dbl(g));
        const al = [wc[0] + n[0] * 0.9 - n[0] * 1.5, wc[1] + n[1] * 0.9 - n[1] * 1.5]; bag.add(M, box(al[0] - 0.8, y, al[1] - 0.8, al[0] + 0.8, y + 1.0, al[1] + 0.8)); col.rect([al[0] - 0.8, al[1] - 0.8, al[0] + 0.8, al[1] + 0.8], y, y + 1.0);
      }
      const c0 = AV(k, ia - 0.1); bag.add(PS, box(c0[0] - 0.45, y, c0[1] - 0.45, c0[0] + 0.45, y + 20.5, c0[1] + 0.45));
    }
    bag.add('cotto_floor', box(ox - ia, y - 0.3, oz - ia, ox + ia, y + 0.05, oz + ia)); col.floor([ox - ia, oz - ia, ox + ia, oz + ia], y + 0.05);
    // the neck between the crossing's wall and the tribune's open side: two walls and a ceiling, closing it to the outside
    { const ex = Math.cos(toC + Math.PI), ez = Math.sin(toC + Math.PI), lx = -ez, lz = ex;   // e: from the crossing out along the axis; l: across
      const dO = Math.hypot(ox - cx, oz - cz), d0 = ao - 0.2, d1 = dO - 11 * Math.cos(Math.PI * 0.375) + 0.9, lw = 9.6, hh = H * 0.75;
      const Pt = (d, l) => [cx + ex * d + lx * l, cz + ez * d + lz * l];
      for (const sg of [-1, 1]) { const a2 = Pt(d0, sg * (lw + tt / 2)), b2 = Pt(d1, sg * (lw + tt / 2)); bag.add('stucco', orientedBox(a2, b2, tt, y, y + hh)); bag.add(M, orientedBox(a2, b2, tt + 0.1, y + hh - 0.01, y + hh + 0.4)); col.segment(a2, b2, tt, y, y + hh); }
      const c0 = Pt(d0, -lw - tt), c1 = Pt(d1, lw + tt); bag.add('stucco', box(Math.min(c0[0], c1[0]), y + hh - 0.5, Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), y + hh, Math.max(c0[1], c1[1])));
      bag.add(R, box(Math.min(c0[0], c1[0]) - 0.3, y + hh, Math.min(c0[1], c1[1]) - 0.3, Math.max(c0[0], c1[0]) + 0.3, y + hh + 0.4, Math.max(c0[1], c1[1]) + 0.3));
      const f0 = Pt(d0, -lw), f1 = Pt(d1, lw); bag.add('cotto_floor', box(Math.min(f0[0], f1[0]), y - 0.3, Math.min(f0[1], f1[1]), Math.max(f0[0], f1[0]), y + 0.05, Math.max(f0[1], f1[1]))); col.floor([Math.min(f0[0], f1[0]), Math.min(f0[1], f1[1]), Math.max(f0[0], f1[0]), Math.max(f0[1], f1[1])], y + 0.05); }
    const rv2 = ia / Math.cos(Math.PI / 8), hv = [[0.001, 8.6], [rv2 * 0.45, 8.0], [rv2 * 0.78, 5.6], [rv2 * 0.95, 2.6], [rv2, 0]];
    bag.add('stucco', lathe(hv, 8, null, 0, 0, 0).rotateY(Math.PI / 8).translate(ox, y + 21, oz));
    for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; for (let i = 0; i + 1 < hv.length; i++) { const [r0, h0] = hv[i], [r1, h1] = hv[i + 1]; bag.add(PS, rod([ox + Math.cos(a) * r0, y + 21 + h0 - 0.15, oz + Math.sin(a) * r0], [ox + Math.cos(a) * r1, y + 21 + h1 - 0.15, oz + Math.sin(a) * r1], 0.22, 5)); } }
    bag.add(PS, lathe([[rv2 + 0.3, 0], [rv2 - 0.2, 0], [rv2 - 0.2, 0.5], [rv2 + 0.3, 0.5]], 8, null, 0, 0, 0).rotateY(Math.PI / 8).translate(ox, y + 20.5, oz));
    void dir;
  }
}
/** campanile: { c, s (side), h, y } — a square tower in white, green and pink marble, with its storeys of windows and cornice. */
function campanile(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 14.5, h = el.h ?? 84, y = el.y ?? 0, r = [x - s / 2, z - s / 2, x + s / 2, z + s / 2];
  bag.add(M, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
  // the marble skin storey by storey: the lower two in panels, the upper with their pointed windows
  const faces = [[[r[0], r[1]], [r[2], r[1]]], [[r[2], r[1]], [r[2], r[3]]], [[r[2], r[3]], [r[0], r[3]]], [[r[0], r[3]], [r[0], r[1]]]];
  for (const [a, b] of faces) { inlay(bag, a, b, y, y + h * 0.47, { pitch: s / 3, bands: 4 }); inlay(bag, a, b, y + h * 0.47, y + h, { pitch: s, bands: 3, pink: false }); }
  for (const [x0, x1, z0, z1] of [[r[0] - 0.4, r[0] + 0.6, r[1] - 0.4, r[1] + 0.6], [r[2] - 0.6, r[2] + 0.4, r[1] - 0.4, r[1] + 0.6], [r[0] - 0.4, r[0] + 0.6, r[3] - 0.6, r[3] + 0.4], [r[2] - 0.6, r[2] + 0.4, r[3] - 0.6, r[3] + 0.4]]) bag.add(M, box(x0, y, z0, x1, y + h, z1));
  // Giotto's windows: two storeys of paired two-light windows, then the tall three-light belfry; each light
  // dark under a pointed head, the lights parted by slender twisted shafts, the window framed in white
  // marble under a gable with a small rose in it
  for (const f of 'nsew') {
    const along = f === 'n' || f === 's', o = f === 'n' ? r[1] : f === 's' ? r[3] : f === 'w' ? r[0] : r[2], sg = f === 'n' || f === 'w' ? -1 : 1, c = along ? x : z;
    const B = (u0, u1, y0, y1, d0, d1) => { const a2 = o + sg * d0, b2 = o + sg * d1; return along ? box(c + u0, y0, Math.min(a2, b2), c + u1, y1, Math.max(a2, b2)) : box(Math.min(a2, b2), y0, c + u0, Math.max(a2, b2), y1, c + u1); };
    const P = (u, yy, d) => (along ? [c + u, yy, o + sg * d] : [o + sg * d, yy, c + u]);
    const win = (uc, w, y0, hh, lights) => {
      bag.add(M, B(uc - w / 2 - 0.35, uc + w / 2 + 0.35, y0 - 0.3, y0 + hh + 0.4, 0, 0.12));
      const lw = w / lights;
      for (let i = 0; i < lights; i++) {
        const u0 = uc - w / 2 + i * lw + 0.08, u1 = u0 + lw - 0.16;
        bag.add('opening', B(u0, u1, y0, y0 + hh * 0.82, 0.1, 0.16));
        for (let k = 0; k < 5; k++) { const t = (k + 0.5) / 5, hw = (u1 - u0) / 2 * Math.sqrt(1 - t * t); bag.add('opening', B((u0 + u1) / 2 - hw, (u0 + u1) / 2 + hw, y0 + hh * 0.82 + k * hh * 0.036, y0 + hh * 0.82 + (k + 1) * hh * 0.036, 0.1, 0.16)); }
      }
      for (let i = 1; i < lights; i++) { const u = uc - w / 2 + i * lw; bag.add(M, rod(P(u, y0, 0.2), P(u, y0 + hh * 0.82, 0.2), 0.1, 8)); }
      // the gable over it: a triangle of white marble, a little rose in its middle
      const gy = y0 + hh + 0.4, gw = w / 2 + 0.5, gh = gw * 0.75;
      for (let k = 0; k < 6; k++) { const t0 = k / 6, t1 = (k + 1) / 6; bag.add(M, B(uc - gw * (1 - t0), uc + gw * (1 - t0), gy + gh * t0, gy + gh * t1, 0, 0.16)); }
      const rose = lathe([[0.001, 0], [gw * 0.28, 0], [gw * 0.28, 0.05], [0.001, 0.05]], 16); rose.rotateX(Math.PI / 2); if (!along) rose.rotateY(Math.PI / 2);
      const pc = P(uc, gy + gh * 0.35, 0.17); rose.translate(...pc); bag.add('opening', rose);
    };
    for (const yy of [h * 0.5, h * 0.66]) for (const du of [-s * 0.2, s * 0.2]) win(du, s * 0.22, y + yy, 8, 2);
    win(0, s * 0.42, y + h * 0.81, 12, 3);
  }
  bag.add(M, box(r[0] - 1, y + h, r[1] - 1, r[2] + 1, y + h + 1.2, r[3] + 1));
}
registerStyle('renaissance', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, duomo, campanile, baptistery, orsanmichele, palazzo, loggia, ponte_vecchio: ponteVecchio, palazzo_medici: palazzoMedici, mercato, novella, bottega, tintoria, tiratoio, casa },
  objects: {},
});
