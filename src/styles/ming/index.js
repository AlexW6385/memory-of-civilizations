// Ming Jiangnan architecture (Suzhou, 16th century): the vocabulary of the scholars' gardens and
// the canal town (docs/settlements/ming-suzhou.md §4–§5). Slender round columns lacquered chestnut
// on drum-shaped stone bases; walls of white lime plaster; latticed doors and windows over paper;
// light roofs of small black tiles on a strongly concave profile, their corners swept high
// (fa qiang); ridges ending in curls; pavilions of four, six or eight posts with a bench rail;
// covered galleries winding on posts; garden walls with tiled copings, moon gates and latticed
// "leaky windows"; stone slab bridges zigzagging over the pond, arched bridges over the canals;
// Taihu rock along the shores and piled into hills; canal houses of one or two storeys on granite
// plinths; boats with bamboo-mat awnings.

import { BufferGeometry, Float32BufferAttribute, Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum, orientOutward } from '../../core/geom.js';

// The materials of the vocabulary; an element may change them (el.pal), e.g. the palace halls of
// Beijing: red columns, yellow glazed tiles, white marble (src/styles/qing/).
export const DEFAULT_PAL = { wood: 'lacquer_chestnut', column: 'lacquer_chestnut', soffit: 'lacquer_chestnut', base: 'granite_block', floor: 'bluestone', lattice: 'lattice', leaky: 'lattice_ice', plaster: 'plaster_white', plinth: 'plaster_grey', roof: 'tile_dark' };
let PAL = DEFAULT_PAL, LOW = false;           // LOW: fewer segments (houses of the town, seen in hundreds)
/** Wrap an element builder so that it uses the element's materials (el.pal) over the defaults. */
export const withPal = (fn) => (el, ctx) => { const prev = PAL, low = LOW; PAL = el.pal ? { ...DEFAULT_PAL, ...el.pal } : DEFAULT_PAL; LOW = low || !!el.simple; try { fn(el, ctx); } finally { PAL = prev; LOW = low; } };

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** A quad strip surface from a grid of points P[i][j] (each [x, y, z]); both sides when twoSided. */
function sheet(P, flip = false, skip = null) {
  const tris = [];
  for (let i = 0; i + 1 < P.length; i++) for (let j = 0; j + 1 < P[i].length; j++) {
    if (skip && skip(i, j)) continue;
    const a = P[i][j], b = P[i + 1][j], c = P[i + 1][j + 1], d = P[i][j + 1];
    if (flip) tris.push(...a, ...c, ...b, ...a, ...d, ...c); else tris.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
  return fromTriangles(tris);
}

/** Point on a polyline loop at fraction a of edge k. */
const lerp2 = (p, q, a) => [p[0] + (q[0] - p[0]) * a, p[1] + (q[1] - p[1]) * a];

/**
 * A roof over a polygon (convex, counter-clockwise from above in plan) drawn as rings from the
 * eave edge (t = 0) to the top (t = 1): h(t) = y + rise · t^p (concave, flat at the eaves, steep
 * near the top), the corners swept up by `sweep` metres. kind 'pyramid' meets at an apex;
 * kind 'hip' / 'xieshan' / 'gable' are for rectangles (see rectRoof).
 */
function pyramidRoof(poly, y, rise, sweep, bag, mat, soffit, p = 1.7) {
  const n = poly.length, cx = poly.reduce((s, q) => s + q[0], 0) / n, cz = poly.reduce((s, q) => s + q[1], 0) / n;
  const NA = 10, NT = 12, top = [], under = [], edge = [];
  for (let k = 0; k < n; k++) {
    const A = poly[k], B = poly[(k + 1) % n], P = [], U = [];
    for (let i = 0; i <= NA; i++) {
      const a = i / NA, e = lerp2(A, B, a), row = [], urow = [];
      const corner = Math.pow(Math.abs(a - 0.5) * 2, 3);
      for (let j = 0; j <= NT; j++) {
        const t = j / NT, x = e[0] + (cx - e[0]) * t, z = e[1] + (cz - e[1]) * t;
        const h = y + rise * Math.pow(t, p) + sweep * corner * Math.pow(1 - t, 2.2);
        row.push([x, h, z]); urow.push([x, h - 0.14, z]);
      }
      P.push(row); U.push(urow);
    }
    top.push(sheet(P, true)); under.push(sheet(U));
    for (let i = 0; i < NA; i++) {
      const a = P[i][0], b = P[i + 1][0];
      edge.push(...a, ...b, b[0], b[1] - 0.18, b[2], ...a, b[0], b[1] - 0.18, b[2], a[0], a[1] - 0.18, a[2]);
    }
  }
  for (const g of top) bag.add(mat, g);
  for (const g of under) bag.add(soffit, g);
  bag.add(soffit, fromTriangles(edge.concat(flipTris(edge))));
  // the finial (bao ding) and the hip ridges
  const apex = y + rise;
  bag.add(mat, lathe([[0.32, 0], [0.34, 0.12], [0.2, 0.22], [0.26, 0.42], [0.12, 0.62], [0.05, 0.85], [0.001, 0.92]], 10, null, cx, apex - 0.12, cz));
  const ridge = [];
  for (let k = 0; k < n; k++) {
    const V = poly[k];
    for (let j = 0; j < NT; j++) {
      const t0 = j / NT, t1 = (j + 1) / NT;
      const p0 = [V[0] + (cx - V[0]) * t0, y + rise * Math.pow(t0, p) + sweep * Math.pow(1 - t0, 2.2), V[1] + (cz - V[1]) * t0];
      const p1 = [V[0] + (cx - V[0]) * t1, y + rise * Math.pow(t1, p) + sweep * Math.pow(1 - t1, 2.2), V[1] + (cz - V[1]) * t1];
      beamTris(ridge, p0, p1, 0.11, 0.16);
    }
  }
  bag.add(mat, fromTriangles(ridge));
}
function flipTris(t) { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; }
/** A square-section beam from p0 to p1 (half-width w, height h above the line). */
function beamTris(out, p0, p1, w, h) {
  const dx = p1[0] - p0[0], dz = p1[2] - p0[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * w, nz = dx / l * w;
  const b = [[p0[0] - nx, p0[1], p0[2] - nz], [p0[0] + nx, p0[1], p0[2] + nz], [p1[0] + nx, p1[1], p1[2] + nz], [p1[0] - nx, p1[1], p1[2] - nz]];
  const t = b.map((q) => [q[0], q[1] + h, q[2]]);
  // the six faces, each turned to face out of the (convex) beam
  const loc = [], q = (a, bb, c, d) => loc.push(...a, ...bb, ...c, ...a, ...c, ...d);
  q(t[0], t[3], t[2], t[1]); q(b[0], t[0], t[1], b[1]); q(b[2], t[2], t[3], b[3]); q(b[1], t[1], t[2], b[2]); q(b[3], t[3], t[0], b[0]); q(b[0], b[1], b[2], b[3]);
  for (const v of orientOutward(loc)) out.push(v);
}

/**
 * A roof over a rectangle { c [x, z], A (half-length along x), B (half-depth), y (eave), rise,
 * kind ('hip', 'xieshan' hip-and-gable, 'gable'), sweep, alongZ }. Rings from the eave to the
 * ridge; the xieshan's hips rise only to `gableAt` of the height, the triangle above them closed
 * by a plastered gable board set back from the eave. hole [x0, z0, x1, z1]: the part of the roof
 * inside it is left out (a skirt round the storey above, which stands in the hole), and so are the
 * ridge and the hips' stretches inside it.
 */
function rectRoof(el, bag) {
  const [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, R = el.rise, sw = el.sweep ?? 0.9, kind = el.kind || 'xieshan';
  const mat = el.mat || PAL.roof, soffit = el.soffit || PAL.soffit, p = el.p ?? 1.7, gAt = el.gableAt ?? 0.42;
  const L = kind === 'gable' ? A : A - B;                 // half-length of the ridge
  const NX = LOW ? Math.max(4, Math.round(A * 0.8)) : Math.max(8, Math.round(A * 2)), NZ = LOW ? 6 : 12;
  const out = [], under = [];
  const rot = (x, z) => (el.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const P = (x, z, off = 0) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz);
    const ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = kind === 'gable' ? 9 : Math.max(0, (A - ax) / B);
    if (kind === 'xieshan' && te > gAt) te = 9;
    const t = Math.min(ts, te);
    const corner = kind === 'gable' ? 0 : Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    const h = y + R * Math.pow(t, p) + sw * corner * corner + off;
    const [rx, rz] = rot(x, z);
    return [rx, h, rz];
  };
  // the roof surface as a grid over the rectangle, finer near the gable line of a xieshan
  const xs = [], zs = [];
  for (let i = 0; i <= NX; i++) xs.push(cx - A + 2 * A * i / NX);
  if (kind === 'xieshan') { const xg = A - gAt * B; xs.push(cx - xg - 0.02, cx - xg + 0.02, cx + xg - 0.02, cx + xg + 0.02); }
  xs.sort((a, b) => a - b);
  for (let j = 0; j <= NZ; j++) zs.push(cz - B + 2 * B * j / NZ);
  let hole = null;
  if (el.hole) {
    const inv = (wx, wz) => (el.alongZ ? [cx + (wz - cz), cz - (wx - cx)] : [wx, wz]);
    const a = inv(el.hole[0], el.hole[1]), b = inv(el.hole[2], el.hole[3]);
    hole = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    xs.push(hole[0], hole[2]); zs.push(hole[1], hole[3]); xs.sort((a2, b2) => a2 - b2); zs.sort((a2, b2) => a2 - b2);
  }
  const inHole = (x, z) => hole && x > hole[0] + 0.01 && x < hole[2] - 0.01 && z > hole[1] + 0.01 && z < hole[3] - 0.01;
  const skip = hole ? (i, j) => inHole((xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2) : null;
  const G = xs.map((x) => zs.map((z) => P(x, z))), GU = xs.map((x) => zs.map((z) => P(x, z, -0.14)));
  bag.add(mat, sheet(G, true, skip));
  bag.add(soffit, sheet(GU, false, skip));
  // the eave's edge
  const ring = [];
  for (const x of xs) ring.push([x, cz - B]);
  for (const z of zs.slice(1)) ring.push([cx + A, z]);
  for (const x of xs.slice().reverse().slice(1)) ring.push([x, cz + B]);
  for (const z of zs.slice().reverse().slice(1)) ring.push([cx - A, z]);
  const edge = [];
  for (let k = 0; k + 1 < ring.length; k++) {
    const a = P(...ring[k]), b = P(...ring[k + 1]);
    edge.push(...a, ...b, b[0], b[1] - 0.2, b[2], ...a, b[0], b[1] - 0.2, b[2], a[0], a[1] - 0.2, a[2]);
  }
  bag.add(soffit, fromTriangles(edge.concat(flipTris(edge))));
  // ridge: the main ridge with curled ends; hips
  const top = y + R, r = [];
  const a0 = rot(cx - L - 0.3, cz), a1 = rot(cx + L + 0.3, cz);
  if (!hole) beamTris(r, [a0[0], top - 0.08, a0[1]], [a1[0], top - 0.08, a1[1]], 0.16, 0.42);
  for (const s of [-1, 1]) {
    // the curl at each end of the ridge, rising and turning out
    for (let k = 0; k < (el.curl === false || hole ? 0 : 5); k++) {
      const e0 = rot(cx + s * (L + 0.3 + k * 0.12), cz), e1 = rot(cx + s * (L + 0.42 + k * 0.12), cz);
      beamTris(r, [e0[0], top + 0.2 + k * k * 0.07, e0[1]], [e1[0], top + 0.2 + (k + 1) * (k + 1) * 0.07, e1[1]], 0.13, 0.22);
    }
    if (kind !== 'gable') for (const sz of [-1, 1]) {
      const pts = [];
      const tEnd = kind === 'xieshan' ? gAt : 1;
      for (let k = 0; k <= 12; k++) {
        const t = tEnd * k / 12;
        if (inHole(cx + s * (A - t * B), cz + sz * (B - t * B))) break;
        pts.push(P(cx + s * (A - t * B), cz + sz * (B - t * B), 0.08));
      }
      for (let k = 0; k + 1 < pts.length; k++) beamTris(r, pts[k], pts[k + 1], 0.08, 0.14);
    }
  }
  bag.add(mat, fromTriangles(r));
  // the xieshan's gable boards: a plastered triangle above the hips, set back over the hip
  if (kind === 'xieshan') {
    const xg = A - gAt * B - 0.05, yb = y + R * Math.pow(gAt, p);
    const g = [];
    for (const s of [-1, 1]) {
      const zz = (B - gAt * B) * 0.98;
      const q0 = rot(cx + s * xg, cz - zz), q1 = rot(cx + s * xg, cz + zz), q2 = rot(cx + s * xg, cz);
      g.push(q0[0], yb, q0[1], q1[0], yb, q1[1], q2[0], top - 0.1, q2[1]);
    }
    bag.add(PAL.plaster, fromTriangles(g.concat(flipTris(g))));
  }
}

/** A round column on a drum base. */
function column(bag, col, x, z, y, h, d, mat = PAL.column) {
  if (LOW) {
    bag.add(PAL.base, box(x - d * 0.75, y, z - d * 0.75, x + d * 0.75, y + 0.2, z + d * 0.75));
    bag.add(mat, lathe([[d / 2, 0], [d / 2 * 0.94, h]], 6, null, x, y + 0.2, z));
  } else {
    bag.add(PAL.base, lathe([[d * 0.85, 0], [d * 0.85, 0.08], [d * 0.72, 0.2], [d * 0.6, 0.22], [0.001, 0.22]], 12, null, x, y, z));
    bag.add(mat, lathe([[d / 2, 0], [d / 2 * 0.94, h], [0.001, h]], 10, null, x, y + 0.2, z));
  }
  col?.circle(x, z, d / 2, y, y + h);
}

/** A stone platform with a bluestone top and a granite kerb. */
function platform(bag, col, rect, y0, y1) {
  const [x0, z0, x1, z1] = rect;
  bag.add(PAL.base, box(x0, y0 - 0.6, z0, x1, y1 - 0.06, z1));
  bag.add(PAL.floor, box(x0 + 0.02, y1 - 0.06, z0 + 0.02, x1 - 0.02, y1, z1 - 0.02));
  col.floor(rect, y1);
  if (y1 - y0 > 0.25) col.rect(rect, y0 - 0.6, y1 - 0.31);
}

/** Lattice panels (long doors) between two posts, with a solid lower board; open (no panels) where `open`. */
function latticeBay(bag, col, a, b, y, h, kind = 'door', th = 0.06) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz * th, nz = ux * th;
  const n = LOW ? Math.max(1, Math.round(L / 1.8)) : Math.max(2, Math.round(L / 0.62));
  const lowH = kind === 'window' ? 0.95 : 0.55, topH = h - 0.12;
  const slab = (s0, s1, y0, y1, mat, k = 1) => {
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    const q = [[p0[0] - nx * k, p0[1] - nz * k], [p1[0] - nx * k, p1[1] - nz * k], [p1[0] + nx * k, p1[1] + nz * k], [p0[0] + nx * k, p0[1] + nz * k]];
    const tri = [];
    const v = (p, yy) => [p[0], yy, p[1]];
    const qd = (A, B, C, D) => tri.push(...A, ...B, ...C, ...A, ...C, ...D);
    qd(v(q[0], y0), v(q[1], y0), v(q[1], y1), v(q[0], y1)); qd(v(q[2], y0), v(q[3], y0), v(q[3], y1), v(q[2], y1));
    qd(v(q[0], y1), v(q[1], y1), v(q[2], y1), v(q[3], y1)); qd(v(q[1], y0), v(q[2], y0), v(q[2], y1), v(q[1], y1)); qd(v(q[3], y0), v(q[0], y0), v(q[0], y1), v(q[3], y1));
    bag.add(mat, fromTriangles(tri.concat(flipTris(tri))));
  };
  if (PAL.doors === 'plank') {
    // the older manner (Nara, Tang): doors of boards in two leaves with rows of bronze studs; windows
    // of upright square bars (renji) before a dark opening
    if (kind === 'door') {
      for (let j = 0; j < 2; j++) {
        const s0 = j * L / 2 + 0.04, s1 = (j + 1) * L / 2 - 0.04;
        slab(s0, s1, y + 0.05, y + topH, PAL.wood);
        if (!LOW) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
          const ss = s0 + (s1 - s0) * (c + 0.5) / 3, yy = y + 0.35 + (topH - 0.7) * r / 4;
          slab(ss - 0.05, ss + 0.05, yy - 0.05, yy + 0.05, 'gilt_bronze', 1.9);
        }
      }
      slab(L / 2 - 0.04, L / 2 + 0.04, y, y + topH, PAL.wood, 1.4);
    } else {
      slab(0.03, L - 0.03, y, y + lowH, PAL.plaster);
      slab(0.03, L - 0.03, y + lowH, y + topH, 'opening', 0.4);
      const nb = LOW ? Math.round(L / 0.5) : Math.round(L / 0.2);
      for (let k = 1; k < nb; k++) { const ss = k * L / nb; slab(ss - 0.04, ss + 0.04, y + lowH, y + topH, PAL.wood); }
    }
    slab(0, L, y + topH, y + h, PAL.wood);
    if (col) col.segment(a, b, th * 2, y, y + h);
    return;
  }
  for (let k = 0; k < n; k++) {
    const s0 = k * L / n + 0.03, s1 = (k + 1) * L / n - 0.03;
    slab(s0, s1, y + (kind === 'window' ? 0 : 0.05), y + lowH, kind === 'window' ? PAL.plaster : PAL.wood);
    slab(s0, s1, y + lowH, y + topH, PAL.lattice);
    slab(s0 - 0.03, s0 + 0.03, y, y + topH, PAL.wood);
  }
  slab(0, L, y + topH, y + h, PAL.wood);
  if (col) col.segment(a, b, th * 2, y, y + h);
}

/** A bench rail (mei ren kao): the seat on low panels, the curved back leaning out. */
function benchRail(bag, col, a, b, y) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const t = [];
  const P = (s, o, yy) => [a[0] + ux * s + nx * o, yy, a[1] + uz * s + nz * o];
  beamTris(t, P(0, 0, y + 0.42), P(L, 0, y + 0.42), 0.17, 0.06);
  const n = Math.max(2, Math.round(L / 0.5));
  for (let k = 0; k <= n; k++) { const s = k * L / n; beamTris(t, P(s, 0.12, y + 0.48), P(s + 0.0001, 0.3, y + 0.85), 0.025, 0.05); }
  beamTris(t, P(0, 0.3, y + 0.85), P(L, 0.3, y + 0.85), 0.03, 0.05);
  bag.add(PAL.wood, fromTriangles(t));
  bag.add(PAL.plaster, box(Math.min(P(0, -0.12, 0)[0], P(L, 0.12, 0)[0]), y, Math.min(P(0, -0.12, 0)[2], P(L, 0.12, 0)[2]), Math.max(P(0, -0.12, 0)[0], P(L, 0.12, 0)[0]), y + 0.36, Math.max(P(0, -0.12, 0)[2], P(L, 0.12, 0)[2])));
  col.segment(a, b, 0.3, y, y + 0.5);
}

// ── elements ─────────────────────────────────────────────────────────────────

/**
 * ming_hall: { rect, y (floor), H (eaves), front ('n'|'s'|'e'|'w'), four (lattice on all four sides,
 * a hall to be seen from), roof ('xieshan' | 'hip' | 'gable'), plat (platform height) }
 */
function mingHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H ?? 4.2, ylo = y - (el.plat ?? y);
  platform(bag, col, [x0 - 0.9, z0 - 0.9, x1 + 0.9, z1 + 0.9], ylo, y);
  const along = (x1 - x0) >= (z1 - z0), Lx = x1 - x0, Lz = z1 - z0;
  const nb = el.bays?.[0] ?? Math.max(1, Math.round((along ? Lx : Lz) / 3.6)), nd = el.bays?.[1] ?? Math.max(1, Math.round((along ? Lz : Lx) / 3.4));
  const xs = [], zs = [];
  for (let i = 0; i <= (along ? nb : nd); i++) xs.push(x0 + Lx * i / (along ? nb : nd));
  for (let j = 0; j <= (along ? nd : nb); j++) zs.push(z0 + Lz * j / (along ? nd : nb));
  // the posts round the edge; the hall's floor of square bricks
  // posts thicken with the height of the hall (a 15 m hall stands on posts near a metre thick)
  const d = H > 6 ? 0.28 + (H - 6) * 0.07 : 0.28, tall = H > 8, hd = Math.min(H - 0.5, 5.5 + (H - 8) * 0.15);
  for (const x of xs) for (const z of zs) if (x === x0 || x === x1 || z === z0 || z === z1) column(bag, col, x, z, y, H - 0.2, d);
  bag.add(PAL.floor, box(x0, y - 0.04, z0, x1, y + 0.01, z1));
  // lattice doors (or plaster walls with windows) between the posts
  const sides = { n: [[x0, z0], [x1, z0], xs], s: [[x1, z1], [x0, z1], xs], w: [[x0, z1], [x0, z0], zs], e: [[x1, z0], [x1, z1], zs] };
  for (const [k, [a, b, ticks]] of Object.entries(sides)) {
    const isFront = k === (el.front || 's');
    for (let i = 0; i + 1 < ticks.length; i++) {
      const p = (v) => (k === 'n' || k === 's' ? [v, a[1]] : [a[0], v]);
      const A = p(ticks[i]), B = p(ticks[i + 1]);
      if (el.four || isFront) {
        // the middle bay of the front stands open as the doorway
        const doorway = isFront && i === Math.floor((ticks.length - 1) / 2);
        if (doorway && !tall) continue;
        if (!tall) { latticeBay(bag, col, A, B, y, H - 0.5, el.four && !isFront ? 'window' : 'door'); continue; }
        // a tall hall: doors at the foot, a tie beam over them, plaster above with a band of lattice windows
        if (!doorway) latticeBay(bag, col, A, B, y, hd, 'door');
        const lo = [Math.min(A[0], B[0]), Math.min(A[1], B[1])], hi = [Math.max(A[0], B[0]), Math.max(A[1], B[1])], ns = k === 'n' || k === 's';
        const wall = (y0, y1, t, mat) => bag.add(mat, box(lo[0] - (ns ? 0 : t), y0, lo[1] - (ns ? t : 0), hi[0] + (ns ? 0 : t), y1, hi[1] + (ns ? t : 0)));
        wall(y + hd, y + hd + 0.45, 0.17, PAL.wood);
        wall(y + hd + 0.45, y + H - 0.55, 0.11, PAL.plaster);
        const span = H - 1.0 - hd;
        latticeBay(bag, null, A, B, y + hd + 0.45 + span * 0.3, span * 0.42, 'window', 0.14);
        col.segment(A, B, 0.3, y + (doorway ? hd : 0), y + H);
      } else {
        const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
        bag.add(PAL.plaster, box(Math.min(A[0], B[0]) - (k === 'w' || k === 'e' ? 0.14 : 0), y, Math.min(A[1], B[1]) - (k === 'n' || k === 's' ? 0.14 : 0), Math.max(A[0], B[0]) + (k === 'w' || k === 'e' ? 0.14 : 0), y + H - 0.4, Math.max(A[1], B[1]) + (k === 'n' || k === 's' ? 0.14 : 0)));
        col.segment(A, B, 0.28, y, y + H);
        void L;
      }
    }
  }
  // a frieze (gua luo) of fretwork under the eaves and the beam
  const fr = [];
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) beamTris(fr, [a[0], y + H - 0.55, a[1]], [b[0], y + H - 0.55, b[1]], 0.14, 0.38);
  bag.add(PAL.wood, fromTriangles(fr));
  // the ceiling and the roof
  bag.add(PAL.wood, box(x0, y + H - 0.2, z0, x1, y + H - 0.12, z1));
  const o = el.eave ?? 1.25;
  if (el.roof !== 'none') rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (along ? Lx : Lz) / 2 + o, B: (along ? Lz : Lx) / 2 + o, y: y + H - 0.25, rise: el.rise ?? ((along ? Lz : Lx) / 2 + o) * 0.62, kind: el.roof || 'xieshan', sweep: el.sweep ?? 1.0, alongZ: !along }, bag);
}

/** ming_pavilion: { c, shape ('hex'|'square'|'oct'|'rect'), r (or w, d), y, H, bench, moons (round openings: square only) } */
function mingPavilion(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, H = el.H ?? 3.3;
  let poly;
  if (el.shape === 'rect' || el.shape === 'square') {
    const w = el.w / 2, d = (el.d ?? el.w) / 2;
    poly = [[cx - w, cz - d], [cx + w, cz - d], [cx + w, cz + d], [cx - w, cz + d]];
  } else {
    const n = el.shape === 'oct' ? 8 : 6;
    poly = Array.from({ length: n }, (_, k) => { const a = (k + 0.5) / n * Math.PI * 2; return [cx + Math.cos(a) * el.r, cz + Math.sin(a) * el.r]; });
  }
  const ext = (p, m) => { const dx = p[0] - cx, dz = p[1] - cz, l = Math.hypot(dx, dz); return [cx + dx / l * (l + m), cz + dz / l * (l + m)]; };
  const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
  platform(bag, col, [Math.min(...xs) - 0.5, Math.min(...zs) - 0.5, Math.max(...xs) + 0.5, Math.max(...zs) + 0.5], y - Math.max(0.3, el.plat ?? 0.45), y);
  for (const p of poly) column(bag, col, p[0], p[1], y, H - 0.2, 0.22);
  // a bench rail between the posts, left open at the entrances
  const n = poly.length;
  if (el.moons && n === 4) {
    // the Wutong and Bamboo Retreat: four walls, each with a round opening
    const side = Math.hypot(poly[1][0] - poly[0][0], poly[1][1] - poly[0][1]), hw = H - 0.35;
    for (let k = 0; k < n; k++) roundWall(bag, col, poly[k], poly[(k + 1) % n], y, hw, 0.22, Math.min(side * 0.33, (hw - 0.35) / 2));
  } else if (el.bench !== false) {
    const open = el.open ?? [0];
    for (let k = 0; k < n; k++) if (!open.includes(k)) benchRail(bag, col, poly[k], poly[(k + 1) % n], y);
  }
  const fr = [];
  for (let k = 0; k < n; k++) { const a = poly[k], b = poly[(k + 1) % n]; beamTris(fr, [a[0], y + H - 0.55, a[1]], [b[0], y + H - 0.55, b[1]], 0.12, 0.34); }
  bag.add(PAL.wood, fromTriangles(fr));
  if (el.shape === 'rect') rectRoof({ c: [cx, cz], A: el.w / 2 + 1.0, B: (el.d ?? el.w) / 2 + 1.0, y: y + H - 0.2, rise: ((el.d ?? el.w) / 2 + 1) * 0.7, kind: 'xieshan', sweep: 0.9 }, bag);
  else pyramidRoof(poly.map((p) => ext(p, 1.0)), y + H - 0.2, (el.r ?? el.w / 2) * 1.05 + 0.9, el.sweep ?? 1.0, bag, PAL.roof, PAL.wood);
}

/** A plastered wall from a to b with one round opening of radius rr at its middle (a moon gate or a round window). */
function roundWall(bag, col, a, b, y, h, th, rr, sill = null) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(L, 0); shape.lineTo(L, h); shape.lineTo(0, h); shape.lineTo(0, 0);
  const cy = Math.min(sill === null ? rr + 0.05 : sill + rr, h - rr - 0.15);
  const hole = new Path();
  hole.absarc(L / 2, cy, rr, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 32 });
  g.translate(0, 0, -th / 2);
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const m = new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux });
  m.elements[0] = ux; m.elements[1] = 0; m.elements[2] = uz; m.elements[4] = 0; m.elements[5] = 1; m.elements[6] = 0; m.elements[8] = -uz; m.elements[9] = 0; m.elements[10] = ux;
  m.setPosition(a[0], y, a[1]);
  g.applyMatrix4(m);
  bag.add(PAL.plaster, g);
  // the opening's rim of grey brick
  bag.add(PAL.plinth, lathe([[rr + 0.08, -th / 2 - 0.01], [rr + 0.08, th / 2 + 0.01], [rr, th / 2 + 0.01], [rr, -th / 2 - 0.01]], 32, null, 0, 0, 0).applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2)).applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(a[0] + ux * L / 2, y + cy, a[1] + uz * L / 2)));
  // collision: the wall either side of the opening (and above and below it)
  const gap = sill === null ? rr * 0.85 : 0;
  const s0 = L / 2 - gap, s1 = L / 2 + gap;
  if (s0 > 0.05) col.segment(a, [a[0] + ux * s0, a[1] + uz * s0], th, y, y + h);
  if (L - s1 > 0.05) col.segment([a[0] + ux * s1, a[1] + uz * s1], b, th, y, y + h);
  if (gap > 0) col.segment([a[0] + ux * s0, a[1] + uz * s0], [a[0] + ux * s1, a[1] + uz * s1], th, y + 2 * rr * 0.9, y + h);
}

/**
 * ming_wall: a garden wall { a, b, y, h (to the coping), th, gates: [{ at (along), r (moon gate) | w (door) }],
 * windows: [{ at, w, h, sill }] (latticed leaky windows) } with a tiled coping.
 */
function mingWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, y = el.y, h = el.h ?? 4.2, th = el.th ?? 0.4;
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(L, 0); shape.lineTo(L, h); shape.lineTo(0, h); shape.lineTo(0, 0);
  const cuts = [];
  for (const g of el.gates || []) {
    const p = new Path();
    if (g.r) { p.absarc(g.at, g.r + 0.05, g.r, 0, Math.PI * 2, true); cuts.push([g.at - g.r * 0.85, g.at + g.r * 0.85, 0, 2 * g.r * 0.95]); }
    else { p.moveTo(g.at - g.w / 2, 0.02); p.lineTo(g.at - g.w / 2, g.h ?? 2.4); p.lineTo(g.at + g.w / 2, g.h ?? 2.4); p.lineTo(g.at + g.w / 2, 0.02); p.lineTo(g.at - g.w / 2, 0.02); cuts.push([g.at - g.w / 2, g.at + g.w / 2, 0, g.h ?? 2.4]); }
    shape.holes.push(p);
  }
  const lat = [];
  for (const w of el.windows || []) {
    const p = new Path(), s = w.sill ?? 1.2;
    p.moveTo(w.at - w.w / 2, s); p.lineTo(w.at - w.w / 2, s + w.h); p.lineTo(w.at + w.w / 2, s + w.h); p.lineTo(w.at + w.w / 2, s); p.lineTo(w.at - w.w / 2, s);
    shape.holes.push(p);
    lat.push(w);
  }
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 28 });
  g.translate(0, 0, -th / 2);
  const M = new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(ax, y, az);
  g.applyMatrix4(M);
  bag.add(PAL.plaster, g);
  // the leaky windows' lattice (ice-crack and coin patterns), a dark grey plinth along the foot
  for (const w of lat) {
    const s = w.sill ?? 1.2, c = [ax + ux * w.at, az + uz * w.at];
    const t = [];
    beamTris(t, [c[0] - ux * w.w / 2, y + s, c[1] - uz * w.w / 2], [c[0] + ux * w.w / 2, y + s, c[1] + uz * w.w / 2], 0.03, w.h);
    bag.add(PAL.leaky, fromTriangles(t));
  }
  // the weathering, on both faces: the damp rising above the plinth in a ragged band, rain streaks under the coping
  if (PAL.plaster === 'plaster_white' && !el.clean) {
    const rand = rng(((ax * 73 + az * 31) | 0) + 11), damp = [], streak = [];
    const clear = (s0, s1, ya, yb) => (el.gates || []).every((g) => { const hw = g.r ?? g.w / 2; return s1 < g.at - hw - 0.1 || s0 > g.at + hw + 0.1; }) && (el.windows || []).every((w) => s1 < w.at - w.w / 2 - 0.05 || s0 > w.at + w.w / 2 + 0.05 || yb < (w.sill ?? 1.2) || ya > (w.sill ?? 1.2) + w.h);
    for (const sgn of [-1, 1]) {
      const o = th / 2 + 0.008, nx = -uz * sgn, nz = ux * sgn;
      const quad = (arr, s0, s1, ya, yb) => { const p0 = [ax + ux * s0 + nx * o, az + uz * s0 + nz * o], p1 = [ax + ux * s1 + nx * o, az + uz * s1 + nz * o]; arr.push(p0[0], y + ya, p0[1], p1[0], y + ya, p1[1], p1[0], y + yb, p1[1], p0[0], y + ya, p0[1], p1[0], y + yb, p1[1], p0[0], y + yb, p0[1]); };
      for (let s0 = 0.1; s0 < L - 0.2;) { const w = 0.6 + rand() * 1.8, s1 = Math.min(L - 0.1, s0 + w), top = 0.45 + rand() * 0.7; if (clear(s0, s1, 0.32, top)) quad(damp, s0, s1, 0.33, top); s0 = s1 + rand() * 0.6; }
      for (let s0 = 0.3 + rand() * 2; s0 < L - 0.4; s0 += 1.2 + rand() * 3.5) { const w = 0.08 + rand() * 0.25, lo = Math.max(1.3, h - 0.05 - (0.3 + rand() * 1.4)); if (h - 0.06 - lo > 0.2 && clear(s0, s0 + w, lo, h)) quad(streak, s0, s0 + w, lo, h - 0.06); }
    }
    if (damp.length) bag.add('plaster_damp', fromTriangles(damp.concat(flipTris(damp))));
    if (streak.length) bag.add('plaster_streak', fromTriangles(streak.concat(flipTris(streak))));
  }
  const pl = [];
  beamTris(pl, [ax - ux * 0.02, y - 0.3, az - uz * 0.02], [bx + ux * 0.02, y - 0.3, bz + uz * 0.02], th / 2 + 0.03, 0.62);
  bag.add(PAL.plinth, fromTriangles(pl));
  // the coping: a little roof of black tiles on both sides of the wall's top
  const cp = [], o = th / 2 + 0.28;
  for (const sgn of [-1, 1]) {
    const nx = -uz * sgn, nz = ux * sgn;
    const e0 = [ax + nx * o, y + h - 0.05, az + nz * o], e1 = [bx + nx * o, y + h - 0.05, bz + nz * o];
    const r0 = [ax, y + h + 0.38, az], r1 = [bx, y + h + 0.38, bz];
    cp.push(...e0, ...e1, ...r1, ...e0, ...r1, ...r0);
  }
  bag.add(PAL.roof, fromTriangles(cp.concat(flipTris(cp))));
  const rd = [];
  beamTris(rd, [ax, y + h + 0.3, az], [bx, y + h + 0.3, bz], 0.09, 0.16);
  bag.add(PAL.roof, fromTriangles(rd));
  // collision: the wall, with gaps at the gates
  let s = 0;
  for (const [s0, s1] of cuts.sort((p, q) => p[0] - q[0])) {
    if (s0 - s > 0.05) col.segment([ax + ux * s, az + uz * s], [ax + ux * s0, az + uz * s0], th, y - 0.3, y + h + 0.4);
    s = s1;
  }
  if (L - s > 0.05) col.segment([ax + ux * s, az + uz * s], [bx, bz], th, y - 0.3, y + h + 0.4);
}

/** ming_gallery: a covered walk { pts, y, w, H, side (the side with a white wall: 1 | -1 | 0) } on posts, with a bench rail. */
function mingGallery(el, { bag, col }) {
  const pts = el.pts, y = el.y ?? 0.3, w = (el.w ?? 2.0) / 2, H = el.H ?? 2.8;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
    const n = Math.max(1, Math.round(L / 3));
    // the floor
    const fl = [];
    beamTris(fl, [a[0], y - 0.35, a[1]], [b[0], y - 0.35, b[1]], w + 0.15, 0.35);
    bag.add(PAL.floor, fromTriangles(fl));
    for (let k = 0; k <= n; k++) {
      const s = k * L / n;
      for (const sg of [-1, 1]) column(bag, col, a[0] + ux * s + nx * w * sg, a[1] + uz * s + nz * w * sg, y, H - 0.1, 0.18);
    }
    // the roof: two slopes over a ridge
    const rf = [], uf = [];
    const o = w + 0.7;
    for (const sg of [-1, 1]) {
      const e0 = [a[0] + nx * o * sg - ux * 0.3, y + H - 0.1, a[1] + nz * o * sg - uz * 0.3], e1 = [b[0] + nx * o * sg + ux * 0.3, y + H - 0.1, b[1] + nz * o * sg + uz * 0.3];
      const r0 = [a[0] - ux * 0.3, y + H + 1.0, a[1] - uz * 0.3], r1 = [b[0] + ux * 0.3, y + H + 1.0, b[1] + uz * 0.3];
      rf.push(...e0, ...r1, ...e1, ...e0, ...r0, ...r1);
      uf.push(e0[0], e0[1] - 0.1, e0[2], e1[0], e1[1] - 0.1, e1[2], r1[0], r1[1] - 0.1, r1[2], e0[0], e0[1] - 0.1, e0[2], r1[0], r1[1] - 0.1, r1[2], r0[0], r0[1] - 0.1, r0[2]);
    }
    bag.add(PAL.roof, fromTriangles(rf.concat(flipTris(rf))));
    bag.add(PAL.wood, fromTriangles(uf));
    const rd = [];
    beamTris(rd, [a[0] - ux * 0.3, y + H + 0.95, a[1] - uz * 0.3], [b[0] + ux * 0.3, y + H + 0.95, b[1] + uz * 0.3], 0.1, 0.18);
    bag.add(PAL.roof, fromTriangles(rd));
    // a bench rail on the open side, a white wall with windows on the other
    if (el.side) {
      const sg = el.side, A = [a[0] + nx * (w + 0.1) * sg, a[1] + nz * (w + 0.1) * sg], B = [b[0] + nx * (w + 0.1) * sg, b[1] + nz * (w + 0.1) * sg];
      mingWall({ a: A, b: B, y, h: H - 0.2, th: 0.24, windows: L > 4 ? [{ at: L / 2, w: 1.0, h: 1.0, sill: 1.1 }] : [] }, { bag, col });
    }
    // the bench rail on the open side, broken every few bays where a path leaves the gallery
    const sg2 = el.side ? -el.side : 1;
    for (let k = 0; k < n; k++) {
      if (n > 2 && k % 4 === 2) continue;
      const s0 = k * L / n, s1 = (k + 1) * L / n;
      benchRail(bag, col, [a[0] + ux * s0 + nx * w * sg2, a[1] + uz * s0 + nz * w * sg2], [a[0] + ux * s1 + nx * w * sg2, a[1] + uz * s1 + nz * w * sg2], y);
    }
    col.floor([Math.min(a[0], b[0]) - (Math.abs(nx) * w + 0.2), Math.min(a[1], b[1]) - (Math.abs(nz) * w + 0.2), Math.max(a[0], b[0]) + (Math.abs(nx) * w + 0.2), Math.max(a[1], b[1]) + (Math.abs(nz) * w + 0.2)], y);
  }
}

/** ming_slab_bridge: stone slabs on piers along a polyline over the water { pts, w, y, bed }, a low rail on each side. */
function slabBridge(el, { bag, col }) {
  const y = el.y ?? 0.2, w = el.w / 2, bed = el.bed ?? -1.6;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const a = el.pts[i], b = el.pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
    const t = [];
    beamTris(t, [a[0] - ux * 0.15, y - 0.25, a[1] - uz * 0.15], [b[0] + ux * 0.15, y - 0.25, b[1] + uz * 0.15], w, 0.25);
    bag.add(PAL.base, fromTriangles(t));
    const p = [];
    for (const q of [a, b]) beamTris(p, [q[0] - ux * 0.25, bed, q[1] - uz * 0.25], [q[0] + ux * 0.25, bed, q[1] + uz * 0.25], w * 0.9, y - 0.25 - bed);
    bag.add(PAL.base, fromTriangles(p));
    const r = [];
    for (const sg of [-1, 1]) beamTris(r, [a[0] + nx * (w - 0.08) * sg, y, a[1] + nz * (w - 0.08) * sg], [b[0] + nx * (w - 0.08) * sg, y, b[1] + nz * (w - 0.08) * sg], 0.07, 0.32);
    bag.add(PAL.base, fromTriangles(r));
    // walk: a narrow floor along the segment (a few rectangles)
    const n = Math.max(1, Math.ceil(L / 0.8));
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * L / n, cx = a[0] + ux * s, cz = a[1] + uz * s, hw = Math.abs(ux) * (L / n / 2 + 0.25) + Math.abs(nx) * w, hd = Math.abs(uz) * (L / n / 2 + 0.25) + Math.abs(nz) * w;
      col.floor([cx - hw, cz - hd, cx + hw, cz + hd], y);
    }
  }
}

/**
 * ming_arch_bridge: a humpbacked stone bridge over a canal { at, across ('z' | 'x'), span (water),
 * width, rise, landing } — a semicircular arch, steps up and down, parapets.
 */
function archBridge(el, { bag, col }) {
  const [cx, cz] = el.at, S = el.span, W = el.width / 2, R = el.rise ?? 2.2, land = el.landing ?? 4.5, y0 = el.y ?? 0, bed = el.bed ?? -2.6;
  const alongZ = el.across === 'z';
  const P = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const half = S / 2 + land;
  const top = (s) => y0 + R * Math.cos(Math.min(1, Math.abs(s) / half) * Math.PI / 2) ** 0.8;
  // the arch body: slices across the bridge, the arch cut out below (a half circle over the water)
  const N = 48, body = [];
  const archR = S / 2 * 0.92, springY = el.water ?? -0.75;
  const under = (s) => (Math.abs(s) < archR ? springY + Math.sqrt(archR * archR - s * s) : bed);
  for (let i = 0; i < N; i++) {
    const s0 = -half + 2 * half * i / N, s1 = -half + 2 * half * (i + 1) / N;
    const t0 = Math.round(top(s0) / 0.16) * 0.16, t1 = Math.round(top(s1) / 0.16) * 0.16;
    const t = Math.max(t0, t1) - 0.001;
    const u0 = under(s0), u1 = under(s1);
    for (const o of [-W, W]) {
      const q = [P(s0, o, u0), P(s1, o, u1), P(s1, o, t), P(s0, o, t)];
      body.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
    }
    // the step tread and the arch's soffit
    const tr = [P(s0, -W, t), P(s1, -W, t), P(s1, W, t), P(s0, W, t)];
    body.push(...tr[0], ...tr[3], ...tr[2], ...tr[0], ...tr[2], ...tr[1]);
    const so = [P(s0, -W, u0), P(s1, -W, u1), P(s1, W, u1), P(s0, W, u0)];
    body.push(...so[0], ...so[1], ...so[2], ...so[0], ...so[2], ...so[3]);
    // the riser between this slice and the next
    const tn = i + 1 < N ? Math.round(top(-half + 2 * half * (i + 2) / N) / 0.16) * 0.16 : 0;
    const r = [P(s1, -W, t), P(s1, W, t), P(s1, W, Math.max(tn, t)), P(s1, -W, Math.max(tn, t))];
    body.push(...r[0], ...r[1], ...r[2], ...r[0], ...r[2], ...r[3]);
    // parapets
    for (const o of [-W - 0.12, W - 0.12]) {
      const pp = [];
      beamTris(pp, P(s0, o + 0.12, t), P(s1, o + 0.12, t), 0.12, 0.5);
      bag.add(PAL.base, fromTriangles(pp));
    }
  }
  bag.add(PAL.base, fromTriangles(body.concat(flipTris(body))));
  // walk: ramps up and down the bridge
  const ramp = (sA, sB) => {
    const a = P(sA, -W, 0), b = P(sB, W, 0), yA = top(sA), yB = top(sB);
    const dir = alongZ ? (sB > sA ? (yB > yA ? 's' : 'n') : (yB > yA ? 'n' : 's')) : (sB > sA ? (yB > yA ? 'e' : 'w') : (yB > yA ? 'w' : 'e'));
    col.ramp([Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])], Math.min(yA, yB), Math.max(yA, yB), dir);
  };
  const K = 8;
  for (let k = 0; k < K; k++) ramp(-half + 2 * half * k / K, -half + 2 * half * (k + 1) / K);
  for (const o of [-W - 0.12, W + 0.12]) { const a = P(-half, o, 0), b = P(half, o, 0); col.segment([a[0], a[2]], [b[0], b[2]], 0.24, y0 - 1, y0 + R + 0.6); }
}

/** canal_wall: a granite wall along a canal's edge { a, b, y (top), bed, th }. */
function canalWall(el, { bag, col }) {
  const t = [];
  beamTris(t, [el.a[0], el.bed ?? -2.6, el.a[1]], [el.b[0], el.bed ?? -2.6, el.b[1]], (el.th ?? 0.7) / 2, (el.y ?? 0.05) - (el.bed ?? -2.6));
  bag.add('granite_block', fromTriangles(t));
}

/** water_rect: a still water surface over a rectangle { rect, y }. */
function waterRect(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add('water', fromTriangles([x0, el.y, z0, x0, el.y, z1, x1, el.y, z1, x0, el.y, z0, x1, el.y, z1, x1, el.y, z0]));
}

/** water_cells: a water surface where inside(x, z) holds, on a grid of `cell` metres { rect, y, cell, inside }. */
function waterCells(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, c = el.cell ?? 0.6, t = [];
  for (let x = x0; x < x1; x += c) for (let z = z0; z < z1; z += c) {
    if (!el.inside(x + c / 2, z + c / 2)) continue;
    t.push(x, el.y, z, x, el.y, z + c, x + c, el.y, z + c, x, el.y, z, x + c, el.y, z + c, x + c, el.y, z);
  }
  bag.add('water', fromTriangles(t));
}

/** taihu: a heap of Taihu rocks { c, r, h, seed, n } — lumpy, holed stones piled and leaning. */
function taihu(el, { bag, col }) {
  const rand = rng(el.seed || 7), [cx, cz] = el.c, y = el.y ?? 0;
  const n = el.n ?? Math.max(1, Math.round(el.r * 1.6));
  for (let k = 0; k < n; k++) {
    const a = rand() * Math.PI * 2, d = rand() * el.r * 0.7, s = (0.35 + rand() * 0.65) * Math.min(1.6, el.r * 0.6 + 0.4);
    const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, hh = s * (0.8 + rand() * 1.4) * (el.h ? el.h / 1.2 : 1);
    bag.add('taihu', rock(x, y + (rand() - 0.3) * 0.2, z, s, hh, rand));
  }
  if (el.solid) col.circle(cx, cz, el.r * 0.7, y, y + (el.h ?? 1.2));
}
/** One stone: a squashed, dented sphere leaning a little. */
function rock(x, y, z, s, h, rand) {
  const prof = [];
  const nn = 7;
  for (let i = 0; i <= nn; i++) { const t = i / nn, r = Math.sin(Math.PI * (0.06 + 0.88 * t)) * s * (0.7 + 0.5 * rand()); prof.push([Math.max(0.001, r), t * h]); }
  prof[nn][0] = 0.001;
  const ph = rand() * 6.28, k1 = 2 + Math.floor(rand() * 3), k2 = 3 + Math.floor(rand() * 3);
  return lathe(prof, 9, (th, i) => 1 + 0.28 * Math.sin(th * k1 + ph + i) + 0.18 * Math.sin(th * k2 - i * 1.7), x, y - 0.05, z);
}

/** lotus: leaves floating on the pond (and a few on stems above it), with a bud or two { c, r, y, n, seed }. */
function lotus(el, { bag }) {
  const rand = rng(el.seed || 3), [cx, cz] = el.c, y = el.y;
  for (let k = 0; k < (el.n ?? 30); k++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * el.r, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const lift = rand() < 0.35 ? 0.3 + rand() * 0.7 : 0.02, rr = 0.25 + rand() * 0.3;
    bag.add('lotus_leaf', lathe([[0.001, lift + 0.06], [rr * 0.6, lift + 0.03], [rr, lift + 0.07], [rr * 1.02, lift + 0.05]], 12, null, x, y, z));
    if (lift > 0.1) bag.add('lotus_leaf', box(x - 0.012, y - 0.4, z - 0.012, x + 0.012, y + lift + 0.04, z + 0.012));
    if (rand() < 0.08) bag.add('paint_robe', lathe([[0.001, 0], [0.06, 0.08], [0.05, 0.16], [0.001, 0.22]], 6, null, x + 0.2, y + lift + 0.5, z));
  }
}

/**
 * house_jiangnan: a house of the canal town { rect, y, front, storeys, shop, water (a canal under
 * one side), seed }: a granite plinth, white walls, a gabled roof of black tiles along the street,
 * plank shutters or lattice on the ground floor, latticed windows above with a little pent eave,
 * gable walls rising over the roof in steps (horse-head walls) on some.
 */
function houseJiangnan(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's';
  const along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const storey = 3.1, H = el.storeys * storey;
  // local frame: u along the front, v from the front to the back
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1];
  const v = [-u[1], u[0]];
  const W = (a, b, yy) => [ox + u[0] * a + v[0] * b, yy, oz + u[1] * a + v[1] * b];
  const B = (a0, b0, a1, b1, ya, yb, mat) => {
    const p = [W(a0, b0, 0), W(a1, b1, 0)];
    bag.add(mat, box(Math.min(p[0][0], p[1][0]), ya, Math.min(p[0][2], p[1][2]), Math.max(p[0][0], p[1][0]), yb, Math.max(p[0][2], p[1][2])));
  };
  const plinthBottom = el.water ? -2.6 : y - 0.4;
  B(0, 0, L, D, plinthBottom, y + 0.45, 'granite_block');
  const back = D - 0.25, front = 0.6;
  // the walls: plaster all round the upper parts and the sides; the front's ground floor of boards
  B(0.0, front, 0.25, back, y + 0.45, y + H, 'plaster_white');
  B(L - 0.25, front, L, back, y + 0.45, y + H, 'plaster_white');
  B(0, back - 0.25, L, back, y + 0.45, y + H, 'plaster_white');
  if (el.shop) {
    // a shop front: a counter of boards, the upper part open (the shutters taken down for the day); an
    // open shop leaves a way in at one end of the counter
    if (el.open) { B(0.25, front, L - 1.35, front + 0.12, y + 0.45, y + 1.4, 'timber'); col.rect(boxRect(W(0.25, front, 0), W(L - 1.35, front + 0.12, 0)), y, y + 1.4); }
    else B(0.25, front, L - 0.25, front + 0.12, y + 0.45, y + 1.4, 'timber');
    B(0.25, front - 0.05, L - 0.25, front + 0.12, y + storey - 0.35, y + storey, 'lacquer_chestnut');
    B(0.3, front + 1.4, L - 0.3, front + 1.5, y + 0.45, y + 0.95, 'timber');            // a table inside
  } else {
    const nb = Math.max(2, Math.round(L / 1.2));
    for (let k = 0; k < nb; k++) {
      const a0 = 0.25 + (L - 0.5) * k / nb, a1 = 0.25 + (L - 0.5) * (k + 1) / nb - 0.04;
      const door = k === Math.floor(nb / 2);
      if (el.open && door) { B(a0 - 0.02, front - 0.02, a0 + 0.06, front + 0.7, y + 0.45, y + storey - 0.3, 'lacquer_chestnut'); continue; }   // the door leaf stands open, folded in
      B(a0, front, a1, front + 0.08, y + 0.45, y + storey - 0.3, door ? 'lacquer_chestnut' : (rand() < 0.5 ? 'timber' : 'lattice'));
      if (el.open) col.rect(boxRect(W(a0, front, 0), W(a1, front + 0.08, 0)), y, y + storey);
    }
  }
  B(0, front - 0.05, L, front + 0.15, y + storey - 0.3, y + storey + 0.05, 'lacquer_chestnut');
  if (!el.open) col.rect([x0, z0, x1, z1], plinthBottom, y + H);
  else {
    // an open house: the plinth a floor, the walls solid, a step up at the front; the interior furnished
    col.rect([x0, z0, x1, z1], plinthBottom, y + 0.2);
    col.floor([x0, z0, x1, z1], y + 0.45);
    for (const [a0, b0, a1, b1] of [[0, front, 0.25, back], [L - 0.25, front, L, back], [0, back - 0.25, L, back]]) col.rect(boxRect(W(a0, b0, 0), W(a1, b1, 0)), y, y + H);
    houseInterior(bag, col, { W, B, L, D, front, back, y: y + 0.45, storey, storeys: el.storeys, shop: el.shop, rand });
  }
  if (el.storeys > 1) {
    // a little pent eave over the ground floor, then the upper floor's lattice windows
    const pe = [];
    const pa = W(0, front + 0.1, y + storey + 0.25), pb = W(L, front + 0.1, y + storey + 0.25), pc = W(L, front - 0.75, y + storey - 0.15), pd = W(0, front - 0.75, y + storey - 0.15);
    pe.push(...pa, ...pb, ...pc, ...pa, ...pc, ...pd);
    bag.add('tile_dark', fromTriangles(pe.concat(flipTris(pe))));
    const nw = Math.max(2, Math.round(L / 1.0));
    for (let k = 0; k < nw; k++) {
      const a0 = 0.25 + (L - 0.5) * k / nw + 0.03, a1 = 0.25 + (L - 0.5) * (k + 1) / nw - 0.03;
      B(a0, front + 0.3, a1, front + 0.36, y + storey + 0.35, y + storey + 1.1, 'plaster_white');
      B(a0, front + 0.3, a1, front + 0.36, y + storey + 1.1, y + H - 0.3, rand() < 0.85 ? 'lattice' : 'timber');
    }
    B(0.25, front + 0.3, L - 0.25, front + 0.36, y + H - 0.3, y + H, 'lacquer_chestnut');
  }
  // the roof: two slopes along the front, the ridge with curled ends
  const o = 0.55, rise = D * 0.3, yr = y + H;
  const rf = [], uf = [];
  const eF = [W(-0.15, front - o, yr), W(L + 0.15, front - o, yr)], eB = [W(-0.15, D + o * 0.5, yr - 0.2), W(L + 0.15, D + o * 0.5, yr - 0.2)];
  const mid = (front + D) / 2, rg = [W(-0.15, mid, yr + rise), W(L + 0.15, mid, yr + rise)];
  const sag = (p, q, r2, s) => { const n = 6, pts = []; for (let k = 0; k <= n; k++) { const t = k / n; const yy = p[1] + (r2[1] - p[1]) * Math.pow(t, 1.35); pts.push([p[0] + (r2[0] - p[0]) * t, yy, p[2] + (r2[2] - p[2]) * t], [q[0] + (s[0] - q[0]) * t, yy, q[2] + (s[2] - q[2]) * t]); } return pts; };
  for (const [ea, eb] of [[eF[0], eF[1]], [eB[0], eB[1]]]) {
    const pts = sag(ea, eb, rg[0], rg[1]);
    for (let k = 0; k + 3 < pts.length; k += 2) { rf.push(...pts[k], ...pts[k + 1], ...pts[k + 3], ...pts[k], ...pts[k + 3], ...pts[k + 2]); uf.push(pts[k][0], pts[k][1] - 0.08, pts[k][2], pts[k + 3][0], pts[k + 3][1] - 0.08, pts[k + 3][2], pts[k + 1][0], pts[k + 1][1] - 0.08, pts[k + 1][2], pts[k][0], pts[k][1] - 0.08, pts[k][2], pts[k + 2][0], pts[k + 2][1] - 0.08, pts[k + 2][2], pts[k + 3][0], pts[k + 3][1] - 0.08, pts[k + 3][2]); }
  }
  bag.add('tile_dark', fromTriangles(rf.concat(flipTris(rf))));
  bag.add('timber', fromTriangles(uf.concat(flipTris(uf))));
  const rd = [];
  beamTris(rd, [rg[0][0], rg[0][1] - 0.05, rg[0][2]], [rg[1][0], rg[1][1] - 0.05, rg[1][2]], 0.12, 0.3);
  for (const [p, sgn] of [[rg[0], -1], [rg[1], 1]]) {
    const ua = [u[0] * sgn, u[1] * sgn];
    for (let k = 0; k < 3; k++) beamTris(rd, [p[0] + ua[0] * k * 0.1, p[1] + 0.2 + k * k * 0.08, p[2] + ua[1] * k * 0.1], [p[0] + ua[0] * (k + 1) * 0.1, p[1] + 0.2 + (k + 1) * (k + 1) * 0.08, p[2] + ua[1] * (k + 1) * 0.1], 0.1, 0.18);
  }
  bag.add('tile_dark', fromTriangles(rd));
  // the gable ends: plastered triangles; on some houses stepped horse-head walls above the roof
  const g = [];
  const step = rand() < 0.35;
  for (const a of [0.0, L]) {
    const p0 = W(a, front - 0.1, yr), p1 = W(a, D, yr), p2 = W(a, mid, yr + rise + 0.05);
    g.push(...p0, ...p1, ...p2);
    if (step) {
      for (let s2 = 0; s2 < 3; s2++) {
        const b0 = front + (mid - front) * s2 / 3, b1 = front + (mid - front) * (s2 + 1) / 3, yy = yr + rise * (s2 + 1) / 3 + 0.5;
        const c0 = W(a - 0.13, b0, 0), c1 = W(a + 0.13, D - (b0 - front), 0);
        bag.add('plaster_white', box(Math.min(c0[0], c1[0]), yr, Math.min(c0[2], c1[2]), Math.max(c0[0], c1[0]), yy, Math.max(c0[2], c1[2])));
        const t2 = [];
        const d0 = W(a, b0, yy), d1 = W(a, D - (b0 - front), yy);
        beamTris(t2, d0, d1, 0.24, 0.16);
        bag.add('tile_dark', fromTriangles(t2));
        void b1;
      }
    }
  }
  bag.add('plaster_white', fromTriangles(g.concat(flipTris(g))));
}

const boxRect = (p, q) => [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])];
/**
 * The inside of an open canal-town house (docs/settlements/ming-suzhou.md §6): a floor of square
 * bricks, the upper floor's boards and joists overhead; a shop has shelves of jars and bolts of cloth
 * along the back, a scale and an abacus on the counter, a stool; a home has the hall's long table
 * against the back wall (incense burner, vase, a hanging scroll above), the square table with two
 * armchairs before it, and a canopied bed screened off at one side.
 */
function houseInterior(bag, col, { W, B, L, D, front, back, y, storey, storeys, shop, rand }) {
  const ib = back - 0.25, il = 0.25, ir = L - 0.25, fin = front + 0.15;
  B(il, fin, ir, ib, y - 0.02, y + 0.01, 'brick_grey');
  if (storeys > 1) {
    B(il, fin, ir, ib, y + storey - 0.5, y + storey - 0.42, 'timber');
    for (let a = il + 0.5; a < ir; a += 0.7) B(a - 0.06, fin, a + 0.06, ib, y + storey - 0.62, y + storey - 0.5, 'wood_dark');
  }
  const put = (mat, a0, b0, a1, b1, ya, yb) => B(a0, b0, a1, b1, y + ya, y + yb, mat);
  const block = (a0, b0, a1, b1, h) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); col.rect(boxRect(p, q), y - 0.45, y + h); };
  const pot = (a, b, ya, s2, mat) => { const p = W(a, b, 0); bag.add(mat, lathe([[0.1 * s2, 0], [0.16 * s2, 0.08 * s2], [0.17 * s2, 0.2 * s2], [0.1 * s2, 0.3 * s2], [0.06 * s2, 0.34 * s2], [0.001, 0.34 * s2]], 10, null, p[0], y + ya, p[2])); };
  if (shop) {
    // shelves along the back wall, three boards on uprights, jars and bolts of cloth on them
    const sb0 = ib - 0.45;
    for (const a of [il + 0.1, (il + ir) / 2, ir - 0.14]) put('wood_dark', a, sb0, a + 0.05, ib, 0, 2.2);
    for (const hh of [0.5, 1.15, 1.8]) {
      put('wood_dark', il + 0.1, sb0, ir - 0.1, ib, hh - 0.04, hh);
      for (let a = il + 0.35; a < ir - 0.3; a += 0.42) { if (rand() < 0.35) continue; if (rand() < 0.6) pot(a, sb0 + 0.22, hh, 0.9, ['glaze_blue', 'glaze_green', 'pottery_dark', 'glaze_white'][Math.floor(rand() * 4)]); else put(['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre'][Math.floor(rand() * 4)], a - 0.15, sb0 + 0.05, a + 0.15, ib - 0.05, hh, hh + 0.22); }
    }
    block(il, sb0, ir, ib, 2.2);
    // on the counter: an abacus and a steelyard; behind it a stool; a lantern overhead
    const cb = fin;
    put('wood_dark', 0.6, cb - 0.12, 0.95, cb + 0.05, 0.95, 1.0);
    for (let k = 0; k < 6; k++) put('wood_dark', 0.63 + k * 0.05, cb - 0.1, 0.645 + k * 0.05, cb + 0.03, 1.0, 1.04);
    put('iron', 1.3, cb - 0.04, 1.85, cb - 0.02, 1.25, 1.27); put('timber', 1.4, cb - 0.06, 1.44, cb, 0.97, 1.25);
    put('timber', 1.0, fin + 0.7, 1.35, fin + 1.05, 0, 0.45);
    const lp = W(L / 2, (fin + ib) / 2, 0); bag.add('lamp_paper', lathe([[0.07, 0], [0.17, 0.07], [0.19, 0.2], [0.16, 0.34], [0.07, 0.4], [0.001, 0.4]], 12, null, lp[0], y + 2.0, lp[2]));
  } else {
    // the hall: the long table against the back wall with its incense burner and a vase, the scroll over it
    const t0 = ib - 0.45, mid = L / 2;
    put('lacquer_chestnut', mid - 1.0, t0, mid + 1.0, ib - 0.02, 0.88, 0.94);
    for (const a of [mid - 0.95, mid + 0.9]) put('lacquer_chestnut', a, t0 + 0.03, a + 0.05, ib - 0.05, 0, 0.88);
    put('lacquer_chestnut', mid - 1.05, t0, mid - 0.98, ib - 0.02, 0.94, 1.02); put('lacquer_chestnut', mid + 0.98, t0, mid + 1.05, ib - 0.02, 0.94, 1.02);
    pot(mid - 0.5, t0 + 0.22, 0.94, 1.1, 'glaze_white'); pot(mid + 0.15, t0 + 0.22, 0.94, 0.55, 'bronze');
    put('stucco_cream', mid - 0.35, ib - 0.03, mid + 0.35, ib - 0.01, 1.3, 2.4); put('wood_dark', mid - 0.4, ib - 0.04, mid + 0.4, ib - 0.01, 2.38, 2.44); put('wood_dark', mid - 0.38, ib - 0.04, mid + 0.38, ib - 0.01, 1.25, 1.3);
    put('stucco_rose', mid - 0.25, ib - 0.035, mid + 0.25, ib - 0.025, 1.5, 2.2);
    block(mid - 1.05, t0, mid + 1.05, ib, 1.0);
    // the square table and two armchairs in front of it
    const tb = t0 - 1.2;
    put('lacquer_chestnut', mid - 0.45, tb - 0.45, mid + 0.45, tb + 0.45, 0.76, 0.82);
    for (const [da, db] of [[-0.4, -0.4], [0.36, -0.4], [-0.4, 0.36], [0.36, 0.36]]) put('lacquer_chestnut', mid + da, tb + db, mid + da + 0.05, tb + db + 0.05, 0, 0.76);
    for (const sx of [-1, 1]) {
      const ca = mid + sx * 0.85;
      put('lacquer_chestnut', ca - 0.28, tb - 0.25, ca + 0.28, tb + 0.25, 0.45, 0.5);
      for (const [da, db] of [[-0.26, -0.23], [0.22, -0.23], [-0.26, 0.19], [0.22, 0.19]]) put('lacquer_chestnut', ca + da, tb + db, ca + da + 0.04, tb + db + 0.04, 0, 0.45);
      put('lacquer_chestnut', ca - 0.28, tb + 0.2, ca + 0.28, tb + 0.25, 0.5, 1.05);
      for (const da of [-0.28, 0.24]) put('lacquer_chestnut', ca + da, tb - 0.25, ca + da + 0.04, tb + 0.25, 0.68, 0.72);
      block(ca - 0.28, tb - 0.25, ca + 0.28, tb + 0.25, 1.05);
    }
    block(mid - 0.45, tb - 0.45, mid + 0.45, tb + 0.45, 0.82);
    // along the other side: a tall cabinet, a washstand with its basin, two stools; a lantern hung from the boards overhead
    { const a1 = ir - 0.05, a0 = a1 - 0.5, b0 = fin + 1.0;
      put('lacquer_chestnut', a0, b0, a1, b0 + 1.0, 0, 1.9); put('gilt_bronze', a0 - 0.01, b0 + 0.45, a0, b0 + 0.55, 1.0, 1.1);
      block(a0, b0, a1, b0 + 1.0, 1.9);
      const wb = b0 + 1.6; for (const [da, db] of [[0, 0], [0.4, 0], [0, 0.4], [0.4, 0.4]]) put('wood_dark', a0 + 0.05 + da, wb + db, a0 + 0.09 + da, wb + db + 0.04, 0, 0.8);
      pot(a0 + 0.27, wb + 0.22, 0.8, 0.9, 'bronze');
      for (const db of [0, 0.7]) put('timber', a0 - 1.2, wb + 1.4 + db, a0 - 0.85, wb + 1.75 + db, 0, 0.45);
      const lp = W(L / 2, (fin + ib) / 2, 0); bag.add('lamp_paper', lathe([[0.07, 0], [0.17, 0.07], [0.19, 0.2], [0.16, 0.34], [0.07, 0.4], [0.001, 0.4]], 12, null, lp[0], y + Math.min(2.2, storey - 1.1), lp[2])); }
    // the bed at one side: a platform, posts and a canopy frame, curtains half drawn, a screen before it
    if (L > 3.8) {
      const a0 = il + 0.05, a1 = il + 1.4, b0 = fin + 0.6, b1 = fin + 2.6;
      put('lacquer_chestnut', a0, b0, a1, b1, 0.35, 0.5);
      put('cloth_white', a0 + 0.05, b0 + 0.05, a1 - 0.05, b1 - 0.05, 0.5, 0.56);
      for (const [a, b] of [[a0, b0], [a1 - 0.05, b0], [a0, b1 - 0.05], [a1 - 0.05, b1 - 0.05]]) put('lacquer_chestnut', a, b, a + 0.05, b + 0.05, 0, 2.1);
      put('lacquer_chestnut', a0, b0, a1, b1, 2.05, 2.12);
      put('cloth_red', a1 - 0.03, b0 + 0.06, a1 - 0.01, b0 + 0.55, 0.56, 2.04); put('cloth_red', a1 - 0.03, b1 - 0.55, a1 - 0.01, b1 - 0.06, 0.56, 2.04);
      put('lacquer_chestnut', a1 + 0.3, b0 - 0.1, a1 + 0.34, b0 + 1.1, 0, 1.7);
      block(a0, b0, a1, b1, 2.1);
    }
  }
}

/** water_steps: steps down from the street into a canal (a landing for boats and for washing) { a, b (along the wall), dir (toward the water), y, water }. */
function waterSteps(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, [dx, dz] = el.dir;
  const n = 6, rise = ((el.y ?? 0) - (el.water ?? -0.75) + 0.15) / n;
  for (let k = 0; k < n; k++) {
    const d0 = k * 0.32, d1 = (k + 1) * 0.32, yy = (el.y ?? 0) - k * rise;
    const p = [ax + dx * d0, az + dz * d0], q = [bx + dx * d1, bz + dz * d1];
    bag.add('granite_block', box(Math.min(p[0], q[0]), yy - rise - 0.4, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yy, Math.max(p[1], q[1])));
  }
  void ux; void uz; void col;
}

/** boat: a canal boat with a bamboo-mat awning { at, dir ([dx, dz]), len, y (water) }. */
function boat(el, { bag }) {
  const [x, z] = el.at, [dx, dz] = el.dir, L = el.len ?? 7, W = 1.25, y = el.y ?? -0.75;
  const nx = -dz, nz = dx;
  const P = (s, o, yy) => [x + dx * s + nx * o, yy, z + dz * s + nz * o];
  const hull = [], N = 10;
  for (let i = 0; i < N; i++) {
    const s0 = -L / 2 + L * i / N, s1 = -L / 2 + L * (i + 1) / N;
    const w0 = W * Math.sin(Math.PI * (0.08 + 0.84 * i / N)) ** 0.6, w1 = W * Math.sin(Math.PI * (0.08 + 0.84 * (i + 1) / N)) ** 0.6;
    const r0 = y + 0.55 + 0.25 * Math.pow(Math.abs(s0) / (L / 2), 2), r1 = y + 0.55 + 0.25 * Math.pow(Math.abs(s1) / (L / 2), 2);
    for (const sg of [-1, 1]) {
      const q = [P(s0, sg * w0, r0), P(s1, sg * w1, r1), P(s1, sg * w1 * 0.55, y - 0.25), P(s0, sg * w0 * 0.55, y - 0.25)];
      hull.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
    }
    const dk = [P(s0, -w0, r0 - 0.15), P(s1, -w1, r1 - 0.15), P(s1, w1, r1 - 0.15), P(s0, w0, r0 - 0.15)];
    hull.push(...dk[0], ...dk[1], ...dk[2], ...dk[0], ...dk[2], ...dk[3]);
  }
  bag.add('timber', fromTriangles(hull.concat(flipTris(hull))));
  // the awning: a half-barrel of matting over the middle
  const aw = [], M = 8;
  for (let i = 0; i < M; i++) {
    const a0 = Math.PI * i / M, a1 = Math.PI * (i + 1) / M;
    const q = [P(-L * 0.2, Math.cos(a0) * W * 0.95, y + 0.6 + Math.sin(a0) * 1.0), P(L * 0.18, Math.cos(a0) * W * 0.95, y + 0.6 + Math.sin(a0) * 1.0), P(L * 0.18, Math.cos(a1) * W * 0.95, y + 0.6 + Math.sin(a1) * 1.0), P(-L * 0.2, Math.cos(a1) * W * 0.95, y + 0.6 + Math.sin(a1) * 1.0)];
    aw.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
  }
  bag.add('reed_mat', fromTriangles(aw.concat(flipTris(aw))));
  // the stern oar (yuloh)
  const oar = [];
  beamTris(oar, P(L / 2 - 0.3, 0, y + 0.8), P(L / 2 + 1.8, 0.3, y - 0.2), 0.04, 0.06);
  bag.add('timber', fromTriangles(oar));
}

/** A flat paved area { rect, y, mat } that can also step down (th). */
function paving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add(el.mat || 'bluestone', box(x0, el.y - (el.th ?? 0.3), z0, x1, el.y, z1));
  col.floor(el.rect, el.y);
}

/** A path of pebble mosaic along a polyline { pts, w, y }. */
function path(el, { bag }) {
  const w = (el.w ?? 1.4) / 2, y = el.y ?? 0.17;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const t = [];
    beamTris(t, [el.pts[i][0], y - 0.12, el.pts[i][1]], [el.pts[i + 1][0], y - 0.12, el.pts[i + 1][1]], w, 0.14);
    bag.add(el.mat || 'pebble_mosaic', fromTriangles(t));
  }
}

/** A boat-shaped pavilion (shi fang): a deck on the water like a boat's bow, a hall, a two-storey stern on the shore. */
function stoneBoat(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, { bag, col } = ctx;
  const zc = (z0 + z1) / 2, W = (z1 - z0) / 2;
  // the hull of stone, in the water, its bow pointing east
  const hull = [];
  const P = (x, o, yy) => [x, yy, zc + o];
  for (let i = 0; i < 12; i++) {
    const xa = x0 + (x1 - x0) * i / 12, xb = x0 + (x1 - x0) * (i + 1) / 12;
    const wa = W * Math.min(1, (x1 - xa) / 3.5 + 0.35), wb = W * Math.min(1, (x1 - xb) / 3.5 + 0.35);
    for (const sg of [-1, 1]) hull.push(...P(xa, sg * wa, y), ...P(xb, sg * wb, y), ...P(xb, sg * wb * 0.8, -1.4), ...P(xa, sg * wa, y), ...P(xb, sg * wb * 0.8, -1.4), ...P(xa, sg * wa * 0.8, -1.4));
    hull.push(...P(xa, -wa, y), ...P(xb, -wb, y), ...P(xb, wb, y), ...P(xa, -wa, y), ...P(xb, wb, y), ...P(xa, wa, y));
  }
  bag.add('granite_block', fromTriangles(hull.concat(flipTris(hull))));
  col.floor([x0, zc - W * 0.8, x1 - 1.0, zc + W * 0.8], y);
  // the bow platform's open pavilion, the middle cabin, the two-storey stern (a tower)
  mingPavilion({ c: [x1 - 2.6, zc], shape: 'rect', w: 3.0, d: W * 1.6, y, H: 3.0, bench: true, open: [3] }, ctx);
  mingHall({ rect: [x0 + 3.6, zc - W * 0.75, x1 - 4.4, zc + W * 0.75], y, H: 3.1, front: 'e', four: true, roof: 'gable', plat: 0.01, eave: 0.6 }, ctx);
  mingHall({ rect: [x0, zc - W * 0.8, x0 + 3.6, zc + W * 0.8], y, H: 5.8, front: 'e', four: true, roof: 'xieshan', plat: 0.01, eave: 0.8 }, ctx);
}

/** A two-storey tower on the water (lou), its upper floor reached by a stair of rockery outside. */
function lou(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y;
  mingHall({ rect: el.rect, y, H: 6.4, front: 'e', four: true, roof: 'xieshan', plat: 0.4, eave: 1.1 }, ctx);
  // the upper floor's balcony rail and the pent roof between the floors
  const t = [];
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) beamTris(t, [a[0], y + 3.2, a[1]], [b[0], y + 3.2, b[1]], 0.5, 0.18);
  ctx.bag.add('lacquer_chestnut', fromTriangles(t));
  rectRoof({ c: [(x0 + x1) / 2, (z0 + z1) / 2], A: (x1 - x0) / 2 + 0.9, B: (z1 - z0) / 2 + 0.9, y: y + 3.0, rise: 0.5, kind: 'hip', sweep: 0.4, p: 1 }, ctx.bag);
}

export { rectRoof, pyramidRoof, roundWall, column, beamTris, flipTris, sheet, platform, latticeBay, mingHall, mingPavilion, mingWall, mingGallery };

registerStyle('ming', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ming_hall: withPal(mingHall),
    ming_pavilion: withPal(mingPavilion),
    ming_wall: withPal(mingWall),
    ming_gallery: withPal(mingGallery),
    ming_slab_bridge: withPal(slabBridge),
    ming_arch_bridge: withPal(archBridge),
    canal_wall: withPal(canalWall),
    water_rect: withPal(waterRect),
    water_cells: withPal(waterCells),
    house_jiangnan: withPal(houseJiangnan),
    water_steps: withPal(waterSteps),
    stone_boat: withPal(stoneBoat),
    taihu: withPal(taihu), lotus: withPal(lotus), boat: withPal(boat), paving: withPal(paving), path: withPal(path), lou: withPal(lou),
  },
  objects: {},
});
