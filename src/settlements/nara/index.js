// Nara in 752: Tōdai-ji with the Great Buddha Hall and its pagodas, the capital's houses.
import '../../styles/nara/index.js';
import '../../styles/vernacular/index.js';
import todaiji from './plan.js';
import music from './music.js';
import { town as houses } from './town.js';
import '../../styles/chinese/index.js';
import { HALL, height, KOFUKU } from './layout.js';
export { music };
export const landmarks = [{ plan: todaiji, music }];
// the Great Buddha (Vairocana) in bronze, 15 m seated on his lotus, in the hall; the two attendant
// bodhisattvas; the hall's inner rings of columns, its coffered ceiling, the stone dais, the altar and
// the banners hung from the beams
const [hx0, hz0, hx1, hz1] = HALL, FLOOR = 2.2, CEIL = FLOOR + 21 - 0.2;
const cx = (hx0 + hx1) / 2, cz = (hz0 + hz1) / 2 - 4, DAIS = 0.7, Y = FLOOR + DAIS;
// the Great Buddha itself is drawn by the nara style (daibutsu, src/styles/nara/daibutsu.js) on its
// lotus throne, r 9.2 m; the two attendants stand either side of it
const statues = [[cx, cz - 1, 0], [cx - 15, cz + 2, 7], [cx + 15, cz + 2, 7]];
const inner = [];
const bx = (hx1 - hx0) / 11, bz = (hz1 - hz0) / 7;
// the two inner rings of posts (bays 1 and 2 in from the walls), clear of the statues and the way to them
for (let i = 1; i <= 10; i++) for (let j = 1; j <= 6; j++) {
  const ring = Math.min(i, 11 - i, j, 7 - j);
  if (ring > 2) continue;
  const x = hx0 + i * bx, z = hz0 + j * bz;
  if (statues.some(([sx, sz, h]) => Math.hypot(x - sx, z - sz) < (h ? 8 : 10.5)) || (Math.abs(x) < 24 && z > cz - 8 && z < hz1 - bz * 0.5 && ring > 1)) continue;
  inner.push({ t: 'column', at: [x, z], y: FLOOR, h: CEIL - FLOOR, d: 0.95 });
}
// the coffered ceiling: the great beams over every bay line, a lattice of smaller ribs between them
const ceil = [{ t: 'slab', rect: [hx0 + 0.3, hz0 + 0.3, hx1 - 0.3, hz1 - 0.3], y0: CEIL - 0.08, y1: CEIL - 0.02, mat: 'paint_caihua' }];
for (let i = 1; i < 11; i++) ceil.push({ t: 'beam', a: [hx0 + i * bx, hz0 + 0.3], b: [hx0 + i * bx, hz1 - 0.3], w: 0.6, y: CEIL - 0.95, h: 0.87, mat: 'timber_red' });
for (let j = 1; j < 7; j++) ceil.push({ t: 'beam', a: [hx0 + 0.3, hz0 + j * bz], b: [hx1 - 0.3, hz0 + j * bz], w: 0.55, y: CEIL - 0.8, h: 0.72, mat: 'timber_red' });
for (let i = 0; i < 44; i++) if (i % 4) ceil.push({ t: 'beam', a: [hx0 + (i / 4) * bx, hz0 + 0.3], b: [hx0 + (i / 4) * bx, hz1 - 0.3], w: 0.14, y: CEIL - 0.32, h: 0.24, mat: 'timber_red' });
for (let j = 0; j < 28; j++) if (j % 4) ceil.push({ t: 'beam', a: [hx0 + 0.3, hz0 + (j / 4) * bz], b: [hx1 - 0.3, hz0 + (j / 4) * bz], w: 0.14, y: CEIL - 0.3, h: 0.22, mat: 'timber_red' });
// banners of silk hanging from the beams either side of the statues
const banners = [];
const BAN = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
let k = 0;
for (const x of [-28, -22, 22, 28]) for (const z of [cz - 6, cz + 2, cz + 10]) {
  const m = BAN[k++ % BAN.length];
  banners.push({ t: 'beam', a: [x - 0.55, z], b: [x + 0.55, z], w: 0.03, y: CEIL - 9.5, h: 8.6, mat: m });
  banners.push({ t: 'beam', a: [x - 0.7, z], b: [x + 0.7, z], w: 0.12, y: CEIL - 0.95, h: 0.1, mat: 'gilt_bronze' });
  banners.push({ t: 'beam', a: [x - 0.62, z], b: [x + 0.62, z], w: 0.08, y: CEIL - 9.6, h: 0.12, mat: 'gilt_bronze' });
}
const daibutsu = {
  id: 'nara-daibutsu', style: 'chinese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [hx0, hz0, hx1, hz1], entrance: { at: [0, 180], facing: 'n' },
  elements: [
    // the dais of dressed stone, its edge moulded; the altar before the Buddha
    { t: 'block', rect: [cx - 22, cz - 11, cx + 22, cz + 11], y0: FLOOR - 0.05, y1: Y - 0.12, mat: 'granite_block' },
    { t: 'block', rect: [cx - 22.2, cz - 11.2, cx + 22.2, cz + 11.2], y0: Y - 0.12, y1: Y, mat: 'granite_block', collide: false },
    { t: 'block', rect: [cx - 3.2, cz + 8.6, cx + 3.2, cz + 10.0], y0: Y, y1: Y + 0.95, mat: 'lacquer_red' },
    { t: 'block', rect: [cx - 3.35, cz + 8.45, cx + 3.35, cz + 10.15], y0: Y + 0.95, y1: Y + 1.02, mat: 'gilt_bronze', collide: false },
    // the way up the court: a flagged path of dressed stone from the Middle Gate to the stage's steps, kerbed, a drain's stones either side
    { t: 'block', rect: [-2.5, -19.6, 2.5, 34], y0: -0.1, y1: 0.05, mat: 'flagstone', collide: false },
    { t: 'block', rect: [-2.7, -19.6, -2.5, 34], y0: -0.1, y1: 0.1, mat: 'granite_block', collide: false },
    { t: 'block', rect: [2.5, -19.6, 2.7, 34], y0: -0.1, y1: 0.1, mat: 'granite_block', collide: false },
    // the avenue from the Great South Gate south: the stone-flagged way 6 m wide and the kerb stones of its gutters
    { t: 'block', rect: [-3, 152, 3, 183], y0: -0.1, y1: 0.04, mat: 'flagstone', collide: false },
    { t: 'block', rect: [-3.2, 152, -3, 183], y0: -0.1, y1: 0.12, mat: 'granite_block', collide: false },
    { t: 'block', rect: [3, 152, 3.2, 183], y0: -0.1, y1: 0.12, mat: 'granite_block', collide: false },
    ...inner, ...ceil, ...banners,
  ],
};
// the Great Buddha, Rushana, in bronze as at the eye-opening of 752, on its lotus throne
const rushana = {
  id: 'nara-rushana', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [hx0, hz0, hx1, hz1], entrance: { at: [0, 180], facing: 'n' },
  elements: [
    { t: 'obj', kind: 'daibutsu', at: [cx, cz - 1], y: Y, h: 15.8, dir: [0, 1], mat: 'bronze' },
    // the attendants: Kokūzō on the west (the visitor's left), Nyoirin Kannon on the east (§4)
    { t: 'obj', kind: 'bosatsu', bodhisattva: 'kokuzo', at: [cx - 15, cz + 2], y: Y, h: 5.2, dir: [0, 1] },
    { t: 'obj', kind: 'bosatsu', bodhisattva: 'nyoirin', at: [cx + 15, cz + 2], y: Y, h: 5.2, dir: [0, 1] },
    // the offerings on the altar: the censer, two vases of lotus, two lamps (§10)
    { t: 'nara_altar_set', at: [cx, cz + 9.3], y: Y + 1.02, w: 6.4 },
  ],
};
// the eye-opening on the 9th day of the 4th month of 752 (26 May; §10): the dance stage on the axis before the hall, the monks seated in rows either
// side of the way, the musicians on mats beside the stage, two dancers on it, the court at the foot of the hall's stairs
const STAGE = [0, -24.5], SA = 2.8, SH = 0.8;
const ceremonySet = {
  id: 'nara-ceremony-set', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-60, -90, 60, 14], entrance: { at: [0, 20], facing: 'n' },
  elements: [
    { t: 'bugaku_stage', c: STAGE, half: SA, y: 0, h: SH },
    { t: 'stair', rect: [STAGE[0] - 0.9, STAGE[1] + SA + 0.04, STAGE[0] + 0.9, STAGE[1] + SA + 1.24], dir: 'n', y0: 0, y1: SH, riser: 0.16, base: 0, mat: 'lacquer_red' },
    { t: 'stair', rect: [STAGE[0] - 0.9, STAGE[1] - SA - 1.24, STAGE[0] + 0.9, STAGE[1] - SA - 0.04], dir: 's', y0: 0, y1: SH, riser: 0.16, base: 0, mat: 'lacquer_red' },
  ],
};
// the upper gallery (§15): a flight up the west wall to a timber gallery at 13 m beside the Buddha's face, round behind the figure and down the east side
{
  const GY = 13, bzz = (hz1 - hz0) / 7, bxx = (hx1 - hx0) / 11;
  const holes = (sx) => [1, 2, 3, 4].map((j) => { const z = hz0 + j * bzz, x = hx0 + (sx < 0 ? 1 : 10) * bxx; return [x - 0.75, z - 0.75, x + 0.75, z + 0.75]; });
  for (const sx of [-1, 1]) {
    const xa = sx < 0 ? -42 : 34, xb = sx < 0 ? -34 : 42, sa = sx < 0 ? -41.5 : 38.5;
    ceremonySet.elements.push({ t: 'stair', rect: [sa, -56, sa + 3, -38], dir: 'n', y0: FLOOR, y1: GY, riser: 0.2, base: FLOOR, mat: 'timber' });
    ceremonySet.elements.push({ t: 'slab', rect: [xa, hz0 + 0.6, xb, -56], y0: GY - 0.4, y1: GY, mat: 'timber', walk: true, holes: holes(sx) });
    for (const z of [-64.5, -72, -80]) ceremonySet.elements.push({ t: 'block', rect: [sx < 0 ? -41.6 : 40.8, z - 0.4, sx < 0 ? -40.8 : 41.6, z + 0.4], y0: FLOOR, y1: GY - 0.4, mat: 'timber_red' });
    ceremonySet.elements.push({ t: 'beam', a: [sx < 0 ? -34.1 : 34.1, -78.8], b: [sx < 0 ? -34.1 : 34.1, -56.5], w: 0.12, y: GY, h: 1.0, mat: 'lacquer_red' });
  }
  ceremonySet.elements.push({ t: 'slab', rect: [-34, hz0 + 0.6, 34, hz0 + 5.6], y0: GY - 0.4, y1: GY, mat: 'timber', walk: true });
  ceremonySet.elements.push({ t: 'beam', a: [-34, hz0 + 5.7], b: [34, hz0 + 5.7], w: 0.12, y: GY, h: 1.0, mat: 'lacquer_red' });
  for (const x of [-20, 0, 20]) ceremonySet.elements.push({ t: 'block', rect: [x - 0.4, hz0 + 2.6, x + 0.4, hz0 + 3.4], y0: FLOOR, y1: GY - 0.4, mat: 'timber_red' });
}
const ceremonyPeople = { id: 'nara-ceremony', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 20], facing: 'n' }, elements: [] };
{
  const P = ceremonyPeople.elements, faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 7521;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const fig = (x, z, y, dir, o) => P.push({ t: 'figure', at: [x, z], y, rot: faceTo(dir) + (r() - 0.5) * 0.12, seed: Math.floor(r() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', ...o });
  // the monks: four rows a side on rush mats, facing the hall, the way up the axis (|x| < 9) left open
  for (const sd of [-1, 1]) for (let row = 0; row < 4; row++) {
    const z = -6 + row * 2.4, xa = sd * 10, xb = sd * 33;
    ceremonySet.elements.push({ t: 'block', rect: [Math.min(xa, xb) - 0.6, z - 0.7, Math.max(xa, xb) + 0.6, z + 0.7], y0: -0.1, y1: 0.03, mat: 'reed_mat', collide: false });
    for (let k = 0; k < 12; k++) {
      const x = xa + sd * k * 2.0;
      fig(x, z, 0.03, [0, -1], { pose: 'cross', arms: r() < 0.5 ? 'pray' : undefined, hair: 'shaven', cloth: ['cloth_ochre', 'cloth_brown', 'cloth_grey', 'cloth_ochre'][Math.floor(r() * 4)], cloth2: r() < 0.6 ? 'cloth_ochre' : 'cloth_maroon', over: 'sash', beard: false });
    }
  }
  // the musicians of the Tang and Korean music on mats either side of the stage, facing it: mouth organs and flutes,
  // lutes and zithers, drums
  const kinds = ['flute', 'flute', 'lute', 'harp', 'drum', 'flute'];
  for (const sd of [-1, 1]) {
    const x0 = sd * 6.5;
    ceremonySet.elements.push({ t: 'block', rect: [Math.min(x0, x0 + sd * 3.4), STAGE[1] - 4.2, Math.max(x0, x0 + sd * 3.4), STAGE[1] + 4.2], y0: -0.1, y1: 0.03, mat: 'reed_mat', collide: false });
    kinds.forEach((pose, i) => fig(x0 + sd * (1.0 + (i % 2) * 1.5), STAGE[1] - 3.2 + Math.floor(i / 2) * 2.6, 0.03, [-sd, 0], { pose, cloth: sd < 0 ? 'cloth_red' : 'cloth_green', cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar' }));
  }
  // two dancers on the stage, in the red of the music of the left and the green of the right
  fig(STAGE[0] - 1.1, STAGE[1] + 0.4, SH, [0.4, 1], { pose: 'plieR', cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'cap', hatMat: 'gilt_bronze', over: 'cape' });
  fig(STAGE[0] + 1.1, STAGE[1] - 0.3, SH, [-0.4, 1], { pose: 'step', cloth: 'cloth_green', cloth2: 'cloth_ochre', hat: 'cap', hatMat: 'gilt_bronze', over: 'cape' });
  // the court: officials in their ranks' colours standing either side of the hall's stairs, facing the axis
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) fig(sd * (9 + (i % 3) * 1.6), -31.5 + Math.floor(i / 3) * 1.8 + (i % 3) * 0.2, 0, [-sd, 0.2], { cloth: ['cloth_maroon', 'cloth_red', 'cloth_green', 'cloth_indigo', 'cloth_red'][i], cloth2: 'cloth_white', hat: 'cap', hatMat: 'lacquer_black', over: 'collar', beard: r() < 0.5 });
}

// the court and the gate living: monks sweeping the gravel, pilgrims praying before the hall, guards of the Great South Gate,
// travellers and an ox-driver on the avenue, officials arriving (§14)
{
  const P = ceremonyPeople.elements, faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 7599;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const fig = (x, z, dir, o) => P.push({ t: 'figure', at: [x, z], y: 0, rot: faceTo(dir) + (r() - 0.5) * 0.3, seed: Math.floor(r() * 1e9), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', ...o });
  const MC = ['cloth_ochre', 'cloth_brown', 'cloth_grey'];
  for (const [x, z] of [[-14, 18], [16, 24], [-26, 4], [38, -14], [-40, 30], [46, 28]]) fig(x, z, [r() - 0.5, r() - 0.5], { hair: 'shaven', carry: 'broom', cloth: MC[Math.floor(r() * 3)], cloth2: 'cloth_ochre', over: 'sash' });
  for (const [x, z] of [[-4.5, 9], [3.5, 12], [-1.5, 3], [2, -4], [-4, -12], [4.5, -14]]) fig(x, z, [0, -1], { pose: 'pray', hair: r() < 0.5 ? 'topknot' : 'bun', cloth: ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green'][Math.floor(r() * 4)], cloth2: 'cloth_white', over: 'sash' });
  for (const x of [-7, 7]) fig(x, 146, [-Math.sign(x) * 0.3, 1], { hat: 'cap', hatMat: 'lacquer_black', carry: 'staff', cloth: 'cloth_maroon', cloth2: 'cloth_white', over: 'collar', beard: true });
  for (const [x, z, d] of [[-1.5, 162, [0, -1]], [2, 172, [0, -1]], [-2, 185, [0, 1]], [1.5, 198, [0, -1]], [-2.5, 210, [0, -1]], [2, 224, [0, 1]]]) fig(x, z, d, { dress: r() < 0.5 ? 'trousers' : 'robe', hair: 'topknot', hat: r() < 0.5 ? 'straw' : 'none', carry: ['bundle', 'basket', 'staff', 'pole'][Math.floor(r() * 4)], cloth: ['cloth_indigo', 'cloth_brown', 'cloth_grey'][Math.floor(r() * 3)], cloth2: 'cloth_indigo', over: 'sash' });
}

// the court at the hour of the lamps: iron fire-baskets on posts either side of the way, sellers of incense, lotus and
// offering cakes at the court's south end, pilgrim families in groups, deer at the court's edges, a pilgrims' rest under cloth
const courtLife = { id: 'nara-court-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 20], facing: 'n' }, elements: [] };
{
  const L = courtLife.elements, faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 7611;
  const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const sd = () => Math.floor(r() * 1e9);
  const CLS = ['cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_brown', 'cloth_grey'];
  const fig = (x, z, dir, o) => L.push({ t: 'figure', at: [x, z], y: 0, rot: faceTo(dir) + (r() - 0.5) * 0.4, seed: sd(), dress: 'robe', skin: 'skin_light', hat: 'none', carry: 'none', over: 'sash', cloth: CLS[Math.floor(r() * 6)], cloth2: CLS[Math.floor(r() * 6)], ...o });
  // lit fire-baskets either side of the flagged way (6 m clear of the arrival and beyond)
  for (const z of [10, -2, -14]) for (const s of [-1, 1]) L.push({ t: 'lantern', kind: 'iron', at: [s * 3.4, z], y: 0, h: 2.3 });
  // offering sellers at the court's south end, facing the Middle Gate's pilgrims
  for (const [x, z, aw, goods] of [[-19, 31, 'cloth_white', ['basket', 'produce']], [19, 31, 'cloth_ochre', ['cloth', 'basket']], [-31, 25, 'cloth_indigo', ['produce', 'produce', 'basket']], [32, 26, 'cloth_white', ['basket', 'cloth']]]) {
    L.push({ t: 'stall', at: [x, z], y: 0, rot: faceTo([0, 1]), seed: sd(), w: 3.2, d: 1.3, awning: aw, stripe: null, goods });
    fig(x, z - 1.4, [0, 1], { pose: r() < 0.5 ? 'sit' : 'stand' });
    fig(x + (r() - 0.5) * 2, z + 2.4, [0, -1], { pose: 'stand', hair: r() < 0.5 ? 'bun' : 'topknot' });
  }
  for (const [x, z] of [[-12, 36], [12, 36], [-40, 33], [41, 34]]) { L.push({ t: 'goods_mat', at: [x, z], y: 0, rot: faceTo([0, 1]), seed: sd(), goods: ['heap', 'baskets'], produce: ['cloth_white', 'cloth_ochre', 'cloth_green'] }); fig(x, z - 1.1, [0, 1], { pose: 'sit_ground', hair: 'bun' }); }
  // a pilgrims' rest: a tea table under an awning, bench, bundles and sacks, a carter's ox resting
  L.push({ t: 'stall', at: [-58, 14], y: 0, rot: faceTo([1, 0]), seed: sd(), w: 3.4, d: 1.3, awning: 'cloth_white', stripe: null, goods: ['basket', 'basket'] });
  L.push({ t: 'tea_table', at: [-53, 12], y: 0, rot: 0 }, { t: 'bench', at: [-53, 17], y: 0, rot: 0 }, { t: 'sacks', at: [-61, 20], y: 0, rot: 0.5, seed: sd() }, { t: 'sacks', at: [62, 18], y: 0, rot: 2, seed: sd() });
  L.push({ t: 'cart', kind: 'two', beast: 'ox', load: 'baskets', at: [64, 22], y: 0, rot: 1.2, seed: sd() });
  // pilgrim groups: family clusters, a monk guiding, children, a few kneeling facing the hall
  const groups = [[-24, 14], [26, 15], [-46, 22], [48, 10], [-34, -22], [36, -24], [-52, -8], [54, -12], [-18, 24], [22, 22], [-68, 4], [70, 2]];
  for (const [gx, gz] of groups) {
    const n = 3 + Math.floor(r() * 3), d = [r() - 0.5, -1];
    for (let i = 0; i < n; i++) {
      const kid = i === n - 1 && r() < 0.5;
      fig(gx + (i - n / 2) * 1.2 + (r() - 0.5) * 0.6, gz + (r() - 0.5) * 1.6, d, { pose: r() < 0.3 ? 'pray' : r() < 0.4 ? 'talk' : 'stand', hair: r() < 0.5 ? 'bun' : 'topknot', hat: r() < 0.3 ? 'straw' : 'none', carry: r() < 0.25 ? 'bundle' : 'none', ...(kid ? { child: true } : {}) });
    }
  }
  // two monks of the Tōdai-ji with a pilgrim procession toward the hall, one bearing a staff
  for (let i = 0; i < 6; i++) fig(-2 + (i % 2) * 3.2 - 1, 2 - i * 3.4, [0, -1], { hair: i < 2 ? 'shaven' : 'topknot', carry: i === 0 ? 'staff' : 'none', cloth: i < 2 ? 'cloth_ochre' : CLS[i % 6], cloth2: i < 2 ? 'cloth_maroon' : 'cloth_white' });
}

// the deer of the hills: a few small herds on the lawns outside the temple's courts and up the
// grassy slope of Wakakusa, standing, grazing or lying folded (§6)
const deer = { id: 'nara-deer', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 180], facing: 'n' }, elements: [] };
{
  let s = 7520; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const [hx, hz, n] of [[34, 72, 4], [-42, 102, 5], [58, 128, 3], [-24, 64, 2], [196, -24, 5], [232, 40, 4], [205, 96, 3], [182, -96, 4], [-70, 150, 3], [-70, 36, 3], [72, 40, 3], [-76, -20, 2]]) {
    for (let i = 0; i < n; i++) {
      const x = hx + (r() - 0.5) * 12, z = hz + (r() - 0.5) * 12;
      deer.elements.push({ t: 'obj', kind: 'shika', at: [x, z], y: height(x, z), rot: r() * Math.PI * 2, seed: Math.floor(r() * 1e6) });
    }
  }
}
// the insides of Kōfuku-ji's Central Golden Hall and of the Hokke-dō: a dais of stone, the main image with its attendants,
// the four guardian kings at the corners (the nio figures stand in for the Heavenly Kings), an altar with the offerings (§15)
const shrineStone = { id: 'nara-shrine-stone', style: 'chinese', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 180], facing: 'n' }, elements: [] };
const shrineFigures = { id: 'nara-shrine-figures', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 180], facing: 'n' }, elements: [] };
{
  const [kx0, kz0] = KOFUKU.block;
  const halls = [
    { c: [kx0 + 28, kz0 + 20], y: 1.2, w: 7, back: 7.5, main: 5.4, att: 2.6, kings: [[-12.5, -2.6], [12.5, -2.6], [-12.5, 5.2], [12.5, 5.2]], kh: 2.6 },
    { c: [119, -53], y: 1.0, w: 5.4, back: 7.5, main: 3.8, att: 2.4, kings: [[-11.5, -4], [11.5, -4], [-11.5, 3], [11.5, 3]], kh: 2.8 },
  ];
  for (const h of halls) {
    const [hx, hz] = h.c, bz = hz - h.back, Yd = h.y + 0.5;
    shrineStone.elements.push({ t: 'block', rect: [hx - h.w - 4.5, bz - 0.5, hx + h.w + 4.5, bz + 6.8], y0: h.y - 0.05, y1: Yd - 0.1, mat: 'granite_block' }, { t: 'block', rect: [hx - h.w - 4.7, bz - 0.7, hx + h.w + 4.7, bz + 7.0], y0: Yd - 0.1, y1: Yd, mat: 'granite_block', collide: false });
    shrineStone.elements.push({ t: 'block', rect: [hx - 1.4, bz + 7.2, hx + 1.4, bz + 8.0], y0: h.y, y1: h.y + 0.8, mat: 'lacquer_red' }, { t: 'block', rect: [hx - 1.5, bz + 7.1, hx + 1.5, bz + 8.1], y0: h.y + 0.8, y1: h.y + 0.86, mat: 'gilt_bronze', collide: false });
    shrineFigures.elements.push({ t: 'obj', kind: 'daibutsu', at: [hx, bz + 3.2], y: Yd, h: h.main, dir: [0, 1], mat: 'bronze' });
    shrineFigures.elements.push({ t: 'obj', kind: 'bosatsu', bodhisattva: 'kokuzo', at: [hx - h.w + 0.5, bz + 3.8], y: Yd, h: h.att, dir: [0, 1] }, { t: 'obj', kind: 'bosatsu', bodhisattva: 'nyoirin', at: [hx + h.w - 0.5, bz + 3.8], y: Yd, h: h.att, dir: [0, 1] });
    h.kings.forEach(([dx, dz], i) => shrineFigures.elements.push({ t: 'obj', kind: 'nio', form: i % 2 ? 'un' : 'a', at: [hx + dx, bz + 4 + dz], y: h.y, h: h.kh, dir: [dx < 0 ? 1 : -1, 0.3] }));
    shrineFigures.elements.push({ t: 'nara_altar_set', at: [hx, bz + 7.6], y: h.y + 0.86, w: 3 });
  }
}
export async function town() { return [shrineStone, shrineFigures, daibutsu, rushana, deer, ceremonySet, ceremonyPeople, courtLife, ...(await houses())]; }
