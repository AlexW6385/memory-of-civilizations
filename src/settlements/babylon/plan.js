// Babylon about 570 BC (docs/settlements/babylon.md §2–§4): Etemenanki in its precinct, Esagila,
// the Ishtar Gate in the double wall, the Processional Way between glazed walls, the Southern
// Palace, the river.

import { RADIUS, WAY, GATE, WALL_Z, PALACE, PRECINCT, ZIGGURAT, ESAGILA, RIVER } from './layout.js';

const E = [];
// Etemenanki: seven stages from a base 91 m square, the shrine on top
E.push({ t: 'ziggurat', c: ZIGGURAT.c, y: 0, stages: [{ w: 91, d: 91, h: 33, batter: 3 }, { w: 78, d: 78, h: 18, batter: 1.5 }, { w: 60, d: 60, h: 6, batter: 0.6 }, { w: 51, d: 51, h: 6, batter: 0.6 }, { w: 42, d: 42, h: 6, batter: 0.6 }, { w: 33, d: 33, h: 6, batter: 0.6 }], shrine: { w: 24, d: 21, h: 15 } });
// the precinct's wall
const [p0, q0, p1, q1] = PRECINCT, gw = 12;
for (const [a, b] of [[[p0, q0], [WAY.x - gw, q0]], [[WAY.x + gw, q0], [p1, q0]], [[p0, q1], [p1, q1]], [[p0, q0], [p0, q1]], [[p1, q0], [p1, q1]]]) E.push({ t: 'precinct_wall', a, b, h: 9, th: 4 });
E.push({ t: 'courtyard_block', rect: ESAGILA, h: 12, ring: 14, door: 'n' });
// the double wall across the north with the Ishtar Gate in it
E.push({ t: 'city_wall', a: [-(RADIUS - 50), WALL_Z], b: [GATE.c[0] - 22, WALL_Z], h: 15, th: 6, gap: 12 });
E.push({ t: 'city_wall', a: [GATE.c[0] + 22, WALL_Z], b: [RADIUS - 50, WALL_Z], h: 15, th: 6, gap: 12 });
E.push({ t: 'ishtar_gate', c: [GATE.c[0], WALL_Z + 8], w: 5, d: 40, h: 14, h2: 23 });
// the Processional Way: glazed walls with lions, north of the gate and on to the precinct
for (const s of [-1, 1]) {
  E.push({ t: 'glazed_wall', a: [WAY.x + s * (WAY.w / 2 + 1.2), WAY.z0 + 20], b: [WAY.x + s * (WAY.w / 2 + 1.2), WALL_Z - 14], h: 9, th: 2.4 });
  E.push({ t: 'glazed_wall', a: [WAY.x + s * (WAY.w / 2 + 1.2), WALL_Z + 32], b: [WAY.x + s * (WAY.w / 2 + 1.2), PALACE[3]], h: 8, th: 2.4, lions: true });
}
// the Southern Palace: courts in a row behind a buttressed front
for (let k = 0; k < 3; k++) E.push({ t: 'courtyard_block', rect: [PALACE[0] + k * 44, PALACE[1], PALACE[0] + k * 44 + 42, PALACE[3]], h: 11, ring: 12, door: 'e' });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('processional way', [WAY.x - WAY.w / 2, WAY.z0, WAY.x + WAY.w / 2, WAY.z1], 0, 'open'), room('precinct', PRECINCT, 0, 'open')];
const walks = [[[WAY.x, -370], [WAY.x, WALL_Z - 20], [WAY.x, WALL_Z + 40], [WAY.x, -80]]];
walks[0].y0 = 0;

export const babylon = {
  id: 'babylon-centre',
  name: { en: 'Etemenanki and the Processional Way', zh: '埃特曼安吉塔庙与游行大道' },
  era: { en: 'Babylon, about 570 BC', zh: '巴比伦，约公元前570年' },
  style: 'babylonian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [WAY.x, -370], facing: 's' },
  bounds: [-(RADIUS - 48), -385, RADIUS - 48, ESAGILA[3] + 2],
  view: [ZIGGURAT.c[0] - 50, ZIGGURAT.c[1] - 50, ZIGGURAT.c[0] + 50, ZIGGURAT.c[1] + 50],
  bakeTop: 95,
  elements: E,
  rooms,
  walks,
};
export const river = {
  id: 'babylon-river', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x - RIVER.w, -(RADIUS - 60), RIVER.x + RIVER.w, RADIUS - 60], y: RIVER.level, cell: 1.5, inside: (x, z) => Math.abs(x - (RIVER.x + 18 * Math.sin(z / 140))) < RIVER.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 60 }],
};
export default babylon;
