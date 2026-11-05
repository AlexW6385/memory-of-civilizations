// Nasrid architecture (14th c.; docs/settlements/granada.md §4): the red walls and square towers of
// the Alhambra on its hill; palaces of plain outer walls round courts — the Court of the Myrtles
// with its long pool between arcades and the great Comares Tower, the Court of the Lions with its
// slender paired columns, pavilions and the fountain; tiled roofs; whitewashed houses below.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';

const W = 'tuff_red', P = 'plaster_white';
function crenels(bag, r, y, mat = W) {
  const [x0, z0, x1, z1] = r;
  for (const [a, b, alongX] of [[x0, x1, true], [z0, z1, false]]) {
    const n = Math.floor((b - a) / 1.5);
    for (let i = 0; i < n; i += 2) { const u0 = a + i * (b - a) / n, u1 = u0 + (b - a) / n; for (const s of [0, 1]) { const q = alongX ? [u0, s ? z1 - 0.6 : z0, u1, s ? z1 : z0 + 0.6] : [s ? x1 - 0.6 : x0, u0, s ? x1 : x0 + 0.6, u1]; bag.add(mat, box(q[0], y, q[1], q[2], y + 1.3, q[3])); } }
  }
}
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
  } else {
    // arcades of slender columns all round, the two pavilions, the fountain of the lions
    arcade(bag, col, [x0 + 2.5, z0 + 2.5], [x1 - 2.5, z0 + 2.5], y, 4, 2.2, true); arcade(bag, col, [x0 + 2.5, z1 - 2.5], [x1 - 2.5, z1 - 2.5], y, 4, 2.2, true);
    arcade(bag, col, [x0 + 2.5, z0 + 2.5], [x0 + 2.5, z1 - 2.5], y, 4, 2.2, true); arcade(bag, col, [x1 - 2.5, z0 + 2.5], [x1 - 2.5, z1 - 2.5], y, 4, 2.2, true);
    for (const px of [x0 + 6, x1 - 6]) { bag.add('roof_tile', lathe([[3.4, 0], [0.001, 2.6]], 4, null, px, y + 5.6, (z0 + z1) / 2)); arcade(bag, col, [px - 2.5, (z0 + z1) / 2 - 2.5], [px + 2.5, (z0 + z1) / 2 - 2.5], y, 4, 1.6, true); arcade(bag, col, [px - 2.5, (z0 + z1) / 2 + 2.5], [px + 2.5, (z0 + z1) / 2 + 2.5], y, 4, 1.6, true); }
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    bag.add('marble', lathe([[2.2, 0], [2.2, 0.9], [1.0, 1.0], [0.6, 2.0], [1.4, 2.2], [0.3, 2.6], [0.001, 3.0]], 12, null, cx, y, cz));
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; bag.add('marble', box(cx + Math.cos(a) * 1.6 - 0.25, y, cz + Math.sin(a) * 1.6 - 0.25, cx + Math.cos(a) * 1.6 + 0.25, y + 0.9, cz + Math.sin(a) * 1.6 + 0.25)); }
    col.circle(cx, cz, 2.2, y, y + 2);
  }
}
registerStyle('nasrid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, nasrid_tower: tower, nasrid_wall: wall, court },
  objects: {},
});
