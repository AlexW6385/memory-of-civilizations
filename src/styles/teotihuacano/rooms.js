// The rooms of a Teotihuacan apartment compound (docs/settlements/teotihuacan.md §5, §12): behind each
// portico on the main patio a row of two or three rooms, each entered from the portico by its own doorway,
// plastered, a red dado round the walls, the flat roof on beams; and the things of each — the household's
// shrine (an altar with its theatre censer and offerings) behind the principal portico; the kitchen with
// its hearth of three stones and the comal, the metate, the ollas, the water jar and the firewood, the soot
// over the fire; sleeping rooms with reed mats and folded blankets; store rooms of jars and baskets.

import { STYLES } from '../../core/build.js';
import { box, frustum } from '../../core/geom.js';
import { hearthKit, metateKit, ollaKit, waterJarKit, storeJarKit, bowlsKit, bedKit, soot, put } from '../maya/household.js';
import { tablero } from './index.js';
import { theatreCenser } from './palace.js';

const S = 'stucco_ochre', RD = 'stucco_red', WH = 'stucco_pale';

/**
 * The rooms in `back` (the block behind a portico, [x0, z0, x1, z1]) from floor ph to ceiling ceil, their front
 * to the patio side (fx, fz); `roles` the use of each room in turn across. Walls 0.45 m.
 */
export function porticoRooms(ctx, back, [fx, fz], ph, ceil, roles, rand) {
  const { bag, col } = ctx, L = STYLES.life.elements, t = 0.45, s = fx || fz;
  const front = fx ? (fx > 0 ? back[2] : back[0]) : (fz > 0 ? back[3] : back[1]), D = fx ? back[2] - back[0] : back[3] - back[1];
  const U0 = fx ? back[1] : back[0], U1 = fx ? back[3] : back[2];
  // local frame: u across the block, v from the front face inward
  const R = (u0, u1, v0, v1) => { const p = front - s * v0, q = front - s * v1, lo = Math.min(p, q), hi = Math.max(p, q); return fx ? [lo, u0, hi, u1] : [u0, lo, u1, hi]; };
  const P = (u, v) => (fx ? [front - s * v, u] : [u, front - s * v]);
  const inward = Math.atan2(-fx, -fz);                                    // yaw of a thing facing into the room, away from the door
  const W = (r, y0 = ph, y1 = ceil + 0.02) => { bag.add(S, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const n = roles.length, cell = (U1 - U0) / n, dh = Math.min(1.9, ceil - ph - 0.25), dw = 0.5;
  W(R(U0, U1, D - t, D));                                                 // the back wall
  W(R(U0, U0 + t, t, D - t)); W(R(U1 - t, U1, t, D - t));                 // the end walls
  for (let j = 1; j < n; j++) W(R(U0 + j * cell - t / 2, U0 + j * cell + t / 2, t, D - t));   // the partitions
  // the front wall with a doorway into each room, the wall carried over it
  let u = U0;
  for (let j = 0; j < n; j++) {
    const m = U0 + (j + 0.5) * cell;
    W(R(u, m - dw, 0, t)); u = m + dw;
    const o = R(m - dw, m + dw, 0, t); bag.add(S, box(o[0], ph + dh, o[1], o[2], ceil + 0.02, o[3]));
    const th = R(m - dw, m + dw, -0.04, t + 0.04); bag.add('andesite', box(th[0], ph - 0.02, th[1], th[2], ph + 0.04, th[3]));   // the threshold stone
  }
  W(R(u, U1, 0, t));
  // each room in two: the front room on the portico, a back room through a doorway in the cross wall
  const Dm = Math.min(D - 3.4, Math.max(3.6, D * 0.48));
  const cells = [];
  for (let j = 0; j < n; j++) {
    const a0 = U0 + j * cell + (j ? t / 2 : t), a1 = U0 + (j + 1) * cell - (j < n - 1 ? t / 2 : t), m = (a0 + a1) / 2;
    if (roles[j] === 'shrine') { W(R(a0, a1, Dm, Dm + t)); cells.push([j, a0, a1, t, Dm, 'shrine', true, false]); continue; }    // the shrine closed behind
    W(R(a0, m - dw, Dm, Dm + t)); W(R(m + dw, a1, Dm, Dm + t));
    const o = R(m - dw, m + dw, Dm, Dm + t); bag.add(S, box(o[0], ph + dh, o[1], o[2], ceil + 0.02, o[3]));
    cells.push([j, a0, a1, t, Dm, roles[j], true, true], [j, a0, a1, Dm + t, D - t, roles[j] === 'kitchen' ? 'store' : roles[j] === 'store' ? 'sleep' : (rand() < 0.5 ? 'sleep' : 'store'), false, false]);
  }
  for (const [j, a0, a1, v0, v1, role, isFront, backDoor] of cells) {
    const f = ph + 0.03, m = (a0 + a1) / 2;
    const I = R(a0, a1, v0, v1);
    bag.add(WH, frustum(I, ph - 0.1, f, 0, 0, 0, 0, { noBottom: true })); col.floor(I, f);
    // the red dado round the walls, lime plaster above it; the beams of the roof across the room
    const e = 0.02, dado = f + 0.9;
    for (const q of [...(backDoor ? [R(a0, m - dw, v1 - e, v1), R(m + dw, a1, v1 - e, v1)] : [R(a0, a1, v1 - e, v1)]), R(a0, a0 + e, v0 + e, v1 - e), R(a1 - e, a1, v0 + e, v1 - e), R(a0, m - dw, v0, v0 + e), R(m + dw, a1, v0, v0 + e)]) {
      bag.add(RD, box(q[0], f, q[1], q[2], dado, q[3])); bag.add('lime_plaster', box(q[0], dado, q[1], q[2], ceil, q[3]));
    }
    for (let v = v0 + 0.45; v < v1 - 0.2; v += 0.85) { const q = R(a0 - 0.1, a1 + 0.1, v - 0.1, v + 0.1); bag.add('viga', box(q[0], ceil - 0.18, q[1], q[2], ceil + 0.02, q[3])); }
    const A = (uu, vv) => P(uu, vv), at3 = (uu, vv) => { const [x, z] = P(uu, vv); return [x, f, z]; }, w = a1 - a0, d = v1 - v0;
    if (role === 'shrine') {
      // the altar against the back wall: a talud and a framed tablero, the theatre censer on it, offerings and a mat before it
      const [cx, cz] = A(m, v1 - 0.85), h = 0.7;
      bag.add(RD, frustum([cx - 0.7, cz - 0.7, cx + 0.7, cz + 0.7], f, f + h * 0.4, 0.12, 0.12, 0.12, 0.12, { noBottom: true, noTop: true }));
      tablero(bag, [cx - 0.6, cz - 0.6, cx + 0.6, cz + 0.6], f + h * 0.4, f + h, { out: 0.07, discs: false });
      bag.add(WH, frustum([cx - 0.52, cz - 0.52, cx + 0.52, cz + 0.52], f + h - 0.08, f + h + 0.02, 0, 0, 0, 0, { noBottom: true }));
      col.rect([cx - 0.7, cz - 0.7, cx + 0.7, cz + 0.7], f, f + h + 0.02);
      theatreCenser().emit(bag, cx, f + h + 0.02, cz, -Math.sin(inward), -Math.cos(inward));
      put(bag, bowlsKit(RD), ...at3(m - 1.2, v1 - 0.6), inward);
      const mt = R(m - 0.7, m + 0.7, v1 - 3.0, v1 - 1.75); bag.add('reed_mat', box(mt[0], f, mt[1], mt[2], f + 0.02, mt[3]));
      soot(bag, [cx, ceil, cz], [0, -1, 0], 1.0, 0.8, j + 3);
    } else if (role === 'kitchen') {
      // the hearth in a back corner, its soot up the wall and over the ceiling; the metate, the pots, the water jar by the door, firewood
      const hu = a0 + 0.85, hv = v1 - 0.85, [hx, hz] = A(hu, hv);
      put(bag, hearthKit('rubble'), hx, f, hz, inward);
      col.circle(hx, hz, 0.45, f, f + 0.3);
      const bw = R(hu, hu, v1 - 0.02, v1 - 0.02); soot(bag, [fx ? bw[0] : hx, f + 1.0, fx ? hz : bw[1]], [fx, 0, fz], 1.2, 1.8, j + 7);
      soot(bag, [hx, ceil, hz], [0, -1, 0], 1.5, 1.4, j + 9);
      for (const [du, dv] of [[0.95, -0.15], [0.3, -1.05]]) put(bag, ollaKit(), ...at3(hu + du, hv + dv), 0);
      const [mx, mz] = A(a1 - 0.75, v0 + 1.6); put(bag, metateKit(), mx, f, mz, inward - Math.PI / 2);
      if (rand() < 0.6) L.figure({ at: A(a1 - 0.75 - 0.0, v0 + 1.6 + 0.0), y: f, rot: inward - Math.PI / 2, seed: Math.floor(rand() * 1e9), pose: 'kneel', dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_ochre', skin: 'skin_medium', hair: 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx);
      const [wx, wz] = A(a0 + 0.5, v0 + 0.55); put(bag, waterJarKit(), wx, f, wz, 0); col.circle(wx, wz, 0.33, f, f + 0.8);
      L.firewood({ at: A(a0 + 0.4, v0 + 1.9), y: f, rot: inward, len: 1.0, seed: j }, ctx);
      put(bag, storeJarKit(), ...at3(a1 - 0.45, v1 - 0.45), 0);
    } else if (role === 'store') {
      // jars along one side wall in two rows, a basket of pigments, an olla
      for (let k = 0; k < 12; k++) {
        const vv = v0 + 0.85 + (k >> 1) * 0.62; if (vv > v1 - 0.35) break;
        const [x, z] = A(a0 + 0.42 + (k & 1) * 0.58, vv); put(bag, storeJarKit(), x, f, z, 0); col.circle(x, z, 0.26, f, f + 0.6);
      }
      L.basket({ at: A(a1 - 0.55, v1 - 0.7), y: f, seed: Math.floor(rand() * 1e6), n: 2, goods: 'paint_ochre' }, ctx);
      put(bag, ollaKit(), ...at3(a1 - 0.5, v0 + 1.0), 1);
    } else {
      // sleeping: mats along the side walls with folded blankets; a jar, a basket and the cups by the door
      for (const k of d > 2.6 ? [0, 1] : [0]) {
        const side = k ? a1 - 0.6 : a0 + 0.6, [x, z] = A(side, v1 - 1.3);
        put(bag, bedKit(rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', rand() < 0.5 ? 'cloth_red' : 'cloth_brown'), x, f, z, inward + Math.PI / 2 + (k ? Math.PI : 0));
      }
      if (d > 3.2) {
        put(bag, storeJarKit(), ...at3(a0 + 0.42, v0 + 0.45), 0);
        put(bag, bowlsKit(rand() < 0.5 ? RD : 'paint_ochre'), ...at3(a0 + 0.45, v0 + 1.05), inward);
        L.basket({ at: A(a1 - 0.5, v0 + 0.55), y: f, seed: Math.floor(rand() * 1e6), n: 1 }, ctx);
      }
    }
  }
}
