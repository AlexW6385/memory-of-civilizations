// Sanchi in the 1st century — the visitor's walk (docs/settlements/sanchi.md §20). Pure data and functions of layout.js (and the style's door rule).
// The walk: from the arrival on the summit's south approach (src/planet/arrivals.js: x 0, z 55, facing north) between the pilgrims' stalls to the south
// gateway and the Great Stupa; east to Temple 40's west flight and its hall; west to the second monastery and east to the first; and, down the pilgrims'
// stair, to the plaza, the rest hall, the pilgrims' road and the bazaar street with its shops, merchants' houses and homes.
import { TOP, STAIR, HALL, TEMPLE40, VIHARA2, PLAZA, lots } from './layout.js';
import { houseDoor } from '../../styles/indian/village.js';
import { ARRIVALS } from '../../planet/arrivals.js';

export const ARRIVAL = [ARRIVALS.sanchi[0], ARRIVALS.sanchi[2]];
/** The walk's lines [[x, z], [x, z]], along the middle of each way (for the lots opened by distance). */
export const WALK = [
  [[0, 94], [0, 31]],          // the south approach, stair's head to the south gateway
  [[0, 138], [0, 94]],         // the stair and the plaza
  [[0, 138], [0, 266]],        // the pilgrims' road
  [[-125, 150], [135, 150]],   // the bazaar street
];
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
export const walkDistance = (p) => Math.min(...WALK.map(([a, b]) => segDist(p, a, b)));

const asEl = (l) => ({ rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, fr: l.fr });
/** The village's open houses (a hall or shop with its front or door open, not a farmstead), nearest the plaza first. */
export function openHouses() {
  const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
  return lots().filter((l) => l.open && !l.farm).sort((a, b) => Math.hypot(...[0, 1].map((i) => mid(a)[i] - [0, 140][i])) - Math.hypot(...[0, 1].map((i) => mid(b)[i] - [0, 140][i])));
}
/**
 * The doorway of an open house: { F (the door rule), route: world points from the lane through the door into the front room }.
 * A shop is entered by the middle of its open front; a home through its door (a forecourt's gateway first); a merchant's house also by its stair, up to the upper floor.
 */
export function houseDoorway(l, upstairs = false) {
  const F = houseDoor(asEl(l)), out = F.oD + 1.3, p = [];
  if (F.fr === 'court') { const gc = (F.gate[0] + F.gate[1]) / 2; p.push(F.Pf(gc, -out), F.Pf(gc, 0.5), F.Pf(gc, F.vo - 0.3)); }
  else p.push(F.Pf(F.du, -out), F.Pf(F.du, -0.3));
  p.push(F.P(F.du, 0.15), F.P(F.du, 0.9));
  if (upstairs && l.kind === 'merchant') {
    const sw = 1.1, T = F.T, vA = T + 0.1, vB = vA + 17 * 0.27, us = F.stairLeft ? T + sw / 2 : F.L - T - sw / 2;
    p.push(F.P(us + (F.stairLeft ? 0.5 : -0.5), 0.9), F.P(us, 1.3), F.P(us, vB - 0.6), F.P(us, vB + 0.6), F.P(F.stairLeft ? us + 1.4 : us - 1.4, vB + 1.2));
  }
  return { F, route: p };
}

/** The routes walk-check follows (landmark plan `walks`, world metres; `y0` is relative to the landmark's base, the summit). */
export function walkRoutes(nHouses = 10) {
  const R = [], v = (r) => Object.assign(r, { y0: -TOP });
  const [tx, tz] = TEMPLE40.c, hx = tx - 41.76 / 2;
  R.push({ id: 'pilgrims stair', route: v([[0, 138], [0, 126], [0, 108], [0, 96], [0, 88], [0, 64]]) });
  R.push({ id: 'temple 40 west flight and hall', route: Object.assign([[0, 62], [12, 62], [hx, 62], [hx + 2.4, tz + 1.8], [hx + 14, tz + 1.8]], { y0: 0 }) });
  R.push({ id: 'monastery 1 gate and court', route: Object.assign([[28, 17], [33, 17], [38, 17], [42, 20]], { y0: 0 }) });
  R.push({ id: 'monastery 2 gate and court', route: Object.assign([[VIHARA2[0] - 6, 17], [VIHARA2[0] + 1, 17], [VIHARA2[0] + 6, 17], [VIHARA2[0] + 8.5, 20]], { y0: 0 }) });
  R.push({ id: 'rest hall at the stair foot', route: v([[0, 138], [-9, 140], [-14, 140], [-19, 138]]) });
  const picks = [], want = ['shop', 'shop', 'merchant', 'home', 'shop', 'home', 'mud', 'shop', 'merchant', 'home', 'mud', 'shop'];
  for (const l of openHouses()) {
    if (picks.length >= nHouses) break;
    if (want[picks.length] !== l.kind && picks.length < 8 && !(picks.length > 5 && l.kind !== 'hut' && l.kind !== 'shed')) continue;
    if (l.kind === 'hut' || l.kind === 'shed') continue;
    picks.push(l);
  }
  for (const l of picks) R.push({ id: `house ${l.kind} ${l.seed}`, route: v(houseDoorway(l, true).route) });
  return R;
}
void HALL; void STAIR; void PLAZA;
