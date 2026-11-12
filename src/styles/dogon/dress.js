// What dresses a Dogon house at eye level (docs/settlements/dogon.md §5, §6): the rubble plinth, the bench against the facade, water
// jars and a mortar by the door, firewood, gourds hung on pegs, and the weathering of mud — rain streaks off the roof, patches of new
// plaster, cracks — and, inside, niches with small pots, pegs, the millet rack on the roof. All from the palette; small pieces are
// merged (the viewer draws the fine ones only near).

import { box, lathe, rod } from '../../core/geom.js';
import { rng, WALL, SMOOTH, MUD, STONE, STONE2, DARK, LOG, HOLE, THATCH, STALK, jar, basket, mortar, firewood, milletStack } from './props.js';

const POOL = 'pottery_dark';

/** The pilasters of nicheFacade (same beat): their x positions, none within the doors. */
function pilasters(x0, x1, doors) {
  const n = Math.max(2, Math.round((x1 - x0) / 1.05)), pitch = (x1 - x0) / n, out = [];
  for (let i = 0; i <= n; i++) { const u = x0 + i * pitch; if (!doors.some((d) => Math.abs(u - d) < 0.78)) out.push(u); }
  return out;
}

/** Weathering of a niched facade (south face at zf, x0…x1, height H): rain streaks under the cornice, patches of new plaster, cracks, a soot stain over a door. */
export function weatherFront(bag, x0, x1, zf, y, H, rand, doors = []) {
  const top = y + H, zp = zf + 0.153;
  for (const u of pilasters(x0, x1, doors)) {
    const r = rand();
    if (r < 0.4) bag.add('plaster_streak', box(u - 0.045, top - 0.1 - (0.9 + rand() * 1.4), zp, u + 0.045, top - 0.08, zp + 0.004));
    else if (r < 0.6) { const h = 0.35 + rand() * 0.5, v = y + 0.3 + rand() * (H - 1.4); bag.add(MUD, box(u - 0.13, v, zp, u + 0.13, v + h, zp + 0.006)); }
    else if (r < 0.7) { const v = y + 0.5 + rand() * (H - 1.8); bag.add('wood_dark', box(u - 0.006, v, zp, u + 0.006, v + 0.45, zp + 0.003)); bag.add('wood_dark', box(u + 0.01, v + 0.4, zp, u + 0.07, v + 0.8, zp + 0.003)); }
  }
  for (const d of doors) bag.add('bark_dark', box(d - 0.35, y + 1.62, zf + 0.0, d + 0.35, y + 1.75 + rand() * 0.5, zf + 0.004));    // soot over the door from the lamp and the kitchen's smoke
}

/** The front of a house: its rubble plinth, bench, jars, firewood, mortar, gourds on pegs. { x0, x1, zf, y, doors, seed } */
export function frontDress(bag, col, { x0, x1, zf, y, doors, seed }) {
  const rand = rng((seed || 3) * 13 + 5), far = (u, w = 0) => doors.every((d) => Math.abs(u - d) > 0.85 + w);
  // the plinth: fieldstone and rubble along the foot, between the doors
  for (let u = x0 + 0.05; u < x1 - 0.05; u += 0.3 + rand() * 0.25) {
    if (!far(u, 0.1)) continue;
    const r = 0.15 + rand() * 0.1;
    bag.add(STONE, lathe([[r * 1.3, 0], [r, 0.12 + rand() * 0.08], [0.001, 0.22]], 6, (t, i) => 1 + 0.15 * Math.sin(t * 3 + i + u), u, y - 0.04, zf + 0.12));
  }
  const ds = [...doors].sort((a, b) => a - b), mid = (ds[0] + ds[1]) / 2, gap = ds.length > 1 ? ds[1] - ds[0] - 2.0 : 0;
  // a mud bench against the wall between the doors, a mat and a cloth on it
  if (gap > 0.9 && rand() < 0.75) {
    const w = Math.min(2.0, gap), bx0 = mid - w / 2, bx1 = mid + w / 2;
    bag.add(WALL, box(bx0, y - 0.1, zf + 0.15, bx1, y + 0.4, zf + 0.62));
    bag.add(SMOOTH, box(bx0 - 0.02, y + 0.4, zf + 0.15, bx1 + 0.02, y + 0.44, zf + 0.66));
    bag.add(STALK, box(bx0 + 0.1, y + 0.44, zf + 0.22, bx1 - 0.1, y + 0.46, zf + 0.58));
    if (rand() < 0.6) bag.add(rand() < 0.5 ? 'cloth_indigo' : 'cloth_ochre', box(bx0 + 0.3, y + 0.46, zf + 0.25, bx0 + 0.9, y + 0.5, zf + 0.5));
    col.rect([bx0, zf + 0.15, bx1, zf + 0.66], y, y + 0.44);
  }
  // water jars by a door, a second set at the other
  for (const d of ds) {
    if (rand() < 0.75) {
      const sgn = rand() < 0.5 ? -1 : 1, n = 1 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) {
        const jx = d + sgn * (1.15 + k * 0.32 + rand() * 0.06), jz = zf + 0.4 + rand() * 0.25;
        if (jx < x0 || jx > x1) continue;
        jar(bag, jx, y, jz, 1.1 + rand() * 0.5, rand() < 0.65 ? 'terracotta' : POOL); col.circle(jx, jz, 0.22, y, y + 0.55);
      }
    }
  }
  // firewood at one end, against the wall; or a mortar with its pestles
  const r = rand();
  if (r < 0.4) { const fx = rand() < 0.5 ? x0 + 0.9 : x1 - 0.9; if (far(fx, 0.3)) firewood(bag, col, fx, y, zf + 0.55, 0, 1.3, 3, rand); }
  else if (r < 0.7) { const mx = rand() < 0.5 ? x0 + 0.6 : x1 - 0.6; if (far(mx, 0.3)) mortar(bag, col, mx, y, zf + 0.75, rand); }
  // gourds hung from pegs in the wall beside each door, at the reach of a hand
  for (const d of ds) for (const s of [-1, 1]) {
    if (rand() < 0.45) continue;
    const gx = d + s * 0.95;
    if (gx < x0 + 0.3 || gx > x1 - 0.3) continue;
    bag.add(DARK, rod([gx, y + 1.85, zf + 0.16], [gx, y + 1.85, zf + 0.34], 0.02, 4));
    if (rand() < 0.5) bag.add(DARK, lathe([[0.001, 0], [0.09, 0.03], [0.12, 0.12], [0.06, 0.24], [0.02, 0.3]], 8, null, gx, y + 1.5, zf + 0.34));
    else bag.add(THATCH, lathe([[0.001, 0], [0.07, 0.02], [0.08, 0.2], [0.001, 0.34]], 6, null, gx, y + 1.5, zf + 0.34));       // a bunch of millet heads
  }
}

/** A courtyard wall's dress along a → b (plan), top at yTop, the lane on the side `out` ([nx, nz]): patches of plaster, thorn laid on top against the goats, stones, an upturned pot. */
export function wallDress(bag, a, b, yTop, rand, out = [0, 1], th = 0.38) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let s = 0.4; s < L - 0.3; s += 0.8 + rand() * 0.8) {
    const cx = a[0] + ux * s, cz = a[1] + uz * s, r = rand();
    if (r < 0.45) {
      for (let k = 0; k < 3; k++) {
        const aa = rand() * 6.28, hx = cx + Math.cos(aa) * 0.15, hz = cz + Math.sin(aa) * 0.15, h = 0.4 + rand() * 0.5;
        bag.add('bark_dark', rod([hx, yTop + 0.08, hz], [hx + (rand() - 0.5) * 0.35, yTop + 0.08 + h, hz + (rand() - 0.5) * 0.35], 0.012 + rand() * 0.006, 4));
      }
    } else if (r < 0.65) {
      const px = cx + out[0] * (th / 2 + 0.003), pz = cz + out[1] * (th / 2 + 0.003), w = 0.25 + rand() * 0.2;
      bag.add(MUD, box(Math.min(px, px + ux * w) - Math.abs(out[0]) * 0.003, yTop - 0.9 - rand() * 0.4, Math.min(pz, pz + uz * w) - Math.abs(out[1]) * 0.003, Math.max(px, px + ux * w) + Math.abs(out[0]) * 0.003, yTop - 0.35, Math.max(pz, pz + uz * w) + Math.abs(out[1]) * 0.003));
    } else if (r < 0.8) bag.add(STONE2, lathe([[0.16 + rand() * 0.06, 0], [0.13, 0.1], [0.001, 0.14]], 6, null, cx, yTop + 0.05, cz));
    else if (r < 0.88) bag.add(rand() < 0.5 ? POOL : 'terracotta', lathe([[0.001, 0.2], [0.14, 0.18], [0.2, 0.08], [0.17, 0.0], [0.001, 0.0]], 8, null, cx, yTop + 0.06, cz));
  }
}

/** A drying rack on a roof: four posts, two rails, bunches of millet heads hung over them. rect = [x0, z0, x1, z1]. */
export function roofRack(bag, col, rect, y, rand) {
  const [x0, z0, x1, z1] = rect, h = 1.15;
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { bag.add(LOG, rod([x, y, z], [x + (rand() - 0.5) * 0.05, y + h, z], 0.04, 5)); col.circle(x, z, 0.06, y, y + h); }
  for (const z of [z0, z1]) bag.add(LOG, rod([x0 - 0.1, y + h - 0.05, z], [x1 + 0.1, y + h - 0.05, z], 0.03, 5));
  for (const z of [z0, z1]) for (let x = x0 + 0.15; x < x1; x += 0.2 + rand() * 0.1) bag.add(THATCH, lathe([[0.001, 0.55], [0.045, 0.5], [0.06, 0.2], [0.03, 0.02], [0.001, 0]], 5, null, x, y + h - 0.6, z + (rand() - 0.5) * 0.04));
  bag.add(STALK, box(x0, y, z0 + 0.2, x1, y + 0.015, z1 - 0.2));
}

/** Niches in an interior wall: at [x, z] on the wall's face (`face`: 'n' the north wall's inside face at z, 'e' / 'w' the east / west wall's at x), each with a small pot in it. */
export function innerNiches(bag, list, face, F, rand, hh = 1.1) {
  for (const [x, z] of list) {
    const y = F + hh + rand() * 0.15, pm = rand() < 0.5 ? POOL : 'terracotta';
    if (face === 'n') { bag.add(HOLE, box(x, y, z, x + 0.3, y + 0.34, z + 0.012)); bag.add(SMOOTH, box(x - 0.03, y + 0.34, z, x + 0.33, y + 0.38, z + 0.05)); bag.add(pm, lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.08], [0.06, 0.16], [0.001, 0.17]], 8, null, x + 0.15, y, z + 0.1)); }
    else { const s = face === 'e' ? -1 : 1; bag.add(HOLE, box(Math.min(x, x + s * 0.012), y, z - 0.15, Math.max(x, x + s * 0.012), y + 0.34, z + 0.15)); bag.add(SMOOTH, box(Math.min(x, x + s * 0.05), y + 0.34, z - 0.18, Math.max(x, x + s * 0.05), y + 0.38, z + 0.18)); bag.add(pm, lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.08], [0.06, 0.16], [0.001, 0.17]], 8, null, x + s * 0.1, y, z)); }
  }
}

/** Pegs in the north wall at xs (inside face z), high up, with what hangs from them: a gourd, a basket, a bunch of heads, a bag. */
export function hangings(bag, xs, z, F, rand) {
  for (const x of xs) {
    const y = F + 1.6;
    bag.add(DARK, rod([x, y, z], [x, y, z + 0.16], 0.018, 4));
    const r = rand();
    if (r < 0.34) bag.add(DARK, lathe([[0.001, 0], [0.09, 0.03], [0.12, 0.12], [0.06, 0.24], [0.02, 0.3]], 8, null, x, y - 0.32, z + 0.16));
    else if (r < 0.67) bag.add('wicker', lathe([[0.001, 0], [0.12, 0.01], [0.14, 0.12], [0.001, 0.14]], 8, null, x, y - 0.17, z + 0.17));
    else bag.add(THATCH, lathe([[0.001, 0], [0.08, 0.02], [0.09, 0.26], [0.001, 0.45]], 6, null, x, y - 0.46, z + 0.16));
  }
}
void basket; void milletStack; void LOG;
