// Bauhaus Dessau — the standing life at the arrival and in the school's garden (docs/settlements/bauhaus-dessau.md §12): students and masters on Mauerstrasse's
// pavements and in the garden, bicycles wheeled and leaning, a car or two at the kerb, the benches and the beds tended. Positions are derived from layout.js.
import { ROAD_M, FOOT, GARDEN, GARDEN_GATE, GARDEN_PATHS, GARDEN_BEDS, GARDEN_SHED, B } from './layout.js';

/** The bicycles wheeled in the street (style elements, built with the garden's plan). */
export const WHEELED = [{ t: 'bicycle', at: [ROAD_M[2] - 2.25, 36.4], rot: 0, y: 0 }, { t: 'bicycle', at: [ROAD_M[2] - 1.35, 26.2], rot: 0, y: 0 }];

/** Pushes the figures and cars into P; `mk` = { fig, woman, P, pick, rand } are the helpers of town.js's life(). */
export function streetLife({ fig, woman, P, rand }) {
  const Ee = ROAD_M[2];                                   // the roadway's east edge (the glass wall's side)
  const Wk = ROAD_M[0];                                   // ... and its west edge
  const wallWalk = Ee + FOOT / 2;                         // the pavement beside the glass wall
  const mf = (x, z, r, o = {}) => fig([x, z], r, o), mw = (x, z, r, o = {}) => woman([x, z], r, o);
  // ── on the pavement beside the glass wall: students going to the workshops, a pair talking, one wheeling a bicycle ──
  mf(wallWalk, 40.5, -1.6, { pose: 'talk', cloth: 'cloth_grey', hat: 'brim', cloth2: 'cloth_black' }); mw(wallWalk + 0.7, 40.2, 1.6, { pose: 'talk', cloth: 'cloth_ochre' });
  mw(wallWalk - 0.2, 24.5, 0.2, { cloth: 'cloth_blue' }); mf(wallWalk + 0.1, 17.0, 3.3, { cloth: 'cloth_indigo' });
  mf(wallWalk, 12.2, 0.1, { cloth: 'cloth_brown', hat: 'cap' });
  // a student wheeling her bicycle along the kerb (the bicycle at her side), another sitting on the kerb with a book
  mw(Ee - 1.6, 36.0, 0.15, { cloth: 'cloth_green' });
  mf(Ee - 2.0, 26.0, 3.0, { cloth: 'cloth_grey' });
  // the roadway: a master in a long coat and a felt hat with a student at his side, a woman with a basket crossing, a boy running
  mf(Wk + 7.5, 33.0, -1.57, { hat: 'brim', over: 'cloak', cloth: 'cloth_black', cloth2: 'cloth_black', beard: true, pose: 'stand' }); mw(Wk + 8.7, 33.4, 1.57, { cloth: 'cloth_red', pose: 'stand' });
  mw(Wk + 4.5, 20.5, 0.4, { hat: 'cap', carry: 'basket', hair: 'bun', cloth: 'cloth_brown' });
  P.push({ t: 'figure', at: [Wk + 10.5, 51.5], y: 0, rot: 3.6, seed: 7771, dress: 'trousers', cloth: 'cloth_blue', cloth2: 'cloth_grey', skin: 'skin_light', hat: 'cap', hair: 'short', hairMat: 'hair_dark', feet: 'shod', child: true, pose: 'stand' });
  // the west pavement before the shops: loiterers at a Litfass pillar, a woman at a window, a delivery boy
  mf(Wk - 1.2, 38.0, 1.4, { hat: 'brim', cloth: 'cloth_black', pose: 'stand' }); mw(Wk - 1.9, 31.0, 0.2, { hat: 'cap', carry: 'basket', hair: 'bun', cloth: 'cloth_grey' });
  mf(Wk - 1.4, 52.0, 3.3, { hat: 'cap', carry: 'basket', cloth: 'cloth_white', cloth2: 'cloth_brown' });
  // a Dixi at the east kerb opposite the wing, a delivery van at the west kerb
  P.push({ t: 'car', at: [Ee - 1.3, 31.0], y: 0, rot: 0.05, seed: 31, era: 1930, mat: 'car_blue' });
  P.push({ t: 'car', at: [Wk + 1.4, 22.0], y: 0, rot: Math.PI - 0.03, seed: 32, era: 1930, mat: 'car_cream' });
  // ── the garden ──
  const gx0 = GARDEN[0], path = GARDEN_PATHS[0];
  // at the gate: three students with portfolios, the notice board read by one
  mw(gx0 + 2.2, GARDEN_GATE[1] + 2.8, 3.3, { cloth: 'cloth_blue', pose: 'stand' }); mf(gx0 + 3.3, GARDEN_GATE[1] + 2.9, 3.0, { cloth: 'cloth_grey', hat: 'cap', pose: 'stand' });
  mw(gx0 + 4.4, 49.2, -1.5, { cloth: 'cloth_ochre', pose: 'talk' }); mf(gx0 + 5.8, 49.6, 1.7, { cloth: 'cloth_indigo', pose: 'talk', beard: true });
  // on the benches along the path (the sitters face the bed or the path), a student reading on the grass, a pair at the table under the birches
  for (const [x, z, r, w] of [[-8, path[1] - 0.6, Math.PI, 1], [2, path[1] - 0.6, Math.PI, 0], [-4, path[3] + 0.6, 0, 1], [14, path[3] + 0.6, 0, 0]]) (w ? mw : mf)(x - 0.3, z + (r ? -0.1 : 0.1), r, { pose: 'sit', cloth: w ? 'cloth_green' : 'cloth_brown' });
  for (const [x, z, r] of [[-10, 46.5, 0.7], [-1.5, 56.4, 5.4], [3, 45, 2.4]]) mw(x, z, r, { pose: 'sit_ground', cloth: 'cloth_white' });
  mf(-11.4, 47.2, 1.3, { pose: 'sit_ground', cloth: 'cloth_brown' }); mf(5.5, 43.5, 3.9, { pose: 'sit_ground', cloth: 'cloth_grey' });
  for (const [x, z, r, w] of [[-5.6, 43.4, 3.14, 1], [-4.0, 43.4, 3.14, 0], [-5.6, 45.6, 0, 0], [-4.0, 45.6, 0, 1]]) (w ? mw : mf)(x, z, r, { pose: 'sit', cloth: w ? 'cloth_red' : 'cloth_indigo' });
  // gardeners at the beds: bending women, a man with a hoe, a girl with a watering can (a basket), seven in all
  GARDEN_BEDS.forEach((b, i) => {
    if (i % 3 === 1) return;
    const x = (b[0] + b[2]) / 2 + (i % 2 ? 0.9 : -0.9);
    (i % 2 ? mw : mf)(x, 57 + (i * 1.7) % 9, i % 2 ? 1.57 : -1.57, { hat: 'cap', cloth: i % 2 ? 'cloth_blue' : 'cloth_brown', carry: i % 4 === 0 ? 'hoe' : i % 3 === 0 ? 'basket' : undefined, pose: 'stand' });
  });
  // a volleyball game: three on a side, a spectator
  for (const [x, z, r, w] of [[21.5, 58, -1.57, 0], [21.5, 61, -1.57, 1], [20, 63.5, -1.57, 0], [26.5, 58.5, 1.57, 1], [26.5, 61.5, 1.57, 0], [28, 56.5, 1.57, 1], [24, 54.8, 3.14, 0]]) (w ? mw : mf)(x, z, r, { pose: 'stand', cloth: w ? 'cloth_red' : 'cloth_grey' });
  // students at the bicycle shed: three taking out their bicycles
  mf(GARDEN_SHED[0] + 3.0, GARDEN_SHED[3] + 1.4, 3.14, { cloth: 'cloth_brown' }); mw(GARDEN_SHED[0] + 4.1, GARDEN_SHED[3] + 1.2, 0.3, { cloth: 'cloth_blue' }); mf(GARDEN_SHED[0] + 8.3, GARDEN_SHED[3] + 1.5, 0.2, { cloth: 'cloth_indigo', hat: 'cap' });
  // the Prellerhaus's balconies on its east face (the studios' girls and boys out in the sun, one reading, one sewing), five of the 28
  const SZ = (B.pre[3] - 0.3 - (B.pre[1] + 0.3)) / 7, zm = (i) => B.pre[1] + 0.3 + i * SZ + SZ / 2, PLY = [3.45, 6.6, 9.75, 12.9];
  for (const [k, i, w] of [[0, 2, 1], [1, 5, 0], [2, 1, 1], [3, 4, 1], [3, 0, 0]]) (w ? mw : mf)(50.4, zm(i), -1.57, { y: PLY[k] , pose: 'stand', cloth: w ? 'cloth_red' : 'cloth_grey', hat: 'none' });
  // at the glass wall's foot: a girl on the plinth steps of the vestibule's door, a workman sweeping the pavement
  mf(B.ww[0] - 1.2, 8.0, 0, { cloth: 'cloth_grey', hat: 'cap', carry: 'broom' });
  void rand;
}
