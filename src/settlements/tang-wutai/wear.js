// Wear (docs/settlements/tang-wutai.md §23): the earth trodden dark and bare before the doors of the open houses and trades, where the feet of a household
// and its visitors turn, with a strew of ash and cinders where a stove is emptied, and the smithy's forecourt black with scale. [inferred: what a trodden
// north Shanxi yard looks like; no source for 857]. Ragged, overlapping patches laid on the ground (no collision, src/core/wearpatch.js): 'earth_trodden' in the yards, 'stone_worn'
// on the East Hall's platform before the five doors, at the door sills and at the stair's foot [inferred].
import { STYLES } from '../../core/build.js';
import './style.js';
import { wearPatches } from '../../core/wearpatch.js';
import { height } from './layout.js';
import { visitorWalks } from './walk.js';
import { HALL } from './layout.js';
import { hashAt } from './nightlight.js';

STYLES['wutai-site'].elements.wear_patches = ({ mat, list, common }, { bag }) => { bag.add(mat, wearPatches(list, common)); };

export function wearElements() {
  const E = [], [ox, oz] = HALL.origin, { routes, names } = visitorWalks(), earth = [];
  const patch = (mat, x, z, w, d, hh) => { const y = height(x, z); E.push({ t: 'block', rect: [x - w / 2, z - d / 2, x + w / 2, z + d / 2], y0: y - 0.07, y1: y + hh, mat, collide: false }); };
  routes.forEach((r, i) => {
    if (names[i] !== 'house' && names[i] !== 'dwelling') return;
    // the point 1.3 m before the door and the one beside it: the worn ground runs from the gate's line to the door's
    const [dx, dz] = [r[r.length - 2][0] + ox, r[r.length - 2][1] + oz];
    const w = 1.6 + 0.5 * hashAt(dx, dz, 61), d = 0.9 + 0.3 * hashAt(dx, dz, 62);
    earth.push([dx, dz, w / 2, d / 2, (hashAt(dx, dz, 65) - 0.5) * 0.6, { layers: 4 }]);
    earth.push([dx + 0.5 * (hashAt(dx, dz, 63) - 0.5), dz + (r[r.length - 1][1] > r[r.length - 2][1] ? -0.9 : 0.9), (0.9 + 0.3 * hashAt(dx, dz, 64)) / 2, 0.3, 0, {}]);
  });
  E.push({ t: 'wear_patches', mat: 'earth_trodden', list: earth, common: { ground: height, lift: 0.005 } });
  // the East Hall: the platform's floor (y 14) worn pale before each of the five doors where the feet cross it, a smaller patch at each sill, and the stair's foot on the terrace (y 13)
  const stone = [];
  for (const [k, lz] of [-10.08, -5.04, 0, 5.04, 10.08].entries()) {
    stone.push([ox - 10.4, oz + lz, 0.8 + 0.2 * hashAt(k, 2, 72), 0.8, (hashAt(k, 1, 71) - 0.5) * 0.4, { y: 14, layers: 3 }]);
    stone.push([ox - 9.6, oz + lz, 0.3, 0.8, 0, { y: 14, layers: 2, flecks: 2 }]);
  }
  stone.push([ox - 17.2, oz, 0.7, 1.2, 0.1, { y: 13, layers: 3 }]);                           // the stair's foot
  E.push({ t: 'wear_patches', mat: 'stone_worn', list: stone, common: { lift: 0.004 } });
  // the smithy's forecourt: scale and cinders (the smithy's door is at x −106.6 on the lane's south side)
  for (let k = 0; k < 9; k++) patch('bark_dark', -106.6 + (hashAt(k, 1, 65) - 0.5) * 3.4, 2.1 + hashAt(k, 2, 66) * 0.7, 0.2 + hashAt(k, 3, 67) * 0.3, 0.15 + hashAt(k, 4, 68) * 0.25, 0.02 + hashAt(k, 5, 69) * 0.02);
  return E;
}
