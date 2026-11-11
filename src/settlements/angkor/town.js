// The country round Angkor Wat (docs/settlements/angkor.md §6): the moat with its laterite banks,
// the road round it, and the village of houses on stilts among the palms.

import { RADIUS, LEVEL, MOAT, ROAD, CX, T, CAUSEWAY, ENCLOSURE, MARKET, houses, ponds, stores, inRect, inMoat, inBasin, onRoad, inHouse } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';

const base = (id, elements) => ({ id, style: 'khmer', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-206, 0], facing: 'e' } });


function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Where the market is held, west of the moat road, south of the causeway's foot (§14). */
export { MARKET };
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
    return !E.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 7);
  };
  const add = (x, z) => { if (ok(x, z)) E.push({ t: 'sugar_palm', at: [x, z], c: [x, z], r: 0.4, y: 0, s: 0.8 + rand() * 0.35, rot: rand() * 6.28, ladder: rand() < 0.25 }); };
  // on the dykes of the fields: a loose grid of 26 m with each palm thrown off it
  for (let x = -RADIUS; x < RADIUS; x += 26) for (let z = -RADIUS; z < RADIUS; z += 26) { const r = Math.hypot(x, z); if (r > 215 && rand() < 0.55) add(x + (rand() - 0.5) * 14, z + (rand() - 0.5) * 14); }
  // round the houses, two or three to a cluster
  for (const h of houses()) if (rand() < 0.35) { const a = rand() * 6.28, d = 6 + rand() * 5; add((h.rect[0] + h.rect[2]) / 2 + Math.cos(a) * d, (h.rect[1] + h.rect[3]) / 2 + Math.sin(a) * d); }
  // a few in the enclosure's lawns
  for (let k = 0; k < 40; k++) add(ENCLOSURE[0] + 8 + rand() * (ENCLOSURE[2] - ENCLOSURE[0] - 16), ENCLOSURE[1] + 8 + rand() * (ENCLOSURE[3] - ENCLOSURE[1] - 16));
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
    if (rand() < 0.88) woman([at[0] - Math.sin(face) * 0.95, at[1] - Math.cos(face) * 0.95], face + Math.PI + (rand() - 0.5) * 0.3, { pose: rand() < 0.6 ? 'cross' : 'squat' });
  }
  // buyers in the aisles, some with a basket on the head
  for (let k = 0; k < 30; k++) {
    const z = pick([z0 + 6.2, z0 + 18.2, z0 + 12.3, z0 + 24.3]) + (rand() - 0.5) * 1.2, x = x0 + 1.5 + rand() * (x1 - x0 - 3), at = [x, z];
    if (L.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 1.0)) continue;
    (rand() < 0.65 ? woman : man)(at, rand() * 6.28, { pose: rand() < 0.35 ? 'talk' : 'stand', carry: rand() < 0.3 ? pick(['basket', 'pot']) : 'none' });
  }
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
  for (let i = 0; i < all.length; i += 45) plans.push(base(`angkor-village-${i / 45}`, all.slice(i, i + 45).map((h) => ({ t: 'stilt_house', ...h }))));
  const E = [];
  for (const g of granaries) E.push({ t: 'k_granary', ...g });
  for (const s of salas) E.push({ t: 'k_sala', ...s });
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
  carries.forEach((carry, i) => fig([CAUSEWAY.outer[0] + 6 + i * 6.1, (i % 2 ? 1 : -1) * 1.6], 1.0, [1, 0], { dress: 'wrap', top: i % 3 ? 'bare' : '', cloth: ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_white'][i % 4], cloth2: 'cloth_white', hair: i % 2 ? 'bun' : 'short', feet: 'bare', carry }));
  return { ...base('angkor-temple-life', L), style: 'life', center: [CX - 60, 0], near: 300 };
}
export async function town() {
  const P = palms(), { L, K } = market(), plans = [];
  for (let i = 0; i < P.length; i += 120) plans.push(base(`angkor-palms-${i / 120}`, P.slice(i, i + 120)));
  plans.push(base('angkor-road', K), { ...base('angkor-market', L), style: 'life', center: [-222, 10], near: 260 });
  return [moat(), ...village(), templeLife(), ...plans];
}
