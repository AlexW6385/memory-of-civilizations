// The palm gardens of the wadi floor (docs/settlements/shibam.md §6): each plot walled in mud, a gate gap on one side with its two posts of lime,
// a ditch of the flood water along the foot of the wall (the sayl led in by channels), a hut of palm fronds in some, the whitewashed cap on the wall.
import { box, rod, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const TH = 0.5, H = 2.0, GAP = 2.4;

/** garden_plot: { rect, y (the ground's level), gate ('n'|'s'|'e'|'w'), seed } */
function gardenPlot(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? -2.5, r = rng(el.seed), g = el.gate;
  const seg = (a0, b0, a1, b1) => {
    if (a1 - a0 < 0.05 || b1 - b0 < 0.05) return;
    bag.add('mud_plaster', box(a0, y - 1.2, b0, a1, y + H, b1)); bag.add('lime_plaster', box(a0 - 0.04, y + H, b0 - 0.04, a1 + 0.04, y + H + 0.1, b1 + 0.04));
    col.rect([a0, b0, a1, b1], y - 1.2, y + H + 0.1);
  };
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, h = GAP / 2;
  // north and south walls (with the gap on the gate's side), then west and east
  if (g === 'n') { seg(x0, z0, cx - h, z0 + TH); seg(cx + h, z0, x1, z0 + TH); } else seg(x0, z0, x1, z0 + TH);
  if (g === 's') { seg(x0, z1 - TH, cx - h, z1); seg(cx + h, z1 - TH, x1, z1); } else seg(x0, z1 - TH, x1, z1);
  if (g === 'w') { seg(x0, z0 + TH, x0 + TH, cz - h); seg(x0, cz + h, x0 + TH, z1 - TH); } else seg(x0, z0 + TH, x0 + TH, z1 - TH);
  if (g === 'e') { seg(x1 - TH, z0 + TH, x1, cz - h); seg(x1 - TH, cz + h, x1, z1 - TH); } else seg(x1 - TH, z0 + TH, x1, z1 - TH);
  // the gate's posts: two taller piers of lime, a palm-trunk lintel
  const post = (a, b) => { bag.add('lime_plaster', box(a - 0.3, y - 1.2, b - 0.3, a + 0.3, y + H + 0.7, b + 0.3)); col.rect([a - 0.3, b - 0.3, a + 0.3, b + 0.3], y, y + H + 0.7); };
  if (g === 'n' || g === 's') { const zz = g === 'n' ? z0 + TH / 2 : z1 - TH / 2; post(cx - h - 0.15, zz); post(cx + h + 0.15, zz); bag.add('palm_trunk', rod([cx - h - 0.3, y + 2.35, zz], [cx + h + 0.3, y + 2.35, zz], 0.1, 6)); }
  else { const xx = g === 'w' ? x0 + TH / 2 : x1 - TH / 2; post(xx, cz - h - 0.15); post(xx, cz + h + 0.15); bag.add('palm_trunk', rod([xx, y + 2.35, cz - h - 0.3], [xx, y + 2.35, cz + h + 0.3], 0.1, 6)); }
  // the ditch along the foot of the wall opposite the gate: two low banks of mud and the water between
  const horiz = g === 'n' || g === 's', far = g === 'n' || g === 'w' ? 1 : -1;
  if (horiz) { const zz = far > 0 ? z1 - TH - 0.9 : z0 + TH + 0.3; bag.add('mud_plaster', box(x0 + TH, y, zz, x1 - TH, y + 0.28, zz + 0.2)); bag.add('mud_plaster', box(x0 + TH, y, zz + 0.6, x1 - TH, y + 0.28, zz + 0.8)); bag.add('water', box(x0 + TH, y, zz + 0.2, x1 - TH, y + 0.16, zz + 0.6)); }
  else { const xx = far > 0 ? x1 - TH - 0.9 : x0 + TH + 0.3; bag.add('mud_plaster', box(xx, y, z0 + TH, xx + 0.2, y + 0.28, z1 - TH)); bag.add('mud_plaster', box(xx + 0.6, y, z0 + TH, xx + 0.8, y + 0.28, z1 - TH)); bag.add('water', box(xx + 0.2, y, z0 + TH, xx + 0.6, y + 0.16, z1 - TH)); }
  // a hut of palm fronds in some plots: four posts, a thatch roof, a bench of palm ribs
  if (r() < 0.4) {
    const hx = x0 + 3 + r() * (x1 - x0 - 8), hz = z0 + 3 + r() * (z1 - z0 - 8);
    for (const [dx, dz] of [[0, 0], [2.6, 0], [0, 2], [2.6, 2]]) bag.add('palm_trunk', rod([hx + dx, y, hz + dz], [hx + dx, y + 2.1 - dz * 0.1, hz + dz], 0.07, 5));
    bag.add('thatch_palm', box(hx - 0.3, y + 2.0, hz - 0.3, hx + 2.9, y + 2.25, hz + 2.3)); bag.add('reed_mat', box(hx + 0.3, y, hz + 0.4, hx + 2.3, y + 0.03, hz + 1.6));
  }
}

/**
 * graveyard: { rect, y, seed } — the burial ground outside the town: rows of low graves of piled stones and mud with an upright stone at head and
 * foot, all aligned north–south, and a whitewashed domed tomb (qubba) of a saint at its edge.
 */
function graveyard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? -2.4, r = rng(el.seed);
  for (let x = x0 + 2; x < x1 - 8; x += 2.1) for (let z = z0 + 2; z < z1 - 2; z += 3.4) {
    if (r() < 0.12) continue;
    const jx = x + (r() - 0.5) * 0.5, jz = z + (r() - 0.5) * 0.7, L = 1.7 + r() * 0.5;
    bag.add('schist_rubble', box(jx - 0.32, y - 0.3, jz, jx + 0.32, y + 0.2 + r() * 0.12, jz + L));
    bag.add('mud_plaster', box(jx - 0.22, y + 0.2, jz + 0.1, jx + 0.22, y + 0.3, jz + L - 0.1));
    bag.add('schist_rubble', box(jx - 0.14, y, jz - 0.06, jx + 0.14, y + 0.55 + r() * 0.2, jz + 0.06)); bag.add('schist_rubble', box(jx - 0.12, y, jz + L, jx + 0.12, y + 0.4, jz + L + 0.07));
  }
  // the qubba: a cube of whitewashed brick, a dome, a finial; a door in the south face
  const qx = x1 - 4, qz = (z0 + z1) / 2, hw = 1.9, c = 3.0;
  bag.add('lime_plaster', box(qx - hw, y - 1, qz - hw, qx + hw, y + c, qz + hw)); col.rect([qx - hw, qz - hw, qx + hw, qz + hw], y - 1, y + c + 2);
  bag.add('lime_plaster', box(qx - hw - 0.12, y + c, qz - hw - 0.12, qx + hw + 0.12, y + c + 0.22, qz + hw + 0.12));
  bag.add('lime_plaster', lathe([[0.001, 0], [1.5, 0], [1.72, 0.18], [1.65, 0.65], [1.3, 1.25], [0.7, 1.75], [0.25, 1.98], [0.001, 2.05]], 14, null, qx, y + c + 0.22, qz));
  bag.add('iron', rod([qx, y + c + 2.2, qz], [qx, y + c + 3.0, qz], 0.03, 4)); bag.add('iron', lathe([[0.001, 0], [0.12, 0.03], [0.001, 0.2]], 8, null, qx, y + c + 2.9, qz));
  for (const d of [-1.1, 1.1]) bag.add('opening', box(qx + d - 0.2, y + 1.6, qz + hw - 0.02, qx + d + 0.2, y + 2.4, qz + hw + 0.02));
  bag.add('opening', box(qx - 0.45, y, qz + hw - 0.02, qx + 0.45, y + 1.9, qz + hw + 0.02)); bag.add('lime_plaster', box(qx - 0.6, y, qz + hw, qx + 0.6, y + 0.1, qz + hw + 0.5));
}
export const GARDEN_ELEMENTS = { garden_plot: gardenPlot, graveyard };
