// Where Edo Himeji's sounds are (docs/settlements/edo-himeji.md §10.2): the places of its emitters and the geometry the audio engine
// needs to put each sound where it is made (src/engine/voices.js `placed()`, voices-himeji.js): the moats, the streets, the middle
// moat's bridge, the houses at their trades, the castle's yards and halls, the planting, the rooms one can be inside. Pure data and
// functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`). Coordinates: metres, +x east,
// +z south, the settlement's frame. The hours of the time bell (`toki`) are the engine's own schedule (soundscape.js).
//
// The engine's scheduler was written for Suzhou and calls three walkers this town does not have, each by its own arguments:
// `streetTrack(…, 90, 40)` (a Chinese sedan chair), `streetTrack(…, 90, 34)` (the night watchman with his gong) and
// `streetTrack(…, 80, 30)` (the Chinese pedlars' cries), and `treeSpot(…, 40)` (the Chinese seasonal birds). Here those return null,
// and the town's own kago, watch, pedlars and birds are made by voices-himeji.js and voices-kyoto.js (Japan's birds and cicadas,
// reused as they are) through `pedlarTrack` and `treeSpot(…, 41)`, which do answer.

import '../../engine/voices-kyoto.js';
import '../../engine/voices-himeji.js';
import { RADIUS, INNER, OUTER, MIDDLE, STREET, OTEMON, KEEP, HON, NINO, DAI, lots, streets, furniture, inRect, inMoat, inMiddle, isOpen } from './layout.js';

/** Where the audio puts the listener when the engine gives none (the arrival, in the Honmaru's south yard). */
export const HOME = [-25, -3];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const nearIn = (r, x, z) => [Math.max(r[0], Math.min(r[2], x)), Math.max(r[1], Math.min(r[3], z))];

// ── the houses at their trades ──────────────────────────────────────────────────
/** What each trade's house makes heard: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the trade (dossier §5.3) and the work it needs]. */
const WORK = {
  cloth: [['scissors', [20, 50], [7, 18]]],
  pottery: [['wheel', [30, 60], [8, 17]]],
  rice: [['kine', [20, 50], [6, 17]]],
  dye: [['washCloth', [16, 36], [7, 17]]],
  oil: [['hjWedge', [24, 60], [7, 17]]],
  sandals: [['strawBeat', [18, 40], [7, 18]]],
  tea: [['kettleSimmer', [14, 30], [6, 21]], ['teaClink', [12, 30], [7, 20]]],
  medicine: [['mortar', [20, 50], [7, 18]]],
  paper: [['sukiya', [30, 70], [7, 17]]],
  fish: [['kitchen', [12, 28], [5, 14]]],
  tofu: [['pour', [14, 34], [4, 12]], ['kitchen', [18, 40], [4, 12]]],
  bucket: [['hjHoop', [16, 40], [7, 17]]],
  sake: [['vatStir', [30, 70], [4, 17]]],
};
let SITES = null;
/** The houses with sounds: a third of the open machiya of the trades above, by seed: { use, rect, at, id: 'lot:<seed>', work }. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (l.t !== 'machiya' || !isOpen(l) || !WORK[l.trade] || l.seed % 3) continue;
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use: l.trade, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[l.trade] });
  }
  return SITES;
}

// ── the castle's own places ─────────────────────────────────────────────────────
/** The opened storehouses (plan.js KURA_ROOMS, checked by the test) and the keep. */
export const KURA = [[8, -28, 15, -20], [17, -28, 24, -20], [-98, 2, -90, 10], [-86, 2, -78, 10]];
const HALL = [-76, -27, -52, -9];                                // the guards' hall of the Honmaru
const KEEPR = [KEEP.c[0] - 9, KEEP.c[1] - 8, KEEP.c[0] + 9, KEEP.c[1] + 8];
const RES = [-62, 96, 62, 172];                                  // the lord's residence (GOTEN)
const LANDINGS = furniture().filter((f) => f.t === 'landing');
/** The wells: the public wells of the merchants' street (layout furniture) and those of the baileys (plan.js). */
export const WELLS = [...furniture().filter((f) => f.t === 'ido').map((f) => f.at), [-46, 11], [46, -72], [-72, -14]];

// ── geometry of the water and the streets ───────────────────────────────────────
const [ix0, iz0, ix1, iz1] = INNER, [ox0, oz0, ox1, oz1] = OUTER, gx = OTEMON.w / 2;
const xm = Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) - 24;
/** The rectangles of the moats' water: the inner moat's ring (its south side cut by the causeway) and the middle moat on each side of its bridge. */
export const WATER = [[ox0, oz0, ox1, iz0], [ox0, iz0, ix0, iz1], [ix1, iz0, ox1, iz1], [ox0, iz1, -gx, oz1], [gx, iz1, ox1, oz1], [-xm, MIDDLE.z0, -MIDDLE.gap / 2, MIDDLE.z1], [MIDDLE.gap / 2, MIDDLE.z0, xm, MIDDLE.z1]];
const inWater = (x, z) => inMoat(x, z) || inMiddle(x, z);
/** The nearest point of the moats' water to (x, z), its distance (0 inside) and the index of the rectangle. */
export function canalSpot(x, z) {
  let best = null;
  WATER.forEach((r, i) => { const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (!best || d < best.d) best = { p, d, i }; });
  return best;
}
/** No boats' sound: the poled boats of the moats are moored or at their work (dossier §5.7), nothing is sculled here. */
export function canalTrack() { return null; }

/** A walker's track along the street nearest to (x, z) within `reach`, passing the nearest point; null if none. */
export function pedlarTrack(x, z, rnd, reach = 70, lead = 30) {
  let best = null;
  const S = streets();
  S.forEach((r, i) => { if (Math.min(r[2] - r[0], r[3] - r[1]) < 5) return; const p = nearIn(r, x, z), d = Math.hypot(p[0] - x, p[1] - z); if (d < reach && (!best || d < best.d)) best = { p, d, i }; });
  if (!best) return null;
  const r = S[best.i], horiz = r[2] - r[0] > r[3] - r[1], mid = horiz ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2;
  const lo = (horiz ? r[0] : r[1]) + 1, hi = (horiz ? r[2] : r[3]) - 1, near = Math.max(lo, Math.min(hi, horiz ? x : z));
  const dir = rnd() < 0.5 ? 1 : -1, a = Math.max(lo, Math.min(hi, near - dir * lead * (0.5 + 0.7 * rnd()))), b = Math.max(lo, Math.min(hi, near + dir * lead * (0.8 + 0.8 * rnd())));
  if (Math.abs(b - a) < 10) return null;
  const off = (rnd() - 0.5) * 2;
  return horiz ? { pts: [[a, mid + off], [b, mid + off]] } : { pts: [[mid + off, a], [mid + off, b]] };
}
/** The engine's street walkers (Chinese sedan chair, gong watchman, Chinese pedlar) do not exist here; the town's own come through `pedlarTrack`. */
export function streetTrack(x, z, rnd, reach = 70, lead = 30) {
  if (lead === 40 || lead === 34 || (reach === 80 && lead === 30)) return null;
  return pedlarTrack(x, z, rnd, reach, lead);
}
/** The timber bridge over the middle moat (its gap): a walker's track across it along the street's line, within `reach`. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  const bz = (MIDDLE.z0 + MIDDLE.z1) / 2, d = Math.hypot(x, z - bz);
  if (d > reach) return null;
  const h = (MIDDLE.z1 - MIDDLE.z0) / 2 + 4, s = rnd() < 0.5 ? 1 : -1, ox = (rnd() - 0.5) * 2;
  return { pts: [[ox, bz - s * h], [ox, bz + s * h]], d };
}
/** A point on a moat's water within `reach` of (x, z) (a ring of tries), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (canalSpot(x, z).d > reach + 8) return null;
  for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (inWater(px, pz)) return [px, pz]; }
  return null;
}
/** The moat's edge near (x, z): where a ray from it first crosses the water's edge, or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (canalSpot(x, z).d > reach) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inWater(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const w = inWater(x + c * d, z + s * d); if (w !== prev) return [x + c * d, z + s * d]; prev = w; }
  }
  return null;
}

// ── where the planting makes its sound ──────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const l of lots()) for (let i = Math.floor(l.rect[0] / 20); i <= Math.floor(l.rect[2] / 20); i++) for (let j = Math.floor(l.rect[1] / 20); j <= Math.floor(l.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(l); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((l) => inRect(l.rect, x, z));
};
/** 0…1: how wooded is (x, z): the hill with its pines, the samurai yards' trees, the willows of the moats, the merchants' street bare. */
export function treeness(x, z) {
  let m = 0.1;
  if (inRect(INNER, x, z)) m = Math.max(m, inRect(HON.rect, x, z, 30) || inRect(NINO.rect, x, z, 30) ? 0.8 : 0.5);
  const l = lotAt(x, z);
  if (l && l.t === 'yashiki') m = Math.max(m, 0.4);
  m = Math.max(m, 0.4 * (1 - sm(1, 16, canalSpot(x, z).d)));
  return m;
}
/**
 * A tree to put a cicada or a bird in, near (x, z), by the woodedness: null at once for the engine's own seasonal-bird call
 * (reach 40: the Chinese cuckoo, oriole, magpie and tit), which the Japanese voices replace (they ask with 41).
 */
export function treeSpot(x, z, rnd, reach = 40) {
  if (reach === 40) return null;
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && treeness(px, pz) > 0.25 + 0.6 * rnd()) return [px, pz];
  }
  return null;
}
/** 0…1: bamboo (at the walls of the samurai yards: dossier §5.7). */
export function bambooNear(x, z) { const l = lotAt(x, z); return l && l.t === 'yashiki' ? 0.3 : 0.12; }
/** 0…1: pines and broad leaves in wind (the hill's pines, the yards' maples, the moats' willows). */
export function leafNear(x, z) { return Math.min(1, Math.max(0.3 + 0.5 * treeness(x, z), 0.5 * (1 - sm(1, 14, canalSpot(x, z).d)))); }
/** No lotus (the dossier gives none). */
export function lotusNear() { return 0; }
/** 0…1: how much green round (x, z) for the insects: the castle's grounds, the yards, the moats' banks, the fields at the rim. */
export function greenNear(x, z) {
  const edge = sm(300, 360, Math.hypot(x, z)), bank = 0.55 * (1 - sm(1, 18, canalSpot(x, z).d));
  return Math.max(treeness(x, z) * 0.9, edge * 0.85, bank, 0.14);
}
/** 0…1: how much of the town's hubbub reaches (x, z): all of it in the merchants' street, some on the avenue and among the yashiki, little in the castle, none in the keep. */
export function townNear(x, z) {
  if (inRect(KEEPR, x, z)) return 0.08;
  if (inRect(INNER, x, z)) return 0.22;
  return Math.max(0.12, sm(MIDDLE.z0 - 60, STREET.z0, z) * 0.85 + 0.15) * (1 - 0.4 * sm(340, 400, Math.hypot(x, z)));
}
/** 0…1: wet ground (the frogs): the moats' water and banks, the fields at the rim. */
export function frogGround(x, z) { return Math.max(1 - sm(0, 30, canalSpot(x, z).d), sm(300, 360, Math.hypot(x, z)) * 0.9); }

// ── the rooms ───────────────────────────────────────────────────────────────────
/**
 * The room the listener is in: { use, at, upper, same } or null in the open. Uses: a trade's (cloth, pottery, rice, dye, oil, sandals, tea,
 * medicine, paper, fish, tofu, bucket, sake), house (a dwelling or a shop of no sound-making trade, a samurai house), hall (the guards' hall and
 * the lord's residence), kura (a storehouse), keep (the great keep, upper above its first storey).
 */
export function roomAt(x, z, y = 0) {
  if (inRect(KEEPR, x, z) && y > DAI.top - 1) return { use: 'keep', at: KEEP.c, upper: y > KEEP.base + 1, same: 'room:keep' };
  for (const r of KURA) if (inRect(r, x, z) && y > 25) return { use: 'kura', at: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], upper: false, same: 'kura:' + r[0] };
  if (inRect(HALL, x, z) && y > HON.top - 1 && y < HON.top + 3) return { use: 'hall', at: [(HALL[0] + HALL[2]) / 2, (HALL[1] + HALL[3]) / 2], upper: false, same: 'room:hall' };
  if (inRect(RES, x, z) && y < BANK_Y + 4) return { use: 'hall', at: [(RES[0] + RES[2]) / 2, (RES[1] + RES[3]) / 2], upper: false, same: 'room:residence' };
  const l = lotAt(x, z);
  if (l) return { use: l.t === 'machiya' && ROOMS[l.trade] && WORK[l.trade] ? l.trade : 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: y > 2.4, same: 'lot:' + l.seed };
  return null;
}
const BANK_Y = 2;
/** The room's own colour and small sounds (as Suzhou's ROOMS): `tone` [lowpass Hz, level], `roof` the rain's loudness from inside, `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  cloth: { tone: [300, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 30]] },
  pottery: { tone: [320, 0.3], roof: 1.0, hush: 0.8, work: [['clay', 14]] },
  rice: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['sack', 30]] },
  dye: { tone: [380, 0.35], roof: 1.0, hush: 0.9, work: [['clothRustle', 40]] },
  oil: { tone: [330, 0.3], roof: 1.0, hush: 0.9, work: [['jarLid', 40]] },
  sandals: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 34]] },
  tea: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['teaClink', 12]] },
  medicine: { tone: [280, 0.25], roof: 1.0, hush: 0.7, work: [['drawer', 40]] },
  paper: { tone: [280, 0.2], roof: 1.0, hush: 0.7, work: [['paper', 26]] },
  fish: { tone: [450, 0.4], roof: 1.0, hush: 0.9, work: [['bowlClack', 20]] },
  tofu: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['bowlClack', 22]] },
  bucket: { tone: [360, 0.3], roof: 1.0, hush: 0.9, work: [['knock', 60]] },
  sake: { tone: [260, 0.25], roof: 1.0, hush: 0.7, work: [['jarLid', 40]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
  hall: { tone: [170, 0.22], roof: 0.8, hush: 0.55, work: [['paper', 70]] },       // the mats and paper doors of the reception rooms: dull, quiet
  kura: { tone: [200, 0.2], roof: 0.7, hush: 0.4, work: [['sack', 60]] },          // the thick earthen walls of a storehouse: the street almost gone
  keep: { tone: [140, 0.3], roof: 0.6, hush: 0.3, work: [['knock', 50]] },         // the great keep: timber on timber, high and dark
};
/** The upper rooms of the town houses: close under the tiles, the rain loud. */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 40]] };

// ── the emitters (the engine's fixed ones; `at: [0, 0], r50: 1000` is a listener-relative one: the voice finds its own street or tree) ──
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const EVERY = { at: [0, 0], r50: 1000 };
/** The samurai compounds nearest the avenue's middle that are open (their yards have the fulling block). */
function kinutaAt() {
  const Y = lots().filter((l) => l.t === 'yashiki' && isOpen(l) && l.rect[1] > OUTER[3] && l.rect[3] < MIDDLE.z0 - 4).sort((a, b) => Math.abs((a.rect[0] + a.rect[2]) / 2) - Math.abs((b.rect[0] + b.rect[2]) / 2));
  return Y.slice(0, 4).map((l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2]);
}
export const EMITTERS = [
  // the Honmaru's yard: the servant's broom on the gravel in the morning, the horse at the wall (props.js), the shrine's bell on the avenue
  E('gravel', [-12, -14.5], 11, [8, 20], [5.8, 9], { dry: true }),
  E('hjHorse', [22.5, -12.2], 12, [25, 60], [5, 19], { dry: true }),
  E('hjSuzu', [14, 262], 10, [90, 200], [7, 17], { dry: true }),
  // the lord's kitchens behind the residence
  E('kitchen', [-30, 165], 9, [10, 24], [5, 20]),
  // a komusō's flute on the bridge of the middle moat at dusk
  E('shakuhachi', [0, (MIDDLE.z0 + MIDDLE.z1) / 2], 30, [70, 160], [17, 20], { rainMax: 0.3, after: true }),
  // the fulling block in the samurai yards on autumn nights
  ...kinutaAt().map((p) => E('hjKinuta', p, 12, [9, 22], [19, 23.5], { dry: true })),
  // the listener-relative ones: they make their own source in a street or a tree near the listener
  E('hjPedlar', ...[EVERY.at, EVERY.r50], [34, 80], [6, 17.5], { rainMax: 0.4 }),
  E('hjKago', ...[EVERY.at, EVERY.r50], [90, 200], [8, 17], { dry: true }),
  E('hjHyoshigi', ...[EVERY.at, EVERY.r50], [34, 70], [19.5, 4.5], { rainMax: 0.5 }),
  E('higurashi', ...[EVERY.at, EVERY.r50], [5, 14], [4.6, 6.2], { rainMax: 0.3 }), E('higurashi', ...[EVERY.at, EVERY.r50], [5, 14], [17.4, 19.4], { rainMax: 0.3 }),
  E('uguisu', ...[EVERY.at, EVERY.r50], [14, 40], [5.5, 17], { rainMax: 0.3 }),
  E('hototogisu', ...[EVERY.at, EVERY.r50], [20, 60], [19, 23.5], { rainMax: 0.3 }), E('hototogisu', ...[EVERY.at, EVERY.r50], [20, 60], [3.5, 5.5], { rainMax: 0.3 }),
  E('suzumushi', ...[EVERY.at, EVERY.r50], [3, 8], [18.5, 24], { rainMax: 0.2 }), E('suzumushi', ...[EVERY.at, EVERY.r50], [3, 8], [0, 4.5], { rainMax: 0.2 }),
  E('owl', [-60, -130], 80, [40, 110], [21, 4.5], { rainMax: 0.4 }),
  // the women washing greens and cloth at the landings of the middle moat
  ...LANDINGS.map((f) => E('washCloth', [f.x, f.z0 - 0.8], 9, [14, 32], [6.5, 16.5], { dry: true })),
];
