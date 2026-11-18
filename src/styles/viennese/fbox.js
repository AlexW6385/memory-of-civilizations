// A facade box as an axis-aligned world box (core box()), so that the boxes of every face of every house share one prototype
// (the same shape for any facing) and instance as one draw per material instead of one per facing. Same geometry as dutch fbox.
import { box } from '../../core/geom.js';

/** A facade box: u0..u1, v0..v1, d0..d1 on frame F at base height y. */
export function fbox(F, y, u0, u1, v0, v1, d0, d1) {
  const a = F.at(u0, d0), b = F.at(u1, d1);
  return box(Math.min(a[0], b[0]), y + Math.min(v0, v1), Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + Math.max(v0, v1), Math.max(a[1], b[1]));
}
