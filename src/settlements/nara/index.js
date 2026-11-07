// Nara in 752: Tōdai-ji with the Great Buddha Hall and its pagodas, the capital's houses.
import '../../styles/nara/index.js';
import '../../styles/vernacular/index.js';
import todaiji from './plan.js';
import music from './music.js';
import { town as houses } from './town.js';
import '../../styles/chinese/index.js';
import { HALL, height } from './layout.js';
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
// the eye-opening of 9 April 752 (§10): the dance stage on the axis before the hall, the monks seated in rows either
// side of the way, the musicians on mats beside the stage, two dancers on it, the court at the foot of the hall's stairs
const STAGE = [0, -24.5], SA = 2.8, SH = 0.8;
const ceremonySet = {
  id: 'nara-ceremony-set', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-60, -40, 60, 14], entrance: { at: [0, 20], facing: 'n' },
  elements: [
    { t: 'bugaku_stage', c: STAGE, half: SA, y: 0, h: SH },
    { t: 'stair', rect: [STAGE[0] - 0.9, STAGE[1] + SA + 0.04, STAGE[0] + 0.9, STAGE[1] + SA + 1.24], dir: 'n', y0: 0, y1: SH, riser: 0.16, base: 0, mat: 'lacquer_red' },
    { t: 'stair', rect: [STAGE[0] - 0.9, STAGE[1] - SA - 1.24, STAGE[0] + 0.9, STAGE[1] - SA - 0.04], dir: 's', y0: 0, y1: SH, riser: 0.16, base: 0, mat: 'lacquer_red' },
  ],
};
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

// the deer of the hills: a few small herds on the lawns outside the temple's courts and up the
// grassy slope of Wakakusa, standing, grazing or lying folded (§6)
const deer = { id: 'nara-deer', style: 'nara', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-340, -340, 340, 340], entrance: { at: [0, 180], facing: 'n' }, elements: [] };
{
  let s = 7520; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const [hx, hz, n] of [[34, 72, 4], [-42, 102, 5], [58, 128, 3], [-24, 64, 2], [196, -24, 5], [232, 40, 4], [205, 96, 3], [182, -96, 4], [-70, 150, 3]]) {
    for (let i = 0; i < n; i++) {
      const x = hx + (r() - 0.5) * 12, z = hz + (r() - 0.5) * 12;
      deer.elements.push({ t: 'obj', kind: 'shika', at: [x, z], y: height(x, z), rot: r() * Math.PI * 2, seed: Math.floor(r() * 1e6) });
    }
  }
}
export async function town() { return [daibutsu, rushana, deer, ceremonySet, ceremonyPeople, ...(await houses())]; }
