// The yards behind the timber houses (docs/settlements/ottoman-istanbul.md §15): each block's yard keeps what a household needs
// out of doors — a stone well with its windlass, a vine arbor over a bench, beds of vegetables in timber kerbs, a hen coop on legs,
// a woodpile under a lean-to, a washing line between two posts. Items are placed by the settlement (town.js); each stands on the
// ground at its own height.
//   yard_dress: { items: [{ k: 'well' | 'arbor' | 'beds' | 'coop' | 'wood' | 'line', at: [x, z], y, rot }] }

import { box, lathe } from '../../core/geom.js';

const rot90 = (r) => Math.abs(Math.sin(r)) > 0.7;
function item(bag, col, { k, at: [x, z], y, rot = 0 }) {
  const turned = rot90(rot);
  // a box in the item's own frame (u along its length, v across), set on the ground
  const B = (mat, u0, v0, u1, v1, ya, yb) => { const r = turned ? [x + v0, z + u0, x + v1, z + u1] : [x + u0, z + v0, x + u1, z + v1]; bag.add(mat, box(Math.min(r[0], r[2]), y + ya, Math.min(r[1], r[3]), Math.max(r[0], r[2]), y + yb, Math.max(r[1], r[3]))); };
  const C = (u0, v0, u1, v1, ya, yb) => { const r = turned ? [x + v0, z + u0, x + v1, z + u1] : [x + u0, z + v0, x + u1, z + v1]; col.rect([Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])], y + ya, y + yb); };
  if (k === 'well') {
    bag.add('limestone', lathe([[0.45, -0.4], [0.72, -0.4], [0.72, 0.15], [0.62, 0.15], [0.62, 0.85], [0.78, 0.85], [0.78, 0.95], [0.4, 0.95], [0.4, 0.85], [0.45, 0.85]], 12, null, x, y, z));
    B('wood_dark', -0.82, -0.05, -0.72, 0.05, -0.4, 2.0); B('wood_dark', 0.72, -0.05, 0.82, 0.05, -0.4, 2.0);
    B('timber', -0.85, -0.05, 0.85, 0.05, 1.95, 2.05); B('timber', -0.85, -0.09, 0.85, 0.09, 1.6, 1.68);
    B('rope_fibre', -0.012, -0.012, 0.012, 0.012, 0.95, 1.6); bag.add('wood_dark', lathe([[0.001, 0], [0.12, 0], [0.14, 0.2], [0.11, 0.2], [0.001, 0.02]], 8, null, x, y + 0.75, z));
    col.circle(x, z, 0.8, y, y + 1.0);
  } else if (k === 'arbor') {
    // four posts, beams and slats overhead under a mass of vine, a bench beneath
    for (const [u, v] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]]) B('wood_dark', u - 0.06, v - 0.06, u + 0.06, v + 0.06, -0.3, 2.4);
    for (const v of [-1.1, 1.1]) B('timber', -1.75, v - 0.07, 1.75, v + 0.07, 2.4, 2.52);
    for (let u = -1.5; u <= 1.5; u += 0.5) B('timber', u - 0.03, -1.2, u + 0.03, 1.2, 2.52, 2.58);
    for (let u = -1.4; u < 1.4; u += 0.9) B('lotus_leaf', u, -1.0 + (u > 0 ? 0.3 : 0), u + 0.8, 0.8, 2.58, 2.72);
    B('timber', -1.2, -0.25, 1.2, 0.25, 0.42, 0.48); B('wood_dark', -1.1, -0.2, -0.95, 0.2, 0, 0.42); B('wood_dark', 0.95, -0.2, 1.1, 0.2, 0, 0.42);
    C(-1.2, -0.25, 1.2, 0.25, 0, 0.5);
  } else if (k === 'beds') {
    for (const v of [-1.2, 0, 1.2]) {
      B('timber', -1.5, v - 0.45, 1.5, v - 0.4, -0.2, 0.18); B('timber', -1.5, v + 0.4, 1.5, v + 0.45, -0.2, 0.18); B('timber', -1.5, v - 0.4, -1.45, v + 0.4, -0.2, 0.18); B('timber', 1.45, v - 0.4, 1.5, v + 0.4, -0.2, 0.18);
      B('earth_wall', -1.45, v - 0.4, 1.45, v + 0.4, -0.2, 0.12);
      for (let u = -1.3; u < 1.4; u += 0.35) B('lotus_leaf', u, v - 0.12, u + 0.22, v + 0.12, 0.12, 0.36 + ((u * 7 + v * 3 + 20) % 1) * 0.15);
    }
  } else if (k === 'coop') {
    for (const [u, v] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) B('wood_dark', u - 0.04, v - 0.04, u + 0.04, v + 0.04, 0, 0.5);
    B('wicker', -0.65, -0.5, 0.65, 0.5, 0.5, 1.2); B('opening', -0.2, -0.505, 0.2, -0.5, 0.6, 1.0); B('timber', -0.8, -0.65, 0.8, 0.65, 1.2, 1.28);
    for (let q = 0; q < 3; q++) B('timber', 0.2, -0.5 - 0.14 * (q + 1), 0.4, -0.5 - 0.14 * q, 0, 0.38 - q * 0.12);   // the steps up to the hatch
    C(-0.7, -0.55, 0.7, 0.55, 0, 1.3);
  } else if (k === 'wood') {
    B('timber', -1.3, -0.1, -1.2, 0.9, -0.2, 1.7); B('timber', 1.2, -0.1, 1.3, 0.9, -0.2, 1.7); B('thatch', -1.5, -0.2, 1.5, 1.1, 1.7, 1.8);
    for (let r = 0; r < 4; r++) for (let u = -1.1; u < 1.1; u += 0.22) B(r % 2 ? 'wood_dark' : 'timber', u, 0.0, u + 0.19, 0.85, r * 0.3, r * 0.3 + 0.27);
    C(-1.3, -0.1, 1.3, 0.9, 0, 1.2);
  } else if (k === 'line') {
    for (const u of [-2.2, 2.2]) B('wood_dark', u - 0.05, -0.05, u + 0.05, 0.05, -0.3, 2.2);
    B('rope_fibre', -2.2, -0.01, 2.2, 0.01, 2.1, 2.13);
    for (let q = 0; q < 5; q++) { const u = -1.8 + q * 0.8; B(['cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre'][q], u, -0.03, u + 0.5 - (q % 2) * 0.1, 0.03, 1.3 - (q % 3) * 0.15, 2.12);
    }
  }
}
export function yardDress(el, { bag, col }) { for (const it of el.items) item(bag, col, it); }
