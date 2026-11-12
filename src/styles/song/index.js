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
import { ironSkin, relief, RELIEF_PITCH } from './iron.js';
import '../chinese/index.js';
import { HANGZHOU_ELEMENTS } from './hangzhou.js';
import { SCROLL_ELEMENTS } from './scroll.js';
import { TEMPLE_ELEMENTS } from './temple.js';
import { COURT_ELEMENTS } from './court.js';
import { BRIDGEHEAD_ELEMENTS } from './bridgehead.js';
import { BRIDGE_ELEMENTS } from './bridge.js';
import { RIVERSIDE_ELEMENTS } from './riverside.js';

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
function bracketRow(bag, cx, cz, r, y, arms = 'timber_red', blocks = 'paint_ochre', K = 1) {
  const G = ngon(cx, cz, r), A = [], B = [];
  const set = (px, pz, ux, uz, nx, nz, s) => {
    const Q = (u, n, yy) => [px + (ux * u + nx * n) * K, y + yy * K, pz + (uz * u + nz * n) * K];
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
  prism(bag, arms, ngon(cx, cz, r + 0.12 * K), ngon(cx, cz, r + 0.12 * K), y - 0.45 * K, y + 0.02 * K);
  prism(bag, arms, ngon(cx, cz, r + 1.15 * K), ngon(cx, cz, r + 1.55 * K), y + 0.96 * K, y + 1.22 * K);
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
  if (el.interior && !el.galleries && el.relief) {
    // the Iron Pagoda's base is walkable (a stair comes up on the south): a floor over a cross inside the base's faces, the base's wall low enough to step over at the top
    col.circle(cx, cz, B.r * Math.cos(Math.PI / 8) - 0.4, y, y + B.h - 0.1);
    const q = B.r * 0.82, c2 = B.r * 0.39;
    for (const r4 of [[-q, -c2, q, c2], [-c2, -q, c2, q], [-B.r * 0.62, -B.r * 0.62, B.r * 0.62, B.r * 0.62]]) col.floor([cx + r4[0], cz + r4[1], cx + r4[2], cz + r4[3]], y + B.h);
  } else
  col.circle(cx, cz, B.r * Math.cos(Math.PI / 8) - 0.4, y, y + B.h);   // (inside its faces: a stair can come up onto it)
  y += B.h;
  el.tiers.forEach((t, i) => {
    const last = i === el.tiers.length - 1, r = t.r, h = t.h, gal = el.galleries !== false, g = gal ? r + 2.4 : r + 0.6, coreMat = el.core || 'plaster_white';
    // the core, its doors and windows (doors on the four sides facing the compass, windows on the diagonals)
    const inside = el.interior && gal;
    const ironIn = !!el.interior && !gal && !!el.relief;
    if (inside) interiorStorey(bag, col, el, cx, cz, i, y, coreMat);
    else if (ironIn) ironStorey(bag, col, el, cx, cz, i, y, h, r, coreMat, last);
    else { prism(bag, coreMat, ngon(cx, cz, r), ngon(cx, cz, r), y, y + h); col.circle(cx, cz, r * 0.95, y, y + h); }
    const F = ngon(cx, cz, r + 0.03);
    for (let k = 0; k < 8; k++) {
      const a = F[k], b = F[(k + 1) % 8], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ux = (b[0] - a[0]), uz = (b[1] - a[1]), L = Math.hypot(ux, uz), w = (k % 2 === 0 ? 0.32 : 0.18) * L, hh = k % 2 === 0 ? Math.min(3, h * 0.45) : 1.2, y0 = k % 2 === 0 ? y + 0.4 : y + h * 0.35;
      if (inside && OPEN_FACES.includes(k)) { const fr = []; beamTris(fr, [a[0], y + h - 0.6, a[1]], [b[0], y + h - 0.6, b[1]], 0.08, 0.35); bag.add(el.frame || 'timber_red', fromTriangles(fr)); continue; }
      if (!gal && el.relief) continue;   // the glazed skin makes its own openings and the brackets their architrave
      const tr = []; beamTris(tr, [m[0] - ux / L * w / 2, y0, m[1] - uz / L * w / 2], [m[0] + ux / L * w / 2, y0, m[1] + uz / L * w / 2], 0.05, hh); bag.add('lacquer_black', fromTriangles(tr));
      const fr = []; beamTris(fr, [a[0], y + h - 0.6, a[1]], [b[0], y + h - 0.6, b[1]], 0.08, 0.35); bag.add(el.frame || 'timber_red', fromTriangles(fr));
    }
    if (!gal && el.relief) {
      // the glazed brick skin (iron.js): moulded bricks in rows, the arched openings in their surrounds;
      // engaged columns at the corners; under the eave a row of bracket sets in glazed brick, smaller
      // than a timber pagoda's
      const top = h - 0.68 - 0.45 * 0.7 - 0.04, sk = ironSkin(bag, coreMat, cx, cz, r, y, h, top, i, ironIn ? ironOpenings(i) : null);
      bag.add('lacquer_black', fromTriangles(sk.dark)); bag.add(coreMat, fromTriangles(sk.frame));
      const G = ngon(cx, cz, r);
      for (let k = 0; k < 8; k++) bag.add(coreMat, lathe([[0.17, 0], [0.17, 0.12], [0.14, 0.2], [0.14, top - 0.12], [0.18, top], [0.001, top]], 8, null, G[k][0], y, G[k][1]));
      bracketRow(bag, cx, cz, r, y + h - 0.68, coreMat, coreMat, 0.7);
      prism(bag, coreMat, ngon(cx, cz, r + 0.15), ngon(cx, cz, r + 0.4), y + h, y + h + 0.72);
      octEave(bag, cx, cz, r + 0.3, y + h + 0.7, r + 1.6, y + h - 0.1, 0.35, el.eave || 'tile_dark', coreMat, el.bells || null);
      y += h;
      return;
    }
    if (!gal) {
      prism(bag, coreMat, ngon(cx, cz, r + 0.15), ngon(cx, cz, r + 0.55), y + h - 0.5, y + h + 0.2);
      octEave(bag, cx, cz, r + 0.3, y + h + 0.7, r + 1.6, y + h - 0.1, 0.35, el.eave || 'tile_dark', coreMat, el.bells || null);
      y += h;
      return;
    }
    // the gallery: its floor, posts at the corners, the railing
    if (inside) galleryFloor(bag, col, cx, cz, r, g, y);
    else prism(bag, 'timber', ngon(cx, cz, g), ngon(cx, cz, g), y - 0.35, y);
    const P = ngon(cx, cz, g - 0.35), Rl = ngon(cx, cz, g - 0.15);
    for (let k = 0; k < 8; k++) {
      bag.add('timber_red', lathe([[0.2, 0], [0.18, last ? h + 0.7 : h - 0.55]], 8, null, P[k][0], y, P[k][1]));   // up into the eave's corner, or the gallery floor above
      col.circle(P[k][0], P[k][1], 0.2, y, y + h);
      if (inside && i === 0 && k === 1) continue;   // the way onto the lowest gallery from the base, on the south
      const a = Rl[k], b = Rl[(k + 1) % 8], rt = []; beamTris(rt, [a[0], y + 0.85, a[1]], [b[0], y + 0.85, b[1]], 0.06, 0.12); beamTris(rt, [a[0], y + 0.2, a[1]], [b[0], y + 0.2, b[1]], 0.04, 0.08);
      bag.add('timber_red', fromTriangles(rt));
      col.segment(a, b, 0.15, y, y + 1);
    }
    // below the gallery above: the bracket sets carrying its floor, the eave skirting it with its bells;
    // the top storey's eave runs in to the core under the crowning roof
    if (last) {
      bracketRow(bag, cx, cz, r, y + h - 0.35);
      octEave(bag, cx, cz, r + 0.6, y + h + 1.1, g + 1.5, y + h - 0.2, 0.75, 'tile_dark', 'lacquer_red', el.bells || null);
    } else {
      bracketRow(bag, cx, cz, r, y + h - 1.45);
      octEave(bag, cx, cz, g - 0.85, y + h - 0.38, g + 1.6, y + h - 1.3, 0.6, 'tile_dark', 'lacquer_red', el.bells || null);
    }
    y += h;
  });
  // the crowning roof and the spire
  const rt = el.tiers[el.tiers.length - 1].r, R = el.galleries === false ? rt + 1.8 : rt + 3.6;
  octEave(bag, cx, cz, 0.6, y + (el.galleries === false ? 2.6 : 4.2), R, y + 0.2, 0.8, el.eave || 'tile_dark', el.core && el.galleries === false ? el.core : 'lacquer_red', el.bells || null);
  bag.add('gilt_bronze', lathe([[0.5, 0], [0.5, 0.6], [1.0, 0.8], [0.35, 1.2], [0.8, 1.6], [0.3, 2.0], [0.6, 2.4], [0.2, 2.8], [0.45, 3.1], [0.12, 3.6], [0.001, el.spire ?? 4.8]], 12, null, cx, y + 3.8, cz));
}

// ── the walkable inside of a pagoda (pagoda_oct with interior) ────────────────────────────────────
// The Liuhe Pagoda's brick body is, from the outside in, an outer wall, a corridor, an inner wall and
// the central chamber (docs/settlements/song-hangzhou.md §10). Ours: the corridor and the chamber are a
// shaft of one plan up the whole height (the outer wall thickening downward as the tiers widen), and
// in the corridor a stair climbs each storey: up the east side, a landing in the south-east corner, up
// the south side, arriving in the south-west corner of the storey above. Doors through the outer wall
// open onto the gallery on the three diagonals the stair leaves free (south-west, north-west,
// north-east); the chamber is entered from the north side of the corridor. Faces of ngon(): k = 0 is
// the south-east diagonal, 1 south, 2 south-west, 3 west, 4 north-west, 5 north, 6 north-east, 7 east.
const OPEN_FACES = [2, 4, 6];
const C8 = Math.cos(Math.PI / 8), T8 = Math.tan(Math.PI / 8);
/** The shaft's plan from the top tier: the corridor's outer face (aw), its inner face (ac), the chamber (ai), all apothems. */
function shaft(el) { const rt = el.tiers[el.tiers.length - 1].r * C8, aw = rt - Math.max(1.4, rt * 0.22), ac = aw - 2.0; return { aw, ac, ai: ac - 0.8, sw: aw * T8 }; }
/** An octagonal ring's face k as a solid (inner apothem a0, outer a1, y0…y1), cut between u0 and u1 along the face (from its middle). */
function ringPiece(out, cx, cz, k, a0, a1, y0, y1, u0, u1) {
  const th = (k + 1) * Math.PI / 4, mx = Math.cos(th), mz = Math.sin(th), tx = -mz, tz = mx;
  const Q = (a, u, yy) => [cx + mx * a + tx * u, yy, cz + mz * a + tz * u];
  const l0 = a0 * T8, l1 = a1 * T8;
  const ua0 = Math.max(-l0, u0), ub0 = Math.min(l0, u1), ua1 = Math.max(-l1, u0), ub1 = Math.min(l1, u1);
  hexa(out, [Q(a0, ua0, y0), Q(a0, ub0, y0), Q(a1, ub1, y0), Q(a1, ua1, y0), Q(a0, ua0, y1), Q(a0, ub0, y1), Q(a1, ub1, y1), Q(a1, ua1, y1)]);
  return [Q(a0, ua0, 0), Q(a0, ub0, 0), Q(a1, ub1, 0), Q(a1, ua1, 0)].map((q) => [q[0], q[2]]);
}
/** A wall ring (apothems a0…a1) of one storey with doorways (half-width dw, height dh) on the faces `doors`; its colliders (each piece's own plan). */
function ringWall(out, col, cx, cz, a0, a1, y0, y1, doors, dw, dh) {
  const solid = (poly, ya, yb) => col.obstacles.push({ poly, y0: ya, y1: yb });
  for (let k = 0; k < 8; k++) {
    if (!doors.includes(k)) { solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, 99), y0, y1); continue; }
    solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, -dw), y0, y1); solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, dw, 99), y0, y1);
    solid(ringPiece(out, cx, cz, k, a0, a1, y0 + dh, y1, -dw, dw), y0 + dh, y1);
  }
}
/** A flat slab over a convex polygon (plan points) from y0 to y1. */
function slab(out, pts, y0, y1) {
  const t = [], n = pts.length, P = (q, yy) => [q[0], yy, q[1]];
  for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % n]; t.push(...P(a, y0), ...P(b, y0), ...P(b, y1), ...P(a, y0), ...P(b, y1), ...P(a, y1)); }
  for (let k = 1; k < n - 1; k++) t.push(...P(pts[0], y1), ...P(pts[k], y1), ...P(pts[k + 1], y1), ...P(pts[0], y0), ...P(pts[k + 1], y0), ...P(pts[k], y0));
  out.push(...orientOutward(t));
}
/** The gallery's floor as a ring outside the wall (r…g) and where one walks on it. */
function galleryFloor(bag, col, cx, cz, r, g, y) {
  const t = [];
  for (let k = 0; k < 8; k++) ringPiece(t, cx, cz, k, r * C8 - 0.05, g * C8, y - 0.35, y, -99, 99);
  bag.add('timber', fromTriangles(t));
  const ga = g * C8, gs = ga * T8, a = r * C8 - 0.05;
  for (const r4 of [[-gs, -ga, gs, -a], [-gs, a, gs, ga], [-ga, -gs, -a, gs], [a, -gs, ga, gs], [gs, gs, ga, ga], [-ga, gs, -gs, ga], [-ga, -ga, -gs, -gs], [gs, -ga, ga, -gs]]) col.floor([cx + r4[0], cz + r4[1], cx + r4[2], cz + r4[3]], y);
}
function interiorStorey(bag, col, el, cx, cz, i, y, coreMat) {
  const t = el.tiers[i], h = t.h, last = i === el.tiers.length - 1, { aw, ac, ai, sw } = shaft(el), a = t.r * C8;
  const wall = [], inner = [], floor = [], steps = [], ceil = [];
  // the outer wall with its three doorways, the inner wall with the chamber's door on the north
  ringWall(wall, col, cx, cz, aw, a, y, y + h, OPEN_FACES, 0.8, Math.min(2.9, h * 0.42));
  ringWall(inner, col, cx, cz, ac - 0.8, ac, y, y + h, [5], 0.6, 2.4);
  bag.add(coreMat, fromTriangles(wall)); bag.add('plaster_white', fromTriangles(inner));
  // the sumeru base along the foot of the inner wall where the stair leaves the corridor free (west, the
  // diagonals but the south-east, the north either side of the chamber's door): plinth, mouldings, the
  // waist with its brick-carved panels — flowers, flying figures, beasts — mouldings and the cap
  if (el.images) {
    const sm = [], faces = [[2, -99, 99], [3, -99, 99], [4, -99, 99], [6, -99, 99], [5, -99, -0.72], [5, 0.72, 99]];
    const bands = [[0, 0.12, 0.3], [0.12, 0.22, 0.22], [0.22, 0.66, 0.08], [0.66, 0.76, 0.22], [0.76, 0.9, 0.3]];
    for (const [k, u0, u1] of faces) for (const [b0, b1, o] of bands) ringPiece(sm, cx, cz, k, ac - 0.01, ac + o, y + b0, y + b1, u0, u1);
    bag.add('brick_grey', fromTriangles(sm));
    for (const [k, u0, u1] of faces) {
      const th = (k + 1) * Math.PI / 4, mx = Math.cos(th), mz = Math.sin(th), tx = -mz, tz2 = mx, a = ac + 0.08, half = a * T8;
      const lo = Math.max(-half + 0.12, u0 + 0.06), hi = Math.min(half - 0.12, u1 - 0.06), P = RELIEF_PITCH, n = Math.floor((hi - lo) / P);
      const seq = n >= 6 ? ['flower', 'fly', 'lion', 'fly', 'flower'] : n >= 4 ? ['lion', 'fly', 'lion'] : n >= 2 ? ['fly'] : n >= 1 ? ['flower'] : [];
      const units = seq.reduce((t, q) => t + (q === 'fly' ? 2 : 1), 0);
      let u = (lo + hi) / 2 - units * P / 2;
      for (const q of seq) { const w = q === 'fly' ? 2 : 1, uc = u + w * P / 2; relief(bag, 'plaster_grey', q, cx + mx * a + tx * uc, y + 0.235, cz + mz * a + tz2 * uc, mx, mz); u += w * P; }
      col.obstacles.push({ poly: ringPiece([], cx, cz, k, ac - 0.01, ac + 0.3, y, y + 0.9, u0, u1), y0: y, y1: y + 0.9 });
    }
  }
  // the doorways' frames on the outer face: red jambs, the lintel with its two door-pins (men zan), the threshold
  {
    const fr = [], dh = Math.min(2.9, h * 0.42);
    for (const k of OPEN_FACES) {
      const th = (k + 1) * Math.PI / 4, mx = Math.cos(th), mz = Math.sin(th), tx = -mz, tz = mx;
      const B = (a0, a1, u0, u1, y0, y1) => { const Q = (aa, u, yy) => [cx + mx * aa + tx * u, yy, cz + mz * aa + tz * u]; hexa(fr, [Q(a0, u0, y0), Q(a0, u1, y0), Q(a1, u1, y0), Q(a1, u0, y0), Q(a0, u0, y1), Q(a0, u1, y1), Q(a1, u1, y1), Q(a1, u0, y1)]); };
      for (const sg of [-1, 1]) B(a - 0.25, a + 0.06, sg > 0 ? 0.8 : -1.02, sg > 0 ? 1.02 : -0.8, y, y + dh + 0.24);
      B(a - 0.25, a + 0.08, -1.12, 1.12, y + dh, y + dh + 0.3);
      for (const u of [-0.45, 0.45]) B(a + 0.08, a + 0.16, u - 0.08, u + 0.08, y + dh + 0.07, y + dh + 0.23);
      B(a - 0.3, a + 0.1, -0.8, 0.8, y, y + 0.05);
    }
    bag.add(el.frame && el.frame !== 'tile_iron' ? el.frame : 'timber_red', fromTriangles(fr));
  }
  // the floor of the storey: the north and west sides of the corridor, its three free corners, the chamber, the doorways
  const R = (x0, z0, x1, z1) => [[cx + x0, cz + z0], [cx + x1, cz + z0], [cx + x1, cz + z1], [cx + x0, cz + z1]];
  const fl = [[-sw, -aw, sw, -ai], [-aw, -sw, -ai, sw]];
  for (const q of fl) { slab(floor, R(...q), y - 0.3, y); col.floor([cx + q[0], cz + q[1], cx + q[2], cz + q[3]], y); }
  for (const [sx, sz] of [[1, -1], [-1, -1], [-1, 1]]) {
    slab(floor, [[cx + sx * sw, cz + sz * sw], [cx + sx * aw, cz + sz * sw], [cx + sx * sw, cz + sz * aw]], y - 0.3, y);
    col.floor([cx + Math.min(sx * sw, sx * aw), cz + Math.min(sz * sw, sz * aw), cx + Math.max(sx * sw, sx * aw), cz + Math.max(sz * sw, sz * aw)], y);
    // through the doorway to the gallery
    const d = (aw + a) / 2 / Math.SQRT2;
    col.floor([cx + sx * d - 0.9, cz + sz * d - 0.9, cx + sx * d + 0.9, cz + sz * d + 0.9], y);
    slab(floor, doorSill(cx, cz, sx, sz, aw - 0.02, a + 0.02), y - 0.3, y);
  }
  slab(floor, ngon(cx, cz, ac / C8), y - 0.3, y);
  col.floor([cx - ai, cz - ai, cx + ai, cz + ai], y);
  bag.add('brick_paving', fromTriangles(floor));
  // the stair up to the next storey: treads up the east side, the landing, treads up the south side
  if (!last) {
    const ym = y + h / 2, y1 = y + h, rise = 0.2, n = Math.ceil(h / 2 / rise), run = 2 * sw / n;
    for (let j = 0; j < n; j++) {
      const top = y + (j + 1) * h / 2 / n;
      hexaBox(steps, cx + ai + 0.05, top - h / 2 / n - 0.28, cz - sw + j * run, cx + aw + 0.3, top, cz - sw + (j + 1) * run + 0.001);
      const top2 = ym + (j + 1) * h / 2 / n;
      hexaBox(steps, cx + sw - (j + 1) * run - 0.001, top2 - h / 2 / n - 0.28, cz + ai + 0.05, cx + sw - j * run, top2, cz + aw + 0.3);
    }
    slab(steps, landing(cx, cz, sw, aw), ym - 0.32, ym);
    col.ramp([cx + ai, cz - sw, cx + aw, cz + sw], y, ym, 's');
    col.floor([cx + sw, cz + sw, cx + aw, cz + aw], ym);
    col.ramp([cx - sw, cz + ai, cx + sw, cz + aw], ym, y1, 'w');
    bag.add('granite_block', fromTriangles(steps));
  } else {
    // the top storey's ceiling over the corridor, and the chamber's caisson below it
    slab(ceil, ngon(cx, cz, a / C8 - 0.01), y + h - 0.3, y + h - 0.02);
    bag.add('timber_red', fromTriangles(ceil));
  }
  // the chamber's caisson ceiling (zaojing): an octagon stepping up in two tiers, painted, under the floor above
  {
    const r0 = (ac - 0.8) / C8, yc = y + h - 0.32, cz2 = [];
    const ringT = (ra, rb, y0, y1) => { const tt = []; for (let k = 0; k < 8; k++) ringPiece(tt, cx, cz, k, ra * C8, rb * C8, y0, y1, -99, 99); return tt; };
    bag.add('paint_caihua', fromTriangles(ringT(r0 * 0.72, r0 + 0.01, yc - 0.55, yc - 0.3)));
    bag.add('paint_caihua', fromTriangles(ringT(r0 * 0.45, r0 * 0.74, yc - 0.3, yc - 0.06)));
    slab(cz2, ngon(cx, cz, r0 * 0.47), yc - 0.08, yc);
    bag.add('ceiling_coffer', fromTriangles(cz2));
    // the image: a Buddha seated on a sumeru throne against the south wall, facing the door, his offering
    // table and its bronze censer before him
    const ai2 = ac - 0.8;
    if (el.images) {
      STYLES.chinese.objects.buddha({ at: [cx, cz + ai2 - 0.78], y, h: 1.9, dir: [0, -1], hexSeat: true, robe: 'clay_robe', gilt: 'clay_gilt' }, { bag, col });
      col.circle(cx, cz + ai2 - 0.78, 0.65, y, y + 1.6);
    }
    const tz = el.images ? ai2 - 2.05 : ai2 - 0.75, tb = [], zc = cz + tz + 0.25;
    // the table: a top with everted ends, an apron, four legs; the censer between two candlesticks
    hexaBox(tb, cx - 0.62, y + 0.78, cz + tz, cx + 0.62, y + 0.84, cz + tz + 0.5);
    for (const sx of [-1, 1]) hexaBox(tb, cx + sx * 0.62 - (sx > 0 ? 0.06 : 0), y + 0.84, cz + tz, cx + sx * 0.62 + (sx > 0 ? 0 : 0.06), y + 0.88, cz + tz + 0.5);
    hexaBox(tb, cx - 0.56, y + 0.66, cz + tz + 0.02, cx + 0.56, y + 0.78, cz + tz + 0.06); hexaBox(tb, cx - 0.56, y + 0.66, cz + tz + 0.44, cx + 0.56, y + 0.78, cz + tz + 0.48);
    for (const sx of [-1, 1]) for (const zz of [cz + tz + 0.07, cz + tz + 0.43]) hexaBox(tb, cx + sx * 0.52 - 0.035, y, zz - 0.035, cx + sx * 0.52 + 0.035, y + 0.78, zz + 0.035);
    for (const sx of [-1, 1]) hexaBox(tb, cx + sx * 0.52 - 0.025, y + 0.12, cz + tz + 0.07, cx + sx * 0.52 + 0.025, y + 0.16, cz + tz + 0.43);
    bag.add('lacquer_red', fromTriangles(tb));
    bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.1, 0.04], [0.11, 0.1], [0.085, 0.14], [0.09, 0.16], [0.001, 0.16]], 12, null, cx, y + 0.84, zc));
    for (const sx of [-1, 1]) bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.05, 0.03], [0.015, 0.06], [0.012, 0.26], [0.04, 0.28], [0.04, 0.3], [0.001, 0.3]], 10, null, cx + sx * 0.36, y + 0.84, zc));
    for (const sx of [-1, 1]) bag.add('linen', lathe([[0.016, 0], [0.016, 0.12], [0.001, 0.13]], 8, null, cx + sx * 0.36, y + 1.14, zc));
    col.rect([cx - 0.6, cz + tz, cx + 0.6, cz + tz + 0.5], y, y + 0.82);
  }
}
// ── the walkable inside of the Iron Pagoda (pagoda_oct with interior, relief and no galleries) ────────
// The Iron Pagoda is a solid-cored brick tower with a spiral stair inside its wall, entered by a door on the south [stated: the
// stair; doors on four sides, docs/settlements/song-kaifeng.md §10]. Ours: a round shaft (apothem IRON_A) up the whole height inside
// the thickening wall, a pier in its middle, a stair of wedge treads (0.22 m rise) turning once a storey about the pier — from the
// south door on the ground floor round to the top — with a window through the wall on the west side of every storey (and the
// south door on the ground floor); the treads' walkable surface is overlapping squares, so a step is never more than the rise.
const IRON_A = 1.85, IRON_RISE = 0.22, IRON_PIER = 0.5, IRON_R0 = 0.6, IRON_R1 = 1.8, IRON_TH0 = Math.PI;
/** The openings of the walls of storey i for ironSkin: the faces the skin cuts through (3 = west, and the south door on the ground floor), with the heights. */
function ironOpenings(i) { return i === 0 ? { 1: [0, 2.3, 0.75], 3: [0.9, 2.3, 0.5] } : { 3: [0.9, 2.3, 0.5] }; }
/** A wall ring (apothems a0…a1, y0…y1) with openings { face: [sill, top, half-width] } (heights above y0): its pieces into `out`, and its obstacles (if col). */
function ironRing(out, col, cx, cz, a0, a1, y0, y1, open) {
  const solid = (poly, ya, yb) => col && col.obstacles.push({ poly, y0: ya, y1: yb });
  for (let k = 0; k < 8; k++) {
    const o = open[k];
    if (!o) { solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, 99), y0, y1); continue; }
    const [sill, top, dw] = o;
    solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, -99, -dw), y0, y1); solid(ringPiece(out, cx, cz, k, a0, a1, y0, y1, dw, 99), y0, y1);
    if (sill > 0.01) solid(ringPiece(out, cx, cz, k, a0, a1, y0, y0 + sill, -dw, dw), y0, y0 + sill);
    solid(ringPiece(out, cx, cz, k, a0, a1, y0 + top, y1, -dw, dw), y0 + top, y1);
  }
}
function ironStorey(bag, col, el, cx, cz, i, y, h, r, coreMat, last) {
  const a = r * C8, open = ironOpenings(i), op = {};
  for (const k of Object.keys(open)) op[k] = open[k];
  // the wall: tile outside, a lining of grey brick inside; the pier of the stair
  const wall = [], lin = [];
  ironRing(wall, col, cx, cz, IRON_A, a, y, y + h, op);
  ironRing(lin, null, cx, cz, IRON_A - 0.05, IRON_A, y, y + h, op);
  bag.add(coreMat, fromTriangles(wall)); bag.add('brick_grey', fromTriangles(lin));
  bag.add('brick_grey', lathe([[IRON_PIER + 0.12, 0], [IRON_PIER, 0.15], [IRON_PIER, h - 0.1], [IRON_PIER + 0.1, h]], 12, null, cx, y, cz));
  col.circle(cx, cz, IRON_PIER, y, y + h);
  // the doorway's frame, the window's sill and splay are the skin's; the passage floor on the ground storey (platform → door → shaft)
  const floor = [];
  if (i === 0) {
    slab(floor, ngon(cx, cz, IRON_A / C8 + 0.01), y - 0.3, y); col.floor([cx - 1.3, cz - 1.3, cx + 1.3, cz + 1.3], y);
    col.floor([cx - 0.75, cz + IRON_A - 0.2, cx + 0.75, cz + a + 0.4], y); col.floor([cx - IRON_A + 0.3, cz - IRON_A + 0.3, cx + IRON_A - 0.3, cz + IRON_A - 0.3], y);
    slab(floor, [[cx - 0.75, cz + IRON_A - 0.2], [cx + 0.75, cz + IRON_A - 0.2], [cx + 0.75, cz + a + 0.1], [cx - 0.75, cz + a + 0.1]], y - 0.3, y);
    bag.add('brick_paving', fromTriangles(floor));
    // (the last storey's floor over the shaft's bottom is the platform's; the pier stands on it)
  }
  // the treads: one turn a storey about the pier, from the west; on the last storey they stop two metres under the ceiling
  const n = Math.max(6, Math.round(h / IRON_RISE)), rise = h / n, steps = [];
  const ymax = last ? y + h - 2.15 : y + h + 0.001;
  for (let j = 0; j < n; j++) {
    const top = y + (j + 1) * rise;
    if (top > ymax) break;
    const th0 = IRON_TH0 + (j / n) * Math.PI * 2, th1 = IRON_TH0 + ((j + 1) / n) * Math.PI * 2 + 0.07;
    const P = (rr, th) => [cx + Math.cos(th) * rr, cz + Math.sin(th) * rr];
    slab(steps, [P(IRON_R0, th0), P(IRON_R1, th0), P(IRON_R1, th1), P(IRON_R0, th1)], top - rise - 0.1, top);
    const tm = (th0 + th1) / 2, rm = (IRON_R0 + IRON_R1) / 2, [px, pz] = P(rm, tm);
    col.floor([px - 0.42, pz - 0.42, px + 0.42, pz + 0.42], top);
  }
  bag.add('granite_block', fromTriangles(steps));
  if (last) {
    const cl = []; slab(cl, ngon(cx, cz, (IRON_A + 0.05) / C8), y + h - 0.35, y + h - 0.02); bag.add('timber_red', fromTriangles(cl));
    // under the ceiling, the lamp of the stair's top and the caisson of the shaft
    bag.add('lacquer_red', lathe([[0.001, 0], [0.2, 0.05], [0.28, 0.3], [0.2, 0.55], [0.001, 0.6]], 8, null, cx, y + h - 1.0, cz));
  }
}
/** The plan of the sill through a diagonal doorway (the outer wall's thickness, the door's width). */
function doorSill(cx, cz, sx, sz, a0, a1) {
  const mx = sx / Math.SQRT2, mz = sz / Math.SQRT2, tx = -mz, tz = mx, Q = (a, u) => [cx + mx * a + tx * u, cz + mz * a + tz * u];
  return [Q(a0, -0.8), Q(a0, 0.8), Q(a1, 0.8), Q(a1, -0.8)];
}
/** The landing in the south-east corner of the corridor: the corner's wedge. */
function landing(cx, cz, sw, aw) { const e = aw + 0.3, d = Math.SQRT2 * e - e; return [[cx + sw, cz + sw], [cx + e, cz + sw], [cx + e, cz + d], [cx + d, cz + e], [cx + sw, cz + e]]; }
function hexaBox(out, x0, y0, z0, x1, y1, z1) { hexa(out, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]); }

registerStyle('song', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, pagoda_oct: pagodaOct, ...KAIFENG_ELEMENTS, ...WUTAI_ELEMENTS, ...HANGZHOU_ELEMENTS, ...SCROLL_ELEMENTS, ...TEMPLE_ELEMENTS, ...COURT_ELEMENTS, ...BRIDGEHEAD_ELEMENTS, ...BRIDGE_ELEMENTS, ...RIVERSIDE_ELEMENTS },
  objects: {},
});
