// The walls of Mycenae (docs/settlements/mycenae.md §4.1, §4.2): Cyclopean runs of rough boulders, the dressed conglomerate of the west front
// (bastion, approach court), the Lion Gate with its relieving triangle and the lionesses, the north gate.

import { box, frustum, fromTriangles } from '../../core/geom.js';
import { profile, ell, cap, poly } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';
import { rng, mergeG, inFrame, courses } from './util.js';

const ROUGH = 'rock_boulder', CORE = 'rubble', DRESSED = 'limestone_yellow';

/** A block of a face: front at the face, `d` deep, its top and sides leaning in a little (rough work), five faces only. */
function block(rand, [ua, ya, ub, yb], z0, z1, front, o) {
  const g = o.gap, lean = o.lean * rand();
  const r = front < 0 ? [ua + g, z0, ub - g, z1] : [ua + g, z0, ub - g, z1];
  const top = o.top;
  return frustum(r, ya + g, yb - g, lean * 0.6, lean * 0.6, front < 0 ? lean : 0, front < 0 ? 0 : lean, { noBottom: true, noTop: !top, ...(front < 0 ? { noZp: true } : { noZn: true }) });
}

/**
 * wall_run: { a, b, th, y0, y1, yi (the ground inside), ashlar, seed, ext, caps: [capA, capB] } — a stretch of wall on the centre line a→b: a core of
 * rubble and the boulders (or dressed blocks) of both faces; the outward face is to the right of a→b (−z in the run's frame).
 */
export function wallRun(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), th = el.th, ext = el.ext ?? 0, y0 = el.y0, y1 = el.y1;
  const ash = !!el.ashlar, H = ash ? [0.6, 0.85] : [0.9, 1.5], W = ash ? [1.1, 2.1] : [1.0, 2.6], o = { gap: ash ? 0.02 : 0.07, lean: ash ? 0.02 : 0.14 };
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

/** north_gate: { at, u, n, w, h, th, y, y1, yi, seed } — the postern in the north wall: two jambs, a lintel, the wall above, the paved passage. */
export function northGate(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, [ux, uz] = el.u, hw = el.w / 2, run = (s0, s1, y0, y1, k) => wallRun({ a: [x + ux * s0, z + uz * s0], b: [x + ux * s1, z + uz * s1], th: el.th, y0, y1, yi: el.yi, ashlar: false, seed: el.seed + k, ext: 0 }, ctx);
  run(-4, -hw, el.y0, el.y1, 1); run(hw, 4, el.y0, el.y1, 2);
  // the lintel over the passage and the wall above it
  const top = el.y + el.h;
  bag.add(DRESSED, inFrame(box(-hw - 0.6, top, -el.th / 2, hw + 0.6, top + 0.7, el.th / 2), [x - ux * 0, z - uz * 0], [x + ux, z + uz]));
  col.segment([x - ux * (hw + 0.6), z - uz * (hw + 0.6)], [x + ux * (hw + 0.6), z + uz * (hw + 0.6)], el.th, top, top + 0.7);
  run(-hw - 0.6, hw + 0.6, top + 0.7, el.y1, 3);
  const p0 = [x - ux * hw, z - uz * hw], p1 = [x + ux * hw, z + uz * hw];
  const q = [x + el.n[0] * el.th * 0.5, z + el.n[1] * el.th * 0.5];
  void p0; void p1; void q;
  // the floor of the passage
  const nx = el.n[0], nz = el.n[1], pts = [[x - ux * hw - nx * el.th / 2, z - uz * hw - nz * el.th / 2], [x + ux * hw + nx * el.th / 2, z + uz * hw + nz * el.th / 2]];
  const r = [Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])];
  bag.add('flagstone', box(r[0], el.y - 0.3, r[1], r[2], el.y, r[3]));
  col.floor(r, el.y);
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
  bag.add('travertine', profile(reliefParts(true).map(([q, f]) => [q, f]), { p: [slabX, lintelTop, 0], u: [0, 0, 1], o: [-1, 0, 0], s: 1, d: rel }));
  void merge; void fromTriangles;
  // threshold stone and the floor of the passage
  bag.add('flagstone', box(X - 0.4, y - 0.4, -hw - 0.2, X + th + 0.4, y, hw + 0.2));
  col.floor([X - 0.4, -hw, X + th + 0.4, hw], y);
  // the door's pivot stones inside
  for (const s of [-1, 1]) bag.add('granite_grey', box(X + th - 0.9, y, s * (hw - 0.05) - 0.18, X + th - 0.5, y + 0.12, s * (hw - 0.05) + 0.18));
  void cap; void ell;
}
