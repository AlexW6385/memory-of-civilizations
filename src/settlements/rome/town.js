// The insulae of the Campus Martius (docs/settlements/rome.md §5): in 100 m tiles, each in full
// (shops, windows, shutters, balconies, cornices) near and in outline far (src/settlements/lod.js).
import { lodTiles } from '../lod.js';
import { RADIUS, lots } from './layout.js';
export async function town() {
  return lodTiles('rome-insulae', 'roman', lots().map((l) => ({ t: 'insula', ...l })), { R: RADIUS, entrance: { at: [0, -200], facing: 's' } });
}
