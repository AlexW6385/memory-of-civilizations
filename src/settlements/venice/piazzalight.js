// The Piazza by night (docs/settlements/venice.md §5i): the lights the square's own date supports, as halo items (venetian/night.js `lamp`), added to the
// plan that already holds the shops' glow, so they cost no mesh or draw. Pure data from layout.js.
import { PIAZZA, BASILICA, GROUND } from './layout.js';
import { hashAt } from '../../styles/venetian/halo.js';

/** The five portals' lamps before San Marco's front, the lamps hung in the arcades of both Procuratie, the lantern of the stall by the arrival. */
export function piazzaLights() {
  const out = [], fx = BASILICA.c[0] - BASILICA.s - 10, S = BASILICA.s, z0 = BASILICA.c[1] - S * 0.85, PW = S * 1.7 / 5;
  // the portals: a lamp hung in each (the middle one the greater), a pool across the steps, the wash on the door
  for (let k = 0; k < 5; k++) {
    const zk = z0 + (k + 0.5) * PW, mid = k === 2;
    out.push({ k: 'lamp', at: [fx - 1.2, zk], y: GROUND, h: 3.4, ball: mid ? 1.7 : 1.3, pool: [mid ? 4.2 : 3.4, mid ? 4.6 : 3.8], wall: { at: [fx - 0.1, zk], n: [-1, 0], y: 3.6, rw: mid ? 3.6 : 3.0, rh: mid ? 4.2 : 3.6 } });
  }
  // the arcades: an iron lantern on a chain in every fourth bay of the portico, north range and south range
  for (const [x0, x1, zl, zw, n] of [[PIAZZA[0] + 4, 4, PIAZZA[1] - 2.1, PIAZZA[1] - 4.1, [0, 1]], [PIAZZA[0] + 4, -4, PIAZZA[3] + 2.1, PIAZZA[3] + 4.1, [0, -1]]])
    for (let x = x0 + 3; x < x1; x += 12.4) {
      const xx = x + (hashAt(x, zl, 31) - 0.5) * 3;
      out.push({ k: 'lamp', at: [xx, zl], y: GROUND, h: 3.0, ball: 1.1, pool: [3.2, 2.3], wall: { at: [xx, zw + (n[1] > 0 ? 0.05 : -0.05)], n, y: 3.0, rw: 2.0, rh: 1.6 } });
    }
  // the lantern at the stall by the arrival
  out.push({ k: 'lamp', at: [-54.6, -3.6], y: GROUND, h: 2.5, ball: 0.65, pool: [3.4, 3.4] });
  return out;
}
