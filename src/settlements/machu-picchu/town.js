// The houses of Machu Picchu in their kanchas (docs/settlements/machu-picchu.md §5).
import { RADIUS, houses, kanchaWalls } from './layout.js';
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
  for (let i = 0; i < walls.length; i += 120) plans.push(base(`machu-picchu-kancha-walls-${i / 120}`, walls.slice(i, i + 120)));
  return plans;
}
