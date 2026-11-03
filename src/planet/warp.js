// The map of Earth onto the planet (DESIGN §4.2, docs/world.md "Layout"). The crowded parts of
// the world — Europe and the Near East, India, East Asia — are gently magnified by lenses so that
// their civilizations can stand apart; the oceans give up the room. A lens moves every point along
// the great circle from its centre: angle θ becomes f(θ) = θ + (m − 1)·θ·e^(−(θ/r)²), which
// magnifies by m at the centre, is the identity far away and never folds (m < 3.2); kept mild
// and wide so that the continents keep the shapes everyone knows. Lenses are applied in order;
// the inverse undoes them in reverse.

import { LENSES } from './layout.js';
import { unit, angle, norm, sub, scale, dot, add } from './geo.js';

const L = LENSES.map((l) => ({ c: unit(l.at[0], l.at[1]), m: l.m, r: l.r * Math.PI / 180 }));

const f = (l, th) => th + (l.m - 1) * th * Math.exp(-((th / l.r) ** 2));
const df = (l, th) => { const x2 = (th / l.r) ** 2; return 1 + (l.m - 1) * Math.exp(-x2) * (1 - 2 * x2); };

/** Point at angle th from c on the great circle through u. */
function along(c, u, th) {
  let t = sub(u, scale(c, dot(c, u)));
  const l = Math.hypot(t[0], t[1], t[2]);
  if (l < 1e-12) return u.slice();
  t = scale(t, 1 / l);
  return norm(add(scale(c, Math.cos(th)), scale(t, Math.sin(th))));
}

function apply(l, u) { const th = angle(l.c, u); return th < 1e-12 ? u.slice() : along(l.c, u, Math.min(Math.PI, f(l, th))); }
function undo(l, v) {
  const t1 = angle(l.c, v);
  if (t1 < 1e-12) return v.slice();
  let th = t1 / l.m;
  for (let i = 0; i < 40; i++) {
    const e = f(l, th) - t1;
    if (Math.abs(e) < 1e-13) break;
    th = Math.max(0, Math.min(Math.PI, th - e / df(l, th)));
  }
  return along(l.c, v, th);
}

/** Earth (true) direction → planet direction. */
export function mapEarth(u) { let v = u; for (const l of L) v = apply(l, v); return v; }

/** Planet direction → Earth (true) direction. */
export function unmapPlanet(v) { let u = v; for (let i = L.length - 1; i >= 0; i--) u = undo(L[i], u); return u; }
