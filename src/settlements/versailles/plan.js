// Versailles about 1690 (docs/settlements/versailles.md §2–§4).
import { RADIUS, CHATEAU, LOGIS, WINGS, PARTERRE, LATONA, LATONA_Y, APOLLO, CANAL, RISE, MARBLE, MARBLE_RISE, EXT, STAIR, FY, STATE_ROOMS } from './layout.js';

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
    // the central block with the state rooms on its first floor (§1c): the Hall of Mirrors behind the garden front, the
    // Salons of War and Peace, the King's Grand Apartment; the Ambassadors' Staircase in the court north of the Royal Court
    { t: 'grand_corps', rect: CHATEAU, ext: EXT, y, h: 22, fy: FY },
    { t: 'ambassadors', rect: STAIR, y, h: 22, fy: FY, py: 10.4 },
    ...WINGS.map((r) => ({ t: 'range', rect: r, h: 20, y, front: 'we' })),
    // the court side (§1b): Louis XIII's brick-and-stone château round the raised Marble Court — the corps de logis with
    // its avant-corps, columns, balcony and clock, its two wings — the ranges of the Royal Court before it, the ministers'
    // wings flanking the forecourt; the gilded railings between the courts
    { t: 'marble_court', rect: MARBLE, y, rise: MARBLE_RISE },
    { t: 'court_range', rect: [LOGIS[0], MARBLE[1] - 12, MARBLE[0], MARBLE[3] + 12], y: y + MARBLE_RISE, foot: y - 0.5, h: 12, fronts: 'e', centre: 'e', blind: 'wns' },
    { t: 'court_range', rect: [MARBLE[0], MARBLE[1] - 12, MARBLE[2], MARBLE[1]], y: y + MARBLE_RISE, foot: y - 0.5, h: 12, fronts: 'se', blind: 'nw' },
    { t: 'court_range', rect: [MARBLE[0], MARBLE[3], MARBLE[2], MARBLE[3] + 12], y: y + MARBLE_RISE, foot: y - 0.5, h: 12, fronts: 'ne', blind: 'sw' },
    { t: 'court_range', rect: [LOGIS[0], LOGIS[1], MARBLE[2], MARBLE[1] - 12], y, h: 13, fronts: 'n', blind: 'wse' },
    { t: 'court_range', rect: [LOGIS[0], MARBLE[3] + 12, MARBLE[2], LOGIS[3]], y, h: 13, fronts: 's', blind: 'wne' },
    { t: 'court_range', rect: [MARBLE[2], LOGIS[1], LOGIS[2], MARBLE[1] - 12], y, h: 13, fronts: 'sen', blind: 'w' },
    { t: 'court_range', rect: [MARBLE[2], MARBLE[3] + 12, LOGIS[2], LOGIS[3]], y, h: 13, fronts: 'nes', blind: 'w' },
    { t: 'court_range', rect: [92, -64, 150, -42], y, h: 12, fronts: 'se' },
    { t: 'court_range', rect: [92, 42, 150, 64], y, h: 12, fronts: 'ne' },
    { t: 'floor', rect: [MARBLE[2], MARBLE[1] - 12, LOGIS[2], MARBLE[3] + 12], y: y + 0.04, th: 0.4, mat: 'flagstone' },
    { t: 'floor', rect: [LOGIS[2], -42, 150, 42], y: y + 0.04, th: 0.4, mat: 'flagstone' },
    { t: 'grille', x: LOGIS[2], z0: MARBLE[1] - 12, z1: MARBLE[3] + 12, y: y + 0.04, gate: [0, 6] },
    { t: 'grille', x: 150, z0: -42, z1: 42, y: y + 0.04, gate: [0, 7], groups: false },
    { t: 'parterre', rect: PARTERRE, y, water: true },
    { t: 'fountain', c: LATONA, r: 14, y: LATONA_Y, kind: 'latona' },
    { t: 'fountain', c: APOLLO, r: 18, y: 0, kind: 'apollo', dir: [1, 0] },
  ],
  rooms: [{ id: 'parterre', rect: PARTERRE, y, kind: 'open' }, { id: 'marble court', rect: [MARBLE[0] + 1, MARBLE[1] + 1, MARBLE[2] - 1, MARBLE[3] - 1], y: y + MARBLE_RISE, kind: 'open' },
    ...STATE_ROOMS.map(([id, rect, ry]) => ({ id, rect, y: ry, kind: 'hall' }))],
  walks: [Object.assign([[180, 0], [80, 0]], { y0: y })],
};
export const canal = {
  id: 'versailles-canal', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-RADIUS + 50, -270, CANAL.x0, 270], y: -1, cell: 2, inside: (x, z) => Math.hypot(x, z) < RADIUS - 52 && ((x < CANAL.x0 - 1 && Math.abs(z) < CANAL.w / 2 - 1) || (Math.abs(x - CANAL.cross) < CANAL.crossW / 2 - 1 && Math.abs(z) < 259)) }],
};
export default chateau;
