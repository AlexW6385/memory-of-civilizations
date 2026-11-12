// Uji in 1053 (docs/settlements/heian-uji.md §2–§4): the Phoenix Hall with its pond and bridge (the
// full building of the previous design, src/buildings/byodo-in-phoenix-hall); the Uji Bridge; the river.

import { RADIUS, HALL, RIVER, BRIDGE, height } from './layout.js';
import hallPlan from '../../buildings/byodo-in-phoenix-hall/plan.js';

const rx = RIVER.x + 15 * Math.sin(BRIDGE.z / 110);
export const bridge = {
  id: 'heian-uji-bridge', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [rx - 50, BRIDGE.z], facing: 'e' }, bounds: [rx - RIVER.w / 2 - 10, BRIDGE.z - 4, rx + RIVER.w / 2 + 10, BRIDGE.z + 7], rooms: [],
  // the Uji Bridge of timber on rows of piles, its railings with bronze finials, the san-no-ma
  // projecting upstream (the river flows north; upstream is +z) in the third bay from the west
  elements: [{ t: 'uji_bridge', x0: rx - RIVER.w / 2 - 8, x1: rx + RIVER.w / 2 + 8, z: BRIDGE.z, w: 6, y: 0.2, rise: 1.4, bed: RIVER.bed, bay: 5.4, sannoma: { at: rx - RIVER.w / 2 - 8 + 2.5 * (RIVER.w + 16) / Math.round((RIVER.w + 16) / 5.4), out: 2.4, len: 3.6 } }],
};
const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
/**
 * The life of the river (docs/settlements/heian-uji.md §6): the fishing weirs (ajiro) in the shallows above the bridge —
 * two rows of stakes converging downstream with wattle screens between them, a trap at the point; boats; people and an
 * ox cart on the Uji Bridge.
 */
function riverLife() {
  const E = [], L = [], W = RIVER.level;
  // the weirs: stakes from the bed to above the water, every 0.6 m, along two lines meeting downstream (north, −z)
  for (const [zc, xo] of [[-128, -12], [-112, 10]]) {
    const xm = riverX(zc) + xo, tip = [xm, zc - 9];
    for (const sd of [-1, 1]) {
      const a = [xm + sd * 7, zc + 4], len = Math.hypot(tip[0] - a[0], tip[1] - a[1]), n = Math.round(len / 0.6);
      for (let k = 0; k <= n; k++) {
        const t = k / n, x = a[0] + (tip[0] - a[0]) * t, z = a[1] + (tip[1] - a[1]) * t;
        E.push({ t: 'block', rect: [x - 0.06, z - 0.06, x + 0.06, z + 0.06], y0: RIVER.bed - 0.3, y1: W + 0.7 + 0.08 * ((k * 7) % 3), mat: 'bark_dark', collide: false });
      }
      // the wattle screen along the stakes, from the bed to a little above the water, in short straight lengths
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n, p = [a[0] + (tip[0] - a[0]) * t0, a[1] + (tip[1] - a[1]) * t0], q = [a[0] + (tip[0] - a[0]) * t1, a[1] + (tip[1] - a[1]) * t1];
        E.push({ t: 'wall', a: p, b: q, th: 0.04, y0: RIVER.bed, y1: W + 0.35, mat: 'wicker', openings: [] });
      }
    }
    // the trap at the point: a box of slats, a plank platform over it on four posts where the fisherman stands
    E.push({ t: 'block', rect: [tip[0] - 1.0, tip[1] - 2.2, tip[0] + 1.0, tip[1] + 0.2], y0: W - 0.6, y1: W + 0.3, mat: 'wicker', collide: false });
    for (const [dx, dz] of [[-1.1, -2.3], [1.1, -2.3], [-1.1, 0.3], [1.1, 0.3]]) E.push({ t: 'block', rect: [tip[0] + dx - 0.08, tip[1] + dz - 0.08, tip[0] + dx + 0.08, tip[1] + dz + 0.08], y0: RIVER.bed - 0.3, y1: W + 0.95, mat: 'bark_dark', collide: false });
    E.push({ t: 'block', rect: [tip[0] - 1.2, tip[1] - 2.4, tip[0] + 1.2, tip[1] + 0.4], y0: W + 0.95, y1: W + 1.05, mat: 'timber', collide: false });
    L.push({ t: 'figure', at: [tip[0] + 0.4, tip[1] - 1.0], y: W + 1.05, rot: Math.PI, seed: zc * 31, dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'straw', carry: 'none', skin: 'skin_medium', pose: 'squat' });
  }
  // boats: a roofed boat moored by the west bank below the bridge, fishing boats in the stream, a barge poled upstream
  const boat = (kind, z, xo, rot, len) => { L.push({ t: 'boat', kind, at: [riverX(z) + xo, z], y: W, rot, len, seed: Math.round(z * 97) }); return [riverX(z) + xo, z]; };
  boat('sampan', -160, -23, 0.05, 7);
  const f1 = boat('rowboat', -70, 6, 0.4, 4.5), f2 = boat('rowboat', -40, -9, -0.3, 4.5), bg = boat('barge', 40, 4, Math.PI + 0.06, 12);
  const man = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.round(at[0] * 13 + at[1] * 7), dress: 'tunic', cloth: 'cloth_indigo', cloth2: 'cloth_brown', hat: 'straw', skin: 'skin_medium', carry: 'none', pose: 'stand', ...extra });
  man([f1[0], f1[1] + 0.9], W - 0.1, 0.4); man([f2[0], f2[1]], W - 0.1, -0.3, { pose: 'squat', hat: 'none' });
  man([bg[0], bg[1] + 4.2], W + 0.1, Math.PI, { cloth: 'cloth_brown' });
  // on the bridge: travellers, a noblewoman's party under veiled hats, an ox cart of hay led by its driver
  const x0 = RIVER.x + 15 * Math.sin(BRIDGE.z / 110) - RIVER.w / 2 - 8, x1 = x0 + RIVER.w + 16;
  const Y = (x) => 0.2 + 1.4 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - x0) / (x1 - x0))));
  const on = (x, dz, rot, extra) => man([x, BRIDGE.z + dz], Y(x), rot, extra);
  on(x0 + 14, -1.2, -Math.PI / 2, { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black' });
  on(x0 + 16, 1.0, -Math.PI / 2, { dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'veil', h: 1.5 });
  on(x0 + 17.2, 1.6, -Math.PI / 2, { dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'veil', h: 1.48 });
  on(x0 + 27, 1.9, Math.PI / 2, { carry: 'basket' });
  on(x0 + 44, -1.4, Math.PI / 2, { carry: 'pole', cloth: 'cloth_white' });
  L.push({ t: 'cart', kind: 'two', load: 'hay', beast: 'ox', at: [x0 + 35, BRIDGE.z + 0.9], y: Y(x0 + 35), rot: -Math.PI / 2, seed: 1053 });
  on(x0 + 37.6, -0.4, -Math.PI / 2, { cloth: 'cloth_brown', hat: 'none' });
  return [
    { id: 'heian-uji-weirs', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements: E, bounds: [RIVER.x - RIVER.w, -150, RIVER.x + RIVER.w, -90], entrance: { at: [RIVER.x - 50, -120], facing: 'e' } },
    { id: 'heian-uji-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements: L, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'e' } },
  ];
}
export const [weirs, riverPeople] = riverLife();

// the hall's plain lacquered block under Amida is replaced by a sumeru dais with mother-of-pearl inlay and gilt fittings (§10)
const isAltar = (e) => e.t === 'block' && e.mat === 'lacquer_black' && e.rect.join() === '-2.7,-2,1.2,2';
export const hall = { ...hallPlan, elements: hallPlan.elements.filter((e) => !isAltar(e)), origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 9, -10, HALL.origin[0] + 10, 10] };
const HF = 1.1, hx = HALL.origin[0];                // the central hall's floor; its centre in the settlement
export const dais = {
  id: 'heian-uji-dais', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [],
  bounds: [hx - 3, -2.5, hx + 1.5, 2.5], entrance: { at: [hx + 6, 0], facing: 'w' },
  elements: [{ t: 'byodo_dais', rect: [hx - 2.7, -2.0, hx + 1.2, 2.0], y: HF, h: 1.0 }],
};

/**
 * Worship (§10): from the east bank across the pond the face of Amida is seen through the round window of the hall;
 * a courtier's party kneels there on mats facing west, a monk with them; in the hall two monks chant before the dais.
 */
function worship() {
  const L = [], E = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 1053;
  const person = (x, z, dir, extra) => L.push({ t: 'figure', at: [x, z], y: extra.y ?? height(x, z), rot: faceTo(dir), seed: seed++ * 4241, dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', pose: 'stand', ...extra });
  const W = [-1, 0];
  for (const [zc, n] of [[-6.5, 3], [6.5, 3]]) {
    // a mat of rushes on the gravel for each group, and the party kneeling on it facing the hall
    const x0 = 42, x1 = 45.6, za = zc - 2.0, zb = zc + 2.0, y = Math.max(height(x0, za), height(x1, zb), height(x0, zb), height(x1, za));
    E.push({ t: 'block', rect: [x0, za, x1, zb], y0: y - 0.1, y1: y + 0.03, mat: 'reed_mat', collide: false });
    const yy = y + 0.03;
    for (let i = 0; i < n; i++) {
      const z = za + 0.7 + i * 1.3;
      if (i === 1) person(42.9, z, W, { y: yy, pose: 'seiza', arms: 'pray', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' });
      else person(43.0, z, W, { y: yy, pose: 'seiza', arms: 'pray', cloth: i ? 'cloth_red' : 'cloth_green', cloth2: 'cloth_white', hair: 'long', h: 1.52, over: 'collar' });
      person(44.6, z + 0.3, W, { y: yy, pose: 'seiza', cloth: i % 2 ? 'cloth_ochre' : 'cloth_maroon', cloth2: 'cloth_white', hair: 'long', h: 1.5 });
    }
  }
  // the monk who leads them, standing at the water's edge with his staff; a servant standing behind
  person(41.2, 3.0, W, { cloth: 'cloth_black', cloth2: 'cloth_ochre', hair: 'shaven', carry: 'staff', over: 'sash' });
  person(46.4, 1.5, W, { cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', dress: 'trousers' });
  // in the hall: two monks kneeling before the dais, chanting
  for (const sz of [-1, 1]) person(hx + 2.3, sz * 0.75, W, { y: HF, pose: 'seiza', arms: 'pray', cloth: 'cloth_black', cloth2: 'cloth_ochre', hair: 'shaven', over: 'sash' });
  return [
    { id: 'heian-uji-worship', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements: L, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'e' } },
    { id: 'heian-uji-mats', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements: E, bounds: [40, -10, 47, 10], entrance: { at: [48, 0], facing: 'w' } },
  ];
}
export const [worshippers, mats] = worship();
export default hall;
