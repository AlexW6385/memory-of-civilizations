// Where the new night lights stand (nightlight.js; docs/settlements/lu-qufu.md §15): the fire baskets of the guards at the gates of the temple, of the Duke's mansion and of the
// city wall's south gate. Pure data (`lu_cresset` elements); each beside the guards, never in a gate's passage nor on the visitor's way (walk.js).
import { GATE_HALLS, CITY_WALL, MX, shopGapZs } from './layout.js';

const C = (x, z) => ({ t: 'lu_cresset', at: [x, z] });
/** The temple's gates (the guards stand at ±(w/2 + 2.2), 4.6 m south of each gate's middle: the baskets stand a little beyond them), the Wanren Gongqiang gate on both sides, the mansion's gate. */
export function nightLights() {
  const E = [];
  for (const g of GATE_HALLS) for (const s of [-1, 1]) E.push(C(s * (g.w / 2 + 3.8), g.z + 4.6));
  const z = CITY_WALL.z, th = CITY_WALL.th / 2;
  // (inside the gate the basket stands clear of every shop's doorway lane on its side)
  const gaps = shopGapZs();
  for (const s of [-1, 1]) E.push(C(s * 4.4, [z - th - 1.6, z - th - 3.0, z - th - 4.5, z - th - 6.0, z - th - 7.5].find((q) => gaps[s].every((g) => Math.abs(g - q) > 1.3)) ?? z - th - 1.6), C(s * 4.4, z + th + 2.4));
  for (const s of [-1, 1]) E.push(C(MX + s * 6.6, 114));
  return E;
}
