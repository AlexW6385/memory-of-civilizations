// Bianjing's streets (docs/settlements/song-kaifeng.md §5, §10): shops, inns and houses; the wine
// shops' colour gates and wine flags; and the life of the scroll — the crowd on the Rainbow Bridge
// leaning over the railing at the boat lowering its mast, vendors under parasols along the bridge,
// sedan chairs with their bearers, a camel train coming out of the city gate, boatmen on the boats.
import { RADIUS, RIVER, BRIDGE, GATE, WALL_X, lots, bridgeDeck } from './layout.js';
const base = (id, elements, style = 'song') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [160, -130], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_ochre'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

/** The wine shops: the five largest two-storey shops nearest the bridge (the scroll has five colour gates). */
function wineShops() {
  const near = (l) => { const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2; return Math.hypot(cx - BRIDGE.at[0], cz - BRIDGE.at[1]); };
  return lots().filter((l) => l.shop && l.storeys === 2 && l.rect[2] - l.rect[0] > 0 && near(l) < 140).sort((a, b) => near(a) - near(b)).filter((l, i, all) => all.slice(0, i).every((m) => Math.hypot(m.rect[0] - l.rect[0], m.rect[1] - l.rect[1]) > 18)).slice(0, 5);
}
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
    S.push({ t: 'caimen', a: F.a, b: F.b, out: F.out, y: 0.04, h: i === 0 ? 8.6 : 7.2 + rand() * 0.8, boxes: i === 0 ? 2 : 1, seed: i, rect: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)] });
    // the customers at the door, the host under the gate
    const mid = [(F.a[0] + F.b[0]) / 2 + F.out[0] * 0.6, (F.a[1] + F.b[1]) / 2 + F.out[1] * 0.6];
    person(mid, 0, faceTo(F.out), { pose: 'talk', dress: 'robe', cloth: 'cloth_white', hat: 'cap' });
    if (rand() < 0.8) person([mid[0] + F.out[0] * 1.3 + F.out[1] * 0.6, mid[1] + F.out[1] * 1.3 + F.out[0] * 0.6], 0, faceTo([-F.out[0], -F.out[1]]), { pose: 'stand' });
  });
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
  return [base('song-kaifeng-scroll', S), base('song-kaifeng-crowds', L, 'life')];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`song-kaifeng-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'house_jiangnan', y: 0, ...l }))));
  plans.push(...scroll());
  return plans;
}
