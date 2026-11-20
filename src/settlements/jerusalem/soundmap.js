// Where the sounds of Umayyad Jerusalem are (docs/settlements/jerusalem.md §12.3): the places of its emitters and the geometry the audio engine needs to
// put each sound where it is made — the readers and doves of the Haram, the cisterns and the waqf's water, the coppersmiths, potters and weavers of the
// Cardo's shops and of the houses, the oil crushers, the hawkers of the Cardo and the market street, the caravans at the gates, the plainchant and the
// semantron of the Holy Sepulchre, the jackals on the Mount of Olives at night, the rooms one can be inside. Pure data and functions of layout.js (no
// three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js with the voices of
// src/engine/voices-jerusalem.js. Coordinates: metres, +x east, +z south, the settlement's own frame.
// What the engine's scheduler asks of a map and Jerusalem has not (boats, ponds, canals, bamboo, frogs, a vendor's walk of the Chinese streets) is answered
// with nothing; the hours of the call to prayer are the engine's (the profile's `adhan`).

import { HARAM, AQSA, CARDO, CARDO_HALF, SEPULCHRE, SEP_Y, STREET, LODGES, gardens, inRect, smooth } from './layout.js';
import { allColonnades, colKey, shopsOf, TRADES_OF } from './shopline.js';
import { openLots, upLots, tradeOf } from './openlots.js';

/** Where the audio puts the listener when the engine gives none (the arrival, on the esplanade before the Dome). */
export const HOME = [-67.6, -40];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** The rooms of the great buildings. The Dome of the Rock: the octagon about (0, -20), its floor on the platform 18 m up; the al-Aqsa: the hypostyle; the Holy Sepulchre: the basilica and the rotunda (not the atrium). */
export const DOME_C = [0, -20], DOME_R = 23.5, PLATFORM_Y = HARAM.top + 4;
export const CHURCH = [SEPULCHRE[0] + 2, SEPULCHRE[1] + 2, SEPULCHRE[2] - 17 - 14, SEPULCHRE[3] - 2];
const aqsaY = HARAM.top;

/** The open houses' rooms (as the style's openLayout lays them out): the main room on the north, the court, the store on the west. */
function houseRooms(l) {
  const [x0, z0, x1, z1] = l.rect, W = x1 - x0, D = z1 - z0, T = 0.65;
  const dN = clamp(D * 0.36, 4.2, 5.4), dW = clamp(W * 0.27, 3.4, 4.2), xc0 = x0 + dW, xc1 = x1 - 3.4, zc0 = z0 + dN;
  return { room: [x0 + T, z0 + T, x1 - T, zc0 - T], court: [xc0, zc0, xc1, z1 - T], store: [x0 + T, zc0, xc0 - T, z1 - T] };
}
/** The open houses: [{ lot, rect, rooms, trade, up }] (docs §5a, §5b, §5d). */
let HOUSES = null;
export function openHouses() {
  if (HOUSES) return HOUSES;
  const open = new Set(openLots()), ups = new Map(upLots().map((u) => [u.lot, u.up]));
  return (HOUSES = [...open].map((l) => ({ lot: l, rect: l.rect, rooms: houseRooms(l), up: ups.get(l) ?? null, trade: tradeOf(l, open, ups.get(l) ?? null) })));
}

/** The work heard from each trade's shop: [voice, gap [min, max] s, hours [from, to]]. [inferred from the trade] */
const SHOP_WORK = {
  copper: [['jerCopper', [9, 24], [7.5, 17.5]]],
  pottery: [['wheel', [24, 50], [7.5, 17]]],
  cloth: [['clothRustle', [22, 50], [7.5, 18]]],
  grain: [['sack', [34, 80], [7, 17.5]]],
  oil: [['pour', [30, 70], [7.5, 17.5]]],
  glass: [['bowlClack', [30, 70], [7.5, 17.5]]],
  bread: [['jerTabun', [14, 26], [4.5, 11]]],
  spice: [['mortar', [16, 36], [7.5, 17.5]]],
  produce: [],
};
const HOUSE_WORK = {
  weaver: [['loom', [12, 30], [6.5, 17.5]]], potter: [['wheel', [22, 46], [6.5, 17]]], dyer: [['pour', [20, 50], [6.5, 17]]],
  oil: [['jerOilMill', [30, 70], [7, 17]]], copper: [['jerCopper', [9, 24], [7, 17.5]]], plain: [['clothRustle', [40, 90], [7, 18]]],
};
const LODGE_WORK = {
  glass: [['jerGlass', [14, 30], [6, 18]]], perfume: [['mortar', [18, 40], [7, 17.5]]], wick: [['clothRustle', [24, 50], [6.5, 17.5]]],
  oil: [['jarLid', [30, 70], [7, 17]]], gate: [['broom', [60, 120], [5.5, 9]]], home: [['kitchen', [20, 45], [5.5, 19.5]]],
};

let SITES = null;
/** The rooms with sounds: { use, rect, at, id, work, y } — the Cardo's and the market street's shops that are entered (each by its trade), the open houses' main rooms (by their trade), the Haram's lodges. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const el of allColonnades()) for (const s of shopsOf(el, TRADES_OF[colKey(el)] ?? '')) {
    if (!s.trade) continue;
    SITES.push({ use: 'shop:' + s.trade, rect: s.rect, at: s.at, id: `shop:${Math.round(s.at[0])},${Math.round(s.at[1])}`, work: SHOP_WORK[s.trade] || [], y: el.y ?? 0 });
  }
  for (const h of openHouses()) {
    const k = h.trade ?? 'plain';
    SITES.push({ use: 'house:' + k, rect: h.rooms.room, at: mid(h.rooms.room), id: `house:${h.lot.seed}`, work: HOUSE_WORK[k], y: h.lot.y });
  }
  for (const l of LODGES) {
    const [x0, z0, x1, z1] = l.rect, d = z1 - z0, W = x1 - x0, T = 0.65, dN = clamp(d * 0.36, 4.2, 5.4), r = [x0 + T, z0 + T, x1 - T, z0 + dN - T];
    void W;
    SITES.push({ use: 'lodge:' + l.use, rect: r, at: mid(r), id: `lodge:${l.seed}`, work: LODGE_WORK[l.use] || [], y: HARAM.top });
  }
  return SITES;
}

/** The cisterns' heads and the wells (the engine's bucket on its rope): the seven heads on the esplanade (haram-detail.js), the palaces' courts, the Holy Sepulchre's yard. */
export const CISTERNS = [[-95, 70], [100, 60], [-100, -140], [85, -150], [-60, 150], [120, 150], [110, -80]];
export const WELLS = [...CISTERNS, [-68, 262], [30, 253], [SEPULCHRE[0] + 48 + 20, SEPULCHRE[3] - 5]];
/** The waqf's drinking water on the esplanade (platform-detail.js). */
export const WATER_STATIONS = [[-60, -29], [58, -9], [-30, 100.6], [30, 100.6]];

// ── the rooms ────────────────────────────────────────────────────────────────
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: dome (the Dome of the Rock), aqsa, church (the basilica and
 * the rotunda), shop:<trade> (a shop of the Cardo or the market street), house:<trade|plain> (an open house's main room), lodge:<use> (the Haram's lodges).
 */
export function roomAt(x, z, y = 0) {
  if (Math.hypot(x - DOME_C[0], z - DOME_C[1]) < DOME_R && y > PLATFORM_Y - 1) return { use: 'dome', at: DOME_C, upper: false, same: 'dome' };
  if (inRect(AQSA, x, z) && y > aqsaY - 1 && y < aqsaY + 12) return { use: 'aqsa', at: mid(AQSA), upper: false, same: 'aqsa' };
  if (inRect(CHURCH, x, z) && y > SEP_Y - 1 && y < SEP_Y + 14) return { use: 'church', at: [(CHURCH[0] + CHURCH[2]) / 2, (CHURCH[1] + CHURCH[3]) / 2], upper: false, same: 'church' };
  for (const s of sites()) if (inRect(s.rect, x, z) && y < s.y + 8) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.4, same: s.id };
  return null;
}
/** What each room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is (a plastered flat roof of beams and reeds: dull; a lead roof over timber), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['clothRustle', 60]] };
export const ROOMS = {
  dome: { tone: [220, 0.3], roof: 0.45, hush: 0.4, work: [['jerRecite', 90], ['clothRustle', 80]] },
  aqsa: { tone: [200, 0.28], roof: 0.55, hush: 0.45, work: [['jerRecite', 100], ['broom', 140]] },
  church: { tone: [190, 0.3], roof: 0.5, hush: 0.45, work: [['clothRustle', 70], ['jarLid', 140]] },
  'shop:copper': { tone: [420, 0.4], roof: 0.7, hush: 1.0, work: [['jerCopper', 16]] },
  'shop:pottery': { ...R0, work: [['wheel', 30]] },
  'shop:cloth': { tone: [300, 0.25], roof: 0.7, hush: 0.85, work: [['clothRustle', 30]] },
  'shop:grain': { ...R0, work: [['sack', 40]] },
  'shop:produce': { ...R0, work: [['clothRustle', 70]] },
  'shop:oil': { ...R0, work: [['pour', 40], ['jarLid', 70]] },
  'shop:glass': { tone: [360, 0.3], roof: 0.7, hush: 0.9, work: [['bowlClack', 30]] },
  'shop:bread': { tone: [360, 0.35], roof: 0.7, hush: 0.9, work: [['jerTabun', 18]] },
  'shop:spice': { tone: [280, 0.25], roof: 0.7, hush: 0.8, work: [['mortar', 20], ['drawer', 70]] },
  'house:plain': { ...R0, work: [['broom', 90]] },
  'house:weaver': { ...R0, work: [['loom', 14]] },
  'house:potter': { ...R0, work: [['wheel', 26]] },
  'house:dyer': { ...R0, work: [['pour', 28]] },
  'house:oil': { tone: [260, 0.3], roof: 0.7, hush: 0.8, work: [['jerOilMill', 34]] },
  'house:copper': { tone: [420, 0.4], roof: 0.7, hush: 0.9, work: [['jerCopper', 16]] },
  'lodge:glass': { tone: [380, 0.35], roof: 0.7, hush: 0.9, work: [['jerGlass', 18]] },
  'lodge:perfume': { ...R0, work: [['mortar', 24]] },
  'lodge:wick': { ...R0, work: [['clothRustle', 34]] },
  'lodge:oil': { ...R0, work: [['jarLid', 40], ['pour', 60]] },
  'lodge:gate': { ...R0, work: [['broom', 90]] },
  'lodge:home': { tone: [420, 0.45], roof: 0.8, hush: 0.8, work: [['kitchen', 16], ['pour', 40]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the waters, the planting, the town ───────────────────────────────────────
// No canal, pond or boats (the Kidron brook runs only in the winter rains and is not heard), no bamboo, no frogs: the engine's questions are answered with nothing.
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

let ORCHARDS = null;
const orchards = () => (ORCHARDS ||= gardens().filter((g) => g.kind === 'orchard' || g.kind === 'terrace'));
/** Is there a tree at (x, z): the olive groves of the Kidron's far slope and of the terraces, the orchards of the lots, the cypresses and olives thinly on the esplanade's edge. */
function treeAt(x, z) {
  if (x > 175 && x < 400 && Math.abs(z) < 340) return hash(Math.floor(x / 9), Math.floor(z / 9), 3) < 0.45;
  if (inRect(HARAM.rect, x, z, -4)) return hash(Math.floor(x / 14), Math.floor(z / 14), 5) < 0.12 && !inRect([-70, -80, 70, 40], x, z, 4) && !inRect(AQSA, x, z, 12);
  for (const g of orchards()) if (inRect(g.rect, x, z)) return true;
  return false;
}
/** 0…1: how much green round (x, z), for the insects: the olive groves across the Kidron, the orchards and gardens of the lots, the esplanade's trees a little. */
export function greenNear(x, z) {
  if (x > 160) return 0.35 + 0.55 * smooth(160, 240, x);
  let g = 0.12;
  for (const o of orchards()) { const d = rectDist(o.rect, x, z); if (d < 30) g = Math.max(g, 0.7 * (1 - smooth(0, 30, d))); }
  if (inRect(HARAM.rect, x, z)) g = Math.max(g, 0.25);
  return g;
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (treeAt(px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all in the Cardo and the market street, some in the courts, the Haram's crowd a little, little at the rim and in the groves. */
export function townNear(x, z) {
  if (Math.abs(x - CARDO.x) < CARDO_HALF + 4 && z > -300 && z < 300) return 1;
  if (z > -STREET.half && z < STREET.half && x > STREET.x0 - 4 && x < STREET.x1 + 4) return 1;
  if (inRect(HARAM.rect, x, z)) return 0.3;
  return Math.max(0.1, 0.7 * (1 - 0.7 * smooth(60, 330, Math.min(Math.abs(x - CARDO.x), Math.abs(z)))));
}

// ── the emitters in the open ─────────────────────────────────────────────────
const ZC = (SEPULCHRE[1] + SEPULCHRE[3]) / 2, ATRIUM = [SEPULCHRE[2] - 17 - 7, ZC], ROTUNDA = [SEPULCHRE[0] + 18.4, ZC];
/** The tracks of a laden donkey led along the Cardo or the street to the Haram, near the listener: { pts } or null. */
export function walkTrack(x, z, rnd, reach = 90, lead = 40) {
  const onCardo = Math.abs(x - CARDO.x) < reach && z > -280 && z < 280, onStreet = z > -reach && z < reach && x > STREET.x0 && x < STREET.x1 + 20;
  if (!onCardo && !onStreet) return null;
  const cardo = onCardo && (!onStreet || Math.abs(x - CARDO.x) < Math.abs(z)), dir = rnd() < 0.5 ? 1 : -1, off = (rnd() - 0.5) * 3;
  if (cardo) { const lo = -280, hi = 280, near = clamp(z, lo, hi), a = clamp(near - dir * lead * (0.5 + 0.7 * rnd()), lo, hi), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), lo, hi); return Math.abs(b - a) < 10 ? null : { pts: [[CARDO.x + off, a], [CARDO.x + off, b]] }; }
  const lo = STREET.x0 + 4, hi = STREET.x1 + 14, near = clamp(x, lo, hi), a = clamp(near - dir * lead * (0.5 + 0.7 * rnd()), lo, hi), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), lo, hi);
  return Math.abs(b - a) < 10 ? null : { pts: [[a, off], [b, off]] };
}
/** A donkey train led along the street, by day, now and then: the engine's own passing sounds for this place (`TRACKS`). */
export const TRACKS = [
  { key: 'donkeys', voice: 'jerDonkeyTrain', speed: 0.95, r50: 12, gap: [40, 110], ok: (hour, rain) => hour >= 6 && hour < 17.5 && rain < 0.5, get: (x, z, r) => walkTrack(x, z, r) },
];

/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] (local; wrapping midnight when from > to), dry,
 * rainMax, lv, after, inside, id }. The shops' and rooms' work comes from sites(). [inferred; the sources for the places and hours are in the dossier §12.3]
 */
const cardoZ = [-250, -170, -90, 30, 110, 190, 260];
export const EMITTERS = [
  // the Haram: the readers at their stands before the Dome's west and south doors; the reciter in the Dome and in the Aqsa (heard from inside); the doves; the attendants sweeping at dawn
  { voice: 'jerRecite', at: [-33, -34], r50: 10, gap: [60, 140], hours: [6, 18], rainMax: 0.4, after: true, id: 'read:w' },
  { voice: 'jerRecite', at: [-33, -6], r50: 10, gap: [70, 150], hours: [6, 18], rainMax: 0.4, after: true, id: 'read:s' },
  { voice: 'jerRecite', at: DOME_C, r50: 14, gap: [60, 140], hours: [4.5, 21], inside: 'dome', lv: 0.8, after: true, id: 'dome:recite' },
  { voice: 'jerRecite', at: [0, 188], r50: 16, gap: [70, 150], hours: [4.5, 21], inside: 'aqsa', lv: 0.8, after: true, id: 'aqsa:recite' },
  { voice: 'jerTalk', at: [-100, -40], r50: 10, gap: [30, 70], hours: [7, 18], rainMax: 0.3, after: true, id: 'circle:1' },
  { voice: 'jerTalk', at: [62, -108], r50: 10, gap: [30, 70], hours: [7, 18], rainMax: 0.3, after: true, id: 'circle:2' },
  { voice: 'jerTalk', at: [-20, 150], r50: 10, gap: [30, 70], hours: [7, 18], rainMax: 0.3, after: true, id: 'circle:3' },
  { voice: 'jerDoves', at: [20, -60], r50: 18, gap: [10, 26], hours: [5.8, 19], rainMax: 0.5, id: 'dove:platform' },
  { voice: 'jerDoves', at: [0, 105], r50: 18, gap: [12, 28], hours: [5.8, 19], rainMax: 0.5, id: 'dove:aqsa' },
  { voice: 'jerDoves', at: [100, -35], r50: 18, gap: [12, 28], hours: [5.8, 19], rainMax: 0.5, id: 'dove:golden' },
  { voice: 'jerDoves', at: [-125, 0], r50: 18, gap: [12, 28], hours: [5.8, 19], rainMax: 0.5, id: 'dove:stair' },
  { voice: 'broom', at: [-45, -30], r50: 8, gap: [60, 150], hours: [5.5, 9], dry: true, id: 'sweep:platform' },
  ...WATER_STATIONS.map((at, i) => ({ voice: i % 2 ? 'jerCup' : 'pour', at, r50: 8, gap: [40, 100], hours: [6, 18], dry: true, id: 'waqf' + i })),
  // the Cardo: the hawkers along its roadway (water, fruit, bread), the market street's; caravans halting at the north and south gates
  ...cardoZ.map((z, i) => ({ voice: ['jerHawkWater', 'jerHawkFruit', 'jerHawkBread'][i % 3], at: [CARDO.x + (i % 2 ? 3 : -3), z], r50: 14, gap: [44, 110], hours: [i % 3 === 2 ? 5.5 : 7, i % 3 === 2 ? 10 : 18], rainMax: 0.5, id: 'hawk' + i })),
  { voice: 'jerHawkFruit', at: [-300, 0], r50: 14, gap: [50, 120], hours: [7, 17], rainMax: 0.5, id: 'hawk:st1' },
  { voice: 'jerHawkWater', at: [-210, 1], r50: 14, gap: [50, 120], hours: [7, 17], rainMax: 0.5, id: 'hawk:st2' },
  { voice: 'jerHawkBread', at: [-335, 0], r50: 14, gap: [50, 120], hours: [5.5, 10], rainMax: 0.5, id: 'hawk:st3' },
  { voice: 'jerCamel', at: [CARDO.x + 6, -300], r50: 18, gap: [26, 70], hours: [5, 19], rainMax: 0.8, id: 'car:camel:n' },
  { voice: 'donkeyBray', at: [CARDO.x - 8, -302], r50: 22, gap: [70, 160], hours: [6, 17], rainMax: 0.6, id: 'car:donkey:n' },
  { voice: 'jerCamel', at: [CARDO.x - 6, 292], r50: 18, gap: [30, 80], hours: [5, 19], rainMax: 0.8, id: 'car:camel:s' },
  { voice: 'donkeyBray', at: [CARDO.x + 8, 290], r50: 22, gap: [80, 170], hours: [6, 17], rainMax: 0.6, id: 'car:donkey:s' },
  // the Holy Sepulchre: the plainchant of the offices at dawn, midday and evening, heard from inside; the semantron over its court at dawn and dusk
  { voice: 'jerPsalm', at: ROTUNDA, r50: 18, gap: [50, 100], hours: [4.8, 7.2], inside: 'church', lv: 0.9, after: true, id: 'church:matins' },
  { voice: 'jerPsalm', at: ROTUNDA, r50: 18, gap: [50, 100], hours: [11.5, 12.6], inside: 'church', lv: 0.9, after: true, id: 'church:sext' },
  { voice: 'jerPsalm', at: ROTUNDA, r50: 18, gap: [50, 100], hours: [16.8, 19], inside: 'church', lv: 0.9, after: true, id: 'church:vespers' },
  { voice: 'jerSemantron', at: ATRIUM, r50: 45, gap: [90, 140], hours: [4.9, 5.1], rainMax: 0.9, after: true, id: 'sem:dawn' },
  { voice: 'jerSemantron', at: ATRIUM, r50: 45, gap: [90, 140], hours: [17.4, 17.6], rainMax: 0.9, after: true, id: 'sem:dusk' },
  // the slope of the Mount of Olives at night: jackals
  { voice: 'jerJackal', at: [320, 40], r50: 90, gap: [90, 220], hours: [20.5, 4.5], rainMax: 0.3, id: 'jackal:1' },
  { voice: 'jerJackal', at: [340, -110], r50: 90, gap: [120, 260], hours: [21.5, 4], rainMax: 0.3, id: 'jackal:2' },
  // the open houses' ovens: bread in the mornings (the clay tabun in each court)
  ...openHouses().map((h) => ({ voice: 'jerTabun', at: [h.rooms.court[2] - 1.2, h.rooms.court[1] + 1.2], r50: 6, gap: [24, 60], hours: [5.5, 9.5], dry: true, id: 'oven:' + h.lot.seed })),
];
