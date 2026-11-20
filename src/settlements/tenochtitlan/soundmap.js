// Where Tenochtitlan's sounds are (docs/settlements/tenochtitlan.md §22): the places of its emitters and the geometry the audio engine needs to
// put each sound where it is made — the huehuetl and the conch trumpets of the Templo Mayor's summit at the hours of the rites, the teponaztli and
// the clay flutes of the calpulli's house of song, the market's murmur (the engine's hubbub, laid by townNear) and its sellers' cries, the canoes
// at the landing stairs and on the canals, the women's metate and the patting of tortillas in the hearth rooms, the trades of the compounds
// (potters, stone-cutters, lapidaries, obsidian knappers), the turkeys of the yards, the owls and the dogs of the night, the rooms one can be inside.
// Pure data and functions of layout.js, market.js and opened.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and
// played by src/engine/voices.js (the voices of src/engine/voices-tenochtitlan.js). Coordinates: metres, +x east, +z south, the settlement's own frame.
// [inferred throughout: no recording of 1519 exists; what each sound is and when rests on the dossier §22.]
//
// What the scheduler of voices.js asks of a map but Tenochtitlan has not is answered with nothing (no bridges' walkers, no street track, no pond,
// no bamboo, no lotus beds).

import { RADIUS, ISLAND, CANALS, MARKET, PRECINCT, TM, SITES as CALPULLI, houses, houseTrade, backRoom, inRect } from './layout.js';
import { stalls, LANDINGS } from './market.js';
import { openSet } from './opened.js';

/** Where the audio puts the listener when the engine gives none (the arrival before the Templo Mayor's twin shrines: planet/arrivals.js). */
export const HOME = [-10, 30];

/** A deterministic 0…1 from numbers (the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The work heard from each trade's compound: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  potter: [['clay', [14, 30], [6.5, 17]]],
  weaver: [['clothRustle', [18, 40], [7, 17.5]]],
  mason: [['chisel', [14, 30], [6.5, 17]]],
  lapidary: [['tncPolish', [20, 44], [7, 17]]],
  feather: [['clothRustle', [30, 70], [7, 17]]],
  cook: [['tncTortilla', [14, 30], [6, 19]]],
  fisher: [['sack', [30, 70], [4.5, 10]]],
  reeds: [['broom', [30, 70], [6.5, 16]]],
  knapper: [['tncKnap', [16, 36], [7, 17]]],
};
/** What every hearth room hears: the maize ground at the metate before the day's first meal, the tortillas patted for each of the three meals, the pots. */
const HEARTH_WORK = [['tncMetate', [26, 60], [4.2, 9.5]], ['tncTortilla', [24, 50], [5.5, 9]], ['tncTortilla', [40, 90], [13, 15]], ['tncTortilla', [30, 70], [17.5, 19.5]], ['kitchen', [26, 60], [5.5, 20]]];

let SITES = null;
/**
 * The rooms with sounds: the hearth room of each compound the visitor can enter (opened.js) — { use, rect, at: [x, z] (the middle), id, work, y }.
 * Its trade's work is heard from it too (the compounds' trades are worked in the patio; the nearest roof is this room's).
 */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const h of openSet()) {
    const r = backRoom(h), t = houseTrade(h), work = [...(TRADE_WORK[t] || []), ...HEARTH_WORK];
    SITES.push({ use: 'hearth', rect: r, at: mid(r), id: 'calli:' + h.seed, work, y: 0.42 });
  }
  return SITES;
}

export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const SUMMIT = TM.h;
/** The huehuetl is beaten beside Huitzilopochtli's door at the summit (styles/aztec/shrines.js huehuetl): x, z. */
const HUEHUETL = [TM.c[0] - TM.top.w / 2 * 0.55 - 1.2, TM.c[1] + TM.top.d / 2 * 0.85 - 2 * (TM.top.d / 2 * 0.38) + 1];
const ROOM_RECTS = [
  ['eagle-house east', 'hall', [118.4, -125.8, 135.6, -104.4], 1.4],
  ['calmecac north', 'hall', [-139.6, -139.6, -84.4, -130.2], 1.2],
  ['calmecac west', 'hall', [-139.6, -130.2, -130.2, -104.4], 1.2],
  ['calmecac east', 'hall', [-93.8, -130.2, -84.4, -104.4], 1.2],
];
/** The two shrines on the Templo Mayor's summit (Tlaloc's north, Huitzilopochtli's south), x 68…92, z ±(2…19.5): rooms one climbs to. */
const SHRINES = [[TM.c[0] - TM.top.w / 2 * 0.55, -TM.top.d / 2 * 0.85, TM.c[0] + TM.top.w / 2 * 0.55, -TM.top.d / 2 * 0.85 + 2 * TM.top.d / 2 * 0.38], [TM.c[0] - TM.top.w / 2 * 0.55, TM.top.d / 2 * 0.85 - 2 * TM.top.d / 2 * 0.38, TM.c[0] + TM.top.w / 2 * 0.55, TM.top.d / 2 * 0.85]];
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: hearth (a compound's back room), hall (the Eagles'
 * and the calmecac's rooms), shrine (on the summit of the Templo Mayor).
 */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  for (const r of SHRINES) if (y > SUMMIT - 2 && inRect(r, x, z)) return { use: 'shrine', at: mid(r), upper: false, same: 'shrine:' + Math.sign(mid(r)[1]) };
  for (const [id, use, r, fy] of ROOM_RECTS) if (inRect(r, x, z) && y < fy + 3) return { use, at: mid(r), upper: false, same: id };
  return null;
}

/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the flat roof is, `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
export const ROOMS = {
  hearth: { tone: [280, 0.3], roof: 0.9, hush: 0.7, work: [['kitchen', 40], ['tncTortilla', 70]] },
  hall: { tone: [190, 0.28], roof: 0.8, hush: 0.55, work: [['clothRustle', 80]] },
  shrine: { tone: [150, 0.3], roof: 0.6, hush: 0.45, work: [['clothRustle', 90]] },
  house: { tone: [280, 0.3], roof: 0.9, hush: 0.7, work: [['kitchen', 40]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the ahuejotes and the gardens of the chinampas at the island's edge, the lanes a little. */
export function greenNear(x, z) { return Math.max(0.18, sm(ISLAND - 70, ISLAND + 10, Math.hypot(x, z)) * 0.9); }
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a bird in, near (x, z): the chinampas' ahuejotes beyond r = 290, or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d, r = Math.hypot(px, pz);
    if (r > 292 && r < ISLAND + 30) return [px, pz];
  }
  return null;
}
/**
 * 0…1: how much of the market's murmur reaches (x, z). Díaz: the market's voices were heard from far off. Full at the tianguis, strong in the
 * precinct's west half and the avenue before it, a quarter across the island, little at the lake's edge.
 */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 24)) return 1;
  const d = rectDist(MARKET, x, z);
  const base = 0.85 * (1 - sm(20, 260, d)) + 0.12;
  const inPrecinct = inRect(PRECINCT, x, z) ? 0.15 : 0;
  return Math.min(1, Math.max(0.15, base + inPrecinct * (1 - sm(-150, 150, x - 0)))) * (Math.hypot(x, z) > RADIUS - 30 ? 0.6 : 1);
}

// ── the water ────────────────────────────────────────────────────────────────
/** The nearest of the canals' stone walls within 24 m: { p: [x, z], d } or null; the lap of the water at the stone. */
export function canalSpot(x, z) {
  let best = null;
  for (const c of CANALS) {
    const qx = Math.max(c[0], Math.min(x, c[2])), qz = Math.max(c[1], Math.min(z, c[3])), d = Math.hypot(qx - x, qz - z);
    if (Math.hypot(qx, qz) < ISLAND - 6 && (!best || d < best.d)) best = { p: [qx, qz], d };
  }
  return best && best.d < 24 ? best : null;
}
export const shoreSpot = () => null;
export const pondSpot = () => null;
/** 0…1: how marshy the ground is (the lake's frogs at night): the island's edge and the chinampas. */
export function frogGround(x, z) { return sm(ISLAND - 90, ISLAND, Math.hypot(x, z)) * (Math.hypot(x, z) < RADIUS ? 1 : 0); }
// what Tenochtitlan has none of (the engine's scheduler asks, and is answered with nothing)
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;

// ── what passes: the canoes of the canals ───────────────────────────────────
/** A reach of the nearest canal within 70 m of the listener for a canoe to pass along: { pts }, along its middle, in either direction, never beyond the island's edge. */
function canoeTrack(x, z, rnd) {
  let best = null;
  for (const c of CANALS) {
    const horiz = c[2] - c[0] > c[3] - c[1], d = rectDist(c, x, z);
    if (d < 70 && (!best || d < best.d)) best = { c, horiz, d };
  }
  if (!best) return null;
  const { c, horiz } = best, lane = horiz ? (c[1] + c[3]) / 2 + (rnd() - 0.5) * 3 : (c[0] + c[2]) / 2 + (rnd() - 0.5) * 3, at = horiz ? x : z, a = at - 50 - rnd() * 30, b = at + 50 + rnd() * 30;
  const clip = (v, q) => { const e = Math.sqrt(Math.max(0, (ISLAND - 8) ** 2 - lane * lane)); return Math.max(-e, Math.min(e, v)); };
  const A = clip(a), B = clip(b);
  if (Math.abs(B - A) < 30) return null;
  const P = (v) => (horiz ? [v, lane] : [lane, v]);
  return { pts: rnd() < 0.5 ? [P(A), P(B)] : [P(B), P(A)] };
}
export const TRACKS = [
  { key: 'canoe', voice: 'tncCanoe', speed: 1.4, r50: 14, gap: [26, 64], ok: (hour, rain) => hour >= 4.5 && hour < 19 && rain < 0.7, get: (x, z, r) => canoeTrack(x, z, r) },
];

// ── the emitters in the open ─────────────────────────────────────────────────
const summit = HUEHUETL, calpulliCourt = CALPULLI.map((q) => [q.x + 19, q.z + 15]);
const firstStall = (trade, k = 0) => stalls().filter((s) => s.trade === trade)[k];
const hawkAt = ['fish', 'fowl', 'cacao', 'cloth', 'feathers', 'maize', 'pots', 'cooked'].map((t, i) => { const s = firstStall(t, i % 2); return s ? [s.cx, s.cz] : null; }).filter(Boolean);
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry` (not in rain),
 * `rainMax`, `lv`, `after` (spaced from the end of a long one). The rooms' own work comes from sites().
 */
export const EMITTERS = [
  // the rites of the Templo Mayor: the great upright drum and the conch trumpets at the summit, at dawn, noon, dusk and the night's watch [Díaz: a drum of enormous size, large and small trumpets]
  ...[[5.4, 6.8], [11.6, 12.6], [17.4, 18.6], [23.4, 24.6]].flatMap(([a, b], i) => [
    { voice: 'tncHuehuetl', at: summit, r50: 95, gap: [60, 140], hours: [a % 24, b % 24], after: true, rainMax: 0.8, lv: i === 3 ? 0.7 : 1 },
    { voice: 'tncConch', at: summit, r50: 110, gap: [90, 200], hours: [a % 24, b % 24], after: true, rainMax: 0.9 },
  ]),
  // the lesser temples' trumpets and the calpulli's drums (the temples of the calpulli's blocks)
  ...calpulliCourt.map((at, i) => ({ voice: 'tncConch', at, r50: 70, gap: [140 + i * 14, 300], hours: [5.4, 6.6], after: true, rainMax: 0.8 })),
  // the house of song: the teponaztli and the clay flutes of the youths' dancing, in the evening
  ...calpulliCourt.map((at, i) => ({ voice: 'tncTeponaztli', at, r50: 34, gap: [60 + i * 6, 150], hours: [17.4, 21.4], after: true, rainMax: 0.5 })),
  ...calpulliCourt.map((at, i) => ({ voice: 'tncFlute', at: [at[0] + 3, at[1] + 2], r50: 22, gap: [80 + i * 9, 190], hours: [17.6, 21], after: true, rainMax: 0.3 })),
  // the market's sellers' cries (wordless; the engine's hubbub is under them), at their stalls
  ...hawkAt.map((at, i) => ({ voice: 'tncCry', at, r50: 15, gap: [20 + i * 3, 60 + i * 6], hours: [6.2, 16.5], rainMax: 0.5 })),
  // the canoes unloading at the landing stairs of the market's quay
  ...LANDINGS.map((z, i) => ({ voice: 'tncCanoe', at: [-217.5, z], r50: 16, gap: [22 + i * 8, 52 + i * 8], hours: [4.5, 14], rainMax: 0.7 })),
  // the turkeys of the yards, the lanes of the compounds near the market and the priests' lane
  ...[[-190, 40], [-112, 20], [-196, 108], [-100, 66], [-176, -30]].map((at, i) => ({ voice: 'tncTurkey', at, r50: 12, gap: [28 + i * 6, 80 + i * 8], hours: [5.5, 18.5], rainMax: 0.6 })),
  // the priests' sweeping of the precinct at dawn
  { voice: 'broom', at: [-30, 20], r50: 18, gap: [30, 80], hours: [4.8, 6.6], dry: true },
  { voice: 'broom', at: [60, -70], r50: 18, gap: [40, 90], hours: [4.8, 6.6], dry: true },
  // owls of the night, an omen to the Mexica, on the island's edge
  { voice: 'tncOwl', at: [-250, -120], r50: 55, gap: [40, 110], hours: [20, 4.5], rainMax: 0.5 },
  { voice: 'tncOwl', at: [180, 150], r50: 55, gap: [50, 130], hours: [20.5, 4], rainMax: 0.5 },
];
