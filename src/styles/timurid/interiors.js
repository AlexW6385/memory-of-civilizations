// The monuments' interiors (docs/settlements/timurid-samarkand.md §7, §15): the domed chambers one walks into. The dress of a square
// chamber under a dome (an onyx-marble dado, bands of lapis and gold, a Kufic frieze, the ring that turns the square into
// the round drum, the inner drum and the inner dome in lapis ribbed with gilt) and what stands in each: Timur's cenotaphs in
// Gur-e Amir, the prayer hall of Bibi-Khanym with its mihrab and minbar, the instruments of Ulugh Beg's observatory.
// Everything is in a frame's local coordinates (x, z; the chamber's middle at c).

import { box, lathe, place, rod } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';
import { bannai, LAP, TUR, CRE, WHI } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));

/**
 * chamber: a square room { c: [x, z], hx, hz (half sizes), h (to the ring), floor ('marble_floor'), dado (2.0), innerR, drumH, domeH, ribs,
 * frieze (the Kufic band's top, h − 1) }: the floor, the dado and the bands on the four walls, the ring, the inner drum and dome.
 * The walls themselves are the caller's (solids); the finish is laid 3 cm off their inner faces.
 */
export function chamber(fr, o) {
  const { bag } = fr, [cx, cz] = o.c, hx = o.hx, hz = o.hz, h = o.h, dado = o.dado ?? 2.0, ir = o.innerR, ey = 0.04;
  bx(bag, o.floor ?? 'marble_floor', cx - hx, 0, cz - hz, cx + hx, 0.06, cz + hz);
  // the walls: a dado of marble, a gilt moulding, plaster above with a lapis band and a Kufic frieze
  const walls = [[[cx - hx, cz - hz], [cx - hx, cz + hz], [1, 0]], [[cx + hx, cz + hz], [cx + hx, cz - hz], [-1, 0]], [[cx + hx, cz - hz], [cx - hx, cz - hz], [0, 1]], [[cx - hx, cz + hz], [cx + hx, cz + hz], [0, -1]]];
  const skip = o.skipWall;
  walls.forEach(([a, b, n], i) => {
    if (i === skip) return;
    const L0 = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L0, (b[1] - a[1]) / L0];
    const ranges = i === o.doorWall ? [[0, o.door[0]], [o.door[1], L0]] : [[0, L0]];
    for (const [r0, r1] of ranges) {
    const L = r1;
    const put = (m, s0, s1, y0, y1, d) => { const A = [a[0] + u[0] * s0 + n[0] * (ey + d - 0.012), a[1] + u[1] * s0 + n[1] * (ey + d - 0.012)], Bq = [a[0] + u[0] * s1 + n[0] * (ey + d), a[1] + u[1] * s1 + n[1] * (ey + d)]; bx(bag, m, A[0], y0, A[1], Bq[0], y1, Bq[1]); };
    put(o.dadoMat ?? 'marble', r0, L, 0.06, dado, 0.03);
    put('mosaic_gold', r0, L, dado, dado + 0.12, 0.05);
    put('plaster_persian', r0, L, dado + 0.12, h, 0.012);
    put('tile_lapis', r0, L, dado + 0.9, dado + 1.3, 0.04);
    put('mosaic_gold', r0, L, dado + 1.3, dado + 1.38, 0.05);
    put('mosaic_gold', r0, L, dado + 0.82, dado + 0.9, 0.05);
    bannai(bag, { a, b, n, d: ey + 0.04, y: 0, s0: r0 + 0.2, s1: L - 0.2, v0: h - 1.7, v1: h - 0.6, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.5, seed: i + 7 });
    put('mosaic_gold', r0, L, h - 0.6, h - 0.5, 0.05);
    // a row of tall blind niches between the bands (a dark arch each)
    const nn = Math.max(1, Math.round((L - r0) / 3.2)), w = (L - r0) / nn;
    for (let k = 0; k < nn; k++) { const s = r0 + (k + 0.5) * w; put('tile_turquoise', s - w * 0.28, s + w * 0.28, dado + 1.5, h - 2.0, 0.06); put('plaster_persian', s - w * 0.24, s + w * 0.24, dado + 1.6, h - 2.2, 0.07); }
    }
  });
  // the ring from the square to the round drum, the inner drum, the inner dome
  const diag = Math.hypot(hx, hz) + 0.3;
  bag.add('tile_lapis', lathe([[ir, h], [diag, h]], 28, null, cx, 0, cz));
  bag.add('mosaic_gold', lathe([[ir, h - 0.04], [ir + 0.5, h - 0.04]], 28, null, cx, 0, cz));
  const dh = o.drumH, dh0 = h, ir2 = ir;
  bag.add('plaster_persian', lathe([[ir2, dh0 + dh], [ir2, dh0]], 40, null, cx, 0, cz));
  bag.add('tile_turquoise', lathe([[ir2 - 0.02, dh0 + dh * 0.5 + 0.5], [ir2 - 0.02, dh0 + dh * 0.5 - 0.5]], 40, null, cx, 0, cz));
  bag.add('mosaic_gold', lathe([[ir2 - 0.03, dh0 + dh * 0.5 + 0.1], [ir2 - 0.03, dh0 + dh * 0.5 - 0.1]], 40, null, cx, 0, cz));
  // little arched windows round the drum (light slits), dark
  const nw = 12; for (let k = 0; k < nw; k++) { const a = k / nw * Math.PI * 2, wx = cx + Math.cos(a) * (ir2 - 0.03), wz = cz + Math.sin(a) * (ir2 - 0.03); bag.add('lacquer_black', place(box(-0.35, 0, -0.02, 0.35, 1.8, 0.02), wx, dh0 + dh * 0.2, wz, -a - Math.PI / 2)); }
  const prof = [], n = 22, r0 = ir2, dhh = o.domeH, y0 = dh0 + dh;
  for (let i = 0; i <= n; i++) { const t = i / n, ang = t * Math.PI / 2; prof.push([Math.max(0.001, r0 * Math.cos(ang) ** 0.9), dhh * Math.sin(ang) ** 1.1]); }
  const rev = prof.slice().reverse();
  bag.add('glaze_lapis', lathe(rev, (o.ribs ?? 24) * 4, (th, i) => (i < rev.length - 1 ? 1 + 0.025 * Math.cos((o.ribs ?? 24) * th) : 1), cx, y0, cz));
  bag.add('mosaic_gold', lathe([[0.001, dhh - 0.02], [r0 * 0.12, dhh - 0.06], [r0 * 0.12, dhh - 0.3], [0.001, dhh - 0.36]].map(([r, y]) => [r, y]).reverse(), 10, null, cx, y0, cz));
  bag.add('mosaic_gold', lathe([[r0 - 0.02, 0.02], [r0 - 0.02, 0.5]].reverse(), 40, null, cx, y0, cz));
}

/** Timur's tomb chamber's cenotaphs { at: [x, z] centre, axis }: the dark jade block of Timur and the marble stones of the others. */
export function cenotaph(bag, col, x, z, yaw, jade = false, k = 1) {
  const L = 1.9 * k, Wd = 0.82 * k;
  const R = (u0, v0, u1, v1) => { const c = Math.cos(yaw), s = Math.sin(yaw); return [x + u0 * c + v0 * s, z - u0 * s + v0 * c, x + u1 * c + v1 * s, z - u1 * s + v1 * c]; };
  const put = (m, g) => bag.add(m, place(g, x, 0, z, yaw));
  put('marble', box(-L / 2 - 0.25, 0, -Wd / 2 - 0.25, L / 2 + 0.25, 0.22, Wd / 2 + 0.25));
  put('marble', box(-L / 2 - 0.1, 0.22, -Wd / 2 - 0.1, L / 2 + 0.1, 0.36, Wd / 2 + 0.1));
  put(jade ? 'serpentine' : 'marble', box(-L / 2, 0.36, -Wd / 2, L / 2, 0.6, Wd / 2));
  put(jade ? 'serpentine' : 'marble', box(-L / 2 + 0.12, 0.6, -Wd / 2 + 0.08, L / 2 - 0.12, 0.76, Wd / 2 - 0.08));
  put(jade ? 'serpentine' : 'marble', box(-L / 2 + 0.3, 0.76, -0.12, L / 2 - 0.3, 0.9, 0.12));
  if (jade) { put('gilt_bronze', box(-L / 2 - 0.01, 0.5, -Wd / 2 - 0.01, L / 2 + 0.01, 0.53, -Wd / 2)); put('gilt_bronze', box(-L / 2 - 0.01, 0.5, Wd / 2, L / 2 + 0.01, 0.53, Wd / 2 + 0.01)); }
  else put('gilt_bronze', box(-L / 2 + 0.2, 0.7, -0.02, L / 2 - 0.2, 0.705, 0.02));
  const r = R(-L / 2 - 0.25, -Wd / 2 - 0.25, L / 2 + 0.25, Wd / 2 + 0.25);
  col.rect([Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])], 0, 0.95);
}

/** The prayer hall's furnishing { c, hx, hz, qibla: +z }: rows of rugs, the mihrab niche with its frame, the minbar, Qur'an stands, lamps. */
export function prayerHall(fr, o, lights) {
  const { bag, col } = fr, [cx, cz] = o.c, hx = o.hx, hz = o.hz, zq = cz + hz;
  // the mihrab: a pointed niche in a lapis-and-turquoise frame on the qibla wall, muqarnas cells over it, gilt inscription band
  const mw = 3.4, mh = o.mh ?? 7.5;
  bx(bag, 'tile_lapis', cx - mw / 2 - 0.9, 0.06, zq - 0.14, cx + mw / 2 + 0.9, mh + 1.4, zq - 0.08);
  bx(bag, 'tile_turquoise', cx - mw / 2 - 0.6, 0.06, zq - 0.2, cx - mw / 2 - 0.3, mh + 1.0, zq - 0.14); bx(bag, 'tile_turquoise', cx + mw / 2 + 0.3, 0.06, zq - 0.2, cx + mw / 2 + 0.6, mh + 1.0, zq - 0.14);
  bx(bag, 'tile_turquoise', cx - mw / 2 - 0.6, mh + 0.7, zq - 0.2, cx + mw / 2 + 0.6, mh + 1.0, zq - 0.14);
  bx(bag, 'mosaic_gold', cx - mw / 2 - 0.9, mh + 1.0, zq - 0.2, cx + mw / 2 + 0.9, mh + 1.1, zq - 0.14);
  bx(bag, 'lacquer_black', cx - mw / 2, 0.06, zq - 0.26, cx + mw / 2, mh - 1.4, zq - 0.2);
  for (let i = 0; i < 5; i++) { const w2 = mw - i * 0.55; bx(bag, i % 2 ? 'tile_cream' : 'tile_turquoise', cx - w2 / 2, mh - 1.4 + i * 0.5, zq - 0.3 - i * 0.04, cx + w2 / 2, mh - 0.9 + i * 0.5, zq - 0.26 - i * 0.04); }
  bx(bag, 'mosaic_gold', cx - 0.3, 0.06, zq - 0.3, cx + 0.3, 0.8, zq - 0.26);
  // the minbar: a flight of steps with side boards and a canopy, beside the mihrab
  { const mx = cx + mw / 2 + 2.4, steps = o.steps ?? 7;
    for (let i = 0; i < steps; i++) bx(bag, 'wood_dark', mx - 0.55, 0.06, zq - 0.3 - (steps - i) * 0.4, mx + 0.55, 0.3 + i * 0.3, zq - 0.3 - (steps - i) * 0.4 + 0.4);
    for (const sx of [-0.6, 0.6]) bx(bag, 'wood_painted', mx + sx - 0.04, 0.3, zq - 0.3 - steps * 0.4, mx + sx + 0.04, 2.5, zq - 0.3);
    bx(bag, 'wood_painted', mx - 0.65, 2.5, zq - 0.3 - 0.8, mx + 0.65, 2.65, zq - 0.3); bx(bag, 'wood_ochre', mx - 0.55, 2.2, zq - 0.9, mx + 0.55, 2.5, zq - 0.3);
    col.rect([mx - 0.7, zq - 0.3 - steps * 0.4, mx + 0.7, zq - 0.3], 0, 2.7); }
  // rows of prayer rugs facing the qibla, a Qur'an stand and a lamp at the wall
  const rows = o.single ? 0 : Math.floor((hz * 2 - 5) / 2.2), per = Math.floor((hx * 2 - 3) / 1.1);
  for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) if (((i + r) * 7) % 5 !== 0) F.prayerRug(bag, cx - hx + 1.5 + i * 1.1 + (r % 2) * 0.25, 0.065, cz - hz + 2.2 + r * 2.2, Math.PI, ['persian', 'blue', 'maroon'][(i + r) % 3]);
  if (o.single) { for (let i = 0; i < per; i++) if (Math.abs(i * 1.1 - per * 0.55) > 1.9) F.prayerRug(bag, cx - hx + 1.5 + i * 1.1, 0.065, zq - 1.35, Math.PI, ['persian', 'blue', 'maroon'][i % 3]); F.carpet(bag, cx, 0.06, zq - 1.5, 3.6, 2.0, 0, 'persian'); for (const sx of [-5, 5, 10, -10]) F.rahle(bag, cx + sx, 0.065, zq - 0.7, Math.PI, { h: 0.5 }); }
  else { F.carpet(bag, cx, 0.06, zq - 3.5, 6, 3.0, 0, 'persian');
  for (const sx of [-4.2, 4.2, 0]) { F.rahle(bag, cx + sx - 0.0, 0.065, zq - 7.5 + (sx === 0 ? 1 : 0), Math.PI, { h: 0.5 }); } }
  if (o.single) { for (const sx of [-12, -6, 0, 6, 12]) F.mosqueLamp(bag, lights, cx + sx, o.lampY, cz, o.lampTop, { k: 1.1, enamel: true, glow: 3, reach: 9 }); return; }
  for (const sx of [-1, 1]) F.mosqueLamp(bag, lights, cx + sx * hx * 0.45, o.lampY ?? 7, cz + hz * 0.3, o.lampTop ?? 12, { k: 1.4, enamel: true, glow: 4, reach: 18 });
  F.mosqueLamp(bag, lights, cx, o.lampY ?? 7, cz - hz * 0.2, o.lampTop ?? 12, { k: 1.6, enamel: true, glow: 5, reach: 22 });
  void rod;
}
