// The finest work of the Three Terraces (docs/settlements/wei-ye.md §14): the bronze bird of the Sparrow's roof, the bracket colonnade and the rafter
// struts of the tower, the tile rows of its roofs, the open balustrade of the stairs, the bays of the earth faces, the bracing of the skyways.
// Every piece is merged into the material's own mesh: boxes are made by `jb`, which leans each face by a millimetre so that repeated pieces are
// not drawn as instances (src/core/geom.js, INSTANCING); materials are those the terraces already use.
import { frustum, lathe, rod, fromTriangles } from '../../core/geom.js';

/** A deterministic value in [0, 1) from numbers (the piece's own position): the same piece always gets the same millimetre, whatever was built before. */
const H = (...v) => { let h = 2166136261 >>> 0; for (const x of v) { h = Math.imul(h ^ Math.round(x * 1e4), 16777619) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0; } h ^= h >>> 13; return (h >>> 0) / 4294967296; };
/** An axis-aligned box whose faces lean by a millimetre (never matched as a repeated instance). */
export const jb = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, ...[1, 2, 3, 4].map((k) => 0.001 + H(x0, y0, z0, x1, y1, z1, k) * 0.002));
const jr = (a, b, r, seg = 6) => rod([a[0] + (H(...a, ...b, 1) - 0.5) * 0.004, a[1], a[2]], [b[0], b[1] + (H(...a, ...b, 2) - 0.5) * 0.004, b[2]], r * (1 + (H(...a, ...b, 3) - 0.5) * 0.02), seg);
/** A box about a centre (cx, cz) with half extents hn along the axis (nx, nz) and ht across it. */
const ob = (bag, mat, cx, cz, nx, nz, hn, ht, y0, y1) => {
  const hx = nx ? hn : ht, hz = nx ? ht : hn;
  bag.add(mat, jb(cx - hx, y0, cz - hz, cx + hx, y1, cz + hz));
};
const sph = (bag, mat, p, r, seg = 6) => bag.add(mat, lathe([[0.001, -r], [r * 0.8, -r * 0.6], [r, 0], [r * 0.8, r * 0.6], [0.001, r]], seg, null, p[0], p[1], p[2]));
const tube = (bag, mat, a, b, r) => { bag.add(mat, jr(a, b, r)); sph(bag, mat, a, r * 1.02); sph(bag, mat, b, r * 1.02); };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

/** A ribbon through points (a feather, a tail plume): width w0 at the first point, tapering to a point; both faces. */
function ribbon(out, pts, w0, wv) {
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const wa = w0 * (1 - i / n), wb = w0 * (1 - (i + 1) / n) * (i + 1 === n ? 0 : 1);
    const a0 = add(pts[i], wv, -wa), a1 = add(pts[i], wv, wa), b0 = add(pts[i + 1], wv, -wb), b1 = add(pts[i + 1], wv, wb);
    out.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0, ...a0, ...b1, ...a1, ...a0, ...b0, ...b1);
  }
}

/**
 * The bronze bird (the "bronze sparrow", a phoenix) on its lotus pedestal on the roof's apex: it faces east, the wings raised and spread, the neck
 * arched, a crest of three plumes, the tail of seven long feathers swept up behind. Local x forward (east), y up, z across; `s` the scale.
 */
export function bronzeBird(bag, x, y, z, s = 1.8) {
  const M = 'gilt_bronze', P = (u, v, w) => [x + u * s, y + v * s, z + w * s];
  // the pedestal: lotus base, a drum and the ball the bird stands on
  bag.add(M, lathe([[0.001, 0], [0.5 * s, 0], [0.46 * s, 0.1 * s], [0.3 * s, 0.22 * s], [0.14 * s, 0.34 * s], [0.12 * s, 0.9 * s], [0.3 * s, 1.0 * s], [0.34 * s, 1.1 * s], [0.001, 1.14 * s]], 10, null, x, y, z));
  const Y0 = 1.1;
  for (const k of [-1, 1]) tube(bag, M, P(0.05, Y0, k * 0.14), P(0.1, Y0 + 0.55, k * 0.14), 0.045 * s);
  // the body and the breast, the neck arching up, the head, the beak
  tube(bag, M, P(-0.85, Y0 + 0.75, 0), P(-0.05, Y0 + 0.85, 0), 0.27 * s);
  tube(bag, M, P(-0.05, Y0 + 0.85, 0), P(0.4, Y0 + 1.05, 0), 0.34 * s);
  tube(bag, M, P(0.4, Y0 + 1.1, 0), P(0.62, Y0 + 1.55, 0), 0.19 * s);
  tube(bag, M, P(0.62, Y0 + 1.55, 0), P(0.72, Y0 + 1.95, 0), 0.14 * s);
  sph(bag, M, P(0.8, Y0 + 2.02, 0), 0.17 * s, 8);
  bag.add(M, jr(P(0.93, Y0 + 2.0, 0), P(1.3, Y0 + 1.86, 0), 0.06 * s, 5));
  for (const [dz, q] of [[-0.06, 0], [0, 1], [0.06, 2]]) tube(bag, M, P(0.74, Y0 + 2.12, dz * 1.6), P(0.4 - q * 0.12, Y0 + 2.6 + (q === 1 ? 0.15 : 0), dz * 3), 0.022 * s);
  // the wings: eight long feathers and a shorter layer of coverts each, fanned from the shoulder
  const T = [];
  for (const k of [-1, 1]) {
    const root = P(0.1, Y0 + 1.1, k * 0.25);
    for (let layer = 0; layer < 2; layer++) for (let i = 0; i < 8; i++) {
      const t = i / 7, L = layer ? 0.62 : 1;
      const end = P(0.2 - 1.2 * t, Y0 + 2.25 - 0.55 * t * t - 0.3 * t, k * (2.45 - 1.5 * t));
      const dv = sub(end, root), tip = add(root, dv, L), mid = add(add(root, dv, 0.5 * L), [0, 0.18 * s, 0]);
      const wv = norm(crs(norm(dv), [0, 0, 1]));
      ribbon(T, [root, mid, tip], (layer ? 0.2 : 0.17) * s, wv);
    }
    // the shoulder, a boss of plates
    sph(bag, M, root, 0.22 * s);
  }
  // the tail: seven feathers sweeping back and up, the middle ones longest
  for (let i = 0; i < 7; i++) {
    const f = (i - 3) / 3, L = 3.0 - Math.abs(f) * 0.9;
    const a = P(-0.85, Y0 + 0.78, 0), m = P(-0.85 - L * 0.5, Y0 + 0.75 + 0.15 * (1 - Math.abs(f)), f * 0.75 * 0.5 * 1.3), t = P(-0.85 - L, Y0 + 1.25 + 0.5 * (1 - Math.abs(f)), f * 1.05);
    ribbon(T, [a, m, t], 0.17 * s, [0, 0, 1]);
  }
  bag.add(M, fromTriangles(T));
}

/** A set of Han brackets (a lu dou block, a cross arm and an outward arm with their sheng blocks) on a column top: (x, y, z) the top, (nx, nz) the outward axis. */
export function bracketSet(bag, x, y, z, nx, nz, lift = 0) {
  const tx = nz, tz = nx;                 // across
  void tx; void tz;
  ob(bag, 'timber_red', x, z, nx, nz, 0.3, 0.3, y, y + 0.3);                                  // lu dou
  ob(bag, 'timber_red', x, z, nx, nz, 0.13, 0.95, y + 0.3, y + 0.56);                         // the arm across (gong)
  ob(bag, 'timber_red', x + nx * 0.55, z + nz * 0.55, nx, nz, 0.55, 0.13, y + 0.3, y + 0.56);  // the arm outward
  for (const s of [-1, 1]) ob(bag, 'timber', x + (nx ? 0 : s * 0.8), z + (nx ? s * 0.8 : 0), nx, nz, 0.17, 0.22, y + 0.56, y + 0.74 + lift);   // sheng at the arm ends
  ob(bag, 'timber', x + nx * 1.0, z + nz * 1.0, nx, nz, 0.17, 0.22, y + 0.56, y + 0.74 + lift);
}

/** The tile rows (the raised rolls of a tiled roof) of a hipped roof built by hipLite: same profile; rows from the eave to the hip lines. */
export function tileRows(bag, el) {
  const [cx, cz] = el.c, a = Math.max(el.A, el.B), b = Math.min(el.A, el.B), Rr = el.rise, U = el.lift ?? 0.5, PW = el.pow ?? 1.2, y0 = el.y;
  const h = (u, v) => { const au = Math.abs(u), av = Math.abs(v), t = Math.max(0, Math.min(1, Math.min((b - av) / b, (a - au) / b))), c = Math.max(0, 1 - (a - au) / 5) * Math.max(0, 1 - (b - av) / 5); return y0 + Rr * Math.pow(t, PW) + U * c * c; };
  const out = [], hw = 0.075, up = 0.1, step = 0.6;
  const rib = (pts, lat) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      const L0 = [p[0] - lat[0] * hw, p[1], p[2] - lat[1] * hw], R0 = [p[0] + lat[0] * hw, p[1], p[2] + lat[1] * hw], A0 = [p[0], p[1] + up, p[2]];
      const L1 = [q[0] - lat[0] * hw, q[1], q[2] - lat[1] * hw], R1 = [q[0] + lat[0] * hw, q[1], q[2] + lat[1] * hw], A1 = [q[0], q[1] + up, q[2]];
      tri(out, L0, L1, A1); tri(out, L0, A1, A0); tri(out, R0, A0, A1); tri(out, R0, A1, R1);
    }
  };
  const W = (u, v) => [cx + u, h(u, v) + 0.04, cz + v];
  // the long slopes (v = ±b): rows run along v from the eave up toward the ridge
  for (const sv of [-1, 1]) for (let u = -a + 0.5; u <= a - 0.45; u += step) {
    const au = Math.abs(u), avEnd = Math.max(0.3, au - (a - b)) + 0.4, avStart = b - 0.18;
    if (avEnd >= avStart - 0.3) continue;
    const n = Math.max(1, Math.ceil((avStart - avEnd) / 1.0)), pts = [];
    for (let k = 0; k <= n; k++) pts.push(W(u + (H(u, sv, k, a, b, 4) - 0.5) * 0.004, sv * (avStart + (avEnd - avStart) * k / n)));
    rib(pts, [1, 0]);
  }
  // the hip ends (u = ±a): rows run along u
  for (const su of [-1, 1]) for (let v = -b + 0.5; v <= b - 0.45; v += step) {
    const av = Math.abs(v), auEnd = a - (b - av) + 0.4, auStart = a - 0.18;
    if (auEnd >= auStart - 0.3) continue;
    const n = Math.max(1, Math.ceil((auStart - auEnd) / 1.0)), pts = [];
    for (let k = 0; k <= n; k++) pts.push(W(su * (auStart + (auEnd - auStart) * k / n), v + (H(su, v, k, a, b, 5) - 0.5) * 0.004));
    rib(pts, [0, 1]);
  }
  bag.add('tile_dark', fromTriangles(out));
}
function tri(out, a, b, c) {                // a triangle facing up (its normal's y > 0)
  const ux = c[0] - b[0], uz = c[2] - b[2], vx = a[0] - b[0], vz = a[2] - b[2], uy = c[1] - b[1], vy = a[1] - b[1];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  // an up-facing side may be steep: choose the orientation facing away from the rib's axis (outward-up) by the sign of ny, ties by n . (0,1,0)
  void nx; void nz;
  if (ny > 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}

/** The tile rows of the pent roof round a storey (the four trapezoids from outer edge half O at yo up to the wall half I at yi). */
export function pentRows(bag, cx, cz, O, I, yo, yi) {
  const out = [], hw = 0.075, up = 0.1;
  for (const [sx, sz, tx, tz] of [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 1]]) {
    const o0 = [cx + sx * O, yo, cz + sz * O], o1 = [cx + tx * O, yo, cz + tz * O], i0 = [cx + sx * I, yi, cz + sz * I], i1 = [cx + tx * I, yi, cz + tz * I];
    const len = 2 * O, n = Math.round(len / 0.6);
    for (let k = 1; k < n; k++) {
      const q = k / n, o = [o0[0] + (o1[0] - o0[0]) * q, o0[1], o0[2] + (o1[2] - o0[2]) * q];
      const i = [i0[0] + (i1[0] - i0[0]) * q, i0[1], i0[2] + (i1[2] - i0[2]) * q];
      const p = [o[0] + (i[0] - o[0]) * 0.04, o[1] + (i[1] - o[1]) * 0.04 + 0.04, o[2] + (i[2] - o[2]) * 0.04], qq = [i[0] + (o[0] - i[0]) * 0.03, i[1] + (o[1] - i[1]) * 0.03 + 0.04, i[2] + (o[2] - i[2]) * 0.03];
      const l = sz === tz ? [1, 0] : [0, 1];
      const L0 = [p[0] - l[0] * hw, p[1], p[2] - l[1] * hw], R0 = [p[0] + l[0] * hw, p[1], p[2] + l[1] * hw], A0 = [p[0], p[1] + up, p[2]];
      const L1 = [qq[0] - l[0] * hw, qq[1], qq[2] - l[1] * hw], R1 = [qq[0] + l[0] * hw, qq[1], qq[2] + l[1] * hw], A1 = [qq[0], qq[1] + up, qq[2]];
      tri(out, L0, L1, A1); tri(out, L0, A1, A0); tri(out, R0, A0, A1); tri(out, R0, A1, R1);
    }
  }
  bag.add('tile_dark', fromTriangles(out));
}

/** Raked struts (cantilever brackets) that carry the deep eave of a storey: wall half w, eave edge half E, eave height y0; on the middles of the faces and the corners. */
export function eaveStruts(bag, cx, cz, w, E, y0, offs) {
  const ys = y0 - 0.45 - 1.5, ye = y0 - 0.5;
  const one = (px, pz, nx, nz, reach, drop) => {
    const a = [px, ys + drop, pz], b = [px + nx * reach, ye, pz + nz * reach];
    bag.add('timber_red', jr(a, b, 0.13, 6));
    ob(bag, 'timber_red', px + nx * 0.2, pz + nz * 0.2, nx, nz, 0.25, 0.25, ys + drop - 0.35, ys + drop - 0.05);           // the block it springs from
    ob(bag, 'timber', b[0], b[2], nx, nz, 0.22, 0.22, ye - 0.1, ye + 0.1);                                                    // the sheng that takes the eave
  };
  for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (const o of offs) {
    const px = cx + nx * (w + 0.3) + (nx ? 0 : o), pz = cz + nz * (w + 0.3) + (nz ? 0 : o);
    one(px, pz, nx, nz, E - w - 0.7, 0);
  }
}

/** A post-and-rail balustrade for one side of a stair (see terrace.js stairFlanks): the posts, two raking rails and the balusters between. */
export function stairBalustrade(bag, rect, T, n, wallH, railH) {
  const [sx0, sz0, sx1, sz1] = rect, d = (sx1 - sx0) / n, L = sx1 - sx0;
  const slope = (x) => T * (sx1 - x) / L;
  for (const [za, zb] of [[sz0 - 0.5, sz0], [sz1, sz1 + 0.5]]) {
    const zc = (za + zb) / 2;
    const postX = []; for (let i = 0; i <= n; i += 4) postX.push(sx1 - d * i);
    for (const x of postX) {
      if (x > sx1 - 1e-6) continue;
      const y = slope(x);
      bag.add('bluestone', jb(x - 0.16, y + wallH - 0.2, zc - 0.16, x + 0.16, y + railH + 0.1, zc + 0.16));
      bag.add('bluestone', jb(x - 0.23, y + railH + 0.1, zc - 0.23, x + 0.23, y + railH + 0.2, zc + 0.23));
      const r = 0.1 + (H(x, y, zc, 6) - 0.5) * 0.001;
      bag.add('bronze', lathe([[0.001, 0], [r * 0.9, 0.03], [r * 1.5, 0.15], [r, 0.3], [0.001, 0.34]], 8, null, x, y + railH + 0.2, zc));
    }
    for (let q = 0; q < postX.length - 1; q++) {
      const xa = postX[q], xb = postX[q + 1];
      for (const [h, r] of [[railH - 0.08, 0.055], [0.95, 0.04]]) bag.add('lacquer_red', jr([xa - 0.12, slope(xa - 0.12) + h, zc], [xb + 0.12, slope(xb + 0.12) + h, zc], r, 6));
      for (let k = 1; k <= 3; k++) {
        const x = xa + (xb - xa) * k / 4, yb = slope(xa - d * 2 * 0 - 0) - 0 ;
        void yb;
        // each baluster stands on the wall top of its own pair of steps and runs up to the top rail
        const i2 = Math.ceil((sx1 - x) / (2 * d)) * 2, wallTop = T * Math.min(n, i2) / n + wallH;
        bag.add('bluestone', jb(x - 0.045, wallTop, zc - 0.045, x + 0.045, slope(x) + railH - 0.1, zc + 0.045));
      }
    }
  }
}

/** Bays of the earth face of one lift (face E: x = xf, from z a to b between pilasters): a recessed-looking panel with a skirt, a frame and the ramming courses. */
export function earthBay(bag, xf, z0, z1, ya, yb) {
  const o = 0.05;
  bag.add('bluestone', jb(xf - 0.02, ya, z0, xf + 0.1, ya + 0.5, z1));                                                     // the stone skirt
  bag.add('mud_plaster', jb(xf - 0.02, ya + 0.5, z0, xf + o + 0.02, ya + 0.62, z1));                                        // its top moulding
  bag.add('mud_plaster', jb(xf - 0.02, yb - 1.12, z0, xf + o + 0.02, yb - 1.0, z1));                                         // the frame's head
  const bandTop = yb - 1.12, bandBot = ya + 0.62, n = Math.max(2, Math.round((bandTop - bandBot) / 0.42));
  for (let k = 1; k < n; k++) { const y = bandBot + (bandTop - bandBot) * k / n; bag.add('mud_plaster', jb(xf - 0.02, y - 0.025, z0 + 0.12, xf + 0.03, y + 0.025, z1 - 0.12)); }   // the ramming courses
}

/** The bay of an earth face on any side: as earthBay, but on a face at `f` (fixed coordinate) looking out along `n` (+1/-1), the bay running t0..t1 along axis `ax` ('x' for the N and S faces, 'z' for the W face). */
export function earthBaySide(bag, ax, f, n, t0, t1, ya, yb) {
  const o = 0.05, B = (d0, d1, y0, y1, a, b) => { const lo = n > 0 ? f + d0 : f - d1, hi = n > 0 ? f + d1 : f - d0; return ax === 'x' ? jb(a, y0, lo, b, y1, hi) : jb(lo, y0, a, hi, y1, b); };
  bag.add('bluestone', B(-0.02, 0.1, ya, ya + 0.5, t0, t1));
  bag.add('mud_plaster', B(-0.02, o + 0.02, ya + 0.5, ya + 0.62, t0, t1));
  bag.add('mud_plaster', B(-0.02, o + 0.02, yb - 1.12, yb - 1.0, t0, t1));
  const bandTop = yb - 1.12, bandBot = ya + 0.62, k2 = Math.max(2, Math.round((bandTop - bandBot) / 0.42));
  for (let k = 1; k < k2; k++) { const y = bandBot + (bandTop - bandBot) * k / k2; bag.add('mud_plaster', B(-0.02, 0.03, y - 0.025, y + 0.025, t0 + 0.12, t1 - 0.12)); }
}

/** Cross-bracing for the piers of a skyway (centre line along z at x = ax, or along x at z = az): X braces between neighbouring piers, tie beams across. */
export function pierBracing(bag, alongX, ax, az, x0, z0, L, n, w, y) {
  const pos = (i, s) => (alongX ? [x0 + L * i / n, az + s * (w / 2 - 0.3)] : [ax + s * (w / 2 - 0.3), z0 + L * i / n]);
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
    const a = pos(i, s), b = pos(i + 1, s), off = s * 0.47;
    const A = (p, yy) => (alongX ? [p[0], yy, p[1] + off] : [p[0] + off, yy, p[1]]);
    for (const [y0, y1] of [[1.2, 5.2], [5.2, 9.2]]) { bag.add('timber', jr(A(a, y0), A(b, y1), 0.1)); bag.add('timber', jr(A(a, y1), A(b, y0), 0.1)); }
  }
  for (let i = 0; i <= n; i++) for (const yy of [5.2, 9.2, y - 0.9]) {
    const a = pos(i, -1), b = pos(i, 1);
    bag.add('timber_red', alongX ? jb(a[0] - 0.14, yy - 0.14, a[1], a[0] + 0.14, yy + 0.14, b[1]) : jb(a[0], yy - 0.14, a[1] - 0.14, b[0], yy + 0.14, a[1] + 0.14));
  }
  // the knee braces under the deck's edge: from the pier top out to the deck beam
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) {
    const p = pos(i, s), off = s * 0.47;
    bag.add('timber_red', alongX ? jr([p[0], y - 2.0, p[1] + off], [p[0], y - 0.35, p[1] + s * (w / 2 + 0.3)], 0.1) : jr([p[0] + off, y - 2.0, p[1]], [p[0] + s * (w / 2 + 0.3), y - 0.35, p[1]], 0.1));
  }
}
