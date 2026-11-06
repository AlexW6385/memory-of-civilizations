// Uji in 1053 (docs/settlements/heian-uji.md §2–§4): the Phoenix Hall with its pond and bridge (the
// full building of the previous design, src/buildings/byodo-in-phoenix-hall); the Uji Bridge; the river.

import { RADIUS, HALL, RIVER, BRIDGE } from './layout.js';
import hallPlan from '../../buildings/byodo-in-phoenix-hall/plan.js';

const rx = RIVER.x + 15 * Math.sin(BRIDGE.z / 110);
export const bridge = {
  id: 'heian-uji-bridge', style: 'japanese', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [rx - 50, BRIDGE.z], facing: 'e' }, bounds: [rx - RIVER.w / 2 - 10, BRIDGE.z - 4, rx + RIVER.w / 2 + 10, BRIDGE.z + 7], rooms: [],
  // the Uji Bridge of timber on rows of piles, its railings with bronze finials, the san-no-ma
  // projecting upstream (the river flows north; upstream is +z) in the third bay from the west
  elements: [{ t: 'uji_bridge', x0: rx - RIVER.w / 2 - 8, x1: rx + RIVER.w / 2 + 8, z: BRIDGE.z, w: 6, y: 0.2, rise: 1.4, bed: RIVER.bed, bay: 5.4, sannoma: { at: rx - RIVER.w / 2 - 8 + 2.5 * (RIVER.w + 16) / Math.round((RIVER.w + 16) / 5.4), out: 2.4, len: 3.6 } }],
};
export const river = {
  id: 'heian-uji-river', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x - RIVER.w, -(RADIUS - 70), RIVER.x + RIVER.w, RADIUS - 70], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(x - (RIVER.x + 15 * Math.sin(z / 110))) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 70 }],
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
    L.push({ t: 'figure', at: [tip[0] + 0.4, tip[1] - 1.0], y: W + 1.05, rot: Math.PI, seed: zc * 31, dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'straw', carry: 'pole', skin: 'skin_medium', pose: 'stand' });
  }
  // boats: a roofed boat moored by the west bank below the bridge, fishing boats in the stream, a barge poled upstream
  const boat = (kind, z, xo, rot, len) => { L.push({ t: 'boat', kind, at: [riverX(z) + xo, z], y: W, rot, len, seed: Math.round(z * 97) }); return [riverX(z) + xo, z]; };
  boat('sampan', -160, -23, 0.05, 7);
  const f1 = boat('rowboat', -70, 6, 0.4, 4.5), f2 = boat('rowboat', -40, -9, -0.3, 4.5), bg = boat('barge', 40, 4, Math.PI + 0.06, 12);
  const man = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.round(at[0] * 13 + at[1] * 7), dress: 'tunic', cloth: 'cloth_indigo', cloth2: 'cloth_brown', hat: 'straw', skin: 'skin_medium', carry: 'none', pose: 'stand', ...extra });
  man([f1[0], f1[1] + 0.9], W - 0.1, 0.4, { carry: 'pole' }); man([f2[0], f2[1]], W - 0.1, -0.3, { pose: 'squat', hat: 'none' });
  man([bg[0], bg[1] + 4.2], W + 0.1, Math.PI, { carry: 'pole', cloth: 'cloth_brown' });
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

export const hall = { ...hallPlan, origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 9, -10, HALL.origin[0] + 10, 10] };
export default hall;
