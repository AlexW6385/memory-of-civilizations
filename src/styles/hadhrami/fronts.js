// The fronts of the ordinary ground floors that can be entered (docs/settlements/shibam.md §12, "Houses"): four fashions chosen by rule from the
// room's use — the open shop front (shopFront in parts.js), the lobby door of a dwelling (lime jambs, carved lintel and hood, the two leaves
// folded back into the reveal), the wide plank gate of a stable under a palm-trunk header with its hay-loft opening, and the arched doorway
// (a pointed lime moulding over the lintel with a lattice fanlight). Built facing +z at the door's middle, the wall's face at z = 0. All are
// visual only; the opening is cut by hollowShell (shops.js) to the same width w and height H.
import { box, rod, lathe } from '../../core/geom.js';
import { fq } from './parts.js';
import { archSpandrel, archFill } from './arch.js';

const CACHE = {};
const leafBack = (o, hw, H, studs) => {
  // the two leaves swung back flat into the reveal (the wall is 0.9 m thick: z from 0 into the wall is z < 0)
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -hw : hw - 0.07, x1 = s < 0 ? -hw + 0.07 : hw;
    o.push(['cedar', box(x0, 0.05, -0.75, x1, H - 0.1, -0.12)]);
    const xi = s < 0 ? x1 : x0;                      // the leaf's inner face, toward the opening
    for (const [z0, z1] of [[-0.68, -0.4], [-0.34, -0.18]]) for (const [y0, y1] of [[0.15, 1.0], [1.15, H - 0.25]]) o.push(['wood_dark', box(Math.min(xi, xi + s * -0.015), y0, z0, Math.max(xi, xi + s * -0.015) + 0.0, y1, z1)]);
    if (studs) for (const z of [-0.65, -0.45, -0.25]) for (const y of [0.4, 0.9, 1.4, 1.9]) o.push(['iron', box(xi - 0.02, y - 0.02, z - 0.02, xi + 0.02, y + 0.02, z + 0.02)]);
  }
};
/** kind: 'lobby' | 'stable' | 'arch'; w the opening's width, H its height. */
export function houseFront(kind, w, H = 2.4) {
  const k = kind + w + H;
  if (CACHE[k]) return CACHE[k];
  const hw = w / 2, o = [];
  if (kind === 'lobby') {
    o.push(['lime_plaster', box(-hw - 0.26, 0, 0, -hw, H + 0.12, 0.11)], ['lime_plaster', box(hw, 0, 0, hw + 0.26, H + 0.12, 0.11)], ['lime_plaster', box(-hw - 0.26, H, 0, hw + 0.26, H + 0.12, 0.11)]);
    o.push(['timber', box(-hw - 0.34, H + 0.12, 0, hw + 0.34, H + 0.24, 0.15)], ['cedar', box(-hw - 0.2, H + 0.24, 0, hw + 0.2, H + 0.44, 0.1)]);
    for (let i = 0; i < Math.floor((w + 0.2) / 0.18); i++) o.push(['wood_dark', box(-hw - 0.1 + i * 0.18, H + 0.28, 0.1, -hw - 0.03 + i * 0.18, H + 0.4, 0.125)]);
    o.push(['lime_plaster', box(-hw - 0.4, H + 0.44, 0, hw + 0.4, H + 0.51, 0.19)], ['lime_plaster', box(-hw - 0.3, H + 0.51, 0, hw + 0.3, H + 0.57, 0.13)]);
    o.push(['schist_rubble', box(-hw - 0.3, 0, 0, hw + 0.3, 0.18, 0.55)], ['schist_rubble', box(-hw - 0.2, 0, 0.55, hw + 0.2, 0.09, 0.8)]);
    leafBack(o, hw, H, true);
    o.push(['wood_dark', box(hw - 0.55, 0.85, -0.1, hw - 0.07, 1.0, -0.04)]);   // the lock-case of the leaf, seen from inside
  } else if (kind === 'stable') {
    o.push(['lime_plaster', box(-hw - 0.3, 0, 0, -hw, H + 0.2, 0.12)], ['lime_plaster', box(hw, 0, 0, hw + 0.3, H + 0.2, 0.12)]);
    o.push(['palm_trunk', rod([-hw - 0.45, H + 0.1, 0.15], [hw + 0.45, H + 0.1, 0.15], 0.14, 8)], ['lime_plaster', box(-hw - 0.3, H + 0.22, 0, hw + 0.3, H + 0.3, 0.1)]);
    // the hay-loft opening over the gate: a small shuttered window and a lime frame
    o.push(['opening', fq(-0.25, H + 0.5, 0.25, H + 0.95, 0.03)], ['timber', box(-0.3, H + 0.45, 0, 0.3, H + 0.5, 0.09)], ['timber', box(-0.3, H + 0.95, 0, 0.3, H + 1.0, 0.09)], ['timber', box(-0.3, H + 0.5, 0, -0.25, H + 0.95, 0.07)], ['timber', box(0.25, H + 0.5, 0, 0.3, H + 0.95, 0.07)]);
    o.push(['schist_rubble', box(-hw - 0.3, 0, 0, hw + 0.3, 0.1, 0.5)]);
    for (const s of [-1, 1]) { const x0 = s < 0 ? -hw : hw - 0.08, x1 = s < 0 ? -hw + 0.08 : hw; o.push(['wood_dark', box(x0, 0.05, -0.8, x1, H - 0.1, -0.12)]); for (let b = 0; b < 5; b++) o.push(['timber', s < 0 ? box(x1, 0.08, -0.78 + b * 0.13, x1 + 0.016, H - 0.14, -0.72 + b * 0.13) : box(x0 - 0.016, 0.08, -0.78 + b * 0.13, x0, H - 0.14, -0.72 + b * 0.13)]); }
    o.push(['iron', lathe([[0.001, 0], [0.05, 0], [0.05, 0.015], [0.02, 0.025], [0.001, 0.03]], 8).rotateX(Math.PI / 2).translate(hw + 0.15, 1.15, 0.12)]);
    o.push(['iron', rod([hw + 0.15, 1.15, 0.15], [hw + 0.15, 0.95, 0.35], 0.012, 4)]);
  } else {
    // the arched doorway: rectangular opening under a pointed lime moulding whose field is a lattice fanlight
    const a = hw + 0.32, yS = H + 0.15, rise = (a * 2) * 0.82;
    o.push(['lime_plaster', box(-hw - 0.3, 0, 0, -hw, yS, 0.1)], ['lime_plaster', box(hw, 0, 0, hw + 0.3, yS, 0.1)], ['timber', box(-hw - 0.3, H, 0, hw + 0.3, H + 0.15, 0.13)]);
    o.push(['lime_plaster', archSpandrel({ u0: -a, u1: a, yS, rise, yTop: yS + rise + 0.22, w0: 0, w1: 0.1, axis: 'x' })]);
    o.push(['opening', archFill({ u0: -hw, u1: hw, y0: H + 0.15, yS, rise: rise - 0.2, w: 0.04, dir: 1, axis: 'x' })]);
    for (let i = 1; i < 6; i++) { const x = -hw + (w * i) / 6; o.push(['wood_dark', box(x - 0.012, H + 0.15, 0.04, x + 0.012, H + 0.15 + Math.min(0.55, rise * 0.5 * (1 - Math.abs(x) / hw * 0.4)), 0.065)]); }
    o.push(['schist_rubble', box(-hw - 0.3, 0, 0, hw + 0.3, 0.2, 0.5)], ['schist_rubble', box(-hw - 0.2, 0, 0.5, hw + 0.2, 0.1, 0.75)]);
    leafBack(o, hw, H, false);
  }
  return (CACHE[k] = o);
}
