// Where Sydney's sounds are (docs/settlements/sydney.md §14): the places the audio engine needs to put each sound where it is made — the
// ferries' horns at the wharves and their engines on the harbour's lanes, the electric trains of the quay's station, the traffic of the
// streets, the Cahill Expressway and the Harbour Bridge, the gulls at the water, the Garden's magpies, cockatoos and kookaburras, the
// didgeridoo on the forecourt, the Point's halyards in Farm Cove, the hotel, milk bar, espresso bar, shops and tenants' houses one can
// enter, the Concert Hall tuning. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's
// `LIFE.map`) and played by src/engine/voices-sydney.js. Coordinates: metres, +x east, +z south, the settlement's frame.
// [inferred throughout: no recording of 1973 Circular Quay is kept. What the sources give is marked [stated] in the dossier §14.]
import { RADIUS, OPERA, QUAY, GARDEN, MACQUARIE, BENNELONG, BRIDGE, shore, height, inRect, lots, streetCells } from './layout.js';

/** Where the audio puts the listener when the engine gives none: the arrival, at the sea wall of Mrs Macquarie's Point. */
export const HOME = [222, -116];
export const schedule = 'sydPlaced';
export const clock = { hour: 12 };
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

const [ox0, oz0, ox1, oz1] = OPERA.rect, CW = ox0 + 21, CE = ox1 - 21;
/** The Opera House's two halls (plan.js rooms): the Concert Hall and the Opera Theatre. */
export const HALLS = [
  { use: 'concert', rect: [CW - 9.8, oz1 - 91, CW + 9.8, oz1 - 33], id: 'room:concert' },
  { use: 'theatre', rect: [CE - 8.7, oz1 - 85, CE + 8.7, oz1 - 37], id: 'room:theatre' },
];
const FLOOR_Y = () => height(100, -190) + OPERA.h;

// ── the shops and houses one can enter, and what each makes heard ─────────────────────
/** [voice, gap in seconds [min, max], hours [from, to]]. The trades' hours are those of the day: shops 8 to 17.30, the milk and espresso bars and the fish-and-chip shop into the evening, the hotel to its 10 pm closing [inferred]. */
const WORK = {
  pub: [['sydPubTalk', [8, 20], [10, 22]], ['sydJukebox', [70, 150], [11, 22]]],
  milkbar: [['sydJukebox', [60, 130], [6, 21.5]], ['kitchen', [20, 45], [6, 21.5]], ['sydTill', [30, 70], [6, 21.5]]],
  espresso: [['sydEspresso', [30, 70], [7, 22]], ['sydPubTalk', [14, 32], [7, 22]], ['sydJukebox', [90, 180], [9, 22]]],
  newsagent: [['sydTill', [40, 90], [7, 17.5]], ['paper', [30, 70], [7, 17.5]]],
  butcher: [['sydCleaver', [14, 34], [7, 17.5]], ['sydTill', [50, 100], [7, 17.5]]],
  chemist: [['drawer', [40, 90], [8.5, 17.5]], ['sydTill', [60, 120], [8.5, 17.5]]],
  barber: [['scissors', [8, 18], [8, 17.5]], ['sydTill', [80, 160], [8, 17.5]]],
  greengrocer: [['sack', [20, 50], [7, 17.5]], ['sydTill', [40, 90], [7, 17.5]]],
  fish_chips: [['sydFryer', [16, 38], [11, 21.5]], ['sydTill', [40, 90], [11, 21.5]]],
  hardware: [['hammer', [30, 70], [7.5, 17.5]], ['drawer', [30, 70], [7.5, 17.5]]],
  bakery: [['kitchen', [16, 36], [5, 17]], ['sydTill', [40, 90], [5, 17]]],
  terrace: [['sydTelly', [50, 110], [17.5, 22.5]], ['sydKettle', [60, 140], [6, 9]], ['broom', [60, 120], [7, 11]]],
};
const kindOf = (l) => (l.t === 'espresso_bar' ? 'espresso' : l.t === 'rocks_terrace' ? 'terrace' : l.kind);
let SITES = null;
/** The rooms with sounds: { use, rect, at, id, y (the floor), upper (an open upper floor), work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!(l.t === 'shop_room' || l.t === 'espresso_bar' || (l.t === 'rocks_terrace' && l.enter === 0))) continue;
    const use = kindOf(l);
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, y: l.y, upper: !!l.up, work: (WORK[use] ?? []).map(([v, g, h]) => [v, g, h]) });
  }
  for (const h of HALLS) SITES.push({ use: h.use, rect: h.rect, at: mid(h.rect), id: h.id, y: null, upper: false, work: [] });
  return SITES;
}
export const WELLS = [];
export const TEMPLE = null;
export const FAR = { tower: [0, -1900], bell: [0, -1900] };

// ── the open emitters ──────────────────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const WHARVES = [-36, -18, 0, 18];
const hall = (h) => mid(h.rect);
export const EMITTERS = [
  // the ferries' horns at the four wharves of Circular Quay, from the first boat to the last
  ...WHARVES.map((x, i) => E('sydFerryHorn', [x, -52], 130, [50 + 10 * i, 110 + 10 * i], [5.5, 23.5], { lv: 0.9 })),
  // the electric trains in and out of the quay's elevated station, under the Cahill Expressway
  E('sydTrain', [-4, 16], 90, [40, 100], [4.5, 24.5], { lv: 1 }), E('sydTrain', [-4, 16], 90, [90, 200], [0, 1.5], { lv: 0.8 }),
  // gulls on the wharves and the quay, along the Point's wall and at the Rocks' piles
  E('sydGull', [-10, -30], 70, [9, 24], [5.5, 19], { rainMax: 0.8 }), E('sydGull', [235, -112], 60, [12, 30], [5.5, 19], { rainMax: 0.8 }), E('sydGull', [-180, -112], 60, [16, 40], [5.5, 19], { rainMax: 0.8 }),
  // the Garden's birds: magpies on the lawns, cockatoos in the figs, kookaburras (at dawn and dusk), lorikeets in the flowering trees
  E('sydMagpie', [280, 50], 70, [24, 60], [5, 11], { rainMax: 0.3, after: true }), E('sydMagpie', [276, -118], 60, [40, 90], [5.5, 18], { rainMax: 0.3, after: true }),
  E('sydCockatoo', [250, 20], 80, [26, 70], [6, 18.5], { rainMax: 0.4 }), E('sydCockatoo', [200, -20], 70, [40, 100], [6, 18.5], { rainMax: 0.4 }),
  E('sydKookaburra', [300, 90], 90, [60, 140], [4.8, 6.8], { rainMax: 0.3, after: true }), E('sydKookaburra', [300, 90], 90, [60, 140], [17, 19], { rainMax: 0.3, after: true }),
  E('sydLorikeet', [260, 80], 60, [28, 70], [6, 18], { rainMax: 0.3 }), E('sydLorikeet', [196, 10], 50, [40, 90], [6, 18], { rainMax: 0.3 }),
  // the didgeridoo and clapsticks of a busker on the Opera House forecourt (§9), by day and into the evening
  E('sydDidgeridoo', [100, oz1 + OPERA.stair + 8], 45, [110, 220], [10, 19], { rainMax: 0.15, after: true }),
  // the halyards of the yachts moored in Farm Cove
  E('sydHalyards', [235, -70], 60, [5, 12], [0, 24], { rainMax: 0.9 }), E('sydHalyards', [190, -140], 50, [8, 18], [0, 24], { rainMax: 0.9 }),
  // building works in the city: a drill and a pile-driver by day
  E('sydDrill', [-110, 110], 80, [30, 70], [7.5, 16.5], { rainMax: 0.3 }), E('sydDrill', [60, 250], 80, [40, 90], [7.5, 16.5], { rainMax: 0.3 }),
  // a car's horn here and there in the city
  E('sydHorn', [-40, 80], 80, [20, 60], [6, 24], { lv: 0.9 }), E('sydHorn', [30, 160], 80, [24, 70], [6, 24], { lv: 0.9 }),
  // the Concert Hall's tuning before an evening performance and before the matinee, the theatre's bell on the forecourt before the curtain
  E('sydTuning', hall(HALLS[0]), 22, [40, 90], [18, 19.4], { inside: 'room:concert', after: true }), E('sydTuning', hall(HALLS[0]), 22, [40, 90], [12.8, 13.8], { inside: 'room:concert', after: true }),
  E('sydTheatreBell', [100, oz1 + 6], 45, [30, 60], [19.3, 19.6], { after: true }),
];

// ── the streets, the harbour's lanes, the Bridge and the Expressway ─────────────────────
export function streetTrack() { return null; }
/** A path along the nearest north–south or east–west street cell to (x, z) (the cells of layout.js `streetCells`): { pts } or null. */
function roadAlong(x, z, rnd, reach, lead) {
  const { xs, zs } = streetCells();
  let best = null;
  for (const [a, b, c] of xs) { const d = Math.abs(x - c); if (d < reach && Math.abs(z - 120) < 330 && (!best || d < best.d)) best = { d, ax: true, c }; }
  for (const [a, b, c] of zs) { const d = Math.abs(z - c); if (d < reach && (!best || d < best.d)) best = { d, ax: false, c }; }
  if (!best) return null;
  const dir = rnd() < 0.5 ? 1 : -1, o = (rnd() - 0.5) * 8, t0 = best.ax ? z : x, lim = RADIUS - 60;
  const a = Math.max(-lim, Math.min(lim, t0 - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(-lim, Math.min(lim, t0 + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 12) return null;
  return best.ax ? { pts: [[best.c + o, Math.max(-100, a)], [best.c + o, Math.max(-100, b)]] } : { pts: [[a, best.c + o], [b, best.c + o]] };
}
const along = (pts, rnd) => (rnd() < 0.5 ? pts : [...pts].reverse());
const FERRY_LANES = [[[-14, -62], [12, -190], [30, -330]], [[-170, -318], [10, -310], [200, -304]]];
export const TRACKS = [
  { key: 'cars', voice: 'sydTraffic', speed: 7.5, r50: 55, gap: [7, 20], ok: () => true, get: (x, z, rnd) => roadAlong(x, z, rnd, 45, 70) },
  { key: 'bridge', voice: 'sydBridge', speed: 14, r50: 130, gap: [8, 22], ok: () => true, get: (x, z, rnd) => (rectDist([BRIDGE.x - 8, BRIDGE.z0, BRIDGE.x + 8, BRIDGE.z1 + BRIDGE.approach], x, z) > 280 ? null : { pts: along([[BRIDGE.x + (rnd() < 0.5 ? -4.5 : 4.5), BRIDGE.z0 + 20], [BRIDGE.x + (rnd() < 0.5 ? -4.5 : 4.5), BRIDGE.z1 + BRIDGE.approach - 20]], rnd) }) },
  { key: 'expressway', voice: 'sydTraffic', speed: 12, r50: 75, gap: [10, 26], ok: () => true, get: (x, z, rnd) => (rectDist(QUAY, x, z) > 220 ? null : { pts: along([[QUAY[0] + 4, 16 + (rnd() - 0.5) * 8], [QUAY[2] - 4, 16 + (rnd() - 0.5) * 8]], rnd) }) },
  { key: 'ferry', voice: 'sydFerry', speed: 6.5, r50: 110, gap: [45, 110], ok: (h, rain) => h >= 5.5 && h < 23.5 && rain < 0.97, get: (x, z, rnd) => ({ pts: along(FERRY_LANES[rnd() < 0.55 ? 0 : 1], rnd) }) },
  { key: 'hydrofoil', voice: 'sydHydrofoil', speed: 14, r50: 120, gap: [150, 330], ok: (h, rain) => h >= 7 && h < 19 && rain < 0.5, get: (x, z, rnd) => ({ pts: along([[-6, -64], [4, -200], [60, -330]], rnd) }) },
];
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const pondSpot = () => null;
/** A place on the sea wall near (x, z) for the water to lap: a point within 6 to 30 m where the land meets the harbour, or null. */
export function shoreSpot(x, z, rnd) {
  for (let k = 0; k < 14; k++) {
    const a = rnd() * Math.PI * 2, d = 6 + rnd() * 24, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 60 && Math.abs(shore(px, pz) + 0.5) < 1.2) return [px, pz];
  }
  return null;
}

// ── the planting ─────────────────────────────────────────────────────────────────────
/** 0…1: how green (x, z) is: the Garden's lawns and figs, the Point, the Domain's edge; the city's blocks little. */
export function treeness(x, z) {
  if (inRect(GARDEN, x, z)) return 0.9;
  if (inRect(MACQUARIE, x, z)) return 0.75;
  return Math.max(0.08, 0.5 * (1 - sm(0, 40, Math.min(rectDist(GARDEN, x, z), rectDist(MACQUARIE, x, z)))), shore(x, z) < 0 ? 0 : 0.1);
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
export function greenNear(x, z) { return shore(x, z) < -2 ? 0.05 : Math.max(0.12, treeness(x, z)); }
export const frogGround = () => 0;
/** 0…1: how much of the city's hubbub reaches (x, z): the streets and the quay loudest by day, a murmur at night, the Garden and the Point quiet. */
export function townNear(x, z) {
  const h = clock.hour, day = h >= 7 && h < 18 ? 1 : h >= 18 && h < 23 ? 0.6 : 0.3;
  let w = 0.55;
  if (inRect(GARDEN, x, z) || inRect(MACQUARIE, x, z)) w = 0.3;
  else if (inRect(BENNELONG, x, z)) w = 0.45;
  else if (shore(x, z) < 0) w = 0.25;
  else if (z > 0 || inRect(QUAY, x, z, 20)) w = 1;
  else if (x < -100) w = 0.6;
  return day * w;
}

// ── the rooms ─────────────────────────────────────────────────────────────────────────
/** The room the listener is in, or null: { use, at, upper, same } — a shop, a house, the Concert Hall, the Opera Theatre. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) {
    if (!inRect(s.rect, x, z)) continue;
    if (s.y === null) return y > FLOOR_Y() - 1 && y < FLOOR_Y() + 14 ? { use: s.use, at: s.at, upper: false, same: s.id } : null;
    const dy = y - s.y;
    if (dy < -1.5) continue;
    if (dy < 4.4) return { use: s.use, at: s.at, upper: false, same: s.id };
    if (s.upper && dy < 9.5) return { use: s.use, at: s.at, upper: true, same: s.id };
  }
  return null;
}
/** The room's own colour and small sounds: `tone` [lowpass Hz, level], `roof` the rain's loudness from inside (iron roofs are loud), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
const R0 = (tone, roof, hush, work) => ({ tone, roof, hush, work });
export const ROOMS = {
  pub: R0([700, 0.5], 0.6, 0.5, [['sydPubTalk', 10]]),
  milkbar: R0([1100, 0.4], 0.7, 0.7, [['sydJukebox', 80], ['sydTill', 40]]),
  espresso: R0([1000, 0.45], 0.7, 0.65, [['sydEspresso', 40], ['sydPubTalk', 14]]),
  newsagent: R0([1300, 0.35], 0.7, 0.8, [['sydTill', 50], ['paper', 30]]),
  butcher: R0([900, 0.4], 0.7, 0.75, [['sydCleaver', 20]]),
  chemist: R0([1400, 0.3], 0.7, 0.8, [['drawer', 50]]),
  barber: R0([1200, 0.3], 0.7, 0.8, [['scissors', 10]]),
  greengrocer: R0([1200, 0.35], 0.7, 0.8, [['sack', 30]]),
  fish_chips: R0([900, 0.45], 0.7, 0.7, [['sydFryer', 20]]),
  hardware: R0([1100, 0.35], 0.7, 0.8, [['hammer', 40], ['drawer', 40]]),
  bakery: R0([1000, 0.4], 0.7, 0.75, [['kitchen', 20]]),
  terrace: R0([800, 0.3], 1.4, 0.55, [['sydTelly', 70], ['sydKettle', 90], ['broom', 80]]),            // (a corrugated-iron roof over the ceiling: the rain loud)
  concert: R0([420, 0.3], 0.1, 0.12, [['sydTuning', 120]]),
  theatre: R0([380, 0.3], 0.1, 0.12, [['paper', 90]]),
};
export const UPPER = R0([800, 0.25], 1.5, 0.5, [['sydTelly', 90], ['paper', 60]]);
void hash; void ox1; void oz0;
