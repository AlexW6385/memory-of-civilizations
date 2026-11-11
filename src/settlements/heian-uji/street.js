// The things of Uji's lanes (docs/settlements/heian-uji.md §15): at the fronts the wash on its line, firewood against the
// wall, drying trays, hens and dogs in the lanes, a draw-well with its roof at the crossings, haystacks behind; the
// market (ichi) on the south approach with its stalls and mats of goods and the people at them; the ferry landing on the
// river with its steps, boats, washers and fishermen. Everything derives from layout.js. Instances of the life style.
import { STREETS, MARKET, LANDING, RIVER, lots, height, inRect, streetRect, onStreet } from './layout.js';
import { RADIUS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const base = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'e' }, ...extra });
const tiled = (id, style, list, near = 230) => {
  const tiles = new Map();
  for (const e of list) { const [x, z] = e.at ?? [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.b[1]) / 2]; const k = `${Math.floor(x / 100)},${Math.floor(z / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, l]) => { const [i, j] = k.split(',').map(Number); return { ...base(`${id}-${k}`, style, l), center: [i * 100 + 50, j * 100 + 50], near }; });
};

/** A lot's front: P(t, off) a point at fraction t along it, off out into the lane; rot turns an object's +z outward. */
function frontOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, n = FR[f], along = f === 'n' || f === 's';
  const P = (t, off) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) + n[1] * off] : [(f === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t]);
  return { P, n, L: along ? x1 - x0 : z1 - z0, rot: Math.atan2(n[0], n[1]) };
}
const free = (L, p, m = 1.2) => !L.some((q) => Math.hypot(q.at[0] - p[0], q.at[1] - p[1]) < m);

function laneLife() {
  const L = [], F = [], rand = rng(2077), seed = () => Math.floor(rand() * 1e9);
  const all = lots();
  for (const l of all) {
    const f = frontOf(l), [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (Math.hypot(cx, cz) > RADIUS - 40) continue;
    const back = [-f.n[0], -f.n[1]], side = (t, off) => f.P(t, off);
    // the wash on its line in the yard behind the house, firewood against the side
    if (rand() < 0.38) { const p = [cx + back[0] * ((f.n[0] ? x1 - x0 : z1 - z0) / 2 + 2.6), cz + back[1] * ((f.n[1] ? z1 - z0 : x1 - x0) / 2 + 2.6)]; L.push({ t: 'laundry', at: p, y: 0, rot: f.rot + Math.PI / 2, len: 3 + rand(), seed: seed() }); }
    if (rand() < 0.4) L.push({ t: 'firewood', at: f.P(0.1 + rand() * 0.8, -0.75), y: 0, rot: f.rot, len: 1.4, seed: seed() });
    if (rand() < 0.3) L.push({ t: 'drying_tray', at: f.P(0.2 + rand() * 0.6, -1.5), y: 0, rot: rand() * 6.28, seed: seed() });
    if (rand() < 0.22) L.push({ t: 'chickens', at: f.P(rand(), -2.2), y: 0, rot: rand() * 6.28, seed: seed() });
    if (rand() < 0.07) L.push({ t: 'animal', kind: 'dog', at: f.P(rand(), -2.6), y: 0, rot: rand() * 6.28, seed: seed() });
    if (l.trade === 'farmer' && rand() < 0.35) L.push({ t: 'haystack', at: [cx + back[0] * ((f.n[0] ? x1 - x0 : z1 - z0) / 2 + 4.5), cz + back[1] * ((f.n[1] ? z1 - z0 : x1 - x0) / 2 + 4.5)], y: 0, kind: 'pole', seed: seed(), s: 0.6 });
    if (rand() < 0.1) L.push({ t: 'barrel', at: f.P(0.9, -0.8), y: 0, rot: 0, n: 2, seed: seed() });
  }
  // fences in the gaps between fronts that are not cross-lanes
  const bySide = new Map();
  for (const l of all) { const k = l.street + l.front; if (!bySide.has(k)) bySide.set(k, []); bySide.get(k).push(l); }
  for (const list of bySide.values()) {
    const horiz = list[0].front === 's' || list[0].front === 'n', i0 = horiz ? 0 : 1;
    list.sort((a, b) => a.rect[i0] - b.rect[i0]);
    for (let i = 0; i + 1 < list.length; i++) {
      const a = list[i].rect, b = list[i + 1].rect, g = b[i0] - a[i0 + 2];
      if (g < 0.9 || g > 4.2) continue;
      const fr = list[i].front, ez = fr === 's' ? Math.max(a[3], b[3]) : fr === 'n' ? Math.min(a[1], b[1]) : null, ex = fr === 'e' ? Math.max(a[2], b[2]) : fr === 'w' ? Math.min(a[0], b[0]) : null;
      F.push(horiz ? { t: 'wattle', a: [a[2], ez], b: [b[0], ez], y: 0, h: 1.2 } : { t: 'wattle', a: [ex, a[3]], b: [ex, b[1]], y: 0, h: 1.2 });
    }
  }
  // the wells: at the crossings of the roads, a draw-well with a little roof (tsurube)
  const H = STREETS.filter((s) => s.a[1] === s.b[1]), V = STREETS.filter((s) => s.a[0] === s.b[0]);
  for (const h of H) for (const v of V) {
    const x = v.a[0], z = h.a[1];
    if (x < Math.min(h.a[0], h.b[0]) || x > Math.max(h.a[0], h.b[0]) || z < Math.min(v.a[1], v.b[1]) || z > Math.max(v.a[1], v.b[1])) continue;
    if (Math.hypot(x, z) > RADIUS - 60 || lots().some((l) => inRect(l.rect, x + 4, z + 4, 1.5))) { if (Math.hypot(x, z) > RADIUS - 60) continue; }
    const p = [x + 4.6, z + 4.6];
    if (!all.some((l) => inRect(l.rect, p[0], p[1], 1.5)) && Math.abs(height(p[0], p[1])) < 1) L.push({ t: 'well', at: p, y: 0, kind: 'pulley', roof: true, square: true, mat: 'limestone', seed: seed() });
  }
  return [L, F];
}

const CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_ochre'];
function market() {
  const L = [], P = [], rand = rng(3011), seed = () => Math.floor(rand() * 1e9);
  const [x0, z0, x1, z1] = MARKET, goods = [['heap', 'greens', 'melons'], ['baskets', 'bolts'], ['pottery', 'fish'], ['bread', 'greens'], ['baskets', 'heap']];
  // two rows of stalls under cloth awnings facing the middle, mats of goods on the ground between, the sellers and buyers
  for (let i = 0, x = x0 + 3; x < x1 - 3; i++, x += 5.2) {
    for (const [z, face] of [[z0 + 3, 1], [z1 - 3, -1]]) {
      L.push({ t: 'stall', at: [x, z], y: 0, rot: face > 0 ? 0 : Math.PI, w: 2.6, d: 1.2, awning: CL[(i + (face > 0 ? 0 : 2)) % CL.length], goods: goods[(i + (face > 0 ? 1 : 3)) % goods.length], seed: seed() });
      P.push({ at: [x, z - face * 0.2], rot: face > 0 ? 0 : Math.PI, pose: 'stand', c: CL[(i + 1) % CL.length], woman: i % 2 === 0 });
    }
    L.push({ t: 'goods_mat', at: [x + 1.6, (z0 + z1) / 2 + (i % 2 ? 1.5 : -1.5)], y: 0, rot: Math.PI * (i % 2), goods: ['baskets', 'heap', 'pottery'], seed: seed() });
  }
  for (let k = 0; k < 9; k++) P.push({ at: [x0 + 5 + rand() * (x1 - x0 - 10), z0 + 8 + rand() * (z1 - z0 - 16)], rot: rand() * 6.28, pose: 'stand', c: CL[k % CL.length], woman: k % 3 === 0, carry: k % 4 === 0 ? 'basket' : 'none' });
  L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'ox', at: [x1 + 3, z0 + 12], y: 0, rot: 1.2, seed: seed() });
  L.push({ t: 'well', at: [(x0 + x1) / 2, (z0 + z1) / 2], y: 0, kind: 'pulley', roof: true, square: true, mat: 'limestone', seed: seed() });
  return [L, P];
}

function landing() {
  const L = [], E = [], [lx, lz] = LANDING.steps, W = RIVER.level, rand = rng(4101), seed = () => Math.floor(rand() * 1e9);
  const bankX = riverX(lz) - RIVER.w / 2 + 4;
  // a stage of planks on piles out over the water, steps of stone down to it, mooring posts
  const x0 = bankX - 2, x1 = bankX + 6;
  E.push({ t: 'block', rect: [x0, lz - 1.6, x1, lz + 1.6], y0: W + 0.25, y1: W + 0.4, mat: 'timber', collide: false });
  for (const dz of [-1.5, 1.5]) for (const x of [x0 + 0.3, (x0 + x1) / 2, x1 - 0.3]) E.push({ t: 'block', rect: [x - 0.1, lz + dz - 0.1, x + 0.1, lz + dz + 0.1], y0: RIVER.bed, y1: W + 0.9, mat: 'bark_dark', collide: false });
  for (const dz of [-2.4, 2.4]) E.push({ t: 'block', rect: [x1 - 0.1, lz + dz - 0.1, x1 + 0.1, lz + dz + 0.1], y0: RIVER.bed, y1: W + 1.2, mat: 'bark_dark', collide: false });
  const boat = (kind, at, rot, len) => L.push({ t: 'boat', kind, at, y: W, rot, len, seed: seed() });
  boat('barge', [x1 + 2.2, lz - 5.5], Math.PI / 2 + 0.05, 11); boat('rowboat', [x1 + 2.5, lz + 3.8], Math.PI / 2 - 0.12, 4.5); boat('rowboat', [x1 + 4, lz + 7.5], Math.PI / 2 + 0.2, 4.5);
  const person = (x, z, rot, y, extra) => L.push({ t: 'figure', at: [x, z], y, rot, seed: seed(), dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'straw', skin: 'skin_medium', carry: 'none', pose: 'stand', ...extra });
  person(x0 + 1.2, lz - 0.6, 0, W + 0.4, { pose: 'squat', dress: 'robe', hair: 'long', hat: 'none', cloth: 'cloth_indigo', cloth2: 'cloth_white' });     // washing
  person(x0 + 2.6, lz + 0.9, Math.PI / 2, W + 0.4, { pose: 'squat', dress: 'robe', hair: 'long', hat: 'none', cloth: 'cloth_ochre', cloth2: 'cloth_white' });
  person(x1 - 0.8, lz, -Math.PI / 2, W + 0.4, { cloth: 'cloth_indigo' });
  L.push({ t: 'basket', at: [x0 + 1.9, lz - 0.2], y: W + 0.4, n: 2, seed: seed() }); L.push({ t: 'sacks', at: [x0 + 4, lz + 1.1], y: W + 0.4, n: 4, rot: 0, seed: seed() });
  L.push({ t: 'laundry', at: [x0 - 3.5, lz - 3.5], y: height(x0 - 3.5, lz - 3.5), rot: 0, len: 3.2, seed: seed() });
  // timber floated down from the hills, bound in rafts, at the bank above the landing
  for (let k = 0; k < 2; k++) for (let j = 0; j < 6; j++) E.push({ t: 'block', rect: [riverX(lz - 22 - k * 5) - 3.5, lz - 22 - k * 5 + j * 0.42, riverX(lz - 22 - k * 5) + 3.5, lz - 22 - k * 5 + j * 0.42 + 0.34], y0: W - 0.1, y1: W + 0.22, mat: 'bark_dark', collide: false });
  return [E, L];
}

export function lanesPlan() {
  const [L, F] = laneLife(), [ML, MP] = market(), [LE, LL] = landing(), out = [];
  out.push(...tiled('heian-uji-lanes', 'life', L));
  out.push({ ...base('heian-uji-fences', 'japanese', F), near: 160, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS] });
  out.push(...tiled('heian-uji-market', 'life', ML, 260));
  const fig = MP.map((p, i) => ({ t: 'figure', at: p.at, y: 0, rot: p.rot, seed: 9100 + i * 37, dress: p.woman ? 'robe' : 'trousers', hair: p.woman ? 'long' : 'topknot', hat: p.woman ? 'none' : (i % 2 ? 'straw' : 'cap'), hatMat: 'cloth_black', cloth: p.c, cloth2: 'cloth_brown', skin: 'skin_medium', carry: p.carry || 'none', pose: 'stand' }));
  out.push(base('heian-uji-marketfolk', 'life', [...fig, ...LL]));
  out.push(base('heian-uji-landing', 'japanese', LE, { bounds: [LANDING.steps[0] - 30, LANDING.steps[1] - 40, LANDING.c[0] + 40, LANDING.steps[1] + 20], entrance: { at: [LANDING.steps[0], LANDING.steps[1]], facing: 'e' } }));
  return out;
}
void onStreet; void streetRect; void faceTo; void free;
