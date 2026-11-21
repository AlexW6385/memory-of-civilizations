// Where feet went at the Secession (docs/settlements/vienna.md §16): the forecourt's flagstones rubbed dark along the ways visitors took from the
// street to the steps (converging on the door), the middle of each tread of the granite steps worn pale, the porch floor worn before the doors.
// Boxes 1.2 cm proud of the surface in `granite_grey` / `flagstone`, materials the Secession's plan already holds, so it costs no draw; no collision.
// Everything a function of position (no counters, no Math.random).
import { box } from '../../core/geom.js';

const hash = (x, z, k) => { const s = Math.sin(x * 12.9898 + z * 78.233 + k * 37.719) * 43758.5453; return s - Math.floor(s); };

/** sec_wear: { box: SEC, court: SEC_COURT, y: forecourt top } */
export function secWear(el, { bag }) {
  const [x0, z0, x1] = el.box, cx = (x0 + x1) / 2, zc0 = el.court[1], zc1 = z0 - 0.35, yf = el.y ?? 0.03, H = 0.012;
  // the forecourt: patches of rubbed paving, a broad fan at the street end narrowing to the door
  for (let z = zc0 + 1.2; z < zc1 - 0.3; z += 0.9) {
    const t = (z - zc0) / (zc1 - zc0), half = 2.0 + (1 - t) * 3.4;
    for (let k = 0; k < 4; k++) {
      if (hash(cx, z, k) < 0.4) continue;
      const u = (hash(z, k, 9) * 2 - 1) * half, a = 0.55 + hash(z, k, 3) * 0.5, b = 0.28 + hash(k, z, 5) * 0.3;
      const xs = cx + u * (0.55 + 0.45 * t) - a / 2, zs = z + (hash(z, k, 7) - 0.5) * 0.3;
      bag.add('granite_grey', box(xs, yf, zs, xs + a, yf + H, zs + b));
    }
  }
  // the steps (secession.js: lower tread b -0.05…0.6 at 0.175, upper b 0.6…1.2 at 0.35): the pale polish of the middle of each tread
  bag.add('flagstone', box(cx - 2.1, 0.175, z0 + 0.0, cx + 2.1, 0.175 + H, z0 + 0.5));
  bag.add('flagstone', box(cx - 1.9, 0.35, z0 + 0.7, cx + 1.9, 0.35 + H, z0 + 1.1));
  // the porch before the doors: the floor rubbed dark where everyone enters, deepest on the axis
  bag.add('granite_grey', box(cx - 1.9, 0.35, z0 + 1.3, cx + 1.9, 0.35 + H, z0 + 2.6));
  bag.add('granite_grey', box(cx - 1.2, 0.35 + H, z0 + 1.6, cx + 1.2, 0.35 + 2 * H, z0 + 2.5));
}
