// Sanchi in the 1st century (docs/settlements/sanchi.md §2–§4, §10): the Great Stupa with its railings,
// gateways, companions, pillar and monasteries (the full building of the previous design,
// src/buildings/sanchi-great-stupa) on the summit; Stupa 2 on its terrace at the foot of the west slope;
// Temple 40's pillared hall on the summit; the monks and pilgrims.
import { TOP, STUPA2, TEMPLE40, VOTIVE, VIHARA2, height } from './layout.js';
import stupaPlan from '../../buildings/sanchi-great-stupa/plan.js';
import './style.js';
import { summitElements, SUMMIT_STALLS, HALL2, BOWL } from './summit.js';
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
  bounds: [t0 - 4, -84, TEMPLE40.rect[2] + 52, 100], entrance: { at: [cx, z0 - 5], facing: 's' },
  elements: [
    { t: 'block', rect: [t0, z0, t1, z1], y0: -0.6, y1: STUPA2.y - 0.12, mat: 'rubble' },
    { t: 'block', rect: [t0 - 0.12, z0 - 0.12, t1 + 0.12, z1 + 0.12], y0: STUPA2.y - 0.12, y1: STUPA2.y - 0.04, mat: 'sandstone_dressed', collide: false },
    { t: 'floor', rect: [t0, z0, t1, z1], y: STUPA2.y, mat: 'sandstone_floor', th: 0.06 },
    { t: 'stair', rect: [cx - 2, z0 - 2.6, cx + 2, z0], dir: 's', y0: 0, y1: STUPA2.y, riser: 0.17, base: -0.3, mat: 'sandstone_dressed' },
    { t: 'temple40', c: TEMPLE40.c, y: TOP },
    ...VOTIVE.map(([x, z, s]) => ({ t: 'stupa', c: [x, z], s, y: TOP, gates: [], stair: false })),
    ...offerings(),
    ...summitElements(),
  ],
};

/**
 * The offerings at the Great Stupa (docs/settlements/sanchi.md §11): garlands swagged between each gateway's
 * posts and looped round them, as the reliefs show heavenly figures and dwarfs bearing garlands to the stūpa;
 * flowers heaped on leaves and little lamps at the posts' feet and at the foot of the double stairway.
 */
function offerings() {
  const E = [], W = 2.1, P = 0.35, R = 27, mats = [['cloth_white'], ['cloth_white', 'cloth_red'], ['cloth_red', 'cloth_white']];
  for (const [i, [dx, dz]] of [[1, 0], [0, 1], [-1, 0], [0, -1]].entries()) {
    const ux = -dz, uz = dx, c = [dx * R, dz * R], m = mats[i % 3];
    for (const f of [-1, 1]) {
      const fy = TOP + 3.6 + (f > 0 ? 0 : 0.25), o = f * (P + 0.06);
      E.push({ t: 'rite', kind: 'garland', a: [c[0] - ux * (W - P) + dx * o, fy, c[1] - uz * (W - P) + dz * o], b: [c[0] + ux * (W - P) + dx * o, fy, c[1] + uz * (W - P) + dz * o], sag: 0.7, mats: m });
    }
    for (const k of [-1, 1]) {
      const px = c[0] + ux * k * W, pz = c[1] + uz * k * W;
      // a garland looped over the post's outer face, its two ends falling
      E.push({ t: 'rite', kind: 'loop', at: [px + dx * (P + 0.04), TOP + 2.3, pz + dz * (P + 0.04)], ux, uz, w: 0.55, drop: 0.35, mats: m });
      // at the post's inner foot (toward the stūpa) flowers on a leaf and a lamp
      const fx = px - dx * (P + 0.35) - ux * k * 0.2, fz = pz - dz * (P + 0.35) - uz * k * 0.2;
      E.push({ t: 'rite', kind: 'plate', at: [fx, fz], y: TOP + 0.02, mats: m }, { t: 'rite', kind: 'lamp', at: [fx - ux * k * 0.35, fz - uz * k * 0.35], y: TOP + 0.02 });
    }
  }
  // at the foot of the double stairway (its flights rise from x = ±7 m along z ≈ 18.3–19.9)
  for (const sx of [-1, 1]) E.push({ t: 'rite', kind: 'offering', at: [sx * 7.6, 20.6], y: TOP + 0.02, n: [0, 1], seed: sx > 0 ? 1 : 2 });
  E.push({ t: 'rite', kind: 'lamps', at: [-5, 20.4], to: [5, 20.4], y: TOP + 0.02, count: 9 });
  return E;
}

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
  // where the north path comes onto the summit: a woman selling flowers from her mat, a buyer
  L.push({ t: 'goods_mat', at: [6.5, -86], y: height(6.5, -86), rot: face([-1, 0]), seed: 5, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_white', 'cloth_red'] });
  woman([7.5, -86], height(7.5, -86), [-1, 0], { pose: 'sit_ground', carry: 'none' }); man([5.2, -84.8], height(5.2, -84.8), [1, -0.3], { pose: 'talk' });
  // pilgrims climbing the north path to the summit
  for (const [x, z, k] of [[-1.5, -120, 0], [1.2, -116, 1], [0.6, -138, 2], [-0.8, -141, 3]]) {
    const y = height(x, z);
    if (k === 0) man([x, z], y, [0, 1]); else if (k === 1) woman([x, z], y, [0, 1]); else if (k === 2) monk([x, z], y, [0, 1]); else man([x, z], y, [0.1, 1], { carry: 'pole', cloth: 'cloth_ochre', hat: 'none' });
  }
  // the south approach (the arrival's view): the sellers sitting behind their stalls, buyers and pilgrims on the way, monks with their bowls
  const SY = TOP + 0.03;
  for (const [sx, sz, front, trade] of SUMMIT_STALLS) {
    const d = front === 'e' ? [1, 0] : [-1, 0];
    woman([sx - d[0] * 0.2, sz + 0.1], TOP + 0.15, d, { pose: 'sit_low', carry: 'none', cloth: trade === 'robes' ? 'cloth_ochre' : (seed % 2 ? 'cloth_red' : 'cloth_indigo') });
    if (seed % 3) man([sx + d[0] * 2.3, sz - 0.9], SY, [-d[0], 0.3], { carry: seed % 2 ? 'basket' : 'none', pose: seed % 4 === 0 ? 'talk' : 'stand' });
  }
  // (none within 4 m ahead of the arrival at z = 55: those at the way's sides, the rest well up toward the gateway or behind the visitor)
  for (const [x, z, dir] of [[3.2, 47, [0, -1]], [-3.1, 43.5, [0.1, -1]], [1.2, 39.5, [0, 1]], [-2.6, 36, [0, -1]], [3.0, 33, [-0.3, -1]], [0.4, 66, [0, 1]], [-0.9, 72, [0.1, -1]], [1.6, 79, [0, -1]], [-1.1, 86, [0, 1]]]) {
    if (seed % 2) woman([x, z], SY, dir, { carry: seed % 3 ? 'pot' : 'basket' }); else man([x, z], SY, dir);
  }
  // on the stone seats along the way, resting: a woman with her basket, a lay pilgrim, a monk
  woman([5.6, 52.5], TOP, [-1, 0], { pose: 'sit', carry: 'basket' }); man([-5.6, 52.1], TOP, [1, 0.1], { pose: 'sit' }); monk([-5.6, 66.5], TOP, [1, 0], { pose: 'sit' }); woman([5.6, 80.5], TOP, [-1, 0], { pose: 'sit', carry: 'pot' });
  // flower- and lamp-sellers on mats at the way's head, before the gateway, each with a buyer; a boy and his dog; a white zebu standing at the way's side
  for (const [x, z, g, c, f] of [[6.4, 40.5, ['heap', 'heap', 'baskets'], ['cloth_red', 'cloth_ochre'], [-1, 0]], [-6.6, 39.5, ['baskets', 'heap'], ['cloth_white', 'cloth_ochre'], [1, 0]], [7.8, 35.5, ['heap', 'baskets'], ['cloth_white', 'cloth_red'], [-1, 0]], [-7.8, 35, ['heap', 'heap'], ['cloth_red', 'cloth_white'], [1, 0]]]) {
    L.push({ t: 'goods_mat', at: [x, z], y: TOP, rot: face(f), seed: seed++, goods: g, produce: c });
    woman([x - f[0] * 1.3, z + 0.2], TOP, f, { pose: 'sit_ground', carry: 'none', cloth: x > 0 ? 'cloth_indigo' : 'cloth_red' });
  }
  man([4.4, 38.2], TOP, [1, 0.2], { pose: 'talk' }); woman([5.0, 37.4], TOP, [-0.6, 0.3], { carry: 'basket' });
  L.push({ t: 'figure', at: [-4.6, 45.5], y: TOP, rot: face([0.4, -1]), seed: seed++ * 7919, dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_dark', hat: 'none', hair: 'short', pose: 'stand', carry: 'none', feet: 'bare', h: 1.05 });
  L.push({ t: 'animal', kind: 'dog', at: [-3.5, 46.8], y: TOP, rot: 2.6, seed: seed++ });
  L.push({ t: 'animal', kind: 'zebu', at: [-9.5, 41.5], y: TOP, rot: 1.2, seed: seed++, graze: false, mat: 'hide_white' });
  // before the south gateway: donors kneeling with garlands toward the dome, a monk standing by
  for (const [x, z, k] of [[-3.4, 30.2, 0], [-1.7, 30.9, 1], [1.8, 30.6, 2], [3.5, 31.2, 3]]) (k % 2 ? woman : man)([x, z], TOP, [0, -1], { pose: 'kneel', arms: 'pray', carry: 'none' });
  monk([6.2, 32.4], TOP, [-0.4, -1]);
  monk([2.2, 61], SY, [0, -1], { carry: 'staff' }); monk([-2.0, 75], SY, [0.2, 1], { carry: 'staff' }); monk([3.0, 88], SY, [0, -1], { pose: 'talk' });
  L.push({ t: 'figure', at: [-1.9, 63.5], y: SY, rot: face([1, 0]), seed: seed++ * 7919, dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_dark', hat: 'none', hair: 'short', pose: 'stand', carry: 'none', feet: 'bare', h: 0.62 });
  L.push({ t: 'animal', kind: 'zebu', at: [-19, 66], y: TOP, rot: 0.9, seed: seed++, graze: true, mat: 'hide_white' });
  L.push({ t: 'animal', kind: 'dog', at: [6.5, 60.5], y: SY, rot: 2.2, seed: seed++ });
  L.push({ t: 'animal', kind: 'dog', at: [-7, 83], y: SY, rot: 4.1, seed: seed++ });
  // the second rest hall: monks and pilgrims at rest
  const [h0, h1, h2, h3] = HALL2, hy = TOP + 0.5;
  monk([h0 + 3, h1 + 1.1], hy, [0, 1], { pose: 'cross' }); man([h0 + 6.5, h1 + 1.1], hy, [0, 1], { pose: 'sit_low' }); man([(h0 + h2) / 2, (h1 + h3) / 2 + 0.2], hy, [0, 1], { pose: 'cross', top: 'bare' }); woman([h2 - 1.3, h3 - 1.2], hy, [-1, 0], { carry: 'pot' });
  // the monastery's court: monks seated in the assembly's pavilion before the teacher on his stone seat, one at the well
  const vx = 49, vz = 17, vy = TOP + 0.4;
  monk([vx, vz - 2.0], vy + 0.4, [0, 1], { pose: 'cross', arms: 'pray' });
  for (const [dx, dz] of [[-1.7, 0.9], [0, 1.5], [1.7, 0.9], [-0.8, 2.4], [0.9, 2.4]]) monk([vx + dx, vz + dz], vy, [0, -1], { pose: 'cross' });
  monk([vx - 5.5 + 1.4, vz + 4], TOP, [-1, 0], { carry: 'pot' });
  // the second monastery's court: monks seated before the teacher in the pavilion
  { const wx = (VIHARA2[0] + VIHARA2[2]) / 2, wz = (VIHARA2[1] + VIHARA2[3]) / 2, wy = TOP + 0.4;
    monk([wx, wz - 2.0], wy + 0.4, [0, 1], { pose: 'cross', arms: 'pray' });
    for (const [dx, dz] of [[-1.5, 1.0], [0.2, 1.6], [1.6, 1.0], [-0.6, 2.4]]) monk([wx + dx, wz + dz], wy, [0, -1], { pose: 'cross' });
    monk([wx - 5.5 + 1.4, wz + 4], TOP, [-1, 0], { carry: 'pot' }); man([VIHARA2[0] - 2.2, wz + 0.8], TOP, [1, 0]); }
  // at the Great Bowl: a monk ladling the food, monks with their alms bowls coming for it, a lay donor
  monk([BOWL[0] + 1.9, BOWL[1] + 0.4], TOP, [-1, 0], { carry: 'pot' }); monk([BOWL[0] - 1.9, BOWL[1] - 0.6], TOP, [1, 0.2], { carry: 'basket' }); monk([BOWL[0] - 0.8, BOWL[1] + 2.3], TOP, [0.3, -1]); man([BOWL[0] + 0.8, BOWL[1] - 2.4], TOP, [-0.2, 1], { carry: 'basket' });
  // Temple 40: a monk and a pilgrim before the altar
  { const [tx, tz] = TEMPLE40.c, ty = TOP + 3.35; monk([tx - 14.8, tz - 1.0], ty, [-1, 0], { pose: 'kneel', arms: 'pray' }); woman([tx - 14.6, tz + 1.3], ty, [-1, 0], { pose: 'kneel', arms: 'pray' }); monk([tx + 8, tz + 5.4], ty, [0, 1], { pose: 'cross' }); }
  return { id: 'sanchi-people', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-300, -300, 300, 300], entrance: { at: [0, -180], facing: 's' } };
}
export const pilgrims = people();
export default stupa;
