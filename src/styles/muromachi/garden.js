// The garden of Jishō-ji (docs/settlements/muromachi-kyoto.md §3): the raked sand platform (Ginshadan) with its truncated cone
// (Kogetsudai), beds of moss under the trees with the stones standing in them, stepping stones, a maple and a pine pruned as a
// garden's. Built of the palette's pebbles, sod and granite only; the rakes are thin ridges, not texture.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rng, quad2 } from './kit.js';
import { stoneTris } from './zen.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));

/** A raked ridge of sand along x from a to b at z, half-width w, height h: a rounded crest of four faces, both sides, ends tapered. */
function ridge(bag, mat, a, b, z, y, w, h) {
  const t = [], P = [[-w, 0], [-w * 0.45, h * 0.8], [w * 0.45, h * 0.8], [w, 0]], e = 0.12;
  for (let i = 0; i < 3; i++) { const p = P[i], q = P[i + 1]; quad2(t, [a, y + p[1], z + p[0]], [b, y + p[1], z + p[0]], [b, y + q[1], z + q[0]], [a, y + q[1], z + q[0]]); }
  void e; bag.add(mat, fromTriangles(t));
}

/** ginshadan: { rect, y, seed } — the "silver sand sea": a platform of white sand 0.28 m high in a kerb of dressed granite, raked in long ridges along x. */
function ginshadan(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, top = y + 0.28;
  bx(bag, 'pebbles', x0, y - 0.1, z0, x1, top, z1);
  for (const [a, b, c, d] of [[x0 - 0.2, z0 - 0.2, x1 + 0.2, z0], [x0 - 0.2, z1, x1 + 0.2, z1 + 0.2], [x0 - 0.2, z0, x0, z1], [x1, z0, x1 + 0.2, z1]]) bx(bag, 'granite_block', a, y - 0.1, b, c, top + 0.05, d);
  const k = el.kogetsudai;
    // the long ridges: continuous rounded ridges with a groove between, stopping short of the cone's rings
  for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.3) {
    const dz = k ? Math.abs(z - k[1]) : 99, blocked = k && dz < 3.5 ? Math.sqrt(3.5 * 3.5 - dz * dz) : 0;
    for (const [a, b] of k && blocked ? [[x0 + 0.3, k[0] - blocked - 0.05], [k[0] + blocked + 0.05, x1 - 0.25]] : [[x0 + 0.3, x1 - 0.25]]) if (b - a > 0.4) ridge(bag, 'plaster_white', a, b, z, top, 0.075, 0.07);
  }
  if (k) {
    const R = 2.6, r = 1.55, h = 1.9;
    bag.add('pebbles', lathe([[0.001, 0.0], [R, 0.0], [R * 0.82, h * 0.45], [r + 0.05, h * 0.92], [r, h], [0.001, h - 0.02]], 30, null, k[0], top, k[1]));
    for (let j = 1; j < 8; j++) { const t = j / 8.5, rad = R + 0.04 - (R - r - 0.05) * t * 0.95; bag.add('plaster_white', lathe([[rad - 0.04, h * t], [rad, h * t + 0.05], [rad + 0.04, h * t]], 30, null, k[0], top, k[1])); }
    for (let j = 1; j <= 4; j++) bag.add('plaster_white', lathe([[R + 0.22 * j - 0.04, 0], [R + 0.22 * j, 0.06], [R + 0.22 * j + 0.04, 0]], 36, null, k[0], top, k[1]));
    for (const rr of [0.4, 0.8, 1.2]) bag.add('plaster_white', lathe([[rr - 0.03, h - 0.02], [rr, h + 0.03], [rr + 0.03, h - 0.02]], 24, null, k[0], top, k[1]));
    col.circle(k[0], k[1], R, top, top + h);
  }
  col.rect([x0 - 0.2, z0 - 0.2, x1 + 0.2, z0], y, top + 0.05); col.rect([x0 - 0.2, z1, x1 + 0.2, z1 + 0.2], y, top + 0.05);
}

/** moss_bed: { at, r, n, y, seed } — n low swells of moss on the ground within r of at, a few stones standing in them. */
function mossBed(el, { bag }) {
  const [cx, cz] = el.at, y = el.y ?? 0, r = rng(el.seed || 1), n = el.n ?? 8, R = el.r ?? 6;
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * R, rad = 0.9 + r() * 1.6, ph = r() * 6, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    bag.add('sod', lathe([[0.001, 0.0], [rad, 0.0], [rad * 0.95, 0.06], [rad * 0.6, 0.16 + r() * 0.1], [0.001, 0.2 + r() * 0.1]], 12, (th) => 0.8 + 0.25 * Math.sin(th * 3 + ph) * Math.sin(th * 2 + ph), x, y, z).scale(1, 1, 0.8));
    if (r() < 0.45) { const w = 0.25 + r() * 0.3, h = 0.3 + r() * 0.5; bag.add('rock_boulder', lathe([[0.001, -0.05], [w, -0.05], [w * 1.05, h * 0.35], [w * 0.8, h * 0.8], [w * 0.4, h], [0.001, h + 0.02]], 8, null, x + 0.2, y + 0.05, z)); }
  }
}

/** stepping_stones: { a, b, y, seed } — flat stones of granite set along a line, a stride apart, a little off it. */
function steppingStones(el, { bag }) {
  const [ax, az] = el.a, [bxx, bz] = el.b, y = el.y ?? 0, r = rng(el.seed || 1), L = Math.hypot(bxx - ax, bz - az), ux = (bxx - ax) / L, uz = (bz - az) / L;
  for (let s = 0.5; s < L - 0.3; s += 0.7 + r() * 0.25) {
    const off = (r() - 0.5) * 0.35, x = ax + ux * s - uz * off, z = az + uz * s + ux * off, w = 0.28 + r() * 0.12, h = 0.06 + r() * 0.05;
    bag.add(r() < 0.5 ? 'granite_grey' : 'granite_block', lathe([[0.001, 0.0], [w, 0.0], [w * 0.95, h], [0.001, h + 0.01]], 7, null, x, y, z));
  }
}



/** pond_stones: { c, r, n, seed, skip: [[x0, x1]...] } — stones set along the pond's bank as a garden maker sets them: a tall one, lower ones leaning toward the water, their feet in the bank. */
function pondStones(el, { bag, col }) {
  const [cx, cz] = el.c, [rx, rz] = el.r, rnd = rng(el.seed || 5), n = el.n ?? 16, y0 = el.y ?? -0.3;
  for (let i = 0; i < n; i++) {
    const th = (i + rnd() * 0.7) / n * Math.PI * 2, d = 1.02 + rnd() * 0.04, x = cx + Math.cos(th) * rx * d, z = cz + Math.sin(th) * rz * d;
    if ((el.skip || []).some(([a, b]) => x > a && x < b)) continue;
    const tall = i % 5 === 0, w = (tall ? 0.45 : 0.55 + rnd() * 0.45), h = tall ? 1.0 + rnd() * 0.5 : 0.4 + rnd() * 0.4, asp = 0.6 + 0.4 * rnd();
    const tris = stoneTris(w, h, w * asp, 100 + i * 7 + (el.seed || 5), (rnd() - 0.5) * 0.2, 0.1 * (rnd() - 0.5), !tall).map((v, j) => (j % 3 === 0 ? v + x : j % 3 === 1 ? v + y0 : v + z));
    bag.add('rock_boulder', fromTriangles(tris));
    col.circle(x, z, w * 1.05, y0, y0 + h);
    if (rnd() < 0.6) bag.add('sod', lathe([[0.001, 0.0], [w * 1.25, 0.0], [w * 1.0, 0.08], [0.001, 0.12]], 10, null, x + w * 0.6, y0 + 0.28, z));
  }
}

/** islet: { at, r, y (the water's bed), top } — a small island in the pond: a mound of earth and moss ringed with stones; a pine goes on it (placed by the plan). */
function islet(el, { bag, col }) {
  const [x, z] = el.at, r = el.r ?? 2.5, yb = el.y ?? -1.6, top = el.top ?? 0.2, rnd = rng(el.seed || 9);
  bag.add('sod', lathe([[0.001, yb], [r + 0.8, yb], [r + 0.3, -0.5], [r, -0.2], [r * 0.8, top - 0.05], [r * 0.4, top], [0.001, top + 0.03]], 18, (th) => 0.85 + 0.15 * Math.sin(th * 3 + 1), x, 0, z));
  const m = 11;
  for (let i = 0; i < m; i++) {
    const a = i / m * Math.PI * 2 + rnd() * 0.3, d = r * (0.95 + rnd() * 0.15), sx = x + Math.cos(a) * d, sz = z + Math.sin(a) * d, w = 0.35 + rnd() * 0.3, h = 0.5 + rnd() * 0.5;
    bag.add('rock_boulder', fromTriangles(stoneTris(w, h, w * (0.65 + 0.3 * rnd()), 300 + i * 11, (rnd() - 0.5) * 0.2, 0.08 * (rnd() - 0.5), i % 3 !== 0).map((v, j) => (j % 3 === 0 ? v + sx : j % 3 === 1 ? v - 0.45 : v + sz))));
  }
  col.circle(x, z, r * 0.95, yb, top);
}

/** stone_bridge: { x, z0, z1, y (deck), w } — a bridge of granite slabs on stone piers along z, a landing slab at each end. */
function stoneBridge(el, { bag, col }) {
  const x = el.x, za = Math.min(el.z0, el.z1), zb = Math.max(el.z0, el.z1), y = el.y ?? 0.18, w = el.w ?? 0.95, n = Math.max(1, Math.round((zb - za) / 2.4)), L = (zb - za) / n;
  for (let i = 0; i <= n; i++) {
    const z = za + i * L;
    bx(bag, 'granite_block', x - w / 2 - 0.1, -1.8, z - 0.3, x + w / 2 + 0.1, y - 0.28, z + 0.3);
    bx(bag, 'granite_grey', x - w / 2 - 0.16, y - 0.28, z - 0.34, x + w / 2 + 0.16, y - 0.2, z + 0.34);       // the cap of the pier
  }
  for (let i = 0; i < n; i++) { const a = za + i * L + 0.12, b = za + (i + 1) * L - 0.12; bx(bag, 'granite_grey', x - w / 2, y - 0.2, a, x + w / 2, y, b); bx(bag, 'granite_block', x - w / 2 + 0.05, y, a + 0.04, x + w / 2 - 0.05, y + 0.004, b - 0.04); }
  col.floor([x - w / 2, za, x + w / 2, zb], y);
  col.rect([x - w / 2 - 0.1, za, x - w / 2, zb], y - 1.9, y); col.rect([x + w / 2, za, x + w / 2 + 0.1, zb], y - 1.9, y);
}

/** ikegaki: { a, b, h, y, seed } — a clipped evergreen hedge (camellia) along a → b, its top flat, its face a little uneven. */
function ikegaki(el, { bag, col }) {
  const [ax, az] = el.a, [bxx, bz] = el.b, L = Math.hypot(bxx - ax, bz - az), u = [(bxx - ax) / L, (bz - az) / L], nv = [-u[1], u[0]], h = el.h ?? 1.5, y = el.y ?? 0, w = el.w ?? 0.55, rnd = rng(el.seed || 2), t = [];
  const P = (s, off, yy) => [ax + u[0] * s + nv[0] * off, y + yy, az + u[1] * s + nv[1] * off];
  const prof = (v) => [[-w * (1 + v), 0], [-w * (1.05 + v), h * 0.5], [-w * (0.85 + v), h * 0.88], [-w * 0.6, h * 1.0], [w * 0.6, h * 1.0], [w * (0.85 + v), h * 0.88], [w * (1.05 + v), h * 0.5], [w * (1 + v), 0]];
  let a = prof(0.0), s0 = 0;
  while (s0 < L - 1e-6) {
    const s1 = Math.min(L, s0 + 0.6), b = prof((rnd() - 0.5) * 0.12);
    for (let i = 0; i < a.length - 1; i++) quad2(t, P(s0, a[i][0], a[i][1]), P(s1, b[i][0], b[i][1]), P(s1, b[i + 1][0], b[i + 1][1]), P(s0, a[i + 1][0], a[i + 1][1]));
    a = b; s0 = s1;
  }
  bag.add('sod', fromTriangles(t));
  col.segment(el.a, el.b, w * 1.1, y, y + h);
}

export const gardenElements = { ginshadan, moss_bed: mossBed, stepping_stones: steppingStones, pond_stones: pondStones, islet, stone_bridge: stoneBridge, ikegaki };
