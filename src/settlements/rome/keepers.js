// The keepers of the shops (docs/settlements/rome.md §4.17): the street's rows of tabernae are open to the street
// (nightlight.js leaves the doorway panels out of their near copies), and in each shop that has a counter in its door
// (wine and oil, hot food, the butcher's, the baker's) its keeper stands behind it, facing the street. The counters
// are found by building the row once into a recording bag (the shared builder places them by a seeded draw, so
// where they are is read from the geometry, not guessed); each keeper is a street-life figure built into a small
// plan of his own, shown within 30 m of its row (the street life's figures reach 170 m and would be drawn all
// day from afar; these are for the visitor who walks in).
// [inferred: that the keeper stood behind his counter; the dress and the numbers are ours.]

import { STYLES } from '../../core/build.js';
import '../../styles/roman/street.js';
import { rows, RADIUS } from './layout.js';
import { hashAt } from './nightlight.js';

const sink = new Proxy({}, { get: () => () => {} });
/** The counter tops of a row as the shared builder lays them: [{ x, z, n (outward [x, z]) }]. */
function counters(r) {
  const out = [], f = r.front, n = f === 'e' ? [1, 0] : f === 'w' ? [-1, 0] : f === 's' ? [0, 1] : [0, -1];
  const ctx = { bag: { add: (mat, g) => { if (mat !== 'marble_smooth' || !g?.attributes?.position) return; g.computeBoundingBox(); const b = g.boundingBox; if (b.max.y - b.min.y < 0.08 && Math.abs(b.min.y - 0.95) < 0.04) out.push({ x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, n }); }, addInstance() {} }, col: sink, lights: [], style: STYLES.roman, plan: { id: 'rome-keepers' } };
  STYLES.roman.elements.taberna_row({ t: 'taberna_row', ...r, storeys: r.front === 's' && r.seed % 3 === 0 ? 2 : undefined }, ctx);
  return out;
}
const CLOTH = ['cloth_brown', 'linen', 'cloth_ochre', 'cloth_grey', 'cloth_red'];
/** Small plans, one per row near the walk, each with the keepers of its shops. */
export function shopKeepers(maxRows = 12) {
  const dA = (r) => Math.hypot((r.rect[0] + r.rect[2]) / 2 - 0, (r.rect[1] + r.rect[3]) / 2 + 175);        // from the street before the Pantheon's forecourt, where the walk goes north
  const list = rows().filter((r) => r.front === 's' || Math.abs((r.rect[0] + r.rect[2]) / 2 - 175) < 14).sort((a, b) => dA(a) - dA(b)).slice(0, maxRows), plans = [];
  list.forEach((r, i) => {
    const els = counters(r).map((c) => {
      const h = hashAt(c.x, c.z, 41), at = [c.x - c.n[0] * 0.85, c.z - c.n[1] * 0.85];
      return { t: 'figure', at, y: 0, rot: Math.atan2(-c.n[0], -c.n[1]), seed: Math.floor(h * 1e9), skin: h < 0.7 ? 'skin_light' : 'skin_medium', dress: 'tunic', legs: 'bare', cloth: CLOTH[Math.floor(hashAt(c.z, c.x, 7) * CLOTH.length)], over: 'belt', hair: 'short', beard: hashAt(c.x, c.z, 5) < 0.4 ? 1 : 0, hat: 'none', pose: hashAt(c.x, c.z, 6) < 0.3 ? 'talk' : 'stand', arms: 'hang' };
    });
    if (!els.length) return;
    const center = [(r.rect[0] + r.rect[2]) / 2, (r.rect[1] + r.rect[3]) / 2];
    plans.push({ id: `rome-keepers-${i}`, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, near: 30, center, elements: els, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
  });
  return plans;
}
