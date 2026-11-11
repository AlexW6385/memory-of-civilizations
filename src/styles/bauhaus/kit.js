// Bauhaus style kit: a builder wrapper (boxes with colliders), single-sided glass, walls with openings, slabs with holes,
// scissor stairs, guard rails and the furniture of the school's workshops (docs/settlements/bauhaus-dessau.md §6).
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;

/** The builder context with the short forms used everywhere. */
export class S {
  constructor(ctx) { this.bag = ctx.bag; this.col = ctx.col; this.lights = ctx.lights; }
  /** A box (no collider). */
  b(mat, x0, y0, z0, x1, y1, z1) {
    if (x1 - x0 < 1e-4 || z1 - z0 < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
  }
  /** A solid box: drawn and blocking. */
  s(mat, x0, y0, z0, x1, y1, z1) { this.b(mat, x0, y0, z0, x1, y1, z1); this.col.rect([x0, z0, x1, z1], y0, y1); }
  /** A blocking volume only. */
  k(x0, y0, z0, x1, y1, z1) { this.col.rect([x0, z0, x1, z1], y0, y1); }
  fl(rect, y) { this.col.floor(rect, y); }
  cyl(mat, x, y, z, r, h, seg = 10) { this.bag.add(mat, lathe([[r, 0], [r, h], [0.001, h]], seg, null, x, y, z)); }
  rod(mat, a, b, r, seg = 5) { this.bag.add(mat, rod(a, b, r, seg)); }
  lathe(mat, prof, x, y, z, seg = 12) { this.bag.add(mat, lathe(prof, seg, null, x, y, z)); }
  light(x, y, z, color = '#ffe2b0', intensity = 2.2, distance = 8) { this.lights.push({ at: [x, y, z], color, intensity, distance }); }
  /** A single-sided pane in a vertical plane (x = const or z = const), facing the normal (nx or nz sign). */
  pane(mat, o) {
    const { x, z, u0, u1, y0, y1, n } = o, out = [];
    // along x at constant z, or along z at constant x
    const P = o.alongX ? (u, y) => [u, y, z] : (u, y) => [x, y, u];
    const a = P(u0, y0), b = P(u1, y0), c = P(u1, y1), d = P(u0, y1);
    const nrm = o.alongX ? [0, 0, n] : [n, 0, 0];
    const cr = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    // fromTriangles' normal is (c−b)×(a−b); the winding is chosen so that it points along n
    const nn = [(c[1] - b[1]) * (a[2] - b[2]) - (c[2] - b[2]) * (a[1] - b[1]), (c[2] - b[2]) * (a[0] - b[0]) - (c[0] - b[0]) * (a[2] - b[2]), (c[0] - b[0]) * (a[1] - b[1]) - (c[1] - b[1]) * (a[0] - b[0])];
    void cr;
    const flip = nn[0] * nrm[0] + nn[1] * nrm[1] + nn[2] * nrm[2] < 0;
    if (!flip) out.push(...a, ...b, ...c, ...a, ...c, ...d); else out.push(...a, ...c, ...b, ...a, ...d, ...c);
    this.bag.add(mat, fromTriangles(out));
  }
}

/**
 * A wall on a straight axis-aligned line a→b, thickness th from y0 to y1, solid with openings:
 * { a, b, th, y0, y1, mat, openings: [{ u0, u1, y0, y1, kind: 'door' | 'win' | 'gap' }], out: [nx, nz] (the outer face's direction, for the glass),
 *   frame: material of window frames (default steel_grey), glass: material (default glass_outer), inner: material of the inner face (default none) }
 * Doors and gaps are open; windows carry a glass pane and a frame. Colliders follow the solid pieces.
 */
export function wall(sk, o) {
  const [ax, az] = o.a, [bx, bz] = o.b, alongX = Math.abs(bz - az) < 1e-6, th = o.th ?? 0.3;
  const u0 = alongX ? Math.min(ax, bx) : Math.min(az, bz), u1 = alongX ? Math.max(ax, bx) : Math.max(az, bz), c = alongX ? az : ax;
  const R = (a, y0, bb, y1) => {          // a rectangle of the wall: u from a to bb, y0..y1
    if (bb - a < 1e-3 || y1 - y0 < 1e-3) return;
    const r = alongX ? [a, c - th / 2, bb, c + th / 2] : [c - th / 2, a, c + th / 2, bb];
    sk.s(o.mat, r[0], y0, r[1], r[2], y1, r[3]);
  };
  const ops = (o.openings || []).map((p) => ({ ...p })).sort((p, q) => p.u0 - q.u0);
  const cuts = [...new Set([u0, u1, ...ops.flatMap((p) => [p.u0, p.u1])])].filter((v) => v >= u0 - 1e-6 && v <= u1 + 1e-6).sort((p, q) => p - q);
  for (let i = 0; i + 1 < cuts.length; i++) {
    const a = cuts[i], bb = cuts[i + 1], m = (a + bb) / 2, op = ops.filter((p) => m > p.u0 && m < p.u1);
    if (!op.length) { R(a, o.y0, bb, o.y1); continue; }
    // a span within one or more openings: the solid below the lowest sill and above the highest head
    const lo = Math.max(...op.map((p) => p.y0 ?? o.y0)), hi = Math.min(...op.map((p) => p.y1));
    R(a, o.y0, bb, lo); R(a, hi, bb, o.y1);
  }
  const n = o.out ?? (alongX ? [0, 1] : [1, 0]);
  for (const p of ops) {
    if (p.kind !== 'win') continue;
    const wy0 = p.y0, wy1 = p.y1, face = c + (alongX ? n[1] : n[0]) * (th / 2 - 0.1), nsg = alongX ? n[1] : n[0];
    sk.pane(o.glass ?? 'glass_outer', { alongX, x: face, z: face, u0: p.u0, u1: p.u1, y0: wy0, y1: wy1, n: nsg });
    // the frame: reveal bars on the outer face, a mullion for wide lights
    const fr = o.frame ?? 'steel_grey', t = 0.05, f0 = c + (alongX ? n[1] : n[0]) * (th / 2) - (nsg > 0 ? 0.06 : 0), f1 = f0 + 0.06;
    const bar = (a, y0, bb, y1) => { const r = alongX ? [a, Math.min(f0, f1), bb, Math.max(f0, f1)] : [Math.min(f0, f1), a, Math.max(f0, f1), bb]; sk.b(fr, r[0], y0, r[1], r[2], y1, r[3]); };
    bar(p.u0, wy0, p.u1, wy0 + t); bar(p.u0, wy1 - t, p.u1, wy1); bar(p.u0, wy0, p.u0 + t, wy1); bar(p.u1 - t, wy0, p.u1, wy1);
    const w = p.u1 - p.u0, nm = Math.max(0, Math.round(w / 1.4) - 1);
    for (let k = 1; k <= nm; k++) { const u = p.u0 + w * k / (nm + 1); bar(u - t / 2, wy0, u + t / 2, wy1); }
    if (wy1 - wy0 > 1.6) bar(p.u0, (wy0 + wy1) / 2 - t / 2, p.u1, (wy0 + wy1) / 2 + t / 2);
  }
}

/** A floor slab y−th..y over rect with holes, its top surface walkable; `top` a thin layer of the floor material. */
export function slab(sk, rect, y, holes = [], o = {}) {
  const th = o.th ?? 0.3, mat = o.mat ?? 'concrete_light', top = o.top;
  for (const r of subtractRects(rect, holes)) {
    sk.b(mat, r[0], y - th, r[1], r[2], y, r[3]);
    if (top) sk.b(top, r[0], y, r[1], r[2], y + 0.025, r[3]);
    sk.fl(r, y + (top ? 0.025 : 0));
    sk.k(r[0], y - th, r[1], r[2], y, r[3]);
  }
}

/** A guard rail along a line at floor level y: posts, a top rail, a mid rail; blocking up to 1 m. */
export function rail(sk, a, b, y, mat = 'steel_chrome', h = 1.0) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 1.2));
  for (let i = 0; i <= n; i++) { const p = [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]; sk.rod(mat, [p[0], y, p[1]], [p[0], y + h, p[1]], 0.02, 4); }
  for (const f of [h, h * 0.5]) sk.rod(mat, [a[0], y + f, a[1]], [b[0], y + f, b[1]], 0.018, 4);
  sk.col.segment(a, b, 0.1, y, y + h);
}

/**
 * A scissor stair between floors ys[0..], in a well of two lanes side by side (x ranges l1 and l2, z from za to zb):
 * flight 1 (lane 1) climbs north from the south end, flight 2 (lane 2) climbs south from the north end, and so on.
 * Returns the holes each floor's slab needs: holes[k] is the hole in the slab of floor k (k ≥ 1).
 */
export function scissor(sk, { l1, l2, za, zb, ys, mat = 'concrete_light', rails = true }) {
  const holes = [];
  for (let k = 0; k + 1 < ys.length; k++) {
    const lane = k % 2 === 0 ? l1 : l2, up = k % 2 === 0 ? 'n' : 's';
    const y0 = ys[k], y1 = ys[k + 1], rise = y1 - y0, n = Math.max(1, Math.round(rise / 0.175)), tr = (zb - za) / n;
    for (let i = 0; i < n; i++) {
      const t = y0 + rise * (i + 1) / n;
      const r = up === 'n' ? [lane[0], zb - (i + 1) * tr, lane[1], zb - i * tr] : [lane[0], za + i * tr, lane[1], za + (i + 1) * tr];
      sk.b(mat, r[0], y0 - 0.02, r[1], r[2], t, r[3]);
    }
    sk.col.ramp([lane[0], za, lane[1], zb], y0, y1, up);
    // the stringer's handrail on the open side
    const hx = lane === l1 ? lane[0] + 0.03 : lane[1] - 0.03;
    sk.rod('steel_chrome', up === 'n' ? [hx, y0 + 0.95, zb] : [hx, y0 + 0.95, za], up === 'n' ? [hx, y1 + 0.95, za] : [hx, y1 + 0.95, zb], 0.025, 5);
    holes[k + 1] = [lane[0], za, lane[1], zb];
    // the guards round the hole at floor k+1: its west side, and the end away from the arrival
    if (rails) {
      const far = up === 'n' ? zb : za;
      if (lane === l1) { rail(sk, [lane[0], za], [lane[0], zb], y1); rail(sk, [lane[0], far], [lane[1], far], y1); }
      else { rail(sk, [lane[0], za], [lane[0], zb], y1); rail(sk, [lane[0], far], [lane[1], far], y1); }
    }
  }
  return holes;
}

// ── furniture ────────────────────────────────────────────────────────────────────────────────────────────
/** Breuer's chair (B5-like): a tubular-steel frame, a wooden seat and back; facing direction `dir` (0: −z, 1: +x, 2: +z, 3: −x). */
export function chair(sk, x, y, z, dir = 0, seat = 'wood_painted', frame = 'steel_chrome') {
  const c = Math.cos(dir * Math.PI / 2), s = Math.sin(dir * Math.PI / 2);
  // local (u right, v forward = −z at dir 0) → world
  const W = (u, v, h) => [x + u * c + v * s, y + h, z - v * c + u * s];
  const wb = (u0, u1, v0, v1, h0, h1, m) => { const p = W(u0, v0, h0), q = W(u1, v1, h1); sk.b(m, Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[1], q[1]), Math.max(p[2], q[2])); };
  wb(-0.21, 0.21, -0.2, 0.22, 0.44, 0.47, seat);
  wb(-0.21, 0.21, -0.23, -0.2, 0.5, 0.82, seat);
  for (const u of [-0.19, 0.19]) {
    sk.rod(frame, W(u, 0.2, 0.0), W(u, 0.2, 0.45), 0.01, 4); sk.rod(frame, W(u, 0.2, 0.45), W(u, -0.2, 0.45), 0.01, 4);
    sk.rod(frame, W(u, -0.2, 0.45), W(u, -0.22, 0.8), 0.01, 4); sk.rod(frame, W(u, -0.2, 0.0), W(u, -0.2, 0.45), 0.01, 4);
    sk.rod(frame, W(u, 0.2, 0.0), W(u, -0.2, 0.0), 0.01, 4);
  }
}
/** A Rowac stool: a round plywood seat on three steel legs. */
export function stool(sk, x, y, z, h = 0.46) {
  sk.lathe('wood_painted', [[0.001, h], [0.17, h], [0.17, h + 0.03], [0.001, h + 0.03]], x, y, z, 10);
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + 0.4; sk.rod('steel_chrome', [x + Math.cos(a) * 0.17, y + h, z + Math.sin(a) * 0.17], [x + Math.cos(a) * 0.24, y, z + Math.sin(a) * 0.24], 0.011, 4); }
}
/** A table: a top at h on four legs; solid for walking round unless `walk`. */
export function table(sk, x0, z0, x1, z1, y, h = 0.74, top = 'wood_painted', leg = 'steel_chrome', solid = true) {
  sk.b(top, x0, y + h - 0.04, z0, x1, y + h, z1);
  for (const [px, pz] of [[x0 + 0.05, z0 + 0.05], [x1 - 0.05, z0 + 0.05], [x0 + 0.05, z1 - 0.05], [x1 - 0.05, z1 - 0.05]]) sk.rod(leg, [px, y, pz], [px, y + h - 0.04, pz], 0.014, 4);
  if (solid) sk.k(x0, y, z0, x1, y + h, z1);
}
/** A pendant lamp (metal-workshop type: an opal globe on a tube) hung from the ceiling at cy, with a light. */
export function pendant(sk, x, cy, z, drop = 0.9, light = true) {
  sk.rod('steel_chrome', [x, cy, z], [x, cy - drop, z], 0.008, 4);
  sk.lathe('lamp_white', [[0.001, 0], [0.1, 0.07], [0.14, 0.2], [0.1, 0.33], [0.001, 0.37]], x, cy - drop - 0.35, z, 10);
  if (light) sk.light(x, cy - drop - 0.2, z, '#fff0d0', 2.2, 9);
}
/** A workbench: a thick top on trestles, a vice at one corner. */
export function bench(sk, x0, z0, x1, z1, y, vice = true) {
  sk.b('wood_ochre', x0, y + 0.82, z0, x1, y + 0.9, z1);
  for (const px of [x0 + 0.15, x1 - 0.15]) { sk.b('timber', px - 0.05, y, z0 + 0.1, px + 0.05, y + 0.82, z1 - 0.1); }
  sk.b('timber', x0 + 0.15, y + 0.3, (z0 + z1) / 2 - 0.03, x1 - 0.15, y + 0.36, (z0 + z1) / 2 + 0.03);
  if (vice) { sk.b('iron', x0 + 0.1, y + 0.9, z0 + 0.1, x0 + 0.3, y + 1.0, z0 + 0.3); sk.rod('iron', [x0 + 0.2, y + 0.95, z0 + 0.3], [x0 + 0.2, y + 0.95, z0 + 0.55], 0.012, 4); }
  sk.k(x0, y, z0, x1, y + 0.9, z1);
}
/** A floor loom (weaving workshop): frame, beams, warp, a woven strip in a colour. Faces +z (the weaver sits at the +z side). */
export function loom(sk, x, y, z, cloth = 'cloth_red') {
  for (const px of [x - 0.55, x + 0.55]) for (const pz of [z - 0.45, z + 0.45]) sk.b('timber', px - 0.04, y, pz - 0.04, px + 0.04, y + 1.7, pz + 0.04);
  for (const pz of [z - 0.45, z + 0.45]) sk.b('timber', x - 0.6, y + 1.6, pz - 0.04, x + 0.6, y + 1.7, pz + 0.04);
  for (const px of [x - 0.55, x + 0.55]) { sk.b('timber', px - 0.03, y + 1.6, z - 0.45, px + 0.03, y + 1.66, z + 0.45); sk.b('timber', px - 0.03, y + 0.55, z - 0.45, px + 0.03, y + 0.6, z + 0.45); }
  sk.rod('timber', [x - 0.55, y + 1.25, z - 0.45], [x + 0.55, y + 1.25, z - 0.45], 0.035, 5);        // the warp beam
  sk.rod('timber', [x - 0.55, y + 1.0, z + 0.4], [x + 0.55, y + 1.0, z + 0.4], 0.035, 5);             // the cloth beam
  sk.b('cloth_white', x - 0.48, y + 1.0, z - 0.43, x + 0.48, y + 1.25, z - 0.4);                       // the warp
  sk.b('cloth_white', x - 0.48, y + 1.0, z - 0.43, x + 0.48, y + 1.01, z + 0.4);
  sk.b(cloth, x - 0.48, y + 1.01, z + 0.0, x + 0.48, y + 1.03, z + 0.4);                               // the woven cloth
  sk.b('wood_painted', x - 0.4, y + 0.42, z + 0.5, x + 0.4, y + 0.46, z + 0.8);                        // the bench
  sk.k(x - 0.65, y, z - 0.5, x + 0.65, y + 1.7, z + 0.55);
}
/** A lathe or bench machine (metal and wood workshops): a bed, headstock and tailstock, a motor. */
export function machine(sk, x, y, z, w = 1.6, mat = 'steel_grey') {
  sk.b('iron', x - w / 2, y, z - 0.25, x + w / 2, y + 0.8, z + 0.25);
  sk.b(mat, x - w / 2 - 0.05, y + 0.8, z - 0.22, x + w / 2 + 0.05, y + 0.9, z + 0.22);
  sk.b(mat, x - w / 2, y + 0.9, z - 0.2, x - w / 2 + 0.4, y + 1.2, z + 0.2);
  sk.b(mat, x + w / 2 - 0.3, y + 0.9, z - 0.12, x + w / 2, y + 1.1, z + 0.12);
  sk.rod('steel_chrome', [x - w / 2 + 0.4, y + 1.05, z], [x + w / 2 - 0.3, y + 1.05, z], 0.03, 6);
  sk.b('car_blue', x - w / 2 + 0.05, y + 0.2, z + 0.25, x - w / 2 + 0.35, y + 0.5, z + 0.4);
  sk.k(x - w / 2 - 0.05, y, z - 0.3, x + w / 2 + 0.05, y + 1.2, z + 0.4);
}
/** A circular saw bench of the carpentry workshop. */
export function saw(sk, x, y, z) {
  sk.b('iron', x - 0.6, y, z - 0.45, x + 0.6, y + 0.85, z + 0.45); sk.b('steel_grey', x - 0.7, y + 0.85, z - 0.5, x + 0.7, y + 0.9, z + 0.5);
  sk.lathe('steel_chrome', [[0.001, 0], [0.28, 0], [0.28, 0.01], [0.001, 0.01]], x, y + 0.9, z, 16); sk.b('car_red', x - 0.05, y + 0.9, z - 0.35, x + 0.05, y + 1.05, z - 0.25);
  sk.k(x - 0.7, y, z - 0.5, x + 0.7, y + 0.9, z + 0.5);
}
/** A stack of boards. */
export function boards(sk, x0, z0, x1, z1, y, n = 8) {
  for (let i = 0; i < n; i++) sk.b(i % 2 ? 'wood_ochre' : 'timber', x0, y + 0.1 + i * 0.07, z0, x1, y + 0.16 + i * 0.07, z1);
  sk.b('timber', x0 + 0.1, y, z0, x0 + 0.2, y + 0.1, z1); sk.b('timber', x1 - 0.2, y, z0, x1 - 0.1, y + 0.1, z1);
  sk.k(x0, y, z0, x1, y + 0.1 + n * 0.07, z1);
}
/** A desk with a typewriter or a drafting board and a chair. */
export function desk(sk, x, y, z, rot = 0, kind = 'office') {
  const c = Math.cos(rot), s = Math.sin(rot), W = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const bx = (u0, u1, v0, v1, h0, h1, m) => { const p = W(u0, v0), q = W(u1, v1); sk.b(m, Math.min(p[0], q[0]), y + h0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + h1, Math.max(p[1], q[1])); };
  bx(-0.75, 0.75, -0.4, 0.4, 0.72, 0.76, 'wood_ochre');
  bx(-0.72, -0.5, -0.38, 0.38, 0, 0.72, 'wood_painted'); bx(0.5, 0.72, -0.38, 0.38, 0, 0.72, 'wood_painted');
  if (kind === 'office') { bx(-0.15, 0.15, -0.1, 0.12, 0.76, 0.88, 'car_black'); bx(-0.1, 0.1, -0.2, -0.1, 0.76, 0.78, 'paint_white'); } else { bx(-0.7, 0.7, -0.35, 0.35, 0.76, 0.79, 'paint_white'); }
  const p = W(-0.0, 0.0), q = W(-0.75, 0.75), r2 = W(0.75, -0.75);
  sk.k(Math.min(q[0], r2[0]) - 0.05, y, Math.min(q[1], r2[1]) - 0.05, Math.max(q[0], r2[0]) + 0.05, y + 0.76, Math.max(q[1], r2[1]) + 0.05); void p;
  const cp = W(0, 0.85); stool(sk, cp[0], y, cp[1], 0.46);
}
/** A cabinet (filing, wardrobe): a tall box with door lines. */
export function cabinet(sk, x0, z0, x1, z1, y, h = 1.9, mat = 'wood_painted', front = 'n') {
  sk.s(mat, x0, y, z0, x1, y + h, z1);
  const alongX = (x1 - x0) > (z1 - z0), L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(L / 0.6));
  for (let i = 1; i < n; i++) {
    const u = (alongX ? x0 : z0) + L * i / n, f = front === 'n' ? z0 - 0.005 : front === 's' ? z1 : front === 'w' ? x0 - 0.005 : x1;
    if (front === 'n' || front === 's') sk.b('iron', u - 0.004, y + 0.05, f, u + 0.004, y + h - 0.05, f + 0.006); else sk.b('iron', f, y + 0.05, u - 0.004, f + 0.006, y + h - 0.05, u + 0.004);
  }
}
/** A blackboard or notice board on a wall at constant z (face toward `sgn`) or x. */
export function board(sk, o) {
  const { alongX, c, u0, u1, y0, y1, sgn, mat = 'slate' } = o;
  if (alongX) sk.b(mat, u0, y0, c, u1, y1, c + sgn * 0.03); else sk.b(mat, c, y0, u0, c + sgn * 0.03, y1, u1);
  if (alongX) sk.b('timber', u0 - 0.04, y0 - 0.04, Math.min(c, c + sgn * 0.04), u1 + 0.04, y0, Math.max(c, c + sgn * 0.04)); else sk.b('timber', Math.min(c, c + sgn * 0.04), y0 - 0.04, u0 - 0.04, Math.max(c, c + sgn * 0.04), y0, u1 + 0.04);
}
/** An easel with a colour board. */
export function easel(sk, x, y, z, col = 'car_red') {
  for (const a of [-0.35, 0, 0.35]) sk.rod('timber', [x + a, y + 1.7, z], [x + a * 1.6, y, z + (a === 0 ? 0.5 : -0.3)], 0.018, 4);
  sk.b('paint_white', x - 0.4, y + 0.9, z - 0.05, x + 0.4, y + 1.5, z - 0.03);
  sk.b(col, x - 0.3, y + 1.0, z - 0.06, x - 0.05, y + 1.3, z - 0.05); sk.b('car_blue', x - 0.02, y + 1.15, z - 0.06, x + 0.3, y + 1.4, z - 0.05); sk.b('paint_cab_yellow', x - 0.2, y + 1.3, z - 0.06, x + 0.1, y + 1.45, z - 0.05);
  sk.k(x - 0.5, y, z - 0.3, x + 0.5, y + 1.7, z + 0.55);
}
/** A bed (studio): an iron/tube frame, a mattress and a coloured blanket; head toward −z by default. */
export function bed(sk, x0, z0, y, color = 'cloth_ochre', alongZ = true) {
  const w = 0.9, l = 2.0, X1 = alongZ ? x0 + w : x0 + l, Z1 = alongZ ? z0 + l : z0 + w;
  sk.b('steel_chrome', x0, y + 0.28, z0, X1, y + 0.32, Z1); sk.b('cloth_white', x0 + 0.02, y + 0.32, z0 + 0.02, X1 - 0.02, y + 0.5, Z1 - 0.02);
  if (alongZ) { sk.b(color, x0, y + 0.5, z0 + 0.6, X1, y + 0.54, Z1); sk.b('cloth_white', x0 + 0.1, y + 0.5, z0 + 0.05, X1 - 0.1, y + 0.58, z0 + 0.5); } else { sk.b(color, x0 + 0.6, y + 0.5, z0, X1, y + 0.54, Z1); sk.b('cloth_white', x0 + 0.05, y + 0.5, z0 + 0.1, x0 + 0.5, y + 0.58, Z1 - 0.1); }
  for (const [px, pz] of [[x0, z0], [X1, z0], [x0, Z1], [X1, Z1]]) sk.rod('steel_chrome', [px, y, pz], [px, y + 0.3, pz], 0.012, 4);
  sk.k(x0, y, z0, X1, y + 0.54, Z1);
}
/** A glazed showcase on legs (exhibition of Bauhaus wares). */
export function vitrine(sk, x0, z0, x1, z1, y, ware = 'steel_chrome') {
  sk.b('steel_grey', x0, y, z0, x1, y + 0.8, z1);
  sk.b('glass_lamp', x0 + 0.03, y + 0.8, z0 + 0.03, x1 - 0.03, y + 1.5, z1 - 0.03);
  sk.b('steel_grey', x0, y + 1.5, z0, x1, y + 1.55, z1);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  sk.lathe(ware, [[0.001, 0], [0.09, 0.02], [0.1, 0.14], [0.05, 0.2], [0.001, 0.2]], cx - 0.2, y + 0.8, cz, 8);
  sk.lathe('lamp_white', [[0.001, 0], [0.06, 0.05], [0.1, 0.15], [0.001, 0.24]], cx + 0.15, y + 0.8, cz, 8);
  sk.k(x0, y, z0, x1, y + 1.55, z1);
}
