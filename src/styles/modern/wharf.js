// A ferry wharf at Circular Quay as in 1973 (docs/settlements/sydney.md §1c): a hardwood deck on rows of timber piles
// with their headstocks and braces, fender piles and walings down both sides where the ferries berth, the waiting
// shed and ticket office at the shore end, a long awning on steel posts over the middle, benches, bollards and
// life buoys; at each berth a gangway on its gallows — two posts, a beam and the chains — lowered onto a ferry's
// deck where one lies alongside, raised where none does.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

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
  for (let z = a0 + 3; z < a1 - 2; z += 5) bag.add('timber', box(cx - 0.9, y + 0.42, z - 0.9, cx + 0.9, y + 0.48, z + 0.9));
  for (let z = a0 + 3; z < a1 - 2; z += 5) for (const s of [-0.7, 0.7]) bag.add('iron', box(cx + s - 0.04, y, z - 0.8, cx + s + 0.04, y + 0.42, z + 0.8));
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
