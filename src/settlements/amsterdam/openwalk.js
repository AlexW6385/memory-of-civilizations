// Amsterdam about 1670 — the visitor's walk and the lots along it (docs/settlements/amsterdam.md §10.1). Pure data (layout.js only): town.js opens the
// lots on the walk, shops.js makes their shop fronts, soundmap.js and nightlight.js read the same lines.
//
// The walk: from the arrival on the Dam (before the Town Hall) along the Dam's south row of houses, to the Weigh House and the Town Hall's front, along the
// houses' north row, down the Damrak's east quay past the fish benches, east to the Nieuwe Kerk's door, and south down the street to the Singel and along the
// Singel's two quay streets (the first canal of the rings). Quay streets are 5 m wide between the quay's edge and the row's fronts (layout.js lots()).
import { C, RINGS, CANAL_W, QUAY, DAM, lots } from './layout.js';

export const ARRIVAL = [20, -210];
/** The centreline of a quay street: the ring's radius ± (half the canal, the quay, half the street). */
export const STREET_OFF = CANAL_W / 2 + QUAY + 2.5;
const arc = (R, a0, a1, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R]; });
/** The walk's lines [x, z]. */
export const WALK = [
  [[-29, -207.5], [40, -207.5]],                 // along the Dam's south row of houses, under the Town Hall's front
  [[20, -207.5], [20, -232]],                    // from the arrival to the middle of the square
  [[-29, -259], [11, -259]],                     // the north row of houses
  [[31.5, -258], [31.5, -289]],                  // the Damrak's east quay past the fish benches and the houses on it
  [[40, -207.5], [59, -207.5], [59, -213]],      // to the Nieuwe Kerk's south door
  [[-14, -205], [-14, -168]],                    // the street from the Dam south to the Singel
  arc(RINGS[0] - STREET_OFF, 0.55, 2.6),         // the Singel's inner quay street
  arc(RINGS[0] + STREET_OFF, 0.55, 2.6),         // and its outer one
];
export const WALK_REACH = 9, WALK_MAX = 44;
const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
/** The middle of a lot's street front. */
export const frontAt = (l) => (l.front === 's' ? [mid(l)[0], l.rect[3]] : l.front === 'n' ? [mid(l)[0], l.rect[1]] : l.front === 'e' ? [l.rect[2], mid(l)[1]] : [l.rect[0], mid(l)[1]]);
/** Distance from a point to the walk. */
export function walkDist(p) {
  let best = Infinity;
  for (const line of WALK) for (let i = 0; i + 1 < line.length; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(p[0] - (ax + dx * t), p[1] - (az + dz * t)));
  }
  return best;
}
let SET = null;
/** The lots whose fronts are on the walk, nearest the arrival first, at most WALK_MAX (they stand open: town.js isOpen). */
export function walkSet() {
  if (SET) return SET;
  const d = (l) => Math.hypot(mid(l)[0] - ARRIVAL[0], mid(l)[1] - ARRIVAL[1]);
  return (SET = new Set(lots().filter((l) => walkDist(frontAt(l)) <= WALK_REACH && l.rect[2] - l.rect[0] >= 5.8).sort((a, b) => d(a) - d(b)).slice(0, WALK_MAX)));
}
export const onWalk = (l) => walkSet().has(l);
void DAM;
