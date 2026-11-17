// Ubirr's country and its family camp (docs/settlements/kakadu.md §4, §5): paperbark and pandanus round the billabong, termite mounds on
// the dry edge, lilies on the water; the bark hut, the lean-to, the fires with their trough, grindstone and turtle, the racks of geese;
// the people at the camp (bare, with fibre belts, ochre and white clay), dingoes, and magpie geese crowded on the water [docs §5].
import { HOUSE } from '../../styles/kakadu/house.js';
import { faceSpots } from '../../styles/kakadu/outcrop.js';
import { RADIUS, POOL, HOLLOWS, inHollow, CAMPS, HOUSES, houseRot, height, groves, inPool, poolD, rng, inRect, MAIN, SMALL, woodland, tuftSpots, screeSpots, shelterSpots } from './layout.js';

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
    if (C.hut && !HOUSES.some((h) => h.at[0] === C.hut[0] && h.at[1] === C.hut[1])) K.push({ t: 'ka_hut', at: [C.hut[0], C.hut[1]], y: height(C.hut[0], C.hut[1]), rot: C.hut[2], seed: 1 });
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
  // ── the deepening (docs §8): woodland, ground cover, rock tops, furnished shelters, camp goods, canoes, more people ──
  const R2 = rng(2024), wood = woodland();
  for (const [x, z, h] of wood.gum) K.push({ t: 'ka_gum', at: [x, z], y: height(x, z), rot: R2() * 6.28, h: Math.round(h * 2) / 2, seed: Math.floor(R2() * 3) });
  for (const [x, z, h] of wood.cyc) K.push({ t: 'ka_cycad', at: [x, z], y: height(x, z), rot: R2() * 6.28, h: Math.round(h * 4) / 4, seed: Math.floor(R2() * 3) });
  K.push({ t: 'ka_logs', list: wood.log.map(([x, z, L, rot]) => [x, z, height(x, z), L, rot]) });
  const tl = tuftSpots();
  K.push({ t: 'ka_tufts', list: tl.map(([x, z, foot, rot, s]) => [x, z, height(x, z) - 0.02, s, rot, foot ? 'bark_olive' : 'ichu']) });
  K.push({ t: 'ka_scree', list: screeSpots().map(([x, z, s, fl], k) => [x, z, height(x, z), s, (k * 0.37) % 1 * 6.28, k % 3 === 0 ? 2 : fl ? 1 : 0]) });
  // the rock's face and crown: gums and cycads rooted on the ledges of the soft beds (small where the crown would hang over open ground, which would stand as a roof over the walker),
  // pandanus and cycads at the feet of the open clefts, tufts between; gums, cycads and pandanus in the cracks of the tops
  faceSpots().forEach(({ x, y, z, w, kind, lim }, k) => {
    const q = R2();
    if (kind === 'top') {
      if (q < 0.3) K.push({ t: 'ka_gum', at: [x, z], y: y - 0.07, rot: R2() * 6.28, h: 3 + Math.floor(R2() * 4), seed: k });
      else if (q < 0.5) K.push({ t: 'ka_cycad', at: [x, z], y: y - 0.07, rot: R2() * 6.28, h: 0.4 + Math.floor(R2() * 3) * 0.25, seed: k });
      else if (q < 0.65) K.push({ t: 'ka_pandanus', at: [x, z], y: y - 0.07, rot: R2() * 6.28, h: 2 + Math.floor(R2() * 3) * 0.5, seed: k % 3 });
      else K.push({ t: 'ka_tufts', list: [[x, z, y - 0.07, 1.1, R2() * 6.28, 'bark_olive'], [x + 0.7, z + 0.4, y - 0.07, 0.8, R2() * 6.28, 'ichu'], [x - 0.5, z + 0.9, y - 0.07, 0.9, R2() * 6.28, 'ichu']] });
      return;
    }
    if (kind === 'cleft') { K.push({ t: 'ka_pandanus', at: [x, z], y, rot: R2() * 6.28, h: 2.5 + Math.floor(R2() * 3) * 0.5, seed: k % 3 }); K.push({ t: 'ka_cycad', at: [x + 1.1, z + 0.5], y, rot: R2() * 6.28, h: 0.6 + Math.floor(R2() * 3) * 0.25, seed: k }); return; }
    const hg = Math.min(2.5 + Math.floor(R2() * 4) * 0.5, Math.floor(((lim ?? 0) - 0.4) / 0.55 * 2) / 2);
    if (q < 0.4 && w > 0.5 && hg >= 2.5) K.push({ t: 'ka_gum', at: [x, z], y, rot: R2() * 6.28, h: hg, seed: k });
    else if (q < 0.65 && (lim ?? 0) > 1.2) K.push({ t: 'ka_cycad', at: [x, z], y, rot: R2() * 6.28, h: 0.4 + Math.floor(R2() * 3) * 0.25, seed: k });
    else if (q < 0.8 && (lim ?? 0) > 2.2) K.push({ t: 'ka_pandanus', at: [x, z], y, rot: R2() * 6.28, h: 2 + Math.floor(R2() * 2) * 0.5, seed: k % 3 });
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
    if (i % 2 === 0) { if (!HOUSES.some((h) => C.hut && h.at[0] === C.hut[0])) put('bed', C.hut ? C.hut[0] - fx : -3, C.hut ? C.hut[1] - fz + 2.5 : 4.5, 0.2); put('bark', 2.6, 4.1, 1.0); } else { put('mat', -2.2, 3.6, 0.5); put('yams', 2.0, 3.8, 0.2); }
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
  // the apron between the camps, seen whole from the arrival (12-30 m off, none in the lane of the way): work groups at their mats and goods, a dog beside each
  {
    const kid = (x, z, rot, seed, pose = 'sit_ground') => L.push({ t: 'figure', at: [x, z], y: height(x, z), rot, seed, dress: 'loincloth', cloth: 'cloth_brown', skin: 'skin_dark', child: true, h: 0.95 + (seed % 3) * 0.05, pose, hair: 'short', feet: 'bare', over: 'none' });
    const at = (kind, x, z, rot, sd) => K.push({ t: 'ka_item', kind, at: [x, z], y: height(x, z), rot, seed: sd });
    const dog = (x, z, sd) => L.push({ t: 'animal', kind: 'dog', at: [x, z], y: height(x, z), rot: R2() * 6.28, seed: sd });
    const at2 = (f, x, z, rot, o) => f([x, z], height(x, z), rot, o);
    // west of the lane: a man shaping a spear shaft over a heap of shavings, a woman and a girl splitting pandanus leaf for the mat
    at('spears', -9.8, -26.0, 0.4, 61); at2(man, -8.4, -25.4, -0.6, { pose: 'sit_ground', beard: true }); at('wood', -7.6, -24.6, 0.9, 62);
    at2(woman, -11.4, -24.2, 0.5, { pose: 'sit_ground' }); kid(-12.4, -23.6, 0.9, 821); at('mat', -11.0, -25.3, 0.2, 63);
    // east of the lane: three women at a long mat with yams and a bark dish, a boy fetching water in a bark trough
    at('mat', 9.6, -26.0, -0.1, 64); at2(woman, 8.2, -25.1, 0.2, { pose: 'sit_ground' }); at2(woman, 11.0, -25.0, -0.4, { pose: 'sit_ground' }); at2(woman, 9.8, -23.9, 3.3, { pose: 'kneel' });
    at('yams', 10.6, -26.4, 0.3, 65); at('bark', 12.6, -23.8, 0.7, 66); kid(7.0, -23.8, 4.2, 822, 'stand'); dog(15.0, -22.6, 91);
    // far to either side, along the foot: pairs talking, a man with a goose spear going to the water, a heap of bark and of firewood stacked for the wet
    at2(man, -19.6, -25.6, 0.7, { pose: 'talk' }); at2(woman, -18.2, -25.2, 3.9, { pose: 'talk' }); at('wood', -21.4, -24.6, 0.3, 67); at('bark', -20.0, -23.0, 1.1, 68);
    at2(man, 18.8, -24.4, 2.5, { pose: 'staff' }); at2(woman, 20.6, -24.8, 3.5, { pose: 'stand', carry: 'basket' }); at('bags', 22.0, -23.2, 0.5, 69); dog(-17.2, -26.4, 92);
    // the lane's two edges: a bundle of spears leaned on a rock, a sleeping dog in the shade of the apron's gum
    at('spears', -4.4, -22.4, 0.2, 70); at('yams', 4.6, -22.6, 0.4, 71); dog(3.8, -24.6, 93);
  }
  // the walk-in shelters (docs §5c): bark houses, paperbark domes and brush shades with a fire, a bed, goods and people inside, their doors to the fires or the open
  {
    const wl = (Hs, lx, lz) => { const r = houseRot(Hs), c = Math.cos(r), sn = Math.sin(r); return [Hs.at[0] + lx * c + lz * sn, Hs.at[1] - lx * sn + lz * c]; };
    const within = (Hs, x, z, m) => { const r = houseRot(Hs), c = Math.cos(r), sn = Math.sin(r), dx = x - Hs.at[0], dz = z - Hs.at[1], lx = dx * c - dz * sn, lz = dx * sn + dz * c, B = HOUSE[Hs.kind]; return Math.abs(lx) < B.hw + m && Math.abs(lz) < B.hd + m; };
    const clearOf = (x, z) => !HOUSES.some((Hs) => within(Hs, x, z, 0.7));
    for (let i = K.length - 1; i >= 0; i--) { const e = K[i]; if (!e.list && e.at && ['ka_item', 'ka_rack', 'ka_leanto', 'ka_fire'].includes(e.t) && !clearOf(e.at[0], e.at[1])) K.splice(i, 1); }
    for (let i = L.length - 1; i >= 0; i--) { const e = L[i]; if (e.at && !clearOf(e.at[0], e.at[1])) L.splice(i, 1); }
    const rects = [];
    HOUSES.forEach((Hs, i) => {
      const B = HOUSE[Hs.kind], rot = houseRot(Hs), [x, z] = Hs.at, y = height(x, z), ca = Math.abs(Math.cos(rot)), sa = Math.abs(Math.sin(rot));
      const ex = (B.hw + 0.5) * ca + (B.hd + 0.5) * sa, ez = (B.hw + 0.5) * sa + (B.hd + 0.5) * ca;
      K.push({ t: 'ka_house', kind: Hs.kind, at: [x, z], y, rot, paint: i });
      rects.push({ t: 'ka_homeprecinct', at: [x, z], rect: [x - ex, z - ez, x + ex, z + ez] });
      const [fx, fz] = wl(Hs, ...B.fire); K.push({ t: 'ka_fire', at: [fx, fz], y, seed: 60 + i });
      for (const [lx, lz, kind] of B.goods) { const [gx, gz] = wl(Hs, lx, lz); K.push({ t: 'ka_item', kind, at: [gx, gz], y, rot, seed: i }); }
      // at the door: what is leaned or stacked outside
      const out = Hs.kind === 'bark' ? [[1.35, B.hd + 0.5, 'spears', 0.3], [-1.3, B.hd + 0.6, 'wood', 0.2]] : Hs.kind === 'dome' ? [[-1.5, B.hd + 0.5, 'bark', 0.5], [1.6, B.hd + 0.8, 'wood', 1.4]] : [[0, B.hd + 1.3, 'mat', 0.1], [2.1, B.hd + 0.5, 'trap', 0.5]];
      for (const [lx, lz, kind, rr] of out) { const [gx, gz] = wl(Hs, lx, lz); if (clearOf(gx, gz) || true) K.push({ t: 'ka_item', kind, at: [gx, gz], y: height(gx, gz), rot: rot + rr, seed: i + 5 }); }
      // the people: one or two sitting by the fire, a child on the bed
      B.sit.forEach(([lx, lz, rl], k) => { if (i % 3 === 2 && k === 1) return; const [px, pz] = wl(Hs, lx, lz); (k ? man : woman)([px, pz], y, rot + rl, { pose: 'sit_ground' }); });
      if (i % 2 === 0) { const [px, pz] = wl(Hs, ...B.child); L.push({ t: 'figure', at: [px, pz], y: y + 0.4, rot: rot + 1.3, seed: 900 + i, dress: 'loincloth', cloth: 'cloth_brown', skin: 'skin_dark', child: true, h: 0.95, pose: 'sit_ground', hair: 'short', feet: 'bare', over: 'none' }); }
    });
    K.push(...rects);
  }
  // ── floors, camps, birds and plants deepened (docs §13) ──
  {
    const R3 = rng(3131);
    const inHouse = (x, z, m) => HOUSES.some((Hs) => { const r = houseRot(Hs), c = Math.cos(r), sn = Math.sin(r), dx = x - Hs.at[0], dz = z - Hs.at[1], B = HOUSE[Hs.kind]; return Math.abs(dx * c - dz * sn) < B.hw + m && Math.abs(dx * sn + dz * c) < B.hd + m; });
    const free = (x, z, r) => !inHouse(x, z, 0.8) && !inPool(x, z, 0.03) && !K.some((e) => e.at && e.t !== 'ka_lilies' && Math.hypot(e.at[0] - x, e.at[1] - z) < r) && !L.some((e) => e.at && Math.hypot(e.at[0] - x, e.at[1] - z) < r);
    const useAt = (kind, x, z, seed = 0, rot = 0) => K.push({ t: 'ka_use', kind, at: [x, z], y: height(x, z), rot, seed });
    const crouch = (f, x, z, rot, pose) => f([x, z], height(x, z), rot, { pose });
    // the rock shelters' floors: shell middens at the lips, earth ovens, grinding places, ochre and fibre work, a bark bed on its frame
    useAt('shells', -19.6, -27.7, 0); useAt('shells', 19.6, -27.9, 1); useAt('shells', -48.2, -30.4, 2);
    useAt('oven', 12.0, -28.5, 1); useAt('oven', -49.4, -31.4, 0, 0.4);
    useAt('grind', -11, -28.9, 0, 0); woman([-11.0, -28.15], height(-11, -28.15), Math.PI, { pose: 'kneel' });
    useAt('grind', 5.7, -32.9, 1, 0); useAt('grind', -58.3, -34.2, 2, 0.2);
    useAt('ochre', -15.2, -32.9, 1, 0.1); useAt('string', 14.3, -32.8, 0, 0); woman([14.2, -31.95], height(14.2, -31.95), Math.PI, { pose: 'sit_ground' });
    useAt('bedframe', 19.3, -33.1, 0, 0); useAt('bedframe', -49.5, -34.9, 0, 0.05);
    // the camps: an earth oven (open or closed) at each fire, a grinding place where there was none, fibre work at some
    CAMPS.forEach((C, i) => {
      const [fx, fz] = C.fire, pick = (list, r) => list.map(([dx, dz]) => [fx + dx, fz + dz]).find(([x, z]) => free(x, z, r));
      const o = pick([[-0.5, -3.9], [-4.2, -3.2], [4.6, -5.0], [-4.6, 5.2], [5.4, 3.6], [0, 6.5]], 1.9); if (o) useAt('oven', o[0], o[1], i % 2, i * 0.7);
      if (!C.grind) { const g = pick([[-5.5, 0.5], [5.8, 1.8], [-1, 7.2], [3, -6.5]], 2.0); if (g) { useAt('grind', g[0], g[1], i % 3, 0.3); woman([g[0], g[1] + 0.75], height(g[0], g[1]), Math.PI, { pose: 'kneel' }); } }
      if (i % 3 === 1) { const t = pick([[6.2, 5.8], [-6.2, 4.6], [6.8, -3.4], [-3, 8]], 2.0); if (t) { useAt('string', t[0], t[1], i % 3, 0.2); woman([t[0], t[1] + 0.7], height(t[0], t[1]), Math.PI, { pose: 'sit_ground' }); } }
      if (i === 4 || i === 6) { const t = pick([[-6.5, 2], [6.5, 1.5], [0, -6.5]], 2.0); if (t) useAt('ochre', t[0], t[1], i % 3, 0.5); }
    });
    // by the doors of the walk-in shelters: the work done in the shade of the eaves
    HOUSES.forEach((Hs, i) => {
      const B = HOUSE[Hs.kind], r = houseRot(Hs), c = Math.cos(r), sn = Math.sin(r), wl2 = (lx, lz) => [Hs.at[0] + lx * c + lz * sn, Hs.at[1] - lx * sn + lz * c];
      const p = [[3.0, B.hd + 1.1], [-3.0, B.hd + 1.1], [3.4, 0.5], [-3.4, 0.5], [0, B.hd + 2.6]].map(([lx, lz]) => wl2(lx, lz)).find(([x, z]) => free(x, z, 1.8));
      if (!p) return;
      const kind = ['oven', 'grind', 'string'][i % 3];
      useAt(kind, p[0], p[1], i % 2, r);
      if (kind !== 'oven') woman([p[0], p[1] + 0.75], height(p[0], p[1]), Math.PI, { pose: kind === 'grind' ? 'kneel' : 'sit_ground' });
    });
    // the water's birds: magpie geese in the shallows and on the margin (black and white), plumed whistling ducks packed on the mud
    const shallow = (x, z) => { const h = height(x, z); return h > -0.75 && h < -0.28; };
    const geese = [];
    for (let gI = 0; gI < 9; gI++) {
      const ga = R3() * 6.28, gd = 0.78 + R3() * 0.3, gx = POOL.c[0] + Math.cos(ga) * POOL.a * gd, gz = POOL.c[1] + Math.sin(ga) * POOL.b * gd, hd = R3() * 6.28;
      for (let k = 0, n = 0; k < 40 && n < 5 + Math.floor(R3() * 4); k++) {
        const x = gx + (R3() - 0.5) * 6, z = gz + (R3() - 0.5) * 4;
        if (!shallow(x, z) || !free(x, z, 0.9) || geese.some((q) => Math.hypot(q[0] - x, q[1] - z) < 0.8)) continue;
        const q = R3(); geese.push([x, z, height(x, z), hd + (R3() - 0.5) * 1.4, q < 0.42 ? 1 : q < 0.55 ? 2 : 0, 0.92 + R3() * 0.16]); n++;
      }
    }
    for (let k = 0; k < 40 && geese.length < 90; k++) { const a = R3() * 6.28, d = 1.06 + R3() * 0.1, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d; if (free(x, z, 3) && !inPool(x, z, 0)) for (let j = 0; j < 4; j++) geese.push([x + R3() * 2, z + R3() * 2, height(x, z), R3() * 6.28, j % 2, 1]); }
    K.push({ t: 'ka_geese', list: geese });
    const duck = [];
    for (const [da, dd] of [[0.5, 1.2], [3.9, 1.22], [5.5, 1.18]]) {
      const cx = POOL.c[0] + Math.cos(da) * POOL.a * dd, cz = POOL.c[1] + Math.sin(da) * POOL.b * dd;
      for (let k = 0, n = 0; k < 60 && n < 12; k++) { const x = cx + (R3() - 0.5) * 3.4, z = cz + (R3() - 0.5) * 2.6; if (inPool(x, z, 0.0) || !free(x, z, 0.75) || duck.some((q) => Math.hypot(q[0] - x, q[1] - z) < 0.45)) continue; duck.push([x, z, height(x, z), 1.4 + (R3() - 0.5) * 1.2, R3() < 0.3 ? 1 : 0, 1]); n++; }
    }
    K.push({ t: 'ka_whistlers', list: duck });
    // spike-rush and sedge in the shallows and round the hollows
    const sed = [];
    for (let k = 0; k < 400 && sed.length < 80; k++) { const a = R3() * 6.28, d = 0.86 + R3() * 0.3, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d; if (free(x, z, 1.4) && !duck.some((q) => Math.hypot(q[0] - x, q[1] - z) < 1) && !geese.some((q) => Math.hypot(q[0] - x, q[1] - z) < 0.8)) sed.push([x, z, height(x, z), 0.8 + R3() * 0.6, R3() * 6.28]); }
    for (const [cx, cz, ha, hb] of HOLLOWS) for (let k = 0; k < 9; k++) { const a = R3() * 6.28, x = cx + Math.cos(a) * ha * (0.8 + R3() * 0.4), z = cz + Math.sin(a) * hb * (0.8 + R3() * 0.4); if (free(x, z, 1.2)) sed.push([x, z, height(x, z), 0.7 + R3() * 0.5, R3() * 6.28]); }
    K.push({ t: 'ka_sedge', list: sed });
    // paperbark come away from the trunks lies in scrolls under the trees
    const bl = [];
    for (const [x, z] of paper) for (let k = 0; k < 5; k++) { const a = R3() * 6.28, d = 0.8 + R3() * 2.4, bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d; if (!inPool(bx, bz, 0.02) && !inHollow(bx, bz, 0.4) && !inHouse(bx, bz, 0.4)) bl.push([bx, bz, height(bx, bz), R3() * 6.28, 0.8 + R3() * 0.6]); }
    K.push({ t: 'ka_barklitter', list: bl });
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
