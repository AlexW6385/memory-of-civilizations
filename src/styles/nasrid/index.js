// Nasrid architecture (14th c.; docs/settlements/granada.md §4): the red walls and square towers of
// the Alhambra on its hill; palaces of plain outer walls round courts — the Court of the Myrtles
// with its long pool between arcades and the great Comares Tower, the Court of the Lions with its
// slender paired columns, pavilions and the fountain; tiled roofs; whitewashed houses below.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, disc, place } from '../../core/geom.js';
import '../qing/index.js';
import { crenels, nColumn, archRun } from './halls.js';
import { comares, lionsHalls } from './palaces.js';
import { PARTAL } from './partal.js';
import { GENERALIFE } from './generalife.js';
import { ALBAICIN } from './albaicin.js';

const W = 'tuff_red', P = 'plaster_white';
/** nasrid_tower: { rect, h, y } — a square tower of red rammed earth and brick, crenellated. */
function tower(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 14;
  bag.add(W, box(x0, y - 3, z0, x1, y + h, z1)); col.rect(el.rect, y - 3, y + h); col.floor(el.rect, y + h);
  crenels(bag, el.rect, y + h);
  // a great tower's upper storey: paired arched windows in deep frames on every face
  if (el.windows) for (const f of 'nsew') {
    const along = f === 'n' || f === 's', a = along ? x0 : z0, b = along ? x1 : z1, n = el.windows;
    for (let i = 0; i < n; i++) {
      const m = a + (b - a) * (i + 0.5) / n, yw = y + h * 0.68;
      const R = (u0, u1, dd) => f === 'n' ? [u0, z0 - dd, u1, z0 + 0.02] : f === 's' ? [u0, z1 - 0.02, u1, z1 + dd] : f === 'w' ? [x0 - dd, u0, x0 + 0.02, u1] : [x1 - 0.02, u0, x1 + dd, u1];
      const fr = R(m - 1.3, m + 1.3, 0.12); bag.add('stucco_cream', box(fr[0], yw - 0.4, fr[1], fr[2], yw + 4.2, fr[3]));
      for (const d of [-0.55, 0.55]) { const o = R(m + d - 0.4, m + d + 0.4, 0.18); bag.add('opening', box(o[0], yw, o[1], o[2], yw + 3.0, o[3])); }
    }
  }
  if (!el.windows) for (const f of 'nsew') { const along = f === 'n' || f === 's', m = along ? (x0 + x1) / 2 : (z0 + z1) / 2; const q = f === 'n' ? [m - 0.6, z0 - 0.05, m + 0.6, z0 + 0.02] : f === 's' ? [m - 0.6, z1 - 0.02, m + 0.6, z1 + 0.05] : f === 'w' ? [x0 - 0.05, m - 0.6, x0 + 0.02, m + 0.6] : [x1 - 0.02, m - 0.6, x1 + 0.05, m + 0.6]; bag.add('opening', box(q[0], y + h * 0.65, q[1], q[2], y + h * 0.65 + 2.2, q[3])); }
}
/** nasrid_wall: a→b { h, th, y, yAt } — the red curtain wall, crenellated, a walk on top. */
function wall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, th = el.th ?? 2.4, h = el.h ?? 9;
  const y = el.yAt ? Math.min(el.yAt(ax, az), el.yAt(bx, bz)) : el.y ?? 0;
  const r = [Math.min(ax, bx) - th / 2, Math.min(az, bz) - th / 2, Math.max(ax, bx) + th / 2, Math.max(az, bz) + th / 2];
  if (Math.abs(ax - bx) > 0.1 && Math.abs(az - bz) > 0.1) {
    // a slanting run: as oriented pieces
    const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 6);
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; const pa = [ax + (bx - ax) * t0, az + (bz - az) * t0], pb = [ax + (bx - ax) * t1, az + (bz - az) * t1]; const q = [Math.min(pa[0], pb[0]) - th / 2, Math.min(pa[1], pb[1]) - th / 2, Math.max(pa[0], pb[0]) + th / 2, Math.max(pa[1], pb[1]) + th / 2]; bag.add(W, box(q[0], y - 4, q[1], q[2], y + h, q[3])); col.rect(q, y - 4, y + h); }
    return;
  }
  bag.add(W, box(r[0], y - 4, r[1], r[2], y + h, r[3])); col.rect(r, y - 4, y + h); col.floor(r, y + h);
  crenels(bag, r, y + h);
}
function arcade(bag, col, a, b, y, h, step, paired = false) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i <= n; i++) {
    const x = a[0] + ux * L * i / n, z = a[1] + uz * L * i / n;
    for (const o of paired ? [-0.25, 0.25] : [0]) { bag.add('marble', lathe([[0.13, 0], [0.11, h - 0.6], [0.2, h - 0.3], [0.2, h]], 8, null, x + uz * o, y, z - ux * o)); col.circle(x + uz * o, z - ux * o, 0.14, y, y + h); }
  }
  // over the columns: stilted round arches cut in the stucco, the spandrels and the panel above them
  const th = 0.5, top = y + h + 1.6, tri = [], q = (A, B, C, D) => tri.push(...A, ...B, ...C, ...A, ...C, ...D);
  const P = (u, yy, o) => [a[0] + ux * u + uz * o, yy, a[1] + uz * u - ux * o];
  for (let i = 0; i < n; i++) {
    const u0 = L * i / n + 0.2, u1 = L * (i + 1) / n - 0.2, r = (u1 - u0) / 2, uc = (u0 + u1) / 2, ys = y + h - 0.05, K = 10;
    const pt = (k) => { const t = Math.PI - Math.PI * k / K; return [uc + Math.cos(t) * r, ys + Math.sin(t) * r * 0.9]; };
    for (let k = 0; k < K; k++) {
      const [ua, ya] = pt(k), [ub, yb] = pt(k + 1);
      for (const o of [-th / 2, th / 2]) o < 0 ? q(P(ua, ya, o), P(ub, yb, o), P(ub, top, o), P(ua, top, o)) : q(P(ub, yb, o), P(ua, ya, o), P(ua, top, o), P(ub, top, o));
      q(P(ua, ya, th / 2), P(ub, yb, th / 2), P(ub, yb, -th / 2), P(ua, ya, -th / 2));
    }
    // the posts' faces between the arches, down to the capitals
    const uL = L * i / n - 0.2, uR = L * i / n + 0.2;
    for (const o of [-th / 2, th / 2]) o < 0 ? q(P(uL, y + h - 0.05, o), P(uR, y + h - 0.05, o), P(uR, top, o), P(uL, top, o)) : q(P(uR, y + h - 0.05, o), P(uL, y + h - 0.05, o), P(uL, top, o), P(uR, top, o));
  }
  const uL = L - 0.2, uR = L + 0.2;
  for (const o of [-th / 2, th / 2]) o < 0 ? q(P(uL, y + h - 0.05, o), P(uR, y + h - 0.05, o), P(uR, top, o), P(uL, top, o)) : q(P(uR, y + h - 0.05, o), P(uL, y + h - 0.05, o), P(uL, top, o), P(uR, top, o));
  q(P(-0.2, top, -th / 2), P(L + 0.2, top, -th / 2), P(L + 0.2, top, th / 2), P(-0.2, top, th / 2));
  bag.add('stucco_cream', fromTriangles(tri.concat(flip(tri))));
  // a carved frieze and the eaves over the portico
  const fr = [Math.min(a[0], b[0]) - 0.35, Math.min(a[1], b[1]) - 0.35, Math.max(a[0], b[0]) + 0.35, Math.max(a[1], b[1]) + 0.35];
  bag.add('stucco_cream', box(fr[0], top, fr[1], fr[2], top + 0.25, fr[3]));
  bag.add('timber', box(fr[0] - 0.3, top + 0.25, fr[1] - 0.3, fr[2] + 0.3, top + 0.45, fr[3] + 0.3));
}
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };
// the inner faces of a court: a dado of glazed tiles with its border, doors in stucco frames, small windows
function courtFaces(bag, r, y, h, doors) {
  const [x0, z0, x1, z1] = r, t = 0.04;
  for (const [a, b, n] of [[[x0, z0], [x1, z0], [0, 1]], [[x0, z1], [x1, z1], [0, -1]], [[x0, z0], [x0, z1], [1, 0]], [[x1, z0], [x1, z1], [-1, 0]]]) {
    const lo = [Math.min(a[0], b[0], a[0] + n[0] * t), Math.min(a[1], b[1], a[1] + n[1] * t)], hi = [Math.max(a[0], b[0], a[0] + n[0] * t), Math.max(a[1], b[1], a[1] + n[1] * t)];
    bag.add('glaze_green', box(lo[0], y + 0.05, lo[1], hi[0], y + 1.25, hi[1]));
    const lo2 = [Math.min(a[0], b[0], a[0] + n[0] * t * 1.6), Math.min(a[1], b[1], a[1] + n[1] * t * 1.6)], hi2 = [Math.max(a[0], b[0], a[0] + n[0] * t * 1.6), Math.max(a[1], b[1], a[1] + n[1] * t * 1.6)];
    bag.add('glaze_lapis', box(lo2[0], y + 1.25, lo2[1], hi2[0], y + 1.4, hi2[1]));
    if (!doors) continue;
    // doors and windows along the long sides (x = const faces)
    if (n[0] === 0) continue;
    const L = Math.abs(b[1] - a[1]);
    for (let s = 6; s < L - 5; s += 7.5) {
      const z = Math.min(a[1], b[1]) + s, x = a[0];
      const fx0 = Math.min(x, x + n[0] * 0.09), fx1 = Math.max(x, x + n[0] * 0.09), ox0 = Math.min(x, x + n[0] * 0.12), ox1 = Math.max(x, x + n[0] * 0.12);
      bag.add('stucco_cream', box(fx0, y + 0.05, z - 1.2, fx1, y + 3.4, z + 1.2));
      bag.add('opening', box(ox0, y + 0.05, z - 0.8, ox1, y + 2.8, z + 0.8));
      bag.add('stucco_cream', box(fx0, y + h - 2.6, z - 0.9, fx1, y + h - 1.1, z + 0.9));
      for (const dz of [-0.35, 0.35]) bag.add('opening', box(ox0, y + h - 2.45, z + dz - 0.25, ox1, y + h - 1.3, z + dz + 0.25));
    }
  }
}
/** court: a palace court { rect, y, kind ('myrtles' | 'lions'), h (the rooms' height) } — rooms round it under tiled roofs, arcades, the pool or the fountain. */
function court(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 8, d = 7;
  if (el.kind === 'lions') {
    // the rooms round the court are built by lions_halls (src/styles/nasrid/palaces.js)
    bag.add('marble', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
    return lionsCourt(bag, col, el.rect, y, h);
  }
  for (const r of [[x0 - d, z0 - d, x1 + d, z0], [x0 - d, z1, x1 + d, z1 + d], [x0 - d, z0, x0, z1], [x1, z0, x1 + d, z1]]) {
    bag.add(P, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y, y + h);
    bag.add('roof_tile', box(r[0] - 0.3, y + h, r[1] - 0.3, r[2] + 0.3, y + h + 0.2, r[3] + 0.3));
  }
  bag.add('marble', box(x0, y - 0.3, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  courtFaces(bag, el.rect, y, h, el.kind === 'myrtles');
  if (el.kind === 'myrtles') {
    // arcades at both ends, the long pool down the middle with myrtle hedges
    arcade(bag, col, [x0 + 2, z0 + 3], [x1 - 2, z0 + 3], y, 4.5, 2.6); arcade(bag, col, [x0 + 2, z1 - 3], [x1 - 2, z1 - 3], y, 4.5, 2.6);
    const pw = (x1 - x0) * 0.32, cx = (x0 + x1) / 2, pz0 = z0 + 6.4, pz1 = z1 - 6.4;
    // the pool: a marble kerb round the water, brimming nearly to the paving
    for (const r of [[cx - pw / 2 - 0.4, pz0 - 0.4, cx + pw / 2 + 0.4, pz0], [cx - pw / 2 - 0.4, pz1, cx + pw / 2 + 0.4, pz1 + 0.4], [cx - pw / 2 - 0.4, pz0, cx - pw / 2, pz1], [cx + pw / 2, pz0, cx + pw / 2 + 0.4, pz1]]) bag.add('marble', box(r[0], y, r[1], r[2], y + 0.22, r[3]));
    bag.add('marble_dark', box(cx - pw / 2, y - 0.25, pz0, cx + pw / 2, y - 0.2, pz1));
    STYLES.qing.elements.water_rect({ rect: [cx - pw / 2, pz0, cx + pw / 2, pz1], y: y + 0.14 }, ctx);
    col.rect([cx - pw / 2 - 0.4, pz0 - 0.4, cx + pw / 2 + 0.4, pz1 + 0.4], y, y + 0.4);
    // a round basin with its jet at each end of the pool
    for (const bz of [pz0 - 1.6, pz1 + 1.6]) {
      bag.add('marble', lathe([[0.001, 0], [0.75, 0], [0.75, 0.32], [0.62, 0.32], [0.62, 0.18], [0.001, 0.18]], 16, null, cx, y + 0.05, bz));
      bag.add('water', lathe([[0.001, 0], [0.62, 0], [0.001, 0.001]], 16, null, cx, y + 0.33, bz));
      bag.add('marble', lathe([[0.06, 0], [0.04, 0.35], [0.001, 0.38]], 8, null, cx, y + 0.2, bz));
    }
    // the myrtle hedges, clipped, broken into lengths, either side of the pool
    for (const sx of [-1, 1]) for (let z = pz0 + 0.6; z < pz1 - 0.6; z += 4.1) {
      const za = z, zb = Math.min(pz1 - 0.6, z + 3.8), xa = cx + sx * (pw / 2 + 0.8), xb = cx + sx * (pw / 2 + 2.0);
      bag.add('lotus_leaf', box(Math.min(xa, xb), y, za, Math.max(xa, xb), y + 0.85, zb));
      bag.add('lotus_leaf', box(Math.min(xa, xb) + 0.12, y + 0.85, za + 0.12, Math.max(xa, xb) - 0.12, y + 1.0, zb - 0.12));
    }
  } else lionsCourt(bag, col, el.rect, y, h);
}
// ——— The Court of the Lions (docs/settlements/granada.md §4.1) ———
// Muhammad V's court about 1390: galleries of slender white marble columns standing singly, in pairs
// and in threes, cubic capitals under abaci, stilted arches with panels of sebka (the rhomb lattice)
// in the stucco above them, a carved wooden frieze, the galleries roofed in tile; a square pavilion
// on each short side, built out into the court, its arches lobed, a wooden dome inside and a tiled
// pyramid outside; the wider arches in the middle of the long sides before the halls of the Two
// Sisters and the Abencerrajes; four marble channels from the pavilions and the halls meeting at the
// fountain — the twelve-sided basin, carved with Ibn Zamrak's poem, on the backs of twelve lions
// spouting water; the low garden in the four quarters between the channels.
const MS = 'marble_smooth';
const dbl2 = (t) => fromTriangles(t.concat(flip(t)));
/** One of the twelve lions, facing out at angle a from the fountain's centre (cx, cz), standing at y: stylised, the mane in ridges, the mouth a spout. */
function lion(bag, cx, y, cz, a) {
  const add = (g) => bag.add(MS, place(g, cx, y, cz, -a));
  const lie = (prof, x, yy, seg, w) => { const g = lathe(prof, seg); g.rotateZ(-Math.PI / 2); g.scale(1, 1, w); g.translate(x, yy, 0); return g; };
  // a stocky body, square-ish in section, the haunch rounded
  add(lie([[0.001, 0], [0.11, 0.02], [0.15, 0.08], [0.16, 0.2], [0.155, 0.34], [0.17, 0.46], [0.001, 0.5]], 0.82, 0.4, 8, 0.8));
  // the mane: a bib of parallel locks over the shoulders and chest, carved in grooves
  add(box(1.2, 0.26, -0.15, 1.44, 0.68, 0.15));
  for (let k = 0; k < 7; k++) { const zz = -0.12 + k * 0.04; add(rod([1.445, 0.3, zz], [1.445, 0.66, zz], 0.014, 4)); }
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const xx = 1.23 + k * 0.045; add(rod([xx, 0.3, s * 0.152], [xx, 0.66, s * 0.152], 0.014, 4)); }
  // the head: square brow, broad muzzle, the open mouth, the ears
  add(box(1.42, 0.46, -0.13, 1.6, 0.72, 0.13));
  add(box(1.58, 0.47, -0.1, 1.71, 0.62, 0.1));
  bag.add('marble_dark', place(box(1.705, 0.52, -0.05, 1.72, 0.565, 0.05), cx, y, cz, -a));
  for (const s of [-1, 1]) { add(box(1.45, 0.72, s * 0.09 - 0.03, 1.49, 0.765, s * 0.09 + 0.03)); add(box(1.6, 0.64, s * 0.065 - 0.025, 1.62, 0.67, s * 0.065 + 0.025)); }
  // short thick legs, the paws on the step, the tail curled on the haunch
  for (const lx of [0.9, 1.3]) for (const s of [-1, 1]) { add(rod([lx, 0, s * 0.1], [lx, 0.34, s * 0.1], 0.075, 8)); add(box(lx - 0.06, 0, s * 0.1 - 0.08, lx + 0.13, 0.07, s * 0.1 + 0.08)); }
  const tail = [[0.81, 0.42, 0], [0.76, 0.26, 0.07], [0.8, 0.1, 0.13], [0.95, 0.18, 0.16], [1.05, 0.3, 0.15]];
  for (let k = 0; k + 1 < tail.length; k++) add(rod(tail[k], tail[k + 1], 0.03, 5));
}
/** The fountain of the lions at (cx, cz): the low twelve-sided step in its ring of water, the lions on it, the basin on their backs and the central drum, the poem round its rim; jets from the lions' mouths. */
function lionFountain(bag, col, cx, cz, y) {
  bag.add('water', disc(2.26, y + 0.1, 12, cx, cz));
  bag.add(MS, lathe([[2.45, 0], [2.45, 0.2], [2.26, 0.2], [2.26, 0.02]], 12, null, cx, y + 0.05, cz));
  bag.add(MS, lathe([[1.95, 0], [1.95, 0.14], [0.001, 0.14]], 12, null, cx, y + 0.05, cz));
  const yl = y + 0.19;
  for (let k = 0; k < 12; k++) {
    const a = (k + 0.5) / 12 * Math.PI * 2; lion(bag, cx, yl, cz, a);
    const ca = Math.cos(a), sa = Math.sin(a), j = [[1.72, 0.54], [1.88, 0.48], [2.0, 0.3], [2.08, -0.09]];
    for (let i = 0; i + 1 < j.length; i++) bag.add('water_jet', rod([cx + ca * j[i][0], yl + j[i][1], cz + sa * j[i][0]], [cx + ca * j[i + 1][0], yl + j[i + 1][1], cz + sa * j[i + 1][0]], 0.01, 4));
  }
  const yb = yl + 0.55, RB = 1.36;
  bag.add(MS, lathe([[0.5, 0], [0.5, 0.55]], 12, null, cx, yl, cz));
  bag.add(MS, lathe([[0.5, 0], [0.9, 0.06], [1.22, 0.28], [RB, 0.46], [RB, 0.64], [RB - 0.1, 0.64], [RB - 0.13, 0.44], [0.001, 0.36]], 12, null, cx, yb, cz));
  bag.add('water', disc(RB - 0.115, yb + 0.58, 12, cx, cz));
  bag.add(MS, lathe([[0.12, 0], [0.09, 0.3], [0.13, 0.36], [0.04, 0.42], [0.001, 0.44]], 8, null, cx, yb + 0.36, cz));
  bag.add('water_jet', rod([cx, yb + 0.8, cz], [cx, yb + 1.25, cz], 0.02, 5));
  // the poem: a band of script in low relief on the twelve faces of the rim
  for (let f = 0; f < 12; f++) {
    const a0 = f / 12 * Math.PI * 2, a1 = (f + 1) / 12 * Math.PI * 2, n = 9;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, ax = Math.cos(a0) * (1 - t) + Math.cos(a1) * t, az = Math.sin(a0) * (1 - t) + Math.sin(a1) * t, rr = RB;
      const tall = (f * 5 + i * 3) % 4 !== 0, g = box(-0.012, 0, -0.014, 0.012, tall ? 0.13 : 0.05, 0.014);
      bag.add('marble_dark', place(g, cx + ax * rr, yb + 0.5, cz + az * rr, -Math.atan2(az, ax)));
    }
  }
  col.circle(cx, cz, 2.45, y, y + 2.2);
}
/** A marble channel from (a) to (b) along an axis, its kerbs and water; a small round basin with its jet at b. */
function channel(bag, col, a, b, y, basin = true) {
  const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]), lo = (i) => Math.min(a[i], b[i]), hi = (i) => Math.max(a[i], b[i]);
  const R = (o0, o1) => alongX ? [lo(0), a[1] + o0, hi(0), a[1] + o1] : [a[0] + o0, lo(1), a[0] + o1, hi(1)];
  for (const [o0, o1] of [[-0.25, -0.13], [0.13, 0.25]]) { const r = R(o0, o1); bag.add(MS, box(r[0], y, r[1], r[2], y + 0.14, r[3])); }
  const w = R(-0.13, 0.13); bag.add('water', box(w[0], y, w[1], w[2], y + 0.1, w[3]));
  if (!basin) return;
  bag.add(MS, lathe([[0.6, 0], [0.6, 0.26], [0.5, 0.26], [0.5, 0.06]], 16, null, b[0], y, b[1]));
  bag.add('water', disc(0.5, y + 0.19, 16, b[0], b[1]));
  bag.add(MS, lathe([[0.07, 0], [0.05, 0.3], [0.001, 0.34]], 8, null, b[0], y + 0.06, b[1]));
  bag.add('water_jet', rod([b[0], y + 0.34, b[1]], [b[0], y + 0.62, b[1]], 0.015, 4));
  col.circle(b[0], b[1], 0.6, y, y + 0.3);
}
/** A sloping roof slab of tiles over a gallery (ceiling of timber below): quad pts [[x, z]…] with heights from H(x, z). */
function slab(bag, pts, H, t = 0.14) {
  const T = pts.map(([x, z]) => [x, H(x, z), z]), Bt = pts.map(([x, z]) => [x, H(x, z) - t, z]), top = [], bot = [], edge = [];
  top.push(...T[0], ...T[1], ...T[2], ...T[0], ...T[2], ...T[3]); bot.push(...Bt[0], ...Bt[2], ...Bt[1], ...Bt[0], ...Bt[3], ...Bt[2]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; edge.push(...T[i], ...Bt[i], ...Bt[j], ...T[i], ...Bt[j], ...T[j]); }
  bag.add('roof_tile', dbl2(top)); bag.add('timber', dbl2(bot.concat(edge)));
}
function lionsCourt(bag, col, rect, y, h) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, g = 2.6, hc = 3.2, top = 5.3, e = g + 0.5;
  const cols = new Map(), C = (x, z) => cols.set(`${x.toFixed(2)},${z.toFixed(2)}`, [x, z]);
  const cornerW = 0.37, pairW = 0.37, oneW = 0.2;
  // a station's columns: 1 single, 2 a pair along the run, 'c' a corner (its column and one along each run — the other run adds its own)
  const stations = (A, B, list) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L; for (const [u, k] of list) { const x = A[0] + ux * u, z = A[1] + uz * u; if (k === 1) C(x, z); else if (k === 2) { C(x - ux * 0.17, z - uz * 0.17); C(x + ux * 0.17, z + uz * 0.17); } else { C(x, z); C(x + ux * (u < L / 2 ? 0.32 : -0.32), z + uz * (u < L / 2 ? 0.32 : -0.32)); } } return list.map(([u, k]) => ({ u, w: k === 1 ? oneW : k === 2 ? pairW : cornerW })); };
  // the long sides: four bays each side of the wider middle arch before the hall
  const longSt = (Lr) => { const m = Lr / 2, hb = m - 1.9, out = [[0, 'c']]; for (let i = 1; i < 4; i++) out.push([hb * i / 4, i === 2 ? 2 : 1]); out.push([m - 1.9, 2], [m + 1.9, 2]); for (let i = 1; i < 4; i++) out.push([m + 1.9 + hb * i / 4, i === 2 ? 2 : 1]); out.push([Lr, 'c']); return out; };
  for (const zz of [z0 + g, z1 - g]) { const A = [x0 + g, zz], B = [x1 - g, zz], st = stations(A, B, longSt(B[0] - A[0])); archRun(bag, A, B, st, y, hc, top, { sebka: true }); const fx = [x0 + g - 0.3, zz - 0.3, x1 - g + 0.3, zz + 0.3]; bag.add('timber', box(fx[0], y + top, fx[1], fx[2], y + top + 0.25, fx[3])); }
  // the short sides: a bay each side of the pavilion
  const ph = 2.4, pz0 = cz - ph, pz1 = cz + ph;
  for (const xx of [x0 + g, x1 - g]) for (const [za, zb] of [[z0 + g, pz0], [pz1, z1 - g]]) {
    const A = [xx, za], B = [xx, zb], L = zb - za, st = stations(A, B, za < cz ? [[0, 'c'], [L, 1]] : [[0, 1], [L, 'c']]);
    archRun(bag, A, B, st, y, hc, top, { sebka: true }); bag.add('timber', box(xx - 0.3, y + top, za - (za < cz ? 0.3 : 0), xx + 0.3, y + top + 0.25, zb + (za < cz ? 0 : 0.3)));
  }
  // the pavilions, square, their back part in the gallery
  const ptop = hc + 2.4, band = hc + 3.9;
  for (const sx of [-1, 1]) {
    const pc = sx < 0 ? x0 + g + 1.2 : x1 - g - 1.2, bx = pc + sx * ph, fx = pc - sx * ph;   // back and front faces
    const fr = stations([fx, pz0], [fx, pz1], [[0, 'c'], [1.4, 1], [3.4, 1], [4.8, 'c']]);
    archRun(bag, [fx, pz0], [fx, pz1], fr, y, hc, ptop, { lobed: true, sebka: true });
    archRun(bag, [bx, pz0], [bx, pz1], stations([bx, pz0], [bx, pz1], [[0, 'c'], [4.8, 'c']]), y, hc, ptop, { lobed: true });
    for (const zz of [pz0, pz1]) { const A = [bx, zz], B = [fx, zz]; archRun(bag, A, B, stations(A, B, [[0, 'c'], [1.2, 1], [4.8, 'c']]), y, hc, ptop, { lobed: true, sebka: true }); }
    const lo = Math.min(bx, fx), hi = Math.max(bx, fx);
    for (const r of [[lo - 0.25, pz0 - 0.25, hi + 0.25, pz0 + 0.25], [lo - 0.25, pz1 - 0.25, hi + 0.25, pz1 + 0.25], [lo - 0.25, pz0 + 0.25, lo + 0.25, pz1 - 0.25], [hi - 0.25, pz0 + 0.25, hi + 0.25, pz1 - 0.25]]) bag.add('stucco_cream', box(r[0], y + ptop, r[1], r[2], y + band, r[3]));
    // a carved band round the top, the wooden dome inside (seen from below), the corners under it, the eaves, the tiled pyramid
    bag.add('timber', box(lo - 0.32, y + band - 0.45, pz0 - 0.32, hi + 0.32, y + band - 0.15, pz1 + 0.32));
    const rd = ph - 0.25, dome = [];
    for (let k = 0; k <= 8; k++) { const t = Math.PI / 2 * k / 8; dome.push([Math.max(0.001, rd * Math.cos(t)), (band - ptop) * Math.sin(t)]); }
    bag.add('cedar', lathe(dome.reverse(), 24, null, pc, y + ptop, cz));
    const fan = [];
    for (const [qx, qz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) { const a0 = Math.atan2(qz, qx) - Math.PI / 4; for (let k = 0; k < 6; k++) { const t0 = a0 + Math.PI / 2 * k / 6, t1 = a0 + Math.PI / 2 * (k + 1) / 6; fan.push(pc + qx * rd, y + ptop + 0.01, cz + qz * rd, pc + Math.cos(t0) * rd, y + ptop + 0.01, cz + Math.sin(t0) * rd, pc + Math.cos(t1) * rd, y + ptop + 0.01, cz + Math.sin(t1) * rd); } }
    bag.add('cedar', dbl2(fan));
    bag.add('timber', box(lo - 0.8, y + band, pz0 - 0.8, hi + 0.8, y + band + 0.12, pz1 + 0.8));
    bag.add('roof_tile', place(lathe([[(ph + 0.8) * Math.SQRT2, 0], [0.001, 2.0]], 4), pc, y + band + 0.12, cz, Math.PI / 4));
    channel(bag, col, [sx < 0 ? cx - 2.45 : cx + 2.45, cz], [pc, cz], y + 0.05);
  }
  for (const [x, z] of cols.values()) nColumn(bag, col, x, z, y, hc);
  // the galleries' roofs, mitred at the corners, leaving the pavilions their own roofs
  const yW = y + top + 1.35, yE = y + top + 0.3;
  const Hz = (zw) => (x, z) => yW - (yW - yE) * Math.abs(z - zw) / e, Hx = (xw) => (x, z) => yW - (yW - yE) * Math.abs(x - xw) / e;
  slab(bag, [[x0, z0], [x1, z0], [x1 - e, z0 + e], [x0 + e, z0 + e]], Hz(z0));
  slab(bag, [[x1, z1], [x0, z1], [x0 + e, z1 - e], [x1 - e, z1 - e]], Hz(z1));
  for (const [xw, s] of [[x0, 1], [x1, -1]]) {
    slab(bag, [[xw, z0], [xw + s * e, z0 + e], [xw + s * e, pz0], [xw, pz0]], Hx(xw));
    slab(bag, [[xw, pz1], [xw + s * e, pz1], [xw + s * e, z1 - e], [xw, z1]], Hx(xw));
    slab(bag, [[xw, pz0], [xw + s * 1.4, pz0], [xw + s * 1.4, pz1], [xw, pz1]], Hx(xw));
  }
  // the fountain and the channels to the halls
  lionFountain(bag, col, cx, cz, y + 0.05);
  channel(bag, col, [cx, cz - 2.45], [cx, z0], y + 0.05, false); channel(bag, col, [cx, cz + 2.45], [cx, z1], y + 0.05, false);
  // the low garden in the four quarters: beds of earth edged with clipped myrtle, low shrubs in them
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const xa = sx < 0 ? x0 + g + 0.45 : cx + 0.4, xb = sx < 0 ? cx - 0.4 : x1 - g - 0.45, za = sz < 0 ? z0 + g + 0.45 : cz + 0.4, zb = sz < 0 ? cz - 0.4 : z1 - g - 0.45;
    const zf = sz < 0 ? cz - 2.8 : cz + 2.8, xf = sx < 0 ? cx - 2.8 : cx + 2.8, xp = sx < 0 ? x0 + g + 4.0 : x1 - g - 4.0;
    const beds = [[xa, sz < 0 ? za : zf, xb, sz < 0 ? zf : zb], [sx < 0 ? xp : xf, sz < 0 ? zf : za, sx < 0 ? xf : xp, sz < 0 ? zb : zf]];
    for (const r of beds) {
      if (r[2] - r[0] < 0.8 || r[3] - r[1] < 0.8) continue;
      bag.add('ground', box(r[0], y, r[1], r[2], y + 0.16, r[3]));
      for (const e2 of [[r[0], r[1], r[2], r[1] + 0.3], [r[0], r[3] - 0.3, r[2], r[3]], [r[0], r[1] + 0.3, r[0] + 0.3, r[3] - 0.3], [r[2] - 0.3, r[1] + 0.3, r[2], r[3] - 0.3]]) bag.add('lotus_leaf', box(e2[0], y + 0.16, e2[1], e2[2], y + 0.5, e2[3]));
      for (let x = r[0] + 0.9; x < r[2] - 0.6; x += 1.1) for (let z = r[1] + 0.9; z < r[3] - 0.6; z += 1.1) { const hh = 0.35 + ((x * 7 + z * 13) % 1 + 1) % 1 * 0.3; bag.add('lotus_leaf', lathe([[0.001, 0], [0.22, 0.06], [0.3, hh * 0.45], [0.24, hh * 0.85], [0.001, hh]], 8, null, x, y + 0.16, z)); }
    }
  }
}

registerStyle('nasrid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, nasrid_tower: tower, nasrid_wall: wall, court, comares, lions_halls: lionsHalls, ...PARTAL, ...GENERALIFE, ...ALBAICIN },
  objects: {},
});
