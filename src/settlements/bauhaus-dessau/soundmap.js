// Where Dessau's sounds are (docs/settlements/bauhaus-dessau.md §15.3): the places the audio engine needs to put each sound where it is made — the tram on
// Kothener Strasse and its foot-gong at the stop, bicycles, the odd motor car and the horse carts on the setts, the bells of the old town and the Junkers
// works' siren and aeroplanes, hens in the Törten gardens, the street pumps, children, the ball games on the sports field, the shops, pubs and flats one
// can enter, the school's workshops (the saw, the loom, the anvil), the lecture rooms, the office's typewriters, the Aula's piano, the canteen, the studios'
// gramophones. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices-bauhaus.js. Coordinates: metres, +x east, +z south, the settlement's frame.
// [inferred throughout: no recording of Dessau in 1927 is kept; what the sources give is marked [stated] in the dossier §15.3.]
import { RADIUS, LV, PL, ROADS, ROAD_K, B, TORTEN, TRAM_TRACKS, TRAM_STOP, GARDEN, PINES, inRect, lots } from './layout.js';
import { frontOf } from '../../styles/bauhaus/tenement.js';

/** Where the audio puts the listener when the engine gives none: the arrival, on Mauerstrasse south of the school. */
export const HOME = [-33, 46];
export const schedule = 'bauPlaced';
export const clock = { hour: 12 };
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the rooms of the school (plan.js rooms) and what each makes heard ──
const room = (use, rect, y, work) => ({ use, rect, y, work });
/** [voice, gap in seconds [min, max], hours [from, to]]. The school ran from morning to evening; the canteen at noon and at six; the Aula's piano and the studios' gramophones in the evening (§7). */
export const SCHOOL = [
  room('carpentry', [-16, 15, -5, 23], LV.f0, [['bauSaw', [20, 50], [8, 17.5]], ['plane', [10, 24], [8, 17.5]], ['hammer', [16, 40], [8, 17.5]]]),
  room('carpentry', [-16, 25, -5, 33], LV.f0, [['bauSaw', [30, 70], [8, 17.5]], ['hammer', [14, 36], [8, 17.5]]]),
  room('weaving', [-16, 15, -5, 23], LV.f1, [['loom', [4, 9], [8, 17.5]], ['bauMurmur', [30, 70], [8, 17.5]]]),
  room('weaving', [-16, 25, -5, 33], LV.f1, [['loom', [4, 10], [8, 17.5]]]),
  room('metal', [-16, 15, -5, 23], LV.f2, [['bauAnvil', [12, 30], [8, 17.5]], ['hammer', [14, 34], [8, 17.5]]]),
  room('painting', [-16, 25, -5, 33], LV.f2, [['bauMurmur', [24, 60], [8, 17.5]], ['brush', [16, 40], [8, 17.5]]]),
  room('lecture', [-16, 5, 0, 13], LV.f1, [['bauLecture', [40, 90], [8, 17.5]], ['paper', [20, 50], [8, 17.5]]]),
  room('hall', [-16, 5, 0, 13], LV.f0, []),
  room('hall', [-16, 5, 0, 13], LV.f2, []),
  room('office', [-14, -9, 0, 3], LV.f1, [['bauTypewriter', [14, 34], [8, 17]], ['drawer', [30, 70], [8, 17]]]),
  room('drawing', [-14, -9, 0, 3], LV.f2, [['paper', [20, 50], [8, 18]], ['bauMurmur', [50, 110], [8, 18]]]),
  room('hall', [1, -26, 11, -14], LV.f0, []),
  room('library', [13, -26, 22, -14], LV.f1, [['paper', [24, 60], [8, 21]]]),
  room('drawing', [1, -26, 11, -14], LV.f2, [['paper', [20, 50], [8, 18]]]),
  room('aula', [9, 16, 23, 32], LV.f0, [['bauPiano', [60, 140], [19, 23.5]]]),
  room('aula', [2, 16, 6, 32], LV.f0, [['bauPiano', [90, 180], [19, 23.5]]]),
  room('aula', [26, 18, 32, 30], LV.f0 + 0.9, [['bauPiano', [70, 150], [19, 23.5]]]),
  room('canteen', [34, 16, 40, 32], LV.f0, [['bauCanteen', [8, 20], [11.5, 13.8]], ['bauCanteen', [10, 24], [17.5, 19.5]]]),
  room('studio', [45.5, 9, 49, 11.5], PL.f1, [['bauGramophone', [80, 170], [18, 24]]]),
  room('studio', [45.5, 29, 49, 31.5], PL.f4, [['bauGramophone', [90, 190], [18, 24]]]),
  room('hall', [45.5, 10, 49, 20], PL.f0, [['bauBallGame', [40, 90], [16, 19]]]),
];

// ── the shops and flats of the tenements (every ground floor is hollow and open) ──
const WORK = {
  grocer: [['bauDoorBell', [14, 34], [7, 19]], ['bauTill', [24, 60], [7, 19]], ['bauMill', [30, 70], [7, 18.5]]],
  baker: [['bauDoorBell', [12, 30], [5.5, 19]], ['kitchen', [16, 36], [4.5, 17]], ['bauTill', [30, 70], [5.5, 19]]],
  butcher: [['bauCleaver', [10, 26], [6.5, 18.5]], ['bauDoorBell', [20, 50], [6.5, 18.5]], ['bauTill', [40, 90], [6.5, 18.5]]],
  tobacco: [['bauDoorBell', [18, 44], [7, 19.5]], ['bauTill', [30, 70], [7, 19.5]]],
  hardware: [['hammer', [24, 60], [7, 18.5]], ['drawer', [24, 60], [7, 18.5]], ['bauDoorBell', [24, 60], [7, 18.5]]],
  draper: [['scissors', [10, 22], [8, 18.5]], ['paper', [24, 60], [8, 18.5]], ['bauDoorBell', [24, 60], [8, 18.5]]],
  pub: [['bauPubTalk', [6, 16], [10, 24]], ['bauGlasses', [24, 60], [11, 24]], ['bauGramophone', [80, 160], [17, 24]]],
  flat: [['bauClock', [40, 90], [0, 24]], ['bauGramophone', [100, 220], [17.5, 22.5]], ['broom', [50, 110], [7, 11]], ['kitchen', [40, 90], [6, 8.5]]],
};
let SITES = null;
/** The rooms with sounds: { use, rect, at, id, y (the floor), upper (an open upper floor), work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const s of SCHOOL) SITES.push({ use: s.use, rect: s.rect, at: mid(s.rect), id: `room:${s.use}:${s.rect.join(',')}:${s.y}`, y: s.y, upper: false, school: true, work: s.work });
  for (const l of lots()) {
    const f = frontOf(l), use = l.shop ? f.kind : 'flat';
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, y: 0.12, upper: !l.shop, work: (WORK[use] ?? []).map(([v, g, h]) => [v, g, h]) });
  }
  return SITES;
}
export const WELLS = [];
export const TEMPLE = null;
export const FAR = { tower: [-300, 400], bell: [-300, 400] };

// ── the open emitters ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const PUMPS = [[-18.75, -100], [-86.45, 20], [100, 5.75]];     // the street pumps (town.js streetStuff)
export const EMITTERS = [
  // the tram's foot-gong at the stop east of the school, from the first car to the last
  E('bauTramBell', [TRAM_STOP[0] + 2, -2], 70, [50, 120], [5, 24]),
  // the bells of a church of the old town, far off, from early morning to evening
  E('bauChurchBell', FAR.bell, 520, [420, 700], [6, 21], { rainMax: 0.9, lv: 1.2, after: true }),
  // the works' siren at the changes of shift (Junkers, far to the south-west) [inferred hours]
  E('bauSiren', [-420, 380], 650, [1700, 1800], [5.9, 6.4], { lv: 1.2, after: true }), E('bauSiren', [-420, 380], 650, [1700, 1800], [13.9, 14.4], { lv: 1.2, after: true }), E('bauSiren', [-420, 380], 650, [1700, 1800], [21.9, 22.4], { lv: 1.2, after: true }),
  // hens in the Törten gardens, by day
  ...TORTEN.map((r, i) => E('bauHens', [(r[0] + r[2]) / 2 - 10 + i * 12, (r[1] + r[3]) / 2 + (i === 1 ? 6 : -6)], 36, [14, 36], [5.5, 19], { rainMax: 0.5 })),
  // the street pumps
  ...PUMPS.map(([x, z]) => E('bauPump', [x, z], 22, [90, 240], [6, 19.5], { dry: true })),
  // children in the street after school, a ball game on the sports field in the afternoon
  E('bauChildren', [-35, -30], 40, [40, 100], [13.5, 19], { rainMax: 0.2 }), E('bauChildren', [-85, 25], 40, [50, 120], [13.5, 19], { rainMax: 0.2 }), E('bauChildren', [-18, -70], 40, [50, 120], [13.5, 19], { rainMax: 0.2 }),
  E('bauBallGame', [96, 22], 55, [30, 80], [15, 19.5], { rainMax: 0.2, after: true }),
  // a car's bulb horn here and there
  E('bauHorn', [-60, 20], 70, [60, 160], [6, 22], { lv: 0.9 }), E('bauHorn', [40, 90], 70, [80, 200], [6, 22], { lv: 0.9 }),
];

// ── the streets: the tram on its track, bicycles, motor cars, carts, aeroplanes ──
export function streetTrack() { return null; }
/** A path along the nearest street to (x, z) (the roads of layout.js): { pts } or null. */
function roadAlong(x, z, rnd, reach, lead) {
  let best = null;
  for (const r of ROADS) {
    const ax = r[2] - r[0] > r[3] - r[1], c = ax ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2, d = Math.abs((ax ? z : x) - c);
    if (d < reach && (!best || d < best.d)) best = { d, ax, c, r };
  }
  if (!best) return null;
  const dir = rnd() < 0.5 ? 1 : -1, o = (rnd() - 0.5) * 6, t0 = best.ax ? x : z, lim = RADIUS - 20, lo = best.ax ? best.r[0] : best.r[1], hi = best.ax ? best.r[2] : best.r[3];
  const a = Math.max(lo, Math.max(-lim, Math.min(lim, t0 - dir * lead * (0.5 + 0.7 * rnd())))), b = Math.min(hi, Math.max(-lim, Math.min(lim, t0 + dir * lead * (0.8 + 0.8 * rnd()))));
  if (Math.abs(b - a) < 12) return null;
  return best.ax ? { pts: [[a, best.c + o], [b, best.c + o]] } : { pts: [[best.c + o, a], [best.c + o, b]] };
}
export const TRACKS = [
  // the tram along Kothener Strasse: east on the south track, west on the north (right-hand running)
  { key: 'tram', voice: 'bauTram', speed: 7, r50: 60, gap: [25, 60], ok: (h, rain) => h >= 5 && h < 24.3, get: (x, z, rnd) => {
    if (Math.abs(z - (TRAM_TRACKS[0] + TRAM_TRACKS[1]) / 2) > 170) return null;
    const east = rnd() < 0.5, lead = 100, a = Math.max(-RADIUS + 10, x - lead * (0.5 + rnd())), b = Math.min(RADIUS - 10, x + lead * (0.8 + rnd()));
    if (b - a < 20) return null;
    return east ? { pts: [[a, TRAM_TRACKS[1]], [b, TRAM_TRACKS[1]]] } : { pts: [[b, TRAM_TRACKS[0]], [a, TRAM_TRACKS[0]]] };
  } },
  { key: 'bikes', voice: 'bauBicycle', speed: 4.5, r50: 30, gap: [6, 18], ok: (h, rain) => h >= 5.5 && h < 21 && rain < 0.7, get: (x, z, rnd) => roadAlong(x, z, rnd, 40, 50) },
  { key: 'cars', voice: 'bauCar', speed: 8, r50: 50, gap: [30, 80], ok: (h, rain) => h >= 6 && h < 22, get: (x, z, rnd) => roadAlong(x, z, rnd, 45, 70) },
  { key: 'carts', voice: 'bauCart', speed: 1.8, r50: 28, gap: [30, 80], ok: (h, rain) => h >= 5 && h < 18 && rain < 0.8, get: (x, z, rnd) => roadAlong(x, z, rnd, 35, 32) },
  // a Junkers aeroplane crossing high over the town (the works' airfield lay south of it) [inferred]
  { key: 'aeroplane', voice: 'bauAircraft', speed: 38, r50: 260, gap: [150, 380], ok: (h, rain) => h >= 7 && h < 18.5 && rain < 0.4, get: (x, z, rnd) => { const s = rnd() < 0.5 ? 1 : -1, o = (rnd() - 0.5) * 200; return { pts: [[x - 700 * s, z + o + 300], [x + 700 * s, z + o - 300]] }; } },
];
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;

// ── the planting ──
/** 0…1: how green (x, z) is: the school's garden, the grove, the Törten gardens and the sports field; the streets' lindens a little. */
export function treeness(x, z) {
  if (inRect(PINES, x, z)) return 0.8;
  if (inRect(GARDEN, x, z)) return 0.7;
  if (TORTEN.some((r) => inRect(r, x, z, 14))) return 0.55;
  if (inRect([52, 4, 140, 40], x, z)) return 0.6;
  return 0.25;
}
export function treeSpot() { return null; }
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export function leafNear(x, z) { return Math.min(1, 0.1 + 0.6 * treeness(x, z)); }
export function greenNear(x, z) { return Math.max(0.15, treeness(x, z)); }
export const frogGround = () => 0;
/** 0…1: how much of the town's hubbub reaches (x, z): the streets and the shops loudest by day (the tram, carts, voices), a murmur in the evening, the school's garden and the grove quieter. */
export function townNear(x, z) {
  const h = clock.hour, day = h >= 7 && h < 18.5 ? 1 : h >= 18.5 && h < 23 ? 0.55 : 0.2;
  let w = 0.8;
  if (inRect(PINES, x, z) || TORTEN.some((r) => inRect(r, x, z, 10))) w = 0.4;
  else if (inRect(GARDEN, x, z)) w = 0.5;
  else if (ROADS.some((r) => inRect(r, x, z, 6))) w = 1;
  return day * w * sm(0, 1, 1 - Math.hypot(x, z) / (RADIUS * 1.3));
}

// ── the rooms ──
/** The room the listener is in, or null: { use, at, upper, same }. The school's rooms by floor (the highest floor below the listener), then the tenements' ground floors and flats. */
export function roomAt(x, z, y = 0) {
  let best = null;
  for (const s of sites()) {
    if (!inRect(s.rect, x, z)) continue;
    const dy = y - s.y;
    if (dy < -1.5) continue;
    if (s.school) { if (dy < 4.2 && (!best || s.y > best.y)) best = s; continue; }
    if (dy < 4.4) return { use: s.use, at: s.at, upper: false, same: s.id };
    if (s.upper && dy < 9.5) return { use: s.use, at: s.at, upper: true, same: s.id };
  }
  return best ? { use: best.use, at: best.at, upper: false, same: best.id } : null;
}
/** The room's own colour and small sounds: `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = (tone, roof, hush, work) => ({ tone, roof, hush, work });
export const ROOMS = {
  grocer: R0([1200, 0.35], 0.5, 0.7, [['bauDoorBell', 30], ['bauTill', 50], ['bauMill', 60]]),
  baker: R0([1100, 0.4], 0.5, 0.7, [['kitchen', 22], ['bauTill', 50]]),
  butcher: R0([900, 0.4], 0.5, 0.7, [['bauCleaver', 18]]),
  tobacco: R0([1300, 0.3], 0.5, 0.75, [['bauDoorBell', 40], ['bauTill', 50]]),
  hardware: R0([1100, 0.35], 0.5, 0.75, [['hammer', 40], ['drawer', 40]]),
  draper: R0([1300, 0.3], 0.5, 0.8, [['scissors', 16], ['paper', 40]]),
  pub: R0([700, 0.5], 0.5, 0.5, [['bauPubTalk', 8], ['bauGlasses', 40]]),
  flat: R0([800, 0.3], 0.5, 0.55, [['bauClock', 60], ['broom', 90]]),
  carpentry: R0([900, 0.4], 0.3, 0.3, [['bauSaw', 40], ['plane', 16], ['hammer', 24]]),
  weaving: R0([1000, 0.35], 0.3, 0.3, [['loom', 6]]),
  metal: R0([900, 0.4], 0.3, 0.3, [['bauAnvil', 18], ['hammer', 24]]),
  painting: R0([1200, 0.3], 0.3, 0.35, [['bauMurmur', 40], ['brush', 24]]),
  lecture: R0([1100, 0.3], 0.3, 0.3, [['bauLecture', 60], ['paper', 30]]),
  office: R0([1200, 0.3], 0.3, 0.4, [['bauTypewriter', 20], ['drawer', 50]]),
  drawing: R0([1200, 0.3], 0.3, 0.4, [['paper', 30]]),
  library: R0([1500, 0.25], 0.3, 0.3, [['paper', 40]]),
  aula: R0([700, 0.3], 0.3, 0.25, [['bauPiano', 120]]),
  canteen: R0([800, 0.4], 0.3, 0.35, [['bauCanteen', 16]]),
  studio: R0([1100, 0.3], 0.3, 0.45, [['bauGramophone', 120]]),
  hall: R0([900, 0.3], 0.3, 0.3, []),
};
export const UPPER = R0([800, 0.25], 0.5, 0.5, [['bauGramophone', 140], ['bauClock', 70]]);
void B; void ROAD_K;
