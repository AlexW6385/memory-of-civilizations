// Stonehenge about 2500 BC — wear on what is used (docs/settlements/stonehenge.md §15): in the houses one can enter, the floor trodden dark in a path from the door
// to the hearth, the ash spread about the hearth's kerb, the soot of the smoke that leaks out under the lintel and up the face of the wall over the doorway.
// Added from here to the style's `neolithic_house` (the style file stays as it was), in materials the plan already holds (no new draw); pure functions of the
// house's own numbers. Nothing is written anywhere: no script is known in Britain at 2500 BC (§15).
import '../../styles/neolithic/index.js';
import './nightlight.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';

/** A box in the house's frame (u across, v toward the door, y up from the floor), as the style's own `obox`. */
function obox(fr, u0, u1, y0, y1, v0, v1) {
  const g = box(u0, y0, v0, u1, y1, v1), p = g.attributes.position.array, n = g.attributes.normal.array;
  for (let i = 0; i < p.length; i += 3) {
    const u = p[i], v = p[i + 2];
    p[i] = fr.x + u * fr.c - v * fr.s; p[i + 1] += fr.y; p[i + 2] = fr.z + u * fr.s + v * fr.c;
    const nu = n[i], nv = n[i + 2]; n[i] = nu * fr.c - nv * fr.s; n[i + 2] = nu * fr.s + nv * fr.c;
  }
  return g;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.neolithic.elements.neolithic_house;
  STYLES.neolithic.elements.neolithic_house = function worn(el, ctx) {
    const r = base.call(this, el, ctx);
    if (!ctx?.bag || !el.open) return r;
    const { bag } = ctx, s = el.s ?? 5, hw = s / 2, th = 0.16, a = el.yaw ?? 0, fr = { x: el.c[0], z: el.c[1], y: el.y ?? 0, c: Math.cos(a), s: Math.sin(a) };
    const doorU = (rng(el.seed || 1)() - 0.5) * 0.8 * 0.7, j = (hashAt(el.c[0], el.c[1], 9) - 0.5) * 0.14;
    // the floor: the path from the doorway to the hearth trodden dark and a little hollow-looking (a thin darker skin of trodden clay over the chalk), uneven at its edges
    bag.add('plaster_damp', obox(fr, doorU - 0.62 + j, doorU + 0.55 + j, 0.002, 0.007, 1.08, hw - 0.05));
    bag.add('plaster_damp', obox(fr, doorU - 0.4 + j * 0.5, doorU + 0.38 + j * 0.5, 0.002, 0.007, hw - 0.5, hw + 0.38));                 // across the sill, into the yard
    // the ash raked out about the hearth's kerb in a ragged ring, and a drift of it toward the door
    bag.add('pottery_dark', lathe([[1.0, 0.003], [1.0, 0.006], [0.64, 0.006], [0.64, 0.003]], 18, (t, i) => 0.92 + 0.12 * hashAt(i, el.seed % 97, 3), fr.x + 0.1 * fr.s, fr.y, fr.z - 0.1 * fr.c));
    // the smoke that leaks out under the lintel: a tongue of soot up the daub over the doorway on the outside face, and a smudge on each jamb's head
    const vw = hw + th, up = 2.12, wob = (hashAt(el.c[0], el.c[1], 4) - 0.5) * 0.12;
    bag.add('pottery_dark', obox(fr, doorU - 0.62 + wob, doorU + 0.62 + wob, up, up + 0.06, vw + 0.004, vw + 0.012));
    bag.add('pottery_dark', obox(fr, doorU - 0.32 + wob * 1.5, doorU + 0.28 + wob * 1.5, up + 0.06, up + 0.24, vw + 0.004, vw + 0.012));
    bag.add('pottery_dark', obox(fr, doorU - 0.12 + wob * 2.5, doorU + 0.1 + wob * 2.5, up + 0.24, up + 0.34, vw + 0.004, vw + 0.012));
    return r;
  };
}
registerWear();
