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
  // the lake round the island out to its shore by the disc's edge, the channels between the chinampas, the
  // canals' mouths (the canals within the island are the precinct's: plan.js)
  const lake = (x, z) => inLake(x, z) && inLakeWater(x, z, ground.height(x, z));
  plans.push({ ...base('tenochtitlan-lake', [
    { t: 'water_cells', rect: [-RADIUS, -RADIUS, RADIUS, RADIUS], y: LEVEL.water, cell: 2, inside: lake },
    { t: 'water_cells', rect: [-ISLAND, -ISLAND, ISLAND, ISLAND], y: LEVEL.water, cell: 0.8, inside: (x, z) => Math.hypot(x, z) > 299 && !lake(x, z) && inLakeWater(x, z, ground.height(x, z)) },
  ]), style: 'ming' });
  return plans;
}
