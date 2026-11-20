// Where the fires of Uji burn at night (docs/settlements/heian-uji.md §19.2): pure data of layout.js, read by nightlight.js (the light) and
// soundmap.js (the crackle). Coordinates: metres, the settlement's frame.
import { RIVER, BRIDGE, SHRINE, height } from './layout.js';

export const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
/** The Uji Bridge's two ends (x of the deck's start and end, west to east). */
export function bridgeEnds() { const x0 = riverX(BRIDGE.z) - RIVER.w / 2 - 8; return [x0, x0 + RIVER.w + 16]; }
/** The deck's height at x (a hump of 1.4 m over the piles' rows, 0.2 m at the ends). */
export function deckY(x) { const [x0, x1] = bridgeEnds(); return 0.2 + 1.4 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - x0) / (x1 - x0)))); }
/** The san-no-ma, the bay in the third from the west that projects upstream (+z): where Hashihime's lamp stands. */
export function sanNoMa() { const [x0, x1] = bridgeEnds(), n = Math.round((x1 - x0) / 5.4), x = x0 + 2.5 * (x1 - x0) / n; return [x, BRIDGE.z + 3.6]; }
/** The basket fires: at each head of the bridge on both sides of the road, and at the Ujigami shrine's gate. */
export function fireSpots() {
  const [x0, x1] = bridgeEnds(), out = [];
  for (const x of [x0 - 3.5, x1 + 3.5]) for (const dz of [-5.2, 5.2]) out.push({ at: [x, BRIDGE.z + dz], y: height(x, BRIDGE.z + dz) });
  out.push({ at: [SHRINE.terrace[0] + 4, SHRINE.axis - 6], y: SHRINE.level });
  return out;
}
