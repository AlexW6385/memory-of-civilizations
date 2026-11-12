// The dressing of Pit 1's entrance (docs/settlements/qin-xianyang.md §9b): the three ramps' walls shored with posts and boards
// like the trench they are, courses of the rammed earth showing above, a rope rail, lamps on the posts, a guard log along the edge;
// the doors in the east wall with their frames, folded-back plank leaves and thresholds; the gallery's east wall panelled and hung
// with black cloth; reed runners and tracked-in earth on the floor. All of it merged into the pit's bags: a handful of draws.
import { box, lathe, rod, addCloth, clothBox } from '../../core/geom.js';
import { rng } from '../../objects/kit.js';
import { PIT, RAMP, GALLERY, rampZ } from '../../settlements/qin-xianyang/layout.js';

const bz = (x0, y0, za, x1, y1, zb) => box(x0, y0, Math.min(za, zb), x1, y1, Math.max(za, zb));
const FL = PIT.floor, PT = FL + 4.3;

export function dressPit(bag, col) {
  const { x1, z0, z1, wall } = PIT, L = RAMP.len, yAt = (x) => FL * (1 - (x - x1) / L), r = rng(615);
  const gaps = RAMP.zs.map((_, i) => [rampZ(i) - RAMP.w / 2 - 0.2, rampZ(i) + RAMP.w / 2 + 0.2]);
  const xi = x1 - wall;                                                                    // the east wall's inner face
  RAMP.zs.forEach((_, i) => {
    const zc = rampZ(i), hw = RAMP.w / 2 + 0.2;
    // ── the door: frame posts and a lintel of red-lacquered timber on the gallery side, a valance of black cloth, the plank leaves
    // folded back against the reveals, a granite threshold, an iron-banded stay
    for (const s of [-1, 1]) {
      bag.add('timber_red', bz(xi - 0.42, FL + 0.02, zc + s * hw - (s > 0 ? 0.4 : 0), xi, -0.7, zc + s * hw + (s > 0 ? 0 : 0.4)));
      bag.add('planks_grey', bz(xi + 0.12, FL + 0.03, zc + s * (hw - 0.07) - (s > 0 ? 0 : -0.0), x1 - 0.12, FL + 3.2, zc + s * hw - (s > 0 ? 0.02 : -0.02)));
      for (const u of [0.55, 1.5, 2.6]) bag.add('iron', bz(xi + 0.12, FL + u, zc + s * (hw - 0.085), x1 - 0.12, FL + u + 0.09, zc + s * (hw - 0.06)));
      bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.07, 0.03], [0.001, 0.04]], 7).rotateZ(Math.PI / 2).translate(xi + 0.4, FL + 1.5, zc + s * (hw - 0.095)));   // the ring
    }
    bag.add('timber_red', bz(xi - 0.42, -1.3, zc - hw, xi, -0.7, zc + hw));
    bag.add('paint_ochre', bz(xi - 0.44, -0.75, zc - hw - 0.04, xi - 0.42, -0.7, zc + hw + 0.04));
    addCloth(bag, 'cloth_black', clothBox(xi - 0.5, -2.25, zc - hw + 0.2, xi - 0.47, -1.3, zc + hw - 0.2), -1.3);
    bag.add('granite_grey', bz(xi + 0.05, FL + 0.02, zc - hw, x1 - 0.05, FL + 0.045, zc + hw));
    // ── the ramp's walls: posts the whole height of the cut, boards over the lower part, the rammed courses above, a rope rail,
    // lamps on every second post, the guard log and a mat along the edge
    for (const s of [-1, 1]) {
      const zf = zc + s * RAMP.w / 2, zi = zf - s * 0.16;                                   // the wall's face and the posts' inner side
      const xa0 = x1 + 0.9, step = 2.2, n = Math.floor((L - 3.0) / step);
      // the courses of the earth: light bands of clay between the rammed layers, as long as the wall is high at that level
      for (let y = FL + 1.9; y < -0.3; y += 0.42) {
        const xe = x1 + L * (1 - y / FL) - 0.2;
        if (xe > x1 + 0.6) bag.add('mud_plaster', bz(x1 + 0.3, y, zf - s * 0.03, Math.min(xe, x1 + L - 0.3), y + 0.035, zf));
      }
      for (let k = 0; k <= n; k++) {
        const xa = xa0 + k * step, ya = yAt(xa), top = Math.min(0.28, 0.28);
        bag.add('timber', bz(xa - 0.09, ya, Math.min(zi, zf), xa + 0.09, top, Math.max(zi, zf)));
        if (k < n) {
          const xb = xa + step, yb = yAt(xb), h = Math.min(-0.2, yb + 1.9);
          // boards: a panel between two posts, the upper edge a straight line, the lower in the earth of the treads
          bag.add('planks_grey', bz(xa + 0.09, ya, zf - s * 0.075, xb - 0.09, h, zf));
          for (const u of [0.55, 1.15]) { const yy = Math.min(h - 0.1, yb + u + 0.05); if (yy > ya + 0.3) bag.add('timber', bz(xa + 0.09, yy - 0.04, zf - s * 0.1, xb - 0.09, yy + 0.04, zf - s * 0.075)); }   // battens
        }
        // the rope rail: a rope on each post, 0.95 m over the tread, continued between by the rod below
        if (k < n) bag.add('rope_fibre', rod([xa, yAt(xa) + 0.98, (zi + zf) / 2 - s * 0.01 - s * 0.05], [xa + step, yAt(xa + step) + 0.98, (zi + zf) / 2 - s * 0.01 - s * 0.05], 0.022, 4));
        if (k % 2 === 1) {
          const ly = Math.min(ya + 2.5, -0.3), lz = zi - s * 0.1;
          bag.add('iron', bz(xa - 0.015, ly - 0.02, lz - 0.015, xa + 0.015, ly + 0.0, zf - s * 0.0 - 0.0 + (s > 0 ? -0.02 : 0.02)));
          bag.add('bronze', lathe([[0.001, -0.14], [0.11, -0.09], [0.13, 0], [0.001, 0.01]], 8, null, xa, ly, lz));
          bag.add('flame', lathe([[0.001, 0.0], [0.035, 0.05], [0.001, 0.2]], 6, null, xa, ly + 0.01, lz));
        }
      }
      // the edge: a squared guard log laid on short blocks along the top of the wall (against falls and the carts' wheels), a reed mat spread behind it
      const zl = zf + s * 0.55;
      bag.add('log_pine', rod([x1 + 0.2, 0.2, zl], [x1 + L - 0.4, 0.2, zl], 0.13, 6));
      for (let x = x1 + 1.2; x < x1 + L - 1; x += 3.0) bag.add('timber', bz(x - 0.1, 0, zl - 0.12, x + 0.1, 0.08, zl + 0.12));
      bag.add('reed_mat', bz(x1 + 0.4, 0.05, (zl + s * 0.2), x1 + L - 1.4, 0.075, (zl + s * 1.1)));
    }
    // ── what lies on the treads: spilt earth at the sides, a dropped basket, a broken pole, tracked-in earth at the door
    for (let k = 0; k < 5; k++) {
      const x = x1 + 2.5 + r() * (L - 6), y = yAt(x), s = r() < 0.5 ? -1 : 1, w = 0.25 + r() * 0.3;
      bag.add('earth_wall', bz(x, y + 0.04, zc + s * (1.55 + r() * 0.5), x + w * 1.8, y + 0.1 + r() * 0.04, zc + s * (1.55 + r() * 0.5) + s * w));
    }
    { const x = x1 + 6 + r() * 4, y = yAt(x); bag.add('wicker', lathe([[0.2, 0], [0.34, 0.2], [0.3, 0.3], [0.001, 0.3]], 8).rotateZ(1.2).translate(x, y + 0.22, zc + (i % 2 ? 1.4 : -1.4))); }
    for (let k = 0; k < 4; k++) { const x = xi + 0.4 - k * 0.7 - r() * 0.3, zz = zc + (r() - 0.5) * 4, w = 0.3 + r() * 0.4; bag.add('earth_wall', bz(x - w, FL + 0.022, zz - w * 0.7, x + w, FL + 0.06 + r() * 0.03, zz + w * 0.7)); }
  });
  // ── the gallery's east wall, between the doors: a plank dado with posts, black hangings above, a sleeper along the top
  let za = z0 + wall;
  const segs = []; for (const [ga, gb] of gaps) { segs.push([za, ga]); za = gb; } segs.push([za, z1 - wall]);
  for (const [a, b] of segs) {
    bag.add('planks_grey', bz(xi - 0.07, FL + 0.02, a + 0.1, xi, FL + 1.5, b - 0.1));
    bag.add('timber', bz(xi - 0.09, FL + 1.5, a + 0.1, xi, FL + 1.58, b - 0.1));
    for (let z = a + 0.1; z <= b - 0.1 + 0.01; z += (b - a - 0.2) / Math.max(1, Math.round((b - a - 0.2) / 2.6))) bag.add('timber', bz(xi - 0.2, FL + 0.02, z - 0.1, xi, PT, z + 0.1));
    if (b - a > 6) for (const f of [0.22, 0.78]) { const zm = a + (b - a) * f; addCloth(bag, 'cloth_black', clothBox(xi - 0.1, FL + 2.0, zm - 0.9, xi - 0.07, FL + 3.8, zm + 0.9), FL + 3.8); bag.add('cloth_red', bz(xi - 0.105, FL + 3.8, zm - 0.95, xi - 0.065, FL + 3.9, zm + 0.95)); }
  }
  bag.add('timber', bz(xi - 0.12, PT - 0.15, z0 + wall, xi, PT, z1 - wall));
  // ── the floor: a runner of reed mats down each aisle from the door to the corridor's mouth, laid end to end
  for (let i = 0; i < RAMP.zs.length; i++) {
    const zc = rampZ(i);
    for (let x = xi - 0.2; x > GALLERY[0] + 1.0; x -= 1.9) bag.add('reed_mat', bz(x - 1.82, FL + 0.022, zc - 0.75 + (r() - 0.5) * 0.06, x, FL + 0.034, zc + 0.75));
  }
  void col;
}
