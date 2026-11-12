// Ptolemaic Alexandria about 250 BC: the two landmarks (docs/settlements/alexandria.md §3–§4) — the Pharos on its island, and the
// Museion with its Library in the royal quarter on the Great Harbour.
import { GROUND, PHAROS, ISLAND, MUSEION, ROYAL, LOCHIAS } from './layout.js';

const g = GROUND;
// ── the Pharos ──
const PH = PHAROS.c, PHR = [PH[0] - 40, PH[1] - 40, PH[0] + 40, PH[1] + 40];
export const pharos = {
  id: 'alexandria-pharos',
  name: { en: 'The Pharos', zh: '法罗斯灯塔' },
  era: { en: 'Alexandria, about 250 BC', zh: '亚历山大港，约公元前250年' },
  style: 'ptolemaic',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [100, -86], facing: 'n' },
  bounds: [PHR[0], PHR[1], PHR[2], PHR[3]],
  view: [PH[0] - 60, PH[1] + 30, PH[0] + 60, PH[1] + 120],
  bakeTop: 110,
  elements: [
    { t: 'pharos', c: PH, y: g, base: PHAROS.base },
    // the island's paved court round the tower
    { t: 'floor', rect: [PH[0] - 36, PH[1] - 36, PH[0] + 36, PH[1] + 36], y: g + 0.05, th: 0.2, mat: 'travertine' },
  ],
  rooms: [{ id: 'island court', rect: [PH[0] - 36, PH[1] - 36, PH[0] + 36, PH[1] + 36], y: g, kind: 'open' }],
  walks: [Object.assign([[PH[0] - 60, PH[1] + 30], [PH[0], PH[1] + 28], [PH[0] + 20, PH[1] + 24]], { y0: g })],
};

// ── the Museion and the Library ──
const GARDEN = [196, -66, 296, -36];
const halls = [[194, -36, 227, -12], [230, -36, 263, -12], [266, -36, 299, -12]];
const E = [
  // the garden: gravel paths, a basin, and round it the peripatos
  { t: 'floor', rect: [GARDEN[0], GARDEN[1], GARDEN[2], GARDEN[3]], y: g + 0.02, th: 0.2, mat: 'pebbles' },
  { t: 'floor', rect: [231, -66, 237, -36], y: g + 0.06, th: 0.2, mat: 'sandstone_floor' },
  { t: 'floor', rect: [GARDEN[0], -54, GARDEN[2], -48], y: g + 0.06, th: 0.2, mat: 'sandstone_floor' },
  { t: 'floor', rect: [228, -57, 240, -45], y: g + 0.1, th: 0.3, mat: 'marble_floor' },
  { t: 'stoa', rect: [190, -80, 302, -66], front: 's', y: g, h: 5.2, d: 0.7, sp: 2.8, flutes: 12, mat: 'limestone', wall: 'plaster_white', triglyphMat: 'egyptian_blue', inner: { d: 0.56, every: 2 }, seed: 11 },
  { t: 'stoa', rect: [296, -66, 328, -36], front: 'w', y: g, h: 5.2, d: 0.7, sp: 2.8, flutes: 12, mat: 'limestone', wall: 'plaster_white', triglyphMat: 'egyptian_blue', rooms: { n: 1, depth: 14 }, seed: 12 },
  { t: 'exedra', c: [206, -51], r: 5, y: g, face: -Math.PI / 2 },
  ...halls.map((r, i) => ({ t: 'library_hall', rect: r, front: 'n', y: g, seed: 20 + i })),
  // the royal quarter's fronts on the harbour: long colonnades, the palace on the Lochias
  { t: 'palace_front', rect: [128, -80, 168, -64], front: 'n', y: g, seed: 31 },
  { t: 'palace_front', rect: [168, -80, 190, -64], front: 'n', y: g, seed: 34 },
  { t: 'palace_front', rect: [302, -80, 330, -67], front: 'n', y: g, seed: 35 },
  { t: 'palace_front', rect: [330, -80, 436, -64], front: 'n', y: g, seed: 32 },
  // the royal enclosure's long wall over the Museion's north colonnade, seen from the harbour: pilasters, painted relief, a gateway
  { t: 'wall_front', x0: 190, x1: 302, z: -80.6, face: 'n', y: g, h: 8.4, gate: 246 },
  { t: 'palace_front', rect: [LOCHIAS[0] + 10, -150, LOCHIAS[2] - 10, -134], front: 's', y: g, seed: 33 },
];
export const museion = {
  id: 'alexandria-museion',
  name: { en: 'The Museion and the Library', zh: '缪斯宫与图书馆' },
  era: { en: 'Alexandria, about 250 BC', zh: '亚历山大港，约公元前250年' },
  style: 'ptolemaic',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [100, -86], facing: 'e' },
  bounds: [ROYAL[0], -156, 440, 4],
  view: [150, -90, 330, -4],
  bakeTop: 24,
  elements: E,
  rooms: [
    { id: 'garden', rect: GARDEN, y: g, kind: 'open' },
    ...halls.map((r, i) => ({ id: `reading hall ${i + 1}`, rect: [r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 1], y: g, kind: 'hall' })),
    { id: 'dining hall', rect: [314.8, -65.3, 327.3, -36.7], y: g, kind: 'inner' },
  ],
  walks: [Object.assign([[100, -86], [180, -86], [180, -58], [196, -48], [210.5, -42], [210.5, -20]], { y0: g })],
};
void ISLAND; void MUSEION;
