// The visitor's walk in Ur (docs/settlements/ur.md §24): the arrival stands in the Court of Nanna; the walk runs north out of the temenos by the avenue between the date palms,
// through the temenos's north gate and across the market square into the north street, and back; the houses that can be entered (trade houses, the school, family
// houses, the temple's workshops) nearest that line are the ones the walk opens, their door lanes kept clear of the street life. Pure data and functions (no three.js): the
// routes walk-check follows, the door lanes the street-life pass reads as footprints, the doors' places for the night and the animals.
import { houses } from './layout.js';
import { frame } from '../../styles/sumerian-ur/upper.js';

/** The arrival (src/planet/arrivals.js: the Court of Nanna, facing the ziggurat). */
export const ARRIVAL = [0, -118];
/** The spine of the visitor's walk: from the arrival north through the court's gate, the avenue, the temenos's north gate, the square and the north street. */
export const SPINE = [[0, -118], [0, -150], [0, -172], [0, -200], [0, -250], [0, -300]];
const segDist = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
/** A lot's distance from the walk's spine, with a small weight on how far it is from the arrival (the nearest first among equals). */
export const walkDist = (l) => { const p = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2]; let d = 1e9; for (let i = 0; i + 1 < SPINE.length; i++) d = Math.min(d, segDist(p, SPINE[i], SPINE[i + 1])); return d + 0.04 * Math.hypot(p[0] - ARRIVAL[0], p[1] - ARRIVAL[1]); };
/** The houses that can be entered, those on the walk first. */
export const opened = () => houses().filter((l) => l.open).sort((a, b) => walkDist(a) - walkDist(b));

/** An open house's street door (urHouseOpen: 0.8 to 1.75 m along the front from its corner, its middle 1.275 m). */
const DOOR_U = 1.275, DOOR_LANE = 3.6;

/** Per lot: the rectangle (in the settlement's frame) before its door where nothing of the street life stands. */
export function doorClear(l) {
  const F = frame({ rect: l.rect, door: l.door });
  return F.R(DOOR_U - 1.2, -DOOR_LANE, DOOR_U + 1.2, 0);
}

/**
 * The routes into the opened houses on the walk, for walk-check: in at the street door, through the lobby, into the court and along it to the reception room's door
 * (a trade house keeps its tools off that line: the work stands to the sides).
 */
export function routes(count = 16) {
  const out = [];
  for (const l of opened().slice(0, count)) {
    const { W, t, dF, vC0 } = frame({ rect: l.rect, door: l.door });
    const w = [W(DOOR_U, -2.2), W(DOOR_U, 0.3), W(DOOR_U, t + 0.9), W(t + 1.4, t + dF - 0.3), W(t + 1.4, vC0 + 1.3), W(t + 1.4, vC0 + 0.5)];
    w.y0 = 0;
    out.push(w);
  }
  return out;
}

/** A lot's door in the settlement's frame: { p (on the wall's outer face), out (unit, away from the house), side (unit, along the front, the way u grows) }. */
export function doorPoint(l) {
  const { W } = frame({ rect: l.rect, door: l.door }), p = W(DOOR_U, 0), o = W(DOOR_U, -1), s = W(DOOR_U + 1, 0);
  return { p, out: [o[0] - p[0], o[1] - p[1]], side: [s[0] - p[0], s[1] - p[1]] };
}
