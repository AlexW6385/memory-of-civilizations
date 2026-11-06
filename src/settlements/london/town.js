import { lodTiles } from '../lod.js';
// The terraces of Westminster and Lambeth (docs/settlements/london.md §5); the traffic of about 1870 (§5a): hansom
// cabs and knifeboard omnibuses on Westminster Bridge, in Bridge Street and Parliament Street, gas lamps along them;
// on the Thames the penny steamers, one at the floating pier by the bridge, and the coal lighters.
import { RADIUS, GROUND, RIVER, BRIDGE, lots, bank, inLot } from './layout.js';
import { ridersOf } from '../../styles/victorian/street.js';
const base = (id, elements, style = 'victorian') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 'e' } });
const W = Math.PI / 2, E = -Math.PI / 2, N = 0, S = Math.PI;

function traffic() {
  const L = [], deck = GROUND + 0.4, zw = BRIDGE.z + 2.4, ze = BRIDGE.z - 2.4;          // keep to the left: westbound on the south half
  const veh = (t, x, z, y, rot, seed, extra = {}) => { if (!inLot(x, z, 3)) L.push({ t, at: [x, z], y, rot, seed, ...extra }); };
  // on the bridge (its east half clear of the view from the arrival)
  veh('hansom_cab', 140, zw, deck, W, 11); veh('omnibus', 166, zw, deck, W, 12, { mat: 'car_cream', board: 'cloth_red' });
  veh('hansom_cab', 152, ze, deck, E, 13); veh('omnibus', 240, ze, deck, E, 14, { mat: 'paint_cab_yellow', board: 'cloth_green' }); veh('hansom_cab', 236, zw, deck, W, 15);
  // Bridge Street, between the Clock Tower and the square, and Parliament Street up the square's east side
  veh('hansom_cab', 86, zw, GROUND, W, 16); veh('omnibus', 70, ze, GROUND, E, 17, { mat: 'car_blue', board: 'cloth_white' }); veh('hansom_cab', 54, ze, GROUND, E, 18);
  veh('hansom_cab', 47, -195, GROUND, N, 19); veh('hansom_cab', 51, -205, GROUND, S, 20);
  // the gas lamps along the kerbs
  for (let x = 50; x <= 104; x += 18) for (const z of [BRIDGE.z - 6.5, BRIDGE.z + 6.5]) if (!inLot(x, z, 1)) L.push({ t: 'gas_lamp', at: [x, z], y: GROUND });
  for (let z = -210; z <= -180; z += 15) if (!inLot(43, z, 1)) L.push({ t: 'gas_lamp', at: [43, z], y: GROUND });
  // the river: the floating pier on the Westminster side north of the bridge with a steamer alongside; another steamer
  // coming down; lighters moored off Lambeth and one working across
  const pz = -219, bx = bank(pz)[0];
  L.push({ t: 'steamboat_pier', x0: bx + 4, x1: bx + 9, z0: pz - 13, z1: pz + 13, y: RIVER.level, bankX: bx - 0.4, bankY: GROUND + 0.95 });
  L.push({ t: 'paddle_steamer', at: [bx + 11.8, pz - 2], y: RIVER.level, rot: N, seed: 21, ring: 'cloth_red' });
  L.push({ t: 'paddle_steamer', at: [188, 40], y: RIVER.level, rot: S + 0.08, seed: 22, ring: 'cloth_green' });
  for (const [z, k] of [[-46, 0], [-30, 1]]) L.push({ t: 'lighter', at: [bank(z)[1] - 6.5 - k * 4.2, z], y: RIVER.level, rot: N, seed: 23 + k, load: k ? 'sacks' : 'coal' });
  L.push({ t: 'lighter', at: [176, -80], y: RIVER.level, rot: N + 0.25, seed: 26 });
  // the horses, drivers, conductors and passengers in a plan of the life style (instanced with the town's figures)
  for (const e of L) e.riders = false;
  return [base('london-traffic', L), base('london-traffic-life', L.flatMap(ridersOf), 'life')];
}
export async function houses() {
  const all = lots(), plans = [];
  plans.push(...lodTiles('london-terraces', 'victorian', all.map((l) => ({ t: 'terrace_house', ...l })), { R: RADIUS }));
  return [...plans, ...traffic()];
}
