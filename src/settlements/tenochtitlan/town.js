// The calpulli round the precinct (docs/settlements/tenochtitlan.md §5, §13): house compounds of plastered adobe on low stone platforms
// round their patios, their rooms furnished; the farmers' houses of wattle and thatch on the chinampas.
import { RADIUS, LEVEL, ISLAND, PRECINCT, TM, houses, yards, houseGate, houseTrade, chinampaHouses, inLake, inLakeWater } from './layout.js';
import { ground } from './ground.js';
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
      else L.push({ t: 'chickens', kind: 'hen', at, y: Y, n: 2, rot: rand() * 6.28, seed: Math.floor(rand() * 1e6) });
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
  // the braziers at the stair's foot and the offerings left about them and at the foot of the momoztli
  const D = [['brazier', 35, -16.5], ['brazier', 35, 16.5], ['brazier', 35, -10], ['brazier', 35, 10]];
  for (const [x, z] of [[33, -14], [32.6, -17.5], [33, 14], [32.4, 17.8], [32, 9], [32, -9]]) D.push([rand() < 0.6 ? 'flowers' : 'roses', x, z, rand() * 6.28]);
  for (const [x, z] of [[31, 12], [31, -12], [36.5, -13], [36.5, 13]]) D.push(['paper', x, z, rand() * 6.28]);
  E.push({ t: 'mx_dress', items: D });
  return [base('tenochtitlan-precinct-floor', [...E, ...M, { t: 'mx_people', people: P }]), { ...base('tenochtitlan-precinct-goods', L), style: 'life' }];
}

export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`tenochtitlan-houses-${i / 150}`, all.slice(i, i + 150).flatMap((h) => {
    const c = [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2], r = Math.hypot(c[0], c[1]), lod = r < 170 ? 2 : r < 250 ? 1 : 0;
    return [{ t: 'calli', ...h }, { t: 'calli_front', rect: h.rect, seed: h.seed, gate: houseGate(h), trade: houseTrade(h), lod }];
  })));
  plans.push(base('tenochtitlan-yards', yards().map((y) => ({ t: 'huerto', ...y }))));
  // the farmers' houses on the chinampas, with their granaries, maguey and nopal
  plans.push(base('tenochtitlan-chinampa-houses', chinampaHouses().map((h) => ({ t: 'chinampa_house', ...h, y: ground.height(h.c[0], h.c[1]) }))));
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
    plans.push(base('tenochtitlan-waters', E));
  }
  // the lake round the island out to its shore by the disc's edge, the channels between the chinampas, the
  // canals' mouths (the canals within the island are the precinct's: plan.js)
  const lake = (x, z) => inLake(x, z) && inLakeWater(x, z, ground.height(x, z));
  plans.push({ ...base('tenochtitlan-lake', [
    { t: 'water_cells', rect: [-RADIUS, -RADIUS, RADIUS, RADIUS], y: LEVEL.water, cell: 2, inside: lake },
    { t: 'water_cells', rect: [-ISLAND, -ISLAND, ISLAND, ISLAND], y: LEVEL.water, cell: 0.8, inside: (x, z) => Math.hypot(x, z) > 299 && !lake(x, z) && inLakeWater(x, z, ground.height(x, z)) },
  ]), style: 'ming' });
  return [...plans, ...precinct()];
}
