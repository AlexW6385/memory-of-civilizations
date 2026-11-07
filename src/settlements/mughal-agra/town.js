// Taj Ganj and the riverside (docs/settlements/mughal-agra.md §6): the town's houses with their balconies.
import { RADIUS, RIVER_Z, houses, KATRAS, HAVELI_OPEN } from './layout.js';
import { lifePlan } from './life.js';
import { ground, LEVEL } from './ground.js';
const base = (id, elements) => ({ id, style: 'mughal', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 245], facing: 'n' } });
export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`mughal-agra-houses-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'haveli', ...h }))));
  // the caravanserais and the open house (docs/settlements/mughal-agra.md §11)
  for (const k of KATRAS) { const [x0, z0, x1, z1] = k.rect; plans.push({ ...base(`mughal-agra-katra-${k.id}`, [{ t: 'katra', rect: k.rect, gate: k.gate, lit: 2 }]), bounds: [x0 - 6, z0 - 2, x1 + 6, z1 + 2], rooms: [{ id: 'sarai court', rect: [x0 + 1.6, z0 + 7.5, x1 - 1.6, z1 - 7.5], y: 0, kind: 'open' }] }); }
  { const [x0, z0, x1, z1] = HAVELI_OPEN; plans.push({ ...base('mughal-agra-haveli-open', [{ t: 'haveli_open', rect: HAVELI_OPEN, entry: 'w' }]), bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2], rooms: [{ id: 'dalan', rect: [x0 + 3.4, z0 + 0.55, x1 - 3.8, z0 + 4.15], y: 0.45, kind: 'hall' }, { id: 'house court', rect: [x0 + 3.4, z0 + 4.6, x1 - 3.8, z1 - 3.4], y: 0, kind: 'open' }] }); }
  // the Yamuna's water below the terrace, out to where its bed comes up by the disc's edge
  plans.push({ ...base('mughal-agra-yamuna', [{ t: 'water_cells', rect: [-RADIUS, -RADIUS, RADIUS, 0], y: LEVEL.water, cell: 2, inside: (x, z) => z < RIVER_Z + 8 && ground.height(x, z) < LEVEL.water }]), style: 'ming' });
  return [...plans, lifePlan()];
}
