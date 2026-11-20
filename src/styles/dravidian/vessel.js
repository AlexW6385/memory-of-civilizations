// The little brass or clay vessel (kudam) of the shelves, thinnais and shops (docs/settlements/madurai.md §12, §17b): one unit shape per
// material, placed with a uniform scale as an instance (GeoBag.addInstance), so that vessels of every size share one prototype (a draw and a
// few kilobytes) instead of each size being a mesh of its own. Seen only near: its reach is 100 m.
import { lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const PROFILE = [[0.001, 0], [0.07, 0], [0.1, 0.05], [0.17, 0.17], [0.18, 0.26], [0.12, 0.38], [0.07, 0.44], [0.1, 0.5], [0.07, 0.5]];
let unit = null;
const M = new Matrix4();
/** Little brass vessel (kudam): foot, belly, neck, flared lip, scaled by `s` about its foot. */
export function vessel(bag, x, y, z, s = 1, mat = 'bronze') {
  if (!bag.addInstance) return bag.add(mat, lathe(PROFILE.map(([r, h]) => [r * s, h * s]), 8, null, x, y, z));
  unit ??= lathe(PROFILE, 8, null, 0, 0, 0);
  M.makeScale(s, s, s).setPosition(x, y, z);
  bag.addInstance(mat, unit.clone(), M.clone(), { reach: 100 });
}
