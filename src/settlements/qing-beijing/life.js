// Ming–Qing Beijing — the plans of the life (docs/settlements/qing-beijing.md §16–§23), for town.js
// to add to its list:   import { lifePlans } from './life.js';   …   return [..., ...(await lifePlans())];
// The shop booths of the avenue, the tea house and the pharmacy (their halls and their furnishing),
// courtyard houses furnished, a few still figures in the palace's courts (guards at the gates and a
// few officials at the foot of the terrace: no crowds), pigeons in the lanes. Positions come from
// layout.js; nothing is hard-coded but the buildings' places on the avenue (shops.js).
import './style.js';
import { RADIUS, houses, AVENUE, HALLS, TIERS } from './layout.js';
import { SHOP_SITES, SHOP_BUILDINGS } from './shops.js';
import { HOUSE } from '../../styles/qing/index.js';

const base = (id, style, elements, center = [0, 0]) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 215], facing: 'n' }, center, near: 230 });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

export async function lifePlans() {
  const rand = rng(1699), out = [];
  // the booths
  out.push(base('qing-beijing-shops', 'life', SHOP_SITES.map((s) => ({ t: 'bj_booth', at: s.at, y: 0.04, rot: s.rot, trade: s.trade, seed: s.seed, w: s.w })), [0, 295]));
  // the tea house and the pharmacy on the avenue's west edge: shells (a house of grey brick, a gable roof) and their furnishing
  const { teahouse: T, pharmacy: P } = SHOP_BUILDINGS;
  out.push({ ...base('qing-beijing-shop-halls', 'qing', [
    { t: 'ming_hall', rect: T, y: 0.35, H: 4.2, front: 'e', four: false, roof: 'gable', plat: 0.35, bays: [3, 2], pal: HOUSE, eave: 0.9, platMargin: 0.5 },
    { t: 'ming_hall', rect: P, y: 0.35, H: 3.8, front: 'e', four: false, roof: 'gable', plat: 0.35, bays: [3, 1], pal: HOUSE, eave: 0.8, platMargin: 0.5 },
  ]), near: undefined, center: undefined });
  out.push(base('qing-beijing-interiors-shops', 'life', [
    { t: 'bj_teahouse', rect: T, y: 0.35, front: 'e', H: 4.2, seed: 5 },
    { t: 'bj_pharmacy', rect: P, y: 0.35, front: 'e', H: 3.8, seed: 6 },
  ], [-8, 305]));
  // courtyard houses furnished: the 3rd to 5th nearest the avenue's mouth (the two nearest are furnished by the siheyuan builder itself, §14)
  const d2 = (h) => ((h.rect[0] + h.rect[2]) / 2 + 30) ** 2 + ((h.rect[1] + h.rect[3]) / 2 - 225) ** 2;
  const near = [...houses()].sort((a, b) => d2(a) - d2(b)).slice(2, 5);
  out.push(base('qing-beijing-interiors-houses', 'life', near.map((h) => ({ t: 'bj_rooms', rect: h.rect, seed: h.seed })), [-40, 235]));
  // pigeons on the paving and the roofs' feet of a few lanes
  const pig = [[-22, 230], [30, 225], [-120, 118], [120, 118], [-60, 60], [60, 62], [-8, 266], [8, 318]].map(([x, z]) => ({ t: 'chickens', kind: 'pigeon', at: [x, z], y: 0.04, n: 6 + Math.floor(rand() * 4), seed: Math.floor(rand() * 1e6) }));
  // the still figures of the palace: guards at the gates, officials at the foot of the terrace
  const man = (at, rot, extra = {}) => ({ t: 'figure', at, y: 0.03, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_indigo', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 3)], cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash', ...extra });
  const figs = [];
  for (const [x, z, dir] of [[-17, 168, [0, -1]], [17, 168, [0, -1]], [-9, 112, [0, -1]], [9, 112, [0, -1]], [-12, -162, [0, 1]], [12, -162, [0, 1]]]) {
    figs.push(man([x, z], face(dir), { carry: 'staff', pose: 'staff', len: 2.1, staffMat: 'timber', cloth: 'cloth_indigo' }));
  }
  const y0 = TIERS[0].rect[3] + 6;
  for (const [x, z, dir] of [[-16, y0, [1, 0]], [-14, y0 + 1.5, [1, 0]], [18, y0 + 2, [-1, 0]]]) figs.push(man([x, z], face(dir), { pose: 'stand', cloth: 'cloth_indigo', cloth2: 'cloth_red' }));
  void HALLS; void AVENUE;
  out.push(base('qing-beijing-people-life', 'life', [...pig, ...figs], [0, 120]));
  return out;
}
