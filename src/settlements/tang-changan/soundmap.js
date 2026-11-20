// Where Tang Chang'an's sounds are (docs/settlements/tang-changan.md §19): the places the audio engine needs to put each sound where it is
// made, and when. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and
// played by src/engine/voices.js and voices-tang.js. +x east, +z south, the settlement's own frame. The same interface as Suzhou's
// soundmap.js (the engine reads one shape) with `schedule: 'tcPlaced'` (voices-tang.js), which hands the clock to the map first.
//
// The city's day, by the curfew [stated: Lin 2015 for the wards closed at night, "each ward and crossroads were guarded", temples and
// officials of rank 3b exempt; Wikipedia "Chang'an" for the markets: opened at noon at the stroke of 300 drum beats, closed some 1¾ hours
// before dusk at 300 gong beats]: the markets sound only from noon to the afternoon; the streets are empty after the dusk drum (no
// vendor, no watchman's clapper: the clapper is of later cities); the temples go on with their service; at night the guards ride the
// avenue and dogs answer far off.

import {
  RADIUS, STREETS, WARDS, DACI, DACI_AX, DACI_MAIN, PAGODA, MARKET, DAO_AX, DAO_HALLS, DACI_QUARTERS, DITCH, TREE_ROWS, OFFICE,
  inRect, inDitch, inWard, lots, marketRows, marketYards, gates, WINE,
} from './layout.js';

/** Where the audio puts the listener when the engine gives none: the arrival, in Daci'en's pagoda court. */
export const HOME = [102, 112];
export const schedule = 'tcPlaced';

/** The hour of the day as the scheduler last saw it (voices-tang.js sets it): the streets and the market answer by it. */
export const clock = { hour: 12 };
export const MARKET_HOURS = [12, 16.75];                  // opened at noon, shut some 1¾ hours before dusk (dusk about 18.5)
export const DUSK = 18.5, DAWN = 5.0;
export const curfew = (h = clock.hour) => h >= 18.75 || h < 4.9;
export const marketOpen = (h = clock.hour) => h >= MARKET_HOURS[0] && h < MARKET_HOURS[1];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

// ── the trades of the West Market and what each made heard (the hours are the market's) ──
const WORK = {
  carpet: [['clothRustle', [24, 50]]], spice: [['mortar', [22, 46]]], jade: [['coin', [30, 60]]], wine: [['pourWine', [26, 60]]],
  saddlery: [['chisel', [26, 55]]], books: [['paper', [30, 60]]], paper: [['paper', [30, 60]]], medicine: [['mortar', [20, 44]]], lacquer: [['brushLacquer', [26, 55]]],
  cloth: [['scissors', [22, 50]]], silk: [['clothRustle', [24, 50]]], dye: [['pour', [30, 60]]], iron: [['hammer', [16, 34]]], pottery: [['clay', [30, 60]]],
  grain: [['sack', [22, 48]]], food: [['kitchen', [18, 40]]],
};
/** The unit centre of a shop row, in the world, by the row's front (as tang_shop_row lays its bays). */
function unitAt(r, k, nb) {
  const f = r.front, al = f === 'n' || f === 's', W = al ? r.foot[2] - r.foot[0] : r.foot[3] - r.foot[1], hw = W - 1.6, bay = hw / r.units.reduce((a, u) => a + u.nb, 0);
  const x = -hw / 2 + (k + nb / 2) * bay, c = mid(r.foot);
  return f === 's' ? [c[0] + x, c[1]] : f === 'n' ? [c[0] - x, c[1]] : f === 'e' ? [c[0], c[1] - x] : [c[0], c[1] + x];
}

let SITES = null;
/**
 * The buildings with sounds: { use, rect, at, id, work: [[voice, [gap min, max], [from, to]]] }. The market's shops (by their trades, in the
 * market's hours), the Hu wine shop, Daci'en's kitchen, library and translation hall, the houses of the wards (a kitchen, a loom, a zither).
 */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const r of marketRows()) {
    let k = 0;
    for (const u of r.units) {
      const at = unitAt(r, k, u.nb);
      SITES.push({ use: u.trade === 'wine' ? 'wineshop' : 'shop', rect: [at[0] - 2, at[1] - 3, at[0] + 2, at[1] + 3], at, id: 'sh:' + Math.round(at[0]) + ',' + Math.round(at[1]), work: (WORK[u.trade] || []).map(([v, g]) => [v, g, MARKET_HOURS]) });
      k += u.nb;
    }
  }
  { const f = WINE.foot, at = mid(f); SITES.push({ use: 'wineshop', rect: [f[0], f[1], f[2], f[3] + 2.5], at, id: 'wine', work: [['tcHuMusic', [16, 34], [12.25, 16.6]], ['jarLid', [40, 80], MARKET_HOURS]] }); }
  for (const q of DACI_QUARTERS) {
    const al = q.face === 'e' || q.face === 'w', rect = [q.c[0] - (al ? q.d : q.w) / 2, q.c[1] - (al ? q.w : q.d) / 2, q.c[0] + (al ? q.d : q.w) / 2, q.c[1] + (al ? q.w : q.d) / 2];
    const work = q.kind === 'kitchen' ? [['kitchen', [14, 30], [5, 19]]] : q.kind === 'refectory' ? [['bowlClack', [30, 60], [10, 12.2]], ['bowlClack', [40, 80], [17, 18.2]]] : q.kind === 'library' ? [['paper', [30, 70], [6, 18]]] : q.kind === 'cell' ? [['tcWoodfish', [40, 90], [4.5, 6]]] : [];
    SITES.push({ use: q.kind === 'refectory' || q.kind === 'library' ? 'hall' : 'cell', rect, at: mid(rect), id: 'dq:' + q.id, work });
  }
  { const c = [DACI_AX + 52, DACI_MAIN[1]], rect = [c[0] - 4.8, c[1] - 11, c[0] + 4.8, c[1] + 11]; SITES.push({ use: 'scriptorium', rect, at: c, id: 'scrip', work: [['brush', [14, 30], [6, 18]], ['paper', [20, 40], [6, 18]]] }); }
  { const c = [DACI_AX, DACI_MAIN[1]], rect = [c[0] - 16.8, c[1] - 7, c[0] + 16.8, c[1] + 7]; SITES.push({ use: 'hall', rect, at: c, id: 'mainhall', work: [['tcWoodfish', [18, 36], [5.5, 18.5]]] }); }
  { const h = DAO_HALLS.main, rect = [h.c[0] - h.w / 2, h.c[1] - h.d / 2, h.c[0] + h.w / 2, h.c[1] + h.d / 2]; SITES.push({ use: 'hall', rect, at: h.c, id: 'daohall', work: [['bowlClack', [40, 90], [6, 18]]] }); }
  // the houses of the wards within 300 m: the great houses' zither of an evening, the common houses' loom and kitchen
  for (const l of lots()) {
    const at = mid(l.rect);
    if (Math.hypot(at[0], at[1]) > 300 || l.kind === 'hut') continue;
    const h = hash(at[0], at[1], 5), work = [['kitchen', [18, 40], [5.5, 20]]];
    if (l.kind === 'mansion' && h < 0.6) work.push(['qin', [60, 140], [9, 21.5]]);
    else if (l.kind === 'house' && h < 0.45) work.push(['loom', [1, 1.6], [6.5, 19]]);
    SITES.push({ use: 'house', rect: l.rect, at, id: 'lot:' + l.seed, work });
  }
  return SITES;
}

/** The wells of the caravanserai yards (town.js builds them). */
export const WELLS = marketYards().filter((m) => m.kind === 'caravanserai').map((m) => { const [x0, z0, x1, z1] = m.rect, y0 = z0 + 11, y1 = z1 - 11; return [(x0 + x1) / 2 + 3, (y0 + y1) / 2]; });

/** Daci'en's bell (east pavilion) and drum (west pavilion), its hall: the service heard from the court (audio.js 'temple-am' / 'temple-pm'). */
export const TEMPLE = { bell: [DACI_AX + 27, 172], drum: [DACI_AX - 27, 172], hall: DACI_MAIN };
export const FAR = { tower: [0, -1900], bell: [0, -1900] };

// ── the open emitters ──
const DRUMS = [[58, -19.5], [-58, -19.5]];                // the street drums at the crossing of the avenue and street A (town.js)
const GATES = gates().filter((g) => Math.hypot(g.c[0], g.c[1]) < 330 && g.ward !== DACI.id);
const OFFICE_C = mid(OFFICE);
const caravan = marketYards().filter((m) => m.kind === 'caravanserai').map((m) => mid(m.yard));
/**
 * Fixed emitters: { voice, at, r50, gap [min, max] s, hours [from, to], dry, lv }. The street drums sound at dusk (the ward gates are then shut,
 * each with a clunk of its bar and a hinge) and again from the fifth watch (the gates opened); the market's own drum at noon and its gong when it
 * closes [stated: Wikipedia]; the beat counts are compressed.
 */
export const EMITTERS = [
  ...DRUMS.flatMap((p) => [
    { voice: 'tcJiegu', at: p, r50: 80, gap: [60, 90], hours: [18.2, 18.85], lv: 1 },
    { voice: 'tcJiegu', at: p, r50: 80, gap: [60, 90], hours: [4.75, 5.35], lv: 1 },
  ]),
  { voice: 'tcMarketDrum', at: [OFFICE_C[0] + 15, OFFICE_C[1] + 8], r50: 70, gap: [100, 160], hours: [11.9, 12.3], lv: 1 },
  { voice: 'tcMarketGong', at: [OFFICE_C[0] + 15, OFFICE_C[1] + 8], r50: 70, gap: [100, 160], hours: [16.55, 17.05], lv: 1 },
  ...GATES.flatMap((g) => [
    { voice: 'tcGateBar', at: g.c, r50: 18, gap: [50, 90], hours: [18.5, 19.2], lv: 1 },
    { voice: 'tcGateBar', at: g.c, r50: 18, gap: [60, 100], hours: [5.0, 5.7], lv: 0.9 },
  ]),
  // the camels resting in the caravanserai yards: a bell now and then, a groan
  ...caravan.map((p) => ({ voice: 'tcCamelBell', at: p, r50: 22, gap: [14, 40], hours: [4.5, 18.5], lv: 1 })),
  // Hu music from the caravanserai's yard in the market's afternoon
  ...caravan.map((p) => ({ voice: 'tcHuMusic', at: p, r50: 24, gap: [40, 90], hours: [12.5, 16.5], lv: 0.8 })),
  // the bronze wind bells on the eaves of the pagoda
  { voice: 'tcWindBell', at: [PAGODA[0], PAGODA[1]], r50: 50, gap: [10, 28], hours: [0, 24], lv: 1 },
  // a bell on the Daoist temple's hall: the stone chime at the hours of the office
  { voice: 'bowlClack', at: DAO_HALLS.main.c, r50: 24, gap: [60, 120], hours: [6, 18.5], lv: 0.8 },
];

// ── the streets ──
/**
 * The engine's walking tracks for hawkers, sedan chairs and the watchman's clapper: none here. The streets have no cry of vendors and no
 * clapper by night (those are of later cities: the market sells inside its walls, the wards are shut after the dusk drum); this city's passings
 * are TRACKS below (camels, ox-carts, the mounted patrol).
 */
export function streetTrack() { return null; }
function pathAlong(rects, x, z, rnd, reach, lead, off) {
  let best = null;
  rects.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = rects[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid2 = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const o = (rnd() - 0.5) * 2 * off * 6;
  return horiz ? { pts: [[a, mid2 + o], [b, mid2 + o]] } : { pts: [[mid2 + o, a], [mid2 + o, b]] };
}
const AVE_S = STREETS.slice(0, 2);                               // the avenue and the great cross street A
/** The camel strings' and the guards' tracks: the avenue and street A (the roadway's middle, the strings keeping right). */
const avenueTrack = (x, z, rnd, reach = 120, lead = 55) => pathAlong(AVE_S, x, z, rnd, reach, lead, 0.8);

/** The passings the engine's `track` list takes: [{ key, voice, speed, r50, gap, ok(hour, rain), get(x, z, rnd) }]. */
export const TRACKS = [
  { key: 'camels', voice: 'tcCamelTrain', speed: 1.1, r50: 26, gap: [70, 150], ok: (h, r) => h >= 6.5 && h < 17.8 && r < 0.5, get: (x, z, rnd) => avenueTrack(x, z, rnd) },
  { key: 'oxcart', voice: 'tcCart', speed: 0.95, r50: 20, gap: [60, 130], ok: (h, r) => h >= 6.3 && h < 17.8 && r < 0.6, get: (x, z, rnd) => avenueTrack(x, z, rnd, 100, 45) },
  { key: 'patrol', voice: 'tcPatrol', speed: 1.5, r50: 30, gap: [55, 120], ok: (h, r) => curfew(h) && r < 0.7, get: (x, z, rnd) => avenueTrack(x, z, rnd, 200, 70) },
];

// ── water: the avenue's two ditches, shallow and nearly still: no lapping, no boats, no bridges ──
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
const DX = (DITCH.in + DITCH.out) / 2;
/** A point on the nearer ditch within `reach` of (x, z), for a frog (the ditches hold water from spring to autumn). */
export function pondSpot(x, z, rnd, reach = 24) {
  const sx = x < 0 ? -1 : 1, px = sx * DX;
  if (Math.abs(x - px) > reach + 8) return null;
  for (let k = 0; k < 8; k++) { const pz = z + (rnd() - 0.5) * 2 * reach; if (inDitch(px, pz)) return [px + (rnd() - 0.5) * 1.6, pz]; }
  return null;
}
/** A tree (a locust of the avenue, a cypress or pine of a temple, a courtyard tree) to put a bird or a cicada in, near (x, z). */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 10; k++) {
    const row = TREE_ROWS[Math.floor(rnd() * 4)], pz = Math.round((z + (rnd() - 0.5) * 2 * reach) / 14) * 14;
    if (Math.abs(row - x) < reach && Math.abs(pz) < RADIUS - 40 && !STREETS.slice(1).some((s) => s[2] - s[0] > s[3] - s[1] && pz > s[1] - 6 && pz < s[3] + 6)) return [row, pz];
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, qx = x + Math.cos(a) * d, qz = z + Math.sin(a) * d, w = inWard(qx, qz);
    if (w && (w.kind === 'daci\'en' || w.kind === 'daoist') && hash(Math.round(qx / 6), Math.round(qz / 6), 2) < 0.5) return [qx, qz];
  }
  return null;
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0…1 of broad-leaved or evergreen trees round (x, z): the avenue's rows, the temples' courts, the courtyards. */
export function leafNear(x, z) {
  const row = 1 - sm(0, 14, Math.min(...TREE_ROWS.map((r) => Math.abs(x - r)))) ;
  const w = inWard(x, z);
  return Math.max(Math.abs(x) < 54 ? row * 0.8 : 0, w && (w.kind === 'daci\'en' || w.kind === 'daoist') ? 0.7 : 0, 0.22);
}
/** 0…1 of grass and crops round (for crickets, cicadas): the wheat of the rim, the avenue's grass, the temples. */
export function greenNear(x, z) {
  const edge = sm(RADIUS - 110, RADIUS - 30, Math.hypot(x, z)), w = inWard(x, z);
  return Math.max(edge, w && (w.kind === 'daci\'en' || w.kind === 'daoist') ? 0.55 : 0, Math.abs(x) < 54 ? 0.4 : 0, 0.18);
}
/** How much of the town's hubbub reaches (x, z): the market's lanes while it is open (noon to the afternoon), a little on the avenue by day, none in the curfew. */
export function townNear(x, z) {
  if (curfew()) return 0;
  if (inRect(MARKET.rect, x, z, 6)) return marketOpen() ? 1 : 0.05;
  if (marketOpen() && rectDist(MARKET.rect, x, z) < 60) return 0.4;
  if (inWard(x, z)?.kind === 'daci\'en') return 0.1;
  return STREETS.some((s) => inRect(s, x, z)) ? 0.35 : 0.12;
}
/** Ditch water and wet ground (the frogs): the avenue's ditches. */
export function frogGround(x, z) { return 0.45 * (1 - sm(0, 24, Math.abs(Math.abs(x) - DX))) * (Math.abs(z) < RADIUS - 40 ? 1 : 0); }

// ── the rooms ──
const HALLS = [
  { id: 'main-hall', c: DACI_MAIN, hw: 16.8, hd: 7, use: 'hall' }, { id: 'kings', c: [DACI_AX, 150], hw: 11.2, hd: 5, use: 'hall' },
  { id: 'sutra', c: [DACI_AX - 52, DACI_MAIN[1]], hw: 4.8, hd: 11, use: 'hall' }, { id: 'transl', c: [DACI_AX + 52, DACI_MAIN[1]], hw: 4.8, hd: 11, use: 'scriptorium' },
  { id: 'dao-main', c: DAO_HALLS.main.c, hw: DAO_HALLS.main.w / 2, hd: DAO_HALLS.main.d / 2, use: 'hall' }, { id: 'dao-rear', c: DAO_HALLS.rear.c, hw: DAO_HALLS.rear.w / 2, hd: DAO_HALLS.rear.d / 2, use: 'hall' },
];
/**
 * The room the listener is in, or null in the open: { use, at, upper, same }. Uses: shop, wineshop, hall (a temple hall), scriptorium, cell (a monk's
 * room), house (a ward house), pagoda (the tower's chambers; upper above the ground storey), office (the market's).
 */
export function roomAt(x, z, y = 0) {
  if (Math.abs(x - PAGODA[0]) < 12 && Math.abs(z - PAGODA[1]) < 12 && y > 4.3) return { use: 'pagoda', at: PAGODA, upper: y > 15, same: 'pagoda' };
  for (const h of HALLS) if (Math.abs(x - h.c[0]) < h.hw && Math.abs(z - h.c[1]) < h.hd) return { use: h.use, at: h.c, upper: false, same: 'hall:' + h.id };
  for (const s of sites()) if (s.use !== 'house' && inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const s of sites()) if (s.use === 'house' && inRect(s.rect, x, z)) return { use: 'house', at: s.at, upper: false, same: s.id };
  return null;
}
/** What each room sounds like inside: `tone` [lowpass Hz, level], `roof` the rain on its tiles, `hush` how much of the outdoors, `work` small voices [voice, gap s]. */
export const ROOMS = {
  shop: { tone: [900, 0.3], roof: 1.0, hush: 0.8, work: [['coin', 50]] },
  wineshop: { tone: [1300, 0.5], roof: 1.0, hush: 0.9, work: [['jarLid', 40], ['pourWine', 50]] },
  hall: { tone: [500, 0.25], roof: 0.7, hush: 0.5, work: [['tcWoodfish', 30]] },
  scriptorium: { tone: [800, 0.2], roof: 0.8, hush: 0.6, work: [['brush', 16], ['paper', 24]] },
  cell: { tone: [700, 0.15], roof: 1.0, hush: 0.6, work: [['paper', 50]] },
  house: { tone: [800, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  pagoda: { tone: [320, 0.3], roof: 0.5, hush: 0.3, work: [] },
  office: { tone: [800, 0.2], roof: 0.9, hush: 0.7, work: [['abacus', 40]] },
};
export const UPPER = { tone: [260, 0.2], roof: 0.9, hush: 0.25, work: [] };
