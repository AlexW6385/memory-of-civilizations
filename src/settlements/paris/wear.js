// What use has done to Paris's stone (docs/settlements/paris.md §6e): the palace gate's passage, where the carts of the palace and the
// street come through: two wheel-ruts and the hollow the feet and hooves have made between them, in the gate's paving. Thin boxes of
// the one material the plan already holds (`flagstone`), a hair over the ground.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';

/** { t: 'paris_wear', at: [x, z] (the passage's middle), y (ground), along: 'x', len, w }: ruts and a hollow along a passage running in x. */
function parisWear(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, y = el.y + 0.004, h = el.len / 2, w = el.w / 2;
  for (const s of [-1, 1]) bag.add('flagstone', box(x - h, y, z + s * w * 0.62 - 0.14, x + h, y + 0.012, z + s * w * 0.62 + 0.14));
  bag.add('flagstone', box(x - h * 0.92, y, z - w * 0.26, x + h * 0.92, y + 0.016, z + w * 0.26));
}
STYLES.gothic.elements.paris_wear = parisWear;

/**
 * The parvis of Notre-Dame, worn (docs/settlements/paris.md §6g): the forecourt paved with rough cobbles, a flagged way along the
 * axis from the street to the central portal and an apron of flags before each portal, the thresholds of the three doors as slabs
 * of the hard stone, and the mud, straw and dung where the market's feet and carts go. Thin layers of materials the rues' tiles already hold.
 * { t: 'paris_parvis', rect: [x0, z0, x1, z1] (the forecourt), y, face (x of the west front), doors: [z...], simple? }
 */
function parisParvis(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, F = el.face;
  let s = 91; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  bag.add('pebbles', box(x0, y + 0.012, z0, x1, y + 0.034, z1));
  bag.add('flagstone', box(x0, y + 0.034, -1.5, F - 6.2, y + 0.046, 1.5));                      // the way along the axis
  for (const dz of el.doors) bag.add('flagstone', box(F - 6.2, y + 0.034, dz - 2.6, F - 1.6, y + 0.05, dz + 2.6));   // the apron before a portal
  if (el.simple) return;
  for (const dz of el.doors) {
    bag.add('limestone', box(F - 1.6, y + 0.0, dz - 1.9, F + 2.4, y + 0.07, dz + 1.9));         // the threshold: the hard stone's slab …
    bag.add('flagstone', box(F - 1.0, y + 0.07, dz - 0.7, F + 1.8, y + 0.078, dz + 0.7));       // … its middle hollowed and worn pale by feet
    for (const [a, b, w] of [[F - 3.6, -0.5, 0.9], [F - 2.6, 0.6, 0.8], [F - 4.4, 0.3, 0.7]]) bag.add('plaster_damp', box(F - 6.2 + (a - (F - 6.2)), y + 0.05, dz + b - w / 2, F - 6.2 + (a - (F - 6.2)) + 0.9, y + 0.053, dz + b + w / 2));   // damp in the hollows of the apron
  }
  for (let k = 0; k < 60; k++) {                                                                  // straw, dung and silt where the market's feet go
    const x = x0 + 1 + r() * (x1 - x0 - 2), z = z0 + 1 + r() * (z1 - z0 - 2), t = r();
    if (Math.abs(z) < 2 || el.doors.some((d) => Math.abs(z - d) < 3.4 && x > F - 6.4)) continue;
    if (t < 0.45) for (let i = 0; i < 4; i++) bag.add('thatch', box(x + r() * 0.5, y + 0.034, z + r() * 0.3, x + 0.2 + r() * 0.7, y + 0.045, z + 0.1 + r() * 0.2));
    else if (t < 0.8) bag.add('silt', box(x, y + 0.034, z, x + 0.4 + r() * 0.6, y + 0.05, z + 0.4 + r() * 0.5));
    else bag.add('plaster_damp', box(x, y + 0.034, z, x + 1.0 + r() * 1.2, y + 0.04, z + 0.7 + r() * 0.9));
  }
}
STYLES.gothic.elements.paris_parvis = parisParvis;

/** { t: 'paris_flags', y, slabs: [[material, x0, z0, x1, z1, ya, yb], ...] }: worn flags and thresholds as thin slabs (heights above y), of the materials the plan already holds. */
function parisFlags(el, { bag }) { for (const [m, x0, z0, x1, z1, ya, yb] of el.slabs) bag.add(m, box(x0, el.y + ya, z0, x1, el.y + yb, z1)); }
STYLES.gothic.elements.paris_flags = parisFlags;
