// The city round the temple (docs/settlements/madurai.md §5): single-storey houses with verandahs
// and tiled roofs in the blocks between the ring streets.
import { RADIUS, TANK, WALL, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'dravidian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 200], facing: 'n' } });
export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`madurai-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'tamil_house', simple: true, ...l }))));
  plans.push(festival());
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
