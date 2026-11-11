// Shaolin's townscape (docs/settlements/shaolin.md §5–§7): the village before the gate (grey-brick and earth-walled houses under grey
// tile along the approach), and the people of the monastery: monks at their drill in the training hall (standing in the worn pits with
// staffs), kneeling in the Mahavira Hall, sweeping the courts, pilgrims and villagers in Ming dress, dogs. Several plans.
import '../../styles/shaolin/index.js';
import { PAL_HOUSE } from '../../styles/shaolin/index.js';
import { HOUSES, AXIS, PLAT, CELL, RADIUS, rng } from './layout.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 165], facing: 'n' } });

function village() {
  const E = [], r = rng(1590);
  for (const h of HOUSES) {
    const south = h.front === 's', rr = h.rect;
    const walls = south ? { n: 'plaster', e: 'plaster', w: 'plaster' } : { s: 'plaster', e: 'plaster', w: 'plaster' };
    E.push({ t: 'ming_hall', rect: rr, y: 0.25, H: 3.0 + r() * 0.5, front: h.front, four: false, roof: r() < 0.25 ? 'hip' : 'gable', plat: 0.25, platMargin: 0.25, eave: 0.8, pal: PAL_HOUSE, lat: 'lattice', walls, winWall: true });
    // a low earth wall closing the yard behind the house (the lot is 7 m deep behind it)
  }
  return E;
}

export async function town() {
  const rand = rng(1600), P = [], A = [];
  const robeMonk = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.7 ? 'cloth_grey' : 'cloth_ochre', cloth2: 'cloth_ochre', over: 'sash', skin: 'skin_medium', hat: 'none', hair: 'shaven', beard: false, feet: 'shod', ...o });
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'sash', skin: 'skin_medium', hat: rand() < 0.5 ? 'cap' : 'none', cap: 'ming', hair: 'netknot', beard: rand() < 0.3, feet: 'shod', ...o });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_ochre', 'cloth_maroon', 'cloth_green'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'collar', skin: 'skin_light', hat: 'none', hair: 'bun', feet: 'shod', h: 0.94, ...o });
  // the training hall: monks standing in the floor's pits in their stance, staff in hand, facing the Buddha (north)
  {
    const r = AXIS.qianfo, X0 = r[0] + 0.9, X1 = r[2] - 0.9, sx = (X1 - X0 - 5) / 7, pz0 = r[1] + 7.0, sz = (r[3] - 0.3 - 2.0 - pz0) / 5, yF = 0.02 + PLAT.qianfo + 0.05;
    const px = (i) => X0 + 2.5 + i * sx;
    for (const [i, j] of [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [1, 3], [3, 3], [5, 3], [6, 3], [2, 4], [4, 4]]) robeMonk([px(i), pz0 + j * sz], yF, 0, { carry: 'staff', len: 2.0, arms: 'staff', cloth: 'cloth_grey', over: 'none', legs: 'hose' });
    robeMonk([0, r[1] + 8.5], yF + 0.14, Math.PI, { pose: 'cross', over: 'cloak', cloth2: 'cloth_ochre' });            // the master, seated, facing them
  }
  // the Mahavira Hall: monks kneeling on the cushions before the altar at the hour of the recitation, the abbot's attendant at the drum
  {
    const r = AXIS.mahavira, y = 0.02 + PLAT.mahavira + 0.05, cx = 0;
    for (let rr = 0; rr < 2; rr++) for (let k = 0; k < 3; k++) if (rand() < 0.95) robeMonk([cx - 4.5 + k * 1.5, r[1] + 8.6 + rr * 1.1 + 0.1], y + 0.12, 0, { pose: 'kneel', arms: 'pray', over: 'cloak', cloth2: 'cloth_ochre' });
  }
  // the Dharma Hall: two monks at the reading tables
  { const r = AXIS.fatang, y = 0.02 + PLAT.fatang + 0.05; for (const s of [-1, 1]) robeMonk([s * 4.2 + 0.0, r[1] + 5.6 - 1.4], y, 0, { pose: 'stand', arms: 'hang' }); }
  // a monk in his cell, cross-legged on the rush cushion
  { const r = CELL.rect, y = 0.37 + 0.05; robeMonk([(r[0] + r[2]) / 2 + 1.6, r[3] - 2.4], y + 0.02, Math.PI, { pose: 'cross', over: 'none' }); }
  // the courts: monks sweeping, carrying water and wood, drilling with the staff in the court before the training hall; pilgrims at the censers
  for (let k = 0; k < 7; k++) robeMonk([-8 + k * 2.6, -66 + (k % 2) * 2.2], 0.02, (k % 3 - 1) * 0.5, { carry: 'staff', len: 2.0, arms: 'staff', over: 'none', legs: 'hose' });
  for (const [x, z] of [[-12, 70], [14, 52], [9, 24], [-9, 12], [-20, -38], [18, -42]]) robeMonk([x, z], 0.02, rand() * 6.28, { carry: 'broom', arms: 'sweep' });
  for (const [x, z] of [[-7, 100], [10, 66], [-27, 26], [6, -16]]) robeMonk([x, z], 0.02, rand() * 6.28, { carry: 'pole', arms: 'pole' });
  for (const [k, px] of [-9, -6.2, 6.2, 9].entries()) robeMonk([px, 93.6], 0.02 + PLAT.tianwang + 0.05 - 0.02, Math.PI * (k % 2), { pose: 'talk' });
  for (const [x, z, face] of [[5.9, 105.2, Math.PI / 2], [5.9, 106.4, Math.PI / 2], [5.9, 62.4, Math.PI / 2], [5.9, 22.4, Math.PI / 2]]) { const w = rand() < 0.5; (w ? woman : man)([x, z], 0.04, face, { pose: 'pray', arms: 'pray' }); }
  for (let k = 0; k < 22; k++) {
    const side = rand() < 0.5 ? -1 : 1, x = side * (6 + rand() * 40), z = 70 + rand() * 50;
    const r = rand(), at = [x, z];
    if (r < 0.45) man(at, 0.04, rand() * 6.28); else if (r < 0.8) woman(at, 0.04, rand() * 6.28); else man(at, 0.04, rand() * 6.28, { pose: 'talk' });
  }
  // the village road: people, a porter with a pole, children, dogs
  for (let k = 0; k < 16; k++) { const x = -70 + rand() * 140, z = 153 + rand() * 4; (rand() < 0.5 ? man : woman)([x, z], 0, rand() * 6.28); }
  for (let k = 0; k < 8; k++) A.push({ t: 'animal', kind: rand() < 0.8 ? 'dog' : 'cat', at: [-80 + rand() * 160, 152 + rand() * 12], y: 0, rot: rand() * 6.28, seed: k + 3 });
  const lifePlan = base('shaolin-people', 'life', [...P, ...A]);
  return [base('shaolin-village', 'shaolin', village()), lifePlan];
}
