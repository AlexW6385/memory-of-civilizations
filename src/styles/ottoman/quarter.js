// The pieces of the quarter about the Süleymaniye that are not houses (docs/settlements/ottoman-istanbul.md §13):
//   mescit — the neighbourhood mosque (mahalle mescidi): a square prayer room under one dome on an octagonal drum, a
//            portico of three small domes, the mihrab niche in the qibla wall (south), a minbar-less room as is usual
//            for a mescit (the Friday prayer was said in the great mosque), a carpet, a rahle, a hanging lamp [inferred:
//            the type; sizes]. Its minaret is a separate `minaret` element.
//   court_dress — the outer court's furniture: benches of marble slabs on stone feet under the planes, standing
//            water jars with a cup on a stone shelf by the way, stone mounting steps and hitching rings by the gates,
//            iron lamp posts by the gates [inferred: the custom of a mosque's outer court].
// Pure geometry on the style's usual bag.

import { box, lathe, rod } from '../../core/geom.js';
import { dome, bayDome } from './index.js';
import * as F from '../mughal/furnish.js';

const S = 'limestone';

/** mescit: { rect (square-ish, 12 × 12), y } — door on the north wall, the qibla south (+z). */
export function mescit(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cx = (x0 + x1) / 2, T = 0.8, wallH = 6.2, por = 3.4;
  const rx0 = x0, rz0 = z0 + por, rx1 = x1, rz1 = z1;        // the prayer room's rect (portico on the north)
  const W = (r, y1 = y + wallH, y0 = y - 0.5) => { bag.add(S, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y, y1); };
  // the room's walls: the door in the north wall, windows in two rows, the mihrab niche in the south wall
  const dw = 1.2;
  W([rx0, rz0, cx - dw, rz0 + T]); W([cx + dw, rz0, rx1, rz0 + T]); bag.add(S, box(cx - dw, y + 2.7, rz0, cx + dw, y + wallH, rz0 + T)); bag.add('opening', box(cx - dw * 0.8, y, rz0 + T - 0.05, cx + dw * 0.8, y + 2.6, rz0 + T - 0.02));
  W([rx0, rz0 + T, rx0 + T, rz1 - T]); W([rx1 - T, rz0 + T, rx1, rz1 - T]); W([rx0, rz1 - T, cx - 1.1, rz1]); W([cx + 1.1, rz1 - T, rx1, rz1]); W([cx - 1.1, rz1 - 0.3, cx + 1.1, rz1]);
  bag.add(S, box(cx - 1.1, y + 4.2, rz1 - T, cx + 1.1, y + wallH, rz1)); bag.add('marble_smooth', box(cx - 1.0, y, rz1 - T - 0.02, cx + 1.0, y + 0.15, rz1 - 0.3));
  bag.add('gilt_bronze', box(cx - 0.9, y + 3.6, rz1 - 0.34, cx + 0.9, y + 3.75, rz1 - 0.3));
  for (const f of ['w', 'e', 's', 'n']) for (const yy of [y + 1.5, y + 4.2]) for (const k of [0.3, 0.7]) {
    const along = f === 'n' || f === 's', u = (along ? rx0 : rz0) + k * (along ? rx1 - rx0 : rz1 - rz0) + (along ? 0 : 0), h = yy === y + 1.5 ? 1.5 : 1.2;
    if ((f === 'n' && Math.abs(u - cx) < 1.8) || (f === 's' && Math.abs(u - cx) < 1.6)) continue;
    for (const [o0, o1, wm] of [[-0.06, 0.02, 'opening'], [T - 0.02, T + 0.02, 'daylight']]) {
      const q = f === 'n' ? [u - 0.45, rz0 + o0, u + 0.45, rz0 + o1] : f === 's' ? [u - 0.45, rz1 - o1, u + 0.45, rz1 - o0] : f === 'w' ? [rx0 + o0, u - 0.45, rx0 + o1, u + 0.45] : [rx1 - o1, u - 0.45, rx1 - o0, u + 0.45];
      bag.add(wm, box(q[0], yy, q[1], q[2], yy + h, q[3]));
    }
    bag.add('iron', box(f === 'w' ? rx0 - 0.1 : f === 'e' ? rx1 + 0.05 : u - 0.45, yy + h * 0.5, f === 'n' ? rz0 - 0.1 : f === 's' ? rz1 + 0.05 : u - 0.45, f === 'w' ? rx0 - 0.05 : f === 'e' ? rx1 + 0.1 : u + 0.45, yy + h * 0.5 + 0.03, f === 'n' ? rz0 - 0.05 : f === 's' ? rz1 + 0.1 : u + 0.45));
  }
  // the floor, the carpet, the ceiling of plaster under the dome
  bag.add('timber', box(rx0 + T, y - 0.3, rz0 + T, rx1 - T, y + 0.05, rz1 - T)); col.floor([rx0 + T, rz0 + T, rx1 - T, rz1 - T], y + 0.05);
  F.carpet(bag, cx, y + 0.05, (rz0 + rz1) / 2 + 0.6, 6.2, 6.8, 0, 'persian');
  for (let k = 0; k < 4; k++) F.prayerRug(bag, cx - 2.3 + k * 1.5, y + 0.06, rz1 - 2.2, 0, 'persian');
  F.rahle(bag, rx0 + 1.4, y + 0.05, rz0 + 2.2, Math.PI / 2); F.rahle(bag, rx1 - 1.4, y + 0.05, rz0 + 2.2, -Math.PI / 2);
  bag.add('wood_dark', box(rx1 - T - 0.5, y + 0.05, rz1 - T - 1.8, rx1 - T, y + 0.07, rz1 - T - 0.2));
  const ry = y + wallH;
  bag.add('plaster_white', box(rx0 + T, ry - 0.05, rz0 + T, rx1 - T, ry, rz1 - T));
  F.mosqueLamp(bag, lights, cx, ry - 2.2, (rz0 + rz1) / 2, ry - 0.5, { k: 1.4, glow: 4, reach: 9 });
  // the roof: a flat lead roof, the dome on its octagonal drum over the middle
  bag.add('lead', box(rx0 - 0.15, ry, rz0 - 0.15, rx1 + 0.15, ry + 0.25, rz1 + 0.15));
  const dr = (rx1 - rx0) / 2 - 1.0, dz = (rz0 + rz1) / 2;
  bag.add(S, lathe([[dr, 0], [dr, 1.6]], 8, null, cx, ry + 0.25, dz).rotateY(Math.PI / 8).translate(0, 0, 0));
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2, wx = cx + Math.cos(a) * (dr * 0.93 + 0.05), wz = dz + Math.sin(a) * (dr * 0.93 + 0.05); bag.add('daylight', box(wx - 0.3, ry + 0.9, wz - 0.3, wx + 0.3, ry + 1.5, wz + 0.3)); }
  dome(bag, cx, ry + 1.85, dz, dr);
  // the portico: four columns, three small domes over a flat roof, a stone floor and the doorstep
  const pz1 = rz0, pz0 = z0, pw = (rx1 - rx0) / 3;
  bag.add('marble', box(rx0, y - 0.3, pz0, rx1, y + 0.1, pz1)); col.floor([rx0, pz0, rx1, pz1], y + 0.1);
  for (let k = 0; k <= 3; k++) { const px = rx0 + 0.3 + k * (rx1 - rx0 - 0.6) / 3; bag.add('granite_red', lathe([[0.2, 0], [0.18, 3.2]], 10, null, px, y + 0.1, pz0 + 0.35)); bag.add('marble_smooth', box(px - 0.3, y + 3.3, pz0 + 0.05, px + 0.3, y + 3.5, pz0 + 0.65)); col.circle(px, pz0 + 0.35, 0.22, y, y + 3.3); }
  bag.add(S, box(rx0, y + 3.5, pz0, rx1, y + 4.1, pz0 + 0.7));
  for (let k = 0; k < 3; k++) { const px = rx0 + (k + 0.5) * (rx1 - rx0) / 3; bag.add(S, box(px - pw / 2, y + 4.1, pz0, px + pw / 2, y + 4.3, pz1)); bayDome(bag, px, y + 3.5, (pz0 + pz1) / 2, pw / 2 - 0.1, (pz1 - pz0) / 2 - 0.05); }
  bag.add('marble', box(cx - 1.4, y - 0.4, pz0 - 0.7, cx + 1.4, y - 0.02, pz0)); col.floor([cx - 1.4, pz0 - 0.7, cx + 1.4, pz0], y - 0.4);
  // the ablution tap on the portico's side: a marble basin on a stand
  for (const sx of [-1, 1]) { const bx = sx < 0 ? rx0 + 1.2 : rx1 - 1.2; bag.add('marble', lathe([[0.001, 0], [0.45, 0.02], [0.5, 0.35], [0.45, 0.36], [0.001, 0.25]], 12, null, bx, y + 0.1, pz0 + 1.6)); col.circle(bx, pz0 + 1.6, 0.5, y + 0.1, y + 0.5); }
}

/** court_dress: { y, benches: [[x, z, yaw]], jars: [[x, z, yaw]], posts: [[x, z]], lamps: [[x, z]] } */
export function courtDress(el, { bag, col, lights }) {
  const y = el.y ?? 0;
  for (const [x, z, yaw] of el.benches ?? []) {
    const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    const part = (mat, u0, y0, v0, u1, y1, v1) => { const a = P(u0, v0), b = P(u1, v1); bag.add(mat, box(Math.min(a[0], b[0]), y0, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y1, Math.max(a[1], b[1]))); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    part('marble', -1.0, y + 0.42, -0.25, 1.0, y + 0.5, 0.25);
    for (const u of [-0.8, 0.8]) col.rect(part(S, u - 0.1, y, -0.22, u + 0.1, y + 0.42, 0.22), y, y + 0.5);
  }
  for (const [x, z, yaw] of el.jars ?? []) {
    bag.add(S, box(x - 0.6, y, z - 0.35, x + 0.6, y + 0.9, z + 0.35)); col.rect([x - 0.6, z - 0.35, x + 0.6, z + 0.35], y, y + 0.9);
    bag.add('marble', box(x - 0.65, y + 0.9, z - 0.4, x + 0.65, y + 0.98, z + 0.4));
    F.waterJar(bag, x - 0.25, y + 0.98, z, 1.2); F.waterJar(bag, x + 0.2, y + 0.98, z, 1.0); F.cup(bag, x + 0.5, y + 0.98, z + 0.1, 'bronze', 2.2); void yaw;
  }
  for (const [x, z] of el.posts ?? []) {
    bag.add(S, box(x - 0.25, y, z - 0.25, x + 0.25, y + 0.8, z + 0.25)); bag.add(S, box(x - 0.2, y + 0.8, z - 0.2, x + 0.2, y + 1.0, z + 0.2)); bag.add('iron', rod([x, y + 0.6, z - 0.26], [x, y + 0.6, z - 0.4], 0.02, 5)); col.rect([x - 0.25, z - 0.25, x + 0.25, z + 0.25], y, y + 1.0);
  }
  for (const [x, z] of el.lamps ?? []) {
    bag.add('iron', rod([x, y, z], [x, y + 3.6, z], 0.045, 6)); bag.add('iron', box(x - 0.2, y + 3.55, z - 0.2, x + 0.2, y + 3.62, z + 0.2));
    bag.add('lamp_glass', lathe([[0.12, 0], [0.18, 0.15], [0.12, 0.35], [0.001, 0.38]], 8, null, x, y + 3.62, z)); bag.add('iron', lathe([[0.16, 0], [0.001, 0.14]], 8, null, x, y + 4.0, z));
    col.circle(x, z, 0.06, y, y + 3.6);
    if (lights) lights.push({ at: [x, y + 3.8, z], color: '#ffc27a', intensity: 3, distance: 9 });
  }
}
