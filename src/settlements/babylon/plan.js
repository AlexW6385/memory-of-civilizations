// Babylon about 570 BC (docs/settlements/babylon.md §2–§4): Etemenanki in its precinct, Esagila,
// the Ishtar Gate in the double wall, the Processional Way between glazed walls, the Southern
// Palace, the river.

import { RADIUS, WAY, GATE, WALL_Z, PALACE, PRECINCT, ZIGGURAT, ESAGILA, RIVER, BRIDGE, QUAY, riverX } from './layout.js';

const E = [];
/** The round boats on the river: z, d (from the river's middle), r, cargo; the boatmen and an ass are placed in town.js. */
export const QUFFAS = [
  { z: -60, d: 22, r: 2.0, cargo: 'casks', moored: true }, { z: -40, d: 23, r: 1.6, cargo: 'reeds', moored: true },
  { z: 95, d: 22.5, r: 2.4, cargo: 'casks', moored: true }, { z: 112, d: 23, r: 1.7, cargo: 'none', moored: true },
  { z: -10, d: -4, r: 2.2, cargo: 'casks' }, { z: 140, d: 6, r: 2.6, cargo: 'ass' }, { z: 200, d: -10, r: 1.8, cargo: 'casks' },
];
// Etemenanki: seven stages from a base 91 m square, the temple of blue glazed brick on top with the god's couch
// and golden table, the great stairway rising from the south (Koldewey), toward Esagila
E.push({ t: 'etemenanki', c: ZIGGURAT.c, y: 0, front: 's', stages: [{ w: 91, d: 91, h: 33, batter: 3 }, { w: 78, d: 78, h: 18, batter: 1.5 }, { w: 60, d: 60, h: 6, batter: 0.6 }, { w: 51, d: 51, h: 6, batter: 0.6 }, { w: 42, d: 42, h: 6, batter: 0.6 }, { w: 33, d: 33, h: 6, batter: 0.6 }], shrine: { w: 24, d: 21, h: 15 } });
// the precinct's wall
const [p0, q0, p1, q1] = PRECINCT, gw = 12;
// (a gate on the north toward the Way, and one on the south toward Esagila, on the axis of the tower's stair)
for (const [a, b] of [[[p0, q0], [WAY.x - gw, q0]], [[WAY.x + gw, q0], [p1, q0]], [[p0, q1], [ZIGGURAT.c[0] - gw, q1]], [[ZIGGURAT.c[0] + gw, q1], [p1, q1]], [[p0, q0], [p0, q1]], [[p1, q0], [p1, q1]]]) E.push({ t: 'precinct_wall', a, b, h: 9, th: 4 });
// Esagila, the house of Marduk: towered walls, gates in the middle of each side, the court, the god's golden cella
E.push({ t: 'esagila', rect: ESAGILA, h: 12 });
// the double wall across the north with the Ishtar Gate in it
E.push({ t: 'city_wall', a: [-(RADIUS - 50), WALL_Z], b: [GATE.c[0] - 22, WALL_Z], h: 15, th: 6, gap: 12 });
E.push({ t: 'city_wall', a: [GATE.c[0] + 22, WALL_Z], b: [RADIUS - 50, WALL_Z], h: 15, th: 6, gap: 12 });
E.push({ t: 'ishtar_gate', c: [GATE.c[0], WALL_Z + 8], w: 5, d: 40, h: 14, h2: 23 });
// Nebuchadnezzar's dedication on the city face of the inner wall east of the gate, between its first two towers,
// seen on coming out of the gate into the city
E.push({ t: 'gate_inscription', x0: GATE.c[0] + 27.2, x1: GATE.c[0] + 37.2, z: WALL_Z + 18 + 1.95, face: 's', y0: 1.0, y1: 10.6, lines: 60 });
// the Processional Way: paved with limestone flags down the middle and red breccia either side, between
// glazed walls with lions
E.push({ t: 'way_paving', rect: [WAY.x - WAY.w / 2, WAY.z0, WAY.x + WAY.w / 2, WALL_Z - 13.5], y: 0.12, seed: 1 });
E.push({ t: 'way_paving', rect: [WAY.x - WAY.w / 2, WALL_Z + 28, WAY.x + WAY.w / 2, WAY.z1], y: 0.12, seed: 2 });
// the Processional Way: glazed walls with lions, north of the gate and on to the precinct
for (const s of [-1, 1]) {
  E.push({ t: 'glazed_wall', a: [WAY.x + s * (WAY.w / 2 + 1.2), WAY.z0 + 20], b: [WAY.x + s * (WAY.w / 2 + 1.2), WALL_Z - 14], h: 9, th: 2.4 });
  E.push({ t: 'glazed_wall', a: [WAY.x + s * (WAY.w / 2 + 1.2), WALL_Z + 32], b: [WAY.x + s * (WAY.w / 2 + 1.2), PALACE[3]], h: 8, th: 2.4, lions: true });
}
// the Southern Palace: its gate on the east, toward the Way; the east court, the throne court with the
// enamelled facade of the throne room on its south side, a court of lodgings to the south-east
const [pa0, pb0, pa1, pb1] = PALACE;
E.push({
  t: 'palace', rect: PALACE, h: 11, abut: 'n',
  courts: [[pa1 - 44, pb0 + 24, pa1 - 12, pb0 + 76], [pa0 + 28, pb0 + 18, pa0 + 74, pb0 + 72], [pa1 - 44, pb1 - 32, pa1 - 12, pb1 - 10]],
  gates: [{ rect: [pa1 - 12, pb0 + 46, pa1, pb0 + 52], h: 5, towers: 'e' }, { rect: [pa0 + 74, pb0 + 46, pa1 - 44, pb0 + 52], h: 4.5 }, { rect: [pa1 - 31, pb0 + 76, pa1 - 25, pb1 - 32], h: 4.5 }],
  throne: { court: 1, doors: [-15, 0, 15] },
});

// the Euphrates: the bridge on its boat-shaped piers west of the tower, the towered quay wall of the east bank,
// round hide boats (quffas) coming down with casks of palm wood or moored at the quay
{
  const xr = riverX(BRIDGE.z), half = 32;
  E.push({ t: 'bridge', z: BRIDGE.z, y: BRIDGE.y, bed: RIVER.bed - 0.5, waterY: RIVER.level, piers: [xr - 18.25, xr, xr + 18.25], abut: [[xr - 46, xr - half], [xr + half, xr + 46]] });
  E.push({ t: 'quay', river: riverX, z0: QUAY.z0, z1: QUAY.z1, d0: QUAY.d0, d1: QUAY.d1, y: QUAY.y, bed: RIVER.bed - 0.5, waterY: RIVER.level, skip: [[BRIDGE.z - 7, BRIDGE.z + 7]] });
  for (const b of QUFFAS) E.push({ t: 'quffa', at: [riverX(b.z) + b.d, b.z], y: RIVER.level, r: b.r, cargo: b.cargo });
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('processional way', [WAY.x - WAY.w / 2, WAY.z0, WAY.x + WAY.w / 2, WAY.z1], 0, 'open'), room('precinct', PRECINCT, 0, 'open'), room('throne court', [pa0 + 28, pb0 + 18, pa0 + 74, pb0 + 72], 0.08, 'open'),
  room('esagila court', [ESAGILA[0] + 32, (ESAGILA[1] + ESAGILA[3]) / 2 - 18.8, ESAGILA[0] + 63.3, (ESAGILA[1] + ESAGILA[3]) / 2 + 18.8], 0.06, 'open'),
  room('cella of marduk', [ESAGILA[0] + 6, (ESAGILA[1] + ESAGILA[3]) / 2 - 12, ESAGILA[0] + 20.5, (ESAGILA[1] + ESAGILA[3]) / 2 + 12], 0.06, 'hall')];
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
