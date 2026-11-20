// Where Alexandria's sounds are (docs/settlements/alexandria.md §16.3): the places of its emitters and the geometry the audio engine needs to put each sound
// where it is made — the harbour's gulls, galleys' pipes, porters, cranes and caulkers; the trumpet at the Lochias; the Pharos' fire; the shrines' sistra
// and the Serapeum's hymns; the Library's readers and the water organ in the Museion's garden; the agora's herald and hawkers; the trades of the shops
// and the households of the houses on the walk; the shaduf and the hens of Rhakotis; the rooms one can be inside. Pure data and functions of layout.js and
// walk.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-alexandria.js). Coordinates: metres, +x east, +z south, the settlement's own frame. What the scheduler asks of a map and
// Alexandria has not (canals, a pond, a bridge, a street track) is answered with nothing; the harbour's water answers `canalSpot` (the quay's stones).

import { RADIUS, PHAROS, AGORA, SEROUTE, QUAY, SHIPS, PIER, MUSEION, wet, inRect, shopRuns } from './layout.js';
import { opened } from './walk.js';
import { houseRooms } from '../../styles/ptolemaic/house.js';
import { frame } from '../../styles/greek/agora.js';
import { TRADES } from '../../styles/greek/shops.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the quay). */
export const HOME = [102, -86];
/** A deterministic 0…1 from numbers (no Math.random in the choice of places). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The work heard from each trade's shop: [voice, gap in seconds [min, max], hours [from, to]]. [inferred from the trade] */
const TRADE_WORK = {
  bronze: [['hammer', [12, 30], [6.5, 17.5]]], perfume: [['mortar', [18, 40], [7, 17.5]]], cloth: [['clothRustle', [18, 40], [7, 18]]],
  wine: [['pourWine', [30, 70], [9, 21]]], carpenter: [['plane', [16, 38], [7, 17.5]]], oil: [['pourWine', [30, 70], [8, 18]]],
  grain: [['sack', [20, 50], [6.5, 17]]], fish: [['alxHawkFish', [40, 90], [6, 12]]], pottery: [['clay', [14, 30], [6.5, 17]]],
  papyrus: [['clothRustle', [30, 70], [7, 18]]], bread: [['kitchen', [14, 30], [4.5, 12]]], sandals: [['chisel', [20, 45], [7, 17.5]]],
};
/** The household's own sounds (the kitchen, the quern's hum, the loom). */
const HOUSE_WORK = [['kitchen', [14, 30], [5.5, 20]], ['loom', [30, 70], [6.5, 18.5]]];

let SITES = null;
/** The houses and shops with sounds: { use, rect, at, id, work, y }. The walk's houses (their shop room and kitchen) and the furnished shop rooms of the Canopic Way. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const o of opened()) {
    const { l, K } = o, [rShop, , , rKit] = houseRooms({ rect: l.rect, seed: l.seed, front: l.front }, l.y), trade = K.aShop ? K.trade : null;
    SITES.push({ use: trade ? 'shop:' + trade : 'store', rect: rShop.rect, at: mid(rShop.rect), id: 'house:' + l.seed, work: trade ? TRADE_WORK[trade] : [], y: l.y });
    SITES.push({ use: 'house', rect: rKit.rect, at: mid(rKit.rect), id: 'kitchen:' + l.seed, work: HOUSE_WORK, y: l.y });
  }
  for (const r of shopRuns().filter((q) => q.full)) {
    const F = frame(r.rect, r.front), wt = 0.7, rw = (F.L - 2 * wt) / 5;
    for (let k = 0; k < 5; k++) {
      const rect = F.R(wt + k * rw + 0.3, 6.55, wt + (k + 1) * rw - 0.1, 11.2), trade = TRADES[k];
      SITES.push({ use: 'shop:' + trade, rect, at: mid(rect), id: `run:${Math.round(r.cx)}${r.front}:${k}`, work: TRADE_WORK[trade], y: 1.2 });
    }
  }
  return SITES;
}

/** The wells of the cross streets (streets.js builds them at these places; tests/alexandria-sound.test.mjs checks them against it). */
export const WELLS = [[50.6, -40], [69.4, 10], [50.6, 50]];

export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const ROOM_RECTS = [
  ['cella', 'temple', [SEROUTE.rect[0] + 16, mid(SEROUTE.rect)[1] - 18, SEROUTE.rect[0] + 48, mid(SEROUTE.rect)[1] + 18], 13.1],
  ['reading1', 'library', [195, -35, 226, -13], 1.2], ['reading2', 'library', [231, -35, 262, -13], 1.2], ['reading3', 'library', [267, -35, 298, -13], 1.2],
  ['dining', 'hall', [314.8, -65.3, 327.3, -36.7], 1.2],
  ['pharos', 'pharos', [PHAROS.c[0] - 14, PHAROS.c[1] - 14, PHAROS.c[0] + 14, PHAROS.c[1] + 14], 1.2],
];
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 2.4, same: s.id };
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z)) return { use, at: mid(r), upper: false, same: id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['clothRustle', 50]] };       // (flat roofs: little rain noise)
export const ROOMS = {
  house: { ...R0, work: [['kitchen', 40]] }, store: { ...R0, work: [['sack', 60]] },
  'shop:bronze': { tone: [420, 0.4], roof: 0.7, hush: 1.0, work: [['drawer', 120]] }, 'shop:perfume': { tone: [260, 0.2], roof: 0.7, hush: 0.7, work: [['jarLid', 60]] },
  'shop:cloth': { tone: [280, 0.2], roof: 0.7, hush: 0.7, work: [['clothRustle', 26]] }, 'shop:wine': { tone: [300, 0.3], roof: 0.7, hush: 0.8, work: [['jarLid', 40]] },
  'shop:carpenter': { tone: [320, 0.3], roof: 0.7, hush: 0.9, work: [['plane', 24]] }, 'shop:oil': { tone: [300, 0.3], roof: 0.7, hush: 0.8, work: [['jarLid', 50]] },
  'shop:grain': { tone: [280, 0.25], roof: 0.7, hush: 0.8, work: [['sack', 40]] }, 'shop:fish': { tone: [340, 0.3], roof: 0.7, hush: 0.9, work: [['drawer', 90]] },
  'shop:pottery': { tone: [320, 0.3], roof: 0.7, hush: 0.8, work: [['clay', 16]] }, 'shop:papyrus': { tone: [250, 0.2], roof: 0.7, hush: 0.7, work: [['clothRustle', 40]] },
  'shop:bread': { tone: [300, 0.3], roof: 0.7, hush: 0.8, work: [['kitchen', 26]] }, 'shop:sandals': { tone: [300, 0.3], roof: 0.7, hush: 0.8, work: [['chisel', 30]] },
  temple: { tone: [130, 0.3], roof: 0.5, hush: 0.45, work: [['alxSistrum', 90]] },
  library: { tone: [190, 0.2], roof: 0.6, hush: 0.5, work: [['alxReaders', 25]] },
  hall: { tone: [160, 0.25], roof: 0.7, hush: 0.55, work: [['kitchen', 50]] },
  pharos: { tone: [150, 0.3], roof: 0.4, hush: 0.4, work: [['alxFire', 30]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** 0…1: how much green round (x, z): little in the stone town (palms along the promenade, the Museion's garden), more on the Serapeum's hill and the rim. */
export function greenNear(x, z) {
  const garden = 1 - sm(0, 30, Math.hypot(Math.max(196 - x, 0, x - 296), Math.max(-66 - z, 0, z + 36))), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(garden * 0.7, rim * 0.6, 0.15);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in: the Museion's garden. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (inRect([196, -66, 296, -36], px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it on the quay, the Canopic Way and the agora; less on the island and the rim. */
export function townNear(x, z) {
  if (inRect(AGORA, x, z, 12) || inRect(QUAY, x, z, 10)) return 1;
  return Math.max(0.12, 0.85 * (1 - 0.6 * sm(RADIUS - 150, RADIUS - 20, Math.hypot(x, z))));
}

/** The nearest water to (x, z) within 30 m (the harbour's quay stones lapped by the sea): { d, p } or null. */
export function canalSpot(x, z) {
  let best = null;
  for (let a = 0; a < 16; a++) for (let d = 3; d <= 30; d += 3) {
    const px = x + Math.cos(a * Math.PI / 8) * d, pz = z + Math.sin(a * Math.PI / 8) * d;
    if (wet(px, pz) < -0.5) { if (!best || d < best.d) best = { d, p: [px, pz] }; break; }
  }
  return best;
}
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
const galleys = SHIPS.filter((s) => s.kind === 'galley' && s.at[1] < -90 && s.at[1] > -110);
const shrines = [[46.4, 56.8], [73.6, 83.2], [-300, 56.8], [330, 83.2]];
const PIERHEAD = [(PIER[0] + PIER[2]) / 2, PIER[1] + 3];
const MU = [246, -51];
/** Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `lv`, `after`. The shops' and houses' work comes from sites(). */
export const EMITTERS = [
  // the harbour: gulls over the water, the pipes on the galleys, the porters at the cargo, the cranes, the caulkers
  ...[[60, -112], [190, -122], [-100, -150], [-40, -270], [300, -110]].map((at, i) => ({ voice: 'alxGull', at, r50: 38, gap: [9 + i, 26 + i * 2], hours: [5, 20] })),
  ...galleys.map((s, i) => ({ voice: 'alxKeleustes', at: s.at, r50: 30, gap: [50 + i * 12, 120 + i * 20], hours: [7, 17], rainMax: 0.6, after: true })),
  { voice: 'alxPorters', at: [PIERHEAD[0], PIERHEAD[1] + 14], r50: 22, gap: [22, 60], hours: [6, 17], rainMax: 0.6, after: true },
  { voice: 'alxPorters', at: [-150, -88], r50: 22, gap: [30, 75], hours: [6, 17], rainMax: 0.6, after: true },
  { voice: 'alxCrane', at: [81.2, PIER[1] + 3.2], r50: 24, gap: [18, 50], hours: [6.5, 17], rainMax: 0.6, after: true },
  ...[-170, -80, 20, 200].map((x, i) => ({ voice: 'alxCrane', at: [x, QUAY[1] + 1.4], r50: 24, gap: [30 + i * 4, 80], hours: [6.5, 17], rainMax: 0.6, after: true })),
  ...SHIPS.filter((s) => s.kind === 'merchant' && s.at[1] === -97 && [26, -56].includes(s.at[0])).map((s) => ({ voice: 'alxCaulk', at: [s.at[0], -97], r50: 24, gap: [30, 80], hours: [6.5, 17], rainMax: 0.5, after: true })),
  // the trumpet at the royal palace on the Lochias at dawn and at dusk (the change of the guard)
  { voice: 'alxSalpinx', at: [380, -125], r50: 120, gap: [120, 200], hours: [5.6, 6.2] }, { voice: 'alxSalpinx', at: [380, -125], r50: 120, gap: [120, 200], hours: [18, 18.6] },
  // the Pharos' fire, all night and at dusk (by day only the smoke), heard across the harbour
  { voice: 'alxFire', at: [PHAROS.c[0], PHAROS.c[1]], r50: 60, gap: [10, 16], hours: [17.5, 6], after: true },
  // the shrines of Isis at the crossings: the sistrum morning and evening
  ...shrines.map(([x, z], i) => ({ voice: 'alxSistrum', at: [x, z], r50: 12, gap: [50 + i * 7, 130], hours: [6, 9] })),
  ...shrines.map(([x, z], i) => ({ voice: 'alxSistrum', at: [x, z], r50: 12, gap: [60 + i * 7, 150], hours: [16.5, 19] })),
  // the Serapeum: the temple's hymn at dawn, noon and dusk
  ...[[5.5, 7.2], [11.6, 12.6], [17.2, 18.8]].map((hours) => ({ voice: 'alxTempleChant', at: mid(SEROUTE.rect), r50: 40, gap: [90, 160], hours, rainMax: 0.7, after: true })),
  // the Museion: the readers in the halls, the water organ in the garden
  ...[210.5, 246.5, 282.5].map((x) => ({ voice: 'alxReaders', at: [x, -24], r50: 14, gap: [20, 45], hours: [7, 18], rainMax: 0.95 })),
  { voice: 'alxHydraulis', at: MU, r50: 26, gap: [90, 200], hours: [9, 17], rainMax: 0.3, after: true },
  // the agora: the herald by the fountain, the hawkers at the booths
  { voice: 'alxHerald', at: [AGORA[2] - 7, mid(AGORA)[1]], r50: 30, gap: [70, 170], hours: [7.5, 12.5], rainMax: 0.7 },
  ...[['alxHawkOil', 0], ['alxHawkFish', 2], ['alxHawkGrain', 4]].map(([voice, i], j) => ({ voice, at: [AGORA[0] + 4 + i * 8 + 2.7, AGORA[1] + 6.2], r50: 16, gap: [26 + j * 5, 70 + j * 6], hours: [7, 14], rainMax: 0.5 })),
  // Rhakotis: the shaduf's pole, the hens
  { voice: 'alxShaduf', at: [-300, 100], r50: 14, gap: [25, 60], hours: [6, 18], dry: true }, { voice: 'alxShaduf', at: [-200, 130], r50: 14, gap: [30, 70], hours: [6, 18], dry: true },
  { voice: 'alxHens', at: [-250, 122], r50: 9, gap: [40, 100], hours: [6, 18.5], dry: true },
];
