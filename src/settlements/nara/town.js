// The capital of 752 around Tōdai-ji (docs/settlements/nara.md §11–§12): the blocks of the grid with their earthen
// walls, gates, the houses in rows on their lanes and a well in each garden; Kōfuku-ji's precinct with its five-storey
// pagoda and golden hall; the East Market's square with stalls, mats, carts, sellers and buyers.
import { lodTiles } from '../lod.js';
import { craftOf, WORKING } from '../../styles/nara/crafts.js';
import { laneRect, openedLots } from './walk.js';
import { RADIUS, streets, lots, walls, yards, blocks, fences, gardens, MARKET, KOFUKU, height, serviceLots, lotPoint, SERVICE_LANE } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 180], facing: 'n' } });

/** The walls and gates round the blocks, Kōfuku-ji's buildings. */
function fabric() {
  const E = walls().map((w) => ({ t: 'nara_tsuiji', a: w.a, b: w.b, y: 0, gate: w.gate, roof: Math.abs(w.gate[0] - 0) < 1 ? 'tile_grey' : 'roof_bark' }));
  const [kx0, kz0, kx1, kz1] = KOFUKU.block, kc = (kx0 + kx1) / 2;
  // Kōfuku-ji: the Central Golden Hall (two storeys) facing south, the five-storey pagoda of 730 south-east of it
  E.push({ t: 'nara_hall', rect: [kx0 + 11, kz0 + 11, kx0 + 45, kz0 + 29], y: 1.2, H: 6.4, bays: [7, 4], k: 1.0, colD: 0.75, plat: 1.2, walls: 'full', doors: { s: [3], n: [3] }, windows: true, upper: { H: 4, ins: 4.5, k: 0.9 }, top: 24, shibi: 2.2 });
  E.push({ t: 'stairs', rect: [kx0 + 25, kz0 + 29 + 0.9, kx0 + 31, kz0 + 29 + 0.9 + 3.8], y0: 0, y1: 1.2, dir: 'n' });
  E.push({ t: 'pagoda_jp', c: [kx1 - 13, kz1 - 22], y: 0, base: { half: 9.5, h: 1.3 }, side: 10.8, shrink: 0.8, tiers: 5, h0: 6.4, dh: 0.3, over: 4.0, spire: 10 });
  E.push({ t: 'nara_hall', rect: [kc - 6, kz1 - 12, kc + 6, kz1 - 4], y: 0.6, H: 4.4, bays: [3, 2], k: 0.8, colD: 0.6, plat: 0.6, walls: 'ends', shibi: 1.4, rise: 3.2 });
  return E;
}

/** The East Market: two rows of stalls facing the aisle, mats of goods behind them, carts, sellers and buyers. */
function market() {
  const [x0, z0, x1, z1] = MARKET.block, cz = (z0 + z1) / 2, L = [], rand = rng(7521), seed = () => Math.floor(rand() * 1e9);
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  const person = (at, dir, o = {}) => L.push({ t: 'figure', at, y: 0, rot: faceTo(dir) + (rand() - 0.5) * 0.3, seed: seed(), skin: 'skin_light', dress: rand() < 0.5 ? 'trousers' : 'robe', hair: 'topknot', hat: rand() < 0.5 ? 'none' : 'straw', carry: 'none', over: 'sash', cloth: CL[Math.floor(rand() * CL.length)], cloth2: CL[Math.floor(rand() * CL.length)], ...o });
  const GOODS = [['basket', 'produce'], ['produce', 'produce', 'basket'], ['cloth', 'cloth'], ['vat', 'basket'], ['basket', 'cloth', 'produce']];
  for (const [side, z] of [[1, cz - 6], [-1, cz + 6]]) for (let x = x0 + 4; x < x1 - 3; x += 4.6) {
    if (rand() < 0.12) continue;
    const dir = [0, side];                                             // the buyers' side: toward the aisle
    L.push({ t: 'stall', at: [x, z], y: 0, rot: faceTo(dir), seed: seed(), w: 3.4, d: 1.3, awning: ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_grey'][Math.floor(rand() * 4)], stripe: null, goods: GOODS[Math.floor(rand() * GOODS.length)] });
    person([x, z - side * 1.35], dir, { pose: rand() < 0.4 ? 'sit' : 'stand' });
    if (rand() < 0.55) person([x + (rand() - 0.5) * 2, z + side * (1.8 + rand() * 1.2)], [0, -side], { pose: rand() < 0.3 ? 'talk' : 'stand', dress: 'robe', hat: rand() < 0.5 ? 'cap' : 'none' });
  }
  // the outer rows: sellers sitting on mats with their goods (grain, vegetables, pots, salt), the aisle to the outer lanes
  for (const [side, z] of [[1, z0 + 14], [-1, z1 - 14]]) for (let x = x0 + 5; x < x1 - 4; x += 5.2) {      // (the mats and their sellers 3.5 m and more from the shop houses' doors on the square's edges)
    if (rand() < 0.2) continue;
    L.push({ t: 'goods_mat', at: [x, z], y: 0, rot: faceTo([0, side]), seed: seed(), goods: ['heap', 'baskets', 'heap'], produce: ['cloth_white', 'cloth_ochre', 'cloth_green'] });
    person([x, z - side * 1.1], [0, side], { pose: 'sit_ground' });
  }
  // handcarts and barrows in the aisle, a few sacks, porters
  for (let i = 0; i < 4; i++) {
    const x = x0 + 10 + i * 14 + rand() * 3;
    L.push({ t: i % 2 ? 'handcart' : 'barrow', at: [x, cz + (i % 2 ? 0.8 : -0.8)], y: 0, rot: rand() * Math.PI, seed: seed(), load: ['sacks', 'baskets'][i % 2] });
  }
  for (let x = x0 + 6; x < x1 - 4; x += 9) person([x + rand() * 4, cz + (rand() - 0.5) * 2], [rand() < 0.5 ? 1 : -1, 0], { carry: 'pole', arms: 'pole', dress: 'trousers', hat: 'straw' });
  return L;
}

/** Oxcarts on the axis avenue and in the market, dogs in the lanes, oxen grazing at the foot of Wakakusa, hens in the gardens. */
function beasts() {
  const L = [], rand = rng(7544), seed = () => Math.floor(rand() * 1e9);
  for (const [x, z, rot, load] of [[5.5, 118, 0, 'sacks'], [-5.5, 196, Math.PI, 'baskets'], [5, 250, 0.1, 'sacks']]) {
    L.push({ t: 'cart', kind: 'two', beast: 'ox', load, at: [x, z], y: 0, rot, seed: seed() });
  }
  for (const [x, z] of [[4, 126], [-4, 190], [24, 206], [-24, 260]]) L.push({ t: 'animal', kind: 'ox', at: [x, z], y: 0, rot: rand() * 6.28, seed: seed(), graze: true });
  const st = streets().filter((r) => Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) < 260);
  for (let i = 0; i < 16 && st.length; i++) {
    const r = st[Math.floor(rand() * st.length)], x = r[0] + 1.5 + rand() * (r[2] - r[0] - 3), z = r[1] + 1.5 + rand() * (r[3] - r[1] - 3);
    L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: seed() });
  }
  for (const [x, z] of [[170, -20], [186, 40], [178, 100]]) L.push({ t: 'animal', kind: 'ox', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: seed(), graze: true });
  return L;
}

/** Someone inside each house of the service quarter, at the work of the place (the frame of the house builders: u along the front, v in from the door; the raised floor at 0.85, the earth floor at 0.45). */
function service() {
  const L = [], rand = rng(7522), seed = () => Math.floor(rand() * 1e9);
  const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  for (const l of serviceLots()) {
    if (!l.use) continue;
    const Lw = l.rect[2] - l.rect[0], nb = Math.max(2, Math.floor(Lw / 3.2)), du = (Math.floor(nb / 2) + 0.5) * Lw / nb, left = du > Lw / 2, T = 0.3;
    const U = (t) => (left ? T + 0.1 + t : Lw - T - 0.1 - t), D = l.rect[3] - l.rect[1];
    const dirToDoor = l.front === 's' ? [0, 1] : [0, -1];
    const at = (t, v, dir, o = {}, y = 0.85) => {
      const [x, z] = lotPoint(l, U(t), v), d = dir ?? dirToDoor;
      L.push({ t: 'figure', at: [x, z], y, rot: Math.atan2(-d[0], -d[1]), seed: seed(), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', hair: 'topknot', over: 'sash', cloth: CL[Math.floor(rand() * CL.length)], cloth2: 'cloth_white', ...o });
    };
    const toward = (dx) => (l.front === 's' ? [left ? -dx : dx, 0] : [left ? dx : -dx, 0]);       // along the front, toward the wall (dx = +1) or away from it
    if (l.use === 'inn') { at(2.6, 4.8, toward(-1), { pose: 'kneel', dress: 'robe', hair: 'bun', over: 'collar', cloth: 'cloth_indigo' }); at(1.8, 3.0, [0, l.front === 's' ? -1 : 1], { pose: 'cross', hat: 'straw', cloth: 'cloth_brown' }); }
    else if (l.use === 'scriptorium') { for (const v of [2.95, 4.2]) at(1.8, v, toward(1), { pose: 'cross', hat: 'cap', hatMat: 'lacquer_black', cloth: v < 3.5 ? 'cloth_green' : 'cloth_indigo', cloth2: 'cloth_white' }); at(3.2, 5.4, toward(1), { pose: 'stand', hair: 'shaven', cloth: 'cloth_ochre', cloth2: 'cloth_brown' }); }
    else if (l.use === 'kitchen') { at(0.9, 1.9, [left ? -0.3 : 0.3, l.front === 's' ? -1 : 1], { pose: 'stand', dress: 'trousers', over: 'apron', hat: 'cap', hatMat: 'cloth_white', cloth: 'cloth_white' }, 0.45); at(3.6, 3.4, [0, l.front === 's' ? -1 : 1], { pose: 'kneel', dress: 'robe', hair: 'bun', over: 'apron', cloth: 'cloth_ochre' }); }
    else if (l.use === 'carpenter') { at(1.6, 3.9, [l.front === 's' ? 0.4 : -0.4, l.front === 's' ? -1 : 1], { pose: 'stand', dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', carry: 'none' }); at(3.5, 5.6, toward(-1), { pose: 'squat', dress: 'trousers', cloth: 'cloth_grey' }); }
    else if (l.use === 'lodge') { at(2.0, 3.6, dirToDoor, { pose: 'stand', hat: 'cap', hatMat: 'lacquer_black', carry: 'staff', cloth: 'cloth_maroon', cloth2: 'cloth_white', over: 'collar', beard: true }); at(1.3, 4.9, toward(-1), { pose: 'cross', hat: 'cap', hatMat: 'lacquer_black', cloth: 'cloth_green', cloth2: 'cloth_white', over: 'collar' }); }
    else if (l.use === 'incense' || l.use === 'oil') { at(3.0, 1.4, dirToDoor, { pose: 'stand', cloth: l.use === 'oil' ? 'cloth_brown' : 'cloth_ochre', hair: l.use === 'oil' ? 'topknot' : 'shaven' }, 0.85); }
    void D;
  }
  // the lane: a few pilgrims at the doors of the inns, a porter with a pole, a monk with an alms bowl
  for (const [x, z, d, o] of [[24, 104, [1, 0], { pose: 'talk' }], [27.5, 103.8, [-1, 0], { pose: 'talk', hair: 'bun' }], [-31, 104.2, [1, 0], { pose: 'stand', hat: 'straw', carry: 'pole', dress: 'trousers' }], [43, 104.4, [-1, 0], { pose: 'stand', hair: 'shaven', cloth: 'cloth_ochre' }]]) {
    L.push({ t: 'figure', at: [x, z], y: 0, rot: Math.atan2(-d[0], -d[1]), seed: seed(), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', hair: 'topknot', over: 'sash', cloth: CL[Math.floor(rand() * CL.length)], cloth2: 'cloth_white', ...o });
  }
  return L;
}

/** The shopkeeper behind the counter of each open shop within reach of the walk (the counter's place in nara_house: u from 0.5 to the door's side, v 1.55-2.15; the raised floor at 0.85). */
function keepers(open) {
  const L = [], rand = rng(7534), seed = () => Math.floor(rand() * 1e9);
  const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  for (const l of lots()) {
    const shop = l.use ? !!l.shop : l.shop || l.seed % 4 === 0;
    if (!open.has(l) || !shop || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 20) > 215) continue;
    const Lw = l.rect[2] - l.rect[0], nb = Math.max(2, Math.floor(Lw / 3.2)), du = (Math.floor(nb / 2) + 0.5) * Lw / nb, cu0 = 0.5, cu1 = Math.max(cu0 + 1.4, du - 1.2);
    if (cu1 >= Lw - 1.3) continue;
    const [x, z] = lotPoint(l, (cu0 + cu1) / 2, 2.95), dz = l.front === 's' ? 1 : -1;
    L.push({ t: 'figure', at: [x, z], y: 0.85, rot: Math.atan2(0, -dz), seed: seed(), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', hair: rand() < 0.5 ? 'topknot' : 'bun', over: 'sash', cloth: CL[Math.floor(rand() * 6)], cloth2: 'cloth_white', pose: 'stand' });
  }
  return L;
}

/** The trades at work (docs/settlements/nara.md §17): a worker in the room of each open house of a trade, by a rule of its seed, and people at the wells. */
function workers(open) {
  const L = [], rand = rng(7533), seed = () => Math.floor(rand() * 1e9);
  const CL = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_ochre', 'cloth_white', 'cloth_green'];
  const SPOT = { weaver: [1.2, 2.2, -1, 'kneel'], smith: [1.4, 2.1, 1, 'stand'], lacquer: [0.9, 3.9, 1, 'cross'], farm: [1.6, 4.0, 1, 'stand'], potter: [1.2, 2.3, -1, 'squat'], straw: [1.2, 3.4, 1, 'cross'] };
  for (const l of lots()) {
    if (!open.has(l) || l.use || l.shop || l.seed % 4 === 0) continue;
    const c = craftOf(l);
    if (!WORKING.includes(c) || (l.seed >> 3) % 5 > 2) continue;
    const [t, v, toward, pose] = SPOT[c];
    const Lw = l.rect[2] - l.rect[0], nb = Math.max(2, Math.floor(Lw / 3.2)), du = (Math.floor(nb / 2) + 0.5) * Lw / nb, left = du > Lw / 2, T = 0.3;
    const u = left ? T + 0.1 + t : Lw - T - 0.1 - t, [x, z] = lotPoint(l, u, v), door = l.front === 's' ? 1 : -1, dz = toward * door;
    L.push({ t: 'figure', at: [x, z], y: 0.85, rot: Math.atan2(0, -dz), seed: seed(), dress: c === 'smith' ? 'trousers' : 'robe', skin: 'skin_light', hat: 'none', carry: 'none', hair: c === 'weaver' ? 'bun' : 'topknot', over: c === 'smith' ? 'apron' : 'sash', cloth: CL[Math.floor(rand() * 6)], cloth2: 'cloth_white', pose });
  }
  // at the wells of the blocks: a woman drawing water, a child, a porter resting his pole
  for (const [x, z] of yards()) {
    if (Math.hypot(x, z - 20) < 120) continue;
    const a = rand() * 6.28;
    L.push({ t: 'figure', at: [x + 1.3, z + 0.4], y: 0, rot: Math.PI / 2, seed: seed(), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'bundle', hair: 'bun', over: 'sash', cloth: CL[Math.floor(rand() * 6)], cloth2: 'cloth_white', pose: 'stand' });
    L.push({ t: 'figure', at: [x - 1.5 * Math.cos(a), z - 1.5 * Math.sin(a)], y: 0, rot: a, seed: seed(), dress: 'robe', skin: 'skin_light', hat: rand() < 0.5 ? 'straw' : 'none', carry: 'pole', hair: 'topknot', over: 'sash', cloth: CL[Math.floor(rand() * 6)], cloth2: 'cloth_white', pose: 'talk' });
  }
  return L;
}

/** Figures built into near plans (60 m cells, drawn within 80 m of the visitor) instead of life elements, whose figures reach 170 m: the keepers, workers and the service quarter's people (docs §20.3). */
function cells(id, list) {
  const by = new Map();
  for (const e of list) { const k = `${Math.floor(e.at[0] / 60)},${Math.floor(e.at[1] / 60)}`; if (!by.has(k)) by.set(k, []); by.get(k).push(e); }
  return [...by].map(([k, els]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, 'life', els), center: [i * 60 + 30, j * 60 + 30], near: 80 }; });
}

export async function town() {
  const all = lots(), open = openedLots();
  const houses = all.map((l) => ({ t: 'nara_house', ...l, shop: l.use ? !!l.shop : l.shop || l.seed % 4 === 0, ...(open.has(l) ? { open: true } : {}) }));
  const wells = [...yards(), ...[[-9, 105.3], [9, 105.3]]].map(([x, z]) => ({ t: 'well', at: [x, z], y: height(x, z) }));      // (and the two wells at the service lane's crossing with the way, for the kitchen and the inns)
  // the doorway lanes of the opened houses, read by the street life as footprints (nothing of it stands in a doorway: src/objects/life.js)
  const lanes = houses.filter((h) => h.open).map((h) => ({ t: 'door_clear', rect: laneRect(h) }));
  const plans = [...lodTiles('nara-houses', 'nara', [...houses, ...lanes], { R: RADIUS, entrance: { at: [0, 180], facing: 'n' } }), ...lodTiles('nara-wells', 'vernacular', wells, { R: RADIUS, entrance: { at: [0, 180], facing: 'n' } })];
  plans.push(...lodTiles('nara-plots', 'nara', [...fences().map((f) => ({ t: 'nara_fence', y: 0, ...f, at: f.pts[0] })), ...gardens().map((g) => ({ t: 'nara_garden', y: 0, ...g })), ...streets().map((r) => ({ t: 'nara_gutter', rect: r, y: 0 }))], { R: RADIUS, near: 130, entrance: { at: [0, 180], facing: 'n' } }));
  plans.push(base('nara-fabric', 'nara', fabric()), base('nara-market', 'life', market()), base('nara-beasts', 'life', beasts()), ...cells('nara-service', service()), ...cells('nara-workers', workers(open)), ...cells('nara-keepers', keepers(open)));
  plans.push(base('nara-lane', 'nara', [[14, SERVICE_LANE[1], SERVICE_LANE[2], SERVICE_LANE[3]], [SERVICE_LANE[0], SERVICE_LANE[1], -14, SERVICE_LANE[3]]].map((rect) => ({ t: 'nara_gutter', rect, y: 0, inset: 2.6 }))));
  void blocks;
  return plans;
}
