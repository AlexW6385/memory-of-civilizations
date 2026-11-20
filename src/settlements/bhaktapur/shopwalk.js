// Walk-check routes into the front rooms of the open shop-houses and dwellings nearest the arrival that upstairs.js does not already walk (docs §17): from the
// lane through the door to the middle of the ground floor, so that each opened front is proved passable. Pure data of layout.js.
import { lots, fp } from './layout.js';
import { openedLots } from './upstairs.js';

const AR = [19, 21];
/** Lots whose door lane a raised piece of the street crosses (found by tools/walk-check.mjs): their routes would stop at the step, not at a fault of the room. */
const SKIP = new Set(['-39.2,65.5']);
const dims = (l) => (l.front === 'n' || l.front === 's' ? [l.rect[2] - l.rect[0], l.rect[3] - l.rect[1]] : [l.rect[3] - l.rect[1], l.rect[2] - l.rect[0]]);
/** The routes [[x, z]…] (a street point, the door, the front room), for up to `max` lots, nearest the arrival first. */
export function shopRoutes(max = 12) {
  const walked = new Set(openedLots());
  const out = [];
  const cand = lots().filter((l) => l.open && !l.use && !walked.has(l) && l.door && l.trade !== 'weaver' && !SKIP.has(`${l.rect[0].toFixed(1)},${l.rect[1].toFixed(1)}`));   // (the walls of the doored fronts: the wide shop fronts and the weavers' rooms keep stock or a loom across the lane)
  cand.sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - AR[0], (a.rect[1] + a.rect[3]) / 2 - AR[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - AR[0], (b.rect[1] + b.rect[3]) / 2 - AR[1]));
  for (const l of cand) {
    if (out.length >= max) break;
    const [W, D] = dims(l);
    if (W < 6.4 || D < 6.5) continue;
    const home = !!l.door, T = 0.55, OW = home ? 1.3 : Math.min(4.6, W - 2.4), ox = home ? Math.max(T + 0.45, Math.min(l.dpos ?? 1.2, W - T - 3.65 - OW)) : (W - OW) / 2, dc = ox + OW / 2;
    const p = (lx, lz) => fp(l, lx, lz);
    out.push([p(dc, -2.2), p(dc, 0.6), p(dc, 1.8)]);
  }
  return out;
}
