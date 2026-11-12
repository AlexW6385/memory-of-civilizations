// The town of Karakorum (docs/settlements/mongol-karakorum.md §3, §8): the wall and its four gates, the courtyard houses and the mosques of the Saracen quarter, the
// bazaar on the main street, the temples, workshops, kilns and forges of the Cathayan quarter with the Great Hall, the Nestorian church; the gers on the open
// ground and the court's second camp; the markets at the gates; and the people and animals of all of it, as still figures
// (the walkers are in movers.js).
import {
  RADIUS, WALL, WALL_TH, WALL_H, GATES, GATE_W, MAIN, CROSS, PALACE, HALL, HALL_RECT, TREE, GREAT_HALL, KILNS, FORGES, TEMPLES, TEMPLES_NW, WORKSHOPS, MOSQUES, CHURCH,
  SECRETARIES, SHOPS, shopRect, WELLS, LOTS, CAMPS, PENS, OUTSIDE_WAGONS, COURT_GER, COURT_CART, HOUSEHOLD, STORES, height, inBuilt, inTown, inPalace, onStreet,
} from './layout.js';
import { campElements } from './camp.js';
import { frontFrame } from '../../styles/mongol/local.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, elements });

/** The fabric: wall, gates, houses, shops, halls. */
function fabric() {
  const E = [], r = rng(1254), U = 7.5;
  const [w0, n0, e0, s0] = WALL;
  const wall = (a, b, out) => E.push({ t: 'earth_wall', a, b, h: WALL_H, th: WALL_TH, out });
  wall([w0, n0], [-U, n0], -1); wall([U, n0], [e0, n0], -1);
  wall([w0, s0], [-U, s0], 1); wall([U, s0], [e0, s0], 1);
  wall([w0, n0], [w0, -U], -1); wall([w0, U], [w0, s0], -1);
  wall([e0, n0], [e0, -U], 1); wall([e0, U], [e0, s0], 1);
  E.push({ t: 'town_gate', c: GATES.n, along: 'x', inward: 1, w: GATE_W }, { t: 'town_gate', c: GATES.s, along: 'x', inward: -1, w: GATE_W });
  E.push({ t: 'town_gate', c: GATES.w, along: 'z', inward: 1, w: GATE_W }, { t: 'town_gate', c: GATES.e, along: 'z', inward: -1, w: GATE_W });
  for (const [x, z] of [[w0, n0], [e0, n0], [w0, s0], [e0, s0]]) E.push({ t: 'corner_tower', c: [x, z] });
  // the Saracen quarter: courtyard houses; the "large palaces" of the court secretaries; the mosques; the church at the far end
  for (const l of LOTS) if (l.kind === 'house') E.push({ t: 'mud_compound', rect: l.rect, gate: l.gate, seed: l.seed, floors: l.floors, dome: l.dome });
  for (const [i, q] of SECRETARIES.entries()) E.push({ t: 'mud_compound', rect: q, gate: i ? 'n' : 's', seed: 77 + i, floors: 2, dome: true });
  for (const [i, q] of MOSQUES.entries()) E.push({ t: 'mosque', rect: q, seed: i });
  E.push({ t: 'church', rect: CHURCH });
  for (const s of SHOPS) E.push({ t: 'shop_row', a: s.a, n: s.n, face: s.face, seed: s.seed, d: s.d });
  // the Cathayan quarter: the Great Hall, the idol temples, workshops with kilns and forges
  E.push({ t: 'great_hall', c: GREAT_HALL.c, y: GREAT_HALL.y });
  for (const q of TEMPLES) E.push({ t: 'tile_hall', rect: q, y: 0.7, nx: 3, H: 4.4, kind: 'xieshan', mat: r() < 0.5 ? 'tile_grey' : 'tile_green', altar: 'buddha' });
  for (const q of TEMPLES_NW) E.push({ t: 'tile_hall', rect: q, y: 0.7, nx: 3, H: 4.4, kind: 'xieshan', mat: 'tile_grey', altar: 'buddha' });
  WORKSHOPS.forEach((q, i) => E.push({ t: 'tile_hall', rect: q, y: 0.5, nx: 3, H: 3.8, kind: 'gable', mat: 'tile_grey', wallMat: 'brick_grey', altar: null, furnish: i % 3 === 2 ? 'smith' : 'potter', seed: 100 + i }));
  KILNS.forEach(([x, z], i) => E.push({ t: 'kiln', at: [x, z], r: 2.0 + (i % 2) * 0.25, yaw: i * 1.3 }));
  for (const q of FORGES) E.push({ t: 'forge', rect: q });
  [[100, 28, 106, 31], [124, 28, 130, 31], [116, 42, 122, 45], [60, 82, 66, 85]].forEach((q) => E.push({ t: 'tile_stack', rect: q, rows: 5 }));
  // the gers on the ground in the open lots of the Saracen quarter and in the north-west (the empty ground inside the wall [stated: survey]), some on wagons
  const ger = (c, rad, o = {}) => E.push({ t: 'ger', c, r: rad, y: 0, seed: Math.floor(r() * 1e6), door: Math.PI / 2, ...o });
  for (const l of LOTS) if (l.kind === 'open') {
    const [x0, z0, x1, z1] = l.rect, n = r() < 0.5 ? 1 : 2;
    for (let k = 0; k < n; k++) {
      const gr = 3.0 + r() * 0.5, cart = r() < 0.15;
      ger([x0 + 4.2 + k * 7.4, (z0 + z1) / 2 + (r() - 0.5) * 2], gr, { cart, open: !cart && k === 0 && r() < 0.6, rich: r() < 0.3, door: l.gate === 'n' ? -Math.PI / 2 : Math.PI / 2 });
    }
  }
  for (const [x, z] of [[-110, -90], [-100, -82], [-76, -88]]) ger([x, z], 3.2 + r() * 0.5, { rich: true, open: x === -100 });
  // the court's second camp outside the south wall
  E.push(...campElements(CAMPS.se, 4242, -1, 8, [1, 2, 4, 6]).E);
  // the pens at the gates' markets: horses north, sheep and goats west
  for (const q of PENS.n) E.push({ t: 'pen', rect: q, y: height((q[0] + q[2]) / 2, (q[1] + q[3]) / 2), gate: 's' });
  for (const q of PENS.w) E.push({ t: 'pen', rect: q, y: height((q[0] + q[2]) / 2, (q[1] + q[3]) / 2), gate: 'e' });
  // wagons at the south and east gates
  for (const [x, z] of OUTSIDE_WAGONS.s) E.push({ t: 'coffer_cart', at: [x, z], y: 0, yaw: 0.2 + r() * 0.4 });
  for (const [x, z] of OUTSIDE_WAGONS.e) E.push({ t: 'coffer_cart', at: [x, z], y: height(x, z), yaw: 1.4 + r() * 0.3 });
  return E;
}

export async function town() {
  const rand = rng(1254), P = [], T = [];
  const col = { blue: 'cloth_blue', red: 'cloth_red', green: 'cloth_green', ochre: 'cloth_ochre', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', grey: 'cloth_grey', indigo: 'cloth_indigo', maroon: 'cloth_maroon' };
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const skin = (m = 0.7) => (rand() < m ? 'skin_medium' : rand() < 0.5 ? 'skin_light' : 'skin_dark');
  const seed = () => Math.floor(rand() * 1e9);
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  const fig = (at, y, rot, o) => P.push({ t: 'figure', at, y, rot, seed: seed(), skin: skin(), beard: false, ...o });
  // the dress of the peoples [stated/inferred, docs §8]
  const mongol = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'robe', cloth: pick([col.blue, col.brown, col.ochre, col.maroon, col.green, col.indigo]), cloth2: pick([col.red, col.ochre, col.white]), over: 'sash', hat: rand() < 0.65 ? 'brim' : 'cap', hatMat: pick(['hide_brown', 'hide_black', 'cloth_indigo']), feet: 'shod', hair: 'long', ...o });
  const mwoman = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'robe', cloth: pick([col.red, col.green, col.blue, col.ochre]), cloth2: pick([col.white, col.ochre]), over: 'sash', hat: 'cap', hatMat: 'cloth_red', feet: 'shod', hair: 'bun', ...o });
  const saracen = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'robe', cloth: pick([col.white, col.green, col.indigo, col.ochre, col.grey]), cloth2: pick([col.white, col.red]), over: 'sash', hat: 'turban', feet: 'shod', beard: rand() < 0.8, skin: skin(0.5), ...o });
  const cathay = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'robe', cloth: pick([col.indigo, col.grey, col.brown, col.blue]), cloth2: col.white, over: 'sash', hat: 'cap', feet: 'shod', hair: 'bun', skin: skin(0.9), ...o });
  const monk = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'robe', cloth: pick([col.ochre, col.red, col.maroon]), cloth2: col.ochre, over: 'cloak', hat: 'none', hair: 'shaven', feet: 'shod', ...o });

  // ── the hall, the feast: everyone in blue "from their boots to their turbans" [stated: Rubruck] ──
  const F = HALL.y + 0.04, DH = 1.25, [hx, zF] = HALL.c, z0 = zF - 33.6;
  const blue = (f, at, y, rot, o) => f(at, y, rot, { cloth: col.blue, cloth2: col.blue, hatMat: 'cloth_blue', ...o });
  fig([hx, z0 + 2.2], F + DH + 0.09, Math.PI, { dress: 'robe', cloth: 'cloth_ochre', cloth2: 'gold', over: 'sash', hat: 'brim', hatMat: 'gold', feet: 'shod', hair: 'long', pose: 'sit', beard: false, skin: 'skin_medium', h: 1.7 });
  fig([hx - 2.4, z0 + 2.3], F + DH, Math.PI, { dress: 'robe', cloth: col.blue, cloth2: col.red, over: 'sash', hat: 'cap', hatMat: 'cloth_red', feet: 'shod', hair: 'bun', pose: 'cross' });
  for (const [bx, sd, women] of [[hx - 8.4 + 1.9, 1, false], [hx + 8.4 - 1.9, -1, true]]) for (let k = 0; k < 3; k++) for (let m = 0; m < 3; m++) {
    const z = z0 + 6.2 + 3.0 + k * 6.5 + 0.8 + m * 1.5;
    (women ? blue.bind(null, mwoman) : blue.bind(null, mongol))([bx, z], F + 0.02, sd > 0 ? -Math.PI / 2 : Math.PI / 2, { pose: 'sit' });
  }
  // guests at the foot of the dais: envoys kneeling, a Franciscan in his grey habit, an Armenian monk, cup-bearers by the tree
  fig([hx + 1.0, z0 + 15], F, Math.PI, { dress: 'robe', cloth: col.grey, cloth2: col.brown, over: 'belt', hat: 'none', hair: 'shaven', beard: true, feet: 'shod', skin: 'skin_light', pose: 'talk' });
  fig([hx - 1.6, z0 + 14.2], F, Math.PI, { dress: 'robe', cloth: col.black, cloth2: col.white, over: 'cloak', hat: 'cap', hatMat: 'cloth_black', beard: true, feet: 'shod', skin: 'skin_light' });
  for (const [dx, dz] of [[-1.8, 11.2], [2.3, 11.6]]) saracen([hx + dx, z0 + dz], F, Math.PI, { pose: 'kneel', cloth: col.green });
  for (const [dx, dz] of [[1.9, 1.5], [-1.9, -0.5], [0.6, 2.4]]) blue(mongol, [TREE[0] + dx, TREE[1] + dz], F, face([TREE[0] + dx, TREE[1] + dz], TREE), { carry: 'staff' });
  for (const x of [hx - 6.4, hx - 3.4, hx + 3.4, hx + 6.4]) mongol([x, zF - 1.1], F, Math.PI, { carry: 'staff', cloth: col.maroon });
  // in the court: guards at the gate, a groom with horses, a monk and an envoy talking, the khan's household at the ger
  for (const x of [66.5, 73.5]) mongol([x, -5], 0.9 + 0.04, 0, { carry: 'staff', cloth: col.maroon });
  mongol([COURT_GER.c[0] + 3, COURT_GER.c[1] + 6.2], 0, 0.5, { pose: 'talk' }); mwoman([COURT_GER.c[0] + 4.5, COURT_GER.c[1] + 6.4], 0, -2.6, { pose: 'talk' });
  saracen([84, -28], 0, 1.0, { pose: 'talk', cloth: col.green }); mongol([85.2, -27], 0, -2.2, { pose: 'talk' });
  monk([60, -30], 0, 0, {}); fig([62, -31], 0, 0.5, { dress: 'robe', cloth: col.black, cloth2: col.white, over: 'cloak', hat: 'cap', hatMat: 'cloth_black', beard: true, feet: 'shod', skin: 'skin_light', pose: 'talk' });
  for (let k = 0; k < 4; k++) E_animal(T, 'horse', [92 + k * 1.6, -14 + (k % 2) * 0.5], 0, 1.57 + (rand() - 0.5) * 0.3, seed());
  for (let k = 0; k < 2; k++) mongol([91 + k * 3.2, -12.2], 0, face([91, -12], [92, -14]), { pose: 'talk' });

  // ── the palace court, crowded as a court is on a feast day: envoys and courtiers in knots, retainers with their horses, cooks at the kitchens, carts of wine and meat at the storehouses ──
  { const clear = (x, z) => !(x > 60 && x < 80 && z < -4) && Math.hypot(x - COURT_GER.c[0], z - COURT_GER.c[1]) > 6.4 && Math.hypot(x - 36, z + 26) > 5.2 && Math.hypot(x - 51, z + 18) > 3 && Math.hypot(x - 58, z + 22) > 1.5 && Math.hypot(x - 82, z + 22) > 1.5;
    let n = 0;
    for (let k = 0; k < 400 && n < 26; k++) {
      const x = 18 + rand() * 106, z = -38 + rand() * 25;
      if (!clear(x, z)) continue;
      n++;
      const w = rand(), pos = [x, z], pose = rand() < 0.6 ? 'talk' : 'stand', toward = rot_(rand);
      if (w < 0.34) mongol(pos, 0, toward, { pose }); else if (w < 0.5) mwoman(pos, 0, toward, { pose });
      else if (w < 0.66) saracen(pos, 0, toward, { pose }); else if (w < 0.78) cathay(pos, 0, toward, { pose });
      else if (w < 0.88) monk(pos, 0, toward, { pose });
      else fig(pos, 0, toward, { dress: 'robe', cloth: pick([col.grey, col.brown, col.black]), cloth2: col.white, over: 'belt', hat: 'none', hair: 'short', beard: true, feet: 'shod', skin: 'skin_light', pose });
      if (pose === 'talk') mongol([x + 1.1 * Math.cos(toward), z - 1.1 * Math.sin(toward)], 0, toward + Math.PI, { pose: 'talk' });
    }
    // the horses of the visitors tethered along the west wall, and a camel
    for (let k = 0; k < 6; k++) E_animal(T, 'horse', [20 + k * 2.2, -35.5 + (k % 2) * 0.4], 0, 1.57 + (rand() - 0.5) * 0.4, seed());
    E_animal(T, 'camel', [38, -14], 0, 0.4, seed()); E_animal(T, 'camel', [41, -13.4], 0, 0.6, seed());
    T.push({ t: 'trough', at: [28, -33], y: 0, rot: 0, seed: seed() });
    // the wine and mare's-milk carts (barrels on two wheels with their oxen) and the stacks at the storehouses
    T.push({ t: 'cart', at: [92, -33], y: 0, rot: 1.3, seed: seed(), kind: 'two', load: 'barrels', beast: 'ox' }); T.push({ t: 'cart', at: [50, -34], y: 0, rot: 1.8, seed: seed(), kind: 'two', load: 'barrels', beast: 'ox' });
    mongol([88, -31.4], 0, 1.4, { carry: 'sack', cloth: col.maroon });
    for (const q of STORES.slice(2)) { const cx = (q[0] + q[2]) / 2; T.push({ t: 'sacks', at: [cx + 3.2, q[3] + 3.4], y: 0, rot: 0.3, seed: seed(), n: 5 }); T.push({ t: 'crates', at: [cx - 3.4, q[3] + 3.4], y: 0, rot: 0, seed: seed(), n: 3 }); T.push({ t: 'barrel', at: [cx - 1, q[3] + 3.6], y: 0, rot: 0, seed: seed(), n: 3 }); cathay([cx + 1.2, q[3] + 3.2], 0, 1.0, { carry: 'sack' }); }
    for (const q of STORES.slice(0, 2)) { const cx = (q[0] + q[2]) / 2; T.push({ t: 'sacks', at: [cx + 4.2, q[3] + 3.2], y: 0, rot: 0.1, seed: seed(), n: 6 }); T.push({ t: 'barrel', at: [cx - 4.0, q[3] + 3.2], y: 0, rot: 0, seed: seed(), n: 4 }); mongol([cx + 0.6, q[3] + 3.4], 0, 0.1, { carry: 'sack' }); }
    // the kitchens by the west stores: cauldron fires, a butcher's block with a sheep, firewood, cooks in aprons
    for (const [x, z] of [[40, -72], [40, -62], [40, -50]]) { T.push({ t: 'pot', at: [x, z], y: 0, rot: 0, seed: seed(), kind: 'vat', n: 2 }); T.push({ t: 'firewood', at: [x + 2.4, z], y: 0, rot: 0, seed: seed() }); cathay([x - 1.4, z + 0.4], 0, 1.2, { cloth: col.brown, over: 'apron', carry: 'pot' }); }
    for (const [x, z] of [[40, -77], [38, -57]]) { E_animal(T, 'sheep', [x, z], 0, rand() * 6, seed()); mongol([x + 1.6, z + 0.6], 0, 2.4, { cloth: col.brown, over: 'apron' }); }
    // the cellar's mouth and the wine-carriers
    for (let k = 0; k < 2; k++) mongol([94 + k * 1.2, -85], 0, 3.1, { carry: 'pot' });
    T.push({ t: 'barrel', at: [97, -86.5], y: 0, rot: 0, seed: seed(), n: 6 });
  }
  // ── the streets: every bay has its seller inside, buyers at the apron, and its goods out at the front ──
  const goodsOf = { cloth: ['bolts', 'baskets'], carpet: ['bolts'], saddler: ['baskets'], spice: ['spice', 'heap'], pots: ['pottery'], metal: ['pottery'], food: ['bread', 'greens', 'melons'], wine: ['baskets'] };
  for (const s of SHOPS) {
    const F = frontFrame(shopRect(s), s.face), Pf = (u, v) => [F.O[0] + F.U[0] * u + F.V[0] * v, F.O[1] + F.U[1] * u + F.V[1] * v];
    const out = Math.atan2(F.V[0], F.V[1]), faceOut = Math.atan2(-F.V[0], -F.V[1]), faceIn = Math.atan2(F.V[0], F.V[1]);
    for (let i = 0; i < s.n; i++) {
      const um = (i + 0.5) * 3.6, r = rand();
      // the seller in his bay (a woman at the food shops, a Chinese craftsman in the east)
      if (r > 0.12) { const sp = Pf(um + (rand() < 0.5 ? 0.9 : -0.9), -1.5); const sell = s.east ? cathay : rand() < 0.72 ? saracen : mongol; sell(sp, 0, faceOut, { pose: 'stand' }); }
      if (rand() < 0.4) { const bp = Pf(um + (rand() - 0.5) * 1.2, 2.7); (s.east ? cathay : rand() < 0.5 ? mongol : saracen)(bp, 0, faceIn, { pose: rand() < 0.5 ? 'talk' : 'stand' }); }
      // the goods out at the front: on a mat with a seller, crates, barrels, a bench with a stool, a cart, pots, firewood, chickens
      const k = Math.floor(rand() * 9), at = Pf(um + (rand() - 0.5) * 1.0, 3.3 + rand() * 0.4);
      if (k === 0) T.push({ t: 'goods_mat', at, y: 0, rot: out, seed: seed(), goods: goodsOf[['cloth', 'carpet', 'saddler', 'spice', 'pots', 'metal', 'food', 'wine'][Math.floor(rand() * 8)]] });
      else if (k === 1) T.push({ t: 'crates', at, y: 0, rot: out, seed: seed(), n: 3 });
      else if (k === 2) T.push({ t: 'barrel', at, y: 0, rot: out, seed: seed(), n: 2 });
      else if (k === 3) { T.push({ t: 'bench', at, y: 0, rot: out + Math.PI / 2, seed: seed(), len: 1.6 }); T.push({ t: 'stool', at: Pf(um + 1.4, 3.3), y: 0, rot: out, seed: seed() }); }
      else if (k === 4) T.push({ t: 'pot', at, y: 0, rot: out, seed: seed(), kind: pick(['amphora', 'pithos', 'water_pot', 'glazed_jar', 'blue_jar']), n: 3 });
      else if (k === 5) T.push({ t: 'firewood', at, y: 0, rot: out + Math.PI / 2, seed: seed() });
      else if (k === 6) T.push({ t: 'chickens', at, y: 0, rot: rand() * 6, seed: seed(), n: 4 });
      else if (k === 7) T.push({ t: 'sacks', at, y: 0, rot: out, seed: seed(), n: 4 });
      else T.push({ t: 'basket', at, y: 0, rot: out, seed: seed(), n: 3 });
    }
    // at the row's ends: a ladder against the wall, a water jar under the eave, a heap of dung for the oven
    const e0 = Pf(-0.7, 1.0); T.push({ t: 'ladder', at: e0, y: 0, rot: out + Math.PI / 2, seed: seed(), len: 3.4 });
    T.push({ t: 'pot', at: Pf(s.n * 3.6 + 0.8, 0.9), y: 0, rot: out, seed: seed(), kind: 'water_pot', n: 2 });
  }
  // along the main street's margins (the strip between the awnings and the paving): stalls under cloth, camels and horses at rest, water troughs, carts
  for (let x = -128; x < 128; x += 11 + rand() * 7) {
    const side = rand() < 0.5 ? -1 : 1, z = side * (4.9 + rand() * 0.5);
    if (Math.abs(x) < 6) continue;
    const kind = rand();
    if (kind < 0.4) { T.push({ t: 'stall', at: [x, z], y: 0, rot: side < 0 ? 0 : Math.PI, seed: seed(), awning: pick(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white']), goods: [pick(['basket', 'cloth', 'produce'])] }); saracen([x, z + side * -1.3 * -1], 0, side < 0 ? 0 : Math.PI, {}); }
    else if (kind < 0.6) { T.push({ t: 'trough', at: [x, z], y: 0, rot: 0, seed: seed() }); E_animal(T, rand() < 0.6 ? 'horse' : 'camel', [x + 1.8, z + side * 0.4], 0, 1.57 + rand() * 0.4, seed()); }
    else if (kind < 0.8) { T.push({ t: 'cart', at: [x, z], y: 0, rot: 1.57, seed: seed(), kind: 'two', load: pick(['sacks', 'barrels', 'hay']) }); mongol([x + 2.4, z], 0, 1.4, { pose: 'talk' }); }
    else { T.push({ t: 'handcart', at: [x, z], y: 0, rot: rand() * 6, seed: seed(), load: 'baskets' }); cathay([x + 1.6, z], 0, 0.8, { carry: 'basket' }); }
  }
  // the cross-street's wells and lanes' ends
  for (let z = -90; z < 90; z += 14 + rand() * 8) if (Math.abs(z) > 14) { T.push({ t: 'barrel', at: [side_(rand) * 3.2, z], y: 0, rot: 0, seed: seed(), n: 2 }); }
  // ── the Cathayan quarter's people: smiths at the forges, kiln tenders, monks at the temples ──
  for (const q of FORGES) { const cx = (q[0] + q[2]) / 2; cathay([cx + 0.5, q[3] - 1.5], 0, 0.6, { pose: 'stand', cloth: col.brown, over: 'apron' }); cathay([q[0] + 2.2, q[1] + 1.6], 0, -0.7, { cloth: col.grey, over: 'apron' }); }
  for (const [x, z] of KILNS) cathay([x + 3.4, z + 0.6], 0, 1.4, { carry: 'basket' });
  for (const q of [...TEMPLES, ...TEMPLES_NW]) { const cx = (q[0] + q[2]) / 2; monk([cx - 1.4, q[3] + 3.2], 0, 3.1, { pose: rand() < 0.5 ? 'stand' : 'talk' }); monk([cx + 1.0, q[1] + 2.8], 0.74, 3.14, { pose: 'cross' }); }
  { const [gx, gz] = GREAT_HALL.c; for (let k = 0; k < 4; k++) monk([gx + (k - 1.5) * 1.8, gz + 14.5], GREAT_HALL.y + 0.04, 0, { pose: 'cross' }); }
  // the church: a priest at the door in black with a cross, two of his flock
  { const cx = (CHURCH[0] + CHURCH[2]) / 2; fig([cx, CHURCH[3] + 1.6], 0, 0, { dress: 'robe', cloth: col.black, cloth2: col.white, over: 'cloak', hat: 'cap', hatMat: 'cloth_black', beard: true, feet: 'shod', skin: 'skin_light', carry: 'staff' }); mongol([cx - 2, CHURCH[3] + 3.4], 0, 0.3, { pose: 'talk' }); mwoman([cx - 3, CHURCH[3] + 3.0], 0, -0.4, { pose: 'talk' }); }
  // the mosques: men at the pool washing, one at the gate
  for (const q of MOSQUES) { const cx = (q[0] + q[2]) / 2, pz = (q[1] + (q[1] + (q[3] - q[1]) * 0.55) + q[3]) / 2 + 0.8; saracen([cx + 2.9, pz], 0, -1.5, { pose: 'squat' }); saracen([cx - 2.9, pz], 0, 1.5, { pose: 'squat' }); saracen([cx, q[3] + 1.2], 0, 3.14, {}); }
  // ── the open ground: gers with their women and children, dogs, and the herds ──
  const open = LOTS.filter((l) => l.kind === 'open');
  for (const l of open) {
    const [x0, z0, x1, z1] = l.rect, cz = (z0 + z1) / 2;
    mwoman([x0 + 4.2, cz + 5], 0, 0.5 + rand(), { pose: rand() < 0.4 ? 'kneel' : 'stand', carry: rand() < 0.4 ? 'pot' : 'none' });
    if (rand() < 0.6) mongol([x0 + 9, cz + 4.5], 0, rand() * 6, { pose: 'talk' });
    if (rand() < 0.5) fig([x0 + 6, cz + 5.5], 0, rand() * 6, { dress: 'robe', cloth: pick([col.red, col.ochre]), cloth2: col.white, over: 'none', child: true, h: 1.1, hat: 'cap', hatMat: 'cloth_red', feet: 'shod', hair: 'bun' });
    E_animal(T, 'dog', [x0 + 7.5, cz + 6], 0, rand() * 6, seed());
  }
  // the camps outside: women at their gers, children, dogs, horses tethered
  for (const [i, c] of [CAMPS.sw, CAMPS.se].entries()) {
    const { G } = campElements(c, i ? 4242 : 1254, -1, i ? 8 : 9);
    for (const g of G) {
      const sx = g.c[0] + g.r + 1.4, sz = g.c[1] + g.r * 0.4;
      if (rand() < 0.8) mwoman([g.c[0] - g.r * 0.4, g.c[1] + g.r + 1.4], 0, rand() * 6.28, { pose: rand() < 0.5 ? 'kneel' : 'stand' });
      if (rand() < 0.5) mongol([sx, sz], 0, 1.6 + rand(), { pose: 'talk' });
      if (rand() < 0.5) E_animal(T, 'dog', [g.c[0] + g.r + 2.2, g.c[1] + g.r], 0, rand() * 6, seed());
      if (rand() < 0.6) E_animal(T, 'horse', [g.c[0] + g.r + 3.4, g.c[1] + g.r * 0.4], 0, 1.57, seed());
    }
  }
  // ── the ger yards: dung cakes stacked for the fire, the churn with its stick, meat drying on a rack, a cart, a heap of hay, washing on a line, hobbled horses ──
  const yard = (gx, gz, gr, k) => {
    const a = k * 2.1;
    T.push({ t: 'firewood', at: [gx - gr - 1.4, gz + 0.8], y: height(gx, gz), rot: 1.57, seed: seed() });
    T.push({ t: 'barrel', at: [gx + gr + 0.7, gz + gr * 0.5 + 0.2], y: height(gx, gz), rot: 0, seed: seed(), n: 1 });
    if (k % 2 === 0) T.push({ t: 'drying_tray', at: [gx - gr * 0.5, gz + gr + 2.2], y: height(gx, gz), rot: a, seed: seed(), h: 1.2 });
    if (k % 3 === 1) T.push({ t: 'haystack', at: [gx + gr + 3.2, gz - 1.0], y: height(gx, gz), rot: 0, seed: seed() });
    if (k % 3 === 2) T.push({ t: 'laundry', at: [gx - gr - 3.2, gz + gr + 1.2], y: height(gx, gz), rot: 1.57, seed: seed(), len: 3.4 });
    if (k % 4 === 0) T.push({ t: 'cart', at: [gx + gr + 4.6, gz + 2.2], y: height(gx, gz), rot: 1.2 + a * 0.05, seed: seed(), kind: 'two', load: 'hay' });
    if (k % 4 === 3) T.push({ t: 'sacks', at: [gx - gr - 1.8, gz - gr * 0.5], y: height(gx, gz), rot: 0.4, seed: seed(), n: 3 });
  };
  open.forEach((l, i) => { const [x0, z0, , z1] = l.rect; yard(x0 + 4.2, (z0 + z1) / 2, 3.0, i); });
  for (const [i, c] of [CAMPS.sw, CAMPS.se].entries()) campElements(c, i ? 4242 : 1254, -1, i ? 8 : 9).G.forEach((g, k) => yard(g.c[0], g.c[1], g.r, k));
  // ── the khan's court at eye level: the yards of the great ger and of the wagon-house, the gate guards' fire and their gear, dogs asleep in the sun, children at knucklebones by the banners ──
  yard(COURT_GER.c[0], COURT_GER.c[1], COURT_GER.r, 2); yard(COURT_CART.c[0], COURT_CART.c[1], COURT_CART.r, 1);
  for (const [x, z, rot] of [[63.4, -6.4, 0.4], [76.6, -6.4, -0.4]]) {
    T.push({ t: 'bench', at: [x, z], y: 0.9, rot: 1.57, seed: seed(), len: 1.6 }); T.push({ t: 'firewood', at: [x + (x < 70 ? -1.2 : 1.2), z + 0.6], y: 0.9, rot, seed: seed() });
    T.push({ t: 'barrel', at: [x + (x < 70 ? -1.0 : 1.0), z - 1.0], y: 0.9, rot: 0, seed: seed(), n: 2 });
  }
  for (const [x, z] of [[62.5, -17.5], [78.4, -19.5], [55, -26], [86.5, -25.5]]) E_animal(T, 'dog', [x, z], 0, rand() * 6.28, seed());
  for (const [x, z, a] of [[60.2, -23.6, 0.6], [61.4, -24.4, 2.2], [59.6, -25.0, 4.0]]) fig([x, z], 0, a, { dress: 'robe', cloth: pick([col.red, col.ochre, col.green]), cloth2: col.white, over: 'sash', child: true, h: 1.05, hat: 'cap', hatMat: 'cloth_red', feet: 'shod', hair: 'bun', pose: 'squat' });
  // a felt-maker's yard by the west storehouses: the rolled felts, the wool, the beating frame; the aaruul (dried curd) on trays; mare's-milk skins hung from a pole
  T.push({ t: 'goods_mat', at: [28.4, -28.4], y: 0, rot: 0.2, seed: seed(), goods: ['bolts'] }); T.push({ t: 'goods_mat', at: [31.0, -30.0], y: 0, rot: 1.1, seed: seed(), goods: ['bolts'] });
  T.push({ t: 'sacks', at: [26.4, -27.2], y: 0, rot: 0.6, seed: seed(), n: 4 }); mwoman([29.6, -26.4], 0, 3.4, { pose: 'kneel' }); cathay([32.8, -28.8], 0, 2.6, { pose: 'stand', over: 'apron', cloth: col.brown });
  for (const [x, z] of [[24, -23], [26.2, -22.4], [112, -33], [114.2, -33.6]]) T.push({ t: 'drying_tray', at: [x, z], y: 0, rot: rand() * 3, seed: seed(), h: 0.9 });
  // the khan's household behind the hall: each ger with its yard, the women at the work of the day (churning the mare's milk, sewing felt, tending the fire), children, a dog, a horse tethered
  HOUSEHOLD.forEach((g, i) => {
    yard(g.c[0], g.c[1], g.r, [1, 2, 3, 5, 6, 3][i]);
    const sx = g.c[0] + g.r + 1.6, sz = g.c[1] + g.r * 0.5;
    mwoman([g.c[0] - g.r * 0.5, g.c[1] + g.r + 1.6], 0, rand() * 6.28, { pose: i % 2 ? 'kneel' : 'stand', carry: i % 2 ? 'none' : 'pot' });
    if (i % 2 === 0) mwoman([sx, sz + 1.4], 0, 1.9, { pose: 'kneel' });
    fig([sx + 0.6, sz - 1.1], 0, 0.6 + i, { dress: 'robe', cloth: pick([col.red, col.ochre, col.green]), cloth2: col.white, over: 'sash', child: true, h: 1.0, hat: 'cap', hatMat: 'cloth_red', feet: 'shod', hair: 'bun', pose: i % 3 ? 'squat' : 'stand' });
    E_animal(T, 'dog', [g.c[0] + g.r + 2.4, g.c[1] - g.r], 0, rand() * 6.28, seed());
    if (i < 2) E_animal(T, 'horse', [g.c[0] + g.r + 3.0, g.c[1] + g.r * 0.2], 0, 1.57, seed());
  });
  // lone herd-boys, a woman milking mares at the horse lines, tethers
  for (const c of [CAMPS.sw, CAMPS.se]) { mwoman([c[0] + 28, c[1] - 6], height(c[0], c[1]), 1.0, { pose: 'kneel' }); for (let k = 0; k < 4; k++) E_animal(T, 'horse', [c[0] + 30 + (k % 2) * 1.6, c[1] - 4 + k * 1.6], height(c[0], c[1]), 1.57, seed()); }
  // ── the markets at the gates [stated: Rubruck]: horses at the north, sheep and goats at the west, oxen and carts at the south, grain at the east ──
  for (const q of PENS.n) for (let k = 0; k < 6; k++) E_animal(T, 'horse', [q[0] + 2 + rand() * (q[2] - q[0] - 4), q[1] + 2 + rand() * (q[3] - q[1] - 4)], height(q[0], q[1]), rand() * 6.28, seed());
  for (const q of PENS.w) for (let k = 0; k < 9; k++) E_animal(T, rand() < 0.55 ? 'sheep' : 'goat', [q[0] + 1.5 + rand() * (q[2] - q[0] - 3), q[1] + 1.5 + rand() * (q[3] - q[1] - 3)], height(q[0], q[1]), rand() * 6.28, seed());
  for (const q of PENS.n.slice(0, 2)) { mongol([(q[0] + q[2]) / 2, q[3] + 2.6], height(q[0], q[3]), 3.14, { pose: 'talk' }); mongol([(q[0] + q[2]) / 2 + 1.2, q[3] + 3.4], height(q[0], q[3]), 0.4, {}); }
  for (const q of PENS.w) { saracen([q[2] + 2.4, (q[1] + q[3]) / 2], height(q[2], q[1]), 1.57, { pose: 'talk' }); }
  OUTSIDE_WAGONS.s.forEach(([x, z], i) => { const yaw = 0.2; for (const sd of [-0.45, 0.45]) E_animal(T, 'ox', [x + Math.sin(yaw) * 5.2 + sd * 1.0, z + Math.cos(yaw) * 5.2], 0, Math.PI - yaw, seed()); mongol([x - 2.6, z + 1], 0, 1.57, { pose: 'talk' }); void i; });
  OUTSIDE_WAGONS.e.forEach(([x, z]) => { mongol([x + 3, z + 0.5], height(x, z), -1.57, { carry: 'sack' }); T.push({ t: 'sacks', at: [x - 3.5, z], y: height(x, z), rot: 1.2, seed: seed(), n: 5 }); });
  // camels: a caravan of the Saracens at the west gate, resting outside it; two in the town by the main street
  for (let k = 0; k < 5; k++) E_animal(T, 'camel', [-150 - k * 2.6, 34 + k * 1.2], height(-150, 34), 1.2 + (k % 2) * 0.1, seed());
  for (let k = 0; k < 3; k++) E_animal(T, 'camel', [-118 + k * 2.4, -4.6 + k * 0.1], 0, 1.57, seed());
  saracen([-150, 38.5], height(-150, 38), 0.2, { pose: 'talk', cloth: col.indigo }); saracen([-152, 37.5], height(-150, 38), 3.4, { pose: 'talk', cloth: col.white });
  // wells in the quarters
  for (const [x, z] of WELLS) T.push({ t: 'well', at: [x, z], y: 0, rot: 0, seed: seed() });
  void WALL; void MAIN; void CROSS; void PALACE; void STORES; void inBuilt; void inTown; void inPalace; void onStreet; void GATES;
  void rand;
  return [base('karakorum-town', 'mongol', fabric()), base('karakorum-people', 'life', [...P, ...T])];
}
const rot_ = (rand) => rand() * Math.PI * 2;
const side_ = (rand) => (rand() < 0.5 ? -1 : 1);
function E_animal(T, kind, at, y, rot, seed) { T.push({ t: 'animal', kind, at, y, rot, seed }); }
