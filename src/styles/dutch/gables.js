// The stone dressings of the canal houses' gables (docs/settlements/amsterdam.md §5.19): the volute (a scroll of sandstone
// curling in on itself, in relief), the obelisk, the urn and the ball that stand on the shoulders and the steps.
import { frustum, lathe } from '../../core/geom.js';
import { relief, ribbon, spiral } from '../norse/carving.js';

const ST = 'sandstone_dressed';

/** A scroll on frame F at base height y: centre (cu, cv) in (u, v), outer radius R, turning inward `turns` turns from angle a0 (dir ±1), a band tapering from w0 to w1, standing d0..d1. */
export function volute(bag, F, y, cu, cv, R, a0, dir, d0, d1, o = {}) {
  const pts = spiral([cu, cv], a0, R, o.turns ?? 1.2, dir, 0.25, 9), w0 = o.w0 ?? R * 0.42, w1 = o.w1 ?? R * 0.12;
  const [x, z] = F.at(0, 0), [x1, z1] = F.at(0, 1), n = [x1 - x, z1 - z];
  bag.add(o.mat ?? ST, relief(ribbon(pts, (t) => w0 + (w1 - w0) * t), [x, y, z], n, d0, d1, 3));
}
/** A stone ball on a short neck, standing on frame F at (u, v), d out from the face. */
export function ball(bag, F, y, u, v, r, d = -0.1) { const [x, z] = F.at(u, d); bag.add(ST, lathe([[r * 0.5, 0], [r, r * 0.9], [r, r * 1.7], [0.001, r * 2.5]], 6, null, x, y + v, z)); }
/** An obelisk on its plinth: a square shaft tapering to a point, a ball under it. */
export function obelisk(bag, F, y, u, v, r, h, d = -0.1) {
  const [x, z] = F.at(u, d);
  bag.add(ST, frustum([x - r, z - r, x + r, z + r], y + v, y + v + h * 0.8, 0, 0, 0, 0));
  bag.add(ST, frustum([x - r, z - r, x + r, z + r], y + v + h * 0.8, y + v + h, r * 0.85, r * 0.85, r * 0.85, r * 0.85));
}
/** A vase (urn) with a gadrooned belly and a lid, on a short foot. */
export function urn(bag, F, y, u, v, r, d = -0.1) {
  const [x, z] = F.at(u, d);
  bag.add(ST, lathe([[r * 0.6, 0], [r, r * 1.3], [r * 0.5, r * 2.2], [0.001, r * 3.0]], 5, null, x, y + v, z));
}
