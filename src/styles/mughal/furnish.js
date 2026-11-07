// The furnishings of the Islamic cities (Safavid Isfahan, Ottoman Istanbul, Mamluk Cairo, Mughal Agra;
// docs/settlements/isfahan.md §16, ottoman-istanbul.md §10, mamluk-cairo.md §10, mughal-agra.md §11): the
// things the rooms were used with — carpets with their borders and medallions, reed mats, floor cushions
// and bolsters, glass mosque lamps on their chains (the Mamluk enamelled kind with a blue band of the Light
// verse and gilding), Qur'an stands (the folding rahle with its open book), brass trays on low stands, chests,
// braziers, ewers and cups, water jars on their stands, bales and saddlebags, the Indian charpoy and hookah,
// the copper of the coppersmiths. Pure geometry: each builder adds its pieces to a bag by material, built at
// the origin and set at (x, y, z) turned by yaw about +y. Shared by the four styles (they import it).

import { box, lathe, rod, fromTriangles, place } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';

const PI = Math.PI;
const put = (bag, mat, g, x, y, z, yaw = 0) => bag.add(mat, place(g, x, y, z, yaw));
/** A flat polygon facing up at height y (points [x, z] in order, either way round). */
export function flatUp(pts, y) {
  // a fan from the centroid (the polygons here are all star-shaped about it), each triangle turned to face up
  const t = [], cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], up = (b[1] - cz) * (a[0] - cx) - (b[0] - cx) * (a[1] - cz) < 0;
    // the normal of (p0, p1, p2) is (p2 − p1) × (p0 − p1); order the corners so that its y is positive
    if (up) t.push(cx, y, cz, a[0], y, a[1], b[0], y, b[1]); else t.push(cx, y, cz, b[0], y, b[1], a[0], y, a[1]);
  }
  return fromTriangles(t);
}
const lozenge = (cx, cz, a, b, n = 8) => Array.from({ length: n }, (_, k) => { const t = k / n * PI * 2, c = Math.cos(t), s = Math.sin(t); const r = 1 / (Math.abs(c) / a + Math.abs(s) / b); return [cx + c * r, cz + s * r]; });
const stepped = (cx, cz, a, b) => { const p = []; for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) for (const [u, v] of sx * sz > 0 ? [[1, 0.18], [0.62, 0.18], [0.62, 0.5], [0.18, 0.5], [0.18, 1]] : [[0.18, 1], [0.18, 0.5], [0.62, 0.5], [0.62, 0.18], [1, 0.18]]) p.push([cx + sx * u * a, cz + sz * v * b]); return p; };

// ---- carpets and mats ---------------------------------------------------------------------------------------

/**
 * The palettes of the carpets (materials of differing depth ranks, laid one over another): the field, the main
 * border, the guard stripes either side of it, the medallion and its heart, the little motifs strewn on the field.
 * 'persian': a red field, a blue border and medallion (the medallion carpets of Safavid Iran); 'usak': the red
 * field and the deep blue medallion with yellow of the Uşak carpets of Ottoman Anatolia; 'mamluk': the red, green
 * and blue of the Mamluk carpets of Cairo, a field of small octagons; 'mughal': a red field with a green border and
 * flowers; 'prayer': a single prayer rug, its niche at one end; 'kilim': bands across.
 */
const PAL = {
  persian: { f: 'cloth_red', b: 'cloth_indigo', g: 'cloth_ochre', m: 'cloth_indigo', h: 'cloth_ochre', s: 'cloth_white' },
  usak: { f: 'cloth_red', b: 'cloth_indigo', g: 'cloth_ochre', m: 'cloth_indigo', h: 'cloth_ochre', s: 'cloth_ochre' },
  mamluk: { f: 'cloth_red', b: 'cloth_green', g: 'cloth_indigo', m: 'cloth_green', h: 'cloth_indigo', s: 'cloth_indigo', oct: true },
  mughal: { f: 'cloth_red', b: 'cloth_green', g: 'cloth_ochre', m: 'cloth_white', h: 'cloth_green', s: 'cloth_white' },
  blue: { f: 'cloth_indigo', b: 'cloth_red', g: 'cloth_white', m: 'cloth_red', h: 'cloth_white', s: 'cloth_ochre' },
  maroon: { f: 'cloth_maroon', b: 'cloth_indigo', g: 'cloth_ochre', m: 'cloth_indigo', h: 'cloth_ochre', s: 'cloth_white' },
};
/**
 * carpet(bag, x, y, z, w, d, yaw, kind): a pile carpet w × d (w along its local x) on the floor at y: the field, a
 * main border between two guard stripes, a medallion at the middle with its heart, a quarter medallion in each
 * corner of the field, little motifs strewn between; each layer a few millimetres over the one under it.
 */
export function carpet(bag, x, y, z, w, d, yaw = 0, kind = 'persian') {
  const P = PAL[kind] ?? PAL.persian, A = (m, g) => put(bag, m, g, x, y, z, yaw), hw = w / 2, hd = d / 2;
  A(P.f, box(-hw, 0, -hd, hw, 0.012, hd));
  const bw = Math.min(w, d) * 0.11, gw = bw * 0.18, yb = 0.0145, yg = 0.017;
  const frame = (o, t, yy, m) => { for (const r of [[-hw + o, -hd + o, hw - o, -hd + o + t], [-hw + o, hd - o - t, hw - o, hd - o], [-hw + o, -hd + o + t, -hw + o + t, hd - o - t], [hw - o - t, -hd + o + t, hw - o, hd - o - t]]) A(m, box(r[0], 0.011, r[1], r[2], yy, r[3])); };
  frame(gw, bw, yb, P.b);
  frame(0.012, gw * 0.8, yg, P.g); frame(gw + bw + 0.012, gw * 0.8, yg, P.g);
  const fw = hw - (gw + bw) * 1.15, fd = hd - (gw + bw) * 1.15;
  if (fw < 0.15 || fd < 0.15) return;
  if (P.oct) {
    // the Mamluk field: a row of octagons along the long axis, each with a star heart, small ones between
    const n = Math.max(1, Math.round(w / d)), s = 2 * fw / n, r = Math.min(s, 2 * fd) * 0.4;
    for (let i = 0; i < n; i++) { const cx = -fw + s * (i + 0.5); A(P.m, flatUp(lozenge(cx, 0, r, r, 8).map((q, k) => [cx + (q[0] - cx) * (k % 2 ? 0.92 : 1), q[1]]), yb)); A(P.h, flatUp(stepped(cx, 0, r * 0.45, r * 0.45), yg)); }
    for (let i = 0; i <= n; i++) for (const sz of [-1, 1]) { const cx = -fw + s * i, cz = sz * fd * 0.7; if (Math.abs(cx) > fw - 0.05) continue; A(P.s, flatUp(lozenge(cx, cz, r * 0.22, r * 0.22, 8), yb)); }
    return;
  }
  const ma = Math.min(fw * 0.42, fd * 0.75), mb = Math.min(fd * 0.62, fw * 0.6);
  A(P.m, flatUp(lozenge(0, 0, ma, mb, 16), yb));
  A(P.h, flatUp(lozenge(0, 0, ma * 0.42, mb * 0.42, 12), yg));
  // pendants on the long axis, the quarter medallions in the corners
  for (const s of [-1, 1]) A(P.m, flatUp([[s * ma * 0.95, -mb * 0.12], [s * (ma + fw * 0.16), 0], [s * ma * 0.95, mb * 0.12]], yb));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = sx * fw, cz = sz * fd, a = ma * 0.5, b = mb * 0.5; A(P.m, flatUp([[cx, cz], [cx - sx * a, cz], [cx - sx * a * 0.7, cz - sz * b * 0.7], [cx, cz - sz * b]], yb)); }
  // the little motifs strewn on the field (boteh, rosettes), in a lattice, clear of the medallion
  const step = Math.max(0.28, Math.min(fw, fd) * 0.32);
  for (let u = -fw + step * 0.5; u < fw; u += step) for (let v = -fd + step * 0.5; v < fd; v += step) {
    if ((u / (ma + 0.1)) ** 2 + (v / (mb + 0.1)) ** 2 < 1.2) continue;
    if (Math.abs(Math.abs(u) - fw) < ma * 0.5 && Math.abs(Math.abs(v) - fd) < mb * 0.5) continue;
    A(P.s, flatUp(lozenge(u, v, step * 0.16, step * 0.16, 6), yb));
  }
}
/** A prayer rug (seccade, janamaz) w × d, its pointed niche toward −z of its own frame (turn it with yaw to face the qibla). */
export function prayerRug(bag, x, y, z, yaw = 0, kind = 'persian', w = 0.8, d = 1.25) {
  const P = PAL[kind] ?? PAL.persian, A = (m, g) => put(bag, m, g, x, y, z, yaw), hw = w / 2, hd = d / 2, bw = 0.07;
  A(P.f, box(-hw, 0, -hd, hw, 0.01, hd));
  for (const r of [[-hw, -hd, hw, -hd + bw], [-hw, hd - bw, hw, hd], [-hw, -hd + bw, -hw + bw, hd - bw], [hw - bw, -hd + bw, hw, hd - bw]]) A(P.b, box(r[0], 0.009, r[1], r[2], 0.0125, r[3]));
  // the niche (mihrab) in the field: its pointed head toward −z
  const nw = hw - bw - 0.05, ny0 = hd - bw - 0.08, ny1 = -hd + bw + 0.3;
  A(P.m, flatUp([[-nw, ny0], [nw, ny0], [nw, ny1 + 0.12], [nw * 0.5, ny1 - 0.02], [0, ny1 - 0.14], [-nw * 0.5, ny1 - 0.02], [-nw, ny1 + 0.12]], 0.0125));
  A(P.f, flatUp([[-nw + 0.06, ny0 - 0.06], [nw - 0.06, ny0 - 0.06], [nw - 0.06, ny1 + 0.14], [nw * 0.45, ny1 + 0.04], [0, ny1 - 0.06], [-nw * 0.45, ny1 + 0.04], [-nw + 0.06, ny1 + 0.14]], 0.015));
  A(P.h, flatUp(lozenge(0, ny1 + 0.12, 0.05, 0.07, 6), 0.0175));
}
/** kilim(bag, x, y, z, w, d, yaw): a flat-woven rug in bands across, with a stepped lozenge in the wide bands. */
export function kilim(bag, x, y, z, w, d, yaw = 0, mats = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']) {
  const A = (m, g) => put(bag, m, g, x, y, z, yaw), hw = w / 2, hd = d / 2;
  A(mats[0], box(-hw, 0, -hd, hw, 0.008, hd));
  const n = Math.max(3, Math.round(d / 0.35));
  for (let i = 0; i < n; i++) {
    const z0 = -hd + (i + 0.15) * d / n, z1 = -hd + (i + 0.85) * d / n;
    if (i % 2) A(mats[1 + (i >> 1) % 2], box(-hw + 0.03, 0.007, z0, hw - 0.03, 0.0105, z1));
    else { const zc = (z0 + z1) / 2, k = Math.max(1, Math.round(w / 0.5)); for (let j = 0; j < k; j++) A(mats[3], flatUp(lozenge(-hw + (j + 0.5) * w / k, zc, w / k * 0.3, (z1 - z0) * 0.42, 4), 0.0105)); }
  }
}
/** A reed mat (hasır, hasira) w × d, its edge bound. */
export function reedMat(bag, x, y, z, w, d, yaw = 0) {
  put(bag, 'reed_mat', box(-w / 2, 0, -d / 2, w / 2, 0.01, d / 2), x, y, z, yaw);
  for (const s of [-1, 1]) put(bag, 'hide_tan', box(-w / 2, 0.008, s * d / 2 - (s > 0 ? 0.05 : 0), w / 2, 0.012, s * d / 2 + (s < 0 ? 0.05 : 0)), x, y, z, yaw);
}

// ---- cushions, bolsters, divans -------------------------------------------------------------------------------

/** A soft pad (a floor cushion, a mattress): a box w × h × d with rounded edges, its foot at y. */
export function pad(w, h, d) {
  const g = lathe([[0.001, 0], [0.9, 0], [1, 0.25], [1, 0.75], [0.9, 1], [0.001, 1]], 4);
  g.rotateY(PI / 4); g.scale(w / 2 / Math.SQRT1_2 / 1, h, d / 2 / Math.SQRT1_2 / 1);
  return g;
}
export function cushion(bag, x, y, z, w, d, h = 0.12, yaw = 0, mat = 'cloth_red') { put(bag, mat, pad(w, h, d), x, y, z, yaw); }
/** A bolster (mutakka, gao takiya) of length len and radius r lying along its local x, its ends capped in a second cloth. */
export function bolster(bag, x, y, z, len, r = 0.13, yaw = 0, mat = 'cloth_red', ends = 'cloth_ochre') {
  const g = lathe([[0.001, 0], [r * 0.8, 0.005], [r, 0.04], [r, len - 0.04], [r * 0.8, len - 0.005], [0.001, len]], 10);
  g.translate(0, -len / 2, 0); g.rotateZ(PI / 2); g.translate(0, r, 0);
  put(bag, mat, g, x, y, z, yaw);
  for (const s of [-1, 1]) { const e = lathe([[0.001, 0], [r * 0.55, 0], [r * 0.5, 0.012], [0.001, 0.014]], 10); e.rotateZ(-s * PI / 2); e.translate(s * len / 2, r, 0); put(bag, ends, e, x, y, z, yaw); }
}
/**
 * A divan (sedir, sofa, dikka) along a wall: a low platform of boards (or a masonry bench) at height h, a mattress
 * on it, cushions set against the wall behind. a, b: its ends ([x, z]) along the wall, depth into the room on
 * the side of `toward` (a point in the room).
 */
export function divan(bag, col, a, b, y, toward, { h = 0.35, depth = 0.85, base = 'timber', mattress = 'cloth_red', backs = ['cloth_ochre', 'cloth_indigo', 'cloth_green'], cover = null } = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  let nx = -uz, nz = ux;
  if ((toward[0] - a[0]) * nx + (toward[1] - a[1]) * nz < 0) { nx = -nx; nz = -nz; }
  const yaw = -Math.atan2(uz, ux), cx = (a[0] + b[0]) / 2 + nx * depth / 2, cz = (a[1] + b[1]) / 2 + nz * depth / 2;
  put(bag, base, box(-L / 2, 0, -depth / 2, L / 2, h, depth / 2), cx, y, cz, yaw);
  if (col && (Math.abs(ux) < 1e-6 || Math.abs(uz) < 1e-6)) { const xs = [a[0], b[0], a[0] + nx * depth, b[0] + nx * depth], zs = [a[1], b[1], a[1] + nz * depth, b[1] + nz * depth]; col.rect([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y, y + h); }
  put(bag, mattress, pad(L - 0.04, 0.1, depth - 0.04), cx, y + h, cz, yaw);
  if (cover) put(bag, cover, box(-L / 2 + 0.02, 0, -depth / 2 - 0.012, L / 2 - 0.02, h - 0.03, -depth / 2 - 0.004), cx, y, cz + 0, yaw);
  // the back cushions against the wall: each 0.7 m, leaning
  const n = Math.max(1, Math.floor((L - 0.1) / 0.72));
  for (let i = 0; i < n; i++) {
    const s = -L / 2 + (L - n * 0.72) / 2 + (i + 0.5) * 0.72, g = pad(0.66, 0.5, 0.16);
    g.rotateX(-0.18); g.translate(s, h + 0.09, -depth / 2 + 0.12);
    put(bag, backs[i % backs.length], g, cx, y, cz, yaw);
  }
}

// ---- lamps ---------------------------------------------------------------------------------------------------

/**
 * A glass mosque lamp hung on chains (docs/settlements/mamluk-cairo.md §10): a disc foot, a wide globular body, a
 * tall flaring neck; six glass loops on the shoulder; three chains from the loops to a ring, one chain from it up to
 * `top`. With `enamel` (the Mamluk lamp): a band of blue enamel on the neck (the Light verse), a gilt band and the
 * blue band of the body, gilding at the rim. k scales the lamp (1: about 0.36 m high). Lights it when `lights`.
 */
export function mosqueLamp(bag, lights, x, y, z, top, { k = 1, enamel = false, glow = 3, reach = 7 } = {}) {
  const P = [[0.001, 0], [0.06, 0], [0.062, 0.014], [0.045, 0.024], [0.1, 0.05], [0.15, 0.1], [0.165, 0.15], [0.15, 0.2], [0.1, 0.23], [0.085, 0.25], [0.1, 0.31], [0.135, 0.36], [0.14, 0.362]].map(([r, h]) => [r * k, h * k]);
  bag.add('lamp_glass', lathe(P, 14, null, x, y, z));
  if (enamel) {
    const band = (h0, h1, d, m) => { const prof = []; for (let i = 0; i < P.length - 1; i++) { const [r0, y0] = P[i], [r1, y1] = P[i + 1]; for (const [rr, yy] of [[r0, y0], [r1, y1]]) if (yy >= h0 * k && yy <= h1 * k) prof.push([rr + d, yy]); } const ded = prof.filter((p, i, a) => !i || p[1] > a[i - 1][1] + 1e-6); if (ded.length > 1) bag.add(m, lathe(ded, 14, null, x, y, z)); };
    band(0.25, 0.362, 0.004, 'glaze_blue'); band(0.1, 0.2, 0.004, 'glaze_blue'); band(0.21, 0.24, 0.005, 'gilt_bronze');
  }
  const ly = y + 0.17 * k;
  for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2, rx = Math.cos(a) * 0.168 * k, rz = Math.sin(a) * 0.168 * k; bag.add('lamp_glass', tube(Array.from({ length: 7 }, (_, j) => { const t = j / 6 * PI; return [x + rx * (1 + 0.12 * Math.sin(t)), ly + Math.cos(t) * 0.025 * k, z + rz * (1 + 0.12 * Math.sin(t)), 0.006 * k]; }), 4)); }
  const ry = y + 0.62 * k;
  for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2; bag.add('bronze', rod([x + Math.cos(a) * 0.18 * k, ly + 0.02, z + Math.sin(a) * 0.18 * k], [x, ry, z], 0.005, 3)); }
  bag.add('bronze', lathe([[0.03, 0], [0.03, 0.02], [0.001, 0.02]], 8, null, x, ry, z));
  if (top > ry + 0.05) bag.add('iron', rod([x, ry + 0.02, z], [x, top, z], 0.008, 3));
  if (lights) lights.push({ at: [x, y + 0.12 * k, z], color: '#ffc27a', intensity: glow, distance: reach });
}
/** A small oil lamp (chiragh) of clay or brass on a ledge or in a niche: the open dish with its spout and a flame. */
export function oilLamp(bag, lights, x, y, z, mat = 'terracotta', glow = 0) {
  bag.add(mat, lathe([[0.001, 0], [0.03, 0], [0.05, 0.012], [0.055, 0.03], [0.045, 0.028], [0.001, 0.02]], 10, null, x, y, z));
  bag.add(mat, tube([[x + 0.045, y + 0.022, z, 0.012], [x + 0.08, y + 0.03, z, 0.008]], 5));
  bag.add('flame', lathe([[0.001, 0], [0.008, 0.01], [0.001, 0.035]], 6, null, x + 0.082, y + 0.032, z));
  if (lights && glow) lights.push({ at: [x, y + 0.1, z], color: '#ffb060', intensity: glow, distance: 4 });
}

// ---- stands, tables, chests ----------------------------------------------------------------------------------

/**
 * A rahle (rahla, the Qur'an stand): two boards crossing in an X, slotted through each other, opened to hold the
 * book on the cradle they make; the book open on it, its leather covers out. yaw turns the reader's side.
 */
export function rahle(bag, x, y, z, yaw = 0, { wood = 'wood_dark', h = 0.36, w = 0.34, cover = 'hide_brown', pages = 'linen' } = {}) {
  const a = 0.62, L = h / Math.sin(a) * 1.25, th = 0.018;
  for (const s of [-1, 1]) {
    const g = box(-w / 2, -th / 2, -L / 2, w / 2, th / 2, L / 2);
    g.rotateX(s * a); g.translate(0, h * 0.5, 0);
    put(bag, wood, g, x, y, z, yaw);
  }
  // the book on the cradle: each half laid on the upper arm of one board, the pages and the leather cover
  const ty = h * 0.5 + Math.sin(a) * L * 0.3;
  for (const s of [-1, 1]) {
    const cov = box(-0.13, -0.006, -0.17, 0.13, 0.006, 0.0), pg = box(-0.12, 0.006, -0.16, 0.12, 0.026, -0.004);
    for (const [g, m] of [[cov, cover], [pg, pages]]) { g.rotateX(-s * (PI / 2 - a) * 0.75); g.translate(0, ty + 0.04, s * 0.004); g.rotateY(s > 0 ? 0 : PI); put(bag, m, g, x, y, z, yaw); }
  }
}
/** A low stand (kürsü, kursi) with a round brass tray (sini) on it, and on the tray cups, a bowl and an ewer. */
export function trayTable(bag, x, y, z, { r = 0.38, h = 0.32, wood = 'wood_dark', things = true, seed = 1 } = {}) {
  // the stand: eight turned legs round a ring, a rim under the tray
  bag.add(wood, lathe([[r * 0.85, h - 0.04], [r * 0.85, h], [r * 0.7, h], [r * 0.7, h - 0.04]], 8, null, x, y, z));
  for (let i = 0; i < 6; i++) { const t = i / 6 * PI * 2 + 0.26; bag.add(wood, lathe([[0.018, 0], [0.024, 0.04], [0.016, h * 0.5], [0.022, h * 0.6], [0.016, h - 0.04]], 6, null, x + Math.cos(t) * r * 0.78, y, z + Math.sin(t) * r * 0.78)); }
  bag.add('bronze', lathe([[0.001, 0], [r, 0], [r + 0.02, 0.03], [r + 0.012, 0.032], [r - 0.01, 0.01], [0.001, 0.01]], 24, null, x, y + h, z));
  if (!things) return;
  let s = seed;
  const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 4; i++) { const t = R() * PI * 2, d = r * (0.35 + R() * 0.45); cup(bag, x + Math.cos(t) * d, y + h + 0.01, z + Math.sin(t) * d, R() < 0.5 ? 'glaze_white' : 'glaze_blue'); }
  bag.add('glaze_blue', lathe([[0.001, 0], [0.04, 0], [0.09, 0.04], [0.1, 0.06], [0.09, 0.062], [0.001, 0.02]], 12, null, x - r * 0.2, y + h + 0.01, z + r * 0.15));
  ewer(bag, x + r * 0.3, y + h + 0.01, z - r * 0.2, 0.7);
}
/** A small handleless cup (fincan, piyala) of glazed ware. */
export function cup(bag, x, y, z, mat = 'glaze_white', k = 1) { bag.add(mat, lathe([[0.001, 0], [0.018 * k, 0], [0.022 * k, 0.006 * k], [0.032 * k, 0.04 * k], [0.03 * k, 0.042 * k], [0.017 * k, 0.008 * k], [0.001, 0.008 * k]], 10, null, x, y, z)); }
/** An ewer (ibrik, aftaba) of brass: the pear body, the neck and lid, the spout and the handle; k scales it (1: 0.38 m). */
export function ewer(bag, x, y, z, k = 1, yaw = 0, mat = 'bronze') {
  const P = [[0.001, 0], [0.05, 0], [0.05, 0.015], [0.08, 0.06], [0.1, 0.13], [0.085, 0.2], [0.04, 0.25], [0.032, 0.3], [0.045, 0.33], [0.04, 0.345], [0.015, 0.37], [0.001, 0.38]];
  const g = lathe(P.map(([r, h]) => [r * k, h * k]), 12);
  put(bag, mat, g, x, y, z, yaw);
  put(bag, mat, tube([[0.08 * k, 0.11 * k, 0, 0.016 * k], [0.13 * k, 0.2 * k, 0, 0.012 * k], [0.17 * k, 0.3 * k, 0, 0.008 * k]], 6), x, y, z, yaw);
  put(bag, mat, tube([[-0.09 * k, 0.18 * k, 0, 0.008 * k], [-0.14 * k, 0.26 * k, 0, 0.008 * k], [-0.1 * k, 0.33 * k, 0, 0.008 * k], [-0.04 * k, 0.32 * k, 0, 0.008 * k]], 5), x, y, z, yaw);
}
/** A chest (sandık, sanduq) w × d × h of wood with iron straps and a lock plate, its lid a little domed. */
export function chest(bag, x, y, z, w, d, h, yaw = 0, wood = 'wood_painted') {
  put(bag, wood, box(-w / 2, 0.04, -d / 2, w / 2, h, d / 2), x, y, z, yaw);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(bag, 'wood_dark', box(sx * w / 2 - 0.04 * (sx > 0), 0, sz * d / 2 - 0.04 * (sz > 0), sx * w / 2 + 0.04 * (sx < 0), 0.04, sz * d / 2 + 0.04 * (sz < 0)), x, y, z, yaw);
  const lid = lathe([[0.001, 0], [d / 2 + 0.01, 0], [d / 2 + 0.01, 0.03], [d / 2 * 0.7, 0.07], [0.001, 0.085]], 2);
  lid.rotateY(PI / 2); lid.scale(1, 1, 1);
  put(bag, wood, box(-w / 2 - 0.01, h, -d / 2 - 0.01, w / 2 + 0.01, h + 0.05, d / 2 + 0.01), x, y, z, yaw);
  for (const u of [-w * 0.32, w * 0.32]) put(bag, 'iron', box(u - 0.025, 0.04, -d / 2 - 0.016, u + 0.025, h + 0.06, d / 2 + 0.016), x, y, z, yaw);
  put(bag, 'gilt_bronze', box(-0.05, h - 0.16, -d / 2 - 0.02, 0.05, h - 0.02, -d / 2 - 0.012), x, y, z, yaw);
}
/** A brazier (mangal) of brass: a round pan on three feet, a rim, live coals, a little glow when `lights`. */
export function brazier(bag, lights, x, y, z, r = 0.26) {
  bag.add('bronze', lathe([[0.001, 0.12], [r * 0.7, 0.12], [r, 0.22], [r * 1.12, 0.25], [r * 1.12, 0.27], [r * 0.95, 0.25], [r * 0.7, 0.15], [0.001, 0.15]], 16, null, x, y, z));
  for (let i = 0; i < 3; i++) { const t = i / 3 * PI * 2; bag.add('bronze', tube([[x + Math.cos(t) * r * 0.55, y + 0.13, z + Math.sin(t) * r * 0.55, 0.014], [x + Math.cos(t) * r * 0.8, y, z + Math.sin(t) * r * 0.8, 0.012]], 4)); }
  bag.add('lacquer_black', lathe([[0.001, 0.2], [r * 0.85, 0.22], [r * 0.6, 0.25], [0.001, 0.26]], 10, null, x, y, z));
  for (let i = 0; i < 5; i++) { const t = i * 1.3, d = r * 0.15 * (i % 3); bag.add('flame', lathe([[0.001, 0], [0.035, 0.008], [0.001, 0.025]], 6, null, x + Math.cos(t) * d, y + 0.245, z + Math.sin(t) * d)); }
  if (lights) lights.push({ at: [x, y + 0.5, z], color: '#ff8a40', intensity: 1.5, distance: 4 });
}
/** A water jar (zir, küp, matka) of porous clay on a wooden stand, a board and a cup on its mouth. */
export function waterJar(bag, x, y, z, k = 1, mat = 'terracotta') {
  const h = 0.26 * k;
  bag.add(mat, lathe([[0.001, 0], [0.06, 0.03], [0.2, 0.25], [0.25, 0.5], [0.22, 0.75], [0.12, 0.88], [0.13, 0.92], [0.13, 0.95], [0.001, 0.95]].map(([r, hh]) => [r * k, h + hh * k]), 14, null, x, y, z));
  bag.add('timber', tube(Array.from({ length: 17 }, (_, i) => { const t = i / 16 * PI * 2; return [x + Math.cos(t) * 0.17 * k, y + h + 0.17 * k, z + Math.sin(t) * 0.17 * k, 0.02]; }), 4, { capA: false, capB: false }));
  for (let i = 0; i < 3; i++) { const t = i / 3 * PI * 2 + 0.4; bag.add('timber', tube([[x + Math.cos(t) * 0.3 * k, y, z + Math.sin(t) * 0.3 * k, 0.024], [x + Math.cos(t) * 0.18 * k, y + h + 0.19 * k, z + Math.sin(t) * 0.18 * k, 0.02]], 5)); }
  bag.add('timber', box(x - 0.16 * k, y + h + 0.95 * k, z - 0.16 * k, x + 0.16 * k, y + h + 0.975 * k, z + 0.16 * k));
  cup(bag, x + 0.05 * k, y + h + 0.975 * k, z + 0.04 * k, 'bronze', 1.2);
}
/** A bale of goods w × h × d sewn in sacking or cloth and roped twice round. */
export function bale(bag, x, y, z, w, h, d, yaw = 0, mat = 'sacking') {
  put(bag, mat, pad(w, h, d), x, y, z, yaw);
  for (const u of [-w * 0.25, w * 0.25]) put(bag, 'hide_tan', box(u - 0.02, -0.005, -d / 2 - 0.012, u + 0.02, h + 0.01, d / 2 + 0.012), x, y, z, yaw);
}
/** A saddlebag (khurjin, heybe): two flat bags joined by a band, in a kilim weave, laid over a bar or the floor. */
export function saddlebag(bag, x, y, z, yaw = 0, mats = ['cloth_red', 'cloth_indigo']) {
  for (const s of [-1, 1]) {
    put(bag, mats[0], pad(0.4, 0.13, 0.38).translate(s * 0.24, 0, 0), x, y, z, yaw);
    put(bag, mats[1], box(s * 0.24 - 0.15, 0.128, -0.14, s * 0.24 + 0.15, 0.142, 0.14), x, y, z, yaw);
  }
  put(bag, mats[1], box(-0.05, 0.02, -0.12, 0.05, 0.1, 0.12), x, y, z, yaw);
}
/** A pile of rolled carpets (for the carpet seller): n rolls of length len lying side by side and one across. */
export function rolledCarpets(bag, x, y, z, n = 4, len = 1.6, yaw = 0, mats = ['cloth_red', 'cloth_maroon', 'cloth_indigo', 'cloth_red']) {
  for (let i = 0; i <= n; i++) {
    const r = 0.1 + (i % 3) * 0.015, top = i === n, g = lathe([[0.001, 0], [r, 0], [r, len], [0.001, len]], 10);
    g.translate(0, -len / 2, 0); g.rotateZ(PI / 2); if (top) g.rotateY(PI / 2);
    g.translate(top ? 0 : 0, top ? 0.22 + r : r, top ? 0 : (i - (n - 1) / 2) * 0.23);
    put(bag, mats[i % mats.length], g, x, y, z, yaw);
  }
}
/** A stack of folded cloth and bolts on a shelf or a platform: n bolts, w wide. */
export function bolts(bag, x, y, z, n = 5, yaw = 0, mats = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_maroon'], w = 0.5) {
  for (let i = 0; i < n; i++) put(bag, mats[(i * 7 + 3) % mats.length], pad(w, 0.08, 0.32), x + ((i * 37) % 5 - 2) * 0.006, y + i * 0.082, z, yaw);
}
/**
 * The copper and brass of the coppersmiths: a cauldron, nested pans, trays stood on edge, a basin and ewer, n pieces
 * set out from (x, z) along the local x (yaw).
 */
export function copperware(bag, x, y, z, yaw = 0, seed = 1, n = 5) {
  let s = seed; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * 0.42, k = R(), px = x + Math.cos(-yaw) * u, pz = z + Math.sin(-yaw) * u;
    if (k < 0.25) bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.19, 0.08], [0.2, 0.2], [0.17, 0.26], [0.19, 0.28], [0.17, 0.285], [0.15, 0.27], [0.001, 0.25]], 14, null, px, y, pz));
    else if (k < 0.5) for (let j = 0; j < 3; j++) bag.add('bronze', lathe([[0.001, 0], [0.12 - j * 0.02, 0], [0.16 - j * 0.02, 0.08], [0.15 - j * 0.02, 0.085], [0.11 - j * 0.02, 0.008], [0.001, 0.008]], 14, null, px, y + j * 0.075, pz));
    else if (k < 0.75) { const g = lathe([[0.001, 0], [0.24, 0], [0.26, 0.02], [0.255, 0.024], [0.001, 0.01]], 16); g.rotateX(PI / 2 - 0.25); g.translate(0, 0.26, 0); put(bag, 'bronze', g, px, y, pz, yaw); }
    else { bag.add('bronze', lathe([[0.001, 0], [0.08, 0], [0.16, 0.06], [0.2, 0.09], [0.19, 0.095], [0.001, 0.03]], 14, null, px, y, pz)); ewer(bag, px, y + 0.03, pz, 0.8, yaw); }
  }
}
/** Pots of the potter: a row of n jars and bowls of the given glazes. */
export function pots(bag, x, y, z, yaw = 0, n = 5, mats = ['terracotta', 'glaze_blue', 'glaze_green', 'terracotta', 'glaze_white']) {
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * 0.32, px = x + Math.cos(-yaw) * u, pz = z + Math.sin(-yaw) * u, m = mats[i % mats.length], t = i % 3;
    const P = t === 0 ? [[0.001, 0], [0.06, 0], [0.12, 0.1], [0.13, 0.2], [0.07, 0.3], [0.05, 0.36], [0.06, 0.38], [0.001, 0.38]]
      : t === 1 ? [[0.001, 0], [0.05, 0], [0.12, 0.07], [0.14, 0.1], [0.13, 0.105], [0.001, 0.03]]
        : [[0.001, 0], [0.05, 0], [0.09, 0.08], [0.1, 0.16], [0.06, 0.22], [0.035, 0.28], [0.05, 0.3], [0.001, 0.3]];
    bag.add(m, lathe(P, 12, null, px, y, pz));
  }
}
/** Sacks of grain and spice with their mouths rolled down, a heap of the goods showing in each, a brass scoop. */
export function spiceSacks(bag, x, y, z, yaw = 0, n = 4, goods = ['cloth_ochre', 'cloth_red', 'terracotta', 'cloth_brown', 'cloth_green']) {
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * 0.45, px = x + Math.cos(-yaw) * u, pz = z + Math.sin(-yaw) * u;
    bag.add('sacking', lathe([[0.001, 0], [0.17, 0], [0.2, 0.08], [0.2, 0.3], [0.23, 0.34], [0.22, 0.38], [0.17, 0.36], [0.001, 0.36]], 10, null, px, y, pz));
    bag.add(goods[i % goods.length], lathe([[0.17, 0], [0.12, 0.05], [0.001, 0.08]], 10, null, px, y + 0.35, pz));
  }
  bag.add('bronze', lathe([[0.001, 0], [0.05, 0.0], [0.06, 0.04], [0.055, 0.045], [0.001, 0.01]], 8, null, x, y + 0.43, z));
}

// ---- India ---------------------------------------------------------------------------------------------------

/** A charpoy (charpai): four turned legs, a frame of four rails, the bed of webbing; a quilt and a pillow on it when `made`. */
export function charpoy(bag, col, x, y, z, yaw = 0, { L = 1.9, W = 0.9, h = 0.45, made = true, quilt = 'cloth_indigo' } = {}) {
  charpoyLegs(bag, x, y, z, yaw, { L, W, h });
  for (const s of [-1, 1]) {
    put(bag, 'timber', box(-L / 2, h - 0.1, s * W / 2 - 0.03, L / 2, h - 0.04, s * W / 2 + 0.03), x, y, z, yaw);
    put(bag, 'timber', box(s * L / 2 - 0.03, h - 0.1, -W / 2, s * L / 2 + 0.03, h - 0.04, W / 2), x, y, z, yaw);
  }
  put(bag, 'wicker', box(-L / 2 + 0.03, h - 0.075, -W / 2 + 0.03, L / 2 - 0.03, h - 0.06, W / 2 - 0.03), x, y, z, yaw);
  if (made) { put(bag, quilt, pad(L * 0.8, 0.07, W * 0.85), x, y + h - 0.06, z, yaw); put(bag, 'cloth_white', pad(0.4, 0.1, 0.5), x, y + h + 0.005, z, yaw - 0); }
  if (col) col.circle(x, z, Math.max(L, W) * 0.45, y, y + h);
}
/** The four turned legs of a charpoy, each built at its corner in the bed's frame, then turned and set with it. */
export function charpoyLegs(bag, x, y, z, yaw = 0, { L = 1.9, W = 0.9, h = 0.45 } = {}) {
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(bag, 'wood_painted', lathe([[0.04, 0], [0.05, 0.06], [0.035, 0.14], [0.055, 0.22], [0.04, 0.3], [0.045, h - 0.02], [0.001, h - 0.02]], 8, null, sx * (L / 2 - 0.02), 0, sz * (W / 2 - 0.02)), x, y, z, yaw);
}
/** A hookah (huqqa): the round base of brass, the stem, the bowl of clay with its coals, the long pipe coiled on the floor. */
export function hookah(bag, x, y, z, yaw = 0) {
  bag.add('bronze', lathe([[0.001, 0], [0.08, 0], [0.13, 0.06], [0.14, 0.13], [0.1, 0.2], [0.03, 0.23], [0.001, 0.23]], 14, null, x, y, z));
  bag.add('wood_dark', lathe([[0.025, 0], [0.02, 0.15], [0.03, 0.2], [0.018, 0.32], [0.001, 0.32]], 8, null, x, y + 0.22, z));
  bag.add('terracotta', lathe([[0.02, 0], [0.06, 0.06], [0.065, 0.09], [0.001, 0.09]], 10, null, x, y + 0.53, z));
  bag.add('flame', lathe([[0.001, 0], [0.04, 0.005], [0.001, 0.02]], 6, null, x, y + 0.62, z));
  const c = Math.cos(yaw), s = Math.sin(yaw), Pt = (u, h, v) => [x + c * u + s * v, y + h, z - s * u + c * v, 0.012];
  bag.add('cloth_red', tube([Pt(0.06, 0.3, 0), Pt(0.25, 0.25, 0.05), Pt(0.45, 0.05, 0.1), Pt(0.7, 0.02, 0.0), Pt(0.85, 0.02, -0.2), Pt(0.75, 0.02, -0.4), Pt(0.6, 0.05, -0.35)], 5));
}
