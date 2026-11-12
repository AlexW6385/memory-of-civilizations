// The monuments of Justinian's city (docs/settlements/constantinople.md §4): the spina of the
// Hippodrome with the Obelisk of Theodosius, the Serpent Column, the statues of the charioteer
// Porphyrius and the turning posts; the emperor's kathisma; the honorific columns of Constantine
// and Justinian with their bronze statues; the Milion; and Hagia Eirene, a domed basilica.
// Registered into the `roman` style, the style of the city's plans; the church is built of the
// Byzantine vocabulary of this directory.

import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { planarWall, arcSolid, spherePatch } from './index.js';
import '../roman/town.js';
import '../../objects/index.js';

const TAU = Math.PI * 2, NONE = { circle() {}, rect() {}, segment() {}, floor() {} };

/** All the pieces of a figure or a beast in one metal (a bronze statue). */
const metal = (bag, mat) => ({ add: (_m, g) => bag.add(mat, g) });
/** A standing bronze figure, `h` tall, facing `rot` (0 = −z). */
function statue(bag, mat, x, y, z, h, rot, extra = {}) {
  STYLES.life.elements.figure({ at: [x, z], y, rot, h, seed: 3, dress: 'robe', pose: 'stand', hat: 'none', ...extra }, { bag: metal(bag, mat), col: NONE });
}
/** A moulded pedestal: plinth, die, cornice, square (half-size w) on (x, z) from y; returns its top. */
function pedestal(bag, mat, x, y, z, w, H) {
  bag.add(mat, box(x - w * 1.15, y, z - w * 1.15, x + w * 1.15, y + H * 0.16, z + w * 1.15));
  bag.add(mat, frustum([x - w * 1.08, z - w * 1.08, x + w * 1.08, z + w * 1.08], y + H * 0.16, y + H * 0.24, w * 0.08, w * 0.08, w * 0.08, w * 0.08));
  bag.add(mat, box(x - w, y + H * 0.24, z - w, x + w, y + H * 0.8, z + w));
  bag.add(mat, frustum([x - w, z - w, x + w, z + w], y + H * 0.8, y + H * 0.9, -w * 0.1, -w * 0.1, -w * 0.1, -w * 0.1));
  bag.add(mat, box(x - w * 1.12, y + H * 0.9, z - w * 1.12, x + w * 1.12, y + H, z + w * 1.12));
  return y + H;
}
/** A relief on a vertical face: a framed, sunk panel with rows of figures standing out of it. */
function relief(bag, mat, c, n, along, y0, y1, w, rows, rand) {
  // c: the face's centre [x, z] on its plane; n: outward normal; along: the face's direction
  const P = (u, d) => [c[0] + along[0] * u + n[0] * d, c[1] + along[1] * u + n[1] * d];
  const B = (u0, u1, ya, yb, d0, d1) => { const a = P(u0, d0), b = P(u1, d1); bag.add(mat, box(Math.min(a[0], b[0]), ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), yb, Math.max(a[1], b[1]))); };
  // the frame round the panel
  B(-w / 2, w / 2, y1 - 0.1, y1, -0.02, 0.06); B(-w / 2, w / 2, y0, y0 + 0.1, -0.02, 0.06);
  B(-w / 2, -w / 2 + 0.1, y0, y1, -0.02, 0.06); B(w / 2 - 0.1, w / 2, y0, y1, -0.02, 0.06);
  const rh = (y1 - y0 - 0.2) / rows;
  for (let r = 0; r < rows; r++) {
    const yb = y0 + 0.1 + r * rh, fh = rh * 0.86, nf = Math.max(3, Math.round((w - 0.3) / (fh * 0.42)));
    if (r > 0) B(-w / 2 + 0.1, w / 2 - 0.1, yb - 0.03, yb + 0.02, -0.02, 0.04);     // the ground line between registers
    for (let i = 0; i < nf; i++) {
      const u = -w / 2 + 0.2 + (i + 0.5) * (w - 0.4) / nf, s = fh * (0.85 + rand() * 0.15), [px, pz] = P(u, 0.0);
      const g = lathe([[0.001, 0], [0.13, 0.02], [0.12, 0.45], [0.14, 0.62], [0.1, 0.78], [0.08, 0.8], [0.09, 0.88], [0.07, 0.97], [0.001, 1]], 6);
      g.scale(s * 0.9, s, s * 0.45); g.rotateY(Math.atan2(n[0], n[1])); g.translate(px, yb, pz);
      bag.add(mat, g);
    }
  }
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the Hippodrome's spina ───────────────────────────────────────────────────

/**
 * obelisk: { at, y } — the Obelisk of Thutmose III as Theodosius set it up in 390: a two-stepped
 * limestone foundation (7.05 × 7.10 m); the lower marble pedestal (3.8 × 3.9 × 1.4 m) with red
 * granite corner blocks, reliefs on two faces and inscription panels on the others; the setback; the
 * upper block (2.5 × 2.25 × 2.36 m) with reliefs on all four sides (the emperor and the court in the
 * kathisma, the races, the raising of the obelisk); four bronze cubes; the granite shaft, about 19 m,
 * its single column of hieroglyphs down each face, the pyramidion.
 */
function obelisk(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rand = rng(390);
  bag.add('limestone', box(x - 3.53, y - 0.3, z - 3.55, x + 3.53, y + 0.2, z + 3.55));
  bag.add('limestone', box(x - 3.0, y + 0.2, z - 3.0, x + 3.0, y + 0.5, z + 3.0));
  let yy = y + 0.5;
  bag.add('marble', box(x - 1.9, yy, z - 1.95, x + 1.9, yy + 1.4, z + 1.95));
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bag.add('granite_red', box(x + sx * 1.9 - (sx > 0 ? 0.45 : -0.0) - (sx < 0 ? 0.03 : 0), yy, z + sz * 1.95 - (sz > 0 ? 0.45 : 0) - (sz < 0 ? 0.03 : 0), x + sx * 1.9 + (sx > 0 ? 0.03 : 0.45), yy + 1.4, z + sz * 1.95 + (sz > 0 ? 0.03 : 0.45)));
  // the lower pedestal's faces: reliefs east and west, inscription panels north and south
  for (const s of [-1, 1]) relief(bag, 'marble', [x + s * 1.9, z], [s, 0], [0, 1], yy + 0.12, yy + 1.28, 2.9, 1, rand);
  for (const s of [-1, 1]) {
    bag.add('marble', box(x - 1.35, yy + 0.2, z + s * 1.95 - (s > 0 ? 0.02 : 0.05), x + 1.35, yy + 1.2, z + s * 1.95 + (s > 0 ? 0.05 : 0.02)));
    for (let r = 0; r < 5; r++) bag.add('marble_dark', box(x - 1.15, yy + 0.32 + r * 0.17, z + s * 1.95 - (s > 0 ? 0 : 0.065), x + 1.15 - (r === 4 ? 0.8 : 0), yy + 0.37 + r * 0.17, z + s * 1.95 + (s > 0 ? 0.065 : 0)));
  }
  yy += 1.4;
  bag.add('marble', frustum([x - 1.75, z - 1.8, x + 1.75, z + 1.8], yy, yy + 0.55, 0.38, 0.38, 0.45, 0.45));
  yy += 0.55;
  bag.add('marble', box(x - 1.25, yy, z - 1.125, x + 1.25, yy + 2.36, z + 1.125));
  for (const s of [-1, 1]) relief(bag, 'marble', [x + s * 1.25, z], [s, 0], [0, 1], yy + 0.15, yy + 2.2, 2.0, 2, rand);
  for (const s of [-1, 1]) relief(bag, 'marble', [x, z + s * 1.125], [0, s], [1, 0], yy + 0.15, yy + 2.2, 2.25, 2, rand);
  bag.add('marble', box(x - 1.38, yy + 2.36, z - 1.26, x + 1.38, yy + 2.52, z + 1.26));
  yy += 2.52;
  col.rect([x - 3.5, z - 3.5, x + 3.5, z + 3.5], y, yy);
  // the bronze cubes, then the shaft
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) bag.add('bronze', box(x + sx * 0.82 - 0.24, yy, z + sz * 0.82 - 0.24, x + sx * 0.82 + 0.24, yy + 0.49, z + sz * 0.82 + 0.24));
  bag.add('marble', box(x - 0.75, yy, z - 0.75, x + 0.75, yy + 0.49, z + 0.75));
  yy += 0.49;
  const b0 = 1.1, b1 = 0.82, SH = 18.8, PH = 1.5;
  bag.add('granite_red', frustum([x - b0, z - b0, x + b0, z + b0], yy, yy + SH, b0 - b1, b0 - b1, b0 - b1, b0 - b1));
  bag.add('granite_red', frustum([x - b1, z - b1, x + b1, z + b1], yy + SH, yy + SH + PH, b1 - 0.02, b1 - 0.02, b1 - 0.02, b1 - 0.02));
  // the hieroglyphs: one column down the middle of each face, signs of different sizes, one or two
  // abreast, cut in (dark red in their shadow)
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let gy = yy + SH - 0.8;
    while (gy > yy + 1.0) {
      const gh = 0.08 + rand() * 0.14, two = rand() < 0.4, half = b0 + (b1 - b0) * ((gy - yy) / SH);
      for (const [c0, c1] of two ? [[-0.24, -0.02], [0.02, 0.24]] : [[-0.06 - rand() * 0.16, 0.06 + rand() * 0.16]]) {
        const d0 = half - 0.012, d1 = half + 0.004;
        const a = [x + nx * d0 + nz * c0, z + nz * d0 + nx * c0], c = [x + nx * d1 + nz * c1, z + nz * d1 + nx * c1];
        bag.add('porphyry', box(Math.min(a[0], c[0]), gy - gh, Math.min(a[1], c[1]), Math.max(a[0], c[0]), gy, Math.max(a[1], c[1])));
      }
      gy -= gh + 0.09 + rand() * 0.08;
    }
  }
}

/** A tube along a list of points (a sweep of a circle), with smooth normals. */
function tube(pts, r, seg = 8, rEnd = r) {
  const rings = [], norms = [];
  let prevU = null;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    let t = [q[0] - o[0], q[1] - o[1], q[2] - o[2]]; const lt = Math.hypot(...t) || 1; t = t.map((v) => v / lt);
    // carry the frame along (no twist): the last ring's u made perpendicular to the new tangent
    let u = prevU ?? (Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]);
    const dt = u[0] * t[0] + u[1] * t[1] + u[2] * t[2]; u = [u[0] - t[0] * dt, u[1] - t[1] * dt, u[2] - t[2] * dt];
    const lu = Math.hypot(...u) || 1; u = u.map((v) => v / lu); prevU = u;
    const w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
    const rr = r + (rEnd - r) * i / (pts.length - 1), ring = [], nr = [];
    for (let k = 0; k < seg; k++) {
      const th = TAU * k / seg, n = [u[0] * Math.cos(th) + w[0] * Math.sin(th), u[1] * Math.cos(th) + w[1] * Math.sin(th), u[2] * Math.cos(th) + w[2] * Math.sin(th)];
      ring.push([p[0] + n[0] * rr, p[1] + n[1] * rr, p[2] + n[2] * rr]); nr.push(n);
    }
    rings.push(ring); norms.push(nr);
  }
  const pos = [], nor = [];
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < seg; k++) {
    const k1 = (k + 1) % seg, A = [i, k], Bv = [i, k1], Cv = [i + 1, k1], D = [i + 1, k];
    // wound so that the face normal points out along n
    for (const [ri, ki] of [A, Cv, Bv, A, D, Cv]) { pos.push(...rings[ri][ki]); nor.push(...norms[ri][ki]); }
  }
  // check the winding once against the normals and flip all if needed
  const e1 = [pos[3] - pos[0], pos[4] - pos[1], pos[5] - pos[2]], e2 = [pos[6] - pos[0], pos[7] - pos[1], pos[8] - pos[2]];
  const fn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  if (fn[0] * nor[0] + fn[1] * nor[1] + fn[2] * nor[2] < 0) for (let i = 0; i < pos.length; i += 9) for (let k = 0; k < 3; k++) { const a = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = a; const b = nor[i + 3 + k]; nor[i + 3 + k] = nor[i + 6 + k]; nor[i + 6 + k] = b; }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/**
 * serpent_column: { at, y } — the bronze of the Plataean tripod, brought from Delphi by Constantine:
 * three serpents twined in 29 coils, about 8 m, their three heads spreading at the top (the gold
 * bowl they once carried long gone), on a marble pedestal.
 */
function serpentColumn(el, { bag, col }) {
  const [x, z] = el.at, y0 = pedestal(bag, 'marble', x, el.y ?? 0, z, 0.75, 1.3), H = 6.6, coils = 29, R = 0.2;
  for (let s = 0; s < 3; s++) {
    const pts = [];
    for (let i = 0; i <= coils * 5; i++) {
      const f = i / (coils * 5), a = s * TAU / 3 + f * coils * TAU * 0.5;
      pts.push([x + Math.cos(a) * R, y0 + f * H, z + Math.sin(a) * R]);
    }
    // the neck curving out and up, the head
    const dx = Math.cos(s * TAU / 3 + 0.4), dz = Math.sin(s * TAU / 3 + 0.4);
    const top = pts[pts.length - 1];
    for (let i = 1; i <= 10; i++) { const f = i / 10; pts.push([top[0] + dx * f * 0.85, top[1] + Math.sin(f * Math.PI * 0.55) * 0.75, top[2] + dz * f * 0.85]); }
    bag.add('bronze', tube(pts, 0.15, 8, 0.1));
    const h = pts[pts.length - 1], g = lathe([[0.001, 0], [0.13, 0.08], [0.15, 0.22], [0.11, 0.38], [0.001, 0.46]], 10);
    g.rotateX(Math.PI / 2); g.scale(1, 0.7, 1); g.rotateY(Math.atan2(dx, dz)); g.translate(h[0] - dx * 0.08, h[1], h[2] - dz * 0.08);
    bag.add('bronze', g);
  }
  bag.add('bronze', lathe([[0.42, 0], [0.36, 0.12], [0.001, 0.14]], 16, null, x, y0, z));
  col.circle(x, z, 0.9, el.y ?? 0, y0 + H);
}

/**
 * spina: { a: [x, z], b: [x, z], y, w } — the low barrier down the middle of the arena, marble-faced
 * with its coping and the basins of water along it; at each end the turning posts (metae), three
 * gilded cones on a half-round plinth.
 */
function spina(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, w = el.w ?? 4, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  bag.add('marble', orientedBox(el.a, el.b, w, y - 0.2, y + 1.1));
  bag.add('marble', orientedBox(el.a, el.b, w + 0.3, y + 1.1, y + 1.3));
  col.segment(el.a, el.b, w, y, y + 1.3);
  // the basins sunk along the top, between the monuments
  for (let d = 6; d < L - 6; d += 12) {
    if ((el.skip || []).some((s) => Math.abs(s - d) < 7)) continue;
    const c = [ax + ux * d, az + uz * d];
    bag.add('marble', orientedBox([c[0] - ux * 4, c[1] - uz * 4], [c[0] + ux * 4, c[1] + uz * 4], w - 0.6, y + 1.3, y + 1.6));
    bag.add('water', orientedBox([c[0] - ux * 3.7, c[1] - uz * 3.7], [c[0] + ux * 3.7, c[1] + uz * 3.7], w - 1.2, y + 1.55, y + 1.58));
  }
  for (const [ex, ez, s] of [[ax, az, -1], [bx, bz, 1]]) {
    const cx = ex + ux * s * 5, cz = ez + uz * s * 5;
    const half = arcSolid(cx, cz, 0, 3.2, 0, 180, y - 0.2, y + 1.6, 10);
    const yaw = Math.atan2(uz * s, ux * s);
    half.translate(-cx, 0, -cz); half.applyMatrix4(new Matrix4().makeRotationY(-yaw + Math.PI / 2)); half.translate(cx, 0, cz);
    bag.add('marble', half);
    bag.add('marble', orientedBox([ex, ez], [cx, cz], 6.4, y - 0.2, y + 1.6));
    col.circle(cx, cz, 3.2, y, y + 1.6);
    for (let k = -1; k <= 1; k++) {
      const px = cx + (-uz * k) * 1.9 + ux * s * (k === 0 ? 1.2 : 0), pz = cz + (ux * k) * 1.9 + uz * s * (k === 0 ? 1.2 : 0);
      bag.add('marble', lathe([[0.62, 0], [0.62, 0.5], [0.52, 0.62]], 16, null, px, y + 1.6, pz));
      bag.add('gilt_bronze', lathe([[0.5, 0], [0.42, 1.6], [0.25, 3.6], [0.1, 4.6], [0.16, 4.75], [0.001, 5.2]], 16, null, px, y + 2.22, pz));
    }
  }
}

/** charioteer_statue: { at, y, rot } — a bronze statue of the charioteer Porphyrius on its inscribed base. */
function charioteerStatue(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, top = pedestal(bag, 'marble', x, y, z, 0.62, 2.1);
  statue(bag, 'bronze', x, top, z, 2.1, el.rot ?? 0, { dress: 'tunic', pose: 'talk' });
  col.rect([x - 0.75, z - 0.75, x + 0.75, z + 0.75], y, top);
}

/**
 * kathisma: { rect, face ('w' | 'e'), y, h } — the emperor's box on the east side of the Hippodrome,
 * reached from the Great Palace: a tall block with a loggia of porphyry columns over the track under
 * a lead roof, its marble parapet, and the imperial curtains.
 */
function kathisma(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, H = el.h ?? 18, w = el.face === 'w' ? -1 : 1;
  const xf = w < 0 ? x0 : x1, xb = w < 0 ? x1 : x0, fl = y + H * 0.42, lh = 6.2;
  const X = (a, b) => [Math.min(a, b), Math.max(a, b)];
  { const [a, b] = X(xb, xf); bag.add('brick', box(a, y - 0.5, z0, b, fl, z1)); col.rect([a, z0, b, z1], y, fl); }
  // the loggia: floor, back wall, columns, architrave, roof
  const xl = xf - w * 5.5;
  { const [a, b] = X(xb, xl); bag.add('brick', box(a, fl, z0, b, fl + lh + 3.5, z1)); }
  bag.add('marble_floor', box(Math.min(xl, xf), fl - 0.3, z0, Math.max(xl, xf), fl, z1));
  const n = 6;
  for (let i = 0; i < n; i++) {
    const zc = z0 + 1.2 + (z1 - z0 - 2.4) * i / (n - 1), xc = xf - w * 0.6;
    STYLES.byzantine.column({ at: [xc, zc], y: fl, h: lh, d: 0.62, shaftMat: 'porphyry', capMat: 'marble_smooth' }, { bag, col: NONE });
  }
  for (const s of [-1, 1]) { const zz = s < 0 ? z0 : z1 - 0.8; bag.add('brick', box(Math.min(xl, xf), fl, zz, Math.max(xl, xf), fl + lh, zz + 0.8)); }
  bag.add('marble', box(Math.min(xl, xf) - 0.1, fl + lh, z0 - 0.1, Math.max(xl, xf) + 0.3, fl + lh + 0.8, z1 + 0.1));
  bag.add('brick', box(Math.min(xl, xf), fl + lh + 0.8, z0, Math.max(xl, xf), fl + lh + 3.5, z1));
  bag.add('lead', frustum([Math.min(xb, xf) - 0.4, z0 - 0.4, Math.max(xb, xf) + 0.4, z1 + 0.4], fl + lh + 3.5, fl + lh + 5.5, 0.3, 0.3, (z1 - z0) / 2, (z1 - z0) / 2));
  // the parapet between the columns, a purple hanging in the middle, the throne behind
  bag.add('marble', box(...(w > 0 ? [xf - 1.0, fl, z0 + 0.8, xf - 0.7, fl + 1.05, z1 - 0.8] : [xf + 0.7, fl, z0 + 0.8, xf + 1.0, fl + 1.05, z1 - 0.8])));
  const zm = (z0 + z1) / 2;
  bag.add('cloth_red', box(...(w > 0 ? [xf - 0.66, fl + 0.3, zm - 1.4, xf - 0.62, fl + 1.0, zm + 1.4] : [xf + 0.62, fl + 0.3, zm - 1.4, xf + 0.66, fl + 1.0, zm + 1.4])));
  bag.add('gold', box(...(w > 0 ? [xl + 0.1, fl, zm - 0.7, xl + 1.0, fl + 1.8, zm + 0.7] : [xl - 1.0, fl, zm - 0.7, xl - 0.1, fl + 1.8, zm + 0.7])));
  col.floor([Math.min(xl, xf), z0, Math.max(xl, xf), z1], fl);
}

// ── honorific columns and the Milion ─────────────────────────────────────────

/**
 * honor_column: { at, y, h (the shaft), d, kind: 'constantine' | 'justinian', steps } — the column of
 * Constantine (330) in his forum: porphyry drums with bronze wreaths over the joints on a white
 * marble pedestal, the emperor in bronze as the Sun on top, a radiate crown, a spear and an orb; the
 * column of Justinian (543) in the Augustaion: seven marble steps, a shaft of masonry sheathed in
 * bronze plates and garlands, and Justinian on a colossal bronze horse facing east, the orb with the
 * cross in his left hand, his right raised toward the sunrise.
 */
function honorColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, d = el.d ?? 3, r = d / 2, H = el.h ?? 30, J = el.kind === 'justinian';
  let yy = y;
  const steps = el.steps ?? (J ? 7 : 3);
  for (let i = 0; i < steps; i++) { const w = r * 2.6 + (steps - i) * 0.45; bag.add('marble', box(x - w, yy - (i ? 0 : 0.3), z - w * (J ? 1.15 : 1), x + w, yy + 0.4, z + w * (J ? 1.15 : 1))); yy += 0.4; }
  col.rect([x - r * 2.6 - steps * 0.45, z - r * 2.6 - steps * 0.45, x + r * 2.6 + steps * 0.45, z + r * 2.6 + steps * 0.45], y, yy);
  yy = pedestal(bag, 'marble', x, yy, z, r * 1.6, r * 3.2);
  bag.add('marble', lathe([[r * 1.3, 0], [r * 1.3, 0.25], [r * 1.15, 0.45], [r * 1.08, 0.75], [r * 1.2, 0.9], [r * 1.02, 1.1]], 32, null, x, yy, z));
  yy += 1.1;
  const shaftMat = J ? 'bronze' : 'porphyry', nd = J ? 14 : 8, dh = H / nd;
  for (let i = 0; i < nd; i++) {
    const r0 = r * (1 - 0.1 * i / nd), r1 = r * (1 - 0.1 * (i + 1) / nd);
    bag.add(shaftMat, lathe([[r0, 0], [r1, dh]], 32, null, x, yy + i * dh, z));
    if (i > 0) {
      // over the joint: Constantine's bronze wreaths, Justinian's gilded garlands
      const rw = r0 + 0.06, g = lathe([[rw, -0.22], [rw + 0.12, -0.12], [rw + 0.16, 0], [rw + 0.12, 0.12], [rw, 0.22]], 40, (th) => 1 + 0.03 * Math.abs(Math.sin(th * 24)), x, yy + i * dh, z);
      bag.add(J ? 'gilt_bronze' : 'bronze', g);
    }
  }
  yy += H;
  // the capital and the statue's base
  const rt = r * 0.9;
  bag.add(J ? 'gilt_bronze' : 'marble', lathe([[rt, 0], [rt * 1.08, 0.3], [rt * 1.25, 1.0], [rt * 1.45, 1.6], [0.001, 1.6]], 32, (th) => 1 + 0.06 * Math.pow(Math.abs(Math.cos(th * 4)), 4), x, yy, z));
  bag.add(J ? 'gilt_bronze' : 'marble', box(x - rt * 1.55, yy + 1.6, z - rt * 1.55, x + rt * 1.55, yy + 2.1, z + rt * 1.55));
  yy += 2.1;
  col.circle(x, z, r * 1.05, y, yy);
  if (J) {
    // the rider on his horse, facing east (+x)
    const s = 3.2, rot = -Math.PI / 2;
    STYLES.life.elements.animal({ kind: 'horse', at: [x, z], y: yy, rot, s, seed: 543, mat: 'gilt_bronze' }, { bag: metal(bag, 'gilt_bronze'), col: NONE });
    const back = yy + (1.55 - 0.31 * 1.1 + 0.31 * 0.8) * s, k = s * 0.95, fx = x + 0.15 * s;
    statue(bag, 'gilt_bronze', fx, back - 0.47 * k, z, 1.65 * k, rot, { pose: 'sit', dress: 'tunic' });
    const hx = fx + 0.32 * k, hy = back - 0.47 * k + 0.5 * k, hz = z - 0.12 * k;     // the orb in his left hand, held out
    const R0 = 0.11 * k;
    bag.add('gilt_bronze', lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(t) * R0), R0 - Math.cos(t) * R0]; }), 14, null, hx, hy, hz));
    bag.add('gilt_bronze', box(hx - 0.012 * k, hy + 2 * R0, hz - 0.012 * k, hx + 0.012 * k, hy + 2 * R0 + 0.2 * k, hz + 0.012 * k));
    bag.add('gilt_bronze', box(hx - 0.012 * k, hy + 2 * R0 + 0.12 * k, hz - 0.06 * k, hx + 0.012 * k, hy + 2 * R0 + 0.15 * k, hz + 0.06 * k));
    // the crest of peacock feathers on the helmet
    bag.add('gilt_bronze', lathe([[0.05 * k, 0], [0.07 * k, 0.07 * k], [0.15 * k, 0.2 * k], [0.001, 0.24 * k]], 10, null, fx, back - 0.47 * k + 1.21 * k, z));
  } else {
    const h = 6.0;
    statue(bag, 'bronze', x, yy, z, h, Math.PI / 2, { dress: 'wrap' });
    const k = h / 1.65, hc = [x, yy + 1.62 * k, z];
    for (let i = 0; i < 7; i++) {                                                        // the radiate crown
      const a = -Math.PI / 2 + (i - 3) * 0.42;
      bag.add('gilt_bronze', rod([hc[0] + Math.cos(a) * 0.25, hc[1], hc[2] + Math.sin(a) * 0.25], [hc[0] + Math.cos(a) * 0.62, hc[1] + 0.35, hc[2] + Math.sin(a) * 0.62], 0.04, 5));
    }
    bag.add('bronze', rod([x - 0.05, yy, z + 0.75], [x - 0.05, yy + h * 1.15, z + 0.75], 0.07, 6));           // the spear
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.15], [0.001, 0.6]], 6, null, x - 0.05, yy + h * 1.15, z + 0.75));
    bag.add('gilt_bronze', lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.3), 0.3 - Math.cos(t) * 0.3]; }), 12, null, x + 0.1, yy + 0.98 * k, z - 0.6));
  }
}

/**
 * milion: { at, y, w } — the Golden Milestone, from which the roads of the empire were measured: a
 * dome on four arches over the start of the Mese, with a cornice and an attic, and on top the statues
 * of Constantine and Helena holding the cross between them, Justinian's sundial on its pillar.
 */
function milion(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, W = el.w ?? 11, th = 2.6, ar = 2.6, sp = y + 6.2, top = sp + ar + 2.2;
  for (const [o, u] of [[[x - W / 2, z - W / 2 + th / 2], [1, 0]], [[x - W / 2, z + W / 2 - th / 2], [1, 0]], [[x - W / 2 + th / 2, z - W / 2], [0, 1]], [[x + W / 2 - th / 2, z - W / 2], [0, 1]]]) {
    bag.add('marble', planarWall({ o, u, th, u0: 0, u1: W, y0: y - 0.3, y1: top, arches: [{ uc: W / 2, r: ar, spring: sp }] }));
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) col.rect([x + sx * W / 2 - (sx > 0 ? th : 0), z + sz * W / 2 - (sz > 0 ? th : 0), x + sx * W / 2 + (sx < 0 ? th : 0), z + sz * W / 2 + (sz < 0 ? th : 0)], y, top);
  // the vault inside (a flat soffit under the dome's ring), imposts, the cornice and attic
  bag.add('marble', box(x - W / 2 + th, sp + ar + 0.6, z - W / 2 + th, x + W / 2 - th, top, z + W / 2 - th));
  for (const s of [-1, 1]) for (const t of [-1, 1]) bag.add('marble', box(x + s * (ar + 0.02) - (s > 0 ? 0 : 0.25), sp - 0.3, z + t * W / 2 - (t > 0 ? th + 0.1 : -0.1) - (t > 0 ? 0 : th + 0.2), x + s * (ar + 0.02) + (s > 0 ? 0.25 : 0), sp, z + t * W / 2 + (t > 0 ? 0.1 : 0) - (t > 0 ? 0 : 0)));
  bag.add('marble', box(x - W / 2 - 0.35, top, z - W / 2 - 0.35, x + W / 2 + 0.35, top + 0.6, z + W / 2 + 0.35));
  bag.add('marble', box(x - W / 2 + 0.3, top + 0.6, z - W / 2 + 0.3, x + W / 2 - 0.3, top + 2.0, z + W / 2 - 0.3));
  const dr = W * 0.32, yd = top + 2.0;
  bag.add('marble', lathe([[dr + 0.4, 0], [dr + 0.4, 1.2], [dr, 1.2]], 32, null, x, yd, z));
  bag.add('lead', lathe(Array.from({ length: 10 }, (_, i) => { const t = i / 9 * Math.PI / 2; return [Math.max(0.001, Math.cos(t) * dr), 1.2 + Math.sin(t) * dr * 0.85]; }), 32, null, x, yd, z));
  // Constantine and Helena with the cross between them, on the attic's west edge
  const sx = x - W / 2 + 1.1;
  statue(bag, 'gilt_bronze', sx, top + 2.0, z - 2.2, 2.8, -Math.PI / 2, { dress: 'robe' });
  statue(bag, 'gilt_bronze', sx, top + 2.0, z + 2.2, 2.7, -Math.PI / 2, { dress: 'robe', hat: 'veil' });
  bag.add('gilt_bronze', box(sx - 0.1, top + 2.0, z - 0.1, sx + 0.1, top + 6.2, z + 0.1));
  bag.add('gilt_bronze', box(sx - 0.1, top + 4.8, z - 1.0, sx + 0.1, top + 5.0, z + 1.0));
  // the sundial on its pillar beside the arch
  const dx = x + W / 2 + 2.2, dz = z + W / 2 - 1.2;
  bag.add('marble', box(dx - 0.35, y, dz - 0.35, dx + 0.35, y + 1.6, dz + 0.35));
  bag.add('marble', lathe([[0.62, 0], [0.62, 0.12], [0.001, 0.14]], 24, null, dx, y + 1.6, dz));
  bag.add('bronze', box(dx - 0.02, y + 1.74, dz - 0.4, dx + 0.02, y + 2.1, dz + 0.05));
  col.rect([dx - 0.35, dz - 0.35, dx + 0.35, dz + 0.35], y, y + 1.6);
}

// ── Hagia Eirene ─────────────────────────────────────────────────────────────

/**
 * domed_basilica: { rect (the church without its atrium, long along x, apse east), atrium (length,
 * west of rect), y } — Hagia Eirene as Justinian rebuilt it after 532 (about 57 × 32 m): a nave
 * between aisles with galleries over them on three sides, a dome of 16 m on pendentives over its
 * eastern bay, raised on a drum pierced by windows, the western bay under a barrel vault, the apse
 * east with its windows, the narthex west, the atrium before it; walls of thin red brick in thick
 * mortar, roofs of lead.
 */
function domedBasilica(el, ctx) {
  const { bag, col } = ctx, BZ = STYLES.byzantine.elements, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  const zc = (z0 + z1) / 2, W = z1 - z0, GH = 14.5, nave = 16, nz0 = zc - nave / 2, nz1 = zc + nave / 2;
  const apseR = 6.2, xa = x1 - apseR - 0.6;                                          // the apse's chord
  const dx = xa - nave / 2 - 1.5;                                                    // the dome's centre
  const wallTh = 1.3, mat = 'brick';
  const win = (u0, u1, n, yb, h, r = 0.75) => Array.from({ length: n }, (_, i) => ({ uc: u0 + (u1 - u0) * (i + 0.5) / n, r, spring: yb + h - r, sill: yb }));
  // the outer walls of the aisles and galleries: two rows of arched windows, doors west
  for (const zz of [z0 + wallTh / 2, z1 - wallTh / 2]) {
    BZ.planar_wall({ o: [x0, zz], u: [1, 0], th: wallTh, u0: 0, u1: xa - x0, y0: y - 0.3, y1: y + GH, mat, arches: [...win(6, xa - x0 - 1, 7, y + 2.8, 4.0, 1.05), ...win(6, xa - x0 - 1, 9, y + 8.8, 3.8, 0.9)] }, ctx);
  }
  const doorsU = [zc - z0 - 5.5, zc - z0, zc - z0 + 5.5];
  BZ.planar_wall({ o: [x0 + wallTh / 2, z0], u: [0, 1], th: wallTh, u0: 0, u1: W, y0: y - 0.3, y1: y + GH, mat, arches: [...doorsU.map((u, i) => ({ uc: u, r: i === 1 ? 1.6 : 1.2, spring: y + (i === 1 ? 3.6 : 2.8) })), ...win(1, W - 1, 6, y + 8.8, 3.8, 0.9)] }, ctx);
  for (const [i, u] of doorsU.entries()) { if (i === 1) continue; const r = i === 1 ? 1.6 : 1.2; bag.add('timber', box(x0 + 0.35, y, z0 + u - r, x0 + 0.5, y + (i === 1 ? 3.6 : 2.8) + r * 0.6, z0 + u + r)); }
  // the east wall either side of the apse
  for (const [a, b] of [[z0, zc - apseR - 0.6], [zc + apseR + 0.6, z1]]) BZ.planar_wall({ o: [xa + wallTh / 2, a], u: [0, 1], th: wallTh, u0: 0, u1: b - a, y0: y - 0.3, y1: y + GH, mat, arches: win(1, b - a - 1, 2, y + 8.8, 3.8, 0.9) }, ctx);
  // the aisle and gallery roofs (lead, a low pitch outward)
  for (const [a, b] of [[z0, nz0], [nz1, z1]]) {
    bag.add('lead', box(x0 - 0.3, y + GH, a - (a === z0 ? 0.3 : 0), xa + 0.3, y + GH + 0.5, b + (b === z1 ? 0.3 : 0)));
  }
  bag.add('lead', box(x0 - 0.3, y + GH, nz0, x0 + 6, y + GH + 0.5, nz1));                // over the narthex and the west gallery
  // the nave walls above the gallery roofs: the clerestory under the barrel vault, the dome's square base
  const yv = y + GH + 2.6, xb = dx - nave / 2;                                       // springing of the vault; the dome bay's west edge
  for (const zz of [nz0, nz1]) {
    BZ.planar_wall({ o: [x0 + 6, zz], u: [1, 0], th: 1.2, u0: 0, u1: xb - x0 - 6, y0: y + GH, y1: yv, mat, arches: win(0.5, xb - x0 - 6.5, 4, y + GH + 0.4, 2.0, 0.8) }, ctx);
  }
  bag.add('lead', fromTriangles(vaultTris(x0 + 6, xb + 0.4, zc, nave / 2 + 0.6, yv, 24)));
  bag.add('stucco_warm', fromTriangles(vaultTris(x0 + 6, xb + 0.4, zc, nave / 2 + 0.55, yv, 24, true)));            // its inside, plastered
  BZ.planar_wall({ o: [x0 + 6, nz0 - 0.6], u: [0, 1], th: 1.2, u0: 0, u1: nave + 1.2, y0: y + GH, y1: yv + nave / 2 + 0.6, outline: { uc: nave / 2 + 0.6, r: nave / 2 + 0.6, spring: yv }, mat, arches: [{ uc: nave / 2 + 0.6, r: 2.2, spring: yv + 1.0, sill: yv - 2 }] }, ctx);
  // the dome bay: a square block to the dome's base, a great arch drawn on each face with its tympanum windows
  const yd = yv + nave / 2 + 2.2, s = nave / 2 + 0.6;
  for (const [o, u] of [[[dx - s, nz0 - 0.0], [1, 0]], [[dx - s, nz1], [1, 0]], [[dx - s, nz0 - 0.6], [0, 1]], [[dx + s, nz0 - 0.6], [0, 1]]]) {
    const L = 2 * s;
    BZ.planar_wall({ o, u, th: 1.2, u0: 0, u1: L, y0: y + GH, y1: yd, mat, collide: false, arches: u[0] ? win(2.5, L - 2.5, 5, yd - 5.2, 3.6, 0.85) : [] }, ctx);
  }
  bag.add('brick', box(dx - s - 0.6, yd - 0.01, nz0 - 0.6, dx + s + 0.6, yd + 0.4, nz1 + 0.6));
  // the drum: twenty windows between piers, a buttress on each pier outside; the dome under lead
  {
    const r = nave / 2 - 0.2, t = 0.8, n = 20, y0 = yd + 0.4, y1 = y0 + 2.3, wa = (1.0 / r) * 180 / Math.PI;
    for (let k = 0; k < n; k++) {
      const a = k * 360 / n;
      bag.add('brick', arcSolid(dx, zc, r, r + t, a + wa / 2, a + 360 / n - wa / 2, y0 + 0.3, y1, 6));
      bag.add('brick', arcSolid(dx, zc, r + t, r + t + 0.7, a + 180 / n - 1.6, a + 180 / n + 1.6, y0 + 0.3, y1 + 0.5, 4));
    }
    bag.add('brick', arcSolid(dx, zc, r, r + t + 0.15, 0, 360, y0, y0 + 0.3, 6));
    bag.add('brick', arcSolid(dx, zc, r, r + t + 0.15, 0, 360, y1, y1 + 0.3, 6));
    const H = 3.6, Rc = (r * r + H * H) / (2 * H), yc = y1 + 0.3 + H - Rc, e0 = Math.asin(Math.min(1, (y1 + 0.3 - yc) / Rc)) * 180 / Math.PI;
    bag.add('stucco_warm', spherePatch({ c: [dx, yc, zc], R: Rc, e0, e1: 90, segA: 64, segE: 10, inward: true }));
    const Ro = Rc + t, eo = Math.asin(Math.min(1, (y1 + 0.3 - yc) / Ro)) * 180 / Math.PI;
    bag.add('lead', spherePatch({ c: [dx, yc, zc], R: Ro, e0: eo, e1: 90, segA: 64, segE: 10, inward: false }));
    bag.add('lead', arcSolid(dx, zc, r - 0.05, Math.sqrt(Ro * Ro - (y1 + 0.3 - yc) ** 2) + 0.05, 0, 360, y1 + 0.3, y1 + 0.55, 6));
    // the ceiling of the dome bay inside, seen through the windows
    bag.add('stucco_warm', disc(r, y0 - 0.02, 40, dx, zc, false));
  }
  // the apse: a half-drum with three windows and its half-dome under lead
  const yA = y + GH - 3;
  BZ.arc_wall({ c: [xa, zc], r0: apseR, r1: apseR + 1.2, a0: -90, a1: 90, y0: y - 0.3, y1: yA, mat, gaps: [-45, 0, 45].map((a) => ({ a, w: 1.6, y0: y + 4.5, y1: y + 9.5 })) }, ctx);
  bag.add('mosaic_gold', spherePatch({ c: [xa, yA, zc], R: apseR, a0: -90, a1: 90, segA: 48, segE: 12, inward: true }));
  bag.add('lead', spherePatch({ c: [xa, yA, zc], R: apseR + 1.25, a0: -90, a1: 90, segA: 48, segE: 12, inward: false }));
  bag.add('brick', box(xa - 0.6, y + GH, zc - apseR - 1.2, xa + 0.6, yd, zc + apseR + 1.2));
  // the floor inside
  bag.add('marble_floor', box(x0 + wallTh, y - 0.3, z0 + wallTh, xa, y + 0.02, z1 - wallTh));
  eireneInterior(ctx, { x0, z0, z1, y, zc, nave, nz0, nz1, xa, dx, s, GH, yv, apseR, wallTh });
  // the atrium: porticoes round a court before the narthex
  if (el.atrium) STYLES.roman.elements.porticus({ rect: [x0 - el.atrium, z0 + 2, x0 - 0.7, z1 - 2], y, h: 6, depth: 5 }, ctx);
  void col;
}

/**
 * The inside of Hagia Eirene (docs/settlements/constantinople.md §4.2): the nave's arcades of verde antico columns on either side with the
 * galleries over the aisles (a floor, a parapet, a second order of smaller columns), the four brick piers of the dome bay, the chancel
 * screen across the nave, the altar under its ciborium, the bishop's seat on the steps of the synthronon in the apse, hanging lamps.
 */
function eireneInterior(ctx, g) {
  const { bag, col } = ctx, BZ = STYLES.byzantine, { x0, z0, z1, y, zc, nave, nz0, nz1, xa, dx, s, GH, apseR, wallTh } = g;
  const fy = y + 0.02, gy = y + 7.4, xs = x0 + wallTh + 2.2, xe = dx - s - 1.3, n = Math.max(2, Math.round((xe - xs) / 3.3)), step = (xe - xs) / n;
  for (const zz of [nz0, nz1]) {
    for (let k = 0; k <= n; k++) {
      const x = xs + k * step;
      BZ.column({ at: [x, zz], y: fy, h: 6.6, d: 0.78, shaftMat: 'verde_antico', capMat: 'marble_smooth' }, ctx);
      BZ.column({ at: [x, zz], y: gy + 0.4, h: 5.0, d: 0.55, shaftMat: k % 2 ? 'verde_antico' : 'proconnesian', capMat: 'marble_smooth' }, ctx);
    }
    const a = Math.min(zz - 0.5, zz + 0.5);
    bag.add('marble', box(xs - 0.5, y + 6.62, a, xe + 0.5, gy, a + 1.0));                                   // the architrave under the gallery floor
    bag.add('marble', box(xs - 0.5, gy + 5.4, a, xe + 0.5, gy + 5.9, a + 1.0));                             // and the cornice over the upper order
    bag.add('marble_smooth', box(xs - 0.4, gy + 0.4, zz - 0.08, xe + 0.4, gy + 1.45, zz + 0.08));           // the gallery's parapet
  }
  // the galleries' floors over the aisles, and the west gallery over the narthex (reached by a stair not built: the floors seal the aisles' ceilings)
  for (const [a, b] of [[z0 + wallTh, nz0 - 0.4], [nz1 + 0.4, z1 - wallTh]]) bag.add('timber', box(x0 + wallTh, gy - 0.4, a, xa, gy, b));
  bag.add('timber', box(x0 + wallTh, gy - 0.4, nz0 - 0.4, x0 + 6, gy, nz1 + 0.4));
  // the four piers of the dome bay
  for (const px of [dx - s, dx + s]) for (const pz of [nz0 - 0.6, nz1 + 0.6]) {
    bag.add('brick', box(px - 1.2, y - 0.2, pz - 1.2, px + 1.2, y + GH + 0.2, pz + 1.2)); col.rect([px - 1.2, pz - 1.2, px + 1.2, pz + 1.2], y, y + GH);
    bag.add('limestone', box(px - 1.32, y + 6.7, pz - 1.32, px + 1.32, y + 7.0, pz + 1.32));
  }
  // the chancel: a low screen of marble with two posts across the nave east of the dome's centre, a gate in the middle
  const cx = dx + s - 1.6;
  for (const [a, b] of [[nz0 + 0.8, zc - 1.3], [zc + 1.3, nz1 - 0.8]]) bag.add('marble_smooth', box(cx - 0.1, fy, a, cx + 0.1, y + 1.3, b));
  for (const zz of [zc - 1.3, zc + 1.3]) bag.add('porphyry', box(cx - 0.18, fy, zz - 0.18, cx + 0.18, y + 2.4, zz + 0.18));
  bag.add('silver', box(cx - 0.2, y + 2.3, zc - 1.5, cx + 0.2, y + 2.4, zc + 1.5));
  bag.add('gold', box(cx - 0.22, y + 2.4, zc - 0.08, cx + 0.22, y + 3.0, zc + 0.08)); bag.add('gold', box(cx - 0.22, y + 2.65, zc - 0.4, cx + 0.22, y + 2.78, zc + 0.4));
  // the altar under its ciborium, before the apse
  const ax = xa - apseR * 0.55, q = 1.5;
  bag.add('marble', box(ax - q, fy, zc - q, ax + q, y + 1.05, zc + q)); bag.add('cloth_red', box(ax - q - 0.03, y + 0.75, zc - q - 0.03, ax + q + 0.03, y + 1.08, zc + q + 0.03));
  bag.add('silver', box(ax - q - 0.1, y + 1.05, zc - q - 0.1, ax + q + 0.1, y + 1.12, zc + q + 0.1));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) BZ.column({ at: [ax + sx * (q + 0.35), zc + sz * (q + 0.35)], y: fy, h: 3.6, d: 0.3, shaftMat: 'verde_antico', capMat: 'silver' }, { bag, col: NONE });
  bag.add('silver', box(ax - q - 0.55, y + 3.7, zc - q - 0.55, ax + q + 0.55, y + 3.85, zc + q + 0.55));
  bag.add('lead', frustum([ax - q - 0.5, zc - q - 0.5, ax + q + 0.5, zc + q + 0.5], y + 3.85, y + 4.9, q * 0.8, q * 0.8, q * 0.8, q * 0.8));
  bag.add('gold', box(ax - 0.05, y + 4.9, zc - 0.05, ax + 0.05, y + 5.5, zc + 0.05)); bag.add('gold', box(ax - 0.05, y + 5.2, zc - 0.25, ax + 0.05, y + 5.3, zc + 0.25));
  col.rect([ax - q, zc - q, ax + q, zc + q], y, y + 1.1);
  // the synthronon: three tiers of marble steps round the apse's wall, the bishop's seat in the middle
  bag.add('marble_floor', arcSolid(xa, zc, 0.01, apseR, -90, 90, y - 0.3, y + 0.02, 8));
  for (let i = 0; i < 3; i++) { bag.add('marble', arcSolid(xa, zc, apseR - 1.5 + i * 0.5, apseR, -80, 80, fy, y + 0.45 * (i + 1), 6)); col.floor([xa + apseR - 1.5 + i * 0.5, zc - 3.5, xa + apseR - 0.2, zc + 3.5], y + 0.45 * (i + 1)); }
  bag.add('marble_smooth', box(xa + apseR - 2.3, y + 1.35, zc - 0.5, xa + apseR - 1.7, y + 2.4, zc + 0.5));
  // hanging lamps over the nave and the chancel
  for (const [lx, lz] of [[dx, zc], [dx - 6.5, zc], [dx + 5.5, zc - 3], [dx + 5.5, zc + 3], [x0 + 11, zc]]) {
    bag.add('bronze', box(lx - 0.01, y + 9.6, lz - 0.01, lx + 0.01, y + 14.0, lz + 0.01));
    bag.add('gold', lathe([[0.55, 0], [0.5, 0.12], [0.001, 0.14]], 14, null, lx, y + 9.3, lz));
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; bag.add('flame', lathe([[0.01, 0], [0.001, 0.1]], 5, null, lx + Math.cos(a) * 0.45, y + 9.45, lz + Math.sin(a) * 0.45)); }
    ctx.lights?.push({ at: [lx, y + 9.1, lz], color: '#ffb46b', intensity: 1.6, distance: 13 });
  }
}
/** A barrel vault's lead roof from xa to xb, over the axis z = zc, radius r, springing at y. */
function vaultTris(xa, xb, zc, r, y, n, inward = false) {
  const t = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * i / n, b = Math.PI * (i + 1) / n;
    const P = (x, ang) => [x, y + Math.sin(ang) * r, zc + Math.cos(ang) * r];
    t.push(...P(xa, a), ...P(xb, a), ...P(xb, b), ...P(xa, a), ...P(xb, b), ...P(xa, b));
  }
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - y, mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - zc;
    if ((ny * my + nz * mz < 0) !== inward) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}

Object.assign(STYLES.roman.elements, { obelisk, serpent_column: serpentColumn, spina, charioteer_statue: charioteerStatue, kathisma, honor_column: honorColumn, milion, domed_basilica: domedBasilica });
