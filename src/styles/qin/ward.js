// The ward gates (docs/settlements/qin-xianyang.md §9d): the lanes of a Qin town ran between wards (li) closed by a gate under a keeper;
// here a gate of two red posts on stone bases, a black lintel and a small hipped roof of tile spans each lane's mouth, with a notice
// board and a bench for the keeper. The gap between the posts is 3.3 m: the lane stays open to the walker.
import { box, rod, quad, fromTriangles } from '../../core/geom.js';

/** qin_ward_gate: { at [x, z] } — across a lane running along z, the posts east and west of the lane's axis. */
export function qinWardGate(el, { bag, col }) {
  const [x, z] = el.at, hw = 1.85, H = 3.4;
  for (const s of [-1, 1]) {
    bag.add('granite_grey', box(x + s * hw - 0.3, 0, z - 0.32, x + s * hw + 0.3, 0.25, z + 0.32));
    bag.add('timber_red', box(x + s * hw - 0.18, 0.25, z - 0.18, x + s * hw + 0.18, H, z + 0.18));
    col.rect([x + s * hw - 0.3, z - 0.32, x + s * hw + 0.3, z + 0.32], 0, H);
  }
  bag.add('lacquer_black', box(x - hw - 0.35, H - 0.2, z - 0.28, x + hw + 0.35, H + 0.2, z + 0.28));
  // the roof: a small hip, eave 2.7 m wide each way of the axis, 1.0 m each way along it, 0.9 m of rise
  const A = hw + 0.9, B = 1.0, y0 = H + 0.2, yr = y0 + 0.9, T = [], r0 = A - B;
  const sheet = (a, b, c, d) => { quad(T, a, b, c, d); quad(T, d, c, b, a); };
  sheet([x - A, y0, z - B], [x + A, y0, z - B], [x + r0, yr, z], [x - r0, yr, z]);
  sheet([x + A, y0, z + B], [x - A, y0, z + B], [x - r0, yr, z], [x + r0, yr, z]);
  for (const s of [-1, 1]) { const t = [x + s * A, y0, z - B, x + s * A, y0, z + B, x + s * r0, yr, z]; T.push(...t, t[0], t[1], t[2], t[6], t[7], t[8], t[3], t[4], t[5]); }
  bag.add('tile_dark', fromTriangles(T));
  bag.add('tile_dark', box(x - r0, yr - 0.04, z - 0.12, x + r0, yr + 0.2, z + 0.12));
  bag.add('timber_red', box(x - A, y0 - 0.2, z - B - 0.05, x + A, y0, z - B)); bag.add('timber_red', box(x - A, y0 - 0.2, z + B, x + A, y0, z + B + 0.05));
  // the notice board on the east post's inner face, a bench for the keeper against the west post's
  bag.add('planks_grey', box(x + hw - 0.24, 1.2, z - 0.4, x + hw - 0.18, 2.3, z + 0.4)); bag.add('paint_white', box(x + hw - 0.26, 1.4, z - 0.3, x + hw - 0.24, 2.1, z + 0.3));
  bag.add('timber', box(x - hw + 0.18, 0.4, z + 0.5, x - hw + 0.55, 0.48, z + 1.9));
  for (const dz of [0.6, 1.8]) bag.add('timber', rod([x - hw + 0.36, 0, z + dz], [x - hw + 0.36, 0.4, z + dz], 0.04, 5));
}
