// Lin'an's own townscape pieces (docs/settlements/song-hangzhou.md §12–§13), on the song style:
// the city wall's parapet, the well, the storehouse (tafang), the lake's willow-stake landing.
// Registered into the style's element table, so that the plans of this folder can use them.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import './../../styles/song/index.js';

/**
 * song_parapet: the parapet of the city wall along an axis-aligned line a→b { a, b, y (the wall's top),
 * th, h, merlon (length), gap }: merlons (nü qiang) of grey brick under a tiled cap with the crenels
 * between them, a solid one-metre low wall on the inner side when `inner`. Colliders follow each merlon.
 */
function parapet(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y, th = el.th ?? 0.5, h = el.h ?? 1.5;
  const alongX = Math.abs(bx - ax) > Math.abs(bz - az), L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az);
  const lo = alongX ? Math.min(ax, bx) : Math.min(az, bz), c = alongX ? az : ax;
  const m = el.merlon ?? 1.3, g = el.gap ?? 0.5, step = m + g, n = Math.max(1, Math.floor((L + g) / step));
  const used = n * step - g, s0 = lo + (L - used) / 2;
  const R = (s0_, s1_) => alongX ? [s0_, c - th / 2, s1_, c + th / 2] : [c - th / 2, s0_, c + th / 2, s1_];
  // the solid low wall under the crenels (0.55 m), merlons above to h
  const base = R(lo, lo + L);
  if (el.inner) { bag.add('brick_grey', box(base[0], y, base[1], base[2], y + 1.0, base[3])); col.rect(base, y, y + 1.0); bag.add('tile_dark', box(base[0] - 0.05, y + 1.0, base[1] - 0.05, base[2] + 0.05, y + 1.08, base[3] + 0.05)); return; }
  bag.add('brick_grey', box(base[0], y, base[1], base[2], y + 0.6, base[3]));
  bag.add('granite_grey', box(base[0] - 0.04, y + 0.6, base[1] - 0.04, base[2] + 0.04, y + 0.66, base[3] + 0.04));
  col.rect(base, y, y + 0.66);
  for (let i = 0; i < n; i++) {
    const a = s0 + i * step, r = R(a, a + m);
    bag.add('brick_grey', box(r[0], y + 0.66, r[1], r[2], y + h, r[3]));
    bag.add('tile_dark', box(r[0] - 0.06, y + h, r[1] - 0.06, r[2] + 0.06, y + h + 0.1, r[3] + 0.06));
    col.rect(r, y + 0.66, y + h + 0.1);
    // a loophole in each merlon (a slot through it)
  }
}

/**
 * town_well { at, y, r }: a well of the lanes — a curb (jing lan) of cut granite in a ring with its
 * rope-worn lip, a stone platform round it, a pair of timber posts with a crossbar and a wooden bucket
 * on its rope.
 */
function well(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 0.42, rot = el.rot ?? 0;
  bag.add('granite_grey', lathe([[0.001, 0.0], [r + 0.55, 0.0], [r + 0.55, 0.1], [r + 0.42, 0.14], [0.001, 0.14]], 12, null, x, y, z));
  bag.add('granite_grey', lathe([[r, 0.14], [r + 0.13, 0.14], [r + 0.15, 0.2], [r + 0.15, 0.62], [r + 0.08, 0.68], [r - 0.02, 0.68], [r - 0.02, 0.14]], 12, null, x, y, z));
  bag.add('wood_dark', lathe([[0.001, 0.14], [r - 0.02, 0.14], [r - 0.02, 0.16], [0.001, 0.16]], 12, null, x, y, z));
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, h, b) => [x + a * c - b * s, y + h, z + a * s + b * c];
  for (const sx of [-1, 1]) bag.add('timber', rod(P(sx * (r + 0.05), 0.14, 0.0 + r + 0.3), P(sx * (r + 0.05), 1.75, r + 0.3), 0.05, 6));
  bag.add('timber', rod(P(-(r + 0.2), 1.72, r + 0.3), P(r + 0.2, 1.72, r + 0.3), 0.045, 6));
  bag.add('timber', lathe([[0.15, 0], [0.19, 0.0], [0.19, 0.3], [0.15, 0.3], [0.15, 0.0]], 8, null, x, y + 0.68, z));
  bag.add('wood_dark', rod(P(0.1, 1.72, r + 0.3), P(0.1, 0.96, 0.05), 0.012, 4));
  col.circle(x, z, r + 0.2, y, y + 0.7);
}

/** A gable roof (ridge along `ridgeX` ? x : z) over [x0, z0, x1, z1] at y (the wall top), the eaves o beyond, rise: tile above, timber soffit below, the gable ends filled in `wall`. */
export function gableRoof(bag, [x0, z0, x1, z1], y, rise, o, ridgeX, wall) {
  const t = [], u = [], g = [];
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, yr = y + rise + 0.12;
  const tri = (a, b, c2, arr) => arr.push(...a, ...b, ...c2);
  if (ridgeX) {
    const e0 = z0 - o, e1 = z1 + o, ya = y - 0.4 * o;
    const A = [x0 - o, ya, e0], B = [x1 + o, ya, e0], C = [x1 + o, yr, cz], D = [x0 - o, yr, cz], E = [x1 + o, ya, e1], F = [x0 - o, ya, e1];
    tri(A, D, C, t); tri(A, C, B, t); tri(D, F, E, t); tri(D, E, C, t);
    tri(A, B, C, u); tri(A, C, D, u); tri(D, C, E, u); tri(D, E, F, u);
    tri([x0, y, z1], [x0, y, z0], [x0, y + rise, cz], g); tri([x1, y, z0], [x1, y, z1], [x1, y + rise, cz], g);
  } else {
    const e0 = x0 - o, e1 = x1 + o, ya = y - 0.4 * o;
    const A = [e0, ya, z0 - o], B = [e0, ya, z1 + o], C = [cx, yr, z1 + o], D = [cx, yr, z0 - o], E = [e1, ya, z1 + o], F = [e1, ya, z0 - o];
    tri(A, B, C, t); tri(A, C, D, t); tri(D, C, E, t); tri(D, E, F, t);
    tri(A, D, C, u); tri(A, C, B, u); tri(D, F, E, u); tri(D, E, C, u);
    tri([x0, y, z0], [x1, y, z0], [cx, y + rise, z0], g); tri([x1, y, z1], [x0, y, z1], [cx, y + rise, z1], g);
  }
  // the slopes seen from above are `t` (wound upward), from below `u`; each as given may face either way, so both are added with their own windings
  bag.add('tile_dark', fromTriangles(orient(t, true))); bag.add('timber', fromTriangles(orient(u, false))); bag.add(wall, fromTriangles(g));
}
// orient triangles so that their normals' y is positive (up) or negative (down)
function orient(a, up) {
  const o = [];
  for (let i = 0; i < a.length; i += 9) {
    const ux = a[i + 3] - a[i], uy = a[i + 4] - a[i + 1], uz = a[i + 5] - a[i + 2], vx = a[i + 6] - a[i], vy = a[i + 7] - a[i + 1], vz = a[i + 8] - a[i + 2];
    const ny = uz * vx - ux * vz, flip = up ? ny < 0 : ny > 0;
    if (flip) o.push(a[i], a[i + 1], a[i + 2], a[i + 6], a[i + 7], a[i + 8], a[i + 3], a[i + 4], a[i + 5]); else o.push(...a.slice(i, i + 9));
  }
  return o;
}

/**
 * tafang: a storehouse by the water (塌房, Mengliang lu 19) { rect, y, front ('e' | 'w': the long side
 * toward the canal street), seed, bays }: a long low house of grey brick on a granite plinth, with no
 * wood in its walls to burn — the walls a brick thick, a tile roof with deep eaves, a row of plank doors
 * on the street side under the eave (the goods carried in from the boats), small high vents, a loading
 * platform of granite along the front; sacks and jars stacked on it. Fire-proof by
 * construction: the reason the Song rented such storehouses out.
 */
function tafang(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front ?? 'w', H = el.H ?? 4.8;
  const L = z1 - z0, nb = el.bays ?? Math.max(3, Math.round(L / 11)), bw = L / nb;
  const fx = f === 'e' ? x1 : x0, bx = f === 'e' ? x0 : x1, sg = f === 'e' ? 1 : -1;
  // plinth and platform
  bag.add('granite_block', box(x0, y - 0.3, z0, x1, y + 0.45, z1)); col.rect([x0, z0, x1, z1], y - 0.3, y + 0.45 + H);
  const px = fx + sg * 2.2;
  bag.add('granite_block', box(Math.min(fx, px), y - 0.3, z0, Math.max(fx, px), y + 0.38, z1)); col.floor([Math.min(fx, px), z0, Math.max(fx, px), z1], y + 0.38);
  // brick walls (a little inside the plinth)
  const wx0 = x0 + 0.15, wx1 = x1 - 0.15;
  bag.add('brick_grey', box(wx0, y + 0.45, z0 + 0.15, wx1, y + 0.45 + H, z1 - 0.15));
  const yTop = y + 0.45 + H;
  gableRoof(bag, [wx0, z0 + 0.15, wx1, z1 - 0.15], yTop, (wx1 - wx0) * 0.3, 1.5, false, 'brick_grey');
  // the doors on the street side: a plank door in each bay with a lintel, a high vent over it
  for (let i = 0; i < nb; i++) {
    const zc = z0 + (i + 0.5) * bw, d = 0.01, xf = fx - sg * 0.15 + sg * d;
    const dz0 = zc - 1.1, dz1 = zc + 1.1, out = sg;
    bag.add('wood_dark', box(Math.min(xf, xf + out * 0.06), y + 0.45, dz0, Math.max(xf, xf + out * 0.06), y + 0.45 + 2.9, dz1));
    bag.add('timber', box(Math.min(xf, xf + out * 0.12), y + 0.45 + 2.9, dz0 - 0.15, Math.max(xf, xf + out * 0.12), y + 0.45 + 3.1, dz1 + 0.15));
    bag.add('wood_dark', box(Math.min(xf, xf + out * 0.05), y + 0.45 + 3.7, zc - 0.35, Math.max(xf, xf + out * 0.05), y + 0.45 + 4.2, zc + 0.35));
      }
}

Object.assign(STYLES.song.elements, { song_parapet: parapet, town_well: well, tafang });
