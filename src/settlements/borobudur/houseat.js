// Sailendra Java — places before a house, kept clear of its stair (docs/settlements/borobudur.md §20.1): the stair comes down the house's front at `su`, 1.7 m wide, and
// the walker needs it free: a prop or a figure that would stand in its lane (within 1.55 m of it sideways and a stair-run and a step out) is moved along the front, not deleted.
import { rumahPlace } from '../../styles/javanese/index.js';
import { frontVec } from './layout.js';

/** at(d, u): d out from the house's front edge, u along it, as the yards and households use it; the stair's lane left clear. */
export function atOf(h) {
  const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, [fx, fz] = frontVec(h.front), tx = -fz, tz = fx;
  const half = (h.front === 'e' || h.front === 'w' ? x1 - x0 : z1 - z0) / 2, Pl = h.kind === 'lumbung' ? null : rumahPlace(h);
  const wide = (h.front === 'e' || h.front === 'w' ? z1 - z0 : x1 - x0) / 2 + 1.6;
  const sgn = -1;                                     // (the frame's u runs against `t` on every front)
  return (d, u) => {
    if (Pl && d > -0.3 && d < Pl.run + 1.5 && Math.abs(u - sgn * Pl.su) < 1.6) u = sgn * Pl.su + (u >= sgn * Pl.su ? 1 : -1) * 1.7;
    u = Math.max(-wide, Math.min(wide, u));
    return [cx + fx * (half + d) + tx * u, cz + fz * (half + d) + tz * u];
  };
}
