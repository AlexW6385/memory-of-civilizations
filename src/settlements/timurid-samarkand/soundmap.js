// Where the sounds of Timurid Samarkand are (docs/settlements/timurid-samarkand.md §20.3): the places of its emitters and the geometry the audio
// engine needs to put each sound where it is made — the hawkers at the Registan's booths, the tea-houses' dutar and doira, the coppersmiths, the trades
// of the houses (potter's wheel, smith's hammer, loom, plane, the paper-maker's stamping), the lecture in the madrasa and the recitation in the mosques,
// the aryk's trickle, the doves, the caravan's camp, the dusk's nawbat from the citadel, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js with the voices of
// src/engine/voices-timurid.js. Coordinates: metres, +x east, +z south, the settlement's own frame. What the engine's scheduler asks of a map and
// Samarkand has not (boats, a pond, bamboo, frogs, the Chinese street-vendors' walk) is answered with nothing.

import { RADIUS, SQUARE, MADRASA, KHANQAH, SHOPS_N, SHOPS_S, TAPCHANS, BAZAAR, CHORSU, BIBI, GUR, OBS, ARYK_X, inRect, houses, houseGeom, houseAt, onAryk, marketLayout } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the Registan). */
export const HOME = [14, 0];
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// ── the rooms of the landmarks (the numbers of plan.js's `rooms` and town.js's, kept equal by tests/samarkand-sound.test.mjs) ──
export const CLASSROOM = [-58, -25.6, -47.4, -18.5];
export const LIBRARY = [-58, 18.5, -47.4, 25.6];
export const LECTURE = [-117.4, -24.4, -108, -18];
export const SCIENCES = [-117.4, 18, -108, 24.4];
export const MADRASA_MOSQUE = [-117.4, -17.4, -114, 17.4];
export const KHANQAH_HALL = [KHANQAH.rect[2] - 17, -6, KHANQAH.rect[2] - 5, 6];
export const PASSAGE = (() => { const zm = (MADRASA[1] + MADRASA[3]) / 2; return [-59, zm - 6, -45, zm + 6]; })();
export const BIBI_HALL = (() => { const x = BIBI.c[0] - 0.7071 * 62, z = BIBI.c[1] + 0.7071 * 62; return [x - 8, z - 8, x + 8, z + 8]; })();
export const GUR_TOMB = (() => { const cx = (GUR.rect[0] + GUR.rect[2]) / 2, cz = GUR.rect[3] - 13; return [cx - 6, cz - 6, cx + 6, cz + 6]; })();
export const OBS_HALL = [OBS.c[0] - 14, OBS.c[1] - 14, OBS.c[0] + 14, OBS.c[1] + 14];
/** The entered shops of the two rows (the indices `enter` of plan.js): { rect, at }. */
export const ENTERED = [[SHOPS_N, 'n', [3, 8, 14, 19, 24]], [SHOPS_S, 's', [5, 11, 17, 21, 24]]].flatMap(([r, row, idx]) => {
  const nU = Math.max(1, Math.round((r[2] - r[0]) / 3.6)), w = (r[2] - r[0]) / nU;
  return idx.map((i) => { const q = [r[0] + i * w + 0.5, r[1], r[0] + (i + 1) * w - 0.5, r[3]]; return { rect: q, at: mid(q), id: `shop:${row}${i}` }; });
});

// ── the trades of the houses (life.js: a house that is not rich, and two in three of those, has the room of its trade) ──
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The work heard from each trade's room: [voice, gap [min, max] s, hours [from, to]]. [inferred from the trade] */
const WORK = {
  potter: [['wheel', [30, 60], [7.5, 17.5]]],
  baker: [['kitchen', [10, 22], [4.5, 20]]],
  smith: [['hammer', [12, 30], [7, 18]]],
  weaver: [['loom', [10, 24], [7, 18.5]]],
  carpenter: [['plane', [14, 34], [7.5, 17.5]]],
  grocer: [['drawer', [30, 70], [7, 19]], ['coin', [40, 90], [7, 19]]],
  papermaker: [['paper', [8, 18], [6.5, 18]]],      // the stamping and pounding of mulberry bark [stated: Samarkand paper, Wikipedia] and the sheets lifted
};
/** The room of the trade of a furnished house, in its own frame (the wing at one end, beside the court: houses.js timHouse, life.js `homes`): a rect in the world. */
function tradeRoom(h) {
  const G = houseGeom(h), q = rng(h.seed + 7); q(); if (!h.rich) q();
  const rsgn = q() < 0.5 ? -1 : 1, W = G.W, D = G.D, zf = -D / 2 + 4.8, zs = D / 2 - 4.6, dW = 4.3;
  const u0 = rsgn < 0 ? -W / 2 : W / 2 - dW, u1 = rsgn < 0 ? -W / 2 + dW : W / 2;
  const a = G.toWorld(u0, zf), b = G.toWorld(u1, zs);
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}
export const hasTrade = (h) => h.full && !h.garden && !(h.rich || h.seed % 3 === 0);

let SITES = null;
/** The rooms with sounds: { use, rect, at, id, work, y? } — the entered shops of the rows, the trade rooms of the houses. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  const SHOP = [['coin', [40, 90], [8, 18.5]], ['teaClink', [30, 70], [8, 19]]];
  for (const s of ENTERED) SITES.push({ use: 'shop', rect: s.rect, at: s.at, id: s.id, work: SHOP, y: 0 });
  for (const h of houses()) if (hasTrade(h)) { const r = tradeRoom(h); SITES.push({ use: 'trade:' + h.trade, rect: r, at: mid(r), id: `trade:${h.seed}`, work: WORK[h.trade], y: 0.1, house: h }); }
  return SITES;
}

// ── the rooms ────────────────────────────────────────────────────────────────
const BAZ_RECTS = BAZAAR.map(({ a, b }) => { const horiz = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]); return horiz ? [Math.min(a[0], b[0]), a[1] - 2.5, Math.max(a[0], b[0]), a[1] + 2.5] : [a[0] - 2.5, Math.min(a[1], b[1]), a[0] + 2.5, Math.max(a[1], b[1])]; });
/**
 * The room the listener is in, from its place: { use, at, upper, same } or null in the open. Uses: classroom, mosque (the madrasa's, the khanqah's hall,
 * Bibi-Khanym's sanctuary), hall (the other madrasa halls, the passage), tomb (Gur-e Amir), observatory, shop (an entered shop), trade:<kind>, bazaar (the
 * vaulted street), house (the other rooms of a courtyard house; its court is the open).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(CLASSROOM, x, z)) return { use: 'classroom', at: mid(CLASSROOM), upper: false, same: 'classroom' };
  for (const [r, id] of [[LIBRARY, 'library'], [LECTURE, 'lecture'], [SCIENCES, 'sciences']]) if (inRect(r, x, z)) return { use: 'hall', at: mid(r), upper: false, same: id };
  if (inRect(MADRASA_MOSQUE, x, z)) return { use: 'mosque', at: mid(MADRASA_MOSQUE), upper: false, same: 'madrasa-mosque' };
  if (inRect(KHANQAH_HALL, x, z)) return { use: 'mosque', at: mid(KHANQAH_HALL), upper: false, same: 'khanqah' };
  if (inRect(PASSAGE, x, z)) return { use: 'hall', at: mid(PASSAGE), upper: false, same: 'passage' };
  if (inRect(BIBI_HALL, x, z)) return { use: 'mosque', at: mid(BIBI_HALL), upper: false, same: 'bibi' };
  if (inRect(GUR_TOMB, x, z)) return { use: 'tomb', at: mid(GUR_TOMB), upper: false, same: 'gur' };
  if (inRect(OBS_HALL, x, z) && y > OBS.y - 1) return { use: 'observatory', at: mid(OBS_HALL), upper: false, same: 'observatory' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: y > (s.y ?? 0) + 3.4, same: s.id };
  for (let i = 0; i < BAZ_RECTS.length; i++) if (inRect(BAZ_RECTS[i], x, z)) return { use: 'bazaar', at: [Math.max(BAZ_RECTS[i][0] + 2.5, Math.min(BAZ_RECTS[i][2] - 2.5, x)), z], upper: false, same: 'bazaar' + i };
  const h = houseAt(x, z);
  if (h && h.full) {
    const G = houseGeom(h), l = G.toWorld(0, 0);
    // (the court is the open air; the rooms round it, the street passage and the upper floors are within)
    const court = Math.abs(x - l[0]) < G.W / 2 - 4.3 && Math.abs(z - l[1]) < G.D / 2 - 4.7 && y < 3.4;
    if (!court || y > 3.4) return { use: 'house', at: [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2], upper: y > 3.4, same: 'house:' + h.seed };
  }
  return null;
}
/** What each room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` how loud the rain on the flat roof is (mud and straw over beams: dull), `hush` how much of the outdoors comes through, `work` the small voices made in it [voice, gap s]. */
const R0 = { tone: [280, 0.25], roof: 0.7, hush: 0.8, work: [['broom', 90]] };
export const ROOMS = {
  house: { ...R0, work: [['broom', 90], ['pour', 60]] },
  shop: { tone: [330, 0.3], roof: 0.7, hush: 0.9, work: [['coin', 40], ['teaClink', 50]] },
  'trade:potter': { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['wheel', 30], ['clay', 40]] },
  'trade:baker': { tone: [420, 0.45], roof: 0.8, hush: 0.8, work: [['kitchen', 14]] },
  'trade:smith': { tone: [500, 0.4], roof: 0.7, hush: 0.9, work: [['hammer', 16]] },
  'trade:weaver': { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['loom', 14]] },
  'trade:carpenter': { tone: [320, 0.3], roof: 0.7, hush: 0.8, work: [['plane', 18]] },
  'trade:grocer': { tone: [300, 0.25], roof: 0.7, hush: 0.8, work: [['drawer', 36], ['coin', 50]] },
  'trade:papermaker': { tone: [360, 0.3], roof: 0.7, hush: 0.85, work: [['paper', 10], ['pour', 40]] },
  classroom: { tone: [240, 0.2], roof: 0.9, hush: 0.5, work: [['timLecture', 40]] },
  hall: { tone: [200, 0.2], roof: 0.9, hush: 0.5, work: [['clothRustle', 70]] },
  mosque: { tone: [130, 0.3], roof: 0.45, hush: 0.4, work: [['timRecite', 60], ['clothRustle', 70]] },
  tomb: { tone: [110, 0.3], roof: 0.4, hush: 0.3, work: [['timRecite', 90]] },
  observatory: { tone: [160, 0.25], roof: 0.5, hush: 0.45, work: [['clothRustle', 70], ['drawer', 120]] },
  bazaar: { tone: [330, 0.45], roof: 0.4, hush: 0.9, work: [['teaTalk', 16], ['coin', 40]] },     // the vaulted street: a murmur, no rain heard through the brick
};
export const UPPER = { tone: [210, 0.12], roof: 1.0, hush: 0.6, work: [['clothRustle', 50], ['broom', 90]] };

// ── the water: the aryk ──────────────────────────────────────────────────────
export const WELLS = [];
/** The nearest running water (an aryk lane's channel) to (x, z) within 60 m: { p: [x, z], d }, or null. */
export function canalSpot(x, z) {
  let best = null;
  for (const ax of ARYK_X) {
    if (Math.abs(ax - x) > 60) continue;
    for (let dz = -60; dz <= 60; dz += 4) { const pz = z + dz; if (!onAryk(ax, pz, 0.3)) continue; const d = Math.hypot(ax - x, pz - z); if (d < 60 && (!best || d < best.d)) best = { p: [ax, pz], d }; }
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

// ── the planting and the town ────────────────────────────────────────────────
/** Is there a tree at (x, z): the orchards of the outer ring, the plane trees and poplars along an aryk, the tree in a court. */
function treeAt(x, z) {
  if (Math.hypot(x, z) > RADIUS - 70 && Math.hypot(x, z) < RADIUS) return true;
  for (const ax of ARYK_X) if (Math.abs(x - ax) < 2.2 && onAryk(ax, z, 0.3)) return true;
  const h = houseAt(x, z);
  if (h) for (const t of houseGeom(h).trees) if (Math.hypot(t.at[0] - x, t.at[1] - z) < 3.5) return true;
  return false;
}
/** 0…1: how much green round (x, z), for the insects: the orchards, the aryk's trees, the courts a little. */
export function greenNear(x, z) {
  const orchard = sm(RADIUS - 110, RADIUS - 60, Math.hypot(x, z));
  let aryk = 0;
  for (const ax of ARYK_X) if (Math.abs(x - ax) < 8) aryk = Math.max(aryk, 0.45 * (1 - Math.abs(x - ax) / 8));
  const sq = 1 - sm(0, 20, rectDist(SQUARE, x, z));
  return Math.max(0.9 * orchard, aryk, 0.14 * (1 - 0.6 * sq));
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 14; k++) { const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (treeAt(px, pz)) return [px, pz]; }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): all on the Registan and in the bazaar, some in the lanes, little at the rim. */
export function townNear(x, z) {
  if (inRect(SQUARE, x, z, 14)) return 1;
  for (const r of BAZ_RECTS) if (inRect(r, x, z, 8)) return 1;
  if (Math.hypot(x - CHORSU.c[0], z - CHORSU.c[1]) < 30) return 1;
  return Math.max(0.1, 0.75 * (1 - sm(120, RADIUS, Math.hypot(x, z))));
}

// ── the emitters in the open ─────────────────────────────────────────────────
const { stalls } = marketLayout();
/** The booths whose keepers cry their wares: the melon, bread and cloth of the middle rows, every third of each kind. */
const HAWK = { melon: 'timHawkMelon', bread: 'timHawkBread', cloth: 'timHawkCloth', carpets: 'timHawkCloth' };
const hawkers = (() => {
  const seen = {}, out = [];
  for (const [x, z, , kind] of stalls) {
    const v = HAWK[kind]; if (!v) continue;
    seen[kind] = (seen[kind] || 0) + 1;
    if (seen[kind] % 3 === 1) out.push({ voice: v, at: [x, z + (z < 0 ? 1 : -1)], r50: 17, gap: [36, 90], hours: kind === 'bread' ? [5.5, 10.5] : [7, 17], rainMax: 0.5, id: `hawk:${kind}${seen[kind]}` });
  }
  return out;
})();
/** Points along the aryk lanes every 64 m where a channel runs (a trickle heard from within 25 m): the town's water. */
const arykPoints = (() => {
  const out = [];
  for (const ax of ARYK_X) for (let z = -RADIUS + 40; z < RADIUS - 40; z += 64) if (onAryk(ax, z, 0.3) && Math.hypot(ax, z) < RADIUS - 40) out.push([ax, z]);
  return out;
})();
const CAMP = [33, -12], DOVES = [[-45, -14], [-45, 14], [-83, 0], [-62, 21], [BIBI.c[0] - 10, BIBI.c[1] + 40], [-150, 150 + 12]];
/**
 * Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] (local; wrapping midnight when from > to), dry,
 * rainMax, lv, after, inside }. The shops' and the trades' work comes from sites(). [inferred; the sources for the places and hours are in the dossier §20.3]
 */
export const EMITTERS = [
  // the nawbat of drums and long trumpets at dusk, from the citadel off the disc to the north-west [inferred: a Timurid court's naqqara-khana]
  { voice: 'timNawbat', at: [-260, -250], r50: 150, gap: [30, 40], hours: [17.9, 18.6], rainMax: 0.85, after: true, id: 'nawbat:dusk' },
  ...hawkers,
  // the tea-houses: talk, cups, at evening the dutar and the doira (the platforms of the Registan)
  ...TAPCHANS.map(([x, z], i) => ({ voice: 'teaTalk', at: [x, z], r50: 8, gap: [8, 16], hours: [6.5, 22.5], lv: 0.8, id: 'tea:talk' + i })),
  ...TAPCHANS.map(([x, z], i) => ({ voice: 'teaClink', at: [x + 1, z], r50: 6, gap: [10, 22], hours: [6.5, 22.5], id: 'tea:cups' + i })),
  { voice: 'timDutar', at: [TAPCHANS[1][0], TAPCHANS[1][1]], r50: 16, gap: [60, 140], hours: [15.5, 22.5], rainMax: 0.5, after: true, id: 'tea:dutar:n' },
  { voice: 'timDutar', at: [TAPCHANS[4][0], TAPCHANS[4][1]], r50: 16, gap: [80, 160], hours: [16.5, 22.5], rainMax: 0.5, after: true, id: 'tea:dutar:s' },
  { voice: 'timDoira', at: [TAPCHANS[4][0] + 1, TAPCHANS[4][1]], r50: 15, gap: [70, 150], hours: [16.5, 22.5], rainMax: 0.5, after: true, id: 'tea:doira' },
  // the coppersmiths: at the bazaar's streets and in the nearest shops of the rows
  ...[[75, 58], [130, 58], [100, 30], [100, 95], [-12, -46]].map(([x, z], i) => ({ voice: 'timCopper', at: [x, z], r50: 14, gap: [9, 24], hours: [7.5, 17.5], rainMax: 0.9, id: 'copper' + i })),
  { voice: 'timHawkCloth', at: [CHORSU.c[0] + 4, CHORSU.c[1] + 8], r50: 14, gap: [40, 100], hours: [8, 16.5], rainMax: 0.9, id: 'chorsu:broker' },
  // the madrasa's lecture in the classroom (heard from within it and through the walls), the recitations in the mosques
  { voice: 'timLecture', at: mid(CLASSROOM), r50: 9, gap: [40, 90], hours: [7.5, 17.5], inside: 'classroom', rainMax: 1, id: 'madrasa:lecture' },
  { voice: 'timRecite', at: mid(MADRASA_MOSQUE), r50: 10, gap: [60, 140], hours: [4.5, 21], inside: 'madrasa-mosque', lv: 0.8, rainMax: 1, id: 'madrasa:recite' },
  { voice: 'timRecite', at: mid(KHANQAH_HALL), r50: 10, gap: [60, 140], hours: [4.5, 21], inside: 'khanqah', lv: 0.8, rainMax: 1, id: 'khanqah:recite' },
  { voice: 'timRecite', at: mid(BIBI_HALL), r50: 12, gap: [60, 140], hours: [5, 20], inside: 'bibi', lv: 0.8, rainMax: 1, id: 'bibi:recite' },
  { voice: 'timRecite', at: mid(GUR_TOMB), r50: 9, gap: [80, 180], hours: [6, 19], inside: 'gur', lv: 0.7, rainMax: 1, id: 'gur:recite' },
  // doves on the cornices
  ...DOVES.map((at, i) => ({ voice: 'timDoves', at, r50: 18, gap: [10, 26], hours: [5.5, 19], rainMax: 0.5, id: 'dove' + i })),
  // the caravan's camp on the Registan's east side: a camel's groan with its bell, a laden donkey
  { voice: 'timCamel', at: CAMP, r50: 18, gap: [26, 70], hours: [5, 19], rainMax: 0.8, id: 'camp:camel' },
  { voice: 'donkeyBray', at: [29, 25], r50: 22, gap: [70, 160], hours: [6, 17], rainMax: 0.6, id: 'camp:donkey' },
  // the aryk: a trickle in every lane's channel
  ...arykPoints.map(([x, z], i) => ({ voice: 'timAryk', at: [x, z], r50: 9, gap: [8, 18], hours: [0, 24], lv: 0.8, id: 'aryk' + i })),
];

// ── what passes: a caravan along the bazaar's streets, the water carrier in the lanes, the night watch ─────────
/** The lanes between the lots: lines x = -328 + 24k and z = -328 + 24k (a 4 m lane every 24 m, layout.js houses()). */
function laneTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  for (const axis of [0, 1]) {
    const c = axis ? z : x, k = Math.round((c + 328) / 24), line = -328 + 24 * k, d = Math.abs(c - line);
    if (d < reach && (!best || d < best.d)) best = { axis, line, d };
  }
  if (!best) return null;
  const along = best.axis ? x : z, dir = rnd() < 0.5 ? 1 : -1, a = along - dir * lead * (0.5 + 0.7 * rnd()), b = along + dir * lead * (0.8 + 0.8 * rnd());
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 1.2, p = (u) => (best.axis ? [u, best.line + off] : [best.line + off, u]);
  return { pts: [p(a), p(b)] };
}
/** The bazaar street nearest to (x, z) within `reach`: a track along it from one end toward the other. */
function bazaarTrack(x, z, rnd, reach = 90) {
  let best = null;
  BAZAAR.forEach(({ a, b }, i) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)), d = Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z); if (d < reach && (!best || d < best.d)) best = { a, b, d }; });
  if (!best) return null;
  const flip = rnd() < 0.5, a = flip ? best.b : best.a, b = flip ? best.a : best.b;
  return { pts: [[a[0], a[1] + (rnd() - 0.5)], [b[0], b[1] + (rnd() - 0.5)]] };
}
export const TRACKS = [
  { key: 'caravan', voice: 'timCaravan', speed: 1.1, r50: 16, gap: [90, 200], ok: (h, rain) => h >= 6 && h < 18 && rain < 0.5, get: (x, z, r) => bazaarTrack(x, z, r) },
  { key: 'carrier', voice: 'timSaqqo', speed: 1.1, r50: 11, gap: [40, 90], ok: (h, rain) => h >= 6.5 && h < 18.5 && rain < 0.3, get: (x, z, r) => laneTrack(x, z, r, 60, 30) },
  { key: 'watch', voice: 'timWatch', speed: 1.0, r50: 12, gap: [34, 70], ok: (h, rain) => (h >= 20.5 || h < 4) && rain < 0.5, get: (x, z, r) => laneTrack(x, z, r, 80, 34) },
];
