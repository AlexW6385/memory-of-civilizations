// The Acropolis' east terrace about 410 BC (docs/settlements/athens.md §4g): the great altar of Athena before the Parthenon's east front, where the
// hecatomb of the Panathenaia was burnt (Pausanias 1.24.5 puts the altar of Athena before the temple, to the east); the people at it — priest, the basket-bearer
// and the garlanded ox led up, the flute-player, worshippers, women with their hydriai, children, pigeons on the paving — and the goods of a feast day.
// Elements for the greek style (the altar) and for the life style (people, jars, wood). y = the summit's paving.

import { ACRO } from './layout.js';

const T = ACRO.top, Y = T + 0.04;
/** The bronze dedications on their marble bases (Pausanias 1.24–28: the summit was crowded with statues): [x, z, facing, pose kind]. */
export const STATUES = [[60.5, 26.5, Math.PI / 2, 'robe'], [60.5, 10.2, Math.PI / 2, 'nude'], [78, 36.6, Math.PI, 'robe'], [90.4, 21.4, Math.PI / 2, 'nude'], [93.6, 13.4, 3.6, 'robe'], [101.5, 27.6, Math.PI / 2, 'nude'], [108.6, 15.2, 2.2, 'robe'], [111.4, 35.4, 4.4, 'nude'], [124, 24, Math.PI / 2, 'robe']];
export const ALTAR = { x0: 70, z0: 16.4, x1: 76, z1: 19.6 };

/** The altar: two low steps, the block of marble, the slab with its burnt top; a kerb of limestone paving about it. */
export function summitAltar() {
  const { x0, z0, x1, z1 } = ALTAR, E = [];
  E.push({ t: 'block', rect: [x0 - 3.4, z0 - 3.0, x1 + 3.4, z1 + 3.0], y0: Y - 0.4, y1: Y + 0.06, mat: 'limestone', walk: true });
  E.push({ t: 'block', rect: [x0 - 1.4, z0 - 1.2, x1 + 1.4, z1 + 1.2], y0: Y + 0.06, y1: Y + 0.36, mat: 'marble', walk: true });
  E.push({ t: 'block', rect: [x0 - 0.7, z0 - 0.6, x1 + 0.7, z1 + 0.6], y0: Y + 0.36, y1: Y + 0.66, mat: 'marble', walk: true });
  E.push({ t: 'block', rect: [x0, z0, x1, z1], y0: Y + 0.66, y1: Y + 1.52, mat: 'marble' });
  E.push({ t: 'block', rect: [x0 - 0.2, z0 - 0.2, x1 + 0.2, z1 + 0.2], y0: Y + 1.52, y1: Y + 1.64, mat: 'marble' });
  E.push({ t: 'block', rect: [x0 + 0.5, z0 + 0.4, x1 - 0.5, z1 - 0.4], y0: Y + 1.64, y1: Y + 1.69, mat: 'basalt', collide: false });          // the ash and char of the burnt thighs
  // the horns of the altar's corners, and a row of stelae with the decrees and the lists of the treasurers along the temple's flank
  for (const [x, z] of [[x0 - 0.1, z0 - 0.1], [x1 + 0.1, z0 - 0.1], [x0 - 0.1, z1 + 0.1], [x1 + 0.1, z1 + 0.1]]) E.push({ t: 'block', rect: [x - 0.14, z - 0.14, x + 0.14, z + 0.14], y0: Y + 1.64, y1: Y + 1.9, mat: 'marble', collide: false });
  for (const [x, z, h, yaw] of [[58.5, 2.2, 2.6, Math.PI / 2], [58.5, 3.8, 1.9, Math.PI / 2], [58.5, 33.6, 2.8, Math.PI / 2], [58.5, 35.2, 2.0, Math.PI / 2], [64, 38.6, 1.7, 0], [80.5, 11.6, 2.3, Math.PI / 2], [82.5, 12.4, 1.6, Math.PI / 2]]) E.push({ t: 'votive', kind: 'stele', at: [x, z], y: Y, yaw, h, w: h > 2.2 ? 0.8 : 0.6 });
  for (const [x, z] of [[62, 5.5], [79.5, 27.5], [66, 30.4]]) E.push({ t: 'votive', kind: 'tripod', at: [x, z], y: Y });
  // the Erechtheion's cella (docs/settlements/athens.md §4g): the old olive-wood image of Athena Polias in her peplos on its base, facing the east door, Kallimachos' golden lamp on its
  // stand with the bronze palm that carried its smoke to the roof, the small altars of the cella (Poseidon-Erechtheus, Butes, Hephaistos) at its west end; the floor at 0.9 m
  { const fy = T + 0.9;
    E.push({ t: 'xoanon', at: [36.4, -46], y: fy, yaw: Math.PI / 2, h: 1.9, god: 'artemis', gifts: 0 });
    E.push({ t: 'block', rect: [38.4, -44.2, 38.9, -43.7], y0: fy, y1: fy + 0.25, mat: 'marble', collide: true }); E.push({ t: 'block', rect: [38.58, -44.02, 38.72, -43.88], y0: fy + 0.25, y1: fy + 1.5, mat: 'bronze', collide: false });
    E.push({ t: 'block', rect: [38.4, -44.25, 38.9, -43.65], y0: fy + 1.5, y1: fy + 1.6, mat: 'bronze', collide: false }); E.push({ t: 'block', rect: [38.64, -44.06, 38.66, -44.04], y0: fy + 1.6, y1: fy + 4.3, mat: 'bronze', collide: false });
    for (const [z, h] of [[-48.2, 0.9], [-46.0, 1.1], [-43.8, 0.9]]) { E.push({ t: 'block', rect: [27.2, z - 0.45, 28.2, z + 0.45], y0: fy, y1: fy + h, mat: 'marble' }); E.push({ t: 'block', rect: [27.1, z - 0.55, 28.3, z + 0.55], y0: fy + h, y1: fy + h + 0.1, mat: 'marble', collide: false }); }
  }
  for (const [x, z] of STATUES) { E.push({ t: 'block', rect: [x - 0.62, z - 0.62, x + 0.62, z + 0.62], y0: Y - 0.1, y1: Y + 0.18, mat: 'limestone' }); E.push({ t: 'block', rect: [x - 0.48, z - 0.48, x + 0.48, z + 0.48], y0: Y + 0.18, y1: Y + 1.25, mat: 'marble' }); E.push({ t: 'block', rect: [x - 0.56, z - 0.56, x + 0.56, z + 0.56], y0: Y + 1.25, y1: Y + 1.34, mat: 'marble', collide: false }); }
  return E;
}

/** The people and the goods (life style). */
export function summitLife() {
  let s = 4101; const rand = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296), seed = () => Math.floor(rand() * 1e9);
  const L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: seed(), skin: 'skin_medium', dress: 'robe', cloth: pick(['cloth_white', 'linen', 'cloth_ochre']), cloth2: pick(['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_red']), over: 'cloak', hair: 'short', beard: 1, hat: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: seed(), skin: 'skin_light', dress: 'robe', cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']), cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: rand() < 0.4 ? 'veil' : 'none', pose: 'stand', ...o });
  const boy = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: seed(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: 'linen', over: 'none', hair: 'short', beard: 0, hat: 'none', feet: 'bare', pose: 'stand', child: true, h: 1.15, ...o });
  const slave = (at, rot, o = {}) => L.push({ t: 'figure', at, y: Y, rot, seed: seed(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: pick(['cloth_brown', 'cloth_grey', 'linen']), over: 'belt', hair: 'short', beard: 0.4, hat: 'none', feet: 'bare', pose: 'stand', ...o });
  const put = (t, x, z, rot = 0, o = {}) => L.push({ t, at: [x, z], y: Y, rot, seed: seed(), ...o });
  const E = Math.PI / 2, W = -Math.PI / 2, N = 0, S = Math.PI;
  const { x0, z0, x1, z1 } = ALTAR, zm = (z0 + z1) / 2;
  // the sacrifice: the priest at the altar's south side, the basket-bearer and the boy with the water, the garlanded ox led up from the temple with its herdsman,
  // the flute-player cross-legged on the paving, a slave with the knife-box and the barley
  man([x0 + 2.2, z1 + 1.9], N, { pose: 'pray', cloth: 'cloth_white', cloth2: 'cloth_white', beard: 1 });
  woman([x0 - 3.6, zm + 1.6], E, { carry: 'basket', cloth: 'cloth_white', cloth2: 'cloth_ochre', hat: 'none', arms: 'head' });
  boy([x0 - 4.8, zm + 2.2], E, { carry: 'pot', arms: 'head' });
  put('animal', x0 - 5.6, zm - 0.9, E, { kind: 'ox', seed: 77, gear: false });
  slave([x0 - 6.9, zm - 1.9], E, { carry: 'staff', pose: 'staff', len: 1.7 });
  man([x0 + 3.4, z1 + 4.0], N, { pose: 'flute', dress: 'robe', cloth: 'cloth_ochre', hair: 'short', beard: 0.3 });
  slave([x1 + 2.6, zm - 0.6], W, { carry: 'basket', cloth: 'cloth_brown' });
  // the citizens and their wives about the altar and across the terrace: in talk, praying, watching; children running between
  const spots = [[64, 12.5, N], [66.4, 14.3, E], [81.6, 20.4, W], [79.4, 23.6, W], [62.2, 24.4, E], [60.6, 21.0, E], [83.4, 15.6, W], [74.2, 26.8, N], [68, 28.2, N], [77.6, 30.6, W], [72, 34.6, N], [64.8, 33.2, E], [82.6, 28.6, W], [59.4, 12.8, E], [85.8, 22.4, W], [70.4, 11.2, S]];
  spots.forEach(([x, z, r], k) => {
    const j = rand();
    if (j < 0.4) man([x, z], r + (rand() - 0.5) * 0.7, rand() < 0.5 ? { pose: 'talk' } : rand() < 0.3 ? { pose: 'pray' } : {});
    else if (j < 0.7) woman([x, z], r + (rand() - 0.5) * 0.6, rand() < 0.4 ? { carry: 'pot', arms: 'head' } : {});
    else if (j < 0.85) boy([x, z], r + (rand() - 0.5) * 1.6);
    else slave([x, z], r + (rand() - 0.5) * 0.7, { carry: rand() < 0.5 ? 'sack' : 'basket' });
    if (k % 3 === 0) man([x + 1.1, z + 0.35], r + 2.8, { pose: 'talk', cloth: 'cloth_grey' });
  });
  // in the Erechtheion's cella: the priestess of Athena Polias with an attendant before the image, a man at the altars, a girl bringing the oil for the lamp (floor 0.9 m up)
  { const fy = T + 0.9, at = (x, z, r, f, o) => { f([x, z], r, o); L[L.length - 1].y = fy; };
    at(39.4, -47.2, -Math.PI / 2, woman, { pose: 'pray', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'veil' }); at(40.6, -44.8, -Math.PI / 2 - 0.4, woman, { carry: 'pot', arms: 'head', cloth: 'cloth_ochre' });
    at(30.6, -44.2, -Math.PI / 2, man, { pose: 'pray' }); at(33.2, -48.9, Math.PI / 2 + 0.2, boy, {}); }
  // on the east steps and in the pteron before the great door: visitors sitting on the second step in the sun, others waiting under the colonnade for the priest, a woman with her jar
  for (const z of [21.2, 23.0, 28.6, 31.4]) { man([53.05, z], E, { pose: 'sit_low', cloth: pick(['cloth_white', 'linen', 'cloth_ochre']) }); L[L.length - 1].y = T + 1.04; if (z > 28) L[L.length - 1].dress = 'robe'; }
  woman([53.05, 25.4], E, { pose: 'sit_low' }); L[L.length - 1].y = T + 1.04; boy([52.95, 26.3], E + 0.3, {}); L[L.length - 1].y = T + 1.04;
  for (const [x, z, r, o] of [[50.2, 9.5, S, {}], [50.3, 12.4, E, { pose: 'talk' }], [50.9, 13.2, W, { pose: 'talk' }], [50.2, 24.6, N, {}], [50.3, 29.6, S, { carry: 'pot', arms: 'head' }], [50.2, 6.6, E, { pose: 'pray' }]]) { (o.carry ? woman : man)([x, z], r, o); L[L.length - 1].y = T + 1.56; }
  // the bronzes: dedications on their bases, cast figures in the cloak or bare, one hand a little out
  STATUES.forEach(([x, z, r, kind], k) => L.push({ t: 'figure', at: [x, z], y: Y + 1.34, rot: r, seed: seed(), skin: 'bronze', hairMat: 'bronze', hairShade: 1, dress: kind === 'robe' ? 'robe' : 'loincloth', top: kind === 'robe' ? undefined : 'bare', cloth: 'bronze', cloth2: 'bronze', over: kind === 'robe' ? 'cloak' : 'none', hair: 'short', beard: k % 3 === 0 ? 1 : 0, hat: 'none', feet: 'bare', pose: k % 2 ? 'stand' : 'staff', carry: k % 2 ? 'none' : 'staff', len: 1.9 }));
  // in the Parthenon's cella (local x 8..21 of the temple at (18, 18), its floor 2.26 m up): the priestess and a kneeling woman before the basin, men standing in awe, a child held by the hand,
  // the temple warden with his staff by the door, a bench with offerings of cakes and oil
  { const NY = T + 2.26, ox = 18, oz = 18, F = (lx, lz, f) => ({ at: [ox + lx, oz + lz], rot: f });
    const inside = (kind, lx, lz, f, o = {}) => { const q = F(lx, lz, f), fn = { man, woman, boy }[kind]; fn(q.at, q.rot, o); L[L.length - 1].y = NY; };
    inside('woman', 10.6, -3.9, -Math.PI / 2, { pose: 'pray', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'veil' }); inside('woman', 11.8, 4.7, -Math.PI / 2 + 0.3, { pose: 'kneel', arms: 'pray', cloth: 'cloth_ochre' });
    inside('man', 13.0, -3.4, -Math.PI / 2 + 0.2, {}); inside('man', 16.2, -3.7, -Math.PI / 2 - 0.3, { pose: 'talk', cloth: 'cloth_grey' }); inside('man', 17.2, -3.2, Math.PI / 2 - 0.4, { pose: 'talk' });
    inside('boy', 15.2, 3.6, -Math.PI / 2 + 0.5, {}); inside('woman', 16.1, 3.8, -Math.PI / 2 + 0.2, { cloth: 'cloth_indigo' });
    inside('man', 20.3, -4.8, Math.PI, { carry: 'staff', pose: 'staff', len: 1.9, cloth: 'cloth_white' }); inside('man', 19.0, 3.6, Math.PI / 2 + 0.4, { pose: 'sit_low' });
    for (const [lx, lz, kind, n] of [[13.4, -5.6, 'amphora', 2], [14.5, -5.7, 'water_pot', 3], [14.0, 5.7, 'pithos', 1]]) L.push({ t: 'pot', at: [ox + lx, oz + lz], y: NY, rot: 0, seed: seed(), kind, n });
    L.push({ t: 'bench', at: [ox + 18.0, oz - 5.3], y: NY, rot: 0, seed: seed(), len: 2.2, mat: 'marble' }); L.push({ t: 'basket', at: [ox + 17.4, oz - 5.2], y: NY + 0.47, rot: 0, seed: seed(), n: 2 });
    L.push({ t: 'stool', at: [ox + 19.0, oz + 3.5], y: NY, rot: 0, seed: seed() }); }
  // the stelae's readers, two men before the treasurers' lists
  man([60.2, 3.0], W, { pose: 'talk' }); man([60.4, 4.5], W, { pose: 'talk', cloth: 'cloth_grey' });
  // the feast day's goods: a table for the offerings by the altar's west step, wood for the fire, the lustral basin, jars and baskets, barley sacks, pigeons on the paving
  put('bench', x0 - 2.4, z0 - 2.0, N, { len: 2.4, mat: 'marble' }); put('pot', x0 - 2.9, z0 - 2.0, 0, { kind: 'amphora', n: 2 }); put('pot', x0 - 1.5, z0 - 2.1, 0, { kind: 'water_pot', n: 3 });
  put('firewood', x1 + 3.4, z0 - 1.0, N, { len: 1.8 }); put('firewood', x1 + 3.4, z0 - 0.3, N, { len: 1.6 });
  put('trough', x1 + 4.8, z1 + 1.6, 0, { mat: 'marble' });
  put('basket', x0 - 4.2, z1 + 1.1, 0, { n: 3 }); put('sacks', x1 + 2.9, z1 + 2.6, 0.4, { n: 3 }); put('pot', x1 + 1.8, z1 + 3.4, 0, { kind: 'pithos', n: 1 });
  put('stool', x0 + 3.9, z1 + 3.0, 0, {});
  put('pot', 66.5, 6.2, 0, { kind: 'amphora', n: 2 }); put('pot', 80, 31.8, 0, { kind: 'water_pot', n: 2 });
  put('chickens', 61.4, 29.2, 0.4, { kind: 'pigeon', n: 6 }); put('chickens', 75.2, 24.4, 2.0, { kind: 'pigeon', n: 5 }); put('chickens', 83.4, 18.8, 4.0, { kind: 'pigeon', n: 6 }); put('chickens', 63.5, 15.5, 1.0, { kind: 'pigeon', n: 5 });
  return L;
}
