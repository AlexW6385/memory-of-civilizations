// The houses of the first hill (docs/settlements/constantinople.md §5): tenements of the Roman kind,
// balconies frequent (Zeno's law regulated them), in 100 m tiles, full near and in outline far.
import { lodTiles } from '../lod.js';
import { RADIUS, lots } from './layout.js';
export async function houses() {
  return lodTiles('constantinople-houses', 'roman', lots().map((l) => ({ t: 'byz_house', balcony: 0.7, ...l })), { R: RADIUS, entrance: { at: [-150, 110], facing: 'e' } });
}
