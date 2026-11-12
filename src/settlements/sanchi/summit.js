// The summit's south approach and the hall (docs/settlements/sanchi.md §13): the paved way from the stair's head to the south
// gateway, the pilgrims' stalls on both sides (flowers, lamps, incense, water, bowls), stone seats, a second rest hall,
// and Temple 40's hall dressed with an altar, lamps, garlands and the bell. Plan elements for the site (style sanchi-site)
// and the people (style life).
import { TOP, TEMPLE40, VIHARA2 } from './layout.js';

const WAY = [-4.2, 44, 4.2, 94];
/** The stalls along the way: [x, z, front, trade]; those on the east look west and the reverse. */
export const SUMMIT_STALLS = [
  [-11, 49, 'e', 'flowers'], [11, 49, 'w', 'flowers'], [-11, 56, 'e', 'lamps'], [11, 56, 'w', 'incense'],
  [-11, 63, 'e', 'water'], [11, 63, 'w', 'bowls'], [-11, 70, 'e', 'robes'], [11, 70, 'w', 'flowers'],
  [-11, 77, 'e', 'incense'], [11, 77, 'w', 'lamps'], [-11, 84, 'e', 'flowers'], [11, 84, 'w', 'water'],
];
export const BOWL = [27, 25];
export const HALL2 = [-36, 74, -21, 83];

export function summitElements() {
  const E = [];
  E.push({ t: 'floor', rect: WAY, y: TOP + 0.03, mat: 'sandstone_floor', th: 0.06 });
  E.push({ t: 'floor', rect: [-12.5, 44, -4.2, 94], y: TOP + 0.02, mat: 'sandstone_floor', th: 0.04 });
  E.push({ t: 'floor', rect: [4.2, 44, 12.5, 94], y: TOP + 0.02, mat: 'sandstone_floor', th: 0.04 });
  for (const [cx, cz, front, trade] of SUMMIT_STALLS) E.push({ t: 'stall', rect: [cx - 1.3, cz - 1.8, cx + 1.3, cz + 1.8], front, y: TOP, seed: Math.floor(cx * 31 + cz * 17), trade });
  // strings of garlands and pennants across the way, from stall to stall at the awnings' height
  for (const [z, m] of [[49.5, ['cloth_red', 'cloth_ochre']], [63, ['cloth_white', 'cloth_red']], [77, ['cloth_ochre', 'cloth_white']]]) E.push({ t: 'rite', kind: 'garland', a: [-9.6, TOP + 3.1, z], b: [9.6, TOP + 3.1, z], sag: 0.9, mats: m });
  // stone seats along the way between the stalls, facing it
  for (const z of [52.5, 66.5, 80.5, 90]) for (const sx of [-1, 1]) E.push({ t: 'block', rect: [sx * 5.6 - 0.3, z - 0.9, sx * 5.6 + 0.3, z + 0.9], y0: TOP, y1: TOP + 0.45, mat: 'sandstone', walk: true });
  // the second rest hall west of the way
  E.push({ t: 'pilgrim_hall', rect: HALL2.map((v, i) => v), plinth: 0.5, h: 3.0, y: TOP });
  // the second monastery, west of the Great Stupa
  E.push({ t: 'obj', kind: 'vihara', at: [0, 0], y: TOP, rect: VIHARA2 });
  // the Great Bowl before the monastery's door, cut from one boulder, food heaped in it for the monks
  E.push({ t: 'great_bowl', c: BOWL, y: TOP, r: 1.3 });
  // lamp pillars at the way's head by the stair
  for (const sx of [-1, 1]) E.push({ t: 'block', rect: [sx * 4.2 - 0.25, 91.5, sx * 4.2 + 0.25, 92], y0: TOP, y1: TOP + 1.7, mat: 'sandstone_dressed' });
  // Temple 40: an altar at the hall's west end with lamps, an offering and a bell; garlands between the front pillars
  const [cx, cz] = TEMPLE40.c, top = TOP + 3.35, ax = cx - 16.2;
  E.push({ t: 'block', rect: [ax - 0.6, cz - 0.9, ax + 0.6, cz + 0.9], y0: top, y1: top + 0.55, mat: 'sandstone_dressed' });
  E.push({ t: 'block', rect: [ax - 0.4, cz - 0.7, ax + 0.4, cz + 0.7], y0: top + 0.55, y1: top + 0.75, mat: 'sandstone' });
  E.push({ t: 'rite', kind: 'offering', at: [ax + 1.1, cz], y: top, n: [1, 0], seed: 4 });
  for (const sz of [-1, 1]) E.push({ t: 'rite', kind: 'stand', at: [ax + 0.9, cz + sz * 1.5], y: top, h: 1.1 });
  E.push({ t: 'rite', kind: 'lamps', at: [ax + 0.6, cz - 1.1], to: [ax + 0.6, cz + 1.1], y: top + 0.75, count: 6 });
  E.push({ t: 'rite', kind: 'bell', at: [ax + 1.8, cz], top: top + 4.3, drop: 1.3, r: 0.14 });
  const XS = [], mats = [['cloth_white'], ['cloth_white', 'cloth_red']];
  for (let i = 0; i < 10; i++) XS.push(cx + (i - 4.5) * 3.6);
  for (const [k, x] of XS.entries()) if (k % 3 === 1) E.push({ t: 'rite', kind: 'garland', a: [x, top + 3.6, cz - 3.6 + 0.4], b: [x, top + 3.6, cz + 3.6 - 0.4], sag: 0.6, mats: mats[k % 2] });
  for (const z of [-1, 1]) E.push({ t: 'rite', kind: 'lamps', at: [XS[0] + 0.6, cz + z * 7.2 - z * 0.9], to: [XS[9] - 0.6, cz + z * 7.2 - z * 0.9], y: top, count: 9 });
  return E;
}
