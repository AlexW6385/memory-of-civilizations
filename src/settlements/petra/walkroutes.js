// Petra, about AD 50 — the visitor's walk (docs/settlements/petra.md §23): the routes walk-check follows from the street into the shops
// (the front room, to the counter's end), into the Outer Siq's houses, the nearest houses of the valley, the Khazneh's hall and the
// triclinium. Pure functions of the layout (plan.js puts them on the landmark plan's `walks`).
import { shopUnits, outerLots, lots, height, STREET, TRICLINIUM, PLAZA, floorY } from './layout.js';
import { houseLayout } from '../../styles/nabataean/house.js';

const r1 = (p) => [+p[0].toFixed(2), +p[1].toFixed(2)];

/** Into every shop of the colonnaded street's south side: off the paving, up the portico's steps, in at the door, along the room. */
export function shopRoutes() {
  const e = STREET.a[1] + STREET.w / 2;
  return shopUnits().map((s) => ({ kind: 'shop', i: s.i, y0: 0.5, route: [[s.m, e + 0.4], [s.m, s.z0 - 4.2], [s.m, s.z0 - 0.7], [s.m, s.z0 + 1.0], [s.m, s.z0 + 2.6]].map(r1) }));
}

/** Into the eight houses of the Outer Siq (the plan is turned 90°: world = [−local z, local x]). */
export function outerRoutes() {
  const W = ([lx, lz]) => [-lz, lx];
  return outerLots().map((l) => {
    const H = houseLayout({ ...l, rect: l.local }), d = H.door.u, deep = Math.min(H.D - 2.2, 3.2);
    const route = [H.P(d, -2.6), H.P(d, 0.3), H.P(d, 1.0), H.P(d, deep)].map(W).map(r1);
    return { kind: 'outer', i: l.i, y0: height(route[0][0], route[0][1]) + 0.5, route };
  });
}

/** Into the houses of the valley nearest the street (a room house to its middle, a court house through the gate into the court). */
export function valleyRoutes(n = 4) {
  const near = lots().filter((l) => l.rect[0] > -120 && l.rect[2] < 20).map((l) => [Math.abs((l.rect[1] + l.rect[3]) / 2 - STREET.a[1]), l]).sort((a, b) => a[0] - b[0]).slice(0, n * 3);
  const out = [];
  for (const [, l] of near) {
    const H = houseLayout(l), d = H.court ? H.gate.u : H.door.u, deep = H.court ? 3.0 : Math.min(H.D - 2.2, 3.2);
    const route = [H.P(d, -2.6), H.P(d, 0.3), H.P(d, 1.0), H.P(d, deep)].map(r1);
    out.push({ kind: H.court ? 'court' : 'room', y0: l.y + 0.5, route });
    if (out.length >= n) break;
  }
  return out;
}

/** The Khazneh: across the forecourt, up the steps, through the portico and the great door into the hall. */
export const khaznehRoute = () => ({ kind: 'hall', y0: 0.6, route: [[PLAZA.c[0] - 2, PLAZA.c[1]], [114, PLAZA.c[1]], [106, PLAZA.c[1]], [100, PLAZA.c[1]], [95, PLAZA.c[1]]] });
/** The triclinium: from the street's north edge up to its middle door and in. */
export function triclinumRoute() {
  const [x, z] = TRICLINIUM.at, y = floorY(x, z) + 0.5;
  return { kind: 'hall', y0: y, route: [[x, z + 9], [x, z + 3.5], [x, z + 0.8], [x, z - 2.4], [x, z - 5]] };
}
export function allRoutes() { return [...shopRoutes(), ...outerRoutes(), ...valleyRoutes(), khaznehRoute(), triclinumRoute()]; }
