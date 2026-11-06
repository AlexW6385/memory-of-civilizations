// Tibetan architecture (17th c.; docs/settlements/lhasa.md §4): blocks of stone with battered walls,
// limewashed white or red, their faces cut by rows of windows in black trapezoid frames under
// pleated cloth valances (shambu) and little cornices of beam ends, crowned with the dark frieze of
// tamarisk twigs (pembe) over a white ledge and under a white coping, the Red Palace's frieze doubled
// and set with gilt roundels; gilded roofs with vase finials and victory banners (gyaltsen); round
// bastions; zigzag stairs on the faces; the inscribed stone pillars (doring) with their canopies;
// flat-roofed whitewashed houses with prayer-flag poles.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof } from '../ming/index.js';
import { Shape, Path, ExtrudeGeometry } from '../../core/three.js';
import '../qing/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A one-sided quad a b c d turned to face along n (nx, nz in plan; ny optional). */
function face(bag, mat, n, a, b, c, d) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;      // (b − a) × (c − a): fromTriangles' normal
  const dot = cx * n[0] + cy * (n[2] ?? 0) + cz * n[1];
  bag.add(mat, fromTriangles(dot >= 0 ? [...a, ...b, ...c, ...a, ...c, ...d] : [...a, ...c, ...b, ...a, ...d, ...c]));
}
const SHAMBU = [['paint_blue', 'cloth_white'], ['cloth_red', 'cloth_white'], ['cloth_ochre', 'cloth_white'], ['cloth_red', 'cloth_ochre'], ['cloth_indigo', 'cloth_white'], ['paint_blue', 'cloth_white']];
/**
 * A Tibetan window on a wall face at (px, pz), u along the face (to the right seen from outside), n
 * out of it, its sill at y: the black trapezoid surround (wider at the foot, reaching below the sill),
 * the red frame with its lattice of mullions and a transom, the dark opening; above, the pleated
 * cloth valance (shambu) hanging from a cornice of two courses — a red board and a row of painted
 * beam ends under a dark sloping cap. s scales it; o.lights (1–3) widens it into a multi-light
 * window; o.k is the wall's batter (inset per metre of height): the window leans back with the face.
 */
function win(bag, [px, pz], [ux, uz], [nx, nz], y, s = 1, rand = Math.random, o = {}) {
  const k = o.k ?? 0, lights = o.lights ?? 1, n = [nx, nz];
  const P = (u, v, d) => [px + ux * u + nx * (d - k * v), y + v, pz + uz * u + nz * (d - k * v)];
  const Q = (mat, u0, v0, u1, v1, d) => face(bag, mat, n, P(u0, v0, d), P(u1, v0, d), P(u1, v1, d), P(u0, v1, d));
  const ow = 0.42 * s * (lights === 1 ? 1 : lights * 0.82), h = 1.5 * s;
  face(bag, 'lacquer_black', n, P(-ow - 0.55 * s, -0.22 * s, 0.03), P(ow + 0.55 * s, -0.22 * s, 0.03), P(ow + 0.24 * s, h + 0.06, 0.03), P(-ow - 0.24 * s, h + 0.06, 0.03));
  Q('limewash_red', -ow - 0.08, 0.04, ow + 0.08, h - 0.02, 0.05);
  Q('opening', -ow, 0.12, ow, h - 0.1, 0.065);
  const bars = lights * 3 - 1;
  for (let i = 1; i <= bars; i++) { const u = -ow + 2 * ow * i / (bars + 1); Q('limewash_red', u - 0.025, 0.12, u + 0.025, h - 0.1, 0.075); }
  Q('limewash_red', -ow, 0.6 * h - 0.025, ow, 0.6 * h + 0.025, 0.076);
  // the cornice: a red board, a row of painted beam ends standing out over the valance, a dark cap
  const vt = h + 0.12 * s, W = ow + 0.42 * s, dB = 0.27 * s;
  Q('limewash_red', -W - 0.04, vt, W + 0.04, vt + 0.1 * s, 0.1);
  Q('paint_dancheong', -W - 0.1, vt + 0.1 * s, W + 0.1, vt + 0.22 * s, dB);
  face(bag, 'paint_dancheong', [0, 0, -1], P(-W - 0.1, vt + 0.1 * s, 0.03), P(W + 0.1, vt + 0.1 * s, 0.03), P(W + 0.1, vt + 0.1 * s, dB), P(-W - 0.1, vt + 0.1 * s, dB));
  face(bag, 'lacquer_black', [nx, nz, 1], P(-W - 0.12, vt + 0.22 * s, dB + 0.02), P(W + 0.12, vt + 0.22 * s, dB + 0.02), P(W + 0.12, vt + 0.36 * s, 0.03), P(-W - 0.12, vt + 0.36 * s, 0.03));
  // the valance: a band, the pleated cloth, a stripe at its hem
  const [ca, cb] = o.cloth || SHAMBU[Math.floor(rand() * SHAMBU.length)];
  Q(ca, -W, vt - 0.07 * s, W, vt, 0.21 * s);
  const N = Math.max(3, Math.round(2 * W / 0.3)), v1 = vt - 0.07 * s, v2 = v1 - 0.27 * s, v3 = v2 - 0.06 * s;
  for (let i = 0; i < N; i++) {
    const u0 = -W + 2 * W * i / N, u1 = -W + 2 * W * (i + 1) / N, d0 = (0.17 + (i % 2) * 0.05) * s, d1 = (0.17 + ((i + 1) % 2) * 0.05) * s;
    face(bag, cb, n, P(u0, v2, d0), P(u1, v2, d1), P(u1, v1, d1), P(u0, v1, d0));
    face(bag, ca, n, P(u0, v3, d0), P(u1, v3, d1), P(u1, v2, d1), P(u0, v2, d0));
  }
}
/** The four faces of a rect, each as [start x, start z, end x, end z, nx, nz] with u to the right seen from outside. */
const FACES = (x0, z0, x1, z1) => ({ s: [x0, z1, x1, z1, 0, 1], n: [x1, z0, x0, z0, 0, -1], e: [x1, z1, x1, z0, 1, 0], w: [x0, z0, x0, z1, -1, 0] });
/**
 * Windows on the faces of a battered block whose wall runs from y0 to y1 with inset b at the top:
 * storeys of slightly varying height; columns at irregular spacing grouped into lit bays and blank
 * stretches; the lower walls nearly blind, a few slits; the windows growing larger storey by storey,
 * the top storeys densest, the odd pair joined into a two-light window. o: { from (lowest sill),
 * step, rowH, bay: [u0, u1] (fractions of the face where wide three-light windows stack in the upper
 * storeys), skip: [[xa, xb, ytop]] (no windows there below ytop: stairs in front) }.
 */
function windows(bag, rect, y0, y1, b, faces, rand, o = {}) {
  const H = y1 - y0, k = b / H, F = FACES(...rect);
  for (const f of faces) {
    const [ax, az, bx, bz, nx, nz] = F[f], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    const margin = b + 2.4, cols = [];
    for (let u = margin + rand() * 1.5; u < L - margin; u += (o.step ?? 3.1) * (0.8 + rand() * 0.55)) cols.push(u);
    const band = []; { let on = rand() < 0.7, left = 2 + Math.floor(rand() * 4); for (let i = 0; i < cols.length; i++) { band.push(on); if (--left <= 0) { on = !on; left = on ? 3 + Math.floor(rand() * 6) : 1 + Math.floor(rand() * 3); } } }
    const rows = []; for (let yy = Math.max(y0 + 3.2, o.from ?? y0); yy < y1 - 2.6; yy += (o.rowH ?? 3.3) * (0.9 + rand() * 0.25)) rows.push(yy);
    const bay = o.bay && f === 's' ? [o.bay[0] * L, o.bay[1] * L] : null;
    rows.forEach((yr, r) => {
      const fr = (yr - y0) / H, top = r === rows.length - 1, jit = (rand() - 0.5) * 0.7;
      let s = 0.62 + 0.5 * fr; if (top) s *= 1.08;
      const put = (u, yy, sc, lights = 1) => {
        const wx = ax + ux * u, wz = az + uz * u;
        if (o.skip && f === 's' && o.skip.some(([xa, xb, yt]) => wx > xa - 2 && wx < xb + 2 && yy < yt)) return;
        const ins = b * (yy - y0) / H - 0.01;
        win(bag, [wx - nx * ins, wz - nz * ins], [ux, uz], [nx, nz], yy, sc, rand, { k, lights });
      };
      if (bay && fr > 0.5) for (let u = bay[0] + 2.5; u < bay[1] - 2.5; u += 5.2) put(u, yr, s * 1.05, 3);
      for (let i = 0; i < cols.length; i++) {
        const u = cols[i] + jit;
        if (bay && fr > 0.5 && u > bay[0] - 1 && u < bay[1] + 1) continue;
        const p = o.dense ? (band[i] ? o.dense : 0.15) : fr < 0.3 ? 0.05 : fr < 0.55 ? (band[i] ? 0.45 : 0.05) : (band[i] ? 0.9 : 0.1);
        if (rand() >= p) continue;
        const yy = yr + (rand() - 0.5) * 0.2;
        if (o.dense) { put(u, yy, o.s ?? 0.8); continue; }
        if (fr < 0.3) { put(u, yy, 0.5); continue; }
        if (fr > 0.55 && band[i] && i + 1 < cols.length && band[i + 1] && cols[i + 1] - cols[i] < 3.8 && rand() < 0.12) { put((u + cols[i + 1] + jit) / 2, yy, s, 2); i++; continue; }
        put(u, yy, s);
      }
    });
  }
}
/**
 * A victory banner (gyaltsen) standing at (x, y, z): 'gilt' — the cylinder of beaten, gilded copper
 * with its rings and skirts, the parasol and the jewel on top; 'black' — the cylinder of black cloth
 * in flounces on a pole, a gilt trident-flame over it.
 */
function gyaltsen(bag, x, y, z, kind = 'gilt', s = 1) {
  const S = (p) => p.map(([r, h]) => [r * s, h * s]);
  if (kind === 'black') {
    bag.add('timber', lathe(S([[0.07, 0], [0.06, 3.3]]), 6, null, x, y, z));
    bag.add('cloth_black', lathe(S([[0.5, 0.9], [0.55, 0.96], [0.44, 1.55], [0.52, 1.62], [0.42, 2.2], [0.48, 2.27], [0.36, 2.9], [0.12, 3.05], [0.001, 3.08]]), 10, (th, i) => (i % 2 ? 1 : 1 + 0.06 * Math.cos(th * 9)), x, y, z));
    bag.add('gilt_bronze', lathe(S([[0.08, 3.05], [0.13, 3.2], [0.05, 3.35], [0.09, 3.5], [0.001, 3.75]]), 8, null, x, y, z));
    return;
  }
  bag.add('gilt_bronze', lathe(S([[0.08, 0], [0.08, 0.45], [0.36, 0.45], [0.36, 0.58], [0.29, 0.63], [0.29, 1.45], [0.38, 1.5], [0.38, 1.62], [0.31, 1.66], [0.31, 2.15], [0.44, 2.22], [0.44, 2.3], [0.12, 2.42], [0.1, 2.6], [0.17, 2.72], [0.1, 2.88], [0.001, 3.05]]), 12, (th, i) => (i >= 5 && i <= 9 ? 1 + 0.05 * Math.cos(th * 12) : 1), x, y, z));
}
/** Gilt roundels (melong) along the frieze of a face: discs standing out of it. */
function roundels(bag, [ax, az, bx, bz, nx, nz], y, d, r, step = 3.6) {
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.floor(L / step));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) * L / n, cx = ax + ux * u + nx * d, cz = az + uz * u + nz * d, t = [];
    for (let j = 0; j < 10; j++) {
      const a0 = j / 10 * Math.PI * 2, a1 = (j + 1) / 10 * Math.PI * 2;
      t.push(cx, y, cz, cx + ux * Math.cos(a0) * r, y + Math.sin(a0) * r, cz + uz * Math.cos(a0) * r, cx + ux * Math.cos(a1) * r, y + Math.sin(a1) * r, cz + uz * Math.cos(a1) * r);
    }
    const g = []; for (let q = 0; q < t.length; q += 9) {               // turn each triangle to face out (n)
      const e1 = [t[q + 3] - t[q], t[q + 4] - t[q + 1], t[q + 5] - t[q + 2]], e2 = [t[q + 6] - t[q], t[q + 7] - t[q + 1], t[q + 8] - t[q + 2]];
      const cxn = e1[1] * e2[2] - e1[2] * e2[1], czn = e1[0] * e2[1] - e1[1] * e2[0];
      if (cxn * nx + czn * nz >= 0) g.push(...t.slice(q, q + 9)); else g.push(...t.slice(q, q + 3), ...t.slice(q + 6, q + 9), ...t.slice(q + 3, q + 6));
    }
    bag.add('gilt_bronze', fromTriangles(g));
  }
}
/**
 * dzong: a battered block { rect, y0, y1, batter, mat, split + low (the wall below `split` in `low`:
 * the Red Palace on its white base), windows ('nesw' faces), win (options for windows()), pembe
 * (frieze depth; ≥ 2.2 doubles it), gilt (roundels on the frieze), banners ('gilt' | 'black' at the
 * roof's corners), seed }. From the top: the white coping, the pembe frieze standing out of the wall,
 * the white ledge under it, the battered wall.
 */
function dzong(el, { bag, col }) {
  const rand = rng(el.seed || 1), rect = el.rect, [x0, z0, x1, z1] = rect, y0 = el.y0, y1 = el.y1, mat = el.mat || 'limewash_white';
  const pe = el.pembe ?? 1.8, cap = el.cap ?? (pe > 1 ? 0.4 : 0.3), yw = y1 - pe - cap, b = el.batter ?? (yw - y0) * 0.08;
  const r1 = [x0 + b, z0 + b, x1 - b, z1 - b];
  if (el.split && el.split > y0 + 1 && el.split < yw - 1) {
    const bs = b * (el.split - y0) / (yw - y0);
    bag.add(el.low || 'limewash_white', frustum(rect, y0, el.split, bs, bs, bs, bs));
    bag.add(mat, frustum([x0 + bs, z0 + bs, x1 - bs, z1 - bs], el.split, yw, b - bs, b - bs, b - bs, b - bs));
  } else bag.add(mat, frustum(rect, y0, yw, b, b, b, b));
  const grow = (r, m) => [r[0] - m, r[1] - m, r[2] + m, r[3] + m];
  const bx = (m, r, ya, yb) => bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3]));
  if (pe > 0) {
    const po = pe > 1 ? 0.12 : 0.06, led = pe > 1 ? 0.2 : 0.1;
    bx('limewash_white', grow(r1, led), yw - 0.14, yw + 0.06);
    if (pe >= 2.2) {
      const m = yw + 0.06 + (pe - 0.06) * 0.42;
      bx('pembe', grow(r1, po), yw + 0.06, m - 0.12); bx('limewash_white', grow(r1, po + 0.07), m - 0.12, m + 0.12); bx('pembe', grow(r1, po), m + 0.12, y1 - cap);
      if (el.gilt) { const F = FACES(...r1), yc = (m + 0.12 + y1 - cap) / 2, rr = Math.min(0.42, (y1 - cap - m) * 0.3); for (const f of el.windows || 's') roundels(bag, F[f], yc, po + 0.025, rr); }
    } else {
      bx('pembe', grow(r1, po), yw + 0.06, y1 - cap);
      if (el.gilt) { const F = FACES(...r1), yc = (yw + y1 - cap) / 2 + 0.03, rr = Math.min(0.36, pe * 0.22); for (const f of el.windows || 's') roundels(bag, F[f], yc, po + 0.025, rr); }
    }
    bx(el.capMat || 'limewash_white', grow(r1, led), y1 - cap, y1);
  } else bx(el.capMat || mat, grow(r1, 0.12), yw, y1);
  col.rect([x0 + b / 2, z0 + b / 2, x1 - b / 2, z1 - b / 2], y0, y1); col.floor(r1, y1);
  if (el.windows) windows(bag, rect, y0, yw, b, el.windows, rand, { from: el.wy, ...(el.win || {}) });
  if (el.banners) for (const [x, z] of [[r1[0], r1[1]], [r1[2], r1[1]], [r1[0], r1[3]], [r1[2], r1[3]]]) gyaltsen(bag, x + Math.sign((r1[0] + r1[2]) / 2 - x) * 0.6, y1, z + Math.sign((r1[1] + r1[3]) / 2 - z) * 0.6, el.banners, el.bannerS ?? 1);
}
/**
 * golden_roof: a gilded hip-and-gable roof { rect, y } on a short drum — red wall under a band of
 * pembe — with a gilt vase finial (ganjira) on the ridge and victory banners at the drum's corners.
 */
function goldenRoof(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, w = x1 - x0, d = z1 - z0, az = d > w;
  bag.add('limewash_red', box(x0, y, z0, x1, y + 1.3, z1)); bag.add('pembe', box(x0 - 0.08, y + 1.3, z0 - 0.08, x1 + 0.08, y + 2.2, z1 + 0.08));
  col.rect([x0, z0, x1, z1], y, y + 2.2);
  const A = (az ? d : w) / 2 + 1.2, B = (az ? w : d) / 2 + 1.2, rise = Math.min(w, d) * 0.4, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  rectRoof({ c: [cx, cz], A, B, y: y + 2.1, rise, kind: 'xieshan', sweep: 0.8, p: 1.4, alongZ: az, curl: true, mat: 'gilt_bronze', soffit: 'limewash_red' }, bag);
  const top = y + 2.1 + rise + 0.28, gs = Math.min(1.4, Math.min(w, d) / 7);
  bag.add('gilt_bronze', lathe([[0.32, 0], [0.42, 0.12], [0.3, 0.3], [0.5, 0.75], [0.52, 1.0], [0.3, 1.35], [0.18, 1.5], [0.28, 1.62], [0.12, 1.8], [0.16, 2.0], [0.06, 2.3], [0.001, 2.6]].map(([r, h]) => [r * gs, h * gs]), 12, null, cx, top, cz));
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) gyaltsen(bag, x, y + 2.2, z, 'gilt', 0.8);
}
/** round_tower: a round battered bastion { c, r, y0, y1, batter, pembe, seed } with a few windows on its outer side. */
function roundTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, y0 = el.y0, H = el.y1 - y0, pe = el.pembe ?? 1.2, cap = 0.4, yw = H - pe - cap, b = el.batter ?? yw * 0.1, rt = r - b, rand = rng(el.seed || 3);
  bag.add('limewash_white', lathe([[r, 0], [rt, yw], [0.001, yw]], 36, null, x, y0, z));
  bag.add('limewash_white', lathe([[rt - 0.05, yw - 0.14], [rt + 0.2, yw - 0.14], [rt + 0.2, yw + 0.06], [0.001, yw + 0.06]], 36, null, x, y0, z));
  bag.add('pembe', lathe([[rt + 0.12, yw + 0.06], [rt + 0.12, H - cap]], 36, null, x, y0, z));
  bag.add('limewash_white', lathe([[rt + 0.12, H - cap], [rt + 0.2, H - cap], [rt + 0.2, H], [0.001, H]], 36, null, x, y0, z));
  col.circle(x, z, r, y0, el.y1); col.floor([x - rt * 0.7, z - rt * 0.7, x + rt * 0.7, z + rt * 0.7], el.y1);
  const k = b / yw, a0 = el.from ?? 0.15, a1 = el.to ?? Math.PI - 0.15;
  for (let v = Math.max(4, yw * 0.45); v < yw - 2.4; v += 3.4) for (let a = a0 + rand() * 0.3; a < a1; a += 0.42 + rand() * 0.25) {
    if (rand() < 0.35) continue;
    const nx = Math.cos(a), nz = Math.sin(a), rr = r - k * v + 0.04;
    win(bag, [x + nx * rr, z + nz * rr], [nz, -nx], [nx, nz], y0 + v, 0.6 + 0.4 * v / yw, rand, { k });
  }
}
/**
 * zigzag: the stairs up the face of a terrace { x0, x1, zf (the face they lean on, they stand south
 * of it), w (width of each flight), n (flights), y1 (top), land (landing length), start ('w' | 'e':
 * the end the lowest flight starts from), bridge (how far the top landing reaches north over the
 * terrace's edge) }. The lowest flight runs outermost; each landing turns back north onto the next.
 * Treads of flagstone between white parapets; the solid stair walls whitewashed.
 */
function zigzag(el, { bag, col }) {
  const { x0, x1, zf, w, n, y1 } = el, land = el.land ?? 6, T = 0.45, ph = 1.0;
  for (let k = 0; k < n; k++) {
    const zA = zf + (n - 1 - k) * w, zB = zA + w, h0 = y1 * k / n, h1 = y1 * (k + 1) / n;
    const east = (k % 2 === 0) === ((el.start ?? 'w') === 'w');
    const s0 = east ? [x0, x0 + land] : [x1 - land, x1], fl = [x0 + land, x1 - land], e0 = east ? [x1 - land, x1] : [x0, x0 + land];
    const zi = zB - T;                                                             // the walking side of the parapet
    // the start landing (on the ground for the lowest flight) and the end landing
    if (k > 0) { bag.add('limewash_white', box(s0[0], 0, zA, s0[1], h0 - 0.1, zB)); bag.add('flagstone', box(s0[0], h0 - 0.1, zA, s0[1], h0, zi)); col.rect([s0[0], zA, s0[1], zB], 0, h0 - 0.3); col.floor([s0[0], zA, s0[1], zi], h0); }
    bag.add('limewash_white', box(e0[0], 0, zA, e0[1], h1 - 0.1, zB)); bag.add('flagstone', box(e0[0], h1 - 0.1, zA, e0[1], h1, zi)); col.rect([e0[0], zA, e0[1], zB], 0, h1 - 0.3); col.floor([e0[0], zA, e0[1], zi], h1);
    // the flight: steps of 0.16 m
    const ns = Math.max(1, Math.round((h1 - h0) / 0.16)), len = fl[1] - fl[0];
    // the stair's solid wall under the flight, its top following the slope; the steps on it inside the parapet
    { const ya = h0 - 0.3, yb = h1 - 0.3, [xa, xb] = east ? fl : [fl[1], fl[0]], t = [];
      const B = [[xa, 0, zA], [xb, 0, zA], [xb, 0, zB], [xa, 0, zB]], U = [[xa, ya, zA], [xb, yb, zA], [xb, yb, zB], [xa, ya, zB]];
      const q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
      q(U[0], U[1], U[2], U[3]); q(B[0], U[0], U[1], B[1]); q(B[3], U[3], U[2], B[2]); q(B[0], B[3], U[3], U[0]); q(B[1], U[1], U[2], B[2]);
      bag.add('limewash_white', fromTriangles(fixOut(t))); }
    for (let i = 0; i < ns; i++) {
      const a = east ? fl[0] + len * i / ns : fl[1] - len * (i + 1) / ns, bq = a + len / ns, yy = h0 + (h1 - h0) * (i + 1) / ns, yp = h0 + (h1 - h0) * i / ns;
      bag.add('limewash_white', box(a, yp - 0.3, zA, bq, yy - 0.08, zi)); bag.add('flagstone', box(a, yy - 0.08, zA, bq, yy, zi));
    }
    col.ramp([fl[0], zA, fl[1], zi], h0, h1, east ? 'e' : 'w'); if (k > 0) col.rect([fl[0], zA, fl[1], zB], 0, h0 - 0.3);
    // the outer parapet: along the flight and the end landing (the start landing is open to the flight below it)
    const lo = (x) => { const t = Math.max(0, Math.min(1, ((east ? x - fl[0] : fl[1] - x)) / len)); return h0 + (h1 - h0) * t; };
    const xs = east ? [fl[0], fl[1], e0[1]] : [fl[1], fl[0], e0[0]];
    const par = [];
    for (let i = 0; i + 1 < xs.length; i++) {
      const a = xs[i], c = xs[i + 1], ya = lo(a), yc = lo(c);
      const P = [[a, ya - 0.3, zi], [c, yc - 0.3, zi], [c, yc - 0.3, zB], [a, ya - 0.3, zB]], U = P.map(([px, py, pz]) => [px, py + ph + 0.3, pz]);
      const q = (p1, p2, p3, p4) => par.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
      q(U[0], U[1], U[2], U[3]); q(P[0], P[1], U[1], U[0]); q(P[3], U[3], U[2], P[2]); q(P[0], U[0], U[3], P[3]); q(P[1], P[2], U[2], U[1]);
      col.segment([a, (zi + zB) / 2], [c, (zi + zB) / 2], T, Math.min(ya, yc) - 0.3, Math.max(ya, yc) + ph);
    }
    bag.add('limewash_white', fromTriangles(fixOut(par)));
    // the end walls across the band at the outer ends of the landings
    const endX = east ? e0[1] - T : e0[0], top = k === n - 1 && el.bridge;
    { bag.add('limewash_white', box(endX, h1, zA, endX + T, h1 + ph, zi)); col.rect([endX, zA, endX + T, zi], h1 - 0.3, h1 + ph); }
    if (k > 0) { const sx = east ? s0[0] : s0[1] - T; bag.add('limewash_white', box(sx, h0, zA, sx + T, h0 + ph, zB)); col.rect([sx, zA, sx + T, zB], h0 - 0.3, h0 + ph); }
    // the top landing reaches north over the terrace's battered edge onto its roof
    if (top) { bag.add('flagstone', box(e0[0], h1 - 0.5, zf - el.bridge, e0[1], h1, zA)); col.floor([e0[0], zf - el.bridge, e0[1], zA], h1); }
  }
}
/** Turn every quad-pair triangle of a box-like prism list outward from its own prism's centre (each 30 numbers = 5 quads). */
function fixOut(t) {
  const out = [];
  for (let p = 0; p < t.length; p += 90) {
    const seg = t.slice(p, p + 90); let cx = 0, cy = 0, cz = 0; for (let i = 0; i < seg.length; i += 3) { cx += seg[i]; cy += seg[i + 1]; cz += seg[i + 2]; } const m = seg.length / 3; cx /= m; cy /= m; cz /= m;
    for (let i = 0; i < seg.length; i += 9) {
      const a = seg.slice(i, i + 3), b = seg.slice(i + 3, i + 6), c = seg.slice(i + 6, i + 9);
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const mm = [(a[0] + b[0] + c[0]) / 3 - cx, (a[1] + b[1] + c[1]) / 3 - cy, (a[2] + b[2] + c[2]) / 3 - cz];
      if (nn[0] * mm[0] + nn[1] * mm[1] + nn[2] * mm[2] >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
    }
  }
  return out;
}
/**
 * doring: an inscribed stone pillar { at, y, h } — a brick-laid base, three stone steps, the tall
 * square shaft tapering a little, a stone canopy (slab and low hipped cap) and the carved finial of
 * the flaming wish-granting jewel.
 */
function doring(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 7.5;
  const sq = (m, hw, ya, yb, tw = hw) => bag.add(m, frustum([x - hw, z - hw, x + hw, z + hw], ya, yb, hw - tw, hw - tw, hw - tw, hw - tw));
  sq('brick', 2.6, y - 0.3, y + 0.3);
  sq('granite_grey', 1.8, y + 0.3, y + 0.62); sq('granite_grey', 1.4, y + 0.62, y + 0.94); sq('granite_grey', 1.0, y + 0.94, y + 1.26);
  const yb = y + 1.26, yt = yb + h;
  sq('granite_grey', 0.44, yb, yt, 0.34);
  sq('granite_grey', 0.5, yt, yt + 0.22);                                   // a collar under the canopy
  sq('granite_grey', 0.95, yt + 0.22, yt + 0.48);                           // the canopy slab
  sq('granite_grey', 0.95, yt + 0.48, yt + 1.05, 0.18);                    // its low hipped cap
  bag.add('granite_grey', lathe([[0.16, 0], [0.24, 0.12], [0.2, 0.3], [0.28, 0.5], [0.3, 0.68], [0.2, 0.9], [0.1, 1.05], [0.04, 1.25], [0.001, 1.38]], 10, null, x, yt + 1.03, z));
  col.rect([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y - 0.3, y + 0.3); col.floor([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y + 0.3);
  col.rect([x - 1.8, z - 1.8, x + 1.8, z + 1.8], y + 0.3, y + 1.26);
  col.rect([x - 0.5, z - 0.5, x + 0.5, z + 0.5], yb, yt + 2.4);
}
/** sangkhang: a whitewashed incense burner { at, y, rot } — a square plinth, a bulbous oven with its dark mouth, a small chimney and finial. */
function sangkhang(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, ca = Math.cos(a), sa = Math.sin(a);
  bag.add('limewash_white', box(x - 0.8, y, z - 0.8, x + 0.8, y + 0.9, z + 0.8));
  bag.add('limewash_white', lathe([[0.62, 0], [0.7, 0.35], [0.66, 0.8], [0.4, 1.15], [0.22, 1.25], [0.22, 1.6], [0.3, 1.65], [0.001, 1.72]], 14, null, x, y + 0.9, z));
  const mx = x + sa * 0.64, mz = z + ca * 0.64;
  face(bag, 'opening', [sa, ca], [mx - ca * 0.22, y + 1.15, mz + sa * 0.22], [mx + ca * 0.22, y + 1.15, mz - sa * 0.22], [mx + ca * 0.22, y + 1.55, mz - sa * 0.22], [mx - ca * 0.22, y + 1.55, mz + sa * 0.22]);
  col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], y, y + 2.6);
}
/** stone_heap: a heap of stones { at, y, r } piled by passers-by. */
function stoneHeap(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 1.1, rand = rng(el.seed || 9);
  bag.add('rock_boulder', lathe([[r, -0.05], [r * 0.85, 0.25], [r * 0.55, 0.55], [r * 0.2, 0.8], [0.001, 0.86]], 9, (th, i) => 1 + 0.12 * Math.sin(th * 5 + i * 1.7), x, y, z));
  for (let i = 0; i < 9; i++) { const t = rand() * 6.28, d = r * (0.5 + rand() * 0.45), s = 0.12 + rand() * 0.14; const px = x + Math.cos(t) * d, pz = z + Math.sin(t) * d, py = y + 0.62 * (1 - d / r) + 0.05; bag.add('rock_boulder', lathe([[s, -s * 0.4], [s * 1.1, 0], [s * 0.8, s * 0.5], [0.001, s * 0.7]], 6, null, px, py, pz)); }
  col.circle(x, z, r, y, y + 0.9);
}
/**
 * shol_gate: a gatehouse in Shöl's wall { c, along ('x': the wall runs along x, the passage along z;
 * 'z' the other way), w (passage), d (depth through the wall), len (along the wall), h, seed }: two
 * battered piers and the upper storey over the passage, windows facing both ways, a timber lintel.
 */
function sholGate(el, ctx) {
  const [cx, cz] = el.c, w = el.w ?? 4.5, d = el.d ?? 9, len = el.len ?? 16, h = el.h ?? 10, ax = el.along !== 'z', h1 = 4.4;
  const R = (u0, u1, v0, v1) => (ax ? [cx + u0, cz + v0, cx + u1, cz + v1] : [cx + v0, cz + u0, cx + v1, cz + u1]);
  const fw = ax ? 'ns' : 'ew', b = 0.6;
  dzong({ rect: R(-len / 2, -w / 2, -d / 2, d / 2), y0: -0.5, y1: h, batter: b, pembe: 0.9, windows: fw, win: { step: 3.0, rowH: 3.0, from: 4.6, dense: 0.8 }, seed: el.seed || 5 }, ctx);
  dzong({ rect: R(w / 2, len / 2, -d / 2, d / 2), y0: -0.5, y1: h, batter: b, pembe: 0.9, windows: fw, win: { step: 3.0, rowH: 3.0, from: 4.6, dense: 0.8 }, seed: (el.seed || 5) + 1 }, ctx);
  // the storey over the passage: set in by the piers' batter at its height
  const bi = b * (h1 + 0.5) / (h + 0.5) + 0.02;
  dzong({ rect: R(-w / 2 - 0.3, w / 2 + 0.3, -d / 2 + bi, d / 2 - bi), y0: h1, y1: h, batter: b - bi, pembe: 0.9, windows: '', seed: 3 }, ctx);
  for (const s of [-1, 1]) {
    const v = s * (d / 2 - bi + 0.02);
    ctx.bag.add('timber', box(...(ax ? [cx - w / 2 - 0.4, h1 - 0.35, cz + v - (s < 0 ? 0.3 : 0), cx + w / 2 + 0.4, h1, cz + v + (s > 0 ? 0.3 : 0)] : [cx + v - (s < 0 ? 0.3 : 0), h1 - 0.35, cz - w / 2 - 0.4, cx + v + (s > 0 ? 0.3 : 0), h1, cz + w / 2 + 0.4])));
    const nrm = ax ? [0, s] : [s, 0], u = ax ? [s, 0] : [0, -s], kk = (b - bi) / (h - 0.9 - 0.3 - h1), vi = v - s * kk * 1.6;
    win(ctx.bag, ax ? [cx, cz + vi] : [cx + vi, cz], u, nrm, h1 + 1.6, 1.0, rng(7 + s), { k: kk, lights: 2 });
  }
}
/** banner_pole: a prayer-flag pole { c, y, h }. */
function bannerPole(el, { bag }) { const [x, z] = el.c; bag.add('timber', lathe([[0.08, 0], [0.06, el.h ?? 4]], 6, null, x, el.y ?? 0, z)); bag.add('paint_blue', box(x, (el.y ?? 0) + (el.h ?? 4) - 1.6, z - 0.02, x + 0.9, (el.y ?? 0) + (el.h ?? 4) - 0.2, z + 0.02)); }
/** tibetan_house: { rect, seed, y }: a whitewashed house of two or three storeys, battered a little, black-framed windows, a parapet with a dark band, a flag pole on the roof. */
function house(el, ctx) {
  const rand = rng(el.seed || 1), st = rand() < 0.5 ? 2 : 3, y = el.y ?? 0;
  const H = st * 3, b = 0.35, pe = 0.6, cap = 0.3, yw = y + H - pe - cap, k = b / (yw - y + 0.5);
  dzong({ rect: el.rect, y0: y - 0.5, y1: y + H, batter: b, mat: 'limewash_white', windows: '', pembe: pe, seed: el.seed }, ctx);
  const [x0, z0, x1, z1] = el.rect, F = FACES(x0, z0, x1, z1);
  // windows on each storey of the street sides, a door with its black frame below on the front
  for (const f of 'snew') {
    const [ax, az, bx, bz, nx, nz] = F[f], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.floor(L / 3));
    for (let s = 0; s < st; s++) for (let i = 0; i < n; i++) {
      if (s === 0 && (f !== 's' || rand() < 0.6)) continue;
      if (f === 's' && s === 0 && Math.abs((i + 0.5) * L / n - L / 2) < 1.6) continue;
      const top = s === st - 1, yy = y + s * 3 + (top ? 0.55 : 0.9), ins = k * (yy - y + 0.5) - 0.01, u = (i + 0.5) * L / n;
      win(ctx.bag, [ax + ux * u - nx * ins, az + uz * u - nz * ins], [ux, uz], [nx, nz], yy, top ? 0.8 : 0.72, rand, { k });
    }
    if (f === 's') { const px = (x0 + x1) / 2, pz = z1; ctx.bag.add('lacquer_black', box(px - 0.75, y, pz - 0.02, px + 0.75, y + 2.3, pz + 0.06)); ctx.bag.add('wood_painted', box(px - 0.55, y + 0.03, pz + 0.05, px + 0.55, y + 2.1, pz + 0.08)); }
  }
  bannerPole({ c: [x0 + 1, z0 + 1], y: y + H, h: 3.5 }, ctx);
  // strings of prayer flags in the five colours, from the pole to the far corners of the roof
  const FL = ['paint_blue', 'cloth_white', 'cloth_red', 'cloth_green', 'glaze_yellow'];
  for (const [ex, ez] of [[x1 - 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4]]) {
    const ax = x0 + 1, az = z0 + 1, ay = y + H + 3.3, ey = y + H + 0.9, L = Math.hypot(ex - ax, ez - az), n = Math.floor(L / 0.45);
    for (let i = 1; i < n; i++) { const t = i / n, px = ax + (ex - ax) * t, pz = az + (ez - az) * t, py = ay + (ey - ay) * t - Math.sin(Math.PI * t) * 0.4, ux = (ex - ax) / L * 0.14, uz = (ez - az) / L * 0.14; ctx.bag.add(FL[i % 5], fromTriangles([px - ux, py, pz - uz, px + ux, py, pz + uz, px + ux, py - 0.32, pz + uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px - ux, py - 0.32, pz - uz, px - ux, py, pz - uz, px + ux, py - 0.32, pz + uz, px + ux, py, pz + uz, px - ux, py, pz - uz, px - ux, py - 0.32, pz - uz, px + ux, py - 0.32, pz + uz])); }
  }
}


/**
 * triple_stair: the long, steep triple stair up a battered face into the White Palace from the
 * Deyang Shar (Richardson: "entered by a long, steep, triple stair") { xf (the foot, east), xt (the
 * top, west), zc, y0, y1, w (each flight), face: [x at y0, x at y1] of the wall it climbs to }:
 * three flights side by side between whitewashed walls on a solid whitewashed base, treads of stone;
 * at the top a landing running into the wall, a porch of two red pillars under a beam of painted
 * ends and a pembe band, the door hung with a black yak-hair curtain bordered in white.
 */
function tripleStair(el, { bag, col }) {
  const { xf, xt, zc, y0, y1 } = el, w = el.w ?? 2.2, T = 0.45, n = 3, W = n * w + (n + 1) * T, z0 = zc - W / 2, run = xf - xt;
  const ns = Math.max(4, Math.round((y1 - y0) / 0.27)), ph = 1.0, land = el.land ?? 4.5, xl = xt - land;
  // the solid base under the flights, its top following the slope; the landing block at the top
  const t = [], q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
  { const ya = y0 - 0.4, yb = y1 - 0.4, B = [[xt, y0 - 1, z0], [xf, y0 - 1, z0], [xf, y0 - 1, z0 + W], [xt, y0 - 1, z0 + W]], U = [[xt, yb, z0], [xf, ya, z0], [xf, ya, z0 + W], [xt, yb, z0 + W]];
    q(U[0], U[3], U[2], U[1]); q(B[0], B[1], U[1], U[0]); q(B[3], U[3], U[2], B[2]); q(B[1], B[2], U[2], U[1]); q(B[0], U[0], U[3], B[3]); }
  bag.add('limewash_white', fromTriangles(fixOut(t)));
  bag.add('limewash_white', box(xl, y0 - 1, z0, xt, y1 - 0.1, z0 + W)); bag.add('flagstone', box(xl, y1 - 0.1, z0 + T, xt, y1, z0 + W - T));
  col.rect([xl, z0, xt, z0 + W], y0 - 1, y1 - 0.3); col.floor([xl, z0 + T, xt, z0 + W - T], y1);
  // the steps of each flight
  for (let f = 0; f < n; f++) {
    const za = z0 + T + f * (w + T), zb = za + w;
    for (let i = 0; i < ns; i++) {
      const xa = xf - run * (i + 1) / ns, xb = xf - run * i / ns, yy = y0 + (y1 - y0) * (i + 1) / ns;
      bag.add('limewash_white', box(xa, yy - 0.45, za, xb, yy - 0.07, zb)); bag.add('flagstone', box(xa - 0.03, yy - 0.07, za, xb, yy, zb));
    }
    col.ramp([xt, za, xf, zb], y0, y1, 'w');
  }
  // the four walls between and beside the flights, their tops a metre over the treads, stepped down at the foot
  const par = [];
  for (let k = 0; k <= n; k++) {
    const za = z0 + k * (w + T), zb = za + T, ya = y0 + ph, yb = y1 + ph;
    const P = [[xt, y0 - 0.4, za], [xf, y0 - 0.4, za], [xf, y0 - 0.4, zb], [xt, y0 - 0.4, zb]], U = [[xt, yb, za], [xf, ya, za], [xf, ya, zb], [xt, yb, zb]];
    const qq = (a, b, c, d) => par.push(...a, ...b, ...c, ...a, ...c, ...d);
    qq(U[0], U[3], U[2], U[1]); qq(P[0], P[1], U[1], U[0]); qq(P[3], U[3], U[2], P[2]); qq(P[1], P[2], U[2], U[1]); qq(P[0], U[0], U[3], P[3]);
    col.segment([xt, za + T / 2], [xf, za + T / 2], T, y0, yb);
    // a dark band along the top of each wall
    { const S = [], qs = (a, b, c, d) => S.push(...a, ...b, ...c, ...a, ...c, ...d), e = 0.03;
      const L = [[xt, yb - 0.02, za - e], [xf, ya - 0.02, za - e], [xf, ya - 0.02, zb + e], [xt, yb - 0.02, zb + e]], V = L.map(([x, y, z]) => [x, y + 0.1, z]);
      qs(V[0], V[3], V[2], V[1]); qs(L[0], L[1], V[1], V[0]); qs(L[3], V[3], V[2], L[2]); qs(L[1], L[2], V[2], V[1]); qs(L[0], V[0], V[3], L[3]);
      bag.add('lacquer_black', fromTriangles(fixOut(S))); }
  }
  bag.add('limewash_white', fromTriangles(fixOut(par)));
  // the porch on the landing: two pillars, a beam with painted ends, a band of pembe, a cap; the curtained door
  const xp = xl + land * 0.62, hp = 3.4, pz = [z0 + W * 0.28, z0 + W * 0.72];
  for (const z of pz) { bag.add('lacquer_red', box(xp - 0.17, y1, z - 0.17, xp + 0.17, y1 + hp, z + 0.17)); bag.add('paint_dancheong', box(xp - 0.32, y1 + hp, z - 0.5, xp + 0.32, y1 + hp + 0.2, z + 0.5)); col.rect([xp - 0.17, z - 0.17, xp + 0.17, z + 0.17], y1, y1 + hp); }
  bag.add('lacquer_red', box(xp - 0.3, y1 + hp + 0.2, z0 + 0.3, xp + 0.3, y1 + hp + 0.5, z0 + W - 0.3));
  for (let k = 0; k < 14; k++) { const z = z0 + 0.6 + (W - 1.2) * k / 13; bag.add('paint_dancheong', box(xp + 0.3, y1 + hp + 0.52, z - 0.08, xp + 0.55, y1 + hp + 0.66, z + 0.08)); }
  bag.add('lacquer_red', box(xp - 0.3, y1 + hp + 0.5, z0 + 0.3, xp + 0.3, y1 + hp + 0.7, z0 + W - 0.3));
  bag.add('pembe', box(xl, y1 + hp + 0.7, z0 + 0.1, xp + 0.62, y1 + hp + 1.5, z0 + W - 0.1));
  bag.add('limewash_white', box(xl, y1 + hp + 1.5, z0, xp + 0.75, y1 + hp + 1.75, z0 + W));
  for (const [za, zb] of [[z0 + 0.1, z0 + T + 0.1], [z0 + W - T - 0.1, z0 + W - 0.1]]) { bag.add('limewash_white', box(xl, y1, za, xp - 0.4, y1 + hp + 0.7, zb)); col.rect([xl, za, xp - 0.4, zb], y1, y1 + hp); }
  const xd = xl + 0.5;
  bag.add('opening', box(xl, y1, zc - 1.1, xd, y1 + 2.8, zc + 1.1));
  bag.add('cloth_black', box(xd, y1 + 0.2, zc - 1.3, xd + 0.06, y1 + 3.0, zc + 1.3));
  for (const [za, zb, ya, yb] of [[zc - 1.3, zc + 1.3, y1 + 2.82, y1 + 3.0], [zc - 1.3, zc - 1.18, y1 + 0.2, y1 + 2.82], [zc + 1.18, zc + 1.3, y1 + 0.2, y1 + 2.82], [zc - 0.4, zc + 0.4, y1 + 1.3, y1 + 1.7]]) bag.add('cloth_white', box(xd + 0.06, ya, za, xd + 0.1, yb, zb));
}

/**
 * koku: the great appliqué banner hung down the palace's lower face on the day of the Golden
 * Procession (Richardson: "a great appliqué banner which covers the lower face of the Potala for a
 * space of some 75 by 40 feet", in two panels, one rather larger than the other, each a huge figure
 * among many deities and bodhisattvas) { panels: [[x0, x1], …] (the larger first), y0, y1 (its
 * foot and its top), z0, fy0, k: the wall face it lies on, at z0 where y = fy0, leaning back k per metre }. Each panel a field of indigo in
 * borders of red and ochre, the pleated valance and the pole at the top, a ground of green at the
 * foot; the seated Buddha in his aureole on a lotus throne, rows of small seated figures round him.
 */
function koku(el, { bag }) {
  const fz = (y) => el.z0 - el.k * (y - el.fy0), y0 = el.y0, y1 = el.y1, H = y1 - y0;
  const slab = (mat, shape, d, x0) => {
    const g = new ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 10 }), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const u = P.getX(i), v = P.getY(i), dz = P.getZ(i), yy = y0 + v; P.setXYZ(i, x0 + u, yy, fz(yy) + d + dz); }
    g.computeVertexNormals(); bag.add(mat, g);
  };
  const rect = (u0, v0, u1, v1) => { const s = new Shape(); s.moveTo(u0, v0); s.lineTo(u1, v0); s.lineTo(u1, v1); s.lineTo(u0, v1); s.closePath(); return s; };
  const ell = (cu, cv, ru, rv, hole = 0) => { const s = new Shape(); s.absellipse(cu, cv, ru, rv, 0, Math.PI * 2, false); if (hole) { const h = new Path(); h.absellipse(cu, cv, ru - hole, rv - hole, 0, Math.PI * 2, true); s.holes.push(h); } return s; };
  const poly = (pts) => { const s = new Shape(); s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath(); return s; };
  /** A seated figure, centred at cu, its seat at v, size h: the lotus seat, crossed legs, the robe, the head, the halo; layered from d. */
  const seatedFig = (x0, cu, v, h, robe, d, full) => {
    if (full) slab('cloth_ochre', ell(cu, v + h * 0.62, h * 0.62, h * 0.72, h * 0.07), d, x0);                   // the aureole's rim
    slab(full ? 'cloth_green' : 'cloth_ochre', ell(cu, v + h * 0.9, h * 0.2, h * 0.2), d + 0.035, x0);            // the halo
    slab(robe, poly([[cu - h * 0.42, v + h * 0.04], [cu + h * 0.42, v + h * 0.04], [cu + h * 0.36, v + h * 0.22], [cu + h * 0.2, v + h * 0.3], [cu + h * 0.21, v + h * 0.66], [cu + h * 0.1, v + h * 0.74], [cu - h * 0.1, v + h * 0.74], [cu - h * 0.21, v + h * 0.66], [cu - h * 0.2, v + h * 0.3], [cu - h * 0.36, v + h * 0.22]]), d + 0.07, x0);
    slab('paint_ochre', ell(cu, v + h * 0.88, h * 0.1, h * 0.12), d + 0.105, x0);                                  // the face, gilt
    slab('paint_ochre', ell(cu, v + h * 0.3, h * 0.08, h * 0.05), d + 0.105, x0);                                  // the hands in the lap
    if (full) slab('cloth_red', poly([[cu - h * 0.12, v + h * 0.62], [cu + h * 0.12, v + h * 0.62], [cu, v + h * 0.36]]), d + 0.105, x0);   // the robe's fold over the breast
    const np = full ? 9 : 5;                                                                                         // the lotus seat's petals
    for (let k = 0; k < np; k++) { const u = cu - h * 0.5 + h * (k + 0.5) / np; slab('cloth_white', poly([[u - h * 0.55 / np, v + h * 0.04], [u + h * 0.55 / np, v + h * 0.04], [u, v - h * 0.14]]), d + 0.07, x0); }
    slab('cloth_red', rect(cu - h * 0.5, v - h * 0.22, cu + h * 0.5, v - h * 0.13), d + 0.035, x0);
  };
  el.panels.forEach(([x0, x1], i) => {
    const W = x1 - x0, b = 0.45, ib = 0.16, robes = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_green'];
    slab('cloth_indigo', rect(0, 0, W, H - 0.6), 0.08, x0);                                                          // the field
    for (const r of [[0, 0, W, b], [0, H - 0.6 - b, W, H - 0.6], [0, b, b, H - 0.6 - b], [W - b, b, W, H - 0.6 - b]]) slab('cloth_red', rect(...r), 0.115, x0);
    for (const r of [[b, b, W - b, b + ib], [b, H - 0.6 - b - ib, W - b, H - 0.6 - b], [b, b + ib, b + ib, H - 0.6 - b - ib], [W - b - ib, b + ib, W - b, H - 0.6 - b - ib]]) slab('cloth_ochre', rect(...r), 0.115, x0);
    slab('cloth_green', rect(b + ib, b + ib, W - b - ib, b + ib + H * 0.07), 0.115, x0);                            // the ground at the foot
    // the valance across the top in pleats, and the pole it hangs from
    const N = Math.round(W / 0.4);
    for (let k = 0; k < N; k++) slab(k % 2 ? 'cloth_white' : 'cloth_red', rect(W * k / N, H - 1.5, W * (k + 1) / N, H - 0.25), 0.16 + (k % 2) * 0.035, x0);
    slab('cloth_ochre', rect(-0.1, H - 0.3, W + 0.1, H - 0.05), 0.24, x0);
    bag.add('timber', box(x0 - 0.5, y1 - 0.05, fz(y1) + 0.05, x1 + 0.5, y1 + 0.17, fz(y1) + 0.27));
    // the great figure, and the small ones in rows round him (the larger panel's figure the larger)
    const inner = W - 2 * (b + ib), gh = inner * 0.78, gv = b + ib + H * 0.11, cu = W / 2;
    seatedFig(x0, cu, gv, gh, 'cloth_red', 0.115, true);
    const sh = Math.min(1.3, inner / 4.2);
    let n = 0;
    for (let v = gv + gh * 1.36 + 0.3; v + sh < H - 1.8; v += sh * 1.3) for (let u = b + ib + sh * 0.7; u < W - b - ib - sh * 0.5; u += sh * 1.15) seatedFig(x0, u, v, sh, robes[n++ % 4], 0.115, false);
    // two attendants standing at the foot beside the throne
    for (const sg of [-1, 1]) seatedFig(x0, cu + sg * (inner / 2 - sh * 0.6), gv - gh * 0.05, sh * 1.1, robes[(n++) % 4], 0.155, false);
  });
}

registerStyle('tibetan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dzong, golden_roof: goldenRoof, banner_pole: bannerPole, tibetan_house: house, round_tower: roundTower, zigzag, doring, sangkhang, stone_heap: stoneHeap, shol_gate: sholGate, triple_stair: tripleStair, koku },
  objects: {},
});
