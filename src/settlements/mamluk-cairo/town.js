import { lodTiles } from '../lod.js';
// The city's houses (docs/settlements/mamluk-cairo.md §5): Cairene town houses (house_mamluk, style
// vernacular) — and sabil-kuttabs on three street corners in place of a house.
import { RADIUS, lots, SABILS } from './layout.js';
const base = (id, elements) => ({ id, style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-37, -30], facing: 's' } });
const dist = (l, [x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z);
export async function town() {
  const all = lots(), plans = [];
  // the corner lot nearest each sabil's place becomes the sabil-kuttab, its corner the one nearest the crossing
  const taken = new Map();
  for (const p of SABILS) { const l = all.filter((q) => !taken.has(q)).sort((a, b) => dist(a, p) - dist(b, p))[0]; taken.set(l, p); }
  const houses = all.filter((l) => !taken.has(l));
  // the houses (house_mamluk, style vernacular: stone storey, corbelled plastered storeys, mashrabiyas,
  // the bent entrance, malqafs), in 100 m tiles, near and far
  plans.push(...lodTiles('mamluk-cairo-houses', 'vernacular', houses.map((l) => ({ t: 'house_mamluk', ...l })), { R: RADIUS, entrance: { at: [-37, -30], facing: 's' } }));
  const sabils = [...taken].map(([l, [x, z]]) => {
    const [x0, z0, x1, z1] = l.rect, sx = Math.abs(x - x1) < Math.abs(x - x0) ? 1 : -1, sz = Math.abs(z - z1) < Math.abs(z - z0) ? 1 : -1;
    const w = Math.min(8, x1 - x0), d = Math.min(8, z1 - z0), r = [sx > 0 ? x1 - w : x0, sz > 0 ? z1 - d : z0, sx > 0 ? x1 : x0 + w, sz > 0 ? z1 : z0 + d];
    return { t: 'sabil_kuttab', rect: r, y: l.y, corner: [sx, sz] };
  });
  plans.push({ ...base('mamluk-cairo-sabils', sabils), style: 'mamluk' });
  return plans;
}
