// The city round the temple (docs/settlements/madurai.md §5): single-storey houses with verandahs
// and tiled roofs in the blocks between the ring streets.
import { RADIUS, TANK, WALL, GATES, PUDHU, SUNDARA, MEENAKSHI, HALL, lots } from './layout.js';
import { pudhuMandapam } from './plan.js';
const base = (id, elements) => ({ id, style: 'dravidian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 200], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`madurai-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'tamil_house', simple: true, ...l }))));
  plans.push(festival(), pudhuMandapam, { ...street(), style: 'life', center: [0, 60], near: 260 });
  return plans;
}

/**
 * The life of the temple and the city (docs/settlements/madurai.md §10): the temple elephants tied
 * by the outer court's inner street; one of the two great cars of the Chithirai festival on the
 * South Masi street with the crowd hauling on its ropes; worshippers bathing on the tank's steps,
 * walking in the courts, at the goddesses' hall.
 */
function festival() {
  const E = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 1650;
  const dress = [['wrap', 'cloth_white'], ['wrap', 'cloth_ochre'], ['robe', 'cloth_red'], ['wrap', 'cloth_white'], ['robe', 'cloth_green'], ['robe', 'cloth_indigo']];
  const fig = (x, z, y, dir, o = {}) => { const [d, c] = dress[seed % dress.length]; E.push({ t: 'figure', at: [x, z], y, rot: faceTo(dir), seed: seed++ * 7919, dress: d, cloth: c, cloth2: 'cloth_white', skin: seed % 3 ? 'skin_dark' : 'skin_medium', hat: seed % 4 === 0 ? 'turban' : 'none', hair: seed % 2 ? 'bun' : 'long', carry: 'none', pose: 'stand', feet: 'bare', ...o }); };
  // the elephants inside the south gate, by the wall, their keepers beside them
  E.push({ t: 'elephant', at: [6, 109], rot: Math.PI, seed: 1 }); E.push({ t: 'elephant', at: [14, 109.5], rot: Math.PI * 0.94, seed: 2 });
  fig(9.6, 111.5, 0, [-1, 0], { dress: 'wrap', cloth: 'cloth_white', hat: 'turban' }); fig(17.4, 110, 0, [-1, 0.3], { dress: 'wrap', cloth: 'cloth_ochre', pose: 'squat' });
  fig(4, 104, 0, [0.4, 1], { pose: 'talk' }); fig(5, 103.2, 0, [-0.3, 1], { carry: 'basket' });
  // the car on the South Masi street, drawn west, the crowd at its ropes and round it
  const zc = WALL[3] + 157;
  E.push({ t: 'ther', at: [44, zc], dir: 'w', rope: 34 });
  for (let x = 6; x < 36; x += 1.4) for (const sb of [-2.2, 2.2]) if ((x * 7 + sb) % 3 > 0.6) fig(x, zc + sb + (sb > 0 ? 0.55 : -0.55) * ((x * 13) % 2 ? 1 : -1) * 0.5, 0, [-1, 0], { carry: 'none' });
  for (const [x, dz] of [[52, -7], [55, 6.5], [36, -6.2], [60, -2], [30, 6], [49, 7.2], [57, -6.6]]) fig(x, zc + dz, 0, [44 - x, -dz], { pose: (x | 0) % 2 ? 'talk' : 'stand' });
  // bathing on the tank's steps (the north and east sides), others at the water's edge in the cloister
  for (const [i, x] of [[3, -88], [5, -80], [4, -71], [7, -64], [2, -58]]) fig(x, TANK[1] + 0.35 * i + 0.17, -0.25 * i, [0, 1], { pose: i > 3 ? 'squat' : 'stand', carry: i === 2 ? 'pot' : 'none' });
  for (const [i, z] of [[4, 40], [6, 50], [3, 58]]) fig(TANK[2] - 0.35 * i - 0.17, z, -0.25 * i, [-1, 0], { pose: 'squat' });
  // in the goddesses' hall and before its entrance
  for (const [x, z, d] of [[110, 40.5, [-1, 0]], [116, 39.4, [0, 1]], [121, 41.2, [-1, 0.2]], [133, 39, [-1, 0]], [134.2, 41.5, [-1, 0.2]]]) fig(x, z, x < 128 ? 0.5 : 0, d);
  return { id: 'madurai-festival', style: 'dravidian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 200], facing: 'n' } };
}

/**
 * The everyday life of the temple streets (docs/settlements/madurai.md §11): women selling jasmine strung and
 * loose from mats along the Chitrai street either side of the south gopuram; a priest at each shrine's
 * gopuram, worshippers with offerings before them; pilgrims and a cow in the Pudhu Mandapam's passage,
 * cows lying in the streets; a priest before the Nataraja.
 */
function street() {
  const E = [], face = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 4200;
  const pick = (a) => a[seed % a.length];
  const fig = (at, y, dir, o) => E.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, feet: 'bare', hat: 'none', carry: 'none', pose: 'stand', skin: seed % 3 ? 'skin_dark' : 'skin_medium', ...o });
  const priest = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'topknot', over: 'sash', beard: false, ...o });
  const woman = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', cloth: pick(['cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_ochre', 'cloth_maroon']), cloth2: pick(['cloth_ochre', 'cloth_red']), hair: 'bun', over: 'shawl', h: 1.48, ...o });
  const man = (at, y, dir, o = {}) => fig(at, y, dir, { dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', top: seed % 2 ? 'bare' : '', hair: 'short', hat: seed % 3 === 0 ? 'turban' : 'none', ...o });
  // the flower sellers on the Chitrai street, outside the south gopuram, facing the way in
  const zs = WALL[3] + 12 + 2.2;
  for (const [k, x] of [-34, -30.5, -9.5, -6, -2.5].entries()) {
    E.push({ t: 'goods_mat', at: [GATES.s[0] + x + (x > 0 ? 0 : 0), zs], y: 0, rot: face([0, -1]), seed: seed++, goods: ['heap', 'heap', 'baskets', 'heap'], produce: k % 2 ? ['cloth_white', 'cloth_white', 'cloth_red'] : ['cloth_white'] });
    woman([GATES.s[0] + x, zs + 0.95], 0, [0, -1], { pose: 'sit_ground' });
  }
  for (const [x, dz, o] of [[-26, 3.2, { carry: 'basket' }], [-13, 4.5, { pose: 'talk' }], [-14.2, 4.0, {}], [2, 5, { carry: 'pot' }]]) (x % 2 ? woman : man)([GATES.s[0] + x, zs + dz], 0, [0, -1], o);
  // at the two shrines' gopurams (inside the courts, before the passages): the priest, devotees with joined hands
  for (const [gx, gz, d] of [[SUNDARA[2], (SUNDARA[1] + SUNDARA[3]) / 2, 12], [MEENAKSHI[2], (MEENAKSHI[1] + MEENAKSHI[3]) / 2, 9]]) {
    priest([gx - d / 2 - 2.3, gz + 0.6], 0, [1, 0]);
    woman([gx - d / 2 - 3.6, gz - 0.5], 0, [1, 0], { pose: 'kneel', arms: 'pray' }); man([gx - d / 2 - 4.4, gz + 1.0], 0, [1, 0], { arms: 'pray' });
  }
  // before the Nataraja in the Thousand-Pillar Hall
  priest([(HALL[0] + HALL[2]) / 2 + 0.9, HALL[1] + 5.6], 0.5, [0, -1], { arms: 'pray' });
  // the Pudhu Mandapam: pilgrims walking through its passage, a cow lying there, a man seated by a pillar
  const pz = (PUDHU[1] + PUDHU[3]) / 2;
  for (const [x, dz, dir] of [[170, -1.5, 1], [176, 1.2, 1], [205, -0.8, -1], [231, 1.6, -1], [233, 0.9, -1]]) (x % 2 ? woman : man)([x, pz + dz], 1.2, [-dir, 0]);
  E.push({ t: 'animal', kind: 'zebu', at: [190, pz + 2.4], y: 1.2, rot: 1.3, seed: 31, mat: 'hide_white', graze: false });
  man([214, pz - 3.7], 1.2, [0, 1], { pose: 'sit_ground' });
  // cows in the streets
  for (const [x, z, rot] of [[60, WALL[3] + 19, 0.6], [-90, WALL[3] + 17, 2.4], [WALL[2] + 18, 60, 4.2], [WALL[0] - 19, -70, 1.9], [-20, WALL[3] + 80, 3.1]]) E.push({ t: 'animal', kind: 'zebu', at: [x, z], y: 0, rot, seed: seed++, mat: pick(['hide_white', 'hide_grey', 'hide_white']) });
  return { id: 'madurai-street-life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 200], facing: 'n' } };
}
