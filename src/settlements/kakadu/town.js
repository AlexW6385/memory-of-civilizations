// Ubirr's country and its family camp (docs/settlements/kakadu.md §4, §5): paperbark and pandanus round the billabong, termite mounds on
// the dry edge, lilies on the water; the bark hut, the lean-to, the fires with their trough, grindstone and turtle, the racks of geese;
// the people at the camp (bare, with fibre belts, ochre and white clay), dingoes, and magpie geese crowded on the water [docs §5].
import { RADIUS, POOL, CAMPS, height, groves, inPool, poolD, rng, inRect, MAIN, SMALL } from './layout.js';

const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -14], facing: 's' } });

export async function town() {
  const rand = rng(1000), K = [], L = [], { paper, pand, term } = groves();
  for (const [x, z, h] of paper) K.push({ t: 'ka_paperbark', at: [x, z], y: height(x, z), rot: rand() * 6.28, h, seed: Math.floor(rand() * 4) });
  for (const [x, z, h] of pand) K.push({ t: 'ka_pandanus', at: [x, z], y: height(x, z), rot: rand() * 6.28, h: Math.round(h * 2) / 2, seed: Math.floor(rand() * 3) });
  for (const [x, z, h] of term) K.push({ t: 'ka_termite', at: [x, z], y: height(x, z), h: Math.round(h * 4) / 4 });
  for (let k = 0; k < 8; k++) {
    const a = rand() * 6.28, d = Math.sqrt(rand()) * 0.8, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d;
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
    K.push({ t: 'ka_leanto', at: [C.lean[0], C.lean[1]], y: height(C.lean[0], C.lean[1]), rot: C.lean[2], seed: 2 });
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
  // a hunter at the billabong's edge with a goose spear; people on the way along the foot
  for (let k = 0; k < 8; k++) { const x = -60 + rand() * 100, z = -18 + rand() * 5; (rand() < 0.5 ? man : woman)([x, z], height(x, z), rand() * 6.28, rand() < 0.4 ? { pose: 'talk' } : {}); }
  man([POOL.c[0] - POOL.a * 1.08, POOL.c[1] - 5], 0, -1.2, { pose: 'staff' });
  // magpie geese crowded on the shrunken water and on its margin
  for (let k = 0; k < 12; k++) {
    const a = rand() * 6.28, d = Math.sqrt(rand()) * 0.55, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d;
    if (inPool(x, z, -0.1)) L.push({ t: 'chickens', kind: 'goose', at: [x, z], y: POOL.water - 0.02, rot: rand() * 6.28, n: 4 + Math.floor(rand() * 4), seed: k + 21 });
  }
  void poolD; void inRect;
  return [plan('kakadu-country', 'kakadu', K), plan('kakadu-people', 'life', L)];
}
