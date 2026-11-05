// The terrace of Persepolis about 480 BC (docs/settlements/persepolis.md §2–§4): the platform and
// its parapet, the double-return stair, the Gate of All Nations with its winged bulls, the Apadana
// on its plinth (36 columns of 20 m and three porticoes, corner towers), the Hall of a Hundred
// Columns, the Tachara and the Hadish, the Treasury, the mudbrick wall along the mountain.

import { TERRACE, STAIR } from './layout.js';

const E = [], T = TERRACE.h, [tx0, tz0, tx1, tz1] = TERRACE.rect;
// the terrace and its parapet (open where the stair arrives)
E.push({ t: 'terrace', rect: TERRACE.rect, y0: -1, y1: T, gaps: [[tx0 - 2, STAIR.z - 12, tx0 + 2, STAIR.z + 12]] });
// the double-return stair: two flights up the face either way from a landing, then turning back to the top
{
  const x0 = tx0 - 2 * STAIR.w - 2, z = STAIR.z, w = STAIR.w, half = T / 2, run = 46;
  for (const s of [-1, 1]) {
    const zA = z + s * 4, zB = zA + s * run;                                   // lower flight runs outward from the middle
    E.push({ t: 'stair', rect: [x0, Math.min(zA, zB), x0 + w, Math.max(zA, zB)], dir: s < 0 ? 'n' : 's', y0: 0, y1: half, riser: 0.1, base: 0, mat: 'limestone_persian' });
    const zl = zB + s * 8;
    E.push({ t: 'block', walk: true, rect: [x0, Math.min(zB, zl), tx0, Math.max(zB, zl)], y0: 0, y1: half, mat: 'limestone_persian' });
    E.push({ t: 'stair', rect: [x0 + w + 1, Math.min(zA, zB), tx0, Math.max(zA, zB)], dir: s < 0 ? 's' : 'n', y0: half, y1: T, riser: 0.1, base: half, mat: 'limestone_persian' });
    E.push({ t: 'block', rect: [x0 + w, Math.min(zA, zB), x0 + w + 1, Math.max(zA, zB)], y0: 0, y1: half + 1, mat: 'limestone_persian' });
  }
  E.push({ t: 'block', rect: [x0 + w, z - 4, tx0, z + 4], y0: 0, y1: T, mat: 'limestone_persian', walk: true });
}
// the Gate of All Nations
E.push({ t: 'lamassu_gate', c: [-112, STAIR.z], s: 25, h: 17, y: T });
// the Apadana on its 2.6 m plinth: 6 × 6 columns in the hall, porticoes north, west and east
E.push({ t: 'hall', rect: [-60, -90, 0, -30], y: T, plinth: 2.6, h: 20, grid: [6, 6], porticoes: 'nwe', portDepth: 17, walls: 5, towers: 20, doors: 'nwe' });
E.push({ t: 'audience', c: [-30, -40], y: T + 2.75, dir: [0, -1], aisle: 44 });
E.push({ t: 'stair', rect: [-50, -126, -10, -116], dir: 's', y0: T, y1: T + 2.6, riser: 0.12, base: T, mat: 'limestone_persian' });
// the Hall of a Hundred Columns, 70 × 70 m, 10 × 10 columns, a portico north
E.push({ t: 'hall', rect: [40, -130, 110, -60], y: T, plinth: 0.8, h: 13, grid: [10, 10], porticoes: 'n', portDepth: 14, walls: 3.5, doors: 'nesw' });
// the Tripylon, the Tachara (palace of Darius), the Hadish (palace of Xerxes)
E.push({ t: 'hall', rect: [5, -12, 25, 12], y: T, plinth: 1.2, h: 9, grid: [2, 2], walls: 2.5, doors: 'nesw' });
E.push({ t: 'hall', rect: [-68, 5, -40, 35], y: T, plinth: 3, h: 9, grid: [4, 3], porticoes: 's', portDepth: 9, walls: 3, doors: 's' });
E.push({ t: 'hall', rect: [-30, 75, 10, 115], y: T, plinth: 3.5, h: 8, grid: [6, 6], porticoes: 'n', portDepth: 9, walls: 3, doors: 'n' });
// the Treasury: a great low block of columned rooms
E.push({ t: 'hall', rect: [50, 60, 130, 200], y: T, h: 7, grid: [10, 14], walls: 3, doors: 'w', simple: true });
// the mudbrick fortification along the mountain side
E.push({ t: 'block', rect: [tx1 - 6, tz0 + 4, tx1 - 2, tz1 - 4], y0: T, y1: T + 9, mat: 'plaster_persian' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('terrace', TERRACE.rect, T, 'open'),
  room('apadana', [-60, -90, 0, -30], T + 2.75, 'hall'),
  room('hundred columns', [40, -130, 110, -60], T + 0.95, 'hall'),
];
const walks = [[[-220, STAIR.z], [-162.5, STAIR.z], [-162.5, STAIR.z - 54], [-154, STAIR.z - 54], [-154, STAIR.z - 6], [-140, STAIR.z]]];
walks[0].y0 = 0;

export const terrace = {
  id: 'persepolis-terrace',
  name: { en: 'The Terrace of Persepolis', zh: '波斯波利斯台地' },
  era: { en: 'Persia, about 480 BC', zh: '波斯，约公元前480年' },
  style: 'achaemenid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-220, STAIR.z], facing: 'e' },
  bounds: [tx0 - 24, tz0 - 2, tx1 + 2, tz1 + 2],
  view: [-80, -110, -10, -40],
  viewY: T,
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default terrace;
