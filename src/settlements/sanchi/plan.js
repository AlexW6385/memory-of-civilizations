// Sanchi in the 1st century (docs/settlements/sanchi.md §2–§4, §10): the Great Stupa with its railings,
// gateways, companions, pillar and monasteries (the full building of the previous design,
// src/buildings/sanchi-great-stupa) on the summit; Stupa 2 on its terrace at the foot of the west slope;
// Temple 40's pillared hall on the summit; the monks and pilgrims.
import { TOP, STUPA2, TEMPLE40, height } from './layout.js';
import stupaPlan from '../../buildings/sanchi-great-stupa/plan.js';
import './style.js';
export const stupa = { ...stupaPlan, origin: [0, 0], base: TOP, district: undefined, view: [-32, -32, 32, 32], viewY: TOP };

// Stupa 2: turned so that its double stairway faces east, toward the hill [stated: the stairway faces east]
export const stupa2 = {
  id: 'sanchi-stupa2', style: 'sanchi-site', origin: STUPA2.c, base: 0, yaw: -90, feature: true, rooms: [],
  bounds: [-16, -16, 16, 16], entrance: { at: [0, -16], facing: 's' },
  elements: [{ t: 'stupa2', c: [0, 0], s: 0.39, y: STUPA2.y, rv: 11.5, h: 2.4 }],
};

// Stupa 2's terrace: a retaining wall of rubble faced with dressed stone, its paving; the flight up from the path
// on the north; Temple 40 on the summit
const [t0, z0, t1, z1] = STUPA2.terrace, cx = STUPA2.c[0];
export const site = {
  id: 'sanchi-site', style: 'sanchi-site', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [],
  bounds: [t0 - 4, z0 - 6, TEMPLE40.rect[2] + 8, TEMPLE40.rect[3] + 2], entrance: { at: [cx, z0 - 5], facing: 's' },
  elements: [
    { t: 'block', rect: [t0, z0, t1, z1], y0: -0.6, y1: STUPA2.y - 0.12, mat: 'rubble' },
    { t: 'block', rect: [t0 - 0.12, z0 - 0.12, t1 + 0.12, z1 + 0.12], y0: STUPA2.y - 0.12, y1: STUPA2.y - 0.04, mat: 'sandstone_dressed', collide: false },
    { t: 'floor', rect: [t0, z0, t1, z1], y: STUPA2.y, mat: 'sandstone_floor', th: 0.06 },
    { t: 'stair', rect: [cx - 2, z0 - 2.6, cx + 2, z0], dir: 's', y0: 0, y1: STUPA2.y, riser: 0.17, base: -0.3, mat: 'sandstone_dressed' },
    { t: 'temple40', c: TEMPLE40.c, y: TOP },
  ],
};

/** Monks in ochre robes, shaven and barefoot, walking round the stupas; lay pilgrims in white with turbans, women with offerings. */
function people() {
  const L = [], face = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 50;
  const monk = (at, y, dir, extra = {}) => L.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', over: 'sash', hair: 'shaven', feet: 'bare', skin: 'skin_medium', hat: 'none', carry: 'none', pose: 'stand', ...extra });
  const man = (at, y, dir, extra = {}) => L.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_dark', hat: 'turban', carry: 'none', pose: 'stand', ...extra });
  const woman = (at, y, dir, extra = {}) => L.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: 'cloth_red', cloth2: 'cloth_ochre', skin: 'skin_medium', hat: 'none', hair: 'bun', carry: 'basket', pose: 'stand', h: 1.5, ...extra });
  // round the Great Stupa, clockwise (keeping it on the right), on the ground walk and the terrace
  monk([-20.6, 2.5], TOP, [0, -1]); monk([-20.2, 5.0], TOP, [0, -1]);
  monk([14.4, -15.0], TOP, [0.7, 0.7]); man([3.5, -20.8], TOP, [1, 0.2]); woman([1.6, -21.0], TOP, [1, 0.1]);
  monk([12.8, 11.8], TOP + 4.3 * 1, [-0.7, 0.7]);
  // at the south gateway and Ashoka's pillar
  man([2.0, 29.5], TOP, [0, -1], { pose: 'talk' }); woman([3.2, 30.6], TOP, [-0.4, -1], { carry: 'pot' }); monk([-12.6, 31.2], TOP, [-1, 0.4], { pose: 'talk' });
  // Temple 40: monks in the hall, a lay donor with them
  const [tx, tz] = TEMPLE40.c, ty = TOP + 3.35;
  monk([tx - 3, tz + 1.8], ty, [0, -1]); monk([tx - 1.2, tz + 1.9], ty, [0, -1], { pose: 'talk' }); monk([tx + 0.6, tz + 1.8], ty, [-0.3, -1]);
  monk([tx - 1.2, tz - 1.2], ty, [0, 1], { pose: 'talk' }); man([tx + 5.4, tz - 0.5], ty, [-1, 0]);
  // Stupa 2: a monk at its east entrance, pilgrims coming from the path
  monk([cx + 14.8, -2.9], STUPA2.y, [0, 1]); man([cx - 3, z0 + 2.0], STUPA2.y, [0, 1]); woman([cx - 1.6, z0 + 1.2], STUPA2.y, [0.2, 1], { carry: 'pot' });
  // pilgrims climbing the north path to the summit
  for (const [x, z, k] of [[-1.5, -120, 0], [1.2, -116, 1], [0.6, -138, 2], [-0.8, -141, 3]]) {
    const y = height(x, z);
    if (k === 0) man([x, z], y, [0, 1]); else if (k === 1) woman([x, z], y, [0, 1]); else if (k === 2) monk([x, z], y, [0, 1]); else man([x, z], y, [0.1, 1], { carry: 'pole', cloth: 'cloth_ochre', hat: 'none' });
  }
  return { id: 'sanchi-people', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-300, -300, 300, 300], entrance: { at: [0, -180], facing: 's' } };
}
export const pilgrims = people();
export default stupa;
