// The Roman city (Rome under Hadrian; docs/settlements/rome.md §4–§5): insulae of brick-faced
// concrete, four and five storeys over arcaded shops, tiled roofs; the great baths, a brick mass of
// vaulted halls with tall arched windows round a domed hall; porticoes of columns round long
// enclosures; the stadium's tiers of seats round its arena. Registered into the `roman` style.

import { STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Arched openings (dark) along one face of a block: { r: rect, face, y0, h, w, step }. */
function arches(bag, r, face, y0, h, w, step) {
  const along = face === 'n' || face === 's', L = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / step);
  for (let i = 0; i < n; i++) {
    const u = (along ? r[0] : r[1]) + (i + 0.5) * L / n, q = face === 'n' ? [u - w / 2, r[1] - 0.06, u + w / 2, r[1] + 0.04] : face === 's' ? [u - w / 2, r[3] - 0.04, u + w / 2, r[3] + 0.06] : face === 'w' ? [r[0] - 0.06, u - w / 2, r[0] + 0.04, u + w / 2] : [r[2] - 0.04, u - w / 2, r[2] + 0.06, u + w / 2];
    bag.add('opening', box(q[0], y0, q[1], q[2], y0 + h, q[3]));
  }
}
/** insula: { rect, seed, y } — an apartment block round a light court, shops in arches on the street. */
function insula(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = 4 + (rand() < 0.4 ? 1 : 0), sh = 3.2, H = n * sh;
  bag.add('brick', box(x0, y - 0.5, z0, x1, y + H, z1)); col.rect(el.rect, y - 0.5, y + H); col.floor(el.rect, y + H);
  if (!el.simple) {
    for (const f of 'nsew') arches(bag, el.rect, f, y, 2.6, 2.2, 3.4);
    for (let k = 1; k < n; k++) for (const f of 'nsew') arches(bag, el.rect, f, y + k * sh + 0.8, 1.3, 0.9, 2.4);
  }
  const rise = Math.min(x1 - x0, z1 - z0) * 0.22;
  bag.add('roof_tile', frustum([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], y + H, y + H + rise, (x1 - x0) * 0.2, (x1 - x0) * 0.2, (z1 - z0) / 2 + 0.25, (z1 - z0) / 2 + 0.25));
}
/** thermae: { rect, y, h } — the baths: a brick mass with tall arched windows and a domed hall in the middle. */
function thermae(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 22, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, r = Math.min(x1 - x0, z1 - z0) * 0.22;
  bag.add('brick', box(x0, y - 0.5, z0, x1, y + h * 0.6, z1)); col.rect(el.rect, y - 0.5, y + h * 0.6); col.floor(el.rect, y + h * 0.6);
  bag.add('brick', box(cx - (x1 - x0) * 0.32, y + h * 0.6, cz - (z1 - z0) * 0.12, cx + (x1 - x0) * 0.32, y + h, cz + (z1 - z0) * 0.12));
  for (const f of 'nsew') arches(bag, el.rect, f, y + 3, h * 0.6 - 6, 4, 9);
  bag.add('brick', lathe([[r, 0], [r, h * 0.25]], 24, null, cx, y + h * 0.6, cz));
  bag.add('dome_stucco', lathe([[r, 0], [r * 0.92, r * 0.4], [r * 0.7, r * 0.72], [r * 0.38, r * 0.93], [0.001, r]], 24, null, cx, y + h * 0.6 + h * 0.25, cz));
}
/** porticus: { rect, h, y } — a long enclosure lined inside with a colonnade, a tiled lean-to roof. */
function porticus(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 9, d = el.depth ?? 6;
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) {
    const r = [Math.min(a[0], b[0]) - 0.6, Math.min(a[1], b[1]) - 0.6, Math.max(a[0], b[0]) + 0.6, Math.max(a[1], b[1]) + 0.6];
    bag.add('brick', box(r[0], y - 0.5, r[1], r[2], y + h + 1.5, r[3])); col.rect(r, y, y + h + 1.5);
  }
  const ir = [x0 + d, z0 + d, x1 - d, z1 - d];
  for (const [a, b] of [[[ir[0], ir[1]], [ir[2], ir[1]]], [[ir[0], ir[3]], [ir[2], ir[3]]], [[ir[0], ir[1]], [ir[0], ir[3]]], [[ir[2], ir[1]], [ir[2], ir[3]]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / 4));
    for (let i = 0; i <= n; i++) STYLES.roman.column({ at: [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], y, h, d: 0.8, mat: 'travertine' }, ctx);
  }
  for (const r of [[x0, z0, x1, ir[1]], [x0, ir[3], x1, z1], [x0, ir[1], ir[0], ir[3]], [ir[2], ir[1], x1, ir[3]]]) {
    bag.add('travertine', box(r[0], y + h, r[1], r[2], y + h + 0.8, r[3]));
    bag.add('roof_tile', box(r[0] - 0.4, y + h + 0.8, r[1] - 0.4, r[2] + 0.4, y + h + 1.4, r[3] + 0.4));
  }
  bag.add('flagstone', box(ir[0], y - 0.3, ir[1], ir[2], y + 0.05, ir[3])); col.floor(ir, y + 0.05);
}
/** A half ring (the north side, −z) of boxes round (cx, cz) at radius r, thickness th. */
function arc(bag, col, cx, cz, r, th, y0, y1, mat, solid) {
  const n = 20;
  for (let k = 0; k < n; k++) {
    const a0 = Math.PI + k / n * Math.PI, a1 = Math.PI + (k + 1) / n * Math.PI;
    const a = [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r], b = [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r];
    bag.add(mat, orientedBox(a, b, th, y0, y1, 0.05));
    if (solid) col.segment(a, b, th, y0, y1);
  }
}
/** stadium: { rect (long along z, the curved end north), y, h, rows } — tiers of seats round the arena, a brick outer wall. */
function stadium(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 16, w = x1 - x0, t = el.depth ?? 26, rows = el.rows ?? 12;
  const ax0 = x0 + t, ax1 = x1 - t, rr = (ax1 - ax0) / 2, cz = z0 + t + rr;
  // the straight sides and the south end (stepped seats rising outward), the curved north end
  for (let i = 0; i < rows; i++) {
    const f = i / rows, yy = y + (h - 2) * (i + 1) / rows, o = t * f;
    for (const r of [[ax0 - o - t / rows, cz, ax0 - o, z1 - t + o], [ax1 + o, cz, ax1 + o + t / rows, z1 - t + o]]) { bag.add('travertine', box(r[0], y - 0.5, r[1], r[2], yy, r[3])); col.floor(r, yy); }
    { const r = [ax0 - o - t / rows, z1 - t + o, ax1 + o + t / rows, z1 - t + o + t / rows]; bag.add('travertine', box(r[0], y - 0.5, r[1], r[2], yy, r[3])); col.floor(r, yy); }
    arc(bag, col, (ax0 + ax1) / 2, cz, rr + o + t / rows / 2, t / rows + 0.05, y - 0.5, yy, 'travertine', false);
  }
  // the outer wall of arches
  for (const r of [[x0, cz, x0 + 1.2, z1], [x1 - 1.2, cz, x1, z1], [x0, z1 - 1.2, x1, z1]]) { bag.add('brick', box(r[0], y - 0.5, r[1], r[2], y + h + 2, r[3])); col.rect(r, y, y + h + 2); }
  arc(bag, col, (x0 + x1) / 2, cz, w / 2 - 0.6, 1.2, y - 0.5, y + h + 2.5, 'brick', true);
  bag.add('ground', box(ax0, y - 0.3, cz - rr, ax1, y + 0.02, z1 - t));
}
Object.assign(STYLES.roman.elements, { insula, thermae, porticus, stadium });
