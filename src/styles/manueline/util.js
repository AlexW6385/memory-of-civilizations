// Small builders the manueline elements share: the Manueline carving (twisted-rope columns, armillary spheres, the cross of the
// Order of Christ), net vaults, walls with openings, gable roofs. See docs/settlements/manueline-lisbon.md §3.
import { box, frustum, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { tube } from '../../objects/kit.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const pick = (rand, a) => a[Math.floor(rand() * a.length)];
export const addBox = (bag, mat, x0, y0, z0, x1, y1, z1) => bag.add(mat, box(x0, y0, z0, x1, y1, z1));

/** A wall on the line a→b (plan), th thick, y0..y1, with gaps [{at, w, h, y0}] (door and window openings); solid in collision except the gaps. */
export function wallRun({ bag, col }, a, b, th, y0, y1, mat, gaps = [], colTop = y1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const ops = gaps.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2, sy: o.y0 ?? y0 })).sort((p, q) => p.s0 - q.s0);
  const piece = (s0, s1, ya, yb, solid = true) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    bag.add(mat, orientedBox(p0, p1, th, ya, yb));
    if (solid) col.segment(p0, p1, th, ya, Math.min(yb, colTop));
  };
  let s = 0;
  for (const o of ops) { piece(s, o.s0, y0, y1); if (o.sy > y0) piece(o.s0, o.s1, y0, o.sy); piece(o.s0, o.s1, o.sy + o.h, y1, false); s = o.s1; }
  piece(s, L, y0, y1);
}

/** A gable roof over rect, ridge along x (or z), from y0, rising `rise`; eaves overhang `oh`. */
export function gable(bag, mat, rect, y0, rise, alongX = true, oh = 0.5) {
  const [x0, z0, x1, z1] = rect, r = [x0 - oh, z0 - oh, x1 + oh, z1 + oh];
  const D = alongX ? r[3] - r[1] : r[2] - r[0];
  bag.add(mat, alongX ? frustum(r, y0, y0 + rise, 0, 0, D / 2, D / 2) : frustum(r, y0, y0 + rise, D / 2, D / 2, 0, 0));
}

/** An armillary sphere (Manuel's emblem): three rings and a small core, radius r, at (x, y, z). */
export function armillary(bag, mat, x, y, z, r, gild = 'gilt_bronze') {
  const ring = (f) => tube(Array.from({ length: 17 }, (_, k) => { const t = k / 16 * Math.PI * 2; return [...f(Math.cos(t) * r, Math.sin(t) * r), r * 0.07]; }).map(([a, b, c, w]) => [x + a, y + b, z + c, w]), 4, { capA: false, capB: false });
  bag.add(mat, ring((c, s) => [c, s, 0])); bag.add(mat, ring((c, s) => [0, s, c]));
  bag.add(gild, ring((c, s) => [c * 0.94, s * 0.4, s * 0.9 * 0.0 + c * 0.0 + s * 0.4 * 0.0 + c * 0.34])); // the tilted ecliptic band
  bag.add(gild, lathe([[0.001, -r * 0.18], [r * 0.18, 0], [0.001, r * 0.18]], 8, null, x, y, z));
}
/** The cross of the Order of Christ (a red cross pattée) in a plane facing `face` ('n' | 's' | 'e' | 'w'), centre (x, y, z), arm length s. */
export function orderCross(bag, mat, x, y, z, s, face = 's', th = 0.05) {
  const part = (a, b, c, d) => (face === 's' ? box(x + a, y + b, z, x + c, y + d, z + th) : face === 'n' ? box(x + a, y + b, z - th, x + c, y + d, z) : face === 'e' ? box(x, y + b, z + a, x + th, y + d, z + c) : box(x - th, y + b, z + a, x, y + d, z + c));
  const w = s * 0.17;
  bag.add(mat, part(-w, -s, w, s)); bag.add(mat, part(-s, -w, s, w));
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {   // the flared ends
    const e = s * 0.34;
    bag.add(mat, dx ? part(dx > 0 ? s - e * 0.5 : -s - 0, -e, dx > 0 ? s : -s + e * 0.5, e) : part(-e, dy > 0 ? s - e * 0.5 : -s, e, dy > 0 ? s : -s + e * 0.5));
  }
}
/** A column of octagonal section carved with two strands of twisted rope: r radius, h height from y. Returns nothing; collides as a circle. */
export function ropeColumn({ bag, col }, x, z, y, h, r, { mat = 'limestone_yellow', carved = 'limestone_carved', collide = true, strands = 2, turns = 5, capital = true } = {}) {
  bag.add(mat, lathe([[r * 1.35, 0], [r * 1.35, 0.35], [r * 1.12, 0.55], [r, 0.7], [r, h - 1.6]], 8, null, x, y, z));
  const n = Math.max(16, Math.round(h * 2.2));
  for (let s = 0; s < strands; s++) {
    const pts = Array.from({ length: n + 1 }, (_, k) => { const u = k / n, t = s / strands * Math.PI * 2 + u * turns * Math.PI * 2, yy = 0.8 + u * (h - 2.6); return [x + Math.cos(t) * r * 1.02, y + yy, z + Math.sin(t) * r * 1.02, r * 0.17]; });
    bag.add(carved, tube(pts, 4, { capA: false, capB: false }));
  }
  if (capital) {
    // the capital: an octagonal bell flaring to the springing of the vault, a ring of rope under it
    bag.add(carved, lathe([[r, 0], [r * 1.15, 0.18], [r * 1.5, 0.7], [r * 2.0, 1.4], [r * 2.15, 1.7], [0.001, 1.7]], 8, null, x, y + h - 1.7, z));
  }
  if (collide) col.circle(x, z, r * 1.35, y, y + h);
}
function facing(out, a, b, c, want) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
/**
 * A net vault over a rect cell [x0, z0, x1, z1]: depressed groin vault from `spring` to `crown`, its webs facing down, ribs in a
 * star (diagonals, ridges, and a diamond joining the edge mid-points), a boss at the crown. rich: false → diagonals and ridges only.
 */
export function netVault(bag, [x0, z0, x1, z1], spring, crown, { mat = 'limestone', rib = 'limestone_yellow', boss = 'limestone_carved', rich = true, n = 8 } = {}) {
  const H = crown - spring, arc = (t) => Math.pow(Math.max(0, 1 - t * t), 0.75);
  const P = (u, v) => [x0 + (x1 - x0) * u, spring + H * Math.max(arc(Math.abs(2 * u - 1)), arc(Math.abs(2 * v - 1))), z0 + (z1 - z0) * v];
  const web = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = P(i / n, j / n), b = P((i + 1) / n, j / n), c = P((i + 1) / n, (j + 1) / n), d = P(i / n, (j + 1) / n);
    facing(web, a, b, c, [0, -1, 0]); facing(web, a, c, d, [0, -1, 0]);
  }
  bag.add(mat, fromTriangles(web));
  const ribs = [], line = (u0, v0, u1, v1, N = 10) => { const pts = Array.from({ length: N + 1 }, (_, k) => P(u0 + (u1 - u0) * k / N, v0 + (v1 - v0) * k / N)); for (let k = 0; k < N; k++) { const a = pts[k], b = pts[k + 1]; ribs.push(rod([a[0], a[1] - 0.08, a[2]], [b[0], b[1] - 0.08, b[2]], 0.1, 4)); } };
  line(0, 0, 1, 1); line(0, 1, 1, 0); line(0.5, 0, 0.5, 1); line(0, 0.5, 1, 0.5);
  if (rich) { line(0, 0.5, 0.5, 0, 5); line(0.5, 0, 1, 0.5, 5); line(1, 0.5, 0.5, 1, 5); line(0.5, 1, 0, 0.5, 5); }
  for (const g of ribs) bag.add(rib, g);
  const c = P(0.5, 0.5);
  bag.add(boss, lathe([[0.3, 0], [0.34, 0.1], [0.18, 0.22], [0.001, 0.26]], 8, null, c[0], c[1] - 0.3, c[2]));
}
/** A prism over a polygon (plan points) from y0 to y1, with a top; bottom omitted. */
export function prism(bag, mat, pts, y0, y1) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; out.push(a[0], y0, a[1], a[0], y1, a[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], b[0], y0, b[1]); }
  const cx = pts.reduce((s, p) => s + p[0], 0) / n, cz = pts.reduce((s, p) => s + p[1], 0) / n;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; out.push(cx, y1, cz, b[0], y1, b[1], a[0], y1, a[1]); }
  bag.add(mat, fromTriangles(orientOutward(out)));
}
/** A conical pinnacle / spire: base radius r at (x, y, z), height h, `seg` sides, a ball on its tip. */
export function pinnacle(bag, mat, x, y, z, r, h, seg = 8) {
  bag.add(mat, lathe([[r, 0], [r * 0.9, h * 0.12], [r * 0.72, h * 0.15], [r * 0.5, h * 0.6], [r * 0.12, h * 0.96], [0.001, h]], seg, null, x, y, z));
}
