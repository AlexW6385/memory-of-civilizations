// The country round Angkor Wat (docs/settlements/angkor.md §6): the moat with its laterite banks,
// the road round it, and the village of houses on stilts among the palms.

import { RADIUS, LEVEL, MOAT, ROAD, CX, T, CAUSEWAY, ENCLOSURE, MARKET, LIBRARIES, houses, ponds, stores, inPond, inRect, inMoat, inBasin, onRoad, inHouse } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import { yardPlans, enclosurePlan } from './yards.js';
import { ENC_PATHS, inShop } from './layout.js';
import { useOf, frontOf } from './uses.js';

const base = (id, elements) => ({ id, style: 'khmer', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-206, 0], facing: 'e' } });


function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Where the market is held, west of the moat road, south of the causeway's foot (§14). */
export { MARKET };
let SHRINES = null;
/** The village shrines (§25): little brick prasats west of the village ponds, doors to the east (toward the water), clear of houses, shops, the road. */
export function shrines() {
  if (SHRINES) return SHRINES;
  SHRINES = [];
  const rand = rng(1170);
  for (const p of ponds().slice(8)) {
    const [x0, z0, x1, z1] = p.rect, at = [x0 - 7.5, (z0 + z1) / 2 + (rand() - 0.5) * 4];
    if (Math.hypot(Math.abs(at[0]) + 3.5, Math.abs(at[1]) + 3) > RADIUS - 26 || inRect(ROAD, at[0], at[1], 10) || (Math.abs(at[1]) < 18 && at[0] < -150) || inRect(MARKET, at[0], at[1], 14)) continue;
    if (houses().some((h) => inRect(h.rect, at[0], at[1], 9)) || inShop(at[0], at[1], 8) || inPond(at[0], at[1], 4) || inMoat(at[0], at[1])) continue;
    SHRINES.push({ at, seed: Math.floor(rand() * 1e6) });
    if (SHRINES.length >= 9) break;
  }
  return SHRINES;
}
export const inShrine = (x, z, m = 0) => shrines().some((s) => Math.abs(s.at[0] - x) < 3.4 + m && Math.abs(s.at[1] - z) < 2.8 + m);

let PADDIES = null;
const PD_STAGES = ['seedling', 'green', 'green', 'ripe', 'plough'];
/** The paddies (§26): plots of 20–30 × 14–22 m on a 52 m lattice in the open country beyond 300 m, between the dykes: { rect, stage, seed }. */
export function paddies() {
  if (PADDIES) return PADDIES;
  PADDIES = [];
  const rand = rng(1180), gr = stores();
  const open = (x, z) => { const r = Math.hypot(x, z); return r > 300 && r < RADIUS - 26 && !inHouse(x, z, 6) && !inPond(x, z, 4) && !inShop(x, z, 5) && !inShrine(x, z, 6) && !gr.granaries.some((g) => Math.hypot(g.at[0] - x, g.at[1] - z) < 7) && !gr.salas.some((q) => inRect(q.rect, x, z, 5)); };
  for (let gx = -RADIUS; gx < RADIUS; gx += 52) for (let gz = -RADIUS; gz < RADIUS; gz += 52) {
    const w = 20 + rand() * 10, d = 14 + rand() * 8, seed = Math.floor(rand() * 1e6), st = PD_STAGES[Math.floor(seed / 13) % PD_STAGES.length], keep = rand() < 0.6;
    const x = gx + 6, z = gz + 6;
    if (!keep) continue;
    let ok = true; for (let i = 0; i <= 2 && ok; i++) for (let j = 0; j <= 2; j++) if (!open(x + w * i / 2, z + d * j / 2)) { ok = false; break; }
    if (ok) PADDIES.push({ rect: [x, z, x + w, z + d], stage: st, seed });
  }
  return PADDIES;
}
/** The paddies' elements in tiles drawn near the visitor, and the farmers: women transplanting, a buffalo at the plough, harvesters with headloads. */
function paddyPlans() {
  const rand = rng(1181), K = [], L = [], tiles = new Map(), size = 160;
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const person = (at, dir, o) => L.push({ t: 'figure', at, y: 0, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: ['cloth_brown', 'cloth_indigo', 'cloth_ochre', 'cloth_red'][Math.floor(rand() * 4)], cloth2: 'cloth_white', skin: rand() < 0.5 ? 'skin_medium' : 'skin_dark', hat: 'straw', feet: 'bare', ...o });
  for (const p of paddies()) {
    const [x0, z0, x1, z1] = p.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, alongX = x1 - x0 >= z1 - z0, dir = alongX ? [1, 0] : [0, 1], side = alongX ? [0, 1] : [1, 0];
    const el = { t: 'ak_paddy', rect: p.rect, stage: p.stage, seed: p.seed };
    if (p.stage === 'plough') {
      const sx = cx - dir[0] * 3, sz = cz - dir[1] * 3, rot = faceTo(dir);
      K.push({ t: 'ak_plough', at: [sx, sz], rot });
      L.push({ t: 'animal', kind: 'buffalo', at: [sx, sz], y: 0, rot, seed: p.seed });
      person([sx - dir[0] * 3.3, sz - dir[1] * 3.3], dir, { hair: 'short', h: 1.64, pose: 'staff', carry: 'staff', len: 1.7, staffMat: 'timber', hat: 'straw' });
    } else if (p.stage === 'seedling') {
      // three women bent at the planting, in a line across the plot, facing along the rows
      for (let k = -1; k <= 1; k++) person([cx + side[0] * k * 2.2, cz + side[1] * k * 2.2], dir, { hair: 'bun', h: 1.5, pose: 'squat' });
    } else if (p.stage === 'ripe' && rand() < 0.7) {
      for (let k = 0; k < 2; k++) person([x0 - 1.2 + (alongX ? k * 3 : 0), z0 - 1.2 + (alongX ? 0 : k * 3)], dir, { hair: 'bun', h: 1.52, pose: 'stand', carry: 'basket' });
    }
    const key = `${Math.floor(cx / size)},${Math.floor(cz / size)}`;
    if (!tiles.has(key)) tiles.set(key, []);
    tiles.get(key).push(el);
  }
  const plans = [...tiles].map(([k, l]) => { const [i, j] = k.split(',').map(Number); return { ...base(`angkor-paddies-${k}`, l), center: [i * size + size / 2, j * size + size / 2], near: 260 }; });
  return { plans, K, L };
}

/**
 * The sugar palms (§14): standing singly along the rice-field dykes and among the houses, a few in the
 * enclosure; one in four with the tapper's bamboo ladder tied up it. None on the water, the road, the
 * causeways, the temple, the market or within 2.5 m of a house.
 */
function palms() {
  const rand = rng(1296), E = [];
  const ok = (x, z) => {
    const r = Math.hypot(x, z);
    if (r > RADIUS - 12 || inMoat(x, z) || inBasin(x, z) || onRoad(x, z) || inHouse(x, z, 2.5)) return false;
    if (inRect(T.base.rect, x, z, 8) || inRect(CAUSEWAY.inner, x, z, 6) || inRect(CAUSEWAY.outer, x, z, 6) || inRect(MARKET, x, z, 4) || inRect(MOAT.outer, x, z, 3) && !inRect(MOAT.inner, x, z, -3)) return false;
    if (Math.abs(z) < 8 && x < -150) return false;                                  // the approach
    if (inShrine(x, z, 5) || inShop(x, z, 3) || ENC_PATHS.some((p) => inRect(p, x, z, 2))) return false;
    return !E.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 7);
  };
  const add = (x, z) => { if (ok(x, z)) E.push({ t: 'sugar_palm', at: [x, z], c: [x, z], r: 0.4, y: 0, s: 0.8 + rand() * 0.35, rot: rand() * 6.28, ladder: rand() < 0.25 }); };
  // on the dykes of the fields: a loose grid of 26 m with each palm thrown off it
  for (let x = -RADIUS; x < RADIUS; x += 26) for (let z = -RADIUS; z < RADIUS; z += 26) { const r = Math.hypot(x, z); if (r > 215 && rand() < 0.38) add(x + (rand() - 0.5) * 14, z + (rand() - 0.5) * 14); }
  // round the houses, two or three to a cluster
  for (const h of houses()) if (rand() < 0.35) { const a = rand() * 6.28, d = 6 + rand() * 5; add((h.rect[0] + h.rect[2]) / 2 + Math.cos(a) * d, (h.rect[1] + h.rect[3]) / 2 + Math.sin(a) * d); }
  // a few in the enclosure's lawns
  for (let k = 0; k < 28; k++) add(ENCLOSURE[0] + 8 + rand() * (ENCLOSURE[2] - ENCLOSURE[0] - 16), ENCLOSURE[1] + 8 + rand() * (ENCLOSURE[3] - ENCLOSURE[1] - 16));
  return E;
}
/**
 * The market and the road (§14), as Zhou Daguan saw the city in 1296: "There is a market every day from
 * around six in the morning until midday. There are no stalls, only a kind of mat laid out on the
 * ground"; "the local people who know how to trade are all women". Rows of mats with the women sitting
 * behind their goods, buyers among them; on the moat road a minister on his elephant with his
 * parasol-bearer walking beside, a lady in a palanquin slung from a pole on two bearers' shoulders under a
 * parasol, a second elephant with its mahout; buffalo and an ox-cart by the fields.
 */
function market() {
  const rand = rng(1297), L = [], K = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const AR = ARRIVALS.angkor;
  const fig = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: pick(['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_white', 'cloth_indigo']), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', feet: 'bare', ...o });
  const woman = (at, rot, o = {}) => fig(at, rot, { hair: 'bun', over: rand() < 0.4 ? 'shawl' : 'none', h: 1.5 + rand() * 0.06, ...o });
  const man = (at, rot, o = {}) => fig(at, rot, { hair: rand() < 0.6 ? 'bun' : 'short', beard: false, ...o });
  const [x0, z0, x1, z1] = MARKET;
  // four rows of mats facing aisles that run east–west, a woman behind each
  const GOODS = [['heap', 'greens'], ['fish', 'fish'], ['baskets', 'basket'], ['pottery', 'pot'], ['melons', 'heap'], ['bolts', 'baskets'], ['spice', 'heap']];
  for (const [z, face] of [[z0 + 3, 0], [z0 + 9.5, Math.PI], [z0 + 15, 0], [z0 + 21.5, Math.PI], [z0 + 27, 0]]) for (let x = x0 + 2; x < x1 - 1.5; x += 2.6) {
    if (rand() < 0.18) continue;
    const at = [x + (rand() - 0.5) * 0.4, z];
    L.push({ t: 'goods_mat', at, y: 0.01, rot: face, seed: Math.floor(rand() * 1e9), goods: pick(GOODS), mat: 'reed_mat', produce: ['glaze_yellow', 'cloth_green', 'cloth_red', 'cloth_ochre'], pottery: 'pottery_dark' });
    if (rand() < 0.4) K.push({ t: 'k_shade', at: [at[0] + Math.sin(face) * 0.0, at[1] - Math.cos(face) * 1.25], y: 0, rot: rand() * 6.28, cloth: pick(['reed_mat', 'cloth_ochre', 'cloth_white', 'cloth_red']) });
    if (rand() < 0.88) woman([at[0] - Math.sin(face) * 0.95, at[1] - Math.cos(face) * 0.95], face + Math.PI + (rand() - 0.5) * 0.3, { pose: rand() < 0.6 ? 'cross' : 'squat' });
  }
  // buyers in the aisles, some with a basket on the head
  for (let k = 0; k < 52; k++) {
    const z = pick([z0 + 6.2, z0 + 18.2, z0 + 12.3, z0 + 24.3]) + (rand() - 0.5) * 1.2, x = x0 + 1.5 + rand() * (x1 - x0 - 3), at = [x, z];
    if (L.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 1.0)) continue;
    (rand() < 0.65 ? woman : man)(at, rand() * 6.28, { pose: rand() < 0.35 ? 'talk' : 'stand', carry: rand() < 0.3 ? pick(['basket', 'pot']) : 'none' });
  }
  // baskets and pots stacked at the heads of the rows, a dog among the mats, hens, a water-seller's jars, children
  for (let k = 0; k < 12; k++) { const z = pick([z0 + 6.2, z0 + 18.2, z0 + 12.3, z0 + 24.3]) + (rand() < 0.5 ? 1.5 : -1.5), x = x0 + 1.5 + rand() * (x1 - x0 - 3); if (L.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 1.2)) continue; L.push(rand() < 0.5 ? { t: 'basket', at: [x, z], y: 0, rot: rand() * 6.28, n: 3, seed: Math.floor(rand() * 1e9) } : { t: 'pot', kind: pick(['water_pot', 'dark_pot']), at: [x, z], y: 0, rot: rand() * 6.28, n: 3, seed: Math.floor(rand() * 1e9) }); }
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'dog', at: [x0 + 3 + rand() * (x1 - x0 - 6), z0 + 6.2 + (k % 4) * 6], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  L.push({ t: 'chickens', at: [x0 + 8, z1 + 2], y: 0, rot: 1, n: 5, seed: 1301 }, { t: 'chickens', kind: 'duck', at: [x0 + 24, z1 + 2.5], y: 0, rot: 2, n: 5, seed: 1302 });
  for (let k = 0; k < 6; k++) { const at = [x0 + 3 + rand() * (x1 - x0 - 6), z0 + 3 + rand() * 28]; if (!L.some((e) => Math.hypot(e.at[0] - at[0], e.at[1] - at[1]) < 1)) fig(at, rand() * 6.28, { h: 1.05 + rand() * 0.25, child: true, hair: 'short', pose: 'stand' }); }
  // on the moat road west of the moat, north of the causeway (clear of the arrival): the minister's elephant,
  // its mahout on the neck, the parasol-bearer walking at its side
  const roadX = (ROAD[0] + MOAT.outer[0]) / 2;
  const clear = (x, z) => Math.hypot(x - AR[0], z - AR[2]) > 6;
  const parasolMan = (at, rot, cloth) => {
    const H = 1.62, k = H / 1.65, c = Math.cos(rot), sn = Math.sin(rot), hx = 0.25 * k, hz = -0.07 * k;
    man(at, rot, { h: H, pose: 'staff', carry: 'staff', len: 3.2, staffMat: 'lacquer_red' });
    K.push({ t: 'k_parasol', at: [at[0] + hx * c + hz * sn, at[1] - hx * sn + hz * c], y: 1.1 * k + 0.55 * 3.2 + 0.02, cloth });
  };
  { const at = [roadX, -46];
    if (clear(...at)) {
      L.push({ t: 'animal', kind: 'elephant', at, y: 0, rot: Math.PI, seed: 11500, tusks: 'long', gear: true, cloth: 'cloth_red', howdah: true, mahout: { dress: 'wrap', top: 'bare', cloth: 'cloth_white', hat: 'none', hair: 'bun', legs: undefined } });
      parasolMan([at[0] + 1.9, at[1] + 0.6], Math.PI, 'cloth_red');
      man([at[0] - 1.6, at[1] + 1.8], Math.PI, { pose: 'stand' });
    } }
  // a lady in her palanquin, two bearers at the pole's ends, a parasol carried over her, a maid behind
  { const z = -24, rot = Math.PI;                                                     // going south along the road
    if (clear(roadX, z)) {
      K.push({ t: 'k_palanquin', at: [roadX, z], y: 0, rot: Math.PI / 2, cloth: 'cloth_red' });
      for (const d of [-2.0, 2.0]) man([roadX, z + d], rot, { pose: 'stand', h: 1.62, carry: 'none' });
      woman([roadX + 0.05, z - 0.25], rot, { pose: 'sit_ground', cloth: 'cloth_red', over: 'shawl', y: 0.47 });
      parasolMan([roadX + 1.1, z + 0.4], rot, 'cloth_ochre');
      woman([roadX - 0.9, z - 3.4], rot, { pose: 'stand', carry: 'basket' });
    } }
  // a second elephant, a working one, with only its mahout, coming up the road from the south
  { const at = [roadX, 70]; if (clear(...at)) L.push({ t: 'animal', kind: 'elephant', at, y: 0, rot: 0, seed: 11501, tusks: 'none', mahout: { dress: 'wrap', top: 'bare', cloth: 'cloth_brown', hat: 'none', hair: 'short' } }); }
  // an ox-cart on the road beyond the market, buffalo by the fields
  L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'ox', at: [roadX, 118], y: 0, rot: 0, seed: 1298 });
  man([roadX + 1.2, 115], 0, { pose: 'stand' });
  for (const [x, z] of [[-262, 62], [-258, 66], [-266, 70]]) if (!inHouse(x, z, 2)) L.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  // the life objects need y on the figures (set above); the woman in the palanquin keeps hers
  return { L, K };
}

function moat() {
  const E = [], [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
  for (const r of [[a0, b0, a1, d0], [a0, d1, a1, b1], [a0, d0, c0, -4.75], [a0, 4.75, c0, d1], [c1, d0, a1, d1]]) E.push({ t: 'water_rect', rect: r, y: LEVEL.moat });
  // the banks: steps of laterite down to the water (here a wall with a sandstone coping)
  for (const [p, q] of [[[a0, b0], [a1, b0]], [[a0, b1], [a1, b1]], [[a0, b0], [a0, -4.75]], [[a0, 4.75], [a0, b1]], [[a1, b0], [a1, b1]], [[c0, d0], [c1, d0]], [[c0, d1], [c1, d1]], [[c0, d0], [c0, -4.75]], [[c0, 4.75], [c0, d1]], [[c1, d0], [c1, d1]]]) E.push({ t: 'canal_wall', a: p, b: q, y: 0.1, bed: LEVEL.moatBed, th: 1.6 });
  // the road round the moat, of beaten laterite
  const [r0, s0, r1, s1] = ROAD;
  for (const r of [[r0, s0, r1, b0], [r0, b1, r1, s1], [r0, b0, a0, b1], [a1, b0, r1, b1]]) E.push({ t: 'lane', rect: r, y: 0.03, mat: 'laterite' });
  return base('angkor-moat', E);
}
function village() {
  const all = houses(), plans = [], { granaries, salas } = stores();
  const AR = ARRIVALS.angkor, far = (h) => Math.hypot((h.rect[0] + h.rect[2]) / 2 - AR[0], (h.rect[1] + h.rect[3]) / 2 - AR[2]) > 100;
  // each house, and where it is far enough from the arrival, the use of its front-left corner and the dressing of its front (§24)
  for (let i = 0; i < all.length; i += 45) plans.push(base(`angkor-village-${i / 45}`, all.slice(i, i + 45).flatMap((h) => {
    const e = [{ t: 'stilt_house', ...h }], u = far(h) ? useOf(h) : null, f = far(h) ? frontOf(h) : null;
    if (u) e.push({ t: 'ak_use', ...h, use: u });
    if (f) e.push({ t: 'ak_front', ...h, dress: f });
    return e;
  })));
  const E = [];
  for (const g of granaries) E.push({ t: 'k_granary', ...g });
  for (const s of salas) E.push({ t: 'k_sala', ...s });
  for (const s of shrines()) E.push({ t: 'ak_shrine', ...s });
  // the ponds: water at the pond level, lotus on it
  ponds().forEach((p, i) => { E.push({ t: 'water_rect', rect: p.rect, y: -0.55 }, { t: 'k_lotus', rect: p.rect, y: -0.55, seed: 90 + i }); });
  plans.push(base('angkor-village-stores', E));
  return plans;
}
/**
 * The people of the temple (§12): Brahmin priests in white before the image of Vishnu in the central
 * sanctuary, an attendant with offerings; temple dancers on the Terrace of Honour before the western
 * entrance, their musicians seated by them; devotees crossing the causeway with offerings on their
 * heads and slung from poles.
 */
function templeLife() {
  const L = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 1150;
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: seed++ * 7919, skin: seed % 2 ? 'skin_medium' : 'skin_dark', hat: 'none', ...o });
  const brahmin = { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'bun', over: 'sash', feet: 'bare' };
  // in the cella, before the image (it faces west): a priest at his worship, another behind him, an attendant with flowers
  const fy = T.bakan.y + 0.7;
  fig([CX - 1.75, 0.95], fy, [1, 0], { ...brahmin, pose: 'stand', arms: 'pray' });
  fig([CX - 2.05, -1.2], fy, [1, 0], { ...brahmin, pose: 'kneel', arms: 'pray' });
  L.push({ t: 'basket', at: [CX - 1.05, -1.05], y: fy, seed: 11, goods: 'cloth_white' }, { t: 'pot', at: [CX - 1.05, 1.15], y: fy, seed: 12, kind: 'water_pot' });
  // a priest coming down from the western porch of the sanctuary
  fig([CX - 14.6, 1.8], T.bakan.y, [-1, 0], { ...brahmin, pose: 'stand' });
  // the dancers on the Terrace of Honour (CX − 113 … CX − 99, z ± 12, 1.4 up), off the axis of the approach
  const ty = 1.4;
  // dancing as the apsaras of the reliefs dance: the knees bent and turned out, one foot lifted behind, the hands
  // with their fingers bent back; in the tall three-pointed crown (mkot), a jewelled collar, the short sampot
  // (the crown "with three points", as at Angkor Wat: https://en.wikipedia.org/wiki/Apsara_Dance [stated])
  [[CX - 107.5, -4.2, [0, 1], 'apsara'], [CX - 105.5, -5.6, [0, 1], 'apsara2'], [CX - 107.5, 4.2, [0, -1], 'apsara2'], [CX - 105.5, 5.6, [0, -1], 'apsara']].forEach(([x, z, d, pose], i) => {
    fig([x, z], ty, d, { dress: 'wrap', top: 'bare', cloth: i % 2 ? 'cloth_red' : 'cloth_ochre', cloth2: 'gilt_bronze', hair: 'bun', over: 'wesekh', hat: 'mkot', hatMat: 'gilt_bronze', feet: 'bare', pose, h: 1.55 });
  });
  // their musicians seated by them: an arched harp, drums across the lap, a flute (the harps, drums and flutes of
  // the Angkorian reliefs: https://www.soundsofangkor.org/english/orchestras/old-orchestras-7-16th-c [stated])
  [[CX - 110.5, -8.5, 'harp'], [CX - 109, -9.6, 'drum'], [CX - 110.5, 8.5, 'flute'], [CX - 109, 9.6, 'drum']].forEach(([x, z, pose]) => fig([x, z], ty, [0, -Math.sign(z)], { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_brown', hair: 'short', feet: 'bare', pose }));
  // devotees on the causeway, walking in to the temple with their offerings
  const carries = ['basket', 'pot', 'pole', 'basket', 'none', 'pot', 'basket'];
  // (none within 6 m of the arrival at x -178 on the causeway: the first stands 7 m ahead and well to the side)
  const devX = [-190, -185, -171, -167.5, -162, -156, -152];
  carries.forEach((carry, i) => fig([devX[i], [-1, 1, -2.5, 1.6, -1.4, 2.2, -1.2][i]], 1.0, [1, 0], { dress: 'wrap', top: i % 3 ? 'bare' : '', cloth: ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_white'][i % 4], cloth2: 'cloth_white', hair: i % 2 ? 'bun' : 'short', feet: 'bare', carry }));
  // offering-sellers on the causeway's shoulders between the walkway and the serpent rail: a woman sitting behind her mat of lotus
  // buds and incense, a basket and a jar by her, set 7 m or more from the arrival's stand (x -178)
  [[-165, 3.0, -1, ['greens', 'heap']], [-158.5, -3.0, 1, ['heap', 'baskets']], [-189, -3.0, 1, ['greens', 'heap']], [-193, 3.0, -1, ['baskets', 'pottery']]].forEach(([x, z, d, goods], i) => {
    L.push({ t: 'goods_mat', at: [x, z], y: 1.0, rot: d > 0 ? 0 : Math.PI, seed: 5100 + i, goods, mat: 'reed_mat', produce: ['cloth_red', 'cloth_ochre', 'glaze_yellow', 'cloth_white'], pottery: 'pottery_dark' });
    fig([x, z + d * 0.9], 1.0, [0, d], { dress: 'wrap', top: 'bare', cloth: ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_indigo'][i], cloth2: 'cloth_white', hair: 'bun', over: i % 2 ? 'shawl' : 'none', feet: 'bare', pose: 'cross' });
    L.push({ t: i % 2 ? 'basket' : 'pot', at: [x + 1.1, z], y: 1.0, seed: 5200 + i, n: 2, ...(i % 2 ? { goods: 'cloth_white' } : { kind: 'water_pot' }) });
  });
  // before the western gate (the enclosure's wall at x −150): the gate-keepers either side of the passage with their staves, two
  // pilgrims kneeling in worship before the towers with an offering of flowers set down, a mother with a child by the rail
  for (const z of [-3.3, 3.3]) fig([-154.5, z], 1.0, [1, 0], { dress: 'wrap', top: 'bare', cloth: 'cloth_red', cloth2: 'cloth_white', hair: 'bun', over: 'sash', feet: 'bare', pose: 'staff', carry: 'staff', len: 3.2, staffMat: 'lacquer_red', h: 1.66 });
  fig([-159.2, -0.9], 1.0, [1, 0], { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'bun', feet: 'bare', pose: 'kneel', arms: 'pray' });
  fig([-159.6, 1.3], 1.0, [1, 0], { dress: 'wrap', top: 'bare', cloth: 'cloth_ochre', cloth2: 'cloth_white', hair: 'bun', over: 'shawl', feet: 'bare', pose: 'kneel', arms: 'pray' });
  L.push({ t: 'basket', at: [-157.6, 0.2], y: 1.0, seed: 5301, n: 2, goods: 'cloth_white' });
  fig([-157.2, 3.4], 1.0, [1, -0.4], { dress: 'wrap', top: 'bare', cloth: 'cloth_brown', cloth2: 'cloth_white', hair: 'bun', over: 'shawl', feet: 'bare', pose: 'stand' });
  fig([-156.3, 3.9], 1.0, [1, -0.4], { dress: 'wrap', top: 'bare', cloth: 'cloth_red', cloth2: 'cloth_white', hair: 'short', feet: 'bare', pose: 'stand', child: true, h: 0.95 });
  // teaching in the court of the third gallery: a Brahmin teacher seated on his mat before four pupils in a half circle
  const by = T.base.y;
  for (const [tx, tz, d] of [[CX + 12, -84, 1], [CX + 62, 84, -1], [CX - 22, 84, -1], [CX + 70, -84, 1]]) {
    fig([tx, tz], by, [0, d], { ...brahmin, pose: 'cross', hair: 'bun' });
    for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.55, px = tx + Math.sin(a) * 2.6, pz = tz + d * Math.cos(a) * 2.6; fig([px, pz], by, [tx - px, tz - pz], { dress: 'wrap', top: 'bare', cloth: ['cloth_white', 'cloth_ochre', 'cloth_red'][k % 3], cloth2: 'cloth_white', hair: 'short', feet: 'bare', pose: 'cross', child: k % 2 === 0 }); }
  }
  // pilgrims kneeling in worship and walking round in the court; readers by the libraries
  for (const [px, pz] of [[CX - 30, -96], [CX + 40, -96], [CX - 10, 96], [CX + 90, 20], [CX + 90, -20]]) fig([px, pz], by, [px - CX, pz], { dress: 'wrap', top: 'bare', cloth: 'cloth_ochre', cloth2: 'cloth_white', hair: 'bun', feet: 'bare', pose: 'kneel', arms: 'pray' });
  for (const [px, pz, dz] of [[-120, -24.2, 1], [-120, 24.2, -1]]) { fig([px, pz], 0, [0, -dz], { ...brahmin, pose: 'cross' }); fig([px + 1.2, pz + dz * 0.3], 0, [0, -dz], { ...brahmin, pose: 'cross', hair: 'short' }); }
  // in the libraries (§23): a Brahmin reading at the desk before the shelves, another in worship at the fire pit
  for (const [r, i] of LIBRARIES.map((r, i) => [r, i])) {
    const lx = (r[0] + r[2]) / 2, lz = (r[1] + r[3]) / 2, sg = lz < 0 ? -1 : 1, ly = 1.4 + 0.6;
    fig([lx - 2.4, lz + sg * 1.0], ly, [0, sg], { ...brahmin, pose: 'cross', hair: i ? 'short' : 'bun' });
    fig([lx - 1.35, lz], ly, [1, 0], { ...brahmin, pose: 'stand', arms: 'pray' });
  }
  // priests on the Bakan: at the corner towers, in worship and going about
  for (const [px, pz, pose] of [[CX - 18, -12, 'stand'], [CX + 18, 12, 'stand'], [CX + 14, -20, 'kneel'], [CX - 14, 20, 'kneel']]) fig([px, pz], T.bakan.y, [CX - px, -pz], { ...brahmin, pose, arms: pose === 'kneel' ? 'pray' : 'hang' });
  return { ...base('angkor-temple-life', L), style: 'life', center: [CX - 60, 0], near: 300 };
}
export async function town() {
  const P = palms(), { L, K } = market(), plans = [];
  for (let i = 0; i < P.length; i += 120) plans.push(base(`angkor-palms-${i / 120}`, P.slice(i, i + 120)));
  plans.push(base('angkor-road', K), { ...base('angkor-market', L), style: 'life', center: [-222, 10], near: 260 });
  const PD = paddyPlans();
  plans.push({ ...base('angkor-paddy-tools', PD.K), center: [0, 0], near: 460 }, { ...base('angkor-farmers', PD.L), style: 'life', center: [0, 0], near: 230 });
  return [moat(), enclosurePlan(), ...village(), templeLife(), ...plans, ...PD.plans, ...yardPlans()];
}
