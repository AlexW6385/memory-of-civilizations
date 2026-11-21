// Conques about 1120 by night — the lights outside the houses' own walls (docs/settlements/conques.md §20.2): the iron lanterns by the shops' doors
// (the shops of the pilgrims' way kept one lit while the pilgrims' hour lasted), the hostel's lamp at its door, the candle-seller's trestle before the
// church, the lamp of the Plò, and — added to the abbey's plan — the glow of its hanging lamps and of the candles on the altar and before the treasure.
// Pure data and functions of layout.js; the glow itself is src/settlements/conques/nightlight.js (`conques_halo`).
import { RADIUS, ABBEY, HOSTEL, FOUNTAINS, lots, level } from './layout.js';
import { shopPoint } from '../../styles/romanesque/village.js';
import './nightlight.js';

const frameOf = (l) => {
  const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 's' || f === 'n';
  return { P: (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]), L: along ? x1 - x0 : z1 - z0 };
};

/** The lights of the open air: [{ at: [x, y, z], r, floor, pool }] in world metres. */
export function outdoorLights() {
  const out = [];
  for (const l of lots()) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (Math.hypot(cx, cz) >= 110 || !l.shop) continue;
    const { P, L } = frameOf(l), sp = shopPoint(l), dir = l.seed % 2 ? 1 : -1, u = sp.a0 + dir * 2.45;
    if (u > 0.3 && u < L - 0.3) { const [x, z] = P(u, -0.54); out.push({ at: [x, l.y + 2.23, z], r: 0.55, floor: l.y, pool: 2.0 }); }
  }
  // the hostel's lamp at its door (a rushlight in a horn lantern hung on the bracket: the guests came in after dark)
  const [hx0, , hx1, hz1] = HOSTEL.rect, hy = level(6);
  out.push({ at: [(hx0 + hx1) / 2 - 1.5, hy + 2.2, hz1 + 0.45], r: 0.6, floor: hy, pool: 2.4 });
  // the candle-seller's trestle at the church's south-west corner of the front: wax for the saint
  out.push({ at: [ABBEY.origin[0] - 6.5, 1.35, -12.4], r: 0.5, floor: 0, pool: 1.6 });
  // the Plò, the spring before the church's doors: a lamp in a niche over the tank, for those who drew water at night
  const plo = FOUNTAINS.find((f) => f.id === 'plo');
  if (plo) out.push({ at: [(plo.rect[0] + plo.rect[2]) / 2 + 0.2, 2.1, (plo.rect[1] + plo.rect[3]) / 2], r: 0.5, floor: 0, pool: 1.8 });
  // the visitor's arrival, the parvis before the west door: the vigil kept at the saint's shrine drew pilgrims after the last bell [inferred], so the door
  // stood ajar on the nave's lamps, an iron lamp hung on a bracket by each buttress, and a fire of brushwood in an iron basket on the terrace for those waiting
  const ox = ABBEY.origin[0];
  out.push({ at: [ox - 0.55, 1.55, 0], r: 1.25, k: 0.5, floor: 0, pool: 3.2 });
  for (const dz of [-3.1, 3.1]) out.push({ at: [ox - 0.5, 2.5, dz], r: 0.55, floor: 0, pool: 2.3 });
  out.push({ at: [ox - 9.5, 0.75, 5.2], r: 0.75, k: 0.8, floor: 0, pool: 3.6, pk: 0.85 });
  return out;
}

/** The plan of these lights (style romanesque, whose elements the glow is registered on). */
export function nightPlan() {
  const elements = outdoorLights().map((l) => ({ t: 'conques_halo', at: l.at, r: l.r, k: l.k, pk: l.pk, floor: l.floor, pool: l.pool }));
  return { id: 'conques-night', style: 'romanesque', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' } };
}

/**
 * The abbey's glow, added to its plan's elements (local frame): a glow for each hanging lamp the plan already has, the altar's two candlesticks and the
 * candles by the treasure's stands [inferred: where the building's style puts them — src/buildings/sainte-foy-conques/style.js `foy_treasure`].
 */
export function churchGlow(elements) {
  const out = [];
  for (const e of elements) {
    if (e.t !== 'lamp') continue;
    const d = e.distance ?? 9, floor = e.at[1] < 3.2 ? 0 : undefined;
    out.push({ t: 'conques_halo', at: e.at, r: Math.max(0.4, Math.min(0.85, d * 0.07)), floor, pool: Math.max(1.2, Math.min(2.6, d * 0.2)), pk: 0.45 });
  }
  const ty = 1.05 + 0.012, cx = 38.8 - 0.18;
  for (const dz of [-0.6, 0.6]) out.push({ t: 'conques_halo', at: [cx, ty + 0.46 + 0.23 + 0.03, dz], r: 0.32, k: 0.7 });
  const sx = 40.6 + 1.25;
  for (const [sz, dz] of [[-1.35, 0.24], [1.35, -0.24]]) out.push({ t: 'conques_halo', at: [sx - 0.3, 0.96 + 0.3 + 0.26, sz + dz], r: 0.28, k: 0.7 });
  return out;
}
