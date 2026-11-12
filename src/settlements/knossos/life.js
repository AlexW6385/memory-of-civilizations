// The life of Knossos about 1600 BC (docs/settlements/knossos.md §10): the potter at his wheel in the yard by the
// Royal Road and his boy feeding the kiln; porters bringing jars up the road on their heads and a laden donkey;
// people in the West Court and the Central Court — the men in kilt or loincloth, bare above the belt, long-haired;
// the women in the long flounced skirt; a priestess before the Tripartite Shrine.

import { ROAD, LANE, STREAM, STREAM_LEVEL, WESTCOURT, lanes, lots, openHouses, height, inRect, onStream } from './layout.js';
import { dwellingFrame } from '../../styles/minoan/town.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T0 = 0.5;
export const YARD = [-212, -86.4, -204, -81.0];

export function life() {
  const faceTo = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));            // a figure faces −z at rot 0, and by rot looks along (−sin, −cos)
  const rand = rng(1601), L = [], seed = () => Math.floor(rand() * 1e9);
  const man = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: rand() < 0.5 ? 'shendyt' : 'loincloth',
    cloth: ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 4)], over: 'belt', hair: 'long', beard: 0, feet: 'bare', hat: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe',
    cloth: ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 3)], cloth2: 'cloth_white', over: 'sash', hair: rand() < 0.5 ? 'long' : 'bun', feet: 'bare', hat: 'none', pose: 'stand', ...o });
  // the potter's yard (its floor at the highest corner's ground)
  const yy = Math.max(height(YARD[0], YARD[1]), height(YARD[2], YARD[3]), height(YARD[0], YARD[3]), height(YARD[2], YARD[1])) + 0.02;
  const kx1 = YARD[0] + 2.3, wx = (kx1 + YARD[2]) / 2 + 0.3, wz = YARD[1] + 1.6;
  man([wx, wz + 0.6], 0, { y: yy, pose: 'sit_low', dress: 'loincloth', cloth: 'cloth_white' });
  man([kx1 + 0.75, YARD[3] - 1.2], Math.PI / 2, { y: yy, pose: 'squat', dress: 'loincloth', cloth: 'cloth_brown', h: 1.35, child: true });
  L.push({ t: 'firewood', at: [kx1 + 0.6, YARD[3] - 0.3], y: yy, rot: 0, seed: 3 });
  // the Royal Road: porters with jars on their heads walking toward the palace, a donkey laden with jars and its driver
  for (let x = ROAD.x0 + 40; x < ROAD.x1 - 20; x += 22 + rand() * 30) {
    const z = ROAD.z + (rand() - 0.5) * 1.6, toward = rand() < 0.65;
    if (rand() < 0.22) {
      L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: height(x, z) + 0.12, rot: toward ? -Math.PI / 2 : Math.PI / 2, seed: seed(), gear: true });
      man([x + (toward ? 1.5 : -1.5), z + 0.7], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: 'staff' });
    } else if (rand() < 0.5) woman([x, z], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: 'pot' });
    else man([x, z], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: rand() < 0.6 ? 'pot' : 'sack' });
  }
  // the Royal Road's verge (§4f): a seller's mat of jars and baskets every so often with the seller squatting behind it, a tethered donkey and sacks, a dog asleep in the dust
  for (let x = ROAD.x0 + 70, k = 0; x < ROAD.x1 - 30; x += 38 + rand() * 24, k++) {
    const side = k % 2 ? 1 : -1, z = ROAD.z + side * (ROAD.w / 2 + 1.7), y = height(x, z);
    L.push({ t: 'goods_mat', at: [x, z], y, rot: side > 0 ? 0 : Math.PI, seed: seed(), goods: ['amphora', 'water_pot', 'basket', 'amphora'] });
    woman([x + 0.3, z + side * 1.0], side > 0 ? 0 : Math.PI, { y, pose: 'squat' });
    if (k % 3 === 0) { L.push({ t: 'animal', kind: 'donkey', at: [x + 3.4, z + side * 0.6], y, rot: 1.6, seed: seed(), gear: true }, { t: 'sacks', at: [x + 5.6, z + side * 0.8], y, rot: 0.4, seed: seed(), n: 3 }); }
    else L.push({ t: 'animal', kind: 'dog', at: [x - 2.4, z + side * 0.5], y, rot: rand() * 6, seed: seed() });
  }
  // the West Court (§4f): the official approach — a donkey train unloading jars and sacks at the west, mats of potters and basket-sellers, the procession assembling
  // before the façade (bearers with their jars, the lyre and the flute, the priestess at its head), a bull led across by two handlers, children and dogs
  const Y0 = 0.05, WC = (x, z) => !((x > -119 && x < -64 && z > 36.8 && z < 41.2) || (x > -92.2 && x < -87.8) || (x > -91 && x < -64 && z > -46 && z < -42) || Math.hypot(x + 110, z + 35.5) < 11);
  for (const [x, z, d] of [[-106, 22, 0], [-104.5, 26.4, 1], [-107, 30.5, 0]]) {
    L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: Y0, rot: d ? 2.6 : 3.7, seed: seed(), gear: true });
    man([x + 1.6, z + 0.5], d ? 5.4 : 0.6, { y: Y0, pose: 'stand', carry: rand() < 0.5 ? 'sack' : 'staff' });
  }
  for (const [x, z] of [[-101, 24], [-100, 28]]) { L.push({ t: 'pot', kind: 'pithos', at: [x, z], y: Y0, n: 1, seed: seed() }, { t: 'sacks', at: [x - 0.6, z + 1.4], y: Y0, rot: rand() * 6, seed: seed(), n: 4 }); }
  man([-98.6, 26], 1.2, { y: Y0, pose: 'talk' }); woman([-97.8, 26.8], 4.2, { y: Y0, pose: 'talk' });
  [[-105, -12, 'amphora'], [-100.4, -9.6, 'water_pot'], [-105.4, -4.4, 'basket'], [-99.6, -2.2, 'amphora'], [-104, 5.5, 'basket'], [-99, 8.6, 'water_pot']].forEach(([x, z, g], i) => {
    L.push({ t: 'goods_mat', at: [x, z], y: Y0, rot: (i % 2) * 0.4, seed: seed(), goods: [g, 'pithos' === g ? 'amphora' : g, 'amphora', 'basket'] });
    woman([x + 0.2, z - 1.0], Math.PI + (i % 2) * 0.4, { y: Y0, pose: i % 2 ? 'sit_ground' : 'squat' });
  });
  L.push({ t: 'pot', kind: 'pithos', at: [-96, -14], y: Y0, n: 3, seed: seed() });
  // the procession assembling in the middle of the court: the priestess and the lyre at its head, the bearers in file with jars on the head and rhytons in their hands
  woman([-78, -24], 0, { y: Y0, cloth: 'cloth_indigo', cloth2: 'cloth_ochre', pose: 'stand', carry: 'staff', hair: 'long' });
  man([-81.8, -22], 0.4, { y: Y0, pose: 'lute', dress: 'shendyt', cloth: 'cloth_ochre' }); man([-74.4, -21.4], -0.4, { y: Y0, pose: 'flute', dress: 'shendyt', cloth: 'cloth_indigo' });
  for (let i = 0; i < 8; i++) { const z = -16 + i * 3.0, x = -78 + (i % 2 ? 0.7 : -0.7); (i % 3 === 2 ? woman : i % 3 === 1 ? man : woman)([x, z], 0, { y: Y0, carry: i % 3 === 1 ? 'staff' : 'pot', pose: 'stand', cloth: ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre'][i % 4] }); }
  man([-77.8, 10.5], Math.PI, { y: Y0, pose: 'stand', dress: 'shendyt', cloth: 'cloth_white', cloth2: 'cloth_red', carry: 'staff', over: 'cape', hair: 'long' });
  // a bull led across by two handlers
  L.push({ t: 'animal', kind: 'ox', at: [-70, 24], y: Y0, rot: Math.PI / 2, seed: 4, mat: 'hide_black', graze: false, gear: false, s: 1.12 });
  man([-72.6, 23.2], -Math.PI / 2, { y: Y0, pose: 'pull', carry: 'rope', len: 1.6, dress: 'loincloth' }); man([-67.4, 25.2], Math.PI / 2, { y: Y0, pose: 'stand', carry: 'staff', dress: 'loincloth', cloth: 'cloth_red' });
  for (let k = 0; k < 14; k++) {
    const x = -116 + rand() * 46, z = -46 + rand() * 90;
    if (!WC(x, z) || (Math.abs(x + 78) < 4 && z > -26 && z < 12) || (x < -96 && x > -108 && z > -14 && z < 10) || (x < -94 && x > -110 && z > 20 && z < 32)) continue;
    (rand() < 0.45 ? woman : man)([x, z], rand() * 6.28, { y: Y0, pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  for (const [x, z] of [[-86, 4], [-84.8, 5.2], [-70, -6]]) man([x, z], rand() * 6.28, { y: Y0, pose: 'sit_ground', child: true, h: 1.0 + rand() * 0.2 });
  for (const [x, z] of [[-86, 8], [-112, 2], [-72, 12]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: Y0, rot: rand() * 6.28, seed: seed() });
  // the Central Court (§4f): the bull-leaping rehearsal at its middle — the bull held by two handlers, the youth vaulting it, the girl and the second
  // youth waiting behind, the flute and the lyre; the bearers coming in from the south passage with jars and rhytons; servants at the pithoi under the
  // east portico; the priestesses at the offering table before the Tripartite Shrine; the court ladies in talk by the columns
  const OX = { at: [1.6, -3.2], rot: -Math.PI / 2, s: 1.15, seed: 11 };
  L.push({ t: 'animal', kind: 'ox', at: OX.at, y: 0.05, rot: OX.rot, seed: OX.seed, mat: 'hide_tan', graze: false, gear: false, s: OX.s });
  const fp = (a, b) => faceTo(a, b), bull = [OX.at[0] + 1.0, OX.at[1]];
  for (const [p, q] of [[[3.5, -2.0], 2.4], [[3.5, -4.5], 3.9]]) man(p, fp(p, bull), { y: 0.05, pose: 'pull', carry: 'rope', len: 1.6, dress: 'shendyt', cloth: q === 2.4 ? 'cloth_red' : 'cloth_white' });
  woman([-1.4, -5.6], fp([-1.4, -5.6], OX.at), { y: 0.05, pose: 'stand', arms: 'talk', dress: 'loincloth', cloth: 'cloth_red', top: 'bare', skin: 'skin_light', hair: 'long' });
  man([-1.5, -0.8], fp([-1.5, -0.8], OX.at), { y: 0.05, pose: 'stand', arms: 'talk', dress: 'loincloth', cloth: 'cloth_white', top: 'bare' });
  man([6.6, -6.4], Math.PI / 2 + 0.3, { y: 0.05, pose: 'flute', dress: 'shendyt', cloth: 'cloth_indigo' });
  man([7.3, -0.2], Math.PI / 2 - 0.3, { y: 0.05, pose: 'lute', dress: 'shendyt', cloth: 'cloth_ochre' });
  L.push({ t: 'animal', kind: 'dog', at: [4.8, -0.6], y: 0.05, rot: 2.2, seed: 5 });
  // the watchers along the portico steps
  for (const [x, z, f, k] of [[9.6, -9.5, 0.4, 0], [10.4, -8.7, 3.5, 1], [-9.2, 14.5, 1.2, 0], [-8.4, 15.6, 5.0, 1], [8.5, 11.5, 4.4, 1], [9.4, 12.4, 2.2, 0], [-6.2, -15, 0.8, 1], [-5.3, -16.2, 4.0, 0]]) (k ? woman : man)([x, z], f, { y: 0.05, pose: 'talk' });
  // the bearers coming up from the south passage
  for (const [x, z, k] of [[-0.9, 15.8, 0], [0.8, 13.0, 1], [-0.7, 10.2, 0], [0.9, 7.6, 1]]) woman([x, z], 0, { y: 0.05, carry: k ? 'pot' : 'basket', cloth: k ? 'cloth_red' : 'cloth_indigo' });
  man([0.2, 5.0], 0, { y: 0.05, carry: 'sack', dress: 'loincloth', cloth: 'cloth_ochre' });
  // the roofs of the east portico (4.6 m up) and the west porticoes: the household watching the court from above, leaning at the horns
  for (const [x, z, f, k] of [[16.4, -17.5, 4.7, 1], [16.9, -16.4, 1.6, 0], [16.2, -9.0, 4.6, 1], [16.6, -3.0, 4.9, 0], [16.4, 4.4, 4.8, 1], [16.8, 5.6, 1.6, 1], [16.5, 14.0, 4.7, 0]]) (k ? woman : man)([x, z], f, { y: 4.6, pose: 'talk' });
  for (const [x, z, f] of [[-16.6, -14, 1.5], [-16.2, 5, 1.6], [-16.9, 9.6, 1.4]]) woman([x, z], f, { y: 4.4, pose: 'talk' });
  // the pithoi under the east portico and the servants at them
  for (const z of [-8.2, -6.4, -4.6]) L.push({ t: 'pot', kind: 'pithos', at: [11.2, z], y: 0.05, n: 1, seed: seed() });
  woman([10.0, -6.9], -Math.PI / 2 * 0 + Math.PI / 2 * 3, { y: 0.05, carry: 'pot', cloth: 'cloth_ochre' }); man([10.2, -3.4], Math.PI, { y: 0.05, pose: 'stand', dress: 'loincloth', cloth: 'cloth_brown', carry: 'sack' });
  // the priestesses before the Tripartite Shrine and its table of offerings
  woman([-15.3, 3.4], Math.PI / 2, { y: 0.05, cloth: 'cloth_indigo', cloth2: 'cloth_ochre', pose: 'pray' });
  woman([-15.4, 5.2], Math.PI / 2, { y: 0.05, cloth: 'cloth_red', cloth2: 'cloth_white', pose: 'kneel', arms: 'pray', hair: 'long' });
  woman([-15.0, 8.4], Math.PI / 2, { y: 0.05, cloth: 'cloth_white', cloth2: 'cloth_red', pose: 'stand', carry: 'pot' });
  for (const z of [1.2, 9.6]) L.push({ t: 'pot', kind: 'water_pot', at: [-12.6, z], y: 0.05, n: 1, seed: seed() });
  // the East Wing's rooms (§4d): the weaver at her loom in the residential hall, a woman seated on the bench, the lapidary at the
  // bow drill, a workman at the middle table, a boy bringing water
  woman([36.8, 22.45], Math.PI, { y: 0.03, cloth: 'cloth_red', cloth2: 'cloth_white', pose: 'stand' });
  woman([28, 21.4], 0, { y: 0.03, cloth: 'cloth_indigo', cloth2: 'cloth_ochre', pose: 'talk' });
  man([29.2, 29.9], Math.PI, { y: 0.03, pose: 'stand', dress: 'loincloth', cloth: 'cloth_white' });
  man([33, 32.4], Math.PI, { y: 0.03, pose: 'stand', dress: 'loincloth', cloth: 'cloth_ochre' });
  man([26.5, 28.6], 0, { y: 0.03, pose: 'stand', dress: 'shendyt', cloth: 'cloth_red' });

  // ── the town (§10a): those at home in the open houses, people in the lanes, the washing at the Kairatos, the flock on the slope ──
  const R2 = rand, openKinds = openHouses();
  for (const [l, kind] of openKinds) {
    const el = { rect: l.rect, front: l.front, seed: l.seed }, F = dwellingFrame(el), y0 = Math.min(height(l.rect[0], l.rect[1]), height(l.rect[2], l.rect[1]), height(l.rect[0], l.rect[3]), height(l.rect[2], l.rect[3])) + 0.22;
    const at = (u, v) => F.P(u, v), look = (a, u, v) => faceTo(a, at(u, v));
    if (kind === 'home') { const a = at(F.L / 2 - 1.1, F.D - 2.1); woman(a, look(a, F.L / 2, F.D - 1.2), { y: y0, pose: 'squat' }); if (R2() < 0.6) { const b = at(F.L / 2 + 1.0, 1.5 + T0); man(b, look(b, F.L / 2, 6), { y: y0, pose: 'sit_ground', child: true, h: 1.1 }); } }
    else if (kind === 'weaver') { const a = at(F.L / 2, F.D - 1.5); woman(a, look(a, F.L / 2, F.D), { y: y0, pose: 'stand', cloth: 'cloth_red' }); }
    else if (kind === 'shop') { const a = at(F.L / 2 + 0.4, 2.0 + T0 - 0.2 + 1.2 + 0.7); man(a, look(a, F.L / 2, 1), { y: y0, pose: 'stand', dress: 'shendyt', cloth: 'cloth_white' }); if (R2() < 0.5) { const b = at(F.L / 2 - 1.2, 1.4); woman(b, look(b, F.L / 2 - 1.2, 4), { y: y0, pose: 'talk' }); } }
    else { const a = at(F.L / 2, F.D / 2); man(a, look(a, F.L / 2, F.D - 1), { y: y0, pose: 'stand', dress: 'loincloth', cloth: 'cloth_brown', carry: 'sack' }); }
  }
  // the lanes: people by the doors and on the way, a donkey with its driver, children at play, dogs and cats
  let n = 0;
  for (const Ln of lanes()) {
    if (Math.hypot((Ln.x0 + Ln.x1) / 2, Ln.z) > 230) continue;
    for (let x = Ln.x0 + 4 + rand() * 10; x < Ln.x1 - 2; x += 14 + rand() * 20) {
      const near = Math.hypot(x, Ln.z) < 170, p = rand();
      if (!near && (p < 0.8 || Math.hypot(x, Ln.z) > 220)) continue;
      const z = Ln.z + (rand() - 0.5) * 1.8, y = height(x, z) + 0.08, dir = rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
      if (p < 0.15) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y, rot: dir, seed: seed(), gear: true }); man([x + (dir < 0 ? 1.7 : -1.7), z + 0.5], dir, { y, carry: 'staff' }); }
      else if (p < 0.3) { for (let k = 0; k < 2; k++) man([x + k * 0.8, z + (k ? 0.5 : 0)], k ? 2.4 : 0.8, { y, pose: 'sit_ground', child: true, h: 1.05 - 0.06 * k }); }
      else if (p < 0.55) woman([x, z], dir, { y, carry: rand() < 0.6 ? 'pot' : 'sack' });
      else if (p < 0.72) { woman([x, z], rand() * 6.28, { y, pose: 'talk' }); woman([x + 1.1, z + 0.2], rand() * 6.28, { y, pose: 'talk' }); }
      else if (p < 0.88) man([x, z], rand() * 6.28, { y, pose: rand() < 0.5 ? 'talk' : 'stand' });
      else L.push({ t: 'animal', kind: rand() < 0.5 ? 'dog' : 'cat', at: [x, z], y, rot: rand() * 6.28, seed: seed() });
      n++;
    }
  }
  // the washing at the stream: women kneeling at the bank, a boy fishing, the cloth spread on the stones
  const bank = (zz, side) => { const cx = STREAM.x - 3 * Math.sin(-zz / 55) * 0 + 3 * Math.sin(zz / 55); return [cx + side * (STREAM.w / 2 + 1.2), zz]; };
  void onStream; void STREAM_LEVEL; void inRect; void WESTCOURT; void lots; void LANE;
  for (const [zz, side] of [[-60, -1], [-56, -1], [-52.5, -1], [20, 1], [24, 1]]) {
    const b = bank(zz, side), w = [STREAM.x + 3 * Math.sin(zz / 55), zz], y = height(b[0], b[1]);
    woman(b, faceTo(b, w), { y, pose: 'kneel', cloth: 'cloth_red', cloth2: 'cloth_white' });
    L.push({ t: 'laundry', at: [b[0] + side * 1.4, b[1] + 1.2], y, rot: faceTo(b, w), seed: seed() });
  }
  { const b = bank(-8, -1), w = [STREAM.x + 3 * Math.sin(-8 / 55), -8]; man(b, faceTo(b, w), { y: height(b[0], b[1]), pose: 'sit_low', child: true, h: 1.2, carry: 'staff' }); }
  // the shepherd's boy with goats on the slope beyond the town, and a few sheep
  for (let k = 0; k < 6; k++) { const x = 118 + rand() * 20, z = 40 + rand() * 18; L.push({ t: 'animal', kind: k < 4 ? 'goat' : 'sheep', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: seed() }); }
  man([128, 36], 0.6, { y: height(128, 36), pose: 'staff', child: true, h: 1.3, carry: 'staff' });
  void n;
  return L;
}

export const lifePlan = () => ({ id: 'knossos-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-350, -350, 350, 350], entrance: { at: [-100, 0], facing: 'e' } });
