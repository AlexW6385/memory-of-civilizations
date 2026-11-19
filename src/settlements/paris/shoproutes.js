// Walk-check routes (docs/settlements/paris.md §6a) from the street through the door of an opened shop to its front room, in world [x, z]:
// the door's place follows from the shop's counter opening (houses.js: the door stands at the end of the front away from the opening).
import { shopPoint } from '../../styles/gothic/houses.js';
import { openMap, walkSet } from './openwalk.js';
import { height } from './layout.js';

/** The street, the door, the corridor and the shop floor of one opened lot, as points [x, z]. */
export function shopRoute(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0;
  const sp = shopPoint({ rect: l.rect, y: height((x0 + x1) / 2, (z0 + z1) / 2), seed: l.seed, front: f });
  const uMid = along ? (f === 's' ? sp.at[0] - x0 : x1 - sp.at[0]) : (f === 'e' ? sp.at[1] - z0 : z1 - sp.at[1]);
  const doorL = uMid > L / 2, uDoor = doorL ? 0.8 : L - 0.7;
  const W = (u, d) => (f === 's' ? [x0 + u, z1 - d] : f === 'n' ? [x1 - u, z0 + d] : f === 'e' ? [x1 - d, z0 + u] : [x0 + d, z1 - u]);
  return [W(uDoor, -3.2), W(uDoor, -1.0), W(uDoor, 0.4), W(uDoor, 2.0), W(uDoor, 3.4)];
}
/** Routes into the opened shops nearest the arrival along the island's main street (the walk's first streets), `n` of them. */
export function shopWalks(n = 10) {
  const open = openMap();
  return walkSet().filter((l) => open.has(l) && l.rect[1] < 20 && l.rect[3] > -20).slice(0, n).map((l) => { const w = shopRoute(l); w.y0 = 0; return w; });
}
/** Is the point within `r` m of the street-to-corridor line of a route (its first four points: the door's lane)? */
export function nearLane(p, route, r = 1.5) {
  const a = route[0], b = route[3], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dz * t)) < r;
}
/** The point moved straight out of the door's lane to `r` m from its line (the lane's walls' side), for goods and figures that would stand in it. */
export function awayFromLane(p, route, r = 1.5) {
  const a = route[0], b = route[3], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
  const nx = a[0] + dx * t, nz = a[1] + dz * t; let vx = p[0] - nx, vz = p[1] - nz, d = Math.hypot(vx, vz);
  if (d < 1e-3) { vx = -dz; vz = dx; d = Math.hypot(vx, vz); }
  return [nx + vx / d * r, nz + vz / d * r];
}
