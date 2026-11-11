// The Pantheon's own pieces, on top of the Roman style (src/styles/roman): the eight aediculae between the niches with
// their alternating triangular and segmental pediments; the attic's porphyry pilasters and framed blind windows; the
// bronze doorway (leaves of panels and studs, fluted bronze pilasters with Tuscan capitals and their entablature, the
// transom of six lattice panels); the eagle in its wreath in the portico's pediment. docs/buildings/pantheon.md §4, §7, §8.

import '../../styles/greek/index.js';
import '../../styles/roman/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const D2R = Math.PI / 180;
/** A frame in a vertical plane: origin o [x, z], u along, n out (toward the viewer). W(u, y, d) → [x, y, z]. */
const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
/** A sloping bar in a frame from (ua, ya) to (ub, yb), h thick (vertically), d0…d1 deep. */
function slope(out, W, ua, ya, ub, yb, h, d0, d1) {
  hexa(out, [W(ua, ya, d0), W(ub, yb, d0), W(ub, yb, d1), W(ua, ya, d1)], [W(ua, ya + h, d0), W(ub, yb + h, d0), W(ub, yb + h, d1), W(ua, ya + h, d1)]);
}
/** A radial frame at a bearing (degrees clockwise from north, -z) on a circle of radius r about c, n toward the centre. */
function radial(c, r, b) {
  const a = (b - 90) * D2R, ux = Math.cos(a), uz = Math.sin(a);
  return frame([c[0] + ux * r, c[1] + uz * r], [-uz, ux], [-ux, -uz]);
}

/**
 * aedicula { c, R (the wall's inner radius), bearing, kind ('tri' | 'seg'), y }: against the drum between two niches, a
 * podium with a moulded base and cornice; two porphyry columns on it standing a little out from two pilasters; their
 * entablature breaking forward over them; a triangular or a segmental pediment. [stated: archeoroma — eight aediculae,
 * alternating pediments, porphyry shafts; proportions inferred]
 */
function aedicula(el, ctx) {
  const { bag } = ctx, W = radial(el.c, el.R, el.bearing), y = el.y;
  const pod = [], wh = [], gi = [], pv = [];
  const hw = 1.9, D = 1.85;                                   // half-width; depth from the wall
  // the podium: base, die (giallo), cornice
  fbox(wh, W, -hw - 0.12, hw + 0.12, y, y + 0.3, -0.05, D + 0.12);
  fbox(wh, W, -hw - 0.05, hw + 0.05, y + 0.3, y + 0.4, -0.05, D + 0.05);
  fbox(pod, W, -hw, hw, y + 0.4, y + 1.3, -0.05, D);
  fbox(wh, W, -hw - 0.06, hw + 0.06, y + 1.3, y + 1.38, -0.05, D + 0.06);
  fbox(wh, W, -hw - 0.14, hw + 0.14, y + 1.38, y + 1.5, -0.05, D + 0.14);
  // a framed panel on the podium's face
  fbox(wh, W, -hw + 0.25, hw - 0.25, y + 0.55, y + 0.62, D - 0.02, D + 0.03);
  fbox(wh, W, -hw + 0.25, hw - 0.25, y + 1.08, y + 1.15, D - 0.02, D + 0.03);
  fbox(wh, W, -hw + 0.25, -hw + 0.32, y + 0.62, y + 1.08, D - 0.02, D + 0.03);
  fbox(wh, W, hw - 0.32, hw - 0.25, y + 0.62, y + 1.08, D - 0.02, D + 0.03);
  // the columns (Corinthian, porphyry shafts) and the pilasters behind them against the back slab
  const yc = y + 1.5, ch = 4.6, colU = 1.42, colD = 1.2;
  for (const s of [-1, 1]) {
    const p = W(s * colU, 0, colD);
    STYLES.roman.column({ at: [p[0], p[2]], y: yc, h: ch, d: 0.5, mat: 'marble', shaftMat: 'porphyry' }, ctx);
    fbox(pod, W, s * colU - 0.3, s * colU + 0.3, yc, yc + ch, -0.05, 0.22);
  }
  // the back slab between the pilasters (pavonazzetto), where a statue stood
  fbox(pv, W, -colU + 0.3, colU - 0.3, yc, yc + ch, -0.05, 0.12);
  // the entablature: architrave (two fasciae), frieze, cornice — breaking forward over the columns
  const ye = yc + ch, eD = colD + 0.4;
  fbox(wh, W, -hw, hw, ye, ye + 0.22, -0.05, eD);
  fbox(wh, W, -hw - 0.03, hw + 0.03, ye + 0.22, ye + 0.42, -0.05, eD + 0.03);
  fbox(pod, W, -hw, hw, ye + 0.42, ye + 0.78, -0.05, eD);
  fbox(gi, W, -hw - 0.02, hw + 0.02, ye + 0.78, ye + 0.84, -0.05, eD + 0.05);
  fbox(wh, W, -hw - 0.08, hw + 0.08, ye + 0.84, ye + 0.96, -0.05, eD + 0.12);
  fbox(wh, W, -hw - 0.2, hw + 0.2, ye + 0.96, ye + 1.16, -0.05, eD + 0.24);
  // dentils under the cornice
  for (let u = -hw + 0.06; u < hw - 0.05; u += 0.17) fbox(wh, W, u, u + 0.09, ye + 0.84, ye + 0.96, eD + 0.1, eD + 0.2);
  const yp = ye + 1.16, ph = 1.15;
  if (el.kind === 'seg') {
    // a segmental pediment: a curved cornice over a curved tympanum
    const rr = (hw * hw + ph * ph) / (2 * ph), cyy = yp + ph - rr, n = 16, a0 = Math.asin(hw / rr);
    for (let i = 0; i < n; i++) {
      const t0 = -a0 + 2 * a0 * i / n, t1 = -a0 + 2 * a0 * (i + 1) / n;
      const P = (r, t, d) => W(r * Math.sin(t), cyy + r * Math.cos(t), d);
      hexa(wh, [P(rr - 0.05, t0, -0.05), P(rr + 0.25, t0, -0.05), P(rr + 0.25, t1, -0.05), P(rr - 0.05, t1, -0.05)], [P(rr - 0.05, t0, eD + 0.24), P(rr + 0.25, t0, eD + 0.24), P(rr + 0.25, t1, eD + 0.24), P(rr - 0.05, t1, eD + 0.24)]);
      // the tympanum: a strip from the cornice's top down to the curve
      const ua = rr * Math.sin(t0), ub = rr * Math.sin(t1);
      hexa(pod, [W(ua, yp, -0.05), W(ub, yp, -0.05), W(ub, yp, eD - 0.15), W(ua, yp, eD - 0.15)], [W(ua, cyy + (rr - 0.04) * Math.cos(t0), -0.05), W(ub, cyy + (rr - 0.04) * Math.cos(t1), -0.05), W(ub, cyy + (rr - 0.04) * Math.cos(t1), eD - 0.15), W(ua, cyy + (rr - 0.04) * Math.cos(t0), eD - 0.15)]);
    }
  } else {
    for (const s of [-1, 1]) slope(wh, W, s * (hw + 0.2), yp - 0.02, 0, yp + ph, 0.26, -0.05, eD + 0.24);
    // the tympanum as vertical strips under the slopes
    const n = 8;
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
      const u0 = s * hw * i / n, u1 = s * hw * (i + 1) / n, h0 = ph * (1 - i / n) - 0.02, h1 = ph * (1 - (i + 1) / n) - 0.02;
      hexa(pod, [W(u0, yp, -0.05), W(u1, yp, -0.05), W(u1, yp, eD - 0.15), W(u0, yp, eD - 0.15)], [W(u0, yp + Math.max(0.02, h0), -0.05), W(u1, yp + Math.max(0.02, h1), -0.05), W(u1, yp + Math.max(0.02, h1), eD - 0.15), W(u0, yp + Math.max(0.02, h0), eD - 0.15)]);
    }
  }
  bag.add('giallo', fromTriangles(pod));
  bag.add('marble', fromTriangles(wh));
  bag.add('gilt_bronze', fromTriangles(gi));
  bag.add('pavonazzetto', fromTriangles(pv));
  const p0 = W(-hw, 0, -0.05), p1 = W(hw, 0, -0.05), p2 = W(hw, 0, D), p3 = W(-hw, 0, D);
  ctx.col.obstacles.push({ poly: [[p0[0], p0[2]], [p1[0], p1[2]], [p2[0], p2[2]], [p3[0], p3[2]]], y0: y, y1: y + 1.5 });
}

/**
 * attic { c, R, y0, y1, skip: [bearings] }: the band between the first cornice and the dome, as originally faced: a
 * plinth; a blind window in a white marble frame with a small cornice over each of the sixteen bays (above the niches
 * and the aediculae); narrow porphyry pilasters with white bases and capitals between them; the field in panels of
 * pavonazzetto framed in giallo. [stated: the attic's original porphyry panels and pilasters — archeoroma (dossier §8);
 * the 1930 restoration of one bay; rhythm and sizes inferred]
 */
function attic(el, { bag }) {
  const { c, R, y0, y1 } = el, red = [], wh = [], gy = [], dk = [], pv = [];
  const skip = new Set(el.skip || []);
  /** a curved slab following the wall: bearing b ± half-width hw (metres along the wall), heights ya…yb, d0…d1 in from the face */
  const arc = (out, b, u0, u1, ya, yb, d0, d1) => {
    const n = Math.max(1, Math.ceil((u1 - u0) / 0.6));
    for (let i = 0; i < n; i++) {
      const t0 = (b - 90) * D2R + (u0 + (u1 - u0) * i / n) / R, t1 = (b - 90) * D2R + (u0 + (u1 - u0) * (i + 1) / n) / R;
      const P = (d, t, yy) => [c[0] + (R - d) * Math.cos(t), yy, c[1] + (R - d) * Math.sin(t)];
      hexa(out, [P(d0, t0, ya), P(d1, t0, ya), P(d1, t1, ya), P(d0, t1, ya)], [P(d0, t0, yb), P(d1, t0, yb), P(d1, t1, yb), P(d0, t1, yb)]);
    }
  };
  for (let k = 0; k < 16; k++) {
    const b = k * 22.5, bp = b + 11.25;
    // the pilaster between this bay and the next
    arc(wh, bp, -0.38, 0.38, y0, y0 + 0.3, -0.05, 0.16);
    arc(red, bp, -0.3, 0.3, y0 + 0.3, y1 - 0.45, -0.05, 0.1);
    arc(wh, bp, -0.36, 0.36, y1 - 0.45, y1 - 0.3, -0.05, 0.15);
    arc(wh, bp, -0.4, 0.4, y1 - 0.3, y1 - 0.18, -0.05, 0.18);
    if (skip.has(b)) continue;
    // the field: a giallo frame round a pavonazzetto panel, either side of the window
    for (const [A, B] of [[-3.6, -1.45], [1.45, 3.6]]) {
      arc(gy, b, A, B, y0 + 0.5, y1 - 0.65, -0.05, 0.03);
      arc(pv, b, A + 0.16, B - 0.16, y0 + 0.66, y1 - 0.81, -0.05, 0.05);
    }
    // the blind window: a dark slab in a moulded frame, a sill, a cornice over it
    const wy0 = y0 + 2.2, wy1 = y1 - 1.6, hw = 1.05;
    arc(dk, b, -hw, hw, wy0, wy1, -0.05, 0.03);
    arc(wh, b, -hw - 0.22, -hw, wy0, wy1, -0.05, 0.1);
    arc(wh, b, hw, hw + 0.22, wy0, wy1, -0.05, 0.1);
    arc(wh, b, -hw - 0.22, hw + 0.22, wy1, wy1 + 0.22, -0.05, 0.1);
    arc(wh, b, -hw - 0.3, hw + 0.3, wy0 - 0.16, wy0, -0.05, 0.14);
    arc(wh, b, -hw - 0.32, hw + 0.32, wy1 + 0.22, wy1 + 0.32, -0.05, 0.16);
    arc(wh, b, -hw - 0.42, hw + 0.42, wy1 + 0.32, wy1 + 0.46, -0.05, 0.26);
    // a porphyry panel under the window
    arc(red, b, -hw + 0.1, hw - 0.1, y0 + 0.75, wy0 - 0.45, -0.05, 0.05);
  }
  // the plinth band at the attic's foot
  for (let k = 0; k < 16; k++) arc(wh, k * 22.5, 0, 2 * Math.PI * R / 16, y0, y0 + 0.3, -0.05, 0.12);
  bag.add('porphyry', fromTriangles(red));
  bag.add('marble', fromTriangles(wh));
  bag.add('giallo', fromTriangles(gy));
  bag.add('pavonazzetto', fromTriangles(pv));
  bag.add('marble_dark', fromTriangles(dk));
}

/**
 * The bronze doorway { at [x, z] (the threshold's centre, on the door's plane), y, w, h, top (the top of the opening, with
 * the transom) }: two leaves standing open into the rotunda, each a frame of stiles and rails round two panels with bronze
 * studs along the rails; either side a fluted bronze pilaster with a Tuscan capital; their entablature with a short frieze
 * across at the leaves' top; over it the transom of six lattice panels. Faces -z (the portico). [stated: Wikipedia, Doors
 * of the Roman Pantheon — two leaves of cast bronze, the pilasters and entablature, the six lattice panels; panel
 * division and studs inferred]
 */
function pantheonDoor(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, w = el.w, h = el.h, top = el.top;
  const W = frame([x, z], [1, 0], [0, -1]);
  const br = [], gl = [];
  const hw = w / 2;
  // the pilasters, inside the jambs: fluted shafts, bases, capitals
  for (const s of [-1, 1]) {
    const u0 = s * hw - (s > 0 ? 0.42 : -0.42), uc = (u0 + s * hw) / 2;
    fbox(br, W, uc - 0.24, uc + 0.24, y, y + 0.3, -0.05, 0.16);
    fbox(br, W, uc - 0.2, uc + 0.2, y + 0.3, y + h - 0.55, -0.05, 0.08);
    for (let f = -2; f <= 2; f++) fbox(br, W, uc + f * 0.075 - 0.02, uc + f * 0.075 + 0.02, y + 0.45, y + h - 0.7, 0.07, 0.11);
    fbox(br, W, uc - 0.23, uc + 0.23, y + h - 0.55, y + h - 0.45, -0.05, 0.12);
    fbox(gl, W, uc - 0.25, uc + 0.25, y + h - 0.45, y + h - 0.38, -0.05, 0.14);      // the egg-and-dart (gilt)
    fbox(br, W, uc - 0.27, uc + 0.27, y + h - 0.38, y + h - 0.26, -0.05, 0.16);
  }
  // the entablature across the top of the leaves
  fbox(br, W, -hw, hw, y + h - 0.26, y + h - 0.06, -0.05, 0.12);
  fbox(br, W, -hw, hw, y + h - 0.06, y + h + 0.3, -0.05, 0.06);
  fbox(br, W, -hw, hw, y + h + 0.3, y + h + 0.48, -0.05, 0.2);
  // the transom: six lattice panels in a bronze frame
  const t0 = y + h + 0.48, t1 = top, pw = (w - 0.2) / 6;
  fbox(br, W, -hw, hw, t1 - 0.14, t1, -0.05, 0.1);
  for (let k = 0; k <= 6; k++) fbox(br, W, -hw + 0.1 + k * pw - 0.06, -hw + 0.1 + k * pw + 0.06, t0, t1 - 0.14, -0.05, 0.1);
  for (let k = 0; k < 6; k++) {
    const ua = -hw + 0.1 + k * pw + 0.06, ub = ua + pw - 0.12, hh = t1 - 0.14 - t0, m = 6;
    // a lozenge lattice: bars on both diagonals at 45°, 0.24 m apart, clipped to the panel
    const bar = (A, B) => hexa(br, [W(A[0] - 0.02, A[1], -0.02), W(A[0] + 0.02, A[1], -0.02), W(A[0] + 0.02, A[1], 0.02), W(A[0] - 0.02, A[1], 0.02)], [W(B[0] - 0.02, B[1], -0.02), W(B[0] + 0.02, B[1], -0.02), W(B[0] + 0.02, B[1], 0.02), W(B[0] - 0.02, B[1], 0.02)]);
    for (const sg of [1, -1]) for (let off = -hh; off < ub - ua; off += 0.24) {
      // the line u = ua + off + sg·(y − t0) for sg = 1 (from the left edge), mirrored for sg = −1
      const ya = Math.max(0, -off), yb = Math.min(hh, ub - ua - off);
      if (yb - ya < 0.08) continue;
      const U = (yy) => (sg > 0 ? ua + off + yy : ub - off - yy);
      bar([U(ya), t0 + ya], [U(yb), t0 + yb]);
    }
    void m;
  }
  // the leaves, open inward (+z), hinged at the inner edges of the pilasters
  const lw = hw - 0.42;
  for (const s of [-1, 1]) {
    const hx = x + s * lw, ang = 78 * D2R;
    const along = [-s * Math.cos(ang), Math.sin(ang)], nrm = [along[1], -along[0]];
    const L = frame([hx, z + 0.12], along, nrm);
    fbox(br, L, 0, lw, y + 0.02, y + h - 0.28, -0.06, 0.06);
    for (const sd of [1, -1]) {
      const d = (a, b) => (sd > 0 ? [a, b] : [-b, -a]);
      // stiles and rails standing proud, two panels between them
      for (const [u0, u1] of [[0.05, 0.3], [lw - 0.3, lw - 0.05]]) fbox(br, L, u0, u1, y + 0.1, y + h - 0.36, ...d(0.05, 0.1));
      for (const yy of [y + 0.1, y + h * 0.42, y + h - 0.66]) {
        fbox(br, L, 0.3, lw - 0.3, yy, yy + 0.3, ...d(0.05, 0.1));
        for (let u = 0.42; u < lw - 0.35; u += 0.24) fbox(br, L, u - 0.035, u + 0.035, yy + 0.115, yy + 0.185, ...d(0.09, 0.13));
      }
      // a moulding round each panel
      for (const [ya, yb] of [[y + 0.4, y + h * 0.42], [y + h * 0.42 + 0.3, y + h - 0.66]]) {
        fbox(br, L, 0.36, lw - 0.36, ya + 0.06, ya + 0.12, ...d(0.05, 0.08));
        fbox(br, L, 0.36, lw - 0.36, yb - 0.12, yb - 0.06, ...d(0.05, 0.08));
      }
    }
    // the colliders for the open leaf
    const e = [hx + along[0] * lw, z + 0.12 + along[1] * lw];
    col.segment([hx, z + 0.12], e, 0.14, y, y + h);
  }
  bag.add('bronze', fromTriangles(br));
  bag.add('gilt_bronze', fromTriangles(gl));
}

/**
 * The eagle in a wreath on the tympanum { at [x, z] (on the tympanum's face), y (the wreath's centre), r, face (−1: −z) }:
 * a wreath of oak leaves as a ring of overlapping leaf blocks round a band, and in it an eagle frontal with spread wings,
 * all of gilded bronze. [stated: probable — the clamp holes (dossier §8); form inferred from Roman eagle-in-wreath reliefs]
 */
function eagleWreath(el, { bag }) {
  const [x, z] = el.at, yc = el.y, r = el.r ?? 2.0, W = frame([x, z], [1, 0], [0, el.face ?? -1]);
  const g = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n, b = 2 * Math.PI * (i + 1) / n, P = (rr, t, d) => W(rr * Math.cos(t), yc + rr * Math.sin(t), d);
    hexa(g, [P(r - 0.18, a, 0), P(r + 0.18, a, 0), P(r + 0.18, b, 0), P(r - 0.18, b, 0)], [P(r - 0.18, a, 0.16), P(r + 0.18, a, 0.16), P(r + 0.18, b, 0.16), P(r - 0.18, b, 0.16)]);
    // leaves, in pairs, tilted along the ring
    if (i % 2 === 0) for (const off of [-0.17, 0.17]) {
      const t = (a + b) / 2, c0 = r + off, L = 0.32, wl = 0.11, tt = [-Math.sin(t), Math.cos(t)], rd = [Math.cos(t), Math.sin(t)];
      const Q = (al, ac, d) => W(c0 * rd[0] + tt[0] * al + rd[0] * ac, yc + c0 * rd[1] + tt[1] * al + rd[1] * ac, d);
      hexa(g, [Q(-L / 2, -wl, 0.1), Q(L / 2, -wl * 0.4, 0.1), Q(L / 2, wl * 0.4, 0.1), Q(-L / 2, wl, 0.1)], [Q(-L / 2, -wl, 0.24), Q(L / 2, -wl * 0.4, 0.22), Q(L / 2, wl * 0.4, 0.22), Q(-L / 2, wl, 0.24)]);
    }
  }
  // ribbons tied at the foot
  for (const s of [-1, 1]) slope(g, W, s * 0.15, yc - r - 0.2, s * 0.8, yc - r - 0.7, 0.16, 0, 0.1);
  // the eagle: body, head turned, wings spread in feather tiers, tail, legs on a thunderbolt
  const S = r / 2;
  fbox(g, W, -0.32 * S, 0.32 * S, yc - 0.6 * S, yc + 0.4 * S, 0, 0.35 * S);
  fbox(g, W, -0.24 * S, 0.24 * S, yc + 0.4 * S, yc + 0.62 * S, 0.02, 0.3 * S);
  fbox(g, W, -0.08 * S, 0.3 * S, yc + 0.62 * S, yc + 0.86 * S, 0.05, 0.28 * S);          // the head, turned to its right
  slope(g, W, 0.28 * S, yc + 0.7 * S, 0.46 * S, yc + 0.64 * S, 0.1 * S, 0.06, 0.2 * S);     // the beak
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const u0 = s * 0.3 * S, u1 = s * (0.75 + 0.22 * k) * S, ya = yc + (0.25 - 0.18 * k) * S, yb = yc + (0.85 - 0.12 * k) * S;
      slope(g, W, u0, ya, u1, yb, (0.22 - 0.02 * k) * S, 0.02 + 0.03 * k, 0.12 * S + 0.03 * k);
    }
    slope(g, W, s * 0.1 * S, yc - 0.6 * S, s * 0.3 * S, yc - 1.0 * S, 0.12 * S, 0.02, 0.18 * S);   // the tail feathers
    fbox(g, W, s * 0.12 * S - 0.05, s * 0.12 * S + 0.05, yc - 0.85 * S, yc - 0.6 * S, 0.05, 0.2 * S);  // the legs
  }
  fbox(g, W, -0.55 * S, 0.55 * S, yc - 0.95 * S, yc - 0.85 * S, 0.02, 0.18 * S);              // the thunderbolt
  bag.add('gilt_bronze', fromTriangles(g));
}

const base = STYLES.roman;
/**
 * rotunda_floor: { c, y, R, cell } — the floor's pattern of Hadrian's time (dossier docs/buildings/pantheon.md; the floor is
 * "alternating squares and circles" of coloured stone, now much restored): a grid of squares of pavonazzetto framed in
 * white marble, in each a disc, porphyry and giallo antico alternating, a ring of grey granite about the disc.
 */
function rotundaFloor(el, { bag }) {
  const [cx, cz] = el.c, y = el.y, cell = el.cell ?? 3.6, n = Math.floor(el.R / cell);
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = cx + i * cell, z = cz + j * cell;
    if (Math.hypot(i * cell, j * cell) > el.R - cell * 0.95) continue;
    const alt = (i + j) % 2 === 0;
    bag.add('marble', box(x - cell / 2 + 0.03, y + 0.004, z - cell / 2 + 0.03, x + cell / 2 - 0.03, y + 0.009, z + cell / 2 - 0.03));
    bag.add('pavonazzetto', box(x - cell / 2 + 0.17, y + 0.009, z - cell / 2 + 0.17, x + cell / 2 - 0.17, y + 0.014, z + cell / 2 - 0.17));
    bag.add('granite_grey', lathe([[cell * 0.34, 0], [cell * 0.34, 0.004], [0.001, 0.004]], 28, null, x, y + 0.014, z));
    bag.add(alt ? 'porphyry' : 'giallo', lathe([[cell * 0.3, 0], [cell * 0.3, 0.004], [0.001, 0.004]], 28, null, x, y + 0.018, z));
  }
}
/**
 * oculus_light: { c, y (the oculus' height), r } — the light of the eye of the dome: a warm pool of light hung under the
 * oculus (the sky's light falling through the 8.9 m opening) and a softer one at the floor.
 */
function oculusLight(el, { lights }) {
  lights.push({ at: [el.c[0], el.y - 3, el.c[1]], color: '#fff3dc', intensity: 3.2, distance: 46 });
  lights.push({ at: [el.c[0], el.y - 30, el.c[1]], color: '#ffeccc', intensity: 1.6, distance: 28 });
}
/**
 * The bronze roof truss of the portico (docs/settlements/rome.md §4.3): the roof "made entirely from bronze", standing
 * until 1625/26 when Urban VIII took its bronze for cannon. At each station z: a tie beam of bronze plates on the side
 * entablatures, carried over the inner beams by short posts; two rafters under the roof's slopes meeting at the
 * ridge; the king post and two struts; all box girders of riveted plate. { zs, y (the top of the side entablatures),
 * yb (the top of the inner beams), xs (the inner beams' lines), span (half), rise (the rafters' rise), w, d }.
 */
function porticoTruss(el, { bag }) {
  const br = [], gl = [], { y, yb, span, rise } = el, w = el.w ?? 0.45, d = el.d ?? 0.55;
  for (const z of el.zs) {
    const W = frame([0, z], [1, 0], [0, 1]);
    fbox(br, W, -span, span, y, y + d, -w / 2, w / 2);                                   // the tie
    for (const x of el.xs) fbox(br, W, x - 0.2, x + 0.2, yb, y, -0.2, 0.2);             // the posts on the inner beams
    for (const s of [-1, 1]) {
      slope(br, W, s * (span - 0.5), y + d, 0, y + d + rise, d, -w / 2, w / 2);             // the rafters
      slope(br, W, s * span * 0.5, y + d, s * 0.25, y + d + rise * 0.55, 0.32, -w * 0.35, w * 0.35);   // the struts
    }
    fbox(br, W, -0.22, 0.22, y + d, y + d + rise + 0.2, -w / 2, w / 2);                      // the king post
    // the rows of rivet heads along the tie's lower edge, gilt
    for (let x = -span + 0.4; x < span - 0.3; x += 0.6) fbox(gl, W, x - 0.03, x + 0.03, y + 0.06, y + 0.12, w / 2, w / 2 + 0.02);
  }
  bag.add('bronze', fromTriangles(br));
  bag.add('gilt_bronze', fromTriangles(gl));
}

registerStyle('roman-pantheon', {
  ...base,
  elements: { ...base.elements, aedicula, attic, eagle_wreath: eagleWreath, rotunda_floor: rotundaFloor, oculus_light: oculusLight, portico_truss: porticoTruss },
  objects: { ...base.objects, pantheon_door: pantheonDoor },
});
