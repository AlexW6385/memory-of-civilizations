// The village's other parts (docs/settlements/dogon.md §4.3, §5, §8): the Tellem dwellings on their ledges in the cliff, the round
// punulu at the village's edge, the baobab, the conical altars and the binu shrine, a drying field of millet.

import { box, lathe, rod, place } from '../../core/geom.js';
import { rng, WALL, SMOOTH, MUD, STONE, STONE2, DARK, LOG, HOLE, STALK, THATCH, ROCK, granary, altar, milletStack, notchedLadder } from './props.js';

/**
 * tellem: { c: [x, z] (the ledge's front centre), y (its height), w (width), seed }: a slab of the ledge, under an overhang of the
 * sandstone, on it small flat-roofed rooms of mud and stone with square doors, round granaries with straw hats, a fallen wall.
 * The ledge runs back (north, −z) 3.2 m into the cliff.
 */
export function tellem(el, { bag, col }) {
  const rand = rng(el.seed || 3), [cx, cz] = el.c, y = el.y, W = el.w, x0 = cx - W / 2, x1 = cx + W / 2, zb = cz - 3.2;
  bag.add(ROCK, box(x0 - 0.8, y - 1.2, zb, x1 + 0.8, y, cz + 0.5));
  // the overhang: a thick lip of the sandstone over the ledge, its underside black with smoke
  bag.add(ROCK, box(x0 - 1.4, y + 3.6, zb, x1 + 1.4, y + 5.6, cz + 1.4));
  bag.add('bark_dark', box(x0 - 0.6, y + 3.5, zb + 0.2, x1 + 0.6, y + 3.62, cz + 0.6));
  col.floor([x0, zb, x1, cz], y);
  let u = x0 + 0.3, k = 0;
  while (u < x1 - 1.2) {
    const kind = rand() < 0.55 ? 'room' : 'granary';
    if (kind === 'room') {
      const w = 1.7 + rand() * 1.0, d = 1.6 + rand() * 0.6, h = 1.5 + rand() * 0.5, zf = cz - 0.5, z0 = zf - d;
      if (u + w > x1 - 0.2) break;
      bag.add(WALL, box(u, y, z0, u + w, y + h, zf));
      bag.add(MUD, box(u - 0.04, y + h, z0 - 0.04, u + w + 0.04, y + h + 0.1, zf + 0.04));
      const dx = u + w * (0.3 + rand() * 0.4);
      bag.add(HOLE, box(dx - 0.2, y + 0.05, zf, dx + 0.2, y + 0.75, zf + 0.012));
      bag.add(DARK, box(dx - 0.24, y + 0.75, zf - 0.02, dx + 0.24, y + 0.85, zf + 0.06));
      if (rand() < 0.5) bag.add(HOLE, box(u + 0.2, y + h - 0.55, zf, u + 0.45, y + h - 0.3, zf + 0.012));
      col.rect([u, z0, u + w, zf], y, y + h + 0.1);
      u += w + 0.35;
    } else {
      const r = 0.7 + rand() * 0.3;
      if (u + 2 * r > x1 - 0.2) break;
      granary(bag, col, u + r, y, cz - 1.6, r, 1.5 + rand() * 0.5, { rand, yaw: Math.PI, kind: rand() < 0.5 ? 'female' : 'male', hat: r + 0.15 });
      u += 2 * r + 0.8;
    }
    k++;
  }
  // a fallen wall: stones at the ledge's edge, a few beams left over the doorways
  for (let i = 0; i < 9; i++) { const a = x0 + rand() * W; bag.add(STONE, lathe([[0.2 + rand() * 0.2, 0], [0.16, 0.14], [0.001, 0.2]], 6, null, a, y, cz - 0.1 + rand() * 0.4)); }
  void k;
}

/** punulu: { c: [x, z], y, r?, seed }: a small round hut of mud with a conical roof of straw and a low door, for the women at their time. */
export function punulu(el, { bag, col }) {
  const rand = rng(el.seed || 2), [x, z] = el.c, y = el.y ?? 0, r = el.r ?? 1.6, h = 1.7, yaw = el.yaw ?? rand() * 6.28;
  bag.add(STONE, lathe([[r + 0.2, -0.3], [r + 0.15, 0.1], [0.001, 0.1]], 10, null, x, y, z));
  bag.add(WALL, lathe([[r * 1.04, 0.05], [r, h * 0.5], [r * 0.98, h]], 14, (t, i) => 1 + 0.02 * Math.sin(t * 6 + i * 2 + x), x, y, z));
  bag.add(THATCH, lathe([[r + 0.35, h - 0.1], [r + 0.3, h], [r * 0.7, h + 0.55], [r * 0.3, h + 1.0], [0.02, h + 1.4]], 14, (t, i) => i < 2 ? 1 + 0.05 * Math.sin(t * 17) : 1 + 0.03 * Math.sin(t * 9 + i), x, y, z));
  const dx = Math.sin(yaw), dz = Math.cos(yaw), px = x + dx * (r * 1.02), pz = z + dz * (r * 1.02);
  bag.add(HOLE, place(box(-0.3, 0.1, 0, 0.3, 1.05, 0.03), px, y, pz, yaw));
  bag.add(DARK, place(box(-0.36, 1.05, -0.02, 0.36, 1.15, 0.07), px, y, pz, yaw));
  col.circle(x, z, r + 0.2, y - 0.3, y + h + 1.4);
}

/** baobab: { at: [x, z], y, r }: a squat bulging trunk, a few thick limbs and a thin crown. */
export function baobab(el, { bag, col }) {
  const rand = rng(el.seed || 11), [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 2;
  bag.add('bark_grey', lathe([[r * 1.25, -0.5], [r * 1.3, 0.3], [r * 1.0, 2.0], [r * 1.12, 4.0], [r * 0.95, 6.2], [r * 0.7, 7.6], [r * 0.5, 8.4]], 18, (t, i) => 1 + 0.06 * Math.sin(t * 5 + i * 1.3) + 0.03 * Math.sin(t * 13), x, y, z));
  const tips = [];
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + rand() * 0.5, b = [x + Math.cos(a) * r * 0.2, y + 7.8, z + Math.sin(a) * r * 0.2], t = [x + Math.cos(a) * (r * 2.0 + rand()), y + 10.5 + rand() * 2.5, z + Math.sin(a) * (r * 2.0 + rand())];
    bag.add('bark_grey', rod(b, t, r * 0.2, 7)); tips.push(t);
  }
  for (const t of tips) {
    bag.add('bark_grey', rod(t, [t[0] + (rand() - 0.5) * 2, t[1] + 1.5, t[2] + (rand() - 0.5) * 2], r * 0.08, 5));
    bag.add('palm_leaf', lathe([[0.4, 0], [1.4, 0.4], [1.8, 0.9], [1.0, 1.5], [0.001, 1.7]], 8, (tt, i) => 1 + 0.25 * Math.sin(tt * 3 + i * 2.2), t[0], t[1] + 0.6, t[2]));
  }
  col.circle(x, z, r * 1.15, y, y + 8);
}

/** dogon_altar: { at: [x, z], y, kind: 'cone' | 'binu' }. */
export function altarEl(el, { bag, col }) { altar(bag, col, el.at[0], el.y ?? 0, el.at[1], el.kind ?? 'cone', rng(el.seed || 1)); }

/** millet_plot: { rect: [x0, z0, x1, z1], y?, seed, yAt?: (x, z) => y }: standing millet stalks in rows with a drying rack of poles at one end. */
export function milletPlot(el, { bag, col }) {
  const rand = rng(el.seed || 4), [x0, z0, x1, z1] = el.rect, yAt = el.yAt ?? (() => el.y ?? 0);
  for (let x = x0 + 0.6; x < x1; x += 1.25) for (let z = z0 + 0.6; z < z1; z += 1.25) {
    if (rand() < 0.3) continue;
    const px = x + (rand() - 0.5) * 0.5, pz = z + (rand() - 0.5) * 0.5, y = yAt(px, pz), h = 2.2 + rand() * 0.6;
    bag.add(STALK, rod([px, y, pz], [px + (rand() - 0.5) * 0.15, y + h, pz + (rand() - 0.5) * 0.15], 0.018, 4));
    if (rand() < 0.75) bag.add(THATCH, lathe([[0.001, 0], [0.05, 0.05], [0.055, 0.25], [0.001, 0.4]], 5, null, px, y + h - 0.1, pz));
  }
}
void SMOOTH; void STONE2; void LOG; void milletStack; void notchedLadder;
