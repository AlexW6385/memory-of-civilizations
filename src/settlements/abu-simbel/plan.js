// The two temples of Abu Simbel as landmarks (docs/settlements/abu-simbel.md §3, §4): the Great Temple of Ramesses II with the terrace before it, its
// mudbrick walls, the stone gate and the altar of Ra-Horakhty; and the Small Temple of Nefertari and Hathor to the north. The rooms are the
// halls cut in the rock (the sealed interiors), the forecourt open.

import { FX, FXS, ZS, TERRACE, WALL, GATE, SGATE, ALTAR, SMALL_TERRACE, WAY } from './layout.js';
import { greatRooms, greatChambers, smallRooms, FLOOR } from '../../styles/ramesside/dims.js';

const E = [];
E.push({ t: 'great_temple', fx: FX });
// the terrace paved before the façade, between the mudbrick walls
E.push({ t: 'floor', rect: TERRACE, y: FLOOR, th: 0.4, mat: 'sandstone_floor' });
{
  const w = (z, g) => E.push({ t: 'wall', a: [WALL.x0, z], b: [WALL.x1, z], th: WALL.th, y0: -0.2, y1: WALL.h, mat: 'mudbrick', openings: [{ at: g.x - WALL.x0, w: g.w, h: g.h }] });
  w(-WALL.z, GATE); w(WALL.z, SGATE);
  E.push({ t: 'stone_gate', at: [GATE.x, -WALL.z], w: GATE.w, h: GATE.h, th: WALL.th, y: 0 });
  E.push({ t: 'stone_gate', at: [SGATE.x, WALL.z], w: SGATE.w, h: SGATE.h, th: WALL.th, y: 0 });
  E.push({ t: 'sun_altar', at: [ALTAR.x, ALTAR.z], y: FLOOR });
}
// the halls furnished: tables of offerings, braziers, the priests' benches, the god's barque in the vestibule
E.push({ t: 'temple_furnish', kind: 'great', fx: FX, z: 0 });
// the way north to the Small Temple, paved, walled low on the cliff side
E.push({ t: 'floor', rect: [WAY[0], WAY[1], WAY[2], WAY[3] + 0.3], y: FLOOR, th: 0.4, mat: 'sandstone_floor' });
const room = (id, rect, y, kind, extra = {}) => ({ id, rect, y, kind, ...extra });
const G = greatRooms();
const rooms = [
  room('the terrace', [TERRACE[0] + 3, TERRACE[1] + 4, TERRACE[2] - 4, TERRACE[3] - 4], FLOOR, 'open'),
  ...G.map((r) => room(r.name, [FX - r.d1, -r.zh, FX - r.d0, r.zh], r.y0, 'hall', r.kind === 'pass' ? {} : { sealed: true })),
  ...greatChambers().flatMap((c) => [-1, 1].map((s) => room('a side chamber', [FX - c.d1, s > 0 ? c.z0 : -c.z1, FX - c.d0, s > 0 ? c.z1 : -c.z0], c.y0, 'hall', { sealed: true }))),
];
const walks = [[[FX + 44, 0], [FX + 20, 0], [FX + 2, 0], [FX - 4, 0], [FX - 17, 0], [FX - 27, 0], [FX - 36, 0], [FX - 47, 0], [FX - 56, 0]]];
walks[0].y0 = FLOOR;

export const great = {
  id: 'abu-simbel-great-temple',
  name: { en: 'The Great Temple of Ramesses II', zh: '拉美西斯二世大神庙' },
  era: { en: 'Ramesses II, c. 1255 BC', zh: '拉美西斯二世，约公元前1255年' },
  style: 'ramesside',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [FX + 44, 0], facing: 'w' },
  bounds: [FX - 112, -40, FX + 60, 40],
  view: [FX - 6, -19, FX + 2, 19],   // the façade of the four colossi
  bakeTop: 60,
  elements: E,
  rooms,
  walks,
};

// ── the Small Temple ──
const S = [];
S.push({ t: 'small_temple', fx: FXS, z: ZS });
S.push({ t: 'floor', rect: SMALL_TERRACE, y: FLOOR, th: 0.4, mat: 'sandstone_floor' });
for (const dz of [-21, 21]) S.push({ t: 'wall', a: [FXS, ZS + dz], b: [SMALL_TERRACE[2], ZS + dz], th: 1.6, y0: -0.2, y1: 3.0, mat: 'mudbrick' });
S.push({ t: 'temple_furnish', kind: 'small', fx: FXS, z: ZS });
const SR = smallRooms();
const smallRoomsList = [
  room('the small terrace', [FXS + 4, ZS - 17, SMALL_TERRACE[2] - 3, ZS + 17], FLOOR, 'open'),
  ...SR.map((r) => room(r.name, [FXS - r.d1, ZS - r.zh, FXS - r.d0, ZS + r.zh], r.y0, 'hall', r.kind === 'pass' ? {} : { sealed: true })),
];
const swalks = [[[FXS + 24, ZS], [FXS + 4, ZS], [FXS - 6, ZS], [FXS - 18, ZS], [FXS - 21, ZS]]];
swalks[0].y0 = FLOOR;
export const small = {
  id: 'abu-simbel-small-temple',
  name: { en: 'The Small Temple of Nefertari and Hathor', zh: '奈费尔塔利与哈托尔小神庙' },
  era: { en: 'Ramesses II, c. 1255 BC', zh: '拉美西斯二世，约公元前1255年' },
  style: 'ramesside',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [FXS + 24, ZS], facing: 'w' },
  bounds: [FXS - 40, ZS - 24, FXS + 30, ZS + 24],
  bakeTop: 40,
  elements: S,
  rooms: smallRoomsList,
  walks: swalks,
};
export default great;
