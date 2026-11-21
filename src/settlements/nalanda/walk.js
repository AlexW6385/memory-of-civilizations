// Nalanda about 640 — the visitor's walk (docs/settlements/nalanda.md §18). Pure data and functions of layout.js (and the style's door rule).
// The walk: from the arrival on the sacred way (src/planet/arrivals.js: x -2, z 70, facing north) north along the way past the pilgrims' booths and
// water-sheds, the great temple's stair, and each monastery's gate; east from the way along the lane of each monastery to its annex; west along the lane
// to the library's gate; and back south to the enclosure's gate and the road to the village, its bazaar and its houses.
import { MONASTERIES, ANNEXES, LIBRARY, GATE, WAY, mgate, lots, inRect, tankD } from './layout.js';
import { houseDoor, DOOR_OPEN } from '../../styles/nalanda/houses.js';
import { ARRIVALS } from '../../planet/arrivals.js';

export const ARRIVAL = [ARRIVALS.nalanda[0], ARRIVALS.nalanda[2]];
/** The walk's lines [[x, z], [x, z]], along the middle of each way. */
export const WALK = [
  [[0, GATE.c[1]], [0, -138]],                                                       // the sacred way, gate to the great stupa
  ...MONASTERIES.map((m) => [[WAY.x1, mgate(m)[1]], [mgate(m)[0] + 12, mgate(m)[1]]]),   // through each monastery's gate
  ...ANNEXES.map((a) => [[WAY.x1, a.rect[3] + 2], [(a.rect[0] + a.rect[2]) / 2, a.rect[3] + 2]]),
  [[WAY.x0, -92], [LIBRARY.yard[2], -92]],                                           // to the library's gate
  [[WAY.x0, 126], [126, 126]],                                                       // the road to the village and its bazaar
];
export const WALK_REACH = 12;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export const walkDistance = (p) => Math.min(...WALK.map(([a, b]) => segDist(p, a, b)));

/** The village houses that stand open to the visitor (town.js: within 175 m of the arrival, a hall at least 6.5 by 6 m), nearest first. */
export function openHouses() {
  return lots().filter((l) => !l.gone && l.rect[2] - l.rect[0] >= 6.5 && l.rect[3] - l.rect[1] >= 6
    && Math.hypot((l.rect[0] + l.rect[2]) / 2 - ARRIVAL[0], (l.rect[1] + l.rect[3]) / 2 - ARRIVAL[1]) < 175)
    .sort((a, b) => Math.hypot(a.rect[0] - ARRIVAL[0], a.rect[1] - ARRIVAL[1]) - Math.hypot(b.rect[0] - ARRIVAL[0], b.rect[1] - ARRIVAL[1]));
}
/** The doorway of an open house in the world: { at (the step), in (the hall's middle, a metre or two inside), face }. */
export function houseDoorway(l) {
  const F = houseDoor(l), deep = Math.min(F.D - 2.2, 3.4);
  return { F, route: [-2.4, 0.3, 1.0, deep].map((v) => F.P(F.du + 0.3, v)), width: DOOR_OPEN };
}

/** The routes walk-check follows (landmark plan `walks`, world metres): into every monastery by its gate to the court, every annex by its door, the library's three ground halls, and the nearest open houses. */
export function walkRoutes(nHouses = 30) {
  const R = [];
  for (const m of MONASTERIES) {
    if (m.rect === MONASTERIES[2].rect) continue;                                    // Monastery 1's own routes are the landmark plan's
    const [gx, gz] = mgate(m), cx = (m.rect[0] + 7.6 + m.rect[2] - 7.6) / 2;
    R.push({ id: 'monastery ' + (MONASTERIES.indexOf(m) + 1), route: [[0, gz + 2.2], [gx - 5, gz + 2.2], [gx - 2, gz], [gx + 12, gz], [cx, gz]] });
  }
  for (const a of ANNEXES) { const cx = (a.rect[0] + a.rect[2]) / 2, z1 = a.rect[3]; R.push({ id: 'annex ' + a.kind, route: [[cx - 0.4, z1 + 3], [cx - 0.4, z1 + 0.8], [cx - 0.4, z1 - 3.2]] }); }
  const [yx0, yz0, yx1] = LIBRARY.yard, gz = -92;
  const hc = [LIBRARY.c[0] + 21, LIBRARY.c[1]], hh = [9, 7];                        // Ratnarañjaka (plan.js TOWERS[2]): its door on the east face
  R.push({ id: 'library: Ratnarañjaka', route: [[-10, gz], [yx1 - 4, gz], [hc[0] + hh[0] + 2.5, hc[1]], [hc[0] + hh[0] - 3, hc[1]]] });
  void yx0; void yz0;
  // the other two halls: Ratnodadhi (door east at x -89) by the gap between the towers; Ratnasagara (door east at x -113) from the south
  const T = LIBRARY.c;
  R.push({ id: 'library: Ratnodadhi', route: [[-10, gz], [yx1 - 1.5, gz], [yx1 - 1.5, -76], [-86.5, -76], [-86.5, -96], [-90.5, -96], [-94, -96]] });
  R.push({ id: 'library: Ratnasagara', route: [[-86.5, -76], [-108, -76], [-108, -95], [-114.5, -95], [-117, -95]] });
  void T;

  // the six whose brick bench was cut at the door (houses.js `gable`): all must be walked
  const CUT = [184687, 335971, 332843, 181140, 874012, 19708], seen = new Set();
  const pick = [...openHouses().filter((q) => CUT.includes(q.seed)), ...openHouses().filter((q) => q.front === 'n' || q.front === 'w').slice(0, nHouses)].filter((q) => !seen.has(q.seed) && seen.add(q.seed));
  for (const h of pick) R.push({ id: 'house ' + h.seed, route: houseDoorway(h).route });
  return R;
}
void inRect; void tankD;
