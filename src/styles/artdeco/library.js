// The New York Public Library's main building in 1931 (docs/settlements/new-york.md §1m), on Fifth Avenue between 40th and 42nd Streets: the white
// marble front set back behind its terrace and the broad steps with the two lions, a portico of six Corinthian columns before three
// bronze doors, wings with two ranks of windows, the cornice and the attic. Inside: Astor Hall — marble walls and floor, a coffered ceiling,
// the stair up to its gallery — and, through two doorways at its back, the Main Reading Room, a hall 24 m wide and 66 m long under a coffered
// ceiling, oak tables with green-shaded lamps in two long rows, galleries of books along both walls under the arched windows. The real room
// is on the third floor; here it is on the terrace level so that it can be walked into (the front's depth is compressed, too).
// The front faces +x (Fifth Avenue); everything in the terminal's way: boxes in the grid's frame.

import { box, lathe, rod } from '../../core/geom.js';
import { Quads, letters, textLen, fitCell, rng } from './dress.js';

const M = 'marble', MC = 'marble_column', MF = 'marble_floor', GB = 'gilt_bronze', OAK = 'wood_dark';
/** The geometry both the builder and the life share: { xb (the building's front face), F (the terrace's height), hall, rr, zc }. */
export function libraryFrame([x0, z0, x1, z1], y) {
  const xb = x1 - 13, ST = 3.0, zc = (z0 + z1) / 2, hall = [xb - 1.5 - 17.5, zc - 15, xb - 1.5, zc + 15], rx1 = hall[0] - 1.5;
  return { x0, z0, x1, z1, xb, F: y + ST, ST, zc, hall, rr: [rx1 - 24, z0 + 6, rx1, z1 - 6], T: 1.5, y };
}

/** library: { rect, y, h } */
export function library(el, { bag, col, lights }) {
  const y = el.y ?? 0, h = el.h ?? 24, f = libraryFrame(el.rect, y), { x0, z0, x1, z1, xb, F, ST, zc, hall, rr, T } = f, r = rng(1911);
  const HH = 11, HR = 14.5;                                         // the hall's and the reading room's ceilings above the floor
  const [hx0, hz0, hx1, hz1] = hall, [rx0, rz0, rx1, rz1] = rr, wallX = hx0 - T;     // the wall between the hall and the reading room: x wallX … hx0
  const wall = (x, y0, y1, z, y2, zz) => 0; void wall;
  const solid = (m, a, b0, c, d, y0, y1) => { bag.add(m, box(a, y0, b0, c, y1, d)); col.rect([a, b0, c, d], y0, y1); };
  // ── the body: the stylobate to the terrace, then the walls round the two halls, solid elsewhere ──
  bag.add(M, box(x0, y - 0.5, z0, xb + 5, F, z1)); col.rect([x0, z0, xb + 5, z1], y - 0.5, F - 0.05);
  bag.add('granite_grey', box(x0 - 0.2, y - 0.5, z0 - 0.2, xb + 5.2, y + 0.8, z1 + 0.2));
  const Z = [z0, rz0, rz1, z1];
  solid(M, x0, z0, rx0, z1, F, y + h);                                                      // west of the reading room
  solid(M, rx0, z0, rx1, rz0, F, y + h); solid(M, rx0, rz1, rx1, z1, F, y + h);              // north and south of it
  // the wall between hall and reading room (two doorways at zc ± 9, 3 m wide, 5.2 m high)
  const doors = [zc - 9, zc + 9];
  { let a = hz0 - 4; const zs = [[z0, doors[0] - 1.5], [doors[0] + 1.5, doors[1] - 1.5], [doors[1] + 1.5, z1]]; for (const [p, q] of zs) solid(M, wallX, p, hx0, q, F, y + h); void a;
    for (const d of doors) { bag.add(M, box(wallX, F + 5.2, d - 1.5, hx0, y + h, d + 1.5)); bag.add(GB, box(wallX - 0.05, F + 5.1, d - 1.6, hx0 + 0.05, F + 5.25, d + 1.6)); } }
  solid(M, hx0, z0, xb, hz0, F, y + h); solid(M, hx0, hz1, xb, z1, F, y + h);                   // north and south of the hall
  bag.add(M, box(hx0, F + HH, hz0, xb, y + h, hz1)); col.rect([hx0, hz0, xb, hz1], F + HH, y + h);
  bag.add(M, box(rx0, F + HR, rz0, rx1, y + h, rz1)); col.rect([rx0, rz0, rx1, rz1], F + HR, y + h);
  bag.add(M, box(wallX, F + HH, hz0, hx0, F + HR, hz1));
  // the front wall (x from xb − T to xb) with the three doors; the hall's portal
  const dz = [zc - 14.4, zc, zc + 14.4], dwid = 3.6, dh = 5.8;
  { const xs = [[z0, dz[0] - dwid / 2], [dz[0] + dwid / 2, dz[1] - dwid / 2], [dz[1] + dwid / 2, dz[2] - dwid / 2], [dz[2] + dwid / 2, z1]];
    for (const [p, q] of xs) { if (q - p < 0.1) continue; if (q < hz0 || p > hz1) continue; solid(M, xb - T, Math.max(p, hz0 - 0.001), xb, Math.min(q, hz1 + 0.001), F, F + HH); }
    for (const d of dz) { bag.add(M, box(xb - T, F + dh, d - dwid / 2, xb, F + HH, d + dwid / 2)); for (const sd of [-1, 1]) bag.add(GB, box(xb - 0.12, F, d + sd * dwid / 2 - 0.07, xb + 0.14, F + dh, d + sd * dwid / 2 + 0.07)); bag.add(GB, box(xb - 0.12, F + dh - 0.1, d - dwid / 2 - 0.07, xb + 0.14, F + dh + 0.12, d + dwid / 2 + 0.07)); bag.add('glass_outer', box(xb - 0.5, F + dh - 1.6, d - dwid / 2, xb - 0.45, F + dh - 0.1, d + dwid / 2));
      bag.add(OAK, box(xb - 0.5, F, d - dwid / 2 + 0.07, xb - 0.42, F + 0.3, d + dwid / 2 - 0.07)); } }
  // the hall's front wall beyond the hall (z outside hz0..hz1) is the wings' front: solid to the roof
  solid(M, xb - T, z0, xb, hz0, F, y + h); solid(M, xb - T, hz1, xb, z1, F, y + h);
  bag.add(M, box(xb - T, F + HH, hz0, xb, y + h, hz1));
  // ── the terrace and the steps, the lions, the balustrade ──
  bag.add(MF, box(xb, F - 0.1, z0, xb + 5, F + 0.02, z1));
  col.floor([xb, z0, xb + 5, z1], F); col.floor([wallX, hz0, xb, hz1], F); col.floor([rx0, rz0, rx1, rz1], F);
  const sx0 = xb + 5, sx1 = x1, sw = 34, sz0 = zc - sw / 2, sz1 = zc + sw / 2, n = 18, rs = ST / n;
  for (let k = 0; k < n; k++) bag.add(M, box(sx0 + k * (sx1 - sx0) / n, y - 0.3, sz0, sx0 + (k + 1) * (sx1 - sx0) / n, F - (k + 1) * rs + 0.0, sz1));
  col.ramp([sx0, sz0, sx1, sz1], y + rs / 2, F, 'w');
  for (const [a, b] of [[z0, sz0], [sz1, z1]]) { bag.add(M, box(sx0, y - 0.5, a, sx0 + 0.9, F + 1.0, b)); col.rect([sx0, a, sx0 + 0.9, b], y - 0.5, F + 1.2); for (let q = a + 0.3; q < b - 0.2; q += 0.4) bag.add(M, lathe([[0.1, 0], [0.14, 0.2], [0.08, 0.6], [0.12, 0.85]], 6, null, sx0 + 0.45, F + 0.15, q)); bag.add(M, box(sx0 - 0.1, F + 1.0, a, sx0 + 1.0, F + 1.15, b)); }
  for (const zz of [sz0, sz1]) { bag.add(M, box(sx0, y - 0.5, zz - 0.5, sx1 - 0.5, F - 0.4 + (zz > zc ? 0 : 0), zz + 0.5)); }
  for (const sd of [-1, 1]) {                                                           // the lions: a crouching mass of marble, head up, on a plinth at the foot of the steps
    const lz = zc + sd * (sw / 2 + 2.6), lx = sx1 - 2.2;
    bag.add(M, box(lx - 1.9, y - 0.3, lz - 1.1, lx + 1.9, y + 1.3, lz + 1.1)); col.rect([lx - 1.9, lz - 1.1, lx + 1.9, lz + 1.1], y, y + 2.8);
    bag.add(M, lathe([[0.001, -1.4], [0.8, -1.2], [0.95, -0.2], [0.85, 0.8], [0.6, 1.3], [0.001, 1.5]], 10, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(lx, y + 2.0, lz));
    bag.add(M, lathe([[0.001, -0.55], [0.55, -0.4], [0.62, 0.1], [0.45, 0.55], [0.001, 0.7]], 10, null, lx + 1.8, y + 2.7, lz)); bag.add(M, box(lx + 2.0, y + 2.1, lz - 0.35, lx + 2.4, y + 2.35, lz + 0.35));
    for (const s2 of [-1, 1]) bag.add(M, box(lx + 0.9, y + 1.3, lz + s2 * 0.5 - 0.18, lx + 2.4, y + 1.7, lz + s2 * 0.5 + 0.18));
  }
  // paving of the strips beside the steps (the pavement of Fifth Avenue's east side is not here: the lot reaches the kerb)
  { const Q = new Quads(); for (const [a, b] of [[z0, sz0], [sz1, z1]]) Q.up('bluestone', [sx0 + 0.9, y + 0.04, a], [x1, y + 0.04, a], [x1, y + 0.04, b], [sx0 + 0.9, y + 0.04, b]); Q.flush(bag); }
  // ── the front: the portico of six columns, its entablature, the wings' windows, the cornice, the attic ──
  const cw = 0.78, CH = 13.4;
  for (let i = 0; i < 6; i++) {
    const z = zc + (i - 2.5) * 7.2, x = xb + 2.8;
    bag.add(M, box(x - 1.1, F, z - 1.1, x + 1.1, F + 1.0, z + 1.1)); bag.add(MC, lathe([[cw + 0.1, 0], [cw, 0.4], [cw - 0.06, 2], [cw - 0.1, CH - 1.6], [cw - 0.02, CH - 1.3], [cw + 0.18, CH - 1.0], [cw + 0.55, CH - 0.5], [cw + 0.7, CH - 0.2], [cw + 0.7, CH]], 16, null, x, F + 1.0, z));
    for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; bag.add(M, box(x + Math.cos(t) * 0.5 - 0.1, F + CH - 1.0, z + Math.sin(t) * 0.5 - 0.1, x + Math.cos(t) * 0.5 + 0.1, F + CH + 0.1, z + Math.sin(t) * 0.5 + 0.1)); }
    bag.add(M, box(x - 1.2, F + 1.0 + CH, z - 1.2, x + 1.2, F + CH + 1.3, z + 1.2)); col.circle(x, z, cw + 0.15, F, F + CH + 1.3);
  }
  const pz0 = zc - 21.6 - 1.4, pz1 = zc + 21.6 + 1.4;
  bag.add(M, box(xb - 0.2, F + CH + 1.3, pz0, xb + 4.2, F + CH + 3.6, pz1)); bag.add(M, box(xb - 0.2, F + CH + 3.6, pz0 - 0.4, xb + 4.6, F + CH + 4.2, pz1 + 0.4)); bag.add(M, box(xb + 0.0, F + CH + 4.2, pz0, xb + 3.8, F + CH + 7.2, pz1));
  for (let z = pz0 + 0.4; z < pz1; z += 0.9) bag.add(M, box(xb + 4.2, F + CH + 3.3, z, xb + 4.6, F + CH + 3.7, z + 0.34));
  bag.add(M, box(xb + 3.8, F + CH + 7.2, pz0 + 1, xb + 4.1, F + CH + 7.5, pz1 - 1));
  // the wings: two ranks of windows, framed, with sills and pediments over the lower ones
  const wing = (za, zb) => {
    const nw = Math.max(2, Math.round((zb - za) / 6.5)), st = (zb - za) / nw;
    for (let i = 0; i < nw; i++) {
      const z = za + (i + 0.5) * st;
      for (const [w0, w1, tall] of [[F + 1.3, F + 7.2, true], [F + 9.2, F + 12.6, false]]) {
        bag.add('glass_outer', box(xb + 0.01, w0, z - 1.3, xb + 0.04, w1, z + 1.3));
        for (const sd of [-1, 1]) bag.add(M, box(xb, w0, z + sd * 1.45 - 0.15, xb + 0.35, w1 + 0.3, z + sd * 1.45 + 0.15));
        bag.add(M, box(xb, w1, z - 1.6, xb + 0.45, w1 + 0.45, z + 1.6)); bag.add(M, box(xb, w0 - 0.3, z - 1.6, xb + 0.5, w0, z + 1.6));
        bag.add('iron', box(xb + 0.04, w0, z - 0.03, xb + 0.07, w1, z + 0.03)); bag.add('iron', box(xb + 0.04, (w0 + w1) / 2 - 0.03, z - 1.3, xb + 0.07, (w0 + w1) / 2 + 0.03, z + 1.3));
        if (tall) { bag.add(M, box(xb, w1 + 0.45, z - 1.1, xb + 0.55, w1 + 1.0, z + 1.1)); }
      }
    }
  };
  wing(z0 + 0.8, pz0 - 0.8); wing(pz1 + 0.8, z1 - 0.8);
  bag.add(M, box(xb - 0.3, y + h - 1.2, z0 - 0.6, xb + 0.9, y + h + 0.4, z1 + 0.6)); bag.add(M, box(xb - 0.1, y + h + 0.4, z0, xb + 0.2, y + h + 1.3, z1));
  for (let z = z0 + 1; z < z1; z += 1.4) bag.add(M, box(xb + 0.3, y + h - 1.0, z, xb + 0.8, y + h - 0.6, z + 0.5));
  bag.add(M, box(x0 - 0.6, y + h, z0 - 0.6, xb + 0.9, y + h + 0.5, z1 + 0.6)); col.rect([x0, z0, xb + 5, z1], F, y + h + 1.3);
  // ── Astor Hall ──
  { const Q = new Quads(); const ceilY = F + HH;
    bag.add(MF, box(hx0, F - 0.1, hz0, xb, F + 0.02, hz1)); bag.add(MF, box(wallX, F - 0.1, zc - 10.5, hx0, F + 0.02, zc - 7.5)); bag.add(MF, box(wallX, F - 0.1, zc + 7.5, hx0, F + 0.02, zc + 10.5)); bag.add('marble_dark', box(hx0 + 0.6, F + 0.02, hz0 + 0.6, xb - 0.6, F + 0.026, hz0 + 0.8)); bag.add('marble_dark', box(hx0 + 0.6, F + 0.02, hz1 - 0.8, xb - 0.6, F + 0.026, hz1 - 0.6));
    for (const [a, b, c, d] of [[hx0, hz0, xb, hz0 + 0.12], [hx0, hz1 - 0.12, xb, hz1], [hx0 + 0.0, hz0, hx0 + 0.12, hz1]]) bag.add(M, box(a, F, b, c, ceilY, d));
    bag.add(M, box(xb - 0.12, F + dh + 0.1, hz0, xb, ceilY, hz1));
    for (let x = hx0 + 2; x < xb - 1; x += 3.5) for (const zz of [hz0, hz1]) { const s = zz === hz0 ? 1 : -1; bag.add(MC, box(x - 0.45, F, zz + (s > 0 ? 0 : -0.6), x + 0.45, F + HH - 1.3, zz + (s > 0 ? 0.6 : 0))); bag.add(GB, box(x - 0.55, F + HH - 1.3, zz + (s > 0 ? 0 : -0.7), x + 0.55, F + HH - 1.1, zz + (s > 0 ? 0.7 : 0))); }
    bag.add(M, box(hx0, ceilY - 0.9, hz0, xb, ceilY - 0.4, hz0 + 0.8)); bag.add(M, box(hx0, ceilY - 0.9, hz1 - 0.8, xb, ceilY - 0.4, hz1)); bag.add(GB, box(hx0, ceilY - 0.4, hz0, xb, ceilY - 0.3, hz0 + 0.84)); bag.add(GB, box(hx0, ceilY - 0.4, hz1 - 0.84, xb, ceilY - 0.3, hz1));
    bag.add(M, box(hx0, ceilY - 0.4, hz0, xb, ceilY, hz1));
    for (let x = hx0 + 2.5; x < xb - 1; x += 3.5) bag.add(M, box(x - 0.2, ceilY - 0.9, hz0, x + 0.2, ceilY - 0.4, hz1)); for (let z = hz0 + 3; z < hz1 - 1; z += 3.4) bag.add(M, box(hx0, ceilY - 0.9, z - 0.2, xb, ceilY - 0.4, z + 0.2));
    for (const [px, pz] of [[xb - 5, zc - 8], [xb - 5, zc + 8], [hx0 + 6, zc - 8], [hx0 + 6, zc + 8]]) { bag.add('iron', rod([px, ceilY - 2.8, pz], [px, ceilY - 0.4, pz], 0.03, 4)); bag.add(GB, lathe([[0.7, 0], [0.7, 0.08], [0.6, 0.08], [0.001, 0.4]], 14, null, px, ceilY - 3.2, pz)); bag.add('lamp_glass', lathe([[0.001, 0], [0.22, 0.05], [0.28, 0.35], [0.14, 0.6], [0.001, 0.7]], 10, null, px, ceilY - 3.1, pz)); lights.push({ at: [px, ceilY - 3.4, pz], color: '#ffe3b4', intensity: 2.6, distance: 20 }); }
    // the stair: from the hall floor, 22 steps up the west wall to a landing and a gallery along it, rails of marble; the doorways to the reading room under the gallery
    const sw = 8, a = zc - sw / 2, b = zc + sw / 2, gx1 = hx0 + 3, run = 11.5, steps = 22, hs = 4.6, rise = hs / steps, sx0 = gx1 + run;
    for (let k = 0; k < steps; k++) bag.add(M, box(sx0 - (k + 1) * run / steps, F - 0.05, a, sx0 - k * run / steps, F + (k + 1) * rise - 0.0, b));
    bag.add(M, box(hx0, F - 0.05, a, gx1, F + hs, b)); bag.add(MF, box(hx0, F + hs, a, gx1, F + hs + 0.05, b)); col.ramp([gx1, a, sx0, b], F + rise / 2, F + hs, 'w'); col.floor([hx0, a, gx1, b], F + hs + 0.05);
    for (const zz of [a, b]) { for (let u = gx1; u < sx0; u += 0.35) bag.add(M, box(u - 0.04, F + (sx0 - u) / run * hs, zz - 0.04, u + 0.04, F + (sx0 - u) / run * hs + 1.0, zz + 0.04)); bag.add(M, rod([sx0, F + 1.05, zz], [gx1, F + hs + 1.05, zz], 0.06, 5)); bag.add(M, box(hx0, F + hs + 0.9, zz - 0.06, gx1, F + hs + 1.0, zz + 0.06)); }
    bag.add(M, box(hx0, F + hs + 0.9, a, hx0 + 0.1, F + hs + 1.0, b));
    // an information desk and benches
    solid(OAK, xb - 8, zc - 3.5, xb - 6.6, zc + 3.5, F, F + 1.1); bag.add('marble', box(xb - 8.1, F + 1.1, zc - 3.6, xb - 6.5, F + 1.16, zc + 3.6));
    for (const zz of [hz0 + 1.8, hz1 - 1.8]) for (const x of [xb - 10, xb - 5.5]) { bag.add(OAK, box(x - 1.2, F + 0.42, zz - 0.25, x + 1.2, F + 0.47, zz + 0.25)); bag.add(OAK, box(x - 1.2, F + 0.47, zz + (zz < zc ? -0.23 : 0.23) - 0.03, x + 1.2, F + 1.1, zz + (zz < zc ? -0.23 : 0.23) + 0.03)); col.rect([x - 1.2, zz - 0.26, x + 1.2, zz + 0.26], F, F + 1.1); }
    const txt = 'INFORMATION', c = fitCell(txt, 3, 0.07); bag.add('car_black', box(xb - 7.2, F + 1.3, zc - 1.7, xb - 7.1, F + 1.8, zc + 1.7)); letters(Q.t('gold'), txt, c, (hh, v) => [xb - 7.09, F + 1.4 + v, zc - textLen(txt, c) / 2 + hh], 0, 0); Q.flush(bag); }
  // ── the Main Reading Room ──
  { const Q = new Quads(), ceilY = F + HR, W = rx1 - rx0, Ln = rz1 - rz0, cx = (rx0 + rx1) / 2;
    bag.add('timber', box(rx0, F - 0.1, rz0, rx1, F + 0.02, rz1)); for (let z = rz0 + 0.6; z < rz1; z += 0.6) Q.up('brushbox', [rx0, F + 0.03, z - 0.03], [rx1, F + 0.03, z - 0.03], [rx1, F + 0.03, z + 0.03], [rx0, F + 0.03, z + 0.03]);
    // the walls: oak panelling to 3 m, two galleries of shelves under the windows
    for (const [a, b, c, d] of [[rx0, rz0, rx1, rz0 + 0.1], [rx0, rz1 - 0.1, rx1, rz1], [rx0, rz0, rx0 + 0.1, rz1], [rx1 - 0.1, rz0, rx1, rz1]]) bag.add('plaster_white', box(a, F, b, c, ceilY, d));
    bag.add(OAK, box(rx0 + 0.1, F, rz0 + 0.1, rx1 - 0.1, F + 1.1, rz0 + 0.2)); bag.add(OAK, box(rx0 + 0.1, F, rz1 - 0.2, rx1 - 0.1, F + 1.1, rz1 - 0.1)); bag.add(OAK, box(rx1 - 0.2, F, rz0 + 0.2, rx1 - 0.1, F + 1.1, rz1 - 0.2));
    const BK = ['cloth_brown', 'cloth_maroon', 'cloth_green', 'cloth_indigo', 'cloth_grey', 'wood_ochre', 'cloth_red', 'cloth_black'];
    const shelfWall = (xw, sx) => {                                           // sx: the wall's inward direction (+1 / −1)
      for (const [y0, rowsN] of [[F + 1.1, 6], [F + 5.6, 5]]) {
        for (let k = 0; k <= rowsN; k++) bag.add(OAK, box(xw, y0 + k * 0.5, rz0 + 0.1, xw + sx * 0.4, y0 + k * 0.5 + 0.03, rz1 - 0.1));
        for (let k = 0; k < rowsN; k++) { let z = rz0 + 0.3; while (z < rz1 - 0.5) { const run = 0.2 + r() * 0.9, m = BK[Math.floor(r() * BK.length)], z2 = Math.min(rz1 - 0.3, z + run); Q.quad(m, [xw + sx * 0.02, y0 + k * 0.5 + 0.03, z], [xw + sx * 0.02, y0 + k * 0.5 + 0.03, z2], [xw + sx * 0.02, y0 + k * 0.5 + 0.03 + 0.28 + r() * 0.1, z2], [xw + sx * 0.02, y0 + k * 0.5 + 0.03 + 0.28 + r() * 0.1, z]); z = z2 + 0.03; } }
      }
      bag.add(OAK, box(xw, F + 5.0, rz0 + 0.1, xw + sx * 1.1, F + 5.15, rz1 - 0.1)); bag.add(OAK, box(xw + sx * 1.05, F + 5.15, rz0 + 0.1, xw + sx * 1.1, F + 6.2, rz1 - 0.1));      // the gallery's floor and its rail
      for (let z = rz0 + 3; z < rz1 - 1; z += 6) bag.add(OAK, box(xw + sx * 0.5, F + 1.1, z - 0.1, xw + sx * 1.05, F + 5.0, z + 0.1));
    };
    shelfWall(rx0 + 0.1, 1); shelfWall(rx1 - 0.1, -1);
    bag.add(OAK, box(rx0 + 0.1, F + 8.2, rz0 + 0.1, rx0 + 0.3, F + 8.5, rz1 - 0.1)); bag.add(OAK, box(rx1 - 0.3, F + 8.2, rz0 + 0.1, rx1 - 0.1, F + 8.5, rz1 - 0.1));
    // the arched windows high in both long walls
    for (let z = rz0 + 5; z < rz1 - 3; z += 8) for (const [xw, d] of [[rx0 + 0.11, 1], [rx1 - 0.11, -1]]) {
      const Tn = [], N = 12, rr0 = 2.0, yb = F + 8.5, yc = yb + 2.6;
      for (let j = 0; j < N; j++) { const t0 = Math.PI * j / N, t1 = Math.PI * (j + 1) / N; Tn.push(xw, yc, z, xw, yc + Math.sin(t0) * rr0 * 1.0, z - Math.cos(t0) * rr0, xw, yc + Math.sin(t1) * rr0, z - Math.cos(t1) * rr0); }
      Tn.push(xw, yb, z - rr0, xw, yc, z - rr0, xw, yc, z + rr0, xw, yb, z - rr0, xw, yc, z + rr0, xw, yb, z + rr0);
      const both = [...Tn]; for (let i = 0; i < Tn.length; i += 9) both.push(...Tn.slice(i, i + 3), ...Tn.slice(i + 6, i + 9), ...Tn.slice(i + 3, i + 6)); Q.t('daylight').push(...both);
      bag.add(M, box(xw - d * 0.0, yb - 0.1, z - rr0 - 0.2, xw + d * 0.2, yb, z + rr0 + 0.2));
    }
    // the ceiling: a plaster ceiling in coffers with gilt mouldings
    bag.add('plaster_white', box(rx0, ceilY - 0.4, rz0, rx1, ceilY, rz1));
    for (let x = rx0 + 3; x < rx1 - 1; x += 4) bag.add('plaster_white', box(x - 0.25, ceilY - 1.0, rz0, x + 0.25, ceilY - 0.4, rz1)); for (let z = rz0 + 4; z < rz1 - 1; z += 5.5) bag.add('plaster_white', box(rx0, ceilY - 1.0, z - 0.25, rx1, ceilY - 0.4, z + 0.25));
    for (let x = rx0 + 3; x < rx1 - 1; x += 4) bag.add(GB, box(x - 0.28, ceilY - 1.05, rz0, x + 0.28, ceilY - 1.0, rz1));
    for (let z = rz0 + 8; z < rz1 - 4; z += 11) for (const x of [cx - 5, cx + 5]) { bag.add('iron', rod([x, ceilY - 3.2, z], [x, ceilY - 1.0, z], 0.03, 4)); bag.add(GB, lathe([[0.8, 0], [0.8, 0.08], [0.7, 0.08], [0.001, 0.4]], 14, null, x, ceilY - 3.6, z)); bag.add('lamp_glass', lathe([[0.001, 0], [0.25, 0.05], [0.3, 0.4], [0.15, 0.7], [0.001, 0.8]], 10, null, x, ceilY - 3.5, z)); lights.push({ at: [x, ceilY - 3.8, z], color: '#ffe0aa', intensity: 2.4, distance: 22 }); }
    // the tables: two long rows of oak tables with brass lamps under green shades, and chairs on both sides; the delivery desk at the north end
    for (const tx of [cx - 5, cx + 5]) for (let z = rz0 + 6; z < rz1 - 8; z += 7.4) {
      const z0t = z, z1t = z + 6.4; bag.add(OAK, box(tx - 0.6, F + 0.72, z0t, tx + 0.6, F + 0.77, z1t)); for (const sx of [-1, 1]) for (const zz of [z0t + 0.2, z1t - 0.2]) bag.add(OAK, box(tx + sx * 0.5 - 0.05, F, zz - 0.05, tx + sx * 0.5 + 0.05, F + 0.72, zz + 0.05));
      col.rect([tx - 0.62, z0t, tx + 0.62, z1t], F, F + 0.8);
      for (let q = z0t + 0.9; q < z1t - 0.5; q += 2.6) { bag.add(GB, rod([tx, F + 0.77, q], [tx, F + 1.2, q], 0.02, 4)); bag.add('shutter_green', lathe([[0.04, 0], [0.18, -0.12], [0.2, -0.14]], 8, null, tx, F + 1.35, q).scale(1, 1, 1)); }
      for (const sx of [-1, 1]) for (let q = z0t + 0.5; q < z1t - 0.2; q += 1.2) { bag.add(OAK, box(tx + sx * 1.0 - 0.22, F + 0.42, q - 0.22, tx + sx * 1.0 + 0.22, F + 0.46, q + 0.22)); bag.add(OAK, box(tx + sx * 1.2 - 0.02, F + 0.46, q - 0.2, tx + sx * 1.2 + 0.02, F + 0.95, q + 0.2)); for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) bag.add(OAK, box(tx + sx * 1.0 + a - 0.02, F, q + b - 0.02, tx + sx * 1.0 + a + 0.02, F + 0.42, q + b + 0.02)); }
    }
    solid(OAK, cx - 9, rz1 - 6.5, cx + 9, rz1 - 5.2, F, F + 1.2); bag.add('marble', box(cx - 9.1, F + 1.2, rz1 - 6.6, cx + 9.1, F + 1.26, rz1 - 5.1)); const txt = 'MAIN READING ROOM', c = fitCell(txt, 8, 0.1); bag.add('car_black', box(cx - 4.5, F + 3.4, rz1 - 0.2, cx + 4.5, F + 4.4, rz1 - 0.1)); letters(Q.t('gold'), txt, c, (hh, v) => [cx + textLen(txt, c) / 2 - hh, F + 3.6 + v, rz1 - 0.21], 0, 0);
    for (const x of [cx - 8, cx + 8]) { solid('wood_dark', x - 1.5, rz0 + 1.5, x + 1.5, rz0 + 2.6, F, F + 1.3); }                // the catalogue cases
    Q.flush(bag); }
}

/** The people of the Library (life style): readers at the long tables, librarians at the desks, visitors in Astor Hall — [{ at, y, rot, role }] in the grid's frame. */
export function libraryPeople(rect, y) {
  const f = libraryFrame(rect, y), { F, zc, hall, rr, xb } = f, [rx0, rz0, rx1, rz1] = rr, cx = (rx0 + rx1) / 2, out = [], r = rng(1912);
  for (const tx of [cx - 5, cx + 5]) for (let z = rz0 + 6; z < rz1 - 8; z += 7.4) for (const sx of [-1, 1]) for (let q = z + 0.5; q < z + 6.2; q += 1.2) if (r() < 0.45) out.push({ at: [tx + sx * 1.0, q], y: F + 0.04, rot: sx > 0 ? Math.PI / 2 : -Math.PI / 2, role: 'read' });
  for (let k = 0; k < 3; k++) out.push({ at: [cx - 6 + k * 6, rz1 - 4.3], y: F, rot: Math.PI, role: 'desk' });
  out.push({ at: [xb - 7.8, zc - 1.5], y: F, rot: -Math.PI / 2, role: 'desk' }); out.push({ at: [xb - 9.5, zc + 1.0], y: F, rot: Math.PI / 2, role: 'visit' });
  for (let k = 0; k < 7; k++) out.push({ at: [hall[0] + 4 + r() * 10, hall[1] + 3 + r() * 24], y: F, rot: r() * 6.28, role: 'visit' });
  for (let k = 0; k < 4; k++) out.push({ at: [rx0 + 3 + r() * 20, rz0 + 5 + r() * 50], y: F, rot: r() * 6.28, role: 'visit' });
  return out;
}
