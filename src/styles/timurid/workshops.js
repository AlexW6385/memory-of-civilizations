// The rooms of the trades in the courtyard houses of Timurid Samarkand (docs/settlements/timurid-samarkand.md §17): the room
// off the court of a house that is not a guest room is the workshop or store of the house's trade — the potter's wheel and
// shelves, the baker's trough and flour, the smith's hearth with bellows and anvil, the weaver's upright loom, the joiner's
// bench, the grocer's counter with scales, the papermaker's vat, moulds and drying boards. Each is drawn in the room's own
// terms: d metres in from the outer wall (0) to the court wall (3.3), v metres to either side of the room's middle line
// (the door is at d = 3.3, v = 0, and the way from it to the middle of the room, d > 1.8, |v| < 0.8, is left clear).

import { box, lathe, place, rod, clothBox, addCloth } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';

const mn = Math.min, mx = Math.max;

/** e: { bag, col, lights, ofx (the outer wall's inner face, x), dir (+1 / −1: the way in), zc, seed, breads, melons }. */
export function workshop(kind, e) {
  const { bag, col, lights, ofx, dir, zc } = e;
  const X = (d) => ofx + dir * d, Z = (v) => zc + v, yaw = dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  const B = (m, d0, d1, v0, v1, y0, y1) => bag.add(m, box(mn(X(d0), X(d1)), y0, mn(Z(v0), Z(v1)), mx(X(d0), X(d1)), y1, mx(Z(v0), Z(v1))));
  const C = (d0, d1, v0, v1, y1) => col.rect([mn(X(d0), X(d1)), mn(Z(v0), Z(v1)), mx(X(d0), X(d1)), mx(Z(v0), Z(v1))], 0, y1);
  const L = (m, prof, d, v, y = 0, seg = 12) => bag.add(m, lathe(prof, seg, null, X(d), y, Z(v)));
  const lamp = (d, v, y) => { B('wood_dark', d - 0.1, d + 0.1, v - 0.1, v + 0.1, y - 0.05, y - 0.01); F.oilLamp(bag, lights, X(d), y, Z(v), 'terracotta', 1.1); };
  const shelves = (ys, v0, v1, goods) => { for (const y of ys) { B('timber', 0, 0.34, v0, v1, y, y + 0.04); goods(y + 0.04); } };
  const rail = (v0, v1, y, d0 = 0, d1 = 0.05) => B('wood_dark', d0, d1, v0, v1, y, y + 0.05);
  switch (kind) {
    case 'pottery': {
      // the kick-wheel: a heavy wheel low, the axle, the head with a lump of clay, the seat
      L('wood_dark', [[0.001, 0], [0.38, 0], [0.38, 0.07], [0.001, 0.07]], 1.35, -1.5, 0.1, 14);
      bag.add('iron', rod([X(1.35), 0.17, Z(-1.5)], [X(1.35), 0.6, Z(-1.5)], 0.025, 5));
      L('timber', [[0.001, 0], [0.14, 0], [0.14, 0.04], [0.001, 0.04]], 1.35, -1.5, 0.6, 10);
      L('terracotta', [[0.001, 0], [0.09, 0], [0.07, 0.07], [0.001, 0.11]], 1.35, -1.5, 0.64, 8);
      B('timber', 0.95, 1.25, -2.2, -1.85, 0.36, 0.41); B('wood_dark', 1.0, 1.06, -2.15, -1.9, 0.06, 0.36); B('wood_dark', 1.14, 1.2, -2.15, -1.9, 0.06, 0.36);
      C(1.0, 1.75, -1.9, -1.1, 0.7);
      shelves([0.5, 1.0, 1.5], -2.4, 2.4, (y) => { for (const v of [-1.7, -0.4, 0.9, 2.0]) F.pots(bag, X(0.17), y, Z(v), yaw, 3); });
      lamp(0.15, -2.2, 1.9);
      // unfired ware drying on a board, a heap of clay, water
      B('timber', 0.7, 2.4, 1.85, 2.4, 0.3, 0.35); for (const d of [0.8, 2.3]) B('wood_dark', d - 0.04, d + 0.04, 1.9, 2.35, 0.06, 0.3);
      for (const d of [1.0, 1.6, 2.2]) F.pots(bag, X(d), 0.35, Z(2.12), yaw, 2, ['pottery_dark', 'terracotta']);
      L('terracotta', [[0.55, 0], [0.5, 0.18], [0.3, 0.36], [0.001, 0.42]], 0.55, 0.9, 0, 12); C(0.0, 1.1, 0.35, 1.45, 0.4);
      F.waterJar(bag, X(2.8), 0.06, Z(-2.2), 0.9);
      break;
    }
    case 'bakery': {
      // the kneading trough with the dough in it, flour sacks, a board of loaves, a long peel against the wall
      B('wood_dark', 0.25, 1.65, -2.35, -1.45, 0.34, 0.4); B('wood_dark', 0.25, 1.65, -2.35, -2.27, 0.4, 0.62); B('wood_dark', 0.25, 1.65, -1.53, -1.45, 0.4, 0.62);
      B('wood_dark', 0.25, 0.33, -2.35, -1.45, 0.4, 0.62); B('wood_dark', 1.57, 1.65, -2.35, -1.45, 0.4, 0.62); B('linen', 0.4, 1.5, -2.2, -1.6, 0.4, 0.5);
      for (const d of [0.4, 1.5]) for (const v of [-2.3, -1.5]) B('wood_dark', d - 0.04, d + 0.04, v - 0.04, v + 0.04, 0.06, 0.34);
      C(0.2, 1.7, -2.4, -1.4, 0.62);
      F.spiceSacks(bag, X(0.55), 0.06, Z(1.0), yaw, 4, ['sacking', 'linen', 'sacking', 'cloth_ochre']); F.spiceSacks(bag, X(0.55), 0.06, Z(2.0), yaw, 3, ['linen', 'sacking', 'sacking']);
      shelves([0.9, 1.4, 1.9], -0.9, 0.3, (y) => { e.breads(bag, X(0.12), y, Z(-0.8), 6); e.breads(bag, X(0.12), y, Z(-0.2), 6); });
      B('timber', 1.2, 2.2, 1.9, 2.45, 0.74, 0.8); for (const d of [1.3, 2.1]) for (const v of [1.95, 2.4]) B('wood_dark', d - 0.04, d + 0.04, v - 0.04, v + 0.04, 0.06, 0.74);
      e.breads(bag, X(1.4), 0.8, Z(2.1), 9); C(1.2, 2.2, 1.9, 2.45, 0.8);
      bag.add('timber', rod([X(0.1), 0.1, Z(2.45)], [X(0.1), 2.3, Z(2.45)], 0.025, 4)); B('wood_dark', 0.0, 0.18, 2.35, 2.55, 2.2, 2.3);
      lamp(0.15, 0.7, 1.7);
      break;
    }
    case 'smithy': {
      // the hearth under its hood, the bellows, the anvil on its stump, the quenching trough, the tools on the wall
      B('brick_buff', 0, 1.1, -2.5, -1.4, 0, 0.78); B('bitumen', 0.15, 0.95, -2.35, -1.55, 0.78, 0.82);
      L('flame', [[0.001, 0], [0.12, 0.01], [0.001, 0.3]], 0.55, -1.95, 0.82, 6); lights.push({ at: [X(0.55), 1.0, Z(-1.95)], color: '#ff9a40', intensity: 3.2, distance: 5 });
      B('kahgel', 0, 0.9, -2.5, -1.4, 1.7, 3.1); B('lacquer_black', 0.0, 0.9, -2.45, -1.45, 1.66, 1.7);
      for (const v of [-2.5, -1.4]) B('kahgel', 0, 0.9, v - (v < -2 ? 0 : 0.0), v + (v < -2 ? 0.0 : 0.0), 1.7, 1.7); // (the hood's open sides are the room's air)
      B('hide_brown', 1.0, 1.7, -2.15, -1.85, 0.5, 0.7); bag.add('iron', rod([X(1.0), 0.6, Z(-2.0)], [X(0.6), 0.6, Z(-1.95)], 0.022, 5)); B('wood_dark', 1.65, 1.95, -2.05, -1.95, 0.55, 0.62);
      C(0.0, 1.1, -2.5, -1.4, 0.82);
      L('wood_dark', [[0.22, 0], [0.2, 0.2], [0.21, 0.5], [0.001, 0.5]], 1.3, 0.3, 0, 10); C(1.1, 1.5, 0.1, 0.5, 0.65);
      B('iron', 1.1, 1.5, 0.2, 0.4, 0.5, 0.64); B('iron', 1.18, 1.42, 0.1, 0.5, 0.58, 0.62); bag.add('iron', rod([X(1.1), 0.58, Z(0.3)], [X(0.88), 0.57, Z(0.3)], 0.045, 5));
      B('limestone', 0.2, 1.1, 1.5, 2.3, 0, 0.4); B('water', 0.3, 1.0, 1.6, 2.2, 0.34, 0.37); C(0.2, 1.1, 1.5, 2.3, 0.4);
      rail(0.3, 1.5, 1.5);
      for (let i = 0; i < 6; i++) { const v = 0.4 + i * 0.2; B(i % 2 ? 'iron' : 'wood_dark', 0.05, 0.09, v, v + 0.04, 1.0 + (i % 3) * 0.08, 1.5); }
      B('iron', 0.1, 0.5, 2.1, 2.5, 0, 0.1); B('iron', 0.1, 0.5, 2.1, 2.5, 0.1, 0.2); B('iron', 0.12, 0.48, 2.15, 2.45, 0.2, 0.28);
      L('lacquer_black', [[0.4, 0], [0.3, 0.14], [0.001, 0.25]], 0.55, -0.6, 0, 8);
      F.waterJar(bag, X(2.8), 0.06, Z(2.2), 0.9);
      break;
    }
    case 'loom': {
      // an upright loom of two posts and two beams, the warp, the web woven up from the foot in bands; the weaver's bench
      for (const v of [-1.15, 1.15]) B('timber', 0.3, 0.4, v - 0.05, v + 0.05, 0.06, 2.05);
      B('wood_dark', 0.28, 0.42, -1.2, 1.2, 1.95, 2.03); B('wood_dark', 0.28, 0.42, -1.2, 1.2, 0.5, 0.58);
      const wc = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_maroon', 'cloth_indigo', 'cloth_red'];
      for (let i = 0; i < 26; i++) B('cloth_white', 0.345, 0.355, -1.1 + i * 0.0846, -1.09 + i * 0.0846, 0.58, 1.95);
      wc.forEach((m, i) => B(m, 0.33, 0.37, -1.05, 1.05, 0.58 + i * 0.1, 0.66 + i * 0.1));
      B('timber', 0.3, 0.42, -1.1, 1.1, 1.3, 1.34);
      C(0.25, 0.45, -1.2, 1.2, 2.0);
      B('timber', 0.8, 1.3, -0.6, 0.6, 0.38, 0.44); for (const d of [0.85, 1.25]) for (const v of [-0.55, 0.55]) B('wood_dark', d - 0.035, d + 0.035, v - 0.035, v + 0.035, 0.06, 0.38);
      F.cushion(bag, X(1.05), 0.44, Z(0), 0.7, 0.45, 0.08, yaw, 'cloth_indigo'); C(0.8, 1.3, -0.6, 0.6, 0.44);
      rail(-2.5, 2.5, 2.2, 0, 0.05);
      ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white'].forEach((m, i) => { const v = 1.4 + (i % 3) * 0.3 - (i > 2 ? 3.9 : 0); addCloth(bag, m, clothBox(mn(X(0.1), X(0.25)), 1.45, Z(v) - 0.06, mx(X(0.1), X(0.25)), 2.2, Z(v) + 0.06), 2.2); });
      L('wicker', [[0.001, 0], [0.25, 0], [0.3, 0.2], [0.27, 0.22], [0.001, 0.2]], 1.8, 2.1, 0.06, 10);
      for (let i = 0; i < 5; i++) L(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][i], [[0.001, 0], [0.05, 0], [0.05, 0.12], [0.001, 0.12]], 1.7 + (i % 3) * 0.1, 2.0 + (i % 2) * 0.15, 0.27, 6);
      lamp(0.15, -2.2, 1.7);
      break;
    }
    case 'joinery': {
      // the bench with its vice and a plank half planed, planks and column blanks stood along the walls, tools on a rail, shavings
      B('timber', 0.9, 1.6, -2.3, -0.3, 0.8, 0.9); for (const d of [0.98, 1.52]) for (const v of [-2.22, -0.38]) B('wood_dark', d - 0.05, d + 0.05, v - 0.05, v + 0.05, 0.06, 0.8);
      B('wood_dark', 0.78, 0.9, -1.0, -0.6, 0.7, 0.98); B('timber', 0.95, 1.55, -2.1, -1.0, 0.9, 0.96); B('wood_ochre', 1.0, 1.5, -1.9, -0.9, 0.96, 0.99);
      C(0.85, 1.65, -2.35, -0.25, 0.98);
      bag.add('iron', place(box(-0.2, 0, -0.01, 0.2, 0.09, 0.01), X(1.25), 0.99, Z(-0.45), 0.3)); B('wood_dark', 1.45, 1.55, -0.55, -0.4, 0.99, 1.07);
      for (let i = 0; i < 7; i++) B(i % 2 ? 'timber' : 'wood_ochre', 0.0, 0.05, 0.1 + i * 0.3, 0.37 + i * 0.3, 0.06, 2.1 - (i % 3) * 0.12);
      for (const [d, v] of [[0.4, 2.3], [0.8, 2.3]]) { L('wood_painted', [[0.12, 0], [0.1, 0.2], [0.09, 2.2], [0.11, 2.3]], d, v, 0.06, 8); col.circle(X(d), Z(v), 0.13, 0, 2.3); }
      rail(-2.4, -0.4, 1.6);
      for (let i = 0; i < 6; i++) B(i % 2 ? 'iron' : 'wood_dark', 0.05, 0.08, -2.3 + i * 0.3, -2.22 + i * 0.3, 1.2 + (i % 2) * 0.1, 1.6);
      for (let i = 0; i < 9; i++) B('wood_ochre', 1.6 + (i % 3) * 0.3, 1.75 + (i % 3) * 0.3, -0.2 + (i % 4) * 0.25 + (i > 4 ? 0.8 : 0), -0.1 + (i % 4) * 0.25 + (i > 4 ? 0.8 : 0), 0.06, 0.08);
      lamp(0.15, 0.3, 1.8);
      break;
    }
    case 'paper': {
      // Samarkand paper: bark and rags beaten to pulp, the vat, the moulds, fresh sheets pressed, sheets drying on boards
      B('limestone', 0.3, 1.7, -2.45, -1.3, 0, 0.72); B('water', 0.42, 1.58, -2.33, -1.42, 0.62, 0.66); C(0.3, 1.7, -2.45, -1.3, 0.72);
      for (const [d, v, k] of [[0.9, -1.2, 0.0], [1.3, -1.3, 0.2]]) { B('timber', d - 0.3, d + 0.3, v - 0.22, v + 0.22, 0.73, 0.76); B('reed_mat', d - 0.24, d + 0.24, v - 0.17, v + 0.17, 0.74, 0.755); void k; }
      B('timber', 0.4, 1.2, 0.3, 1.0, 0.0, 0.5); B('wood_dark', 0.35, 1.25, 0.25, 1.05, 0.5, 0.55); B('linen', 0.5, 1.1, 0.4, 0.9, 0.55, 0.8); B('wood_dark', 0.45, 1.15, 0.35, 0.95, 0.8, 0.86); B('limestone', 0.55, 1.05, 0.45, 0.85, 0.86, 1.0); C(0.35, 1.25, 0.25, 1.05, 1.0);
      for (let i = 0; i < 4; i++) { const v = 1.1 + i * 0.36; B('timber', 0.0, 0.05, v, v + 0.3, 0.45, 1.75); B('linen', 0.05, 0.06, v + 0.02, v + 0.28, 0.5, 1.7); }
      L('granite_grey', [[0.001, 0], [0.26, 0], [0.3, 0.1], [0.3, 0.42], [0.22, 0.42], [0.2, 0.15], [0.001, 0.12]], 0.5, 2.0, 0, 12); col.circle(X(0.5), Z(2.0), 0.32, 0, 0.45);
      bag.add('wood_dark', rod([X(0.7), 0.5, Z(2.05)], [X(0.55), 1.1, Z(2.0)], 0.03, 5));
      for (let i = 0; i < 5; i++) B('bark_dark', 1.4, 2.2, 2.0 + i * 0.09, 2.08 + i * 0.09, 0.06 + (i % 2) * 0.08, 0.16 + (i % 2) * 0.08);
      B('timber', 2.0, 2.6, -2.4, -1.9, 0.7, 0.75); for (const d of [2.05, 2.55]) for (const v of [-2.35, -1.95]) B('wood_dark', d - 0.03, d + 0.03, v - 0.03, v + 0.03, 0.06, 0.7);
      B('linen', 2.1, 2.5, -2.3, -2.0, 0.75, 0.82); bag.add('marble', lathe([[0.001, 0], [0.05, 0], [0.04, 0.03], [0.001, 0.035]], 8, null, X(2.4), 0.75, Z(-2.05)));
      lamp(0.15, 0.2, 1.9);
      break;
    }
    default: {
      // the grocer's store: a counter with scales, jars, trays of dried fruit and nuts, sacks, strings of dried fruit
      B('timber', 2.0, 2.55, -2.45, -1.0, 0.0, 0.9); B('wood_dark', 1.95, 2.6, -2.5, -0.95, 0.9, 0.95); C(1.95, 2.6, -2.5, -0.95, 0.95);
      B('wood_dark', 2.2, 2.26, -1.8, -1.74, 0.95, 1.7); B('bronze', 2.1, 2.36, -1.9, -1.84, 1.7, 1.73); B('bronze', 2.1, 2.36, -1.7, -1.64, 1.7, 1.73);
      for (const v of [-1.87, -1.67]) { bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.09, 0.015], [0.001, 0.015]], 10, null, X(2.23), 1.3, Z(v + (v < -1.8 ? -0.1 : 0.1)))); for (const q of [0, 1, 2]) bag.add('iron', rod([X(2.23), 1.7, Z(v)], [X(2.23) + (q - 1) * 0.07, 1.315, Z(v + (v < -1.8 ? -0.1 : 0.1))], 0.004, 3)); }
      for (let i = 0; i < 5; i++) F.waterJar(bag, X(0.4), 0.06, Z(-2.0 + i * 0.5 - (i > 2 ? 0.0 : 0)), 0.75 + (i % 3) * 0.12, i % 2 ? 'terracotta' : 'pottery_dark');
      shelves([0.9, 1.4, 1.9], 0.6, 2.4, (y) => { F.copperware(bag, X(0.15), y, Z(1.0), yaw, e.seed + Math.round(y * 10), 3); F.pots(bag, X(0.15), y, Z(1.9), yaw, 3); });
      F.spiceSacks(bag, X(0.5), 0.06, Z(0.4), yaw, 4); F.spiceSacks(bag, X(1.1), 0.06, Z(2.2), yaw, 3, ['cloth_ochre', 'cloth_brown', 'sacking']);
      for (const v of [-0.4, 0.2]) { B('wicker', 1.0, 1.5, v - 0.0, v + 0.45, 0.06, 0.16); B('cloth_ochre', 1.04, 1.46, v + 0.03, v + 0.42, 0.16, 0.2); }
      rail(-2.5, 0.3, 2.5, 0, 0.05);
      [-2.3, -1.9, -1.5, -1.1, -0.7].forEach((v, i) => addCloth(bag, i % 2 ? 'cloth_ochre' : 'cloth_red', clothBox(mn(X(0.06), X(0.2)), 1.8, Z(v) - 0.05, mx(X(0.06), X(0.2)), 2.5, Z(v) + 0.05), 2.5));
      lamp(0.15, 1.5, 1.6);
    }
  }
}
