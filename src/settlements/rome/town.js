// The insulae of the Campus Martius (docs/settlements/rome.md §5): in 100 m tiles, each in full
// (shops, windows, shutters, balconies, cornices) near and in outline far (src/settlements/lod.js).
import { lodTiles } from '../lod.js';
import { RADIUS, lots, inRect, rows, fountains, FORUM, TEMPLE, PISTRINUM, LATRINE } from './layout.js';
import { DOMUS, LITTER, lifePlan } from './life.js';
const site = (id, elements, rooms = []) => ({ id, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
export async function town() {
  // the lot by the street north of the Pantheon holds the atrium house with its thermopolium (§4.4), walked into
  const free = lots().filter((l) => !inRect(DOMUS, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2));
  const [fx0, fz0, fx1, fz1] = FORUM, zm = (fz0 + fz1) / 2, cl = (a, b, side, gaps) => ({ t: 'colonnade', a, b, at: a, y: 0, h: 7.6, step: 3.9, depth: 5, side, gaps });
  const forum = [
    { t: 'forum_floor', rect: FORUM, y: 0 },
    cl([TEMPLE[2] + 2, fz0 + 5], [fx1 - 6, fz0 + 5], -1), cl([TEMPLE[2] + 2, fz1 - 5], [fx1 - 6, fz1 - 5], 1),
    cl([fx1 - 5, fz0 + 5], [fx1 - 5, fz1 - 5], -1, [[zm - fz0 - 5 - 7, zm - fz0 - 5 + 7]]),
    { t: 'temple', rect: TEMPLE, at: [(TEMPLE[0] + TEMPLE[2]) / 2, (TEMPLE[1] + TEMPLE[3]) / 2], front: 'e', y: 0, h: 11.5, nf: 6, podium: 2.6 },
    ...[[-84, -142, 0], [-84, -96, Math.PI], [-102, -146, 0], [-102, -92, Math.PI], [-124, -146, 0], [-124, -92, Math.PI]].map(([x, z, r], i) => ({ t: 'statue', at: [x, z], y: 0, rot: r, h: 2.0, base: 1.3, mat: i % 2 ? 'marble' : 'gilt_bronze' })),
  ];
  const tiles = await lodTiles('rome-insulae', 'roman', [...free.map((l) => ({ t: 'insula', ...l })), ...rows().map((r) => ({ t: 'taberna_row', ...r })), ...fountains().map((f) => ({ t: 'fountain', ...f })), ...forum], { R: RADIUS, entrance: { at: [0, -200], facing: 's' } });
  const [x0, z0, x1, z1] = DOMUS;
  return [...tiles,
    site('rome-domus', [{ t: 'domus', rect: DOMUS, y: 0 }, { t: 'litter', at: LITTER.at, y: 0, rot: LITTER.rot }], [
      { id: 'atrium', rect: [x0 + 3.9, z0 + 5.1, x1 - 3.9, z1 - 5.9], y: 0, kind: 'hall', market: false },
      { id: 'thermopolium', rect: [x0 + 0.6, z1 - 5.6, (x0 + x1) / 2 - 1.6, z1 - 0.6], y: 0, kind: 'hall', market: false },
      { id: 'tablinum', rect: [(x0 + x1) / 2 - 2.4, z0 + 0.6, (x0 + x1) / 2 + 2.4, z0 + 4.6], y: 0, kind: 'hall', market: false }]),
    { id: 'rome-street', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' },
      elements: [{ t: 'pistrinum', rect: PISTRINUM, front: 's', y: 0 }, { t: 'latrine', rect: LATRINE, front: 's', y: 0 }],
      rooms: [{ id: 'pistrinum', rect: [PISTRINUM[0] + 0.5, PISTRINUM[1] + 0.5, PISTRINUM[2] - 0.5, PISTRINUM[3] - 0.5], y: 0, kind: 'hall', market: false }, { id: 'latrine', rect: [LATRINE[0] + 0.5, LATRINE[1] + 0.5, LATRINE[2] - 0.5, LATRINE[3] - 0.5], y: 0, kind: 'hall', market: false }] },
    lifePlan()];
}
