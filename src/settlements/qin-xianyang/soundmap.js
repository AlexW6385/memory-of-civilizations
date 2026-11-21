// Where Qin Xianyang's sounds are (docs/settlements/qin-xianyang.md §12): the places of its emitters and the geometry the audio engine needs to put each sound where it is
// made — the palace's bronze bells, the market tower's drum at opening and closing, the market's calling, the figure-makers' workshops (the treading and slapping of clay,
// the carver's chisel, the painters' brushes, the kiln's roar, the sledge gang), the rammers and the sledges of the building yard and the haul road, the households (kitchen,
// loom), the ward gates' bars at dusk and the watch's clapper at night, ox-carts on the imperial road, the pit's lamps in its long cold hall, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-qin.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout, from the dossier's §6–§7 and the trades of the Qin town]
import '../../engine/voices-qin.js';
import { RADIUS, PIT, HALL, YARD, HAUL, TOWER, MARKET, ROAD, lots, wardGates, roadPines, inRect } from './layout.js';

export const HOME = [126.5, -121];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The work of each kind of lot: [voice, gap [min, max] s, hours [from, to]] (the town works by daylight) [inferred]. */
const D = [6, 18];
const WORK = {
  row: [['kitchen', [16, 36], [5.5, 20]]],
  rowLoom: [['loom', [12, 28], [6, 18]]],
  court: [['kitchen', [14, 32], [5.5, 20]], ['loom', [16, 36], [6, 18]]],
  official: [['brush', [40, 90], [6, 19]], ['splitBamboo', [50, 110], [6, 18]]],         // the clerks' writing and the bamboo slips
  'work-clay': [['clay', [10, 24], D]],                                                  // the treading and slapping of the clay
  'work-body': [['clay', [12, 28], D], ['hammer', [40, 90], D]],
  'work-head': [['chisel', [14, 34], D]],                                                // the finishing of the heads
  'work-kiln': [['qinKiln', [26, 55], [5, 19]]],
  'work-paint': [['brush', [18, 40], D]],
  'work-ship': [['qinSledge', [40, 90], [6.5, 17.5]]],
};

let SITES = null;
/** The places with sounds: { use, rect, at, id, work, y }. The open houses, the officials' halls and the figure-makers' yards. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (!l.open) continue;
    if (l.trade) {
      const [x0, z0, x1, z1] = l.rect, s = l.front === 's', at = [(x0 + x1) / 2, s ? z1 - 12 : z0 + 12];
      SITES.push({ use: 'work-' + l.trade, rect: l.rect, at, id: 'lot:' + l.seed, work: WORK['work-' + l.trade], y: 0 });
    } else if (l.kind === 'row' || l.kind === 'court' || l.kind === 'official') {
      const use = l.kind === 'row' ? (l.seed % 3 === 0 ? 'rowLoom' : 'row') : l.kind;
      SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: WORK[use], y: 0 });
    }
  }
  return SITES;
}

export const WELLS = [[30, -16.2], [-95, 16.2], [-175, -16.2], [105, 16.2]];      // the road's wells with a sweep (town.js trades())
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const PIT_RECT = [PIT.x0, PIT.z0, PIT.x1, PIT.z1];
const HALL_RECT = [HALL.x0, HALL.z0, HALL.x1, HALL.z1];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  if (inRect(PIT_RECT, x, z) && y < 0.5) return { use: 'pit', at: mid(PIT_RECT), upper: false, same: 'room:pit' };
  if (inRect(HALL_RECT, x, z) && y > 6) return { use: 'hall', at: mid(HALL_RECT), upper: false, same: 'room:hall' };
  const s = lotAt(x, z);
  if (s && y < 3) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.7, work: [['clothRustle', 50]] };
const YARDR = { tone: [380, 0.3], roof: 0.5, hush: 0.45, work: [['clothRustle', 60]] };         // a workshop's yard: open on the street side
export const ROOMS = {
  pit: { tone: [140, 0.15], roof: 0.5, hush: 0.5, work: [['qinLamp', 30]] },
  hall: { tone: [170, 0.25], roof: 0.6, hush: 0.45, work: [['qinChime', 70]] },
  row: { ...R0, work: [['kitchen', 30]] }, rowLoom: { ...R0, work: [['loom', 14]] }, court: { ...R0, tone: [340, 0.3], work: [['kitchen', 22]] },
  official: { ...R0, tone: [260, 0.2], work: [['brush', 50]] },
  'work-clay': { ...YARDR, work: [['clay', 24]] }, 'work-body': { ...YARDR, work: [['clay', 26]] }, 'work-head': { ...YARDR, work: [['chisel', 30]] },
  'work-kiln': { ...YARDR, tone: [300, 0.35], work: [['qinKiln', 20]] }, 'work-paint': { ...YARDR, work: [['brush', 40]] }, 'work-ship': { ...YARDR, work: [['qinSledge', 40]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the pines of the road's edges, the fields of the rim. */
export function greenNear(x, z) {
  const pines = 1 - sm(0, 30, Math.abs(Math.abs(z) - 24)), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(pines * 0.55, rim * 0.8, 0.15);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the road's pines, else the rim's trees. */
export function treeSpot(x, z, rnd, reach = 40) {
  if (Math.abs(z) < reach + 40) for (let k = 0; k < 10; k++) {
    const px = x + (rnd() - 0.5) * 2 * reach, pz = (rnd() < 0.5 ? -1 : 1) * 24;
    if (Math.abs(px) < RADIUS - 8 && Math.hypot(px - x, pz - z) < reach + 30) return [Math.round(px / 6.9) * 6.9, pz];
  }
  for (let k = 0; k < 8; k++) {
    const a = rnd() * Math.PI * 2, d = 6 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 120 && Math.hypot(px, pz) < RADIUS - 8) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market most, the road and the workshops' street less, the pit and the palace little, the rim least. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 10)) return 1;
  if (inRect(PIT_RECT, x, z, 8)) return 0.12;
  if (Math.abs(z) < ROAD.z1 + 8) return 0.6;
  if (inRect(YARD, x, z, 10)) return 0.4;
  return Math.max(0.12, 0.55 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = () => 0;

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const yard = mid(YARD), tower = [TOWER.x, TOWER.z], mk = mid(MARKET), pit = mid(PIT_RECT);
const stage = [(HALL.x0 + HALL.x1) / 2, HALL.z1 - 8];          // the foot of the hall's aisle, where the bells stand
const gates = wardGates().filter((_, i) => i % 3 === 0);       // some of the lane gates
export const EMITTERS = [
  // the pit's lamps and the draught along the corridors (heard in the corridors and the gallery, at every hour)
  E('qinLamp', [pit[0] - 70, pit[1]], 22, [14, 34], [0, 24], { rainMax: 1 }), E('qinLamp', pit, 22, [14, 34], [0, 24], { rainMax: 1 }), E('qinLamp', [pit[0] + 70, pit[1]], 22, [14, 34], [0, 24], { rainMax: 1 }),
  // the palace's bells before the morning audience (the hall's set of bronze bells)
  E('qinChime', stage, 45, [50, 110], [4.5, 9.5], { rainMax: 0.5, after: true }),
  // the market tower's drum at opening and at the closing before dusk
  E('qinDrum', tower, 90, [900, 1200], [6.5, 7.2], { rainMax: 1 }), E('qinDrum', tower, 90, [900, 1200], [16.8, 17.5], { rainMax: 1 }),
  E('marketCry', mk, 40, [14, 36], [7, 17], { rainMax: 0.5 }),
  // the building yard: the rammers and the sledge gangs on the haul road
  E('qinRammer', [yard[0] - 12, yard[1] + 14], 40, [30, 80], [6.5, 17.5], { dry: true }),
  E('qinSledge', [(HAUL.x0 + HAUL.x1) / 2, HAUL.z], 36, [45, 100], [6.5, 17.5], { dry: true }),
  // the ward gates: the bars dropped at dusk and lifted at dawn; the watch's clapper at night
  ...gates.flatMap(([x, z]) => [E('qinGate', [x, z], 30, [300, 500], [17.2, 18], { rainMax: 1 }), E('qinGate', [x, z], 30, [300, 500], [5.6, 6.4], { rainMax: 1 }), E('qinWatch', [x, z], 40, [70, 150], [20, 4.5], { rainMax: 0.4 })]),
  // ox-carts creaking on the imperial road
  ...[-200, -60, 80, 220].map((x) => E('qinCart', [x, 6], 34, [40, 100], [6, 18], { dry: true })),
  E('owl', [120, -200], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [-250, 60], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
