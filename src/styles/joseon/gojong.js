// Gyeongbokgung as Heungseon Daewongun rebuilt it for King Gojong (1865–1868) and as it stood in the
// 1880s (docs/settlements/joseon-seoul.md §12): Gyeonghoeru on its 48 stone pillars (square outside,
// round inside) under one great hip-and-gable roof; the stone bridges and balustrades of its island;
// Hyangwonjeong, the hexagonal two-storey pavilion on its round island in Hyangwonji, and the wooden
// Chwihyanggyo to Geoncheonggung; the hexagonal brick chimneys of Amisan; and the town's things of
// that time — the licensed shops of Jongno (sijeon), the bell pavilion, the porter's A-frame (jige)
// and the brushwood load of an ox.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, pyramidRoof, beamTris, flipTris, latticeBay } from '../ming/index.js';
import { roofOrnaments, balustradeCarved, limb, ball, T } from '../qing/carving.js';
import { dapo, dapoHeight, meoricho } from './dancheong.js';

/** Roughen an ellipsoid into a bushy mass: each vertex pushed in or out by a hash of where it is (shared vertices move together). */
function bushy(g, amt = 0.14) {
  const P = g.attributes.position.array;
  for (let i = 0; i < P.length; i += 3) {
    const h = Math.sin(P[i] * 127.1 + P[i + 1] * 311.7 + P[i + 2] * 74.7) * 43758.5453, f = 1 + amt * (2 * (h - Math.floor(h)) - 1);
    P[i] *= f; P[i + 1] *= f; P[i + 2] *= f;
  }
  g.attributes.position.needsUpdate = true; g.computeVertexNormals?.();
  return g;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A flat slab (both faces) between two plan points, d thick to each side, y0..y1 — for boards and panels that stand off a line. */
function slab(bag, mat, a, b, y0, y1, d) {
  const t = [];
  beamTris(t, [a[0], y0, a[1]], [b[0], y0, b[1]], d, y1 - y0);
  bag.add(mat, fromTriangles(t));
}
/** A railing of posts, sill, balusters and a round rail (gyeja nangan) from a to b at floor height y. */
function railing(bag, col, a, b, y, o = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), pt = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const post = o.post ?? 'lacquer_red', bal = o.bal ?? 'paint_dancheong', m = Math.max(1, Math.round(L / (o.step ?? 1.4)));
  for (let k = 0; k <= m; k++) { const [px, pz] = pt(k / m); bag.add(post, box(px - 0.06, y, pz - 0.06, px + 0.06, y + 0.62, pz + 0.06)); }
  const t = [];
  beamTris(t, [a[0], y + 0.06, a[1]], [b[0], y + 0.06, b[1]], 0.06, 0.08);
  beamTris(t, [a[0], y + 0.48, a[1]], [b[0], y + 0.48, b[1]], 0.045, 0.05);
  bag.add(post, fromTriangles(t));
  const nb = Math.max(2, Math.round(L / 0.24));
  for (let k = 1; k < nb; k++) { const [px, pz] = pt(k / nb); bag.add(bal, box(px - 0.022, y + 0.14, pz - 0.022, px + 0.022, y + 0.48, pz + 0.022)); }
  // the bracket arms (hoepanjae) that hold the round rail up off the middle rail
  for (let k = 0; k < m; k++) { const [px, pz] = pt((k + 0.5) / m); bag.add(post, box(px - 0.03, y + 0.53, pz - 0.03, px + 0.03, y + 0.78, pz + 0.03)); }
  bag.add(post, limb([a[0], y + 0.82, a[1]], [b[0], y + 0.82, b[1]], 0.04, 0.04, 8));
  col?.segment(a, b, 0.2, y, y + 0.9);
}

/**
 * nu: Gyeonghoeru as rebuilt in 1867 { rect, y (the island's top), bays [7, 5], h1 (the stone storey),
 * h2 (the upper storey) }: 48 granite pillars at every point of the 7 × 5 bay grid — the 24 of the
 * outer ring square, the 24 inside round, plain (the dragons of 1412 were not carved again); the
 * timber girders over them, painted; the upper floor in three levels rising toward the middle (the
 * king's, 3 × 1 bays), red posts at every grid point, the lattice doors (bunhap) of the second ring
 * hooked up under the ceiling, the railing round the edge; ikgong brackets on the posts, moru
 * dancheong on the head beams; one great hip-and-gable roof with white ridges, chwidu and eleven
 * japsang on each hip.
 */
export function nu67(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, [nx, nz] = el.bays, h1 = el.h1 ?? 4.8, h2 = el.h2 ?? 4.4;
  const X = (i) => x0 + (x1 - x0) * i / nx, Z = (j) => z0 + (z1 - z0) * j / nz;
  const ring = (i, j) => Math.min(i, nx - i, j, nz - j);          // 0 the outer ring, 1 the second, 2 the middle
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const x = X(i), z = Z(j);
    bag.add('granite_korea', box(x - 0.66, y, z - 0.66, x + 0.66, y + 0.22, z + 0.66));
    if (ring(i, j) === 0) {
      // the square pillar: a shaft tapering a little, a moulded cap
      bag.add('granite_korea', box(x - 0.46, y + 0.22, z - 0.46, x + 0.46, y + 0.34, z + 0.46));
      const t = [];
      for (const [ya, yb, r0, r1] of [[0.34, h1 - 0.32, 0.42, 0.39]]) {
        const P = (sx, sz, yy, r) => [x + sx * r, y + yy, z + sz * r], q = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        for (let k = 0; k < 4; k++) { const [ax, az] = q[k], [bx, bz] = q[(k + 1) % 4]; t.push(...P(ax, az, ya, r0), ...P(ax, az, yb, r1), ...P(bx, bz, yb, r1), ...P(ax, az, ya, r0), ...P(bx, bz, yb, r1), ...P(bx, bz, ya, r0)); }
      }
      bag.add('granite_korea', fromTriangles(t.concat(flipTris(t))));
      bag.add('granite_korea', box(x - 0.44, y + h1 - 0.32, z - 0.44, x + 0.44, y + h1 - 0.18, z + 0.44));
      bag.add('granite_korea', box(x - 0.5, y + h1 - 0.18, z - 0.5, x + 0.5, y + h1, z + 0.5));
      col.rect([x - 0.46, z - 0.46, x + 0.46, z + 0.46], y, y + h1);
    } else {
      bag.add('granite_korea', lathe([[0.52, 0], [0.46, 0.1], [0.4, 0.2], [0.38, h1 - 0.42], [0.42, h1 - 0.3], [0.46, h1 - 0.18], [0.001, h1 - 0.18]], 16, null, x, y + 0.22, z));
      bag.add('granite_korea', box(x - 0.48, y + h1 - 0.18, z - 0.48, x + 0.48, y + h1, z + 0.48));
      col.circle(x, z, 0.46, y, y + h1);
    }
  }
  // the girders over the pillars, each line both ways (at two heights, so they cross without touching faces), the joists' ends, the floor
  const y2 = y + h1, yf = y2 + 0.95;
  for (let i = 0; i <= nx; i++) bag.add('paint_dancheong', box(X(i) - 0.26, y2, z0 - 0.6, X(i) + 0.26, y2 + 0.56, z1 + 0.6));
  for (let j = 0; j <= nz; j++) bag.add('paint_dancheong', box(x0 - 0.6, y2 + 0.18, Z(j) - 0.24, x1 + 0.6, y2 + 0.7, Z(j) + 0.24));
  bag.add('timber', box(x0 - 0.58, y2 + 0.56, z0 - 0.58, x1 + 0.58, yf - 0.16, z1 + 0.58));
  bag.add('paint_dancheong', box(x0 - 0.78, yf - 0.16, z0 - 0.78, x1 + 0.78, yf - 0.1, z1 + 0.78));
  bag.add('timber', box(x0 - 0.75, yf - 0.1, z0 - 0.75, x1 + 0.75, yf, z1 + 0.75));
  col.floor([x0 - 0.75, z0 - 0.75, x1 + 0.75, z1 + 0.75], yf);
  // the three levels of the upper floor: the second ring a step up, the middle (the king's) another
  const step = 0.24;
  for (const [r, lift] of [[1, step], [2, 2 * step]]) {
    const R = [X(r) - 0.3, Z(r) - 0.3, X(nx - r) + 0.3, Z(nz - r) + 0.3];
    bag.add('wood_dark', box(R[0], yf - 0.02, R[1], R[2], yf + lift - 0.04, R[3]));
    bag.add('timber', box(R[0] + 0.02, yf + lift - 0.04, R[1] + 0.02, R[2] - 0.02, yf + lift, R[3] - 0.02));
    col.floor(R, yf + lift);
  }
  // the upper posts, red, at every point of the grid, standing on their level
  const yh = yf + h2;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const r = ring(i, j), yb = yf + Math.min(r, 2) * step, d = r === 0 ? 0.27 : 0.3;
    bag.add('lacquer_red', lathe([[d, 0], [d * 0.94, yh - yb], [0.001, yh - yb]], 12, null, X(i), yb, Z(j)));
    col.circle(X(i), Z(j), d, yb, yh);
  }
  // the lattice doors of the second ring, lifted up and hooked under the ceiling (open, as in summer)
  for (let i = 1; i < nx - 1; i++) for (const j of [1, nz - 1]) {
    const xa = X(i) + 0.32, xb = X(i + 1) - 0.32, zz = Z(j), dz = j === 1 ? 1 : -1;
    bag.add('lattice_red', box(xa, yh - 0.98, Math.min(zz, zz + dz * 1.5), xb, yh - 0.93, Math.max(zz, zz + dz * 1.5)));
    for (const xx of [xa + 0.3, xb - 0.3]) bag.add('iron', box(xx - 0.012, yh - 0.93, zz + dz * 1.38 - 0.012, xx + 0.012, yh - 0.62, zz + dz * 1.38 + 0.012));
  }
  for (let j = 1; j < nz - 1; j++) for (const i of [1, nx - 1]) {
    const za = Z(j) + 0.32, zb = Z(j + 1) - 0.32, xx = X(i), dx = i === 1 ? 1 : -1;
    bag.add('lattice_red', box(Math.min(xx, xx + dx * 1.5), yh - 0.98, za, Math.max(xx, xx + dx * 1.5), yh - 0.93, zb));
    for (const zq of [za + 0.3, zb - 0.3]) bag.add('iron', box(xx + dx * 1.38 - 0.012, yh - 0.93, zq - 0.012, xx + dx * 1.38 + 0.012, yh - 0.62, zq + 0.012));
  }
  // the railing round the floor's edge
  const e = 0.6;
  for (const [a, b] of [[[x0 - e, z0 - e], [x1 + e, z0 - e]], [[x0 - e, z1 + e], [x1 + e, z1 + e]], [[x0 - e, z0 - e], [x0 - e, z1 + e]], [[x1 + e, z0 - e], [x1 + e, z1 + e]]]) railing(bag, col, a, b, yf, { step: (x1 - x0) / nx / 2 });
  // the head beams and the ceiling over the whole floor; moru dancheong on the beams' outer faces
  bag.add('paint_dancheong', box(x0 - 0.3, yh - 0.6, z0 - 0.3, x1 + 0.3, yh, z1 + 0.3));
  bag.add('ceiling_coffer', box(X(1), yh - 0.62, Z(1), X(nx - 1), yh - 0.6, Z(nz - 1)));
  const posts = [Array.from({ length: nx + 1 }, (_, i) => X(i)), Array.from({ length: nz + 1 }, (_, j) => Z(j))];
  meoricho(bag, el.rect, posts, yh - 0.55, yh - 0.12, 0.31);
  // ikgong brackets on the posts; the one great roof
  const o = 2.9, bk = dapoHeight({ tiers: 2 }), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, B = (z1 - z0) / 2 + o;
  const r = { c: [cx, cz], A: (x1 - x0) / 2 + o, B, y: yh - 0.25 + bk, rise: B * 0.6, kind: 'xieshan', sweep: 1.0, p: 1.5, alongZ: false, mat: 'tile_grey', soffit: 'paint_dancheong', curl: false, gableAt: 0.4 };
  dapo(bag, el.rect, posts, yh, { tiers: 2, inter: 0 }, (d) => r.y + r.rise * Math.pow(Math.max(0, (o - d) / r.B), 1.5) - 0.14);
  rectRoof(r, bag);
  roofOrnaments(bag, r, { mat: 'tile_grey', joseon: true, white: true, figures: el.figures ?? 11 });
}

/**
 * isle_bridge: a flat stone bridge of Gyeonghoeru's island { a, b (the deck's centre line), w, y (the
 * deck's top), bed, piers }: granite slabs on piers of stacked blocks in the water, a granite
 * balustrade with lotus-bud posts each side, stone beasts on the end posts.
 */
export function isleBridge(el, { bag, col }) {
  const [a, b] = [el.a, el.b], w = el.w / 2, y = el.y, bed = el.bed ?? -2.6, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const t = []; beamTris(t, [a[0], y - 0.45, a[1]], [b[0], y - 0.45, b[1]], w, 0.45); bag.add('granite_korea', fromTriangles(t));
  col.floor([Math.min(a[0], b[0]) - Math.abs(nx) * w, Math.min(a[1], b[1]) - Math.abs(nz) * w, Math.max(a[0], b[0]) + Math.abs(nx) * w, Math.max(a[1], b[1]) + Math.abs(nz) * w], y);
  const np = el.piers ?? 3;
  for (let k = 1; k <= np; k++) {
    const s = L * k / (np + 1), p = [a[0] + ux * s, a[1] + uz * s], q = [];
    beamTris(q, [p[0] - nx * (w - 0.3), bed, p[1] - nz * (w - 0.3)], [p[0] + nx * (w - 0.3), bed, p[1] + nz * (w - 0.3)], 0.6, y - 0.45 - bed);
    bag.add('granite_korea', fromTriangles(q));
  }
  for (const s of [-1, 1]) balustradeCarved(bag, col, [a[0] + nx * s * (w - 0.18), a[1] + nz * s * (w - 0.18)], [b[0] + nx * s * (w - 0.18), b[1] + nz * s * (w - 0.18)], y, [], { carve: 'joseon', mat: 'granite_korea', beasts: true, step: 1.8 });
}

/**
 * hyangwonjeong: the hexagonal two-storey pavilion on its island { c, y (the island's top), r (the
 * hexagon's radius) }: a hexagonal stone base; six posts through both storeys; below, walls of lattice
 * windows over a plastered dado (the floor heated by an ondol whose flue runs round the edge, its
 * stoke-hole on the north-west); the upper floor carried out past the posts on brackets, with its
 * railing all round and lattice windows; dancheong on the beams; the hexagonal pyramid roof with
 * its finial (jeolbyeongtong).
 */
export function hyangwonjeong(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, R = el.r ?? 2.9, hb = 0.75, y0 = y + hb, h1 = 2.55, y1 = y0 + h1 + 0.3, h2 = 2.35, yt = y1 + h2;
  const hex = (r, rot = 0) => Array.from({ length: 6 }, (_, k) => { const a = (k + rot) / 6 * Math.PI * 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
  const prism = (poly, ya, yb, mat) => {
    const t = [], n = poly.length;
    for (let k = 0; k < n; k++) { const p = poly[k], q = poly[(k + 1) % n]; t.push(p[0], ya, p[1], q[0], ya, q[1], q[0], yb, q[1], p[0], ya, p[1], q[0], yb, q[1], p[0], yb, p[1]); t.push(cx, yb, cz, q[0], yb, q[1], p[0], yb, p[1]); t.push(cx, ya, cz, p[0], ya, p[1], q[0], ya, q[1]); }
    bag.add(mat, fromTriangles(t.concat(flipTris(t))));
  };
  // the stone base, its coping, the steps on the north (to the bridge) and the south
  prism(hex(R + 0.75), y - 0.2, y + hb - 0.12, 'granite_korea');
  prism(hex(R + 0.82), y + hb - 0.12, y + hb, 'granite_korea');
  col.rect([cx - R - 0.75, cz - R * 0.87 - 0.7, cx + R + 0.75, cz + R * 0.87 + 0.7], y, y + hb - 0.3);
  col.floor([cx - R - 0.5, cz - R * 0.87 - 0.5, cx + R + 0.5, cz + R * 0.87 + 0.5], y0);
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const zz = cz + s * (R * 0.866 + 0.75 + 0.35 * k + 0.17);
    bag.add('granite_korea', box(cx - 0.8, y - 0.1, zz - 0.18, cx + 0.8, y0 - (k + 1) * hb / 3, zz + 0.18));
  }
  const P = hex(R);
  // the six posts on their stones, through both storeys
  for (const p of P) {
    bag.add('granite_korea', lathe([[0.3, 0], [0.3, 0.06], [0.24, 0.16], [0.001, 0.16]], 10, null, p[0], y0, p[1]));
    bag.add('lacquer_red', lathe([[0.17, 0], [0.16, yt - y0 - 0.16], [0.001, yt - y0 - 0.16]], 10, null, p[0], y0 + 0.16, p[1]));
    col.circle(p[0], p[1], 0.18, y0, yt);
  }
  // the floor of the lower room (oiled paper over the ondol), its threshold
  prism(hex(R - 0.02), y0 - 0.02, y0 + 0.1, 'paint_ochre');
  // the lower walls: a plastered dado, lattice windows (one side a door, toward the bridge), the head rail
  for (let k = 0; k < 6; k++) {
    const a = P[k], b = P[(k + 1) % 6], mx = (a[0] + b[0]) / 2 - cx, mz = (a[1] + b[1]) / 2 - cz, door = mz < -1 && Math.abs(mx) < 0.5;
    const ia = [a[0] + (b[0] - a[0]) * 0.07, a[1] + (b[1] - a[1]) * 0.07], ib = [a[0] + (b[0] - a[0]) * 0.93, a[1] + (b[1] - a[1]) * 0.93];
    latticeBay(bag, col, ia, ib, y0 + 0.1, h1 - 0.15, door ? 'door' : 'window', 0.05);
    slab(bag, 'paint_dancheong', a, b, y0 + h1 - 0.05, y0 + h1 + 0.3, 0.12);
  }
  // the upper floor: brackets out from the posts, the floor carried out, the railing round its edge
  for (const p of P) {
    const dx = (p[0] - cx) / R, dz = (p[1] - cz) / R, t = [];
    beamTris(t, [p[0] - dx * 0.1, y1 - 0.32, p[1] - dz * 0.1], [p[0] + dx * 0.95, y1 - 0.32, p[1] + dz * 0.95], 0.08, 0.22);
    bag.add('paint_dancheong', fromTriangles(t));
    bag.add('lacquer_red', box(p[0] + dx * 0.88 - 0.07, y1 - 0.42, p[1] + dz * 0.88 - 0.07, p[0] + dx * 0.88 + 0.07, y1 - 0.24, p[1] + dz * 0.88 + 0.07));
  }
  prism(hex(R + 1.0), y1 - 0.1, y1, 'timber');
  prism(hex(R + 1.04), y1 - 0.22, y1 - 0.1, 'paint_dancheong');
  col.floor([cx - R, cz - R * 0.8, cx + R, cz + R * 0.8], y1);
  const Pr = hex(R + 0.92);
  for (let k = 0; k < 6; k++) railing(bag, null, Pr[k], Pr[(k + 1) % 6], y1 - 0.03, { step: 0.9 });
  // the upper walls: lattice windows all round, and the head beam with its dancheong band at each end
  for (let k = 0; k < 6; k++) {
    const a = P[k], b = P[(k + 1) % 6];
    const ia = [a[0] + (b[0] - a[0]) * 0.07, a[1] + (b[1] - a[1]) * 0.07], ib = [a[0] + (b[0] - a[0]) * 0.93, a[1] + (b[1] - a[1]) * 0.93];
    latticeBay(bag, null, ia, ib, y1, h2 - 0.45, 'door', 0.05);
    slab(bag, 'paint_dancheong', a, b, yt - 0.5, yt, 0.13);
    for (const f of [0.1, 0.9]) {
      const c = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], u = [(b[0] - a[0]) * 0.06, (b[1] - a[1]) * 0.06];
      slab(bag, 'lacquer_red', [c[0] - u[0], c[1] - u[1]], [c[0] + u[0], c[1] + u[1]], yt - 0.44, yt - 0.06, 0.145);
      slab(bag, 'paint_blue', [c[0] - u[0] * 0.5, c[1] - u[1] * 0.5], [c[0] + u[0] * 0.5, c[1] + u[1] * 0.5], yt - 0.38, yt - 0.12, 0.16);
    }
  }
  // brackets at the post heads, the ceiling, the roof and its finial
  for (const p of P) { const dx = (p[0] - cx) / R, dz = (p[1] - cz) / R, t = []; beamTris(t, [p[0] - dx * 0.3, yt - 0.02, p[1] - dz * 0.3], [p[0] + dx * 0.75, yt - 0.02, p[1] + dz * 0.75], 0.09, 0.3); bag.add('paint_dancheong', fromTriangles(t)); }
  prism(hex(R + 0.1), yt, yt + 0.2, 'paint_dancheong');
  const rise = R * 1.05 + 1.0;
  pyramidRoof(hex(R + 1.75), yt + 0.12, rise, 0.75, bag, 'tile_grey', 'paint_dancheong', 1.6);
  bag.add('tile_grey', lathe([[0.3, 0], [0.34, 0.1], [0.36, 0.28], [0.22, 0.42], [0.3, 0.6], [0.32, 0.78], [0.18, 0.92], [0.2, 1.05], [0.06, 1.2], [0.001, 1.28]], 10, null, cx, yt + 0.12 + rise - 0.05, cz));
}

/**
 * plank_bridge: Chwihyanggyo { a (the island's end), b (the bank's), w, ya, yb (the deck at the two
 * ends), rise (at the middle), rows (of piers), bed }: a wooden bridge of a slight arch on rows of
 * granite posts in the water, cross beams on them, planks, a plain wooden railing.
 */
export function plankBridge(el, { bag, col }) {
  const a = el.a, b = el.b, w = el.w / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const bed = el.bed ?? -2.6, rows = el.rows ?? 3, N = 12;
  const H = (s) => { const t = s / L; return el.ya + (el.yb - el.ya) * t + (el.rise ?? 0.5) * Math.sin(Math.PI * t); };
  const at = (s, o = 0) => [a[0] + ux * s + nx * o, a[1] + uz * s + nz * o];
  const deck = [], beams = [];
  for (let k = 0; k < N; k++) {
    const s0 = L * k / N, s1 = L * (k + 1) / N, p0 = at(s0), p1 = at(s1);
    beamTris(deck, [p0[0], H(s0) - 0.1, p0[1]], [p1[0], H(s1) - 0.1, p1[1]], w, 0.1);
    for (const o of [-w + 0.2, w - 0.2]) { const q0 = at(s0, o), q1 = at(s1, o); beamTris(beams, [q0[0], H(s0) - 0.36, q0[1]], [q1[0], H(s1) - 0.36, q1[1]], 0.1, 0.26); }
    const r = [Math.min(p0[0], p1[0]) - Math.abs(nx) * w, Math.min(p0[1], p1[1]) - Math.abs(nz) * w, Math.max(p0[0], p1[0]) + Math.abs(nx) * w, Math.max(p0[1], p1[1]) + Math.abs(nz) * w];
    const dir = Math.abs(uz) > Math.abs(ux) ? (uz < 0 ? 'n' : 's') : (ux > 0 ? 'e' : 'w'), up = H(s1) >= H(s0);
    const back = { n: 's', s: 'n', e: 'w', w: 'e' };
    col.ramp(r, Math.min(H(s0), H(s1)), Math.max(H(s0), H(s1)), up ? dir : back[dir]);
  }
  bag.add('timber', fromTriangles(deck)); bag.add('wood_dark', fromTriangles(beams));
  // the plank joints: thin dark strips across the deck
  const jt = [];
  for (let k = 1; k < Math.round(L / 0.3); k++) { const s = k * L / Math.round(L / 0.3), p = at(s, -w + 0.02), q = at(s, w - 0.02); beamTris(jt, [p[0], H(s) - 0.004, p[1]], [q[0], H(s) - 0.004, q[1]], 0.01, 0.006); }
  bag.add('wood_dark', fromTriangles(jt));
  // the rows of piers: two granite posts, a cap beam across
  for (let k = 1; k <= rows; k++) {
    const s = L * k / (rows + 1), hy = H(s) - 0.36;
    for (const o of [-w + 0.2, w - 0.2]) { const p = at(s, o); bag.add('granite_korea', box(p[0] - 0.17, bed, p[1] - 0.17, p[0] + 0.17, hy - 0.2, p[1] + 0.17)); }
    const p = at(s, -w - 0.15), q = at(s, w + 0.15), t = []; beamTris(t, [p[0], hy - 0.2, p[1]], [q[0], hy - 0.2, q[1]], 0.13, 0.2); bag.add('wood_dark', fromTriangles(t));
  }
  // the railing: posts every ~1.5 m, a top rail and a middle rail following the arch
  const nr = Math.max(2, Math.round(L / 1.5)), rail = [];
  for (const o of [-w + 0.06, w - 0.06]) {
    for (let k = 0; k <= nr; k++) { const s = L * k / nr, p = at(s, o); bag.add('timber', box(p[0] - 0.05, H(s), p[1] - 0.05, p[0] + 0.05, H(s) + 0.92, p[1] + 0.05)); }
    for (let k = 0; k < N; k++) {
      const s0 = L * k / N, s1 = L * (k + 1) / N, p0 = at(s0, o), p1 = at(s1, o);
      beamTris(rail, [p0[0], H(s0) + 0.84, p0[1]], [p1[0], H(s1) + 0.84, p1[1]], 0.045, 0.08);
      beamTris(rail, [p0[0], H(s0) + 0.42, p0[1]], [p1[0], H(s1) + 0.42, p1[1]], 0.03, 0.05);
    }
    col.segment(at(0, o), at(L, o), 0.12, Math.min(el.ya, el.yb), Math.max(el.ya, el.yb) + (el.rise ?? 0.5) + 1);
  }
  bag.add('timber', fromTriangles(rail));
}

/** ring_bank: the stone embankment round a round island { c, r, y (its top), bed }: dressed granite, a coping. */
export function ringBank(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y, bed = el.bed ?? -2.6, n = Math.max(24, Math.round(r * 6));
  bag.add('granite_korea', lathe([[r + 1.3, bed], [r + 0.75, -1.3], [r + 0.2, y - 0.14], [r - 0.6, y - 0.14], [r - 0.6, bed + 0.5], [r + 1.3, bed]], n, null, cx, 0, cz));
  bag.add('granite_korea', lathe([[r + 0.32, y - 0.14], [r + 0.32, y], [r - 0.45, y], [r - 0.45, y - 0.14]], n, null, cx, 0, cz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; col.circle(cx + Math.cos(a) * (r + 0.6), cz + Math.sin(a) * (r + 0.6), 0.5, bed, y - 0.3); }
}

/**
 * chimney: one of the hexagonal chimneys of Amisan { at, y, h, face (yaw) }: on a granite plinth a
 * hexagonal shaft of orange brick, each face framed in brick and inset with a moulded clay panel — a
 * different design on each face (here the ten longevity symbols and plants in relief: a crane, a
 * pine, deer, bamboo, plum, a fungus of immortality, as raised lozenges and roundels) — a frieze, a
 * little tiled roof on top with the smoke house (yeonga) under its cap.
 */
export function chimney(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, H = el.h ?? 2.6, r = el.r ?? 0.62, rand = rng(el.seed ?? 7), yaw = el.face ?? 0;
  const hex = (rr, k) => { const a = (k + 0.5) / 6 * Math.PI * 2 + yaw; return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]; };
  const prism = (rr, ya, yb, mat) => {
    const t = [];
    for (let k = 0; k < 6; k++) { const p = hex(rr, k), q = hex(rr, k + 1); t.push(p[0], ya, p[1], q[0], ya, q[1], q[0], yb, q[1], p[0], ya, p[1], q[0], yb, q[1], p[0], yb, p[1], cx, yb, cz, q[0], yb, q[1], p[0], yb, p[1]); }
    bag.add(mat, fromTriangles(t.concat(flipTris(t))));
  };
  prism(r + 0.18, y, y + 0.32, 'granite_korea');
  prism(r, y + 0.32, y + H, 'brick');
  prism(r + 0.04, y + 0.32, y + 0.5, 'brick_baked');
  prism(r + 0.05, y + H - 0.55, y + H - 0.45, 'brick_baked');
  prism(r + 0.09, y + H - 0.45, y + H - 0.3, 'brick');
  // the panels: a recessed field framed by a raised border of brick, a design in pale clay relief
  const ap = r * 0.866;                         // the apothem
  for (let k = 0; k < 6; k++) {
    const p = hex(r, k), q = hex(r, k + 1), mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, nx = (mx - cx) / ap, nz = (mz - cz) / ap, ux = (q[0] - p[0]) / r, uz = (q[1] - p[1]) / r;
    const pane = (u0, u1, ya, yb, d, mat) => { const a = [mx + ux * u0 + nx * d, mz + uz * u0 + nz * d], b = [mx + ux * u1 + nx * d, mz + uz * u1 + nz * d]; slab(bag, mat, a, b, ya, yb, 0.02); };
    const w = r * 0.42, ya = y + 0.75, yb = y + H - 0.75;
    pane(-w - 0.05, w + 0.05, ya - 0.05, ya + 0.0, 0.025, 'brick_baked'); pane(-w - 0.05, w + 0.05, yb, yb + 0.05, 0.025, 'brick_baked');
    pane(-w - 0.05, -w, ya, yb, 0.025, 'brick_baked'); pane(w, w + 0.05, ya, yb, 0.025, 'brick_baked');
    pane(-w, w, ya, yb, 0.004, 'brick_baked');
    // the design: a few roundels and lozenges, set as the face's seed chooses
    const kind = (k + Math.floor(rand() * 6)) % 3, ym = (ya + yb) / 2;
    if (kind === 0) { pane(-w * 0.12, w * 0.12, ya + 0.08, yb - 0.25, 0.03, 'plaster_grey'); for (const s of [-1, 1]) for (let j = 0; j < 3; j++) pane(s * w * 0.2 - w * 0.18, s * w * 0.2 + w * 0.18, ya + 0.3 + j * 0.3, ya + 0.36 + j * 0.3, 0.03, 'plaster_grey'); }
    else if (kind === 1) { for (let j = 0; j < 3; j++) pane(-w * 0.3, w * 0.3, ym - 0.4 + j * 0.32, ym - 0.2 + j * 0.32, 0.03, 'plaster_grey'); }
    else { pane(-w * 0.5, w * 0.5, ym - 0.08, ym + 0.08, 0.03, 'plaster_grey'); pane(-w * 0.08, w * 0.08, ym - 0.5, ym + 0.5, 0.03, 'plaster_grey'); }
    // the beast panel at the foot (a haetae or a bulgasari, warding off fire)
    pane(-w * 0.6, w * 0.6, y + 0.52, y + 0.68, 0.03, 'plaster_grey');
  }
  // the tiled roof and the smoke house under its little cap
  const ry = y + H - 0.3;
  pyramidRoof(Array.from({ length: 6 }, (_, k) => hex(r + 0.3, k)), ry, 0.36, 0.08, bag, 'tile_grey', 'brick_baked', 1.4);
  bag.add('brick', box(cx - 0.17, ry + 0.2, cz - 0.17, cx + 0.17, ry + 0.62, cz + 0.17));
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; bag.add('opening', box(cx + Math.cos(a) * 0.172 - 0.05 - Math.abs(Math.sin(a)) * 0.03, ry + 0.38, cz + Math.sin(a) * 0.172 - 0.05 - Math.abs(Math.cos(a)) * 0.03, cx + Math.cos(a) * 0.172 + 0.05 + Math.abs(Math.sin(a)) * 0.03, ry + 0.52, cz + Math.sin(a) * 0.172 + 0.05 + Math.abs(Math.cos(a)) * 0.03)); }
  pyramidRoof([[cx - 0.32, cz - 0.32], [cx + 0.32, cz - 0.32], [cx + 0.32, cz + 0.32], [cx - 0.32, cz + 0.32]], ry + 0.62, 0.22, 0.04, bag, 'tile_grey', 'brick_baked', 1.3);
  col.circle(cx, cz, r + 0.15, y, y + H);
}

/**
 * terrace_wall: a retaining wall of one of Amisan's flower terraces (hwagye) { a, b, y0, y1, th }:
 * long dressed granite courses, a coping stone a little proud.
 */
export function terraceWall(el, { bag, col }) {
  const [a, b] = [el.a, el.b], th = el.th ?? 1.8, t = [], c = [];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  // the wall's face on the a→b line, its body back toward −n (the higher ground)
  const m = [(a[0] + b[0]) / 2 - nx * th / 2, (a[1] + b[1]) / 2 - nz * th / 2];
  beamTris(t, [m[0] - ux * L / 2, el.y0 - 0.4, m[1] - uz * L / 2], [m[0] + ux * L / 2, el.y0 - 0.4, m[1] + uz * L / 2], th / 2, el.y1 - el.y0 + 0.3);
  beamTris(c, [m[0] - ux * (L / 2 + 0.08) + nx * 0.06, el.y1 - 0.1, m[1] - uz * (L / 2 + 0.08) + nz * 0.06], [m[0] + ux * (L / 2 + 0.08) + nx * 0.06, el.y1 - 0.1, m[1] + uz * (L / 2 + 0.08) + nz * 0.06], th / 2 + 0.06, 0.16);
  bag.add('granite_korea', fromTriangles(t)); bag.add('granite_korea', fromTriangles(c));
  col.segment([m[0] - ux * L / 2, m[1] - uz * L / 2], [m[0] + ux * L / 2, m[1] + uz * L / 2], th, el.y0 - 0.4, el.y1 - 0.25);
  const q = [[a[0], a[1]], [b[0], b[1]], [b[0] - nx * th, b[1] - nz * th], [a[0] - nx * th, a[1] - nz * th]];
  col.floor([Math.min(...q.map((v) => v[0])), Math.min(...q.map((v) => v[1])), Math.max(...q.map((v) => v[0])), Math.max(...q.map((v) => v[1]))], el.y1 + 0.06);
}

/**
 * sijeon: a row of the licensed shops of Jongno { rect, front ('n' | 's'), seed, goods }: a granite
 * footing, a tiled roof along the street, shops of one bay (about 2.6 m) between plastered party
 * walls, each with its board shutters hooked up under the eave, a raised wooden floor (maru) at the
 * front where the merchant sits, shelves at the back stacked with its goods — bolts of silk, cotton
 * and ramie, quires of paper, dried fish, earthenware — a storeroom (haengnang) behind.
 */
const GOODS = ['silk', 'cotton', 'ramie', 'paper', 'fish', 'jars', 'silk', 'cotton'];
const BOLT = { silk: ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_maroon'], cotton: ['cloth_white', 'cloth_white', 'linen', 'cloth_indigo'], ramie: ['linen', 'cloth_white', 'cloth_grey'] };
export function sijeon(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), [x0, z0, x1, z1] = el.rect, n = el.front === 's' ? 1 : -1, zf = n < 0 ? z0 : z1, zb = n < 0 ? z1 : z0;
  const D = z1 - z0, nb = Math.max(1, Math.round((x1 - x0) / 2.6)), bw = (x1 - x0) / nb, h = 2.5;
  const Zf = (d) => zf - n * d;                                       // d metres in from the front
  bag.add('granite_korea', box(x0 - 0.3, -0.2, z0 - 0.3, x1 + 0.3, 0.42, z1 + 0.3));
  col.floor([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], 0.42);
  // the back wall, the store behind it, the party walls
  const back = [Math.min(Zf(D - 0.25), Zf(D)), Math.max(Zf(D - 0.25), Zf(D))];
  bag.add('plaster_white', box(x0, 0.42, back[0], x1, 0.42 + h, back[1]));
  bag.add('plaster_damp', box(x0 - 0.01, 0.42, back[0] - 0.01, x1 + 0.01, 1.0, back[1] + 0.01));
  col.rect([x0, back[0], x1, back[1]], 0, 0.42 + h);
  for (let k = 0; k <= nb; k++) {
    const x = x0 + k * bw, za = Math.min(Zf(1.0), Zf(D)), zc = Math.max(Zf(1.0), Zf(D));
    bag.add('plaster_white', box(x - 0.1, 0.42, za, x + 0.1, 0.42 + h - 0.04, zc));
    bag.add('timber', box(x - 0.11, 0.42, Math.min(Zf(0.12), Zf(0.36)), x + 0.11, 0.42 + h - 0.32, Math.max(Zf(0.12), Zf(0.36))));
    col.rect([x - 0.12, za, x + 0.12, zc], 0, 0.42 + h);
  }
  // the head beam along the front, the roof over all
  bag.add('timber', box(x0 - 0.2, 0.42 + h - 0.3, Math.min(Zf(0.08), Zf(0.4)), x1 + 0.2, 0.42 + h, Math.max(Zf(0.08), Zf(0.4))));
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (x1 - x0) / 2 + 1.0, B: D / 2 + 1.0, y: 0.42 + h - 0.1, rise: (D / 2 + 1) * 0.55, kind: 'xieshan', sweep: 0.5, p: 1.5, alongZ: false, mat: 'tile_grey', soffit: 'timber', curl: false }, bag);
  for (let k = 0; k < nb; k++) {
    const xa = x0 + k * bw + 0.12, xb = x0 + (k + 1) * bw - 0.12, good = el.goods ?? GOODS[Math.floor(rand() * GOODS.length)];
    // the maru at the front, on short posts, across the left part of the bay; the right 0.95 m is the way in (earth floor at the stone's level)
    const xm = xb - 0.95, mz = [Math.min(Zf(0.15), Zf(1.15)), Math.max(Zf(0.15), Zf(1.15))];
    bag.add('timber', box(xa, 0.42 + 0.38, mz[0], xm, 0.42 + 0.46, mz[1]));
    for (const xx of [xa + 0.1, xm - 0.1]) bag.add('wood_dark', box(xx - 0.05, 0.42, Zf(0.25) - 0.05, xx + 0.05, 0.42 + 0.38, Zf(0.25) + 0.05));
    col.rect([xa, mz[0], xm, mz[1]], 0.42, 0.42 + 0.46);
    bag.add('granite_korea', box(xm + 0.1, 0.1, Math.min(Zf(-0.35), Zf(0.15)), xb - 0.1, 0.42, Math.max(Zf(-0.35), Zf(0.15))));   // the step stone at the way in
    col.floor([xm + 0.1, Math.min(Zf(-0.35), Zf(0.15)), xb - 0.1, Math.max(Zf(-0.35), Zf(0.15))], 0.3);
    // the shutters, hooked up under the eave, slanting out over the street
    const t = [], y2 = 0.42 + h - 0.3;
    beamTris(t, [(xa + xb) / 2, y2 - 0.02, Zf(0.25)], [(xa + xb) / 2, y2 + 0.35, Zf(-0.9)], (xb - xa) / 2, 0.04);
    bag.add('planks_grey', fromTriangles(t));
    // the shelves at the back, two boards on brackets, and the goods on them
    const sz = [Math.min(Zf(D - 0.75), Zf(D - 0.27)), Math.max(Zf(D - 0.75), Zf(D - 0.27))];
    for (const yy of [1.1, 1.8]) bag.add('timber', box(xa, 0.42 + yy - 0.04, sz[0], xb, 0.42 + yy, sz[1]));
    for (const [yy, top] of [[0.42, 1.0], [1.52, 1.76], [2.22, 2.5]]) {
      let x = xa + 0.08;
      const zc = (sz[0] + sz[1]) / 2, hh = top - yy;
      while (x < xb - 0.35) {
        const w = 0.22 + rand() * 0.16;
        if (good === 'jars') bag.add(rand() < 0.5 ? 'pottery_dark' : 'glaze_white', lathe([[0.06, 0], [w * 0.5, hh * 0.3], [w * 0.55, hh * 0.62], [w * 0.3, hh * 0.9], [w * 0.3, hh], [0.001, hh]], 8, null, x + w / 2, yy, zc));
        else if (good === 'fish') bag.add('wicker', box(x, yy, sz[0] + 0.05, x + w, yy + Math.min(0.18, hh), sz[1] - 0.05));
        else if (good === 'paper') { bag.add('paint_white', box(x, yy, sz[0] + 0.04, x + w * 1.4, yy + Math.min(hh, 0.08 + rand() * 0.2), sz[1] - 0.04)); x += w * 0.5; }
        else {
          const mats = BOLT[good], th = 0.1 + rand() * 0.04, ns = Math.min(1 + Math.floor(rand() * 3), Math.floor(hh / th));
          for (let k2 = 0; k2 < ns; k2++) bag.add(mats[Math.floor(rand() * mats.length)], box(x, yy + k2 * th, sz[0] + 0.03, x + w, yy + (k2 + 1) * th - 0.01, sz[1] - 0.03));
        }
        x += w + 0.05;
      }
    }
    // goods laid out on the maru too
    if (good !== 'jars' && good !== 'fish') for (let s2 = 0; s2 < 2; s2++) { const xx = xa + 0.2 + s2 * (xm - xa - 0.4) / 2, mats = BOLT[good] ?? ['paint_white']; bag.add(mats[Math.floor(rand() * mats.length)], box(xx, 0.88, Zf(0.5) - 0.12, xx + 0.4, 0.88 + 0.08 * (1 + Math.floor(rand() * 3)), Zf(0.5) + 0.12)); }
    else bag.add('wicker', lathe([[0.2, 0], [0.26, 0.12], [0.001, 0.12]], 10, null, (xa + xm) / 2, 0.88, Zf(0.6)));
    // inside, behind the maru: a low table with the stock stacked on it, a ledger desk with the abacus on the maru's back edge, a stool, bundles hung from a rail under the roof, a lamp
    const zr = (d0, d1) => [Math.min(Zf(d0), Zf(d1)), Math.max(Zf(d0), Zf(d1))], tz = zr(2.3, 3.3), cxm = xa + 0.55;
    bag.add('wood_dark', box(xa + 0.1, 0.42 + 0.42, tz[0], xa + 1.0, 0.42 + 0.47, tz[1]));
    for (const xx of [xa + 0.15, xa + 0.95]) for (const zz of [tz[0] + 0.05, tz[1] - 0.05]) bag.add('wood_dark', box(xx - 0.03, 0.42, zz - 0.03, xx + 0.03, 0.42 + 0.42, zz + 0.03));
    col.rect([xa + 0.08, tz[0], xa + 1.02, tz[1]], 0.42, 0.42 + 0.5);
    const mats = BOLT[good] ?? ['paint_white', 'wicker'];
    for (let q = 0; q < 3; q++) bag.add(mats[Math.floor(rand() * mats.length)], box(xa + 0.15 + (q % 2) * 0.38, 0.42 + 0.47 + Math.floor(q / 2) * 0.12, tz[0] + 0.1, xa + 0.5 + (q % 2) * 0.38, 0.42 + 0.58 + Math.floor(q / 2) * 0.12, tz[1] - 0.1));
    const dz = zr(1.2, 1.55);
    bag.add('wood_dark', box(xm - 0.55, 0.42 + 0.28, dz[0], xm - 0.1, 0.42 + 0.33, dz[1]));       // the desk, low, standing on the floor behind the maru's edge
    bag.add('paint_white', box(xm - 0.5, 0.42 + 0.33, dz[0] + 0.03, xm - 0.3, 0.42 + 0.345, dz[1] - 0.03));
    bag.add('wood_dark', box(xm - 0.27, 0.42 + 0.33, dz[0] + 0.04, xm - 0.14, 0.42 + 0.37, dz[0] + 0.2));   // the abacus (jupan)
    bag.add('timber', box(xm - 0.55 + 0.05, 0.42, dz[0] + 0.03, xm - 0.5 + 0.05, 0.42 + 0.28, dz[0] + 0.08));
    col.rect([xm - 0.55, dz[0], xm - 0.1, dz[1]], 0.42, 0.42 + 0.34);
    const st = zr(1.9, 2.2); bag.add('timber', box(xm + 0.05, 0.42, st[0], xm + 0.35, 0.42 + 0.3, st[1]));
    const rz = zr(1.7, 1.78), ry = 0.42 + h - 0.45;
    bag.add('timber', box(xa, ry, rz[0], xb, ry + 0.05, rz[1]));
    for (let q = 0; q < 3; q++) {
      const xx = xa + 0.3 + q * (xm - xa - 0.6) / 2, m2 = good === 'fish' ? 'wicker' : good === 'jars' ? 'pottery_dark' : mats[Math.floor(rand() * mats.length)];
      bag.add('rope_fibre', box(xx - 0.008, ry - 0.5, rz[0] + 0.03, xx + 0.008, ry, rz[0] + 0.05));
      bag.add(m2, box(xx - 0.1, ry - 0.9, rz[0] - 0.02, xx + 0.1, ry - 0.5, rz[1] + 0.12));
    }
    bag.add('lamp_paper', box(xb - 0.45, ry - 0.2, zr(3.2, 3.4)[0], xb - 0.25, ry + 0.1, zr(3.2, 3.4)[1]));
    void cxm;
  }
}

/**
 * bell_pavilion: Bosingak as it stood after 1869 { rect }: a granite base; a hall of 5 × 2 bays,
 * plastered walls with lattice above, open toward the street on the middle bays; the bell of 1468
 * (about 3.2 m high, 2.3 m across) hung inside from the beams; a hip-and-gable roof with dancheong.
 */
export function bellPavilion(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = 0.9, H = 3.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('granite_korea', box(x0 - 0.6, -0.2, z0 - 0.6, x1 + 0.6, y, z1 + 0.6));
  col.rect([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], 0, y - 0.3);
  const xs = Array.from({ length: 6 }, (_, i) => x0 + (x1 - x0) * i / 5), zs = [z0, cz, z1];
  for (const x of xs) for (const z of [z0, z1]) { bag.add('granite_korea', box(x - 0.3, y, z - 0.3, x + 0.3, y + 0.12, z + 0.3)); bag.add('lacquer_red', lathe([[0.22, 0], [0.21, H], [0.001, H]], 12, null, x, y + 0.12, z)); col.circle(x, z, 0.24, y, y + H); }
  for (const x of [x0, x1]) { bag.add('granite_korea', box(x - 0.3, y, cz - 0.3, x + 0.3, y + 0.12, cz + 0.3)); bag.add('lacquer_red', lathe([[0.22, 0], [0.21, H], [0.001, H]], 12, null, x, y + 0.12, cz)); }
  // the walls: plaster below, lattice above; the street side open on its three middle bays behind a low rail
  for (const [a, b, open] of [[[x0, z0], [x1, z0], false], [[x0, z1], [x1, z1], true], [[x0, z0], [x0, z1], false], [[x1, z0], [x1, z1], false]]) {
    const along = a[1] === b[1], ps = along ? xs : zs;
    for (let k = 0; k + 1 < ps.length; k++) {
      const pa = along ? [ps[k] + 0.22, a[1]] : [a[0], ps[k] + 0.22], pb = along ? [ps[k + 1] - 0.22, a[1]] : [a[0], ps[k + 1] - 0.22];
      if (open && k > 0 && k < 4) { railing(bag, col, pa, pb, y + 0.12, { step: 1.2 }); continue; }
      slab(bag, 'plaster_white', pa, pb, y + 0.12, y + 1.5, 0.1);
      slab(bag, 'plaster_damp', pa, pb, y + 0.12, y + 0.5, 0.11);
      latticeBay(bag, null, pa, pb, y + 1.5, H - 1.6, 'window', 0.05);
      col.segment(pa, pb, 0.2, y, y + H);
    }
  }
  col.floor([x0, z0, x1, z1], y + 0.12);
  bag.add('paint_dancheong', box(x0 - 0.25, y + H - 0.45, z0 - 0.25, x1 + 0.25, y + H + 0.1, z1 + 0.25));
  meoricho(bag, el.rect, [xs, [z0, z1]], y + H - 0.4, y + H + 0.04, 0.26);
  // the bell, hung from a beam across the middle
  const bh = 3.18, br = 1.14, top = y + H - 0.5;
  bag.add('paint_dancheong', box(cx - 0.2, top - 0.05, z0 + 0.2, cx + 0.2, top + 0.4, z1 - 0.2));
  bag.add('bronze', lathe([[br, 0], [br * 0.98, 0.12], [br * 0.86, 0.5], [br * 0.8, 1.4], [br * 0.82, 2.3], [br * 0.74, 2.62], [br * 0.5, 2.72], [0.001, 2.74]], 24, null, cx, top - 0.35 - bh, cz));
  bag.add('bronze', limb([cx - 0.25, top - 0.62, cz], [cx + 0.25, top - 0.36, cz], 0.07, 0.05, 8));
  bag.add('bronze', lathe([[0.14, 0], [0.12, 0.24], [0.001, 0.26]], 8, null, cx, top - 0.62, cz));
  for (const s of [-1, 1]) bag.add('bronze', lathe([[0.2, 0], [0.2, 0.03], [0.001, 0.03]], 12, null, cx, top - 0.35 - bh + 1.0, cz + s * br * 0.8));
  col.circle(cx, cz, br, top - 0.35 - bh, top);
  const o = 1.5, r = { c: [cx, cz], A: (x1 - x0) / 2 + o, B: (z1 - z0) / 2 + o, y: y + H - 0.05, rise: ((z1 - z0) / 2 + o) * 0.62, kind: 'xieshan', sweep: 0.9, p: 1.5, alongZ: false, mat: 'tile_grey', soffit: 'paint_dancheong', curl: false };
  rectRoof(r, bag);
  roofOrnaments(bag, r, { mat: 'tile_grey', joseon: true, white: true, figures: 5 });
}

/**
 * jige: the porter's A-frame on a figure's back, or set down propped on its stick { at, y, rot,
 * load ('brush' | 'sack' | 'jars' | 'wood' | 'none'), down }: two forked uprights, rungs, the shoulder
 * straps of straw rope, the load lashed on, the forked stick (jakdaegi) in the hand or under the frame.
 * Facing −z like the figures: on the back is +z.
 */
export function jige(el, { bag }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), rand = rng(el.seed ?? 3);
  // local (u across, v up, w back) → world; on the back: its feet at the small of the back, leaning a little; set down: tilted back on its stick
  const lean = el.down ? 0.42 : 0.07, base = el.down ? [0, 0, 0.3] : [0, 0.42, 0.15];
  const L = (u, v, w) => [u + base[0], v * Math.cos(lean) - w * Math.sin(lean) + base[1], v * Math.sin(lean) + w * Math.cos(lean) + base[2]];
  const W = (u, v, w) => { const [uu, vv, ww] = L(u, v, w); return [cx + uu * c + ww * s, y + vv, cz - uu * s + ww * c]; };
  const part = (mat, a, b, r, n = 5) => bag.add(mat, limb(W(...a), W(...b), r, r, n));
  const blob = (mat, rx, ry, rz, at) => { const p = W(...at); bag.add(mat, T(mat === 'thatch' ? bushy(ball(rx, ry, rz, 12, 8)) : ball(rx, ry, rz, 9, 6), p[0], p[1], p[2], rot)); };
  for (const sx of [-1, 1]) {
    part('timber', [sx * 0.2, 0, 0.02], [sx * 0.15, 1.15, 0.02], 0.025);           // the uprights
    part('timber', [sx * 0.2, 0.6, 0.02], [sx * 0.23, 0.66, 0.4], 0.02);           // the prongs (sae-sseul) that carry the load
    if (!el.down) {                                                                // the straps of straw rope: over the shoulder, under the arm, back to the frame
      part('rope_fibre', [sx * 0.15, 0.95, 0.02], [sx * 0.15, 0.98, -0.2], 0.014);
      part('rope_fibre', [sx * 0.15, 0.98, -0.2], [sx * 0.17, 0.6, -0.24], 0.014);
      part('rope_fibre', [sx * 0.17, 0.6, -0.24], [sx * 0.19, 0.5, 0.02], 0.014);
    }
  }
  for (const v of [0.35, 0.62, 0.85, 1.05]) part('timber', [-0.19, v, 0.02], [0.19, v, 0.02], 0.016);
  const load = el.load ?? 'brush';
  if (load === 'brush') {
    // a bundle of pine brush, bushy, tied over the prongs, twigs bristling from it
    blob('thatch', 0.4, 0.5, 0.26, [0, 0.98, 0.3]);
    blob('thatch', 0.3, 0.28, 0.22, [0, 1.4, 0.26]);
    for (let k = 0; k < 9; k++) { const u = (rand() - 0.5) * 0.7, v = 0.7 + rand() * 1.1, w = 0.3 + (rand() - 0.5) * 0.3; part('bark_pine', [u * 0.5, v, w], [u * 1.25, v + 0.12, w + (rand() - 0.5) * 0.4], 0.012, 4); }
    part('rope_fibre', [-0.3, 1.0, 0.04], [0.3, 1.0, 0.04], 0.018);
  } else if (load === 'wood') {
    // split pine stacked across the prongs, roped
    for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) { const v = 0.7 + r * 0.095, w = 0.1 + k * 0.1 + (r % 2) * 0.04; part('timber', [-0.42 + rand() * 0.06, v, w], [0.42 - rand() * 0.06, v + (rand() - 0.5) * 0.03, w], 0.045, 6); }
    for (const u of [-0.25, 0.25]) part('rope_fibre', [u, 0.66, 0.05], [u, 1.2, 0.2], 0.014);
  } else if (load === 'sack') {
    blob('sacking', 0.26, 0.36, 0.2, [0, 0.98, 0.24]);
  } else if (load === 'jars') {
    for (const [u, v] of [[-0.12, 0.66], [0.12, 0.66], [0, 0.98]]) { const p = W(u, v, 0.24); bag.add('pottery_dark', lathe([[0.05, 0], [0.13, 0.08], [0.15, 0.18], [0.09, 0.28], [0.1, 0.31], [0.001, 0.31]], 8, null, p[0], p[1], p[2])); }
  }
  // the forked stick, propping the frame (set down)
  if (el.down) part('timber', [0, 0.95, 0.04], [0, 0, -0.62], 0.02);
}

/** ox_load: pine brush piled over an ox on a pack saddle { at, y, rot, h (the height of its back) }, the ox facing −z. */
export function oxLoad(el, { bag }) {
  const [cx, cz] = el.at, y = (el.y ?? 0) + (el.h ?? 1.42), rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), rand = rng(el.seed ?? 5);
  const W = (u, v, w) => [cx + u * c + w * s, y + v, cz - u * s + w * c];
  const part = (mat, a, b, r, n = 5) => bag.add(mat, limb(W(...a), W(...b), r, r, n));
  const blob = (mat, rx, ry, rz, at) => { const p = W(...at); bag.add(mat, T(bushy(ball(rx, ry, rz, 14, 9), 0.12), p[0], p[1], p[2], rot)); };
  // the saddle: a straw pad, two crossed frames over it
  const sd = []; beamTris(sd, W(0, -0.08, -0.15), W(0, -0.08, 0.5), 0.4, 0.1); bag.add('reed_mat', fromTriangles(sd));
  for (const w of [-0.05, 0.4]) { part('timber', [-0.46, -0.3, w], [0, 0.16, w], 0.03); part('timber', [0.46, -0.3, w], [0, 0.16, w], 0.03); }
  // the brush: a great bushy pile hanging each side and heaped on top, twigs bristling, a rope round it
  for (const sx of [-1, 1]) { blob('thatch', 0.3, 0.48, 0.8, [sx * 0.66, -0.3, 0.15]); blob('thatch', 0.22, 0.3, 0.55, [sx * 0.74, -0.62, 0.2]); }
  blob('thatch', 0.62, 0.26, 0.7, [0, 0.24, 0.15]);
  for (let k = 0; k < 16; k++) {
    const sx = rand() < 0.5 ? -1 : 1, v = -0.7 + rand() * 1.0, w = -0.5 + rand() * 1.3, u = sx * (0.7 + rand() * 0.15);
    part('bark_pine', [u * 0.85, v, w], [u * 1.25, v + (rand() - 0.3) * 0.3, w + (rand() - 0.5) * 0.5], 0.012, 4);
  }
  part('rope_fibre', [-0.98, -0.3, 0.15], [0.98, -0.3, 0.15], 0.018);
}

/** balustrade_run: a carved stone balustrade from a to b at height y { a, b, y, open ([from, to] along the run), carve, mat, beasts, step }. */
export function balustradeRun(el, { bag, col }) { balustradeCarved(bag, col, el.a, el.b, el.y, el.open ?? [], el); }

export const GOJONG = { balustrade_run: balustradeRun, nu: nu67, isle_bridge: isleBridge, hyangwonjeong, plank_bridge: plankBridge, ring_bank: ringBank, chimney, terrace_wall: terraceWall, sijeon, bell_pavilion: bellPavilion, jige, ox_load: oxLoad };
