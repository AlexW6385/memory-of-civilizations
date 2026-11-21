// Where Brasília's sounds are (docs/settlements/brasilia.md §14): the places the audio engine needs to put each sound where it is made —
// the carriageways' and the avenue's traffic, the fountains of the pools and the curtains of the Palace of Justice, the halyard of the
// flag in the Square, the lapwings and kiskadees of the lawns, the owls of the night, the vendors' bells and kettles, the transistor
// radios of kiosks and shops, the school's bell and its yard, the children's pitch, the candangos' camp, and the rooms one can enter:
// the shops of the two strips, the school's classrooms, the museum, the Salões, the Igrejinha, the Senate, the Cathedral's nave. Pure data
// and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices-brasilia.js. Coordinates: metres, +x east, +z south, the settlement's frame.
// [inferred throughout: no recording of 1970 Brasília is kept. What the sources give is marked [stated] in the dossier §14.]
import { RADIUS, LAWN, POOLS, DOME, DECK, JUSTICE, ITAMARATY, MUSEU, CHAPEL, PLAYS, PITCH_AT, SCHOOL, CAMP, CATH, CARTS, KIOSKS, ROAD_N, ROAD_S, AVENUE, SQS, PRACA, GALLERY, STRIP, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none: the arrival, at the foot of the Congress ramp. */
export const HOME = [-120, 0];
export const schedule = 'braPlaced';
export const clock = { hour: 12 };
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the rooms one can enter, and what each makes heard ─────────────────────────────────
/** [voice, gap in seconds [min, max], hours [from, to]]. The strips' hours are those of the commerce of a quadra: 8 to 18.30, the snack bar to 22, the bakery from 5.30, the pharmacy to 21 [inferred]. */
const D = [8, 18.5];
const WORK = {
  padaria: [['braOven', [30, 70], [5.5, 20]], ['braTill', [40, 90], [5.5, 20]], ['braRadio', [90, 200], [5.5, 20]]],
  banca: [['paper', [25, 60], [6, 19]], ['braTill', [50, 110], [6, 19]], ['braRadio', [80, 160], [6, 19]]],
  armarinho: [['scissors', [30, 70], D], ['braTill', [60, 120], D]],
  farmacia: [['drawer', [40, 90], [8, 21]], ['braTill', [60, 120], [8, 21]]],
  lanchonete: [['braCoffee', [25, 55], [7, 22]], ['braRadio', [60, 130], [7, 22]], ['kitchen', [30, 60], [7, 22]]],
  mercearia: [['sack', [25, 60], D], ['braTill', [40, 90], D]],
  sapataria: [['braTacks', [14, 34], D], ['braRadio', [70, 150], D]],
  barbearia: [['scissors', [8, 18], D], ['braRadio', [50, 110], D]],
  papelaria: [['paper', [30, 70], D], ['braTill', [60, 120], D]],
  acougue: [['braCleaver', [14, 34], [7, 18]], ['braTill', [50, 100], [7, 18]]],
  hortifruti: [['sack', [20, 50], [7, 18]], ['braTill', [40, 90], [7, 18]]],
  otica: [['drawer', [40, 90], D], ['braTill', [80, 160], D]],
};
const SCHOOL_ROOMS = (() => {
  const Z = [0, 1, 2, 3, 4, 5].map((k) => SCHOOL[1] + k * 9), bounds = [...Z, Z[5] + 7, SCHOOL[3]];
  return bounds.slice(0, -1).map((a, k) => ({ use: k < 5 ? 'class' : k === 5 ? 'office' : 'cantina', rect: [SCHOOL[0], a, SCHOOL[0] + 8, bounds[k + 1]], k }));
})();
const HALLS = [
  { use: 'salao', rect: [-10, -106, 26, -80], y: 0 },
  { use: 'salao', rect: [-10, 80, 26, 106], y: 0 },
  { use: 'senate', rect: [DOME.c[0] - DOME.r, DOME.c[1] - DOME.r, DOME.c[0] + DOME.r, DOME.c[1] + DOME.r], y: DECK },
  { use: 'museum', rect: MUSEU, y: 0 },
  { use: 'chapel', rect: CHAPEL, y: 0 },
  { use: 'nave', rect: [CATH.c[0] - 32, CATH.c[1] - 32, CATH.c[0] + 32, CATH.c[1] + 32], y: CATH.floor },
];
const ROOM_WORK = {
  class: [['braLesson', [14, 30], [7, 12]], ['braLesson', [14, 30], [13, 17.5]]],
  office: [['braTypewriter', [40, 90], [7, 17]]],
  cantina: [['kitchen', [20, 45], [10, 11.5]], ['braShout', [10, 25], [10, 11.5]]],
  senate: [['braGavel', [25, 55], [14, 19]]],
  salao: [['braRadio', [120, 240], [9, 18]]],
  museum: [], chapel: [], nave: [],
};
let SITES = null;
/** The rooms with sounds: { use, rect, at, id, y (the floor), upper, work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const u of [...GALLERY, ...STRIP]) SITES.push({ use: u.trade, rect: u.rect, at: mid(u.rect), id: 'unit:' + Math.round(u.fx) + ',' + Math.round(u.z), y: 0, upper: false, work: (WORK[u.trade] ?? []).map((w) => [...w]) });
  for (const r of SCHOOL_ROOMS) SITES.push({ use: r.use, rect: r.rect, at: mid(r.rect), id: 'school:' + r.k, y: 0.05, upper: false, work: (ROOM_WORK[r.use] ?? []).map((w) => [...w]) });
  HALLS.forEach((h, i) => SITES.push({ use: h.use, rect: h.rect, at: mid(h.rect), id: 'hall:' + i, y: h.y, upper: false, work: (ROOM_WORK[h.use] ?? []).map((w) => [...w]) }));
  return SITES;
}
export const WELLS = [];
export const TEMPLE = null;
export const FAR = { tower: [0, -1900], bell: [CATH.c[0] + 20, CATH.c[1] - 10] };

// ── the open emitters ──────────────────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const DAY = [6, 18.5];
export const EMITTERS = [
  // the lawns' birds: lapwings (quero-quero) on the Esplanade and the quadras' lawns, kiskadees in the trees, parakeets over at morning and evening
  E('braQuero', [-300, 0], 90, [20, 50], DAY, { rainMax: 0.5 }), E('braQuero', [-200, 60], 80, [28, 60], DAY, { rainMax: 0.5 }), E('braQuero', [-60, -70], 80, [30, 70], DAY, { rainMax: 0.5 }),
  E('braQuero', [-100, 350], 80, [30, 70], DAY, { rainMax: 0.5 }), E('braQuero', [170, 350], 80, [30, 70], DAY, { rainMax: 0.5 }), E('braQuero', [200, 20], 80, [40, 90], DAY, { rainMax: 0.5 }),
  E('braKiskadee', [-100, 300], 60, [24, 60], [5.5, 18.5], { rainMax: 0.4 }), E('braKiskadee', [170, 330], 60, [30, 70], [5.5, 18.5], { rainMax: 0.4 }), E('braKiskadee', [-180, 120], 60, [40, 90], [5.5, 18.5], { rainMax: 0.4 }), E('braKiskadee', [31, 250], 60, [40, 90], [5.5, 18.5], { rainMax: 0.4 }),
  E('braParakeet', [-250, 100], 100, [40, 90], [6, 9], { rainMax: 0.3 }), E('braParakeet', [-250, 100], 100, [40, 90], [16, 18.5], { rainMax: 0.3 }), E('braParakeet', [0, 300], 100, [50, 110], [6, 9], { rainMax: 0.3 }), E('braParakeet', [0, 300], 100, [50, 110], [16, 18.5], { rainMax: 0.3 }),
  E('braOwl', [-250, -40], 60, [30, 70], [18.5, 24], { rainMax: 0.5 }), E('braOwl', [-250, -40], 60, [30, 70], [0, 5], { rainMax: 0.5 }), E('braOwl', [100, 0], 60, [40, 90], [18.5, 24], { rainMax: 0.5 }), E('braOwl', [-100, 380], 60, [40, 90], [18.5, 24], { rainMax: 0.5 }),
  // the water: the plumes in the Congress's two pools, the Cathedral's pool, the Itamaraty's pool, the Palace of Justice's curtains
  ...POOLS.map((p) => E('braFountain', mid(p), 22, [9, 14], [6, 22], { rainMax: 1 })),
  E('braFountain', [CATH.c[0], CATH.c[1] - CATH.pool + 4], 20, [9, 14], [6, 22], { rainMax: 1 }), E('braFountain', mid(ITAMARATY), 20, [9, 14], [6, 22], { rainMax: 1 }),
  E('braCascade', mid(JUSTICE), 26, [12, 20], [6, 22], { rainMax: 1 }),
  // the flag's halyard on its mast in the Square
  E('braFlagRope', [PRACA[0] + 206, 0], 40, [8, 18], [0, 24], { rainMax: 0.9 }),
  // the vendors: the ice-lolly bell and the popcorn kettle at their carts
  ...CARTS.filter((c) => c[2] === 'picole').map((c) => E('braPicole', [c[0], c[1]], 30, [30, 70], [10, 18], { rainMax: 0.2 })),
  ...CARTS.filter((c) => c[2] === 'pipoca').map((c) => E('braPipoca', [c[0], c[1]], 25, [40, 90], [11, 20], { rainMax: 0.2 })),
  // radios at the kiosks, a coffee machine at the snack bars
  ...KIOSKS.map((k) => E('braRadio', [k[0], k[1]], 14, [60, 140], [8, 20], { rainMax: 0.5 })),
  ...KIOSKS.filter((k) => k[3] === 'lanchonete').map((k) => E('braCoffee', [k[0], k[1]], 12, [40, 90], [7, 22], { rainMax: 0.5 })),
  // car horns on the carriageways
  E('braHorn', [-200, -129], 90, [24, 70], [6, 23], { lv: 0.9 }), E('braHorn', [-200, 129], 90, [24, 70], [6, 23], { lv: 0.9 }), E('braHorn', [31, 300], 90, [30, 80], [6, 23], { lv: 0.9 }),
  // the school: the bell at the lessons' hours, the yard at the break; the children's pitch and the playgrounds in the afternoon
  ...[[6.8, 7.1], [9.5, 9.8], [11.9, 12.2], [12.9, 13.2], [17.3, 17.6]].map((h) => E('braSchoolBell', mid(SCHOOL), 90, [30, 60], h, { after: true })),
  E('braShout', [SCHOOL[0] + 14, mid(SCHOOL)[1]], 40, [8, 20], [9.5, 10.3]),
  ...PLAYS.map((r) => E('braShout', mid(r), 35, [10, 25], [14.5, 19])), E('braBall', mid(PITCH_AT), 45, [10, 25], [14.5, 19.5]),
  // the candangos' camp: a hammer on planks by day, a radio in the evening
  E('braPlank', mid(CAMP), 35, [20, 50], [7, 17]), E('braRadio', mid(CAMP), 30, [40, 90], [6, 22]),
];

// ── the streets ────────────────────────────────────────────────────────────────────────
export function streetTrack() { return null; }
const along = (pts, rnd) => (rnd() < 0.5 ? pts : [...pts].reverse());
/** A run along the carriageway or the avenue nearest to (x, z): { pts } or null. */
function roadAlong(x, z, rnd, lead) {
  const lim = RADIUS - 40;
  for (const c of [(ROAD_N[1] + ROAD_N[3]) / 2, (ROAD_S[1] + ROAD_S[3]) / 2]) {
    if (Math.abs(z - c) < 90 && x > ROAD_N[0] && x < ROAD_N[2]) { const o = (rnd() - 0.5) * 16, a = Math.max(ROAD_N[0] + 20, x - lead * (0.5 + rnd())), b = Math.min(ROAD_N[2] - 20, x + lead * (0.5 + rnd())); if (b - a > 12) return { pts: along([[a, c + o], [b, c + o]], rnd) }; }
  }
  const ax = (AVENUE[0] + AVENUE[2]) / 2;
  if (Math.abs(x - ax) < 90 && z > AVENUE[1]) { const o = (rnd() - 0.5) * 12, a = Math.max(AVENUE[1] + 10, z - lead * (0.5 + rnd())), b = Math.min(lim, z + lead * (0.5 + rnd())); if (b - a > 12) return { pts: along([[ax + o, a], [ax + o, b]], rnd) }; }
  return null;
}
export const TRACKS = [
  { key: 'cars', voice: 'braTraffic', speed: 9, r50: 55, gap: [6, 18], ok: () => true, get: (x, z, rnd) => roadAlong(x, z, rnd, 70) },
];
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;

// ── the planting ─────────────────────────────────────────────────────────────────────
/** 0…1: how green (x, z) is: the quadras' belts of trees, the lawn, the Square and the apron's pavings least. */
export function treeness(x, z) {
  if (SQS.some((q) => inRect(q, x, z))) return 0.8;
  if (inRect(LAWN, x, z)) return 0.35;
  if (inRect(PRACA, x, z)) return 0.1;
  return 0.25;
}
/** A tree to put a cicada in near (x, z): none for the engine's own seasonal-bird call (reach 40: the cuckoo, oriole, magpie and tit of the Chinese gardens). */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach === 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.3 + 0.5 * rnd()) return [px, pz];
  }
  return null;
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export function leafNear(x, z) { return Math.min(1, 0.1 + 0.6 * treeness(x, z)); }
export function greenNear(x, z) { return Math.max(0.12, treeness(x, z)); }
export const frogGround = () => 0;
/** 0…1: how much of the city's hubbub reaches (x, z): the strip and the quadras busiest by day, the lawn and the Square quiet, the night a murmur. */
export function townNear(x, z) {
  const h = clock.hour, day = h >= 7 && h < 18.5 ? 1 : h >= 18.5 && h < 23 ? 0.5 : 0.2;
  let w = 0.35;
  if (SQS.some((q) => inRect(q, x, z, 20))) w = 0.8;
  else if (inRect([AVENUE[0] - 10, AVENUE[1], AVENUE[2] + 30, AVENUE[3]], x, z)) w = 1;
  else if (inRect(PRACA, x, z)) w = 0.5;
  else if (inRect(LAWN, x, z)) w = 0.4;
  return day * w;
}

// ── the rooms ─────────────────────────────────────────────────────────────────────────
/** The room the listener is in, or null: { use, at, upper, same } — a shop, a classroom, a hall. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) {
    if (!inRect(s.rect, x, z)) continue;
    const dy = y - s.y;
    if (dy < -1.5) continue;
    if (dy < 4.4) return { use: s.use, at: s.at, upper: false, same: s.id };
  }
  return null;
}
/** The room's own colour and small sounds: `tone` [lowpass Hz, level], `roof` the rain's loudness from inside (a flat slab: dull and loud), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = (tone, roof, hush, work) => ({ tone, roof, hush, work });
const room = (use, tone, hush) => [use, R0(tone, 0.8, hush, (WORK[use] ?? ROOM_WORK[use] ?? []).map(([v, g]) => [v, (g[0] + g[1]) / 2]))];
export const ROOMS = Object.fromEntries([
  ...Object.keys(WORK).map((u) => room(u, [1100, 0.4], 0.75)),
  room('class', [1200, 0.4], 0.5), room('office', [1300, 0.35], 0.6), room('cantina', [1000, 0.4], 0.5),
  room('salao', [700, 0.3], 0.3), room('museum', [900, 0.3], 0.4), room('chapel', [600, 0.3], 0.3),
  ['senate', R0([500, 0.3], 0.3, 0.2, [['braGavel', 40]])], ['nave', R0([420, 0.3], 0.1, 0.12, [])],
]);
export const UPPER = R0([800, 0.25], 1.0, 0.5, []);
