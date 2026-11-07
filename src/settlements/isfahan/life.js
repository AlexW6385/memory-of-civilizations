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
  // the open house: the master of the house on the talar's carpet, a servant in the court
  { const [x0, z0, x1, z1] = OPEN_HOUSE().rect, cx = (x0 + 3.6 + x1 - 3.8) / 2; person([cx - 1.4, z0 + 1.9], Math.PI, { man: true, pose: 'cross', y: 0.47, cloth: 'cloth_green', cloth2: 'cloth_white' }); person([x1 - 4.6, z1 - 4.4], Math.PI / 2, { man: true, cloth: 'cloth_white' }); }
  return L;
}
export const lifePlan = () => ({ id: 'isfahan-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
