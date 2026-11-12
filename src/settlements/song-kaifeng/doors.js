// The doors of the rooms one can walk into (houses.js: the shops' door bays and the houses' doors of the lots interiors.js furnishes) and
// what must keep clear of them: the things of the street (street.js), the hand-placed carts, chairs and barrows of the scroll (town.js).
import { lots } from './layout.js';
import { doorOf } from './houses.js';
import { furnishedLots } from './interiors.js';

const OUT = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
let D = null;
/** The enterable doors: [{ at: [x, z] on the front line, out: [dx, dz] into the street, hw (the clear half-width) }]. */
export function doors() {
  if (D) return D;
  const F = furnishedLots();
  return (D = lots().filter((l) => F.has(l)).map((l) => ({ ...doorOf(l), out: OUT[l.front] })));
}
/** Is a disc of radius r at (x, z) in the way into a door: in the strip as wide as the door's centre passage, from the front line 4 m out into the street? */
export function nearDoor(x, z, r) {
  for (const d of doors()) {
    const dx = x - d.at[0], dz = z - d.at[1];
    if (Math.abs(dx) > 6 || Math.abs(dz) > 6) continue;
    const depth = dx * d.out[0] + dz * d.out[1], lat = -dx * d.out[1] + dz * d.out[0];
    if (depth > -r && depth < 4 + r && Math.abs(lat) < Math.min(d.hw, 0.9) + r + 0.1) return true;
  }
  return false;
}
/**
 * A hand-placed street thing (a box of half-lengths ha along the street, hc across it, centred at x, z) moved along its street until it
 * stands clear of every door: [x, z]. horiz: the street runs east–west.
 */
export function nudge(x, z, ha, hc, horiz) {
  const ds = doors();
  const bad = (px, pz) => ds.some(({ at, hw }) => (horiz ? Math.abs(at[1] - pz) < hc + hw + 0.6 + 2.2 && Math.abs(at[0] - px) < ha + hw : Math.abs(at[0] - px) < hc + hw + 0.6 + 2.2 && Math.abs(at[1] - pz) < ha + hw));
  for (const k of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8, 9, -9, 10, -10, 11, -11, 12, -12, 13, -13, 14, -14, 15, -15]) {
    const p = horiz ? [x + k * 1.5, z] : [x, z + k * 1.5];
    if (!bad(p[0], p[1])) return p;
  }
  return [x, z];
}

/** The hand-placed street things, moved clear of the doors one can walk through (doors.js). */
export const SEDANS = [[-3.5, -30, 1], [3.2, 8, -1], [-3, 40, 1], [3.5, 130, -1], [-3.2, 170, 1]].map(([x, z, d]) => [...nudge(x, z, 2.4, 1.4, false), d]);
export const OXCARTS = [[-176, -81.5, -Math.PI / 2, true], [3.6, 162, 0, false]].map(([x, z, r, h]) => [...nudge(x, z, 5.2, 1.8, h), r]);
export const BARROWS = [[-118, 51.5, -Math.PI / 2, true], [-3.8, 124, Math.PI, false]].map(([x, z, r, h]) => [...nudge(x, z, 3.2, 1.3, h), r]);
export const DRAY = nudge(60, 199, 4.5, 1.5, true);
