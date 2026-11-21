// The calpulli round the precinct (docs/settlements/tenochtitlan.md §5, §13): house compounds of plastered adobe on low stone platforms
// round their patios, their rooms furnished; the farmers' houses of wattle and thatch on the chinampas.
import { RADIUS, LEVEL, ISLAND, PRECINCT, TM, SITES, houses, yards, priestHouses, houseGate, houseTrade, houseNoble, chinampaHouses, inLake, inLakeWater } from './layout.js';
import { ground } from './ground.js';
import { sculptPlans } from './sculpt.js';
import { tiles } from './tiles.js';
import { isOpen, figureSpot } from './walk.js';
import { lights } from './nightlight.js';
/** How far from the visitor the houses are built in full (m); the arrival (the Templo Mayor's twin shrines, 160 m and more from the nearest) sees the simple form. */
const NEAR = 190;
const base = (id, elements) => ({ id, style: 'aztec', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-60, 0], facing: 'e' } });
/**
 * The precinct's floor and the life before the Templo Mayor (docs/settlements/tenochtitlan.md §13): the plaza's plaster worn, stained and painted
 * (a red band and a blue line round the temple's platform, the trodden ways from the gates to its stair), the sellers of offerings (copal,
 * flowers, paper, quail) sitting on their mats before the Tzompantli's side, guards at the stair's foot and people crossing.
 */
function precinct() {
  const rand = ((q) => () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296))(1530), pick = (a) => a[Math.floor(rand() * a.length)], Y = 0.03;
  const P = [], M = [], L = [];
  const skip = [[-14, -20, 6, 0], [55, -58, 142, 58], [40, 20, 54, 62], [-73, 58, -37, 93], [9, -111, 41, -79], [15, 75, 69, 129], [-81, -76, -19, -54], [84, -140, 136, -102], [-141, -141, -83, -103], [-139, 99, -89, 139], [-40, 30, -20, 50]];
  const E = [
    { t: 'plaza_wear', rect: PRECINCT, seed: 91, skip, n: 320, y: Y },
    { t: 'plaza_marks', rect: PRECINCT, ring: [TM.c[0] - TM.w / 2, -TM.d / 2, TM.c[0] + TM.w / 2, TM.d / 2], noWay: true, ways: [[-146, -1.9, 37, 1.9], [-1.9, -146, 1.9, -24], [-1.9, 24, 1.9, 146]], skip: [[-14, -20, 6, 0], [142, -60, 160, 60]], y: Y },
  ];
  // the sellers of offerings on their mats, a buyer by each
  const sellers = [[8, 22], [17, 28], [26, 22], [11, 37], [22, 40], [32, 32], [3, 31], [29, 44]];
  sellers.forEach(([x, z], i) => {
    M.push({ t: 'petate', at: [x, z], y: Y, w: 1.9, d: 1.3, rot: (rand() - 0.5) * 0.4 });
    P.push([x, z - 0.1, Y, Math.PI * 0.5 + (rand() - 0.5) * 0.6, 'seller', 500 + i]);
    for (let k = 0; k < 3; k++) {
      const at = [x - 0.55 + k * 0.55 + (rand() - 0.5) * 0.1, z + 0.5 + (rand() - 0.5) * 0.2], g = rand();
      if (g < 0.5) L.push({ t: 'basket', at, y: Y + 0.015, seed: Math.floor(rand() * 1e6), goods: pick(['paint_ochre', 'cloth_red', 'cloth_ochre', 'cloth_white']) });
      else if (g < 0.8) L.push({ t: 'pot', kind: pick(['dark_pot', 'water_pot']), at, y: Y + 0.015, seed: Math.floor(rand() * 1e6) });
      else L.push({ t: 'chickens', kind: 'turkey', at, y: Y, n: 2, rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) });
    }
    if (i % 2 === 0) P.push([x + 0.9, z + 1.7, Y, Math.PI + (rand() - 0.5), pick(['woman', 'man', 'bearer']), 520 + i]);
  });
  // guards at the stair's foot, people crossing the plaza between the gate and the temple (clear of the route's way)
  P.push([34, -5.6, Y, Math.PI / 2, 'guard', 540], [34, 5.8, Y, Math.PI / 2, 'guard', 541]);
  for (let i = 0; i < 26; i++) {
    const x = -42 + rand() * 78, z = (rand() < 0.5 ? -1 : 1) * (14 + rand() * 40);
    if (Math.hypot(x + 4, z + 10) < 14 || (x > 3 && x < 36 && z > 16 && z < 48) || Math.hypot(x + 6, z - 62) < 6 || Math.hypot(x + 10, z - 30) < 11) continue;
    P.push([x, z, Y, rand() * 6.28, ['man', 'woman', 'bearer', 'noble', 'man', 'priest', 'woman', 'child'][i % 8], 560 + i]);
    if (i % 4 === 0) P.push([x + 1.3, z + 0.8, Y, rand() * 6.28, i % 8 ? 'woman' : 'man', 600 + i]);
  }
  // a game of tlachtli in the ballcourt (c −50, −65; the alley 60 × 9 m along x): two teams of three in hip-guards of hide with the rubber ball
  // between them, and the lords and the people watching from the tops of the side platforms (4 m; the flat top 3.5 m wide from the alley's edge)
  {
    const cx = -50, cz = -65, Yb = 0.05, ball = [cx + 1.5, cz + 0.8];
    for (const [side, c2] of [[-1, 'cloth_red'], [1, 'cloth_indigo']]) for (let i = 0; i < 3; i++) {
      const x = cx + side * (6 + i * 7 + rand() * 3), z = cz + (rand() - 0.5) * 6;
      L.push({ t: 'figure', at: [x, z], y: Yb, rot: side < 0 ? -Math.PI / 2 : Math.PI / 2, seed: Math.floor(rand() * 1e9), h: 1.62, dress: 'loincloth', top: 'bare', cloth: 'cloth_white', cloth2: c2, over: 'belt', skin: pick(['skin_medium', 'skin_dark']), hair: 'short', hairMat: 'hide_black', feet: 'bare', legs: 'bare', pose: i === 1 ? 'kneel' : 'stand' });
    }
    E.push({ t: 'm_ball', at: ball, y: Yb });
    for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
      const x = cx - 27 + i * 6.4 + rand() * 2, z = cz + s * (4.5 + 1.3 + rand() * 0.9);
      P.push([x, z, 4.0, s < 0 ? Math.PI : 0, i % 4 === 0 ? 'noble' : pick(['man', 'woman', 'man', 'child']), 700 + i + (s > 0 ? 20 : 0), { pose: i % 3 === 0 ? 'sit_ground' : 'stand' }]);
    }
  }
  // the braziers at the stair's foot and the offerings left about them and at the foot of the momoztli
  const D = [['brazier', 35, -16.5], ['brazier', 35, 16.5], ['brazier', 35, -10], ['brazier', 35, 10], ['brazier', 15.6, -14.8], ['brazier', 15.6, -5.2]];   // the last two at the foot of Ehecatl's stair
  for (const [x, z] of [[33, -14], [32.6, -17.5], [33, 14], [32.4, 17.8], [32, 9], [32, -9]]) D.push([rand() < 0.6 ? 'flowers' : 'roses', x, z, rand() * 6.28]);
  for (const [x, z] of [[31, 12], [31, -12], [36.5, -13], [36.5, 13]]) D.push(['paper', x, z, rand() * 6.28]);
  E.push({ t: 'mx_dress', items: D });
  return [base('tenochtitlan-precinct-floor', [...E, ...M, { t: 'mx_people', people: P }]), { ...base('tenochtitlan-precinct-goods', L), style: 'life' }];
}

const posOf = (e) => (e.rect ? [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2] : e.c ?? e.at ?? [0, 0]);
/** `elements` in square tiles of `size` m, each its own plan shown within `reach` m of its middle. */
function near(id, elements, size, reach) {
  const tiles = new Map();
  for (const e of elements) { const [x, z] = posOf(e), k = `${Math.floor(x / size)},${Math.floor(z / size)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, list), near: reach, center: [(i + 0.5) * size, (j + 0.5) * size], nocollide: false }; });
}
/** `elements` by the octant of their bearing from the island's middle, each octant its own plan shown within `reach` m of its elements' mean place. A `tule_beds` / `at` list is split by its own points. */
function sectors(id, elements, n, reach) {
  const oct = (x, z) => ((Math.round(Math.atan2(z, x) / (Math.PI * 2) * n) % n) + n) % n, by = new Map();
  for (const e of elements) {
    if (e.t === 'tule_beds') { const parts = new Map(); for (const p of e.at) { const k = oct(p[0], p[1]); if (!parts.has(k)) parts.set(k, []); parts.get(k).push(p); } for (const [k, at] of parts) { if (!by.has(k)) by.set(k, []); by.get(k).push({ ...e, at }); } continue; }
    const [x, z] = posOf(e), k = oct(x, z); if (!by.has(k)) by.set(k, []); by.get(k).push(e);
  }
  return [...by].map(([k, list]) => {
    const P = list.flatMap((e) => (e.t === 'tule_beds' ? e.at : [posOf(e)])), c = [P.reduce((a, p) => a + p[0], 0) / P.length, P.reduce((a, p) => a + p[1], 0) / P.length];
    return { ...base(`${id}-${k}`, list), near: reach, center: c };
  });
}

export async function town() {
  const all = houses(), plans = [];
  // the houses in tiles of 150 m, each built twice (tiles.js): in full within NEAR of the visitor, simple (solid rooms, the wall, no furniture)
  // beyond: the arrival frame shows the far form only, a tile's meshes are batched per material and culled by their own bounds
  plans.push(...tiles('tenochtitlan-houses', 'aztec', all.flatMap((h) => {
    const c = [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2], r = Math.hypot(c[0], c[1]), lod = r < 170 ? 2 : r < 250 ? 1 : 0;
    const noble = houseNoble(h);
    return [{ t: 'calli', ...h, noble, open: isOpen(h) }, { t: 'calli_front', rect: h.rect, seed: h.seed, gate: houseGate(h), trade: noble ? null : houseTrade(h), lod }];
  }), { near: NEAR, R: RADIUS, entrance: { at: [-60, 0], facing: 'e' } }));
  // the people in the priests' compounds of the precinct (layout.js): in each patio, by the gate's side
  {
    const kinds = ['priest', 'woman', 'sweeper', 'priest', 'woman', 'man', 'child', 'woman', 'priest'], people = [];
    priestHouses().forEach((h, i) => {
      const cx = (h.rect[0] + h.rect[2]) / 2, cz = (h.rect[1] + h.rect[3]) / 2, g = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[houseGate(h)];
      const sp = figureSpot(h, i) ?? [cx + g[0] * 1.0, cz + g[1] * 1.0];                           // (out of the lane from the gate to the hearth room's door: walk.js)
      people.push([sp[0], sp[1], 0.42, Math.atan2(g[0], g[1]) + (i % 2 ? 1.2 : -1.2), kinds[i % kinds.length], 800 + i, { pose: i % 3 === 1 ? 'sit_ground' : 'stand' }]);
    });
    plans.push(base('tenochtitlan-priests-people', [{ t: 'mx_people', people }]));
  }
  // the calpulli's temples and schools (layout.js SITES): the telpochcalli round its court in the north of the block, the paved plaza before its
  // gate, the calpulli's temple on its small pyramid in the south with the stair toward the plaza; youths at their training, a brazier at the stair's foot
  plans.push(base('tenochtitlan-calpulli', SITES.flatMap((q, i) => {
    const X = q.x, Z = q.z, rp = ((a) => () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296))(1600 + i);
    const P = [[X + 12 + rp() * 14, Z + 29 + rp() * 2.5, 0.03, rp() * 6.28, 'youth', 1700 + i * 10], [X + 12 + rp() * 14, Z + 29 + rp() * 2.5, 0.03, rp() * 6.28, 'youth', 1701 + i * 10],
      [X + 10 + rp() * 6, Z + 30, 0.03, rp() * 6.28, 'man', 1702 + i * 10], [X + 25 + rp() * 6, Z + 30.5, 0.03, rp() * 6.28, 'sweeper', 1703 + i * 10]];
    return [
      { t: 'court_house', rect: [X + 7.2, Z + 2.7, X + 31.2, Z + 27.2], h: 3.4, ring: 5.5, seed: 1650 + i, band: i % 2 === 0 },
      { t: 'lane', rect: [X + 4, Z + 27.2, X + 34, Z + 33], y: 0.03, mat: 'stucco' },
      { t: 'mx_pyramid', c: [X + 19.2, Z + 42.6], base: 9, top: 5, h: 6.6, tiers: 3, stairs: 'n', steps: 30, stairW: 3.6, shrine: { w: 8, d: 8, h: 3.6, door: 'n', god: q.god } },
      { t: 'mx_dress', items: [['brazier', X + 15.2, Z + 32.2], ['brazier', X + 22.8, Z + 32.2], ['flowers', X + 19, Z + 31.4, 0.4]] },
      { t: 'mx_people', people: P },
    ];
  })));
  // (what lies far from the visitor is cut into compact plans shown only within their `near` of him, so that its meshes are neither drawn nor counted from the other side of the island)
  // the night's fires and the lit doors, one mesh of the additive halo material (nightlight.js)
  plans.push(base('tenochtitlan-night', [{ t: 'tn_halo', lights: lights() }]));
  plans.push(...near('tenochtitlan-yards', yards().map((y) => ({ t: 'huerto', ...y })), 100, 170));
  // the farmers' houses on the chinampas, with their granaries, maguey and nopal
  plans.push(...sectors('tenochtitlan-chinampa-houses', chinampaHouses().map((h) => ({ t: 'chinampa_house', ...h, y: ground.height(h.c[0], h.c[1]) })), 8, 270));
  // the channels of the chinampas: tule in the water, canoes tied at the plots with the farmers' loads, fishers, the plots' own people
  {
    const rp = ((q) => () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296))(1523), E = [], tule = [], W = LEVEL.water;
    for (let i = 0; i < 260; i++) {
      const a = rp() * Math.PI * 2, r = ISLAND + 1 + rp() * 16, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (!inLake(x, z) || Math.hypot(x, z) > RADIUS - 40 || (x < 0 && Math.abs(z) < 14)) continue;
      tule.push([x, z, 0.8 + rp() * 0.6, W]);
    }
    for (let i = 0; i < 170; i++) {                                                                // in the ditches between the plots (x = 14 k)
      const k = Math.floor(rp() * 48) - 24, x = k * 14, z = (rp() - 0.5) * 2 * 320;
      if (Math.hypot(x, z) < 303 || Math.hypot(x, z) > 330 || ground.height(x, z) > W - 0.2 || (x < 0 && Math.abs(z) < 16)) continue;
      tule.push([x + (rp() - 0.5) * 0.5, z, 0.5 + rp() * 0.4, W]);
    }
    E.push({ t: 'tule_beds', at: tule });
    for (let i = 0; i < 26; i++) {
      const k = Math.floor(rp() * 48) - 24, x = k * 14, z = (rp() - 0.5) * 2 * 300, r = Math.hypot(x, z);
      if (r < 306 || r > 328 || ground.height(x, z) > W - 0.3 || (x < 0 && Math.abs(z) < 18)) continue;
      E.push({ t: 'fisher_canoe', at: [x, z], dir: [0, 1], len: 4.6 + rp() * 0.8, y: W, seed: Math.floor(rp() * 1e6), fisher: i % 3 ? 'fisher' : 'farmer', cargo: i % 2 ? 'maize' : undefined });
    }
    plans.push(...sectors('tenochtitlan-waters', E, 8, 270));
  }
  // the lake round the island out to its shore by the disc's edge, the channels between the chinampas, the
  // canals' mouths (the canals within the island are the precinct's: plan.js)
  const lake = (x, z) => inLake(x, z) && inLakeWater(x, z, ground.height(x, z));
  plans.push({ ...base('tenochtitlan-lake', [
    { t: 'water_cells', rect: [-RADIUS, -RADIUS, RADIUS, RADIUS], y: LEVEL.water, cell: 2, inside: lake },
    { t: 'water_cells', rect: [-ISLAND, -ISLAND, ISLAND, ISLAND], y: LEVEL.water, cell: 0.8, inside: (x, z) => Math.hypot(x, z) > 299 && !lake(x, z) && inLakeWater(x, z, ground.height(x, z)) },
  ]), style: 'ming' });
  return [...plans, ...precinct(), ...sculptPlans()];
}
