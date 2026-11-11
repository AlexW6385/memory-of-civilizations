// Ming–Qing Beijing — the plans of the life (docs/settlements/qing-beijing.md §16–§23), for town.js
// to add to its list:   import { lifePlans } from './life.js';   …   return [..., ...(await lifePlans())];
// The shop booths of the avenue, the tea house and the pharmacy (their halls and their furnishing),
// courtyard houses furnished, a few still figures in the palace's courts (guards at the gates and a
// few officials at the foot of the terrace: no crowds), pigeons in the lanes. Positions come from
// layout.js; nothing is hard-coded but the buildings' places on the avenue (shops.js).
import './style.js';
import { RADIUS, AVENUE, HALLS, TIERS, RING, TEMPLE, SHOP_APRONS, interiorShops, furnishedHouses, shopRows, houses, lanes } from './layout.js';
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
  out.push(...streetPlans(rand));
  out.push(base('qing-beijing-people-life', 'life', [...pig, ...figs], [0, 120]));
  return out;
}

const FIG = { dress: 'robe', cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', over: 'sash' };
const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_ochre'];
/** Tile a list of elements into plans of 100 m squares (built when the visitor is within 230 m). */
function tiled(id, list, S = 100) {
  const tiles = new Map();
  for (const e of list) { const k = `${Math.floor(e.at[0] / S)},${Math.floor(e.at[1] / S)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, els]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, 'life', els), center: [i * S + S / 2, j * S + S / 2] }; });
}
/**
 * The eye-level life of the shop street, the avenue and the lanes (streetlife.js): goods before every shop by its trade, stands and stalls
 * and carts along the avenue, hawkers with their poles, and what stood at the gates of the hutong. All derived from layout.js.
 */
function streetPlans(rand) {
  const L = [], plans = [], A = AVENUE, aw = A[2];
  const seed = () => Math.floor(rand() * 1e9);
  const fig = (at, rot, extra = {}) => L.push({ t: 'figure', at, y: 0.04, rot, seed: seed(), ...FIG, cloth: CL[Math.floor(rand() * CL.length)], ...extra });
  // before the shops: the goods of each trade, benches, a lantern or two
  for (const row of shopRows()) for (const sh of row.shops) {
    const west = row.side === 'w', out = west ? 1 : -1, rot = west ? Math.PI / 2 : -Math.PI / 2, cz = (sh.z0 + sh.z1) / 2, w = Math.min(sh.z1 - sh.z0 - 2.7, 3.8);
    const apronW = Math.abs(Math.abs(row.front) - aw);
    if (sh.interior) { L.push({ t: 'stool', at: [row.front + out * 0.7, sh.z0 + 0.9], y: 0.04, rot, seed: seed() }, { t: 'stool', at: [row.front + out * 0.7, sh.z1 - 0.9], y: 0.04, rot, seed: seed() }); continue; }
    if (w < 1.6 || apronW < 1.8) continue;
    L.push({ t: 'bj_shopgoods', at: [row.front, cz], y: 0.04, rot, w, trade: sh.trade, seed: sh.seed, d0: 0.5 });
    if (rand() < 0.4) fig([row.front + out * (apronW > 2.4 ? 1.9 : 1.5), cz + (rand() - 0.5) * w * 0.6], rot + Math.PI * (rand() < 0.5 ? 0 : 1), { pose: rand() < 0.5 ? 'stand' : 'talk' });
  }
  // the avenue: stands and stalls at its two edges, clear of the booths and the temple's way
  const taken = (x, z, r) => SHOP_SITES.some((b) => Math.hypot(b.at[0] - x, b.at[1] - z) < r + 1) || lanes().some((l) => l[2] - l[0] > 40 && x > l[0] && x < l[2] && z > l[1] - r && z < l[3] + r && Math.abs(z - (l[1] + l[3]) / 2) < r + 3) || Math.abs(z - TEMPLE.c[1]) < 6 + r;
  const spots = [], KS = [0.05, 0.15, 0.25, 0.7, 0.33, 0.45, 0.85, 0.55, 0.95, 0.75, 0.1, 0.2, 0.3, 0.6, 0.72, 0.4, 0.88];
  for (let z = A[1] + 10; z < A[3] - 8; z += 9 + rand() * 7) for (const sd of [-1, 1]) {
    if (sd > 0 && z < 357 && rand() < 0.4) continue;
    spots.push([sd, z + rand() * 4, KS[spots.length % KS.length]]);
  }
  let nB = 0, nT = 0, nW = 0, nS = 0, nC = 0, nD = 0;
  for (const [sd, z, k] of spots) {
    const x = sd * (aw - 6.3 - rand() * 1.5), rot = sd < 0 ? Math.PI / 2 : -Math.PI / 2, inward = [-sd, 0], faceIn = face(inward);
    if (taken(x, z, 2.5)) continue;
    if (k < 0.1 && nB < 3) { nB++; L.push({ t: 'bj_barber', at: [x, z], y: 0.04, rot: rot + Math.PI, seed: seed() }); }
    else if (k < 0.2 && nT < 3) { nT++; L.push({ t: 'bj_teastall', at: [x + sd * 0.0, z], y: 0.04, rot, seed: seed() }); }
    else if (k < 0.3 && nW < 3) { nW++; L.push({ t: 'bj_watercart', at: [x, z], y: 0.04, rot: rot + Math.PI / 2, seed: seed() }); }
    else if (k < 0.37 && nS < 3) { nS++; L.push({ t: 'bj_sedan', at: [x, z], y: 0.04, rot: rot + Math.PI / 2, seed: seed() }); }
    else if (k < 0.5 && nC < 5) { nC++; L.push({ t: 'peking_cart', at: [x, z], y: 0.04, rot: Math.PI / 2 * (rand() < 0.5 ? 0 : 2), seed: seed(), beast: rand() < 0.4 ? 'donkey' : 'horse', coat: ['hide_black', 'hide_brown', 'hide_grey'][Math.floor(rand() * 3)] }); fig([x + 0.9, z - 4.2], 0.3, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
    else if (k < 0.62 && nD < 6) { nD++; L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: rand() * 6.28, gear: true, graze: false, seed: seed() }); fig([x + 1.0, z + 0.5], faceIn, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
    else if (k < 0.8) { // a hawker with his pole, or a knot talking
      if (rand() < 0.6) fig([x, z], rot + (rand() - 0.5), { carry: 'pole', dress: 'trousers', cloth: 'cloth_brown', hat: rand() < 0.5 ? 'brim' : 'cap' });
      else { fig([x, z], faceIn + 0.5, { pose: 'talk' }); fig([x + sd * 0.6, z + 0.7], faceIn - 2.2, { pose: 'talk' }); }
    }
    else if (k < 0.9) { L.push({ t: 'bench', at: [x + sd * 1.2, z], y: 0.04, rot: Math.PI / 2, seed: seed() }); for (const q of [-0.4, 0.4]) if (rand() < 0.7) fig([x + sd * 1.2 + (rand() < 0.5 ? 0 : 0), z + q], faceIn, { pose: 'sit' }); }
    else { L.push({ t: 'animal', kind: rand() < 0.5 ? 'dog' : 'cat', at: [x, z], y: 0.04, rot: rand() * 6.28, seed: seed() }); fig([x + sd * 1.0, z + 1.2], faceIn + 1, { child: true, pose: 'squat', dress: 'trousers', hat: 'none', cloth: 'cloth_red' }); }
  }
  // a string of camels at rest on the avenue's far end, their drovers squatting by them
  const zc = A[3] - 30;
  if (!taken(-aw + 5, zc, 8)) { L.push({ t: 'camel_string', at: [-aw + 5, zc], dir: [0, -1], n: 4, y: 0.04, seed: seed() }); fig([-aw + 6.2, zc - 4], 0, { dress: 'trousers', pose: 'squat', hat: 'brim', cloth: 'cloth_brown' }); }
  // hawkers and idlers about the avenue's mouth, where the visitor arrives
  for (let i = 0; i < 6; i++) { const x = (rand() - 0.5) * 12, z = 222 + rand() * 40; if (!taken(x, z, 1)) fig([x, z], rand() * 6.28, i % 2 ? { carry: 'pole', dress: 'trousers', cloth: 'cloth_brown', hat: 'brim' } : { pose: 'talk' }); }
  plans.push(...tiled('qing-beijing-street-life', L));
  // the hutong: what the households put out at their gates, a cat or a dog now and then
  const H = [];
  for (const h of houses()) {
    const [x0, , x1, , ] = h.rect, z1 = h.rect[3], gx = x1 - 1.6;
    if (Math.hypot(gx, z1) > RADIUS - 40) continue;
    H.push({ t: 'bj_lane', at: [gx, z1], seed: h.seed, lod: h.lod });
    if (h.lod < 2 && rand() < 0.3) H.push({ t: 'bj_pet', kind: rand() < 0.45 ? 'cat' : 'dog', at: [gx - 1.2 - rand() * 6, z1 + 1.0 + rand() * 2], y: 0.03, rot: rand() * 6.28, seed: seed() });
    if (h.lod === 0 && rand() < 0.22) H.push({ t: 'laundry', at: [gx - 6 - rand() * 6, z1 + 1.1], y: 0.03, rot: 0, len: 3, seed: seed() });
    if (h.lod === 0 && rand() < 0.35) H.push({ t: 'figure', at: [gx - 4 - rand() * 8, z1 + 1.6 + rand() * 2], y: 0.03, rot: rand() * 6.28, seed: seed(), ...FIG, cloth: 'cloth_red', child: true, pose: 'squat', dress: 'trousers', hat: 'none' });
    void x0;
  }
  plans.push(...tiled('qing-beijing-hutong-life', H, 200));
  void RING; void SHOP_APRONS;
  return plans;
}
