// Djenné — street furniture of the visitor's walk (docs/settlements/djenne.md §20.1): the wells. Registered on the sahel style from here.
import '../../styles/sahel/index.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { beamTris } from '../../styles/ming/index.js';
import { fromTriangles } from '../../core/geom.js';

/** A number in [0, 1) from a position alone (no counters, no Math.random). */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * dj_well: { at: [x, z], y?, rot? } — a hand-dug well with a banco curb, the plastered rim worn smooth, two forked posts and a pole across
 * with the rope and a leather bucket hanging, a clay trough beside it for the animals, a few jars set by the curb. Hand-made: no two alike.
 */
function well({ at, y = 0, rot = 0 }, { bag, col }) {
  const [x, z] = at, h = (s) => hashAt(x, z, s), ca = Math.cos(rot), sa = Math.sin(rot);
  const P = (u, v) => [x + ca * u - sa * v, z + sa * u + ca * v];
  const ch = 0.52 + 0.08 * h(1), ro = 0.78 + 0.08 * h(2), ri = 0.46;
  bag.add('banco_smooth', lathe([[ri, ch], [ro - 0.14, ch + 0.04], [ro - 0.04, ch], [ro, ch - 0.08], [ro + 0.12, 0], [ri, 0.02]], 14, null, x, y, z));
  bag.add('wood_dark', lathe([[0.001, ch - 0.02], [ri - 0.01, ch - 0.02], [ri - 0.04, ch - 0.5], [0.001, ch - 0.5]], 10, null, x, y, z));    // the dark of the shaft
  col.circle(x, z, ro + 0.1, y, y + ch + 0.05);
  // two forked posts and the pole across (the windlass-less draw: a rope over the pole)
  const pt = [];
  for (const s of [-1, 1]) { const [px, pz] = P(s * (ro + 0.12), 0); beamTris(pt, [px, y, pz], [px, y + 1.75, pz], 0.05, 0.1); }
  const [ax, az] = P(-(ro + 0.2), 0), [bx, bz] = P(ro + 0.2, 0);
  beamTris(pt, [ax, y + 1.72, az], [bx, y + 1.74 + 0.03 * h(3), bz], 0.045, 0.09);
  bag.add('timber', fromTriangles(pt));
  const [rx, rz] = P(0.1, 0);
  bag.add('hide_brown', lathe([[0.001, 0], [0.1, 0.01], [0.13, 0.22], [0.12, 0.24], [0.001, 0.12]], 8, null, rx, y + ch + 0.04, rz));   // the leather bucket on the curb
  const rope = []; beamTris(rope, [rx, y + ch + 0.28, rz], [rx, y + 1.72, rz], 0.012, 0.024); bag.add('hide_tan', fromTriangles(rope));
  // the trough (a hollowed log or a clay tub) and jars
  const [tx, tz] = P(1.5 + 0.2 * h(4), 0.5);
  bag.add('terracotta', lathe([[0.001, 0], [0.34, 0.02], [0.4, 0.2], [0.36, 0.3], [0.001, 0.14]], 10, null, tx, y, tz)); col.circle(tx, tz, 0.4, y, y + 0.3);
  for (let i = 0; i < 2 + Math.floor(2 * h(5)); i++) { const [jx, jz] = P(-0.7 - i * 0.42, 0.95 + 0.14 * h(10 + i)), s = 1.1 + 0.3 * h(20 + i);
    bag.add(i % 2 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.14 * s, 0.03 * s], [0.24 * s, 0.22 * s], [0.2 * s, 0.4 * s], [0.12 * s, 0.5 * s], [0.14 * s, 0.56 * s], [0.001, 0.54 * s]], 9, null, jx, y, jz)); }
  void box;
}
STYLES.sahel.elements.dj_well = well;
