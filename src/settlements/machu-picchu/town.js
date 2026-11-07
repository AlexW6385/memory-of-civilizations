// The houses of Machu Picchu in their kanchas (docs/settlements/machu-picchu.md §5).
import { RADIUS, TERRACE, houses, kanchaWalls, outside } from './layout.js';
import { ground } from './ground.js';
import { people } from './people.js';

const base = (id, elements) => ({ id, style: 'inca', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [2, 110], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 50) plans.push(base(`machu-picchu-houses-${i / 50}`, all.slice(i, i + 50).map((h) => {
    const [x0, z0, x1, z1] = h.rect, y = Math.min(ground.height(x0, z0), ground.height(x1, z0), ground.height(x0, z1), ground.height(x1, z1));
    return { t: 'inca_house', ...h, y };
  })));
  // the kanchas' walls, battered, of rough stones, each with its gateway
  const walls = kanchaWalls().map(({ a, b, y1, door, w = 0.35 }) => {
    const y0 = Math.min(ground.height(...a), ground.height(...b)) - 0.3;
    return { t: 'stone_block', a, b, w, y0, y1: y0 + 0.3 + y1, door };
  });
  // the people and their animals (style 'life'), their tools and looms (style 'inca')
  const P = people();
  plans.push({ ...base('machu-picchu-people', P.figures), style: 'life', center: [0, 0], near: 420 });
  plans.push(base('machu-picchu-gear', P.gear));
  // the cloud forest's tree ferns and bromeliads on the slopes below the terraces and round the peaks (§7.1)
  { const r = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(9031), P = [];
    for (let k = 0; k < 2600 && P.length < 700; k++) {
      const x = (r() * 2 - 1) * (RADIUS - 20), z = (r() * 2 - 1) * (RADIUS - 20), d = outside(x, z);
      if (Math.hypot(x, z) > RADIUS - 20 || d < TERRACE.w * TERRACE.n + 1.5 || d > TERRACE.w * TERRACE.n + 70) continue;
      const fern = r() < 0.45;
      P.push([fern ? 'fern' : 'bromeliad', x, z, ground.height(x, z) - (fern ? 0.1 : 0.03), fern ? 0.8 + r() * 0.5 : 0.8 + r() * 0.8, r() * 6.28, Math.floor(r() * 3)]);
    }
    plans.push(base('machu-picchu-cloud-forest', [{ t: 'inca_plants', plants: P }])); }
  for (let i = 0; i < walls.length; i += 120) plans.push(base(`machu-picchu-kancha-walls-${i / 120}`, walls.slice(i, i + 120)));
  return plans;
}
