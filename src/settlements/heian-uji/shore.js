// The east shore of the Aji pond (docs/settlements/heian-uji.md §16): the viewing pier that runs out along the hall's
// axis (the arrival stands at its end, 37 m from the hall's steps), a pair of pleasure boats of the court on the water
// before it, ducks, the stone lanterns (ishidoro) at the hall's steps, the tea-seller and benches on the gravel above
// the pier. Plan data, world coordinates.

import { POND_LEVEL, RADIUS, HALL, height, pondDistance, islandDistance } from './layout.js';

const base = (id, style, elements, bounds, at, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds, entrance: { at, facing: 'w' }, ...extra });
export const VIEW_PIER = { a: [40.5, 0], b: [4.2, 0], y: POND_LEVEL + 0.45, w: 2.6 };
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

/** A stone lantern (ishidoro) of granite: base, post, fire-box with its two windows, a hipped cap, the jewel; local box elements. */
function ishidoro(x, z, y, s = 1) {
  const b = (hw, y0, y1, mat = 'granite_grey') => ({ t: 'block', rect: [x - hw * s, z - hw * s, x + hw * s, z + hw * s], y0: y + y0 * s, y1: y + y1 * s, mat, collide: hw > 0.2 });
  return [b(0.3, 0, 0.14), b(0.12, 0.14, 0.95), b(0.26, 0.95, 1.06), b(0.2, 1.06, 1.46), b(0.12, 1.12, 1.4, 'granite_black'), b(0.42, 1.46, 1.56), b(0.28, 1.56, 1.7), b(0.12, 1.7, 1.84), b(0.05, 1.84, 1.98)];
}

function pierPlan() {
  const E = [{ t: 'pier', a: VIEW_PIER.a, b: VIEW_PIER.b, y: VIEW_PIER.y, bed: POND_LEVEL - 1.2, w: VIEW_PIER.w }];
  // mooring posts at the end, to either side, and two more half way: the boats of the court tie up here
  for (const [x, dz, top = 0.9] of [[4.6, -1.7, 0.2], [4.6, 1.7, 0.2], [18, -1.7], [18, 1.7], [30, 1.7]]) E.push({ t: 'block', rect: [x - 0.1, dz - 0.1, x + 0.1, dz + 0.1], y0: POND_LEVEL - 1.2, y1: VIEW_PIER.y + top, mat: 'bark_dark', collide: false });
  // railings of two bars on posts along the sides of the outer half, red lacquer
  for (const sd of [-1, 1]) {
    const z = sd * (VIEW_PIER.w / 2 - 0.05);
    for (let x = 6; x <= 30; x += 3) E.push({ t: 'block', rect: [x - 0.05, z - 0.05, x + 0.05, z + 0.05], y0: VIEW_PIER.y, y1: VIEW_PIER.y + 0.95, mat: 'lacquer_red', collide: false });
    E.push({ t: 'block', rect: [6, z - 0.03, 30.05, z + 0.03], y0: VIEW_PIER.y + 0.86, y1: VIEW_PIER.y + 0.93, mat: 'lacquer_red', collide: false });
    E.push({ t: 'block', rect: [6, z - 0.03, 30.05, z + 0.03], y0: VIEW_PIER.y + 0.5, y1: VIEW_PIER.y + 0.56, mat: 'lacquer_red', collide: false });
  }
  // the lanterns of stone at the hall's steps, either side of the stair; one at the pier's land end
  const hx = HALL.origin[0];
  for (const sz of [-1, 1]) E.push(...ishidoro(hx + 9.6, sz * 4.4, 0.02, 1.15));
  E.push(...ishidoro(38.4, -2.6, 0.0, 1), ...ishidoro(38.4, 2.6, 0.0, 1));
  return base('heian-uji-viewpier', 'japanese', E, [hx, -8, 42, 8], [41, 0]);
}

// the boat of the court on the pond before the pier: a dragon-head boat bound for the hall, its four players on the mat
const BOAT = { at: [-5, -14], head: 'dragon' };
function boatPlan() {
  const E = [{ t: 'ryuto_boat', at: BOAT.at, rot: Math.PI / 2, y: POND_LEVEL, len: 9, head: BOAT.head }];
  const L = [], by = POND_LEVEL + 0.12;
  let seed = 7710;
  [[-0.45, -1.1, 'flute'], [0.45, -1.1, 'lute'], [-0.45, 1.1, 'harp'], [0.45, 1.1, 'drum']].forEach(([lx, lz, arms], k) => {
    const x = BOAT.at[0] + lz, z = BOAT.at[1] - lx;
    L.push({ t: 'figure', at: [x, z], y: by, rot: Math.atan2(-(lz > 0 ? -1 : 1), 0), seed: seed++ * 977, dress: 'robe', cloth: k % 2 ? 'cloth_green' : 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', skin: 'skin_light', over: 'collar', pose: 'cross', arms, carry: 'none' });
  });
  // the helmsman at the stern, standing, a long oar
  L.push({ t: 'figure', at: [BOAT.at[0] + 4.1, BOAT.at[1]], y: by, rot: Math.PI / 2, seed: 7799, dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'straw', skin: 'skin_medium', carry: 'staff', pose: 'stand' });
  return [base('heian-uji-courtboat', 'japanese', E, [BOAT.at[0] - 6, BOAT.at[1] - 3, BOAT.at[0] + 6, BOAT.at[1] + 3], [BOAT.at[0], BOAT.at[1] + 4]), base('heian-uji-courtboat-people', 'life', L, [-RADIUS, -RADIUS, RADIUS, RADIUS], [0, 0])];
}

function shoreLife() {
  const L = [], y = VIEW_PIER.y, P = (x, z, dir, extra) => L.push({ t: 'figure', at: [x, z], y: extra.y ?? height(x, z), rot: faceTo(dir), seed: Math.round(x * 131 + z * 17), dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'straw', skin: 'skin_medium', carry: 'none', pose: 'stand', ...extra });
  // on the pier: two anglers sitting at its edge with their rods (staff), a basket of fish, a couple of visitors at the rail looking at the hall
  P(24.5, 1.05, [0, 1], { y, pose: 'sit_low', carry: 'staff', cloth: 'cloth_indigo' });
  L.push({ t: 'basket', at: [24.0, 0.7], y, n: 1, seed: 71 });
  P(14.5, -1.0, [0, -1], { y, pose: 'sit_low', carry: 'staff', cloth: 'cloth_brown', hat: 'cap', hatMat: 'cloth_black' });
  P(30.2, -0.4, [-1, 0], { y, dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.5, over: 'collar' });
  P(31.4, 0.5, [-1, 0], { y, dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' });
  // the tea-seller on the gravel above the pier: a stall of cloth, a bench, a kettle on a brazier, two customers
  L.push({ t: 'stall', at: [43.5, -13], y: height(43.5, -13), rot: -Math.PI / 2, w: 2.4, d: 1.2, awning: 'cloth_indigo', goods: ['pottery', 'baskets'], seed: 9021 });
  P(44.6, -13, [-1, 0], { dress: 'robe', hair: 'long', hat: 'none', cloth: 'cloth_ochre', cloth2: 'cloth_white' });
  L.push({ t: 'bench', at: [40.8, -13.4], y: height(40.8, -13.4), rot: Math.PI / 2, len: 2.0 }, { t: 'bench', at: [40.8, 12.6], y: height(40.8, 12.6), rot: Math.PI / 2, len: 2.0 });
  P(40.9, -12.7, [-1, 0], { pose: 'sit', dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' });
  P(40.9, 12.9, [-1, 0], { pose: 'sit', dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_white', hair: 'long', h: 1.5, over: 'collar' });
  // a boy with a carp on a string running along the shore, a dog after him
  P(39.5, 17, [0, -1], { h: 1.05, cloth: 'cloth_red', hair: 'long' });
  L.push({ t: 'animal', kind: 'dog', at: [39.2, 19], y: height(39.2, 19), rot: Math.PI, seed: 31 });
  // ducks (mandarins) on the water before the pier and in the bay to the north; a heap of cut reeds on the beach
  L.push({ t: 'chickens', kind: 'duck', at: [-4, 9], y: POND_LEVEL, rot: 1.2, n: 5, seed: 41 }, { t: 'chickens', kind: 'duck', at: [18, 24], y: POND_LEVEL, rot: 3.5, n: 4, seed: 43 }, { t: 'chickens', kind: 'duck', at: [-12, -26], y: POND_LEVEL, rot: 0.4, n: 3, seed: 45 });
  // on the hall's island before its steps: a monk sweeping the gravel with a besom, a monk with his staff, pilgrims at the podium's edge looking east over the pond
  const hx = HALL.origin[0], yi = 0.02;
  P(hx + 8.2, 10.5, [0.6, 1], { y: yi, dress: 'robe', hair: 'shaven', over: 'sash', cloth: 'cloth_grey', cloth2: 'cloth_ochre', hat: 'none', carry: 'besom' });
  P(hx + 10.4, -8.5, [1, 0], { y: yi, dress: 'robe', hair: 'shaven', over: 'sash', cloth: 'cloth_black', cloth2: 'cloth_ochre', hat: 'none', carry: 'staff', pose: 'staff' });
  P(hx + 9.8, 6.4, [1, 0.1], { y: yi, dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.5, over: 'collar' });
  P(hx + 9.9, 7.5, [1, 0.1], { y: yi, dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' });
  P(hx + 9.5, -6.2, [1, -0.1], { y: yi, dress: 'robe', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.48, over: 'collar' });
  L.push({ t: 'haystack', at: [47, 22], y: height(47, 22), kind: 'pole', seed: 7, s: 0.6 });
  return base('heian-uji-shore-life', 'life', L, [-RADIUS, -RADIUS, RADIUS, RADIUS], [0, 0]);
}
/** Lotus of the Pure Land in the pond's coves and lilies along the shallows (the plan in the 'ming' style, whose lotus field it is). */
function lotusPlan() {
  const inside = (x, z) => pondDistance(x, z) < -2.2 && islandDistance(x, z) > 2 && !(Math.abs(z) < 6 && x > -20) && !(z < -24 && z > -36 && x > 20);
  const E = [{ t: 'lotus', c: [20, 30], r: 12, n: 70, y: POND_LEVEL, seed: 11, inside }, { t: 'lotus', c: [-8, 44], r: 10, n: 50, y: POND_LEVEL, seed: 12, inside }, { t: 'lotus', c: [-10, -42], r: 11, n: 55, y: POND_LEVEL, seed: 13, inside }, { t: 'lotus', kind: 'lily', c: [26, -8], r: 8, n: 40, y: POND_LEVEL, seed: 14, inside }];
  return base('heian-uji-lotus', 'ming', E, [-36, -70, 44, 70], [30, 40]);
}
export const lotusCoves = lotusPlan();
export const viewPier = pierPlan();
export const [courtBoat, courtBoatPeople] = boatPlan();
export const shoreFolk = shoreLife();
