// Wear on the Taj's stone (docs/settlements/mughal-agra.md §18): the dust of feet worn into the middle of the stairs and the plinth's paving, and the water's line
// on the channels' marble. Thin patches laid 5 mm over the surface (never coplanar, no collision), their width and place from a hash of their own position.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import '../../styles/mughal/index.js';

const hashAt = (a, b, s = 0) => {
  let h = (Math.round(a * 64) * 73856093) ^ (Math.round(b * 64) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};

/** agra_wear { kind: 'stairs' (rect, y0, y1, dir 'n', mat, dust) | 'path' (rect, y, mat) | 'waterline' (rects, y0, y1, mat) } */
function agraWear(el, { bag }) {
  if (el.kind === 'stairs') {
    // (the stair builder's treads: n = round(rise / 0.16), tread k's top at y0 + rise * (k+1)/n over z1 - len*(k+1)/n .. z1 - len*k/n, dir 'n')
    const [x0, z0, x1, z1] = el.rect, { y0, y1 } = el, len = z1 - z0, n = Math.max(1, Math.round((y1 - y0) / 0.16)), cx = (x0 + x1) / 2;
    for (let k = 0; k < n; k++) {
      const yy = y0 + (y1 - y0) * (k + 1) / n, zl = z1 - len * (k + 1) / n, zh = z1 - len * k / n, u = hashAt(cx, zl, 3), v = hashAt(cx, zl, 4);
      const w = (x1 - x0) * (0.3 + 0.18 * u), c = cx + (v - 0.5) * 0.9;
      bag.add(el.mat, box(c - w / 2, yy + 0.004, zl + 0.04 + 0.03 * v, c + w / 2, yy + 0.01, zh - 0.05 - 0.05 * u));
      // a second, narrower scuff toward the nosing, where the heel lands
      if (hashAt(cx, zl, 5) < 0.6) bag.add(el.dust ?? el.mat, box(c - w * 0.3, yy + 0.01, zh - 0.1 - 0.05 * u, c + w * 0.3, yy + 0.014, zh - 0.05 - 0.05 * u));
    }
  } else if (el.kind === 'path') {
    // a worn way across paving: dust in broken patches along the line of walking, each its own length and width
    const [x0, z0, x1, z1] = el.rect, y = el.y + 0.005, cx = (x0 + x1) / 2;
    for (let z = z1; z > z0 + 0.6;) {
      const u = hashAt(cx, z, 8), v = hashAt(cx, z, 9), L = 0.9 + 1.7 * u, w = (x1 - x0) * (0.5 + 0.45 * v), c = cx + (hashAt(cx, z, 10) - 0.5) * 0.7, za = Math.max(z0, z - L);
      bag.add(el.mat, box(c - w / 2, y, za, c + w / 2, y + 0.005, z));
      z = za - 0.25 - 0.6 * hashAt(cx, z, 11);
    }
  } else if (el.kind === 'waterline') {
    // the damp and green line on the marble kerb at the water's level: a band a hand high on the inside face of each coping
    for (const [x0, z0, x1, z1] of el.rects) bag.add(el.mat, box(x0, el.y0, z0, x1, el.y1, z1));
  }
}
STYLES.mughal.elements.agra_wear = agraWear;
export { agraWear };
