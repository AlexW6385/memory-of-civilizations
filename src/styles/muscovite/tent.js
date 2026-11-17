// The tall tent of the central church of St Basil's, dressed (docs/settlements/muscovy.md §5.5): the eight white ribs up
// its edges in real section, three white belts, and on every face three tiers of little dormer lights (slukhi), each in
// a white frame under its own keel-shaped gable, smaller as they climb.

import { rod } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { kokoshnik } from './index.js';

const WS = 'limestone';
export function tentDress(bag, cx, cz, yb, s, ap) {
  const y0 = yb + 25 * s, H = 18 * s, Rv = (t) => (6.2 * (1 - t) + 1.4 * t) * s;      // the vertex radius at t up the tent
  // the ribs along the eight edges
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    bag.add(WS, rod([cx + c * (Rv(0) + 0.06), y0, cz + sn * (Rv(0) + 0.06)], [cx + c * (Rv(0.97) + 0.04), y0 + H * 0.97, cz + sn * (Rv(0.97) + 0.04)], 0.2, 6));
  }
  // three belts
  for (const t of [0.3, 0.58, 0.84]) bag.add(WS, lathe([[Rv(t) + 0.02, -0.14], [Rv(t) + 0.3, -0.07], [Rv(t) + 0.3, 0.07], [Rv(t) + 0.02, 0.14]], 8, null, cx, y0 + H * t, cz));
  // the dormer lights, three tiers
  [[0.15, 1.0], [0.45, 0.8], [0.72, 0.62]].forEach(([t, sc]) => {
    const yb0 = y0 + H * t, hh = 1.1 * sc, hw = 0.3 * sc;
    for (let k = 0; k < 8; k++) {
      const a = (k + 0.5) / 8 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), rA = (t2) => Rv(t2) * ap, rIn = rA(t + hh / H) - 0.06, rOut = rA(t) + 0.26;
      const at = (rr, u) => [cx + c * rr - sn * u, cz + sn * rr + c * u];
      bag.add(WS, orientedBox(at((rIn + rOut) / 2, -hw - 0.14), at((rIn + rOut) / 2, hw + 0.14), rOut - rIn, yb0 - 0.12, yb0 + hh + 0.12));
      bag.add('opening', orientedBox(at(rOut + 0.01, -hw), at(rOut + 0.01, hw), 0.05, yb0, yb0 + hh));
      kokoshnik(bag, cx, cz, a, rOut - 0.22, yb0 + hh + 0.12, 2 * hw + 0.7, 0.12, 0.5 * sc + 0.15, 0.5);
    }
  });
}
