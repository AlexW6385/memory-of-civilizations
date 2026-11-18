// The upper rooms of the palace (docs/settlements/knossos.md §4j): the Piano Nobile hall of the West Wing, reached by its stair from the
// court; the hall of the East Wing's first floor, the loggia on the gallery over the east portico, and the upper chambers
// that open off the landings of the Grand Staircase. The rooms themselves are cut in the wings (el.up of the wing, index.js);
// here are their painted dado, their benches, columns, couches and chests, and the lamps.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { minoanColumn as column, minoanHorns as horns } from './index.js';

const G = 'gypsum_minoan', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hashAt = (x, z, seed = 0) => rng(Math.floor(x * 131.7 + z * 977.3 + seed * 7919) + 17);
const cupL = lathe([[0.001, 0], [0.03, 0], [0.05, 0.07], [0.045, 0.07], [0.025, 0.01], [0.001, 0.01]], 7);

/** The runs of an edge of [a, b] left after taking out the gaps (doorways: [g0, g1]) and a margin round each. */
function runs(a, b, gaps, m = 0) {
  let out = [[a, b]];
  for (const [g0, g1] of gaps) out = out.flatMap(([p, q]) => (g1 + m <= p || g0 - m >= q ? [[p, q]] : [[p, Math.min(q, g0 - m)], [Math.max(p, g1 + m), q]].filter(([u, v]) => v - u > 0.05)));
  return out;
}

/** upper_room: { rect (the room's floor, as cut in its wing), y (the floor), h (the clear height), kind: 'pianohall' | 'hall' | 'chamber', seed, gaps: [[side, a, b]…] (doorways and openings in its edges: side 'n' | 's' | 'w' | 'e', a..b along the edge) }. */
function upperRoom(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 3.0, kind = el.kind ?? 'hall', seed = el.seed || 1;
  const gap = (s) => (el.gaps ?? []).filter((g) => g[0] === s).map((g) => [g[1], g[2]]);
  const B = (mat, a0, b0, a1, b1, ya, yb, solid = false) => { bag.add(mat, box(a0, y + ya, b0, a1, y + yb, b1)); if (solid) col.rect([a0, b0, a1, b1], y + ya, y + yb); };
  // the dado along the walls: a red band over the gypsum, a black rule and a white one over it, broken at the doorways
  const dado = (a, b, side) => {
    for (const [p, q] of runs(a, b, gap(side), 0.08)) {
      const bandAt = (mat, v0, v1, d) => {
        if (side === 'n') B(mat, p, z0, q, z0 + d, v0, v1); else if (side === 's') B(mat, p, z1 - d, q, z1, v0, v1);
        else if (side === 'w') B(mat, x0, p, x0 + d, q, v0, v1); else B(mat, x1 - d, p, x1, q, v0, v1);
      };
      bandAt(RED, 0.7, 1.0, 0.03); bandAt(BLK, 1.0, 1.05, 0.036); bandAt('plaster_white', 1.05, 1.09, 0.03);
    }
  };
  dado(x0, x1, 'n'); dado(x0, x1, 's'); dado(z0, z1, 'w'); dado(z0, z1, 'e');
  // a bench of gypsum along the long walls, the doorways kept clear
  const bench = (side, w = 0.5) => {
    const [a, b] = side === 'n' || side === 's' ? [x0, x1] : [z0, z1];
    for (const [p, q] of runs(a + 0.35, b - 0.35, gap(side), 1.3)) {
      if (q - p < 1.2) continue;
      if (side === 'n') B(G, p, z0 + 0.03, q, z0 + 0.03 + w, 0, 0.45, true); else if (side === 's') B(G, p, z1 - 0.03 - w, q, z1 - 0.03, 0, 0.45, true);
      else if (side === 'w') B(G, x0 + 0.03, p, x0 + 0.03 + w, q, 0, 0.45, true); else B(G, x1 - 0.03 - w, p, x1 - 0.03, q, 0, 0.45, true);
    }
  };
  const lamp = (x, z, k = 1) => {
    bag.add('timber', box(x - 0.04, y, z - 0.04, x + 0.04, y + 1.5, z + 0.04)); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.05], [0.13, 0.1], [0.001, 0.1]], 8).translate(x, y + 1.5, z));
    bag.add(G, lathe([[0.001, 0], [0.2, 0], [0.2, 0.06], [0.001, 0.06]], 10).translate(x, y, z)); col.circle(x, z, 0.22, y, y + 1.5);
    lights.push({ at: [x, y + 1.7, z], color: '#ffb46b', intensity: 3.6 * k, distance: 11 });
  };
  const table = (cx, cz, w, d, s) => {
    B('timber', cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2, 0.66, 0.72, false);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B('timber', cx + a * (w / 2 - 0.06) - 0.03, cz + b * (d / 2 - 0.06) - 0.03, cx + a * (w / 2 - 0.06) + 0.03, cz + b * (d / 2 - 0.06) + 0.03, 0, 0.66);
    col.rect([cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2], y, y + 0.72);
    const r = hashAt(cx, cz, s);
    for (let i = 0; i < 4; i++) bag.add('terracotta', cupL.clone().scale(1.7, 1.7, 1.7).translate(cx - w / 2 + 0.2 + r() * (w - 0.4), y + 0.72, cz - d / 2 + 0.15 + r() * (d - 0.3)));
    B('wood_dark', cx - 0.2, cz + d / 2 + 0.25, cx + 0.2, cz + d / 2 + 0.65, 0, 0.4, false);
  };
  const chest = (x, z, rot, s) => {
    const r = hashAt(x, z, s), w = 0.85 + r() * 0.3, d = 0.48 + r() * 0.1;
    const [a, b] = rot ? [d, w] : [w, d];
    B('wood_dark', x - a / 2, z - b / 2, x + a / 2, z + b / 2, 0, 0.5, true); B('timber', x - a / 2 - 0.02, z - b / 2 - 0.02, x + a / 2 + 0.02, z + b / 2 + 0.02, 0.5, 0.57);
    B('bronze', x - (rot ? 0.2 : 0.03), z - (rot ? 0.03 : 0.2), x + (rot ? 0.2 : 0.03), z + (rot ? 0.03 : 0.2), 0.3, 0.42);
  };
  const jar = (x, z, s) => {
    const k = 0.5 + (hashAt(x, z, s)() * 0.12), pr = [[0.001, 0], [0.24 * k, 0], [0.4 * k, 0.4 * k], [0.47 * k, 0.8 * k], [0.5 * k, 0.82 * k], [0.47 * k, 0.86 * k], [0.46 * k, 1.05 * k], [0.34 * k, 1.47 * k], [0.38 * k, 1.52 * k], [0.3 * k, 1.55 * k], [0.001, 1.5 * k]];
    bag.add('terracotta', lathe(pr, 10).rotateY(hashAt(x, z, s)() * 6).translate(x, y, z)); col.circle(x, z, 0.47 * k, y, y + 1.5 * k);
  };
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (kind === 'hall' || kind === 'pianohall') {
    for (const s of ['n', 's', 'w', 'e']) bench(s);
    // two columns of cypress on gypsum bases carry the ceiling beams of the broad hall
    const cy = kind === 'pianohall' ? [[cx - 0.0, z0 + (z1 - z0) * 0.3], [cx - 0.0, z0 + (z1 - z0) * 0.7]] : [[x0 + (x1 - x0) * 0.38, cz - 2.6], [x0 + (x1 - x0) * 0.38, cz + 2.6], [x0 + (x1 - x0) * 0.68, cz - 2.6], [x0 + (x1 - x0) * 0.68, cz + 2.6]];
    for (const [px, pz] of cy) column(bag, col, px, pz, y, h - 0.25, 0.26);
    table(cx + (kind === 'pianohall' ? 0.6 : 0), cz, 1.6, 0.8, seed);
    // the lamps at the corners, a jar by each doorway
    for (const [px, pz] of [[x0 + 0.9, z0 + 0.9], [x1 - 0.9, z0 + 0.9], [x1 - 0.9, z1 - 0.9], [x0 + 0.9, z1 - 0.9]]) lamp(px, pz);
    if (kind === 'pianohall') {
      // the shrine at the back: a platform of gypsum with the horns of consecration and the double axe between them
      const sx = x0 + 0.6, sz = z0 + (z1 - z0) * 0.5;
      B(G, sx - 0.5, sz - 1.1, sx + 0.9, sz + 1.1, 0, 0.5, true); horns(bag, sx + 0.2, y + 0.5, sz - 0.5, 0.7, false); horns(bag, sx + 0.2, y + 0.5, sz + 0.5, 0.7, false);
      B('wood_dark', sx + 0.15, sz - 0.03, sx + 0.25, sz + 0.03, 0.5, 1.8); B('bronze', sx + 0.1, sz - 0.4, sx + 0.3, sz + 0.4, 1.5, 1.68);
      for (let i = 0; i < 3; i++) jar(x1 - 1.2 - i * 1.4, z0 + 0.9, seed + i);
      chest(x1 - 0.9, cz + 3, true, seed);
    } else {
      jar(x1 - 1.2, z1 - 1.0, seed); jar(x1 - 2.3, z1 - 0.95, seed + 1); chest(x1 - 0.8, cz - 1.5, true, seed + 2);
    }
  } else {
    // a chamber: the couch with its mattress and coverlet, chests, a brazier, mats on the floor, a lamp stand
    const bx = x0 + 1.3, bz = z1 - 1.2;
    B('timber', bx - 0.6, bz - 0.55, bx + 0.6, bz + 0.55, 0, 0.45, true); B('linen', bx - 0.55, bz - 0.5, bx + 0.55, bz + 0.5, 0.45, 0.55, false);
    B('cloth_red', bx - 0.55, bz - 0.5, bx + 0.55, bz, 0.55, 0.59, false); B('cloth_white', bx - 0.5, bz + 0.15, bx + 0.5, bz + 0.45, 0.55, 0.66, false);
    B('wood_dark', bx - 0.65, bz + 0.5, bx + 0.65, bz + 0.58, 0.45, 1.0, false);
    chest(x1 - 1.2, z1 - 0.8, false, seed); chest(x1 - 2.8, z1 - 0.8, false, seed + 1);
    const fx = cx + 1.5, fz = cz - 0.6;
    B('rubble', fx - 0.5, fz - 0.5, fx + 0.5, fz + 0.5, 0, 0.2, true); B('lacquer_black', fx - 0.38, fz - 0.38, fx + 0.38, fz + 0.38, 0.2, 0.215);
    B('reed_mat', cx - 2.0, cz - 1.6, cx + 0.2, cz + 0.4, 0, 0.03, false); B('reed_mat', cx - 0.9, cz + 0.9, cx + 1.2, cz + 2.0, 0, 0.03, false);
    lamp(x0 + 0.8, z0 + 0.8); lamp(x1 - 0.8, z0 + 0.8, 0.8);
    jar(x1 - 0.9, z0 + 1.2, seed);
  }
}

/** loggia_column: { at, y, h }: a red column at the open edge of a loggia. */
function loggiaColumn(el, { bag, col }) { column(bag, col, el.at[0], el.at[1], el.y, el.h, 0.2); }

Object.assign(STYLES.minoan.elements, { upper_room: upperRoom, loggia_column: loggiaColumn });
