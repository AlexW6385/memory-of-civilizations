// Wear (docs/settlements/tang-wutai.md §23): the earth trodden dark and bare before the doors of the open houses and trades, where the feet of a household
// and its visitors turn, with a strew of ash and cinders where a stove is emptied, and the smithy's forecourt black with scale. [inferred: what a trodden
// north Shanxi yard looks like; no source for 857]. Flat blocks laid on the ground (no collision), each one's size from a hash of its own place.
import { height } from './layout.js';
import { visitorWalks } from './walk.js';
import { HALL } from './layout.js';
import { hashAt } from './nightlight.js';

export function wearElements() {
  const E = [], [ox, oz] = HALL.origin, { routes, names } = visitorWalks();
  const patch = (mat, x, z, w, d, hh) => { const y = height(x, z); E.push({ t: 'block', rect: [x - w / 2, z - d / 2, x + w / 2, z + d / 2], y0: y - 0.07, y1: y + hh, mat, collide: false }); };
  routes.forEach((r, i) => {
    if (names[i] !== 'house' && names[i] !== 'dwelling') return;
    // the point 1.3 m before the door and the one beside it: the worn ground runs from the gate's line to the door's
    const [dx, dz] = [r[r.length - 2][0] + ox, r[r.length - 2][1] + oz];
    const w = 1.6 + 0.5 * hashAt(dx, dz, 61), d = 0.9 + 0.3 * hashAt(dx, dz, 62);
    patch('bark_dark', dx, dz, w, d, 0.013);
    patch('bark_dark', dx + 0.5 * (hashAt(dx, dz, 63) - 0.5), dz + (r[r.length - 1][1] > r[r.length - 2][1] ? -0.9 : 0.9), 0.9 + 0.3 * hashAt(dx, dz, 64), 0.5, 0.016);
  });
  // the smithy's forecourt: scale and cinders (the smithy's door is at x −106.6 on the lane's south side)
  for (let k = 0; k < 9; k++) patch('iron', -106.6 + (hashAt(k, 1, 65) - 0.5) * 3.4, 2.1 + hashAt(k, 2, 66) * 0.7, 0.2 + hashAt(k, 3, 67) * 0.3, 0.15 + hashAt(k, 4, 68) * 0.25, 0.02 + hashAt(k, 5, 69) * 0.02);
  return E;
}
