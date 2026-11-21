// The routes walk-check follows into the opened places of the visitor's walk (walk.js): in at the compound's gate, across the yard, in at the
// door of each open house to the floor beside the hearth; and in at the entrance of each Valley court to its workplace (the goods of the coast,
// the smithy, the stone carver). A pure function of the layout.
import { compounds, VALLEY, height } from './layout.js';
import { walkDistance, HOMESTEAD_REACH } from './walk.js';
import { courtAt } from './life.js';

const P = (c, a, d) => [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d];
/** [{ kind, route: [[x, z], …], y0 }] — one route into each open house of the homesteads on the walk, one into each Valley court. */
export function walkRoutes() {
  const out = [];
  for (const k of compounds()) {
    if (walkDistance(k.c) > HOMESTEAD_REACH) continue;
    k.huts.forEach((h, i) => {
      if (!h.open) return;
      const a = (h.seed % 628) / 100, door = P(h.c, a, h.r + 1.1), sill = P(h.c, a, h.r - 0.1);
      const ins = P(h.c, a + 0.9, 1.15);
      // out in the open at the gate, in at the gate, to the middle of the yard (the mortar is laid clear of it: layout.js yardAngle), to the door, over the sill, to the floor inside
      out.push({ kind: 'house', k, h, route: [P(k.c, k.gap, k.r + 3), P(k.c, k.gap, k.r - 0.6), [k.c[0], k.c[1]], door, sill, ins], y0: height(...P(k.c, k.gap, k.r + 3)) });
    });
  }
  // the Valley courts: by the worn way to the court's side, round to the gap of its wall, in to the workplace (the goods in court 0, the smith 1, the carver 2)
  VALLEY.forEach((V, i) => {
    const gc = (V.a0 + V.a1 - Math.PI * 2) / 2, E = (m, d = 0) => [V.c[0] + Math.cos(gc) * (V.r[0] * m + d), V.c[1] + Math.sin(gc) * (V.r[1] * m + d)];
    const w = courtAt(i), out0 = E(1, 4), outer = E(1, 0), inner = E(0.55);
    // (to a place 3.5 m short of the workplace's middle, where the goods, the forge, the pole shed's posts and the stone begin)
    const dx = w.at[0] - inner[0], dz = w.at[1] - inner[1], dl = Math.hypot(dx, dz) || 1, end = [w.at[0] - dx / dl * 3.5, w.at[1] - dz / dl * 3.5];
    out.push({ kind: 'court', i, route: [out0, outer, inner, end], y0: height(out0[0], out0[1]) });
  });
  return out;
}
