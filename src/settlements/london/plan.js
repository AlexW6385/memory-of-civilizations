// Westminster about 1870 (docs/settlements/london.md §2–§4).
import { RADIUS, GROUND, PALACE, CLOCK, VICTORIA, ABBEY, BRIDGE, RIVER, HALL, PORCH, STEPHEN, LOBBY, bank } from './layout.js';

const g = GROUND, L = g + 2.4, P = g + 4.4;     // the porch at the landing of the hall's steps; the principal floor
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
    // the western ranges, broken by St Stephen's Hall with a court either side of it
    { t: 'river_front', rect: [PALACE[0], PALACE[1] + 20, PALACE[0] + 16, -58], h: 20, face: 'w', y: g },
    { t: 'river_front', rect: [PALACE[0], -34, PALACE[0] + 16, PALACE[3] - 10], h: 20, face: 'w', y: g },
    // Westminster Hall: Richard II's hall and Herland's hammerbeam roof, entered by the north door from New Palace Yard
    { t: 'westminster_hall', rect: HALL, y: g, h: 14, ridge: 28 },
    { t: 'gothic_tower', c: CLOCK, s: 12, h: 96, clock: true, y: g },
    { t: 'gothic_tower', c: VICTORIA, s: 22, h: 98, y: g },
    // the principal floor (§1.5): St Stephen's Porch and Hall, the Central Lobby under the Central Tower, the Commons to
    // the north and the Lords to the south along the axis
    { t: 'st_stephens', porch: PORCH, hall: STEPHEN, y: g, L, P },
    { t: 'central_lobby', c: LOBBY, a: 9, T: 1.5, y: g, P, top: g + 91 },
    { t: 'commons', x: LOBBY[0], z0: LOBBY[1] - 10.5, y: g, P },
    { t: 'lords', x: LOBBY[0], z0: LOBBY[1] + 10.5, y: g, P },
    // Westminster Abbey: the high nave and its flyers, the transepts, the lantern, Hawksmoor's towers, Henry VII's chapel
    { t: 'abbey', rect: ABBEY, y: g },
  ],
  rooms: [{ id: 'parliament square', rect: [-60, -215, 40, -150], y: g, kind: 'open' }, { id: 'westminster hall', rect: [HALL[0] + 2, HALL[1] + 3, HALL[2] - 2, HALL[3] - 13], y: g + 0.05, kind: 'hall' },
    { id: "st stephen's porch", rect: PORCH, y: L, kind: 'hall' }, { id: "st stephen's hall", rect: STEPHEN, y: P, kind: 'hall' },
    { id: 'central lobby', rect: [LOBBY[0] - 9, LOBBY[1] - 9, LOBBY[0] + 9, LOBBY[1] + 9], y: P, kind: 'hall' },
    { id: 'commons corridor', rect: [LOBBY[0] - 6.1, LOBBY[1] - 35.2, LOBBY[0] + 6.1, LOBBY[1] - 10.5], y: P, kind: 'hall' },
    { id: 'house of commons', rect: [LOBBY[0] - 6.85, LOBBY[1] - 59, LOBBY[0] + 6.85, LOBBY[1] - 36.2], y: P, kind: 'chamber' },
    { id: "lords corridor and peers' lobby", rect: [LOBBY[0] - 6, LOBBY[1] + 10.5, LOBBY[0] + 6, LOBBY[1] + 36], y: P, kind: 'hall' },
    // Westminster Abbey (abbeyin.js): the porch, the nave with its aisles, the crossing and transepts, the choir and sanctuary, Henry VII's chapel
    { id: 'abbey porch', rect: [ABBEY[0] + 1.2, ABBEY[1] + 17.5, ABBEY[0] + 10, ABBEY[1] + 24.5], y: g, kind: 'hall' },
    { id: 'abbey nave', rect: [ABBEY[0] + 11.2, ABBEY[1] + 8, ABBEY[0] + 65.5, ABBEY[1] + 34], y: g, kind: 'hall' },
    { id: 'abbey crossing and transepts', rect: [ABBEY[0] + 65.5, ABBEY[1] + 1.4, ABBEY[0] + 77.5, ABBEY[3] - 1.4], y: g, kind: 'hall' },
    { id: 'abbey choir and sanctuary', rect: [ABBEY[0] + 77.5, ABBEY[1] + 8, ABBEY[0] + 100, ABBEY[1] + 34], y: g, kind: 'hall' },
    { id: "henry vii's chapel", rect: [ABBEY[2] - 23, ABBEY[1] + 14.2, ABBEY[2] - 1.2, ABBEY[1] + 27.8], y: g, kind: 'hall' },
    { id: 'house of lords', rect: [LOBBY[0] - 6.85, LOBBY[1] + 37, LOBBY[0] + 6.85, LOBBY[1] + 61.4], y: P, kind: 'chamber' }],
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
export default westminster;
