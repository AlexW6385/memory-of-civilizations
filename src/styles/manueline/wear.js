// Wear and weathering on the Jerónimos' south front (docs/settlements/manueline-lisbon.md §14.4): rising damp and salt along the
// foot of the wall (the Tagus's damp air and the plaza's wet), and rain streaks below the string course where the water runs off the
// rope moulding. Thin boxes of the palette's own `plaster_damp` and `plaster_streak`, set 0.03-0.05 proud of the wall's face and
// embedded 0.03 in it, so that no face lies in the wall's plane. Every number is a function of position.
import { box } from '../../core/geom.js';

const h = (x, s) => { let k = Math.imul(Math.round(x * 8) ^ (s * 2654435761), 1274126177); k ^= k >>> 15; return (k >>> 0) / 4294967296; };

/** Along the wall's face z = z1 from x0 to x1, avoiding the buttresses at `bxs`, the portal at px (half-width pw) and the window piers. */
export function southWear(bag, { x0, x1, z1, y, px, bxs, pw = 6.9 }) {
  const free = (a, b) => !bxs.some((bx) => a < bx + 0.95 && b > bx - 0.95) && !(a < px + pw && b > px - pw);
  // the damp band: a ragged rise of 0.5 to 1.1 m along each stretch between buttresses
  const cuts = [x0 + 0.2, ...bxs.flatMap((bx) => [bx - 0.8, bx + 0.8]), x1 - 0.2].sort((a, b) => a - b);
  for (let i = 0; i + 1 < cuts.length; i += 2) {
    let a = cuts[i], b = cuts[i + 1];
    for (const [s, e] of [[a, Math.min(b, px - pw)], [Math.max(a, px + pw), b]]) {
      if (e - s < 1) continue;
      bag.add('plaster_damp', box(s, y, z1 - 0.03, e, y + 0.5, z1 + 0.03));
      for (let x = s + 0.3; x < e - 1.4; x += 1.6 + h(x, 1) * 1.8) { const w = 0.8 + h(x, 2) * 1.5; if (x + w < e) bag.add('plaster_damp', box(x, y + 0.5, z1 - 0.03, x + w, y + 0.62 + h(x, 3) * 0.55, z1 + 0.05)); }
    }
  }
  // the rain streaks under the string course at 6.6 m (its rope is 0.14 thick at z1 + 0.1)
  for (let x = x0 + 1.3; x < x1 - 1.3; x += 1.5 + h(x, 4) * 2.3) {
    const w = 0.22 + h(x, 5) * 0.28, len = 0.9 + h(x, 6) * 1.5;
    if (!free(x - 0.1, x + w + 0.1)) continue;
    bag.add('plaster_streak', box(x, y + 6.4 - len, z1 - 0.03, x + w, y + 6.4, z1 + 0.04));
  }
}
