// A bottega and the wool trade's dyers by the Arno (docs/settlements/florence.md §5). Pure data: the builders
// are the renaissance style's (bottega, tintoria, tiratoio) and the shared objects (life).

import { BOTTEGA, TINTORI } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
const FIG = { dress: 'robe', legs: 'hose', skin: 'skin_light' };

export function craftPlans() {
  const [b0, c0, b1, c1] = BOTTEGA, bx = (b0 + b1) / 2, fl = 0.12;
  // the bottega and its people: the master at the easel, an apprentice grinding colours, a boy at the gessoed panel
  const shop = plan('florence-bottega', 'renaissance', [{ t: 'bottega', rect: BOTTEGA, y: 0, front: 'n' }], [b0 - 1.5, c0 - 1.5, b1 + 1.5, c1 + 1.5],
    { rooms: [{ id: 'bottega', rect: [b0 + 0.6, c0 + 0.6, b1 - 0.6, c1 - 0.6], y: fl, kind: 'chamber' }], entrance: { at: [b0 + 3.4, c0 - 1], facing: 's' } });
  const ix0 = b0 + 0.6, ix1 = b1 - 0.6, iz0 = c0 + 0.6, iz1 = c1 - 0.6, P = (u, v) => [ix0 + (ix1 - ix0) * u, iz0 + (iz1 - iz0) * v];
  const people = plan('florence-bottega-people', 'life', [
    { t: 'figure', at: P(0.24, 0.27), y: fl, rot: Math.PI, seed: 1435, h: 1.72, pose: 'stand', arms: 'talk', ...FIG, cloth: 'cloth_red', cloth2: 'cloth_black', hat: 'cap', over: 'none', beard: false },
    { t: 'figure', at: P(0.52, 0.4), y: fl, rot: Math.PI, seed: 1452, h: 1.6, pose: 'stand', ...FIG, cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'none', over: 'none', beard: false, hair: 'long' },
    { t: 'figure', at: P(0.24, 0.6), y: fl, rot: 0, seed: 1466, child: true, pose: 'stand', ...FIG, cloth: 'cloth_white', cloth2: 'cloth_grey', hat: 'none', over: 'none' },
    { t: 'figure', at: [b0 + 3.2, c0 - 1.6], y: 0, rot: 0.3, seed: 1470, pose: 'talk', ...FIG, cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'cap', over: 'cape' },
  ], [b0 - 3, c0 - 3, b1, c1], { center: [bx, (c0 + c1) / 2], near: 200 });
  // the dyers' yard: the dyeworks' shed, two drying sheds, bales of undyed cloth and wool, carts, the dyers at work
  const [t0, u0, t1, u1] = TINTORI;
  const yard = plan('florence-tintori', 'renaissance', [
    { t: 'tintoria', rect: [t0 + 4, u0 + 4, t0 + 28, u0 + 11], y: 0 },
    { t: 'tiratoio', rect: [t0 + 34, u0 + 5, t0 + 70, u0 + 11], y: 0 },
    { t: 'tiratoio', rect: [t0 + 78, u0 + 5, t0 + 114, u0 + 11], y: 0 },
  ], TINTORI, { center: [(t0 + t1) / 2, (u0 + u1) / 2], near: 320, rooms: [{ id: 'tintori', rect: [t0 + 2, u0 + 13, t1 - 2, u1 - 1], y: 0, kind: 'open', market: false }] });
  const L = [];
  for (let k = 0; k < 4; k++) L.push({ t: 'figure', at: [t0 + 4 + (k + 0.5) * 6, u0 + 4 + 7 * 0.38 - 1.6], y: 0, rot: Math.PI, seed: 1378 + k, pose: k % 2 ? 'stand' : 'punt', poleMat: 'timber', ...FIG, cloth: 'cloth_grey', cloth2: 'cloth_indigo', hat: k % 2 ? 'cap' : 'none', over: 'none', legs: 'bare', feet: 'bare' });
  for (const [x, z, n] of [[t0 + 30, u0 + 15, 0], [t0 + 72, u0 + 16, 1], [t0 + 118, u0 + 15, 2], [t0 + 22, u0 + 17, 3]]) {
    L.push({ t: 'sacks', at: [x, z], rot: 0.4 * n, seed: 40 + n });
    L.push({ t: 'crates', at: [x + 1.6, z + 0.6], rot: 0.2 * n, seed: 50 + n });
  }
  L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'donkey', at: [t0 + 50, u0 + 18], rot: Math.PI / 2, seed: 60 });
  L.push({ t: 'cart', kind: 'four', load: 'barrels', at: [t0 + 96, u0 + 18.5], rot: -Math.PI / 2, seed: 61 });
  for (const [x, z, carry, rot] of [[t0 + 38, u0 + 14, 'bundle', 1.6], [t0 + 60, u0 + 13.5, 'none', -1.6], [t0 + 84, u0 + 14, 'sack', 1.4], [t0 + 108, u0 + 13.5, 'bundle', -1.5], [t0 + 14, u0 + 14.5, 'none', 3.1]])
    L.push({ t: 'figure', at: [x, z], y: 0, rot, seed: Math.floor(x * 13 + z), pose: carry === 'none' ? 'talk' : 'stand', carry, ...FIG, cloth: ['cloth_grey', 'cloth_brown', 'cloth_indigo'][Math.floor(x) % 3], cloth2: 'cloth_brown', hat: 'cap', over: 'none' });
  // cloth rinsed in the river from the bank: a dyer with a long pole at the water's edge
  L.push({ t: 'figure', at: [t0 + 26, u1 + 1.5], y: 0, rot: Math.PI, seed: 1382, pose: 'punt', poleMat: 'timber', ...FIG, cloth: 'cloth_grey', cloth2: 'cloth_red', legs: 'bare', feet: 'bare', hat: 'none', over: 'none' });
  const yardLife = plan('florence-tintori-life', 'life', L, TINTORI, { center: [(t0 + t1) / 2, (u0 + u1) / 2], near: 260 });
  return [shop, people, yard, yardLife];
}
