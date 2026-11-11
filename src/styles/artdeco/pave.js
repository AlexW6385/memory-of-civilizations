// The pavement and what stood on it, Midtown 1931 (docs/settlements/new-york.md §1i): flags of bluestone between granite
// curbs along every block; on it the hydrants, mail boxes, ash cans, three-colour traffic signals on their posts, Fifth Avenue's
// cast-iron clocks, fire alarm boxes, manhole covers, the garment district's rolling racks and hand trucks stacked with cartons,
// crates and barrels at the grocers', the sandwich boards of the lunch rooms. All laid out in the grid's frame (inside `turned`).

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { rng, Quads, letters, textLen, fitCell } from './dress.js';

/** pavement: { segs: [[x0, z0, x1, z1, yA (at z0), yB (at z1)]], curbs: [[x0, z0, x1, z1, y]] } — flags a hand above the ground, curbs of granite. */
export function pavement(el, { bag }) {
  const T = [];
  for (const [x0, z0, x1, z1, ya, yb] of el.segs ?? []) {
    const A = [x0, ya + 0.04, z0], B = [x1, ya + 0.04, z0], C = [x1, yb + 0.04, z1], D = [x0, yb + 0.04, z1];
    T.push(...A, ...C, ...B, ...A, ...D, ...C);
  }
  if (T.length) bag.add('bluestone', fromTriangles(T));
  for (const [x0, z0, x1, z1, y] of el.curbs ?? []) bag.add('granite_grey', box(x0, y, z0, x1, y + 0.13, z1));
}

const PARTS = (list, rot, x, y, z) => { for (const [m, g] of list) { g.rotateY(rot); g.translate(x, y, z); } return list; };
const CARTON = ['planks_grey', 'wood_ochre', 'sacking'], COAT = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_red'];

/** curb: { items: [{ k, at: [x, z], y, rot, seed, … }] } — see the builders below. */
export function curb(el, { bag, col }) {
  for (const it of el.items) {
    const [x, z] = it.at, y = it.y ?? 0, rot = it.rot ?? 0, r = rng(it.seed || 1), P = [];
    const B = (m, x0, y0, z0, x1, y1, z1) => P.push([m, box(x0, y0, z0, x1, y1, z1)]);
    switch (it.k) {
      case 'hydrant': {
        bag.add('car_red', lathe([[0.17, 0], [0.17, 0.06], [0.12, 0.12], [0.11, 0.55], [0.15, 0.6], [0.14, 0.68], [0.001, 0.77]], 10, null, x, y, z));
        B('car_red', -0.3, 0.42, -0.05, 0.3, 0.52, 0.05); B('iron', 0.27, 0.41, -0.07, 0.33, 0.53, 0.07); B('iron', -0.33, 0.41, -0.07, -0.27, 0.53, 0.07); B('iron', -0.06, 0.36, 0.1, 0.06, 0.46, 0.2);
        col.circle(x, z, 0.2, y, y + 0.8); break;
      }
      case 'mailbox': {
        B('iron', -0.2, 0, -0.18, -0.14, 0.4, -0.12); B('iron', 0.14, 0, -0.18, 0.2, 0.4, -0.12); B('iron', -0.2, 0, 0.12, -0.14, 0.4, 0.18); B('iron', 0.14, 0, 0.12, 0.2, 0.4, 0.18);
        B('shutter_green', -0.25, 0.4, -0.23, 0.25, 1.05, 0.23); B('shutter_green', -0.22, 1.05, -0.2, 0.22, 1.16, 0.2); B('gold', -0.15, 0.85, 0.23, 0.15, 0.92, 0.25); B('paint_white', -0.12, 0.62, 0.23, 0.12, 0.78, 0.24);
        col.circle(x, z, 0.3, y, y + 1.2); break;
      }
      case 'ashcan': {
        bag.add('iron_galv', lathe([[0.26, 0], [0.28, 0.04], [0.27, 0.7], [0.25, 0.72], [0.13, 0.78], [0.12, 0.84], [0.001, 0.84]], 10, null, x, y, z));
        for (const hy of [0.25, 0.5]) bag.add('iron', lathe([[0.285, hy], [0.285, hy + 0.025], [0.27, hy + 0.025]], 10, null, x, y, z));
        col.circle(x, z, 0.3, y, y + 0.85); break;
      }
      case 'signal': {
        bag.add('iron', lathe([[0.14, 0], [0.14, 0.3], [0.07, 0.4], [0.06, 3.5], [0.001, 3.55]], 8, null, x, y, z));
        B('car_black', -0.16, 3.1, -0.16, 0.16, 4.1, 0.16); B('car_black', -0.2, 4.1, -0.2, 0.2, 4.15, 0.2);
        for (const s of [-1, 1]) for (const [ya, m] of [[3.88, 'car_red'], [3.58, 'paint_cab_yellow'], [3.28, 'shutter_green']]) { B(m, -0.07, ya, s * 0.16, 0.07, ya + 0.16, s * 0.18); B('car_black', -0.1, ya + 0.14, s * 0.16, 0.1, ya + 0.19, s * 0.23); }
        col.circle(x, z, 0.15, y, y + 4.2); break;
      }
      case 'clock': {
        bag.add('iron', lathe([[0.2, 0], [0.2, 0.5], [0.09, 0.7], [0.08, 3.3], [0.001, 3.35]], 8, null, x, y, z));
        for (const s of [-1, 1]) {
          const f = lathe([[0.001, 0], [0.42, 0], [0.42, 0.04], [0.001, 0.05]], 20, null, 0, 0, 0).rotateX(Math.PI / 2).translate(0, 3.55, s * 0.14);
          P.push(['glass_lamp', f]); P.push(['iron', lathe([[0.42, 0], [0.5, 0], [0.5, 0.1], [0.42, 0.1]], 20, null, 0, 0, 0).rotateX(Math.PI / 2).translate(0, 3.55, s * 0.14)]);
          P.push(['car_black', box(-0.012, 0, -0.01, 0.012, 0.32, 0.01).rotateZ(0.7).translate(0, 3.55, s * 0.2)]); P.push(['car_black', box(-0.012, 0, -0.01, 0.012, 0.24, 0.01).rotateZ(-1.9).translate(0, 3.55, s * 0.2)]);
        }
        B('iron', -0.2, 3.04, -0.04, 0.2, 3.1, 0.04);
        col.circle(x, z, 0.2, y, y + 4); break;
      }
      case 'firebox': {
        B('iron', -0.04, 0, -0.04, 0.04, 1.3, 0.04); B('car_red', -0.15, 1.25, -0.1, 0.15, 1.8, 0.1); B('gold', -0.1, 1.55, 0.1, 0.1, 1.6, 0.115); B('iron', -0.17, 1.8, -0.12, 0.17, 1.85, 0.12);
        col.circle(x, z, 0.12, y, y + 1.9); break;
      }
      case 'manhole': {
        bag.add('iron', lathe([[0.001, 0.02], [0.38, 0.02], [0.38, 0.035], [0.001, 0.035]], 14, null, x, y, z));
        break;
      }
      case 'rack': {                                                       // a rolling rack of coats, 1.7 m wide
        for (const s of [-1, 1]) { B('iron', s * 0.82 - 0.015, 0.12, -0.03, s * 0.82 + 0.015, 1.65, 0.03); B('iron', s * 0.82 - 0.03, 0.04, -0.3, s * 0.82 + 0.03, 0.1, 0.3); }
        B('iron', -0.84, 1.63, -0.015, 0.84, 1.67, 0.015);
        for (let u = -0.7; u < 0.72; u += 0.1 + r() * 0.07) B(COAT[Math.floor(r() * COAT.length)], u, 0.35 + r() * 0.12, -0.12, u + 0.09, 1.6, 0.12);
        const g = it.rot ?? 0; void g;
        col.circle(x, z, 0.55, y, y + 1.7); break;
      }
      case 'truck': {                                                      // a hand truck stacked with cartons and a roll of cloth
        B('iron', -0.28, 0.05, -0.04, -0.24, 1.2, 0.04); B('iron', 0.24, 0.05, -0.04, 0.28, 1.2, 0.04); B('iron', -0.28, 0.05, 0.04, 0.28, 0.1, 0.38);
        for (let k = 0, yy = 0.1, n = 2 + Math.floor(r() * 3); k < n; k++, yy += 0.34) B(CARTON[Math.floor(r() * 3)], -0.26 + r() * 0.05, yy, 0.04, 0.26 - r() * 0.05, yy + 0.33, 0.4);
        P.push(['iron', lathe([[0.1, -0.03], [0.1, 0.03]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(-0.32, 0.1, 0.05)]); P.push(['iron', lathe([[0.1, -0.03], [0.1, 0.03]], 8, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(0.32, 0.1, 0.05)]);
        col.circle(x, z, 0.4, y, y + 1.2); break;
      }
      case 'crates': {                                                     // produce crates, apples and greens on top, a hand-lettered card
        const n = 3 + Math.floor(r() * 3), pr = ['cloth_red', 'cloth_green', 'paint_cab_yellow', 'cloth_ochre'];
        for (let k = 0; k < n; k++) {
          const cx = (k % 3) * 0.58 - 0.55, lvl = k >= 3 ? 1 : 0, cz = 0;
          B('timber', cx, lvl * 0.34, cz - 0.24, cx + 0.54, lvl * 0.34 + 0.32, cz + 0.24); B(pr[Math.floor(r() * 4)], cx + 0.04, lvl * 0.34 + 0.32, cz - 0.2, cx + 0.5, lvl * 0.34 + 0.4, cz + 0.2);
        }
        B('wood_painted', -0.5, 0.7, 0.02, -0.1, 0.95, 0.05);
        col.rect([x - 0.8, z - 0.4, x + 0.8, z + 0.4], y, y + 0.8); break;
      }
      case 'barrel': {
        bag.add('timber', lathe([[0.3, 0], [0.34, 0.2], [0.36, 0.45], [0.34, 0.7], [0.3, 0.9], [0.001, 0.9]], 10, null, x, y, z));
        for (const hy of [0.12, 0.45, 0.78]) bag.add('iron', lathe([[0.37, hy], [0.37, hy + 0.03], [0.33, hy + 0.03]], 10, null, x, y, z));
        col.circle(x, z, 0.36, y, y + 0.9); break;
      }
      case 'asign': {                                                      // a sandwich board with the day's special
        const text = it.text ?? 'LUNCH 35', Q = new Quads();
        for (const s of [-1, 1]) B('wood_painted', -0.3, 0, s * 0.2 - 0.02, 0.3, 0.95, s * 0.2 + 0.02);
        const cell = fitCell(text, 0.5, 0.04), tl = textLen(text, cell);
        for (const s of [-1, 1]) letters(Q.t('paint_white'), text, cell, (h, v) => [s * (-tl / 2 + h), 0.5 + v, s * 0.225], 0, 0);
        // (the lettering is built in the item's frame: turned with it below)
        const T2 = Q.m.get('paint_white') ?? [];
        const g = fromTriangles(T2); g.rotateY(rot); g.translate(x, y, z); bag.add('paint_white', g);
        col.circle(x, z, 0.4, y, y + 1); break;
      }
      case 'bench': {                                                      // a slatted park bench on cast ends
        for (const s of [-1, 1]) { B('iron', s * 0.8 - 0.03, 0, -0.22, s * 0.8 + 0.03, 0.45, 0.22); B('iron', s * 0.8 - 0.03, 0.45, 0.18, s * 0.8 + 0.03, 0.9, 0.22); }
        for (let k = 0; k < 4; k++) B('timber', -0.84, 0.43 + 0.001 * k, -0.2 + k * 0.1, 0.84, 0.46, -0.12 + k * 0.1);
        for (let k = 0; k < 3; k++) B('timber', -0.84, 0.55 + k * 0.1, 0.19, 0.84, 0.62 + k * 0.1, 0.22);
        col.rect([x - 0.9, z - 0.3, x + 0.9, z + 0.3], y, y + 0.5); break;
      }
      case 'lampost': {                                                    // a park lamp standard
        bag.add('iron', lathe([[0.2, 0], [0.2, 0.5], [0.08, 0.7], [0.06, 3.6], [0.001, 3.65]], 8, null, x, y, z));
        bag.add('lamp_glass', lathe([[0.001, 0], [0.2, 0.08], [0.24, 0.35], [0.14, 0.58], [0.001, 0.64]], 10, null, x, y + 3.6, z));
        col.circle(x, z, 0.2, y, y + 4); break;
      }
      default: break;
    }
    for (const [m, g] of PARTS(P, rot, x, y, z)) bag.add(m, g);
  }
}
