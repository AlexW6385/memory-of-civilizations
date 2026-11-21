// Where Han Chang'an's sounds are (docs/settlements/han-changan.md §15): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the bells and stone chimes, the zither and the reed organ rehearsing in the Front Hall before the dawn audience, the market towers' drums at opening and
// closing, the shops' trades (silk, pottery, lacquer, bronze, iron, grain, baskets), the households of the service quarters and the wards (kitchen, loom, pounder),
// the camels at the west gate, ox-carts on the avenue, washing at the lake, the night watch at the gates, the rooms one can be inside. Pure data and functions of
// layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of src/engine/voices-han.js).
// Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout, from the dossier's §6–§8 and the trades of the Han markets]
import '../../engine/voices-han.js';
import { RADIUS, AX, HALL, PALACE, AVENUE, LAKE, WEST_MARKET, EAST_MARKET, GATE_W, GATE_S, WALL_W, WALL_S, EAST_GATE, WARDS, WARD_WALL, lots, inService, enterable, marketShops, inRect } from './layout.js';
import { KINDS } from '../../styles/han/interiors.js';

export const HOME = [AX, -122];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The trades of the market's shops and what each makes heard: [voice, gap [min, max] s, hours [from, to]] (the market keeps the day: open at sunrise, shut at dusk) [inferred]. */
const GOODS = ['silk', 'pottery', 'lacquer', 'bronze', 'grain', 'baskets', 'iron', 'cloth'];
const H = [7, 17];
const TRADE = {
  silk: [['clothRustle', [24, 50], H]], cloth: [['scissors', [22, 50], H]], pottery: [['clay', [26, 60], H]], lacquer: [['brushLacquer', [26, 55], H]],
  bronze: [['chisel', [24, 55], H]], grain: [['sack', [22, 48], H]], baskets: [['splitBamboo', [26, 55], H]], iron: [['hammer', [14, 34], H]],
};
/** The households' work by the room's kind (the house's furnishing, han/interiors.js KINDS). */
const HOUSE = {
  dwelling: [['kitchen', [16, 36], [5.5, 20]]], kitchen: [['kitchen', [10, 26], [5, 20]], ['hanPounder', [50, 110], [5.5, 17]]], weaver: [['loom', [12, 28], [6, 18]]],
  scholar: [['paper', [30, 70], [6, 20]], ['brush', [40, 90], [6, 20]]], granary: [['sack', [30, 70], [6, 17]]], workshop: [['hammer', [14, 34], [6.5, 17.5]]],
};
const roomOf = (seed) => KINDS[(seed >> 3) % KINDS.length];

let SITES = null;
/** The places with sounds: { use, rect, at, id, work, y }. Households (the service quarters' and the wards' enterable houses), the offices, the markets' shops, the Front Hall. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) {
    if (l.kind === 'office') { SITES.push({ use: 'office', rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: [['paper', [30, 60], [6, 18]], ['brush', [40, 90], [6, 18]]], y: 0 }); continue; }
    if (!inService(l) && !enterable(l)) continue;
    const use = roomOf(l.seed);
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: HOUSE[use], y: 0 });
  }
  for (const [rect, sd] of [[WEST_MARKET, 600], [EAST_MARKET, 700]]) {
    for (const row of marketShops(rect, sd)) {
      const sw = (row.rect[2] - row.rect[0]) / row.n;
      for (let i = 0; i < row.n; i++) {
        const r = [row.rect[0] + i * sw, row.rect[1], row.rect[0] + (i + 1) * sw, row.rect[3]], goods = GOODS[Math.floor(hash(r[0], r[1], 5) * GOODS.length)];
        SITES.push({ use: 'shop-' + goods, rect: r, at: mid(r), id: `shop:${row.seed}:${i}`, work: TRADE[goods], y: 0 });
      }
    }
  }
  return SITES;
}

export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const FRONT_HALL = [AX - HALL.w / 2, HALL.z0, AX + HALL.w / 2, HALL.z1];
const ROOM_RECTS = [['room:front-hall', 'throne', FRONT_HALL]];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const [id, use, r] of ROOM_RECTS) if (inRect(r, x, z) && y > 8) return { use, at: mid(r), upper: false, same: id };
  const s = lotAt(x, z);
  if (s && y < 3) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.7, work: [['clothRustle', 50]] };
const SHOPR = { ...R0, tone: [420, 0.3], hush: 0.55 };
export const ROOMS = {
  throne: { tone: [170, 0.25], roof: 0.6, hush: 0.45, work: [['hanBell', 70], ['hanStone', 40]] },
  dwelling: { ...R0, work: [['kitchen', 30]] }, kitchen: { ...R0, tone: [360, 0.35], work: [['kitchen', 20]] }, weaver: { ...R0, work: [['loom', 14]] },
  scholar: { ...R0, tone: [260, 0.2], work: [['paper', 50]] }, granary: { ...R0, tone: [240, 0.2], work: [['sack', 40]] }, workshop: { ...R0, tone: [420, 0.4], hush: 0.9, work: [['hammer', 24]] },
  office: { ...R0, tone: [260, 0.2], work: [['brush', 50]] },
  'shop-silk': { ...SHOPR, work: [['clothRustle', 40]] }, 'shop-cloth': { ...SHOPR, work: [['scissors', 40]] }, 'shop-pottery': { ...SHOPR, work: [['clay', 30]] },
  'shop-lacquer': { ...SHOPR, work: [['brushLacquer', 40]] }, 'shop-bronze': { ...SHOPR, work: [['chisel', 40]] }, 'shop-grain': { ...SHOPR, work: [['sack', 34]] },
  'shop-baskets': { ...SHOPR, work: [['splitBamboo', 40]] }, 'shop-iron': { ...SHOPR, tone: [460, 0.4], hush: 0.9, work: [['hammer', 22]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const lakeD = (x, z) => Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz);
/** 0…1: how much green round (x, z): the pagoda trees and elms of the avenue, the willows of the lake, the fields of the rim. */
export function greenNear(x, z) {
  const av = 1 - sm(0, 30, Math.abs(x - (AVENUE[0] + AVENUE[2]) / 2)), lake = 1 - sm(1, 1.9, lakeD(x, z)), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(av * 0.6, lake * 0.9, rim * 0.8, 0.15);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the avenue's rows, the lake's willows, the rim's fields. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (Math.abs(px - AVENUE[0]) < 4 || Math.abs(px - AVENUE[2]) < 4 || lakeD(px, pz) < 1.3 || Math.hypot(px, pz) > RADIUS - 130) && !inRect(PALACE, px, pz, 2)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the markets most, the avenue and the wards, less in the palace, little at the rim. */
export function townNear(x, z) {
  if (inRect(WEST_MARKET, x, z, 10) || inRect(EAST_MARKET, x, z, 10)) return 1;
  if (inRect(PALACE, x, z)) return 0.3;
  if (inRect(AVENUE, x, z, 20)) return 0.7;
  if (WARDS.some((w) => inRect(w, x, z, 6))) return 0.5;
  return Math.max(0.12, 0.6 * (1 - 0.7 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = (x, z) => (lakeD(x, z) < 1.15 ? 0.6 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const wcz = (WEST_MARKET[1] + WEST_MARKET[3]) / 2, wcx = (WEST_MARKET[0] + WEST_MARKET[2]) / 2, ecz = (EAST_MARKET[1] + EAST_MARKET[3]) / 2, ecx = (EAST_MARKET[0] + EAST_MARKET[2]) / 2;
const stage = [AX, HALL.z0 + 22];                               // the foot of the aisle, where the bells and chimes stand (life.js musicians)
export const EMITTERS = [
  // the court's music rehearsing before the dawn audience, in the Front Hall at the foot of the aisle (bells, stones, zither, reed organ)
  E('hanBell', stage, 40, [50, 110], [4.5, 9.5], { rainMax: 0.5, after: true }), E('hanStone', stage, 34, [40, 90], [4.5, 9.5], { rainMax: 0.5, after: true }),
  E('hanZither', [stage[0] - 11, stage[1]], 28, [70, 150], [4.5, 10], { rainMax: 0.4, after: true }), E('hanYu', [stage[0] + 11, stage[1]], 28, [90, 180], [4.5, 10], { rainMax: 0.4, after: true }),
  // the market towers' drums at opening and at the closing before dusk
  E('hanDrum', [wcx, wcz], 90, [900, 1200], [6.5, 7.2], { rainMax: 1 }), E('hanDrum', [wcx, wcz], 90, [900, 1200], [16.8, 17.5], { rainMax: 1 }),
  E('hanDrum', [ecx, ecz], 90, [900, 1200], [6.5, 7.2], { rainMax: 1 }), E('hanDrum', [ecx, ecz], 90, [900, 1200], [16.8, 17.5], { rainMax: 1 }),
  // the markets' lanes: calling and bargaining
  E('marketCry', [wcx, wcz], 40, [14, 36], [7, 17], { rainMax: 0.5 }), E('marketCry', [ecx, ecz], 40, [14, 36], [7, 17], { rainMax: 0.5 }),
  // the caravans at the west gate: the camels' bells
  E('camelString', [WALL_W - 36, GATE_W.z], 40, [40, 90], [7, 18], { rainMax: 0.6 }),
  // the wards' pounders
  ...WARDS.map((w) => E('hanPounder', [(w[0] + w[2]) / 2, w[1] + WARD_WALL + 24.5], 26, [70, 140], [6, 17.5], { dry: true })),
  // ox-carts creaking on the avenue
  ...[-300, -120, 60, 200].map((z) => E('hanCart', [(AVENUE[0] + AVENUE[2]) / 2, z], 34, [40, 100], [6, 18], { dry: true })),
  // the washing at the lake's landing stage
  E('clothRustle', [LAKE.c[0] + 40, LAKE.c[1] - LAKE.rz * 0.96], 12, [10, 26], [7, 16], { dry: true }),
  // the night watch at the gates and on the walls (the Commandant's patrols), the owls on the roofs
  E('hanWatch', [WALL_W, GATE_W.z], 60, [60, 140], [20, 4.5], { rainMax: 0.4 }), E('hanWatch', [GATE_S.x, WALL_S], 60, [70, 150], [20, 4.5], { rainMax: 0.4 }), E('hanWatch', [PALACE[2], EAST_GATE.z], 50, [60, 140], [20, 4.5], { rainMax: 0.4 }),
  E('owl', [AX + 60, -200], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [250, 0], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
