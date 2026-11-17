// Hagia Sophia's carved and set detail (round 2, docs/buildings/hagia-sophia.md §10): the pieces a visitor meets first, at the
// arrival (the flank, the dome's ring of windows, the buttresses) and a few metres off (the capitals with their monograms,
// the revetment, the parapets, the ornament of the gold vaults, the fountain). Everything here is built from shared materials
// the church already uses, in flat or faceted pieces of a few centimetres' relief, and none of it carries a collider except
// where it replaces something that did (the parapets, the fountain, the capitals' columns).

import { box, lathe, fromTriangles, rod, frustum } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const D2R = Math.PI / 180;

// ── helpers ──────────────────────────────────────────────────────────────────
/** A frame in a vertical plane: origin o [x, z], u along it, n out of it. W(u, y, d) → [x, y, z]. */
export const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
export function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
const nOf = (W) => { const a = W(0, 0, 0), b = W(0, 0, 1); return [b[0] - a[0], 0, b[2] - a[2]]; };
/** One triangle, wound so that it faces n. */
function tri(out, a, b, c, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const quadN = (out, a, b, c, d, n) => { tri(out, a, b, c, n); tri(out, a, c, d, n); };
const fanN = (out, pts, n) => { for (let k = 1; k < pts.length - 1; k++) tri(out, pts[0], pts[k], pts[k + 1], n); };
/** A flat annulus (or disc, r0 = 0) in a frame's plane at depth d, facing out. */
function ringN(out, W, uc, yc, r0, r1, d, n, seg = 16) {
  const nv = nOf(W);
  for (let i = 0; i < seg; i++) {
    const a = 2 * Math.PI * i / seg, b = 2 * Math.PI * (i + 1) / seg;
    const P = (r, t) => W(uc + r * Math.cos(t), yc + r * Math.sin(t), d);
    if (r0 < 1e-4) tri(out, P(0, 0), P(r1, a), P(r1, b), nv); else quadN(out, P(r0, a), P(r1, a), P(r1, b), P(r0, b), nv);
  }
}
/** A flat rectangle in a frame's plane. */
const rectN = (out, W, u0, u1, y0, y1, d) => quadN(out, W(u0, y0, d), W(u1, y0, d), W(u1, y1, d), W(u0, y1, d), nOf(W));
/** A flat equal-armed cross with flared ends, in a frame's plane. */
function crossN(out, W, uc, yc, L, w, d) {
  rectN(out, W, uc - L, uc + L, yc - w, yc + w, d);
  rectN(out, W, uc - w, uc + w, yc + w, yc + L, d); rectN(out, W, uc - w, uc + w, yc - L, yc - w, d);
  const e = w * 0.8, f = w * 2.2;
  rectN(out, W, uc + L, uc + L + e, yc - f, yc + f, d); rectN(out, W, uc - L - e, uc - L, yc - f, yc + f, d);
  rectN(out, W, uc - f, uc + f, yc + L, yc + L + e, d); rectN(out, W, uc - f, uc + f, yc - L - e, yc - L, d);
}
/** A ring of n voussoirs round (uc, yc), r0…r1, d0…d1, alternately a and b (with b standing off less). */
function voussoirs(a, b, W, uc, yc, r0, r1, n, d0, d1, dB) {
  for (let k = 0; k < n; k++) {
    const t0 = Math.PI * k / n, t1 = Math.PI * (k + 1) / n, P = (r, t, d) => W(uc + r * Math.cos(t), yc + r * Math.sin(t), d);
    const dd = k % 2 ? dB : d1;
    hexa(k % 2 ? b : a, [P(r0, t0, d0), P(r1, t0, d0), P(r1, t1, d0), P(r0, t1, d0)], [P(r0, t0, dd), P(r1, t0, dd), P(r1, t1, dd), P(r0, t1, dd)]);
  }
}
const put = (bag, mat, list) => { if (list.length) bag.add(mat, fromTriangles(list)); };
const lerp = (a, b, t) => a + (b - a) * t;
/** A small, deterministic offset (±amp) from a place and a number: pieces repeated by the dozen differ by millimetres, as hand-cut ones do, and so merge into their material's mesh instead of becoming instanced draws of their own. */
const jit = (x, z, k, amp = 0.004) => amp * Math.sin((x * 12.9898 + z * 78.233 + k * 37.719) * 43.7);

// ── 1. capitals with monograms ───────────────────────────────────────────────
/**
 * Column with an Attic base, a monolithic shaft, a necking ring, a carved basket capital and an impost block carrying the
 * monogram: "the capitals ... carved with acanthus, bearing the monograms of Justinian and Theodora" (the church's capitals are
 * of the pierced, drilled 'lace' kind, the leaves standing off a gilt ground: pallasweb, liturgicalartsjournal). The capital's
 * bell is gilt; on it stand two tiers of acanthus leaves (each of three tongues that curl out at their tips), horns at the
 * four corners under the abacus, then an impost block with a raised plaque of green marble on each face, and on that a
 * cruciform monogram in gold: a cross with serifs and a letter in each quarter. [inferred: the cruciform monogram; the form of
 * the leaves]
 */
export function hsColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, d = el.d, h = el.h, r = d / 2;
  const small = d < 0.45;
  const baseH = 0.45 * d, capH = 0.75 * d, impH = el.impost === false ? 0 : (small ? 0.32 : 0.5) * d;
  const shaftH = h - baseH - capH - impH;
  const capMat = el.capMat || 'marble_smooth';
  bag.add(capMat, frustum([x - r * 1.25, z - r * 1.25, x + r * 1.25, z + r * 1.25], y, y + baseH * 0.35, 0, 0, 0, 0));
  bag.add(capMat, lathe([[r * 1.22, 0], [r * 1.18, baseH * 0.18], [r * 1.04, baseH * 0.32], [r * 0.98, baseH * 0.5], [r * 1.12, baseH * 0.6], [r * 1.05, baseH * 0.8], [r * 1.0, baseH]], 24, null, x, y + baseH * 0.35, z));
  bag.add(el.shaftMat || 'verde_antico', lathe([[r, 0], [r * 0.97, shaftH * 0.5], [r * 0.9, shaftH]], 24, null, x, y + baseH, z));
  bag.add('silver', lathe([[r * 0.93, 0], [r * 0.95, 0.06], [r * 0.95, 0.12], [r * 0.93, 0.18]], 24, null, x, y + baseH + shaftH - 0.2, z));
  const yc = y + baseH + shaftH, sq = r * 1.25;
  col.circle(x, z, r * 1.1, y, y + h);
  if (small) {
    bag.add(capMat, lathe([[r * 0.9, 0], [r * 0.98, capH * 0.15]], 24, null, x, yc, z));
    bag.add(capMat, frustum([x - r * 0.9, z - r * 0.9, x + r * 0.9, z + r * 0.9], yc + capH * 0.15, yc + capH, -(sq - r * 0.9), -(sq - r * 0.9), -(sq - r * 0.9), -(sq - r * 0.9)));
    if (impH) bag.add(capMat, frustum([x - sq, z - sq, x + sq, z + sq], yc + capH, yc + capH + impH, -0.12 * d, -0.12 * d, -0.12 * d, -0.12 * d));
    return;
  }
  // the bell, gilt: radius by height
  const T = [0, 0.12, 0.35, 0.62, 0.9, 1], RR = [0.9, 1.0, 1.08, 1.15, 1.2, 1.2];
  const J = (k, a = 0.03) => 1 + jit(x, z, k, a);
  const bellR = (t) => { for (let i = 1; i < T.length; i++) if (t <= T[i]) return r * J(1, 0.012) * lerp(RR[i - 1], RR[i], (t - T[i - 1]) / (T[i] - T[i - 1])); return r * RR[RR.length - 1]; };
  bag.add('gold', lathe(T.map((t) => [bellR(t), t * capH]), 16, null, x, yc, z));
  const lv = [];
  const lobe = (ang, tan, t0, t1, wb, wt, th, out) => {
    const e = [Math.cos(ang), Math.sin(ang)], tg = [-e[1], e[0]];
    const P = (rad, tn, yy) => [x + e[0] * rad + tg[0] * tn, yy, z + e[1] * rad + tg[1] * tn];
    const rb = bellR(t0) - th * 0.4, rt = bellR(t1) + out * J(2 + Math.round(ang * 10), 0.2);
    hexa(lv, [P(rb, tan - wb / 2, yc + t0 * capH), P(rb, tan + wb / 2, yc + t0 * capH), P(rb + th, tan + wb / 2, yc + t0 * capH), P(rb + th, tan - wb / 2, yc + t0 * capH)],
      [P(rt, tan - wt / 2, yc + t1 * capH), P(rt, tan + wt / 2, yc + t1 * capH), P(rt + th, tan + wt / 2, yc + t1 * capH), P(rt + th, tan - wt / 2, yc + t1 * capH)]);
  };
  const big = d >= 0.9;
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4;
    if (big) for (const [tn, t1] of [[-0.3 * r, 0.46], [0, 0.56], [0.3 * r, 0.46]]) lobe(a, tn, 0.08, t1, 0.3 * r, 0.1 * r, 0.07 * r, 0.1 * r);       // the lower tier
    const b = a + Math.PI / 8;
    if (big) for (const [tn, t1] of [[-0.3 * r, 0.78], [0, 0.93], [0.3 * r, 0.78]]) lobe(b, tn, 0.3, t1, 0.28 * r, 0.1 * r, 0.07 * r, 0.16 * r);     // the upper tier
    else lobe(b, 0, 0.25, 0.9, 0.5 * r, 0.14 * r, 0.08 * r, 0.14 * r);
    if (!big) lobe(a, 0, 0.08, 0.5, 0.45 * r, 0.14 * r, 0.08 * r, 0.1 * r);
  }
  // the horns under the corners of the abacus
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2, e = [Math.cos(a), Math.sin(a)], tg = [-e[1], e[0]];
    const P = (rad, tn, yy) => [x + e[0] * rad + tg[0] * tn, yy, z + e[1] * rad + tg[1] * tn];
    const wb = 0.4 * r, wt = 0.46 * r, th = 0.12 * r, rb = bellR(0.62) - 0.08 * r, rt = 1.5 * r * J(3 + k, 0.03);
    hexa(lv, [P(rb, -wb / 2, yc + 0.62 * capH), P(rb, wb / 2, yc + 0.62 * capH), P(rb + th, wb / 2, yc + 0.62 * capH), P(rb + th, -wb / 2, yc + 0.62 * capH)],
      [P(rt, -wt / 2, yc + capH - 0.03 * d), P(rt, wt / 2, yc + capH - 0.03 * d), P(rt + th, wt / 2, yc + capH - 0.03 * d), P(rt + th, -wt / 2, yc + capH - 0.03 * d)]);
  }
  put(bag, capMat, lv);
  // the abacus and the impost block
  bag.add(capMat, frustum([x - sq, z - sq, x + sq, z + sq], yc + capH - 0.05 * d, yc + capH, 0, 0, 0, 0));
  if (!impH) return;
  const wI = sq * 0.92, yb = yc + capH, jp = jit(x, z, 7, 0.02), jl = jit(x, z, 8, 0.05);
  bag.add(capMat, frustum([x - wI, z - wI, x + wI, z + wI], yb, yb + impH * 0.8, 0, 0, 0, 0));
  bag.add(capMat, frustum([x - sq, z - sq, x + sq, z + sq], yb + impH * 0.8, yb + impH, 0, 0, 0, 0));
  const green = [], gold = [];
  for (const [u, n] of [[[0, 1], [1, 0]], [[0, -1], [-1, 0]], [[-1, 0], [0, 1]], [[1, 0], [0, -1]]]) {
    const W = frame([x, z], u, n), pw = wI * (0.74 + jp), y0 = yb + impH * 0.1, y1 = yb + impH * 0.7, ym = (y0 + y1) / 2, hh = (y1 - y0) / 2;
    fbox(green, W, -pw, pw, y0, y1, wI - 0.01, wI + 0.014);
    const dm = wI + 0.019, L = hh * (0.62 + jl), w = L * 0.13;
    crossN(gold, W, 0, ym, L, w, dm);
    for (const [su, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rectN(gold, W, su * hh * 0.5 - hh * 0.13, su * hh * 0.5 + hh * 0.13, ym + sy * hh * 0.5 - hh * 0.13, ym + sy * hh * 0.5 + hh * 0.13, dm);
  }
  put(bag, 'verde_antico', green);
  put(bag, 'gold', gold);
}

// ── 2. the outside: windows with arched hoods, the banded buttresses, the dome's windows ──
const FACE = 36;                                   // the outer face of the north and south walls
/** A window of the aisle walls { sz, xc, w, y0, y1 }: stone jambs, a sloping sill, a lintel under a hood of alternate stone and brick voussoirs round a plastered lunette. */
export function hsWindow(el, { bag }) {
  const { sz, xc, w, y0, y1 } = el, hw = w / 2, j = jit(xc, sz, 1), j2 = jit(xc, sz, 2), W = frame([xc, sz * FACE], [1, 0], [0, sz]);
  const lim = [], brk = [], stu = [], nv = nOf(W);
  for (const s of [-1, 1]) fbox(lim, W, s > 0 ? hw : -hw - 0.3 - j, s > 0 ? hw + 0.3 + j : -hw, y0 - 0.2, y1 + 0.1 + j2, -0.15, 0.25);
  hexa(lim, [W(-hw - 0.35, y0 - 0.3, -0.2), W(hw + 0.35, y0 - 0.3, -0.2), W(hw + 0.35, y0 - 0.3, 0.34), W(-hw - 0.35, y0 - 0.3, 0.34)],
    [W(-hw - 0.35, y0 - 0.04 + j2, -0.2), W(hw + 0.35, y0 - 0.04 + j2, -0.2), W(hw + 0.35, y0 - 0.26, 0.34), W(-hw - 0.35, y0 - 0.26, 0.34)]);
  fbox(lim, W, -hw - 0.3, hw + 0.3, y1, y1 + 0.1, -0.15, 0.25);
  const yc = y1 + 0.1;
  voussoirs(lim, brk, W, 0, yc, hw, hw + 0.3 + j, 10, -0.1, 0.3, 0.26 + j2);
  const arc = []; for (let k = 0; k <= 10; k++) arc.push(W(hw * Math.cos(Math.PI * k / 10), yc + hw * Math.sin(Math.PI * k / 10), 0.05));
  fanN(stu, [W(-hw, yc, 0.05), ...arc.slice().reverse()], nv);
  put(bag, 'limestone', lim); put(bag, 'brick', brk); put(bag, 'stucco_warm', stu);
}

/** A blind arch on a flat face: two jambs, a sill, a ring of voussoirs round a plastered field. W is the face's frame (d out of it). */
function blindArch(lim, brk, stu, W, uc, aw, yb, ySp) {
  const nv = nOf(W), r0 = aw / 2;
  for (const s of [-1, 1]) fbox(lim, W, uc + (s > 0 ? r0 : -r0 - 0.3), uc + (s > 0 ? r0 + 0.3 : -r0), yb, ySp, -0.05, 0.13);
  fbox(lim, W, uc - r0 - 0.3, uc + r0 + 0.3, yb - 0.22, yb, -0.05, 0.17);
  voussoirs(lim, brk, W, uc, ySp, r0, r0 + 0.3, 10, -0.05, 0.13, 0.1);
  const arc = []; for (let k = 0; k <= 10; k++) arc.push(W(uc + r0 * Math.cos(Math.PI * k / 10), ySp + r0 * Math.sin(Math.PI * k / 10), 0.07));
  // the field: a rectangle below the spring and the half disc over it
  quadN(stu, W(uc - r0, yb, 0.07), W(uc + r0, yb, 0.07), W(uc + r0, ySp, 0.07), W(uc - r0, ySp, 0.07), nv);
  fanN(stu, [W(uc - r0, ySp, 0.07), ...arc.slice().reverse()], nv);
}

/**
 * One step of a buttress of the flanks { sz, xc, hw, d, y0, top }: the brick mass is built by the plan; this puts on it the
 * stone courses that bind it (a limestone course across the front and both sides every 1.3 m, standing 5 cm off the brick)
 * and on each of its faces the blind arches, a ring of alternate stone and brick voussoirs round plastered fields, that lighten
 * the great piers' masses. [inferred: after the banded brick and stone of the church's outside, hagiasophia.gen.tr / Wikipedia
 * "Byzantine architecture": brick and stone in courses, plaster for decoration]
 */
export function hsButtress(el, { bag }) {
  const { sz, xc, hw, d, y0, top } = el, dF = d + 0.35;
  const lim = [], brk = [], stu = [];
  const Wb = frame([xc, sz * FACE], [1, 0], [0, sz]);
  for (let y = y0 + 0.65; y < top - 0.8; y += 1.3) fbox(lim, Wb, -hw - 0.05, hw + 0.05, y, y + 0.26, 0.3, dF + 0.05);
  const Wl = frame([xc - hw, sz * FACE], [0, sz], [-1, 0]), Wr = frame([xc + hw, sz * FACE], [0, sz], [1, 0]);
  const yb = y0 + (y0 < 1 ? 1.5 : 1.0), aw = hw - 0.75, ySp = top - 1.4 - aw / 2 - 0.3;
  // the front: two arches (the frame's normal is the face's)
  const Wfront = frame([xc, sz * (FACE + dF)], [1, 0], [0, sz]);
  for (const s of [-1, 1]) blindArch(lim, brk, stu, Wfront, s * hw / 2, aw, yb, ySp);
  // the sides: one or two arches along the depth
  const asd = 2.3, nS = Math.max(1, Math.floor(dF / 4.2)), ySs = top - 1.4 - asd / 2 - 0.3;
  for (const Ws of [Wl, Wr]) for (let k = 0; k < nS; k++) blindArch(lim, brk, stu, Ws, 0.55 + dF * 0.97 * (k + 0.5) / nS - (nS > 1 ? 0.3 : 0), asd, yb, ySs);
  put(bag, 'limestone', lim); put(bag, 'brick', brk); put(bag, 'stucco_warm', stu);
}

/**
 * The forty windows of the dome's ring { c, y0 (the sill), y1 (the head), R (the outer face), n, w }: the opening's head is
 * closed to a round arch by two plastered spandrels, the arch is ringed by marble and brick voussoirs standing off the drum's
 * face, and a marble jamb runs down each side to the sill. "The dome seems to float on light": forty windows in the ring.
 */
export function hsDomeWindows(el, { bag }) {
  const [cx, cz] = el.c, R = el.R, n = el.n || 40, hw = (el.w || 1.25) / 2 + 0.035, yc = el.y1 - hw;
  const mar = [], brk = [], stu = [];
  for (let k = 0; k < n; k++) {
    const a = k * 2 * Math.PI / n, e = [Math.cos(a), Math.sin(a)], t = [-e[1], e[0]];
    const W = frame([cx + e[0] * R, cz + e[1] * R], t, e);
    // the spandrels: slices between the arc and the head, set into the wall's outer half
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
      const u0 = hw * i / 5, u1 = hw * (i + 1) / 5, ya = yc + Math.sqrt(hw * hw - u0 * u0), yb = yc + Math.sqrt(hw * hw - u1 * u1);
      const A = (u, y, d) => W(s * u, y, d);
      hexa(stu, [A(u0, ya, -0.4), A(u1, yb, -0.4), A(u1, yb, 0.0), A(u0, ya, 0.0)], [A(u0, el.y1, -0.4), A(u1, el.y1, -0.4), A(u1, el.y1, 0.0), A(u0, el.y1, 0.0)]);
    }
    voussoirs(mar, brk, W, 0, yc, hw, hw + 0.24, 10, -0.05, 0.14, 0.1);
    for (const s of [-1, 1]) fbox(mar, W, s > 0 ? hw : -hw - 0.2, s > 0 ? hw + 0.2 : -hw, el.y0, yc, -0.05, 0.12);
    fbox(mar, W, -hw - 0.2, hw + 0.2, el.y0 - 0.12, el.y0, -0.05, 0.2);
  }
  put(bag, 'marble_smooth', mar); put(bag, 'brick', brk); put(bag, 'limestone', stu);
}

// ── 3. book-matched revetment ────────────────────────────────────────────────
/**
 * Marble revetment of a wall { o, u, n, ranges: [[u0, u1]…], y0, y1 }: "walls sheathed to the springing with book-matched marble"
 * (pallasweb; Britannica). In each range a plinth with a moulded cap, then pairs of slabs sawn from one block and opened like a
 * book, the veining running up and away from the seam in a chevron, each leaf in a raised frame, a gilt-fillet frieze of green
 * stone and, where the wall is high enough, a second tier of pairs under a marble cornice with a gilt astragal; at the middle of
 * every pair, over the seam, a porphyry disc in a green ring. Flat pieces a few centimetres proud of the wall.
 */
export function hsRevetment(el, { bag }) {
  const W = frame(el.o, el.u, el.n), nv = nOf(W);
  const base = [], mould = [], leafA = [], leafB = [], frame1 = [], green = [], gilt = [], dark = [], red = [], ring = [];
  const H = el.y1 - el.y0, two = H >= 6.2, avail = H - 0.58 - 0.35 - (two ? 0.45 + 0.3 : 0.1), h1 = two ? avail * 0.46 : avail, h2 = avail - h1;
  for (const [ua, ub] of el.ranges) {
    const L = ub - ua;
    if (L < 1.2) continue;
    const np = Math.max(1, Math.round(L / 2.2)), pw = L / np;
    fbox(base, W, ua, ub, el.y0, el.y0 + 0.5, -0.03, 0.1);
    fbox(mould, W, ua - 0.02, ub + 0.02, el.y0 + 0.5, el.y0 + 0.58, -0.03, 0.14);
    const pair = (u0, u1, ya, yb, mat) => {
      const um = (u0 + u1) / 2, lw = yb - ya;
      fbox(frame1, W, u0, u1, ya, yb, -0.03, 0.045);
      for (const [a, b, sg] of [[u0 + 0.07, um - 0.012, 1], [um + 0.012, u1 - 0.07, -1]]) {
        fbox(mat, W, a, b, ya + 0.07, yb - 0.07, 0.04, 0.07);
        // the chevron: three veins rising toward the seam (mirrored across it)
        for (let k = 0; k < 3; k++) {
          const v0 = ya + 0.07 + lw * (0.12 + 0.26 * k), v1 = v0 + lw * 0.2, wv = 0.035 + 0.01 * k;
          const pa = sg > 0 ? [a, v0] : [b, v0], pb = sg > 0 ? [b, v1] : [a, v1];
          if (v1 + wv > yb - 0.07) continue;
          quadN(dark, W(pa[0], pa[1], 0.083), W(pb[0], pb[1], 0.083), W(pb[0], pb[1] + wv, 0.083), W(pa[0], pa[1] + wv, 0.083), nv);
        }
      }
      fbox(dark, W, um - 0.007, um + 0.007, ya + 0.07, yb - 0.07, 0.04, 0.073);
      if (lw > 1.4) { ringN(ring, W, um, (ya + yb) / 2, 0.2, 0.28, 0.08, nv, 14); ringN(red, W, um, (ya + yb) / 2, 0, 0.2, 0.077, nv, 14); }
    };
    let y = el.y0 + 0.66;
    for (let i = 0; i < np; i++) pair(ua + pw * i + 0.03, ua + pw * (i + 1) - 0.03, y, y + h1, leafA);
    y += h1 + 0.08;
    if (two) {
      fbox(green, W, ua, ub, y, y + 0.45, -0.03, 0.06);
      fbox(gilt, W, ua, ub, y + 0.07, y + 0.1, 0.06, 0.072); fbox(gilt, W, ua, ub, y + 0.35, y + 0.38, 0.06, 0.072);
      y += 0.53;
      for (let i = 0; i < np; i++) pair(ua + pw * i + 0.03, ua + pw * (i + 1) - 0.03, y, y + h2, leafB);
      y += h2 + 0.08;
    }
    fbox(mould, W, ua - 0.03, ub + 0.03, y, y + 0.3, -0.03, 0.2);
    fbox(gilt, W, ua - 0.03, ub + 0.03, y + 0.1, y + 0.13, 0.2, 0.212);
  }
  put(bag, 'proconnesian', base); put(bag, 'marble_smooth', mould); put(bag, 'marble_smooth', frame1);
  put(bag, 'revetment_byz', leafA); put(bag, 'pavonazzetto', leafB); put(bag, 'revetment_green', green);
  put(bag, 'gold', gilt); put(bag, 'verde_antico', dark); put(bag, 'porphyry', red); put(bag, 'verde_antico', ring);
}

// ── 4. gallery parapets ──────────────────────────────────────────────────────
/**
 * A parapet slab of a gallery { a [x, z], b [x, z], y, h }: a marble plinth, a white slab framed on both faces in a raised border
 * of green marble, in the field a roundel (a porphyry disc in a green ring) bearing a silver cross, a smaller roundel either side
 * on the longer bays, a moulded coping with a gilt fillet. [inferred: the roundel-and-cross composition after the carved
 * parapet slabs of the galleries; the church's parapets were marble slabs with crosses]
 */
export function hsParapet(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y, H = el.h || 1.0, jq = jit(ax, az, 1), jr = jit(ax, bz, 2), L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]];
  const W = frame(el.a, u, n);
  const mar = [], slab = [], bord = [], ringG = [], disc = [], sil = [], gilt = [];
  fbox(mar, W, 0, L, y, y + 0.14 + jq, -0.17, 0.17);
  fbox(slab, W, 0.03 + jr, L - 0.03, y + 0.14, y + H - 0.1 + jq, -0.1, 0.1);
  fbox(mar, W, -0.02, L + 0.02, y + H - 0.1, y + H, -0.15, 0.15);
  fbox(gilt, W, 0, L - jr, y + H - 0.1, y + H - 0.085, 0.15, 0.158); fbox(gilt, W, 0, L, y + H - 0.1, y + H - 0.085, -0.158, -0.15);
  const y0 = y + 0.14, y1 = y + H - 0.1, ym = (y0 + y1) / 2, hh = (y1 - y0) / 2;
  for (const s of [1, -1]) {
    const nv = nOf(W).map((q) => q * s), d = (a) => s * a, F = (u0, u1, v0, v1) => (s > 0 ? fbox(bord, W, u0, u1, v0, v1, 0.1, 0.125) : fbox(bord, W, u0, u1, v0, v1, -0.125, -0.1));
    F(0.09 + jq, L - 0.09 - jr, y0 + 0.05, y0 + 0.11 + jq); F(0.09, L - 0.09, y1 - 0.11, y1 - 0.05); F(0.09, 0.15, y0 + 0.11, y1 - 0.11); F(L - 0.15, L - 0.09, y0 + 0.11, y1 - 0.11);
    const R = Math.min(hh - 0.12, 0.3), dd = (v) => d(v);
    const roundel = (uc, r) => {
      const ph = jit(ax, bz, uc * 10 + 3, 0.06);
      // flat pieces facing ±n: build in the frame, then wind toward nv
      const P = (rr, t, dep) => W(uc + rr * Math.cos(t + ph), ym + rr * Math.sin(t + ph), dep);
      for (let i = 0; i < 14; i++) {
        const a = 2 * Math.PI * i / 14, b = 2 * Math.PI * (i + 1) / 14;
        quadN(ringG, P(r * 0.8, a, dd(0.103)), P(r, a, dd(0.103)), P(r, b, dd(0.103)), P(r * 0.8, b, dd(0.103)), nv);
        tri(disc, P(0, 0, dd(0.107)), P(r * 0.8, a, dd(0.107)), P(r * 0.8, b, dd(0.107)), nv);
      }
      const L2 = r * (0.5 + 5 * ph), w2 = r * 0.1, q = (a0, a1, b0, b1) => quadN(sil, W(uc + a0, ym + b0, dd(0.112)), W(uc + a1, ym + b0, dd(0.112)), W(uc + a1, ym + b1, dd(0.112)), W(uc + a0, ym + b1, dd(0.112)), nv);
      q(-L2, L2, -w2, w2); q(-w2, w2, w2, L2); q(-w2, w2, -L2, -w2);
      q(L2, L2 + w2 * 1.2, -w2 * 2.2, w2 * 2.2); q(-L2 - w2 * 1.2, -L2, -w2 * 2.2, w2 * 2.2); q(-w2 * 2.2, w2 * 2.2, L2, L2 + w2 * 1.2); q(-w2 * 2.2, w2 * 2.2, -L2 - w2 * 1.2, -L2);
    };
    roundel(L / 2, R);
    if (L > 3.0) for (const k of [-1, 1]) roundel(L / 2 + k * L * 0.3, R * 0.62);
  }
  put(bag, 'marble_smooth', mar); put(bag, 'pavonazzetto', slab); put(bag, 'verde_antico', bord);
  put(bag, 'revetment_green', ringG); put(bag, 'porphyry', disc); put(bag, 'silver', sil); put(bag, 'gold', gilt);
  col.segment(el.a, el.b, 0.3, y, y + H);
}

// ── 5. ornament on the gold ──────────────────────────────────────────────────
/**
 * Ornament laid on the gold mosaic, a few centimetres proud of it (the vaults of the church of 562 are gold with crosses and
 * ornament and no figures: pallasweb, Britannica). Two forms.
 *   { kind: 'arch', span: 'x' | 'z', c: [x, y, z], r0, r1, plane, dir }: on the nave face of a great arch (the ring from r0 to r1 on
 *     the plane `plane`, standing `dir` toward the nave): silver fillets, bands of green with a chain of silver lozenges and
 *     porphyry studs, and where the ring is wide enough a cross in a roundel every thirty degrees.
 *   { kind: 'sphere', c, R, medallions: [{ a, e, r }] }: on the inside of a sphere, crosses in roundels (a green field in a silver ring,
 *     a gold cross with flared arms), at azimuth a, elevation e (degrees), radius r.
 */
export function hsMosaic(el, { bag }) {
  const green = [], silver = [], gold = [], red = [];
  if (el.kind === 'arch') {
    const [cx, cy, cz] = el.c, W = el.r1 - el.r0, ofs = el.plane + el.dir * 0.02;
    const P = (r, a, d = ofs) => (el.span === 'x' ? [cx + r * Math.cos(a), cy + r * Math.sin(a), d] : [d, cy + r * Math.sin(a), cz + r * Math.cos(a)]);
    const nv = el.span === 'x' ? [0, 0, el.dir] : [el.dir, 0, 0];
    const YMAX = 39.4;                                  // under the dome's cornice, which hides the arch above it
    const band = (out, ra, rb, seg = 96) => { for (let i = 0; i < seg; i++) { const a = Math.PI * i / seg, b = Math.PI * (i + 1) / seg; if (cy + Math.max(ra, rb) * Math.max(Math.sin(a), Math.sin(b)) > YMAX) continue; quadN(out, P(ra, a), P(rb, a), P(rb, b), P(ra, b), nv); } };
    const lozenges = (rm, hw, n) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (i + 0.5) / n, da = hw * 1.6 / rm;
        if (cy + (rm + hw) * Math.sin(a + da) > YMAX && cy + (rm + hw) * Math.sin(a - da) > YMAX || cy + (rm + hw) * Math.sin(a) > YMAX) continue;
        quadN(silver, P(rm, a - da, ofs + el.dir * 0.004), P(rm - hw, a, ofs + el.dir * 0.004), P(rm, a + da, ofs + el.dir * 0.004), P(rm + hw, a, ofs + el.dir * 0.004), nv);
        const sa = Math.PI * i / n, sd = 0.018 / rm;
        quadN(red, P(rm - 0.028, sa - sd, ofs + el.dir * 0.004), P(rm + 0.028, sa - sd, ofs + el.dir * 0.004), P(rm + 0.028, sa + sd, ofs + el.dir * 0.004), P(rm - 0.028, sa + sd, ofs + el.dir * 0.004), nv);
      }
    };
    if (W > 1.2) {
      band(silver, el.r0 + 0.07, el.r0 + 0.13); band(silver, el.r1 - 0.13, el.r1 - 0.07);
      band(green, el.r0 + 0.15, el.r0 + 0.5); band(green, el.r1 - 0.5, el.r1 - 0.15);
      lozenges(el.r0 + 0.325, 0.12, Math.round(Math.PI * (el.r0 + 0.325) / 0.5)); lozenges(el.r1 - 0.325, 0.12, Math.round(Math.PI * (el.r1 - 0.325) / 0.5));
      for (const deg of [30, 60, 120, 150]) {
        const a = deg * D2R, rm = (el.r0 + el.r1) / 2, r = (W - 1.0) / 2 + 0.02;
        const T = (px, py) => P(rm + py, a + px / rm);
        const fan = (out, rr, seg = 14) => { for (let i = 0; i < seg; i++) { const s = 2 * Math.PI * i / seg, t = 2 * Math.PI * (i + 1) / seg; tri(out, T(0, 0), T(rr * Math.cos(s), rr * Math.sin(s)), T(rr * Math.cos(t), rr * Math.sin(t)), nv); } };
        fan(silver, r); fan(green, r * 0.84);
        const L = r * 0.58, w = r * 0.12, q = (a0, a1, b0, b1) => quadN(gold, T(a0, b0), T(a1, b0), T(a1, b1), T(a0, b1), nv);
        q(-L, L, -w, w); q(-w, w, w, L); q(-w, w, -L, -w); q(L, L + w * 1.3, -w * 2.2, w * 2.2); q(-L - w * 1.3, -L, -w * 2.2, w * 2.2); q(-w * 2.2, w * 2.2, L, L + w * 1.3); q(-w * 2.2, w * 2.2, -L - w * 1.3, -L);
      }
    } else {
      band(silver, el.r0 + 0.1, el.r0 + 0.15); band(silver, el.r1 - 0.15, el.r1 - 0.1); band(green, el.r0 + 0.18, el.r1 - 0.18);
      lozenges((el.r0 + el.r1) / 2, 0.1, Math.round(Math.PI * (el.r0 + el.r1) / 2 / 0.45));
    }
  } else {
    const [cx, cy, cz] = el.c, R = el.R;
    for (const m of el.medallions) {
      const a = m.a * D2R, e = m.e * D2R, r = m.r;
      const d0 = [Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)], t1 = [-Math.sin(a), 0, Math.cos(a)], t2 = [-Math.sin(e) * Math.cos(a), Math.cos(e), -Math.sin(e) * Math.sin(a)];
      const T = (px, py, off = 0.05) => {
        const rho = Math.hypot(px, py), th = Math.atan2(py, px), f = rho / R, c = Math.cos(f), s = Math.sin(f), rr = R - off;
        return [cx + rr * (c * d0[0] + s * (Math.cos(th) * t1[0] + Math.sin(th) * t2[0])), cy + rr * (c * d0[1] + s * (Math.cos(th) * t1[1] + Math.sin(th) * t2[1])), cz + rr * (c * d0[2] + s * (Math.cos(th) * t1[2] + Math.sin(th) * t2[2]))];
      };
      const nv = [-d0[0], -d0[1], -d0[2]];
      const fan = (out, rr, off, seg = 18) => { for (let i = 0; i < seg; i++) { const s = 2 * Math.PI * i / seg, t = 2 * Math.PI * (i + 1) / seg; tri(out, T(0, 0, off), T(rr * Math.cos(s), rr * Math.sin(s), off), T(rr * Math.cos(t), rr * Math.sin(t), off), nv); } };
      fan(silver, r, 0.045); fan(green, r * 0.86, 0.055);
      const L = r * 0.6, w = r * 0.12, q = (a0, a1, b0, b1) => quadN(gold, T(a0, b0, 0.065), T(a1, b0, 0.065), T(a1, b1, 0.065), T(a0, b1, 0.065), nv);
      q(-L, L, -w, w); q(-w, w, w, L); q(-w, w, -L, -w); q(L, L + w * 1.3, -w * 2.2, w * 2.2); q(-L - w * 1.3, -L, -w * 2.2, w * 2.2); q(-w * 2.2, w * 2.2, L, L + w * 1.3); q(-w * 2.2, w * 2.2, -L - w * 1.3, -L);
    }
  }
  put(bag, 'mosaic_green', green); put(bag, 'mosaic_silver', silver); put(bag, 'gold', gold);
  if (red.length) put(bag, 'porphyry', red);
}

// ── 6. the phiale ────────────────────────────────────────────────────────────
/**
 * The phiale, the fountain in the middle of the atrium (docs/buildings/hagia-sophia.md; the atrium of the 6th century had "a
 * fountain, the phiale, in the middle"): three octagonal steps, a basin whose eight sides are slabs of marble each framed in green
 * stone with a cross in a roundel and a bronze spout, small columns at the angles, a coping, in the middle a verde antico
 * column with a bowl and a bronze pine cone from which the water rises; over it eight verde antico columns carry an octagonal
 * architrave and a lead roof with a gilded cross. [inferred: the canopy and the pine cone after the phialai of Byzantine
 * churches; Wikipedia "Hagia Sophia": the atrium had a fountain at its centre]
 */
export function hsPhiale(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r || 2.4, ap = r * Math.cos(Math.PI / 8);      // r the circumradius of the basin, ap its apothem
  const oct = (prof, mat, dy = 0) => { const g = lathe(prof, 8, null, 0, 0, 0); g.rotateY(Math.PI / 8); g.translate(x, y + dy, z); bag.add(mat, g); };
  const YB = 0.3;                                                                          // the basin's floor: two steps up
  oct([[r + 1.1, 0], [r + 1.1, 0.15], [r + 0.96, 0.18], [0.001, 0.18]], 'marble');
  oct([[r + 0.9, 0.18], [r + 0.9, 0.28], [r + 0.78, 0.3], [0.001, 0.3]], 'marble');
  oct([[r + 0.14, YB + 0.56], [r + 0.14, YB + 0.7], [r - 0.1, YB + 0.72], [r - 0.1, YB + 0.56]], 'marble_smooth');      // the coping
  // the eight slabs, framed in green stone with a roundel and a cross, a bronze spout in each, a small column at each angle
  const slab = [], bord = [], ringG = [], disc = [], gold = [];
  for (let i = 0; i < 8; i++) {
    const a = 2 * Math.PI * i / 8, n = [Math.cos(a), Math.sin(a)], u = [-n[1], n[0]], hw = ap * Math.tan(Math.PI / 8) - 0.12;
    const W = frame([x + n[0] * ap, z + n[1] * ap], u, n), nv = nOf(W), ym = y + YB + 0.28;
    fbox(slab, W, -hw, hw, y + YB, y + YB + 0.56, -0.1, 0.06);
    for (const [u0, u1, v0, v1] of [[-hw + 0.06, hw - 0.06, 0.06, 0.12], [-hw + 0.06, hw - 0.06, 0.44, 0.5], [-hw + 0.06, -hw + 0.12, 0.12, 0.44], [hw - 0.12, hw - 0.06, 0.12, 0.44]]) fbox(bord, W, u0, u1, y + YB + v0, y + YB + v1, 0.06, 0.085);
    ringN(ringG, W, 0, ym, 0.1, 0.15, 0.09, nv, 14); ringN(disc, W, 0, ym, 0, 0.1, 0.087, nv, 14);
    crossN(gold, W, 0, ym, 0.05, 0.01, 0.094);
    bag.add('bronze', rod(W(0, y + YB + 0.1, 0.06), W(0, y + YB + 0.1, 0.3), 0.035, 6));
    bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.075, 0.04], [0.001, 0.05]], 8, null, ...W(0, y + YB + 0.1, 0.3)));
    const ca = a + Math.PI / 8, cxp = x + Math.cos(ca) * r, czp = z + Math.sin(ca) * r;
    bag.add('verde_antico', lathe([[0.1, 0], [0.09, 0.62]], 10, null, cxp, y + YB, czp));
    bag.add('marble', lathe([[0.13, 0], [0.13, 0.06], [0.1, 0.1], [0.001, 0.1]], 10, null, cxp, y + YB + 0.62, czp));
  }
  put(bag, 'marble_smooth', slab); put(bag, 'verde_antico', bord); put(bag, 'revetment_green', ringG); put(bag, 'porphyry', disc); put(bag, 'gold', gold);
  bag.add('water', lathe([[0.001, 0], [r - 0.14, 0]], 8, null, x, y + YB + 0.46, z));
  // the middle: a column, a bowl, a bronze pine cone from which the water rises
  bag.add('verde_antico', lathe([[0.2, 0], [0.16, 0.9]], 14, null, x, y + YB, z));
  bag.add('marble', lathe([[0.28, 0], [0.22, 0.16], [0.3, 0.2]], 14, null, x, y + YB, z));
  bag.add('marble_smooth', lathe([[0.16, 0], [0.5, 0.0], [0.62, 0.16], [0.58, 0.2], [0.45, 0.1], [0.1, 0.12]], 14, null, x, y + YB + 0.9, z));
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0.04], [0.2, 0.2], [0.22, 0.36], [0.15, 0.55], [0.06, 0.66], [0.001, 0.7]], 12, null, x, y + YB + 1.05, z));
  bag.add('water', lathe([[0.001, 0], [0.45, 0]], 14, null, x, y + YB + 1.03, z));
  col.circle(x, z, r + 1.1, y, y + 1.3);
  // the canopy: eight columns at the angles of a wider octagon, an architrave, a lead roof with a gilded cross
  const RC = r + 0.7, CH = 3.6, y0c = y + 0.3;
  for (let i = 0; i < 8; i++) {
    const a = 2 * Math.PI * (i + 0.5) / 8;
    hsColumn({ at: [x + Math.cos(a) * RC, z + Math.sin(a) * RC], y: y0c, h: CH - 0.3, d: 0.34, shaftMat: 'verde_antico', capMat: 'marble', impost: true }, { bag, col });
  }
  oct([[RC + 0.1, CH], [RC + 0.3, CH], [RC + 0.3, CH + 0.4], [RC + 0.1, CH + 0.4]], 'marble');
  oct([[RC + 0.3, CH + 0.04], [RC + 0.34, CH + 0.04], [RC + 0.34, CH + 0.1], [RC + 0.3, CH + 0.1]], 'gold');
  oct([[RC + 0.7, CH + 0.4], [RC + 0.5, CH + 0.85], [RC * 0.62, CH + 1.5], [0.3, CH + 2.2], [0.001, CH + 2.4]], 'lead');
  const ceil = [];
  for (let i = 0; i < 8; i++) { const a = 2 * Math.PI * (i + 0.5) / 8, b = 2 * Math.PI * (i + 1.5) / 8; tri(ceil, [x, y + CH + 0.4, z], [x + Math.cos(a) * RC, y + CH + 0.4, z + Math.sin(a) * RC], [x + Math.cos(b) * RC, y + CH + 0.4, z + Math.sin(b) * RC], [0, -1, 0]); }
  put(bag, 'mosaic_gold', ceil);
  bag.add('gold', box(x - 0.05, y + CH + 2.35, z - 0.05, x + 0.05, y + CH + 3.0, z + 0.05));
  bag.add('gold', box(x - 0.24, y + CH + 2.7, z - 0.045, x + 0.24, y + CH + 2.8, z + 0.045));
}
