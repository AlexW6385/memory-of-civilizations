// Where Florence's sounds are (docs/settlements/florence.md §18): the places of its emitters and the geometry the audio engine needs
// to put each sound where it comes from — the weirs of the Arno, the Mercato Vecchio's stalls and the chain on its column, the
// butchers' shops on the Ponte Vecchio, the dyers' yard, the wells, the workshops of the botteghe along the walk, the rooms one can
// be inside. Pure data and functions of the layout, the walk and the open rules (no three.js), read by src/engine/soundscape.js
// (the profile's `LIFE.map`) and played by src/engine/voices.js and voices-florence.js. Metres, +x east, +z south.

import { RADIUS, ARNO, BRIDGE, MERCATO, TINTORI, ORSAN, arnoZ, lots, inRect, inLot, inStreet, inArno } from './layout.js';
import { enterable, upper } from './open.js';
import { rectWalkDist } from './walk.js';
import { ARRIVALS } from '../../planet/arrivals.js';

/** Where the audio puts the listener when the engine gives none: the arrival. */
export const HOME = [ARRIVALS['florence'][0], ARRIVALS['florence'][2]];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── the workshops ───────────────────────────────────────────────────────────────
/**
 * The work heard from each use (the lot's trade, as the walk's shop-houses are opened): [voice, gap in seconds [min, max], hours [from, to]].
 * Where the work is and when it is done is [inferred] from the trade: the bakers began before dawn, the smiths and joiners worked the
 * daylight hours, the guilds' rules kept the shops to the day [inferred]; the osteria went on into the evening.
 */
const WORK = {
  smith: [['hammer', [8, 20], [6.5, 18]]],
  woodwork: [['plane', [12, 28], [6.5, 18]]],
  goldsmith: [['chisel', [10, 24], [7, 18]]],
  cloth: [['scissors', [18, 40], [7, 18]]],
  weaver: [['loom', [10, 24], [6.5, 18]]],
  spice: [['mortar', [16, 36], [7, 18]]],
  apothecary: [['mortar', [14, 30], [7, 18]]],
  wine: [['pourWine', [22, 52], [8, 22]]],
  bread: [['sack', [24, 50], [3, 11]], ['kitchen', [16, 30], [3, 11]]],
  candles: [['pour', [30, 70], [7, 18]]],
  leather: [['chisel', [16, 36], [7, 18]]],
  inn: [['teaTalk', [8, 18], [8, 23]], ['teaClink', [20, 50], [8, 23]]],
};

let SITES = null;
/** The houses with sounds: { use, rect, at: [x, z] (the middle), id, work }. The inn nearest the arrival and the shop-houses of the walk. */
export function sites() {
  if (SITES) return SITES;
  const all = lots(), open = enterable(all);
  SITES = [];
  for (const [l, use] of open) {
    if (!WORK[use] || (use !== 'inn' && rectWalkDist(l.rect) > 30)) continue;
    const [x0, z0, x1, z1] = l.rect;
    SITES.push({ use, rect: l.rect, at: [(x0 + x1) / 2, (z0 + z1) / 2], id: 'lot:' + l.seed, work: WORK[use] });
  }
  return SITES;
}

/** The public wells of the streets: the ones street life stands (streetlife.js), by the same rule. */
export function wells() {
  const A = ARRIVALS['florence'], all = lots(), open = enterable(all), out = [];
  all.forEach((l, i) => {
    const [x0, z0, x1, z1] = l.rect, f = l.front, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (Math.hypot(cx - A[0], cz - A[2]) < 22 || (l.seed * 7 + i) % 6 !== 0) return;
    if (open.has(l) && upper(l)) return;
    if ((l.seed >> 3) % 8 !== 0) return;
    const at = f === 's' ? [x0 + 1.1, z1 + 0.7] : f === 'n' ? [x0 + 1.1, z0 - 0.7] : f === 'e' ? [x1 + 0.7, z0 + 1.1] : [x0 - 0.7, z0 + 1.1];
    out.push([at[0] + (f === 'e' ? 0.3 : f === 'w' ? -0.3 : 0), at[1] + (f === 's' ? 0.3 : f === 'n' ? -0.3 : 0)]);
  });
  return out;
}
export const WELLS = wells();

// ── the water: the Arno, its weirs, its banks, its bridge ───────────────────────────
/** The weirs (pescaie) across the Arno: the river was shallow and cut by them [inferred; docs §10]; x of each, on the river's middle line. */
export const WEIRS = [-190, -70, 150].map((x) => [x, arnoZ(x)]);
/** The Ponte Vecchio's centre, and the span a walker crosses. */
export const BRIDGES = [{ at: [BRIDGE.x, arnoZ(BRIDGE.x)], across: 'z', span: ARNO.w + 12 }];
/** No canal in Florence: the engine's canal calls find nothing. */
export const canalSpot = () => null;
export const canalTrack = () => null;
/**
 * No passing tracks on the streets: the engine's tracks along streets are a sedan chair with its bearers, the hawkers with the rattle-drum and the
 * bamboo clapper, and the night watchman with his clapper and his call against fire — all Chinese, none of them Florence's [inferred: no litter
 * in the street of 1480, no night watchman with a clapper found]. The hawkers' cries are emitters in the market instead.
 */
export const streetTrack = () => null;
/** The bridge's walkers: a track over the span, as the engine's crossing voice expects. */
export function bridgeTrack(x, z, rnd, reach = 60) {
  let best = null;
  for (const b of BRIDGES) { const d = Math.hypot(b.at[0] - x, b.at[1] - z); if (d < reach && (!best || d < best.d)) best = { b, d }; }
  if (!best) return null;
  const { at, span } = best.b, h = span / 2 + 3, s = rnd() < 0.5 ? 1 : -1;
  return { pts: [[at[0] + (rnd() - 0.5), at[1] - s * h], [at[0] + (rnd() - 0.5), at[1] + s * h]], d: best.d };
}
/** No pond. */
export const pondSpot = () => null;
/** The river's edge near (x, z): where a ray from it first crosses the water's margin (the stone of the bank, for the lap), or null. */
export function shoreSpot(x, z, rnd, reach = 22) {
  if (Math.abs(z - arnoZ(x)) > ARNO.w / 2 + reach) return null;
  for (let k = 0; k < 6; k++) {
    const a = rnd() * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    let prev = inArno(x + c, z + s);
    for (let d = 2; d <= reach; d++) { const px = x + c * d, pz = z + s * d, w = inArno(px, pz); if (w !== prev) return [px, pz]; prev = w; }
  }
  return null;
}
/** A tree to put a bird or a cicada in, near (x, z): open ground outside the lots, streets and squares: the banks' willows and poplars, the gardens' cypresses. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && !inLot(px, pz, 1) && !inStreet(px, pz, 1) && !inArno(px, pz) && !inRect(MERCATO, px, pz, 2) && !inRect(ORSAN, px, pz, 7) && (Math.abs(pz - arnoZ(px)) < ARNO.w / 2 + 16 || hash(px, pz) < 0.5)) return [px, pz];
  }
  return null;
}

// ── where the planting makes its sound ──────────────────────────────────────────
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0…1: broad-leaved trees round (the banks' willows and poplars, the orti's figs, the hills' oaks). */
export function leafNear(x, z) {
  const bank = 1 - sm(ARNO.w / 2 + 4, ARNO.w / 2 + 40, Math.abs(z - arnoZ(x)));
  return Math.min(1, Math.max(0.5 * bank, 0.5 * sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z)), 0.1));
}
/** 0…1: how much green round (x, z), for the cicadas and the insects: the rim's gardens and groves, the river's banks, the paved centre a little. */
export function greenNear(x, z) {
  const edge = sm(RADIUS - 150, RADIUS - 40, Math.hypot(x, z));
  const bank = 0.55 * (1 - sm(ARNO.w / 2 + 2, ARNO.w / 2 + 36, Math.abs(z - arnoZ(x))));
  return Math.max(edge * 0.85, bank, 0.1);
}
/** 0…1: how much of the city's hubbub reaches (x, z): all of it in the streets, less toward the rim and on the river. */
export function townNear(x, z) {
  const river = 1 - 0.5 * (1 - sm(0, ARNO.w / 2, Math.abs(z - arnoZ(x))));
  return Math.max(0.1, (1 - 0.65 * sm(RADIUS - 160, RADIUS - 30, Math.hypot(x, z))) * river);
}
/** 0…1: wet ground for the frogs: the river's reedy banks and the rim, in the warm nights. */
export function frogGround(x, z) {
  const bank = 1 - sm(ARNO.w / 2 - 4, ARNO.w / 2 + 14, Math.abs(z - arnoZ(x)));
  return Math.max(0.7 * bank, 0.5 * sm(RADIUS - 100, RADIUS - 30, Math.hypot(x, z)));
}

// ── the rooms ─────────────────────────────────────────────────────────────────
const ROOM_LOTS = [];
/**
 * The room the listener is in, from its place: { use, at (the room's middle), upper, same (an id for the building) } or null in the open.
 * Uses: the open lots' (inn, home, kitchen, and the trades'), church (the cathedral's nave and crossing and Orsanmichele), house (any other lot).
 */
export function roomAt(x, z, y = 0) {
  const upperFloor = y > 2.4;
  if (inRect([-70, -77.5, 17, -42.5], x, z) || inRect([24, -76, 56, -44], x, z) || inRect([ORSAN[0], ORSAN[1], ORSAN[2], ORSAN[3]], x, z)) return { use: 'church', at: [x, z], upper: false, same: 'church' };
  for (const s of sites()) if (inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: upperFloor, same: s.id };
  if (!ROOM_LOTS.length) { const open = enterable(lots()); for (const [l, use] of open) ROOM_LOTS.push({ l, use }); }
  for (const { l, use } of ROOM_LOTS) if (inRect(l.rect, x, z)) return { use, at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: upperFloor, same: 'lot:' + l.seed };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: 'house', at: [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], upper: upperFloor, same: 'lot:' + l.seed };
  return null;
}

/**
 * What each kind of room sounds like inside: `tone` the room's own hush (a lowpass in Hz and a level), `roof` how loud the rain on the tiles is
 * from inside, `work` the small voices made in the room now and then [voice, gap s], `hush` how much of the outdoors comes through.
 */
export const ROOMS = {
  inn: { tone: [420, 0.5], roof: 0.9, hush: 1.0, work: [['teaClink', 6], ['pourWine', 30]] },
  home: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['broom', 70], ['bowlClack', 30]] },
  kitchen: { tone: [480, 0.5], roof: 1.0, hush: 0.9, work: [['bowlClack', 14], ['pour', 40]] },
  cloth: { tone: [320, 0.25], roof: 1.0, hush: 0.8, work: [['clothRustle', 22]] },
  weaver: { tone: [340, 0.35], roof: 1.0, hush: 0.8, work: [['clothRustle', 30]] },
  wine: { tone: [300, 0.3], roof: 1.0, hush: 0.8, work: [['jarLid', 36], ['pourWine', 50]] },
  bread: { tone: [420, 0.4], roof: 1.0, hush: 0.9, work: [['sack', 26], ['drawer', 60]] },
  spice: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 36]] },
  apothecary: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['drawer', 30], ['jarLid', 50]] },
  leather: { tone: [260, 0.2], roof: 1.0, hush: 0.7, work: [['clothRustle', 40]] },
  smith: { tone: [400, 0.4], roof: 1.0, hush: 1.0, work: [['drawer', 120]] },
  goldsmith: { tone: [260, 0.2], roof: 1.0, hush: 0.6, work: [['coin', 40]] },
  woodwork: { tone: [300, 0.3], roof: 1.0, hush: 0.9, work: [['broom', 50]] },
  candles: { tone: [280, 0.25], roof: 1.0, hush: 0.8, work: [['pour', 50]] },
  church: { tone: [140, 0.25], roof: 0.6, hush: 0.45, work: [['paper', 70]] },
  house: { tone: [260, 0.2], roof: 1.0, hush: 0.8, work: [['broom', 70]] },
};
/** The bedrooms and workrooms upstairs: nearly silent, close under the tiles (the rain loud). */
export const UPPER = { tone: [200, 0.12], roof: 1.3, hush: 0.6, work: [['paper', 30], ['clothRustle', 40]] };

// ── the emitters in the open ────────────────────────────────────────────────────
const mc = [(MERCATO[0] + MERCATO[2]) / 2, (MERCATO[1] + MERCATO[3]) / 2];
const TI = [(TINTORI[0] + TINTORI[2]) / 2, (TINTORI[1] + TINTORI[3]) / 2];
/**
 * Fixed emitters: [voice, at, r50 (m: the distance at which it is half as loud), [gap min, max] s, hours [from, to] (local, 0…24)], with
 * `dry` (not in rain), `rainMax`, `lv`. The houses' own work (WORK) is added by the engine from sites().
 * [inferred throughout, from the places' dossier: the stalls of the Mercato Vecchio, the chain on the column of Abundance (the market's opening
 * and closing: stated, docs §4), the Arno's weirs, the butchers on the Ponte Vecchio (stated, docs §4), the dyers' yard (stated, docs §5)]
 */
export const EMITTERS = [
  // the market's cries by day, from its four quarters: the butchers (north row), the fishmongers (south row), the greengrocers and the poultry sellers
  { voice: 'marketCry', at: [-62, 56], r50: 14, gap: [9, 24], hours: [6.5, 13], rainMax: 0.6 },
  { voice: 'marketCry', at: [-50, 67.5], r50: 14, gap: [10, 26], hours: [6.5, 13], rainMax: 0.6 },
  { voice: 'marketCry', at: [-28, 48], r50: 14, gap: [10, 28], hours: [6.5, 13], rainMax: 0.6 },
  { voice: 'marketCry', at: [-70, 30], r50: 14, gap: [12, 30], hours: [6.5, 13], rainMax: 0.6 },
  // the chain on the column of Abundance, rattled at the market's opening and again at its closing
  { voice: 'chainRattle', at: [mc[0] + 1.2, mc[1] + 1.2], r50: 18, gap: [25, 60], hours: [6.4, 7.2], dry: true },
  { voice: 'chainRattle', at: [mc[0] + 1.2, mc[1] + 1.2], r50: 18, gap: [25, 60], hours: [12.8, 13.6], dry: true },
  // the butchers' shops on the Ponte Vecchio: the cleaver on the block, mornings
  { voice: 'cleaver', at: [BRIDGE.x - 4.5, arnoZ(BRIDGE.x) - 14], r50: 9, gap: [9, 22], hours: [6, 13], dry: true },
  { voice: 'cleaver', at: [BRIDGE.x + 4.5, arnoZ(BRIDGE.x) + 11], r50: 9, gap: [11, 26], hours: [6, 13], dry: true },
  // the dyers' yard on the Arno's north bank: cloth wrung and rinsed, water poured from the vats
  { voice: 'pour', at: [TI[0] - 20, TINTORI[3] - 4], r50: 12, gap: [16, 34], hours: [6.5, 18], dry: true },
  { voice: 'clothRustle', at: [TI[0] + 10, TINTORI[3] - 8], r50: 12, gap: [14, 30], hours: [6.5, 18], dry: true },
  { voice: 'pour', at: [TI[0] + 40, TINTORI[3] - 4], r50: 12, gap: [18, 40], hours: [6.5, 18], dry: true },
  // the weirs: the river's long rush, all hours, heard far over the roofs
  ...WEIRS.map(([x, z]) => ({ voice: 'weir', at: [x, z], r50: 38, gap: [10.5, 11.5], hours: [0, 24], lv: 1 })),
];
