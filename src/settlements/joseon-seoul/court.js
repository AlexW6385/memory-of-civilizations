// The throne court in session (docs/settlements/joseon-seoul.md §11, §16): the officials at their rank stones in
// files of unequal depth, the royal standards on their poles either side of the way, the bodyguard with spears,
// the eunuch officials and the palace women at the platform's foot, clerks waiting in the cloister, the
// Heungnyemun court with the officials' horses and their grooms, ducks on the Geumcheon. Plan data, world coordinates.
import { RADIUS, STREAM } from './layout.js';

const base = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], elements, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 70], facing: 'n' }, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const ARRIVAL_Z = 83.5;

export function courtPlans() {
  const rand = rng(1888), F = [], S = [];
  const skin = () => (rand() < 0.6 ? 'skin_light' : 'skin_medium');
  const sd = () => Math.floor(rand() * 1e9);
  const fig = (x, z, rot, extra = {}) => F.push({ t: 'figure', at: [x, z], y: extra.y ?? 0.04, rot, seed: sd(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', skin: skin(), hat: 'none', over: 'belt', h: 1.62 + rand() * 0.1, ...extra });
  // the ranks: the first six stones' files only reach the arrival's side view; each file of a rank deeper than the last, the
  // gaps in them where an official is absent, no two exactly in line, the beards and heights as men are
  for (let i = 0; i < 7; i++) for (const sx of [-1, 1]) {
    const high = i < 4, z = 59 + i * 2.25, n = high ? 3 : 5;
    for (let k = 0; k < n; k++) {
      if (rand() < (high ? 0.05 : 0.18)) continue;
      const x = sx * (8.6 + k * 1.02 + (rand() - 0.5) * 0.3), za = z + (rand() - 0.5) * 0.42;
      fig(x, za, (rand() - 0.5) * 0.14 + (k ? (rand() - 0.5) * 0.1 : 0), { cloth: high ? 'cloth_red' : (sx < 0 && k > 1 ? 'cloth_blue' : 'cloth_black'), cloth2: high ? 'cloth_indigo' : 'cloth_black', hat: 'cap', hatMat: high ? 'gilt_bronze' : 'lacquer_black', arms: rand() < 0.8 ? 'clasp' : 'hang', beard: rand() < 0.6, pose: rand() < 0.08 ? 'talk' : 'stand' });
    }
  }
  // the royal standards: tall poles with a gilt finial, a cross-bar and a flag of each colour of the five directions, in two ranks either side of the way
  const FLAG = ['cloth_blue', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_black', 'cloth_green'];
  const E = [];
  [[54, 17.5], [54, 25.5], [54, 33.5], [66, 20], [66, 28], [74, 23]].forEach(([z, ax], j) => {
    for (const sx of [-1, 1]) {
      const x = sx * ax, c = FLAG[(j + (sx > 0 ? 3 : 0)) % FLAG.length];
      E.push({ t: 'block', rect: [x - 0.06, z - 0.06, x + 0.06, z + 0.06], y0: 0, y1: 6.2, mat: 'timber', collide: true });
      E.push({ t: 'block', rect: [x - 0.9, z - 0.04, x + 0.9, z + 0.04], y0: 5.75, y1: 5.85, mat: 'timber', collide: false });
      E.push({ t: 'block', rect: [x - 0.8, z - 0.02, x + 0.8, z + 0.02], y0: 3.6, y1: 5.75, mat: c, collide: false });
      E.push({ t: 'block', rect: [x - 0.8, z - 0.025, x + 0.8, z + 0.025], y0: 3.6, y1: 3.75, mat: 'gilt_bronze', collide: false });
      E.push({ t: 'block', rect: [x - 0.09, z - 0.09, x + 0.09, z + 0.09], y0: 6.2, y1: 6.5, mat: 'gilt_bronze', collide: false });
    }
  });
  // the bodyguard on either side of the royal path: spears grounded, the red coat, three pairs
  for (const z of [62, 66.5, 71]) for (const sx of [-1, 1]) fig(sx * 5.0, z, Math.PI / 2 * -sx, { cloth: 'cloth_red', cloth2: 'cloth_blue', hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', h: 1.7 + rand() * 0.06 });
  // at the platform's foot: the eunuch officials (blue robe, the black hat) and the palace women with trays and jars
  for (const sx of [-1, 1]) fig(sx * 5.6, 53.4, Math.PI, { cloth: 'cloth_blue', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', arms: 'clasp', beard: false, h: 1.6 });
  [[43.5, 55.2, 0.8], [44.8, 56.4, 0.6], [45.6, 54.4, 0.9], [-43.0, 55.0, -0.8], [-44.4, 56.2, -0.5]].forEach(([x, z, r], k) => fig(x, z, Math.PI + r, { cloth: k % 2 ? 'cloth_red' : 'cloth_green', cloth2: 'cloth_white', hair: 'bun', over: 'none', skin: 'skin_light', h: 1.5 + rand() * 0.05, carry: k % 3 === 0 ? 'basket' : 'none', beard: false }));
  // clerks and runners waiting on the cloister floors, cross-legged by the posts, brush-boxes beside them
  for (const [x, z0, z1, face] of [[-60.6, 6, 80, 1], [60.6, 6, 80, -1]]) for (let z = z0; z < z1; z += 9 + rand() * 6) fig(x, z, face > 0 ? -Math.PI / 2 : Math.PI / 2, { y: 0.3, pose: 'cross', arms: 'cross', cloth: rand() < 0.5 ? 'cloth_white' : 'cloth_blue', hat: 'brim', hatMat: 'lacquer_black', beard: rand() < 0.5 });
  // the Heungnyemun court: the officials' horses and grooms waiting at the south, men squatting by them
  [[-24, 106], [-30, 110], [26, 108], [32, 104], [-16, 118], [20, 120]].forEach(([x, z], k) => {
    const rot = k % 2 ? -Math.PI / 2 : Math.PI / 2;
    F.push({ t: 'animal', kind: 'horse', at: [x, z], y: 0.04, rot, seed: sd(), graze: false, gear: true, mat: ['hide_brown', 'hide_black', 'hide_tan'][k % 3] });
    fig(x + Math.sin(rot) * -1.7, z - Math.cos(rot) * -0.6, rot + Math.PI, { dress: 'trousers', cloth: 'cloth_white', cloth2: 'linen', hair: 'topknot', hat: k % 2 ? 'none' : 'straw', hatMat: 'thatch', carry: 'staff', pose: 'staff', len: 1.2, staffMat: 'timber', h: 1.6, over: 'none' });
  });
  for (const [x, z] of [[-34, 114], [-33, 115.2], [36, 112], [37, 113.3]]) fig(x, z, x < 0 ? 1.6 : -1.6, { dress: 'trousers', cloth: 'cloth_white', cloth2: 'linen', hair: 'topknot', hat: 'none', pose: 'squat', over: 'none' });
  // the gate guards, two by two, spears grounded: before Geunjeongmun, facing south, and before Gwanghwamun, facing the avenue
  const gd = (x, z) => fig(x, z, Math.PI, { cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', h: 1.66 + rand() * 0.08 });
  for (const sx of [-1, 1]) { gd(sx * 4.2, 97.5); gd(sx * 6.0, 97.5); gd(sx * 10.5, 246); gd(sx * 5.2, 246); }
  // the guards at the Heungnyemun gate, outside it, facing the stream
  for (const sx of [-1, 1]) for (const dx of [3.6, 6.4]) fig(sx * dx, 165, 0, { cloth: 'cloth_indigo', cloth2: 'cloth_red', hat: 'brim', hatMat: 'cloth_black', pose: 'staff', carry: 'staff', len: 2.6, staffMat: 'timber', h: 1.7 + rand() * 0.06 });
  // the Geumcheon below Yeongjegyo: ducks on the water
  const Zs = (STREAM.z0 + STREAM.z1) / 2;
  F.push({ t: 'chickens', kind: 'duck', at: [-36, Zs], y: -1.2, rot: 0.3, n: 5, seed: 17 }, { t: 'chickens', kind: 'duck', at: [48, Zs], y: -1.2, rot: 2.9, n: 4, seed: 19 });
  return [{ ...base('joseon-seoul-court', 'life', F), center: [0, 100], near: 300 }, base('joseon-seoul-standards', 'joseon', E, { center: [0, 62], near: 300 })];
}
