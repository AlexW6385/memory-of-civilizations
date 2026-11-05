// Versailles about 1690 (docs/settlements/versailles.md §2–§4).
import { RADIUS, CHATEAU, LOGIS, WINGS, PARTERRE, LATONA, APOLLO, CANAL, RISE } from './layout.js';

const y = RISE;
export const chateau = {
  id: 'versailles-chateau',
  name: { en: 'The Château and gardens of Versailles', zh: '凡尔赛宫及花园' },
  era: { en: 'French classicism, about 1690', zh: '法国古典主义，约1690年' },
  style: 'classical_fr',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [180, 0], facing: 'w' },
  bounds: [-345, -205, 152, 205],
  view: [CHATEAU[0] - 4, CHATEAU[1] - 4, CHATEAU[2] + 4, CHATEAU[3] + 4],
  bakeTop: 30,
  elements: [
    { t: 'range', rect: CHATEAU, h: 22, y, front: 'w' },
    { t: 'range', rect: LOGIS, h: 20, y, brick: true, roof: 'slate', front: 'e' },
    ...WINGS.map((r) => ({ t: 'range', rect: r, h: 20, y, front: 'we' })),
    { t: 'range', rect: [92, -64, 150, -42], h: 15, y, brick: true, roof: 'slate', front: 's' },
    { t: 'range', rect: [92, 42, 150, 64], h: 15, y, brick: true, roof: 'slate', front: 'n' },
    { t: 'parterre', rect: PARTERRE, y, water: true },
    { t: 'fountain', c: LATONA, r: 14, y: 0.6, kind: 'latona' },
    { t: 'fountain', c: APOLLO, r: 18, y: 0, kind: 'apollo', dir: [1, 0] },
  ],
  rooms: [{ id: 'parterre', rect: PARTERRE, y, kind: 'open' }],
  walks: [Object.assign([[180, 0], [100, 0]], { y0: y })],
};
export const canal = {
  id: 'versailles-canal', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-RADIUS + 50, -270, CANAL.x0, 270], y: -1, cell: 2, inside: (x, z) => Math.hypot(x, z) < RADIUS - 52 && ((x < CANAL.x0 - 1 && Math.abs(z) < CANAL.w / 2 - 1) || (Math.abs(x - CANAL.cross) < CANAL.crossW / 2 - 1 && Math.abs(z) < 259)) }],
};
export default chateau;
