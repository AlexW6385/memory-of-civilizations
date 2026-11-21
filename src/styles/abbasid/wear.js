// The wear of the Golden Gate's approach (docs/settlements/abbasid-baghdad.md §20): where feet, hooves and wind have been. In the palace's local
// frame (south +z). Geometry only, in materials the palace plan already holds (limestone, marble, silt, timber); every variation is a hash of the
// piece's own place. A worn sill under the gate's arch, the flagstones of the way round the pool laid lighter and sunk where the queue shuffles, the
// iwan steps polished in their middle, silt drifted along the foot of the wall, a mounting block and a hitching rail of the horse-guard by the gate.
import { box, fromTriangles } from '../../core/geom.js';
import { local } from './kit.js';

const hash = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

/** A slab x0..x1, z0..z1 from y0 whose top is dished: 4 heights [h00 (x0 z0), h10, h11, h01], as 12 triangles. */
function slab(x0, z0, x1, z1, yb, t) {
  const out = [], A = [x0, t[0], z0], B = [x1, t[1], z0], C = [x1, t[2], z1], D = [x0, t[3], z1], a = [x0, yb, z0], b = [x1, yb, z0], c = [x1, yb, z1], d = [x0, yb, z1];
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(A, D, C, B); q(a, b, c, d); q(a, A, B, b); q(b, B, C, c); q(c, C, D, d); q(d, D, A, a);
  return fromTriangles(out);
}
/** A silt bank along the wall's foot from x0 to x1 at z (the wall's face), `out` deep, its crest 0.12–0.3 high wavering with the hash, thinning to the ends. */
function drift(bag, x0, x1, z, dir, y, s) {
  const n = Math.max(2, Math.round((x1 - x0) / 1.2)), t = [];
  const H = (i) => { const u = i / n, e = Math.sin(Math.PI * u); return (0.08 + 0.2 * hash(x0 + i, z, s)) * Math.min(1, e * 2.2); };
  for (let i = 0; i < n; i++) {
    const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, ha = H(i), hb = H(i + 1), da = 0.25 + 0.5 * ha / 0.28, db = 0.25 + 0.5 * hb / 0.28, za = z + dir * da, zb = z + dir * db;
    // the slope from the crest at the wall (z) down to the ground at za / zb, the end faces closed
    t.push(xa, y + ha, z, xb, y + hb, z, xb, y + 0.0, zb, xa, y + ha, z, xb, y + 0.0, zb, xa, y + 0.0, za);
    if (dir > 0) { const k = t.length; for (let j = k - 18; j < k; j += 9) { const a = t.slice(j, j + 9); t[j + 3] = a[6]; t[j + 4] = a[7]; t[j + 5] = a[8]; t[j + 6] = a[3]; t[j + 7] = a[4]; t[j + 8] = a[5]; } }
  }
  bag.add('silt', fromTriangles(t));
}

function wear(el, ctx) {
  const W = (el.rect[2] - el.rect[0]) / 2, y = el.y ?? 0, T = 2.4, [cx, cz] = [(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2];
  local(ctx, [cx, cz], { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[el.face || 's'], (c) => {
    const { bag, col } = c, zg = W - T / 2;
    // the sill of the gate's arch: limestone across the opening, hollowed 3 cm in its middle by the generations that crossed it
    for (let i = 0; i < 10; i++) {
      const xa = -2.6 + i * 0.52, xb = xa + 0.52, m = (u) => { const q = (u) / 2.6; return 0.06 - 0.032 * Math.exp(-q * q * 3.2); };
      bag.add('limestone', slab(xa, zg + 0.35, xb, zg + T - 0.35, y, [m(xa), m(xb), m(xb), m(xa)].map((h) => y + h)));
    }
    // the way from the gate to the iwan, round the pool: flagstones of pale limestone, each its own size, sunk and tilted a little where the queue stands
    const way = [[0, zg - 0.4], [3, 33.4], [8.5, 31], [8.5, 21], [4, 17.8]];
    for (let s = 0; s < way.length - 1; s++) {
      const [ax, az] = way[s], [bx, bz] = way[s + 1], L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 1.0);
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, px = ax + (bx - ax) * u, pz = az + (bz - az) * u, h = hash(px, pz, 3), w = 0.5 + 0.35 * hash(px, pz, 4), d = 0.38 + 0.25 * hash(px, pz, 5), j = (hash(px, pz, 6) - 0.5) * 1.6;
        const x0 = px + j - w / 2, z0 = pz + (hash(px, pz, 7) - 0.5) * 0.9 - d / 2, top = 0.02 + 0.012 + 0.012 * h, sink = 0.012 * hash(px, pz, 8);
        bag.add('limestone', slab(x0, z0, x0 + w, z0 + d, y + 0.02, [top - sink, top, top - sink * 0.5, top].map((v) => y + v)));
      }
    }
    // the three marble steps of the iwan: a polished hollow in each tread's middle (a slightly raised plate of the paler marble, 2 cm above the tread)
    for (let k = 0; k < 3; k++) {
      const top = y + 0.45 - k * 0.15, z0 = 16 + 0.4 * k + 0.12, z1 = 16.6 + 0.4 * k - 0.08;
      bag.add('marble_floor', slab(-1.5, z0, 1.5, z1, top, [top + 0.014, top + 0.02, top + 0.02, top + 0.014]));
    }
    // silt drifted by the wind along the foot of the south wall, both wings, with a gap before the corner towers
    for (const sd of [-1, 1]) drift(bag, sd < 0 ? -W + 4.2 : 6.2, sd < 0 ? -6.2 : W - 4.2, W + T / 2, 1, y, 11 + sd);
    // a mounting block of the horse-guard west of the gate (two stone steps) and a hitching rail on posts, rope-worn
    bag.add('limestone', box(-10.6, y, W + T / 2 + 1.0, -9.4, y + 0.3, W + T / 2 + 1.7)); bag.add('limestone', box(-10.6, y, W + T / 2 + 1.7, -9.4, y + 0.6, W + T / 2 + 2.4));
    col.rect([-10.6, W + T / 2 + 1.0, -9.4, W + T / 2 + 2.4], y, y + 0.6);
    for (const px of [-22.2, -18.8]) { bag.add('timber', box(px - 0.1, y, W + T / 2 + 0.7, px + 0.1, y + 1.35, W + T / 2 + 0.9)); col.rect([px - 0.1, W + T / 2 + 0.7, px + 0.1, W + T / 2 + 0.9], y, y + 1.35); }
    bag.add('timber', box(-22.3, y + 1.05, W + T / 2 + 0.72, -18.7, y + 1.17, W + T / 2 + 0.88));
    for (let k = 0; k < 4; k++) { const px = -21.8 + k * 0.9, h = hash(px, 0, 9); bag.add('silt', box(px - 0.3, y, W + T / 2 + 0.3, px + 0.3 + h * 0.2, y + 0.02 + 0.015 * h, W + T / 2 + 1.5)); }   // the trampled ground beneath
  });
}
export const wearElements = { golden_wear: wear };
