// The routes walk-check follows into the opened houses of the visitor's walk (walk.js): in at the street door (the shop's open front, the plain house's door,
// the court-house's gate and then the door of its main block), to the front room's middle. Pure functions of the layout; plan.js puts them in the terrace's `walks`.
import { lots } from './layout.js';
import { terraceLots } from './terrace-houses.js';
import { walkDistance, WALK_REACH, T } from './walk.js';
import { frameOf, houseMake } from '../../styles/achaemenid/houses-data.js';

/** The route into one opened house: [[x, z], …] from the street, through the door, into the front room. */
export function routeInto(l) {
  const m = houseMake(l), { P, D } = frameOf(m.rect, m.front);
  if (m.court) {
    const b0 = D - D * 0.46, a = m.da, a2 = m.L * 0.4;
    return [P(a, -2.4), P(a, 0.9), P(a, 2.6), P(a2, b0 - 1.0), P(a2, b0 + 0.3), P(a2, b0 + 1.6)];
  }
  const a = m.kind === 'shop' ? m.da + 0.65 : m.da;
  return [P(a, -2.4), P(a, 0.3), P(a, 1.0), P(a, m.kind === 'shop' ? 2.0 : 2.4)];
}
/** [{ l, route, y0, where }] for the terrace's lodgings (all opened) and the houses of Parsa on the road's walk. */
export function walkRoutes() {
  const out = [];
  for (const l of terraceLots()) out.push({ l, route: routeInto(l), y0: 0, where: 'terrace' });
  for (const l of lots()) {
    if (!l.enter) continue;
    const m = houseMake(l), { P } = frameOf(m.rect, m.front);
    if (walkDistance(P(m.da, 0), 0) > WALK_REACH) continue;
    out.push({ l, route: routeInto(l), y0: 0, where: 'road' });
  }
  return out;
}
export { T };
