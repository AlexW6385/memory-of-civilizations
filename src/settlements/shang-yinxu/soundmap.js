// Where Yinxu's sounds are (docs/settlements/shang-yinxu.md §11): the places of its emitters and the geometry the audio engine needs to put each sound where it is made — the
// nao bells and the stone chime of the ancestral hall, the drum and the ocarina of the rites, the crack of the heated plastrons at the diviners' braziers in the court and the
// saws and drills of the oracle-bone shed, the foundry's bellows, the pour and the fettling (day and night), the households of the lineage quarters (pestle, quern, loom,
// kitchen, the pigs in their pens), the washing at the Huan's landings, the chariots in the court, the owls and the foundry's night, the rooms one can be inside.
// Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by src/engine/voices.js (the voices of
// src/engine/voices-shang.js). Coordinates: metres, +x east, +z south, the settlement's frame. [inferred throughout, from the dossier's §4–§7 and §5a–§5d]
import '../../engine/voices-shang.js';
import { RADIUS, AXIS, HALL, FLANKS, COURT, ARCHIVE, TOMB, FOUNDRY, FURNACES, RIVER, lots, spots, lotPoint, landings, riverDist, inRect, inRiver, inMoat } from './layout.js';

export const HOME = [20, -34];

export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── the households and workshops of the lineage quarters: what each kind makes heard, [voice, gap [min, max] s, hours [from, to]] ──
const D = [5.5, 18.5], DAY = [6, 17];
const HOUSE = {
  court: [['shangPestle', [40, 95], D], ['loom', [30, 70], DAY], ['kitchen', [26, 60], [5, 19.5]], ['shangPig', [40, 100], [5, 20]], ['shangCall', [110, 240], DAY]],
  pits: [['shangQuern', [40, 100], DAY], ['kitchen', [30, 70], [5, 19.5]], ['shangPig', [45, 110], [5, 20]], ['shangPestle', [60, 130], D]],
  row: [['loom', [34, 80], DAY], ['kitchen', [30, 70], [5, 19.5]], ['shangQuern', [60, 130], DAY]],
};
const SHOP = {
  bone: [['shangSaw', [16, 40], [6.5, 17]], ['shangFettle', [30, 70], [6.5, 17]]],
  jade: [['grinder', [20, 50], [6.5, 17]], ['shangFettle', [40, 90], [6.5, 17]]],
  pottery: [['clay', [24, 56], [6.5, 17]], ['shangQuern', [50, 110], [6.5, 17]]],
  oracle: [['shangSaw', [20, 50], [6.5, 16.5]], ['shangDrill', [24, 60], [6.5, 16.5]], ['shangCrack', [30, 70], [7, 16]]],
};
const use = (l) => (l.kind === 'workshop' ? 'workshop-' + (l.trade || 'bone') : l.kind);

let SITES = null;
/** The places with sounds: { use, rect, at, id, work, y }. The households and workshops of the lots, the ancestral hall, the flanking halls, the archive, the tomb's hall. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const l of lots()) SITES.push({ use: use(l), rect: l.rect, at: mid(l.rect), id: 'lot:' + l.seed, work: l.kind === 'workshop' ? SHOP[l.trade || 'bone'] : HOUSE[l.kind], y: 0 });
  SITES.push({ use: 'hall', rect: HALLROOM, at: mid(HALLROOM), id: 'room:hall', work: [['shangNao', [90, 200], [6, 10]], ['shangChime', [60, 140], [6, 18]]], y: HALL.h });
  FLANKS.forEach((f) => { const r = [f.plat[0] + 3, f.plat[1] + 3, f.plat[2] - 3, f.plat[3] - 3]; SITES.push({ use: 'flank', rect: r, at: mid(r), id: 'room:' + f.name, work: [['shangMurmur', [60, 140], [6.5, 17]]], y: f.h }); });
  SITES.push({ use: 'archive', rect: ARCHIVE.rect, at: mid(ARCHIVE.rect), id: 'room:archive', work: [['shangCrack', [90, 200], [7, 16]]], y: ARCHIVE.h });
  SITES.push({ use: 'tomb', rect: TOMB.hall, at: mid(TOMB.hall), id: 'room:tomb', work: [], y: TOMB.h });
  return SITES;
}
const HALLROOM = [HALL.plat[0] + 4, HALL.plat[1] + 3, HALL.plat[2] - 4, HALL.plat[3] - 2];

/** The wells of the yards: { at } of every lot near the court (the yard's well, spots() of layout.js). */
export const WELLS = lots().filter((l) => l.lod === 0).map((l) => lotPoint(l, ...spots(l.kind, l.rect[2] - l.rect[0], l.rect[3] - l.rect[1]).well));
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return (LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []).find((s) => inRect(s.rect, x, z));
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const s = lotAt(x, z);
  if (s && y < s.y + 3.2 && y > s.y - 0.6) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
const R0 = { tone: [300, 0.25], roof: 1.0, hush: 0.75, work: [['kitchen', 40]] };
export const ROOMS = {
  hall: { tone: [190, 0.28], roof: 0.7, hush: 0.45, work: [['shangNao', 80], ['shangChime', 50]] },
  flank: { tone: [230, 0.25], roof: 0.8, hush: 0.55, work: [['shangMurmur', 60]] },
  archive: { tone: [260, 0.2], roof: 0.9, hush: 0.7, work: [['shangCrack', 80]] },
  tomb: { tone: [200, 0.15], roof: 0.9, hush: 0.4, work: [] },
  court: { ...R0, work: [['kitchen', 30], ['loom', 40]] },
  pits: { ...R0, tone: [260, 0.2], hush: 0.85, work: [['shangQuern', 40]] },
  row: { ...R0, work: [['loom', 30]] },
  'workshop-bone': { ...R0, tone: [420, 0.3], hush: 0.8, work: [['shangSaw', 20]] },
  'workshop-jade': { ...R0, tone: [420, 0.3], hush: 0.8, work: [['grinder', 24]] },
  'workshop-pottery': { ...R0, tone: [360, 0.3], hush: 0.8, work: [['clay', 26]] },
  'workshop-oracle': { ...R0, tone: [400, 0.3], hush: 0.8, work: [['shangDrill', 24], ['shangCrack', 34]] },
};
export const UPPER = { tone: [210, 0.12], roof: 1.2, hush: 0.6, work: [] };

// ── the planting, the town ──────────────────────────────────────────────────
const bank = (x, z) => riverDist(x, z) - RIVER.half;
/** 0…1: how much green round (x, z): the willows and reeds of the Huan's banks, the gardens of the lots, the millet of the rim, bare earth in the court and the foundry. */
export function greenNear(x, z) {
  const river = 1 - sm(2, 18, bank(x, z)), rim = sm(RADIUS - 130, RADIUS - 50, Math.hypot(x, z));
  const court = inRect([-30, -104, 70, 56], x, z, 6) || inRect(FOUNDRY, x, z, 6) ? 0.05 : 0;
  return Math.max(river * 0.9, rim * 0.8, court ? 0.05 : lotAt(x, z) ? 0.5 : 0.2);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.9);
/** A tree to put a cicada or a bird in, near (x, z), or null: the mulberries and jujubes of the yards, the willows of the banks. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 8 || inRiver(px, pz, 0) || inMoat(px, pz, 0)) continue;
    if ((bank(px, pz) > 1 && bank(px, pz) < 8) || (lotAt(px, pz) && lotAt(px, pz).use !== 'hall' && !inRect([-30, -104, 70, 56], px, pz))) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the quarters' hum reaches (x, z): the court and the lanes, little at the rim. (Yinxu has no market: the hum is the households' and the court's.) */
export function townNear(x, z) {
  if (inRect([-30, -104, 70, 56], x, z)) return 0.5;
  if (inRect(FOUNDRY, x, z, 10)) return 0.5;
  return Math.max(0.1, 0.55 * (1 - 0.8 * sm(RADIUS - 190, RADIUS - 20, Math.hypot(x, z))));
}
/** The nearest point of the Huan to (x, z) on its centre line. */
function nearestRiver(x, z) {
  let best = null, bd = 1e9;
  for (let i = 0; i < RIVER.pts.length - 1; i++) {
    const a = RIVER.pts[i], b = RIVER.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))), px = a[0] + dx * t, pz = a[1] + dz * t, d = Math.hypot(x - px, z - pz);
    if (d < bd) { bd = d; best = [px, pz]; }
  }
  return best && { p: best, d: Math.max(0, bd - RIVER.half) };
}
/** The Huan's water near the listener: { d (the bank's distance), p (the water's nearest point) } or null (the lapping at the banks and the landings' piles). */
export const canalSpot = (x, z) => { const r = nearestRiver(x, z); return r && r.d < 60 ? r : null; };
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
/** A point of water to put a frog's call by, or null: a bank spot of the Huan within `reach` of (x, z). */
export function pondSpot(x, z, rnd, reach = 40) {
  const r = nearestRiver(x, z);
  if (!r || r.d > reach) return null;
  const a = rnd() * Math.PI * 2, q = [r.p[0] + Math.cos(a) * 6, r.p[1] + Math.sin(a) * 6];
  return bank(q[0], q[1]) > -1 ? q : r.p;
}
/** A point on the shore where the water laps, near the listener (within 40 m of the water), or null. */
export const shoreSpot = (x, z, rnd) => { const r = nearestRiver(x, z); return r && r.d < 40 ? [r.p[0] + (rnd() - 0.5) * 14, r.p[1] + (rnd() - 0.5) * 14] : null; };
export const bambooNear = () => 0;
export const lotusNear = () => 0;
/** 0…1: how froggy the ground is: the Huan's banks, the moat's edge (the ditch holds rain), a little elsewhere. */
export const frogGround = (x, z) => (bank(x, z) < 12 ? 0.9 : inMoat(x, z, 6) ? 0.4 : 0.05);

// ── the emitters in the open ─────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const hallFront = [AXIS, HALL.plat[3] + 6];                       // the foot of the hall's stair, where the bells, the chime and the drum stand (the rites are held before it)
const courtMid = [AXIS, -50];
const braziers = [0, 1, 2, 3].map((k) => [4 + k * 10.5, -30.9]);       // the diviners' fires (court.js)
const [sx0, sz0, sx1] = ARCHIVE.shed;
const benches = [0, 1, 2].map((i) => [sx0 + 3 + i * 9, sz0 + 3.5]);   // the shed's benches (ritual.js)
const pits = [[-96, 157], [-100, 160]];
export const EMITTERS = [
  // the rites before the kings' hall by day (dawn, and toward evening): the nao bells and the stone chime, the drum of the crocodile skin, the ocarina at dusk
  E('shangNao', hallFront, 44, [60, 140], [6, 9.5], { rainMax: 0.6, after: true }), E('shangNao', hallFront, 44, [90, 200], [16, 18.5], { rainMax: 0.6, after: true }),
  E('shangChime', [hallFront[0] + 5, hallFront[1]], 36, [45, 110], [6, 10], { rainMax: 0.6, after: true }), E('shangChime', [hallFront[0] + 5, hallFront[1]], 36, [60, 140], [16, 18.5], { rainMax: 0.6, after: true }),
  E('shangDrum', courtMid, 70, [150, 320], [6, 8.5], { rainMax: 0.7, after: true }), E('shangDrum', courtMid, 70, [150, 320], [16, 18], { rainMax: 0.7, after: true }),
  E('shangXun', [hallFront[0] - 6, hallFront[1] - 2], 30, [100, 220], [17, 19.5], { rainMax: 0.4, after: true }),
  // the diviners at their braziers: the shells cracking
  ...braziers.map(([x, z]) => E('shangCrack', [x, z], 14, [26, 60], [7, 16], { rainMax: 0.5 })),
  E('shangMurmur', [AXIS, -62], 22, [24, 60], [6.5, 17], { rainMax: 0.5 }),
  // chariots in the court
  E('shangChariot', [0.5, 14], 36, [150, 330], [7, 16], { dry: true }), E('shangChariot', [40, 18], 36, [180, 360], [7, 16], { dry: true }),
  // the oracle-bone shed: sawing, drilling, a fire with a shell on it
  ...benches.map(([x, z], i) => E(i === 1 ? 'shangDrill' : 'shangSaw', [x, z], 10, [14, 34], [7, 16.5], { rainMax: 0.7 })),
  E('shangCrack', [sx0 + 6, ARCHIVE.shed[3] - 3.4], 12, [22, 55], [7, 16], { rainMax: 0.7 }),
  // the foundry: the four furnaces' bellows by day and, less often, through the night (the casting went on), the pour, the fettling, the master's call
  ...FURNACES.map(([x, z], i) => E('shangBellows', [x, z + 1.2], 22, [14 + i, 30 + i * 3], [5.5, 19.5], { rainMax: 0.9 })),
  E('shangBellows', [FURNACES[1][0], FURNACES[1][1] + 1.2], 26, [40, 90], [19.5, 5.5], { rainMax: 0.9 }), E('shangBellows', [FURNACES[2][0], FURNACES[2][1] + 1.2], 26, [50, 110], [19.5, 5.5], { rainMax: 0.9 }),
  E('shangPour', [-88, 132], 34, [260, 520], [8, 16.5], { rainMax: 0.5 }), E('shangPour', [-88, 132], 40, [420, 800], [20, 3], { rainMax: 0.6 }),
  ...[[-120, 160], [-111, 160], [-102, 160]].map(([x, z]) => E('shangFettle', [x + 1.5, z + 0.5], 12, [18, 44], [7, 17], { rainMax: 0.6 })),
  E('hammer', [-60, 105], 14, [26, 60], [7, 17], { rainMax: 0.7 }),
  E('shangCall', [-90, 122], 40, [70, 160], [6, 18], { rainMax: 0.6 }),
  // the washing at the Huan's landings
  ...landings().filter((_, i) => i % 2 === 0).map((g) => E('shangWash', g.a, 12, [26, 70], [6.5, 16.5], { dry: true })),
  // the night: owls on the halls' thatch and over the fields, a dog's bark from the quarters is the engine's
  E('owl', [AXIS - 20, -92], 60, [40, 100], [20.5, 4.5], { rainMax: 0.4 }), E('owl', [150, 60], 60, [60, 140], [21, 4], { rainMax: 0.4 }), E('owl', [-150, 20], 60, [60, 140], [21, 4], { rainMax: 0.4 }),
];
void pits; void sm;
