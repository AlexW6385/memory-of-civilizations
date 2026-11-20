// Where Vienna's sounds are (docs/settlements/vienna.md §15.2): the places of its emitters and the geometry the audio engine needs to put each sound where
// it comes from: the Ring's tram tracks, the Fiaker on the setts, the Stadtbahn's ledge by the Wien, the Karlskirche's bell, the Werkelmann and the carpet
// beaters of the Höfe, the Maroni seller, the Naschmarkt and its fountain, the shops and coffee houses that work, the rooms one can be inside. Pure data and
// functions of layout.js (no three.js, no builders), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js and
// src/engine/voices-vienna.js. Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).
// [inferred throughout: no recording of 1902 is used; what a source gives is marked in the dossier.]

import { RADIUS, EW, NS, WIEN, LEDGE, TRAIN, NASCH, OPERA, SEC, CAFE, KARLSKIRCHE, KARLSPLATZ, SQUARE, PAVILIONS, RING_TRACKS, WING, inRect, lots, yards, shopRoomRect, passageRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none: the arrival, before the Secession. */
export const HOME = [0, -66];

/** A deterministic 0…1 from numbers (for the choice of places: no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ── the trades' work, heard from the open shops ──────────────────────────────
/** What each trade sounds like at work: [voice, gap in seconds [min, max], hours [from, to]] (the shops stood open into the evening [inferred]). */
const WORK = {
  kaffeehaus: [['vieCafe', [7, 15], [7, 23.5]], ['vieBilliard', [30, 70], [10, 23]], ['viePiano', [60, 130], [17, 23]]],
  konditorei: [['vieCafe', [9, 18], [8, 22]], ['vieTill', [30, 70], [8, 21]]],
  baeckerei: [['vieOven', [20, 50], [4.5, 19]]],
  tabak: [['vieTill', [26, 70], [7, 22]]],
  apotheke: [['viePestle', [24, 60], [8, 20]]],
  greissler: [['vieScale', [16, 40], [7, 20]]],
  fleischhauer: [['vieCleaver', [10, 26], [6, 19]]],
  buchhandlung: [['paper', [26, 60], [9, 19]]],
  huetemacher: [['vieSteam', [30, 70], [9, 19]]],
  weinstube: [['vieSchrammel', [50, 110], [17, 24]], ['vieCafe', [10, 20], [11, 24]]],
  schneider: [['vieSewing', [16, 45], [8, 19]]],
  uhrmacher: [['vieClocks', [40, 90], [9, 19]]],
  schuster: [['vieLast', [12, 32], [7, 19]]],
  blumen: [['pour', [30, 70], [7, 19]]],
  friseur: [['vieStrop', [18, 50], [8, 20]]],
  milch: [['vieCans', [20, 50], [5.5, 19]]],
  tischler: [['plane', [20, 45], [7, 18]]],
};
let SITES = null;
/** The shops and coffee houses that make sound: { use (the trade), rect (its room), at, id, work } — the open lots, and the Café Museum. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!l.open) continue;
    const r = shopRoomRect(l);
    SITES.push({ use: l.open, rect: r, at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], id: `lot:${l.seed}`, work: WORK[l.open] || [] });
  }
  SITES.push({ use: 'kaffeehaus', rect: CAFE, at: [(CAFE[0] + CAFE[2]) / 2, (CAFE[1] + CAFE[3]) / 2], id: 'cafe-museum', work: WORK.kaffeehaus });
  return SITES;
}

// ── fixed places ──────────────────────────────────────────────────────────────
/** No wells: the town had its mains and the Naschmarkt's drinking fountain; the Hof's pump is placed with the carpet frame. */
export const WELLS = [];
/** The drinking fountain in the Naschmarkt's aisle (town.js naschmarkt()) and the Maroni seller's roaster on the Karlsplatz (town.js extras()). */
export const FOUNTAIN = [-157, 55.6], MARONI = [118, -3.6];
/** The Karlskirche's bell (in its towers' belfry: the portico faces west, the dome's centre is `KARLSKIRCHE`), heard from the whole Karlsplatz. */
export const BELL = [KARLSKIRCHE[0] - 14, KARLSKIRCHE[1]];
/** Stalls along the Naschmarkt's aisle where the Marktfrauen call (every ~40 m). */
export const STALLS = [-230, -196, -160, -128, -92].map((x) => [x, 55.6]);

/** The yards that have a Durchhaus (a way in from the street), nearest the arrival first: where the Werkelmann plays and the carpets are beaten. */
export function hofs() {
  return yards().filter((y) => y.entry).map((y) => ({ y, at: [(y.rect[0] + y.rect[2]) / 2, (y.rect[1] + y.rect[3]) / 2], d: Math.hypot((y.rect[0] + y.rect[2]) / 2, (y.rect[1] + y.rect[3]) / 2 + 66) }))
    .sort((a, b) => a.d - b.d).filter((h) => h.d < 280);
}
/** The carpet-beating frame of a yard (hof.js hofYard: at 0.28 of its width and 0.28 of its depth past the middle). */
export const frameOf = (y) => { const [x0, z0, x1, z1] = y.rect; return [x0 + (x1 - x0) * 0.28, (z0 + z1) / 2 + (z1 - z0) * 0.28]; };

let EMIT = null;
/** The fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to], dry?, rainMax?, inside? }. Built once from the town's data. */
export function emitters() {
  if (EMIT) return EMIT;
  const hs = hofs();
  EMIT = [
    // the Angelus from the Karlskirche, at six, noon and six: a minute or two's window each, so that it is rung once
    ...[[5.97, 6.06], [11.97, 12.06], [17.97, 18.06]].map((hours) => ({ voice: 'vieAngelus', at: BELL, r50: 90, gap: [100, 130], hours, rainMax: 1 })),
    { voice: 'vieMaroni', at: MARONI, r50: 20, gap: [40, 90], hours: [10, 20], dry: true, rainMax: 0.4 },
    { voice: 'vieFountain', at: FOUNTAIN, r50: 6, gap: [10, 24], hours: [5.5, 21], rainMax: 0.9 },
    ...STALLS.map((at) => ({ voice: 'vieMarkt', at, r50: 12, gap: [28, 70], hours: [6, 18], rainMax: 0.6 })),
    // the courtyards (the two nearest with a Durchhaus): the Werkelmann in the middle of the day, the carpets in the morning
    ...hs.slice(0, 2).map(({ at, y }) => ({ voice: 'vieWerkelmann', at, r50: 15, gap: [70, 140], hours: [9.5, 17], dry: true, rainMax: 0.25 })),
    ...hs.slice(0, 4).map(({ y }) => ({ voice: 'vieCarpet', at: frameOf(y), r50: 10, gap: [24, 60], hours: [8, 12.5], dry: true, rainMax: 0.2 })),
    // the Haustor locked at ten: at the Durchhäuser's gates (the Hausmeister's key)
    ...lots().filter((l) => l.passage !== undefined && l.passage !== null).slice(0, 6).map((l) => ({ voice: 'vieGate', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], r50: 10, gap: [80, 200], hours: [21.6, 23.4], rainMax: 0.95 })),
    // the Opera: the orchestra tuning before the seven o'clock curtain, a soprano's vocalise by day (Mahler's house)
    { voice: 'vieTune', at: [(OPERA[0] + OPERA[2]) / 2, OPERA[1] + 30], r50: 22, gap: [70, 110], hours: [18.4, 19.0], inside: 'opera' },
    { voice: 'vieSoprano', at: [(OPERA[0] + OPERA[2]) / 2, OPERA[1] + 20], r50: 14, gap: [90, 160], hours: [10, 13], inside: 'opera' },
    // the Secession's hall: visitors' steps and murmur (the exhibition open 10 to 6 [inferred])
    { voice: 'vieHallSteps', at: [(SEC[0] + SEC[2]) / 2, (SEC[1] + SEC[3]) / 2], r50: 10, gap: [12, 28], hours: [10, 18], inside: 'secession' },
    { voice: 'vieHallMurmur', at: [(SEC[0] + SEC[2]) / 2 - 8, (SEC[1] + SEC[3]) / 2], r50: 9, gap: [10, 22], hours: [10, 18], inside: 'secession' },
    // the Karlskirche's organ: a chord now and then in the hours of the offices
    { voice: 'vieOrgan', at: [KARLSKIRCHE[0] - 14, KARLSKIRCHE[1]], r50: 16, gap: [80, 160], hours: [7, 19], inside: 'karlskirche' },
  ];
  return EMIT;
}
export const EMITTERS = emitters();

// ── the passing: the trams, the Fiaker and the drays, the train, the newsboys, the beat ─────────────
const LIM = RADIUS - 62;
/**
 * A track along the street nearest to (x, z) within `reach`: { pts, line } — vehicles keep to the right (Austria): an east-going one on the south lane
 * of an east–west street, a south-going one on the west lane of a north–south one. null if no street is near or the run is short.
 */
export function streetWay(x, z, rnd, reach = 70, lead = 30, ring = 0) {
  let best = null;
  const cand = [];
  for (const s of EW) { if (x < s.x0 - 5 || x > s.x1 + 5 || (s.name !== 'ring' && ring >= 1)) continue; cand.push({ ew: true, c: s.z, w: s.w, d: Math.abs(s.z - z), a: s.x0, b: s.x1 }); }
  for (const s of NS) { if (z < s.z0 - 5 || z > s.z1 + 5) continue; cand.push({ ew: false, c: s.x, w: s.w, d: Math.abs(s.x - x), a: s.z0, b: s.z1 }); }
  for (const c of cand) if (c.d <= reach && (!best || c.d + hash(c.c, c.d, 3) * 12 < best.d + hash(best.c, best.d, 3) * 12)) best = c;
  if (!best) return null;
  const p = best.ew ? x : z, dir = rnd() < 0.5 ? 1 : -1, lo = best.ew ? Math.max(best.a, -LIM) : Math.max(best.a, -LIM), hi = Math.min(best.b, LIM);
  const near = clamp(p, lo, hi);
  let a = clamp(near - dir * lead * (0.5 + 0.7 * rnd()), lo, hi), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), lo, hi);
  if (Math.abs(b - a) < 14) return null;
  const lane = (b > a ? 1 : -1) * (best.ew ? 1 : -1) * Math.min(2.4, best.w / 4);
  const pts = best.ew ? [[a, best.c + lane], [b, best.c + lane]] : [[best.c + lane, a], [best.c + lane, b]];
  // the Wien's channel is crossed on the bridges: a track over it is as the street is
  return { pts, line: best.c, ew: best.ew };
}
/** A walker's track along the pavement of a street (the vehicles' with the pavement's offset). */
export function walkTrack(x, z, rnd, reach = 70, lead = 30) {
  const w = streetWay(x, z, rnd, reach, lead, 0);
  if (!w) return null;
  const off = (rnd() < 0.5 ? 1 : -1) * 3.6;
  return { pts: w.pts.map(([px, pz]) => (w.ew ? [px, w.line + off] : [w.line + off, pz])) };
}
/** The tram along one of the Ring's two tracks, passing the nearest point: null if the Ring is farther than `reach`. */
export function ringTrack(x, z, rnd, reach = 150, lead = 60) {
  const zt = RING_TRACKS[0], z1 = RING_TRACKS[1];
  if (Math.abs(z - (zt + z1) / 2) > reach) return null;
  const east = rnd() < 0.5, zz = east ? z1 : zt, near = clamp(x, -LIM, LIM);
  const dir = east ? 1 : -1, a = clamp(near - dir * lead * (0.5 + 0.7 * rnd()), -LIM, LIM), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), -LIM, LIM);
  if (Math.abs(b - a) < 30) return null;
  return { pts: [[a, zz], [b, zz]] };
}
/** The Stadtbahn's steam train on the ledge by the Wien: null if the ledge is farther than `reach`. */
export function trainTrack(x, z, rnd, reach = 230, lead = 120) {
  if (Math.abs(z - TRAIN.z) > reach) return null;
  const dir = rnd() < 0.5 ? 1 : -1, near = clamp(x, -LIM, LIM);
  const a = clamp(near - dir * lead * (0.6 + 0.6 * rnd()), -LIM, LIM), b = clamp(near + dir * lead * (0.8 + 0.8 * rnd()), -LIM, LIM);
  if (Math.abs(b - a) < 50) return null;
  return { pts: [[a, TRAIN.z], [b, TRAIN.z]] };
}
const dryEnough = (rain, m) => rain < m;
export const TRACKS = [
  { key: 'tram', voice: 'vieTram', speed: 6, r50: 24, gap: [70, 150], ok: (h, rain) => h >= 5 && h < 24 && dryEnough(rain, 0.98), get: (x, z, r) => ringTrack(x, z, r, 160, 70) },
  { key: 'fiaker', voice: 'vieFiaker', speed: 3.6, r50: 15, gap: [9, 26], ok: (h, rain) => h >= 7 && h < 24.5 && dryEnough(rain, 0.95), get: (x, z, r) => streetWay(x, z, r, 80, 36, 0) },
  { key: 'dray', voice: 'vieDray', speed: 1.7, r50: 15, gap: [45, 110], ok: (h, rain) => h >= 5.5 && h < 17 && dryEnough(rain, 0.8), get: (x, z, r) => streetWay(x, z, r, 90, 40, 0) },
  { key: 'train', voice: 'vieTrain', speed: 10, r50: 40, gap: [90, 200], ok: (h, rain) => h >= 5 && h < 24 && dryEnough(rain, 1.1), get: (x, z, r) => trainTrack(x, z, r, 260, 130) },
  { key: 'news', voice: 'vieNews', speed: 1.1, r50: 11, gap: [30, 70], ok: (h, rain) => ((h >= 6 && h < 10) || (h >= 16 && h < 22)) && dryEnough(rain, 0.5), get: (x, z, r) => walkTrack(x, z, r, 80, 30) },
  { key: 'beat', voice: 'vieBeat', speed: 1.1, r50: 12, gap: [50, 120], ok: (h, rain) => (h >= 22.5 || h < 5) && dryEnough(rain, 0.7), get: (x, z, r) => walkTrack(x, z, r, 90, 36) },
];
// the built-in boat (a yuloh), crossing, sedan, vendor and watchman of voices.js are Suzhou's: none here
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const treeSpot = () => null;
export const frogGround = () => 0;
/** The Wien's water nearest to (x, z): the point of the channel's wall-foot, the distance. The river runs in its granite walls between the bridges. */
export function canalSpot(x, z) {
  if (x < WIEN.x0 + 4 || x > WIEN.x1 - 4) return null;
  const p = [x, clamp(z, WIEN.z0 + 1, WIEN.z1 - 1)], d = Math.hypot(0, z - p[1]);
  return { p, d, i: 0 };
}
/** 0…1: how much broad-leaved tree is round: the Ring's planes and chestnuts, the garden behind the Secession, the Karlsplatz. */
export function leafNear(x, z) {
  const g = Math.max(1 - sm(0, 30, rectDist([-330, -246, 330, -214], x, z)) * 1, 1 - sm(0, 30, rectDist(SQUARE, x, z)), 1 - sm(0, 40, rectDist(KARLSPLATZ, x, z)));
  return Math.min(1, 0.06 + 0.85 * g);
}
/** 0…1: how much green round (crickets): the lawns of the Karlsplatz and the garden; the streets are paved. */
export function greenNear(x, z) { return 0.5 * Math.max(1 - sm(0, 20, rectDist(KARLSPLATZ, x, z)), 1 - sm(0, 15, rectDist(SQUARE, x, z))); }
/** 0…1: how much of the town's hubbub reaches (x, z): the Ring and the Naschmarkt (1), the streets (0.7), less inside the great buildings and in the Karlsplatz. */
export function townNear(x, z) {
  if (inRect(SEC, x, z)) return 0.25;
  if (inRect(OPERA, x, z)) return 0.25;
  if (Math.abs(z + 230) < 28 || inRect([-250, 48, -62, 62], x, z)) return 1;
  if (inRect(KARLSPLATZ, x, z)) return 0.5;
  return Math.max(0.2, 0.75 * (1 - 0.7 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z))));
}

// ── the rooms ─────────────────────────────────────────────────────────────────
const FLOOR_Y = 4.9;                       // over the ground storey (4.5 m, shops 4.6)
const KR = [KARLSKIRCHE[0] - 36 - 12, KARLSKIRCHE[1] - 14, KARLSKIRCHE[0] - 36 + 34, KARLSKIRCHE[1] + 14];
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: a trade's shop (the seventeen trades), cafe, secession (the
 * hall), opera, church, station (Wagner's pavilions), passage (a Durchhaus), house (any other that can be entered).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(SEC, x, z)) return { use: 'secession', at: [(SEC[0] + SEC[2]) / 2, (SEC[1] + SEC[3]) / 2], upper: false, same: 'secession' };
  if (inRect(OPERA, x, z)) return { use: 'opera', at: [(OPERA[0] + OPERA[2]) / 2, (OPERA[1] + OPERA[3]) / 2], upper: false, same: 'opera' };
  if (inRect(KR, x, z) && y < 12) return { use: 'church', at: [KARLSKIRCHE[0] - 14, KARLSKIRCHE[1]], upper: false, same: 'karlskirche' };
  for (const [px, pz] of PAVILIONS) if (inRect([px - 5, pz - 3, px + 5, pz + 3], x, z)) return { use: 'station', at: [px, pz], upper: false, same: `station:${px},${pz}` };
  if (inRect(CAFE, x, z)) return { use: 'cafe', at: [(CAFE[0] + CAFE[2]) / 2, (CAFE[1] + CAFE[3]) / 2], upper: y > FLOOR_Y, same: 'cafe-museum' };
  const upper = y > FLOOR_Y;
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use === 'kaffeehaus' || s.use === 'konditorei' ? 'cafe' : s.use, at: s.at, upper, same: s.id };
  for (const l of lots()) {
    if (l.passage !== undefined && l.passage !== null && inRect(passageRect(l), x, z)) return { use: 'passage', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: false, same: 'lot:' + l.seed };
    if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper, same: 'lot:' + l.seed };
  }
  return null;
}
/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is from inside
 * (slate over timber: loud; the stone vaults: far), `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
const SHOP = (tone, work, hush = 0.75) => ({ tone: [tone, 0.25], roof: 0.9, hush, work });
export const ROOMS = {
  cafe: { tone: [420, 0.5], roof: 0.9, hush: 0.9, work: [['vieCafe', 8], ['vieBilliard', 40], ['paper', 30]] },
  baeckerei: SHOP(380, [['vieOven', 30], ['sack', 40]]), tabak: SHOP(260, [['vieTill', 40], ['paper', 40]]), apotheke: SHOP(260, [['viePestle', 40], ['jarLid', 40]]),
  greissler: SHOP(320, [['vieScale', 28], ['sack', 40]]), fleischhauer: SHOP(300, [['vieCleaver', 24], ['drawer', 60]], 0.85), buchhandlung: SHOP(240, [['paper', 22]], 0.6),
  huetemacher: SHOP(250, [['vieSteam', 50], ['clothRustle', 30]], 0.65), weinstube: { tone: [420, 0.45], roof: 0.9, hush: 0.9, work: [['vieCafe', 8], ['vieSchrammel', 60]] },
  schneider: SHOP(250, [['vieSewing', 26], ['scissors', 40]]), konditorei: { tone: [420, 0.4], roof: 0.9, hush: 0.9, work: [['vieCafe', 9], ['vieTill', 40]] },
  uhrmacher: SHOP(220, [['vieClocks', 50]], 0.6), schuster: SHOP(300, [['vieLast', 22], ['broom', 60]], 0.8), blumen: SHOP(380, [['pour', 40]], 0.9),
  friseur: SHOP(280, [['vieStrop', 30], ['clothRustle', 40]]), milch: SHOP(360, [['vieCans', 30]], 0.85), tischler: SHOP(320, [['plane', 24], ['chisel', 50]], 0.85),
  secession: { tone: [140, 0.3], roof: 0.3, hush: 0.45, work: [['vieHallSteps', 16], ['vieHallMurmur', 12]] },
  opera: { tone: [150, 0.3], roof: 0.3, hush: 0.4, work: [['vieSoprano', 80]] },
  church: { tone: [120, 0.3], roof: 0.2, hush: 0.35, work: [['vieOrgan', 70], ['paper', 90]] },
  station: { tone: [900, 0.3], roof: 0.7, hush: 1.0, work: [['vieTill', 80]] },
  passage: { tone: [700, 0.3], roof: 0.6, hush: 0.95, work: [['broom', 60]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70], ['teaClink', 80]] },
};
/** The upper floors: close under the slate (the rain loud), nearly silent; a flat's own sounds. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40], ['broom', 80], ['teaClink', 70]] };
void NASCH; void WING; void LEDGE; void NS;
