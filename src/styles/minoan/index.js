// Minoan architecture (Neopalatial, about 1600 BC; docs/settlements/knossos.md §4): wings of
// several storeys round a central court; a base of gypsum ashlar, upper walls of rubble and timber
// plastered ochre; porticoes of red columns tapering downward with black cushion capitals; flat
// roofs edged with horns of consecration; stepped theatral areas; the town's two-storey houses with
// red-framed windows.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, quad, orientOutward } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { profile, prism, toPlane, ell, cap, poly } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';
import '../qing/index.js';

const G = 'gypsum_minoan', P = 'plaster_ochre', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * A Minoan column: a stone base disc, the shaft of cypress tapering downward (painted red), a collar ring under the
 * capital, the round cushion of the capital and its square abacus (painted black) — after the restorations at
 * Knossos and the columns in the frescoes (docs/settlements/knossos.md §4a).
 */
function column(bag, col, x, z, y, h, r = 0.35) {
  bag.add(G, lathe([[r * 1.55, 0], [r * 1.6, 0.04], [r * 1.6, 0.2], [r * 1.5, 0.25], [0.001, 0.25]], 16, null, x, y, z));
  const sh = h - 0.75;
  bag.add(RED, lathe([[r * 0.84, 0], [r * 0.95, sh * 0.35], [r * 1.06, sh * 0.75], [r * 1.12, sh]], 16, null, x, y + 0.25, z));
  const c0 = y + 0.25 + sh;
  bag.add(BLK, lathe([[r * 1.12, 0], [r * 1.25, 0.03], [r * 1.25, 0.09], [r * 1.14, 0.12], [r * 1.2, 0.16], [r * 1.7, 0.27], [r * 1.85, 0.36], [r * 1.72, 0.45], [r * 1.45, 0.48], [0.001, 0.48]], 20, null, x, c0, z));
  bag.add(BLK, box(x - r * 1.75, c0 + 0.48, z - r * 1.75, x + r * 1.75, y + h + 0.25, z + r * 1.75));
  col.circle(x, z, r * 1.2, y, y + h);
}
/**
 * Horns of consecration: a stepped base and two horns rising from it and curving outward, cut from a slab (t thick)
 * and plastered white; facing ±z when alongX, else ±x. s scales the whole (1: about 1.8 m wide, 1.1 m high).
 */
const HORN_OUTLINE = [
  [[-0.9, 0], [0.9, 0], [0.82, 0.16], [-0.82, 0.16]],
  [[-0.78, 0.16], [0.78, 0.16], [0.7, 0.3], [-0.7, 0.3]],
];
for (const sgn of [-1, 1]) {
  // each horn in three convex pieces: the root, the shaft leaning out, the tip turning out
  const P = (u, v) => [sgn * u, v];
  const pieces = [[P(0.18, 0.3), P(0.7, 0.3), P(0.66, 0.52), P(0.34, 0.5)], [P(0.34, 0.5), P(0.66, 0.52), P(0.74, 0.8), P(0.56, 0.78)], [P(0.56, 0.78), P(0.74, 0.8), P(0.86, 1.08), P(0.8, 1.1)]];
  for (const q of pieces) HORN_OUTLINE.push(sgn > 0 ? q : q.slice().reverse());
}
function hornsGeometry(s, t) {
  const g = merge(HORN_OUTLINE.map((pts) => prism(pts.map(([u, v]) => [u * s, v * s]), t, true)));
  g.translate(0, 0, -t / 2);
  return g;
}
const HORNS = new Map();
const horns = (bag, x, y, z, s = 1, alongX = true) => {
  const key = s + (alongX ? 'x' : 'z');
  if (!HORNS.has(key)) { const g = hornsGeometry(0.62 * s, 0.24 * s); if (!alongX) g.rotateY(Math.PI / 2); HORNS.set(key, g); }
  bag.add('plaster', HORNS.get(key).clone().translate(x, y, z));
};
/** wing: a block of storeys { rect, y, storeys, sh (storey height), windows ('nesw'), horns, roof walkable }. */
function wing(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys ?? 2, sh = el.sh ?? 3.6, H = n * sh, rand = rng(el.seed || 3);
  // rooms, doorways and light wells cut into the block (el.holes: { rect, h (the void's height above the floor; H or
  // more: open to the sky) }), and sunken floors (el.pits: { rect, depth })
  const holes = el.holes ?? [], pits = el.pits ?? [], R = [x0 + 0.05, z0 + 0.05, x1 - 0.05, z1 - 0.05];
  for (const r of subtractRects(el.rect, pits.map((p) => p.rect))) bag.add(G, box(r[0], y - 2, r[1], r[2], y, r[3]));
  for (const p of pits) { bag.add(G, box(p.rect[0], y - 2, p.rect[1], p.rect[2], y - p.depth, p.rect[3])); col.floor(p.rect, y - p.depth); }
  const solid = subtractRects(el.rect, holes.map((o) => o.rect));
  for (const r of solid) {
    bag.add(G, box(r[0], y, r[1], r[2], y + 1.2, r[3]));
    const q = [Math.max(r[0], R[0]), Math.max(r[1], R[1]), Math.min(r[2], R[2]), Math.min(r[3], R[3])];
    bag.add(P, box(q[0], y + 1.2, q[1], q[2], y + H, q[3]));
    col.rect(r, y - 2, y + H); col.floor(r, y + H);
  }
  for (const o of holes) {
    for (const r of subtractRects(o.rect, pits.map((p) => p.rect))) col.floor(r, y);
    if (o.h >= H) continue;
    // the storeys over a room or a doorway (less what rises higher through it: a light well)
    for (const r of subtractRects(o.rect, holes.filter((q) => q.h > o.h).map((q) => q.rect))) {
      const q = [Math.max(r[0], R[0]), Math.max(r[1], R[1]), Math.min(r[2], R[2]), Math.min(r[3], R[3])];
      bag.add(P, box(q[0], y + o.h, q[1], q[2], y + H, q[3])); col.rect(r, y + o.h, y + H); col.floor(r, y + H);
      if (o.lintel) bag.add('timber', box(r[0] - 0.02, y + o.h, r[1] - 0.02, r[2] + 0.02, y + o.h + 0.25, r[3] + 0.02));
    }
  }
  for (const o of holes) if (o.h >= H) {
    // a light well open to the sky: its parapet on the roof
    const [a, b, c, d] = o.rect, t = 0.25, py = y + H, ph = 0.8;
    for (const r of [[a - t, b - t, c + t, b], [a - t, d, c + t, d + t], [a - t, b, a, d], [c, b, c + t, d]]) { bag.add('plaster', box(r[0], py, r[1], r[2], py + ph, r[3])); col.rect(r, py, py + ph); }
  }
  // timber bands between storeys and the roof's edge: a ring round the outer faces
  for (let k = 1; k <= n; k++) {
    const m = k === n ? 'plaster' : 'timber', ya = y + k * sh - 0.3, yb = y + k * sh, e = 0.06;
    bag.add(m, box(x0 - e, ya, z0 - e, x1 + e, yb, z0 + 0.3)); bag.add(m, box(x0 - e, ya, z1 - 0.3, x1 + e, yb, z1 + e));
    bag.add(m, box(x0 - e, ya, z0 + 0.3, x0 + 0.3, yb, z1 - 0.3)); bag.add(m, box(x1 - 0.3, ya, z0 + 0.3, x1 + e, yb, z1 - 0.3));
  }
  if (!el.simple) {
    // windows in red frames on the outer faces
    const faces = el.windows ?? 'nesw';
    for (const f of faces) {
      const alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, m = Math.floor(L / 4.2);
      for (let k = 1; k < n; k++) for (let i = 0; i < m; i++) {
        if (rand() < 0.35) continue;
        const u = (alongX ? x0 : z0) + (i + 0.5) * L / m, yy = y + k * sh + 0.9;
        const r = f === 'n' ? [u - 0.6, z0 - 0.08, u + 0.6, z0 + 0.02] : f === 's' ? [u - 0.6, z1 - 0.02, u + 0.6, z1 + 0.08] : f === 'w' ? [x0 - 0.08, u - 0.6, x0 + 0.02, u + 0.6] : [x1 - 0.02, u - 0.6, x1 + 0.08, u + 0.6];
        bag.add(RED, box(r[0], yy - 0.1, r[1], r[2], yy + 1.5, r[3]));
        const d = 0.04, ri = alongX ? [r[0] + 0.15, r[1] - d, r[2] - 0.15, r[3] + d] : [r[0] - d, r[1] + 0.15, r[2] + d, r[3] - 0.15];
        bag.add('opening', box(ri[0], yy + 0.05, ri[1], ri[2], yy + 1.35, ri[3]));
      }
    }
    // the timber frame showing in the plaster (posts and rails), and a painted frieze of running spirals under the roof's edge
    for (const f of 'nesw') {
      const alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0, fp = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
      const at = (u0, u1, v0, v1, d) => { const p0 = fp + sg * 0.02, p1 = fp + sg * d; const q = alongX ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; return box(q[0], v0, q[1], q[2], v1, q[3]); };
      const mw = Math.max(1, Math.floor(L / 4.2));
      for (let i = 0; i <= mw; i++) {
        const u = Math.min(L - 0.2, Math.max(0.05, i * L / mw - 0.07)), w0 = a0 + u - 0.05, w1 = a0 + u + 0.19;
        // a post over a doorway cut in this face starts above the doorway
        const over = holes.filter((o) => (alongX ? (f === 'n' ? o.rect[1] <= z0 + 0.01 : o.rect[3] >= z1 - 0.01) && o.rect[0] < w1 && o.rect[2] > w0 : (f === 'w' ? o.rect[0] <= x0 + 0.01 : o.rect[2] >= x1 - 0.01) && o.rect[1] < w1 && o.rect[3] > w0));
        const ya = over.length ? y + Math.max(...over.map((o) => o.h)) + 0.25 : y + 1.2;
        if (ya < y + H - 0.6) bag.add('timber', at(u, u + 0.14, ya, y + H - 0.3, 0.05));
      }
      const m = Math.floor(L / 0.6);
      for (let i = 0; i < m; i++) bag.add(i % 3 === 0 ? 'egyptian_blue' : i % 3 === 1 ? RED : 'paint_ochre', at(i * L / m, (i + 1) * L / m - 0.04, y + H - 0.85, y + H - 0.35, 0.09));
    }
    // weathering of the outer faces: the damp and splash darkening the plaster over the gypsum base, plaster fallen from the rubble in patches, rain streaks under the roof's edge
    { const w2 = rng((el.seed || 3) * 977 + 11);
      for (const f of el.windows ?? 'nesw') {
        const alongX = f === 'n' || f === 's', L = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0, fp = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
        const at = (mat, u0, u1, v0, v1, d0, d1) => { const p0 = fp + sg * d0, p1 = fp + sg * d1; const q = alongX ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], v0, q[1], q[2], v1, q[3])); };
        const free = (u0, u1) => !holes.some((o) => (alongX ? (f === 'n' ? o.rect[1] <= z0 + 0.01 : o.rect[3] >= z1 - 0.01) && o.rect[0] < a0 + u1 && o.rect[2] > a0 + u0 : (f === 'w' ? o.rect[0] <= x0 + 0.01 : o.rect[2] >= x1 - 0.01) && o.rect[1] < a0 + u1 && o.rect[3] > a0 + u0));
        for (let u = 0.1; u < L - 0.5; u += 1.8 + w2() * 1.6) { const w = Math.min(L - 0.1 - u, 1.2 + w2() * 2.4); if (free(u, u + w)) at('plaster_damp', u, u + w, y + 1.22, y + 1.5 + w2() * 0.7, 0.0, 0.012); }
        for (let i = 0, m = Math.floor(L / 6); i < m; i++) { const u = 0.5 + w2() * (L - 1.5), w = 0.3 + w2() * 0.6, v = y + 1.4 + w2() * (H - 3.2); if (free(u, u + w)) at(w2() < 0.7 ? 'rubble' : 'plaster_white', u, u + w, v, v + 0.2 + w2() * 0.5, 0.02, w2() < 0.5 ? 0.036 : 0.05); }
        for (let u = 1 + w2() * 3; u < L - 0.6; u += 4 + w2() * 5) if (free(u, u + 0.3)) at('plaster_streak', u, u + 0.28, y + H - 2.4 - w2() * 1.2, y + H - 0.9, 0.03, 0.044);
      } }
    if (el.horns !== false) {
      for (let x = x0 + 2; x < x1 - 1; x += 4) { horns(bag, x, y + H, z0 + 0.4); horns(bag, x, y + H, z1 - 0.4); }
      for (let z = z0 + 2; z < z1 - 1; z += 4) { horns(bag, x0 + 0.4, y + H, z, 1, false); horns(bag, x1 - 0.4, y + H, z, 1, false); }
    }
  }
}

/** portico: a row of red columns { a, b, y, h, n, depth, side (+1/−1: which way the roof runs back) } with a lintel and a roof. */
function portico(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 3.4, n = el.n ?? 4, dp = el.depth ?? 3, s = el.side ?? 1;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * s, nz = ux * s, alongX0 = Math.abs(ux) > 0.5;
  bag.add(G, box(Math.min(ax, bx, ax + nx * dp, bx + nx * dp) - 0.3, y - 0.4, Math.min(az, bz, az + nz * dp, bz + nz * dp) - 0.3, Math.max(ax, bx, ax + nx * dp, bx + nx * dp) + 0.3, y, Math.max(az, bz, az + nz * dp, bz + nz * dp) + 0.3));
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; column(bag, col, ax + ux * L * t, az + uz * L * t, y, h); }
  const r = [Math.min(ax, bx, ax + nx * dp, bx + nx * dp), Math.min(az, bz, az + nz * dp, bz + nz * dp), Math.max(ax, bx, ax + nx * dp, bx + nx * dp), Math.max(az, bz, az + nz * dp, bz + nz * dp)];
  bag.add('timber', box(r[0] - 0.2, y + h + 0.25, r[1] - 0.2, r[2] + 0.2, y + h + 0.7, r[3] + 0.2));
  bag.add('plaster', box(r[0] - 0.3, y + h + 0.7, r[1] - 0.3, r[2] + 0.3, y + h + 1.0, r[3] + 0.3)); col.floor(r, y + h + 1.0);
  // a valance of dyed cloth hung from the beam between the columns on the open side
  { const vm = ['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre'], eo = alongX0 ? (nz > 0 ? az - 0.12 : az + 0.12) : (nx > 0 ? ax - 0.12 : ax + 0.12);
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, p0 = [ax + ux * L * t0, az + uz * L * t0], p1 = [ax + ux * L * t1, az + uz * L * t1], m = vm[(i + (el.seed ?? 0)) % 4], pad = 0.5 * L / n * 0.12;
      if (alongX0) bag.add(m, box(Math.min(p0[0], p1[0]) + pad, y + h - 0.55, eo - 0.02, Math.max(p0[0], p1[0]) - pad, y + h + 0.2, eo + 0.02)); else bag.add(m, box(eo - 0.02, y + h - 0.55, Math.min(p0[1], p1[1]) + pad, eo + 0.02, y + h + 0.2, Math.max(p0[1], p1[1]) - pad)); } }
  // horns of consecration on the roof's edge, one over each bay, on the side away from the wall
  const alongX = Math.abs(ux) > 0.5, edge = alongX ? (nz > 0 ? r[1] + 0.15 : r[3] - 0.15) : (nx > 0 ? r[0] + 0.15 : r[2] - 0.15);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, px = ax + ux * L * t, pz = az + uz * L * t; if (alongX) horns(bag, px, y + h + 1.0, edge, 0.8, true); else horns(bag, edge, y + h + 1.0, pz, 0.8, false); }
}

/** steps: a stepped area { rect, y0, n, rise, dir ('n'|'s'|'e'|'w': which way they climb) } of gypsum. */
function steps(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, n = el.n ?? 6, rise = el.rise ?? 0.3, y0 = el.y0 ?? 0;
  for (let i = 0; i < n; i++) {
    const f0 = i / n, f1 = (i + 1) / n, y = y0 + (i + 1) * rise;
    const r = el.dir === 'n' ? [x0, z1 - (z1 - z0) * f1, x1, z1 - (z1 - z0) * f0] : el.dir === 's' ? [x0, z0 + (z1 - z0) * f0, x1, z0 + (z1 - z0) * f1] : el.dir === 'e' ? [x0 + (x1 - x0) * f0, z0, x0 + (x1 - x0) * f1, z1] : [x1 - (x1 - x0) * f1, z0, x1 - (x1 - x0) * f0, z1];
    const full = el.dir === 'n' ? [x0, z0, x1, r[3]] : el.dir === 's' ? [x0, r[1], x1, z1] : el.dir === 'e' ? [r[0], z0, x1, z1] : [x0, z0, r[2], z1];
    bag.add(G, box(full[0], y0 - 0.5, full[1], full[2], y, full[3])); col.floor(r, y);
  }
}

/** minoan_house: { rect, seed, y }: two storeys of plaster over a gypsum base, red-framed windows, a flat roof. */
function house(el, ctx) {
  const rand = rng(el.seed || 1);
  wing({ rect: el.rect, y: el.y ?? 0, storeys: rand() < 0.6 ? 2 : 3, sh: 3.0, windows: 'nesw', horns: false, seed: el.seed, simple: el.simple }, ctx);
}

// ── frescoes (docs/settlements/knossos.md §4a) ──────────────────────────────────────────────
// compositions in profile, metres from the bottom centre of the panel: [{ mat, parts: [[outline, depth fraction]] }]
const tr = (pts, dx, dy, a = 0, s = 1, fx = 1) => { const c = Math.cos(a), n = Math.sin(a), q = pts.map(([u, v]) => [dx + (u * c - v * n) * s * fx, dy + (u * n + v * c) * s]); return fx < 0 ? q.reverse() : q; };
function bullParts(s, charge) {
  // a bull in the flying gallop (charge: the head lowered), facing −u
  const L = [];
  L.push([cap([0.6, 0.75], [1.05, 0.45], 0.12, 0.08), 0.5], [cap([1.05, 0.45], [1.4, 0.22], 0.07, 0.05), 0.5], [cap([-0.5, 0.72], [-0.62, 0.38], 0.11, 0.08), 0.5], [cap([-0.62, 0.38], [-0.46, 0.18], 0.07, 0.05), 0.5]);
  L.push([ell(0.05, 1.0, 0.95, 0.4, 14), 1], [ell(-0.5, 1.12, 0.45, 0.42, 12), 1]);
  L.push([cap([-0.75, 1.1], [-1.1, charge ? 0.8 : 1.0], 0.32, 0.22), 1], [cap([-1.1, charge ? 0.8 : 1.0], [-1.36, charge ? 0.5 : 0.82], 0.2, 0.12), 1]);
  for (const dz of [0, 0.1]) L.push([cap([-1.06 + dz, charge ? 0.95 : 1.15], [-1.12 + dz, charge ? 1.3 : 1.5], 0.05, 0.03), 0.9], [cap([-1.12 + dz, charge ? 1.3 : 1.5], [-1.38 + dz, charge ? 1.42 : 1.62], 0.03, 0.015), 0.9]);
  L.push([cap([-0.6, 0.78], [-1.12, 0.52], 0.12, 0.08), 1], [cap([-1.12, 0.52], [-1.42, 0.34], 0.07, 0.05), 1], [cap([0.66, 0.82], [0.78, 0.38], 0.13, 0.08), 1], [cap([0.78, 0.38], [0.98, 0.12], 0.07, 0.05), 1]);
  L.push([cap([0.95, 1.22], [1.32, 1.45], 0.04, 0.03), 0.8], [ell(1.36, 1.47, 0.07, 0.05, 6), 0.8]);
  return L.map(([p, f]) => [p.map(([u, v]) => [u * s, v * s]), f]);
}
export const FRESCO = {
  // the charging bull in an olive grove, in painted relief (the West Bastion of the North Entrance)
  bull_relief: (w, h) => [
    { mat: 'paint_ochre', parts: [[[[-w / 2, 0], [w / 2, 0], [w / 2, 0.22], [-w / 2, 0.22]], 0.12]] },
    { mat: 'bark_olive', parts: [[cap([-2.7, 0.2], [-2.6, 1.3], 0.16, 0.12), 0.5], [cap([-2.6, 1.3], [-3.1, 1.9], 0.08, 0.05), 0.4], [cap([-2.6, 1.3], [-2.1, 2.0], 0.08, 0.05), 0.4]] },
    { mat: 'fresco_green', parts: [[ell(-3.15, 2.0, 0.42, 0.28, 10), 0.35], [ell(-2.05, 2.1, 0.45, 0.3, 10), 0.35], [ell(-2.6, 2.35, 0.5, 0.3, 10), 0.35], [ell(-1.2, 1.4, 0.3, 0.42, 9), 0.3]] },
    { mat: 'paint_robe', parts: bullParts(1.15, true).map(([p, f]) => [tr(p, 0.6, 0.22), f]) },
    { mat: 'plaster_white', parts: [[ell(-1.1 * 1.15 + 0.6, 0.78 * 1.15 + 0.22, 0.04, 0.03, 6), 1.05]] },
  ],
  // the bull-leaping fresco: a youth vaulting over the bull's back, a girl at the horns, a girl behind with arms out;
  // the frame of painted stones round it
  bull_leaping: (w, h) => {
    const out = [], bands = ['egyptian_blue', 'paint_ochre', 'paint_minoan_red', 'plaster_white'];
    const b = 0.09;
    for (let i = 0; i < 12; i++) { const u0 = -w / 2 + i * w / 12, u1 = u0 + w / 12; out.push({ mat: bands[i % 4], parts: [[[[u0, h - b], [u1, h - b], [u1, h], [u0, h]], 0.6], [[[u0, 0], [u1, 0], [u1, b], [u0, b]], 0.6]] }); }
    for (let i = 0; i < 6; i++) { const v0 = b + i * (h - 2 * b) / 6, v1 = v0 + (h - 2 * b) / 6; for (const u of [-w / 2, w / 2 - b]) out.push({ mat: bands[(i + 1) % 4], parts: [[[[u, v0], [u + b, v0], [u + b, v1], [u, v1]], 0.6]] }); }
    out.push({ mat: 'paint_white', parts: bullParts(0.42, false).map(([p, f]) => [tr(p, 0.05, b + 0.02), f]) });
    out.push({ mat: 'paint_minoan_black', parts: [[ell(0.12, b + 0.47, 0.07, 0.04, 6), 1.2], [ell(-0.12, b + 0.44, 0.06, 0.035, 6), 1.2], [ell(0.25, b + 0.4, 0.05, 0.03, 6), 1.2]] });
    // the youth upside down over the back, red-skinned; the girls white-skinned
    out.push({ mat: 'paint_minoan_red', parts: [[cap([0.0, b + 0.5], [0.03, b + 0.66], 0.03, 0.026), 1.3], [ell(-0.01, b + 0.47, 0.026, 0.03, 7), 1.3], [cap([0.03, b + 0.66], [0.13, b + 0.74], 0.02, 0.014), 1.3], [cap([0.03, b + 0.66], [0.16, b + 0.69], 0.02, 0.014), 1.3], [cap([0.0, b + 0.6], [-0.06, b + 0.5], 0.014, 0.011), 1.3]] });
    out.push({ mat: 'plaster_white', parts: [[cap([-0.68, b + 0.05], [-0.66, b + 0.38], 0.04, 0.03), 1.3], [ell(-0.65, b + 0.43, 0.03, 0.035, 7), 1.3], [cap([-0.66, b + 0.34], [-0.55, b + 0.42], 0.015, 0.012), 1.3],
      [cap([0.66, b + 0.05], [0.66, b + 0.37], 0.04, 0.03), 1.3], [ell(0.665, b + 0.42, 0.03, 0.035, 7), 1.3], [cap([0.66, b + 0.33], [0.55, b + 0.4], 0.015, 0.012), 1.3], [cap([0.66, b + 0.33], [0.78, b + 0.4], 0.015, 0.012), 1.3]] });
    return out;
  },
  // couchant griffins among papyrus on a red ground, a wavy band below (the Throne Room, either side of the throne)
  griffin: (w, h) => {
    const out = [{ mat: 'paint_white', parts: [] }, { mat: 'paint_ochre', parts: [] }, { mat: 'egyptian_blue', parts: [] }];
    for (let i = 0; i < 10; i++) { const u0 = -w / 2 + i * w / 10; out[2].parts.push([[[u0, 0], [u0 + w / 10, 0], [u0 + w / 10, 0.1 + (i % 2) * 0.06], [u0, 0.16 - (i % 2) * 0.06]], 0.5]); }
    for (const x of [-0.85, -0.55, 0.8]) { out[0].parts.push([cap([x, 0.15], [x + 0.06, 0.95], 0.014, 0.01), 0.8], [poly([x + 0.06, 0.93], [x + 0.18, 1.05], [x + 0.06, 1.12], [x - 0.06, 1.05]), 0.8]); }
    const g = [[ell(0, 0.45, 0.5, 0.18, 12), 1], [ell(-0.35, 0.42, 0.22, 0.2, 10), 1], [cap([0.3, 0.32], [0.62, 0.28], 0.06, 0.05), 1], [cap([0.35, 0.55], [0.5, 0.86], 0.11, 0.08), 1], [ell(0.55, 0.93, 0.1, 0.08, 9), 1],
      [cap([0.62, 0.93], [0.74, 0.86], 0.04, 0.01), 1], [poly([-0.18, 0.56], [0.2, 0.58], [0.06, 0.76], [-0.3, 0.7]), 1.2], [cap([-0.55, 0.4], [-0.78, 0.62], 0.03, 0.02), 1]];
    for (const k of [0, 1, 2]) g.push([cap([0.5, 0.98], [0.42 - k * 0.06, 1.12 + k * 0.03], 0.025, 0.008), 1]);
    out[1].parts.push(...g.map(([p, f]) => [tr(p, 0.15, 0.12), f]));
    return out;
  },
  // dolphins and little fish swimming (the Queen's Megaron)
  dolphins: (w, h) => {
    const out = [{ mat: 'egyptian_blue', parts: [] }, { mat: 'paint_ochre', parts: [] }, { mat: 'paint_minoan_black', parts: [] }];
    const dolphin = (dx, dy, a, s, fx) => {
      const body = [[cap([-0.45, 0], [0.42, 0.02], 0.09, 0.06), 1], [cap([0.42, 0.02], [0.58, -0.02], 0.035, 0.018), 1], [poly([-0.05, 0.08], [0.12, 0.08], [-0.12, 0.24]), 1], [poly([-0.45, 0], [-0.62, 0.12], [-0.56, 0.0], [-0.62, -0.12]), 1], [poly([0.1, -0.06], [0.22, -0.06], [0.05, -0.17]), 1]];
      out[0].parts.push(...body.map(([p, f]) => [tr(p, dx, dy, a, s, fx), f]));
      out[1].parts.push([tr(cap([-0.35, -0.03], [0.4, -0.01], 0.022, 0.014), dx, dy, a, s, fx), 1.2]);
      out[2].parts.push([tr(ell(0.46, 0.03, 0.015, 0.015, 6), dx, dy, a, s, fx), 1.3]);
    };
    dolphin(-0.9, 0.75, 0.15, 1, 1); dolphin(0.6, 0.45, -0.1, 1.1, -1); dolphin(-0.2, 0.3, 0.05, 0.8, 1); dolphin(1.1, 0.95, 0.2, 0.7, -1); dolphin(-1.25, 0.32, -0.12, 0.65, -1);
    for (let i = 0; i < 9; i++) out[1].parts.push([tr(poly([-0.08, 0], [0.06, -0.02], [0.08, 0], [0.06, 0.02]), -1.4 + i * 0.35, 0.18 + ((i * 37) % 9) / 9, 0, 1, 1), 1]);
    return out;
  },
};
/** fresco: { kind, at: [x, z] (the panel's centre on the wall face), y0, face ('n' | 's' | 'e' | 'w': where it looks), w, h, d (relief), bg, flip }. */
function fresco(el, { bag }) {
  const o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[el.face], u = [o[1], 0, -o[0]], O = [o[0], 0, o[1]];
  const [x, z] = el.at, d = el.d ?? 0.008, off = 0.004, gth = 0.015;
  if (el.bg) bag.add(el.bg, box(...(() => { const a = [x - u[0] * el.w / 2 + O[0] * off, z - u[2] * el.w / 2 + O[2] * off], b = [x + u[0] * el.w / 2 + O[0] * (off + gth), z + u[2] * el.w / 2 + O[2] * (off + gth)]; return [Math.min(a[0], b[0]), el.y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), el.y0 + el.h, Math.max(a[1], b[1])]; })()));
  const p = [x + O[0] * (off + gth + 0.001), el.y0, z + O[2] * (off + gth + 0.001)];
  // each layer of the relief (each depth fraction) stands STEP further out than the one under it, beside its own
  // depth: at a fine relief (d 8 mm) layers 0.2 apart were under 2 mm apart and flickered where they overlap
  const comp = FRESCO[el.kind](el.w, el.h), STEP = 0.003;
  const ranks = [...new Set(comp.flatMap(({ parts }) => parts.map(([, f]) => f)))].sort((a, b) => a - b);
  for (const { mat, parts } of comp) if (parts.length) bag.add(mat, profile(parts.map(([q, f]) => [q, d * f + ranks.indexOf(f) * STEP]), { p, u, o: O, s: 1, d: 1, flip: !!el.flip }));
}

/** bastion: the raised portico of the North Entrance { rect, y, podium, front ('e' | 'w') }: a podium, a portico of two columns, the back wall with the charging bull. */
function bastion(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, py = y + el.podium, e = el.front === 'e', H = 3.6;
  bag.add(G, box(x0, y - 2, z0, x1, py, z1)); col.rect(el.rect, y - 2, py); col.floor(el.rect, py);
  const bx = e ? [x0, x0 + 0.6] : [x1 - 0.6, x1];
  bag.add(P, box(bx[0], py, z0, bx[1], py + H, z1)); col.rect([bx[0], z0, bx[1], z1], py, py + H);
  for (const [za, zb] of [[z0, z0 + 0.6], [z1 - 0.6, z1]]) { const r = e ? [x0, za, x0 + 2.4, zb] : [x1 - 2.4, za, x1, zb]; bag.add(P, box(r[0], py, r[1], r[2], py + H, r[3])); col.rect(r, py, py + H); }
  const cx = e ? x1 - 0.6 : x0 + 0.6;
  for (const z of [z0 + (z1 - z0) * 0.3, z0 + (z1 - z0) * 0.7]) column(bag, col, cx, z, py, H - 0.25, 0.3);
  bag.add('timber', box(x0 - 0.15, py + H, z0 - 0.15, x1 + 0.15, py + H + 0.35, z1 + 0.15));
  bag.add('plaster', box(x0 - 0.25, py + H + 0.35, z0 - 0.25, x1 + 0.25, py + H + 0.6, z1 + 0.25)); col.floor([x0, z0, x1, z1], py + H + 0.6);
  for (let z = z0 + 1.2; z < z1 - 0.8; z += 3.2) horns(bag, e ? x1 - 0.2 : x0 + 0.2, py + H + 0.6, z, 1, false);
  fresco({ kind: 'bull_relief', at: [e ? bx[1] : bx[0], (z0 + z1) / 2], face: e ? 'e' : 'w', y0: py + 0.15, w: (z1 - z0) - 1.4, h: H - 0.5, d: 0.16, bg: 'stucco_sky' }, ctx);
}

/** throne_room: { rect (the room), y, throne: [x, z], pit (the lustral basin's rect), pitDepth } — the gypsum throne against the north wall, the benches, the griffins either side on the red wall, the porphyry basin, the lustral basin's parapet, steps and column. */
function throneRoom(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, [tx, tz] = el.throne, pit = el.pit, pd = el.pitDepth ?? 1.0;
  // the red walls above the benches, a dark band at their foot
  bag.add('wall_red', box(x0 + 0.004, y + 0.5, z0 + 0.004, x1 - 0.004, y + 3.0, z0 + 0.02));
  bag.add('wall_red', box(x0 + 0.004, y + 0.5, z0 + 0.02, x0 + 0.02, y + 3.0, pit[1] - 0.02));
  // the throne: a pedestal, the seat hollowed for sitting, the tall back with its rounded, wavy crest
  bag.add(G, box(tx - 0.33, y, tz + 0.14, tx + 0.33, y + 0.42, tz + 0.62)); bag.add(G, box(tx - 0.36, y + 0.42, tz + 0.14, tx + 0.36, y + 0.5, tz + 0.66));
  const back = merge([prism([[-0.3, 0], [0.3, 0], [0.3, 0.75], [-0.3, 0.75]], 0.14, true), prism(ell(0, 0.86, 0.3, 0.42, 14), 0.14, true), prism([[-0.34, 0.62], [-0.22, 0.6], [-0.2, 0.84], [-0.35, 0.82]], 0.14, true), prism([[0.22, 0.6], [0.34, 0.62], [0.35, 0.82], [0.2, 0.84]], 0.14, true)]);
  bag.add(G, toPlane(back, [tx, y + 0.5, tz + 0.002], [1, 0, 0], [0, 0, 1]));
  col.rect([tx - 0.36, tz, tx + 0.36, tz + 0.66], y, y + 0.5);
  // the benches along the north wall either side of the throne, and along the west wall to the basin
  const bench = (r) => { bag.add(G, box(r[0], y, r[1], r[2], y + 0.42, r[3])); bag.add(G, box(r[0] - 0.02, y + 0.42, r[1], r[2] + 0.02, y + 0.48, r[3] + 0.03)); col.rect(r, y, y + 0.48); };
  bench([x0, z0, tx - 0.4, z0 + 0.45]); bench([tx + 0.4, z0, x1, z0 + 0.45]); bench([x0, z0 + 0.45, x0 + 0.45, pit[1] - 0.3]);
  // the griffins, couchant among papyrus, facing the throne from either side
  fresco({ kind: 'griffin', at: [(x0 + tx - 0.4) / 2, z0], face: 's', y0: y + 0.55, w: tx - 0.5 - x0, h: 1.35 }, ctx);
  fresco({ kind: 'griffin', at: [(tx + 0.4 + x1) / 2, z0], face: 's', y0: y + 0.55, w: x1 - tx - 0.5, h: 1.35, flip: true }, ctx);
  // the porphyry basin on the floor
  bag.add('porphyry', lathe([[0.001, 0], [0.32, 0.01], [0.42, 0.08], [0.45, 0.2], [0.4, 0.2], [0.36, 0.1], [0.001, 0.08]], 20, null, (x0 + x1) / 2 + 0.6, y, (z0 + pit[1]) / 2 + 0.3));
  // the lustral basin: a parapet on its north and east, a column on the corner carrying the edge of the light well
  const ph = 0.9, t = 0.3, [px0, pz0, px1, pz1] = pit;
  bag.add(G, box(px0, y - pd, pz0, px1 + t, y + ph, pz0 + t)); col.rect([px0, pz0, px1 + t, pz0 + t], y - pd, y + ph);
  bag.add(G, box(px1, y - pd, pz0 + t, px1 + t, y + ph, pz1 - 1.5)); col.rect([px1, pz0 + t, px1 + t, pz1 - 1.5], y - pd, y + ph);
  column(bag, col, px1 + t / 2, pz0 + t / 2, y + ph, 3.6 - ph - 0.25, 0.2);
  // its walls lined with gypsum slabs, the steps down from the east
  for (let i = 0; i < 4; i++) bag.add(G, box(px0 + 0.004, y - pd + 0.25 * i, pz1 - 0.02, px1, y - pd + 0.25 * i + 0.24, pz1 - 0.004));
}

/** lightwell_tiers: the colonnades of the Grand Staircase's light well { rect (the shaft), y, storeys, sh } on its north side, storey above storey. */
function lightwellTiers(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, n = el.storeys, sh = el.sh ?? 3.6, ld = 1.0;
  for (let k = 0; k < n; k++) {
    const yk = y + k * sh;
    if (k > 0) {
      // the landing of this storey along the north side, its balustrade between the columns
      bag.add(G, box(x0, yk - 0.3, z0, x1, yk, z0 + ld)); col.floor([x0, z0, x1, z0 + ld], yk);
      bag.add(P, box(x0, yk, z0 + ld - 0.22, x1, yk + 0.85, z0 + ld)); bag.add('timber', box(x0, yk + 0.85, z0 + ld - 0.25, x1, yk + 0.95, z0 + ld + 0.02));
    }
    const top = k + 1 < n ? y + (k + 1) * sh - 0.3 : y + n * sh - 0.3;
    for (const x of [x0 + (x1 - x0) * 0.3, x0 + (x1 - x0) * 0.7]) column(bag, col, x, z0 + ld - 0.11, k > 0 ? yk + 0.95 : yk, top - (k > 0 ? yk + 0.95 : yk) - 0.25, 0.2);
  }
  bag.add('timber', box(x0, y + n * sh - 0.3, z0 + ld - 0.4, x1, y + n * sh, z0 + ld + 0.05));
}

// ── the town, the stores, the approach (docs/settlements/knossos.md §4b) ───────────────────

/**
 * town_house: a house after the Town Mosaic plaques { rect, seed, y, front ('n' | 's' | 'e' | 'w': the street side),
 * storeys }: a base course of stone, plastered walls with timber beams at each floor whose round ends show in a row
 * on the front, a door under a timber lintel and narrow slits on the ground floor, the windows of the upper floors in
 * red frames divided into four panes, a flat roof with a low edge and, on many, a small room on the roof.
 */
function townHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed || 1), n = el.storeys ?? (rand() < 0.7 ? 2 : 3), sh = 2.9, H = n * sh;
  const f = el.front ?? 's', base = rand() < 0.4 ? G : 'rubble', e = 0;
  bag.add(base, box(x0, y - 1.5, z0, x1, y + 0.5, z1));
  bag.add(P, box(x0 + e, y + 0.5, z0 + e, x1 - e, y + H, z1 - e));
  col.rect(el.rect, y - 1.5, y + H); col.floor(el.rect, y + H);
  // a face: its run along u (from a0, length L), its plane at fp, its outward sign sg
  const face = (k) => {
    const alongX = k === 'n' || k === 's', L = alongX ? x1 - x0 : z1 - z0, a0 = alongX ? x0 : z0, fp = k === 'n' ? z0 : k === 's' ? z1 : k === 'w' ? x0 : x1, sg = k === 'n' || k === 'w' ? -1 : 1;
    const at = (mat, u0, u1, v0, v1, d0, d1) => { const p0 = fp + sg * d0, p1 = fp + sg * d1; const q = alongX ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], v0, q[1], q[2], v1, q[3])); };
    return { alongX, L, a0, fp, sg, at };
  };
  // the timber beams at each floor and under the roof's edge, round the four faces
  for (let k = 1; k <= n; k++) {
    const m = k === n ? 'plaster' : 'timber', ya = y + k * sh - (k === n ? 0.3 : 0.24), yb = y + k * sh;
    bag.add(m, box(x0 - 0.01, ya, z0 - 0.01, x1 + 0.01, yb, z0 + 0.3)); bag.add(m, box(x0 - 0.01, ya, z1 - 0.3, x1 + 0.01, yb, z1 + 0.01));
    bag.add(m, box(x0 - 0.01, ya, z0 + 0.3, x0 + 0.3, yb, z1 - 0.3)); bag.add(m, box(x1 - 0.3, ya, z0 + 0.3, x1 + 0.01, yb, z1 - 0.3));
  }
  const F = face(f), du = F.L * (0.3 + rand() * 0.4);
  // weathering: the damp and the splash of the lane darken the plaster's foot, highest on the street front; the
  // rain streaks down from the roof's edge at the corners (docs/settlements/knossos.md §4c)
  for (const k of 'nesw') { const W = face(k), dh = (k === f ? 0.5 : 0.3) + rand() * 0.25; W.at('plaster_damp', 0.02, W.L - 0.02, y + 0.5, y + 0.5 + dh, 0.0, 0.012); }
  for (const k of [f]) { const W = face(k); for (const u of [0.12, W.L - 0.42]) W.at('plaster_streak', u, u + 0.3, y + H - 1.6 - rand() * 0.8, y + H - 0.3, 0.0, 0.006); }
  // the round ends of the floor beams in a row on the front, just under each floor's band
  for (let k = 1; k < n; k++) for (let u = 0.45; u < F.L - 0.3; u += 0.62) {
    if (k === 1 && Math.abs(u - du) < 0.95) continue;
    const g = lathe([[0.001, 0], [0.085, 0], [0.085, 0.05], [0.001, 0.05]], 8);
    if (F.alongX) g.rotateX(F.sg * Math.PI / 2); else g.rotateZ(-F.sg * Math.PI / 2);
    const yy = y + k * sh - 0.36;
    bag.add('timber', F.alongX ? g.translate(F.a0 + u, yy, F.fp - F.sg * 0.01) : g.translate(F.fp - F.sg * 0.01, yy, F.a0 + u));
  }
  // the door, a little off the middle, under its lintel; a step of stone before it
  F.at('timber', du - 0.62, du + 0.62, y + 0.5, y + 2.45, -0.06, 0.06);
  F.at('opening', du - 0.48, du + 0.48, y + 0.5, y + 2.25, 0.06, 0.08);
  F.at('timber', du - 0.75, du + 0.75, y + 2.25, y + 2.5, 0.06, 0.1);
  F.at(G, du - 0.7, du + 0.7, y, y + 0.5, -0.05, 0.45);
  // narrow slits on the ground floor
  for (const u of [du - 1.8, du + 1.8]) if (u > 0.6 && u < F.L - 0.6 && rand() < 0.7) { F.at(G, u - 0.2, u + 0.2, y + 1.2, y + 2.0, -0.06, 0.04); F.at('opening', u - 0.08, u + 0.08, y + 1.3, y + 1.9, 0.04, 0.06); }
  // the upper windows: red frames, four panes; on the front and on one side
  const side = f === 'n' || f === 's' ? (rand() < 0.5 ? 'e' : 'w') : (rand() < 0.5 ? 'n' : 's');
  for (const k of [f, side]) {
    const W = face(k), m = Math.max(1, Math.floor(W.L / 2.6));
    for (let fl = 1; fl < n; fl++) for (let i = 0; i < m; i++) {
      if (k !== f && rand() < 0.5) continue;
      const u = (i + 0.5) * W.L / m, yy = y + fl * sh + 0.75;
      W.at(RED, u - 0.55, u + 0.55, yy, yy + 1.25, -0.06, 0.07);
      W.at('opening', u - 0.42, u + 0.42, yy + 0.12, yy + 1.13, 0.07, 0.09);
      W.at(RED, u - 0.045, u + 0.045, yy + 0.12, yy + 1.13, 0.09, 0.11);
      W.at(RED, u - 0.42, u + 0.42, yy + 0.6, yy + 0.68, 0.09, 0.11);
    }
  }
  // the roof: a low edge all round, and on many houses a small room toward the back
  if (rand() < 0.5) {
    const back = { n: 's', s: 'n', e: 'w', w: 'e' }[f], w = Math.min(3.4, (x1 - x0) * 0.45), d = Math.min(3.0, (z1 - z0) * 0.45);
    const rx0 = back === 'w' ? x0 + 0.3 : back === 'e' ? x1 - 0.3 - w : x0 + (x1 - x0 - w) / 2, rz0 = back === 'n' ? z0 + 0.3 : back === 's' ? z1 - 0.3 - d : z0 + (z1 - z0 - d) / 2;
    bag.add(P, box(rx0, y + H - 0.05, rz0, rx0 + w, y + H + 2.2, rz0 + d));
    bag.add('timber', box(rx0 - 0.08, y + H + 2.2, rz0 - 0.08, rx0 + w + 0.08, y + H + 2.45, rz0 + d + 0.08));
    // its doorway toward the street side, dark
    const [ox, oz] = f === 'n' ? [rx0 + w / 2, rz0] : f === 's' ? [rx0 + w / 2, rz0 + d] : f === 'w' ? [rx0, rz0 + d / 2] : [rx0 + w, rz0 + d / 2];
    const alongX = f === 'n' || f === 's', sg = f === 'n' || f === 'w' ? -1 : 1;
    bag.add('opening', alongX ? box(ox - 0.4, y + H, Math.min(oz, oz + sg * 0.03), ox + 0.4, y + H + 1.8, Math.max(oz, oz + sg * 0.03)) : box(Math.min(ox, ox + sg * 0.03), y + H, oz - 0.4, Math.max(ox, ox + sg * 0.03), y + H + 1.8, oz + 0.4));
    col.rect([rx0, rz0, rx0 + w, rz0 + d], y + H, y + H + 2.45);
  }
}

/**
 * pithos: a great storage jar { at [x, z], y, s (scale: 1 ≈ 1.6 m high), rot }: the narrow foot, the swelling body,
 * the short neck and the thick rim; raised bands with the rope pattern round the body, rows of small handles.
 */
const PITHOS = new Map();
function pithosGeometry(s) {
  const P0 = [[0.001, 0], [0.24, 0], [0.27, 0.06], [0.4, 0.4], [0.47, 0.8], [0.47, 1.05], [0.42, 1.3], [0.32, 1.47], [0.3, 1.5], [0.36, 1.53], [0.37, 1.6], [0.3, 1.62], [0.27, 1.56], [0.001, 1.5]];
  const parts = [lathe(P0.map(([r, h]) => [r * s, h * s]), 18)];
  for (const [h, r] of [[0.42, 0.405], [0.62, 0.445], [0.86, 0.475], [1.08, 0.465], [1.3, 0.425]]) {
    // a band, and the rope's twists round it as a ring of little bosses
    parts.push(lathe([[r * s, (h - 0.03) * s], [(r + 0.025) * s, (h - 0.02) * s], [(r + 0.025) * s, (h + 0.02) * s], [r * s, (h + 0.03) * s]], 18));
  }
  for (const h of [0.95, 1.36]) for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) * Math.PI / 2 + (h > 1 ? Math.PI / 4 : 0), r = (h > 1 ? 0.41 : 0.47) * s;
    const g = box(-0.05 * s, (h - 0.06) * s, -0.02 * s, 0.05 * s, (h + 0.06) * s, 0.09 * s); g.rotateY(-a + Math.PI / 2); g.translate(Math.cos(a) * r, 0, Math.sin(a) * r); parts.push(g);
  }
  return merge(parts);
}
function pithos(el, { bag, col }) {
  const s = el.s ?? 1, k = String(s);
  if (!PITHOS.has(k)) PITHOS.set(k, pithosGeometry(s));
  const g = PITHOS.get(k).clone(); if (el.rot) g.rotateY(el.rot);
  bag.add('terracotta', g.translate(el.at[0], el.y ?? 0, el.at[1]));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.27 * s, 0], [0.27 * s, 0.02], [0.001, 0.02]], 12, null, el.at[0], (el.y ?? 0) + 1.52 * s, el.at[1]));
  col.circle(el.at[0], el.at[1], 0.47 * s, el.y ?? 0, (el.y ?? 0) + 1.6 * s);
}

/**
 * magazines: the stores along the Long Corridor { corridor [x0, z0, x1, z1] (runs along z), x0 (the magazines' far
 * end, west of the corridor), z0, z1, n, y }: the pithoi in a row down each magazine, the stone-lined cists sunk in
 * the floor under their gypsum lids, a lamp in the corridor. The rooms themselves are holes cut in the wing (plan.js).
 */
function magazines(el, ctx) {
  const { bag } = ctx, y = el.y ?? 0, [cx0] = el.corridor, pitch = (el.z1 - el.z0) / el.n, mw = pitch - 1.6, rand = rng(1700);
  for (let i = 0; i < el.n; i++) {
    const za = el.z0 + i * pitch + 0.8, zm = za + mw / 2;
    // the cists down the middle of the floor, the pithoi along the north wall
    for (let x = cx0 - 1.2; x > el.x0 + 0.8; x -= 1.15) {
      if (rand() < 0.12) continue;
      pithos({ at: [x - 0.1, za + 0.55], y, s: 0.92 + rand() * 0.14, rot: rand() * 6.28 }, ctx);
    }
    for (let x = cx0 - 1.6; x > el.x0 + 1.2; x -= 2.1) bag.add(G, box(x - 0.85, y - 0.02, zm + 0.05, x + 0.85, y + 0.03, zm + 0.75));
  }
  const [a, b, c, d] = el.corridor;
  for (let z = b + 6; z < d - 3; z += 14) GENERIC_LAMP(ctx, [(a + c) / 2, y + 2.6, z]);
}
const GENERIC_LAMP = ({ lights }, at) => lights.push({ at, color: '#ffb46b', intensity: 4, distance: 10 });

/** royal_road: the paved road { pts: [[x, y, z]…] (its centre line), w }: a bed of packed lime over stone, its kerbs, and down the middle the raised strip of oblong slabs. */
function royalRoad(el, { bag, col }) {
  const w = (el.w ?? 3.8) / 2, cw = 0.7, pts = el.pts;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const hexa = (mat, o0, o1, t0, t1, top, bot) => {
      const Q = (t, o, dy) => [ax + ux * L * t + nx * o, ay + (by - ay) * t + dy, az + uz * L * t + nz * o];
      const v = [Q(t0, o0, bot), Q(t1, o0, bot), Q(t1, o1, bot), Q(t0, o1, bot), Q(t0, o0, top), Q(t1, o0, top), Q(t1, o1, top), Q(t0, o1, top)];
      const t = [], q = (p, r, s2, u) => t.push(...v[p], ...v[r], ...v[s2], ...v[p], ...v[s2], ...v[u]);
      q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
      bag.add(mat, fromTriangles(orientOutward(t)));
    };
    hexa('lime_plaster', -w + 0.25, w - 0.25, 0, 1, 0.1, -0.4);                                       // the packed bed
    hexa(G, -w, -w + 0.25, 0, 1, 0.16, -0.4); hexa(G, w - 0.25, w, 0, 1, 0.16, -0.4);                 // the kerbs
    // the slabs of the middle strip, each a little different in length
    let t = 0;
    while (t < 1) { const l = (0.9 + ((i * 7 + t * 97) % 1) * 0.5) / L, t1 = Math.min(1, t + l); if (t1 - t > 0.2 / L) hexa('flagstone', -cw, cw, t + 0.02 / L, t1 - 0.02 / L, 0.15, 0.05); t = t1; }
    const r = [Math.min(ax, bx) - Math.abs(nx) * w, Math.min(az, bz) - Math.abs(nz) * w, Math.max(ax, bx) + Math.abs(nx) * w, Math.max(az, bz) + Math.abs(nz) * w];
    if (Math.abs(by - ay) < 0.02) col.floor(r, ay + 0.12); else col.ramp(r, Math.min(ay, by) + 0.12, Math.max(ay, by) + 0.12, Math.abs(ux) > 0.5 ? ((by > ay) === (ux > 0) ? 'e' : 'w') : ((by > ay) === (uz > 0) ? 's' : 'n'));
  }
}
export { column as minoanColumn, fresco as minoanFresco, pithos as minoanPithos, horns as minoanHorns };
registerStyle('minoan', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, wing, portico, steps, minoan_house: house, fresco, bastion, throne_room: throneRoom, lightwell_tiers: lightwellTiers, town_house: townHouse, pithos, magazines, royal_road: royalRoad },
  objects: {},
});
