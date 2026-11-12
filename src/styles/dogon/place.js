// The village's other parts (docs/settlements/dogon.md §4.3, §5, §8): the Tellem dwellings on their ledges in the cliff, the round
// punulu at the village's edge, the baobab, the conical altars and the binu shrine, a drying field of millet.

import { box, lathe, rod, place } from '../../core/geom.js';
import { rng, WALL, SMOOTH, MUD, STONE, STONE2, DARK, LOG, HOLE, STALK, THATCH, ROCK, granary, altar, milletStack, notchedLadder } from './props.js';

/**
 * tellem: { c: [x, z] (the alcove's front, on the face), y (the ledge's floor), w (its width), seed }: in the alcove the cliff wall
 * leaves (cliff.js; 3.4 m deep, 6 m high, the back wall blackened), the Tellem's small flat-roofed rooms of mud and stone with square
 * doors, some with a second small room over, round granaries with straw hats, walls fallen in, a notched ladder, burial niches under
 * the back wall. None is reachable on foot (no colliders).
 */
export function tellem(el, { bag }) {
  const NC = { circle() {}, rect() {}, floor() {}, segment() {} };
  const rand = rng(el.seed || 3), [cx, cz] = el.c, y = el.y, W = el.w, x0 = cx - W / 2 + 0.3, x1 = cx + W / 2 - 0.3, zB = cz - 3.4;
  let u = x0 + 0.1;
  while (u < x1 - 1.2) {
    const kind = rand() < 0.55 ? 'room' : 'granary';
    if (kind === 'room') {
      const w = 1.8 + rand() * 1.1, d = 1.7 + rand() * 0.5, h = 1.5 + rand() * 0.5, zf = cz - 0.9, z0 = zf - d, ruin = rand() < 0.3;
      if (u + w > x1 - 0.1) break;
      const hh = ruin ? h * 0.65 : h;
      bag.add(WALL, box(u, y, z0, u + w, y + hh, zf));
      if (ruin) for (let i = 0; i < 5; i++) bag.add(STONE, lathe([[0.2 + rand() * 0.15, 0], [0.16, 0.14], [0.001, 0.2]], 6, null, u + rand() * w, y + hh, z0 + rand() * d));
      else {
        bag.add(MUD, box(u - 0.04, y + hh, z0 - 0.04, u + w + 0.04, y + hh + 0.1, zf + 0.04));
        if (rand() < 0.4 && w > 2.1) { const uw = w * 0.62, ux = u + rand() * (w - uw); bag.add(WALL, box(ux, y + hh + 0.1, z0 + 0.1, ux + uw, y + hh + 1.35, zf - 0.05)); bag.add(MUD, box(ux - 0.04, y + hh + 1.35, z0 + 0.06, ux + uw + 0.04, y + hh + 1.45, zf - 0.01)); bag.add(HOLE, box(ux + uw * 0.35, y + hh + 0.3, zf - 0.05, ux + uw * 0.35 + 0.36, y + hh + 0.95, zf - 0.038)); }
        bag.add(THATCH, box(u + 0.1, y + hh + 0.1, z0 + 0.1, u + 0.5, y + hh + 0.3, z0 + 0.4));     // a bundle on the roof
      }
      const dx = u + w * (0.3 + rand() * 0.4);
      bag.add(HOLE, box(dx - 0.22, y + 0.05, zf, dx + 0.22, y + 0.8, zf + 0.012));
      bag.add(DARK, box(dx - 0.27, y + 0.8, zf - 0.02, dx + 0.27, y + 0.9, zf + 0.06));
      bag.add('bark_dark', box(dx - 0.3, y + 0.92, zf, dx + 0.3, y + 1.25, zf + 0.004));      // the soot over the door
      if (rand() < 0.5) bag.add(HOLE, box(u + 0.2, y + hh - 0.55, zf, u + 0.45, y + hh - 0.3, zf + 0.012));
      u += w + 0.3;
    } else {
      const r = 0.7 + rand() * 0.3;
      if (u + 2 * r > x1 - 0.1) break;
      granary(bag, NC, u + r, y, cz - 1.5, r, 1.4 + rand() * 0.5, { rand, yaw: Math.PI, kind: rand() < 0.5 ? 'female' : 'male', hat: Math.min(r + 0.15, 1.1) });
      u += 2 * r + 0.75;
    }
  }
  // the burial niches under the back wall, a notched log left leaning, stones at the lip and a fallen beam
  for (let k = 0; k < 4; k++) { const nx = x0 + 0.4 + rand() * (x1 - x0 - 0.8); bag.add(HOLE, box(nx, y + 0.2, zB + 0.001, nx + 0.5, y + 0.75, zB + 0.012)); }
  notchedLadder(bag, x0 + 0.1 + rand() * (x1 - x0 - 0.5), y - 0.6, cz + 0.35, 2.6, 0, -0.5, 0.2);
  for (let i = 0; i < 9; i++) bag.add(STONE, lathe([[0.2 + rand() * 0.2, 0], [0.16, 0.14], [0.001, 0.2]], 6, null, x0 + rand() * (x1 - x0), y, cz + 0.1 + rand() * 0.3));
  bag.add(LOG, rod([x0 + 0.4, y + 0.1, cz - 0.2], [x0 + 1.9, y + 0.05, cz + 0.2], 0.06, 5));
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

/** baobab: { at: [x, z], y, r }: a squat fluted trunk (the rain-water barrel), thick limbs that fork, bare twigs and a few leaf clusters, pods hanging. */
export function baobab(el, { bag, col }) {
  const rand = rng(el.seed || 11), [x, z] = el.at, y = el.y ?? 0, r = el.r ?? 2;
  bag.add('bark_grey', lathe([[r * 1.35, -0.5], [r * 1.4, 0.3], [r * 1.05, 2.0], [r * 1.18, 4.0], [r * 1.0, 6.2], [r * 0.72, 7.6], [r * 0.5, 8.4]], 22, (t, i) => 1 + 0.07 * Math.sin(t * 7 + i * 1.3) + 0.045 * Math.sin(t * 17 + i * 0.7) + 0.03 * Math.sin(t * 3 + i), x, y, z));
  const tips = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + rand() * 0.4, b = [x + Math.cos(a) * r * 0.25, y + 7.9, z + Math.sin(a) * r * 0.25], m = [x + Math.cos(a) * (r * 1.3 + rand()), y + 9.6 + rand() * 1.5, z + Math.sin(a) * (r * 1.3 + rand())];
    bag.add('bark_grey', rod(b, m, r * 0.2, 7));
    for (let f = 0; f < 2 + (rand() < 0.4 ? 1 : 0); f++) {
      const a2 = a + (f - 0.5) * 0.7 + rand() * 0.3, t = [m[0] + Math.cos(a2) * (1.2 + rand() * 1.4), m[1] + 1.2 + rand() * 1.8, m[2] + Math.sin(a2) * (1.2 + rand() * 1.4)];
      bag.add('bark_grey', rod(m, t, r * 0.11, 6)); tips.push(t);
      bag.add('bark_grey', rod(t, [t[0] + (rand() - 0.5) * 1.4, t[1] + 0.9, t[2] + (rand() - 0.5) * 1.4], r * 0.05, 4));
    }
  }
  for (const t of tips) {
    if (rand() < 0.4) continue;
    bag.add('palm_leaf', lathe([[0.3, 0], [1.0, 0.3], [1.2, 0.7], [0.7, 1.1], [0.001, 1.2]], 7, (tt, i) => 1 + 0.3 * Math.sin(tt * 3 + i * 2.2), t[0], t[1] + 0.3, t[2]));
    if (rand() < 0.5) bag.add('bark_dark', lathe([[0.001, 0], [0.07, 0.1], [0.08, 0.3], [0.001, 0.45]], 6, null, t[0] + 0.3, t[1] - 0.45, t[2]));   // a pod
  }
  col.circle(x, z, r * 1.25, y, y + 8);
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
