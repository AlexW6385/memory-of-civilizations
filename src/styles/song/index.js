// Southern Song architecture (12th–13th c.; docs/settlements/song-hangzhou.md §4): the Liuhe
// Pagoda — an octagonal brick core plastered white, a timber gallery and eave at every storey, the
// corners of the eaves turned up, an octagonal crowning roof and a gilt spire — with the halls,
// houses, bridges, canals and boats of the ming style (the Jiangnan building tradition it grew from);
// Bianjing's bridge, boats, shops and gate (kaifeng.js).

import { registerStyle, STYLES } from '../../core/build.js';
import { lathe, box, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';
import { KAIFENG_ELEMENTS, hexa } from './kaifeng.js';
import { WUTAI_ELEMENTS } from './wutai.js';
import { HANGZHOU_ELEMENTS } from './hangzhou.js';

const ngon = (cx, cz, r, n = 8, rot = Math.PI / 8) => Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k / n * Math.PI * 2) * r, cz + Math.sin(rot + k / n * Math.PI * 2) * r]);
/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1, capped. */
function prism(bag, mat, bot, top, y0, y1) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) { const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1), ...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** An octagonal eave from the inner ring (r0 at y0) out and down to the outer ring (r1 at y1), the corners turned up by `sweep`: tiles above, painted soffit below. */
function octEave(bag, cx, cz, r0, y0, r1, y1, sweep, top = 'tile_dark', under = 'lacquer_red', bells = null) {
  const I = ngon(cx, cz, r0), O = ngon(cx, cz, r1), m = 4, up = [], dn = [];
  const tri = (a, b, c) => {
    const n = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);   // the normal's y (sign)
    const [p, q, r] = n >= 0 ? [a, b, c] : [a, c, b];
    up.push(...p, ...q, ...r);
    dn.push(p[0], p[1] - 0.14, p[2], r[0], r[1] - 0.14, r[2], q[0], q[1] - 0.14, q[2]);
  };
  for (let k = 0; k < 8; k++) {
    const a0 = I[k], a1 = I[(k + 1) % 8], b0 = O[k], b1 = O[(k + 1) % 8];
    for (let j = 0; j < m; j++) {
      const t0 = j / m, t1 = (j + 1) / m, h = (t) => y1 + sweep * Math.abs(2 * t - 1) ** 2.5;
      const i0 = [a0[0] + (a1[0] - a0[0]) * t0, y0, a0[1] + (a1[1] - a0[1]) * t0], i1 = [a0[0] + (a1[0] - a0[0]) * t1, y0, a0[1] + (a1[1] - a0[1]) * t1];
      const o0 = [b0[0] + (b1[0] - b0[0]) * t0, h(t0), b0[1] + (b1[1] - b0[1]) * t0], o1 = [b0[0] + (b1[0] - b0[0]) * t1, h(t1), b0[1] + (b1[1] - b0[1]) * t1];
      tri(i0, i1, o1); tri(i0, o1, o0);
    }
  }
  bag.add(top, fromTriangles(up)); bag.add(under, fromTriangles(dn));
  if (bells) eaveBells(bag, cx, cz, r0, y0, r1, y1 + sweep, bells);
}
/**
 * A wind bell under each of the eave's eight corners: the hook from the soffit, the bell, its clapper
 * and the wind plate below.
 */
function eaveBells(bag, cx, cz, r0, y0, r1, yc, mat) {
  const rr = r1 - 0.3, yy = y0 + (yc - y0) * (rr - r0) / (r1 - r0) - 0.14;
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + k / 8 * Math.PI * 2, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
    bag.add(mat, lathe([[0.025, -0.3], [0.025, 0.04]], 5, null, x, yy, z));
    bag.add(mat, lathe([[0.001, -0.3], [0.05, -0.3], [0.1, -0.36], [0.15, -0.6], [0.17, -0.7], [0.16, -0.71], [0.001, -0.66]], 10, null, x, yy, z));
    bag.add(mat, lathe([[0.012, -0.95], [0.012, -0.62]], 4, null, x, yy, z));
    bag.add(mat, box(x - 0.09, yy - 1.12, z - 0.012, x + 0.09, yy - 0.95, z + 0.012));
  }
}
/**
 * A row of bracket sets under an eave round the octagonal core (radius r, the sets' foot at y): a
 * set at each corner (pointing out along the diagonal) and two between on each face — bearing
 * block, the cross arm with its small blocks, two tiers of arms stepping out, the eave purlin's ring
 * on their ends; the architrave below.
 */
function bracketRow(bag, cx, cz, r, y, arms = 'timber_red', blocks = 'paint_ochre') {
  const G = ngon(cx, cz, r), A = [], B = [];
  const set = (px, pz, ux, uz, nx, nz, s) => {
    const Q = (u, n, yy) => [px + ux * u + nx * n, y + yy, pz + uz * u + nz * n];
    const bx = (out, u0, u1, n0, n1, y0, y1) => hexa(out, [Q(u0, n0, y0), Q(u1, n0, y0), Q(u1, n1, y0), Q(u0, n1, y0), Q(u0, n0, y1), Q(u1, n0, y1), Q(u1, n1, y1), Q(u0, n1, y1)]);
    bx(B, -0.24 * s, 0.24 * s, -0.05, 0.42 * s, 0, 0.26);
    bx(A, -0.62 * s, 0.62 * s, 0.06, 0.3 * s, 0.26, 0.46);
    for (const u of [-0.55 * s, 0.55 * s]) bx(B, u - 0.1, u + 0.1, 0.05, 0.31 * s, 0.46, 0.6);
    bx(A, -0.1, 0.1, -0.05, 0.86 * s, 0.26, 0.5);
    bx(B, -0.13, 0.13, 0.62 * s, 0.88 * s, 0.5, 0.62);
    bx(A, -0.78 * s, 0.78 * s, 0.64 * s, 0.86 * s, 0.62, 0.8);
    bx(A, -0.1, 0.1, 0.0, 1.34 * s, 0.6, 0.86);
    bx(B, -0.13, 0.13, 1.08 * s, 1.36 * s, 0.86, 0.98);
  };
  for (let k = 0; k < 8; k++) {
    const a = G[k], b = G[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let nx = uz, nz = -ux;
    if (((a[0] + b[0]) / 2 - cx) * nx + ((a[1] + b[1]) / 2 - cz) * nz < 0) { nx = -nx; nz = -nz; }
    for (const t of [1 / 3, 2 / 3]) set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, ux, uz, nx, nz, 1);
    const ra = Math.hypot(a[0] - cx, a[1] - cz), dx = (a[0] - cx) / ra, dz = (a[1] - cz) / ra;
    set(a[0], a[1], -dz, dx, dx, dz, 1.15);
  }
  bag.add(arms, fromTriangles(A)); bag.add(blocks, fromTriangles(B));
  // the architrave round the core under the sets, the ring on the arms' ends
  prism(bag, arms, ngon(cx, cz, r + 0.12), ngon(cx, cz, r + 0.12), y - 0.45, y + 0.02);
  prism(bag, arms, ngon(cx, cz, r + 1.15), ngon(cx, cz, r + 1.55), y + 0.96, y + 1.22);
}

/**
 * pagoda_oct: the Liuhe Pagoda { c, y, base: { r, h }, tiers: [{ r (the core's radius), h }],
 * spire, bells (the wind bells' material, or none) }: the stone base; at every storey the white core with doors on four sides and windows
 * on the others, a timber gallery with posts and a railing, the eave above; the crowning roof,
 * the spire.
 */
function pagodaOct(el, { bag, col }) {
  const [cx, cz] = el.c;
  let y = el.y;
  const B = el.base;
  prism(bag, 'granite_block', ngon(cx, cz, B.r + 0.6), ngon(cx, cz, B.r), y, y + B.h);
  col.circle(cx, cz, B.r, y, y + B.h);
  y += B.h;
  el.tiers.forEach((t, i) => {
    const r = t.r, h = t.h, gal = el.galleries !== false, g = gal ? r + 2.4 : r + 0.6, coreMat = el.core || 'plaster_white';
    // the core, its doors and windows (doors on the four sides facing the compass, windows on the diagonals)
    prism(bag, coreMat, ngon(cx, cz, r), ngon(cx, cz, r), y, y + h);
    col.circle(cx, cz, r * 0.95, y, y + h);
    const F = ngon(cx, cz, r + 0.03);
    for (let k = 0; k < 8; k++) {
      const a = F[k], b = F[(k + 1) % 8], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ux = (b[0] - a[0]), uz = (b[1] - a[1]), L = Math.hypot(ux, uz), w = (k % 2 === 0 ? 0.32 : 0.18) * L, hh = k % 2 === 0 ? Math.min(3, h * 0.45) : 1.2, y0 = k % 2 === 0 ? y + 0.4 : y + h * 0.35;
      const tr = []; beamTris(tr, [m[0] - ux / L * w / 2, y0, m[1] - uz / L * w / 2], [m[0] + ux / L * w / 2, y0, m[1] + uz / L * w / 2], 0.05, hh); bag.add('lacquer_black', fromTriangles(tr));
      const fr = []; beamTris(fr, [a[0], y + h - 0.6, a[1]], [b[0], y + h - 0.6, b[1]], 0.08, 0.35); bag.add(el.frame || 'timber_red', fromTriangles(fr));
    }
    if (!gal && el.relief) {
      // the glazed brick skin: each face in moulded tiles (seated Buddhas, flying figures, flowers) in
      // rows, engaged columns at the corners, a row of bracket sets (in glazed brick) under the eave
      const G = ngon(cx, cz, r), tiles = [], cols = [], br = [];
      for (let k = 0; k < 8; k++) {
        const a = G[k], b = G[(k + 1) % 8], ux = b[0] - a[0], uz = b[1] - a[1], L = Math.hypot(ux, uz), nx = uz / L, nz = -ux / L;
        const sgn = ((a[0] + b[0]) / 2 - cx) * nx + ((a[1] + b[1]) / 2 - cz) * nz > 0 ? 1 : -1, o = 0.06 * sgn;
        const rows = Math.max(2, Math.floor((h - 1.2) / 0.62)), per = Math.max(2, Math.floor(L / 0.62));
        for (let i = 0; i < rows; i++) for (let j = 0; j < per; j++) {
          const t = (j + 0.5) / per, yy = y + 0.3 + i * (h - 1.2) / rows, px = a[0] + ux * t, pz = a[1] + uz * t;
          const w2 = 0.2, hh = (h - 1.2) / rows - 0.1;
          if (Math.abs(t - 0.5) < (k % 2 === 0 ? 0.2 : 0.1) && yy > y + (k % 2 === 0 ? 0.2 : h * 0.3) && yy < y + (k % 2 === 0 ? 3.4 : h * 0.35 + 1.2)) continue;   // the door or window
          beamTris(tiles, [px - ux / L * w2 + nx * o, yy, pz - uz / L * w2 + nz * o], [px + ux / L * w2 + nx * o, yy, pz + uz / L * w2 + nz * o], 0.06, hh);
        }
        cols.push(lathe([[0.16, 0], [0.14, h - 0.6], [0.24, h - 0.5]], 8, null, a[0], y, a[1]));
        for (let j = 0; j < 3; j++) { const t = (j + 0.5) / 3, px = a[0] + ux * t, pz = a[1] + uz * t; beamTris(br, [px - ux / L * 0.25 + nx * sgn * 0.2, y + h - 0.55, pz - uz / L * 0.25 + nz * sgn * 0.2], [px + ux / L * 0.25 + nx * sgn * 0.2, y + h - 0.55, pz + uz / L * 0.25 + nz * sgn * 0.2], 0.25, 0.45); }
      }
      bag.add(coreMat, fromTriangles(tiles));
      for (const g of cols) bag.add(coreMat, g);
      bag.add(coreMat, fromTriangles(br));
    }
    if (!gal) {
      prism(bag, coreMat, ngon(cx, cz, r + 0.15), ngon(cx, cz, r + 0.55), y + h - 0.5, y + h + 0.2);
      octEave(bag, cx, cz, r + 0.3, y + h + 0.7, r + 1.6, y + h - 0.1, 0.35, el.eave || 'tile_dark', coreMat, el.bells || null);
      y += h;
      return;
    }
    // the gallery: its floor, posts at the corners, the railing
    prism(bag, 'timber', ngon(cx, cz, g), ngon(cx, cz, g), y - 0.35, y);
    const P = ngon(cx, cz, g - 0.35), Rl = ngon(cx, cz, g - 0.15);
    for (let k = 0; k < 8; k++) {
      bag.add('timber_red', lathe([[0.2, 0], [0.18, h + 0.7]], 8, null, P[k][0], y, P[k][1]));   // up into the eave's corner
      col.circle(P[k][0], P[k][1], 0.2, y, y + h);
      const a = Rl[k], b = Rl[(k + 1) % 8], rt = []; beamTris(rt, [a[0], y + 0.85, a[1]], [b[0], y + 0.85, b[1]], 0.06, 0.12); beamTris(rt, [a[0], y + 0.2, a[1]], [b[0], y + 0.2, b[1]], 0.04, 0.08);
      bag.add('timber_red', fromTriangles(rt));
      col.segment(a, b, 0.15, y, y + 1);
    }
    // the bracket sets under the eave, the eave with its bells
    bracketRow(bag, cx, cz, r, y + h - 0.35);
    octEave(bag, cx, cz, r + 0.6, y + h + 1.1, g + 1.5, y + h - 0.2, 0.75, 'tile_dark', 'lacquer_red', el.bells || null);
    y += h;
  });
  // the crowning roof and the spire
  const rt = el.tiers[el.tiers.length - 1].r, R = el.galleries === false ? rt + 1.8 : rt + 3.6;
  octEave(bag, cx, cz, 0.6, y + (el.galleries === false ? 2.6 : 4.2), R, y + 0.2, 0.8, el.eave || 'tile_dark', el.core && el.galleries === false ? el.core : 'lacquer_red', el.bells || null);
  bag.add('gilt_bronze', lathe([[0.5, 0], [0.5, 0.6], [1.0, 0.8], [0.35, 1.2], [0.8, 1.6], [0.3, 2.0], [0.6, 2.4], [0.2, 2.8], [0.45, 3.1], [0.12, 3.6], [0.001, el.spire ?? 4.8]], 12, null, cx, y + 3.8, cz));
}

registerStyle('song', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pagoda_oct: pagodaOct, ...KAIFENG_ELEMENTS, ...WUTAI_ELEMENTS, ...HANGZHOU_ELEMENTS },
  objects: {},
});
