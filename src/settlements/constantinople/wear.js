// Wear where feet went at Hagia Sophia's south door (docs/settlements/constantinople.md §17.4): the dust of the faithful in broken patches along the way from
// the court to the door, a darker hollow at the threshold, a sill of marble. Thin patches laid 5 mm over the paving (no collision), their length, width and
// place from a hash of their own position (no counters, no Math.random).
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import '../../styles/roman/town.js';

const hashAt = (a, b, s = 0) => { let h = (Math.round(a * 64) * 73856093) ^ (Math.round(b * 64) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

/** cn_wear { at: [x, z] (the door's middle on the wall's outer face), y, w (door width), len (the way's length out into the court) } */
function wear({ at, y = 0, w = 3.2, len = 22 }, { bag }) {
  const [x, z] = at, Y = y + 0.005;
  // the way: patches of dust (a greyed travertine), widest at the door where all come together, narrowing and breaking up toward the court
  for (let d = 0.9; d < len;) {
    const u = hashAt(x, z + d, 1), v = hashAt(x, z + d, 2), t = d / len, L = 0.5 + 1.1 * u, ww = (w * 0.6) * (1 - 0.6 * t) * (0.5 + 0.5 * v), c = x + (hashAt(x, z + d, 3) - 0.5) * 1.1 * (0.4 + t);
    bag.add('plaster_grey', box(c - ww / 2, Y, z + d, c + ww / 2, Y + 0.004, z + Math.min(len, d + L)));
    d += L + 0.2 + 0.9 * hashAt(x, z + d, 4) * (0.3 + t);
  }
  // the threshold: a sill of smooth marble worn into a hollow in its middle (a darker, lower-looking pad), 6 cm proud of the paving; no step the walker could catch on
  bag.add('marble_smooth', box(x - w / 2 - 0.35, y, z + 0.32, x + w / 2 + 0.35, y + 0.05, z + 1.05));
  bag.add('plaster_grey', box(x - w * 0.3, y + 0.05, z + 0.5, x + w * 0.3 + 0.12, y + 0.054, z + 0.95));
}
STYLES.roman.elements.cn_wear = wear;
