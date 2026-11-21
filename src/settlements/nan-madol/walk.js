// The visitor's walk at Nan Madol (docs/settlements/nan-madol.md §14.1): from the arrival at the crossroads of Idehd three ways — north down the
// forecourt and over the causeway to Nandauwas, south over the causeway to Peiniot's landing, east and west along Idehd's cross path — and the nahs,
// the chief's hall, the cook-houses and the landing's store that front them, each entered by its open end. Pure data (layout.js only): the routes
// are what `walk-check` walks, so that every opened place is proved reachable by the walker's own body.
import { ISLET, village, FORECOURT, FORDS } from './layout.js';
import { ARRIVALS } from '../../planet/arrivals.js';

const frame = (c, yaw) => (u, v) => [c[0] + u * Math.cos(yaw) + v * Math.sin(yaw), c[1] - u * Math.sin(yaw) + v * Math.cos(yaw)];
const A = () => { const a = ARRIVALS['nan-madol']; return [a[0], a[2]]; };

/** The ways of the walk as polylines (x, z): south to Peiniot, north to the gate, east and west along Idehd's cross path. */
export function WALK() {
  const [ax, az] = A(), s1 = ISLET.s1.rect, pc = (s1[1] + s1[3]) / 2;
  return [[[ax, az + 40], [ax, az], [ax, -8]], [[s1[0] + 3, az], [s1[2] - 3, az]], [[s1[0] + 3, pc], [s1[2] - 3, pc]]];
}

/** The nahs the walk opens: the first rows of Idehd and Peiniot, nearest the arrival first, with the point on the islet's path they are entered from. */
export function walkHouses(n = 14) {
  const [ax, az] = A(), out = [];
  for (const h of village().houses) {
    if (h.back || (h.islet !== 's1' && h.islet !== 's4')) continue;
    const r = ISLET[h.islet].rect, alongX = r[2] - r[0] >= r[3] - r[1], pc = alongX ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
    const path = alongX ? [h.c[0], pc] : [pc, h.c[1]];
    out.push({ h, path, d: Math.hypot(h.c[0] - ax, h.c[1] - az) });
  }
  return out.sort((a, b) => a.d - b.d).slice(0, n);
}

/** Routes for walk-check: path → the platform's front → the middle of the room, for each opened nah; and two long ways (landing and gate). */
export function walkRoutes() {
  const R = [];
  for (const { h, path } of walkHouses()) {
    const F = frame(h.c, h.yaw);
    // entered 0.4 m off the middle (a door's lane: the steps are 1.1 m wide), the start on the path in line with it
    const a = F(-0.4, -h.l / 2 - 0.6);
    R.push([path, a, F(-0.4, 0.2)]);
  }
  const [ax, az] = A();
  const store = village().works.find((k) => k.kind === 'landing');
  if (store) { const F = frame(store.c, store.yaw); const pz = (ISLET.s4.rect[1] + ISLET.s4.rect[3]) / 2;
    R.push([[ax, az], [ax, pz], F(1.5, -store.w / 2 - 1.2), F(1.5, -store.w / 2 + 0.8)]); /* in the gap between the porters' line and the posts */ }
  const hall = village().works.find((k) => k.kind === 'hall');
  if (hall) { const F = frame(hall.c, hall.yaw); R.push([[ax, az], F(0, -hall.w / 2 - 2.6), F(0, -hall.w / 2 - 0.9), F(0, 0)]); }
  return R;
}
void FORECOURT; void FORDS;
