// The horses over the middle portal, and the patrons on the two columns of the Piazzetta.
import { CV, GB, BZ, at, put, person, quadrigaHorse, lionModel, crocodile, theodore, flip } from './stone.js';
import { Matrix4 } from '../../core/three.js';

/** el: { x, y, z } the middle of the four plinths' row (x the plinths' middle, y their top, z the centre), dz the spacing. */
export function horsesOf(L, el, lod) {
  for (const [dz, turn, lift] of [[-3.9, 0.22, 'n'], [-1.3, 0.08, null], [1.3, -0.08, 'n'], [3.9, -0.22, null]]) {
    const g = quadrigaHorse({ lod, raise: lift, tilt: 0.25 + 0.1 * (dz > 0 ? 1 : 0) });
    put(L, GB, g, at(1.3, el.x, el.y, el.z + dz, Math.PI + turn));
  }
}
/** el: { c: [x, z], yt (the abacus's top), statue }. */
export function patronOf(L, el, lod) {
  const [x, z] = el.c, yt = el.yt;
  if (el.statue === 'lion') put(L, BZ, lionModel({ lod }), at(1.1, x - 0.1, yt, z, -Math.PI / 2));
  else {
    put(L, CV, crocodile({ lod }), at(0.62, x - 0.15, yt + 0.3, z + 0.05, 0.2));
    const f = theodore({ lod });
    const m = at(2.7, x, yt + 0.3 + 0.1, z - 0.15, 0);
    put(L, CV, f.stone, m); put(L, CV, f.metal, m);
  }
}
