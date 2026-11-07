// The Gothic city (Paris about 1248; docs/settlements/paris.md §4): a cathedral's massing — the
// nave and choir under a steep lead roof, lower aisles, the transept, the rounded apse, the twin
// west towers with their rose; the palace's long hall. Registered into the `gothic` style.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { archWall } from './nd-interior.js';
import './index.js';

const L = 'limestone';
/** cathedral: { rect (along x, the west front at x0), nave (height), towers (height), y } */
function cathedral(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.nave ?? 33, T = el.towers ?? 69, W = z1 - z0, cz = (z0 + z1) / 2, nw = W * 0.3;
  const tw = W * 0.42, td = Math.min(16, (x1 - x0) * 0.13);
  // aisles (low, both sides) and the nave and choir (high), the roofs
  for (const s of [-1, 1]) {
    const r = [x0 + td, s < 0 ? z0 : cz + nw / 2, x1 - W * 0.4, s < 0 ? cz - nw / 2 : z1];
    bag.add(L, box(r[0], y - 0.5, r[1], r[2], y + H * 0.45, r[3])); col.rect(r, y, y + H * 0.45);
    bag.add('lead', frustum([r[0], r[1], r[2], r[3]], y + H * 0.45, y + H * 0.52, 0, 0, s < 0 ? 0 : (r[3] - r[1]) * 0.98, s < 0 ? (r[3] - r[1]) * 0.98 : 0));
  }
  const n = [x0 + td, cz - nw / 2, x1 - W * 0.4, cz + nw / 2];
  bag.add(L, box(n[0], y - 0.5, n[1], n[2], y + H, n[3])); col.rect(n, y, y + H);
  bag.add('lead', frustum([n[0], n[1] - 0.4, n[2], n[3] + 0.4], y + H, y + H + nw * 0.85, 0, 0, nw / 2 + 0.35, nw / 2 + 0.35));
  // the transept
  const tx = x0 + (x1 - x0) * 0.58, t = [tx - nw / 2, z0 - 2, tx + nw / 2, z1 + 2];
  bag.add(L, box(t[0], y - 0.5, t[1], t[2], y + H, t[3])); col.rect(t, y, y + H);
  bag.add('lead', frustum([t[0] - 0.4, t[1], t[2] + 0.4, t[3]], y + H, y + H + nw * 0.85, nw / 2 + 0.35, nw / 2 + 0.35, 0, 0));
  for (const zz of [t[1] - 0.06, t[3] + 0.06]) bag.add('stained_glass', box(tx - nw * 0.32, y + H * 0.45, zz - 0.04, tx + nw * 0.32, y + H * 0.8, zz + 0.04));   // the transept's great windows
  // the apse: the choir's rounded east end, its ambulatory lower round it
  const ax = x1 - W * 0.4;
  bag.add(L, lathe([[W * 0.5, 0], [W * 0.5, H * 0.45 + 0.5], [0.001, H * 0.45 + 0.5]], 20, null, ax, y - 0.5, cz));
  bag.add(L, lathe([[nw / 2, 0], [nw / 2, H + 0.5], [0.001, H + 0.5]], 16, null, ax, y - 0.5, cz));
  bag.add('lead', lathe([[nw / 2 + 0.4, 0], [0.001, nw * 0.85]], 16, null, ax, y + H, cz));
  col.circle(ax, cz, W * 0.5, y, y + H);
  // the west front: two towers and the rose between them
  for (const s of [-1, 1]) {
    const r = [x0, s < 0 ? z0 : z1 - tw, x0 + td, s < 0 ? z0 + tw : z1];
    bag.add(L, box(r[0], y - 0.5, r[1], r[2], y + T, r[3])); col.rect(r, y, y + T); col.floor(r, y + T);
    for (let k = 0; k < 3; k++) bag.add('opening', box(r[0] - 0.05, y + T * 0.68, r[1] + tw * (0.15 + k * 0.27), r[0] + 0.02, y + T * 0.93, r[1] + tw * (0.3 + k * 0.27)));
  }
  const m = [x0, z0 + tw, x0 + td, z1 - tw];
  bag.add(L, box(m[0], y - 0.5, m[1], m[2], y + T * 0.65, m[3])); col.rect(m, y, y + T * 0.65);
  bag.add('stained_glass', box(x0 - 0.06, y + T * 0.36 - 5, cz - 5, x0 + 0.02, y + T * 0.36 + 5, cz + 5));   // the rose
  for (let k = 0; k < 3; k++) bag.add('opening', box(x0 - 0.05, y, z0 + tw * 0.25 + k * (W - tw * 0.5) / 3, x0 + 0.02, y + 9, z0 + tw * 0.25 + k * (W - tw * 0.5) / 3 + 4.5));
}
/** great_hall: a long hall { rect, h, y } — stone walls, tall windows, a steep slate roof. */
function greatHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 16, along = x1 - x0 > z1 - z0;
  bag.add(L, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y, y + h);
  const w = along ? z1 - z0 : x1 - x0;
  bag.add('slate', frustum([x0 - 0.4, z0 - 0.4, x1 + 0.4, z1 + 0.4], y + h, y + h + w * 0.7, along ? 0 : w / 2 + 0.35, along ? 0 : w / 2 + 0.35, along ? w / 2 + 0.35 : 0, along ? w / 2 + 0.35 : 0));
  const len = along ? x1 - x0 : z1 - z0, n = Math.floor(len / 6);
  for (let i = 0; i < n; i++) { const u = (along ? x0 : z0) + (i + 0.5) * len / n; for (const s of [0, 1]) { const q = along ? [u - 1, s ? z1 - 0.02 : z0 - 0.06, u + 1, s ? z1 + 0.06 : z0 + 0.02] : [s ? x1 - 0.02 : x0 - 0.06, u - 1, s ? x1 + 0.06 : x0 + 0.02, u + 1]; bag.add('opening', box(q[0], y + h * 0.3, q[1], q[2], y + h * 0.85, q[3])); } }
}
Object.assign(STYLES.gothic.elements, { cathedral, great_hall: greatHall });

function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

/**
 * pont: a stone bridge of the 12th–13th century lined with houses (docs/settlements/paris.md §2a) —
 * { rect [x0, z0, x1, z1] (the deck runs along z, across the river; x0 the downstream side), y (the
 * deck), bed, water (level), n (arches), abut (the length of each abutment on the bank), street (its width) }. Round arches on piers with pointed
 * cutwaters up- and downstream, the deck paved between two kerbs; the houses stand on the strips
 * either side of the street (built by the caller as timber houses).
 */
function pont(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, bed = el.bed, wl = el.water, n = el.n, W = z1 - z0, PW = 2.6, ab = el.abut ?? 5;
  const span = (W - 2 * ab - (n - 1) * PW) / n, r = span / 2, spring = y - 0.8 - r;
  const out = [], M = (u, yy, d) => [d, yy, z0 + u];
  archWall(out, M, { u0: 0, u1: W, d0: x0, d1: x1, y0: bed, y1: y - 0.25, openings: Array.from({ length: n }, (_, i) => ({ uc: ab + i * (span + PW) + r, r, sill: bed, spring, f: 0.5 })), n: 10 });
  bag.add('limestone', fromTriangles(out));
  // the cutwaters, pointed, up to a little above the floods' line, capped with a sloping stone
  const cw = [];
  for (let i = 1; i < n; i++) {
    const za = z0 + ab + i * (span + PW) - PW, zb = za + PW, zm = (za + zb) / 2, top = wl + 2.6;
    for (const [xf, sg] of [[x0, -1], [x1, 1]]) {
      hexa(cw, [[xf, bed, za], [xf, bed, zb], [xf + sg * 2.0, bed, zm], [xf + sg * 2.0, bed, zm]], [[xf, top, za], [xf, top, zb], [xf + sg * 2.0, top, zm], [xf + sg * 2.0, top, zm]]);
      hexa(cw, [[xf, top, za], [xf, top, zb], [xf + sg * 2.0, top, zm], [xf + sg * 2.0, top, zm]], [[xf, top + 1.2, za + 0.6], [xf, top + 1.2, zb - 0.6], [xf + sg * 0.3, top + 1.2, zm], [xf + sg * 0.3, top + 1.2, zm]]);
    }
  }
  bag.add('limestone', fromTriangles(cw));
  // a moulded string course over the arches; the deck's paving and its kerbs
  for (const xf of [x0, x1]) bag.add('limestone', box(xf - 0.2, y - 0.75, z0, xf + 0.2, y - 0.45, z1));
  const xs0 = (x0 + x1) / 2 - el.street / 2, xs1 = xs0 + el.street;
  bag.add('flagstone', box(x0, y - 0.25, z0, x1, y, z1));
  for (const xk of [xs0, xs1]) bag.add('limestone', box(xk - 0.15, y, z0, xk + 0.15, y + 0.15, z1));
  col.floor([x0, z0, x1, z1], y);
  col.rect([x0 - 2, z0 + 4, x0, z1 - 4], bed, y);
  col.rect([x1, z0 + 4, x1 + 2, z1 - 4], bed, y);
}

/**
 * mill_pendant: a water-mill hung on the bridge's downstream face (Paris's bridges carried mills;
 * docs/settlements/paris.md §2a) — { at [x, z] (the bridge's face), dir (−1: it stands out toward −x),
 * w (along the face), y (the deck), water }. A timber mill-house on cantilevered beams over the water,
 * its weatherboarded walls, a pent roof; under it the undershot wheel between two posts, dipping in the
 * stream; a ladder down to it.
 */
function millPendant(el, { bag, col }) {
  const [x, z] = el.at, s = el.dir ?? -1, w = el.w ?? 6, y = el.y, wl = el.water, D = 4.2;
  const X = (d) => x + s * d, xr = (a, b) => [Math.min(X(a), X(b)), Math.max(X(a), X(b))];
  // the beams run out from the bridge, struts under them back to the pier
  for (const zz of [z - w / 2 + 0.3, z + w / 2 - 0.3]) {
    const [a, b] = xr(0, D + 0.4); bag.add('timber', box(a, y - 0.75, zz - 0.15, b, y - 0.45, zz + 0.15));
    bag.add('timber', rod([X(0), wl + 1.2, zz], [X(D * 0.7), y - 0.75, zz], 0.1, 6));
  }
  // the house: floor, walls of boards, door to the bridge, a small window, the pent roof sloping outward
  const [a, b] = xr(0.1, D), h = 3.2;
  bag.add('timber', box(a, y - 0.45, z - w / 2, b, y - 0.25, z + w / 2));
  bag.add('half_timber', box(a, y - 0.25, z - w / 2, b, y + h, z + w / 2));
  for (let k = 0; k <= 8; k++) bag.add('timber', box(a - 0.03, y - 0.25 + k * 0.4, z - w / 2 - 0.03, b + 0.03, y - 0.2 + k * 0.4, z + w / 2 + 0.03));
  const [wa, wb] = xr(D - 0.02, D + 0.05); bag.add('opening', box(wa, y + 1.2, z - 0.5, wb, y + 2.0, z + 0.5));
  const r = [], top = y + h + 1.1;
  hexa(r, [[X(-0.2), top - 0.15, z - w / 2 - 0.3], [X(-0.2), top - 0.15, z + w / 2 + 0.3], [X(D + 0.6), y + h - 0.15, z + w / 2 + 0.3], [X(D + 0.6), y + h - 0.15, z - w / 2 - 0.3]], [[X(-0.2), top, z - w / 2 - 0.3], [X(-0.2), top, z + w / 2 + 0.3], [X(D + 0.6), y + h, z + w / 2 + 0.3], [X(D + 0.6), y + h, z - w / 2 - 0.3]]);
  bag.add('tile_dark', fromTriangles(r));
  col.rect([a, z - w / 2, b, z + w / 2], y - 0.5, top);
  // the wheel: two rims on spokes, sixteen paddles, the axle into the house's wall; its posts
  // (beside the house's end, its axle through the end wall)
  const R = 2.3, cy = wl + R - 0.45, cxw = X(D * 0.5 + 0.4), half = 1.1, zw = z + w / 2 + half + 0.35;
  for (const zz of [zw - half, zw + half]) {
    bag.add('wood_dark', lathe([[R, -0.08], [R, 0.08], [R - 0.18, 0.08], [R - 0.18, -0.08], [R, -0.08]], 24, null, 0, 0, 0).rotateX(Math.PI / 2).translate(cxw, cy, zz));
    for (let k = 0; k < 8; k++) { const t = k * Math.PI / 8; bag.add('timber', rod([cxw - Math.cos(t) * (R - 0.1), cy - Math.sin(t) * (R - 0.1), zz], [cxw + Math.cos(t) * (R - 0.1), cy + Math.sin(t) * (R - 0.1), zz], 0.05, 4)); }
  }
  const pd = [];
  for (let k = 0; k < 16; k++) {
    const t = k * Math.PI / 8, c = Math.cos(t), sn = Math.sin(t), Pt = (rr, o, zz) => [cxw + c * rr - sn * o, cy + sn * rr + c * o, zz];
    hexa(pd, [Pt(R - 0.55, -0.04, zw - half), Pt(R + 0.1, -0.04, zw - half), Pt(R + 0.1, 0.04, zw - half), Pt(R - 0.55, 0.04, zw - half)], [Pt(R - 0.55, -0.04, zw + half), Pt(R + 0.1, -0.04, zw + half), Pt(R + 0.1, 0.04, zw + half), Pt(R - 0.55, 0.04, zw + half)]);
  }
  bag.add('timber', fromTriangles(pd));
  bag.add('iron', rod([cxw, cy, z + w / 2 - 0.2], [cxw, cy, zw + half + 0.6], 0.09, 8));
  bag.add('timber', box(cxw - 0.15, el.bed ?? wl - 3, zw + half + 0.45, cxw + 0.15, y - 0.45, zw + half + 0.75));
  { const [p0, p1] = xr(0, D * 0.5 + 0.55); bag.add('timber', box(p0, y - 0.75, zw + half + 0.45, p1, y - 0.45, zw + half + 0.75)); }
  col.circle(cxw, zw, R, wl - 1, cy + R);
}

/**
 * boat_seine: a flat-bottomed river boat of the Seine (the "marchands de l'eau" carried wine, grain,
 * wood and salt on it) — { at [x, z], yaw, len, water, load ('casks'|'sacks'|'wood'|'') }: the hull of
 * planks rising to square ends, the thwarts, the long pole and the steering oar, the cargo.
 */
function boatSeine(el, { bag, col }) {
  const [x, z] = el.at, a = el.yaw ?? 0, L = el.len ?? 12, B = L * 0.22, wl = el.water, ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v, yy) => [x + ca * u - sa * v, yy, z + sa * u + ca * v];
  const hull = [], bot = wl - 0.35, gun = wl + 0.55;
  // the bottom, the sides flaring out, the ends rising
  for (const sg of [-1, 1]) {
    const tris = []; const q = (p1, p2, p3, p4) => tris.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    q(P(-L * 0.42, sg * B * 0.4, bot), P(L * 0.42, sg * B * 0.4, bot), P(L * 0.5, sg * B * 0.5, gun + 0.25), P(-L * 0.5, sg * B * 0.5, gun + 0.25));
    for (let i = 0; i < tris.length; i += 18) { const t = tris.slice(i, i + 18); hull.push(...t, ...t.slice(0, 3), ...t.slice(6, 9), ...t.slice(3, 6), ...t.slice(9, 12), ...t.slice(15, 18), ...t.slice(12, 15)); }
  }
  for (const e of [-1, 1]) { const t = [...P(e * L * 0.42, -B * 0.4, bot), ...P(e * L * 0.42, B * 0.4, bot), ...P(e * L * 0.5, B * 0.5, gun + 0.25), ...P(e * L * 0.42, -B * 0.4, bot), ...P(e * L * 0.5, B * 0.5, gun + 0.25), ...P(e * L * 0.5, -B * 0.5, gun + 0.25)]; hull.push(...t, ...t.slice(0, 3), ...t.slice(6, 9), ...t.slice(3, 6), ...t.slice(9, 12), ...t.slice(15, 18), ...t.slice(12, 15)); }
  { const t = [...P(-L * 0.42, -B * 0.4, bot + 0.02), ...P(L * 0.42, -B * 0.4, bot + 0.02), ...P(L * 0.42, B * 0.4, bot + 0.02), ...P(-L * 0.42, -B * 0.4, bot + 0.02), ...P(L * 0.42, B * 0.4, bot + 0.02), ...P(-L * 0.42, B * 0.4, bot + 0.02)]; hull.push(...t, ...t.slice(0, 3), ...t.slice(6, 9), ...t.slice(3, 6), ...t.slice(9, 12), ...t.slice(15, 18), ...t.slice(12, 15)); }
  bag.add('tar_wood', fromTriangles(hull));
  // the gunwales, thwarts
  for (const sg of [-1, 1]) bag.add('timber', rod(P(-L * 0.5, sg * B * 0.5, gun + 0.27), P(L * 0.5, sg * B * 0.5, gun + 0.27), 0.07, 5));
  for (const u of [-0.3, 0, 0.3]) bag.add('timber', rod(P(u * L, -B * 0.46, gun), P(u * L, B * 0.46, gun), 0.08, 5));
  // the steering oar over the stern, the pole along the side
  bag.add('timber', rod(P(-L * 0.5, 0, gun + 0.3), P(-L * 0.5 - 3.2, 0, wl - 0.2), 0.06, 5));
  bag.add('timber', rod(P(-L * 0.35, B * 0.42, gun + 0.35), P(L * 0.38, B * 0.42, gun + 0.35), 0.04, 5));
  // the cargo
  const ld = el.load || '';
  if (ld === 'casks') for (let i = 0; i < 6; i++) for (const sg of [-1, 1]) { const p = P(-L * 0.25 + i * L * 0.1, sg * B * 0.2, bot + 0.05); bag.add('wood_dark', lathe([[0.32, 0], [0.38, 0.45], [0.32, 0.9]], 10, null, p[0], p[1], p[2])); }
  if (ld === 'sacks') for (let i = 0; i < 8; i++) for (const sg of [-1, 1]) { const p = P(-L * 0.28 + i * L * 0.075, sg * B * 0.18, bot + 0.05); bag.add('sacking', lathe([[0.28, 0], [0.34, 0.2], [0.28, 0.45], [0.001, 0.52]], 7, null, p[0], p[1], p[2])); }
  if (ld === 'wood') for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) { const v = -B * 0.3 + i * B * 0.15; bag.add('bark_dark', rod(P(-L * 0.3, v, bot + 0.2 + k * 0.28), P(L * 0.3, v, bot + 0.2 + k * 0.28), 0.13, 6)); }
  col.circle(x, z, L * 0.5, bot, gun + 0.3);
}
/**
 * changer_table: { at, y, rot (the side the changer sits, −z when 0: he faces +z, the street), seed } — a money-changer's
 * or goldsmith's board on the Grand Pont (docs/settlements/paris.md §2b): a trestle table under a green cloth, piles of
 * silver deniers and a few gold pieces, the balance with its two pans on its stand, the weights in their box, an
 * iron-bound coffer beside it; for a goldsmith (seed odd) cups and a ring tray instead of the coin heaps.
 */
function changerTable(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, c = Math.cos(a), sn = Math.sin(a), gold = (el.seed ?? 0) % 2 === 1;
  const put = (m, g) => bag.add(m, g.rotateY(-a).translate(x, y, z));
  const W = 1.5, D = 0.7, H = 0.8;
  for (const sx of [-0.62, 0.62]) { put('timber', box(sx - 0.03, 0, -0.3, sx + 0.03, H - 0.04, -0.24)); put('timber', box(sx - 0.03, 0, 0.24, sx + 0.03, H - 0.04, 0.3)); put('timber', box(sx - 0.03, H * 0.35, -0.3, sx + 0.03, H * 0.35 + 0.05, 0.3)); }
  put('timber', box(-W / 2, H - 0.04, -D / 2, W / 2, H, D / 2));
  put('cloth_green', box(-W / 2 - 0.01, H, -D / 2 - 0.01, W / 2 + 0.01, H + 0.006, D / 2 + 0.01));
  put('cloth_green', box(-W / 2 - 0.01, H - 0.28, D / 2 + 0.005, W / 2 + 0.01, H + 0.006, D / 2 + 0.012));
  const t = H + 0.006;
  if (!gold) {
    for (const [px, pz, n, m] of [[-0.45, 0.12, 6, 'silver'], [-0.35, -0.05, 9, 'silver'], [-0.22, 0.15, 4, 'silver'], [-0.5, -0.12, 5, 'gold'], [-0.12, 0.02, 7, 'silver']])
      put(m, lathe([[0.001, 0], [0.012, 0], [0.012, n * 0.0025], [0.001, n * 0.0025]], 8).translate(px, t, pz));
    put('silver', box(-0.3, t, 0.18, -0.05, t + 0.002, 0.28));            // deniers spread out to be counted
  } else {
    for (const [px, pz, h] of [[-0.45, 0.1, 0.16], [-0.25, 0.08, 0.12]]) put('silver', lathe([[0.03, 0], [0.012, 0.02], [0.01, h * 0.5], [0.05, h * 0.85], [0.055, h], [0.045, h], [0.001, h * 0.85]], 10).translate(px, t, pz));
    put('wood_dark', box(-0.2, t, -0.15, 0.05, t + 0.025, 0.0)); for (let i = 0; i < 4; i++) put('gold', lathe([[0.012, 0], [0.012, 0.004]], 6).translate(-0.17 + i * 0.06, t + 0.025, -0.08));
  }
  // the balance: a post on a foot, the beam, two pans hung by cords
  put('bronze', lathe([[0.05, 0], [0.04, 0.02], [0.008, 0.03], [0.007, 0.36], [0.001, 0.37]], 8).translate(0.3, t, -0.05));
  put('bronze', box(0.12, t + 0.33, -0.054, 0.48, t + 0.342, -0.046));
  for (const px of [0.14, 0.46]) { put('bronze', lathe([[0.001, 0], [0.055, 0.005], [0.06, 0.02], [0.001, 0.012]], 10).translate(px, t + 0.12, -0.05)); for (const d of [-0.03, 0.03]) put('cloth_brown', box(px + d - 0.002, t + 0.135, -0.052, px + d + 0.002, t + 0.335, -0.048)); }
  put('wood_dark', box(0.48, t, 0.1, 0.66, t + 0.06, 0.24));                // the box of weights
  // the coffer at the changer's feet
  put('wood_dark', box(0.82, 0, -0.3, 1.32, 0.4, 0.05)); for (const px of [0.92, 1.22]) put('iron', box(px - 0.02, 0, -0.31, px + 0.02, 0.41, 0.06));
  void c; void sn;
  col.circle(x, z, 0.8, y, y + H);
}

Object.assign(STYLES.gothic.elements, { changer_table: changerTable, pont, mill_pendant: millPendant, boat_seine: boatSeine });
