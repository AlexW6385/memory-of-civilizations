// The visitor's walk in Versailles about 1690 and the houses opened along it (docs/settlements/versailles.md §11.2). Pure data and functions of the
// layout and of the town house's own dice (townhouse.js reads its door from the element's seed; `doorOf` reads it the same way), so that the routes
// for walk-check, the keepers behind the counters, the lamps and the sound map all agree on where the doors are.
//
// The walk: from the arrival on the water parterre east up its walk to the terrace before the garden front; west along the Latona walk to the gate in
// the hornbeam wall at x = −104 and into the two service yards (the gardeners', fountain-keepers', sculptors' and guards' lodgings, §5d); then the long
// way round the north wing's end to the Place d'Armes, and east down the avenue de Paris between the shops that stood open.
import { rng } from '../../styles/classical_fr/townhouse.js';
import { RISE, PLACE, lots } from './layout.js';
import { SERVICE } from './service.js';
import { YARD_Y } from './layout.js';

export const ARRIVAL = [-60, 0];
/** The walk's lines [x, z]. */
export const WALK = [
  [[-60, 0], [-8, 0]],                                 // the water parterre's walk to the terrace
  [[-104, -38], [-104, 38]],                           // the gate of the hornbeam wall, between the two yards
  [[-120, 57.5], [-88, 57.5]], [[-120, -57.5], [-88, -57.5]],   // the yards' lanes
  [[-20, -215], [60, -215]],                           // round the north wing's end
  [[152, 0], [330, 0]],                                // the Place d'Armes' axis and the avenue de Paris
];
const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
const segDist = (p, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / (vx * vx + vz * vz))); return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t); };
/** Distance from a point to the walk. */
export function walkDist(p) { let best = Infinity; for (const line of WALK) for (let i = 0; i + 1 < line.length; i++) best = Math.min(best, segDist(p, line[i], line[i + 1])); return best; }

/** The door of a town house along its front (townhouse.js: the dice are drawn in this order): { u, w, cochere }. */
export function doorOf(el) {
  const rand = rng(el.seed || 1), L = el.rect[2] - el.rect[0], hotel = el.kind === 'hotel';
  if (!hotel) rand();                                                // the wall
  rand();                                                            // the shutters
  if (el.kind === 'shop') return { u: rand() < 0.5 ? L * 0.82 : L * 0.18, w: 1.35, cochere: false };
  if (hotel) return { u: L / 2, w: 3.3, cochere: true };
  const left = rand() < 0.5;
  return { u: left ? 1.3 + rand() * 0.6 : L - 1.3 - rand() * 0.6, w: 1.3, cochere: false };
}
/** A point of a house in its own frame (u along the front, v in from it) in the plan's. */
export const frameAt = (el, u, v) => (el.front === 's' ? [el.rect[2] - u, el.rect[3] - v] : [el.rect[0] + u, el.rect[1] + v]);
/** The way a keeper stands facing the street (a figure faces −z at rot 0). */
export const faceOut = (el) => (el.front === 's' ? Math.PI : 0);

/** The houses opened for the walk with what they are: the service lodgings and the open lots of the avenue, nearest the Place first. */
export function opened() {
  const out = SERVICE.map((b) => ({ ...b, yard: true, y: YARD_Y }));
  const town = lots().filter((l) => l.open && (l.front === 'n' || l.front === 's')).sort((a, b) => Math.hypot(mid(a)[0] - 226, mid(a)[1]) - Math.hypot(mid(b)[0] - 226, mid(b)[1]));
  for (const l of town) out.push({ ...l, yard: false, y: RISE });
  return out;
}

/** Routes into opened places for walk-check: in at the door and along the room to the counter's end ([x, z] waypoints, `y0` the ground's height). */
export function walkRoutes(n = 12) {
  const out = [];
  for (const el of SERVICE) {
    const d = doorOf({ ...el, kind: el.kind }), D = el.rect[3] - el.rect[1];
    const r = [frameAt(el, d.u, -2.8), frameAt(el, d.u, -0.6), frameAt(el, d.u, 1.2), frameAt(el, d.u, Math.min(el.use === 'joiner' ? 2.2 : 3.4, D - 1.5))];
    r.y0 = YARD_Y; out.push(r);
  }
  // the avenue's: one shop of each trade first (nearest the Place), then two homes and a hotel
  const town = opened().filter((e) => !e.yard), seen = new Set(), pick = [];
  for (const el of town) if (el.kind === 'shop' && !seen.has(el.use)) { seen.add(el.use); pick.push(el); }
  for (const use of ['home', 'home', 'hotel']) { const el = town.find((e) => e.use === use && !pick.includes(e)); if (el) pick.push(el); }
  for (const el of pick.slice(0, n)) {
    const d = doorOf(el), D = el.rect[3] - el.rect[1];
    const r = [frameAt(el, d.u, -3.5), frameAt(el, d.u, -0.6), frameAt(el, d.u, 1.2), frameAt(el, d.u, Math.min(3.4, D - 1.5))];
    r.y0 = RISE; out.push(r);
  }
  return out;
}
void PLACE;
