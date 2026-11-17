// West Lake's pavilions and arched bridges of the Su Causeway, dressed for a close look (docs/settlements/song-hangzhou.md §28).
// hz_lake_pavilion: a lakeside pavilion with its own platform, bracket sets, flying eaves and beauty's rests.
// hz_arch_bridge: ming_arch_bridge's stone body with panelled parapets, lion posts, keystones and a name tablet added.
// All pieces go to materials the plan already uses, so they merge into the same meshes.

import { rod, box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { pyramidRoof, beamTris } from '../ming/index.js';
import { hexa } from './kaifeng.js';
import { STYLES } from '../../core/build.js';

const ell = (rx, ry, rz, x, y, z, n = 7) => lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), n).scale(rx, ry, rz).translate(x, y, z);

/** A convex prism over a polygon (the polygon grown by m), from y0 to y1, as triangles. */
function prism(out, poly, cx, cz, m, y0, y1) {
  const ext = poly.map(([x, z]) => { const dx = x - cx, dz = z - cz, l = Math.hypot(dx, dz); return [cx + dx / l * (l + m), cz + dz / l * (l + m)]; });
  const t = [], n = ext.length;
  for (let k = 0; k < n; k++) {
    const a = ext[k], b = ext[(k + 1) % n];
    t.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], a[0], y1, a[1]);
    t.push(cx, y1, cz, a[0], y1, a[1], b[0], y1, b[1]);
  }
  for (const v of orientOutward(t)) out.push(v);
}

/** A Song bracket set (dougong) on an architrave at (x, z), its arms reaching out along (ox, oz): bearing block, a cross arm along the face with a small block at each end,
 *  the first arm out with its block, the second arm and the block that carries the purlin. k scales it. Triangles go to `out`. */
export function bracketSet(out, x, z, ox, oz, yb, k = 1) {
  const tx = -oz, tz = ox, O = (d, u, yy) => [x + ox * d * k + tx * u * k, yy, z + oz * d * k + tz * u * k];
  const blk = (d0, d1, u0, u1, y0, y1) => hexa(out, [O(d0, u0, y0), O(d0, u1, y0), O(d1, u1, y0), O(d1, u0, y0), O(d0, u0, y1), O(d0, u1, y1), O(d1, u1, y1), O(d1, u0, y1)]);
  const h = (v) => yb + v * k;
  blk(-0.13, 0.13, -0.13, 0.13, h(0), h(0.12));
  blk(-0.07, 0.06, -0.45, 0.45, h(0.12), h(0.22));
  blk(-0.07, 0.62, -0.06, 0.06, h(0.12), h(0.22));
  for (const sg of [-1, 1]) blk(-0.1, 0.1, sg * 0.4 - 0.08, sg * 0.4 + 0.08, h(0.22), h(0.32));
  blk(0.5, 0.7, -0.09, 0.09, h(0.22), h(0.32));
  blk(-0.07, 0.95, -0.055, 0.055, h(0.32), h(0.42));
  blk(0.85, 1.07, -0.09, 0.09, h(0.42), h(0.52));
}

/**
 * hz_lake_pavilion { c, shape ('hex' | 'square'), r (hex) or w (square), y (the floor), H (floor to the top of the posts), plat, open: the sides left open (steps on them),
 * seed }: a platform of two stone tiers with a cap; red posts on stone drums; an architrave with a hanging lattice frieze on the open sides; bracket sets on every post and
 * between; a purlin and flying eaves whose corners turn up, red hip rafters, ridges and a gilt finial; beauty's rests with lattice aprons on the closed sides; inside a stone
 * table and four stools, a paper lantern; a name board over the entrance.
 */
export function hzLakePavilion(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, H = el.H ?? 3.6, plat = Math.max(0.3, el.plat ?? 0.5), hex = el.shape !== 'square';
  const r = el.r ?? 3, w = (el.w ?? 5) / 2;
  const poly = hex ? Array.from({ length: 6 }, (_, k) => { const a = (k + 0.5) / 6 * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; }) : [[cx - w, cz - w], [cx + w, cz - w], [cx + w, cz + w], [cx - w, cz + w]];
  const n = poly.length, open = el.open ?? [0];
  const R = hex ? r : w * Math.SQRT2;
  const grow = (p, m) => { const dx = p[0] - cx, dz = p[1] - cz, l = Math.hypot(dx, dz); return [cx + dx / l * (l + m), cz + dz / l * (l + m)]; };
  // ---- the platform: a foot, a waist, a cap with its drip, the floor of bluestone
  const g1 = [], g2 = [];
  prism(g1, poly, cx, cz, 0.62, y - plat, y - plat * 0.55);
  prism(g1, poly, cx, cz, 0.5, y - plat * 0.55, y - 0.1);
  prism(g2, poly, cx, cz, 0.56, y - 0.1, y - 0.04);
  prism(g2, poly, cx, cz, 0.46, y - 0.04, y);
  bag.add('granite_block', fromTriangles(g1)); bag.add('granite_grey', fromTriangles(g2));
  const fl = []; prism(fl, poly, cx, cz, 0.3, y - 0.05, y + 0.012); bag.add('bluestone', fromTriangles(fl));
  // collision: the floor and the platform's body (a hexagon is covered by two rectangles, the inscribed one and one along its long axis)
  const rf = (rc) => { col.floor(rc, y); col.rect(rc, y - plat, y - 0.31); };
  if (hex) { const A = 0.866 * (r + 0.3), B = 0.5 * (r + 0.3); rf([cx - A, cz - B, cx + A, cz + B]); const q = 0.4 * r, zz = 0.77 * (r + 0.3); rf([cx - q, cz - zz, cx + q, cz + zz]); }
  else rf([cx - w - 0.3, cz - w - 0.3, cx + w + 0.3, cz + w + 0.3]);
  // steps on the open sides (two risers of half the platform's height)
  for (const k of open) {
    const a = poly[k], b = poly[(k + 1) % n], mx = (a[0] + b[0]) / 2 - cx, mz = (a[1] + b[1]) / 2 - cz, ml = Math.hypot(mx, mz), nx = mx / ml, nz = mz / ml, tx = -nz, tz = nx;
    const edge = ml + 0.56, sw = 1.5;
    for (let i = 0; i < 2; i++) {
      const d0 = edge + i * 0.36 - (i === 0 ? 0.1 : 0), d1 = edge + (i + 1) * 0.36, yt = y - plat * (0.5 + 0.5 * i) + 0.0 - (i ? 0 : 0);
      const P = (d, s, yy) => [cx + nx * d + tx * s, yy, cz + nz * d + tz * s];
      const t = []; hexa(t, [P(d0, -sw / 2, y - plat), P(d0, sw / 2, y - plat), P(d1, sw / 2, y - plat), P(d1, -sw / 2, y - plat), P(d0, -sw / 2, yt), P(d0, sw / 2, yt), P(d1, sw / 2, yt), P(d1, -sw / 2, yt)]);
      bag.add('granite_block', fromTriangles(t));
    }
    // the walk up: a ramp over the two treads
    const e0 = ml + 0.46, e1 = edge + 0.72, c0 = [cx + nx * e0 + tx * -sw / 2, cz + nz * e0 + tz * -sw / 2], c1 = [cx + nx * e1 + tx * sw / 2, cz + nz * e1 + tz * sw / 2];
    const dir = Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'w' : 'e') : (nz > 0 ? 'n' : 's');
    col.ramp([Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1])], y - plat, y, dir);
  }
  // ---- posts on stone drums
  const yb = y + H - 0.25;                           // the architrave's top
  for (const p of poly) {
    bag.add('granite_grey', lathe([[0.001, 0], [0.31, 0], [0.31, 0.06], [0.26, 0.12], [0.26, 0.19], [0.001, 0.19]], 10, null, p[0], y, p[1]));
    bag.add('timber_red', lathe([[0.215, 0], [0.19, H - 0.75], [0.17, H - 0.45]], 10, null, p[0], y + 0.19, p[1]));
    col.circle(p[0], p[1], 0.26, y, y + H);
  }
  // ---- architrave and lintel, bracket sets, purlin
  const arch = [], low = [], och = [], purlin = [];
  for (let k = 0; k < n; k++) {
    const a = poly[k], b = poly[(k + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let nx = uz, nz = -ux; if ((a[0] - cx) * nx + (a[1] - cz) * nz < 0) { nx = -nx; nz = -nz; }
    beamTris(arch, [a[0], y + H - 0.55, a[1]], [b[0], y + H - 0.55, b[1]], 0.11, 0.3);
    beamTris(low, [a[0], y + H - 1.0, a[1]], [b[0], y + H - 1.0, b[1]], 0.06, 0.12);
    // the frieze between lintel and architrave on the open sides: a lattice of squares in a frame
    const Q = (s, o, yy) => [a[0] + ux * s + nx * o, yy, a[1] + uz * s + nz * o];
    const bx = (s0, s1, o0, o1, y0, y1, out) => hexa(out, [Q(s0, o0, y0), Q(s1, o0, y0), Q(s1, o1, y0), Q(s0, o1, y0), Q(s0, o0, y1), Q(s1, o0, y1), Q(s1, o1, y1), Q(s0, o1, y1)]);
    // the bracket sets: on each post's top (at its corner along the diagonal) and one at the middle of the side
    const sets = [[L / 2, nx, nz]];
    for (const [s, ex, ez] of [[0, 0, 0], [L, 0, 0]]) { const px = a[0] + ux * s - cx, pz = a[1] + uz * s - cz, l = Math.hypot(px, pz); sets.push([s, px / l, pz / l]); void ex; void ez; }
    for (const [s, ox, oz] of sets) {
      bracketSet(och, a[0] + ux * s, a[1] + uz * s, ox, oz, yb, 1);
    }
    // the frieze on the sides not walled in: an upright lattice between lintel and architrave
    if (open.includes(k)) bx(0.35, L - 0.35, 0.0, 0.035, y + H - 0.88, y + H - 0.55, low);
  }
  bag.add('lacquer_red', fromTriangles(arch)); bag.add('timber_red', fromTriangles(low)); bag.add('paint_ochre', fromTriangles(och));
  // ---- the eaves: a purlin ring, a roof lifted at its corners, red hip rafters, ridges
  const yE = yb + 0.64, edge = poly.map((p) => grow(p, 1.35)), sweep = 0.95 + (hex ? 0.05 : 0.15), rise = R * 0.82 + 0.5;
  const rp = [];
  for (let k = 0; k < n; k++) { const a = grow(poly[k], 1.0), b = grow(poly[(k + 1) % n], 1.0); beamTris(rp, [a[0], yb + 0.52, a[1]], [b[0], yb + 0.52, b[1]], 0.07, 0.12); }
  bag.add('timber_red', fromTriangles(rp));
  pyramidRoof(edge, yE, rise, sweep, bag, 'tile_dark', 'timber_red', 1.55);
  const hipH = (t) => yE + rise * Math.pow(t, 1.55) + sweep * Math.pow(1 - t, 2.2);
  for (const p of edge) {
    let prev = null;
    for (let i = 0; i <= 8; i++) { const t = i / 8, q = [p[0] + (cx - p[0]) * t, hipH(t) + 0.03, p[1] + (cz - p[1]) * t]; if (prev) bag.add('tile_dark', rod(prev, q, 0.065, 5)); prev = q; }
    // the rafter under the corner: from the post's top out to the turned-up tip, and the tip's tile boss
    const post = poly[edge.indexOf(p)], tip = [p[0], yE + sweep - 0.1, p[1]];
    bag.add('timber_red', rod([post[0], yb + 0.4, post[1]], tip, 0.055, 5));
    bag.add('tile_dark', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.16], [0.001, 0.26]], 6, null, p[0], yE + sweep - 0.12, p[1]));
  }
  // the finial: a gilt gourd on a base at the apex
  const top = hipH(1);
  bag.add('tile_dark', lathe([[0.001, 0], [0.26, 0], [0.3, 0.06], [0.2, 0.16], [0.14, 0.3], [0.001, 0.3]], 8, null, cx, top - 0.02, cz));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.04], [0.17, 0.2], [0.1, 0.38], [0.06, 0.5], [0.001, 0.74]], 8, null, cx, top + 0.26, cz));
  // ---- beauty's rests (meiren kao) on the closed sides: a lattice apron, a seat, a leaning back of slender uprights with a crest rail; a gap at the posts
  const seat = [], apron = [], back = [], crest = [];
  for (let k = 0; k < n; k++) {
    if (open.includes(k)) continue;
    const a = poly[k], b = poly[(k + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    let nx = uz, nz = -ux; if ((a[0] - cx) * nx + (a[1] - cz) * nz < 0) { nx = -nx; nz = -nz; }
    const Q = (s, o, yy) => [a[0] + ux * s + nx * o, yy, a[1] + uz * s + nz * o];
    const bx = (s0, s1, o0, o1, y0, y1, out) => hexa(out, [Q(s0, o0, y0), Q(s1, o0, y0), Q(s1, o1, y0), Q(s0, o1, y0), Q(s0, o0, y1), Q(s1, o0, y1), Q(s1, o1, y1), Q(s0, o1, y1)]);
    bx(0.3, L - 0.3, -0.2, 0.16, y + 0.36, y + 0.42, seat);
    bx(0.3, L - 0.3, -0.03, 0.03, y + 0.06, y + 0.36, apron);
    bx(0.3, L - 0.3, -0.05, 0.05, y, y + 0.06, seat);
    const m = Math.max(3, Math.round((L - 0.6) / 0.3));
    for (let i = 0; i <= m; i++) {
      const s = 0.3 + (L - 0.6) * i / m;
      back.push(rod(Q(s, 0.12, y + 0.42), Q(s, 0.3, y + 0.75), 0.016, 3), rod(Q(s, 0.3, y + 0.75), Q(s, 0.38, y + 1.0), 0.016, 3));
    }
    bx(0.3, L - 0.3, 0.33, 0.43, y + 0.98, y + 1.06, crest);
    bx(0.3, L - 0.3, 0.27, 0.31, y + 0.72, y + 0.76, crest);
    bx(0.3, L - 0.3, 0.1, 0.14, y + 0.4, y + 0.46, crest);
    col.segment(Q(0, 0.1, 0), Q(L, 0.1, 0), 0.5, y, y + 1.05);
  }
  bag.add('wood_dark', fromTriangles(seat)); bag.add('lattice_red', fromTriangles(apron)); bag.add('timber_red', fromTriangles(crest));
  for (const g of back) bag.add('timber_red', g);
  // ---- inside: a stone table with four drum stools, a paper lantern hung from the apex
  bag.add('granite_grey', lathe([[0.001, 0], [0.45, 0], [0.45, 0.06], [0.16, 0.12], [0.16, 0.6], [0.5, 0.64], [0.5, 0.72], [0.001, 0.72]], 12, null, cx, y, cz));
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, sx = cx + Math.cos(a) * 0.95, sz = cz + Math.sin(a) * 0.95; bag.add('granite_grey', lathe([[0.001, 0], [0.2, 0], [0.22, 0.04], [0.2, 0.08], [0.17, 0.12], [0.17, 0.36], [0.22, 0.4], [0.22, 0.44], [0.001, 0.44]], 8, null, sx, y, sz)); }
  bag.add('timber_red', rod([poly[0][0], y + H - 0.4, poly[0][1]], [poly[n / 2][0], y + H - 0.4, poly[n / 2][1]], 0.06, 5));
  bag.add('timber_red', rod([cx, y + H - 1.08, cz], [cx, y + H - 0.4, cz], 0.01, 3));
  bag.add('lamp_paper', lathe([[0.001, -0.22], [0.12, -0.15], [0.17, 0], [0.12, 0.15], [0.001, 0.22]], 8, null, cx, y + H - 1.3, cz));
  // ---- the name board on the first open side, under the lintel
  for (const k of open.slice(0, 1)) {
    const a = poly[k], b = poly[(k + 1) % n], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, dx = mx - cx, dz = mz - cz, l = Math.hypot(dx, dz), nx = dx / l, nz = dz / l, tx = -nz, tz = nx;
    const P = (s, o, yy) => [mx + tx * s + nx * o, yy, mz + tz * s + nz * o], t = [], t2 = [];
    hexa(t, [P(-0.8, 0.13, y + H - 1.0), P(0.8, 0.13, y + H - 1.0), P(0.8, 0.2, y + H - 1.0), P(-0.8, 0.2, y + H - 1.0), P(-0.8, 0.13, y + H - 0.58), P(0.8, 0.13, y + H - 0.58), P(0.8, 0.2, y + H - 0.58), P(-0.8, 0.2, y + H - 0.58)]);
    hexa(t2, [P(-0.7, 0.2, y + H - 0.94), P(0.7, 0.2, y + H - 0.94), P(0.7, 0.215, y + H - 0.94), P(-0.7, 0.215, y + H - 0.94), P(-0.7, 0.2, y + H - 0.64), P(0.7, 0.2, y + H - 0.64), P(0.7, 0.215, y + H - 0.64), P(-0.7, 0.215, y + H - 0.64)]);
    bag.add('paint_ochre', fromTriangles(t)); bag.add('lacquer_black', fromTriangles(t2));
  }
}

/**
 * hz_arch_bridge: the parameters of ming_arch_bridge { at, across, span, width, rise, landing, y, water, bed, name }. The body, the arch ring and the walk are the Ming style's;
 * on it: carved panels framed on both faces of the parapets between the posts (a lozenge in each), a seated lion on every post, a keystone and a spandrel roundel on each face
 * of the arch, a name tablet at the crown. [inferred: the Song bridges' parapets are not described; the forms are the usual Jiangnan stone bridge's]
 */
export function hzArchBridge(el, ctx) {
  STYLES.ming.elements.ming_arch_bridge(el, ctx);
  const { bag } = ctx;
  const [cx, cz] = el.at, S = el.span, W = el.width / 2, R = el.rise ?? 2.2, land = el.landing ?? 4.5, y0 = el.y ?? 0, springY = el.water ?? -0.75;
  const alongZ = el.across === 'z', half = S / 2 + land;
  const P = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const top = (s) => y0 + R * Math.cos(Math.min(1, Math.abs(s) / half) * Math.PI / 2) ** 0.8;
  const archR = S / 2 * 0.92, kA = Math.max(0.3, Math.min(1, (top(0) - 0.55 - springY) / archR));
  const fr = [], carv = [];
  const bm = (a, b, w, h, out) => beamTris(out, a, b, w, h);
  const posts = [-half + 0.2, -S / 2 - 0.1, S / 2 + 0.1, half - 0.2];
  for (const sg of [-1, 1]) {
    const o = sg * (W + 0.013);
    // the sections between the posts: the landings' flights, and the span's parapet
    for (const [sa, sb] of [[-half + 0.5, -S / 2 - 0.4], [-S / 2 + 0.1, S / 2 - 0.1], [S / 2 + 0.4, half - 0.5]]) {
      const len = sb - sa, np = Math.max(1, Math.round(len / 1.6));
      for (let i = 0; i < np; i++) {
        const s0 = sa + len * i / np + 0.08, s1 = sa + len * (i + 1) / np - 0.08, sc = (s0 + s1) / 2;
        const lo0 = top(s0) + 0.06, lo1 = top(s1) + 0.06, hi0 = top(s0) + 0.42, hi1 = top(s1) + 0.42;
        bm(P(s0, o, lo0), P(s1, o, lo1), 0.02, 0.045, fr); bm(P(s0, o, hi0), P(s1, o, hi1), 0.02, 0.045, fr);
        for (const [s, ya, yb] of [[s0, lo0, hi0], [s1, lo1, hi1]]) { const c = P(s, o, 0); bag.add('granite_grey', box(c[0] - (alongZ ? 0.022 : 0.03), ya, c[2] - (alongZ ? 0.03 : 0.022), c[0] + (alongZ ? 0.022 : 0.03), yb + 0.045, c[2] + (alongZ ? 0.03 : 0.022))); }
        // a lozenge in the panel
        const yc = top(sc) + 0.24, hw = Math.min(0.55, (s1 - s0) * 0.3);
        const pts = [[sc - hw, yc], [sc, yc + 0.13], [sc + hw, yc], [sc, yc - 0.13]];
        for (let q = 0; q < 4; q++) { const a = pts[q], b = pts[(q + 1) % 4]; bm(P(a[0], o, a[1]), P(b[0], o, b[1]), 0.015, 0.028, carv); }
        bag.add('granite_grey', ell(0.05, 0.05, 0.02, ...P(sc, o + sg * 0.005, yc), 6));
      }
    }
    // a seated lion on each post's cap: haunch, chest, head, mane, ears, a paw on a ball
    for (const s of posts) {
      const c = P(s, sg * (W - 0.095), 0), yt = Math.max(top(s - 0.15), top(s + 0.15)) + 0.55 + 0.22 + 0.33;
      const face = alongZ ? [0, s < 0 ? 1 : -1] : [s < 0 ? 1 : -1, 0];
      const L = (lx, ly, lz, rx, ry, rz) => { const px = c[0] + face[0] * lz - face[1] * lx, pz = c[2] + face[1] * lz + face[0] * lx; bag.add('granite_grey', ell(rx, ry, rz, px, yt + ly, pz, 6)); };
      L(0, 0.1, -0.06, 0.1, 0.1, 0.12); L(0, 0.17, 0.02, 0.09, 0.12, 0.09); L(0, 0.3, 0.06, 0.075, 0.075, 0.07); L(0, 0.28, 0.02, 0.115, 0.1, 0.05); L(0, 0.27, 0.11, 0.04, 0.03, 0.04);
      L(-0.07, 0.36, 0.05, 0.02, 0.025, 0.02); L(0.07, 0.36, 0.05, 0.02, 0.025, 0.02); L(0.1, 0.06, 0.08, 0.04, 0.05, 0.04);
    }
    // the arch's face: a keystone block at the crown, the carved roundels on the spandrels either side
    const cr = springY + kA * archR + 0.42, o2 = sg * (W + 0.07);
    const k0 = P(-0.3, o2, cr - 0.5), k1 = P(0.3, sg * (W - 0.02), cr + 0.0);
    bag.add('granite_block', box(Math.min(k0[0], k1[0]), k0[1], Math.min(k0[2], k1[2]), Math.max(k0[0], k1[0]), k1[1], Math.max(k0[2], k1[2])));
    for (const s of [-1, 1]) {
      const sc = s * (archR * 0.74 + 0.4), yc = Math.min(top(sc) - 0.62, springY + archR * 0.8 * kA + 0.3), c = P(sc, o2 - sg * 0.04, yc);
      const g = lathe([[0.001, 0], [0.26, 0], [0.26, 0.03], [0.2, 0.045], [0.001, 0.05]], 14);
      if (alongZ) g.rotateZ(-sg * Math.PI / 2); else g.rotateX(sg * Math.PI / 2);
      bag.add('bluestone', g.translate(c[0], c[1], c[2]));
    }
    // the name tablet at the crown of the parapet: a granite frame, a dark field
    const tcz = P(0, o, top(0) + 0.1), tw = 0.55, lz = alongZ;
    bag.add('bluestone', box(tcz[0] - (lz ? 0.03 : tw), tcz[1], tcz[2] - (lz ? tw : 0.03), tcz[0] + (lz ? 0.03 : tw), tcz[1] + 0.3, tcz[2] + (lz ? tw : 0.03)));
  }
  bag.add('granite_grey', fromTriangles(fr)); bag.add('paint_ochre', fromTriangles(carv));
}
