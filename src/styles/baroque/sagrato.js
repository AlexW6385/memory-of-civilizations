// St Peter's raised above the piazza (docs/settlements/baroque-rome.md §4): the travertine socle under
// the church, the sagrato — the broad landing before Maderno's front — and Bernini's steps down to the
// piazza in three flights with landings between, cheek walls and balustrades at the landing's ends,
// and the old statues of Peter (keys) and Paul (sword) on pedestals at the foot of the stairs.

import { box, lathe, rod } from '../../core/geom.js';
import { ext } from '../renaissance/face.js';
import { human } from '../greek/sculpture.js';

const T = 'travertine', CV = 'limestone_carved';

/** The socle under the church's outer walls: each plan rect [x0, z0, x1, z1] and each circle [x, z, r] widened by a 0.6 m plinth, from the ground up to the floor y. */
export function socle(bag, col, { rects, circles, y }) {
  for (const r of rects) { const q = [r[0] - 0.6, r[1] - 0.6, r[2] + 0.6, r[3] + 0.6]; bag.add(T, box(q[0], -0.5, q[1], q[2], y, q[3])); col.rect(q, 0, y); }
  for (const [x, z, r] of circles) { bag.add(T, lathe([[0.001, 0], [r + 0.6, 0], [r + 0.6, y + 0.5], [0.001, y + 0.5]], 32, null, x, -0.5, z)); col.circle(x, z, r + 0.6, 0, y); }
}

/** A balustrade along x (from x0 to x1) at z, its foot at y: the plinth, the balusters, the rail. */
function balustradeX(bag, col, x0, x1, z, y) {
  bag.add(T, box(x0, y, z - 0.35, x1, y + 0.22, z + 0.35)); bag.add(T, box(x0, y + 0.95, z - 0.32, x1, y + 1.12, z + 0.32));
  const n = Math.round((x1 - x0) / 0.34);
  for (let k = 0; k < n; k++) bag.add(T, lathe([[0.1, 0], [0.16, 0.26], [0.09, 0.56], [0.12, 0.7], [0.1, 0.73]], 6, null, x0 + (k + 0.5) * (x1 - x0) / n, y + 0.22, z));
  col.rect([x0, z - 0.35, x1, z + 0.35], y, y + 1.12);
}
function balustradeZ(bag, col, z0, z1, x, y) {
  bag.add(T, box(x - 0.35, y, z0, x + 0.35, y + 0.22, z1)); bag.add(T, box(x - 0.32, y + 0.95, z0, x + 0.32, y + 1.12, z1));
  const n = Math.round((z1 - z0) / 0.34);
  for (let k = 0; k < n; k++) bag.add(T, lathe([[0.1, 0], [0.16, 0.26], [0.09, 0.56], [0.12, 0.7], [0.1, 0.73]], 6, null, x, y + 0.22, z0 + (k + 0.5) * (z1 - z0) / n));
  col.rect([x - 0.35, z0, x + 0.35, z1], y, y + 1.12);
}

/**
 * The sagrato and the steps: { fx (the front's face), cz, fw (the front's half-width), y (the church's floor; the piazza at 0) }.
 * The landing D deep along the whole front, then flights of six steps (one metre each) down to the piazza, wst half-wide.
 */
export function sagrato(bag, col, { fx, cz, fw, y }) {
  const D = 9, wst = 34, tread = 0.42, land = 2.4, per = 1.0, nf = Math.max(1, Math.round(y / per)), rise = y / nf, ns = 6;
  const Z0 = cz - fw - 0.6, Z1 = cz + fw + 0.6, X0 = fx + D;
  // the landing before the front, level with the portico's floor
  bag.add(T, box(fx - 0.2, -0.5, Z0, X0, y + 0.05, Z1)); col.floor([fx, Z0, X0, Z1], y + 0.05); col.rect([fx, Z0, X0, Z1], 0, y + 0.04);
  // the flights and the landings between them (each step its own block, so that no two side faces overlap)
  let x = X0, top = y + 0.05;
  for (let j = 0; j < nf; j++) {
    const xa = x;
    // each step worn by the feet of centuries: dished 2 cm in the middle 24 m of the flight where most climb, the
    // nosing there rounded back (a sloped lip), the ends left sharp
    for (let k = 0; k < ns; k++) {
      const h = top - rise * (k + 1) / ns, wz = 12, dip = 0.02 + 0.006 * (nf - j);
      for (const [a, b] of [[cz - wst, cz - wz], [cz + wz, cz + wst]]) bag.add(T, box(x, -0.5, a, x + tread, h, b));
      bag.add(T, box(x, -0.5, cz - wz, x + tread - 0.06, h - dip, cz + wz));
      const lip = box(0, -0.5, cz - wz, 0.06, 0, cz + wz), pa = lip.attributes.position.array;
      for (let i = 0; i < pa.length; i += 3) { const top0 = pa[i + 1] === 0; pa[i + 1] = top0 ? h - dip - (pa[i] > 0.03 ? 0.03 : 0) : pa[i + 1]; pa[i] += x + tread - 0.06; }
      lip.computeVertexNormals(); bag.add(T, lip);
      x += tread;
    }
    col.ramp([xa, cz - wst, x, cz + wst], top - rise, top, 'w');
    top -= rise;
    if (j < nf - 1) { bag.add(T, box(x, -0.5, cz - wst, x + land, top, cz + wst)); col.floor([x, cz - wst, x + land, cz + wst], top); x += land; }
  }
  const XE = x;
  // the cheek walls along the flights: their tops follow the stair a metre above the nosings
  const prof = [[X0, -0.5]], hh = 0.95;
  { let xx = X0, t = y + 0.05; prof.push([xx, t + hh]); for (let j = 0; j < nf; j++) { xx += ns * tread; t -= rise; prof.push([xx, t + hh]); if (j < nf - 1) { xx += land; prof.push([xx, t + hh]); } } prof.push([XE + 0.6, hh], [XE + 0.6, -0.5]); }
  for (const s of [-1, 1]) {
    const za = s < 0 ? cz - wst - 0.9 : cz + wst, zb = za + 0.9;
    bag.add(T, ext(prof, [], za, zb, 1));
    { const tl = prof.slice(1, -1); bag.add(T, ext(tl.map(([p, q]) => [p, q + 0.12]).concat(tl.slice().reverse()), [], za - 0.08, zb + 0.08, 1)); }   // the coping
    col.rect([X0, za, XE + 0.6, zb], 0, y + 1.0);
    // the balustrades along the landing's front beyond the stair, and at its ends
    const zf0 = s < 0 ? Z0 : cz + wst + 0.9, zf1 = s < 0 ? cz - wst - 0.9 : Z1;
    balustradeZ(bag, col, zf0, zf1, X0 - 0.35, y + 0.05);
    balustradeX(bag, col, fx + 4.8, X0 - 0.7, s < 0 ? Z0 + 0.35 : Z1 - 0.35, y + 0.05);
    // at the foot, on pedestals: Peter with the keys on the south (the left as one faces the church), Paul with the sword on the north
    const pz = s < 0 ? cz - wst - 0.45 : cz + wst + 0.45, px = XE + 2.2;
    bag.add(T, box(px - 1.1, -0.3, pz - 1.1, px + 1.1, 0.5, pz + 1.1)); bag.add(T, box(px - 0.85, 0.5, pz - 0.85, px + 0.85, 2.7, pz + 0.85)); bag.add(T, box(px - 1.0, 2.7, pz - 1.0, px + 1.0, 3.0, pz + 1.0));
    col.rect([px - 1.1, pz - 1.1, px + 1.1, pz + 1.1], 0, 3.0);
    const H = 3.6, f = human({ pose: 'ease', h: H, drape: 'mantle', n: 6, mirror: s < 0, arms: { r: [[0.16, 0.64, 0.05], [0.2, 0.78, 0.16]] } });
    for (const g of [...f.stone, ...f.skin]) { g.rotateY(Math.PI / 2); g.translate(px, 3.0, pz); bag.add(CV, g); }
    // (the figure faces east, toward the piazza: its right hand at −z unless mirrored)
    const hz = pz + (s < 0 ? 0.2 * H : -0.2 * H), hx = px + 0.16 * H, hy = 3.0 + 0.78 * H;
    if (s > 0) for (const dz of [-0.05, 0.05]) bag.add('gilt_bronze', rod([hx, hy - 0.3, hz + dz], [hx + 0.05, hy + 0.35, hz + dz * 2], 0.04, 5));   // the keys
    else bag.add(CV, rod([hx, hy - 0.1, hz], [hx + 0.1, hy - 1.6, hz], 0.05, 5));                                                              // the sword, point down
  }
  return XE;
}
