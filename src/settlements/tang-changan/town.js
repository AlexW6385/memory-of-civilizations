// The townscape of Tang Chang'an (dossier §2, §5): the wards' walls and gates, the courtyard houses of the wards, the West Market
// (its walls and gates, the rows of shops round nine blocks, the market office with its drum, the caravanserai yards, the Hu wine
// shop), the Daoist temple, the avenue's ditches and the drum pavilions, and the life of it all: officials, women, Sogdian and
// Persian merchants, camel trains, hawkers, monks, guards, dogs.
import './style.js';
import {
  RADIUS, AVE, DITCH, WARDS, DACI, DAOIST, MARKET, MARKET_BLOCKS, MARKET_LANES, MARKET_INNER, OFFICE, DAO_AX, DACI_AX, PAGODA,
  wallRuns, gates, lots, marketRows, marketYards, inDitch, inRect,
} from './layout.js';
import { interiorElements, interiorLife, furnishedLot } from './interiors.js';

const base = (id, elements, style = 'tang') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [28, 20], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the walls and gates of the wards (except Daci'en's, the plan's) ───────────────────────────────────────────────
function walls() {
  const E = [];
  for (const r of wallRuns()) if (r.ward !== DACI.id) E.push({ t: 'fang_wall', a: r.a, b: r.b, gaps: r.gaps });
  for (const g of gates()) if (g.ward !== DACI.id) E.push({ t: 'fang_gate', c: g.c, axis: g.axis, w: g.ward === MARKET.id ? 7.2 : 6.4 });
  return E;
}

// ── the avenue: ditches with their water; the drum pavilions at the crossing ──────────────────────────────────────
function avenue() {
  const E = [];
  for (const s of [-1, 1]) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 10) {
    const xm = s * (DITCH.in + DITCH.out) / 2;
    if (inDitch(xm, z + 5) && inDitch(xm, z) && inDitch(xm, z + 10)) E.push({ t: 'water_rect', rect: [s > 0 ? DITCH.in + 0.5 : -DITCH.out + 0.5, z, s > 0 ? DITCH.out - 0.5 : -DITCH.in - 0.5, z + 10], y: DITCH.water });
  }
  E.push({ t: 'drum_tower', c: [58, -19.5], face: 's' }, { t: 'drum_tower', c: [-58, -19.5], face: 's' });
  return E;
}

// ── the Daoist temple (Xuandu-like): the gate in the south wall, the peach court, the Sanqing hall, the rear hall ──────
function daoist() {
  const E = [], [x0, z0, x1, z1] = DAOIST.rect, ax = DAO_AX;
  for (const r of wallRuns().filter((q) => q.ward === DAOIST.id)) void r;
  const pave = (r) => E.push({ t: 'paving', rect: r, y: 0.04, th: 0.3 });
  pave([ax - 4, -128, ax + 4, z1 - 2]);
  pave([ax - 20, -130, ax + 20, -100]);
  E.push({ t: 'tang_hall', c: [ax, -112], w: 25, d: 11, face: 's', y: 0, plat: 1.0, H: 4.8, nb: 5, kind: 'hall', roof: 'hip', over: 2.8, bh: 1.6, big: true, doorW: 3.0, interior: true, det: 2, chi: 1.6 });
  E.push({ t: 'temple_interior', rect: [ax - 12.5, -112 - 5.5, ax + 12.5, -112 + 5.5], y: 1.0, H: 4.8, front: 's', kind: 'guanyin' });
  for (const s of [-1, 1]) E.push({ t: 'tang_hall', c: [ax + s * 42, -112], w: 18, d: 8, face: s < 0 ? 'e' : 'w', y: 0, plat: 0.6, H: 3.8, nb: 3, kind: 'hall', roof: 'gable', over: 2.0, bh: 1.2, doorW: 2.4, det: 2 });
  E.push({ t: 'tang_hall', c: [ax, -164], w: 18, d: 8.4, face: 's', y: 0, plat: 0.8, H: 4.2, nb: 3, kind: 'hall', roof: 'hip', over: 2.2, bh: 1.4, doorW: 2.6, det: 2 });
  E.push({ t: 'incense_ding', at: [ax, -86], y: 0.04, s: 1.3 });
  for (const s of [-1, 1]) for (const z of [-60, -90]) E.push({ t: 'stone_lamp', at: [ax + s * 6, z], y: 0.04 });
  void x0; void x1;
  return E;
}

// ── the West Market ──────────────────────────────────────────────────────────────────────────────────────────────
const LO = [];                                            // the market's things of the life style (wells, sacks)
function market() {
  const E = [], [ox0, oz0, ox1, oz1] = OFFICE, oc = mid(OFFICE);
  for (const r of marketRows()) E.push({ t: 'tang_shop_row', foot: r.foot, front: r.front, units: r.units, seed: r.seed, det: r.det });
  // the market office (the Shi shu) in the middle block: a walled yard, its hall, the drum tower of the market drum, the price board
  const w = (a, b, gaps = []) => E.push({ t: 'fang_wall', a, b, gaps, h: 2.8, th: 1.0 });
  w([ox0, oz0 + 0.5], [ox1, oz0 + 0.5]); w([ox0, oz1 - 0.5], [ox1, oz1 - 0.5], [[(ox1 - ox0) / 2 - 3, (ox1 - ox0) / 2 + 3]]); w([ox0 + 0.5, oz0], [ox0 + 0.5, oz1]); w([ox1 - 0.5, oz0], [ox1 - 0.5, oz1]);
  E.push({ t: 'tang_hall', c: [oc[0], oz0 + 17], w: 20, d: 9, face: 's', y: 0, plat: 0.7, H: 4.2, nb: 5, kind: 'hall', roof: 'hip', over: 2.2, bh: 1.4, doorW: 2.6, det: 2 });
  E.push({ t: 'drum_tower', c: [oc[0] + 15, oc[1] + 8], face: 's' });
  E.push({ t: 'paving', rect: [oc[0] - 3, oc[1] - 2, oc[0] + 3, oz1 - 0.6], y: 0.04, th: 0.3 });
  // the caravanserai yards: a wall with a gate on the lane side, stables along the west, wells, the goods stacked
  for (const m of marketYards().filter((q) => q.kind === 'caravanserai')) {
    const [x0, z0, x1, z1] = m.rect, y0 = z0 + 11, y1 = z1 - 11;
    w([x1 - 0.5, y0], [x1 - 0.5, y1], [[(y1 - y0) / 2 - 3.5, (y1 - y0) / 2 + 3.5]]);
    E.push({ t: 'tang_hall', c: [x0 + 5, (y0 + y1) / 2], w: y1 - y0 - 4, d: 6.4, face: 'e', y: 0, plat: 0.25, H: 3.2, nb: Math.round((y1 - y0 - 4) / 3.4), kind: 'open', roof: 'gable', over: 1.6, bh: 0.8, det: 1, steps: false });
    LO.push({ t: 'well', at: [(x0 + x1) / 2 + 3, (y0 + y1) / 2], y: 0 });
    for (let k = 0; k < 4; k++) LO.push({ t: 'sacks', at: [x0 + 14 + (k % 2) * 3, y0 + 4 + k * 3.5], y: 0, rot: k, n: 5, seed: k + 3 });
  }
  // the market's lanes: hawkers' stalls under awnings at the shop platforms' edge on the lanes, parasols, a few
  const rand = rng(760), kinds = ['fruit', 'cloth', 'pots', 'cakes'], aw = ['reed_mat', 'cloth_ochre', 'cloth_white', 'cloth_indigo', 'cloth_red'];
  for (const lx of MARKET_LANES.x) for (let z = MARKET_INNER[1] + 20; z < MARKET_INNER[3] - 12; z += 14 + rand() * 12) {
    if (Math.abs(z - MARKET_LANES.z[0]) < 8 || Math.abs(z - MARKET_LANES.z[1]) < 8) continue;
    E.push({ t: 'hawker_stall', at: [lx + (rand() < 0.5 ? -1.2 : 1.2), z], y: 0, rot: rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, kind: kinds[Math.floor(rand() * 4)], w: 2 + rand() * 0.6, awning: aw[Math.floor(rand() * 5)] });
  }
  E.push(...interiorElements());
  return E;
}

// ── the life: people, animals ─────────────────────────────────────────────────────────────────────────────────────
const CLOTH = { off: ['cloth_maroon', 'cloth_red', 'cloth_green', 'cloth_blue'], plain: ['cloth_brown', 'cloth_grey', 'cloth_white', 'cloth_indigo', 'cloth_ochre'], fine: ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_blue', 'cloth_white', 'cloth_maroon'] };
function life() {
  const L = [], rand = rng(761), pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', ...o });
  // the kinds of people of the Tang street (dossier §10)
  const official = (at, rot, o = {}) => fig(at, 0, rot, { cloth: pick(CLOTH.off), cloth2: pick(['cloth_white', 'cloth_black']), over: 'sash', hat: 'cap', hatMat: 'cloth_black', hair: 'topknot', beard: rand() < 0.6, ...o });
  const lady = (at, rot, o = {}) => fig(at, 0, rot, { cloth: pick(CLOTH.fine), cloth2: pick(CLOTH.fine), over: 'shawl', hair: 'bun', ...o });
  const sogdian = (at, rot, o = {}) => fig(at, 0, rot, { cloth: pick(['cloth_indigo', 'cloth_green', 'cloth_maroon', 'cloth_ochre']), cloth2: 'cloth_white', over: 'belt', hat: pick(['brim', 'brim', 'turban']), skin: pick(['skin_medium', 'skin_dark']), beard: true, hair: 'short', ...o });
  const commoner = (at, rot, o = {}) => fig(at, 0, rot, { dress: 'trousers', cloth: pick(CLOTH.plain), cloth2: pick(CLOTH.plain), hat: pick(['cap', 'none', 'straw']), hair: 'topknot', skin: pick(['skin_light', 'skin_medium']), ...o });
  const monk = (at, rot, o = {}) => fig(at, 0, rot, { cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_ochre']), cloth2: pick(['cloth_ochre', 'cloth_maroon']), over: 'shawl', hair: 'shaven', ...o });
  // the market's lanes: customers and merchants in knots, hawkers' customers; chatting
  const [m0, mz0, m1, mz1] = MARKET_INNER;
  const onMarket = (x, z) => MARKET_LANES.x.some((lx) => Math.abs(x - lx) < 3) || MARKET_LANES.z.some((lz) => Math.abs(z - lz) < 3);
  for (let k = 0; k < 150; k++) {
    const vertical = rand() < 0.5;
    const x = vertical ? pick(MARKET_LANES.x) + (rand() - 0.5) * 5.2 : m0 + 4 + rand() * (m1 - m0 - 8), z = vertical ? mz0 + 4 + rand() * (mz1 - mz0 - 8) : pick(MARKET_LANES.z) + (rand() - 0.5) * 5.2;
    if (!onMarket(x, z) || L.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.1)) continue;
    const r = rand(), at = [x, z], rot = rand() * 6.28;
    if (r < 0.34) sogdian(at, rot, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.15 ? 'basket' : 'none' });
    else if (r < 0.58) commoner(at, rot, { carry: pick(['basket', 'pole', 'none', 'none']) });
    else if (r < 0.74) lady(at, rot);
    else if (r < 0.86) official(at, rot, { pose: 'talk' });
    else if (r < 0.93) commoner(at, rot, { dress: 'trousers', top: 'bare', carry: 'sack' });
    else monk(at, rot);
  }
  // camel trains: one down the avenue's roadway toward the crossing, one on street A into the West Market's lane, one resting in the caravanserai yard
  for (let k = 0; k < 6; k++) L.push({ t: 'animal', kind: 'camel', at: [-8 + (k % 2 ? 0.4 : -0.4), 70 + k * 4.2], y: 0, rot: 0.03 * (k % 2 ? 1 : -1), seed: 90 + k });
  sogdian([-7, 66], 0, { cloth: 'cloth_green', hat: 'brim' }); sogdian([-9.4, 96], 0, { cloth: 'cloth_maroon', hat: 'turban', pose: 'stand' });
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'camel', at: [-70 - k * 4.2, 8 + (k % 2 ? 0.4 : -0.4)], y: 0, rot: Math.PI / 2 + 0.03 * (k % 2 ? 1 : -1), seed: 70 + k });
  sogdian([-70 + 4.5, 7], Math.PI / 2, { cloth: 'cloth_ochre', hat: 'brim' }); sogdian([-70 - 5 * 4.2 - 1, 9], Math.PI / 2, { cloth: 'cloth_indigo', hat: 'turban' });
  for (const m of marketYards().filter((q) => q.kind === 'caravanserai')) for (let k = 0; k < 4; k++) L.push({ t: 'animal', kind: 'camel', at: [m.yard[0] + 6 + (k % 2) * 8, m.yard[1] + 3 + k * 4], y: 0, rot: Math.PI / 2 + (k % 2 ? 0.5 : 0), seed: 30 + k });
  for (const m of marketYards().filter((q) => q.kind === 'caravanserai')) for (let k = 0; k < 3; k++) sogdian([m.yard[0] + 14 + k * 1.4, m.yard[1] + 6 + k * 3], rand() * 6.28, { pose: k === 1 ? 'talk' : 'stand' });
  // officials on foot and women out walking on the avenue's edge and street A; a donkey with panniers
  for (let k = 0; k < 18; k++) {
    const x = (rand() - 0.5) * 80, z = (rand() - 0.5) * 36, at = [x, z];
    if (Math.abs(x + 8) < 6 && z > 60) continue;
    const r = rand(); if (r < 0.4) official(at, rand() * 6.28, { pose: rand() < 0.3 ? 'talk' : 'stand' }); else if (r < 0.7) lady(at, rand() * 6.28); else commoner(at, rand() * 6.28);
  }
  for (const [x, z] of [[-30, 118], [24, 180], [-20, -60]]) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: 1.2, seed: x + z, gear: true }); commoner([x - 1.6, z + 0.2], 1.2, { hat: 'straw' }); }
  // Daci'en: monks, pilgrims and the crowd before the main hall and at the pagoda
  const ax = DACI_AX;
  for (let k = 0; k < 36; k++) {
    const x = ax + (rand() - 0.5) * 60, z = 100 + rand() * 90, at = [x, z];
    if (Math.abs(x - ax) < 8 && z < 135) continue;
    if (inRect([ax - 20, 118, ax + 20, 124], x, z)) continue;
    if (inRect([ax - 28, 160, ax - 26 + 3, 184], x, z) || Math.hypot(x - (ax - 27), z - 172) < 6 || Math.hypot(x - (ax + 27), z - 172) < 6) continue;
    const r = rand(); if (r < 0.5) monk(at, rand() * 6.28, { pose: rand() < 0.3 ? 'talk' : 'stand' }); else if (r < 0.75) commoner(at, rand() * 6.28, { carry: 'none' }); else if (r < 0.9) lady(at, rand() * 6.28); else sogdian(at, rand() * 6.28);
  }
  // the Daoist temple's court: a few visitors under the peach trees
  for (let k = 0; k < 10; k++) { const x = DAO_AX + (rand() - 0.5) * 20, z = -40 - rand() * 40; if (Math.abs(x - DAO_AX) < 4) continue; (rand() < 0.5 ? lady : commoner)([x, z], rand() * 6.28); }
  void PAGODA;
  // ward gates: a guard of the ward at some of the gates, spear in hand
  let gi = 0;
  for (const g of gates()) {
    if (Math.hypot(g.c[0], g.c[1]) > 330 || (gi++ % 2)) continue;
    const [gx, gz] = g.c, off = g.axis === 'x' ? [4.6, 0] : [0, 4.6];
    commoner([gx + off[0] + (g.axis === 'x' ? 0 : 0), gz + off[1]], g.axis === 'x' ? Math.PI : -Math.PI / 2, { carry: 'staff', cloth: 'cloth_brown', hat: 'cap', hatMat: 'cloth_black' });
  }
  // dogs and a cat or two in the lanes
  for (let k = 0; k < 14; k++) { const w = WARDS[k % WARDS.length]; const x = w.c[0] + 5 + (rand() - 0.5) * 3, z = w.c[1] + (rand() - 0.5) * 60; L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 5 }); }
  return L;
}

export async function town() {
  const plans = [base('tang-changan-walls', walls()), base('tang-changan-avenue', avenue()), base('tang-changan-daoist', daoist()), base('tang-changan-market', market())];
  const fl = furnishedLot(), by = new Map();
  for (const l of lots()) { if (!by.has(l.ward)) by.set(l.ward, []); by.get(l.ward).push(l); }
  for (const [ward, ls] of [...by].sort()) for (let i = 0; i < ls.length; i += 40) plans.push(base(`tang-changan-houses-${ward}-${i / 40}`, ls.slice(i, i + 40).map((l) => ({ t: 'tang_house', ...l, furnished: l === fl }))));
  plans.push(base('tang-changan-life', [...life(), ...LO], 'life'), base('tang-changan-interior-life', interiorLife(), 'life'));
  return plans;
}
void DITCH; void AVE; void MARKET_BLOCKS;
