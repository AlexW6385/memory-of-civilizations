// What stands in Cahokia's yards, on the creek bank and along the mound's stairs (docs/settlements/
// cahokia.md §5.15): the midden, the sweat lodge, the log being hollowed into a dugout, the handrail of
// the great stair. All [inferred] in arrangement. Middens of shell, bone and sherds are the daily
// record of Mississippian households; the dugout was the river peoples' boat, hollowed by fire and
// adze; the dome-shaped sweat lodge of bent saplings under hides is known to the Southeast's peoples.
import { box, lathe, rod } from '../../core/geom.js';
import { WALL, rng } from './kit.js';

const yAt = (el, x, z) => (typeof el.y === 'function' ? el.y(x, z) : el.y ?? 0);

/** midden: { c, y, seed } — a heap of ash and earth with mussel shell, bone and broken pots in it and about it. */
function midden(el, { bag }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 6), y = yAt(el, cx, cz);
  bag.add('bark_dark', lathe([[1.15, -0.1], [1.1, 0.04], [0.8, 0.2], [0.4, 0.3], [0.001, 0.34]], 10, null, cx, y, cz));
  bag.add('bark_dark', lathe([[0.7, -0.1], [0.65, 0.03], [0.3, 0.14], [0.001, 0.17]], 8, null, cx + 1.2, yAt(el, cx + 1.2, cz + 0.3), cz + 0.3));
  for (let k = 0; k < 16; k++) {
    const a = rand() * 6.28, d = Math.sqrt(rand()) * 1.25, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, yy = Math.max(y + 0.02, yAt(el, x, z)) + Math.max(0, 0.3 * (1 - d / 1.15));
    if (k % 4 === 0) bag.add('chalk', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.03], [0.001, 0.04]], 6, null, x, yy - 0.01, z));
    else if (k % 4 === 1) bag.add('ivory', rod([x, yy, z], [x + 0.12 * Math.cos(a * 3), yy + 0.02, z + 0.12 * Math.sin(a * 3)], 0.012, 4));
    else bag.add(k % 2 ? 'pottery_dark' : 'terracotta', box(x, yy, z, x + 0.07 + rand() * 0.06, yy + 0.02, z + 0.06 + rand() * 0.05));
  }
}

/** sweat_lodge: { c, y, seed } — a dome of bent saplings under hides, a low door on one side, three hoops lashed round it, a pit of stones heating before it. */
function sweatLodge(el, { bag, col }) {
  const [cx, cz] = el.c, s = (el.seed || 0) % 2 ? 1 : -1, y = yAt(el, cx, cz), lx = cx - s * 0.6;
  const prof = [[1.35, -0.1], [1.35, 0], [1.32, 0.35], [1.2, 0.75], [0.9, 1.1], [0.5, 1.35], [0.001, 1.5]];
  bag.add('hide_brown', lathe(prof, 14, null, lx, y, cz));
  for (const [r, h] of [[1.32, 0.35], [1.2, 0.75], [0.9, 1.1]]) bag.add('rope_fibre', lathe([[r + 0.012, h], [r + 0.012, h + 0.04]], 14, null, lx, y, cz));
  // the door: a low frame of two posts and a lintel, a flap of hide, the dark inside
  const dxo = lx + s * 1.3;
  bag.add('opening', box(Math.min(dxo, dxo + s * 0.12), y, cz - 0.3, Math.max(dxo, dxo + s * 0.12), y + 0.72, cz + 0.3));
  for (const sd of [-1, 1]) bag.add('timber', rod([dxo + s * 0.14, y - 0.1, cz + sd * 0.36], [dxo + s * 0.14, y + 0.8, cz + sd * 0.36], 0.04, 5));
  bag.add('timber', rod([dxo + s * 0.14, y + 0.78, cz - 0.4], [dxo + s * 0.14, y + 0.78, cz + 0.4], 0.035, 5));
  bag.add('hide_tan', box(Math.min(dxo + s * 0.17, dxo + s * 0.2), y + 0.1, cz + 0.4, Math.max(dxo + s * 0.17, dxo + s * 0.2), y + 0.75, cz + 0.95));
  col.circle(lx, cz, 1.3, y, y + 1.4);
  // the pit of heating stones: a ring, a low fire, stones to carry in
  const px = lx + s * 2.5, pz = cz + 0.2, py = yAt(el, px, pz);
  bag.add('bark_dark', lathe([[0.5, 0], [0.42, 0.04], [0.001, 0.04]], 10, null, px, py, pz));
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; bag.add('granite_grey', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.1], [0.001, 0.13]], 6, null, px + Math.cos(a) * 0.45, py - 0.01, pz + Math.sin(a) * 0.45)); }
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4; bag.add('timber', rod([px + Math.cos(a) * 0.35, py + 0.05, pz + Math.sin(a) * 0.35], [px, py + 0.13, pz], 0.035, 5)); }
  bag.add('flame', lathe([[0.12, 0], [0.09, 0.1], [0.04, 0.24], [0.001, 0.34]], 8, (th) => 1 + 0.25 * Math.sin(th * 3), px, py + 0.06, pz));
  col.circle(px, pz, 0.55, py, py + 0.2);
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.18, 0.12], [0.17, 0.2], [0.001, 0.2]], 10, null, lx + s * 1.9, y, cz - 0.9));
}

/** canoe_works: { c, y, seed } — a cottonwood log on two crossed cradles, its upper side charred and hollowed along the middle, embers still in the trough, an adze and a pot of water by it, a heap of chips. The log lies along x. */
function canoeWorks(el, { bag, col }) {
  const [cx, cz] = el.c, rand = rng(el.seed || 5), L = 5.6, R = 0.42;
  const base = Math.max(yAt(el, cx - 1.7, cz), yAt(el, cx + 1.7, cz), yAt(el, cx, cz)), yc = base + 0.78;
  bag.add('log_pine', rod([cx - L / 2, yc, cz], [cx + L / 2, yc, cz], R, 12));
  bag.add('log_pine', lathe([[0.001, 0], [R, 0]], 12).rotateZ(Math.PI / 2).translate(cx - L / 2, yc, cz));
  bag.add('log_pine', lathe([[R, 0], [0.001, 0]], 12).rotateZ(Math.PI / 2).translate(cx + L / 2, yc, cz));
  for (const px of [cx - 1.7, cx + 1.7]) {
    const yb = yAt(el, px, cz);
    bag.add('timber', rod([px, yb - 0.1, cz - 0.75], [px, yc - 0.1, cz + 0.12], 0.07, 6));
    bag.add('timber', rod([px, yb - 0.1, cz + 0.75], [px, yc - 0.1, cz - 0.12], 0.07, 6));
  }
  const yt = yc + R - 0.045;
  bag.add('bark_dark', box(cx - 2.1, yt, cz - 0.2, cx + 2.1, yt + 0.03, cz + 0.2));
  for (let k = 0; k < 5; k++) bag.add('flame', lathe([[0.07, 0], [0.05, 0.05], [0.001, 0.14]], 6, (th) => 1 + 0.25 * Math.sin(th * 3), cx - 1.6 + k * 0.8 + rand() * 0.2, yt + 0.02, cz));
  col.segment([cx - L / 2, cz], [cx + L / 2, cz], R + 0.05, base, yc + R);
  const ax = cx + 1.0, az = cz + 1.4, ya = yAt(el, ax, az);
  bag.add('timber', rod([ax - 0.4, ya + 0.04, az], [ax + 0.3, ya + 0.12, az + 0.05], 0.022, 5));
  bag.add('flagstone', box(ax + 0.25, ya + 0.1, az - 0.02, ax + 0.42, ya + 0.16, az + 0.1));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.12, 0.02], [0.2, 0.13], [0.21, 0.24], [0.15, 0.33], [0.001, 0.32]], 10, null, cx - 1.2, yAt(el, cx - 1.2, cz - 1.3), cz - 1.3));
  bag.add('bark_dark', lathe([[0.9, -0.1], [0.85, 0.03], [0.4, 0.13], [0.001, 0.16]], 8, null, cx + 0.2, yAt(el, cx + 0.2, cz - 1.6), cz - 1.6));
  for (let k = 0; k < 8; k++) { const x = cx - 2.6 + rand() * 5.2, z = cz + (rand() < 0.5 ? -1 : 1) * (0.9 + rand() * 1.4); bag.add('timber', box(x, yAt(el, x, z), z, x + 0.12, yAt(el, x, z) + 0.02, z + 0.04)); }
  void WALL;
}

/**
 * stair_rail: { from, to, half, y, step } — a handrail of posts and two cords of poles along each edge
 * of a stair, the posts every `step` metres, standing on the ground, the rails following the slope.
 */
function stairRail(el, { bag, col }) {
  const [ax, az] = el.from, [bx, bz] = el.to, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, half = el.half ?? 4.4, n = Math.max(2, Math.round(L / (el.step ?? 2.5)));
  for (const sd of [-1, 1]) {
    let prev = null;
    for (let k = 0; k <= n; k++) {
      const x = ax + ux * L * k / n + nx * half * sd, z = az + uz * L * k / n + nz * half * sd, y = yAt(el, x, z);
      bag.add(k % 3 === 0 ? 'timber_red' : 'timber', rod([x, y - 0.4, z], [x, y + 1.15, z], 0.07, 6));
      col.circle(x, z, 0.08, y - 0.2, y + 1.15);
      if (prev) for (const h of [0.55, 1.05]) bag.add('timber', rod([prev[0], prev[2] + h, prev[1]], [x, y + h, z], 0.035, 5));
      if (prev) for (const h of [0.55, 1.05]) bag.add('rope_fibre', rod([x, y + h - 0.05, z], [x, y + h + 0.05, z], 0.05, 5));
      prev = [x, z, y];
    }
  }
}

export const yardElements = { midden, sweat_lodge: sweatLodge, canoe_works: canoeWorks, stair_rail: stairRail };
