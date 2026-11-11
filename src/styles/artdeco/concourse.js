// Grand Central Terminal's Main Concourse as in 1931 (docs/settlements/new-york.md §1k): a hall the length of the front (85 m), its walls
// of Caen-stone-coloured travertine on a marble base, pilasters under a gilt cornice at the springing of a barrel vault whose blue
// ceiling carries the gold stars of the constellations; the three great arched windows of the 42nd Street front lighting it
// from the south, the gates to the tracks in the north wall under their track numbers, the ticket windows along the west wall,
// the grand stair up to a balcony on the east, the information booth with its four-faced clock in the middle of a floor of
// marble, the bronze chandeliers, benches, the departure board — and the low arcade under the roadway between the street doors
// and the hall. Laid out in the terminal's frame (the front on +z), at street level.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { Quads, letters, textLen, fitCell } from './dress.js';

const TR = 'travertine', MB = 'marble_dark', GB = 'gilt_bronze';
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };

/**
 * concourse: o = { x0, z0, x1, z1 (the lot), zc (the hall's south wall: the front slab's inner face), y (street), dk (the roadway's height), h, T (wall thickness), doors: [x of each door's middle], seed }.
 */
export function concourse(bag, col, lights, o) {
  const { x0, z0, x1, z1, zc, y, dk, h, T, doors } = o, fy = y + 0.05, hx0 = x0 + T, hx1 = x1 - T, hz0 = z0 + T, W = hx1 - hx0, Dh = zc - hz0, cx = (x0 + x1) / 2, zm = (hz0 + zc) / 2;
  let s = (o.seed || 1931) >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const SPR = y + 17, CROWN = y + 28.3, a = Dh / 2, b = CROWN - SPR;
  // ── the shell: granite below the roadway, limestone above, the roof; walls lined within ──
  for (const [a0, b0, a1, b1] of [[x0, z0, x0 + T, z1], [x1 - T, z0, x1, z1]]) { bag.add('granite_grey', box(a0, y - 0.5, b0, a1, y + dk, b1)); bag.add('limestone', box(a0, y + dk, b0, a1, y + h, zc)); col.rect([a0, b0, a1, b1], y - 0.5, y + h); }
  bag.add('granite_grey', box(x0, y - 0.5, z0, x1, y + dk, hz0)); bag.add('limestone', box(x0, y + dk, z0, x1, y + h, hz0)); col.rect([x0, z0, x1, hz0], y - 0.5, y + h);
  bag.add('limestone', box(x0, y + h - 1.0, z0, x1, y + h, zc));
  // the street front of the ground storey: granite with its doors (4.2 m high, 3 wide) and between them the dark windows; the arcade's ceiling behind
  const dw = 3.0, bx = [];
  { let u = hx0; for (const dx of [...doors].sort((p, q) => p - q)) { bx.push([u, dx - dw / 2]); u = dx + dw / 2; } bx.push([u, hx1]); }
  bx.push([x0, hx0], [hx1, x1]);
  for (const [p, q] of bx) if (q - p > 0.05) { bag.add('granite_grey', box(p, y - 0.5, z1 - T, q, y + dk, z1)); col.rect([p, z1 - T, q, z1], y - 0.5, y + dk); }
  for (const dx of doors) { bag.add('granite_grey', box(dx - dw / 2, y + 4.2, z1 - T, dx + dw / 2, y + dk, z1)); bag.add(GB, box(dx - dw / 2 - 0.1, y + 4.15, z1 - 0.1, dx + dw / 2 + 0.1, y + 4.3, z1 + 0.06)); for (const sd of [-1, 1]) bag.add(GB, box(dx + sd * (dw / 2) - 0.06, y, z1 - 0.1, dx + sd * (dw / 2) + 0.06, y + 4.2, z1 + 0.04)); }
  const lobby = [hx0, zc, hx1, z1 - T];
  bag.add(TR, box(hx0, y + dk - 0.6, zc, hx1, y + dk, z1 - T));
  for (let u = hx0 + 3; u < hx1 - 2; u += 6) bag.add('limestone', box(u - 0.3, y + dk - 1.0, zc, u + 0.3, y + dk - 0.6, z1 - T));
  for (const px of [hx0 + 10.7 * 1, hx0 + 10.7 * 3, hx0 + 10.7 * 5, hx0 + 10.7 * 7]) for (const pz of [zc + 3.3, zc + 7.2]) { bag.add(TR, box(px - 0.7, y, pz - 0.7, px + 0.7, y + dk - 0.6, pz + 0.7)); bag.add(GB, box(px - 0.76, y + 0.12, pz - 0.76, px + 0.76, y + 0.18, pz + 0.76)); bag.add('limestone', box(px - 0.9, y + dk - 1.0, pz - 0.9, px + 0.9, y + dk - 0.6, pz + 0.9)); col.rect([px - 0.7, pz - 0.7, px + 0.7, pz + 0.7], y, y + dk); }
  // ── the floor: marble, a dark border, a diagonal grid of dark lines ──
  bag.add('marble_pink', box(hx0, y - 0.5, hz0, hx1, fy, z1 - T)); bag.add(MB, box(hx0 + 0.9, fy, hz0 + 0.9, hx1 - 0.9, fy + 0.004, hz0 + 1.1)); bag.add(MB, box(hx0 + 0.9, fy, zc - 1.1, hx1 - 0.9, fy + 0.004, zc - 0.9));
  { const Q = new Quads(); for (let u = hx0 + 1.07; u < hx1 - 1; u += 5.35) Q.up(MB, [u - 0.06, fy + 0.006, hz0 + 1.1], [u + 0.06, fy + 0.006, hz0 + 1.1], [u + 0.06, fy + 0.006, zc - 1.1], [u - 0.06, fy + 0.006, zc - 1.1]); for (let v = hz0 + 1.1 + 4.6; v < zc - 1.1; v += 4.6) Q.up(MB, [hx0 + 0.9, fy + 0.006, v - 0.06], [hx0 + 0.9, fy + 0.006, v + 0.06], [hx1 - 0.9, fy + 0.006, v + 0.06], [hx1 - 0.9, fy + 0.006, v - 0.06]); Q.flush(bag); }
  // ── the walls' lining: a marble base, the pilasters, the cornice at the springing ──
  const lineN = (u0, u1, y0, y1, m = TR) => bag.add(m, box(u0, y0, hz0, u1, y1, hz0 + 0.12));
  bag.add(MB, box(hx0, fy - 0.03, hz0, hx1, fy + 1.3, hz0 + 0.2)); bag.add(MB, box(hx0, fy - 0.03, hz0, hx0 + 0.2, fy + 1.3, zc)); bag.add(MB, box(hx1 - 0.2, fy - 0.03, hz0, hx1, fy + 1.3, zc)); bag.add(MB, box(hx0, fy - 0.03, zc - 0.2, hx1, fy + 1.3, zc));
  lineN(hx0, hx1, fy + 1.3, SPR); bag.add(TR, box(hx0, fy + 1.3, hz0, hx0 + 0.12, SPR, zc)); bag.add(TR, box(hx1 - 0.12, fy + 1.3, hz0, hx1, SPR, zc)); bag.add(TR, box(hx0, fy + 1.3, zc - 0.12, hx1, SPR, zc));
  const nb = 8, bay = W / nb;
  for (let i = 0; i <= nb; i++) { const u = hx0 + i * bay; for (const [zz, d] of [[hz0, 1], [zc, -1]]) { if (zz === zc && i > 0 && i < nb) continue; bag.add(TR, box(u - 0.55, fy - 0.06, zz + (d > 0 ? 0 : -0.55), u + 0.55, SPR - 1.1, zz + (d > 0 ? 0.55 : 0)));  bag.add(GB, box(u - 0.6, SPR - 1.1, zz + (d > 0 ? 0 : -0.6), u + 0.6, SPR - 0.8, zz + (d > 0 ? 0.6 : 0))); } }
  for (const [p, q, zz, d] of [[hx0, hx1, hz0, 1], [hx0, hx1, zc, -1]]) { bag.add('limestone', box(p, SPR - 0.8, zz + (d > 0 ? 0 : -0.7), q, SPR, zz + (d > 0 ? 0.7 : 0))); bag.add(GB, box(p, SPR - 0.1, zz + (d > 0 ? 0.7 : -0.74), q, SPR, zz + (d > 0 ? 0.74 : -0.7))); }
  for (const [xx, d] of [[hx0, 1], [hx1, -1]]) { bag.add('limestone', box(xx + (d > 0 ? 0 : -0.7), SPR - 0.8, hz0, xx + (d > 0 ? 0.7 : 0), SPR, zc)); }
  // ── the vault: an elliptical barrel over the whole hall, its blue ceiling starred in gold ──
  { const T2 = [], NX = Math.max(8, Math.round(W / 6)), NZ = 28;
    const P = (i, j) => { const t = Math.PI * j / NZ, zz = zm - a * Math.cos(t), yy = SPR + b * Math.sin(t); return [hx0 + W * i / NX, yy, zz]; };
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) T2.push(...P(i, j), ...P(i + 1, j + 1), ...P(i + 1, j), ...P(i, j), ...P(i, j + 1), ...P(i + 1, j + 1));
    bag.add('vault_stars', fromTriangles(both(T2))); }
  // the ribs of gilt plaster across it at each bay and the lunettes' arch on the end walls (the windows, bright)
  for (let i = 0; i <= nb; i += 1) { const u = hx0 + i * bay; if (i === 0 || i === nb) continue; const Tn = []; const N = 24; for (let j = 0; j < N; j++) { const t0 = Math.PI * j / N, t1 = Math.PI * (j + 1) / N, p = (t) => [zm - (a - 0.05) * Math.cos(t), SPR + (b - 0.05) * Math.sin(t)]; const A = p(t0), B = p(t1); bag.add(GB, rod([u, A[1], A[0]], [u, B[1], B[0]], 0.1, 4)); } void Tn; }
  for (const [xx, d] of [[hx0 + 0.02, 1], [hx1 - 0.02, -1]]) {
    const Tn = [], c0 = zm, rr = a * 0.55, yb0 = y + 9, N = 16;
    for (let j = 0; j < N; j++) { const t0 = Math.PI * j / N, t1 = Math.PI * (j + 1) / N; Tn.push(xx, yb0 + 4.5, c0, xx, yb0 + 4.5 + Math.sin(t0) * rr * 1.1, c0 - Math.cos(t0) * rr, xx, yb0 + 4.5 + Math.sin(t1) * rr * 1.1, c0 - Math.cos(t1) * rr); }
    Tn.push(xx, yb0, c0 - rr, xx, yb0 + 4.5, c0 - rr, xx, yb0 + 4.5, c0 + rr, xx, yb0, c0 - rr, xx, yb0 + 4.5, c0 + rr, xx, yb0, c0 + rr);
    bag.add('daylight', fromTriangles(both(Tn)));
    for (let k = 1; k < 5; k++) bag.add('iron', box(xx + (d > 0 ? 0 : -0.05), yb0, c0 - rr + k * 2 * rr / 5 - 0.04, xx + (d > 0 ? 0.05 : 0), yb0 + 4.5 + Math.sqrt(Math.max(0, 1 - ((-rr + k * 2 * rr / 5) / rr) ** 2)) * rr * 1.1 - 0.1, c0 - rr + k * 2 * rr / 5 + 0.04));
  }
  // the south wall's arches get the lining at the piers (the front's slab is limestone), its sills a marble ledge
  // ── the gates in the north wall, one in each bay: a dark opening with its bronze frame, a lamp, the track numbers over it ──
  { const Q = new Quads(), TRACKS = ['11 12', '13 14', '15 16', '17 18', '19 20', '21 22', '23 24', '25 26'];
    for (let i = 0; i < nb; i++) {
      const u = hx0 + (i + 0.5) * bay;
      bag.add('opening', box(u - 1.9, fy, hz0 + 0.12, u + 1.9, fy + 4.6, hz0 + 0.16));
      for (const sd of [-1, 1]) bag.add(GB, box(u + sd * 1.95 - 0.07, fy, hz0 + 0.12, u + sd * 1.95 + 0.07, fy + 4.7, hz0 + 0.3));
      bag.add(GB, box(u - 2.05, fy + 4.6, hz0 + 0.12, u + 2.05, fy + 4.75, hz0 + 0.3));
      bag.add('car_black', box(u - 1.4, fy + 5.2, hz0 + 0.12, u + 1.4, fy + 6.4, hz0 + 0.2));
      const txt = 'TRACKS', c1 = fitCell(txt, 2.3, 0.07), c2 = fitCell(TRACKS[i], 2.3, 0.14);
      letters(Q.t('paint_white'), txt, c1, (hh, v) => [u + textLen(txt, c1) / 2 - hh, fy + 6.1 + v, hz0 + 0.205], 0, 0); letters(Q.t('gold'), TRACKS[i], c2, (hh, v) => [u + textLen(TRACKS[i], c2) / 2 - hh, fy + 5.3 + v, hz0 + 0.205], 0, 0);
      bag.add('lamp_glass', lathe([[0.001, 0], [0.14, 0.05], [0.16, 0.2], [0.001, 0.3]], 8, null, u - 2.4, fy + 4.4, hz0 + 0.3)); bag.add('iron', box(u - 2.43, fy + 4.2, hz0 + 0.12, u - 2.37, fy + 4.5, hz0 + 0.3));
      if (i % 2 === 0) lights.push({ at: [u, fy + 5, hz0 + 1.2], color: '#ffe0aa', intensity: 2.0, distance: 12 });
    }
    // the departure board on the north wall between gates 4 and 5: a black board, white lines
    const bu = hx0 + 4 * bay, lines = ['20TH CENTURY LTD CHICAGO', 'EMPIRE STATE EXP ALBANY', 'COMMODORE VANDERBILT', 'NEW HAVEN BOSTON', 'HARLEM DIVISION'];
    bag.add('car_black', box(bu - 3.8, fy + 5.0, hz0 + 0.12, bu + 3.8, fy + 8.2, hz0 + 0.2)); bag.add(GB, box(bu - 3.9, fy + 8.2, hz0 + 0.12, bu + 3.9, fy + 8.3, hz0 + 0.22));
    lines.forEach((ln, k) => { const c = fitCell(ln, 7.0, 0.075); letters(Q.t(k === 0 ? 'gold' : 'paint_white'), ln, c, (hh, v) => [bu + 3.5 - hh, fy + 7.7 - k * 0.55 + v, hz0 + 0.205], 0, 0); });
    Q.flush(bag); }
  // ── the ticket windows along the west wall: a counter of dark wood, nine grilles of bronze under arches, a lettered board ──
  { const Q = new Quads(), n = 9, zA = hz0 + 3.0, zB = zc - 3.0, st = (zB - zA) / n;
    bag.add('wood_dark', box(hx0 + 0.12, fy, zA - 0.3, hx0 + 1.5, fy + 1.1, zB + 0.3)); bag.add('marble', box(hx0 + 0.05, fy + 1.1, zA - 0.35, hx0 + 1.6, fy + 1.16, zB + 0.35)); col.rect([hx0 + 0.1, zA - 0.35, hx0 + 1.6, zB + 0.35], fy, fy + 1.2);
    for (let k = 0; k < n; k++) { const zz = zA + (k + 0.5) * st; bag.add('opening', box(hx0 + 0.12, fy + 1.4, zz - 0.5, hx0 + 0.15, fy + 3.4, zz + 0.5)); for (let g = -4; g <= 4; g++) bag.add(GB, box(hx0 + 0.15, fy + 1.4, zz + g * 0.11 - 0.012, hx0 + 0.19, fy + 3.4, zz + g * 0.11 + 0.012)); bag.add(GB, box(hx0 + 0.12, fy + 3.4, zz - 0.55, hx0 + 0.3, fy + 3.5, zz + 0.55)); bag.add(GB, box(hx0 + 0.12, fy + 1.35, zz - 0.55, hx0 + 0.3, fy + 1.4, zz + 0.55)); for (const sd of [-1, 1]) bag.add('wood_dark', box(hx0 + 0.12, fy + 1.4, zz + sd * (st / 2) - 0.03, hx0 + 0.3, fy + 3.5, zz + sd * (st / 2) + 0.03)); }
    bag.add('car_black', box(hx0 + 0.12, fy + 4.4, zA - 0.3, hx0 + 0.2, fy + 5.4, zB + 0.3)); const txt = 'TICKETS', c = fitCell(txt, 5, 0.17); letters(Q.t('gold'), txt, c, (hh, v) => [hx0 + 0.21, fy + 4.55 + v, zm - textLen(txt, c) / 2 + hh], 0, 0); Q.flush(bag);
    lights.push({ at: [hx0 + 2.5, fy + 5.5, zm], color: '#ffe0aa', intensity: 2.0, distance: 14 }); }
  // ── the east wall's grand stair: 28 steps rising to the balcony along the wall, balustraded (a ramp for the walker) ──
  { const sw = 11, sz0 = zm - sw / 2, sz1 = zm + sw / 2, run = 12.6, steps = 28, ht = 6.4, rise = ht / steps, gx = hx1 - 3.2, sx0 = gx - run;
    for (let k = 0; k < steps; k++) bag.add(TR, box(sx0 + k * run / steps, fy - 0.09, sz0, sx0 + (k + 1) * run / steps, fy + (k + 1) * rise, sz1));
    bag.add(TR, box(gx, fy - 0.09, sz0 - 0.2, hx1 - 0.02, fy + ht, sz1 + 0.2)); bag.add('marble_floor', box(gx, fy + ht, sz0 - 0.2, hx1 - 0.02, fy + ht + 0.05, sz1 + 0.2));
    col.ramp([sx0, sz0, gx, sz1], fy, fy + ht, 'e'); col.floor([gx, sz0, hx1 - 0.2, sz1], fy + ht + 0.05); col.rect([gx, sz0 - 0.2, hx1, sz0], fy, fy + ht + 1.2); col.rect([gx, sz1, hx1, sz1 + 0.2], fy, fy + ht + 1.2);
    for (const zz of [sz0, sz1]) { for (let u = sx0 + 0.2; u < gx; u += 0.33) { const hh = fy + (u - sx0) / run * ht; bag.add('marble', box(u - 0.04, hh, zz - 0.04, u + 0.04, hh + 1.0, zz + 0.04)); } bag.add('marble', rod([sx0, fy + 1.05, zz], [gx, fy + ht + 1.05, zz], 0.05, 5)); }
    for (let u = gx; u < hx1 - 0.3; u += 0.33) for (const zz of [sz0 - 0.18, sz1 + 0.18]) { void u; void zz; }
    for (const zz of [sz0 - 0.15, sz1 + 0.15]) { for (let u = gx; u < hx1 - 0.2; u += 0.33) bag.add('marble', box(u - 0.04, fy + ht, zz - 0.04, u + 0.04, fy + ht + 1.0, zz + 0.04)); bag.add('marble', box(gx, fy + ht + 1.0, zz - 0.05, hx1, fy + ht + 1.08, zz + 0.05)); }
    bag.add('marble', box(gx - 0.05, fy + ht + 1.0, sz0 - 0.15, gx + 0.05, fy + ht + 1.08, sz1 + 0.15));
    lights.push({ at: [gx - 4, fy + 6, zm], color: '#ffe0aa', intensity: 1.8, distance: 14 }); }
  // ── the information booth: an eight-sided counter of marble and bronze, the four-faced clock on its post ──
  { const bz = zm, rO = 2.1, N = 8, Tn = [];
    bag.add('marble', lathe([[rO + 0.25, 0], [rO + 0.25, 0.2], [rO, 0.2], [rO, 1.0], [rO + 0.1, 1.0], [rO + 0.1, 1.08], [0.001, 1.08]], N, null, cx, fy, bz)); bag.add(GB, lathe([[rO + 0.26, 0.12], [rO + 0.26, 0.2], [rO + 0.1, 0.2]], N, null, cx, fy, bz));
    for (let k = 0; k < N; k++) { const th = (k + 0.5) / N * Math.PI * 2, px = cx + Math.cos(th) * (rO - 0.02), pz = bz + Math.sin(th) * (rO - 0.02); bag.add(GB, box(px - 0.05, fy + 1.08, pz - 0.05, px + 0.05, fy + 3.0, pz + 0.05)); }
    bag.add(GB, lathe([[rO, 3.0], [rO, 3.1], [0.001, 3.3]], N, null, cx, fy, bz)); bag.add('opening', lathe([[rO - 0.1, 1.1], [rO - 0.1, 2.9]], N, null, cx, fy, bz));
    bag.add(GB, lathe([[0.15, 3.3], [0.12, 4.0], [0.2, 4.1], [0.2, 4.9], [0.12, 5.0], [0.001, 5.4]], 10, null, cx, fy, bz));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ang = Math.atan2(dx, dz); const g = lathe([[0.001, 0], [0.5, 0], [0.5, 0.06], [0.001, 0.07]], 20, null, 0, 0, 0).rotateX(Math.PI / 2); g.rotateY(ang); g.translate(cx + dx * 0.24, fy + 4.45, bz + dz * 0.24); bag.add('glass_lamp', g); const g2 = lathe([[0.5, 0], [0.58, 0], [0.58, 0.1], [0.5, 0.1]], 20, null, 0, 0, 0).rotateX(Math.PI / 2); g2.rotateY(ang); g2.translate(cx + dx * 0.24, fy + 4.45, bz + dz * 0.24); bag.add(GB, g2); const hnd = box(-0.015, 0, -0.01, 0.015, 0.36, 0.01).rotateZ(0.6); hnd.rotateY(ang); hnd.translate(cx + dx * 0.3, fy + 4.45, bz + dz * 0.3); bag.add('car_black', hnd); const hn2 = box(-0.015, 0, -0.01, 0.015, 0.28, 0.01).rotateZ(-1.8); hn2.rotateY(ang); hn2.translate(cx + dx * 0.3, fy + 4.45, bz + dz * 0.3); bag.add('car_black', hn2); }
    bag.add('lamp_glass', lathe([[0.001, 0], [0.16, 0.05], [0.18, 0.25], [0.001, 0.4]], 10, null, cx, fy + 5.4, bz));
    col.circle(cx, bz, rO + 0.3, fy, fy + 3.3); lights.push({ at: [cx, fy + 3.6, bz], color: '#ffe3b4', intensity: 1.8, distance: 10 }); void Tn; }
  // ── the chandeliers: bronze rings with globes, hung on rods from the vault ──
  for (const [u, zz] of [[0.25, -0.3], [0.5, 0.3], [0.75, -0.3], [0.25, 0.3], [0.75, 0.3]]) {
    const px = hx0 + u * W, pz = zm + zz * a, top = SPR + b * Math.sqrt(Math.max(0, 1 - ((pz - zm) / a) ** 2)) - 0.1, yy = top - 6.5;
    bag.add('iron', rod([px, yy, pz], [px, top, pz], 0.03, 4)); bag.add(GB, lathe([[0.9, 0], [0.9, 0.08], [0.82, 0.08], [0.82, 0]], 16, null, px, yy, pz)); bag.add(GB, lathe([[0.001, 0], [0.18, 0.1], [0.12, 0.3], [0.001, 0.4]], 10, null, px, yy - 0.1, pz));
    for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.04], [0.12, 0.14], [0.06, 0.24], [0.001, 0.26]], 8, null, px + Math.cos(t) * 0.86, yy + 0.08, pz + Math.sin(t) * 0.86)); }
    lights.push({ at: [px, yy - 0.3, pz], color: '#ffe0aa', intensity: 2.6, distance: 22 });
  }
  // ── the benches: rows of oak benches with high backs in the south part, before the great windows ──
  const BEN = [];
  for (const u of [0.18, 0.32, 0.68, 0.82]) for (const dz of [-0.38, 0.38]) {
    const bxm = hx0 + u * W, bzm = zm + dz * a * 0.6;
    for (let k = 0; k < 2; k++) {
      const zz = bzm + (k ? 0.65 : -0.65), back = k ? 1 : -1;
      bag.add('wood_dark', box(bxm - 1.3, fy + 0.42, zz - 0.25, bxm + 1.3, fy + 0.47, zz + 0.25)); bag.add('wood_dark', box(bxm - 1.3, fy + 0.47, zz + back * 0.23 - 0.03, bxm + 1.3, fy + 1.1, zz + back * 0.23 + 0.03)); for (const sx of [-1, 1]) bag.add('iron', box(bxm + sx * 1.25 - 0.03, fy, zz - 0.22, bxm + sx * 1.25 + 0.03, fy + 0.42, zz + 0.22));
      col.rect([bxm - 1.3, zz - 0.26, bxm + 1.3, zz + 0.26], fy, fy + 1.1);
    }
  }
  void BEN;
}

/** The hall's people (docs §1k): where the travellers sit, wait at the gates, queue at the ticket windows, ask at the booth and walk — [{ at: [x, z], y, role, rot }] in the terminal's frame. */
export function concoursePeople(o) {
  const { x0, z0, x1, zc, y, T } = o, fy = y + 0.05, hx0 = x0 + T, hx1 = x1 - T, hz0 = o.z0 + T, W = hx1 - hx0, Dh = zc - hz0, cx = (x0 + x1) / 2, zm = (hz0 + zc) / 2, a = Dh / 2, nb = 8, bay = W / nb;
  let s = 4711; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const people = [];
  for (const u of [0.18, 0.32, 0.68, 0.82]) for (const dz of [-0.38, 0.38]) for (let k = 0; k < 2; k++) if (r() < 0.55) people.push({ at: [hx0 + u * W - 0.6 + r() * 1.2, zm + dz * a * 0.6 + (k ? 0.65 : -0.65)], y: fy + 0.16, role: 'sit', rot: k ? 0 : Math.PI });
  for (let i = 0; i < nb; i++) if (r() < 0.8) people.push({ at: [hx0 + (i + 0.5) * bay + (r() - 0.5) * 2, hz0 + 3 + r() * 2], y: fy, role: 'gate', rot: 0 });
  for (let k = 0; k < 6; k++) people.push({ at: [hx0 + 2.6 + r() * 1.6, zm - 8 + k * 2.6 + r()], y: fy, role: 'queue', rot: Math.PI / 2 });
  for (let k = 0; k < 8; k++) people.push({ at: [cx + Math.cos(k * 0.8) * (3.4 + r() * 0.5), zm + Math.sin(k * 0.8) * (3.4 + r() * 0.5)], y: fy, role: 'booth', rot: Math.PI / 2 - k * 0.8 });
  for (let k = 0; k < 14; k++) people.push({ at: [hx0 + 6 + r() * (W - 22), hz0 + 3 + r() * (Dh - 6)], y: fy, role: 'walk', rot: r() * 6.28 });
  return people.filter((p) => Math.hypot(p.at[0] - cx, p.at[1] - zm) > 2.7);
}
