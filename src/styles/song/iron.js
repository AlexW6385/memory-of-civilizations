// The Iron Pagoda's glazed skin (docs/settlements/song-kaifeng.md §10, "The Iron Pagoda's glazed
// bricks"): more than fifty kinds of moulded glazed brick — seated Buddhas, flying figures, flowers,
// lions — laid in rows on every face; the arched doors and windows in glazed-brick surrounds. The
// moulded bricks are a few shapes repeated thousands of times, so each is built once and placed as
// an instance (GeoBag.addInstance) on the face's plane.

import { box, lathe, orientOutward } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

/** An ellipsoid (low-poly) of radii rx, ry, rz at (x, y, z), turned by `rz0` about the face's normal. */
function ell(x, y, z, rx, ry, rz, rot = 0, seg = 8, rows = 5) {
  const prof = [];
  for (let i = 0; i <= rows; i++) { const a = -Math.PI / 2 + (i / rows) * Math.PI; prof.push([Math.max(0.001, Math.cos(a)), Math.sin(a)]); }
  const g = lathe(prof, seg); g.scale(rx, ry, rz);
  if (rot) g.applyMatrix4(new Matrix4().makeRotationZ(rot));
  g.translate(x, y, z); return g;
}
/** A disc facing out of the face (+z), radii rx × ry, from z0 to z1, centre (x, y). */
function plate(x, y, rx, ry, z0, z1, seg = 12) {
  const g = lathe([[0.001, 0], [1, 0], [1, 1], [0.001, 1]], seg);
  g.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));   // the axis now along -z: y 0…1 → z 0…-1
  g.scale(rx, ry, z1 - z0); g.translate(x, y, z1); return g;
}
const S = 0.42;   // the moulded brick's pitch (m) [inferred]
let PROTO = null;
/** The moulded bricks, each { role: [geometries] }, built at the face's plane (z = 0, out along +z), the brick's foot at y = 0. */
function protos() {
  if (PROTO) return PROTO;
  const h = S - 0.02, w = S - 0.02;
  const plaque = (W) => box(-W / 2, 0.01, -0.03, W / 2, h + 0.01, 0.03);
  // a seated Buddha in his niche: the brick, a mandorla and a head halo, the lotus seat, the crossed legs, the hands in the lap, the body, the head with its topknot
  const buddha = [plaque(w),
    plate(0, 0.2, 0.14, 0.16, 0.03, 0.045), plate(0, 0.29, 0.065, 0.065, 0.045, 0.055),
    ell(0, 0.07, 0.05, 0.12, 0.035, 0.035), ell(0, 0.115, 0.065, 0.1, 0.035, 0.045),
    ell(0, 0.13, 0.1, 0.035, 0.02, 0.02), ell(0, 0.19, 0.065, 0.055, 0.07, 0.035),
    ell(0, 0.282, 0.07, 0.032, 0.04, 0.032), ell(0, 0.322, 0.065, 0.016, 0.016, 0.016, 0, 6, 3)];
  // a flower (a rosette of eight petals round a boss) in a round frame
  const flower = [plaque(w), plate(0, 0.2, 0.165, 0.165, 0.03, 0.045, 16), ell(0, 0.2, 0.06, 0.04, 0.04, 0.03)];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; flower.push(ell(Math.cos(a) * 0.095, 0.2 + Math.sin(a) * 0.095, 0.05, 0.055, 0.03, 0.02, a, 6, 3)); }
  // a flying figure (feitian) over clouds on a double brick: the body lying along the brick, the head, the arms, the streaming scarf, the clouds below
  const fly = [plaque(2 * S - 0.02),
    ell(0.06, 0.22, 0.05, 0.2, 0.045, 0.03, 0.18), ell(-0.17, 0.26, 0.06, 0.035, 0.04, 0.03),
    ell(-0.2, 0.2, 0.06, 0.07, 0.016, 0.016, -0.6, 6, 3), ell(-0.05, 0.3, 0.055, 0.08, 0.015, 0.015, 0.4, 6, 3)];
  for (let k = 0; k < 6; k++) { const t = k / 5; fly.push(ell(0.22 + t * 0.15, 0.3 - Math.sin(t * Math.PI) * 0.08 + t * 0.03, 0.045, 0.05, 0.014, 0.012, -0.5 + t, 6, 3)); }
  for (const [x, r] of [[-0.25, 0.06], [-0.1, 0.075], [0.06, 0.07], [0.22, 0.06]]) fly.push(ell(x, 0.08, 0.045, r, r * 0.55, 0.025, 0, 8, 3));
  // a lion seated, facing out (on the corner bricks under the brackets)
  const lion = [plaque(w), ell(0, 0.1, 0.06, 0.09, 0.05, 0.05), ell(0, 0.19, 0.065, 0.06, 0.08, 0.045), ell(0, 0.29, 0.08, 0.065, 0.06, 0.05),
    ell(0, 0.27, 0.12, 0.03, 0.025, 0.02), ell(-0.045, 0.06, 0.1, 0.02, 0.05, 0.02), ell(0.045, 0.06, 0.1, 0.02, 0.05, 0.02)];
  PROTO = { buddha, flower, fly, lion };
  return PROTO;
}
const _M = new Matrix4(), _T = new Matrix4();
/** Place a moulded brick: at (px, y, pz) on a face running along u (its outside n). */
function put(bag, mat, list, px, y, pz, ux, uz, nx, nz) {
  _M.set(ux, 0, nx, px, 0, 1, 0, y, uz, 0, nz, pz, 0, 0, 0, 1);
  for (const g of list) {
    if (bag.addInstance) bag.addInstance(mat, g.clone(), _T.copy(_M), { reach: 160 });
    else bag.add(mat, g.clone().applyMatrix4(_M));
  }
}

/**
 * The glazed skin of one storey of the Iron Pagoda: on each face (the octagon of circumradius r, from
 * y to y + h) rows of moulded bricks — seated Buddhas, a row of flowers every fourth row, a frieze of
 * flying figures under the brackets — leaving the arched opening in the middle of the face (a door
 * on the four faces to the compass points, a window on the diagonals); the opening's glazed-brick
 * surround (jambs and a round arch) and its dark depth. `top`: the height (above y) the bricks stop.
 */
export function ironSkin(bag, mat, cx, cz, r, y, h, top, i, open = null) {
  const P = protos(), G = [];
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k / 8 * Math.PI * 2; G.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  const dark = [], frame = [];
  for (let k = 0; k < 8; k++) {
    const a = G[k], b = G[(k + 1) % 8], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    let nx = (b[1] - a[1]) / L, nz = -(b[0] - a[0]) / L;
    if ((mx - cx) * nx + (mz - cz) * nz < 0) { nx = -nx; nz = -nz; }
    const ux = nz, uz = -nx;   // along the face, so that u × up = n
    // the opening: half-width wo, from ys up the jambs to yj, the round arch over them
    const door = k % 2 === 1;     // doors on the four faces to the compass points (k = 1 south, 3 west, 5 north, 7 east), windows on the diagonals [stated: doors on four sides]
    const op = open && open[k];   // an opening cut through the wall (the pagoda's inside is walkable): [sill, top, half-width] above y
    let wo = door ? (i === 0 ? 0.75 : 0.55) : 0.34;
    let ys = door ? y + 0.02 : y + Math.max(0.9, h * 0.3), yj = door ? y + Math.min(2.4, h * 0.4) : ys + 0.7;
    if (op) { wo = op[2]; ys = y + op[0]; yj = y + op[1] - wo * 0.0; }
    const ya = yj + wo;
    const fw = 0.13;
    // the bricks: columns across the face between the corner columns, rows up to the frieze
    const per = Math.floor((L - 0.4) / S), u0 = -per * S / 2;
    const rows = Math.max(2, Math.floor((top - 0.2) / S) - 1), y0 = y + top - (rows + 1) * S;
    for (let ri = 0; ri < rows; ri++) {
      const yy = y0 + ri * S;
      for (let j = 0; j < per; j++) {
        const u = u0 + (j + 0.5) * S;
        if (Math.abs(u) < wo + fw + S / 2 - 0.02 && yy + S > ys - 0.05 && yy < ya + fw + 0.03) continue;
        const kind = ri % 4 === 3 ? P.flower : P.buddha;
        put(bag, mat, kind, mx + ux * u, yy, mz + uz * u, ux, uz, nx, nz);
      }
    }
    // the frieze under the brackets: flying figures on double bricks, a lion at each end
    {
      const yy = y0 + rows * S, pairs = Math.floor((per - 2) / 2), uf = -pairs * S;
      put(bag, mat, P.lion, mx + ux * (uf - S / 2), yy, mz + uz * (uf - S / 2), ux, uz, nx, nz);
      put(bag, mat, P.lion, mx - ux * (uf - S / 2), yy, mz - uz * (uf - S / 2), ux, uz, nx, nz);
      for (let j = 0; j < pairs; j++) { const u = uf + (j + 0.5) * 2 * S; put(bag, mat, P.fly, mx + ux * u, yy, mz + uz * u, ux, uz, nx, nz); }
    }
    // the opening's dark depth (a panel just proud of the wall) and its surround
    const Q = (u, yy, d) => [mx + ux * u + nx * d, yy, mz + uz * u + nz * d];
    const quad = (out, p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    const N = 10, arc = (t, rr) => [Math.cos(Math.PI * (1 - t)) * rr, yj + Math.sin(Math.PI * t) * rr];
    if (!op) {
    quad(dark, Q(-wo, ys, 0.012), Q(wo, ys, 0.012), Q(wo, yj, 0.012), Q(-wo, yj, 0.012));
    for (let s = 0; s < N; s++) { const p = arc(s / N, wo), q = arc((s + 1) / N, wo); dark.push(...Q(0, yj, 0.012), ...Q(q[0], q[1], 0.012), ...Q(p[0], p[1], 0.012)); }
    }
    const slabT = (out, pts) => {   // a solid between the wall (d = -0.03) and d = 0.09 over the plan quad pts [[u, y] ×4]
      const f = pts.map(([u, yy]) => Q(u, yy, 0.09)), bk = pts.map(([u, yy]) => Q(u, yy, -0.03)), t = [];
      quad(t, f[0], f[1], f[2], f[3]); quad(t, bk[0], bk[3], bk[2], bk[1]);
      for (let e = 0; e < 4; e++) { const n2 = (e + 1) % 4; quad(t, bk[e], bk[n2], f[n2], f[e]); }
      out.push(...orientOutward(t));
    };
    for (const sg of [-1, 1]) slabT(frame, sg < 0 ? [[-wo - fw, ys], [-wo, ys], [-wo, yj], [-wo - fw, yj]] : [[wo, ys], [wo + fw, ys], [wo + fw, yj], [wo, yj]]);
    for (let s = 0; s < N; s++) { const p0 = arc(s / N, wo), p1 = arc((s + 1) / N, wo), q1 = arc((s + 1) / N, wo + fw), q0 = arc(s / N, wo + fw); slabT(frame, [p0, q0, q1, p1]); }
    if (!door) slabT(frame, [[-wo - fw - 0.05, ys - 0.1], [wo + fw + 0.05, ys - 0.1], [wo + fw + 0.05, ys], [-wo - fw - 0.05, ys]]);   // the sill
  }
  return { dark, frame };
}

/** One moulded relief ('buddha' | 'flower' | 'lion' | 'fly' (a double width)) centred at (px, pz), its foot at y, on a face whose outside is (nx, nz). */
export function relief(bag, mat, kind, px, y, pz, nx, nz) { put(bag, mat, protos()[kind], px, y, pz, nz, -nx, nx, nz); }
export const RELIEF_PITCH = S;
