// Mississippian Cahokia about 1175 (docs/settlements/cahokia.md §2–§4).
import { RADIUS, SUMMIT, PLAZA, YARDS, PALISADE, WOODHENGE, MOUNDS, MONKS, FOX, CONES, RIDGES, HALLS, height, smallPlazas, mRamp } from './layout.js';

const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const LODGES = [[-54, -104, -32, -90], [26, -104, 48, -90]];
const lodge = ([x, z, s]) => [x - 0.45 * s, z - 0.33 * s, x + 0.45 * s, z + 0.33 * s];
export const monks = {
  id: 'cahokia-monks',
  name: { en: 'Monks Mound and the Grand Plaza', zh: '僧侣丘与大广场' },
  era: { en: 'Cahokia, about 1175', zh: '卡霍基亚，约1175年' },
  style: 'mississippian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-25, -5], facing: 'n' },
  bounds: [-90, -270, 90, PLAZA[3]],
  view: [-82, -240, 82, -50],
  bakeTop: 60,
  elements: [
    { t: 'chief_hall', rect: HALLS[0], y: height(...mid(SUMMIT)), h: 4.5, rise: 11, porch: 5.5, post: [-6, SUMMIT[1] + 50], seed: 11 },
    { t: 'chief_hall', rect: HALLS[1], y: height(-4, -93), h: 3.5, rise: 7, porch: 4, seed: 12 },
    // the log stairs up the ramp, the first stretch to the terrace, the second to the summit
    { t: 'log_stair', from: [-25, -36], to: [-25, -76], width: 7, y: height, step: 1.5 },
    { t: 'log_stair', from: [-25, -106], to: [-25, -150], width: 7, y: height, step: 1.5 },
    // the first terrace: two more lodges (the houses of the chief's kin and of the priests), a fence of painted posts along its south edge, broken by the ramp
    { t: 'chief_hall', rect: LODGES[0], y: height(...mid(LODGES[0])), h: 4, rise: 6.5, seed: 13 },
    { t: 'chief_hall', rect: LODGES[1], y: height(...mid(LODGES[1])), h: 4, rise: 6.5, seed: 14 },
    { t: 'terrace_fence', from: [-57, -75], to: [-33, -75], y: height },
    { t: 'terrace_fence', from: [-17, -75], to: [57, -75], y: height },
    // the summit about the great house: stores, the fire before it
    { t: 'granary', c: [34, -190], y: height, s: 2.8, seed: 21 }, { t: 'granary', c: [-34, -186], y: height, s: 2.8, seed: 22 }, { t: 'granary', c: [38, -176], y: height, s: 2.5, seed: 23 },
    { t: 'yard_fire', c: [8, -176], y: height, seed: 24 },
    { t: 'terrace_fence', from: [-50, -150], to: [-30, -150], y: height }, { t: 'terrace_fence', from: [-18, -150], to: [50, -150], y: height },
    { t: 'plaza_pole', c: [0, 55], y: 0, h: 14 },
    // the gates of painted posts at the foot of each stair, the standards along the lips of the terraces
    { t: 'ramp_gate', c: [-25, -42], y: height, span: 14, h: 9, seed: 1 },
    { t: 'ramp_gate', c: [-25, -78], y: height, span: 14, h: 8, seed: 2 },
    { t: 'ramp_gate', c: [-25, -151], y: height, span: 14, h: 8, seed: 3 },
    ...[[-62, -76], [62, -76], [-60, -120], [60, -120], [-48, -153], [-6, -153], [44, -153]].map(([x, z], i) => ({ t: 'standard', c: [x, z], y: height, h: 8 + (i % 3), seed: i })),
    { t: 'terrace_fence', from: [-57, -75], to: [-57, -122], y: height }, { t: 'terrace_fence', from: [57, -75], to: [57, -122], y: height },
    { t: 'terrace_fence', from: [-50, -153], to: [-50, -235], y: height }, { t: 'terrace_fence', from: [50, -153], to: [50, -235], y: height },
    // chunkey yards on the Grand Plaza
    ...YARDS.map((rect, i) => ({ t: 'chunkey_yard', rect, y: 0, seed: 3 + i * 2 })),
  ],
  rooms: [{ id: 'plaza', rect: PLAZA, y: 0, kind: 'open' }, ...LODGES.map((r, i) => ({ id: 'lodge-' + i, rect: [r[0] + 0.6, r[1] + 0.6, r[2] - 0.6, r[3] - 0.6], y: height(...mid(r)), kind: 'hall' })), { id: 'summit-hall', rect: [SUMMIT[0] + 0.6, SUMMIT[1] + 20.6, SUMMIT[2] - 0.6, SUMMIT[1] + 39.4], y: height(...mid(SUMMIT)), kind: 'hall' }],
  walks: [Object.assign([[-25, -5], [-25, -36]], { y0: 0 })],
};
export const precinct = {
  id: 'cahokia-precinct', style: 'mississippian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [-25, -5], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS],
  rooms: [],
  elements: [
    { t: 'palisade', rect: PALISADE, y: height, every: 26, gates: [[2, 0.5], [3, 0.45], [1, 0.55]] },
    { t: 'woodhenge', c: WOODHENGE.c, r: WOODHENGE.r, y: height(...WOODHENGE.c) },
    // a tall cedar post on each conical mound; marker posts along the ridge-top mounds
    ...CONES.map(([x, z, , h]) => ({ t: 'plaza_pole', c: [x, z], y: height(x, z), h: 6 + h * 0.3 })),
    ...RIDGES.flatMap(([x0, z0, x1, z1]) => [0.2, 0.5, 0.8].map((f) => { const x = x0 + (x1 - x0) * f, z = (z0 + z1) / 2; return { t: 'plaza_pole', c: [x, z], y: height(x, z), h: 5 }; })),
    ...smallPlazas().map((p) => ({ t: 'small_plaza', c: p.c, y: height, seed: p.seed })),
    // the twin mounds: on the platform mound the charnel house, its door to the plaza; the conical mound beside it for burial
    { t: 'charnel_house', c: mid(FOX), y: height(...mid(FOX)), s: 9 },
    // the buildings of the lesser platform mounds, opened (lodges), each reached by a log stair up the ramp on its south face
    ...MOUNDS.map((m, i) => ({ t: 'chief_hall', rect: lodge(m), y: height(m[0], m[1]), h: 4.2, rise: 6, seed: 30 + i })),
    ...MOUNDS.map((m) => { const r = mRamp(m); return { t: 'log_stair', from: [r.x, r.zOut], to: [r.x, r.zIn - 0.4], width: 4.4, y: height, step: 1.4 }; }),
    // the west and east terraces of Monks Mound: rows of cedar posts along their outer edges
    ...[[-104, -222], [-104, -190], [-104, -158], [106, -208], [106, -182], [106, -158]].map(([x, z]) => ({ t: 'plaza_pole', c: [x, z], y: height(x, z), h: 9 })),
  ],
};
export default monks;
