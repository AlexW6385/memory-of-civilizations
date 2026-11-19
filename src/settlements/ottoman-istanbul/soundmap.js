// Where the sounds of Ottoman Istanbul about 1560 are (docs/settlements/ottoman-istanbul.md §19): the places of the emitters and the geometry the audio
// engine needs to put each sound where it is made — the fountains, the coppersmiths' shops, the soup kitchen, the bath, the medreses, the coffee house,
// the market's lanes, the streets, the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by the voices of src/engine/voices-ottoman.js (`schedule: 'placedOttoman'`).
// Coordinates: metres, +x east, +z south, the settlement's own frame (as the camera has in it).

import { PRECINCT, MOSQUE, TOMB, HAMAM, IMARET, MEDRESES, CARSI, CESMES, MESCIT, TERRACE, TOP, RADIUS, DARUSSIFA, COFFEE, lots, lanes, openSet, arastaShopData, height, inRect } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the way in, at the outer court's north gate). */
export const HOME = [0, -91];
export const schedule = 'placedOttoman';

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));

/** The courtyard's şadırvan (the middle of the court between the hall's north wall and the arcade: styles/ottoman/index.js) and the places the court's flocks of pigeons settle (court-life.js). */
export const SADIRVAN = [0, -28.2];
export const PRAYER_HALL = (() => { const hw = MOSQUE.d * 1.1 - 2.6; return [MOSQUE.c[0] - hw, MOSQUE.c[1] - hw, MOSQUE.c[0] + hw, MOSQUE.c[1] + hw]; })();
const COURT = [-24.5, -47.3, 24.5, -9.2];                                    // the courtyard of the mosque
/** The street fountains' taps: the back's middle moved out 0.8 m the way each faces. */
export const TAPS = CESMES.map(([x, z, f]) => [x + (f === 'e' ? 0.8 : f === 'w' ? -0.8 : 0), z + (f === 's' ? 0.8 : 0)]);
/** Open shops (layout openSet) with a trade: the sounds of their work come from them. */
const WORK = {
  coppersmith: [['copperBeat', [9, 22], [7.5, 17.5]]],
  baker: [['ovenPeel', [14, 34], [2.5, 11]]],
  cobbler: [['lastTap', [14, 34], [7.5, 17.5]]],
  weaver: [['loom', [10, 24], [7, 18]]],
  potter: [['wheel', [30, 60], [8, 17]]],
  butcher: [['chop', [14, 34], [6.5, 16]]],
  tailor: [['scissors', [20, 50], [8, 18]]],
  attar: [['mortar', [18, 40], [7, 18]]],
  sherbet: [['trayCups', [18, 40], [9, 20]]],
  saddler: [['lastTap', [20, 50], [8, 17]]],
};
let SITES = null;
/** The open shops with sounds near the arrival (the nearest 22, so that the scheduler's list stays short): { use, trade, rect, at: [x, z], id: 'lot:' + seed, work }. */
export function sites() {
  if (SITES) return SITES;
  const d = (l) => Math.hypot(mid(l.rect)[0] - HOME[0], mid(l.rect)[1] - HOME[1]);
  SITES = [...openSet()].filter((l) => l.shop && WORK[l.trade]).sort((a, b) => d(a) - d(b)).slice(0, 22).map((l) => ({ use: l.trade, trade: l.trade, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[l.trade] }));
  return SITES;
}

let EM = null;
/**
 * The fixed emitters: { voice, at, r50 (m at which it is half as loud), gap [min, max] s, hours [from, to] (local; wrapping midnight when from > to), dry, rainMax, season, lv, inside, after }.
 * [inferred: positions from the plan of the külliye (layout.js) and the dossier's furnishing; hours from the trades and the prayers' times.]
 */
export function emitters() {
  if (EM) return EM;
  EM = [];
  const add = (e) => EM.push(e);
  // water: the şadırvan of the courtyard, the street fountains, the pools of the medreses' courts, the hospital's, the mescit's ablution basins
  add({ voice: 'ottFountain', at: SADIRVAN, r50: 9, gap: [4, 8], hours: [3.5, 23.5], id: 'sadirvan' });
  TAPS.forEach((p, i) => add({ voice: 'tap', at: p, r50: 5, gap: [7, 16], hours: [4, 23], id: 'cesme' + i }));
  for (const q of MEDRESES) add({ voice: 'ottFountain', at: mid(q.rect), r50: 6, gap: [12, 26], hours: [5, 21], lv: 0.5, id: 'pool:' + q.id });
  add({ voice: 'ottFountain', at: [DARUSSIFA[0] + 4.4 * 3.5, mid(DARUSSIFA)[1]], r50: 6, gap: [14, 30], hours: [5, 21], lv: 0.5, id: 'pool:hospital' });
  add({ voice: 'tap', at: [MESCIT.rect[0] + 1, MESCIT.rect[1] - 1], r50: 4, gap: [10, 24], hours: [4, 23], lv: 0.8, id: 'ablution:a' }, { voice: 'tap', at: [MESCIT.rect[2] - 1, MESCIT.rect[1] - 1], r50: 4, gap: [12, 28], hours: [4, 23], lv: 0.8, id: 'ablution:b' });
  // the hamam: drops and bowls in the hot room (heard whole inside, through the walls from outside)
  add({ voice: 'hamamDrip', at: mid(HAMAM), r50: 7, gap: [4, 9], hours: [6, 22], inside: 'hamam', id: 'hamam' });
  // the soup kitchen: the ladle on the cauldron and the pestle in the north kitchens, the bread oven at the east corner
  add({ voice: 'ladle', at: [IMARET[0] + 22, IMARET[1] + 6], r50: 10, gap: [10, 24], hours: [4.5, 19], inside: 'imaret', id: 'imaret:k' });
  add({ voice: 'ovenPeel', at: [IMARET[2] - 3, IMARET[1] + 4], r50: 8, gap: [18, 40], hours: [2.5, 11], inside: 'imaret', id: 'imaret:o' });
  // the medreses: students reciting in the dershanes (on the far side of each court from the mosque)
  for (const q of MEDRESES) add({ voice: 'recite', at: [mid(q.rect)[0], q.rect[3] - 5], r50: 11, gap: [30, 80], hours: [5.5, 20], inside: 'medrese:' + q.id, id: 'recite:' + q.id });
  add({ voice: 'recite', at: [TOMB.c[0] + 1, TOMB.c[1] + 2.5], r50: 5, gap: [40, 100], hours: [7, 19], inside: 'tomb', id: 'recite:tomb', lv: 0.8 });
  // the coffee house on the lane west of the terrace: backgammon, the murmur at the benches, cups; a ney in the evening
  const c = COFFEE(), cm = mid(c.rect);
  add({ voice: 'tavla', at: cm, r50: 7, gap: [14, 36], hours: [7, 22.5], inside: 'kahve', id: 'kahve:tavla' });
  add({ voice: 'teaTalk', at: cm, r50: 8, gap: [8, 16], hours: [7, 22.5], inside: 'kahve', id: 'kahve:talk', lv: 0.9 });
  add({ voice: 'teaClink', at: cm, r50: 6, gap: [6, 14], hours: [7, 22.5], inside: 'kahve', id: 'kahve:cups' });
  add({ voice: 'ney', at: cm, r50: 22, gap: [70, 170], hours: [17, 22], rainMax: 0.4, after: true, inside: 'kahve', id: 'kahve:ney' });
  // the vaulted shops of the two avenues: the coppersmiths (east row) beating, the cloth sellers (west row) quiet; each a shop of its own by the hash of its place
  for (const s of arastaShopData()) {
    const at = [s.xb + s.sg * 2.4, s.zc];
    if (s.goods === 'copper' && hash(s.xb, s.zc, 5) < 0.45) add({ voice: 'copperBeat', at, r50: 7, gap: [8, 22], hours: [7.5, 17.5], rainMax: 0.6, id: 'ar:' + s.f + s.zc.toFixed(1) });
    else if (s.goods === 'cloth' && hash(s.xb, s.zc, 6) < 0.15) add({ voice: 'clothRustle', at, r50: 4, gap: [20, 50], hours: [7.5, 18], id: 'ar:' + s.f + s.zc.toFixed(1) });
  }
  // the market's lanes: the goldsmiths' taps in the jewellers' lane, murmur in the bedesten, the booksellers' paper, cloth, the shoe lane's last-taps
  const L = Object.fromEntries(CARSI.lanes.map((l) => [l.id, l]));
  const pt = (l, k) => (l.horiz ? [l.a + (l.b - l.a) * k, l.c] : [l.c, l.a + (l.b - l.a) * k]);
  for (const k of [0.25, 0.7]) add({ voice: 'ottGoldTap', at: pt(L.kuyumcular, k), r50: 6, gap: [9, 24], hours: [8, 17.5], id: 'gold' + k });
  add({ voice: 'lastTap', at: pt(L.haffaflar, 0.5), r50: 6, gap: [14, 30], hours: [8, 17.5], id: 'shoes' });
  add({ voice: 'paper', at: pt(L.sahaflar, 0.5), r50: 4, gap: [18, 40], hours: [8, 17.5], id: 'books' });
  add({ voice: 'clothRustle', at: pt(L.zenneciler, 0.6), r50: 5, gap: [14, 34], hours: [8, 17.5], id: 'cloth' });
  add({ voice: 'teaTalk', at: mid(CARSI.bedesten), r50: 11, gap: [8, 16], hours: [8.5, 16], inside: 'bedesten', id: 'bedesten', lv: 0.9 });
  // the soup kitchen's donkeys at its gate, bringing the firewood
  add({ voice: 'donkeyBray', at: [IMARET[0] - 3.5, IMARET[1] + 16], r50: 18, gap: [60, 150], hours: [6, 17], id: 'donkeys' });
  // the open shops of the quarter near the way in
  for (const s of sites()) for (const [voice, gap, hours] of s.work) add({ voice, at: s.at, r50: 7, gap, hours, inside: s.id, id: s.id + voice, ...(voice === 'copperBeat' ? { rainMax: 0.6 } : {}) });
  return EM;
}

// ── the streets ───────────────────────────────────────────────────────────────
let STREETS = null;
/** The rects of the ways a trader or a patrol walks: the avenues, the street before the north gate, the court's forecourt, the south street, the market's lanes, the quarter's lanes near the terrace. */
export function streets() {
  if (STREETS) return STREETS;
  const [p0, q0, p1, q1] = PRECINCT;
  STREETS = [[-86, q0 - 4, -77, q1 + 8], [77, q0 - 4, 86, q1 + 8], [p0 + 8, q0 - 14, p1 - 8, q0 - 2], [-60, q0 + 3, 60, q0 + 32], [-146, q1 + 2, 72, q1 + 20]];
  for (const l of CARSI.lanes) STREETS.push(l.horiz ? [l.a, l.c - 1.5, l.b, l.c + 1.5] : [l.c - 1.5, l.a, l.c + 1.5, l.b]);
  for (const { r } of lanes()) if (Math.abs((r[0] + r[2]) / 2) < 260 && Math.abs((r[1] + r[3]) / 2) < 260) STREETS.push(r);
  return STREETS;
}
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];
/** A walker's track along the street nearest to (x, z) within `reach`, passing its nearest point; null if none (or inside the terrace's own court: a street is not there). */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  streets().forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = streets()[best.i], horiz = r[2] - r[0] > r[3] - r[1], m = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.6;
  return horiz ? { pts: [[a, m + off], [b, m + off]] } : { pts: [[m + off, a], [m + off, b]] };
}
/** A point over the roofs near the listener for swifts and crows (35–90 m round, high: the x, z only). */
export function skyPoint(x, z, rnd) { const a = rnd() * Math.PI * 2, d = 25 + rnd() * 60; return [x + Math.cos(a) * d, z + Math.sin(a) * d]; }
/** A point far to the north, over the Golden Horn (800 m away, beyond the settlement), where the gulls are: placed 200–330 m north of the listener, bearing a little either side. */
export function northPoint(x, z, rnd) { return [x + (rnd() - 0.5) * 220, z - 200 - rnd() * 130]; }

// ── what the land makes sound of ──────────────────────────────────────────────
/** 0…1: the outer court and the courtyard (the pigeons' ground). */
export const courtNear = (x, z) => (inRect(PRECINCT, x, z) || inRect(COURT, x, z) ? 1 : 1 - sm(0, 14, rectDist(PRECINCT, x, z)));
/** No bamboo and no lotus in Istanbul. */
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0…1: how much broad-leaved tree is round: the plane trees and cypresses of the outer court's sides, the yards of the quarter (a little everywhere in it). */
export const leafNear = (x, z) => Math.max(0.55 * courtNear(x, z), 0.3 * (1 - sm(40, 330, Math.hypot(x, z))), 0.15);
/** 0…1: how much green round (the cicadas, the insects): the court's trees, the burial garden, the yards, the rim. */
export const greenNear = (x, z) => Math.max(0.35 * courtNear(x, z), inRect([-62, 54, 64, 86], x, z, 6) ? 0.7 : 0, 0.25 * sm(120, 300, Math.hypot(x, z)), 0.1);
/** 0…1: how much of the town's hubbub reaches (x, z): all in the avenues, the court and the lanes, less toward the rim. */
export const townNear = (x, z) => (inRect(PRAYER_HALL, x, z) ? 0.3 : Math.max(0.12, 1 - 0.7 * sm(240, 360, Math.hypot(x, z))));
/** No frogs or ponds in the settlement. */
export const frogGround = () => 0;
export const canalSpot = () => null;
export const shoreSpot = () => null;
export const pondSpot = () => null;
export const treeSpot = (x, z, rnd, reach = 40) => { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach; return [x + Math.cos(a) * d, z + Math.sin(a) * d]; };

// ── the rooms ─────────────────────────────────────────────────────────────────
/**
 * The room the listener is in: { use, at, upper, same } or null in the open. Uses: mosque (the prayer hall), tomb, kahve (the coffee house), hamam, bedesten,
 * shop (a vaulted shop of an avenue), a trade of the quarter (its shop), house (any other lot).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(PRAYER_HALL, x, z)) return { use: 'mosque', at: mid(PRAYER_HALL), upper: false, same: 'mosque' };
  if (Math.hypot(x - TOMB.c[0], z - TOMB.c[1]) < TOMB.r) return { use: 'tomb', at: TOMB.c, upper: false, same: 'tomb' };
  if (inRect(HAMAM, x, z)) return { use: 'hamam', at: mid(HAMAM), upper: false, same: 'hamam' };
  if (inRect(CARSI.bedesten, x, z)) return { use: 'bedesten', at: mid(CARSI.bedesten), upper: false, same: 'bedesten' };
  if (inRect(IMARET, x, z) && x > IMARET[0] + 5 && x < IMARET[2] - 5 && z < IMARET[1] + 12) return { use: 'kitchen', at: [IMARET[0] + 22, IMARET[1] + 6], upper: false, same: 'imaret' };
  const c = COFFEE();
  if (inRect(c.rect, x, z)) return { use: 'kahve', at: mid(c.rect), upper: false, same: 'kahve' };
  for (const s of arastaShopData()) if (z > s.za && z < s.zb && x > Math.min(s.xb, s.xb + s.sg * s.d) && x < Math.max(s.xb, s.xb + s.sg * s.d)) return { use: 'shop', at: [s.xb + s.sg * 2, s.zc], upper: false, same: 'ar:' + s.f + s.zc.toFixed(1) };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: l.shop ? l.trade : 'house', at: mid(l.rect), upper: y > l.y + 3.2, same: 'lot:' + l.seed };
  return null;
}
/**
 * What each room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the roof is from inside
 * (relative: lead domes soft, tiles louder), `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
const house = { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] };
export const ROOMS = {
  mosque: { tone: [150, 0.3], roof: 0.55, hush: 0.4, work: [['recite', 55], ['clothRustle', 26]] },      // a vast, soft room under lead: the call's echo, a murmur of prayer, carpets
  tomb: { tone: [120, 0.25], roof: 0.6, hush: 0.4, work: [['recite', 50]] },
  kahve: { tone: [500, 0.5], roof: 1.0, hush: 0.9, work: [['tavla', 18], ['teaClink', 8]] },
  hamam: { tone: [300, 0.5], roof: 0.8, hush: 0.5, work: [['hamamDrip', 5], ['pour', 22]] },
  bedesten: { tone: [260, 0.4], roof: 0.5, hush: 0.5, work: [['clothRustle', 30], ['coin', 40]] },
  kitchen: { tone: [420, 0.5], roof: 0.9, hush: 0.8, work: [['ladle', 20], ['kitchen', 14]] },
  shop: { tone: [300, 0.25], roof: 0.8, hush: 0.9, work: [['clothRustle', 40]] },
  house,
  baker: { tone: [380, 0.4], roof: 1.0, hush: 0.9, work: [['ovenPeel', 16]] },
  coppersmith: { tone: [420, 0.4], roof: 1.0, hush: 1.0, work: [['copperBeat', 14]] },
  cobbler: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['lastTap', 18]] },
  weaver: { tone: [340, 0.35], roof: 1.0, hush: 0.8, work: [['loom', 20]] },
  potter: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  butcher: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['chop', 18]] },
  tailor: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['scissors', 24]] },
  attar: { tone: [280, 0.25], roof: 1.0, hush: 0.7, work: [['mortar', 24], ['drawer', 40]] },
  sherbet: { tone: [320, 0.3], roof: 1.0, hush: 0.9, work: [['trayCups', 20]] },
  saddler: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['lastTap', 26]] },
  grocer: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  barber: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['scissors', 40]] },
};
/** The upper rooms of the timber houses: close under the tiles, the rain loud, nearly silent. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['clothRustle', 30], ['broom', 80]] };
void TOP; void RADIUS; void TERRACE; void height;
