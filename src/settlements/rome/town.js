// The insulae of the Campus Martius (docs/settlements/rome.md §5): in 100 m tiles, each in full
// (shops, windows, shutters, balconies, cornices) near and in outline far (src/settlements/lod.js).
import { lodTiles } from '../lod.js';
import { RADIUS, lots, inRect } from './layout.js';
import { DOMUS, LITTER, lifePlan } from './life.js';
const site = (id, elements, rooms = []) => ({ id, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
export async function town() {
  // the lot by the street north of the Pantheon holds the atrium house with its thermopolium (§4.4), walked into
  const free = lots().filter((l) => !inRect(DOMUS, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2));
  const tiles = await lodTiles('rome-insulae', 'roman', free.map((l) => ({ t: 'insula', ...l })), { R: RADIUS, entrance: { at: [0, -200], facing: 's' } });
  const [x0, z0, x1, z1] = DOMUS;
  return [...tiles,
    site('rome-domus', [{ t: 'domus', rect: DOMUS, y: 0 }, { t: 'litter', at: LITTER.at, y: 0, rot: LITTER.rot }], [
      { id: 'atrium', rect: [x0 + 3.9, z0 + 5.1, x1 - 3.9, z1 - 5.9], y: 0, kind: 'hall', market: false },
      { id: 'thermopolium', rect: [x0 + 0.6, z1 - 5.6, (x0 + x1) / 2 - 1.6, z1 - 0.6], y: 0, kind: 'hall', market: false },
      { id: 'tablinum', rect: [(x0 + x1) / 2 - 2.4, z0 + 0.6, (x0 + x1) / 2 + 2.4, z0 + 4.6], y: 0, kind: 'hall', market: false }]),
    lifePlan()];
}
