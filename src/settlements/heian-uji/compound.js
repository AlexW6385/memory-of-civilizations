// The great houses of Uji (docs/settlements/heian-uji.md §12): a Fujiwara villa of the shinden-zukuri west of the
// temple garden — the shinden facing south over a court of white gravel, a tai-no-ya either side joined by covered
// corridors, the earthen wall with its gate, the servants' houses inside — and a smaller nobleman's house to the
// north. Their people (a lord and ladies on the mats, attendants) and the pleasure boats of the Aji pond with their
// players (§13). Pure plan data; world coordinates.

import { VILLA, NOBLE, POND_LEVEL, RADIUS } from './layout.js';

const FL = 1.0, EAVE = 4.0;
const base = (id, style, elements, bounds, at) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds, entrance: { at, facing: 's' } });

/** The enclosing wall of a compound with a gate in the south side (gap g at x = gx). */
function enclosure(r, gx, g = 4.0) {
  const [x0, z0, x1, z1] = r;
  return [
    { t: 'tsuijibei', a: [x0, z0], b: [x1, z0], y: 0 }, { t: 'tsuijibei', a: [x1, z0], b: [x1, z1], y: 0 }, { t: 'tsuijibei', a: [x0, z1], b: [x0, z0], y: 0 },
    { t: 'tsuijibei', a: [x0, z1], b: [gx - g / 2, z1], y: 0 }, { t: 'tsuijibei', a: [gx + g / 2, z1], b: [x1, z1], y: 0 },
    { t: 'yakumon', at: [gx, z1], y: 0, axis: 'z', w: g - 0.7 },
  ];
}

const sx = (VILLA[0] + VILLA[2]) / 2, SZ = -17.2;                       // the shinden's centre line
export const SHINDEN = { rect: [sx - 8.4, SZ - 4.8, sx + 8.4, SZ + 4.8], gx: sx };
function villa() {
  const E = [];
  // the shinden (7 × 4 ken), a tai-no-ya (3 × 3 ken) either side, the corridors joining them
  E.push({ t: 'heian_hall', rect: SHINDEN.rect, y: 0, fl: FL, furnish: 'shinden', doors: ['w', 'e'], seed: 11 });
  const tw = [sx - 8.4 - 0.15 - 6.0 - 7.2 - 0.15, sx + 8.4 + 0.15 + 6.0 + 0.15];
  for (const [i, x0] of tw.entries()) E.push({ t: 'heian_hall', rect: [x0, SZ - 3.6, x0 + 7.2, SZ + 3.6], y: 0, fl: FL, furnish: 'taiya', noMoya: true, doors: [i ? 'w' : 'e'], seed: 20 + i });
  E.push({ t: 'corridor', a: [sx - 8.55, SZ], b: [tw[0] + 7.35, SZ], y: 0, fl: FL, w: 2.4 }, { t: 'corridor', a: [sx + 8.55, SZ], b: [tw[1] - 0.15, SZ], y: 0, fl: FL, w: 2.4 });
  // the roofs: bark, deep eaves, hip-and-gable
  E.push({ t: 'irimoya', c: [sx, SZ], A: 8.4 + 2.7, B: 4.8 + 2.7, y: EAVE - 0.1, rise: 3.5, lift: 0.5, gable: 0.4, mat: 'roof_bark', soffit: 'timber', ridgeMat: 'roof_ridge', gableMat: 'plaster_white' });
  for (const x0 of tw) E.push({ t: 'irimoya', c: [x0 + 3.6, SZ], A: 3.6 + 2.3, B: 3.6 + 2.0, y: EAVE - 0.1, rise: 2.5, lift: 0.3, gable: 0.45, alongZ: false, mat: 'roof_bark', soffit: 'timber', ridgeMat: 'roof_ridge', gableMat: 'plaster_white' });
  E.push(...enclosure(VILLA, sx));
  // the servants' and kitchen houses along the east wall, and the stable
  const [vx0, , vx1, vz1] = VILLA;
  E.push({ t: 'heian_house', rect: [vx1 - 14, 8, vx1 - 3, 15], y: 0, front: 'w', seed: 301, open: true }, { t: 'heian_house', rect: [vx1 - 14, 20, vx1 - 3, 28], y: 0, front: 'w', seed: 302 });
  E.push({ t: 'heian_house', rect: [vx0 + 3, 24, vx0 + 13, 32], y: 0, front: 'e', seed: 303 }, { t: 'heian_house', rect: [vx0 + 3, 10, vx0 + 11, 17], y: 0, front: 'e', seed: 304 });
  void vz1;
  return base('heian-uji-villa', 'japanese', E, [VILLA[0] - 4, VILLA[1] - 4, VILLA[2] + 4, VILLA[3] + 8], [sx, VILLA[3] + 4]);
}
function noble() {
  const cx = (NOBLE[0] + NOBLE[2]) / 2, z = NOBLE[1] + 8.5, E = [];
  E.push({ t: 'heian_hall', rect: [cx - 7.2, z - 3.6, cx + 7.2, z + 3.6], y: 0, fl: FL, furnish: 'taiya', noMoya: true, seed: 41 });
  E.push({ t: 'irimoya', c: [cx, z], A: 7.2 + 2.4, B: 3.6 + 2.3, y: EAVE - 0.1, rise: 3.0, lift: 0.4, gable: 0.42, mat: 'roof_bark', soffit: 'timber', ridgeMat: 'roof_ridge', gableMat: 'plaster_white' });
  E.push(...enclosure(NOBLE, cx, 3.6));
  E.push({ t: 'heian_house', rect: [NOBLE[2] - 11, NOBLE[3] - 12, NOBLE[2] - 3, NOBLE[3] - 5], y: 0, front: 'w', seed: 311 });
  return base('heian-uji-noble', 'japanese', E, [NOBLE[0] - 4, NOBLE[1] - 4, NOBLE[2] + 4, NOBLE[3] + 8], [cx, NOBLE[3] + 4]);
}
export const villaPlan = villa(), noblePlan = noble();

// ── the people of the villa ──────────────────────────────────────────────────
/** Lord, ladies and attendants in the shinden (on the mats, as a poem party), a guard at the gate. */
export function villaPeople() {
  const L = [], face = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 8801;
  const fy = FL, [x0, z0, x1, z1] = SHINDEN.rect, xm = (x0 + x1) / 2, zc = z0 + (z1 - 2.4 - z0) * 0.55;
  const P = (x, z, dir, extra) => L.push({ t: 'figure', at: [x, z], y: extra.y ?? 0, rot: face(dir), seed: seed++ * 3571, dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', pose: 'stand', ...extra });
  // the lord seated on the thick mats before the screen, cap (eboshi) of black lacquer, robe of dark cloth with white lining
  P(xm, z0 + 1.7, [0, 1], { y: fy + 0.16, pose: 'cross', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar', arms: 'cross' });
  // two ladies on round mats behind a curtain stand, with long hair over layered robes
  P(xm - 1.7, zc + 0.9, [1, 0], { y: fy + 0.05, pose: 'cross', cloth: 'cloth_red', cloth2: 'cloth_green', hair: 'long', h: 1.5, over: 'collar', arms: 'cross' });
  P(xm + 1.7, zc + 0.9, [-1, 0], { y: fy + 0.05, pose: 'cross', cloth: 'cloth_maroon', cloth2: 'cloth_ochre', hair: 'long', h: 1.5, over: 'collar', arms: 'cross' });
  // a courtier at the koto, an attendant kneeling at the middle bay
  P(x1 - 3.6 + 0.0, zc + 0.9, [0, -1], { y: fy, pose: 'seiza', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar', arms: 'harp' });
  P(xm, z1 - 2.1, [0, -1], { y: fy, pose: 'seiza', cloth: 'cloth_grey', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', arms: 'lap' });
  // the gate guard with his staff, a groom in the court
  P(VILLA[0] / 2 + VILLA[2] / 2 - 3.2, VILLA[3] - 1.4, [0, -1], { y: 0, cloth: 'cloth_brown', cloth2: 'cloth_brown', dress: 'trousers', hat: 'cap', hatMat: 'lacquer_black', carry: 'staff', arms: 'staff' });
  P(xm + 12, 18, [-1, -0.5], { y: 0, cloth: 'cloth_indigo', cloth2: 'cloth_grey', dress: 'trousers', hat: 'straw' });
  P(xm - 6, 12, [1, 0], { y: 0, cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' });
  P(xm - 4.6, 12.8, [1, 0], { y: 0, cloth: 'cloth_red', cloth2: 'cloth_white', hair: 'long', h: 1.5, over: 'collar' });
  return base('heian-uji-villa-people', 'life', L, [-RADIUS, -RADIUS, RADIUS, RADIUS], [0, 0]);
}
export const villaFolk = villaPeople();

// ── the pond's pier and its two pleasure boats ───────────────────────────────
export const PIER = { a: [34.3, -30], b: [26.6, -30], y: POND_LEVEL + 0.45 };
const BOATS = [{ at: [26.6, -32.4], head: 'dragon' }, { at: [26.6, -27.6], head: 'hawk' }];
export function pondFeatures() {
  const E = [{ t: 'pier', a: PIER.a, b: PIER.b, y: PIER.y, bed: POND_LEVEL - 1.2, w: 2.2 }];
  for (const b of BOATS) E.push({ t: 'ryuto_boat', at: b.at, rot: Math.PI / 2, y: POND_LEVEL, len: 9, head: b.head });
  // the players: four on each boat, seated on the mat under the pavilion (gagaku: flute, lute, harp, drum), faces to the middle
  const L = [], by = POND_LEVEL + 0.12;
  let seed = 4410;
  BOATS.forEach((b, bi) => {
    [[-0.45, -1.1, 'flute'], [0.45, -1.1, 'lute'], [-0.45, 1.1, 'harp'], [0.45, 1.1, 'drum']].forEach(([lx, lz, arms], k) => {
      // local (bow toward −z) → world, rot π/2: x = cx + lz·sin(rot)... lz maps to x, lx to −z
      const x = b.at[0] + lz, z = b.at[1] - lx;
      L.push({ t: 'figure', at: [x, z], y: by, rot: Math.atan2(-(lz > 0 ? -1 : 1), 0), seed: seed++ * 977, dress: 'robe', cloth: k % 2 ? 'cloth_green' : 'cloth_maroon', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', skin: 'skin_light', over: 'collar', pose: 'cross', arms, carry: 'none' });
    });
    void bi;
  });
  return [base('heian-uji-pier', 'japanese', E, [20, -42, 40, -18], [38, -30]), base('heian-uji-players', 'life', L, [-RADIUS, -RADIUS, RADIUS, RADIUS], [0, 0])];
}
export const [pier, players] = pondFeatures();

// ── the temple's precinct wall ───────────────────────────────────────────────
// Byōdō-in's garden closed by an earthen wall (tsuijibei) with a gate on the south approach, one on the north and one
// west; the east side stays open to the river (docs/settlements/heian-uji.md §15). Plan data, world coordinates.
export const precinct = (() => {
  const x0 = -106, x1 = 64, zn = -87, zs = 87, G = 3.6, gx = -40, E = [];
  const run = (a, b, ax, fixed) => E.push({ t: 'tsuijibei', a: ax === 'x' ? [a, fixed] : [fixed, a], b: ax === 'x' ? [b, fixed] : [fixed, b], y: 0 });
  for (const z of [zn, zs]) { run(x0, gx - G / 2, 'x', z); run(gx + G / 2, x1, 'x', z); E.push({ t: 'yakumon', at: [gx, z], y: 0, axis: 'z', w: G - 0.7 }); }
  run(zn, -G / 2, 'z', x0); run(G / 2, zs, 'z', x0); E.push({ t: 'yakumon', at: [x0, 0], y: 0, axis: 'x', w: G - 0.7 });
  return base('heian-uji-precinct', 'japanese', E, [x0 - 4, zn - 4, x1 + 4, zs + 4], [gx, zs + 4]);
})();
