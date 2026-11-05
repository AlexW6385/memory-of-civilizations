// Norse Norway (12th–13th c.; docs/settlements/norse-borgund.md §4): the stave church — the nave
// raised on its ring of staves above the aisles, the ambulatory (svalgang) round it under a lean-to
// roof, the chancel and the round apse with its little tower, the roofs stacked one above another
// under tarred shingles, the turret with its spire, dragon heads on the gables; the free-standing
// bell house; the farm's buildings of round logs notched at the corners, the dwellings under sod,
// the storehouse (loft) raised on posts.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import '../qing/index.js';

const W = 'tar_wood', SH = 'tar_shingle', LOG = 'log_pine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A gable roof over rect, the ridge along the longer side (or `alongX`), overhang o. */
function gable(bag, mat, [x0, z0, x1, z1], y, pitch, o = 0.3, alongX = null) {
  const ax = alongX ?? (x1 - x0 >= z1 - z0);
  const r = [x0 - o, z0 - o, x1 + o, z1 + o];
  if (ax) { const h = (z1 - z0 + 2 * o) / 2; bag.add(mat, frustum(r, y, y + h * pitch, 0, 0, h, h, { noBottom: true, noTop: true })); return y + h * pitch; }
  const h = (x1 - x0 + 2 * o) / 2; bag.add(mat, frustum(r, y, y + h * pitch, h, h, 0, 0, { noBottom: true, noTop: true })); return y + h * pitch;
}
/** A carved dragon head leaning out from a gable end at (x, y, z), pointing along dir (+1/-1 on x). */
function dragon(bag, x, y, z, dir, s = 1) {
  // the neck rising out from the gable's ridge in three curving pieces, the head with its open jaws and crest
  const seg = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); const g = box(0, -w, -w * 0.8, L, w, w * 0.8); g.rotateZ(Math.atan2(dy, dx * dir)); g.translate(x + a[0] * dir, y + a[1], z); bag.add(W, g); };
  const P = [[0, 0], [0.45 * s, 0.35 * s], [0.75 * s, 0.85 * s], [0.95 * s, 1.35 * s]];
  for (let i = 0; i < 3; i++) seg(P[i], P[i + 1], (0.14 - i * 0.02) * s);
  const h0 = P[3];
  seg(h0, [h0[0] + 0.55 * s, h0[1] + 0.12 * s], 0.11 * s);           // the upper jaw
  seg([h0[0] + 0.05 * s, h0[1] - 0.06 * s], [h0[0] + 0.5 * s, h0[1] - 0.22 * s], 0.06 * s);     // the lower jaw, open
  seg([h0[0] - 0.08 * s, h0[1] + 0.08 * s], [h0[0] - 0.25 * s, h0[1] + 0.4 * s], 0.05 * s);     // the crest curling back
}
/** A small cross on a gable's apex. */
function cross(bag, x, y, z, s = 1) { bag.add(W, box(x - 0.05 * s, y, z - 0.05 * s, x + 0.05 * s, y + 1.0 * s, z + 0.05 * s)); bag.add(W, box(x - 0.05 * s, y + 0.55 * s, z - 0.3 * s, x + 0.05 * s, y + 0.65 * s, z + 0.3 * s)); }
/** stave_church: { c, y, s (scale) } — the west door, the chancel and apse east. */
function staveChurch(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, X = (v) => cx + v * s, Z = (v) => cz + v * s, U = (v) => y + v * s;
  // the ambulatory: a low wall with round-arched openings, posts and a lean-to roof
  const sv = [X(-7.4), Z(-6.8), X(6), Z(6.8)];
  bag.add(W, box(sv[0], y - 0.4, sv[1], sv[2], U(1.1), sv[3])); col.rect(sv, y, U(2.6));
  for (const zz of [sv[1], sv[3]]) for (let k = 0; k < 9; k++) { const x = sv[0] + (k + 0.5) * (sv[2] - sv[0]) / 9; bag.add('opening', box(x - 0.45 * s, U(1.15), zz - 0.03, x + 0.45 * s, U(2.3), zz + 0.03)); }
  bag.add(W, box(sv[0], U(2.3), sv[1], sv[2], U(2.6), sv[3]));
  bag.add(SH, frustum([sv[0] - 0.3, sv[1] - 0.3, sv[2] + 0.3, sv[3] + 0.3], U(2.6), U(4.2), 1.9 * s, 0.3, 1.9 * s, 1.9 * s, { noBottom: true }));
  // the aisles round the nave's core, their roof sloping in to the clerestory
  const ai = [X(-5.6), Z(-5), X(5.4), Z(5)];
  bag.add(W, box(ai[0], U(2.6), ai[1], ai[2], U(5.6), ai[3]));
  bag.add(SH, frustum([ai[0] - 0.3, ai[1] - 0.3, ai[2] + 0.3, ai[3] + 0.3], U(5.6), U(7.4), 1.8 * s, 1.6 * s, 1.8 * s, 1.8 * s, { noBottom: true }));
  // the nave's raised core on its staves, its steep gable and the dragon heads
  const co = [X(-4), Z(-3.4), X(4), Z(3.4)];
  bag.add(W, box(co[0], U(7.4), co[1], co[2], U(10.5), co[3]));
  const ridge = gable(bag, SH, co, U(10.5), 1.55, 0.35 * s, true);
  for (const [x, d] of [[co[0] - 0.3, -1], [co[2] + 0.3, 1]]) { bag.add(W, box(x - 0.1, ridge - 0.3, cz - 0.1, x + 0.1, ridge + 0.6, cz + 0.1)); dragon(bag, x, ridge - 0.4, cz, d, s * 1.1); }
  // the west porch
  const po = [X(-8.8), Z(-1.6), sv[0], Z(1.6)];
  bag.add(W, box(po[0], y - 0.4, po[1], po[2], U(2.4), po[3])); col.rect(po, y, U(2.4));
  const pr = gable(bag, SH, po, U(2.4), 1.2, 0.25, true);
  cross(bag, po[0] - 0.25, pr - 0.15, cz, s * 0.8);
  // the west portal: the door under a round head, framed by broad carved jambs (the vine and dragon work) and a capital each side
  bag.add('opening', box(po[0] - 0.04, y, cz - 0.6 * s, po[0], U(1.9), cz + 0.6 * s));
  bag.add('opening', lathe([[0.6 * s, 0], [0.6 * s, 0.04], [0.001, 0.04]], 12, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(po[0] - 0.02, U(1.9), cz));
  for (const sz of [-1, 1]) {
    bag.add(W, box(po[0] - 0.14, y, cz + sz * 0.62 * s - (sz > 0 ? 0 : 0.42 * s), po[0] - 0.02, U(1.95), cz + sz * 0.62 * s + (sz > 0 ? 0.42 * s : 0)));
    for (let k = 0; k < 6; k++) bag.add(W, box(po[0] - 0.2, U(0.2 + k * 0.3), cz + sz * 0.83 * s - 0.08 * s, po[0] - 0.12, U(0.36 + k * 0.3), cz + sz * 0.83 * s + 0.08 * s));
    bag.add(W, box(po[0] - 0.22, U(1.95), cz + sz * 0.83 * s - 0.25 * s, po[0] - 0.02, U(2.1), cz + sz * 0.83 * s + 0.25 * s));
  }
  // the chancel and the round apse with its tower
  const ch = [sv[2], Z(-2.6), X(9.6), Z(2.6)];
  bag.add(W, box(ch[0], y - 0.4, ch[1], ch[2], U(5.2), ch[3])); col.rect(ch, y, U(5.2));
  bag.add(SH, frustum([ch[0] - 0.3, ch[1] - 0.3, ch[2] + 0.3, ch[3] + 0.3], U(5.2), U(6), 0.3, 0.3, 0.9, 0.9, { noBottom: true }));
  bag.add(W, box(ch[0] + 0.5, U(6), Z(-1.8), ch[2] - 0.3, U(7.6), Z(1.8)));
  const cr = gable(bag, SH, [ch[0] + 0.5, Z(-1.8), ch[2] - 0.3, Z(1.8)], U(7.6), 1.4, 0.3, true);
  cross(bag, ch[0] + 0.2, cr - 0.15, cz, s * 0.9);
  const ax = X(11);
  bag.add(W, lathe([[2 * s, 0], [2 * s, 4.6 * s], [0.001, 4.6 * s]], 16, null, ax, y - 0.4, cz)); col.circle(ax, cz, 2 * s, y, U(4.6));
  bag.add(SH, lathe([[2.3 * s, 0], [0.7 * s, 2.2 * s], [0.001, 2.4 * s]], 16, null, ax, U(4.2), cz));
  bag.add(W, lathe([[0.6 * s, 0], [0.6 * s, 1.4 * s], [0.001, 1.4 * s]], 8, null, ax, U(6.3), cz));
  bag.add(SH, lathe([[0.8 * s, 0], [0.001, 2.6 * s]], 8, null, ax, U(7.7), cz));
  // the turret on the nave's ridge: two stacked skirts and the spire
  const t = (r) => [cx - r * s, cz - r * s, cx + r * s, cz + r * s];
  const ty = ridge - 1.2 * s;
  bag.add(W, box(cx - 1.3 * s, ty, cz - 1.3 * s, cx + 1.3 * s, ty + 2.4 * s, cz + 1.3 * s));
  bag.add(SH, frustum(t(1.9), ty + 2.4 * s, ty + 3.2 * s, 0.6 * s, 0.6 * s, 0.6 * s, 0.6 * s, { noBottom: true }));
  bag.add(W, box(cx - 0.9 * s, ty + 3.2 * s, cz - 0.9 * s, cx + 0.9 * s, ty + 4.6 * s, cz + 0.9 * s));
  bag.add(SH, lathe([[1.4 * s, 0], [0.001, 6.5 * s]], 4, null, cx, ty + 4.6 * s, cz));
  bag.add('iron', box(cx - 0.04, ty + 11 * s, cz - 0.04, cx + 0.04, ty + 12 * s, cz + 0.04));
}
/** bell_house: { c, y, s } — the free-standing bell tower: a square body, a skirt roof, the open belfry, a pyramid cap. */
function bellHouse(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, s = el.s ?? 4;
  bag.add(W, box(x - s / 2, y - 0.4, z - s / 2, x + s / 2, y + 4, z + s / 2)); col.rect([x - s / 2, z - s / 2, x + s / 2, z + s / 2], y, y + 4);
  bag.add(SH, frustum([x - s / 2 - 0.9, z - s / 2 - 0.9, x + s / 2 + 0.9, z + s / 2 + 0.9], y + 3.4, y + 4.4, 0.9, 0.9, 0.9, 0.9, { noBottom: true }));
  bag.add(W, box(x - s * 0.35, y + 4.4, z - s * 0.35, x + s * 0.35, y + 6.4, z + s * 0.35));
  for (const f of [-1, 1]) { bag.add('opening', box(x - s * 0.2, y + 4.9, z + f * s * 0.35 - 0.03, x + s * 0.2, y + 6.1, z + f * s * 0.35 + 0.03)); bag.add('opening', box(x + f * s * 0.35 - 0.03, y + 4.9, z - s * 0.2, x + f * s * 0.35 + 0.03, y + 6.1, z + s * 0.2)); }
  bag.add(SH, lathe([[s * 0.65, 0], [0.001, s * 0.9]], 4, null, x, y + 6.4, z));
}
/** log_house: { rect, y, foot, kind ('stue' | 'barn' | 'loft'), roof (material, optional), seed } — round-log walls notched at the corners; sod roofs on dwellings, shingles or boards on the rest; the loft on posts. */
function logHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1), kind = el.kind ?? 'stue';
  if (kind === 'loft') {
    for (const [px, pz] of [[x0 + 0.3, z0 + 0.3], [x1 - 0.3, z0 + 0.3], [x0 + 0.3, z1 - 0.3], [x1 - 0.3, z1 - 0.3]]) bag.add('rubble', box(px - 0.3, foot, pz - 0.3, px + 0.3, y + 1, pz + 0.3));
    col.rect(el.rect, foot, y + 4.6);
    bag.add(LOG, box(x0 + 0.3, y + 1, z0 + 0.3, x1 - 0.3, y + 2.9, z1 - 0.3));
    bag.add(LOG, box(x0 - 0.4, y + 2.9, z0 - 0.4, x1 + 0.4, y + 4.6, z1 + 0.4));
    bag.add('opening', box(x0 + 0.8, y + 1.2, z1 - 0.33, x0 + 1.6, y + 2.6, z1 - 0.29));
    gable(bag, SH, [x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4], y + 4.6, 0.9, 0.3);
    return;
  }
  const H = kind === 'barn' ? 4.2 : 3.2;
  bag.add('rubble', box(x0 - 0.1, foot, z0 - 0.1, x1 + 0.1, y + 0.4, z1 + 0.1));
  bag.add(LOG, box(x0, y + 0.4, z0, x1, y + H, z1)); col.rect(el.rect, foot, y + H);
  // the notched corners: the log ends standing out
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add(LOG, box(px - 0.3, y + 0.4, pz - 0.3, px + 0.3, y + H, pz + 0.3));
  const f = rand() < 0.5 ? z0 : z1, sg = f === z0 ? -1 : 1, mx = (x0 + x1) / 2;
  bag.add('opening', box(mx - 0.5, y + 0.4, f + sg * 0.01, mx + 0.5, y + 2.2, f + sg * 0.05));
  if (kind === 'stue') bag.add('opening', box(mx + 1.2, y + 1.3, f + sg * 0.01, mx + 2, y + 2, f + sg * 0.05));
  const top = gable(bag, el.roof ?? (kind === 'stue' ? 'sod' : rand() < 0.5 ? 'sod' : SH), el.rect, y + H, kind === 'stue' ? 0.5 : 0.7, 0.45);
  if (kind === 'stue' && rand() < 0.8) bag.add('rubble', box(mx - 1.6, top - 1.2, (z0 + z1) / 2 - 0.35, mx - 0.9, top + 0.6, (z0 + z1) / 2 + 0.35));
}
/** fence: { pts, y, h } — a fence of split staves along a polyline. */
function fence(el, { bag, col }) {
  const pts = el.pts, y = el.y ?? 0, h = el.h ?? 1.2;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.5);
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; bag.add(W, box(x - 0.08, y - 0.3, z - 0.08, x + 0.08, y + h + (k % 2) * 0.15, z + 0.08)); }
    col.segment([ax, az], [bx, bz], 0.2, y, y + h);
  }
}
registerStyle('norse', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, stave_church: staveChurch, bell_house: bellHouse, log_house: logHouse, fence },
  objects: {},
});
