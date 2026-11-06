// Sudano-Sahelian architecture of Djenné (docs/settlements/djenne.md §4–§5): walls of sun-dried
// mudbrick under banco plaster, thick and battered, ribbed with pilasters that rise above the roof
// as conical pinnacles; bundles of palm-wood sticks (toron) standing out of the walls as scaffolding
// for the yearly replastering; flat roofs on palm beams, drained by clay spouts; the Great Mosque on
// its high platform with three towers on its qibla wall; town houses of two storeys with a
// buttressed facade round the door (the "Tukulor" front), roof terraces behind parapets.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const B = 'banco_rough';      // hand-smeared at each year's crépissage: lumpy, runnelled
/** A square, tapering mass (flat faces): half-width r0 at y0 to r1 at y1, a cone of height cap on top. */
function taper(bag, x, z, y0, y1, r0, r1, cap = 0) {
  bag.add(B, frustum([x - r0, z - r0, x + r0, z + r0], y0, y1, r0 - r1, r0 - r1, r0 - r1, r0 - r1));
  if (cap > 0) bag.add(B, lathe([[r1 * 1.05, 0], [r1 * 0.6, cap * 0.6], [0.05, cap]], 8, null, x, y1, z));
}

/** Flip each triangle so that it faces along want(centroid). */
export function orientBy(tris, want) {
  for (let i = 0; i < tris.length; i += 9) {
    const a = [tris[i], tris[i + 1], tris[i + 2]], b = [tris[i + 3], tris[i + 4], tris[i + 5]], c = [tris[i + 6], tris[i + 7], tris[i + 8]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const w = want([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]);
    if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
  }
  return tris;
}
/**
 * The solid over a pointed arch between zA and zB in a wall at x (half-thickness t): from the arch
 * (springing at ys, two arcs of radius 0.75 × the span) up to yT; its faces and the soffit.
 */
export function pointedSpandrel(out, x, t, zA, zB, ys, yT, alongX = false, kR = 0.75) {
  const span = zB - zA, R = span * kR, N = 10, P = [];
  for (let k = 0; k <= N; k++) {
    const z = zA + span * k / N, c = z <= zA + span / 2 ? zA + R : zB - R;
    P.push([z, Math.min(yT - 0.05, ys + Math.sqrt(Math.max(0, R * R - (z - c) * (z - c))))]);
  }
  const V = (sx, z, y) => (alongX ? [z, y, x + sx * t] : [x + sx * t, y, z]), loc = [];
  const q = (a, b, c, d) => loc.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let k = 0; k < N; k++) {
    const [za, ya] = P[k], [zb, yb] = P[k + 1];
    for (const sx of [-1, 1]) q(V(sx, za, ya), V(sx, zb, yb), V(sx, zb, yT), V(sx, za, yT));
    q(V(-1, za, ya), V(1, za, ya), V(1, zb, yb), V(-1, zb, yb));
  }
  const mid = zA + span / 2;
  out.push(...orientBy(loc, (p) => {
    const across = alongX ? p[2] - x : p[0] - x, along = alongX ? p[0] : p[2];
    if (Math.abs(Math.abs(across) - t) < 1e-4) return alongX ? [0, 0, Math.sign(across)] : [Math.sign(across), 0, 0];
    return alongX ? [-(along - mid) * 0.3, -1, 0] : [0, -1, -(along - mid) * 0.3];
  }));
}
/** A half-pipe spout (the open trough upward) from p along the horizontal unit d, length L, radius r: inner and outer faces. */
function halfPipe(p, d, L, r) {
  const N = 6, ex = [-d[2], 0, d[0]], loc = [], th = 0.025;
  const P = (s, a, rr) => [p[0] + d[0] * s + ex[0] * Math.cos(a) * rr, p[1] - Math.sin(a) * rr - s * 0.06, p[2] + d[2] * s + ex[2] * Math.cos(a) * rr];
  const q = (a, b, c, e) => loc.push(...a, ...b, ...c, ...a, ...c, ...e);
  for (let k = 0; k < N; k++) {
    const a0 = Math.PI * k / N, a1 = Math.PI * (k + 1) / N;
    for (const rr of [r, r + th]) q(P(0, a0, rr), P(L, a0, rr), P(L, a1, rr), P(0, a1, rr));
    q(P(L, a0, r), P(L, a0, r + th), P(L, a1, r + th), P(L, a1, r));
  }
  for (const a of [0, Math.PI]) q(P(0, a, r), P(L, a, r), P(L, a, r + th), P(0, a, r + th));
  return orientBy(loc, (c) => {
    const s = (c[0] - p[0]) * d[0] + (c[2] - p[2]) * d[2];
    if (s > L - 0.01) return d;
    const ax = [p[0] + d[0] * s, p[1] - s * 0.06, p[2] + d[2] * s], v = [c[0] - ax[0], c[1] - ax[1], c[2] - ax[2]], rr = Math.hypot(...v);
    if (rr < 1e-6 || Math.abs(c[1] - ax[1]) < 1e-3) return [0, 1, 0];
    return rr > r + th / 2 ? v : v.map((x) => -x);
  });
}

/** A wall of banco from a to b { h, th, batter }: a slab leaning in a little, pilasters every `step` m rising above it as pinnacles, rows of toron. */
function bancoWall(bag, col, a, b, y, h, th, opts = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.2) return;
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, out = opts.out ?? 1;
  const t = [];
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h);
  bag.add(B, fromTriangles(t));
  col.segment(a, b, th, y, y + h);
  const step = opts.step ?? 3.2, n = Math.max(1, Math.round(L / step)), pw = opts.pw ?? 0.7, pd = opts.pd ?? 0.55, ph = opts.ph ?? 1.4;
  const rand = rng(opts.seed || 3);
  for (let k = 0; k <= n; k++) {
    const s = k * L / n, x = a[0] + ux * s + nx * (th / 2 + pd / 2) * out, z = a[1] + uz * s + nz * (th / 2 + pd / 2) * out;
    // the pilaster, battered: wider at its foot
    taper(bag, x, z, y, y + h, pw * 0.8, pw * 0.6, ph);
    // toron: palm sticks standing out in rows
    if (opts.toron !== false) {
      const tt = [];
      for (let r = 1; r <= Math.floor(h / 1.5); r++) for (const f of [0.25, 0.5, 0.75]) {
        if (rand() < 0.15 || s + step * f > L) continue;
        const ty = y + r * 1.5 - 0.35 + (rand() - 0.5) * 0.12, tx = a[0] + ux * (s + step * f) + nx * (th / 2) * out, tz = a[1] + uz * (s + step * f) + nz * (th / 2) * out, len = 0.75 + rand() * 0.35;
        beamTris(tt, [tx, ty, tz], [tx + nx * len * out, ty + 0.03, tz + nz * len * out], 0.06, 0.1);
      }
      if (tt.length) bag.add('timber', fromTriangles(tt));
    }
  }
}

/**
 * great_mosque: the Great Mosque { c, a (half the platform), py (platform height) }: the platform
 * with its stairs; the prayer hall on the east half (its roof on rows of thick pillars, vents), the
 * court on the west half within high walls; the qibla wall with three square towers crowned with
 * pinnacles and ostrich eggs; entrance towers on the north wall.
 */
function greatMosque(el, { bag, col }) {
  const [cx, cz] = el.c, A = el.a, py = el.py ?? 3;
  bag.add('banco_smooth', box(cx - A, -0.4, cz - A, cx + A, py, cz + A));
  col.floor([cx - A, cz - A, cx + A, cz + A], py);
  col.rect([cx - A, cz - A, cx + A, cz + A], -0.4, py - 0.31);
  for (const [r, dir] of [[[cx - 6, cz + A, cx + 6, cz + A + 5], 'n'], [[cx - 6, cz - A - 5, cx + 6, cz - A], 's'], [[cx - A - 5, cz - 5, cx - A, cz + 5], 'e']]) STYLES.qing.elements.stairs({ rect: r, y0: 0, y1: py, dir, mat: 'banco_smooth' }, { bag, col });
  // the walls: the hall (east part) and the court (west part)
  const x0 = cx - A + 4, x1 = cx + A - 4, z0 = cz - A + 8, z1 = cz + A - 8, xm = cx + 2, H = 10;
  const w = (a, b, opts = {}) => bancoWall(bag, col, a, b, py, opts.h ?? H, 0.9, { step: 3, ph: 2.2, ...opts });
  w([x1, z0], [x1, z1], { out: -1, h: 11 });                             // the qibla wall (east), pilasters outside
  w([x0, z0], [x1, z0], { out: -1 }); w([x1, z1], [x0, z1], { out: -1 });
  w([x0, z1], [x0, (z0 + z1) / 2 + 3], { out: -1, h: 7 }); w([x0, (z0 + z1) / 2 - 3], [x0, z0], { out: -1, h: 7 });
  w([xm, z0 + 1], [xm, z1 - 1], { out: 1, h: 9, toron: false });          // the hall's west wall on the court
  // the hall's roof on nine arcaded walls running north–south (docs/settlements/djenne.md §2): each
  // a row of massive piers joined by tall pointed arches, ninety piers in all; the flat roof of palm
  // beams and banco over them, its vents capped with inverted fired bowls
  const ys = py + 4.6, yT = py + 9.6;
  for (let i = 0; i < 9; i++) {
    const x = xm + (x1 - xm) * (i + 0.5) / 9, t = 0.55, piers = [];
    for (let j = 0; j <= 10; j++) piers.push(z0 + (z1 - z0) * j / 10);
    for (const [j, z] of piers.entries()) {
      const hz = j === 0 || j === 10 ? 0.7 : 0.8;
      bag.add('banco_smooth', box(x - t, py, z - hz, x + t, yT, z + hz));
      col.rect([x - t, z - hz, x + t, z + hz], py, yT);
    }
    const tris = [];
    for (let j = 0; j < 10; j++) pointedSpandrel(tris, x, t, piers[j] + (j === 0 ? 0.7 : 0.8), piers[j + 1] - (j === 9 ? 0.7 : 0.8), ys, yT);
    bag.add('banco_smooth', fromTriangles(tris));
  }
  bag.add('timber', box(xm, py + 9.6, z0, x1, py + 9.9, z1));
  bag.add('banco_smooth', box(xm - 0.5, py + 9.9, z0 - 0.5, x1 + 0.5, py + 10.5, z1 + 0.5));
  col.floor([xm, z0, x1, z1], py + 10.5);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
    const x = xm + (x1 - xm) * (i + 1) / 5, z = z0 + (z1 - z0) * (j + 1) / 7;
    bag.add('banco_smooth', lathe([[0.4, -0.05], [0.4, 0.22], [0.34, 0.26], [0.001, 0.26]], 10, null, x, py + 10.5, z));      // the vent's collar
    bag.add('terracotta', lathe([[0.001, 0.25], [0.44, 0.25], [0.44, 0.31], [0.4, 0.42], [0.3, 0.52], [0.16, 0.57], [0.001, 0.58]], 12, null, x, py + 10.5, z));   // the inverted bowl
  }
  // ceramic half-pipes along the roof's edge, throwing the rain clear of the north and south walls (between the pilasters)
  { const L = x1 - x0, n = Math.max(1, Math.round(L / 3));
    for (let k = 0; k < n; k += 2) {
      const x = x0 + (k + 0.5) * L / n, hall = x > xm + 0.8;
      for (const [zz, sg] of [[z0 - (hall ? 0.5 : 0.45), -1], [z1 + (hall ? 0.5 : 0.45), 1]]) bag.add('terracotta', fromTriangles(halfPipe([x, hall ? py + 10.02 : py + H - 0.45, zz], [0, 0, sg], 1.0, 0.11)));
    } }
  // the three towers on the qibla wall, rising 16 m above the platform with their pinnacles
  for (const [zz, s] of [[cz, 1.2], [cz - 13, 1], [cz + 13, 1]]) {
    const tw = 3.2 * s, th = 16 * s;
    taper(bag, x1 + 1.6, zz, py, py + th, tw * 1.2, tw);
    bag.add('banco_smooth', box(x1 + 1.6 - tw - 0.15, py + th - 0.4, zz - tw - 0.15, x1 + 1.6 + tw + 0.15, py + th, zz + tw + 0.15));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
      const px = x1 + 1.6 + dx * tw * 0.75, pz = zz + dz * tw * 0.75, ph = dx || dz ? 3 : 4.5;
      bag.add(B, lathe([[0.55, 0], [0.4, ph * 0.7], [0.08, ph]], 8, null, px, py + th, pz));
      bag.add('tura_limestone', lathe([[0.001, 0], [0.18, 0.12], [0.2, 0.28], [0.001, 0.48]], 8, null, px, py + th + ph, pz));     // the ostrich egg
    }
    // engaged ribs on the three outer faces, battered with the face, rising through the cornice as pinnacles
    const tx = x1 + 1.6, fA = tw * 1.2, yR = py + th + 0.05, fB = tw * (1.2 - 0.2 * (yR - py) / th), dF = fA - fB;
    for (const k of [-0.33, 0.33]) {
      const sh = k * (fB - fA);
      bag.add(B, frustum([tx + fA - 0.05, zz + k * fA - 0.3, tx + fA + 0.32, zz + k * fA + 0.3], py, yR, -dF, dF + 0.08, sh + 0.06, -sh + 0.06));
      bag.add(B, lathe([[0.26, 0], [0.18, 1.1], [0.04, 1.6]], 8, null, tx + fB + 0.1, yR, zz + k * fB));
      for (const sz of [-1, 1]) {
        const r0 = sz < 0 ? [tx + k * fA - 0.3, zz - fA - 0.32, tx + k * fA + 0.3, zz - fA + 0.05] : [tx + k * fA - 0.3, zz + fA - 0.05, tx + k * fA + 0.3, zz + fA + 0.32];
        bag.add(B, frustum(r0, py, yR, sh + 0.06, -sh + 0.06, sz < 0 ? dF + 0.08 : -dF, sz < 0 ? -dF : dF + 0.08));
        bag.add(B, lathe([[0.26, 0], [0.18, 1.1], [0.04, 1.6]], 8, null, tx + k * fB, yR, zz + sz * (fB + 0.1)));
      }
    }
    // toron on the tower's three outer faces, following the batter
    const tt = [];
    for (let r = 1; r < Math.floor(th / 1.6); r++) {
      const yy = py + r * 1.6, f = tw * (1.2 - 0.2 * (yy - py) / th);
      for (const k of [-0.66, 0, 0.66]) {
        beamTris(tt, [tx + f - 0.05, yy, zz + k * f], [tx + f + 0.85, yy + 0.03, zz + k * f], 0.06, 0.1);
        for (const sz of [-1, 1]) beamTris(tt, [tx + k * f, yy, zz + sz * (f - 0.05)], [tx + k * f, yy + 0.03, zz + sz * (f + 0.85)], 0.06, 0.1);
      }
    }
    bag.add('timber', fromTriangles(tt));
    col.rect([x1 + 1.6 - tw * 1.2, zz - tw * 1.2, x1 + 1.6 + tw * 1.2, zz + tw * 1.2], py, py + th);
  }
  // the north entrance towers
  for (const xx of [cx - 10, cx + 12]) {
    taper(bag, xx, z1 + 1, py, py + 13, 2.4, 2, 1.6);
  }
}

/**
 * sahel_house: a town house { rect, front ('n'|'s'|'e'|'w'), storeys, seed }: banco walls, a flat
 * roof with a parapet, on the street side the facade: pilasters up to pinnacles framing the door,
 * a canopy over it, a small window above; a court behind with a lower room.
 */
function sahelHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, st = el.storeys ?? (rand() < 0.65 ? 2 : 1), H = st * 3.1, th = 0.5;
  bag.add(B, box(x0, 0, z0, x1, H, z1));
  bag.add('banco_smooth', box(x0 - 0.1, H, z0 - 0.1, x1 + 0.1, H + 0.15, z1 + 0.1));
  // the parapet round the roof terrace
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.18, 0.9); bag.add(B, fromTriangles(t)); }
  col.rect([x0, z0, x1, z1], 0, H);
  col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], H + 0.15);
  // the facade
  const f = el.front || 's';
  const [a, b] = f === 's' ? [[x0, z1], [x1, z1]] : f === 'n' ? [[x1, z0], [x0, z0]] : f === 'e' ? [[x1, z1], [x1, z0]] : [[x0, z0], [x0, z1]];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux;   // n: outward
  const mid = L / 2;
  // pilasters: two framing the door, two at the corners, rising above the parapet as pinnacles
  for (const s of [0.25, mid - 1.2, mid + 1.2, L - 0.25]) {
    const px = a[0] + ux * s + nx * 0.25, pz = a[1] + uz * s + nz * 0.25, ph = H + (s === mid - 1.2 || s === mid + 1.2 ? 2.4 : 1.4);
    taper(bag, px, pz, 0, ph * 0.85, 0.45, 0.32, ph * 0.15);
  }
  // the door, the canopy over it, the window above
  const dx = a[0] + ux * mid + nx * 0.02, dz = a[1] + uz * mid + nz * 0.02;
  bag.add('timber', box(dx - Math.abs(ux) * 0.7 - Math.abs(nx) * 0.05, 0, dz - Math.abs(uz) * 0.7 - Math.abs(nz) * 0.05, dx + Math.abs(ux) * 0.7 + Math.abs(nx) * 0.05, 2.2, dz + Math.abs(uz) * 0.7 + Math.abs(nz) * 0.05));
  bag.add('banco_smooth', box(dx - Math.abs(ux) * 1.3 + Math.min(0, nx), 2.5, dz - Math.abs(uz) * 1.3 + Math.min(0, nz), dx + Math.abs(ux) * 1.3 + Math.max(0, nx), 2.75, dz + Math.abs(uz) * 1.3 + Math.max(0, nz)));
  if (st > 1) bag.add('lacquer_black', box(dx - Math.abs(ux) * 0.4 - Math.abs(nx) * 0.04, 4.1, dz - Math.abs(uz) * 0.4 - Math.abs(nz) * 0.04, dx + Math.abs(ux) * 0.4 + Math.abs(nx) * 0.04, 4.9, dz + Math.abs(uz) * 0.4 + Math.abs(nz) * 0.04));
  // toron in a row high on the facade, clay spouts from the roof
  for (let k = 1; k < 4; k++) {
    const tx = a[0] + ux * L * k / 4, tz = a[1] + uz * L * k / 4, t = [];
    beamTris(t, [tx, H - 0.6, tz], [tx + nx * 0.6, H - 0.6, tz + nz * 0.6], 0.05, 0.08);
    bag.add('timber', fromTriangles(t));
  }
  const t2 = [], sx = a[0] + ux * L * 0.8, sz = a[1] + uz * L * 0.8;
  beamTris(t2, [sx, H + 0.1, sz], [sx + nx * 0.9, H + 0.05, sz + nz * 0.9], 0.1, 0.14);
  bag.add('banco_smooth', fromTriangles(t2));
}

/** sahel_wall: a plain banco wall (courts, the market) { a, b, h }. */
function sahelWall(el, { bag, col }) { bancoWall(bag, col, el.a, el.b, el.y ?? 0, el.h ?? 2.6, 0.45, { step: 4, ph: 0.6, toron: false, pw: 0.4, pd: 0.3 }); }

/** market_stall: a stall of the market { c, s }: four poles and a sagging mat roof, a low table of
 * sticks with its mat, goods laid out on it — calabashes, pots, baskets, heaps of grain and kola —
 * and sacks and jars on the ground beside it. */
function marketStall(el, { bag }) {
  const [x, z] = el.c, s = el.s ?? 1.6, rand = rng(Math.floor((x * 73 + z * 31) * 10) >>> 0);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const lean = (rand() - 0.5) * 0.08;
    bag.add('timber', lathe([[0.06, 0], [0.05, 2.25]], 6, null, x + dx * s + lean, 0, z + dz * s));
  }
  for (const dz of [-1, 1]) bag.add('timber', box(x - s - 0.1, 2.2, z + dz * s - 0.04, x + s + 0.1, 2.28, z + dz * s + 0.04));
  // the mat roof, sagging a little in the middle
  const roof = [], N = 6, R = s + 0.35, Y = (u, v) => 2.3 - 0.12 * (1 - u * u) * (1 - v * v);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const u0 = -1 + 2 * i / N, u1 = -1 + 2 * (i + 1) / N, v0 = -1 + 2 * j / N, v1 = -1 + 2 * (j + 1) / N;
    const P = (u, v) => [x + u * R, Y(u, v), z + v * R];
    roof.push(...P(u0, v0), ...P(u0, v1), ...P(u1, v1), ...P(u0, v0), ...P(u1, v1), ...P(u1, v0));
    roof.push(...P(u0, v0), ...P(u1, v1), ...P(u0, v1), ...P(u0, v0), ...P(u1, v0), ...P(u1, v1));
  }
  bag.add('reed_mat', fromTriangles(roof));
  // the table: a top of sticks on four legs, a mat on it
  const tw = s * 0.8, td = s * 0.5, ty = 0.55;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(x + dx * (tw - 0.08) - 0.04, 0, z + dz * (td - 0.08) - 0.04, x + dx * (tw - 0.08) + 0.04, ty, z + dz * (td - 0.08) + 0.04));
  bag.add('timber', box(x - tw, ty, z - td, x + tw, ty + 0.06, z + td));
  bag.add(['reed_mat', 'cloth_indigo', 'cloth_ochre', 'sacking'][Math.floor(rand() * 4)], box(x - tw + 0.05, ty + 0.06, z - td + 0.05, x + tw - 0.05, ty + 0.075, z + td - 0.05));
  const top = ty + 0.075;
  for (let i = 0; i < 6; i++) {
    const gx = x - tw + 0.3 + (i % 3) * (tw * 2 - 0.6) / 2, gz = z + (i < 3 ? -td * 0.45 : td * 0.45), k = rand();
    if (k < 0.3) bag.add('hide_tan', lathe([[0.001, 0], [0.18, 0.04], [0.24, 0.13], [0.22, 0.14], [0.001, 0.05]], 10, null, gx, top, gz));                  // a calabash bowl
    else if (k < 0.55) bag.add(rand() < 0.5 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.15], [0.1, 0.3], [0.08, 0.34], [0.001, 0.34]], 10, null, gx, top, gz));
    else if (k < 0.8) { bag.add('wicker', lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.14], [0.22, 0.14], [0.001, 0.04]], 10, null, gx, top, gz)); bag.add(['cloth_ochre', 'terracotta', 'cloth_green'][Math.floor(rand() * 3)], lathe([[0.2, 0], [0.12, 0.08], [0.001, 0.12]], 8, null, gx, top + 0.1, gz)); }
    else bag.add(['cloth_ochre', 'sacking', 'hide_tan'][Math.floor(rand() * 3)], lathe([[0.22, 0], [0.14, 0.1], [0.001, 0.16]], 10, null, gx, top, gz));         // a heap of grain or kola
  }
  // beside the table: sacks and a water jar
  for (let i = 0; i < 2; i++) bag.add('sacking', lathe([[0.2, 0], [0.24, 0.25], [0.2, 0.45], [0.06, 0.52], [0.001, 0.52]], 8, null, x + tw + 0.3, 0, z - td + 0.3 + i * 0.5));
  bag.add('terracotta', lathe([[0.001, 0], [0.2, 0.05], [0.3, 0.3], [0.2, 0.55], [0.12, 0.6], [0.14, 0.66], [0.001, 0.62]], 10, null, x - tw - 0.35, 0, z + td * 0.4));
}

registerStyle('sahel', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_mosque: greatMosque, sahel_house: sahelHouse, sahel_wall: sahelWall, market_stall: marketStall },
  objects: {},
});
