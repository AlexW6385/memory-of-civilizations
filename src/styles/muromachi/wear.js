// Moss on stone (docs/settlements/muromachi-kyoto.md §12): what damp does to steps and gutters. Low cushions of `sod`, the moss's material (a plan
// that already holds it adds no draw).
//   { t: 'kyoto_wear', kind: 'tread', at: [x, z], y (the tread's surface), rot (the heading up the flight), d (the tread's depth), w (its width), moss? }
//       moss in the two far corners of the tread and along its back edge, if `moss` (the dish worn into the middle of a tread by feet is
//       cut into the step itself: streamSteps, togudo)
//   { t: 'kyoto_wear', kind: 'moss', at: [x, z], y, r, seed } — a low cushion of moss on a stone's edge (a gutter's course)
import { lathe } from '../../core/geom.js';

const cushion = (x, y, z, r, k = 1) => lathe([[0.001, 0], [r, 0], [r * 0.92, 0.025 * k], [r * 0.55, 0.045 * k], [0.001, 0.055 * k]], 6, null, x, y, z).scale(1, 1, 0.8);
function wear(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  if (el.kind === 'tread') {
    const d = el.d ?? 0.35, w = el.w ?? 1.2;
    if (el.moss) {
      for (const sg of [-1, 1]) bag.add('sod', cushion(x - c * d * 0.3 - s * sg * w * 0.42, y + 0.002, z - s * d * 0.3 + c * sg * w * 0.42, 0.13));
      bag.add('sod', cushion(x - c * d * 0.46, y + 0.002, z - s * d * 0.46, 0.1, 0.8));
    }
  } else bag.add('sod', cushion(x, y, z, el.r ?? 0.22));
}
export const wearElements = { kyoto_wear: wear };
