// The Dam about 1670 (docs/settlements/amsterdam.md §2–§4): the Town Hall, the Nieuwe Kerk's tower,
// the Westerkerk; the canals' water and bridges; ships on the IJ.
import { RADIUS, C, RINGS, CANAL_W, HALL, DAM, IJ_Z, WATER, GROUND, westerkerk } from './layout.js';

const wk = westerkerk();
export const dam = {
  id: 'amsterdam-dam',
  name: { en: 'The Dam and the Town Hall', zh: '水坝广场与市政厅' },
  era: { en: 'Amsterdam, about 1670', zh: '阿姆斯特丹，约1670年' },
  style: 'dutch',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [20, -195], facing: 'n' },
  bounds: [Math.min(HALL[0], wk[0] - 30) - 2, IJ_Z - 2, DAM[2] + 32, Math.max(DAM[3], wk[1] + 30) + 2],
  view: [HALL[0] - 4, HALL[1] - 4, HALL[2] + 4, HALL[3] + 4],
  bakeTop: 60,
  elements: [
    { t: 'town_hall', rect: HALL, h: 33, y: GROUND },
    { t: 'stacked_tower', c: [DAM[2] + 12, DAM[1] - 10], s: 9, h: 60, y: GROUND },
    { t: 'block', rect: [DAM[2] + 8, DAM[1] - 6, DAM[2] + 30, DAM[1] + 40], y0: GROUND - 0.5, y1: GROUND + 20, mat: 'brick' },
    { t: 'stacked_tower', c: wk, s: 10, h: 85, y: GROUND },
    { t: 'block', rect: [wk[0] - 12, wk[1] + 5, wk[0] + 12, wk[1] + 45], y0: GROUND - 0.5, y1: GROUND + 18, mat: 'brick' },
    // ships on the IJ
    ...[-180, -110, -40, 40, 120, 190].map((x, k) => ({ t: 'ship', at: [x, IJ_Z - 30 - (k % 2) * 25], dir: [1, 0.1], len: 28 + (k % 3) * 4, y: WATER })),
  ],
  rooms: [{ id: 'dam', rect: DAM, y: GROUND, kind: 'open' }],
  walks: [Object.assign([[20, -195], [20, -230]], { y0: GROUND })],
};
// the canals' water and their bridges (radial streets crossing each ring)
const inCanal = (x, z) => Math.hypot(x, z) < RADIUS - 60 && z > C[1] + 20 && RINGS.some((R) => Math.abs(Math.hypot(x - C[0], z - C[1]) - R) < CANAL_W / 2 - 1.5);
export const canals = {
  id: 'amsterdam-canals', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'water_cells', rect: [-RADIUS + 60, C[1], RADIUS - 60, RADIUS - 60], y: WATER, cell: 1.5, inside: inCanal },
    { t: 'water_cells', rect: [-RADIUS + 60, -RADIUS + 60, RADIUS - 60, IJ_Z], y: WATER, cell: 2.5, inside: (x, z) => Math.hypot(x, z) < RADIUS - 60 && z < IJ_Z - 1 },
    ...[0.35, 0.8, 1.25, 1.7, 2.15, 2.6].flatMap((a) => RINGS.map((R) => {
      const x = C[0] + Math.cos(a) * R, z = C[1] + Math.sin(a) * R, alongX = Math.abs(Math.sin(a)) > Math.abs(Math.cos(a));
      return Math.hypot(x, z) < RADIUS - 70 ? { t: 'block', rect: alongX ? [x - 3, z - CANAL_W / 2 - 2, x + 3, z + CANAL_W / 2 + 2] : [x - CANAL_W / 2 - 2, z - 3, x + CANAL_W / 2 + 2, z + 3], y0: WATER - 2, y1: GROUND + 0.3, mat: 'brick', walk: true } : null;
    })).filter(Boolean),
  ],
};
export default dam;
