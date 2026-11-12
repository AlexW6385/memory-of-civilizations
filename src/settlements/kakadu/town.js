// Ubirr's country and its family camp (docs/settlements/kakadu.md §4, §5): paperbark and pandanus round the billabong, termite mounds on
// the dry edge, lilies on the water; the bark hut, the lean-to, the fires with their trough, grindstone and turtle, the racks of geese;
// the people at the camp (bare, with fibre belts, ochre and white clay), dingoes, and magpie geese crowded on the water [docs §5].
import { faceSpots } from '../../styles/kakadu/outcrop.js';
import { RADIUS, POOL, CAMPS, height, groves, inPool, poolD, rng, inRect, MAIN, SMALL, woodland, tuftSpots, screeSpots, shelterSpots, topSpots } from './layout.js';

const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -14], facing: 's' } });

export async function town() {
  const rand = rng(1000), K = [], L = [], { paper, pand, term } = groves();
  for (const [x, z, h] of paper) K.push({ t: 'ka_paperbark', at: [x, z], y: height(x, z), rot: rand() * 6.28, h, seed: Math.floor(rand() * 4) });
  for (const [x, z, h] of pand) K.push({ t: 'ka_pandanus', at: [x, z], y: height(x, z), rot: rand() * 6.28, h: Math.round(h * 2) / 2, seed: Math.floor(rand() * 3) });
  for (const [x, z, h] of term) K.push({ t: 'ka_termite', at: [x, z], y: height(x, z), h: Math.round(h * 4) / 4 });
  for (let k = 0; k < 18; k++) {
    const a = rand() * 6.28, d = Math.sqrt(rand()) * 0.85, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d;
    K.push({ t: 'ka_lilies', at: [x, z], y: POOL.water, n: 16, r: 4.5, seed: k + 9 });
  }
  // the camps
  const skin = () => (rand() < 0.5 ? 'skin_dark' : 'skin_medium');
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'none', skin: skin(), hat: 'none', hair: rand() < 0.5 ? 'short' : 'long', beard: rand() < 0.4, feet: 'bare', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'strands', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'none', skin: skin(), hat: 'none', hair: 'short', beard: false, feet: 'bare', ...o });
  CAMPS.forEach((C, i) => {
    const [fx, fz] = C.fire, y = height(fx, fz);
    K.push({ t: 'ka_fire', at: [fx, fz], y, seed: i + 3, turtle: C.turtle, trough: C.trough, grind: C.grind, fish: C.fish });
    if (C.hut) K.push({ t: 'ka_hut', at: [C.hut[0], C.hut[1]], y: height(C.hut[0], C.hut[1]), rot: C.hut[2], seed: 1 });
    if (C.lean) K.push({ t: 'ka_leanto', at: [C.lean[0], C.lean[1]], y: height(C.lean[0], C.lean[1]), rot: C.lean[2], seed: 2 });
    K.push({ t: 'ka_rack', at: [C.rack[0], C.rack[1]], y: height(C.rack[0], C.rack[1]), rot: 0.2, len: 2.2 });
    woman([fx + 1.0, fz + 0.9], y, -2.3, { pose: 'sit_ground' });
    man([fx - 1.1, fz - 0.6], y, 1.0, { pose: 'sit_ground' });
    woman([fx - 0.4, fz + 1.5], y, 3.0, { pose: 'kneel', over: 'none' });
    man([fx + 2.4, fz - 0.8], y, 2.0, { pose: 'talk' });
    L.push({ t: 'figure', at: [fx + 1.7, fz + 1.2], y, rot: 4, seed: 70 + i, dress: 'loincloth', cloth: 'cloth_brown', skin: 'skin_dark', child: true, h: 1.05, hair: 'short', feet: 'bare', over: 'none' });
    L.push({ t: 'animal', kind: 'dog', at: [fx + 2.0, fz + 0.2], y, rot: rand() * 6.28, seed: 5 + i });
  });
  // the shelters' floors: people before the paintings, looking up at them
  for (const [S, n] of [[MAIN, 3], [SMALL, 1]]) for (let k = 0; k < n; k++) {
    const x = S.x0 + 5 + rand() * (S.x1 - S.x0 - 10), z = S.zl - 2.5 - rand() * 1.2;
    (k % 2 ? woman : man)([x, z], height(x, z), Math.PI, { pose: k === 0 ? 'stand' : 'talk' });
  }
  // an old man teaching the children before the great panel, a woman and a girl weaving a pandanus mat in the shade at its east end
  {
    const zt = MAIN.zl - 3.3, kid = (x, z, rot, seed) => L.push({ t: 'figure', at: [x, z], y: height(x, z), rot, seed, dress: 'loincloth', cloth: 'cloth_brown', skin: 'skin_dark', child: true, h: 0.95 + (seed % 3) * 0.05, pose: 'sit_ground', hair: 'short', feet: 'bare', over: 'none' });
    man([-4.6, zt], height(-4.6, zt), Math.PI, { pose: 'stand', beard: true, hair: 'long' });
    kid(-5.6, zt + 1.3, Math.PI, 811); kid(-4.3, zt + 1.5, Math.PI, 812); kid(-3.1, zt + 1.2, Math.PI, 813);
    const wx = MAIN.x1 - 5, wz = MAIN.zl - 2.6;
    K.push({ t: 'ka_item', kind: 'mat', at: [wx, wz], y: height(wx, wz), rot: 0.1, seed: 9 });
    woman([wx + 0.9, wz + 0.4], height(wx, wz), -1.9, { pose: 'sit_ground' }); kid(wx - 0.4, wz + 1.2, 0.4, 814);
  }
  // a hunter at the billabong's edge with a goose spear; people on the way along the foot
  for (let k = 0; k < 8; k++) { const x = -60 + rand() * 100, z = -18 + rand() * 5, f = rand() < 0.5 ? man : woman, rot = rand() * 6.28, o = rand() < 0.4 ? { pose: 'talk' } : {}; if (Math.hypot(x + 1, z + 13) < 9) continue; f([x, z], height(x, z), rot, o); }   // (none within 9 m of the arrival)
  man([POOL.c[0] - POOL.a * 1.08, POOL.c[1] - 5], 0, -1.2, { pose: 'staff' });
  // magpie geese crowded on the shrunken water and on its margin
  for (let k = 0; k < 12; k++) {
    const a = rand() * 6.28, d = Math.sqrt(rand()) * 0.55, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d;
    if (inPool(x, z, -0.1)) L.push({ t: 'chickens', kind: 'goose', at: [x, z], y: POOL.water - 0.02, rot: rand() * 6.28, n: 4 + Math.floor(rand() * 4), seed: k + 21 });
  }
  // ── the deepening (docs §8): woodland, ground cover, rock tops, furnished shelters, camp goods, canoes, more people ──
  const R2 = rng(2024), wood = woodland();
  for (const [x, z, h] of wood.gum) K.push({ t: 'ka_gum', at: [x, z], y: height(x, z), rot: R2() * 6.28, h: Math.round(h * 2) / 2, seed: Math.floor(R2() * 3) });
  for (const [x, z, h] of wood.cyc) K.push({ t: 'ka_cycad', at: [x, z], y: height(x, z), rot: R2() * 6.28, h: Math.round(h * 4) / 4, seed: Math.floor(R2() * 3) });
  K.push({ t: 'ka_logs', list: wood.log.map(([x, z, L, rot]) => [x, z, height(x, z), L, rot]) });
  const tl = tuftSpots();
  K.push({ t: 'ka_tufts', list: tl.map(([x, z, foot, rot, s]) => [x, z, height(x, z) - 0.02, s, rot, foot ? 'bark_olive' : 'ichu']) });
  K.push({ t: 'ka_scree', list: screeSpots().map(([x, z, s, fl], k) => [x, z, height(x, z), s, (k * 0.37) % 1 * 6.28, k % 3 === 0 ? 2 : fl ? 1 : 0]) });
  // the rock's tops: gums in the cracks, cycads and tufts on the ledges
  topSpots().forEach(([x, z, y], k) => {
    const q = R2(), yy = y - 0.12;
    if (q < 0.3) K.push({ t: 'ka_gum', at: [x, z], y: yy, rot: R2() * 6.28, h: 3 + Math.floor(R2() * 4), seed: k });
    else if (q < 0.5) K.push({ t: 'ka_cycad', at: [x, z], y: yy, rot: R2() * 6.28, h: 0.4 + Math.floor(R2() * 3) * 0.25, seed: k });
    else if (q < 0.65) K.push({ t: 'ka_pandanus', at: [x, z], y: yy, rot: R2() * 6.28, h: 2 + Math.floor(R2() * 3) * 0.5, seed: k % 3 });
    else K.push({ t: 'ka_tufts', list: [[x, z, yy, 1.1, R2() * 6.28, 'bark_olive'], [x + 0.7, z + 0.4, yy, 0.8, R2() * 6.28, 'ichu'], [x - 0.5, z + 0.9, yy, 0.9, R2() * 6.28, 'ichu']] });
  });
  // the rock's face: gums and cycads rooted on the ledges of the soft beds, pandanus and cycads at the feet of the open clefts, tufts between
  faceSpots().forEach(({ x, y, z, w, kind }, k) => {
    const q = R2();
    if (kind === 'cleft') { K.push({ t: 'ka_pandanus', at: [x, z], y, rot: R2() * 6.28, h: 2.5 + Math.floor(R2() * 3) * 0.5, seed: k % 3 }); K.push({ t: 'ka_cycad', at: [x + 1.1, z + 0.5], y, rot: R2() * 6.28, h: 0.6 + Math.floor(R2() * 3) * 0.25, seed: k }); return; }
    if (q < 0.4 && w > 0.5) K.push({ t: 'ka_gum', at: [x, z], y, rot: R2() * 6.28, h: 2.5 + Math.floor(R2() * 4) * 0.5, seed: k });
    else if (q < 0.65) K.push({ t: 'ka_cycad', at: [x, z], y, rot: R2() * 6.28, h: 0.4 + Math.floor(R2() * 3) * 0.25, seed: k });
    K.push({ t: 'ka_tufts', list: [[x + 0.5, z, y, 0.9, R2() * 6.28, 'bark_olive'], [x - 0.6, z + 0.1, y, 0.8, R2() * 6.28, 'ichu'], [x + 1.4, z - 0.1, y, 0.7, R2() * 6.28, 'ichu']] });
  });
  // the shelters furnished
  const sp = shelterSpots();
  sp.forEach(([kind, x, z, rot], k) => {
    const y = height(x, z);
    if (kind === 'hearth') K.push({ t: 'ka_fire', at: [x, z], y, seed: 30 + k, trough: k === 1 });
    else K.push({ t: 'ka_item', kind, at: [x, z], y, rot: rot ?? 0, seed: k });
    if (kind === 'paint') {
      woman([x + 0.9, z + 0.95], y, 0, { pose: 'kneel' });
      man([x - 1.0, z + 1.5], y, 0.3, { pose: 'stand', over: 'none' });
    }
    if (kind === 'hearth') { woman([x + 0.9, z + 0.7], y, -2.0, { pose: 'sit_ground' }); if (k !== 1) man([x - 1.0, z + 0.6], y, 1.0, { pose: 'sit_ground' }); }
    if (kind === 'bed' && k < 5) L.push({ t: 'figure', at: [x, z], y: y + 0.09, rot: 1.2, seed: 300 + k, dress: 'loincloth', cloth: 'cloth_brown', skin: 'skin_dark', child: true, h: 0.95, pose: 'sit_ground', hair: 'short', feet: 'bare', over: 'none' });
  });
  // the camps' goods, round each fire (by its hash, not always the same)
  CAMPS.forEach((C, i) => {
    const [fx, fz] = C.fire, put = (kind, dx, dz, rot) => K.push({ t: 'ka_item', kind, at: [fx + dx, fz + dz], y: height(fx + dx, fz + dz), rot, seed: i + (kind.length % 3) });
    put('bags', -2.8, 2.6, 0.3); put('spears', 3.6, -1.6, 0.5 + i); put('wood', -3.0, -1.8, 0.4 * i); put('midden', 4.4 + (i % 2), -3.6, i);
    if (i % 2 === 0) { put('bed', C.hut ? C.hut[0] - fx : -3, C.hut ? C.hut[1] - fz + 2.5 : 4.5, 0.2); put('bark', 2.6, 4.1, 1.0); } else { put('mat', -2.2, 3.6, 0.5); put('yams', 2.0, 3.8, 0.2); }
    if (C.fish || i === 2) put('trap', 3.2, 3.2, 0.6);
    woman([fx - 2.6, fz + 3.8], height(fx - 2.6, fz + 3.8), 0.4, { pose: i % 2 ? 'sit_ground' : 'kneel' });
    L.push({ t: 'animal', kind: 'dog', at: [fx - 3.2, fz - 1.0], y: height(fx - 3.2, fz - 1.0), rot: R2() * 6.28, seed: 40 + i });
  });
  // canoes: one poled on the billabong, one drawn up on its west margin, one at the north bank
  const cx0 = POOL.c[0], cz0 = POOL.c[1], wy = POOL.water - 0.1;
  K.push({ t: 'ka_canoe', at: [-6, 36], y: wy, rot: 1.0 });
  man([-6 - Math.sin(1.0) * 0.95, 36 - Math.cos(1.0) * 0.95], wy + 0.12, 1.0, { pose: 'punt' });
  K.push({ t: 'ka_canoe', at: [cx0 + 8, cz0 - POOL.b * 0.9], y: wy, rot: 2.2 });
  woman([cx0 + 8 + Math.sin(2.2) * 0.8, cz0 - POOL.b * 0.9 + Math.cos(2.2) * 0.8], wy + 0.12, 2.2, { pose: 'sit_ground', carry: 'none' });
  { const a = 3.45, x = cx0 + Math.cos(a) * POOL.a * 1.1, z = cz0 + Math.sin(a) * POOL.b * 1.1; K.push({ t: 'ka_canoe', at: [x, z], y: Math.max(height(x, z), wy) - 0.02, rot: 0.6 }); K.push({ t: 'ka_item', kind: 'wood', at: [x + 2, z - 1], y: height(x + 2, z - 1), rot: 0.3, seed: 1 }); }
  // wading and gathering at the margin: a woman with a digging stick and a bag; a man with a goose spear
  woman([cx0 - 31, cz0 + 21], height(cx0 - 31, cz0 + 21), 0.5, { pose: 'stand', carry: 'staff', staffMat: 'wood_dark' });
  man([cx0 + 30, cz0 - 20], height(cx0 + 30, cz0 - 20), 2.4, { pose: 'staff' });
  // the lookout and the ledges: people sitting on the rock over the plain
  for (const [x, z, y, rot, pose] of [[44, -29, 4.7, Math.PI, 'sit_ground'], [46.2, -28.6, 4.7, Math.PI, 'sit_ground'], [50, -45, 11.3, Math.PI, 'stand'], [56, -44, 11.3, Math.PI, 'talk'], [58.4, -62, 21.1, Math.PI, 'sit_ground'], [60.4, -61, 21.1, Math.PI, 'sit_ground']]) (R2() < 0.5 ? man : woman)([x, z], y, rot, { pose });
  // a dog or two lying in the shade of the overhang, and more geese
  for (const [x, z] of [[-14, -29.6], [14, -29.6], [-52, -32]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: height(x, z), rot: R2() * 6.28, seed: x + 9 });
  for (let k = 0; k < 10; k++) {
    const a = R2() * 6.28, d = 0.6 + R2() * 0.4, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d;
    if (inPool(x, z, -0.1)) L.push({ t: 'chickens', kind: 'goose', at: [x, z], y: POOL.water - 0.02, rot: R2() * 6.28, n: 3 + Math.floor(R2() * 5), seed: k + 51 });
  }
  void poolD; void inRect;
  // the country in four quarters (so that the far ones cull apart)
  const quad = [[], [], [], []];
  const qi = (p) => (p[0] > 0 ? 1 : 0) + (p[1] > 20 ? 2 : 0);
  for (const e of K) {
    if (!e.list) { quad[qi(e.at ?? [0, 0])].push(e); continue; }
    const sub = [[], [], [], []];
    for (const q of e.list) sub[qi(q)].push(q);
    sub.forEach((l, i) => { if (l.length) quad[i].push({ ...e, list: l }); });
  }
  return [...quad.map((q, i) => plan('kakadu-country-' + i, 'kakadu', q)), plan('kakadu-people', 'life', L)];
}
