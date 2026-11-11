// The calpulli round the precinct (docs/settlements/tenochtitlan.md §5, §13): house compounds of plastered adobe on low stone platforms
// round their patios, their rooms furnished; the farmers' houses of wattle and thatch on the chinampas.
import { RADIUS, LEVEL, ISLAND, houses, yards, houseGate, houseTrade, chinampaHouses, inLake, inLakeWater } from './layout.js';
import { ground } from './ground.js';
const base = (id, elements) => ({ id, style: 'aztec', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-60, 0], facing: 'e' } });
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
  return plans;
}
