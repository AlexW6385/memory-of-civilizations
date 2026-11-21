// Where Ye's sounds are (docs/settlements/wei-ye.md §17): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the
// poets' zither and the musicians' bells and stones, the drums of the markets' and the wards' closing, the horn at the gates at dawn and dusk, the shops' trades, the
// households of the garden and the wards (kitchen, loom, forge, brush, store), the guards' iron at the palace and the gates, the ice cutters at the Ice Well in winter,
// the pounders of the wards, the camels of the Hu merchants, ox-carts on the avenue, washing at the river's piers, the night watch at the gates, the rooms one can be
// inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices
// of src/engine/voices-han.js and voices-wei.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout, from the dossier's §6–§8]
import '../../engine/voices-han.js';
import '../../engine/voices-wei.js';
import { RADIUS, WALL, AVENUE, PALACE, WARDS, WARD_WALL, MARKET, MARKET_WALL, GATES_S, GATES_N, GATE_W, AVENUE_Z, POND, TOWER, SPARROW, ICE, LODGES, W_TERRACE, WENCHANG, riverZ, RIVER, inRect, lots } from './layout.js';
import { roomKind } from '../../styles/wei/houses.js';

export const HOME = [-119, -91.5];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The market's shops (a row of 5.2 m bays; town.js marketRows) by trade, and what each makes heard (the market keeps the day: open at sunrise, shut at dusk) [inferred]. */
const GOODS = ['silk', 'pottery', 'lacquer', 'bronze', 'grain', 'baskets', 'iron', 'cloth', 'wine', 'salt', 'books', 'fish'];
const H = [7, 17];
const TRADE = {
  silk: [['clothRustle', [24, 50], H]], cloth: [['scissors', [22, 50], H]], pottery: [['clay', [26, 60], H]], lacquer: [['brushLacquer', [26, 55], H]],
  bronze: [['chisel', [24, 55], H]], grain: [['sack', [22, 48], H]], baskets: [['splitBamboo', [26, 55], H]], iron: [['hammer', [14, 34], H]],
  wine: [['jarLid', [30, 60], H]], salt: [['sack', [26, 55], H]], books: [['paper', [30, 70], H]], fish: [['clay', [40, 80], H]],
};
/** The households' work by the room's kind (wei/houses.js room kinds, and the lodgings of the garden). */
const HOUSE = {
  dwelling: [['kitchen', [16, 36], [5.5, 20]]], kitchen: [['kitchen', [10, 26], [5, 20]], ['hanPounder', [50, 110], [5.5, 17]]], loom: [['loom', [12, 28], [6, 18]]],
  scribe: [['paper', [30, 70], [6, 20]], ['brush', [40, 90], [6, 20]]], store: [['sack', [30, 70], [6, 17]]], smithy: [['hammer', [14, 34], [6.5, 17.5]]],
  barracks: [['weiClank', [18, 40], [0, 24]]], ice: [['sack', [40, 90], [6, 17]]], music: [['hanZither', [40, 90], [14, 22]], ['hanStone', [60, 120], [14, 22]]],
};
const OFFICEWORK = [['paper', [30, 60], [6, 18]], ['brush', [40, 90], [6, 18]]];

/** The rects of the shops of the market's rows, as town.js lays them (quadrants of 5.2 m bays, two double rows each). */
export function marketShops() {
  const [x0, z0, x1, z1] = MARKET, th = MARKET_WALL.th, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lane = 8, out = [];
  const quads = [[x0 + th + 3, z0 + th + 3, cx - lane, cz - lane], [cx + lane, z0 + th + 3, x1 - th - 3, cz - lane], [x0 + th + 3, cz + lane, cx - lane, z1 - th - 3], [cx + lane, cz + lane, x1 - th - 3, z1 - th - 3]];
  for (const [qx0, qz0, qx1, qz1] of quads) {
    const n = Math.max(2, Math.floor((qx1 - qx0) / 5.2));
    for (let zz = qz0; zz + 12 <= qz1 + 0.01; zz += 16) for (const dz of [0, 6]) for (let i = 0; i < n; i++) out.push([qx0 + i * 5.2, zz + dz, qx0 + (i + 1) * 5.2, zz + dz + 6]);
  }
  return out;
}

let SITES = null;
/** The places with sounds: { use, rect, at, id, work, y }. The garden's lodgings, the offices, the wards' enterable houses, the market's shops. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of LODGES) SITES.push({ use: l.room, rect: l.rect, at: mid(l.rect), id: 'lodge:' + l.seed, work: HOUSE[l.room], y: 0.3 });
  for (const l of lots()) {
    if (l.kind === 'office') { SITES.push({ use: 'office', rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: OFFICEWORK, y: 0 }); continue; }
    if (!l.open) continue;
    const use = roomKind({ kind: l.kind, seed: l.seed });
    SITES.push({ use, rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: HOUSE[use], y: 0 });
  }
  marketShops().forEach((r, i) => {
    const goods = GOODS[Math.floor(hash(r[0], r[1], 5) * GOODS.length)];
    SITES.push({ use: 'shop-' + goods, rect: r, at: mid(r), id: 'shop:' + i, work: TRADE[goods], y: 0 });
  });
  return SITES;
}

export const WELLS = [[-110, 36.2], [-52, 36.2], [52, 36.2], [112, 36.2], [170, 36.2], [-180, 36.2], [-64, -86], [64, -86]];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
const [tx, tz] = TOWER.c, a = TOWER.half;
const ROOM_RECTS = [['room:sparrow-tower', 'tower', [tx - a, tz - a, tx + a, tz + a], TOWER.floor - 0.5], ['room:wenchang', 'throne', [-WENCHANG.w / 2, WENCHANG.z0, WENCHANG.w / 2, WENCHANG.z1], W_TERRACE.top - 0.5]];
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const [id, use, r, y0] of ROOM_RECTS) if (inRect(r, x, z) && y > y0) return { use, at: mid(r), upper: false, same: id };
  const s = lotAt(x, z);
  if (s && y < s.y + 3) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 0.9, hush: 0.7, work: [['clothRustle', 50]] };
const SHOPR = { ...R0, tone: [420, 0.3], hush: 0.55 };
export const ROOMS = {
  tower: { tone: [190, 0.2], roof: 0.7, hush: 0.5, work: [['hanZither', 70]] }, throne: { tone: [170, 0.25], roof: 0.6, hush: 0.45, work: [['hanBell', 70], ['hanStone', 40]] },
  dwelling: { ...R0, work: [['kitchen', 30]] }, kitchen: { ...R0, tone: [360, 0.35], work: [['kitchen', 20]] }, loom: { ...R0, work: [['loom', 14]] },
  scribe: { ...R0, tone: [260, 0.2], work: [['paper', 50]] }, store: { ...R0, tone: [240, 0.2], work: [['sack', 40]] }, smithy: { ...R0, tone: [420, 0.4], hush: 0.9, work: [['hammer', 24]] },
  barracks: { ...R0, tone: [280, 0.25], work: [['weiClank', 40]] }, ice: { ...R0, tone: [230, 0.2], work: [['sack', 50]] }, music: { ...R0, tone: [260, 0.2], hush: 0.5, work: [['hanZither', 40], ['hanStone', 40]] },
  office: { ...R0, tone: [260, 0.2], work: [['brush', 50]] },
  ...Object.fromEntries(GOODS.map((g) => ['shop-' + g, { ...SHOPR, work: [[TRADE[g][0][0], 40]] }])),
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
const inGarden = (x, z) => x < -80 && x > WALL.w && z > WALL.n && z < -25;
const riverD = (x, z) => Math.abs(z - riverZ(x)) / (RIVER.w / 2 + 6);
/** 0…1: how much green round (x, z): the garden's pines and elms, the willows of the river, the fields of the rim. */
export function greenNear(x, z) {
  const g = inGarden(x, z) ? 0.8 : 0, river = 1 - sm(1, 2.2, riverD(x, z)), rim = sm(RADIUS - 150, RADIUS - 60, Math.hypot(x, z));
  return Math.max(g, river * 0.8, rim * 0.8, 0.12);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the garden's clumps, the river's willows, the rim's fields. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const an = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(an) * d, pz = z + Math.sin(an) * d;
    if (Math.hypot(px, pz) < RADIUS - 8 && (inGarden(px, pz) || riverD(px, pz) < 1.3 || Math.hypot(px, pz) > RADIUS - 130) && !inRect(PALACE, px, pz, 2) && !inRect(POND, px, pz, 1)) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the town's hubbub reaches (x, z): the market most, the avenue and the wards, less in the palace, little in the garden and at the rim. */
export function townNear(x, z) {
  if (inRect(MARKET, x, z, 10)) return 1;
  if (inRect(PALACE, x, z)) return 0.3;
  if (inRect(AVENUE, x, z, 20)) return 0.7;
  if (WARDS.some((w) => inRect(w, x, z, 6))) return 0.5;
  if (inGarden(x, z)) return 0.1;
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
export const frogGround = (x, z) => (inRect(POND, x, z, 8) ? 0.7 : riverD(x, z) < 1.1 ? 0.6 : 0);

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const mc = mid(MARKET), ward = (w) => [(w[0] + w[2]) / 2, w[1] + WARD_WALL + 24.8];
const pier = (x) => [x, riverZ(x) + RIVER.w / 2 + 3];
export const EMITTERS = [
  // the poets' zither and the reed organ in the Sparrow's tower of an evening (the Jian'an circle), the musicians' bells and stones from the garden's hall
  E('hanZither', [tx, tz], 30, [70, 150], [15, 23], { rainMax: 0.5, after: true }), E('hanYu', [tx - 4, tz], 24, [100, 200], [16, 22.5], { rainMax: 0.4, after: true }),
  E('hanBell', [-99, -120], 36, [60, 130], [14, 22], { rainMax: 0.5, after: true }), E('hanStone', [-99, -120], 30, [50, 110], [14, 22], { rainMax: 0.5, after: true }),
  // the drums: the market's at opening and at the closing before dusk; the wards' at the closing of their gates at dusk and their opening at dawn; the dais drum of the hours
  E('hanDrum', mc, 90, [900, 1200], [6.5, 7.2], { rainMax: 1 }), E('hanDrum', mc, 90, [900, 1200], [16.8, 17.5], { rainMax: 1 }),
  ...WARDS.map((w) => E('hanDrum', ward(w), 80, [900, 1200], [17.6, 18.3], { rainMax: 1 })), ...WARDS.map((w) => E('hanDrum', ward(w), 80, [900, 1200], [5.0, 5.7], { rainMax: 1 })),
  E('hanDrum', [tx, tz - 15], 90, [900, 1200], [19, 19.8], { rainMax: 1 }),
  // the military horn at the gates at dawn and at the closing of the gates
  ...[[GATES_S[1], WALL.s], [GATES_N[0], WALL.n], [WALL.e, AVENUE_Z], [WALL.w, AVENUE_Z]].flatMap(([x, z]) => [E('weiHorn', [x, z], 90, [900, 1200], [5.3, 5.9], { rainMax: 1 }), E('weiHorn', [x, z], 90, [900, 1200], [18.8, 19.4], { rainMax: 1 })]),
  // the markets' lanes: calling and bargaining; the Hu merchants' camels in the west lane
  E('marketCry', mc, 40, [14, 36], [7, 17], { rainMax: 0.5 }), E('camelString', [MARKET[0] + 6, mc[1]], 40, [40, 90], [7, 17], { rainMax: 0.6 }),
  // the wards' pounders; ox-carts creaking on the avenue
  ...WARDS.map((w) => E('hanPounder', ward(w), 26, [70, 140], [6, 17.5], { dry: true })),
  ...[-200, -80, 60, 180].map((x) => E('hanCart', [x, AVENUE_Z], 34, [40, 100], [6, 18], { dry: true })),
  // the guards' iron at the palace's forecourt and the terraces' stairs, the ice cutters at the Ice Well's crown and at the river (winter: the voice keeps its season)
  E('weiClank', [0, -20], 30, [20, 50], [6, 22], { rainMax: 0.6 }), E('weiClank', [-166, -88], 26, [24, 55], [6, 22], { rainMax: 0.6 }),
  E('weiIce', [-196, -161], 40, [14, 30], [7, 16], { rainMax: 0.5, y: ICE.top }), E('weiIce', pier(-170), 40, [14, 30], [7, 16], { rainMax: 0.5 }),
  // the washing at the river's piers, a carter's call at the south gate's road
  E('clothRustle', pier(-60), 12, [10, 26], [7, 16], { dry: true }), E('clothRustle', pier(90), 12, [10, 26], [7, 16], { dry: true }),
  // the night watch at the gates and on the walls, the owls on the roofs
  E('hanWatch', [WALL.e, AVENUE_Z], 60, [60, 140], [20, 4.5], { rainMax: 0.4 }), E('hanWatch', [GATES_S[1], WALL.s], 60, [70, 150], [20, 4.5], { rainMax: 0.4 }),
  E('hanWatch', [PALACE[2], PALACE[3]], 50, [60, 140], [20, 4.5], { rainMax: 0.4 }), E('hanWatch', [TOWER.c[0], TOWER.c[1] + 20], 50, [70, 150], [20, 4.5], { rainMax: 0.4 }),
  E('owl', [-190, -140], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, -110], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void SPARROW; void GATE_W; void AVENUE;
