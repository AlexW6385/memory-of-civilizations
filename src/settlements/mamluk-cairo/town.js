import { lodTiles } from '../lod.js';
// The city's houses (docs/settlements/mamluk-cairo.md §5): mud-brick and stone shells, their street fronts
// dressed in the Cairene manner — mashrabiyas, door frames and benches, wind catchers (style mamluk) —
// and sabil-kuttabs on three street corners in place of a house.
import { RADIUS, lots, SABILS } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-37, -30], facing: 's' } });
const dist = (l, [x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
export async function town() {
  const all = lots(), plans = [];
  // the corner lot nearest each sabil's place becomes the sabil-kuttab, its corner the one nearest the crossing
  const taken = new Map();
  for (const p of SABILS) { const l = all.filter((q) => !taken.has(q)).sort((a, b) => dist(a, p) - dist(b, p))[0]; taken.set(l, p); }
  const houses = all.filter((l) => !taken.has(l));
  for (let i = 0; i < houses.length; i += 160) plans.push(base(`mamluk-cairo-houses-${i / 160}`, houses.slice(i, i + 160).map((l) => ({ t: 'house_egypt', ...l }))));
  const sabils = [...taken].map(([l, [x, z]]) => {
    const [x0, z0, x1, z1] = l.rect, sx = Math.abs(x - x1) < Math.abs(x - x0) ? 1 : -1, sz = Math.abs(z - z1) < Math.abs(z - z0) ? 1 : -1;
    const w = Math.min(8, x1 - x0), d = Math.min(8, z1 - z0), r = [sx > 0 ? x1 - w : x0, sz > 0 ? z1 - d : z0, sx > 0 ? x1 : x0 + w, sz > 0 ? z1 : z0 + d];
    return { t: 'sabil_kuttab', rect: r, y: l.y, corner: [sx, sz] };
  });
  plans.push(...lodTiles('mamluk-cairo-fronts', 'mamluk', houses.map((l) => ({ t: 'cairo_front', ...l })), { R: RADIUS }));
  plans.push({ ...base('mamluk-cairo-sabils', sabils), style: 'mamluk' });
  return plans;
}
