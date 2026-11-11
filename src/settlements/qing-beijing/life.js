// Ming–Qing Beijing — the plans of the life (docs/settlements/qing-beijing.md §16–§23), for town.js
// to add to its list:   import { lifePlans } from './life.js';   …   return [..., ...(await lifePlans())];
// The shop booths of the avenue, the tea house and the pharmacy (their halls and their furnishing),
// courtyard houses furnished, a few still figures in the palace's courts (guards at the gates and a
// few officials at the foot of the terrace: no crowds), pigeons in the lanes. Positions come from
// layout.js; nothing is hard-coded but the buildings' places on the avenue (shops.js).
import './style.js';
import { RADIUS, AVENUE, HALLS, TIERS, interiorShops, furnishedHouses } from './layout.js';
import { SHOP_SITES } from './shops.js';

const base = (id, style, elements, center = [0, 0]) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 215], facing: 'n' }, center, near: 230 });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

export async function lifePlans() {
  const rand = rng(1699), out = [];
  // the booths (shops.js: only where no shop front stands)
  out.push(base('qing-beijing-shops', 'life', SHOP_SITES.map((s) => ({ t: 'bj_booth', at: s.at, y: 0.04, rot: s.rot, trade: s.trade, seed: s.seed, w: s.w })), [0, 295]));
  // the tea house and the pharmacy: furnished inside shops of the shop street (shopfront.js qing_shop with `enter`, picked by layout.js interiorShops);
  // the room's frame runs from the shop's back wall to its counter line, the floor at the shop's plinth (0.3)
  const ins = interiorShops().filter((s) => s.side === 'w');
  out.push(base('qing-beijing-interiors-shops', 'life', ins.map((s) => ({ t: s.kind === 'teahouse' ? 'bj_teahouse' : 'bj_pharmacy', rect: [s.front - s.depth, s.z0, s.front - 0.1, s.z1], y: 0.3, front: 'e', H: 3.4, seed: s.seed })), ins.length ? [ins[0].front - 4, (ins[0].z0 + ins[0].z1) / 2] : [0, 295]));
  // courtyard houses furnished inside, fitted to the shells (houses.js houseParts): the five lod-0 houses nearest the avenue's mouth
  const near = furnishedHouses(5);
  out.push(base('qing-beijing-interiors-houses', 'life', near.map((h) => ({ t: 'bj_rooms', rect: h.rect, seed: h.seed, courts: h.courts, gate: h.gate, lod: h.lod })), [-40, 235]));
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
