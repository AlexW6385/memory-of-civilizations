// The plan of the upper floors of Djenné's enterable houses (docs/settlements/djenne.md §19): the numbers shared by the builder
// (homes.js) and the settlement's walking routes (src/settlements/djenne/plan.js). Local frame of a house: u across the front
// (0 … W), v inward from the street (0 … D); the front block (street wall, the room over the vestibule) is v 0 … vc0.

export const T = { tw: 0.45, fv: 3.6, vc0: 4.05, H1: 3.1, Hf: 6.2, stairW: 1.0 };
/** The kinds of upper floor, by the house's household (dossier §19): the zones west and east of the roof stair. */
export const UPPER = {
  family: ['sleep', 'store'], merchant: ['store', 'sleep'], craftsman: ['sleep', 'work'], marabout: ['sleep', 'study'], guest: ['guest', 'guest'], tenement: ['cell', 'cell'],
};
export const UPPER_KINDS = Object.keys(UPPER);

/** Everything about the upper floor of a house { rect, front, kind }: its sizes, partition, roof stair, hole, loggia. */
export function upperPlan(el) {
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, south = (el.front || 's') === 's';
  const { tw, fv, vc0, H1, Hf } = T, mid = W / 2, bv = D - 3.4;
  const len = Math.max(2.4, vc0 + 3.55 > bv ? bv - vc0 - 0.1 : 3.55);       // the court stair's run
  const rs = W >= 7.4;                                                         // a roof stair (the narrow houses have none: the run needs 3.6 m)
  const uB = W - tw - 1.0, uA = rs ? uB - 3.6 : W;                             // the roof stair, along the court wall, rising east (in u): 41°, a run of 3.6 m
  const hole = rs ? [uA + 0.5, fv - 1.5, uB, fv] : null;                      // the opening in the roof over it (head room from 0.5 m up the stair)
  const pu = W >= 9 ? Math.min(uA - 0.9, Math.max(3.4, W * 0.4)) : 0;         // the partition wall's west face (0: none)
  const loggia = W >= 8 ? { u0: 1.55, u1: W - 2.9, v1: vc0 + 1.35 } : null;    // the roofed gallery over the court, west of the court's furniture
  let kind = el.kind in UPPER ? el.kind : 'family';
  if (kind === 'tenement' && !pu) kind = 'family';
  const pt = (u, v) => (south ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
  return { W, D, mid, bv, len, rs, uA, uB, hole, pu, loggia, kind, pt, south, dir: south ? 'e' : 'w' };
}

/** The walk to the upper floor of a house, in the plan's coordinates: street, door, vestibule, court, the court stair, the room above, the roof stair, the roof. */
export function upperWalk(el, to = 'roof') {
  const P = upperPlan(el), { tw, fv, vc0, H1, Hf } = T, { W, mid, len, uA, uB, pt, loggia } = P;
  const vf = vc0 + len, r = [[mid, -1.8], [mid, 1.2], [mid, 3.0], [mid, vc0 + 0.9], [2.3, vc0 + 1.7], [2.3, vf - 0.2], [0.95, vf - 0.2], [0.95, vc0 + 0.3], [0.95, 3.2], [1.0, 1.9]];
  if (to === 'loggia' && loggia) r.push([1.0, 3.0], [2.4, 3.1], [2.4, vc0 + 0.7], [(loggia.u0 + loggia.u1) / 2, vc0 + 0.7]);
  else if (P.rs) r.push([uA - 0.4, 1.9], [uA - 0.4, 2.85], [uA + 0.3, 2.85], [uB - 0.3, 2.85], [uB + 0.6, 2.85], [uB + 0.6, 1.0], [mid, 1.0]);
  else r.push([mid, 1.9]);
  const w = r.map(([u, v]) => pt(u, v));
  w.y0 = 0;
  void tw; void fv; void H1; void Hf;
  return w;
}
