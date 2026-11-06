// A ferry wharf at Circular Quay as in 1973 (docs/settlements/sydney.md §1c): a hardwood deck on rows of timber piles
// with their headstocks and braces, fender piles and walings down both sides where the ferries berth, the waiting
// shed and ticket office at the shore end, a long awning on steel posts over the middle, benches, bollards and
// life buoys; at each berth a gangway on its gallows — two posts, a beam and the chains — lowered onto a ferry's
// deck where one lies alongside, raised where none does.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';

const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
/** wharf: { rect (along z, the shore end at z1), y (deck), gangways: [{ side: -1 | 1 (west | east), z, down (the ferry's deck height, or none) }] } */
export function wharf(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 1.2, W = x1 - x0, cx = (x0 + x1) / 2;
  // the deck, its planks and kerbs
  bag.add('planks_grey', box(x0, y - 0.25, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('timber', box(x0, y - 0.55, z0, x1, y - 0.25, z1));
  for (const x of [x0 + 0.1, x1 - 0.1]) bag.add('timber', box(x - 0.1, y, z0, x + 0.1, y + 0.2, z1));
  // the piles: three in each row, a headstock on them, cross braces between; fender piles and walings at the sides
  for (let z = z0 + 1; z < z1; z += 3.5) {
    for (const x of [x0 + 0.6, cx, x1 - 0.6]) bag.add('timber', lathe([[0.2, 0], [0.18, y - 0.55 + 6.5], [0.001, y - 0.55 + 6.5]], 6, null, x, -6.5, z));
    bag.add('timber', box(x0 + 0.2, y - 0.85, z - 0.2, x1 - 0.2, y - 0.55, z + 0.2));
    for (const s of [-1, 1]) bag.add('iron', rod([cx, -1.8, z + 0.25], [cx + s * (W / 2 - 0.6), y - 0.9, z + 0.25], 0.05, 4));
  }
  for (const [x, sg] of [[x0, -1], [x1, 1]]) {
    for (let z = z0 + 0.4; z < z1; z += 2.0) bag.add('timber', box(x + sg * 0.05 - 0.15, -4, z - 0.15, x + sg * 0.05 + 0.15, y + 0.45, z + 0.15));
    for (const yy of [y - 0.6, -0.9]) bag.add('timber', box(Math.min(x + sg * 0.2, x + sg * 0.45), yy - 0.15, z0, Math.max(x + sg * 0.2, x + sg * 0.45), yy + 0.15, z1));
    for (let z = z0 + 2; z < z1 - 12; z += 7) {
      const bx = x - sg * 0.5;
      bag.add('iron', lathe([[0.2, 0], [0.18, 0.4], [0.26, 0.48], [0.26, 0.56], [0.001, 0.58]], 10, null, bx, y, z));          // the bollards
    }
  }
  for (const z of [z0 + 6, z0 + 24]) bag.add('cloth_red', lathe([[0.25, -0.06], [0.31, 0], [0.25, 0.06], [0.19, 0]], 10, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x1 - 0.15, y + 1.1, z));
  // the waiting shed and ticket office at the shore end: walls, windows, doors, the turnstiles' openings, a flat roof
  const s0 = z1 - 12, s1 = z1 - 1.5, sh = 3.6;
  bag.add('plaster_white', box(x0 + 0.8, y, s0, x1 - 0.8, y + sh, s1)); col.rect([x0 + 0.8, s0, x1 - 0.8, s1], y, y + sh);
  for (let z = s0 + 1.5; z < s1 - 1; z += 2.4) for (const x of [x0 + 0.78, x1 - 0.8]) bag.add('glass_outer', box(x, y + 1.1, z - 0.8, x + 0.02, y + 2.6, z + 0.8));
  for (let k = 0; k < 3; k++) { const u = x0 + 1.8 + k * (W - 3.6) / 2; bag.add('opening', box(u - 0.55, y, s0 - 0.02, u + 0.55, y + 2.3, s0)); }
  bag.add('steel_grey', box(x0 + 0.5, y + sh, s0 - 0.3, x1 - 0.5, y + sh + 0.35, s1 + 0.3));
  // the awning over the middle of the wharf on two rows of steel posts, the benches under it
  const a0 = z0 + 10, a1 = s0 - 0.3, ah = y + 3.3;
  for (let z = a0 + 1; z < a1; z += 5) for (const x of [cx - 1.6, cx + 1.6]) { bag.add('steel_grey', box(x - 0.08, y, z - 0.08, x + 0.08, ah, z + 0.08)); col.rect([x - 0.08, z - 0.08, x + 0.08, z + 0.08], y, ah); }
  const R = [], ex = W / 2 - 0.9;
  for (const s of [-1, 1]) R.push(cx, ah + 0.35, a0, cx + s * ex, ah, a0, cx + s * ex, ah, a1, cx, ah + 0.35, a0, cx + s * ex, ah, a1, cx, ah + 0.35, a1);
  bag.add('iron_galv', fromTriangles(both(R)));
  bag.add('steel_grey', box(cx - 0.1, ah + 0.1, a0, cx + 0.1, ah + 0.38, a1));
  // the benches: back to back along the wharf's middle, slatted seats and a shared slatted back on cast-iron end frames
  for (let z = a0 + 3; z < a1 - 2; z += 5) {
    const L = 2.0, b0 = z - L / 2, b1 = z + L / 2;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) { const u = cx + s * (0.08 + k * 0.115); bag.add('timber', box(Math.min(u, u + s * 0.09), y + 0.43, b0, Math.max(u, u + s * 0.09), y + 0.46, b1)); }   // seat slats
      for (const yy of [0.58, 0.7, 0.82]) bag.add('timber', box(Math.min(cx + s * 0.035, cx + s * 0.06), y + yy, b0, Math.max(cx + s * 0.035, cx + s * 0.06), y + yy + 0.08, b1));   // back slats
      for (const e of [b0 + 0.12, b1 - 0.12]) {
        bag.add('iron', rod([cx + s * 0.46, y, e], [cx + s * 0.44, y + 0.43, e], 0.025, 5));                       // the front leg
        bag.add('iron', box(cx + Math.min(0, s * 0.5), y + 0.4, e - 0.025, cx + Math.max(0, s * 0.5), y + 0.43, e + 0.025));   // the seat rail
        bag.add('iron', rod([cx + s * 0.44, y + 0.43, e], [cx + s * 0.4, y + 0.62, e], 0.02, 4));                  // the arm
      }
    }
    for (const e of [b0 + 0.12, b1 - 0.12]) bag.add('iron', box(cx - 0.035, y, e - 0.03, cx + 0.035, y + 0.92, e + 0.03));   // the central standard
  }
  // the gangways
  for (const g of el.gangways ?? []) {
    const sg = g.side, ex0 = sg > 0 ? x1 : x0, gz = g.z, gw = 1.7, Lg = 3.6;
    // the gallows: two posts, a beam, the chains, a counterweight
    for (const s of [-1, 1]) bag.add('steel_grey', box(ex0 - sg * 0.6 - 0.09, y, gz + s * (gw / 2 + 0.25) - 0.09, ex0 - sg * 0.6 + 0.09, y + 4.2, gz + s * (gw / 2 + 0.25) + 0.09));
    bag.add('steel_grey', box(ex0 - sg * 0.6 - 0.1, y + 4.1, gz - gw / 2 - 0.4, ex0 - sg * 0.6 + 0.1, y + 4.3, gz + gw / 2 + 0.4));
    bag.add('iron', box(ex0 - sg * 0.6 - 0.25, y + 1.6, gz - gw / 2 - 0.45, ex0 - sg * 0.6 + 0.25, y + 2.4, gz - gw / 2 - 0.3));
    const down = g.down != null, ang = down ? Math.atan2(y - g.down, Lg) : -1.05;
    const P = (d, w, h = 0) => [ex0 + sg * (Math.cos(ang) * d) , y + 0.05 - Math.sin(ang) * d + h, gz + w];
    const D = [];
    const q = (a, b, c, e) => D.push(...a, ...b, ...c, ...a, ...c, ...e);
    q(P(0, -gw / 2), P(Lg, -gw / 2), P(Lg, gw / 2), P(0, gw / 2));
    bag.add('planks_grey', fromTriangles(both(D)));
    for (let k = 1; k < 8; k++) bag.add('timber', rod(P(Lg * k / 8, -gw / 2, 0.03), P(Lg * k / 8, gw / 2, 0.03), 0.03, 4));    // the cleats
    for (const w of [-gw / 2, gw / 2]) {
      bag.add('steel_grey', rod(P(0, w, 1.0), P(Lg, w, 1.0), 0.03, 4)); bag.add('steel_grey', rod(P(0, w, 0.5), P(Lg, w, 0.5), 0.02, 4));
      for (let k = 0; k <= 3; k++) bag.add('steel_grey', rod(P(Lg * k / 3, w, 0), P(Lg * k / 3, w, 1.0), 0.025, 4));
      bag.add('iron', rod([ex0 - sg * 0.6, y + 4.1, gz + w * 1.1], P(Lg * 0.85, w, 1.0), 0.012, 3));                         // the chains
    }
    if (down) col.ramp(sg > 0 ? [ex0, gz - gw / 2, ex0 + Math.cos(ang) * Lg, gz + gw / 2] : [ex0 - Math.cos(ang) * Lg, gz - gw / 2, ex0, gz + gw / 2], g.down, y, sg > 0 ? 'w' : 'e');
  }
}

/**
 * quay_crowd: { rect (the quay's promenade), y, wharves: [{ x, y, a0, a1 }] (each wharf's middle line, deck and
 * awning's run), seed } — the people of Circular Quay on a weekday of 1973 (docs/settlements/sydney.md §1c):
 * commuters and visitors along the promenade, alone, in twos and threes, some on their way along it;
 * passengers waiting on the wharves under the awnings, standing or sitting on the benches. Dress of the time:
 * men in suits or shirt and trousers, women in dresses and skirts, a few hats.
 */
export function quayCrowd(el, { bag }) {
  let s = (el.seed ?? 1973) >>> 0 || 1; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nocol = { circle() {}, rect() {}, segment() {}, floor() {} };
  const DRESS_M = ['cloth_grey', 'cloth_black', 'cloth_indigo', 'cloth_brown', 'cloth_grey'], DRESS_W = ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon'];
  const person = (x, z, y, rot, extra = {}) => {
    const man = rand() < 0.55, c = man ? DRESS_M[Math.floor(rand() * DRESS_M.length)] : DRESS_W[Math.floor(rand() * DRESS_W.length)];
    const hair = man ? (rand() < 0.75 ? 'short' : 'long') : ['long', 'long', 'bun', 'short'][Math.floor(rand() * 4)];
    figure({ t: 'figure', at: [x, z], y, rot, seed: Math.floor(rand() * 1e9), dress: man ? 'trousers' : 'robe', cloth: c, cloth2: man ? (rand() < 0.6 ? c : 'cloth_white') : c,
      skin: rand() < 0.85 ? 'skin_light' : 'skin_medium', hat: man && rand() < 0.12 ? 'brim' : 'none', hatMat: 'cloth_grey', hair, beard: man && rand() < 0.15,
      hairMat: ['hide_black', 'hide_brown', 'hide_tan', 'hide_brown'][Math.floor(rand() * 4)], over: 'none', ...extra }, { bag, col: nocol });
  };
  // the promenade: groups scattered along it, clear of the wharves' heads
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  for (let k = 0; k < (el.n ?? 34); k++) {
    const gx = x0 + 1 + rand() * (x1 - x0 - 2), gz = z0 + 1 + rand() * (z1 - z0 - 2), size = rand() < 0.5 ? 1 : rand() < 0.7 ? 2 : 3;
    const dir = rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
    if (size === 1) { person(gx, gz, y, dir + (rand() - 0.5) * 0.8); continue; }
    for (let q = 0; q < size; q++) { const a = q / size * Math.PI * 2 + rand(), r = 0.55; person(gx + Math.cos(a) * r, gz + Math.sin(a) * r, y, Math.atan2(Math.cos(a), Math.sin(a)), { pose: 'talk' }); }
  }
  // the wharves: passengers sitting on the benches and standing about under the awnings
  for (const w of el.wharves ?? []) {
    for (let z = w.a0 + 3; z < w.a1 - 2; z += 5) {
      if (rand() < 0.65) person(w.x - 0.3, z + (rand() - 0.5) * 0.9, w.y, Math.PI / 2, { pose: 'sit' });
      if (rand() < 0.65) person(w.x + 0.3, z + (rand() - 0.5) * 0.9, w.y, -Math.PI / 2, { pose: 'sit' });
      if (rand() < 0.4) person(w.x + (rand() < 0.5 ? -2.6 : 2.6), z + 2.5, w.y, rand() * 6.28, {});
    }
  }
}
