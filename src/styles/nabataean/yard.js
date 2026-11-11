// The yards of the valley's empty lots (docs/settlements/petra.md §18): a dry-stone wall round each, a gate toward the street, and
// inside, by kind — an orchard (an irrigation runnel and its stone border, a hut), a pen (a lean-to of palm fronds, a stone
// manger), a threshing floor (the paved ring, the post, sheaves), a potter's yard (the kiln, the drying shelf, the clay pit), a
// cistern court (the plastered tank with its lid and mouth, the settling basin, a channel down the slope), a camp of tents
// (black goat-hair, pyramid-roofed, their doors, a hearth of stones, a carpet). The beasts, pots and people are life
// elements (src/settlements/petra/dressing.js).

import { box, lathe } from '../../core/geom.js';

const R = 'sandstone_rose', A = 'sandstone_rose_ashlar', ST = 'schist_rubble';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** petra_yard: { rect, kind, seed, y, gate ('n' | 's') }. */
export function yard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed), k = el.kind, hw = k === 'pen' ? 1.35 : k === 'tents' ? 0.0 : 0.95, T = 0.42;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, gz = el.gate === 's' ? z1 : z0, gw = 1.9, gx = cx + (rand() - 0.5) * 3;
  const WM = rand() < 0.5 ? R : ST, wall = (a0, b0, a1, b1, h = hw) => { bag.add(WM, box(a0, y - 1.6, b0, a1, y + h, b1)); bag.add(A, box(a0 - 0.03, y + h, b0 - 0.03, a1 + 0.03, y + h + 0.1, b1 + 0.03)); col.rect([a0, b0, a1, b1], y - 1.6, y + h + 0.1); };
  const floor = (a0, b0, a1, b1, mat) => bag.add(mat, box(a0, y - 0.35, b0, a1, y + 0.03, b1));
  const sx = (a, b) => [Math.min(a, b), Math.max(a, b)];
  if (hw > 0) {
    // the wall: the four sides, the gate's gap in the street side, a stone sill in it
    const nz = el.gate === 's' ? [z1 - T, z1] : [z0, z0 + T], oz = el.gate === 's' ? [z0, z0 + T] : [z1 - T, z1];
    wall(x0, oz[0], x1, oz[1]);
    wall(x0, nz[0], gx - gw / 2, nz[1]); wall(gx + gw / 2, nz[0], x1, nz[1]);
    wall(x0, z0 + T, x0 + T, z1 - T); wall(x1 - T, z0 + T, x1, z1 - T);
    bag.add(A, box(gx - gw / 2, y - 0.1, nz[0], gx + gw / 2, y + 0.05, nz[1]));                    // the stone sill of the gate
  }
  const dz = el.gate === 's' ? 1 : -1;                                       // from the gate into the yard: -dz
  const inner = [x0 + T + 0.2, z0 + T + 0.2, x1 - T - 0.2, z1 - T - 0.2];
  if (k === 'orchard') {
    floor(...inner.slice(0, 2), ...inner.slice(2), 'silt');
    // the irrigation runnel across the yard, a stone border either side, its water, and the little hut of palm fronds at the back
    const rz = cz + (rand() - 0.5) * 2;
    bag.add(R, box(inner[0], y, rz - 0.3, inner[2], y + 0.14, rz + 0.3)); bag.add('water', box(inner[0], y + 0.1, rz - 0.18, inner[2], y + 0.115, rz + 0.18));
    const bz = el.gate === 's' ? [z0 + T + 0.4, z0 + T + 2.4] : [z1 - T - 2.4, z1 - T - 0.4], hx = x0 + T + 0.4;
    bag.add(ST, box(hx, y - 0.3, bz[0], hx + 2.6, y + 1.5, bz[1])); bag.add('thatch_palm', box(hx - 0.2, y + 1.5, bz[0] - 0.2, hx + 2.8, y + 1.7, bz[1] + 0.2)); bag.add('opening', box(hx + 1.0, y, el.gate === 's' ? bz[1] - 0.02 : bz[0] - 0.02, hx + 1.9, y + 1.25, el.gate === 's' ? bz[1] + 0.01 : bz[0] + 0.01));
    col.rect([hx, bz[0], hx + 2.6, bz[1]], y, y + 1.7);
  } else if (k === 'pen') {
    floor(inner[0], inner[1], inner[2], inner[3], 'silt');
    const bz = el.gate === 's' ? [inner[1], inner[1] + 2.2] : [inner[3] - 2.2, inner[3]];
    for (const px of [inner[0] + 0.1, inner[0] + 4.6]) bag.add('timber', box(px, y, bz[0], px + 0.12, y + 2.1, bz[0] + 0.12));
    bag.add('thatch_palm', box(inner[0], y + 2.05, bz[0] - 0.3, inner[0] + 4.9, y + 2.22, bz[1])); bag.add('timber', box(inner[0] + 4.55, y, bz[1] - 0.12, inner[0] + 4.67, y + 2.1, bz[1]));
    bag.add(R, box(cx - 1.4, y, cz - 0.25, cx + 1.4, y + 0.5, cz + 0.25)); bag.add(ST, box(cx - 1.25, y + 0.35, cz - 0.12, cx + 1.25, y + 0.5, cz + 0.12));      // the manger
    col.rect([cx - 1.4, cz - 0.25, cx + 1.4, cz + 0.25], y, y + 0.5);
  } else if (k === 'threshing') {
    const r = 4.1;
    bag.add('pebbles', lathe([[r, -0.2], [r, 0.05], [0.001, 0.05]], 28, null, cx, y, cz)); bag.add(R, lathe([[r + 0.25, -0.3], [r + 0.25, 0.1], [r, 0.1], [r, -0.3]], 28, null, cx, y, cz));
    bag.add('timber', box(cx - 0.07, y, cz - 0.07, cx + 0.07, y + 1.5, cz + 0.07));
    for (let i = 0; i < 4; i++) { const a = rand() * 6.28, d = 5.0 + rand(), sx0 = cx + Math.cos(a) * 2.6, sz0 = cz + Math.sin(a) * 2.6; bag.add('thatch', lathe([[0.55, 0], [0.5, 0.25], [0.3, 0.55], [0.001, 0.8]], 8, null, sx0, y + 0.05, sz0)); }
    // a low wall on the windward side only, the stone roller by the floor's edge
    wall(x0, z0, x1, z0 + T, 0.7);
    bag.add(R, lathe([[0.001, 0], [0.34, 0], [0.34, 0.9], [0.001, 0.9]], 10, null, x1 - 1.8, y + 0.0, z1 - 1.5));
  } else if (k === 'potter') {
    // the kiln: a dome of baked clay on a drum, the firing mouth, its chimney; the drying shelf along the wall; the clay pit sunk in the corner
    const kx = x1 - 3.2, kz = el.gate === 's' ? z0 + 3.2 : z1 - 3.2;
    floor(inner[0], inner[1], inner[2], inner[3], 'sandstone_yellow');
    bag.add('brick_baked', lathe([[1.5, -0.4], [1.5, 0.8], [1.3, 1.5], [0.8, 2.1], [0.25, 2.4], [0.001, 2.4]], 16, null, kx, y, kz)); bag.add('opening', box(kx - 0.35, y, dz > 0 ? kz + 1.44 : kz - 1.52, kx + 0.35, y + 0.8, dz > 0 ? kz + 1.52 : kz - 1.44));
    col.circle(kx, kz, 1.55, y, y + 2.4);
    const sz = el.gate === 's' ? z1 - T - 1.4 : z0 + T + 0.2;
    bag.add('timber', box(x0 + T + 0.3, y + 0.35, sz, x0 + T + 5.0, y + 0.42, sz + 1.1)); for (const q of [0.35, 2.4, 4.9]) bag.add('timber', box(x0 + T + q, y, sz + 0.05, x0 + T + q + 0.1, y + 0.4, sz + 1.05));
    col.rect([x0 + T + 0.3, sz, x0 + T + 5.0, sz + 1.1], y, y + 0.42);
    bag.add('mud_plaster', lathe([[1.1, 0], [1.1, 0.12], [0.0, 0.12]], 12, null, x0 + T + 2.0, y - 0.0, cz));
  } else if (k === 'cistern') {
    // the tank: plastered walls to knee height, a lid of slabs with a stone mouth, a settling basin in front, a channel in from the slope
    const tx = cx, tz = cz + dz * 0.0, W = 4.2, D = 2.8;
    bag.add('lime_plaster', box(tx - W / 2, y - 0.3, tz - D / 2, tx + W / 2, y + 0.62, tz + D / 2)); col.rect([tx - W / 2, tz - D / 2, tx + W / 2, tz + D / 2], y, y + 0.62);
    bag.add(R, box(tx - W / 2 - 0.1, y + 0.62, tz - D / 2 - 0.1, tx + W / 2 + 0.1, y + 0.7, tz + D / 2 + 0.1));
    bag.add(R, lathe([[0.5, 0], [0.5, 0.2], [0.34, 0.2], [0.34, 0.1], [0.001, 0.1]], 12, null, tx + 0.8, y + 0.7, tz)); bag.add('opening', lathe([[0.3, 0], [0.001, 0]], 10, null, tx + 0.8, y + 0.805, tz));
    bag.add(R, box(tx - W / 2 - 1.8, y, tz - 0.5, tx - W / 2 - 0.2, y + 0.4, tz + 0.5)); bag.add('water', box(tx - W / 2 - 1.7, y + 0.34, tz - 0.4, tx - W / 2 - 0.3, y + 0.355, tz + 0.4));
    bag.add(R, box(inner[0], y, tz - 0.12, tx - W / 2 - 1.8, y + 0.1, tz + 0.12));
    col.rect([tx - W / 2 - 1.8, tz - 0.5, tx - W / 2 - 0.2, tz + 0.5], y, y + 0.4);
  } else if (k === 'tents') {
    // two or three tents of black goat hair: a pyramid roof on poles, a door in the front, the skirts, a carpet and a hearth before
    const n = 2 + Math.floor(rand() * 2);
    for (let i = 0; i < n; i++) {
      const tx = x0 + 2.6 + i * (x1 - x0 - 5.2) / Math.max(1, n - 1) + (rand() - 0.5) * 0.8, tz = cz + (rand() - 0.5) * 3, s = 0.9 + rand() * 0.35, a = Math.PI / 4;
      bag.add('cloth_black', lathe([[2.5 * s, 0.55], [2.5 * s, 1.15], [0.12, 2.5 * s]], 4, null, tx, y, tz).rotateY(a));
      bag.add('cloth_black', lathe([[2.5 * s, 0.02], [2.5 * s, 0.6]], 4, null, tx, y, tz).rotateY(a));
      bag.add('timber', box(tx - 0.05, y, tz - 0.05, tx + 0.05, y + 2.7 * s, tz + 0.05));
      const fz = el.gate === 's' ? tz + 1.74 * s : tz - 1.74 * s;
      bag.add('opening', box(tx - 0.55, y, fz - 0.02, tx + 0.55, y + 1.5, fz + 0.02));
      bag.add('reed_mat', box(tx - 1.0, y, fz + (dz > 0 ? 0.1 : -1.9), tx + 1.0, y + 0.02, fz + (dz > 0 ? 1.9 : -0.1)));
      for (let q = 0; q < 6; q++) { const t = q / 6 * 6.28; bag.add(ST, lathe([[0.1, 0], [0.07, 0.1], [0.001, 0.12]], 6, null, tx + Math.cos(t) * 0.28, y, fz + dz * 2.6 + Math.sin(t) * 0.28)); }
      col.circle(tx, tz, 1.7 * s, y, y + 2.0);
    }
  }
}
