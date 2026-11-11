import { lodTiles, openLots } from '../lod.js';
// The terraces of Westminster and Lambeth (docs/settlements/london.md §5); the traffic of about 1870 (§5a): hansom
// cabs and knifeboard omnibuses on Westminster Bridge, in Bridge Street and Parliament Street, gas lamps along them;
// on the Thames the penny steamers, one at the floating pier by the bridge, and the coal lighters.
import { RADIUS, GROUND, RIVER, BRIDGE, lots, bank, inLot, blocked, streetsZ, crossX } from './layout.js';
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
/** The street sellers and passers-by about 1870 (§5b): costermongers with their barrows and a donkey-cart at the kerbs of
 *  Bridge Street and of the road from the bridge into Lambeth, coster women with the round head-basket, gentlemen and
 *  ladies, a crossing sweeper, a policeman. */
function streetFolk() {
  let sd = 1871; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296), L = [];
  const fig = (at, rot, o) => { if (!inLot(at[0], at[1], 0.6)) L.push({ t: 'figure', at, y: GROUND, rot, h: 1.6 + rand() * 0.15, seed: Math.floor(rand() * 1e9), skin: 'skin_light', feet: 'shod', ...o }); };
  const coster = (at, rot) => fig(at, rot, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'cap', hatMat: rand() < 0.5 ? 'cloth_red' : 'cloth_brown', over: 'collar', pose: rand() < 0.5 ? 'talk' : 'stand' });
  const kerbs = [[62, BRIDGE.z - 5.6, W], [92, BRIDGE.z + 5.6, E], [280, BRIDGE.z - 5.6, W], [300, BRIDGE.z + 5.6, E], [318, BRIDGE.z - 5.6, W]];
  for (const [i, [x, z, rot]] of kerbs.entries()) {
    if (inLot(x, z, 2)) continue;
    const side = z < BRIDGE.z ? -1 : 1;
    if (i === 2) L.push({ t: 'cart', at: [x, z], y: GROUND, rot: rot + Math.PI, seed: 40 + i, kind: 'two', load: 'sacks', beast: 'donkey' });
    else L.push({ t: 'handcart', at: [x, z], y: GROUND, rot: rot + Math.PI, seed: 40 + i, load: 'baskets' });
    coster([x + 1.4, z + side * 0.9], side < 0 ? N : S);
    if (rand() < 0.7) fig([x - 1.0, z - side * 0.9], side < 0 ? S : N, { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_white', over: 'shawl', carry: rand() < 0.5 ? 'basket' : 'none' });
  }
  // the coster women with the round willow sieve on the head, walking
  for (const [x, z, rot] of [[76, BRIDGE.z + 5.0, W], [290, BRIDGE.z - 5.2, E]]) fig([x, z], rot, { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'none', over: 'shawl', carry: 'basket' });
  // gentlemen in black with their hats, ladies, a clerk hurrying, along both pavements of Bridge Street and Parliament Street
  for (const [x, z, rot] of [[56, BRIDGE.z + 5.8, E], [70, BRIDGE.z - 5.8, W], [84, BRIDGE.z - 5.4, E], [100, BRIDGE.z + 5.6, W], [44.6, -200, N], [44.8, -188, S], [270, BRIDGE.z + 5.6, W]]) {
    const lady = rand() < 0.35;
    fig([x, z], rot, lady ? { dress: 'robe', cloth: rand() < 0.5 ? 'cloth_maroon' : 'cloth_green', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape' }
      : { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', beard: rand() < 0.5 });
  }
  // the crossing sweeper with his broom at the corner of Parliament Street, the policeman on his beat
  fig([46, BRIDGE.z - 5.2], E, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey', carry: 'staff', pose: 'staff', len: 1.5, h: 1.45 });
  fig([108, BRIDGE.z + 5.6], W, { dress: 'trousers', cloth: 'prussian_blue', cloth2: 'prussian_blue', hat: 'brim', hatMat: 'prussian_blue', over: 'belt' });
  return L;
}

/** The furniture of the streets (§6): gas lamps at the corners and along Bridge Street, pillar boxes and bollards at some corners, a drinking
 *  fountain on Bridge Street, trestle stalls of the street sellers at the kerbs of the busy streets. Within 280 m of the arrival. */
function furniture() {
  let sd = 1872; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296), L = [];
  const ok = (x, z) => Math.hypot(x, z) < 280 && !blocked(x, z, -1) && !inLot(x, z, 0.7);
  const add = (t, x, z, o = {}) => { if (ok(x, z)) L.push({ t, at: [x, z], y: GROUND, ...o }); };
  for (const zc of streetsZ()) for (const cx of crossX()) {
    const main = Math.abs(zc - BRIDGE.z) < 1, h = main ? 8 : 3.5;
    add('gas_lamp', cx - 4.2, zc - h + 1.1); add('gas_lamp', cx + 4.2, zc + h - 1.1);
    if (rand() < 0.3) add('pillar_box', cx + 4.2, zc - h + 1.2); else if (rand() < 0.25) add('bollard', cx - 4.2, zc + h - 1.2);
  }
  // along each street between the corners, a lamp every ~42 m on alternate sides
  for (const zc of streetsZ()) { const main = Math.abs(zc - BRIDGE.z) < 1, h = main ? 8 : 3.5; for (let x = -240, k = 0; x < 240; x += 42, k++) add('gas_lamp', x + (zc * 0.37 % 10), zc + (k % 2 ? h - 1.1 : -h + 1.1)); }
  add('drinking_fountain', 70, BRIDGE.z + 6.6); add('drinking_fountain', -30, -150.5);
  // the coster's trestle stalls along Bridge Street's kerbs and the busy streets nearest it
  for (const zc of streetsZ()) { if (Math.abs(zc - BRIDGE.z) > 62) continue; for (let x = -200 + rand() * 30; x < 200; x += 55 + rand() * 40) add('trestle_stall', x, zc + (rand() < 0.5 ? -1 : 1) * (Math.abs(zc - BRIDGE.z) < 1 ? 5.8 : 2.4), { rot: rand() < 0.5 ? 0 : Math.PI, goods: rand() < 0.5 ? 'wicker' : 'cloth_red' }); }
  return [base('london-furniture', L)];
}
export async function houses() {
  // the two houses nearest the Lambeth end of the bridge stand open: hall, front parlour and back room (§5a)
  const all = lots(), plans = [], open = openLots(all, [272, BRIDGE.z + 14], 2);
  plans.push(...lodTiles('london-terraces', 'victorian', all.map((l) => ({ t: l.pub ? 'pub' : l.shop ? 'shop_house' : 'terrace_house', ...l, ...(open.has(l) ? { open: true } : {}) })), { R: RADIUS }));
  return [...plans, ...traffic(), ...furniture(), base('london-street-folk', streetFolk(), 'life')];
}
