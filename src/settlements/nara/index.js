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
  ],
};
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
export async function town() { return [daibutsu, rushana, deer, ...(await houses())]; }
