// Bianjing about 1120 (docs/settlements/song-kaifeng.md §2–§4): the Iron Pagoda (13 storeys of brown
// glazed brick, eaves at every storey, 56 m) in the Kaibao monastery with its halls; the Bian River
// with its stone landings, the Rainbow Bridge and grain boats; the east wall, its water gate and the
// city gate with its tower; the streets' paving.

import { RADIUS, RIVER, BRIDGE, MONASTERY, PAGODA, WALL_X, STREETS, GATE, FIELDS_X, STONE_BANK, APPROACH, pavedWay } from './layout.js';
import { interiorRooms } from './interiors.js';

const E = [];
const RW = RADIUS - 26, half = (z) => Math.sqrt(Math.max(0, RW * RW - z * z));
// ---- the Iron Pagoda: base side 4.16 m (circumradius 5.4), thirteen storeys narrowing to the top
const tiers = [];
for (let i = 0; i < 13; i++) tiers.push({ r: 5.4 - i * 0.19, h: i === 0 ? 5.6 : 3.75 - i * 0.06 });
E.push({ t: 'pagoda_oct', c: PAGODA, y: 0, base: { r: 7.2, h: 1.2 }, tiers, galleries: false, core: 'tile_iron', eave: 'tile_iron', frame: 'tile_iron', spire: 3.6, relief: true, bells: 'bronze' });
// the monastery: its wall, the gate hall standing in the south wall's line (the way in through its
// middle bay), the main hall behind the pagoda, side halls
const [mx0, mz0, mx1, mz1] = MONASTERY, w = (a, b) => E.push({ t: 'ming_wall', a, b, y: 0, h: 3.6, th: 0.8 });
const SHANMEN = { c: [PAGODA[0], mz1], bays: [4.4, 6.1, 4.4] }, smW = 14.9;
w([mx0, mz0], [mx1, mz0]); w([mx0, mz1], [PAGODA[0] - smW / 2, mz1]); w([PAGODA[0] + smW / 2, mz1], [mx1, mz1]); w([mx0, mz0], [mx0, mz1]); w([mx1, mz0], [mx1, mz1]);
E.push({ t: 'shanmen', c: SHANMEN.c, bays: SHANMEN.bays, depth: 8.8, y: 0, plat: 0.42, H: 4.4, door: 3.4, doorH: 3.6, guardians: { h: 4.6 } });
const SONG_PAL = { roof: 'tile_dark', soffit: 'lacquer_red', wood: 'lacquer_red', column: 'lacquer_red', plaster: 'plaster_white', plinth: 'granite_block', base: 'granite_block' };
// the main hall (Buddha hall) on its terrace, furnished; the sutra hall (west) and the Guanyin hall (east) flank the pagoda's court
const MAIN = [PAGODA[0] - 18, mz0 + 10, PAGODA[0] + 18, mz0 + 32];
E.push({ t: 'qing_hall', rect: MAIN, y: 0.9, H: 6, double: 4.8, roof: 'xieshan', bays: [7, 4], front: 's', four: true, plat: 0.9, pal: SONG_PAL });
E.push({ t: 'temple_interior', rect: MAIN, y: 0.9, H: 6, front: 's', kind: 'main' });
// the steps up the terrace's south face on the axis (0.9 m; the walker's step is 0.5)
E.push({ t: 'stairs', rect: [PAGODA[0] - 2.6, MAIN[3] + 0.8, PAGODA[0] + 2.6, MAIN[3] + 3.0], y0: 0.04, y1: 0.9, dir: 'n', mat: 'granite_block' });
for (const x of [mx0 + 14, mx1 - 14]) {
  const west = x < PAGODA[0], rect = [x - 6, -200, x + 6, -170], front = west ? 'e' : 'w';
  E.push({ t: 'qing_hall', rect, y: 0.6, H: 4.6, roof: 'xieshan', front, plat: 0.6, eave: 1.3, sweep: 0.8, pal: SONG_PAL, caihua: false });
  E.push({ t: 'temple_interior', rect, y: 0.6, H: 4.6, front, kind: west ? 'sutra' : 'guanyin' });
}
// the bell tower (east) and the drum tower (west) in front of the main hall, the bell and the drum hung in their lower storeys
for (const [x, front, kind, axis] of [[PAGODA[0] + 34, 'w', 'bell', 'z'], [PAGODA[0] - 34, 'e', 'drum', 'x']]) {
  const rect = [x - 4.5, -224, x + 4.5, -215];
  E.push({ t: 'qing_hall', rect, y: 1.2, H: 4.4, double: 3.4, roof: 'hip', bays: [3, 3], front, four: true, plat: 1.2, pal: SONG_PAL });
  E.push({ t: 'hung_bell', at: [x, -219.5], y: 1.2, H: 4.4, kind, axis });
}
// the court: stone sutra pillars and lamps along the way, two steles on their tortoises, the great censer before the hall
for (const s of [-1, 1]) {
  E.push({ t: 'sutra_pillar', at: [PAGODA[0] + s * 10, -134], y: 0, h: 4.6 });
  E.push({ t: 'stele_pavilion', at: [PAGODA[0] + s * 26, -150], y: 0, face: [-s, 0] });
  for (const z of [-124, -166]) E.push({ t: 'stone_lamp', at: [PAGODA[0] + s * 5.5, z], y: 0 });
}
// the paved axis from the gate hall to the pagoda's apron, the paths to the side halls and the stele pavilions, the beds of pines and cypresses
E.push({ t: 'song_court', ax: PAGODA[0], c: PAGODA, z1: SHANMEN.c[1] - 5.2, apron: 13, cross: -150, pav: 20.5, halls: [[mx0 + 14 + 6, -185], [mx1 - 14 - 6, -185]] });
E.push({ t: 'incense_ding', at: [PAGODA[0], -158], y: 0.075, s: 1.5 });
E.push({ t: 'incense_ding', at: [PAGODA[0], -219], y: 0, s: 1.4 });
// ---- the river: water, stone landings near the bridge, the Rainbow Bridge, boats
for (let z0 = RIVER.z0; z0 < RIVER.z1; z0 += 8) { const z1 = Math.min(z0 + 8, RIVER.z1); E.push({ t: 'water_rect', rect: [-half(z1) + 2, z0, half(z1) - 2, z1], y: RIVER.water }); }   // (in strips, out to the disc's edge; under the water gate too)
for (const z of [RIVER.z0, RIVER.z1]) E.push({ t: 'canal_wall', a: [-STONE_BANK, z], b: [STONE_BANK, z], y: 0.05, bed: RIVER.bed, th: 0.8 });
E.push({ t: 'rainbow_bridge', at: BRIDGE.at, across: 'z', span: BRIDGE.span, width: BRIDGE.width, spring: BRIDGE.spring, crown: BRIDGE.crown, y0: BRIDGE.y0, abut: (RIVER.z1 - RIVER.z0) / 2 - BRIDGE.span / 2 - 0.35, bed: RIVER.bed });
// the hawkers' booths on the deck's east side, between railing and walkway (the west railing is the onlookers')
E.push({ t: 'bridge_stalls', at: BRIDGE.at, span: BRIDGE.span, width: BRIDGE.width, spring: BRIDGE.spring, crown: BRIDGE.crown, y0: BRIDGE.y0, side: 1, stalls: [{ s0: -3.7, s1: -1.7, kind: 'cloth' }, { s0: -1.3, s1: 0.7, kind: 'food' }, { s0: 1.1, s1: 3.1, kind: 'sundry' }] });
// the grain boats: moored against the banks (hull edge ~0.6 m off the quay) with their masts laid back on the crutch, two with masts up
// downstream, and the one before the bridge, its crew lowering the mast as it comes up to it
for (const [x, z, d, L, mast] of [[-200, 63.4, 1, 18, 90], [-120, 89.2, -1, 16, 90], [-17.5, 75, 1, 19, 42], [62, 89.4, -1, 18, 90], [140, 63.0, -1, 16, 0], [220, 88.7, -1, 20, 90], [300, 62.6, 1, 12, 0]]) E.push({ t: 'song_boat', at: [x, z], dir: [d, 0], len: L, beam: L * 0.25, mast, y: RIVER.water, seed: x + 1000 });
// ---- the city wall east of the city (rammed earth, battered, no battlements) with its water gate and the gate over the road
const wz = (z0, z1) => E.push({ t: 'block', walk: true, rect: [WALL_X - 8, z0, WALL_X + 8, z1], y0: RIVER.bed, y1: 9, mat: 'earth_wall', batter: [2.2, 2.2, 0, 0] });
wz(-half(WALL_X) + 4, GATE.rect[1] + 0.5); wz(GATE.rect[3] - 0.5, RIVER.z0 - 1.5); wz(RIVER.z1 + 1.5, half(WALL_X) - 4);
E.push({ t: 'block', walk: true, rect: [WALL_X - 8, RIVER.z0 - 2, WALL_X + 8, RIVER.z1 + 2], y0: 4.5, y1: 9, mat: 'brick_grey' });
E.push({ t: 'song_gate', rect: GATE.rect, along: 'x', w: 5.2, h: 4.2, top: 5.8, tw: 3.2, H: 9.5, mat: 'brick_grey' });
E.push({ t: 'qing_hall', rect: [WALL_X - 6.5, GATE.z - 13, WALL_X + 6.5, GATE.z + 13], y: 9.5, H: 5, roof: 'hip', bays: [5, 3], front: 'e', four: true, plat: 0.3, pal: { roof: 'tile_dark', soffit: 'lacquer_red', wood: 'lacquer_red', column: 'lacquer_red', plaster: 'plaster_white', plinth: 'brick_grey', base: 'brick_grey' } });
// the approach: the way from the shop street to the gate hall, paved
E.push({ t: 'paving', rect: APPROACH, y: 0.04, th: 0.3 });
// ---- the streets' paving: none in the fields; beyond the stone banks the riverside streets stop
// 4 m short of the water's edge, leaving the earth bank (the towpath on the north side)
// only what pavedWay says is paved (the shop streets near the bridge); the rest is earth (ground.js), so each street is cut in 10 m lengths and the paved ones kept
let wayI = 0;
const pave = (r) => {
  if (!(r[2] > r[0] + 0.5 && r[3] > r[1] + 0.5)) return;
  const horiz = r[2] - r[0] > r[3] - r[1], a0 = horiz ? r[0] : r[1], a1 = horiz ? r[2] : r[3], n = Math.max(1, Math.round((a1 - a0) / 10));
  for (let k = 0; k < n; k++) {
    const u0 = a0 + (a1 - a0) * k / n, u1 = a0 + (a1 - a0) * (k + 1) / n, q = horiz ? [u0, r[1], u1, r[3]] : [r[0], u0, r[2], u1];
    if (pavedWay(wayI, (q[0] + q[2]) / 2, (q[1] + q[3]) / 2)) E.push({ t: 'paving', rect: q, y: 0.04, th: 0.3 });
  }
};
STREETS.forEach((s, wi) => {
  wayI = wi;
  const c = [Math.max(s[0], WALL_X + 8), s[1], Math.min(s[2], FIELDS_X), s[3]], horiz = c[2] - c[0] > c[3] - c[1];
  const h = horiz ? half(Math.max(Math.abs(c[1]), Math.abs(c[3]))) : half(Math.max(Math.abs(c[0]), Math.abs(c[2])));
  const r = horiz ? [Math.max(c[0], -h), c[1], Math.min(c[2], h), c[3]] : [c[0], Math.max(c[1], -h), c[2], Math.min(c[3], h)];
  if (r[2] <= r[0] || r[3] <= r[1]) return;
  const bankN = r[3] === RIVER.z0, bankS = r[1] === RIVER.z1;
  if (!horiz || !(bankN || bankS)) { pave(r); return; }
  const cut = bankN ? [r[0], r[1], r[2], r[3] - 4] : [r[0], r[1] + 4, r[2], r[3]];
  pave([cut[0], cut[1], Math.min(-STONE_BANK, cut[2]), cut[3]]);
  pave([Math.max(STONE_BANK, cut[0]), cut[1], cut[2], cut[3]]);
  pave([Math.max(-STONE_BANK, r[0]), r[1], Math.min(STONE_BANK, r[2]), r[3]]);
});

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
// the halls (kind 'hall': the chant zone) come first, the monastery's court 'open' after them; the shops' and houses' rooms (tea, tavern, inn, shop, house) are
// interiors.js's, in the lot's footprint on its floor. The halls' rects and floors are the elements' above.
const rooms = [
  room('gate-hall', [SHANMEN.c[0] - smW / 2, SHANMEN.c[1] - 4.4, SHANMEN.c[0] + smW / 2, SHANMEN.c[1] + 4.4], 0.42, 'hall'),
  room('main-hall', MAIN, 0.9, 'hall'),
  room('sutra-hall', [mx0 + 8, -200, mx0 + 20, -170], 0.6, 'hall'),
  room('guanyin-hall', [mx1 - 20, -200, mx1 - 8, -170], 0.6, 'hall'),
  room('monastery', MONASTERY, 0, 'open'),
  ...interiorRooms(),
];
const walks = [[[0, 108], [0, 100], [0, 76], [0, 50], [0, -80], [160, -80], [160, -150]]];
walks[0].y0 = 0;

export const pagoda = {
  id: 'song-kaifeng-iron-pagoda',
  name: { en: 'The Iron Pagoda and the Rainbow Bridge', zh: '铁塔与虹桥' },
  era: { en: 'Northern Song, c. 1120', zh: '北宋，约1120年' },
  style: 'song',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [160, -130], facing: 'n' },
  // the landmark's precinct: the gate and its wall, the monastery, the bridge and the two river streets. The generic street life (src/objects/life.js) keeps out of the bounds
  // (the town's own scroll life dresses them); the town's streets beyond, out to the disc's edge (RADIUS 520), are the townscape's.
  bounds: [WALL_X - 8, -262, 300, 112],
  bakeBounds: [WALL_X - 8, -262, 300, 112],
  view: [150, -200, 170, -180],
  bakeTop: 62,
  elements: E,
  rooms,
  walks,
};
export default pagoda;
