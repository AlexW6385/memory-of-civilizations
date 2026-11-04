// The houses, storehouses, pits and canoes (docs/settlements/maori.md §5).
import { RADIUS, village } from './layout.js';
export async function town() {
  const v = village(), E = [];
  for (const h of v.houses.slice(1)) E.push({ t: 'whare', carved: false, ...h });
  for (const p of v.pataka.slice(1)) E.push({ t: 'pataka', ...p });
  for (const p of v.pits) E.push({ t: 'rua', ...p });
  for (const w of v.waka) E.push({ t: 'waka', ...w });
  return [{ id: 'maori-kainga', style: 'maori', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 160], facing: 'n' } }];
}
