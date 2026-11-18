// The walls of Mycenae (docs/settlements/mycenae.md §4.1, §4.2): Cyclopean runs of rough boulders, the dressed conglomerate of the west front
// (bastion, approach court), the Lion Gate with its relieving triangle and the lionesses, the north gate.

import { box, frustum, fromTriangles, place } from '../../core/geom.js';
import { profile, ell, cap, poly } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';
import { rng, mergeG, inFrame, courses } from './util.js';
import { stud, bar } from './relief.js';
import { lionRelief } from './lions.js';
import { toPlane, prism } from '../greek/sculpture.js';

const ROUGH = 'rock_boulder', CORE = 'rubble', DRESSED = 'limestone_yellow';

/** A block of a face: front at the face, `d` deep, its top and sides leaning in a little (rough work); the front bulges to a boulder's crown (a swell of nine points), five faces. */
function block(rand, [ua, ya, ub, yb], z0, z1, front, o) {
  const g = o.gap, lean = o.lean * rand();
  const x0 = ua + g, x1 = ub - g, y0 = ya + g, y1 = yb - g, top = o.top, f = front < 0 ? -1 : 1;
  const iz = lean, ix = lean * 0.6;
  const zf = f < 0 ? z0 : z1, zb = f < 0 ? z1 : z0;
  void zb;
  const base = frustum(f < 0 ? [x0, z0, x1, z1] : [x0, z0, x1, z1], y0, y1, ix, ix, f < 0 ? iz : 0, f < 0 ? 0 : iz, { noBottom: true, noTop: !top, noZn: true, noZp: true });
  // the face: corners at the bottom and (leaning) at the top
  const zt = zf - f * iz;
  const A = [x0, y0, zf], B = [x1, y0, zf], C = [x1 - ix, y1, zt], D = [x0 + ix, y1, zt];
  // nine points of the face: corners on the plane, the edge midpoints and the crown pushed out by uneven amounts (a boulder's swell, not a pyramid)
  const lerp = (u, v, k) => [x0 + (x1 - x0) * u + (k ? (rand() - 0.5) * 0.06 : 0), y0 + (y1 - y0) * v, zf + (zt - zf) * v + f * k * o.bulge];
  const gr = [[lerp(0, 0, 0), lerp(0.5, 0, 0.35 + rand() * 0.3), lerp(1, 0, 0)], [lerp(0.5 - 0.1 + rand() * 0.2, 0.5, 0.35 + rand() * 0.3), lerp(0.5 + (rand() - 0.5) * 0.3, 0.5, 0.8 + rand() * 0.5), lerp(1, 0.5, 0.3 + rand() * 0.3)], [lerp(0, 1, 0), lerp(0.5, 1, 0.3 + rand() * 0.3), lerp(1, 1, 0)]];
  gr[1][0] = lerp(0, 0.5, 0.3 + rand() * 0.3);
  const t = [];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const p00 = gr[i][j], p10 = gr[i][j + 1], p11 = gr[i + 1][j + 1], p01 = gr[i + 1][j];
    // quad p00 p10 p11 p01 runs +x then +y: counter-clockwise from the +z side
    if (f > 0) t.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    else t.push(...p00, ...p11, ...p10, ...p00, ...p01, ...p11);
  }
  const face = fromTriangles(t);
  return mergeG([base, face]);
}

/**
 * wall_run: { a, b, th, y0, y1, yi (the ground inside), ashlar, seed, ext, caps: [capA, capB] } — a stretch of wall on the centre line a→b: a core of
 * rubble and the boulders (or dressed blocks) of both faces; the outward face is to the right of a→b (−z in the run's frame).
 */
export function wallRun(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), th = el.th, ext = el.ext ?? 0, y0 = el.y0, y1 = el.y1;
  const ash = !!el.ashlar, H = ash ? [0.6, 0.85] : [1.0, 1.6], W = ash ? [1.1, 2.1] : [1.4, 3.4], o = { gap: ash ? 0.02 : 0.07, lean: ash ? 0.02 : 0.14, bulge: ash ? 0.03 : 0.16 };
  const geo = [], core = [];
  core.push(box(-ext + 0.5, y0, -th / 2 + 0.6, L + ext - 0.5, y1 - 0.2, th / 2 - 0.6));
  const rows = courses(rand, -ext, L + ext, y0, y1, { h: H, w: W, taper: ash ? 0.01 : 0.05 });
  const yIn = el.yi ?? y1 - 2.2, lastRow = Math.max(...rows.map((r) => r[4]));
  for (const r of rows) {
    const d = (ash ? 0.8 : 0.9 + rand() * 0.5);
    geo.push(block(rand, r, -th / 2 - (ash ? 0 : rand() * 0.28), -th / 2 + d, -1, { ...o, top: r[3] >= y1 - 0.01 }));
    if (r[3] > yIn - 0.3) geo.push(block(rand, r, th / 2 - d, th / 2 + (ash ? 0 : rand() * 0.14), 1, { ...o, top: r[3] >= y1 - 0.01 }));
  }
  void lastRow;
  // the ends
  const caps = el.caps ?? [false, false];
  for (const [k, at] of [[0, -ext], [1, L + ext]]) {
    if (!caps[k]) continue;
    for (const r of courses(rand, -th / 2, th / 2, y0, y1, { h: H, w: [1.0, 2.0], taper: 0.03 })) {
      const d = 0.85, x0 = k ? at - d : at, x1 = k ? at : at + d, gp = o.gap;
      geo.push(frustum([x0, r[0] + gp, x1, r[2] - gp], r[1] + gp, r[3] - gp, 0, 0, 0, 0, { noBottom: true, noTop: r[3] < y1 - 0.01, ...(k ? { noXn: true } : { noXp: true }) }));
    }
  }
  bag.add(CORE, inFrame(mergeG(core), el.a, el.b));
  bag.add(ash ? DRESSED : ROUGH, inFrame(mergeG(geo), el.a, el.b));
  const ux = (bx - ax) / L, uz = (bz - az) / L;
  col.segment([ax - ux * ext, az - uz * ext], [bx + ux * ext, bz + uz * ext], th, y0, y1);
}

/**
 * north_gate: { at, u, n, w, h, th, y, y1, yi, seed } — the postern in the north wall (docs §15): two jambs each of two great squared blocks leaning in, a lintel of two monoliths,
 * a corbelled hood of three stepped slabs over it standing for the relieving triangle (undecorated), the wall above, the paved passage with its threshold, pivot stones, bar-holes
 * and the two plank doors swung back against the jambs.
 */
export function northGate(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, [ux, uz] = el.u, hw = el.w / 2, J = 0.95, run = (s0, s1, y0, y1, k) => wallRun({ a: [x + ux * s0, z + uz * s0], b: [x + ux * s1, z + uz * s1], th: el.th, y0, y1, yi: el.yi, ashlar: false, seed: el.seed + k, ext: 0 }, ctx);
  run(-4, -hw - J, el.y0, el.y1, 1); run(hw + J, 4, el.y0, el.y1, 2);
  const top = el.y + el.h, th = el.th, L = hw + J + 0.4, F = (g) => inFrame(g, [x, z], [x + ux, z + uz]), dressed = [], rand = rng(el.seed);
  // jambs: two blocks deep, leaning in; the outer face a little rough
  for (const s of [-1, 1]) for (const [za, zb] of [[-th / 2, 0.1], [0.1, th / 2]]) {
    const r = s > 0 ? [hw, za + 0.02, hw + J, zb - 0.02] : [-hw - J, za + 0.02, -hw, zb - 0.02];
    dressed.push(frustum(r, el.y, top, s > 0 ? 0 : 0.05, s > 0 ? 0.05 : 0, 0, 0, { noBottom: true }));
  }
  // the lintel of two monoliths, and over it the corbelled hood: three slabs stepping in, each proud of the face
  dressed.push(box(-L, top, -th / 2, L, top + 0.85, -0.02), box(-L, top, 0.02, L, top + 0.85, th / 2));
  const hood = [[L - 0.1, 0.5, 0.42], [L - 0.5, 0.5, 0.5], [L - 0.9, 0.5, 0.58]];
  hood.forEach(([hl, hh, pr], i) => dressed.push(box(-hl, top + 0.85 + i * hh, -th / 2 - pr, hl, top + 0.85 + (i + 1) * hh, th / 2)));
  const hoodTop = top + 0.85 + 3 * 0.5;
  col.segment([x - ux * L, z - uz * L], [x + ux * L, z + uz * L], th, top, top + 0.85);
  bag.add(DRESSED, F(mergeG(dressed)));
  run(-L, L, hoodTop, el.y1, 3);
  run(-hw - J, hw + J, el.y0, el.y - 0.3, 4);      // the wall under the passage's floor (the postern stands high over the ravine)
  // the core between the hood and the lintel's ends and the wall beside: filled by the wall's own core
  // the floor: a threshold of one great stone with the door's pivot stones and the bar-holes cut in the jambs
  const nx = el.n[0], nz = el.n[1], pts = [[x - ux * hw - nx * th / 2, z - uz * hw - nz * th / 2], [x + ux * hw + nx * th / 2, z + uz * hw + nz * th / 2]];
  const r = [Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])];
  bag.add('flagstone', box(r[0], el.y - 0.3, r[1], r[2], el.y, r[3]));
  col.floor(r, el.y);
  const inner = [], leaf = [], rail = [], nails = [], pivot = [], bars = [], zD = th / 2 - 1.2;
  for (const s of [-1, 1]) {
    pivot.push(box(s * (hw - 0.05) - 0.17, el.y, zD - 0.17, s * (hw - 0.05) + 0.17, el.y + 0.1, zD + 0.17));
    bars.push(box(s * (hw + 0.02) - 0.0, el.y + 1.3, zD - 1.2 - 0.12, s * (hw + 0.02) + (s > 0 ? 0.08 : -0.08), el.y + 1.46, zD - 1.2 + 0.12));
    // the leaf lying along the jamb, planked, railed, studded
    const a = s > 0 ? hw - 0.14 : -hw + 0.02, b = s > 0 ? hw - 0.02 : -hw + 0.14, za = zD - 1.45, zb = zD + 0.1;
    for (let k = 0; k < 5; k++) { const q = za + k * ((zb - za) / 5); leaf.push(box(Math.min(a, b), el.y + 0.02, q + 0.01, Math.max(a, b), el.y + el.h - 0.1, q + (zb - za) / 5 - 0.01)); }
    for (const v of [0.4, 1.35, 2.2]) rail.push(box(s > 0 ? hw - 0.19 : -hw + 0.14, el.y + v, za, s > 0 ? hw - 0.14 : -hw + 0.19, el.y + v + 0.14, zb));
    for (let q = za + 0.16; q < zb - 0.05; q += 0.26) for (const v of [0.47, 1.42, 2.27]) nails.push(stud([s > 0 ? hw - 0.19 : -hw + 0.19, el.y + v + 0.07, q], [-s, 0, 0], 0.03));
  }
  void inner;
  bag.add('timber', F(mergeG(leaf))); bag.add('cedar', F(mergeG(rail))); bag.add('bronze', F(mergeG(nails))); bag.add('granite_grey', F(mergeG(pivot))); bag.add(DRESSED, F(mergeG(bars)));
  void rand;
}

/** ramp: { pts: [[x, z, ground y], ...] (a centre line a metre apart), w, kerb, seed } — the paved way: courses of flat limestone slabs a hand over the ground, the joints hashed, kerbs. */
export function ramp(el, { bag }) {
  const rand = rng(el.seed ?? 1), pts = el.pts, w = el.w, slabs = [], kerb = [];
  const quad = (c, ux, uz, nx, nz, u0, u1, v0, v1, ya, yb, yt, list) => {
    const P = (u, v) => [c[0] + ux * u + nx * v, c[1] + uz * u + nz * v];
    const [a, b, d, e] = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
    const xs = [a[0], b[0], d[0], e[0]], zs = [a[1], b[1], d[1], e[1]];
    list.push(box(Math.min(...xs), ya, Math.min(...zs), Math.max(...xs), yt, Math.max(...zs)));
    void yb;
  };
  void quad;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az, ay] = pts[i], [bx, bz, by] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const n = 1 + (rand() < 0.35 ? 1 : 0), yc = Math.max(ay, by);
    let v = -w / 2;
    while (v < w / 2 - 0.3) {
      const sw = Math.min(w / 2 - v, 0.9 + rand() * 1.0), v1 = v + sw, sl = L * (0.94 + rand() * 0.05) / n;
      for (let k = 0; k < n; k++) {
        // a slab: rotated to the way, its top flat, the sides down into the ground
        const cu = L * (k + 0.5) / n, cx = ax + ux * cu + nx * (v + v1) / 2, cz = az + uz * cu + nz * (v + v1) / 2, yy = yc + 0.05 + rand() * 0.03;
        slabs.push(place(box(-sl / 2 + 0.03, yy - 1.0, -(sw - 0.06) / 2, sl / 2 - 0.03, yy, (sw - 0.06) / 2), cx, 0, cz, -Math.atan2(uz, ux)));
        void k;
      }
      v = v1;
    }
    if (el.kerb) for (const sgn of [-1, 1]) kerb.push(place(box(-L / 2, yc - 1.0, -0.16, L / 2, yc + 0.22, 0.16), ax + ux * L / 2 + nx * sgn * (w / 2 + 0.16), 0, az + uz * L / 2 + nz * sgn * (w / 2 + 0.16), -Math.atan2(uz, ux)));
  }
  void kerb;
  bag.add('flagstone', mergeG(slabs));
  if (kerb.length) bag.add('flagstone', mergeG(kerb));
}

// ── the Lion Gate ────────────────────────────────────────────────────────────────────────────

/** The two lionesses and the column between them, in relief on the triangular slab (u along the wall, v up from the lintel). */
function reliefParts(heads) {
  const mir = (pts) => pts.map(([a, b]) => [-a, b]).reverse();
  const out = [], L = [];
  const tri = [[-1.8, 0], [1.8, 0], [0, 3.3]];
  out.push([tri, 0.18]);
  // the altar, the column tapering downward, its capital and abacus, the four discs above
  out.push([poly([-0.95, 0], [0.95, 0], [0.95, 0.42], [-0.95, 0.42]), 0.55]);
  out.push([poly([-0.15, 0.42], [0.15, 0.42], [0.21, 1.72], [-0.21, 1.72]), 0.7]);
  out.push([ell(0, 1.8, 0.3, 0.1, 12), 0.8], [poly([-0.32, 1.88], [0.32, 1.88], [0.32, 2.0], [-0.32, 2.0]), 0.8]);
  for (const u of [-0.21, -0.07, 0.07, 0.21]) out.push([ell(u, 2.14, 0.055, 0.055, 7), 0.75]);
  // a lioness rampant, facing the column: hind legs on the ground, forepaws on the altar, the neck rising, the head (restored) turned out
  L.push([cap([-1.1, 0.75], [-0.55, 1.38], 0.28, 0.22), 1.0]);
  L.push([cap([-1.12, 0.72], [-1.3, 0.05], 0.17, 0.09), 0.85], [poly([-1.42, 0], [-1.05, 0], [-1.08, 0.1], [-1.4, 0.12]), 0.85]);
  L.push([cap([-0.62, 1.2], [-0.62, 0.46], 0.1, 0.07), 1.2], [poly([-0.8, 0.42], [-0.35, 0.42], [-0.38, 0.5], [-0.78, 0.52]), 1.2]);
  L.push([cap([-0.52, 1.4], [-0.45, 1.88], 0.17, 0.12), 1.0]);
  if (heads) L.push([ell(-0.42, 2.02, 0.2, 0.15, 10), 1.1], [poly([-0.62, 2.1], [-0.55, 2.25], [-0.47, 2.14]), 1.1], [poly([-0.35, 2.14], [-0.28, 2.25], [-0.22, 2.1]), 1.1]);
  L.push([cap([-1.25, 1.0], [-1.55, 0.55], 0.045, 0.03), 0.9], [cap([-1.55, 0.55], [-1.5, 0.25], 0.03, 0.05), 0.9]);
  for (const p of L) { out.push(p); out.push([mir(p[0]), p[1]]); }
  return out;
}

/**
 * lion_gate: { x (the west face), z, y (threshold), w, h, th, y1 (top), seed } — the gate wall x..x+th of dressed conglomerate: jambs leaning in, the 4.5 m lintel,
 * the corbelled relieving triangle closed by the slab with the lionesses and the column, the covered passage, the threshold, the pivot holes' stones.
 */
export function lionGate(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 5), X = el.x, th = el.th, hw = el.w / 2, y = el.y, yb = y - 0.9, yT = el.y1, zE = el.zExt ?? 11;
  const lintelY = y + el.h, lintelTop = lintelY + 0.8, hTri = 3.3, rel = 0.28, front = 1.0;
  const dressed = [], core = [];
  // jambs leaning in: 3.10 m at the threshold, 2.78 under the lintel
  for (const s of [-1, 1]) {
    const r = s > 0 ? [X, hw, X + th, hw + 0.85] : [X, -hw - 0.85, X + th, -hw];
    const g = frustum(r, y, lintelY, 0, 0, s > 0 ? -0.16 : 0, s > 0 ? 0 : -0.16);
    dressed.push(g);
    col.rect(r, y, lintelY);
  }
  // the lintel (two monoliths under one) and the slabs that roof the passage behind it
  dressed.push(box(X, lintelY, -2.25, X + 2.0, lintelTop, 2.25), box(X + 2.0, lintelY, -2.25, X + th, lintelTop, 2.25));
  col.rect([X, -2.25, X + th, 2.25], lintelY, lintelTop);
  // the wall over the lintel's width and beside: face courses, the corbelled edge above the lintel
  const yTri = lintelTop;
  const cut = (ya, yb2) => { const k = Math.max(0, Math.min(1, (yb2 - yTri) / hTri)); return yb2 <= yTri ? [-zE, zE] : [-zE, zE]; };
  void cut;
  for (const s of [-1, 1]) {
    // left/right of the opening: courses over the jamb stones' outer edge, to the top; above the lintel the inner edge steps in along the triangle
    const inner = (ya, yb2) => (ya < yTri - 0.01 ? hw + 0.85 : Math.max(0.0, 1.8 * (1 - (yb2 - yTri) / hTri) - 0.05));
    for (const r of courses(rand, 0, zE, yb, yT, { h: [0.62, 0.85], w: [1.1, 2.1], taper: 0.01, cut: (ya, yb2) => [inner(ya, yb2), zE] })) {
      const [ua, ya, ub, yb2] = r, gp = 0.02, u0 = Math.min(ua, ub), u1 = Math.max(ua, ub);
      const rect = s > 0 ? [X, u0 + gp, X + front, u1 - gp] : [X, -u1 + gp, X + front, -u0 - gp];
      dressed.push(frustum(rect, ya + gp, yb2 - gp, 0, 0, 0, 0, { noBottom: true, noTop: yb2 < yT - 0.01, noXp: true }));
    }
    // the mass behind the faces
    core.push(box(X + front, yb, s > 0 ? hw + 0.85 : -zE, X + th, yT - 0.3, s > 0 ? zE : -hw - 0.85));
    col.rect(s > 0 ? [X, hw + 0.85, X + th, zE] : [X, -zE, X + th, -hw - 0.85], yb, yT);
  }
  core.push(box(X + front, lintelTop, -hw - 0.85, X + th, yT - 0.3, hw + 0.85));
  col.rect([X, -hw - 0.85, X + th, hw + 0.85], lintelTop, yT);
  bag.add(DRESSED, mergeG(dressed));
  bag.add(CORE, mergeG(core));
  // the slab with the relief, set back a hand's breadth from the face, over the lintel (the front of the relief level with the wall)
  const slabX = X + 0.32;
  const slab = prism([[-1.8, 0], [1.8, 0], [0, 3.3]], 0.12), plane = { p: [slabX, lintelTop, 0], u: [0, 0, 1], o: [-1, 0, 0] };
  bag.add('travertine', toPlane(mergeG([slab, lionRelief()]), plane.p, plane.u, plane.o));
  void merge; void fromTriangles;
  // threshold stone and the floor of the passage
  bag.add('flagstone', box(X - 0.4, y - 0.4, -hw - 0.2, X + th + 0.4, y, hw + 0.2));
  col.floor([X - 0.4, -hw, X + th + 0.4, hw], y);
  // the door's pivot stones inside
  for (const s of [-1, 1]) bag.add('granite_grey', box(X + th - 0.9, y, s * (hw - 0.05) - 0.18, X + th - 0.5, y + 0.12, s * (hw - 0.05) + 0.18));
  // the double doors on their pivot beams, swung back against the jambs inside the passage and leaning with them (the doors' wood planked, railed and studded with bronze)
  {
    const lean = 0.155, lh = 2.85, xa = X + th - 0.7 - 1.62, xb = X + th - 0.7, planks = [], rails = [], nails = [], rings = [];
    for (const s of [-1, 1]) {
      const za = s > 0 ? hw - 0.16 : -hw + 0.04, zb = s > 0 ? hw - 0.04 : -hw + 0.16;
      for (let k = 0; k < 6; k++) {
        const a = xa + k * ((xb - xa) / 6);
        planks.push(frustum([a + 0.012, za, a + (xb - xa) / 6 - 0.012, zb], y + 0.02, y + lh, 0, 0, s > 0 ? -lean : lean, s > 0 ? lean : -lean));
      }
      const inner = (v) => s * (hw - 0.16 - lean * (v / lh));            // the leaf's inner face at height v above the threshold
      for (const v of [0.45, 1.4, 2.4]) { const z = inner(v); rails.push(box(xa, y + v, Math.min(z, z - s * 0.05), xb, y + v + 0.15, Math.max(z, z - s * 0.05))); }
      for (let a = xa + 0.18; a < xb - 0.1; a += 0.28) for (const v of [0.52, 1.47, 2.47]) for (const dv of [0.03, 0.12]) nails.push(stud([a, y + v + dv, inner(v) - s * 0.05], [0, 0, -s], 0.032));
      // the bronze ring on a boss, and the pivot's iron shoe
      rings.push(bar((u, v, d) => [u, y + v, d], xa + 0.35, 1.15, xa + 0.35, 1.45, 0.02, inner(1.3) - s * 0.08, 6));
      col.rect([xa, s > 0 ? hw - 0.17 : -hw, xb, s > 0 ? hw : -hw + 0.17], y, y + lh);
    }
    bag.add('timber', mergeG(planks)); bag.add('cedar', mergeG(rails)); bag.add('bronze', mergeG(nails)); bag.add('bronze', mergeG(rings));
  }
  void cap; void ell;
}
