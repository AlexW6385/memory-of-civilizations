// Bianjing's streets (docs/settlements/song-kaifeng.md §5, §10): shops, inns and houses; the wine
// shops' colour gates and wine flags; and the life of the scroll — the crowd on the Rainbow Bridge
// leaning over the railing at the boat lowering its mast, vendors under parasols along the bridge,
// sedan chairs with their bearers, a camel train coming out of the city gate, boatmen on the boats;
// the Sun Yang main shop with its lantern boxes, gardenia lamps and the wine jars heaped in its yard,
// Physician Zhao's shop with its standing signboards, the fortune tellers' stands and the young men
// round them, ox carts under their mat covers, a one-wheeled barrow drawn by a donkey, a dray of wine
// casks, the trackers hauling a boat up the river, the fields to the east with a train of donkeys.
import { RADIUS, RIVER, BRIDGE, GATE, WALL_X, FIELDS_X, STREETS, inRect, inLot, lots, wineLots, teaLots, bridgeDeck } from './layout.js';
import './style.js';
import { STONE_BANK, WHARVES, STEPS, LANES, onLane } from './layout.js';
import { ground } from './ground.js';
import { tradeOf } from './trades.js';
import { shopElements } from './shops.js';
import { interiorElements, interiorLife, furnishedLots } from './interiors.js';
const base = (id, elements, style = 'song') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [160, -130], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_ochre'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

/** The wine shops: the five widest two-storey shops nearest the bridge (the scroll has five colour gates), chosen in layout.js. */
const wineShops = () => wineLots();
/** The tea houses: the two on the north riverside street nearest the bridge. */
const teaHouses = () => teaLots();
function frontLine(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  if (f === 's') return { a: [x0 + 0.5, z1], b: [x1 - 0.5, z1], out: FR.s };
  if (f === 'n') return { a: [x1 - 0.5, z0], b: [x0 + 0.5, z0], out: FR.n };
  if (f === 'e') return { a: [x1, z1 - 0.5], b: [x1, z0 + 0.5], out: FR.e };
  return { a: [x0, z0 + 0.5], b: [x0, z1 - 0.5], out: FR.w };
}

function scroll() {
  const S = [], L = [], rand = rng(1121), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.7 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'cap', 'cap', 'straw', 'brim']), carry: 'none', ...extra });
  // ---- the colour gates of the wine shops, their flags and lantern boxes
  wineShops().forEach((l, i) => {
    const F = frontLine(l), w = Math.hypot(F.b[0] - F.a[0], F.b[1] - F.a[1]);
    const dep = Math.min(1.2, 9.5 / Math.max(w, 1)), xs = [F.a[0], F.b[0], F.a[0] + F.out[0] * dep, F.b[0] + F.out[0] * dep], zs = [F.a[1], F.b[1], F.a[1] + F.out[1] * dep, F.b[1] + F.out[1] * dep];
    S.push({ t: 'caimen', a: F.a, b: F.b, out: F.out, y: 0.04, h: i === 0 ? 8.6 : 7.2 + rand() * 0.8, boxes: i === 0 ? 3 : 1, lamps: i === 0, seed: i, rect: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)] });
    // the customers at the door, the host under the gate
    const mid = [(F.a[0] + F.b[0]) / 2 + F.out[0] * 0.6, (F.a[1] + F.b[1]) / 2 + F.out[1] * 0.6];
    person(mid, 0, faceTo(F.out), { pose: 'talk', dress: 'robe', cloth: 'cloth_white', hat: 'cap' });
    if (rand() < 0.8) person([mid[0] + F.out[0] * 1.3 + F.out[1] * 0.6, mid[1] + F.out[1] * 1.3 + F.out[0] * 0.6], 0, faceTo([-F.out[0], -F.out[1]]), { pose: 'stand' });
  });
  // ---- the bridge's approaches: hawkers' stalls along the river edge of the two bank streets (the scroll's market at the bridgehead), a vendor behind each, customers before
  {
    const kinds = ['fruit', 'cloth', 'pots', 'cakes'], aw = ['reed_mat', 'cloth_ochre', 'reed_mat', 'cloth_white', 'cloth_indigo'];
    const row = (xs, zs, rot, dir) => xs.forEach((sx, i) => {
      const x = sx + (rand() - 0.5) * 1.2, w = 2 + rand() * 0.7;
      S.push({ t: 'hawker_stall', at: [x, zs], y: 0.04, rot, kind: kinds[i % 4], w, awning: aw[i % 5] });
      person([x + (rand() - 0.5) * 0.6, zs - dir * 0.15], 0.04, faceTo([0, dir]), { pose: rand() < 0.5 ? 'talk' : 'stand', dress: 'robe', hat: pick(['cap', 'none', 'straw']) });
      const nc = 1 + (rand() < 0.6 ? 1 : 0);
      for (let k = 0; k < nc; k++) person([x + (rand() - 0.5) * 1.6, zs + dir * (1.2 + rand() * 0.9)], 0.04, faceTo([(rand() - 0.5) * 0.4, -dir]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
    });
    row([-56, -49, -42, -35, -28, -21, -14, 14, 21, 28, 35, 42, 49, 56], 95.0, 0, 1);
    row([-58, -50, -42, -34, 14, 22, 30, 38, 46, 54], 57.0, Math.PI, -1);
    // a donkey with its panniers waiting by the stalls on each bank, the drover beside it
    for (const [x, z] of [[-12, 99.5], [12.5, 52.5]]) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: faceTo([1, 0]), seed: Math.floor(rand() * 1e9), gear: true }); person([x - 1.6, z + 0.3], 0.04, faceTo([1, 0]), { dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey']), hat: 'straw' }); }
  }
  // ---- the Rainbow Bridge: the crowd at the west railing watching the boat below, gesturing; vendors under parasols on the east side; people crossing
  const W = BRIDGE.width / 2, [bx, bz] = BRIDGE.at;
  for (let k = 0; k < 11; k++) {
    const z = bz - 6.5 + k * 1.25 + (rand() - 0.5) * 0.3, x = bx - W + 0.45 + rand() * 0.2;
    person([x, z], bridgeDeck(z), faceTo([-1, (rand() - 0.5) * 0.4]), { pose: rand() < 0.5 ? 'talk' : 'stand' });
    if (rand() < 0.35) { const z2 = z + 0.4; person([x + 0.7, z2], bridgeDeck(z2), faceTo([-1, 0]), { pose: 'stand' }); }
  }
  for (const z of [bz - 6, bz + 5.5]) {
    const x = bx + W - 1.3;
    S.push({ t: 'parasol', at: [x, z], y: bridgeDeck(z) - 0.02, h: 2.3, r: 1.25, cloth: pick(['cloth_white', 'cloth_ochre']) });
    person([x - 0.2, z + 0.5], bridgeDeck(z + 0.5), faceTo([-1, 0]), { pose: 'squat', dress: 'robe', hat: 'none' });
    for (const dz of [-0.5, 0.15]) L.push({ t: 'basket', at: [x - 0.75, z + dz], y: bridgeDeck(z + dz), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    person([x - 1.7, z + 0.2], bridgeDeck(z + 0.2), faceTo([1, 0]), { pose: 'stand', carry: rand() < 0.4 ? 'basket' : 'none' });
  }
  for (let k = 0; k < 6; k++) { const z = bz - 9 + k * 3.4, x = bx + (rand() - 0.5) * 2; person([x, z], bridgeDeck(z), faceTo([0, k % 2 ? 1 : -1]), { carry: pick(['pole', 'none', 'none', 'basket']) }); }
  // the boat before the bridge: boatmen on the deck at the bow and on the house roof, hands on the mast
  {
    const x0 = -17.5, L0 = 19, yw = RIVER.water, z = 75, deck = (t) => yw + 0.95 + 0.35 * t * t + (t > 0 ? 0.7 : 0.45) * t ** 6 - 0.3;
    for (const [t, o] of [[0.85, -0.6], [0.8, 0.7], [0.5, 0.2]]) person([x0 + t * L0 / 2, z + o], deck(t), faceTo([1, 0]), { dress: 'trousers', hat: pick(['straw', 'none']), cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), pose: 'talk' });
    for (const t of [-0.1, -0.35]) person([x0 + t * L0 / 2, z], deck(0) + 0.02 + 2.22, faceTo([1, 0]), { dress: 'trousers', hat: 'none', cloth: 'cloth_brown', pose: 'stand' });
    person([x0 - L0 / 2 + 0.9, z + 0.3], deck(-0.9), faceTo([1, 0]), { dress: 'trousers', hat: 'straw', cloth: 'cloth_indigo' });
  }
  // ---- on the bank, watchers at the river's edge by the bridge
  for (let k = 0; k < 8; k++) { const x = -26 + k * 2.6 + rand(), z = RIVER.z0 - 1.2 - rand() * 0.8; person([x, z], 0.04, faceTo([0.3, 1]), { pose: k % 3 ? 'stand' : 'talk' }); }
  // ---- sedan chairs on the street, a bearer at each end of the poles
  for (const [x, z, d] of [[-3.5, -30, 1], [3.2, 8, -1], [-3, 40, 1], [3.5, 130, -1], [-3.2, 170, 1]]) {
    const rot = d > 0 ? Math.PI : 0;
    S.push({ t: 'sedan', at: [x, z], y: 0.04, rot });
    for (const s of [-1, 1]) person([x, z + s * 1.75], 0.04, faceTo([0, d]), { dress: 'trousers', cloth: pick(['cloth_indigo', 'cloth_grey', 'cloth_brown']), hat: pick(['cap', 'none']), h: 1.62 });
    if (rand() < 0.6) person([x + 1.1, z + d * 2.6], 0.04, faceTo([0, d]), { dress: 'robe', hat: 'cap' });
  }
  // ---- the camel train coming out of the city gate, its driver at the head
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'camel', at: [WALL_X + 11 + k * 3.6, GATE.z + (k % 2 ? 0.3 : -0.3)], y: 0, rot: -Math.PI / 2 - (k % 2 ? 0.04 : -0.04), seed: 77 + k });
  person([WALL_X + 11 + 5 * 3.6 + 0.4, GATE.z - 0.9], 0, faceTo([1, 0]), { dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_ochre', hat: 'brim', skin: 'skin_medium' });
  person([WALL_X + 10, GATE.z + 1.4], 0, faceTo([1, 0]), { dress: 'robe', cloth: 'cloth_grey', hat: 'brim', skin: 'skin_medium' });
  // ---- the tea houses on the riverside street by the bridge: tables and customers inside, the host at the counter, the name board
  for (const l of teaHouses()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2 - 0.6, Y = 0.45;
    S.push({ t: 'tea_house', rect: l.rect, y: 0, seed: l.seed });
    S.push({ t: 'shop_plaque', at: [(x0 + x1) / 2, z1 - 0.435], y: 0, yb: 3.3, rot: 0, n: 2, scheme: 0, seed: l.seed >> 5 });
    for (const zz of [z0 + 3.9, z0 + 7.5]) {
      L.push({ t: 'tea_table', at: [cx, zz], y: Y, rot: 0, seed: Math.floor(rand() * 1e9) });
      for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85], [0, -0.85]]) if (rand() < 0.6) person([cx + dx, zz + dz], Y, faceTo([-dx, -dz]), { pose: 'sit', dress: 'robe', hat: rand() < 0.6 ? 'cap' : 'none' });
    }
    person([x1 - 1.15, z0 + 5.5], Y, faceTo([-1, 0]), { pose: 'stand', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' });
  }
  // ---- the shops' name boards over their fronts (the wine shops have their colour gates and lantern boxes instead)
  const wine = new Set(wineShops()), tea = new Set(teaHouses());
  for (const l of lots()) {
    if (!l.shop || wine.has(l) || tea.has(l)) continue;
    const F = frontLine(l), m = [(F.a[0] + F.b[0]) / 2 - F.out[0] * 0.505, (F.a[1] + F.b[1]) / 2 - F.out[1] * 0.505], L = Math.hypot(F.b[0] - F.a[0], F.b[1] - F.a[1]);
    const n = Math.min(Math.floor((L - 0.6) / 0.36), 2 + (l.seed % 4));
    if (n >= 2) S.push({ t: 'shop_plaque', at: m, y: 0, rot: Math.atan2(F.out[0], F.out[1]), n, scheme: [0, 0, 1, 2][l.seed % 4 === 3 ? (l.seed >> 3) % 4 : (l.seed >> 2) % 3], seed: l.seed >> 5 });
  }
  more(S, L, rand, person, pick);
  return [base('song-kaifeng-scroll', S), base('song-kaifeng-crowds', L, 'life')];
}

/** Is a disc of radius r at (x, z) clear of the houses and the river (on a street, if `street`)? */
const clear = (x, z, r, street = false) => !inLot(x, z, r) && !(z > RIVER.z0 - 1 && z < RIVER.z1 + 1) && Math.hypot(x, z) < RADIUS - 30 && (!street || STREETS.some((s) => inRect(s, x, z, -r)));

function more(S, L, rand, person, pick) {
  const P = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];
  const animal = (kind, at, rot, extra = {}) => L.push({ t: 'animal', kind, at, y: 0.04, rot, seed: Math.floor(rand() * 1e9), ...extra });
  // ---- the Sun Yang main shop: the great standing sign at its corner, the wine jars heaped in the yard behind
  {
    const l = wineShops()[0], F = frontLine(l), back = l.front === 'e' ? [-1, 0] : l.front === 'w' ? [1, 0] : l.front === 's' ? [0, -1] : [0, 1];
    const sx = F.a[0] + F.out[0] * 2.9 - (F.b[0] - F.a[0]) * 0.08, sz = F.a[1] + F.out[1] * 2.9 - (F.b[1] - F.a[1]) * 0.08;
    S.push({ t: 'signboard', at: [sx, sz], y: 0.04, rot: faceTo(F.out), h: 2.9, w: 0.78, chars: 3, board: 'paint_white', seed: 11 });
    // the yard: the first clear spot behind the shop
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, depth = Math.abs(back[0]) ? x1 - x0 : z1 - z0;
    for (let d = depth / 2 + 3; d < depth / 2 + 30; d += 1) {
      const jx = cx + back[0] * d, jz = cz + back[1] * d;
      if ([-2.6, 0, 2.6].every((o) => clear(jx + Math.abs(back[1]) * o, jz + Math.abs(back[0]) * o, 1.6))) { S.push({ t: 'jar_heap', at: [jx, jz], y: 0, rot: Math.abs(back[0]) ? Math.PI / 2 : 0, n: 6, rows: 3 }); break; }
    }
  }
  // ---- Physician Zhao's shop near the gate: its two standing signboards on the street before it, the women come with their children
  {
    const l = lots().filter((q) => q.shop && q.front === 's' && q.rect[3] > -85 && q.rect[3] < -83 && q.rect[0] > -275 && q.rect[0] < -262)[0];
    if (l) {
      const F = frontLine(l), zf = F.a[1] + 0.9;
      S.push({ t: 'signboard', at: [l.rect[0] + 0.7, zf], y: 0.04, rot: faceTo([0, 1]), h: 2.9, w: 0.5, chars: 9, board: 'paint_white', seed: 21 });
      S.push({ t: 'signboard', at: [l.rect[2] - 0.7, zf], y: 0.04, rot: faceTo([0, 1]), h: 2.5, w: 0.45, chars: 7, board: 'paint_white', seed: 22 });
      const mx = (l.rect[0] + l.rect[2]) / 2;
      person([mx - 0.5, zf + 0.6], 0.04, faceTo([0, -1]), { dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'none', hair: 'bun', beard: false, pose: 'talk' });
      person([mx + 0.4, zf + 0.8], 0.04, faceTo([0, -1]), { dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'none', hair: 'bun', beard: false, carry: 'none' });
      person([mx - 0.8, zf + 1.0], 0.04, faceTo([0.3, -1]), { dress: 'trousers', cloth: 'cloth_ochre', hat: 'none', hair: 'short', beard: false, h: 1.0 });
      person([mx + 0.9, zf + 1.3], 0.04, faceTo([-0.2, -1]), { dress: 'robe', cloth: 'cloth_indigo', hat: 'none', hair: 'short', beard: false, h: 0.95 });
      person([mx, zf - 0.6], 0.04, faceTo([0, 1]), { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'none', hair: 'bun', beard: false, pose: 'talk', h: 1.5 });
    }
  }
  // ---- the fortune tellers: a stand by the gate street, another on the approach to the bridge; the seer seated, young men round him
  for (const [x, z, rot] of [[-236, -77.9, 0], [5.3, 22, Math.PI / 2]]) {
    S.push({ t: 'fortune', at: [x, z], y: 0.04, rot, cloth: 'cloth_white' });
    const q = P(x, z, rot, 0, 0.77); person(q, 0.04, rot, { pose: 'sit', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap', beard: true });
    for (let k = 0; k < 5; k++) { const a = -0.9 + k * 0.45, q2 = P(x, z, rot, Math.sin(a) * 1.3, -1.0 - Math.cos(a) * 0.6); person(q2, 0.04, rot + Math.PI + a * 0.5, { dress: 'robe', cloth: pick(['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_grey']), hat: 'cap', beard: false, pose: k % 2 ? 'talk' : 'stand', h: 1.62 + rand() * 0.1 }); }
  }
  // ---- the ox carts: under their mat covers, an ox in the shafts and two more ahead, the drover walking by
  for (const [x, z, rot] of [[-176, -81.5, -Math.PI / 2], [3.6, 162, 0]]) {
    S.push({ t: 'song_oxcart', at: [x, z], y: 0.04, rot, traces: 0.9, seed: Math.floor(rand() * 1e6) });
    animal('ox', P(x, z, rot, 0, -3.05), rot, { gear: false });
    for (const s of [-1, 1]) animal('ox', P(x, z, rot, s * 0.62, -5.35), rot + s * 0.04, { gear: false });
    person(P(x, z, rot, 1.35, -4.2), 0.04, rot, { dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey']), hat: 'straw', carry: 'none' });
  }
  // ---- the one-wheeled barrow (chuan che): a donkey pulling ahead, a man steering at the front, one pushing at the handles
  for (const [x, z, rot] of [[-118, 51.5, -Math.PI / 2], [-3.8, 124, Math.PI]]) {
    L.push({ t: 'barrow', at: [x, z], y: 0.04, rot, seed: Math.floor(rand() * 1e6) });
    animal('donkey', P(x, z, rot, 0, -1.75), rot, { gear: false });
    for (const sx of [-0.2, 0.2]) { const a = P(x, z, rot, sx * 1.3, -0.62), b = P(x, z, rot, sx, -1.25); S.push({ t: 'tow_line', pts: [[a[0], 0.6, a[1]], [b[0], 0.78, b[1]]], sag: 0.02, r: 0.012 }); }
    person(P(x, z, rot, 0, 1.7), 0.04, rot, { dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_indigo']), hat: pick(['straw', 'none']) });
    person(P(x, z, rot, 0.55, -0.95), 0.04, rot, { dress: 'trousers', cloth: pick(['cloth_grey', 'cloth_brown']), hat: 'none' });
  }
  // ---- a dray with two wine casks (ping tou che): a donkey in the shafts, a second ahead, the driver at the shafts
  {
    const x = 60, z = 199, rot = Math.PI / 2;
    L.push({ t: 'cart', kind: 'two', beast: 'donkey', load: 'barrels', at: [x, z], y: 0.04, rot, seed: 5 });
    animal('donkey', P(x, z, rot, 0, -3.25), rot, { gear: false });
    person(P(x, z, rot, 0.75, -1.6), 0.04, rot, { dress: 'trousers', cloth: 'cloth_brown', hat: 'straw' });
  }
  // ---- the trackers on the towpath, hauling the boat up the river toward the bridge; the line from its masthead over their shoulders
  {
    const yw = RIVER.water, L0 = 16, bx = 140, bz = 63.0, apex = [bx - 0.3 * L0 / 2, yw + 3.52 + 0.62 * L0 - 0.15, bz];
    const pts = [apex];
    for (let k = 0; k < 5; k++) {
      const x = 117 - k * 2.3, z = 56.5 + (k % 2) * 0.35, y = ground.height(x, z);
      person([x, z], y, faceTo([-1, 0]), { dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_white']), hat: pick(['straw', 'none', 'straw']), skin: 'skin_medium', beard: false });
      pts.push([x + 0.05, y + 1.34, z + 0.2]);
    }
    S.push({ t: 'tow_line', pts, sag: 0.025, r: 0.02 });
  }
  // ---- out in the fields: men hoeing the wheat, straw stacks from last year, a train of donkeys with panniers on the road in
  for (const [x, z] of [[291, -150], [294, -147.5], [325, -40], [306, 150]]) person([x, z], 0, faceTo([rand() - 0.5, 1]), { dress: 'trousers', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_white']), hat: 'straw', carry: 'hoe' });
  for (const [x, z] of [[270, -100], [288, 118]]) L.push({ t: 'haystack', at: [x, z], y: 0 });
  for (let k = 0; k < 5; k++) animal('donkey', [300 + k * 2.1, -80 + (k % 2 ? 0.4 : -0.4)], faceTo([-1, 0]), { y: 0, gear: true });
  person([298.2, -80.8], 0, faceTo([-1, 0]), { dress: 'trousers', cloth: 'cloth_grey', hat: 'brim' });
  person([311.5, -79.2], 0, faceTo([-1, 0]), { dress: 'trousers', cloth: 'cloth_brown', hat: 'straw', carry: 'pole' });
}

/**
 * The landing (§10, Landing): the grain boat moored off the south bank east of the bridge, unloading — two gangplanks
 * from its foredeck up to the bank, mooring lines to stakes, sacks heaped on the deck and on the bank, porters carrying
 * them up one plank and coming back down the other, a clerk tallying, the boatman at the stern.
 */
function landing() {
  const S = [], L = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  // the boat (plan.js): at (62, 89.4), bow west, 18 m by 4.5; its gunwale's height and its half-breadth along it
  const BX = 62, BZ = 89.4, H = 9, Bm = 2.25, W = -1.6, t = (x) => (BX - x) / H;
  const sheer = (x) => W + 0.95 + 0.35 * t(x) ** 2 + 0.7 * t(x) ** 6, half = (x) => Bm * (1 - 0.5 * Math.abs(t(x)) ** 2.6), deck = (x) => sheer(x) - 0.3;
  const bank = 92, by = 0.04;
  const planks = [57.5, 55.3].map((x) => ({ a: [x, sheer(x) + 0.06, BZ + half(x) - 0.12], b: [x, by + 0.06, bank + 1.0] }));
  for (const p of planks) S.push({ t: 'gangplank', ...p, w: 0.42 });
  S.push({ t: 'mooring', a: [50.6, by, bank + 1.3], b: [BX - H + 0.4, sheer(BX - H + 0.4) - 0.05, BZ + 0.6] });
  S.push({ t: 'mooring', a: [73.2, by, bank + 1.3], b: [BX + H - 0.4, sheer(BX + H - 0.4) - 0.05, BZ + 0.6] });
  S.push({ t: 'sack_pile', at: [59.6, BZ - 0.2], y: deck(59.6), rot: Math.PI / 2, rows: [3, 2] });
  S.push({ t: 'sack_pile', at: [56.4, BZ - 0.6], y: deck(56.4), rot: Math.PI / 2, rows: [2, 1] });
  S.push({ t: 'sack_pile', at: [58.6, bank + 4.2], y: by, rot: 0, rows: [5, 4, 3, 2] });
  S.push({ t: 'sack_pile', at: [62.4, bank + 4.0], y: by, rot: 0.1, rows: [4, 3] });
  let seed = 1120;
  const man = (at, y, dir, o = {}) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: seed++ * 6113, dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'none', carry: 'none', pose: 'stand', ...o });
  const on = (p, f) => [[p.a[0], p.a[2] + (p.b[2] - p.a[2]) * f], p.a[1] + (p.b[1] - p.a[1]) * f + 0.035];
  // up the first plank with a sack on the shoulder; down the second empty-handed
  { const [at, y] = on(planks[0], 0.45); man(at, y, [0, 1], { carry: 'sack', cloth: 'cloth_grey', top: 'bare' }); }
  { const [at, y] = on(planks[1], 0.6); man(at, y, [0, -1], { cloth: 'cloth_brown', hat: 'straw' }); }
  // on the deck: one stooping to the heap, one lifting a sack to his shoulder
  man([58.4, BZ + 0.9], deck(58.4), [0, -1], { pose: 'squat', cloth: 'cloth_white' });
  man([57.6, BZ + 1.5], deck(57.6), [0, 1], { carry: 'sack', cloth: 'cloth_brown', top: 'bare' });
  // on the bank: carrying sacks to the heap, one setting his down, the clerk with his tally, a porter going back
  man([57.0, bank + 2.2], by, [0.3, 1], { carry: 'sack', cloth: 'cloth_white' });
  man([60.6, bank + 3.4], by, [-0.5, 1], { pose: 'squat', cloth: 'cloth_grey', top: 'bare' });
  man([64.6, bank + 2.8], by, [-1, -0.4], { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_black', pose: 'talk' });
  man([55.9, bank + 4.6], by, [0, -1], { cloth: 'cloth_brown', hat: 'straw' });
  // the boatman on the stern deck, leaning on his pole
  man([BX + 6.8, BZ - 0.5], deck(BX + 6.8) + 0.1, [-1, 0.3], { cloth: 'cloth_indigo', hat: 'straw', carry: 'staff' });
  // the tax office by the gate road inside the wall (§10, Tax office): goods waiting at its door to be taxed, the official
  // at his table under the eaves writing them into the register, the merchants waiting, a porter resting on his load
  const tz = -84.2, tx = -282;
  S.push({ t: 'sack_pile', at: [tx - 2.6, tz + 1.6], y: 0.04, rot: Math.PI / 2, rows: [3, 2] });
  S.push({ t: 'sack_pile', at: [tx + 2.9, tz + 1.4], y: 0.04, rot: Math.PI / 2 + 0.15, rows: [2, 1] });
  S.push({ t: 'block', rect: [tx - 0.8, tz + 0.25, tx + 0.8, tz + 0.95], y0: 0.04, y1: 0.78, mat: 'wood_dark', collide: true });
  S.push({ t: 'block', rect: [tx - 0.85, tz + 0.2, tx + 0.85, tz + 1.0], y0: 0.78, y1: 0.82, mat: 'timber', collide: false });
  S.push({ t: 'block', rect: [tx - 0.3, tz + 0.45, tx + 0.1, tz + 0.75], y0: 0.82, y1: 0.86, mat: 'paint_white', collide: false });
  S.push({ t: 'block', rect: [tx + 0.25, tz + 0.5, tx + 0.37, tz + 0.62], y0: 0.82, y1: 0.85, mat: 'granite_black', collide: false });
  S.push({ t: 'block', rect: [tx - 0.25, tz - 0.45, tx + 0.25, tz + 0.0], y0: 0.04, y1: 0.48, mat: 'wood_dark', collide: false });
  man([tx, tz - 0.2], 0.04, [0, 1], { pose: 'sit', dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', beard: true });
  man([tx - 0.4, tz + 1.9], 0.04, [0.2, -1], { dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'brim', pose: 'talk' });
  man([tx + 0.7, tz + 2.3], 0.04, [-0.3, -1], { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_indigo', hat: 'cap', hatMat: 'cloth_black' });
  man([tx + 3.3, tz + 2.6], 0.04, [-1, -0.2], { pose: 'squat', cloth: 'cloth_white', hat: 'straw' });
  return [base('song-kaifeng-landing', S), base('song-kaifeng-landing-life', L, 'life')];
}

/** The river's banks beyond the stone ones, the stone steps by the bridge, the lanes' paving. */
function waterside() {
  const E = [], RW = RADIUS - 26, half = (z) => Math.sqrt(Math.max(0, RW * RW - z * z));
  for (const bank of ['n', 's']) {
    const e = bank === 'n' ? RIVER.z0 : RIVER.z1, h = half(e) - 4;
    const gaps = WHARVES.filter((w) => w.bank === bank).map((w) => w.x).sort((a, b) => a - b);
    for (const [lo, hi] of [[-h, -STONE_BANK], [STONE_BANK, h]]) {
      let x = lo;
      for (const g of gaps.filter((g) => g > lo && g < hi)) { if (g - 3.2 > x + 2) E.push({ t: 'bian_revetment', x0: x, x1: g - 3.2, bank }); x = g + 3.2; }
      if (hi > x + 2) E.push({ t: 'bian_revetment', x0: x, x1: hi, bank });
    }
    for (const w of WHARVES) if (w.bank === bank && Math.abs(w.x) < h) E.push({ t: 'wharf', x: w.x, bank });
  }
  for (const s of STEPS) {
    const n = s.bank === 'n', z = n ? RIVER.z0 + 0.4 : RIVER.z1 - 0.4;
    E.push({ t: 'water_steps', a: [s.x - 2.5, z], b: [s.x + 2.5, z], dir: [0, n ? 1 : -1], y: 0.05, water: RIVER.water, double: false, moor: true });
  }
  // (the lanes are earth: ground.js)
  return base('song-kaifeng-waterside', E, 'kaifeng-site');
}

import { streetPlans } from './street.js';

export async function town() {
  const plans = [], groups = new Map();
  for (const l of lots()) {
    if (l.kind === 'tea') continue;
    const k = l.det + ':' + (l.rect[0] < 0 ? 'w' : 'e') + (l.rect[1] < 76 ? 'n' : 's');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(l);
  }
  const furnished = furnishedLots();
  for (const [k, all] of [...groups].sort()) for (let i = 0; i < all.length; i += 120) plans.push(base(`song-kaifeng-houses-${k.replace(':', '-')}-${i / 120}`, all.slice(i, i + 120).map((l) => ({ t: 'house_song', y: 0, ...l, trade: tradeOf(l) ?? l.trade, furnished: furnished.has(l) })), 'kaifeng-site'));
  plans.push(waterside(), ...scroll(), ...landing());
  // the shops' signs on their poles and goods in the street; the rooms of the shops, wine shops and tea shops furnished, their people
  plans.push(base('song-kaifeng-shops', shopElements(), 'life'));
  plans.push(base('song-kaifeng-interiors', interiorElements()));
  plans.push(base('song-kaifeng-interior-life', interiorLife(), 'life'));
  plans.push(...streetPlans(base));
  return plans;
}
