// Where Chichén Itzá's sounds are (docs/settlements/chichen-itza.md §19.3): the places of its emitters and the geometry the audio engine needs to put each sound where it
// is made — the shell trumpets, the slit drum and the turtle-shell drum of the temples at the hours of the rites, the rattles of the priests, the clay flute and bird whistles
// and the sellers' cries of the markets, the masons renewing the Castillo's plaster, the chirped echo of a clap at the foot of the Castillo's stair, the ball game's bounces and
// the long echo of the court, the drops of the Sacred Cenote, the sweat bath's hiss, the turkeys of the yards, the households' metates, tortillas and looms, the owls and motmots
// of the forest, and the rooms one can be inside. Pure data and functions of layout.js (no three.js), read by src/engine/soundscape.js (the profile's `LIFE.map`) and played by
// src/engine/voices.js (the voices of src/engine/voices-chichen-itza.js). Coordinates: metres, +x east, +z south, the settlement's frame.
//
// What the scheduler asks of a map but Chichén has not (no canals, ponds, bridges or street walkers) is answered with nothing.
import '../../engine/voices-chichen-itza.js';
import { RADIUS, PLAZA, CENOTE, SWEATBATH, CEIBAS, lots, inRect, cenoteDist } from './layout.js';
import { ground } from './ground.js';

/** Where the audio puts the listener when the engine gives none (the arrival on the plaza). */
export const HOME = [0, 62];

/** A deterministic 0…1 from numbers (no Math.random here). */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 61.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The markets (town.js): the rows of sellers' mats [x0, z0, x1, z1] — the great one by the Thousand Columns, the one east of the arrival, the one west. */
export const MARKETS = [[94, 54, 152, 78], [48, 52, 82, 63], [-38, 56, -14, 67]];
/** The Castillo's stair foot, where the pilgrims clap (the stair's south foot, 35 m from the middle). */
export const STAIR_FOOT = [0, 38];

/** The work heard from each kind of room: [voice, gap in seconds [min, max], hours [from, to]] [inferred from the household's work]. */
const WORK = {
  home: [['chzMetate', [26, 60], [4.2, 9.5]], ['chzTortilla', [24, 50], [5.5, 9]], ['chzTortilla', [40, 90], [13, 15]], ['chzTortilla', [30, 70], [17.5, 19.5]], ['kitchen', [26, 60], [5.5, 20]]],
  weaver: [['chzWeave', [14, 32], [7, 17.5]]],
  store: [['jarLid', [40, 100], [6.5, 17.5]]],
  range: [['chzWeave', [30, 70], [7, 17.5]], ['clothRustle', [40, 90], [7, 18]]],
};
/** The use a house is put to (house.js variant(): its seed's third draw; the same numbers, read here without building anything). */
function useOf(seed) {
  let s = (((seed || 1) ^ 0x9e3779b1) >>> 0) || 1;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  r(); const F = r(); void F; r(); r(); r(); r(); const pr = r(); if (pr < 0.35) r(); const ln = r(); void ln;
  const w = r();
  return w < 0.55 ? 'home' : w < 0.75 ? 'weaver' : 'store';
}
let SITES = null;
/** The rooms with sounds: { use, rect, at: [x, z] (the middle), id, work, y (the floor) } — every house and long house of the lots, and the temples' chambers. */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  lots().forEach((l, li) => {
    l.houses.forEach((h, hi) => {
      const alongX = h.dir !== 'z', A = (alongX ? h.a : h.b) * 0.68, B = (alongX ? h.b : h.a) * 0.68, r = [h.c[0] - A, h.c[1] - B, h.c[0] + A, h.c[1] + B], use = useOf(h.seed);
      SITES.push({ use, rect: r, at: mid(r), id: `house:${li}:${hi}`, work: WORK[use], y: 0.3 });
    });
    if (l.range) {
      const g = l.range, r = [g.c[0] - g.a + 0.6, g.c[1] - g.b + 0.6, g.c[0] + g.a - 0.6, g.c[1] + g.b - 0.6];
      SITES.push({ use: 'range', rect: r, at: mid(r), id: `range:${li}`, work: WORK.range, y: ground.height(g.c[0], g.c[1]) + 0.9 });
    }
  });
  // the Castillo's temple (13.5 m square, walls 1.2 m: its chamber on the summit, 24.4 m up) and the Warriors' (21 × 18 m, floor 13.4 m)
  SITES.push({ use: 'temple', rect: [-6.1, -6.1, 6.1, 6.1], at: [0, 0], id: 'temple:castillo', work: [['chzRattle', [90, 200], [5.6, 18.5]]], y: 24.4 });
  SITES.push({ use: 'hall', rect: [102.7, -22.4, 121.8, -5.6], at: [112, -14], id: 'temple:warriors', work: [['chzRattle', [90, 200], [5.6, 18.5]]], y: 13.4 });
  return SITES;
}
export const WELLS = [];
export const FAR = {};
export const TEMPLE = {};

// ── the rooms ────────────────────────────────────────────────────────────────
let LGRID = null;
const lotAt = (x, z) => {
  if (!LGRID) { LGRID = new Map(); for (const s of sites()) for (let i = Math.floor(s.rect[0] / 20); i <= Math.floor(s.rect[2] / 20); i++) for (let j = Math.floor(s.rect[1] / 20); j <= Math.floor(s.rect[3] / 20); j++) { const k = i + ',' + j; if (!LGRID.has(k)) LGRID.set(k, []); LGRID.get(k).push(s); } }
  return LGRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || [];
};
/** The room the listener is in, from its place: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  for (const s of lotAt(x, z)) if (inRect(s.rect, x, z) && y > s.y - 0.9 && y < s.y + 3.4) return { use: s.use, at: s.at, upper: false, same: s.id };
  return null;
}
/** What each kind of room sounds like inside: `tone` its hush (a lowpass in Hz and a level), `roof` the rain's loudness from inside (thatch is soft, the long houses' flat roof of plaster hard), `hush` how much of the outdoors comes through, `work` [voice, gap s]. */
export const ROOMS = {
  home: { tone: [300, 0.3], roof: 0.55, hush: 0.7, work: [['chzMetate', 70], ['kitchen', 40]] },
  weaver: { tone: [300, 0.28], roof: 0.55, hush: 0.7, work: [['chzWeave', 16]] },
  store: { tone: [260, 0.25], roof: 0.55, hush: 0.7, work: [['jarLid', 60]] },
  range: { tone: [240, 0.22], roof: 0.9, hush: 0.6, work: [['clothRustle', 50]] },
  temple: { tone: [150, 0.3], roof: 0.7, hush: 0.45, work: [['chzRattle', 100]] },
  hall: { tone: [190, 0.28], roof: 0.7, hush: 0.55, work: [['clothRustle', 90]] },
};
export const UPPER = { tone: [230, 0.12], roof: 1.2, hush: 0.6, work: [['clothRustle', 40]] };

// ── the planting, the town ──────────────────────────────────────────────────
/** 0…1: how much green round (x, z): the dry forest between and beyond the lots, a little at the ceibas, none on the plaza's plaster. */
export function greenNear(x, z) {
  const forest = sm(120, RADIUS - 40, Math.hypot(x, z)) * 0.8, ceiba = CEIBAS.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 30) ? 0.5 : 0;
  return Math.max(inRect(PLAZA, x, z) ? 0.08 : 0.3, forest, ceiba);
}
export const leafNear = (x, z) => Math.min(1, greenNear(x, z) * 0.85);
/** A tree to put a cicada or a bird in, near (x, z), or null: a ceiba, or a tree of the dry forest between the lots, off the plaza. */
export function treeSpot(x, z, rnd, reach = 40) {
  for (let k = 0; k < 12; k++) {
    const a = rnd() * Math.PI * 2, d = 4 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    if (Math.hypot(px, pz) > RADIUS - 8 || inRect(PLAZA, px, pz, 4) || cenoteDist(px, pz) < 3) continue;
    if (CEIBAS.some(([cx, cz]) => Math.hypot(cx - px, cz - pz) < 6) || hash(Math.floor(px / 14), Math.floor(pz / 14)) < 0.18) return [px, pz];
  }
  return null;
}
/** 0…1: how much of the markets' murmur reaches (x, z): full among the sellers' mats, strong on the plaza, a third in the lots near it, little at the rim. */
export function townNear(x, z) {
  if (MARKETS.some((m) => inRect(m, x, z, 6))) return 1;
  if (inRect(PLAZA, x, z)) return 0.55;
  return Math.max(0.1, 0.4 * (1 - sm(20, RADIUS - 40, Math.hypot(Math.max(PLAZA[0] - x, 0, x - PLAZA[2]), Math.max(PLAZA[1] - z, 0, z - PLAZA[3])))));
}
// what Chichén has none of (the engine's scheduler asks, and is answered with nothing): no canals, no ponds, no bridges, no bamboo, no lotus; frogs only at the cenote's rim
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const streetTrack = () => null;
export const pondSpot = () => null;
export const shoreSpot = () => null;
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const frogGround = (x, z) => (cenoteDist(x, z) < 14 ? 0.8 : 0.08);
export const TRACKS = [];

// ── the emitters in the open ─────────────────────────────────────────────────
/** Fixed emitters: { voice, at, r50 (m: the distance at which it is half as loud), gap [min, max] s, hours [from, to] }, with `dry`, `rainMax`, `after`, `lv`. */
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const SUMMIT = [0, 8], WAR = [118, -14], BALL = [-115, -37], CEN_RIM = [CENOTE.c[0], CENOTE.c[1] + CENOTE.r + 2];
const HOURS = [[5.5, 6.8], [11.6, 12.6], [17.3, 18.6]];       // dawn, noon and dusk: the rites, when the sun is on the Castillo's face [inferred: the hours]
const SELLERS = [...[[100, 58], [116, 62], [132, 58], [146, 70], [104, 72], [124, 74]], ...[[56, 56], [70, 60], [80, 55]], ...[[-32, 60], [-22, 64], [-16, 58]]];
export const EMITTERS = [
  // the rites: the shell trumpets from the Castillo's summit and the Warriors' temple, the slit drum and the turtle-shell drum with them, at dawn, noon and dusk
  ...HOURS.flatMap(([a, b], i) => [
    E('chzConch', SUMMIT, 130, [80, 190], [a, b], { after: true, rainMax: 0.9 }),
    E('chzConch', WAR, 100, [110, 240], [a, b], { after: true, rainMax: 0.9, lv: 0.9 }),
    E('chzTunkul', [0, 38], 70, [70, 160], [a, b], { after: true, rainMax: 0.8, lv: i === 1 ? 0.8 : 1 }),
    E('chzAyotl', [112, 8], 60, [90, 200], [a, b], { after: true, rainMax: 0.8 }),
  ]),
  // the priests' rattles on the summit and at the cenote's rim in the morning
  E('chzRattle', SUMMIT, 35, [50, 120], [5.6, 9], { after: true, rainMax: 0.5 }), E('chzRattle', [-5.6, CENOTE.c[1] + CENOTE.r + 1], 28, [60, 140], [5.8, 9.5], { after: true, rainMax: 0.5 }),
  // the clap at the stair's foot and the stair's chirped echo (measured at El Castillo: Declercq et al. 2004), the pilgrims clapping as they come, by day
  E('chzStairChirp', STAIR_FOOT, 34, [40, 110], [7, 17.8], { rainMax: 0.4 }),
  // the ball game in the Great Ball Court: the ball's bounces, the hips, the shouts, the court's long echo, by day
  E('chzBall', BALL, 48, [26, 70], [8, 16.5], { rainMax: 0.3 }),
  // the markets: the flute and the whistles, the sellers' cries (wordless; the engine's hubbub is under them), by day
  E('chzFlute', [130, 66], 30, [60, 150], [8.4, 16], { after: true, rainMax: 0.3 }), E('chzWhistle', [62, 58], 18, [50, 130], [7.5, 17], { rainMax: 0.3 }), E('chzWhistle', [-24, 62], 18, [60, 140], [7.5, 17], { rainMax: 0.3 }),
  ...SELLERS.map((at, i) => E('chzCry', at, 15, [20 + (i % 4) * 4, 60 + (i % 5) * 7], [6.2, 16.5], { rainMax: 0.5 })),
  // the masons dressing blocks at the stair's foot and the women at the lime pits (town.js: worksite), by day
  E('chzPlaster', [-20, 46], 16, [16, 40], [7, 16.5], { rainMax: 0.1 }), E('chzPlaster', [17, 46], 16, [20, 46], [7, 16.5], { rainMax: 0.1 }),
  // the sweepers on the plaza at dawn
  E('broom', [-30, 80], 16, [40, 100], [4.8, 6.8], { dry: true }), E('broom', [30, 76], 16, [50, 110], [4.8, 6.8], { dry: true }),
  // the turkeys of the yards, the ceibas' rest places
  ...CEIBAS.slice(0, 5).map(([cx, cz], i) => E('chzTurkey', [cx + 3.2, cz - 3.4], 12, [30 + i * 5, 90 + i * 7], [5.5, 18.5], { rainMax: 0.6 })),
  ...[[-20, 134], [40, 134], [70, 134], [-60, 150], [100, 150]].map((at, i) => E('chzTurkey', at, 12, [34 + i * 6, 96 + i * 8], [5.5, 18.5], { rainMax: 0.6 })),
  // the sweat bath's firebox: water on the hot stones in the late afternoon
  E('chzHiss', [SWEATBATH.at[0], SWEATBATH.at[1] + 2], 14, [70, 160], [14.5, 18.5], { rainMax: 0.3 }),
  // the Sacred Cenote: drops falling 20 m into the water, with the walls' echo, all day and night
  E('chzDrip', CEN_RIM, 30, [6, 16], [0, 24], { rainMax: 1 }),
  // the owls of the forest at night, the motmots at its edge at dawn and dusk
  E('chzOwl', [-250, -60], 60, [40, 110], [20, 4.5], { rainMax: 0.5 }), E('chzOwl', [190, 100], 60, [50, 130], [20.5, 4], { rainMax: 0.5 }), E('chzOwl', [0, -285], 50, [60, 150], [21, 3.5], { rainMax: 0.4 }),
  E('chzMotmot', [150, 210], 50, [50, 130], [5.2, 7.4], { rainMax: 0.4 }), E('chzMotmot', [-170, -150], 50, [60, 140], [5.2, 7.4], { rainMax: 0.4 }),
  E('chzMotmot', [150, 210], 50, [60, 150], [17.3, 19.3], { rainMax: 0.4 }),
];
