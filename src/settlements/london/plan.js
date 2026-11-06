// Westminster about 1870 (docs/settlements/london.md §2–§4).
import { RADIUS, GROUND, PALACE, CLOCK, VICTORIA, ABBEY, BRIDGE, RIVER, bank } from './layout.js';

const g = GROUND;
export const westminster = {
  id: 'london-westminster',
  name: { en: 'The Palace of Westminster', zh: '威斯敏斯特宫' },
  era: { en: 'Victorian London, about 1870', zh: '维多利亚时代伦敦，约1870年' },
  style: 'victorian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -180], facing: 'e' },
  bounds: [ABBEY[0] - 2, -200, PALACE[2] + 2, VICTORIA[1] + 14],
  view: [PALACE[0], -170, PALACE[2] + 4, -100],
  bakeTop: 100,
  elements: [
    // the river front: 270 m, pavilions at its ends and in its centre (Barry's symmetry on the terrace)
    { t: 'river_front', rect: [PALACE[2] - 24, PALACE[1], PALACE[2], PALACE[3]], h: 22, face: 'e', y: g, pavilions: [[0, 17.7], [128.4, 141.6], [252.3, 270]] },
    { t: 'river_front', rect: [PALACE[0], PALACE[1] + 20, PALACE[0] + 26, PALACE[3] - 10], h: 20, face: 'w', y: g },
    { t: 'river_front', rect: [PALACE[0] + 26, -20, PALACE[2] - 24, 10], h: 20, face: 'n', y: g },
    { t: 'great_hall', rect: [PALACE[0] - 30, -125, PALACE[0] - 6, -52], h: 28, y: g },
    { t: 'gothic_tower', c: CLOCK, s: 12, h: 96, clock: true, y: g },
    { t: 'gothic_tower', c: VICTORIA, s: 22, h: 98, y: g },
    { t: 'gothic_tower', c: [76, -5], s: 10, h: 91, spire: true, y: g + 20 },
    // Westminster Abbey: the high nave and its flyers, the transepts, the lantern, Hawksmoor's towers, Henry VII's chapel
    { t: 'abbey', rect: ABBEY, y: g },
  ],
  rooms: [{ id: 'parliament square', rect: [-60, -215, 40, -150], y: g, kind: 'open' }],
  walks: [Object.assign([[0, -180], [60, -170]], { y0: g })],
};
// Westminster Bridge (1862): seven iron arches on granite piers, Barry's Gothic detail
export const bridge = {
  id: 'london-bridge', style: 'victorian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [RIVER.x0, BRIDGE.z], facing: 'e' }, bounds: [RIVER.x0 - 16, -RADIUS, RIVER.x1 + 16, RADIUS], rooms: [],
  elements: [
    // the embankments: the Victoria Embankment north of the bridge on the Westminster side, the Albert Embankment
    // (1866–69) along the Lambeth side opposite the palace; granite walls, dolphin lamps
    ...embankments(),
    { t: 'iron_bridge', x0: RIVER.x0 - 10, x1: RIVER.x1 + 12, z: BRIDGE.z, w: BRIDGE.w, y: GROUND + 0.4, water: RIVER.level, bed: RIVER.bed, spans: 7 }],
};
function embankments() {
  const inside = (x, z) => Math.hypot(x, z) < RADIUS - 64, out = [];
  const run = (z0, z1, k, side) => { const path = []; for (let z = z0; z <= z1; z += 3) { const x = bank(z)[k] + (k ? 0.6 : -0.6); if (inside(x, z)) path.push([x, z]); } if (path.length > 1) out.push({ t: 'embankment', path, y: GROUND, bed: RIVER.bed, side, lamps: 18 }); };
  run(-RADIUS, BRIDGE.z - BRIDGE.w / 2 - 1, 0, 1);
  run(BRIDGE.z + BRIDGE.w / 2 + 1, RADIUS, 1, -1);
  return out;
}
export const river = {
  id: 'london-thames', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'e' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [RIVER.x0 - 10, -(RADIUS - 60), RIVER.x1 + 12, RADIUS - 60], y: RIVER.level, cell: 2, inside: (x, z) => x > RIVER.x0 + 6 * Math.sin(z / 90) + 1 && x < RIVER.x1 + 8 * Math.sin(z / 110) - 1 && Math.hypot(x, z) < RADIUS - 60 }],
};
export default westminster;
