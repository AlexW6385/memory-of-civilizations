// Southern Song architecture (12th–13th c.; docs/settlements/song-hangzhou.md §4): the Liuhe
// Pagoda — an octagonal brick core plastered white, a timber gallery and eave at every storey, the
// corners of the eaves turned up, an octagonal crowning roof and a gilt spire — with the halls,
// houses, bridges, canals and boats of the ming style (the Jiangnan building tradition it grew from).

import { registerStyle, STYLES } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';

const ngon = (cx, cz, r, n = 8, rot = Math.PI / 8) => Array.from({ length: n }, (_, k) => [cx + Math.cos(rot + k / n * Math.PI * 2) * r, cz + Math.sin(rot + k / n * Math.PI * 2) * r]);
/** A flat-faced frustum from the polygon `bot` at y0 to `top` at y1, capped. */
function prism(bag, mat, bot, top, y0, y1) {
  const n = bot.length, t = [], P = (q, y) => [q[0], y, q[1]];
  for (let k = 0; k < n; k++) { const a = P(bot[k], y0), b = P(bot[(k + 1) % n], y0), c = P(top[(k + 1) % n], y1), d = P(top[k], y1); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let k = 1; k < n - 1; k++) { t.push(...P(top[0], y1), ...P(top[k], y1), ...P(top[k + 1], y1), ...P(bot[0], y0), ...P(bot[k + 1], y0), ...P(bot[k], y0)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** An octagonal eave from the inner ring (r0 at y0) out and down to the outer ring (r1 at y1), the corners turned up by `sweep`: tiles above, painted soffit below. */
function octEave(bag, cx, cz, r0, y0, r1, y1, sweep, top = 'tile_dark', under = 'lacquer_red') {
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
}

/**
 * pagoda_oct: the Liuhe Pagoda { c, y, base: { r, h }, tiers: [{ r (the core's radius), h }],
 * spire }: the stone base; at every storey the white core with doors on four sides and windows
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
    const r = t.r, h = t.h, g = r + 2.4;
    // the core, its doors and windows (doors on the four sides facing the compass, windows on the diagonals)
    prism(bag, 'plaster_white', ngon(cx, cz, r), ngon(cx, cz, r), y, y + h);
    col.circle(cx, cz, r * 0.95, y, y + h);
    const F = ngon(cx, cz, r + 0.03);
    for (let k = 0; k < 8; k++) {
      const a = F[k], b = F[(k + 1) % 8], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ux = (b[0] - a[0]), uz = (b[1] - a[1]), L = Math.hypot(ux, uz), w = (k % 2 === 0 ? 0.32 : 0.18) * L, hh = k % 2 === 0 ? Math.min(3, h * 0.45) : 1.2, y0 = k % 2 === 0 ? y + 0.4 : y + h * 0.35;
      const tr = []; beamTris(tr, [m[0] - ux / L * w / 2, y0, m[1] - uz / L * w / 2], [m[0] + ux / L * w / 2, y0, m[1] + uz / L * w / 2], 0.05, hh); bag.add('lacquer_black', fromTriangles(tr));
      const fr = []; beamTris(fr, [a[0], y + h - 0.6, a[1]], [b[0], y + h - 0.6, b[1]], 0.08, 0.35); bag.add('timber_red', fromTriangles(fr));
    }
    // the gallery: its floor, posts at the corners, the railing
    prism(bag, 'timber', ngon(cx, cz, g), ngon(cx, cz, g), y - 0.35, y);
    const P = ngon(cx, cz, g - 0.35), Rl = ngon(cx, cz, g - 0.15);
    for (let k = 0; k < 8; k++) {
      bag.add('timber_red', lathe([[0.2, 0], [0.18, h - 0.4]], 8, null, P[k][0], y, P[k][1]));
      col.circle(P[k][0], P[k][1], 0.2, y, y + h);
      const a = Rl[k], b = Rl[(k + 1) % 8], rt = []; beamTris(rt, [a[0], y + 0.85, a[1]], [b[0], y + 0.85, b[1]], 0.06, 0.12); beamTris(rt, [a[0], y + 0.2, a[1]], [b[0], y + 0.2, b[1]], 0.04, 0.08);
      bag.add('timber_red', fromTriangles(rt));
      col.segment(a, b, 0.15, y, y + 1);
    }
    // the bracket band under the eave, the eave
    prism(bag, 'timber_red', ngon(cx, cz, r + 0.2), ngon(cx, cz, r + 0.9), y + h - 0.25, y + h + 0.5);
    octEave(bag, cx, cz, r + 0.6, y + h + 1.1, g + 1.5, y + h - 0.2, 0.75);
    y += h;
  });
  // the crowning roof and the spire
  const rt = el.tiers[el.tiers.length - 1].r, R = rt + 3.6;
  octEave(bag, cx, cz, 0.6, y + 4.2, R, y + 0.2, 0.8);
  bag.add('gilt_bronze', lathe([[0.5, 0], [0.5, 0.6], [1.0, 0.8], [0.35, 1.2], [0.8, 1.6], [0.3, 2.0], [0.6, 2.4], [0.2, 2.8], [0.45, 3.1], [0.12, 3.6], [0.001, el.spire ?? 4.8]], 12, null, cx, y + 3.8, cz));
}

registerStyle('song', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pagoda_oct: pagodaOct },
  objects: {},
});
