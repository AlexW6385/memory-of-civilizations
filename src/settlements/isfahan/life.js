// The square's life about 1630 (docs/settlements/isfahan.md §5, §15): horses held by grooms at both ends of the polo
// field, by the stone goalposts; the guard's horses before Ali Qapu; people at the Qeysarieh portal and on the walks.

import { RADIUS, SQUARE, CANAL, ALIQAPU, BAZAAR, OPEN_HOUSE } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function life() {
  const rand = rng(1630), L = [], pick = (a) => a[Math.floor(rand() * a.length)], [sx0, sz0, sx1, sz1] = SQUARE;
  /** A man in a long robe with a sash and a turban (the Qizilbash's red one now and then), or a woman wrapped and veiled. */
  const person = (at, rot, o = {}) => {
    const woman = !o.man && rand() < 0.25;
    L.push({ t: 'figure', at, y: 0.04, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_medium' : 'skin_light', dress: 'robe',
      ...(woman ? { cloth: pick(['cloth_black', 'cloth_indigo', 'cloth_white']), cloth2: 'cloth_white', hat: 'veil', hair: 'long' }
        : { cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown']), cloth2: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), over: 'sash', hat: 'turban', hatMat: rand() < 0.3 ? 'cloth_red' : pick(['cloth_white', 'cloth_ochre']), hair: 'short', beard: true }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the polo field's two ends: horses held by grooms beside the goalposts, riders waiting by them
  const q0 = sz0 + CANAL, q1 = sz1 - CANAL;
  for (const [zEnd, face] of [[q0 + 14, Math.PI], [q1 - 14, 0]]) {
    for (const x of [-36, -29, -22, 22, 29, 36]) {
      const at = [x + (rand() - 0.5), zEnd + (rand() - 0.5) * 3], rot = face + (rand() - 0.5) * 0.6;
      L.push({ t: 'animal', kind: 'horse', at, y: 0.04, rot, seed: Math.floor(rand() * 1e9) });
      person([at[0] + 0.9, at[1] + (face ? -0.6 : 0.6)], rot, { man: true, pose: 'stand' });
      if (rand() < 0.5) person([at[0] - 1.1, at[1]], rot + Math.PI / 2, { man: true, pose: 'talk' });
    }
  }
  // the guard's horses before Ali Qapu
  const ax = ALIQAPU.rect[2] + 7;
  for (const z of [-48, -44, -36, -32]) { L.push({ t: 'animal', kind: 'horse', at: [ax, z], y: 0.04, rot: -Math.PI / 2, seed: Math.floor(rand() * 1e9) }); person([ax + 0.8, z + 0.7], -Math.PI / 2, { man: true, cloth: 'cloth_red', hatMat: 'cloth_red' }); }
  // people before the Qeysarieh portal and along the walks by the arcades
  for (let k = 0; k < 10; k++) person([(rand() - 0.5) * 24, sz0 + 3 + rand() * 7], rand() * 6.28);
  for (let k = 0; k < 16; k++) { const side = rand() < 0.5 ? sx0 + 3 + rand() * 6 : sx1 - 3 - rand() * 6; person([side, sz0 + 30 + rand() * (sz1 - sz0 - 60)], rand() < 0.5 ? 0 : Math.PI); }
  // the bazaar (§16): a shopkeeper sitting cross-legged on the platform of each shop among his wares, buyers in the
  // street before them, porters (hammal) with loads on their backs, a donkey with panniers led through
  const blen = BAZAAR.z0 - BAZAAR.z1, nb = Math.max(1, Math.round(blen / 5)), bw = blen / nb;
  for (const sd of [-1, 1]) for (let i = 0; i < nb; i++) {
    const zc = BAZAAR.z0 - (i + 0.5) * bw;
    if (rand() < 0.85) person([sd * 4.2, zc + 1.1], sd * Math.PI / 2, { man: true, pose: 'cross', y: 0.45 });
    if (rand() < 0.35) person([sd * 1.2, zc + (rand() - 0.5) * 2], sd * Math.PI / 2 + (rand() - 0.5) * 0.5);
  }
  for (let k = 0; k < 4; k++) person([(rand() - 0.5) * 2.4, BAZAAR.z0 - 8 - rand() * (blen - 16)], rand() < 0.5 ? 0 : Math.PI, { man: true, carry: rand() < 0.5 ? 'sack' : 'bundle', loadCloth: pick(['sacking', 'cloth_brown', 'cloth_indigo']) });
  L.push({ t: 'animal', kind: 'donkey', at: [0.6, BAZAAR.z0 - 40], y: 0.04, rot: 0, seed: Math.floor(rand() * 1e9), gear: true });
  person([0.6, BAZAAR.z0 - 38.6], 0, { man: true, pose: 'stand', cloth: 'cloth_brown' });
  // a caravan come in at the bazaar's north end: camels with their pack saddles and bales, kneeling and standing, the
  // cameleers; donkeys loaded with panniers (§16)
  for (let k = 0; k < 5; k++) L.push({ t: 'animal', kind: 'camel', at: [-6 + k * 3.2, BAZAAR.z1 - 9 - (k % 2) * 2.5], y: 0.04, rot: Math.PI / 2 + (rand() - 0.5) * 0.4, seed: Math.floor(rand() * 1e9), gear: k !== 2 });
  for (const [x, z] of [[-8, BAZAAR.z1 - 7], [4, BAZAAR.z1 - 13.5]]) person([x, z], rand() * 6.28, { man: true, pose: 'staff', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  for (const [x, z] of [[9, BAZAAR.z1 - 6], [10.5, BAZAAR.z1 - 8]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: Math.PI * 0.9, seed: Math.floor(rand() * 1e9), gear: true });
  // water carriers (saqqa) at the canal, the waterskin on the back; a porter crossing the square
  for (const [x, z] of [[sx0 + CANAL + 2.2, -120], [sx1 - CANAL - 2.2, 40], [sx0 + CANAL + 2.2, 150]]) person([x, z], x < 0 ? -Math.PI / 2 : Math.PI / 2, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  // the maidan on a market day (docs/settlements/isfahan.md §5; Chardin, Della Valle, Kaempfer: stalls, tents and mats spread over the
  // square, hawkers, storytellers, horses and carts, the polo ground cleared for the match): three rows of awninged stalls across the field
  // before the Shah Mosque's portal with an aisle left down its axis, the sellers behind them and buyers before, goods mats between the
  // rows, carts and laden animals standing at the sides, groups strolling the whole length
  const WARES = [['heap', 'baskets'], ['bread', 'heap'], ['greens', 'melons'], ['pottery', 'pottery'], ['bolts', 'baskets'], ['spice', 'heap'], ['melons', 'greens'], ['bolts', 'bolts']];
  const AWN = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green'], sd = () => Math.floor(rand() * 1e9);
  let wi = 0;
  for (const [zr, dx] of [[188, 0], [203, 4.5], [219, 0], [234, 4.5]]) for (let x = -56 + dx; x <= 56; x += 9) {
    if (Math.abs(x) < 7.5 || rand() < 0.14) continue;
    const g = WARES[wi++ % WARES.length], xx = x + (rand() - 0.5) * 1.2;
    L.push({ t: 'stall', at: [xx, zr], y: 0.04, rot: Math.PI, seed: sd(), awning: pick(AWN), goods: g, w: 2.6, d: 1.3 });
    person([xx + 0.2, zr + 1.2], 0, { man: true, pose: rand() < 0.5 ? 'talk' : 'stand' });
    for (let k = rand() < 0.35 ? 0 : 1; k < 2 + (rand() < 0.5 ? 1 : 0); k++) person([xx + (k - 1.4) * 1.1 + (rand() - 0.5) * 0.6, zr - 1.8 - rand() * 1.2], Math.PI + (rand() - 0.5) * 0.8, { pose: rand() < 0.5 ? 'talk' : 'stand' });
  }
  // goods mats on the ground in the lanes between the rows: a seller seated, the wares before him, a buyer crouched or standing
  for (const zr of [196, 211, 226]) for (let x = -50; x <= 50; x += 12.5) {
    if (Math.abs(x) < 8 || rand() < 0.3) continue;
    const xx = x + (rand() - 0.5) * 3;
    L.push({ t: 'goods_mat', at: [xx, zr], y: 0.04, rot: Math.PI, seed: sd(), goods: pick(WARES), mat: 'reed_mat' });
    person([xx, zr + 0.95], 0, { man: true, pose: 'sit_ground' });
    if (rand() < 0.6) person([xx + (rand() - 0.5), zr - 1.5], Math.PI + (rand() - 0.5) * 0.6, { pose: 'stand' });
  }
  // carts, laden donkeys and camels waiting at the sides of the market, their drivers beside them
  for (const [x, z, k] of [[-61, 196, 'ox'], [60, 212, 'donkey'], [-60, 228, 'donkey'], [62, 192, 'ox']]) {
    L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: k, at: [x, z], y: 0.04, rot: x < 0 ? Math.PI / 2 : -Math.PI / 2, seed: sd() });
    person([x + (x < 0 ? 3.4 : -3.4), z + 1.4], rand() * 6.28, { man: true, pose: 'stand', cloth: 'cloth_brown' });
  }
  for (const [x, z] of [[-63, 207], [-63, 209.2], [63, 222], [64.5, 224], [-62, 238]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0.04, rot: x < 0 ? Math.PI / 2 : -Math.PI / 2, seed: sd(), gear: true });
  for (let k = 0; k < 3; k++) L.push({ t: 'animal', kind: 'camel', at: [-58 + k * 3.4, 242 + (k % 2) * 2], y: 0.04, rot: Math.PI + (rand() - 0.5) * 0.5, seed: sd(), gear: k !== 1 });
  // horses with their riders' grooms on the aisle's edge, a few more held at the south end before the portal
  for (let k = 0; k < 5; k++) { const x = (k % 2 ? 1 : -1) * (9 + k * 0.7), z = 183 + k * 12; L.push({ t: 'animal', kind: 'horse', at: [x, z], y: 0.04, rot: rand() * 6.28, seed: sd(), gear: true }); person([x + 1.0, z + 0.4], rand() * 6.28, { man: true, pose: 'stand', cloth: 'cloth_red', hatMat: 'cloth_red' }); }
  // strollers, in pairs and threes, from the arrival down the field and along the walks: not on the aisle's axis within 6 m of the visitor
  for (let k = 0; k < 34; k++) {
    const x = (rand() - 0.5) * 120, z = 150 + rand() * 98;
    if (Math.hypot(x, z - 170) < 6) continue;
    person([x, z], rand() < 0.5 ? 0 : Math.PI, { pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // the near ground: a storyteller (naqqal) with his circle of listeners seated, goods mats at the two sides, a water seller with his skin
  { const cx = 11, cz = 181; person([cx, cz], -Math.PI / 2, { man: true, pose: 'talk', cloth: 'cloth_indigo', cloth2: 'cloth_white' }); for (let k = 0; k < 7; k++) { const a = 1.8 + k * 0.62; person([cx + 3.2 * Math.cos(a) + 1.5, cz + 2.6 * Math.sin(a)], a + Math.PI, { pose: k % 3 === 0 ? 'cross' : 'sit_ground' }); } }
  for (const [x, z] of [[-9, 183], [-13.5, 179]]) { L.push({ t: 'goods_mat', at: [x, z], y: 0.04, rot: Math.PI, seed: sd(), goods: pick(WARES), mat: 'reed_mat' }); person([x, z + 0.95], 0, { man: true, pose: 'sit_ground' }); }
  person([-5.2, 176], 0.6, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_brown', cloth2: 'cloth_white' });
  // the arcades' fronts, bay by bay from the mosque's end to the Qeysarieh's side of the gap at z 117–123: the shopkeepers' goods spilling onto
  // the walk (bales, jars, carpets hung on lines, baskets, copper), a seller on his mat, a customer, a stall awning here and there
  const nab = Math.round((sz1 - 123) / 7), bw2 = (sz1 - 123) / nab;
  for (const sdx of [-1, 1]) for (let i = 0; i < nab; i++) {
    const zc = 123 + (i + 0.5) * bw2, xw = sdx * (-sx0 - 2.3), face = sdx < 0 ? -Math.PI / 2 : Math.PI / 2, u = rand();
    if (zc > sz1 - 14) continue;
    if (u < 0.3) L.push({ t: 'stall', at: [sdx * (-sx0 - 5.6), zc], y: 0.04, rot: sdx < 0 ? Math.PI / 2 * -1 + Math.PI : Math.PI / 2 * -1, seed: sd(), awning: pick(AWN), goods: pick(WARES), w: 2.6, d: 1.3 });
    else if (u < 0.5) L.push({ t: 'laundry', len: 3.4, at: [xw + sdx * 0.2, zc], y: 0.1, rot: face + Math.PI / 2, seed: sd() });
    else if (u < 0.7) { L.push({ t: 'pot', kind: pick(['pithos', 'water_pot']), n: 3, at: [xw, zc - 1.6], rot: 0, seed: sd() }); L.push({ t: 'basket', n: 2, at: [xw, zc + 1.6], rot: 0, seed: sd() }); }
    else if (u < 0.85) L.push({ t: 'sacks', n: 3, at: [xw, zc + 1.4], rot: face, seed: sd() });
    else L.push({ t: 'crates', n: 2, at: [xw, zc - 1.4], rot: face, seed: sd() });
    if (rand() < 0.55) person([sdx * (-sx0 - 4.4), zc + (rand() - 0.5) * 2.4], face + Math.PI + (rand() - 0.5), { pose: rand() < 0.5 ? 'talk' : 'stand' });
  }
  // the open house: the master of the house on the talar's carpet, a servant in the court
  { const [x0, z0, x1, z1] = OPEN_HOUSE().rect, cx = (x0 + 3.6 + x1 - 3.8) / 2; person([cx - 1.4, z0 + 1.9], Math.PI, { man: true, pose: 'cross', y: 0.47, cloth: 'cloth_green', cloth2: 'cloth_white' }); person([x1 - 4.6, z1 - 4.4], Math.PI / 2, { man: true, cloth: 'cloth_white' }); }
  return L;
}
export const lifePlan = () => ({ id: 'isfahan-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
