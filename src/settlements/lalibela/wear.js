// Lalibela c. 1220 — where feet and hands went (docs/settlements/lalibela.md §23): the pale polish on the treads of the cut steps and at the church doors,
// the smoothed band on the trench walls at the height of a hand, the trodden way across a court to the door. Thin boxes of materials the plan already holds
// (`mud_plaster` is the pale one), lying a few millimetres on the stone; one element per place so the plan's near/far split still holds. [inferred]
import '../../styles/zagwe/index.js';
import { STYLES, orientedBox } from '../../core/build.js';

const MAT = 'mud_plaster';
/** lal_wear: { c, strips: [[a, b, width, y0, y1, mat?]] } */
function wearEl({ strips }, { bag }) {
  for (const [a, b, w, y0, y1, mat] of strips) bag.add(mat || MAT, orientedBox(a, b, w, y0, y1));
}
/** The worn middle of every tread of a door's flight (as the style's doorSteps cuts it: 0.2 m rises, 0.32 m runs, r the plinth's rectangle, u the door's middle). */
export function stairWear(side, r, u, w, y0, y1, width = 1.1) {
  const n = Math.max(1, Math.round((y1 - y0) / 0.2)), h = (y1 - y0) / n, d = 0.32, out = [];
  const P = (q) => (side === 'w' ? [r[0] - q, u] : side === 'e' ? [r[2] + q, u] : side === 'n' ? [u, r[1] - q] : [u, r[3] + q]);
  for (let k = 0; k < n; k++) {
    const q0 = (n - k) * d - 0.05, q1 = (n - k - 1) * d + 0.05, yt = y0 + (k + 1) * h;
    out.push([P(q0), P(q1), Math.min(width, w - 0.5) * (1 - k * 0.02), yt + 0.015, yt + 0.02]);
  }
  return out;
}
let done = false;
export function registerWear() { if (done) return; done = true; STYLES.zagwe.elements.lal_wear = wearEl; }
registerWear();
