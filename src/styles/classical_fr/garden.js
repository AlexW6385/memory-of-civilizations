// The orange trees of Versailles about 1690 (docs/settlements/versailles.md §1a, "Orange trees, chairs and
// gardeners"): set out from May to October from Hardouin-Mansart's Orangerie (1684–86), each in its square box
// of oak panels painted green between iron-bound corner posts with ball finials, the trunk clear, the crown
// clipped round, fruit and leaf together.

import { box, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** orange_trees: { at: [[x, z], …], y (or ys: one height each), seed } — the boxes and their trees. */
export function orangeTrees(el, { bag, col }) {
  const rand = rng(el.seed ?? 1686), b = 0.55;
  el.at.forEach(([x, z], i) => {
    const y = el.ys ? el.ys[i] : el.y ?? 0, s = 0.9 + rand() * 0.25;
    bag.add('shutter_green', box(x - b + 0.06, y + 0.12, z - b + 0.06, x + b - 0.06, y + 1.05, z + b - 0.06));     // the panels
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      bag.add('shutter_green', box(x + dx * b - 0.07, y, z + dz * b - 0.07, x + dx * b + 0.07, y + 1.12, z + dz * b + 0.07));   // the posts
      bag.add('iron', box(x + dx * b - 0.08, y + 0.95, z + dz * b - 0.08, x + dx * b + 0.08, y + 1.0, z + dz * b + 0.08));       // their bands
      bag.add('shutter_green', lathe([[0.04, 0], [0.08, 0.06], [0.07, 0.13], [0.001, 0.16]], 8, null, x + dx * b, y + 1.12, z + dz * b));
    }
    for (const yy of [y + 0.35, y + 0.75]) bag.add('iron', box(x - b + 0.04, yy, z - b + 0.04, x + b - 0.04, yy + 0.04, z + b - 0.04));
    bag.add('silt', box(x - b + 0.1, y + 1.0, z - b + 0.1, x + b - 0.1, y + 1.04, z + b - 0.1));                  // the earth
    const th = 1.0 * s, cr = 0.75 * s, cy = y + 1.04 + th + cr * 0.85;
    bag.add('bark_olive', lathe([[0.07, 0], [0.055, th], [0.04, th + 0.3]], 8, null, x, y + 1.04, z));
    const crown = []; for (let k = 0; k <= 8; k++) { const t = k / 8 * Math.PI; crown.push([Math.max(0.001, Math.sin(t) * cr), -Math.cos(t) * cr * 0.92]); }
    bag.add('lotus_leaf', lathe(crown, 14, (a, k) => 1 + 0.05 * Math.sin(a * 5 + k * 2), x, cy, z));
    for (let k = 0; k < 9; k++) {
      const a = rand() * Math.PI * 2, e = (rand() - 0.3) * 1.1, r = cr * 1.0;
      bag.add('paint_ochre', lathe([[0.001, -0.04], [0.04, -0.02], [0.04, 0.02], [0.001, 0.04]], 6, null, x + Math.cos(a) * Math.cos(e) * r, cy + Math.sin(e) * r * 0.92, z + Math.sin(a) * Math.cos(e) * r));
    }
    col.rect([x - b, z - b, x + b, z + b], y, y + 1.2);
  });
}
