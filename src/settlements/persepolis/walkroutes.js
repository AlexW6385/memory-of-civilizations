// The routes walk-check follows into the opened houses of the visitor's walk (walk.js): in at the street door (the shop's open front, the plain house's door,
// the court-house's gate and then the door of its main block), to the front room's middle. Pure functions of the layout; plan.js puts them in the terrace's `walks`.
import { lots, inRect } from './layout.js';
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
    { const [fx, fz] = P(m.da, -1.6); if (lots().some((o) => o !== l && inRect(o.rect, fx, fz))) continue; }      // a neighbour's wall stands before the door: no way in from outside
    out.push({ l, route: routeInto(l), y0: 0, where: 'road' });
  }
  return out;
}
/** The routes into the great rooms and the places of the walk that are not houses (their doors by the halls' own plans): [{ id, route, y0, where }]. */
export function placeRoutes() {
  return [
    // up the Apadana's west stair by its north flight (the flights rise toward the landing; the front is parapet), over the landing and in at the door
    { id: 'apadana', where: 'terrace', route: [[-92, -84], [-83, -84], [-83, -77], [-83, -66], [-83, -60], [-76, -60], [-70, -60], [-58, -60], [-45, -60]] },
    { id: 'market', where: 'road', route: [[-285, -140], [-285, -120], [-285, -110], [-270, -110]] },
    { id: 'workshops', where: 'road', route: [[-208, -140], [-208, -126], [-208, -118]] },
    // the Tachara: up its south stair from the west side, over the landing, north across the portico to the door
    { id: 'tachara', where: 'terrace', route: [[-72, 44.5], [-62, 44.5], [-54, 44.5], [-54, 38], [-54, 30], [-54, 20]] },
    { id: 'hadish', where: 'terrace', route: [[-37, 68], [-37, 78], [-37, 86], [-37, 95], [-30, 95], [-26, 95]] },
    { id: 'hundred', where: 'terrace', route: [[75, -150], [75, -135], [75, -118], [75, -100]] },
  ];
}
export { T };
