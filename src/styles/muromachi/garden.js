// The garden of Jishō-ji (docs/settlements/muromachi-kyoto.md §3): the raked sand platform (Ginshadan) with its truncated cone
// (Kogetsudai), beds of moss under the trees with the stones standing in them, stepping stones, a maple and a pine pruned as a
// garden's. Built of the palette's pebbles, sod and granite only; the rakes are thin ridges, not texture.
import { box, lathe } from '../../core/geom.js';
import { rng } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));

/** ginshadan: { rect, y, seed } — the "silver sand sea": a platform of white sand 0.28 m high in a kerb of dressed granite, raked in long ridges along x. */
function ginshadan(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, top = y + 0.28;
  bx(bag, 'pebbles', x0, y - 0.1, z0, x1, top, z1);
  for (const [a, b, c, d] of [[x0 - 0.2, z0 - 0.2, x1 + 0.2, z0], [x0 - 0.2, z1, x1 + 0.2, z1 + 0.2], [x0 - 0.2, z0, x0, z1], [x1, z0, x1 + 0.2, z1]]) bx(bag, 'granite_block', a, y - 0.1, b, c, top + 0.05, d);
  const k = el.kogetsudai;
  const near = (z, x) => k && Math.hypot((x - k[0]) / 1.0, (z - k[1]) / 1.0) < 3.6;
  // the long ridges, broken round the cone
  for (let z = z0 + 0.35; z < z1 - 0.2; z += 0.3) {
    let a = null;
    for (let x = x0 + 0.3; x <= x1 - 0.25; x += 0.9) {
      const bad = near(z, x);
      if (!bad && a === null) a = x;
      if ((bad || x + 0.9 > x1 - 0.25) && a !== null) { bx(bag, 'plaster_white', a, top, z - 0.04, bad ? x - 0.45 : x, top + 0.05, z + 0.04); a = null; }
    }
  }
  if (k) {
    const R = 2.6, r = 1.55, h = 1.9;
    bag.add('pebbles', lathe([[0.001, 0.0], [R, 0.0], [R * 0.82, h * 0.45], [r + 0.05, h * 0.92], [r, h], [0.001, h - 0.02]], 22, null, k[0], top, k[1]));
    for (let j = 1; j < 5; j++) { const t = j / 5.5, rad = R + 0.04 - (R - r - 0.05) * t * 0.95; bag.add('plaster_white', lathe([[rad - 0.03, h * t], [rad, h * t + 0.04], [rad + 0.03, h * t]], 22, null, k[0], top, k[1])); }
    for (let j = 1; j <= 3; j++) bag.add('plaster_white', lathe([[R + 0.25 * j - 0.03, 0], [R + 0.25 * j, 0.04], [R + 0.25 * j + 0.03, 0]], 28, null, k[0], top, k[1]));
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

export const gardenElements = { ginshadan, moss_bed: mossBed, stepping_stones: steppingStones };
