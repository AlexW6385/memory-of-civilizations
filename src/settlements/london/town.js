// The terraces of Westminster and Lambeth (docs/settlements/london.md §5); the traffic of about 1870 (§5a): hansom
// cabs and knifeboard omnibuses on Westminster Bridge, in Bridge Street and Parliament Street, gas lamps along them;
// on the Thames the penny steamers, one at the floating pier by the bridge, and the coal lighters.
import { RADIUS, GROUND, RIVER, BRIDGE, SQUARE, STREET_W, lots, bank, inLot, blocked, streetsZ, crossX } from './layout.js';
import { ridersOf } from '../../styles/victorian/street.js';
const base = (id, elements, style = 'victorian') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -180], facing: 'e' } });
const W = Math.PI / 2, E = -Math.PI / 2, N = 0, S = Math.PI;

function traffic() {
  const L = [], deck = GROUND + 0.4, zw = BRIDGE.z + 2.4, ze = BRIDGE.z - 2.4;          // keep to the left: westbound on the south half
  const veh = (t, x, z, y, rot, seed, extra = {}) => { if (!inLot(x, z, 3)) L.push({ t, at: [x, z], y, rot, seed, ...extra }); };
  // on the bridge (its east half clear of the view from the arrival)
  veh('hansom_cab', 140, zw, deck, W, 11); veh('omnibus', 166, zw, deck, W, 12, { mat: 'car_cream', board: 'cloth_red' });
  veh('hansom_cab', 152, ze, deck, E, 13); veh('omnibus', 240, ze, deck, E, 14, { mat: 'paint_cab_yellow', board: 'cloth_green' }); veh('hansom_cab', 236, zw, deck, W, 15);
  veh('hansom_cab', 123, ze, deck, E, 81); veh('omnibus', 112, zw, deck, W, 82, { mat: 'paint_cab_yellow', board: 'cloth_red' }); veh('hansom_cab', 187, zw, deck, W, 83);
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
  // the watermen's stairs on both embankments, wherries waiting at their feet; Thames sailing barges, one under way and one moored off Lambeth
  for (const [z, k] of [[-196, 0], [-130, 1], [40, 1]]) { const bx = bank(z)[k], dir = k ? -1 : 1, x0 = bx + (k ? 0.6 : -0.6), xl = x0 + dir * 5.5;
    L.push({ t: 'river_stairs', x: x0, z, dir, y: GROUND, water: RIVER.level });
    L.push({ t: 'wherry', at: [xl + dir * 3.4, z + 0.4], y: RIVER.level, rot: N + 0.1 * dir, seed: 30 + Math.abs(z) % 7 }); if (!k) L.push({ t: 'wherry', at: [xl + dir * 6.5, z - 3.2], y: RIVER.level, rot: S - 0.3, seed: 37 }); }
  L.push({ t: 'sailing_barge', at: [(bank(-20)[0] + bank(-20)[1]) / 2 - 8, -20], y: RIVER.level, rot: S + 0.06, seed: 41, sail: 'cloth_ochre' });
  L.push({ t: 'sailing_barge', at: [bank(120)[1] - 7.5, 120], y: RIVER.level, rot: N + 0.04, seed: 42, sail: 'hide_brown' });
  // the horses, drivers, conductors and passengers in a plan of the life style (instanced with the town's figures)
  for (const e of L) e.riders = false;
  return [base('london-traffic', L), base('london-traffic-life', L.flatMap(ridersOf), 'life')];
}
/** The river's people (§5d): mudlarks on the landings of the stairs, an angler on the parapet, a waterman waiting at the head of the stairs. */
function riverFolk() {
  const L = [], fig = (at, y, rot, o) => L.push({ t: 'figure', at, y, rot, h: 1.6, seed: Math.floor(at[0] * 31 + at[1] * 17), skin: 'skin_light', feet: 'bare', ...o });
  for (const [z, k] of [[-196, 0], [-130, 1], [40, 1]]) {
    const bx = bank(z)[k], dir = k ? -1 : 1, x0 = bx + (k ? 0.6 : -0.6), xl = x0 + dir * 5.5, face = dir > 0 ? -Math.PI / 2 : Math.PI / 2, lv = RIVER.level + 0.25;
    fig([xl + dir * 0.9, z + 0.7], lv, face, { h: 1.15, dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', hatMat: 'cloth_grey', pose: 'squat' });
    fig([xl + dir * 1.3, z - 0.6], lv, face + 0.6, { h: 1.05, dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'none', pose: 'sit_low' });
    fig([x0 - dir * 1.2, z + 2.4], GROUND, face, { dress: 'trousers', cloth: 'cloth_blue', cloth2: 'cloth_black', hat: 'cap', hatMat: 'cloth_red', over: 'apron', feet: 'shod' });
    fig([x0 - dir * 0.9, z - 4.5], GROUND, face, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'cloth_brown', carry: 'pole', len: 2.6, feet: 'shod', pose: 'stand' });
  }
  return L;
}
/** The street sellers and passers-by about 1870 (§5b): costermongers with their barrows and a donkey-cart at the kerbs of
 *  Bridge Street and of the road from the bridge into Lambeth, coster women with the round head-basket, gentlemen and
 *  ladies, a crossing sweeper, a policeman. */
function streetFolk() {
  let sd = 1871; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
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
  // a coal cart and a brewer's dray drawn up at the kerbs of Bridge Street, a barrow of the costers on the bridge's Lambeth end
  if (!inLot(80, BRIDGE.z - 5.4, 3)) L.push({ t: 'cart', at: [80, BRIDGE.z - 5.4], y: GROUND, rot: W, seed: 51, kind: 'two', load: 'sacks', beast: 'horse' });
  if (!inLot(98, BRIDGE.z + 5.0, 3)) L.push({ t: 'cart', at: [96, BRIDGE.z + 5.0], y: GROUND + 0.4, rot: E, seed: 52, kind: 'two', load: 'baskets', beast: 'horse' });
  L.push({ t: 'handcart', at: [226, BRIDGE.z - 5.2], y: GROUND + 0.4, rot: N, seed: 53, load: 'baskets' });
  // the coster women with the round willow sieve on the head, walking
  for (const [x, z, rot] of [[76, BRIDGE.z + 5.0, W], [290, BRIDGE.z - 5.2, E]]) fig([x, z], rot, { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'none', over: 'shawl', carry: 'basket' });
  // gentlemen in black with their hats, ladies, a clerk hurrying, along both pavements of Bridge Street and Parliament Street
  for (const [x, z, rot] of [[56, BRIDGE.z + 5.8, E], [70, BRIDGE.z - 5.8, W], [84, BRIDGE.z - 5.4, E], [100, BRIDGE.z + 5.6, W], [44.6, -200, N], [44.8, -188, S], [270, BRIDGE.z + 5.6, W]]) {
    const lady = rand() < 0.35;
    fig([x, z], rot, lady ? { dress: 'robe', cloth: rand() < 0.5 ? 'cloth_maroon' : 'cloth_green', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape' }
      : { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', beard: rand() < 0.5 });
  }
  // the bridge's pavements (the deck is 0.4 m above the street): a ballad-seller, two strollers by the parapet looking at the river, a flower girl, a pair of clerks
  { const dk = GROUND + 0.4, on = (x, z, rot, o) => L.push({ t: 'figure', at: [x, z], y: dk, rot, h: 1.6 + rand() * 0.12, seed: Math.floor(rand() * 1e9), skin: 'skin_light', feet: 'shod', ...o });
    on(176, BRIDGE.z + 6.3, N, { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: 'stand' });
    on(177.1, BRIDGE.z + 6.4, N, { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape', pose: 'talk' });
    on(158, BRIDGE.z - 6.3, S, { h: 1.5, dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'none', over: 'shawl', carry: 'basket', pose: 'stand' });
    on(146, BRIDGE.z - 5.4, E, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey', over: 'collar', carry: 'sack', pose: 'stand' });
    on(131, BRIDGE.z + 5.6, W, { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'collar', pose: 'talk' });
    on(130.1, BRIDGE.z + 5.7, W, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: 'stand' });
    L.push({ t: 'animal', kind: 'dog', at: [143, BRIDGE.z - 5.8], y: dk, rot: 1.2, seed: 77 }); }
  // the crossing sweeper with his broom at the corner of Parliament Street, the policeman on his beat
  fig([46, BRIDGE.z - 5.2], E, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey', carry: 'staff', pose: 'staff', len: 1.5, h: 1.45 });
  fig([108, BRIDGE.z + 5.6], W, { dress: 'trousers', cloth: 'prussian_blue', cloth2: 'prussian_blue', hat: 'brim', hatMat: 'prussian_blue', over: 'belt' });
  // Parliament Square: readers on the benches, nursemaids with prams' children, children round Punch and Judy's booth, the organ-grinder, sandwich-board men, loungers by the statue
  const suit = (at, rot, o = {}) => fig(at, rot, { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', beard: rand() < 0.5, ...o });
  suit([-22.3, -178.0], S, { pose: 'sit' }); suit([-2, -182.0], N, { pose: 'sit' });
  fig([-21.6, -182.0], N, { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape', pose: 'sit' });
  for (let i = 0; i < 6; i++) fig([6.2 + i * 0.75 - 2, -172.2 + (i % 2) * 0.7], N, { h: 1.0 + (i % 3) * 0.12, dress: i % 2 ? 'robe' : 'trousers', cloth: ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green'][i % 4], cloth2: 'cloth_brown', hat: i % 2 ? 'none' : 'cap', hatMat: 'cloth_grey' });
  fig([8, -170.8], N, { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap', hatMat: 'cloth_white', over: 'shawl' });
  fig([-24.6, -175.2], E, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'cloth_black', over: 'collar', carry: 'none', pose: 'stand' });
  for (const [x, z, rot] of [[-5, -179.2, W], [-14, -180.8, E], [30.5, -186.5, S], [14, -187.5, N], [-38, -181, E], [3, -188, S]]) {
    const lady = rand() < 0.5;
    fig([x, z], rot, lady ? { dress: 'robe', cloth: rand() < 0.5 ? 'cloth_indigo' : 'cloth_maroon', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape', pose: rand() < 0.4 ? 'talk' : 'stand' } : { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  for (const [x, z, rot] of [[-18, -177.4, E], [-18.9, -177.4, E]]) fig([x, z], rot, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_brown', carry: 'staff', pose: 'staff', len: 1.9, over: 'apron', staffMat: 'timber' });
  // the pavements of the streets about the square: clerks, labourers, women with baskets, children, a dog at heel
  for (const zc of streetsZ()) {
    const main = Math.abs(zc - BRIDGE.z) < 1, h = main ? 8 : STREET_W / 2, pw = main ? 2.6 : 1.9;
    for (let x = -240 + rand() * 12; x < 240; x += 11 + rand() * 13) {
      const side = rand() < 0.5 ? -1 : 1, z = zc + side * (h - pw * 0.55), k = rand();
      if (Math.hypot(x, z + 180) > 175 || blocked(x, z, -1) || inLot(x, z, 0.4) || crossX().some((c) => Math.abs(c - x) < STREET_W / 2 + 0.8)) continue;
      const rot = rand() < 0.5 ? E : W;
      if (k < 0.26) fig([x, z], rot, { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'collar', pose: rand() < 0.3 ? 'talk' : 'stand' });
      else if (k < 0.5) fig([x, z], rot, { dress: 'trousers', cloth: rand() < 0.5 ? 'cloth_brown' : 'cloth_indigo', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_brown', over: 'belt', carry: rand() < 0.3 ? 'sack' : 'none' });
      else if (k < 0.72) fig([x, z], rot, { dress: 'robe', cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_maroon', 'cloth_green']), cloth2: 'cloth_black', hat: rand() < 0.5 ? 'brim' : 'none', hatMat: 'cloth_black', over: 'shawl', carry: rand() < 0.6 ? 'basket' : 'none' });
      else if (k < 0.86) { fig([x, z], rot, { h: 1.0 + rand() * 0.25, dress: rand() < 0.5 ? 'robe' : 'trousers', cloth: pick(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_grey']), cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey' }); fig([x + 0.8, z], rot, { h: 0.95 + rand() * 0.25, dress: 'robe', cloth: pick(['cloth_green', 'cloth_red']), cloth2: 'cloth_brown', hat: 'none' }); }
      else L.push({ t: 'animal', kind: 'dog', at: [x, z], y: GROUND, rot: rot + 1.57, seed: Math.floor(rand() * 1e6) });
    }
  }
  for (const [i, [x, z, rot]] of SQ_STALLS.entries()) fig([x + 0.3, z + (rot ? 0.9 : -0.9)], rot ? 0 : Math.PI, { h: 1.6, dress: i % 2 ? 'robe' : 'trousers', cloth: ['cloth_brown', 'cloth_indigo', 'cloth_grey'][i % 3], cloth2: 'cloth_black', hat: i % 2 ? 'none' : 'cap', hatMat: 'cloth_brown', over: i % 2 ? 'shawl' : 'apron', pose: 'stand' });
  // the cabmen of the rank, each by his cab's horse
  for (const x of [-48, -41, -34, -27]) fig([x + 0.4, -149.4], S, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: rand() < 0.5 ? 'talk' : 'stand' });
  return L;
}

/** The furniture of the streets (§6): gas lamps at the corners and along Bridge Street, pillar boxes and bollards at some corners, a drinking
 *  fountain on Bridge Street, trestle stalls of the street sellers at the kerbs of the busy streets. Within 280 m of the arrival. */
function furniture() {
  let sd = 1872; const rand = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296), L = [];
  const ok = (x, z) => Math.hypot(x, z) < 280 && !blocked(x, z, -1) && !inLot(x, z, 0.7);
  const add = (t, x, z, o = {}) => { if (ok(x, z)) L.push({ t, at: [x, z], y: GROUND, ...o }); };
  for (const zc of streetsZ()) for (const cx of crossX()) {
    const main = Math.abs(zc - BRIDGE.z) < 1, h = main ? 8 : STREET_W / 2, pw = main ? 2.6 : 1.9;
    add('gas_lamp', cx - 5.2, zc - h + pw - 0.35); add('gas_lamp', cx + 5.2, zc + h - pw + 0.35);
    if (rand() < 0.3) add('pillar_box', cx + 5.2, zc - h + pw - 0.7); else if (rand() < 0.25) add('bollard', cx - 5.2, zc + h - pw + 0.7);
  }
  // along each street between the corners, a lamp every ~42 m on alternate sides
  for (const zc of streetsZ()) { const main = Math.abs(zc - BRIDGE.z) < 1, h = main ? 8 : STREET_W / 2, pw = main ? 2.6 : 1.9; for (let x = -240, k = 0; x < 240; x += 42, k++) add('gas_lamp', x + (zc * 0.37 % 10), zc + (k % 2 ? h - pw + 0.35 : -h + pw - 0.35)); }
  add('drinking_fountain', 70, BRIDGE.z + 6.6); add('drinking_fountain', -30, -150.5);
  // the coster's trestle stalls along Bridge Street's kerbs and the busy streets nearest it
  for (const zc of streetsZ()) { if (Math.abs(zc - BRIDGE.z) > 62) continue; for (let x = -200 + rand() * 30; x < 200; x += 55 + rand() * 40) add('trestle_stall', x, zc + (rand() < 0.5 ? -1 : 1) * (Math.abs(zc - BRIDGE.z) < 1 ? 5.6 : 2.0), { rot: rand() < 0.5 ? 0 : Math.PI, goods: rand() < 0.5 ? 'wicker' : 'cloth_red' }); }
  return [base('london-furniture', L)];
}
const SQ_STALLS = [[-30, -185, 0, 'wicker'], [-2, -174.8, Math.PI, 'cloth_red'], [14, -185, 0, 'wicker'], [-38, -175, Math.PI, 'hide_brown'], [26, -172.5, Math.PI, 'cloth_green'], [3, -185, 0, 'cloth_red']];
/** Parliament Square (§5c): lawns, walks, Canning's statue, beds, benches; the cab rank, the barrel organ and Punch and Judy at its edges. */
function square() {
  const wz = -180, wx = -10, st = [22, wz], L = [];
  L.push({ t: 'parliament_square', rect: SQUARE, y: GROUND, statue: st, walkZ: wz, walkX: wx });
  L.push({ t: 'barrel_organ', at: [-26, wz + 3.4], y: GROUND, rot: 0.4 });
  L.push({ t: 'punch_booth', at: [8, wz + 4.2], y: GROUND, rot: Math.PI });
  // the costers' trestle stalls along the square's walks (a seller behind each: streetFolk)
  for (const [x, z, rot, goods] of SQ_STALLS) L.push({ t: 'trestle_stall', at: [x, z], y: GROUND, rot, goods });
  for (const [i, x] of [-48, -41, -34, -27].entries()) L.push({ t: 'hansom_cab', at: [x, -148.2], y: GROUND, rot: W, seed: 60 + i, riders: false });
  for (const [x, z] of [[-45, -190], [-45, -172], [30, -196], [30, -164], [-10, -199], [-10, -161], [8, -174], [-30, -186]]) L.push({ t: 'gas_lamp', at: [x, z], y: GROUND });
  return L;
}
/** Which buildings stand open (DESIGN §4.3): round the arrival on the bridge (ARRIVAL) the two pubs, nine shops of different trades and five
 *  houses nearest it, within 120 m on the Westminster side of the river and in Lambeth (§5a); and, along Bridge Street toward the square, a pub,
 *  three shops and two houses (the way on to Parliament Square). */
const ARRIVAL = [200, -170];
function openSet(all) {
  const out = new Set(), cx = (l) => (l.rect[0] + l.rect[2]) / 2, cz = (l) => (l.rect[1] + l.rect[3]) / 2;
  const d = (l, p) => Math.hypot(cx(l) - p[0], cz(l) - p[1]), ok = (l) => l.rect[3] - l.rect[1] >= 8 && l.rect[2] - l.rect[0] >= 5;
  const near = (p, f, n, per = 99, rmax = 1e9) => { const seen = {}; for (const l of all.filter((q) => ok(q) && f(q) && !out.has(q) && d(q, p) < rmax).sort((a, b) => d(a, p) - d(b, p))) { const k = l.trade ?? 'x'; if ((seen[k] = (seen[k] ?? 0) + 1) > per) continue; out.add(l); if (--n === 0) break; } };
  near(ARRIVAL, (l) => l.pub, 2, 99, 118); near(ARRIVAL, (l) => l.shop, 9, 1, 118); near(ARRIVAL, (l) => !l.shop && !l.pub, 5, 99, 118);
  const A = [60, BRIDGE.z];
  near(A, (l) => l.pub, 1); near(A, (l) => l.shop, 3, 1);
  near([30, BRIDGE.z - 40], (l) => !l.shop && !l.pub, 2);
  return out;
}
/** The terraces cut into TILE-metre tiles, each built in full (near) and simple (far) like ../lod.js lodTiles, but larger: a plan costs one mesh
 *  per material, so fewer, larger tiles keep the mesh count down (the geometry budget); `near` grows with the tile so the same ground shows in full. */
const TILE = 160, NEAR = 220 + (TILE - 100) * 0.6;
function terraceTiles(id, elements) {
  const tiles = new Map();
  for (const e of elements) {
    const x = (e.rect[0] + e.rect[2]) / 2, z = (e.rect[1] + e.rect[3]) / 2, k = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), b = { style: 'victorian', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, center: [(i + 0.5) * TILE, (j + 0.5) * TILE] };
    plans.push({ ...b, id: `${id}-${k}`, near: NEAR, elements: list });
    plans.push({ ...b, id: `${id}-${k}-far`, far: NEAR, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
export async function houses() {
  const all = lots(), plans = [], open = openSet(all);
  plans.push(...terraceTiles('london-terraces', all.map((l) => ({ t: l.pub ? 'pub' : l.shop ? 'shop_house' : 'terrace_house', ...l, ...(open.has(l) ? { open: true } : {}) }))));
  const sq = square();
  return [...plans, base('london-square', sq), base('london-square-life', sq.flatMap(ridersOf), 'life'), ...traffic(), ...furniture(), base('london-street-folk', streetFolk(), 'life'), base('london-river-folk', riverFolk(), 'life')];
}
