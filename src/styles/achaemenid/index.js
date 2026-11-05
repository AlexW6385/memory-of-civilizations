// Achaemenid architecture (6th–5th c. BC; docs/settlements/persepolis.md §4): a stone terrace with
// a crenellated parapet; hypostyle halls on tall, slender fluted stone columns with bell bases and
// double-protome capitals (bulls, lions, griffins) carrying cedar beams; thick mudbrick walls,
// plastered, with dark stone door and window frames; corner towers; gates guarded by winged bulls;
// stepped merlons; the town's flat-roofed mudbrick houses.

import { registerStyle, STYLES } from '../../core/build.js';
import { Matrix4 } from '../../core/three.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import '../qing/index.js';

const S = 'limestone_persian', W = 'plaster_persian';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A column: bell base, fluted shaft, the double-protome capital set across `beam` ('x' or 'z'). */
function column(bag, col, x, z, y, h, d, beam = 'x', simple = false) {
  const r = d / 2;
  bag.add(S, lathe([[r * 1.9, 0], [r * 1.9, 0.25], [r * 1.5, 0.5], [r * 1.25, 0.9], [r * 1.2, 1.1]], simple ? 8 : 14, null, x, y, z));
  const capH = Math.min(4.5, h * 0.22), sh = h - capH - 1.1;
  bag.add(S, lathe([[r, 0], [r * 0.92, sh]], simple ? 8 : 16, null, x, y + 1.1, z));
  col.circle(x, z, r * 1.2, y, y + h);
  const yc = y + 1.1 + sh;
  if (simple) { bag.add(S, box(x - r * 1.6, yc, z - r * 1.6, x + r * 1.6, y + h, z + r * 1.6)); return; }
  // the volute block and the two kneeling protomes back to back
  bag.add(S, box(x - r * 1.1, yc, z - r * 1.1, x + r * 1.1, yc + capH * 0.45, z + r * 1.1));
  const L = r * 3.2, ax = beam === 'x';
  for (const s of [-1, 1]) {
    const bx = ax ? x + s * L / 2 : x, bz = ax ? z : z + s * L / 2;
    bag.add(S, box(bx - (ax ? L / 2 : r * 0.8), yc + capH * 0.45, bz - (ax ? r * 0.8 : L / 2), bx + (ax ? L / 2 : r * 0.8), y + h - capH * 0.15, bz + (ax ? r * 0.8 : L / 2)));
    const hx = ax ? x + s * (L + r * 0.4) : x, hz = ax ? z : z + s * (L + r * 0.4);
    bag.add(S, box(hx - r * 0.5, y + h - capH * 0.6, hz - r * 0.5, hx + r * 0.5, y + h + capH * 0.1, hz + r * 0.5));
  }
}
/** A stepped (crenellated) parapet of merlons along a segment. */
function merlons(bag, a, b, y, h = 1.4, w = 1.1, mat = S) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / (w * 2)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i < n; i++) {
    const s = (i + 0.5) * L / n, cx = a[0] + ux * s, cz = a[1] + uz * s, hw = w / 2;
    const hx = Math.abs(ux) > 0.5 ? hw : 0.35, hz = Math.abs(ux) > 0.5 ? 0.35 : hw;
    bag.add(mat, box(cx - hx, y, cz - hz, cx + hx, y + h * 0.5, cz + hz));
    bag.add(mat, box(cx - hx * 0.6, y + h * 0.5, cz - hz * 0.6, cx + hx * 0.6, y + h, cz + hz * 0.6));
  }
}

/** terrace: the great platform { rect, y0, y1 } of dressed stone, its parapet of merlons (skip `open` segments as [x0,z0,x1,z1] gaps). */
function terrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add(S, box(x0, el.y0, z0, x1, el.y1, z1)); col.rect(el.rect, el.y0, el.y1); col.floor(el.rect, el.y1);
  if (el.simple) return;
  const gaps = el.gaps || [], inGap = (x, z) => gaps.some((g) => x >= g[0] && x <= g[2] && z >= g[1] && z <= g[3]);
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L / 20);
    for (let i = 0; i < n; i++) {
      const p = [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], q = [a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n];
      if (inGap((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)) continue;
      merlons(bag, p, q, el.y1);
    }
  }
}

/** hall: a hypostyle hall { rect, y, h (column height), grid [nx, nz], porticoes ('nwe…'), towers, walls (thick mudbrick), plinth (height of its own platform) }. */
function hall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0, y = (el.y ?? 0) + pl, h = el.h, [nx, nz] = el.grid, d = el.d ?? Math.min(1.6, h * 0.09);
  const port = el.porticoes ?? '', pd = el.portDepth ?? (x1 - x0) / (nx + 1) * 2.2, th = el.walls ?? 5;
  const P = [x0 - (port.includes('w') ? pd : 0), z0 - (port.includes('n') ? pd : 0), x1 + (port.includes('e') ? pd : 0), z1 + (port.includes('s') ? pd : 0)];
  if (pl > 0) {
    bag.add(S, box(P[0] - 3, el.y ?? 0, P[1] - 3, P[2] + 3, y, P[3] + 3)); col.rect([P[0] - 3, P[1] - 3, P[2] + 3, P[3] + 3], el.y ?? 0, y);
    col.floor([P[0] - 3, P[1] - 3, P[2] + 3, P[3] + 3], y);
  }
  bag.add(S, box(P[0], y, P[1], P[2], y + 0.15, P[3])); col.floor(P, y + 0.15);
  // the columns of the hall
  const sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) column(bag, col, x0 + (i + 0.5) * sx, z0 + (k + 0.5) * sz, y + 0.15, h, d, 'x', el.simple);
  // the porticoes: two rows of columns the width of the hall
  for (const f of port) {
    const alongX = f === 'n' || f === 's', n = alongX ? nx : nz;
    for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) {
      const off = (r + 0.5) * pd / 2;
      const x = alongX ? x0 + (i + 0.5) * sx : (f === 'w' ? x0 - off : x1 + off), z = alongX ? (f === 'n' ? z0 - off : z1 + off) : z0 + (i + 0.5) * sz;
      column(bag, col, x, z, y + 0.15, h, d, alongX ? 'z' : 'x', el.simple);
    }
  }
  // the thick walls with a great door in the middle of each side (open toward porticoes and where `doors` say)
  const doors = el.doors ?? 'nesw', dw = Math.min(5, (x1 - x0) * 0.12), dh = Math.min(h * 0.6, 12);
  const wallSeg = (r, door) => {
    if (!door) { bag.add(W, box(r[0], y, r[1], r[2], y + h + 1.2, r[3])); col.rect(r, y, y + h + 1.2); return; }
    const alongX = r[2] - r[0] > r[3] - r[1], m = alongX ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2;
    const A = alongX ? [r[0], r[1], m - dw / 2, r[3]] : [r[0], r[1], r[2], m - dw / 2], B = alongX ? [m + dw / 2, r[1], r[2], r[3]] : [r[0], m + dw / 2, r[2], r[3]];
    for (const q of [A, B]) { bag.add(W, box(q[0], y, q[1], q[2], y + h + 1.2, q[3])); col.rect(q, y, y + h + 1.2); }
    const L = alongX ? [m - dw / 2, r[1], m + dw / 2, r[3]] : [r[0], m - dw / 2, r[2], m + dw / 2];
    bag.add(W, box(L[0], y + dh, L[1], L[2], y + h + 1.2, L[3]));
    // the dark stone frame
    const fr = alongX ? [[m - dw / 2 - 0.6, m - dw / 2], [m + dw / 2, m + dw / 2 + 0.6]] : [[m - dw / 2 - 0.6, m - dw / 2], [m + dw / 2, m + dw / 2 + 0.6]];
    for (const [a, b] of fr) { const q = alongX ? [a, r[1] - 0.1, b, r[3] + 0.1] : [r[0] - 0.1, a, r[2] + 0.1, b]; bag.add('basalt', box(q[0], y, q[1], q[2], y + dh + 0.6, q[3])); }
  };
  if (th > 0) {
    wallSeg([x0 - th, z0 - th, x1 + th, z0], doors.includes('n'));
    wallSeg([x0 - th, z1, x1 + th, z1 + th], doors.includes('s'));
    wallSeg([x0 - th, z0, x0, z1], doors.includes('w'));
    wallSeg([x1, z0, x1 + th, z1], doors.includes('e'));
  }
  // the corner towers
  if (el.towers && th > 0) for (const [cx, cz] of [[P[0], P[1]], [P[2], P[1]], [P[0], P[3]], [P[2], P[3]]]) {
    const t = el.towers, q = [cx - t / 2, cz - t / 2, cx + t / 2, cz + t / 2];
    bag.add(W, box(q[0], y, q[1], q[2], y + h + 3, q[3])); col.rect(q, y, y + h + 3);
    if (!el.simple) merlons(bag, [q[0], q[1]], [q[2], q[1]], y + h + 3, 1.6, 1.2, W), merlons(bag, [q[0], q[3]], [q[2], q[3]], y + h + 3, 1.6, 1.2, W);
  }
  // the cedar roof: beams and a flat earth roof over all, porticoes included
  bag.add('cedar', box(P[0] - 0.3, y + h, P[1] - 0.3, P[2] + 0.3, y + h + 0.8, P[3] + 0.3));
  bag.add(W, box(P[0] - 0.6, y + h + 0.8, P[1] - 0.6, P[2] + 0.6, y + h + 1.6, P[3] + 0.6)); col.floor(P, y + h + 1.6);
  if (!el.simple) for (const [a, b] of [[[P[0], P[1]], [P[2], P[1]]], [[P[0], P[3]], [P[2], P[3]]], [[P[0], P[1]], [P[0], P[3]]], [[P[2], P[1]], [P[2], P[3]]]]) merlons(bag, a, b, y + h + 1.6, 1.4, 1.1, W);
}

/** lamassu_gate: the Gate of All Nations { c, s (side), h }: a square hall of four columns, great doors west and east guarded by winged bulls. */
function gate(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, s = el.s, h = el.h;
  hall({ rect: [cx - s / 2, cz - s / 2, cx + s / 2, cz + s / 2], y: el.y, h, grid: [2, 2], walls: 4, doors: 'we', d: 1.3, simple: el.simple }, ctx);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) lamassu(bag, cx + sx * (s / 2 + 3.2), cz + sz * 3.4, el.y ?? 0, sx, sz);
}

// an ellipsoid in a frame: centre c, radii along f (forward), y, l (lateral)
function ell(c, f, l, rf, ry, rl, seg = 12) {
  const g = lathe([[0.001, -1], [0.5, -0.87], [0.87, -0.5], [1, 0], [0.87, 0.5], [0.5, 0.87], [0.001, 1]], seg);
  g.scale(rf, ry, rl);
  // the lathe's x is along f, its z along l
  g.applyMatrix4(new Matrix4().fromArray([f[0], 0, f[1], 0, 0, 1, 0, 0, l[0], 0, l[1], 0, c[0], c[1], c[2], 1]));
  return g;
}
/**
 * A winged bull with a man's head (lamassu) standing at a portal, facing out along x (sx), its outer
 * side toward sz: the plinth, the body and its four legs, the chest, the great wing sweeping up and
 * back along the outer flank in rows of feathers, the bearded head under its tall horned crown.
 */
function lamassu(bag, x, z, y, sx, sz) {
  const f = [sx, 0], l = [0, sz], P = (a, b) => [x + f[0] * a + l[0] * b, z + f[1] * a + l[1] * b];
  bag.add(S, box(x - 3.0, y, z - 1.0, x + 3.0, y + 0.6, z + 1.0));
  const yb = y + 0.6;
  // legs: the forelegs together under the chest, the hind legs striding
  for (const [a, b] of [[1.9, -0.42], [1.9, 0.42], [-1.9, -0.42], [-1.3, 0.42]]) { const [lx, lz] = P(a, b); bag.add(S, lathe([[0.4, 0], [0.3, 0.3], [0.27, 1.6], [0.36, 2.2]], 10, null, lx, yb, lz)); }
  const [bx, bz] = P(0, 0);
  bag.add(S, ell([bx, yb + 3.0, bz], f, l, 2.6, 1.15, 0.85));
  const [chx, chz] = P(1.85, 0);
  bag.add(S, ell([chx, yb + 3.3, chz], f, l, 0.95, 1.35, 0.8));
  // the wing: one great curved plate along the outer flank, sweeping up behind the head, with the
  // ridges of its rows of feathers
  const outline = [[1.7, 3.0], [0.2, 2.75], [-1.6, 2.85], [-2.55, 3.3], [-2.5, 4.3], [-1.9, 5.4], [-0.9, 6.0], [0.3, 6.05], [1.1, 5.5], [1.6, 4.3]];
  const tri = [], cA = outline.reduce((q, p) => q + p[0], 0) / outline.length, cY = outline.reduce((q, p) => q + p[1], 0) / outline.length;
  const W3 = (a, yy, o) => { const [px, pz] = P(a, o); return [px, yb + yy, pz]; };
  for (let i = 0; i < outline.length; i++) {
    const [a0, y0] = outline[i], [a1, y1] = outline[(i + 1) % outline.length];
    for (const o of [0.78, 1.0]) tri.push(...W3(cA, cY, o), ...W3(a0, y0, o), ...W3(a1, y1, o));
    tri.push(...W3(a0, y0, 0.78), ...W3(a0, y0, 1.0), ...W3(a1, y1, 1.0), ...W3(a0, y0, 0.78), ...W3(a1, y1, 1.0), ...W3(a1, y1, 0.78));
  }
  const both = []; for (let i = 0; i < tri.length; i += 9) both.push(...tri.slice(i, i + 9), ...tri.slice(i, i + 3), ...tri.slice(i + 6, i + 9), ...tri.slice(i + 3, i + 6));
  bag.add(S, fromTriangles(both));
  for (let r = 0; r < 4; r++) {
    const yy = 3.5 + r * 0.6, a0 = 1.4 - r * 0.1, a1 = -2.3 + r * 0.35, [p0x, p0z] = P(a0, 1.04), [p1x, p1z] = P(a1, 1.04);
    const L = Math.hypot(p1x - p0x, p1z - p0z), g = box(-L / 2, 0, -0.04, L / 2, 0.1, 0.04);
    g.translate((p0x + p1x) / 2, yb + yy, (p0z + p1z) / 2); bag.add(S, g);
  }
  // the head: neck, the face, the long square beard tapering to the chest, the tall horned crown
  const [hx, hz] = P(2.3, 0);
  bag.add(S, lathe([[0.55, 0], [0.48, 0.6], [0.001, 0.62]], 10, null, hx, yb + 4.0, hz));
  bag.add(S, ell([hx, yb + 4.95, hz], f, l, 0.42, 0.55, 0.4));
  const [bdx, bdz] = P(2.55, 0);
  bag.add(S, frustum([bdx - 0.18, bdz - 0.32, bdx + 0.18, bdz + 0.32], yb + 3.7, yb + 4.75, 0.02, 0.02, -0.04, -0.04));
  for (let k = 0; k < 5; k++) bag.add(S, box(bdx - 0.2, yb + 3.8 + k * 0.19, bdz - 0.33, bdx + 0.2, yb + 3.85 + k * 0.19, bdz + 0.33));     // the beard's curled rows
  bag.add(S, lathe([[0.36, 0], [0.4, 0.75], [0.45, 0.8], [0.45, 0.88], [0.001, 0.88]], 12, null, hx, yb + 5.35, hz));
  for (const k of [0.2, 0.45, 0.68]) bag.add(S, lathe([[0.4, 0], [0.4, 0.06], [0.001, 0.06]], 12, null, hx, yb + 5.35 + k, hz));
}

/** persian_house: { rect, seed }: a flat-roofed mudbrick house round a small court, a parapet. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, h = 3.2 + rand() * 0.8, t = 0.6;
  const yard = rand() < 0.6, mx = (x0 + x1) / 2;
  const parts = yard ? [[x0, z0, x1, z0 + (z1 - z0) * 0.5], [x0, z0 + (z1 - z0) * 0.5, x0 + t, z1], [x1 - t, z0 + (z1 - z0) * 0.5, x1, z1], [x0, z1 - t, mx - 0.6, z1], [mx + 0.6, z1 - t, x1, z1]] : [[x0, z0, x1, z1]];
  parts.forEach((r, i) => { const hh = i === 0 ? h : 2.2; bag.add('mudbrick', box(r[0], -0.3, r[1], r[2], hh, r[3])); col.rect(r, 0, hh); });
  bag.add('mud_plaster', box(x0 - 0.05, h, z0 - 0.05, x1 + 0.05, h + 0.3, z0 + (yard ? (z1 - z0) * 0.5 : z1 - z0) + 0.05));
}

registerStyle('achaemenid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, terrace, hall, lamassu_gate: gate, persian_house: house },
  objects: {},
});
